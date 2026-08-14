#!/usr/bin/env node
// Lülitab merehunt.ee tsoonis sisse HTTPS-i sundkasutuse ja kontrollib tulemust.
// Nõuab keskkonnamuutujat CLOUDFLARE_API_TOKEN, millel on Zone:Read ja Zone Settings:Edit.
//
//   node tools/cloudflare-https.mjs            # rakendab ja kontrollib
//   node tools/cloudflare-https.mjs --check    # ainult kontroll, ei muuda midagi
//   node tools/cloudflare-https.mjs --dry-run  # näitab, mida muudetaks

import { BASE } from '../content/site.mjs';

const API = 'https://api.cloudflare.com/client/v4';
const ZONE = new URL(BASE).hostname;
const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const dryRun = args.has('--dry-run');

// Iga kirje: seade, soovitud väärtus ja kontroll, kas praegune väärtus on juba nõutav.
const SETTINGS = [
  {
    id: 'ssl',
    value: 'strict',
    label: 'SSL/TLS režiim Full (strict)',
    matches: (current) => current === 'strict',
  },
  {
    id: 'always_use_https',
    value: 'on',
    label: 'Always Use HTTPS',
    matches: (current) => current === 'on',
  },
  {
    id: 'automatic_https_rewrites',
    value: 'on',
    label: 'Automatic HTTPS Rewrites',
    matches: (current) => current === 'on',
  },
  {
    id: 'min_tls_version',
    value: '1.2',
    label: 'Minimaalne TLS-versioon 1.2',
    matches: (current) => current === '1.2' || current === '1.3',
  },
  {
    id: 'tls_1_3',
    value: 'on',
    label: 'TLS 1.3',
    matches: (current) => current === 'on' || current === 'zrt',
  },
  {
    id: 'security_header',
    value: {
      strict_transport_security: {
        enabled: true,
        max_age: 31536000,
        include_subdomains: true,
        nosniff: true,
        preload: false,
      },
    },
    label: 'HSTS 1 aasta koos alamdomeenidega (ilma preload’ita)',
    matches: (current) => {
      const hsts = current?.strict_transport_security;
      return Boolean(hsts?.enabled) && hsts.max_age >= 31536000 && hsts.include_subdomains === true;
    },
  },
];

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function api(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    const detail = body?.errors?.map((error) => `${error.code} ${error.message}`).join('; ')
      || `HTTP ${response.status}`;
    throw new Error(`${init.method ?? 'GET'} ${path}: ${detail}`);
  }

  return body.result;
}

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) fail('CLOUDFLARE_API_TOKEN puudub. Loo token õigustega Zone:Read ja Zone Settings:Edit.');

const zones = await api(`/zones?name=${encodeURIComponent(ZONE)}`);
const zone = zones[0];
if (!zone) fail(`Tsooni ${ZONE} ei leitud. Kontrolli, et domeen on selles Cloudflare’i kontos ja token näeb seda.`);
if (zone.status !== 'active') {
  console.warn(`! Tsoon ${ZONE} on olekus "${zone.status}". Seaded rakenduvad alles pärast nimeserverite aktiveerumist.`);
}

console.log(`Tsoon ${ZONE} (${zone.id}), olek ${zone.status}\n`);

let changed = 0;
let pending = 0;

for (const setting of SETTINGS) {
  const current = await api(`/zones/${zone.id}/settings/${setting.id}`);

  if (setting.matches(current.value)) {
    console.log(`= ${setting.label}: juba korras`);
    continue;
  }

  if (current.editable === false) {
    console.warn(`! ${setting.label}: ei ole selles paketis muudetav (${current.value ? JSON.stringify(current.value) : 'väärtus puudub'})`);
    pending += 1;
    continue;
  }

  if (checkOnly || dryRun) {
    console.log(`~ ${setting.label}: vajaks muutmist (praegu ${JSON.stringify(current.value)})`);
    pending += 1;
    continue;
  }

  const updated = await api(`/zones/${zone.id}/settings/${setting.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ value: setting.value }),
  });

  if (!setting.matches(updated.value)) {
    fail(`${setting.label}: Cloudflare ei kinnitanud soovitud väärtust (${JSON.stringify(updated.value)}).`);
  }

  console.log(`+ ${setting.label}: sisse lülitatud`);
  changed += 1;
}

console.log('');

if (checkOnly || dryRun) {
  if (pending > 0) {
    fail(`${pending} seadet ei ole nõutavas olekus. Käivita "node tools/cloudflare-https.mjs" ilma liputa.`);
  }
  console.log('✓ Kõik HTTPS-seaded on nõutavas olekus.');
} else {
  if (pending > 0) fail(`${pending} seadet jäi rakendamata. Vaata hoiatusi ülal.`);
  console.log(`✓ HTTPS on sisse lülitatud (${changed} muudatust).`);
}
