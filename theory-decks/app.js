(function (TD) {
'use strict';
const { DECKS, stringCards, base0CardFor } = TD['decks.js'];
const { rightHandTab } = TD['data/righthand.js'];
const { ROOTS, noteToTonic, pcOf } = TD['theory.js'];
const { THEMES, applyTheme } = TD['themes.js'];
const { STYLES, motifSvg } = TD['cardstyles.js'];
const { GAMES } = TD['games.js'];
const { playFreq, playEvents, stopAll } = TD['tone.js'];
const { soundFor, withOctave } = TD['sound.js'];
const { activeDeck, isActive, hasChanges, onChange: onActiveChange } = TD['active.js'];

const themeSel = document.getElementById('theme');
const styleSel = document.getElementById('cardstyle');
THEMES.forEach(([n], i) => themeSel.add(new Option(n, i)));
STYLES.forEach(([n], i) => styleSel.add(new Option('Style: ' + n, i)));
// Storage can be unavailable (private mode, some file:// setups) — never let that break the app
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
};
// Ignore stored choices that no longer exist (e.g. after the theme list changed)
const storedIndex = (key, list, fallback) => { const v = +store.get(key); return Number.isInteger(v) && v >= 0 && v < list.length && store.get(key) !== null ? v : fallback; };
themeSel.value = storedIndex('td-theme', THEMES, Math.min(2, THEMES.length - 1));
styleSel.value = storedIndex('td-style', STYLES, Math.min(1, STYLES.length - 1));
applyTheme(+themeSel.value);
themeSel.onchange = () => { applyTheme(+themeSel.value); store.set('td-theme', themeSel.value); };
styleSel.onchange = () => { store.set('td-style', styleSel.value); render(); };

// "+ Octave" play option, shared by every card and remembered between visits
let octaveOn = store.get('td-octave') === '1';
function setOctave(on) {
  octaveOn = on;
  store.set('td-octave', on ? '1' : '0');
  document.querySelectorAll('.octbtn').forEach(btn => btn.setAttribute('aria-pressed', String(on)));
}

const cardDeckSel = document.getElementById('card-deck');
const gameDeckSel = document.getElementById('game-deck');
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const strSel = document.getElementById('strings');
const favoriteStatus = document.getElementById('favorite-status');
const FAVORITES_KEY = 'st_favorites_v1';
let current = DECKS[0];
let cardObserver = null;
function readFavoriteItems() {
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(value) ? value.filter(item => item && typeof item.type === 'string' && typeof item.id === 'string' && typeof item.title === 'string') : [];
  } catch { return []; }
}
let favoriteItems = readFavoriteItems();
function favoriteRecord(card, deck) {
  const deckId = String(deck.id || 'deck');
  const isGame = !!current.game;
  return {
    type: 'theory-deck-card',
    id: deckId + '|' + TD['active.js'].cardKey(deckId, card),
    title: deck.name + ' · ' + card.title,
    href: isGame ? 'theory-decks/play.html#game=' + encodeURIComponent(current.id) : 'theory-decks/play.html#' + encodeURIComponent(deckId),
    data: {
      deckId, deckName: deck.name, prompt: card.title, subtitle: String(card.sub || ''),
      answer: String(card.desc || ''), rows: Array.isArray(card.rows) ? card.rows.map(row => [String(row[0] || ''), String(row[1] || '')]) : []
    }
  };
}
function syncFavoriteButton(button) {
  const record = button._favoriteRecord;
  if (!record) return;
  const saved = favoriteItems.some(item => item.type === record.type && item.id === record.id);
  button.textContent = saved ? '★' : '☆';
  button.setAttribute('aria-pressed', String(saved));
  button.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + record.title + (saved ? ' from Favorites' : ' to Favorites'));
  button.title = button.getAttribute('aria-label');
}
function updateVisibleFavorites() {
  favoriteItems = readFavoriteItems();
  document.querySelectorAll('.theory-card-favorite').forEach(syncFavoriteButton);
}
window.addEventListener('storage', event => { if (event.key === FAVORITES_KEY || event.key === null) updateVisibleFavorites(); });
window.addEventListener('pageshow', updateVisibleFavorites);
window.addEventListener('st:favoriteschange', updateVisibleFavorites);
window.addEventListener('td:favoriteschange', updateVisibleFavorites);

