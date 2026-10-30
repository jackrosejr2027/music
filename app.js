/**
 * Main Application Class
 * Controls the UI, fretboard, and audio playback
 */
const APP_STORAGE = (() => {
    try { return window.localStorage; } catch (error) { return null; }
})();
function readAppStorage(key) {
    try { return APP_STORAGE ? APP_STORAGE.getItem(key) : null; } catch (error) { return null; }
}
function writeAppStorage(key, value) {
    try { if (APP_STORAGE) APP_STORAGE.setItem(key, value); } catch (error) { /* Storage is optional for app startup. */ }
}
function removeAppStorage(key) {
    try { if (APP_STORAGE) APP_STORAGE.removeItem(key); } catch (error) { /* Storage is optional for app startup. */ }
}

class App {
    constructor() {
        // Initialize music theory and fretboard
        this.musicTheory = new MusicTheory();
        this.fretboard = new Fretboard('fretboard', this.musicTheory);
        
        // Audio synth (created lazily on first play - see app-playback.js)
        this.synth = null;
        
        // State
        this.slideshowItems = [];
        this.generatedPatterns = [];
        this.tempo = 120; // Default tempo (BPM)
        this.customFilename = null; // Custom filename for exports
        // Migrate the former open-by-default state once; future explicit toggles are remembered.
        if (!readAppStorage('sidebar-default-hidden-v1')) {
            writeAppStorage('sidebarVisible', 'false');
            writeAppStorage('sidebar-default-hidden-v1', '1');
        }
        this.sidebarVisible = readAppStorage('sidebarVisible') === 'true';
        
        // NEW: Set titleVisible to true by default
        this.titleVisible = true;
        
        // Initialize collapsed state for sections
        try {
            this.collapsedSections = JSON.parse(readAppStorage('collapsedSections') || 'null') || {};
        } catch (e) {
            this.collapsedSections = {};
        }
        
        // Instrument presets
        // removed this.instrumentPresets data object
        this.instrumentPresets = typeof INSTRUMENT_PRESETS !== 'undefined' ? INSTRUMENT_PRESETS : {};
        
        // Add 50 default chord progression patterns.
        this.chordProgressionPatterns = [];
        for (let i = 1; i <= 50; i++) {
            this.chordProgressionPatterns.push({
                id: 'cp' + i,
                name: 'Chord Progression ' + i,
                progression: 'I:4 IV:4 V:4'
            });
        }
        
        // removed lessons data initialization -> moved to app-lessons-data.js
        if (typeof this.initLessonsData === 'function') this.initLessonsData();
        
        // Audio & Components
        this.audioPlayer = typeof AudioPlayer !== 'undefined' ? new AudioPlayer(this) : null;
        
        // State
        this.slideshowItems = [];
        this.generatedPatterns = [];
        this.tempo = 120; // Default tempo (BPM)
        this.customFilename = null; // Custom filename for exports
        
        // Initialize the UI
        this.initUI();
    }
    
    // removed initSynth() {} -> moved to app-playback.js
    
