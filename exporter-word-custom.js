/**
 * Word Document Exporter (Custom Patterns)
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllCustomToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const customPatterns = app.musicTheory.customPatterns || {};
        if (Object.keys(customPatterns).length === 0) {
            alert('No custom patterns found. Please create or import some first.');
            return;
        }

        const keyChoice = prompt("Export Custom Patterns for:\n1: Current Key\n2: Select Key(s)\n3: All Keys", "1");
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

        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const originalStringCount = parseInt(document.getElementById('string-count').value);
        const originalTuningInputs = app.getCurrentTuning ? app.getCurrentTuning() : null;

        app.stopExporting = false;

        const btn = document.getElementById('save-all-custom-word');
        const originalText = btn ? btn.textContent : 'Export Custom to Word';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Preparing Word Document...';
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
        
        if (btn && btn.parentNode) {
            btn.parentNode.insertBefore(stopExportBtn, btn.nextSibling);
        }

        let imageCount = 0;
        const docSections = [];

        docSections.push(new Paragraph({
            children: [new TextRun({ text: "Custom Patterns Library", bold: true, size: 72 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 }
        }));

        try {
            for (const key of keysToExport) {
                if (app.stopExporting) break;
                
                docSections.push(new Paragraph({
                    children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `Key of ${key}`, bold: true, size: 36 })],
                    spacing: { before: 300, after: 100 }
                }));
                
                for (const [patternId, patternData] of Object.entries(customPatterns)) {
                    if (app.stopExporting) break;
                    
                    const patternName = patternData.name || patternId;
                    if (btn) btn.textContent = `Processing Custom: ${key} ${patternName}...`;
                    
                    const simpleInfoPill = document.getElementById('export-simple-info-pill');
                    const origPillChecked = simpleInfoPill ? simpleInfoPill.checked : false;
                    if (simpleInfoPill) simpleInfoPill.checked = true;

                    app.fretboard.updatePattern(key, 'custom', patternId);
                    
                    if (imageCount % 12 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    } else {
                        await new Promise(resolve => requestAnimationFrame(resolve));
                    }

                    const imageDataBase64 = await Exporter.getFretboardImageBase64(app);
                    
                    if (simpleInfoPill) simpleInfoPill.checked = origPillChecked;

                    docSections.push(new Paragraph({
                        children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${key} - ${patternName}`, bold: true, size: 28 })],
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
                                data: base64ToBytes(imageDataBase64),
                                transformation: { width: 600, height: 150 }
                            })
                        ],
                        spacing: { after: 100 }
                    }));

                    imageCount++;
                }
            }
            
            if (!app.stopExporting) {
                if (btn) btn.textContent = 'Generating Word Document...';
                
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
                downloadLink.download = `custom_patterns_${originalStringCount}-strings_${dateStr}.docx`;
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
                    if (typeof app.updateFretboard === 'function') app.updateFretboard();
                }
            } catch (e) {
                console.warn('Failed to restore tuning after export:', e);
            }

            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            
            if (app.stopExporting) {
                alert(`Export stopped after ${imageCount} diagrams.`);
            } else {
                alert(`Successfully exported ${imageCount} custom diagrams to Word document.`);
            }
        }
    };
}

/* NEW: Export custom patterns, iterating pattern-by-pattern and moving through Circle of Fifths for each pattern */
Exporter.exportAllCustomCircleOfFifthsToWord = async function(app) {
    if (typeof docx === 'undefined') {
        alert('docx library is not loaded. Cannot create Word document.');
        return;
    }

    const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
    const btn = document.getElementById('save-custom-patterns-circle-word');
    const originalText = btn ? btn.textContent : 'Exporting...';
    if (btn) { btn.disabled = true; btn.textContent = 'Preparing Custom Patterns (CoF)...'; }

    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop Exporting';
    stopBtn.style.backgroundColor = '#e74c3c';
    stopBtn.style.marginLeft = '10px';
    if (btn && btn.parentNode) btn.parentNode.insertBefore(stopBtn, btn.nextSibling);
    app.stopExporting = false;
    stopBtn.addEventListener('click', () => { app.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });

    const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
    const customPatterns = Object.entries(app.musicTheory.customPatterns || {});
    const sections = [];
    let imageCount = 0;

    // Title
    sections.push(new Paragraph({
        children: [new TextRun({ text: "Custom Patterns — Circle of Fifths Reference", bold: true, size: 72 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 400 }
    }));
    sections.push(new Paragraph({
        children: [new TextRun({ text: "Each custom pattern presented across the Circle of Fifths (12 keys)", size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
    }));

    try {
        for (const [customId, customData] of customPatterns) {
            if (app.stopExporting) break;

            const patternName = customData.name || customId;
            sections.push(new Paragraph({
                children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${patternName} (${customId})`, bold: true, size: 36 })],
                spacing: { before: 300, after: 120 }
            }));

            for (const key of cof) {
                if (app.stopExporting) break;
                if (btn) btn.textContent = `Rendering ${patternName} in ${key}...`;

                // set UI selects for consistent state
                try {
                    const keySel = document.getElementById('key-select');
                    if (keySel && Array.from(keySel.options).some(o => o.value === key)) keySel.value = key;
                    const patternTypeSel = document.getElementById('pattern-type');
                    if (patternTypeSel) { patternTypeSel.value = 'custom'; if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect(); }
                    const ps = document.getElementById('pattern-select');
                    if (ps && Array.from(ps.options).some(o => o.value === customId)) ps.value = customId;
                } catch (e) {}

                app.fretboard.updatePattern(key, 'custom', customId);

                // allow DOM to settle
                await new Promise(r => requestAnimationFrame(r));

                const base64 = await Exporter.getFretboardImageBase64(app);
                const binaryString = window.atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

                sections.push(new Paragraph({
                    children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `Key: ${key}`, italics: true, size: 18 })],
                    spacing: { before: 80, after: 30 }
                }));

                sections.push(new Paragraph({
                    children: [
                        new ImageRun({
                            data: bytes,
                            transformation: { width: 600, height: 150 }
                        })
                    ],
                    spacing: { after: 80 }
                }));

                imageCount++;
                if (imageCount % 10 === 0) await new Promise(r => setTimeout(r, 0));
            }
        }

        if (!app.stopExporting) {
            const doc = new Document({ sections: [{ properties: {}, children: sections }] });
            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `custom_patterns_circle_of_fifths.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (err) {
        console.error('Custom Patterns CoF Word export failed:', err);
        alert('Export failed: ' + (err && err.message ? err.message : err));
    } finally {
        if (stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
        if (app.stopExporting) alert(`Export stopped after ${imageCount} images.`); else alert(`Exported ${imageCount} custom pattern images to Word.`);
    }
};