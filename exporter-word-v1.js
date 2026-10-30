/**
 * Word Document Exporter (V1)
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllCombinedToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const { Document, Packer, Paragraph, TextRun, ImageRun } = docx;
        
        const originalStringCount = parseInt(document.getElementById('string-count').value);
        const originalTuningInputs = app.getCurrentTuning ? app.getCurrentTuning() : null;

        app.stopExporting = false;

        const btn = document.getElementById('save-all-combined-word');
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
        
        const keys = app.musicTheory.notes;
        
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

                for (const key of keys) {
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
                        
                        app.fretboard.updatePattern(key, cat.type, patternId);
                        
                        // Yield occasionally to keep UI responsive
                        if (imageCount % 12 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 0));
                        } else {
                            await new Promise(resolve => requestAnimationFrame(resolve));
                        }

                        const imageDataBase64 = await Exporter.getFretboardImageBase64(app);
                        
                        const patternName = patternData.name || patternId;
                        
                        docSections.push(new Paragraph({
                            children: [
                                new TextRun({ text: Exporter.includeTitles === false ? '' : `${key} - ${patternName}`, bold: true, size: 28 })
                            ],
                            spacing: { before: 200, after: 100 }
                        }));
                        
                        const binaryString = window.atob(imageDataBase64);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        
                        docSections.push(new Paragraph({
                            children: [
                                new ImageRun({
                                    data: bytes,
                                    transformation: {
                                        width: 600,
                                        height: 150
                                    }
                                })
                            ]
                        }));

                        imageCount++;
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
                downloadLink.download = `all_patterns_${originalStringCount}-strings.docx`;
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