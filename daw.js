(function () {
    'use strict';

    const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const ROOTS = [
        ['I', 0], ['bII', 1], ['II', 2], ['bIII', 3], ['III', 4], ['IV', 5],
        ['#IV / bV', 6], ['V', 7], ['bVI', 8], ['VI', 9], ['bVII', 10], ['VII', 11]
    ];
    const TEMPLATES = [
        { name: 'Pop I-V-vi-IV', steps: [['chord','major',0],['chord','major',7],['chord','minor',9],['chord','major',5]] },
        { name: 'I-vi-IV-V', steps: [['chord','major',0],['chord','minor',9],['chord','major',5],['chord','major',7]] },
        { name: 'I-IV-V-IV', steps: [['chord','major',0],['chord','major',5],['chord','major',7],['chord','major',5]] },
        { name: 'vi-IV-I-V', steps: [['chord','minor',9],['chord','major',5],['chord','major',0],['chord','major',7]] },
        { name: 'ii-V-I-vi', steps: [['chord','minor7',2],['chord','dominant7',7],['chord','major7',0],['chord','minor7',9]] },
        { name: 'Jazz turnaround', steps: [['chord','major7',0],['chord','dominant7',9],['chord','minor7',2],['chord','dominant7',7]] },
        { name: 'Minor i-bVI-bIII-bVII', steps: [['chord','minor',0],['chord','major',8],['chord','major',3],['chord','major',10]] },
        { name: 'Andalusian cadence', steps: [['chord','minor',0],['chord','major',10],['chord','major',8],['chord','dominant7',7]] },
        { name: 'Minor iiø-V-i', steps: [['chord','half_diminished',2],['chord','dominant7',7],['chord','minor',0],['chord','minor',0]] },
        { name: 'Dorian i7-IV7 vamp', steps: [['chord','minor7',0],['chord','dominant7',5],['chord','minor7',0],['chord','dominant7',5]] },
        { name: 'Royal road', steps: [['chord','major',5],['chord','major',7],['chord','minor',4],['chord','minor',9],['chord','minor7',2],['chord','dominant7',7],['chord','major',0],['chord','major',0]] },
        { name: 'Axis progression', steps: [['chord','major',0],['chord','major',7],['chord','minor',9],['chord','minor',4],['chord','major',5],['chord','major',0],['chord','major',5],['chord','major',7]] },
        { name: 'Blues turnaround', steps: [['chord','dominant7',0],['chord','dominant7',5],['chord','dominant7',0],['chord','dominant7',7]] },
        { name: 'Minor blues', steps: [['chord','minor7',0],['chord','minor7',0],['chord','minor7',0],['chord','minor7',5],['chord','minor7',0],['chord','dominant7',7]] },
        { name: 'Circle ii-V-I', steps: [['chord','minor7',2],['chord','dominant7',7],['chord','major7',0],['chord','major7',0]] },
        { name: 'Plagal color', steps: [['chord','major7',0],['chord','major',5],['chord','minor7',2],['chord','major7',0]] },
        { name: 'Major scale cycle', steps: [['scale','major',0],['scale','major',7],['scale','major',0],['scale','major',5]] },
        { name: 'Relative minor route', steps: [['scale','natural_minor',9],['scale','natural_minor',0],['scale','major',3],['scale','major',0]] },
        { name: 'Dorian color', steps: [['scale','dorian',0],['scale','dorian',5],['scale','dorian',0],['scale','dorian',7]] },
        { name: 'Minor pentatonic and blues', steps: [['scale','pentatonic_minor',0],['scale','blues',0],['scale','pentatonic_minor',7],['scale','blues',0]] },
        { name: 'Harmonic minor cadence', steps: [['scale','harmonic_minor',0],['scale','phrygian',7],['scale','harmonic_minor',0],['scale','natural_minor',0]] },
        { name: 'Four modal roots', steps: [['scale','major',0],['scale','dorian',2],['scale','phrygian',4],['scale','lydian',5]] },
        { name: 'Bebop dominant', steps: [['scale','mixolydian',0],['scale','bebop_dominant',0],['scale','mixolydian',7],['scale','bebop_dominant',0]] },
        { name: 'Whole-tone contrast', steps: [['scale','whole_tone',0],['scale','diminished',0],['scale','whole_tone',7],['scale','diminished',0]] },
        { name: 'Japanese palette', steps: [['scale','hirajoshi',0],['scale','in_sen',0],['scale','japanese',0],['scale','pentatonic_major',0]] },
        { name: 'Major and minor colors', steps: [['scale','pentatonic_major',0],['scale','pentatonic_minor',9],['scale','blues',9],['scale','major',0]] },
        { name: 'Thirds up', steps: [['interval','3',0],['interval','b3',2],['interval','3',4],['interval','b3',5]] },
        { name: 'Fourth and fifth chain', steps: [['interval','4',0],['interval','5',5],['interval','4',7],['interval','5',0]] },
        { name: 'Sixth interval study', steps: [['interval','6',0],['interval','b6',2],['interval','6',4],['interval','b6',5]] },
        { name: 'Seventh colors', steps: [['interval','7',0],['interval','b7',2],['interval','7',4],['interval','b7',5]] },
        { name: 'Tritone resolutions', steps: [['interval','#4',0],['interval','5',7],['interval','b5',7],['interval','1',0]] },
        { name: 'Seconds and thirds', steps: [['interval','2',0],['interval','b3',2],['interval','3',4],['interval','2',5]] },
        { name: 'Octave and fifths', steps: [['interval','5',0],['interval','1',7],['interval','5',5],['interval','1',0]] },
        { name: 'Suspended interval line', steps: [['interval','4',0],['interval','2',2],['interval','5',7],['interval','1',0]] },
        { name: 'Pop harmony plus melody', steps: [['chord','major',0],['chord','major',7],['scale','major',9],['chord','minor',9],['interval','3',0],['chord','major',5]] },
        { name: 'Minor blues toolkit', steps: [['chord','minor7',0],['scale','blues',0],['chord','minor7',5],['interval','b7',0],['chord','dominant7',7]] },
        { name: 'Jazz ii-V-I with guide tones', steps: [['chord','minor7',2],['interval','b7',2],['chord','dominant7',7],['interval','3',7],['chord','major7',0],['scale','major',0]] },
        { name: 'Dorian vamp toolkit', steps: [['scale','dorian',0],['chord','minor7',0],['interval','4',0],['chord','dominant7',5],['scale','dorian',0]] },
        { name: 'Major cadence and scale', steps: [['scale','major',0],['chord','major',5],['chord','dominant7',7],['interval','7',7],['chord','major',0],['scale','major',0]] },
        { name: 'Minor cadence and scale', steps: [['scale','harmonic_minor',0],['chord','half_diminished',2],['chord','dominant7',7],['interval','b2',7],['chord','minor',0],['scale','natural_minor',0]] },
        { name: 'Suspended chord colors', steps: [['chord','sus4',0],['interval','4',0],['chord','sus2',7],['scale','mixolydian',7],['chord','major',0]] },
        { name: 'Pentatonic over changes', steps: [['chord','major',0],['scale','pentatonic_major',0],['chord','minor7',9],['scale','pentatonic_minor',9],['interval','5',0]] }
    ];

    const PRELOADED_PATTERNS = [];
    TEMPLATES.forEach((template, templateIndex) => {
        KEYS.forEach((key, keyIndex) => {
            if (PRELOADED_PATTERNS.length >= 500) return;
            const ordinal = PRELOADED_PATTERNS.length + 1;
            PRELOADED_PATTERNS.push({
                id: 'preload-' + String(ordinal).padStart(3, '0'),
                name: template.name + ' - ' + key,
                family: templateIndex < 16 ? 'Chord progressions' : templateIndex < 26 ? 'Scale studies' : templateIndex < 34 ? 'Interval studies' : 'Mixed patterns',
                key,
                steps: template.steps.map(([kind, item, offset]) => ({ kind, item, offset, beats: 4 }))
            });
        });
    });

    const theory = new MusicTheory();
    const $ = id => document.getElementById(id);
    const byKind = {
        chord: theory.chords || {},
        scale: theory.scales || {},
        interval: theory.intervals || {}
    };
    const names = Object.fromEntries(Object.entries(byKind).map(([kind, items]) => [kind, Object.fromEntries(Object.entries(items).map(([id, item]) => [id, item.name || id]))]));
    const state = { key: 'C', steps: [], title: 'Pop I-V-vi-IV - C', sourceId: 'preload-001' };
    const timers = new Set();
    let playToken = 0;
    let diagramWidget = null;

    function fillSelect(select, items) {
        select.replaceChildren();
        Object.entries(items).forEach(([value, label]) => select.add(new Option(label, value)));
    }

    function fillPatternTypes() {
        const preferred = {
            chord: ['major','minor','diminished','augmented','sus2','sus4','major7','dominant7','minor7','diminished7','half_diminished','add9','maj9','min9'],
            scale: ['major','natural_minor','harmonic_minor','melodic_minor','dorian','phrygian','lydian','mixolydian','locrian','pentatonic_major','pentatonic_minor','blues','whole_tone','diminished','altered','hirajoshi','in_sen','japanese','hungarian_minor','bebop_dominant'],
            interval: Object.keys(theory.intervals || {})
        };
        const kind = $('block-kind').value;
        const selected = preferred[kind].filter(id => byKind[kind][id]);
        fillSelect($('block-reference'), Object.fromEntries(selected.map(id => [id, names[kind][id]])));
    }

    function rootLabel(offset) {
        return ROOTS.find(root => root[1] === offset)?.[0] || 'I';
    }

    function noteAtOffset(key, offset) {
        const root = theory.notes.indexOf(theory.toSharp(key));
        return root < 0 ? null : theory.notes[(root + Number(offset) + 12) % 12];
    }

    function normalizePattern(pattern, allowEmpty) {
        if (!pattern || typeof pattern !== 'object' || !Array.isArray(pattern.steps) || pattern.steps.length > 256) return null;
        const key = KEYS.includes(pattern.key) ? pattern.key : null;
        if (!key || (!allowEmpty && !pattern.steps.length)) return null;
        const steps = [];
        for (const raw of pattern.steps) {
            if (!raw || !['chord', 'scale', 'interval'].includes(raw.kind) || typeof raw.item !== 'string' || !Object.prototype.hasOwnProperty.call(byKind[raw.kind], raw.item)) return null;
            const offset = raw.offset, beats = raw.beats === undefined ? 4 : raw.beats;
            if (typeof offset !== 'number' || !Number.isInteger(offset) || offset < 0 || offset > 11 || typeof beats !== 'number' || ![4, 8, 16].includes(beats)) return null;
            const step = { kind: raw.kind, item: raw.item, offset, beats };
            if (!resolveNotes(step, key).length) return null;
            steps.push(step);
        }
        return {
            id: typeof pattern.id === 'string' ? pattern.id.slice(0, 120) : '',
            name: String(pattern.name || 'Untitled pattern').trim().slice(0, 48) || 'Untitled pattern',
            key,
            steps
        };
    }

    function resolveNotes(step, key) {
        const root = noteAtOffset(key, step.offset || 0);
        if (step.kind === 'scale') return theory.getScaleNotes(root, step.item);
        if (step.kind === 'chord') return theory.getChordNotes(root, step.item);
        const interval = theory.intervals[step.item];
        return interval ? [root, theory.getNoteFromInterval(root, step.item)] : [];
    }

    function renderDiagram(index) {
        const host = $('daw-fretboard');
        const caption = $('diagram-caption');
        const step = state.steps[index];
        if (!host || !step) {
            if (host) { host.replaceChildren(); const empty = document.createElement('p'); empty.textContent = 'Add a block to see its fretboard diagram.'; host.appendChild(empty); }
            if (caption) caption.textContent = 'Select a block to view its notes.';
            diagramWidget = null;
            return;
        }
        if (!window.MiniFretboard) {
            host.textContent = 'Fretboard diagrams are unavailable in this browser.';
            if (caption) caption.textContent = '';
            return;
        }
        const root = noteAtOffset(state.key, step.offset);
        const name = names[step.kind]?.[step.item] || step.item;
        const options = { key: root, type: step.kind, id: step.item, labels: 'intervals', caption: name };
        if (caption) caption.textContent = 'Block ' + (index + 1) + ' · ' + root + ' ' + name + ' · ' + (step.beats / 4) + (step.beats === 4 ? ' bar' : ' bars');
        if (!diagramWidget) diagramWidget = MiniFretboard.widget(host, Object.assign({ keySelect: false, tuning: 'guitar' }, options));
        else diagramWidget.update(options);
    }

    function renderDiagramSelect() {
        const select = $('diagram-step');
        if (!select) return;
        const previous = Number(select.value);
        select.replaceChildren();
        if (!state.steps.length) {
            select.add(new Option('No blocks', ''));
            select.disabled = true;
            renderDiagram(-1);
            return;
        }
        select.disabled = false;
        state.steps.forEach((step, index) => {
            const root = noteAtOffset(state.key, step.offset);
            const name = names[step.kind]?.[step.item] || step.item;
            select.add(new Option('Block ' + (index + 1) + ' · ' + root + ' ' + name, String(index)));
        });
        select.value = String(Number.isInteger(previous) && previous >= 0 && previous < state.steps.length ? previous : 0);
        renderDiagram(Number(select.value));
    }

    function currentFavorite() {
        if (!state.steps.length) return null;
        const data = { key: state.key, tempo: Math.max(40, Math.min(220, Number($('pattern-tempo').value) || 100)), name: $('pattern-name').value.trim() || state.title, steps: state.steps.map(step => ({ ...step })) };
        const serialized = JSON.stringify(data);
        let hash = 2166136261;
        for (let i = 0; i < serialized.length; i++) hash = Math.imul(hash ^ serialized.charCodeAt(i), 16777619);
        const id = data.key + '-' + (hash >>> 0).toString(36);
        return { id, data };
    }

    function syncCurrentFavorite() {
        const button = $('favorite-current-pattern');
        if (!button) return;
        const favorite = currentFavorite();
        button.disabled = !favorite;
        const saved = !!(favorite && window.ST && ST.favorites && ST.favorites.has('pattern-studio', favorite.id));
        button.setAttribute('aria-pressed', String(saved));
        button.textContent = saved ? '★ Saved arrangement' : '☆ Favorite current';
    }

    function renderSteps() {
        const list = $('pattern-steps');
        list.replaceChildren();
        $('empty-track').hidden = state.steps.length > 0;
        $('export-midi').disabled = state.steps.length === 0;
        $('pattern-caption').textContent = state.title + ' · ' + state.steps.length + (state.steps.length === 1 ? ' block' : ' blocks');
        state.steps.forEach((step, index) => {
            const item = document.createElement('li');
            item.className = 'daw-step';
            item.dataset.step = String(index);
            const top = document.createElement('div');
            top.className = 'daw-step-top';
            const number = document.createElement('span');
            number.textContent = String(index + 1).padStart(2, '0');
            const type = document.createElement('span');
            type.textContent = step.kind;
            top.append(number, type);
            const label = document.createElement('p');
            label.className = 'daw-step-name';
            label.textContent = names[step.kind]?.[step.item] || step.item;
            const root = document.createElement('span');
            root.className = 'daw-step-root';
            root.textContent = noteAtOffset(state.key, step.offset) + ' · ' + rootLabel(step.offset) + ' · ' + (step.beats / 4) + (step.beats === 4 ? ' bar' : ' bars');
            const actions = document.createElement('div');
            actions.className = 'daw-step-actions';
            [['↑','Move up','up'],['↓','Move down','down'],['×','Remove','remove']].forEach(([text, labelText, action]) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = text;
                button.setAttribute('aria-label', labelText + ' block ' + (index + 1));
                button.dataset.action = action;
                actions.appendChild(button);
            });
            item.append(top, label, root, actions);
            list.appendChild(item);
        });
        renderDiagramSelect();
        syncCurrentFavorite();
    }

    function setKey(key) {
        if (!KEYS.includes(key)) return;
        if (!$('stop-arrangement').disabled) stopPlayback();
        const previousKey = state.key;
        state.key = key;
        if (state.title.endsWith(' - ' + previousKey)) {
            state.title = state.title.slice(0, -previousKey.length) + key;
        }
        $('pattern-key').value = key;
        renderSteps();
    }

    function loadPattern(pattern, allowEmpty) {
        const normalized = normalizePattern(pattern, !!allowEmpty);
        if (!normalized) { $('playback-status').textContent = 'This pattern has invalid or unsupported blocks.'; return false; }
        stopPlayback();
        state.key = normalized.key;
        state.title = normalized.name;
        state.sourceId = normalized.id || null;
        state.steps = normalized.steps;
        $('pattern-key').value = state.key;
        $('pattern-name').value = state.sourceId && state.sourceId.startsWith('preload-') ? '' : normalized.name;
        renderSteps();
        $('playback-status').textContent = 'Ready';
        return true;
    }

    function renderLibrary() {
        const input = $('library-search');
        const select = $('library-select');
        const query = input.value.trim().toLowerCase();
        const matches = PRELOADED_PATTERNS.filter(pattern => !query || (pattern.name + ' ' + pattern.family).toLowerCase().includes(query));
        const previous = select.value;
        select.replaceChildren();
        matches.forEach(pattern => select.add(new Option(pattern.name + ' · ' + pattern.family, pattern.id)));
        if (matches.some(pattern => pattern.id === previous)) select.value = previous;
        if (!matches.length) select.add(new Option('No matching patterns', ''));
    }

    function saveList() {
        try {
            const saved = JSON.parse(localStorage.getItem('st_daw_patterns_v1') || '[]');
            if (!Array.isArray(saved)) return [];
            const seen = new Set();
            return saved.map(item => normalizePattern(item, false)).filter(item => {
                if (!item || !item.id || seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
            });
        } catch (error) { return []; }
    }

    function patternSignature(pattern) {
        return JSON.stringify([pattern.name, pattern.key, pattern.steps]);
    }

    function nextPatternId(prefix, items) {
        let id;
        do { id = prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9); }
        while (items.some(item => item.id === id));
        return id;
    }

    function exportStatusFile() {
        if (!window.ST || !ST.download) { $('status-file-status').textContent = 'The local download helper is unavailable.'; return; }
        const current = {
            id: state.sourceId || '',
            name: $('pattern-name').value.trim() || state.title,
            key: state.key,
            tempo: Math.max(40, Math.min(220, Number($('pattern-tempo').value) || 100)),
            steps: state.steps.map(step => ({ ...step }))
        };
        const payload = {
            format: 'scales-thesaurus-pattern-studio-status',
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            current,
            savedPatterns: saveList(),
            selectedLibraryId: $('library-select').value || ''
        };
        ST.download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), 'pattern-studio-status.json');
        $('status-file-status').textContent = 'Current arrangement and saved patterns exported for use in another browser.';
    }

    async function importStatusFile(file) {
        const output = $('status-file-status');
        if (!file) return;
        try {
            if (file.size > 8 * 1024 * 1024) throw new Error('Choose a Pattern Studio status file under 8 MB.');
            const payload = JSON.parse(await file.text());
            if (!payload || payload.format !== 'scales-thesaurus-pattern-studio-status' || payload.schemaVersion !== 1) throw new Error('This is not a supported Pattern Studio status file.');
            const currentData = payload.current;
            const current = normalizePattern({ id: currentData?.id, name: currentData?.name, key: currentData?.key, steps: currentData?.steps }, true);
            if (!current) throw new Error('The saved current arrangement contains an unsupported key or block. Nothing was changed.');
            const currentBpm = Math.max(40, Math.min(220, Number(currentData.tempo) || 100));
            const existing = saveList();
            const signatures = new Set(existing.map(patternSignature));
            const merged = existing.slice();
            let imported = 0, skipped = 0;
            if (payload.savedPatterns !== undefined && !Array.isArray(payload.savedPatterns)) throw new Error('The saved pattern list in this status file is invalid.');
            const importedPatterns = payload.savedPatterns || [];
            const importLimit = 1000;
            for (const raw of importedPatterns.slice(0, importLimit)) {
                const normalized = normalizePattern(raw, false);
                if (!normalized) { skipped++; continue; }
                const signature = patternSignature(normalized);
                if (signatures.has(signature) || merged.length >= 1000) { skipped++; continue; }
                normalized.id = nextPatternId('imported', merged);
                signatures.add(signature);
                merged.push(normalized);
                imported++;
            }
            skipped += Math.max(0, importedPatterns.length - importLimit);
            if (!window.localStorage) throw new Error('Browser storage is unavailable. The current page was not changed.');
            try { localStorage.setItem('st_daw_patterns_v1', JSON.stringify(merged)); }
            catch (error) { throw new Error('Could not save imported patterns in this browser. The current page was not changed.'); }
            loadPattern(current, true);
            $('pattern-tempo').value = String(currentBpm);
            $('pattern-name').value = current.name;
            if (typeof payload.selectedLibraryId === 'string' && [...$('library-select').options].some(option => option.value === payload.selectedLibraryId)) {
                $('library-select').value = payload.selectedLibraryId;
            }
            renderSaved();
            output.textContent = 'Status restored. Merged ' + imported + ' saved patterns; skipped ' + skipped + ' invalid, duplicate, or excess entries.';
        } catch (error) {
            output.textContent = error.message || 'Could not import this status file.';
        }
    }

    function renderSaved() {
        const select = $('saved-patterns');
        const saved = saveList();
        select.replaceChildren();
        if (!saved.length) {
            select.add(new Option('No saved patterns', ''));
            $('load-saved').disabled = true;
            $('delete-saved').disabled = true;
            return;
        }
        saved.forEach(item => select.add(new Option(item.name + ' · ' + item.steps.length + ' blocks', item.id)));
        $('load-saved').disabled = false;
        $('delete-saved').disabled = false;
    }

    function flash(message) {
        $('save-status').textContent = message;
        window.setTimeout(() => { if ($('save-status').textContent === message) $('save-status').textContent = ''; }, 2600);
    }

    function stopPlayback() {
        playToken++;
        timers.forEach(timer => clearTimeout(timer));
        timers.clear();
        if (window.STAudioPreview) window.STAudioPreview.stop();
        document.querySelectorAll('.daw-step.is-active').forEach(item => item.classList.remove('is-active'));
        $('play-arrangement').disabled = false;
        $('stop-arrangement').disabled = true;
        $('playback-status').textContent = 'Ready';
    }

    async function playArrangementCycle(currentToken, playable, bpm) {
        try {
            const duration = await window.STAudioPreview.playArrangement(playable, theory, bpm);
            if (!duration) throw new Error('Audio is unavailable in this browser.');
            if (currentToken !== playToken) return;
            $('playback-status').textContent = 'Playing';
            let elapsed = 0;
            const beatMs = 60000 / bpm;
            const audioLeadMs = 60;
            state.steps.forEach((step, index) => {
                const start = elapsed;
                const blockDuration = step.beats * beatMs;
                const startTimer = setTimeout(() => {
                    timers.delete(startTimer);
                    if (currentToken !== playToken) return;
                    document.querySelectorAll('.daw-step.is-active').forEach(item => item.classList.remove('is-active'));
                    document.querySelector('.daw-step[data-step="' + index + '"]')?.classList.add('is-active');
                    $('diagram-step').value = String(index);
                    renderDiagram(index);
                    $('playback-status').textContent = 'Playing block ' + (index + 1) + ' of ' + state.steps.length;
                }, start + audioLeadMs);
                timers.add(startTimer);
                elapsed += blockDuration;
            });
            const endTimer = setTimeout(() => {
                timers.delete(endTimer);
                if (currentToken !== playToken) return;
                if ($('loop-arrangement').checked) playArrangementCycle(currentToken, playable, bpm);
                else stopPlayback();
            }, duration + audioLeadMs + 40);
            timers.add(endTimer);
        } catch (error) {
            if (currentToken === playToken) {
                stopPlayback();
                $('playback-status').textContent = error.message || 'Could not start playback';
            }
        }
    }

    function playArrangement() {
        if (!state.steps.length) {
            $('playback-status').textContent = 'Add a block first';
            return;
        }
        stopPlayback();
        const currentToken = ++playToken;
        const bpm = Math.max(40, Math.min(220, Number($('pattern-tempo').value) || 100));
        $('pattern-tempo').value = String(bpm);
        const playable = state.steps.map(step => ({ ...step, key: state.key }));
        $('play-arrangement').disabled = true;
        $('stop-arrangement').disabled = false;
        $('playback-status').textContent = 'Starting...';
        playArrangementCycle(currentToken, playable, bpm);
    }

    KEYS.forEach(key => $('pattern-key').add(new Option(key, key)));
    ROOTS.forEach(([label, offset]) => $('block-root').add(new Option(label, String(offset))));
    $('preload-count').textContent = String(PRELOADED_PATTERNS.length);
    $('block-kind').addEventListener('change', fillPatternTypes);
    fillPatternTypes();
    renderLibrary();
    renderSaved();

    $('library-search').addEventListener('input', renderLibrary);
    $('load-pattern').addEventListener('click', () => loadPattern(PRELOADED_PATTERNS.find(pattern => pattern.id === $('library-select').value)));
    $('diagram-step').addEventListener('change', event => renderDiagram(Number(event.target.value)));
    $('pattern-name').addEventListener('input', syncCurrentFavorite);
    $('pattern-key').addEventListener('change', event => setKey(event.target.value));
    $('pattern-tempo').addEventListener('change', event => {
        const bpm = Math.max(40, Math.min(220, Number(event.target.value) || 100));
        event.target.value = String(bpm);
        syncCurrentFavorite();
        if (!$('stop-arrangement').disabled) {
            stopPlayback();
            $('playback-status').textContent = 'Tempo changed; press Play to restart';
        }
    });
    $('add-block').addEventListener('click', () => {
        const kind = $('block-kind').value;
        const step = { kind, item: $('block-reference').value, offset: Number($('block-root').value), beats: Number($('block-bars').value) * 4 };
        if (!step.item || !resolveNotes(step, state.key).length) {
            $('playback-status').textContent = 'Choose a valid ' + kind + ' reference';
            return;
        }
        if (state.steps.length >= 256) { $('playback-status').textContent = 'An arrangement can contain at most 256 blocks.'; return; }
        if (!$('stop-arrangement').disabled) stopPlayback();
        state.steps.push(step);
        state.sourceId = null;
        state.title = $('pattern-name').value.trim() || 'Custom pattern';
        renderSteps();
        $('playback-status').textContent = 'Block added';
    });
    $('pattern-steps').addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const index = Number(button.closest('.daw-step').dataset.step);
        if (!$('stop-arrangement').disabled) stopPlayback();
        if (button.dataset.action === 'remove') state.steps.splice(index, 1);
        if (button.dataset.action === 'up' && index > 0) [state.steps[index - 1], state.steps[index]] = [state.steps[index], state.steps[index - 1]];
        if (button.dataset.action === 'down' && index < state.steps.length - 1) [state.steps[index + 1], state.steps[index]] = [state.steps[index], state.steps[index + 1]];
        renderSteps();
    });
    $('save-pattern').addEventListener('click', () => {
        const name = $('pattern-name').value.trim();
        if (!name) { flash('Enter a name for this pattern.'); $('pattern-name').focus(); return; }
        if (!state.steps.length) { flash('Add at least one block before saving.'); return; }
        const saved = saveList();
        const draft = { name, key: state.key, steps: state.steps.map(step => ({ ...step })) };
        const duplicate = saved.find(item => patternSignature(item) === patternSignature(draft));
        if (duplicate) { $('saved-patterns').value = duplicate.id; flash('This pattern is already saved.'); return; }
        if (saved.length >= 1000) { flash('This browser already has 1,000 saved patterns. Export a status backup before removing any.'); return; }
        const entry = { ...draft, id: nextPatternId('saved', saved) };
        saved.push(entry);
        try {
            localStorage.setItem('st_daw_patterns_v1', JSON.stringify(saved));
            state.title = name;
            state.sourceId = entry.id;
            renderSteps();
            renderSaved();
            $('saved-patterns').value = entry.id;
            flash('Saved on this device.');
        } catch (error) { flash('Device storage is full or unavailable.'); }
    });
    $('load-saved').addEventListener('click', () => loadPattern(saveList().find(item => item.id === $('saved-patterns').value)));
    $('delete-saved').addEventListener('click', () => {
        const selected = $('saved-patterns').value;
        if (!selected) return;
        try {
            localStorage.setItem('st_daw_patterns_v1', JSON.stringify(saveList().filter(item => item.id !== selected)));
            renderSaved();
            flash('Pattern deleted from this device.');
        } catch (error) { flash('Could not update device storage.'); }
    });
    $('favorite-current-pattern').addEventListener('click', () => {
        const favorite = currentFavorite();
        if (!favorite || !window.ST || !ST.favorites) return;
        const result = ST.favorites.toggle({
            type: 'pattern-studio', id: favorite.id, title: favorite.data.name,
            href: 'daw.html?favorite=' + encodeURIComponent(favorite.id), data: favorite.data
        });
        $('save-status').textContent = result.ok
            ? (result.saved ? 'Arrangement saved to Favorites.' : 'Arrangement removed from Favorites.')
            : 'Could not update Favorites. Check device storage.';
        syncCurrentFavorite();
    });
    window.addEventListener('st:favoriteschange', syncCurrentFavorite);
    $('export-status').addEventListener('click', exportStatusFile);
    $('import-status-button').addEventListener('click', () => $('import-status-file').click());
    $('import-status-file').addEventListener('change', async event => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (file) await importStatusFile(file);
    });
    $('export-midi').addEventListener('click', () => {
        const status = $('midi-status');
        try {
            const bpm = Math.max(40, Math.min(220, Number($('pattern-tempo').value) || 100));
            $('pattern-tempo').value = String(bpm);
            const title = $('pattern-name').value.trim() || state.title;
            const bytes = window.STDAWMidi.createMidi(state.steps, theory, state.key, bpm, title);
            const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/midi' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = (title.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'pattern') + '.mid';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            status.textContent = 'MIDI exported.';
        } catch (error) {
            status.textContent = error.message || 'Could not export MIDI.';
        }
    });
    async function exportAllMidiZip() {
        const button = $('export-midi-zip');
        const status = $('midi-status');
        if (!window.JSZip || !window.STDAWMidi) {
            status.textContent = 'The bundled MIDI or ZIP exporter is unavailable.';
            return;
        }
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Preparing MIDI files...';
        status.textContent = 'Exporting the pattern library, saved patterns, and current arrangement...';
        try {
            const currentName = $('pattern-name').value.trim() || state.title || 'Current arrangement';
            const patterns = PRELOADED_PATTERNS.map(pattern => ({ ...pattern, source: 'Library' }))
                .concat(saveList().map(pattern => ({ ...pattern, source: 'Saved' })))
                .concat(state.steps.length ? [{ id: 'current', name: currentName, key: state.key, steps: state.steps.map(step => ({ ...step })), source: 'Current' }] : []);
            const zip = new JSZip();
            const compiledSteps = [];
            const skipped = [];
            const safeName = value => String(value || 'pattern').normalize('NFKD').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 72) || 'pattern';
            const bpm = Math.max(40, Math.min(220, Number($('pattern-tempo').value) || 100));

            for (let index = 0; index < patterns.length; index++) {
                const pattern = patterns[index];
                const key = KEYS.includes(pattern.key) ? pattern.key : 'C';
                const title = pattern.name || 'Pattern ' + (index + 1);
                try {
                    const steps = pattern.steps.map((step, stepIndex) => ({
                        ...step,
                        key,
                        label: stepIndex === 0 ? title : undefined
                    }));
                    const bytes = window.STDAWMidi.createMidi(steps, theory, key, bpm, title);
                    const keyFolder = zip.folder(safeName(key.replace('#', 'sharp')));
                    keyFolder.file(String(index + 1).padStart(4, '0') + '-' + safeName(pattern.source) + '-' + safeName(pattern.id || title) + '.mid', bytes);
                    compiledSteps.push(...steps);
                    if (compiledSteps.length && index < patterns.length - 1) {
                        compiledSteps.push({ kind: 'rest', beats: 1, offset: 0, label: 'End of ' + title });
                    }
                } catch (error) {
                    skipped.push(title + ': ' + (error.message || 'invalid MIDI pattern'));
                }
                if ((index + 1) % 20 === 0) {
                    button.textContent = 'Encoding ' + (index + 1) + ' / ' + patterns.length;
                    status.textContent = 'Encoding pattern ' + (index + 1) + ' of ' + patterns.length + '...';
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            if (!compiledSteps.length) throw new Error('No valid patterns were available to export.');
            const compiled = window.STDAWMidi.createMidi(compiledSteps, theory, 'C', bpm, 'All Pattern Studio Patterns');
            zip.file('all-patterns-compiled.mid', compiled);
            zip.file('README.txt', [
                'PATTERN STUDIO MIDI EXPORT',
                '',
                'Individual MIDI files contain the bundled preloaded patterns, patterns saved on this device, and the current arrangement.',
                'all-patterns-compiled.mid plays the exported patterns sequentially, with marker events naming each pattern.',
                'Tempo: ' + bpm + ' BPM',
                'Exported patterns: ' + (patterns.length - skipped.length),
                'Skipped invalid patterns: ' + skipped.length,
                ...skipped.map(item => '- ' + item)
            ].join('\n'));
            status.textContent = 'Compressing ' + (patterns.length - skipped.length) + ' individual MIDI files and the compiled file...';
            button.textContent = 'Compressing...';
            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } }, metadata => {
                status.textContent = 'Compressing MIDI ZIP... ' + Math.round(metadata.percent) + '%';
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Pattern-Studio-All-MIDI.zip';
            link.rel = 'noopener';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            status.textContent = 'Downloaded ' + (patterns.length - skipped.length) + ' individual MIDI files, the compiled MIDI, and a README.';
        } catch (error) {
            status.textContent = error.message || 'Could not create the MIDI ZIP.';
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    $('export-midi-zip').addEventListener('click', exportAllMidiZip);
    $('play-arrangement').addEventListener('click', playArrangement);
    $('stop-arrangement').addEventListener('click', stopPlayback);
    window.addEventListener('pagehide', stopPlayback, { once: true });

    window.STDAW = { patterns: PRELOADED_PATTERNS, templates: TEMPLATES };
    let initialPattern = PRELOADED_PATTERNS[0];
    try {
        const favoriteId = new URLSearchParams(location.search).get('favorite');
        const favorites = JSON.parse(localStorage.getItem('st_favorites_v1') || '[]');
        const favorite = Array.isArray(favorites) && favorites.find(item => item && item.type === 'pattern-studio' && item.id === favoriteId);
        if (favorite && favorite.data) {
            const restored = normalizePattern({ id: 'favorite-' + favorite.id, name: favorite.data.name, key: favorite.data.key, steps: favorite.data.steps }, true);
            if (restored) {
                initialPattern = restored;
                $('pattern-tempo').value = String(Math.max(40, Math.min(220, Number(favorite.data.tempo) || 100)));
            }
        }
    } catch (error) {}
    loadPattern(initialPattern, true);
    window.addEventListener('st:favoriteschange', syncCurrentFavorite);
    document.addEventListener('DOMContentLoaded', syncCurrentFavorite, { once: true });
})();
