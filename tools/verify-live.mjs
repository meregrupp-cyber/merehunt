#!/usr/bin/env node
// Kontrollib live-saidi HTTPS-tarnet pärast deploy’d (docs/release-checklist.md "Live kontroll").
//
//   node tools/verify-live.mjs
//   node tools/verify-live.mjs --base=https://merehunt.ee

import { BASE } from '../content/site.mjs';

const baseArg = process.argv.slice(2).find((arg) => arg.startsWith('--base='));
const base = baseArg ? baseArg.slice('--base='.length).replace(/\/$/, '') : BASE;
const host = new URL(base).hostname;

const REQUIRED_HEADERS = [
  'content-security-policy',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'x-frame-options',
];

const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`✓ ${name}`);
    return;
  }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function head(url) {
  try {
    return await fetch(url, { method: 'GET', redirect: 'manual', headers: { 'User-Agent': 'merehunt-release-check' } });
  } catch (error) {
    failures.push(`${url} — päring ebaõnnestus: ${error.message}`);
    console.log(`✗ ${url} — päring ebaõnnestus: ${error.message}`);
    return { status: 0, headers: new Headers() };
  }
}

const home = await head(`${base}/`);
check('apex HTTPS vastab 200', home.status === 200, `status ${home.status}`);

const hsts = home.headers.get('strict-transport-security') ?? '';
const maxAge = Number(/max-age=(\d+)/i.exec(hsts)?.[1] ?? 0);
check('HSTS on vähemalt üks aasta', maxAge >= 31536000, hsts || 'päis puudub');
check('HSTS katab alamdomeenid', /includesubdomains/i.test(hsts), hsts || 'päis puudub');

for (const header of REQUIRED_HEADERS) {
  check(`päis ${header}`, home.headers.has(header), 'puudub');
}

const insecure = await head(`http://${host}/`);
const insecureLocation = insecure.headers.get('location') ?? '';
check('HTTP suundub HTTPS-ile', insecure.status >= 300 && insecure.status < 400 && insecureLocation.startsWith('https://'),
  `status ${insecure.status}, location ${insecureLocation || 'puudub'}`);

const www = await head(`https://www.${host}/rummu/?source=test`);
check('www suundub apexile ja säilitab path’i ja query',
  www.status === 308 && www.headers.get('location') === `https://${host}/rummu/?source=test`,
  `status ${www.status}, location ${www.headers.get('location') ?? 'puudub'}`);

const legacy = await head(`${base}/forum/forums.php?forum=4`);
check('/forum/* suundub 301-ga /merehunt/ lehele',
  legacy.status === 301 && legacy.headers.get('location') === `https://${host}/merehunt/`,
  `status ${legacy.status}, location ${legacy.headers.get('location') ?? 'puudub'}`);

for (const path of ['/robots.txt', '/sitemap.xml', '/kurs-fridajvinga/', '/rummu/', '/poezdka-v-estoniyu/', '/merehunt/']) {
  const response = await head(`${base}${path}`);
  check(`${path} vastab 200`, response.status === 200, `status ${response.status}`);
}

const missing = await head(`${base}/see-peab-olema-404/`);
check('tundmatu URL vastab 404', missing.status === 404, `status ${missing.status}`);

console.log('');

if (failures.length > 0) {
  console.error(`✗ ${failures.length} kontrolli ebaõnnestus:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('✓ Live HTTPS-tarne on korras.');
