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
// Keep ~ for "approximately"; GFM strikethrough pairs tildes into <del>.
marked.use({
  tokenizer: {
    del() {
      return undefined;
    },
  },
});

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

function bipPath(slug) {
  return `/bips/${slug}`;
}

function bipUrl(slug) {
  return `${SITE}${bipPath(slug)}`;
}

function mdPathForBipSlug(slug) {
  return path.join(ROOT, 'bips', slug, 'index.md');
}

function formatArticleDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatArticleDateShort(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function renderHomepageWritingList(articles) {
  const items = articles.map((a) => {
    const href = articlePath(a.slug);
    const title = escapeHtml(a.title);
    const dateIso = a.published || '';
    const dateLabel = formatArticleDateShort(dateIso);
    const dateHtml = dateIso
      ? `<time class="writing-date" datetime="${escapeHtml(dateIso)}">${escapeHtml(dateLabel)}</time>`
      : '';
    return `<li class="writing-item"><a href="${href}" class="writing-link">${title}</a>${dateHtml}</li>`;
  }).join('\n                ');
  return `<ul class="writing-list">\n                ${items}\n            </ul>`;
}

function renderHomepageBipList(bips) {
  const items = bips.map((b) => {
    const href = bipPath(b.slug);
    const title = escapeHtml(b.title);
    const status = escapeHtml(b.status || 'Pre-Proposal');
    return `<li class="writing-item"><a href="${href}" class="writing-link">${title}</a><span class="writing-date">${status}</span></li>`;
  }).join('\n                ');
  return `<ul class="writing-list">\n                ${items}\n            </ul>`;
}

function patchHomepageMarkedSection(start, end, contentHtml, label) {
  const indexPath = path.join(ROOT, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    console.error(`Missing ${label} markers in index.html`);
    process.exit(1);
  }
  const next = html.slice(0, startIdx + start.length)
    + '\n            '
    + contentHtml
    + '\n            '
    + html.slice(endIdx);
  fs.writeFileSync(indexPath, next);
  console.log(`Wrote index.html (${label})`);
}

function patchHomepageWriting(articles) {
  patchHomepageMarkedSection(
    '<!-- writing-list:start -->',
    '<!-- writing-list:end -->',
    renderHomepageWritingList(articles),
    'Writing section',
  );
}

function patchHomepageBips(bips) {
  patchHomepageMarkedSection(
    '<!-- bip-list:start -->',
    '<!-- bip-list:end -->',
    renderHomepageBipList(bips),
    'BIPs section',
  );
}

function articleDatesLabel(article) {
  if (!article.published) return '';
  const pub = formatArticleDate(article.published);
  const upd = article.updated && article.updated !== article.published
    ? formatArticleDate(article.updated)
    : '';
  if (upd) return `Published ${pub} · Updated ${upd}`;
  return `Published ${pub}`;
}

function articleMetaHtml(article) {
  if (!article.published) return '';
  const esc = escapeHtml;
  const pubLabel = formatArticleDate(article.published);
  const showUpdated = article.updated && article.updated !== article.published;
  const updLabel = showUpdated ? formatArticleDate(article.updated) : '';

  let datesHtml = `<time datetime="${esc(article.published)}">Published ${esc(pubLabel)}</time>`;
  if (showUpdated) {
    datesHtml += `<span class="article-meta-sep" aria-hidden="true">·</span><time datetime="${esc(article.updated)}">Updated ${esc(updLabel)}</time>`;
  }

  let originHtml = '';
  if (article.originalUrl) {
    originHtml = `<p class="article-origin"><a href="${esc(article.originalUrl)}" rel="noopener noreferrer">Originally on Bitcoin Commons Substack</a></p>`;
  }

  return `<header class="article-meta">
        <p class="article-dates">${datesHtml}</p>
        ${originHtml}
    </header>`;
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

function wrapBipToc(bodyHtml) {
  const $ = cheerio.load(bodyHtml, null, false);
  const heading = $('#contents');
  if (!heading.length) return bodyHtml;
  const list = heading.next('ul');
  if (!list.length) return bodyHtml;
  const hr = list.next('hr');
  heading.add(list).wrapAll('<nav class="bip-toc" aria-label="Contents"></nav>');
  if (hr.length) hr.remove();
  return $.html();
}

function bipMetaHtml(bip) {
  const esc = escapeHtml;
  const status = esc(bip.status || 'Pre-Proposal');
  const type = bip.type ? esc(bip.type) : '';
  const created = bip.created ? formatArticleDate(bip.created) : '';
  const license = bip.license ? esc(bip.license) : '';
  const parts = [`<span class="bip-status">${status}</span>`];
  if (type) parts.push(`<span>${type}</span>`);
  if (created) {
    parts.push(`<time datetime="${esc(bip.created)}">Created ${esc(created)}</time>`);
  }
  if (license) parts.push(`<span>${license}</span>`);

  return `<header class="article-meta bip-meta">
        <p class="article-dates">${parts.join('<span class="article-meta-sep" aria-hidden="true">·</span>')}</p>
        <p class="article-origin">Bitcoin Improvement Pre-Proposal: not yet a numbered BIP.</p>
    </header>`;
}

function bipRelatedFooterHtml(bip, bips) {
  const esc = escapeHtml;
  const items = [];

  if (bip.companion) {
    const companion = bipBySlug(bips, bip.companion);
    if (companion) {
      items.push(
        `<li><span class="bip-related-label">Related BIP</span><a href="${esc(bipPath(companion.slug))}">${esc(companion.title)}</a></li>`,
      );
    }
  }
  if (bip.dependsOn) {
    const dep = bipBySlug(bips, bip.dependsOn);
    if (dep) {
      items.push(
        `<li><span class="bip-related-label">Depends on</span><a href="${esc(bipPath(dep.slug))}">${esc(dep.title)}</a></li>`,
      );
    }
  }

  const relatedWriting = (bip.related || []).filter((rel) => rel && rel.href && rel.title);
  if (relatedWriting.length) {
    const links = relatedWriting
      .map((rel) => `<a href="${esc(rel.href)}">${esc(rel.title)}</a>`)
      .join('<span class="article-meta-sep" aria-hidden="true">·</span>');
    items.push(`<li><span class="bip-related-label">Related writing</span><span>${links}</span></li>`);
  }

  if (!items.length) return '';
  return `<aside class="bip-related" aria-label="Related">
        <h2>Related</h2>
        <ul class="bip-related-list">
            ${items.join('\n            ')}
        </ul>
    </aside>`;
}

function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function articleJsonLd({ title, description, url, published, updated, kind = 'article' }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': kind === 'bip' ? 'TechArticle' : 'Article',
    headline: title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: {
      '@type': 'Person',
      name: 'Josh',
      alternateName: 'Secure Sovereign',
      url: `${SITE}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SecureSovereign',
      url: `${SITE}/`,
    },
    isPartOf: { '@type': 'WebSite', name: 'SecureSovereign', url: `${SITE}/` },
  };
  if (published) data.datePublished = published;
  if (updated) data.dateModified = updated;
  else if (published) data.dateModified = published;
  if (kind === 'bip') {
    data.creativeWorkStatus = 'Draft';
    data.about = { '@type': 'Thing', name: 'Bitcoin' };
  }
  return jsonLdScript(data);
}

function renderPage({
  title,
  description,
  url,
  bodyHtml,
  metaBlock = '',
  publishedMeta = '',
  modifiedMeta = '',
  navParent = null,
  afterBody = '',
  documentTitle = null,
  jsonLd = '',
  robots = 'index,follow',
}) {
  const desc = escapeHtml(description);
  const socialTitle = documentTitle || title;
  const pageTitle = escapeHtml(`${socialTitle} | SecureSovereign`);
  const navTitle = escapeHtml(title);
  const shareText = description ? `${socialTitle}: ${description}` : socialTitle;
  const shareCtx = { url, title: socialTitle, text: shareText };
  const parentNav = navParent
    ? `<a href="${escapeHtml(navParent.href)}">${escapeHtml(navParent.label)}</a>
        <span class="sep">/</span>
        `
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="description" content="${desc}">
    <meta name="robots" content="${escapeHtml(robots)}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(socialTitle)}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="SecureSovereign">
    <meta property="og:locale" content="en_US">${publishedMeta}${modifiedMeta}
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(socialTitle)}">
    <meta name="twitter:description" content="${desc}">
    ${jsonLd}
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/article.css" rel="stylesheet">
    <link href="/share.css" rel="stylesheet">
</head>
<body>
    <nav class="site-nav">
        <a href="/">← Home</a>
        <span class="sep">/</span>
        ${parentNav}<span style="color: var(--text-muted); font-family: 'Courier New', monospace; font-size: 0.9rem;">${navTitle}</span>
        ${shareWidgetHtml({ ...shareCtx, extraClass: 'nav-share' })}
    </nav>
    <div class="article-wrap">
        ${metaBlock}
        <article class="article-body">${bodyHtml}</article>
        ${afterBody}
        ${articleShareBarHtml(shareCtx)}
    </div>
    <script src="/share.js"></script>
</body>
</html>
`;
}

function renderListIndex({ title, description, canonicalPath, intro, itemsHtml, navLabel }) {
  const desc = escapeHtml(description);
  const fullTitle = escapeHtml(`${title} | SecureSovereign`);
  const url = `${SITE}${canonicalPath}`;
  const jsonLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    isPartOf: { '@type': 'WebSite', name: 'SecureSovereign', url: `${SITE}/` },
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fullTitle}</title>
    <meta name="description" content="${desc}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="SecureSovereign">
    <meta property="og:locale" content="en_US">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${fullTitle}">
    <meta name="twitter:description" content="${desc}">
    ${jsonLd}
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="/article.css" rel="stylesheet">
</head>
<body>
    <nav class="site-nav">
        <a href="/">← Home</a>
        <span class="sep">/</span>
        <span style="color: var(--text-muted); font-family: 'Courier New', monospace; font-size: 0.9rem;">${escapeHtml(navLabel)}</span>
    </nav>
    <div class="article-wrap">
        <header class="article-index-header">
            <h1>${escapeHtml(title)}</h1>
            <p class="article-index-intro">${escapeHtml(intro)}</p>
        </header>
        <ul class="article-index-list">${itemsHtml}</ul>
    </div>
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
    const dates = articleDatesLabel(a);
    const datesHtml = dates ? `<p class="article-index-dates">${escapeHtml(dates)}</p>` : '';
    return `<li class="article-index-item"><a href="${href}">${title}</a>${datesHtml}${descHtml}</li>`;
  }).join('\n');

  return renderListIndex({
    title: 'Writing',
    description: 'Long-form Bitcoin writing on governance, consensus engineering, blockspace policy, and full-node operating costs.',
    canonicalPath: '/articles',
    intro: 'Bitcoin governance research, consensus engineering, and blockspace policy.',
    itemsHtml: items,
    navLabel: 'Writing',
  });
}

