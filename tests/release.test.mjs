import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { SECURITY_HEADERS } from '../src/worker.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const deployWorkflow = read('.github/workflows/deploy.yml');

test('HSTS is a full year and covers subdomains', () => {
  const hsts = SECURITY_HEADERS['Strict-Transport-Security'];
  const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1] ?? 0);
  assert.ok(maxAge >= 31536000, `max-age is too short: ${hsts}`);
  assert.match(hsts, /includeSubDomains/);
});

test('the content security policy upgrades insecure requests and forbids third-party origins', () => {
  const csp = SECURITY_HEADERS['Content-Security-Policy'];
  assert.match(csp, /upgrade-insecure-requests/);
  assert.match(csp, /default-src 'self'/);
  assert.doesNotMatch(csp, /https?:\/\//);
});

test('deploy workflow tests before deploying and only runs from main', () => {
  assert.match(deployWorkflow, /branches: \[main\]/);
  const steps = deployWorkflow.indexOf('- run: npm test');
  const dryRun = deployWorkflow.indexOf('- run: npm run deploy:dry');
  const deploy = deployWorkflow.indexOf('- run: npm run deploy\n');
  assert.ok(steps > 0 && dryRun > steps && deploy > dryRun, 'deploy must follow npm test and deploy:dry');
});

test('deploy workflow reads Cloudflare credentials from secrets only', () => {
  assert.match(deployWorkflow, /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(deployWorkflow, /CLOUDFLARE_ACCOUNT_ID: \$\{\{ secrets\.CLOUDFLARE_ACCOUNT_ID \}\}/);
  assert.doesNotMatch(deployWorkflow, /[A-Za-z0-9_-]{40,}/, 'workflow must not contain a literal token');
});

test('deploy workflow enables zone HTTPS and verifies the live site', () => {
  assert.match(deployWorkflow, /node tools\/cloudflare-https\.mjs/);
  assert.match(deployWorkflow, /node tools\/verify-live\.mjs/);
});
