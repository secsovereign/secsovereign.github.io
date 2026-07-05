'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { marked } = require('marked');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://secsov.com';
const MMDC = path.join(ROOT, 'node_modules', '.bin', 'mmdc');

marked.setOptions({ gfm: true, breaks: false });

const MERMAID_THEME = [
  '%%{init: {',
  '  "theme": "dark",',
  '  "themeVariables": {',
  '    "fontSize": "11px",',
  '    "primaryColor": "#0099ff",',
  '    "primaryTextColor": "#f5f5f5",',
  '    "secondaryTextColor": "#f5f5f5",',
  '    "tertiaryTextColor": "#999999",',
  '    "lineColor": "#666666",',
  '    "secondaryColor": "#2a2a2a",',
  '    "tertiaryColor": "#1a1a1a",',
  '    "background": "#121212",',
  '    "mainBkg": "#2a2a2a",',
  '    "nodeBorder": "#0099ff",',
  '    "clusterBkg": "#1a1a1a",',
  '    "titleColor": "#f5f5f5",',
  '    "xyChart": { "titleColor": "#f5f5f5", "plotColorPalette": "#0099ff,#ff6b6b" }',
  '  },',
  '  "flowchart": { "nodeSpacing": 24, "rankSpacing": 28, "padding": 6, "htmlLabels": true },',
  '}}%%',
  '',
].join('\n');

function mmdcArgsForDiagram(code) {
  if (/\bxychart/i.test(code)) {
    return ['-w', '420', '-H', '220'];
  }
  return ['-w', '520', '-H', '120'];
}

function chartClassForDiagram(code) {
  if (/\bxychart/i.test(code)) return 'chart-xychart';
  return 'chart-flowchart';
}

function renderMermaidDiagram(code) {
  const diagram = MERMAID_THEME + code.trim();
  const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const tmpIn = path.join(os.tmpdir(), `${id}.mmd`);
  const tmpOut = path.join(os.tmpdir(), `${id}.svg`);
  try {
    fs.writeFileSync(tmpIn, diagram);
    execFileSync(MMDC, ['-i', tmpIn, '-o', tmpOut, '-b', 'transparent', ...mmdcArgsForDiagram(code)], {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });
    let svg = fs.readFileSync(tmpOut, 'utf8');
    svg = svg.replace(/<svg /, '<svg class="mermaid-svg" ');
    svg = svg.replace(/font-size:16px/g, 'font-size:10px');
    if (!/\bxychart/i.test(code)) {
      return svg;
    }
    svg = svg.replace(/\bwidth="[^"]*"/, 'width="100%"');
    svg = svg.replace(/style="max-width:[^"]*"/, 'style="max-width:100%"');
    return svg;
  } finally {
    for (const f of [tmpIn, tmpOut]) {
      try { fs.unlinkSync(f); } catch (_) { /* ignore */ }
    }
  }
}

function renderMermaidBlocks(md) {
  return md.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
    try {
      const svg = renderMermaidDiagram(code);
      const chartClass = chartClassForDiagram(code);
      return `<figure class="article-chart ${chartClass}">\n<div class="chart-svg">${svg}</div>\n</figure>\n\n`;
    } catch (err) {
      console.error('Mermaid render failed:', err.message || err);
      process.exit(1);
    }
  });
}

function fileToSlug(file) {
  const base = path.basename(file, '.md');
  if (base === 'index') {
    return path.basename(path.dirname(file));
  }
  return base.replace(/_/g, '-');
}

function mdPathForSlug(slug) {
  return path.join(ROOT, 'articles', slug, 'index.md');
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
    slug: entry.slug || (entry.file ? fileToSlug(entry.file) : null),
  }));

  const articlesRoot = path.join(ROOT, 'articles');
  fs.mkdirSync(articlesRoot, { recursive: true });

  for (const article of articles) {
    if (!article.slug) {
      console.error('Missing slug for article:', article.title || article);
      process.exit(1);
    }
    const mdPath = article.file
      ? path.join(ROOT, article.file)
      : mdPathForSlug(article.slug);
    if (!fs.existsSync(mdPath)) {
      console.error('Missing:', mdPath);
      process.exit(1);
    }
    const md = fs.readFileSync(mdPath, 'utf8');
    const description = article.description || extractDescription(md, article.title);
    let bodyHtml = marked.parse(renderMermaidBlocks(md));
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
Disallow: /articles/*/index.md

Sitemap: ${SITE}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
  console.log('Wrote robots.txt');
}

main();