function renderBipsIndex(bips) {
  const items = bips.map((b) => {
    const href = bipPath(b.slug);
    const title = escapeHtml(b.title);
    const desc = escapeHtml(b.description || '');
    const descHtml = desc ? `<p class="article-index-desc">${desc}</p>` : '';
    const status = escapeHtml(b.status || 'Pre-Proposal');
    const created = b.created ? formatArticleDate(b.created) : '';
    const metaParts = [status];
    if (created) metaParts.push(`Created ${created}`);
    const datesHtml = `<p class="article-index-dates">${escapeHtml(metaParts.join(' · '))}</p>`;
    let depHtml = '';
    if (b.dependsOn) {
      const dep = bipBySlug(bips, b.dependsOn);
      if (dep) {
        depHtml = `<p class="article-index-dep">Depends on <a href="${escapeHtml(bipPath(dep.slug))}">${escapeHtml(dep.title)}</a></p>`;
      }
    }
    return `<li class="article-index-item"><a href="${href}">${title}</a>${datesHtml}${depHtml}${descHtml}</li>`;
  }).join('\n');

  return renderListIndex({
    title: 'BIPs',
    description: 'Bitcoin Improvement Pre-Proposals: consensus per-output miner fees and related blockspace policy. Not yet numbered or submitted to the BIP process.',
    canonicalPath: '/bips',
    intro: 'Bitcoin Improvement Pre-Proposals. These are not numbered BIPs and have not been submitted to the BIP process.',
    itemsHtml: items,
    navLabel: 'BIPs',
  });
}

