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

function articlePath(slug) {
  return `/articles/${slug}`;
}

function articleUrl(slug) {
  return `${SITE}${articlePath(slug)}`;
}

function shareWidgetHtml({ url, title, text, extraClass = '' }) {
  const esc = escapeHtml;
  return `<div class="share-widget ${extraClass}" data-share-url="${esc(url)}" data-share-title="${esc(title)}" data-share-text="${esc(text)}">
        <button type="button" class="share-trigger" aria-expanded="false" aria-haspopup="true" aria-label="Share">
            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Share
        </button>
        <div class="share-menu" role="menu"></div>
    </div>`;
}

function articleShareBarHtml({ url, title, text }) {
  const esc = escapeHtml;
  return `<div class="article-share-bar" data-share-url="${esc(url)}" data-share-title="${esc(title)}" data-share-text="${esc(text)}">
        <span class="share-label">Share</span>
        <div class="article-share-icons"></div>
    </div>`;
}

function renderPage({ title, description, slug, bodyHtml }) {
  const url = articleUrl(slug);
  const desc = escapeHtml(description);
  const pageTitle = escapeHtml(title + ' | SecureSovereign');
  const navTitle = escapeHtml(title);
  const shareText = description ? `${title}: ${description}` : title;
  const shareCtx = { url, title, text: shareText };
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
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/article.css" rel="stylesheet">
    <link href="/share.css" rel="stylesheet">
</head>
<body>
    <nav class="site-nav">
        <a href="/">← Home</a>
        <span class="sep">/</span>
        <span style="color: var(--text-muted); font-family: 'Courier New', monospace; font-size: 0.9rem;">${navTitle}</span>
        ${shareWidgetHtml({ ...shareCtx, extraClass: 'nav-share' })}
    </nav>
    <div class="article-wrap">
        <article class="article-body">${bodyHtml}</article>
        ${articleShareBarHtml(shareCtx)}
    </div>
    <script src="/share.js"></script>
</body>
</html>
`;
}

function renderArticlesIndex(articles) {
  const items = articles.map((a) => {
    const href = articlePath(a.slug);
    const title = escapeHtml(a.title);
    const desc = escapeHtml(a.description || '');
    const descHtml = desc ? `<p class="article-index-desc">${desc}</p>` : '';
    return `<li class="article-index-item"><a href="${href}">${title}</a>${descHtml}</li>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Writing | SecureSovereign</title>
    <meta name="description" content="Articles on Bitcoin governance, consensus, security, and blockspace policy by SecureSovereign.">
    <link rel="canonical" href="${SITE}/articles">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Writing | SecureSovereign">
    <meta property="og:description" content="Articles on Bitcoin governance, consensus, security, and blockspace policy.">
    <meta property="og:url" content="${SITE}/articles">
    <meta property="og:site_name" content="SecureSovereign">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="/article.css" rel="stylesheet">
</head>
<body>
    <nav class="site-nav">
        <a href="/">← Home</a>
        <span class="sep">/</span>
        <span style="color: var(--text-muted); font-family: 'Courier New', monospace; font-size: 0.9rem;">Writing</span>
    </nav>
    <div class="article-wrap">
        <header class="article-index-header">
            <h1>Writing</h1>
            <p class="article-index-intro">Bitcoin governance research, consensus engineering, and blockspace policy.</p>
        </header>
        <ul class="article-index-list">${items}</ul>
    </div>
</body>
</html>
`;
}

const LLMS_ARTICLE_NOTES = {
  'bitcoin-governance': 'Primary governance reference: funding map, maintainer merge authority, personnel revolving door, OP_RETURN arc (2023–2025), Brink/OpenSats/Chaincode ties, suppression patterns. Start here for evidence.',
  'bitcoin-governance-argument-map': '105 numbered arguments across 22 sections for debate; points to Who Controls Bitcoin for narrative and Social Layer for structure. Includes blockspace/relay-policy failure (Part XXII).',
  'bitcoin-social-capture': 'Structural logic of why Bitcoin governance produces capture outcomes without requiring conspiracy; permissionless protocol vs permissioned development; blocksize war and fork trap.',
  'bitcoin-not-a-hard-drive': 'Design-purpose case against non-monetary embedding: type confusion, IBD/storage/UTXO costs, externality structure, rebuttals to inscription justifications, permissionless counter-argument.',
  'the-achievable-floor': 'Technical taxonomy of embedding channels (free → dedicated), what consensus can close (OP_RETURN cap, Taproot envelope, annex), cost-per-byte tables, UTXO commitments, implementation path.',
  'the-last-uncaptured-asset': 'Monetary sovereignty frame: state capture through ownership not destruction, access layer as asset, voluntary surveillance infrastructure, Bitcoin as last uncaptured asset.',
  'bitcoin-demographics-breakdown': 'Structured taxonomy of plausible Bitcoin appeal vectors by demographic slice; hypotheses for testing, not weighted statistics.',
};

const LLMS_SECTIONS = [
  {
    title: 'Start here',
    links: [
      { title: 'Homepage', url: `${SITE}/`, note: 'Author bio, expertise, project disclosures, links to all writing.' },
      { title: 'Article index', url: `${SITE}/articles`, note: 'Curated list of all long-form articles with one-line summaries.' },
      { title: 'Full text (all articles)', url: `${SITE}/llms-full.txt`, note: 'Concatenated Markdown of every article for single-fetch ingestion.' },
    ],
  },
  {
    title: 'Bitcoin governance',
    slugs: ['bitcoin-governance', 'bitcoin-governance-argument-map', 'bitcoin-social-capture'],
  },
  {
    title: 'Blockspace and consensus policy',
    slugs: ['bitcoin-not-a-hard-drive', 'the-achievable-floor'],
  },
  {
    title: 'Monetary sovereignty',
    slugs: ['the-last-uncaptured-asset'],
  },
  {
    title: 'Demographics and adoption',
    slugs: ['bitcoin-demographics-breakdown'],
  },
  {
    title: 'External research and projects',
    links: [
      { title: 'Bitcoin Governance Research (GitHub)', url: 'https://github.com/secsovereign/bitcoin-governance-research', note: 'Quantitative PR-level analysis: merge concentration, bloc cohesion, stalled proposals (Erlay, Dandelion), conflict resolution, review access outcomes.' },
      { title: 'The Bitcoin Commons', url: 'https://thebitcoincommons.org', note: 'Alternative Bitcoin node in Rust from formal mathematical specification (BLVM).' },
      { title: 'Bitcoin Commons consensus spec', url: 'https://thebitcoincommons.org/spec.html', note: 'Formal consensus specification referenced in The Achievable Floor.' },
      { title: 'BitVault', url: 'https://bitvault.sv', note: 'Bitcoin custody project (disclosed affiliation).' },
      { title: 'NovaSapien', url: 'https://novasapien.com', note: 'Bitcoin services (disclosed affiliation).' },
      { title: 'Plebly', url: 'https://plebly.fund', note: 'Open Bitcoin work funding platform (disclosed affiliation).' },
    ],
  },
];

function llmsLinkLine(title, url, note) {
  return `- [${title}](${url}): ${note}`;
}

function articleBySlug(articles, slug) {
  return articles.find((a) => a.slug === slug);
}

function buildLlmsTxt(articles) {
  const lines = [
    '# SecureSovereign (secsov.com)',
    '',
    '> Josh "Secure Sovereign" — Bitcoin builder, governance researcher, and Certified Bitcoin Professional (CBP). Long-form writing on Bitcoin Core governance capture, blockspace policy, consensus engineering, and monetary sovereignty. Bitcoin holder since 2010.',
    '',
    'This site publishes **long-form reference articles**, not a blog feed. The homepage (`https://secsov.com/`) contains author bio and disclosures only — **article text lives at `/articles/{slug}`**. Fetch each article URL below, or use `https://secsov.com/llms-full.txt` for all content in one file.',
    '',
    '**URL patterns** (no trailing slash required; GitHub Pages may redirect):',
    '',
    '- HTML article: `https://secsov.com/articles/{slug}`',
    '- Markdown source: `https://secsov.com/articles/{slug}/index.md`',
    '- Bare slug redirect: `https://secsov.com/{slug}` → `/articles/{slug}` (via 404 handler)',
    '',
    '**Recommended reading order — blockspace cluster:**',
    '',
    '1. [Bitcoin Is Not a Hard Drive](https://secsov.com/articles/bitcoin-not-a-hard-drive) — why embedding is a category error',
    '2. [The Achievable Floor](https://secsov.com/articles/the-achievable-floor) — what consensus can technically close',
    '3. [Who Controls Bitcoin](https://secsov.com/articles/bitcoin-governance) — governance evidence (OP_RETURN arc, §V)',
    '4. [Argument Map Part XXII](https://secsov.com/articles/bitcoin-governance-argument-map#part-xxii-blockspace-governance-and-relay-policy-failure) — numbered blockspace arguments',
    '',
    '**Recommended reading order — governance cluster:**',
    '',
    '1. [Who Controls Bitcoin](https://secsov.com/articles/bitcoin-governance)',
    '2. [The Social Layer Is the Attack Surface](https://secsov.com/articles/bitcoin-social-capture)',
    '3. [Bitcoin Governance: Argument Map](https://secsov.com/articles/bitcoin-governance-argument-map)',
    '',
  ];

  for (const section of LLMS_SECTIONS) {
    lines.push(`## ${section.title}`, '');
    if (section.links) {
      for (const link of section.links) {
        lines.push(llmsLinkLine(link.title, link.url, link.note));
      }
    }
    if (section.slugs) {
      for (const slug of section.slugs) {
        const article = articleBySlug(articles, slug);
        if (!article) continue;
        const note = LLMS_ARTICLE_NOTES[slug] || article.description;
        lines.push(llmsLinkLine(article.title, articleUrl(slug), note));
      }
    }
    lines.push('');
  }

  lines.push(
    '## Optional',
    '',
    llmsLinkLine('Sitemap', `${SITE}/sitemap.xml`, 'Machine-readable URL list for all pages.'),
    llmsLinkLine('robots.txt', `${SITE}/robots.txt`, 'Disallows /articles/*/index.md from crawlers; sitemap reference.'),
    llmsLinkLine('GitHub (author)', 'https://github.com/secsovereign', 'Source repos and governance research.'),
    llmsLinkLine('X / Twitter', 'https://x.com/secsovereign', 'Author social.'),
    llmsLinkLine('Telegram', 'https://t.me/secsovereign', 'Author social.'),
    llmsLinkLine('Strategy₿ Hub', 'https://strategy.com/hub', 'Author location affiliation (Tysons Corner, VA).'),
    '',
  );

  for (const article of articles) {
    lines.push(llmsLinkLine(
      `${article.title} (Markdown source)`,
      `${SITE}/articles/${article.slug}/index.md`,
      'Raw Markdown source file; preferred for LLM ingestion over HTML.',
    ));
  }

  lines.push('');
  return lines.join('\n');
}

