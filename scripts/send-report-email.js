#!/usr/bin/env node
/**
 * send-report-email.js
 *
 * Reads email addresses from email_id.md (project root) and sends the
 * latest Allure test report as an email notification with:
 *   • Inline HTML summary (pass/fail/skip counts + duration)
 *   • Allure report ZIP attached
 *
 * Usage:
 *   node scripts/send-report-email.js
 *   npm run report:email
 *
 * Environment variables (required):
 *   SMTP_HOST       – SMTP server       (e.g. smtp.gmail.com)
 *   SMTP_PORT       – SMTP port         (e.g. 587)
 *   SMTP_USER       – sender address
 *   SMTP_PASS       – app password / SMTP password
 *
 * email_id.md format (one per line):
 *   email id= someone@example.com
 *   email id= another@example.com
 */

const fs          = require('fs');
const path        = require('path');
const nodemailer  = require('nodemailer');
const { execSync } = require('child_process');

// ── 1. Parse email_id.md ──────────────────────────────────────────────────────
const emailFile = path.join(process.cwd(), 'email_id.md');

if (!fs.existsSync(emailFile)) {
  console.error('❌  email_id.md not found in project root.');
  console.error('   Create it with one line per recipient:');
  console.error('   email id= user@example.com');
  process.exit(1);
}

const rawLines = fs.readFileSync(emailFile, 'utf-8').split(/\r?\n/);
const recipients = rawLines
  .map(line => {
    const match = line.match(/email\s*id\s*=\s*(.+)/i);
    return match ? match[1].trim() : null;
  })
  .filter(Boolean);

if (recipients.length === 0) {
  console.error('❌  No valid email addresses found in email_id.md');
  console.error('   Expected format:  email id= user@example.com');
  process.exit(1);
}

console.log(`📧  Recipients: ${recipients.join(', ')}`);

// ── 2. Locate latest JSON results for the summary ────────────────────────────
const resultsBase = path.join(process.cwd(), 'test-results');
let summaryHtml = '';
let runLabel    = 'Unknown Run';

if (fs.existsSync(resultsBase)) {
  const runs = fs
    .readdirSync(resultsBase)
    .filter(f => f.startsWith('QARUN_') && fs.statSync(path.join(resultsBase, f)).isDirectory())
    .sort()
    .reverse();

  if (runs.length > 0) {
    runLabel = runs[0];
    const jsonPath = path.join(resultsBase, runs[0], 'results.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const stats = extractStats(data);
        summaryHtml = buildSummaryTable(stats, runLabel);
      } catch (e) {
        console.warn('⚠️  Could not parse results.json:', e.message);
      }
    }
  }
}

if (!summaryHtml) {
  summaryHtml = `<p style="color:#94a3b8">No test results summary available. Please check the attached report.</p>`;
}

// ── 3. Generate Allure report + zip it ────────────────────────────────────────
const allureResultsDir = path.join(process.cwd(), 'allure-results');
const allureReportDir  = path.join(process.cwd(), 'allure-report');
const allureZip        = path.join(process.cwd(), 'allure-report.zip');

let attachments = [];

if (fs.existsSync(allureResultsDir)) {
  try {
    console.log('📊  Generating Allure report...');
    execSync(`npx allure generate "${allureResultsDir}" --clean -o "${allureReportDir}"`, {
      stdio: 'inherit',
    });

    // Create a zip of the report for attachment
    if (fs.existsSync(allureReportDir)) {
      console.log('📦  Compressing Allure report...');
      // Use PowerShell on Windows to zip
      execSync(
        `powershell -Command "Compress-Archive -Path '${allureReportDir}\\*' -DestinationPath '${allureZip}' -Force"`,
        { stdio: 'inherit' }
      );

      if (fs.existsSync(allureZip)) {
        attachments.push({
          filename: `allure-report-${runLabel}.zip`,
          path: allureZip,
        });
        console.log('✅  Allure report zipped for attachment.');
      }
    }
  } catch (e) {
    console.warn('⚠️  Could not generate/zip Allure report:', e.message);
  }
} else {
  console.warn('⚠️  allure-results/ not found. Run tests with Allure reporter first.');
}

// Also attach the latest dashboard HTML if it exists
const dashboardPath = path.join(process.cwd(), 'playwright-report', 'dashboard.html');
if (fs.existsSync(dashboardPath)) {
  attachments.push({
    filename: `qa-dashboard-${runLabel}.html`,
    path: dashboardPath,
  });
}

// ── 4. Send the email ─────────────────────────────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  console.error('');
  console.error('❌  SMTP credentials not configured!');
  console.error('   Set these environment variables before running:');
  console.error('');
  console.error('   $env:SMTP_USER = "your-email@gmail.com"');
  console.error('   $env:SMTP_PASS = "your-app-password"');
  console.error('');
  console.error('   For Gmail, generate an App Password at:');
  console.error('   https://myaccount.google.com/apppasswords');
  console.error('');
  process.exit(1);
}

