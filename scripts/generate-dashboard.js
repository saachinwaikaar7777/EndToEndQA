#!/usr/bin/env node
/**
 * generate-dashboard.js
 *
 * Reads the latest results.json produced by the JSON reporter and generates
 * a self-contained, timestamped HTML dashboard at:
 *   playwright-report/dashboard.html
 *
 * The dashboard shows:
 *   • Run metadata (date, time, duration)
 *   • Pass / Fail / Skip donut chart
 *   • Per-browser breakdown table
 *   • Expandable test result rows with status badges
 *
 * Usage:  node scripts/generate-dashboard.js
 *         npm run report:dashboard
 */

const fs   = require('fs');
const path = require('path');

// ── 1. Find latest results.json ───────────────────────────────────────────────
const resultsBase = path.join(process.cwd(), 'test-results');
if (!fs.existsSync(resultsBase)) {
  console.error('❌  test-results/ not found. Run `npm test` first.');
  process.exit(1);
}

const runs = fs
  .readdirSync(resultsBase)
  .filter(f => f.startsWith('QARUN_') && fs.statSync(path.join(resultsBase, f)).isDirectory())
  .sort()
  .reverse();

if (runs.length === 0) {
  console.error('❌  No QARUN_* directories found inside test-results/.');
  process.exit(1);
}

const latestRun  = runs[0];
const jsonPath   = path.join(resultsBase, latestRun, 'results.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌  results.json not found at: ${jsonPath}`);
  process.exit(1);
}

const data  = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const suites = data.suites || [];

// ── 2. Flatten all tests across suites ───────────────────────────────────────
function flattenTests(suites, project = '') {
  const tests = [];
  for (const suite of suites) {
    const proj = project || suite.project || '';
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const result = test.results?.[0] || {};
        tests.push({
          project : proj || test.projectName || 'unknown',
          title   : `${suite.title} › ${spec.title}`,
          status  : result.status || 'unknown',
          duration: result.duration || 0,
          error   : result.error?.message || '',
        });
      }
    }
    // Recurse into nested suites
    tests.push(...flattenTests(suite.suites || [], proj));
  }
  return tests;
}

const allTests = flattenTests(suites);
const passed   = allTests.filter(t => t.status === 'passed').length;
const failed   = allTests.filter(t => t.status === 'failed').length;
const skipped  = allTests.filter(t => t.status === 'skipped').length;
const total    = allTests.length;

// Per-browser summary
const browsers = {};
for (const t of allTests) {
  if (!browsers[t.project]) browsers[t.project] = { passed: 0, failed: 0, skipped: 0 };
  browsers[t.project][t.status === 'passed' ? 'passed' : t.status === 'failed' ? 'failed' : 'skipped']++;
}

// Duration
const totalMs = allTests.reduce((s, t) => s + t.duration, 0);
const durStr  = totalMs > 60000
  ? `${(totalMs / 60000).toFixed(1)} min`
  : `${(totalMs / 1000).toFixed(1)} s`;

const runDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// ── 3. Build row HTML ─────────────────────────────────────────────────────────
function badge(status) {
  const map = {
    passed : ['#22c55e', '✅ Passed'],
    failed : ['#ef4444', '❌ Failed'],
    skipped: ['#f59e0b', '⏭ Skipped'],
  };
  const [color, label] = map[status] || ['#94a3b8', status];
  return `<span style="background:${color};color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600">${label}</span>`;
}

const rowsHtml = allTests.map((t, i) => `
  <tr onclick="toggle(${i})" style="cursor:pointer;border-bottom:1px solid #1e293b">
    <td style="padding:10px 12px">${badge(t.status)}</td>
    <td style="padding:10px 12px;color:#e2e8f0">${t.title}</td>
    <td style="padding:10px 12px;color:#94a3b8">${t.project}</td>
    <td style="padding:10px 12px;color:#94a3b8;text-align:right">${(t.duration/1000).toFixed(2)}s</td>
  </tr>
  ${t.error ? `<tr id="err-${i}" style="display:none;background:#1e293b">
    <td colspan="4" style="padding:10px 20px;font-family:monospace;color:#f87171;font-size:12px;white-space:pre-wrap">${t.error.replace(/</g,'&lt;')}</td>
  </tr>` : ''}
`).join('');

const browserRows = Object.entries(browsers).map(([br, counts]) => `
  <tr style="border-bottom:1px solid #1e293b">
    <td style="padding:10px 14px;color:#e2e8f0;font-weight:600">${br}</td>
    <td style="padding:10px 14px;color:#22c55e;text-align:center">${counts.passed}</td>
    <td style="padding:10px 14px;color:#ef4444;text-align:center">${counts.failed}</td>
    <td style="padding:10px 14px;color:#f59e0b;text-align:center">${counts.skipped}</td>
  </tr>
`).join('');

