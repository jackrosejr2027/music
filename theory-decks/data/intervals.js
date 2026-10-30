(function (TD) {
'use strict';
TD.lazy('data/intervals.js', () => {
const { parseDeg, spell, accStr } = TD['theory.js'];
const NAT = [0, 2, 4, 5, 7, 9, 11];

// [short, name, degree, semitones, description]
const IV = [
  ['P1', 'Perfect Unison', '1', 0, 'The same note twice. The root — every formula is measured from here.'],
  ['m2', 'Minor 2nd', '♭2', 1, 'One fret. The tightest, most tense interval — think Jaws theme.'],
  ['M2', 'Major 2nd', '2', 2, 'Two frets — a whole step. The building block of scales.'],
  ['A2', 'Augmented 2nd', '♯2', 3, 'Sounds like a minor 3rd but spelled as a 2nd. The exotic gap in harmonic minor.'],
  ['m3', 'Minor 3rd', '♭3', 3, 'Three frets. Defines minor chords and scales — sad, dark color.'],
  ['M3', 'Major 3rd', '3', 4, 'Four frets. Defines major chords — bright and happy.'],
  ['P4', 'Perfect 4th', '4', 5, 'Five frets — the distance between most adjacent guitar strings. Wants to resolve to the 3rd.'],
  ['A4', 'Augmented 4th', '♯4', 6, 'The tritone spelled sharp. The Lydian color note — dreamy and floating.'],
  ['d5', 'Diminished 5th', '♭5', 6, 'The tritone spelled flat. The blue note and the heart of diminished chords.'],
  ['P5', 'Perfect 5th', '5', 7, 'Seven frets. The power chord interval — stable, strong, neutral.'],
  ['A5', 'Augmented 5th', '♯5', 8, 'A raised 5th. Gives augmented chords their unresolved, rising tension.'],
  ['m6', 'Minor 6th', '♭6', 8, 'Eight frets. Bittersweet; the signature tone of Aeolian minor.'],
  ['M6', 'Major 6th', '6', 9, 'Nine frets. Sweet and vintage — the 6 chord and Dorian color.'],
  ['d7', 'Diminished 7th', '𝄫7', 9, 'Sounds like a major 6th; the 7th of a fully diminished chord.'],
  ['m7', 'Minor 7th', '♭7', 10, 'Ten frets. The bluesy 7th in dominant and minor 7 chords.'],
  ['M7', 'Major 7th', '7', 11, 'One fret below the octave. Smooth, jazzy and yearning — the leading tone.'],
  ['P8', 'Perfect Octave', '8', 12, 'Twelve frets. The same note, higher — octave shapes skip a string.'],
  ['m9', 'Minor 9th', '♭9', 13, 'Extension: ♭2 an octave up. Dark tension on dominant chords (7♭9).'],
  ['M9', 'Major 9th', '9', 14, 'Extension: 2 an octave up. Lush color in maj9, m9 and 9 chords.'],
  ['A9', 'Augmented 9th', '♯9', 15, 'Extension: the "Hendrix" note — ♭3 clashing over a major 3rd in 7♯9.'],
  ['m10', 'Minor 10th', '♭10', 15, 'Compound minor 3rd. Wide, open minor voicing.'],
  ['M10', 'Major 10th', '10', 16, 'Compound major 3rd. Classic spread voicing in jazz and fingerstyle.'],
  ['P11', 'Perfect 11th', '11', 17, 'Extension: 4 an octave up. Suspended, modern color in m11 and 11 chords.'],
  ['A11', 'Augmented 11th', '♯11', 18, 'Extension: ♯4 an octave up. The Lydian sparkle in maj7♯11.'],
  ['P12', 'Perfect 12th', '12', 19, 'Compound 5th — an octave plus a 5th. Natural harmonic at fret 7.'],
  ['m13', 'Minor 13th', '♭13', 20, 'Extension: ♭6 an octave up. Altered dominant tension (7♭13).'],
  ['M13', 'Major 13th', '13', 21, 'Extension: 6 an octave up. Sophisticated jazz color in 13 chords.'],
  ['m14', 'Minor 14th', '♭14', 22, 'Compound ♭7. Wide dominant/minor seventh spread.'],
  ['M14', 'Major 14th', '14', 23, 'Compound major 7th. Very wide, shimmering spread.'],
  ['P15', 'Double Octave', '15', 24, 'Two octaves — 24 frets. The full range of many guitar necks.'],
];

const intervalCards = IV.map(([short, name, deg, st, desc]) => ({
  title: name, sub: short + ' · ' + deg, group: 'Ascending',
  rows: [['Degree', deg], ['Semitones / frets', String(st)], ['Type', st > 12 ? 'Compound / extension' : 'Simple'], ['Direction', 'Up']],
  desc,
  allKeysLabel: deg + ' above each root',
  transpose: (r) => spell(r, parseDeg(deg.replace('𝄫', '♭♭'))),
}));
// Descending versions: the note the interval lies BELOW each root
IV.forEach(([short, name, deg, st, desc]) => {
  const d = parseDeg(deg.replace('𝄫', '♭♭'));
  const sn = ((d.n - 1) % 7) + 1;
  const semis = ((NAT[sn - 1] + d.acc) % 12 + 12) % 12;
  const inv = sn === 1 ? 1 : 9 - sn;
  const invAcc = (((12 - semis) % 12 - NAT[inv - 1]) + 18) % 12 - 6;
  const invDeg = { n: inv, acc: invAcc };
  intervalCards.push({
    title: 'Descending ' + name, sub: short + ' ↓ · ' + deg, group: 'Descending',
    rows: [['Degree', deg], ['Semitones / frets', String(st) + ' down'], ['Type', st > 12 ? 'Compound / extension' : 'Simple'], ['Direction', 'Down'], ['Below C', spell({ l: 0, acc: 0 }, invDeg)]],
    desc: 'Played downward from the root. ' + desc,
    allKeysLabel: deg + ' below each root',
    transpose: (r) => spell(r, invDeg),
  });
});
return { intervalCards };
});
})(window.TD = window.TD || {});
