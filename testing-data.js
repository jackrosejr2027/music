const step = (action, expected) => ({ action, expected });
const homeSteps = [
    step('Choose Default view in Admin, open this Home URL and inspect it at desktop/mobile widths.', 'The pre-consolidation hero, Play!, theory, learning, personal links and footer appear; Admin remains accessible.'),
    step('In Custom setup hide a page, open Home, then switch to Default and back to Custom.', 'Custom Home/shared navigation omit the hidden page; Default ignores the filters; returning to Custom restores the saved choices without deleting assets.')
];
const assessmentSteps = kind => [
    step('Choose a ' + kind + ' and start it. Answer one question correctly and one incorrectly.', 'Questions render, feedback matches the chosen answers, and progress advances once per answer.'),
    step('Finish the assessment and inspect its score, then open Learning Progress.', 'The score matches correct answers; the result appears in recent results without duplication.'),
    step('Start another assessment, close it before completion, and return to the list.', 'The list remains usable and an unfinished attempt is not shown as a completed result.')
];
const informationSteps = [
    step('Read the page from top to bottom and open its section or navigation links.', 'Content is readable, sections are reachable, and links lead to the named destinations.'),
    step('Check the instructions against the linked live tool.', 'Names, steps and advertised features agree with the current interface. Record any mismatch.')
];
export const commonSteps = [
    step('Open the page at desktop width, then at 390px mobile width and 200% zoom.', 'Text and controls remain usable; no accidental page-wide horizontal scrolling. Deliberately scrollable boards and timelines still work.'),
    step('Use Tab and Shift+Tab through navigation and the main controls; activate buttons with Enter/Space and dismiss overlays with Escape where supported.', 'Focus is visible and follows a logical order; no keyboard trap or unreachable action.'),
    step('Reload with the developer console open, then repeat the main interaction.', 'No uncaught JavaScript errors or failed required resources. Audio starts only after a user action.'),
    step('Wait for the complete offline-ready install while online. Disconnect the network, open/reload this page and repeat its primary action and an export if offered.', 'The correct page, fonts, data, local playback and exports remain available without internet. Only app installation/updates and the optional original-project link need a connection. Use localhost for an extracted ZIP, not file://.')
];
export const pages = [
    { path: 'index.html', name: 'Home', steps: homeSteps },
    { path: 'home.html', name: 'Home (alternate URL)', steps: homeSteps },
    { path: 'admin.html', name: 'Admin', steps: [
        step('Inspect page and asset counts; search for a nested page, old Home stylesheet and uploaded image.', 'Every preserved HTML page and manifest file is listed, including legacy assets and source art; search matches names, paths and capabilities.'),
        step('Choose Custom setup, hide a nonessential page in Admin, reload, then inspect Home and the shared header on another main page. Return to Admin and Show it.', 'The visibility choice persists locally and affects Custom Home and shared navigation only. Direct links, documentation, offline caches and ZIP entries remain available. Home and Admin cannot be hidden.'),
        step('Hide an asset description, reload, Show it, then use Hide all groups / Show all groups and search.', 'Descriptions/group contents fold and restore without disabling files. Search opens matching groups, reports no matches when appropriate, and remains keyboard usable.'),
        step('After offline readiness, disconnect, open a hidden page by its Admin link and create the Offline ZIP.', 'The page and its dependencies load offline. The ZIP still contains every asset irrespective of visibility. Restore temporary visibility changes after the test.')
    ] },
    { path: 'fretboard.html', name: 'Neck Diagram Explorer', steps: [
        step('Select C major, then F# minor; switch between notes and interval labels.', 'Notes, root, pattern title and labels update together without stale markers.'),
        step('Open Controls > Instrument. Set diagram counts to 1, 2, 5 and 20.', 'Exactly that many diagrams and corresponding string-control groups appear.'),
        step('Give diagrams 1, 2 and 20 different tunings and fret ranges. Toggle Show and set per-string Start/End, including fret 0.', 'Only the corresponding diagram changes; tuning, visibility and string ranges remain independent.'),
        step('Switch Edit diagram between 1, 2 and 20, change string counts, then reduce the diagram count to 1.', 'Each setup restores correctly, overlapping strings keep their settings, and removed diagrams/controls disappear.'),
        step('Play and stop the selected pattern; open all Controls tabs and change appearance.', 'Playback stops cleanly, tabs stay usable and all diagrams share the chosen appearance.'),
        step('For each count 1, 2 and 20, export All Diagrams / All Intervals in a non-C key. Open the PDFs.', 'Each configured diagram appears for every interval, including unison, in the selected key only. Tunings, Show and fret ranges match; pages = intervals x diagram count.'),
        step('Repeat All Diagrams / All Chords and All Diagrams / All Scales for counts 1, 2 and 20. Allow time for large exports; use Stop once.', 'Each completed PDF contains every pattern/diagram pair for the current key only. Stop saves completed pages; the live selection and controls stay unchanged.'),
        step('Run the existing fretboard diagnostics from its diagnostics control, if available, and inspect failures.', 'The report opens and closes accessibly. Record actual failures rather than assuming that source checks prove behavior.'),
        step('Add multiple diagrams. Set Diagram 1 to C / Interval / Root, Diagram 2 to G / Chord / Major, and Diagram 3 to a Gamut. Change each board using its Key, Type and Selection controls and switch Edit diagram.', 'Only the edited board changes; selectors, notes and Gamut positions stay independent. Main controls, playback and single-diagram exports follow the selected diagram. Adding a board inherits the active setup; reducing the count cleans up controls. Repeat with Gauntlet.'),
        step('Choose Multi-Instrument, inspect all 25 titles and select each diagram for editing. Change its key/type/selection; switch to Gauntlet and numeric counts, then back.', 'Order matches the reference: acoustic, electric, bass, ukulele, violin, piano, mandolin, banjo, cello, viola, double bass, harp, sitar, oud, koto, followed by 10 alternate acoustic/electric guitar and bass setups. Piano shows 24 keys starting on the selected key at octave 4, harp 47 pitches Cb1-Gb7 and koto 13 open pitches; selected pitch classes highlight without false frets. Mandolin has 8 paired-string rows and oud 11. Banjo and ukulele preserve re-entrant order. Titles describe setup and modeling assumptions; edited pitches do not retain false octave labels. Key/type/selection remain independent. Large secondary string-control groups collapse. Gauntlet titles describe tuning and shown strings; all count options still work.'),
        step('Choose Gauntlet in Controls > Instrument > Fretboard diagrams. Inspect all 20, edit one, switch editors, reduce the count, and reapply Gauntlet.', 'Diagrams 1-5 use two-string EA, AD, DG, GB, BE boards low-to-high, with notes only on the first/lower target string (E, A, D, G, B); the higher string stays drawn with all its notes hidden. Diagrams 6-17 are EA, AD, DG, GB, BE, EAD, ADG, DGB, GBE, EADG, ADGB, DGBE with notes on all strings. Diagrams 18-20 retain standard EADGBE tuning with only strings 6/4/1, 5/3/1, 4/2/1 shown respectively (EDE, AGE, DBE). Each setup remains editable; numeric 1-20, cleanup and reapplication work. The current overall fret range and shared appearance remain unchanged; each diagram starts with the selected key/type/pattern and can then be edited independently.'),
        step('Select an interval, chord, scale, custom pattern or Gamut; choose All Keys in Controls > Instrument > Fretboard diagrams. Inspect F# and Gb, then edit a board and regenerate.', '17 boards follow circle-of-fifths order from C: C, G, D, A, E, B, F#, Gb, C#, Db, G#, Ab, D#, Eb, A#, Bb, F. Enharmonic partners sit next to each other. Pattern and instrument setup copy from the active board; sharps/flats stay separate in titles and selectors. Enharmonic pitches agree and note spellings reflect the key. Changing Type or Selection on any All Keys board updates all 17 patterns without changing their keys or instruments. Key and instrument edits remain local. Numeric, Gauntlet and Multi-Instrument modes keep independent Type/Selection controls. Gamut shapes transpose from the source key with octave placement inside 0-24 frets. Reapplying copies the current selected pattern again.'),
        step('In All Keys, select the desired Type and Selection. In Export Action choose All Keys: Selected Type/Selection (PDF, DOCX, XLSX, JPG, PNG ZIP), then Create export. Unzip and open every format; repeat with an interval, chord, custom pattern and Gamut. Also try Stop.', 'Before exporting, a title prompt offers OK to include diagram titles or Cancel to export without them. Repeat both choices and inspect PDF headings, Word headings, Excel title cells and image labels. One ZIP contains 37 files: one PDF with 17 pages, one DOCX with 17 diagram pages, one XLSX with 17 key sheets containing editable metadata and embedded diagrams, and 17 JPG plus 17 PNG images. Circle-of-fifths order starts at C; sharp/flat spellings stay separate. All entries use only the selected Type/Selection. Instrument setups, appearance and Gamut reference settings are snapshotted; live controls/diagrams do not change. Stop cancels without downloading an incomplete package. Outside All Keys the action requests that mode.'),
        step('Inspect Neck Diagram Explorer in single-diagram, numeric, Gauntlet, Multi-Instrument and All Keys modes. Use the Key, Type and Selection controls below each neck.', 'The stage intro text is absent. Each diagram has its own labeled selector area below the SVG, never inside the scrollable neck or exported images. All Keys still links Type/Selection and preserves different keys; other modes remain independent. Dropdowns wrap on narrow screens and have visible keyboard focus.'),
        step('Open Controls > Board & Playback. Inspect every task group; change marker text, number backgrounds and capo; show the piano/reference notes; run and stop a melodic exercise, a key loop and a slideshow. Exercise slideshow image/PDF/CSV actions and custom imports.', 'All previous options remain. Native checkboxes replace cryptic icon toggles, action buttons name their task, and each task has its own group. Melodic tempo, slideshow BPM/measures and key-loop seconds are distinguished. Pattern Cycle/Shuffle still replaces and loops the slideshow; its help warns about that. Start/Stop/Pause/Resume remain readable during playback. File import types, numeric defaults/limits and select values are preserved. Layout wraps on mobile. All existing features remain available.'),
        step('Open Controls > Instrument. Load numeric, Gauntlet, Multi-Instrument and All Keys sets. Switch the editor, instrument and tuning; shift pitches and reverse order. Change visible frets and per-string limits; apply and save range presets.', 'Task groups explain scope and effects. The editor summary names the selected diagram. Instrument/tuning, count, semitone shifts and reverse order retain their behavior. Every range preset remains, with explicit Apply and Save actions; help states that built-in string/group presets may use six-string numbering and saved presets contain per-string limits only. Per-string Open pitch, Show notes, From fret and To fret controls retain values and have native labels. Other-board rows still edit their named board directly. Reference-map limitations are explained. Controls wrap on mobile; all existing features remain available.'),
        step('Open Controls > Appearance. Inspect every group; change note shapes/effects, string styles/spacing, fret styles/thickness, number/dot placement and white/custom colors. Show the theory panel, toggle its heading/details, then try the playback/export shortcuts.', 'Every static and dynamically built option remains with its numeric limits and defaults. Groups describe which drawing element changes, pixel offsets and the precedence of retained legacy stroke controls. Theory panel toggles and detail checkboxes work directly from Appearance; they do not control diagram selectors or export titles. Custom color pickers have linked labels and inversion remains available. Playback/JPG/slideshow shortcuts remain functional; export title prompts still take precedence. Groups wrap on mobile and the all existing features remain available.'),
        step('Open Controls > Export. Select actions across PDF, image, ZIP, Word and MIDI groups; read the output/scope help. Compare PDF in 12 keys with the 17-spelling All Keys package. Expand the older direct-export buttons and inspect the 1-to-maximum-string actions.', 'All 52 export actions remain. Nothing starts on selection; Create export runs the existing handler. Help distinguishes selected diagram, selected-key category, all-diagram/current-key PDFs, saved slideshow, full libraries and the 17-spelling package. Word variant prompts and ZIP-versus-separate-download results are described. Label preferences explain that the title prompt takes precedence. Direct-button disclosure shows actual controls and updates its expanded state; all-string exporters have their required handler buttons. Stop and completion restore the main action button. Original fretboard is unchanged.'),
    ] },
    { path: 'fretboard-standalone.html', name: 'Neck Diagram Explorer Standalone', steps: [
        step('Open the page with no query string.', 'Only the fretboard shows: no header, sidebar, bottom controls or footer. It opens on key C, interval 1.'),
        step('Visit the standalone page, then open fretboard.html and check its key, pattern and display settings.', 'The standalone visit does not change the fretboard.html selections the user saved.'),
        step('Reload the standalone page with other query values, e.g. ?key=G&patternType=scale&pattern=major.', 'The URL values apply to the fretboard, and the page still shows no chrome.'),
    ] },
    { path: 'pattern-studio-standalone.html', name: 'Pattern Studio', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'theory-decks/daw-standalone.html', name: 'DAW', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'andalusian-standalone.html', name: 'Andalusian', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'cadence-map/cadence-map-standalone.html', name: 'Cadence Map', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'theory-decks/cards-standalone.html', name: 'Cards', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'chord-progressions-standalone.html', name: 'Chord Progressions', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'scale-explorer-standalone.html', name: 'Scale Explorer', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'interval-explorer-standalone.html', name: 'Interval Explorer', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'chord-explorer-standalone.html', name: 'Chord Explorer', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'theory-cards/flash-cards-standalone.html', name: 'Flash Cards', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'lessons-standalone.html', name: 'Lessons', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'courses-standalone.html', name: 'Courses', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'quizzes-standalone.html', name: 'Quizzes', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'tests-standalone.html', name: 'Tests', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'exams-standalone.html', name: 'Exams', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'ebooks-standalone.html', name: 'eBooks', steps: [
        step('Open the page with no query string.', 'Only the tool shows: no site header, navigation or sidebar toggle.'),
        step('Use the main controls on the page once.', 'They work as on the original page, and the saved settings it uses are unchanged.'),
    ] },
    { path: 'scales.html', name: 'Scales', steps: [
        step('Search for Major, apply interval filters, then Reset All.', 'Results satisfy the query and filters; reset restores the full list.'),
        step('Change key and open a scale in the interactive fretboard.', 'Formula, spelling and destination pattern/key agree.'),
        step('Use a scale preview and favorite control, then open Favorites.', 'Preview starts after a click; the correct scale is saved once and can be reopened.')
    ] },
    { path: 'chords.html', name: 'Chords', steps: [
        step('Search a chord and combine interval and scale-container filters, then Clear All Filters.', 'Only matching chords remain; clearing restores the list.'),
        step('Change key, preview a chord and open its fretboard view.', 'Chord tones, formula, playback and selected fretboard chord/key agree.'),
        step('Favorite one chord and reopen it from Favorites.', 'The same chord and key are restored without duplicate entries.')
    ] },
    { path: 'intervals.html', name: 'Intervals', steps: [
        step('Filter intervals, change the root, then Clear Filters.', 'Displayed distances and spellings match the root; clearing restores results.'),
        step('Preview unison, a third and an octave, and open an interval on the fretboard.', 'Sound and diagram match the interval and selected key.'),
        step('Save an interval as a favorite and reopen it.', 'The saved interval resolves to the correct destination and key.')
    ] },
    { path: 'data.html', name: 'Application Data', steps: [
        step('Switch among Intervals, Chords and Scales; search or filter available rows.', 'The correct data table and matching formulas appear without stale rows.'),
        step('Export one category as CSV, XLSX and PDF; open each file.', 'Files are readable, contain the selected category and retain names and formulas.'),
        step('If testing custom-data editing/import, first export a backup and use a disposable entry.', 'Validation rejects malformed data; valid changes appear in the relevant tool without deleting unrelated entries.')
    ] },
    { path: 'daw.html', name: 'Pattern Studio', steps: [
        step('Load a progression, add a pattern block, and change a block key and timing.', 'Arrangement and fretboard preview reflect block order, duration and key.'),
        step('Play, stop, then export MIDI and open it in a MIDI player.', 'Playback stops immediately and MIDI matches notes, timing and arrangement order.'),
        step('Save a uniquely named temporary pattern, reload, and reopen it. Export status before testing import.', 'The saved pattern restores; a valid status backup can be imported without losing unrelated patterns.')
    ] },
    { path: 'dummy.html', name: 'Chord Progressions', steps: [
        step('Build a short progression, change key and transpose it.', 'Chord names and pitches transpose consistently; the progression order stays intact.'),
        step('Play, stop if offered, favorite the progression and reopen it from Favorites.', 'Playback follows the progression and the favorite preserves its content.'),
        step('Clear only the temporary progression.', 'The builder clears cleanly without removing saved favorites.')
    ] },
    { path: 'cadence-map/index.html', name: 'Cadence Map', steps: [
        step('Choose Andalusian and Other direction quick paths, then a single tonic and All 12 tonics.', 'Each featured four-chord recipe has 24 distinct orderings per tonic; chord names and roman numerals transpose correctly.'),
        step('Change the chord source to major-scale modes and select Ionian, Dorian and Locrian.', 'All seven triads and their qualities match the selected mode and tonic, including the diminished triad.'),
        step('Multi-select lengths and chord-count shapes. Move between pages and submit an invalid page number.', 'Only selected recipes are included at their own lengths, progressions do not duplicate, and invalid page numbers show feedback without changing the current page.'),
        step('Play a progression, stop it, switch filters, then return Home.', 'Playback follows the displayed chord order and stops on Stop, filter changes and leaving the page.'),
        step('Export a small selection as TXT, then a selection larger than 25,000 progressions.', 'Small selections expand every selected progression; large selections produce a complete compact recipe-and-rank index. Both retain the chosen tonics, source and lengths.')
    ] },
    { path: 'andalusian.html', name: 'Andalusian Cadence', steps: [
        step('Choose different progression variations and keys.', 'Chord sequence, labels and explanations follow the selected variation/key.'),
        step('Play a progression and change the selection after playback completes.', 'The heard chord order matches the display; subsequent playback uses the new selection.')
    ] },
    { path: 'courses.html', name: 'Courses', steps: [
        step('Expand course details, inspect lessons and open a lesson.', 'Course steps are readable and lead to the intended lesson.'),
        step('Complete one disposable lesson and return to the course, then reload.', 'Progress and completed-step indicators reflect the lesson without double counting.'),
        step('Open an available diagram/preview and use its playback control.', 'The diagram and audio agree with the course topic and close/stop normally.')
    ] },
    { path: 'lessons.html', name: 'Music Lessons', steps: [
        step('Open lessons from different topics and follow their diagram links.', 'The selected lesson and corresponding musical example load correctly.'),
        step('Complete a lesson, reload and inspect Learning Progress.', 'Completion persists once and remains associated with the correct lesson.')
    ] },
    { path: 'practice.html', name: 'Practice Room', steps: [
        step('Generate several new drills and follow an exercise link.', 'Drills are valid and links open the expected exercise/key.'),
        step('Start and stop the metronome and practice session timer.', 'Only one metronome/timer runs; stopping silences audio and ends timing.'),
        step('Complete a short practice session and inspect Learning Progress.', 'The session is recorded once with a plausible duration.')
    ] },
    { path: 'primer.html', name: 'Primer', steps: [
        step('Use Read, Map, Pattern, Mixer, Setup, Tuning and Help.', 'Each opens its named content without covering essential controls permanently.'),
        step('Change learning-map step, tuning and displayed fret range using Min/Max.', 'The selected step, notes, tuning and diagram range update consistently.'),
        step('Use Play and Stop, then switch to another step.', 'Stop silences playback and the next play uses the new step.')
    ] },
    { path: 'theory-cards/index.html', name: 'Theory Cards', steps: [
        step('Filter card categories, reveal an answer and navigate previous/next using buttons and arrow keys.', 'The correct answer appears; counters match the selected deck and navigation resets to the prompt side.'),
        step('Save a card, reopen it from Favorites, then remove only that test favorite.', 'The same card opens and saved state remains consistent.')
    ] },
    { path: 'coursesquizzes.html', name: 'Quizzes', steps: assessmentSteps('quiz') },
    { path: 'coursestests.html', name: 'Tests', steps: assessmentSteps('test') },
    { path: 'coursesexams.html', name: 'Exams', steps: assessmentSteps('exam') },
    { path: 'ebooks.html', name: 'Theory eBooks', steps: [
        step('Choose an eBook and configure its fretboard tuning and range.', 'The chosen title and instrument settings are reflected in the generated content.'),
        step('Download a small eBook and inspect its PDF, contents and diagrams.', 'The PDF opens, text is readable, links/page order are correct and no diagram is clipped.'),
        step('Try a larger collection export only when ready for a long download.', 'Progress is understandable and the resulting files contain the promised material.')
    ] },
    { path: 'favorites.html', name: 'Favorites', steps: [
        step('Save examples from scales, chords, fretboards and cards, then reopen each here.', 'Each favorite restores its original content and context.'),
        step('Export a portable backup and PDF, inspect both, then test importing the backup.', 'Backup is valid and the PDF is readable; importing does not create unwanted duplicates.'),
        step('Remove only a uniquely named test favorite, then reload.', 'That entry stays removed and unrelated favorites remain.')
    ] },
    { path: 'progress.html', name: 'Learning Progress', steps: [
        step('Complete a lesson, a quiz and a short practice session, then revisit this page.', 'Totals, recent results and the activity calendar reflect those actions once.'),
        step('Reload and compare the displayed records.', 'Recorded progress persists with consistent dates and totals.'),
        step('Do not reset real progress. On a disposable profile only, test cancelling Reset progress.', 'Cancel leaves all existing records unchanged.')
    ] },
    { path: 'coursesideas.html', name: 'Ideas & Notes', steps: [
        step('Create a uniquely named note, reload, edit it and export PDF/text.', 'Content persists, edits save and exported files contain the correct note.'),
        step('Populate the board, mark notes, hear/arpeggiate them and transpose.', 'Marks, sound and transposed pitches agree; Clear marks affects only the board.'),
        step('Identify a key and generate an idea using the available controls.', 'The result is usable and any failure is shown clearly without losing existing notes.')
    ] },
    { path: 'settings.html', name: 'Application Settings', steps: [
        step('Record current defaults, change key/instrument/display defaults, Save Defaults and reopen the fretboard.', 'Saved defaults take effect on startup; restore original settings after the test.'),
        step('Change theme/audio options and reload.', 'Supported preferences persist with readable contrast and usable sound controls.'),
        step('Export user data and inspect the JSON before considering import/reset.', 'Backup contains the expected records. Never factory-reset real data; cancel any reset dialog.')
    ] },
    { path: 'about.html', name: 'About', steps: informationSteps },
    { path: 'release-notes.html', name: 'Release Notes', steps: [
        ...informationSteps,
        step('Download Offline ZIP and open its start page from a local web server.', 'The archive includes required scripts/styles and the main tools load. Record unsupported offline actions separately.')
    ] },
    { path: 'site-map.html', name: 'Site Map', steps: [
        step('Follow section jumps and a destination from each group, including Theory Decks.', 'Anchors scroll to the intended sections and every destination resolves correctly.'),
        step('Compare listed tools with the current Home/header navigation.', 'The map describes current destinations and does not mislabel tools.')
    ] },
    { path: 'theory-decks/index.html', name: 'Theory Decks Home', steps: [
        step('Open Play, DAW, Reference, Settings and both fretboard links.', 'Each destination loads the correct app, including paths containing spaces.'),
        step('Toggle Mobile view and navigate to a practice page.', 'Controls remain usable and the view preference is applied consistently.')
    ] },
    { path: 'theory-decks/play.html', name: 'Theory Decks Practice', steps: [
        step('Choose decks from Cards and Games; browse the contents list.', 'Cards/game controls and counts match the selection without stale content.'),
        step('Reveal/deal cards, complete a game action, and change theme/card style.', 'Answers and scoring match the action; selected styles keep cards readable.'),
        step('Preview a musical card, save a favorite where offered, and return to it.', 'Playback matches the card and saved state survives navigation.')
    ] },
    { path: 'theory-decks/daw.html', name: 'Theory Decks DAW', steps: [
        step('Back up the current song. Create a disposable song with several bars, keys, meters and cards.', 'Bars and cards render in order with the selected musical settings.'),
        step('Edit a bar, Undo and Redo; duplicate a section and play from a chosen bar.', 'History and section contents stay consistent; playback begins at the requested bar.'),
        step('Export a song in an offered format and reopen/import a song backup.', 'Export is readable and restored bars, sections, timing and notes match the backup.')
    ] },
    { path: 'theory-decks/Fretboard Diagrams/index.html', name: 'Theory Decks Fretboard', steps: [
        step('Search a shape, change key, string count, preset tuning and individual note/octave tuning.', 'Shape results and diagram pitches agree; individual tuning switches to Custom.'),
        step('Change start/end frets, capo and note/degree labels.', 'The range is valid, capo behavior is correct and labels remain readable.'),
        step('Play/Stop an arpeggio, favorite the setup and export PNG, JPG, PDF, PowerPoint, Word and MIDI one at a time.', 'Playback stops; saved setup restores; each exported format opens with the correct content.')
    ] },
    { path: 'theory-decks/reference.html', name: 'Theory Decks Reference', steps: informationSteps },
    { path: 'theory-decks/about.html', name: 'Theory Decks About', steps: informationSteps },
    { path: 'theory-decks/author.html', name: 'From the Author', steps: informationSteps },
    { path: 'theory-decks/release-notes.html', name: 'Theory Decks Release Notes', steps: informationSteps },
    { path: 'theory-decks/settings.html', name: 'Theory Decks Settings', steps: [
        step('Export all settings and the current song first; change look/sound and use Test sound.', 'Backups are valid, preferences persist and audio starts only on request.'),
        step('Use offline caching/download and inspect its completion feedback.', 'Success/failure is clearly reported; a cached practice page works offline after a successful cache operation.'),
        step('On a disposable profile only, inspect clear/reset actions and cancel them.', 'Cancel preserves settings, active cards and song data; no real records are deleted.')
    ] },
    { path: 'testing.html', name: 'In dept testing', steps: [
        step('Search for a page, expand its script, open its link and run Check source.', 'The correct page/script appears; source results are separate from manual results.'),
        step('Mark a temporary manual result Fail, add reproduction notes, reload and Copy feedback prompt.', 'Marks and notes persist; the copied prompt includes the page, failed step, expected result and notes. Restore the test mark afterward.'),
        step('Run source checks for all pages.', 'Every listed HTML page receives a source report. Functional behavior is never marked as passed by source checks.')
    ] }
];
