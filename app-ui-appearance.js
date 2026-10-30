/**
 * UI Appearance Extension for App
 */
if (typeof App !== 'undefined') {
    /**
     * Create color inputs for custom theme
     */
    App.prototype.createCustomColorInputs = function() {
        const customColors = document.getElementById('custom-colors');
        if (!customColors) return;
        customColors.innerHTML = '';
        this.addColorPicker(customColors, 'background', 'Background', '#FFFFFF');
        this.addColorPicker(customColors, 'strings', 'Strings', '#888888');
        this.addColorPicker(customColors, 'frets', 'Frets', '#444444');
        this.addColorPicker(customColors, 'markers', 'Markers', '#333333');
        const intervalSection = document.createElement('div');
        intervalSection.innerHTML = '<h3>Interval Colors</h3>';
        customColors.appendChild(intervalSection);
        Object.entries(this.musicTheory.intervals).forEach(([interval, data]) => {
            this.addColorPicker(customColors, `intervals.${interval}`, `${data.name} (${data.shortName})`, data.color);
        });
        
        const invertBtn = document.createElement('button');
        invertBtn.textContent = 'Invert Colors';
        invertBtn.style.marginTop = '10px';
        invertBtn.addEventListener('click', () => {
            const inputs = customColors.querySelectorAll('input[type="color"]');
            inputs.forEach(input => {
                const hex = input.value.replace('#', '');
                const inverted = (0xFFFFFF ^ parseInt(hex, 16)).toString(16).padStart(6, '0');
                input.value = '#' + inverted;
                input.dispatchEvent(new Event('change'));
            });
        });
        customColors.appendChild(invertBtn);
    };
    
    /**
     * Add a color picker input
     */
    App.prototype.addColorPicker = function(container, key, label, defaultColor) {
        const div = document.createElement('div');
        div.className = 'color-picker';
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.htmlFor = 'custom-color-' + key.replace(/[^a-z0-9-]/gi, '-');
        div.appendChild(labelElement);
        const input = document.createElement('input');
        input.type = 'color';
        input.id = labelElement.htmlFor;
        input.value = defaultColor;
        input.setAttribute('data-color-key', key);
        input.addEventListener('change', () => this.updateFretboard());
        div.appendChild(input);
        container.appendChild(div);
    };

    App.prototype.addNoteAppearanceOptions = function() {
        const appearanceSection = document.querySelector('.appearance');
        if (!appearanceSection) return;
        const noteAppearanceSection = document.createElement('div');
        noteAppearanceSection.innerHTML = '<h3>Note Appearance</h3>';
        appearanceSection.appendChild(noteAppearanceSection);
        
        this.createRangeControl(noteAppearanceSection, 'Note Size (px)', 'note-size', 8, 30, 15);
        this.createSelectControl(noteAppearanceSection, 'Note Shape', 'note-shape', this.musicTheory.noteStyles.shapes);
        this.createRangeControl(noteAppearanceSection, 'Font Size (px)', 'note-font-size', 8, 24, 12);
        this.createSelectControl(noteAppearanceSection, 'Effect', 'note-effect', this.musicTheory.noteStyles.effects);
        
        const gradDiv = document.createElement('div'); gradDiv.className = 'control-group';
        gradDiv.innerHTML = `<label for="note-gradient" style="display:inline;margin-right:10px;">Use Gradient:</label><input type="checkbox" id="note-gradient" style="width:auto;">`;
        noteAppearanceSection.appendChild(gradDiv);
        
        this.createRangeControl(noteAppearanceSection, 'Vertical Offset (px)', 'note-offset', -20, 20, 0);
    };

    App.prototype.addStringAppearanceOptions = function() {
        const appearanceSection = document.querySelector('.appearance');
        if (!appearanceSection) return;
        const section = document.createElement('div');
        section.innerHTML = '<h3>String Appearance</h3>';
        appearanceSection.appendChild(section);
        
        this.createRangeControl(section, 'String Thickness (px)', 'string-thickness', 1, 10, 3);
        // Provide a curated set of 15 distinct string styles for selection
        const styles = [
            'default', 'solid', 'dashed', 'dotted', 'double',
            'longDash', 'shortDash', 'dashDot', 'wave', 'zigzag',
            'textured', 'spiral', 'dual-color', 'celtic', 'flame',
            // 15 new styles
            'neon', 'grain', 'braided', 'rope', 'twine',
            'plated', 'etched', 'hollow', 'split', 'beveled',
            'fiberglass', 'carbon', 'twill', 'serrated', 'ridge'
        ];
        this.createSelectControl(section, 'String Style', 'string-style', styles);
        
        const gradDiv = document.createElement('div'); gradDiv.className = 'control-group';
        gradDiv.innerHTML = `<label for="string-gradient" style="display:inline;margin-right:10px;">Use Gradient:</label><input type="checkbox" id="string-gradient" style="width:auto;">`;
        section.appendChild(gradDiv);
        
        this.createSelectControl(section, 'Effect', 'string-effect', ['none', 'glow', 'shadow', 'highlight', 'instrumental']);
        this.createRangeControl(section, 'String Spacing (px)', 'string-spacing', 20, 50, 30);
        this.createRangeControl(section, 'String Opacity (%)', 'string-opacity', 20, 100, 100);
    };

    App.prototype.addFretAppearanceOptions = function() {
        const appearanceSection = document.querySelector('.appearance');
        if (!appearanceSection) return;
        const section = document.createElement('div');
        section.innerHTML = '<h3>Fret Appearance</h3>';
        appearanceSection.appendChild(section);
        
        const styles = ['solid', 'dashed', 'dotted', 'double', 'inlaid', 'raised', 'embossed', 'carved', 'layered', 'metal', 'wood', 'plastic', 'neon', 'glowing'];
        this.createSelectControl(section, 'Fret Style', 'fret-style', styles);
        this.createRangeControl(section, 'Fret Thickness (px)', 'fret-thickness', 1, 10, 2, () => this.updateFretboard());
    };

    App.prototype.createRangeControl = function(container, label, id, min, max, val, callback) {
        const div = document.createElement('div'); div.className = 'control-group';
        div.innerHTML = `<label for="${id}">${label}:</label><input type="range" id="${id}" min="${min}" max="${max}" value="${val}">`;
        if (callback) div.querySelector('input').addEventListener('change', callback);
        container.appendChild(div);
    };

    App.prototype.createSelectControl = function(container, label, id, options) {
        const div = document.createElement('div'); div.className = 'control-group';
        const select = document.createElement('select'); select.id = id;
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value || opt; o.textContent = opt.text || opt;
            select.appendChild(o);
        });
        div.innerHTML = `<label for="${id}">${label}:</label>`;
        div.appendChild(select);
        container.appendChild(div);
    };
}