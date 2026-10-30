/**
 * Slideshow CSV I/O Extension
 */
if (typeof App !== 'undefined') {
    /**
     * Generate and download a CSV containing every pattern permutation available in the app.
     */
    App.prototype.downloadSlideshowTemplate = function() {
        const keys = this.musicTheory.notes;
        const types = ['scale', 'chord', 'interval', 'gamut'];
        let csvContent = "Key,PatternType,PatternID,FriendlyName\n";
        
        types.forEach(type => {
            let patterns = {};
            if (type === 'scale') patterns = this.musicTheory.scales;
            else if (type === 'chord') patterns = this.musicTheory.chords;
            else if (type === 'interval') patterns = this.musicTheory.intervals;
            else if (type === 'gamut') patterns = this.musicTheory.gamuts;
            
            Object.entries(patterns).forEach(([id, data]) => {
                keys.forEach(key => {
                    const name = (data.name || id).replace(/"/g, '""');
                    csvContent += `${key},${type},${id},"${name}"\n`;
                });
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "scales_thesaurus_all_patterns.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /**
     * Export the current slideshow items to a CSV file.
     */
    App.prototype.exportSlideshowCSV = function() {
        if (this.slideshowItems.length === 0) {
            alert('Slideshow is empty.');
            return;
        }
        let csvContent = "Key,PatternType,PatternID\n";
        this.slideshowItems.forEach(item => {
            csvContent += `${item.info.key},${item.info.patternType},${item.info.pattern}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "my_slideshow_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /**
     * Import items into the slideshow from a CSV file.
     */
    App.prototype.importSlideshowFromCSV = function(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split(/\r?\n/);
            if (lines.length < 2) return;

            const header = lines[0].split(',').map(h => h.trim().toLowerCase());
            const keyIdx = header.indexOf('key');
            const typeIdx = header.indexOf('patterntype');
            const idIdx = header.indexOf('patternid');

            if (keyIdx === -1 || typeIdx === -1 || idIdx === -1) {
                alert('Invalid CSV format. Header must contain "Key", "PatternType", and "PatternID" columns.');
                reader.onerror = null;
                return;
            }

            let importedCount = 0;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                // CSV row parser with quote support
                const row = [];
                let inQuotes = false;
                let current = '';
                for (let char of line) {
                    if (char === '"') inQuotes = !inQuotes;
                    else if (char === ',' && !inQuotes) {
                        row.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                row.push(current.trim());

                if (row.length <= Math.max(keyIdx, typeIdx, idIdx)) continue;

                const key = row[keyIdx];
                const type = row[typeIdx];
                const id = row[idIdx].replace(/^"|"$/g, '');

                if (key && type && id) {
                    this.slideshowItems.push({
                        info: {
                            key: key,
                            patternType: type,
                            pattern: id,
                            tuning: this.fretboard.settings.tuning.join('-')
                        },
                        filename: `${this.fretboard.settings.tuning.join('-')}-${key}-${type}-${id}.jpg`,
                        element: { innerHTML: '' }
                    });
                    importedCount++;
                }
            }
            this.updateSlideshowDisplay();
            alert(`Imported ${importedCount} items to slideshow.`);
        };
        reader.readAsText(file);
    };
}