/**
 * UI Bottom Controls - Main Controls Section
 */
if (typeof App !== 'undefined') {
    App.prototype.getBottomControlsHtml = function() {
        return `
        <footer id="controls-bottom" class="bottom-footer" style="display: none;">
            <div class="control-group" style="display:none;">
                <label for="key-select">Key:</label>
                <select id="key-select">
                    <option value="C">C</option>
                    <option value="G">G</option>
                    <option value="D">D</option>
                    <option value="A">A</option>
                    <option value="E">E</option>
                    <option value="B">B</option>
                    <option value="F#">F#</option>
                    <option value="C#">C#</option>
                    <option value="F">F</option>
                    <option value="A#">A#</option>
                    <option value="D#">D#</option>
                    <option value="G#">G#</option>
                </select>
            </div>

            <div class="control-group" style="display:flex;align-items:center;gap:10px;">
                <div style="display:flex;align-items:center;gap:8px;" title="Toggle Fret Numbers">
                    <input type="checkbox" id="show-fret-numbers" checked style="display:none;">
                    <label for="show-fret-numbers" id="show-fret-numbers-icon" style="margin:0; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; cursor:pointer; font-weight:bold; user-select:none; font-size:14px; border:1px solid var(--border-color); transition:all 0.2s;">
                        #
                    </label>
                </div>
                <div style="position:relative; width:28px; height:28px;" title="Fret Number Shape">
                    <div id="fret-numbers-shape-display" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color); border-radius:4px; pointer-events:none; font-size:14px; background:transparent; color:var(--text-color);">∅</div>
                    <select id="fret-numbers-shape" style="position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%;">
                        <option value="none" selected>None (Hidden)</option>
                        <option value="pill">Pill</option>
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                    </select>
                </div>
            </div>

            <div class="control-group" style="display:none;">
                <label for="pattern-type">Pattern Type:</label>
                <select id="pattern-type">
                    <option value="scale">Scale</option>
                    <option value="chord">Chord</option>
                    <option value="interval">Interval</option>
                    <option value="gamut">Gamut</option>
                    <option value="grid">Grid (3-Fret Spans)</option>
                    <option value="grid2">Grid (2-Fret Spans)</option>
                    <option value="custom">Custom</option>
                </select>
            </div>

            <div class="control-group" id="custom-pattern-import-group" style="display: none; flex-direction: column; gap: 5px;">
                <label for="custom-pattern-import">Import (Name | 0123456789AB):</label>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <input type="text" id="custom-pattern-import" placeholder="My Pattern | 024579B" style="flex: 1; min-width: 150px;">
                    <button id="btn-import-custom" style="width: auto;">Import</button>
                    <label for="import-custom-csv" style="margin: 0; padding: 0 12px; background: var(--secondary-color); color: #fff; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: normal; font-size: 14px; white-space: nowrap;" title="Import from CSV (Requires 'Name' and 'Pattern' columns)">CSV</label>
                    <input type="file" id="import-custom-csv" accept=".csv" style="display: none;">
                    <button id="btn-add-all-to-custom" style="width: auto; background-color: #f39c12; color: white; padding: 0 10px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; justify-content: center;" title="Add all built-in patterns to custom">All</button>
                    <button id="btn-delete-all-custom" style="width: auto; background-color: #e74c3c; color: white; padding: 0 10px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; justify-content: center;" title="Delete all custom patterns">🗑️</button>
                </div>
            </div>
            
            <div class="control-group" style="display:none;">
                <label for="pattern-select">Pattern:</label>
                <select id="pattern-select">
                    <!-- Options will be populated based on pattern type -->
                </select>
            </div>
            <div class="control-group">
                <label for="start-fret">Start Fret:</label>
                <input type="number" id="start-fret" min="0" max="24" value="0">
            </div>
            <div class="control-group">
                <label for="end-fret">End Fret:</label>
                <input type="number" id="end-fret" min="1" max="24" value="12">
            </div>

            <!-- Capo controls -->
            <div class="control-group" style="display:flex;align-items:center;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;" title="Enable Capo">
                    <input type="checkbox" id="capo-enable" style="display:none;">
                    <label for="capo-enable" id="capo-enable-icon" style="margin:0; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; cursor:pointer; font-weight:bold; user-select:none; font-size:14px; border:1px solid var(--border-color); transition:all 0.2s;">
                        C
                    </label>
                </div>
                <label for="capo-fret" style="margin:0;">Capo Fret:</label>
                <input type="number" id="capo-fret" min="0" max="24" value="0" style="width:70px;">
            </div>
            <div class="control-group">
                <label for="display-mode">Display Mode:</label>
                <select id="display-mode">
                    <option value="intervals">Intervals</option>
                    <option value="notes">Notes</option>
                    <option value="roman">Roman Numerals</option>
                    <option value="solfege">Solfège (Do Re Mi)</option>
                    <option value="none">No Text</option>
                </select>
            </div>
            <div class="control-group">
                <label for="color-theme">Color Theme:</label>
                <select id="color-theme">
                    <option value="default_ii">Default</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
            <div class="control-group">
                <label for="page-theme">Page Theme:</label>
                <select id="page-theme">
                    <!-- Options populated dynamically in app-ui.js -->
                </select>
            </div>
            <div class="control-group">
                <label for="font-size">Base Font Size:</label>
                <select id="font-size">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                </select>
            </div>
            <div class="control-group">
                <label for="slideshow-bpm">Slideshow BPM:</label>
                <input type="number" id="slideshow-bpm" min="10" max="300" value="60" style="width: 60px;">
            </div>
            <div class="control-group">
                <label for="slideshow-loop">Loop:</label>
                <input type="checkbox" id="slideshow-loop" style="width: auto;">
            </div>
            <div class="control-group">
                <label for="slideshow-duration">Duration (measures):</label>
                <input type="number" id="slideshow-duration" min="0.1" step="0.1" value="1" style="width: 60px;">
            </div>
            <div class="control-group">
                 <button id="sidebar-add-to-slideshow">Add to Slideshow</button>
            </div>

            <!-- Moved slideshow export & CSV controls into bottom area -->
            <div class="control-group" style="display:flex;gap:8px;align-items:center;">
                <button id="export-all" title="Export All Slideshow Items" style="background:#000;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">🗂️</button>
                <button id="export-diagrams-only" title="Export Slideshow Diagrams Only" style="background:#000;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">🖼️</button>
                <button id="export-slideshow-pdf" title="Export Slideshow as PDF" style="background:#c0392b;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">📄</button>
                <button id="set-filename" title="Set Filename" style="background:#f39c12;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">✏️</button>
                <button id="clear-slideshow" title="Clear Slideshow" style="background:#e74c3c;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">🗑️</button>
            </div>
            <div class="control-group" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <button id="download-slideshow-template" title="Download Full Template" style="background:#7f8c8d;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">📋</button>
                <button id="export-slideshow-csv" title="Export Current to CSV" style="background:#34495e;color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">📤</button>
                <label for="import-slideshow-csv" title="Import CSV File" style="margin:0;width:32px;height:32px;min-width:32px;cursor:pointer;"><span style="background:var(--secondary-color);color:#fff;padding:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:16px;">📥</span></label>
                <input type="file" id="import-slideshow-csv" accept=".csv" style="display: none;">
            </div>
            <div class="control-group" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <button id="play-slideshow" title="Play Slideshow" style="background:var(--primary-color);color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">▶️</button>
                <button id="pause-slideshow" title="Pause Slideshow" style="background:var(--secondary-color);color:#fff;padding:0;width:32px;height:32px;min-width:32px;display:none;align-items:center;justify-content:center;border-radius:4px;border:none;font-size:16px;">⏸️</button>
            </div>

            <div class="control-group" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <label for="cof-duration" style="margin:0;">Seconds per key:</label>
                <input id="cof-duration" type="number" min="0.5" max="30" step="0.5" value="2" style="width:84px;">
                <button id="play-cof-loop" type="button">Play Circle of Fifths</button>
                <button id="stop-cof-loop" type="button" style="display:none;">Stop Fifths</button>
                <button id="play-cof4-loop" type="button">Play Circle of Fourths</button>
                <button id="stop-cof4-loop" type="button" style="display:none;">Stop Fourths</button>
            </div>
            <div class="control-group" style="display:flex;flex-direction:column;gap:8px;width:100%;">
                <button id="chromatic-tuner-toggle" type="button">Show Chromatic Tuner</button>
                <div id="chromatic-tuner-container" style="display:none;">
                    <div class="chromatic-tuner-buttons"></div>
                </div>
            </div>

            <!-- Melodic pattern quick controls moved to bottom -->
            <div class="control-group" style="display:flex;align-items:center;gap:8px;width:100%;">
                <label for="melodic-pattern-select" style="margin:0;font-weight:700;">Melodic Pattern:</label>
                <select id="melodic-pattern-select" style="min-width:160px;"></select>
                <div id="custom-pattern-container" style="display:none;min-width:140px;">
                    <label class="sr-only" for="custom-pattern">Custom degree sequence</label>
                    <input id="custom-pattern" type="text" placeholder="e.g. 1 3 5 3" inputmode="text" style="width:140px;">
                </div>
                <button id="play-melodic-pattern" type="button" style="padding:6px 10px;background:var(--primary-color);color:#fff;border-radius:6px;">Play</button>
                <button id="stop-melodic-pattern" type="button" style="display:none;padding:6px 10px;background:#b23b3b;color:#fff;border-radius:6px;">Stop</button>
                <button id="step-melodic-pattern" type="button" aria-label="Play the next note in the melodic pattern" style="padding:6px 10px;background:#777;color:#fff;border-radius:6px;">Step</button>
                <label for="melodic-tempo" style="margin-left:8px;font-weight:700;">BPM:</label>
                <input id="melodic-tempo" type="number" min="20" max="300" value="120" inputmode="numeric" style="width:70px;">
                <span id="melodic-pattern-status" role="status" aria-live="polite" style="flex-basis:100%;font-size:.82em;color:var(--secondary-color);"></span>
            </div>
        </footer>
        `;
    };
}