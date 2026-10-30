/**
 * UI Theory Rendering Helpers Extension
 * Specialized renderers for different theory pattern types.
 */

if (typeof App !== 'undefined') {
    App.prototype.renderLessonInfo = function(panel, key, patternId) {
        const lessonIndex = parseInt(patternId);
        const lesson = this.lessons[lessonIndex];
        if (!lesson) {
            panel.innerHTML = '<p>Lesson data not found.</p>';
            return;
        }
        const content = document.createElement('div');
        content.className = 'theory-info-content';
        this.addInfoItem(content, 'Goal', lesson.description);
        this.addInfoItem(content, 'Focus', lesson.text, true);

        const learnMoreBtn = document.createElement('button');
        learnMoreBtn.textContent = 'View Full Lesson Instructions';
        learnMoreBtn.style.marginTop = '15px';
        learnMoreBtn.style.gridColumn = '1 / -1';
        learnMoreBtn.addEventListener('click', () => {
            this.openLessonPage(key, lesson.patternType, lesson.patternId, lesson);
        });
        content.appendChild(learnMoreBtn);

        panel.innerHTML = '';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'theory-info-title';
        titleDiv.textContent = lesson.title;
        titleDiv.style.display = this.titleVisible ? 'block' : 'none';
        panel.appendChild(titleDiv);
        panel.appendChild(content);
        
        if (lesson.patternType && lesson.patternId) {
            this.addScaleDescription(panel, lesson.patternType, lesson.patternId, key);
        }
    };

    App.prototype.renderProgressionInfo = function(panel, key, patternId) {
        let progressionPattern = this.chordProgressionPatterns.find(cp => cp.id === patternId);
        if (!progressionPattern) {
            panel.innerHTML = '<p>No chord progression info available.</p>';
            return;
        }
        const parts = progressionPattern.progression.trim().split(/\s+/);
        const beatUnit = 50;
        const chordProgressionArray = [];
        parts.forEach(part => {
            const [numeral, beatCountStr] = part.split(':');
            const beats = parseInt(beatCountStr) || 1;
            const chord = this.musicTheory.getChordFromRoman(numeral, key);
            chordProgressionArray.push({ numeral, chord, beats });
        });
        let progressionHTML = `<div style="display: flex; flex-wrap: wrap; gap: 4px;">`;
        chordProgressionArray.forEach(chordObj => {
            const width = Math.max(60, chordObj.beats * beatUnit);
            progressionHTML += `<button class="progression-chord-btn" data-chord="${chordObj.chord}" style="width: ${width}px; background: var(--button-bg); color: var(--button-text); border: none; text-align: center; padding: 8px 4px; border-radius: 4px; cursor: pointer; transition: transform 0.1s;">
                <div style="font-weight: bold;">${chordObj.numeral}</div>
                <div style="font-size: 0.9em; opacity: 0.9;">${chordObj.chord}</div>
            </button>`;
        });
        progressionHTML += `</div>`;
        panel.innerHTML = '';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'theory-info-title';
        titleDiv.textContent = `Chord Progression in Key of ${key}`;
        titleDiv.style.display = this.titleVisible ? 'block' : 'none';
        panel.appendChild(titleDiv);
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = progressionHTML;
        panel.appendChild(contentDiv);
        
        // Add click listeners to play chords
        contentDiv.querySelectorAll('.progression-chord-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const chordName = btn.getAttribute('data-chord');
                if (!this.synth) {
                    try { await this.initSynth(); } catch(e){}
                }
                
                // Animate button
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 100);
                
                // Parse chord basic info (simplistic approach for demo)
                // Just play the root for now or try to parse
                const rootMatch = chordName.match(/^[A-G][#b]?/);
                if (rootMatch && this.synth) {
                    const root = rootMatch[0];
                    // Find a basic major/minor parsing
                    const isMinor = chordName.includes('m') && !chordName.includes('maj');
                    const notes = this.musicTheory.getChordNotes(root, isMinor ? 'minor' : 'major');
                    const freqs = notes.map(n => this.musicTheory.getNoteFrequency(n, 4));
                    this.synth.triggerAttackRelease(freqs, '4n');
                }
            });
        });
    };

    App.prototype.renderGridInfo = function(panel, key, patternId, isCompact = false) {
        const gridPosition = parseInt(patternId);
        const startFret = gridPosition;
        const endFret = gridPosition + (isCompact ? 1 : 2);
        
        panel.innerHTML = '';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'theory-info-title';
        titleDiv.textContent = `${key} Major Scale (Frets ${startFret}-${endFret})`;
        titleDiv.style.display = this.titleVisible ? 'block' : 'none';
        panel.appendChild(titleDiv);
        
        const content = document.createElement('div');
        content.className = 'theory-info-content';
        this.addInfoItem(content, 'Pattern Type', `Major Scale ${isCompact ? '2-Fret' : '3-Fret'} Grid Position`);
        this.addInfoItem(content, 'Position', `Frets ${startFret}-${endFret}`);
        this.addInfoItem(content, 'Description', `This is a ${isCompact ? '2-fret' : '3-fret'} section of the ${key} major scale, useful for practicing in position.`);
        panel.appendChild(content);
    };

    App.prototype.renderGamutInfo = function(panel, key, patternId) {
        const gamutData = this.musicTheory.gamuts[patternId];
        panel.innerHTML = '';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'theory-info-title';
        titleDiv.textContent = gamutData ? gamutData.name : 'Gamut Pattern';
        titleDiv.style.display = this.titleVisible ? 'block' : 'none';
        panel.appendChild(titleDiv);
        
        const content = document.createElement('div');
        content.className = 'theory-info-content';
        this.addInfoItem(content, 'Type', 'Position-based Gamut');
        if (gamutData && gamutData.positions && gamutData.positions.length > 0) {
            const frets = gamutData.positions.map(p => p.fret);
            const minFret = Math.min(...frets);
            const maxFret = Math.max(...frets);
            this.addInfoItem(content, 'Fret Range', `Frets ${minFret} to ${maxFret}`);
            this.addInfoItem(content, 'Positions', `${gamutData.positions.length} notes`);
        }
        panel.appendChild(content);
    };
}