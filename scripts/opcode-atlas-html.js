'use strict';

/** Normative WITNESS_V0 stack_items_read for bytes 0x00–0xFF. */
const V0 = [
  ...Array(0x60).fill(0),
  0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 2, 2, 3,
  4, 6, 4, 1, 0, 1, 1, 2, 2, 1, 1, 3, 2, 2, 0, 0,
  0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 1,
  1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 3, 1, 1, 1, 1, 1, 0, 2, 2, 1, 1,
  0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ...Array(0x40).fill(0),
];

const TAP_OVERRIDE = { 0xae: 0, 0xaf: 0, 0xba: 3 };

const SUCCESS = new Set([
  0x50, 0x62,
  0x7e, 0x7f, 0x80, 0x81,
  0x83, 0x84, 0x85, 0x86,
  0x89, 0x8a,
  0x8d, 0x8e,
  0x95, 0x96, 0x97, 0x98, 0x99,
  ...Array.from({ length: 0xfe - 0xbb + 1 }, (_, i) => 0xbb + i),
]);

const NAMES = {
  0x00: 'OP_0',
  0x4c: 'OP_PUSHDATA1',
  0x4d: 'OP_PUSHDATA2',
  0x4e: 'OP_PUSHDATA4',
  0x4f: 'OP_1NEGATE',
  0x50: 'OP_RESERVED',
  0x61: 'OP_NOP',
  0x62: 'OP_VER',
  0x63: 'OP_IF',
  0x64: 'OP_NOTIF',
  0x65: 'OP_VERIF',
  0x66: 'OP_VERNOTIF',
  0x67: 'OP_ELSE',
  0x68: 'OP_ENDIF',
  0x69: 'OP_VERIFY',
  0x6a: 'OP_RETURN',
  0x6b: 'OP_TOALTSTACK',
  0x6c: 'OP_FROMALTSTACK',
  0x6d: 'OP_2DROP',
  0x6e: 'OP_2DUP',
  0x6f: 'OP_3DUP',
  0x70: 'OP_2OVER',
  0x71: 'OP_2ROT',
  0x72: 'OP_2SWAP',
  0x73: 'OP_IFDUP',
  0x74: 'OP_DEPTH',
  0x75: 'OP_DROP',
  0x76: 'OP_DUP',
  0x77: 'OP_NIP',
  0x78: 'OP_OVER',
  0x79: 'OP_PICK',
  0x7a: 'OP_ROLL',
  0x7b: 'OP_ROT',
  0x7c: 'OP_SWAP',
  0x7d: 'OP_TUCK',
  0x7e: 'OP_CAT',
  0x7f: 'OP_SUBSTR',
  0x80: 'OP_LEFT',
  0x81: 'OP_RIGHT',
  0x82: 'OP_SIZE',
  0x83: 'OP_INVERT',
  0x84: 'OP_AND',
  0x85: 'OP_OR',
  0x86: 'OP_XOR',
  0x87: 'OP_EQUAL',
  0x88: 'OP_EQUALVERIFY',
  0x89: 'OP_RESERVED1',
  0x8a: 'OP_RESERVED2',
  0x8b: 'OP_1ADD',
  0x8c: 'OP_1SUB',
  0x8d: 'OP_2MUL',
  0x8e: 'OP_2DIV',
  0x8f: 'OP_NEGATE',
  0x90: 'OP_ABS',
  0x91: 'OP_NOT',
  0x92: 'OP_0NOTEQUAL',
  0x93: 'OP_ADD',
  0x94: 'OP_SUB',
  0x95: 'OP_MUL',
  0x96: 'OP_DIV',
  0x97: 'OP_MOD',
  0x98: 'OP_LSHIFT',
  0x99: 'OP_RSHIFT',
  0x9a: 'OP_BOOLAND',
  0x9b: 'OP_BOOLOR',
  0x9c: 'OP_NUMEQUAL',
  0x9d: 'OP_NUMEQUALVERIFY',
  0x9e: 'OP_NUMNOTEQUAL',
  0x9f: 'OP_LESSTHAN',
  0xa0: 'OP_GREATERTHAN',
  0xa1: 'OP_LESSTHANOREQUAL',
  0xa2: 'OP_GREATERTHANOREQUAL',
  0xa3: 'OP_MIN',
  0xa4: 'OP_MAX',
  0xa5: 'OP_WITHIN',
  0xa6: 'OP_RIPEMD160',
  0xa7: 'OP_SHA1',
  0xa8: 'OP_SHA256',
  0xa9: 'OP_HASH160',
  0xaa: 'OP_HASH256',
  0xab: 'OP_CODESEPARATOR',
  0xac: 'OP_CHECKSIG',
  0xad: 'OP_CHECKSIGVERIFY',
  0xae: 'OP_CHECKMULTISIG',
  0xaf: 'OP_CHECKMULTISIGVERIFY',
  0xb0: 'OP_NOP1',
  0xb1: 'OP_CHECKLOCKTIMEVERIFY',
  0xb2: 'OP_CHECKSEQUENCEVERIFY',
  0xb3: 'OP_NOP4',
  0xb4: 'OP_NOP5',
  0xb5: 'OP_NOP6',
  0xb6: 'OP_NOP7',
  0xb7: 'OP_NOP8',
  0xb8: 'OP_NOP9',
  0xb9: 'OP_NOP10',
  0xba: 'OP_CHECKSIGADD',
  0xff: 'OP_INVALIDOPCODE',
};

