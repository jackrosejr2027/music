/**
 * Word Document Exporter (V2)
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllCombinedToWordV2 = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const keyChoice = prompt("Export for:\n1: Current Key\n2: Select Key(s)\n3: All Keys", "1");
        if (!keyChoice) return;
        
        let keysToExport = [];
        if (keyChoice === "1") {
            keysToExport = [app.fretboard.currentKey || 'C'];
        } else if (keyChoice === "2") {
            const keysInput = prompt("Enter keys separated by commas (e.g., C, G, D):", app.fretboard.currentKey || 'C');
            if (!keysInput) return;
            keysToExport = keysInput.split(',').map(k => k.trim()).filter(k => app.musicTheory.notes.includes(k));
            if (keysToExport.length === 0) {
                alert("No valid keys selected.");
                return;
            }
        } else if (keyChoice === "3") {
            keysToExport = app.musicTheory.notes;
        } else {
            alert("Invalid choice.");
            return;
        }

        const { Document, Packer, Paragraph, TextRun, ImageRun } = docx;
        
        const originalStringCount = parseInt(document.getElementById('string-count').value);
        const originalTuningInputs = app.getCurrentTuning ? app.getCurrentTuning() : null;

        // Save original per-string frets
        const origStarts = Array.from(document.querySelectorAll('.string-start-fret')).map(i => i.value);
        const origEnds = Array.from(document.querySelectorAll('.string-end-fret')).map(i => i.value);
        const origShow = Array.from(document.querySelectorAll('.show-string-notes')).map(i => i.checked);
        const origGlobalStart = document.getElementById('start-fret').value;
        const origGlobalEnd = document.getElementById('end-fret').value;

        app.stopExporting = false;

        const btn = document.getElementById('save-all-combined-word-v2');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Preparing Word Document...';

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

        let imageCount = 0;
        
        const categories = [
            { type: 'interval', name: 'Intervals', data: app.musicTheory.intervals },
            { type: 'chord', name: 'Chords', data: app.musicTheory.chords },
            { type: 'scale', name: 'Scales', data: app.musicTheory.scales }
        ];
        
        const docSections = [];

        try {
            for (const cat of categories) {
                if (app.stopExporting) break;
                
                docSections.push(new Paragraph({
                    children: [
                        new TextRun({ text: cat.name, bold: true, size: 48 })
                    ],
                    spacing: { before: 400, after: 200 }
                }));

                for (const key of keysToExport) {
                    if (app.stopExporting) break;
                    
                    docSections.push(new Paragraph({
                        children: [
                            new TextRun({ text: Exporter.includeTitles === false ? '' : `Key of ${key}`, bold: true, size: 36 })
                        ],
                        spacing: { before: 300, after: 100 }
                    }));
                    
                    const entries = Object.entries(cat.data);
                    for (const [patternId, patternData] of entries) {
                        if (app.stopExporting) break;
                        
                        btn.textContent = `Processing ${cat.name}: ${key} ${patternData.name || patternId}...`;
                        
                        // Force simple text labels to ensure scale/chord names are included simply
                        const simpleInfoPill = document.getElementById('export-simple-info-pill');
                        const origPillChecked = simpleInfoPill ? simpleInfoPill.checked : false;
                        if (simpleInfoPill) simpleInfoPill.checked = true;

                        // --- Image 1: Open 4 fret span ---
                        document.getElementById('start-fret').value = 0;
                        document.getElementById('end-fret').value = 12;
                        if (app.applyFretspanPreset) {
                            app.applyFretspanPreset('open-4-fretspan');
                        }
                        
                        // Apply pattern AFTER fretspan presets, because presets trigger updateFretboard() which reads from DOM
                        app.fretboard.updatePattern(key, cat.type, patternId);
                        
                        if (imageCount % 12 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 0));
                        } else {
                            await new Promise(resolve => requestAnimationFrame(resolve));
                        }

                        const imageDataBase64_1 = await Exporter.getFretboardImageBase64(app);
                        
                        // --- Image 2: Default 12 fret span ---
                        document.getElementById('start-fret').value = 0;
                        document.getElementById('end-fret').value = 12;
                        if (app.applyStartEndArray) {
                            app.applyStartEndArray([]);
                        }
                        
                        // Apply pattern AGAIN to override the UI state read by applyStartEndArray
                        app.fretboard.updatePattern(key, cat.type, patternId);
                        
                        await new Promise(resolve => requestAnimationFrame(resolve));
                        
                        const imageDataBase64_2 = await Exporter.getFretboardImageBase64(app);
                        
                        if (simpleInfoPill) simpleInfoPill.checked = origPillChecked;

                        // Add to document
                        const patternName = patternData.name || patternId;
                        
                        docSections.push(new Paragraph({
                            children: [
                                new TextRun({ text: Exporter.includeTitles === false ? '' : `${key} - ${patternName}`, bold: true, size: 28 })
                            ],
                            spacing: { before: 200, after: 100 }
                        }));
                        
                        const base64ToBytes = (base64) => {
                            const binaryString = window.atob(base64);
                            const len = binaryString.length;
                            const bytes = new Uint8Array(len);
                            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
                            return bytes;
                        };
                        
                        docSections.push(new Paragraph({
                            children: [
                                new ImageRun({
                                    data: base64ToBytes(imageDataBase64_1),
                                    transformation: { width: 600, height: 150 }
                                })
                            ]
                        }));
                        
                        docSections.push(new Paragraph({
                            children: [
                                new ImageRun({
                                    data: base64ToBytes(imageDataBase64_2),
                                    transformation: { width: 600, height: 150 }
                                })
                            ],
                            spacing: { before: 100, after: 100 }
                        }));

                        imageCount += 2;
                    }
                }
            }
            
            if (!app.stopExporting) {
                btn.textContent = 'Generating Word Document...';
                
                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: docSections
                    }]
                });
                
                const blob = await Packer.toBlob(doc);
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
                downloadLink.download = `all_patterns_v2_${originalStringCount}-strings_${dateStr}.docx`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error creating Word document:', error);
            alert(`Error creating Word document: ${error.message}`);
        } finally {
            try {
                if (originalTuningInputs && typeof app.updateTuningInputs === 'function') {
                    document.getElementById('string-count').value = originalStringCount;
                    app.updateTuningInputs(originalTuningInputs);
                    
                    document.getElementById('start-fret').value = origGlobalStart;
                    document.getElementById('end-fret').value = origGlobalEnd;

                    const sInputs = document.querySelectorAll('.string-start-fret');
                    const eInputs = document.querySelectorAll('.string-end-fret');
                    const showBoxes = document.querySelectorAll('.show-string-notes');
                    
                    for (let i = 0; i < sInputs.length; i++) {
                        if (origStarts[i] !== undefined) sInputs[i].value = origStarts[i];
                        if (origEnds[i] !== undefined) eInputs[i].value = origEnds[i];
                        if (origShow[i] !== undefined) showBoxes[i].checked = origShow[i];
                    }
                    
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
                alert(`Successfully exported ${imageCount} diagrams to Word document.`);
            }
        }
    };
}