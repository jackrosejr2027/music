/**
 * Word Document Exporter - pattern-by-pattern through all keys
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllPatternsAllKeysToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }
        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const btn = document.getElementById('save-all-patterns-word');
        const origText = btn ? btn.textContent : 'Exporting...';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparing...'; }

        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Exporting';
        stopBtn.style.backgroundColor = '#e74c3c';
        stopBtn.style.marginLeft = '10px';
        if (btn && btn.parentNode) btn.parentNode.insertBefore(stopBtn, btn.nextSibling);
        let imageCount = 0;
        app.stopExporting = false;
        stopBtn.addEventListener('click', () => { app.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });

        try {
            // Only export these three categories (pattern -> all keys): intervals, chords, scales
            const categories = [
                { type: 'interval', data: app.musicTheory.intervals, name: 'Intervals' },
                { type: 'chord', data: app.musicTheory.chords, name: 'Chords' },
                { type: 'scale', data: app.musicTheory.scales, name: 'Scales' }
            ];
            const keys = app.musicTheory.notes.slice(); // 12 keys

            const docChildren = [];
            docChildren.push(new Paragraph({ children: [new TextRun({ text: 'Scales Thesaurus — Pattern-by-Pattern (Each pattern across all keys)', bold: true, size: 48 }) ,], alignment: AlignmentType.CENTER, spacing: { before: 2000, after: 400 } }));

            for (const cat of categories) {
                if (app.stopExporting) break;
                docChildren.push(new Paragraph({ children: [new TextRun({ text: cat.name, bold: true, size: 36 })], spacing: { before: 400, after: 200 } }));

                const entries = Object.entries(cat.data);
                for (const [patternId, patternData] of entries) {
                    if (app.stopExporting) break;
                    const patternName = patternData.name || patternId;
                    docChildren.push(new Paragraph({ children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${cat.name} — ${patternName}`, bold: true, size: 28 })], spacing: { before: 300, after: 120 } }));
                    
                    // For each key, render pattern and capture image
                    for (const key of keys) {
                        if (app.stopExporting) break;
                        if (btn) btn.textContent = `Rendering ${patternName} — ${key}...`;

                        // set UI selects so updateFretboard reads consistent values
                        try {
                            document.getElementById('key-select').value = key;
                            document.getElementById('pattern-type').value = cat.type;
                            if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect();
                            const ps = document.getElementById('pattern-select');
                            if (ps && Array.from(ps.options).some(o=>o.value==patternId)) ps.value = patternId;
                        } catch (e) {}

                        // apply pattern to fretboard
                        if (app.fretboard && typeof app.fretboard.updatePattern === 'function') {
                            app.fretboard.updatePattern(key, cat.type, patternId);
                        }
                        // let DOM settle
                        await new Promise(r => requestAnimationFrame(r));
                        // retrieve image base64
                        const base64 = await Exporter.getFretboardImageBase64(app);
                        const binaryString = window.atob(base64);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i=0;i<binaryString.length;i++) bytes[i]=binaryString.charCodeAt(i);

                        docChildren.push(new Paragraph({ children: [ new TextRun({ text: Exporter.includeTitles === false ? '' : `Key: ${key}`, italics: true, size: 18 }) ], spacing: { before: 80, after: 40 } }));
                        docChildren.push(new Paragraph({ children: [ new ImageRun({ data: bytes, transformation: { width: 600, height: 150 } }) ], spacing: { after: 100 } }));

                        imageCount++;
                        if (imageCount % 8 === 0) await new Promise(r => setTimeout(r,0));
                    }
                }
            }

            if (!app.stopExporting) {
                const doc = new Document({ sections: [{ properties: {}, children: docChildren }]});
                const blob = await Packer.toBlob(doc);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `patterns_by_pattern_all_keys.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Pattern-by-pattern export failed:', err);
            alert('Export failed: ' + (err && err.message ? err.message : err));
        } finally {
            if (stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
            if (btn) { btn.disabled = false; btn.textContent = origText; }
            if (app.stopExporting) alert(`Export stopped after ${imageCount} images.`); else alert(`Exported ${imageCount} images to Word document.`);
        }
    };

    Exporter.exportAllPatternsCircleOfFifthsToWordV2 = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }
        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const btn = document.getElementById('save-all-patterns-circle-word-v2');
        const origText = btn ? btn.textContent : 'Exporting...';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparing...'; }

        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Exporting';
        stopBtn.style.backgroundColor = '#e74c3c';
        stopBtn.style.marginLeft = '10px';
        if (btn && btn.parentNode) btn.parentNode.insertBefore(stopBtn, btn.nextSibling);
        let docsCount = 0;
        let imageCount = 0;
        app.stopExporting = false;
        stopBtn.addEventListener('click', () => { app.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });

        const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
        const zip = new JSZip();

        try {
            const categories = [
                { type: 'interval', data: app.musicTheory.intervals, name: 'Intervals' },
                { type: 'chord', data: app.musicTheory.chords, name: 'Chords' },
                { type: 'scale', data: app.musicTheory.scales, name: 'Scales' }
            ];

            for (const cat of categories) {
                if (app.stopExporting) break;

                const entries = Object.entries(cat.data);
                for (const [patternId, patternData] of entries) {
                    if (app.stopExporting) break;
                    
                    const patternName = patternData.name || patternId;
                    const docChildren = [];
                    
                    docChildren.push(new Paragraph({ children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${cat.name} — ${patternName}`, bold: true, size: 48 })], alignment: AlignmentType.CENTER, spacing: { before: 1000, after: 400 } }));
                    docChildren.push(new Paragraph({ children: [new TextRun({ text: `Circle of Fifths Reference`, size: 36 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }));
                    
                    for (const key of cof) {
                        if (app.stopExporting) break;
                        if (btn) btn.textContent = `Rendering ${patternName} — ${key}...`;

                        try {
                            document.getElementById('key-select').value = key;
                            document.getElementById('pattern-type').value = cat.type;
                            if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect();
                            const ps = document.getElementById('pattern-select');
                            if (ps && Array.from(ps.options).some(o=>o.value==patternId)) ps.value = patternId;
                        } catch (e) {}

                        if (app.fretboard && typeof app.fretboard.updatePattern === 'function') {
                            app.fretboard.updatePattern(key, cat.type, patternId);
                        }
                        
                        await new Promise(r => requestAnimationFrame(r));
                        
                        const base64 = await Exporter.getFretboardImageBase64(app);
                        const binaryString = window.atob(base64);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i=0;i<binaryString.length;i++) bytes[i]=binaryString.charCodeAt(i);

                        docChildren.push(new Paragraph({ children: [ new TextRun({ text: Exporter.includeTitles === false ? '' : `Key: ${key}`, italics: true, size: 18 }) ], spacing: { before: 80, after: 40 } }));
                        docChildren.push(new Paragraph({ children: [ new ImageRun({ data: bytes, transformation: { width: 600, height: 150 } }) ], spacing: { after: 100 } }));

                        imageCount++;
                        if (imageCount % 8 === 0) await new Promise(r => setTimeout(r,0));
                    }
                    
                    if (app.stopExporting) break;

                    const doc = new Document({ sections: [{ properties: {}, children: docChildren }]});
                    const blob = await Packer.toBlob(doc);
                    const safePatternName = patternName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const filename = `${cat.type}_${safePatternName}_circle_of_fifths.docx`;
                    
                    zip.file(filename, blob);
                    docsCount++;
                    
                    await new Promise(r => setTimeout(r, 0));
                }
            }

            if (!app.stopExporting && docsCount > 0) {
                if (btn) btn.textContent = 'Generating ZIP file...';
                const zipBlob = await zip.generateAsync({type: 'blob'});
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `all_patterns_circle_of_fifths_docs.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

        } catch (err) {
            console.error('Pattern-by-pattern V2 export failed:', err);
            alert('Export failed: ' + (err && err.message ? err.message : err));
        } finally {
            if (stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
            if (btn) { btn.disabled = false; btn.textContent = origText; }
            if (app.stopExporting) alert(`Export stopped after generating ${docsCount} documents.`); else alert(`Exported ${docsCount} Word documents into a single ZIP file.`);
        }
    };
}