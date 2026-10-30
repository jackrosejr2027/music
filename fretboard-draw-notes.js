/**
 * Fretboard Notes Drawing Methods
 */
if (typeof Fretboard !== 'undefined') {
    Fretboard.prototype.drawNotes = function() {
        if (!this.dimensions || !this.settings) return;
        
        const { margin, fretSpacing, stringSpacing } = this.dimensions;
        const { startFret, endFret, tuning, displayMode, visibleStrings, stringStartFrets, stringEndFrets } = this.settings;
        
        if (!tuning || !margin) return;
        const colors = this.getThemeColors();
        // v1.0 fix: compare notes enharmonically (F major's "Bb" must light up the "A#" fret positions)
        const mtRef = this.musicTheory;
        const norm = (n) => (mtRef && typeof mtRef.toSharp === 'function') ? mtRef.toSharp(n) : n;
        const activeSet = new Set((this.activeNotes || []).filter(Boolean).map(norm));
        const activePositionSet = new Set((this.activePositions || []).map(position => position.string + ':' + position.fret));
        const idxOfNote = (list, n) => (list || []).map(norm).indexOf(n);
        
        for (let stringIndex = 0; stringIndex < tuning.length; stringIndex++) {
            if (visibleStrings && visibleStrings[stringIndex] === false) continue;
            
            const openStringNote = tuning[stringIndex];
            const stringY = margin.top + (tuning.length - 1 - stringIndex) * this.dimensions.stringSpacing;
            const stringStart = stringStartFrets && stringStartFrets[stringIndex] !== undefined ? stringStartFrets[stringIndex] : startFret;
            const stringEnd = stringEndFrets && stringEndFrets[stringIndex] !== undefined ? stringEndFrets[stringIndex] : endFret;
            
            for (let fretNum = stringStart; fretNum <= stringEnd; fretNum++) {
                if (fretNum < startFret || fretNum > endFret) continue;
                
                let fretX = margin.left + (fretNum - startFret) * fretSpacing - fretSpacing/2;
                // If the note sits on or before the first displayed fret (open string / very left),
                // nudge it slightly to the right so it doesn't collide with tuning labels.
                if (fretNum <= startFret) {
                    // Use either a small fixed offset or a fraction of fret spacing for responsiveness
                    fretX += Math.max(12, Math.round(fretSpacing * 0.15));
                }

                const noteIndex = (this.musicTheory.notes.indexOf(openStringNote) + fretNum) % 12;
                const note = this.musicTheory.notes[noteIndex];
                
                const isPositionActive = activePositionSet.has(stringIndex + ':' + fretNum);
                
                // If capo is enabled, hide any notes that lie before the capo fret
                const capoVal = (this.settings && this.settings.capoEnabled) ? (this.settings.capo || 0) : 0;
                if (capoVal > 0 && fretNum < capoVal) {
                    continue;
                }

                if (activeSet.has(note) || isPositionActive) {
                    let displayText = note;
                    let fillColor = '#666666';
                    
                    // Helper to resolve interval for this note given current context (scale/chord/interval)
                    const resolveIntervalForNote = () => {
                        let interval = this.musicTheory.getInterval(this.currentKey, note);
                        if (this.currentPatternType === 'scale') {
                            const scaleData = this.musicTheory.scales[this.currentPattern];
                            if (scaleData) {
                                const scaleNotes = this.musicTheory.getScaleNotes(this.currentKey, this.currentPattern);
                                const pos = idxOfNote(scaleNotes, note);
                                if (pos !== -1) interval = scaleData.intervals[pos];
                            }
                        } else if (this.currentPatternType === 'chord') {
                            const chordData = this.musicTheory.chords[this.currentPattern];
                            if (chordData) {
                                const chordNotes = this.musicTheory.getChordNotes(this.currentKey, this.currentPattern);
                                const pos = idxOfNote(chordNotes, note);
                                if (pos !== -1) interval = chordData.intervals[pos];
                            }
                        } else if (this.currentPatternType === 'interval') {
                            interval = (note === this.currentKey) ? '1' : this.currentPattern;
                        } else if (this.currentPatternType === 'custom') {
                            const customData = this.musicTheory.customPatterns && this.musicTheory.customPatterns[this.currentPattern];
                            if (customData) {
                                const customNotes = this.musicTheory.getCustomNotes(this.currentKey, this.currentPattern);
                                const pos = idxOfNote(customNotes, note);
                                if (pos !== -1) interval = customData.intervals[pos];
                            }
                        }
                        return interval;
                    };
                    
                    if (displayMode === 'intervals') {
                        const interval = resolveIntervalForNote();
                        if (interval && this.musicTheory.intervals[interval]) {
                            displayText = this.musicTheory.intervals[interval].shortName;
                            fillColor = colors.intervals && colors.intervals[interval] ? colors.intervals[interval] : (this.musicTheory.intervals[interval].color || '#666666');
                        } else if (interval) {
                            // v1.0 fix: labels such as #5 / #6 / b4 now render as themselves with the colour
                            // of their enharmonic equivalent instead of falling back to a plain note name.
                            displayText = interval;
                            const eq = this.musicTheory.getInterval(this.currentKey, note);
                            if (eq && this.musicTheory.intervals[eq]) {
                                fillColor = colors.intervals && colors.intervals[eq] ? colors.intervals[eq] : (this.musicTheory.intervals[eq].color || '#666666');
                            }
                        }
                    } else if (displayMode === 'notes') {
                        displayText = this.getProperNoteSpelling(note, this.currentKey, this.currentPatternType, this.currentPattern);
                        const interval = this.musicTheory.getInterval(this.currentKey, note);
                        if (interval && this.musicTheory.intervals[interval]) {
                            fillColor = colors.intervals && colors.intervals[interval] ? colors.intervals[interval] : (this.musicTheory.intervals[interval].color || '#666666');
                        }
                    } else if (displayMode === 'roman') {
                        const spelledNote = this.getProperNoteSpelling(note, this.currentKey, this.currentPatternType, this.currentPattern);
                        const alphabet = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
                        const rootLetter = this.currentKey[0];
                        const noteLetter = spelledNote[0];
                        const rootIdx = alphabet.indexOf(rootLetter);
                        const noteIdx = alphabet.indexOf(noteLetter);
                        
                        if (rootIdx !== -1 && noteIdx !== -1) {
                            const degree = (noteIdx - rootIdx + 7) % 7 + 1;
                            const romanBase = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][degree - 1];
                            const majorScaleOffsets = [0, 2, 4, 5, 7, 9, 11];
                            const startNoteIdx = this.musicTheory.notes.indexOf(this.musicTheory.toSharp(this.currentKey));
                            const actualNoteIdx = this.musicTheory.notes.indexOf(note);
                            const actualSemitones = (actualNoteIdx - startNoteIdx + 12) % 12;
                            const expectedSemitones = majorScaleOffsets[degree - 1];
                            
                            let diff = actualSemitones - expectedSemitones;
                            if (diff > 6) diff -= 12;
                            if (diff < -6) diff += 12;
                            
                            const prefix = diff > 0 ? '#'.repeat(diff) : (diff < 0 ? 'b'.repeat(Math.abs(diff)) : '');
                            displayText = prefix + romanBase;
                        }
                        
                        const interval = this.musicTheory.getInterval(this.currentKey, note);
                        if (interval && this.musicTheory.intervals[interval]) {
                            fillColor = colors.intervals && colors.intervals[interval] ? colors.intervals[interval] : (this.musicTheory.intervals[interval]?.color || '#666666');
                        }
                    } else if (displayMode === 'solfege') {
                        const properNote = this.getProperNoteSpelling(note, this.currentKey, this.currentPatternType, this.currentPattern);
                        displayText = this.musicTheory.solfege[properNote] || properNote;
                        const interval = this.musicTheory.getInterval(this.currentKey, note);
                        if (interval && this.musicTheory.intervals[interval]) {
                            fillColor = colors.intervals && colors.intervals[interval] ? colors.intervals[interval] : (this.musicTheory.intervals[interval].color || '#666666');
                        }
                    } else if (displayMode === 'none') {
                        // When text is hidden, still retain interval-based coloring
                        const interval = resolveIntervalForNote();
                        if (interval && this.musicTheory.intervals[interval]) {
                            // Keep displayText empty so drawNoteMarker won't render text
                            displayText = '';
                            fillColor = colors.intervals && colors.intervals[interval] ? colors.intervals[interval] : (this.musicTheory.intervals[interval].color || '#666666');
                        } else {
                            // fallback: no interval found, leave default note color but hide text
                            displayText = '';
                        }
                    }
                    
                    let textColor = this.getContrastColor(fillColor);
                    this.drawNoteMarker(fretX, stringY, fillColor, displayText, textColor, note, { stringIndex, fretNum });
                }
            }
        }
    };

    Fretboard.prototype.drawNoteMarker = function(x, y, color, text, textColor, pitch = text, position = {}) {
        const markerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        markerGroup.setAttribute('class', 'note-marker-group');
        markerGroup.setAttribute('data-note-text', text);
        markerGroup.setAttribute('data-fret-note', 'true');
        if (Number.isInteger(position.fretNum)) markerGroup.setAttribute('data-fret', String(position.fretNum));
        markerGroup.setAttribute('role', 'button');
        markerGroup.setAttribute('tabindex', this.svg.querySelector('[data-fret-note="true"]') ? '-1' : '0');
        const stringNumber = Number.isInteger(position.stringIndex) ? this.settings.tuning.length - position.stringIndex : null;
        const location = stringNumber ? 'String ' + stringNumber + ', fret ' + position.fretNum : '';
        const accessibleName = [pitch, location, text && text !== pitch ? text : ''].filter(Boolean).join(', ');
        markerGroup.setAttribute('aria-label', accessibleName);
        this.svg.appendChild(markerGroup);
        if (location) {
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = accessibleName;
            markerGroup.appendChild(title);
        }
        
        y = y + this.settings.noteOffset;
        const size = this.settings.noteSize;
        let fillValue = color;
        
        if (this.settings.noteGradient) {
            const gradientId = `gradient-${text}-${Math.random().toString(36).substring(2, 9)}`;
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
            gradient.setAttribute('id', gradientId);
            gradient.setAttribute('cx', '50%'); gradient.setAttribute('cy', '50%'); gradient.setAttribute('r', '50%');
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', this.lightenColor(color, 30));
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', color);
            gradient.appendChild(stop1); gradient.appendChild(stop2);
            const defs = this.svg.querySelector('defs') || this.svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), this.svg.firstChild);
            defs.appendChild(gradient);
            fillValue = `url(#${gradientId})`;
        }
        
        let marker = (typeof FretboardMarker !== 'undefined') ? 
            FretboardMarker.createShape(this.settings.noteShape, x, y, size, fillValue, this) : 
            document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        
        if (marker.tagName === 'circle') {
            marker.setAttribute('cx', x); marker.setAttribute('cy', y); marker.setAttribute('r', size);
        }
        
        marker.setAttribute('class', 'note-marker');
        marker.setAttribute('fill', fillValue);
        marker.setAttribute('stroke', '#000');
        marker.setAttribute('stroke-width', 1);
        marker.setAttribute('data-note', text);
        marker.setAttribute('data-pitch', pitch);
        
        if (this.settings.noteEffect && typeof FretboardEffects !== 'undefined') {
            FretboardEffects.applyEffect(this.settings.noteEffect, marker, markerGroup, x, y, size, fillValue, this);
        }
        
        markerGroup.addEventListener('keydown', event => {
            const markers = Array.from(this.svg.querySelectorAll('[data-fret-note="true"]'));
            const index = markers.indexOf(markerGroup);
            let next = index;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(markers.length - 1, index + 1);
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, index - 1);
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = markers.length - 1;
            else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                markerGroup.click();
                return;
            } else return;
            event.preventDefault();
            markers.forEach((marker, markerIndex) => marker.setAttribute('tabindex', markerIndex === next ? '0' : '-1'));
            markers[next]?.focus();
        });
        markerGroup.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.shiftKey) {
                this.clearSelectedMarkers();
                this.svg.querySelectorAll('.note-marker-group').forEach(mg => {
                    if (mg.getAttribute('data-note-text') === text) {
                        mg.classList.add('selected');
                        this.selectedMarkers.push(mg);
                    }
                });
                if (this.selectedMarkers.length > 0) this.showMultiNoteEditMenu(this.selectedMarkers, x, y);
            } else if (e.ctrlKey || e.metaKey) {
                markerGroup.classList.toggle('selected');
                if (markerGroup.classList.contains('selected')) this.selectedMarkers.push(markerGroup);
                else this.selectedMarkers = this.selectedMarkers.filter(m => m !== markerGroup);
                if (this.selectedMarkers.length > 0) this.showMultiNoteEditMenu(this.selectedMarkers, x, y);
            } else {
                this.clearSelectedMarkers();
                this.selectedMarkers = [markerGroup];
                markerGroup.classList.add('selected');
                this.showNoteEditMenu(markerGroup, marker, text, x, y, color);
            }
        });
        
        markerGroup.appendChild(marker);
        if (this.settings.displayMode !== 'none') {
            const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textEl.setAttribute('x', x); textEl.setAttribute('y', y);
            textEl.setAttribute('dominant-baseline', 'central');
            textEl.setAttribute('text-anchor', 'middle'); textEl.setAttribute('fill', textColor || this.getContrastColor(fillValue));
            textEl.setAttribute('font-size', `${this.settings.noteFontSize}px`); textEl.setAttribute('font-family', 'Arial Narrow');
            textEl.setAttribute('font-weight', 'bold'); textEl.setAttribute('pointer-events', 'none');
            textEl.textContent = text;
            markerGroup.appendChild(textEl);
        }
    };
}