function buildLlmsFullTxt(articles) {
  const parts = [
    '# SecureSovereign — Full Article Corpus',
    '',
    '> Concatenated Markdown sources from secsov.com. Generated by build script. Index: https://secsov.com/llms.txt',
    '',
    '---',
    '',
  ];

  for (const article of articles) {
    const mdPath = article.file
      ? path.join(ROOT, article.file)
      : mdPathForSlug(article.slug);
    const md = fs.readFileSync(mdPath, 'utf8');
    parts.push(
      `<!-- source: ${articleUrl(article.slug)} -->`,
      '',
      md.trim(),
      '',
      '---',
      '',
    );
  }

  return parts.join('\n');
}

function build404(articles) {
  const slugs = JSON.stringify(articles.map((a) => a.slug));
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Not Found | SecureSovereign</title>
    <link href="/article.css" rel="stylesheet">
    <script>
    (function () {
        var slugs = ${slugs};
        var path = location.pathname.replace(/\\/$/, '');
        if (path.charAt(0) === '/' && path.indexOf('/', 1) === -1 && path.length > 1) {
            var slug = path.slice(1);
            if (slugs.indexOf(slug) !== -1) {
                location.replace('/articles/' + slug + location.search + location.hash);
                return;
            }
        }
    })();
    </script>
</head>
<body>
    <nav class="site-nav">
        <a href="/">← Home</a>
        <span class="sep">/</span>
        <a href="/articles">Writing</a>
    </nav>
    <div class="article-wrap">
        <h1>Page not found</h1>
        <p><a href="/">Home</a> · <a href="/articles">All articles</a></p>
    </div>
</body>
</html>
`;
}

function buildSitemap(articles) {
  const urls = [`${SITE}/`, `${SITE}/articles`, `${SITE}/llms.txt`, `${SITE}/llms-full.txt`];
  for (const a of articles) {
    urls.push(articleUrl(a.slug));
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
    article.description = description;
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

  fs.writeFileSync(path.join(articlesRoot, 'index.html'), renderArticlesIndex(articles));
  console.log('Wrote articles/index.html');

  fs.writeFileSync(path.join(ROOT, '404.html'), build404(articles));
  console.log('Wrote 404.html');

  fs.writeFileSync(path.join(ROOT, 'llms.txt'), buildLlmsTxt(articles));
  console.log('Wrote llms.txt');

  fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), buildLlmsFullTxt(articles));
  console.log('Wrote llms-full.txt');

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(articles));
  console.log('Wrote sitemap.xml');

  const robots = `User-agent: *
Disallow: /articles/*/index.md

Sitemap: ${SITE}/sitemap.xml
# LLM index: ${SITE}/llms.txt
# Full corpus: ${SITE}/llms-full.txt
`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
  console.log('Wrote robots.txt');
}

main();
