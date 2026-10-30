(function (TD) {
'use strict';
TD.lazy('data/strings.js', () => {
const { noteToTonic, pcOf, DEGREE_OF_PC } = TD['theory.js'];

// Standard tuning, string 1 = thinnest
const STD = [
  ['E4', 329.63, 'Thinnest string — melodies, lead lines and the top note of most chords.'],
  ['B3', 246.94, 'The odd one out: tuned a major 3rd (4 frets) above G, not a 4th. Shifts every shape that crosses it.'],
  ['G3', 196.00, 'Middle of the neck\'s range. A favourite for bends and triad voicings on strings 2–4.'],
  ['D3', 146.83, 'Root string for D-shape chords and the top of most power-chord voicings.'],
  ['A2', 110.00, 'Root string for A-shape (5th-string) barre chords and power chords.'],
  ['E2', 82.41, 'Lowest string on a standard guitar. Root for E-shape barre chords and riffs.'],
  ['B1', 61.74, 'Low B on 7-string guitars — a 4th below the low E. Extended-range metal and jazz.'],
  ['F♯1', 46.25, 'Low F♯ on 8-string guitars — a 4th below B. Djent and extended-range playing.'],
];

function stringCards(count) {
  return STD.slice(0, count).map(([note, hz, desc], i) => ({
    title: 'String ' + (i + 1), sub: note.replace(/\d/, '') + ' string',
    rows: [['Open note', note], ['Frequency', hz.toFixed(2) + ' Hz'], ['Tuning', count + '-string standard']],
    desc,
    allKeysLabel: 'Open ' + note.replace(/\d/, '') + ' as a degree of each key',
    transpose: (r) => { const t = noteToTonic(note); return DEGREE_OF_PC[(pcOf(t.l, t.acc) - r.pc + 12) % 12]; },
  }));
}
return { stringCards };
});
})(window.TD = window.TD || {});
