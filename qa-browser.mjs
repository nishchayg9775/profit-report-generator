import http from 'node:http';
import { createHash } from 'node:crypto';
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const snapshotDir = path.join(rootDir, 'qa-snapshots');
const artifactDir = path.join(rootDir, 'qa-artifacts');
const reportDir = path.join(rootDir, 'qa-results');
const indexPath = path.join(rootDir, 'index.html');

const SAMPLE_INPUT = `*16TH APRIL - 11 PROFITS TILL NOW*

*EQUITIES*(4)
* JMFINANCIL -  3.01% IN 6 DAYS
* HEG - 4.16% IN 1 DAY
* CROMPTON - 2.05% IN 1 DAY
* CESC - 3.65% IN 2 DAYS

*OPTIONS (3)*
* PAYTM- 2.98% in 1 day
* CROMPTON- 11.02% in just 26 mins
* PAYTM - 3.40% in just 46 mins

*FUTURES (4)*
* NATIONALUM - 15750/- PER LOT in 1 day
* MAXHEALTH - 6405/- PER LOT in 1 day
* BDL- 5915/- PER LOT in 1 day
* NATIONALUM - 7500/- PER LOT in just 27 mins

*COMMODITY (1)*
* COPPER26APRFUT - 4.04% in 90 minutes`;

function ensureDir(dir) {
  return fs.mkdir(dir, { recursive: true });
}

async function hashFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

