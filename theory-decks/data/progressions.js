(function (TD) {
'use strict';
TD.lazy('data/progressions.js', () => {
const { spell, accStr, LETTERS } = TD['theory.js'];

const NAT = [0, 2, 4, 5, 7, 9, 11];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function parseChord(s) {
  const m = s.trim().match(/^([A-G])([♭♯#]*)(.*)$/);
  let acc = 0;
  for (const c of m[2]) acc += c === '♭' ? -1 : 1;
  const l = LETTERS.indexOf(m[1]);
  return { l, acc, pc: (NAT[l] + acc + 12) % 12, q: m[3] };
}

function parseRoman(tok) {
  const m = tok.trim().match(/^([♭♯#]*)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)/);
  if (!m) return { n: 1, acc: 0, minor: false };
  let acc = 0;
  for (const c of m[1]) acc += c === '♭' ? -1 : 1;
  return { n: ROMAN.indexOf(m[2].toUpperCase()) + 1, acc, minor: m[2] === 'i' };
}

// raw lines: "title|example|description"
const SEVENTHS = { '': 'maj7', 'm': 'm7', '°': 'ø7', 'dim': 'ø7', '7': '9', 'm7': 'm9', 'maj7': 'maj9', '6': '6/9', 'm6': 'm6/9', '+': '+7', 'sus4': '7sus4', 'sus2': '9sus4' };
const ADD9 = { '': 'add9', 'm': 'm(add9)', '7': '13', 'm7': 'm11', 'maj7': 'maj7♯11', 'sus4': 'sus2', '6': '6/9', 'm6': 'm6/9' };

// Same progression with richer chord colours; returns null if nothing changes
function recolor(line, map, label, dominantSeventh) {
  const [title, ex, desc] = line.split('|').map(s => s.trim());
  let changed = false;
  const chords = ex.split('–').map(chord => {
    const m = chord.match(/^([A-G][♭♯#]*)(.*)$/);
    let q = map[m[2]];
    if (q === undefined) return chord;
    if (dominantSeventh && m[2] === '' && dominantSeventh(m[1])) q = '7';
    changed = true;
    return m[1] + q;
  });
  return changed ? title + ' · ' + label + '|' + chords.join('–') + '|' + desc + ', voiced with ' + label.toLowerCase() : null;
}


function progressionCards(raw) {
  const firstLines = raw.trim().split('\n');
  const lines = [], sevenths = [], colours = [];
  firstLines.forEach(line => {
    const [title, ex] = line.split('|').map(s => s.trim());
    const chords = ex.split('–').map(parseChord);
    const first = parseRoman(title.split('–')[0]);
    const tpc = (chords[0].pc - (NAT[first.n - 1] + first.acc) + 24) % 12;
    const isDominant = (name) => parseChord(name).pc === (tpc + 7) % 12;
    lines.push(line);
    const a = recolor(line, SEVENTHS, '7th chords', isDominant);
    const b = recolor(line, ADD9, 'Extended colour', null);
    if (a) sevenths.push(a);
    if (b) colours.push(b);
  });
  const cards = [...lines, ...sevenths, ...colours].map(line => {
    const [title, ex, desc] = line.split('|').map(s => s.trim());
    const chords = ex.split('–').map(parseChord);
    const first = parseRoman(title.split('–')[0]);
    // tonic = first chord root moved down by the first numeral's degree
    const tl = (chords[0].l - (first.n - 1) + 7) % 7;
    const tpc = (chords[0].pc - (NAT[first.n - 1] + first.acc) + 24) % 12;
    const tonic = { l: tl, acc: ((tpc - NAT[tl] + 18) % 12) - 6 };
    const degs = chords.map(c => {
      const n = (c.l - tl + 7) % 7 + 1;
      const acc = ((c.pc - tpc - NAT[n - 1] + 30) % 12) - 6;
      return { n, acc, q: c.q };
    });
    const keyName = LETTERS[tl] + accStr(tonic.acc) + (first.minor ? ' minor' : ' major');
    return {
      title, sub: ex,
      rows: [['Example', ex], ['Key', keyName], ['Chords', String(chords.length)]],
      desc: desc + '.',
      allKeysLabel: 'In all 12 ' + (first.minor ? 'minor' : 'major') + ' keys',
      transpose: (r) => ({
        k: r.name + (first.minor ? 'm' : ''),
        v: degs.map(d => spell(r, d) + d.q).join('–'),
      }),
    };
  });
  cards.forEach(card => { card.group = / · 7th chords$/.test(card.title) ? '7th chords' : / · Extended colour$/.test(card.title) ? 'Extended colour' : 'Original'; });
  return cards;
}
return { progressionCards, recolor, SEVENTHS, ADD9 };
});
})(window.TD = window.TD || {});
