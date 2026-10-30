/**
 * Pattern Generator Export Extension
 * Logic for batch exporting generated diagrams using JSZip
 */

App.prototype.exportAllGenerated = async function() {
    if (this.generatedPatterns.length === 0) {
        alert('No patterns to export');
        return;
    }
    
    if (typeof JSZip === 'undefined') {
        alert('JSZip library is not loaded. Cannot create ZIP file.');
        return;
    }

    const exportBtn = document.querySelector('.export-all-generated');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = 'Processing...';
    exportBtn.disabled = true;
    
    const stopExportBtn = document.createElement('button');
    stopExportBtn.textContent = 'Stop Exporting';
    stopExportBtn.style.backgroundColor = '#e74c3c';
    stopExportBtn.style.color = '#fff';
    stopExportBtn.style.marginLeft = '10px';
    stopExportBtn.style.width = 'auto';
    stopExportBtn.addEventListener('click', () => {
        this.stopExporting = true;
        stopExportBtn.disabled = true;
        stopExportBtn.textContent = 'Stopping...';
    });
    exportBtn.insertAdjacentElement('afterend', stopExportBtn);
    
    this.stopExporting = false;
    const zip = new JSZip();
    let imageCount = 0;
    
    // Backup current state to restore later
    const originalKey = this.fretboard.currentKey;
    const originalType = this.fretboard.currentPatternType;
    const originalPattern = this.fretboard.currentPattern;

    try {
        for (let i = 0; i < this.generatedPatterns.length; i++) {
            if (this.stopExporting) break;
            const pattern = this.generatedPatterns[i];
            exportBtn.textContent = `Rendering ${i+1}/${this.generatedPatterns.length}...`;
            
            // Update app state for rendering
            this.fretboard.updatePattern(pattern.key, pattern.patternType, pattern.pattern);
            this.updateTheoryInfo(pattern.key, pattern.patternType, pattern.pattern);
            
            // Yield for DOM updates
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            const imageData = await Exporter.getFretboardImageBase64(this);
            const safeName = (pattern.name || pattern.pattern).replace(/\s+/g, '_').replace(/[^\w-]/g, '');
            const filename = `gen_${pattern.key}_${pattern.patternType}_${safeName}.jpg`;
            
            zip.file(filename, imageData, {base64: true});
            imageCount++;

            // Throttle to keep UI responsive
            if (i % 10 === 0) await new Promise(r => setTimeout(r, 0));
        }
        
        if (!this.stopExporting && imageCount > 0) {
            exportBtn.textContent = 'Generating ZIP...';
            const content = await zip.generateAsync({type: "blob"});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `generated_patterns_${this.generatedPatterns[0].patternType}.zip`;
            link.click();
        }
    } catch (err) {
        console.error('Batch export failed:', err);
        alert('Export failed: ' + err.message);
    } finally {
        // Restore state
        this.fretboard.updatePattern(originalKey, originalType, originalPattern);
        this.updateTheoryInfo(originalKey, originalType, originalPattern);
        
        if (stopExportBtn.parentNode) stopExportBtn.parentNode.removeChild(stopExportBtn);
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
        
        if (this.stopExporting) alert(`Export stopped after ${imageCount} items.`);
        else if (imageCount > 0) alert(`Exported ${imageCount} patterns to ZIP.`);
    }
};

App.prototype.exportAllGeneratedWithInfo = async function() {
    // We leverage the same logic as exportAllGenerated because getFretboardImageBase64 
    // now reads the "export-include-info" checkbox directly. 
    // This method ensures the checkbox is checked before starting the ZIP process.
    const includeInfoCheckbox = document.getElementById('export-include-info');
    const originalChecked = includeInfoCheckbox ? includeInfoCheckbox.checked : false;
    
    if (includeInfoCheckbox) includeInfoCheckbox.checked = true;
    await this.exportAllGenerated();
    if (includeInfoCheckbox) includeInfoCheckbox.checked = originalChecked;
};