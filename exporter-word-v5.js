/**
 * Word Document Exporter (V5)
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllSlideshowToWordV5 = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        if (!app.slideshowItems || app.slideshowItems.length === 0) {
            alert("Your slideshow is empty. Add some patterns first.");
            return;
        }

        const fretspanSelect = document.getElementById('fretspan-presets');
        if (!fretspanSelect) {
            alert("Fretspan presets not found.");
            return;
        }

        const allPresets = Array.from(fretspanSelect.options).filter(opt => !opt.disabled && opt.value !== 'custom-none');

        if (!confirm(`Export V5: This will generate a document for ${app.slideshowItems.length} slideshow patterns, with ${allPresets.length} fretboard views for EACH pattern. Proceed?`)) {
            return;
        }

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
        const btn = document.getElementById('save-all-slideshow-word-v5');
        const originalText = btn ? btn.textContent : 'Exporting...';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Initializing V5 Slideshow Export...';
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
            children: [new TextRun({ text: "Scales Thesaurus - V5", bold: true, size: 72 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 }
        }));
        docSections.push(new Paragraph({
            children: [new TextRun({ text: "Slideshow Export with Full Fretboard Preset Arrays", size: 36 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));

        docSections.push(new Paragraph({
            text: "Slideshow Contents", heading: docx.HeadingLevel.HEADING_1, pageBreakBefore: true
        }));
        app.slideshowItems.forEach((item, idx) => {
            docSections.push(new Paragraph({ children: [new TextRun({ text: `${idx + 1}. ${item.info.key} ${item.info.patternType} ${item.info.pattern}`, bold: true })] }));
        });

        try {
            for (let i = 0; i < app.slideshowItems.length; i++) {
                if (app.stopExporting) break;
                
                const item = app.slideshowItems[i];
                const key = item.info.key;
                const type = item.info.patternType;
                const patternId = item.info.pattern;
                
                let patternName = patternId;
                if (type === 'scale') patternName = app.musicTheory.scales[patternId]?.name || patternId;
                else if (type === 'chord') patternName = app.musicTheory.chords[patternId]?.name || patternId;
                else if (type === 'interval') patternName = app.musicTheory.intervals[patternId]?.name || patternId;
                else if (type === 'lesson') patternName = app.lessons[patternId]?.title || `Lesson ${patternId}`;

                docSections.push(new Paragraph({
                    children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `Slide ${i+1}: ${key} ${patternName}`, bold: true, size: 32 })],
                    spacing: { before: 400, after: 200 },
                    pageBreakBefore: true
                }));

                for (const presetOption of allPresets) {
                    if (app.stopExporting) break;

                    if (btn) btn.textContent = `V5 Slide ${i+1}/${app.slideshowItems.length}: ${presetOption.text}...`;

                    document.getElementById('key-select').value = key;
                    document.getElementById('pattern-type').value = type;
                    if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect();
                    
                    const patSel = document.getElementById('pattern-select');
                    if (patSel) patSel.value = patternId;

                    fretspanSelect.value = presetOption.value;
                    if (app.applyFretspanPreset) {
                        app.applyFretspanPreset(presetOption.value);
                    }

                    const simpleInfoPill = document.getElementById('export-simple-info-pill');
                    const origPillChecked = simpleInfoPill ? simpleInfoPill.checked : false;
                    if (simpleInfoPill) simpleInfoPill.checked = true;

                    await new Promise(resolve => requestAnimationFrame(resolve));
                    
                    const base64 = await Exporter.getFretboardImageBase64(app);
                    if (simpleInfoPill) simpleInfoPill.checked = origPillChecked;

                    const binaryString = window.atob(base64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let j = 0; j < binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);

                    docSections.push(new Paragraph({
                        children: [new TextRun({ text: `View: ${presetOption.text}`, size: 18, italics: true, color: "555555" })],
                        spacing: { before: 100 }
                    }));

                    docSections.push(new Paragraph({
                        children: [
                            new ImageRun({
                                data: bytes,
                                transformation: { width: 600, height: 150 }
                            })
                        ],
                        spacing: { after: 100 }
                    }));

                    imageCount++;
                    if (imageCount % 8 === 0) await new Promise(r => setTimeout(r, 0));
                }
            }
            
            if (!app.stopExporting) {
                if (btn) btn.textContent = 'Finalizing Document...';
                const doc = new Document({ sections: [{ properties: {}, children: docSections }] });
                const blob = await Packer.toBlob(doc);
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `Slideshow_Full_Presets_V5.docx`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error generating V5 document:', error);
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
                sInputs.forEach((inp, idx) => { if(backupState.starts[idx] !== undefined) inp.value = backupState.starts[idx]; });
                eInputs.forEach((inp, idx) => { if(backupState.ends[idx] !== undefined) inp.value = backupState.ends[idx]; });
                showBoxes.forEach((cb, idx) => { if(backupState.show[idx] !== undefined) cb.checked = backupState.show[idx]; });
                if (typeof app.updateFretboard === 'function') app.updateFretboard();
            } catch (e) { console.warn('Restore failed:', e); }

            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            if (!app.stopExporting) alert(`Exported V5 with ${imageCount} diagrams.`);
        }
    };
}