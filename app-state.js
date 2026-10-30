if (typeof App !== 'undefined') {
    /**
     * Update string and fret input displays
     */
    App.prototype.updateStringAndFretLabels = function() {
        const stringCount = document.getElementById('string-count').value;
        const piano = document.getElementById('instrument-select')?.value === 'piano';
        document.querySelector('label[for="string-count"]').textContent = `${piano ? "Number of Keys" : "Number of Strings"} (${stringCount}):`;
        
        const startFret = document.getElementById('start-fret').value;
        document.querySelector('label[for="start-fret"]').textContent = `First visible fret (${startFret}):`;
        
        const endFret = document.getElementById('end-fret').value;
        document.querySelector('label[for="end-fret"]').textContent = `Last visible fret (${endFret}):`;
    };

    App.prototype.getCurrentTuning = function() {
        const tuning = [];
        const selects = document.querySelectorAll('.tuning-select');
        selects.forEach(select => {
            tuning[parseInt(select.getAttribute('data-string'))] = select.value;
        });
        return tuning;
    };

    App.prototype.getVisibleStrings = function() {
        const visibleStrings = [];
        const checkboxes = document.querySelectorAll('.show-string-notes');
        checkboxes.forEach(checkbox => {
            visibleStrings[parseInt(checkbox.getAttribute('data-string'))] = checkbox.checked;
        });
        return visibleStrings;
    };

    App.prototype.getStringStartFrets = function() {
        const stringStartFrets = [];
        const startFretInputs = document.querySelectorAll('.string-start-fret');
        startFretInputs.forEach(input => {
            stringStartFrets[parseInt(input.getAttribute('data-string'))] = parseInt(input.value) || 0;
        });
        return stringStartFrets;
    };

    App.prototype.getStringEndFrets = function() {
        const stringEndFrets = [];
        const endFretInputs = document.querySelectorAll('.string-end-fret');
        endFretInputs.forEach(input => {
            const fret = parseInt(input.value);
            stringEndFrets[parseInt(input.getAttribute('data-string'))] = Number.isNaN(fret) ? 24 : fret;
        });
        return stringEndFrets;
    };

    App.prototype.getCustomColors = function() {
        if (document.getElementById('color-theme').value !== 'custom') {
            return {};
        }
        const colors = { intervals: {} };
        document.querySelectorAll('[data-color-key]').forEach(input => {
            const key = input.getAttribute('data-color-key');
            if (key.startsWith('intervals.')) {
                const interval = key.split('.')[1];
                colors.intervals[interval] = input.value;
            } else {
                colors[key] = input.value;
            }
        });
        return colors;
    };

    App.prototype.updateFretboard = function() {
        const getVal = (id, def = 0) => {
            const el = document.getElementById(id);
            return el ? el.value : def;
        };
        const getInt = (id, def = 0) => parseInt(getVal(id, def)) || def;
        const getChecked = (id, def = false) => {
            const el = document.getElementById(id);
            return el ? el.checked : def;
        };

        let sf = getInt('start-fret', 0);
        let ef = getInt('end-fret', 12);
        if (sf > ef) {
            sf = ef;
            if (document.getElementById('start-fret')) document.getElementById('start-fret').value = sf;
        }
        
        this.updateStringAndFretLabels();
        
        const capoEnabled = getChecked('capo-enable', false);
        const capoFret = parseInt(getVal('capo-fret', 0)) || 0;
        const inlineCapoChecked = document.getElementById('inline-capo-enable')?.checked;
        const inlineCapoFretVal = parseInt(document.getElementById('inline-capo-fret')?.value || 0) || 0;
        // prioritize bottom controls but sync inline if present
        if (inlineCapoChecked !== undefined) {
            if (inlineCapoChecked && !capoEnabled) {
                // if inline enabled but bottom not, set bottom to match when reading
                try { document.getElementById('capo-enable').checked = true; } catch (e) {}
            }
        }

        // Determine final capo state: prefer explicit bottom control if set, otherwise inline; otherwise off.
        const bottomCapoChecked = capoEnabled || false;
        const inlineCapoUsed = !!inlineCapoChecked;
        const finalCapoEnabled = bottomCapoChecked || inlineCapoUsed;
        let finalCapoValue = 0;
        if (finalCapoEnabled) {
            // Prefer explicit bottom control value when the bottom checkbox is checked,
            // otherwise fall back to the inline capo fret input value.
            finalCapoValue = bottomCapoChecked ? (capoFret || 0) : (inlineCapoFretVal || 0);
        } else {
            finalCapoValue = 0; // Ensure capo is off when neither control is enabled
        }

        const diagram = this.diagramSetups?.[this.activeDiagram];
        const referenceLayout = !!diagram?.referenceLayout && diagram.instrument === getVal('instrument-select') && diagram.tuning.length === this.getCurrentTuning().length;
        const settings = {
            instrument: getVal('instrument-select'),
            gamutReferenceKey: diagram?.gamutReferenceKey || null,
            referenceLayout,
            pitchLabels: referenceLayout ? diagram.pitchLabels : null,
            originalTuning: referenceLayout ? diagram.originalTuning : null,
            tuning: this.getCurrentTuning(),
            startFret: sf,
            endFret: ef,
            stringHeight: getInt('string-height', 2),
            fretWidth: getInt('fret-width', 2),
            displayMode: getVal('display-mode', 'intervals'),
            colorTheme: getVal('color-theme', 'default_ii'),
            customColors: this.getCustomColors(),
            forceWhiteBackground: getChecked('force-white-background', false),
            showFretNumbers: getChecked('show-fret-numbers', true),
            fretNumbersShape: getVal('fret-numbers-shape', 'none'),
            capoStyle: getVal('capo-style', 'bar'),
            fretNumbersPlacement: getVal('fret-numbers-placement', 'below'),
            fretNumbersPosition: getVal('fret-numbers-position', 'center'),
            fretNumbersSize: getInt('fret-numbers-size', 12),
            fretNumbersOffset: getInt('fret-numbers-offset', 0),
            fretMarkersPlacement: getVal('fret-markers-placement', 'on'),
            fretMarkersOffset: getInt('fret-markers-offset', 0),
            noteSize: getInt('note-size', 15),
            noteShape: getVal('note-shape', 'circle'),
            noteFont: 'Arial Narrow',
            noteFontSize: getInt('note-font-size', 12),
            noteEffect: getVal('note-effect', 'none'),
            noteGradient: getChecked('note-gradient', false),
            noteOffset: getInt('note-offset', 0),
            stringThickness: getInt('string-height', 2),
            stringStyle: getVal('string-style', 'solid'),
            stringGradient: getChecked('string-gradient', false),
            stringEffect: getVal('string-effect', 'none'),
            stringSpacing: getInt('string-spacing', 30),
            stringOpacity: getInt('string-opacity', 100) / 100,
            visibleStrings: this.getVisibleStrings(),
            stringStartFrets: this.getStringStartFrets(),
            stringEndFrets: this.getStringEndFrets(),
            fretStyle: getVal('fret-style', 'solid'),
            fretThickness: getInt('fret-width', 2),
            // capo settings - finalCapoEnabled controls whether a capo is active; finalCapoValue is 0 when off
            capo: finalCapoValue,
            capoEnabled: !!finalCapoEnabled
        };
        
        this.settings = settings;
        this.fretboard.updateSettings(settings);
        
        const shapeDisplay = document.getElementById('fret-numbers-shape-display');
        if (shapeDisplay) {
            const val = settings.fretNumbersShape;
            if (val === 'none') shapeDisplay.textContent = '∅';
            else if (val === 'pill') shapeDisplay.textContent = '⬭';
            else if (val === 'circle') shapeDisplay.textContent = '○';
            else if (val === 'square') shapeDisplay.textContent = '□';
        }
        
        const key = document.getElementById('key-select').value;
        const patternType = document.getElementById('pattern-type').value;
        const pattern = document.getElementById('pattern-select').value;
        
        if (patternType === 'lesson') {
            const lessonIndex = parseInt(pattern);
            const lesson = this.lessons[lessonIndex];
            if (lesson) {
                // If the lesson targets a specific pattern, apply it
                if (lesson.patternType && lesson.patternId) {
                    this.fretboard.updatePattern(key, lesson.patternType, lesson.patternId);
                } else {
                    this.fretboard.activeNotes = [];
                }
                // Automatically open the lesson overlay if not already visible
                if (!this.infoVisible) {
                    const infoBtn = document.getElementById('toggle-info-button');
                    if (infoBtn) infoBtn.click();
                }
            }
            this.showLessonEditorButton();
        } else if (patternType === 'chord_progression') {
            this.fretboard.activeNotes = [];
        } else if (patternType === 'grid') {
            const gridPosition = parseInt(pattern);
            const startFret = gridPosition;
            const endFret = gridPosition + 2;
            const updatedSettings = { ...this.settings };
            updatedSettings.startFret = startFret;
            updatedSettings.endFret = endFret;
            if (!this.diagramBoards || this.diagramBoards.length === 1) this.fretboard.updateSettings(updatedSettings);
            this.fretboard.updatePattern(key, 'scale', 'major');
        } else if (patternType === 'grid2') {
            const gridPosition = parseInt(pattern);
            const startFret = gridPosition;
            const endFret = gridPosition + 1;
            const updatedSettings = { ...this.settings };
            updatedSettings.startFret = startFret;
            updatedSettings.endFret = endFret;
            if (!this.diagramBoards || this.diagramBoards.length === 1) this.fretboard.updateSettings(updatedSettings);
            this.fretboard.updatePattern(key, 'scale', 'major');
        } else {
            this.removeLessonEditorButton();
            this.fretboard.layoutBase = this.getLayoutBase();
            this.fretboard.updatePattern(key, patternType, pattern);
        }
        
        if (typeof this.syncFretboardDiagrams === 'function') this.syncFretboardDiagrams();

        this.updateTheoryInfo();

        // v1.0: local progress tracking (unique scales/chords/intervals viewed)
        if (window.ST && ST.recordView && ['scale', 'chord', 'interval', 'custom', 'gamut', 'lesson'].includes(patternType)) {
            ST.recordView(patternType, pattern);
        }
        
        const tunerContainer = document.querySelector('.piano-container');
        if (tunerContainer && tunerContainer.style.display !== 'none') this.updatePianoHighlights();
        
        try {
            const disp = document.getElementById('current-pattern-display');
            if (disp && typeof this.updateCurrentPatternDisplay === 'function') {
                // removed inline pattern display builder -> moved to app-ui-pattern-display.js
                this.updateCurrentPatternDisplay(disp);
            }
        } catch (err) {
            console.warn('Error updating current pattern display:', err);
        }
    };
}