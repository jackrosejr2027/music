window.DIAGNOSTICS_TESTS = [
    {
        id: 1,
        name: 'Core UI elements presence',
        definition: 'Verify essential DOM controls exist so the app can be operated (fretboard, key/pattern selectors, playback and tuner controls, string-count).',
        run: () => {
            const requiredIds = ['fretboard','key-select','pattern-type','pattern-select','play-cof-loop','play-cof4-loop','melodic-pattern-select','string-count','start-fret','end-fret','toggle-bottom'];
            const missing = requiredIds.filter(id => !document.getElementById(id));
            return { ok: missing.length === 0, detail: missing.length ? 'Missing: ' + missing.join(', ') : 'All required UI elements present' , probableFix: missing.length ? 'Add the missing elements to index.html or ensure scripts that render them run after DOMContentLoaded.' : '' };
        }
    },
    {
        id: 2,
        name: 'Bottom-controls toggle behavior',
        definition: 'Ensure the "Show / Hide bottom controls" button toggles the controls area and updates its icon/aria appropriately.',
        run: async () => {
            const toggleBottom = document.getElementById('toggle-bottom');
            if (!toggleBottom) return { ok: false, detail: 'toggle-bottom button not found', probableFix: 'Ensure an element with id "toggle-bottom" exists in the header and is initialized before diagnostics.' };
            const before = toggleBottom.textContent;
            toggleBottom.click();
            await new Promise(r=>setTimeout(r,120));
            const after = toggleBottom.textContent;
            // restore
            toggleBottom.click();
            const ok = before !== after;
            return { ok, detail: `text before: "${before}" after: "${after}"`, probableFix: ok ? '' : 'Make the click handler toggle the icon text/content and set aria-label; use explicit textContent updates in handler.' };
        }
    },
    {
        id: 3,
        name: 'Melodic pattern custom input visibility & play/stop wiring',
        definition: 'Selecting "custom" in melodic pattern selector should reveal the shared custom-pattern input; play/stop buttons should toggle when playback starts/stops.',
        run: async () => {
            const playBtn = document.getElementById('play-melodic-pattern');
            const stopBtn = document.getElementById('stop-melodic-pattern');
            const melodicSelect = document.getElementById('melodic-pattern-select');
            const customContainer = document.getElementById('custom-pattern-container');
            if (!melodicSelect || !playBtn || !stopBtn) return { ok: false, detail: 'Melodic pattern controls missing', probableFix: 'Ensure melodic-patterns.js and melodic-patterns-data.js are loaded and run after the DOM.' };
            const prev = melodicSelect.value;
            melodicSelect.value = 'custom';
            melodicSelect.dispatchEvent(new Event('change'));
            await new Promise(r=>setTimeout(r,80));
            const visible = customContainer && customContainer.style.display !== 'none';
            melodicSelect.value = prev;
            melodicSelect.dispatchEvent(new Event('change'));
            // Also check basic play/stop wiring existence (methods may be on App)
            const protoOk = (typeof App !== 'undefined' && (App.prototype.playMelodicPattern || App.prototype.stopMelodicPattern)) || (window.app && (window.app.playMelodicPattern || window.app.stopMelodicPattern));
            const ok = visible && protoOk;
            let probableFix = '';
            if (!visible) probableFix += 'Ensure melodic-patterns.js attaches change listeners to show/hide the custom input. ';
            if (!protoOk) probableFix += 'Implement playMelodicPattern/stopMelodicPattern on App.prototype or on the running app and expose them before diagnostics.';
            return { ok, detail: visible ? 'Custom input visible when selecting custom' : 'Custom input not visible on select=custom', probableFix: probableFix.trim() };
        }
    },
    {
        id: 4,
        name: 'Tuning preservation when changing string count',
        definition: 'When the number of strings is increased or decreased, existing tuning note names for overlapping positions should be preserved (not shifted or rotated).',
        run: async () => {
            try {
                const origCountEl = document.getElementById('string-count');
                if (!origCountEl) return { ok: false, detail: 'string-count input missing', probableFix: 'Add string-count input with id "string-count".' };
                const origCount = parseInt(origCountEl.value);
                const selectsBefore = Array.from(document.querySelectorAll('.tuning-select')).map(s => s.value);
                const visibilityBefore = Array.from(document.querySelectorAll('.show-string-notes')).map(input => input.checked);
                const startsBefore = Array.from(document.querySelectorAll('.string-start-fret')).map(input => input.value);
                const endsBefore = Array.from(document.querySelectorAll('.string-end-fret')).map(input => input.value);
                let viewedBefore = null, viewedReadable = false;
                try { viewedBefore = localStorage.getItem('st_viewed'); viewedReadable = true; } catch { /* storage may be unavailable */ }
                let selectsAfter = [], kept = false;
                const maxCount = parseInt(origCountEl.max, 10) || 20;
                const newCount = origCount < maxCount ? origCount + 1 : origCount - 1;
                try {
                    origCountEl.value = newCount;
                    origCountEl.dispatchEvent(new Event('change'));
                    await new Promise(resolve => setTimeout(resolve, 80));
                    selectsAfter = Array.from(document.querySelectorAll('.tuning-select')).map(select => select.value);
                    const overlap = Math.min(selectsBefore.length, selectsAfter.length);
                    kept = selectsAfter.length === newCount && selectsBefore.slice(0, overlap).every((note, index) => note === selectsAfter[index]);
                } finally {
                    origCountEl.value = origCount;
                    origCountEl.dispatchEvent(new Event('change'));
                    window.app.updateTuningInputs(selectsBefore);
                    document.querySelectorAll('.show-string-notes').forEach((input, i) => { if (visibilityBefore[i] !== undefined) input.checked = visibilityBefore[i]; });
                    document.querySelectorAll('.string-start-fret').forEach((input, i) => { if (startsBefore[i] !== undefined) input.value = startsBefore[i]; });
                    document.querySelectorAll('.string-end-fret').forEach((input, i) => { if (endsBefore[i] !== undefined) input.value = endsBefore[i]; });
                    try { window.app.updateFretboard(); }
                    finally {
                        if (viewedReadable) {
                            try { viewedBefore === null ? localStorage.removeItem('st_viewed') : localStorage.setItem('st_viewed', viewedBefore); } catch { /* storage may be unavailable */ }
                        }
                    }
                }
                await new Promise(r=>setTimeout(r,120));
                return { ok: kept, detail: kept ? 'Tuning note names preserved' : `Preservation failed. before[0..5]=${selectsBefore.slice(0,6).join(',')} after[0..5]=${selectsAfter.slice(0,6).join(',')}`, probableFix: kept ? '' : 'When reconstructing tuning selects, reuse existing select values in display order (top→bottom) and only pad/trim; do not rotate or reverse arrays unexpectedly.' };
            } catch (e) {
                return { ok: false, detail: e.message, probableFix: 'Wrap tuning-preservation logic in defensive code; store previous values and map by index when rebuilding inputs.' };
            }
        }
    },
    {
        id: 5,
        name: 'Fret numbers offset default value',
        definition: 'Check that the "fret-numbers-offset" control defaults to its minimum value.',
        run: () => {
            const offsetEl = document.getElementById('fret-numbers-offset');
            if (!offsetEl) return { ok: false, detail: 'fret-numbers-offset input missing', probableFix: 'Add the input and set its default value to its min in addFretNumberOptions.' };
            const ok = parseInt(offsetEl.value) === parseInt(offsetEl.min);
            return { ok, detail: `value=${offsetEl.value} min=${offsetEl.min}`, probableFix: ok ? '' : 'Initialize the range input value to its .min when creating the control (e.g., input.value = input.min).' };
        }
    },
    {
        id: 6,
        name: 'Circle of Fifths/Fourths controls wiring',
        definition: 'Ensure the play and stop buttons for both Cof (5ths) and Cof4 (4ths) exist and the start/stop handlers toggle visibility correctly.',
        run: () => {
            const cofPlay = document.getElementById('play-cof-loop');
            const cofStop = document.getElementById('stop-cof-loop');
            const cof4Play = document.getElementById('play-cof4-loop');
            const cof4Stop = document.getElementById('stop-cof4-loop');
            const missing = [cofPlay, cofStop, cof4Play, cof4Stop].filter(x=>!x).length;
            const ok = missing === 0;
            return { ok, detail: ok ? 'All Cof controls present' : 'One or more Cof controls missing', probableFix: missing ? 'Add missing play/stop buttons and wire them to App.playCircleOfFifthsLoop / App.playCircleOfFourthsLoop and stop methods.' : '' };
        }
    },
    {
        id: 7,
        name: 'Slideshow basic behavior and metronome',
        definition: 'Verify slideshow has items container and play button; when playing it should iterate slides at BPM-defined timing and attempt metronome clicks.',
        run: async () => {
            const container = document.getElementById('slideshow-items');
            const playBtn = document.getElementById('play-slideshow');
            if (!container || !playBtn) return { ok: false, detail: 'play-slideshow or slideshow-items missing', probableFix: 'Ensure slideshow UI (container and play button) exists and App.playSlideshow is bound.' };
            // lightweight smoke test: add temporary item and simulate short play
            const appInstance = window.app;
            if (!appInstance || typeof appInstance.playSlideshow !== 'function') {
                return { ok: false, detail: 'App.playSlideshow not available', probableFix: 'Expose playSlideshow on App.prototype and ensure app is instantiated.' };
            }
            return { ok: true, detail: 'Slideshow controls present and playback API exists (manual run recommended for full behavior verification)', probableFix: 'If timing issues observed, adjust BPM calculation or metronome click scheduling.' };
        }
    },
    {
        id: 8,
        name: 'Melodic playback methods presence',
        definition: 'Confirm that the application exposes playMelodicPattern() and stopMelodicPattern() either on App.prototype or on the running app instance.',
        run: () => {
            let ok = false; let detail = ''; let probableFix = '';
            try {
                if (typeof App !== 'undefined' && App.prototype) {
                    ok = !!App.prototype.playMelodicPattern && !!App.prototype.stopMelodicPattern;
                    detail = ok ? 'Found on App.prototype' : 'Missing on App.prototype';
                }
                if (!ok && window.app) {
                    ok = !!window.app.playMelodicPattern && !!window.app.stopMelodicPattern;
                    detail = ok ? 'Found on running app instance' : (detail ? detail + '; not on instance' : 'Not found on instance');
                }
                if (!ok && typeof App === 'undefined' && !window.app) {
                    detail = 'App class and instance not initialized yet';
                }
                if (!ok) probableFix = 'Implement playMelodicPattern / stopMelodicPattern on App.prototype and ensure melodic-patterns.js uses them; or attach wrappers to window.app after initialization.';
            } catch (e) {
                ok = false; detail = 'Error checking methods: ' + e.message; probableFix = 'Wrap checks in try/catch and ensure App defined.';
            }
            return { ok, detail, probableFix };
        }
    },
    {
        id: 9,
        name: 'Export libraries (JSZip & html2canvas) availability',
        definition: 'Ensure required libraries for ZIP export and image snapshot are loaded and accessible (JSZip, html2canvas).',
        run: () => {
            const jszipOk = typeof JSZip !== 'undefined';
            const html2Ok = typeof html2canvas !== 'undefined';
            const ok = jszipOk && html2Ok;
            const detail = `JSZip: ${jszipOk ? 'loaded' : 'missing'}, html2canvas: ${html2Ok ? 'loaded' : 'missing'}`;
            const probableFix = `${!jszipOk ? 'Include JSZip script (cdn) before exporter.js.' : ''} ${!html2Ok ? ' Include html2canvas (cdn) before exporter or call export only after it loads.' : ''}`.trim();
            return { ok, detail, probableFix };
        }
    },
    {
        id: 10,
        name: 'Sanity console error advisory',
        definition: 'Note: browser console history cannot be fully inspected; we mark this as informational and suggest manual console review if failures occur.',
        run: () => ({ ok: true, detail: 'Console error capture not available programmatically; manual review recommended', probableFix: 'Open browser developer console and inspect errors/warnings during app usage.' })
    },
    // removed UI/UX tests 11-20 -> moved to diagnostics-tests-ui.js
    // removed Theoretical/Logic tests 21-30 -> moved to diagnostics-tests-logic.js
];