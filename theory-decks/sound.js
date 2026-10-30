(function (TD) {
'use strict';
// Exact pitches (MIDI numbers) for every playable card.
// Cards are written in C (Andalusian in A minor); card.soundShift (semitones) transposes them, e.g. to a dealt key.
const { parseFormula, ascending, noteToTonic, pcOf, spell } = TD['theory.js'];

const C4 = 60, C5 = 72;
const clean = (formula) => String(formula).replace(/𝄫/g, '♭♭').replace(/𝄪/g, '♯♯');
const MAJOR = [0, 2, 4, 5, 7, 9, 11, 12];
const SCALE_DECKS = new Set(['scales5', 'scales6', 'scales7', 'modes']);
const CHORD_DECKS = new Set(['triads', 'tetrads']);
const PROGRESSION_DECKS = new Set(['andalusian', 'deceptive', 'majorminor', 'blues']);
const A_MINOR = { l: 5, acc: 0, name: 'A', pc: 9 };
const C_MAJOR = { l: 0, acc: 0, name: 'C', pc: 0 };

// Semitones above the root for each chord quality used in the progression decks
const QUALITY = {
  '': [0, 4, 7], 'm': [0, 3, 7], 'dim': [0, 3, 6], '°': [0, 3, 6], '+': [0, 4, 8],
  '5': [0, 7, 12], 'sus2': [0, 2, 7], 'sus4': [0, 5, 7], '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9],
  '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], 'ø7': [0, 3, 6, 10], 'm7♭5': [0, 3, 6, 10],
  '°7': [0, 3, 6, 9], 'dim7': [0, 3, 6, 9], 'm(maj7)': [0, 3, 7, 11], '+7': [0, 4, 8, 10], '7sus4': [0, 5, 7, 10],
  'add9': [0, 4, 7, 14], 'm(add9)': [0, 3, 7, 14], '9': [0, 4, 7, 10, 14], 'm9': [0, 3, 7, 10, 14],
  'maj9': [0, 4, 7, 11, 14], 'm11': [0, 3, 7, 10, 14, 17], '13': [0, 4, 10, 14, 21],
  '7♭9': [0, 4, 7, 10, 13], '7♯9': [0, 4, 7, 10, 15], 'maj7♯11': [0, 4, 7, 11, 18], '6/9': [0, 4, 9, 14], 'm6/9': [0, 3, 9, 14],
  '9sus4': [0, 5, 7, 10, 14], '+maj7': [0, 4, 8, 11], 'aug': [0, 4, 8], 'm7(♭5)': [0, 3, 6, 10],
  '11': [0, 4, 7, 10, 14, 17], 'maj13': [0, 4, 7, 11, 14, 21], 'm13': [0, 3, 7, 10, 14, 21], '7♭13': [0, 4, 7, 10, 20], '7alt': [0, 4, 10, 13, 15, 20],
};

function chordMidis(symbol) {
  const m = String(symbol).trim().match(/^([A-G][♭♯#]*)(.*)$/);
  if (!m) return null;
  const t = noteToTonic(m[1].replace(/#/g, '♯'));
  // Roots A♭3–G4 (clearly audible on phone and laptop speakers); the bass never leaps more than a fifth or so
  const pc = ((pcOf(t.l, t.acc) % 12) + 12) % 12;
  const root = C4 + (pc >= 8 ? pc - 12 : pc);
  const shape = QUALITY[m[2]] || QUALITY[m[2].replace(/\(.*\)$/, '')] || QUALITY[''];
  return shape.map(s => root + s);
}

// Smooth bass: each chord moves to the octave whose root is nearest the previous root (roots kept within E3–A4),
// so Am–G–F–E really descends instead of jumping up an octave.
function voiceLead(chords) {
  if (!chords.length) return null;
  let prev = chords[0][0];
  return chords.map((notes, i) => {
    if (i === 0) return notes;
    let shift = 0;
    const root = notes[0];
    [-12, 0, 12].forEach(o => { if (Math.abs(root + o - prev) < Math.abs(root + shift - prev) && root + o >= 52 && root + o <= 69) shift = o; });
    prev = root + shift;
    return notes.map(n => n + shift);
  });
}

// "E4", "F♯1", "B♭3" → MIDI number (null when unreadable)
function noteMidi(name) {
  const m = String(name || '').trim().match(/^([A-G][♭♯#b𝄫𝄪]*)(-?\d)$/);
  if (!m) return null;
  const t = noteToTonic(m[1]);
  return 12 * (+m[2] + 1) + [0, 2, 4, 5, 7, 9, 11][t.l] + t.acc; // B♯3 = C4, C♭4 = B3
}

// Adds the octave to every event: ascending lines and chords gain the octave above their first note,
// descending lines finish on the octave below it. Notes already present are not doubled.
function withOctave(events) {
  return events.map(notes => {
    if (!notes.length) return notes;
    const down = notes.length > 1 && notes[notes.length - 1] < notes[0];
    const oct = notes[0] + (down ? -12 : 12);
    return notes.includes(oct) ? notes : notes.concat(oct);
  });
}

const first = (card, label) => (card.rows.find(([k]) => k === label) || [])[1];

function baseEvents(deckId, card) {
  if (deckId === 'intervals' || deckId === 'intervals-ext') {
    const raw = first(card, 'Semitones / frets');
    if (raw === undefined) return null;
    const st = parseInt(raw, 10);
    // Ascending from C4; descending from C5 so even the double octave stays above C3
    return /down/.test(raw) ? [[C5, C5 - st]] : [[C4, C4 + st]];
  }
  if (CHORD_DECKS.has(deckId)) {
    // Exactly the chord's tones; inversions keep the written bass note lowest (bass between F3 and E4)
    const semis = ascending(parseFormula(clean(card.sub)));
    if (!semis.length) return null;
    const low = semis[0] >= 5 ? C4 - 12 : C4;
    return [semis.map(s => low + s)];
  }
  if (SCALE_DECKS.has(deckId)) {
    // Exactly the scale's tones (5, 6 or 7 notes), in order from its first note — no added octave
    const semis = ascending(parseFormula(clean(card.sub)));
    return semis.length ? [semis.map(s => C4 + s)] : null;
  }
  if (deckId === 'melodicpatterns') {
    const degs = parseFormula(clean(card.sub));
    return degs.length ? [degs.map(d => C4 + d.semis)] : null;
  }
  if (deckId === 'melodic7base0') {
    return [card.sub.split('').map(p => C4 + MAJOR[+p])];
  }
  if (deckId === 'keys') {
    // The key's own scale from its tonic (octave 4)
    const t = noteToTonic(card.tonicName || card.title.split(/[ /]/)[0]);
    const pc = ((pcOf(t.l, t.acc) % 12) + 12) % 12;
    const semis = String(card.base0 || '0-2-4-5-7-9-11').split('-').map(Number);
    return [semis.map(x => C4 + pc + x)];
  }
  if (deckId === 'strings') {
    // The open string at its real pitch
    const m = noteMidi(first(card, 'Open note'));
    return m === null ? null : [[m]];
  }
  if (deckId === 'righthand') {
    // The picking path over the open strings: Together strums them, Arpeggio picks them in order
    const notes = String(first(card, 'Open notes') || '').split(' ').map(noteMidi);
    return notes.length && notes.every(n => n !== null) ? [notes] : null;
  }
  if (deckId === 'lefthand') {
    // One finger per fret: finger 1 on C4, finger 2 a semitone higher, and so on
    const fingers = String(first(card, 'Finger sequence') || card.title).split('-').map(Number);
    return fingers.every(f => f >= 1 && f <= 4) ? [fingers.map(f => C4 + f - 1)] : null;
  }
  if (deckId === 'romannumerals') {
    // The triad the numeral names: upper case major, lower case minor, ° diminished (root G3–F♯4)
    const numeral = first(card, 'Roman ID in major') || first(card, 'Roman ID in minor') || '';
    const t = noteToTonic(first(card, 'Root in C') || 'C');
    const pc = ((pcOf(t.l, t.acc) % 12) + 12) % 12;
    const root = C4 + (pc >= 7 ? pc - 12 : pc);
    const letters = numeral.replace(/[^IViv]/g, '');
    const shape = /°/.test(numeral) ? [0, 3, 6] : letters && letters === letters.toLowerCase() ? [0, 3, 7] : [0, 4, 7];
    return [shape.map(x => root + x)];
  }
  if (deckId === 'base0' && card.sourceDeckId) {
    // A Base 0 card plays its source card
    const source = (TD['decks.js'].DECKS || []).find(d => d.id === card.sourceDeckId);
    const original = source && source.cards[card.sourceCardIndex];
    return original ? baseEvents(card.sourceDeckId, original) : null;
  }
  if (PROGRESSION_DECKS.has(deckId) && card.transpose) {
    // Browsing: play the key the card is written in (its "Key" row, e.g. A minor). Games pass soundShift and
    // move the C-based (Andalusian: A-based) version to the dealt key instead.
    const keyRow = card.soundShift === undefined ? first(card, 'Key') : null;
    const written = keyRow && /^[A-G][♯♭]?/.test(keyRow) ? noteToTonic(keyRow.match(/^[A-G][♯♭]?/)[0]) : null;
    const t = card.transpose(written || (deckId === 'andalusian' ? A_MINOR : C_MAJOR));
    const value = typeof t === 'object' ? t.v : t;
    return voiceLead(value.split('–').map(chordMidis).filter(Boolean));
  }
  return null;
}

// Returns { events, progression } or null when the card has no defined pitches
function soundFor(deckId, card) {
  if (card.soundEvents) return card.soundEvents.length ? { events: card.soundEvents, progression: !!card.soundProgression || PROGRESSION_DECKS.has(deckId) } : null;
  const events = baseEvents(deckId, card);
  if (!events) return null;
  const shift = card.soundShift || 0;
  return {
    events: shift ? events.map(notes => notes.map(n => n + shift)) : events,
    progression: PROGRESSION_DECKS.has(deckId),
  };
}

// Semitone shift from C (or A for the Andalusian deck) to a dealt tonic, kept within −5…+6 so the register stays comfortable
function shiftTo(tonicPc, deckId) {
  const from = deckId === 'andalusian' ? 9 : 0;
  let s = ((tonicPc - from) % 12 + 12) % 12;
  if (s > 6) s -= 12;
  return s;
}

const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const midiName = (m) => NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
// Human-readable pitches of a card, e.g. "C3 E3 G3 / F3 A3 C4"
// Spell a group of pitches the way it is written: try sharp, flat and the default names and keep the
// spelling whose neighbouring notes are a letter step or a third apart (E G♯ B, not E A♭ B)
const SHARPS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLATS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
function spellGroup(notes) {
  const score = (names) => {
    const letters = notes.map(m => 'CDEFGAB'.indexOf(names[((m % 12) + 12) % 12][0]));
    let n = 0;
    for (let i = 1; i < letters.length; i++) {
      const d = (letters[i] - letters[i - 1] + 7) % 7;
      if (d === 2 || d === 5) n += 1.5; else if (d === 1 || d === 6) n++; else if (d === 0 && notes[i] % 12 !== notes[i - 1] % 12) n -= 2;
    }
    return n;
  };
  const best = [NOTE_NAMES, SHARPS, FLATS].reduce((a, b) => score(b) > score(a) ? b : a);
  return notes.map(m => best[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1));
}
// Chord, scale and pattern cards are spelled from their formula, letter by letter, double flats and sharps
// included (C°7 = C4 E♭4 G♭4 B𝄫4); an added octave takes the name of the note it doubles
function spellCard(deckId, card, notes) {
  if (!(CHORD_DECKS.has(deckId) || SCALE_DECKS.has(deckId) || deckId === 'melodicpatterns') || !card || !card.sub) return spellGroup(notes);
  const degs = parseFormula(clean(card.sub));
  const shift = ((card.soundShift || 0) % 12 + 12) % 12;
  const tonic = noteToTonic(NOTE_NAMES[shift]);
  const names = degs.map(d => spell(tonic, d));
  const out = notes.map((m, i) => {
    let nm = i < names.length ? names[i] : null;
    if (nm === null) { const j = notes.findIndex((x, k) => k < names.length && ((x - m) % 12 + 12) % 12 === 0); nm = j >= 0 ? names[j] : null; }
    if (!nm) return null;
    const t = noteToTonic(nm);
    if (Math.abs(t.acc) > 2 || ((pcOf(t.l, t.acc) - m) % 12 + 12) % 12) return null; // not this pitch: use the general spelling
    return nm.replace('♭♭', '𝄫').replace('♯♯', '𝄪') + ((m - pcOf(t.l, 0) - t.acc) / 12 - 1);
  });
  return out.every(x => x !== null && !/NaN|\./.test(x)) ? out : spellGroup(notes);
}
function describeSound(deckId, card) {
  const s = soundFor(deckId, card);
  return s ? s.events.map(notes => spellCard(deckId, card, notes).join(' ')).join(' / ') : '';
}

TD['sound.js'] = { QUALITY, spellGroup, spellCard, withOctave, noteMidi, voiceLead, describeSound, midiName, soundFor, shiftTo, chordMidis, PLAYABLE_DECKS: ['keys', 'intervals', 'romannumerals', 'intervals-ext', 'triads', 'tetrads', 'scales5', 'scales6', 'scales7', 'modes', 'melodicpatterns', 'melodic7base0', 'andalusian', 'deceptive', 'majorminor', 'blues', 'strings', 'lefthand', 'righthand', 'base0'] };
})(window.TD = window.TD || {});
