/**
 * Fretboard Drawing Methods
 * Extends the Fretboard prototype with drawing capabilities
 */
if (typeof Fretboard !== 'undefined') {

    Fretboard.prototype.draw = function() {
        if (!this.container || !this.settings || !this.dimensions) return;
        if (this.settings.referenceLayout) { this.drawPitchReference(); return; }

        // Keep the player's position on longer necks when controls trigger a redraw.
        const scrollLeft = this.container.scrollLeft;
        this.container.replaceChildren();
        
        // Update dimensions based on number of strings and frets
        const stringCount = this.settings.tuning ? this.settings.tuning.length : 6;
        const fretCount = this.settings.endFret - this.settings.startFret;
        
        // Adjust fret spacing and string spacing based on viewport width for responsive design
        const viewportWidth = this.container.clientWidth || window.innerWidth;
        if (viewportWidth < 600) {
            this.dimensions.fretSpacing = 40;
            this.dimensions.stringSpacing = 20;
            this.dimensions.margin.left = 60; // Ensure enough space for open strings and labels
        } else {
            this.dimensions.fretSpacing = 80;
            this.dimensions.stringSpacing = 30;
            this.dimensions.margin.left = 100; // Ensure enough space for open strings and labels
        }
        
        this.dimensions.height = Math.max(150, stringCount * this.dimensions.stringSpacing + this.dimensions.margin.top + this.dimensions.margin.bottom);
        this.dimensions.width = Math.max(100, fretCount * this.dimensions.fretSpacing + this.dimensions.margin.left + this.dimensions.margin.right);
        
        // Create SVG element
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('class', 'fretboard-svg fretboard-neck-svg' + (fretCount >= 14 ? ' fretboard-fit-neck' : ''));
        this.svg.setAttribute('viewBox', `0 0 ${this.dimensions.width} ${this.dimensions.height}`);
        this.svg.setAttribute('width', String(this.dimensions.width));
        this.svg.setAttribute("role", "group");
        const patternData = this.musicTheory[this.currentPatternType] && this.musicTheory[this.currentPatternType][this.currentPattern];
        const patternName = patternData && patternData.name ? patternData.name : this.currentPattern;
        const description = "Strings from lowest to highest: " + (this.settings.tuning || []).join(", ") + ". Frets " + this.settings.startFret + " through " + this.settings.endFret + ". Use arrow keys to move between highlighted notes.";
        this.svg.setAttribute("aria-label", this.currentKey + " " + patternName + " fretboard");
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = this.currentKey + " " + patternName + " fretboard";
        const desc = document.createElementNS("http://www.w3.org/2000/svg", "desc");
        desc.textContent = description;
        this.svg.append(title, desc);
        this.container.appendChild(this.svg);
        
        // Scrolling only changes the viewport; the SVG notes are already rendered.
        this.drawFretboard();
        this.drawNotes();
        this.container.scrollLeft = fretCount >= 14 ? 0 : scrollLeft;
    };

    Fretboard.prototype.drawPitchReference = function() {
        if (this.settings.instrument === 'piano') { this.drawPianoKeyboard(); return; }
        const scrollLeft = this.container.scrollLeft;
        this.container.replaceChildren();
        const columns = this.container.clientWidth < 600 ? 4 : 12;
        const width = columns * 78 + 24;
        const height = Math.ceil(this.settings.tuning.length / columns) * 58 + 48;
        this.dimensions.width = width;
        this.dimensions.height = height;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg = svg;
        svg.setAttribute('class', 'fretboard-svg pitch-reference-svg');
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.setAttribute('width', '100%');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Open-pitch reference, ' + this.currentKey + ' ' + this.currentPatternType + ' ' + this.currentPattern + '. Positions increase in the displayed playing order; this is not a fretboard.');
        const colors = this.getThemeColors();
        const element = (tag, attributes, text) => {
            const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
            Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
            if (text !== undefined) node.textContent = text;
            svg.appendChild(node);
            return node;
        };
        element('rect', { width, height, fill: colors.background });
        element('text', { x: 12, y: 22, fill: colors.frets, 'font-size': 12 }, 'Open pitches / keys (no frets)');
        const normalize = note => this.musicTheory.toSharp ? this.musicTheory.toSharp(note) : note;
        const active = new Set(this.activeNotes.filter(Boolean).map(normalize));
        this.settings.tuning.forEach((note, index) => {
            const x = 12 + index % columns * 78;
            const y = 36 + Math.floor(index / columns) * 58;
            const visible = this.settings.visibleStrings?.[index] !== false;
            // Gamut locations only apply at position zero on an open-pitch reference.
            const selected = visible && (active.has(normalize(note)) || this.activePositions.some(position => position.string === index && position.fret === 0));
            const fill = selected ? colors.markers : colors.background;
            const label = this.settings.originalTuning?.[index] === note ? this.settings.pitchLabels?.[index] || note : note;
            element('rect', { x, y, width: 70, height: 46, rx: 4, fill, stroke: colors.frets, 'stroke-width': selected ? 2 : 1 });
            element('text', { x: x + 35, y: y + 17, 'text-anchor': 'middle', fill: selected ? this.getContrastColor(fill) : colors.frets, 'font-size': 10 }, String(index + 1));
            element('text', { x: x + 35, y: y + 35, 'text-anchor': 'middle', fill: selected ? this.getContrastColor(fill) : colors.frets, 'font-size': 14, 'font-weight': selected ? 'bold' : 'normal' }, label);
        });
        this.container.appendChild(svg);
        this.container.scrollLeft = scrollLeft;
    };

    Fretboard.prototype.getPianoDisplayKeys = function(key = this.currentKey, settings = this.settings) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const normalized = this.musicTheory.toSharp ? this.musicTheory.toSharp(key) : key;
        const physical = settings.originalTuning || settings.tuning;
        const offset = Math.max(0, physical.indexOf(normalized));
        return settings.tuning.map((_, index) => {
            const sourceIndex = (index + offset) % settings.tuning.length;
            const note = settings.tuning[sourceIndex];
            const pitch = offset + index;
            const flats = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
            const name = key.includes('b') ? flats[notes[pitch % 12]] || notes[pitch % 12] : notes[pitch % 12];
            const label = physical[sourceIndex] === note ? name + (4 + Math.floor(pitch / 12)) : note;
            return { note, index: sourceIndex, label, black: physical[sourceIndex].includes('#') };
        });
    };

    Fretboard.prototype.drawPianoKeyboard = function() {
        const scrollLeft = this._pianoDisplayKey === this.currentKey ? this.container.scrollLeft : 0;
        this._pianoDisplayKey = this.currentKey;
        this.container.replaceChildren();
        const tuning = this.settings.tuning;
        const displayKeys = this.getPianoDisplayKeys();
        const whiteWidth = 30;
        const blackWidth = 19;
        const whiteCount = displayKeys.filter(key => !key.black).length;
        const leadingSpace = displayKeys[0].black ? blackWidth / 2 : 0;
        const trailingSpace = displayKeys[displayKeys.length - 1].black ? blackWidth / 2 : 0;
        const width = whiteCount * whiteWidth + leadingSpace + trailingSpace + 32;
        const height = 220;
        this.dimensions.width = width;
        this.dimensions.height = height;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg = svg;
        svg.setAttribute('class', 'fretboard-svg piano-keyboard-svg');
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.setAttribute('width', '100%');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', tuning.length + '-key piano keyboard, ' + displayKeys[0].label + ' to ' + displayKeys[displayKeys.length - 1].label + '. Highlighted keys show ' + this.currentKey + ' ' + this.currentPatternType + ' ' + this.currentPattern + '.');
        const element = (tag, attributes, text) => {
            const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
            Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
            if (text !== undefined) node.textContent = text;
            svg.appendChild(node);
            return node;
        };
        element('rect', { width, height, fill: '#202326', rx: 5 });
        element('rect', { x: 16, y: 20, width: width - 32, height: 7, fill: '#8e3939' });
        const normalize = note => this.musicTheory.toSharp ? this.musicTheory.toSharp(note) : note;
        const active = new Set(this.activeNotes.filter(Boolean).map(normalize));
        let whiteIndex = 0;
        const keys = displayKeys.map(({ note, index, label, black }) => {
            const x = 16 + leadingSpace + whiteIndex * whiteWidth - (black ? blackWidth / 2 : 0);
            if (!black) whiteIndex++;
            const selected = this.settings.visibleStrings?.[index] !== false && (active.has(normalize(note)) || this.activePositions.some(position => position.string === index && position.fret === 0));
            return { index, black, x, selected, label };
        });
        // Draw every white key first so black keys overlap their neighbors naturally.
        [false, true].forEach(black => keys.filter(key => key.black === black).forEach(key => {
            const keyWidth = black ? blackWidth : whiteWidth;
            const keyHeight = black ? 108 : 176;
            const center = key.x + keyWidth / 2;
            element('rect', { class: black ? 'piano-black-key' : 'piano-white-key', 'data-key': key.index, x: key.x, y: 27, width: keyWidth, height: keyHeight, rx: 2, fill: black ? '#17191c' : '#fcfbf7', stroke: black ? '#070809' : '#9c9b96', 'stroke-width': 1 });
            if (black) element('rect', { x: key.x + 3, y: 30, width: keyWidth - 6, height: keyHeight - 13, fill: '#2c3035', rx: 1 });
            else element('line', { x1: key.x + 2, y1: 198, x2: key.x + keyWidth - 2, y2: 198, stroke: '#dedcd5' });
            if (key.selected) element('circle', { class: 'piano-pattern-marker', 'data-key': key.index, cx: center, cy: black ? 103 : 169, r: black ? 5 : 7, fill: '#c9943a', stroke: '#926a27', 'stroke-width': 1 });
            element('text', { x: center, y: black ? 124 : 190, 'text-anchor': 'middle', fill: black ? '#f7f5ef' : '#3b3d3e', 'font-family': 'Arial, sans-serif', 'font-size': black ? 8 : 10, 'pointer-events': 'none' }, key.label);
        }));
        this.container.appendChild(svg);
        this.container.scrollLeft = scrollLeft;
    };

    // removed Fretboard.prototype.drawFretboard() -> moved to fretboard-draw-grid.js
    // removed Fretboard.prototype.drawFretMarker() -> moved to fretboard-draw-grid.js
    // removed Fretboard.prototype.drawNotes() -> moved to fretboard-draw-notes.js
    // removed Fretboard.prototype.drawNoteMarker() -> moved to fretboard-draw-notes.js
}