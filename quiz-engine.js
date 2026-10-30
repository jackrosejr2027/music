/**
 * Scales Thesaurus v1.0 - Offline Quiz / Test / Exam engine
 * Questions are generated from the app's own music-theory data, so every attempt is fresh
 * and nothing needs a network connection. Results are stored locally (st_quiz_results)
 * and feed the Progress page. Passing an exam unlocks an offline PDF certificate.
 */
(function () {
    'use strict';
    const mt = new MusicTheory();
    const NOTES = mt.notes;
    const ENH = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
    const rand = (n) => Math.floor(Math.random() * n);
    const pick = (arr) => arr[rand(arr.length)];
    const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const showNote = (n) => { const s = mt.toSharp(n); return ENH[s] ? s + '/' + ENH[s] : s; };
    const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)] || 'th');
    const MAIN_IV = ['b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'].filter(i => mt.intervals[i]);
    const chordFormula = (ids) => {
        if (ids.join(' ') === '1 b3 b5 6') return '1 b3 b5 bb7';
        return ids.map((iv, i) => {
            if (i < 3) return iv;
            const ext = { '2': '9', 'b2': 'b9', '#2': '#9', '4': '11', '#4': '#11', 'b6': 'b13' };
            if (iv === '6') return i >= 4 ? '13' : '6';
            return ext[iv] || iv;
        }).join(' ');
    };
    const has = (o, ids) => ids.filter(id => o[id]);

    /** Build a question with exactly 4 unique options. */
    function q(text, answer, distractorPool, explain) {
        const opts = [answer];
        shuffle(distractorPool).forEach(d => { if (opts.length < 4 && !opts.includes(d)) opts.push(d); });
        return { text, answer, options: shuffle(opts), explain: explain || '' };
    }

    /** v1.0: attach a fretboard diagram to a question (shown with the feedback). */
    const fb = (qq, key, type, id) => Object.assign(qq, { fb: { key: key, type: type, id: id } });

    const G = {
        intervalSemitones() {
            const id = pick(MAIN_IV), iv = mt.intervals[id];
            return q('How many semitones are in a ' + iv.name + '?', String(iv.semitones),
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'], iv.name + ' (' + iv.shortName + ') spans ' + iv.semitones + ' semitones.');
        },
        intervalAbove() {
            const key = pick(NOTES), id = pick(MAIN_IV), iv = mt.intervals[id];
            const ans = showNote(mt.getNoteFromInterval(key, id));
            return fb(q('Which note is a ' + iv.name + ' above ' + showNote(key) + '?', ans, NOTES.map(showNote),
                showNote(key) + ' + ' + iv.semitones + ' semitones = ' + ans + '.'), key, 'interval', id);
        },
        intervalIdentify() {
            const key = pick(NOTES), id = pick(MAIN_IV), iv = mt.intervals[id];
            const target = mt.getNoteFromInterval(key, id);
            return fb(q('What interval is ' + showNote(key) + ' up to ' + showNote(target) + '?', iv.name,
                MAIN_IV.map(i => mt.intervals[i].name), 'The distance is ' + iv.semitones + ' semitones: a ' + iv.name + '.'), key, 'interval', id);
        },
        halfStep() {
            const i = rand(12), up = Math.random() < 0.5;
            const ans = showNote(NOTES[(i + (up ? 1 : 11)) % 12]);
            return q('Which note is a half step ' + (up ? 'above ' : 'below ') + showNote(NOTES[i]) + '?', ans, NOTES.map(showNote),
                'A half step (semitone) is the smallest distance between two notes.');
        },
        majorScaleDegree() {
            const key = pick(['C', 'G', 'D', 'A', 'E', 'F', 'A#', 'D#', 'B', 'G#']);
            const notes = mt.getScaleNotes(key, 'major'), d = 2 + rand(6);
            return q('What is the ' + ordinal(d) + ' note of the ' + showNote(key) + ' major scale?', showNote(notes[d - 1]), NOTES.map(showNote),
                showNote(key) + ' major: ' + notes.join(' - '));
        },
        majorScaleNotIn() {
            const key = pick(NOTES), notes = mt.getScaleNotes(key, 'major').map(mt.toSharp.bind(mt));
            const outside = NOTES.filter(n => !notes.includes(n));
            const ans = showNote(pick(outside));
            return fb(q('Which note is NOT in the ' + showNote(key) + ' major scale?', ans, notes.map(showNote),
                showNote(key) + ' major: ' + mt.getScaleNotes(key, 'major').join(' - ')), key, 'scale', 'major');
        },
        majorFormula() {
            return q('What is the step pattern of the major scale?', 'W W H W W W H',
                ['W H W W H W W', 'W W W H W W H', 'H W W W H W W', 'W H W W W H W'], 'Whole, Whole, Half, Whole, Whole, Whole, Half.');
        },
        triadQuality() {
            const types = has(mt.chords, ['major', 'minor', 'diminished', 'augmented']);
            const t = pick(types), key = pick(NOTES);
            const notes = mt.getChordNotes(key, t).map(showNote).join(' - ');
            return fb(q('The notes ' + notes + ' form which triad?', mt.chords[t].name, types.map(x => mt.chords[x].name),
                mt.chords[t].name + ' triad formula: ' + mt.chords[t].intervals.join(' ')), key, 'chord', t);
        },
        triadSpell() {
            const t = pick(has(mt.chords, ['major', 'minor'])), key = pick(NOTES);
            const right = mt.getChordNotes(key, t).map(showNote).join(' - ');
            const wrongs = has(mt.chords, ['major', 'minor', 'diminished', 'augmented', 'sus4', 'sus2']).filter(x => x !== t)
                .map(x => mt.getChordNotes(key, x).map(showNote).join(' - '));
            return fb(q('Which notes spell ' + showNote(key) + ' ' + mt.chords[t].name + '?', right, wrongs, 'Formula ' + mt.chords[t].intervals.join(' ')), key, 'chord', t);
        },
        seventhFormula() {
            const ids = has(mt.chords, ['major7', 'dominant7', 'minor7', 'half_diminished', 'diminished7']);
            const t = pick(ids), key = pick(NOTES);
            const formula = chordFormula(mt.chords[t].intervals);
            const notes = mt.getChordNotes(key, t).map(showNote).join(' - ');
            const spellings = ids.filter(id => id !== t).map(id => mt.getChordNotes(key, id).map(showNote).join(' - '));
            return fb(q('Which notes spell the ' + key + ' ' + mt.chords[t].name + ' chord (' + formula + ')?', notes, spellings,
                mt.chords[t].name + ' = ' + formula), key, 'chord', t);
        },
        seventhName() {
            const ids = has(mt.chords, ['major7', 'dominant7', 'minor7', 'half_diminished', 'diminished7']);
            const t = pick(ids);
            return fb(q('Which chord has the formula ' + chordFormula(mt.chords[t].intervals) + '?', mt.chords[t].name, ids.map(x => mt.chords[x].name)), 'C', 'chord', t);
        },
        extensionName() {
            const ids = has(mt.chords, ['maj9', 'dom9', 'min9', 'maj11', 'dom11', 'min11', 'maj13', 'dom13', 'min13', '7b9', '7#9', '7#11', '7b13', '13#9', '13b9', '6add9', '9sus4', '13sus4', 'maj7#11', 'maj9#11', 'maj13#11', 'alt7']);
            const t = pick(ids);
            return fb(q('Which chord is spelled ' + chordFormula(mt.chords[t].intervals) + '?', mt.chords[t].name, ids.map(x => mt.chords[x].name),
                'Extensions above the 7th are named 9, 11 and 13 (2, 4 and 6 an octave higher).'), 'C', 'chord', t);
        },
        minorScales() {
            const ids = has(mt.scales, ['natural_minor', 'harmonic_minor', 'melodic_minor']);
            const choices = has(mt.scales, ['natural_minor', 'harmonic_minor', 'melodic_minor', 'dorian', 'phrygian']);
            const t = pick(ids), key = pick(NOTES);
            const formula = mt.scales[t].intervals.join(' ');
            const notes = mt.getScaleNotes(key, t).map(showNote).join(' - ');
            const spellings = choices.filter(id => id !== t).map(id => mt.getScaleNotes(key, id).map(showNote).join(' - '));
            return fb(q('Which notes spell the ' + showNote(key) + ' ' + mt.scales[t].name + ' scale (' + formula + ')?', notes, spellings, mt.scales[t].name + ' uses ' + formula + '.'), key, 'scale', t);
        },
        modeDegree() {
            const modes = has(mt.scales, ['major', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'natural_minor', 'locrian']);
            const i = rand(modes.length);
            const label = (id) => id === 'major' ? 'Ionian (Major)' : id === 'natural_minor' ? 'Aeolian (Natural Minor)' : mt.scales[id].name;
            return q('Which mode starts on the ' + ordinal(i + 1) + ' degree of the major scale?', label(modes[i]), modes.map(label));
        },
        modeFormula() {
            const modes = has(mt.scales, ['dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian']);
            const t = pick(modes);
            return fb(q('Which mode has the formula ' + mt.scales[t].intervals.join(' ') + '?', mt.scales[t].name, modes.map(x => mt.scales[x].name),
                'Characteristic notes - Dorian: 6, Phrygian: b2, Lydian: #4, Mixolydian: b7, Locrian: b5.'), 'C', 'scale', t);
        },
        harmonicFunction() {
            const romans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
            const fn = ['Tonic', 'Subdominant (Pre-dominant)', 'Tonic', 'Subdominant (Pre-dominant)', 'Dominant', 'Tonic', 'Dominant'];
            const i = rand(7);
            return q('In a major key, what harmonic function does the ' + romans[i] + ' chord usually have?', fn[i],
                ['Tonic', 'Subdominant (Pre-dominant)', 'Dominant', 'Chromatic passing'], 'I, iii, vi = tonic; ii, IV = pre-dominant; V, vii° = dominant.');
        },
        diatonicChord() {
            const key = pick(['C', 'G', 'D', 'A', 'E', 'F', 'A#']);
            const notes = mt.getScaleNotes(key, 'major');
            const qual = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
            const romans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
            const i = rand(7);
            const name = (n, ql) => showNote(n) + ' ' + ql;
            const pool = []; notes.forEach((n, j) => { pool.push(name(n, qual[j])); pool.push(name(n, qual[j] === 'major' ? 'minor' : 'major')); });
            return fb(q('In ' + showNote(key) + ' major, what is the ' + romans[i] + ' chord?', name(notes[i], qual[i]), pool,
                'Diatonic triads in major: I ii iii IV V vi vii°.'), notes[i], 'chord', qual[i]);
        },
        scaleRecognition() {
            const ids = has(mt.scales, ['pentatonic_major', 'pentatonic_minor', 'blues', 'whole_tone', 'hungarian_minor', 'phrygian_dominant', 'double_harmonic', 'japanese', 'hirajoshi', 'major_blues', 'bebop_dominant', 'lydian_dominant', 'altered', 'in_sen']);
            const t = pick(ids);
            return fb(q('Which scale has the formula ' + mt.scales[t].intervals.join(' ') + '?', mt.scales[t].name, ids.map(x => mt.scales[x].name)), 'C', 'scale', t);
        },
        scaleToneCount() {
            const ids = has(mt.scales, ['pentatonic_major', 'pentatonic_minor', 'blues', 'whole_tone', 'major', 'chromatic', 'bebop_dominant', 'diminished']);
            const t = pick(ids);
            return fb(q('How many different notes are in the ' + mt.scales[t].name + ' scale?', String(mt.scales[t].intervals.length), ['5', '6', '7', '8', '12']), 'C', 'scale', t);
        },
        keySignature() {
            const ks = MUSIC_THEORY_DATA.keySignatures || {};
            const key = pick(Object.keys(ks).filter(k => k !== 'Cb'));
            const acc = Object.values(ks[key] || {});
            const n = acc.length, type = acc[0] === 'b' ? 'flat' : 'sharp';
            const ans = n === 0 ? 'None' : n + ' ' + type + (n > 1 ? 's' : '');
            const pool = ['None']; for (let i = 1; i <= 7; i++) { pool.push(i + ' sharp' + (i > 1 ? 's' : '')); pool.push(i + ' flat' + (i > 1 ? 's' : '')); }
            return q('How many sharps or flats are in the key of ' + key + ' major?', ans, pool);
        }
    };

    const QUIZZES = [
        { id: 'q-intervals', title: 'Interval Recognition', description: 'Identify intervals by name, size and distance.', difficulty: 'Beginner', topic: 'Intervals', count: 10, gens: ['intervalSemitones', 'intervalAbove', 'intervalIdentify'] },
        { id: 'q-major', title: 'Major Scale Construction', description: 'Build major scales and find their degrees in any key.', difficulty: 'Beginner', topic: 'Scales', count: 12, gens: ['majorScaleDegree', 'majorScaleNotIn', 'majorFormula', 'halfStep'] },
        { id: 'q-triads', title: 'Triad Identification', description: 'Identify major, minor, diminished and augmented triads.', difficulty: 'Beginner', topic: 'Chords', count: 15, gens: ['triadQuality', 'triadSpell'] },
        { id: 'q-minor', title: 'Minor Scale Variations', description: 'Natural, harmonic and melodic minor scales.', difficulty: 'Intermediate', topic: 'Scales', count: 10, gens: ['minorScales'] },
        { id: 'q-sevenths', title: '7th Chord Formulas', description: 'Match Maj7, m7, Dom7, dim7 and m7b5 to their formulas.', difficulty: 'Intermediate', topic: 'Chords', count: 12, gens: ['seventhFormula', 'seventhName'] },
        { id: 'q-modes', title: 'Modes of the Major Scale', description: 'Mode order and characteristic formulas.', difficulty: 'Intermediate', topic: 'Modes', count: 10, gens: ['modeDegree', 'modeFormula'] },
        { id: 'q-extensions', title: 'Advanced Chord Extensions', description: '9th, 11th and 13th chords and alterations.', difficulty: 'Advanced', topic: 'Chords', count: 15, gens: ['extensionName'] },
        { id: 'q-function', title: 'Harmonic Function', description: 'Tonic, subdominant and dominant roles of diatonic chords.', difficulty: 'Advanced', topic: 'Harmony', count: 10, gens: ['harmonicFunction', 'diatonicChord'] }
    ];
    const TESTS = [
        { id: 't-beginner', title: 'Beginner Theory Comprehensive Test', description: 'Note names, basic intervals, major scales and simple triads.', difficulty: 'Beginner', topic: 'Fundamentals', count: 20, minutes: 30, gens: ['halfStep', 'intervalSemitones', 'majorScaleDegree', 'majorFormula', 'triadQuality', 'keySignature'] },
        { id: 't-diatonic', title: 'Diatonic Harmony Test (Major Keys)', description: 'Chords built from the major scale and their functions.', difficulty: 'Intermediate', topic: 'Harmony', count: 20, minutes: 45, gens: ['diatonicChord', 'harmonicFunction', 'majorScaleDegree', 'triadSpell'] },
        { id: 't-minor', title: 'Minor Key Harmony Test', description: 'Natural, harmonic and melodic minor and their chords.', difficulty: 'Intermediate', topic: 'Harmony', count: 20, minutes: 45, gens: ['minorScales', 'triadQuality', 'seventhName', 'intervalIdentify'] },
        { id: 't-modes', title: 'Modes Application Test', description: 'Identify and apply the modes of the major scale.', difficulty: 'Intermediate', topic: 'Modes', count: 20, minutes: 40, gens: ['modeDegree', 'modeFormula', 'majorScaleNotIn'] },
        { id: 't-advanced', title: 'Advanced Chord Theory Test', description: 'Extended and altered chords, sevenths and functions.', difficulty: 'Advanced', topic: 'Chords / Harmony', count: 25, minutes: 60, gens: ['extensionName', 'seventhFormula', 'seventhName', 'harmonicFunction'] },
        { id: 't-scales', title: 'Scale Recognition & Application Test', description: 'Pentatonic, blues, modal and exotic scales.', difficulty: 'Advanced', topic: 'Scales', count: 25, minutes: 50, gens: ['scaleRecognition', 'scaleToneCount', 'minorScales', 'modeFormula'] }
    ];
    const ALL = Object.keys(G);
    const EXAMS = [
        { id: 'e-grade1', title: 'Grade 1 - Foundations Exam', description: 'Notes, intervals, major scales, key signatures and triads.', difficulty: 'Beginner', topic: 'Exam', count: 30, minutes: 40, pass: 70, exam: true, gens: ['halfStep', 'intervalSemitones', 'intervalAbove', 'majorScaleDegree', 'majorScaleNotIn', 'keySignature', 'triadQuality', 'triadSpell'] },
        { id: 'e-grade2', title: 'Grade 2 - Intermediate Exam', description: 'Minor scales, modes, sevenths and diatonic harmony.', difficulty: 'Intermediate', topic: 'Exam', count: 35, minutes: 50, pass: 70, exam: true, gens: ['minorScales', 'modeDegree', 'modeFormula', 'seventhFormula', 'seventhName', 'diatonicChord', 'intervalIdentify'] },
        { id: 'e-grade3', title: 'Grade 3 - Advanced Exam', description: 'Everything in the app: extensions, function, exotic scales.', difficulty: 'Advanced', topic: 'Exam', count: 40, minutes: 60, pass: 75, exam: true, gens: ALL }
    ];

    const EXTRA_QUIZZES = 'Interval Inversions|Enharmonic Note Names|Half Steps and Whole Steps|Major Scale Degrees|Major Scale Note Recognition|Minor Scale Formulas|Dorian Mode Color|Phrygian Mode Color|Lydian Mode Color|Mixolydian Mode Color|Locrian Mode Color|Pentatonic Scale Recognition|Blues Scale Notes|Exotic Scale Formulas|Scale Note Counts|Major Triad Spelling|Minor Triad Spelling|Diminished Chord Quality|Augmented Chord Quality|Suspended Chord Formulas|Seventh Chord Quality|Seventh Chord Spelling|Ninth Chord Extensions|Altered Dominant Colors|Added-Tone Chords|Diatonic Chord Qualities|Roman Numeral Functions|Tonic and Dominant|Key Signature Reading|Relative Major and Minor|Harmonic Minor Leading Tone|Melodic Minor Degrees|Chord Tone Recognition|Guide Tone Movement|Triad Inversions|Chord Formula Reading|Intervals Above a Root|Chromatic Scale Notes|Ear Training: Interval Size|Scale Formula Challenge|Harmony Function Review|Fretboard Theory Review'.split('|');
    const EXTRA_TESTS = 'Fundamentals and Note Names|Interval Recognition and Inversion|Major Scale Construction|Key Signature Fluency|Major Scale Degree Mapping|Natural Minor Scale Theory|Harmonic Minor Application|Melodic Minor Application|Pentatonic Scale Fluency|Blues Scale Application|Diatonic Triads in Major|Diatonic Seventh Chords|Triad Formula Mastery|Seventh Chord Formula Mastery|Suspended and Added-Tone Chords|Chord Extensions: Ninths|Chord Extensions: Elevenths and Thirteenths|Altered Dominant Harmony|Chord Inversions and Bass Notes|Voice Leading Fundamentals|Roman Numeral Analysis|Tonic and Dominant Function|Major-Key Cadences|Minor-Key Cadences|Relative and Parallel Keys|Modes: Formula and Sound|Dorian and Mixolydian Application|Phrygian and Locrian Application|Lydian Harmony|Scale Recognition: Five-Note Sets|Scale Recognition: Symmetric Sets|Bebop and Passing Tones|Chromatic Approach Notes|Fretboard Interval Mapping|Chord-Tone Improvisation|Guide Tones Through Changes|Major Progression Analysis|Minor Progression Analysis|Blues Harmony|Jazz ii-V-I Harmony|Ear Training: Chord Quality|Interval Ear Training|Music Theory Comprehensive|Applied Fretboard Theory'.split('|');
    const EXTRA_EXAMS = 'Grade 1: Notes and Intervals|Grade 1: Major Scale and Key Signatures|Grade 1: Triads and Chord Spelling|Grade 2: Minor Scales|Grade 2: Pentatonic and Blues|Grade 2: Major-Scale Modes|Grade 2: Diatonic Harmony|Grade 2: Seventh Chords|Grade 2: Chord Inversions|Grade 2: Major-Key Progressions|Grade 2: Minor-Key Progressions|Grade 2: Fretboard Fundamentals|Grade 3: Advanced Intervals|Grade 3: Harmonic Minor Harmony|Grade 3: Melodic Minor Harmony|Grade 3: Altered Dominant Scales|Grade 3: Symmetric Scales|Grade 3: Extended Chord Formulas|Grade 3: Ninth and Eleventh Chords|Grade 3: Thirteenth Chords|Grade 3: Chord Substitutions|Grade 3: Voice Leading|Grade 3: Guide-Tone Lines|Grade 3: Modal Interchange|Grade 3: Borrowed Chords|Grade 3: Jazz Harmony|Grade 3: Bebop Language|Grade 3: Chord-Tone Improvisation|Grade 3: Key and Mode Recognition|Grade 3: Scale Formula Analysis|Grade 3: Altered Chord Analysis|Grade 3: Fretboard Fluency|Grade 3: Blues Performance Theory|Grade 3: Ear Training|Grade 3: Harmonic Function|Grade 3: Cadence Analysis|Grade 3: Diatonic Chord Analysis|Grade 3: Chromatic Harmony|Grade 3: Contemporary Guitar Harmony|Grade 3: Music Theory Synthesis|Honors: Interval and Scale Analysis|Honors: Chord Formula Analysis|Honors: Progression and Function|Honors: Complete Theory Practicum|Final: Applied Musicianship|Final: Comprehensive Theory|Final: Fretboard Performance'.split('|');
    const GENS_BY_TOPIC = [
        ['intervalSemitones', 'intervalAbove', 'intervalIdentify', 'halfStep'],
        ['majorScaleDegree', 'majorScaleNotIn', 'majorFormula', 'minorScales'],
        ['triadQuality', 'triadSpell', 'diatonicChord', 'seventhFormula'],
        ['seventhName', 'extensionName', 'harmonicFunction', 'diatonicChord'],
        ['modeDegree', 'modeFormula', 'scaleRecognition', 'scaleToneCount'],
        ['keySignature', 'majorScaleDegree', 'harmonicFunction', 'halfStep']
    ];
    function generatorsFor(title, index) {
        const t = title.toLowerCase();
        const group = /interval|ear training|enharmonic|note names/.test(t) ? 0
            : /triad|chord|voicing|inversion|extension|dominant|guide tone/.test(t) ? (/extension|dominant|seventh|guide tone/.test(t) ? 3 : 2)
            : /key signature|key and|relative|parallel|function|progression|cadence|harmony|roman numeral/.test(t) ? 5
            : /mode|dorian|phrygian|lydian|mixolydian|locrian|pentatonic|blues|scale|chromatic|bebop|minor/.test(t) ? 4
            : index % GENS_BY_TOPIC.length;
        return GENS_BY_TOPIC[group];
    }
    function appendAssessments(target, titles, prefix, kind) {
        titles.forEach((title, i) => {
            const advanced = i >= Math.floor(titles.length * 0.55);
            target.push({
                id: prefix + '-extra-' + String(i + 1).padStart(2, '0'), title,
                description: 'A fresh, locally generated assessment covering ' + title.toLowerCase() + '.',
                difficulty: advanced ? 'Advanced' : i < 10 ? 'Beginner' : 'Intermediate',
                topic: title.split(':')[0], count: kind === 'quiz' ? 10 : kind === 'test' ? 20 : 30,
                minutes: kind === 'quiz' ? undefined : kind === 'test' ? 35 : 45,
                pass: kind === 'exam' ? 70 : undefined, exam: kind === 'exam',
                gens: generatorsFor(title, i)
            });
        });
    }
    appendAssessments(QUIZZES, EXTRA_QUIZZES, 'q', 'quiz');
    appendAssessments(TESTS, EXTRA_TESTS, 't', 'test');
    appendAssessments(EXAMS, EXTRA_EXAMS, 'e', 'exam');

    function build(cfg) {
        const out = [], seen = new Set();
        let guard = 0;
        while (out.length < cfg.count && guard++ < cfg.count * 30) {
            const gen = G[cfg.gens[out.length % cfg.gens.length]] || G[pick(cfg.gens)];
            let item;
            try { item = gen(); } catch (e) { continue; }
            if (!item || item.options.length < 2 || seen.has(item.text)) continue;
            seen.add(item.text);
            out.push(item);
        }
        return shuffle(out);
    }

    function saveResult(cfg, kind, score, total, seconds) {
        let res = [];
        try {
            const stored = JSON.parse(localStorage.getItem('st_quiz_results') || '[]');
            if (Array.isArray(stored)) res = stored.filter(item => item && typeof item === 'object');
        } catch (e) { /* Recover from unavailable or malformed browser storage. */ }
        res.push({ id: cfg.id, title: cfg.title, kind, score, total, pct: Math.round(100 * score / total), seconds, date: new Date().toISOString() });
        try { localStorage.setItem('st_quiz_results', JSON.stringify(res.slice(-500))); } catch (e) { /* Results remain usable for this attempt. */ }
    }
    function best(id) {
        try {
            const res = JSON.parse(localStorage.getItem('st_quiz_results') || '[]');
            if (!Array.isArray(res)) return null;
            const scores = res.filter(item => item && item.id === id && Number.isFinite(Number(item.pct))).map(item => Number(item.pct));
            return scores.length ? Math.max(...scores) : null;
        } catch (e) { return null; }
    }

    function certificatePDF(cfg, pct) {
        const JsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!JsPDF) { alert('PDF engine failed to load.'); return; }
        let savedName = '';
        try { savedName = localStorage.getItem('st_cert_name') || ''; } catch (e) { /* Storage is optional for certificate downloads. */ }
        const name = prompt('Name to print on the certificate:', savedName) || '';
        try { localStorage.setItem('st_cert_name', name); } catch (e) { /* ignore */ }
        const doc = new JsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
        doc.setDrawColor(44, 62, 80); doc.setLineWidth(6); doc.rect(24, 24, W - 48, H - 48);
        doc.setLineWidth(1.5); doc.rect(38, 38, W - 76, H - 76);
        doc.setFont('times', 'bold'); doc.setFontSize(40); doc.setTextColor(44, 62, 80);
        doc.text('Certificate of Achievement', W / 2, 150, { align: 'center' });
        doc.setFont('times', 'normal'); doc.setFontSize(18); doc.setTextColor(60, 60, 60);
        doc.text('This certifies that', W / 2, 210, { align: 'center' });
        doc.setFont('times', 'bolditalic'); doc.setFontSize(32); doc.setTextColor(20, 20, 20);
        doc.text(name || 'Scales Thesaurus Student', W / 2, 260, { align: 'center' });
        doc.setFont('times', 'normal'); doc.setFontSize(18); doc.setTextColor(60, 60, 60);
        doc.text('has passed the', W / 2, 305, { align: 'center' });
        doc.setFont('times', 'bold'); doc.setFontSize(24); doc.setTextColor(44, 62, 80);
        doc.text(cfg.title, W / 2, 345, { align: 'center' });
        doc.setFont('times', 'normal'); doc.setFontSize(16); doc.setTextColor(60, 60, 60);
        doc.text('with a score of ' + pct + '%  -  ' + new Date().toLocaleDateString(), W / 2, 385, { align: 'center' });
        doc.setFontSize(11); doc.setTextColor(130, 130, 130);
        doc.text('Scales Thesaurus v' + ((window.ST && ST.version) || '1.0.0'), W / 2, H - 60, { align: 'center' });
        const blob = doc.output('blob');
        if (window.ST && ST.download) ST.download(blob, 'certificate_' + cfg.id + '.pdf'); else doc.save('certificate.pdf');
    }

    function run(host, cfg, kind, back) {
        const questions = build(cfg);
        let idx = 0, score = 0, answered = false, timer = null, timedOut = false;
        const answers = [];
        const started = Date.now();
        const deadline = cfg.minutes ? started + cfg.minutes * 60000 : null;
        host.innerHTML = '';
        const box = document.createElement('div');
        box.className = 'stq-runner';
        host.appendChild(box);
        host.scrollIntoView({ behavior: 'smooth', block: 'start' });

        function finish() {
            if (timer) clearInterval(timer);
            const secs = Math.round((Date.now() - started) / 1000);
            const total = questions.length;
            // unanswered questions count as wrong
            const pct = Math.round(100 * score / total);
            saveResult(cfg, kind, score, total, secs);
            const passed = cfg.pass ? pct >= cfg.pass : null;
            box.innerHTML = '<h2>' + ST.escape(cfg.title) + '</h2>' +
                '<div class="stq-score">' + score + ' / ' + total + ' <span>(' + pct + '%)</span></div>' +
                (passed === null ? '' : '<p class="stq-verdict ' + (passed ? 'pass' : 'fail') + '">' + (passed ? 'Passed - congratulations!' : 'Not passed - pass mark is ' + cfg.pass + '%') + '</p>') +
                (timedOut ? '<p class="stq-verdict fail">Time limit reached. Unanswered questions count as incorrect.</p>' : '') +
                '<p class="stq-muted">Time: ' + Math.floor(secs / 60) + 'm ' + (secs % 60) + 's</p>' +
                '<div class="stq-actions"></div><div class="stq-review"></div>';
            const acts = box.querySelector('.stq-actions');
            const mk = (label, fn, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'stq-btn ' + (cls || ''); b.textContent = label; b.addEventListener('click', fn); acts.appendChild(b); };
            mk('Try again', () => run(host, cfg, kind, back), 'primary');
            if (passed) mk('Download certificate (PDF)', () => certificatePDF(cfg, pct));
            mk('Back to list', back);
            const rev = box.querySelector('.stq-review');
            questions.forEach((qq, i) => {
                const a = answers[i];
                const d = document.createElement('div');
                d.className = 'stq-rev ' + (a === qq.answer ? 'ok' : 'bad');
                d.innerHTML = '<b>' + (i + 1) + '. ' + ST.escape(qq.text) + '</b><br>Your answer: ' + ST.escape(a || '(none)') + (a === qq.answer ? '' : ' &nbsp;|&nbsp; Correct: ' + ST.escape(qq.answer)) + (qq.explain ? '<br><small>' + ST.escape(qq.explain) + '</small>' : '');
                rev.appendChild(d);
            });
        }

        function render() {
            if (idx >= questions.length) return finish();
            answered = false;
            const qq = questions[idx];
            box.innerHTML = '<div class="stq-top"><span>' + ST.escape(cfg.title) + '</span><span>Question ' + (idx + 1) + ' / ' + questions.length + '</span><span class="stq-timer"></span></div>' +
                '<div class="stq-bar"><div style="width:' + (100 * idx / questions.length) + '%"></div></div>' +
                '<h3 class="stq-q">' + ST.escape(qq.text) + '</h3><div class="stq-opts"></div><div class="stq-feedback"></div>' +
                '<div class="stq-actions"><button type="button" class="stq-btn quit">Quit</button><button type="button" class="stq-btn primary next" disabled>Next</button></div>';
            const opts = box.querySelector('.stq-opts');
            qq.options.forEach((o, oi) => {
                const b = document.createElement('button');
                b.type = 'button'; b.className = 'stq-opt'; b.textContent = (oi + 1) + '. ' + o; b.dataset.v = o;
                b.addEventListener('click', () => choose(o));
                opts.appendChild(b);
            });
            box.querySelector('.next').addEventListener('click', () => { idx++; render(); });
            box.querySelector('.quit').addEventListener('click', () => { if (confirm('End this assessment now? Unanswered questions count as incorrect.')) finish(); });
            tick();
        }

        function choose(v) {
            if (answered) return;
            answered = true;
            const qq = questions[idx];
            answers[idx] = v;
            const right = v === qq.answer;
            if (right) score++;
            box.querySelectorAll('.stq-opt').forEach(b => {
                b.disabled = true;
                if (!cfg.exam) {
                    if (b.dataset.v === qq.answer) b.classList.add('correct');
                    else if (b.dataset.v === v) b.classList.add('wrong');
                }
            });
            if (!cfg.exam) {
                box.querySelector('.stq-feedback').innerHTML = '<p class="' + (right ? 'pass' : 'fail') + '">' + (right ? 'Correct!' : 'Not quite - the answer is ' + ST.escape(qq.answer) + '.') + '</p>' + (qq.explain ? '<p class="stq-muted">' + ST.escape(qq.explain) + '</p>' : '');
                if (qq.fb && window.MiniFretboard) {
                    const host = document.createElement('div');
                    host.className = 'stq-fb';
                    box.querySelector('.stq-feedback').appendChild(host);
                    MiniFretboard.widget(host, Object.assign({ keySelect: false }, qq.fb));
                }
            }
            const nx = box.querySelector('.next');
            nx.disabled = false;
            nx.textContent = idx === questions.length - 1 ? 'Finish' : 'Next';
            nx.focus();
        }

        function tick() {
            const el = box.querySelector('.stq-timer');
            if (!deadline || !el) return;
            const left = Math.max(0, deadline - Date.now());
            el.textContent = '⏱ ' + Math.floor(left / 60000) + ':' + String(Math.floor(left / 1000) % 60).padStart(2, '0');
            if (left <= 0) { timedOut = true; clearInterval(timer); timer = null; finish(); }
        }
        if (deadline) timer = setInterval(tick, 1000);

        box.addEventListener('keydown', (e) => {
            const n = parseInt(e.key, 10);
            if (n >= 1 && n <= 4) { const b = box.querySelectorAll('.stq-opt')[n - 1]; if (b) b.click(); }
            else if (e.key === 'Enter') { const nx = box.querySelector('.next'); if (nx && !nx.disabled) nx.click(); }
        });
        box.tabIndex = -1;
        render();
        box.focus();
    }

    /** v1.1: printable question sheet plus answer key, drawn fresh from the same generators as a run. */
    function assessmentPdf(cfg, kind) {
        if (!window.StudyPdf) throw new Error('PDF helper failed to load.');
        const items = build(cfg);
        if (!items.length) throw new Error('No questions could be generated for this ' + kind + '.');
        const pdf = StudyPdf.create();
        const facts = [cfg.difficulty, cfg.topic, items.length + ' questions', cfg.minutes ? cfg.minutes + ' minutes' : '', cfg.pass ? 'Pass mark ' + cfg.pass + '%' : ''];
        pdf.title(cfg.title);
        pdf.text(facts.filter(Boolean).join('  |  '));
        if (cfg.description) pdf.text(cfg.description);
        pdf.rule();
        items.forEach((item, i) => {
            pdf.question(i + 1, item.text);
            item.options.forEach((opt, j) => pdf.option(String.fromCharCode(65 + j), opt));
        });
        pdf.newPage();
        pdf.title(cfg.title + ': answer key');
        items.forEach((item, i) => {
            const letter = String.fromCharCode(65 + item.options.indexOf(item.answer));
            pdf.text((i + 1) + '. ' + letter + ' - ' + item.answer + (item.explain ? '. ' + item.explain : ''));
        });
        return pdf;
    }

    function mountList(container, list, kind) {
        const host = container;
        let searchTerm = '', difficulty = 'all';
        function show() {
            host.innerHTML = '';
            host.classList.remove('stq-host-run');
            const filterBar = document.createElement('div');
            filterBar.className = 'stq-filterbar';
            const search = document.createElement('input');
            search.type = 'search';
            search.placeholder = 'Search by title or topic';
            search.setAttribute('aria-label', 'Search assessments by title or topic');
            search.value = searchTerm;
            const level = document.createElement('select');
            level.setAttribute('aria-label', 'Filter by difficulty');
            [['all', 'All levels'], ['Beginner', 'Beginner'], ['Intermediate', 'Intermediate'], ['Advanced', 'Advanced']].forEach(([value, label]) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = label;
                level.appendChild(option);
            });
            level.value = difficulty;
            const resultCount = document.createElement('span');
            resultCount.className = 'stq-filter-count';
            resultCount.setAttribute('aria-live', 'polite');
            filterBar.append(search, level, resultCount);
            host.appendChild(filterBar);
            const entries = [];
            const empty = document.createElement('p');
            empty.className = 'stq-empty';
            empty.textContent = 'No assessments match these filters.';
            empty.hidden = true;
            host.appendChild(empty);
            list.forEach(cfg => {
                const item = document.createElement('div');
                item.className = kind + '-item stq-item';
                const b = best(cfg.id);
                item.innerHTML = '<div class="' + kind + '-details"><h3>' + ST.escape(cfg.title) + '</h3><p>' + ST.escape(cfg.description) + '</p>' +
                    '<div class="' + kind + '-meta stq-meta"><span class="stq-level">' + cfg.difficulty + '</span><span>' + cfg.topic + '</span><span>' + cfg.count + ' Qs</span>' +
                    (cfg.minutes ? '<span>' + cfg.minutes + ' min</span>' : '') + (cfg.pass ? '<span>Pass ' + cfg.pass + '%</span>' : '') +
                    (b !== null ? '<span class="stq-best">Best ' + b + '%</span>' : '') + '</div></div>';
                const go = document.createElement('button');
                go.type = 'button';
                go.className = 'take-' + kind + '-button stq-start';
                go.textContent = kind === 'quiz' ? 'Start quiz' : 'Start ' + (kind === 'test' ? 'Test' : 'Exam');
                go.addEventListener('click', () => { host.classList.add('stq-host-run'); run(host, cfg, kind, show); });
                const pdfButton = document.createElement('button');
                pdfButton.type = 'button';
                pdfButton.className = 'stq-pdf';
                pdfButton.textContent = 'Download ' + kind + ' to PDF';
                pdfButton.addEventListener('click', () => {
                    try { assessmentPdf(cfg, kind).save(cfg.title + ' (' + kind + ')'); }
                    catch (e) { window.alert('Could not create the PDF: ' + e.message); }
                });
                const actions = document.createElement('div');
                actions.className = 'stq-item-actions';
                actions.append(go, pdfButton);
                item.appendChild(actions);
                host.appendChild(item);
                entries.push({ item, cfg, search: (cfg.title + ' ' + cfg.topic + ' ' + cfg.description).toLowerCase() });
            });
            function updateList() {
                searchTerm = search.value.trim().toLowerCase();
                difficulty = level.value;
                let visible = 0;
                entries.forEach(({ item, cfg, search: words }) => {
                    const matches = (!searchTerm || words.includes(searchTerm)) && (difficulty === 'all' || cfg.difficulty === difficulty);
                    item.hidden = !matches;
                    if (matches) visible++;
                });
                resultCount.textContent = 'Showing ' + visible + ' of ' + list.length;
                empty.hidden = visible !== 0;
            }
            search.addEventListener('input', updateList);
            level.addEventListener('change', updateList);
            updateList();
        }
        show();
        // v1.0: courses link straight to one quiz/test/exam via #id
        const target = list.find(cfg => '#' + cfg.id === location.hash);
        if (target) { host.classList.add('stq-host-run'); run(host, target, kind, show); }
    }

    window.QuizEngine = { QUIZZES, TESTS, EXAMS, mountList, generators: G };
})();
