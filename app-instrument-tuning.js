/**
 * Instrument Tuning Logic Extension for App
 */
if (typeof App !== 'undefined') {
    App.prototype.updateTuningInputs = function(tuning = null) {
        const stringCountInput = document.getElementById('string-count');
        if (!stringCountInput) return;
        const stringCount = parseInt(stringCountInput.value);
        const tuningContainer = document.getElementById('tuning-container');

        const existingSelects = Array.from(document.querySelectorAll('.tuning-select'), select => select.value);
        const existingVisibility = Array.from(document.querySelectorAll('.show-string-notes'), input => input.checked);
        const existingStarts = Array.from(document.querySelectorAll('.string-start-fret'), input => input.value);
        const existingEnds = Array.from(document.querySelectorAll('.string-end-fret'), input => input.value);

        tuningContainer.innerHTML = '';
        
        const hasExplicitTuning = Array.isArray(tuning);
        let rememberedTuning = Array.isArray(this._rememberedTuningByString) ? this._rememberedTuningByString.slice() : [];
        if (hasExplicitTuning) {
            tuning = tuning.slice();
            rememberedTuning = tuning.slice();
        } else if (existingSelects.length > 0) {
            // Refresh pitches still visible, but keep removed strings cached so increasing
            // the count restores their previous pitches instead of guessing replacements.
            existingSelects.forEach((note, index) => { rememberedTuning[index] = note; });
            tuning = rememberedTuning.slice(0, stringCount);
        } else if (rememberedTuning.length > 0) {
            tuning = rememberedTuning.slice(0, stringCount);
        } else {
            tuning = this.musicTheory.getDefaultTuning(stringCount);
        }

        const defaultTuning = this.musicTheory.getDefaultTuning(stringCount);
        while (tuning.length < stringCount) tuning.push(defaultTuning[tuning.length] || 'E');
        tuning = tuning.slice(0, stringCount);
        if (hasExplicitTuning) rememberedTuning = tuning.slice();
        else tuning.forEach((note, index) => { rememberedTuning[index] = note; });
        this._rememberedTuningByString = rememberedTuning;
        
        for (let i = 0; i < stringCount; i++) {
            const div = document.createElement('div');
            div.className = 'tuning-input';
            
            const label = document.createElement('label');
            const reference = this.diagramSetups?.[this.activeDiagram]?.referenceLayout;
            const piano = document.getElementById('instrument-select')?.value === 'piano';
            label.textContent = `${piano ? 'Key' : 'String'} ${reference ? i + 1 : stringCount - i}:`;
            label.htmlFor = 'instrument-pitch-' + i;
            div.setAttribute('role', 'group');
            div.setAttribute('aria-label', label.textContent);
            div.appendChild(label);
            
            const select = document.createElement('select');
            select.className = 'tuning-select';
            select.id = 'instrument-pitch-' + i;
            select.setAttribute('aria-label', label.textContent + ' Open pitch');
            select.setAttribute('data-string', i);
            
            this.musicTheory.notes.forEach(note => {
                const option = document.createElement('option');
                option.value = note;
                option.textContent = note;
                if (note === tuning[i]) option.selected = true;
                select.appendChild(option);
            });
            
            select.addEventListener('change', () => this.updateFretboard());
            div.appendChild(select);
            
            const showCheckbox = document.createElement('input');
            showCheckbox.type = 'checkbox';
            showCheckbox.className = 'show-string-notes';
            showCheckbox.id = 'instrument-show-' + i;
            showCheckbox.setAttribute('aria-label', label.textContent + ' Show note markers');
            showCheckbox.setAttribute('data-string', i);
            showCheckbox.checked = existingVisibility[i] ?? true;
            showCheckbox.style.width = 'auto';
            showCheckbox.style.marginLeft = '10px';
            showCheckbox.addEventListener('change', () => this.updateFretboard());
            
            const checkboxLabel = document.createElement('label');
            checkboxLabel.textContent = 'Show notes';
            checkboxLabel.htmlFor = showCheckbox.id;
            checkboxLabel.style.marginBottom = '0';
            checkboxLabel.style.marginLeft = '5px';
            
            div.appendChild(showCheckbox);
            div.appendChild(checkboxLabel);
            
            const startFretInput = document.createElement('input');
            startFretInput.type = 'number';
            startFretInput.className = 'string-start-fret';
            startFretInput.id = 'instrument-start-' + i;
            startFretInput.setAttribute('aria-label', label.textContent + ' First fret with note markers');
            startFretInput.setAttribute('data-string', i);
            startFretInput.min = '0';
            startFretInput.max = '24';
            startFretInput.value = existingStarts[i] ?? this.settings?.stringStartFrets?.[i] ?? '0';
            startFretInput.style.width = '50px';
            startFretInput.style.marginLeft = '10px';
            startFretInput.addEventListener('change', () => this.updateFretboard());
            
            const startFretLabel = document.createElement('label');
            startFretLabel.textContent = 'From fret:';
            startFretLabel.htmlFor = startFretInput.id;
            startFretLabel.style.marginBottom = '0';
            startFretLabel.style.marginLeft = '10px';
            
            div.appendChild(startFretLabel);
            div.appendChild(startFretInput);
            
            const endFretInput = document.createElement('input');
            endFretInput.type = 'number';
            endFretInput.className = 'string-end-fret';
            endFretInput.id = 'instrument-end-' + i;
            endFretInput.setAttribute('aria-label', label.textContent + ' Last fret with note markers');
            endFretInput.setAttribute('data-string', i);
            endFretInput.min = '0';
            endFretInput.max = '24';
            endFretInput.value = existingEnds[i] ?? this.settings?.stringEndFrets?.[i] ?? '24';
            endFretInput.style.width = '50px';
            endFretInput.style.marginLeft = '10px';
            endFretInput.addEventListener('change', () => this.updateFretboard());
            
            const endFretLabel = document.createElement('label');
            endFretLabel.textContent = 'To fret:';
            endFretLabel.htmlFor = endFretInput.id;
            endFretLabel.style.marginBottom = '0';
            endFretLabel.style.marginLeft = '10px';
            
            div.appendChild(endFretLabel);
            div.appendChild(endFretInput);
            tuningContainer.appendChild(div);
        }
    };

    App.prototype.applyTuningPreset = function(instrumentId, tuningId) {
        const instrument = this.instrumentPresets[instrumentId];
        if (!instrument) return;
        const reference = typeof MULTI_INSTRUMENT_SETUPS !== 'undefined' && MULTI_INSTRUMENT_SETUPS.find(setup => setup.instrument === instrumentId && setup.preset === tuningId);
        const tuning = reference ? reference.tuning : instrument.tunings[tuningId];
        if (tuning) {
            if (reference && this.diagramSetups) this.diagramSetups[this.activeDiagram] = { ...this.diagramSetups[this.activeDiagram], ...JSON.parse(JSON.stringify(reference)) };
            const stringCountInput = document.getElementById('string-count');
            if (stringCountInput) { stringCountInput.max = Math.max(20, tuning.length); stringCountInput.value = tuning.length; }
            this.updateTuningInputs(tuning);
        }
        this.updateFretboard();
    };

    App.prototype.shiftTuning = function(semitones) {
        const tuningSelects = document.querySelectorAll('.tuning-select');
        if (tuningSelects.length === 0) return;
        
        const currentTuning = Array.from(tuningSelects).map(select => select.value);
        const newTuning = currentTuning.map(note => {
            const idx = this.musicTheory.notes.indexOf(note);
            if (idx === -1) return note;
            return this.musicTheory.notes[(idx + semitones + 12) % 12];
        });
        
        this.updateTuningInputs(newTuning);
        this.updateFretboard();
    };

    App.prototype.flipStringOrder = function() {
        const tuningSelects = document.querySelectorAll('.tuning-select');
        if (tuningSelects.length === 0) return;
        
        const tuning = Array.from(tuningSelects).map(select => select.value);
        
        // Capture other per-string settings to preserve them through the flip
        const showChecks = Array.from(document.querySelectorAll('.show-string-notes')).map(c => c.checked);
        const startFrets = Array.from(document.querySelectorAll('.string-start-fret')).map(i => i.value);
        const endFrets = Array.from(document.querySelectorAll('.string-end-fret')).map(i => i.value);
        
        const reversedTuning = [...tuning].reverse();
        const reversedShow = [...showChecks].reverse();
        const reversedStart = [...startFrets].reverse();
        const reversedEnd = [...endFrets].reverse();

        // updateTuningInputs recreates the DOM elements
        this.updateTuningInputs(reversedTuning);
        
        // Restore non-tuning values in reversed order into the newly created elements
        const newShow = document.querySelectorAll('.show-string-notes');
        const newStart = document.querySelectorAll('.string-start-fret');
        const newEnd = document.querySelectorAll('.string-end-fret');
        
        newShow.forEach((c, i) => { if(reversedShow[i] !== undefined) c.checked = reversedShow[i]; });
        newStart.forEach((c, i) => { if(reversedStart[i] !== undefined) c.value = reversedStart[i]; });
        newEnd.forEach((c, i) => { if(reversedEnd[i] !== undefined) c.value = reversedEnd[i]; });

        this.updateFretboard();
    };
}