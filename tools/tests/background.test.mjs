import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './harness.mjs';

const noop = () => {};
const chromeStub = {
  sidePanel: { setPanelBehavior: async () => {} },
  declarativeNetRequest: { updateDynamicRules: async () => {} },
  runtime: { onInstalled: { addListener: noop }, onMessage: { addListener: noop } }
};

/** 依 Chrome DNR 文件的 urlFilter 語法（| || * ^）轉成 RegExp，僅供測試。 */
function urlFilterToRegExp(filter) {
  let rest = filter;
  let prefix = '';
  let suffix = '';
  if (rest.startsWith('||')) { prefix = '^[a-z][a-z0-9+.-]*://([^/?#]*\\.)?'; rest = rest.slice(2); }
  else if (rest.startsWith('|')) { prefix = '^'; rest = rest.slice(1); }
  if (rest.endsWith('|')) { suffix = '$'; rest = rest.slice(0, -1); }
  const body = rest
    .replace(/[.+?${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\^/g, '([^a-z0-9_.%-]|$)');
  return new RegExp(prefix + body + suffix, 'i');
}

function ruleMatches(rule, url) {
  const c = rule.condition;
  if (c.regexFilter) return new RegExp(c.regexFilter, 'i').test(url);
  if (!urlFilterToRegExp(c.urlFilter).test(url)) return false;
  if (c.requestDomains) {
    const host = new URL(url).hostname;
    return c.requestDomains.some((d) => host === d || host.endsWith(`.${d}`));
  }
  return true;
}

const { exports } = loadScript('background.js', ['DNR_RULES'], { chrome: chromeStub });
const rules = exports.DNR_RULES;

test('CSP／XFO 移除規則會命中 ChatGPT 本身的頁面與子框架', () => {
  const urls = ['https://chatgpt.com/chat', 'https://chatgpt.com/', 'https://chat.openai.com/chat'];
  for (const url of urls) {
    assert.ok(rules.some((r) => ruleMatches(r, url)), `應命中 ${url}`);
  }
});

test('CSP／XFO 移除規則不得命中「網址裡只是夾帶 chatgpt.com 字串」的其他網站', () => {
  const foreign = [
    'https://bank.example/login?next=https://chatgpt.com/',
    'https://bank.example/login#https://chat.openai.com/x',
    'https://bank.example/https://chatgpt.com/chat',
    'https://evilchatgpt.com/chat',
    'https://chatgpt.com.evil.example/chat'
  ];
  for (const url of foreign) {
    assert.ok(!rules.some((r) => ruleMatches(r, url)), `不應命中 ${url}`);
  }
});
