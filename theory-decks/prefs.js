(function (TD) {
'use strict';
// Settings page: look & sound, the DAW song, offline copy, and a backup of everything (all stored on this device)
const { THEMES } = TD['themes.js'];
const { STYLES } = TD['cardstyles.js'];
const $ = (id) => document.getElementById(id);
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
  del(key) { try { localStorage.removeItem(key); return true; } catch { return false; } },
};
// The same keys and defaults the Play page uses
const KEYS = ['td-theme', 'td-style', 'td-octave', 'td-strings', 'td-view', 'td-active', 'td-daw', 'td-daw-ui', 'td-fret'];
// Settings stored as JSON: an import must never write a damaged value that would break a page
const JSON_KEYS = new Set(['td-active', 'td-daw', 'td-daw-ui', 'td-fret']);
const DEFAULT = { theme: Math.min(2, THEMES.length - 1), style: Math.min(1, STYLES.length - 1), strings: '6' };
const index = (key, list, fallback) => { const raw = store.get(key); const v = +raw; return raw !== null && Number.isInteger(v) && v >= 0 && v < list.length ? v : fallback; };
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
let savedTimer = null;
function saved(ok, text) {
  const el = $('pref-saved');
  el.textContent = text || (ok ? 'Saved on this device.' : 'This browser could not save it — it applies for this visit only.');
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => { el.textContent = ''; }, text && text.length > 60 ? 9000 : 2500);
}
// Two-step buttons: the first click asks, a second click within 4 s does it
function confirmButton(btn, ask, run) {
  const label = btn.textContent;
  let armed = null;
  btn.onclick = () => {
    if (!armed) { btn.textContent = ask; armed = setTimeout(() => { armed = null; btn.textContent = label; }, 4000); return; }
    clearTimeout(armed); armed = null; btn.textContent = label;
    run();
  };
}
function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------- look & sound ----------
THEMES.forEach(([name], i) => $('pref-theme').add(new Option(name, i)));
STYLES.forEach(([name], i) => $('pref-style').add(new Option(name, i)));
function showPrefs() {
  $('pref-theme').value = index('td-theme', THEMES, DEFAULT.theme);
  $('pref-style').value = index('td-style', STYLES, DEFAULT.style);
  const s = store.get('td-strings');
  $('pref-strings').value = s && [...$('pref-strings').options].some(o => o.value === s) ? s : DEFAULT.strings;
  $('pref-octave').checked = store.get('td-octave') === '1';
  const t = THEMES[+$('pref-theme').value];
  const sw = $('pref-swatch');
  sw.style.background = 'linear-gradient(135deg, ' + t[1] + ', ' + t[2] + ')';
  sw.style.color = t[3];
  sw.innerHTML = '<i style="background:' + t[4] + ';color:' + t[5] + '">' + (+$('pref-style').value + 1) + '</i>';
  sw.title = t[0] + ' · ' + STYLES[+$('pref-style').value][0];
}
$('pref-theme').onchange = () => { saved(store.set('td-theme', $('pref-theme').value)); showPrefs(); };
$('pref-style').onchange = () => { saved(store.set('td-style', $('pref-style').value)); showPrefs(); };
$('pref-strings').onchange = () => saved(store.set('td-strings', $('pref-strings').value));
$('pref-octave').onchange = () => saved(store.set('td-octave', $('pref-octave').checked ? '1' : '0'));
$('pref-test').onclick = () => {
  const tone = TD['tone.js'];
  const notes = [60, 64, 67].concat($('pref-octave').checked ? [72] : []);
  tone.playEvents([notes], 'arpeggio');
};

// ---------- DAW song ----------
function dawSong() { try { return JSON.parse(store.get('td-daw')); } catch { return null; } }
function showDaw() {
  const song = dawSong();
  const ok = song && Array.isArray(song.sections);
  $('daw-backup').disabled = !ok;
  $('daw-clear').disabled = !ok;
  if (!ok) { $('daw-summary').textContent = 'No song saved yet — the DAW starts with a short example, or New → Blank for your own progression.'; return; }
  const bars = song.sections.reduce((n, s) => n + (Array.isArray(s.measures) ? s.measures.length : 0), 0);
  $('daw-summary').textContent = '“' + String(song.title || 'Untitled song') + '” · ' + song.sections.length + (song.sections.length === 1 ? ' section' : ' sections') + ' · ' + bars + (bars === 1 ? ' bar' : ' bars') + ' · ♩ = ' + (song.tempo || 100) + '. Saved automatically while you work.';
}
$('daw-backup').onclick = () => { const s = dawSong(); if (s) download((String(s.title || '').replace(/[^\p{L}\p{N}\- ]+/gu, '').trim().replace(/\s+/g, '-') || 'song') + '.json', JSON.stringify(s, null, 1)); };
confirmButton($('daw-clear'), 'Click again to clear the song', () => { store.del('td-daw'); showDaw(); saved(true, 'DAW song cleared.'); });

