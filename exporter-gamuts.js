/**
 * Exporter Gamuts Extension
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllGamutsToZip = async function(app) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is not loaded. Cannot create ZIP file.');
            return;
        }

        const gamuts = Object.entries(app.musicTheory.gamuts);
        if (gamuts.length === 0) {
            alert('No gamuts found to export.');
            return;
        }

        app.stopExporting = false;
        // Handle potential triggers from sidebar or bottom footer
        const btn = document.getElementById('save-gamuts-zip') || document.getElementById('save-gamuts-sidebar-zip');
        const originalText = btn ? btn.textContent : 'Exporting Gamuts...';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Creating ZIP...';
        }

        const stopExportBtn = document.createElement('button');
        stopExportBtn.textContent = 'Stop Exporting';
        stopExportBtn.style.backgroundColor = '#e74c3c';
        stopExportBtn.style.color = '#fff';
        stopExportBtn.style.marginLeft = '10px';
        stopExportBtn.style.padding = '10px';
        stopExportBtn.addEventListener('click', () => {
            app.stopExporting = true;
            stopExportBtn.disabled = true;
            stopExportBtn.textContent = 'Stopping...';
        });
        if (btn) btn.insertAdjacentElement('afterend', stopExportBtn);

        const zip = new JSZip();
        let imageCount = 0;
        
        // Save original fret span and pattern to restore later
        const originalStartFret = app.fretboard.settings.startFret;
        const originalEndFret = app.fretboard.settings.endFret;
        const originalPatternType = app.fretboard.currentPatternType;
        const originalPattern = app.fretboard.currentPattern;
        const originalKey = app.fretboard.currentKey || 'C';

        try {
            // Gamuts are position-based, key usually doesn't shift them 
            // but we use currentKey for consistency in the display label.
            const key = originalKey;

            for (const [gamutId, gamutData] of gamuts) {
                if (app.stopExporting) break;
                if (btn && imageCount % 5 === 0) btn.textContent = `Processing ${gamutData.name} (${imageCount + 1}/${gamuts.length})...`;

                // Accuracy Improvement: Dynamically adjust the fretboard span to frame the current gamut perfectly
                if (gamutData.positions && gamutData.positions.length > 0) {
                    const frets = gamutData.positions.map(p => p.fret);
                    const minFret = Math.max(0, Math.min(...frets) - 1);
                    const maxFret = Math.min(24, Math.max(...frets) + 1);
                    
                    app.fretboard.settings.startFret = minFret;
                    app.fretboard.settings.endFret = Math.max(minFret + 4, maxFret);
                }

                app.fretboard.updatePattern(key, 'gamut', gamutId);
                
                // Speed Improvement: Avoid requestAnimationFrame on every item (which forces a full layout/paint).
                // Yielding with setTimeout occasionally keeps the UI responsive but runs orders of magnitude faster.
                if (imageCount % 12 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }

                const imageData = await Exporter.getFretboardImageBase64(app);

                const safeName = gamutData.name.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
                const filename = `gamut_${gamutId}_${safeName}.jpg`;

                zip.file(filename, imageData, {base64: true});
                imageCount++;
            }

            if (!app.stopExporting) {
                if (btn) btn.textContent = 'Generating ZIP file...';
                const zipBlob = await zip.generateAsync({type: 'blob'});
                const zipUrl = URL.createObjectURL(zipBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = zipUrl;
                downloadLink.download = `all_gamuts.zip`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(zipUrl);
            }
        } catch (error) {
            console.error('Error creating Gamuts ZIP file:', error);
            alert(`Error creating ZIP file: ${error.message}`);
        } finally {
            // Restore original fret span and pattern
            app.fretboard.settings.startFret = originalStartFret;
            app.fretboard.settings.endFret = originalEndFret;
            app.fretboard.updatePattern(originalKey, originalPatternType, originalPattern);

            if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
            if (app.stopExporting) {
                alert(`Export stopped after ${imageCount} gamuts.`);
            } else {
                alert(`Successfully exported ${imageCount} gamut diagrams to ZIP file.`);
            }
        }
    }
}