'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://secsov.com';

/** Public byline only. Do not substitute OS, git, or legal names. */
const PDF_AUTHOR = 'Josh';
const PDF_ATTRIBUTION = 'Secure Sovereign';

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    '/usr/bin/brave',
    '/usr/bin/brave-browser',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function wrapKeepWithNext(html) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(`<div class="pdf-root">${html}</div>`, null, false);
  const root = $('.pdf-root');
  ['h4', 'h3', 'h2'].forEach((tag) => {
    root.find(tag).each(function () {
      const heading = $(this);
      if (heading.parent().hasClass('keep-with-next')) return;
      const next = heading.next();
      if (!next.length) return;
      if (next.is('h1, h2')) return;
      heading.add(next).wrapAll('<div class="keep-with-next"></div>');
    });
  });
  return root.html();
}

function stripLeadingH1(html) {
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>/i, '').trim();
}

function absolutizeHrefs(html) {
  return html.replace(/\bhref="(\/[^"]*)"/g, (_m, href) => `href="${SITE}${href}"`);
}

function renderPdfHtml(job) {
  const articleCss = fs.readFileSync(path.join(ROOT, 'article.css'), 'utf8');
  const pdfCss = fs.readFileSync(path.join(__dirname, 'pdf.css'), 'utf8');
  let body = stripLeadingH1(job.bodyHtml);
  body = wrapKeepWithNext(body);
  body = absolutizeHrefs(body);

  const metaBits = (job.metaLines || []).filter(Boolean);
  const canonical = job.canonicalUrl;
  const mdUrl = job.markdownUrl;
  const metaHtml = metaBits.length
    ? `<p class="pdf-meta">${escapeHtml(metaBits.join(' · '))}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(job.title)}</title>
  <style>${articleCss}\n${pdfCss}</style>
</head>
<body>
  <div class="pdf-page">
    <header class="pdf-masthead">
      <h1>${escapeHtml(job.title)}</h1>
      <p class="pdf-byline">${escapeHtml(PDF_AUTHOR)} · ${escapeHtml(PDF_ATTRIBUTION)}</p>
      ${metaHtml}
    </header>
    <article class="article-body pdf-body">${body}</article>
    <footer class="pdf-colophon">
      <p class="pdf-colophon-mark">SecureSovereign</p>
      <p>Markdown is the canonical source: <a href="${escapeHtml(mdUrl)}">${escapeHtml(mdUrl)}</a></p>
      <p>Formatted snapshot of <a href="${escapeHtml(canonical)}">${escapeHtml(canonical)}</a></p>
      <p>${escapeHtml(PDF_AUTHOR)} · ${escapeHtml(PDF_ATTRIBUTION)}</p>
    </footer>
  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function headerFooterTemplates(job) {
  const kind = job.kind === 'bip' ? 'BIP PRE-PROPOSAL' : 'ARTICLE';
  const footerTitle = escapeHtml(job.title).slice(0, 64);
  /* Chromium prints a default date/title header unless this is replaced.
     Header/footer HTML is a separate document: no flex, limited CSS.
     Do not set an explicit height — it overflows into the body. */
  const paper = '#f4f1ea';
  const header = `<div style="width:100%; background:${paper}; margin:0; padding:8px 18mm 0; box-sizing:border-box; font-size:9px;">
    <table style="width:100%; border-collapse:collapse; font-size:9px; font-family:'Courier New', Courier, monospace;">
      <tr>
        <td style="text-align:left; letter-spacing:0.14em; color:#a33b3b;">${kind}</td>
        <td style="text-align:right; letter-spacing:0.12em; color:#5e5a54;">SECSOV.COM</td>
      </tr>
    </table>
  </div>`;
  const footer = `<div style="width:100%; background:${paper}; margin:0; padding:0 18mm; box-sizing:border-box; font-size:9px;">
    <div style="border-top:0.7px solid #c8c2b6; padding-top:5px;">
      <table style="width:100%; border-collapse:collapse; font-size:9px; color:#4a4640; font-family:'Courier New', Courier, monospace;">
        <tr>
          <td style="width:26%; text-align:left; white-space:nowrap; letter-spacing:0.08em;">SECURESOVEREIGN</td>
          <td style="width:48%; text-align:center; white-space:nowrap;">${footerTitle}</td>
          <td style="width:26%; text-align:right; white-space:nowrap;"><span class="pageNumber"></span> / <span class="totalPages"></span></td>
        </tr>
      </table>
    </div>
  </div>`;
  return { header, footer };
}

async function writePdfs(jobs) {
  if (process.env.SKIP_PDF === '1') {
    console.log('Skipping PDFs (SKIP_PDF=1)');
    return;
  }
  const executablePath = findChrome();
  if (!executablePath) {
    console.error('No Chrome/Brave/Chromium found for PDF generation. Set CHROME_PATH or install a browser.');
    process.exit(1);
  }

  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
  });

  try {
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'secsov-pdf-'));

    for (const job of jobs) {
      const htmlPath = path.join(tmpDir, `${job.slug}.html`);
      fs.writeFileSync(htmlPath, renderPdfHtml(job));
      await page.goto(`file://${htmlPath}`, { waitUntil: 'load', timeout: 60000 });
      const { header, footer } = headerFooterTemplates(job);
      await page.pdf({
        path: job.outPath,
        format: 'Letter',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: header,
        footerTemplate: footer,
        margin: { top: '14mm', bottom: '16mm', left: '18mm', right: '18mm' },
        preferCSSPageSize: false,
      });
      console.log(`Wrote ${path.relative(ROOT, job.outPath)}`);
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
  } finally {
    await browser.close();
  }
}

module.exports = {
  PDF_AUTHOR,
  PDF_ATTRIBUTION,
  writePdfs,
};
