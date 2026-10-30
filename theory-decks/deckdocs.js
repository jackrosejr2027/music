(function (TD) {
'use strict';
// Long-form reference documentation for every card deck, with worked examples computed in C
const { DECKS } = TD['decks.js'];
const { rightHandTab } = TD['data/righthand.js'];
const { PLAYABLE_DECKS, describeSound, spellGroup, spellCard, soundFor, withOctave, midiName } = TD['sound.js'];

const C = { l: 0, acc: 0, name: 'C', pc: 0 };
const A = { l: 5, acc: 0, name: 'A', pc: 9 };
const deck = (id) => DECKS.find(d => d.id === id);
const val = (t) => typeof t === 'object' ? (t.k ? t.k + ': ' : '') + t.v : t;
const row = (card, label) => (card.rows.find(([k]) => k === label) || [])[1];
const find = (id, test) => deck(id).cards.find(test);
const pick = (id, ...titles) => titles.map(t => find(id, c => c.title === t)).filter(Boolean);
const inC = (id, ...titles) => pick(id, ...titles).map(c => c.title + ' — ' + val(c.transpose(C)));

const DOCS = {
  keys: {
    app: 'Each card is one key: the twelve major keys in circle-of-fifths order, then the twelve natural minor (Aeolian), harmonic minor and melodic minor keys, then every other mode of the major scale — Dorian, Phrygian, Lydian, Mixolydian and Locrian — on all 12 tonics, each with its notes, formula, parent major key, signature and colour note. The front shows the key and its Base 0 formula with a ▶ button that plays the tonic at its exact equal-tempered pitch (A4 = 440 Hz, octave 4). The back lists the notes, relative key, key signature and circle-of-5ths position; a third tap shows how the tonic functions as a degree in every other key.',
    use: 'Knowing every key\'s notes and signature without thinking is the foundation of transposing, reading charts, communicating with other musicians and choosing capo positions. Comparing natural, harmonic and melodic minor on the same tonic reveals exactly which notes give each its character.',
    vary: 'Say the notes aloud while fretting them; play the scale in one position, then along one string; move around the circle of fifths (each step adds one sharp or flat); play the relative minor right after its major; use the tone button as a tuning reference and sing the tonic.',
    comp: 'Choose a key for a song by its mood and by what lies well on guitar (E, A, D, G for open strings). Modulate to neighbouring keys on the circle (one accidental away) for smooth key changes, or to the relative minor for a darker bridge.',
    impro: 'Before soloing, identify the key and its relative; that gives you the parent scale and its pentatonic subset. Harmonic minor supplies the leading tone over V7 in minor; melodic minor supplies jazz minor and altered sounds.',
    ex: () => {
      const k = deck('keys').cards;
      const c = k[0], am = k.find(x => x.title === 'A minor' && x.sub === 'Natural minor key'), ah = k.find(x => x.title === 'A minor' && x.sub === 'Harmonic minor key'), amm = k.find(x => x.title === 'A minor' && x.sub === 'Melodic minor key');
      return ['C major: ' + row(c, 'Notes') + ' · signature ' + row(c, 'Key signature') + ' · relative minor ' + row(c, 'Relative minor') + ' · tonic C4 = ' + c.freq.toFixed(2) + ' Hz',
        'A natural minor (relative of C): ' + row(am, 'Notes'), 'A harmonic minor: ' + row(ah, 'Notes') + ' (raised 7th G♯)', 'A melodic minor: ' + row(amm, 'Notes') + ' (raised 6th and 7th)'].concat(['Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian'].map(m => { const x = k.find(c => c.sub === m + ' key' && c.rows[2][1].startsWith('C major')); return x ? x.title + ': ' + row(x, 'Notes') + ' · colour note ' + row(x, 'Colour note') + ' · parent C major' : ''; }).filter(Boolean));
    },
  },
  intervals: {
    app: 'Simple intervals from unison to octave, ascending then descending. Each card gives the degree (e.g. ♭3), its size in semitones (= frets on one string) and a description of its sound; the third tap lists the interval above (or below) every root.',
    use: 'Every chord, scale and melody is made of intervals. Recognising them by sound and by fretboard shape is the single biggest step towards playing by ear. Descending intervals are trained separately because they sound and feel different.',
    vary: 'Play each interval on one string (count the frets), across adjacent strings, and with one string skipped; play it harmonically and melodically; sing it; play it from every note of a scale.',
    comp: 'Build a motif from one characteristic interval (the rising major 6th of "My Bonnie", the falling minor 3rd of a playground chant) and repeat it at different pitches. Harmonise a melody in parallel 3rds or 6ths.',
    impro: 'Use interval "cells" as targets: play the 3rd and 7th of each chord, or leap a 4th or 5th to break out of scale runs.',
    ex: () => inC('intervals', 'Major 3rd', 'Perfect 5th', 'Minor 7th', 'Descending Minor 3rd', 'Descending Perfect 4th'),
  },
  'intervals-ext': {
    app: 'Compound intervals larger than an octave — 9ths, 10ths, 11ths, 12ths, 13ths, 14ths and the double octave — ascending and descending. They name the extensions in chord symbols like C9, Cm11 and C13.',
    use: 'Extended chord symbols are written with these numbers. Knowing that a 9 is a 2 an octave up, an 11 a 4 and a 13 a 6 lets you read and voice jazz, soul and pop chords instantly. Wide intervals are also great guitar voicings because strings are a 4th apart.',
    vary: 'Locate each extension relative to a chord shape you know; play it as a two-note spread voicing across two or three strings; reduce it to its simple interval and back.',
    comp: 'Add a 9th or 13th to plain chords for colour; spread voicings (10ths in particular) give a wide, piano-like sound to fingerstyle arrangements.',
    impro: 'Target extensions (9, ♯11, 13) over the matching chords for a sophisticated sound; altered extensions (♭9, ♯9, ♭13) create tension over dominant chords.',
    ex: () => inC('intervals-ext', 'Major 9th', 'Perfect 11th', 'Augmented 11th', 'Major 13th', 'Major 10th'),
  },
  romannumerals: {
    app: 'Each interval root is labelled with its Roman numeral in a major key (I ii iii IV V vi vii°) and, in the second half of the deck, in a natural minor key (i ii° III iv v VI VII). Accidentals mark chromatic (borrowed) roots such as ♭VI.',
    use: 'Numerals describe harmony by function, so one progression learned once works in all twelve keys. Players use them to transpose on the fly, read Nashville-style charts and understand why songs sound alike.',
    vary: 'Play the triad and 7th chord on each numeral; compare the major-key and minor-key numeral of the same root; spell the chord in several keys.',
    comp: 'Write progressions in numerals first (I–V–vi–IV, i–♭VI–♭III–♭VII) then choose the key that fits the singer. Borrowed numerals (♭VI, ♭VII, iv) add colour.',
    impro: 'Knowing the numeral of the current chord tells you which notes of the key are its chord tones — the core of playing through changes.',
    ex: () => pick('romannumerals', 'Perfect 4th', 'Perfect 5th', 'Minor 6th', 'Minor 3rd · Minor').map(c => c.title + ' — root ' + row(c, 'Root in C') + ' → ' + (row(c, 'Roman ID in major') || row(c, 'Roman ID in minor'))),
  },
  triads: {
    app: 'Twenty three-note chord types (major, minor, diminished, augmented, suspended, shell and quartal shapes) in root position, 1st inversion (3rd in the bass) and 2nd inversion (5th in the bass). Each gives its formula, symbol, notes in C and, on the third tap, the spelling in every key.',
    use: 'Triads are the core of harmony. Small three-string triad shapes in all inversions are the most efficient way to map the neck and to sound clear in a band. Inversions give smooth bass lines and voice leading.',
    vary: 'Play each triad on every group of three adjacent strings; cycle root → 1st → 2nd inversion up one string set; arpeggiate, strum and fingerpick it; add the octave.',
    comp: 'Voice-lead progressions by moving to the nearest inversion of the next chord; slash chords (C/E, C/G) create stepwise bass lines; sus and quartal triads add modern ambiguity.',
    impro: 'Arpeggiate the chord of the moment, or superimpose triads (D over C gives Lydian colour; triad pairs give modern lines). Triad shapes are perfect targets for the end of phrases.',
    ex: () => inC('triads', 'Major', 'Minor', 'Diminished', 'Suspended 4th', 'Major / 3', 'Major / 5'),
  },
  tetrads: {
    app: 'Thirty-four four-note chords — sevenths, sixths, add chords, 7sus, altered dominants, rootless/no-5 shapes — each in root position and all three inversions (3rd, 5th or 7th in the bass).',
    use: 'Four-note chords carry harmonic function: maj7 = rest, 7 = tension wanting resolution, m7 = soft motion, m7♭5 = minor ii chord. They are the vocabulary of jazz, soul, R&B, bossa and modern pop.',
    vary: 'Drop-2 and drop-3 voicings, shell voicings (1–3–7), all inversions on each string set, two-octave arpeggios, chord-melody versions with the melody on top.',
    comp: 'Upgrade a triad progression (C–Am–F–G → Cmaj7–Am7–Fmaj7–G7); inversions create descending inner lines (Cmaj7 → C7/B♭ → F/A).',
    impro: 'Arpeggiate the chord as a target-note map — 3rds and 7ths spell the harmony, extensions add colour. Practise resolving the 7th of one chord down a step to the 3rd of the next.',
    ex: () => inC('tetrads', 'Major 7', 'Dominant 7', 'Minor 7', 'Half-Diminished 7', 'Dominant 7 / ♭7'),
  },
  scales5: {
    app: 'Five-note scales — major/minor pentatonic and their variants, Japanese, Chinese, African, blues and synthetic pentatonics — followed by each scale\'s 2nd and 3rd rotations (the same notes starting from the second and third note). Cards show notes in C, step pattern, interval shape and character; the third tap shows all keys.',
    use: 'Five-note scales avoid most clashing half-steps, so they fit over many chords. They are the basis of rock, blues and country soloing and of many folk traditions, and they are the easiest scales to make sound musical.',
    vary: 'Box shapes, two-notes-per-string and three-notes-per-string; one-string runs; sequences in groups of three and four; compare a scale with its rotations.',
    comp: 'Pentatonic melodies are memorable and singable; riffs often use only these five notes. Use a rotation for a contrasting section that still shares the same notes.',
    impro: 'The pentatonic is a safe "home base"; add passing tones from the full scale for colour. Rotations let you reuse one fingering for new sounds.',
    ex: () => deck('scales5').cards.filter(c => c.group === 'Original').slice(0, 3).concat(deck('scales5').cards.filter(c => c.group === 'Rotation 2').slice(0, 1)).map(c => c.title + ' — ' + val(c.transpose(C)) + ' (' + row(c, 'Steps') + ')'),
  },
  scales6: {
    app: 'Six-note (hexatonic) scales — major and minor hexatonics, whole-tone, blues, augmented and others — with their 2nd and 3rd rotations, notes, steps and character.',
    use: 'Hexatonics are richer than pentatonics but still omit one potentially clashing note. Whole-tone and augmented scales are symmetrical, producing dreamy or tense colours used in jazz, film and fusion.',
    vary: 'Play as two interlocking triads, in 3rds, in groups of three, and through each rotation; compare to the seven-note scale it comes from.',
    comp: 'A six-note scale gives a section a distinct but singable colour; the omitted note becomes a deliberate surprise for a climax.',
    impro: 'Major hexatonic (no 4th or no 7th) sounds modern and never clashes over the tonic; the blues hexatonic adds the ♭5 to minor pentatonic.',
    ex: () => deck('scales6').cards.slice(0, 4).map(c => c.title + ' — ' + val(c.transpose(C)) + ' (' + row(c, 'Steps') + ')'),
  },
  scales7: {
    app: 'Seven-note scales — major, harmonic and melodic minor, their modes, double harmonic, Neapolitan, Hungarian, Persian, Enigmatic and many more — with their 2nd and 3rd rotations.',
    use: 'Seven-note scales are complete colour palettes. Each generates its own seven chords when harmonised in 3rds, so knowing a scale means knowing a whole harmonic world.',
    vary: 'Three-notes-per-string and CAGED positions; sequences in 3rds and 4ths; harmonise each degree as a triad and a 7th chord; compare rotations.',
    comp: 'Pick the scale for the emotional world of the piece (Phrygian dominant for Spanish, double harmonic for Middle-Eastern, Lydian for dreamy). Build progressions from its diatonic chords.',
    impro: 'Chord–scale pairing: Lydian over maj7♯11, Mixolydian over 7, altered over 7alt, harmonic minor over V7 in minor.',
    ex: () => deck('scales7').cards.slice(0, 3).map(c => c.title + ' — ' + val(c.transpose(C)) + ' (' + row(c, 'Steps') + ')'),
  },
  modes: {
    app: 'The seven modes of the major scale first (Ionian to Locrian), then grouped families of modal variants and related formulas, followed by 2nd and 3rd rotations. Each card shows its formula, notes in C, step pattern and character.',
    use: 'A mode is the same set of notes centred on a different tonic. Each has a distinctive mood determined by its characteristic note: Dorian\'s natural 6, Phrygian\'s ♭2, Lydian\'s ♯4, Mixolydian\'s ♭7, Locrian\'s ♭5.',
    vary: 'Parallel practice (all modes from C) shows how each changes the mood; relative practice (all modes from the notes of C major) shows the shared shapes. Play each over a drone on its tonic.',
    comp: 'Write over a drone or two-chord vamp that highlights the characteristic note (Dorian: Dm–G; Mixolydian: G–F; Lydian: C–D/C).',
    impro: 'Over a static chord the mode sets the sound. Lean on the characteristic note so the mode is heard rather than plain major or minor.',
    ex: () => deck('modes').cards.slice(0, 7).map(c => c.title + ' — ' + val(c.transpose(C))),
  },
  melodicpatterns: {
    app: 'Scale-degree patterns grouped into Linear runs, Sequences, Arpeggios, Motifs, Longer Lines, Interval Leaps, Pentatonic Lines, Chromatic Color, Sequence Variations and Contour Studies. Each original is followed (later in the deck) by its retrograde (played backwards) and inversion (every step mirrored).',
    use: 'Patterns turn scales into music and train coordination. Retrograde and inversion are the classic composer\'s tools for developing a single idea into many related ones.',
    vary: 'Different rhythms (8ths, triplets, 16ths), start on each degree, one string vs across strings, original/retrograde/inversion, apply to any scale from the scale decks.',
    comp: 'State a pattern as a motif, then sequence, invert and reverse it — the way Bach, metal guitarists and jazz players all develop melody.',
    impro: 'Patterns supply ready-made shapes for fast passages; break out of them mid-phrase and resolve to a chord tone so they sound like music, not exercises.',
    ex: () => { const m = deck('melodicpatterns').cards; const o = m.find(c => c.title === 'Thirds ascending'); return [o, m.find(c => c.title === 'Thirds ascending · Retrograde'), m.find(c => c.title === 'Thirds ascending · Inversion'), m.find(c => c.title === 'Major triad arpeggio')].filter(Boolean).map(c => c.title + ' — ' + c.sub + ' → ' + c.transpose(C)); },
  },
  melodic7base0: {
    app: 'Every sorted combination of scale positions 0–7 of lengths 2 to 8, where position 0 (the root) is fixed first and any other position may appear at most twice. The digits are scale positions, not semitones, so one card works in every 7-note scale or mode.',
    use: 'Systematic coverage: you meet every possible note grouping instead of only the ones your fingers already know. Separating shape from scale lets you hear how a single pattern changes character in each mode.',
    vary: 'Play the positions as a melody, as a chord stack, in reverse; apply to Ionian, then Dorian, then Lydian; move the starting position up the scale.',
    comp: 'Choose a pattern as a motif and map it into the mode of your piece; repeated digits (e.g. 0-2-2-4) give rhythmic repeated notes.',
    impro: 'Thinking in positions rather than note names transfers instantly to any key or mode.',
    ex: () => { const p = deck('melodic7base0').cards; const ion = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C↑']; return [p[0], p[20], p[200], p[1500]].map(c => c.sub + ' in C Ionian → ' + c.sub.split('').map(d => ion[+d]).join(' ')); },
  },
  strings: {
    app: 'One card per open string for the selected string count (2–8), in standard tuning, half-step-down and whole-step-down tuning. Each shows the note with octave, its frequency in Hz and, on the third tap, what scale degree that open string is in every key.',
    use: 'Knowing the open strings and their pitch underpins tuning, finding notes, and using open strings as drones. Down-tunings are standard in rock, metal and blues (Hendrix, SRV, Van Halen).',
    vary: 'Switch the string-count selector for 7- and 8-string guitars; compare frequencies across tunings; find each open string\'s note at the 12th fret.',
    comp: 'Open strings ring under fretted notes; choose keys where many open strings are chord tones. Down-tuning changes resonance and range.',
    impro: 'Use open strings as drones and pedal tones; know which open strings are safe (in-key) for the current key.',
    ex: () => deck('strings').cards.filter(c => c.group === 'Standard tuning').map(c => c.title + ' — ' + row(c, 'Open note') + ' (' + row(c, 'Frequency') + ') = degree ' + c.transpose(C) + ' of C'),
  },
  techniques: {
    app: 'Over a hundred guitar techniques grouped by category (picking, muting, legato and slides, vibrato and bends, harmonics, percussive, rhythm, feedback, whammy, slide and tunings), followed by combination drills that layer a technique with one from another category.',
    use: 'Technique is the expressive layer: the same notes played legato, palm-muted or with harmonics are different music. Randomly paired with theory cards in the games, they stop you practising everything the same way.',
    vary: 'Practise slowly with a metronome, then at tempo; apply each technique to a scale, an arpeggio and a riff; try the combination cards.',
    comp: 'Techniques define texture and genre — palm-muted chugs for metal, chicken picking for country, volume swells for ambient. Assign a technique per song section.',
    impro: 'Vibrato, bends and slides make a few notes sound vocal; dynamic and articulation changes add more interest than extra notes.',
    ex: () => ['Alternate Picking on the C major scale: C D E F G A B C, strictly down-up', 'Hammer-On: pick C (fret 1, string 2), hammer D (fret 3)', 'Palm Muting: chug a C5 power chord (C–G) on strings 5–4', 'Natural harmonics at fret 12 sound the octave of each open string'],
  },
  andalusian: {
    app: 'Andalusian-cadence progressions in A minor (the relative minor of C): the classic descending i–♭VII–♭VI–V and ascending forms, extended turnarounds and hybrids. The same 100 progressions then appear with 7th chords and with extended colours.',
    use: 'The Andalusian cadence is the sound of flamenco and of countless rock and pop songs. It teaches the major V chord in a minor key (Phrygian dominant) and strong stepwise bass motion.',
    vary: 'Triads, 7th chords, extended colours; strummed, rasgueado, arpeggiated; ascending vs descending; any minor key via the third tap.',
    comp: 'Use as a chorus loop, intro or dramatic turnaround; the colour versions are ready-made re-harmonisations.',
    impro: 'A natural minor over Am–G–F, A Phrygian dominant (with G♯) over E: that single note change is the flamenco flavour.',
    ex: () => pick('andalusian', 'Descending Andalusian', 'Descending Andalusian · 7th chords', 'Descending Andalusian · Extended colour').map(c => c.title + ' — ' + row(c, 'Example (A minor)') + ' (' + row(c, 'Numerals') + ')'),
  },
  deceptive: {
    app: 'Progressions built around deceptive or unexpected resolutions — V to vi, borrowed iv, ♭VI and ♭VII moves, chromatic mediants — in C major, each also voiced with 7th chords and extended colours.',
    use: 'Deceptive cadences set up home and then go elsewhere, creating surprise, delay and emotion — a core songwriting device.',
    vary: 'As written, 7ths, extended colours; change the bass note; slow ballad vs driving rock feel.',
    comp: 'Use the deceptive move to extend a phrase, avoid a premature ending or pivot into a bridge or new key.',
    impro: 'Aim for a note common to the expected and the actual chord so your line glides through the surprise.',
    ex: () => deck('deceptive').cards.slice(0, 3).map(c => c.title + ' — ' + val(c.transpose(C))),
  },
  majorminor: {
    app: 'Major-key progressions, minor-key progressions and progressions that mix them (modal interchange), in C, each also with 7th-chord and extended-colour versions.',
    use: 'Most popular music runs on a small set of progressions; mixing major and minor (borrowed iv, ♭VI, ♭VII) creates bittersweet colour.',
    vary: 'Triads, 7ths, extended colours; pedal bass; different rhythm per chord.',
    comp: 'Borrow one chord from the parallel minor into a major progression to darken a single moment.',
    impro: 'Change scale with the chord: major over diatonic chords, parallel minor or Mixolydian over borrowed ones.',
    ex: () => deck('majorminor').cards.slice(0, 4).map(c => c.title + ' — ' + val(c.transpose(C))),
  },
  blues: {
    app: 'Blues progressions and variations in C — 12-bar forms, quick change, minor blues, jazz blues, turnarounds — plus 9th and 13th colour versions.',
    use: 'The blues underpins rock, jazz, soul and funk. Dominant-7 harmony and call-and-response phrasing are essential.',
    vary: 'Shuffle vs straight, quick change, 7/9/13 voicings, different turnarounds, minor blues.',
    comp: 'Use as the frame for a 12-bar song or riff; 9ths and 13ths for funk and jazz colour.',
    impro: 'Mix minor and major pentatonic; follow the IV chord by targeting its 3rd; use the blue notes ♭3, ♭5, ♭7.',
    ex: () => deck('blues').cards.slice(0, 3).map(c => c.title + ' — ' + val(c.transpose(C))),
  },
  lefthand: {
    app: 'Every ordered sequence of fretting-hand fingers 1–4 of length 1 to 8 in which no finger is used more than twice (7,364 cards). The Base 0 value shows each finger relative to the first.',
    use: 'Complete coverage of finger combinations builds independence, accuracy and strength — the physical foundation of clean scales, legato and chord changes.',
    vary: 'Pick every note, then legato; move up one fret each repetition; play on every string; cross strings between fingers; raise tempo gradually.',
    comp: 'Chromatic finger sequences become riffs and chromatic passing lines.',
    impro: 'Familiar finger shapes let you add chromatic passing tones and fast legato without thinking.',
    ex: () => ['1-2-3-4 on string 2 with finger 1 at fret 1: C – C♯ – D – D♯', '1-3-2-4 on string 5 from fret 3: C – D – C♯ – D♯', '4-3-2-1 on string 3 from fret 5: D♯ – D – C♯ – C'],
  },
  righthand: {
    app: 'Every ordered picking path that visits distinct strings, for the selected string count (2–8 strings; 1,950 paths for six strings, 109,592 for eight). Each card shows the string sequence, the open notes and a tab of which string to pick on each step. Paths are generated on demand.',
    use: 'Systematic right-hand practice covers every string-crossing, which is what makes arpeggios, cross-picking and fingerstyle clean and confident.',
    vary: 'Alternate, economy, hybrid picking or fingers; accent different notes; repeat each path four times; fret a chord shape while picking the path.',
    comp: 'Picking paths over a chord become arpeggiated accompaniments (Travis picking, post-rock, ballad patterns).',
    impro: 'Confident string-crossing makes wide-interval lines and arpeggios available at speed.',
    ex: () => ['Path 5432 over an open C chord (x32010): C – E – G – C', 'Path 6432 open: E2 D3 G3 B3', 'Tab 6432:\n' + rightHandTab('6432', 6)],
  },
  base0: {
    app: 'A key-independent reference card for every chord, scale, mode, interval, pattern, progression and left-hand sequence: pitch classes measured in semitones from an arbitrary root X (0 = root, 4 = major 3rd, 7 = 5th, etc.). Left-hand entries show finger offsets.',
    use: 'Semitone formulas are how the fretboard actually works — one fret is one semitone — so a Base 0 formula is a movable shape. They also make it easy to compare structures (major = 0-4-7, minor = 0-3-7).',
    vary: 'Pick any root and build the formula by counting frets; compare formulas of related chords and scales; find all formulas that share a subset.',
    comp: 'Design chords and scales by formula, then place them in any key; use transformations (adding/removing semitones) to create new colours.',
    impro: 'Seeing a scale as semitone offsets reveals symmetric and movable patterns (whole-tone 0-2-4-6-8-10, diminished 0-2-3-5-6-8-9-11).',
    ex: () => ['X Major Chord: 0-4-7 → in C: C E G', 'X Minor 7 Chord: 0-3-7-10 → C E♭ G B♭', 'X Major Scale: 0-2-4-5-7-9-11 → C D E F G A B', 'X Minor Pentatonic: 0-3-5-7-10 → C E♭ F G B♭'],
  },
};

const SECTIONS = [['Application', 'app'], ['Usefulness', 'use'], ['Variations', 'vary'], ['Application for composition', 'comp'], ['Application for improvisation', 'impro'], ['Examples in C', 'ex']];

function deckDoc(id) {
  const doc = DOCS[id];
  if (!doc) return null;
  let ex;
  try { ex = doc.ex(); } catch (error) { ex = []; }
  if (PLAYABLE_DECKS.includes(id)) {
    const progression = ['andalusian', 'deceptive', 'majorminor', 'blues'].includes(id);
    const sample = deck(id).cards[0];
    const what = progression
      ? '"▶ Chords" sounds each chord of the progression as a block, one after another; "▶ Arpeggio" plays every chord tone individually, chord by chord.'
      : '"▶ Together" sounds every note at the same time; "▶ Arpeggio" plays each note individually in order.';
    const register = progression
      ? (id === 'andalusian' ? 'in A minor' : 'in the key shown on the card (C major, or A minor for minor-key cards)') + ', with smooth voice-leading: each chord root moves to the nearest octave, kept between E3 and A4'
      : ['triads', 'tetrads'].includes(id) ? 'around C4 (261.63 Hz) with the written bass note lowest — exactly ' + (id === 'triads' ? 'three' : 'four') + ' tones including the root'
      : id.startsWith('intervals') ? 'from C4 upward (descending cards from C5 downward) — exactly two tones, root and interval'
      : ['scales5', 'scales6', 'scales7'].includes(id) ? 'from C4 — exactly ' + { scales5: 'five', scales6: 'six', scales7: 'seven' }[id] + ' tones including the root, with no added octave'
      : id === 'modes' ? 'from the mode\'s first note (e.g. Dorian from D4) — exactly as many tones as the formula has, with no added octave'
      : id === 'keys' ? 'as the key\'s own seven-note scale from its tonic in octave 4 (the separate tonic button plays the tonic alone)'
      : id === 'romannumerals' ? 'as the triad the numeral names (upper case major, lower case minor, ° diminished) on its root in C, root between G3 and F♯4'
      : id === 'strings' ? 'at the open string\'s real pitch (e.g. low E = E2, 82.41 Hz; 8-string low F♯ = F♯1)'
      : id === 'lefthand' ? 'one finger per fret from C4 (finger 1 = C4, finger 2 = C♯4, finger 3 = D4, finger 4 = D♯4), in the written finger order'
      : id === 'righthand' ? 'over the open strings of the selected string set at their real pitches — Together strums the strings of the path, Arpeggio picks them in path order'
      : id === 'base0' ? 'exactly as the card it was derived from (in C), so the formula can be heard'
      : 'from C4 — every note of the pattern exactly as written, repeated notes included';
    const play = ' Every card has two play buttons and a "+ Octave" switch. ' + what + ' With + Octave on, the octave of the first note is added (above for chords and ascending lines, below for descending lines); the switch applies to every card and is remembered. Pitches are exact equal-tempered frequencies (A4 = 440 Hz) with soft overtones for clarity on small speakers, played ' + register + '. Inside games they are transposed to the dealt key.';
    const heard = describeSound(id, sample);
    const s = soundFor(id, sample);
    const withOct = s ? withOctave(s.events).map(n => spellCard(id, sample, n).join(' ')).join(' / ') : '';
    return { ...doc, app: doc.app + play, ex: heard ? ex.concat(['Playback of "' + sample.title + '": ' + heard, 'With + Octave: ' + withOct]) : ex };
  }
  return { ...doc, ex };
}

TD['deckdocs.js'] = { deckDoc, DECK_DOC_SECTIONS: SECTIONS };
})(window.TD = window.TD || {});
