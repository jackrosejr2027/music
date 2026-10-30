// Layout groups for the Type dropdown. Each group has 50 selections:
// indices 0-24 start the shape at that fret, indices 25-49 end it at that fret (frets 0-24).
const FRETBOARD_LAYOUT_GROUPS = [
    { id: 'layout-notes-1', name: '1 note per string', notesPerString: 1 },
    { id: 'layout-notes-2', name: '2 notes per string', notesPerString: 2 },
    { id: 'layout-notes-3', name: '3 notes per string', notesPerString: 3 },
    { id: 'layout-notes-4', name: '4 notes per string', notesPerString: 4 },
    { id: 'layout-span-3', name: '3-fret span', span: 3 },
    { id: 'layout-span-4', name: '4-fret span', span: 4 },
    { id: 'layout-span-5', name: '5-fret span', span: 5 },
    { id: 'layout-span-6', name: '6-fret span', span: 6 },
    { id: 'layout-octave-1', name: 'One octave', span: 12 },
    { id: 'layout-octave-2', name: 'Two octaves', span: 24 },
    { id: 'layout-low-3', name: 'Lowest 3 strings', span: 4, strings: 'low', count: 3 },
    { id: 'layout-high-3', name: 'Highest 3 strings', span: 4, strings: 'high', count: 3 },
    { id: 'layout-low-2', name: 'Lowest 2 strings', span: 4, strings: 'low', count: 2 },
    { id: 'layout-high-2', name: 'Highest 2 strings', span: 4, strings: 'high', count: 2 },
    { id: 'layout-middle', name: 'Middle strings', span: 4, strings: 'middle' },
    { id: 'layout-notes-5', name: '5 notes per string', notesPerString: 5 },
    { id: 'layout-notes-6', name: '6 notes per string', notesPerString: 6 },
    { id: 'layout-span-2', name: '2-fret span', span: 2 },
    { id: 'layout-span-7', name: '7-fret span', span: 7 },
    { id: 'layout-span-8', name: '8-fret span', span: 8 },
    { id: 'layout-span-9', name: '9-fret span', span: 9 },
    { id: 'layout-span-10', name: '10-fret span', span: 10 },
    { id: 'layout-low-4', name: 'Lowest 4 strings', span: 4, strings: 'low', count: 4 },
    { id: 'layout-high-4', name: 'Highest 4 strings', span: 4, strings: 'high', count: 4 },
    { id: 'layout-low-1', name: 'Lowest string', span: 4, strings: 'low', count: 1 },
    { id: 'layout-high-1', name: 'Highest string', span: 4, strings: 'high', count: 1 },
    { id: 'layout-low-3-notes-2', name: 'Lowest 3 strings, 2 notes each', notesPerString: 2, strings: 'low', count: 3 },
    { id: 'layout-high-3-notes-2', name: 'Highest 3 strings, 2 notes each', notesPerString: 2, strings: 'high', count: 3 },
    { id: 'layout-low-3-notes-3', name: 'Lowest 3 strings, 3 notes each', notesPerString: 3, strings: 'low', count: 3 },
    { id: 'layout-high-3-notes-3', name: 'Highest 3 strings, 3 notes each', notesPerString: 3, strings: 'high', count: 3 },
    { id: 'layout-middle-notes-2', name: 'Middle strings, 2 notes each', notesPerString: 2, strings: 'middle' },
    { id: 'layout-low-3-octave', name: 'Octave on lowest 3 strings', span: 12, strings: 'low', count: 3 },
    { id: 'layout-high-3-octave', name: 'Octave on highest 3 strings', span: 12, strings: 'high', count: 3 },
    { id: 'layout-middle-octave', name: 'Octave on middle strings', span: 12, strings: 'middle' },
    { id: 'layout-low-2-notes-2', name: 'Lowest 2 strings, 2 notes each', notesPerString: 2, strings: 'low', count: 2 },
    { id: 'layout-notes-7', name: '7 notes per string', notesPerString: 7 },
    { id: 'layout-span-11', name: '11-fret span', span: 11 },
    { id: 'layout-span-13', name: '13-fret span', span: 13 },
    { id: 'layout-span-14', name: '14-fret span', span: 14 },
    { id: 'layout-span-15', name: '15-fret span', span: 15 },
    { id: 'layout-span-16', name: '16-fret span', span: 16 },
    { id: 'layout-span-18', name: '18-fret span', span: 18 },
    { id: 'layout-low-5', name: 'Lowest 5 strings', span: 4, strings: 'low', count: 5 },
    { id: 'layout-high-5', name: 'Highest 5 strings', span: 4, strings: 'high', count: 5 },
    { id: 'layout-middle-span-6', name: 'Middle strings, 6-fret span', span: 6, strings: 'middle' },
    { id: 'layout-middle-span-3', name: 'Middle strings, 3-fret span', span: 3, strings: 'middle' },
    { id: 'layout-middle-notes-1', name: 'Middle strings, 1 note each', notesPerString: 1, strings: 'middle' },
    { id: 'layout-middle-notes-3', name: 'Middle strings, 3 notes each', notesPerString: 3, strings: 'middle' },
    { id: 'layout-middle-notes-4', name: 'Middle strings, 4 notes each', notesPerString: 4, strings: 'middle' },
    { id: 'layout-low-2-notes-1', name: 'Lowest 2 strings, 1 note each', notesPerString: 1, strings: 'low', count: 2 },
    { id: 'layout-high-2-notes-1', name: 'Highest 2 strings, 1 note each', notesPerString: 1, strings: 'high', count: 2 },
    { id: 'layout-low-2-notes-3', name: 'Lowest 2 strings, 3 notes each', notesPerString: 3, strings: 'low', count: 2 },
    { id: 'layout-high-2-notes-3', name: 'Highest 2 strings, 3 notes each', notesPerString: 3, strings: 'high', count: 2 },
    { id: 'layout-low-3-notes-1', name: 'Lowest 3 strings, 1 note each', notesPerString: 1, strings: 'low', count: 3 },
    { id: 'layout-high-3-notes-1', name: 'Highest 3 strings, 1 note each', notesPerString: 1, strings: 'high', count: 3 },
    { id: 'layout-low-3-notes-4', name: 'Lowest 3 strings, 4 notes each', notesPerString: 4, strings: 'low', count: 3 },
    { id: 'layout-high-3-notes-4', name: 'Highest 3 strings, 4 notes each', notesPerString: 4, strings: 'high', count: 3 },
    { id: 'layout-low-4-notes-2', name: 'Lowest 4 strings, 2 notes each', notesPerString: 2, strings: 'low', count: 4 },
    { id: 'layout-high-4-notes-2', name: 'Highest 4 strings, 2 notes each', notesPerString: 2, strings: 'high', count: 4 },
    { id: 'layout-low-4-notes-3', name: 'Lowest 4 strings, 3 notes each', notesPerString: 3, strings: 'low', count: 4 },
    { id: 'layout-high-4-notes-3', name: 'Highest 4 strings, 3 notes each', notesPerString: 3, strings: 'high', count: 4 },
    { id: 'layout-low-5-notes-2', name: 'Lowest 5 strings, 2 notes each', notesPerString: 2, strings: 'low', count: 5 },
    { id: 'layout-high-5-notes-2', name: 'Highest 5 strings, 2 notes each', notesPerString: 2, strings: 'high', count: 5 },
    { id: 'layout-low-2-octave', name: 'Octave on lowest 2 strings', span: 12, strings: 'low', count: 2 },
    { id: 'layout-high-2-octave', name: 'Octave on highest 2 strings', span: 12, strings: 'high', count: 2 },
    { id: 'layout-low-4-octave', name: 'Octave on lowest 4 strings', span: 12, strings: 'low', count: 4 },
    { id: 'layout-high-4-octave', name: 'Octave on highest 4 strings', span: 12, strings: 'high', count: 4 },
    { id: 'layout-low-5-octave', name: 'Octave on lowest 5 strings', span: 12, strings: 'low', count: 5 },
    { id: 'layout-low-3-two-octaves', name: 'Two octaves on lowest 3 strings', span: 24, strings: 'low', count: 3 },
    { id: 'layout-high-3-two-octaves', name: 'Two octaves on highest 3 strings', span: 24, strings: 'high', count: 3 },
    { id: 'layout-middle-two-octaves', name: 'Two octaves on middle strings', span: 24, strings: 'middle' },
    { id: 'layout-low-3-span-6', name: '6-fret span on lowest 3 strings', span: 6, strings: 'low', count: 3 },
    { id: 'layout-high-3-span-6', name: '6-fret span on highest 3 strings', span: 6, strings: 'high', count: 3 },
    { id: 'layout-low-2-span-6', name: '6-fret span on lowest 2 strings', span: 6, strings: 'low', count: 2 },
    { id: 'layout-high-2-span-6', name: '6-fret span on highest 2 strings', span: 6, strings: 'high', count: 2 },
    { id: 'layout-low-4-span-6', name: '6-fret span on lowest 4 strings', span: 6, strings: 'low', count: 4 },
    { id: 'layout-high-4-span-6', name: '6-fret span on highest 4 strings', span: 6, strings: 'high', count: 4 },
    { id: 'layout-low-3-span-3', name: '3-fret span on lowest 3 strings', span: 3, strings: 'low', count: 3 },
    { id: 'layout-high-3-span-3', name: '3-fret span on highest 3 strings', span: 3, strings: 'high', count: 3 },
    { id: 'layout-middle-span-8', name: '8-fret span on middle strings', span: 8, strings: 'middle' }
];
const FRETBOARD_LAYOUT_SELECTIONS = 50;
const FRETBOARD_LAYOUT_ANCHORS = 25;
function fretboardLayoutSelectionLabel(index) {
    const fret = index % FRETBOARD_LAYOUT_ANCHORS;
    return (index < FRETBOARD_LAYOUT_ANCHORS ? 'Starts at fret ' : 'Ends at fret ') + fret;
}

