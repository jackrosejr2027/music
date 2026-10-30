/**
 * Exporter Intervals Extension
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllIntervalsToZip = async function(app) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }

        // Preserve user's UI tuning/string-count state
        const originalStringCount = parseInt(document.getElementById('string-count').value);
        const originalTuningInputs = app.getCurrentTuning ? app.getCurrentTuning() : null;

        const currentStringCount = originalStringCount;
        const keys = app.musicTheory.notes;
        const intervalEntries = Object.entries(app.musicTheory.intervals);
        app.stopExporting = false;
        
        const btn = document.getElementById('save-intervals-zip');
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
                
                for (const [intervalId, intervalData] of intervalEntries) {
                    if (app.stopExporting) break;
                    btn.textContent = `Processing ${key} ${intervalData.name}...`;
                    
                    app.fretboard.updatePattern(key, 'interval', intervalId);
                    
                    // Yield occasionally to keep UI responsive without full frame delay
                    if (imageCount % 12 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                    
                    const imageData = await Exporter.getFretboardImageBase64(app);
                    
                    const displayMode = app.fretboard.settings.displayMode || 'intervals';
                    const fretspanValue = document.getElementById('fretspan-presets')?.value || 'default';

                    const safeKey = key.replace('#', 'sharp');
                    const safeIntervalName = intervalData.name.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                    const safeFretspan = fretspanValue.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                    const filename = `interval_${safeKey}_${intervalId.replace('#', 'sharp')}_${safeIntervalName}_${displayMode}_${safeFretspan}.jpg`;
                    
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
                downloadLink.download = `all_intervals_${currentStringCount}-strings.zip`;
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
                alert(`Export stopped after ${imageCount} intervals`);
            } else {
                alert(`Successfully exported ${imageCount} interval diagrams to ZIP file`);
            }
        }
    };
}