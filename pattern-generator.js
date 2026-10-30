/**
 * Pattern Generator Extension for App
 */

App.prototype.generateAllIntervals = function() {
    const key = document.getElementById('key-select').value;
    const patternType = 'interval';
    
    // Check if we're already showing interval patterns and toggle if so
    if (this.generatedPatterns.length > 0 && 
        this.generatedPatterns[0].patternType === 'interval') {
        // Clear patterns and hide export buttons
        this.generatedPatterns = [];
        this.updateGeneratedPatternsDisplay();
        return;
    }
    
    // Clear previous generated patterns
    this.generatedPatterns = [];
    
    // Generate a pattern for each interval
    Object.keys(this.musicTheory.intervals).forEach(interval => {
        const targetNote = this.musicTheory.getNoteFromInterval(key, interval);
        const intervalData = this.musicTheory.intervals[interval];
        
        // Create a pattern object with detailed information
        const pattern = {
            key: key,
            patternType: patternType,
            pattern: interval,
            name: `${key} to ${targetNote} (${intervalData.name})`,
            info: {
                semitones: intervalData.semitones,
                quality: this.musicTheory.getIntervalQuality(interval),
                consonance: this.musicTheory.getIntervalConsonance(interval),
                notes: [key, targetNote]
            },
            filename: `${this.fretboard.settings.tuning.join('-')}-${key}-${interval}.jpg`
        };
        
        this.generatedPatterns.push(pattern);
    });
    
    this.updateGeneratedPatternsDisplay();
    this.addBatchButtons('Interval');
};

App.prototype.generateAllScales = function() {
    const key = document.getElementById('key-select').value;
    const patternType = 'scale';
    
    // Check if we're already showing scale patterns and toggle if so
    if (this.generatedPatterns.length > 0 && 
        this.generatedPatterns[0].patternType === 'scale') {
        // Clear patterns and hide export buttons
        this.generatedPatterns = [];
        this.updateGeneratedPatternsDisplay();
        return;
    }
    
    // Clear previous generated patterns
    this.generatedPatterns = [];
    
    // Generate a pattern for each scale
    Object.entries(this.musicTheory.scales).forEach(([scaleId, scaleData]) => {
        const notes = this.musicTheory.getScaleNotes(key, scaleId);
        const relatedModes = this.musicTheory.getRelatedModes(scaleId);
        
        // Get scale quality
        let quality = '';
        if (scaleId.includes('major')) {
            quality = 'Major';
        } else if (scaleId.includes('minor')) {
            quality = 'Minor';
        } else if (scaleId === 'diminished') {
            quality = 'Diminished';
        } else if (scaleId === 'whole_tone') {
            quality = 'Augmented';
        } else {
            quality = 'Other';
        }
        
        // Create a pattern object with detailed information
        const pattern = {
            key: key,
            patternType: patternType,
            pattern: scaleId,
            name: `${key} ${scaleData.name}`,
            info: {
                notes: notes,
                formula: scaleData.intervals.join('-'),
                quality: quality,
                relatedModes: relatedModes,
                description: this.musicTheory.getScaleDescription ? this.musicTheory.getScaleDescription(scaleId) : '',
                customProperties: scaleData.customProperties || {}
            },
            filename: `${this.fretboard.settings.tuning.join('-')}-${key}-${scaleId}.jpg`
        };
        
        this.generatedPatterns.push(pattern);
    });
    
    this.updateGeneratedPatternsDisplay();
    this.addBatchButtons('Scale');
};

App.prototype.generateAllChords = function() {
    const key = document.getElementById('key-select').value;
    const patternType = 'chord';
    
    // Check if we're already showing chord patterns and toggle if so
    if (this.generatedPatterns.length > 0 && 
        this.generatedPatterns[0].patternType === 'chord') {
        // Clear patterns and hide export buttons
        this.generatedPatterns = [];
        this.updateGeneratedPatternsDisplay();
        return;
    }
    
    // Clear previous generated patterns
    this.generatedPatterns = [];
    
    // Generate a pattern for each chord
    Object.entries(this.musicTheory.chords).forEach(([chordId, chordData]) => {
        const notes = this.musicTheory.getChordNotes(key, chordId);
        const inversions = this.musicTheory.getChordInversions(notes);
        
        // Get chord quality
        let quality = '';
        if (chordId === 'major') {
            quality = 'Major';
        } else if (chordId === 'minor') {
            quality = 'Minor';
        } else if (chordId.includes('diminished')) {
            quality = 'Diminished';
        } else if (chordId.includes('augmented')) {
            quality = 'Augmented';
        } else if (chordId.includes('major')) {
            quality = 'Major-derived';
        } else if (chordId.includes('minor')) {
            quality = 'Minor-derived';
        } else {
            quality = 'Other';
        }
        
        // Create a pattern object with detailed information
        const pattern = {
            key: key,
            patternType: patternType,
            pattern: chordId,
            name: `${key} ${chordData.name}`,
            info: {
                notes: notes,
                formula: chordData.intervals.join('-'),
                quality: quality,
                inversions: inversions,
                description: this.musicTheory.getChordDescription ? this.musicTheory.getChordDescription(chordId) : ''
            },
            filename: `${this.fretboard.settings.tuning.join('-')}-${key}-${chordId}.jpg`
        };
        
        this.generatedPatterns.push(pattern);
    });
    
    this.updateGeneratedPatternsDisplay();
    this.addBatchButtons('Chord');
};

