/**
 * Playback Extension for App
 */
if (typeof App !== 'undefined') {
    /**
     * Create the synth lazily on the first user gesture (v1.0 fix: creating it at page load
     * triggered browser autoplay warnings and could leave audio permanently suspended).
     * Fully offline: Tone.js is vendored locally and the synth uses no samples.
     */
    App.prototype.initSynth = async function() {
        if (this.synth) return this.synth;
        if (this._synthInit) return this._synthInit;
        if (typeof Tone === 'undefined') {
            console.warn('Tone.js not available - audio disabled');
            return null;
        }
        this._synthInit = (async () => {
            await Tone.start();
            this.reverb = new Tone.Freeverb(0.7, 2000).toDestination();
            this.synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 1.2 }
            }).connect(this.reverb);
            this.synth.volume.value = -8;
            return this.synth;
        })();
        try { return await this._synthInit; } finally { this._synthInit = null; }
    };

    /**
     * Convert a note list into ascending frequencies starting at the given octave
     * (v1.0 fix: every note was previously played in octave 4, so e.g. A major jumped
     * down an octave at C#).
     */
    App.prototype.getAscendingFrequencies = function(notes, octave = 4) {
        const out = [];
        let prev = -Infinity;
        let oct = octave;
        notes.forEach(note => {
            let f = this.musicTheory.getNoteFrequency(note, oct);
            if (f === null || f === undefined) return;
            while (f <= prev + 0.01) { oct++; f = this.musicTheory.getNoteFrequency(note, oct); }
            out.push(f);
            prev = f;
        });
        return out;
    };

    App.prototype.playCurrentPattern = async function() {
        if (this._patternPlaying) return;
        const playbackId = this._patternPlaybackId = (this._patternPlaybackId || 0) + 1;
        this._patternPlaying = true;
        this._patternPlayTimeout = null;
        const playButtons = ['play-pattern', 'header-play-pattern'].map(id => document.getElementById(id)).filter(Boolean);
        const stopButton = document.getElementById('header-stop-pattern');
        playButtons.forEach(button => { button.disabled = true; button.classList.add('is-playing'); });
        if (stopButton) stopButton.disabled = false;

        const finishControls = () => {
            playButtons.forEach(button => { button.disabled = false; button.classList.remove('is-playing'); });
            if (stopButton) stopButton.disabled = true;
        };
        const wait = ms => new Promise(resolve => {
            this._patternWaitResolve = resolve;
            this._patternPlayTimeout = setTimeout(() => {
                this._patternPlayTimeout = null;
                this._patternWaitResolve = null;
                resolve();
            }, ms);
        });

        try {
            const key = document.getElementById('key-select').value;
            const patternType = document.getElementById('pattern-type').value;
            const pattern = document.getElementById('pattern-select').value;
            let notes = [];
            if (patternType === 'scale') notes = this.musicTheory.getScaleNotes(key, pattern);
            else if (patternType === 'chord') notes = this.musicTheory.getChordNotes(key, pattern);
            else if (patternType === 'interval') notes = [key, this.musicTheory.getNoteFromInterval(key, pattern)];
            else if (patternType === 'custom') notes = this.musicTheory.getCustomNotes(key, pattern);

            notes = notes.filter(Boolean);
            if (!notes.length) {
                if (window.ST && ST.toast) ST.toast('Choose a scale, chord, interval or custom pattern to play');
                return;
            }
            await Tone.start();
            if (playbackId !== this._patternPlaybackId) return;
            if (!this.synth) await this.initSynth();
            if (playbackId !== this._patternPlaybackId) return;
            if (!this.synth) throw new Error('Audio is unavailable');

            this.updateTheoryInfo(key, patternType, pattern);
            const markers = this.fretboard.container.querySelectorAll('.note-marker');
            const noteElements = [];
            markers.forEach(marker => {
                if (marker.nextSibling && marker.nextSibling.tagName === 'text') {
                    noteElements.push({ marker, note: marker.nextSibling.textContent });
                }
            });
            const beatDuration = 60 / this.tempo;
            const frequencies = this.getAscendingFrequencies(notes, patternType === 'chord' ? 3 : 4);
            if (!frequencies.length) throw new Error('No playable notes in this pattern');

            if (patternType === 'chord' || patternType === 'interval') {
                noteElements.forEach(item => this.animateNoteMarker(item.marker));
                this.synth.triggerAttackRelease(frequencies, beatDuration * 2);
                await wait(beatDuration * 2100);
            } else {
                const sequence = frequencies.map((frequency, index) => ({ frequency, note: notes[index] }));
                if ((patternType === 'scale' || patternType === 'custom') && sequence.length > 2) {
                    sequence.push(...sequence.slice(0, -1).reverse());
                }
                for (const item of sequence) {
                    if (playbackId !== this._patternPlaybackId) break;
                    this.synth.triggerAttackRelease(item.frequency, beatDuration / 2);
                    const interval = this.musicTheory.getInterval(key, item.note);
                    const displayNote = this.fretboard.settings.displayMode === 'intervals' && interval
                        ? ((this.musicTheory.intervals[interval] || {}).shortName || item.note)
                        : item.note;
                    noteElements.filter(marker => marker.note === displayNote)
                        .forEach(marker => this.animateNoteMarker(marker.marker));
                    await wait(beatDuration * 1000);
                }
            }
        } catch (error) {
            console.warn('Pattern playback failed:', error);
            if (window.ST && ST.toast) ST.toast('Playback unavailable. Tap again after checking audio settings.');
        } finally {
            if (playbackId === this._patternPlaybackId) {
                if (this._patternPlayTimeout) clearTimeout(this._patternPlayTimeout);
                this._patternPlayTimeout = null;
                this._patternWaitResolve = null;
                this._patternPlaying = false;
                finishControls();
            }
        }
    };

    App.prototype.stopCurrentPattern = function() {
        this._patternPlaybackId = (this._patternPlaybackId || 0) + 1;
        if (this._patternPlayTimeout) clearTimeout(this._patternPlayTimeout);
        this._patternPlayTimeout = null;
        const resume = this._patternWaitResolve;
        this._patternWaitResolve = null;
        this._patternPlaying = false;
        if (resume) resume();
        try {
            if (this.synth && typeof this.synth.releaseAll === 'function') this.synth.releaseAll(Tone.now());
        } catch (error) {
            console.warn('Could not release synth voices:', error);
        }
        ['play-pattern', 'header-play-pattern'].forEach(id => {
            const button = document.getElementById(id);
            if (button) { button.disabled = false; button.classList.remove('is-playing'); }
        });
        const stopButton = document.getElementById('header-stop-pattern');
        if (stopButton) stopButton.disabled = true;
    };

    App.prototype.animateNoteMarker = function(marker) {
        marker.classList.add('playing-note-pulse');
        marker.style.transformBox = 'fill-box';
        marker.style.transformOrigin = 'center';
        
        setTimeout(() => {
            marker.classList.remove('playing-note-pulse');
            marker.style.transformBox = '';
            marker.style.transformOrigin = '';
        }, 600); // Extended for smoother decay
    };

    App.prototype.setupChromaticTuner = function() {
        const toggleButton = document.getElementById('chromatic-tuner-toggle');
        const tunerContainer = document.getElementById('chromatic-tuner-container');
        const tunerButtonsContainer = tunerContainer ? tunerContainer.querySelector('.chromatic-tuner-buttons') : null;

        if (!toggleButton || !tunerContainer || !tunerButtonsContainer) {
            return;
        }

        tunerButtonsContainer.innerHTML = '';
        
        // Add Octave Selector
        const octaveControls = document.createElement('div');
        octaveControls.style.marginBottom = '10px';
        octaveControls.style.display = 'flex';
        octaveControls.style.alignItems = 'center';
        octaveControls.style.justifyContent = 'center';
        octaveControls.style.gap = '10px';
        
        const octaveLabel = document.createElement('label');
        octaveLabel.textContent = 'Octave:';
        octaveLabel.style.margin = '0';
        octaveLabel.style.fontSize = '0.9em';
        
        const octaveSelect = document.createElement('select');
        octaveSelect.id = 'tuner-octave-select';
        octaveSelect.style.width = 'auto';
        octaveSelect.style.padding = '2px 5px';
        [2, 3, 4, 5, 6].forEach(oct => {
            const opt = document.createElement('option');
            opt.value = oct;
            opt.textContent = oct;
            if (oct === 4) opt.selected = true;
            octaveSelect.appendChild(opt);
        });
        
        octaveControls.appendChild(octaveLabel);
        octaveControls.appendChild(octaveSelect);
        tunerButtonsContainer.appendChild(octaveControls);

        const notesGrid = document.createElement('div');
        notesGrid.style.display = 'flex';
        notesGrid.style.flexWrap = 'wrap';
        notesGrid.style.justifyContent = 'center';

        this.musicTheory.notes.forEach(note => {
            const noteButton = document.createElement('button');
            noteButton.textContent = note;
            noteButton.className = 'chromatic-tuner-button';
            noteButton.style.padding = '10px 12px';
            noteButton.style.margin = '2px';
            noteButton.style.fontSize = '1em';
            noteButton.style.fontWeight = 'bold';
            noteButton.style.flexGrow = '1';
            noteButton.style.border = '1px solid var(--border-color)';
            noteButton.style.borderRadius = '4px';
            noteButton.style.backgroundColor = note.includes('#') ? '#333' : '#f9f9f9';
            noteButton.style.color = note.includes('#') ? '#fff' : '#333';
            noteButton.style.cursor = 'pointer';
            noteButton.style.transition = 'all 0.1s';
            noteButton.addEventListener('click', async () => {
                if (!this.synth) {
                    await this.initSynth();
                }
                
                const origBg = noteButton.style.backgroundColor;
                const origCol = noteButton.style.color;
                const origTransform = noteButton.style.transform;
                noteButton.style.backgroundColor = 'var(--accent-color)';
                noteButton.style.color = '#fff';
                noteButton.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    noteButton.style.backgroundColor = origBg;
                    noteButton.style.color = origCol;
                    noteButton.style.transform = origTransform || 'scale(1)';
                }, 150);

                const selectedOctave = parseInt(octaveSelect.value) || 4;
                const frequency = this.musicTheory.getNoteFrequency(note, selectedOctave);
                if (frequency && this.synth) {
                    this.synth.triggerAttackRelease(frequency, '2n'); // Longer sustain for tuning
                }
            });
            notesGrid.appendChild(noteButton);
        });
        tunerButtonsContainer.appendChild(notesGrid);

        toggleButton.addEventListener('click', () => {
            const isVisible = tunerContainer.style.display !== 'none';
            tunerContainer.style.display = isVisible ? 'none' : 'block';
            toggleButton.textContent = isVisible ? 'Show reference notes' : 'Hide reference notes';
            toggleButton.setAttribute('aria-expanded', String(!isVisible));
        });
    };

    // removed Cof loop methods -> moved to app-playback-cof.js
}