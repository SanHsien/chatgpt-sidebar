// 測試用：在 vm 內載入 extension 腳本，全部以假物件取代瀏覽器／chrome API，
// 不開視窗、不碰已安裝的擴充功能。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** 讓 vm 內的計時器縮短，測試不必真的等數秒。 */
function fastTimers() {
  return {
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms || 0, 15)),
    clearTimeout,
    setInterval: (fn, ms) => setInterval(fn, Math.min(ms || 0, 15)),
    clearInterval
  };
}

/**
 * 載入腳本；exportNames 內的頂層名稱（含 const／function）會掛到回傳物件。
 * extraGlobals 會蓋掉預設假物件。
 */
export function loadScript(file, exportNames, extraGlobals = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const sandbox = { console, URL, Promise, Date, Math, JSON, Object, Array, String, Set, Map, ...fastTimers(), ...extraGlobals };
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  const exports = exportNames.length
    ? `\n;globalThis.__exports = { ${exportNames.join(', ')} };`
    : '';
  vm.runInContext(source + exports, context, { filename: file });
  return { context, exports: sandbox.__exports };
}

export async function flush(times = 20) {
  for (let i = 0; i < times; i++) await new Promise((r) => setImmediate(r));
}

export async function waitFor(predicate, timeoutMs = 2000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) throw new Error('waitFor 逾時');
    await new Promise((r) => setTimeout(r, 5));
  }
}

/** panel.js 用的最小假 DOM。 */
export class FakeEl {
  constructor(id) {
    this.id = id;
    this.listeners = {};
    this.attrs = {};
    this.classes = new Set();
    this.classList = {
      add: (c) => this.classes.add(c),
      remove: (c) => this.classes.delete(c),
      contains: (c) => this.classes.has(c),
      toggle: (c, force) => {
        const on = force === undefined ? !this.classes.has(c) : Boolean(force);
        if (on) this.classes.add(c); else this.classes.delete(c);
        return on;
      }
    };
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.href = '';
    this.title = '';
    this.dataset = {};
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  async click() { for (const fn of this.listeners.click || []) await fn({ preventDefault() {} }); }
}

/**
 * 載入 panel.js 並觸發 DOMContentLoaded。
 * opts.syncSet：chrome.storage.sync.set 的實作；opts.tabs／pageContext：目前分頁與頁面內容。
 */
export async function bootPanel(opts = {}) {
  const els = new Map();
  const getEl = (id) => {
    if (!els.has(id)) els.set(id, new FakeEl(id));
    return els.get(id);
  };
  const actionButtons = ['summarize', 'translate', 'explain', 'outline'].map((a) => {
    const b = new FakeEl(`btn-${a}`);
    b.dataset.action = a;
    return b;
  });
  let domReady = null;
  const documentStub = {
    addEventListener: (type, fn) => { if (type === 'DOMContentLoaded') domReady = fn; },
    getElementById: getEl,
    querySelectorAll: (sel) => (sel === '.action-btn' ? actionButtons : [])
  };

  const frameWindow = { posted: [], postMessage(data, targetOrigin) { this.posted.push({ data, targetOrigin }); } };
  getEl('chatFrame').contentWindow = frameWindow;

  const winListeners = [];
  const windowStub = {
    addEventListener: (type, fn) => { if (type === 'message') winListeners.push(fn); },
    removeEventListener: (type, fn) => {
      const i = winListeners.indexOf(fn);
      if (type === 'message' && i >= 0) winListeners.splice(i, 1);
    }
  };

  const stored = { ...(opts.stored || {}) };
  const chromeStub = {
    storage: {
      sync: {
        get: async () => ({ ...stored }),
        set: opts.syncSet || (async (items) => { Object.assign(stored, items); })
      }
    },
    tabs: {
      query: async () => opts.tabs || [{ id: 7, active: true, url: 'https://example.com/a', title: 'Example' }],
      create: async () => {}
    },
    scripting: {
      executeScript: async () => [
        { result: opts.pageContext || { url: 'https://example.com/a', title: 'Example', selection: '', content: 'PAGE-BODY' } }
      ]
    },
    runtime: { sendMessage: opts.sendMessage || (async () => ({ ok: false, reason: 'no_tab' })) }
  };

  const { context } = loadScript('panel.js', [], {
    document: documentStub,
    window: windowStub,
    chrome: chromeStub,
    fetch: async () => ({ status: 200, ok: true, json: async () => ({ accessToken: 'x' }) }),
    Date,
    Math
  });
  await domReady();
  await flush();

  const dispatchMessage = (event) => { for (const fn of [...winListeners]) fn(event); };
  return { getEl, actionButtons, frameWindow, dispatchMessage, stored, context };
}
