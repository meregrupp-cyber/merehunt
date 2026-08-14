import assert from 'node:assert/strict';
import test from 'node:test';
import worker, { isLegacyPath, SECURITY_HEADERS } from '../src/worker.mjs';

const env = {
  ASSETS: {
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === '/missing/') return new Response('missing', { status: 404, headers: { 'Content-Type': 'text/html' } });
      return new Response('asset', { status: 200, headers: { 'Content-Type': 'text/html', ETag: 'test-etag' } });
    },
  },
};

test('www and http redirect permanently to canonical https while preserving path and query', async () => {
  const www = await worker.fetch(new Request('https://www.merehunt.ee/rummu/?source=test'), env);
  assert.equal(www.status, 308);
  assert.equal(www.headers.get('location'), 'https://merehunt.ee/rummu/?source=test');

  const http = await worker.fetch(new Request('http://merehunt.ee/kurs-fridajvinga/?a=1'), env);
  assert.equal(http.status, 308);
  assert.equal(http.headers.get('location'), 'https://merehunt.ee/kurs-fridajvinga/?a=1');
});

test('only verified forum paths redirect to the legacy transition page', async () => {
  assert.equal(isLegacyPath('/forum/forums.php'), true);
  assert.equal(isLegacyPath('/forum'), true);
  assert.equal(isLegacyPath('/unknown-old-path'), false);

  const response = await worker.fetch(new Request('https://merehunt.ee/forum/forums.php?forum=4'), env);
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://merehunt.ee/merehunt/');
});

test('asset responses and real 404 statuses are preserved', async () => {
  const ok = await worker.fetch(new Request('https://merehunt.ee/'), env);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('etag'), 'test-etag');

  const missing = await worker.fetch(new Request('https://merehunt.ee/missing/'), env);
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), 'missing');
});

test('security headers are applied to assets, redirects and 404 responses', async () => {
  const responses = [
    await worker.fetch(new Request('https://merehunt.ee/'), env),
    await worker.fetch(new Request('https://www.merehunt.ee/'), env),
    await worker.fetch(new Request('https://merehunt.ee/missing/'), env),
  ];

  for (const response of responses) {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      assert.equal(response.headers.get(name), value, `${name} on ${response.status}`);
    }
  }
});