class Fretboard {
    constructor(containerId, musicTheory) {
        this.container = document.getElementById(containerId);
        this.musicTheory = musicTheory;
        this.svg = null;
        
        this.dimensions = {
            width: 1000,
            height: 250,
            margin: { top: 30, right: 30, bottom: 40, left: 100 },
            fretSpacing: 80,
            stringSpacing: 30
        };
        
        this.settings = {
            tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
            startFret: 0,
            endFret: 12,
            stringHeight: 2,
            fretWidth: 2,
            displayMode: 'intervals',
            colorTheme: 'default_ii',
            customColors: {},
            fretNumbersPlacement: 'below',
            fretNumbersPosition: 'center',
            fretNumbersSize: 12,
            fretNumbersOffset: 0,
            fretNumbersShape: 'none',
            fretMarkersPlacement: 'on',
            fretMarkersOffset: 0,
            noteSize: 15,
            noteShape: 'circle',
            noteFont: 'Arial Narrow',
            noteFontSize: 12,
            noteEffect: 'none',
            noteGradient: false,
            noteOffset: 0,
            stringStyle: 'solid',
            stringGradient: false,
            stringEffect: 'none',
            stringSpacing: 30,
            stringOpacity: 1,
            visibleStrings: [],
            stringStartFrets: [],
            stringEndFrets: [],
            fretStyle: 'solid'
        };
        
        this.currentKey = 'C';
        this.currentPatternType = 'scale';
        this.currentPattern = 'major';
        this.activeNotes = [];
        this.activePositions = [];
        this.selectedMarkers = [];
        
        this.resizeTimeout = null;
        this.lastContainerWidth = this.container ? this.container.clientWidth : 0;
        this.queueResponsiveDraw = () => {
            if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
            this.resizeTimeout = window.setTimeout(() => {
                this.resizeTimeout = null;
                if (this.draw) this.draw();
            }, 120);
        };
        window.addEventListener('resize', this.queueResponsiveDraw, { passive: true });
        if (this.container && typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(entries => {
                const width = Math.round(entries[0].contentRect.width);
                if (width === this.lastContainerWidth) return;
                this.lastContainerWidth = width;
                this.queueResponsiveDraw();
            });
            this.resizeObserver.observe(this.container);
        }
    }

