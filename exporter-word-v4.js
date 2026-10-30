/**
 * Word Document Exporter (V4)
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllCombinedToWordV4 = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const fretspanSelect = document.getElementById('fretspan-presets');
        if (!fretspanSelect) {
            alert("Fretspan presets not found.");
            return;
        }

        const allPresets = Array.from(fretspanSelect.options).filter(opt => !opt.disabled && opt.value !== 'custom-none');

        const keyChoice = prompt(`Export V4 (All Spans - ${allPresets.length} images per pattern)\n1: Current Key\n2: Select Key(s)\n3: All Keys`, "1");
        if (!keyChoice) return;
        
        let keysToExport = [];
        if (keyChoice === "1") {
            keysToExport = [app.fretboard.currentKey || 'C'];
        } else if (keyChoice === "2") {
            const keysInput = prompt("Enter keys separated by commas:", app.fretboard.currentKey || 'C');
            if (!keysInput) return;
            keysToExport = keysInput.split(',').map(k => k.trim()).filter(k => app.musicTheory.notes.includes(k));
        } else if (keyChoice === "3") {
            keysToExport = app.musicTheory.notes;
        } else return;

        if (keysToExport.length === 0) return;

        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const originalStringCount = parseInt(document.getElementById('string-count').value);
        const originalTuningInputs = app.getCurrentTuning ? app.getCurrentTuning() : null;

        const backupState = {
            stringCount: document.getElementById('string-count').value,
            globalStart: document.getElementById('start-fret').value,
            globalEnd: document.getElementById('end-fret').value,
            preset: fretspanSelect.value,
            starts: Array.from(document.querySelectorAll('.string-start-fret')).map(i => i.value),
            ends: Array.from(document.querySelectorAll('.string-end-fret')).map(i => i.value),
            show: Array.from(document.querySelectorAll('.show-string-notes')).map(i => i.checked)
        };

        app.stopExporting = false;
        const btn = document.getElementById('save-all-combined-word-v4');
        const originalText = btn ? btn.textContent : 'Exporting...';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Initializing V4 Export...';
        }

        const stopExportBtn = document.createElement('button');
        stopExportBtn.textContent = 'Stop Exporting';
        stopExportBtn.style.backgroundColor = '#e74c3c';
        stopExportBtn.style.marginLeft = '10px';
        stopExportBtn.addEventListener('click', () => {
            app.stopExporting = true;
            stopExportBtn.disabled = true;
            stopExportBtn.textContent = 'Stopping...';
        });
        if (btn && btn.parentNode) btn.parentNode.insertBefore(stopExportBtn, btn.nextSibling);

        const docSections = [];
        let imageCount = 0;

        docSections.push(new Paragraph({
            children: [new TextRun({ text: "Scales Thesaurus - V4", bold: true, size: 72 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 }
        }));
        docSections.push(new Paragraph({
            children: [new TextRun({ text: "Comprehensive Library with All Fretboard Span Presets", size: 36 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));

        docSections.push(new Paragraph({
            text: "Table of Contents", heading: docx.HeadingLevel.HEADING_1, pageBreakBefore: true
        }));
        keysToExport.forEach(k => {
            docSections.push(new Paragraph({ children: [new TextRun({ text: `• Key of ${k}`, bold: true })] }));
        });
        docSections.push(new Paragraph({ text: `Each pattern will display ${allPresets.length} different fretboard views (presets).`, spacing: { before: 200 } }));

        const categories = [
            { type: 'interval', name: 'Intervals', data: app.musicTheory.intervals },
            { type: 'chord', name: 'Chords', data: app.musicTheory.chords },
            { type: 'scale', name: 'Scales', data: app.musicTheory.scales }
        ];

        try {
            for (const cat of categories) {
                if (app.stopExporting) break;
                
                docSections.push(new Paragraph({
                    text: cat.name, heading: docx.HeadingLevel.HEADING_1, pageBreakBefore: true
                }));

                for (const key of keysToExport) {
                    if (app.stopExporting) break;
                    
                    docSections.push(new Paragraph({
                        text: Exporter.includeTitles === false ? '' : `Key of ${key}`, heading: docx.HeadingLevel.HEADING_2, spacing: { before: 200 }
                    }));
                    
                    for (const [patternId, patternData] of Object.entries(cat.data)) {
                        if (app.stopExporting) break;
                        const patternName = patternData.name || patternId;
                        
                        if (btn) btn.textContent = `V4: ${key} ${patternName} (${imageCount} images)...`;

                        docSections.push(new Paragraph({
                            children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${key} ${patternName}`, bold: true, size: 28 })],
                            spacing: { before: 300, after: 100 }
                        }));

                        for (const presetOption of allPresets) {
                            if (app.stopExporting) break;

                            document.getElementById('key-select').value = key;
                            document.getElementById('pattern-type').value = cat.type;
                            if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect();
                            
                            const patSel = document.getElementById('pattern-select');
                            if (patSel) patSel.value = patternId;

                            const simpleInfoPill = document.getElementById('export-simple-info-pill');
                            const origPillChecked = simpleInfoPill ? simpleInfoPill.checked : false;
                            if (simpleInfoPill) simpleInfoPill.checked = true;

                            fretspanSelect.value = presetOption.value;
                            if (app.applyFretspanPreset) {
                                app.applyFretspanPreset(presetOption.value);
                            }

                            await new Promise(resolve => requestAnimationFrame(resolve));
                            
                            const base64 = await Exporter.getFretboardImageBase64(app);
                            const binaryString = window.atob(base64);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

                            docSections.push(new Paragraph({
                                children: [
                                    new TextRun({ text: `Preset: ${presetOption.text}`, size: 18, color: "666666" })
                                ],
                                spacing: { before: 100 }
                            }));

                            docSections.push(new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: bytes,
                                        transformation: { width: 600, height: 150 }
                                    })
                                ]
                            }));

                            imageCount++;
                            if (imageCount % 10 === 0) await new Promise(r => setTimeout(r, 0));
                        }
                    }
                }
            }
            
            if (!app.stopExporting) {
                if (btn) btn.textContent = 'Packaging Document...';
                const doc = new Document({ sections: [{ properties: {}, children: docSections }] });
                const blob = await Packer.toBlob(doc);
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `Scales_Thesaurus_V4_${keysToExport.join('_')}.docx`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error generating V4 document:', error);
            alert(`Error generating document: ${error.message}`);
        } finally {
            try {
                document.getElementById('string-count').value = backupState.stringCount;
                if (originalTuningInputs) app.updateTuningInputs(originalTuningInputs);
                document.getElementById('start-fret').value = backupState.globalStart;
                document.getElementById('end-fret').value = backupState.globalEnd;
                fretspanSelect.value = backupState.preset;
                const sInputs = document.querySelectorAll('.string-start-fret');
                const eInputs = document.querySelectorAll('.string-end-fret');
                const showBoxes = document.querySelectorAll('.show-string-notes');
                sInputs.forEach((inp, idx) => inp.value = backupState.starts[idx]);
                eInputs.forEach((inp, idx) => inp.value = backupState.ends[idx]);
                showBoxes.forEach((cb, idx) => cb.checked = backupState.show[idx]);
                if (typeof app.updateFretboard === 'function') app.updateFretboard();
            } catch (e) { console.warn('Restore failed:', e); }

            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            if (!app.stopExporting) alert(`Exported V4 with ${imageCount} diagrams.`);
        }
    };
}