// ── 4. Render HTML ────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>QA Dashboard — ${latestRun}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0f172a;color:#cbd5e1;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh}
    header{background:linear-gradient(135deg,#1e40af,#7c3aed);padding:28px 40px;display:flex;justify-content:space-between;align-items:center}
    header h1{font-size:1.6rem;color:#fff;letter-spacing:-0.5px}
    header p{color:#bfdbfe;font-size:0.85rem;margin-top:4px}
    .badge-run{background:rgba(255,255,255,.15);color:#fff;padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;white-space:nowrap}
    main{padding:32px 40px;max-width:1400px;margin:0 auto}
    .kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:32px}
    .kpi{background:#1e293b;border-radius:14px;padding:22px 20px;text-align:center;border:1px solid #334155}
    .kpi .val{font-size:2.4rem;font-weight:700;line-height:1}
    .kpi .lbl{font-size:0.78rem;color:#64748b;margin-top:6px;text-transform:uppercase;letter-spacing:0.5px}
    .passed .val{color:#22c55e} .failed .val{color:#ef4444} .skipped .val{color:#f59e0b} .total .val{color:#818cf8}
    .panels{display:grid;grid-template-columns:300px 1fr;gap:24px;margin-bottom:32px}
    .card{background:#1e293b;border-radius:14px;padding:24px;border:1px solid #334155}
    .card h2{font-size:0.9rem;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse}
    th{text-align:left;padding:10px 12px;font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #334155}
    tr:hover{background:rgba(255,255,255,.03)}
    .search{width:100%;padding:10px 16px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0;font-size:0.9rem;margin-bottom:16px;outline:none}
    .search:focus{border-color:#6366f1}
    footer{text-align:center;padding:24px;color:#334155;font-size:0.8rem}
  </style>
</head>
<body>
<header>
  <div>
    <h1>🧪 QA Test Dashboard</h1>
    <p>SauceDemo E2E Automation — ${runDate}</p>
  </div>
  <div class="badge-run">${latestRun}</div>
</header>
<main>
  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi total"><div class="val">${total}</div><div class="lbl">Total Tests</div></div>
    <div class="kpi passed"><div class="val">${passed}</div><div class="lbl">Passed</div></div>
    <div class="kpi failed"><div class="val">${failed}</div><div class="lbl">Failed</div></div>
    <div class="kpi skipped"><div class="val">${skipped}</div><div class="lbl">Skipped</div></div>
    <div class="kpi total"><div class="val">${durStr}</div><div class="lbl">Duration</div></div>
    <div class="kpi passed"><div class="val">${total > 0 ? Math.round((passed/total)*100) : 0}%</div><div class="lbl">Pass Rate</div></div>
  </div>

  <div class="panels">
    <!-- Donut Chart -->
    <div class="card">
      <h2>Result Breakdown</h2>
      <canvas id="donut" height="220"></canvas>
    </div>
    <!-- Browser Table -->
    <div class="card">
      <h2>By Browser</h2>
      <table>
        <thead><tr><th>Browser</th><th style="text-align:center">✅ Pass</th><th style="text-align:center">❌ Fail</th><th style="text-align:center">⏭ Skip</th></tr></thead>
        <tbody>${browserRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Test Results Table -->
  <div class="card">
    <h2>All Test Results</h2>
    <input class="search" id="searchInput" type="text" placeholder="🔍  Filter by test name, browser, or status…" oninput="filterRows()"/>
    <table id="resultsTable">
      <thead><tr><th>Status</th><th>Test</th><th>Browser</th><th style="text-align:right">Duration</th></tr></thead>
      <tbody id="tbody">${rowsHtml}</tbody>
    </table>
  </div>
</main>
<footer>Generated by QA Dashboard Generator — ${latestRun}</footer>
<script>
  // Donut chart
  new Chart(document.getElementById('donut'), {
    type: 'doughnut',
    data: {
      labels: ['Passed','Failed','Skipped'],
      datasets:[{ data:[${passed},${failed},${skipped}], backgroundColor:['#22c55e','#ef4444','#f59e0b'], borderWidth:0, hoverOffset:6 }]
    },
    options: { cutout:'70%', plugins:{ legend:{ labels:{ color:'#94a3b8' } } } }
  });

  // Toggle error row
  function toggle(i) {
    const el = document.getElementById('err-' + i);
    if (el) el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
  }

  // Filter table rows
  function filterRows() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('#tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }
</script>
</body>
</html>`;

// ── 5. Write output ───────────────────────────────────────────────────────────
const outDir  = path.join(process.cwd(), 'playwright-report');
const outFile = path.join(outDir, 'dashboard.html');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html, 'utf-8');

console.log(`\n✅  Dashboard generated: playwright-report/dashboard.html`);
console.log(`   Run : ${latestRun}  |  Total: ${total}  |  Passed: ${passed}  |  Failed: ${failed}\n`);

// Auto-open in default browser
const { exec } = require('child_process');
exec(`start "" "${outFile}"`, () => {});   // Windows
