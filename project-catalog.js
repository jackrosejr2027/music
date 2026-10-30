/* Page capabilities and the complete offline asset inventory, shared by Admin and documentation. */
(function () {
    'use strict';
    const page = (path, name, group, features) => ({ path, name, group, features });
    const pages = [
        page('index.html', 'Home', 'Administration', ['Default view restores the Home dashboard from before consolidation; Custom builds Home from saved Show/Hide choices.', 'Admin stays reachable and both views use the complete local offline package.']),
        page('home.html', 'Home (alternate URL)', 'Administration', ['Same Default/Custom Home renderer as index.html; existing Home links continue to work.']),
        page('admin.html', 'Admin', 'Administration', ['Lists every preserved page and every file in the offline manifest.', 'Switch Default/Custom views without erasing saved choices; search assets and control Custom Home/shared-navigation visibility on this device.', 'Show/hide asset details without disabling dependencies or removing files.', 'Open all pages directly, including hidden entries; link to documentation, testing and offline ZIP download.']),
        page('fretboard-standalone.html', 'Neck Diagram Explorer Standalone', 'Standalone', ['Shows only the fretboard with no header, sidebar or controls; opens on key C, interval 1.', 'Uses the same fretboard engine and saved display settings as Neck Diagram Explorer.']),
        page('pattern-studio-standalone.html', 'Pattern Studio', 'Standalone', ['Pattern Studio with the pattern library and track selectors hidden.', 'Uses the same saved work and settings as Pattern Studio.']),
        page('theory-decks/daw-standalone.html', 'DAW', 'Standalone', ['The DAW with the site header and sub-navigation hidden.', 'Uses the same saved work and settings as the DAW.']),
        page('andalusian-standalone.html', 'Andalusian', 'Standalone', ['Andalusian cadences with the header, sidebar toggle, progression controls and footer hidden.']),
        page('cadence-map/cadence-map-standalone.html', 'Cadence Map', 'Standalone', ['Cadence Map with the site sidebar, header, filter grid and chord legend hidden.', 'Uses the Home theme colors and font.']),
        page('theory-decks/cards-standalone.html', 'Cards', 'Standalone', ['Practice cards with the sub-navigation and deck pickers hidden.']),
        page('chord-progressions-standalone.html', 'Chord Progressions', 'Standalone', ['Build, hear and transpose progressions with the header and sidebar toggle hidden.']),
        page('scale-explorer-standalone.html', 'Scale Explorer', 'Standalone', ['Scale Explorer with the header, sidebar toggle and filter panel hidden.']),
        page('interval-explorer-standalone.html', 'Interval Explorer', 'Standalone', ['Interval Explorer with the header, sidebar toggle and filter panel hidden.']),
        page('chord-explorer-standalone.html', 'Chord Explorer', 'Standalone', ['Chord Explorer with the header, sidebar toggle and filter panel hidden.']),
        page('theory-cards/flash-cards-standalone.html', 'Flash Cards', 'Standalone', ['Flash Cards with the header, sidebar toggle and deck filter hidden.']),
        page('lessons-standalone.html', 'Lessons', 'Standalone', ['The lesson list with the header and sidebar toggle hidden.']),
        page('courses-standalone.html', 'Courses', 'Standalone', ['The course list with the header and sidebar toggle hidden.']),
        page('quizzes-standalone.html', 'Quizzes', 'Standalone', ['The quiz list with the header and sidebar toggle hidden.']),
        page('tests-standalone.html', 'Tests', 'Standalone', ['The test list with the header and sidebar toggle hidden.']),
        page('exams-standalone.html', 'Exams', 'Standalone', ['The exam list with the header and sidebar toggle hidden.']),
        page('ebooks-standalone.html', 'eBooks', 'Standalone', ['The eBook list with the header, sidebar toggle and setup panel hidden.']),
        page('fretboard.html', 'Neck Diagram Explorer', 'Play & Create', ['Visualize scales, chords, intervals, gamuts, grids and custom formulas in the selected key.', 'Instrument presets, custom tuning, string counts, handedness, fret spans and per-string visibility/ranges.', 'Create 1-20 diagrams with independent key, pattern type/selection, instrument, tuning, string and fret settings; share appearance. Each board has Key, Type and Selection controls, including Gamut patterns. Gauntlet adds an ordered 20-diagram guitar preset with single-target-string studies on two-string diagrams (the higher string has no notes), adjacent groups and three selective standard-six-string views.', 'Multi-Instrument preset: 25 diagrams: 15 ordered instruments plus 10 alternate guitar/bass tunings, independent key/type/selection, octave-labeled setup titles, paired mandolin/oud strings, and a selected-key-first two-octave piano keyboard plus open-pitch maps for 47 harp strings and 13 koto strings. Gauntlet also has descriptive setup titles.', 'Note, interval, Roman numeral and solfege labels; marker, string, fret, theme and theory-panel styling.', 'Pattern playback, melodic sequences, piano, tuning reference tones, slideshows and circle cycles.', 'Local image, PDF, Word, MIDI and ZIP exports; configurable diagram labels and batch collections.', 'Current-key all-diagram PDFs for every scale, chord or interval: one page per pattern/diagram pair, confirmation over 150 pages, Stop saves completed pages without changing live settings.', 'All Keys creates 17 diagrams from the selected pattern/instrument; Type and Selection changes apply to every All Keys board while keys and instrument setups stay independent: 12 pitches in circle-of-fifths order starting at C, with separate adjacent common sharp/flat spellings. Gamut shapes transpose into a 0-24 fret view. The two-octave piano starts on its selected key. All Keys exports the selected Type/Selection as one ZIP: a 17-page PDF, a 17-diagram DOCX, an XLSX with editable metadata and embedded diagrams on 17 sheets, and 17 JPG plus 17 PNG files. Export snapshots preserve the live diagrams; Stop cancels the package. Key, Type and Selection controls sit below each diagram, including single-diagram mode. Diagram exports prompt once to include or omit titles; the choice applies throughout an All Keys ZIP. Board & Playback is grouped by task: diagram display, melodic exercises, pattern cycling, key loops, slideshow playback/files, reference pitches and interface styling. Existing controls and options are retained, with explicit action labels and timing explanations. Instrument controls are grouped into diagram sets, selected-diagram instrument/tuning, fret windows/range presets, selected per-string controls, and other-diagram string controls; a live editor summary and help distinguish local changes, marker visibility, stored ranges and reference maps. Appearance groups theory-panel content, note markers, string lines, fret lines, fret numbers, position dots, custom colors and playback/export shortcuts. Every appearance option remains; help distinguishes marker styling, screen-only theory text, export label choices and legacy stroke controls. Export retains all 52 actions, with per-action output/scope help, a Create export button, detailed-label preference explanations, Stop guidance, and accessible older direct-export buttons.']),
        page('scales.html', 'Scales', 'Reference', ['Search and filter the local scale catalog by intervals.', 'Read formulas, spelling, Base-0 pitch classes and related theory; hear previews, save favorites and open diagrams.']),
        page('chords.html', 'Chords', 'Reference', ['Search chords and filter by included intervals and scale containers.', 'Inspect formulas, tones and related theory; preview, favorite and open fretboard views.']),
        page('intervals.html', 'Intervals', 'Reference', ['Browse intervals ordered by pitch distance, including unison.', 'Melodic/harmonic playback, Base-0 values, related chords/scales, favorites and diagram links.']),
        page('data.html', 'Application Data', 'Reference', ['Inspect interval, chord and scale tables; edit and validate supported local data.', 'Import/export supported tables using bundled Excel, CSV and PDF tools; back up before editing.']),
        page('daw.html', 'Pattern Studio', 'Play & Create', ['Search/load 500 generated patterns from 42 forms across 12 keys.', 'Arrange interval, chord and scale blocks with key, length, tempo and local Play/Stop.', 'Save named patterns on this device, favorite sequences and transfer status backups.', 'Export individual MIDI or all-pattern ZIP with individual files and a compiled MIDI retaining each section key.']),
        page('dummy.html', 'Chord Progressions', 'Play & Create', ['Build major/minor-key chord progressions, use presets, transpose and hear them.', 'Playable diagrams and saved progression favorites.']),
        page('andalusian.html', 'Andalusian Cadence', 'Play & Create', ['Choose cadence variations and keys; compare chord roles and fretboard illustrations.', 'Play the selected progression through local synthesis.']),
        page('cadence-map/index.html', 'Cadence Map', 'Play & Create', ['Six-chord minor palette and all seven major-scale modes with transposed triads.', 'Choose one tonic or all 12, multiple lengths and chord-count shapes; featured recipes have 24 distinct orderings per tonic.', 'Ranked progression pagination, selected progression playback and Stop.', 'TXT exports expand small selections and use a compact recipe/rank index above 25,000 progressions.', 'All fonts and code are bundled locally; the optional original-project link needs internet.']),
        page('courses.html', 'Courses', 'Learning', ['Structured course paths connect lessons, practice, diagrams, books and assessments.', 'Local completion indicators and progress tracking.']),
        page('lessons.html', 'Music Lessons', 'Learning', ['50 lessons with outcomes, explanations, formulas, spelling, diagrams, practice and applied checks.', 'Completion tracking, related patterns and drafts opened in Ideas & Notes.']),
        page('practice.html', 'Practice Room', 'Learning', ['Randomized key/pattern drills and playable examples.', 'Local metronome, session timer and recorded practice activity.']),
        page('primer.html', 'Primer', 'Learning', ['Read lessons and Practice Room material; follow the 20,000-step learning map.', 'Pattern, mixer, instrument setup, tuning, range, playback and help controls.']),
        page('theory-cards/index.html', 'Theory Cards', 'Learning', ['612 local foundation and data-backed flashcards.', 'Filter categories, reveal answers, navigate by buttons/keyboard and save favorites.']),
        page('coursesquizzes.html', 'Quizzes', 'Learning', ['Generated topic questions, answers, explanations and interactive diagrams.', 'Local scores, completion records and progress integration.']),
        page('coursestests.html', 'Tests', 'Learning', ['Timed theory assessments with a countdown and scoring.', 'Results stored locally and linked to Learning Progress.']),
        page('coursesexams.html', 'Exams', 'Learning', ['Graded assessments with local answer evaluation and progress records.', 'Generate supported PDF certificates on this device.']),
        page('ebooks.html', 'Theory eBooks', 'Learning', ['200 grouped PDF guides built from the local theory catalog.', 'Configurable string counts/tuning, diagrams, detailed addenda and all-key examples.', 'Individual guides, all-guide ZIP and full-catalog PDF index exports; large jobs can be memory-intensive.']),
        page('favorites.html', 'Favorites', 'Personal Data', ['Reopen saved patterns, diagrams and cards in context.', 'Remove entries, export PDF, and import/export portable backups with duplicate handling.']),
        page('progress.html', 'Learning Progress', 'Personal Data', ['Activity, streaks, calendar, practice time, lessons and assessment results.', 'Device-local storage; reset is destructive and should only be tested on disposable data.']),
        page('coursesideas.html', 'Ideas & Notes', 'Personal Data', ['Create, edit and retain notes locally with text/PDF export.', 'Clickable note board, matching patterns, transposition, key identification, local idea generation and playback.']),
        page('settings.html', 'Application Settings', 'Personal Data', ['Instrument/key/display defaults, themes and audio preferences.', 'Backup/restore local app data; reset actions require care and do not provide cloud sync.']),
        page('about.html', 'Complete Feature Master List', 'Documentation', ['Detailed legacy and current feature capabilities with locations.', 'Complete page-by-page feature catalog and every offline asset, including preserved legacy UI resources.']),
        page('release-notes.html', 'Release Notes', 'Documentation', ['Current overhaul preparation, preserved capabilities, offline architecture and installation guide.', 'Storage, exports, update behavior, verification scope, browser limitations, complete page/asset inventory and offline ZIP download.']),
        page('site-map.html', 'Site Map', 'Documentation', ['Grouped links to the main application and nested Theory Decks tools.', 'Direct links remain available during the UI overhaul; no files are removed by visibility settings.']),
        page('testing.html', 'In dept testing', 'Documentation', ['Manual scripts and expected results for every page, including offline checks.', 'Read-only source/asset/link checks, independent manual marks, saved notes and copyable change-request prompts.']),
        page('theory-decks/index.html', 'Theory Decks Home', 'Theory Decks', ['Launch the preserved Theory Decks practice app, DAW, reference, settings and both fretboards.', 'Standalone deck navigation and optional mobile view remain available.']),
        page('theory-decks/play.html', 'Theory Decks Practice', 'Theory Decks', ['Explore theory and technique decks, deal cards and play practice games from local formulas.', 'Reveal answers, use card audio, choose active pools, themes and card styles; transfer suitable cards to the DAW.']),
        page('theory-decks/daw.html', 'Theory Decks DAW', 'Theory Decks', ['Bar/step editing, sections, arrangements, presets, per-bar key, scale, meter, tempo and grouping.', 'Melody, chord, bass and drum lanes; mix, swing, looping, undo/redo and local song storage.', 'Song backup/restore, MIDI import, and supported JSON, TXT, CSV, MIDI and PDF exports.']),
        page('theory-decks/Fretboard Diagrams/index.html', 'Theory Decks Fretboard', 'Theory Decks', ['Search scales, chords and intervals; 1-14 individually tuned strings, 0-48 fret range and capo.', 'Note/degree labels, playable notes/arpeggios and saved setups.', 'PNG, JPG, PDF, PowerPoint, Word and MIDI generated locally.']),
        page('theory-decks/reference.html', 'Theory Decks Reference', 'Theory Decks', ['Theory lessons and reference documentation for decks and games.', 'Links into the corresponding practice tools.']),
        page('theory-decks/about.html', 'Theory Decks About', 'Theory Decks', ['Deck/game architecture, data conventions, playback, DAW and offline documentation.']),
        page('theory-decks/author.html', 'From the Author', 'Theory Decks', ['Preserved author page and its navigation; content may remain a placeholder.']),
        page('theory-decks/release-notes.html', 'Theory Decks Release Notes', 'Theory Decks', ['Preserved component release history, MIDI/DAW changes, fretboard notes and offline help.']),
        page('theory-decks/settings.html', 'Theory Decks Settings', 'Theory Decks', ['Theme, card style, active deck/card pools, string count, octave and test sound.', 'Song and settings backup/import/reset, offline asset counts and storage protection request.', 'Save the complete offline app or create a ZIP retaining all parent-folder dependencies.'])
    ];
    const assets = [...new Set(window.ST_OFFLINE.assets.map(asset => decodeURIComponent(asset === './' ? 'index.html' : asset)))].sort();
    const protectedPages = new Set(['index.html', 'home.html', 'admin.html']);
    let state = {};
    try { const value = JSON.parse(localStorage.getItem('st_ui_visibility_v1') || '{}'); if (value && typeof value === 'object' && !Array.isArray(value)) state = value; } catch {}
    function viewMode() { return state.viewMode === 'default' ? 'default' : 'custom'; }
    function save() {
        try { localStorage.setItem('st_ui_visibility_v1', JSON.stringify(state)); window.dispatchEvent(new Event('app-visibility-change')); return true; }
        catch { return false; }
    }
    function assetGroup(file) {
        if (file.endsWith('.html')) return 'Pages';
        if (file.startsWith('vendor/')) return 'Bundled Libraries';
        if (file.endsWith('.css')) return 'Styles';
        if (file.endsWith('.ttf') || file.includes('-OFL.txt')) return 'Fonts & Licenses';
        if (file.endsWith('.png') || file.endsWith('.mp3')) return 'Images & Audio';
        if (/offline|sw[.]js|service-worker|webmanifest/.test(file)) return 'Offline & Installation';
        if (file.endsWith('.csv') || file === 'markdown' || /(?:data|themes|presets)/.test(file) || /(?:music-theory|theory-decks\/theory|theory-decks\/decks)/.test(file)) return 'Data & Theory';
        return 'Application Scripts';
    }
    function assetRole(file) {
        if (file === 'home.css') return 'Preserved previous Home styles for the forthcoming UI overhaul.';
        if (file.startsWith('uploads/')) return 'Preserved uploaded source asset; not removed by the Home reset.';
        if (file.includes('tone.js')) return 'Local synthesis library or Web Audio voice engine.';
        if (file.includes('jszip')) return 'Local ZIP packaging library.';
        if (file.includes('jspdf')) return 'Local PDF generation library.';
        if (file.includes('html2canvas')) return 'Local DOM-to-image rendering library.';
        if (file.includes('docx')) return 'Local Word document generation library.';
        if (file.includes('xlsx')) return 'Local spreadsheet import/export library.';
        return ({ Pages: 'Preserved HTML entry point.', Styles: 'Local layout, appearance or responsive styling.', 'Fonts & Licenses': 'Bundled typography or its redistribution license.', 'Images & Audio': 'Local icon, image or audio resource.', 'Data & Theory': 'Local catalog, formulas, presets, theme definitions or theory module.', 'Offline & Installation': 'Cache installation, manifests, packaging or offline support.', 'Application Scripts': 'Local interaction, rendering, playback, export or page logic.' })[assetGroup(file)];
    }
    window.APP_CATALOG = {
        pages, assets, protectedPages, assetGroup, assetRole,
        viewMode,
        setViewMode(mode) { if (mode !== 'default' && mode !== 'custom') return false; state.viewMode = mode; return save(); },
        isVisible: file => viewMode() === 'default' || protectedPages.has(file) || state[file] !== false,
        setVisible(file, visible) { if (!protectedPages.has(file)) state[file] = !!visible; return save(); },
        assetExpanded: file => viewMode() === 'default' || state['asset:' + file] !== false,
        setAssetExpanded(file, expanded) { state['asset:' + file] = !!expanded; return save(); }
    };
})();
