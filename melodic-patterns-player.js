/**
 * Melodic Pattern Playback Extension
 */
if (typeof App !== 'undefined') {
    const MELODIC_MAX_OCTAVE = 8;

    App.prototype.readMelodicSettings = function () {
        const patternSelect = document.getElementById('melodic-pattern-select');
        const lengthSelect = document.getElementById('melodic-pattern-length');
        const chainInput = document.getElementById('melodic-chain-count');
        if (!patternSelect) throw new Error('Melodic pattern controls are unavailable.');

        const parseTokens = rawString => {
            const tokens = String(rawString || '').trim().split(/[\s,]+/).filter(Boolean);
            if (!tokens.length) throw new Error('Choose a preset or enter a degree sequence first.');
            if (tokens.length > 64 || tokens.some(token => !/^\d+$/.test(token) || Number(token) < 1 || Number(token) > 64)) {
                throw new Error('Use 1 to 64 positive scale degrees in the pattern.');
            }
            return tokens.map(Number);
        };

        const chainCount = Math.max(1, Math.min(20, Math.floor(Number(chainInput?.value)) || 1));
        if (chainInput) chainInput.value = String(chainCount);

        let firstRaw;
        if (patternSelect.value === 'custom') {
            firstRaw = document.getElementById('custom-pattern')?.value || '';
        } else if (chainCount === 1 && lengthSelect?.value === 'custom') {
            firstRaw = document.getElementById('melodic-custom-length')?.value || '';
        } else if (chainCount === 1 && lengthSelect && lengthSelect.value !== 'preset') {
            firstRaw = [...lengthSelect.value].join(' ');
        } else {
            firstRaw = patternSelect.value;
        }
        const chain = [parseTokens(firstRaw)];
        for (let index = 2; index <= chainCount; index++) {
            chain.push(parseTokens(document.getElementById('melodic-chain-preset-' + index)?.value));
        }

        const octaveRange = Math.max(1, Math.min(3, parseInt(document.getElementById('melodic-octave')?.value, 10) || 3));
        const tempoInput = document.getElementById('melodic-tempo');
        const bpm = Math.max(20, Math.min(300, Number(tempoInput?.value) || 120));
        if (tempoInput) tempoInput.value = String(bpm);

        const start = Number(this.settings?.startFret ?? document.getElementById('start-fret')?.value ?? 0);
        const end = Number(this.settings?.endFret ?? document.getElementById('end-fret')?.value ?? 12);
        const spanNotes = Math.min(256, Math.max(8, (Math.max(start, end) - Math.min(start, end) + 1) * 4));
        return { chain, octaveRange, bpm, spanNotes };
    };

    /**
     * Builds the flat list of notes for an exercise. Chain item k (0-based) starts at octave 4 + k,
     * capped at the MIDI range. A single item uses the fret-span note count; chain items play at
     * least one full preset (or one full pool pass, whichever is longer).
     */
    App.prototype.buildMelodicEvents = function (pool, chain, octaveRange, singleNotes) {
        const events = [];
        chain.forEach((tokens, item) => {
            const baseOctave = Math.min(4 + item, MELODIC_MAX_OCTAVE);
            const octaveCap = Math.min(baseOctave + octaveRange, MELODIC_MAX_OCTAVE);
            const count = chain.length === 1 && singleNotes
                ? singleNotes
                : Math.max(pool.length, tokens.length);
            const degrees = this.extrapolatePattern(tokens, pool.length, count);
            degrees.forEach(degree => {
                const { note, octave } = this.melodicNoteFor({ pool, baseOctave, octaveCap }, degree);
                events.push({ note, octave, item });
            });
        });
        return events;
    };

    App.prototype.readMelodicPatternData = function () {
        const settings = this.readMelodicSettings();
        const board = this.diagramBoards?.[0] || this.fretboard;
        const key = board?.currentKey || document.getElementById('key-select')?.value || 'C';
        const pool = this.getMelodicPool(key);
        if (!pool.length) throw new Error('Select a scale, chord, interval, gamut, or custom pattern in Diagram 1 first.');
        const events = this.buildMelodicEvents(pool, settings.chain, settings.octaveRange, settings.spanNotes);
        const type = board?.currentPatternType || '';
        const patternId = board?.currentPattern || '';
        const gamutName = type === 'gamut' ? this.musicTheory.gamuts?.[patternId]?.name : '';
        const patternLabel = (gamutName || patternId || type).replaceAll('_', ' ');
        const label = (key + ' ' + patternLabel).trim();
        const poolSig = pool.map(entry => entry.note + entry.octave).join(',');
        const chainSig = settings.chain.map(tokens => tokens.join(' ')).join(' / ');
        const signature = [key, type, patternId, poolSig, settings.octaveRange, chainSig, settings.spanNotes].join('|');
        return { key, label, patternLabel, pool, events, bpm: settings.bpm, signature };
    };

    App.prototype.playMelodicPattern = async function () {
        if (this.isPlayingPattern || this._melodicStarting || this._melodicStepStarting) return;
        const playButton = document.getElementById('play-melodic-pattern');
        const stopButton = document.getElementById('stop-melodic-pattern');
        const status = document.getElementById('melodic-pattern-status');
        const token = this._melodicToken = (this._melodicToken || 0) + 1;
        this._melodicStarting = true;
        if (playButton) playButton.disabled = true;
        try {
            const data = this.readMelodicPatternData();
            if (!this.synth && typeof this.initSynth === 'function') await this.initSynth();
            if (token !== this._melodicToken) return;
            if (!this.synth) throw new Error('Audio is unavailable. Check the browser audio setting and try again.');
            this._melodicState = data;
            this._melodicCursor = 0;
            this._melodicBeatDurationSec = 60 / data.bpm;
            this.isPlayingPattern = true;
            if (playButton) { playButton.disabled = false; playButton.style.display = 'none'; }
            if (stopButton) stopButton.style.display = 'inline-block';
            if (status) status.textContent = 'Playing ' + data.label + ' at ' + data.bpm + ' BPM.';

            const playNext = () => {
                if (token !== this._melodicToken || !this.isPlayingPattern) return;
                const event = data.events[this._melodicCursor++ % data.events.length];
                try {
                    const frequency = this.musicTheory.getNoteFrequency(event.note, event.octave);
                    if (!frequency) throw new Error('A pattern degree is outside the playable note range.');
                    this.synth.triggerAttackRelease(frequency, Math.max(0.06, this._melodicBeatDurationSec * 0.55));
                    this.visualizeNotePlayback(data.key, event.note, this._melodicBeatDurationSec, 'melodic-pattern-anim', 'playing-pattern');
                    if (status) status.textContent = 'Playing note ' + (this._melodicCursor % data.events.length || data.events.length) + ' of ' + data.events.length + '.';
                } catch (error) {
                    this.stopMelodicPattern();
                    if (status) status.textContent = error.message || 'Could not play this note.';
                    return;
                }
                this.patternPlayer = setTimeout(playNext, Math.round(this._melodicBeatDurationSec * 1000));
            };
            playNext();
        } catch (error) {
            if (token === this._melodicToken) {
                this.isPlayingPattern = false;
                if (playButton) { playButton.disabled = false; playButton.style.display = 'inline-block'; }
                if (stopButton) stopButton.style.display = 'none';
                if (status) status.textContent = error.message || 'Could not start melodic playback.';
            }
        } finally {
            if (token === this._melodicToken) this._melodicStarting = false;
        }
    };

    /**
     * Notes the melodic degrees play, taken from Diagram 1 (the first diagram) rather than the global
     * scale selectors. Pitch classes are deduplicated; each entry carries the octave offset that keeps
     * the list rising (the same bump rule as getAscendingFrequencies).
     */
    App.prototype.getMelodicPool = function (key) {
        const board = this.diagramBoards?.[0] || this.fretboard;
        const theory = this.musicTheory;
        const type = board?.currentPatternType;
        const semitoneOf = name => name ? theory.notes.indexOf(theory.toSharp(name)) : -1;
        const rootSemi = Math.max(0, semitoneOf(key));
        const distance = semi => (semi - rootSemi + 12) % 12;
        const entries = [];
        const seen = new Set();
        const add = (name, semi) => {
            if (!name || semi < 0 || seen.has(semi)) return;
            seen.add(semi);
            entries.push({ note: name, semi });
        };
        const addFromPositions = () => {
            const tuning = board?.settings?.tuning || [];
            (board?.activePositions || [])
                .map(position => {
                    const open = semitoneOf(tuning[position.string]);
                    return open < 0 ? -1 : (open + Number(position.fret)) % 12;
                })
                .filter(semi => semi >= 0)
                .sort((a, b) => distance(a) - distance(b))
                .forEach(semi => add(theory.notes[semi], semi));
        };
        const names = type === 'gamut' ? [] : (Array.isArray(board?.activeNotes) ? board.activeNotes : []);
        if (type === 'gamut') addFromPositions();
        else if (names.length) names.forEach(name => add(name, semitoneOf(name)));
        else if (type === 'grid' || type === 'grid2') theory.getScaleNotes(key, 'major').forEach(name => add(name, semitoneOf(name)));
        else if (['scale', 'chord', 'interval', 'custom'].includes(type)) addFromPositions();

        let octave = 0;
        return entries.map((entry, index) => {
            if (index > 0 && entry.semi <= entries[index - 1].semi) octave++;
            return { note: entry.note, octave };
        });
    };

    /**
     * Maps a degree to a note and octave. Each full pass through the pool rises one octave;
     * the octave stops rising at the given cap.
     */
    App.prototype.melodicNoteFor = function (context, degree) {
        const slot = context.pool[degree % context.pool.length];
        const cap = context.octaveCap ?? context.baseOctave + 3;
        const octave = Math.min(
            context.baseOctave + slot.octave + Math.floor(degree / context.pool.length),
            cap
        );
        return { note: slot.note, octave };
    };

    App.prototype.extrapolatePattern = function (pattern, scaleLength, maxNotes) {
        if (!Array.isArray(pattern) || !pattern.length || !Number.isInteger(scaleLength) || scaleLength < 1) return [];
        const zeroBased = pattern.map(Number).map(degree => degree - 1);
        if (zeroBased.some(degree => !Number.isInteger(degree) || degree < 0)) return [];
        const limit = Math.max(1, Math.min(256, Number(maxNotes) || 1));
        const result = [];
        for (let cycle = 0; result.length < limit; cycle++) {
            for (const degree of zeroBased) {
                result.push(cycle + degree);
                if (result.length >= limit) break;
            }
        }
        return result;
    };

    App.prototype.stopMelodicPattern = function () {
        this._melodicToken = (this._melodicToken || 0) + 1;
        this._melodicStepToken = (this._melodicStepToken || 0) + 1;
        this._melodicStarting = false;
        this._melodicStepStarting = false;
        if (this.patternPlayer) clearTimeout(this.patternPlayer);
        this.patternPlayer = null;
        this.isPlayingPattern = false;
        try { if (this.synth && typeof this.synth.releaseAll === 'function') this.synth.releaseAll(Tone.now()); } catch (error) {}
        const playButton = document.getElementById('play-melodic-pattern');
        const stopButton = document.getElementById('stop-melodic-pattern');
        if (playButton) { playButton.disabled = false; playButton.style.display = 'inline-block'; }
        if (stopButton) stopButton.style.display = 'none';
    };

    App.prototype.melodicAnimateEnabled = function () {
        return document.getElementById('melodic-animate')?.checked === true;
    };

    App.prototype.visualizeNotePlayback = function(key, note, beatDurationSec, animSelectId, fallbackAnim) {
        if (!this.melodicAnimateEnabled()) return;
        try {
            const markers = Array.from(this.fretboard.container.querySelectorAll('.note-marker'));
            const interval = this.musicTheory.getInterval(key, note);
            const compare = this.fretboard.settings.displayMode === 'intervals' && interval
                ? this.musicTheory.intervals[interval]?.shortName || note
                : note;
            const matches = markers.filter(marker => marker.getAttribute('data-pitch') === note || marker.getAttribute('data-note') === compare || marker.getAttribute('data-note') === note);
            const anim = document.getElementById(animSelectId)?.value || fallbackAnim;
            matches.forEach(marker => {
                marker.classList.add(anim);
                setTimeout(() => marker.classList.remove(anim), Math.max(60, (beatDurationSec * 1000) / 2));
            });
        } catch (error) {}
    };

    App.prototype.stepMelodicPattern = async function () {
        if (this._melodicStepStarting) return;
        if (this.isPlayingPattern || this._melodicStarting) this.stopMelodicPattern();
        const token = this._melodicStepToken = (this._melodicStepToken || 0) + 1;
        const button = document.getElementById('step-melodic-pattern');
        const status = document.getElementById('melodic-pattern-status');
        this._melodicStepStarting = true;
        if (button) button.disabled = true;
        try {
            const data = this.readMelodicPatternData();
            if (!this.synth && typeof this.initSynth === 'function') await this.initSynth();
            if (token !== this._melodicStepToken) return;
            if (!this.synth) throw new Error('Audio is unavailable. Check the browser audio setting and try again.');
            if (!this._melodicStepState || this._melodicStepState.signature !== data.signature) {
                this._melodicStepState = { signature: data.signature, cursor: 0 };
            }
            const index = this._melodicStepState.cursor++ % data.events.length;
            const event = data.events[index];
            const frequency = this.musicTheory.getNoteFrequency(event.note, event.octave);
            if (!frequency) throw new Error('This degree is outside the playable note range.');
            const beatDurationSec = 60 / data.bpm;
            this.synth.triggerAttackRelease(frequency, Math.max(0.06, beatDurationSec * 0.55));
            this.visualizeNotePlayback(data.key, event.note, beatDurationSec, 'melodic-pattern-anim', 'playing-pattern');
            if (status) status.textContent = 'Step ' + (index + 1) + ' of ' + data.events.length + ': ' + event.note + event.octave + '.';
        } catch (error) {
            if (status) status.textContent = error.message || 'Could not play this note.';
        } finally {
            if (token === this._melodicStepToken) {
                this._melodicStepStarting = false;
                if (button) button.disabled = false;
            }
        }
    };
}
