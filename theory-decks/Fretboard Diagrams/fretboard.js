(function (TD) {
'use strict';
// Fretboard Diagrams: any scale, chord or interval on 1–14 custom-tuned strings, with a selectable fret window and capo.
// Everything is drawn and synthesised on the device (no files, works offline).
const { ROOTS, parseFormula, spell, ascending } = TD['theory.js'];
const tone = TD['tone.js'];
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SHAPES = [
  ['Scales', [
    ['Major (Ionian)', '1–2–3–4–5–6–7'], ['Natural minor (Aeolian)', '1–2–♭3–4–5–♭6–♭7'], ['Harmonic minor', '1–2–♭3–4–5–♭6–7'],
    ['Melodic minor', '1–2–♭3–4–5–6–7'], ['Dorian', '1–2–♭3–4–5–6–♭7'], ['Phrygian', '1–♭2–♭3–4–5–♭6–♭7'], ['Lydian', '1–2–3–♯4–5–6–7'],
    ['Mixolydian', '1–2–3–4–5–6–♭7'], ['Locrian', '1–♭2–♭3–4–♭5–♭6–♭7'], ['Phrygian dominant', '1–♭2–3–4–5–♭6–♭7'],
    ['Major pentatonic', '1–2–3–5–6'], ['Minor pentatonic', '1–♭3–4–5–♭7'], ['Blues', '1–♭3–4–♭5–5–♭7'], ['Whole tone', '1–2–3–♯4–♯5–♭7'],
    ['Hirajoshi', '1–2–♭3–5–♭6'],
  ]],
  ['Chords', [
    ['Major triad', '1–3–5'], ['Minor triad', '1–♭3–5'], ['Diminished triad', '1–♭3–♭5'], ['Augmented triad', '1–3–♯5'],
    ['sus2', '1–2–5'], ['sus4', '1–4–5'], ['Power chord (5)', '1–5'], ['6', '1–3–5–6'], ['m6', '1–♭3–5–6'], ['7', '1–3–5–♭7'],
    ['maj7', '1–3–5–7'], ['m7', '1–♭3–5–♭7'], ['m(maj7)', '1–♭3–5–7'], ['m7♭5 (ø7)', '1–♭3–♭5–♭7'], ['°7', '1–♭3–♭5–𝄫7'],
    ['add9', '1–3–5–9'], ['9', '1–3–5–♭7–9'], ['maj9', '1–3–5–7–9'], ['m9', '1–♭3–5–♭7–9'],
  ]],
  ['Intervals', [
    ['Minor 3rd', '1–♭3'], ['Major 3rd', '1–3'], ['Perfect 4th', '1–4'], ['Tritone', '1–♯4'], ['Perfect 5th', '1–5'], ['Minor 7th', '1–♭7'], ['Octave', '1–8'],
  ]],
];
// Catalog additions use exact semitone sets and degree spelling; synthetic collections are labeled descriptively, not given invented traditional names.
const SCALE_TOKENS = ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];
const CHORD_TOKENS = ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];
function pitchSetKey(formula) {
  const degrees = parseFormula(String(formula).replace(/𝄫/g, '♭♭').replace(/𝄪/g, '♯♯'));
  return [...new Set(degrees.map(d => ((d.semis % 12) + 12) % 12))].sort((a, b) => a - b).join(',');
}
function choose(items, count) {
  const out = [];
  const walk = (start, picked) => {
    if (picked.length === count) { out.push(picked); return; }
    for (let i = start; i <= items.length - (count - picked.length); i++) walk(i + 1, picked.concat(items[i]));
  };
  walk(0, []);
  return out;
}
function spread(items, count) {
  return Array.from({ length: count }, (_, i) => items[Math.floor((i + 0.5) * items.length / count)]);
}
function formulaFor(pcs, tokens) { return pcs.slice().sort((a, b) => a - b).map(pc => tokens[pc]).join('–'); }
function intervalOrdinal(n) {
  const special = { 1: 'unison', 8: 'octave', 15: 'double octave', 22: 'triple octave', 29: 'quadruple octave' };
  if (special[n]) return special[n];
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th';
  return n + suffix;
}
function addExtendedCatalog() {
  const intervalSimple = [], intervalCompound = [];
  const knownIntervalFormulas = new Set(SHAPES[2][1].map(([, f]) => f.replace(/𝄫/g, '♭♭').replace(/𝄪/g, '♯♯')));
  for (let n = 1; n <= 35; n++) {
    const perfectFamily = [0, 3, 4].includes((n - 1) % 7);
    const qualities = perfectFamily
      ? (n === 1 ? [['Perfect', 0], ['Augmented', 1]] : [['Diminished', -1], ['Perfect', 0], ['Augmented', 1]])
      : [['Diminished', -2], ['Minor', -1], ['Major', 0], ['Augmented', 1]];
    for (const [quality, alteration] of qualities) {
      const accidental = alteration === -2 ? '𝄫' : alteration === -1 ? '♭' : alteration === 1 ? '♯' : '';
      const formula = '1–' + accidental + n;
      if (knownIntervalFormulas.has(formula.replace(/𝄫/g, '♭♭'))) continue;
      const item = [quality + ' ' + intervalOrdinal(n) + ' · ' + formula, formula];
      (n <= 7 ? intervalSimple : intervalCompound).push(item);
    }
  }
  SHAPES.push(['Extended intervals · unison–7th', intervalSimple], ['Extended intervals · compound', intervalCompound]);

  const knownChords = new Set(SHAPES.filter(([group]) => group === 'Chords').flatMap(([, list]) => list.map(([, f]) => pitchSetKey(f))));
  for (const toneCount of [3, 4]) {
    const items = [];
    for (const selected of choose(Array.from({ length: 11 }, (_, i) => i + 1), toneCount - 1)) {
      const pcs = [0, ...selected], key = pcs.join(',');
      if (knownChords.has(key)) continue;
      knownChords.add(key);
      const formula = formulaFor(pcs, CHORD_TOKENS);
      items.push([toneCount + '-note chord set · ' + formula, formula]);
    }
    SHAPES.push(['Additional ' + toneCount + '-note chord sets', items]);
  }

  const knownScales = new Set(SHAPES.filter(([group]) => group === 'Scales').flatMap(([, list]) => list.map(([, f]) => pitchSetKey(f))));
  for (const toneCount of [5, 6, 7, 8]) {
    const candidates = choose(Array.from({ length: 11 }, (_, i) => i + 1), toneCount - 1)
      .filter(selected => !knownScales.has([0, ...selected].join(',')));
    const items = spread(candidates, 50).map((selected, i) => {
      const pcs = [0, ...selected], formula = formulaFor(pcs, SCALE_TOKENS);
      knownScales.add(pcs.join(','));
      return ['Synthetic ' + toneCount + '-tone collection ' + String(i + 1).padStart(2, '0') + ' · ' + formula, formula];
    });
    SHAPES.push(['Synthetic scale collections · ' + toneCount + ' tones', items]);
  }
}
addExtendedCatalog();
const FLAT_SHAPES = SHAPES.flatMap(([, list]) => list);
const FLAT_SHAPE_GROUPS = SHAPES.flatMap(([group, list]) => list.map(() => group));
function populateShapeOptions() {
  const select = $('fb-shape'), query = $('fb-shape-search').value.trim().toLowerCase();
  const selected = select.value || '0', selectedIndex = Number(selected), matches = new Set();
  let index = 0;
  const groups = SHAPES.map(([group, list]) => {
    const options = [];
    for (const shape of list) {
      const currentIndex = index++;
      if (!query || (group + ' ' + shape[0] + ' ' + shape[1]).toLowerCase().includes(query)) {
        matches.add(currentIndex);
        options.push('<option value="' + currentIndex + '"' + (currentIndex === selectedIndex ? ' selected' : '') + '>' + esc(shape[0]) + '</option>');
      }
    }
    return options.length ? '<optgroup label="' + esc(group) + '">' + options.join('') + '</optgroup>' : '';
  }).filter(Boolean);
  if (query && !matches.has(selectedIndex) && FLAT_SHAPES[selectedIndex]) {
    groups.unshift('<optgroup label="Current selection"><option value="' + selectedIndex + '" selected>' + esc(FLAT_SHAPES[selectedIndex][0]) + '</option></optgroup>');
  }
  select.innerHTML = groups.join('');
  select.value = selected;
  $('fb-shape-count').textContent = query ? matches.size + ' matches' : FLAT_SHAPES.length + ' shapes';
}
populateShapeOptions();
$('fb-shape-search').addEventListener('input', populateShapeOptions);
// String 1 is thinnest. The standard 8-string set is E4 through F♯1; added strings repeat the upper courses one octave higher and can all be retuned below.
const STD = [64, 59, 55, 50, 45, 40, 35, 30];
const DEFAULT_OPEN = STD.concat(STD.slice(0, 6).map(m => m + 12));
const TUNINGS = [['std', 'Standard'], ['half', 'Half step down'], ['whole', 'Whole step down'], ['drop', 'Drop (lowest string −2)'], ['custom', 'Custom']];
const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const NOTE_OPTIONS = ['C', 'C♯ / D♭', 'D', 'D♯ / E♭', 'E', 'F', 'F♯ / G♭', 'G', 'G♯ / A♭', 'A', 'A♯ / B♭', 'B'];
const midiName = (m) => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const MARKS = [3, 5, 7, 9, 15, 17, 19, 21, 27, 29, 31, 33, 39, 41, 43, 45];
const DOUBLE_MARKS = [12, 24, 36, 48];
const MAX_FRET = 48;
const validMidi = (value) => Number.isInteger(value) && value >= 0 && value <= 127;
const fretValue = (value, fallback = 0) => Number.isInteger(+value) && +value >= 0 && +value <= MAX_FRET ? +value : fallback;

