(function (TD) {
'use strict';
const { noteToTonic } = TD['theory.js'];
const { stringCards } = TD['data/strings.js'];
const { rightHandTab } = TD['data/righthand.js'];
const { shiftTo, soundFor } = TD['sound.js'];
// Pitches of the original (C-based) card moved to the dealt tonic
const soundIn = (deckId, card, tonic) => {
  const s = soundFor(deckId, { ...card, soundShift: shiftTo(pcOfTonic(tonic), deckId) });
  return s ? s.events : null;
};
const { parseFormula, ascending } = TD['theory.js'];
const { runDeal, deckPool, esc } = TD['deal.js'];
const pcOfTonic = (t) => ([0, 2, 4, 5, 7, 9, 11][t.l] + t.acc + 12) % 12;

const PROGRESSION_DECKS = new Set(['andalusian', 'deceptive', 'majorminor', 'blues']);
const DRAW_LABELS = {
  romannumerals: 'New Roman ID',
  intervals: 'New interval',
  melodicpatterns: 'New pattern',
  triads: 'New triad',
  tetrads: 'New chord',
  scales5: 'New scale',
  scales6: 'New scale',
  scales7: 'New scale',
  modes: 'New mode',
  andalusian: 'New progression',
  deceptive: 'New progression',
  majorminor: 'New progression',
  blues: 'New progression',
};

// Deals are written for major keys (brief says "X major"; minor tonics come from the Relative minor row)
function majorKeyDeck(decks) {
  const deck = decks.find(item => item.id === 'keys');
  return { ...deck, cards: deck.cards.filter(card => card.sub === 'Major key') };
}

// Base 0 card computed directly for the dealt card (no full Base 0 deck build)
function findBase0(decks, sourceDeckId, sourceCardIndex, sourceOverride = null) {
  const { base0CardFor, base0Deck } = TD['decks.js'];
  const source = sourceOverride || decks.find(item => item.id === sourceDeckId);
  // Games see only the active cards; the Base 0 card must point at (and play) the same card in the full deck
  const picked = source.cards[sourceCardIndex];
  const full = (TD['decks.js'].DECKS || []).find(item => item.id === sourceDeckId);
  const fullIndex = full && full !== source && full.cards.indexOf(picked) >= 0 ? full.cards.indexOf(picked) : sourceCardIndex;
  const card = base0CardFor(full || source, picked, fullIndex)
    || { title: 'Base 0', sub: 'N/A', rows: [], desc: 'No Base 0 formula for this card.' };
  return { deck: base0Deck, index: sourceCardIndex, card };
}


// Tonic for a dealt major key (Andalusian subjects use the relative minor)
function dealtTonic(key, subjectId) {
  const relativeRow = key.rows.find(([label]) => label === 'Relative minor');
  const relativeMinor = relativeRow ? relativeRow[1] : null;
  return subjectId === 'andalusian' && relativeMinor
    ? noteToTonic(relativeMinor.split(/[ /]/)[0].replace(/m$/, ''))
    : noteToTonic(key.rows[0][1].split(' ')[0]);
}
const chips = (items) => '<div class="chords">' + items.map(item => '<i>' + esc(item) + '</i>').join('') + '</div>';
const line = (label, value) => '<div class="line"><span>' + esc(label) + '</span><b>' + esc(value) + '</b></div>';

function renderProgressionFamilyGame(root, options, family) {
  const { decks } = options;
  const keyDeck = majorKeyDeck(decks);
  const middleDeck = { id: family.id, name: family.name, hue: family.hue, cards: family.cards };
  const techniqueDeck = decks.find(d => d.id === 'techniques');
  runDeal(root, options, {
    pools: { key: deckPool(keyDeck), middle: deckPool(middleDeck), technique: deckPool(techniqueDeck) },
    build(sel) {
      const key = keyDeck.cards[sel.key];
      const subject = middleDeck.cards[sel.middle];
      const technique = techniqueDeck.cards[sel.technique];
      const tonic = dealtTonic(key, family.minor ? 'andalusian' : 'majorminor');
      const transposed = subject.transpose(tonic);
      const value = typeof transposed === 'object' ? transposed.v : transposed;
      const keyLabel = family.minor ? key.title + ' major · ' + tonic.name + ' minor' : key.title + ' major';
      const baseSource = { ...middleDeck, id: 'majorminor' };
      const base0 = findBase0(decks, 'majorminor', sel.middle, baseSource);
      const subjectCard = {
        ...subject,
        sub: value,
        rows: [['In ' + keyLabel, value], ...subject.rows],
        soundEvents: soundIn('majorminor', subject, tonic),
        soundProgression: true,
        base0: base0.card.sub,
      };
      return {
        className: 'deal',
        slots: [
          { card: key, index: sel.key, deck: keyDeck, label: 'New key', pool: 'key' },
          { card: subjectCard, index: sel.middle, deck: middleDeck, label: 'New progression', pool: 'middle' },
          { card: technique, index: sel.technique, deck: techniqueDeck, label: 'New technique', pool: 'technique' },
          { card: base0.card, index: base0.index, deck: base0.deck, label: 'Base 0' },
        ],
        brief: line('Key', keyLabel) + line('Progression family', family.name) +
          chips(value.split('–')) + line('Technique', technique.title) + line('Base 0', base0.card.sub),
      };
    },
  });
}

function renderDeckDealGame(root, options, middleId) {
  const { decks } = options;
  const keyDeck = majorKeyDeck(decks);
  const middleDeck = decks.find(d => d.id === middleId);
  const techDeck = decks.find(d => d.id === 'techniques');
  const isProgression = PROGRESSION_DECKS.has(middleId);
  runDeal(root, options, {
    pools: { key: deckPool(keyDeck), middle: deckPool(middleDeck), technique: deckPool(techDeck) },
    build(sel) {
      const key = keyDeck.cards[sel.key];
      const subject = middleDeck.cards[sel.middle];
      const technique = techDeck.cards[sel.technique];
      const tonic = dealtTonic(key, middleId);
      const transposed = subject.transpose(tonic);
      const value = typeof transposed === 'object' ? transposed.v : transposed;
      const subjectName = typeof transposed === 'object' && !isProgression ? transposed.k : subject.title;
      const subjectCard = {
        ...subject,
        sub: typeof transposed === 'object' && !isProgression ? transposed.k + ' · ' + value : value,
        rows: [[isProgression && typeof transposed === 'object' ? 'In ' + transposed.k : 'In ' + key.title, value], ...subject.rows],
        soundEvents: soundIn(middleId, subject, tonic),
      };
      const base0 = findBase0(decks, middleId, sel.middle);
      return {
        className: 'deal',
        slots: [
          { card: key, index: sel.key, deck: keyDeck, label: 'New key', pool: 'key' },
          { card: subjectCard, index: sel.middle, deck: middleDeck, label: DRAW_LABELS[middleId] || 'New card', pool: 'middle' },
          { card: technique, index: sel.technique, deck: techDeck, label: 'New technique', pool: 'technique' },
          { card: base0.card, index: base0.index, deck: base0.deck, label: 'Base 0' },
        ],
        brief: line('Key', key.title + ' major') + line(middleDeck.name, subjectName) +
          chips(isProgression ? value.split('–') : value.includes(' · ') ? value.split(' · ') : value.split(' ')) + line('Technique', technique.title) + line('Base 0', base0.card.sub),
      };
    },
  });
}

const PATTERN_SUBJECT_LABELS = {
  romannumerals: 'New Roman ID',
  intervals: 'New interval',
  andalusian: 'New progression',
  deceptive: 'New progression',
  majorminor: 'New progression',
  blues: 'New progression',
  triads: 'New triad',
  tetrads: 'New chord',
  scales5: 'New scale',
  scales6: 'New scale',
  scales7: 'New scale',
  modes: 'New mode',
};


function renderPatternDealGame(root, options, subjectId, { patternGroup = null, withTechnique = false } = {}) {
  const { decks } = options;
  const keyDeck = majorKeyDeck(decks);
  const subjectDeck = decks.find(d => d.id === subjectId);
  const sourcePatternDeck = decks.find(d => d.id === 'melodicpatterns');
  const groupCards = patternGroup ? sourcePatternDeck.cards.filter(card => card.group === patternGroup) : [];
  // An unknown group falls back to the whole deck instead of dealing from an empty pile
  const patternDeck = patternGroup && groupCards.length ? { ...sourcePatternDeck, cards: groupCards } : sourcePatternDeck;
  const techniqueDeck = withTechnique ? decks.find(d => d.id === 'techniques') : null;
  const pools = { key: deckPool(keyDeck), subject: deckPool(subjectDeck), pattern: deckPool(patternDeck) };
  if (techniqueDeck) pools.technique = deckPool(techniqueDeck);
  runDeal(root, options, {
    pools,
    build(sel) {
      const key = keyDeck.cards[sel.key];
      const subject = subjectDeck.cards[sel.subject];
      const pattern = patternDeck.cards[sel.pattern];
      const technique = techniqueDeck ? techniqueDeck.cards[sel.technique] : null;
      const tonic = dealtTonic(key, subjectId);
      const t = subject.transpose(tonic);
      const subjectValue = typeof t === 'object' ? t.k + ' · ' + t.v : t;
      const patternNotes = pattern.transpose(tonic);
      const subjectCard = {
        ...subject, sub: subjectValue,
        rows: [['In ' + key.title, subjectValue], ...subject.rows],
        soundEvents: soundIn(subjectId, subject, tonic),
      };
      const patternCard = {
        ...pattern, sub: patternNotes,
        rows: [['In ' + key.title, patternNotes], ...pattern.rows],
        soundEvents: soundIn('melodicpatterns', pattern, tonic),
      };
      const base0 = findBase0(decks, subjectId, sel.subject);
      const slots = [
        { card: key, index: sel.key, deck: keyDeck, label: 'New key', pool: 'key' },
        { card: subjectCard, index: sel.subject, deck: subjectDeck, label: PATTERN_SUBJECT_LABELS[subjectId] || 'New card', pool: 'subject' },
        { card: patternCard, index: sel.pattern, deck: patternDeck, label: patternGroup && groupCards.length ? 'New ' + patternGroup.toLowerCase() : 'New melodic pattern', pool: 'pattern' },
      ];
      if (technique) slots.push({ card: technique, index: sel.technique, deck: techniqueDeck, label: 'New technique', pool: 'technique' });
      slots.push({ card: base0.card, index: base0.index, deck: base0.deck, label: 'Base 0' });
      return {
        className: technique ? 'deal five' : 'deal',
        slots,
        brief: line('Key', key.title + ' major') + line(subjectDeck.name, subject.title) + line('Melodic pattern', pattern.title) +
          chips(patternNotes.split(' ')) + (technique ? line('Technique', technique.title) : '') + line('Base 0', base0.card.sub),
      };
    },
  });
}

function renderScaleCombinationGame(root, options) {
  const { decks } = options;
  const keyDeck = majorKeyDeck(decks);
  const allModes = decks.find(deck => deck.id === 'modes');
  // The seven modes themselves (by group, so switching cards off in Settings cannot shift the list)
  const sevenModes = allModes.cards.filter(card => card.group === 'The 7 Modes');
  const modeDeck = { ...allModes, cards: sevenModes };
  const patternDeck = decks.find(deck => deck.id === 'melodic7base0');
  const base0Deck = decks.find(deck => deck.id === 'base0');
  runDeal(root, options, {
    pools: { key: deckPool(keyDeck), mode: deckPool(modeDeck), pattern: deckPool(patternDeck) },
    build(sel) {
      const key = keyDeck.cards[sel.key];
      const mode = modeDeck.cards[sel.mode];
      const pattern = patternDeck.cards[sel.pattern];
      const tonic = noteToTonic(key.rows[0][1].split(' ')[0]);
      const modeNotes = mode.transpose(tonic);
      const scaleNotes = modeNotes.split(' ');
      // Position 7 is the octave of position 0 (marked ↑)
      const noteAt = (p) => p < scaleNotes.length ? scaleNotes[p] : scaleNotes[p - scaleNotes.length] + '↑';
      const patternNotes = pattern.sub.split('').map(p => noteAt(+p)).join(' ');
      const modeSemis = ascending(parseFormula(mode.sub));
      const shift = shiftTo(pcOfTonic(tonic), 'modes');
      const positionMidi = (p) => 60 + shift + (p >= modeSemis.length ? modeSemis[p - modeSemis.length] + 12 : modeSemis[p]);
      const modeCard = {
        ...mode,
        soundEvents: [modeSemis.map(s => 60 + shift + s)],
        sub: modeNotes,
        rows: [['In ' + key.title + ' major', modeNotes], ...mode.rows],
      };
      const patternCard = {
        ...pattern,
        rows: [['Base 0 positions', pattern.sub], ['Notes in ' + key.title, patternNotes], ...pattern.rows],
        soundEvents: [pattern.sub.split('').map(p => positionMidi(+p))],
      };
      const base0Card = {
        title: 'Base 0 · ' + pattern.title,
        sub: pattern.sub,
        rows: [['Base root', 'Scale position 0'], ['Pattern positions', pattern.sub], ['Scale', mode.title]],
        desc: 'Scale positions measured from position 0, independent of key.',
      };
      return {
        className: 'deal',
        slots: [
          { card: key, index: sel.key, deck: keyDeck, label: 'New key', pool: 'key' },
          { card: modeCard, index: sel.mode, deck: modeDeck, label: 'New mode', pool: 'mode' },
          { card: patternCard, index: sel.pattern, deck: patternDeck, label: 'New pattern', pool: 'pattern' },
          { card: base0Card, index: sel.pattern, deck: base0Deck, label: 'Base 0' },
        ],
        brief: line('Key', key.title + ' major') + line('Mode', mode.title) + line('Base 0 pattern', pattern.sub) + chips(patternNotes.split(' ')),
      };
    },
  });
}

function renderLeftHandPracticeGame(root, options) {
  const { decks, stringCount = 6 } = options;
  const handDeck = decks.find(deck => deck.id === 'lefthand');
  const sourceStringDeck = decks.find(deck => deck.id === 'strings');
  const stringDeck = { ...sourceStringDeck, cards: TD['active.js'] ? TD['active.js'].filter('strings', stringCards(stringCount)) : stringCards(stringCount) };
  runDeal(root, options, {
    pools: { hand: deckPool(handDeck), string: deckPool(stringDeck) },
    build(sel) {
      const hand = handDeck.cards[sel.hand];
      const string = stringDeck.cards[sel.string];
      const base0 = findBase0(decks, 'lefthand', sel.hand);
      return {
        className: 'deal three',
        slots: [
          { card: hand, index: sel.hand, deck: handDeck, label: 'New configuration', pool: 'hand' },
          { card: string, index: sel.string, deck: stringDeck, label: 'New string', pool: 'string' },
          { card: base0.card, index: base0.index, deck: base0.deck, label: 'Base 0' },
        ],
        brief: line('Configuration', hand.title) + line('String', string.title + ' · ' + string.rows[0][1]) +
          chips(hand.title.split('-')) + line('Base 0', base0.card.sub),
      };
    },
  });
}

function renderRightHandPracticeGame(root, options) {
  const { decks, stringCount = 6 } = options;
  const keyDeck = majorKeyDeck(decks);
  const sourcePatternDeck = decks.find(deck => deck.id === 'righthand');
  const patternDeck = { ...sourcePatternDeck, cards: sourcePatternDeck.cardsFor(stringCount) };
  const techniqueDeck = decks.find(deck => deck.id === 'techniques');
  runDeal(root, options, {
    pools: { key: deckPool(keyDeck), pattern: deckPool(patternDeck), technique: deckPool(techniqueDeck) },
    build(sel) {
      const key = keyDeck.cards[sel.key];
      const pattern = patternDeck.cards[sel.pattern];
      const technique = techniqueDeck.cards[sel.technique];
      const notes = pattern.rows.find(([label]) => label === 'Open notes')[1];
      return {
        className: 'deal three',
        slots: [
          { card: key, index: sel.key, deck: keyDeck, label: 'New key', pool: 'key' },
          { card: pattern, index: sel.pattern, deck: patternDeck, label: 'New pattern', pool: 'pattern' },
          { card: technique, index: sel.technique, deck: techniqueDeck, label: 'New technique', pool: 'technique' },
        ],
        brief: line('Key', key.title + ' major') + line('Right hand pattern', pattern.title) +
          '<pre class="picking-tab">' + esc(rightHandTab(pattern.title, stringCount)) + '</pre>' +
          line('Open notes', notes) + line('Technique', technique.title),
      };
    },
  });
}
TD['game.js'] = { renderProgressionFamilyGame, renderDeckDealGame, renderPatternDealGame, renderScaleCombinationGame, renderLeftHandPracticeGame, renderRightHandPracticeGame };
})(window.TD = window.TD || {});
