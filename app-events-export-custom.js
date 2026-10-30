/**
 * Custom Pattern Export/Import Event Listeners
 */
if (typeof App !== 'undefined') {
    App.prototype.setupExportEventsCustom = function() {
        document.getElementById('btn-add-all-to-custom')?.addEventListener('click', () => {
            if (!confirm('This will copy all built-in scales, chords, and intervals into Custom Patterns. Proceed?')) return;
            
            this.musicTheory.customPatterns = this.musicTheory.customPatterns || {};
            let addedCount = 0;
            
            const invMapping = {'1':'0', 'b2':'1', '2':'2', '#2':'3', 'b3':'3', '3':'4', 'b4':'4', '4':'5', '#4':'6', 'b5':'6', '5':'7', '#5':'8', 'b6':'8', '6':'9', '#6':'A', 'b7':'A', '7':'B'};
            const getSemitonesStr = (arr) => arr.map(i => invMapping[i] || '?').join('');

            Object.entries(this.musicTheory.scales).forEach(([id, data]) => {
                const customId = `scale_${id}`;
                if (!this.musicTheory.customPatterns[customId]) {
                    this.musicTheory.customPatterns[customId] = {
                        name: `Scale: ${data.name}`,
                        intervals: [...data.intervals],
                        semitonesStr: getSemitonesStr(data.intervals)
                    };
                    addedCount++;
                }
            });

            Object.entries(this.musicTheory.chords).forEach(([id, data]) => {
                const customId = `chord_${id}`;
                if (!this.musicTheory.customPatterns[customId]) {
                    this.musicTheory.customPatterns[customId] = {
                        name: `Chord: ${data.name}`,
                        intervals: [...data.intervals],
                        semitonesStr: getSemitonesStr(data.intervals)
                    };
                    addedCount++;
                }
            });

            Object.entries(this.musicTheory.intervals).forEach(([id, data]) => {
                const customId = `interval_${id.replace('#', 'sharp')}`;
                if (!this.musicTheory.customPatterns[customId]) {
                    const ints = ['1', id];
                    this.musicTheory.customPatterns[customId] = {
                        name: `Interval: ${data.name}`,
                        intervals: ints,
                        semitonesStr: getSemitonesStr(ints)
                    };
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                writeAppStorage('customPatterns', JSON.stringify(this.musicTheory.customPatterns));
                
                const pType = document.getElementById('pattern-type');
                if (pType && pType.value !== 'custom') {
                    pType.value = 'custom';
                    pType.dispatchEvent(new Event('change'));
                } else {
                    this.updatePatternSelect();
                    this.updateFretboard();
                    this.updateTheoryInfo();
                }
                
                alert(`Added ${addedCount} built-in patterns to Custom Patterns.`);
            } else {
                alert('All built-in patterns are already in Custom Patterns.');
            }
        });

        document.getElementById('btn-import-custom')?.addEventListener('click', () => {
            const input = document.getElementById('custom-pattern-import').value;
            if (!input || !input.includes('|')) return alert('Invalid format. Use: Name | 0123456789AB');
            const parts = input.split('|').map(s => s.trim());
            const name = parts[0];
            const chrStr = parts[1].toUpperCase();
            const mapping = {'0':'1', '1':'b2', '2':'2', '3':'b3', '4':'3', '5':'4', '6':'b5', '7':'5', '8':'b6', '9':'6', 'A':'b7', 'B':'7'};
            const intervals = [...chrStr].map(c => mapping[c]).filter(Boolean);
            if (intervals.length === 0) return alert('No valid intervals found in string.');
            
            const id = 'custom_' + Date.now();
            this.musicTheory.customPatterns = this.musicTheory.customPatterns || {};
            this.musicTheory.customPatterns[id] = { name, intervals, semitonesStr: chrStr };
            writeAppStorage('customPatterns', JSON.stringify(this.musicTheory.customPatterns));
            
            document.getElementById('custom-pattern-import').value = '';
            
            const pType = document.getElementById('pattern-type');
            if (pType && pType.value !== 'custom') {
                pType.value = 'custom';
                pType.dispatchEvent(new Event('change'));
            } else {
                this.updatePatternSelect();
            }
            
            const pSelect = document.getElementById('pattern-select');
            if (pSelect) pSelect.value = id;
            
            this.updateFretboard();
            this.updateTheoryInfo();
            alert(`Imported custom pattern: ${name}`);
        });

        document.getElementById('import-custom-csv')?.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target.result;
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                if (lines.length === 0) {
                    alert('CSV is empty or not readable.');
                    e.target.value = '';
                    return;
                }
                const mapping = {'0':'1', '1':'b2', '2':'2', '3':'b3', '4':'3', '5':'4', '6':'b5', '7':'5', '8':'b6', '9':'6', 'A':'b7', 'B':'7'};
                this.musicTheory.customPatterns = this.musicTheory.customPatterns || {};
                let added = 0, skipped = 0;
                for (const row of lines) {
                    let parts = row.split(',');
                    if (parts.length < 2) parts = row.split('|');
                    if (parts.length < 2) {
                        skipped++; continue;
                    }
                    const name = parts[0].replace(/^"|"$/g, '').trim();
                    const pat = parts[1].replace(/^"|"$/g, '').trim().toUpperCase();
                    const intervals = [...pat].map(c => mapping[c]).filter(Boolean);
                    if (!name || intervals.length === 0) { skipped++; continue; }
                    const id = 'custom_' + Date.now() + '_' + Math.floor(Math.random()*1000);
                    this.musicTheory.customPatterns[id] = { name, intervals, semitonesStr: pat };
                    added++;
                }
                if (added > 0) {
                    writeAppStorage('customPatterns', JSON.stringify(this.musicTheory.customPatterns));
                    const pType = document.getElementById('pattern-type');
                    if (pType && pType.value !== 'custom') {
                        pType.value = 'custom';
                        pType.dispatchEvent(new Event('change'));
                    } else {
                        this.updatePatternSelect();
                        this.updateFretboard();
                        this.updateTheoryInfo();
                    }
                }
                alert(`Imported ${added} custom pattern(s). ${skipped} row(s) skipped.`);
                e.target.value = '';
            };
            reader.onerror = () => {
                alert('Failed to read CSV file.');
                e.target.value = '';
            };
            reader.readAsText(file);
        });
    };
}