    updateSettings(newSettings) {
        if (!newSettings) return;
        this.settings = { ...this.settings, ...newSettings };
        
        // Synchronize mismatched naming between UI and logic
        if (this.settings.fretThickness !== undefined) this.settings.fretWidth = this.settings.fretThickness;
        if (this.settings.stringThickness !== undefined) this.settings.stringHeight = this.settings.stringThickness;

        if (this.settings.stringSpacing && this.dimensions) {
            this.dimensions.stringSpacing = this.settings.stringSpacing;
        }
        if (this.draw) this.draw();
    }

    noteAt(stringIndex, fret) {
        const theory = this.musicTheory;
        const open = theory.notes.indexOf(theory.toSharp(this.settings.tuning[stringIndex]));
        return theory.notes[(open + fret) % 12];
    }

    getGamutPositions(key, gamutId) {
        const gamutData = this.musicTheory.gamuts && this.musicTheory.gamuts[gamutId];
        if (!gamutData) return [];
        let shift = 0;
        if (this.settings.gamutReferenceKey && gamutData.positions.length) {
            const semitone = note => this.musicTheory.notes.indexOf(this.musicTheory.toSharp(note));
            const offset = (semitone(key) - semitone(this.settings.gamutReferenceKey) + 12) % 12;
            const min = Math.min(...gamutData.positions.map(position => position.fret));
            const max = Math.max(...gamutData.positions.map(position => position.fret));
            // Keep the whole shape together, choosing a playable octave rather than wrapping individual notes.
            const candidates = [offset - 12, offset, offset + 12].filter(value => min + value >= 0 && max + value <= 24);
            shift = candidates.sort((a, b) => Math.abs(a) - Math.abs(b))[0] ?? offset;
        }
        return gamutData.positions.map(position => ({ ...position, fret: position.fret + shift }));
    }

