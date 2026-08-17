(function () {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function kindOf(el, atlas) {
    return el.getAttribute('data-kind') || atlas.getAttribute('data-kind') || 'v0';
  }

  function setKind(atlas, kind) {
    atlas.setAttribute('data-kind', kind);
    $all('.oa-kind-btn', atlas).forEach(function (btn) {
      const on = btn.getAttribute('data-kind') === kind;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function fillInspect(atlas, el) {
    if (!el) return;
    const name = el.getAttribute('data-name') || '';
    const byte = String(el.getAttribute('data-byte'));
    const v0 = el.getAttribute('data-v0');
    const tap = el.getAttribute('data-tap');
    const note = el.getAttribute('data-note') || '';
    const kind = kindOf(el, atlas);
    const n = Number(kind === 'tap' ? tap : v0);
    const hex = '0x' + Number(byte).toString(16).padStart(2, '0');
    const inspect = $('.oa-inspect', atlas);
    const kindLabel = kind === 'tap' ? 'Tapscript' : 'WITNESS_V0';

    setKind(atlas, kind);
    $('.oa-inspect-name', inspect).textContent = name;
    $('.oa-inspect-byte', inspect).textContent =
      hex + ' · ' + kindLabel + ' reads ' + n + (v0 === tap ? '' : '  (V0 ' + v0 + ' · Tap ' + tap + ')');

    const rule = $('.oa-inspect-rule', inspect);
    if (n === 0) {
      rule.textContent = 'Reads nothing. A push immediately before this opcode is unreferenced.';
    } else {
      rule.textContent = 'Reads ' + n + ' item' + (n === 1 ? '' : 's') + ' from the top. A push immediately before this opcode is referenced.';
    }

    const noteEl = $('.oa-inspect-note', inspect);
    if (note) {
      noteEl.hidden = false;
      noteEl.textContent = note;
    } else {
      noteEl.hidden = true;
      noteEl.textContent = '';
    }

    $all('.oa-slot', inspect).forEach(function (slot) {
      const i = Number(slot.getAttribute('data-i'));
      slot.classList.toggle('is-on', i < n);
    });

    $all('.oa-cell', atlas).forEach(function (node) {
      const same = node.getAttribute('data-byte') === byte;
      const here = node.getAttribute('data-kind') === kind;
      node.classList.toggle('is-active', same && here);
      node.classList.toggle('is-peer', same && !here);
      node.setAttribute('aria-pressed', same && here ? 'true' : 'false');
    });
    $all('.oa-chip', atlas).forEach(function (node) {
      node.classList.toggle('is-active', node.getAttribute('data-byte') === byte);
    });
  }

  function bindAtlas(atlas) {
    const SLOP = 12;
    let lastPtr = 0;
    let startX = 0;
    let startY = 0;
    let startEl = null;
    let moved = false;

    function targetEl(ev) {
      const el = ev.target.closest('.oa-cell, .oa-chip');
      if (!el || !atlas.contains(el)) return null;
      return el;
    }

    function revealInspect() {
      const inspect = $('.oa-inspect', atlas);
      if (!inspect || typeof inspect.scrollIntoView !== 'function') return;
      inspect.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    function select(el) {
      lastPtr = Date.now();
      fillInspect(atlas, el);
      revealInspect();
    }

    atlas.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      startEl = targetEl(ev);
      startX = ev.clientX;
      startY = ev.clientY;
      moved = false;
    });

    atlas.addEventListener('pointermove', function (ev) {
      if (!startEl) return;
      if (Math.abs(ev.clientX - startX) > SLOP || Math.abs(ev.clientY - startY) > SLOP) {
        moved = true;
      }
    });

    atlas.addEventListener('pointercancel', function () {
      startEl = null;
      moved = true;
    });

    atlas.addEventListener('pointerup', function (ev) {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      const el = targetEl(ev);
      const from = startEl;
      const wasMoved = moved;
      startEl = null;
      if (wasMoved) {
        lastPtr = Date.now();
        return;
      }
      if (!el || el !== from) return;
      ev.preventDefault();
      select(el);
    });

    atlas.addEventListener('click', function (ev) {
      if (Date.now() - lastPtr < 400) {
        ev.preventDefault();
        return;
      }
      const el = targetEl(ev);
      if (!el) return;
      ev.preventDefault();
      select(el);
    });

    $all('.oa-kind-btn', atlas).forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        const kind = btn.getAttribute('data-kind');
        setKind(atlas, kind);
        const active = $('.oa-cell.is-active, .oa-chip.is-active', atlas);
        if (active) {
          const cell = $('.oa-cell[data-kind="' + kind + '"][data-byte="' + active.getAttribute('data-byte') + '"]', atlas);
          fillInspect(atlas, cell || active);
        }
      });
    });

    const search = $('.oa-search', atlas);
    if (!search) return;
    search.addEventListener('input', function () {
      const q = search.value.trim().toLowerCase().replace(/^op_/, '');
      $all('.oa-cell', atlas).forEach(function (cell) {
        if (!q) {
          cell.classList.remove('is-dim');
          return;
        }
        const hay = [
          cell.getAttribute('data-name') || '',
          cell.getAttribute('data-byte') || '',
          '0x' + Number(cell.getAttribute('data-byte')).toString(16),
        ].join(' ').toLowerCase();
        cell.classList.toggle('is-dim', hay.indexOf(q) === -1 && hay.replace(/^op_/, '').indexOf(q) === -1);
      });
      $all('.oa-chip', atlas).forEach(function (chip) {
        if (!q) {
          chip.classList.remove('is-hidden');
          return;
        }
        const hay = ((chip.getAttribute('data-name') || '') + ' ' + chip.getAttribute('data-byte')).toLowerCase();
        chip.classList.toggle('is-hidden', hay.indexOf(q) === -1 && hay.replace(/op_/, '').indexOf(q) === -1);
      });
    });
  }

  document.querySelectorAll('.opcode-atlas').forEach(bindAtlas);
})();
