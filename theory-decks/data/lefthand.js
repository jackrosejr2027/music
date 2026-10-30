(function (TD) {
'use strict';
TD.lazy('data/lefthand.js', () => {
function makeCards() {
  const cards = [];
  const sequence = [];
  const used = [0, 0, 0, 0];

  function addSequences(targetLength) {
    if (sequence.length === targetLength) {
      const fingers = sequence.join('-');
      const first = sequence[0];
      const relative = sequence.map(finger => {
        const offset = finger - first;
        return offset > 0 ? '+' + offset : String(offset);
      }).join(' ');
      cards.push({
        title: fingers,
        sub: targetLength + (targetLength === 1 ? ' finger' : ' fingers'),
        rows: [
          ['Finger sequence', fingers],
          ['Length', String(targetLength)],
          ['Finger counts', [1, 2, 3, 4].map(finger => finger + '×' + used[finger - 1]).join('  ')],
        ],
        desc: 'Ordered left-hand finger configuration. Each finger appears no more than twice.',
        base0: relative,
      });
      return;
    }

    for (let finger = 1; finger <= 4; finger++) {
      if (used[finger - 1] === 2) continue;
      sequence.push(finger);
      used[finger - 1]++;
      addSequences(targetLength);
      used[finger - 1]--;
      sequence.pop();
    }
  }

  for (let length = 1; length <= 8; length++) addSequences(length);
  return cards;
}

let leftHandCache = null;
const leftHandCards = () => leftHandCache || (leftHandCache = makeCards());
return { leftHandCards };
});
})(window.TD = window.TD || {});
