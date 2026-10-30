(function (TD) {
'use strict';
const { parseFormula, parseDeg, spell, noteToTonic, accStr } = TD['theory.js'];
const { runDeal, deckPool, rangePool } = TD['deal.js'];
const { chordMidis, voiceLead } = TD['sound.js'];

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MAJOR_SEMIS = [0, 2, 4, 5, 7, 9, 11];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const CHROMATIC_DEGS = ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];
const CHROMATIC_ROMAN = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♭V', 'V', '♭VI', 'VI', '♭VII', 'VII'];
const TRIAD_Q = { '4,7': '', '3,7': 'm', '3,6': '°', '4,8': '+' };
const SEVENTH_Q = { '4,7,11': 'maj7', '4,7,10': '7', '3,7,10': 'm7', '3,6,10': 'ø7', '3,6,9': '°7', '3,7,11': 'm(maj7)', '4,8,11': '+maj7', '4,8,10': '+7' };

const SCALES = {
  major: ['Major', '1–2–3–4–5–6–7'],
  minor: ['Natural minor', '1–2–♭3–4–5–♭6–♭7'],
  dorian: ['Dorian', '1–2–♭3–4–5–6–♭7'],
  mixolydian: ['Mixolydian', '1–2–3–4–5–6–♭7'],
  harmonic: ['Harmonic minor', '1–2–♭3–4–5–♭6–7'],
  lydian: ['Lydian', '1–2–3–♯4–5–6–7'],
};

function fib(count) {
  const out = [0, 1];
  while (out.length < count) out.push(out[out.length - 1] + out[out.length - 2]);
  return out.slice(0, count);
}

// Diatonic chord built on scale step i (stacked 3rds inside the scale)
function diatonicChord(tonic, scaleDegs, semis, i, sevenths) {
  const up = (k) => (semis[(i + k) % 7] - semis[i] + 12) % 12;
  const key = sevenths ? [up(2), up(4), up(6)].join(',') : [up(2), up(4)].join(',');
  const table = sevenths ? SEVENTH_Q : TRIAD_Q;
  const q = key in table ? table[key] : '';
  const acc = semis[i] - MAJOR_SEMIS[i];
  const minorish = /^m|°|ø/.test(q) && !/^maj/.test(q);
  const numeral = accStr(acc) + (minorish ? ROMAN[i].toLowerCase() : ROMAN[i]) + (q === '°' ? '°' : q === '+' ? '+' : sevenths ? q.replace(/^m(?!aj)/, '') : '');
  const rootPc = semis[i];
  return { name: spell(tonic, scaleDegs[i]) + q, numeral, rootPc };
}

const GAMES = [
  { id: 'major-triads', name: 'Fibonacci · Major Triads', scale: 'major', mod: 7, length: 8 },
  { id: 'major-sevenths', name: 'Fibonacci · Major 7th Chords', scale: 'major', mod: 7, length: 8, sevenths: true },
  { id: 'minor-triads', name: 'Fibonacci · Minor Triads', scale: 'minor', mod: 7, length: 8 },
  { id: 'minor-sevenths', name: 'Fibonacci · Minor 7th Chords', scale: 'minor', mod: 7, length: 8, sevenths: true },
  { id: 'dorian', name: 'Fibonacci · Dorian', scale: 'dorian', mod: 7, length: 8 },
  { id: 'mixolydian', name: 'Fibonacci · Mixolydian', scale: 'mixolydian', mod: 7, length: 8, sevenths: true },
  { id: 'harmonic', name: 'Fibonacci · Harmonic Minor', scale: 'harmonic', mod: 7, length: 8 },
  { id: 'chromatic', name: 'Fibonacci · Chromatic Roots (mod 12)', scale: 'major', mod: 12, length: 8 },
  { id: 'rhythm', name: 'Fibonacci · Golden Rhythm (1-1-2-3-5 beats)', scale: 'lydian', mod: 7, length: 5, rhythm: true },
  { id: 'pisano', name: 'Fibonacci · Pisano Cycle (16 chords)', scale: 'major', mod: 7, length: 16, pisano: true },
].map(spec => ({ ...spec, id: 'fib-' + spec.id, desc: describe(spec) }));

function describe(spec) {
  const scale = SCALES[spec.scale][0].toLowerCase();
  if (spec.mod === 12) return 'Fibonacci numbers mod 12 pick chromatic roots above the key; odd terms give major chords, even terms minor.';
  if (spec.rhythm) return 'Five Fibonacci terms mod 7 choose ' + scale + ' chords, held for 1, 1, 2, 3 and 5 beats (12 beats = 3 bars).';
  if (spec.pisano) return 'The full Pisano period of 7: Fibonacci mod 7 repeats every 16 terms, giving a 16-chord loop that returns home.';
  return 'Consecutive Fibonacci numbers mod 7 choose scale degrees; each becomes a diatonic ' + (spec.sevenths ? '7th chord' : 'triad') + ' in the ' + scale + ' scale.';
}

function majorKeys(decks) {
  const deck = decks.find(item => item.id === 'keys');
  return { ...deck, cards: deck.cards.filter(card => card.sub === 'Major key') };
}

function build(spec, key, start) {
  const tonicName = key.tonicName;
  const tonic = noteToTonic(tonicName);
  const [scaleName, formula] = SCALES[spec.scale];
  const degs = parseFormula(formula);
  const semis = degs.map(d => ((MAJOR_SEMIS[d.n - 1] + d.acc) % 12 + 12) % 12);
  const terms = spec.pisano ? fib(16) : fib(start + spec.length).slice(start);
  const chords = terms.map(term => {
    if (spec.mod === 12) {
      const pc = term % 12;
      const q = term % 2 ? '' : 'm';
      return { name: spell(tonic, parseDeg(CHROMATIC_DEGS[pc])) + q, numeral: q ? CHROMATIC_ROMAN[pc].toLowerCase() : CHROMATIC_ROMAN[pc], rootPc: pc };
    }
    return diatonicChord(tonic, degs, semis, term % 7, spec.sevenths);
  });
  const beats = spec.rhythm ? [1, 1, 2, 3, 5] : null;
  const tonicLabel = tonicName + ' ' + (spec.mod === 12 ? 'major' : scaleName.toLowerCase());
  return { terms, chords, beats, tonicLabel, keyFreq: key.freq };
}

// Pisano period: Fibonacci numbers mod m repeat with this period, so these are all the distinct deals
function pisano(m) {
  let a = 0, b = 1;
  for (let i = 1; i <= m * 6; i++) { [a, b] = [b, (a + b) % m]; if (a === 0 && b === 1) return i; }
  return m * 6;
}

function renderFibonacciGame(root, options, spec) {
  const { decks } = options;
  const keyDeck = majorKeys(decks);
  const fibDeck = { id: 'fibonacci', name: 'Fibonacci', hue: 45 };
  const progDeck = { id: 'fibprog', name: spec.name.replace('Fibonacci · ', ''), hue: 30 };
  const period = pisano(spec.mod);
  const pools = { key: deckPool(keyDeck) };
  if (!spec.pisano) pools.start = rangePool(period, (i) => 'Start at F' + i + ' (' + fib(i + 1)[i] + ')');
  runDeal(root, options, {
    pools,
    build(sel) {
      const start = spec.pisano ? 0 : sel.start;
      const key = keyDeck.cards[sel.key];
      const p = build(spec, key, start);
      const names = p.chords.map(c => c.name);
      const numerals = p.chords.map(c => c.numeral);
      const progCard = {
        title: numerals.slice(0, 4).join('–') + (numerals.length > 4 ? '…' : ''),
        sub: p.tonicLabel,
        rows: [['Chords', names.join('–')], ['Numerals', numerals.join('–')], ...(p.beats ? [['Beats', p.beats.join('-')]] : []), ['Length', String(names.length)]],
        desc: spec.desc,
        base0: p.chords.map(c => c.rootPc).join('-'),
        soundEvents: voiceLead(names.map(chordMidis).filter(Boolean)) || [],
        soundProgression: true,
      };
      const fibCard = {
        title: spec.pisano ? 'F0–F15' : 'F' + start + '–F' + (start + spec.length - 1),
        sub: 'mod ' + spec.mod,
        rows: [['Terms', p.terms.join(' ')], ['mod ' + spec.mod, p.terms.map(t => t % spec.mod).join(' ')], ['Pisano period', String(period)]],
        desc: 'Each Fibonacci number is the sum of the two before it. Reduced mod ' + spec.mod + ', the terms index ' + (spec.mod === 12 ? 'semitones above the key.' : 'the seven scale degrees (0 = tonic).') + ' The residues repeat every ' + period + ' terms, so every distinct start is dealt before any repeats.',
        base0: p.terms.map(t => t % spec.mod).join('-'),
      };
      return {
        className: 'deal three',
        slots: [
          { card: key, index: sel.key, deck: keyDeck, label: 'New key', pool: 'key' },
          { card: progCard, index: start, deck: progDeck, label: spec.pisano ? 'Pisano loop' : 'New progression', pool: spec.pisano ? null : 'start' },
          { card: fibCard, index: start, deck: fibDeck, label: 'Fibonacci terms' },
        ],
        brief: '<div class="line"><span>Key</span><b>' + esc(p.tonicLabel) + '</b></div>' +
          '<div class="line"><span>Fibonacci mod ' + spec.mod + '</span><b>' + esc(p.terms.map(t => t % spec.mod).join(' ')) + '</b></div>' +
          '<div class="chords">' + p.chords.map((c, i) => '<i>' + esc(c.name) + (p.beats ? '<small> ×' + p.beats[i] + '</small>' : '') + '</i>').join('') + '</div>' +
          '<div class="line"><span>Numerals</span><b>' + esc(numerals.join('–')) + '</b></div>',
      };
    },
  });
}

const FIB_GAMES = GAMES.map(spec => ({
  id: spec.id,
  name: spec.name,
  hue: 45,
  details: spec.desc,
  meta: { kind: 'fib', spec },
  game: (root, options) => renderFibonacciGame(root, options, spec),
}));
TD['fibonacci.js'] = { FIB_GAMES, buildFibProgression: build, pisano };
})(window.TD = window.TD || {});
