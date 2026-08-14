(function () {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function fillInspect(atlas, el) {
    if (!el) return;
    const name = el.getAttribute('data-name') || '';
    const byte = Number(el.getAttribute('data-byte'));
    const v0 = el.getAttribute('data-v0');
    const tap = el.getAttribute('data-tap');
    const note = el.getAttribute('data-note') || '';
    const hex = '0x' + byte.toString(16).padStart(2, '0');
    const inspect = $('.oa-inspect', atlas);
    $('.oa-inspect-name', inspect).textContent = name;
    const same = v0 === tap;
    $('.oa-inspect-byte', inspect).textContent = same
      ? hex + ' · reads ' + v0 + ' (both kinds)'
      : hex + ' · V0 ' + v0 + ' · Tapscript ' + tap;
    const n = Number(v0);
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
    $all('.oa-cell, .oa-chip', atlas).forEach(function (node) {
      node.classList.toggle('is-active', node.getAttribute('data-byte') === String(byte));
    });
  }

  function bindAtlas(atlas) {
    atlas.addEventListener('click', function (ev) {
      const el = ev.target.closest('.oa-cell, .oa-chip');
      if (!el || !atlas.contains(el)) return;
      fillInspect(atlas, el);
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
