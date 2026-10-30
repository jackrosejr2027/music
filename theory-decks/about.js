(function (TD) {
'use strict';
const { DECKS } = TD['decks.js'];
const { GAMES } = TD['games.js'];
const { THEMES } = TD['themes.js'];
const { STYLES } = TD['cardstyles.js'];
const { rightHandCount } = TD['data/righthand.js'];
const { stringCards } = TD['data/strings.js'];
const { PLAYABLE_DECKS, describeSound, spellGroup, spellCard, withOctave, soundFor, midiName } = TD['sound.js'];
const PLAYABLE_NAMES = PLAYABLE_DECKS.map(id => DECKS.find(d => d.id === id).name).join(', ');

const root = document.getElementById('about');
const fmt = (n) => n.toLocaleString('en-US');
let sectionNo = 0;

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}
function section(title) {
  const s = el('details', undefined, 'reference-section about-section reference-group');
  const h = el('summary', undefined, 'section-heading');
  h.append(el('span', String(++sectionNo).padStart(2, '0')), el('h2', title));
  s.appendChild(h);
  root.appendChild(s);
  return s;
}
const para = (s, text) => s.appendChild(el('p', text, 'about-p'));
function list(s, items) {
  const ul = el('ul', undefined, 'about-list');
  items.forEach(item => ul.appendChild(el('li', item)));
  s.appendChild(ul);
}
function table(s, head, rows) {
  const wrap = el('div', undefined, 'about-table-wrap');
  const t = el('table', undefined, 'about-table');
  const tr = el('tr');
  head.forEach(h => tr.appendChild(el('th', h)));
  const thead = el('thead'); thead.appendChild(tr); t.appendChild(thead);
  const tb = el('tbody');
  rows.forEach(r => { const row = el('tr'); r.forEach((c, i) => { const td = el('td'); td.dataset.label = head[i]; if (c && c.nodeType) td.appendChild(c); else td.textContent = String(c); row.appendChild(td); }); tb.appendChild(row); });
  t.appendChild(tb); wrap.appendChild(t); s.appendChild(wrap);
}

// Tables whose figures need whole decks are filled in after the page is shown, one deck per task,
// so the text appears instantly and the page never freezes while ~150,000 cards are counted.
const queue = [];
const later = (task) => { queue.push(task); if (queue.length === 1) setTimeout(drain, 30); };
function drain() {
  const started = Date.now();
  while (queue.length && Date.now() - started < 12) { try { queue.shift()(); } catch (error) { console.error(error); } }
  if (queue.length) setTimeout(drain, 0);
}
function lazyTable(s, head, items, rowFor) {
  const wrap = el('div', undefined, 'about-table-wrap');
  const t = el('table', undefined, 'about-table');
  const tr = el('tr');
  head.forEach(h => tr.appendChild(el('th', h)));
  const thead = el('thead'); thead.appendChild(tr); t.appendChild(thead);
  const tb = el('tbody');
  items.forEach(item => {
    const row = el('tr');
    const cells = head.map((h, i) => { const td = el('td', i === 0 ? item.name : '…'); td.dataset.label = h; row.appendChild(td); return td; });
    tb.appendChild(row);
    later(() => rowFor(item).forEach((v, i) => { cells[i].textContent = String(v); }));
  });
  t.appendChild(tb); wrap.appendChild(t); s.appendChild(wrap);
}

// ---------- figures ----------
const rhBySet = [2, 3, 4, 5, 6, 7, 8].map(n => [n, rightHandCount(n)]);
const rhTotal = rhBySet.reduce((a, [, c]) => a + c, 0);
const totalEl = el('span', '…');
let totalCards = rhTotal, countedDecks = 0;
const counted = (n) => { totalCards += n; if (++countedDecks === DECKS.length - 1) totalEl.textContent = fmt(totalCards); };
const groupsOf = (d) => [...new Set(d.cards.map(c => c.group).filter(Boolean))];

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

// ---------- 1. Overview ----------
let s = section('Overview');
para(s, 'Theory Decks is a guitar study tool that presents music theory and technique as flippable cards and as "deals" — games that combine several random cards into one practice task. Pages: Home (index.html), Play (play.html — every deck and game; "Choose deck" opens a linked list of all decks and games), Reference (reference.html — a full theory lesson for every deck, then full documentation of each deck and game), About (about.html — this page), Release Notes (release-notes.html — final-release notes, capabilities and use cases), Settings (settings.html — tick which cards games may deal), DAW (daw.html — build songs from cards on a step grid defaulting to quarter notes (down to 32nd notes)), Fretboard (Fretboard Diagrams/index.html — 563 grouped scale, chord and interval forms on 1–14 individually tuned strings, with search, a 0–48 fret window and capo) and From the Author (author.html). Every page links to every page — itself included, marked as current — from its top header; the Play page keeps a shorter header (Home, Play, DAW, Reference, Fretboard, Release Notes, Settings) so the cards get the room.');
table(s, ['Figure', 'Value'], [
  ['Card decks', DECKS.length],
  ['Cards in total (Right Hand counted for every string set 2–8)', totalEl],
  ['Games', GAMES.length],
  ['Common progression game groups', GAMES.filter(g => g.id.startsWith('progression-family-')).length],
  ['Cards in those game pools', GAMES.filter(g => g.id.startsWith('progression-family-')).reduce((n, g) => n + g.meta.family.cards.length, 0)],
  ['Colour themes', THEMES.length],
  ['Card styles (corner motif + frame)', STYLES.length],
  ['Internet connection required', 'None — 100% offline'],
  ['Build step, frameworks, external libraries', 'None — plain HTML, CSS and JavaScript'],
]);

// ---------- 2. Offline ----------
s = section('Offline operation');
para(s, 'Every byte of the app is local: there are no CDN scripts, web fonts, images, audio files, API calls or analytics. All cards are generated on the device from compact data tables, and the tone button synthesises sound with the Web Audio API.');
list(s, [
  'Extracted package: keep the complete folder tree and serve it on localhost for reliable use without internet. The integrated app includes modules and local fetch requests, so direct file:// opening is not fully supported.',
  'Installed/hosted use: a service worker (service-worker.js) pre-caches every page, stylesheet and script on first visit. Requests use the complete local cache first; directory addresses use their own index page. Missing files show an offline error instead of silently opening Home.',
  'offline-support.js registers the service worker on secure origins (https or localhost) and waits for caching to finish before following the first in-app link.',
  'Settings (theme, card style, strings, + Octave, active cards and the DAW song) are stored in localStorage when available; if storage is blocked the app still works with defaults.',
  'offline-assets.js is the single list of every file the app needs; the service worker installs from it file by file (one failed download never leaves the app uncached), and Settings → Offline shows how many are saved on this device and can save them all again on demand.',
]);

// ---------- 3. Using the Play page ----------
s = section('Using the Play page');
list(s, [
  'Cards selector: choose any of the ' + DECKS.length + ' decks to browse all its cards in a grid, grouped under headings.',
  'Games selector: choose any of the ' + GAMES.length + ' games to deal a combination of cards.',
  'Tap a card once to flip it to its details; tap again to see the card transposed into all 12 keys (where that applies); tap again to return to the front.',
  'Each card front shows its number, deck name, title, subtitle and its Base 0 value (a key-independent formula).',
  'Playable decks (' + PLAYABLE_NAMES + ') have three buttons on every card front: ▶ Together (▶ Chords for progressions) sounds all notes at once, ▶ Arpeggio plays each note individually, and + Octave is a switch that adds the octave of the first note to everything you play (ascending lines and chords gain the octave above, descending lines finish an octave below). The switch is shared by every card and remembered between visits. In games every dealt card with pitches plays in the dealt key.',
  'What each deck plays: keys their scale from the tonic; Roman numerals the triad they name; strings the open string at its real pitch; Left Hand sequences one finger per fret from C4; Right Hand paths their open strings in picking order; Base 0 cards the card they were derived from. Only the Technique deck has no pitches.',
  'Key cards carry a ▶ button that plays the key\'s tonic alone at its exact equal-tempered frequency (A4 = 440 Hz, tonic in octave 4, C4 = 261.63 Hz to B4 = 493.88 Hz).',
  'In a game, each changeable card has a 🔀 button that deals a random replacement for just that card, and a manual chooser under it: ◀ / ▶ step to the previous or next card, and the list (or a number box for decks over 600 cards) jumps straight to any card. "Deal again" redraws everything. Only the cards you change are re-animated.',
  'String-count selector (2–8 strings) appears for the String deck, the Right Hand deck and the Left and Right Hand Practice games; the String deck always follows it.',
  'Cards can be flipped from the keyboard: Tab to a card and press Enter or Space.',
  'Theme selector: ' + THEMES.map(t => t[0]).join(', ') + '.',
  'Card style selector: ' + STYLES.map(t => t[0]).join(', ') + '.',
  'Very large decks (over 300 cards) render progressively in batches of 100 as you scroll, so even the 109,592-card eight-string Right Hand deck opens instantly.',
]);

// ---------- Randomness ----------
s = section('Randomisation & manual choice');
list(s, [
  'Random numbers come from the browser\'s cryptographic generator (crypto.getRandomValues) with rejection sampling, so every card is exactly equally likely — no modulo bias and no weak Math.random patterns.',
  'Every pool is a shuffle bag: all of its cards are dealt once, in a fresh Fisher–Yates order, before any card repeats, and a refilled bag never starts with the card that was just dealt.',
  'This applies to every game, every slot: keys, subjects, patterns, techniques, modes, strings, left- and right-hand sequences and Fibonacci starting terms.',
  'Fibonacci games draw their starting term from one full Pisano period — 16 starts for mod 7, 24 for mod 12, 60 for the two-octave pentatonic and Hirajoshi spans (mod 10) and 48 for the major-mode span (mod 14) — so every distinct deal can occur. Large Fibonacci numbers are computed exactly with BigInt.',
  'Manual choice never breaks the bag: after you pick a card by hand, random draws continue from the same shuffled order.',
]);

// ---------- 4. Decks ----------
s = section('Decks');
para(s, 'Every deck, its size and its internal groups. Counts are computed live.');
lazyTable(s, ['Deck', 'Cards', 'Groups / structure'], DECKS, (d) => {
  if (d.id === 'righthand') return [d.name, fmt(rhTotal) + ' (all sets)', rhBySet.map(([n, k]) => n + ' strings: ' + fmt(k)).join(' · ')];
  const c = d.cards.length;
  counted(c);
  const groups = groupsOf(d);
  return [d.name, fmt(c), groups.length ? groups.slice(0, 12).join(' · ') + (groups.length > 12 ? ' … (' + groups.length + ' groups)' : '') : '—'];
});
list(s, [
  'Key: ' + DECKS[0].cards.filter(c => c.sub === 'Major key').length + ' major keys in circle-of-fifths order, then 12 natural, 12 harmonic and 12 melodic minor keys, then the Dorian, Phrygian, Lydian, Mixolydian and Locrian modes on all 12 tonics (' + DECKS[0].cards.length + ' cards in all; games deal major keys).',
  'Intervals are split into Basic (unison to octave) and Extended (beyond the octave), each ascending and descending.',
  'Chord decks include every inversion (triads: root, 1st, 2nd; four-tone chords: root, 1st, 2nd, 3rd).',
  'Scale and mode decks include each scale\'s 2nd and 3rd rotations.',
  'Melodic patterns include each pattern\'s retrograde and inversion.',
  'Progression decks include 7th-chord and extended-colour versions of every progression.',
  'String deck: standard, half-step-down and whole-step-down tunings for the selected string count. Standard pitches: ' + stringCards(8).map(c => c.title.replace('String ', '') + '=' + c.rows[0][1] + ' (' + c.rows[1][1] + ')').join(', ') + '.',
  'Base 0: a key-independent semitone formula for every chord, scale, mode, interval, pattern and progression card, plus finger offsets for every left-hand sequence.',
]);

// ---------- 5. Games ----------
s = section('Games');
table(s, ['Group', 'Games', 'What is dealt'], GAME_GROUPS.map(([label, test]) => {
  const n = GAMES.filter(test).length;
  const what = {
    'Technique deals': 'Key + subject card (interval, chord, scale, mode, pattern, progression or Roman numeral) + technique + Base 0',
    'Melodic pattern deals': 'Key + subject + melodic pattern + Base 0 (and the mode/Base 0 pattern combination game)',
    'Focused pattern deals': 'Key + subject + one melodic-pattern family (+ technique) + Base 0',
    'Fibonacci progressions': 'Key + chord progression generated from Fibonacci numbers + the terms used',
    'Fibonacci · Major modes': 'Key + mode + 2–6 note set chosen by Fibonacci numbers + terms (Walk, Steps, Golden Skip, Rhythm)',
    'Fibonacci · Pentatonic modes': 'Same, across the five pentatonic modes',
    'Fibonacci · Hirajoshi modes': 'Same, across the five Hirajoshi modes',
    'Hand practice': 'Left-hand finger sequence + string + Base 0; right-hand picking path + key + technique',
    'Common chord progressions': 'Major key + a 30-card progression-family pool (10 forms in triad, seventh and extended voicings) + guitar technique + Base 0',
  }[label];
  return [label, n, what];
}));
para(s, 'Complete list of games:');
list(s, GAMES.map(g => g.name));

// ---------- Audio ----------
s = section('Pitch-perfect playback');
para(s, 'All sound is synthesised on the device with the Web Audio API at exact twelve-tone equal-tempered frequencies, f = 440 × 2^((n − 69) / 12). Each note is its fundamental plus soft 2nd–5th harmonics, so it is clearly audible on phone and laptop speakers while the pitch heard is exactly the fundamental. No audio files are used, so playback works fully offline. A gentle limiter keeps chords from clipping, and starting a new sound stops the previous one. Fibonacci progression and note-set cards are playable too.');
lazyTable(s, ['Deck', 'Buttons', 'Register', 'Example (first card)'], PLAYABLE_DECKS.map(id => DECKS.find(x => x.id === id)), (d) => {
  const id = d.id;
  const prog = ['andalusian', 'deceptive', 'majorminor', 'blues'].includes(id);
  const reg = prog ? (id === 'andalusian' ? 'A minor, voice-led roots E3–A4' : 'C, voice-led roots E3–A4') : ['triads', 'tetrads'].includes(id) ? 'Around C4, written bass lowest' : id.startsWith('intervals') ? 'Up from C4 / down from C5' : id === 'modes' ? 'From the mode\'s first note (octave 4)' : 'From C4';
  const card = id === 'base0' ? TD['decks.js'].base0CardFor(DECKS.find(x => x.id === 'intervals'), DECKS.find(x => x.id === 'intervals').cards[4], 4) : d.cards[0];
  const sample = describeSound(id, card);
  return [d.name, (prog ? 'Chords · Arpeggio' : 'Together · Arpeggio') + ' · + Octave', reg, card.title + ': ' + sample + ' · with octave: ' + withOctave(soundFor(id, card).events).map(n => spellCard(id, card, n).join(' ')).join(' / ')];
});
list(s, [
  'Together: every note of the card starts at the same moment and rings for 1.8 s; progressions play each chord for about 1 s in sequence.',
  'Arpeggio: notes sound one at a time in written order (0.32 s apart; 0.2 s for long lines and for progressions, with a short pause between chords).',
  'Exact tone counts: intervals play 2 tones, triads 3, four-tone chords 4, 5/6/7-tone scales 5/6/7 tones — all including the root, with no added octave. Modes play exactly the notes of their formula; melodic patterns and 7-tone Base 0 patterns play every written note (repeated positions repeat the note in Arpeggio; Together sounds each distinct pitch once).',
  'Progressions are voice-led: each chord root moves to the octave nearest the previous root (within E3–A4), so descending progressions such as Am–G–F–E really descend.',
  'Chord inversions keep the written bass note lowest; extended progression chords (add9, 9, 11, 13, 7♭9, maj7♯11) are voiced with their extensions above the chord.',
  'Major / Minor and Blues cards written in A minor play in A minor when browsed. Inside games the pitches are moved to the dealt key, kept within a fourth or so of the C register so every key sounds in a comfortable range.',
]);

// ---------- Fretboard ----------
s = section('Fretboard Diagrams');
list(s, [
  '563 grouped shapes in any of the 12 keys: 215 scales/collections, 224 chords/sonorities and 124 intervals. Search by category, name or formula; diagrams support 1–14 individually tuned strings, capo and a selectable 0–48 fret window.',
  'Tune every string independently by note and octave, or start from Standard, Half step down, Whole step down or Drop. The 6-string default can follow the Play/Settings count; Fretboard accepts up to 14.',
  'Set a capo from fret 0 to 48. Frets below it are hidden as muted; the capoed open pitches are shown while all labels remain concert-pitch names.',
  'Every note is spelled letter-correctly for the key (E♭ major has A♭, C°7 has B𝄫); the root is red. Labels show note names or scale degrees.',
  'Tap or press Enter on a note to hear its exact pitch; ▶ Arpeggio plays the selected formula note by note and ■ Stop halts it. The entire view, including custom tuning, fret window and capo, is saved locally and included in Settings → Backup.',
  'Export the diagram locally as PNG, JPG, PDF, PPTX or DOCX, or export its formula arpeggio as MIDI. Image and office exports include the current diagram and instrument metadata; no CDN, server conversion or upload is used.',
]);

// ---------- Settings ----------
s = section('Settings');
list(s, [
  'Look & sound: colour theme, card style, string count and the + Octave switch — the same choices as the Play page header, applied to an open Play page at once (even in another tab), with a test sound.',
  'DAW song: a summary of the saved song, a JSON download and a two-step clear.',
  'Offline: the version, how many of the app\'s files are saved on this device, whether offline support is active, and a button that saves every file again.',
  'Backup & reset: one JSON file with every setting and the DAW song, to move to another device or browser; import it to restore; reset everything (two-step).',
]);
s = section('Active cards (Settings)');
list(s, [
  'The Settings page (settings.html) lists every deck; tick or untick single cards, whole groups, or a whole deck with All on / All off.',
  'Games deal only active cards, and a game\'s manual chooser lists only active cards. If every card a game needs is switched off, the game says so and links to Settings.',
  'Switched-off cards stay in the card browser on the Play page, dimmed, so they can still be studied.',
  'Choices are stored on this device (localStorage, key td-active) as the shorter of the switched-off or switched-on list, so even the 109,592 Right Hand paths store compactly. Base 0 cards follow their source card.',
  'Settings changed in another tab are picked up by an open Play page straight away.',
]);

// ---------- DAW ----------
s = section('DAW');
list(s, [
  'daw.html is a small song editor built on the cards. Each bar has melody rows (scale degrees of the bar\'s scale), a Chords lane and a Bass lane, edited on a grid of 1/4 to 1/32 steps, straight or triplet, with the mouse, touch or keyboard; positions are stored in 96ths of a whole note, so every meter and every triplet is exact.',
  'Every bar has its own meter (1–32 over 2, 4, 8, 16 or 32), beat grouping (e.g. 2+2+3), tempo, key, scale and any number of chord changes. Diatonic chords follow the scale; chords from cards keep their quality.',
  'Progression cards build whole sections (½, 1, 2 or 4 bars per chord, repeated, in any key); chord, Roman numeral, key, scale, melodic pattern, Base 0 pattern and interval cards set chords and scales or insert melody at the cursor.',
  'Sections are arranged into the song in any order and repeated freely. Live key, scale and chord overrides, tempo and edits take effect while playing: a look-ahead scheduler places notes about 0.12 s ahead on the Web Audio clock.',
  'New starts a blank song (empty bars for a totally new progression) or one of 916 ready-made progressions (daw-presets.js; 20 genres, searchable by name, genre, scale or numerals) in any key, meter, tempo and bars per chord. Blank bars can use any of the 15 scales and show a “+ Chord” marker until a chord is chosen. Right-clicking the grid (or a long press on touch screens) adds a triad, 4-tone or 5-tone chord at that point; the All bars strip sets chord, key (or transposes), scale, meter and tempo for a whole section or song.',
  'Songs save automatically on this device, sync to other open tabs, and export as JSON (re-importable), TXT (a readable chart), CSV (one row per chord change and note) or MIDI (tempo, meter and key changes, section markers, chord symbols, Melody, Chords, Bass and Drums tracks — re-importable too). A Drums lane follows every bar’s meter. Undo and redo cover 100 edits. Nothing is uploaded.',
]);

// ---------- Release ----------
s = section('Version');
para(s, 'Final Release notes cover capabilities, design, FAQ, how-to, application, troubleshooting and a cheat sheet; the version 1.0 history is retained below.');

// ---------- 6. Conventions ----------
s = section('Theory conventions');
list(s, [
  'Spelling is letter-correct: every note is spelled from its scale degree (so E♭ major has A♭, not G♯), using ♭, ♯ and double accidentals where needed.',
  'Formulas are written as major-scale degrees (1–♭3–5 = minor triad). Base 0 formulas are semitones above the root (0-3-7).',
  'The "all keys" view transposes each card to the 12 roots C, D♭, D, E♭, E, F, F♯, G, A♭, A, B♭, B.',
  'Andalusian progressions are written in A minor and dealt from the relative minor of the dealt major key; all other progressions use the major key itself.',
  'Fibonacci games reduce Fibonacci numbers (0, 1, 1, 2, 3, 5, 8, 13…) modulo the size of the scale (or twice the size, to span two octaves) to choose degrees; the Pisano period of 7 (16 terms) produces the 16-chord loop.',
  'Tone generation: equal temperament, f = 440 × 2^((n − 69) / 12), where n is the MIDI note number.',
]);

// ---------- 7. Architecture ----------
s = section('Architecture & performance');
list(s, [
  'Every code file is a small self-contained script that registers its exports on a shared window.TD object, loaded in dependency order with deferred <script> tags.',
  'Data files are lazy too: each registers a factory that runs only when a deck first needs it, so the Play page starts in a few milliseconds instead of building every data table.',
  'Decks are lazy: a deck builds its cards the first time it is opened and then caches them, so startup never generates all ~150,000 cards up front.',
  'Right Hand paths are generated per string set on demand and stored as lightweight objects whose display fields are computed only when a card is drawn.',
  'Base 0 values are computed per card directly, so dealing a game or opening a deck never requires building the whole 11,000-card Base 0 deck.',
  'Reference groups (Theory lessons, Decks, Games and DAW) start collapsed and open independently; long entry documentation is built only when an entry is expanded.',
]);
table(s, ['File', 'Role'], [
  ['index.html, home.css', 'Home page and the styling shared by Home, Reference and About'],
  ['play.html, style.css, app.js', 'Card browser and game table; themes, card styles, flipping, progressive rendering'],
  ['reference.html, reference.js, deckdocs.js, gamedocs.js', 'Reference page and its long-form deck and game documentation with live C-major examples'],
  ['about.html, about.js', 'This page'],
  ['theory.js', 'Note spelling, formula parsing, transposition, step and shape descriptions'],
  ['data/*.js', 'Source tables: keys, intervals, Roman numerals, chords, scales, modes, melodic patterns, strings, techniques, progressions, left and right hand'],
  ['decks.js', 'Assembles the decks (rotations, tunings, Base 0) lazily'],
  ['game.js, games.js', 'Deal games and the full game list'],
  ['fibonacci.js, fibcombos.js', 'Fibonacci progression and Fibonacci note-set games'],
  ['tone.js', 'Web Audio engine: exact-pitch tones with soft overtones, simultaneous chords, arpeggios, timed notes for the DAW, and the iPhone/iPad silent-switch fix'],
  ['deal.js', 'Shared dealing engine: cryptographic random numbers, shuffle bags, random and manual card changes for every game'],
  ['settings.html, settings.js, active.js, prefs.js', 'Settings page: look & sound, active cards (tick cards, groups or decks games may deal; games read only active cards), DAW song, offline status and a full backup / restore / reset'],
  ['daw-presets.js', 'The 916 ready-made progressions for New song (all unique), as Roman numerals with a scale'],
  ['daw.html, daw.js, daw-core.js, daw.css', 'DAW page: song model, chord and pitch resolution, look-ahead scheduler (daw-core.js) and the editor (daw.js)'],
  ['lessons.js', 'Full music-theory lessons for every deck, shown first on the Reference page'],
  ['release-notes.html', 'Final Release notes, device compatibility and the version 1.0 history'],
  ['Fretboard Diagrams/index.html, fretboard.js, fretboard.css', 'Fretboard diagrams: scales, chords and intervals in any key, 1–14 independently tuned strings, a 0–48 fret window and capo (local files; every page links here)'],
  ['author.html', 'From the Author page (content to be added later)'],
  ['sound.js', 'Exact MIDI pitches for every playable card (intervals, chords, scales, modes, patterns, progressions)'],
  ['themes.js, cardstyles.js', 'Colour themes and card motifs/frames'],
  ['service-worker.js, offline-support.js, offline-assets.js', 'Offline caching from one shared file list'],
]);
})(window.TD = window.TD || {});
