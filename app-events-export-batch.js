/**
 * Batch Export Event Listeners (ZIP & Word Docs)
 */
if (typeof App !== 'undefined') {
    App.prototype.setupExportEventsBatch = function() {
        this.setupExportGuide();
        document.getElementById('save-all-scales')?.addEventListener('click', () => this.exportAllScalesForAllKeys && this.exportAllScalesForAllKeys());
        document.getElementById('save-all-chords')?.addEventListener('click', () => this.exportAllChordsForAllKeys && this.exportAllChordsForAllKeys());
        document.getElementById('save-all-intervals')?.addEventListener('click', () => this.exportAllIntervalsForAllKeys && this.exportAllIntervalsForAllKeys());
        
        document.getElementById('save-scales-zip')?.addEventListener('click', () => Exporter.exportAllScalesToZip(this));
        document.getElementById('save-chords-zip')?.addEventListener('click', () => Exporter.exportAllChordsToZip(this));
        document.getElementById('save-intervals-zip')?.addEventListener('click', () => Exporter.exportAllIntervalsToZip(this));
        document.getElementById('save-all-combined-zip')?.addEventListener('click', () => Exporter.exportAllCombinedToZip(this));
        document.getElementById('save-all-combined-word')?.addEventListener('click', () => Exporter.exportAllCombinedToWord(this));
        document.getElementById('save-all-combined-word-v2')?.addEventListener('click', () => Exporter.exportAllCombinedToWordV2(this));
        document.getElementById('save-all-combined-word-v3')?.addEventListener('click', () => Exporter.exportAllCombinedToWordV3(this));
        document.getElementById('save-all-combined-word-v4')?.addEventListener('click', () => Exporter.exportAllCombinedToWordV4(this));
        document.getElementById('save-all-slideshow-word-v5')?.addEventListener('click', () => Exporter.exportAllSlideshowToWordV5(this));
        document.getElementById('save-all-combined-word-v6')?.addEventListener('click', () => Exporter.exportAllCombinedToWordV6(this));
        document.getElementById('save-all-combined-word-v7')?.addEventListener('click', () => Exporter.exportV7Minimalist(this));
        document.getElementById('save-all-combined-word-v8')?.addEventListener('click', () => Exporter.exportV8Theory(this));
        document.getElementById('save-all-combined-word-v9')?.addEventListener('click', () => Exporter.exportV9Dark(this));
        document.getElementById('save-all-combined-word-v10')?.addEventListener('click', () => Exporter.exportV10Lefty(this));
        document.getElementById('save-all-combined-word-v11')?.addEventListener('click', () => Exporter.exportV11Notes(this));
        document.getElementById('save-all-combined-word-v12')?.addEventListener('click', () => Exporter.exportV12Intervals(this));
        document.getElementById('save-all-combined-word-v13')?.addEventListener('click', () => Exporter.exportV13Roman(this));
        document.getElementById('save-all-combined-word-v14')?.addEventListener('click', () => Exporter.exportV14Solfege(this));
        document.getElementById('save-all-combined-word-v15')?.addEventListener('click', () => Exporter.exportV15HighContrast(this));
        document.getElementById('save-all-combined-word-v16')?.addEventListener('click', () => Exporter.exportV16Blueprint(this));
        document.getElementById('save-all-custom-word')?.addEventListener('click', () => Exporter.exportAllCustomToWord(this));
        document.getElementById('save-all-patterns-word')?.addEventListener('click', () => Exporter.exportAllPatternsAllKeysToWord(this));
        document.getElementById('save-intervals-circle-word')?.addEventListener('click', () => Exporter.exportAllIntervalsCircleOfFifthsToWord(this));
        document.getElementById('save-scales-circle-word')?.addEventListener('click', () => Exporter.exportAllScalesCircleOfFifthsToWord(this));
        document.getElementById('save-all-patterns-circle-word')?.addEventListener('click', () => Exporter.exportAllPatternsCircleOfFifthsToWord(this));
        document.getElementById('save-all-patterns-circle-word-v2')?.addEventListener('click', () => Exporter.exportAllPatternsCircleOfFifthsToWordV2(this));
        document.getElementById('save-chords-circle-word')?.addEventListener('click', () => Exporter.exportAllChordsCircleOfFifthsToWord(this));
        document.getElementById('export-info-pages-word')?.addEventListener('click', () => Exporter.exportInfoPagesToWord(this));
        
        const saveGamutsZip = () => Exporter.exportAllGamutsToZip(this);
        document.getElementById('save-gamuts-zip')?.addEventListener('click', saveGamutsZip);
        document.getElementById('save-gamuts-sidebar-zip')?.addEventListener('click', saveGamutsZip);
        document.getElementById('save-gamuts-circle-word')?.addEventListener('click', () => Exporter.exportAllGamutsCircleOfFifthsToWord(this));
        document.getElementById('save-custom-patterns-circle-word')?.addEventListener('click', () => Exporter.exportAllCustomCircleOfFifthsToWord(this));

        // Consolidated export dropdown Play handler
        document.getElementById('export-play-button')?.addEventListener('click', async () => {
            const sel = document.getElementById('export-action-select');
            if (!sel) { alert('Export action selector not found.'); return; }
            const action = sel.value;
            if (!action) { alert('Please select an export action from the dropdown.'); return; }

            const playBtn = document.getElementById('export-play-button');
            const origText = playBtn ? playBtn.textContent : 'Play';
            if (playBtn) { playBtn.disabled = true; playBtn.textContent = 'Preparing export...'; }
            // v1.0 fix: exporters attach their Stop button next to hidden legacy buttons, so it was
            // invisible when run from this dropdown. Provide a visible Stop button for every action.
            let stopBtn = document.getElementById('export-stop-button');
            if (!stopBtn && playBtn) {
                stopBtn = document.createElement('button');
                stopBtn.id = 'export-stop-button';
                stopBtn.type = 'button';
                stopBtn.textContent = 'Stop export';
                stopBtn.style.cssText = 'padding:8px 14px;background:#e74c3c;color:#fff;border-radius:6px;border:none;cursor:pointer;font-weight:700;';
                stopBtn.addEventListener('click', () => { this.stopExporting = true; stopBtn.disabled = true; stopBtn.textContent = 'Stopping...'; });
                playBtn.insertAdjacentElement('afterend', stopBtn);
            }

            try {
                switch (action) {
                    case 'all-keys-package': await Exporter.exportAllKeysPackage(this); break;
                    case 'pdf-current': await Exporter.exportCurrentDiagramPDF(this); break;
                    case 'pdf-current-all-keys': await Exporter.exportCurrentPatternAllKeysPDF(this); break;
                    case 'pdf-slideshow': await Exporter.exportSlideshowPDF(this); break;
                    case 'pdf-all-intervals': await Exporter.exportPatternTypePDF(this, 'interval'); break;
                    case 'pdf-all-chords': await Exporter.exportPatternTypePDF(this, 'chord'); break;
                    case 'pdf-all-scales': await Exporter.exportPatternTypePDF(this, 'scale'); break;
                    case 'pdf-all-custom': await Exporter.exportPatternTypePDF(this, 'custom'); break;
                    case 'pdf-all-diagrams-scales': await Exporter.exportAllDiagramsPatternTypePDF(this, 'scale'); break;
                    case 'pdf-all-diagrams-intervals': await Exporter.exportAllDiagramsPatternTypePDF(this, 'interval'); break;
                    case 'pdf-all-diagrams-chords': await Exporter.exportAllDiagramsPatternTypePDF(this, 'chord'); break;
                    case 'png-current': await Exporter.exportCurrentDiagramPNG(this); break;
                    case 'images-slideshow': await this.exportAll(); break;
                    case 'save-scales-zip': await Exporter.exportAllScalesToZip(this); break;
                    case 'save-chords-zip': await Exporter.exportAllChordsToZip(this); break;
                    case 'save-intervals-zip': await Exporter.exportAllIntervalsToZip(this); break;
                    case 'save-all-combined-zip': await Exporter.exportAllCombinedToZip(this); break;
                    case 'save-gamuts-zip': await Exporter.exportAllGamutsToZip(this); break;
                    case 'midi-all-patterns-zip': await Exporter.exportAllPatternsToMidiZip(this); break;
                    case 'save-intervals-circle-zip': await Exporter.exportAllIntervalsCircleOfFifthsToZip(this); break;
                    case 'save-scales-circle-zip': await Exporter.exportAllScalesCircleOfFifthsToZip(this); break;
                    case 'save-chords-circle-zip': await Exporter.exportAllChordsCircleOfFifthsToZip(this); break;
                    case 'save-scales-all-strings-zip': await Exporter.exportAllPatternsForAllStringCountsToZip(this, 'scale', 'all_scales_all_strings.zip'); break;
                    case 'save-chords-all-strings-zip': await Exporter.exportAllPatternsForAllStringCountsToZip(this, 'chord', 'all_chords_all_strings.zip'); break;
                    case 'save-intervals-all-strings-zip': await Exporter.exportAllPatternsForAllStringCountsToZip(this, 'interval', 'all_intervals_all_strings.zip'); break;

                    case 'save-all-combined-word': await Exporter.exportAllCombinedToWord(this); break;
                    case 'save-all-combined-word-v2': await Exporter.exportAllCombinedToWordV2(this); break;
                    case 'save-all-combined-word-v3': await Exporter.exportAllCombinedToWordV3(this); break;
                    case 'save-all-combined-word-v4': await Exporter.exportAllCombinedToWordV4(this); break;
                    case 'save-all-combined-word-v6': await Exporter.exportAllCombinedToWordV6(this); break;
                    case 'save-all-combined-word-v7': await Exporter.exportV7Minimalist(this); break;
                    case 'save-all-combined-word-v8': await Exporter.exportV8Theory(this); break;
                    case 'save-all-combined-word-v9': await Exporter.exportV9Dark(this); break;
                    case 'save-all-combined-word-v10': await Exporter.exportV10Lefty(this); break;
                    case 'save-all-combined-word-v11': await Exporter.exportV11Notes(this); break;
                    case 'save-all-combined-word-v12': await Exporter.exportV12Intervals(this); break;
                    case 'save-all-combined-word-v13': await Exporter.exportV13Roman(this); break;
                    case 'save-all-combined-word-v14': await Exporter.exportV14Solfege(this); break;
                    case 'save-all-combined-word-v15': await Exporter.exportV15HighContrast(this); break;
                    case 'save-all-combined-word-v16': await Exporter.exportV16Blueprint(this); break;
                    case 'save-all-slideshow-word-v5': await Exporter.exportAllSlideshowToWordV5(this); break;

                    case 'save-all-patterns-word': await Exporter.exportAllPatternsAllKeysToWord(this); break;
                    case 'save-all-patterns-circle-word': await Exporter.exportAllPatternsCircleOfFifthsToWord(this); break;
                    case 'save-all-patterns-circle-word-v2': await Exporter.exportAllPatternsCircleOfFifthsToWordV2(this); break;

                    case 'save-custom-patterns-circle-word': await Exporter.exportAllCustomCircleOfFifthsToWord(this); break;
                    case 'save-intervals-circle-word': await Exporter.exportAllIntervalsCircleOfFifthsToWord(this); break;
                    case 'save-scales-circle-word': await Exporter.exportAllScalesCircleOfFifthsToWord(this); break;
                    case 'save-chords-circle-word': await Exporter.exportAllChordsCircleOfFifthsToWord(this); break;
                    case 'save-gamuts-circle-word': await Exporter.exportAllGamutsCircleOfFifthsToWord(this); break;

                    case 'save-all-custom-word': await Exporter.exportAllCustomToWord(this); break;
                    case 'export-info-pages-word': await Exporter.exportInfoPagesToWord(this); break;
                    case 'export-current-diagram-bottom': await this.exportCurrentDiagram(); break;

                    default:
                        alert('Selected action is not recognized or not implemented.');
                }
            } catch (err) {
                console.error('Export action failed:', err);
                alert('Export action failed: ' + (err && err.message ? err.message : err));
            } finally {
                if (playBtn) { playBtn.disabled = false; playBtn.textContent = origText; }
                const sb = document.getElementById('export-stop-button');
                if (sb) sb.remove();
            }
        });

        document.getElementById('export-legacy-show')?.addEventListener('click', () => {
            const container = document.getElementById('export-legacy-buttons');
            if (!container) return;
            const show = container.style.display === 'none';
            container.style.display = show ? 'flex' : 'none';
            container.querySelectorAll('button').forEach(button => { button.style.display = show ? '' : 'none'; });
            const button = document.getElementById('export-legacy-show');
            button.textContent = show ? 'Hide older direct-export buttons' : 'Show older direct-export buttons';
            button.setAttribute('aria-expanded', String(show));
        });

        document.getElementById('save-scales-all-strings-zip')?.addEventListener('click', () => Exporter.exportAllPatternsForAllStringCountsToZip(this, 'scale', 'all_scales_all_strings.zip'));
        document.getElementById('save-chords-all-strings-zip')?.addEventListener('click', () => Exporter.exportAllPatternsForAllStringCountsToZip(this, 'chord', 'all_chords_all_strings.zip'));
        document.getElementById('save-intervals-all-strings-zip')?.addEventListener('click', () => Exporter.exportAllPatternsForAllStringCountsToZip(this, 'interval', 'all_intervals_all_strings.zip'));

        document.getElementById('save-intervals-circle-zip')?.addEventListener('click', () => Exporter.exportAllIntervalsCircleOfFifthsToZip(this));
        document.getElementById('save-scales-circle-zip')?.addEventListener('click', () => Exporter.exportAllScalesCircleOfFifthsToZip(this));
        document.getElementById('save-chords-circle-zip')?.addEventListener('click', () => Exporter.exportAllChordsCircleOfFifthsToZip(this));
    };
}