DECKS.forEach(deck => cardDeckSel.add(new Option(deck.name, deck.id)));


GAMES.forEach(game => gameDeckSel.add(new Option(game.name, game.id)));
// "Choose deck" / "Choose game" open the contents: every deck, then every game, all linked
const CONTENTS = { id: 'contents', name: 'All decks & games', hue: 8, contents: true };
cardDeckSel.onchange = () => {
  select(DECKS.find(item => item.id === cardDeckSel.value) || CONTENTS);
};
gameDeckSel.onchange = () => {
  select(GAMES.find(item => item.id === gameDeckSel.value) || CONTENTS);
};
const GAME_GROUPS = [
  ['Technique deals', g => g.id.startsWith('technique-')],
  ['Melodic pattern deals', g => g.id.startsWith('pattern-')],
  ['Focused pattern deals', g => g.id.startsWith('extra-pattern-')],
  ['Fibonacci progressions', g => g.id.startsWith('fib-')],
  ['Fibonacci · Major modes', g => g.id.startsWith('fibc-major-')],
  ['Fibonacci · Pentatonic modes', g => g.id.startsWith('fibc-penta-')],
  ['Fibonacci · Hirajoshi modes', g => g.id.startsWith('fibc-hirajoshi-')],
  ['Hand practice', g => g.id === 'left-hand-practice' || g.id === 'right-hand-practice'],
  ['Common chord progressions', g => g.id.startsWith('progression-family-')],
];
function renderContents() {
  const link = (href, text) => '<li><a href="' + href + '">' + esc(text) + '</a></li>';
  const grouped = new Set();
  let html = '<nav class="contents" aria-label="All decks and games"><h2>Decks · ' + DECKS.length + '</h2><ul class="contents-decks">' +
    DECKS.map(d => link('#' + d.id, d.name)).join('') + '</ul><h2>Games · ' + GAMES.length + '</h2>';
  GAME_GROUPS.forEach(([label, test]) => {
    const games = GAMES.filter(test);
    if (!games.length) return;
    games.forEach(g => grouped.add(g));
    html += '<h3>' + esc(label) + ' · ' + games.length + '</h3><ul class="contents-games">' + games.map(g => link('#game=' + g.id, g.name)).join('') + '</ul>';
  });
  const rest = GAMES.filter(g => !grouped.has(g));
  if (rest.length) html += '<h3>More games · ' + rest.length + '</h3><ul class="contents-games">' + rest.map(g => link('#game=' + g.id, g.name)).join('') + '</ul>';
  grid.innerHTML = html + '</nav>';
  count.textContent = '';
}

// The String deck always follows the selector, even when it is changed from another deck or game
const stringDeck = DECKS.find(d => d.strings);
const storedStrings = store.get('td-strings');
if (storedStrings && [...strSel.options].some(o => o.value === storedStrings)) {
  strSel.value = storedStrings;
  stringDeck.cards = stringCards(+strSel.value);
}
strSel.onchange = () => {
  store.set('td-strings', strSel.value);
  stringDeck.cards = stringCards(+strSel.value);
  render();
};