for (let n = 1; n <= 75; n++) NAMES[n] = `OP_PUSHBYTES_${n}`;
for (let n = 1; n <= 16; n++) NAMES[0x50 + n] = `OP_${n}`;

const NOTES = {
  0x63: 'Pops when executed; static analysis uses 1',
  0x64: 'Same as OP_IF',
  0x6a: 'Fails without reading the stack',
  0x6c: 'Reads altstack only',
  0x74: 'Reads stack size, not an item',
  0x77: 'Erases second-to-top; top still required',
  0x79: 'Prefix: pops n. Then n+1 more. Min depth 2',
  0x7a: 'Same prefix as OP_PICK',
  0x7d: 'Not a SUCCESS byte',
  0x82: 'Inspects top; does not pop',
  0xab: 'Does not read the stack',
  0xae: 'Prefix: nKeys. Tapscript: 0 (CHECKMULTISIG disabled)',
  0xaf: 'Same as CHECKMULTISIG. Tapscript: 0',
  0xb1: 'Inspects top; does not pop',
  0xb2: 'Inspects top; does not pop',
  0xba: 'V0: BAD_OPCODE (0). Tapscript: 3',
};

const FAMILIES = [
  { id: 'control', label: 'Control', bytes: [0x63, 0x64, 0x67, 0x68, 0x69, 0x6a] },
  { id: 'stack', label: 'Stack', bytes: [0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d] },
  { id: 'splice', label: 'Splice', bytes: [0x82] },
  { id: 'bitwise', label: 'Bitwise / equal', bytes: [0x87, 0x88] },
  { id: 'numeric', label: 'Numeric', bytes: [0x8b, 0x8c, 0x8f, 0x90, 0x91, 0x92, 0x93, 0x94, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f, 0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5] },
  { id: 'crypto', label: 'Crypto', bytes: [0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xab, 0xac, 0xad, 0xae, 0xaf, 0xba] },
  { id: 'locktime', label: 'Locktime', bytes: [0xb1, 0xb2] },
];

const HEX = '0123456789ABCDEF';

function tapCount(byte) {
  if (Object.prototype.hasOwnProperty.call(TAP_OVERRIDE, byte)) return TAP_OVERRIDE[byte];
  return V0[byte];
}

function nameOf(byte) {
  if (NAMES[byte]) return NAMES[byte];
  if (SUCCESS.has(byte)) return 'OP_SUCCESS';
  return 'unknown';
}

function hexByte(byte) {
  return `0x${byte.toString(16).padStart(2, '0')}`;
}

