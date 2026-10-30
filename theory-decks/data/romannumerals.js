(function (TD) {
'use strict';
TD.lazy('data/romannumerals.js', () => {
const { C, accStr, parseDeg, spell } = TD['theory.js'];
const { intervalCards } = TD['data/intervals.js'];

const DIATONIC_IDS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

const ASCENDING = intervalCards.filter(card => card.group === 'Ascending');
const romanNumeralCards = ASCENDING.map((interval) => {
  const degreeText = interval.rows.find(([label]) => label === 'Degree')[1].replace('𝄫', '♭♭');
  const degree = parseDeg(degreeText);
  const scaleDegree = (degree.n - 1) % 7;
  // Chromatic roots: flat roots are borrowed major chords (♭III, ♭VI…); sharp roots are diminished leading chords (♯iv°)
  const base = DIATONIC_IDS[scaleDegree].replace('°', '');
  const roman = degree.acc < 0 ? accStr(degree.acc) + base.toUpperCase()
    : degree.acc > 0 ? accStr(degree.acc) + base.toLowerCase() + '°'
    : DIATONIC_IDS[scaleDegree];
  return {
    title: interval.title,
    sub: interval.sub,
    group: 'Major key',
    rows: [
      ['Interval', interval.rows.find(([label]) => label === 'Degree')[1]],
      ['Root in C', spell(C, degree)],
      ['Roman ID in major', roman],
    ],
    desc: interval.desc + ' The Roman ID uses the diatonic triad quality of the corresponding major-scale degree.',
    allKeysLabel: interval.title + ' chord-root Roman ID in all 12 keys',
    transpose: (root) => ({ k: root.name, v: spell(root, degree) + ' · ' + roman }),
  };
});
const MINOR_IDS = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
const MINOR_NAT = [0, 2, 3, 5, 7, 8, 10];
const NAT = [0, 2, 4, 5, 7, 9, 11];
ASCENDING.forEach((interval) => {
  const degreeText = interval.rows.find(([label]) => label === 'Degree')[1];
  const degree = parseDeg(degreeText.replace('𝄫', '♭♭'));
  const n = (degree.n - 1) % 7;
  const acc = NAT[n] + degree.acc - MINOR_NAT[n];
  // Same rule as the major key: lowered roots are borrowed major chords, raised roots are diminished leading chords
  const minorBase = MINOR_IDS[n].replace('°', '');
  const roman = acc < 0 ? accStr(acc) + minorBase.toUpperCase()
    : acc > 0 ? accStr(acc) + minorBase.toLowerCase() + '°'
    : MINOR_IDS[n];
  romanNumeralCards.push({
    title: interval.title + ' · Minor',
    sub: interval.sub,
    group: 'Minor key',
    rows: [['Interval', degreeText], ['Root in C', spell(C, degree)], ['Roman ID in minor', roman]],
    desc: interval.desc + ' The Roman ID is measured against the natural minor scale and its diatonic triads; lowered roots are borrowed major chords (♭II), raised roots diminished leading chords (♯vii°).',
    allKeysLabel: interval.title + ' chord-root minor Roman ID in all 12 keys',
    transpose: (root) => ({ k: root.name + 'm', v: spell(root, degree) + ' · ' + roman }),
  });
});
return { romanNumeralCards };
});
})(window.TD = window.TD || {});