// ---------- offline ----------
const OFF = window.TD_OFFLINE;
async function showOffline() {
  const out = $('offline-status');
  const parts = [];
  if (!OFF) { out.textContent = 'Offline file list not found.'; return; }
  if (!/^https?:$/.test(location.protocol)) {
    out.textContent = 'Opened from local files (' + location.protocol + '): use the complete extracted package on localhost for reliable offline operation; direct file opening is browser-dependent.';
    $('offline-save').hidden = true; $('offline-zip').hidden = true;
    return;
  }
  if (!('serviceWorker' in navigator) || !window.caches) {
    out.textContent = 'This browser cannot keep an offline copy (no service worker support). Use the full ZIP package on localhost for reliable offline operation.';
    $('offline-save').hidden = true;
    return;
  }
  let have = 0;
  try {
    const cache = await caches.open(OFF.cache);
    const checks = await Promise.all(OFF.assets.map(u => cache.match(u, { ignoreSearch: true })));
    have = checks.filter(Boolean).length;
  } catch { /* storage blocked */ }
  const all = OFF.assets.length;
  parts.push('Version ' + OFF.version + ' · ' + have + ' of ' + all + ' files saved on this device' + (have === all ? ' — ready to use with no connection.' : '.'));
  parts.push(navigator.serviceWorker.controller ? 'Offline support is active on this page.' : 'Offline support starts on the next page you open.');
  parts.push(navigator.onLine ? 'You are online.' : 'You are offline right now.');
  out.textContent = parts.join(' ');
  const saveButton = $('offline-save');
  if (saveButton) {
    saveButton.disabled = !navigator.onLine || have === all;
    saveButton.textContent = have === all ? 'Offline copy ready' : navigator.onLine ? 'Save everything for offline now' : 'Offline copy incomplete';
  }
}
$('offline-save').onclick = async () => {
  const btn = $('offline-save');
  if (!window.caches || !OFF) return;
  if (!navigator.onLine) { offMsg('Connect to download the missing offline files; saved files still work now.'); await showOffline(); return; }
  btn.disabled = true;
  let done = 0, failed = 0;
  try {
    const cache = await caches.open(OFF.cache);
    const optional = new Set(OFF.optional);
    const assets = OFF.assets.concat(OFF.optional);
    for (let i = 0; i < assets.length; i += 6) {
      const batch = assets.slice(i, i + 6);
      await Promise.all(batch.map(async (u) => {
        let savedFile = false;
        for (let attempt = 0; attempt < 3 && !savedFile; attempt++) {
          try {
            const refreshUrl = new URL(u, location.href);
            refreshUrl.searchParams.set('__td_offline_refresh', '1');
            const response = await fetch(refreshUrl.href, { cache: 'reload' });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            await cache.put(u, response);
            savedFile = true;
          } catch {
            if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
          }
        }
        if (!savedFile && !optional.has(u)) failed++;
        done++;
        btn.textContent = 'Saving… ' + done + ' / ' + assets.length;
      }));
    }
  } catch { failed = -1; }
  btn.disabled = false;
  btn.textContent = 'Save everything for offline now';
  try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch { /* not granted */ }
  await showPersist();
  await showOffline();
  if (failed === 0) offMsg('Every file is saved for offline use.');
  if (failed) $('offline-status').textContent += failed > 0 ? ' ' + failed + ' files could not be downloaded — try again when online.' : ' This browser blocked offline storage.';
};
// Messages for the Offline section, shown next to its buttons
let offTimer = null;
function offMsg(text) { const el = $('offline-msg'); el.textContent = text; clearTimeout(offTimer); offTimer = setTimeout(() => { el.textContent = ''; }, 12000); }
// ---------- keep data from being cleared ----------
// Browsers may clear a site's storage on their own when the disk is low; "persistent" storage is exempt
// (only the user clearing site data removes it). Asked for quietly — browsers grant it without a prompt for
// installed or often-used sites — and shown here.
async function showPersist() {
  const out = $('persist-status');
  if (!out) return;
  if (!navigator.storage || !navigator.storage.persisted) { out.textContent = 'This browser does not report storage protection. Use Backup & reset (below) to keep a copy of your settings and song.'; $('persist-ask').hidden = true; return; }
  let on = false, est = null;
  try { on = await navigator.storage.persisted(); } catch { on = false; }
  try { est = navigator.storage.estimate ? await navigator.storage.estimate() : null; } catch { est = null; }
  const used = est && est.usage ? ' Using ' + (est.usage / 1048576).toFixed(1) + ' MB on this device.' : '';
  out.textContent = (on ? 'Protected: the browser will not clear settings, the DAW song or the offline copy on its own — only clearing site data yourself removes them.' : 'Not protected yet: the browser could clear this site\'s data when the device runs low on space.') + used;
  $('persist-ask').hidden = on;
}
$('persist-ask').onclick = async () => {
  let ok = false;
  try { ok = navigator.storage && navigator.storage.persist ? await navigator.storage.persist() : false; } catch { ok = false; }
  await showPersist();
  offMsg(ok ? 'Storage protected.' : 'The browser declined for now — installing the app (Add to Home Screen / Install) usually lets it say yes. Backups still work.');
};

