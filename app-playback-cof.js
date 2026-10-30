/**
 * Circle of Fifths / Fourths Playback Extension for App
 */
if (typeof App !== 'undefined') {
    /**
     * Play the currently selected pattern through the Circle of Fifths in a loop.
     * durationSec - seconds to play each key/pattern for (float).
     */
    App.prototype.playCircleOfFifthsLoop = async function(durationSec = 2) {
        if (this.isPlayingCof) return; // already playing
        this.isPlayingCof = true;
        this.cofStopRequested = false;
        try {
            if (!this.synth && typeof this.initSynth === 'function') await this.initSynth();
            if (!this.synth) throw new Error('Audio is unavailable');
        } catch (error) {
            this.isPlayingCof = false;
            this.cofStopRequested = false;
            throw error;
        }

        // Build list of keys in circle of fifths
        const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];

        // capture current selections so we can restore after stop
        const origKey = document.getElementById('key-select')?.value;
        const origPatternType = document.getElementById('pattern-type')?.value;
        const origPattern = document.getElementById('pattern-select')?.value;

        // determine pattern to play (use current UI)
        const patternType = origPatternType || 'scale';
        const pattern = origPattern || (patternType === 'scale' ? 'major' : (patternType === 'chord' ? 'major' : '1'));

        // Provide visual feedback by toggling a body class
        document.body.classList.add('playing-cof');

        const playForKey = async (k) => {
            if (!this.isPlayingCof || this.cofStopRequested) return false;
            // update UI selection so fretboard and theory panels update consistently
            try {
                const keySelect = document.getElementById('key-select');
                if (keySelect) {
                    // Only set if option exists, otherwise add temporarily
                    const optExists = Array.from(keySelect.options).some(o => o.value === k);
                    if (optExists) keySelect.value = k;
                    else {
                        const tmp = document.createElement('option');
                        tmp.value = k; tmp.textContent = k; keySelect.appendChild(tmp);
                        keySelect.value = k;
                    }
                    keySelect.dispatchEvent(new Event('change'));
                }
                // update pattern selects if needed
                if (patternType && document.getElementById('pattern-type')) {
                    document.getElementById('pattern-type').value = patternType;
                }
                if (pattern && document.getElementById('pattern-select')) {
                    // ensure pattern select populated; updatePatternSelect exists on App
                    if (typeof this.updatePatternSelect === 'function') this.updatePatternSelect();
                    const ps = document.getElementById('pattern-select');
                    const valid = Array.from(ps.options).some(o => o.value === pattern);
                    if (valid) ps.value = pattern;
                }

                // update fretboard and theory info to reflect selection (no audio/animation)
                this.updateFretboard();
                if (typeof this.updateTheoryInfo === 'function') {
                    this.updateTheoryInfo(k, patternType, pattern);
                }
            } catch (err) {
                console.warn('Error updating UI for key', k, err);
            }

            // Play this key, then wait out the remainder of its requested duration.
            const start = performance.now();
            if (typeof this.playCurrentPattern === 'function') await this.playCurrentPattern();
            while (!this.cofStopRequested && (performance.now() - start) < durationSec * 1000) {
                await new Promise(res => setTimeout(res, 200));
            }
            return !this.cofStopRequested;
        };

        // Loop through cof until stopped
        while (this.isPlayingCof && !this.cofStopRequested) {
            for (const k of cof) {
                if (this.cofStopRequested) break;
                const ok = await playForKey(k);
                if (!ok) break;
            }
        }

        // cleanup and restore original key/pattern
        this.isPlayingCof = false;
        this.cofStopRequested = false;
        document.body.classList.remove('playing-cof');

        // restore UI selections
        try {
            if (origKey && document.getElementById('key-select')) {
                const keySel = document.getElementById('key-select');
                const optExists = Array.from(keySel.options).some(o => o.value === origKey);
                if (optExists) keySel.value = origKey;
                keySel.dispatchEvent(new Event('change'));
            }
            if (origPatternType && document.getElementById('pattern-type')) {
                document.getElementById('pattern-type').value = origPatternType;
                if (typeof this.updatePatternSelect === 'function') this.updatePatternSelect();
            }
            if (origPattern && document.getElementById('pattern-select')) {
                const ps = document.getElementById('pattern-select');
                const valid = Array.from(ps.options).some(o => o.value === origPattern);
                if (valid) ps.value = origPattern;
            }
            this.updateFretboard();
        } catch (err) {
            console.warn('Error restoring UI after Cof loop', err);
        }
    };

    /**
     * Stop the circle of fifths loop if running.
     */
    App.prototype.stopCircleOfFifthsLoop = function() {
        if (!this.isPlayingCof) return;
        this.cofStopRequested = true;
        if (typeof this.stopCurrentPattern === 'function') this.stopCurrentPattern();
    };

    /**
     * Play the currently selected pattern through the Circle of Fourths (reverse of fifths) in a loop.
     * durationSec - seconds to play each key/pattern for (float).
     */
    App.prototype.playCircleOfFourthsLoop = async function(durationSec = 2) {
        if (this.isPlayingCof4) return; // already playing
        this.isPlayingCof4 = true;
        this.cof4StopRequested = false;
        try {
            if (!this.synth && typeof this.initSynth === 'function') await this.initSynth();
            if (!this.synth) throw new Error('Audio is unavailable');
        } catch (error) {
            this.isPlayingCof4 = false;
            this.cof4StopRequested = false;
            throw error;
        }

        // Reverse of fifths (circle of fourths)
        const cof4 = ['C','F','A#','D#','G#','C#','F#','B','E','A','D','G']; // A# used for Bb etc; consistent with cof mapping

        const origKey = document.getElementById('key-select')?.value;
        const origPatternType = document.getElementById('pattern-type')?.value;
        const origPattern = document.getElementById('pattern-select')?.value;

        const patternType = origPatternType || 'scale';
        const pattern = origPattern || (patternType === 'scale' ? 'major' : (patternType === 'chord' ? 'major' : '1'));

        document.body.classList.add('playing-cof4');

        const playForKey = async (k) => {
            if (!this.isPlayingCof4 || this.cof4StopRequested) return false;
            try {
                const keySelect = document.getElementById('key-select');
                if (keySelect) {
                    const optExists = Array.from(keySelect.options).some(o => o.value === k);
                    if (optExists) keySelect.value = k;
                    else {
                        const tmp = document.createElement('option');
                        tmp.value = k; tmp.textContent = k; keySelect.appendChild(tmp);
                        keySelect.value = k;
                    }
                    keySelect.dispatchEvent(new Event('change'));
                }
                if (patternType && document.getElementById('pattern-type')) {
                    document.getElementById('pattern-type').value = patternType;
                }
                if (pattern && document.getElementById('pattern-select')) {
                    if (typeof this.updatePatternSelect === 'function') this.updatePatternSelect();
                    const ps = document.getElementById('pattern-select');
                    const valid = Array.from(ps.options).some(o => o.value === pattern);
                    if (valid) ps.value = pattern;
                }
                this.updateFretboard();
                if (typeof this.updateTheoryInfo === 'function') this.updateTheoryInfo(k, patternType, pattern);
            } catch (err) {
                console.warn('Error updating UI for key', k, err);
            }

            const start = performance.now();
            if (typeof this.playCurrentPattern === 'function') await this.playCurrentPattern();
            while (!this.cof4StopRequested && (performance.now() - start) < durationSec * 1000) {
                await new Promise(res => setTimeout(res, 200));
            }
            return !this.cof4StopRequested;
        };

        while (this.isPlayingCof4 && !this.cof4StopRequested) {
            for (const k of cof4) {
                if (this.cof4StopRequested) break;
                const ok = await playForKey(k);
                if (!ok) break;
            }
        }

        this.isPlayingCof4 = false;
        this.cof4StopRequested = false;
        document.body.classList.remove('playing-cof4');

        try {
            if (origKey && document.getElementById('key-select')) {
                const keySel = document.getElementById('key-select');
                const optExists = Array.from(keySel.options).some(o => o.value === origKey);
                if (optExists) keySel.value = origKey;
                keySel.dispatchEvent(new Event('change'));
            }
            if (origPatternType && document.getElementById('pattern-type')) {
                document.getElementById('pattern-type').value = origPatternType;
                if (typeof this.updatePatternSelect === 'function') this.updatePatternSelect();
            }
            if (origPattern && document.getElementById('pattern-select')) {
                const ps = document.getElementById('pattern-select');
                const valid = Array.from(ps.options).some(o => o.value === origPattern);
                if (valid) ps.value = origPattern;
            }
            this.updateFretboard();
        } catch (err) {
            console.warn('Error restoring UI after Cof4 loop', err);
        }
    };

    /**
     * Stop the circle of fourths loop if running.
     */
    App.prototype.stopCircleOfFourthsLoop = function() {
        if (!this.isPlayingCof4) return;
        this.cof4StopRequested = true;
        if (typeof this.stopCurrentPattern === 'function') this.stopCurrentPattern();
    };
}