(function (TD) {
'use strict';
// Lazy modules: a data file registers a factory that runs only the first time its exports are read,
// so pages start without building card data they never show.
TD.lazy = (name, factory) => {
  let value = null;
  Object.defineProperty(TD, name, {
    get() { return value || (value = factory()); },
    set(v) { value = v; },
    configurable: true, enumerable: true,
  });
};
const LETTERS = ['C','D','E','F','G','A','B'];
const NAT = [0, 2, 4, 5, 7, 9, 11];
const IV_NAMES = ['P1','m2','M2','m3','M3','P4','TT','P5','m6','M6','m7','M7'];

function parseDeg(tok) {
  // Accepts ♭ ♯ b # and the double accidentals 𝄫 𝄪 (so a °7 chord's 𝄫7 is read, not dropped)
  const m = String(tok).trim().match(/^((?:[♭♯b#]|𝄫|𝄪)*)(\d+)$/u);
  if (!m) return null;
  let acc = 0;
  for (const c of m[1]) acc += c === '𝄫' ? -2 : c === '𝄪' ? 2 : (c === '♭' || c === 'b') ? -1 : 1;
  const n = +m[2];
  return { n, acc, tok: tok.trim(), semis: NAT[(n - 1) % 7] + 12 * Math.floor((n - 1) / 7) + acc };
}

const parseFormula = (str) => String(str || '').split(/[–-]/).map(parseDeg).filter(Boolean);

const accStr = (a) => a > 0 ? '♯'.repeat(a) : a < 0 ? '♭'.repeat(-a) : '';

// tonic: { l: letter index 0-6, acc }
function spell(tonic, deg) {
  const li = (tonic.l + deg.n - 1) % 7;
  const tpc = NAT[tonic.l] + tonic.acc + NAT[(deg.n - 1) % 7] + deg.acc;
  const a = (((tpc - NAT[li]) % 12) + 18) % 12 - 6;
  return LETTERS[li] + accStr(a);
}

const C = { l: 0, acc: 0 };

// The 12 roots used for the "all keys" view
const ROOTS = [
  [0, 0], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [3, 1], [4, 0], [5, -1], [5, 0], [6, -1], [6, 0],
].map(([l, acc]) => ({ l, acc, name: LETTERS[l] + accStr(acc), pc: (NAT[l] + acc + 12) % 12 }));

const pcOf = (l, acc) => (NAT[l] + acc + 120) % 12;
const noteToTonic = (name) => {
  name = String(name || 'C'); // an empty or missing name must not throw
  const l = Math.max(0, LETTERS.indexOf(name[0]));
  let acc = 0;
  // Accepts ♭ ♯ b # and the double accidentals 𝄫 𝄪
  for (const c of name.slice(1)) acc += (c === '♭' || c === 'b') ? -1 : (c === '♯' || c === '#') ? 1 : c === '𝄫' ? -2 : c === '𝄪' ? 2 : 0;
  // Same shape as ROOTS entries (name and pitch class), so a parsed tonic can be passed to any transpose()
  return { l, acc, name: LETTERS[l] + accStr(acc), pc: ((NAT[l] + acc) % 12 + 12) % 12 };
};
const DEGREE_OF_PC = ['1', '♭2', '2', '♭3', '3', '4', '♯4/♭5', '5', '♭6', '6', '♭7', '7'];
const ROMAN_OF_PC = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♯IV/♭V', 'V', '♭VI', 'VI', '♭VII', 'VII'];

// Pitches made ascending in order listed (wrapping up an octave as needed)
function ascending(degs) {
  const out = [];
  let prev = -Infinity;
  for (const d of degs) {
    let v = d.semis;
    while (v <= prev) v += 12;
    out.push(v); prev = v;
  }
  return out;
}

const STEP = { 1: 'H', 2: 'W', 3: 'W½', 4: '2W' };
function steps(pitches) {
  const p = [...pitches];
  if (p[p.length - 1] - p[0] < 12) p.push(p[0] + 12);
  const s = [];
  for (let i = 1; i < p.length; i++) {
    const d = p[i] - p[i - 1];
    if (d > 0) s.push(STEP[d] || d + 'st');
  }
  return s.join(' ');
}

function shape(pitches) {
  return pitches.map(v => IV_NAMES[(v - pitches[0]) % 12]).join(' ');
}

// Character description from the set of semitones above the first note
function describe(pitches, rootName) {
  const set = new Set(pitches.map(v => (v - pitches[0]) % 12));
  const has = (n) => set.has(n);
  let quality, chord;
  if (has(3) && has(4)) quality = 'Blues-tinged sound (both ♭3 and 3)';
  else if (has(4)) quality = 'Major sound';
  else if (has(3)) quality = 'Minor sound';
  else quality = 'Open, suspended sound (no 3rd)';

  const fifth = has(7) ? 'a stable perfect 5th' : has(6) ? 'a diminished 5th' : has(8) ? 'a raised 5th / ♭6' : 'no 5th';
  const sev = has(11) ? 'a major 7th leading tone' : has(10) ? 'a ♭7' : null;
  let s = quality + ' with ' + fifth + (sev ? ' and ' + sev : '') + '.';

  const colors = [];
  if (has(1)) colors.push('♭2 adds a dark, exotic Phrygian edge');
  if (has(6) && (has(5) || has(7))) colors.push('♭5/♯4 adds tritone tension');
  if (has(3) && has(9)) colors.push('natural 6 brightens the minor (Dorian color)');
  if (has(8) && has(7)) colors.push('♭6 adds a melancholy pull');
  if (has(4) && has(6) && !has(5)) colors.push('♯4 gives a floating Lydian lift');
  if (has(3) && has(11)) colors.push('major 7 over minor gives harmonic/melodic-minor drama');
  if (colors.length) s += ' ' + colors[0][0].toUpperCase() + colors.slice(0, 2).join('; ').slice(1) + '.';

  // chord it fits over
  if (has(4) && has(7)) chord = has(10) ? '7' : has(11) ? 'maj7' : '';
  else if (has(4) && has(8) && !has(7)) chord = 'aug';
  else if (has(3) && has(7)) chord = has(10) ? 'm7' : has(11) ? 'm(maj7)' : 'm';
  else if (has(3) && has(6)) chord = has(10) ? 'm7♭5' : has(9) ? 'dim7' : 'dim';
  else if (has(5) && has(7)) chord = has(10) ? '7sus4' : 'sus4';
  else if (has(2) && has(7)) chord = 'sus2';
  else chord = null;
  if (chord !== null) s += ' Fits over ' + rootName + chord + '.';
  return s;
}
TD['theory.js'] = { LETTERS, parseDeg, parseFormula, accStr, spell, C, ROOTS, pcOf, noteToTonic, DEGREE_OF_PC, ROMAN_OF_PC, ascending, steps, shape, describe };
})(window.TD = window.TD || {});
