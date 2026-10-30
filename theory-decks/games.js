(function (TD) {
'use strict';
const { FIB_GAMES } = TD['fibonacci.js'];
const { FIB_COMBO_GAMES } = TD['fibcombos.js'];
const { PROGRESSION_GAMES } = TD['progressiongames.js'];
const { renderDeckDealGame, renderPatternDealGame, renderScaleCombinationGame, renderLeftHandPracticeGame, renderRightHandPracticeGame } = TD['game.js'];

const TECHNIQUE_GAMES = [
  ['intervals', 'Deal: Key · Interval · Technique', 32],
  ['triads', 'Deal: Key · Triad · Technique', 52],
  ['tetrads', 'Deal: Key · Chord · 4 Tone · Technique', 140],
  ['scales5', 'Deal: Key · Scale · 5 Tone · Technique', 180],
  ['scales6', 'Deal: Key · Scale · 6 Tone · Technique', 210],
  ['scales7', 'Deal: Key · Scale · 7 Tone · Technique', 250],
  ['modes', 'Deal: Key · Ionian & Modes · Technique', 285],
  ['melodicpatterns', 'Deal: Key · Melodic Pattern · Technique', 315],
  ['andalusian', 'Deal: Key · Andalusian · Technique', 15],
  ['deceptive', 'Deal: Key · Deceptive · Technique', 300],
  ['majorminor', 'Deal: Key · Major / Minor · Technique', 75],
  ['blues', 'Deal: Key · Blues · Technique', 225],
  ['romannumerals', 'Deal: Key · Roman Numeral ID · Technique', 5],
].map(([deckId, name, hue]) => ({
  id: 'technique-' + deckId,
  name,
  hue,
  meta: { kind: 'technique', subjectId: deckId },
  game: (root, options) => renderDeckDealGame(root, options, deckId),
}));

const PATTERN_GAMES = [
  ['triads', 'Deal: Key · Triad · Melodic Pattern', 52],
  ['tetrads', 'Deal: Key · Chord · 4 Tone · Melodic Pattern', 140],
  ['scales5', 'Deal: Key · Scale · 5 Tone · Melodic Pattern', 180],
  ['scales6', 'Deal: Key · Scale · 6 Tone · Melodic Pattern', 210],
  ['scales7', 'Deal: Key · Scale · 7 Tone · Melodic Pattern', 250],
  ['modes', 'Deal: Key · Ionian & Modes · Melodic Pattern', 285],
  ['romannumerals', 'Deal: Key · Roman Numeral ID · Melodic Pattern', 5],
].map(([deckId, name, hue]) => ({
  id: 'pattern-' + deckId,
  name,
  hue,
  meta: { kind: 'pattern', subjectId: deckId },
  game: (root, options) => renderPatternDealGame(root, options, deckId),
}));

const EXTRA_PATTERN_GAMES = [
  ['intervals', null, false, 'Deal: Key · Interval · Melodic Pattern', 32],
  ['andalusian', null, false, 'Deal: Key · Andalusian · Melodic Pattern', 15],
  ['deceptive', null, false, 'Deal: Key · Deceptive · Melodic Pattern', 300],
  ['majorminor', null, false, 'Deal: Key · Major / Minor · Melodic Pattern', 75],
  ['blues', null, false, 'Deal: Key · Blues · Melodic Pattern', 225],
  ['triads', 'Arpeggios', true, 'Deal: Key · Triad Arpeggios · Technique', 52],
  ['tetrads', 'Arpeggios', true, 'Deal: Key · 4-Tone Arpeggios · Technique', 140],
  ['scales5', 'Pentatonic Lines', true, 'Deal: Key · 5-Tone Pentatonics · Technique', 180],
  ['scales7', 'Linear', true, 'Deal: Key · 7-Tone Linear Patterns · Technique', 250],
  ['modes', 'Sequences', true, 'Deal: Key · Modes & Sequences · Technique', 285],
  ['scales6', 'Interval Leaps', true, 'Deal: Key · 6-Tone Interval Leaps · Technique', 210],
  ['triads', 'Motifs', true, 'Deal: Key · Triad Motifs · Technique', 52],
  ['tetrads', 'Chromatic Color', true, 'Deal: Key · 4-Tone Chromatic Patterns · Technique', 140],
  ['modes', 'Contour Studies', true, 'Deal: Key · Modal Contours · Technique', 285],
  ['scales7', 'Longer Lines', true, 'Deal: Key · 7-Tone Longer Lines · Technique', 250],
  ['scales5', 'Sequence Variations', true, 'Deal: Key · 5-Tone Sequence Variations · Technique', 180],
  ['andalusian', 'Pentatonic Lines', true, 'Deal: Key · Andalusian Pentatonics · Technique', 15],
  ['blues', 'Pentatonic Lines', true, 'Deal: Key · Blues Pentatonics · Technique', 225],
  ['deceptive', 'Motifs', true, 'Deal: Key · Deceptive Motifs · Technique', 300],
  ['majorminor', 'Contour Studies', true, 'Deal: Key · Major / Minor Contours · Technique', 75],
  ['intervals', 'Interval Leaps', true, 'Deal: Key · Interval Leaps · Technique', 32],
  ['scales6', 'Sequences', true, 'Deal: Key · 6-Tone Sequences · Technique', 210],
  ['scales7', 'Arpeggios', true, 'Deal: Key · 7-Tone Arpeggios · Technique', 250],
  ['modes', 'Linear', true, 'Deal: Key · Modal Linear Runs · Technique', 285],
  ['modes', 'Pentatonic Lines', true, 'Deal: Key · Modal Pentatonics · Technique', 285],
  ['scales5', 'Motifs', true, 'Deal: Key · 5-Tone Motifs · Technique', 180],
  ['blues', 'Chromatic Color', true, 'Deal: Key · Blues Chromatic Color · Technique', 225],
  ['andalusian', 'Sequences', true, 'Deal: Key · Andalusian Sequences · Technique', 15],
  ['deceptive', 'Longer Lines', true, 'Deal: Key · Deceptive Longer Lines · Technique', 300],
  ['majorminor', 'Arpeggios', true, 'Deal: Key · Major / Minor Arpeggios · Technique', 75],
  ['tetrads', 'Sequence Variations', true, 'Deal: Key · 4-Tone Sequence Variations · Technique', 140],
  ['triads', 'Contour Studies', true, 'Deal: Key · Triad Contours · Technique', 52],
  ['romannumerals', 'Arpeggios', true, 'Deal: Key · Roman Numeral Arpeggios · Technique', 5],
  ['intervals', 'Motifs', true, 'Deal: Key · Interval Motifs · Technique', 32],
  ['scales6', 'Contour Studies', true, 'Deal: Key · 6-Tone Contours · Technique', 210],
  ['blues', 'Sequence Variations', true, 'Deal: Key · Blues Sequence Variations · Technique', 225],
  ['modes', 'Chromatic Color', true, 'Deal: Key · Modal Chromatic Color · Technique', 285],
  ['scales7', 'Interval Leaps', true, 'Deal: Key · 7-Tone Interval Leaps · Technique', 250],
].map(([subjectId, patternGroup, withTechnique, name, hue], index) => ({
  id: 'extra-pattern-' + (index + 1),
  name,
  hue,
  meta: { kind: 'pattern', subjectId, patternGroup, withTechnique },
  game: (root, options) => renderPatternDealGame(root, options, subjectId, { patternGroup, withTechnique }),
}));

const PROGRESSION_SUBJECTS = new Set(['andalusian', 'deceptive', 'majorminor', 'blues']);

function beginnerInstruction(game) {
  const { kind, subjectId, withTechnique, method } = game.meta || {};
  if (kind === 'technique') {
    if (PROGRESSION_SUBJECTS.has(subjectId)) return 'Use the key card to play the chords on the progression card in order. Strum each chord once, then repeat the same chords using the technique card.';
    if (subjectId === 'intervals') return 'Use the key and interval cards to find two notes. Play the notes one at a time, then repeat them using the technique card.';
    if (subjectId === 'romannumerals') return 'The key card tells you which group of notes to use. The Roman numeral card points to one note in that group. Find it on your guitar, play it, then try the technique card.';
    if (subjectId === 'triads' || subjectId === 'tetrads') return 'Use the key card and chord card to find the chord notes. Play the notes one at a time, then strum them together. Try the technique card too.';
    if (subjectId === 'melodicpatterns') return 'Play the notes shown on the pattern card, one at a time. Use the key card to find them, then repeat using the technique card.';
    return 'Use the key card to find the notes on the scale or mode card. Play them one at a time from low to high, then high to low. Repeat using the technique card.';
  }
  if (kind === 'pattern') {
    return 'Use the key card to find the notes on the second card. Follow the number pattern on the third card and play the notes one at a time. ' + (withTechnique ? 'Then try the same exercise using the technique card.' : 'Start slowly and keep an even beat.');
  }
  if (kind === 'modecombo') return 'The Base 0 card is a numbered path through the scale: 0 means the first note, 1 means the next note, and so on. Find the notes using the key and mode cards, then play the path in order.';
  if (kind === 'lefthand') return 'Choose a fret on the string shown. Put your index, middle, ring, and pinky fingers on four neighboring frets. Pick the notes in the order shown on the card; go slowly.';
  if (kind === 'righthand') return 'Each number in the tab tells you which string to pick. First pick those strings without pressing any frets. Then use the key card to find notes and pick them in the same string order.';
  if (kind === 'fib') return 'Read the chord names on the progression card from left to right. Make each chord shape and strum it once, then repeat the sequence.' + (game.meta.spec.rhythm ? ' Hold each chord for the number of beats shown.' : '');
  if (kind === 'fibcombo') return 'Use the key and mode cards to find the notes, then play the notes on the pattern card from left to right.' + (method[0] === 'rhythm' ? ' Hold each note for the number of beats shown.' : ' Start slowly and pick one note at a time.');
  if (kind === 'progression-family') return 'Read the chord names on the progression card from left to right. Make each chord shape and strum it once, then repeat using the technique card.';
  return 'Use the cards to find the notes, then play them slowly in the order shown.';
}

const GAMES = [...TECHNIQUE_GAMES, ...PATTERN_GAMES, ...EXTRA_PATTERN_GAMES, {
  id: 'pattern-mode-combinations',
  meta: { kind: 'modecombo' },
  name: 'Deal: Key · Major Scale & Modes · 7-Tone Base 0 Pattern',
  hue: 285,
  game: (root, options) => renderScaleCombinationGame(root, options),
}, {
  id: 'left-hand-practice',
  meta: { kind: 'lefthand' },
  name: 'Left Hand Practice Game',
  hue: 115,
  game: (root, options) => renderLeftHandPracticeGame(root, options),
}, {
  id: 'right-hand-practice',
  meta: { kind: 'righthand' },
  name: 'Right Hand Practice Game',
  hue: 205,
  game: (root, options) => renderRightHandPracticeGame(root, options),
}, ...FIB_GAMES, ...FIB_COMBO_GAMES, ...PROGRESSION_GAMES].map(game => ({ ...game, name: game.name.replace(/^Deal: /, ''), instruction: beginnerInstruction(game) }));
TD['games.js'] = { GAMES };
})(window.TD = window.TD || {});
