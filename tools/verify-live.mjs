#!/usr/bin/env node
// Kontrollib live-saidi tarnet pärast GitHub Pages'i deploy'd (docs/release-checklist.md).
//
//   node tools/verify-live.mjs
//   node tools/verify-live.mjs --base=https://merehunt.ee

import { pages } from '../content/pages.mjs';
import { BASE } from '../content/site.mjs';

const baseArg = process.argv.slice(2).find((arg) => arg.startsWith('--base='));
const base = baseArg ? baseArg.slice('--base='.length).replace(/\/$/, '') : BASE;
const host = new URL(base).hostname;

const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`✓ ${name}`);
    return;
  }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

function warn(name, detail) {
  console.log(`! ${name}${detail ? ` — ${detail}` : ''}`);
}

async function get(url, { redirect = 'manual' } = {}) {
  try {
    return await fetch(url, { redirect, headers: { 'User-Agent': 'merehunt-release-check' } });
  } catch (error) {
    failures.push(`${url} — päring ebaõnnestus: ${error.message}`);
    console.log(`✗ ${url} — päring ebaõnnestus: ${error.message}`);
    return { status: 0, headers: new Headers(), text: async () => '' };
  }
}

console.log(`Kontrollitav host: ${host}\n`);

const home = await get(`${base}/`);
check('avaleht vastab 200', home.status === 200, `status ${home.status}`);

const homeHtml = await home.text();
check('CSP meta-tag on vastuses', /<meta http-equiv="Content-Security-Policy"/i.test(homeHtml), 'puudub');

// GitHub Pages saadab HSTS-i ainult *.github.io peal. Custom domain'il seda päist ei tule ka siis,
// kui "Enforce HTTPS" on peal — see seade annab HTTP → HTTPS suunamise, mida kontrollitakse allpool.
const hsts = home.headers.get('strict-transport-security');
if (hsts) warn('HSTS päis on olemas', hsts);

const insecure = await get(`http://${host}/`);
const insecureLocation = insecure.headers.get('location') ?? '';
check('HTTP suundub HTTPS-ile',
  insecure.status >= 300 && insecure.status < 400 && insecureLocation.startsWith('https://'),
  `status ${insecure.status}, location ${insecureLocation || 'puudub'}`);

const www = await get(`https://www.${host}/`);
const wwwLocation = www.headers.get('location') ?? '';
check('www suundub apexile',
  www.status >= 300 && www.status < 400 && wwwLocation.startsWith(`https://${host}`),
  `status ${www.status}, location ${wwwLocation || 'puudub'}`);

const legacy = await get(`${base}/forum/`);
const legacyHtml = legacy.status === 200 ? await legacy.text() : '';
check('/forum/ viib /merehunt/ lehele',
  legacy.status === 200 && /url=\/merehunt\//.test(legacyHtml),
  `status ${legacy.status}`);

for (const path of ['/robots.txt', '/sitemap.xml', ...pages.map((page) => page.path)]) {
  const response = await get(`${base}${path}`);
  check(`${path} vastab 200`, response.status === 200, `status ${response.status}`);
}

const missing = await get(`${base}/see-peab-olema-404/`);
check('tundmatu URL vastab 404', missing.status === 404, `status ${missing.status}`);

console.log('');

if (failures.length > 0) {
  console.error(`✗ ${failures.length} kontrolli ebaõnnestus:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('✓ Live-sait on korras.');
