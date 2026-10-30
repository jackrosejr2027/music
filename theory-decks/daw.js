(function (TD) {
'use strict';
// DAW page: a step grid (down to 32nd notes) of melody, chord and bass lanes per bar, with per-bar meter, beat
// grouping, tempo, key, scale and chord changes; sections arranged into a song; cards inserted from any deck;
// live key / scale / chord changes while playing. Everything runs and saves locally.
const C = TD['daw-core.js'];
const { DECKS } = TD['decks.js'];
const { parseFormula, ascending, parseDeg, noteToTonic } = TD['theory.js'];
const { stopAll, playEvents } = TD['tone.js'];
const { soundFor, shiftTo } = TD['sound.js'];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STORE = 'td-daw';
const store = {
  get() { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } },
  set(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); return true; } catch { return false; } },
};

let song = C.cleanSong(store.get());
const view = { sec: 0, bar: 0, cur: { bar: 0, t: 0, r: 1 }, card: -1 };
const live = { key: '', scale: '', chord: null };
const undo = [], redo = [];
const { PRESETS } = TD['daw-presets.js'];

// ---------- editing ----------
let saveTimer = null;
let askedPersist = false;
function save() {
  // once per visit, ask the browser (silently) to keep this site's data safe from automatic clearing
  if (!askedPersist) { askedPersist = true; try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(on => on || navigator.storage.persist()).catch(() => {}); } catch { /* not supported */ } }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveTimer = null; if (!store.set(song)) status('Could not save on this device (storage full or blocked) — use Export.'); }, 250);
}
// Write a pending save at once (the page is closing or going to the background)
function flushSave() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; if (!store.set(song)) status('Could not save on this device (storage full or blocked) — use Export.'); } }
function commit(fn, opts = {}) {
  const before = JSON.stringify(song);
  fn();
  if (JSON.stringify(song) !== before) { undo.push(before); if (undo.length > 100) undo.shift(); redo.length = 0; } // no-op edits leave no undo step
  save();
  clampView();
  if (opts.grid !== false) renderGrid();
  renderInspector();
  if (opts.sections) renderSections();
  syncUndo();
}
function syncUndo() { $('undo').disabled = !undo.length; $('redo').disabled = !redo.length; }
function clampView() {
  view.sec = Math.max(0, Math.min(view.sec, song.sections.length - 1));
  const n = sec().measures.length;
  view.bar = Math.max(0, Math.min(view.bar, n - 1));
  view.cur.bar = Math.max(0, Math.min(view.cur.bar, n - 1));
  view.cur.t = Math.max(0, Math.min(view.cur.t, C.measureTicks(sec().measures[view.cur.bar]) - 1));
}
const sec = () => song.sections[view.sec];
const bar = (i = view.bar) => sec().measures[i];
const lenTicks = () => +$('len').value;
const cellTicks = () => +$('res').value;

// Keep a bar's notes and chord changes inside it after its meter changes
function fitBar(m) {
  const ticks = C.measureTicks(m);
  // After a change to a smaller scale (7 → 5 notes) a chord on degree 6 or 7 plays wrapped round the scale;
  // store the degree it really plays, so the inspector and chord menu show the chord that is heard
  const n = C.measureCtx(m).scale.semis.length;
  m.chords.forEach(c => { if (c.chord && c.chord.rel === undefined && c.chord.deg > n) c.chord = Object.assign({}, c.chord, { deg: (c.chord.deg - 1) % n + 1 }); });
  ['mel', 'chd', 'bas'].forEach(k => { m[k] = m[k].filter(e => e.t < ticks); m[k].forEach(e => { e.d = Math.max(1, Math.min(e.d, ticks - e.t)); }); });
  m.chords = m.chords.filter(c => c.t < ticks);
  if (m.groups && m.groups.reduce((a, b) => a + b, 0) !== m.num) m.groups = null;
}

// ---------- pitch helpers ----------
// A chromatic offset from the tonic → the nearest degree of the bar's scale plus an accidental
function toScaleNote(semi, scale) {
  const n = scale.semis.length;
  const oct = Math.floor(semi / 12), s = ((semi % 12) + 12) % 12;
  let best = 0, bd = 99;
  scale.semis.forEach((x, i) => { const d = s - x; if (Math.abs(d) < Math.abs(bd)) { bd = d; best = i; } });
  return { deg: oct * n + best + 1, acc: bd };
}
const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const midiName = (m) => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const ORD = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th');
function beatLabel(m, t) {
  const unit = C.TPW / m.den;
  const beat = Math.floor(t / unit) + 1, rest = t % unit;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const g = gcd(rest, C.TPW);
  return 'beat ' + beat + (rest ? ' + ' + rest / g + '/' + C.TPW / g : '');
}

