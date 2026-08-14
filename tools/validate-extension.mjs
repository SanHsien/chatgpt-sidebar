#!/usr/bin/env node
/**
 * 驗證 Chrome 擴充功能基本完整性：manifest JSON、必要檔案、icons、JS 語法。
 * 用法：node tools/validate-extension.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function fail(msg) {
  errors.push(msg);
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const manifestPath = path.join(root, 'manifest.json');
if (!exists('manifest.json')) {
  fail('缺少 manifest.json');
} else {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    fail(`manifest.json 不是合法 JSON：${err.message}`);
    manifest = null;
  }

  if (manifest) {
    if (manifest.manifest_version !== 3) {
      fail(`預期 manifest_version 為 3，實際為 ${manifest.manifest_version}`);
    }
    if (!manifest.background?.service_worker) {
      fail('缺少 background.service_worker');
    } else if (!exists(manifest.background.service_worker)) {
      fail(`找不到 service_worker：${manifest.background.service_worker}`);
    }
    if (!manifest.side_panel?.default_path) {
      fail('缺少 side_panel.default_path');
    } else if (!exists(manifest.side_panel.default_path)) {
      fail(`找不到 side panel：${manifest.side_panel.default_path}`);
    }
    for (const [size, iconPath] of Object.entries(manifest.icons || {})) {
      if (!exists(iconPath)) {
        fail(`找不到 icon ${size}：${iconPath}`);
      }
    }
    for (const cs of manifest.content_scripts || []) {
      for (const js of cs.js || []) {
        if (!exists(js)) {
          fail(`找不到 content script：${js}`);
        }
      }
    }
  }
}

const required = [
  'background.js',
  'content.js',
  'panel.html',
  'panel.js',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'README.md',
  'README.en.md',
  'LICENSE',
  'NOTICE.md',
  'AGENTS.md',
  'docs/privacy.html',
  'docs/PRIVACY_POLICY.md',
];

for (const rel of required) {
  if (!exists(rel)) {
    fail(`缺少必要檔案：${rel}`);
  }
}

const jsFiles = ['background.js', 'content.js', 'panel.js'];
for (const rel of jsFiles) {
  if (!exists(rel)) continue;
  const result = spawnSync(process.execPath, ['--check', path.join(root, rel)], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    fail(`${rel} 語法檢查失敗：${(result.stderr || result.stdout || '').trim()}`);
  }
}

if (exists('docs/privacy.html')) {
  const privacy = fs.readFileSync(path.join(root, 'docs/privacy.html'), 'utf8');
  if (!/<!DOCTYPE html>/i.test(privacy)) {
    fail('docs/privacy.html 須為完整 HTML（含 DOCTYPE），供商店爬蟲讀取');
  }
  if (/<script[\s>]/i.test(privacy)) {
    fail('docs/privacy.html 不可含 script，以免商店爬蟲判連結無效');
  }
  if (!/隱私|Privacy Policy/i.test(privacy) || !/收集|collect/i.test(privacy)) {
    fail('docs/privacy.html 須說明資料收集（中或英）');
  }
}

if (errors.length) {
  console.error('validate-extension：失敗\n');
  for (const e of errors) {
    console.error(`- ${e}`);
  }
  process.exit(1);
}

console.log('validate-extension：通過（manifest、必要檔案、JS 語法）');