// The 𝄫 / 𝄪 accidentals are read as two flats / sharps
const clean = (f) => String(f).replace(/𝄫/g, '♭♭').replace(/𝄪/g, '♯♯');
const store = {
  get() { try { return JSON.parse(localStorage.getItem('td-fret')) || {}; } catch { return {}; } },
  set(v) { try { localStorage.setItem('td-fret', JSON.stringify(v)); } catch { /* storage blocked: this visit only */ } },
};

ROOTS.forEach((r, i) => $('fb-key').add(new Option(r.name, i)));
for (let n = 1; n <= 14; n++) $('fb-strings').add(new Option(n + ' strings', n));
TUNINGS.forEach(([v, label]) => $('fb-tuning').add(new Option(label, v)));

// Restore the last view; the string count defaults to the one chosen on the Play / Settings pages
let openNotes = [];
let startFret = 0, endFret = 15, capoFret = 0;

function standardOpens(count) {
  return DEFAULT_OPEN.slice(0, count);
}
function tuning(count, kind) {
  const open = standardOpens(count).map(m => m - (kind === 'half' ? 1 : kind === 'whole' ? 2 : 0));
  if (kind === 'drop' && open.length) open[open.length - 1] -= 2;
  return open;
}
function restore() {
  const s = store.get();
  let storedStrings = null;
  try { storedStrings = localStorage.getItem('td-strings'); } catch { storedStrings = null; }
  $('fb-key').value = '0'; $('fb-tuning').value = 'std'; $('fb-labels').value = 'note';
  const unisonIndex = FLAT_SHAPES.findIndex(([name, formula]) => name.startsWith('Perfect unison') && formula === '1–1');
  $('fb-shape').value = String(unisonIndex < 0 ? 0 : unisonIndex);
  const pick = (id, v) => { if (v !== undefined && v !== null && [...$(id).options].some(o => o.value === String(v))) $(id).value = String(v); };
  pick('fb-key', s.key); pick('fb-shape', s.shape); pick('fb-tuning', s.tuning); pick('fb-labels', s.labels);
  pick('fb-strings', s.strings !== undefined ? s.strings : storedStrings || 6);
  let favoriteData = null;
  try {
    const favoriteId = new URLSearchParams(location.search).get('favorite');
    const items = JSON.parse(localStorage.getItem('st_favorites_v1') || '[]');
    const favorite = Array.isArray(items) && items.find(item => item && item.type === 'fretboard-diagram' && item.id === favoriteId);
    if (favorite && favorite.data && typeof favorite.data === 'object') favoriteData = favorite.data;
  } catch (error) {}
  if (favoriteData) {
    const keyIndex = ROOTS.findIndex(root => root.name === favoriteData.key);
    if (keyIndex >= 0) $('fb-key').value = String(keyIndex);
    const shapeIndex = FLAT_SHAPES.findIndex(([name, formula]) => name === favoriteData.shape && formula === favoriteData.formula);
    if (shapeIndex >= 0) $('fb-shape').value = String(shapeIndex);
    pick('fb-strings', favoriteData.strings);
    pick('fb-tuning', favoriteData.tuningKey);
    pick('fb-labels', favoriteData.labels);
  }
  if (!$('fb-strings').value) $('fb-strings').value = '6';
  const count = +$('fb-strings').value, kind = $('fb-tuning').value;
  const defaults = tuning(14, kind === 'custom' ? 'std' : kind);
  const savedOpens = favoriteData && Array.isArray(favoriteData.openNotes) ? favoriteData.openNotes : s.opens;
  openNotes = Array.from({ length: 14 }, (_, i) => kind === 'custom' && Array.isArray(savedOpens) && validMidi(savedOpens[i]) ? savedOpens[i] : defaults[i]);
  startFret = fretValue(favoriteData ? favoriteData.startFret : s.startFret, 0);
  endFret = Math.max(startFret, fretValue(favoriteData ? favoriteData.endFret : s.endFret, fretValue(s.frets, 15)));
  capoFret = fretValue(favoriteData ? favoriteData.capoFret : s.capoFret, 0);
  $('fb-start').value = startFret; $('fb-end').value = endFret; $('fb-capo').value = capoFret;
}
restore();

