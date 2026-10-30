(function (TD) {
'use strict';
TD.lazy('data/righthand.js', () => {
const { stringCards } = TD['data/strings.js'];

const OPEN_NOTES = stringCards(8).map(card => card.rows[0][1]);

// Lightweight card: only the sequence is stored; display fields are derived on demand.
// (String sets of 7–8 strings contain over 100,000 paths, so eager objects were slow.)
class RightHandCard {
  constructor(title, stringSet) { this.title = title; this.stringSet = stringSet; }
  get sub() { return this.title.length + ' notes · ' + this.stringSet + '-string'; }
  get group() { return this.title.length + '-note paths'; }
  get desc() { return 'Ordered right-hand picking path across distinct strings.'; }
  get rows() {
    return [
      ['String sequence', this.title],
      ['Open notes', Array.from(this.title, s => OPEN_NOTES[s - 1]).join(' ')],
      ['String set', this.stringSet + ' strings'],
      ['Pattern length', String(this.title.length)],
    ];
  }
}

const cache = new Map();
// Every ordered path of 2..n distinct strings drawn from strings 1..n (high string numbers first)
function rightHandCardsFor(stringSet) {
  if (cache.has(stringSet)) return cache.get(stringSet);
  const cards = [];
  const available = Array.from({ length: stringSet }, (_, i) => String(stringSet - i));
  const used = new Array(stringSet + 1).fill(false);
  for (let length = 2; length <= stringSet; length++) {
    const walk = (path) => {
      if (path.length === length) { cards.push(new RightHandCard(path, stringSet)); return; }
      for (const s of available) {
        if (used[s]) continue;
        used[s] = true;
        walk(path + s);
        used[s] = false;
      }
    };
    walk('');
  }
  cache.set(stringSet, cards);
  return cards;
}

// Count without building: sum of n!/(n-k)! for k = 2..n
function rightHandCount(stringSet) {
  let total = 0;
  for (let k = 2; k <= stringSet; k++) { let p = 1; for (let i = 0; i < k; i++) p *= stringSet - i; total += p; }
  return total;
}

function rightHandTab(sequence, stringCount = 8) {
  const positions = Array.from(sequence, Number);
  const width = Math.max(11, positions.length * 2 + 5);
  return Array.from({ length: stringCount }, (_, index) => {
    const string = index + 1;
    const marks = Array(width).fill('-');
    positions.forEach((pickedString, step) => {
      if (pickedString === string) marks[step * 2 + 1] = 'x';
    });
    return string + '|' + marks.join('') + '|';
  }).join(String.fromCharCode(10));
}
return { rightHandCardsFor, rightHandCount, rightHandTab };
});
})(window.TD = window.TD || {});