const LLMS_ARTICLE_NOTES = {
  'bitcoin-governance': 'Primary governance reference: funding map, maintainer merge authority, personnel revolving door, OP_RETURN arc (2023–2025), Brink/OpenSats/Chaincode ties, suppression patterns. Start here for evidence.',
  'bitcoin-governance-argument-map': '105 numbered arguments across 22 sections for debate; points to Who Controls Bitcoin for narrative and Social Layer for structure. Includes blockspace/relay-policy failure (Part XXII).',
  'bitcoin-social-capture': 'Structural logic of why Bitcoin governance produces capture outcomes without requiring conspiracy; permissionless protocol vs permissioned development; blocksize war and fork trap.',
  'bitcoin-not-a-hard-drive': 'Design-purpose case against non-monetary embedding: type confusion, IBD/storage/UTXO costs, externality structure, rebuttals to inscription justifications, permissionless counter-argument.',
  'the-achievable-floor': 'Technical taxonomy of embedding channels (free → dedicated), what consensus can close (OP_RETURN cap, Taproot envelope, annex), cost-per-byte tables, UTXO commitments, implementation path.',
  'full-cost-of-running-a-bitcoin-node': 'v2.4 methodology: six cost categories, Profile A/B, $69.99/mo 2026 operating, $47.8M/yr full-population aggregate vs ~$9M Core spend, non-monetary ~$5.5/mo ($4M/yr).',
  'the-last-uncaptured-asset': 'Monetary sovereignty frame: state capture through ownership not destruction, access layer as asset, voluntary surveillance infrastructure, Bitcoin as last uncaptured asset.',
  'bitcoin-demographics-breakdown': 'Structured taxonomy of plausible Bitcoin appeal vectors by demographic slice; hypotheses for testing, not weighted statistics.',
  'dont-trust-verify': 'Coldcard RNG defect ($88M+ on-chain), credentialed endorsement without seed-path audit, HWI/tooling defaults, Ten31/Coinkite ties, parallel failures in Bitcoin Core review.',
  'governance-paralysis-was-the-victory': 'Block size war as resource capture, MIT/DCI/Epstein funding context, CVE-2018-17144, good vs bad ossification, alternative implementations survey, Bitcoin Commons.',
  'bitcoin-core-the-biggest-fallacies': 'Eight rebuttals to Core monopoly defenses: contributor count, adoption, rough consensus, conservatism, reviewer pool. Companion to Argument Map.',
  'what-bitcoins-stalled-proposals-tell-you': 'Dandelion, UTXO commitments, Erlay, wallet/node split, formal verification: stalled in Core vs shipped in Commons; OP_RETURN/Knots policy monoculture.',
  'why-bitcoin-needs-a-specification': 'Human-readable spec (Orange Paper) vs Lean/DSL; verification as governance; spec-lock with Z3; defense-in-depth stack.',
  'bitcoins-hidden-crisis': 'Social vs protocol consensus; coordination crises (blocksize, Taproot); Bitcoin Commons cryptographic coordination model.',
};

