/**
 * MiniFretboard (v1.0) - a small, dependency-free SVG fretboard used by the Lessons,
 * Courses, Quizzes/Tests/Exams, Chord Progressions and Ideas & Notes pages.
 *
 *   MiniFretboard.render(el, { key, type: 'scale'|'chord'|'interval', id, notes, frets, tuning,
 *                             labels: 'intervals'|'notes', marks, onFret })
 * - type/id draws a pattern from MusicTheory; notes: ['C','E','G'] draws arbitrary notes
 * - marks: [{s, f}] explicit positions (sandbox); onFret(s, f, note) makes it clickable
 */
(function () {
    'use strict';
    const TUNINGS = {
        guitar: { name: 'Guitar (EADGBE)', strings: ['E', 'A', 'D', 'G', 'B', 'E'] },
        bass: { name: 'Bass (EADG)', strings: ['E', 'A', 'D', 'G'] },
        ukulele: { name: 'Ukulele (GCEA)', strings: ['G', 'C', 'E', 'A'] },
        dropd: { name: 'Guitar Drop D', strings: ['D', 'A', 'D', 'G', 'B', 'E'] }
    };
    let mtCache = null;
    const theory = () => mtCache || (mtCache = (typeof MusicTheory !== 'undefined' ? new MusicTheory() : null));
    const NS = 'http://www.w3.org/2000/svg';
    const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B', Fb: 'E', 'E#': 'F', 'B#': 'C' };
    const pc = n => SHARP.indexOf(FLAT[n] || n);

    function patternInfo(o) {
        const mt = theory();
        const key = o.key || 'C';
        let notes = o.notes || [], intervals = o.intervals || null;
        if (mt && o.type && o.id != null) {
            if (o.type === 'scale' && mt.scales[o.id]) { notes = mt.getScaleNotes(key, o.id); intervals = mt.scales[o.id].intervals; }
            else if (o.type === 'chord' && mt.chords[o.id]) { notes = mt.getChordNotes(key, o.id); intervals = mt.chords[o.id].intervals; }
            else if (o.type === 'interval') { notes = [key, mt.getNoteFromInterval(key, o.id)]; intervals = ['1', o.id]; }
        }
        const label = {};
        notes.forEach((n, i) => {
            if (!n) return;
            const p = pc(n);
            if (label[p]) return;
            let iv = intervals && intervals[i];
            if (!iv && mt) iv = mt.getInterval(key, n) || '';
            label[p] = { note: n, iv: iv === '1' ? 'R' : (iv || ''), raw: iv || '' };
        });
        return { root: pc(notes[0] || key), label };
    }

    function el(tag, attrs, parent) {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }

    function render(container, o) {
        o = o || {};
        const strings = (o.tuning && TUNINGS[o.tuning] ? TUNINGS[o.tuning].strings : o.strings) || TUNINGS.guitar.strings;
        const frets = o.frets || 12, n = strings.length;
        const W = 640, top = 14, sp = 18, left = 34, fw = (W - left - 10) / (frets + 1), H = top + (n - 1) * sp + 26;
        const info = patternInfo(o);
        const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'mfb', role: 'img', 'aria-label': o.title || 'Fretboard diagram' });
        el('rect', { x: left + fw, y: top - 4, width: fw * frets, height: (n - 1) * sp + 8, class: 'mfb-wood', rx: 2 }, svg);
        [3, 5, 7, 9].forEach(f => f <= frets && el('circle', { cx: left + fw * (f + 0.5), cy: top + (n - 1) * sp / 2, r: 3.5, class: 'mfb-inlay' }, svg));
        if (frets >= 12) [-1, 1].forEach(d => el('circle', { cx: left + fw * 12.5, cy: top + (n - 1) * sp / 2 + d * sp, r: 3.5, class: 'mfb-inlay' }, svg));
        for (let f = 1; f <= frets + 1; f++) el('line', { x1: left + fw * f, y1: top - 4, x2: left + fw * f, y2: top + (n - 1) * sp + 4, class: f === 1 ? 'mfb-nut' : 'mfb-fret' }, svg);
        // strings drawn high (top) to low (bottom), like a tab
        const rows = strings.map((s, i) => ({ open: s, idx: i })).reverse();
        rows.forEach((r, row) => {
            const y = top + row * sp;
            el('line', { x1: left + fw, y1: y, x2: left + fw * (frets + 1), y2: y, class: 'mfb-string', 'stroke-width': 0.8 + (row / Math.max(1, n - 1)) * 1.4 }, svg);
            const t = el('text', { x: left - 16, y: y + 4, class: 'mfb-sname' }, svg); t.textContent = r.open;
        });
        for (let f = 0; f <= frets; f++) if (o.interactive || [0, 3, 5, 7, 9, 12, 15].includes(f)) { const t = el('text', { x: left + fw * (f + 0.5), y: H - 4, class: 'mfb-fnum' }, svg); t.textContent = f; }
        const marks = o.marks ? new Set(o.marks.map(m => m.s + ':' + m.f)) : null;
        rows.forEach((r, row) => {
            const y = top + row * sp;
            for (let f = 0; f <= frets; f++) {
                const p = (pc(r.open) + f) % 12, x = left + fw * (f + 0.5);
                const lab = info.label[p];
                const on = marks ? marks.has(r.idx + ':' + f) : !!lab;
                if (o.onFret) {
                    const hit = el('rect', { x: x - fw / 2, y: y - sp / 2, width: fw, height: sp, class: 'mfb-hit' }, svg);
                    hit.addEventListener('click', () => o.onFret(r.idx, f, SHARP[p]));
                }
                if (!on) continue;
                const isRoot = marks ? false : p === info.root;
                const g = el('g', { class: 'mfb-dot' + (isRoot ? ' root' : '') }, svg);
                const dot = el('circle', { cx: x, cy: y, r: 7.6 }, g);
                const text = o.labels === 'notes' || marks || !lab ? (lab ? lab.note : SHARP[p]) : lab.iv;
                const t = el('text', { x, y: y + 3.3, 'font-size': text.length > 2 ? 7 : 9 }, g); t.textContent = text;
                // interactive: colour markers by interval, like the interactive fretboard
                const ivc = o.interactive && lab && typeof MUSIC_THEORY_DATA !== 'undefined' ? MUSIC_THEORY_DATA.intervals[lab.raw] : null;
                if (ivc) { dot.style.fill = ivc.color; t.style.fill = ivc.fontColor; }
                if (o.onFret) g.style.pointerEvents = 'none';
            }
        });
        container.innerHTML = '';
        container.appendChild(svg);
        return svg;
    }

    // ---------- tiny synth for the "Hear it" buttons ----------
    let ctx = null;
    function play(o, mode) {
        const mt = theory();
        if (!mt) return;
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        let notes = o.notes;
        if (o.type === 'scale' && mt.scales[o.id]) notes = mt.getScaleNotes(o.key, o.id).concat([o.key]);
        else if (o.type === 'chord' && mt.chords[o.id]) notes = mt.getChordNotes(o.key, o.id);
        else if (o.type === 'interval') notes = [o.key, mt.getNoteFromInterval(o.key, o.id)];
        notes = (notes || []).filter(Boolean);
        const together = mode ? mode === 'chord' : o.type === 'chord';
        let oct = 4, prev = -1;
        const t0 = ctx.currentTime + 0.03, step = together ? 0 : 0.32;
        notes.forEach((n, i) => {
            const p = pc(n); if (p <= prev) oct++; prev = p;
            const f = mt.getNoteFrequency(n, oct); if (!f) return;
            const osc = ctx.createOscillator(), g = ctx.createGain();
            osc.type = 'triangle'; osc.frequency.value = f;
            const s = t0 + i * step, d = together ? 1.6 : 0.5;
            g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(together ? 0.18 : 0.3, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + d);
            osc.connect(g); g.connect(ctx.destination); osc.start(s); osc.stop(s + d + 0.05);
        });
    }

    /** Diagram + toolbar (key, labels, hear, open in app). Returns { update(opts) }. */
    function widget(container, o) {
        o = Object.assign({ key: 'C', labels: 'intervals', tuning: 'guitar' }, o);
        container.classList.add('mfb-widget');
        container.innerHTML = '<div class="mfb-bar"></div><div class="mfb-host"></div>';
        const bar = container.querySelector('.mfb-bar'), host = container.querySelector('.mfb-host');
        const sel = (opts, val, fn) => { const s = document.createElement('select'); opts.forEach(([v, t]) => s.add(new Option(t, v))); s.value = val; s.addEventListener('change', () => fn(s.value)); bar.appendChild(s); return s; };
        const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
        if (o.keySelect !== false) sel(keys.map(k => [k, k]), o.key, v => { o.key = v; draw(); });
        sel(Object.keys(TUNINGS).map(k => [k, TUNINGS[k].name]), o.tuning, v => { o.tuning = v; draw(); });
        sel([['intervals', 'Intervals'], ['notes', 'Notes']], o.labels, v => { o.labels = v; draw(); });
        const hear = document.createElement('button'); hear.type = 'button'; hear.textContent = '▶ Hear'; hear.className = 'mfb-btn';
        hear.addEventListener('click', () => play(o)); bar.appendChild(hear);
        const open = document.createElement('a'); open.className = 'mfb-btn'; open.textContent = 'Open in Fretboard'; bar.appendChild(open);
        const cap = document.createElement('div'); cap.className = 'mfb-cap'; container.appendChild(cap);
        function draw() {
            render(host, o);
            const mt = theory();
            open.hidden = !o.type;
            open.href = 'fretboard.html?key=' + encodeURIComponent(o.key) + '&patternType=' + encodeURIComponent(o.type || '') + '&pattern=' + encodeURIComponent(o.id || '');
            let notes = [];
            if (mt && o.type === 'scale' && mt.scales[o.id]) notes = mt.getScaleNotes(o.key, o.id);
            else if (mt && o.type === 'chord' && mt.chords[o.id]) notes = mt.getChordNotes(o.key, o.id);
            else if (mt && o.type === 'interval' && mt.intervals[o.id]) notes = [o.key, mt.getNoteFromInterval(o.key, o.id)];
            else if (o.notes) notes = o.notes;
            cap.textContent = (o.caption ? o.caption + ': ' : '') + notes.filter(Boolean).join(' ');
        }
        draw();
        return { update(n) { Object.assign(o, n); draw(); }, opts: o };
    }

    window.MiniFretboard = { render, widget, play, TUNINGS };
})();