function select(d) {
  stopAll(); // a sound from the previous deck or game should not keep playing
  current = d;
  // Remember the view and expose it as a link (play.html#modes, play.html#game=fib-major-triads)
  const view = (d.game ? 'game=' : '') + d.id;
  store.set('td-view', view);
  try { history.replaceState(null, '', '#' + view); } catch { /* some file:// setups refuse */ }
  cardDeckSel.value = d.game || d.contents ? '' : d.id;
  gameDeckSel.value = d.game ? d.id : '';
  strSel.hidden = !(d.strings || d.id === 'righthand' || d.id === 'right-hand-practice' || d.id === 'left-hand-practice');
  render();
  grid.scrollTop = 0;
}

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function base0FrontValue(card, index, deck) {
  if (deck.id !== 'keys' && card.base0 && deck.id !== 'lefthand') return card.base0;
  if (deck.id === 'base0' || deck.id === 'melodic7base0') return card.sub;
  const sourceDeck = DECKS.find(item => item.id === deck.id);
  if (sourceDeck) {
    const linked = base0CardFor(sourceDeck, card, index);
    if (linked) return linked.sub;
  }
  if (deck.id === 'keys') return card.base0 || '0-2-4-5-7-9-11';
  if (deck.id === 'strings') {
    const tonic = noteToTonic(card.rows[0][1]);
    return String(pcOf(tonic.l, tonic.acc));
  }
  if (deck.id === 'righthand') {
    const sequence = Array.from(card.title, Number);
    const first = sequence[0];
    return sequence.map(string => {
      const offset = string - first;
      return offset > 0 ? '+' + offset : String(offset);
    }).join(' ');
  }
  return 'N/A';
}

