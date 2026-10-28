import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadScript, bootPanel, waitFor, flush } from './harness.mjs';

const MESSAGE_SOURCE = 'chatgpt-sidebar';

// 測試失敗時也要清掉假 iframe 的輪詢，否則 node 行程不會結束。
const cleanups = [];
afterEach(() => {
  while (cleanups.length) cleanups.pop()();
});

test('renderTemplate：頁面或選取文字裡的 {{placeholder}} 不會被二次展開', () => {
  const { exports } = loadScript('panel.js', ['renderTemplate'], {
    document: { addEventListener() {} }
  });
  const out = exports.renderTemplate('T:{{title}}|S:{{selection}}|C:{{content}}', {
    url: 'u',
    title: 'literal {{selection}}',
    selection: 'quote {{content}} end',
    content: 'BODY $& $1'
  });
  assert.equal(out, 'T:literal {{selection}}|S:quote {{content}} end|C:BODY $& $1');
});

test('renderTemplate：選取文字含 {{content}} 時，翻譯提示詞不會夾帶整頁內文', () => {
  const { exports } = loadScript('panel.js', ['renderTemplate', 'DEFAULT_TEMPLATES'], {
    document: { addEventListener() {} }
  });
  const out = exports.renderTemplate(exports.DEFAULT_TEMPLATES.translate, {
    url: 'https://example.com/',
    title: 't',
    selection: 'the {{content}} placeholder',
    content: 'PRIVATE-PAGE-BODY'
  });
  assert.ok(out.includes('the {{content}} placeholder'));
  assert.ok(!out.includes('PRIVATE-PAGE-BODY'));
});

test('頁面內文超過 ChatGPT 貼上上限：只截內文，範本指示完整保留', () => {
  const { exports } = loadScript(
    'panel.js',
    ['renderPromptForPaste', 'estimatePasteHtmlLength', 'DEFAULT_TEMPLATES', 'PASTE_HTML_MAX'],
    { document: { addEventListener() {} } }
  );
  const { renderPromptForPaste, estimatePasteHtmlLength, DEFAULT_TEMPLATES, PASTE_HTML_MAX } = exports;
  // 10 萬字、短行很多：換成 HTML 後遠超上限
  const content = '短行 & <x>\n'.repeat(10000);
  const { prompt, cut } = renderPromptForPaste(DEFAULT_TEMPLATES.summarize, {
    url: 'https://example.com/a',
    title: 'T',
    content
  });
  assert.equal(cut, true);
  assert.ok(estimatePasteHtmlLength(prompt) <= PASTE_HTML_MAX);
  assert.ok(prompt.includes('3) 提供 3 個對讀者有用的具體建議。'), '內文之後的指示不可被截掉');
  assert.ok(prompt.includes('已截斷'));
});

test('頁面內文在上限內：提示詞不截斷', () => {
  const { exports } = loadScript('panel.js', ['renderPromptForPaste', 'renderTemplate', 'DEFAULT_TEMPLATES'], {
    document: { addEventListener() {} }
  });
  const ctx = { url: 'https://example.com/a', title: 'T', content: '正常長度的內文\n'.repeat(500) };
  const { prompt, cut } = exports.renderPromptForPaste(exports.DEFAULT_TEMPLATES.summarize, ctx);
  assert.equal(cut, false);
  assert.equal(prompt, exports.renderTemplate(exports.DEFAULT_TEMPLATES.summarize, ctx));
});

test('儲存設定失敗（例如超出 sync 配額）：不丟未處理例外、不套用新設定、告知使用者', async () => {
  const panel = await bootPanel({
    syncSet: async () => {
      throw new Error('QUOTA_BYTES_PER_ITEM quota exceeded');
    }
  });
  const { getEl } = panel;
  await getEl('settingsToggleBtn').click();
  assert.ok(getEl('settings').classList.contains('is-open'));

  getEl('originSelect').value = 'https://chat.openai.com';
  getEl('promptTemplate').value = 'x'.repeat(9000);
  await getEl('saveSettingsBtn').click(); // 修前：這裡會 reject

  assert.ok(!/已儲存/.test(getEl('status').textContent), '失敗時不可顯示已儲存');
  assert.match(getEl('status').textContent, /失敗/);
  assert.ok(getEl('settings').classList.contains('is-open'), '設定面板應保持開啟讓使用者重試');
  assert.equal(getEl('noticeOpenLink').href, 'https://chatgpt.com/', '來源不應被切換');
});

