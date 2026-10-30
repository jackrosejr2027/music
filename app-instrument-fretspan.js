/**
 * Fretspan Presets logic for App
 */
if (typeof App !== 'undefined') {
    App.prototype.setupFretspanUI = function(container, stringCountGroup) {
        const fretspanGroup = document.createElement('div');
        fretspanGroup.className = 'control-group';
        const fretspanLabel = document.createElement('label');
        fretspanLabel.textContent = 'Per-string range presets:';
        fretspanLabel.setAttribute('for', 'fretspan-presets');
        const fretspanSelect = document.createElement('select');
        fretspanSelect.id = 'fretspan-presets';
        
        const basicOptions = [
            { v: 'open-4-fretspan', t: 'Open-position ranges (6 strings)' },
            { v: 'default-all-strings', t: 'All strings — full range (0–24)' }
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
        
        const nameRow = document.createElement('div'); nameRow.className = 'fretspan-save-row';
        const nameLabel = document.createElement('label'); nameLabel.htmlFor = 'fretspan-name'; nameLabel.textContent = 'Save current limits as';
        const nameInput = document.createElement('input'); nameInput.id = 'fretspan-name'; nameInput.type = 'text'; nameInput.maxLength = 50; nameInput.placeholder = 'Preset name';
        nameRow.append(nameLabel, nameInput);
        const btnRow = document.createElement('div'); btnRow.className = 'fretspan-actions';
        const applyBtn = document.createElement('button'); applyBtn.type = 'button'; applyBtn.textContent = 'Apply preset';
        const saveBtn = document.createElement('button'); saveBtn.type = 'button'; saveBtn.textContent = 'Save limits';
        const deleteBtn = document.createElement('button'); deleteBtn.type = 'button'; deleteBtn.textContent = 'Delete saved'; deleteBtn.disabled = true;
        const status = document.createElement('p'); status.className = 'fretspan-status'; status.setAttribute('role', 'status');
        const readSaved = () => {
            try { const data = JSON.parse(readAppStorage('fretspanPresets') || '{}'); return data && typeof data === 'object' && !Array.isArray(data) ? data : {}; }
            catch (_) { return {}; }
        };
        const refreshSaved = (selected = fretspanSelect.value) => {
            fretspanSelect.querySelectorAll('option[data-user-preset]').forEach(option => option.remove());
            const saved = readSaved();
            Object.entries(saved).forEach(([id, preset]) => {
                if (id.startsWith('user-') && preset && typeof preset.name === 'string') {
                    const option = new Option(preset.name, id); option.dataset.userPreset = 'true';
                    fretspanSelect.insertBefore(option, userOpt);
                }
            });
            fretspanSelect.value = [...fretspanSelect.options].some(option => option.value === selected) ? selected : 'open-4-fretspan';
            applyBtn.disabled = fretspanSelect.value === 'custom-none';
            deleteBtn.disabled = !fretspanSelect.value.startsWith('user-');
        };
        fretspanSelect.addEventListener('change', () => {
            applyBtn.disabled = fretspanSelect.value === 'custom-none';
            deleteBtn.disabled = !fretspanSelect.value.startsWith('user-');
            status.textContent = fretspanSelect.value.startsWith('user-') ? 'Saved preset selected. Apply it to the selected diagram.' : 'Built-in preset selected. Apply it to the selected diagram.';
        });
        applyBtn.addEventListener('click', () => {
            const id = fretspanSelect.value;
            if (!id || id === 'custom-none') return;
            const preset = readSaved()[id];
            const expected = preset?.stringCount || preset?.settings?.length;
            const actual = document.querySelectorAll('#tuning-container .tuning-select').length;
            this.applyFretspanPreset(id);
            status.textContent = expected && expected !== actual
                ? 'Applied to the selected diagram. Preset has ' + expected + ' strings; this diagram has ' + actual + '. Extra rows use the default range.'
                : 'Range preset applied to the selected diagram.';
        });
        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (!name) { status.textContent = 'Enter a name before saving.'; nameInput.focus(); return; }
            const starts = document.querySelectorAll('#tuning-container .string-start-fret');
            const ends = document.querySelectorAll('#tuning-container .string-end-fret');
            const settings = [];
            for (let i = 0; i < starts.length; i++) {
                if (!starts[i].value.trim() || !ends[i].value.trim()) { status.textContent = 'Enter a From and To fret for every string.'; return; }
                const start = Number(starts[i].value), end = Number(ends[i].value);
                if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > 24 || end < 0 || end > 24 || start > end) {
                    status.textContent = 'Each per-string range must be whole frets from 0 to 24, with From no greater than To.'; return;
                }
                settings.push({ start, end });
            }
            if (!settings.length) { status.textContent = 'No per-string ranges are available for the selected diagram.'; return; }
            const saved = readSaved();
            const id = 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
            saved[id] = { name: name.slice(0, 50), stringCount: settings.length, settings };
            writeAppStorage('fretspanPresets', JSON.stringify(saved));
            if (!readSaved()[id]) { status.textContent = 'Could not save the preset to this device.'; return; }
            refreshSaved(id); nameInput.value = ''; status.textContent = 'Saved “' + name.slice(0, 50) + '” on this device.';
        });
        deleteBtn.addEventListener('click', () => {
            const id = fretspanSelect.value, saved = readSaved();
            if (!id.startsWith('user-') || !saved[id]) return;
            const name = saved[id].name; delete saved[id];
            writeAppStorage('fretspanPresets', JSON.stringify(saved));
            const removed = !readSaved()[id]; refreshSaved('open-4-fretspan');
            status.textContent = removed ? 'Deleted “' + name + '”.' : 'Could not delete the preset from this device.';
        });
        nameInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); saveBtn.click(); } });
        btnRow.append(applyBtn, saveBtn, deleteBtn);
        fretspanGroup.append(nameRow, btnRow, status);
        container.insertBefore(fretspanGroup, stringCountGroup);

        refreshSaved('open-4-fretspan');
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
            const sInputs = document.querySelectorAll('#tuning-container .string-start-fret');
            const eInputs = document.querySelectorAll('#tuning-container .string-end-fret');
            const showBoxes = document.querySelectorAll('#tuning-container .show-string-notes');
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
            let stored = {};
            try { stored = JSON.parse(readAppStorage('fretspanPresets') || '{}') || {}; } catch (_) {}
            if (stored[presetId] && Array.isArray(stored[presetId].settings)) {
                const currentCount = document.querySelectorAll('#tuning-container .string-start-fret').length;
                this.applyStartEndArray(stored[presetId].settings.map(s => ({s: s.start, e: s.end})));
                if (stored[presetId].settings.length !== currentCount) {
                    const status = document.querySelector('#instrument-range .fretspan-status');
                    if (status) status.textContent = 'Preset has ' + stored[presetId].settings.length + ' rows; applied to the selected diagram’s ' + currentCount + ' rows. Extra rows use the default range.';
                }
            }
        }
    };

    App.prototype.applyStartEndArray = function(ranges, showOnlyIndices = null) {
        const sInputs = document.querySelectorAll('#tuning-container .string-start-fret');
        const eInputs = document.querySelectorAll('#tuning-container .string-end-fret');
        const showBoxes = document.querySelectorAll('#tuning-container .show-string-notes');
        
        for (let i = 0; i < sInputs.length; i++) {
            // Apply fret ranges
            if (ranges && ranges[i]) {
                const rawStart = ranges[i].s !== undefined ? ranges[i].s : (ranges[i].start !== undefined ? ranges[i].start : 0);
                const rawEnd = ranges[i].e !== undefined ? ranges[i].e : (ranges[i].end !== undefined ? ranges[i].end : 12);
                const parsedStart = Number(rawStart), parsedEnd = Number(rawEnd);
                const start = Number.isInteger(parsedStart) && parsedStart >= 0 && parsedStart <= 24 ? parsedStart : 0;
                const end = Number.isInteger(parsedEnd) && parsedEnd >= start && parsedEnd <= 24 ? parsedEnd : Math.max(start, 12);
                sInputs[i].value = start; eInputs[i].value = end;
            } else {
                sInputs[i].value = 0;
                eInputs[i].value = 12;
            }
            // Apply visibility only to this selected diagram's string rows.
            if (showBoxes[i]) showBoxes[i].checked = showOnlyIndices ? showOnlyIndices.includes(i) : true;
        }
        this.updateFretboard();
    };
}