const DIAGRAM_KEYS = [['C',0],['C♯ / D♭',1],['D',2],['D♯ / E♭',3],['E',4],['F',5],['F♯ / G♭',6],['G',7],['G♯ / A♭',8],['A',9],['A♯ / B♭',10],['B',11]];
const DIAGRAM_INSTRUMENTS = {
  guitar: { label: 'Guitar', tunings: {
    standard: { label: 'Standard', notes: [64,59,55,50,45,40] },
    half: { label: 'Half step down', notes: [63,58,54,49,44,39] },
    whole: { label: 'Whole step down', notes: [62,57,53,48,43,38] },
    dropD: { label: 'Drop D', notes: [64,59,55,50,45,38] },
    openG: { label: 'Open G', notes: [62,59,55,50,43,38] }
  }},
  bass: { label: 'Bass', tunings: {
    standard: { label: 'Standard', notes: [43,38,33,28] },
    half: { label: 'Half step down', notes: [42,37,32,27] },
    whole: { label: 'Whole step down', notes: [41,36,31,26] },
    dropD: { label: 'Drop D', notes: [43,38,33,26] }
  }},
  ukulele: { label: 'Ukulele', tunings: {
    highG: { label: 'High G (standard)', notes: [69,64,60,67] },
    lowG: { label: 'Low G', notes: [69,64,60,55] },
    half: { label: 'Half step down', notes: [68,63,59,66] }
  }}
};
const DIAGRAM_NOTES = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
function diagramRootName(card, deck, context) {
  if (context && context.keyName) return context.keyName;
  if (deck.id === 'keys') return card.tonicName || card.title;
  const row = (card.rows || []).find(([label]) => label === 'Key' || String(label).startsWith('In '));
  if (row) {
    const source = String(row[0]).startsWith('In ') ? String(row[0]).slice(3) : String(row[1]);
    return source.match(/[A-G](?:[♯♭#])?/)?.[0] || 'C';
  }
  return 'C';
}
function makeCardFretboard(card, deck, context) {
  const panel = document.createElement('div');
  panel.className = 'card-fretboard';
  panel.addEventListener('click', event => event.stopPropagation());
  panel.addEventListener('keydown', event => event.stopPropagation());

  const heading = document.createElement('strong');
  heading.className = 'card-fretboard-title';
  heading.textContent = 'Fretboard';
  const controls = document.createElement('div');
  controls.className = 'card-fretboard-controls';
  const makeSelect = (label) => {
    const wrap = document.createElement('label');
    wrap.appendChild(document.createTextNode(label));
    const select = document.createElement('select');
    select.setAttribute('aria-label', label);
    select.title = label;
    wrap.appendChild(select);
    controls.appendChild(wrap);
    return select;
  };
  const keySelect = makeSelect('Diagram key');
  DIAGRAM_KEYS.forEach(([name, pc]) => keySelect.add(new Option(name, pc)));
  const instrumentSelect = makeSelect('Instrument');
  Object.entries(DIAGRAM_INSTRUMENTS).forEach(([id, instrument]) => instrumentSelect.add(new Option(instrument.label, id)));
  const tuningSelect = makeSelect('Tuning');
  const board = document.createElement('div');
  board.className = 'card-fretboard-board';
  const caption = document.createElement('span');
  caption.className = 'card-fretboard-caption';
  panel.append(heading, controls, board, caption);

  const sourceSound = soundFor(deck.id, card);
  let sourceNotes = sourceSound ? sourceSound.events.flat() : [];
  if (!sourceNotes.length && context && context.events) sourceNotes = context.events.flat();
  const rootName = diagramRootName(card, deck, context);
  const root = noteToTonic(rootName.replace(/#/g, '♯'));
  const sourcePc = ((pcOf(root.l, root.acc) % 12) + 12) % 12;
  const referenceOnly = !sourceNotes.length;
  if (referenceOnly) sourceNotes = [0,2,4,5,7,9,11].map(semitone => 60 + sourcePc + semitone);
  keySelect.value = String(sourcePc);
  instrumentSelect.value = 'guitar';

  function fillTunings(preferred) {
    const tunings = DIAGRAM_INSTRUMENTS[instrumentSelect.value].tunings;
    tuningSelect.innerHTML = '';
    Object.entries(tunings).forEach(([id, tuning]) => tuningSelect.add(new Option(tuning.label, id)));
    tuningSelect.value = tunings[preferred] ? preferred : Object.keys(tunings)[0];
  }
  function draw() {
    const selectedPc = +keySelect.value;
    const transposition = selectedPc - sourcePc;
    const pitchClasses = new Set(sourceNotes.map(note => ((note + transposition) % 12 + 12) % 12));
    const rootPc = selectedPc;
    const instrument = DIAGRAM_INSTRUMENTS[instrumentSelect.value];
    const tuning = instrument.tunings[tuningSelect.value];
    const strings = tuning.notes;
    const frets = 12, left = 44, top = 24, fretWidth = 29, stringGap = 20;
    const width = left + fretWidth * (frets + 1) + 12;
    const height = top + stringGap * (strings.length - 1) + 25;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', instrument.label + ' fretboard in ' + tuning.label + ' tuning');
    for (let fret = 0; fret <= frets; fret++) {
      const line = document.createElementNS(svg.namespaceURI, 'line');
      const x = left + fret * fretWidth;
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      line.setAttribute('y1', top); line.setAttribute('y2', top + stringGap * (strings.length - 1));
      line.setAttribute('class', fret === 0 ? 'board-nut' : 'board-fret');
      svg.appendChild(line);
      if (fret > 0) {
        const label = document.createElementNS(svg.namespaceURI, 'text');
        label.setAttribute('x', left + (fret - .5) * fretWidth); label.setAttribute('y', height - 3);
        label.setAttribute('text-anchor', 'middle'); label.textContent = fret;
        svg.appendChild(label);
      }
    }
    strings.forEach((openMidi, stringIndex) => {
      const y = top + stringIndex * stringGap;
      const string = document.createElementNS(svg.namespaceURI, 'line');
      string.setAttribute('x1', left); string.setAttribute('x2', left + frets * fretWidth);
      string.setAttribute('y1', y); string.setAttribute('y2', y); string.setAttribute('class', 'board-string');
      svg.appendChild(string);
      const openLabel = document.createElementNS(svg.namespaceURI, 'text');
      openLabel.setAttribute('x', 2); openLabel.setAttribute('y', y + 3); openLabel.textContent = DIAGRAM_NOTES[openMidi % 12];
      svg.appendChild(openLabel);
      for (let fret = 0; fret <= frets; fret++) {
        const midi = openMidi + fret, pc = midi % 12;
        if (!pitchClasses.has(pc)) continue;
        const x = fret === 0 ? left - 12 : left + (fret - .5) * fretWidth;
        const group = document.createElementNS(svg.namespaceURI, 'g');
        group.setAttribute('class', 'fret-note' + (pc === rootPc ? ' fret-root' : ''));
        group.setAttribute('tabindex', '0'); group.setAttribute('role', 'button');
        group.setAttribute('aria-label', DIAGRAM_NOTES[pc] + ', string ' + (stringIndex + 1) + ', fret ' + fret);
        group.dataset.midi = midi;
        const dot = document.createElementNS(svg.namespaceURI, 'circle');
        dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 8);
        const noteLabel = document.createElementNS(svg.namespaceURI, 'text');
        noteLabel.setAttribute('x', x); noteLabel.setAttribute('y', y + 3); noteLabel.setAttribute('text-anchor', 'middle');
        noteLabel.textContent = DIAGRAM_NOTES[pc];
        group.append(dot, noteLabel); svg.appendChild(group);
      }
    });
    board.replaceChildren(svg);
    caption.textContent = referenceOnly ? 'No pitch data on this card; showing the selected key scale.' : card.title + ' · ' + pitchClasses.size + ' pitch classes';
  }
  fillTunings('standard');
  keySelect.onchange = draw;
  tuningSelect.onchange = draw;
  instrumentSelect.onchange = () => { fillTunings(tuningSelect.value); draw(); };
  board.addEventListener('click', event => {
    const note = event.target.closest('.fret-note');
    if (note) playFreq(440 * Math.pow(2, (+note.dataset.midi - 69) / 12), 1.1);
  });
  board.addEventListener('keydown', event => {
    const note = event.target.closest('.fret-note');
    if (note && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); playFreq(440 * Math.pow(2, (+note.dataset.midi - 69) / 12), 1.1);
    }
  });
  draw();
  return panel;
}

let activeCardZoom = null;
function closeCardZoom() {
  if (!activeCardZoom) return;
  const state = activeCardZoom;
  activeCardZoom = null;
  state.card.classList.remove('zoomed-card');
  state.card.style.width = state.width;
  state.card.style.flex = state.flex;
  if (state.placeholder.parentNode) state.placeholder.replaceWith(state.card);
  state.overlay.remove();
  document.body.style.overflow = state.overflow;
  window.removeEventListener('keydown', state.onKeyDown, true);
  if (state.focus && state.focus.isConnected && typeof state.focus.focus === 'function') state.focus.focus();
}
function openCardZoom(card) {
  if (activeCardZoom && activeCardZoom.card === card) return;
  if (activeCardZoom) closeCardZoom();
  const placeholder = document.createComment('card zoom restore point');
  const parent = card.parentNode;
  if (!parent) return;
  const title = card.querySelector('.front h3')?.textContent || card.getAttribute('aria-label') || 'Card';
  parent.insertBefore(placeholder, card);
  const overlay = document.createElement('div');
  overlay.className = 'card-zoom-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Enlarged card: ' + title);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'card-zoom-close';
  close.setAttribute('aria-label', 'Close enlarged card');
  close.textContent = 'Close';
  const focus = document.activeElement;
  const state = {
    card, placeholder, overlay, focus,
    width: card.style.width,
    flex: card.style.flex,
    overflow: document.body.style.overflow,
    onKeyDown: null,
  };
  state.onKeyDown = event => { if (event.key === 'Escape') closeCardZoom(); };
  activeCardZoom = state;
  card.classList.add('zoomed-card');
  card.style.width = 'min(86vw, 460px)';
  card.style.flex = 'none';
  overlay.appendChild(close);
  overlay.appendChild(card);
  overlay.addEventListener('click', event => { if (event.target === overlay) closeCardZoom(); });
  overlay.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...overlay.querySelectorAll('button:not([disabled]), select:not([disabled]), [tabindex="0"]')]
      .filter(item => item.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  close.addEventListener('click', event => { event.stopPropagation(); closeCardZoom(); });
  window.addEventListener('keydown', state.onKeyDown, true);
  document.body.style.overflow = 'hidden';
  document.body.appendChild(overlay);
  close.focus();
}

function cardEl(c, i, d, motif, diagramContext) {
  const sound = soundFor(d.id, c);
  const keyCard = d.id === 'keys';
  const controls = keyCard
    ? '<div class="key-controls">' +
      (sound ? '<button type="button" class="playbtn" data-mode="together" title="Play all notes at once">▶ Together</button>' +
        '<button type="button" class="playbtn" data-mode="arpeggio" title="Play each note individually">▶ Arpeggio</button>' +
        '<button type="button" class="octbtn" aria-pressed="' + octaveOn + '" title="Include the octave of the first note when playing (all cards)">+ Octave</button>' : '') +
      (c.freq ? '<button type="button" class="tonebtn" aria-label="Play ' + esc(c.tonicName) + '4 at ' + c.freq.toFixed(2) + ' Hz" title="' + c.freq.toFixed(2) + ' Hz">▶ ' + esc(c.tonicName) + '4</button>' : '') +
      '</div>'
    : (sound ? '<div class="playrow">' +
      '<button type="button" class="playbtn" data-mode="together" title="Play all notes at once' + (sound.progression ? ', chord by chord' : '') + '">▶ ' + (sound.progression ? 'Chords' : 'Together') + '</button>' +
      '<button type="button" class="playbtn" data-mode="arpeggio" title="Play each note individually">▶ Arpeggio</button>' +
      '<button type="button" class="octbtn" aria-pressed="' + octaveOn + '" title="Include the octave of the first note when playing (all cards)">+ Octave</button>' +
      '</div>' : '') +
      (c.freq ? '<button type="button" class="tonebtn" aria-label="Play ' + esc(c.tonicName) + '4">▶ ' + esc(c.tonicName) + '4 · ' + c.freq.toFixed(2) + ' Hz</button>' : '');
  const el = document.createElement('div');
  el.className = keyCard ? 'card key-deck-card' : 'card';
  // Cards switched off in Settings stay browsable but are marked, since games will not deal them
  if (!current.game && hasChanges(d.id) && !isActive(d.id, c)) { el.classList.add('inactive'); el.title = 'Switched off in Settings — not dealt in games'; }
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', c.title + ' — tap to flip; right-click to enlarge');
  el.title = el.classList.contains('inactive')
    ? 'Switched off in Settings — not dealt in games · click to flip · right-click to enlarge'
    : 'Click to flip · right-click to enlarge';
  el.addEventListener('contextmenu', event => {
    event.preventDefault();
    openCardZoom(el);
  });
  el.innerHTML =
    '<div class="inner">' +
      '<div class="face front">' +
        '<div class="pip tl">' + motif + '<b>' + (i + 1) + '</b></div>' +
        '<div class="pip br">' + motif + '<b>' + (i + 1) + '</b></div>' +
        '<div class="deckname">' + esc(d.name) + '</div>' +
        '<div class="fc">' +
        '<h3' + (c.title.length <= 7 ? ' class="big"' : '') + '>' + esc(c.title) + '</h3>' +
        '<div class="sub' + (String(c.sub).length > 40 ? ' long' : '') + '">' + esc(c.sub) + '</div>' +
        '<div class="base0front"><b>' + esc(base0FrontValue(c, i, d)) + '</b></div>' +
        '</div>' +
        controls +
        '<button type="button" class="theory-card-favorite" aria-pressed="false">☆</button>' +
      '</div>' +
      '<div class="face back">' +
        '<div class="details">' +
          '<h4>' + esc(c.title) + '</h4>' +
          '<dl>' + c.rows.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>').join('') + '</dl>' +
          (c.stringSet ? '<pre class="picking-tab">' + esc(rightHandTab(c.title, c.stringSet)) + '</pre>' : '') +
          '<p>' + esc(c.desc) + '</p>' +
        '</div>' +
        (c.transpose ? '<div class="allkeys"></div>' : '') +
        '<div class="card-diagram-slot"></div>' +
      '</div>' +
    '</div>';
  const favoriteButton = el.querySelector('.theory-card-favorite');
  favoriteButton._favoriteRecord = favoriteRecord(c, d);
  favoriteButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const record = favoriteButton._favoriteRecord;
    try {
      const items = readFavoriteItems();
      const index = items.findIndex(item => item.type === record.type && item.id === record.id);
      if (index >= 0) items.splice(index, 1);
      else {
        if (items.length >= 5000) throw new Error('Favorites reached the 5,000-item limit. Remove one before saving this card.');
        if (JSON.stringify(record).length > 131072) throw new Error('This card is too large to save.');
        items.push(Object.assign({}, record, { updated: Date.now() }));
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
      favoriteItems = items;
      if (favoriteStatus) favoriteStatus.textContent = index >= 0 ? 'Card removed from Favorites.' : 'Card saved to Favorites.';
      window.dispatchEvent(new CustomEvent('st:favoriteschange'));
      syncFavoriteButton(favoriteButton);
    } catch (error) {
      if (favoriteStatus) favoriteStatus.textContent = error.message || 'Could not save this card. Check browser storage.';
    }
  });
  syncFavoriteButton(favoriteButton);
  const toneBtn = el.querySelector('.tonebtn');
  const octBtn = el.querySelector('.octbtn');
  if (octBtn) octBtn.onclick = (event) => { event.stopPropagation(); setOctave(!octaveOn); };
  if (toneBtn) toneBtn.onclick = (event) => { event.stopPropagation(); playFreq(c.freq); };
  el.querySelectorAll('.playbtn').forEach(btn => {
    btn.onclick = (event) => { event.stopPropagation(); playEvents(octaveOn ? withOctave(sound.events) : sound.events, btn.dataset.mode); };
  });
  // Keys pressed on a button inside the card must not also flip it
  el.querySelectorAll('button').forEach(btn => { btn.onkeydown = (event) => event.stopPropagation(); });
  el.onkeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); el.onclick(); }
  };
  let state = 0;
  el.onclick = () => {
    state = (state + 1) % 4;
    if (state === 2 && c.transpose) {
      const box = el.querySelector('.allkeys');
      if (!box.innerHTML) box.innerHTML = keysHtml(c);
    }
    if (state === 3) {
      const slot = el.querySelector('.card-diagram-slot');
      if (!slot.firstChild) slot.appendChild(makeCardFretboard(c, d, diagramContext));
    }
    el.classList.toggle('flip', state > 0);
    el.classList.toggle('keys', state === 2 && !!c.transpose);
    el.classList.toggle('diagram', state === 3);
  };
  return el;
}