function drawStringTunings() {
  const root = $('fb-string-tunings');
  const count = +$('fb-strings').value;
  root.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const midi = openNotes[i];
    const row = document.createElement('div');
    row.className = 'fb-string-row';
    const number = document.createElement('b');
    number.textContent = 'String ' + (i + 1);
    const note = document.createElement('select');
    note.setAttribute('aria-label', 'String ' + (i + 1) + ' note');
    NOTE_OPTIONS.forEach((name, pitch) => note.add(new Option(name, pitch)));
    note.value = String(midi % 12);
    const octave = document.createElement('select');
    octave.setAttribute('aria-label', 'String ' + (i + 1) + ' octave');
    const fillOctaves = (pitch, selected) => {
      octave.innerHTML = '';
      const highest = Math.min(9, Math.floor((127 - pitch) / 12) - 1);
      const safe = Math.max(-1, Math.min(selected, highest));
      for (let value = -1; value <= highest; value++) octave.add(new Option(String(value), value));
      octave.value = String(safe);
    };
    fillOctaves(midi % 12, Math.floor(midi / 12) - 1);
    const update = () => {
      fillOctaves(Number(note.value), Number(octave.value));
      openNotes[i] = (Number(octave.value) + 1) * 12 + Number(note.value);
      $('fb-tuning').value = 'custom';
      render();
    };
    note.onchange = update; octave.onchange = update;
    row.append(number, note, octave);
    root.appendChild(row);
  }
}
drawStringTunings();
function current() {
  const root = ROOTS[+$('fb-key').value] || ROOTS[0];
  const shapeIndex = +$('fb-shape').value;
  const [name, formula] = FLAT_SHAPES[shapeIndex] || FLAT_SHAPES[0];
  const group = FLAT_SHAPE_GROUPS[shapeIndex] || 'Scales';
  const degs = parseFormula(clean(formula));
  const notes = degs.map(d => spell(root, d));
  const byPc = new Map();
  degs.forEach((d, i) => { const pc = ((root.pc + d.semis) % 12 + 12) % 12; if (!byPc.has(pc)) byPc.set(pc, { name: notes[i], deg: d.tok.replace('♭♭', '𝄫').replace('♯♯', '𝄪'), root: i === 0 }); });
  return { root, name, formula, group, degs, notes, byPc };
}

