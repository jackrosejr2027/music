/**
 * UI Bottom Controls - Export Section (consolidated dropdown + Play)
 */
if (typeof App !== 'undefined') {
    App.prototype.getExportFooterHtml = function() {
        return `
        <footer id="export-footer" class="bottom-footer export-footer" style="display: none;">
            <fieldset class="export-control-section">
                <legend>Choose what to export</legend>
            <div class="export-action-row">
                <label for="export-action-select" style="font-weight:700;white-space:nowrap;">Format and scope:</label>
                <select id="export-action-select" aria-describedby="export-action-help" style="min-width:300px;">
                    <option value="">Choose an export...</option>

                    <optgroup label="PDF: selected diagram, slideshow or collections">
                        <option value="pdf-current">PDF: Selected diagram</option>
                        <option value="pdf-current-all-keys">PDF: Selected pattern in 12 keys (not 17 spellings)</option>
                        <option value="pdf-slideshow">PDF: Slideshow (1 page per item)</option>
                        <option value="pdf-all-intervals">PDF: All Intervals (current key)</option>
                        <option value="pdf-all-chords">PDF: All Chords (current key)</option>
                        <option value="pdf-all-scales">PDF: All Scales (current key)</option>
                        <option value="pdf-all-custom">PDF: All Custom Patterns (current key)</option>
                        <option value="pdf-all-diagrams-scales">PDF: All Diagrams / All Scales (current key only)</option>
                        <option value="pdf-all-diagrams-intervals">PDF: All Diagrams / All Intervals (current key only)</option>
                        <option value="pdf-all-diagrams-chords">PDF: All Diagrams / All Chords (current key only)</option>
                    </optgroup>

                    <optgroup label="Images: selected diagram or slideshow">
                        <option value="export-current-diagram-bottom">JPG: Selected diagram</option>
                        <option value="png-current">PNG: Selected diagram (high resolution)</option>
                        <option value="images-slideshow">JPG: Each saved slideshow item</option>
                    </optgroup>

                    <optgroup label="ZIP packages: multiple files">
                        <option value="all-keys-package">All Keys: Selected Type/Selection (PDF, DOCX, XLSX, JPG, PNG ZIP)</option>
                        <option value="save-scales-zip">Save All Scales as ZIP</option>
                        <option value="midi-all-patterns-zip">MIDI: All Patterns (all keys)</option>
                        <option value="save-chords-zip">Save All Chords as ZIP</option>
                        <option value="save-intervals-zip">Save All Intervals as ZIP</option>
                        <option value="save-all-combined-zip">Save All (Intervals+Chords+Scales) as ZIP</option>
                        <option value="save-gamuts-zip">Save All Gamuts as ZIP</option>
                        <option value="save-intervals-circle-zip">Save All Intervals Through Circle of Fifths as ZIP</option>
                        <option value="save-scales-circle-zip">Save All Scales Through Circle of Fifths as ZIP</option>
                        <option value="save-chords-circle-zip">Save All Chords Through Circle of Fifths as ZIP</option>
                        <option value="save-scales-all-strings-zip">Save All Scales (1-Max) ZIP</option>
                        <option value="save-chords-all-strings-zip">Save All Chords (1-Max) ZIP</option>
                        <option value="save-intervals-all-strings-zip">Save All Intervals (1-Max) ZIP</option>
                    </optgroup>

                    <optgroup label="Word: libraries and layout variants">
                        <option value="save-all-combined-word">Save All to Word Document</option>
                        <option value="save-all-combined-word-v2">Save All to Word Doc V2 (2 spans)</option>
                        <option value="save-all-combined-word-v3">Save All to Word Doc V3 (Title, TOC, About)</option>
                        <option value="save-all-combined-word-v4">Save All to Word Doc V4 (All Span Presets)</option>
                        <option value="save-all-combined-word-v6">Save All to Word Doc V6 (All Spans, No About)</option>
                        <option value="save-all-combined-word-v7">Save All to Word Doc V7 (Minimalist)</option>
                        <option value="save-all-combined-word-v8">Save All to Word Doc V8 (Theory Focus)</option>
                        <option value="save-all-combined-word-v9">Save All to Word Doc V9 (Dark Mode Forced)</option>
                        <option value="save-all-combined-word-v10">Save All to Word Doc V10 (Lefty View)</option>
                        <option value="save-all-combined-word-v11">Save All to Word Doc V11 (Notes Mode)</option>
                        <option value="save-all-combined-word-v12">Save All to Word Doc V12 (Intervals Mode)</option>
                        <option value="save-all-combined-word-v13">Save All to Word Doc V13 (Roman Mode)</option>
                        <option value="save-all-combined-word-v14">Save All to Word Doc V14 (Solfege Mode)</option>
                        <option value="save-all-combined-word-v15">Save All to Word Doc V15 (High Contrast)</option>
                        <option value="save-all-combined-word-v16">Save All to Word Doc V16 (Blueprint Style)</option>
                        <option value="save-all-slideshow-word-v5">Save Slideshow to Word Doc V5 (All Spans)</option>
                        <option value="save-all-patterns-word">Save All Patterns (pattern → all keys) to Word</option>
                        <option value="save-all-patterns-circle-word">Save All Patterns (Circle of Fifths) to Word</option>
                        <option value="save-all-patterns-circle-word-v2">Save All Patterns (Circle of Fifths) to Word V2 (1 Doc/Pattern)</option>
                        <option value="save-custom-patterns-circle-word">Save Custom Patterns (Circle of Fifths) to Word</option>
                        <option value="save-intervals-circle-word">Save Intervals (Circle of Fifths) to Word</option>
                        <option value="save-scales-circle-word">Save Scales (Circle of Fifths) to Word</option>
                        <option value="save-chords-circle-word">Save Chords (Circle of Fifths) to Word</option>
                        <option value="save-gamuts-circle-word">Save Gamuts (Circle of Fifths) to Word</option>
                    </optgroup>

                    <optgroup label="Word: custom library and theory pages">
                        <option value="save-all-custom-word">Save All Custom Patterns to Word Doc</option>
                        <option value="export-info-pages-word">Export Theory & Info Pages to Word</option>
                    </optgroup>
                </select>

                <button id="export-play-button" style="padding:8px 14px;background:var(--primary-color);color:#fff;border-radius:6px;border:none;cursor:pointer;font-weight:700;">
                    Create export
                </button>

                <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
                    <button id="export-legacy-show" aria-expanded="false" aria-controls="export-legacy-buttons" style="background:transparent;border:1px solid var(--border-color);padding:6px 8px;border-radius:6px;">Show older direct-export buttons</button>
                </div>
            </div>

            <p id="export-action-help" class="export-action-help" role="status" aria-live="polite">Choose an action to see its output, diagram scope and requirements. Nothing is exported until you choose Create export.</p>
            <p class="export-control-help">Selected diagram means the current editor in Instrument. Large library exports can take time and memory. Stop is cooperative: the All Keys package is cancelled, PDF collections may save completed pages, and other exporters may cancel or keep partial results.</p>
            </fieldset>

            <fieldset class="export-control-section">
            <legend>Diagram label preferences</legend>
            <p class="export-control-help">These saved fields describe detailed image labels. The title prompt takes precedence: OK currently uses a simple key/pattern label; Cancel omits image titles. These preferences do not remove document metadata, theory details or spreadsheet cells.</p>
            <div class="export-label-fields" style="display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;width:100%;margin-top:8px;font-size:0.9em;">
                <span style="font-weight:700;" title="Saved preferences for detailed image labels">Detailed label fields:</span>
                ${(() => { const lf = (typeof Exporter !== 'undefined' && Exporter.labelFields) ? Exporter.labelFields() : {};
                    return [['instrument','Instrument'],['tuning','Tuning'],['key','Key'],['type','Type'],['name','Name'],['formula','Formula']]
                        .map(([k, t]) => '<label style="display:flex;align-items:center;gap:4px;margin:0;cursor:pointer;"><input type="checkbox" data-label-field="' + k + '"' + (lf[k] === false ? '' : ' checked') + ' style="width:auto;margin:0;">' + t + '</label>').join(''); })()}
                <span style="opacity:0.65;">(saved on this device; export title choice takes precedence)</span>
            </div>

            </fieldset>

            <p id="midi-zip-status" role="status" aria-live="polite" style="width:100%;margin:0;"></p>
            <div id="export-legacy-buttons" style="display:none;margin-top:12px;flex-wrap:wrap;gap:8px;">
                <!-- Legacy buttons are preserved but hidden by default so existing listeners still find them -->
                <button id="save-scales-zip" style="display:none;">Save All Scales as ZIP</button>
                <button id="save-chords-zip" style="display:none;">Save All Chords as ZIP</button>
                <button id="save-intervals-zip" style="display:none;">Save All Intervals as ZIP</button>
                <button id="save-all-combined-zip" style="display:none;">Save All (Intervals+Chords+Scales) as ZIP</button>
                <button id="save-all-combined-word" style="display:none;">Save All to Word Document</button>
                <button id="save-all-combined-word-v2" style="display:none;">Save All to Word Doc V2 (2 spans)</button>
                <button id="save-all-combined-word-v3" style="display:none;">Save All to Word Doc V3</button>
                <button id="save-all-combined-word-v4" style="display:none;">Save All to Word Doc V4</button>
                <button id="save-all-slideshow-word-v5" style="display:none;">Save Slideshow to Word Doc V5</button>
                <button id="save-all-combined-word-v6" style="display:none;">Save All to Word Doc V6</button>
                <button id="save-all-custom-word" style="display:none;">Save All Custom Patterns to Word Doc</button>
                <button id="save-custom-patterns-circle-word" style="display:none;">Save Custom Patterns (CoF) to Word</button>
                <button id="save-all-patterns-word" style="display:none;">Save All Patterns to Word</button>
                <button id="save-intervals-circle-word" style="display:none;">Save Intervals (CoF) to Word</button>
                <button id="save-scales-circle-word" style="display:none;">Save Scales (CoF) to Word</button>
                <button id="save-all-patterns-circle-word" style="display:none;">Save All Patterns (CoF) to Word</button>
                <button id="save-all-patterns-circle-word-v2" style="display:none;">Save All Patterns (CoF) V2</button>
                <button id="save-chords-circle-word" style="display:none;">Save Chords (CoF) to Word</button>
                <button id="export-info-pages-word" style="display:none;">Export Theory & Info Pages to Word</button>
                <button id="save-gamuts-zip" style="display:none;">Save All Gamuts as ZIP</button>
                <button id="save-scales-all-strings-zip" style="display:none;">JPG ZIP: All scales, 1 to maximum strings</button>
                <button id="save-chords-all-strings-zip" style="display:none;">JPG ZIP: All chords, 1 to maximum strings</button>
                <button id="save-intervals-all-strings-zip" style="display:none;">JPG ZIP: All intervals, 1 to maximum strings</button>
                <button id="save-intervals-circle-zip" style="display:none;">Save Intervals Through Circle of Fifths as ZIP</button>
                <button id="save-scales-circle-zip" style="display:none;">Save Scales Through Circle of Fifths as ZIP</button>
                <button id="save-chords-circle-zip" style="display:none;">Save Chords Through Circle of Fifths as ZIP</button>
                <button id="save-gamuts-circle-word" style="display:none;">Save Gamuts (CoF) to Word</button>
                <button id="export-current-diagram-bottom" style="display:none;">Export Current Diagram</button>
            </div>
        </footer>
        `;
    };

    App.prototype.getExportActionDescription = function(action) {
        const exact = {
            'all-keys-package':'ZIP containing 37 files: a 17-page PDF, a 17-diagram DOCX, an XLSX with 17 illustrated key sheets, 17 JPGs and 17 PNGs. Uses only the selected Type/Selection, in circle-of-fifths order from C, with separate sharp/flat spellings. Requires Instrument > All Keys; snapshots preserve live diagrams.',
            'pdf-current':'One PDF page of the selected diagram, with its current key/pattern and theory details.',
            'pdf-current-all-keys':'One PDF of the selected pattern transposed through 12 pitch classes, using the selected diagram setup. Does not create the separate enharmonic diagrams in the 17-key package.',
            'pdf-slideshow':'One PDF with one page per saved slideshow item. Requires a nonempty slideshow.',
            'export-current-diagram-bottom':'One JPG image of the selected diagram. Uses its current tuning, key, pattern and appearance.',
            'png-current':'One high-resolution PNG image of the selected diagram. Uses its current tuning, key, pattern and appearance.',
            'images-slideshow':'Separate JPG downloads for saved slideshow items, not a ZIP. Requires a nonempty slideshow; your browser may ask to allow multiple downloads.',
            'save-gamuts-zip':'ZIP of JPG diagrams for all Gamut position patterns on the selected board setup, with a fret window fitted to each shape. Gamut positions are fret/string shapes, not a 17-key transposition package.',
            'midi-all-patterns-zip':'ZIP of individual MIDI files for intervals, chords, scales and saved custom patterns in all 12 pitch classes, plus a combined MIDI and README. Contains musical data, not diagram images.',
            'save-all-combined-zip':'ZIP of JPG diagrams for every interval, chord and scale across all 12 pitch classes, using the selected board setup.',
            'save-all-combined-word':'One DOCX library of every interval, chord and scale across all 12 pitch classes, using the selected board setup.',
            'save-all-combined-word-v2':'One DOCX library with two fretspan views per pattern. A follow-up prompt chooses keys.',
            'save-all-combined-word-v3':'One DOCX library with a title, contents overview and pattern explanations. A follow-up prompt chooses keys.',
            'save-all-combined-word-v4':'One DOCX library rendered through all fretspan presets, with a contents overview. A follow-up prompt chooses keys. This can be very large.',
            'save-all-combined-word-v6':'One DOCX library rendered through all fretspan presets, without About descriptions. A follow-up prompt chooses keys. This can be very large.',
            'save-all-slideshow-word-v5':'One DOCX of saved slideshow items, rendered through all fretspan presets. Requires saved slides; this can be very large.',
            'save-all-patterns-word':'One DOCX organized pattern by pattern, with each interval, chord and scale across all 12 pitch classes.',
            'save-all-patterns-circle-word':'One DOCX of intervals, chords and scales, ordered pattern by pattern through the 12-key circle of fifths.',
            'save-all-patterns-circle-word-v2':'One ZIP containing a separate DOCX per pattern, each covering the 12-key circle of fifths. Not the 17-spelling All Keys package.',
            'save-all-custom-word':'One DOCX of saved custom patterns. A follow-up prompt chooses keys. Requires saved custom patterns.',
            'export-info-pages-word':'One Word theory/reference document. This is reference content, not an export of the visible multi-diagram set.'
        };
        if (exact[action]) return exact[action];
        const category = /interval/.test(action) ? 'intervals' : /chord/.test(action) ? 'chords' : /scale/.test(action) ? 'scales' : /gamut/.test(action) ? 'Gamuts' : 'custom patterns';
        if (action.startsWith('pdf-all-diagrams-')) return 'One PDF covering every ' + category.slice(0,-1) + ' on every configured diagram. Uses only the selected editor key for all pages, not each board key. One page per pattern/diagram pair; snapshots preserve the live set.';
        if (action.startsWith('pdf-all-')) return 'One PDF of all ' + category + ' in the selected key, using the selected diagram setup. This is a category collection, not just the selected pattern.';
        if (action.endsWith('-all-strings-zip')) return 'ZIP of JPGs for all ' + category + ' across 12 pitch classes and every string count from 1 to the current maximum. Uses default tunings for each count, not the configured multi-diagram set. This can be very large.';
        if (action.endsWith('-circle-zip')) return 'ZIP of JPGs for all ' + category + ' through the 12-key circle of fifths, using the selected board setup. Separate enharmonic spellings are not included.';
        if (action.endsWith('-circle-word')) return 'One DOCX of all ' + category + ' through the 12-key circle of fifths. Custom-pattern exports require a saved custom library. Not the 17-spelling All Keys package.';
        if (action.endsWith('-zip')) return 'ZIP of JPG diagrams for all ' + category + ' across all 12 pitch classes, using the selected board setup.';
        const variants = { v7:'minimalist',v8:'theory-focused',v9:'dark theme',v10:'reversed string order',v11:'note-name labels',v12:'interval labels',v13:'Roman numeral labels',v14:'solfege labels',v15:'high contrast',v16:'blueprint style' };
        const variant = action.match(/-word-(v\d+)$/)?.[1];
        if (variants[variant]) return 'One DOCX library of intervals, chords and scales using the ' + variants[variant] + ' variant. A follow-up prompt chooses the current key, entered keys or all 12 pitch classes.';
        return 'Choose an action to see its output, diagram scope and requirements. Nothing is exported until you choose Create export.';
    };

    App.prototype.setupExportGuide = function() {
        const select = document.getElementById('export-action-select');
        const help = document.getElementById('export-action-help');
        if (!select || !help) return;
        const update = () => { help.textContent = this.getExportActionDescription(select.value); };
        select.addEventListener('change', update);
        update();
    };

}