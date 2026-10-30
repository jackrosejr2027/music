class Piano {
    static init(app) {
        Object.assign(app, {
            createPianoKeyboard() {
                const pianoKeyboard = document.createElement('div');
                pianoKeyboard.className = 'piano-keyboard';
                pianoKeyboard.style.display = 'flex';
                pianoKeyboard.style.position = 'relative';
                pianoKeyboard.style.height = '150px';
                pianoKeyboard.style.width = '100%';
                pianoKeyboard.style.margin = '0 auto';
                pianoKeyboard.style.userSelect = 'none';
                pianoKeyboard.addEventListener('contextmenu', e => e.preventDefault());
                
                pianoKeyboard.addEventListener('touchmove', (e) => {
                    e.preventDefault(); 
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && element.classList.contains('piano-key')) {
                        const note = element.getAttribute('data-note');
                        const octave = parseInt(element.getAttribute('data-octave'));
                        const noteId = `${note}${octave}`;
                        if (this.lastTouchedNote !== noteId) {
                            this.playPianoNote(note, octave);
                            this.lastTouchedNote = noteId;
                        }
                    }
                }, { passive: false });
                
                pianoKeyboard.addEventListener('touchend', () => {
                    this.lastTouchedNote = null;
                });
                
                // Define the notes for two octaves (C3-B4)
                const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
                               'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                const octaves = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 
                                 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
                
                // Set up the keyboard structure
                const whiteKeyWidth = 100 / 14; // 14 white keys in 2 octaves
                let whiteKeyIndex = 0;
                
                // Create the keys
                for (let i = 0; i < notes.length; i++) {
                    const note = notes[i];
                    const octave = octaves[i];
                    const isSharp = note.includes('#');
                    
                    const key = document.createElement('div');
                    key.setAttribute('data-note', note);
                    key.setAttribute('data-octave', octave);
                    key.setAttribute('data-note-id', `${note}${octave}`);
                    
                    if (isSharp) {
                        // Black key
                        key.className = 'piano-key piano-key-black';
                        key.style.position = 'absolute';
                        key.style.width = `${whiteKeyWidth * 0.6}%`;
                        key.style.height = '60%';
                        key.style.backgroundColor = '#000';
                        key.style.zIndex = '1';
                        key.style.left = `${(whiteKeyIndex - 0.3) * whiteKeyWidth}%`;
                        key.style.borderRadius = '0 0 4px 4px';
                    } else {
                        // White key
                        key.className = 'piano-key piano-key-white';
                        key.style.flex = '1';
                        key.style.height = '100%';
                        key.style.backgroundColor = '#fff';
                        key.style.border = '1px solid #ccc';
                        key.style.borderRadius = '0 0 4px 4px';
                        key.style.position = 'relative';
                        whiteKeyIndex++;
                    }
                    
                    // Add the note name to keys
                    const noteLabel = document.createElement('div');
                    noteLabel.textContent = `${note}${octave}`;
                    noteLabel.style.position = 'absolute';
                    noteLabel.style.top = isSharp ? 'auto' : 'auto';
                    noteLabel.style.bottom = isSharp ? '5px' : '5px';
                    noteLabel.style.left = '0';
                    noteLabel.style.right = '0';
                    noteLabel.style.textAlign = 'center';
                    noteLabel.style.fontSize = isSharp ? '10px' : '12px';
                    noteLabel.style.color = isSharp ? 'rgba(255,255,255,0.7)' : '#333';
                    noteLabel.style.pointerEvents = 'none';
                    key.appendChild(noteLabel);
                    
                    // Add glissando (swipe to play) events
                    key.addEventListener('mousedown', (e) => {
                        e.preventDefault(); // Prevent text selection
                        this.playPianoNote(note, octave);
                    });
                    
                    key.addEventListener('touchstart', (e) => {
                        e.preventDefault(); 
                        this.playPianoNote(note, octave);
                        this.lastTouchedNote = `${note}${octave}`;
                    }, { passive: false });
                    
                    key.addEventListener('mouseenter', (e) => {
                        // Play note if mouse button is held down (e.buttons === 1 for left click)
                        if (e.buttons === 1) {
                            this.playPianoNote(note, octave);
                        }
                        key.style.backgroundColor = isSharp ? '#333' : '#f0f0f0';
                    });
                    
                    key.addEventListener('mouseleave', () => {
                        if (!key.classList.contains('piano-key-active')) {
                            key.style.backgroundColor = isSharp ? '#000' : '#fff';
                        }
                    });
                    
                    pianoKeyboard.appendChild(key);
                }
                
                return pianoKeyboard;
            },
        
            /**
             * Play a note on the piano
             */
            async playPianoNote(note, octave) {
                // v1.0 fix: the first click used to be swallowed while the synth initialised
                if (!this.synth) {
                    await this.initSynth();
                    if (!this.synth) return;
                }
                
                // Get frequency from music theory
                const frequency = this.musicTheory.getNoteFrequency(note, octave);
                if (!frequency) return;
                
                // Play the note
                this.synth.triggerAttackRelease(frequency, 0.3);
                
                // Highlight the key
                const key = document.querySelector(`.piano-key[data-note-id="${note}${octave}"]`);
                if (key) {
                    const isSharp = note.includes('#');
                    key.style.backgroundColor = isSharp ? '#8A2BE2' : '#87CEFA';
                    key.style.boxShadow = `0 0 10px ${isSharp ? '#8A2BE2' : '#87CEFA'}`;
                    key.classList.add('piano-key-active');
                    
                    setTimeout(() => {
                        key.style.backgroundColor = isSharp ? '#000' : '#fff';
                        key.style.boxShadow = 'none';
                        key.classList.remove('piano-key-active');
                    }, 300);
                }
            },
        
            /**
             * Update piano highlighting based on the current pattern
             */
            updatePianoHighlights() {
                // First, remove all highlights
                const pianoKeys = document.querySelectorAll('.piano-key');
                pianoKeys.forEach(key => {
                    const isSharp = key.getAttribute('data-note').includes('#');
                    
                    // Apply the color from the theme
                    key.style.backgroundColor = isSharp ? '#000' : '#fff';
                    key.classList.remove('piano-key-active');
                    
                    // Remove any added text for interval display
                    const intervalText = key.querySelector('.interval-text');
                    if (intervalText) key.removeChild(intervalText);
                });
                
                // Get current key and pattern information
                const key = document.getElementById('key-select').value;
                const patternType = document.getElementById('pattern-type').value;
                const pattern = document.getElementById('pattern-select').value;
                const displayMode = document.getElementById('display-mode').value;
                
                // Get pattern data and colors
                let patternData = null;
                if (patternType === 'scale') {
                    patternData = this.musicTheory.scales[pattern];
                } else if (patternType === 'chord') {
                    patternData = this.musicTheory.chords[pattern];
                } else if (patternType === 'interval') {
                    patternData = { intervals: [pattern] };
                }
                
                // Get theme colors
                const colors = this.fretboard && typeof this.fretboard.getThemeColors === 'function'
                    ? this.fretboard.getThemeColors()
                    : this.musicTheory.colorThemes.default_ii || this.musicTheory.colorThemes.default;
                
                // Then highlight keys that are in the current pattern
                if (this.fretboard.activeNotes && this.fretboard.activeNotes.length > 0) {
                    this.fretboard.activeNotes.forEach((note, noteIndex) => {
                        // Determine what interval this note represents
                        let interval = null;
                        let intervalLabel = '';
                        let fillColor = '';
                        
                        if (patternData && patternData.intervals && noteIndex < patternData.intervals.length) {
                            interval = patternData.intervals[noteIndex];
                            
                            // Get interval color and label
                            if (displayMode === 'intervals' && this.musicTheory.intervals[interval]) {
                                intervalLabel = this.musicTheory.intervals[interval].shortName;
                                fillColor = colors.intervals && colors.intervals[interval] ? 
                                    colors.intervals[interval] : this.musicTheory.intervals[interval].color;
                            } else {
                                intervalLabel = note;
                                
                                // Use interval color but with note label
                                if (interval && this.musicTheory.intervals[interval]) {
                                    fillColor = colors.intervals && colors.intervals[interval] ? 
                                        colors.intervals[interval] : this.musicTheory.intervals[interval].color;
                                } else {
                                    fillColor = '#666666'; // Neutral fallback color
                                }
                            }
                        } else {
                            // Fallback if we can't determine the interval
                            interval = this.musicTheory.getInterval(key, note);
                            intervalLabel = displayMode === 'intervals' && interval ? 
                                this.musicTheory.intervals[interval].shortName : note;
                                
                            if (interval && this.musicTheory.intervals[interval]) {
                                fillColor = colors.intervals && colors.intervals[interval] ? 
                                    colors.intervals[interval] : this.musicTheory.intervals[interval].color;
                            } else {
                                fillColor = '#666666'; // Neutral fallback color
                            }
                        }
                        
                        // Highlight in both octaves
                        const keys3 = document.querySelectorAll(`.piano-key[data-note="${this.musicTheory.toSharp ? this.musicTheory.toSharp(note) : note}"][data-octave="3"]`);
                        const keys4 = document.querySelectorAll(`.piano-key[data-note="${this.musicTheory.toSharp ? this.musicTheory.toSharp(note) : note}"][data-octave="4"]`);
                        
                        [...keys3, ...keys4].forEach(key => {
                            if (key) {
                                const isSharp = note.includes('#');
                                
                                // Apply the color from the theme
                                key.style.backgroundColor = fillColor || (isSharp ? '#8A2BE2' : '#87CEFA');
                                
                                // Add interval text
                                if (intervalLabel) {
                                    // Create or update interval text
                                    let intervalText = key.querySelector('.interval-text');
                                    if (!intervalText) {
                                        intervalText = document.createElement('div');
                                        intervalText.className = 'interval-text';
                                        intervalText.style.position = 'absolute';
                                        intervalText.style.top = isSharp ? '10px' : '35px';
                                        intervalText.style.left = '0';
                                        intervalText.style.right = '0';
                                        intervalText.style.textAlign = 'center';
                                        intervalText.style.fontWeight = 'bold';
                                        intervalText.style.fontSize = '14px';
                                        intervalText.style.color = this.getContrastColor(fillColor || (isSharp ? '#8A2BE2' : '#87CEFA'));
                                        intervalText.style.zIndex = '2';
                                        intervalText.style.pointerEvents = 'none';
                                        key.appendChild(intervalText);
                                    }
                                    
                                    intervalText.textContent = intervalLabel;
                                }
                            }
                        });
                    });
                }
            }
        });
    }
}