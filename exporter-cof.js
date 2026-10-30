if (typeof Exporter !== 'undefined') {
    // Export intervals iterating by interval first and moving through Circle of Fifths for each interval
    Exporter.exportAllIntervalsCircleOfFifthsToZip = async function(app) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }

        const btn = document.getElementById('save-intervals-circle-zip');
        const originalText = btn ? btn.textContent : 'Exporting...';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Creating ZIP...';
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

        app.stopExporting = false;
        const zip = new JSZip();
        let imageCount = 0;

        try {
            // Circle of Fifths order (12 keys)
            const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];

            const intervalEntries = Object.entries(app.musicTheory.intervals);
            for (const [intervalId, intervalData] of intervalEntries) {
                if (app.stopExporting) break;
                const intervalFolder = zip.folder(`interval_${intervalId.replace('#','sharp')}`);
                for (const key of cof) {
                    if (app.stopExporting) break;
                    if (btn) btn.textContent = `Processing ${intervalId} in ${key}...`;

                    app.fretboard.updatePattern(key, 'interval', intervalId);
                    
                    // Yield occasionally to keep UI responsive without full frame delay
                    if (imageCount % 12 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }

                    const imageData = await Exporter.getFretboardImageBase64(app);

                    const safeKey = key.replace('#', 'sharp');
                    const safeInterval = intervalId.replace('#','sharp');
                    const safeIntervalName = (intervalData.name || intervalId).replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                    const filename = `interval_${safeInterval}_${safeKey}_${safeIntervalName}.jpg`;

                    intervalFolder.file(filename, imageData, {base64: true});
                    imageCount++;
                }
            }

            if (!app.stopExporting) {
                if (btn) btn.textContent = 'Generating ZIP file...';
                const zipBlob = await zip.generateAsync({type: 'blob'});
                const zipUrl = URL.createObjectURL(zipBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = zipUrl;
                downloadLink.download = `all_intervals_circle_of_fifths.zip`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(zipUrl);
            }
        } catch (error) {
            console.error('Error creating Circle of Fifths ZIP file:', error);
            alert(`Error creating ZIP file: ${error.message}`);
        } finally {
            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            if (app.stopExporting) {
                alert(`Export stopped after ${imageCount} images`);
            } else {
                alert(`Successfully exported ${imageCount} interval diagrams to ZIP file`);
            }
        }
    };

    // Export chords iterating by chord first and moving through Circle of Fifths for each chord
    Exporter.exportAllChordsCircleOfFifthsToZip = async function(app) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }

        const btn = document.getElementById('save-chords-circle-zip');
        const originalText = btn ? btn.textContent : 'Exporting...';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Creating ZIP...';
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

        app.stopExporting = false;
        const zip = new JSZip();
        let imageCount = 0;

        try {
            // Circle of Fifths order (12 keys)
            const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];

            const chordEntries = Object.entries(app.musicTheory.chords);
            for (const [chordId, chordData] of chordEntries) {
                if (app.stopExporting) break;
                const chordFolder = zip.folder(`chord_${chordId}`);
                for (const key of cof) {
                    if (app.stopExporting) break;
                    if (btn) btn.textContent = `Processing ${chordData.name} in ${key}...`;

                    app.fretboard.updatePattern(key, 'chord', chordId);
                    await new Promise(resolve => requestAnimationFrame(resolve));

                    const imageData = await Exporter.getFretboardImageBase64(app);

                    const safeKey = key.replace('#', 'sharp');
                    const safeChordName = chordData.name.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                    const filename = `chord_${chordId}_${safeKey}_${safeChordName}.jpg`;

                    chordFolder.file(filename, imageData, {base64: true});
                    imageCount++;
                }
            }

            if (!app.stopExporting) {
                if (btn) btn.textContent = 'Generating ZIP file...';
                const zipBlob = await zip.generateAsync({type: 'blob'});
                const zipUrl = URL.createObjectURL(zipBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = zipUrl;
                downloadLink.download = `all_chords_circle_of_fifths.zip`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(zipUrl);
            }
        } catch (error) {
            console.error('Error creating Chords Circle of Fifths ZIP file:', error);
            alert(`Error creating ZIP file: ${error.message}`);
        } finally {
            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            if (app.stopExporting) {
                alert(`Export stopped after ${imageCount} images`);
            } else {
                alert(`Successfully exported ${imageCount} chord diagrams to ZIP file`);
            }
        }
    };

    // Export scales iterating by scale first and moving through Circle of Fifths for each scale
    Exporter.exportAllScalesCircleOfFifthsToZip = async function(app) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }

        const btn = document.getElementById('save-scales-circle-zip');
        const originalText = btn ? btn.textContent : 'Exporting...';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Creating ZIP...';
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

        app.stopExporting = false;
        const zip = new JSZip();
        let imageCount = 0;

        try {
            // Circle of Fifths order (12 keys)
            const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];

            const scaleEntries = Object.entries(app.musicTheory.scales);
            for (const [scaleId, scaleData] of scaleEntries) {
                if (app.stopExporting) break;
                const scaleFolder = zip.folder(`scale_${scaleId}`);
                for (const key of cof) {
                    if (app.stopExporting) break;
                    if (btn) btn.textContent = `Processing ${scaleData.name} in ${key}...`;

                    app.fretboard.updatePattern(key, 'scale', scaleId);
                    await new Promise(resolve => requestAnimationFrame(resolve));

                    const imageData = await Exporter.getFretboardImageBase64(app);

                    const safeKey = key.replace('#', 'sharp');
                    const safeScaleName = scaleData.name.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                    const filename = `scale_${scaleId}_${safeKey}_${safeScaleName}.jpg`;

                    scaleFolder.file(filename, imageData, {base64: true});
                    imageCount++;
                }
            }

            if (!app.stopExporting) {
                if (btn) btn.textContent = 'Generating ZIP file...';
                const zipBlob = await zip.generateAsync({type: 'blob'});
                const zipUrl = URL.createObjectURL(zipBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = zipUrl;
                downloadLink.download = `all_scales_circle_of_fifths.zip`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(zipUrl);
            }
        } catch (error) {
            console.error('Error creating Scales Circle of Fifths ZIP file:', error);
            alert(`Error creating ZIP file: ${error.message}`);
        } finally {
            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            if (app.stopExporting) {
                alert(`Export stopped after ${imageCount} images`);
            } else {
                alert(`Successfully exported ${imageCount} scale diagrams to ZIP file`);
            }
        }
    };

    // NEW: Export Scales (Circle of Fifths) to Word document (pattern-by-pattern through all keys)
    Exporter.exportAllScalesCircleOfFifthsToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const btn = document.getElementById('save-scales-circle-word');
        const originalText = btn ? btn.textContent : 'Exporting...';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparing Scales (CoF) ...'; }

        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Exporting';
        stopBtn.style.backgroundColor = '#e74c3c';
        stopBtn.style.marginLeft = '10px';
        if (btn && btn.parentNode) btn.parentNode.insertBefore(stopBtn, btn.nextSibling);
        app.stopExporting = false;
        stopBtn.addEventListener('click', () => { app.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });

        const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
        const scales = Object.entries(app.musicTheory.scales || {});
        const sections = [];
        let imageCount = 0;

        // Title
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Scales — Circle of Fifths Reference", bold: true, size: 72 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 }
        }));
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Each scale presented across the Circle of Fifths (12 keys)", size: 36 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));

        try {
            for (const [scaleId, scaleData] of scales) {
                if (app.stopExporting) break;

                const scaleName = scaleData.name || scaleId;
                sections.push(new Paragraph({
                    children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${scaleName} (${scaleId})`, bold: true, size: 36 })],
                    spacing: { before: 300, after: 120 }
                }));

                for (const key of cof) {
                    if (app.stopExporting) break;
                    if (btn) btn.textContent = `Rendering ${scaleName} in ${key}...`;

                    // set UI selects for consistent state
                    try {
                        const keySel = document.getElementById('key-select');
                        if (keySel && Array.from(keySel.options).some(o => o.value === key)) keySel.value = key;
                        const patternTypeSel = document.getElementById('pattern-type');
                        if (patternTypeSel) { patternTypeSel.value = 'scale'; if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect(); }
                        const ps = document.getElementById('pattern-select');
                        if (ps && Array.from(ps.options).some(o => o.value === scaleId)) ps.value = scaleId;
                    } catch (e) {}

                    app.fretboard.updatePattern(key, 'scale', scaleId);

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
                a.download = `scales_circle_of_fifths.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Scales CoF Word export failed:', err);
            alert('Export failed: ' + (err && err.message ? err.message : err));
        } finally {
            if (stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
            if (app.stopExporting) alert(`Export stopped after ${imageCount} images.`); else alert(`Exported ${imageCount} scale images to Word.`);
        }
    };
}