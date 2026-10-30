(function (TD) {
'use strict';
// Full music-theory lessons, one per deck, shown on the Reference page (built only when opened).
// Each lesson: concept → how it is built → hearing it → on the guitar → practice plan → common mistakes → next steps.
const LESSON_SECTIONS = [
  ['The idea', 'concept'],
  ['How it is built', 'build'],
  ['Hearing it', 'hear'],
  ['On the guitar', 'guitar'],
  ['Practice plan', 'practice'],
  ['Common mistakes', 'mistakes'],
  ['Where it leads', 'next'],
];

const LESSONS = {
  keys: {
    title: 'Keys, key signatures and the modes of the major scale',
    concept: 'A key is a home note (the tonic) plus a fixed collection of notes that sound settled around it. Music "in G major" keeps returning to G and mostly uses G A B C D E F♯. Knowing the key tells you which notes, chords and scales will fit before you play a note.',
    build: [
      'Major (Ionian) = whole and half steps W W H W W W H: C D E F G A B C. Every major key copies this pattern from a new tonic, and the sharps or flats that appear are its key signature.',
      'Circle of fifths: each step clockwise adds one sharp (C → G → D → A → E → B → F♯); each step anticlockwise adds one flat (C → F → B♭ → E♭ → A♭ → D♭ → G♭). Sharps are added in the order F C G D A E B, flats in the order B E A D G C F.',
      'Relative minor: start the same notes on the 6th degree (C major → A minor). Harmonic minor raises the 7th (A B C D E F G♯) to create a leading tone; melodic minor raises the 6th and 7th (A B C D E F♯ G♯).',
      'Modes: start the major scale on another degree. From C major\'s notes: D Dorian (2nd), E Phrygian (3rd), F Lydian (4th), G Mixolydian (5th), A Aeolian (6th, natural minor), B Locrian (7th).',
      'Each mode has one "colour note" that sets it apart from plain major or minor: Dorian natural 6, Phrygian ♭2, Lydian ♯4, Mixolydian ♭7, Locrian ♭5.',
      'The Key deck lists every mode on all 12 tonics with its notes, formula, parent major key and signature: D Dorian has no sharps or flats because its parent is C major.',
    ],
    hear: 'Play a card with ▶ Arpeggio and listen for the tonic as "home". Compare C major, C Mixolydian and C Dorian back to back: the lowered 7th makes Mixolydian bluesy, the lowered 3rd makes Dorian minor, and Dorian\'s natural 6th keeps it brighter than natural minor.',
    guitar: [
      'Find the tonic on the 6th and 5th strings first; every scale shape hangs off those two roots.',
      'E, A, D and G are the guitar\'s friendliest keys because their tonics and fifths are open strings.',
      'Modes on guitar: hold a drone (open string or looper) on the tonic and play the parent major shape over it — the drone makes the mode, not the shape.',
    ],
    practice: [
      'Day 1: say the notes of each major key going round the circle of fifths.',
      'Day 2: name the relative minor of each key and play both tonics.',
      'Day 3: pick one tonic (A) and play all seven modes over an open A drone, naming each colour note.',
      'Day 4: deal a game, read the key card and name its signature before flipping.',
    ],
    mistakes: [
      'Spelling F♯ major with G♭ — every letter appears once per key, so F♯ major has E♯, not F.',
      'Thinking a mode is "the major scale starting on another note" without changing the home note — the tonic must move.',
      'Forgetting harmonic minor\'s raised 7th when building the V chord in minor.',
    ],
    next: 'Use the key with Roman Numeral ID (chords by degree), then with Major / Minor progressions and the Ionian & Modes deck.',
  },
  intervals: {
    title: 'Intervals: the distance between two notes',
    concept: 'An interval is the distance between two pitches. Every chord, scale and melody is a set of intervals, so naming intervals by sight and ear is the foundation of all theory.',
    build: [
      'An interval has a number (count the letter names: C to E = 3rd) and a quality (major, minor, perfect, augmented, diminished).',
      'Semitones from C: m2 = 1 (D♭), M2 = 2 (D), m3 = 3 (E♭), M3 = 4 (E), P4 = 5 (F), A4/d5 = 6 (F♯/G♭), P5 = 7 (G), m6 = 8 (A♭), M6 = 9 (A), m7 = 10 (B♭), M7 = 11 (B), P8 = 12 (C).',
      'Unisons, 4ths, 5ths and octaves are "perfect"; 2nds, 3rds, 6ths and 7ths are major or minor. One semitone wider than major or perfect is augmented; one narrower than minor or perfect is diminished.',
      'Inversion: flipping an interval adds up to 9 in number and swaps quality (M3 ↔ m6, P4 ↔ P5, m2 ↔ M7).',
      'Descending intervals are measured downward from the top note: a descending P5 from C lands on F.',
    ],
    hear: 'Use reference songs: m2 = Jaws, M2 = "Happy Birthday", m3 = "Greensleeves", M3 = "When the Saints", P4 = "Here Comes the Bride", tritone = "The Simpsons", P5 = Star Wars, M6 = "My Bonnie", m7 = "Somewhere" (West Side Story), octave = "Somewhere Over the Rainbow".',
    guitar: [
      'On one string the semitone count is the fret distance: a P5 is 7 frets.',
      'Across adjacent strings (except G→B) a P4 is the same fret, a P5 is one string higher and two frets up, a M3 is one string higher and one fret back.',
      'Crossing the G→B pair, shapes that cross it shift one fret higher.',
    ],
    practice: [
      'Play each card on one string, then on two strings, saying the name aloud.',
      'Cover the card, press ▶ Together, and name the interval; flip to check.',
      'Sing the lower note, then the upper, before playing it.',
    ],
    mistakes: [
      'Naming by semitones only: C–F♯ (A4) and C–G♭ (d5) sound alike but are spelled differently and behave differently.',
      'Counting the starting note as 0 — interval numbers count both notes (C–D is a 2nd).',
    ],
    next: 'Stack intervals into chords (Triads, 4 Tone) and string them into scales.',
  },
  'intervals-ext': {
    title: 'Compound intervals and chord extensions',
    concept: 'Intervals beyond an octave are compound intervals. They are what jazz and pop chord symbols mean by 9, 11 and 13.',
    build: [
      'Subtract 7 to find the simple interval: a 9th is an octave plus a 2nd, an 11th an octave plus a 4th, a 13th an octave plus a 6th.',
      'From C: M9 = D (14 semitones), P11 = F (17), ♯11 = F♯ (18), M13 = A (21), double octave = C (24).',
      'In chord symbols, 9, 11 and 13 imply a 7th underneath: C9 = C E G B♭ D. Without the 7th the name is "add": Cadd9 = C E G D.',
      'Extensions keep the same quality rules: ♭9 and ♯9 on dominant chords, ♯11 on major and dominant chords, ♭13 on altered dominants.',
    ],
    hear: 'The 9th sounds like a shimmering 2nd, the 11th a suspended 4th lifted high, the 13th a bright 6th on top. Play the card, then the simple interval it contains, to hear the same colour an octave apart.',
    guitar: [
      'Octave shapes: root on the 6th string, octave two strings up and two frets higher; the 9th is two frets above that octave.',
      'Many voicings drop the 5th or root to make room for the extension on the top strings.',
    ],
    practice: [
      'For each card, play the simple interval, then the compound version.',
      'Play C7, then C9 (add D on top), then C13 (add A on top) and listen to each extension enter.',
    ],
    mistakes: [
      'Writing C11 when you mean Csus4 — an 11th chord normally implies 7th and 9th as well.',
      'Clashing a natural 11 against a major 3rd in major chords — use ♯11 instead.',
    ],
    next: 'See extended chords in action in the Andalusian, Deceptive, Major / Minor and Blues "Extended colour" groups.',
  },
  romannumerals: {
    title: 'Roman numerals: chords by scale degree',
    concept: 'Roman numerals name chords by the scale degree of their root, so a progression can be understood in any key. I–IV–V means the same thing in C (C F G) as in E (E A B).',
    build: [
      'Major key triads: I ii iii IV V vi vii° — upper case = major, lower case = minor, ° = diminished. In C: C Dm Em F G Am B°.',
      'Natural minor triads: i ii° III iv v VI VII. In A minor: Am B° C Dm Em F G. Harmonic minor raises the 7th, giving V (E) and vii° (G♯°).',
      'Chromatic roots: a ♭ before an upper-case numeral is a chord borrowed from the parallel minor (♭III, ♭VI, ♭VII in C = E♭, A♭, B♭); a ♯ root with ° is a passing diminished chord leading upward (♯iv° = F♯° leading to G).',
      'Functions: tonic (I, vi, iii) feels at rest, predominant (IV, ii) moves away, dominant (V, vii°) pulls home.',
    ],
    hear: 'With the key held as a drone, play I then V then I: the pull of V back to I is the strongest motion in tonal music. Then try IV–I (the "amen" cadence) and V–vi (deceptive).',
    guitar: [
      'Root on the 6th string: the IV and V chords sit on the 5th string at the same fret and two frets higher — the classic three-chord box.',
      'The vi chord is the relative minor: three frets below the I on the same string.',
    ],
    practice: [
      'Pick a key card and play I through vii° as triads up the neck.',
      'Deal the Roman Numeral technique game; find the dealt degree\'s chord in the dealt key.',
    ],
    mistakes: [
      'Using major chords on ii, iii and vi in a major key unless the progression is meant to borrow them.',
      'Writing ♭vi when the borrowed chord is major — borrowed chords are ♭VI (upper case).',
    ],
    next: 'Apply numerals to whole progressions in the Major / Minor, Deceptive, Blues and Andalusian decks.',
  },
  triads: {
    title: 'Triads: three-note chords and their inversions',
    concept: 'A triad stacks two thirds above a root. It is the basic unit of harmony: almost every song is built from triads and their colours.',
    build: [
      'Major 1–3–5 (C E G): M3 + m3. Minor 1–♭3–5 (C E♭ G): m3 + M3. Diminished 1–♭3–♭5 (C E♭ G♭): m3 + m3. Augmented 1–3–♯5 (C E G♯): M3 + M3.',
      'Suspended chords replace the 3rd: sus2 1–2–5 (C D G), sus4 1–4–5 (C F G). They sound open and unresolved.',
      'Inversions put another chord tone in the bass: 1st inversion has the 3rd lowest (C/E = E G C), 2nd inversion has the 5th lowest (C/G = G C E). The chord keeps its name; only the bass changes.',
      'Power chords (1–5) leave out the 3rd entirely, so they are neither major nor minor.',
    ],
    hear: 'Major sounds bright and stable, minor darker, diminished tense and crowded, augmented unsettled and rising. Play the root-position card, then its inversions, and hear the same chord with a different bass.',
    guitar: [
      'Play triads on three adjacent strings (e.g. strings 3-2-1) — each string set gives three shapes, one per inversion.',
      'Moving from one inversion to the next walks the same chord up the neck.',
    ],
    practice: [
      'Play every triad card on strings 3-2-1, then 4-3-2.',
      'Connect C – F – G using the closest inversions (smooth voice leading).',
    ],
    mistakes: [
      'Calling a 2nd-inversion chord by its bass note (C/G is still a C chord).',
      'Confusing sus2 and sus4 in the same position: they are inversions of each other (Csus2 = Gsus4 notes).',
    ],
    next: 'Add a fourth note to get the seventh chords of the 4 Tone deck.',
  },
  tetrads: {
    title: 'Four-note chords: sevenths, sixths and colours',
    concept: 'Adding one more note — usually a 7th — to a triad gives four-note chords. They are the language of jazz, soul and much of pop.',
    build: [
      'maj7 1–3–5–7 (C E G B), dominant 7 1–3–5–♭7 (C E G B♭), m7 1–♭3–5–♭7 (C E♭ G B♭), m7♭5 / ø7 1–♭3–♭5–♭7 (C E♭ G♭ B♭), °7 1–♭3–♭5–𝄫7 (C E♭ G♭ B𝄫 = A).',
      'Sixth chords add the 6th instead of the 7th: C6 = C E G A, Cm6 = C E♭ G A. Add chords add a colour without the 7th: Cadd9 = C E G D.',
      'In a major key the diatonic sevenths are Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7 (in C: Cmaj7 Dm7 Em7 Fmaj7 G7 Am7 Bø7).',
      'Four notes give four positions: root position, 1st (3rd in bass), 2nd (5th in bass) and 3rd inversion (7th in bass).',
    ],
    hear: 'maj7 is soft and dreamy, dominant 7 bluesy and restless (it wants to resolve down a fifth), m7 mellow, ø7 dark and searching, °7 dramatic and symmetrical.',
    guitar: [
      'Drop-2 voicings on strings 4-3-2-1 and 5-4-3-2 are the standard way to play every inversion.',
      'Shell voicings (root, 3rd, 7th) on the low strings give the essential sound with three notes.',
    ],
    practice: [
      'Play the ii7–V7–Imaj7 (Dm7 G7 Cmaj7) in three positions.',
      'For each card, play root position and then each inversion on one string set.',
    ],
    mistakes: [
      'Writing C7 when you mean Cmaj7 — a plain 7 always means the ♭7.',
      'Spelling °7 with a B♭; the diminished 7th is B𝄫 (sounding A).',
    ],
    next: 'Hear these chords in the 7th-chord groups of the progression decks.',
  },
  scales5: {
    title: 'Five-note (pentatonic) scales',
    concept: 'Pentatonic scales use five notes per octave. With no half-step clashes they sound good over almost anything, which is why they are the first scales most guitarists learn.',
    build: [
      'Major pentatonic 1–2–3–5–6 (C D E G A) — the major scale without its 4th and 7th.',
      'Minor pentatonic 1–♭3–4–5–♭7 (C E♭ F G B♭) — the 5th mode of a major pentatonic (E♭ major pentatonic from C).',
      'Other families (Japanese, Egyptian, suspended, dominant pentatonics) change one or two notes and bring half steps back for colour.',
      'Rotations: starting the same five notes on each of its notes gives the scale\'s modes; the deck shows the 2nd and 3rd rotations of every scale.',
    ],
    hear: 'Major pentatonic sounds open and country-like, minor pentatonic is the sound of blues and rock solos. Listen for the gaps (the "missing" notes) that give each its character.',
    guitar: [
      'Five box shapes cover the neck; shape 1 of minor pentatonic is the most-used scale shape in rock.',
      'Bends: the ♭3 bent a quarter tone and the 4 bent to the 5 are the classic pentatonic bends.',
    ],
    practice: [
      'Play each card in one position, then on one string.',
      'Improvise over a drone using only the five notes; then add the blues note (♭5).',
    ],
    mistakes: [
      'Staying in one box shape — connect them across the neck.',
      'Using minor pentatonic over every chord without listening to the 3rd of major chords.',
    ],
    next: 'Add a sixth note in the 6 Tone deck (e.g. the blues scale) and a seventh in the 7 Tone deck.',
  },
  scales6: {
    title: 'Six-note (hexatonic) scales',
    concept: 'Hexatonic scales sit between pentatonic and full seven-note scales: one note more colour than pentatonic, one note less than major.',
    build: [
      'Blues scale 1–♭3–4–♭5–5–♭7 (C E♭ F G♭ G B♭): minor pentatonic plus the ♭5 "blue note".',
      'Whole-tone 1–2–3–♯4–♯5–♭7 (C D E F♯ G♯ B♭): every step a whole tone, so it has no clear home.',
      'Augmented 1–♯2–3–5–♯5–7 (C D♯ E G A♭ B): alternating m3 and half steps.',
      'Many hexatonics are a seven-note scale with one note removed (Ionian Hexatonic = major without its 4th or 7th).',
      'Every card here has exactly six distinct tones; rotations show the scale from its 2nd and 3rd notes.',
    ],
    hear: 'The blues scale\'s ♭5 is a passing tension; whole-tone sounds dreamlike and floating; the augmented scale sounds symmetrical and modern.',
    guitar: [
      'The blues scale is the minor pentatonic box with one extra fret (the ♭5) on two strings.',
      'Symmetrical scales (whole-tone, augmented) repeat their shape every few frets.',
    ],
    practice: [
      'Play the blues scale and land on the 5 after the ♭5.',
      'Compare a hexatonic card with the seven-note scale it comes from.',
    ],
    mistakes: [
      'Resting on the ♭5 in the blues scale — it is a passing note.',
      'Using whole-tone over plain major chords; it fits augmented and altered dominant chords.',
    ],
    next: 'Complete the scale in the 7 Tone and Ionian & Modes decks.',
  },
  scales7: {
    title: 'Seven-note (heptatonic) scales',
    concept: 'Seven-note scales have one note for every letter name. They are the basis of keys, functional harmony and most melodies.',
    build: [
      'Major 1–2–3–4–5–6–7 (C D E F G A B) and natural minor 1–2–♭3–4–5–♭6–♭7 (C D E♭ F G A♭ B♭).',
      'Harmonic minor 1–2–♭3–4–5–♭6–7 (C D E♭ F G A♭ B): the raised 7th makes an augmented 2nd between ♭6 and 7.',
      'Melodic minor 1–2–♭3–4–5–6–7 (C D E♭ F G A B): "jazz minor", the source of altered and Lydian dominant sounds.',
      'Exotic heptatonics (Hungarian minor, double harmonic, Neapolitan) change two or three degrees for strong colour.',
      'Each card has exactly seven distinct tones spelled with seven letters; rotations give its other modes.',
    ],
    hear: 'Compare major, natural minor, harmonic minor and melodic minor from the same tonic: each changed degree has a recognisable flavour.',
    guitar: [
      'Three-notes-per-string patterns map every seven-note scale onto the neck in seven shapes.',
      'CAGED patterns tie each scale to five chord shapes you already know.',
    ],
    practice: [
      'Play each card from its root on the 6th string and the 5th string.',
      'Write the scale in two keys, checking every letter appears once.',
    ],
    mistakes: [
      'Spelling harmonic minor with a ♭7 (that is natural minor).',
      'Using the same fingering without hearing which degree changed.',
    ],
    next: 'Explore every mode of these scales in the Ionian & Modes deck.',
  },
  modes: {
    title: 'Modes and their subsets',
    concept: 'A mode is a scale heard from one of its own notes as home. The seven modes of the major scale are the core; the deck also breaks each mode into triads, tetrachords, pentatonic and hexatonic subsets.',
    build: [
      'Ionian 1–2–3–4–5–6–7, Dorian 1–2–♭3–4–5–6–♭7, Phrygian 1–♭2–♭3–4–5–♭6–♭7, Lydian 1–2–3–♯4–5–6–7, Mixolydian 1–2–3–4–5–6–♭7, Aeolian 1–2–♭3–4–5–♭6–♭7, Locrian 1–♭2–♭3–4–♭5–♭6–♭7.',
      'Brightest to darkest: Lydian, Ionian, Mixolydian, Dorian, Aeolian, Phrygian, Locrian — each step lowers one more degree.',
      'Subsets: 3-note groups are the triads inside a mode, 4-note groups its tetrachords and tetratonic cells, 6-note groups the mode minus one degree.',
      'The deck\'s "The 7 Modes" cards are written from the white keys (Dorian from D, Phrygian from E…), so you can see each mode inside C major.',
    ],
    hear: 'Play each mode over a drone of its own tonic. The colour note — Dorian 6, Phrygian ♭2, Lydian ♯4, Mixolydian ♭7, Locrian ♭5 — is what you are hearing.',
    guitar: [
      'Same shape, different home: all seven modes of C major use the same fretboard notes; the drone or chord underneath decides the mode.',
      'Or keep the root fixed (A) and change the shape for each mode — this "parallel" approach trains the colour notes.',
    ],
    practice: [
      'Parallel modes: play A Ionian, A Dorian … A Locrian, one per day, over an A drone.',
      'Play the mode\'s triad subsets as arpeggios to find its chords.',
    ],
    mistakes: [
      'Playing a C major scale over a D chord and calling it Dorian without resolving to D.',
      'Avoiding the colour note — it is the point of the mode.',
    ],
    next: 'Combine modes with the 7-Tone Base 0 Patterns in the mode-combination game, and with Fibonacci mode games.',
  },
  melodicpatterns: {
    title: 'Melodic patterns: sequences, arpeggios and contours',
    concept: 'A melodic pattern is a small shape of scale steps that can be moved through any scale. Patterns turn scales into music and train your hands to move in every direction.',
    build: [
      'Linear patterns move stepwise (1–2–3–4). Sequences repeat a shape from each degree (1–2–3, 2–3–4, 3–4–5…).',
      'Arpeggios skip to chord tones (1–3–5–8). Interval leaps (1–4, 1–5, 1–6) stretch the ear.',
      'Retrograde plays a pattern backwards; inversion mirrors it (up becomes down) around its first note.',
      'Degrees above 7 continue into the next octave: 8 = octave, 9 = the 2nd an octave up.',
    ],
    hear: 'Sing each pattern on numbers (one-two-three) before playing it. Listen for the contour — rise, fall, arch or zigzag — more than the notes.',
    guitar: [
      'Play each pattern in one position through the dealt scale, then on one string.',
      'Use alternate picking for linear patterns and economy or sweep picking for arpeggios.',
    ],
    practice: [
      'Pick one pattern and play it up and down a scale at 60 bpm, then 80, then 100.',
      'Play the original, its retrograde and its inversion back to back.',
    ],
    mistakes: [
      'Speeding up before the pattern is even.',
      'Losing the shape at the octave — keep the same step sizes through the turnaround.',
    ],
    next: 'Combine patterns with subjects and techniques in the Melodic pattern and Focused pattern games.',
  },
  melodic7base0: {
    title: 'Base 0 scale-position patterns',
    concept: 'These patterns name scale positions instead of notes: 0 is the first note of any seven-note scale, 1 the second… 7 the octave. One pattern then works in every key and mode.',
    build: [
      'Positions 0–6 are the seven scale notes; 7 is the octave of 0 (shown with ↑ in games).',
      'Cards list every pattern of 2 to 8 positions that starts on 0 and never moves down (repeats allowed): 00, 01 … 024 … 04556677 — 2,186 in all, grouped by length.',
      'In C major, 024 = C E G (a triad), 0123 = C D E F (a tetrachord), 047 = C G C (root, fifth, octave); a repeated digit repeats the note (0022 = C C E E).',
    ],
    hear: 'The same pattern sounds different in each mode: 024 is major in Ionian, minor in Dorian, diminished in Locrian.',
    guitar: [
      'Map the positions onto any scale shape; the numbers stay the same as you change key.',
    ],
    practice: [
      'Deal the mode-combination game and play the pattern in the dealt mode and key.',
      'Play one pattern through all seven modes from the same root.',
    ],
    mistakes: [
      'Counting the first note as 1 — Base 0 starts at 0.',
    ],
    next: 'Use the patterns with the Ionian & Modes deck and Fibonacci mode games.',
  },
  strings: {
    title: 'Open strings and tunings',
    concept: 'Knowing the exact pitch of every open string is the map for the whole fretboard: every fretted note is an open string plus a number of semitones.',
    build: [
      'Standard tuning, low to high: E2 A2 D3 G3 B3 E4 (82.41 Hz to 329.63 Hz). Seven-string adds B1, eight-string adds F♯1 below.',
      'Adjacent strings are a perfect 4th apart, except G3 to B3, a major 3rd. That one exception shifts every shape that crosses it.',
      'Half step down lowers every string a semitone (E♭ A♭ D♭ G♭ B♭ E♭); whole step down lowers two (D G C F A D).',
      'Fret 12 is the octave of the open string; fret 5 (fret 4 on the G string) matches the next string\'s open note.',
    ],
    hear: 'Play each card and tune to it. Compare a string with the next one up: you will hear a 4th (or the major 3rd between G and B).',
    guitar: [
      'Learn the notes on strings 6 and 5 first; with octave shapes they locate every other note.',
    ],
    practice: [
      'Tune by ear from the card\'s pitch, then check fret-5 unisons.',
      'Name the note at frets 3, 5, 7 and 12 on every string.',
    ],
    mistakes: [
      'Forgetting the G–B major 3rd when moving shapes across strings.',
    ],
    next: 'Use the strings with Left Hand Practice and Right Hand paths.',
  },
  techniques: {
    title: 'Guitar techniques',
    concept: 'Technique is how a note is produced: the same pitch can be picked, slurred, bent, muted, tapped or harmonic. The deck pairs a technique with every theory subject so you practise sound and theory together.',
    build: [
      'Picking hand: alternate, down-, up-, economy, sweep, hybrid and tremolo picking; palm muting and rakes.',
      'Fretting hand: hammer-ons, pull-offs, slides, trills, vibrato and bends (half, whole, pre-bends, unison bends).',
      'Colour: natural and artificial harmonics, tapping, percussive and flamenco techniques, slide, effects and feedback.',
      'Combination cards join two techniques (e.g. Selective Muting + Classical Vibrato).',
    ],
    hear: 'Record yourself: a technique is right when the notes are even in volume and timing and the effect is intentional.',
    guitar: [
      'Practise each technique on one string first, then inside the dealt scale or chord.',
    ],
    practice: [
      'Deal a technique game; play the subject plainly, then with the dealt technique.',
      'Use a metronome and keep the technique in time.',
    ],
    mistakes: [
      'Bending out of tune — check bends against the target note fretted.',
      'Letting technique replace timing; slow down until both are clean.',
    ],
    next: 'Every Technique deal game combines this deck with a theory subject.',
  },
  andalusian: {
    title: 'The Andalusian cadence',
    concept: 'The Andalusian cadence is a descending minor progression, i–♭VII–♭VI–V (Am–G–F–E in A minor). Its stepwise falling bass and major V give it the sound of flamenco and countless rock and pop songs.',
    build: [
      'Bass line: A → G → F → E, the top four notes of A natural minor falling to the dominant.',
      'The last chord is major (E, not Em): the G♯ comes from harmonic minor and pulls back to A.',
      'Variations reorder or extend the line (ascending versions, added iv, repeated chords); the deck also gives 7th-chord and extended-colour versions.',
      'In E Phrygian terms the same chords end on E as home — flamenco often treats E as the tonic.',
    ],
    hear: 'Listen for the falling bass and the bright, tense E major at the end. With voice-led playback, each chord moves to the nearest octave so the descent stays smooth.',
    guitar: [
      'Open chords Am G F E with the bass on the 5th, 6th and 4th strings make the bass line obvious.',
      'Flamenco: play it in A minor or E Phrygian with rasgueado strums.',
    ],
    practice: [
      'Strum the original card for 4 beats per chord, then arpeggiate it.',
      'Play the A natural-minor scale over Am G F and switch to harmonic minor over E.',
    ],
    mistakes: [
      'Playing E minor instead of E major at the end.',
    ],
    next: 'Compare with borrowed chords in Major / Minor and cadences in Deceptive.',
  },
  deceptive: {
    title: 'Deceptive and borrowed cadences',
    concept: 'A deceptive cadence sets up an expected resolution and goes somewhere else — classically V to vi instead of V to I. The deck also covers related moves that use chords borrowed from the parallel minor.',
    build: [
      'V–vi: G → Am in C. The bass rises a step and the melody resolves, but the chord is minor, so the phrase keeps going.',
      'V–♭VI: G → A♭ in C, a darker surprise borrowed from C minor.',
      'IV–iv–I: F → Fm → C, the minor iv (borrowed) giving a bittersweet "plagal" resolution.',
      'Every card has 7th-chord and extended-colour versions.',
    ],
    hear: 'Play I–IV–V–I, then I–IV–V–vi: feel the second one avoid home. The borrowed chords sound like a cloud passing over.',
    guitar: [
      'Voice-lead V to vi: G–B–D to A–C–E moves every voice up by step; with B on top, the half step B → C makes the surprise sound smooth.',
    ],
    practice: [
      'For each card, sing the expected resolution, then play the deceptive one.',
      'Write a 4-bar phrase that ends deceptively and an answer that ends on I.',
    ],
    mistakes: [
      'Using a deceptive cadence at the very end of a piece — it is meant to extend, not to finish.',
    ],
    next: 'Use these progressions with melodic patterns in the pattern games.',
  },
  majorminor: {
    title: 'Major and minor progressions',
    concept: 'Most songs are built from a handful of progressions in a major or minor key. Learning them by Roman numeral lets you hear, play and transpose songs instantly.',
    build: [
      'I–IV–V (C F G): the foundation of folk, blues and rock.',
      'I–V–vi–IV (C G Am F): the most common pop progression. vi–IV–I–V is the same loop started from the minor chord.',
      'I–vi–IV–V (C Am F G): the 1950s "doo-wop" progression; ii–V–I (Dm G C): the core of jazz.',
      'Borrowed chords from the parallel minor (♭III, ♭VI, ♭VII, iv) darken a major key: I–♭VII–IV (C B♭ F) is a classic rock move.',
      '7th and extended-colour groups add sevenths and 9ths, 11ths, 13ths to each progression.',
    ],
    hear: 'Play a card, then hum a melody over it. Notice how the vi chord softens a progression and how V creates the need to return.',
    guitar: [
      'Learn each progression with open chords, then with barre chords rooted on strings 6 and 5 so you can move it to any key.',
    ],
    practice: [
      'Play the card in C, G, D, A and E using Roman numerals.',
      'Identify the progression of three songs you know by ear.',
    ],
    mistakes: [
      'Treating every chord as equal — the bass motion (especially V → I) carries the progression.',
    ],
    next: 'Combine with Roman Numeral ID and the Blues deck.',
  },
  blues: {
    title: 'Blues progressions',
    concept: 'The blues uses dominant 7th chords on I, IV and V in a repeating form, most often 12 bars. Its mix of major chords and minor-pentatonic melodies is the sound behind rock, jazz and soul.',
    build: [
      '12-bar blues in C: C7 C7 C7 C7 | F7 F7 C7 C7 | G7 F7 C7 G7 (the last bar is the turnaround).',
      'Quick change: IV in bar 2 (C7 F7 C7 C7…). Minor blues uses i7, iv7 and V7 (Cm7 Fm7 G7).',
      'Turnarounds such as I7–VI7–II7–V7 (C7 A7 D7 G7) lead back to the top of the form.',
      'The deck lists progression cells and forms with 7th-chord and extended (9, 13) versions.',
    ],
    hear: 'Count the bars while the card plays; the arrival of IV in bar 5 and V in bar 9 are the landmarks.',
    guitar: [
      'Shuffle rhythm on the low strings: root + 5th alternating with root + 6th.',
      'Over the chords, play minor pentatonic or blues scale from the I chord\'s root; target each chord\'s 3rd for a more melodic solo.',
    ],
    practice: [
      'Play the 12-bar in A, E and G with a shuffle.',
      'Solo using only chord tones of each 7th chord, then add the blue note.',
    ],
    mistakes: [
      'Losing count of the bars — always know where bar 1 is.',
    ],
    next: 'Use blues cards in the Fibonacci and pattern games for new phrase ideas.',
  },
  lefthand: {
    title: 'Left-hand finger sequences (1-2-3-4)',
    concept: 'Finger-sequence exercises train independence, strength and accuracy in the fretting hand. Each card is an order of fingers 1–4, one finger per fret.',
    build: [
      'Fingers: 1 index, 2 middle, 3 ring, 4 little. In one-finger-per-fret position, finger n plays fret n of the position.',
      'Sequences run from 1 to 8 notes, with every finger order the deck allows; the Base 0 value shows each finger relative to the first (e.g. 1-2-4-2 → 0 +1 +3 +1).',
      'Playback uses one finger per fret from C4 (finger 1 = C4, 2 = C♯4, 3 = D4, 4 = D♯4), so the card\'s rhythm and shape can be heard.',
    ],
    hear: 'Each note should be equal in volume and length; listen for weak fingers (usually 3 and 4).',
    guitar: [
      'Start at fret 5 on the 6th string, play the sequence, then move to the next string.',
      'Keep fingers close to the frets and lift them only as far as needed.',
    ],
    practice: [
      'Deal Left Hand Practice: play the sequence on the dealt string, 4 notes per beat at a slow tempo.',
      'Move the sequence up one fret per repetition from fret 1 to fret 12.',
    ],
    mistakes: [
      'Squeezing too hard — use the least pressure that gives a clean note.',
    ],
    next: 'Combine with Right Hand paths for full two-hand coordination.',
  },
  righthand: {
    title: 'Right-hand string paths',
    concept: 'A right-hand path is an order of strings to pick, such as 3-4-2. Practising every path makes string crossing automatic for arpeggios, fingerstyle and crosspicking.',
    build: [
      'Strings are numbered from the highest (1 = high E) to the lowest (6 = low E; 7 and 8 on extended-range guitars).',
      'Paths are grouped by length, for 2- to 8-string sets; the tab view shows each path on the open strings.',
      'Playback plays the open strings in path order: Arpeggio is the picking pattern, Together the same strings strummed.',
    ],
    hear: 'Listen for even timing as you cross strings, especially when skipping strings.',
    guitar: [
      'Try each path with alternate picking, then with fingers (p-i-m-a).',
      'Hold a chord with the left hand and keep the path — instant arpeggio patterns.',
    ],
    practice: [
      'Deal Right Hand Practice: play the path on open strings, then over the dealt key\'s I chord.',
    ],
    mistakes: [
      'Moving the whole arm — crossing should come from the wrist and fingers.',
    ],
    next: 'Combine with Left Hand sequences and the Technique deck.',
  },
  base0: {
    title: 'Base 0: thinking in numbers',
    concept: 'Base 0 writes every chord, scale, interval and pattern as semitones above its root (root = 0). The result is key-independent: 0-4-7 is a major triad on any root.',
    build: [
      'Semitone map: 0 root, 1 ♭2, 2 2, 3 ♭3, 4 3, 5 4, 6 ♯4/♭5, 7 5, 8 ♭6, 9 6, 10 ♭7, 11 7, 12 octave.',
      'Examples: major 0-4-7, minor 0-3-7, dominant 7 0-4-7-10, major scale 0-2-4-5-7-9-11, minor pentatonic 0-3-5-7-10.',
      'Progressions use the root of each chord in Base 0: I–V–vi–IV = 0-7-9-5.',
      'Left-hand cards give finger offsets from the first finger instead of semitones.',
    ],
    hear: 'Each Base 0 card plays exactly as its source card in C, so the numbers and the sound connect directly.',
    guitar: [
      'On one string Base 0 numbers are fret distances: 0-4-7 from fret 5 is frets 5, 9, 12.',
    ],
    practice: [
      'Convert three cards from any deck to Base 0 yourself, then check the Base 0 card.',
      'Play a Base 0 formula from three different roots.',
    ],
    mistakes: [
      'Mixing degree numbers (1–3–5) with Base 0 semitones (0-4-7).',
    ],
    next: 'Every game shows the Base 0 of its subject so the idea can be moved to any key.',
  },
};

TD['lessons.js'] = { LESSONS, LESSON_SECTIONS };
})(window.TD = window.TD || {});
