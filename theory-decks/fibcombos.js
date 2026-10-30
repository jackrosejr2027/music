(function (TD) {
'use strict';
const { parseFormula, spell, noteToTonic, pcOf } = TD['theory.js'];
const { runDeal, deckPool, rangePool } = TD['deal.js'];
const { shiftTo } = TD['sound.js'];

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MAJOR_SEMIS = [0, 2, 4, 5, 7, 9, 11];
const IV_NAMES = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];

const FAMILIES = [
  { id: 'major', name: 'Major Modes', hue: 285, modes: [
    ['Ionian', '1–2–3–4–5–6–7'], ['Dorian', '1–2–♭3–4–5–6–♭7'], ['Phrygian', '1–♭2–♭3–4–5–♭6–♭7'],
    ['Lydian', '1–2–3–♯4–5–6–7'], ['Mixolydian', '1–2–3–4–5–6–♭7'], ['Aeolian', '1–2–♭3–4–5–♭6–♭7'],
    ['Locrian', '1–♭2–♭3–4–♭5–♭6–♭7'],
  ] },
  { id: 'penta', name: 'Pentatonic Modes', hue: 180, modes: [
    ['Major Pentatonic', '1–2–3–5–6'], ['Suspended Pentatonic', '1–2–4–5–♭7'], ['Blues Minor (Man Gong)', '1–♭3–4–♭6–♭7'],
    ['Blues Major (Ritusen)', '1–2–4–5–6'], ['Minor Pentatonic', '1–♭3–4–5–♭7'],
  ] },
  { id: 'hirajoshi', name: 'Hirajoshi Modes', hue: 345, modes: [
    ['Hirajoshi', '1–2–♭3–5–♭6'], ['Iwato (Hirajoshi mode 2)', '1–♭2–4–♭5–♭7'], ['Hirajoshi mode 3', '1–3–4–6–7'],
    ['In / Sakura (Hirajoshi mode 4)', '1–♭2–4–5–♭6'], ['Hirajoshi mode 5', '1–3–♯4–5–7'],
  ] },
];

const SIZES = [[2, 'Intervals'], [3, 'Triads'], [4, '4-Tone'], [5, '5-Tone'], [6, '6-Tone']];
const METHODS = [
  ['walk', 'Walk', 'Consecutive Fibonacci numbers, reduced across two octaves of the mode, pick each new note (repeats are skipped). Play them in the order dealt.'],
  ['steps', 'Steps', 'Fibonacci numbers are used as step sizes: each note moves up the mode by the next Fibonacci number, wrapping within two octaves.'],
  ['skip', 'Golden Skip', 'Every other Fibonacci number picks the notes, which are then stacked from low to high as a chord or arpeggio.'],
  ['rhythm', 'Rhythm', 'A Fibonacci walk where each note is held for 1, 1, 2, 3, 5 and 8 beats.'],
];
const BEATS = [1, 1, 2, 3, 5, 8];

// Fibonacci F(i) exactly, as a decimal string (floating point loses precision past F(78)); Fm = F(i) mod m.
// Plain string and modular arithmetic — no BigInt, so older browsers (Safari 13 and earlier) load the games too.
const addDec = (a, b) => { let out = '', carry = 0; for (let i = a.length - 1, j = b.length - 1; i >= 0 || j >= 0 || carry; i--, j--) { const s = (i >= 0 ? +a[i] : 0) + (j >= 0 ? +b[j] : 0) + carry; out = (s % 10) + out; carry = s >= 10 ? 1 : 0; } return out; };
const fibCache = ['0', '1'];
function F(i) { while (fibCache.length <= i) fibCache.push(addDec(fibCache[fibCache.length - 1], fibCache[fibCache.length - 2])); return fibCache[i]; }
function Fm(i, m) { let a = 0, b = 1 % m; for (let k = 0; k < i; k++) { const t = (a + b) % m; a = b; b = t; } return a; }

function choose(method, start, size, span) {
  const picked = [], used = [];
  const add = (pos, idx) => { if (!picked.includes(pos)) { picked.push(pos); used.push(idx); } };
  if (method === 'steps') {
    let pos = Fm(start, span);
    add(pos, start);
    for (let i = 1; picked.length < size && i < 60; i++) { pos = (pos + Fm(start + i, span)) % span; add(pos, start + i); }
  } else {
    const stride = method === 'skip' ? 2 : 1;
    for (let i = 0; picked.length < size && i < 60; i++) add(Fm(start + i * stride, span), start + i * stride);
  }
  for (let p = 0; picked.length < size && p < span; p++) add(p, null); // fallback if a residue cycle runs short
  const order = picked.map((pos, i) => ({ pos, idx: used[i] }));
  if (method === 'skip') order.sort((a, b) => a.pos - b.pos);
  return order;
}

function build(family, modeIndex, method, size, tonic, start) {
  const [modeName, formula] = family.modes[modeIndex];
  const degs = parseFormula(formula);
  const n = degs.length;
  const semis = degs.map(d => ((MAJOR_SEMIS[d.n - 1] + d.acc) % 12 + 12) % 12);
  const order = choose(method, start, size, n * 2);
  const notes = order.map(({ pos, idx }) => {
    const d = degs[pos % n];
    const up = pos >= n;
    const label = (d.acc > 0 ? '♯'.repeat(d.acc) : '♭'.repeat(-d.acc)) + (d.n + (up ? 7 : 0));
    return { name: spell(tonic, d) + (up ? '↑' : ''), degree: label, semis: semis[pos % n] + (up ? 12 : 0), idx };
  });
  return { modeName, formula, degs, notes };
}

function renderCombo(root, options, family, method, size, sizeName) {
  const { decks } = options;
  const keyBase = decks.find(d => d.id === 'keys');
  const keyDeck = { ...keyBase, cards: keyBase.cards.filter(card => card.sub === 'Major key') };
  const modeDeck = { id: 'fibmode', name: family.name, hue: family.hue };
  const comboDeck = { id: 'fibcombo', name: sizeName + ' · ' + method[1], hue: 45 };
  const fibDeck = { id: 'fibonacci', name: 'Fibonacci', hue: 45 };
  // Every start in one Pisano period of the two-octave span gives a distinct walk
  const period = TD['fibonacci.js'].pisano(family.modes[0][1].split('–').length * 2);
  runDeal(root, options, {
    pools: {
      key: deckPool(keyDeck),
      mode: rangePool(family.modes.length, (i) => family.modes[i][0]),
      start: rangePool(period, (i) => 'Start at F' + i),
    },
    build(sel) {
      const key = keyDeck.cards[sel.key];
      const tonic = noteToTonic(key.tonicName);
      const p = build(family, sel.mode, method[0], size, tonic, sel.start);
      const names = p.notes.map(x => x.name);
      const degrees = p.notes.map(x => x.degree);
      const rows = [['Notes', names.join(' ')], ['Degrees', degrees.join(' ')]];
      if (size === 2) {
        const diff = Math.abs(p.notes[1].semis - p.notes[0].semis);
        rows.push(['Interval', IV_NAMES[diff % 12] + (diff >= 12 ? ' + octave' : '') + ' · ' + diff + ' semitones']);
      }
      if (method[0] === 'rhythm') rows.push(['Beats', BEATS.slice(0, size).join('-')]);
      const shift = shiftTo(pcOf(tonic.l, tonic.acc), 'modes');
      const modeSemis = p.degs.map(d => ((MAJOR_SEMIS[d.n - 1] + d.acc) % 12 + 12) % 12);
      const modeCard = {
        title: p.modeName, sub: p.formula,
        rows: [['In ' + key.tonicName, p.degs.map(d => spell(tonic, d)).join(' ')], ['Family', family.name]],
        desc: 'Mode ' + (sel.mode + 1) + ' of ' + family.modes.length + ' in the ' + family.name.toLowerCase() + '.',
        base0: modeSemis.join('-'),
        soundEvents: [modeSemis.map(x => 60 + shift + x)],
      };
      const comboCard = {
        title: names.join(' '), sub: degrees.join(' '), rows, desc: method[2],
        base0: p.notes.map(x => x.semis).join('-'),
        soundEvents: [p.notes.map(x => 60 + shift + x.semis)],
      };
      const used = p.notes.filter(x => x.idx !== null);
      const span = p.degs.length * 2;
      const fibCard = {
        title: 'F' + sel.start + '…', sub: 'mod ' + span,
        rows: [['Terms', used.map(x => 'F' + x.idx + '=' + F(x.idx)).join(' ')], ['Span', 'Two octaves (' + span + ' positions)'], ['Pisano period', String(period)]],
        desc: 'Each Fibonacci number is the sum of the two before it. Reduced mod ' + span + ', each one points to a note across two octaves of the mode (↑ = upper octave).',
        base0: used.map(x => Fm(x.idx, span)).join('-'),
      };
      return {
        className: 'deal',
        slots: [
          { card: key, index: sel.key, deck: keyDeck, label: 'New key', pool: 'key' },
          { card: modeCard, index: sel.mode, deck: modeDeck, label: 'New mode', pool: 'mode' },
          { card: comboCard, index: sel.start, deck: comboDeck, label: 'New ' + sizeName.toLowerCase().replace(/s$/, ''), pool: 'start' },
          { card: fibCard, index: sel.start, deck: fibDeck, label: 'Fibonacci terms' },
        ],
        brief: '<div class="line"><span>Key</span><b>' + esc(key.tonicName + ' ' + p.modeName) + '</b></div>' +
          '<div class="chords">' + p.notes.map((x, i) => '<i>' + esc(x.name) + (method[0] === 'rhythm' ? '<small> ×' + BEATS[i] + '</small>' : '') + '</i>').join('') + '</div>' +
          '<div class="line"><span>Degrees</span><b>' + esc(degrees.join(' ')) + '</b></div>',
      };
    },
  });
}

const FIB_COMBO_GAMES = [];
FAMILIES.forEach(family => SIZES.forEach(([size, sizeName]) => METHODS.forEach(method => {
  FIB_COMBO_GAMES.push({
    id: 'fibc-' + family.id + '-' + size + '-' + method[0],
    name: 'Fibonacci · ' + family.name + ' · ' + sizeName + ' · ' + method[1],
    hue: family.hue,
    family: family.name,
    meta: { kind: 'fibcombo', family, method, size, sizeName },
    details: sizeName + ' (' + size + ' notes) from a dealt mode of the ' + family.name.toLowerCase() + '. ' + method[2],
    game: (root, options) => renderCombo(root, options, family, method, size, sizeName),
  });
})));
TD['fibcombos.js'] = { FIB_COMBO_GAMES, buildFibCombo: build, FIB_BEATS: BEATS };
})(window.TD = window.TD || {});
