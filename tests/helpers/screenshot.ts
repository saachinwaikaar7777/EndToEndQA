import { Page, TestInfo } from '@playwright/test';
import * as fs   from 'fs';
import * as path from 'path';

/**
 * Maps a Playwright project name to the timestamped browser folder.
 *   "Google Chrome"   → chrome_HHMMSS
 *   "firefox"         → firefox_HHMMSS
 *   "Microsoft Edge"  → edge_HHMMSS
 */
function getBrowserFolder(projectName: string, runTime: string): string {
  const n = projectName.toLowerCase();
  if (n.includes('chrome'))  return `chrome_${runTime}`;
  if (n.includes('firefox')) return `firefox_${runTime}`;
  if (n.includes('edge'))    return `edge_${runTime}`;
  return `${n.replace(/\s+/g, '-')}_${runTime}`;
}

/**
 * Takes a screenshot, saves it into:
 *   test-results/QARUN_HHMMSS/<browser>_HHMMSS/<safeName>.png
 * AND attaches it to the Playwright HTML report.
 *
 * @param page      - Playwright page object
 * @param testInfo  - TestInfo fixture (provides project name for browser folder)
 * @param stepName  - Human-readable label used as file name and report attachment label
 */
export async function snap(
  page:     Page,
  testInfo: TestInfo,
  stepName: string,
): Promise<void> {
  const runId   = process.env.PLAYWRIGHT_RUN_ID   ?? 'QARUN_000000';
  const runTime = process.env.PLAYWRIGHT_RUN_TIME ?? '000000';

  const browserFolder = getBrowserFolder(testInfo.project.name, runTime);
  const dir           = path.join(process.cwd(), 'test-results', runId, browserFolder);
  fs.mkdirSync(dir, { recursive: true });

  // Sanitise step name for use as a file name
  const safeName   = stepName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  const filePath   = path.join(dir, `${safeName}.png`);

  const buffer = await page.screenshot({ path: filePath, fullPage: false });

  // Attach to the HTML report so screenshots appear inline
  await testInfo.attach(stepName, { body: buffer, contentType: 'image/png' });
}
