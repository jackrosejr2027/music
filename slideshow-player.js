/**
 * Slideshow Player Extension
 * Handles the actual playback loop and metronome for the slideshow.
 */
if (typeof App !== 'undefined') {
    App.prototype.playSlideshow = async function() {
        // Toggle stop if currently playing
        if (this.isPlayingSlideshow) {
            this.isPlayingSlideshow = false;
            return;
        }

        if (this.slideshowItems.length === 0) {
            alert('No items in the slideshow');
            return;
        }

        // Ensure synth exists for metronome clicks
        if (!this.synth) {
            try { await this.initSynth(); } catch (e) { console.warn('Tone init failed:', e); }
        }

        this.isPlayingSlideshow = true;
        this.isPausedSlideshow = false;
        const playBtn = document.getElementById('play-slideshow');
        const pauseBtn = document.getElementById('pause-slideshow');
        const originalText = playBtn ? playBtn.innerHTML : '▶️';
        if (playBtn) {
            playBtn.textContent = 'Stop slideshow';
            playBtn.setAttribute('aria-label', 'Stop slideshow');
            playBtn.style.backgroundColor = '#e74c3c';
        }
        if (pauseBtn) {
            pauseBtn.style.display = 'flex';
            pauseBtn.textContent = 'Pause slideshow';
            pauseBtn.setAttribute('aria-label', 'Pause slideshow');
        }

        // BPM/duration
        const bpm = parseFloat(document.getElementById('slideshow-bpm').value) || 60;
        const measures = parseFloat(document.getElementById('slideshow-duration').value) || 1;
        const beatsPerMeasure = 4;
        const beatMs = (60 * 1000) / Math.max(1, bpm);
        const slideDurationMs = beatMs * beatsPerMeasure * measures;

        // Create or reuse info panel showing progress + current pattern + countdown
        let infoDiv = document.getElementById('slideshow-playback-info');
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.id = 'slideshow-playback-info';
            // Smaller, less intrusive styling and placed at the bottom of the slideshow area
            infoDiv.style.textAlign = 'center';
            infoDiv.style.fontSize = '0.95em';
            infoDiv.style.fontWeight = '700';
            infoDiv.style.color = 'var(--primary-color)';
            infoDiv.style.margin = '8px 0 0 0';
            infoDiv.style.padding = '8px';
            infoDiv.style.backgroundColor = 'rgba(0,0,0,0.03)';
            infoDiv.style.border = '1px solid var(--border-color)';
            infoDiv.style.borderRadius = '6px';
            const slideshowContainer = document.querySelector('.slideshow-container');
            // Append at the end so it sits below the fretboard/thumbnail area
            if (slideshowContainer) slideshowContainer.appendChild(infoDiv);
        }
        infoDiv.style.display = 'block';

        // Countdown overlay element (smaller and positioned near bottom center so it doesn't block the diagram)
        let countdownOverlay = document.getElementById('slideshow-countdown-overlay');
        if (!countdownOverlay) {
            countdownOverlay = document.createElement('div');
            countdownOverlay.id = 'slideshow-countdown-overlay';
            countdownOverlay.style.position = 'fixed';
            countdownOverlay.style.left = '50%';
            countdownOverlay.style.bottom = '14px';
            countdownOverlay.style.top = 'auto';
            countdownOverlay.style.transform = 'translateX(-50%)';
            countdownOverlay.style.zIndex = '20000';
            countdownOverlay.style.pointerEvents = 'none';
            countdownOverlay.style.fontSize = '16px';
            countdownOverlay.style.fontWeight = '700';
            countdownOverlay.style.color = 'white';
            countdownOverlay.style.background = 'rgba(0,0,0,0.6)';
            countdownOverlay.style.padding = '8px 12px';
            countdownOverlay.style.borderRadius = '6px';
            countdownOverlay.style.display = 'none';
            // Append to body so it's always visible but not overlapping fretboard center
            document.body.appendChild(countdownOverlay);
        }

        // Metronome synth setup
        let toneClick = null;
        if (this.synth && typeof Tone !== 'undefined') {
            toneClick = new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }
            }).toDestination();
        }

        const playClick = (time = 0) => {
            try {
                if (toneClick) {
                    toneClick.triggerAttackRelease('C6', '16n', time);
                } else if (window.AudioContext || window.webkitAudioContext) {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(800, ctx.currentTime);
                    o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
                    g.gain.setValueAtTime(0.0001, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.005);
                    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.start();
                    setTimeout(() => { o.stop(); ctx.close(); }, 80);
                }
            } catch (err) {
                console.warn('Metronome click failed', err);
            }
        };

        // Helper that waits while allowing stop flag checks every small interval
        const sleepCheck = async (ms) => {
            let elapsed = 0;
            let lastTime = performance.now();
            while (this.isPlayingSlideshow) {
                if (this.isPausedSlideshow) {
                    await new Promise(res => setTimeout(res, 100));
                    lastTime = performance.now();
                    continue;
                }
                const now = performance.now();
                elapsed += (now - lastTime);
                lastTime = now;
                if (elapsed >= ms) return;
                await new Promise(res => setTimeout(res, Math.min(100, ms - elapsed)));
            }
        };

        // Play through the slideshow
        const totalSlides = this.slideshowItems.length;
        let slideIndex = 0;

        const loopOnce = async () => {
            for (slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
                if (!this.isPlayingSlideshow) break;
                const item = this.slideshowItems[slideIndex];

                // Update UI selects to reflect current slide
                const keySelect = document.getElementById('key-select');
                if (keySelect && Array.from(keySelect.options).some(o => o.value === item.info.key)) {
                    keySelect.value = item.info.key;
                } else if (keySelect) {
                    const tmp = document.createElement('option');
                    tmp.value = item.info.key; tmp.textContent = item.info.key; keySelect.appendChild(tmp);
                    keySelect.value = item.info.key;
                }
                
                const patternTypeSelect = document.getElementById('pattern-type');
                if (patternTypeSelect && Array.from(patternTypeSelect.options).some(o => o.value === item.info.patternType)) {
                    if (patternTypeSelect.value !== item.info.patternType) {
                        patternTypeSelect.value = item.info.patternType;
                        if (typeof this.updatePatternSelect === 'function') this.updatePatternSelect();
                    }
                }
                
                const patternSelect = document.getElementById('pattern-select');
                if (patternSelect && Array.from(patternSelect.options).some(o => String(o.value) === String(item.info.pattern))) {
                    patternSelect.value = String(item.info.pattern);
                }

                // Update fretboard, theory info, and current pattern display
                this.updateFretboard();

                // Update infoDiv: show which slide / pattern and BPM info (friendly names + intervals)
                (function() {
                    const key = item.info.key || '';
                    const pType = item.info.patternType || '';
                    const pId = item.info.pattern || '';
                    let patternName = pId;
                    let intervalsText = '';

                    try {
                        if (pType === 'scale' && this.musicTheory.scales && this.musicTheory.scales[pId]) {
                            patternName = this.musicTheory.scales[pId].name || pId;
                            intervalsText = (this.musicTheory.scales[pId].intervals || []).join(' - ');
                        } else if (pType === 'chord' && this.musicTheory.chords && this.musicTheory.chords[pId]) {
                            patternName = this.musicTheory.chords[pId].name || pId;
                            intervalsText = (this.musicTheory.chords[pId].intervals || []).join(' - ');
                        } else if (pType === 'interval' && this.musicTheory.intervals && this.musicTheory.intervals[pId]) {
                            patternName = this.musicTheory.intervals[pId].name || pId;
                            intervalsText = `${this.musicTheory.intervals[pId].shortName || pId} · ${this.musicTheory.intervals[pId].semitones} semitones`;
                        } else if (pType === 'custom' && this.musicTheory.customPatterns && this.musicTheory.customPatterns[pId]) {
                            patternName = this.musicTheory.customPatterns[pId].name || pId;
                            intervalsText = (this.musicTheory.customPatterns[pId].intervals || []).join(' - ');
                        } else {
                            patternName = pId;
                            intervalsText = '';
                        }
                    } catch (err) {
                        patternName = pId;
                        intervalsText = '';
                    }

                    // Sentence case for type label
                    const typeLabel = pType ? (pType.charAt(0).toUpperCase() + pType.slice(1).toLowerCase()) : '';

                    infoDiv.innerHTML = `Slide ${slideIndex + 1} / ${totalSlides} — ${key} · ${typeLabel} · ${patternName}
                        <div style="font-size:12px; font-weight:400; margin-top:6px;">${intervalsText ? `Intervals: ${intervalsText} · ` : ''}BPM: ${bpm} · ${measures} measures · ${Math.round(slideDurationMs)} ms</div>`;
                }).call(this);

                // Show big countdown overlay and run beat-level metronome clicks
                countdownOverlay.style.display = 'block';
                const totalBeats = beatsPerMeasure * measures;
                const startTime = performance.now();

                for (let beat = 0; beat < totalBeats; beat++) {
                    if (!this.isPlayingSlideshow) break;

                    // Compute remaining seconds for UI (rounded up)
                    const elapsed = performance.now() - startTime;
                    const remainingMs = Math.max(0, slideDurationMs - elapsed);
                    const remainingSeconds = Math.ceil(remainingMs / 1000);

                    // Build friendly label for overlay
                    const key = item.info.key || '';
                    const pType = item.info.patternType || '';
                    const pId = item.info.pattern || '';
                    let patternName = pId;
                    let intervalsText = '';
                    try {
                        if (pType === 'scale' && this.musicTheory.scales && this.musicTheory.scales[pId]) {
                            patternName = this.musicTheory.scales[pId].name || pId;
                            intervalsText = (this.musicTheory.scales[pId].intervals || []).join(' - ');
                        } else if (pType === 'chord' && this.musicTheory.chords && this.musicTheory.chords[pId]) {
                            patternName = this.musicTheory.chords[pId].name || pId;
                            intervalsText = (this.musicTheory.chords[pId].intervals || []).join(' - ');
                        } else if (pType === 'interval' && this.musicTheory.intervals && this.musicTheory.intervals[pId]) {
                            patternName = this.musicTheory.intervals[pId].name || pId;
                            intervalsText = `${this.musicTheory.intervals[pId].shortName || pId} · ${this.musicTheory.intervals[pId].semitones} semitones`;
                        } else if (pType === 'custom' && this.musicTheory.customPatterns && this.musicTheory.customPatterns[pId]) {
                            patternName = this.musicTheory.customPatterns[pId].name || pId;
                            intervalsText = (this.musicTheory.customPatterns[pId].intervals || []).join(' - ');
                        }
                    } catch (err) {
                        patternName = pId;
                        intervalsText = '';
                    }

                    // Sentence case for type label
                    const typeLabel = pType ? (pType.charAt(0).toUpperCase() + pType.slice(1).toLowerCase()) : '';

                    // Show countdown overlay with Key · Pattern Name · Intervals (sentence case)
                    const progressPct = Math.min(100, (elapsed / slideDurationMs) * 100).toFixed(1);
                    countdownOverlay.innerHTML = `
                        <div style="margin-bottom: 5px;">${key} · ${patternName}${intervalsText ? ' · ' + intervalsText : ''} • ${remainingSeconds}s</div>
                        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
                            <div style="width: ${progressPct}%; height: 100%; background: var(--accent-color, #27ae60); transition: width 0.1s linear;"></div>
                        </div>
                    `;

                    // Visual pulse on fretboard
                    const fbContainer = this.fretboard.container;
                    const origShadow = fbContainer.style.boxShadow;
                    fbContainer.style.boxShadow = '0 0 25px var(--accent-color)';
                    setTimeout(() => {
                        if(this.isPlayingSlideshow && fbContainer) fbContainer.style.boxShadow = origShadow;
                    }, 150);

                    // Play metronome click
                    playClick();
                    // Wait one beat or until stop
                    await sleepCheck(beatMs);
                }

                // ensure we finish the slide duration if beats finished early
                const elapsedTotal = performance.now() - startTime;
                if (elapsedTotal < slideDurationMs) {
                    await sleepCheck(slideDurationMs - elapsedTotal);
                }

                // hide overlay briefly between slides
                countdownOverlay.style.display = 'none';
                if (!this.isPlayingSlideshow) break;
            }
        };

        // Run first pass
        await loopOnce();

        // Loop if user requested looping and still playing
        while (this.isPlayingSlideshow && document.getElementById('slideshow-loop').checked) {
            await loopOnce();
        }

        // Cleanup & restore UI
        this.isPlayingSlideshow = false;
        this.isPausedSlideshow = false;
        if (playBtn) {
            playBtn.innerHTML = originalText;
            playBtn.setAttribute('aria-label', playBtn.textContent);
            playBtn.style.backgroundColor = '';
        }
        if (pauseBtn) {
            pauseBtn.style.display = 'none';
            pauseBtn.textContent = 'Pause slideshow';
            pauseBtn.setAttribute('aria-label', 'Pause slideshow');
        }
        if (infoDiv) infoDiv.style.display = 'none';
        if (countdownOverlay) countdownOverlay.style.display = 'none';
        
        // Refresh UI to restore Cycle/Shuffle buttons
        if (typeof this.updateFretboard === 'function') {
            this.updateFretboard();
        }
    };
}