// ---------- transport & live ----------
let player = null;
function liveState() {
  return { key: live.key || null, scale: live.scale || null, chord: live.chord };
}
player = C.createPlayer(() => song, {
  live: liveState,
  loop: () => $('loop').checked,
  click: () => $('click').checked,
  scope: () => $('scope').value,
  section: () => view.sec,
  empty: () => status('Nothing to play — the song has no sections. Use “+ Add section”.'),
  stopped: () => { $('play').textContent = '▶ Play'; $('play').classList.remove('on'); clearHead(); renderDawFretboards(); setTimeout(applyRemote, 0); },
});
function start(fromBar) {
  let index = 0;
  if (fromBar) {
    const list = player.order(song);
    index = list.findIndex(r => r.si === view.sec && r.mi === view.bar);
    if (index < 0) { status('Section ' + sec().name + ' is not in the song — playing it on its own. Use “+ Add section” to put it in the song.'); $('scope').value = 'section'; index = view.bar; }
  }
  followHead.lastBar = null;
  player.play(index);
  if (!player.playing()) return; // nothing to play: the button stays ▶ Play
  $('play').textContent = '■ Stop';
  $('play').classList.add('on');
  requestAnimationFrame(followHead);
}
$('play').onclick = () => { if (player.playing()) player.stop(); else start(false); };
$('play-bar').onclick = () => start(true);
['loop', 'click', 'scope'].forEach(id => { $(id).onchange = () => { saveUi(); if (id === 'scope' && player.playing()) start(false); }; });
// Grid, Note, Play, Loop and Click are remembered on this device (they also name MIDI exports)
const UI_KEY = 'td-daw-ui';
function saveUi() {
  try { localStorage.setItem(UI_KEY, JSON.stringify({ gridDefaultVersion: 2, res: $('res').value, len: $('len').value, scope: $('scope').value, loop: $('loop').checked, click: $('click').checked })); } catch { /* storage blocked */ }
}
(function loadUi() {
  let u = null;
  try { u = JSON.parse(localStorage.getItem(UI_KEY) || 'null'); } catch { u = null; }
  if (!u || typeof u !== 'object') return;
  // The previous release defaulted to 1/16; migrate that legacy default to the new 1/4 default once.
  if (u.gridDefaultVersion !== 2) {
    if (String(u.res) === '6') u.res = '24';
    u.gridDefaultVersion = 2;
    try { localStorage.setItem(UI_KEY, JSON.stringify(u)); } catch { /* storage blocked */ }
  }
  const pick = (id, v) => { if (v !== undefined && v !== null && [...$(id).options].some(o => o.value === String(v))) $(id).value = String(v); };
  pick('res', u.res); pick('len', u.len); pick('scope', u.scope);
  $('loop').checked = u.loop === true; $('click').checked = u.click === true;
})();
$('len').addEventListener('change', saveUi);
$('tempo').onchange = () => {
  const v = Math.round(+$('tempo').value);
  if (!(v >= 20 && v <= 400)) { status('Tempo must be 20–400 ♩ per minute — the song keeps ♩ = ' + song.tempo + '.'); $('tempo').value = song.tempo; return; }
  commit(() => { song.tempo = v; }, { grid: false }); $('tempo').value = song.tempo;
};
$('swing').onchange = () => commit(() => { song.swing = +$('swing').value; }, { grid: false });
$('res').onchange = () => { saveUi(); renderGrid(); renderInspector(); };
$('title').onchange = () => { commit(() => { song.title = $('title').value.trim().slice(0, 80) || 'Untitled song'; }, { grid: false }); $('title').value = song.title; };
$('undo').onclick = () => doUndo(undo, redo, 'undo');
$('redo').onclick = () => doUndo(redo, undo, 'redo');
function doUndo(from, to, what) {
  if (!from.length) { status('Nothing to ' + what + '.'); return; }
  to.push(JSON.stringify(song));
  song = C.cleanSong(JSON.parse(from.pop()));
  save(); clampView(); renderAll(); syncUndo();
  status(what === 'undo' ? 'Undone.' : 'Redone.');
}
// New: a blank song (empty bars to fill in — a totally new progression) or one of the ready-made progressions
{
  const groups = [];
  PRESETS.forEach((p, i) => { let g = groups.find(x => x.name === p.group); if (!g) groups.push(g = { name: p.group, items: [] }); g.items.push(i); });
  // Blank is always first; the search box narrows the progressions by name, genre, scale or numerals (bVII = ♭VII)
  const fill = (q) => {
    const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean).map(w => w.replace(/^b(?=[iv]+(\d|maj|ø|°|\+|$))/, '♭').replace(/^#/, '♯'));
    const match = (p) => { const text = (p.group + ' ' + p.name + ' ' + p.scale + ' ' + p.prog).toLowerCase(); return words.every(w => text.includes(w)); };
    const keep = $('new-from').value;
    let found = 0;
    $('new-from').innerHTML = '<option value="blank">Blank — empty bars, your own progression</option>' +
      groups.map(g => { const items = g.items.filter(i => match(PRESETS[i])); found += items.length; return items.length ? '<optgroup label="' + esc(g.name) + ' · ' + items.length + '">' + items.map(i => '<option value="' + i + '">' + esc(PRESETS[i].name) + ' · ' + esc(PRESETS[i].prog) + '</option>').join('') + '</optgroup>' : ''; }).join('');
    if (words.length && found) $('new-from').selectedIndex = 1; // the first match, ready to create
    else if ([...$('new-from').options].some(o => o.value === keep)) $('new-from').value = keep;
    return found;
  };
  fill('');
  $('new-find').addEventListener('input', () => { const n = fill($('new-find').value); newPreview(); if (!n) $('new-preview').textContent = 'No progression matches “' + $('new-find').value + '” — Blank is still available.'; });
  $('new-key').innerHTML = C.KEY_NAMES.map(k => '<option>' + k + '</option>').join('');
  $('new-scale').innerHTML = C.SCALES.map(s => '<option>' + esc(s.name) + '</option>').join('');
}
$('new-bars').addEventListener('input', newPreview);
$('new').onclick = () => { $('newbox').hidden = !$('newbox').hidden; if (!$('newbox').hidden) { $('new-tempo').value = song.tempo; newPreview(); $('new-from').focus(); } };
$('new-cancel').onclick = () => { $('newbox').hidden = true; };
['new-from', 'new-key', 'new-scale', 'new-per', 'new-num', 'new-den'].forEach(id => { $(id).addEventListener('change', newPreview); });
function newPreview() {
  const blank = $('new-from').value === 'blank';
  $('new-bars-wrap').hidden = !blank;
  $('new-per-wrap').hidden = blank;
  $('new-scale-wrap').hidden = !blank;
  if (blank) { const n = Math.max(1, Math.min(64, Math.round(+$('new-bars').value) || 8)); $('new-preview').textContent = n + ' empty bars in ' + $('new-key').value + ' ' + $('new-scale').value + ' — you choose every chord'; return; }
  const p = PRESETS[+$('new-from').value];
  if (!p) { $('new-preview').textContent = ''; return; }
  const ctx = { key: $('new-key').value, keyPc: noteToTonic($('new-key').value).pc, scale: C.scaleByName(p.scale) || C.SCALES[0] };
  $('new-preview').textContent = p.scale + ': ' + p.prog.split(' ').map(b => b.split('+').map(t => C.chordName(C.chordFromNumeral(t, ctx.scale), ctx)).join('+')).join(' – ');
}
// Bars built from the New box settings
function newMeasures() {
  const num = Math.max(1, Math.min(32, Math.round(+$('new-num').value) || 4)), den = +$('new-den').value;
  const key = $('new-key').value;
  const proto = Object.assign(C.newMeasure(), { num, den, groups: null, key });
  if ($('new-from').value === 'blank') {
    const n = Math.max(1, Math.min(64, Math.round(+$('new-bars').value) || 8));
    proto.scale = (C.scaleByName($('new-scale').value) || C.SCALES[0]).name; proto.scaleSemis = null;
    return Array.from({ length: n }, () => { const m = C.newMeasure(proto); m.chords = []; m.chd = []; m.bas = []; return m; });
  }
  const p = PRESETS[+$('new-from').value];
  const per = +$('new-per').value;
  const scale = C.scaleByName(p.scale) || C.SCALES[0];
  proto.scale = scale.name; proto.scaleSemis = null;
  const out = [];
  p.prog.split(' ').forEach(tok => {
    const parts = tok.split('+').map(t => C.chordFromNumeral(t, scale));
    const reps = per < 1 ? 1 : per;
    const chunks = per < 1 && parts.length === 1 ? [parts] : [parts];
    for (let r = 0; r < reps; r++) chunks.forEach(chs => {
      const m = C.newMeasure(proto);
      const ticks = C.measureTicks(m);
      m.chords = chs.map((ch, i) => ({ t: Math.round(i * ticks / chs.length), chord: JSON.parse(JSON.stringify(ch)) }));
      out.push(C.fillRhythm(m));
    });
  });
  if (per === 0.5) { // two bars' chords into one bar
    const merged = [];
    for (let i = 0; i < out.length; i += 2) {
      const a = out[i], b = out[i + 1];
      if (!b || a.chords.length > 1 || b.chords.length > 1) { merged.push(a); if (b) merged.push(b); continue; }
      a.chords.push({ t: Math.round(C.measureTicks(a) / 2), chord: b.chords[0].chord });
      merged.push(C.fillRhythm(a));
    }
    return merged;
  }
  return out;
}
// A new song keeps the Mix (volumes, mutes and sounds) the user set
function keepMix(fresh) {
  if (song && song.drums) fresh.drums = song.drums;
  ['vol', 'mute', 'voice'].forEach(k => { if (song && song[k]) fresh[k] = JSON.parse(JSON.stringify(song[k])); });
  return fresh;
}
function presetName() { return $('new-from').value === 'blank' ? 'Untitled song' : PRESETS[+$('new-from').value].name.replace(/ \(.*\)$/, ''); }
$('new-song').onclick = () => {
  player.stop();
  const measures = newMeasures().map(m => { delete m.blank; return m; });
  const tempo = Math.round(+$('new-tempo').value);
  commit(() => {
    song = keepMix(C.newSong());
    song.title = presetName();
    if (tempo >= 20 && tempo <= 400) song.tempo = tempo;
    song.sections = [{ name: 'A', measures }];
    song.arrangement = [0];
    view.sec = 0; view.bar = 0; view.cur = { bar: 0, t: 0 };
  }, { sections: true });
  $('newbox').hidden = true;
  renderAll();
  status($('new-from').value === 'blank' ? 'Blank song: right-click (or press C on) a bar to choose its chord, click cells to add notes.' : 'New song from ' + presetName() + ' — Undo brings the old one back.');
};
$('new-section').onclick = () => {
  const measures = newMeasures().map(m => { delete m.blank; return m; });
  commit(() => {
    song.sections.push({ name: nextName(), measures });
    song.arrangement.push(song.sections.length - 1);
    view.sec = song.sections.length - 1; view.bar = 0; view.cur = { bar: 0, t: 0 };
  }, { sections: true });
  $('newbox').hidden = true;
  renderLive();
  status('Added section ' + sec().name + ' (' + measures.length + ' bars) to the end of the song.');
};
$('export').onclick = () => {
  const fmt = $('export-fmt').value;
  if (fmt === 'pdf') {
    flushSave();
    const scope = $('scope').value;
    try {
      const pdf = TD['daw-pdf.js'].songToPdf(song, { scope, section: view.sec });
      if (!pdf.bars) { status('Nothing to export — this selection has no bars.'); return; }
      const name = (song.title || 'song').replace(/[^\p{L}\p{N}\- ]+/gu, '').trim().replace(/\s+/g, '-') || 'song';
      const base = scope === 'section' ? name + '-section-' + (view.sec + 1) : name;
      downloadBlob(pdf.blob, 'pdf', base);
      status('PDF exported: ' + pdf.bars + ' bars across ' + pdf.pages + ' ' + (pdf.pages === 1 ? 'page' : 'pages') + '.');
    } catch (err) { console.error(err); status('Could not export PDF on this device.'); }
    return;
  }
  if (fmt === 'mid') {
    flushSave();
    // The Play setting decides what is exported: the whole song in arrangement order, or this section
    const scope = $('scope').value;
    const midi = TD['daw-midi.js'].songToMidi(song, { scope, section: view.sec });
    if (!midi.bars) { status('Nothing to export — ' + (scope === 'section' ? 'this section' : 'the song') + ' has no bars.'); return; }
    const name = midiFileName(scope);
    downloadBlob(new Blob([midi.bytes], { type: 'audio/midi' }), 'mid', name);
    status('MIDI exported as “' + name + '.mid”: ' + midi.bars + ' bars, ' + Math.round(midi.seconds) + ' s — tempo, meter and key changes, section markers, chord symbols, and Melody, Chords and Bass tracks.');
    return;
  }
  const text = fmt === 'txt' ? exportText() : fmt === 'csv' ? exportCsv() : JSON.stringify(song, null, 1);
  const type = fmt === 'txt' ? 'text/plain' : fmt === 'csv' ? 'text/csv' : 'application/json';
  downloadBlob(new Blob([fmt === 'json' ? text : '\ufeff' + text], { type: type + ';charset=utf-8' }), fmt);
};
// MIDI file name: Key - Song Title - bpm - Swing - grid - note - play
// e.g. “E♭ Natural minor - Night Drive - 92 bpm - Swing Medium - Grid 1-16 - Note 1-8 - Song”
function midiFileName(scope) {
  const first = scope === 'section' ? sec().measures[0] : (song.arrangement.map(i => song.sections[i]).find(x => x && x.measures.length) || song.sections.find(x => x.measures.length) || sec()).measures[0];
  const ctx = C.measureCtx(first);
  const label = (id) => { const el = $(id); return el.options[el.selectedIndex] ? el.options[el.selectedIndex].textContent : el.value; };
  const parts = [
    ctx.key + ' ' + ctx.scale.name.replace(/\s*\(.*\)/, ''),
    (song.title || '').trim() || 'Untitled song',
    (first.tempo || song.tempo) + ' bpm',
    'Swing ' + label('swing'),
    'Grid ' + label('res'),
    'Note ' + label('len'),
    scope === 'section' ? 'Section ' + sec().name : 'Song',
  ];
  // characters no file system accepts (/ \ : * ? " < > |) become dashes or go
  return parts.map(p => String(p).replace(/\//g, '-').replace(/[\\:*?"<>|\u0000-\u001f]+/g, '').replace(/\s+/g, ' ').trim()).join(' - ').slice(0, 200);
}
function downloadBlob(blob, ext, base) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (base || (song.title || '').replace(/[^\p{L}\p{N}\- ]+/gu, '').trim().replace(/\s+/g, '-') || 'song') + '.' + ext;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
$('import').onchange = () => {
  const file = $('import').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onerror = () => status('Could not read that file.');
  if (/\.midi?$/i.test(file.name) || /midi/.test(file.type)) {
    // A .mid file: our own exports open exactly (the song is inside); others bring their notes in as melody
    reader.onload = () => {
      let got = null;
      try { got = TD['daw-midi.js'].midiToSong(reader.result, file.name); } catch (err) { console.error(err); }
      if (!got) { status('That MIDI file has no notes the DAW can read.'); return; }
      player.stop();
      commit(() => { song = got.song; view.sec = 0; view.bar = 0; view.cur = { bar: 0, t: 0 }; }, { sections: true });
      renderAll();
      status(got.exact ? 'Imported "' + song.title + '" from its MIDI file, exactly as exported.' : 'Imported the notes of "' + song.title + '" as melody (' + sec().measures.length + ' bars, ♩ = ' + song.tempo + ') — add chords with right-click or the chord menu. Undo brings the old song back.');
    };
    reader.readAsArrayBuffer(file);
    $('import').value = '';
    return;
  }
  reader.onload = () => {
    let data = null;
    try { data = JSON.parse(reader.result); } catch { status('That file is not a song file. Import opens JSON and MIDI exports (and other MIDI files); TXT and CSV exports are for reading and spreadsheets.'); return; }
    if (!data || !Array.isArray(data.sections)) { status('That JSON file is not a DAW song.'); return; }
    let clean = null;
    try { clean = C.cleanSong(data); } catch (err) { console.error(err); }
    if (!clean || !clean.sections.length) { status('That song file is damaged and could not be opened.'); return; }
    player.stop();
    // The cursor goes back to the start too: the old one may point past the end of the imported song
    commit(() => { song = clean; view.sec = 0; view.bar = 0; view.cur = { bar: 0, t: 0 }; }, { sections: true });
    renderAll();
    status('Imported "' + song.title + '".');
  };
  reader.readAsText(file);
  $('import').value = '';
};

// ---------- text and spreadsheet export ----------
const gcd = (a, b) => b ? gcd(b, a % b) : a;
function lenLabel(d) {
  const named = { 96: 'whole', 72: 'dotted 1/2', 48: '1/2', 36: 'dotted 1/4', 32: '1/2 triplet', 24: '1/4', 18: 'dotted 1/8', 16: '1/4 triplet', 12: '1/8', 9: 'dotted 1/16', 8: '1/8 triplet', 6: '1/16', 4: '1/16 triplet', 3: '1/32', 2: '1/32 triplet' };
  if (named[d]) return named[d];
  const g = gcd(d, C.TPW);
  return d / g + '/' + C.TPW / g;
}
function eachBar(fn) {
  song.sections.forEach((s, si) => s.measures.forEach((m, mi) => fn(s, si, m, mi, C.measureCtx(m))));
}
function exportText() {
  const lines = [song.title, '♩ = ' + song.tempo + (song.swing ? ' · swing ' + ($('swing').options[$('swing').selectedIndex] || { textContent: String(song.swing) }).textContent.toLowerCase() : ''), 'Song: ' + (song.arrangement.map(i => song.sections[i].name).join(' ') || '(empty)')].concat(song.drums && song.drums !== 'off' ? ['Drums: ' + C.DRUM_PATTERNS[song.drums] + (song.mute.drm ? ' (muted)' : '')] : []);
  let last = null;
  eachBar((s, si, m, mi, ctx) => {
    if (last !== si) { lines.push('', 'Section ' + s.name + ' (' + s.measures.length + ' bars)'); last = si; }
    lines.push('Bar ' + (mi + 1) + ' | ' + m.num + '/' + m.den + (m.groups ? ' (' + m.groups.join('+') + ')' : '') + ' | ' + m.key + ' ' + ctx.scale.name + ' | ♩=' + (m.tempo || song.tempo));
    lines.push('  Chords: ' + (m.chords.length ? '' : '(none)') + m.chords.map(c => beatLabel(m, c.t) + ' ' + C.chordName(c.chord, ctx) + ' (' + C.chordRoman(c.chord, ctx) + ')').join(' · '));
    if (m.mel.length) lines.push('  Melody: ' + m.mel.map(n => beatLabel(m, n.t) + ' ' + midiName(C.melodyMidi(n, ctx)) + ' ' + lenLabel(n.d)).join(' · '));
    if (m.chd.length) lines.push('  Chord hits: ' + m.chd.map(n => beatLabel(m, n.t) + ' ' + lenLabel(n.d)).join(' · '));
    if (m.bas.length) lines.push('  Bass: ' + m.bas.map(n => { const x = C.bassMidi(C.chordAt(m, n.t), ctx); return beatLabel(m, n.t) + ' ' + (x === null ? 'rest (no chord)' : midiName(x)) + ' ' + lenLabel(n.d); }).join(' · '));
  });
  return lines.join('\r\n') + '\r\n';
}
function exportCsv() {
  const q = (v) => { v = String(v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const rows = [['section', 'bar', 'meter', 'beat_groups', 'key', 'scale', 'tempo', 'lane', 'position', 'start_96ths', 'length_96ths', 'length', 'note', 'midi', 'chord', 'roman']];
  eachBar((s, si, m, mi, ctx) => {
    const head = [s.name, mi + 1, m.num + '/' + m.den, (m.groups || C.groupsOf(m)).join('+'), m.key, ctx.scale.name, m.tempo || song.tempo];
    const chordCols = (t) => { const ch = C.chordAt(m, t); return ch ? [C.chordName(ch, ctx), C.chordRoman(ch, ctx)] : ['', '']; };
    m.chords.forEach(c => rows.push(head.concat(['chord change', beatLabel(m, c.t), c.t, '', '', '', C.chordMidis(c.chord, ctx).join(' ')], chordCols(c.t))));
    m.mel.forEach(n => { const x = C.melodyMidi(n, ctx); rows.push(head.concat(['melody', beatLabel(m, n.t), n.t, n.d, lenLabel(n.d), midiName(x), x], chordCols(n.t))); });
    m.chd.forEach(n => { const ch = C.chordAt(m, n.t); rows.push(head.concat(['chords', beatLabel(m, n.t), n.t, n.d, lenLabel(n.d), C.chordMidis(ch, ctx).map(midiName).join(' '), C.chordMidis(ch, ctx).join(' ')], chordCols(n.t))); });
    m.bas.forEach(n => { const x = C.bassMidi(C.chordAt(m, n.t), ctx); rows.push(head.concat(['bass', beatLabel(m, n.t), n.t, n.d, lenLabel(n.d), x === null ? '' : midiName(x), x === null ? '' : x], chordCols(n.t))); });
  });
  return rows.map(r => r.map(q).join(',')).join('\r\n') + '\r\n';
}

// Live: override key, scale and chord of whatever is playing, immediately
$('live-key').innerHTML = '<option value="">As written</option>' + C.KEY_NAMES.map(k => '<option>' + k + '</option>').join('');
$('live-scale').innerHTML = '<option value="">As written</option>' + C.SCALES.map(s => '<option>' + esc(s.name) + '</option>').join('');
$('live-key').onchange = () => { live.key = $('live-key').value; renderLive(); };
$('live-scale').onchange = () => { live.scale = $('live-scale').value; renderLive(); };
$('live-size').onchange = () => { if (live.chord) live.chord = { deg: live.chord.deg, size: +$('live-size').value }; renderLive(); };
function liveRefBar() {
  const cur = player.playing() && player.current();
  return cur ? song.sections[cur.ref.si].measures[cur.ref.mi] : bar();
}
function renderLive() {
  const ctx = C.measureCtx(liveRefBar(), liveState());
  const size = +$('live-size').value;
  const n = Math.min(7, ctx.scale.semis.length);
  let html = '<button type="button" data-live="0" class="' + (live.chord ? '' : 'on') + '" title="Play the written chords (0)">Written</button>';
  for (let d = 1; d <= n; d++) {
    const ch = { deg: d, size };
    html += '<button type="button" data-live="' + d + '" class="' + (live.chord && live.chord.deg === d ? 'on' : '') + '" title="Key ' + d + '">' + esc(C.chordRoman(ch, ctx)) + ' <small>' + esc(C.chordName(ch, ctx)) + '</small></button>';
  }
  $('live-chords').innerHTML = html;
  renderDawFretboards();
}
$('live-chords').onclick = (e) => {
  const b = e.target.closest('[data-live]');
  if (!b) return;
  setLiveChord(+b.dataset.live);
};
function setLiveChord(d) {
  live.chord = d ? { deg: d, size: +$('live-size').value } : null;
  renderLive();
}

// ---------- chord and major-mode fretboards ----------
const IONIAN_SEMIS = [0, 2, 4, 5, 7, 9, 11];
const MODE_NAMES = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];
const MODE_PENTATONICS = [[0, 2, 4, 7, 9], [0, 3, 5, 7, 10], [0, 1, 5, 7, 10], [0, 2, 4, 6, 9], [0, 4, 5, 7, 10], [0, 3, 5, 7, 8], [0, 3, 5, 6, 10]];
const MAJOR_BLUES = [0, 2, 3, 4, 7, 9];
const MINOR_BLUES = [0, 3, 5, 6, 7, 10];
const FRET_NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const GUITAR_OPEN_MIDI = [64, 59, 55, 50, 45, 40];
let fretboardSignature = null;
function drawDawFretboard(host, pitchClasses, rootPc, label) {
  if (!pitchClasses.size) {
    const empty = document.createElement('p');
    empty.className = 'daw-sub';
    empty.textContent = 'No chord at this position.';
    host.replaceChildren(empty);
    return;
  }
  const ns = 'http://www.w3.org/2000/svg';
  const frets = 12, left = 34, top = 18, fretWidth = 31, stringGap = 21;
  const width = left + frets * fretWidth + 16;
  const height = top + stringGap * (GUITAR_OPEN_MIDI.length - 1) + 27;
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label + ' on standard guitar, frets 0 to 12');
  svg.classList.add('daw-fretboard-svg');
  for (let fret = 0; fret <= frets; fret++) {
    const line = document.createElementNS(ns, 'line');
    const x = left + fret * fretWidth;
    line.setAttribute('x1', x); line.setAttribute('x2', x);
    line.setAttribute('y1', top); line.setAttribute('y2', top + stringGap * (GUITAR_OPEN_MIDI.length - 1));
    line.setAttribute('class', 'daw-fret-fret' + (fret === 0 ? ' nut' : ''));
    svg.appendChild(line);
    if (fret > 0) {
      const number = document.createElementNS(ns, 'text');
      number.setAttribute('x', left + (fret - .5) * fretWidth);
      number.setAttribute('y', height - 3);
      number.setAttribute('class', 'daw-fret-label');
      number.textContent = String(fret);
      svg.appendChild(number);
    }
  }
  GUITAR_OPEN_MIDI.forEach((openMidi, stringIndex) => {
    const y = top + stringIndex * stringGap;
    const string = document.createElementNS(ns, 'line');
    string.setAttribute('x1', left); string.setAttribute('x2', left + frets * fretWidth);
    string.setAttribute('y1', y); string.setAttribute('y2', y);
    string.setAttribute('class', 'daw-fret-string');
    svg.appendChild(string);
    const openLabel = document.createElementNS(ns, 'text');
    openLabel.setAttribute('x', left - 5); openLabel.setAttribute('y', y + 3);
    openLabel.setAttribute('class', 'daw-fret-open');
    openLabel.textContent = FRET_NOTE_NAMES[openMidi % 12];
    svg.appendChild(openLabel);
    for (let fret = 0; fret <= frets; fret++) {
      const midi = openMidi + fret, pc = midi % 12;
      if (!pitchClasses.has(pc)) continue;
      const x = fret === 0 ? left - 12 : left + (fret - .5) * fretWidth;
      const group = document.createElementNS(ns, 'g');
      group.setAttribute('class', 'daw-fret-note' + (pc === rootPc ? ' is-root' : ''));
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 8);
      const note = document.createElementNS(ns, 'text');
      note.setAttribute('x', x); note.setAttribute('y', y + 3);
      note.textContent = FRET_NOTE_NAMES[pc];
      group.append(dot, note);
      svg.appendChild(group);
    }
  });
  host.replaceChildren(svg);
}
function renderDawFretboards(position) {
  const activePosition = position || (player.playing() && player.current());
  const m = activePosition ? song.sections[activePosition.ref.si]?.measures[activePosition.ref.mi] : bar();
  if (!m) return;
  const ctx = C.measureCtx(m, liveState());
  const tick = activePosition ? activePosition.t : (view.cur.bar === view.bar ? view.cur.t : 0);
  const chord = C.chordAt(m, tick, liveState());
  const parts = C.chordParts(chord, ctx);
  const chordCaption = $('daw-chord-caption');
  const scaleCaption = $('daw-scale-caption');
  const bluesCaption = $('daw-blues-caption');
  const pentatonicCaption = $('daw-pentatonic-caption');
  const chordHost = $('daw-chord-fretboard');
  const scaleHost = $('daw-scale-fretboard');
  const bluesHost = $('daw-blues-fretboard');
  const pentatonicHost = $('daw-pentatonic-fretboard');
  if (!parts) {
    const signature = JSON.stringify([ctx.key, ctx.scale.name, null]);
    if (signature === fretboardSignature) return;
    fretboardSignature = signature;
    chordCaption.textContent = 'No chord at this position.';
    scaleCaption.textContent = 'Choose a chord in the progression.';
    bluesCaption.textContent = 'Choose a chord in the progression.';
    pentatonicCaption.textContent = 'Choose a chord in the progression.';
    drawDawFretboard(chordHost, new Set(), 0, 'Chord tones');
    drawDawFretboard(scaleHost, new Set(), 0, 'Scale mode');
    drawDawFretboard(bluesHost, new Set(), 0, 'Blues scale');
    drawDawFretboard(pentatonicHost, new Set(), 0, 'Pentatonic scale');
    return;
  }
  const wrap = value => ((value % 12) + 12) % 12;
  const rootPc = wrap(ctx.keyPc + parts.root);
  const rootOffset = wrap(rootPc - ctx.keyPc);
  const modeIndex = IONIAN_SEMIS.indexOf(rootOffset);
  const mode = MODE_NAMES[modeIndex < 0 ? 0 : modeIndex];
  const modeIntervals = modeIndex < 0 ? IONIAN_SEMIS : Array.from({ length: 7 }, (_, i) => wrap(IONIAN_SEMIS[(modeIndex + i) % 7] - rootOffset));
  const scalePitchClasses = new Set(modeIntervals.map(interval => wrap(rootPc + interval)));
  const pentatonicIntervals = MODE_PENTATONICS[modeIndex < 0 ? 0 : modeIndex];
  const pentatonicPitchClasses = new Set(pentatonicIntervals.map(interval => wrap(rootPc + interval)));
  const isMinorChord = parts.shape.includes(3) && !parts.shape.includes(4);
  const bluesIntervals = isMinorChord ? MINOR_BLUES : MAJOR_BLUES;
  const bluesPitchClasses = new Set(bluesIntervals.map(interval => wrap(rootPc + interval)));
  const chordPitchClasses = new Set(parts.shape.map(interval => wrap(rootPc + interval)));
  const chordName = C.chordName(chord, ctx);
  const roman = C.chordRoman(chord, ctx);
  const rootName = FRET_NOTE_NAMES[rootPc];
  const keyName = ctx.key;
  const chordNotes = [...new Set(parts.shape.map(interval => wrap(rootPc + interval)))].map(pc => FRET_NOTE_NAMES[pc]).join(' · ');
  const scaleName = rootName + ' ' + mode;
  const scaleDetail = modeIndex < 0 ? 'chromatic to ' + keyName + ' major' : (modeIndex === 0 ? 'Ionian / major' : 'from ' + keyName + ' Ionian');
  const bluesName = rootName + (isMinorChord ? ' minor' : ' major') + ' blues';
  const pentatonicName = rootName + ' ' + mode + ' pentatonic';
  const signature = JSON.stringify([chordName, roman, chordNotes, scaleName, scaleDetail, bluesName, [...bluesPitchClasses], pentatonicName, [...pentatonicPitchClasses], [...scalePitchClasses]]);
  if (signature === fretboardSignature) return;
  fretboardSignature = signature;
  chordCaption.textContent = chordName + (roman ? ' (' + roman + ')' : '') + ' · ' + chordNotes;
  scaleCaption.textContent = scaleName + ' · ' + scaleDetail;
  bluesCaption.textContent = bluesName + ' · for ' + chordName;
  pentatonicCaption.textContent = pentatonicName + ' · ' + scaleDetail;
  drawDawFretboard(chordHost, chordPitchClasses, rootPc, chordName + ' chord tones');
  drawDawFretboard(scaleHost, scalePitchClasses, rootPc, scaleName + ' scale');
  drawDawFretboard(bluesHost, bluesPitchClasses, rootPc, bluesName);
  drawDawFretboard(pentatonicHost, pentatonicPitchClasses, rootPc, pentatonicName);
}

// ---------- sections & arrangement ----------
function renderSections() {
  $('sections').innerHTML = song.sections.map((s, i) => '<button type="button" data-sec="' + i + '" class="' + (i === view.sec ? 'on' : '') + '">' + esc(s.name) + ' <small>' + s.measures.length + '</small></button>').join('');
  $('arrangement').innerHTML = song.arrangement.length ? song.arrangement.map((si, i) =>
    '<span class="daw-arr"><button type="button" data-arr="' + i + '" class="' + (si === view.sec ? 'on' : '') + '">' + esc(song.sections[si].name) + '</button>' +
    (i ? '<button type="button" data-amove="' + i + '" title="Move earlier" aria-label="Move earlier">◀</button>' : '') +
    '<button type="button" data-adel="' + i + '" title="Remove from song" aria-label="Remove from song">×</button></span>').join('') : '<small>Empty — add a section</small>';
  $('sec-name').value = sec().name;
  $('sec-del').disabled = song.sections.length < 2;
  // A pending "Delete A?" must never delete a different section after the selection changes
  if (delArmed) { clearTimeout(delArmed); delArmed = null; }
  $('sec-del').textContent = 'Delete';
}
$('sections').onclick = (e) => { const b = e.target.closest('[data-sec]'); if (b) { view.sec = +b.dataset.sec; view.bar = 0; view.cur = { bar: 0, t: 0 }; renderAll(); } };
$('arrangement').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.arr) { view.sec = song.arrangement[+b.dataset.arr]; view.bar = 0; view.cur = { bar: 0, t: 0 }; renderAll(); return; }
  if (b.dataset.amove) { const i = +b.dataset.amove; commit(() => { const a = song.arrangement; [a[i - 1], a[i]] = [a[i], a[i - 1]]; }, { sections: true, grid: false }); }
  if (b.dataset.adel) { const i = +b.dataset.adel; commit(() => { song.arrangement.splice(i, 1); }, { sections: true, grid: false }); }
};
$('arr-add').onclick = () => commit(() => { song.arrangement.push(view.sec); }, { sections: true, grid: false });
$('sec-add').onclick = () => commit(() => {
  const last = bar(sec().measures.length - 1);
  const m = C.fillRhythm(C.newMeasure(last));
  m.chords = [{ t: 0, chord: { deg: 1, size: 3 } }];
  song.sections.push({ name: nextName(), measures: [m, C.fillRhythm(C.newMeasure(m)), C.fillRhythm(C.newMeasure(m)), C.fillRhythm(C.newMeasure(m))] });
  song.arrangement.push(song.sections.length - 1);
  view.sec = song.sections.length - 1; view.bar = 0;
}, { sections: true });
$('sec-dup').onclick = () => commit(() => {
  let name = (sec().name.slice(0, 39) + "'");
  for (let i = 2; song.sections.some(s => s.name === name); i++) name = (sec().name.slice(0, 36) + ' ' + i).slice(0, 40);
  song.sections.push({ name, measures: JSON.parse(JSON.stringify(sec().measures)) });
  song.arrangement.push(song.sections.length - 1);
  view.sec = song.sections.length - 1; view.bar = 0;
}, { sections: true });
$('sec-name').onchange = () => commit(() => {
  // Two sections with one name could not be told apart in the song row: a taken name gets a number
  const want = $('sec-name').value.trim().slice(0, 40), others = song.sections.filter(s => s !== sec());
  let name = want || nextName();
  for (let i = 2; others.some(s => s.name === name); i++) name = (want.slice(0, 36) + ' ' + i).slice(0, 40);
  if (name !== want && want) status('Section ' + want + ' already exists — this one is named ' + name + '.');
  sec().name = name;
}, { sections: true, grid: false });
let delArmed = null;
$('sec-del').onclick = () => {
  if (song.sections.length < 2) return;
  if (!delArmed) { $('sec-del').textContent = 'Delete ' + sec().name + '?'; delArmed = setTimeout(() => { delArmed = null; $('sec-del').textContent = 'Delete'; }, 3000); return; }
  clearTimeout(delArmed); delArmed = null; $('sec-del').textContent = 'Delete';
  if (player.playing()) player.stop();
  commit(() => {
    const gone = view.sec;
    song.sections.splice(gone, 1);
    song.arrangement = song.arrangement.filter(i => i !== gone).map(i => i > gone ? i - 1 : i);
    view.sec = Math.max(0, gone - 1); view.bar = 0;
  }, { sections: true });
};
function nextName() {
  for (let i = 0; i < 26; i++) { const n = String.fromCharCode(65 + i); if (!song.sections.some(s => s.name === n)) return n; }
  for (let i = song.sections.length + 1; ; i++) if (!song.sections.some(s => s.name === 'Section ' + i)) return 'Section ' + i;
}