function render() {
  const strings = +$('fb-strings').value, labels = $('fb-labels').value, kind = $('fb-tuning').value;
  const open = openNotes.slice(0, strings);
  store.set({ key: $('fb-key').value, shape: $('fb-shape').value, strings, tuning: kind, opens: openNotes.slice(0, 14), startFret, endFret, capoFret, frets: endFret, labels });
  const cur = current();
  const fretCount = endFret - startFret + 1;
  const fw = fretCount > 24 ? 36 : fretCount > 16 ? 42 : 58, nut = 58, gap = 34, top = 32;
  const W = nut + fretCount * fw + 16, H = top + (strings - 1) * gap + 46;
  const boundary = f => nut + (f - startFret) * fw;
  const x = f => f === 0 && startFret === 0 ? nut - 26 : nut + (f - startFret + 0.5) * fw;
  const boardBottom = top + (strings - 1) * gap;
  let svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(cur.root.name + ' ' + cur.name + ' on ' + strings + ' strings, frets ' + startFret + ' to ' + endFret + (capoFret ? ', capo ' + capoFret : '')) + '">';
  const midY = top + (strings - 1) * gap / 2;
  MARKS.filter(f => f >= startFret && f <= endFret).forEach(f => { svg += '<circle cx="' + x(f) + '" cy="' + midY + '" r="6" fill="#d7d8cf"/>'; });
  DOUBLE_MARKS.filter(f => f >= startFret && f <= endFret).forEach(f => { svg += '<circle cx="' + x(f) + '" cy="' + (midY - gap / 2) + '" r="6" fill="#d7d8cf"/><circle cx="' + x(f) + '" cy="' + (midY + gap / 2) + '" r="6" fill="#d7d8cf"/>'; });
  for (let f = startFret; f <= endFret + 1; f++) {
    const fx = boundary(f), isNut = f === 0 && startFret === 0;
    svg += '<line x1="' + fx + '" y1="' + top + '" x2="' + fx + '" y2="' + boardBottom + '" stroke="' + (isNut ? '#202b26' : '#b9bbb0') + '" stroke-width="' + (isNut ? 6 : 2) + '"/>';
  }
  for (let f = startFret; f <= endFret; f++) if (f > 0) svg += '<text x="' + x(f) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#69736d">' + f + '</text>';
  open.forEach((m, s) => {
    const y = top + s * gap;
    svg += '<line x1="' + nut + '" y1="' + y + '" x2="' + (nut + fretCount * fw) + '" y2="' + y + '" stroke="#8a7a5c" stroke-width="' + (1 + s * 0.35).toFixed(2) + '"/>';
    const openLabel = capoFret ? midiName(m + capoFret) : midiName(m);
    svg += '<text x="5" y="' + (y + 4) + '" font-size="10" fill="#69736d">' + esc(openLabel) + '</text>';
    for (let f = Math.max(startFret, capoFret); f <= endFret; f++) {
      if (f === 0 && capoFret > 0) continue;
      const midi = m + f, info = cur.byPc.get(((midi % 12) + 12) % 12);
      if (!info) continue;
      const label = labels === 'deg' ? info.deg : info.name;
      svg += '<g class="dot" tabindex="0" role="button" data-midi="' + midi + '" aria-label="' + esc(info.name + ' (' + info.deg + '), string ' + (s + 1) + ', fret ' + f + (capoFret && f === capoFret ? ', capo fret' : '')) + '">' +
        '<circle cx="' + x(f) + '" cy="' + y + '" r="13" fill="' + (info.root ? '#ba4c31' : f === 0 ? '#fbfaf5' : '#29453a') + '" stroke="' + (f === 0 && !info.root ? '#29453a' : 'none') + '" stroke-width="2"/>' +
        '<text x="' + x(f) + '" y="' + (y + 4) + '" text-anchor="middle" font-size="' + (label.length > 2 ? 9 : 11) + '" font-weight="700" fill="' + (f === 0 && !info.root ? '#29453a' : '#fff') + '">' + esc(label) + '</text></g>';
    }
  });
  const capoVisible = capoFret > 0 && capoFret >= startFret && capoFret <= endFret;
  if (capoVisible) {
    const cx = boundary(capoFret);
    svg += '<line class="capo-marker" x1="' + cx + '" y1="' + (top - 8) + '" x2="' + cx + '" y2="' + (boardBottom + 6) + '" stroke="#ba4c31" stroke-width="6"/>' +
      '<text x="' + (cx + 5) + '" y="14" font-size="11" font-weight="700" fill="#ba4c31">CAPO ' + capoFret + '</text>';
  }
  $('fb-board').innerHTML = svg + '</svg>';
  const capoInfo = capoFret ? ' · capo ' + capoFret + (capoVisible ? '' : ' (outside displayed fret range)') : ' · no capo';
  $('fb-info').innerHTML = '<b>' + esc(cur.root.name + ' ' + cur.name) + '</b> · ' + esc(cur.notes.join(' ')) + ' · formula ' + esc(cur.formula) + ' · ' + strings + ' strings · frets ' + startFret + '–' + endFret + capoInfo + ' · ' + esc(TUNINGS.find(t => t[0] === kind)[1]) + ' (open strings, low to high: ' + esc(open.slice().reverse().map(m => capoFret ? midiName(m) + '→' + midiName(m + capoFret) : midiName(m)).join(' ')) + ') — red notes are roots; frets below the capo are muted. Tap a note to hear its concert pitch.';
  syncFavorite();
}

