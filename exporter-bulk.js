if (typeof Exporter !== 'undefined') {
    Exporter.exportAllPatternsForAllStringCountsToZip = async function(app, patternType, zipFilenameBase) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }

        let btnId, patternsObject, patternTypeNameForFile;

        switch (patternType) {
            case 'scale':
                btnId = 'save-scales-all-strings-zip';
                patternsObject = app.musicTheory.scales;
                patternTypeNameForFile = 'scale';
                break;
            case 'chord':
                btnId = 'save-chords-all-strings-zip';
                patternsObject = app.musicTheory.chords;
                patternTypeNameForFile = 'chord';
                break;
            case 'interval':
                btnId = 'save-intervals-all-strings-zip';
                patternsObject = app.musicTheory.intervals;
                patternTypeNameForFile = 'interval';
                break;
            default:
                alert('Invalid pattern type for export.');
                return;
        }

        const maxStringCount = parseInt(document.getElementById('string-count').max) || 8;
        const keys = app.musicTheory.notes;
        const patternEntries = Object.entries(patternsObject);
        app.stopExporting = false;

        const btn = document.getElementById(btnId);
        const originalText = btn.textContent;
        btn.textContent = 'Preparing Export...';

        const stopExportBtn = document.createElement('button');
        stopExportBtn.textContent = 'Stop Exporting';
        stopExportBtn.style.backgroundColor = '#e74c3c';
        stopExportBtn.style.marginLeft = '10px';
        stopExportBtn.addEventListener('click', () => {
            app.stopExporting = true;
            stopExportBtn.disabled = true;
            stopExportBtn.textContent = 'Stopping...';
        });
        
        if (btn.parentNode) {
            btn.parentNode.insertBefore(stopExportBtn, btn.nextSibling);
        }

        const zip = new JSZip();
        let imageCount = 0;
        const totalOperations = maxStringCount * keys.length * patternEntries.length;
        let currentOperation = 0;

        const originalFretboardSettings = { ...app.fretboard.settings };
        const originalStringCount = parseInt(document.getElementById('string-count').value);
        const originalTuningInputs = app.getCurrentTuning();

        try {
            for (let sc = 1; sc <= maxStringCount; sc++) {
                if (app.stopExporting) break;
                const stringCountFolder = zip.folder(`${sc}-strings`);
                const defaultTuningForSc = app.musicTheory.getDefaultTuning(sc).reverse();

                const tempSettings = { ...app.fretboard.settings, tuning: defaultTuningForSc };
                app.fretboard.updateSettings(tempSettings);

                for (const key of keys) {
                    if (app.stopExporting) break;
                    const keyFolder = stringCountFolder.folder(key.replace('#', 'sharp'));

                    for (const [patternId, patternData] of patternEntries) {
                        if (app.stopExporting) break;
                        currentOperation++;
                        btn.textContent = `Processing ${sc}-str, ${key}, ${patternData.name} (${currentOperation}/${totalOperations})`;

                        app.fretboard.updatePattern(key, patternType, patternId);
                        
                        if (imageCount % 15 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 0));
                        }

                        const imageData = await Exporter.getFretboardImageBase64(app);

                        const safeKey = key.replace('#', 'sharp');
                        const safePatternName = patternData.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
                        const filename = `${patternTypeNameForFile}_${sc}-strings_${safeKey}_${safePatternName}.jpg`;
                        
                        keyFolder.file(filename, imageData, {base64: true});
                        imageCount++;
                    }
                }
            }
        } catch (error) {
            console.error(`Error creating ${patternType} ZIP file:`, error);
            alert(`Error creating ${patternType} ZIP file: ${error.message}`);
        } finally {
            document.getElementById('string-count').value = originalStringCount;
            app.updateTuningInputs(originalTuningInputs);
            app.fretboard.updateSettings(originalFretboardSettings);
            app.updateFretboard();

            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            btn.disabled = false;
            btn.textContent = originalText;
            
            if (app.stopExporting) {
                alert(`Export stopped after ${imageCount} diagrams.`);
            } else {
                alert(`Successfully exported ${imageCount} ${patternType} diagrams to ZIP file`);
            }
        }
    };

    Exporter.exportAllCombinedToZip = async function(app) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }

        const originalStringCount = parseInt(document.getElementById('string-count').value);
        const originalTuningInputs = app.getCurrentTuning ? app.getCurrentTuning() : null;

        app.stopExporting = false;

        const btn = document.getElementById('save-all-combined-zip');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Preparing Export...';

        const stopExportBtn = document.createElement('button');
        stopExportBtn.textContent = 'Stop Exporting';
        stopExportBtn.style.backgroundColor = '#e74c3c';
        stopExportBtn.style.marginLeft = '10px';
        stopExportBtn.addEventListener('click', () => {
            app.stopExporting = true;
            stopExportBtn.disabled = true;
            stopExportBtn.textContent = 'Stopping...';
        });
        
        if (btn.parentNode) {
            btn.parentNode.insertBefore(stopExportBtn, btn.nextSibling);
        }

        const zip = new JSZip();
        let imageCount = 0;
        
        const categories = [
            { type: 'interval', name: 'Intervals', data: app.musicTheory.intervals },
            { type: 'chord', name: 'Chords', data: app.musicTheory.chords },
            { type: 'scale', name: 'Scales', data: app.musicTheory.scales }
        ];
        
        const keys = app.musicTheory.notes;

        try {
            for (const cat of categories) {
                if (app.stopExporting) break;
                const catFolder = zip.folder(cat.name);
                
                for (const key of keys) {
                    if (app.stopExporting) break;
                    const safeKey = key.replace('#', 'sharp');
                    const keyFolder = catFolder.folder(safeKey);
                    
                    const entries = Object.entries(cat.data);
                    for (const [patternId, patternData] of entries) {
                        if (app.stopExporting) break;
                        
                        btn.textContent = `Processing ${cat.name}: ${key} ${patternData.name || patternId}...`;
                        
                        app.fretboard.updatePattern(key, cat.type, patternId);
                        
                        // Yield occasionally to keep UI responsive
                        if (imageCount % 12 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 0));
                        } else {
                            await new Promise(resolve => requestAnimationFrame(resolve));
                        }

                        const imageData = await Exporter.getFretboardImageBase64(app);
                        
                        const displayMode = app.fretboard.settings.displayMode || 'intervals';
                        const fretspanValue = document.getElementById('fretspan-presets')?.value || 'default';
                        const safeFretspan = fretspanValue.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                        
                        let safePatternName = (patternData.name || patternId).replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                        let filename = '';
                        
                        if (cat.type === 'interval') {
                            const safeInterval = patternId.replace('#', 'sharp');
                            filename = `interval_${safeKey}_${safeInterval}_${safePatternName}_${displayMode}_${safeFretspan}.jpg`;
                        } else {
                            filename = `${cat.type}_${safeKey}_${safePatternName}_${displayMode}_${safeFretspan}.jpg`;
                        }
                        
                        keyFolder.file(filename, imageData, {base64: true});
                        imageCount++;
                    }
                }
            }
            
            if (!app.stopExporting) {
                btn.textContent = 'Generating ZIP file...';
                const zipBlob = await zip.generateAsync({type: 'blob'});
                const zipUrl = URL.createObjectURL(zipBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = zipUrl;
                downloadLink.download = `all_intervals_chords_scales_${originalStringCount}-strings.zip`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(zipUrl);
            }
        } catch (error) {
            console.error('Error creating combined ZIP file:', error);
            alert(`Error creating combined ZIP file: ${error.message}`);
        } finally {
            try {
                if (originalTuningInputs && typeof app.updateTuningInputs === 'function') {
                    document.getElementById('string-count').value = originalStringCount;
                    app.updateTuningInputs(originalTuningInputs);
                    app.updateFretboard && app.updateFretboard();
                }
            } catch (e) {
                console.warn('Failed to restore tuning after export:', e);
            }

            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            btn.disabled = false;
            btn.textContent = originalText;
            
            if (app.stopExporting) {
                alert(`Export stopped after ${imageCount} diagrams.`);
            } else {
                alert(`Successfully exported ${imageCount} diagrams to ZIP file.`);
            }
        }
    };

    // removed Exporter.exportAllCombinedToWordV2 -> moved to exporter-word-v2.js

    // removed Exporter.exportAllCombinedToWord -> moved to exporter-word-v1.js

    // removed Exporter.exportAllCombinedToWordV3 -> moved to exporter-word-v3.js


    /**
     * Export every pattern (intervals, chords, scales) pattern-by-pattern across ALL keys
     * following the Circle of Fifths order, packaged into a Word document.
     */
    Exporter.exportAllPatternsCircleOfFifthsToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }
        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const btn = document.getElementById('save-all-patterns-circle-word');
        const origText = btn ? btn.textContent : 'Exporting...';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparing Circle export...'; }

        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Exporting';
        stopBtn.style.backgroundColor = '#e74c3c';
        stopBtn.style.marginLeft = '10px';
        if (btn && btn.parentNode) btn.parentNode.insertBefore(stopBtn, btn.nextSibling);
        let imageCount = 0;
        app.stopExporting = false;
        stopBtn.addEventListener('click', () => { app.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });

        try {
            const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
            const categories = [
                { type: 'interval', name: 'Intervals', data: app.musicTheory.intervals },
                { type: 'chord', name: 'Chords', data: app.musicTheory.chords },
                { type: 'scale', name: 'Scales', data: app.musicTheory.scales }
            ];

            const docChildren = [];
            docChildren.push(new Paragraph({ children: [new TextRun({ text: 'Scales Thesaurus — Circle of Fifths Pattern-by-Pattern', bold: true, size: 48 })], alignment: AlignmentType.CENTER, spacing: { before: 2000, after: 400 } }));

            for (const cat of categories) {
                if (app.stopExporting) break;
                docChildren.push(new Paragraph({ children: [new TextRun({ text: cat.name, bold: true, size: 36 })], spacing: { before: 400, after: 200 } }));

                for (const [patternId, patternData] of Object.entries(cat.data)) {
                    if (app.stopExporting) break;

                    const patternName = patternData.name || patternId;
                    docChildren.push(new Paragraph({ children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${cat.name} — ${patternName}`, bold: true, size: 28 })], spacing: { before: 300, after: 120 } }));

                    for (const key of cof) {
                        if (app.stopExporting) break;
                        if (btn) btn.textContent = `Rendering ${patternName} — ${key}...`;

                        // Ensure UI selects reflect choice so updateFretboard uses consistent state
                        try {
                            document.getElementById('key-select').value = key;
                            document.getElementById('pattern-type').value = cat.type;
                            if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect();
                            const ps = document.getElementById('pattern-select');
                            if (ps && Array.from(ps.options).some(o=>o.value==patternId)) ps.value = patternId;
                        } catch (e) {}

                        // Update fretboard to render current view
                        if (app.fretboard && typeof app.fretboard.updatePattern === 'function') {
                            app.fretboard.updatePattern(key, cat.type, patternId);
                        }

                        // Allow DOM to settle
                        await new Promise(r => requestAnimationFrame(r));

                        const base64 = await Exporter.getFretboardImageBase64(app);
                        const binaryString = window.atob(base64);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

                        docChildren.push(new Paragraph({ children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `Key: ${key}`, italics: true, size: 18 })], spacing: { before: 80, after: 40 } }));
                        docChildren.push(new Paragraph({ children: [ new ImageRun({ data: bytes, transformation: { width: 600, height: 150 } }) ], spacing: { after: 100 } }));

                        imageCount++;
                        if (imageCount % 10 === 0) await new Promise(r => setTimeout(r, 0));
                    }
                }
            }

            if (!app.stopExporting) {
                const doc = new Document({ sections: [{ properties: {}, children: docChildren }]});
                const blob = await Packer.toBlob(doc);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `patterns_circle_of_fifths.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Circle export failed:', err);
            alert('Export failed: ' + (err && err.message ? err.message : err));
        } finally {
            if (stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
            if (btn) { btn.disabled = false; btn.textContent = origText; }
            if (app.stopExporting) alert(`Export stopped after ${imageCount} images.`); else alert(`Exported ${imageCount} images to Word document.`);
        }
    };

}