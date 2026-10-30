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

    App.prototype.organizeAppearanceControls = function() {
        const panel = document.getElementById('appearance-footer');
        if (!panel || panel.querySelector('.appearance-control-section')) return;
        const theory = panel.querySelector('#toggle-title-button')?.parentElement.parentElement;
        const shortcuts = panel.querySelector('#tempo-range')?.parentElement.parentElement;
        const sections = [
            ['appearance-theory', 'Theory information panel', 'Show the info panel for the selected key and pattern. The checkboxes choose which details appear, and some depend on the pattern Type. Title visibility only changes the heading inside this panel.', []],
            ['appearance-notes', 'Note markers', 'Shape, size, label size and effects for note markers. Vertical offset moves them up or down in pixels. Marker text is chosen in Board & Playback.', ['note-size','note-shape','note-font-size','note-effect','note-gradient','note-offset']],
            ['appearance-strings', 'String lines', 'String height sets the line thickness. Spacing sets the gap between strings, and opacity sets transparency.', ['string-height','string-thickness','string-style','string-gradient','string-effect','string-spacing','string-opacity']],
            ['appearance-frets', 'Fret lines', 'Fret width sets the vertical line thickness, and fret style sets the look. These do not change tuning or the fret window. Keyboard, harp and koto maps have no physical frets.', ['fret-width','fret-style','fret-thickness']],
            ['appearance-numbers', 'Fret number labels', 'Placement, alignment, text size and vertical offset for fret numbers. Positive offset moves them down. Show numbers and pick their background in Board & Playback.', ['fret-numbers-placement','fret-numbers-position','fret-numbers-size','fret-numbers-offset']],
            ['appearance-landmarks', 'Position dots', 'Position dots mark the frets, not the pattern notes. Choose where they sit and shift them vertically.', ['fret-markers-placement','fret-markers-offset']],
            ['appearance-colors', 'Background and custom colors', 'White background overrides the diagram background. To edit colors, choose Custom under Board & Playback > Marker color theme. Invert swaps every custom color, including intervals, but not the app theme.', ['force-white-background']],
            ['appearance-shortcuts', 'Playback and export shortcuts', 'Play Pattern uses the tempo above. Include info adds key and pattern text to JPGs, and simple export text uses shorter labels. Melodic exercises, slideshow and full export have their own controls.', []]
        ];
        for (const [id, title, description, controls] of sections) {
            const section = document.createElement('fieldset');
            section.id = id;
            section.className = 'appearance-control-section';
            const legend = document.createElement('legend'); legend.textContent = title;
            const help = document.createElement('p'); help.id = id + '-help'; help.className = 'appearance-control-help'; help.textContent = description;
            section.setAttribute('aria-describedby', help.id);
            section.append(legend, help);
            controls.forEach(controlId => {
                const group = document.getElementById(controlId)?.closest('.control-group');
                if (group) section.appendChild(group);
            });
            panel.appendChild(section);
        }
        if (theory) document.getElementById('appearance-theory').appendChild(theory);
        if (shortcuts) document.getElementById('appearance-shortcuts').appendChild(shortcuts);
        document.getElementById('appearance-colors').appendChild(document.getElementById('custom-colors'));
        const labels = {
            'string-height':'String height (px)', 'string-thickness':'Legacy string thickness (px)',
            'fret-width':'Fret width (px)', 'fret-thickness':'Rendered fret thickness (px)',
            'note-size':'Note marker size (px)', 'note-shape':'Note marker shape', 'note-font-size':'Marker label size (px)',
            'note-effect':'Note marker effect', 'note-gradient':'Gradient fill on note markers', 'note-offset':'Note marker vertical offset (px)',
            'string-style':'String line style', 'string-gradient':'Gradient on string lines', 'string-effect':'String line effect',
            'string-spacing':'Gap between strings (px)', 'string-opacity':'String line opacity (%)', 'fret-style':'Fret line style',
            'fret-numbers-placement':'Number placement', 'fret-numbers-position':'Number alignment', 'fret-numbers-size':'Number text size (px)',
            'fret-numbers-offset':'Number vertical offset (px)', 'fret-markers-placement':'Position dot placement', 'fret-markers-offset':'Position dot vertical offset (px)',
            'tempo-range':'Play Pattern tempo (BPM)'
        };
        Object.entries(labels).forEach(([id, text]) => { const label = panel.querySelector('label[for="' + id + '"]'); if (label) label.textContent = text + ':'; });
        // The same shortcut IDs also occur in the older tool sections; bind the visible copies when needed.
        const add = panel.querySelector('#sidebar-add-to-slideshow');
        if (add && document.getElementById(add.id) !== add) add.addEventListener('click', () => this.addToSlideshow());
        const image = panel.querySelector('#export-current-diagram-bottom');
        if (image) { image.textContent = 'Export selected diagram JPG'; if (document.getElementById(image.id) !== image) image.addEventListener('click', () => this.exportCurrentDiagram()); }
        // String thickness and fret thickness sliders are not read by the renderer (it uses String height and Fret width), so hide them.
        ['string-thickness', 'fret-thickness'].forEach(id => { const group = document.getElementById(id)?.closest('.control-group'); if (group) group.style.display = 'none'; });
        // Remove only empty builders and obsolete headings after moving their live controls.
        Array.from(panel.children).forEach(child => { if (!child.classList.contains('appearance-control-section')) child.remove(); });
    };

}