function createStaticServer() {
  const mimeTypes = new Map([
    ['.html', 'text/html; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.mjs', 'text/javascript; charset=utf-8'],
    ['.css', 'text/css; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.png', 'image/png'],
    ['.svg', 'image/svg+xml; charset=utf-8'],
    ['.ico', 'image/x-icon'],
    ['.txt', 'text/plain; charset=utf-8']
  ]);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
        const decodedPath = decodeURIComponent(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);
        const safePath = path.normalize(decodedPath).replace(/^([.]{2}[\\/])+/, '').replace(/^\\+/, '');
        const filePath = path.join(rootDir, safePath);
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        const data = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mimeTypes.get(ext) || 'application/octet-stream' });
        res.end(data);
      } catch (_error) {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}/index.html`
      });
    });
  });
}

function getExecutableCandidates() {
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const localAppData = process.env.LOCALAPPDATA || '';

  return {
    chrome: [
      path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe')
      ].filter(candidate => candidate && existsSync(candidate)),
    edge: [
      path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
    ].filter(candidate => candidate && existsSync(candidate))
  };
}

async function runBrowserMatrix() {
  await ensureDir(snapshotDir);
  await ensureDir(artifactDir);
  await ensureDir(reportDir);

  const { server, baseUrl } = await createStaticServer();
  const executableCandidates = getExecutableCandidates();
  const browsers = [
    {
      name: 'chrome',
      engine: chromium,
      launchOptions: executableCandidates.chrome[0] ? { executablePath: executableCandidates.chrome[0] } : {}
    },
    {
      name: 'edge',
      engine: chromium,
      launchOptions: executableCandidates.edge[0] ? { executablePath: executableCandidates.edge[0] } : {}
    },
    {
      name: 'firefox',
      engine: firefox,
      launchOptions: {}
    },
    {
      name: 'webkit',
      engine: webkit,
      launchOptions: {}
    }
  ];

  const report = [];
  const failures = [];

  try {
    for (const entry of browsers) {
      const result = await runBrowser(entry, baseUrl);
      report.push(result);
      if (!result.passed) failures.push(result);
    }

    await fs.writeFile(path.join(reportDir, 'browser-matrix.json'), JSON.stringify(report, null, 2), 'utf8');

    const summaryLines = report.map(item => `${item.browser}: ${item.passed ? 'PASS' : 'FAIL'} (${item.steps.length} steps, ${item.downloads.length} downloads, ${item.screenshotCount} screenshots)`);
    await fs.writeFile(path.join(reportDir, 'browser-matrix.txt'), summaryLines.join('\n') + '\n', 'utf8');

    if (failures.length) {
      throw new Error(`Browser matrix failed for: ${failures.map(item => item.browser).join(', ')}`);
    }

    console.log(summaryLines.join('\n'));
    console.log(`Snapshots saved in ${snapshotDir}`);
    console.log(`Export artifacts saved in ${artifactDir}`);
  } finally {
    server.close();
  }
}

async function runBrowser(entry, baseUrl) {
  const { name, engine, launchOptions } = entry;
  const browser = await engine.launch({
    headless: true,
    ...launchOptions
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    acceptDownloads: true,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const errors = [];
  const consoleErrors = [];
  const screenshots = [];
  const downloadArtifacts = [];

  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' && !/Failed to load resource/i.test(text) && !/404/i.test(text)) consoleErrors.push(text);
  });
  await page.addInitScript(() => {
    window.__qaBlobEntries = [];
    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = blob => {
      const url = originalCreateObjectURL(blob);
      window.__qaBlobEntries.push({ url, type: blob.type || 'application/octet-stream', size: blob.size, blob });
      return url;
    };
  });

  const result = {
    browser: name,
    passed: false,
    errors,
    consoleErrors,
    steps: [],
    downloads: downloadArtifacts,
    screenshots: [],
    screenshotCount: 0,
    exportArtifacts: [],
    hash: ''
  };

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.smartParser && document.getElementById('card') && document.getElementById('exportStatus'));
    await page.waitForFunction(() => /Ready to export/.test(document.getElementById('exportStatus')?.textContent || ''));
    await page.evaluate(() => window.waitForStablePreview?.());

    await captureSnapshot(page, name, '01-default');
    result.steps.push('loaded-default');

    await page.locator('#inputText').fill(SAMPLE_INPUT);
    await page.locator('#generateButton').click();
    await page.waitForFunction(() => /trade rows detected/i.test(document.getElementById('parseSummary')?.textContent || ''));
    await page.evaluate(() => window.waitForStablePreview?.());
    await captureSnapshot(page, name, '02-parsed');
    result.steps.push('parsed-rendered');

    await page.locator('[data-tab="layout"]').click();
    await page.locator('.preset-btn[data-template="board"]').click();
    await page.locator('#cardFormat').selectOption('9:16');
    await page.waitForFunction(() => document.getElementById('card')?.className.includes('template-board'));
    await page.locator('[data-tab="style"]').click();
    await page.locator('#watermarkToggle').check();
    await page.locator('#footerText').fill('For internal review only.');
    await page.locator('#watermarkText').fill('QA DRAFT');
    await page.evaluate(() => window.waitForStablePreview?.());
    await captureSnapshot(page, name, '03-configured');
    result.steps.push('configured-style');

    const exportBaseCount = await page.evaluate(() => window.__qaBlobEntries.length);
    await page.locator('#exportFormat').selectOption('png');
    await page.locator('#downloadButton').click();
    await page.waitForFunction(() => /Ready to export/.test(document.getElementById('exportStatus')?.textContent || ''), null, { timeout: 120000 });
    await page.waitForTimeout(250);
    const pngEntries = await collectNewBlobEntries(page, exportBaseCount, artifactDir, name, 'png');
    if (!pngEntries.some(entry => /image\/(png|jpeg)/i.test(entry.type))) throw new Error(`${name} PNG export did not produce a raster blob`);
    result.exportArtifacts.push(...pngEntries.map(entry => entry.path));
    downloadArtifacts.push(...pngEntries.map(entry => path.basename(entry.path)));
    result.steps.push('png-export');

    const svgBaseCount = await page.evaluate(() => window.__qaBlobEntries.length);
    await page.locator('#exportFormat').selectOption('svg');
    await page.locator('#downloadButton').click();
    await page.waitForFunction(() => /Ready to export/.test(document.getElementById('exportStatus')?.textContent || ''), null, { timeout: 120000 });
    await page.waitForTimeout(250);
    const svgEntries = await collectNewBlobEntries(page, svgBaseCount, artifactDir, name, 'svg');
    if (!svgEntries.some(entry => /svg/i.test(entry.type))) throw new Error(`${name} SVG export did not produce an svg blob`);
    result.exportArtifacts.push(...svgEntries.map(entry => entry.path));
    downloadArtifacts.push(...svgEntries.map(entry => path.basename(entry.path)));
    result.steps.push('svg-export');

    const tallLines = Array.from({ length: 80 }, (_, index) => `TRADE${index + 1}: ${(index % 17 + 1).toFixed(2)}% in ${index % 5 + 1} days`).join('\n');
    await page.locator('[data-tab="data"]').click();
    await page.locator('#inputText').fill(`Equity:\n${tallLines}`);
    await page.locator('#generateButton').click();
    await page.waitForFunction(() => /trade rows detected/i.test(document.getElementById('parseSummary')?.textContent || ''));
    await page.locator('[data-tab="style"]').click();
    await page.locator('#footerText').fill('Tall export validation.');
    await page.evaluate(() => window.waitForStablePreview?.());
    await captureSnapshot(page, name, '04-tall-layout');
    result.steps.push('tall-layout');

    await page.locator('#exportFormat').selectOption('png');
    const tallBaseCount = await page.evaluate(() => window.__qaBlobEntries.length);
    await page.locator('#downloadButton').click();
    await page.waitForFunction(() => /Ready to export/.test(document.getElementById('exportStatus')?.textContent || ''), null, { timeout: 120000 });
    await page.waitForTimeout(250);
    const tallEntries = await collectNewBlobEntries(page, tallBaseCount, artifactDir, name, 'tall');
    if (!tallEntries.some(entry => /image\/(png|jpeg)/i.test(entry.type))) throw new Error(`${name} tall PNG export did not produce a raster blob`);
    result.exportArtifacts.push(...tallEntries.map(entry => entry.path));
    downloadArtifacts.push(...tallEntries.map(entry => path.basename(entry.path)));
    result.steps.push(`tall-export-${tallEntries.length}`);

    if (errors.length || consoleErrors.length) {
      throw new Error(`${name} reported page errors: ${[...errors, ...consoleErrors].join(' | ')}`);
    }

    result.passed = true;
    result.screenshotCount = screenshots.length;
    result.hash = await hashFile(path.join(snapshotDir, name, '04-tall-layout.png'));
    result.screenshots = screenshots;
    return result;
  } finally {
    await context.close();
    await browser.close();
  }

  async function captureSnapshot(page, browserName, label) {
    const browserDir = path.join(snapshotDir, browserName);
    await ensureDir(browserDir);
    const filePath = path.join(browserDir, `${label}.png`);
    await page.locator('.app').screenshot({ path: filePath, animations: 'disabled' });
    screenshots.push(filePath);
  }
}

async function collectNewBlobEntries(page, startIndex, outputDir, browserName, label) {
  const entries = await page.evaluate(async fromIndex => {
    const source = (window.__qaBlobEntries || []).slice(fromIndex);
    const results = [];
    for (let index = 0; index < source.length; index += 1) {
      const entry = source[index];
      const record = {
        type: entry.type,
        size: entry.size,
        fileName: `${index + 1}.${entry.type.includes('svg') ? 'svg' : entry.type.includes('png') ? 'png' : 'jpg'}`
      };
      if (entry.type.includes('svg')) {
        record.text = await entry.blob.text();
      } else {
        const reader = new FileReader();
        record.dataUrl = await new Promise(resolve => {
          reader.onload = () => resolve(String(reader.result || ''));
          reader.readAsDataURL(entry.blob);
        });
      }
      results.push(record);
    }
    return results;
  }, startIndex);

  const saved = [];
  for (const entry of entries) {
    const ext = entry.type.includes('svg') ? 'svg' : entry.type.includes('png') ? 'png' : 'jpg';
    const filePath = path.join(outputDir, `${browserName}-${label}-${saved.length + 1}.${ext}`);
    if (entry.type.includes('svg')) {
      await fs.writeFile(filePath, entry.text || '', 'utf8');
    } else {
      const base64 = String(entry.dataUrl || '').split(',')[1] || '';
      await fs.writeFile(filePath, Buffer.from(base64, 'base64'));
    }
    saved.push({ path: filePath, type: entry.type, size: entry.size });
  }
  return saved;
}

await runBrowserMatrix().catch(error => {
  console.error(error);
  process.exit(1);
});