(async () => {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const mailOptions = {
    from: `"QA Automation" <${SMTP_USER}>`,
    to: recipients.join(', '),
    subject: `🧪 QA Test Report — ${runLabel} | ${new Date().toLocaleDateString('en-IN')}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 640px; margin: 0 auto; padding: 32px; }
          .header { background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 28px 32px; border-radius: 16px 16px 0 0; }
          .header h1 { color: #fff; margin: 0; font-size: 22px; }
          .header p { color: #bfdbfe; margin: 6px 0 0; font-size: 13px; }
          .body-card { background: #1e293b; padding: 28px 32px; border-radius: 0 0 16px 16px; border: 1px solid #334155; border-top: none; }
          .kpi-row { display: flex; gap: 12px; margin: 20px 0; }
          .kpi { flex: 1; text-align: center; background: #0f172a; border-radius: 12px; padding: 16px 8px; border: 1px solid #334155; }
          .kpi .val { font-size: 28px; font-weight: 700; line-height: 1; }
          .kpi .lbl { font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
          .pass { color: #22c55e; }
          .fail { color: #ef4444; }
          .skip { color: #f59e0b; }
          .total { color: #818cf8; }
          .footer { text-align: center; padding: 20px; color: #475569; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { text-align: left; padding: 8px 12px; color: #64748b; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #334155; }
          td { padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 QA Test Report</h1>
            <p>SauceDemo E2E Automation — ${now}</p>
          </div>
          <div class="body-card">
            ${summaryHtml}
            <p style="margin-top:24px;color:#94a3b8;font-size:13px">
              📎 The full <b>Allure Report</b> is attached as a ZIP file.<br/>
              Extract and open <code>index.html</code> in your browser to explore detailed results.
            </p>
          </div>
          <div class="footer">
            Generated by QA Automation Pipeline — ${runLabel}
          </div>
        </div>
      </body>
      </html>
    `,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('');
    console.log('✅  Report email sent successfully!');
    console.log(`   Message ID : ${info.messageId}`);
    console.log(`   Recipients : ${recipients.join(', ')}`);
    console.log(`   Attachments: ${attachments.length} file(s)`);
    console.log('');
  } catch (err) {
    console.error('');
    console.error('❌  Failed to send email:', err.message);
    console.error('');
    process.exit(1);
  }
})();

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractStats(data) {
  const suites = data.suites || [];
  const tests = flattenTests(suites);
  const passed  = tests.filter(t => t.status === 'passed').length;
  const failed  = tests.filter(t => t.status === 'failed').length;
  const skipped = tests.filter(t => t.status === 'skipped').length;
  const total   = tests.length;
  const totalMs = tests.reduce((s, t) => s + t.duration, 0);
  const durStr  = totalMs > 60000
    ? `${(totalMs / 60000).toFixed(1)} min`
    : `${(totalMs / 1000).toFixed(1)} s`;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  // Per-browser counts
  const browsers = {};
  for (const t of tests) {
    if (!browsers[t.project]) browsers[t.project] = { passed: 0, failed: 0, skipped: 0 };
    if (t.status === 'passed') browsers[t.project].passed++;
    else if (t.status === 'failed') browsers[t.project].failed++;
    else browsers[t.project].skipped++;
  }

  return { total, passed, failed, skipped, durStr, passRate, browsers };
}

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
        });
      }
    }
    tests.push(...flattenTests(suite.suites || [], proj));
  }
  return tests;
}

function buildSummaryTable(stats, runLabel) {
  const browserRows = Object.entries(stats.browsers).map(([br, c]) => `
    <tr>
      <td style="font-weight:600">${br}</td>
      <td style="text-align:center" class="pass">${c.passed}</td>
      <td style="text-align:center" class="fail">${c.failed}</td>
      <td style="text-align:center" class="skip">${c.skipped}</td>
    </tr>
  `).join('');

  return `
    <div class="kpi-row">
      <div class="kpi"><div class="val total">${stats.total}</div><div class="lbl">Total</div></div>
      <div class="kpi"><div class="val pass">${stats.passed}</div><div class="lbl">Passed</div></div>
      <div class="kpi"><div class="val fail">${stats.failed}</div><div class="lbl">Failed</div></div>
      <div class="kpi"><div class="val skip">${stats.skipped}</div><div class="lbl">Skipped</div></div>
    </div>
    <div class="kpi-row">
      <div class="kpi"><div class="val pass">${stats.passRate}%</div><div class="lbl">Pass Rate</div></div>
      <div class="kpi"><div class="val total">${stats.durStr}</div><div class="lbl">Duration</div></div>
    </div>

    <h3 style="font-size:14px;color:#94a3b8;margin-top:24px;text-transform:uppercase;letter-spacing:0.5px">By Browser</h3>
    <table>
      <thead><tr><th>Browser</th><th style="text-align:center">✅ Pass</th><th style="text-align:center">❌ Fail</th><th style="text-align:center">⏭ Skip</th></tr></thead>
      <tbody>${browserRows}</tbody>
    </table>
  `;
}
