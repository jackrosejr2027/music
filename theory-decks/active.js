(function (TD) {
'use strict';
// Which cards are active in games (set on the Settings page, stored on this device).
// Stored per deck as whichever list is shorter: the cards switched off, or the cards left on.
const KEY = 'td-active';
const read = () => {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item && (item.mode === 'off' || item.mode === 'on') && Array.isArray(item.keys)).map(([id, item]) => [id, { mode: item.mode, keys: item.keys.filter(key => typeof key === 'string') }]));
  } catch { return {}; }
};
let state = read();
const sets = {};
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}

// A card's identity survives data reordering; Right Hand paths are the same card on every string set
const cardKey = (deckId, card) => deckId === 'righthand' ? card.title : card.title + '|' + card.sub;

function entry(deckId) {
  if (!sets[deckId]) {
    const e = state[deckId];
    sets[deckId] = e ? { mode: e.mode, keys: new Set(e.keys) } : { mode: 'off', keys: new Set() };
  }
  return sets[deckId];
}
function isActive(deckId, card) {
  const e = entry(deckId);
  const listed = e.keys.has(cardKey(deckId, card));
  return e.mode === 'off' ? !listed : listed;
}
// Switch many cards at once; allCards lets the store flip to the shorter list
function setActive(deckId, cards, on, allCards) {
  const e = entry(deckId);
  cards.forEach(card => {
    const k = cardKey(deckId, card);
    if ((e.mode === 'off') === on) e.keys.delete(k); else e.keys.add(k);
  });
  if (allCards && e.keys.size > allCards.length / 2) {
    const flipped = new Set();
    allCards.forEach(card => { const k = cardKey(deckId, card); if (!e.keys.has(k)) flipped.add(k); });
    e.mode = e.mode === 'off' ? 'on' : 'off';
    e.keys = flipped;
  }
  if (e.mode === 'off' && !e.keys.size) delete state[deckId];
  else state[deckId] = { mode: e.mode, keys: [...e.keys] };
  return save();
}
function resetAll() { state = {}; Object.keys(sets).forEach(k => delete sets[k]); return save(); }
const hasChanges = (deckId) => !!state[deckId];
const filter = (deckId, cards) => hasChanges(deckId) ? cards.filter(card => isActive(deckId, card)) : cards;

// A deck as games see it: only its active cards (computed the first time a game reads them)
function activeDeck(deck) {
  if (!hasChanges(deck.id)) return deck;
  const view = {};
  Object.keys(deck).forEach(k => { if (k !== 'cards') view[k] = deck[k]; }); // copy without building the deck
  let cards = null;
  Object.defineProperty(view, 'cards', { get() { return cards || (cards = filter(deck.id, deck.cards)); }, enumerable: true });
  if (deck.cardsFor) {
    const cache = {};
    view.cardsFor = (n) => cache[n] || (cache[n] = filter(deck.id, deck.cardsFor(n)));
  }
  return view;
}

// Changes made on the Settings page (another tab, or before going Back to a cached page) are picked up here
const listeners = [];
function reload() {
  const next = read();
  if (JSON.stringify(next) === JSON.stringify(state)) return;
  state = next;
  Object.keys(sets).forEach(k => delete sets[k]);
  listeners.forEach(fn => fn());
}
const onChange = (fn) => listeners.push(fn);
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', (event) => { if (event.key === KEY || event.key === null) reload(); });
  window.addEventListener('pageshow', (event) => { if (event.persisted) reload(); });
}

TD['active.js'] = { onChange, cardKey, isActive, setActive, resetAll, hasChanges, filter, activeDeck };
})(window.TD = window.TD || {});