/** 模擬 iframe 內的對端：依設定回 pong／寫入結果，並記錄所有送進去的訊息。 */
function startFrameResponder(panel, { pongOrigin, resultOrigin, resultOk = true, resultReason = null }) {
  const seen = new Set();
  const timer = setInterval(() => {
    for (const { data } of panel.frameWindow.posted) {
      if (!data || data.source !== MESSAGE_SOURCE || seen.has(data.requestId)) continue;
      seen.add(data.requestId);
      if (data.action === 'ping' && pongOrigin) {
        panel.dispatchMessage({
          source: panel.frameWindow,
          origin: pongOrigin,
          data: { source: MESSAGE_SOURCE, action: 'pong', requestId: data.requestId }
        });
      }
      if (data.action === 'insert_prompt' && resultOrigin) {
        panel.dispatchMessage({
          source: panel.frameWindow,
          origin: resultOrigin,
          data: { source: MESSAGE_SOURCE, action: 'insert_prompt_result', requestId: data.requestId, ok: resultOk, reason: resultReason }
        });
      }
    }
  }, 2);
  const stop = () => clearInterval(timer);
  cleanups.push(stop);
  return stop;
}

const insertPosts = (panel) => panel.frameWindow.posted.filter((p) => p.data && p.data.action === 'insert_prompt');

test('提示詞只會送給 ChatGPT 來源：targetOrigin 不得是 *', async () => {
  const panel = await bootPanel();
  const stop = startFrameResponder(panel, { pongOrigin: 'https://chatgpt.com', resultOrigin: 'https://chatgpt.com' });
  await panel.actionButtons[0].click();
  await waitFor(() => /已寫入/.test(panel.getEl('status').textContent));
  stop();
  const posts = insertPosts(panel);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].targetOrigin, 'https://chatgpt.com');
});

for (const reason of ['write_failed', 'too_long']) {
  test(`側邊欄輸入框回報 ${reason}：不改寫到其他 ChatGPT 分頁（會蓋掉那邊的草稿），也不顯示已寫入`, async () => {
    let tabWrites = 0;
    const panel = await bootPanel({ sendMessage: async () => { tabWrites++; return { ok: true }; } });
    const stop = startFrameResponder(panel, {
      pongOrigin: 'https://chatgpt.com',
      resultOrigin: 'https://chatgpt.com',
      resultOk: false,
      resultReason: reason
    });
    await panel.actionButtons[0].click();
    await waitFor(() => /失敗|太長/.test(panel.getEl('status').textContent));
    stop();
    assert.equal(tabWrites, 0);
    assert.ok(!/已寫入/.test(panel.getEl('status').textContent));
  });
}

test('選取文字超過貼上上限：翻譯提示詞縮選取文字、不要求使用者改範本', () => {
  const { exports } = loadScript(
    'panel.js',
    ['renderPromptForPaste', 'estimatePasteHtmlLength', 'DEFAULT_TEMPLATES', 'PASTE_HTML_MAX'],
    { document: { addEventListener() {} } }
  );
  const selection = '短\n'.repeat(60000);
  const { prompt, cut } = exports.renderPromptForPaste(exports.DEFAULT_TEMPLATES.translate, {
    url: 'https://example.com/a',
    title: 'T',
    selection,
    content: ''
  });
  assert.equal(cut, true);
  assert.ok(exports.estimatePasteHtmlLength(prompt) <= exports.PASTE_HTML_MAX);
  assert.ok(prompt.startsWith('請把下列選取文字翻譯成流暢的繁體中文'));
});

test('iframe 已被導向 chat.openai.com 時，提示詞改送該來源', async () => {
  const panel = await bootPanel(); // 設定為 chatgpt.com，但 frame 實際在 chat.openai.com
  const stop = startFrameResponder(panel, { pongOrigin: 'https://chat.openai.com', resultOrigin: 'https://chat.openai.com' });
  await panel.actionButtons[0].click();
  await waitFor(() => /已寫入/.test(panel.getEl('status').textContent));
  stop();
  assert.equal(insertPosts(panel)[0].targetOrigin, 'https://chat.openai.com');
});

test('iframe 被導向其他網站時：不外洩頁面內文，也不採信對方的「寫入成功」', async () => {
  const panel = await bootPanel();
  const stop = startFrameResponder(panel, { pongOrigin: 'https://evil.example', resultOrigin: 'https://evil.example' });
  await panel.actionButtons[0].click();
  await waitFor(() => /失敗|逾時|未就緒|發生錯誤/.test(panel.getEl('status').textContent), 4000);
  await flush();
  stop();
  for (const post of insertPosts(panel)) {
    assert.ok(
      post.targetOrigin === 'https://chatgpt.com' || post.targetOrigin === 'https://chat.openai.com',
      `prompt 不可送往 ${post.targetOrigin}`
    );
  }
  assert.ok(!/已寫入/.test(panel.getEl('status').textContent));
});
