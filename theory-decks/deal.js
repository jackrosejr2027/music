(function (TD) {
'use strict';
// Shared dealing engine: strong randomness, shuffle bags, random + manual card changes for every game.

// ---------- randomness ----------
// Unbiased integer in [0, n) from the platform's cryptographic generator (falls back to Math.random)
const cryptoObj = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : null;
const buffer = new Uint32Array(64);
let bufferPos = buffer.length;
function random32() {
  if (!cryptoObj) return Math.floor(Math.random() * 4294967296);
  if (bufferPos >= buffer.length) { cryptoObj.getRandomValues(buffer); bufferPos = 0; }
  return buffer[bufferPos++];
}
function randInt(n) {
  if (n <= 1) return 0;
  const limit = 4294967296 - (4294967296 % n); // rejection sampling removes modulo bias
  let x;
  do { x = random32(); } while (x >= limit);
  return x % n;
}

// Shuffle bag: every index 0..size-1 is dealt once (Fisher–Yates order) before any repeats,
// and a refilled bag never starts with the card that ended the previous one.
class Bag {
  constructor(size) { this.size = size; this.order = null; this.pos = 0; this.last = -1; }
  refill() {
    const order = this.size > 65535 ? new Uint32Array(this.size) : new Uint16Array(this.size);
    for (let i = 0; i < this.size; i++) order[i] = i;
    for (let i = this.size - 1; i > 0; i--) { const j = randInt(i + 1); const t = order[i]; order[i] = order[j]; order[j] = t; }
    if (this.size > 1 && order[0] === this.last) { const j = 1 + randInt(this.size - 1); const t = order[0]; order[0] = order[j]; order[j] = t; }
    this.order = order; this.pos = 0;
  }
  next() {
    if (this.size <= 0) return 0;
    if (!this.order || this.pos >= this.size) this.refill();
    // A card picked by hand sets last: never deal that same card straight back (swap in a later one)
    if (this.size > 1 && this.order[this.pos] === this.last && this.pos < this.size - 1) {
      const j = this.pos + 1 + randInt(this.size - this.pos - 1);
      const t = this.order[this.pos]; this.order[this.pos] = this.order[j]; this.order[j] = t;
    }
    this.last = this.order[this.pos++];
    return this.last;
  }
}

// ---------- pools ----------
// A pool is anything a slot can be drawn from: { size, title(i) }.
const deckPool = (deck) => ({ label: deck.name, size: deck.cards.length, title: (i) => deck.cards[i].title + (deck.cards[i].sub && deck.cards[i].sub.length < 28 && deck.cards[i].group ? ' · ' + deck.cards[i].sub : '') });
const rangePool = (size, title) => ({ size, title });

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SELECT_LIMIT = 600; // larger pools get a number box instead of a list

// Manual chooser: ◀ previous · pick any card · next ▶
function chooser(pool, value, onSet, label, key) {
  const row = document.createElement('div');
  row.className = 'pickrow';
  const prev = document.createElement('button');
  prev.type = 'button'; prev.className = 'pickstep'; prev.textContent = '◀';
  prev.setAttribute('aria-label', 'Previous ' + label);
  const next = document.createElement('button');
  next.type = 'button'; next.className = 'pickstep'; next.textContent = '▶';
  next.setAttribute('aria-label', 'Next ' + label);
  prev.onclick = () => onSet((value - 1 + pool.size) % pool.size);
  next.onclick = () => onSet((value + 1) % pool.size);
  let field;
  if (pool.size <= SELECT_LIMIT) {
    field = document.createElement('select');
    field.className = 'pickselect';
    // The option list is built once per pool and reused on every redraw
    if (!pool.optionsHtml) {
      let html = '';
      for (let i = 0; i < pool.size; i++) html += '<option value="' + i + '">' + (i + 1) + '. ' + esc(pool.title(i)) + '</option>';
      pool.optionsHtml = html;
    }
    field.innerHTML = pool.optionsHtml;
    field.value = String(value);
    field.onchange = () => onSet(+field.value);
  } else {
    field = document.createElement('label');
    field.className = 'picknum';
    const input = document.createElement('input');
    input.type = 'number'; input.min = 1; input.max = pool.size; input.value = value + 1;
    input.inputMode = 'numeric';
    const commit = () => { const n = Math.round(+input.value); if (n >= 1 && n <= pool.size) onSet(n - 1); else input.value = value + 1; };
    input.onchange = commit;
    input.onkeydown = (e) => { if (e.key === 'Enter') commit(); };
    const total = document.createElement('span');
    total.textContent = '/ ' + pool.size.toLocaleString('en-US');
    field.append(input, total);
  }
  field.setAttribute('aria-label', 'Choose ' + label);
  field.title = 'Choose ' + label + ' manually';
  prev.dataset.focus = key + ':prev'; next.dataset.focus = key + ':next';
  (field.querySelector('input') || field).dataset.focus = key + ':field';
  row.append(prev, field, next);
  return row;
}

// game = { pools: { name: pool }, initial?: { name: index }, build(sel) => { className, slots: [{ card, index, deck, label, pool?: name }], brief: html } }
function runDeal(root, { cardEl, motif, instruction }, game) {
  const names = Object.keys(game.pools);
  // Every card of a pool switched off in Settings: say so instead of dealing from an empty pile
  const empty = names.filter(name => game.pools[name].size < 1);
  const instructionHtml = instruction ? '<section class="game-instruction" aria-label="How to play"><strong>What to do</strong><p>' + esc(instruction) + '</p></section>' : '';
  if (empty.length) {
    root.innerHTML = instructionHtml + '<div class="brief empty-pool"><div class="line"><b>No active cards for this game</b></div>' +
      '<p>All cards of ' + empty.map(name => esc(game.pools[name].label || name)).join(', ') + ' are switched off. Turn some on in <a href="settings.html">Settings</a>.</p></div>';
    return;
  }
  const bags = {};
  const sel = {};
  let exerciseOctave = false;
  names.forEach(name => { bags[name] = new Bag(game.pools[name].size); sel[name] = bags[name].next(); });
  let fresh = new Set(names);

  const hush = () => { const t = TD['tone.js']; if (t) t.stopAll(); }; // a new deal silences the old cards
  const set = (name, index) => {
    hush();
    sel[name] = index;
    bags[name].last = index;
    fresh = new Set([name]);
    render();
  };

  function render() {
    // Keep keyboard focus on the same control across redraws
    const focused = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.focus : null;
    const { className, slots, brief } = game.build(sel);
    const ignoredAudioDecks = new Set(['keys', 'techniques', 'base0', 'fibonacci']);
    const sounds = slots.map(({ card, deck }) => ({ deck, sound: TD['sound.js'].soundFor(deck.id, card) })).filter(item => item.sound);
    const exerciseSounds = sounds.filter(item => !ignoredAudioDecks.has(item.deck.id));
    const exerciseEvents = (exerciseSounds.length ? exerciseSounds : sounds).flatMap(item => item.sound.events.map(notes => notes.slice()));
    const keyCard = slots.find(slot => slot.deck.id === 'keys')?.card;
    const diagramContext = {
      keyName: keyCard ? (keyCard.tonicName || keyCard.title.split(/[ /]/)[0]) : 'C',
      events: exerciseEvents,
    };
    root.innerHTML = instructionHtml;
    const table = document.createElement('div');
    table.className = className || 'deal';
    let n = 0;
    slots.forEach(({ card, index, deck, label, pool }) => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.style.setProperty('--h', deck.hue);
      const animate = !pool ? fresh.size > 1 : fresh.has(pool);
      if (animate) slot.style.animationDelay = (n++ * 0.12) + 's';
      else slot.style.animation = 'none';
      const labelEl = document.createElement(pool ? 'button' : 'span');
      labelEl.className = 'slotbtn' + (pool ? '' : ' static');
      labelEl.textContent = (pool ? '🔀 ' : '') + label;
      if (pool) {
        labelEl.type = 'button';
        labelEl.dataset.focus = pool + ':random';
        labelEl.title = 'Deal a random ' + label.replace(/^New /, '').toLowerCase();
        labelEl.onclick = () => { set(pool, bags[pool].next()); };
      }
      slot.append(labelEl, cardEl(card, index, deck, motif, diagramContext));
      if (pool && game.pools[pool].size > 1) slot.appendChild(chooser(game.pools[pool], sel[pool], (i) => set(pool, i), label.replace(/^New /, '').toLowerCase(), pool));
      table.appendChild(slot);
    });
    const briefEl = document.createElement('div');
    briefEl.className = 'brief';
    const playback = exerciseEvents.length
      ? '<div class="exercise-playback" role="group" aria-label="Hear this game draw"><span>Hear this draw</span><button type="button" data-play-mode="together">▶ Together</button><button type="button" data-play-mode="arpeggio">▶ Arpeggio</button><button type="button" data-play-octave aria-pressed="' + exerciseOctave + '">+ Octave</button><button type="button" data-export-midi title="Export the drawn notes as an arpeggiated MIDI file">Export draw MIDI</button></div>'
      : '<p class="exercise-playback-unavailable">No playable notes in this draw.</p>';
    briefEl.innerHTML = brief + playback + '<button type="button" class="dealbtn">Deal again</button>';
    briefEl.querySelectorAll('[data-play-mode]').forEach(button => {
      button.onclick = () => {
        const events = exerciseOctave ? TD['sound.js'].withOctave(exerciseEvents) : exerciseEvents;
        TD['tone.js'].playEvents(events, button.dataset.playMode);
      };
    });
    const octaveButton = briefEl.querySelector('[data-play-octave]');
    if (octaveButton) octaveButton.onclick = () => {
      exerciseOctave = !exerciseOctave;
      octaveButton.setAttribute('aria-pressed', String(exerciseOctave));
    };
    const midiButton = briefEl.querySelector('[data-export-midi]');
    if (midiButton) midiButton.onclick = () => {
      const cards = slots.map(({ deck, card }) => deck.name + ' ' + card.title + (card.sub ? ' ' + card.sub : ''));
      if (!TD['game-midi.js'].downloadDraw(exerciseEvents, cards)) midiButton.textContent = 'No playable notes';
    };
    briefEl.querySelector('.dealbtn').onclick = () => {
      hush();
      names.forEach(name => { sel[name] = bags[name].next(); });
      fresh = new Set(names);
      render();
    };
    root.append(table, briefEl);
    briefEl.querySelector('.dealbtn').dataset.focus = 'deal';
    if (focused) { const target = root.querySelector('[data-focus="' + focused + '"]'); if (target) target.focus(); }
  }
  render();
}

TD['deal.js'] = { randInt, Bag, deckPool, rangePool, runDeal, esc };
})(window.TD = window.TD || {});
