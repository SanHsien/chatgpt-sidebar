import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './harness.mjs';

/** 假的 contenteditable：execCommand('insertText') 與「被處理的 paste」才會真的改內容。 */
function setup({ pasteHandled }) {
  const el = {
    tagName: 'DIV',
    isContentEditable: true,
    innerText: '',
    disabled: false,
    focus() {},
    getAttribute: () => null,
    getBoundingClientRect: () => ({ width: 10, height: 10 }),
    dispatchEvent(evt) {
      if (evt.type === 'paste') {
        if (!pasteHandled) return true; // 沒人 preventDefault：合成事件不會有任何效果
        this.innerText += evt.clipboardData.getData('text/plain');
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
      if (cmd === 'delete') el.innerText = '';
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
    DataTransfer: class { constructor() { this.d = {}; } setData(k, v) { this.d[k] = v; } getData(k) { return this.d[k]; } },
    ClipboardEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } },
    Event: class { constructor(type) { this.type = type; } }
  };
  globals.window.parent = globals.window;
  loadScript('content.js', [], globals);
  const insert = (prompt) =>
    new Promise((resolve) => onRuntimeMessage({ action: 'insert_prompt', prompt }, {}, resolve));
  return { el, execCalls, insert };
}

test('長文：合成 paste 沒被編輯器處理時，改用 insertText 真的寫進去（不可假報成功）', async () => {
  const { el, insert } = setup({ pasteHandled: false });
  const prompt = '長文內容 '.repeat(200);
  const result = await insert(prompt);
  assert.equal(el.innerText, prompt, '輸入框應含完整提示詞');
  assert.equal(result.ok, true);
});

test('長文：paste 已被編輯器處理時，不重複寫入', async () => {
  const { el, execCalls, insert } = setup({ pasteHandled: true });
  const prompt = '長文內容 '.repeat(200);
  const result = await insert(prompt);
  assert.equal(el.innerText, prompt);
  assert.equal(result.ok, true);
  assert.ok(!execCalls.includes('insertText') || el.innerText === prompt);
});