function region(byte) {
  if (byte <= 0x4e || byte === 0x4f || (byte >= 0x51 && byte <= 0x60)) return 'push';
  if (SUCCESS.has(byte)) return 'success';
  return 'op';
}

function cellClass(kind, byte) {
  const n = kind === 'tap' ? tapCount(byte) : V0[byte];
  const bits = [`oa-n${n}`];
  const r = region(byte);
  if (r === 'push') bits.push('oa-push');
  if (r === 'success') bits.push('oa-success');
  if (V0[byte] !== tapCount(byte)) bits.push('oa-diff');
  if (n === 0 && r === 'op') bits.push('oa-dead');
  return bits.join(' ');
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function cellButton(kind, byte) {
  const n = kind === 'tap' ? tapCount(byte) : V0[byte];
  const name = nameOf(byte);
  const note = NOTES[byte] || '';
  const label = `${hexByte(byte)} ${name}, reads ${n}`;
  return `<button type="button" class="oa-cell ${cellClass(kind, byte)}" role="gridcell" data-byte="${byte}" data-kind="${kind}" data-name="${escapeAttr(name)}" data-v0="${V0[byte]}" data-tap="${tapCount(byte)}" data-note="${escapeAttr(note)}" data-region="${region(byte)}" title="${escapeAttr(label)}" aria-label="${escapeAttr(label)}">${n}</button>`;
}

function renderMap(kind, label) {
  const cols = HEX.split('').map((h) => `<div class="oa-colhead" aria-hidden="true">${h}</div>`).join('');
  const rows = [];
  for (let r = 0; r < 16; r++) {
    const cells = [];
    for (let c = 0; c < 16; c++) cells.push(cellButton(kind, (r << 4) | c));
    rows.push(`<div class="oa-rowhead" aria-hidden="true">${HEX[r]}_</div>${cells.join('')}`);
  }
  return `<div class="oa-map-wrap" data-kind="${kind}">
    <h4 class="oa-map-title">${label}</h4>
    <div class="oa-map-scroll">
      <div class="oa-map" role="grid" aria-label="${label} stack_items_read">${'<div class="oa-corner" aria-hidden="true"></div>'}${cols}${rows.join('')}</div>
    </div>
  </div>`;
}

function chip(byte) {
  const v0 = V0[byte];
  const tap = tapCount(byte);
  const count = v0 === tap ? String(v0) : `${v0}/${tap}`;
  const name = nameOf(byte);
  const note = NOTES[byte] || '';
  const cls = v0 === 0 && tap === 0 ? 'oa-chip oa-chip-zero' : 'oa-chip';
  const diff = v0 !== tap ? ' oa-chip-diff' : '';
  return `<button type="button" class="${cls}${diff}" data-byte="${byte}" data-name="${escapeAttr(name)}" data-v0="${v0}" data-tap="${tap}" data-note="${escapeAttr(note)}" data-region="${region(byte)}" title="${escapeAttr(hexByte(byte))}">
    <span class="oa-chip-name">${name.replace(/^OP_/, '')}</span>
    <span class="oa-chip-count">${count}</span>
  </button>`;
}

function familyBlock(fam) {
  return `<div class="oa-family">
    <h4 class="oa-family-label">${fam.label}</h4>
    <div class="oa-chips">${fam.bytes.map(chip).join('')}</div>
  </div>`;
}

function generateOpcodeAtlasHtml() {
  const slots = Array.from({ length: 6 }, (_, i) => `<span class="oa-slot" data-i="${5 - i}"></span>`).join('');
  return `<figure class="opcode-atlas" data-kind="v0">
  <div class="oa-toolbar">
    <p class="oa-lede"><strong>Dark cell = 0.</strong> A push immediately before that opcode is unreferenced. <strong>Bright cell = n ≥ 1.</strong> The preceding push is consumed. Byte <code>0xRF</code> sits at row <code>R</code>, column <code>F</code>.</p>
    <label class="oa-search-wrap"><span class="oa-search-label">Find</span><input type="search" class="oa-search" placeholder="OP_ENDIF, 0x68, drop…" autocomplete="off" enterkeyhint="search"></label>
  </div>
  <div class="oa-kind" role="tablist" aria-label="Script kind">
    <button type="button" class="oa-kind-btn is-on" role="tab" aria-selected="true" data-kind="v0">WITNESS_V0</button>
    <button type="button" class="oa-kind-btn" role="tab" aria-selected="false" data-kind="tap">TAPSCRIPT</button>
  </div>
  <div class="oa-legend" aria-hidden="true">
    <span class="oa-key oa-n0 oa-push">push</span>
    <span class="oa-key oa-n0 oa-dead">reads 0</span>
    <span class="oa-key oa-n1">1</span>
    <span class="oa-key oa-n2">2</span>
    <span class="oa-key oa-n3">3</span>
    <span class="oa-key oa-n4">4</span>
    <span class="oa-key oa-n6">6</span>
    <span class="oa-key oa-success">SUCCESS</span>
    <span class="oa-key oa-diff">V0 ≠ Tap</span>
  </div>
  <div class="oa-inspect">
    <div class="oa-inspect-head">
      <p class="oa-inspect-name">Select an opcode</p>
      <p class="oa-inspect-byte">Tap a map cell or a named chip.</p>
    </div>
    <div class="oa-stack" aria-hidden="true">${slots}<span class="oa-stack-label">top</span></div>
    <p class="oa-inspect-rule">Color is the data-independent prefix <code>EvalScript</code> always requires from the top of the main stack.</p>
    <p class="oa-inspect-note" hidden></p>
  </div>
  <div class="oa-maps">
    ${renderMap('v0', 'WITNESS_V0 · Rule 12')}
    ${renderMap('tap', 'TAPSCRIPT · Rule 10')}
  </div>
  <div class="oa-traces">
    <h4 class="oa-traces-title">Worked next-opcode tests</h4>
    <div class="oa-trace">
      <span class="oa-trace-label">envelope · invalid</span>
      <span class="oa-tok oa-tok-push">OP_FALSE</span>
      <span class="oa-tok oa-tok-read">OP_IF <small>1</small></span>
      <span class="oa-tok oa-tok-push">&lt;jpeg&gt;</span>
      <span class="oa-tok oa-tok-dead">OP_ENDIF <small>0</small></span>
      <span class="oa-trace-why">jpeg is followed by ENDIF</span>
    </div>
    <div class="oa-trace">
      <span class="oa-trace-label">dump · referenced, then capped</span>
      <span class="oa-tok oa-tok-push">&lt;jpeg&gt;</span>
      <span class="oa-tok oa-tok-read">OP_DROP <small>1</small></span>
      <span class="oa-trace-why">Rule 11 / 13 cap PUSH/DROP</span>
    </div>
    <div class="oa-trace">
      <span class="oa-trace-label">multisig · valid</span>
      <span class="oa-tok oa-tok-push">OP_2</span>
      <span class="oa-tok oa-tok-push">&lt;k1&gt;</span>
      <span class="oa-tok oa-tok-push">&lt;k2&gt;</span>
      <span class="oa-tok oa-tok-push">OP_3</span>
      <span class="oa-tok oa-tok-read">CHECKMULTISIG <small>1</small></span>
      <span class="oa-trace-why">consecutive pushes are not dead</span>
    </div>
  </div>
  <div class="oa-named">
    <h4 class="oa-named-title">Named opcodes</h4>
    <p class="oa-named-lede">Spec callouts: every <code>≥ 1</code> consumer, plus zeros that are easy to get wrong. Chip count is V0, or <code>V0/Tap</code> when they differ.</p>
    ${FAMILIES.map(familyBlock).join('')}
  </div>
</figure>
`;
}

function renderOpcodeAtlasBlocks(md) {
  return md.replace(/```opcode-atlas\s*```/g, () => generateOpcodeAtlasHtml());
}

module.exports = {
  V0,
  tapCount,
  renderOpcodeAtlasBlocks,
  generateOpcodeAtlasHtml,
};