// ---------- grid ----------
const CELL_W = { 24: 44, 12: 30, 8: 26, 6: 20, 4: 16, 3: 14, 2: 12 };
function laneMap(list, cell, ncell, filter) {
  const map = new Array(ncell).fill('');
  list.forEach(e => {
    if (filter && !filter(e)) return;
    const a = Math.floor(e.t / cell), b = Math.max(a + 1, Math.ceil((e.t + e.d) / cell));
    for (let c = a; c < Math.min(b, ncell); c++) if (map[c] !== 'on') map[c] = c === a ? 'on' : 'hold';
  });
  return map;
}
function rowsFor(s) {
  return Math.min(15, Math.max(8, ...s.measures.map(m => {
    const n = C.measureCtx(m).scale.semis.length;
    const top = m.mel.reduce((a, e) => Math.max(a, e.deg), 0);
    return Math.max(Math.min(2 * n, 15), top);
  })));
}
let gridRows = 8;
function renderGrid() {
  const s = sec();
  const cell = cellTicks(), res = cell;
  const rows = rowsFor(s);
  $('grid').style.setProperty('--cw', CELL_W[res] + 'px');
  let legend = '<div class="daw-legend"><div class="daw-mhead"></div><div class="daw-strip">Chord</div>';
  for (let r = rows; r >= 1; r--) legend += '<div class="daw-lab' + (r === 1 ? ' tonic' : '') + '">' + r + '</div>';
  legend += '<div class="daw-lab lane">Chords</div><div class="daw-lab lane">Bass</div></div>';
  const bars = s.measures.map((m, mi) => {
    const ticks = C.measureTicks(m);
    const ncell = Math.ceil(ticks / cell);
    const ctx = C.measureCtx(m);
    const n = ctx.scale.semis.length;
    const beatCells = new Map(C.pulses(m).map(p => [Math.floor(p.t / cell), p.accent]));
    const curCell = view.cur.bar === mi ? Math.floor(view.cur.t / cell) : -1;
    const cls = (c, extra) => {
      const a = beatCells.get(c);
      return 'cell' + (a === undefined ? '' : a === 2 ? ' bar1' : a ? ' grp' : ' beat') + (c === curCell ? ' cur' : '') + (extra ? ' ' + extra : '');
    };
    const kr = String(view.cur.r || 1);
    let cells = '';
    for (let r = rows; r >= 1; r--) {
      const map = laneMap(m.mel, cell, ncell, e => e.deg === r);
      const octave = (r - 1) % n === 0;
      for (let c = 0; c < ncell; c++) cells += '<i class="' + cls(c, map[c] + (octave ? ' oct' : '') + (c === curCell && kr === String(r) ? ' kcur' : '')) + '" data-r="' + r + '" data-c="' + c + '"></i>';
    }
    // notes with a degree below 1 or above the rows still play; they are listed in the bar head
    const hidden = m.mel.filter(e => e.deg < 1 || e.deg > rows).length;
    [['c', m.chd], ['b', m.bas]].forEach(([lane, list]) => {
      const map = laneMap(list, cell, ncell);
      for (let c = 0; c < ncell; c++) cells += '<i class="' + cls(c, map[c] + ' lane' + (c === curCell && kr === lane ? ' kcur' : '')) + '" data-r="' + lane + '" data-c="' + c + '"></i>';
    });
    const strip = (m.chords.length ? '' : '<span role="button" tabindex="-1" class="daw-empty" data-ct="0" title="Choose this bar\'s chord" style="left:0">+ Chord</span>') + m.chords.map(ch => '<span role="button" tabindex="-1" data-ct="' + ch.t + '" title="Change this chord" style="left:' + (ch.t / ticks * 100) + '%">' + esc(C.chordName(ch.chord, ctx)) + ' <small>' + esc(C.chordRoman(ch.chord, ctx)) + '</small></span>').join('');
    const tempo = m.tempo ? ' · ♩=' + m.tempo : '';
    return '<div class="daw-m' + (mi === view.bar ? ' sel' : '') + '" data-m="' + mi + '">' +
      '<button type="button" class="daw-mhead" data-head="' + mi + '" title="Select bar ' + (mi + 1) + '"><b>' + (mi + 1) + '</b> ' + m.num + '/' + m.den + (m.groups ? ' (' + m.groups.join('+') + ')' : '') + tempo + '<br><small>' + esc(m.key + ' ' + ctx.scale.name) + (hidden ? ' · +' + hidden + ' notes' : '') + '</small></button>' +
      '<div class="daw-strip">' + strip + '</div>' +
      '<div class="daw-cells" style="grid-template-columns:repeat(' + ncell + ',var(--cw));grid-template-rows:repeat(' + (rows + 2) + ',var(--ch))">' + cells + '<div class="daw-head" hidden></div></div></div>';
  }).join('');
  gridRows = rows;
  $('grid').innerHTML = legend + '<div class="daw-bars">' + bars + '<button type="button" class="daw-addbar" id="add-bar" title="Add a bar at the end">+ Bar</button></div>';
}
$('grid').onclick = (e) => {
  if (suppressClick) { suppressClick = false; return; }
  if (e.target.id === 'add-bar') { commit(() => { sec().measures.push(C.fillRhythm(C.newMeasure(bar(sec().measures.length - 1)))); view.bar = sec().measures.length - 1; }, { sections: true }); return; }
  const head = e.target.closest('[data-head]');
  if (head) { view.bar = +head.dataset.head; view.cur = { bar: view.bar, t: 0 }; renderGrid(); renderInspector(); renderLive(); return; }
  const ct = e.target.closest('[data-ct]');
  if (ct) { const mi = +ct.closest('[data-m]').dataset.m; openChordMenu(mi, +ct.dataset.ct, ct.getBoundingClientRect()); return; }
  const c = e.target.closest('i.cell');
  if (!c) return;
  const mi = +c.closest('[data-m]').dataset.m;
  const t0 = +c.dataset.c * cellTicks(), r = c.dataset.r;
  view.bar = mi; view.cur = { bar: mi, t: t0, r };
  if (e.shiftKey) { renderGrid(); renderInspector(); return; } // Shift+click: move the insert cursor only
  toggleAt(mi, t0, r);
};
// Add or remove a note (melody row r = degree, 'c' = chord lane, 'b' = bass lane) at a cell
function toggleAt(mi, t0, r, only) {
  const m = bar(mi), cell = cellTicks(), ticks = C.measureTicks(m);
  if (t0 >= ticks) return;
  commit(() => {
    const list = r === 'c' ? m.chd : r === 'b' ? m.bas : m.mel;
    const deg = +r;
    const hit = list.findIndex(n => (r === 'c' || r === 'b' || n.deg === deg) && n.t < t0 + cell && n.t + n.d > t0);
    if (hit >= 0) { if (only !== 'add') list.splice(hit, 1); }
    else if (only !== 'remove') {
      const note = { t: t0, d: Math.max(1, Math.min(lenTicks(), ticks - t0)) };
      if (r !== 'c' && r !== 'b') { note.deg = deg; note.acc = 0; }
      list.push(note);
      list.sort((a, b) => a.t - b.t);
      preview(m, note, r);
    }
  });
}
// Keyboard editing: arrows move the cursor (across bars), Enter adds/removes, Delete removes, C opens the chord menu
$('grid').addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const rowsList = []; for (let r = gridRows; r >= 1; r--) rowsList.push(String(r)); rowsList.push('c', 'b');
  const cell = cellTicks(), list = sec().measures;
  let { bar: mi, t, r } = view.cur;
  r = String(r || 1);
  let ri = Math.max(0, rowsList.indexOf(r));
  const k = e.key;
  if (k === 'ArrowLeft') { t -= cell; if (t < 0) { if (mi > 0) { mi--; t = Math.floor((C.measureTicks(list[mi]) - 1) / cell) * cell; } else t = 0; } }
  else if (k === 'ArrowRight') { t += cell; if (t >= C.measureTicks(list[mi])) { if (mi < list.length - 1) { mi++; t = 0; } else t -= cell; } }
  else if (k === 'ArrowUp') ri = Math.max(0, ri - 1);
  else if (k === 'ArrowDown') ri = Math.min(rowsList.length - 1, ri + 1);
  else if (k === 'Home') t = 0;
  else if (k === 'End') t = Math.floor((C.measureTicks(list[mi]) - 1) / cell) * cell;
  else if (k === 'Enter') { e.preventDefault(); toggleAt(mi, Math.floor(t / cell) * cell, r); return; }
  else if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); toggleAt(mi, Math.floor(t / cell) * cell, r, 'remove'); return; }
  else if (k === 'c' || k === 'C' || k === 'ContextMenu') { e.preventDefault(); const el = $('grid').querySelector('.kcur'); openChordMenu(mi, Math.floor(t / cell) * cell, el ? el.getBoundingClientRect() : $('grid').getBoundingClientRect()); return; }
  else return;
  e.preventDefault(); e.stopPropagation();
  view.bar = mi; view.cur = { bar: mi, t: Math.floor(t / cell) * cell, r: rowsList[ri] };
  renderGrid(); renderInspector();
  const el = $('grid').querySelector('.kcur');
  if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const m = bar(mi);
  status('Cursor: bar ' + (mi + 1) + ' · ' + beatLabel(m, view.cur.t) + ' · ' + (view.cur.r === 'c' ? 'Chords lane' : view.cur.r === 'b' ? 'Bass lane' : 'degree ' + view.cur.r) + ' — Enter adds or removes, C chooses the chord');
});
// Right-click (or long-press, or C): choose a triad, 4-tone or 5-tone chord for this point of the bar
let menuSize = 3, menuWhole = false, menuAt = null;
$('grid').addEventListener('contextmenu', (e) => {
  const c = e.target.closest('i.cell, [data-ct], .daw-mhead[data-head]');
  if (!c) return;
  e.preventDefault();
  const mi = +c.closest('[data-m]').dataset.m;
  const t = c.dataset.ct !== undefined ? +c.dataset.ct : c.dataset.c !== undefined ? +c.dataset.c * cellTicks() : 0;
  openChordMenu(mi, t, { left: e.clientX, top: e.clientY, bottom: e.clientY, right: e.clientX });
});
// Touch: a long press opens the chord menu too (iPhone and iPad never send a context menu event)
let pressTimer = null, pressAt = null, suppressClick = false;
$('grid').addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse') return;
  const c = e.target.closest('i.cell, [data-ct], .daw-mhead[data-head]');
  if (!c) return;
  pressAt = { x: e.clientX, y: e.clientY };
  clearTimeout(pressTimer);
  pressTimer = setTimeout(() => {
    pressTimer = null;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 700);
    const mi = +c.closest('[data-m]').dataset.m;
    const t = c.dataset.ct !== undefined ? +c.dataset.ct : c.dataset.c !== undefined ? +c.dataset.c * cellTicks() : 0;
    openChordMenu(mi, t, { left: pressAt.x, top: pressAt.y, bottom: pressAt.y, right: pressAt.x });
  }, 550);
});
const cancelPress = (e) => { if (pressTimer && (!e || e.type !== 'pointermove' || Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y) > 10)) { clearTimeout(pressTimer); pressTimer = null; } };
['pointerup', 'pointercancel', 'pointermove'].forEach(type => $('grid').addEventListener(type, cancelPress));
function openChordMenu(mi, t, rect) {
  menuAt = { mi, t };
  menuWhole = t === 0 && bar(mi).chords.length === 1;
  view.bar = mi; view.cur = Object.assign({}, view.cur, { bar: mi, t });
  renderMenu();
  const menu = $('menu');
  menu.hidden = false;
  const w = menu.offsetWidth, h = menu.offsetHeight;
  menu.style.left = Math.max(4, Math.min(rect.left, innerWidth - w - 4)) + 'px';
  menu.style.top = Math.max(4, (rect.bottom + h + 4 > innerHeight ? rect.top - h - 4 : rect.bottom + 4)) + 'px';
  const first = menu.querySelector('[data-mdeg]');
  if (first) first.focus();
  renderGrid(); renderInspector();
}
function closeMenu() { if (!$('menu').hidden) { $('menu').hidden = true; menuAt = null; } }
function renderMenu() {
  const { mi, t } = menuAt, m = bar(mi), ctx = C.measureCtx(m);
  const n = Math.min(7, ctx.scale.semis.length);
  const here = m.chords.find(c => c.t === t);
  let html = '<p class="daw-sub"><b>Chord · bar ' + (mi + 1) + '</b>, ' + (menuWhole ? 'whole bar' : 'from ' + beatLabel(m, t)) + ' · ' + esc(m.key + ' ' + ctx.scale.name) + '</p>' +
    '<div class="daw-seg" role="group" aria-label="Chord size">' + [[3, 'Triad'], [4, '4-tone'], [5, '5-tone']].map(([s, l]) => '<button type="button" data-msize="' + s + '" class="' + (s === menuSize ? 'on' : '') + '">' + l + '</button>').join('') + '</div>' +
    '<div class="daw-mgrid">';
  for (let d = 1; d <= n; d++) { const ch = { deg: d, size: menuSize }; html += '<button type="button" role="menuitem" data-mdeg="' + d + '"><b>' + esc(C.chordRoman(ch, ctx)) + '</b> ' + esc(C.chordName(ch, ctx)) + '</button>'; }
  html += '</div><label class="daw-check"><input type="checkbox" id="menu-whole"' + (menuWhole ? ' checked' : '') + '> Whole bar (replace its chord changes)</label>' +
    '<div class="daw-btns">' + (here ? '<button type="button" data-mact="remove">Remove this chord</button>' : '') + '<button type="button" data-mact="close">Close</button></div>';
  $('menu').innerHTML = html;
}
$('menu').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b || !menuAt) return;
  if (b.dataset.msize) { menuSize = +b.dataset.msize; renderMenu(); return; }
  if (b.dataset.mact === 'close') { closeMenu(); return; }
  const { mi, t } = menuAt, m = bar(mi);
  if (b.dataset.mact === 'remove') { commit(() => { m.chords = m.chords.filter(c => c.t !== t); fitBar(m); }); closeMenu(); return; }
  if (b.dataset.mdeg) {
    const chord = { deg: +b.dataset.mdeg, size: menuSize };
    commit(() => {
      if (menuWhole || t === 0 && m.chords.length === 1) m.chords = [{ t: 0, chord }];
      else { const at = m.chords.find(c => c.t === t); if (at) at.chord = chord; else { m.chords.push({ t, chord }); m.chords.sort((a, b) => a.t - b.t); } }
      fitBar(m);
      // make the new chord heard: a bar with no chord or bass hits gets a hit on each change
      C.ensureHits(m, menuWhole ? 0 : t);
    });
    if (!player.playing()) { const ctx = C.measureCtx(m), tone = TD['tone.js'], at = tone.now() + 0.02; C.chordMidis(chord, ctx).forEach(x => tone.noteAt(x, at, 0.6, 0.09)); }
    closeMenu();
    renderLive();
    $('grid').focus({ preventScroll: true });
  }
};
$('menu').onchange = (e) => { if (e.target.id === 'menu-whole') { menuWhole = e.target.checked; renderMenu(); } };
$('menu').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.stopPropagation(); closeMenu(); $('grid').focus({ preventScroll: true }); }
  else if (/^[1-7]$/.test(e.key)) { e.stopPropagation(); const b = $('menu').querySelector('[data-mdeg="' + e.key + '"]'); if (b) b.click(); }
});
document.addEventListener('pointerdown', (e) => { if (!$('menu').hidden && !e.target.closest('#menu')) closeMenu(); });
window.addEventListener('resize', closeMenu);
// Hear a note when it is placed (only while stopped)
function preview(m, note, lane) {
  if (player.playing()) return;
  const ctx = C.measureCtx(m, liveState());
  const tone = TD['tone.js'];
  const t = tone.now() + 0.02;
  const ch = C.chordAt(m, note.t, liveState());
  if (lane === 'c') C.chordMidis(ch, ctx).forEach(x => tone.noteAt(x, t, 0.35, 0.1));
  else if (lane === 'b') { const b = C.bassMidi(ch, ctx); if (b !== null) tone.noteAt(b, t, 0.35, 0.25); }
  else tone.noteAt(C.melodyMidi(note, ctx), t, 0.3, 0.2);
}
$('grid').onmouseover = (e) => {
  const c = e.target.closest('i.cell');
  if (!c) return;
  const mi = +c.closest('[data-m]').dataset.m, m = bar(mi), t = +c.dataset.c * cellTicks(), r = c.dataset.r;
  const ctx = C.measureCtx(m);
  const ch = C.chordAt(m, t);
  const what = !ch && (r === 'c' || r === 'b') ? 'no chord here yet — right-click or press C to choose one'
    : r === 'c' ? 'chord ' + C.chordName(ch, ctx) + ' (' + C.chordRoman(ch, ctx) + ')'
    : r === 'b' ? 'bass ' + midiName(C.bassMidi(ch, ctx))
    : ORD(+r) + ' degree = ' + midiName(C.melodyMidi({ deg: +r, acc: 0 }, ctx));
  status('Bar ' + (mi + 1) + ' · ' + beatLabel(m, t) + ' · ' + what + ' · click to add or remove, Shift+click to move the cursor');
};
let statusTimer = null;
function status(text) { $('status').textContent = text; clearTimeout(statusTimer); }

