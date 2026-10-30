window.DIAGNOSTICS_TESTS_LOGIC = [
    {
        id: 21,
        name: 'Responsive layout behavior',
        definition: 'Ensure sidebar collapses or becomes static at narrow widths and top header adapts correctly.',
        run: () => {
            const sidebar = document.querySelector('.sidebar');
            const nav = document.querySelector('.header-nav');
            const menuToggle = document.querySelector('.st-nav-toggle');
            if (!sidebar || !nav || !menuToggle) return { ok: false, detail: 'Responsive header or sidebar element missing', probableFix: 'Keep the responsive navigation toggle and sidebar in the Fretboard document.' };
            const compact = matchMedia('(max-width: 768px)').matches || document.body.classList.contains('mobile-view');
            const navVisible = getComputedStyle(nav).display !== 'none';
            const toggleVisible = getComputedStyle(menuToggle).display !== 'none';
            const ok = compact ? toggleVisible : (navVisible || toggleVisible);
            return { ok, detail: 'compact=' + compact + ', navVisible=' + navVisible + ', menuToggleVisible=' + toggleVisible, probableFix: ok ? '' : 'Show either desktop navigation or its compact menu toggle at the current viewport.' };
        }
    },
    {
        id: 22,
        name: 'Synth initialization and play methods',
        definition: 'Check that Tone.js synth init exists and App.initSynth returns/creates this.synth.',
        run: async () => {
            if (typeof Tone === 'undefined') return { ok: false, detail: 'Tone.js missing', probableFix: 'Include Tone.js library before playback scripts.' };
            try {
                if (!window.app) return { ok: false, detail: 'App not instantiated', probableFix: 'Instantiate the App to run playback checks.' };
                const initFn = window.app.initSynth || (App && App.prototype.initSynth);
                if (!initFn) return { ok: false, detail: 'initSynth missing', probableFix: 'Provide App.prototype.initSynth that initializes Tone.synth.' };
                await window.app.initSynth?.();
                const ok = !!window.app.synth;
                return { ok, detail: ok ? 'Synth initialized' : 'Synth not set on app after init', probableFix: 'Ensure initSynth sets this.synth to a Tone instrument and handles Tone.start() promise.' };
            } catch (e) {
                return { ok: false, detail: e.message, probableFix: 'Wrap synth init with try/catch and handle Tone.start promise.' };
            }
        }
    },
    {
        id: 23,
        name: 'Fretboard draw/dimensions sanity',
        definition: 'Verify Fretboard.draw exists and that dimensions are set to sensible positive numbers after draw.',
        run: () => {
            if (!window.app || !window.app.fretboard) return { ok: false, detail: 'Fretboard instance missing', probableFix: 'Ensure App creates Fretboard before diagnostics.' };
            const fb = window.app.fretboard;
            if (typeof fb.draw !== 'function') return { ok: false, detail: 'draw method missing', probableFix: 'Implement Fretboard.prototype.draw to render SVG.' };
            try {
                fb.draw();
                const dims = fb.dimensions;
                const ok = dims.width > 0 && dims.height > 0 && dims.stringSpacing > 0 && dims.fretSpacing > 0;
                return { ok, detail: `width=${dims.width} height=${dims.height} spacing=${dims.stringSpacing}`, probableFix: ok ? '' : 'Ensure dimensions are computed and clamped to positive values.' };
            } catch (e) {
                return { ok: false, detail: e.message, probableFix: 'Wrap draw logic in try/catch to surface rendering errors.' };
            }
        }
    },
    {
        id: 24,
        name: 'getDefaultTuning edge cases',
        definition: 'Ensure getDefaultTuning handles 1..20 string counts without throwing and returns array of correct length.',
        run: () => {
            if (typeof MusicTheory === 'undefined') return { ok: false, detail: 'MusicTheory class missing', probableFix: 'Include music-theory.js before diagnostics.' };
            const mt = new MusicTheory();
            const failures = [];
            for (let sc = 1; sc <= 20; sc++) {
                try {
                    const t = mt.getDefaultTuning(sc);
                    if (!Array.isArray(t) || t.length !== sc || t.some(note => !mt.notes.includes(note))) failures.push(sc);
                } catch (e) {
                    failures.push(sc);
                }
            }
            const ok = failures.length === 0;
            return { ok, detail: ok ? 'All counts handled' : `Bad for counts: ${failures.join(',')}`, probableFix: 'Adjust getDefaultTuning to always return array of requested length, padding/trimming safely.' };
        }
    },
    {
        id: 25,
        name: 'pattern-select population for interval type',
        definition: 'When pattern-type is set to "interval", pattern-select should populate with interval ids deterministically sorted.',
        run: () => {
            const pType = document.getElementById('pattern-type');
            const pSelect = document.getElementById('pattern-select');
            if (!pType || !pSelect) return { ok: false, detail: 'pattern-type or pattern-select missing', probableFix: 'Ensure pattern select elements exist.' };
            if (!window.app || !window.app.musicTheory?.intervals) return { ok: false, detail: 'Interval data is unavailable.', probableFix: 'Load the application theory data before checking interval options.' };
            const previousType = pType.value;
            const previousPattern = pSelect.value;
            let opts = [], repeated = [];
            try {
                pType.value = 'interval';
                window.app.updatePatternSelect();
                opts = Array.from(pSelect.options, option => option.value);
                window.app.updatePatternSelect();
                repeated = Array.from(pSelect.options, option => option.value);
            } finally {
                pType.value = previousType;
                window.app.updatePatternSelect();
                if (Array.from(pSelect.options).some(option => option.value === previousPattern)) pSelect.value = previousPattern;
            }
            const theory = window.app.musicTheory;
            const intervals = theory.intervals;
            const semitones = (id, data) => Number.isFinite(data?.semitones) ? data.semitones : theory.getIntervalSemitones(id);
            const expected = Object.entries(intervals)
                .filter(([id, data]) => Number.isFinite(semitones(id, data)))
                .sort(([idA, a], [idB, b]) => semitones(idA, a) - semitones(idB, b) || String(a?.name || idA).localeCompare(String(b?.name || idB)))
                .map(([id]) => id);
            const unique = new Set(opts).size === opts.length;
            const deterministic = opts.length === repeated.length && opts.every((id, index) => id === repeated[index]);
            const hasChromatic = opts.length === expected.length && unique && deterministic && expected.every((id, index) => opts[index] === id);
            return { ok: hasChromatic, detail: opts.length + ' valid, ordered interval options; repeated generation is stable.', probableFix: 'Populate pattern-select with interval entries from music theory data in deterministic order.' };
        }
    },
    {
        id: 26,
        name: 'Melodic extrapolatePattern validation',
        definition: 'extrapolatePattern should accept patterns and return an array at least as long as requested maxNotes and contain numeric indices.',
        run: () => {
            if (!window.app || !window.app.extrapolatePattern) return { ok: false, detail: 'extrapolatePattern missing', probableFix: 'Implement App.prototype.extrapolatePattern to build playback index arrays.' };
            const out = window.app.extrapolatePattern([1,2,3], 7, 20);
            const ok = Array.isArray(out) && out.length >= 8 && out.every(n => Number.isFinite(n));
            return { ok, detail: ok ? `len=${out.length}` : `invalid output: ${JSON.stringify(out).slice(0,200)}`, probableFix: 'Ensure extrapolatePattern returns zero-based scale indices and fills to requested length.' };
        }
    },
    {
        id: 27,
        name: 'Exporter circle-of-* buttons wired',
        definition: 'Buttons to export circle-of-fifths/4ths for scales/chords/intervals should exist and map to Exporter methods.',
        run: () => {
            const ids = ['save-intervals-circle-zip','save-scales-circle-zip','save-chords-circle-zip'];
            const missing = ids.filter(id => !document.getElementById(id));
            const methodsOk = typeof Exporter !== 'undefined' && !!Exporter.exportAllIntervalsCircleOfFifthsToZip && !!Exporter.exportAllChordsCircleOfFifthsToZip && !!Exporter.exportAllScalesCircleOfFifthsToZip;
            return { ok: missing.length===0 && methodsOk, detail: `missing:${missing.join(',')}; methods:${!!Exporter}`, probableFix: (missing.length ? 'Add missing circle export buttons.' : '') + (methodsOk ? '' : ' Ensure Exporter implements circle-of-Fifths export methods.') };
        }
    },
    {
        id: 28,
        name: 'Pattern extrapolation vs scale length',
        definition: 'Ensure melodic extrapolation respects the provided scale length parameter and cycles properly.',
        run: () => {
            if (!window.app || !window.app.extrapolatePattern) return { ok: false, detail: 'extrapolatePattern missing', probableFix: 'Provide extrapolatePattern on App.prototype.' };
            const res = window.app.extrapolatePattern([1,2], 5, 10);
            const ok = Array.isArray(res) && res.length === 10 && res.every(n => Number.isInteger(n));
            return { ok, detail: ok ? 'OK' : `res:${JSON.stringify(res).slice(0,200)}`, probableFix: 'Make extrapolatePattern repeat base pattern and advance degrees deterministically.' };
        }
    },
    {
        id: 29,
        name: 'Theme merge includes extra themes',
        definition: 'Ensure themes-data-extra.js merged into THEMES_DATA; a known extra theme (ocean) should exist after loading.',
        run: () => {
            const ok = typeof THEMES_DATA !== 'undefined' && !!THEMES_DATA.ocean;
            return { ok, detail: ok ? 'ocean theme present' : 'ocean missing', probableFix: 'Load themes-data-extra.js after themes-data.js or merge programmatically into THEMES_DATA.' };
        }
    },
    {
        id: 30,
        name: 'Accessibility attributes on SVG',
        definition: 'Fretboard SVG should include ARIA attributes or role/aria-label for screen readers.',
        run: () => {
            const svg = document.querySelector('#fretboard svg, #fretboard .fretboard-svg');
            if (!svg) return { ok: false, detail: 'Fretboard SVG not found', probableFix: 'Ensure Fretboard.draw creates an accessible SVG element.' };
            const hasRole = svg.getAttribute('role') || svg.getAttribute('aria-label');
            return { ok: !!hasRole, detail: hasRole ? `role/label present: ${hasRole}` : 'aria-label/role missing', probableFix: 'Add role="img" and aria-label describing the diagram to the SVG element.' };
        }
    }
];

// Append to main diagnostics tests array
if (window.DIAGNOSTICS_TESTS) {
    window.DIAGNOSTICS_TESTS.push(...window.DIAGNOSTICS_TESTS_LOGIC);
}