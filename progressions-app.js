/**
 * Chord Progressions (v1.0) - previously an "under construction" page.
 * Build progressions from the diatonic chords of any key, hear them and transpose instantly.
 * Pure Web Audio - no network needed.
 */
(function () {
    'use strict';
    const mt = new MusicTheory();
    const DAW_CORE = window.TD && window.TD['daw-core.js'];
    const DAW_PRESETS = window.TD && window.TD['daw-presets.js'] ? window.TD['daw-presets.js'].PRESETS : [];
    const dawPresetKey = preset => JSON.stringify([preset.group, preset.scale, preset.name, preset.prog]);
    const DAW_PRESET_BY_ID = new Map(DAW_PRESETS.map(preset => [dawPresetKey(preset), preset]));
    const MINOR_SCALES = new Set(['Natural minor (Aeolian)', 'Harmonic minor', 'Melodic minor', 'Dorian', 'Phrygian', 'Locrian']);
    const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const MINOR_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
    const SYMBOL = { major: '', minor: 'm', diminished: 'dim', augmented: 'aug', major7: 'maj7', minor7: 'm7', dominant7: '7', half_diminished: 'm7b5', diminished7: 'dim7' };
    const EXTRA_CHORD_TYPES = Object.keys(mt.chords)
        .filter(id => id.startsWith('more_chord_') && Array.isArray(mt.chords[id].intervals) && mt.chords[id].intervals.length >= 2 && mt.chords[id].intervals.every(interval => mt.getIntervalSemitones(interval) !== null))
        .slice(0, 50);
    const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const PRESETS = {
        major: [['Pop (I-V-vi-IV)', [0, 4, 5, 3]], ['Classic rock (I-IV-V)', [0, 3, 4, 0]], ['50s (I-vi-IV-V)', [0, 5, 3, 4]], ['Jazz ii-V-I', [1, 4, 0, 0]],
            ['Circle (vi-ii-V-I)', [5, 1, 4, 0]], ['Pachelbel', [0, 4, 5, 2, 3, 0, 3, 4]], ['Sensitive (vi-IV-I-V)', [5, 3, 0, 4]], ['12-bar blues', [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4]]],
        minor: [['Andalusian (i-VII-VI-V)', [0, 6, 5, 4]], ['Epic (i-VI-III-VII)', [0, 5, 2, 6]], ['Minor blues (i-iv-v)', [0, 3, 4, 0]], ['Aeolian vamp (i-VII-VI-VII)', [0, 6, 5, 6]], ['Minor ii-V-i', [1, 4, 0, 0]]]
    };
    const ROMAN_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const ROMAN_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
    const FUNCTIONS_MAJOR = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading-tone'];
    const FUNCTIONS_MINOR = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'subtonic'];
    function progressionDescription(mode, sequence) {
        const functions = mode === 'major' ? FUNCTIONS_MAJOR : FUNCTIONS_MINOR;
        const romanSet = mode === 'major' ? ROMAN_MAJOR : ROMAN_MINOR;
        const roles = sequence.map(degree => functions[degree] || 'unknown function');
        const romanLine = sequence.map(degree => romanSet[degree] || '?').join(' - ');
        const last = sequence[sequence.length - 1];
        const previous = sequence[sequence.length - 2];
        let cadence;
        if (last === 0 && previous === 4) cadence = 'The dominant resolves directly to the tonic for a strong ending.';
        else if (last === 0) cadence = 'It lands on the tonic, giving the loop a clear home base.';
        else if (last === 4) cadence = 'It ends on the dominant, leaving a natural pull back to the tonic.';
        else if (last === 5) cadence = 'It ends on the submediant, keeping the color open and reflective.';
        else cadence = 'Its final ' + roles[roles.length - 1] + ' chord leaves room to continue or repeat the loop.';
        const motion = roles.map((role, index) => (index ? 'then ' : 'opens on ') + role).join(', ');
        const color = sequence.includes(1) ? 'The supertonic adds a pre-dominant lift.' : sequence.includes(5) ? 'The submediant supplies a relative-minor color.' : sequence.includes(3) ? 'The subdominant gives the motion a broad, settled lift.' : 'The changing scale degrees create contrast without leaving the key.';
        return 'In ' + mode + ', ' + romanLine + ' ' + motion + '. ' + color + ' ' + cadence + ' Try one bar per chord, then shorten the last two bars to hear the cadence more clearly.';
    }
    function cadenceName(mode, sequence) {
        const functions = mode === 'major' ? FUNCTIONS_MAJOR : FUNCTIONS_MINOR;
        const last = sequence[sequence.length - 1];
        const previous = sequence[sequence.length - 2];
        if (last === 0 && previous === 4) return 'Dominant Return';
        if (last === 0) return 'Tonic Landing';
        if (last === 4) return 'Open Dominant';
        if (sequence.includes(5)) return 'Relative-Minor Color';
        return functions[last].replace('-', ' ') + ' Ending';
    }
    function progressionPresets(mode, count) {
        const romanSet = mode === 'major' ? ROMAN_MAJOR : ROMAN_MINOR;
        const existing = new Set(PRESETS[mode].map(([, seq]) => seq.join(',')));
        const candidates = [];
        for (let a = 0; a < 7; a++) for (let b = 0; b < 7; b++) for (let c = 0; c < 7; c++) for (let d = 0; d < 7; d++) {
            const seq = [a, b, c, d], signature = seq.join(',');
            if (existing.has(signature) || new Set(seq).size === 1) continue;
            const score = (a === 0 ? 5 : 0) + (d === 0 ? 4 : 0) + (seq.includes(4) ? 3 : 0) +
                (seq.includes(5) ? 2 : 0) + (seq.includes(mode === 'major' ? 3 : 5) ? 1 : 0) -
                seq.reduce((n, degree, i) => n + (i && degree === seq[i - 1] ? 2 : 0), 0);
            candidates.push({ seq, signature, score });
        }
        candidates.sort((x, y) => y.score - x.score || x.signature.localeCompare(y.signature));
        return candidates.slice(0, count).map(({ seq }) => {
            const romanLine = seq.map(degree => romanSet[degree]).join(' - ');
            const name = (mode === 'major' ? 'Major' : 'Minor') + ' · ' + cadenceName(mode, seq) + ' · ' + romanLine;
            return [name, seq, progressionDescription(mode, seq)];
        });
    }
    PRESETS.major = PRESETS.major.map(([name, sequence]) => [name, sequence, progressionDescription('major', sequence)]);
    PRESETS.minor = PRESETS.minor.map(([name, sequence]) => [name, sequence, progressionDescription('minor', sequence)]);
    PRESETS.major.push(...progressionPresets('major', 250 - PRESETS.major.length));
    PRESETS.minor.push(...progressionPresets('minor', 250 - PRESETS.minor.length));
    window.STProgressionPresets = PRESETS;

    const STORE = 'st_progression';
    let S = null; // loaded on DOMContentLoaded (site.js / ST is deferred)

    const idx = n => mt.notes.indexOf(mt.toSharp(n));
    function identify(notes) {
        const r = idx(notes[0]);
        const set = notes.map(n => (idx(n) - r + 12) % 12).sort((a, b) => a - b).join(',');
        const ids = Object.keys(SYMBOL).concat(Object.keys(mt.chords).filter(id => !Object.hasOwn(SYMBOL, id)));
        return ids.find(id => {
            const chord = mt.chords[id];
            return chord && Array.isArray(chord.intervals) && chord.intervals.every(iv => mt.getIntervalSemitones(iv) !== null) &&
                chord.intervals.map(iv => ((mt.getIntervalSemitones(iv) % 12) + 12) % 12).sort((a, b) => a - b).join(',') === set;
        }) || null;
    }
    function normalizeSequence(sequence) {
        if (!Array.isArray(sequence) || sequence.length > 256) return null;
        const cleaned = [];
        for (const item of sequence) {
            if (Number.isInteger(item) && item >= 0 && item < 7) cleaned.push(item);
            else if (item && item.type === 'daw' && typeof item.token === 'string' && typeof item.scale === 'string' && DAW_CORE) {
                const scale = DAW_CORE.scaleByName(item.scale);
                if (!scale || !DAW_CORE.chordFromNumeral(item.token, scale)) return null;
                const duration = item.duration === undefined ? 1 : Number(item.duration);
                if (!Number.isFinite(duration) || duration <= 0 || duration > 1) return null;
                cleaned.push({ type: 'daw', token: item.token, scale: item.scale, duration });
            } else return null;
        }
        return cleaned;
    }
    function modeForScale(scale) { return MINOR_SCALES.has(scale) ? 'minor' : 'major'; }
    function presetSteps(preset) {
        return preset.prog.trim().split(/\s+/).flatMap(bar => {
            const tokens = bar.split('+');
            return tokens.map(token => ({ type: 'daw', token, scale: preset.scale, duration: 1 / tokens.length }));
        });
    }
    function roman(i, id) {
        const r = ROMAN[i], lo = r.toLowerCase();
        return { minor: lo, minor7: lo + '7', diminished: lo + '°', half_diminished: lo + 'ø7', diminished7: lo + '°7', augmented: r + '+', major7: r + 'maj7', dominant7: r + '7' }[id] || r;
    }
    function customRoman(i, id) {
        const formula = mt.chords[id].intervals;
        const minorThird = formula.includes('b3'), majorThird = formula.includes('3');
        const base = minorThird && !majorThird ? ROMAN[i].toLowerCase() : ROMAN[i];
        if (minorThird && formula.includes('b5')) {
            if (formula.includes('bb7')) return base + '°7';
            if (formula.includes('b7')) return base + 'ø7';
            return base + '°';
        }
        if (majorThird && formula.includes('#5')) return base + '+';
        return base;
    }
    function chordSymbol(chordRoot, id) {
        if (!id) return chordRoot;
        if (SYMBOL[id] !== undefined) return chordRoot + SYMBOL[id];
        return chordRoot + ' ' + (mt.chords[id]?.name || id);
    }
    function chords() {
        const scaleId = S.mode === 'major' ? 'major' : 'natural_minor';
        const scaleNotes = mt.getScaleNotes(S.key, scaleId);
        return scaleNotes.map((chordRoot, i) => {
            if (S.quality !== 'diatonic' && mt.chords[S.quality]) {
                const id = S.quality;
                const notes = mt.getChordNotes(chordRoot, id);
                return { root: chordRoot, notes, id, symbol: chordSymbol(chordRoot, id), numeral: customRoman(i, id), chordName: mt.chords[id].name };
            }
            const notes = [];
            for (let k = 0; k < (S.sevenths ? 4 : 3); k++) notes.push(scaleNotes[(i + k * 2) % 7]);
            // Minor-key dominant: raise the diatonic fifth scale degree to make V resolve clearly.
            if (S.mode === 'minor' && i === 4) notes[1] = /b$/.test(notes[1]) ? notes[1].slice(0, -1) : notes[1] + '#';
            const id = identify(notes);
            return { root: chordRoot, notes, id, symbol: chordSymbol(chordRoot, id), numeral: roman(i, id) };
        });
    }
    function progressionDuration(stepValue) { return stepValue && stepValue.type === 'daw' ? stepValue.duration : 1; }
    function progressionChord(stepValue) {
        if (Number.isInteger(stepValue)) return chords()[stepValue];
        if (!stepValue || stepValue.type !== 'daw' || !DAW_CORE) return null;
        const scale = DAW_CORE.scaleByName(stepValue.scale);
        const parsed = scale && DAW_CORE.chordFromNumeral(stepValue.token, scale);
        if (!parsed) return null;
        const keyPc = idx(S.key);
        const parts = DAW_CORE.chordParts(parsed, { scale });
        const rootPc = ((keyPc + parts.root) % 12 + 12) % 12;
        const root = mt.notes[rootPc];
        const notes = parts.shape.map(semitones => mt.notes[(rootPc + semitones) % 12]);
        const context = { key: S.key, keyPc, scale };
        return {
            root, notes, id: identify(notes) || 'major',
            symbol: DAW_CORE.chordName(parsed, context),
            numeral: DAW_CORE.chordRoman(parsed, context)
        };
    }

    // ---------- audio ----------
    let ctx = null, timer = null, step = 0, playbackId = 0, starting = false;
    const activeVoices = new Set();
    async function ensureAudio() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error('Web Audio is not supported in this browser.');
        if (!ctx) ctx = new AudioContextClass();
        if (ctx.state !== 'running') await ctx.resume();
        if (ctx.state !== 'running') throw new Error('Audio is still suspended. Tap Play again to allow audio.');
    }
    function voice(notes, when, dur) {
        const out = ctx.createGain();
        out.gain.setValueAtTime(0.0001, when);
        out.gain.exponentialRampToValueAtTime(0.22, when + 0.02);
        out.gain.setValueAtTime(0.22, when + dur * 0.72);
        out.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        out.connect(ctx.destination);
        let prev = -1, oct = 3;
        const freqs = notes.map(n => { const i = idx(n); if (i <= prev) oct++; prev = i; return mt.getNoteFrequency(n, oct); });
        freqs.unshift(mt.getNoteFrequency(notes[0], 2));
        freqs.forEach((f, i) => {
            if (!f) return;
            const o = ctx.createOscillator();
            o.type = i === 0 ? 'sine' : 'triangle';
            o.frequency.value = f;
            const g = ctx.createGain(); g.gain.value = i === 0 ? 0.9 : 0.45;
            o.connect(g); g.connect(out);
            const active = { oscillator: o, output: out };
            activeVoices.add(active);
            o.onended = () => activeVoices.delete(active);
            o.start(when); o.stop(when + dur + 0.05);
        });
    }
    async function play() {
        if (!S.prog.length) return;
        stop(true);
        const token = playbackId;
        starting = true;
        el.play.disabled = false;
        el.play.textContent = 'Starting...';
        try {
            await ensureAudio();
            if (token !== playbackId) return;
            starting = false;
            step = 0;
            const bar = 240 / S.bpm;
            const tick = () => {
                if (token !== playbackId) return;
                if (!S.prog.length) return stop();
                const i = step % S.prog.length;
                const stepValue = S.prog[i];
                const chord = progressionChord(stepValue);
                if (!chord) return stop();
                const duration = bar * progressionDuration(stepValue);
                voice(chord.notes, ctx.currentTime + 0.04, duration * 0.95);
                highlight(i);
                step++;
                timer = setTimeout(tick, duration * 1000);
            };
            tick();
            el.play.disabled = false;
            el.play.textContent = 'Stop';
        } catch (error) {
            if (token === playbackId) {
                console.warn('Chord progression playback failed:', error);
                starting = false;
                el.play.disabled = false;
                el.play.textContent = 'Play';
                el.play.title = error.message || 'Audio playback is unavailable.';
                highlight(-1);
            }
        }
    }
    function stop(silent) {
        playbackId++;
        starting = false;
        clearTimeout(timer); timer = null;
        if (ctx) {
            const now = ctx.currentTime;
            activeVoices.forEach(voice => {
                try {
                    voice.output.gain.cancelScheduledValues(now);
                    voice.output.gain.setTargetAtTime(0.0001, now, 0.012);
                    voice.oscillator.stop(now + 0.05);
                } catch (error) {}
            });
            activeVoices.clear();
        }
        if (!silent) {
            el.play.disabled = false;
            el.play.textContent = 'Play';
            highlight(-1);
        }
    }
    function highlight(i) {
        [...el.prog.children].forEach((c, j) => c.classList.toggle('playing', j === i));
        if (i >= 0 && S.prog[i] != null) showChord(progressionChord(S.prog[i]));
    }
    let fbw = null;
    function showChord(c) {
        if (!c || !window.MiniFretboard) return;
        const o = { key: c.root, type: 'chord', id: c.id || 'major', caption: c.symbol + ' (' + c.numeral + ')' };
        if (!fbw) fbw = MiniFretboard.widget(el.fb, Object.assign({ keySelect: false }, o)); else fbw.update(o);
    }

    // ---------- UI ----------
    const el = {};
    function save() { ST.setJSON(STORE, S); }
    function favoriteSnapshot() {
        const sequence = S.prog.map(item => Number.isInteger(item) ? item : { type: 'daw', token: item.token, scale: item.scale, duration: item.duration });
        const dawPreset = DAW_PRESET_BY_ID.get(S.dawPreset);
        const builtIn = !dawPreset && sequence.every(Number.isInteger)
            ? PRESETS[S.mode].find(item => item[1].join(',') === sequence.join(',')) : null;
        const name = dawPreset ? dawPreset.name : builtIn ? builtIn[0] : 'Custom ' + (S.mode === 'major' ? 'major' : 'minor') + ' progression';
        let id = S.mode + '|' + S.key + '|' + S.quality + '|' + sequence.join('-');
        if (dawPreset || !sequence.every(Number.isInteger)) {
            const raw = JSON.stringify([S.dawPreset || '', sequence]);
            let hash = 2166136261;
            for (let i = 0; i < raw.length; i++) hash = Math.imul(hash ^ raw.charCodeAt(i), 16777619);
            id = S.mode + '|' + S.key + '|' + (hash >>> 0).toString(36);
        }
        const explanation = dawPreset ? dawPreset.group + ' · ' + dawPreset.scale + ' · ' + dawPreset.prog : builtIn ? builtIn[2] : '';
        return { id, name, data: { mode: S.mode, key: S.key, quality: S.quality, sevenths: S.sevenths, bpm: S.bpm, sequence, dawPreset: S.dawPreset || null, name, explanation } };
    }
    function syncFavoriteButton() {
        if (!el.favorite) return;
        const favorite = favoriteSnapshot();
        const saved = !!(window.ST && ST.favorites && ST.favorites.has('progression', favorite.id));
        el.favorite.disabled = !S.prog.length && !saved;
        el.favorite.setAttribute('aria-pressed', String(saved));
        el.favorite.textContent = saved ? '★ Saved progression' : '☆ Favorite progression';
    }
    function renderPresetCatalog() {
        const source = PRESETS[S.mode];
        const query = (el.presetSearch.value || '').trim().toLocaleLowerCase().replace(/\bb(?=[iv])/g, '♭');
        const matchesText = text => !query || String(text).toLocaleLowerCase().replace(/\bb(?=[iv])/g, '♭').includes(query);
        const builtInMatches = source.map((preset, index) => ({ preset, index }))
            .filter(({ preset }) => matchesText(preset[0] + ' ' + preset[2]));
        const dawMatches = DAW_PRESETS.map(preset => ({ preset, id: dawPresetKey(preset) }))
            .filter(({ preset }) => matchesText(preset.group + ' ' + preset.name + ' ' + preset.scale + ' ' + preset.prog));
        const totalMatches = builtInMatches.length + dawMatches.length;
        el.preset.replaceChildren(new Option(totalMatches ? 'Choose progression…' : 'No matches', ''));
        const appendGroup = (label, entries) => {
            if (!entries.length) return;
            const group = document.createElement('optgroup');
            group.label = label;
            entries.forEach(({ preset, value }) => group.appendChild(new Option(preset[0] || preset.name, value)));
            el.preset.appendChild(group);
        };
        appendGroup('Built-in · ' + S.mode, builtInMatches.map(({ preset, index }) => ({ preset, value: 'builtin:' + index })));
        const dawGroups = new Map();
        dawMatches.forEach(entry => {
            if (!dawGroups.has(entry.preset.group)) dawGroups.set(entry.preset.group, []);
            dawGroups.get(entry.preset.group).push({ preset: entry.preset, value: 'daw:' + entry.id });
        });
        dawGroups.forEach((entries, group) => appendGroup('Theory Decks DAW · ' + group, entries));
        const activeIndex = S.prog.every(Number.isInteger)
            ? source.findIndex(([, sequence]) => sequence.join(',') === S.prog.join(',')) : -1;
        const activeDawPreset = DAW_PRESET_BY_ID.get(S.dawPreset);
        if (activeDawPreset && dawMatches.some(({ id }) => id === S.dawPreset)) el.preset.value = 'daw:' + S.dawPreset;
        else if (activeIndex >= 0 && builtInMatches.some(({ index }) => index === activeIndex)) el.preset.value = 'builtin:' + activeIndex;
        const total = PRESETS.major.length + PRESETS.minor.length + DAW_PRESETS.length;
        el.presetCount.textContent = query
            ? totalMatches + ' matches · ' + total.toLocaleString() + ' total'
            : source.length + ' built-in in this mode + ' + DAW_PRESETS.length + ' DAW · ' + total.toLocaleString() + ' total';
        if (activeDawPreset) el.presetInfo.textContent = activeDawPreset.name + '. ' + activeDawPreset.group + ' · ' + activeDawPreset.scale + ' · ' + activeDawPreset.prog.split(/\s+/).map(bar => bar.replace(/\+/g, ' + ')).join(' | ');
        else if (activeIndex >= 0) el.presetInfo.textContent = source[activeIndex][0] + '. ' + source[activeIndex][2];
        else if (S.prog.length) el.presetInfo.textContent = 'Custom progression · ' + S.prog.map(item => Number.isInteger(item) ? (S.mode === 'major' ? ROMAN_MAJOR : ROMAN_MINOR)[item] : item.token).join(' - ');
        else el.presetInfo.textContent = 'Choose a preset to see its harmonic explanation.';
    }
    function render() {
        const cs = chords();
        el.palette.innerHTML = '';
        cs.forEach((c, i) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'cp-chord';
            b.innerHTML = '<b></b><small></small>';
            b.querySelector('b').textContent = c.symbol;
            b.querySelector('small').textContent = c.numeral;
            b.title = c.notes.join(' ');
            b.addEventListener('click', async () => {
                if (timer || starting) stop();
                else stop(true);
                S.prog.push(i); S.dawPreset = null; el.mode.value = S.mode; save(); render(); showChord(c);
                try {
                    await ensureAudio();
                    voice(c.notes, ctx.currentTime + 0.04, 1.2);
                } catch (error) {
                    console.warn('Chord preview failed:', error);
                    el.play.title = error.message || 'Audio playback is unavailable.';
                }
            });
            el.palette.appendChild(b);
        });
        el.prog.innerHTML = '';
        S.prog.forEach((d, j) => {
            const c = progressionChord(d);
            if (!c) return;
            const chip = document.createElement('div');
            chip.className = 'cp-step';
            chip.innerHTML = '<a></a><small></small><span class="cp-notes"></span><button type="button" aria-label="Remove">×</button>';
            const a = chip.querySelector('a');
            a.textContent = c.symbol;
            a.href = 'fretboard.html?key=' + encodeURIComponent(c.root) + '&patternType=chord&pattern=' + encodeURIComponent(c.id || 'major');
            a.title = 'Open on the fretboard';
            chip.querySelector('small').textContent = c.numeral;
            chip.querySelector('.cp-notes').textContent = c.notes.join(' ');
            chip.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); stop(); S.prog.splice(j, 1); S.dawPreset = null; el.mode.value = S.mode; save(); render(); });
            chip.addEventListener('click', () => showChord(c));
            el.prog.appendChild(chip);
        });
        if (!S.prog.length) el.prog.innerHTML = '<p class="cp-empty">Tap chords above to build a progression.</p>';
        el.quality.value = S.quality;
        el.sevenths.disabled = S.quality !== 'diatonic';
        renderPresetCatalog();
        syncFavoriteButton();
        el.play.disabled = !S.prog.length;
        el.clear.disabled = !S.prog.length;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('cp-key')) return;
        S = Object.assign({ key: 'C', mode: 'major', sevenths: false, quality: 'diatonic', prog: [0, 4, 5, 3], bpm: 90, dawPreset: null }, ST.getJSON(STORE, {}) || {});
        if (S.mode !== 'minor') S.mode = 'major';
        S.sevenths = S.sevenths === true;
        if (!EXTRA_CHORD_TYPES.includes(S.quality)) S.quality = 'diatonic';
        S.prog = normalizeSequence(S.prog) || [0, 4, 5, 3];
        if (!DAW_PRESET_BY_ID.has(S.dawPreset)) S.dawPreset = null;
        S.bpm = Math.max(30, Math.min(240, Number.parseInt(S.bpm, 10) || 90));
        const favoriteId = new URLSearchParams(location.search).get('favorite');
        const favorite = favoriteId && window.ST && ST.favorites && ST.favorites.list().find(item => item.type === 'progression' && item.id === favoriteId);
        const favoriteData = favorite && favorite.data;
        const favoriteSequence = favoriteData && normalizeSequence(favoriteData.sequence);
        if (favoriteData && ['major', 'minor'].includes(favoriteData.mode) && favoriteSequence) {
            S.mode = favoriteData.mode;
            S.key = typeof favoriteData.key === 'string' ? favoriteData.key : 'C';
            S.prog = favoriteSequence;
            S.dawPreset = DAW_PRESET_BY_ID.has(favoriteData.dawPreset) ? favoriteData.dawPreset : null;
            if (S.dawPreset) S.mode = modeForScale(DAW_PRESET_BY_ID.get(S.dawPreset).scale);
            S.quality = EXTRA_CHORD_TYPES.includes(favoriteData.quality) ? favoriteData.quality : 'diatonic';
            S.sevenths = favoriteData.sevenths === true;
            S.bpm = Math.max(30, Math.min(240, Number.parseInt(favoriteData.bpm, 10) || 90));
        }
        ['key', 'mode', 'sevenths', 'quality', 'preset', 'preset-search', 'preset-count', 'preset-info', 'favorite', 'favorite-status', 'bpm', 'play', 'clear', 'palette', 'prog', 'fb'].forEach(k => { el[k] = document.getElementById('cp-' + k); });
        el.presetSearch = el['preset-search'];
        el.presetCount = el['preset-count'];
        el.presetInfo = el['preset-info'];
        el.favoriteStatus = el['favorite-status'];
        el.quality.add(new Option('Diatonic chords', 'diatonic'));
        EXTRA_CHORD_TYPES.forEach(id => el.quality.add(new Option(mt.chords[id].name, id)));
        el.quality.value = S.quality;
        const fillKeys = () => {
            const list = S.mode === 'major' ? KEYS : MINOR_KEYS;
            el.key.innerHTML = '';
            list.forEach(k => el.key.add(new Option(k + (S.mode === 'major' ? ' major' : ' minor'), k)));
            if (list.indexOf(S.key) === -1) { const i = idx(S.key); S.key = list.find(k => idx(k) === i) || 'C'; }
            el.key.value = S.key;
        };
        fillKeys();
        el.mode.value = S.dawPreset ? 'preset' : S.mode;
        el.sevenths.checked = !!S.sevenths; el.bpm.value = S.bpm;
        el.key.addEventListener('change', () => { stop(); S.key = el.key.value; save(); render(); showChord(S.prog.length ? progressionChord(S.prog[0]) : chords()[0]); });
        el.mode.addEventListener('change', () => { stop(); S.mode = el.mode.value; S.dawPreset = null; fillKeys(); S.prog = PRESETS[S.mode][0][1].slice(); save(); render(); });
        el.sevenths.addEventListener('change', () => { stop(); S.sevenths = el.sevenths.checked; save(); render(); });
        el.quality.addEventListener('change', () => { stop(); S.quality = el.quality.value; save(); render(); if (S.prog.length) showChord(progressionChord(S.prog[0])); });
        el.presetSearch.addEventListener('input', renderPresetCatalog);
        el.preset.addEventListener('change', () => {
            const value = el.preset.value;
            if (value.startsWith('daw:')) {
                const id = value.slice(4), preset = DAW_PRESET_BY_ID.get(id);
                if (!preset) return;
                stop(); S.dawPreset = id; S.mode = modeForScale(preset.scale); fillKeys(); S.prog = presetSteps(preset);
                el.mode.value = 'preset';
                save(); render(); showChord(progressionChord(S.prog[0]));
                return;
            }
            if (value.startsWith('builtin:')) {
                const preset = PRESETS[S.mode][Number(value.slice(8))];
                if (!preset) return;
                stop(); S.dawPreset = null; el.mode.value = S.mode; S.prog = preset[1].slice();
                save(); render();
            }
        });
        el.favorite.addEventListener('click', () => {
            const favorite = favoriteSnapshot();
            const alreadySaved = !!(window.ST && ST.favorites && ST.favorites.has('progression', favorite.id));
            if (!S.prog.length && !alreadySaved) return;
            const result = window.ST && ST.favorites && ST.favorites.toggle({
                type: 'progression', id: favorite.id, title: S.key + ' ' + favorite.name,
                href: 'dummy.html?favorite=' + encodeURIComponent(favorite.id), data: favorite.data
            });
            el.favoriteStatus.textContent = result && result.ok
                ? (result.saved ? 'Progression saved to Favorites.' : 'Progression removed from Favorites.')
                : 'Could not save this progression. Check device storage.';
            syncFavoriteButton();
        });
        window.addEventListener('st:favoriteschange', syncFavoriteButton);
        el.bpm.addEventListener('change', () => { S.bpm = Math.max(30, Math.min(240, parseInt(el.bpm.value, 10) || 90)); el.bpm.value = S.bpm; save(); if (timer || starting) play(); });
        el.play.addEventListener('click', () => (timer || starting ? stop() : play()));
        el.clear.addEventListener('click', () => { stop(); S.prog = []; S.dawPreset = null; el.mode.value = S.mode; save(); render(); });
        document.addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); timer || starting ? stop() : play(); } });
        window.addEventListener('pagehide', () => stop(true), { once: true });
        render();
        const first = S.prog.length ? progressionChord(S.prog[0]) : chords()[0];
        showChord(first);
    });
})();