    /**
     * Initialize the UI and set up event listeners
     */
    initUI() {
        // Add backdrop for sidebar
        const backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        backdrop.addEventListener('click', () => this.toggleSidebar());
        document.body.appendChild(backdrop);
        
        // NEW: Inject bottom controls before they are referenced
        if (typeof this.injectBottomControls === 'function') {
            this.injectBottomControls();
        }

        // Add instrument and tuning dropdowns
        this.addInstrumentDropdowns();
        
        // Populate theme dropdowns (Must happen before loading default settings)
        this.populateThemeDropdowns();

        // Set up tuning input based on default string count
        this.updateTuningInputs();

        // Load and apply default settings (This also updates the pattern select and sets its value)
        this.loadAndApplyDefaultSettings();
        
        // Populate custom color inputs
        this.createCustomColorInputs();
        
        // Update string and fret input displays
        this.updateStringAndFretLabels();
        
        // Add fret number options
        this.addFretNumberOptions();
        
        // Add note appearance options
        this.addNoteAppearanceOptions();
        
        // Add string appearance options
        this.addStringAppearanceOptions();
        
        // Add fret appearance options
        this.addFretAppearanceOptions();
        
        // Add tempo control
        this.addTempoControl();
        
        // Add theory info display options
        this.addTheoryInfoOptions();
        
        // Init piano functionality
        if (typeof Piano !== 'undefined') {
            Piano.init(this);
        }
        
        // Add Piano controls
        this.addPianoControls();
        
        // Move control buttons
        this.moveControlButtons();
        
        this.organizeAppearanceControls();

        // Set up event listeners
        this.setupEventListeners();
        
        // Initial fretboard draw
        this.updateFretboard();
        
        // Show music theory info
        this.updateTheoryInfo();

        // Check URL params to auto-open a pattern on load (e.g., fretboard.html?patternType=scale&pattern=major&key=C)
        try {
            const params = new URLSearchParams(window.location.search);
            const pType = params.get('patternType');
            const pPattern = params.get('pattern');
            const pKey = params.get('key');
            if (pType) {
                const patternTypeSelect = document.getElementById('pattern-type');
                if (patternTypeSelect) {
                    patternTypeSelect.value = pType;
                    this.updatePatternSelect();
                }
                if (['interval', 'chord', 'scale'].includes(pType)) {
                    const instrumentSelect = document.getElementById('instrument-select');
                    if (instrumentSelect) {
                        instrumentSelect.value = 'acoustic_guitar';
                        instrumentSelect.dispatchEvent(new Event('change'));
                    } else {
                        this.applyTuningPreset('acoustic_guitar', 'standard');
                    }
                }
            }
            if (pPattern) {
                const patternSelect = document.getElementById('pattern-select');
                if (patternSelect) {
                    // Only set if option exists (updatePatternSelect ensures options are populated)
                    const isValid = Array.from(patternSelect.options).some(o => o.value === pPattern);
                    if (isValid) patternSelect.value = pPattern;
                }
            }
            if (pKey) {
                const keySelect = document.getElementById('key-select');
                if (keySelect) {
                    // Accept sharps and flats passed in URL (v1.0: flats are mapped to the sharp names used by the selector)
                    const k = this.musicTheory.toSharp ? this.musicTheory.toSharp(pKey) : pKey;
                    if (Array.from(keySelect.options).some(o => o.value === k)) {
                        keySelect.value = k;
                    }
                }
            }
            const pDisplay = params.get('display');
            if (pDisplay && ['intervals', 'notes', 'roman', 'solfege', 'none'].includes(pDisplay)) {
                const displaySelect = document.getElementById('display-mode');
                if (displaySelect) {
                    displaySelect.value = pDisplay;
                    displaySelect.dispatchEvent(new Event('change'));
                }
            }
            const favoriteId = params.get('favorite');
            if (favoriteId) {
                try {
                    const saved = JSON.parse(readAppStorage('st_favorites_v1') || '[]');
                    const favorite = Array.isArray(saved) && saved.find(item => item && item.type === 'fretboard-diagram' && item.id === favoriteId);
                    const data = favorite && favorite.data;
                    const patternType = document.getElementById('pattern-type');
                    const pattern = document.getElementById('pattern-select');
                    const key = document.getElementById('key-select');
                    const tuning = data && data.tuning;
                    if (data && ['scale', 'chord', 'interval', 'custom', 'gamut'].includes(data.patternType) &&
                        typeof data.patternId === 'string' && typeof data.key === 'string' &&
                        Array.isArray(tuning) && tuning.length >= 1 && tuning.length <= 14 &&
                        tuning.every(note => this.musicTheory.notes.includes(note))) {
                        if (patternType) { patternType.value = data.patternType; this.updatePatternSelect(); }
                        if (pattern && Array.from(pattern.options).some(option => option.value === data.patternId)) pattern.value = data.patternId;
                        const savedKey = this.musicTheory.toSharp(data.key);
                        if (key && Array.from(key.options).some(option => option.value === savedKey)) key.value = savedKey;
                        const start = Number(data.startFret), end = Number(data.endFret);
                        if (Number.isInteger(start) && start >= 0 && start <= 24 && Number.isInteger(end) && end >= start && end <= 24) {
                            document.getElementById('start-fret').value = String(start);
                            document.getElementById('end-fret').value = String(end);
                        }
                        const stringCount = document.getElementById('string-count');
                        if (stringCount) { stringCount.value = String(tuning.length); this.updateTuningInputs(tuning.slice()); }
                        if (['intervals', 'notes', 'roman', 'solfege', 'none'].includes(data.displayMode)) document.getElementById('display-mode').value = data.displayMode;
                        const capoEnable = document.getElementById('capo-enable');
                        const capoFret = document.getElementById('capo-fret');
                        if (capoEnable) capoEnable.checked = !!data.capoEnabled;
                        if (capoFret && Number.isInteger(Number(data.capo)) && Number(data.capo) >= 0 && Number(data.capo) <= 24) capoFret.value = String(Number(data.capo));
                        const restorePerString = (selector, values, checkboxes = false) => {
                            if (!Array.isArray(values)) return;
                            document.querySelectorAll(selector).forEach((input, index) => {
                                if (values[index] === undefined || values[index] === null) return;
                                if (checkboxes) input.checked = !!values[index];
                                else if (Number.isInteger(Number(values[index])) && Number(values[index]) >= 0 && Number(values[index]) <= 24) input.value = String(Number(values[index]));
                            });
                        };
                        restorePerString('.show-string-notes', data.visibleStrings, true);
                        restorePerString('.string-start-fret', data.stringStartFrets);
                        restorePerString('.string-end-fret', data.stringEndFrets);
                    }
                } catch (error) { console.warn('Could not restore the saved fretboard diagram.'); }
            }
            // If any parameter was present, apply to fretboard
            if (pType || pPattern || pKey || favoriteId) {
                // Ensure UI selections applied then redraw
                this.updateFretboard();
            }
            // v1.0: honour ?action=play / ?action=learn sent by the Scales & Chords pages
            // (previously ignored). Browsers need a user gesture before audio can start, so
            // playback starts on the first tap/click/key press.
            const action = params.get('action');
            if (action === 'play') {
                const go = () => {
                    window.removeEventListener('pointerdown', go, true);
                    window.removeEventListener('keydown', go, true);
                    this.playCurrentPattern();
                };
                window.addEventListener('pointerdown', go, true);
                window.addEventListener('keydown', go, true);
                if (window.ST && ST.toast) setTimeout(() => ST.toast('Tap or click anywhere to hear it', 4000), 300);
            } else if (action === 'learn' && typeof this.openLessonPage === 'function') {
                const fb = this.fretboard;
                setTimeout(() => this.openLessonPage(fb.currentKey, fb.currentPatternType, fb.currentPattern), 200);
            }
        } catch (err) {
            console.warn('Error parsing URL params:', err);
        }

        // Listen for data changes from Application Data page
        window.addEventListener('storage', (e) => {
            if (e.key === 'manic_rules_custom_data') {
                this.musicTheory.loadCustomData();
                this.updateFretboard();
            }
        });
        
        // Add melodic pattern handling
        this.setupMelodicPatternControls();
        
        // Setup chromatic tuner
        this.setupChromaticTuner();
        
        // Setup collapsible sections
        this.setupCollapsibleSections();
        
        // Add theme switching functionality
        this.setupThemeSwitching();
        
        // Init sidebar state based on user preference
        const sidebar = document.querySelector('.sidebar');
        if (this.sidebarVisible) {
            sidebar.classList.add('sidebar-visible');
            backdrop.classList.add('visible');
        } else {
            sidebar.classList.remove('sidebar-visible');
            backdrop.classList.remove('visible');
        }
    }
    