function updateStringCount() {
  const count = +$('fb-strings').value, kind = $('fb-tuning').value;
  if (kind !== 'custom') openNotes = tuning(14, kind);
  else openNotes = Array.from({ length: 14 }, (_, i) => validMidi(openNotes[i]) ? openNotes[i] : standardOpens(14)[i]);
  drawStringTunings(); render();
}
$('fb-strings').onchange = updateStringCount;
$('fb-tuning').onchange = () => {
  const kind = $('fb-tuning').value;
  if (kind !== 'custom') openNotes = tuning(+$('fb-strings').value, kind);
  drawStringTunings(); render();
};
$('fb-start').onchange = () => {
  startFret = fretValue($('fb-start').value, startFret);
  if (startFret > endFret) { endFret = startFret; $('fb-end').value = endFret; }
  $('fb-start').value = startFret; render();
};
$('fb-end').onchange = () => {
  endFret = fretValue($('fb-end').value, endFret);
  if (endFret < startFret) { startFret = endFret; $('fb-start').value = startFret; }
  $('fb-end').value = endFret; render();
};
$('fb-capo').onchange = () => { capoFret = fretValue($('fb-capo').value, capoFret); $('fb-capo').value = capoFret; render(); };
['fb-key', 'fb-shape', 'fb-labels'].forEach(id => { $(id).onchange = render; });
$('fb-shape').addEventListener('pointerdown', () => {
  const select = $('fb-shape');
  if (select.options.length && select.value !== select.options[0].value) {
    select.value = select.options[0].value;
    render();
  }
});
const playDot = (el) => { const m = +el.dataset.midi; if (Number.isFinite(m)) tone.playFreq(tone.midiToFreq(m), 1.2); };
$('fb-board').addEventListener('click', (e) => { const g = e.target.closest('.dot'); if (g) playDot(g); });
$('fb-board').addEventListener('keydown', (e) => { const g = e.target.closest('.dot'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); playDot(g); } });
// Export and playback use the selected formula in concert pitch; string taps use custom open pitch + physical fret.
function favoriteRecord() {
  const cur = current();
  const data = {
    key: cur.root.name, shape: cur.name, formula: cur.formula, group: cur.group,
    strings: +$('fb-strings').value, tuningKey: $('fb-tuning').value,
    openNotes: openNotes.slice(0, +$('fb-strings').value), startFret, endFret, capoFret,
    labels: $('fb-labels').value, notes: cur.notes.slice()
  };
  const serialized = JSON.stringify(data);
  let hash = 2166136261;
  for (let i = 0; i < serialized.length; i++) hash = Math.imul(hash ^ serialized.charCodeAt(i), 16777619);
  const id = cur.root.name + '-' + (hash >>> 0).toString(36);
  return {
    type: 'fretboard-diagram', id, title: cur.root.name + ' ' + cur.name,
    href: 'theory-decks/Fretboard%20Diagrams/index.html?favorite=' + encodeURIComponent(id),
    data
  };
}
function syncFavorite() {
  const button = $('fb-favorite');
  if (!button) return;
  const record = favoriteRecord();
  let saved = false;
  try {
    const items = JSON.parse(localStorage.getItem('st_favorites_v1') || '[]');
    saved = Array.isArray(items) && items.some(item => item && item.type === record.type && item.id === record.id);
  } catch (error) {}
  button.textContent = saved ? '★ Saved' : '☆ Favorite';
  button.setAttribute('aria-pressed', String(saved));
  button.title = saved ? 'Remove diagram from Favorites' : 'Save diagram to Favorites';
}
$('fb-favorite').addEventListener('click', () => {
  const status = $('fb-export-status'), record = favoriteRecord();
  try {
    const items = JSON.parse(localStorage.getItem('st_favorites_v1') || '[]');
    const list = Array.isArray(items) ? items.filter(item => item && typeof item.type === 'string' && typeof item.id === 'string' && typeof item.title === 'string') : [];
    const index = list.findIndex(item => item.type === record.type && item.id === record.id);
    if (index >= 0) list.splice(index, 1);
    else {
      if (list.length >= 5000) throw new Error('Favorites reached the 5,000-item limit. Remove an item before saving this diagram.');
      list.push(Object.assign(record, { updated: Date.now() }));
    }
    localStorage.setItem('st_favorites_v1', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('st:favoriteschange'));
    status.textContent = index >= 0 ? 'Diagram removed from Favorites.' : 'Diagram saved to Favorites.';
    syncFavorite();
  } catch (error) { status.textContent = error.message || 'Could not update Favorites. Check browser storage.'; }
});
function exportModel() {
  const cur = current(), base = 60 + cur.root.pc;
  const notes = ascending(cur.degs).map(semitones => base + semitones);
  if (cur.group.toLowerCase().includes('scale')) notes.push(base + 12);
  return {
    title: cur.root.name + ' ' + cur.name,
    key: cur.root.name,
    shape: cur.name,
    group: cur.group,
    formula: cur.formula,
    notes,
    strings: +$('fb-strings').value,
    openNotes: openNotes.slice(0, +$('fb-strings').value),
    tuning: $('fb-tuning').selectedOptions[0].textContent,
    startFret,
    endFret,
    capoFret,
    svg: $('fb-board').querySelector('svg').cloneNode(true),
    summary: $('fb-info').textContent,
  };
}
$('fb-play').onclick = () => tone.playEvents([exportModel().notes], 'arpeggio');
$('fb-stop').onclick = () => tone.stopAll();
TD['fretboard.js'] = { getExportModel: exportModel };
// Another tab changed the string count on the Play or Settings page
// Another Fretboard tab (or Settings → Reset / Import) changed the saved view
window.addEventListener('storage', (e) => { if (e.key === 'td-fret' || e.key === null) { restore(); drawStringTunings(); render(); } });
window.addEventListener('storage', (e) => { if (e.key === 'td-strings' && e.newValue && [...$('fb-strings').options].some(o => o.value === e.newValue)) { $('fb-strings').value = e.newValue; updateStringCount(); } });
window.addEventListener('storage', (e) => { if (e.key === 'st_favorites_v1' || e.key === null) syncFavorite(); });
window.addEventListener('pageshow', syncFavorite);
window.addEventListener('st:favoriteschange', syncFavorite);
render();
})(window.TD = window.TD || {});
