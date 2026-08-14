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
  const tests = deployWorkflow.indexOf('- run: npm test');
  const dryRun = deployWorkflow.indexOf('name: Dry run');
  const deploy = deployWorkflow.indexOf('name: Deploy preview');
  assert.ok(tests > 0 && dryRun > tests && deploy > dryRun, 'deploy must follow npm test and a dry run');
});

test('deploy workflow reads Cloudflare credentials from secrets only', () => {
  assert.match(deployWorkflow, /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(deployWorkflow, /CLOUDFLARE_ACCOUNT_ID: \$\{\{ secrets\.CLOUDFLARE_ACCOUNT_ID \}\}/);
  assert.doesNotMatch(deployWorkflow, /[A-Za-z0-9_-]{40,}/, 'workflow must not contain a literal token');
});

test('deploy targets production by default and keeps preview available', () => {
  assert.match(deployWorkflow, /default: production/);
  assert.match(deployWorkflow, /PHASE: \$\{\{ github\.event\.inputs\.phase \|\| vars\.DEPLOY_PHASE \|\| 'production' \}\}/);
  assert.match(deployWorkflow, /- preview/, 'preview must stay selectable for domain-free test deploys');

  for (const step of ['run: npm run deploy:production\n', 'node tools/cloudflare-https.mjs', 'node tools/verify-live.mjs\n']) {
    const index = deployWorkflow.indexOf(step);
    assert.ok(index > 0, `missing step: ${step}`);
    const guard = deployWorkflow.lastIndexOf("if: env.PHASE == 'production'", index);
    assert.ok(guard > 0 && index - guard < 200, `${step} must be guarded by the production phase`);
  }
});