    // removed toggleSidebar() {} -> moved to app-ui-layout.js
    
    // removed setupEventListeners() {} -> moved to app-events.js
    // removed updateTuningInputs() {} -> moved to app-instrument.js
    // removed updatePatternSelect() {} -> moved to app-ui.js
    // removed populateThemeDropdowns() {} -> moved to app-ui.js
    // removed createCustomColorInputs() {} -> moved to app-ui-appearance.js
    // removed addColorPicker() {} -> moved to app-ui-appearance.js
    
    // removed updateStringAndFretLabels() {} -> moved to app-state.js
    // removed getCurrentTuning() {} -> moved to app-state.js
    // removed getVisibleStrings() {} -> moved to app-state.js
    // removed getStringStartFrets() {} -> moved to app-state.js
    // removed getStringEndFrets() {} -> moved to app-state.js
    // removed getCustomColors() {} -> moved to app-state.js
    // removed updateFretboard() {} -> moved to app-state.js
    
    // removed playCurrentPattern() {} -> moved to app-playback.js
    // removed animateNoteMarker() {} -> moved to app-playback.js
    
    // removed addToSlideshow() {} -> moved to slideshow.js
    // removed updateSlideshowDisplay() {} -> moved to slideshow.js
    // removed playSlideshow() {} -> moved to slideshow.js
    // removed waitWithStop() {} -> moved to slideshow.js
    // removed exportCurrentDiagram() {} -> moved to app-export.js
    // removed exportAll() {} -> moved to app-export.js
    // removed exportAllDiagramsOnly() {} -> moved to app-export.js
    // removed setCustomFilename() {} -> moved to app-export.js
    // removed clearSlideshow() {} -> moved to slideshow.js
    
    // removed pattern generator logic -> moved to pattern-generator.js
    
    /**
     * Add slideshow duration input to controls
     */
    addSlideshowDurationInput() {
        // This function is now handled differently - the elements are directly in the HTML
        // We can keep this method for compatibility, but it doesn't need to add elements
    }
    

    
    /**
     * Add tempo control to the fretboard controls
     */
    addTempoControl() {
        // We've moved this to moveControlButtons, 
        // so this method remains but doesn't add to the DOM directly
    }
    
    // removed moveControlButtons() {} -> moved to app-ui-layout.js
    
    // removed addTheoryInfoOptions() {} -> moved to app-theory-info.js
    // removed updateTheoryInfo() {} -> moved to app-theory-info.js
    // removed addScaleDescription() {} -> moved to app-theory-info.js
    // removed addInfoItem() {} -> moved to app-theory-info.js
    // removed getRelatedModes() {} -> moved to music-theory.js
    // removed getChordInversions() {} -> moved to music-theory.js
    // removed getScaleDescription() {} -> moved to music-theory.js
    // removed getChordDescription() {} -> moved to music-theory.js
    // removed getIntervalQuality() {} -> moved to music-theory.js
    // removed getIntervalConsonance() {} -> moved to music-theory.js
    // removed openLessonPage() {} -> moved to app-theory-info.js
    // removed populateLessonTheoryDetails() {} -> moved to app-theory-info.js
    
    // removed toggleSidebar() {} -> moved to app-ui-layout.js

    // removed showLessonEditorButton(), removeLessonEditorButton(), openLessonEditor() -> moved to app-theory-lessons.js
    // removed setupMelodicPatternControls() -> moved to melodic-patterns.js
    
    // removed playMelodicPattern() {}
    // removed extrapolatePattern() {}
    // removed stopMelodicPattern() {}
    
}
    
