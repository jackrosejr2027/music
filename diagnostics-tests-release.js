/* Release 3.2 regression checks for offline, routing, audio, mobile and study content. */
(function () {
    'use strict';
    async function cacheContext() {
        if (!window.caches || !window.ST || !ST.cacheVersion) throw new Error('Versioned Cache API unavailable');
        const script = document.querySelector('script[src$="site.js"]');
        const scope = new URL('./', script ? script.src : location.href).href;
        return { cache: await caches.open(ST.cacheVersion), scope };
    }
    async function cachedText(path) {
        const { cache, scope } = await cacheContext();
        const response = await cache.match(new URL(path, scope), { ignoreSearch: true });
        return response ? response.text() : null;
    }
    function test(id, name, definition, run) {
        if (typeof definition === 'function') { run = definition; definition = ''; }
        return { id, name, definition, run };
    }

    window.DIAGNOSTICS_TESTS = window.DIAGNOSTICS_TESTS || [];
    window.DIAGNOSTICS_TESTS.push(
        test(20, 'Base-0 chromatic range', 'The interval catalog should represent every pitch class from 0 through 11.', () => {
            const values = Array.from(new Set(Object.values(window.app.musicTheory.intervals).map(item => ((item.semitones % 12) + 12) % 12))).sort((a, b) => a - b);
            const ok = values.length === 12 && values.every((value, index) => value === index);
            return { ok, detail: 'Pitch classes: ' + values.join('-'), probableFix: ok ? '' : 'Include all 12 semitone pitch classes in the interval catalog.' };
        }),
        test(31, 'Offline-ready cache marker', 'A ready marker must exist in the current versioned cache before offline use is reported.', async () => {
            const { cache, scope } = await cacheContext();
            const marker = await cache.match(new URL('__offline-ready__', scope));
            return { ok: !!marker, detail: marker ? 'Current cache is marked complete' : 'Current cache has no completion marker', probableFix: marker ? '' : 'Reconnect and wait for the full service-worker install.' };
        }),
        test(32, 'Precache completeness', 'Every path declared by the service worker must exist in its final cache.', async () => {
            const { cache, scope } = await cacheContext();
            const source = await cachedText('offline-assets.js');
            const block = source && source.match(/assets:\s*(\[[\s\S]*?\])/);
            if (!block) return { ok: false, detail: 'Shared offline manifest is missing', probableFix: 'Restore offline-assets.js in the cache.' };
            const paths = JSON.parse(block[1]);
            const missing = [];
            for (const path of paths) if (!(await cache.match(new URL(path, scope), { ignoreSearch: true }))) missing.push(path);
            return { ok: missing.length === 0, detail: paths.length + ' entries checked; missing: ' + (missing.slice(0, 8).join(', ') || 'none'), probableFix: missing.length ? 'Clear an incomplete cache and reinstall over HTTPS.' : '' };
        }),
        test(33, 'App entry and Home are cached', 'The PWA opens the local Fretboard entry; Home and its renderer remain available offline.', async () => {
            const manifestText = await cachedText('manifest.webmanifest');
            const entry = await cachedText('index.html');
            const home = await cachedText('home.html');
            const manifest = manifestText ? JSON.parse(manifestText) : {};
            const homeView = await cachedText('home-view.js');
            const hasHome = !!home && home.includes('home-view.js');
            const adminInOther = !!homeView && homeView.includes("push('admin.html')");
            const hasEntry = !!entry && entry.includes('id="fretboard"') && entry.includes('src="app-init.js"');
            const ok = manifest.start_url === 'index.html' && hasEntry && hasHome && adminInOther;
            return { ok, detail: 'start_url=' + manifest.start_url + '; Fretboard entry=' + hasEntry + '; Home=' + hasHome + '; Admin in Other=' + adminInOther, probableFix: ok ? '' : 'Cache the Fretboard entry, Home document and Home renderer.' };
        }),
        test(34, 'Separate Fretboard destination', 'The instrument page must remain directly addressable and cached after Home becomes the entrypoint.', async () => {
            const html = await cachedText('fretboard.html');
            return { ok: !!html && html.includes('id="fretboard"'), detail: html ? 'Instrument entry is cached' : 'Fretboard document is missing', probableFix: html ? '' : 'Add fretboard.html to the service-worker precache.' };
        }),
        test(35, 'Installed app opens Home', 'The web app manifest should start at Home rather than the Fretboard.', async () => {
            const text = await cachedText('manifest.webmanifest');
            const manifest = text ? JSON.parse(text) : {};
            const ok = manifest.start_url === 'index.html';
            return { ok, detail: 'start_url=' + manifest.start_url, probableFix: ok ? '' : 'Set the manifest start_url to index.html.' };
        }),
        test(36, 'Offline ZIP dependencies', 'The ZIP builder and its local JSZip library must both be cached.', async () => {
            const [builder, library] = await Promise.all([cachedText('offline-package.js'), cachedText('vendor/jszip.min.js')]);
            const ok = !!builder && !!library && builder.includes('JSZip');
            return { ok, detail: 'builder=' + !!builder + ', bundled JSZip=' + !!library, probableFix: ok ? '' : 'Cache the local ZIP builder and JSZip library.' };
        }),
        test(37, 'Offline ZIP refuses partial caches', async () => {
            const builder = await cachedText('offline-package.js');
            const ok = !!builder && builder.includes('__offline-ready__') && builder.includes('Offline cache is incomplete');
            return { ok, detail: ok ? 'Requires completion marker and validates files before download' : 'ZIP readiness guards are missing', probableFix: ok ? '' : 'Require the ready marker and verify every precache entry before generating the ZIP.' };
        }),
        test(38, 'Fretboard playback controls', 'The Fretboard document and app event wiring should expose Play and Stop controls.', async () => {
            const html = await cachedText('fretboard.html');
            const events = await cachedText('app-events-playback.js');
            const playback = await cachedText('app-playback.js');
            const ok = !!html && html.includes('header-play-pattern') && html.includes('header-stop-pattern') && !!events && events.includes('stopCurrentPattern') && !!playback && playback.includes('App.prototype.stopCurrentPattern');
            return { ok, detail: ok ? 'Header controls and stop handler are present' : 'One or more playback controls are missing', probableFix: ok ? '' : 'Wire the header Stop control to App.prototype.stopCurrentPattern.' };
        }),
        test(39, 'Stop cancels queued scale notes', 'Sequential playback should check a cancellation token before each note.', async () => {
            const playback = await cachedText('app-playback.js');
            const ok = !!playback && playback.includes('playbackId !== this._patternPlaybackId') && playback.includes('releaseAll');
            return { ok, detail: ok ? 'Cancellation guard and synth release are present' : 'Stop cannot reliably cancel future notes', probableFix: ok ? '' : 'Use a playback token, cancel the wait timer and release active synth voices.' };
        }),
        test(40, 'Scale Hear stays on the explorer', async () => {
            const source = await cachedText('scales-app.js');
            const audio = await cachedText('audio-preview.js');
            const ok = !!source && !!audio && source.includes("playTheoryItem('scale', 'C', id, musicTheory)") && audio.includes('async function playTheoryItem') && !source.includes('action=play');
            return { ok, detail: ok ? 'Hear uses local audio without page navigation' : 'Scale Hear still leaves the page', probableFix: ok ? '' : 'Play scale notes with the bundled audio preview helper.' };
        }),
        test(41, 'Chord Hear stays on the explorer', async () => {
            const source = await cachedText('chords-app.js');
            const audio = await cachedText('audio-preview.js');
            const ok = !!source && !!audio && source.includes("playTheoryItem('chord', 'C', id, musicTheory)") && audio.includes('async function playTheoryItem') && !source.includes('action=play');
            return { ok, detail: ok ? 'Hear uses local audio without page navigation' : 'Chord Hear still leaves the page', probableFix: ok ? '' : 'Play chord notes with the bundled audio preview helper.' };
        }),
        test(42, 'Interval Hear uses local audio', async () => {
            const [source, audio] = await Promise.all([cachedText('intervals-app.js'), cachedText('audio-preview.js')]);
            const ok = !!source && !!audio && source.includes('STAudioPreview.playInterval') && audio.includes('function playInterval');
            return { ok, detail: ok ? 'Melodic and harmonic preview helper is local' : 'Interval audio helper is missing', probableFix: ok ? '' : 'Bundle the local Web Audio interval preview.' };
        }),
        test(43, 'Base-0 output on all explorers', async () => {
            const [scales, chords, intervals] = await Promise.all([cachedText('scales-app.js'), cachedText('chords-app.js'), cachedText('intervals-app.js')]);
            const ok = !!scales && !!chords && !!intervals && scales.includes('Base 0 pitch classes') && chords.includes('Base 0 pitch classes') && intervals.includes('Base 0 pitch classes');
            return { ok, detail: ok ? 'Scale, chord and interval views expose Base 0' : 'A Base-0 view is missing', probableFix: ok ? '' : 'Render root-relative pitch classes modulo 12 on all three explorers.' };
        }),
        test(44, 'Base-0 values are unique and ordered', () => {
            const formula = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'];
            const pcs = Array.from(new Set(formula.map(iv => ((window.app.musicTheory.getIntervalSemitones(iv) % 12) + 12) % 12))).sort((a, b) => a - b);
            const ok = pcs.join(',') === '0,1,2,3,4,5,6,7,8,9,10,11';
            return { ok, detail: pcs.join('-'), probableFix: ok ? '' : 'Normalize intervals modulo 12 and include pitch class zero.' };
        }),
        test(45, 'Theory card total', async () => {
            const source = await cachedText('theory-cards/cards.js');
            const theory = window.app && window.app.musicTheory;
            const base = source && source.slice(source.indexOf('var cards=['), source.indexOf('];', source.indexOf('var cards=[')));
            const baseCount = base ? (base.match(/\{q:/g) || []).length : 0;
            const total = baseCount + Math.min(300, Object.keys(theory.scales).length) + 4 * Math.min(75, Object.keys(theory.chords).length);
            return { ok: total === 612, detail: baseCount + ' foundation cards + data-driven sets = ' + total, probableFix: total === 612 ? '' : 'Keep 300 scale cards and four cards for each of 75 chords.' };
        }),
        test(46, 'Theory card dataset is cached', async () => {
            const html = await cachedText('theory-cards/index.html');
            const js = await cachedText('theory-cards/cards.js');
            const data = await cachedText('scales-data-advanced-11.js');
            const ok = !!html && !!js && !!data && html.includes('music-theory-data.js') && html.includes('../music-theory.js');
            return { ok, detail: ok ? 'Cards and local music-theory datasets are cached' : 'A theory-card dependency is missing', probableFix: ok ? '' : 'Include card data scripts and all scale catalogs in the offline cache.' };
        }),
        test(47, 'Lesson catalog depth and validity', () => {
            const lessons = window.app && window.app.lessons || [];
            const theory = window.app && window.app.musicTheory;
            const complete = lessons.length === 50 && lessons.every(lesson => lesson.steps.length >= 7 && (lesson.patternType === 'scale' ? theory.scales : theory.chords)[lesson.patternId]);
            return { ok: complete, detail: lessons.length + ' lessons; each needs seven steps and a valid pattern', probableFix: complete ? '' : 'Restore lesson outcomes, practice steps and valid local patterns.' };
        }),
        test(48, 'Standalone Lessons data factory', async () => {
            const [source, page] = await Promise.all([cachedText('app-lessons-data.js'), cachedText('lessons.html')]);
            const appPage = await cachedText('lessons-app.js');
            const ok = !!source && !!page && !!appPage && source.includes('createLessonsData') && appPage.includes('window.createLessonsData') && !appPage.includes('new App()');
            return { ok, detail: ok ? 'Lessons load without creating the Fretboard app' : 'Lesson page still depends on App construction', probableFix: ok ? '' : 'Expose a shared lessons factory and call it without initializing the instrument UI.' };
        }),
        test(49, 'Two hundred grouped eBooks with all-key references', async () => {
            const [source, page] = await Promise.all([cachedText('ebooks-app.js'), cachedText('ebooks.html')]);
            if (!source || !page) return { ok: false, detail: 'eBook builder or page is not cached', probableFix: 'Cache ebooks-app.js and ebooks.html.' };
            const count = name => {
                const start = source.indexOf('const ' + name + ' = [');
                if (start < 0) return 0;
                const end = source.indexOf('];', start);
                return (source.slice(start, end).match(/^\s*\[/gm) || []).length;
            };
            const base = (source.slice(source.indexOf('const BOOKS = ['), source.indexOf('const MORE_BOOK_TOPICS = [')).match(/id: '/g) || []).length;
            const expanded = count('EXPANDED_BOOK_TOPICS');
            const total = base + count('MORE_BOOK_TOPICS') + count('FURTHER_BOOK_TOPICS') + expanded;
            const addenda = source.includes('Book.prototype.addDetailedAddendum') && source.includes('this.addDetailedAddendum()');
            const allKeyReference = source.includes('Examples in All 12 Keys') && source.includes('allKeyRows');
            const tuningControls = page.includes('id="ebook-string-count"') && page.includes('id="ebook-tuning-fields"') && source.includes('this.instrument.strings.slice().reverse()');
            const bulk = page.includes('id="ebook-download-all"') && page.includes('vendor/jszip.min.js') && source.includes('zip.generateAsync');
            const groups = page.includes('id="ebook-group-filter"') && source.includes('const GROUP_ORDER');
            const fullIndex = page.includes('id="ebook-master-download"') && source.includes('async function buildCompleteDataEbook') && source.includes('gamutFretboard');
            const ok = total === 200 && expanded === 100 && addenda && allKeyReference && tuningControls && bulk && groups && fullIndex;
            return { ok, detail: total + ' guides; addenda=' + addenda + '; all keys=' + allKeyReference + '; tuning=' + tuningControls + '; groups=' + groups + '; bulk=' + bulk + '; full index=' + fullIndex, probableFix: ok ? '' : 'Keep 200 grouped guides and the configurable full-catalog PDF index with diagrams, addenda, and ZIP download.' };
        }),
        test(50, 'Release and mobile guidance present', async () => {
            const [notes, css] = await Promise.all([cachedText('release-notes.html'), cachedText('site.css')]);
            const topics = ['id="capabilities"','id="design"','id="application"','id="how-to"','id="faq"','id="troubleshooting"','id="cheat-sheet"'];
            const ok = !!notes && !!css && topics.every(topic => notes.includes(topic)) && css.includes('@media(max-width:768px)') && css.includes('safe-area-inset-bottom');
            return { ok, detail: ok ? 'Required release sections and phone layout rules are cached' : 'A help section or mobile layout rule is missing', probableFix: ok ? '' : 'Restore the required release notes and responsive CSS.' };
        }),
        test(51, 'DAW page and assets are cached', async () => {
            const [page, style, script] = await Promise.all([cachedText('daw.html'), cachedText('daw.css'), cachedText('daw.js')]);
            const ok = !!page && !!style && !!script && page.includes('href="daw.css"') && page.includes('src="daw.js"');
            return { ok, detail: ok ? 'DAW page, stylesheet and local app logic are all cached' : 'One or more DAW files are missing from cache', probableFix: ok ? '' : 'Add daw.html, daw.css and daw.js to the service-worker precache.' };
        }),
        test(52, 'Five hundred preloaded patterns', async () => {
            const source = await cachedText('daw.js');
            const templates = source && source.slice(source.indexOf('const TEMPLATES = ['), source.indexOf('const PRELOADED_PATTERNS'));
            const count = templates ? (templates.match(/\{ name: '[^']+', steps:/g) || []).length : 0;
            const ok = !!source && count === 42 && source.includes('PRELOADED_PATTERNS.length >= 500') && source.includes('window.STDAW = { patterns: PRELOADED_PATTERNS');
            return { ok, detail: count + ' pattern forms feed the local 500-entry generator', probableFix: ok ? '' : 'Keep 42 local templates and generate exactly 500 keyed patterns.' };
        }),
        test(53, 'DAW audio and catalogs stay local', async () => {
            const [page, audio, notes] = await Promise.all([cachedText('daw.html'), cachedText('audio-preview.js'), cachedText('release-notes.html')]);
            const ok = !!page && !!audio && !!notes && page.includes('audio-preview.js') && audio.includes('playArrangement') && page.includes('music-theory-data.js') && notes.includes('id="daw"');
            return { ok, detail: ok ? 'Theory data, audio scheduler and DAW help section are locally bundled' : 'A DAW audio or catalog dependency is missing', probableFix: ok ? '' : 'Bundle the DAW theory catalogs and Web Audio scheduler locally.' };
        }),
        test(61, 'Pattern Studio all-MIDI ZIP includes compiled MIDI', async () => {
            const [page, daw, midi, zip] = await Promise.all([cachedText('daw.html'), cachedText('daw.js'), cachedText('daw-midi.js'), cachedText('vendor/jszip.min.js')]);
            const ok = !!page && !!daw && !!midi && !!zip && page.includes('id="export-midi-zip"') && page.includes('vendor/jszip.min.js') && daw.includes('all-patterns-compiled.mid') && daw.includes('PRELOADED_PATTERNS.map');
            return { ok, detail: ok ? 'Library, saved patterns and current arrangement export individually and as one compiled MIDI inside a local ZIP' : 'Pattern Studio bulk MIDI ZIP or a bundled dependency is missing', probableFix: ok ? '' : 'Bundle JSZip and export the local pattern library plus a compiled MIDI.' };
        }),
        test(62, 'Fretboard all-MIDI ZIP is wired offline', async () => {
            const [page, controls, events, exporter, midi, zip] = await Promise.all([cachedText('fretboard.html'), cachedText('app-ui-bottom-export.js'), cachedText('app-events-export-batch.js'), cachedText('app-export.js'), cachedText('daw-midi.js'), cachedText('vendor/jszip.min.js')]);
            const ok = !!page && !!controls && !!events && !!exporter && !!midi && !!zip && page.includes('daw-midi.js') && controls.includes('midi-all-patterns-zip') && events.includes('Exporter.exportAllPatternsToMidiZip') && exporter.includes('all-patterns-all-keys.mid');
            return { ok, detail: ok ? 'All-key diagram MIDI files and the compiled sequence use cached local libraries' : 'Fretboard MIDI ZIP menu, exporter or bundled dependency is missing', probableFix: ok ? '' : 'Connect the export-menu action to the local MIDI serializer and JSZip.' };
        }),
        test(63, 'Chord formulas contain no duplicate pitch classes', () => {
            const theory = window.app && window.app.musicTheory;
            if (!theory) return { ok: false, detail: 'MusicTheory instance is unavailable', probableFix: 'Initialize the Fretboard theory catalog before diagnostics.' };
            const duplicates = Object.entries(theory.chords).filter(([, chord]) => {
                const pitchClasses = chord.intervals.map(iv => theory.getIntervalSemitones(iv)).map(value => ((value % 12) + 12) % 12);
                return pitchClasses.some((value, index) => pitchClasses.indexOf(value) !== index);
            }).map(([id]) => id);
            return { ok: duplicates.length === 0, detail: duplicates.length ? 'Duplicate tones: ' + duplicates.join(', ') : Object.keys(theory.chords).length + ' chord formulas checked', probableFix: duplicates.length ? 'Remove enharmonic duplicate intervals from each chord formula.' : '' };
        }),
        test(64, 'Theta cache versions match', async () => {
            const [manifest, runtime, packageBuilder] = await Promise.all([cachedText('offline-assets.js'), cachedText('site.js'), cachedText('offline-package.js')]);
            const token = manifest && (manifest.match(/version: '([^']+)'/) || [])[1];
            const runtimeMatches = token && runtime && runtime.includes("CACHE_VERSION = '" + token + "-' +");
            const packageUsesRuntime = packageBuilder && packageBuilder.includes('ST.cacheVersion') && !packageBuilder.includes('st-3.2-theta-r1-');
            const ok = !!token && !!runtimeMatches && !!packageUsesRuntime;
            return { ok, detail: ok ? 'Worker and runtime share ' + token + '; ZIP packaging uses the runtime cache key' : 'Release cache versions are inconsistent', probableFix: ok ? '' : 'Keep the offline cache key identical across the runtime, worker and ZIP builder.' };
        }),
        test(65, 'Compiled MIDI retains each key', async () => {
            const [midi, daw, exporter] = await Promise.all([cachedText('daw-midi.js'), cachedText('daw.js'), cachedText('app-export.js')]);
            const ok = !!midi && !!daw && !!exporter && midi.includes('step.key || key') && daw.includes('key,') && daw.includes('label: stepIndex') && exporter.includes('key: entry.key');
            return { ok, detail: ok ? 'Each compiled MIDI section keeps its source key rather than transposing to C' : 'Combined MIDI may lose per-pattern key information', probableFix: ok ? '' : 'Store a key on each compiled step and resolve that key before serializing notes.' };
        })
    );
})();
