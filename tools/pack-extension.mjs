#!/usr/bin/env node
/**
 * 打包可安裝的擴充功能目錄與 zip（供 Load unpacked 或本機解壓安裝）。
 * 用法：node tools/pack-extension.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const version = manifest.version || '0.0.0';
const name = 'chatgpt-sidebar';
const outDir = path.join(root, 'dist', `${name}-${version}`);
const zipPath = path.join(root, 'dist', `${name}-${version}.zip`);

const runtimeFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'panel.html',
  'panel.js',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
];

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyFile(rel) {
  const src = path.join(root, rel);
  const dest = path.join(outDir, rel);
  if (!fs.existsSync(src)) {
    throw new Error(`缺少檔案：${rel}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const validate = spawnSync(process.execPath, [path.join(root, 'tools', 'validate-extension.mjs')], {
  cwd: root,
  encoding: 'utf8',
});
if (validate.status !== 0) {
  console.error(validate.stdout || '');
  console.error(validate.stderr || '');
  process.exit(1);
}

rmrf(path.join(root, 'dist'));
fs.mkdirSync(outDir, { recursive: true });
for (const rel of runtimeFiles) {
  copyFile(rel);
}

rmrf(zipPath);
const zip = spawnSync(
  'zip',
  ['-r', '-q', zipPath, `${name}-${version}`],
  { cwd: path.join(root, 'dist'), encoding: 'utf8' }
);
if (zip.status !== 0) {
  console.error(zip.stderr || zip.stdout || 'zip 失敗');
  process.exit(1);
}

const sha = spawnSync('sha256sum', [zipPath], { encoding: 'utf8' });
const shaLine = (sha.stdout || '').trim();
if (shaLine) {
  fs.writeFileSync(`${zipPath}.sha256`, `${shaLine}\n`);
}

console.log(`已打包：${path.relative(root, outDir)}`);
console.log(`已打包：${path.relative(root, zipPath)}`);
if (shaLine) console.log(shaLine);