function keysHtml(c) {
  return '<h4>' + esc(c.allKeysLabel || c.title + ' in all 12 keys') + '</h4><dl>' + ROOTS.map(r => {
    const t = c.transpose(r);
    const k = typeof t === 'object' ? t.k : r.name;
    const v = typeof t === 'object' ? t.v : t;
    return '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>';
  }).join('') + '</dl>';
}

function render() {
  const d = current;
  if (cardObserver) cardObserver.disconnect();
  cardObserver = null;
  document.body.style.setProperty('--h', d.hue);
  grid.innerHTML = '';
  const si = +styleSel.value;
  const motif = motifSvg(si);
  grid.dataset.frame = STYLES[si][1];
  if (d.contents) { grid.onscroll = null; renderContents(); return; }
  if (d.game) {
    count.textContent = '';
    grid.onscroll = null;
    d.game(grid, { decks: DECKS.map(activeDeck), cardEl, motif, stringCount: +strSel.value, instruction: d.instruction });
    return;
  }
  const cards = d.id === 'righthand' ? d.cardsFor(+strSel.value) : d.cards;
  if (cards.length > 300) {
    let cursor = 0;
    let group = null, wrap = null;
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    const appendBatch = () => {
      const end = Math.min(cursor + 100, cards.length);
      for (; cursor < end; cursor++) {
        const c = cards[cursor];
        if (!wrap || c.group !== group) {
          group = c.group;
          if (group) {
            const heading = document.createElement('h2');
            heading.textContent = group;
            grid.appendChild(heading);
          }
          wrap = document.createElement('div');
          wrap.className = 'cards';
          grid.appendChild(wrap);
        }
        wrap.appendChild(cardEl(c, cursor, d, motif));
      }
      grid.appendChild(sentinel);
      if (cursor >= cards.length && cardObserver) { cardObserver.disconnect(); return; }
      // On a very tall or wide screen one batch may not reach the bottom, and the observer only reports changes:
      // keep filling until the sentinel is out of view
      const mine = cardObserver;
      requestAnimationFrame(() => {
        if (cardObserver !== mine || cursor >= cards.length || !sentinel.isConnected) return;
        const box = grid.getBoundingClientRect(), at = sentinel.getBoundingClientRect();
        if (at.top < Math.min(box.bottom, innerHeight) + 400) appendBatch();
      });
    };
    if ('IntersectionObserver' in window) {
      cardObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) appendBatch();
      }, { root: grid, rootMargin: '400px' });
    } else {
      // Older browsers: load more while scrolling near the bottom
      cardObserver = { disconnect() { grid.onscroll = null; }, observe() {} };
      grid.onscroll = () => { if (grid.scrollTop + grid.clientHeight > grid.scrollHeight - 800) appendBatch(); };
    }
    appendBatch();
    cardObserver.observe(sentinel);
    count.textContent = cards.length.toLocaleString('en-US') + ' cards';
    return;
  }
  let group = null, wrap = null;
  cards.forEach((c, i) => {
    if (!wrap || c.group !== group) {
      group = c.group;
      if (group) {
        const h = document.createElement('h2');
        h.textContent = group;
        grid.appendChild(h);
      }
      wrap = document.createElement('div');
      wrap.className = 'cards';
      grid.appendChild(wrap);
    }
    wrap.appendChild(cardEl(c, i, d, motif));
  });
  count.textContent = cards.length.toLocaleString('en-US') + (cards.length === 1 ? ' card' : ' cards');
}

