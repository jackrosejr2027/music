(function (TD) {
'use strict';
const { progressionCards } = TD['data/progressions.js'];
const { spell } = TD['theory.js'];
const { renderProgressionFamilyGame } = TD['game.js'];
const C_MAJOR = { l: 0, acc: 0 };
const A_MINOR = { l: 5, acc: 0 };
const ROMANS = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };
const TOKEN = /^([♭♯#]*)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(.*)$/;
const MAJOR_CHOICES = {
  I: ['vi', 'iii', 'IV', 'V'], ii: ['IV', 'vi', 'vii°', 'V'], iii: ['I', 'vi', 'V', 'IV'],
  IV: ['ii', 'iv', 'vi', 'I'], V: ['I', 'vi', 'iii', '♭VII'], vi: ['I', 'iii', 'IV', 'ii'],
  'vii°': ['V', 'I', 'iii'], '♭II': ['I', 'V', '♭VII'], '♭III': ['I', 'IV', 'vi'],
  '♭VI': ['IV', 'ii', '♭VII'], '♭VII': ['IV', 'I', 'V', '♭VI'], iv: ['IV', 'ii', '♭VI'],
  II: ['V', 'IV', 'vi'], III: ['I', 'vi', 'IV'], VI: ['ii', 'IV', 'I'], VII: ['V', 'I', 'iii'],
};
const MINOR_CHOICES = {
  i: ['♭III', '♭VI', 'iv', '♭VII'], 'ii°': ['iv', '♭II', 'V', 'i'], '♭II': ['i', 'iv', '♭VII', 'V'],
  '♭III': ['i', '♭VI', 'iv', '♭VII'], iv: ['♭VI', 'ii°', 'i', 'V'], V: ['i', '♭VII', '♭III', '♭VI'],
  v: ['i', '♭VII', '♭III', 'iv'], '♭VI': ['iv', '♭VII', 'i', '♭III'], '♭VII': ['V', '♭VI', 'i', '♭III'],
  III: ['i', 'iv', '♭VII'], VI: ['iv', 'i', '♭VII'], VII: ['i', '♭III', 'iv'],
};
const FAMILY_DEFS = [
  ['Pop anthem', 'I–V–vi–IV', false, 'Four-chord major-key loop heard across pop, rock and film songs.'],
  ['Pop descending lift', 'vi–IV–I–V', false, 'Relative-minor opening that rises into a major-key resolution.'],
  ['Doo-wop turnaround', 'I–vi–IV–V', false, 'The 1950s tonic, relative-minor, subdominant and dominant cycle.'],
  ['Four-chord cadence', 'I–IV–V–I', false, 'A direct tonic–subdominant–dominant return.'],
  ['Folk tonic cycle', 'I–IV–I–V', false, 'A tonic-led folk and country frame with an open dominant ending.'],
  ['Rock backcycle', 'I–V–IV–I', false, 'A descending dominant-to-subdominant rock resolution.'],
  ['Indie mediant lift', 'I–iii–IV–V', false, 'A minor mediant adds a softer step before the big cadence.'],
  ['City-pop turnaround', 'I–vi–ii–V', false, 'A smooth pop-jazz turnaround through the relative minor.'],
  ['Classic ii–V–I', 'ii–V–I', false, 'The essential jazz predominant–dominant–tonic cadence.'],
  ['Jazz deceptive cadence', 'ii–V–I–vi', false, 'A jazz cadence that continues into the relative minor.'],
  ['Jazz turnaround', 'I–vi–ii–V', false, 'A familiar four-chord turnaround that leads back to the tonic.'],
  ['Circle-of-fifths cycle', 'iii–vi–ii–V', false, 'A descending-fifths chain that builds toward the dominant.'],
  ['Extended circle cycle', 'I–iii–vi–ii–V', false, 'A longer circle sequence with a clear tonic opening.'],
  ['Major-key variation', 'I–IV–vi–V', false, 'A major subdominant frame with a relative-minor middle.'],
  ['Descending bass line', 'vi–V–IV–I', false, 'A descending scale-like bass shape that settles on the tonic.'],
  ['Pachelbel canon', 'I–V–vi–iii–IV–I–IV–V', false, 'The eight-chord ground-bass pattern associated with Pachelbel’s Canon.'],
  ['Canon short loop', 'I–V–vi–iii', false, 'The opening four chords of the repeating canon progression.'],
  ['Stepwise folk rise', 'I–ii–iii–IV', false, 'A stepwise diatonic ascent from tonic through the subdominant.'],
  ['Mediant-side cycle', 'I–iii–IV–ii', false, 'A mediant opening and a minor predominant color before the cadence.'],
  ['Subdominant opening', 'IV–I–V–vi', false, 'A plagal opening that moves through tonic and dominant.'],
  ['Royal Road', 'IV–V–iii–vi', false, 'The Japanese pop/anime progression, often called the Royal Road progression.'],
  ['Relative-minor ascent', 'vi–iii–IV–I', false, 'A relative-minor opening that climbs through a major resolution.'],
  ['Dominant-subdominant loop', 'I–V–IV–V', false, 'A repeatable rock and roots loop with a dominant-led return.'],
  ['Mixolydian rock vamp', 'I–♭VII–IV–I', false, 'A major tonic colored by the characteristic Mixolydian flat seventh.'],
  ['Mixolydian dominant frame', 'I–♭VII–IV–V', false, 'A flat-seventh rock movement that turns toward the dominant.'],
  ['Modal descending color', 'I–♭VII–♭VI–IV', false, 'A descending modal sequence with a broad subdominant landing.'],
  ['Rock minor-mode mixture', 'I–♭III–♭VII–IV', false, 'Major-key rock colored by borrowed parallel-minor chords.'],
  ['Backdoor major cadence', 'I–♭VI–♭VII–I', false, 'A cinematic backdoor approach using borrowed flat-six and flat-seven chords.'],
  ['Borrowed minor IV', 'I–IV–iv–I', false, 'The classic major-to-minor subdominant shift and return.'],
  ['Minor-IV dominant setup', 'I–IV–iv–V', false, 'A borrowed minor subdominant darkens the approach to V.'],
  ['Borrowed-color cadence', 'I–♭VI–iv–V', false, 'Parallel-minor predominant colors lead into a major dominant.'],
  ['Phrygian upper-neighbor', 'I–♭II–I', false, 'A chromatic flat-two chord presses against the tonic before release.'],
  ['Lydian major-II', 'I–II–V–I', false, 'A raised-second major chord adds a bright Lydian lift.'],
  ['Andalusian cadence', 'i–♭VII–♭VI–V', true, 'The descending minor-key Andalusian cadence with its major V turnaround.'],
  ['Minor tonic cycle', 'i–♭VI–♭VII–i', true, 'A natural-minor cycle that returns home through flat-six and flat-seven.'],
  ['Minor-key cadence', 'i–iv–V–i', true, 'A minor tonic–predominant–dominant cadence.'],
  ['Minor cinematic descent', 'i–♭III–♭VII–♭VI', true, 'A broad natural-minor descent used for dramatic song and score writing.'],
  ['Minor circle color', 'i–iv–♭VII–♭III', true, 'A minor opening that moves through a modal circle-of-fifths color.'],
  ['Phrygian cadence', 'i–♭II–♭VII–i', true, 'The Phrygian flat-two sound returning through the flat seventh.'],
  ['Dorian minor vamp', 'i–IV–v–i', true, 'A Dorian vamp featuring the characteristic major IV chord.'],
  ['Minor Mixolydian turn', 'i–♭VII–IV–i', true, 'A minor tonic with a major IV and modal flat-seven approach.'],
  ['Minor modal ascent', 'i–♭III–♭VI–♭VII', true, 'An ascending natural-minor sequence of major borrowed chords.'],
  ['Minor iv–V turnaround', 'i–iv–♭VI–V', true, 'A minor predominant and flat-six color setting up a strong major V.'],
  ['Twelve-bar blues', 'I7–I7–I7–I7–IV7–IV7–I7–I7–V7–IV7–I7–V7', false, 'A standard twelve-bar dominant-seventh blues skeleton.'],
  ['Quick-change blues', 'I7–IV7–I7–I7–IV7–IV7–I7–I7–V7–IV7–I7–V7', false, 'A twelve-bar blues with the early-bar quick change to IV.'],
  ['Eight-bar blues', 'I7–I7–IV7–IV7–I7–V7–I7–V7', false, 'A compact eight-bar blues framework with a turnaround ending.'],
  ['Minor twelve-bar blues', 'i7–i7–i7–i7–iv7–iv7–i7–i7–V7–iv7–i7–V7', true, 'A minor twelve-bar blues with a major dominant turnaround.'],
  ['Ragtime turnaround', 'I–VI7–II7–V7', false, 'A chain of secondary dominants closing with a classic ragtime turnaround.'],
  ['Gospel plagal cadence', 'I–IV–I–V–I', false, 'A tonic-centered gospel cadence with a strong plagal IV return.'],
  ['Rhythm changes bridge', 'III7–VI7–II7–V7', false, 'The dominant cycle used by the bridge of rhythm-changes standards.'],
];

function parsedToken(token) {
  const match = String(token).match(TOKEN);
  if (!match) return null;
  const roman = match[2];
  let accidental = 0;
  for (const mark of match[1]) accidental += mark === '♭' ? -1 : 1;
  const n = ROMANS[roman.toUpperCase()];
  return { roman, n, accidental, suffix: match[3], key: match[1] + roman };
}

function chordFor(token, minor) {
  const parsed = parsedToken(token);
  if (!parsed) return 'C';
  const tonic = minor ? A_MINOR : C_MAJOR;
  const root = spell(tonic, { n: parsed.n, acc: parsed.accidental });
  const suffix = parsed.suffix;
  let quality = parsed.roman === parsed.roman.toLowerCase() ? 'm' : '';
  if (suffix.includes('°')) quality = 'dim';
  else if (suffix.includes('ø')) quality = 'm7b5';
  else if (suffix === '7') quality += '7';
  else if (suffix === 'maj7') quality = 'maj7';
  else if (suffix) quality += suffix;
  return root + quality;
}

function alternatives(token, minor) {
  const parsed = parsedToken(token);
  const table = minor ? MINOR_CHOICES : MAJOR_CHOICES;
  const key = parsed ? parsed.key : token;
  const defaults = minor ? ['i', 'iv', 'V', '♭VI', '♭VII'] : ['I', 'ii', 'IV', 'V', 'vi'];
  return [...new Set([...(table[key] || defaults)].filter(item => item !== token))].slice(0, 4);
}

function progressionForms(formula, minor) {
  const base = formula.split('–');
  const forms = [];
  const seen = new Set();
  const add = (tokens) => {
    for (let i = 1; i < tokens.length; i++) {
      const current = parsedToken(tokens[i])?.key;
      const previous = parsedToken(tokens[i - 1])?.key;
      const basePair = parsedToken(base[i])?.key === parsedToken(base[i - 1])?.key;
      if (current && current === previous && !basePair) return;
    }
    const value = tokens.join('–');
    if (!seen.has(value)) { seen.add(value); forms.push(tokens); }
  };
  const expand = (index, tokens) => {
    if (forms.length >= 10) return;
    if (index >= base.length) { add(tokens); return; }
    const choices = index === 0 ? [base[index]] : [base[index], ...alternatives(base[index], minor)];
    for (const choice of choices) {
      expand(index + 1, [...tokens, choice]);
      if (forms.length >= 10) return;
    }
  };
  expand(0, []);
  const endings = minor ? ['i', 'V', '♭VII', 'iv'] : ['I', 'V', 'vi', 'IV'];
  for (const ending of endings) {
    if (forms.length >= 10) break;
    add([...base, ending]);
  }
  for (const ending of endings) {
    if (forms.length >= 10) break;
    add([...base, base[base.length - 1], ending]);
  }
  return forms.slice(0, 10);
}

const PROGRESSION_GAMES = FAMILY_DEFS.map(([title, formula, minor, description], index) => {
  const id = 'progression-family-' + String(index + 1).padStart(2, '0');
  const name = title + ' (' + formula + ')';
  const forms = progressionForms(formula, minor);
  const raw = forms.map((tokens, i) => {
    const line = tokens.join('–');
    const example = tokens.map(token => chordFor(token, minor)).join('–');
    return line + '|' + example + '|' + description + ' Form ' + (i + 1);
  }).join('\n');
  const cards = progressionCards(raw).slice(0, 30);
  cards.forEach(card => { card.group = name; });
  const family = { id, name, formula, minor, description, hue: (index * 29 + 18) % 360, cards };
  return {
    id,
    name: 'Progressions · ' + name,
    hue: family.hue,
    meta: { kind: 'progression-family', family },
    details: 'Deals a major key, one of 30 progressions from this common-chord family, a guitar technique, and its Base 0 chord-root formula. Each progression is transposable and has triad, seventh and extended-color cards.',
    game: (root, options) => renderProgressionFamilyGame(root, options, family),
  };
});

TD['progressiongames.js'] = { PROGRESSION_GAMES };
})(window.TD = window.TD || {});