// ---------- playhead ----------
let headEl = null;
function clearHead() { if (headEl) headEl.hidden = true; headEl = null; }
function followHead() {
  if (!player.playing()) { clearHead(); return; }
  const cur = player.current();
  if (cur) {
    if (cur.ref.si !== view.sec && song.sections[cur.ref.si]) { view.sec = cur.ref.si; clampView(); renderAll(); }
    const box = $('grid').querySelector('[data-m="' + cur.ref.mi + '"] .daw-head');
    if (box !== headEl) { clearHead(); headEl = box; if (box) { box.hidden = false; box.closest('.daw-m').scrollIntoView({ block: 'nearest', inline: 'nearest' }); } }
    if (headEl && bar(cur.ref.mi)) headEl.style.left = (cur.t / C.measureTicks(bar(cur.ref.mi)) * 100) + '%';
    const at = cur.ref.si + ':' + cur.ref.mi;
    if (at !== followHead.lastBar) { followHead.lastBar = at; renderLive(); }
    renderDawFretboards(cur);
  }
  requestAnimationFrame(followHead);
}

// ---------- bar inspector ----------
const opt = (v, label, sel) => '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(label) + '</option>';
function renderInspector() {
  const m = bar();
  const ctx = C.measureCtx(m);
  const scaleKnown = !m.scaleSemis && C.scaleByName(m.scale);
  let html = '<p class="daw-sub">Bar ' + (view.bar + 1) + ' of ' + esc(sec().name) + ' · ' + C.measureTicks(m) / 3 + ' 32nds</p>' +
    '<div class="daw-form">' +
    '<label>Meter<span><input type="number" data-f="num" min="1" max="32" value="' + m.num + '"> / <select data-f="den">' + C.DENOMS.map(d => opt(d, d, d === m.den)).join('') + '</select></span></label>' +
    '<label>Beat groups<input type="text" data-f="groups" placeholder="' + C.defaultGroups(m.num, m.den).join('+') + '" value="' + (m.groups ? m.groups.join('+') : '') + '" title="How the ' + m.num + ' beats group, e.g. 2+2+3 (blank = default)"></label>' +
    '<label>Tempo ♩<input type="number" data-f="tempo" min="20" max="400" placeholder="' + song.tempo + '" value="' + (m.tempo || '') + '" title="Blank = song tempo"></label>' +
    '<label>Key<select data-f="key">' + C.KEY_NAMES.map(k => opt(k, k, k === m.key)).join('') + (C.KEY_NAMES.includes(m.key) ? '' : opt(m.key, m.key, true)) + '</select></label>' +
    '<label>Scale<select data-f="scale">' + C.SCALES.map(s => opt(s.name, s.name, scaleKnown && s.name === m.scale)).join('') + (scaleKnown ? '' : opt('__card', m.scale + ' (from card)', true)) + '</select></label>' +
    '</div><div class="daw-btns"><button type="button" data-do="meter-on">Meter → following bars</button><button type="button" data-do="key-on">Key &amp; scale → following bars</button></div>' +
    '<h3>Chords</h3><ol class="daw-chords">';
  m.chords.forEach((c, i) => {
    const ch = c.chord;
    const diatonic = ch.rel === undefined && !ch.shape;
    html += '<li><span class="daw-at">' + beatLabel(m, c.t) + '</span><select data-ch="' + i + '" data-k="deg" aria-label="Chord degree">' +
      [1, 2, 3, 4, 5, 6, 7].slice(0, Math.min(7, ctx.scale.semis.length)).map(d => { const x = { deg: d, size: ch.size || 3 }; return opt(d, C.chordRoman(x, ctx) + ' · ' + C.chordName(x, ctx), diatonic && ch.deg === d); }).join('') +
      (diatonic ? '' : opt('keep', C.chordRoman(ch, ctx) + ' · ' + C.chordName(ch, ctx) + ' (card)', true)) + '</select>' +
      (diatonic ? '<select data-ch="' + i + '" data-k="size" aria-label="Chord size">' + opt(3, 'Triad', (ch.size || 3) === 3) + opt(4, '4-tone (7th)', ch.size === 4) + opt(5, '5-tone (9th)', ch.size === 5) + '</select>' : '') +
      '<button type="button" data-chdel="' + i + '" aria-label="Remove chord">×</button>' + '</li>';
  });
  html += '</ol><div class="daw-btns">' +
    '<button type="button" data-do="chord-add"' + ((view.cur.bar === view.bar || !m.chords.length) && !m.chords.some(c => c.t === (view.cur.bar === view.bar ? view.cur.t : 0)) ? '' : ' disabled title="Shift+click a cell of this bar where there is no chord change yet"') + '>+ ' + (m.chords.length ? 'Change' : 'Chord') + ' at cursor (' + beatLabel(m, view.cur.bar === view.bar ? view.cur.t : 0) + ')</button></div>' +
    (m.chords.length ? '' : '<p class="daw-sub">No chord yet — this bar plays only its melody. Add one here, click “+ Chord” above the bar, or right-click the grid.</p>') +
    '<h3>Bar</h3><div class="daw-btns">' +
    '<button type="button" data-do="fill">Fill chords &amp; bass</button><button type="button" data-do="clear">Clear notes</button>' +
    '<button type="button" data-do="ins">Insert bar after</button><button type="button" data-do="dup">Duplicate</button>' +
    '<button type="button" data-do="left"' + (view.bar ? '' : ' disabled') + '>◀ Move</button><button type="button" data-do="right"' + (view.bar < sec().measures.length - 1 ? '' : ' disabled') + '>Move ▶</button>' +
    '<button type="button" data-do="del"' + (sec().measures.length > 1 ? '' : ' disabled') + '>Delete bar</button></div>' +
    '<h3>Mix</h3><div class="daw-mix">' + [['mel', 'Melody'], ['chd', 'Chords'], ['bas', 'Bass'], ['drm', 'Drums'], ['click', 'Click']].map(([k, n]) =>
      '<label><input type="checkbox" data-mute="' + k + '"' + (song.mute[k] ? '' : ' checked') + '> ' + n + '<input type="range" min="0" max="1" step="0.05" data-vol="' + k + '" value="' + song.vol[k] + '" aria-label="' + n + ' volume">' +
      (k === 'click' ? '' : k === 'drm' ? '<select data-drums aria-label="Drum pattern">' + Object.keys(C.DRUM_PATTERNS).map(p => opt(p, C.DRUM_PATTERNS[p], (song.drums || 'off') === p)).join('') + '</select>' : '<select data-voice="' + k + '" aria-label="' + n + ' sound">' + C.VOICE_NAMES.map(v => opt(v, v[0].toUpperCase() + v.slice(1), song.voice[k] === v)).join('') + '</select>') + '</label>').join('') + '</div>';
  $('inspector').innerHTML = html;
  renderDawFretboards();
}
$('inspector').onchange = (e) => {
  const el = e.target, m = bar();
  if (el.dataset.f) {
    const f = el.dataset.f;
    commit(() => {
      if (f === 'num') { const v = Math.round(+el.value); if (v >= 1 && v <= 32) m.num = v; else status('Beats per bar must be 1–32 — the bar keeps ' + m.num + '/' + m.den + '.'); }
      if (f === 'den') m.den = +el.value;
      if (f === 'groups') m.groups = el.value.trim() ? C.parseGroups(el.value, m.num) : null;
      if (f === 'tempo') { const v = Math.round(+el.value); if (!el.value.trim()) m.tempo = null; else if (v >= 20 && v <= 400) m.tempo = v; else status('Tempo must be 20–400 — the bar keeps ' + (m.tempo ? '♩ = ' + m.tempo : 'the song tempo') + '.'); }
      if (f === 'key') m.key = el.value;
      if (f === 'scale' && el.value !== '__card') { m.scale = el.value; m.scaleSemis = null; }
      fitBar(m);
    }, { sections: f === 'num' || f === 'den' });
    if (f === 'groups' && el.value.trim() && !m.groups) status('Beat groups must add up to ' + m.num + ' (e.g. ' + C.defaultGroups(m.num, m.den).join('+') + ').');
    renderLive();
    return;
  }
  if (el.dataset.ch !== undefined) {
    const c = m.chords[+el.dataset.ch];
    commit(() => {
      if (el.dataset.k === 'deg' && el.value !== 'keep') c.chord = { deg: +el.value, size: c.chord.size || 3 };
      if (el.dataset.k === 'size') c.chord = { deg: c.chord.deg, size: +el.value };
    });
    return;
  }
  if (el.dataset.mute) commit(() => { song.mute[el.dataset.mute] = !el.checked; }, { grid: false });
  if (el.dataset.vol) commit(() => { song.vol[el.dataset.vol] = +el.value; }, { grid: false });
  if (el.dataset.drums !== undefined) commit(() => { song.drums = el.value; }, { grid: false });
  if (el.dataset.voice) commit(() => { song.voice[el.dataset.voice] = el.value; }, { grid: false });
};
$('inspector').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  const m = bar(), list = sec().measures, i = view.bar;
  if (b.dataset.chdel !== undefined) { commit(() => { m.chords.splice(+b.dataset.chdel, 1); fitBar(m); }); return; }
  const act = b.dataset.do;
  if (!act) return;
  commit(() => {
    if (act === 'meter-on') list.slice(i + 1).forEach(x => { x.num = m.num; x.den = m.den; x.groups = m.groups ? m.groups.slice() : null; fitBar(x); });
    if (act === 'key-on') list.slice(i + 1).forEach(x => { x.key = m.key; x.scale = m.scale; x.scaleSemis = m.scaleSemis ? m.scaleSemis.slice() : null; fitBar(x); });
    if (act === 'chord-add') { const t = view.cur.bar === i ? view.cur.t : 0; const prev = C.chordAt(m, t) || { deg: 1, size: 3 }; m.chords.push({ t, chord: JSON.parse(JSON.stringify(prev)) }); m.chords.sort((a, b) => a.t - b.t); C.ensureHits(m, t); }
    if (act === 'fill') { if (m.chords.length) C.fillRhythm(m); else status('This bar has no chord yet — choose one first, then Fill writes its hits.'); }
    if (act === 'clear') { m.mel = []; m.chd = []; m.bas = []; }
    if (act === 'ins') { list.splice(i + 1, 0, C.fillRhythm(C.newMeasure(m))); view.bar = i + 1; }
    if (act === 'dup') { list.splice(i + 1, 0, JSON.parse(JSON.stringify(m))); view.bar = i + 1; }
    if (act === 'left') { [list[i - 1], list[i]] = [list[i], list[i - 1]]; view.bar = i - 1; }
    if (act === 'right') { [list[i + 1], list[i]] = [list[i], list[i + 1]]; view.bar = i + 1; }
    if (act === 'del') { list.splice(i, 1); }
    view.cur.bar = view.bar;
  }, { sections: ['ins', 'dup', 'del'].includes(act) });
  renderLive();
};