App.prototype.updateGeneratedPatternsDisplay = function() {
    const container = document.getElementById('generated-patterns');
    container.innerHTML = '';
    
    this.generatedPatterns.forEach((pattern, index) => {
        const patternDiv = document.createElement('div');
        patternDiv.className = 'generated-pattern';
        
        // Add the info
        const info = document.createElement('div');
        info.className = 'pattern-info';
        info.textContent = pattern.name;
        
        // Add detailed info if available
        if (pattern.info) {
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'pattern-details';
            detailsDiv.style.fontSize = '12px';
            detailsDiv.style.color = '#666';
            detailsDiv.style.marginTop = '5px';
            
            if (pattern.patternType === 'interval') {
                detailsDiv.innerHTML = `
                    <div><strong>Notes:</strong> ${pattern.info.notes.join(' - ')}</div>
                    <div><strong>Semitones:</strong> ${pattern.info.semitones}</div>
                    <div><strong>Quality:</strong> ${pattern.info.quality}</div>
                `;
            } else if (pattern.patternType === 'scale') {
                detailsDiv.innerHTML = `
                    <div><strong>Notes:</strong> ${pattern.info.notes.join(' - ')}</div>
                    <div><strong>Formula:</strong> ${pattern.info.formula}</div>
                    <div><strong>Quality:</strong> ${pattern.info.quality}</div>
                `;
            } else if (pattern.patternType === 'chord') {
                detailsDiv.innerHTML = `
                    <div><strong>Notes:</strong> ${pattern.info.notes.join(' - ')}</div>
                    <div><strong>Formula:</strong> ${pattern.info.formula}</div>
                    <div><strong>Quality:</strong> ${pattern.info.quality}</div>
                `;
            }
            
            info.appendChild(detailsDiv);
        }
        
        patternDiv.appendChild(info);
        
        // Add buttons
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View';
        viewBtn.style.backgroundColor = 'var(--secondary-color)';
        viewBtn.addEventListener('click', () => {
            this.fretboard.updatePattern(pattern.key, pattern.patternType, pattern.pattern);
            this.updateTheoryInfo(pattern.key, pattern.patternType, pattern.pattern);
            // Scroll to fretboard for better UX
            document.getElementById('fretboard').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        patternDiv.appendChild(viewBtn);
        
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add to Slideshow';
        addBtn.addEventListener('click', () => {
            // Update the fretboard to this pattern first
            this.fretboard.updatePattern(pattern.key, pattern.patternType, pattern.pattern);
            this.updateTheoryInfo(pattern.key, pattern.patternType, pattern.pattern);
            // Then add it to the slideshow
            this.addToSlideshow();
        });
        patternDiv.appendChild(addBtn);
        
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export';
        exportBtn.addEventListener('click', () => {
            // Update the fretboard to this pattern first
            this.fretboard.updatePattern(pattern.key, pattern.patternType, pattern.pattern);
            this.updateTheoryInfo(pattern.key, pattern.patternType, pattern.pattern);
            // Then export it
            this.fretboard.exportImage(pattern.filename);
        });
        patternDiv.appendChild(exportBtn);
        
        // Add Learn button
        const learnBtn = document.createElement('button');
        learnBtn.textContent = 'Learn';
        learnBtn.addEventListener('click', () => {
            this.openLessonPage(pattern.key, pattern.patternType, pattern.pattern);
        });
        patternDiv.appendChild(learnBtn);
        
        container.appendChild(patternDiv);
    });
};

App.prototype.addBatchButtons = function(type) {
    const container = document.getElementById('generated-patterns');
    if (!container) return;

    // Clear existing batch buttons
    ['.add-all-to-slideshow', '.export-all-generated', '.export-all-with-info'].forEach(selector => {
        const el = container.querySelector(selector);
        if (el) el.remove();
    });

    const createBtn = (text, className, color, onClick) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = className;
        btn.style.width = '100%';
        btn.style.margin = '5px 0';
        btn.style.padding = '12px';
        btn.style.backgroundColor = color;
        btn.style.color = 'white';
        btn.style.fontWeight = 'bold';
        btn.style.border = 'none';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', onClick);
        return btn;
    };

    const batchContainer = document.createElement('div');
    batchContainer.className = 'batch-controls-container';
    batchContainer.style.paddingBottom = '15px';
    batchContainer.style.borderBottom = '2px solid var(--border-color)';
    batchContainer.style.marginBottom = '20px';

    const addAllBtn = createBtn(`Add All ${type}s to Slideshow`, 'add-all-to-slideshow', '#f39c12', async () => {
        if (this.generatedPatterns.length === 0) return;
        const origText = addAllBtn.textContent;
        addAllBtn.textContent = 'Adding...';
        addAllBtn.disabled = true;
        for (let i = 0; i < this.generatedPatterns.length; i++) {
            const p = this.generatedPatterns[i];
            this.fretboard.updatePattern(p.key, p.patternType, p.pattern);
            this.updateTheoryInfo(p.key, p.patternType, p.pattern);
            this.addToSlideshow();
            if (i % 8 === 0) await new Promise(r => setTimeout(r, 0));
        }
        addAllBtn.textContent = origText;
        addAllBtn.disabled = false;
        alert(`Added ${this.generatedPatterns.length} patterns to slideshow.`);
    });

    const exportZipBtn = createBtn(`Export All ${type}s (ZIP)`, 'export-all-generated', '#000', () => this.exportAllGenerated());
    const exportInfoZipBtn = createBtn(`Export All ${type}s with Theory Info (ZIP)`, 'export-all-with-info', '#000', () => this.exportAllGeneratedWithInfo());

    batchContainer.appendChild(addAllBtn);
    batchContainer.appendChild(exportZipBtn);
    batchContainer.appendChild(exportInfoZipBtn);
    
    container.insertBefore(batchContainer, container.firstChild);
};

App.prototype.addExportAllButton = function() { /* stub for compatibility */ };
App.prototype.addExportAllWithInfoButton = function() { /* stub for compatibility */ };
App.prototype.addAddAllToSlideshowButton = function() { /* stub for compatibility */ };