/**
 * Word Document Exporter - Chords (Circle of Fifths)
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllChordsCircleOfFifthsToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const btn = document.getElementById('save-chords-circle-word');
        const origText = btn ? btn.textContent : 'Exporting...';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparing Chords (CoF)...'; }

        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Exporting';
        stopBtn.style.backgroundColor = '#e74c3c';
        stopBtn.style.marginLeft = '10px';
        if (btn && btn.parentNode) btn.parentNode.insertBefore(stopBtn, btn.nextSibling);
        app.stopExporting = false;
        stopBtn.addEventListener('click', () => { app.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });

        const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
        const chords = Object.entries(app.musicTheory.chords || {});
        const sections = [];
        let imageCount = 0;

        // Title
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Chords — Circle of Fifths Reference", bold: true, size: 72 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 }
        }));
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Each chord presented across the Circle of Fifths (12 keys)", size: 36 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));

        try {
            for (const [chordId, chordData] of chords) {
                if (app.stopExporting) break;

                const chordName = chordData.name || chordId;
                sections.push(new Paragraph({
                    children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${chordName} (${chordId})`, bold: true, size: 36 })],
                    spacing: { before: 300, after: 120 }
                }));

                for (const key of cof) {
                    if (app.stopExporting) break;
                    if (btn) btn.textContent = `Rendering ${chordName} in ${key}...`;

                    // set UI selects for consistent state
                    try {
                        const keySel = document.getElementById('key-select');
                        if (keySel && Array.from(keySel.options).some(o => o.value === key)) keySel.value = key;
                        const patternTypeSel = document.getElementById('pattern-type');
                        if (patternTypeSel) { patternTypeSel.value = 'chord'; if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect(); }
                        const ps = document.getElementById('pattern-select');
                        if (ps && Array.from(ps.options).some(o => o.value === chordId)) ps.value = chordId;
                    } catch (e) {}

                    app.fretboard.updatePattern(key, 'chord', chordId);

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
                a.download = `chords_circle_of_fifths.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Chords CoF Word export failed:', err);
            alert('Export failed: ' + (err && err.message ? err.message : err));
        } finally {
            if (stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
            if (btn) { btn.disabled = false; btn.textContent = origText; }
            if (app.stopExporting) alert(`Export stopped after ${imageCount} images.`); else alert(`Exported ${imageCount} chord images to Word.`);
        }
    };
}