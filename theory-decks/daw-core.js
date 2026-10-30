(function (TD) {
'use strict';
// DAW core: the song model, chord and pitch resolution, and the playback scheduler.
// Positions are in ticks of 1/96 of a whole note: a 32nd note is 3 ticks and a 16th-note triplet 4, so every
// meter from x/2 to x/32 and every straight or triplet grid down to 32nd-note triplets is exact.
const { parseFormula, ascending, noteToTonic } = TD['theory.js'];
const { QUALITY } = TD['sound.js'];
const tone = TD['tone.js'];

const TPW = 96; // ticks per whole note
const KEY_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const keyPc = (name) => noteToTonic(name).pc;
const semisOf = (formula) => ascending(parseFormula(formula)).map(s => s % 12).filter((s, i, a) => a.indexOf(s) === i).sort((a, b) => a - b);

const SCALES = [
  ['Major (Ionian)', '1–2–3–4–5–6–7'],
  ['Dorian', '1–2–♭3–4–5–6–♭7'],
  ['Phrygian', '1–♭2–♭3–4–5–♭6–♭7'],
  ['Lydian', '1–2–3–♯4–5–6–7'],
  ['Mixolydian', '1–2–3–4–5–6–♭7'],
  ['Natural minor (Aeolian)', '1–2–♭3–4–5–♭6–♭7'],
  ['Locrian', '1–♭2–♭3–4–♭5–♭6–♭7'],
  ['Harmonic minor', '1–2–♭3–4–5–♭6–7'],
  ['Melodic minor', '1–2–♭3–4–5–6–7'],
  ['Phrygian dominant', '1–♭2–3–4–5–♭6–♭7'],
  ['Major pentatonic', '1–2–3–5–6'],
  ['Minor pentatonic', '1–♭3–4–5–♭7'],
  ['Blues', '1–♭3–4–♭5–5–♭7'],
  ['Whole tone', '1–2–3–♯4–♯5–♭7'],
  ['Chromatic', '1–♭2–2–♭3–3–4–♯4–5–♭6–6–♭7–7'],
].map(([name, formula]) => ({ name, formula, semis: semisOf(formula) }));
const MAJOR = SCALES[0].semis;
const scaleByName = (name) => SCALES.find(s => s.name === name);

// ---------- meter ----------
const DENOMS = [2, 4, 8, 16, 32];
const measureTicks = (m) => Math.round(m.num * TPW / m.den);
// Beat groups in units of the denominator: 6/8 → 3+3, 7/8 → 2+2+3, 4/4 → 1+1+1+1
function defaultGroups(num, den) {
  if (den >= 8 && num > 3 && num % 3 === 0) return Array(num / 3).fill(3);
  if (den >= 8 && num > 3) { const g = Array(Math.floor(num / 2)).fill(2); if (num % 2) g[g.length - 1] = 3; return g; }
  return Array(num).fill(1);
}
function parseGroups(text, num) {
  const g = String(text).split(/[+\s,]+/).map(Number).filter(n => Number.isInteger(n) && n > 0);
  return g.length && g.reduce((a, b) => a + b, 0) === num ? g : null;
}
const groupsOf = (m) => (m.groups && m.groups.reduce((a, b) => a + b, 0) === m.num) ? m.groups : defaultGroups(m.num, m.den);
// Tick positions of each beat group start (accents) and of every denominator pulse
function pulses(m) {
  const unit = TPW / m.den, out = [];
  let pos = 0;
  groupsOf(m).forEach((g, gi) => { for (let i = 0; i < g; i++) out.push({ t: Math.round((pos + i) * unit), accent: i === 0 ? (gi === 0 ? 2 : 1) : 0 }); pos += g; });
  return out;
}

// ---------- chords ----------
// A chord is one of
//   { deg: 1–7, size: 3|4|5 }             diatonic: stacked thirds from the measure's scale (follows key AND scale changes)
//   { deg: 1–7, shape: [semis], suffix }   a chord card's quality on a scale degree
//   { rel: semis above tonic, shape, suffix, label }   a progression card chord (follows key changes)
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const SUFFIX = Object.keys(QUALITY).reduce((map, k) => { const key = QUALITY[k].map(s => s % 12).join(','); if (!(key in map) || k.length < map[key].length) map[key] = k; return map; }, {});
// Name a chord shape: the shortest matching symbol, else one built from its 3rd, 5th, 7th and 9th
function suffixFor(shape) {
  const k = shape.map(s => s % 12).join(',');
  if (k in SUFFIX) return SUFFIX[k];
  const has = (x) => shape.some(s => s % 12 === x);
  const minor = has(3) && !has(4), sus = !has(3) && !has(4);
  const fifth = has(7) ? '' : has(6) ? '♭5' : has(8) ? '♯5' : '';
  const sev = has(11) ? 'maj7' : has(10) ? '7' : has(9) && has(6) && minor ? '°7' : '';
  const ninth = shape.length > 4 ? (has(1) ? '♭9' : has(3) && !minor ? '♯9' : has(2) ? '9' : '') : '';
  let q = (minor ? 'm' : '') + (sev && ninth === '9' ? sev.replace('7', '9') : sev) + fifth + (ninth && !(sev && ninth === '9') ? '(' + ninth + ')' : '') + (sus ? (has(5) ? 'sus4' : has(2) ? 'sus2' : '5') : '');
  if (minor && sev === 'maj7') q = 'm(' + (ninth === '9' ? 'maj9' : 'maj7') + ')' + fifth + (ninth && ninth !== '9' ? '(' + ninth + ')' : '');
  if (sev === '°7') q = '°7' + (ninth ? '(' + ninth + ')' : '');
  else if (minor && fifth === '♭5' && sev === '7') q = 'ø7' + (ninth ? '(' + ninth + ')' : '');
  return q;
}
function scaleStack(scale, deg, size) {
  const n = scale.semis.length;
  const out = [];
  for (let i = 0; i < size; i++) {
    const idx = deg - 1 + i * 2;
    out.push(scale.semis[idx % n] + 12 * Math.floor(idx / n));
  }
  const root = out[0];
  return out.map(s => s - root);
}
function chordParts(ch, ctx) {
  if (!ch) return null;
  const scale = ctx.scale;
  if (ch.rel !== undefined) return { root: ((ch.rel % 12) + 12) % 12, shape: ch.shape };
  const n = scale.semis.length;
  const d = ((ch.deg - 1) % n + n) % n;
  const root = scale.semis[d];
  const shape = ch.shape || scaleStack(scale, d + 1, ch.size || 3);
  return { root, shape };
}
function noteName(pc, keyName) {
  const flats = /♭/.test(keyName) || keyName === 'F';
  return (flats ? FLAT_NAMES : keyName === 'C' ? KEY_NAMES : SHARP_NAMES)[((pc % 12) + 12) % 12];
}
function chordName(ch, ctx) {
  const p = chordParts(ch, ctx);
  if (!p) return '—';
  return noteName(ctx.keyPc + p.root, ctx.key) + (ch.suffix !== undefined ? ch.suffix : suffixFor(p.shape));
}
function chordRoman(ch, ctx) {
  if (!ch) return '';
  if (ch.label) return ch.label;
  const p = chordParts(ch, ctx);
  if (!p) return '';
  const major = MAJOR;
  // The numeral comes from the root's distance above the tonic, so 5- and 6-note scales and chords
  // built on chromatic roots (♭VII, ♭III, ♭V…) are named correctly, not by their position in the scale
  const root = ((p.root % 12) + 12) % 12;
  let deg = major.indexOf(root), diff = 0;
  if (deg < 0) { deg = major.indexOf((root + 1) % 12); diff = -1; }
  let base = ROMAN[deg];
  const acc = diff === -1 ? '♭' : '';
  const minor = p.shape.includes(3) && !p.shape.includes(4);
  const dim = minor && p.shape.includes(6) && !p.shape.includes(7);
  if (minor) base = base.toLowerCase();
  const sev = p.shape.length > 3 ? p.shape[3] % 12 : null;
  const nine = p.shape.length > 4 && p.shape[4] % 12 === 2;
  let tail = sev === 11 ? 'maj7' : sev === 10 ? (dim ? 'ø7' : '7') : sev === 9 && dim ? '°7' : sev === 9 ? '6' : sev === 2 ? 'add9' : '';
  if (nine && /7$/.test(tail) && tail !== '°7') tail = tail.replace(/7$/, '9');
  else if (p.shape.length > 4 && tail) tail += '(' + ({ 1: '♭9', 3: '♯9', 2: '9' }[p.shape[4] % 12] || '+' + p.shape[4]) + ')';
  return acc + base + (/^[ø°]7/.test(tail) ? tail : (dim ? '°' : p.shape.includes(8) && p.shape.includes(4) ? '+' : '') + tail);
}
// Parse a chord symbol written in C (from a progression card) into a relative chord
function chordFromSymbol(symbol, label) {
  const m = String(symbol).trim().match(/^([A-G][♭♯#]*)(.*)$/);
  if (!m) return null;
  const rel = noteToTonic(m[1].replace(/#/g, '♯')).pc;
  const q = m[2];
  const shape = (QUALITY[q] || QUALITY[q.replace(/\(.*\)$/, '')] || QUALITY['']).slice();
  return { rel, shape, suffix: q, label: label || undefined };
}

// Parse a Roman numeral (♭VII, ii7, V7, IVmaj7, viiø7, ♯iv°7, Isus4, vi9, I6, Iadd9…) against a scale.
// Diatonic results are stored as { deg, size } so they follow later scale changes; others keep their exact quality.
const NUMERALS = ['VII', 'VI', 'V', 'IV', 'III', 'II', 'I'];
function chordFromNumeral(token, scale, minor) {
  const m = String(token).trim().match(/^([♭♯b#]?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(.*)$/);
  if (!m) return null;
  const deg = 7 - NUMERALS.indexOf(m[2].toUpperCase());
  const acc = m[1] === '♭' || m[1] === 'b' ? -1 : m[1] ? 1 : 0;
  const rel = ((minor ? [0, 2, 3, 5, 7, 8, 10] : MAJOR)[deg - 1] + acc + 12) % 12;
  const lower = m[2] === m[2].toLowerCase();
  const q = m[3];
  let shape;
  if (/^ø/.test(q)) shape = [0, 3, 6, 10];
  else if (/^°7/.test(q)) shape = [0, 3, 6, 9];
  else if (/^°/.test(q)) shape = [0, 3, 6];
  else if (/^\+/.test(q)) shape = [0, 4, 8];
  else if (/sus4/.test(q)) shape = [0, 5, 7];
  else if (/sus2/.test(q)) shape = [0, 2, 7];
  else shape = lower ? [0, 3, 7] : [0, 4, 7];
  const rest = q.replace(/^[ø°+]/, '').replace(/sus[24]/, '');
  if (/^maj9/.test(rest)) shape.push(11, 14);
  else if (/^maj7/.test(rest)) shape.push(11);
  else if (/^9/.test(rest)) shape.push(10, 14);
  else if (/^7/.test(rest) && shape.length === 3 && !/^°7|^ø/.test(q)) shape.push(10);
  else if (/^6/.test(rest)) shape.push(9);
  if (/add9/.test(rest)) shape.push(14);
  if (scale) {
    const idx = scale.semis.indexOf(rel);
    if (idx >= 0 && idx < 7 && [3, 4, 5].includes(shape.length) && !/sus|add|6/.test(q)) {
      const st = scaleStack(scale, idx + 1, shape.length);
      if (st.join() === shape.join()) return { deg: idx + 1, size: shape.length };
    }
  }
  return { rel, shape, label: m[1].replace('b', '♭').replace('#', '♯') + m[2] + q };
}

// ---------- song ----------
function newMeasure(prev) {
  return {
    num: prev ? prev.num : 4, den: prev ? prev.den : 4, groups: prev && prev.groups ? prev.groups.slice() : null,
    tempo: null, key: prev ? prev.key : 'C', scale: prev ? prev.scale : SCALES[0].name, scaleSemis: prev ? prev.scaleSemis : null,
    chords: prev ? (prev.chords.length ? [{ t: 0, chord: JSON.parse(JSON.stringify(prev.chords[prev.chords.length - 1].chord)) }] : []) : [{ t: 0, chord: { deg: 1, size: 3 } }],
    mel: [], chd: [], bas: [],
  };
}
// A measure with a chord hit on each beat and the root in the bass: an instant, playable bar
function fillRhythm(m) {
  const ticks = measureTicks(m);
  m.chd = []; m.bas = [];
  const starts = m.chords.map(c => c.t);
  (m.chords.length ? pulses(m).filter(p => p.accent || m.den <= 4) : []).forEach((p, i, arr) => {
    const end = i + 1 < arr.length ? arr[i + 1].t : ticks;
    m.chd.push({ t: p.t, d: Math.max(1, end - p.t) });
  });
  starts.forEach((t, i) => m.bas.push({ t, d: (i + 1 < starts.length ? starts[i + 1] : ticks) - t }));
  return m;
}
// Make a chord change heard: when no chord or bass hit covers start…end, add one that fills it
function ensureHits(m, start, end) {
  if (end === undefined) { const next = m.chords.find(c => c.t > start); end = next ? next.t : measureTicks(m); }
  if (end <= start) return m;
  ['chd', 'bas'].forEach(k => { if (!m[k].some(h => h.t < end && h.t + h.d > start)) { m[k].push({ t: start, d: end - start }); m[k].sort((a, b) => a.t - b.t); } });
  return m;
}
function newSong() {
  const measures = [1, 4, 5, 1].map(deg => { const m = newMeasure(); m.chords = [{ t: 0, chord: { deg, size: 3 } }]; return fillRhythm(m); });
  return { v: 2, title: 'Untitled song', tempo: 100, swing: 0, sections: [{ name: 'A', measures }], arrangement: [0], vol: { mel: 0.9, chd: 0.7, bas: 0.8, drm: 0.7, click: 0.6 }, mute: {}, voice: { mel: 'warm', chd: 'warm', bas: 'pluck' }, drums: 'off' };
}
// Context a measure is heard in: its key and scale, unless overridden live
function measureCtx(m, live) {
  const key = (live && live.key) || m.key;
  let scale = live && live.scale ? scaleByName(live.scale) : null;
  if (!scale) scale = m.scaleSemis ? { name: m.scale, semis: m.scaleSemis } : (scaleByName(m.scale) || SCALES[0]);
  return { key, keyPc: keyPc(key), scale };
}
function chordAt(m, t, live) {
  if (live && live.chord) return live.chord;
  let ch = null;
  m.chords.forEach(c => { if (c.t <= t) ch = c.chord; });
  return ch;
}
// Register: tonic of the melody between C4 and F♯4, chords around C4, bass E2–E♭3
const base = (pc) => pc > 6 ? pc - 12 : pc;
function melodyMidi(note, ctx) {
  const n = ctx.scale.semis.length;
  const i = note.deg - 1;
  const oct = Math.floor(i / n);
  return 60 + base(ctx.keyPc) + ctx.scale.semis[((i % n) + n) % n] + 12 * oct + (note.acc || 0);
}
function chordMidis(ch, ctx) {
  const p = chordParts(ch, ctx);
  if (!p) return [];
  let root = 48 + ((ctx.keyPc + p.root) % 12);
  if (root < 53) root += 12; // F3–E4
  return p.shape.map(s => root + s);
}
function bassMidi(ch, ctx) {
  const p = chordParts(ch, ctx);
  if (!p) return null;
  let r = 36 + ((ctx.keyPc + p.root) % 12);
  if (r < 40) r += 12; // E2–D♯3
  return r;
}

const VOICE_NAMES = ['warm', 'bright', 'organ', 'pluck'];
const cleanVoice = (v) => { const o = { mel: 'warm', chd: 'warm', bas: 'pluck' }; if (v && typeof v === 'object') Object.keys(o).forEach(k => { if (VOICE_NAMES.includes(v[k])) o[k] = v[k]; }); return o; };
const cleanVol = (v) => { const o = { mel: 0.9, chd: 0.7, bas: 0.8, drm: 0.7, click: 0.6 }; if (v && typeof v === 'object') Object.keys(o).forEach(k => { const x = +v[k]; if (Number.isFinite(x) && x >= 0 && x <= 1) o[k] = x; }); return o; };
const cleanFlags = (v) => { const o = {}; if (v && typeof v === 'object') ['mel', 'chd', 'bas', 'drm', 'click'].forEach(k => { if (v[k] === true) o[k] = true; }); return o; };
// ---------- drums ----------
// A drum lane that follows every bar's meter and beat groups: kick, snare and hi-hat (GM notes 36, 38, 42)
const DRUM_PATTERNS = { off: 'Off', beat: 'Beat', half: 'Half-time', four: 'Four on the floor', brush: 'Hi-hat only' };
const DRUM_MIDI = { kick: 36, snare: 38, hat: 42 };
function drumHits(m, pattern) {
  if (!pattern || pattern === 'off' || !DRUM_PATTERNS[pattern]) return [];
  const ticks = measureTicks(m), out = [];
  const starts = pulses(m).filter(p => p.accent).map(p => p.t);
  const n = starts.length;
  if (pattern !== 'brush') starts.forEach((t, i) => {
    if (pattern === 'beat') out.push({ t, kind: i % 2 && n > 1 ? 'snare' : 'kick' });
    if (pattern === 'half') { if (i === 0) out.push({ t, kind: 'kick' }); else if (i === Math.floor(n / 2)) out.push({ t, kind: 'snare' }); }
    if (pattern === 'four') { out.push({ t, kind: 'kick' }); if (i % 2) out.push({ t, kind: 'snare' }); }
  });
  for (let t = 0; t < ticks; t += 12) out.push({ t, kind: 'hat' }); // 8th-note hi-hat
  return out;
}
// Validate anything loaded from storage or a file, filling gaps so a damaged file never breaks the page
function cleanSong(raw) {
  const s = newSong();
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.sections) || !raw.sections.length) return s;
  const num = (v, lo, hi, d) => { v = +v; return Number.isFinite(v) && v >= lo && v <= hi ? v : d; };
  // Version 1 songs counted in 32nds (32 per whole note); version 2 uses 96 per whole note
  const k = raw.v === 2 ? 1 : 3;
  const evs = (list, ticks, mel) => (Array.isArray(list) ? list : []).map(e => e && Number.isInteger(e.t) ? Object.assign({}, e, { t: e.t * k, d: +e.d * k }) : null).filter(e => e && e.t >= 0 && e.t < ticks)
    .map(e => { const o = { t: e.t, d: Math.max(1, Math.min(ticks * 8, Math.round(num(e.d, 1, 12288, 12)))) }; if (mel) { o.deg = Math.round(num(e.deg, -20, 40, 1)); o.acc = Math.round(num(e.acc, -6, 6, 0)); } return o; });
  const sections = raw.sections.slice(0, 64).map((sec, si) => {
    const measures = (Array.isArray(sec && sec.measures) ? sec.measures : []).slice(0, 256).map(m => {
      m = m && typeof m === 'object' ? m : {};
      const out = newMeasure();
      out.num = Math.round(num(m.num, 1, 32, 4));
      out.den = DENOMS.includes(+m.den) ? +m.den : 4;
      out.groups = Array.isArray(m.groups) && parseGroups(m.groups.join('+'), out.num) ? m.groups.map(Number) : null;
      out.tempo = m.tempo === null || m.tempo === undefined ? null : num(m.tempo, 20, 400, null);
      out.key = KEY_NAMES.includes(m.key) || SHARP_NAMES.includes(m.key) || FLAT_NAMES.includes(m.key) ? m.key : 'C';
      out.scale = typeof m.scale === 'string' ? m.scale : SCALES[0].name;
      out.scaleSemis = Array.isArray(m.scaleSemis) && m.scaleSemis.length && m.scaleSemis.every(x => Number.isInteger(x) && x >= 0 && x < 12) ? m.scaleSemis : null;
      if (!out.scaleSemis && !scaleByName(out.scale)) out.scale = SCALES[0].name;
      const ticks = measureTicks(out);
      const chords = (Array.isArray(m.chords) ? m.chords : []).filter(c => c && Number.isInteger(c.t) && c.t * k >= 0 && c.t * k < ticks && c.chord && typeof c.chord === 'object');
      out.chords = Array.isArray(m.chords) && m.chords.length === 0 ? [] : chords.length ? chords.map(c => ({ t: c.t * k, chord: c.chord })).sort((a, b) => a.t - b.t).filter((c, i, a) => !i || c.t !== a[i - 1].t) : [{ t: 0, chord: { deg: 1, size: 3 } }];
      out.chords.forEach(c => {
        const ch = c.chord;
        if (ch.shape !== undefined && !(Array.isArray(ch.shape) && ch.shape.length && ch.shape.length <= 8 && ch.shape.every(x => Number.isInteger(x) && x >= 0 && x <= 36))) { delete ch.shape; delete ch.suffix; delete ch.label; }
        if (ch.rel !== undefined && !(Number.isInteger(ch.rel) && ch.shape)) delete ch.rel;
        if (ch.rel === undefined && !(Number.isInteger(ch.deg) && ch.deg >= 1 && ch.deg <= 12)) { c.chord = { deg: 1, size: 3 }; return; }
        if (ch.rel !== undefined) delete ch.deg;
        if (ch.size !== undefined && ch.size !== 3 && ch.size !== 4 && ch.size !== 5) ch.size = 3;
        ['suffix', 'label'].forEach(k => { if (ch[k] !== undefined && typeof ch[k] !== 'string') delete ch[k]; });
      });
      out.mel = evs(m.mel, ticks, true); out.chd = evs(m.chd, ticks); out.bas = evs(m.bas, ticks);
      return out;
    });
    return { name: String((sec && sec.name) || String.fromCharCode(65 + si)).slice(0, 40), measures: measures.length ? measures : [fillRhythm(newMeasure())] };
  });
  const arrangement = (Array.isArray(raw.arrangement) ? raw.arrangement : []).filter(i => Number.isInteger(i) && i >= 0 && i < sections.length).slice(0, 512);
  return {
    v: 2, title: String(raw.title || 'Untitled song').slice(0, 80), tempo: num(raw.tempo, 20, 400, 100), swing: num(raw.swing, 0, 0.75, 0),
    sections, arrangement: arrangement.length ? arrangement : sections.map((_, i) => i),
    vol: cleanVol(raw.vol), mute: cleanFlags(raw.mute), voice: cleanVoice(raw.voice),
    drums: DRUM_PATTERNS[raw.drums] ? raw.drums : 'off',
  };
}

// ---------- playback ----------
// A look-ahead scheduler: every 25 ms it schedules the next ~120 ms of notes on the audio clock. It reads the
// song and the live overrides each time, so key, scale, chord, tempo and edits take effect on the spot.
// The scheduler's clock runs in a tiny Web Worker made on the device: browsers slow page timers in background
// tabs to once a second (or less), but not a worker's, so playback keeps exact time when the tab is hidden.
let clockWorker;
function workerClock() {
  if (clockWorker !== undefined) return clockWorker;
  clockWorker = null;
  try {
    if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined' && URL.createObjectURL) {
      const src = 'let i=null;onmessage=function(e){clearInterval(i);i=e.data?setInterval(function(){postMessage(0)},e.data):null}';
      clockWorker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      clockWorker.onerror = () => { clockWorker = null; };
    }
  } catch { clockWorker = null; }
  return clockWorker;
}
function startTicker(fn, ms) {
  const w = workerClock();
  if (w) { w.onmessage = fn; w.postMessage(ms); return { w, i: setInterval(fn, ms) }; } // the page timer also runs: whichever fires first
  return { i: setInterval(fn, ms) };
}
function stopTicker(h) { if (!h) return; if (h.w) { h.w.postMessage(0); h.w.onmessage = null; } clearInterval(h.i); }
function createPlayer(getSong, hooks) {
  let timer = null, pos = null, nextTime = 0, tail = null; // tail: the last notes of a song that has finished scheduling
  const marks = []; // { time, ref } for the playhead
  // Background tabs run timers only about once a second, so schedule further ahead there to avoid gaps
  const ahead = () => (typeof document !== 'undefined' && document.hidden ? (clockWorker ? 0.4 : 1.5) : 0.12);
  const order = (song, from) => {
    const list = [];
    const arr = hooks.scope() === 'section' ? [hooks.section()] : song.arrangement;
    arr.forEach((si, ai) => { const sec = song.sections[si]; if (sec) sec.measures.forEach((_, mi) => list.push({ ai, si, mi })); });
    return list;
  };
  function tickSeconds(song, m) {
    const bpm = m.tempo || song.tempo; // tempo is quarter notes per minute
    return 60 / bpm / (TPW / 4);
  }
  function scheduleTick(song, m, t, time, secs, live) {
    const ctx = measureCtx(m, live);
    const vol = song.vol, mute = song.mute, voice = song.voice || {};
    // swing pushes every off-beat 8th later
    const swingAt = (tt) => song.swing && tt % 24 === 12 ? song.swing * 12 * secs * 0.66 : 0;
    const at = time + swingAt(t);
    if (!mute.mel) m.mel.forEach(n => { if (n.t === t) tone.noteAt(melodyMidi(n, ctx), at, n.d * secs * 0.95, 0.2 * vol.mel, voice.mel); });
    const ch = chordAt(m, t, live);
    if (!mute.chd) m.chd.forEach(h => { if (h.t === t) { const notes = chordMidis(chordAt(m, t, live), ctx); notes.forEach(x => tone.noteAt(x, at, h.d * secs * 0.92, 0.2 * vol.chd / Math.sqrt(notes.length), voice.chd)); } });
    if (!mute.bas) m.bas.forEach(h => { if (h.t === t) { const r = bassMidi(ch, ctx); if (r !== null) tone.noteAt(r, at, h.d * secs * 0.92, 0.3 * vol.bas, voice.bas); } });
    if (!mute.drm && song.drums && song.drums !== 'off') drumHits(m, song.drums).forEach(h => { if (h.t === t) tone.drumAt(h.kind, at, (h.kind === 'hat' ? 0.12 : 0.22) * (vol.drm === undefined ? 0.7 : vol.drm)); });
    if (hooks.click() && !mute.click) pulses(m).forEach(p => { if (p.t === t) tone.noteAt(p.accent === 2 ? 96 : p.accent ? 89 : 84, time, 0.04, (p.accent ? 0.16 : 0.09) * vol.click); });
  }
  function pump() {
    const song = getSong();
    const live = hooks.live();
    const list = order(song);
    if (!list.length) { stop(); hooks.empty && hooks.empty(); return; }
    const horizon = tone.now() + ahead();
    while (nextTime < horizon) {
      if (pos.i >= list.length) {
        if (!hooks.loop()) { const end = nextTime; stopTicker(timer); timer = null; tail = setTimeout(() => { tail = null; if (!timer) { pos = null; hooks.stopped(); } }, Math.max(0, (end - tone.now()) * 1000)); return; }
        pos.i = 0; pos.t = 0;
      }
      const ref = list[pos.i];
      const m = song.sections[ref.si].measures[ref.mi];
      const ticks = measureTicks(m);
      if (pos.t >= ticks) { pos.i++; pos.t = 0; continue; }
      const secs = tickSeconds(song, m);
      scheduleTick(song, m, pos.t, nextTime, secs, live);
      if (pos.t % 3 === 0) marks.push({ time: nextTime, ref, t: pos.t });
      // In a hidden tab nothing reads the playhead: keep only the marks still ahead so the list never grows without end
      if (marks.length > 4000) { const now = tone.now(); let k = 0; while (k < marks.length - 1 && marks[k + 1].time <= now) k++; marks.splice(0, k); }
      nextTime += secs;
      pos.t++;
    }
  }
  function play(fromIndex = 0) {
    stop(true);
    tone.unmuteIOS();
    pos = { i: fromIndex, t: 0 };
    nextTime = tone.now() + 0.08;
    marks.length = 0;
    timer = startTicker(pump, 25); // set first: pump() may stop at once (an empty song)
    pump();
  }
  function stop(quiet) {
    if (timer) stopTicker(timer);
    timer = null;
    if (tail) { clearTimeout(tail); tail = null; }
    pos = null;
    marks.length = 0;
    tone.stopAll();
    if (!quiet) hooks.stopped();
  }
  // Where the sound is right now (for the playhead)
  function current() {
    const now = tone.now();
    let cur = null;
    while (marks.length > 1 && marks[1].time <= now) marks.shift();
    if (marks.length && marks[0].time <= now) cur = marks[0];
    return cur;
  }
  // Still "playing" while the final notes ring out, so ■ Stop stops them instead of starting again
  return { play, stop, current, playing: () => !!timer || !!tail, order };
}

TD['daw-core.js'] = {
  TPW, KEY_NAMES, SCALES, DENOMS, scaleByName, semisOf, measureTicks, defaultGroups, parseGroups, groupsOf, pulses,
  chordParts, chordName, chordRoman, chordFromSymbol, newMeasure, fillRhythm, newSong, measureCtx, chordAt, melodyMidi, chordMidis, bassMidi,
  cleanSong, createPlayer, drumHits, DRUM_PATTERNS, DRUM_MIDI, ensureHits, scaleStack, VOICE_NAMES, suffixFor, chordFromNumeral,
};
})(window.TD = window.TD || {});