// Open the linked or last-used deck/game (falls back to the first deck)
function viewFrom(text) {
  let v = String(text || '').replace(/^#/, '');
  try { v = decodeURIComponent(v); } catch { /* a malformed link (stray %) must not stop the page */ }
  if (v === 'contents') return CONTENTS;
  if (v.startsWith('game=')) return GAMES.find(g => g.id === v.slice(5));
  return DECKS.find(d => d.id === v);
}
// New Settings choices redraw the open game or deck
onActiveChange(() => { if (!current.contents) render(); });
select(viewFrom(location.hash) || viewFrom(store.get('td-view')) || DECKS[0]);
// Look & sound changed on the Settings page (another tab, or before coming Back to a cached page)
function syncPrefs() {
  const theme = String(storedIndex('td-theme', THEMES, Math.min(2, THEMES.length - 1)));
  const style = String(storedIndex('td-style', STYLES, Math.min(1, STYLES.length - 1)));
  if (theme !== themeSel.value) { themeSel.value = theme; applyTheme(+theme); }
  if ((store.get('td-octave') === '1') !== octaveOn) { octaveOn = !octaveOn; document.querySelectorAll('.octbtn').forEach(btn => btn.setAttribute('aria-pressed', String(octaveOn))); }
  const strings = store.get('td-strings');
  const redraw = style !== styleSel.value || (strings && strings !== strSel.value && [...strSel.options].some(o => o.value === strings));
  styleSel.value = style;
  if (strings && [...strSel.options].some(o => o.value === strings) && strings !== strSel.value) { strSel.value = strings; stringDeck.cards = stringCards(+strings); }
  if (redraw) render();
}
window.addEventListener('storage', (e) => { if (e.key === null || /^td-(theme|style|octave|strings)$/.test(e.key)) syncPrefs(); });
window.addEventListener('pageshow', (e) => { if (e.persisted) syncPrefs(); });
window.addEventListener('hashchange', () => { const d = viewFrom(location.hash); if (d && d !== current) select(d); });
})(window.TD = window.TD || {});
