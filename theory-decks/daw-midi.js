(function (TD) {
'use strict';
// Standard MIDI File (type 1) export for the DAW: a conductor track with every tempo, meter and key change,
// section markers and chord symbols, then Melody, Chords and Bass tracks. Built entirely on the device.
const C = TD['daw-core.js'];
const PPQ = 480;
const K = PPQ / (C.TPW / 4); // song ticks (96 per whole note = 24 per quarter) → MIDI ticks (20 each)

// ---------- bytes ----------
const vlq = (n) => { n = Math.max(0, Math.round(n)); const out = [n & 0x7f]; while ((n >>= 7)) out.unshift((n & 0x7f) | 0x80); return out; };
const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const u16 = (n) => [(n >> 8) & 255, n & 255];
// UTF-8 bytes (no TextEncoder needed, so very old browsers export too)
const text = (s) => Array.from(unescape(encodeURIComponent(String(s))), ch => ch.charCodeAt(0));
const meta = (type, data) => [0xff, type].concat(vlq(data.length), data);

// ---------- key signatures ----------
// Sharps (+) or flats (−) of the MAJOR key on each pitch class, spelled as the DAW names keys (D♭, E♭, F♯, A♭, B♭)
const MAJOR_SF = [0, -5, 2, -3, 4, -1, 6, 1, -4, 3, -2, 5];
// Minor keys on each pitch class (C, C♯, D, E♭, E, F, F♯, G, A♭, A, B♭, B minor), and the sharp spellings
// A♭ minor is written as G♯ minor (5 sharps, not 7 flats), as notation programs and players expect
const MINOR_SF = [-3, 4, -1, -6, 1, -4, 3, -2, 5, 0, -5, 2];
const SHARP_MINOR = { 3: 6, 10: 7 };
// Scales heard as minor keys are written as minor (mi = 1); modes take the signature of their parent major scale
const MINOR = new Set(['Natural minor (Aeolian)', 'Harmonic minor', 'Melodic minor', 'Minor pentatonic', 'Blues']);
const PARENT = { 'Dorian': 10, 'Phrygian': 8, 'Lydian': 7, 'Mixolydian': 5, 'Locrian': 1 }; // semitones from tonic to parent major
// Phrygian dominant is the 5th mode of harmonic minor: written in that minor key (E Phrygian dominant → A minor)
const PARENT_MINOR = { 'Phrygian dominant': 5 };
function keySignature(m) {
  const ctx = C.measureCtx(m);
  const pc = ctx.keyPc, name = ctx.scale.name;
  if (MINOR.has(name)) {
    let sf = MINOR_SF[pc];
    if (/♯/.test(m.key) && SHARP_MINOR[pc] !== undefined) sf = SHARP_MINOR[pc]; // D♯ / G♯ / A♯ minor when spelled with sharps
    return { sf, mi: 1 };
  }
  if (name in PARENT) return { sf: MAJOR_SF[(pc + PARENT[name]) % 12], mi: 0 };
  if (name in PARENT_MINOR) return { sf: MINOR_SF[(pc + PARENT_MINOR[name]) % 12], mi: 1 };
  // A scale from a card (not one of the built-in names): minor when it has a minor 3rd and no major 3rd
  const semis = ctx.scale.semis || [];
  if (!C.SCALES.some(x => x.name === name) && semis.includes(3) && !semis.includes(4)) return { sf: MINOR_SF[pc], mi: 1 };
  let sf = MAJOR_SF[pc];
  if (pc === 6 && /♭/.test(m.key)) sf = -6; // G♭ major
  if (pc === 1 && /♯/.test(m.key)) sf = 7; // C♯ major
  return { sf, mi: 0 };
}
// MIDI clocks per metronome click: one beat, or a dotted beat in compound meters (6/8 clicks on dotted quarters)
function clocksPerClick(m) {
  const beat = 96 / m.den; // in 96ths of a whole note → MIDI clocks are 24 per quarter
  const groups = C.groupsOf(m);
  const compound = m.den >= 8 && groups.every(g => g === 3);
  return Math.max(1, Math.round((compound ? 3 : 1) * beat));
}

// ---------- General MIDI sounds for the DAW voices ----------
const PROGRAM = {
  mel: { warm: 4, bright: 0, organ: 16, pluck: 24 },   // electric piano, grand piano, drawbar organ, nylon guitar
  chd: { warm: 4, bright: 0, organ: 16, pluck: 25 },   // … steel guitar for plucked chords
  bas: { warm: 32, bright: 34, organ: 16, pluck: 33 }, // acoustic, picked, organ, fingered bass
};

function trackChunk(events, end) {
  // events: { t, order, bytes } — at one tick note-offs (order 0) come before metas (1) and note-ons (2)
  events.sort((a, b) => a.t - b.t || a.order - b.order);
  // A pitch struck again while still sounding (a swung or long note running into the next one) is ended first,
  // so the later note keeps its full length instead of being cut off by the earlier note's note-off
  const sounding = new Map(), clean = [];
  events.forEach(e => {
    const st = e.bytes[0] & 0xf0, id = (e.bytes[0] & 15) * 128 + e.bytes[1];
    if (st === 0x90) {
      if (sounding.get(id)) clean.push({ t: e.t, bytes: [0x80 | (e.bytes[0] & 15), e.bytes[1], 0] });
      sounding.set(id, (sounding.get(id) || 0) + 1);
    } else if (st === 0x80) {
      const n = sounding.get(id) || 0;
      if (n > 1) { sounding.set(id, n - 1); return; } // an earlier copy of this pitch was already ended
      sounding.set(id, 0);
    }
    clean.push(e);
  });
  let last = 0;
  const data = [];
  clean.forEach(e => { data.push(...vlq(e.t - last), ...e.bytes); last = e.t; });
  // Every track runs to the end of the song, so trailing rests are kept
  data.push(...vlq(Math.max(0, (end || 0) - last)), 0xff, 0x2f, 0x00);
  return [0x4d, 0x54, 0x72, 0x6b].concat(u32(data.length), data);
}

// Bars in playing order: the song arrangement (or this section only)
function barsInOrder(song, scope, section) {
  const list = [];
  const arr = scope === 'section' ? [section] : (song.arrangement.length ? song.arrangement : song.sections.map((_, i) => i));
  arr.forEach((si, ai) => { const sec = song.sections[si]; if (sec) sec.measures.forEach((m, mi) => list.push({ si, mi, m, first: mi === 0, name: sec.name })); });
  return list;
}

// Chord symbols in plain ASCII (C#m7b5, Bbdim), which every MIDI program displays correctly
const ascii = (s) => String(s || '').replace(/𝄫/g, 'bb').replace(/𝄪/g, 'x').replace(/♭/g, 'b').replace(/♯/g, '#').replace(/ø7?/g, 'm7b5').replace(/°/g, 'dim').replace(/Δ/g, 'maj').replace(/[–—]/g, '-').replace(/[^\x20-\x7e]/g, '');
function songToMidi(song, opts = {}) {
  const bars = barsInOrder(song, opts.scope, opts.section || 0);
  const conductor = [], tracks = { mel: [], chd: [], bas: [], drm: [] };
  const drums = song.drums && song.drums !== 'off' && !(song.mute || {}).drm;
  const vol = song.vol || {}, mute = song.mute || {}, voice = song.voice || {};
  const lanes = [['mel', 'Melody', 0], ['chd', 'Chords', 1], ['bas', 'Bass', 2]];
  conductor.push({ t: 0, order: 1, bytes: meta(0x03, text(song.title || 'Untitled song')) });
  conductor.push({ t: 0, order: 1, bytes: meta(0x01, text('Made with Theory Decks')) });
  // The whole song, embedded so Import can open this .mid file again exactly as it was
  conductor.push({ t: 0, order: 1, bytes: meta(0x7f, [0x7d].concat(text(SIGNATURE + JSON.stringify(song)))) });
  if (drums) { tracks.drm.push({ t: 0, order: 1, bytes: meta(0x03, text('Drums')) }); tracks.drm.push({ t: 0, order: 1, bytes: [0xb9, 7, Math.max(0, Math.min(127, Math.round(127 * (vol.drm !== undefined ? vol.drm : 0.7))))] }); }
  lanes.forEach(([k, name, ch]) => {
    tracks[k].push({ t: 0, order: 1, bytes: meta(0x03, text(name)) });
    tracks[k].push({ t: 0, order: 1, bytes: [0xc0 | ch, PROGRAM[k][voice[k]] !== undefined ? PROGRAM[k][voice[k]] : PROGRAM[k].warm] });
    tracks[k].push({ t: 0, order: 1, bytes: [0xb0 | ch, 7, Math.max(0, Math.min(127, Math.round(127 * (vol[k] !== undefined ? vol[k] : 0.8))))] }); // channel volume from the Mix (0 = silent)
  });
  // Swing: off-beat 8ths start later, exactly as the player plays them
  const swingTicks = (t) => song.swing && t % 24 === 12 ? song.swing * 12 * 0.66 : 0;
  let at = 0, prev = { tempo: null, meter: null, key: null };
  // A swung note ends where the straight note would, so it never runs over the next beat
  const len = (t, d, f) => Math.max(1, (d - swingTicks(t)) * f) * K;
  const note = (k, ch, midi, start, len, vel) => {
    if (midi === null || !Number.isFinite(midi) || midi < 0 || midi > 127) return;
    const on = Math.round(start), off = Math.max(on + 1, Math.round(start + len));
    tracks[k].push({ t: on, order: 2, bytes: [0x90 | ch, midi, vel] });
    tracks[k].push({ t: off, order: 0, bytes: [0x80 | ch, midi, 0] });
  };
  bars.forEach(({ m, first, name }) => {
    const ctx = C.measureCtx(m);
    const bpm = m.tempo || song.tempo;
    if (bpm !== prev.tempo) { const us = Math.round(60000000 / bpm); conductor.push({ t: at, order: 1, bytes: meta(0x51, [(us >> 16) & 255, (us >> 8) & 255, us & 255]) }); prev.tempo = bpm; }
    const meter = m.num + '/' + m.den + '/' + C.groupsOf(m).join('+');
    if (meter !== prev.meter) { conductor.push({ t: at, order: 1, bytes: meta(0x58, [m.num, Math.log2(m.den), clocksPerClick(m), 8]) }); prev.meter = meter; }
    const ks = keySignature(m), key = ks.sf + '/' + ks.mi;
    // A key signature can only say "n sharps or flats, major or minor", so the exact key and scale go alongside it as text
    const exact = m.key + ' ' + ctx.scale.name;
    if (key !== prev.key || exact !== prev.exact) { conductor.push({ t: at, order: 1, bytes: meta(0x59, [ks.sf & 255, ks.mi]) }); conductor.push({ t: at, order: 1, bytes: meta(0x01, text(ascii('Key: ' + exact))) }); prev.key = key; prev.exact = exact; }
    if (first) conductor.push({ t: at, order: 1, bytes: meta(0x06, text(name)) });
    // Chord symbols as text on the Chords track, so notation programs and DAWs can show them
    m.chords.forEach(c => { if (c.chord) tracks.chd.push({ t: at + c.t * K, order: 1, bytes: meta(0x01, text(ascii(C.chordName(c.chord, ctx)))) }); });
    if (!mute.mel) m.mel.forEach(n => note('mel', 0, C.melodyMidi(n, ctx), at + (n.t + swingTicks(n.t)) * K, len(n.t, n.d, 0.95), 96));
    if (!mute.chd) m.chd.forEach(h => { const ch = C.chordAt(m, h.t); [...new Set(C.chordMidis(ch, ctx))].forEach(x => note('chd', 1, x, at + (h.t + swingTicks(h.t)) * K, len(h.t, h.d, 0.92), 80)); });
    if (!mute.bas) m.bas.forEach(h => note('bas', 2, C.bassMidi(C.chordAt(m, h.t), ctx), at + (h.t + swingTicks(h.t)) * K, len(h.t, h.d, 0.92), 90));
    if (drums) C.drumHits(m, song.drums).forEach(h => note('drm', 9, C.DRUM_MIDI[h.kind], at + (h.t + swingTicks(h.t)) * K, 6 * K, h.kind === 'hat' ? 70 : h.kind === 'kick' ? 105 : 95));
    at += C.measureTicks(m) * K;
  });
  conductor.push({ t: at, order: 1, bytes: meta(0x06, text('End')) });
  const chunks = [trackChunk(conductor, at)].concat(lanes.map(([k]) => trackChunk(tracks[k], at)), drums ? [trackChunk(tracks.drm, at)] : []);
  const head = [0x4d, 0x54, 0x68, 0x64].concat(u32(6), u16(1), u16(chunks.length), u16(PPQ));
  const bytes = new Uint8Array(head.length + chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  [head].concat(chunks).forEach(c => { bytes.set(c, o); o += c.length; });
  return { bytes, bars: bars.length, seconds: bars.reduce((s, b) => s + C.measureTicks(b.m) / 24 * 60 / (b.m.tempo || song.tempo), 0) };
}

// ---------- reading a .mid back ----------
// Files exported here carry the song itself; any other MIDI file is read note by note into a new song
const SIGNATURE = 'TheoryDecksSong:';
function readChunks(bytes) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 14 || String.fromCharCode(...bytes.slice(0, 4)) !== 'MThd') return null;
  const ppq = v.getUint16(12), out = [];
  let o = 8 + v.getUint32(4);
  while (o + 8 <= bytes.length) {
    const id = String.fromCharCode(...bytes.slice(o, o + 4)), len = v.getUint32(o + 4);
    if (id === 'MTrk') out.push(bytes.subarray(o + 8, Math.min(bytes.length, o + 8 + len)));
    o += 8 + len;
  }
  return { ppq, tracks: out };
}
// Every event of a track: { t, type ('on' | 'off' | 'meta'), ch, note, vel, metaType, data }
function readEvents(tr) {
  const ev = [];
  let i = 0, t = 0, run = 0;
  const vl = () => { let n = 0, b; do { b = tr[i++]; n = (n << 7) | (b & 0x7f); } while (b & 0x80 && i < tr.length); return n; };
  while (i < tr.length) {
    t += vl();
    let st = tr[i];
    if (st & 0x80) i++; else st = run;
    if (st === 0xff) { const type = tr[i++], len = vl(); ev.push({ t, type: 'meta', metaType: type, data: tr.subarray(i, i + len) }); i += len; continue; }
    if (st === 0xf0 || st === 0xf7) { const len = vl(); i += len; continue; }
    run = st;
    const hi = st & 0xf0, ch = st & 15;
    if (hi === 0xc0 || hi === 0xd0) { i += 1; continue; }
    const a = tr[i++], b = tr[i++];
    if (hi === 0x90 && b > 0) ev.push({ t, type: 'on', ch, note: a, vel: b });
    else if (hi === 0x80 || hi === 0x90) ev.push({ t, type: 'off', ch, note: a });
  }
  return ev;
}
const utf8 = (data) => { let s = ''; data.forEach(b => { s += String.fromCharCode(b); }); try { return decodeURIComponent(escape(s)); } catch { return s; } };
function midiToSong(buffer, fileName) {
  const bytes = new Uint8Array(buffer);
  const file = readChunks(bytes);
  if (!file || !file.tracks.length) return null;
  const all = file.tracks.map(readEvents);
  // 1. Our own export: the song is inside
  for (const ev of all) for (const e of ev) if (e.type === 'meta' && e.metaType === 0x7f && e.data[0] === 0x7d) {
    const txt = utf8(e.data.subarray(1));
    if (txt.startsWith(SIGNATURE)) { try { return { song: C.cleanSong(JSON.parse(txt.slice(SIGNATURE.length))), exact: true }; } catch { /* fall through */ } }
  }
  // 2. Any other MIDI file: tempo, meter and key from the first events; highest notes → melody, lowest → bass
  const ppq = file.ppq & 0x8000 ? 480 : file.ppq || 480;
  const metas = all.flat().filter(e => e.type === 'meta');
  const tempoEv = metas.find(e => e.metaType === 0x51), tsEv = metas.find(e => e.metaType === 0x58), ksEv = metas.find(e => e.metaType === 0x59);
  const bpm = tempoEv ? Math.round(60000000 / ((tempoEv.data[0] << 16) | (tempoEv.data[1] << 8) | tempoEv.data[2])) : 120;
  const num = tsEv ? tsEv.data[0] : 4, den = tsEv ? Math.pow(2, tsEv.data[1]) : 4;
  let key = 'C', scale = 'Major (Ionian)';
  if (ksEv) {
    const sf = (ksEv.data[0] << 24) >> 24, mi = ksEv.data[1];
    // Any signature from −7 to +7 (G♭, C♭, C♯ major, E♭/A♭/D♯/A♯ minor…): its major tonic is sf fifths from C
    const majorPc = ((sf * 7) % 12 + 12) % 12, pc = mi ? (majorPc + 9) % 12 : majorPc;
    if (sf >= -7 && sf <= 7) { key = C.KEY_NAMES[pc]; scale = mi ? 'Natural minor (Aeolian)' : 'Major (Ionian)'; }
  }
  // Notes per part (track + channel)
  const parts = {};
  all.forEach((ev, ti) => {
    const open = {};
    ev.forEach(e => {
      if (e.ch === 9) return; // drums are not pitches
      const id = e.ch * 128 + e.note, part = (parts[ti * 16 + e.ch] = parts[ti * 16 + e.ch] || []);
      if (e.type === 'on') { if (open[id]) part.push(Object.assign(open[id], { d: e.t - open[id].t })); open[id] = { t: e.t, note: e.note }; }
      else if (e.type === 'off' && open[id]) { part.push(Object.assign(open[id], { d: e.t - open[id].t })); open[id] = null; }
    });
  });
  // The melody is the highest part that plays mostly one note at a time (chords and bass are left to the DAW)
  const info = Object.values(parts).filter(p => p.length).map(p => {
    const starts = new Set(p.map(n => n.t));
    return { p, mono: starts.size / p.length, avg: p.reduce((a, n) => a + n.note, 0) / p.length };
  });
  if (!info.length) return null;
  const mono = info.filter(x => x.mono >= 0.8);
  const pick = (mono.length ? mono : info).reduce((a, b) => (b.avg > a.avg ? b : a));
  const notes = pick.p;
  const toTicks = (x) => Math.round(x * (C.TPW / 4) / ppq / 3) * 3; // to the nearest 32nd
  const proto = Object.assign(C.newMeasure(), { num: Math.max(1, Math.min(32, num)), den: C.DENOMS.includes(den) ? den : 4, groups: null, key, scale, scaleSemis: null, tempo: null });
  const barTicks = C.measureTicks(proto);
  const end = info.reduce((a, x) => x.p.reduce((b, n) => Math.max(b, toTicks(n.t + n.d)), a), 1); // the whole piece's length
  const count = Math.max(1, Math.min(256, Math.ceil(end / barTicks)));
  const measures = Array.from({ length: count }, () => { const m = C.newMeasure(proto); m.chords = []; m.mel = []; m.chd = []; m.bas = []; return m; });
  const keyPc = C.measureCtx(proto).keyPc, sc = C.scaleByName(scale);
  const toDeg = (midi) => { // nearest scale degree (+ accidental) from the tonic near middle C
    const rel = midi - 60 - (keyPc > 6 ? keyPc - 12 : keyPc), oct = Math.floor(rel / 12), s = ((rel % 12) + 12) % 12;
    let best = 0, bd = 99; sc.semis.forEach((x, i) => { const d = s - x; if (Math.abs(d) < Math.abs(bd)) { bd = d; best = i; } });
    return { deg: oct * sc.semis.length + best + 1, acc: bd };
  };
  // At each start time, the top note is the melody (within the melody lane's two octaves)
  const starts = {};
  notes.forEach(n => { const t = toTicks(n.t); (starts[t] = starts[t] || []).push(n); });
  Object.keys(starts).map(Number).sort((a, b) => a - b).forEach(t => {
    const mi = Math.floor(t / barTicks), m = measures[mi];
    if (!m) return;
    const top = starts[t].reduce((a, b) => (b.note > a.note ? b : a));
    const dg = toDeg(top.note);
    if (dg.deg >= -6 && dg.deg <= 22) m.mel.push({ t: t - mi * barTicks, d: Math.max(3, Math.min(barTicks - (t - mi * barTicks), toTicks(top.d))), deg: dg.deg, acc: dg.acc });
  });
  const title = String(fileName || 'Imported MIDI').replace(/\.midi?$/i, '').slice(0, 80);
  const song = C.newSong();
  Object.assign(song, { title, tempo: Math.max(20, Math.min(400, bpm)), sections: [{ name: 'A', measures }], arrangement: [0] });
  return { song: C.cleanSong(song), exact: false };
}

TD['daw-midi.js'] = { songToMidi, midiToSong, keySignature, PPQ };
})(window.TD = window.TD || {});
