(function (TD) {
'use strict';
const { GAMES } = TD['games.js'];
const { gameDoc, DOC_SECTIONS } = TD['gamedocs.js'];
const { deckDoc, DECK_DOC_SECTIONS } = TD['deckdocs.js'];
const { LESSONS, LESSON_SECTIONS } = TD['lessons.js'];

const DECK_SUMMARIES = [
  ['keys', 'Key', 'Twelve major keys, natural, harmonic and melodic minor keys, and the Dorian, Phrygian, Lydian, Mixolydian and Locrian modes on all 12 tonics — with notes, relatives or parent keys, signatures and circle-of-fifths positions.'],
  ['intervals', 'Interval · Basic', 'Simple intervals within one octave (unison to octave), ascending and descending, with degree, semitones and transposition.'],
  ['intervals-ext', 'Interval · Extended', 'Compound intervals and extensions beyond the octave (9ths, 11ths, 13ths up to the double octave), ascending and descending.'],
  ['romannumerals', 'Roman Numeral ID', 'Identifies interval roots by their diatonic Roman numeral in major and minor keys.'],
  ['triads', 'Chord · Triad', 'Three-note chord qualities in root position, 1st and 2nd inversion, with formulas and all-key spellings.'],
  ['tetrads', 'Chord · 4 Tone', 'Four-note chords — seventh, sixth, add-tone and altered dominant shapes — in all four inversions.'],
  ['scales5', 'Scale · 5 Tone', 'Five-note scales and pentatonic families plus their 2nd and 3rd rotations, with notes, steps and shape.'],
  ['scales6', 'Scale · 6 Tone', 'Six-note scale collections and their 2nd and 3rd rotations.'],
  ['scales7', 'Scale · 7 Tone', 'Seven-note scales and their 2nd and 3rd rotations, with spellings, step patterns and shapes.'],
  ['modes', 'Ionian & Modes', 'Ionian and modal scale families, related formula variants, and their 2nd and 3rd rotations.'],
  ['melodicpatterns', 'Melodic Patterns', 'Note sequences grouped into runs, arpeggios, motifs, leaps and contours — each with retrograde and inversion.'],
  ['melodic7base0', '7-Tone Base 0 Patterns', 'Sorted scale-step combinations of lengths 2–8, normalized to position 0.'],
  ['strings', 'String', 'Open-string cards in standard, half-step-down and whole-step-down tuning. Select a 2- through 8-string setup.'],
  ['techniques', 'Technique', 'Picking, muting, legato, slides, vibrato, bends, harmonics and more, plus cross-category combination drills.'],
  ['andalusian', 'Andalusian', 'Minor-key Andalusian cadences as triads, 7th chords and extended colours.'],
  ['deceptive', 'Deceptive', 'Deceptive resolutions as written, with 7th-chord and extended-colour versions.'],
  ['majorminor', 'Major / Minor', 'Major-to-minor colour progressions, with 7th-chord and extended-colour versions.'],
  ['blues', 'Blues', 'Blues progressions and variations, with 9th and 13th colour versions.'],
  ['lefthand', '1-2-3-4', 'Ordered left-hand finger sequences of lengths 1–8, with each finger used no more than twice.'],
  ['righthand', 'Right Hand', 'Ordered, no-repeat picking paths for string sets 2–8 and every supported length. Standard tuning: 1=E4, 2=B3, 3=G3, 4=D3, 5=A2, 6=E2, 7=B1, 8=F-sharp1. Defaults to six strings.'],
  ['base0', 'Base 0', 'Root-independent semitone formulas and normalized left-hand sequence references.'],
];

const GAME_GROUPS = [
  ['Technique Deals', game => game.id.startsWith('technique-')],
  ['Melodic Pattern Deals', game => game.id.startsWith('pattern-')],
  ['Focused Pattern Deals', game => game.id.startsWith('extra-pattern-')],
  ['Fibonacci Progressions', game => game.id.startsWith('fib-')],
  ['Fibonacci · Major Modes', game => game.id.startsWith('fibc-major-')],
  ['Fibonacci · Pentatonic Modes', game => game.id.startsWith('fibc-penta-')],
  ['Fibonacci · Hirajoshi Modes', game => game.id.startsWith('fibc-hirajoshi-')],
  ['Hand Practice', game => game.id === 'left-hand-practice' || game.id === 'right-hand-practice'],
  ['Common Chord Progressions', game => game.id.startsWith('progression-family-')],
];

function gameDetails(game) {
  if (game.details) return game.details;
  if (game.id === 'pattern-mode-combinations') return 'Deals a key, one of the seven major-scale modes, a 7-tone melodic combination, and its Base 0 formula.';
  if (game.id.startsWith('technique-')) return 'Deals a key, the named subject deck, a picking technique, and matching Base 0 reference.';
  if (game.id.startsWith('pattern-')) return 'Deals a key, the named subject deck, a melodic pattern, and matching Base 0 reference.';
  if (game.id.startsWith('extra-pattern-')) {
    return game.name.includes('Technique')
      ? 'Deals a key, a focused subject and melodic-pattern family, a technique, and matching Base 0 reference.'
      : 'Deals a key, the named subject deck, a melodic pattern, and matching Base 0 reference.';
  }
  if (game.id === 'left-hand-practice') return 'Deals a left-hand finger sequence, a standard guitar string, and the matching normalized Base 0 pattern.';
  return 'Deals a key, a right-hand picking pattern for the selected string count, and a picking technique.';
}

// Expandable entry; the long documentation is built the first time it is opened
function docEntry(title, lead, buildDoc, sections, href) {
  const box = document.createElement('details');
  box.className = 'reference-entry game-doc';
  const summary = document.createElement('summary');
  const heading = document.createElement('h3');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = lead;
  summary.append(heading, copy);
  box.appendChild(summary);
  let filled = false;
  box.addEventListener('toggle', () => {
    if (!box.open || filled) return;
    filled = true;
    let doc = null;
    try { doc = buildDoc(); } catch (error) { console.error(error); }
    if (!doc) {
      const p = document.createElement('p');
      p.className = 'doc-missing';
      p.textContent = 'Documentation for this entry is not available.';
      box.appendChild(p);
      return;
    }
    if (href) {
      const open = document.createElement('a');
      open.className = 'doc-open';
      open.href = href;
      open.textContent = 'Open in Play →';
      box.appendChild(open);
    }
    sections.forEach(([label, key]) => {
      const value = doc[key];
      if (!value || (Array.isArray(value) && !value.length)) return;
      const part = document.createElement('section');
      const h = document.createElement('h4');
      h.textContent = label;
      part.appendChild(h);
      if (Array.isArray(value)) {
        const list = document.createElement('ul');
        value.forEach(item => {
          const li = document.createElement('li');
          if (String(item).includes('\n')) { const pre = document.createElement('pre'); pre.textContent = item; li.appendChild(pre); }
          else li.textContent = item;
          list.appendChild(li);
        });
        part.appendChild(list);
      } else {
        const p = document.createElement('p');
        p.textContent = value;
        part.appendChild(p);
      }
      box.appendChild(part);
    });
  });
  return box;
}

// Theory lessons: one full lesson per deck, in deck order
const lessonList = document.getElementById('lesson-list');
if (lessonList) {
  lessonList.classList.add('doc-list');
  DECK_SUMMARIES.forEach(([id, name]) => {
    const lesson = LESSONS[id];
    if (lesson) lessonList.appendChild(docEntry(name + ' · ' + lesson.title, lesson.concept.split('. ')[0] + '.', () => lesson, LESSON_SECTIONS, 'play.html#' + id));
  });
}

const deckList = document.getElementById('deck-list');
deckList.classList.add('doc-list');
DECK_SUMMARIES.forEach(([id, name, detail]) => deckList.appendChild(docEntry(name, detail, () => deckDoc(id), DECK_DOC_SECTIONS, 'play.html#' + id)));

const gameList = document.getElementById('game-list');
const gameGroups = document.createElement('div');
gameGroups.className = 'game-groups';
GAME_GROUPS.forEach(([label, matches]) => {
  const games = GAMES.filter(matches);
  if (!games.length) return;
  const section = document.createElement('section');
  section.className = 'game-group';
  const heading = document.createElement('h3');
  heading.textContent = label + ' · ' + games.length;
  section.appendChild(heading);
  games.forEach(game => section.appendChild(docEntry(game.name, gameDetails(game), () => gameDoc(game), DOC_SECTIONS, 'play.html#game=' + game.id)));
  gameGroups.appendChild(section);
});
gameList.appendChild(gameGroups);
})(window.TD = window.TD || {});