// ---------- the whole app as one .zip (open index.html from it with no connection, ever) ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(files) { // files: [{ name, data: Uint8Array }] — stored (no compression), UTF-8 names
  const enc = (str) => Uint8Array.from(unescape(encodeURIComponent(str)), ch => ch.charCodeAt(0));
  const parts = [], central = [];
  let offset = 0;
  const d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  files.forEach(f => {
    const name = enc(f.name), crc = crc32(f.data), size = f.data.length;
    const head = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, time, 2], [12, date, 2], [14, crc, 4], [18, size, 4], [22, size, 4], [26, name.length, 2], [28, 0, 2]].forEach(([o, v, n]) => n === 4 ? head.setUint32(o, v, true) : head.setUint16(o, v, true));
    parts.push(new Uint8Array(head.buffer), name, f.data);
    const cen = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, time, 2], [14, date, 2], [16, crc, 4], [20, size, 4], [24, size, 4], [28, name.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, offset, 4]].forEach(([o, v, n]) => n === 4 ? cen.setUint32(o, v, true) : cen.setUint16(o, v, true));
    central.push(new Uint8Array(cen.buffer), name);
    offset += 30 + name.length + size;
  });
  const cenSize = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, cenSize, 4], [16, offset, 4], [20, 0, 2]].forEach(([o, v, n]) => n === 4 ? end.setUint32(o, v, true) : end.setUint16(o, v, true));
  return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
}
$('offline-zip').onclick = async () => {
  const btn = $('offline-zip');
  if (!OFF || !window.caches) return;
  btn.disabled = true;
  const files = [], missing = [];
  let cache;
  try { cache = await caches.open(OFF.cache); }
  catch {
    btn.disabled = false;
    btn.textContent = 'Download the whole app (.zip)';
    offMsg('The browser could not open its offline cache. Restore storage access before exporting the package.');
    return;
  }
  const required = OFF.assets.filter(u => u !== './');
  const optional = OFF.optional.filter(u => !u.endsWith('/'));
  let list = required.concat(optional);
  if (!navigator.onLine) {
    try {
      const requiredResponses = await Promise.all(required.map(u => cache.match(u, { ignoreSearch: true })));
      const missingRequired = required.filter((u, i) => !requiredResponses[i]);
      if (missingRequired.length) {
        btn.disabled = false;
        btn.textContent = 'Download the whole app (.zip)';
        offMsg(missingRequired.length + ' required files are not saved on this device. Open Settings while online to refresh the offline copy.');
        return;
      }
      const optionalResponses = await Promise.all(optional.map(u => cache.match(u, { ignoreSearch: true })));
      list = required.concat(optional.filter((u, i) => !!optionalResponses[i]));
    } catch {
      btn.disabled = false;
      btn.textContent = 'Download the whole app (.zip)';
      offMsg('The offline cache could not be read. Open Settings while online to rebuild it.');
      return;
    }
  }
  let done = 0;
  for (let i = 0; i < list.length; i += 6) {
    const batch = list.slice(i, i + 6);
    await Promise.all(batch.map(async (u) => {
      let packed = false;
      for (let attempt = 0; attempt < 3 && !packed; attempt++) {
        try {
          let response;
          if (navigator.onLine) {
            const refreshUrl = new URL(u, location.href);
            refreshUrl.searchParams.set('__td_offline_refresh', '1');
            response = await fetch(refreshUrl.href, { cache: 'reload' });
          } else {
            response = await cache.match(u, { ignoreSearch: true });
          }
          if (!response || !response.ok) throw new Error(response && response.status || 'Not cached');
          // Resolve parent dependencies inside the archive, never as ../ ZIP entries.
          const path = decodeURIComponent(new URL(u, 'https://offline.local/theory-decks/').pathname.slice(1));
          const bytes = new Uint8Array(await response.arrayBuffer());
          files.push({ name: 'Scales Thesaurus/' + path, data: bytes });
          packed = true;
        } catch {
          if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
        }
      }
      if (!packed && !OFF.optional.includes(u)) missing.push(u);
      btn.textContent = 'Packing… ' + (++done) + ' / ' + list.length;
    }));
  }
  // A backup of this device's settings and DAW song travels with it (Settings → Import settings)
  const data = { app: 'Theory Decks', version: OFF.version, saved: new Date().toISOString(), settings: {} };
  KEYS.forEach(k => { const v = store.get(k); if (v !== null) data.settings[k] = v; });
  files.push({ name: 'Scales Thesaurus/theory-decks/my-settings-backup.json', data: Uint8Array.from(unescape(encodeURIComponent(JSON.stringify(data, null, 1))), ch => ch.charCodeAt(0)) });
  files.push({ name: 'Scales Thesaurus/OFFLINE-START-HERE.txt', data: new TextEncoder().encode('Extract the entire folder. For reliable offline use, serve it on localhost: python -m http.server 8000, then open http://localhost:8000/index.html. No internet is needed. Direct file:// opening is not fully supported (modules, fetch and storage vary by browser). Hosted installs require HTTPS and one complete online download before disconnecting.') });
  files.sort((a, b) => a.name.localeCompare(b.name));
  btn.disabled = false;
  btn.textContent = 'Download the whole app (.zip)';
  if (missing.length) { offMsg(missing.length + ' files could not be read (' + missing.slice(0, 3).join(', ') + (missing.length > 3 ? '…' : '') + ') — save everything for offline first, or try online.'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(zip(files));
  a.download = 'Theory-Decks-' + OFF.version + '.zip';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  offMsg('Downloaded ' + files.length + ' files. Extract the full folder and follow OFFLINE-START-HERE.txt to run it on localhost without internet.');
};

window.addEventListener('online', showOffline);
window.addEventListener('offline', showOffline);
if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('controllerchange', showOffline);

// ---------- backup & reset ----------
$('data-export').onclick = () => {
  const data = { app: 'Theory Decks', version: OFF ? OFF.version : '1.0', saved: new Date().toISOString(), settings: {} };
  KEYS.forEach(k => { const v = store.get(k); if (v !== null) data.settings[k] = v; });
  download('theory-decks-settings.json', JSON.stringify(data, null, 1));
};
$('data-import').onchange = () => {
  const file = $('data-import').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data = null;
    try { data = JSON.parse(reader.result); } catch { /* handled below */ }
    const s = data && data.settings;
    if (!s || typeof s !== 'object') { saved(false); $('pref-saved').textContent = 'That file is not a Theory Decks settings export.'; return; }
    let ok = true;
    const skipped = [];
    KEYS.forEach(k => {
      if (typeof s[k] !== 'string') return;
      if (JSON_KEYS.has(k)) { try { JSON.parse(s[k]); } catch { skipped.push(k); return; } }
      ok = store.set(k, s[k]) && ok;
    });
    if (!ok) { saved(false); return; }
    if (skipped.length) { try { sessionStorage.setItem('td-import-note', 'Imported. Skipped damaged entries: ' + skipped.join(', ') + '.'); } catch { /* not available */ } }
    location.reload(); // every section re-reads its settings
  };
  reader.readAsText(file);
  $('data-import').value = '';
};
confirmButton($('data-reset'), 'Click again to reset everything', () => { KEYS.forEach(k => store.del(k)); location.reload(); });

// Another tab changed something: show it here too
window.addEventListener('storage', (e) => { if (e.key === null || KEYS.includes(e.key)) { showPrefs(); showDaw(); } });
window.addEventListener('pageshow', (e) => { if (e.persisted) { showPrefs(); showDaw(); showOffline(); showPersist(); } });
showPrefs();
showDaw();
showOffline();
showPersist();
try { const note = sessionStorage.getItem('td-import-note'); if (note) { sessionStorage.removeItem('td-import-note'); saved(true, note); } } catch { /* not available */ }
})(window.TD = window.TD || {});
