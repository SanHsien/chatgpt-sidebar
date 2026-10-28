import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './harness.mjs';

function htmlToText(html) {
  return html
    .split('</p>')
    .filter((chunk, i, all) => i < all.length - 1 || chunk)
    .map((chunk) => chunk.replace(/^<p>/, ''))
    .join('\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * 假的 contenteditable：execCommand('insertText') 與「被處理的 paste」才會真的改內容。
 * pasteMode 模擬 ChatGPT（ProseMirror）實測過的行為：
 * - 'ignored'：沒人 preventDefault，合成事件不會有任何效果
 * - 'inline'：照內容寫進輸入框
 * - 'attach'：preventDefault 了，但把文字轉成附件，輸入框仍空白
 * staleSelection：清空沒生效、paste 接在舊字後面（selectAll 後立刻 paste 的實際情況）
 */
function setup({ pasteMode = 'inline', staleSelection = false, initialText = '' } = {}) {
  const pastes = [];
  const el = {
    tagName: 'DIV',
    isContentEditable: true,
    innerText: initialText,
    disabled: false,
    focus() {},
    getAttribute: () => null,
    getBoundingClientRect: () => ({ width: 10, height: 10 }),
    dispatchEvent(evt) {
      if (evt.type === 'paste') {
        const html = evt.clipboardData.getData('text/html');
        const plain = evt.clipboardData.getData('text/plain');
        pastes.push({ html, plain });
        if (pasteMode === 'ignored') return true;
        if (pasteMode === 'attach') return false;
        const text = html ? htmlToText(html) : plain;
        this.innerText = staleSelection ? this.innerText + text : text;
        return false;
      }
      return true;
    }
  };
  const execCalls = [];
  const document = {
    querySelectorAll: (sel) => (sel === '#prompt-textarea' ? [el] : []),
    execCommand(cmd, _ui, value) {
      execCalls.push(cmd);
      if (cmd === 'delete' && !staleSelection) el.innerText = '';
      if (cmd === 'insertText') el.innerText += value || '';
      return true;
    },
    createRange: () => ({ selectNodeContents() {} })
  };
  let onRuntimeMessage = null;
  const globals = {
    document,
    window: {
      getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }),
      getSelection: () => null,
      addEventListener() {},
      parent: null,
      HTMLTextAreaElement: { prototype: {} }
    },
    chrome: { runtime: { onMessage: { addListener: (fn) => { onRuntimeMessage = fn; } } } },
    DataTransfer: class { constructor() { this.d = {}; } setData(k, v) { this.d[k] = v; } getData(k) { return this.d[k] || ''; } },
    ClipboardEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } },
    Event: class { constructor(type) { this.type = type; } }
  };
  globals.window.parent = globals.window;
  loadScript('content.js', [], globals);
  const insert = (prompt) =>
    new Promise((resolve) => onRuntimeMessage({ action: 'insert_prompt', prompt }, {}, resolve));
  return { el, execCalls, pastes, insert };
}

const LONG = '長文內容 '.repeat(200);

test('長文：合成 paste 沒被編輯器處理時，改用 insertText 真的寫進去（不可假報成功）', async () => {
  const { el, insert } = setup({ pasteMode: 'ignored' });
  const result = await insert(LONG);
  assert.equal(el.innerText, LONG, '輸入框應含完整提示詞');
  assert.equal(result.ok, true);
});

test('長文：paste 已被編輯器處理時，不重複寫入', async () => {
  const { el, execCalls, insert } = setup({ pasteMode: 'inline' });
  const result = await insert(LONG);
  assert.equal(el.innerText, LONG);
  assert.equal(result.ok, true);
  assert.ok(!execCalls.includes('insertText'));
});

test('長文 paste 不放 text/plain：ChatGPT 會把長的純文字 paste 轉成附件、輸入框空白', async () => {
  const { pastes, insert } = setup({ pasteMode: 'inline' });
  await insert(LONG);
  assert.equal(pastes.length, 1);
  assert.equal(pastes[0].plain, '', '不得帶 text/plain');
  assert.ok(pastes[0].html.length > 0);
});

test('長文：換行與 < > & 原樣進輸入框，不會被當成 HTML 解讀', async () => {
  const { el, insert } = setup({ pasteMode: 'inline' });
  const prompt = `${'第一段 <b>不是粗體</b> & 符號\n'.repeat(30)}最後一行`;
  const result = await insert(prompt);
  assert.equal(result.ok, true);
  assert.equal(el.innerText, prompt);
});

test('縮排與連續空白：HTML 不含會被瀏覽器壓縮的空白（行首空白、兩個以上相連空白）', async () => {
  const { el, pastes, insert } = setup({ pasteMode: 'inline' });
  const prompt = `def f():\n    return  1\n${'  第二層縮排\n'.repeat(60)}`;
  const result = await insert(prompt);
  assert.equal(result.ok, true);
  assert.equal(el.innerText, prompt);
  const html = pastes[0].html;
  assert.ok(!/<p> /.test(html), '行首空白要轉成 &nbsp;');
  assert.ok(!/ {2}/.test(html), '相連空白要轉成 &nbsp;');
});

test('寫入失敗只試一次：長文 paste 一次 1～2 秒，重試會超過側邊欄等待時間', async () => {
  const { pastes, insert } = setup({ pasteMode: 'attach' });
  await insert(LONG);
  assert.equal(pastes.length, 1);
});

test('編輯器接手 paste 卻把文字轉成附件：輸入框空白時回報失敗，不可顯示已寫入', async () => {
  const { insert } = setup({ pasteMode: 'attach' });
  const result = await insert(LONG);
  assert.equal(result.ok, false);
});

test('舊字沒清掉、新提示詞接在後面：回報失敗，不可當成寫入成功', async () => {
  const { insert } = setup({ pasteMode: 'inline', staleSelection: true, initialText: '上一次的提示詞 '.repeat(100) });
  const result = await insert(LONG);
  assert.equal(result.ok, false);
});

test('框內已有長文時：用 paste 直接取代，不用 execCommand(delete) 清空（ProseMirror 刪長文會卡住整頁）', async () => {
  const { el, execCalls, insert } = setup({ pasteMode: 'inline', initialText: '上一次的提示詞\n'.repeat(5000) });
  const result = await insert(LONG);
  assert.equal(result.ok, true);
  assert.equal(el.innerText, LONG);
  assert.ok(!execCalls.includes('delete'));
});

test('短提示詞同樣寫進輸入框並讀回確認', async () => {
  const { el, insert } = setup({ pasteMode: 'inline', initialText: '舊字' });
  const result = await insert('短提示詞');
  assert.equal(result.ok, true);
  assert.equal(el.innerText, '短提示詞');
});

test('超過 ChatGPT 單次貼上上限：回報 too_long，不送出會被默默丟掉的 paste', async () => {
  const { pastes, insert } = setup({ pasteMode: 'inline' });
  const result = await insert('一'.repeat(96000));
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'too_long');
  assert.equal(pastes.length, 0);
});

test('panel 估的 HTML 長度等於 content.js 實際送出的長度（兩邊上限才對得上）', async () => {
  const { pastes, insert } = setup({ pasteMode: 'inline' });
  const prompt = `標題 & <說明>\n\n${'一行內文 a<b & c>d\n    縮排  兩空白   三空白\n'.repeat(80)} 行首一個空白`;
  await insert(prompt);
  const { exports } = loadScript('panel.js', ['estimatePasteHtmlLength'], {
    document: { addEventListener() {} }
  });
  assert.equal(exports.estimatePasteHtmlLength(prompt), pastes[0].html.length);
});
