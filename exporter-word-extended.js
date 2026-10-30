/**
 * Extended Word Document Exporters (V7 - V16)
 * Implements 10 additional specialized Word export formats.
 */
if (typeof Exporter !== 'undefined') {
    // Utility to prompt for keys and handle export boilerplate
    Exporter.runExtendedExport = async function(app, versionLabel, configCallback) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded.');
            return;
        }

        const keyChoice = prompt(`Export ${versionLabel}\n1: Current Key\n2: Select Key(s)\n3: All Keys`, "1");
        if (!keyChoice) return;
        
        let keysToExport = [];
        if (keyChoice === "1") keysToExport = [app.fretboard.currentKey || 'C'];
        else if (keyChoice === "2") {
            const keysInput = prompt("Enter keys separated by commas:", app.fretboard.currentKey || 'C');
            if (!keysInput) return;
            keysToExport = keysInput.split(',').map(k => k.trim()).filter(k => app.musicTheory.notes.includes(k));
        } else if (keyChoice === "3") keysToExport = app.musicTheory.notes;
        else return;

        if (keysToExport.length === 0) return;

        const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;
        const btn = document.getElementById('export-play-button');
        const origText = btn ? btn.textContent : 'Play';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparing...'; }

        // Backup state
        const backup = {
            displayMode: document.getElementById('display-mode').value,
            colorTheme: document.getElementById('color-theme').value,
            stringCount: document.getElementById('string-count').value,
            tuning: app.getCurrentTuning()
        };

        app.stopExporting = false;
        const sections = [];
        let imageCount = 0;

        sections.push(new Paragraph({
            children: [new TextRun({ text: `Scales Thesaurus - ${versionLabel}`, bold: true, size: 64 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1000, after: 400 }
        }));

        const categories = [
            { type: 'interval', name: 'Intervals', data: app.musicTheory.intervals },
            { type: 'chord', name: 'Chords', data: app.musicTheory.chords },
            { type: 'scale', name: 'Scales', data: app.musicTheory.scales }
        ];

        try {
            for (const cat of categories) {
                if (app.stopExporting) break;
                sections.push(new Paragraph({ text: cat.name, heading: docx.HeadingLevel.HEADING_1, pageBreakBefore: true }));

                for (const key of keysToExport) {
                    if (app.stopExporting) break;
                    
                    for (const [patternId, patternData] of Object.entries(cat.data)) {
                        if (app.stopExporting) break;
                        const patternName = patternData.name || patternId;
                        if (btn) btn.textContent = `${versionLabel}: ${key} ${patternName}...`;

                        // Apply specialized configuration
                        if (configCallback) configCallback(app, key, cat.type, patternId);

                        app.fretboard.updatePattern(key, cat.type, patternId);
                        await new Promise(r => requestAnimationFrame(r));
                        
                        const base64 = await Exporter.getFretboardImageBase64(app);
                        const bytes = new Uint8Array(window.atob(base64).split('').map(c => c.charCodeAt(0)));

                        sections.push(new Paragraph({
                            children: [new TextRun({ text: Exporter.includeTitles === false ? '' : `${key} ${patternName}`, bold: true, size: 24 })],
                            spacing: { before: 200, after: 100 }
                        }));

                        sections.push(new Paragraph({
                            children: [new ImageRun({ data: bytes, transformation: { width: 600, height: 150 } })],
                            spacing: { after: 200 }
                        }));

                        imageCount++;
                        if (imageCount % 10 === 0) await new Promise(r => setTimeout(r, 0));
                    }
                }
            }

            if (!app.stopExporting) {
                const doc = new Document({ sections: [{ properties: {}, children: sections }] });
                const blob = await Packer.toBlob(doc);
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${versionLabel.replace(/\s+/g, '_')}.docx`;
                a.click();
            }
        } catch (e) {
            console.error(e);
            alert("Export failed: " + e.message);
        } finally {
            // Restore state
            document.getElementById('display-mode').value = backup.displayMode;
            document.getElementById('color-theme').value = backup.colorTheme;
            if (app.updateTuningInputs) app.updateTuningInputs(backup.tuning);
            if (app.updateFretboard) app.updateFretboard();
            if (btn) { btn.disabled = false; btn.textContent = origText; }
        }
    };

    // V7: Minimalist (No Labels)
    Exporter.exportV7Minimalist = (app) => Exporter.runExtendedExport(app, "V7 Minimalist", (app) => {
        document.getElementById('display-mode').value = 'none';
    });

    // V8: Theory focus (Adds text descriptions)
    Exporter.exportV8Theory = (app) => Exporter.runExtendedExport(app, "V8 Theory Focus", (app) => {
        document.getElementById('display-mode').value = 'intervals';
    });

    // V9: Dark Mode forced
    Exporter.exportV9Dark = (app) => Exporter.runExtendedExport(app, "V9 Dark Mode", (app) => {
        document.getElementById('color-theme').value = 'darkMode';
    });

    // V10: Lefty view forced
    Exporter.exportV10Lefty = (app) => Exporter.runExtendedExport(app, "V10 Lefty View", (app) => {
        if (app.flipStringOrder) app.flipStringOrder();
    });

    // V11: Note Names forced
    Exporter.exportV11Notes = (app) => Exporter.runExtendedExport(app, "V11 Notes Mode", (app) => {
        document.getElementById('display-mode').value = 'notes';
    });

    // V12: Intervals forced
    Exporter.exportV12Intervals = (app) => Exporter.runExtendedExport(app, "V12 Intervals Mode", (app) => {
        document.getElementById('display-mode').value = 'intervals';
    });

    // V13: Roman Numerals forced
    Exporter.exportV13Roman = (app) => Exporter.runExtendedExport(app, "V13 Roman Mode", (app) => {
        document.getElementById('display-mode').value = 'roman';
    });

    // V14: Solfege forced
    Exporter.exportV14Solfege = (app) => Exporter.runExtendedExport(app, "V14 Solfege Mode", (app) => {
        document.getElementById('display-mode').value = 'solfege';
    });

    // V15: High Contrast forced
    Exporter.exportV15HighContrast = (app) => Exporter.runExtendedExport(app, "V15 High Contrast", (app) => {
        document.getElementById('color-theme').value = 'plainWhite';
        document.getElementById('display-mode').value = 'intervals';
    });

    // V16: Blueprint forced
    Exporter.exportV16Blueprint = (app) => Exporter.runExtendedExport(app, "V16 Blueprint Style", (app) => {
        document.getElementById('color-theme').value = 'blueprint';
        document.getElementById('display-mode').value = 'intervals';
    });
}