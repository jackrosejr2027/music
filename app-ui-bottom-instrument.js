/**
 * UI Bottom Controls - Instrument Setup Section
 */
if (typeof App !== 'undefined') {
    App.prototype.getInstrumentFooterHtml = function() {
        return `
        <footer id="instrument-footer" class="instrument-setup appearance-bottom-section" style="display: none;">
            <div style="grid-column: 1 / -1; width: 100%;">
                <h3 style="margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 5px; font-size: 1.1em; color: var(--primary-color);">Instrument Setup</h3>
            </div>
            <div class="control-group" id="string-count-group">
                <label for="string-count">Number of Strings:</label>
                <input type="number" id="string-count" min="1" max="20" value="6">
            </div>
            <div id="tuning-container" style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 10px; width: 100%;"></div>
        </footer>
        `;
    };

    App.prototype.organizeInstrumentControls = function() {
        const panel = document.getElementById('instrument-footer');
        if (!panel || panel.querySelector('.instrument-control-section')) return;
        const oldTitle = panel.querySelector('h3');
        if (oldTitle) oldTitle.parentElement.remove();
        const sections = [
            ['instrument-diagrams', 'Diagram set', 'Choose how many diagrams to show, or load Gauntlet, Multi-Instrument or All Keys. Loading a set replaces every diagram setup; reselecting it reapplies the preset. Edit settings for picks which diagram the controls below change. All Keys links Type and Selection only; keys and instruments stay separate.', ['diagram-count', 'diagram-editor']],
            ['instrument-selected', 'Selected diagram: instrument and tuning', '', ['instrument-select', 'tuning-preset', 'string-count', 'flip-string-order']],
            ['instrument-range', 'Fret window and range presets', '', ['start-fret', 'end-fret', 'fretspan-presets']],
            ['instrument-strings', 'Selected diagram: individual strings or keys', 'Open pitch sets the string to fret 0. Show notes hides its markers, not the string. From and To limit its note markers; 0 includes the open note. Rows run from the lowest string down to string 1 (standard guitar: 6 to 1). Reference maps use their listed order, and pitch labels are not octave-calibrated playback.', []],
            ['instrument-other-strings', 'Other diagrams: individual strings or keys', 'These rows edit their named diagram directly without switching the selected editor. Key, Type and Selection remain below each fretboard.', []]
        ];
        for (const [id, title, description, controls] of sections) {
            const section = document.createElement('fieldset');
            section.id = id;
            section.className = 'instrument-control-section';
            const legend = document.createElement('legend');
            legend.textContent = title;
            section.append(legend);
            if (description) {
                const help = document.createElement('p');
                help.id = id + '-help';
                help.className = 'instrument-control-help';
                help.textContent = description;
                section.setAttribute('aria-describedby', help.id);
                section.append(help);
            }
            if (id === 'instrument-range') {
                const row = document.createElement('div');
                row.className = 'fret-window-row';
                for (const controlId of ['start-fret', 'end-fret']) {
                    const group = document.getElementById(controlId)?.closest('.control-group');
                    if (group) row.appendChild(group);
                }
                section.appendChild(row);
                const preset = document.getElementById('fretspan-presets')?.closest('.control-group');
                if (preset) section.appendChild(preset);
            } else {
                controls.forEach(controlId => {
                    const control = document.getElementById(controlId);
                    const group = control?.closest('.control-group');
                    if (group) section.appendChild(group);
                });
            }
            panel.appendChild(section);
        }
        const selected = document.getElementById('instrument-selected');
        const strings = document.getElementById('instrument-strings');
        const heading = document.getElementById('active-diagram-strings-heading');
        if (heading) strings.appendChild(heading);
        strings.appendChild(document.getElementById('tuning-container'));
        const referenceHelp = document.createElement('p');
        referenceHelp.className = 'instrument-control-help';
        referenceHelp.textContent = 'Piano, harp and koto reference maps ignore fret windows and capo. The piano shows two octaves from the selected key; its per-key controls follow the stored tuning slots. Fretless instruments use semitone study grids, not physical frets.';
        strings.appendChild(referenceHelp);
        document.getElementById('instrument-other-strings').appendChild(document.getElementById('additional-diagram-strings'));
        if (document.querySelector('.header-nav[data-consolidated]')) {
            const quick = document.createElement('div');
            quick.id = 'diagram-instrument-controls';
            quick.className = 'diagram-instrument-controls';
            quick.setAttribute('aria-label', 'Selected diagram instrument and fret range');
            for (const id of ['instrument-selected', 'instrument-range']) {
                const section = document.getElementById(id);
                section.querySelector('legend').textContent = id === 'instrument-selected' ? 'Instrument and tuning' : 'Fret window and range presets';
                quick.appendChild(section);
            }
            const anchor = this.diagramPatternControls?.[this.activeDiagram] || document.getElementById('current-pattern-display');
            anchor.after(quick);
        }
        const labels = { 'diagram-count': 'Number of diagrams or preset set:', 'diagram-editor': 'Edit settings for:', 'instrument-select': 'Instrument model:', 'tuning-preset': 'Open-pitch tuning preset:', 'fretspan-presets': 'Per-string range preset:' };
        Object.entries(labels).forEach(([id, text]) => {
            const label = document.querySelector('label[for="' + id + '"]');
            if (label) label.textContent = text;
        });
    };

}