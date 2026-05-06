#!/usr/bin/env node
/**
 * show-latest-report.js
 * Finds the most-recently created playwright-report/<date-time> folder
 * and opens it with `playwright show-report`.
 */
const fs      = require('fs');
const path    = require('path');
const { execSync } = require('child_process');

const reportBase = path.join(process.cwd(), 'playwright-report');

if (!fs.existsSync(reportBase)) {
  console.error('❌  playwright-report/ directory not found. Run `npm test` first.');
  process.exit(1);
}

const runs = fs
  .readdirSync(reportBase)
  .filter(f => fs.statSync(path.join(reportBase, f)).isDirectory())
  .sort()   // ISO date prefix → lexicographic = chronological
  .reverse();

if (runs.length === 0) {
  console.error('❌  No report folders found inside playwright-report/.');
  process.exit(1);
}

const latest = runs[0];
console.log(`\n🌐  Opening latest report: playwright-report/${latest}\n`);
execSync(`npx playwright show-report "playwright-report/${latest}"`, { stdio: 'inherit' });
