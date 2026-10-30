/**
 * Standalone only (fretboard-standalone.html).
 * Button 1 shows the C major scale and opens a lesson under the diagram.
 * The lesson is built from the current Setup (instrument, tuning, visible strings, fret window)
 * and is redrawn whenever the diagram updates while it is open.
 */
(function () {
    if (typeof App === 'undefined') return;

    const DEGREE_NAMES = ['root', '2nd', '3rd', '4th', '5th', '6th', '7th'];
    const TRIAD = ['C', 'E', 'G'];

    const byId = id => document.getElementById(id);
    const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
    const intFrom = (id, fallback) => { const n = parseInt(byId(id)?.value, 10); return Number.isNaN(n) ? fallback : n; };

    // Reads the same controls the diagram is drawn from.
    function readSetup(app) {
        const theory = app.musicTheory;
        const tuning = Array.from(app.getCurrentTuning(), note => note || 'C');
        const visible = app.getVisibleStrings();
        const starts = app.getStringStartFrets();
        const ends = app.getStringEndFrets();
        const startFret = intFrom('start-fret', 0);
        const endFret = intFrom('end-fret', 24);
        const piano = byId('instrument-select')?.value === 'piano';
        const count = tuning.length;
        const strings = tuning.map((note, i) => {
            const open = theory.toSharp(note);
            return {
                label: piano ? 'Key ' + (i + 1) : 'String ' + (count - i),
                open,
                openIndex: theory.notes.indexOf(open),
                shown: visible[i] !== false,
                from: Math.max(startFret, starts[i] ?? startFret),
                to: Math.min(endFret, ends[i] ?? endFret)
            };
        });
        const instrument = byId('instrument-select')?.selectedOptions?.[0]?.textContent?.trim() || 'Instrument';
        return { theory, strings, startFret, endFret, instrument };
    }

    // Frets inside each string's window where one of the names sounds. Strings are listed lowest first.
    function hitsFor(setup, names, degreeOf) {
        return setup.strings.map(s => {
            if (!s.shown || s.openIndex < 0) return { ...s, hits: [] };
            const hits = [];
            for (let fret = s.from; fret <= s.to; fret++) {
                const note = setup.theory.notes[(s.openIndex + fret) % 12];
                if (names.includes(note)) hits.push({ fret, note, degree: degreeOf.get(note) });
            }
            return { ...s, hits };
        });
    }

    function render() {
        const lesson = byId('fb-lesson');
        const app = window.app;
        if (!lesson || lesson.hidden || !app || !app.musicTheory) return;
        const setup = readSetup(app);
        const { theory, strings, startFret, endFret, instrument } = setup;
        const scale = theory.getScaleNotes('C', 'major').map(note => theory.toSharp(note));
        const degreeOf = new Map(scale.map((note, i) => [note, i + 1]));
        const scaleRows = hitsFor(setup, scale, degreeOf);
        const rootRows = hitsFor(setup, ['C'], degreeOf);
        const triadRows = hitsFor(setup, TRIAD, degreeOf);
        const shown = scaleRows.filter(r => r.shown);
        const windowText = 'frets ' + startFret + '\u2013' + endFret;
        const tuningText = strings.map(s => escapeHtml(s.open)).join(' ');

        const steps = [];
        const firstRoot = rootRows.find(r => r.hits.length);
        if (firstRoot) {
            steps.push('Start on ' + escapeHtml(firstRoot.label) + ' (' + escapeHtml(firstRoot.open) + ') at fret ' + firstRoot.hits[0].fret + ': the first C in your window.');
        } else {
            steps.push('No C falls in ' + windowText + ' on the strings shown. Widen the fret window or show more strings in Setup.');
        }
        steps.push('Play the seven notes in order (C D E F G A B C). A whole step is two frets and a half step is one fret, so the pattern is W W H W W W H wherever you start.');
        if (shown.length > 1) {
            const low = shown[0], high = shown[1];
            const d = (high.openIndex - low.openIndex + 12) % 12;
            const move = d === 0 ? 'the same fret' : d + ' frets lower (or ' + (12 - d) + ' higher)';
            steps.push('Crossing from ' + escapeHtml(low.label) + ' to ' + escapeHtml(high.label) + ', the same note is ' + move + ' on ' + escapeHtml(high.label) + '.');
        }
        steps.push('Practice within ' + windowText + '. The fingering map lists every C major note in that window.');
        steps.push('Say each note name and its degree (1 to 7) as you play, up and back down.');

        const listFor = rows => rows.filter(r => r.hits.length)
            .map(r => escapeHtml(r.label) + ': ' + r.hits.map(h => h.fret).join(', '))
            .join('; ') || 'none in ' + windowText;

        const tableRows = scaleRows.map(r => {
            const head = '<th>' + escapeHtml(r.label) + ' <span>' + escapeHtml(r.open) + '</span></th>';
            if (!r.shown) return '<tr>' + head + '<td>Hidden (Show notes is off)</td></tr>';
            if (!r.hits.length) return '<tr>' + head + '<td>No C major notes in ' + r.from + '\u2013' + r.to + '</td></tr>';
            const items = r.hits.map(h => '<span class="fb-lesson-hit"><b>' + h.fret + '</b> ' + escapeHtml(h.note) + ' <small>' + DEGREE_NAMES[h.degree - 1] + '</small></span>').join('');
            return '<tr>' + head + '<td>' + items + '</td></tr>';
        }).join('');

        lesson.innerHTML =
            '<h2>C major scale</h2>' +
            '<p>The major scale is the reference for Western music. Its pattern of whole and half steps gives the bright, stable sound behind much of pop, folk and classical melody.</p>' +
            '<h3>Formula and notes</h3>' +
            '<p><b>Pattern:</b> whole, whole, half, whole, whole, whole, half (W W H W W W H)</p>' +
            '<p><b>Notes:</b> ' + scale.join(' ') + ' ' + scale[0] + '</p>' +
            '<p><b>Degrees:</b> 1 to 7. The octave repeats the root.</p>' +
            '<h3>Your setup</h3>' +
            '<p><b>Instrument:</b> ' + escapeHtml(instrument) + '</p>' +
            '<p><b>Tuning, lowest to highest:</b> ' + tuningText + '</p>' +
            '<p><b>Frets:</b> ' + startFret + '\u2013' + endFret + '</p>' +
            '<p><b>Strings shown:</b> ' + shown.length + ' of ' + strings.length + '</p>' +
            '<h3>Fingering map</h3>' +
            '<table><tbody>' + tableRows + '</tbody></table>' +
            '<h3>Practice</h3>' +
            '<ol>' + steps.map(step => '<li>' + step + '</li>').join('') + '</ol>' +
            '<h3>Application</h3>' +
            '<ul>' +
            '<li><b>C (root) positions:</b> ' + listFor(rootRows) + '.</li>' +
            '<li><b>C major triad (C E G):</b> ' + listFor(triadRows) + '.</li>' +
            '<li><b>Chords in C:</b> the diatonic triads are C, Dm, Em, F, G, Am and B dim. Each uses only the notes in the fingering map.</li>' +
            '<li><b>Relative minor:</b> A natural minor uses the same notes, so the same map works starting on A.</li>' +
            '<li><b>Modes:</b> start the same notes on D, E, F, G, A or B for Dorian, Phrygian, Lydian, Mixolydian, Aeolian or Locrian.</li>' +
            '</ul>';
    }

    // Button 1: C major scale in the controls, then the lesson.
    function showCMajor() {
        const app = window.app;
        if (!app) return;
        const type = byId('pattern-type'), pattern = byId('pattern-select'), key = byId('key-select');
        const lesson = byId('fb-lesson');
        if (type) { type.value = 'scale'; type.dispatchEvent(new Event('change')); }
        if (pattern) pattern.value = 'major';
        if (key) key.value = 'C';
        if (key) key.dispatchEvent(new Event('change'));
        if (pattern) pattern.dispatchEvent(new Event('change'));
        if (lesson) { lesson.hidden = false; render(); }
    }

    // Redraw the lesson whenever the diagram updates (Setup changes, diagram switches, instrument or tuning presets).
    const originalUpdate = App.prototype.updateFretboard;
    App.prototype.updateFretboard = function (...args) {
        const result = originalUpdate.apply(this, args);
        try { render(); } catch (error) { console.warn('Lesson did not update', error); }
        return result;
    };

    function init() {
        const button = document.querySelector('#fb-buttons button');
        const details = byId('fb-details');
        if (!button || !details || byId('fb-lesson')) return;
        const lesson = document.createElement('section');
        lesson.id = 'fb-lesson';
        lesson.className = 'fb-lesson';
        lesson.setAttribute('aria-label', 'C major scale lesson');
        lesson.hidden = true;
        details.before(lesson);
        button.title = 'C major scale and lesson';
        button.addEventListener('click', showCMajor);
    }
    init();
})();
