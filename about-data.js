const ABOUT_FEATURES_DATA = [
    {
        category: "1. Layout & Fretboard Engine",
        items: [
            { name: "1. Dynamic String Count", path: "Sidebar > Instrument Setup > Number of Strings" },
            { name: "2. Dynamic Fret Range", path: "Bottom Controls > Start Fret / End Fret" },
            { name: "3. Custom Fret Spacing", path: "Sidebar > Appearance > Fret Appearance > Fret Thickness" },
            { name: "4. Custom String Height", path: "Sidebar > Appearance > String Appearance > String Thickness" },
            { name: "5. Fret Number Placement", path: "Sidebar > Appearance > Fret Numbers > Placement (Below/Above)" },
            { name: "6. Fret Number Alignment", path: "Sidebar > Appearance > Fret Numbers > Alignment" },
            { name: "7. Fret Number Sizing", path: "Sidebar > Appearance > Fret Numbers > Size (px)" },
            { name: "8. Fret Number Vertical Offset", path: "Sidebar > Appearance > Fret Numbers > Vertical Offset" },
            { name: "9. Fret Marker Placement", path: "Sidebar > Appearance > Fret Numbers > Fret Marker Placement" },
            { name: "10. Fret Marker Offset", path: "Sidebar > Appearance > Fret Numbers > Marker Offset" },
            { name: "11. Responsive Viewport Scaling", path: "Automatic upon resizing browser window" },
            { name: "12. Hide Fretboard Elements", path: "Bottom Controls > Toggle \"👁\" to hide UI" }
        ]
    },
    {
        category: "2. Instrument & Tuning Setup",
        items: [
            { name: "13. Instrument Selection", path: "Sidebar > Instrument Setup > Instrument" },
            { name: "14. Standard Guitar Tuning", path: "Sidebar > Instrument Setup > Tuning Preset > Standard" },
            { name: "15. Alternate Tuning Presets", path: "Sidebar > Instrument Setup > Tuning Preset > Alternate" },
            { name: "16. Custom Individual String Tuning", path: "Sidebar > Instrument Setup > String N Dropdown" },
            { name: "17. Global Tuning Shift (Up)", path: "Sidebar > Instrument Setup > Tuning Preset > '+'" },
            { name: "18. Global Tuning Shift (Down)", path: "Sidebar > Instrument Setup > Tuning Preset > '-'" },
            { name: "19. Flip String Order (Lefty)", path: "Sidebar > Instrument Setup > Flip String Order" },
            { name: "20. Bass Guitar Support", path: "Sidebar > Instrument Setup > Instrument (Select 4, 5, 6 strings)" },
            { name: "21. Ukulele Support", path: "Sidebar > Instrument Setup > Instrument (Soprano, Tenor, Baritone)" },
            { name: "22. Banjo Support", path: "Sidebar > Instrument Setup > Instrument" },
            { name: "23. Orchestral Strings", path: "Sidebar > Instrument Setup > Instrument (Violin, Cello, Viola)" },
            { name: "24. Exotic Instruments", path: "Sidebar > Instrument Setup > Instrument (Sitar, Koto, Oud)" }
        ]
    },
    {
        category: "3. Fretspan & View Control",
        items: [
            { name: "25. Fretspan Presets", path: "Sidebar > Instrument Setup > Fretspan Presets" },
            { name: "26. Open 4-Fret Span View", path: "Sidebar > Instrument Setup > Fretspan Presets > Open 4 Fret Span" },
            { name: "27. Single String Isolation", path: "Sidebar > Instrument Setup > Fretspan Presets > Show Only String N" },
            { name: "28. String Pair Isolation", path: "Sidebar > Instrument Setup > Fretspan Presets > Show Only Strings X & Y" },
            { name: "29. String Triplet Isolation", path: "Sidebar > Instrument Setup > Fretspan Presets > Show Strings X,Y,Z" },
            { name: "30. Hide Specific Strings", path: "Sidebar > Instrument Setup > String N > Uncheck \"Show\"" },
            { name: "31. Custom Start Fret Per String", path: "Sidebar > Instrument Setup > String N > Start" },
            { name: "32. Custom End Fret Per String", path: "Sidebar > Instrument Setup > String N > End" },
            { name: "33. Save Custom Fretspan", path: "Sidebar > Instrument Setup > Fretspan Presets > Save Current" }
        ]
    },
    {
        category: "4. Music Theory Engine",
        items: [
            { name: "34. Root Key Selection", path: "Bottom Controls > Key" },
            { name: "35. Scale Visualization", path: "Bottom Controls > Pattern Type > Scale" },
            { name: "36. Chord Visualization", path: "Bottom Controls > Pattern Type > Chord" },
            { name: "37. Interval Visualization", path: "Bottom Controls > Pattern Type > Interval" },
            { name: "38. Gamut Visualization", path: "Bottom Controls > Pattern Type > Gamut" },
            { name: "39. 3-Fret Grid Visualization", path: "Bottom Controls > Pattern Type > Grid" },
            { name: "40. 2-Fret Grid Visualization", path: "Bottom Controls > Pattern Type > Grid (2-Fret Spans)" },
            { name: "41. Extensive Scale Library", path: "Bottom Controls > Pattern (Hundreds of scales)" },
            { name: "42. Extensive Chord Library", path: "Bottom Controls > Pattern (Triads, 7ths, Extensions)" },
            { name: "43. Chromatic Pattern Support", path: "Bottom Controls > Pattern > Chromatic" }
        ]
    },
    {
        category: "5. Display Modes & Appearance",
        items: [
            { name: "44. Display Mode: Intervals", path: "Bottom Controls > Display Mode > Intervals" },
            { name: "45. Display Mode: Notes", path: "Bottom Controls > Display Mode > Notes" },
            { name: "46. Display Mode: Roman Numerals", path: "Bottom Controls > Display Mode > Roman Numerals" },
            { name: "47. Display Mode: Solfège (Do Re Mi)", path: "Bottom Controls > Display Mode > Solfège" },
            { name: "48. Display Mode: No Text", path: "Bottom Controls > Display Mode > No Text" },
            { name: "49. Page Theme Selection", path: "Bottom Controls > Page Theme (Dark, Light, Retro, etc.)" },
            { name: "50. Base Font Size Scaling", path: "Bottom Controls > Base Font Size" },
            { name: "51. Fretboard Color Theme", path: "Bottom Controls > Color Theme" },
            { name: "52. Custom Fretboard Colors", path: "Bottom Controls > Color Theme > Custom" },
            { name: "53. Custom Interval Coloring", path: "Sidebar > Appearance > Custom Colors > Interval Colors" },
            { name: "54. Invert Custom Colors", path: "Sidebar > Appearance > Custom Colors > Invert Colors Button" }
        ]
    },
    {
        category: "6. Note Marker Customization",
        items: [
            { name: "55. Note Marker Size", path: "Sidebar > Appearance > Note Appearance > Note Size" },
            { name: "56. Note Marker Shape", path: "Sidebar > Appearance > Note Appearance > Note Shape (40+ shapes)" },
            { name: "57. Note Marker Font", path: "Sidebar > Appearance > Note Appearance > Font" },
            { name: "58. Note Marker Font Size", path: "Sidebar > Appearance > Note Appearance > Font Size" },
            { name: "59. Note Marker Visual Effects", path: "Sidebar > Appearance > Note Appearance > Effect (50+ effects)" },
            { name: "60. Note Marker Gradient", path: "Sidebar > Appearance > Note Appearance > Use Gradient" },
            { name: "61. Note Vertical Offset", path: "Sidebar > Appearance > Note Appearance > Vertical Offset" },
            { name: "62. Context Menu Edit Single Note", path: "Click any note marker directly on the fretboard" },
            { name: "63. Context Menu Edit Multiple Notes", path: "Ctrl/Cmd + Click multiple notes on the fretboard" },
            { name: "64. Custom Color Per Note", path: "Click note marker > Select color from picker" },
            { name: "65. Set Note as New Root", path: "Click note marker > Click \"Set as Root\"" },
            { name: "66. Remove Specific Note", path: "Click note marker > Click \"Remove Note\"" }
        ]
    },
    {
        category: "7. String & Fret Styling",
        items: [
            { name: "67. Change String Thickness", path: "Sidebar > Appearance > String Appearance > String Thickness" },
            { name: "68. Change String Style", path: "Sidebar > Appearance > String Appearance > String Style (Dashed, wave, etc.)" },
            { name: "69. Toggle String Gradient", path: "Sidebar > Appearance > String Appearance > Use Gradient" },
            { name: "70. Apply String Effect", path: "Sidebar > Appearance > String Appearance > Effect (Glow, shadow, etc.)" },
            { name: "71. Adjust String Spacing", path: "Sidebar > Appearance > String Appearance > String Spacing" },
            { name: "72. Adjust String Opacity", path: "Sidebar > Appearance > String Appearance > String Opacity" },
            { name: "73. Change Fret Style", path: "Sidebar > Appearance > Fret Appearance > Fret Style" },
            { name: "74. Change Fret Thickness", path: "Sidebar > Appearance > Fret Appearance > Fret Thickness" }
        ]
    },
    {
        category: "8. Playback & Audio",
        items: [
            { name: "75. Play Current Pattern", path: "Fretboard Controls > Play Pattern" },
            { name: "76. Adjust Global Tempo", path: "Fretboard Controls > Tempo Slider" },
            { name: "77. PolySynth Audio Engine", path: "Automatic during playback with reverb mapping" },
            { name: "78. Melodic Pattern Playback", path: "Sidebar > Melodic Patterns > Play" },
            { name: "79. Select Built-in Melodic Sequence", path: "Sidebar > Melodic Patterns > Pattern (40+ sequences)" },
            { name: "80. Custom Melodic Sequence", path: "Sidebar > Melodic Patterns > Custom Sequence" },
            { name: "81. Reverse Melodic Pattern", path: "Sidebar > Melodic Patterns > Reverse Pattern" },
            { name: "82. Step Melodic Pattern", path: "Sidebar > Melodic Patterns > Step" },
            { name: "83. Metronome Audio Click", path: "Automatic during Slideshow playback" },
            { name: "84. Chromatic Tuner Interface", path: "Sidebar > Chromatic Tuner > Show Chromatic Tuner" },
            { name: "85. Tuner Octave Selection", path: "Sidebar > Chromatic Tuner > Octave dropdown" },
            { name: "86. Interactive Piano Keyboard", path: "Sidebar > Piano Keyboard > Show/Hide Piano" },
            { name: "87. Visual Note Pulsing", path: "Notes pulse visually as audio plays on fretboard" }
        ]
    },
    {
        category: "9. Slideshows & Automation",
        items: [
            { name: "88. Add Diagram to Slideshow", path: "Fretboard Controls > Add to Slideshow" },
            { name: "89. Play Slideshow Automations", path: "Sidebar > Slideshow > Play Slideshow" },
            { name: "90. Slideshow BPM Adjustment", path: "Sidebar > Slideshow > Slideshow BPM" },
            { name: "91. Toggle Slideshow Looping", path: "Sidebar > Slideshow > Loop Checkbox" },
            { name: "92. Slideshow Slide Duration", path: "Sidebar > Slideshow > Duration (Measures)" },
            { name: "93. Interactive Countdown Overlay", path: "Appears at bottom during slideshow playback" },
            { name: "94. Delete Specific Slides", path: "Click 'x' on any slide thumbnail" },
            { name: "95. Clear Entire Slideshow", path: "Sidebar > Slideshow > Clear Slideshow" },
            { name: "96. Circle of Fifths Loop", path: "Export Section > Play Circle of Fifths Loop" },
            { name: "97. Circle of Fourths Loop", path: "Export Section > Play Circle of Fourths Loop" }
        ]
    },
    {
        category: "10. Exporting & Image Generation",
        items: [
            { name: "98. Export Current Diagram (JPG)", path: "Fretboard Controls > Export Diagram" },
            { name: "99. Export All Slideshow Items", path: "Sidebar > Slideshow > Export All" },
            { name: "100. Export Slideshow Diagrams Only", path: "Sidebar > Slideshow > Export Diagrams Only" },
            { name: "101. Set Custom Filename Prefix", path: "Sidebar > Slideshow > Set Filename" },
            { name: "102. Toggle Theory Info in Export", path: "Sidebar > Export > Include Key/Pattern info in JPGs" },
            { name: "103. Bulk Export All Scales ZIP", path: "Bottom Footer > Save All Scales as ZIP" },
            { name: "104. Bulk Export All Chords ZIP", path: "Bottom Footer > Save All Chords as ZIP" },
            { name: "105. Bulk Export All Intervals ZIP", path: "Bottom Footer > Save All Intervals as ZIP" },
            { name: "106. Bulk Export All Gamuts ZIP", path: "Bottom Footer > Save All Gamuts as ZIP" },
            { name: "107. Bulk Export All Strings / Scales", path: "Sidebar > Export > Save All Scales (1-Max) ZIP" }
        ]
    },
    {
        category: "11. Theory Info & Pattern Generation",
        items: [
            { name: "108. Theory Info Panel", path: "Displays detailed text analysis below the diagram" },
            { name: "109. Toggle Theory Panel Visibility", path: "Sidebar > Music Theory > Show/Hide Info Panel" },
            { name: "110. Toggle Theory Title", path: "Sidebar > Music Theory > Show/Hide Title" },
            { name: "111. Toggle Spelling/Formula", path: "Sidebar > Music Theory > Scale/Chord Spelling" },
            { name: "112. Toggle Pattern Quality", path: "Sidebar > Music Theory > Quality" },
            { name: "113. Toggle Related Modes", path: "Sidebar > Music Theory > Modes" },
            { name: "114. Toggle Chord Inversions", path: "Sidebar > Music Theory > Inversions" },
            { name: "115. Generate All Intervals Grid", path: "Sidebar > Pattern Generator > All Intervals" },
            { name: "116. Generate All Scales Grid", path: "Sidebar > Pattern Generator > All Scales" },
            { name: "117. Generate All Chords Grid", path: "Sidebar > Pattern Generator > All Chords" },
            { name: "118. Add Generated Grids to Slideshow", path: "Pattern Generator > Add All to Slideshow" }
        ]
    },
    {
        category: "12. Advanced Pages & Explorers",
        items: [
            { name: "119. Scales Explorer Page", path: "Top Navigation > Scales (Search and filter scales)" },
            { name: "120. Chords Explorer Page", path: "Top Navigation > Chords (Filter chords by interval)" },
            { name: "121. Intervals Explorer Page", path: "Top Navigation > Intervals (Map intervals to chords)" },
            { name: "122. Application Data Editor", path: "Top Navigation > Data (Edit root JSON tables)" },
            { name: "123. Export App Data to XLSX", path: "Data Page > Export to XLSX" },
            { name: "124. Interactive Lessons Page", path: "Top Navigation > Lessons" },
            { name: "125. Favorite Marking System", path: "Click the star icon on any explorer page to save favorites" }
        ]
    },
    {
        category: "13. Learning, Exports & Offline (v1.0)",
        items: [
            { name: "126. Structured Courses", path: "Learn > Courses (step lists with progress)" },
            { name: "127. Generated Quizzes", path: "Learn > Quizzes (8 topics, endless questions)" },
            { name: "128. Timed Tests", path: "Learn > Tests (6 tests with countdown)" },
            { name: "129. Graded Exams + PDF Certificate", path: "Learn > Exams" },
            { name: "130. Chord Progression Builder", path: "Learn > Chord Progressions" },
            { name: "131. Offline PDF eBooks", path: "Learn > eBooks (PDF)" },
            { name: "132. Ideas & Notes Notebook", path: "Learn > Ideas & Notes" },
            { name: "133. Favorites Page with PDF", path: "My Data > Favorites" },
            { name: "134. Progress Dashboard", path: "My Data > Progress (streak, heatmap, results)" },
            { name: "135. Export Diagram as PDF / PNG", path: "Fretboard > Export PDF button / export menu" },
            { name: "136. Pattern in All 12 Keys PDF", path: "Fretboard > export menu > PDF" },
            { name: "137. Slideshow to PDF", path: "Slideshow controls > PDF button" },
            { name: "138. Data Tables to CSV / PDF", path: "Data page > each tab" },
            { name: "139. Full Backup & Restore", path: "My Data > Settings > Backup / Restore" },
            { name: "140. Works Offline / Installable", path: "Complete the full HTTPS/localhost cache install first; verify readiness in Admin or Release Notes" }
        ]
    }
];
ABOUT_FEATURES_DATA.push(
    { category: '14. Independent Diagrams & Current-Key PDFs', items: [
        { name: 'Up to 20 diagrams', path: 'Fretboard > Controls > Instrument > diagram count / Edit diagram' },
        { name: 'Multi-Instrument preset', path: 'Fretboard > Controls > Instrument > Fretboard diagrams > Multi-Instrument (25 diagrams). Acoustic guitar, electric guitar, bass, ukulele, violin, piano, mandolin, banjo, cello, viola, double bass, harp, sitar, oud and koto, followed by 10 alternate guitar/bass tunings. Titles describe instrument, strings/keys, tuning and assumptions. Piano shows 24 keys starting on the selected key at octave 4; harp shows 47 unaltered-pedal pitches; koto shows a 13-string D-based example. Sitar models 7 main/drone strings, not sympathetic strings. Mandolin and oud model paired physical strings. Key/type/selection stay independent; pitch-class playback is not an octave-calibrated instrument simulation. Reference maps have no frets or capo; Gamut only highlights explicit open-position entries.' },
        { name: 'Gauntlet preset', path: 'Fretboard > Controls > Instrument > Fretboard diagrams > Gauntlet (20 diagrams). Single-target studies use two-string EA/AD/DG/GB/BE boards with the higher string notes hidden; adjacent-string sets are followed by standard six-string views showing 6/4/1, 5/3/1 and 4/2/1. Numeric 1-20 options remain available.' },
        { name: 'Independent diagram setups', path: 'Key, type, pattern selection, instrument, tuning, string count, overall range, per-string tuning, Show, Start and End are retained per diagram; appearance stays shared. Controls above each board work for numeric multi-diagram and Gauntlet sets, including Gamut patterns. Main controls, playback and single-diagram exports follow the selected editor. New boards inherit the selected diagram before being independently edited.' },
        { name: 'All-diagram collection PDFs', path: 'Controls > Export > all diagrams / all scales, chords or intervals; current key only; one page per pair; intervals ordered by semitones.' },
        { name: 'Safe long-running exports', path: 'Confirm over 150 pages; Stop saves completed pages; snapshot renderer preserves live diagram state and selection.' }
    ] },
    { category: '15. Preserved Studios & Study Catalog', items: [
        { name: 'Pattern Studio', path: 'daw.html > 500 local patterns, block arranger, saved sequences, MIDI and compiled all-pattern ZIP.' },
        { name: 'Cadence Map', path: 'cadence-map/index.html > minor palette, seven modes, all keys, shape/length filters, playback, paging and expanded/compact TXT.' },
        { name: 'Theory Decks suite', path: 'theory-decks/index.html > cards/games, bar-based DAW with MIDI import, companion fretboard, references and dedicated settings.' },
        { name: 'Expanded eBooks', path: 'ebooks.html > 200 grouped local PDF guides, configurable tuning, all-key references, detailed addenda, ZIP and full data index.' },
        { name: 'Primer and Theory Cards', path: 'primer.html > learning map; theory-cards/index.html > 612 flashcards.' }
    ] },
    { category: '16. Administration, Testing & Offline Package', items: [
        { name: 'Default / Custom Home', path: 'Admin > App view: restore the pre-consolidation dashboard, or build Home/shared navigation from saved Show/Hide choices. Both Home URLs retain an Admin link.' },
        { name: 'Complete page and asset inventory', path: 'Admin and this page > every HTML entry and every manifest file, grouped with local links.' },
        { name: 'Non-destructive show/hide', path: 'Admin > in Custom setup page switches affect Home and shared header eligibility on this device; asset detail switches only fold inventory text. Direct URLs, caches, ZIPs and dependencies remain intact.' },
        { name: 'Manual and source testing', path: 'testing.html > scripts, expected results, offline step, saved marks/notes and copyable feedback prompts; source checks are not functional passes.' },
        { name: 'One complete offline manifest', path: 'offline-assets.js > both installers and ZIP exporters; local libraries, fonts/licenses, datasets, icons/audio and retained UI files.' },
        { name: 'Offline packaging and recovery', path: 'Admin / Release Notes > Download Offline ZIP; extracted packages use localhost. Reconnect to complete an interrupted install; never clear user data as a repair shortcut.' }
    ] }
);
