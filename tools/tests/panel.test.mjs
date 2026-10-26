import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript, bootPanel, waitFor, flush } from './harness.mjs';

const MESSAGE_SOURCE = 'chatgpt-sidebar';

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
function startFrameResponder(panel, { pongOrigin, resultOrigin, resultOk = true }) {
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
          data: { source: MESSAGE_SOURCE, action: 'insert_prompt_result', requestId: data.requestId, ok: resultOk, reason: null }
        });
      }
    }
  }, 2);
  return () => clearInterval(timer);
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
