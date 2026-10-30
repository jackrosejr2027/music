/**
 * Fretspan Presets logic for App
 */
if (typeof App !== 'undefined') {
    App.prototype.setupFretspanUI = function(container, stringCountGroup) {
        const fretspanGroup = document.createElement('div');
        fretspanGroup.className = 'control-group';
        const fretspanLabel = document.createElement('label');
        fretspanLabel.textContent = 'Fretspan Presets:';
        fretspanLabel.setAttribute('for', 'fretspan-presets');
        const fretspanSelect = document.createElement('select');
        fretspanSelect.id = 'fretspan-presets';
        
        const basicOptions = [
            { v: 'open-4-fretspan', t: 'Open 4 Fret Span' },
            { v: 'default-all-strings', t: 'Default Fretspan — All Strings (0–24)' }
        ];
        basicOptions.forEach(o => {
            const opt = new Option(o.t, o.v);
            fretspanSelect.appendChild(opt);
        });

        for (let i = 6; i >= 1; i--) {
            fretspanSelect.appendChild(new Option(`Show Only String ${i} (0–12)`, `show-string-${i}`));
        }

        const pairs = ['6-5', '5-4', '4-3', '3-2', '2-1', '6-4', '6-3', '6-2', '6-1', '5-3', '5-2', '5-1', '4-2', '4-1', '3-1'];
        pairs.forEach(p => fretspanSelect.appendChild(new Option(`Show Only Strings ${p.replace('-', ' & ')} (0–12)`, `show-pair-${p}`)));

        const triplets = ['6-5-4', '6-5-3', '6-5-2', '6-5-1', '6-4-3', '6-4-2', '6-4-1', '6-3-2', '6-3-1', '6-2-1', '5-4-3', '5-4-2', '5-4-1', '5-3-2', '5-3-1', '5-2-1', '4-3-2', '4-3-1', '4-2-1', '3-2-1'];
        triplets.forEach(t => fretspanSelect.appendChild(new Option(`Show Strings ${t.replace(/-/g, ',')} (0–12)`, `show-triplet-${t}`)));

        const userOpt = new Option('— Custom Presets —', 'custom-none');
        userOpt.disabled = true;
        fretspanSelect.appendChild(userOpt);
        fretspanGroup.appendChild(fretspanLabel);
        fretspanGroup.appendChild(fretspanSelect);
        
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '5px';
        btnRow.style.marginTop = '5px';

        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Apply Preset';
        applyBtn.addEventListener('click', () => this.applyFretspanPreset(fretspanSelect.value));
        
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Current';
        saveBtn.addEventListener('click', () => {
            const name = prompt('Preset name:', 'My Fretspan');
            if (!name) return;
            const id = 'user-' + Date.now();
            const starts = document.querySelectorAll('.string-start-fret');
            const ends = document.querySelectorAll('.string-end-fret');
            const settings = [];
            for (let i = 0; i < starts.length; i++) {
                settings.push({ start: parseInt(starts[i].value)||0, end: parseInt(ends[i].value)||12 });
            }
            const stored = JSON.parse(readAppStorage('fretspanPresets') || '{}');
            stored[id] = { name, settings };
            writeAppStorage('fretspanPresets', JSON.stringify(stored));
            fretspanSelect.insertBefore(new Option(name, id), userOpt);
            alert('Preset saved.');
        });
        
        btnRow.appendChild(applyBtn);
        btnRow.appendChild(saveBtn);
        fretspanGroup.appendChild(btnRow);
        container.insertBefore(fretspanGroup, stringCountGroup);

        try {
            const stored = JSON.parse(readAppStorage('fretspanPresets') || '{}');
            Object.entries(stored).forEach(([id, p]) => fretspanSelect.insertBefore(new Option(p.name, id), userOpt));
        } catch (e) {}
    };

    App.prototype.applyFretspanPreset = function(presetId) {
        if (!presetId) return;
        const scInput = document.getElementById('string-count');
        
        // Standard guitar presets (pairs/triplets) expect 6 strings to map correctly to UI labels
        const isStandardGroup = presetId === 'open-4-fretspan' || presetId.startsWith('show-string-') || presetId.startsWith('show-pair-') || presetId.startsWith('show-triplet-');
        
        if (isStandardGroup && scInput && parseInt(scInput.value) !== 6) {
            scInput.value = 6;
            scInput.dispatchEvent(new Event('change'));
        }

        if (presetId === 'open-4-fretspan') {
            const startEnds = [{s:0,e:5},{s:0,e:4},{s:0,e:3},{s:0,e:4},{s:0,e:4},{s:0,e:4}];
            this.applyStartEndArray(startEnds);
        } else if (presetId === 'default-all-strings') {
            const sInputs = document.querySelectorAll('.string-start-fret');
            const eInputs = document.querySelectorAll('.string-end-fret');
            const showBoxes = document.querySelectorAll('.show-string-notes');
            sInputs.forEach(i => i.value = 0);
            eInputs.forEach(i => i.value = 24);
            showBoxes.forEach(i => i.checked = true);
            this.updateFretboard();
        } else if (presetId.startsWith('show-string-')) {
            const n = parseInt(presetId.split('-')[2]);
            // String numbers in UI (6..1) map to indices (0..5)
            this.applyStartEndArray([], [6 - n]);
        } else if (presetId.startsWith('show-pair-')) {
            const parts = presetId.split('-');
            const high = parseInt(parts[2]), low = parseInt(parts[3]);
            this.applyStartEndArray([], [6 - high, 6 - low]);
        } else if (presetId.startsWith('show-triplet-')) {
            const parts = presetId.split('-');
            const s1 = parseInt(parts[2]), s2 = parseInt(parts[3]), s3 = parseInt(parts[4]);
            this.applyStartEndArray([], [6 - s1, 6 - s2, 6 - s3]);
        } else {
            const stored = JSON.parse(readAppStorage('fretspanPresets') || '{}');
            if (stored[presetId] && stored[presetId].settings) {
                this.applyStartEndArray(stored[presetId].settings.map(s => ({s: s.start, e: s.end})));
            }
        }
    };

    App.prototype.applyStartEndArray = function(ranges, showOnlyIndices = null) {
        const sInputs = document.querySelectorAll('.string-start-fret');
        const eInputs = document.querySelectorAll('.string-end-fret');
        const showBoxes = document.querySelectorAll('.show-string-notes');
        
        for (let i = 0; i < sInputs.length; i++) {
            // Apply fret ranges
            if (ranges && ranges[i]) {
                sInputs[i].value = ranges[i].s !== undefined ? ranges[i].s : (ranges[i].start !== undefined ? ranges[i].start : 0);
                eInputs[i].value = ranges[i].e !== undefined ? ranges[i].e : (ranges[i].end !== undefined ? ranges[i].end : 12);
            } else {
                sInputs[i].value = 0; 
                eInputs[i].value = 12;
            }
            
            // Apply visibility
            if (showOnlyIndices) {
                showBoxes[i].checked = showOnlyIndices.includes(i);
            } else {
                showBoxes[i].checked = true;
            }
        }
        this.updateFretboard();
    };
}