// ---------- all bars ----------
$('all-key').innerHTML = C.KEY_NAMES.map(k => opt(k, k, false)).join('');
$('all-scale').innerHTML = C.SCALES.map(s => opt(s.name, s.name, false)).join('');
function syncAll() {
  const m = bar();
  $('all-num').value = m.num; $('all-den').value = String(m.den);
  $('all-key').value = C.KEY_NAMES.includes(m.key) ? m.key : 'C';
  if (C.scaleByName(m.scale) && !m.scaleSemis) $('all-scale').value = m.scale;
}
document.querySelector('.daw-all').onclick = (e) => {
  const b = e.target.closest('[data-all]');
  if (!b) return;
  const act = b.dataset.all;
  const targets = $('all-scope').value === 'song' ? song.sections.flatMap(s => s.measures) : sec().measures;
  const n = Math.round(+$('all-num').value);
  if (act === 'meter' && !(n >= 1 && n <= 32)) { status('Beats per bar must be 1–32.'); return; }
  let skipped = 0;
  commit(() => targets.forEach(m => {
    if (act === 'meter') { const old = C.measureTicks(m); m.num = n; m.den = +$('all-den').value; m.groups = null; const now = C.measureTicks(m); const empty = !m.chd.length && !m.bas.length;
      // chord changes keep their place in the bar (beat 3 of 4 stays on beat 3 of 3), longer or shorter
      if (now !== old && !empty) { const seen = new Set(); m.chords = m.chords.map(c => ({ t: Math.min(now - 1, Math.round(c.t * now / old)), chord: c.chord })).filter(c => !seen.has(c.t) && seen.add(c.t)); }
      fitBar(m); if (now !== old && !empty) C.fillRhythm(m); }
    if (act === 'key') m.key = $('all-key').value;
    if (act === 'up' || act === 'down') { const pc = noteToTonic(m.key).pc; m.key = C.KEY_NAMES[(pc + (act === 'up' ? 1 : 11)) % 12]; }
    if (act === 'scale') { m.scale = $('all-scale').value; m.scaleSemis = null; fitBar(m); }
    if (act === 'chord') {
      // a VI or VII does not exist in a 5- or 6-note scale (it would wrap round to another chord): those bars keep theirs
      const deg = +$('all-deg').value;
      if (deg > C.measureCtx(m).scale.semis.length) { skipped++; return; }
      m.chords = [{ t: 0, chord: { deg, size: +$('all-size').value } }]; C.ensureHits(m, 0);
    }
    if (act === 'size') m.chords.forEach(c => { if (c.chord.rel === undefined && !c.chord.shape) c.chord.size = +$('all-size').value; });
    if (act === 'tempo') m.tempo = null;
  }), { sections: act === 'meter' });
  status('Changed ' + (targets.length - skipped) + ' bars.' + (skipped ? ' ' + skipped + ' bars kept their chord: their scale has fewer than ' + $('all-deg').value + ' notes.' : ''));
  renderLive(); syncAll();
};

