/**
 * eBooks (v1.0) - previously "coming soon" cards linking to home.html.
 * Every book is generated on the device from the app's own theory data with the
 * vendored jsPDF, so downloads work fully offline.
 */
(function () {
    'use strict';
    const mt = new MusicTheory();
    const SHARP = mt.notes.slice();
    const KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    const GROUP_ORDER = ['Theory Reference', 'Intervals & Ear Training', 'Scales & Modes', 'Chords & Voicings', 'Harmony & Progressions', 'Fretboard & Technique'];
    const GROUP_FOR_TYPE = { interval: 'Intervals & Ear Training', scale: 'Scales & Modes', chord: 'Chords & Voicings' };
    const DEFAULT_TUNINGS = {
        4: ['E', 'A', 'D', 'G'],
        5: ['B', 'E', 'A', 'D', 'G'],
        6: ['E', 'A', 'D', 'G', 'B', 'E'],
        7: ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
        8: ['F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        9: ['C#', 'F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        10: ['G#', 'C#', 'F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        11: ['D#', 'G#', 'C#', 'F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        12: ['A#', 'D#', 'G#', 'C#', 'F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        13: ['E', 'A#', 'D#', 'G#', 'C#', 'F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E']
    };
    const TUNING_PRESETS = {
        'Standard guitar': ['E', 'A', 'D', 'G', 'B', 'E'],
        'Drop D guitar': ['D', 'A', 'D', 'G', 'B', 'E'],
        'DADGAD': ['D', 'A', 'D', 'G', 'A', 'D'],
        'Open G': ['D', 'G', 'D', 'G', 'B', 'D'],
        '7-string standard': ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
        '8-string standard': ['F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        '4-string bass': ['E', 'A', 'D', 'G'],
        '5-string bass': ['B', 'E', 'A', 'D', 'G'],
        '6-string bass': ['B', 'E', 'A', 'D', 'G', 'C'],
        'Ukulele': ['G', 'C', 'E', 'A']
    };
    let CURRENT_EBOOK_KEY = 'C';
    let CURRENT_TUNING = DEFAULT_TUNINGS[6].slice();
    const idx = (n) => SHARP.indexOf(mt.toSharp(n));

    // ---------- tiny PDF layout helper ----------
    function Book(title, subtitle) {
        const JsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!JsPDF) throw new Error('PDF library failed to load');
        this.doc = new JsPDF({ unit: 'mm', format: 'a4' });
        this.title = title; this.M = 15; this.W = 180; this.y = 20;
        this.instrument = { strings: CURRENT_TUNING.slice() };
        const d = this.doc;
        d.setFillColor(44, 62, 80); d.rect(0, 0, 210, 297, 'F');
        d.setFillColor(52, 152, 219); d.rect(0, 120, 210, 3, 'F');
        d.setTextColor(255, 255, 255); d.setFont('helvetica', 'bold'); d.setFontSize(30);
        d.text(d.splitTextToSize(title, 170), 20, 80);
        d.setFont('helvetica', 'normal'); d.setFontSize(14);
        d.text(d.splitTextToSize(subtitle, 170), 20, 138);
        d.setFontSize(10);
        d.text(d.splitTextToSize('Instrument tuning (low to high): ' + this.instrument.strings.join(' - '), 170), 20, 166);
        d.text('Scales Thesaurus v' + ST.version + '  |  generated ' + new Date().toLocaleDateString(), 20, 280);
        d.addPage(); d.setTextColor(30, 30, 30);
    }
    Book.prototype.ensure = function (h) {
        if (this.y + h > 280) { this.doc.addPage(); this.y = 18; return true; }
        return false;
    };
    Book.prototype.newPage = function () { this.doc.addPage(); this.y = 18; };
    Book.prototype.h1 = function (t, newPage) {
        if (newPage && this.y > 20) this.newPage(); else this.ensure(22);
        const d = this.doc;
        d.setFont('helvetica', 'bold'); d.setFontSize(17); d.setTextColor(44, 62, 80);
        d.text(t, this.M, this.y + 6);
        d.setDrawColor(52, 152, 219); d.setLineWidth(0.6); d.line(this.M, this.y + 9, this.M + this.W, this.y + 9);
        try { d.outline.add(null, t, { pageNumber: d.internal.getNumberOfPages() }); } catch (e) { /* outline optional */ }
        d.setTextColor(30, 30, 30);
        this.y += 15;
    };
    Book.prototype.h2 = function (t, keep) {
        this.ensure(keep || 14);
        const d = this.doc;
        d.setFont('helvetica', 'bold'); d.setFontSize(12); d.setTextColor(52, 100, 150);
        d.text(t, this.M, this.y + 4);
        d.setTextColor(30, 30, 30);
        this.y += 8;
    };
    Book.prototype.p = function (t, size) {
        const d = this.doc;
        d.setFont('helvetica', 'normal'); d.setFontSize(size || 10);
        const lh = (size || 10) * 0.46;
        d.splitTextToSize(String(t), this.W).forEach(line => { this.ensure(lh); d.text(line, this.M, this.y + 3.5); this.y += lh; });
        this.y += 2.5;
    };
    Book.prototype.bullets = function (items) {
        const d = this.doc;
        d.setFont('helvetica', 'normal'); d.setFontSize(10);
        items.forEach(it => {
            const lines = d.splitTextToSize(String(it), this.W - 6);
            lines.forEach((line, i) => { this.ensure(4.6); if (!i) d.text('-', this.M + 1, this.y + 3.5); d.text(line, this.M + 6, this.y + 3.5); this.y += 4.6; });
            this.y += 0.8;
        });
        this.y += 2;
    };
    Book.prototype.table = function (cols, rows, fontSize) {
        const d = this.doc, fs = fontSize || 8.5, lh = fs * 0.42;
        const total = cols.reduce((a, c) => a + c.w, 0), scale = this.W / total;
        const ws = cols.map(c => c.w * scale);
        const header = () => {
            d.setFillColor(44, 62, 80); d.rect(this.M, this.y, this.W, lh + 3, 'F');
            d.setFont('helvetica', 'bold'); d.setFontSize(fs); d.setTextColor(255, 255, 255);
            let x = this.M;
            cols.forEach((c, i) => { d.text(c.h, x + 1.2, this.y + lh + 0.8); x += ws[i]; });
            d.setTextColor(30, 30, 30); d.setFont('helvetica', 'normal');
            this.y += lh + 3;
        };
        this.ensure(lh * 3 + 6); header();
        rows.forEach((r, ri) => {
            d.setFontSize(fs);
            const cells = r.map((c, i) => d.splitTextToSize(String(c == null ? '' : c), ws[i] - 2.4));
            const h = Math.max.apply(null, cells.map(c => c.length)) * lh + 2;
            if (this.ensure(h)) header();
            if (ri % 2) { d.setFillColor(238, 242, 246); d.rect(this.M, this.y, this.W, h, 'F'); }
            let x = this.M;
            cells.forEach((c, i) => { d.text(c, x + 1.2, this.y + lh + 0.3); x += ws[i]; });
            this.y += h;
        });
        this.y += 4;
    };
    // Fretboard diagram: strings listed high to low, frets 0-12.
    Book.prototype.fretboard = function (caption, strings, root, intervals) {
        const boardStrings = this.instrument && this.instrument.strings.length ? this.instrument.strings.slice().reverse() : strings;
        const d = this.doc, frets = 12, sp = 4.8, h = (boardStrings.length - 1) * sp;
        this.ensure(h + 16);
        d.setFont('helvetica', 'bold'); d.setFontSize(9);
        d.text(caption + ' | ' + this.instrument.strings.length + '-string tuning', this.M, this.y + 3);
        const top = this.y + 7, left = this.M + 8, fw = (this.W - 10) / (frets + 1);
        const rootI = idx(root);
        const map = {};
        intervals.forEach(iv => { const s = mt.getIntervalSemitones(iv); if (s !== null) map[((s % 12) + 12) % 12] = iv === '1' ? 'R' : iv; });
        d.setDrawColor(120, 120, 120); d.setLineWidth(0.2);
        boardStrings.forEach((s, i) => d.line(left + fw, top + i * sp, left + fw * (frets + 1), top + i * sp));
        for (let f = 1; f <= frets + 1; f++) { d.setLineWidth(f === 1 ? 1 : 0.2); d.line(left + fw * f, top, left + fw * f, top + h); }
        d.setFont('helvetica', 'normal'); d.setFontSize(7); d.setTextColor(120, 120, 120);
        [3, 5, 7, 9, 12].forEach(f => d.text(String(f), left + fw * (f + 0.5), top + h + 3.5, { align: 'center' }));
        boardStrings.forEach((s, i) => d.text(s, left - 5, top + i * sp + 1));
        boardStrings.forEach((s, i) => {
            for (let f = 0; f <= frets; f++) {
                const semi = (idx(s) + f - rootI + 24) % 12;
                if (!(semi in map)) continue;
                const cx = left + fw * (f + 0.5), cy = top + i * sp;
                if (semi === 0) d.setFillColor(192, 57, 43); else d.setFillColor(44, 62, 80);
                d.circle(cx, cy, 2.05, 'F');
                d.setTextColor(255, 255, 255); d.setFontSize(map[semi].length > 2 ? 4.6 : 6);
                d.text(map[semi], cx, cy + 0.8, { align: 'center' });
            }
        });
        d.setTextColor(30, 30, 30);
        this.y = top + h + 7;
    };
    Book.prototype.gamutFretboard = function (caption, positions) {
        const boardStrings = this.instrument.strings.slice().reverse();
        const maxPosition = positions.reduce((max, point) => Math.max(max, Number(point.fret) || 0), 12);
        const frets = Math.min(30, Math.max(12, maxPosition));
        const d = this.doc, sp = 4.8, h = (boardStrings.length - 1) * sp;
        this.ensure(h + 18);
        d.setFont('helvetica', 'bold'); d.setFontSize(8.5);
        d.text(caption + ' | selected ' + boardStrings.length + '-string tuning', this.M, this.y + 3);
        const top = this.y + 7, left = this.M + 9, fw = (this.W - 10) / (frets + 1);
        d.setDrawColor(120, 120, 120); d.setLineWidth(0.2);
        boardStrings.forEach((note, row) => d.line(left + fw, top + row * sp, left + fw * (frets + 1), top + row * sp));
        for (let fret = 1; fret <= frets + 1; fret++) {
            d.setLineWidth(fret === 1 ? 1 : 0.2);
            d.line(left + fw * fret, top, left + fw * fret, top + h);
        }
        d.setFont('helvetica', 'normal'); d.setFontSize(6); d.setTextColor(120, 120, 120);
        [3, 5, 7, 9, 12, 15, 17, 19, 21, 24, 27, 30].filter(fret => fret <= frets).forEach(fret => {
            d.text(String(fret), left + fw * (fret + 0.5), top + h + 3.2, { align: 'center' });
        });
        boardStrings.forEach((note, row) => d.text(note, left - 5, top + row * sp + 1));
        const marked = new Set();
        positions.forEach(point => {
            const sourceString = Number(point.string), fret = Number(point.fret);
            if (!Number.isFinite(sourceString) || !Number.isFinite(fret) || fret < 0 || fret > frets) return;
            const row = boardStrings.length >= 6 ? sourceString : Math.round(sourceString * (boardStrings.length - 1) / 5);
            if (row < 0 || row >= boardStrings.length) return;
            const pos = row + ':' + fret;
            if (marked.has(pos)) return;
            marked.add(pos);
            const note = SHARP[(idx(boardStrings[row]) + fret) % 12];
            const cx = left + fw * (fret + 0.5), cy = top + row * sp;
            d.setFillColor(52, 100, 150); d.circle(cx, cy, 1.8, 'F');
            d.setTextColor(255, 255, 255); d.setFontSize(4.7);
            d.text(note, cx, cy + 0.65, { align: 'center' });
        });
        d.setTextColor(30, 30, 30);
        this.y = top + h + 7;
    };
    Book.prototype.addDetailedAddendum = function () {
        if (this._addendumAdded) return;
        this._addendumAdded = true;
        const c = this.context || {};
        const key = c.key || 'the chosen root';
        const name = c.patternName || this.title;
        const formula = c.formula || [];
        const notes = c.notes || [];
        const b = this;

        b.newPage();
        b.h1('In-Depth Addendum: Applying ' + name);
        b.p('This addendum turns the reference material into a repeatable listening, fretboard, and musicianship practice. Keep the original guide nearby: use its tables to verify details, then do each exercise from memory before checking. The examples are centered on ' + key + (notes.length ? ' and use the spelling ' + notes.join(' - ') : '') + (formula.length ? '. Formula: ' + formula.join(' - ') + '.' : '.'));
        if (formula.length) {
            b.h2('Working reference');
            b.table([{ h: 'Step', w: 20 }, { h: 'Interval', w: 35 }, { h: 'Note', w: 35 }, { h: 'Use while practicing', w: 90 }],
                formula.map((iv, i) => [i + 1, iv, notes[i] || '', i === 0 ? 'Establish the root / tonal center' : 'Sing, locate, then use as a musical target']), 8.5);
        }

        b.h2('1. Hear the structure before the shape');
        if (c.type === 'scale') {
            b.p('Treat the root as home and hear every other degree in relation to it. First sing the root, then the formula slowly; pause on the notes that give this collection its identity. For a major or minor tonic, compare the third against the chord underneath. For a modal or altered collection, isolate the characteristic degree and alternate it with a nearby stable tone. This prevents a fingering pattern from becoming a collection of aimless notes.');
            b.bullets(['Drone the root and sing the scale up and down without the instrument.', 'Land on the root, third, and fifth on strong beats; use other degrees as approach notes.', 'Hold a simple tonic or vamp and change only one scale degree at a time to hear its color.', 'Make two short motifs from the same notes: one that resolves to the root and one that deliberately leaves tension.']);
        } else if (c.type === 'chord') {
            b.p('Reduce the chord to its identity-bearing intervals before memorizing a grip. The third tells you whether the triad is major, minor, suspended, or absent; the fifth stabilizes or alters the sound. In seventh chords, listen closely to the seventh with the third: these two guide tones often communicate the quality and the direction of resolution more clearly than a dense full voicing.');
            b.bullets(['Play the root alone, then add one chord tone at a time and name the sound change.', 'Compare the closest major, minor, suspended, or altered quality while keeping the root fixed.', 'Move the chord through inversions; notice which voice changes position and which notes are shared.', 'Resolve each tense tone by the smallest practical motion, then listen for whether the chord function is clear.']);
        } else if (c.type === 'interval') {
            b.p('An interval is both a distance and a sound. Calibrate it from a stable root: sing the root, sing the target, then check the interval on one string before finding it in another position. Hear it ascending and descending, and then invert it by moving one note across an octave. Compare the result with neighboring intervals so recognition comes from sound and contour, not only a memorized song cue.');
            b.bullets(['Sing the two notes before playing them; verify the direction and the semitone distance.', 'Alternate this interval with the interval one semitone smaller or larger, using the same root.', 'Find the same pitch pair on one string, adjacent strings, and in a compact double-stop.', 'Invert the interval and explain how the new number and quality relate to the original.']);
        } else if (c.type === 'fretboard') {
            b.p('Use note names, octaves, and interval relationships as overlapping maps of the neck. Locate one root on the low strings, find its octave shapes, and verify the intervening notes rather than relying on a box outline. Standard guitar tuning has a major-third gap from G to B instead of a perfect fourth; account for this when transferring a shape across that boundary.');
            b.bullets(['Name natural notes on one string through fret 12, then repeat from memory on the next string.', 'Locate each root in the diagrams and connect matching pitch classes at the octave.', 'Trace one scale degree across all strings, saying both its note name and interval from the root.', 'Move a familiar shape across the G-B string boundary and adjust the fingering where the tuning changes.']);
        } else if (c.type === 'harmony') {
            b.p('Analyze progressions as motion, not as a list of chord labels. Hear tonic as arrival, predominant harmony as departure or preparation, and dominant harmony as directed tension. Track one voice at a time: common tones can remain in place, while guide tones often move by a semitone or whole step into the next chord. Roman numerals let you recognize the same relationship after transposition.');
            b.bullets(['Sing the bass roots first, then sing the third of each chord as a second line.', 'Mark each chord as tonic, predominant, or dominant and predict where its tension wants to go.', 'Transpose one progression to a neighboring key while preserving its Roman-numeral pattern.', 'Play the progression with compact voicings and keep common tones wherever practical.']);
        } else {
            b.p('Use a three-pass workflow for any topic in this guide: understand the written idea, reproduce it without looking, and apply it in a musical situation. Keep a single question in mind for each pass. A focused question (what is the defining note, sound, or motion?) makes practice more reliable than repeating a page without listening.');
            b.bullets(['Reference pass: identify the terms, symbols, and data you need, then close the book.', 'Recall pass: explain the idea aloud and reproduce its example from memory.', 'Application pass: use it in a melody, chord, progression, fretboard map, or short recording.', 'Review pass: reopen the reference only to correct a specific error, then try once more unaided.']);
        }

        b.h2('2. Transfer the idea across the instrument');
        b.p('Choose one small area of the fretboard and map it in two ways: first by note name, then by interval from the root. On guitar, work across two adjacent strings at a time; the tuning offset is a fourth for most adjacent pairs and a major third between G and B. On bass or piano, keep the same root-to-target interval goal while adapting the physical route to the instrument. Change position only after you can sing the line in tune.');
        b.bullets(['Anchor: find the root and say its name before starting.', 'Locate: find the target note by interval, not by guessing a familiar shape.', 'Connect: play the same relationship in a second position or octave.', 'Verify: check note spelling and formula in the book after the attempt, not during it.']);

        b.h2('3. A seven-session practice cycle');
        b.table([{ h: 'Session', w: 22 }, { h: 'Work', w: 72 }, { h: 'Evidence of progress', w: 86 }], [
            ['1 - Listen', 'Sing the root and the central sound of this topic; use a drone or a slowly played reference.', 'You can recognize the sound before touching the instrument.'],
            ['2 - Name', 'Recall the formula, spell the notes in ' + key + ', and say what each note contributes.', 'You can explain the structure without reading the table.'],
            ['3 - Locate', 'Map the material in one position, then connect it to a second position or register.', 'You can continue the idea after leaving the first shape.'],
            ['4 - Control', 'Practice slowly with a metronome; use clean attacks, even timing, and relaxed movement.', 'The example stays accurate at a repeatable tempo.'],
            ['5 - Apply', 'Create a two- or four-bar phrase or progression that makes the topic easy to hear.', 'A listener can identify the intended sound or resolution.'],
            ['6 - Vary', 'Transpose the exercise to a nearby root and preserve its interval relationships.', 'The idea survives a key change without memorized fret numbers.'],
            ['7 - Recall', 'Record one unassisted attempt, then compare it with the guide and note one correction.', 'You can name a specific next step instead of merely repeating.']
        ], 8);

        b.h2('4. Diagnose common practice problems');
        b.bullets([
            'The pattern is memorized but the sound is unclear: stop, sing the root, and play only the defining interval or guide tone.',
            'The phrase sounds like an exercise: add a rhythm, repeat a short motif, and leave space before resolving it.',
            'The notes are right but the line feels unstable: check which beat carries the root or chord tone and where the phrase ends.',
            'The shape fails in a new position: rebuild from note names and intervals; do not shift every finger mechanically.',
            'A key change causes hesitation: transpose by naming the new root first, then recalculate each interval from it.'
        ]);

        b.h2('5. Self-assessment and next steps');
        b.p('Close the book and give yourself one point for each task completed accurately: (1) state the core formula or relationship; (2) sing its sound from a named root; (3) find it in two positions; (4) use it in a short musical example; and (5) explain what creates or resolves its tension. A score of four or five means the idea is ready to use in repertoire. With fewer than four, return only to the weakest task and repeat it at a slower tempo.');
        b.p('For a useful record, write the date, root, tempo, strongest task, and one unresolved question after each session. Revisit the question in the next practice rather than adding more material. The aim is flexible recall: hearing the idea, locating it, and making a deliberate musical choice with it.');

        const referenceType = c.referenceType || c.type;
        const referenceId = c.referenceId || c.patternId || (referenceType === 'interval' ? '5' : 'major');
        const referencePattern = referenceType === 'scale' ? mt.scales[referenceId]
            : referenceType === 'chord' ? mt.chords[referenceId]
                : referenceType === 'interval' ? mt.intervals[referenceId] : mt.scales.major;
        const resolvedType = referencePattern ? referenceType : 'scale';
        const resolvedId = referencePattern ? referenceId : 'major';
        const pattern = referencePattern || mt.scales.major;
        const allKeyFormula = resolvedType === 'interval' ? ['1', resolvedId] : pattern.intervals;
        const allKeyRows = KEYS.map(k => {
            const spelling = resolvedType === 'chord' ? mt.getChordNotes(k, resolvedId)
                : resolvedType === 'interval' ? [k, mt.getNoteFromInterval(k, resolvedId)]
                    : mt.getScaleNotes(k, resolvedId);
            return [k, allKeyFormula.join(' - '), spelling.join(' - ')];
        });
        const diagramKey = c.key || CURRENT_EBOOK_KEY;
        b.newPage();
        b.h1('Music Theory Reference: Examples in All 12 Keys');
        b.p('Theory reference for ' + pattern.name + ': intervals are measured from the root, and each row spells the same musical structure in a different key. The instrument diagram uses your selected tuning, shown low to high as ' + this.instrument.strings.join(' - ') + '.');
        b.table([{ h: 'Key', w: 22 }, { h: 'Formula', w: 55 }, { h: 'Example notes', w: 103 }], allKeyRows, 8.5);
        b.h2('Fretboard diagram in ' + diagramKey);
        b.p('Read the strings from highest at the top to lowest at the bottom. The open-string names and note markers reflect the selected tuning; the red marker is the root.');
        b.fretboard(diagramKey + ' ' + pattern.name, this.instrument.strings.slice().reverse(), diagramKey, allKeyFormula);
    };
    Book.prototype.blob = function () {
        this.addDetailedAddendum();
        const d = this.doc, n = d.internal.getNumberOfPages();
        for (let i = 2; i <= n; i++) {
            d.setPage(i); d.setFont('helvetica', 'normal'); d.setFontSize(8); d.setTextColor(130, 130, 130);
            d.text(this.title, this.M, 291); d.text('Page ' + (i - 1) + ' of ' + (n - 1), 195, 291, { align: 'right' });
        }
        return d.output('blob');
    };
    Book.prototype.save = function (file) {
        const blob = this.blob();
        const pages = this.doc.internal.getNumberOfPages();
        ST.download(blob, file);
        return pages;
    };

    // ---------- theory helpers ----------
    const SYMBOL = { major: '', minor: 'm', diminished: 'dim', augmented: 'aug', major7: 'maj7', minor7: 'm7', dominant7: '7', half_diminished: 'm7b5', diminished7: 'dim7' };
    function identify(notes) {
        const r = idx(notes[0]);
        const set = notes.map(n => (idx(n) - r + 12) % 12).sort((a, b) => a - b).join(',');
        for (const id of Object.keys(SYMBOL)) {
            const c = mt.chords[id]; if (!c) continue;
            const s = c.intervals.map(iv => ((mt.getIntervalSemitones(iv) % 12) + 12) % 12).sort((a, b) => a - b).join(',');
            if (s === set) return id;
        }
        return null;
    }
    function diatonic(key, scale, size) {
        const sc = mt.getScaleNotes(key, scale);
        return sc.map((n, i) => {
            const notes = [];
            for (let k = 0; k < size; k++) notes.push(sc[(i + k * 2) % 7]);
            const id = identify(notes);
            return { root: n, notes, id, symbol: n + (id ? SYMBOL[id] : '?') };
        });
    }
    const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    function roman(i, id) {
        const r = ROMAN[i];
        if (id === 'minor' || id === 'minor7') return r.toLowerCase() + (id === 'minor7' ? '7' : '');
        if (id === 'diminished') return r.toLowerCase() + '°';
        if (id === 'half_diminished') return r.toLowerCase() + 'ø7';
        if (id === 'diminished7') return r.toLowerCase() + '°7';
        if (id === 'augmented') return r + '+';
        if (id === 'major7') return r + 'maj7';
        if (id === 'dominant7') return r + '7';
        return r;
    }
    const scaleName = (id) => (mt.scales[id] ? mt.scales[id].name : id);
    const isCatalogue = (id) => /^(a?\d{4}_|scale_z\d+$)/.test(id);
    const GUITAR = ['E', 'B', 'G', 'D', 'A', 'E'];
    const BASS = ['G', 'D', 'A', 'E'];

    // ---------- the books ----------
    const BOOKS = [
        {
            id: 'scales', title: 'The Complete Scale Guide', group: 'Scales & Modes',
            blurb: 'Every one of the app\'s scales with its formula, step count and note spelling in your chosen key, plus descriptions of the named scales.',
            keyed: true,
            build(key) {
                const b = new Book('The Complete Scale Guide', 'All ' + Object.keys(mt.scales).length + ' scales spelled in ' + key);
                b.context = { type: 'scale', key, patternName: 'the scale catalogue', referenceType: 'scale', referenceId: 'major' };
                const ids = Object.keys(mt.scales);
                const named = ids.filter(id => !isCatalogue(id)), cat = ids.filter(isCatalogue);
                b.h1('How to read this guide');
                b.p('Each scale is written as a formula of intervals measured from the root (1). A flat (b) lowers a degree by a semitone and a sharp (#) raises it. The notes column spells the formula starting on ' + key + '. To hear or see any scale, open the Fretboard app, choose the key and pick the scale by name.');
                b.p('Part 1 covers the ' + named.length + ' named scales with descriptions. Part 2 lists the ' + cat.length + ' catalogue scales, named after their formula, which together cover the possible interval combinations.');
                b.h1('Part 1 - Named scales', true);
                b.table([{ h: 'Scale', w: 48 }, { h: 'Formula', w: 42 }, { h: 'Notes in ' + key, w: 42 }, { h: 'About', w: 68 }],
                    named.map(id => [scaleName(id), mt.scales[id].intervals.join(' '), mt.getScaleNotes(key, id).join(' '), mt.getScaleDescription(id) || '']), 8);
                b.h1('Part 2 - Catalogue scales', true);
                b.table([{ h: '#', w: 10 }, { h: 'Formula', w: 70 }, { h: 'Notes', w: 8 }, { h: 'Spelled in ' + key, w: 62 }],
                    cat.map((id, i) => [i + 1, mt.scales[id].intervals.join(' '), mt.scales[id].intervals.length, mt.getScaleNotes(key, id).join(' ')]), 8);
                return b;
            }
        },
        {
            id: 'chords', title: 'Chord Construction Masterclass', group: 'Chords & Voicings',
            blurb: 'How chords are stacked from intervals, then every chord in the library with formula, spelling, inversions and character notes.',
            keyed: true,
            build(key) {
                const b = new Book('Chord Construction Masterclass', 'Triads, sevenths, extensions and alterations in ' + key);
                b.context = { type: 'chord', key, patternName: 'chord construction', referenceType: 'chord', referenceId: 'major' };
                b.h1('Building chords');
                b.p('Chords are built by stacking thirds above a root. A major third (4 semitones) followed by a minor third (3) gives a major triad 1 3 5; reversing them gives a minor triad 1 b3 5. Two minor thirds make a diminished triad 1 b3 b5 and two major thirds an augmented triad 1 3 #5.');
                b.p('Adding another third creates a seventh chord. Major 7 (1 3 5 7), dominant 7 (1 3 5 b7), minor 7 (1 b3 5 b7), half-diminished (1 b3 b5 b7) and diminished 7 (1 b3 b5 bb7) are the five essential qualities.');
                b.p('Extensions continue the stack: 9 (= 2), 11 (= 4) and 13 (= 6) an octave higher. Alterations (b9, #9, #11, b13, #5, b5) add tension, most often on dominant chords. Sus chords replace the third with a 2 or 4; add chords include an extension without the seventh.');
                b.h2('Inversions');
                b.p('An inversion puts a chord tone other than the root in the bass. A triad has root position, 1st inversion (3rd in the bass) and 2nd inversion (5th in the bass); a seventh chord adds a 3rd inversion (7th in the bass).');
                b.h1('Chord reference in ' + key, true);
                b.table([{ h: 'Chord', w: 40 }, { h: 'Symbol', w: 18 }, { h: 'Formula', w: 30 }, { h: 'Notes', w: 30 }, { h: 'Inversions', w: 42 }, { h: 'Character', w: 40 }],
                    Object.keys(mt.chords).map(id => {
                        const notes = mt.getChordNotes(key, id);
                        return [mt.chords[id].name, key + (id === 'major' ? '' : id), mt.chords[id].intervals.join(' '), notes.join(' '), mt.getChordInversions(notes).join('; '), mt.getChordDescription(id) || ''];
                    }), 7.5);
                return b;
            }
        },
        {
            id: 'fretboard', title: 'Visualizing the Fretboard', group: 'Fretboard & Technique',
            blurb: 'Note maps for guitar and bass plus 12-fret diagrams of the major scale, minor pentatonic and major pentatonic in all 12 keys.',
            build() {
                const b = new Book('Visualizing the Fretboard', 'Guitar & bass note maps and scale shapes in all 12 keys');
                b.context = { type: 'fretboard', patternName: 'fretboard visualization', referenceType: 'scale', referenceId: 'major' };
                b.h1('Learning the neck');
                b.bullets([
                    'Learn the natural notes on the low E and A strings first; every movable shape is anchored on a root there.',
                    'Notes repeat 12 frets higher, so frets 0-12 cover the whole neck.',
                    'In standard tuning each string is a 4th above the last except G to B (a major 3rd), so shapes shift one fret on the B and high E strings.',
                    'Octaves: two strings and two frets up (one fret extra when crossing the B string).',
                    'Practice each diagram slowly, saying the interval names (R, 3, 5...) aloud, then move it to new keys.'
                ]);
                const noteRows = (strings) => strings.map(s => { const r = [s]; for (let f = 0; f <= 12; f++) r.push(SHARP[(idx(s) + f) % 12]); return r; });
                const cols = [{ h: 'String', w: 12 }]; for (let f = 0; f <= 12; f++) cols.push({ h: String(f), w: 10 });
                b.h2('Guitar - standard tuning (frets 0-12)');
                b.table(cols, noteRows(GUITAR), 8);
                b.h2('Bass - standard tuning (frets 0-12)');
                b.table(cols, noteRows(BASS), 8);
                KEYS.forEach(k => {
                    b.h1(k + ' - scale shapes', true);
                    b.fretboard(k + ' major (Ionian): ' + mt.getScaleNotes(k, 'major').join(' '), GUITAR, k, mt.scales.major.intervals);
                    b.fretboard(k + ' minor pentatonic: ' + mt.getScaleNotes(k, 'pentatonic_minor').join(' '), GUITAR, k, mt.scales.pentatonic_minor.intervals);
                    b.fretboard(k + ' major pentatonic: ' + mt.getScaleNotes(k, 'pentatonic_major').join(' '), GUITAR, k, mt.scales.pentatonic_major.intervals);
                    b.fretboard(k + ' major on bass', BASS, k, mt.scales.major.intervals);
                });
                return b;
            }
        },
        {
            id: 'harmony', title: 'Harmony and Chord Progressions', group: 'Harmony & Progressions',
            blurb: 'Diatonic triads and sevenths, harmonic function and the most common progressions spelled out in all 12 major and minor keys.',
            build() {
                const b = new Book('Harmony and Chord Progressions', 'Diatonic harmony and common progressions in every key');
                b.context = { type: 'harmony', patternName: 'diatonic harmony', referenceType: 'scale', referenceId: 'major' };
                b.h1('Diatonic harmony');
                b.p('Stacking thirds on each degree of a scale, using only notes from that scale, gives its diatonic chords. In every major key the pattern is the same: I ii iii IV V vi vii°, and with sevenths Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.');
                b.h2('Harmonic function');
                b.bullets(['Tonic (rest): I, iii, vi', 'Subdominant / pre-dominant (motion away): ii, IV', 'Dominant (tension that resolves to I): V, vii°', 'The strongest resolution is V(7) to I; ii-V-I is the backbone of jazz harmony.']);
                const PROGS = [['Pop / axis', [0, 4, 5, 3]], ['Classic rock', [0, 3, 4, 0]], ['50s doo-wop', [0, 5, 3, 4]], ['Jazz ii-V-I', [1, 4, 0]], ['Circle', [5, 1, 4, 0]], ['Pachelbel', [0, 4, 5, 2, 3, 0, 3, 4]]];
                b.h1('Major keys', true);
                KEYS.forEach(k => {
                    const tri = diatonic(k, 'major', 3), sev = diatonic(k, 'major', 4);
                    b.h2(k + ' major  (' + mt.getScaleNotes(k, 'major').join(' ') + ')', 60);
                    b.table([{ h: '', w: 18 }].concat(tri.map((c, i) => ({ h: roman(i, c.id), w: 23 }))),
                        [['Triads'].concat(tri.map(c => c.symbol)), ['Sevenths'].concat(sev.map(c => c.symbol))], 8);
                    b.table([{ h: 'Progression', w: 30 }, { h: 'Numerals', w: 50 }, { h: 'In ' + k, w: 100 }],
                        PROGS.map(([n, p]) => [n, p.map(i => roman(i, tri[i].id)).join(' - '), p.map(i => tri[i].symbol).join(' - ')])
                            .concat([['12-bar blues', 'I7 x4, IV7 x2, I7 x2, V7, IV7, I7, V7', [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4].map(i => tri[i].root + '7').join(' ')]]), 8);
                });
                b.h1('Minor keys', true);
                b.p('Natural minor gives i ii° III iv v VI VII. Composers usually raise the 7th (harmonic minor) to turn v into a dominant V or V7 that pulls strongly back to i.');
                KEYS.forEach(k0 => {
                    const k = SHARP[(idx(k0) + 9) % 12].replace('A#', 'Bb').replace('D#', 'Eb');
                    const tri = diatonic(k, 'natural_minor', 3), sev = diatonic(k, 'natural_minor', 4);
                    const V7 = mt.getChordNotes(mt.getScaleNotes(k, 'natural_minor')[4], 'dominant7');
                    b.h2(k + ' minor  (' + mt.getScaleNotes(k, 'natural_minor').join(' ') + ')', 30);
                    b.table([{ h: '', w: 18 }].concat(tri.map((c, i) => ({ h: roman(i, c.id), w: 23 }))),
                        [['Triads'].concat(tri.map(c => c.symbol)), ['Sevenths'].concat(sev.map(c => c.symbol))], 8);
                    b.p('Andalusian cadence: ' + [0, 6, 5].map(i => tri[i].symbol).join(' - ') + ' - ' + V7[0] + '   |   Minor ii-V-i: ' + tri[1].root + 'm7b5 - ' + V7[0] + '7 - ' + k + 'm   |   i-iv-v: ' + [0, 3, 4].map(i => tri[i].symbol).join(' - '), 9);
                });
                return b;
            }
        },
        {
            id: 'intervals', title: 'Interval Recognition & Application', group: 'Intervals & Ear Training',
            blurb: 'All intervals with semitones, quality, consonance, inversions and reference songs, plus a daily ear-training routine.',
            build() {
                const b = new Book('Interval Recognition & Application', 'The building blocks of every scale and chord');
                b.context = { type: 'interval', patternName: 'interval recognition', referenceType: 'interval', referenceId: '5' };
                b.h1('What an interval is');
                b.p('An interval is the distance between two notes, counted in letter names (the number) and semitones (the quality). Melodic intervals are played one after the other; harmonic intervals sound together.');
                const ids = Object.keys(mt.intervals).sort((a, c) => mt.intervals[a].semitones - mt.intervals[c].semitones);
                b.table([{ h: 'Interval', w: 34 }, { h: 'Short', w: 12 }, { h: 'Semis', w: 12 }, { h: 'From C', w: 14 }, { h: 'Quality', w: 40 }, { h: 'Consonance', w: 34 }],
                    ids.map(id => [mt.intervals[id].name, mt.intervals[id].shortName || id, mt.intervals[id].semitones, mt.getNoteFromInterval('C', id) || '', mt.getIntervalQuality(id) || '', mt.getIntervalConsonance(id) || '']), 8.5);
                b.h2('Inversions');
                b.p('Inverting an interval (moving the lower note up an octave) gives numbers that add to 9 and semitones that add to 12: major becomes minor, augmented becomes diminished, perfect stays perfect. A major 3rd (4) inverts to a minor 6th (8); a perfect 4th (5) to a perfect 5th (7).');
                b.h2('Reference songs (ascending)');
                b.table([{ h: 'Interval', w: 40 }, { h: 'Song cue', w: 140 }], [
                    ['Minor 2nd', 'Jaws theme'], ['Major 2nd', 'Happy Birthday ("Hap-py")'], ['Minor 3rd', 'Greensleeves; Smoke on the Water'], ['Major 3rd', 'When the Saints Go Marching In'],
                    ['Perfect 4th', 'Here Comes the Bride; Amazing Grace'], ['Tritone', 'The Simpsons; Maria (West Side Story)'], ['Perfect 5th', 'Star Wars main theme; Twinkle Twinkle'],
                    ['Minor 6th', 'The Entertainer (3rd-4th note)'], ['Major 6th', 'My Bonnie Lies Over the Ocean'], ['Minor 7th', 'Star Trek original theme'], ['Major 7th', 'Take On Me (chorus leap)'], ['Octave', 'Somewhere Over the Rainbow']], 9);
                b.h1('Ear-training routine', true);
                b.bullets(['5 minutes: sing and play each interval up from a random note, naming it aloud.', '5 minutes: play intervals on the Intervals page with Melodic and Harmonic buttons and identify them by ear.',
                    '5 minutes: take the Interval quiz on the Quizzes page; repeat until you score 90% or more.', 'Weekly: take the timed Interval test and record the result on the Progress page.']);
                return b;
            }
        },
        {
            id: 'guide', title: 'Maximizing the Scales Thesaurus', group: 'Theory Reference',
            blurb: 'The user guide: every page and feature, exports, offline use, keyboard-free workflows and tips for practice.',
            build() {
                const b = new Book('Maximizing the Scales Thesaurus', 'User guide for version ' + ST.version);
                b.context = { type: 'guide', patternName: 'the app workflow', referenceType: 'scale', referenceId: 'major' };
                const sec = (t, items) => { b.h2(t); b.bullets(items); };
                b.h1('Getting started');
                b.p('Scales Thesaurus is an interactive reference of ' + Object.keys(mt.scales).length + ' scales, ' + Object.keys(mt.chords).length + ' chords and ' + Object.keys(mt.intervals).length + ' intervals on guitar, bass, piano and custom instruments. After the first visit everything, including exports, works without an internet connection.');
                sec('Fretboard app (fretboard.html)', ['Pick a key, a pattern type (scale, chord, interval, custom) and a pattern; the instrument redraws instantly.', 'Switch between note names and interval labels in the display options.', 'Change instrument, tuning and fret span from the bottom toolbar; presets are saved on this device.', 'Play the pattern, a melodic sequence or a slideshow of many patterns.', 'Export the current diagram as PNG or PDF, every key of a pattern as a PDF, or whole libraries as Word documents.']);
                sec('Reference pages', ['Scales and Chords: search, filter by interval, star favourites, open any entry on the fretboard or hear it.', 'Intervals: hear each interval melodically or harmonically.', 'Data: browse all data as tables and export CSV, Excel or PDF.']);
                sec('Learning', ['Lessons: guided theory topics that open on the fretboard.', 'Courses: quizzes, timed tests and exams with printable PDF certificates.', 'Progress: activity heatmap, views and every quiz result.', 'Chord Progressions: build, hear and transpose progressions.', 'eBooks: these PDFs, generated on your device.']);
                sec('Your data', ['Everything is stored in this browser only (localStorage).', 'Settings > Backup downloads all of it as one JSON file; Restore loads it on another device.', 'Clearing site data in the browser removes favourites, progress and presets.']);
                sec('Offline & install', ['The header dot shows online/offline status; a toast confirms when the app is cached.', 'Use your browser\'s Install / Add to Home Screen to run it like a native app.']);
                return b;
            }
        }
    ];

    const MORE_BOOK_TOPICS = [
        ['Interval Atlas for Guitar', 'Train interval size, sound, and fretboard placement from a movable root.', 'interval', '5'],
        ['Half Steps and Whole Steps', 'Build accurate pitch awareness from adjacent frets and major-scale step patterns.', 'interval', '2'],
        ['Major and Minor Thirds', 'Hear the small but defining difference between major and minor tonal color.', 'interval', '3'],
        ['Perfect Fourths and Fifths', 'Map the most stable open intervals and use them in riffs and chord shapes.', 'interval', '5'],
        ['Sixths and Sevenths', 'Connect wide melodic intervals to chord extensions and resolution.', 'interval', '6'],
        ['Tritone Resolution', 'Understand the six-semitone tritone and hear its tendency to resolve.', 'interval', '#4'],
        ['Interval Inversions', 'Invert intervals across octaves to connect fretboard shapes and ear training.', 'interval', 'b3'],
        ['Ear Training Practice Plan', 'Use short call-and-response drills to recognize intervals without guessing.', 'interval', '4'],
        ['Major Scale Field Guide', 'Learn the seven degrees, step pattern, and stable chord tones of the major scale.', 'scale', 'major'],
        ['Natural Minor Field Guide', 'Map Aeolian degrees and hear how a minor tonic changes the same pitch set.', 'scale', 'natural_minor'],
        ['Harmonic Minor Cadences', 'Use the raised leading tone to strengthen dominant-to-tonic motion in minor keys.', 'scale', 'harmonic_minor'],
        ['Melodic Minor Colors', 'Explore the raised sixth and seventh over a minor tonic and jazz harmony.', 'scale', 'melodic_minor'],
        ['Dorian Groove Studies', 'Bring out Dorian’s natural sixth over minor harmony with targeted phrases.', 'scale', 'dorian'],
        ['Phrygian Riff Studies', 'Use the flat second for focused tension while keeping the tonic clear.', 'scale', 'phrygian'],
        ['Lydian Sound and Harmony', 'Highlight the raised fourth for bright, floating major-key melodies.', 'scale', 'lydian'],
        ['Mixolydian Blues Language', 'Combine a major third and flat seventh over dominant chords.', 'scale', 'mixolydian'],
        ['Locrian and Half-Diminished', 'Understand the flat fifth and unstable character of Locrian harmony.', 'scale', 'locrian'],
        ['Minor Pentatonic Phrasing', 'Build concise rock and blues phrases from five essential scale tones.', 'scale', 'pentatonic_minor'],
        ['Major Pentatonic Melodies', 'Use a compact, open-sounding pitch set for folk, country, and pop lines.', 'scale', 'pentatonic_major'],
        ['Blues Scale Vocabulary', 'Add the blue note as expressive passing tension around minor pentatonic phrases.', 'scale', 'blues'],
        ['Whole-Tone Symmetry', 'Explore equal whole steps and their ambiguous, floating harmonic color.', 'scale', 'whole_tone'],
        ['Diminished Scale Navigation', 'Practice symmetrical eight-note movement over diminished and dominant sounds.', 'scale', 'diminished'],
        ['Phrygian Dominant Color', 'Pair a flat second with a major third for a vivid dominant scale sound.', 'scale', 'phrygian_dominant'],
        ['Bebop Scale Timing', 'Place chord tones on strong beats by using a passing note in flowing lines.', 'scale', 'bebop_dominant'],
        ['Japanese Pentatonic Colors', 'Compare compact Japanese scale collections and use their gaps for spacious melodies.', 'scale', 'hirajoshi'],
        ['New Scale Formula Workbook', 'Read interval formulas and compare the fretboard shapes of expanded scale collections.', 'scale', 'more_scale_001'],
        ['Major Triad Construction', 'Build root, third, and fifth voicings in multiple string groups.', 'chord', 'major'],
        ['Minor Triad Construction', 'Use the flat third to create minor quality and connect inversions smoothly.', 'chord', 'minor'],
        ['Diminished and Augmented Triads', 'Compare symmetrical tension with stable major and minor triads.', 'chord', 'diminished'],
        ['Suspended Chord Resolutions', 'Replace the third with a second or fourth, then resolve the suspension clearly.', 'chord', 'sus4'],
        ['Power Chord Routes', 'Connect root-fifth shapes along the low strings with clean muting and timing.', 'chord', '5'],
        ['Major Seventh Voicings', 'Add the major seventh and use compact voicings for a smooth tonic color.', 'chord', 'major7'],
        ['Dominant Seventh Guide Tones', 'Hear the third and flat seventh pull toward a tonic resolution.', 'chord', 'dominant7'],
        ['Minor Seventh Grooves', 'Connect minor-seventh chord tones to relaxed funk and soul comping.', 'chord', 'minor7'],
        ['Half-Diminished Harmony', 'Spell minor-seven-flat-five chords and resolve them within minor-key progressions.', 'chord', 'half_diminished'],
        ['Diminished Seventh Symmetry', 'Use the repeating minor-third structure to move diminished seventh voicings.', 'chord', 'diminished7'],
        ['Ninth Chord Construction', 'Distinguish add-nine chords from extended chords that include a seventh.', 'chord', 'dom9'],
        ['Eleventh Chord Voicings', 'Select essential chord tones and playable eleventh extensions on guitar.', 'chord', 'dom11'],
        ['Thirteenth Chord Voicings', 'Use the sixth or thirteenth as a bright upper color over seventh-chord harmony.', 'chord', 'dom13'],
        ['Altered Dominant Chords', 'Compare altered fifths and ninths, then resolve their tension into a tonic chord.', 'chord', 'alt7'],
        ['Added-Tone Chord Lab', 'Read the expanded chord catalog and hear how one added interval changes a triad.', 'chord', 'more_chord_001'],
        ['Triad Inversions on the Neck', 'Connect root position and inversions while keeping chord tones close together.', 'chord', 'major'],
        ['Voice Leading for Guitar', 'Move each chord voice the shortest distance through common progressions.', 'chord', 'major7'],
        ['Chord-Tone Soloing', 'Build melodic phrases from arpeggio targets and short scale connections.', 'chord', 'minor7']
    ];
    // 200 workbooks generated from the theory data: every named interval, chord and scale (first 200 in order).
    const GENERATED_TOPICS = (() => {
        const named = (src, id) => /^[a-z]/i.test(id) && !/^more_|^scale_z|^a\d{4}|_-_|_R_/.test(id) && /^[A-Za-z]/.test((src[id] && src[id].name) || '');
        const rows = Object.keys(mt.intervals).map(id => {
            const iv = mt.intervals[id];
            return [iv.name + ' Sound Sheet', iv.name + ' sits ' + iv.semitones + (iv.semitones === 1 ? ' semitone' : ' semitones') + ' above the root. Learn its sound and where it sits on the neck.', 'interval', id];
        });
        Object.keys(mt.chords).filter(id => named(mt.chords, id)).forEach(id => {
            const c = mt.chords[id];
            rows.push([c.name + ' Chord Sheet', c.name + ' chord built from ' + (c.intervals || []).join(' ') + '. Learn its sound, common voicings and where it leads.', 'chord', id]);
        });
        Object.keys(mt.scales).filter(id => named(mt.scales, id)).forEach(id => {
            const s = mt.scales[id];
            rows.push([(/scale$/i.test(s.name) ? s.name : s.name + ' Scale') + ' Sheet', s.name + ' uses ' + s.intervals.length + ' notes: ' + s.intervals.join(' ') + '. Learn its sound, fretboard pattern and typical uses.', 'scale', id]);
        });
        return rows.slice(0, 200);
    })();
    BOOKS.push(...MORE_BOOK_TOPICS.concat(GENERATED_TOPICS).map(([title, focus, type, patternId]) => ({
        id: 'guide-' + patternId + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title, blurb: focus, keyed: true, group: GROUP_FOR_TYPE[type],
        build(key) {
            const pattern = type === 'scale' ? mt.scales[patternId] : type === 'chord' ? mt.chords[patternId] : mt.intervals[patternId];
            const formula = type === 'interval' ? ['1', patternId] : pattern.intervals;
            const notes = type === 'scale' ? mt.getScaleNotes(key, patternId) : type === 'chord' ? mt.getChordNotes(key, patternId) : [key, mt.getNoteFromInterval(key, patternId)];
            const b = new Book(title, focus + ' Key: ' + key + '.');
            b.context = { type, key, patternName: pattern.name, formula, notes, focus, patternId, referenceType: type, referenceId: patternId };
            b.h1('Concept');
            b.p(focus + ' The pattern is measured from ' + key + ' and can be moved without changing its interval relationships. Learn the sound by singing the root first, then naming each scale degree or chord tone as you play.');
            b.table([{ h: 'Degree', w: 28 }, { h: 'Interval', w: 35 }, { h: 'Note in ' + key, w: 42 }, { h: 'Practice focus', w: 75 }],
                formula.map((iv, i) => [i + 1, iv, notes[i] || '', i === 0 ? 'Root / tonal center' : 'Hear and locate this color']), 9);
            b.h2('Fretboard map');
            b.fretboard(key + ' ' + pattern.name, GUITAR, key, formula);
            b.h2('Practice sequence');
            b.bullets([
                'Play the formula slowly from the root and say each interval aloud.',
                'Repeat the pattern in a second neck position while keeping the same root-to-note distances.',
                'Use a metronome at a comfortable tempo; keep every note even and relaxed.',
                "Make a short phrase that emphasizes the pattern's defining interval, then resolve to the root."
            ]);
            b.p('Reference notes in ' + key + ': ' + notes.join(' - ') + '. Formula: ' + formula.join(' - ') + '.');
            return b;
        }
    })));

    const FURTHER_BOOK_TOPICS = [
        ['Semitone Neighbors on Guitar', 'Use adjacent fret movement to hear and locate the smallest equal-tempered interval.', 'interval', 'b2'],
        ['Whole-Step Melodic Routes', 'Build clear two-semitone movement into melodies and major-scale fragments.', 'interval', '2'],
        ['Unison and Octave Landmarks', 'Find repeated pitch classes across strings and use octave placement to navigate the neck.', 'interval', '1'],
        ['Augmented Seconds in Context', 'Compare the notated augmented second with its equal-tempered minor-third sound.', 'interval', '#2'],
        ['Minor Third Phrase Endings', 'Use a minor third as a clear melodic and minor-chord color tone.', 'interval', 'b3'],
        ['Major Third Chord Identity', 'Hear and locate the tone that distinguishes major harmony from minor.', 'interval', '3'],
        ['Fourth-to-Fifth Motion', 'Connect suspended fourths, stable fifths, and familiar root movement.', 'interval', '4'],
        ['Tritone Voice Leading Lab', 'Resolve the six-semitone span by moving its two voices toward nearby chord tones.', 'interval', '#4'],
        ['Diminished-Fifth Tension', 'Compare diminished-fifth and augmented-fourth spelling while hearing the same tritone pitch class.', 'interval', 'b5'],
        ['Flat-Sixth Melodic Color', 'Practice the lowered sixth as a melodic color and as a path into the fifth.', 'interval', 'b6'],
        ['Sixth Leaps and Inversions', 'Sing and play sixths, then relate their inversion to thirds.', 'interval', '6'],
        ['Flat-Seventh Resolution Choices', 'Hear how the minor seventh supports blues, Mixolydian, and dominant harmony.', 'interval', 'b7'],
        ['Leading Tone Cadence Workshop', 'Use the major seventh’s half-step pull to make tonic arrivals deliberate.', 'interval', '7'],
        ['Ionian Scale-Degree Phrasing', 'Use tonic, third, fifth, and leading tone as stable targets in a major-key phrase.', 'scale', 'major'],
        ['Aeolian Center and Relative Major', 'Keep the minor tonic clear even when natural minor shares notes with its relative major.', 'scale', 'natural_minor'],
        ['Dorian Sixth Applications', 'Emphasize the natural sixth to distinguish Dorian from natural minor over a minor vamp.', 'scale', 'dorian'],
        ['Phrygian Tonic Control', 'Use the flat second as a deliberate tension while keeping the tonic audible.', 'scale', 'phrygian'],
        ['Lydian Raised-Fourth Lines', 'Make the raised fourth audible without losing the major tonal center.', 'scale', 'lydian'],
        ['Mixolydian over Dominant Harmony', 'Target the major third and flat seventh to connect a mode to a dominant chord.', 'scale', 'mixolydian'],
        ['Locrian and Half-Diminished Color', 'Relate the flat fifth and flat second to the unstable sound of half-diminished harmony.', 'scale', 'locrian'],
        ['Harmonic Minor V-to-i Practice', 'Use the raised leading tone to strengthen a dominant-to-minor-tonic cadence.', 'scale', 'harmonic_minor'],
        ['Melodic Minor Guide Tones', 'Highlight the raised sixth and seventh while maintaining a minor tonic.', 'scale', 'melodic_minor'],
        ['Minor Pentatonic Position Links', 'Connect familiar pentatonic boxes through shared roots and short melodic motifs.', 'scale', 'pentatonic_minor'],
        ['Major Pentatonic Melody Craft', 'Create singable lines from five scale tones using repetition, skips, and resolution.', 'scale', 'pentatonic_major'],
        ['Major Blues Phrase Building', 'Blend major-pentatonic stability with the added blue-note tension.', 'scale', 'major_blues'],
        ['Whole-Tone Symmetry Studies', 'Explore whole-step symmetry and avoid treating the collection as a conventional major/minor key.', 'scale', 'whole_tone'],
        ['Diminished Scale Alternation', 'Map the repeating half/whole collection and hear its symmetry over dominant tension.', 'scale', 'diminished'],
        ['Phrygian Dominant Resolution', 'Balance the flat second and major third, then resolve the dominant color clearly.', 'scale', 'phrygian_dominant'],
        ['Bebop Dominant Beat Placement', 'Use the added passing tone to keep chord tones landing on strong beats.', 'scale', 'bebop_dominant'],
        ['Hirajoshi Space and Contour', 'Use a compact Japanese pentatonic collection to shape spacious, non-busy melodies.', 'scale', 'hirajoshi'],
        ['Hungarian Minor Augmented Second', 'Locate the scale’s characteristic augmented-second color and phrase around it deliberately.', 'scale', 'hungarian_minor'],
        ['Major Triads on the Top Strings', 'Find root-position and inverted major triads on adjacent string groups.', 'chord', 'major'],
        ['Minor Triad Third Movement', 'Change only the third to hear and play the difference between major and minor triads.', 'chord', 'minor'],
        ['Diminished Triad Resolutions', 'Use the diminished fifth as tension and connect each voice to a nearby stable chord tone.', 'chord', 'diminished'],
        ['Augmented Triad Symmetry', 'Hear the equal spacing of an augmented triad and explore its movable fretboard shapes.', 'chord', 'augmented'],
        ['Power-Chord Muting and Timing', 'Use root-fifth dyads with clean muting, even attacks, and controlled rhythmic placement.', 'chord', '5'],
        ['Suspended-Second Voice Movement', 'Resolve the suspended second by moving one voice into a clear major or minor third.', 'chord', 'sus2'],
        ['Suspended-Fourth Voice Movement', 'Control the tension and resolution of a suspended fourth over a stable root and fifth.', 'chord', 'sus4'],
        ['Major-Sixth Chord Colors', 'Add the sixth to a major triad and compare the result with a seventh-chord sound.', 'chord', '6'],
        ['Minor-Sixth Chord Applications', 'Hear how a major sixth over a minor triad changes its color and melodic options.', 'chord', 'm6'],
        ['Major-Seventh Voice Leading', 'Use the major seventh as a close-resolution tone in compact tonic and IV voicings.', 'chord', 'major7'],
        ['Dominant-Seventh Tritone Resolution', 'Guide the third and flat seventh of a dominant chord into a nearby tonic voicing.', 'chord', 'dominant7'],
        ['Minor-Seventh Shell Voicings', 'Use roots and guide tones to make useful minor-seventh voicings with fewer notes.', 'chord', 'minor7'],
        ['Half-Diminished iiø-V-i Map', 'Connect a half-diminished chord to the dominant and tonic in a minor-key cadence.', 'chord', 'half_diminished'],
        ['Diminished-Seventh Passing Shapes', 'Move the symmetrical diminished-seventh shape by minor thirds and resolve it smoothly.', 'chord', 'diminished7'],
        ['Add-Nine Open Voicings', 'Add the ninth without a seventh and keep the chord’s triad identity clear.', 'chord', 'add9'],
        ['Dominant-Ninth Comping', 'Choose essential tones from a dominant ninth chord for practical guitar comping.', 'chord', 'dom9'],
        ['Dominant-Eleventh Voice Selection', 'Prioritize playable chord tones and extensions when arranging an eleventh chord.', 'chord', 'dom11'],
        ['Dominant-Thirteenth Shells', 'Suggest a thirteenth sound with a compact voicing that preserves the dominant function.', 'chord', 'dom13'],
        ['Altered-Dominant Resolution Paths', 'Compare altered dominant colors and resolve their tension into a clear tonic target.', 'chord', 'alt7']
    ];

    BOOKS.push(...FURTHER_BOOK_TOPICS.map(([title, focus, type, patternId]) => ({
        id: 'study-' + patternId + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title, blurb: focus, keyed: true, group: GROUP_FOR_TYPE[type],
        build(key) {
            const pattern = type === 'scale' ? mt.scales[patternId] : type === 'chord' ? mt.chords[patternId] : mt.intervals[patternId];
            if (!pattern) throw new Error('Missing local theory data for ' + title);
            const formula = type === 'interval' ? ['1', patternId] : pattern.intervals;
            const notes = type === 'scale' ? mt.getScaleNotes(key, patternId) : type === 'chord' ? mt.getChordNotes(key, patternId) : [key, mt.getNoteFromInterval(key, patternId)];
            const base0 = Array.from(new Set([0].concat(formula.map(iv => mt.getIntervalSemitones(iv))
                .filter(value => value !== null)
                .map(value => ((value % 12) + 12) % 12)))).sort((a, b) => a - b).join('-');
            const b = new Book(title, focus + ' Key: ' + key + '.');
            b.context = { type, key, patternName: pattern.name, formula, notes, focus, patternId, referenceType: type, referenceId: patternId };
            b.h1('Study aim');
            b.p(focus + ' The pattern is ' + pattern.name + ', measured from ' + key + '. Learn both its written interval formula and its sound; Base-0 pitch classes are ' + base0 + '.');
            b.h1('Formula and spelling', true);
            b.table([{ h: 'Degree', w: 25 }, { h: 'Interval', w: 38 }, { h: 'Note in ' + key, w: 42 }, { h: 'Base 0', w: 25 }, { h: 'Listening target', w: 55 }],
                formula.map((iv, i) => [i + 1, iv, notes[i] || '', ((mt.getIntervalSemitones(iv) % 12) + 12) % 12, i === 0 ? 'Root / tonal center' : 'Hear this color against the root']), 8);
            b.h2('Fretboard map');
            b.fretboard(key + ' ' + pattern.name, GUITAR, key, formula);
            b.h2('Guided practice');
            b.bullets([
                'Sing the root, then play the formula slowly while naming each interval aloud.',
                'Find the same notes in a second fretboard position and preserve the interval distances.',
                'Play the pattern over a steady pulse; keep the rhythm even before increasing tempo.',
                focus,
                'Finish with a short musical phrase that resolves clearly to the tonal center or the next chord.'
            ]);
            b.h2('Self-check');
            b.p('Without looking at the table, state the formula for ' + pattern.name + ', play it in ' + key + ', and explain how its defining interval supports the focus of this guide. Then verify the spelling: ' + notes.join(' - ') + '.');
            return b;
        }
    })));

    const EXPANDED_BOOK_TOPICS = [
        // Theory Reference (15)
        ['Theory Reference', 'Pitch Classes and the Chromatic Cycle', 'Relate enharmonic note names to the twelve equal-tempered pitch classes and use a root as the reference point.', 'interval', '1'],
        ['Theory Reference', 'Enharmonic Spelling in Context', 'Compare spellings such as an augmented fourth and diminished fifth, then choose names that clarify musical function.', 'interval', 'b5'],
        ['Theory Reference', 'How to Read Scale Formulas', 'Translate interval formulas into note spellings and separate scale-degree numbers from fretboard positions.', 'scale', 'major'],
        ['Theory Reference', 'Scale Degrees and Roman Numerals', 'Connect scale-degree numbers to diatonic chord numerals and recognize the same function after transposition.', 'scale', 'major'],
        ['Theory Reference', 'Circle of Fifths Key Map', 'Use perfect-fifth relationships to organize key centers, neighboring keys, and common harmonic motion.', 'interval', '5'],
        ['Theory Reference', 'Major Key Signature Logic', 'Derive a major collection from its tonic and whole-step and half-step pattern.', 'scale', 'major'],
        ['Theory Reference', 'Minor Key Signature Logic', 'Distinguish natural minor from its relative major and hear the minor tonic as the center.', 'scale', 'natural_minor'],
        ['Theory Reference', 'Triads from Stacked Thirds', 'Build major, minor, diminished, and augmented triads by changing the third and fifth.', 'chord', 'major'],
        ['Theory Reference', 'Diatonic Triads by Degree', 'Stack scale thirds to create a repeating family of triad qualities in a major key.', 'chord', 'major'],
        ['Theory Reference', 'Seventh Chord Family Reference', 'Compare the five common seventh-chord qualities by formula, spelling, and guide-tone motion.', 'chord', 'major7'],
        ['Theory Reference', 'A Practical Chord Symbol Decoder', 'Read roots, qualities, extensions, and alterations as interval instructions rather than fixed shapes.', 'chord', 'dominant7'],
        ['Theory Reference', 'Tonic, Predominant, and Dominant', 'Hear the three broad functions as arrival, preparation, and directed tension.', 'scale', 'major'],
        ['Theory Reference', 'Pentatonic and Heptatonic Collections', 'Compare five-note and seven-note collections and identify how omitted degrees change melodic density.', 'scale', 'pentatonic_major'],
        ['Theory Reference', 'Chromatic Approach Notes', 'Use a neighboring semitone as directed melodic tension that resolves to a stable target.', 'interval', 'b2'],
        ['Theory Reference', 'Music Theory Recall Workbook', 'Combine note spelling, interval formulas, key changes, and short written examples in a single review method.', 'scale', 'major'],

        // Intervals & Ear Training (15)
        ['Intervals & Ear Training', 'Perfect Fifths Across the Neck', 'Hear the stable fifth, locate it from movable roots, and use it to connect bass lines and power chords.', 'interval', '5'],
        ['Intervals & Ear Training', 'Perfect Fourths and Suspended Motion', 'Compare the fourth with the fifth and hear how a suspended fourth resolves toward a third.', 'interval', '4'],
        ['Intervals & Ear Training', 'Major Second Melodic Pathways', 'Practice whole-step motion as a melodic connector and as part of larger scale fragments.', 'interval', '2'],
        ['Intervals & Ear Training', 'Minor Second Resolution Lab', 'Use half-step tension as a clear leading motion into a nearby chord or scale tone.', 'interval', 'b2'],
        ['Intervals & Ear Training', 'Minor Third Sound and Shape', 'Recognize the minor third by singing, spelling, and locating the same sound in more than one position.', 'interval', 'b3'],
        ['Intervals & Ear Training', 'Major Third Identity Training', 'Use the major third as a decisive sound cue for major harmony and melodic arrival.', 'interval', '3'],
        ['Intervals & Ear Training', 'Tritone Color and Resolution', 'Compare the two spellings of the six-semitone span and guide its voices toward stable chord tones.', 'interval', 'b5'],
        ['Intervals & Ear Training', 'Minor Sixth Leaps', 'Sing the minor sixth in both directions and connect its wide contour to nearby chord tones.', 'interval', 'b6'],
        ['Intervals & Ear Training', 'Major Sixth Connections', 'Use major-sixth leaps in melody and relate their inversion to a minor third.', 'interval', '6'],
        ['Intervals & Ear Training', 'Minor Seventh in Blues and Dominant Sounds', 'Hear the flat seventh against a tonic and use it to identify blues and dominant color.', 'interval', 'b7'],
        ['Intervals & Ear Training', 'Leading Tone and Major Seventh', 'Practice the semitone pull from the major seventh to the tonic without losing the root center.', 'interval', '7'],
        ['Intervals & Ear Training', 'Augmented Second Spelling', 'Compare augmented-second notation with its equal-tempered sound and preserve the written scale-degree meaning.', 'interval', '#2'],
        ['Intervals & Ear Training', 'Interval Inversion Practice', 'Invert fourths, fifths, thirds, and sixths across an octave and check the complementary interval.', 'interval', '5'],
        ['Intervals & Ear Training', 'Melodic Contour and Interval Size', 'Separate the direction of a melodic line from the measured distance between its notes.', 'interval', '3'],
        ['Intervals & Ear Training', 'Daily Interval Ear Training', 'Build a short call-and-response routine that tests singing, recognition, spelling, and recall.', 'interval', 'b3'],

        // Scales & Modes (20)
        ['Scales & Modes', 'Major Scale Degree Workshop', 'Target the tonic, third, fifth, and leading tone to create clear major-key phrases.', 'scale', 'major'],
        ['Scales & Modes', 'Natural Minor Tonic Control', 'Keep Aeolian harmony centered on its minor tonic even when it shares notes with a relative major.', 'scale', 'natural_minor'],
        ['Scales & Modes', 'Harmonic Minor Leading-Tone Lines', 'Use the raised seventh to strengthen dominant-to-tonic motion in minor keys.', 'scale', 'harmonic_minor'],
        ['Scales & Modes', 'Melodic Minor Color Tones', 'Hear the raised sixth and seventh against a minor tonic and use them as deliberate melodic colors.', 'scale', 'melodic_minor'],
        ['Scales & Modes', 'Dorian Groove and Natural Sixth', 'Make the natural sixth audible over a minor vamp to distinguish Dorian from natural minor.', 'scale', 'dorian'],
        ['Scales & Modes', 'Phrygian Flat-Second Control', 'Use the flat second as focused tension while returning phrase endings to a clear tonic.', 'scale', 'phrygian'],
        ['Scales & Modes', 'Lydian Raised-Fourth Lines', 'Highlight the raised fourth over a major center without letting it obscure the tonic.', 'scale', 'lydian'],
        ['Scales & Modes', 'Mixolydian Dominant Vocabulary', 'Connect the major third and flat seventh to dominant harmony and blues phrasing.', 'scale', 'mixolydian'],
        ['Scales & Modes', 'Locrian and Half-Diminished Sound', 'Hear the flat fifth and flat second against an unstable minor tonic and half-diminished chord.', 'scale', 'locrian'],
        ['Scales & Modes', 'Minor Pentatonic Motif Building', 'Create concise phrases from five tones using repetition, bends, rests, and root resolution.', 'scale', 'pentatonic_minor'],
        ['Scales & Modes', 'Major Pentatonic Melody Craft', 'Build singable lines from five stable tones with skips and deliberate phrase endings.', 'scale', 'pentatonic_major'],
        ['Scales & Modes', 'Blues Scale Blue-Note Timing', 'Treat the blue note as expressive passing tension rather than an equal-weight resting tone.', 'scale', 'blues'],
        ['Scales & Modes', 'Whole-Tone Symmetry and Space', 'Explore equal whole steps and use the collection for floating, non-tonic-directed colors.', 'scale', 'whole_tone'],
        ['Scales & Modes', 'Diminished Scale Symmetry', 'Map the repeating diminished collection and hear its relationship to dominant tension.', 'scale', 'diminished'],
        ['Scales & Modes', 'Phrygian Dominant Sound', 'Balance the flat second and major third to create a clear dominant center.', 'scale', 'phrygian_dominant'],
        ['Scales & Modes', 'Bebop Dominant Beat Placement', 'Use the passing tone to keep chord tones aligned with strong beats in flowing lines.', 'scale', 'bebop_dominant'],
        ['Scales & Modes', 'Hirajoshi Pentatonic Contour', 'Shape spacious melodies from a compact Japanese pentatonic collection and its characteristic gaps.', 'scale', 'hirajoshi'],
        ['Scales & Modes', 'Hungarian Minor Augmented-Second Color', 'Locate the augmented-second color and balance it with stable tonic and fifth targets.', 'scale', 'hungarian_minor'],
        ['Scales & Modes', 'Major Blues Phrase Design', 'Blend major-pentatonic stability with a chromatic blue-note approach.', 'scale', 'major_blues'],
        ['Scales & Modes', 'Compare Major, Minor, and Modal Centers', 'Use a shared tonic to compare how altered scale degrees change melodic gravity and mood.', 'scale', 'natural_minor'],

        // Chords & Voicings (20)
        ['Chords & Voicings', 'Major Triad Inversion Map', 'Connect root position, first inversion, and second inversion while keeping the chord identity audible.', 'chord', 'major'],
        ['Chords & Voicings', 'Minor Triad Voice Movement', 'Change the third to hear minor quality and move smoothly between neighboring voicings.', 'chord', 'minor'],
        ['Chords & Voicings', 'Diminished Triad Tension', 'Use the diminished fifth as directed tension and resolve each voice by small motion.', 'chord', 'diminished'],
        ['Chords & Voicings', 'Augmented Triad Symmetry', 'Hear the equal spacing of the augmented triad and explore its movable shape.', 'chord', 'augmented'],
        ['Chords & Voicings', 'Suspended Second Resolution', 'Keep the root and fifth stable while moving the second into a major or minor third.', 'chord', 'sus2'],
        ['Chords & Voicings', 'Suspended Fourth Resolution', 'Control the tension of the fourth and resolve it clearly into a chord third.', 'chord', 'sus4'],
        ['Chords & Voicings', 'Power Chord Muting and Weight', 'Use root-fifth dyads with clean muting, balanced attacks, and clear rhythmic placement.', 'chord', '5'],
        ['Chords & Voicings', 'Major Seventh Tonic Voicings', 'Add the major seventh as a close color tone and manage its relationship to the tonic.', 'chord', 'major7'],
        ['Chords & Voicings', 'Dominant Seventh Guide Tones', 'Use the third and flat seventh to make dominant function and resolution easy to hear.', 'chord', 'dominant7'],
        ['Chords & Voicings', 'Minor Seventh Shell Voicings', 'Preserve minor quality and groove with compact root, third, and seventh combinations.', 'chord', 'minor7'],
        ['Chords & Voicings', 'Half-Diminished Chord Spelling', 'Spell the minor-third, diminished-fifth, and flat-seventh structure and prepare its resolution.', 'chord', 'half_diminished'],
        ['Chords & Voicings', 'Diminished Seventh Passing Shapes', 'Use the repeating minor-third structure to connect diminished voicings and resolve them.', 'chord', 'diminished7'],
        ['Chords & Voicings', 'Augmented Seventh Dominant Color', 'Combine an altered fifth with dominant function and resolve the altered tones deliberately.', 'chord', 'augmented7'],
        ['Chords & Voicings', 'Add-Nine Open Chord Colors', 'Add the ninth without a seventh and keep the underlying triad quality distinct.', 'chord', 'add9'],
        ['Chords & Voicings', 'Minor Add-Nine Chord Shapes', 'Contrast the minor third and added ninth while choosing practical voicings.', 'chord', 'madd9'],
        ['Chords & Voicings', 'Major Sixth and Six-Nine Colors', 'Compare a sixth chord with a seventh chord and use the added tone without losing triad clarity.', 'chord', '6'],
        ['Chords & Voicings', 'Minor Sixth Chord Applications', 'Hear the major sixth above a minor triad and connect it to melodic voice leading.', 'chord', 'm6'],
        ['Chords & Voicings', 'Major Ninth Extension Guide', 'Stack the ninth above a major seventh sound and select essential tones for playable voicings.', 'chord', 'maj9'],
        ['Chords & Voicings', 'Dominant Ninth Comping', 'Suggest a dominant ninth with compact voicings that preserve its guide tones.', 'chord', 'dom9'],
        ['Chords & Voicings', 'Altered Dominant Resolution Paths', 'Compare altered dominant tones and resolve their tension into a clear tonic target.', 'chord', 'alt7'],

        // Harmony & Progressions (15)
        ['Harmony & Progressions', 'I-IV-V in Every Key', 'Transpose the primary major-key progression while preserving its tonic, subdominant, and dominant roles.', 'chord', 'major'],
        ['Harmony & Progressions', 'ii-V-I Voice Leading', 'Connect predominant and dominant guide tones into a stable tonic arrival.', 'chord', 'dominant7'],
        ['Harmony & Progressions', 'Minor ii-V-i Cadence', 'Prepare a minor tonic with a half-diminished predominant and a directed dominant chord.', 'chord', 'half_diminished'],
        ['Harmony & Progressions', 'Six-Four-Five-One Pop Motion', 'Hear how a familiar four-chord loop balances departure, tension, and return.', 'scale', 'major'],
        ['Harmony & Progressions', 'Circle Progressions and Bass Motion', 'Use descending fifth relationships to connect roots and plan smooth chord changes.', 'interval', '5'],
        ['Harmony & Progressions', 'Authentic and Plagal Cadences', 'Compare dominant-to-tonic arrival with subdominant-to-tonic motion.', 'chord', 'dominant7'],
        ['Harmony & Progressions', 'Deceptive Resolution in Major', 'Delay an expected tonic arrival by redirecting dominant motion to a related chord.', 'scale', 'major'],
        ['Harmony & Progressions', 'Secondary Dominant Preparation', 'Use a temporary dominant sound to point clearly toward a non-tonic chord.', 'chord', 'dominant7'],
        ['Harmony & Progressions', 'Borrowed Minor-Key Colors', 'Compare parallel major and minor collections and borrow one color tone with a clear return.', 'scale', 'natural_minor'],
        ['Harmony & Progressions', 'Common-Tone Voice Leading', 'Retain shared tones and move other voices by the smallest practical distance.', 'chord', 'major7'],
        ['Harmony & Progressions', 'Bass Lines Through Chord Roots', 'Build a bass line from chord roots, fifths, and stepwise connections.', 'interval', '5'],
        ['Harmony & Progressions', 'Harmonic Rhythm and Phrase Length', 'Choose when chords change to support a phrase rather than changing automatically on every beat.', 'chord', 'major'],
        ['Harmony & Progressions', 'Major-Key Diatonic Seventh Progressions', 'Use diatonic seventh chords to add voice-leading detail to a familiar major-key progression.', 'chord', 'major7'],
        ['Harmony & Progressions', 'Minor-Key Dominant-to-Tonic Motion', 'Compare natural-minor v with a raised-leading-tone V and hear the stronger cadence.', 'scale', 'harmonic_minor'],
        ['Harmony & Progressions', 'Write a Progression in Twelve Keys', 'Create one progression with Roman numerals, transpose it, and verify each chord spelling.', 'chord', 'major'],

        // Fretboard & Technique (15)
        ['Fretboard & Technique', 'Natural Note Landmarks on the Neck', 'Memorize natural-note anchors and use semitone neighbors to find every chromatic pitch.', 'interval', 'b2'],
        ['Fretboard & Technique', 'Octave Shapes and Note Names', 'Connect matching pitch classes across strings and verify each octave with note names.', 'interval', '1'],
        ['Fretboard & Technique', 'Major Scale Positions on Any Tuning', 'Map scale degrees from a root and transfer them across adjacent strings in the selected tuning.', 'scale', 'major'],
        ['Fretboard & Technique', 'Minor Pentatonic Position Links', 'Connect familiar minor-pentatonic regions with shared roots and short motifs.', 'scale', 'pentatonic_minor'],
        ['Fretboard & Technique', 'Major Pentatonic Across String Sets', 'Move a five-note melodic idea across string groups while preserving its interval relationships.', 'scale', 'pentatonic_major'],
        ['Fretboard & Technique', 'Triads on Adjacent Strings', 'Find compact major-triad inversions on neighboring strings and identify the bass chord tone.', 'chord', 'major'],
        ['Fretboard & Technique', 'Minor Triads Across the Neck', 'Locate root, flat third, and fifth in multiple positions and connect them with minimal movement.', 'chord', 'minor'],
        ['Fretboard & Technique', 'Dominant Guide Tones on the Neck', 'Map the third and flat seventh in multiple registers and resolve them into nearby targets.', 'chord', 'dominant7'],
        ['Fretboard & Technique', 'String-Crossing Interval Map', 'Trace one interval across each adjacent string pair and account for tuning differences.', 'interval', '4'],
        ['Fretboard & Technique', 'Root-Fifth Routes for Bass and Guitar', 'Connect roots and fifths across strings to build clear low-register movement.', 'interval', '5'],
        ['Fretboard & Technique', 'Seven-String Low-Register Mapping', 'Use the added low string as a new root landmark and connect it to familiar octave shapes.', 'scale', 'major'],
        ['Fretboard & Technique', 'Eight-String Range and Position Control', 'Organize an extended range around repeatable root and scale-degree anchors.', 'scale', 'natural_minor'],
        ['Fretboard & Technique', 'Open-String Drone Applications', 'Use open strings as tonal references while fretting scale and chord tones around them.', 'scale', 'dorian'],
        ['Fretboard & Technique', 'Tuning Changes and Transposable Shapes', 'Recalculate note names after a tuning change instead of assuming a familiar shape retains its pitches.', 'interval', '3'],
        ['Fretboard & Technique', 'Fretboard Practice and Self-Testing', 'Combine note naming, interval recognition, and short musical phrases into a reliable neck-mapping routine.', 'scale', 'major']
    ];

    BOOKS.push(...EXPANDED_BOOK_TOPICS.map(([group, title, focus, type, patternId]) => ({
        id: 'expanded-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title, blurb: focus, group, keyed: true,
        build(key) {
            const pattern = type === 'scale' ? mt.scales[patternId] : type === 'chord' ? mt.chords[patternId] : mt.intervals[patternId];
            if (!pattern) throw new Error('Missing local theory data for ' + title);
            const formula = type === 'interval' ? ['1', patternId] : pattern.intervals;
            const notes = type === 'scale' ? mt.getScaleNotes(key, patternId) : type === 'chord' ? mt.getChordNotes(key, patternId) : [key, mt.getNoteFromInterval(key, patternId)];
            const b = new Book(title, focus + ' Key: ' + key + '.');
            b.context = { type, key, patternName: pattern.name, formula, notes, focus, patternId, referenceType: type, referenceId: patternId };
            b.h1('Music theory reference');
            b.p(focus + ' The reference pattern is ' + pattern.name + '. Read every interval from the root, spell the notes in ' + key + ', then sing the defining sound before playing the shape.');
            b.table([{ h: 'Degree', w: 28 }, { h: 'Interval', w: 35 }, { h: 'Note in ' + key, w: 42 }, { h: 'Study target', w: 75 }],
                formula.map((iv, i) => [i + 1, iv, notes[i] || '', i === 0 ? 'Root / tonal center' : focus]), 8.5);
            b.h2('Sound and application');
            b.bullets([
                'Sing the root, then sing each interval before checking it on the instrument.',
                'Play the formula slowly in the selected tuning and name the note and interval at each stop.',
                focus,
                'Create a short phrase or progression that makes the defining sound easy to hear.',
                'Transpose the idea by naming a new root first; preserve interval relationships rather than fret numbers.'
            ]);
            b.h2('Fretboard diagram');
            b.fretboard(key + ' ' + pattern.name, [], key, formula);
            b.h2('Self-check');
            b.p('Without the table, state the formula, sing its defining note from ' + key + ', find the pattern in a second register, and explain how its sound serves the focus of this guide. Verify the spelling: ' + notes.join(' - ') + '.');
            return b;
        }
    })));

    async function buildCompleteDataEbook(key, onProgress) {
        const intervalIds = Object.keys(mt.intervals).sort((a, b) => mt.intervals[a].semitones - mt.intervals[b].semitones || a.localeCompare(b));
        const scaleIds = Object.keys(mt.scales).sort((a, b) => String(mt.scales[a].name || a).localeCompare(String(mt.scales[b].name || b), 'en', { numeric: true }));
        const chordIds = Object.keys(mt.chords).sort((a, b) => String(mt.chords[a].name || a).localeCompare(String(mt.chords[b].name || b), 'en', { numeric: true }));
        const gamutIds = Object.keys(mt.gamuts).sort((a, b) => String(mt.gamuts[a].name || a).localeCompare(String(mt.gamuts[b].name || b), 'en', { numeric: true }));
        const total = intervalIds.length + scaleIds.length + chordIds.length + gamutIds.length;
        const b = new Book('Complete Music Theory Index', 'Full local theory catalog: intervals, scales, chords, fretboard patterns, reference tables, and guided study');
        b.context = { type: 'guide', key, patternName: 'complete theory reference', referenceType: 'scale', referenceId: 'major' };
        let completed = 0;
        const report = async (section, title) => {
            completed++;
            if (completed % 8 === 0 || completed === total) {
                onProgress(section, completed, total, title);
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        };
        const degreeRows = (formula, notes) => formula.map((iv, i) => {
            const semitones = mt.getIntervalSemitones(iv);
            return [i + 1, iv, notes[i] || '', semitones === null ? '' : ((semitones % 12) + 12) % 12];
        });
        const spellingFor = (type, id, formula) => type === 'scale' ? mt.getScaleNotes(key, id)
            : type === 'chord' ? mt.getChordNotes(key, id)
                : formula.map(iv => mt.getNoteFromInterval(key, iv) || '');
        const stepsFor = formula => {
            const offsets = Array.from(new Set(formula.map(iv => mt.getIntervalSemitones(iv))
                .filter(value => value !== null).map(value => ((value % 12) + 12) % 12))).sort((a, c) => a - c);
            return offsets.map((value, i) => (offsets[(i + 1) % offsets.length] - value + 12) % 12 || 12).join(' - ');
        };
        const indexEntries = [];

        b.h1('Index and Data Coverage');
        b.p('A complete index of the theory catalogs bundled with this app. Catalog entries are alphabetized within each section; use the PDF bookmarks to jump between sections and the Find command to locate a scale, chord, interval, or fretboard pattern. Every entry includes selected-key spelling, reference detail, a practice exercise, and a diagram in the tuning printed on the cover.');
        b.table([{ h: 'Section', w: 80 }, { h: 'Entries', w: 25 }, { h: 'Included material', w: 75 }], [
            ['Intervals', intervalIds.length, 'Quality, semitone distance, spelling, exercise, diagram'],
            ['Scales', scaleIds.length, 'Formula, notes, scale description, exercise, diagram'],
            ['Chords', chordIds.length, 'Formula, chord spelling, character, exercise, diagram'],
            ['Fretboard gamut patterns', gamutIds.length, 'Stored positions, configured-tuning diagram, exercise']
        ], 8.5);
        b.p('The selected example key is ' + key + '. String tuning is low to high: ' + b.instrument.strings.join(' - ') + '.');
        b.h2('Contents');
        b.bullets([
            'Quick Music Theory Reference: pitch names, interval families, key signatures, solfege, and common tunings.',
            'Interval Catalog: all ' + intervalIds.length + ' interval definitions with practice and fretboard diagrams.',
            'Scale Catalog: all ' + scaleIds.length + ' named, modal, exotic, and formula-generated scale collections.',
            'Chord Catalog: all ' + chordIds.length + ' chord formulas, including the extended and altered families.',
            'Fretboard Gamut Patterns: all ' + gamutIds.length + ' stored app shapes shown on the selected string setup.'
        ]);

        b.h1('Quick Music Theory Reference', true);
        b.h2('Chromatic note names and solfege');
        b.table([{ h: 'Pitch class', w: 35 }, { h: 'Note', w: 30 }, { h: 'Solfege', w: 30 }, { h: 'Enharmonic spelling', w: 85 }],
            mt.notes.map((note, i) => [i, note, mt.solfege && mt.solfege[note] || '', mt.enharmonicPairs && mt.enharmonicPairs[note] || note]), 8.5);
        b.h2('Key signature reference');
        const signatureRows = Object.entries(mt.keySignatures || {}).map(([root, changes]) => {
            const alterations = Object.entries(changes).map(([note, alteration]) => note + alteration).join(' ');
            return [root, alterations || 'No accidentals', Object.keys(changes).length];
        });
        b.table([{ h: 'Major key', w: 35 }, { h: 'Signature', w: 115 }, { h: 'Accidentals', w: 30 }], signatureRows, 8.5);
        b.h2('Common standard tunings (low to high)');
        b.table([{ h: 'Strings', w: 30 }, { h: 'Open notes', w: 150 }],
            Object.entries(mt.standardTunings || {}).map(([count, tuning]) => [count, tuning.slice().reverse().join(' - ')]), 8.5);
        b.p('Scale formulas measure each degree from the root. Chord formulas identify simultaneous chord tones; extensions above an octave are shown by their interval names but their fretboard locations repeat by pitch class. Enharmonic spellings may differ while sounding at the same equal-tempered pitch.');

        function addPatternEntry(type, id, pattern, ordinal) {
            const formula = type === 'interval' ? ['1', id] : pattern.intervals || [];
            const notes = spellingFor(type, id, formula);
            const title = pattern.name || id;
            indexEntries.push({ title, id, section: type, page: b.doc.internal.getNumberOfPages() - 1 });
            b.h2(String(ordinal).padStart(4, '0') + ' | ' + title);
            if (type === 'scale') {
                const description = mt.getScaleDescription(id) || ('A ' + formula.length + '-degree scale collection with formula ' + formula.join(' - ') + '. Its pitch-class step cycle is ' + stepsFor(formula) + ' semitones; listen for the degrees that distinguish it from a major or natural-minor reference.');
                b.p(description);
                b.p('In ' + key + ': ' + notes.join(' - ') + '. Formula: ' + formula.join(' - ') + '.');
                b.table([{ h: 'Degree', w: 25 }, { h: 'Interval', w: 40 }, { h: 'Note in ' + key, w: 45 }, { h: 'Semitones from root', w: 70 }], degreeRows(formula, notes), 8);
                b.bullets([
                    'Sing the root, then play the full collection ascending and descending while naming each degree.',
                    'Emphasize the degrees that differ from the major scale; resolve one short phrase to the root.',
                    'Use a slow drone or tonic chord, record a four-bar melody, and check that the scale color is audible.'
                ]);
            } else if (type === 'chord') {
                const description = mt.getChordDescription(id) || ('A ' + notes.length + '-tone chord built from the formula ' + formula.join(' - ') + '. Compare its third, fifth, and seventh where present; added tones and alterations change color while the root establishes the center.');
                b.p(description);
                b.p('In ' + key + ': ' + notes.join(' - ') + '. Formula: ' + formula.join(' - ') + '.');
                b.table([{ h: 'Tone', w: 25 }, { h: 'Interval', w: 40 }, { h: 'Note in ' + key, w: 45 }, { h: 'Semitones from root', w: 70 }], degreeRows(formula, notes), 8);
                b.bullets([
                    'Play the root first, then add one chord tone at a time and name the quality change.',
                    'Arpeggiate slowly, then play a compact voicing in the configured tuning and listen for doubled or omitted tones.',
                    'Move into the nearest inversion of a related chord, keeping common tones and resolving tense voices by small steps.'
                ]);
            } else {
                const semitones = pattern.semitones;
                const quality = mt.getIntervalQuality(id) || 'interval';
                const consonance = mt.getIntervalConsonance(id) || 'context-dependent';
                b.p(title + ' spans ' + semitones + ' semitone' + (semitones === 1 ? '' : 's') + ' and is described as ' + quality + '. Its consonance is ' + consonance + '; musical context, register, and voicing affect how that quality is heard.');
                b.p('From ' + key + ': ' + notes.join(' - ') + '. Use both the written spelling and the sound; enharmonic intervals can share a pitch distance but imply different harmonic functions.');
                b.table([{ h: 'Role', w: 35 }, { h: 'Interval', w: 45 }, { h: 'Note', w: 45 }, { h: 'Semitones', w: 55 }], degreeRows(formula, notes), 8.5);
                b.bullets([
                    'Sing the root and target in both ascending and descending directions before checking on the instrument.',
                    'Find the same interval on one string and across adjacent strings in the selected tuning.',
                    'Write a short melodic fragment that features this interval, then resolve or repeat it intentionally.'
                ]);
            }
            b.fretboard(key + ' ' + title, [], key, formula);
        }

        b.h1('Interval Catalog (' + intervalIds.length + ')', true);
        for (let i = 0; i < intervalIds.length; i++) {
            const id = intervalIds[i];
            if (i) b.newPage();
            addPatternEntry('interval', id, mt.intervals[id], i + 1);
            await report('Intervals', mt.intervals[id].name || id);
        }
        b.h1('Scale Catalog (' + scaleIds.length + ')', true);
        for (let i = 0; i < scaleIds.length; i++) {
            const id = scaleIds[i];
            if (i) b.newPage();
            addPatternEntry('scale', id, mt.scales[id], i + 1);
            await report('Scales', mt.scales[id].name || id);
        }
        b.h1('Chord Catalog (' + chordIds.length + ')', true);
        for (let i = 0; i < chordIds.length; i++) {
            const id = chordIds[i];
            if (i) b.newPage();
            addPatternEntry('chord', id, mt.chords[id], i + 1);
            await report('Chords', mt.chords[id].name || id);
        }
        b.h1('Fretboard Gamut Patterns (' + gamutIds.length + ')', true);
        for (let i = 0; i < gamutIds.length; i++) {
            const id = gamutIds[i], gamut = mt.gamuts[id];
            if (i) b.newPage();
            const positions = Array.isArray(gamut.positions) ? gamut.positions : [];
            const positionText = positions.map(point => 'string ' + (Number(point.string) + 1) + ', fret ' + point.fret).join('; ') || 'No stored fret positions';
            indexEntries.push({ title: gamut.name || 'Gamut ' + id, id, section: 'gamut', page: b.doc.internal.getNumberOfPages() - 1 });
            b.h2(String(i + 1).padStart(4, '0') + ' | ' + (gamut.name || 'Gamut ' + id));
            b.p('Stored fretboard pattern ' + id + ' contains ' + positions.length + ' position markers: ' + positionText + '. The diagram maps these positions onto the configured string count and shows the resulting notes for the selected tuning.');
            b.bullets([
                'Play the marked notes from the lowest sounding string to the highest, then reverse direction without changing tempo.',
                'Name each resulting pitch and compare the shape with the same fret positions on the neighboring string set.',
                'Move the pattern by two frets, repeat it rhythmically, and listen for how the new notes relate to ' + key + '.'
            ]);
            b.gamutFretboard((gamut.name || 'Gamut ' + id) + ' | ' + positions.length + ' positions', positions);
            await report('Fretboard patterns', gamut.name || id);
        }
        onProgress('Building alphabetical page index', total, total, 'Adding ' + indexEntries.length.toLocaleString() + ' page references');
        b.h1('Alphabetical Index', true);
        b.p('Each page number uses the interior-page numbering printed in the PDF footer. Entry pages are listed alphabetically by display name.');
        indexEntries.sort((a, c) => a.title.localeCompare(c.title, 'en', { numeric: true }));
        b.table([{ h: 'Entry', w: 92 }, { h: 'Data ID', w: 38 }, { h: 'Catalog', w: 30 }, { h: 'Page', w: 20 }],
            indexEntries.map(entry => [entry.title, entry.id, entry.section, entry.page]), 7.5);
        return b;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const list = document.getElementById('ebook-list');
        const keySel = document.getElementById('ebook-key');
        const groupFilter = document.getElementById('ebook-group-filter');
        const stringCount = document.getElementById('ebook-string-count');
        const presetSelect = document.getElementById('ebook-tuning-preset');
        const tuningFields = document.getElementById('ebook-tuning-fields');
        const downloadAll = document.getElementById('ebook-download-all');
        const masterDownload = document.getElementById('ebook-master-download');
        const batchStatus = document.getElementById('ebook-batch-status');
        const count = document.getElementById('ebook-count');
        let downloadLock = false;
        function setDownloadLock(locked) {
            downloadLock = locked;
            downloadAll.disabled = locked;
            masterDownload.disabled = locked;
            document.querySelectorAll('.ebook-button, #ebook-key, #ebook-group-filter, #ebook-string-count, #ebook-tuning-preset, #ebook-tuning-fields select')
                .forEach(control => { control.disabled = locked; });
        }
        KEYS.slice().sort().forEach(k => keySel.add(new Option(k, k)));
        keySel.value = CURRENT_EBOOK_KEY;
        for (let n = 4; n <= 13; n++) stringCount.add(new Option(n + ' strings', String(n)));
        Object.keys(TUNING_PRESETS).forEach(name => presetSelect.add(new Option(name, name)));
        presetSelect.add(new Option('Custom tuning', 'custom'));
        GROUP_ORDER.forEach(group => groupFilter.add(new Option(group, group)));

        function showTuning(tuning, presetName) {
            CURRENT_TUNING = tuning.slice();
            stringCount.value = String(CURRENT_TUNING.length);
            presetSelect.value = presetName || 'custom';
            tuningFields.innerHTML = '';
            CURRENT_TUNING.forEach((note, i) => {
                const label = document.createElement('label');
                label.className = 'ebook-string-setting';
                label.textContent = 'String ' + (i + 1) + ' (low to high)';
                const select = document.createElement('select');
                select.setAttribute('aria-label', label.textContent);
                SHARP.forEach(n => select.add(new Option(n, n)));
                select.value = note;
                select.addEventListener('change', () => {
                    CURRENT_TUNING = Array.from(tuningFields.querySelectorAll('select')).map(input => input.value);
                    presetSelect.value = 'custom';
                });
                label.appendChild(select);
                tuningFields.appendChild(label);
            });
        }
        showTuning(CURRENT_TUNING, 'Standard guitar');
        stringCount.addEventListener('change', () => showTuning(DEFAULT_TUNINGS[Number(stringCount.value)], 'custom'));
        presetSelect.addEventListener('change', () => {
            if (TUNING_PRESETS[presetSelect.value]) showTuning(TUNING_PRESETS[presetSelect.value], presetSelect.value);
        });
        keySel.addEventListener('change', () => { CURRENT_EBOOK_KEY = keySel.value; });

        list.innerHTML = '';
        const groupedBooks = new Map(GROUP_ORDER.map(group => [group, []]));
        BOOKS.forEach(book => groupedBooks.get(book.group || 'Theory Reference')?.push(book));
        if (count) count.textContent = BOOKS.length + ' eBooks in ' + GROUP_ORDER.length + ' groups';
        downloadAll.textContent = 'Download All ' + BOOKS.length + ' eBooks';
        const allDataCount = Object.keys(mt.intervals).length + Object.keys(mt.scales).length + Object.keys(mt.chords).length + Object.keys(mt.gamuts).length;
        masterDownload.title = 'Build one indexed PDF containing ' + allDataCount + ' theory and fretboard entries.';
        const groupSections = new Map();
        GROUP_ORDER.forEach(group => {
            const books = groupedBooks.get(group);
            if (!books.length) return;
            const section = document.createElement('section');
            section.className = 'ebook-group';
            section.dataset.group = group;
            const heading = document.createElement('h2');
            heading.textContent = group + ' (' + books.length + ')';
            const grid = document.createElement('div');
            grid.className = 'ebook-rows';
            section.append(heading, grid);
            list.appendChild(section);
            groupSections.set(group, section);
            books.forEach(book => {
                const el = document.createElement('div');
                el.className = 'ebook-row';
                el.innerHTML = '<div class="ebook-row-main"><h3></h3><p></p></div><div class="ebook-row-actions"><button type="button" class="ebook-button">Download PDF</button></div>';
                el.querySelector('h3').textContent = book.title;
                el.querySelector('p').textContent = book.blurb + ' Uses the key and instrument setup above.';
                const btn = el.querySelector('button');
                btn.addEventListener('click', () => {
                    if (downloadLock) return;
                    setDownloadLock(true);
                    btn.textContent = 'Generating...';
                    setTimeout(() => {
                        try {
                            const key = keySel.value;
                            const pages = book.build(key).save(ST.safeName(book.title + (book.keyed ? ' in ' + key : '')) + '.pdf');
                            ST.toast(book.title + ' - ' + (pages - 1) + ' pages');
                            ST.recordView('ebook', book.id);
                        } catch (error) {
                            console.error(error);
                            ST.toast('Could not generate the eBook: ' + error.message);
                        } finally {
                            btn.textContent = 'Download PDF';
                            setDownloadLock(false);
                        }
                    }, 30);
                });
                grid.appendChild(el);
            });
        });
        groupFilter.addEventListener('change', () => {
            groupSections.forEach((section, group) => { section.hidden = groupFilter.value !== 'all' && group !== groupFilter.value; });
        });

        downloadAll.addEventListener('click', async () => {
            if (downloadLock) return;
            if (!window.JSZip) {
                ST.toast('The ZIP library failed to load.');
                return;
            }
            setDownloadLock(true);
            const key = keySel.value;
            const zip = new window.JSZip();
            const failures = [];
            let added = 0;
            try {
                for (let i = 0; i < BOOKS.length; i++) {
                    const book = BOOKS[i];
                    batchStatus.textContent = 'Generating ' + (i + 1) + ' of ' + BOOKS.length + ': ' + book.title;
                    downloadAll.textContent = 'Generating ' + (i + 1) + '/' + BOOKS.length;
                    await new Promise(resolve => setTimeout(resolve, 0));
                    try {
                        const pdf = book.build(key);
                        const name = ST.safeName(book.title + (book.keyed ? ' in ' + key : '')) + '.pdf';
                        const groupPath = (book.group || 'Theory Reference') + '/' + name;
                        let uniqueName = groupPath, suffix = 2;
                        while (zip.file(uniqueName)) uniqueName = groupPath.replace(/\.pdf$/i, ' (' + suffix++ + ').pdf');
                        zip.file(uniqueName, pdf.blob());
                        added++;
                        try { ST.recordView('ebook', book.id); }
                        catch (error) { console.warn('Could not record eBook view', error); }
                    } catch (error) {
                        console.error('Could not generate ' + book.title, error);
                        failures.push(book.title);
                    }
                }
                if (!added) throw new Error('No PDFs could be generated.');
                batchStatus.textContent = 'Compressing ' + added + ' PDFs into one ZIP...';
                const archive = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 4 }
                }, progress => {
                    batchStatus.textContent = 'Compressing ZIP: ' + Math.round(progress.percent) + '%';
                });
                ST.download(archive, 'scales-thesaurus-ebooks-' + added + '-books-in-' + ST.safeName(key) + '.zip');
                const summary = 'Downloaded ' + added + ' eBooks' + (failures.length ? '; ' + failures.length + ' could not be generated.' : '.');
                batchStatus.textContent = summary;
                ST.toast(summary);
            } catch (error) {
                console.error(error);
                batchStatus.textContent = 'Could not create the ebook ZIP: ' + error.message;
                ST.toast('Could not create the ebook ZIP: ' + error.message);
            } finally {
                setDownloadLock(false);
                downloadAll.textContent = 'Download All ' + BOOKS.length + ' eBooks';
            }
        });

        masterDownload.addEventListener('click', async () => {
            if (downloadLock) return;
            setDownloadLock(true);
            const key = keySel.value;
            masterDownload.textContent = 'Building Full Data PDF...';
            batchStatus.textContent = 'Indexing all local theory and fretboard data. This large PDF may take several minutes.';
            try {
                const book = await buildCompleteDataEbook(key, (section, completed, total, title) => {
                    const percent = Math.floor(completed / total * 100);
                    masterDownload.textContent = 'Building Full Data PDF ' + percent + '%';
                    batchStatus.textContent = section + ': ' + completed.toLocaleString() + ' of ' + total.toLocaleString() + ' entries, ' + title;
                });
                batchStatus.textContent = 'Writing the PDF and final reference pages...';
                const blob = book.blob();
                const pages = book.doc.internal.getNumberOfPages();
                ST.download(blob, 'complete-music-theory-index-in-' + ST.safeName(key) + '.pdf');
                const summary = 'Complete index downloaded: ' + (pages - 1).toLocaleString() + ' pages.';
                batchStatus.textContent = summary;
                ST.toast(summary);
            } catch (error) {
                console.error(error);
                batchStatus.textContent = 'Could not generate the complete index: ' + error.message;
                ST.toast('Could not generate the complete index: ' + error.message);
            } finally {
                setDownloadLock(false);
                masterDownload.textContent = 'Create Full App Data eBook';
            }
        });
    });
    window.EBOOKS = BOOKS;
})();