    getBaseNotes(key, patternType, pattern) {
        const theory = this.musicTheory;
        if (patternType === 'scale') return theory.getScaleNotes(key, pattern);
        if (patternType === 'chord') return theory.getChordNotes(key, pattern);
        if (patternType === 'interval') return [key, theory.getNoteFromInterval(key, pattern)];
        if (patternType === 'custom') return theory.getCustomNotes(key, pattern);
        if (patternType === 'gamut') return this.getGamutPositions(key, pattern).map(position => this.noteAt(position.string, position.fret));
        return [];
    }

    getLayoutPositions(group, selection, baseNotes) {
        const index = parseInt(selection, 10);
        if (!Number.isInteger(index) || index < 0 || index >= FRETBOARD_LAYOUT_SELECTIONS) return [];
        const theory = this.musicTheory;
        const tuning = this.settings.tuning;
        const last = tuning.length - 1;
        const pitchClasses = new Set(baseNotes.filter(Boolean).map(note => theory.notes.indexOf(theory.toSharp(note))).filter(value => value >= 0));
        const anchor = index % FRETBOARD_LAYOUT_ANCHORS;
        const startsAtAnchor = index < FRETBOARD_LAYOUT_ANCHORS;
        const maxFret = 24;
        const positions = [];
        tuning.forEach((_, stringIndex) => {
            if (group.strings === 'low' && stringIndex >= group.count) return;
            if (group.strings === 'high' && stringIndex <= last - group.count) return;
            if (group.strings === 'middle' && (stringIndex === 0 || stringIndex === last)) return;
            const open = theory.notes.indexOf(theory.toSharp(tuning[stringIndex]));
            const inScale = fret => pitchClasses.has((open + fret) % 12);
            const frets = [];
            if (group.notesPerString) {
                if (startsAtAnchor) {
                    for (let fret = anchor; fret <= maxFret && frets.length < group.notesPerString; fret++) if (inScale(fret)) frets.push(fret);
                } else {
                    for (let fret = anchor; fret >= 0 && frets.length < group.notesPerString; fret--) if (inScale(fret)) frets.push(fret);
                }
            } else {
                const low = startsAtAnchor ? anchor : Math.max(0, anchor - group.span);
                const high = startsAtAnchor ? Math.min(maxFret, anchor + group.span) : anchor;
                for (let fret = low; fret <= high; fret++) if (inScale(fret)) frets.push(fret);
            }
            frets.forEach(fret => positions.push({ string: stringIndex, fret }));
        });
        return positions;
    }