// ---------- cards ----------
const CARD_DECKS = ['majorminor', 'andalusian', 'deceptive', 'blues', 'romannumerals', 'triads', 'tetrads', 'keys', 'modes', 'scales7', 'scales6', 'scales5', 'melodicpatterns', 'melodic7base0', 'intervals', 'intervals-ext'];
const PROG = new Set(['majorminor', 'andalusian', 'deceptive', 'blues']);
const deckById = (id) => DECKS.find(d => d.id === id);
$('card-deck').innerHTML = CARD_DECKS.map(id => opt(id, deckById(id).name, false)).join('');
let shown = [];
function renderCards() {
  const d = deckById($('card-deck').value);
  const q = $('card-filter').value.trim().toLowerCase();
  const all = d.cards.map((c, i) => i).filter(i => !q || (d.cards[i].title + ' ' + d.cards[i].sub + ' ' + (d.cards[i].group || '')).toLowerCase().includes(q));
  shown = all.slice(0, 300);
  $('card-list').innerHTML = shown.map(i => { const c = d.cards[i]; return '<button type="button" role="option" data-card="' + i + '" aria-selected="' + (i === view.card) + '" class="' + (i === view.card ? 'on' : '') + '"><b>' + esc(c.title) + '</b> <small>' + esc(c.sub) + '</small></button>'; }).join('') +
    (all.length > shown.length ? '<p class="daw-sub">' + (all.length - shown.length) + ' more — type to filter</p>' : '') + (all.length ? '' : '<p class="daw-sub">No cards match.</p>');
  renderCardActions();
}
$('card-deck').onchange = () => { view.card = -1; $('card-filter').value = ''; renderCards(); };
$('card-filter').oninput = () => renderCards();
// Selecting a card only re-marks the list, so a long list keeps its scroll position
$('card-list').onclick = (e) => {
  const b = e.target.closest('[data-card]');
  if (!b) return;
  view.card = +b.dataset.card;
  $('card-list').querySelectorAll('[data-card]').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', String(on)); });
  renderCardActions();
};

