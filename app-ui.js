/**
 * UI Builder Extension for App
 * Contains methods to build UI controls
 */
if (typeof App !== 'undefined') {
    /**
     * Update pattern select options based on the selected pattern type
     */
    App.prototype.updatePatternSelect = function(patternType = document.getElementById('pattern-type').value, patternSelect = document.getElementById('pattern-select')) {
        patternSelect.innerHTML = '';
        const layoutGroup = typeof FRETBOARD_LAYOUT_GROUPS !== 'undefined' && FRETBOARD_LAYOUT_GROUPS.find(group => group.id === patternType);
        if (layoutGroup) {
            for (let i = 0; i < FRETBOARD_LAYOUT_SELECTIONS; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = fretboardLayoutSelectionLabel(i);
                patternSelect.appendChild(option);
            }
            return;
        }
        let patterns;
        switch (patternType) {
            case 'scale':
                patterns = this.musicTheory.scales;
                break;
            case 'chord':
                patterns = this.musicTheory.chords;
                break;
            case 'interval':
                patterns = {};
                if (this.musicTheory && this.musicTheory.intervals) {
                    const intervalSemitones = (id, data) => Number.isFinite(data?.semitones)
                        ? data.semitones
                        : this.musicTheory.getIntervalSemitones(id);
                    const intervalEntries = Object.entries(this.musicTheory.intervals)
                        .filter(([id, data]) => Number.isFinite(intervalSemitones(id, data)))
                        .sort(([idA, a], [idB, b]) => {
                            const difference = intervalSemitones(idA, a) - intervalSemitones(idB, b);
                            return difference || String(a?.name || idA).localeCompare(String(b?.name || idB));
                        });
                    for (const [id, data] of intervalEntries) {
                        patterns[id] = data;
                    }
                }
                break;
            case 'gamut':
                patterns = this.musicTheory.gamuts || {};
                break;
            case 'lesson':
                for (let i = 0; i < this.lessons.length; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = this.lessons[i].title;
                    patternSelect.appendChild(option);
                }
                return;
            case 'chord_progression':
                patterns = this.chordProgressionPatterns;
                break;
            case 'grid':
                for (let i = 0; i <= 13; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `Positions ${i}-${i+2}`;
                    patternSelect.appendChild(option);
                }
                return;
            case 'grid2':
                for (let i = 0; i <= 14; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `Positions ${i}-${i+1}`;
                    patternSelect.appendChild(option);
                }
                return;
            case 'custom':
                patterns = this.musicTheory.customPatterns || {};
                break;
            default:
                patterns = {};
        }
        
        if (patternType === 'custom' && Object.keys(patterns).length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No custom patterns yet';
            patternSelect.appendChild(option);
            return;
        }

        const entries = typeof FretboardBetaCatalog !== 'undefined' && ['scale', 'chord', 'interval'].includes(patternType)
            ? FretboardBetaCatalog.commonEntries(patternType, patterns) : Object.entries(patterns);
        for (const [id, data] of entries) {
            const option = document.createElement('option');
            if (patternType === 'chord_progression') {
                option.value = data.id;
                option.textContent = data.name;
            } else {
                option.value = id;
                option.textContent = data.name;
            }
            patternSelect.appendChild(option);
        }
    };

    /**
     * Set the base pattern (scale, chord or interval) that layout types are built from
     */
    App.prototype.setLayoutBase = function(patternType = 'scale', pattern = null) {
        const typeSelect = document.getElementById('layout-base-type');
        const patternSelect = document.getElementById('layout-base-select');
        if (!typeSelect || !patternSelect) return;
        typeSelect.value = patternType;
        this.updatePatternSelect(patternType, patternSelect);
        if (pattern !== null && pattern !== undefined) patternSelect.value = pattern;
    };

    App.prototype.getLayoutBase = function() {
        return {
            patternType: document.getElementById('layout-base-type')?.value || 'scale',
            pattern: document.getElementById('layout-base-select')?.value || 'major'
        };
    };

    /**
     * Populate theme dropdowns dynamically
     */
    App.prototype.populateThemeDropdowns = function() {
        const colorThemeSelect = document.getElementById('color-theme');
        if (colorThemeSelect && typeof THEMES_DATA !== 'undefined') {
            const currentVal = this.settings && this.settings.colorTheme ? this.settings.colorTheme : 'default_ii';
            colorThemeSelect.innerHTML = '';
            colorThemeSelect.appendChild(new Option('Default', 'default_ii'));

            const addGroup = (label, themesObj) => {
                if (!themesObj || Object.keys(themesObj).length === 0) return;
                const optgroup = document.createElement('optgroup');
                optgroup.label = label;
                let addedCount = 0;
                Object.keys(themesObj).forEach(theme => {
                    if (theme === 'default' || theme === 'default_ii') return;
                    const opt = new Option(theme.charAt(0).toUpperCase() + theme.slice(1).replace(/([A-Z])/g, ' $1'), theme);
                    optgroup.appendChild(opt);
                    addedCount++;
                });
                if (addedCount > 0) colorThemeSelect.appendChild(optgroup);
            };

            const coreThemes = ['dark', 'colorful', 'darkMode'];
            const coreObj = {};
            coreThemes.forEach(t => { if (THEMES_DATA[t]) coreObj[t] = THEMES_DATA[t]; });
            
            addGroup('Core', coreObj);
            if (typeof THEMES_DATA_WOOD !== 'undefined') addGroup('Wood', THEMES_DATA_WOOD);
            if (typeof THEMES_DATA_EXOTIC !== 'undefined') addGroup('Exotic', THEMES_DATA_EXOTIC);
            if (typeof THEMES_DATA_MONO !== 'undefined') addGroup('Mono/Grayscale', THEMES_DATA_MONO);
            if (typeof THEMES_DATA_GRADIENTS !== 'undefined') addGroup('Black to Bright Gradients', THEMES_DATA_GRADIENTS);
            if (typeof THEMES_DATA_SPECTRAL !== 'undefined') addGroup('Spectral / Rainbow', THEMES_DATA_SPECTRAL);
            if (typeof THEMES_DATA_RETRO !== 'undefined') addGroup('Retro/Vintage', THEMES_DATA_RETRO);
            if (typeof THEMES_DATA_COLORS !== 'undefined') addGroup('Colors', THEMES_DATA_COLORS);
            if (typeof THEMES_DATA_NATURE !== 'undefined') addGroup('Nature', THEMES_DATA_NATURE);
            if (typeof THEMES_DATA_MISC !== 'undefined') addGroup('Misc', THEMES_DATA_MISC);
            if (typeof THEMES_DATA_EXTRA !== 'undefined') addGroup('Extra', THEMES_DATA_EXTRA);
            
            const addedThemes = new Set(['default', 'default_ii', ...coreThemes]);
            [
                typeof THEMES_DATA_WOOD !== 'undefined' ? THEMES_DATA_WOOD : {},
                typeof THEMES_DATA_EXOTIC !== 'undefined' ? THEMES_DATA_EXOTIC : {},
                typeof THEMES_DATA_MONO !== 'undefined' ? THEMES_DATA_MONO : {},
                typeof THEMES_DATA_RETRO !== 'undefined' ? THEMES_DATA_RETRO : {},
                typeof THEMES_DATA_COLORS !== 'undefined' ? THEMES_DATA_COLORS : {},
                typeof THEMES_DATA_NATURE !== 'undefined' ? THEMES_DATA_NATURE : {},
                typeof THEMES_DATA_MISC !== 'undefined' ? THEMES_DATA_MISC : {},
                typeof THEMES_DATA_EXTRA !== 'undefined' ? THEMES_DATA_EXTRA : {},
                typeof THEMES_DATA_GRADIENTS !== 'undefined' ? THEMES_DATA_GRADIENTS : {},
                typeof THEMES_DATA_SPECTRAL !== 'undefined' ? THEMES_DATA_SPECTRAL : {}
            ].forEach(obj => Object.keys(obj).forEach(k => addedThemes.add(k)));

            const uncategorizedObj = {};
            Object.keys(THEMES_DATA).forEach(k => {
                if (!addedThemes.has(k)) uncategorizedObj[k] = THEMES_DATA[k];
            });
            addGroup('Other', uncategorizedObj);

            colorThemeSelect.appendChild(new Option('Custom', 'custom'));
            
            colorThemeSelect.value = currentVal;
            if (colorThemeSelect.selectedIndex === -1) colorThemeSelect.value = 'default_ii';
        }
        
        const pageThemeSelect = document.getElementById('page-theme');
        if (pageThemeSelect) {
            const pageThemes = ['dark-mode', 'light-mode', 'night-owl', 'sepia', 'forest', 'ocean', 'sunset', 'monochrome', 'high-contrast', 'pastel', 'neon', 'cyberpunk', 'retro', 'minimal', 'vintage'];
            const defaultOpt = pageThemeSelect.options[0];
            pageThemeSelect.innerHTML = '';
            pageThemeSelect.appendChild(defaultOpt || new Option('Default', 'default'));
            pageThemes.forEach(theme => {
                const name = theme.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                pageThemeSelect.appendChild(new Option(name, theme));
            });
            const savedTheme = readAppStorage('pageTheme');
            if (savedTheme) pageThemeSelect.value = savedTheme;
        }
    };

    App.prototype.addFretNumberOptions = function() {
        const appearanceSection = document.querySelector('.appearance');
        
        const fretNumbersSection = document.createElement('div');
        fretNumbersSection.innerHTML = '<h3>Fret Numbers</h3>';
        appearanceSection.appendChild(fretNumbersSection);
        
        const placementGroup = document.createElement('div');
        placementGroup.className = 'control-group';
        
        const placementLabel = document.createElement('label');
        placementLabel.textContent = 'Placement:';
        placementLabel.setAttribute('for', 'fret-numbers-placement');
        
        const placementSelect = document.createElement('select');
        placementSelect.id = 'fret-numbers-placement';
        
        const placementOptions = [
            { value: 'below', text: 'Below Diagram' },
            { value: 'above', text: 'Above Diagram' }
        ];
        
        placementOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            placementSelect.appendChild(optElement);
        });
        
        placementGroup.appendChild(placementLabel);
        placementGroup.appendChild(placementSelect);
        fretNumbersSection.appendChild(placementGroup);
        
        const positionGroup = document.createElement('div');
        positionGroup.className = 'control-group';
        
        const positionLabel = document.createElement('label');
        positionLabel.textContent = 'Alignment:';
        positionLabel.setAttribute('for', 'fret-numbers-position');
        
        const positionSelect = document.createElement('select');
        positionSelect.id = 'fret-numbers-position';
        
        const positionOptions = [
            { value: 'center', text: 'Centered' },
            { value: 'left', text: 'Left' },
            { value: 'right', text: 'Right' }
        ];
        
        positionOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            positionSelect.appendChild(optElement);
        });
        
        positionGroup.appendChild(positionLabel);
        positionGroup.appendChild(positionSelect);
        fretNumbersSection.appendChild(positionGroup);
        
        const sizeGroup = document.createElement('div');
        sizeGroup.className = 'control-group';
        
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Size (px):';
        sizeLabel.setAttribute('for', 'fret-numbers-size');
        
        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.id = 'fret-numbers-size';
        sizeInput.min = '8';
        sizeInput.max = '24';
        sizeInput.value = '12';
        
        sizeGroup.appendChild(sizeLabel);
        sizeGroup.appendChild(sizeInput);
        fretNumbersSection.appendChild(sizeGroup);

        const fretNumberOffsetGroup = document.createElement('div');
        fretNumberOffsetGroup.className = 'control-group';
        
        const fretNumberOffsetLabel = document.createElement('label');
        fretNumberOffsetLabel.textContent = 'Vertical Offset (px):';
        fretNumberOffsetLabel.setAttribute('for', 'fret-numbers-offset');
        
        const fretNumberOffsetInput = document.createElement('input');
        fretNumberOffsetInput.type = 'range';
        fretNumberOffsetInput.id = 'fret-numbers-offset';
        fretNumberOffsetInput.min = '-20';
        fretNumberOffsetInput.max = '20';
        // Default to the minimum offset value
        fretNumberOffsetInput.value = fretNumberOffsetInput.min;
        fretNumberOffsetInput.addEventListener('change', () => this.updateFretboard());
        
        fretNumberOffsetGroup.appendChild(fretNumberOffsetLabel);
        fretNumberOffsetGroup.appendChild(fretNumberOffsetInput);
        fretNumbersSection.appendChild(fretNumberOffsetGroup);

        const markerPlacementGroup = document.createElement('div');
        markerPlacementGroup.className = 'control-group';
        
        const markerPlacementLabel = document.createElement('label');
        markerPlacementLabel.textContent = 'Fret Marker Placement:';
        markerPlacementLabel.setAttribute('for', 'fret-markers-placement');
        
        const markerPlacementSelect = document.createElement('select');
        markerPlacementSelect.id = 'fret-markers-placement';
        
        const markerPlacementOptions = [
            { value: 'on', text: 'On Fretboard' },
            { value: 'above', text: 'Above Fretboard' },
            { value: 'below', text: 'Below Fretboard' }
        ];
        
        markerPlacementOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            markerPlacementSelect.appendChild(optElement);
        });
        
        markerPlacementGroup.appendChild(markerPlacementLabel);
        markerPlacementGroup.appendChild(markerPlacementSelect);
        fretNumbersSection.appendChild(markerPlacementGroup);
        
        const fretMarkerOffsetGroup = document.createElement('div');
        fretMarkerOffsetGroup.className = 'control-group';
        
        const fretMarkerOffsetLabel = document.createElement('label');
        fretMarkerOffsetLabel.textContent = 'Marker Offset (px):';
        fretMarkerOffsetLabel.setAttribute('for', 'fret-markers-offset');
        
        const fretMarkerOffsetInput = document.createElement('input');
        fretMarkerOffsetInput.type = 'range';
        fretMarkerOffsetInput.id = 'fret-markers-offset';
        fretMarkerOffsetInput.min = '-20';
        fretMarkerOffsetInput.max = '20';
        fretMarkerOffsetInput.value = '0';
        fretMarkerOffsetInput.addEventListener('change', () => this.updateFretboard());
        
        fretMarkerOffsetGroup.appendChild(fretMarkerOffsetLabel);
        fretMarkerOffsetGroup.appendChild(fretMarkerOffsetInput);
        fretNumbersSection.appendChild(fretMarkerOffsetGroup);
        
        markerPlacementSelect.addEventListener('change', () => this.updateFretboard());
    };

    // removed App.prototype.addNoteAppearanceOptions() -> moved to app-ui-appearance.js
    // removed App.prototype.addStringAppearanceOptions() -> moved to app-ui-appearance.js
    // removed App.prototype.addFretAppearanceOptions() -> moved to app-ui-appearance.js
}