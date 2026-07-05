'use strict';

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://secsov.com';

marked.setOptions({ gfm: true, breaks: false });

function fileToSlug(file) {
  return file.replace(/\.md$/, '').replace(/_/g, '-');
}

function slugify(text) {
  const s = text.trim().toLowerCase()
    .replace(/[^\w\u00c0-\u024f\u4e00-\u9fff-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'section';
}

function addHeadingIds(html) {
  const $ = cheerio.load(html, null, false);
  const used = Object.create(null);
  $('h2, h3').each(function () {
    const el = $(this);
    const base = slugify(el.text());
    let id = base;
    let n = 2;
    while (used[id]) {
      id = base + '-' + n++;
    }
    used[id] = true;
    el.attr('id', id);
  });
  return $.html();
}

function extractDescription(md, title) {
  const lines = md.split('\n');
  const chunks = [];
  let inFence = false;
  let inContents = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (/^##\s*Contents/i.test(line)) {
      inContents = true;
      continue;
    }
    if (inContents) {
      if (line.trim() === '---') inContents = false;
      continue;
    }

    if (/^#+\s/.test(line)) continue;
    if (line.trim() === '---') continue;
    if (/^-\s+\[/.test(line)) continue;
    if (!line.trim()) {
      if (chunks.length) break;
      continue;
    }

    chunks.push(line.trim());
    if (chunks.join(' ').length > 120) break;
  }

  let text = chunks.join(' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
  if (!text) text = title;
  if (text.length > 160) text = text.slice(0, 157) + '...';
  return text;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPage({ title, description, slug, bodyHtml }) {
  const url = `${SITE}/articles/${slug}/`;
  const desc = escapeHtml(description);
  const pageTitle = escapeHtml(title + ' — SecureSovereign');
  const navTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="SecureSovereign">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="/article.css" rel="stylesheet">
</head>
<body>
    <nav class="site-nav">
        <a href="/">← Home</a>
        <span class="sep">/</span>
        <span style="color: var(--text-muted); font-family: 'Courier New', monospace; font-size: 0.9rem;">${navTitle}</span>
    </nav>
    <div class="article-wrap">
        <article class="article-body">${bodyHtml}</article>
    </div>
</body>
</html>
`;
}

function buildSitemap(articles) {
  const urls = [`${SITE}/`];
  for (const a of articles) {
    urls.push(`${SITE}/articles/${a.slug}/`);
  }
  const body = urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function main() {
  const manifestPath = path.join(ROOT, 'articles.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const articles = (manifest.articles || []).map((entry) => ({
    ...entry,
    slug: entry.slug || fileToSlug(entry.file),
  }));

  const articlesRoot = path.join(ROOT, 'articles');
  if (fs.existsSync(articlesRoot)) {
    fs.rmSync(articlesRoot, { recursive: true });
  }

  for (const article of articles) {
    const mdPath = path.join(ROOT, article.file);
    if (!fs.existsSync(mdPath)) {
      console.error('Missing:', article.file);
      process.exit(1);
    }
    const md = fs.readFileSync(mdPath, 'utf8');
    const description = article.description || extractDescription(md, article.title);
    let bodyHtml = marked.parse(md);
    bodyHtml = addHeadingIds(bodyHtml);
    const html = renderPage({
      title: article.title,
      description,
      slug: article.slug,
      bodyHtml,
    });
    const outDir = path.join(articlesRoot, article.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log('Wrote articles/' + article.slug + '/index.html');
  }

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(articles));
  console.log('Wrote sitemap.xml');

  const robots = `User-agent: *
Disallow: /*.md

Sitemap: ${SITE}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
  console.log('Wrote robots.txt');
}

main();