    updatePattern(key, patternType, pattern) {
        const layoutGroup = FRETBOARD_LAYOUT_GROUPS.find(group => group.id === patternType);
        this.currentKey = key;
        this.currentPatternType = patternType;
        this.currentPattern = pattern;
        this.activePositions = [];

        if (layoutGroup) {
            const base = this.layoutBase || { patternType: 'scale', pattern: 'major' };
            let baseNotes = this.getBaseNotes(key, base.patternType, base.pattern);
            if (!baseNotes.length) baseNotes = this.getBaseNotes(key, 'scale', 'major');
            this.activeNotes = [];
            this.activePositions = this.getLayoutPositions(layoutGroup, pattern, baseNotes);
        } else if (patternType === 'scale') {
            this.activeNotes = this.musicTheory.getScaleNotes(key, pattern);
        } else if (patternType === 'chord') {
            this.activeNotes = this.musicTheory.getChordNotes(key, pattern);
        } else if (patternType === 'interval') {
            const targetNote = this.musicTheory.getNoteFromInterval(key, pattern);
            this.activeNotes = [key, targetNote];
        } else if (patternType === 'custom') {
            this.activeNotes = this.musicTheory.getCustomNotes(key, pattern);
        } else if (patternType === 'gamut') {
            this.activePositions = this.getGamutPositions(key, pattern);
            this.activeNotes = [];
        } else {
            this.activeNotes = [];
        }

        if (this.draw) this.draw();
    }

    clearSelectedMarkers() {
        this.selectedMarkers.forEach(mg => {
            mg.classList.remove('selected');
            const marker = mg.querySelector('.note-marker');
            if (marker) {
                marker.setAttribute('stroke', '#000');
                marker.setAttribute('stroke-width', 1);
            }
        });
        this.selectedMarkers = [];
    }

    getCurrentInfo() {
        return {
            tuning: this.settings.tuning.join('-'),
            key: this.currentKey,
            patternType: this.currentPatternType,
            pattern: this.currentPattern
        };
    }

