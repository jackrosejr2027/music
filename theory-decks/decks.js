(function (TD) {
'use strict';
// Card data is read only when a deck is first opened (data files register lazy factories)
const data = (name) => TD['data/' + name + '.js'];
const { parseFormula, spell, ascending, steps, shape, describe, noteToTonic, pcOf } = TD['theory.js'];

const C = { l: 0, acc: 0 };
const MODE_NAMES = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];

function scaleCard(formula, name, group) {
  const degs = parseFormula(formula);
  const notes = degs.map(d => spell(C, d));
  const p = ascending(degs);
  return {
    title: name, sub: formula, group,
    rows: [['Notes', notes.join(' ')], ['Steps', steps(p)], ['Shape', shape(p)], ['Tones', String(new Set(p.map(v => v % 12)).size)]],
    desc: describe(p, notes[0]),
    allKeysLabel: name + ' in all 12 keys',
    transpose: (r) => degs.map(d => spell(r, d)).join(' '),
  };
}

const rows = (txt) => txt.trim().split('\n').map(l => l.split('|').map(s => s.trim()));
const NAT = [0, 2, 4, 5, 7, 9, 11];
const tok = (n, acc) => (acc > 0 ? '♯'.repeat(acc) : '♭'.repeat(-acc)) + n;

// Rotation k of a scale: start on its (k+1)th note and re-measure every degree from there
function rotateFormula(formula, k) {
  const degs = parseFormula(formula).map(d => {
    const n = ((d.n - 1) % 7) + 1;
    return { n, semis: ((NAT[n - 1] + d.acc) % 12 + 12) % 12 };
  });
  const start = degs[k];
  return [...degs.slice(k), ...degs.slice(0, k)].map(d => {
    const n = ((d.n - start.n + 7) % 7) + 1;
    const semis = (d.semis - start.semis + 12) % 12;
    const acc = ((semis - NAT[n - 1]) + 18) % 12 - 6;
    return tok(n, acc);
  }).join('–');
}

function withRotations(cards, formulas) {
  const out = cards.map(card => ({ ...card, group: card.group || 'Original' }));
  [1, 2].forEach(k => formulas.forEach(([f, n]) => {
    if (parseFormula(f).length <= k) return;
    const card = scaleCard(rotateFormula(f, k), n + ' · Rotation ' + (k + 1), 'Rotation ' + (k + 1));
    card.desc = 'Starts on note ' + (k + 1) + ' of ' + n + '. ' + card.desc;
    out.push(card);
  }));
  return out;
}

// Keep only formulas with exactly `size` distinct tones (no repeated root, no enharmonic duplicates like ♯4 + ♭5)
// and drop repeated formulas, so a "6 Tone" card always has six notes.
function validScales(txt, size) {
  const seen = new Set();
  return rows(txt).filter(([f]) => {
    const degs = parseFormula(f);
    const pcs = new Set(ascending(degs).map(v => v % 12));
    if (degs.length !== size || pcs.size !== size || seen.has(f)) return false;
    seen.add(f);
    return true;
  });
}
const scaleDeck = (txt, size) => { const list = validScales(txt, size); return withRotations(list.map(([f, n]) => scaleCard(f, n)), list); };

// Remove exact duplicates (same title and subtitle) that appear more than once in a source table
function unique(cards) {
  const seen = new Set();
  return cards.filter(card => { const k = card.title + '|' + card.sub; if (seen.has(k)) return false; seen.add(k); return true; });
}

const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const TUNINGS = [['Standard', 0], ['Half step down', 1], ['Whole step down', 2]];
function stringDeckCards(count) {
  const standard = data('strings').stringCards(count);
  const cards = [];
  TUNINGS.forEach(([tuning, down]) => standard.forEach(card => {
    const open = card.rows[0][1];
    const m = open.match(/^([A-G][♯♭]?)(\d)$/);
    const t = noteToTonic(m[1]);
    const pc = pcOf(t.l, t.acc);
    const newPc = (pc - down + 12) % 12;
    const octave = +m[2] - (pc - down < 0 ? 1 : 0);
    const note = down ? FLAT_NAMES[newPc] + octave : open;
    const hz = parseFloat(card.rows[1][1]) * Math.pow(2, -down / 12);
    const nt = noteToTonic(note.replace(/\d/, ''));
    cards.push({
      ...card,
      title: card.title + (down ? ' · ' + tuning : ''),
      sub: note.replace(/\d/, '') + ' string',
      group: tuning + ' tuning',
      rows: [['Open note', note], ['Frequency', hz.toFixed(2) + ' Hz'], ['Tuning', count + '-string ' + tuning.toLowerCase()]],
      desc: down ? 'Tuned ' + tuning.toLowerCase() + ' from ' + open + '. ' + card.desc : card.desc,
      allKeysLabel: 'Open ' + note.replace(/\d/, '') + ' as a degree of each key',
      transpose: (r) => ['1', '♭2', '2', '♭3', '3', '4', '♯4/♭5', '5', '♭6', '6', '♭7', '7'][(pcOf(nt.l, nt.acc) - r.pc + 12) % 12],
    });
  }));
  return cards;
}

function scaleCombinationCards() {
  const cards = [];
  for (let length = 2; length <= 8; length++) {
    const build = (sequence, counts) => {
      if (sequence.length === length) {
        const formula = sequence.join('');
        cards.push({
          title: 'Pattern ' + formula,
          sub: formula,
          group: length + '-note patterns',
          rows: [['Base 0', formula], ['Positions', sequence.join(' ')], ['Note count', String(length)]],
          desc: 'A scale-step pattern normalized to its first degree (0), spanning positions 0–7.',
        });
        return;
      }
      const first = sequence[sequence.length - 1];
      for (let digit = first; digit <= 7; digit++) {
        if (counts[digit] === 2) continue;
        counts[digit]++;
        build([...sequence, digit], counts);
        counts[digit]--;
      }
    };
    const counts = Array(8).fill(0);
    counts[0] = 1;
    build([0], counts);
  }
  return cards;
}

function modesDeck() {
  let group = 'The 7 Modes';
  return withRotations(rows(data('modes').MODES).map(([f, n], i) => {
    if (i >= 7) {
      const first = n.split(/[ /]/)[0];
      if (MODE_NAMES.includes(first) && f.split('–').length === 7 && f.startsWith('1')) group = first;
      else if (i === 7) group = 'Ionian';
    }
    // Four-note subsets were labelled "Pentatonic"; they are tetratonic
    const name = f.split('–').length === 4 ? n.replace(/Pentatonic/g, 'Tetratonic') : n;
    return scaleCard(f, name, group);
  }), rows(data('modes').MODES));
}

// Decks build their cards on first use (and cache them), so pages start instantly
function lazyDeck(def, build) {
  let cards = null;
  Object.defineProperty(def, 'cards', {
    get() { return cards || (cards = build()); },
    set(value) { cards = value; },
    enumerable: true, configurable: true,
  });
  return def;
}

const DECKS = [
  lazyDeck({ id: 'keys', name: 'Key', hue: 8 }, () => data('keys').keyCards),
  lazyDeck({ id: 'intervals', name: 'Interval · Basic', hue: 32 }, () => data('intervals').intervalCards.filter(card => card.rows[2][1] === 'Simple')),
  lazyDeck({ id: 'intervals-ext', name: 'Interval · Extended', hue: 40 }, () => data('intervals').intervalCards.filter(card => card.rows[2][1] !== 'Simple')),
  lazyDeck({ id: 'romannumerals', name: 'Roman Numeral ID', hue: 5 }, () => data('romannumerals').romanNumeralCards),
  lazyDeck({ id: 'triads', name: 'Chord · Triad', hue: 52 }, () => data('chords').triadCards),
  lazyDeck({ id: 'tetrads', name: 'Chord · 4 Tone', hue: 140 }, () => data('chords').tetradCards),
  lazyDeck({ id: 'scales5', name: 'Scale · 5 Tone', hue: 180 }, () => scaleDeck(data('scales').SCALES5, 5)),
  lazyDeck({ id: 'scales6', name: 'Scale · 6 Tone', hue: 210 }, () => scaleDeck(data('scales').SCALES6, 6)),
  lazyDeck({ id: 'scales7', name: 'Scale · 7 Tone', hue: 250 }, () => scaleDeck(data('scales').SCALES7, 7)),
  lazyDeck({ id: 'modes', name: 'Ionian & Modes', hue: 285 }, () => unique(modesDeck())),
  lazyDeck({ id: 'melodicpatterns', name: 'Melodic Patterns', hue: 315 }, () => data('melodicpatterns').melodicPatternCards),
  lazyDeck({ id: 'melodic7base0', name: '7-Tone Base 0 Patterns', hue: 315 }, () => scaleCombinationCards()),
  lazyDeck({ id: 'strings', name: 'String', hue: 330, strings: true }, () => stringDeckCards(6)),
  lazyDeck({ id: 'techniques', name: 'Technique', hue: 100 }, () => data('techniques').techniqueCards),
  lazyDeck({ id: 'andalusian', name: 'Andalusian', hue: 15 }, () => unique(data('andalusian').andalusianCards)),
  lazyDeck({ id: 'deceptive', name: 'Deceptive', hue: 300 }, () => unique(data('deceptive').deceptiveCards)),
  lazyDeck({ id: 'majorminor', name: 'Major / Minor', hue: 75 }, () => unique(data('majorminor').majorMinorCards)),
  lazyDeck({ id: 'blues', name: 'Blues', hue: 225 }, () => unique(data('blues').bluesCards)),
  lazyDeck({ id: 'lefthand', name: '1-2-3-4', hue: 115 }, () => data('lefthand').leftHandCards()),
  lazyDeck({ id: 'righthand', name: 'Right Hand', hue: 205, cardsFor: data('righthand').rightHandCardsFor, countFor: data('righthand').rightHandCount }, () => data('righthand').rightHandCardsFor(6)),
];

const BASE0_KIND = {
  intervals: 'Interval',
  'intervals-ext': 'Interval',
  triads: 'Chord',
  tetrads: '4 Tone Chord',
  scales5: 'Scale',
  scales6: 'Scale',
  scales7: 'Scale',
  modes: 'Scale',
  melodicpatterns: 'Melodic Pattern',
  andalusian: 'Progression',
  deceptive: 'Progression',
  majorminor: 'Progression',
  blues: 'Progression',
};
const BASE0_PROGRESSIONS = new Set(['andalusian', 'deceptive', 'majorminor', 'blues']);
const BASE0_SKIP = new Set(['keys', 'strings', 'techniques', 'righthand', 'base0']);

// The Base 0 card for one source card, computed directly (no need to build the whole Base 0 deck)
function base0CardFor(sourceDeck, sourceCard, sourceIndex) {
  if (BASE0_SKIP.has(sourceDeck.id) || !sourceCard) return null;
  if (sourceDeck.id === 'lefthand') {
    const formula = sourceCard.base0;
    return {
      title: 'Base 0 · ' + sourceCard.title,
      sub: formula,
      group: 'Left Hand',
      rows: [['Base finger', sourceCard.title[0]], ['Relative finger offsets', formula], ['Source deck', sourceDeck.name]],
      desc: 'Finger positions normalized so the first finger in the sequence is 0.',
      sourceDeckId: sourceDeck.id,
      sourceCardIndex: sourceIndex,
    };
  }
  if (sourceDeck.id === 'intervals' || sourceDeck.id === 'intervals-ext') {
    const raw = (sourceCard.rows.find(([k]) => k === 'Semitones / frets') || [])[1] || '';
    const st = parseInt(raw, 10);
    const formula = /down/.test(raw) ? '0-−' + st : '0-' + st;
    return {
      title: 'X ' + sourceCard.title + ' Interval', sub: formula, group: sourceDeck.name,
      rows: [['Base root', 'X = 0'], ['Semitone offsets', formula], ['Source deck', sourceDeck.name]],
      desc: 'Root X = 0 and the second note in semitones ' + (/down/.test(raw) ? 'below' : 'above') + ' it (frets on one string).',
      sourceDeckId: sourceDeck.id, sourceCardIndex: sourceIndex,
    };
  }
  if (!sourceCard.transpose) return null;
  const result = sourceCard.transpose(C);
  const value = typeof result === 'object' ? result.v : result;
  const tokens = String(value).split(BASE0_PROGRESSIONS.has(sourceDeck.id) ? '–' : ' ');
  const offsets = tokens.map(token => {
    const match = token.match(/^([A-G][♭♯#]*)/);
    if (!match) return null;
    const root = noteToTonic(match[1].replace(/#/g, '♯'));
    return root.l < 0 ? null : pcOf(root.l, root.acc);
  }).filter(offset => offset !== null);
  if (!offsets.length) return null;
  const base = sourceDeck.id === 'modes' ? offsets[0] : 0;
  const formula = offsets.map(offset => (offset - base + 12) % 12).join('-');
  const kind = BASE0_KIND[sourceDeck.id] || sourceDeck.name;
  const sourceTitle = sourceDeck.id === 'scales7' && sourceCard.sub === '1–2–3–4–5–6–7' ? 'Major' : sourceCard.title;
  return {
    title: 'X ' + sourceTitle + ' ' + kind,
    sub: formula,
    group: sourceDeck.name,
    rows: [['Base root', 'X = 0'], ['Semitone offsets', formula], ['Source deck', sourceDeck.name]],
    desc: 'Pitch classes measured in semitones from an arbitrary root X, independent of key.',
    sourceDeckId: sourceDeck.id,
    sourceCardIndex: sourceIndex,
  };
}

const base0Deck = lazyDeck({ id: 'base0', name: 'Base 0', hue: 190 }, () => {
  const cards = [];
  DECKS.forEach(sourceDeck => {
    if (BASE0_SKIP.has(sourceDeck.id)) return;
    sourceDeck.cards.forEach((card, i) => { const b = base0CardFor(sourceDeck, card, i); if (b) cards.push(b); });
  });
  return cards;
});

DECKS.push(base0Deck);
TD['decks.js'] = { stringCards: stringDeckCards, DECKS, base0CardFor, base0Deck };
})(window.TD = window.TD || {});
