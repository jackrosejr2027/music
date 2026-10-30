/**
 * Export Extension for App
 */
if (typeof App !== 'undefined') {
    App.prototype.exportCurrentDiagram = async function() {
        const info = this.fretboard.getCurrentInfo();
        const customFilename = this.customFilename || `${info.tuning}-${info.key}-${info.patternType}-${info.pattern}.jpg`;
        
        // Do not change visibility of the theory info panel when exporting;
        // export should not force the info panel to unhide.
        return this.fretboard.exportImage(customFilename);
    };

    Exporter.exportAllPatternsToMidiZip = async function(app) {
        const status = document.getElementById('midi-zip-status');
        const report = message => { if (status) status.textContent = message; };
        if (typeof JSZip === 'undefined' || !window.STDAWMidi) throw new Error('The bundled MIDI or ZIP library is unavailable.');

        const theory = app.musicTheory;
        const keys = theory.notes;
        const categories = [
            { type: 'interval', folder: 'Intervals', data: theory.intervals },
            { type: 'chord', folder: 'Chords', data: theory.chords },
            { type: 'scale', folder: 'Scales', data: theory.scales }
        ];
        if (Object.keys(theory.customPatterns || {}).length) {
            categories.push({ type: 'custom', folder: 'Custom Patterns', data: theory.customPatterns });
        }
        const entries = [];
        categories.forEach(category => {
            Object.entries(category.data || {}).forEach(([id, data]) => {
                keys.forEach(key => entries.push({ ...category, id, name: data.name || id, key }));
            });
        });
        if (!entries.length) throw new Error('There are no supported patterns to export.');

        const zip = new JSZip();
        const compiledSteps = [];
        const skipped = [];
        const safeName = value => String(value || 'pattern').normalize('NFKD').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 72) || 'pattern';
        const bpm = Math.max(40, Math.min(240, Number(app.tempo) || 120));
        let exported = 0;
        app.stopExporting = false;
        try {
            for (let index = 0; index < entries.length; index++) {
                if (app.stopExporting) break;
                const entry = entries[index];
                const title = entry.key + ' ' + entry.name;
                const step = { kind: entry.type, item: entry.id, key: entry.key, offset: 0, beats: 4, label: title };
                if (entry.type === 'custom') step.notes = theory.getCustomNotes(entry.key, entry.id);
                try {
                    const bytes = window.STDAWMidi.createMidi([step], theory, entry.key, bpm, title);
                    const keyFolder = safeName(entry.key.replace('#', 'sharp'));
                    zip.file(entry.folder + '/' + keyFolder + '/' + safeName(entry.id) + '-' + safeName(entry.name) + '.mid', bytes);
                    compiledSteps.push(step);
                    exported++;
                } catch (error) {
                    skipped.push(title + ': ' + (error.message || 'invalid pattern'));
                }
                if ((index + 1) % 40 === 0) {
                    report('Encoding MIDI ' + (index + 1) + ' of ' + entries.length + '...');
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            if (!compiledSteps.length) throw new Error('No valid patterns were available to export.');
            zip.file('all-patterns-all-keys.mid', window.STDAWMidi.createMidi(compiledSteps, theory, 'C', bpm, 'All Fretboard Patterns'));
            zip.file('README.txt', [
                'SCALES THESAURUS FRETBOARD MIDI EXPORT',
                '',
                'Individual MIDI files are organized by category and key.',
                'all-patterns-all-keys.mid contains the exported patterns in sequence with standard MIDI marker events naming each section.',
                'Included keys: ' + keys.join(', '),
                'Tempo: ' + bpm + ' BPM',
                'Patterns exported: ' + exported,
                'Patterns skipped: ' + skipped.length,
                ...(app.stopExporting ? ['This archive is partial because export was stopped.'] : []),
                ...skipped.map(item => '- ' + item)
            ].join('\n'));
            report('Compressing ' + exported + ' MIDI diagrams and the compiled file...');
            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } }, metadata => {
                report('Compressing MIDI ZIP... ' + Math.round(metadata.percent) + '%');
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = app.stopExporting ? 'Fretboard-MIDI-partial.zip' : 'Fretboard-All-Keys-MIDI.zip';
            link.rel = 'noopener';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            report('Downloaded ' + exported + ' individual MIDI diagrams, the compiled MIDI, and a README.');
        } catch (error) {
            report(error.message || 'Could not create the Fretboard MIDI ZIP.');
            throw error;
        }
    };

    App.prototype.exportAll = async function() {
        if (this.slideshowItems.length === 0) {
            alert('No items to export');
            return;
        }
        
        const exportBtn = document.getElementById('export-all');
        const originalText = exportBtn.innerHTML;
        const originalWidth = exportBtn.style.width;
        const theoryPanel = document.getElementById('theory-info-panel');
        const prevPanelDisplay = theoryPanel ? theoryPanel.style.display : '';
        exportBtn.style.width = 'auto';
        exportBtn.textContent = 'Exporting...';
        exportBtn.disabled = true;
        
        const stopExportBtn = document.createElement('button');
        stopExportBtn.textContent = 'Stop Exporting';
        stopExportBtn.style.backgroundColor = '#e74c3c';
        stopExportBtn.style.marginLeft = '10px';
        stopExportBtn.addEventListener('click', () => {
            this.stopExporting = true;
            stopExportBtn.disabled = true;
            stopExportBtn.textContent = 'Stopping...';
        });
        exportBtn.insertAdjacentElement('afterend', stopExportBtn);
        
        this.stopExporting = false;
        
        let i = 0;
        try {
        for (i = 0; i < this.slideshowItems.length; i++) {
            if (this.stopExporting) break;
            
            const item = this.slideshowItems[i];
            exportBtn.textContent = `Exporting ${i+1}/${this.slideshowItems.length}...`;
            
            this.fretboard.updatePattern(item.info.key, item.info.patternType, item.info.pattern);
            this.updateTheoryInfo(item.info.key, item.info.patternType, item.info.pattern);
            
            const filename = this.customFilename ? `${i+1}_${this.customFilename}` : item.filename;
            await this.fretboard.exportImage(filename);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        } finally {
            try { this.updateFretboard(); } catch (error) { console.warn('Could not restore the current fretboard:', error); }
            if (theoryPanel) theoryPanel.style.display = prevPanelDisplay;
            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            exportBtn.innerHTML = originalText;
            exportBtn.style.width = originalWidth;
            exportBtn.disabled = false;
        }
        
        if (this.stopExporting) alert(`Export stopped after ${i} diagrams`);
        else alert(`Exported ${this.slideshowItems.length} diagrams`);
    };

    App.prototype.exportAllDiagramsOnly = async function() {
        if (this.slideshowItems.length === 0) {
            alert('No items to export');
            return;
        }
        
        const exportBtn = document.getElementById('export-diagrams-only');
        const originalText = exportBtn.innerHTML;
        const originalWidth = exportBtn.style.width;
        exportBtn.style.width = 'auto';
        exportBtn.textContent = 'Exporting...';
        exportBtn.disabled = true;
        
        const stopExportBtn = document.createElement('button');
        stopExportBtn.textContent = 'Stop Exporting';
        stopExportBtn.style.backgroundColor = '#e74c3c';
        stopExportBtn.style.marginLeft = '10px';
        stopExportBtn.addEventListener('click', () => {
            this.stopExporting = true;
            stopExportBtn.disabled = true;
            stopExportBtn.textContent = 'Stopping...';
        });
        exportBtn.insertAdjacentElement('afterend', stopExportBtn);
        
        this.stopExporting = false;
        
        const theoryPanel = document.getElementById('theory-info-panel');
        const prevPanelDisplay = theoryPanel ? theoryPanel.style.display : '';
        if (theoryPanel) theoryPanel.style.display = 'none';
        
        let i = 0;
        try {
        for (i = 0; i < this.slideshowItems.length; i++) {
            if (this.stopExporting) break;
            
            const item = this.slideshowItems[i];
            exportBtn.textContent = `Exporting ${i+1}/${this.slideshowItems.length}...`;
            
            this.fretboard.updatePattern(item.info.key, item.info.patternType, item.info.pattern);
            
            const filename = this.customFilename ? `${i+1}_diagram_${this.customFilename}` : `diagram_${item.filename}`;
            await this.fretboard.exportImage(filename);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        } finally {
            try { this.updateFretboard(); } catch (error) { console.warn('Could not restore the current fretboard:', error); }
            if (theoryPanel) theoryPanel.style.display = prevPanelDisplay;
            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            exportBtn.innerHTML = originalText;
            exportBtn.style.width = originalWidth;
            exportBtn.disabled = false;
        }
        
        if (this.stopExporting) alert(`Export stopped after ${i} diagrams`);
        else alert(`Exported ${this.slideshowItems.length} diagrams without theory info`);
    };

    App.prototype.setCustomFilename = function() {
        const filename = prompt('Enter custom filename for exports (without extension):', this.customFilename || '');
        if (filename !== null) {
            this.customFilename = filename.trim();
            const label = document.getElementById('current-custom-filename');
            if (label) {
                label.textContent = this.customFilename ? `Prefix: ${this.customFilename}` : '';
            }
            alert(`Filename set to: ${this.customFilename || 'Default'}`);
        }
    };
}