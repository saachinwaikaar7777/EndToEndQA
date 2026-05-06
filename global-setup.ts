import { chromium, FullConfig } from '@playwright/test';
import * as fs   from 'fs';
import * as path from 'path';

/**
 * Global Setup — runs ONCE before the entire test suite.
 *
 * Responsibilities:
 *  1. Create timestamped screenshot directories for chrome / firefox / edge
 *  2. Authenticate with SauceDemo and persist session to auth.json
 *     (all test projects reuse this session via storageState)
 */
async function globalSetup(_config: FullConfig): Promise<void> {
  const runId    = process.env.PLAYWRIGHT_RUN_ID   ?? 'QARUN_000000';
  const runTime  = process.env.PLAYWRIGHT_RUN_TIME  ?? '000000';
  const cwd      = process.cwd();

  // ── 1. Create per-browser screenshot directories ─────────────────────────
  const browsers = ['chrome', 'firefox', 'edge'];
  for (const br of browsers) {
    const dir = path.join(cwd, 'test-results', runId, `${br}_${runTime}`);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  📁 Created: test-results/${runId}/${br}_${runTime}`);
  }

  // ── 2. Authenticate and save storageState ────────────────────────────────
  const browser = await chromium.launch();
  const page    = await browser.newPage();

  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL(/.*inventory/);

  const authPath = path.join(cwd, 'auth.json');
  await page.context().storageState({ path: authPath });
  await browser.close();

  console.log(`\n✅ Global setup complete`);
  console.log(`   Run ID  : ${runId}`);
  console.log(`   Auth    : auth.json saved`);
  console.log(`   Dirs    : test-results/${runId}/ ready\n`);
}

export default globalSetup;
