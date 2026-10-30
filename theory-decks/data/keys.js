(function (TD) {
'use strict';
TD.lazy('data/keys.js', () => {
const { spell, parseFormula, ROOTS, pcOf, ROMAN_OF_PC, noteToTonic } = TD['theory.js'];

const KEYS = [
  ['C', 0, 0, 'Am', '0', 'No sharps or flats. Home base for theory — every open chord shape (C, F, G, Am, Dm, Em) lives here.'],
  ['G', 4, 0, 'Em', '1♯', 'Bright and open on guitar. G, C, D, Em, Am all ring with open strings — a campfire staple.'],
  ['D', 1, 0, 'Bm', '2♯', 'Resonant key with open D and A strings as drones. Popular in folk and rock.'],
  ['A', 5, 0, 'F♯m', '3♯', 'Blues and rock favourite. Open A string root, easy E7 to resolve home.'],
  ['E', 2, 0, 'C♯m', '4♯', 'The guitar\'s natural key — lowest open string is the root. Heavy riffs and blues live here.'],
  ['B', 6, 0, 'G♯m', '5♯', 'Mostly barre chords. Common in modern rock and when tuning down from C♯.'],
  ['F♯ / G♭', 3, 1, 'D♯m / E♭m', '6♯ / 6♭', 'Enharmonic pivot of the circle of fifths. All barre shapes; a half-step below G.'],
  ['D♭', 1, -1, 'B♭m', '5♭', 'Same as C♯. Lush on keys; on guitar usually played with barre shapes or a capo.'],
  ['A♭', 5, -1, 'Fm', '4♭', 'Warm, soulful key common in R&B, gospel and jazz ballads.'],
  ['E♭', 2, -1, 'Cm', '3♭', 'Horn-friendly jazz key. Half-step-down tuning turns E shapes into E♭.'],
  ['B♭', 6, -1, 'Gm', '2♭', 'Jazz and big-band staple. Barre at fret 1 or 6; brass sections love it.'],
  ['F', 3, 0, 'Dm', '1♭', 'One flat (B♭). The first barre chord most guitarists learn.'],
];

const MAJOR = parseFormula('1–2–3–4–5–6–7');
// Equal temperament, A4 = 440 Hz; tonic in octave 4 (C4–B4)
const freqOf = (pc) => 440 * Math.pow(2, (60 + pc - 69) / 12);

const keyCards = KEYS.map(([name, l, acc, rel, sig, desc], i) => {
  const notes = MAJOR.map(d => spell({ l, acc }, d)).join(' ');
  return {
    title: name, sub: 'Major key',
    rows: [['Notes', notes], ['Relative minor', rel], ['Key signature', sig], ['Circle of 5ths', '#' + (i + 1)]],
    desc,
    allKeysLabel: name.split(' ')[0] + ' as a degree of each key',
    transpose: (r) => ROMAN_OF_PC[(pcOf(l, acc) - r.pc + 12) % 12],
    base0: '0-2-4-5-7-9-11',
    freq: freqOf(pcOf(l, acc)),
    tonicName: name.split(' ')[0],
  };
});

const MINOR_KINDS = [
  ['Natural minor key', '1–2–♭3–4–5–♭6–♭7', '0-2-3-5-7-8-10', 'Aeolian colour: dark and settled. Shares every note with its relative major'],
  ['Harmonic minor key', '1–2–♭3–4–5–♭6–7', '0-2-3-5-7-8-11', 'Raised 7th gives a major V chord and a strong leading tone — classical, flamenco and metal'],
  ['Melodic minor key', '1–2–♭3–4–5–6–7', '0-2-3-5-7-9-11', 'Jazz minor: raised 6th and 7th smooth the ascent and power altered dominant sounds'],
];
MINOR_KINDS.forEach(([kind, formula, base0, blurb]) => {
  const degs = parseFormula(formula);
  KEYS.forEach(([major, , , rel, sig], i) => {
    const name = rel.split(' / ')[0].replace(/m$/, '');
    const t = noteToTonic(name);
    keyCards.push({
      title: rel.replace(/m(?= |$)/g, ' minor'), sub: kind, group: kind.replace(' key', ' keys'),
      rows: [['Notes', degs.map(d => spell(t, d)).join(' ')], ['Relative major', major], ['Key signature', sig], ['Circle of 5ths', '#' + (i + 1)]],
      desc: blurb + '. Tonic ' + name + ', relative to ' + major + ' major.',
      allKeysLabel: name + ' as a degree of each key',
      transpose: (r) => ROMAN_OF_PC[(pcOf(t.l, t.acc) - r.pc + 12) % 12],
      base0,
      freq: freqOf(pcOf(t.l, t.acc)),
      tonicName: name,
    });
  });
});
keyCards.slice(0, 12).forEach(card => { card.group = 'Major keys (Ionian)'; });
keyCards.filter(card => card.sub === 'Natural minor key').forEach(card => { card.group = 'Natural minor keys (Aeolian)'; });

// The remaining modes of the major scale, on all 12 tonics. Each tonic is spelled (C♯ or D♭…) so the
// scale needs the fewest accidentals and no double sharps or flats.
const MODE_KEYS = [
  ['Dorian', 1, '1–2–♭3–4–5–6–♭7', '0-2-3-5-7-9-10', 'natural 6', 'Minor with a bright raised 6th — funk, soul, Santana and "So What"'],
  ['Phrygian', 2, '1–♭2–♭3–4–5–♭6–♭7', '0-1-3-5-7-8-10', '♭2', 'Minor with a dark ♭2 — flamenco, metal and Spanish colour'],
  ['Lydian', 3, '1–2–3–♯4–5–6–7', '0-2-4-6-7-9-11', '♯4', 'Major with a floating ♯4 — film scores, dreamy and bright'],
  ['Mixolydian', 4, '1–2–3–4–5–6–♭7', '0-2-4-5-7-9-10', '♭7', 'Major with a bluesy ♭7 — rock, blues, country and Celtic tunes'],
  ['Locrian', 6, '1–♭2–♭3–4–♭5–♭6–♭7', '0-1-3-5-6-8-10', '♭5', 'Diminished tonic with ♭2 and ♭5 — unstable, used over m7♭5 chords and in metal'],
];
const TONIC_SPELLINGS = [['C'], ['D♭', 'C♯'], ['D'], ['E♭', 'D♯'], ['E'], ['F'], ['F♯', 'G♭'], ['G'], ['A♭', 'G♯'], ['A'], ['B♭', 'A♯'], ['B']];
const accCount = (notes) => notes.reduce((n, note) => n + (note.match(/[♯♭]/g) || []).length, 0);
const doubled = (notes) => notes.some(note => /♯♯|♭♭/.test(note));
MODE_KEYS.forEach(([mode, degree, formula, base0, colour, blurb]) => {
  const degs = parseFormula(formula);
  TONIC_SPELLINGS.forEach((options) => {
    const best = options.map(name => {
      const t = noteToTonic(name);
      const notes = degs.map(d => spell(t, d));
      return { name, t, notes, score: accCount(notes) + (doubled(notes) ? 100 : 0) };
    }).sort((a, b) => a.score - b.score)[0];
    const { name, t, notes } = best;
    // The parent major key is the major scale this mode is a rotation of
    const parent = notes[(7 - degree) % 7];
    const sharps = notes.filter(n => n.includes('♯')).length, flats = notes.filter(n => n.includes('♭')).length;
    keyCards.push({
      title: name + ' ' + mode, sub: mode + ' key', group: mode + ' keys',
      rows: [['Notes', notes.join(' ')], ['Formula', formula], ['Parent major', parent + ' major (mode ' + (degree + 1) + ')'], ['Key signature', sharps ? sharps + '♯' : flats ? flats + '♭' : '0'], ['Colour note', colour]],
      desc: blurb + '. ' + name + ' ' + mode + ' uses the notes of ' + parent + ' major, starting on its ' + ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'][degree] + ' degree.',
      allKeysLabel: name + ' as a degree of each key',
      transpose: (r) => ROMAN_OF_PC[(pcOf(t.l, t.acc) - r.pc + 12) % 12],
      base0,
      freq: freqOf(pcOf(t.l, t.acc)),
      tonicName: name,
    });
  });
});
return { keyCards };
});
})(window.TD = window.TD || {});
