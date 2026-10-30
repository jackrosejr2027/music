(function (TD) {
'use strict';
// Settings: tick which cards games may deal. Unticked cards stay browsable on the Play page.
const { DECKS, stringCards } = TD['decks.js'];
const { isActive, setActive, resetAll, hasChanges, onChange } = TD['active.js'];
// Changes made in another tab (or before coming Back) redraw every deck's ticks and counts
const resyncs = [];
onChange(() => resyncs.forEach(fn => fn()));

const root = document.getElementById('settings');
const storageStatus = document.getElementById('settings-status');
const showSaveState = (saved) => { if (storageStatus) { storageStatus.hidden = saved; storageStatus.textContent = saved ? '' : 'Changes apply for this visit, but this browser could not save them.'; } };
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const CHUNK = 200;
const d0 = (deck) => !!deck.strings;
// Base 0 cards are derived from their source card, so they follow it instead of having their own switches
const EDITABLE = DECKS.filter(d => d.id !== 'base0');
// The 8-string sets contain every path and every string, so one list covers all string counts
const cardsOf = (d) => d.id === 'righthand' ? d.cardsFor(8) : d.strings ? stringCards(8) : d.cards;

function deckEntry(deck) {
  const box = document.createElement('details');
  box.className = 'reference-entry game-doc settings-deck';
  box.innerHTML = '<summary><h3>' + esc(deck.name) + '</h3><p class="settings-status"></p></summary>';
  const status = box.querySelector('.settings-status');
  const showStatus = (cards) => {
    if (!cards) { status.textContent = hasChanges(deck.id) ? 'Custom selection' : 'All cards active'; return; }
    const on = cards.filter(c => isActive(deck.id, c)).length;
    status.textContent = on === cards.length ? 'All ' + fmt(on) + ' cards active' : fmt(on) + ' of ' + fmt(cards.length) + ' cards active' + (on ? '' : ' — games using this deck cannot deal');
  };
  showStatus(null);
  let built = false;
  let syncOpen = null;
  resyncs.push(() => { if (syncOpen) syncOpen(); else showStatus(null); });
  box.addEventListener('toggle', () => {
    if (!box.open || built) return;
    built = true;
    const cards = cardsOf(deck);
    const groups = [];
    const byName = new Map();
    cards.forEach(card => {
      const name = card.group || 'All cards';
      if (!byName.has(name)) { const g = { name, cards: [] }; byName.set(name, g); groups.push(g); }
      byName.get(name).cards.push(card);
    });
    const body = document.createElement('div');
    body.className = 'settings-body';
    body.innerHTML = '<div class="settings-tools"><button type="button" data-all="1">All on</button><button type="button" data-all="0">All off</button>' +
      (deck.id === 'righthand' ? '<span>Paths apply to every string set that contains them.</span>' : d0(deck) ? '<span>Strings apply to every string count that has them.</span>' : deck.id === 'keys' ? '<span>Games deal major keys; the other keys are for study and browsing.</span>' : '') + '</div>';
    groups.forEach((g, gi) => {
      const sec = document.createElement('section');
      sec.className = 'settings-group';
      sec.innerHTML = '<label class="settings-grouphead"><input type="checkbox" data-group="' + gi + '"> <b>' + esc(g.name) + '</b> <span>' + fmt(g.cards.length) + '</span></label><div class="settings-cards"></div>';
      const list = sec.querySelector('.settings-cards');
      let shown = 0;
      const more = document.createElement('button');
      more.type = 'button'; more.className = 'settings-more';
      const showMore = () => {
        const end = Math.min(shown + CHUNK, g.cards.length);
        let html = '';
        for (let i = shown; i < end; i++) {
          const c = g.cards[i];
          html += '<label><input type="checkbox" data-g="' + gi + '" data-i="' + i + '"' + (isActive(deck.id, c) ? ' checked' : '') + '> ' + esc(c.title) + (c.sub && deck.id !== 'righthand' ? ' <small>' + esc(c.sub) + '</small>' : '') + '</label>';
        }
        list.insertAdjacentHTML('beforeend', html);
        shown = end;
        more.hidden = shown >= g.cards.length;
        more.textContent = 'Show ' + fmt(Math.min(CHUNK, g.cards.length - shown)) + ' more of ' + fmt(g.cards.length - shown);
      };
      more.onclick = showMore;
      showMore();
      sec.appendChild(more);
      body.appendChild(sec);
    });
    const syncGroups = () => {
      body.querySelectorAll('input[data-group]').forEach(input => {
        const g = groups[+input.dataset.group];
        const on = g.cards.filter(c => isActive(deck.id, c)).length;
        input.checked = on === g.cards.length;
        input.indeterminate = on > 0 && on < g.cards.length;
      });
      body.querySelectorAll('input[data-i]').forEach(input => { input.checked = isActive(deck.id, groups[+input.dataset.g].cards[+input.dataset.i]); });
      showStatus(cards);
    };
    body.addEventListener('change', (event) => {
      const input = event.target;
      let saved = true;
      if (input.dataset.group !== undefined) saved = setActive(deck.id, groups[+input.dataset.group].cards, input.checked, cards);
      else if (input.dataset.i !== undefined) saved = setActive(deck.id, [groups[+input.dataset.g].cards[+input.dataset.i]], input.checked, cards);
      syncGroups();
      showSaveState(saved);
    });
    body.querySelector('.settings-tools').addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-all]');
      if (!btn) return;
      const saved = setActive(deck.id, cards, btn.dataset.all === '1', cards);
      syncGroups();
      showSaveState(saved);
    });
    box.appendChild(body);
    syncGroups();
    syncOpen = syncGroups;
  });
  return box;
}

const list = document.createElement('div');
list.className = 'doc-list settings-list';
EDITABLE.forEach(deck => list.appendChild(deckEntry(deck)));
const reset = document.getElementById('reset-all');
// Two-step confirm on the button itself (confirm() dialogs are blocked in some embedded views)
let armed = null;
reset.onclick = () => {
  if (!armed) {
    reset.textContent = 'Click again to turn every card back on';
    armed = setTimeout(() => { armed = null; reset.textContent = 'Turn every card back on'; }, 4000);
    return;
  }
  clearTimeout(armed); armed = null;
  const saved = resetAll();
  // Redraw in place (a reload would lose an unsaved reset and hide the message below)
  resyncs.forEach(fn => fn());
  reset.textContent = 'Turn every card back on';
  if (storageStatus) { storageStatus.hidden = false; storageStatus.textContent = saved ? 'Every card is active again.' : 'Settings were reset for this visit, but this browser could not save them.'; }
};
root.appendChild(list);
})(window.TD = window.TD || {});
