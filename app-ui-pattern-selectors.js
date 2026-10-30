/**
 * UI Pattern Selectors
 */
if (typeof App !== 'undefined') {
    App.prototype.styleInlineSelect = function(el) {
        el.style.border = 'none';
        el.style.background = 'transparent';
        el.style.color = 'var(--primary-color)';
        el.style.fontWeight = '800';
        el.style.fontSize = '1.05em';
        el.style.cursor = 'pointer';
        el.style.padding = '6px 4px';
        el.style.outline = 'none';
        el.style.width = 'auto';
        el.style.textAlign = 'center';
        el.style.transition = 'color 0.2s';
        el.style.webkitAppearance = 'none';
        el.style.appearance = 'none';
        el.addEventListener('mouseenter', () => el.style.color = 'var(--secondary-color)');
        el.addEventListener('mouseleave', () => el.style.color = 'var(--primary-color)');
    };

    App.prototype.createInlineKeySelect = function() {
        const uiKeySelect = document.getElementById('key-select');
        const keySelect = document.createElement('select');
        keySelect.id = 'current-pattern-key-select';
        keySelect.style.marginRight = '8px';
        
        (uiKeySelect ? Array.from(uiKeySelect.options, option => option.value) : this.musicTheory.notes || []).forEach(n => {
            const opt = document.createElement('option');
            opt.value = n;
            opt.textContent = n;
            if (uiKeySelect && uiKeySelect.value === n) opt.selected = true;
            keySelect.appendChild(opt);
        });

        keySelect.addEventListener('change', (e) => {
            const newKey = e.target.value;
            if (uiKeySelect) {
                uiKeySelect.value = newKey;
                uiKeySelect.dispatchEvent(new Event('change'));
            } else {
                this.updateFretboard();
                this.updateTheoryInfo();
            }
        });
        
        if (uiKeySelect) {
            // Main-select synchronization is managed once by the pattern-pill orchestrator.
        }

        this.styleInlineSelect(keySelect);
        return keySelect;
    };

    App.prototype.createInlineTypeSelect = function() {
        const uiPatternType = document.getElementById('pattern-type');
        const patternTypeSelect = document.createElement('select');
        patternTypeSelect.id = 'current-pattern-type-select';
        patternTypeSelect.style.margin = '0 8px';
        
        if (uiPatternType) {
            Array.from(uiPatternType.options).forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.value;
                opt.textContent = o.textContent || o.value;
                if (o.value === uiPatternType.value) opt.selected = true;
                patternTypeSelect.appendChild(opt);
            });
        } else {
            ['scale','chord','interval','gamut','grid','grid2','lesson','chord_progression','custom'].forEach(v => {
                const opt = document.createElement('option');
                opt.value = v;
                opt.textContent = v.charAt(0).toUpperCase() + v.slice(1);
                if (v === (this.currentPatternType || 'scale')) opt.selected = true;
                patternTypeSelect.appendChild(opt);
            });
        }

        patternTypeSelect.addEventListener('change', (e) => {
            const newType = e.target.value;
            if (uiPatternType) {
                uiPatternType.value = newType;
                uiPatternType.dispatchEvent(new Event('change'));
            } else {
                this.updateFretboard();
                this.updateTheoryInfo();
            }
        });
        
        if (uiPatternType) {
            // Main-select synchronization is managed once by the pattern-pill orchestrator.
        }

        this.styleInlineSelect(patternTypeSelect);
        return patternTypeSelect;
    };

    App.prototype.createInlinePatternSelect = function() {
        const patternSelectInline = document.createElement('select');
        patternSelectInline.id = 'current-pattern-select';
        patternSelectInline.style.marginLeft = '6px';
        
        const uiPatternSelect = document.getElementById('pattern-select');
        patternSelectInline.addEventListener('change', (e) => {
            if (uiPatternSelect) {
                uiPatternSelect.value = e.target.value;
                uiPatternSelect.dispatchEvent(new Event('change'));
            } else {
                this.updateFretboard();
                this.updateTheoryInfo();
            }
        });

        this.styleInlineSelect(patternSelectInline);
        return patternSelectInline;
    };

    App.prototype.populateInlinePatternSelect = function(selectEl, type, currentValue) {
        selectEl.innerHTML = '';
        if (type === 'lesson' && Array.isArray(this.lessons)) {
            this.lessons.forEach((lesson, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = lesson.title || `Lesson ${idx+1}`;
                if (String(currentValue) === String(idx)) opt.selected = true;
                selectEl.appendChild(opt);
            });
            return;
        }
        
        let patternsObj = {};
        if (type === 'scale') patternsObj = this.musicTheory.scales || {};
        else if (type === 'chord') patternsObj = this.musicTheory.chords || {};
        else if (type === 'interval') patternsObj = this.musicTheory.intervals || {};
        else if (type === 'gamut') patternsObj = this.musicTheory.gamuts || {};
        else if (type === 'chord_progression') patternsObj = this.chordProgressionPatterns || {};
        else if (type === 'custom') patternsObj = this.musicTheory.customPatterns || {};
        
        if (type === 'custom' && Object.keys(patternsObj).length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No custom patterns yet';
            selectEl.appendChild(opt);
            return;
        }

        if (Array.isArray(patternsObj)) {
            patternsObj.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.id || item.value || item.name;
                opt.textContent = item.name || item.value || item.id;
                if (String(currentValue) === String(opt.value)) opt.selected = true;
                selectEl.appendChild(opt);
            });
        } else {
            const entries = typeof FretboardBetaCatalog !== 'undefined' && ['scale', 'chord', 'interval'].includes(type)
                ? FretboardBetaCatalog.commonEntries(type, patternsObj) : Object.entries(patternsObj);
            entries.forEach(([id, data]) => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = (data && data.name) ? data.name : id;
                if (String(currentValue) === String(id)) opt.selected = true;
                selectEl.appendChild(opt);
            });
        }
    };
}