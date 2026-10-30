(function (TD) {
'use strict';
// Long-form reference documentation for every game, with worked examples computed in C
const { DECKS } = TD['decks.js'];
const { buildFibProgression } = TD['fibonacci.js'];
const { buildFibCombo, FIB_BEATS } = TD['fibcombos.js'];
const { rightHandTab } = TD['data/righthand.js'];

const C_MAJOR = { l: 0, acc: 0, name: 'C', pc: 0 };
const A_MINOR = { l: 5, acc: 0, name: 'A', pc: 9 };
const deck = (id) => DECKS.find(d => d.id === id);
const valueOf = (t) => typeof t === 'object' ? (t.k ? t.k + ' · ' : '') + t.v : t;
const C_KEY = deck('keys').cards[0];

const SUBJECTS = {
  intervals: {
    noun: 'interval', idx: [5, 9, 14],
    use: 'Intervals are the atoms of harmony and melody. Hearing and fretting them instantly in any key is what lets you find chord tones, harmonise a melody in 3rds or 6ths, and play what you hear.',
    comp: 'Build a hook from a single interval (a rising 4th, a falling minor 3rd) and repeat it on different scale degrees. Use the dealt interval as the defining leap of a melody, or as a two-note "dyad" riff that drives a song section.',
    impro: 'Target the dealt interval inside a solo: play it from every chord tone of the progression, or use it as a "signature" leap you return to. Interval-based lines sound more intentional than running scales.',
    vary: 'Play the interval melodically (one note after the other) and harmonically (both together); ascending and descending; on adjacent strings, then with one string skipped; in every octave on the neck.',
  },
  romannumerals: {
    noun: 'Roman numeral root', idx: [4, 6, 9],
    use: 'Roman numerals describe chords by their function in a key rather than by letter, so a progression learned once works in all twelve keys. Linking each interval to its numeral connects melody distance to harmonic function.',
    comp: 'Write progressions by numeral first (e.g. I–vi–IV–V) and only then pick a key. The dealt numeral is a chord to include or pivot through in your next section.',
    impro: 'Knowing the numeral of the current chord tells you which scale degrees are chord tones and which are tensions — the basis of "playing the changes".',
    vary: 'Play the root, then the full diatonic triad on that root, then its 7th chord; compare the major-key and minor-key reading of the same root.',
  },
  triads: {
    noun: 'triad', idx: [0, 1, 5],
    use: 'Triads are the core of almost all harmony. Small three-string triad shapes, and their inversions, are the fastest way to map the fretboard and the most useful voicings in a band setting.',
    comp: 'Use the triad and its inversions to voice-lead a progression smoothly (move each voice the shortest distance). Inversions create bass lines; suspended and altered triads add colour without clutter.',
    impro: 'Arpeggiate the triad over the matching chord to outline the harmony, or superimpose it (e.g. a D major triad over C for a Lydian sound). Triad pairs make strong, modern-sounding lines.',
    vary: 'Play it on every set of three adjacent strings; root position, 1st and 2nd inversion; as a broken arpeggio, a strum, and a finger-picked pattern.',
  },
  tetrads: {
    noun: 'four-note chord', idx: [0, 1, 2],
    use: 'Seventh, sixth and add chords are the vocabulary of jazz, soul, R&B, bossa and modern pop. Four notes give a chord a clear function (major 7 = rest, dominant 7 = tension, minor 7 = soft motion).',
    comp: 'Replace plain triads in a progression with the dealt colour (Cmaj7 instead of C, Am9 instead of Am). Inverted four-note chords create walking inner voices and "drop" voicings.',
    impro: 'Arpeggiate the four-note chord as a target-note map: the 3rd and 7th are the strongest notes for spelling the harmony; the extensions are colour notes to land on.',
    vary: 'Drop-2 and drop-3 voicings, shell voicings (1–3–7), all four inversions, and arpeggios spanning two octaves.',
  },
  scales5: {
    noun: 'five-tone scale', idx: [0, 1, 4],
    use: 'Pentatonic and other five-note scales have no harsh half-steps in most forms, so they sound good over many chords. They are the backbone of rock, blues, country, folk and many world traditions.',
    comp: 'Write riffs and vocal-style melodies with only five notes: limitation produces memorable hooks. Rotations of the same scale give related moods for verse and chorus.',
    impro: 'Use the scale as a safe "home base" over a key, then add the missing notes as passing tones. Moving the same shape to start on different degrees (rotations) gives new colours with no new fingerings.',
    vary: 'One-octave, two-octave and three-notes-per-string shapes; horizontal (one string) runs; groups of 3 and 4; the 2nd and 3rd rotations included in the deck.',
  },
  scales6: {
    noun: 'six-tone scale', idx: [0, 1, 3],
    use: 'Hexatonic scales sit between pentatonic and full seven-note scales: richer than pentatonic, but still avoiding a clash note. Whole-tone, blues and augmented scales live here.',
    comp: 'Use a six-note scale to give a section a distinctive but singable colour; the missing note becomes a deliberate "surprise" note for a climax.',
    impro: 'Great for sounding modern without wrong notes: e.g. a major hexatonic avoids the 4th or 7th that can clash over certain chords.',
    vary: 'Play in 3rds, in groups of three, as two interlocking triads, and across all rotations.',
  },
  scales7: {
    noun: 'seven-tone scale', idx: [0, 5, 10],
    use: 'Seven-note scales are the full colour palettes of Western and many world musics: major, the minors, the modes and exotic scales like double harmonic.',
    comp: 'Choose a scale to set the emotional world of a piece. Harmonise it in 3rds to generate its seven diatonic chords, then write a progression from them.',
    impro: 'Each scale fits particular chords (e.g. Lydian over maj7♯11, altered over 7alt). Practising the dealt scale in context builds the chord-scale map improvisers rely on.',
    vary: 'Three-notes-per-string, CAGED positions, single-string, sequences in 3rds/4ths, and the rotations in the deck.',
  },
  modes: {
    noun: 'mode', idx: [0, 1, 4],
    use: 'Modes are the same notes re-centred on a new tonic, each with its own mood: Dorian (soulful minor), Phrygian (dark/Spanish), Lydian (dreamy), Mixolydian (bluesy major) and more.',
    comp: 'Write over a drone or a two-chord vamp that highlights the characteristic note of the mode (Dorian 6, Lydian ♯4, Mixolydian ♭7).',
    impro: 'Over a static chord, the mode determines the sound. Lean on the characteristic note so the listener hears the mode rather than plain major or minor.',
    vary: 'Play each mode from the same root ("parallel") and from the same parent scale ("relative"); compare how the characteristic note changes the mood.',
  },
  melodicpatterns: {
    noun: 'melodic pattern', idx: [0, 6, 12],
    use: 'Patterns (sequences, arpeggios, motifs) turn scales into music and build picking and fretting coordination. Retrograde and inversion versions train you to vary a single idea.',
    comp: 'Treat the pattern as a motif: state it, sequence it up a step, invert it, play it backwards. Classical, metal and jazz writers all develop melodies this way.',
    impro: 'Patterns give your fingers ready-made shapes for fast passages; break out of them mid-phrase so they sound like music rather than exercises.',
    vary: 'Original, retrograde and inversion; different rhythms (triplets, 16ths); starting on each scale degree; one-string and across-strings.',
  },
  andalusian: {
    noun: 'Andalusian progression', idx: [1, 0, 6],
    use: 'The descending i–♭VII–♭VI–V cadence is the sound of flamenco and countless rock and pop songs. It teaches the Phrygian-dominant V chord and strong bass-line motion.',
    comp: 'Use it as a chorus loop or a dramatic turnaround; the 7th-chord and extended-colour versions in the deck give jazzier re-harmonisations of the same motion.',
    impro: 'Play A natural minor over i–♭VII–♭VI, then switch to A Phrygian dominant (raised 3rd of the V chord, G♯) over E — that one-note change is the whole flavour.',
    vary: 'Triads, 7th chords and extended colours; ascending and descending forms; strummed, rasgueado, or arpeggiated.',
  },
  deceptive: {
    noun: 'deceptive progression', idx: [0, 3, 8],
    use: 'Deceptive cadences set up the expectation of home (I) and then go elsewhere. They teach you how surprise and delay create emotion.',
    comp: 'End a phrase with the deceptive move to extend a section, or to pivot into a new key or the bridge.',
    impro: 'Anticipate the "wrong" chord: aim for a note that is common to both the expected and the actual chord so your line sounds smooth through the surprise.',
    vary: 'As written, with 7th chords, with extended colours; with different bass notes; at different tempos and feels.',
  },
  majorminor: {
    noun: 'major/minor progression', idx: [0, 2, 6],
    use: 'Mixing major and minor (borrowed chords, modal interchange) is how songwriters create bittersweet colour, from the Beatles to film scores.',
    comp: 'Borrow a chord from the parallel minor (iv, ♭VI, ♭VII) into a major progression to darken one moment of a song.',
    impro: 'Switch scale with the chord: major scale over the major-key chords, the parallel minor or Mixolydian over the borrowed ones.',
    vary: 'Triads, 7ths, extended colours; with a pedal bass; with each chord held for different lengths.',
  },
  blues: {
    noun: 'blues progression', idx: [0, 1, 3],
    use: 'The blues is the root of rock, jazz, soul and funk. Its dominant-7 chords and call-and-response phrasing are essential vocabulary.',
    comp: 'Use the dealt variation as the frame of a 12-bar song or riff; 9th and 13th versions give a jazz or funk colour.',
    impro: 'Mix minor pentatonic, major pentatonic and chord-tone arpeggios; follow the change to the IV chord by targeting its 3rd.',
    vary: 'Shuffle vs straight feel; quick-change; 7th, 9th and 13th voicings; different turnarounds.',
  },
};

const PATTERN_GROUPS = {
  'Linear': 'stepwise scale runs — they build evenness and speed',
  'Sequences': 'a short cell repeated on successive scale degrees — the classic way to make a scale sound melodic',
  'Arpeggios': 'chord tones played one at a time — they outline harmony',
  'Motifs': 'short memorable figures (turns, neighbour notes, calls) — the seeds of melodies',
  'Longer Lines': 'extended phrases that build stamina and phrasing over a wider range',
  'Interval Leaps': 'wide skips that break up stepwise playing and train string-crossing',
  'Pentatonic Lines': 'five-note phrases with a vocal, bluesy shape',
  'Chromatic Color': 'passing and approach notes outside the scale — the jazz and blues "in-between" sound',
  'Sequence Variations': 'reordered or displaced sequences that avoid predictability',
  'Contour Studies': 'lines defined by their up-and-down shape — waves, arches and answers',
};

const SECTIONS = [['Application', 'app'], ['Usefulness', 'use'], ['Variations', 'vary'], ['Application for composition', 'comp'], ['Application for improvisation', 'impro'], ['Examples in C', 'ex']];

function subjectExamples(subjectId, tonic, count = 3) {
  const d = deck(subjectId);
  const info = SUBJECTS[subjectId] || { idx: [0, 1, 2] };
  return info.idx.slice(0, count).map(i => d.cards[Math.min(i, d.cards.length - 1)]).map(card => card.title + ': ' + valueOf(card.transpose(tonic)));
}

function patternExamples(group, tonic) {
  const cards = deck('melodicpatterns').cards.filter(c => !group || c.group === group);
  return [cards[0], cards[Math.floor(cards.length / 3)]].filter(Boolean).map(c => c.title + ': ' + c.transpose(tonic));
}

const tech = (i) => deck('techniques').cards[i].title;

function docTechnique({ subjectId }) {
  const s = SUBJECTS[subjectId];
  const tonic = subjectId === 'andalusian' ? A_MINOR : C_MAJOR;
  const ex = subjectExamples(subjectId, tonic);
  return {
    app: 'Three cards are dealt: a key, a ' + s.noun + ' and a guitar technique, plus the Base 0 (key-independent) formula of the ' + s.noun + '. Find the ' + s.noun + ' in the dealt key, play it cleanly, then play it again using only the dealt technique. Redraw any single card with its button, or press Deal again for a fresh combination.',
    use: s.use + ' Pairing it with a random technique stops you from always playing the same material the same way, and links theory directly to physical skill.',
    vary: s.vary + ' Change tempo (slow with a metronome, then faster), play it in two positions on the neck, or combine two dealt techniques.',
    comp: s.comp + ' The dealt technique suggests a texture: palm-muted, legato, slide or harmonics versions of the same idea can be different sections of a song.',
    impro: s.impro + ' Practising each idea with many techniques gives you more ways to express it when you improvise.',
    ex: [
      'Key: C major (C D E F G A B)' + (subjectId === 'andalusian' ? ', played from the relative minor, A minor' : ''),
      ...ex.map((e, i) => e + ' — with ' + tech([0, 18, 25][i]) + '.'),
    ],
  };
}

function docPattern({ subjectId, patternGroup, withTechnique }) {
  const s = SUBJECTS[subjectId];
  const tonic = subjectId === 'andalusian' ? A_MINOR : C_MAJOR;
  const groupText = patternGroup ? patternGroup + ' patterns (' + PATTERN_GROUPS[patternGroup] + ')' : 'a melodic pattern from any family';
  const ex = subjectExamples(subjectId, tonic, 2);
  const pats = patternExamples(patternGroup, tonic);
  return {
    app: 'Deals a key, a ' + s.noun + ', ' + groupText + (withTechnique ? ', a technique' : '') + ' and the Base 0 formula. Play the ' + s.noun + ' in the dealt key, then play the pattern using those notes. The pattern\'s scale degrees are spelled in the key on its card' + (withTechnique ? '; perform the whole thing with the dealt technique.' : '.'),
    use: s.use + ' Running it through ' + (patternGroup ? patternGroup.toLowerCase() + ' patterns' : 'melodic patterns') + ' turns a static shape into musical lines.',
    vary: s.vary + ' Apply the pattern in its retrograde (backwards) and inverted (mirrored) forms, which are included in the pattern deck.' + (withTechnique ? ' Swap the technique while keeping the same pattern.' : ''),
    comp: s.comp + ' The pattern gives you a ready-made motif shape to develop over the ' + s.noun + '.',
    impro: s.impro + ' Patterns are building blocks for lines: start one, then break off and resolve to a chord tone.',
    ex: [
      'Key: C major' + (tonic === A_MINOR ? ' (the Andalusian cadence is read from the relative minor, A minor)' : ''),
      ...ex.map(e => s.noun.charAt(0).toUpperCase() + s.noun.slice(1) + ' — ' + e),
      ...pats.map(p => 'Pattern — ' + p),
      ...(withTechnique ? ['Technique — e.g. ' + tech(0) + ' or ' + tech(25)] : []),
    ],
  };
}

function docModeCombo() {
  const modes = deck('modes').cards.slice(0, 7);
  const ion = modes[0].transpose(C_MAJOR).split(' ');
  const dor = modes[1].transpose({ l: 1, acc: 0, name: 'D', pc: 2 });
  return {
    app: 'Deals a key, one of the seven modes of the major scale, and a 7-tone Base 0 pattern of scale positions (0 = the mode\'s first note, 7 = its octave). Translate the positions into notes of the mode and play them in order.',
    use: 'Base 0 patterns separate the shape of a line from its notes, so one pattern can be heard in every mode and key. It is the clearest way to hear how the mode alone changes the mood.',
    vary: 'Keep the pattern and change only the mode; keep the mode and change the pattern; play positions as chord stacks instead of melodies.',
    comp: 'Write a motif as positions (e.g. 0-2-4-4-5) and apply it in different modes for contrasting sections that share DNA.',
    impro: 'Practising position patterns makes you think in scale degrees, which transfers to any key or mode instantly.',
    ex: ['C Ionian: ' + ion.join(' '), 'Pattern 0-2-4 in C Ionian: ' + [0, 2, 4].map(p => ion[p]).join(' '), 'D Dorian (same notes, new centre): ' + dor],
  };
}

function docLeftHand() {
  return {
    app: 'Deals an ordered left-hand finger sequence (1 = index … 4 = pinky), a string, and its Base 0 offsets. Place finger 1 on any fret of the dealt string; the other fingers fall one fret each above it (one finger per fret), and play the fingers in the dealt order.',
    use: 'Builds finger independence, strength and accuracy for every combination — the physical foundation of clean scales, legato and chords.',
    vary: 'Pick every note, then play it legato (hammer-ons and pull-offs); move up the neck one fret at a time; repeat on every string; use a metronome and raise the tempo gradually.',
    comp: 'Finger sequences that feel natural often become riffs. Combine a dealt sequence with a key to turn a "spider" exercise into a chromatic motif.',
    impro: 'Familiar finger shapes let you play chromatic passing tones and fast legato runs without thinking.',
    ex: ['Sequence 1-3-2-4 on string 2 (B) starting at fret 1 (C): C – D – C♯ – D♯', 'Base 0 of 1-3-2-4: 0 +2 +1 +3', 'Sequence 4-3-2-1 on string 5 (A) with finger 1 at fret 3 (C): E♭ – D – C♯ – C'],
  };
}

function docRightHand() {
  return {
    app: 'Deals a key, a right-hand picking path across the strings (a string number per note) for the string count you select, and a technique. A tab shows which string to pick on each step. Play the open strings first, then fret notes from the dealt key while keeping the same picking path.',
    use: 'Right-hand precision across strings is what makes arpeggios, cross-picking and fingerstyle sound clean. Every possible path is in the deck, so you cover patterns you would never think to practise.',
    vary: 'Alternate picking, economy picking, hybrid picking or fingers; change the string count selector; accent the first note of each group.',
    comp: 'Picking paths over a chord shape become arpeggio accompaniment patterns (like Travis picking or post-rock arpeggios).',
    impro: 'Confident string-crossing lets you play wide-interval lines and arpeggios at speed.',
    ex: ['Path 5-4-3-2 over an open C chord (x32010): C – E – G – C', 'Tab for 6432:\n' + rightHandTab('6432', 6)],
  };
}

function docFib({ spec }) {
  const p = buildFibProgression(spec, C_KEY, 3);
  const p2 = buildFibProgression(spec, C_KEY, 6);
  const show = (x) => x.chords.map((c, i) => c.name + (x.beats ? ' (' + x.beats[i] + (x.beats[i] === 1 ? ' beat)' : ' beats)') : '')).join(' – ') + '  [' + x.chords.map(c => c.numeral).join('–') + ']  from terms ' + x.terms.join(', ');
  return {
    app: 'Deals a key, a chord progression generated from Fibonacci numbers, and a card listing the numbers used. ' + spec.desc + ' Play through the chords, looping the progression, and redraw the progression or key to explore new sequences.',
    use: 'The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13…, each number the sum of the previous two) produces progressions that are ordered but not predictable — you meet chord moves you would rarely choose by habit, while staying inside one key.',
    vary: 'Start the sequence at a different term (Deal again does this); play triads then 7ths; loop only the first four chords; apply the Fibonacci beat lengths 1-1-2-3-5 to any progression; play it in the relative or parallel key.',
    comp: 'Use the result as a verse, bridge or interlude. Edit freely: keep the chords you like, repeat the strongest two-chord move as a hook, and end on I (or i) for closure. The golden-rhythm and Pisano variants supply ready-made phrase lengths.',
    impro: 'Improvise over the loop by targeting the 3rd of each new chord. Because the chords come from one scale, the parent scale always works; arpeggios reveal each chord\'s colour.',
    ex: [p.tonicLabel + ': ' + show(p), 'Another start, ' + p2.tonicLabel + ': ' + show(p2)],
  };
}

function docFibCombo({ family, method, size, sizeName }) {
  const examples = [0, 3].map(modeIndex => {
    const r = buildFibCombo(family, modeIndex, method[0], size, C_MAJOR, 5 + modeIndex);
    return 'C ' + r.modeName + ': ' + r.notes.map((n, i) => n.name + (method[0] === 'rhythm' ? ' (' + FIB_BEATS[i] + ')' : '')).join(' ') + '  [degrees ' + r.notes.map(n => n.degree).join(' ') + ']';
  });
  const kind = size === 2 ? 'an interval (two notes)' : size === 3 ? 'a three-note set (triad)' : 'a ' + size + '-note set';
  const role = size === 2
    ? 'Intervals are the smallest building block; Fibonacci-chosen intervals give leaps you might not otherwise practise.'
    : size === 3 ? 'Three-note sets include true triads and clustered or quartal shapes, all strictly from the mode.'
    : 'Larger sets make motifs, voicings and short scale fragments that carry the mode\'s colour.';
  return {
    app: 'Deals a key, a mode of the ' + family.name.toLowerCase() + ', ' + kind + ' chosen by Fibonacci numbers, and the Fibonacci terms used. ' + method[2] + ' Notes are drawn from two octaves of the mode (↑ marks the upper octave). Play the notes, then redraw the mode while keeping the same key to hear how the colour changes.',
    use: role + ' Because every note belongs to the dealt mode, the results always sound "in", yet the Fibonacci choice breaks habitual finger patterns and fresh-sounding shapes appear.',
    vary: 'Other methods for the same size: Walk (melodic order), Steps (Fibonacci numbers as step sizes), Golden Skip (stacked low to high), Rhythm (1-1-2-3-5-8 beat lengths). Also play the set as a chord, as an arpeggio up and down, in both octaves, and in every mode of the family.',
    comp: 'Use the set as a motif or chord voicing for a piece in the dealt mode; re-deal the mode to write a contrasting section from the same idea. ' + (family.id === 'hirajoshi' ? 'Hirajoshi modes evoke Japanese koto music and are popular in metal and film scores.' : family.id === 'penta' ? 'Pentatonic material is ideal for vocal hooks and riffs.' : 'Modal sets suit drones and two-chord vamps.'),
    impro: 'Memorise one dealt set as a "cell" and move it through the mode while you improvise; the Rhythm version teaches phrasing with long and short notes.',
    ex: examples,
  };
}

function docProgressionFamily({ family }) {
  const samples = [family.cards[0], family.cards[10], family.cards[20]].filter(Boolean);
  const home = family.minor ? 'A minor' : 'C major';
  return {
    app: 'Deals a major key, a progression from the ' + family.name + ' family, a guitar technique and a Base 0 chord-root formula. The family has 30 cards: ten related harmonic forms, each in triad, seventh and extended-color voicings. Choose a progression manually or shuffle it; the card transposes to the dealt key and can be played together or as an arpeggio.',
    use: family.description + ' The family keeps its characteristic cadence or bass motion while its related cards offer controlled alternatives for practice and songwriting.',
    vary: 'Compare the triad, seventh and extended-color versions of one form; keep the progression and change only the key or guitar technique; use the manual chooser to repeat a specific card, or shuffle each slot independently.',
    comp: 'Choose a progression as a verse or chorus foundation. Keep its bass motion, then substitute a related card for a pre-chorus, bridge or turnaround. Voice-lead each chord by moving each note the shortest distance.',
    impro: 'Loop the dealt progression. Target each chord’s 3rd and 7th as it changes, then connect those guide tones with notes from the dealt key. Use the technique card to vary articulation without changing the harmony.',
    ex: samples.map((card, index) => ['Triad', 'Seventh', 'Extended color'][index] + ' · ' + card.title + ': ' + card.sub).concat(['Example home: ' + home + '; every card can be transposed to the selected major key.']),
  };
}

const PLAYABLE = (TD['sound.js'] || {}).PLAYABLE_DECKS || [];

const DEALING = ' The dealt key card plays its scale, string cards their open string and right-hand cards their picking path; the + Octave switch on any card adds the octave to all playback. Every changeable card has a 🔀 button that deals a new random card from a shuffle bag (every card appears once before any repeat, using the browser\'s cryptographic random generator), plus a manual chooser below it: ◀ / ▶ step through the deck and the list (or number box, for very large decks) picks any card directly. "Deal again" redraws every card at once and silences any card still sounding. Existing deck pools respect the Settings page; generated progression-family pools contain their own 30 progression cards.';

function gameDoc(game) {
  const doc = baseGameDoc(game);
  if (!doc) return doc;
  const m = game.meta || {};
  const playable = (m.kind === 'technique' || m.kind === 'pattern') && PLAYABLE.includes(m.subjectId);
  const which = m.kind === 'modecombo' ? 'the mode and the 7-tone pattern cards'
    : m.kind === 'fib' ? 'the progression card (chord by chord, smoothly voice-led)'
    : m.kind === 'fibcombo' ? 'the mode card and the dealt note-set card'
    : m.kind === 'progression-family' ? 'the common-progression card'
    : playable && m.kind === 'pattern' ? 'the subject and melodic-pattern cards'
    : m.kind === 'pattern' ? 'the melodic-pattern card'
    : playable ? 'the subject card' : null;
  const play = which ? ' The ▶ Together / ▶ Arpeggio buttons on ' + which + ' play the dealt notes at exact pitch in the dealt key (simultaneously or one note at a time).' : '';
  const random = m.kind === 'fib' || m.kind === 'fibcombo'
    ? ' Starting terms are drawn from one full Pisano period (the length after which Fibonacci numbers mod n repeat), so every distinct deal comes up before any repeats.'
    : '';
  return { ...doc, app: doc.app + play + DEALING + random };
}

function baseGameDoc(game) {
  const m = game.meta || {};
  if (m.kind === 'technique') return docTechnique(m);
  if (m.kind === 'pattern') return docPattern(m);
  if (m.kind === 'modecombo') return docModeCombo();
  if (m.kind === 'lefthand') return docLeftHand();
  if (m.kind === 'righthand') return docRightHand();
  if (m.kind === 'fib') return docFib(m);
  if (m.kind === 'fibcombo') return docFibCombo(m);
  if (m.kind === 'progression-family') return docProgressionFamily(m);
  return null;
}

TD['gamedocs.js'] = { gameDoc, DOC_SECTIONS: SECTIONS };
})(window.TD = window.TD || {});
