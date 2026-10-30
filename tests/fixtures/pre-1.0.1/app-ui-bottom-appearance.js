/**
 * UI Bottom Controls - Appearance Section
 */
if (typeof App !== 'undefined') {
    App.prototype.getAppearanceFooterHtml = function() {
        return `
        <footer id="appearance-footer" class="appearance appearance-bottom-section" style="display: none;">
            <div style="grid-column: 1 / -1; width: 100%;">
                <h3 style="margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px; font-size: 1.1em; color: var(--primary-color);">Music Theory</h3>
            </div>

            <div style="grid-column: 1 / -1;">
                <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:10px;">
                    <label style="font-weight:700; margin-right:8px;">Theory Info Display</label>
                    <button id="toggle-title-button" style="font-size:12px;padding:6px 8px;">Hide Title</button>
                    <button id="toggle-info-button" style="font-size:12px;padding:6px 8px;">Show Info Panel</button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:12px;">
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-name" checked style="width:auto;"> <span>Name</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-root" checked style="width:auto;"> <span>Root Note</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-spelling" checked style="width:auto;"> <span>Scale/Chord Spelling</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-quality" checked style="width:auto;"> <span>Quality</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-tonic" checked style="width:auto;"> <span>Tonic Function</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-dominant" checked style="width:auto;"> <span>Dominant Function</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-modes" checked style="width:auto;"> <span>Modes</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-inversions" checked style="width:auto;"> <span>Inversions</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="show-description" checked style="width:auto;"> <span>Description</span></label>
                    <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="hide-about-section" style="width:auto;"> <span>Hide About Section</span></label>
                </div>
            </div>

            <div>
                <h3>General Appearance</h3>
                <div class="control-group" style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="force-white-background" style="width:auto;">
                    <label for="force-white-background" style="margin-bottom:0;font-weight:700;">Force White Fretboard Background</label>
                </div>
                <div class="control-group">
                    <label for="string-height">String Height (px):</label>
                    <input type="number" id="string-height" min="1" max="20" value="1">
                </div>
                <div class="control-group">
                    <label for="fret-width">Fret Width (px):</label>
                    <input type="number" id="fret-width" min="1" max="20" value="1">
                </div>
                <div id="custom-colors" style="display: none;"></div>
            </div>

            <div style="grid-column: 1 / -1; display:flex; gap:10px; align-items:center; margin-top:10px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <label for="tempo-range" style="margin-bottom:0;font-weight:700;">Tempo:</label>
                    <input type="range" id="tempo-range" min="40" max="240" value="120" style="width:160px;">
                    <span id="tempo-value" style="font-weight:700;">120</span>
                    <span style="font-size:0.9em;color:var(--secondary-color);">BPM</span>
                </div>
                <button id="play-pattern" style="padding:8px 12px;background:var(--primary-color);color:#fff;border-radius:6px;">Play Pattern</button>
                <button id="sidebar-add-to-slideshow" style="padding:8px 12px;background:#f39c12;color:#fff;border-radius:6px;">Add to Slideshow</button>
                <div style="display:flex; flex-direction:column; gap:4px; margin-left:12px;">
                    <label style="display:flex;align-items:center;gap:6px;margin-bottom:0;">
                        <input type="checkbox" id="export-include-info" checked style="width:auto;">
                        <span style="font-weight:700;">Include Key/Pattern info in JPGs</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;margin-bottom:0;">
                        <input type="checkbox" id="export-simple-info" style="width:auto;">
                        <span style="font-weight:700; font-size:0.9em;">Simple Export Text</span>
                    </label>
                </div>
                <button id="export-current-diagram-bottom" style="padding:8px 12px;background:#3498db;color:#fff;border-radius:6px;margin-left:auto;">Export Diagram</button>
            </div>
        </footer>
        `;
    };
}