const LLMS_BIP_NOTES = {
  'static-per-output-miner-fee': 'Pre-proposal: consensus-enforced fixed satoshi fee to miners for every new non-coinbase output; closes value and count UTXO spam vectors.',
  'dynamic-escalation-per-output-fee': 'Pre-proposal companion: EMA/p25 dynamic escalation on top of the static per-output fee to prevent long-run economic decay. Depends on static fee BIP.',
};

const LLMS_SECTIONS = [
  {
    title: 'Start here',
    links: [
      { title: 'Homepage', url: `${SITE}/`, note: 'Author bio, expertise, project disclosures, links to all writing and BIPs.' },
      { title: 'Article index', url: `${SITE}/articles`, note: 'Curated list of all long-form articles with one-line summaries.' },
      { title: 'BIP index', url: `${SITE}/bips`, note: 'Bitcoin Improvement Pre-Proposals (not numbered BIPs; not yet submitted).' },
      { title: 'Full text (articles + BIP pre-proposals)', url: `${SITE}/llms-full.txt`, note: 'Concatenated Markdown of every article and BIP pre-proposal for single-fetch ingestion.' },
    ],
  },
  {
    title: 'Bitcoin governance',
    slugs: [
      'bitcoin-governance',
      'bitcoin-governance-argument-map',
      'bitcoin-social-capture',
      'governance-paralysis-was-the-victory',
      'bitcoin-core-the-biggest-fallacies',
      'what-bitcoins-stalled-proposals-tell-you',
    ],
  },
  {
    title: 'Implementation diversity and specification',
    slugs: ['why-bitcoin-needs-a-specification', 'bitcoins-hidden-crisis'],
  },
  {
    title: 'Blockspace and consensus policy',
    slugs: ['bitcoin-not-a-hard-drive', 'the-achievable-floor', 'full-cost-of-running-a-bitcoin-node'],
  },
  {
    title: 'BIP pre-proposals',
    bipSlugs: ['static-per-output-miner-fee', 'dynamic-escalation-per-output-fee'],
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
    title: 'Security and verification',
    slugs: ['dont-trust-verify'],
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

function bipBySlug(bips, slug) {
  return bips.find((b) => b.slug === slug);
}

function buildLlmsTxt(articles, bips) {
  const lines = [
    '# SecureSovereign (secsov.com)',
    '',
    '> Josh "Secure Sovereign" — Bitcoin builder, governance researcher, and Certified Bitcoin Professional (CBP). Long-form writing on Bitcoin Core governance capture, blockspace policy, consensus engineering, and monetary sovereignty. Bitcoin holder since 2010.',
    '',
    'This site publishes **long-form reference articles** and **BIP pre-proposals**, not a blog feed. The homepage (`https://secsov.com/`) contains author bio and disclosures — **article text lives at `/articles/{slug}`**, BIP text at `/bips/{slug}`. Fetch each URL below, or use `https://secsov.com/llms-full.txt` for all articles and BIP pre-proposals in one file.',
    '',
    '**URL patterns** (no trailing slash required; GitHub Pages may redirect):',
    '',
    '- HTML article: `https://secsov.com/articles/{slug}`',
    '- Markdown source: `https://secsov.com/articles/{slug}/index.md`',
    '- HTML BIP: `https://secsov.com/bips/{slug}`',
    '- BIP Markdown source: `https://secsov.com/bips/{slug}/index.md`',
    '- Bare slug redirect: `https://secsov.com/{slug}` → `/articles/{slug}` (via 404 handler)',
    '',
    '**Recommended reading order — blockspace cluster:**',
    '',
    '1. [Bitcoin Is Not a Hard Drive](https://secsov.com/articles/bitcoin-not-a-hard-drive) — why embedding is a category error',
    '2. [The Achievable Floor](https://secsov.com/articles/the-achievable-floor) — what consensus can technically close',
    '3. [Full Cost of Running a Bitcoin Node](https://secsov.com/articles/full-cost-of-running-a-bitcoin-node) — operator cost model and non-monetary burden',
    '4. [Static Per-Output Miner Fee](https://secsov.com/bips/static-per-output-miner-fee) — pre-proposal consensus fee floor on UTXO creation',
    '5. [Who Controls Bitcoin](https://secsov.com/articles/bitcoin-governance) — governance evidence (OP_RETURN arc, §V)',
    '6. [Argument Map Part XXII](https://secsov.com/articles/bitcoin-governance-argument-map#part-xxii-blockspace-governance-and-relay-policy-failure) — numbered blockspace arguments',
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
    if (section.bipSlugs) {
      for (const slug of section.bipSlugs) {
        const bip = bipBySlug(bips, slug);
        if (!bip) continue;
        const note = LLMS_BIP_NOTES[slug] || bip.description;
        lines.push(llmsLinkLine(bip.title, bipUrl(slug), note));
      }
    }
    lines.push('');
  }

  lines.push(
    '## Optional',
    '',
    llmsLinkLine('Sitemap', `${SITE}/sitemap.xml`, 'Machine-readable URL list for all pages.'),
    llmsLinkLine('robots.txt', `${SITE}/robots.txt`, 'Disallows /articles/*/index.md and /bips/*/index.md from crawlers; sitemap reference.'),
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

  for (const bip of bips) {
    lines.push(llmsLinkLine(
      `${bip.title} (Markdown source)`,
      `${SITE}/bips/${bip.slug}/index.md`,
      'BIP pre-proposal Markdown source; preferred for LLM ingestion over HTML.',
    ));
  }

  lines.push('');
  return lines.join('\n');
}

function buildLlmsFullTxt(articles, bips) {
  const parts = [
    '# SecureSovereign — Full Corpus',
    '',
    '> Concatenated Markdown sources from secsov.com (articles and BIP pre-proposals). Generated by build script. Index: https://secsov.com/llms.txt',
    '',
    '---',
    '',
    '# Articles',
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

  if (bips && bips.length) {
    parts.push('# BIP Pre-Proposals', '');
    for (const bip of bips) {
      const mdPath = bip.file
        ? path.join(ROOT, bip.file)
        : mdPathForBipSlug(bip.slug);
      const md = fs.readFileSync(mdPath, 'utf8');
      parts.push(
        `<!-- source: ${bipUrl(bip.slug)} -->`,
        '',
        md.trim(),
        '',
        '---',
        '',
      );
    }
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
        <span class="sep">/</span>
        <a href="/bips">BIPs</a>
    </nav>
    <div class="article-wrap">
        <h1>Page not found</h1>
        <p><a href="/">Home</a> · <a href="/articles">All articles</a> · <a href="/bips">BIPs</a></p>
    </div>
</body>
</html>
`;
}

function buildSitemap(articles, bips) {
  const entries = [
    { loc: `${SITE}/` },
    { loc: `${SITE}/articles` },
    { loc: `${SITE}/bips` },
    { loc: `${SITE}/llms.txt` },
    { loc: `${SITE}/llms-full.txt` },
  ];
  for (const a of articles) {
    const lastmod = a.updated || a.published;
    entries.push({ loc: articleUrl(a.slug), lastmod });
  }
  for (const b of bips) {
    const lastmod = b.updated || b.created;
    entries.push({ loc: bipUrl(b.slug), lastmod });
  }
  const body = entries.map(({ loc, lastmod }) => {
    const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
    return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function gitLastCommitDateIso(relativePath) {
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', relativePath],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return out || null;
  } catch (_) {
    return null;
  }
}

function applyGitUpdatedDates(articles) {
  let changed = false;
  for (const article of articles) {
    const mdPath = article.file
      ? path.join(ROOT, article.file)
      : mdPathForSlug(article.slug);
    if (!fs.existsSync(mdPath)) continue;
    const relPath = path.relative(ROOT, mdPath);
    const gitUpdated = gitLastCommitDateIso(relPath);
    if (!gitUpdated) continue;
    if (article.published && gitUpdated <= article.published) {
      if (article.updated) {
        delete article.updated;
        changed = true;
      }
      continue;
    }
    if (article.updated !== gitUpdated) {
      article.updated = gitUpdated;
      changed = true;
    }
  }
  return changed;
}

function loadBips() {
  const manifestPath = path.join(ROOT, 'bips.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return (manifest.bips || []).map((entry) => ({
    ...entry,
    slug: entry.slug || (entry.file ? fileToSlug(entry.file) : null),
  }));
}

function main() {
  const manifestPath = path.join(ROOT, 'articles.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const articles = (manifest.articles || []).map((entry) => ({
    ...entry,
    slug: entry.slug || (entry.file ? fileToSlug(entry.file) : null),
  }));
  const bips = loadBips();

  if (applyGitUpdatedDates(articles)) {
    manifest.articles = articles.map(({ slug, title, description, published, updated, originalUrl, file }) => {
      const entry = { slug, title };
      if (description) entry.description = description;
      if (published) entry.published = published;
      if (updated) entry.updated = updated;
      if (originalUrl) entry.originalUrl = originalUrl;
      if (file) entry.file = file;
      return entry;
    });
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log('Updated articles.json from git history');
  }

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
    const publishedMeta = article.published
      ? `\n    <meta property="article:published_time" content="${escapeHtml(article.published)}">`
      : '';
    const modifiedMeta = article.updated
      ? `\n    <meta property="article:modified_time" content="${escapeHtml(article.updated)}">`
      : '';
    const html = renderPage({
      title: article.title,
      description,
      url: articleUrl(article.slug),
      bodyHtml,
      metaBlock: articleMetaHtml(article),
      publishedMeta,
      modifiedMeta,
      jsonLd: articleJsonLd({
        title: article.title,
        description,
        url: articleUrl(article.slug),
        published: article.published,
        updated: article.updated,
      }),
    });
    const outDir = path.join(articlesRoot, article.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log('Wrote articles/' + article.slug + '/index.html');
  }

  fs.writeFileSync(path.join(articlesRoot, 'index.html'), renderArticlesIndex(articles));
  console.log('Wrote articles/index.html');

  const bipsRoot = path.join(ROOT, 'bips');
  fs.mkdirSync(bipsRoot, { recursive: true });

  for (const bip of bips) {
    if (!bip.slug) {
      console.error('Missing slug for BIP:', bip.title || bip);
      process.exit(1);
    }
    const mdPath = bip.file
      ? path.join(ROOT, bip.file)
      : mdPathForBipSlug(bip.slug);
    if (!fs.existsSync(mdPath)) {
      console.error('Missing:', mdPath);
      process.exit(1);
    }
    const md = fs.readFileSync(mdPath, 'utf8');
    const description = bip.description || extractDescription(md, bip.title);
    bip.description = description;
    let bodyHtml = marked.parse(renderMermaidBlocks(md));
    bodyHtml = addHeadingIds(bodyHtml);
    bodyHtml = wrapBipToc(bodyHtml);
    const bipDocTitle = `${bip.title} (BIP Pre-Proposal)`;
    const publishedMeta = bip.created
      ? `\n    <meta property="article:published_time" content="${escapeHtml(bip.created)}">`
      : '';
    const html = renderPage({
      title: bip.title,
      documentTitle: bipDocTitle,
      description,
      url: bipUrl(bip.slug),
      bodyHtml,
      metaBlock: bipMetaHtml(bip),
      publishedMeta,
      navParent: { href: '/bips', label: 'BIPs' },
      afterBody: bipRelatedFooterHtml(bip, bips),
      jsonLd: articleJsonLd({
        title: bipDocTitle,
        description,
        url: bipUrl(bip.slug),
        published: bip.created,
        updated: bip.created,
        kind: 'bip',
      }),
    });
    const outDir = path.join(bipsRoot, bip.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log('Wrote bips/' + bip.slug + '/index.html');
  }

  fs.writeFileSync(path.join(bipsRoot, 'index.html'), renderBipsIndex(bips));
  console.log('Wrote bips/index.html');

  fs.writeFileSync(path.join(ROOT, '404.html'), build404(articles));
  console.log('Wrote 404.html');

  fs.writeFileSync(path.join(ROOT, 'llms.txt'), buildLlmsTxt(articles, bips));
  console.log('Wrote llms.txt');

  fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), buildLlmsFullTxt(articles, bips));
  console.log('Wrote llms-full.txt');

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(articles, bips));
  console.log('Wrote sitemap.xml');

  patchHomepageWriting(articles);
  patchHomepageBips(bips);

  const robots = `User-agent: *
Disallow: /articles/*/index.md
Disallow: /bips/*/index.md

Sitemap: ${SITE}/sitemap.xml
# LLM index: ${SITE}/llms.txt
# Full corpus: ${SITE}/llms-full.txt
`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
  console.log('Wrote robots.txt');
}

main();
