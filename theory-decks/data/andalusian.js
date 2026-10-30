(function (TD) {
'use strict';
TD.lazy('data/andalusian.js', () => {
const { parseDeg, spell } = TD['theory.js'];

const RAW = `Ascending Andalusian|Am–C–Dm–E–F|Classic ascending motion with E as turnaround
Descending Andalusian|Am–G–F–E|Classic descending Andalusian cadence
Full Ascend/Descend|Am–C–Dm–E–F–E–Dm–C–Am|Ascending phrase returning through E
Descend to Turnaround|Am–G–F–E|Descending tonic-to-dominant cycle
Ascend with G|Am–C–Dm–E–F–G–E|Ascending sequence extended through G
Descend Extended|Am–G–F–E–Dm–C–G–E|Descending line with extended turnaround
Andalusian Six-Chord|Am–G–F–E–Dm–E|Descending foundation with Dm–E turnaround
Ascending Six-Chord|Am–C–Dm–E–F–E|Ascending cadence resolving back through E
|Am–G–F–E–Am|Complete descending cycle
|Am–C–Dm–E–Am|Compact ascending turnaround
|Am–G–F–Dm–E|Descending line with Dm replacing final F movement
|Am–G–F–C–E|Descending opening with C before turnaround
|Am–C–G–F–E|Ascending/descending hybrid
|Am–F–G–E|Minor tonic followed by predominant turnaround
|Am–F–C–E|Broad descending harmonic movement
|Am–Dm–C–E|Dorian-flavored predominant movement into E
|Am–Dm–G–F–E|Extended descent into turnaround
|Am–C–G–F–E–Am|Hybrid cadence with final tonic
|Am–C–Dm–G–F–E|Ascending opening followed by descent
|Am–Dm–C–G–F–E|Long descending dominant approach
|Am–G–C–F–E|Descending sequence interrupted by C
|Am–F–G–C–E|Circle-like detour before E
|Am–C–F–G–E|Bright major-chord detour
|Am–F–C–G–E|Four-chord pre-turnaround sequence
|Am–G–Dm–F–E|Descending tonic with minor predominant
|Am–G–C–Dm–E|Descending/ascending hybrid
|Am–F–Dm–E|Compact minor cadence
|Am–Dm–F–E|Predominant buildup to E
|Am–C–F–Dm–E|Ascending color followed by dominant
|Am–G–F–Dm–E|Classic descent with expanded ending
|Am–C–Dm–F–E|Ascending cadence with F substitution
|Am–C–Dm–G–E|Ascending sequence with dominant preparation
|Am–G–F–C–Dm–E|Extended descending progression
|Am–F–G–F–E|Repeated predominant motion
|Am–G–F–G–E|Descending line with return to G
|Am–C–G–F–G–E|Mixed ascending and descending contour
|Am–Dm–G–C–F–E|Long functional sequence into E
|Am–F–C–Dm–E|Wide harmonic descent
|Am–C–Dm–C–F–E|Pedal-like return to C
|Am–G–F–G–F–E|Repeated Andalusian descent
|Am–G–F–E–F–E|E turnaround emphasized twice
|Am–C–Dm–E–Dm–E|Ascending cadence with repeated dominant preparation
|Am–F–E–Dm–E|E-centered turnaround
|Am–G–F–E–Dm–E|Descending cadence extended after E
|Am–G–F–E–F–G–E|Descending cycle with turnaround expansion
|Am–C–Dm–E–G–F–E|Ascending opening followed by secondary descent
|Am–F–G–F–Dm–E|Repeated predominant movement
|Am–Dm–F–G–E|Minor opening with rising predominant sequence
|Am–C–G–Dm–F–E|Mixed major/minor Andalusian colors
|Am–G–Dm–C–F–E|Descending bass-like harmonic contour
|Am–F–G–C–Dm–E|Long predominant chain to E
|Am–C–F–G–F–E|Major-color detour before dominant
|Am–G–C–F–Dm–E|Descending opening with expanding harmony
|Am–Dm–C–F–E|Minor predominant sequence
|Am–F–Dm–C–E|Wide descending movement to E
|Am–C–Dm–G–C–F–E|Extended turnaround progression
|Am–G–F–C–G–E|Andalusian opening with dominant preparation
|Am–F–C–G–F–E|Descending harmonic colors
|Am–C–G–Dm–C–E|Mixed-direction progression
|Am–G–F–Dm–C–E|Descending sequence resolving toward E
|Am–C–Dm–F–G–E|Ascending sequence with dominant turnaround
|Am–G–F–Dm–G–E|Descending Andalusian variant
|Am–F–G–Dm–E|Predominant chain ending in E
|Am–Dm–G–F–E|Circle-inspired descent
|Am–C–F–Dm–G–E|Expanded predominant movement
|Am–G–C–Dm–F–E|Descending opening with ascending middle
|Am–F–C–G–Dm–E|Long pre-turnaround sequence
|Am–C–G–F–Dm–E|Major-to-minor descent
|Am–Dm–C–G–F–E|Extended Andalusian descent
|Am–G–F–C–Dm–F–E|Repeated predominant ending
|Am–C–Dm–E–F–G–F–E|Ascending phrase followed by descending turnaround
|Am–G–F–E–G–F–E|E-centered repeated turnaround
|Am–F–G–E–F–Dm–E|Dominant interruption followed by resolution
|Am–Dm–F–E–G–F–E|Repeated descent into E
|Am–C–F–E–Dm–E|Alternating predominant and dominant
|Am–G–F–E–C–Dm–E|Full descent followed by secondary turnaround
|Am–C–Dm–G–F–E–Am|Extended cadence resolving to tonic
|Am–G–F–E–Dm–C–E|Long descending turnaround
|Am–F–G–C–F–Dm–E|Major-key colors surrounding minor tonic
|Am–Dm–G–C–F–E|Circle-of-fifths-like movement ending on E
|Am–C–G–F–Dm–C–E|Broad harmonic descent
|Am–G–F–C–G–F–E|Repeating descending harmonic cells
|Am–F–C–Dm–G–F–E|Extended pre-dominant chain
|Am–G–Dm–F–C–E|Descending minor movement with C before E
|Am–C–Dm–F–C–G–E|Ascending opening with expanded turnaround
|Am–F–Dm–G–C–E|Functional circle-like approach
|Am–G–C–F–G–E|Descending start with dominant preparation
|Am–C–F–G–Dm–E|Major-color expansion into minor dominant preparation
|Am–Dm–C–F–G–E|Descending progression with rising ending
|Am–G–F–E–G–C–E|Full Andalusian descent with extended turnaround
|Am–C–Dm–E–F–G–F–E–Am|Long ascending/descending cycle
|Am–G–F–E–Dm–C–Dm–E|Descending cycle with minor turnaround
|Am–F–G–C–Dm–F–E–Am|Extended cadence resolving to Am
|Am–C–G–F–E–Dm–E|Hybrid descent with repeated E
|Am–G–F–C–Dm–G–F–E|Extended Andalusian-style descent
|Am–C–Dm–F–G–C–F–E|Large ascending harmonic expansion
|Am–G–F–E–C–G–F–E|Repeated turnaround architecture
|Am–F–Dm–C–G–F–E|Long descending predominant movement
|Am–C–Dm–E–F–G–C–F–E|Ascending Andalusian opening with expanded turnaround
Complete Andalusian Cycle|Am–C–Dm–E–F–G–F–E–Dm–C–G–F–E–Am|Full ascending/descending journey with E functioning as the turnaround`;

// Chords of A minor (with the Phrygian-dominant E major) as degrees of the minor tonic
const CHORDS = {
  Am: ['1', 'm', 'i'], C: ['♭3', '', '♭III'], Dm: ['4', 'm', 'iv'],
  E: ['5', '', 'V'], F: ['♭6', '', '♭VI'], G: ['♭7', '', '♭VII'],
};

const COLOURS = [
  ['', { Am: 'Am', C: 'C', Dm: 'Dm', E: 'E', F: 'F', G: 'G' }, 'Original'],
  [' · 7th chords', { Am: 'Am7', C: 'Cmaj7', Dm: 'Dm7', E: 'E7', F: 'Fmaj7', G: 'G7' }, '7th chords'],
  [' · Extended colour', { Am: 'Am(add9)', C: 'Cadd9', Dm: 'Dm(add9)', E: 'E7♭9', F: 'Fmaj7♯11', G: 'G13' }, 'Extended colour'],
];
const QUALITY = {
  Am7: 'm7', Cmaj7: 'maj7', Dm7: 'm7', E7: '7', Fmaj7: 'maj7', G7: '7',
  'Am(add9)': 'm(add9)', Cadd9: 'add9', 'Dm(add9)': 'm(add9)', 'E7♭9': '7♭9', 'Fmaj7♯11': 'maj7♯11', G13: '13',
};

const andalusianCards = [];
COLOURS.forEach(([suffix, voicing, group]) => RAW.split('\n').forEach(line => {
  const [name, rawEx, rawDesc] = line.split('|');
  const base = rawEx.split('–');
  const chords = base;
  const ex = base.map(c => voicing[c]).join('–');
  const desc = rawDesc + (suffix ? ', voiced with ' + group.toLowerCase() : '');
  const roman = chords.map(c => CHORDS[c][2]).join('–');
  andalusianCards.push({
    title: (name || rawEx) + suffix, sub: name ? ex : roman, group,
    rows: [['Example (A minor)', ex], ['Numerals', roman], ['Chords', String(chords.length)]],
    desc: desc + '.',
    allKeysLabel: 'In all 12 minor keys',
    transpose: (r) => ({
      k: r.name + 'm',
      v: chords.map(c => { const [d, q] = CHORDS[c]; return spell(r, parseDeg(d)) + (suffix ? QUALITY[voicing[c]] : q); }).join('–'),
    }),
  });
}));
return { andalusianCards };
});
})(window.TD = window.TD || {});
