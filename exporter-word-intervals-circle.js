/**
 * Word Document Exporter - Intervals (Circle of Fifths)
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllIntervalsCircleOfFifthsToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const btn = document.getElementById('save-intervals-circle-word');
        const origText = btn ? btn.textContent : 'Exporting...';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparing Intervals (CoF) ...'; }

        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Exporting';
        stopBtn.style.backgroundColor = '#e74c3c';
        stopBtn.style.marginLeft = '10px';
        if (btn && btn.parentNode) btn.parentNode.insertBefore(stopBtn, btn.nextSibling);
        app.stopExporting = false;
        stopBtn.addEventListener('click', () => { app.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });

        const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
        const intervals = Object.entries(app.musicTheory.intervals || {});
        const sections = [];
        let imageCount = 0;

        // Title
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Intervals — Circle of Fifths Reference", bold: true, size: 72 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 }
        }));
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Each interval presented across the Circle of Fifths (12 keys)", size: 36 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));

        try {
            for (const [intervalId, intervalData] of intervals) {
                if (app.stopExporting) break;

                sections.push(new Paragraph({
                    children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${intervalData.name} (${intervalId})`, bold: true, size: 36 })],
                    spacing: { before: 300, after: 120 }
                }));

                for (const key of cof) {
                    if (app.stopExporting) break;
                    if (btn) btn.textContent = `Rendering ${intervalId} in ${key}...`;

                    // Set UI selects for consistent state and update
                    try {
                        const keySel = document.getElementById('key-select');
                        if (keySel && Array.from(keySel.options).some(o => o.value === key)) keySel.value = key;
                        const patternTypeSel = document.getElementById('pattern-type');
                        if (patternTypeSel) { patternTypeSel.value = 'interval'; if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect(); }
                        const patSel = document.getElementById('pattern-select');
                        if (patSel && Array.from(patSel.options).some(o => o.value === intervalId)) patSel.value = intervalId;
                    } catch (e) {}

                    app.fretboard.updatePattern(key, 'interval', intervalId);

                    // allow DOM settle
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
                a.download = `intervals_circle_of_fifths.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Interval CoF Word export failed:', err);
            alert('Export failed: ' + (err && err.message ? err.message : err));
        } finally {
            if (stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
            if (btn) { btn.disabled = false; btn.textContent = origText; }
            if (app.stopExporting) alert(`Export stopped after ${imageCount} images.`); else alert(`Exported ${imageCount} interval images to Word.`);
        }
    };
}