/**
 * Word Document Exporter - Gamuts (Circle of Fifths)
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllGamutsCircleOfFifthsToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const btn = document.getElementById('save-gamuts-circle-word');
        const originalText = btn ? btn.textContent : 'Exporting...';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparing Gamuts (CoF)...'; }

        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Exporting';
        stopBtn.style.backgroundColor = '#e74c3c';
        stopBtn.style.marginLeft = '10px';
        if (btn && btn.parentNode) btn.parentNode.insertBefore(stopBtn, btn.nextSibling);
        app.stopExporting = false;
        stopBtn.addEventListener('click', () => { app.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });

        // Circle of Fifths order
        const cof = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
        const gamuts = Object.entries(app.musicTheory.gamuts || {});
        const sections = [];
        let imageCount = 0;

        // Title
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Gamuts — Circle of Fifths Reference", bold: true, size: 72 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 }
        }));
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Each gamut presented across the Circle of Fifths (12 keys)", size: 36 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));

        try {
            for (const [gamutId, gamutData] of gamuts) {
                if (app.stopExporting) break;

                const gamutName = gamutData.name || gamutId;
                sections.push(new Paragraph({
                    children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${gamutName} (${gamutId})`, bold: true, size: 36 })],
                    spacing: { before: 300, after: 120 }
                }));

                for (const key of cof) {
                    if (app.stopExporting) break;
                    if (btn) btn.textContent = `Rendering ${gamutName} in ${key}...`;

                    // set UI selects for consistent state
                    try {
                        const keySel = document.getElementById('key-select');
                        if (keySel && Array.from(keySel.options).some(o => o.value === key)) keySel.value = key;
                        const patternTypeSel = document.getElementById('pattern-type');
                        if (patternTypeSel) { patternTypeSel.value = 'gamut'; if (typeof app.updatePatternSelect === 'function') app.updatePatternSelect(); }
                        const ps = document.getElementById('pattern-select');
                        if (ps && Array.from(ps.options).some(o => o.value === gamutId)) ps.value = gamutId;
                    } catch (e) {}

                    app.fretboard.updatePattern(key, 'gamut', gamutId);

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
                a.download = `gamuts_circle_of_fifths.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Gamuts CoF Word export failed:', err);
            alert('Export failed: ' + (err && err.message ? err.message : err));
        } finally {
            if (stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
            if (app.stopExporting) alert(`Export stopped after ${imageCount} images.`); else alert(`Exported ${imageCount} gamut images to Word.`);
        }
    };
}