/**
 * Exporter Chords Extension
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllChordsToZip = async function(app) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }

        // Preserve user's UI tuning/string-count state
        const originalStringCount = parseInt(document.getElementById('string-count').value);
        const originalTuningInputs = app.getCurrentTuning ? app.getCurrentTuning() : null;

        const currentStringCount = originalStringCount;
        const keys = app.musicTheory.notes;
        const chordEntries = Object.entries(app.musicTheory.chords);
        app.stopExporting = false;
        
        const btn = document.getElementById('save-chords-zip');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Creating ZIP...';
        
        const stopExportBtn = document.createElement('button');
        stopExportBtn.textContent = 'Stop Exporting';
        stopExportBtn.style.backgroundColor = '#e74c3c';
        stopExportBtn.style.marginLeft = '10px';
        stopExportBtn.addEventListener('click', () => {
            app.stopExporting = true;
            stopExportBtn.disabled = true;
            stopExportBtn.textContent = 'Stopping...';
        });
        btn.insertAdjacentElement('afterend', stopExportBtn);
        
        const zip = new JSZip();
        let imageCount = 0;
        
        try {
            for (const key of keys) {
                if (app.stopExporting) break;
                const keyFolder = zip.folder(key.replace('#', 'sharp'));
                
                for (const [chordId, chordData] of chordEntries) {
                    if (app.stopExporting) break;
                    btn.textContent = `Processing ${key} ${chordData.name}...`;
                    
                    app.fretboard.updatePattern(key, 'chord', chordId);
                    await new Promise(resolve => requestAnimationFrame(resolve));
                    
                    const imageData = await Exporter.getFretboardImageBase64(app);
                    
                    const displayMode = app.fretboard.settings.displayMode || 'intervals';
                    const fretspanValue = document.getElementById('fretspan-presets')?.value || 'default';

                    const safeKey = key.replace('#', 'sharp');
                    const safeChordName = chordData.name.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                    const safeFretspan = fretspanValue.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                    const filename = `chord_${safeKey}_${safeChordName}_${displayMode}_${safeFretspan}.jpg`;
                    
                    keyFolder.file(filename, imageData, {base64: true});
                    imageCount++;
                }
            }
            
            if (!app.stopExporting) {
                btn.textContent = 'Generating ZIP file...';
                const zipBlob = await zip.generateAsync({type: 'blob'});
                const zipUrl = URL.createObjectURL(zipBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = zipUrl;
                downloadLink.download = `all_chords_${currentStringCount}-strings.zip`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(zipUrl);
            }
        } catch (error) {
            console.error('Error creating ZIP file:', error);
            alert(`Error creating ZIP file: ${error.message}`);
        } finally {
            // Restore user's tuning and string-count state
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
                alert(`Export stopped after ${imageCount} chords`);
            } else {
                alert(`Successfully exported ${imageCount} chord diagrams to ZIP file`);
            }
        }
    };
}