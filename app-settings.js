/**
 * Settings Extension for App
 */
if (typeof App !== 'undefined') {
    App.prototype.loadAndApplyDefaultSettings = function() {
        const defaultInstrument = readAppStorage('defaultInstrument');
        const defaultTuningPreset = readAppStorage('defaultTuningPreset');
        const defaultColorTheme = readAppStorage('defaultColorTheme');
        const defaultKey = readAppStorage('defaultKey');
        const defaultDisplayMode = readAppStorage('defaultDisplayMode');
        const defaultPatternType = readAppStorage('defaultPatternType');
        const defaultPattern = readAppStorage('defaultPattern');

        if (defaultInstrument) {
            const instSelect = document.getElementById('instrument-select');
            if (instSelect) {
                instSelect.value = defaultInstrument;
                if (this.instrumentPresets && this.instrumentPresets[defaultInstrument]) {
                    const stringCountInput = document.getElementById('string-count');
                    if (stringCountInput) stringCountInput.value = this.instrumentPresets[defaultInstrument].strings;
                    
                    const tuningPresetSelect = document.getElementById('tuning-preset');
                    if (tuningPresetSelect) {
                        tuningPresetSelect.innerHTML = '';
                        Object.keys(this.instrumentPresets[defaultInstrument].tunings).forEach(tuningId => {
                            const option = document.createElement('option');
                            option.value = tuningId;
                            let displayName = 'Standard';
                            if (tuningId === 'whole_step_down') displayName = 'Whole-Step Down';
                            else if (tuningId === 'half_step_down') displayName = 'Half-Step Down';
                            else if (tuningId !== 'standard') displayName = 'Alternate';
                            option.textContent = displayName;
                            tuningPresetSelect.appendChild(option);
                        });
                        
                        if (defaultTuningPreset && this.instrumentPresets[defaultInstrument].tunings[defaultTuningPreset]) {
                            tuningPresetSelect.value = defaultTuningPreset;
                        }
                    }
                    
                    if (typeof this.applyTuningPreset === 'function') {
                        this.applyTuningPreset(defaultInstrument, tuningPresetSelect ? tuningPresetSelect.value : 'standard');
                    }
                }
            }
        }

        if (defaultColorTheme) {
            const colorThemeSelect = document.getElementById('color-theme');
            if (colorThemeSelect) {
                // Settings color theme will be naturally pulled by populateThemeDropdowns if stored on this.settings
                colorThemeSelect.value = defaultColorTheme;
                if (!this.settings) this.settings = {};
                this.settings.colorTheme = defaultColorTheme;
                
                if (defaultColorTheme === 'custom') {
                    const customColors = document.getElementById('custom-colors');
                    if (customColors) customColors.style.display = 'block';
                }
            }
        }

        const keySelect = document.getElementById('key-select');
        if (defaultKey) {
            if (keySelect) keySelect.value = defaultKey;
        } else {
            if (keySelect) keySelect.value = 'C';
        }

        if (defaultDisplayMode) {
            const displayModeSelect = document.getElementById('display-mode');
            if (displayModeSelect) displayModeSelect.value = defaultDisplayMode;
        }

        const patternTypeSelect = document.getElementById('pattern-type');
        if (patternTypeSelect) {
            patternTypeSelect.value = defaultPatternType || 'interval';
        }

        this.updatePatternSelect();

        const patternSelect = document.getElementById('pattern-select');

        if (defaultPattern && patternSelect) {
            const isValidOption = Array.from(patternSelect.options).some(opt => opt.value === defaultPattern);
            if (isValidOption) {
                patternSelect.value = defaultPattern;
            } else {
                const preferredDefault = patternTypeSelect && patternTypeSelect.value === 'interval' ? '1' : null;
                const preferredOption = preferredDefault && Array.from(patternSelect.options).find(opt => opt.value === preferredDefault);
                if (preferredOption) patternSelect.value = preferredOption.value;
                else patternSelect.selectedIndex = 0;
            }
        } else if (patternSelect) {
            const preferredDefault = patternTypeSelect && patternTypeSelect.value === 'interval' ? '1' : null;
            const preferredOption = preferredDefault && Array.from(patternSelect.options).find(opt => opt.value === preferredDefault);
            if (preferredOption) patternSelect.value = preferredOption.value;
            else patternSelect.selectedIndex = 0;
        }
    };

    App.prototype.setupThemeSwitching = function() {
        // Theme and font size switching is now handled globally by theme-init.js
        // We just need to make sure the fretboard redraws when the theme changes
        const themeSelect = document.getElementById('page-theme');
        if(themeSelect) {
            themeSelect.addEventListener('change', () => {
                this.updateFretboard();
            });
        }
    };
}