    /**
     * Download the current diagram. The format follows the filename extension (.png or .jpg).
     * v1.0: passes musicTheory so "include info" no longer hangs, appends the link to the DOM
     * (required by Firefox), and sanitises filenames ('#' and '/' broke some downloads).
     */
    async exportImage(filename) {
        let name = filename || 'fretboard.jpg';
        const isPng = /\.png$/i.test(name);
        if (!/\.(png|jpe?g)$/i.test(name)) name += '.jpg';
        const mime = isPng ? 'image/png' : 'image/jpeg';
        name = name.replace(/#/g, 'sharp').replace(/[\\/:*?"<>|]+/g, '_');
        let dataUrl;
        try {
            if (typeof Exporter !== 'undefined' && Exporter.getFretboardImageBase64) {
                const base64 = await Exporter.getFretboardImageBase64({ fretboard: this, musicTheory: this.musicTheory }, { mime, scale: isPng ? 2 : 1 });
                dataUrl = 'data:' + mime + ';base64,' + base64;
            } else if (typeof html2canvas !== 'undefined') {
                const canvas = await html2canvas(this.container);
                dataUrl = canvas.toDataURL(mime);
            } else {
                alert('Image export is unavailable in this browser.');
                return;
            }
        } catch (err) {
            console.error('Image export failed', err);
            alert('Image export failed: ' + (err && err.message ? err.message : err));
            return;
        }
        if (window.ST && ST.download) { ST.download(dataUrl, name); return; }
        const link = document.createElement('a');
        link.download = name;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    getThemeColors() {
        const theme = this.settings?.colorTheme || 'default_ii';
        const defaultColors = {
            background: '#FFFFFF',
            strings: '#888888',
            frets: '#444444',
            markers: '#333333',
            intervals: {}
        };

        let resultColors;
        if (theme === 'custom' && this.settings?.customColors) {
            resultColors = {
                background: this.settings.customColors.background || defaultColors.background,
                strings: this.settings.customColors.strings || defaultColors.strings,
                frets: this.settings.customColors.frets || defaultColors.frets,
                markers: this.settings.customColors.markers || defaultColors.markers,
                intervals: this.settings.customColors.intervals || defaultColors.intervals
            };
        } else {
            const palette = (this.musicTheory?.colorThemes?.[theme]) || (this.musicTheory?.colorThemes?.default) || defaultColors;
            resultColors = { ...defaultColors, ...palette };
        }

        if (this.settings?.forceWhiteBackground) {
            resultColors.background = '#FFFFFF';
        }
        const grayscale = color => {
            const match = String(color || '').match(/^#([0-9a-f]{6})$/i);
            if (!match) return color;
            const hex = match[1];
            const level = Math.round(parseInt(hex.slice(0, 2), 16) * .2126 + parseInt(hex.slice(2, 4), 16) * .7152 + parseInt(hex.slice(4, 6), 16) * .0722);
            return '#' + level.toString(16).padStart(2, '0').repeat(3);
        };
        resultColors.background = grayscale(resultColors.background);
        resultColors.strings = grayscale(resultColors.strings);
        resultColors.frets = grayscale(resultColors.frets);
        resultColors.markers = grayscale(resultColors.markers);
        resultColors.intervals = Object.fromEntries(Object.entries(resultColors.intervals || {}).map(([interval, color]) => [interval, grayscale(color)]));
        Object.entries(this.musicTheory?.intervals || {}).forEach(([interval, data]) => {
            if (!resultColors.intervals[interval]) resultColors.intervals[interval] = grayscale(data.color || '#666666');
        });

        return resultColors;
    }

    debouncedRedrawNotes() {
        if (this.redrawTimeout) clearTimeout(this.redrawTimeout);
        this.redrawTimeout = setTimeout(() => this.drawNotes && this.drawNotes(), 50);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const B = (num >> 8 & 0x00FF) + amt;
        const G = (num & 0x0000FF) + amt;
        return '#' + (
            0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + 
            (G < 255 ? G < 1 ? 0 : G : 255)
        ).toString(16).slice(1);
    }

    applyGlowEffect(element, color) {
        const filterId = 'glow-' + Math.random().toString(36).substr(2, 9);
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);
        filter.innerHTML = `
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        `;
        let defs = this.svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            this.svg.prepend(defs);
        }
        defs.appendChild(filter);
        element.setAttribute('filter', `url(#${filterId})`);
    }

    applyShadowEffect(element) {
        const filterId = 'shadow-' + Math.random().toString(36).substr(2, 9);
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);
        filter.innerHTML = `
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.5"/>
        `;
        let defs = this.svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            this.svg.prepend(defs);
        }
        defs.appendChild(filter);
        element.setAttribute('filter', `url(#${filterId})`);
    }

    applyMetallicEffect(element, y, x1, x2, color) {
        element.setAttribute('stroke', color);
    }

    getProperNoteSpelling(note, key, patternType, pattern) {
        let expectedNotes = [];
        if (patternType === 'scale') {
            expectedNotes = this.musicTheory.getScaleNotes(key, pattern);
        } else if (patternType === 'chord') {
            expectedNotes = this.musicTheory.getChordNotes(key, pattern);
        } else if (patternType === 'interval') {
            expectedNotes = this.musicTheory.spellByDegree(key, ['1', pattern], [key, note]);
        }
        const normalize = value => this.musicTheory.toSharp(value);
        const expected = expectedNotes.find(value => normalize(value) === normalize(note));
        if (expected) return expected;
        if (note === normalize(key)) return key;
        const flats = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
        return key.includes('b') ? flats[note] || note : note;
    }
    
    getContrastColor(hexColor) {
        const hex = hexColor.replace(/^#/, '');
        let r, g, b;
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 125 ? '#000000' : '#FFFFFF';
    }
    
    showNoteEditMenu(markerGroup, marker, text, x, y, color) {
        if (typeof FretboardMenu !== 'undefined') {
            FretboardMenu.showNoteEditMenu(this, markerGroup, marker, text, x, y, color);
        }
    }
    
    showMultiNoteEditMenu(markerGroups, x, y) {
        if (typeof FretboardMenu !== 'undefined') {
            FretboardMenu.showMultiNoteEditMenu(this, markerGroups, x, y);
        }
    }
}