const C_TONIC = { l: 0, acc: 0, name: 'C', pc: 0 };
const row = (card, label) => (card.rows.find(r => r[0] === label) || [])[1];
function progressionChords(deckId, card) {
  const t = card.transpose(C_TONIC);
  const syms = (typeof t === 'object' ? t.v : t).split('–');
  const numerals = (row(card, 'Numerals') || card.title.split(' · ')[0]).split('–');
  return syms.map((s, i) => C.chordFromSymbol(s, numerals.length === syms.length ? numerals[i].trim() : undefined)).filter(Boolean);
}
function cardKind(deckId) {
  if (PROG.has(deckId)) return 'prog';
  if (deckId === 'romannumerals') return 'roman';
  if (deckId === 'triads' || deckId === 'tetrads') return 'chord';
  if (deckId === 'keys') return 'key';
  if (['modes', 'scales5', 'scales6', 'scales7'].includes(deckId)) return 'scale';
  return 'melody';
}
function renderCardActions() {
  const id = $('card-deck').value, d = deckById(id), card = d.cards[view.card];
  const box = $('card-actions');
  if (!card) { box.innerHTML = '<p class="daw-sub">Pick a card to hear it, start a new song from it, or insert it at the selected bar and cursor (Shift+click a cell).</p>'; return; }
  const kind = cardKind(id);
  const keyNow = cardKeyValue();
  let html = '<p class="daw-sub"><b>' + esc(card.title) + '</b> · ' + esc(card.sub) + '</p>';
  // Key cards carry their own tonic; every other card can be heard and built in any key
  const keySel = kind === 'key' ? '' : '<label>Key<select id="card-key">' + C.KEY_NAMES.map(k => opt(k, k, k === keyNow)).join('') + '</select></label>';
  const sound = cardSound(id, card);
  const play = sound ? '<button type="button" data-card-do="play" title="Hear the card in the chosen key">▶ ' + (sound.progression ? 'Chords' : 'Together') + '</button><button type="button" data-card-do="play-arp" title="Hear each note in turn">▶ Arpeggio</button><button type="button" data-card-do="stop" title="Stop card playback">■ Stop</button>' : '';
  const playOptions = sound ? '<span class="daw-card-play-options"><label class="daw-check"><input type="checkbox" id="card-root"' + (cardIncludeRoot ? ' checked' : '') + '> Include root</label>' + (kind === 'prog' ? '<label class="daw-check"><input type="checkbox" id="card-repeat-tonic"' + (cardRepeatTonic ? ' checked' : '') + '> Repeat tonic</label>' : '') + '<label class="daw-check"><input type="checkbox" id="card-loop"' + (cardLoop ? ' checked' : '') + '> Loop card</label></span>' : '';
  if (kind === 'prog') {
    const chords = progressionChords(id, card);
    const ctx = { key: keyNow, keyPc: noteToTonic(keyNow).pc, scale: C.SCALES[0] };
    html += '<p class="daw-sub">' + chords.map(c => esc(C.chordName(c, ctx))).join(' – ') + ' in ' + esc(keyNow) + '</p>' +
      '<div class="daw-form"><label>Bars per chord<select id="pc-bars">' + opt(0.5, '½ (2 chords a bar)', false) + opt(1, '1', true) + opt(2, '2', false) + opt(4, '4', false) + '</select></label>' +
      '<label>Repeat<select id="pc-rep">' + [1, 2, 3, 4].map(n => opt(n, n + '×', n === 1)).join('') + '</select></label>' + keySel + '</div>' +
      '<div class="daw-btns">' + play + playOptions + '<button type="button" data-card-do="new-song" class="on">New song from card</button><button type="button" data-card-do="prog-new">Build new section</button><button type="button" data-card-do="prog-here">Replace bars from bar ' + (view.bar + 1) + '</button></div>';
  } else {
    if (keySel) html += '<div class="daw-form">' + keySel + '</div>';
    html += '<div class="daw-btns">' + play + playOptions + '<button type="button" data-card-do="new-song" class="on" title="' + esc(NEW_FROM[kind]) + '">New song from card</button></div><div class="daw-btns">';
    if (kind === 'roman' || kind === 'chord') html += '<button type="button" data-card-do="chord">Set chord at cursor</button>' + (kind === 'chord' ? '<button type="button" data-card-do="arp">Insert arpeggio at cursor</button>' : '');
    else if (kind === 'key' || kind === 'scale') html += '<button type="button" data-card-do="scale-1">' + (kind === 'key' ? 'Key &amp; scale' : 'Scale') + ' for this bar</button><button type="button" data-card-do="scale-on">… from this bar on</button><button type="button" data-card-do="run">Insert as melody at cursor</button>';
    else html += '<button type="button" data-card-do="run">Insert melody at cursor</button>';
    html += '</div>';
  }
  html += '<p class="daw-sub">New song from card: ' + esc(NEW_FROM[kind]) + ' Undo brings the old song back.</p>';
  box.innerHTML = html;
}
// What "New song from card" builds for each kind of card
const NEW_FROM = {
  prog: 'the progression as a song, with chords and bass.',
  chord: 'four bars of this chord on the tonic, its arpeggio as the melody of bar 1.',
  roman: 'four bars alternating this chord and the tonic chord.',
  key: 'four bars (I–IV–V–I) in this key and scale, the scale as the melody.',
  scale: 'four bars (I–IV–V–I) in this scale, the scale as the melody.',
  melody: 'four bars (I–IV–V–I) with the card\'s notes as the melody.',
};
// The key a card is heard and built in: the Key box once shown, else the selected bar's key
let cardKey = null;
let cardIncludeRoot = false;
let cardRepeatTonic = false;
let cardLoop = false;
function cardKeyValue() { return cardKey && C.KEY_NAMES.includes(cardKey) ? cardKey : C.KEY_NAMES.includes(bar().key) ? bar().key : 'C'; }
$('card-actions').addEventListener('change', (e) => {
  if (e.target.id === 'card-root') cardIncludeRoot = e.target.checked;
  if (e.target.id === 'card-repeat-tonic') cardRepeatTonic = e.target.checked;
  if (e.target.id === 'card-loop') cardLoop = e.target.checked;
  if (e.target.id === 'card-key') {
    // keep the Bars / Repeat choices while the chord names re-spell in the new key
    const keep = ['pc-bars', 'pc-rep'].map(k => $(k) && $(k).value);
    cardKey = e.target.value; renderCardActions();
    ['pc-bars', 'pc-rep'].forEach((k, i) => { if ($(k) && keep[i]) $(k).value = keep[i]; });
  }
});
// The card's pitches in the chosen key (key cards in their own key)
function cardSound(id, card) {
  const kind = cardKind(id);
  try {
    if (kind === 'key') return soundFor(id, card);
    const pc = noteToTonic(cardKeyValue()).pc;
    return soundFor(id, Object.assign({}, card, { soundShift: shiftTo(pc, id) }));
  } catch (err) { console.error(err); return null; }
}
function withCardRoot(events) {
  return events.map(notes => {
    if (!notes.length) return notes;
    const root = notes[0] - 12;
    return notes.includes(root) ? notes : [root, ...notes];
  });
}
// Bars built from a progression card
function progMeasures(id, card, per, rep, key) {
  const minor = id === 'andalusian' || /minor/.test(row(card, 'Key') || '');
  const chords = [];
  for (let r = 0; r < rep; r++) chords.push(...progressionChords(id, card));
  const proto = bar();
  const measures = [];
  const copy = (ch) => JSON.parse(JSON.stringify(ch));
  if (per === 0.5) {
    for (let i = 0; i < chords.length; i += 2) {
      const m = C.newMeasure(proto);
      const half = Math.round(C.measureTicks(m) / 2);
      m.chords = [{ t: 0, chord: copy(chords[i]) }].concat(chords[i + 1] ? [{ t: half, chord: copy(chords[i + 1]) }] : []);
      measures.push(m);
    }
  } else chords.forEach(ch => { for (let k = 0; k < per; k++) { const m = C.newMeasure(proto); m.chords = [{ t: 0, chord: copy(ch) }]; measures.push(m); } });
  measures.forEach(m => { m.key = key; m.scale = minor ? 'Natural minor (Aeolian)' : 'Major (Ionian)'; m.scaleSemis = null; m.tempo = null; m.mel = []; C.fillRhythm(m); });
  return measures;
}
// A fresh song from any card (replaces the song; Undo brings it back)
function newSongFromCard(id, card) {
  const kind = cardKind(id);
  const key = kind === 'key' ? keyOfCard(card) : cardKeyValue();
  const proto = Object.assign(C.newMeasure(bar()), { key, scale: C.SCALES[0].name, scaleSemis: null, tempo: null, mel: [], chd: [], bas: [] });
  const bars = (degs) => degs.map(ch => { const m = C.newMeasure(proto); m.mel = []; m.chords = [{ t: 0, chord: ch }]; return C.fillRhythm(m); });
  let measures;
  if (kind === 'prog') measures = progMeasures(id, card, +$('pc-bars').value, +$('pc-rep').value, key);
  else if (kind === 'chord') {
    const ch = { rel: 0, shape: ascending(parseFormula(card.sub)).map((x, i, a) => x - a[0]), suffix: (row(card, 'Symbol (in C)') || '').replace(/^C/, '') };
    measures = bars([ch, ch, ch, ch].map(c => JSON.parse(JSON.stringify(c))));
  } else if (kind === 'roman') {
    // Minor-key cards resolve against natural minor and put the song in minor
    const minor = !!row(card, 'Roman ID in minor');
    const numeral = (row(card, 'Roman ID in major') || row(card, 'Roman ID in minor') || card.title).split(/[ /]/)[0];
    const sc = minor ? C.SCALES.find(s => s.name === 'Natural minor (Aeolian)') || C.SCALES[0] : C.SCALES[0];
    const ch = C.chordFromNumeral(numeral, sc, minor) || { deg: 1, size: 3 };
    measures = bars([ch, { deg: 1, size: 3 }, JSON.parse(JSON.stringify(ch)), { deg: 1, size: 3 }]);
    if (minor) measures.forEach(m => { m.scale = sc.name; m.scaleSemis = null; });
  } else {
    measures = bars([1, 4, 5, 1].map(deg => ({ deg, size: 3 })));
    if (kind === 'key' || kind === 'scale') { const sc = scaleFromCard(id, card); measures.forEach(m => setScale(m, sc)); }
  }
  player.stop();
  const old = song;
  commit(() => {
    song = keepMix(C.newSong());
    song.tempo = old.tempo; song.swing = old.swing;
    song.title = String(card.title).slice(0, 80);
    song.sections = [{ name: 'A', measures }];
    song.arrangement = [0];
    view.sec = 0; view.bar = 0; view.cur = { bar: 0, t: 0, r: '1' };
    if (kind !== 'prog' && kind !== 'roman') insertLine(cardLine(id, card));
  }, { sections: true });
  renderAll();
  status('New song from ' + card.title + ' in ' + key + ' (' + measures.length + ' bars) — Undo brings the old song back.');
}
function keyOfCard(card) {
  const name = card.tonicName || String(card.title).split(/[ /]/)[0];
  try { return C.KEY_NAMES.find(k => noteToTonic(k).pc === noteToTonic(name).pc) || 'C'; } catch { return 'C'; }
}
// Chromatic offsets (from the tonic) of a card's notes, for inserting as melody
function cardLine(id, card) {
  if (id === 'melodicpatterns') return (row(card, 'Degrees') || '').split(/[–-]/).map(parseDeg).filter(Boolean).map(x => x.semis);
  if (id === 'melodic7base0') return card.sub.split('').map(p => [0, 2, 4, 5, 7, 9, 11, 12][+p] || 0);
  if (id === 'intervals' || id === 'intervals-ext') {
    const raw = row(card, 'Semitones / frets') || '0', st = parseInt(raw, 10) || 0;
    return /down/.test(raw) ? [12, 12 - st] : [0, st];
  }
  if (id === 'keys') { const s = String(card.base0 || '0-2-4-5-7-9-11').split('-').map(Number); return s.concat(12); }
  const semis = ascending(parseFormula(card.sub));
  if (id === 'modes' || id.startsWith('scales')) return semis.map(x => x - semis[0]).concat(12);
  return semis;
}
function scaleFromCard(id, card) {
  if (id === 'keys') {
    const semis = String(card.base0 || '0-2-4-5-7-9-11').split('-').map(Number);
    const name = card.sub.replace(/ key$/, '');
    return { semis, name: name === 'Major' ? 'Major (Ionian)' : name };
  }
  const s = ascending(parseFormula(card.sub));
  return { semis: [...new Set(s.map(x => ((x - s[0]) % 12 + 12) % 12))].sort((a, b) => a - b), name: card.title };
}
function setScale(m, sc) {
  const known = C.SCALES.find(s => s.semis.join() === sc.semis.join());
  m.scale = known ? known.name : sc.name; m.scaleSemis = known ? null : sc.semis.slice();
  fitBar(m);
}
function setChordAtCursor(chord) {
  const m = bar(view.cur.bar);
  const at = m.chords.findIndex(c => c.t === view.cur.t);
  if (at >= 0) m.chords[at].chord = chord;
  else m.chords.push({ t: view.cur.t, chord }), m.chords.sort((a, b) => a.t - b.t);
  C.ensureHits(m, view.cur.t);
}
function insertLine(semis) {
  let mi = view.cur.bar, t = view.cur.t;
  const list = sec().measures;
  const len = lenTicks();
  let placed = 0;
  for (const s of semis) {
    while (mi < list.length && t >= C.measureTicks(list[mi])) { t -= C.measureTicks(list[mi]); mi++; }
    if (mi >= list.length) break;
    const m = list[mi];
    const ctx = C.measureCtx(m);
    const n = toScaleNote(s, ctx.scale);
    m.mel.push({ t, d: Math.min(len, C.measureTicks(m) - t), deg: n.deg, acc: n.acc });
    m.mel.sort((a, b) => a.t - b.t);
    t += len; placed++;
  }
  return placed;
}
$('card-actions').onclick = (e) => {
  const b = e.target.closest('[data-card-do]');
  if (!b) return;
  const act = b.dataset.cardDo;
  if (act === 'stop') {
    if (player.playing()) player.stop(); else stopAll();
    status('Playback stopped.');
    return;
  }
  const id = $('card-deck').value, card = deckById(id).cards[view.card];
  if (!card) return;
  const kind = cardKind(id);
  if (act === 'play' || act === 'play-arp') {
    const sound = cardSound(id, card);
    if (!sound) { status('This card has no pitches to play.'); return; }
    if (player.playing()) player.stop();
    let events = sound.events.map(notes => notes.slice());
    if (kind === 'prog' && cardRepeatTonic && events.length) events.push(events[0].slice());
    if (cardIncludeRoot) events = withCardRoot(events);
    playEvents(events, act === 'play' ? 'together' : 'arpeggio', cardLoop);
    status('Playing ' + card.title + (cardKind(id) === 'key' ? '' : ' in ' + cardKeyValue()) + (kind === 'prog' && cardRepeatTonic ? ' with tonic repeat' : '') + (cardLoop ? ' on loop' : '') + '.');
    return;
  }
  if (act === 'new-song') { newSongFromCard(id, card); return; }
  if (act === 'prog-new' || act === 'prog-here') {
    const measures = progMeasures(id, card, +$('pc-bars').value, +$('pc-rep').value, cardKeyValue());
    commit(() => {
      if (act === 'prog-new') {
        song.sections.push({ name: nextName(), measures });
        song.arrangement.push(song.sections.length - 1);
        view.sec = song.sections.length - 1; view.bar = 0;
      } else {
        const list = sec().measures;
        list.splice(view.bar, Math.min(measures.length, list.length - view.bar), ...measures);
      }
      view.cur = { bar: view.bar, t: 0 };
    }, { sections: true });
    status('Built ' + measures.length + ' bars from ' + card.title + '.');
    renderLive();
    return;
  }
  commit(() => {
    if (act === 'chord') {
      const prev = C.chordAt(bar(view.cur.bar), view.cur.t);
      if (id === 'romannumerals') {
        const minor = !!row(card, 'Roman ID in minor');
        const numeral = row(card, 'Roman ID in major') || row(card, 'Roman ID in minor') || card.title;
        const parsed = C.chordFromNumeral(numeral.split(/[ /]/)[0], C.measureCtx(bar(view.cur.bar)).scale, minor);
        if (parsed) setChordAtCursor(parsed);
        else status('Could not read the numeral ' + numeral + '.');
      } else {
        const shape = ascending(parseFormula(card.sub)).map((x, i, a) => x - a[0]);
        const sym = (row(card, 'Symbol (in C)') || '').replace(/^C/, '');
        // keep the root of the chord already there; change only its quality
        const base = prev && prev.rel === undefined ? { deg: prev.deg } : { rel: prev ? prev.rel : 0 };
        setChordAtCursor(Object.assign(base, { shape, suffix: sym }));
      }
    }
    if (act === 'arp') {
      const p = C.chordParts(C.chordAt(bar(view.cur.bar), view.cur.t), C.measureCtx(bar(view.cur.bar)));
      insertLine(cardLine(id, card).map(x => x + (p ? p.root : 0)));
    }
    if (act === 'scale-1' || act === 'scale-on') {
      const sc = scaleFromCard(id, card);
      const targets = act === 'scale-1' ? [bar()] : sec().measures.slice(view.bar);
      const key = id === 'keys' ? (card.tonicName || card.title.split(/[ /]/)[0]) : null;
      targets.forEach(m => { setScale(m, sc); if (key) m.key = C.KEY_NAMES.find(k => noteToTonic(k).pc === noteToTonic(key).pc) || 'C'; });
    }
    if (act === 'run') { const n = insertLine(cardLine(id, card)); if (!n) status('No room after the cursor — add a bar first.'); }
  });
  renderLive();
};

