/**
 * Courses (v1.0) - previously four "coming soon" cards linking to home.html.
 * Each course is a sequence of real lessons, fretboard views, eBooks, quizzes, tests and
 * exams already in the app. Progress is read from local data, so it works offline.
 */
(function () {
    'use strict';
    const LESSON_PAT = [['scale', 'major'], ['scale', 'natural_minor', 'A'], ['scale', 'pentatonic_minor', 'A'], ['scale', 'pentatonic_major'], ['scale', 'blues', 'A'], ['chord', 'major'], ['chord', '5', 'E'], ['scale', 'dorian', 'D'], ['scale', 'mixolydian', 'G'], ['scale', 'harmonic_minor', 'A']];
    const L = (i, t) => ({ kind: 'Lesson', label: t, fb: { type: LESSON_PAT[i][0], id: LESSON_PAT[i][1], key: LESSON_PAT[i][2] || 'C' }, href: 'lessons.html#lesson-' + i, done: v => v.viewed.lesson && v.viewed.lesson[String(i)] });
    const P = (type, id, t) => ({ kind: type === 'scale' ? 'Scale' : 'Chord', label: t, fb: { type, id, key: 'C' }, href: 'fretboard.html?key=C&patternType=' + type + '&pattern=' + encodeURIComponent(id), done: v => v.viewed[type] && v.viewed[type][id] });
    const B = (id, t) => ({ kind: 'eBook', label: t, href: 'ebooks.html', done: v => v.viewed.ebook && v.viewed.ebook[id] });
    const Q = (id, t, page, pass) => ({ kind: page === 'coursesquizzes.html' ? 'Quiz' : page === 'coursestests.html' ? 'Test' : 'Exam', label: t, href: page + '#' + id, done: v => v.best(id) >= (pass || 60) });
    const PG = (page, t) => ({ kind: 'Practice', label: t, href: page, done: v => v.pages[page] });
    const QZ = 'coursesquizzes.html', TS = 'coursestests.html', EX = 'coursesexams.html';

    const COURSES = [
        { icon: '🎸', title: 'Foundations of Music Theory', level: 'Beginner', text: 'Notes, intervals, the major scale, key signatures and triads.', learn: ['Name every note and count intervals in semitones', 'Build the major scale from its W-W-H-W-W-W-H pattern', 'Read key signatures', 'Spell major, minor, diminished and augmented triads'], steps: [
            B('intervals', 'Read: Interval Recognition & Application'), Q('q-intervals', 'Interval Recognition', QZ),
            L(0, 'The Major Scale (Ionian)'), Q('q-major', 'Major Scale Construction', QZ),
            L(5, 'Building Major Chords'), P('chord', 'minor', 'Compare: the minor triad'), Q('q-triads', 'Triad Identification', QZ),
            Q('t-beginner', 'Beginner Comprehensive Test', TS), Q('e-grade1', 'Grade 1 Exam', EX, 70)] },
        { icon: '🎼', title: 'Scale Mastery for Guitarists', level: 'Intermediate', text: 'Major, minor, pentatonic, blues and modal scales across the neck.', learn: ['Map the neck note by note on guitar and bass', 'Play minor/major pentatonic and blues shapes in any key', 'Hear and use Dorian, Mixolydian and harmonic minor', 'Recognise scales from their formulas'], steps: [
            B('fretboard', 'Read: Visualizing the Fretboard'), L(1, 'The Natural Minor Scale'), L(2, 'The Minor Pentatonic'), L(3, 'The Major Pentatonic'), L(4, 'The Blues Scale'),
            Q('q-minor', 'Minor Scale Variations', QZ), L(7, 'The Dorian Mode'), L(8, 'The Mixolydian Mode'), Q('q-modes', 'Modes of the Major Scale', QZ),
            L(9, 'Harmonic Minor Tension'), Q('t-modes', 'Modes Application Test', TS), Q('t-scales', 'Scale Recognition Test', TS)] },
        { icon: '🎹', title: 'Chord Voicings & Progressions', level: 'Intermediate', text: 'Triads, sevenths, inversions and the progressions used in every genre.', learn: ['Stack thirds into triads and the five seventh-chord qualities', 'Use inversions for smooth voice leading', 'Know the diatonic chords of every major and minor key', 'Build, hear and transpose common progressions'], steps: [
            B('chords', 'Read: Chord Construction Masterclass'), L(6, 'Power Chords'), P('chord', 'major7', 'Major 7th'), P('chord', 'dominant7', 'Dominant 7th'), P('chord', 'minor7', 'Minor 7th'),
            P('chord', 'half_diminished', 'Half-diminished 7th'), Q('q-sevenths', '7th Chord Formulas', QZ), B('harmony', 'Read: Harmony and Chord Progressions'),
            PG('dummy.html', 'Build and play a progression'), Q('t-diatonic', 'Diatonic Harmony Test', TS), Q('t-minor', 'Minor Key Harmony Test', TS), Q('e-grade2', 'Grade 2 Exam', EX, 70)] },
        { icon: '🎷', title: 'Introduction to Jazz Harmony', level: 'Advanced', text: 'Extended and altered chords, melodic minor, diminished and bebop sounds.', learn: ['Understand tonic, pre-dominant and dominant function', 'Pick scales for each chord: melodic minor modes, diminished, bebop', 'Build 9th, 11th, 13th and altered dominant chords', 'Pass the Grade 3 exam'], steps: [
            Q('q-function', 'Harmonic Function', QZ), P('scale', 'melodic_minor', 'Melodic minor'), P('scale', 'lydian_dominant', 'Lydian dominant'), P('scale', 'altered', 'Altered scale'),
            P('scale', 'diminished', 'Diminished scale'), P('scale', 'bebop_dominant', 'Bebop dominant'), P('chord', 'dom9', 'Dominant 9th'), P('chord', '7#9', '7#9'), P('chord', 'maj7#11', 'Maj7#11'),
            Q('q-extensions', 'Advanced Chord Extensions', QZ), Q('t-advanced', 'Advanced Chord Theory Test', TS), Q('e-grade3', 'Grade 3 Exam', EX, 75)] }
    ];

    const EXTRA_LESSON_TITLES = [
        'Intervals Across the Neck', 'Half Steps and Whole Steps', 'Scale Degrees and Their Jobs', 'Relative Major and Minor', 'Parallel Major and Minor',
        'Harmonizing the Major Scale', 'The Diatonic Triad Map', 'Major Seventh Chords', 'Dominant Seventh Resolution', 'Minor Triad Construction',
        'The Diminished Triad', 'Suspended Chords', 'Triad Inversions', 'Smooth Voice Leading', 'Minor Seventh Chord Tones',
        'CAGED Shape Connections', 'Root Notes as Fretboard Landmarks', 'Scale Sequences', 'Diatonic Thirds', 'Pentatonic Sixth Jumps',
        'String-Skipping Pentatonic', 'Accurate Blues Bends', 'Controlled Guitar Vibrato', 'Slides as Phrase Connectors', 'Hammer-Ons and Pull-Offs',
        'Melodic Minor Color', 'Alternate Picking', 'Subdivision and the Metronome', 'Blues Phrasing and Space', 'Call and Response',
        'Targeting Chord Tones', 'Guide Tones in Seventh Chords', 'The ii-V-I Progression', 'The I-IV-V Progression', 'Minor-Key Dominant Resolution',
        'Borrowed Chords from Parallel Minor', 'Transposing by Scale Degree', 'Ear Training: Major and Minor Thirds', 'Build a Focused Practice Loop', 'Compose a Pentatonic Melody'
    ];
    const LN = (i) => ({
        kind: 'Lesson', label: EXTRA_LESSON_TITLES[i - 10] || 'Lesson ' + (i + 1), href: 'lessons.html#lesson-' + i,
        done: v => v.viewed.lesson && v.viewed.lesson[String(i)]
    });
    const EXTRA_COURSES = [
        ['Find Every Root on the Fretboard', 'Beginner', 'Build a reliable map of roots across all six strings, then use those landmarks to move between scale positions.', 'scale', 'major', 'scale', 'natural_minor', 26, 36, 'Locate octave roots without restarting from open strings.', 'Connect a familiar major pattern to its parallel minor.'],
        ['Interval Map in Every Position', 'Beginner', 'Learn interval distances on one string and transfer the same sounds to compact multi-string shapes.', 'scale', 'major', 'scale', 'more_scale_001', 10, 11, 'Recognize semitone and whole-tone movement by ear.', 'Find the same interval from several root positions.'],
        ['Major Scale Position Logic', 'Beginner', 'Connect major-scale notes and degrees across the neck instead of treating each position as an isolated box.', 'scale', 'major', 'scale', 'lydian', 12, 27, 'Hear the tonic and leading tone inside a scale pattern.', 'Sequence scale degrees across adjacent positions.'],
        ['Natural Minor Across the Neck', 'Beginner', 'Map the Aeolian sound, its chord tones, and its relationship to the relative major.', 'scale', 'natural_minor', 'scale', 'harmonic_minor', 13, 14, 'Find the flat 3rd, flat 6th, and flat 7th from any root.', 'Compare natural and harmonic minor without moving the tonic.'],
        ['Relative Major and Minor', 'Beginner', 'Use one note collection to hear two different tonal centers and understand relative keys.', 'scale', 'major', 'scale', 'natural_minor', 13, 46, 'Find a relative minor three semitones below a major tonic.', 'Make a phrase sound major or minor by changing its resolution.'],
        ['Minor Pentatonic Connections', 'Beginner', 'Link minor-pentatonic positions with roots, bends, and phrases that cross the neck.', 'scale', 'pentatonic_minor', 'scale', 'blues', 15, 30, 'Connect pentatonic boxes with a continuous fretboard route.', 'Use the blue note as passing tension, not a resting point.'],
        ['Major Pentatonic Melody', 'Beginner', 'Shape clear country, folk, and pop melodies from major-pentatonic notes and interval skips.', 'scale', 'pentatonic_major', 'scale', 'major_blues', 19, 49, 'Land on stable tonic, 3rd, and 5th notes.', 'Create melodic movement with sixth jumps and rests.'],
        ['Blues Scale and Bend Control', 'Intermediate', 'Pair the minor blues collection with accurate bends, phrasing, and chord-aware resolution.', 'scale', 'blues', 'chord', 'dominant7', 21, 31, 'Bend the flat 3rd or flat 5th toward a clear target pitch.', 'Build short call-and-response phrases over a dominant chord.'],
        ['Dorian for Minor Grooves', 'Intermediate', 'Bring out Dorian color over minor harmony by targeting its natural 6th.', 'scale', 'dorian', 'chord', 'minor7', 17, 24, 'Hear the difference between Dorian and natural minor.', 'Resolve scale phrases to minor-seventh chord tones.'],
        ['Phrygian Riffs and Tension', 'Intermediate', 'Use the flat 2nd to create a deliberate Phrygian sound while keeping riffs rhythmically tight.', 'scale', 'phrygian', 'scale', 'phrygian_dominant', 10, 22, 'Emphasize the flat 2nd against a stable root pedal.', 'Compare Phrygian minor with Phrygian dominant.'],
        ['Lydian Color and Harmony', 'Intermediate', 'Use the raised 4th to create bright melodic color over major and major-seventh sounds.', 'scale', 'lydian', 'chord', 'major7', 11, 18, 'Make the raised 4th audible without losing the tonic.', 'Connect Lydian notes to major-seventh chord tones.'],
        ['Mixolydian Dominant Lines', 'Intermediate', 'Build blues-inflected major lines over dominant chords and resolve their flat 7th deliberately.', 'scale', 'mixolydian', 'chord', 'dominant7', 12, 31, 'Contrast the flat 7th with the major 7th.', 'Target the 3rd and flat 7th through a dominant change.'],
        ['Locrian and Half-Diminished Harmony', 'Advanced', 'Hear the unstable fifth and flat second of Locrian over a minor-seven-flat-five chord.', 'scale', 'locrian', 'chord', 'half_diminished', 16, 32, 'Outline the half-diminished chord before adding scale color.', 'Resolve unstable scale degrees by small steps.'],
        ['Harmonic Minor Cadences', 'Intermediate', 'Use the raised leading tone to strengthen minor-key dominant-to-tonic motion.', 'scale', 'harmonic_minor', 'chord', 'dominant7', 35, 44, 'Hear the raised seventh pull toward the tonic.', 'Apply harmonic minor over the V chord in a minor key.'],
        ['Melodic Minor Vocabulary', 'Advanced', 'Contrast melodic minor with natural minor and apply its characteristic raised sixth and seventh.', 'scale', 'melodic_minor', 'scale', 'lydian_dominant', 25, 45, 'Locate the scale notes that change from natural minor.', 'Choose melodic-minor colors to match a chord function.'],
        ['Altered Dominant Scale Language', 'Advanced', 'Organize altered dominant tension around the chord tones and resolve it into a tonic.', 'scale', 'altered', 'chord', 'dominant7', 25, 40, 'Separate dominant chord tones from altered extensions.', 'Resolve altered notes by semitone into the next harmony.'],
        ['Whole-Tone and Augmented Symmetry', 'Advanced', 'Explore the repeating whole-tone sound and the augmented triads embedded in it.', 'scale', 'whole_tone', 'chord', 'augmented', 16, 19, "Recognize the scale's repeating whole-step pattern.", 'Use augmented chord symmetry to move between tonal centers.'],
        ['Diminished Scale Applications', 'Advanced', 'Use symmetrical diminished patterns to connect diminished chords and dominant tension.', 'scale', 'diminished', 'chord', 'diminished7', 20, 21, 'Identify the alternating whole- and half-step structure.', 'Move a diminished pattern by minor thirds and hear the symmetry.'],
        ['Japanese Pentatonic Colors', 'Intermediate', 'Compare Japanese-inspired five-note collections and use their gaps to shape spacious melodies.', 'scale', 'hirajoshi', 'scale', 'in_sen', 19, 29, 'Hear how a small note set can suggest a distinct mood.', "Create a phrase with rests around the collection's wider gaps."],
        ['240 New Scale Collections', 'Advanced', 'Explore newly added five- through nine-note pitch collections by formula and compare their fretboard shapes.', 'scale', 'more_scale_001', 'scale', 'more_scale_020', 16, 36, 'Read an interval formula and locate its notes from a chosen root.', 'Compare collections with the same note count but different colors.'],
        ['Chromatic Approach Notes', 'Advanced', 'Use all twelve tones as brief approaches to chord tones while keeping strong beats harmonically clear.', 'scale', 'chromatic', 'chord', 'major', 10, 30, 'Keep chromatic notes moving toward stable chord tones.', 'Place target notes on strong beats and approaches between them.'],
        ['Bebop Dominant Passing Notes', 'Advanced', 'Use the added passing tone to align dominant-scale chord tones with the beat.', 'scale', 'bebop_dominant', 'chord', 'dominant7', 27, 30, 'Hear the added major seventh as a passing tone.', 'Practice even eighth-note lines that land on chord tones.'],
        ['Harmonic Major Studies', 'Advanced', 'Explore the major tonic with a lowered sixth and use the contrast for distinctive harmony.', 'scale', 'harmonic_major', 'chord', 'major', 14, 46, 'Compare harmonic major with the ordinary major scale.', 'Build phrases around the lowered sixth and major seventh.'],
        ['Phrygian Dominant Lines', 'Advanced', 'Pair the flat second and major third for a focused dominant sound from harmonic minor.', 'scale', 'phrygian_dominant', 'chord', 'dominant7', 9, 35, 'Contrast the flat second and major third over a dominant root.', 'Resolve the scale into a minor tonic cadence.'],
        ['Major Triad Map', 'Beginner', 'Find major triads on string groups and connect their inversions to the major scale.', 'chord', 'major', 'scale', 'major', 16, 18, 'Spell root, major third, and fifth in several neck positions.', 'Use triad inversions to connect I, IV, and V.'],
        ['Minor Triads and Inversions', 'Beginner', 'Build minor triads, compare their third with major, and move through inversions smoothly.', 'chord', 'minor', 'chord', 'major', 19, 22, 'Hear the minor third as the defining chord tone.', 'Connect inversions with the smallest possible movement.'],
        ['Power Chord Routes', 'Beginner', 'Move root-fifth shapes across strings and the neck while keeping rhythm and muting controlled.', 'chord', '5', 'chord', 'minor', 26, 27, 'Locate roots on the low E and A strings.', 'Mute unused strings during position shifts.'],
        ['Suspended Chord Movement', 'Intermediate', 'Move between sus2, sus4, and resolved triads to create tension without declaring major or minor.', 'chord', 'sus2', 'chord', 'sus4', 21, 22, 'Resolve suspended notes into the third of a chord.', 'Use open-string-friendly changes without losing pulse.'],
        ['Major Seventh Guitar Voicings', 'Intermediate', 'Hear the major seventh color and choose compact voicings that keep the chord clear.', 'chord', 'major7', 'chord', 'maj9', 17, 18, 'Identify the major seventh against the root.', 'Voice a four-note chord across adjacent strings.'],
        ['Dominant Seventh Voice Leading', 'Intermediate', 'Guide dominant seventh chords toward tonic by resolving the third and flat seventh.', 'chord', 'dominant7', 'chord', 'dom9', 18, 31, 'Find the tritone formed by the third and flat seventh.', 'Resolve guide tones by semitone into a tonic chord.'],
        ['Minor Seventh Groove Shapes', 'Intermediate', 'Connect minor-seventh voicings to Dorian melodies and steady groove-based comping.', 'chord', 'minor7', 'scale', 'dorian', 24, 30, 'Keep the minor third and flat seventh audible in compact shapes.', 'Alternate chord stabs with short Dorian fills.'],
        ['Diminished Chord Resolution', 'Advanced', 'Use diminished triads and seventh chords as passing harmony that resolves by small motion.', 'chord', 'diminished7', 'scale', 'locrian', 20, 32, 'Recognize the stacked minor-third symmetry.', 'Resolve each voice to a nearby stable chord tone.'],
        ['Ninth Chords for Guitar', 'Intermediate', 'Add the ninth to triads and seventh chords while preserving the chord tones that define quality.', 'chord', 'dom9', 'chord', 'maj9', 17, 41, 'Distinguish add9 from a ninth chord containing a seventh.', 'Choose playable voicings that omit nonessential tones.'],
        ['11th and 13th Chord Voicings', 'Advanced', 'Select useful upper extensions and omit redundant notes to keep guitar voicings playable.', 'chord', 'dom11', 'chord', 'dom13', 31, 32, 'Hear the 11th and 13th as color tones above a seventh chord.', 'Build compact voicings from guide tones and one extension.'],
        ['Altered Dominant Chords', 'Advanced', 'Compare altered fifths and ninths over a dominant root and resolve the tension with intention.', 'chord', 'alt7', 'scale', 'altered', 30, 35, 'Identify altered chord tones from an interval formula.', 'Resolve one altered extension into a nearby tonic chord tone.'],
        ['Added-Tone Chord Formula Lab', 'Advanced', 'Read the expanded chord-formula catalog and audition how one added interval changes a base triad.', 'chord', 'more_chord_001', 'chord', 'more_chord_020', 22, 37, 'Translate chord formulas into note names in more than one key.', 'Compare added tones without confusing them with chord substitutions.'],
        ['Triad Pairs for Improvisation', 'Advanced', 'Combine two nearby triads to create lines that move beyond a single scale shape.', 'chord', 'major', 'chord', 'minor', 28, 29, 'Outline each triad before connecting their notes.', 'Create a phrase that alternates between two triad colors.'],
        ['Guide Tones Through Progressions', 'Advanced', 'Track thirds and sevenths across chord changes to create a clear harmonic line.', 'chord', 'major7', 'chord', 'dominant7', 31, 32, 'Find the third and seventh of each seventh chord.', 'Keep common tones and move other voices by the nearest step.'],
        ['Arpeggios as Melodies', 'Intermediate', 'Turn chord arpeggios into phrases with rhythm, direction, and scale-tone connections.', 'chord', 'minor7', 'scale', 'pentatonic_minor', 30, 38, 'Play chord tones in more than one order and register.', 'Connect arpeggio targets with short scale fragments.'],
        ['Major-Key Progressions', 'Beginner', 'Build and transpose I-IV-V and I-vi-IV-V progressions using diatonic triads.', 'chord', 'major', 'scale', 'major', 16, 33, 'Identify the primary chords by Roman numeral.', 'Transpose a progression while preserving its harmonic function.'],
        ['Minor-Key Cadences', 'Intermediate', 'Compare natural and harmonic minor harmony and strengthen the V-i resolution.', 'scale', 'harmonic_minor', 'chord', 'dominant7', 14, 44, 'Hear the raised leading tone in a minor cadence.', 'Use the dominant chord to make the minor tonic feel settled.'],
        ['Blues Harmony and Turnarounds', 'Intermediate', 'Combine dominant chords, blues-scale vocabulary, and short turnaround phrases.', 'scale', 'blues', 'chord', 'dominant7', 21, 39, 'Follow the I-IV-V changes without losing the blues pulse.', 'Use a compact turnaround phrase to lead back to the tonic.'],
        ['Circle of Fifths on Guitar', 'Intermediate', 'Use fifth relationships to map keys, dominant resolutions, and common chord movement.', 'scale', 'major', 'chord', 'dominant7', 12, 47, 'Find each key center and its dominant a fifth above.', 'Transpose a short cadence around the circle.'],
        ['Funk Rhythm and Muting', 'Intermediate', 'Keep chord stabs precise with left- and right-hand muting and clear subdivisions.', 'chord', 'minor7', 'scale', 'dorian', 27, 37, 'Mute between syncopated chord attacks.', 'Maintain an even subdivision while leaving rhythmic space.'],
        ['Picking and Subdivision', 'Beginner', 'Coordinate alternate picking with even eighth notes, string crossings, and controlled tempo changes.', 'scale', 'major', 'scale', 'pentatonic_minor', 26, 27, 'Synchronize both hands at a tempo that stays relaxed.', 'Keep subdivision even when crossing strings or changing positions.'],
        ['Legato and String Articulation', 'Intermediate', 'Combine hammer-ons, pull-offs, slides, and clean string muting into connected phrases.', 'scale', 'pentatonic_minor', 'scale', 'blues', 23, 24, 'Give picked and legato notes consistent timing and volume.', 'Mute unused strings during slides and position shifts.']
    ];
    const COURSE_ICONS = ['🎸', '🎼', '🎹', '🎷', '🎵', '🎶'];
    EXTRA_COURSES.forEach(([title, level, text, type, id, compareType, compareId, lessonA, lessonB, goalA, goalB], i) => {
        const compareLabel = compareType === 'scale' ? 'Compare scale' : 'Compare chord';
        COURSES.push({
            icon: COURSE_ICONS[i % COURSE_ICONS.length], title, level, text,
            learn: [goalA, goalB, 'Play both fretboard patterns in at least two keys.'],
            steps: [
                LN(lessonA), P(type, id, 'Map: ' + title), LN(lessonB),
                P(compareType, compareId, compareLabel + ': ' + title),
                PG('practice.html', 'Apply: ' + title)
            ]
        });
    });

    window.STCourses = COURSES;

    function state() {
        const storedResults = ST.getJSON('st_quiz_results', []);
        const results = Array.isArray(storedResults) ? storedResults.filter(item => item && typeof item === 'object') : [];
        const storedViewed = ST.getJSON('st_viewed', {});
        const viewed = storedViewed && typeof storedViewed === 'object' && !Array.isArray(storedViewed) ? storedViewed : {};
        const activity = ST.getJSON('st_activity', {});
        const pages = activity && activity.pages && typeof activity.pages === 'object' ? activity.pages : {};
        return {
            viewed,
            pages,
            best: id => results.filter(item => item.id === id && Number.isFinite(Number(item.pct))).reduce((score, item) => Math.max(score, Number(item.pct)), -1)
        };
    }

    // v1.1: printable course outline (outcomes and numbered steps).
    function coursePdf(c) {
        try {
            if (!window.StudyPdf) throw new Error('PDF helper failed to load.');
            const pdf = StudyPdf.create();
            pdf.title(c.title);
            pdf.text(c.level + '  |  ' + c.steps.length + ' steps');
            pdf.text(c.text);
            if ((c.learn || []).length) { pdf.heading('What you will learn'); pdf.list(c.learn); }
            pdf.heading('Steps');
            pdf.list(c.steps.map(s => s.label + ' (' + s.kind + ')'), true);
            pdf.save(c.title + ' (course)');
        } catch (e) { window.alert('Could not create the PDF: ' + e.message); }
    }

    function render() {
        const list = document.getElementById('course-list');
        if (!list) return;
        const v = state();
        list.innerHTML = '';
        COURSES.forEach((c, ci) => {
            const doneN = c.steps.filter(s => s.done(v)).length, pct = Math.round(100 * doneN / c.steps.length);
            const next = c.steps.find(s => !s.done(v));
            const el = document.createElement('div');
            el.className = 'course-item';
            el.innerHTML = '<div class="course-row"><div class="course-main"><h3></h3><p></p>' +
                '<div class="course-meta"><span></span><span></span></div><div class="course-bar"><i></i></div></div>' +
                '<div class="course-actions"><a class="enroll-button"></a><button type="button" class="course-toggle">Details</button><button type="button" class="course-pdf">Download PDF</button></div></div>' +
                '<div class="course-more" hidden><ul class="course-learn"></ul><ol class="course-steps"></ol><div class="course-fb"></div></div>';
            el.querySelector('h3').textContent = c.title;
            el.querySelector('p').textContent = c.text;
            const meta = el.querySelectorAll('.course-meta span');
            meta[0].textContent = c.level; meta[1].textContent = doneN + ' / ' + c.steps.length + ' steps';
            el.querySelector('.course-bar i').style.width = pct + '%';
            const go = el.querySelector('.enroll-button');
            go.href = (next || c.steps[0]).href;
            go.textContent = !doneN ? 'Start Course' : next ? 'Continue: ' + next.label : 'Completed - review';
            const more = el.querySelector('.course-more');
            const ul = el.querySelector('.course-learn');
            (c.learn || []).forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
            const ol = el.querySelector('.course-steps');
            let fbw = null;
            const showFb = (s) => {
                if (!s || !s.fb || !window.MiniFretboard) return;
                const o = Object.assign({ caption: s.label }, s.fb);
                if (!fbw) fbw = MiniFretboard.widget(el.querySelector('.course-fb'), o); else fbw.update(o);
            };
            c.steps.forEach(s => {
                const li = document.createElement('li');
                if (s.done(v)) li.className = 'done';
                const a = document.createElement('a');
                a.href = s.href; a.textContent = s.label;
                const k = document.createElement('small'); k.textContent = s.kind;
                li.append(a, ' ', k);
                if (s.fb) { const pv = document.createElement('button'); pv.type = 'button'; pv.className = 'course-pv'; pv.textContent = 'diagram'; pv.addEventListener('click', () => showFb(s)); li.append(' ', pv); }
                ol.appendChild(li);
            });
            el.querySelector('.course-pdf').addEventListener('click', () => coursePdf(c));
            const tg = el.querySelector('.course-toggle');
            tg.addEventListener('click', () => {
                more.hidden = !more.hidden; tg.textContent = more.hidden ? 'Details' : 'Hide';
                if (!more.hidden && !fbw) showFb((next && next.fb ? next : null) || c.steps.find(s => s.fb));
            });
            list.appendChild(el);
        });
    }
    document.addEventListener('DOMContentLoaded', render);
    window.addEventListener('pageshow', e => { if (e.persisted) render(); });
})();