// ---------- keyboard ----------
document.addEventListener('keydown', (e) => {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); doUndo(redo, undo, 'redo'); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); doUndo(undo, redo, 'undo'); return; }
  if (e.key === 'Escape') { closeMenu(); $('newbox').hidden = true; return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === ' ' && !/^(BUTTON|A)$/.test(e.target.tagName)) { e.preventDefault(); $('play').click(); return; }
  if (/^[0-7]$/.test(e.key) && +e.key <= Math.min(7, C.measureCtx(liveRefBar(), liveState()).scale.semis.length)) setLiveChord(+e.key);
});
// Another tab saved the song: load it here too (unless this tab is playing)
// Cleared in Settings (Clear the saved song / Reset everything): start fresh here too, so the next autosave
// does not bring the old song back. While playing, the change waits until playback stops.
let remote = null;
function applyRemote() {
  if (remote === null) return;
  const value = remote; remote = null;
  try {
    song = C.cleanSong(value ? JSON.parse(value) : null);
    if (!value) { clearTimeout(saveTimer); saveTimer = null; } // nothing to save until the next edit
    clampView(); renderAll(); syncUndo();
    status(value ? 'Updated from another tab.' : 'The saved song was cleared in another tab — this is a fresh song. Undo brings the old one back.');
  } catch { /* ignore */ }
}
window.addEventListener('storage', (e) => {
  if (e.key !== STORE && e.key !== null) return;
  // Either way this tab's version stays one Undo away
  if (remote === null) undo.push(JSON.stringify(song));
  if (e.key === null || e.newValue === null) remote = ''; else remote = e.newValue;
  if (!player.playing()) applyRemote();
});
window.addEventListener('pagehide', () => { flushSave(); if (player.playing()) player.stop(); else stopAll(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) flushSave(); });

// ---------- start ----------
function renderAll() {
  $('tempo').value = song.tempo;
  // a swing amount from a file that is not one of the four settings shows as the nearest one
  $('swing').value = [...$('swing').options].map(o => o.value).reduce((a, b) => Math.abs(+b - song.swing) < Math.abs(+a - song.swing) ? b : a);
  $('title').value = song.title;
  renderSections(); renderGrid(); renderInspector(); renderLive(); syncAll();
}
renderAll();
renderCards();
})(window.TD = window.TD || {});
