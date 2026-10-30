/** Diagrams keep independent instruments and patterns while sharing appearance. */
if (typeof App !== 'undefined') {
    App.prototype.setupMultipleFretboards = function() {
        const allKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Gb', 'C#', 'Db', 'G#', 'Ab', 'D#', 'Eb', 'A#', 'Bb', 'F'];
        const footer = document.getElementById('instrument-footer');
        if (!footer || !document.getElementById('fretboard')) return;
        this.diagramBoards = [this.fretboard];
        this.diagramSetups = [];
        this.activeDiagram = 0;

        const group = document.createElement('div');
        group.className = 'diagram-controls';
        group.innerHTML = '<div class="control-group"><label for="diagram-count">Fretboard diagrams:</label>' +
            '<select id="diagram-count">' + Array.from({ length: 20 }, (_, i) => i + 1).map(n => '<option value="' + n + '">' + n + '</option>').join('') + '<option value="gauntlet">Gauntlet (20 diagrams)</option><option value="multi-instrument">Multi-Instrument (' + MULTI_INSTRUMENT_SETUPS.length + ' diagrams)</option><option value="all-keys">All Keys (17 diagrams, sharps &amp; flats)</option></select></div>' +
            '<div class="control-group" id="diagram-editor-group" hidden><label for="diagram-editor">Edit diagram:</label>' +
            '<select id="diagram-editor"><option value="0">Diagram 1</option></select></div>';
        footer.insertBefore(group, footer.children[1]);
        // Reuse the existing range controls so both the UI and playback read the same values.
        ['start-fret', 'end-fret'].forEach(id => {
            const input = document.getElementById(id);
            if (input) group.appendChild(input.closest('.control-group'));
        });
        const heading = document.createElement('h3');
        heading.className = 'diagram-heading';
        heading.textContent = 'Diagram 1';
        heading.hidden = true;
        this.fretboard.container.before(heading);
        this.diagramHeadings = [heading];
        this.diagramPatternControls = [];
        const tuningContainer = document.getElementById('tuning-container');
        const tuningHeading = document.createElement('h4');
        tuningHeading.id = 'active-diagram-strings-heading';
        tuningHeading.className = 'diagram-strings-heading';
        tuningHeading.hidden = true;
        tuningContainer.before(tuningHeading);
        const additionalStrings = document.createElement('div');
        additionalStrings.id = 'additional-diagram-strings';
        tuningContainer.after(additionalStrings);

        document.getElementById('diagram-editor').addEventListener('change', event => {
            this.selectFretboardDiagram(Number(event.target.value));
        });
        document.getElementById('diagram-count').addEventListener('change', event => {
            this.updateFretboard();
            const gauntlet = event.target.value === 'gauntlet';
            const multiInstrument = event.target.value === 'multi-instrument';
            const allKeyDiagrams = event.target.value === 'all-keys';
            const source = JSON.parse(JSON.stringify(this.diagramSetups[this.activeDiagram]));
            const count = gauntlet ? 20 : multiInstrument ? MULTI_INSTRUMENT_SETUPS.length : allKeyDiagrams ? allKeys.length : Number(event.target.value);
            if (this.activeDiagram >= count) this.selectFretboardDiagram(0);
            while (this.diagramBoards.length > count) {
                const board = this.diagramBoards.pop();
                window.removeEventListener('resize', board.queueResponsiveDraw);
                board.resizeObserver?.disconnect();
                clearTimeout(board.resizeTimeout);
                clearTimeout(board.redrawTimeout);
                board.container.remove();
                this.diagramHeadings.pop().remove();
                this.diagramPatternControls.pop()?.remove();
                this.diagramSetups.pop();
            }
            while (this.diagramBoards.length < count) {
                const index = this.diagramBoards.length;
                const label = document.createElement('h3');
                label.className = 'diagram-heading';
                label.textContent = 'Diagram ' + (index + 1);
                const container = document.createElement('div');
                container.id = 'fretboard-' + (index + 1);
                container.className = 'additional-fretboard';
                container.setAttribute('role', 'region');
                container.setAttribute('aria-label', 'Interactive fretboard diagram ' + (index + 1));
                container.tabIndex = 0;
                // Standalone moves option rows into its Setup dock, so diagrams then chain container to container.
                const previousRow = this.diagramPatternControls[index - 1];
                const previousBoard = this.diagramBoards[index - 1];
                (previousRow && previousRow.parentElement === previousBoard.container.parentElement ? previousRow : previousBoard.container).after(label, container);
                this.diagramHeadings.push(label);
                this.diagramBoards.push(new Fretboard(container.id, this.musicTheory));
                this.diagramSetups.push(JSON.parse(JSON.stringify(this.diagramSetups[this.activeDiagram])));
            }
            if (gauntlet) {
                const tunings = ['EA', 'AD', 'DG', 'GB', 'BE', 'EA', 'AD', 'DG', 'GB', 'BE', 'EAD', 'ADG', 'DGB', 'GBE', 'EADG', 'ADGB', 'DGBE', 'EADGBE', 'EADGBE', 'EADGBE'];
                const selectedStrings = [[6, 4, 1], [5, 3, 1], [4, 2, 1]];
                const { key, patternType, pattern } = this.diagramSetups[this.activeDiagram];
                this.diagramSetups = tunings.map((notes, index) => ({
                    key, patternType, pattern,
                    instrument: 'acoustic_guitar',
                    preset: 'standard',
                    tuning: notes.split(''),
                    startFret: this.settings.startFret,
                    endFret: this.settings.endFret,
                    // Standard-guitar array indices run from string 6 (low E) to string 1 (high E).
                    visibleStrings: [...notes].map((_, stringIndex) => index < 5 ? stringIndex === 0 : index < 17 || selectedStrings[index - 17].includes(6 - stringIndex)),
                    stringStartFrets: Array(notes.length).fill(0),
                    stringEndFrets: Array(notes.length).fill(24)
                }));
                this.selectFretboardDiagram(0);
            }
            if (multiInstrument) {
                const { key, patternType, pattern } = this.diagramSetups[this.activeDiagram];
                this.diagramSetups = MULTI_INSTRUMENT_SETUPS.map(reference => ({
                    ...JSON.parse(JSON.stringify(reference)), key, patternType, pattern,
                    startFret: this.settings.startFret, endFret: this.settings.endFret,
                    visibleStrings: reference.tuning.map(() => true),
                    stringStartFrets: reference.tuning.map(() => 0),
                    stringEndFrets: reference.tuning.map(() => 24)
                }));
                this.selectFretboardDiagram(0);
            }
            if (allKeyDiagrams) {
                this.diagramSetups = allKeys.map(key => {
                    const setup = { ...JSON.parse(JSON.stringify(source)), key };
                    if (source.patternType === 'gamut') {
                        setup.gamutReferenceKey = source.gamutReferenceKey || source.key;
                        setup.startFret = 0;
                        setup.endFret = 24;
                        setup.stringStartFrets.fill(0);
                        setup.stringEndFrets.fill(24);
                    }
                    return setup;
                });
                this.selectFretboardDiagram(Math.max(0, allKeys.indexOf(source.key)));
            }
            const editor = document.getElementById('diagram-editor');
            editor.replaceChildren(...this.diagramBoards.map((board, i) => new Option(this.getDiagramTitle(i), i)));
            editor.value = String(this.activeDiagram);
            document.getElementById('diagram-editor-group').hidden = count === 1;
            this.diagramHeadings.forEach(label => { label.hidden = count === 1; });
            this.updateFretboard();
        });
    };

    App.prototype.getDiagramTitle = function(index) {
        return this.diagramHeadings[index]?.dataset.diagramTitle || 'Diagram ' + (index + 1);
    };

    // Titles are shown in the heading above each board, the Edit diagram list and the row title box.
    App.prototype.setDiagramTitle = function(index, value) {
        const heading = this.diagramHeadings[index];
        if (!heading) return;
        const previous = this.getDiagramTitle(index);
        heading.dataset.diagramTitle = value.trim();
        // Headings are built as title + suffix, so only the title part changes in real time.
        heading.textContent = this.getDiagramTitle(index) + heading.textContent.slice(previous.length);
        const option = document.querySelector('#diagram-editor option[value="' + index + '"]');
        if (option) option.textContent = this.getDiagramTitle(index);
    };

    App.prototype.selectFretboardDiagram = function(index) {
        const setup = this.diagramSetups[index];
        if (!setup || !this.diagramBoards[index]) return;
        this.activeDiagram = index;
        this.fretboard = this.diagramBoards[index];
        document.getElementById('diagram-editor').value = String(index);
        const instrument = document.getElementById('instrument-select');
        instrument.value = setup.instrument;
        const presets = document.getElementById('tuning-preset');
        presets.replaceChildren(...Object.keys(this.instrumentPresets[setup.instrument]?.tunings || {}).map(id =>
            new Option(id.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()), id)));
        presets.value = setup.preset;
        document.getElementById('string-count').max = Math.max(20, setup.tuning.length);
        document.getElementById('string-count').value = setup.tuning.length;
        document.getElementById('start-fret').value = setup.startFret;
        document.getElementById('end-fret').value = setup.endFret;
        this.updateTuningInputs(setup.tuning.slice());
        document.querySelectorAll('.show-string-notes').forEach((input, i) => { input.checked = setup.visibleStrings[i] ?? true; });
        document.querySelectorAll('.string-start-fret').forEach((input, i) => { input.value = setup.stringStartFrets[i] ?? 0; });
        document.querySelectorAll('.string-end-fret').forEach((input, i) => { input.value = setup.stringEndFrets[i] ?? 24; });
        document.getElementById('key-select').value = setup.key;
        document.getElementById('pattern-type').value = setup.patternType;
        this.updatePatternSelect();
        document.getElementById('pattern-select').value = setup.pattern;
        this.setLayoutBase(setup.layoutBase?.patternType || 'scale', setup.layoutBase?.pattern || 'major');
        const customImport = document.getElementById('custom-pattern-import-group');
        if (customImport) customImport.style.display = setup.patternType === 'custom' ? 'flex' : 'none';
        this.updateFretboard();
    };

    App.prototype.syncFretboardDiagrams = function() {
        if (!this.diagramBoards) return;
        const settings = this.settings;
        const previous = this.diagramSetups[this.activeDiagram];
        const sameInstrument = previous?.instrument === document.getElementById('instrument-select').value && previous?.tuning.length === settings.tuning.length;
        this.diagramSetups[this.activeDiagram] = {
            ...(sameInstrument ? previous : {}),
            referenceLayout: sameInstrument ? !!previous.referenceLayout : false,
            key: document.getElementById('key-select').value,
            patternType: document.getElementById('pattern-type').value,
            pattern: document.getElementById('pattern-select').value,
            layoutBase: this.getLayoutBase(),
            instrument: document.getElementById('instrument-select').value,
            preset: document.getElementById('tuning-preset').value,
            tuning: settings.tuning.slice(),
            startFret: settings.startFret,
            endFret: settings.endFret,
            visibleStrings: settings.visibleStrings.slice(),
            stringStartFrets: settings.stringStartFrets.slice(),
            stringEndFrets: settings.stringEndFrets.slice()
        };
        if (document.getElementById('diagram-count').value === 'all-keys') {
            const active = this.diagramSetups[this.activeDiagram];
            const patternChanged = previous?.patternType !== active.patternType || previous?.pattern !== active.pattern;
            const gamutReferenceKey = active.patternType === 'gamut'
                ? patternChanged || !active.gamutReferenceKey ? active.key : active.gamutReferenceKey
                : null;
            this.diagramSetups.forEach(setup => {
                setup.patternType = active.patternType;
                setup.pattern = active.pattern;
                setup.gamutReferenceKey = gamutReferenceKey;
            });
            if (active.patternType === 'gamut' && settings.gamutReferenceKey !== gamutReferenceKey) {
                settings.gamutReferenceKey = gamutReferenceKey;
                this.fretboard.updateSettings({ gamutReferenceKey });
                this.fretboard.updatePattern(active.key, active.patternType, active.pattern);
            }
        }
        this.diagramBoards.forEach((board, index) => {
            this.diagramHeadings[index].classList.toggle('is-editing', index === this.activeDiagram);
            const current = this.diagramSetups[index];
            const mode = document.getElementById('diagram-count').value;
            const name = this.instrumentPresets[current.instrument]?.name || current.instrument;
            let pitches = current.tuning.map((note, i) => current.originalTuning?.[i] === note ? current.pitchLabels[i] : note);
            if (current.instrument === 'piano' && current.referenceLayout) pitches = board.getPianoDisplayKeys(current.key, current).map(key => key.label);
            const tuningTitle = pitches.length > 20 ? pitches[0] + ' to ' + pitches[pitches.length - 1] : pitches.join('-');
            const shown = current.visibleStrings.flatMap((visible, i) => visible ? [current.tuning.length - i] : []);
            this.diagramHeadings[index].textContent = this.getDiagramTitle(index) + (mode === 'all-keys' ? ' - ' + current.key + ' - ' + current.patternType + ' - ' + (document.getElementById('pattern-select').value === current.pattern && document.getElementById('pattern-type').value === current.patternType ? document.getElementById('pattern-select').selectedOptions[0]?.textContent || current.pattern : current.pattern) + ' - ' + name + ' - ' + tuningTitle : mode === 'gauntlet' || mode === 'multi-instrument' ? ' - ' + name + ' - ' + current.tuning.length + (current.instrument === 'piano' ? ' keys' : ' strings') + ' - ' + tuningTitle + (shown.length < current.tuning.length ? ' - Notes on strings ' + shown.join(', ') : '') + (current.setupNote ? ' - ' + current.setupNote : '') : '');
            if (board === this.fretboard) return;
            const { instrument, preset, key, patternType, pattern, layoutBase, ...setup } = this.diagramSetups[index];
            board.layoutBase = layoutBase;
            board.updateSettings({ ...settings, ...setup, instrument, referenceLayout: !!setup.referenceLayout, gamutReferenceKey: setup.gamutReferenceKey || null });
            if (patternType === 'lesson') {
                const lesson = this.lessons[Number(pattern)];
                board.updatePattern(key, lesson?.patternType || 'lesson', lesson?.patternId || pattern);
            } else {
                board.updatePattern(key, patternType === 'grid' || patternType === 'grid2' ? 'scale' : patternType, patternType === 'grid' || patternType === 'grid2' ? 'major' : pattern);
            }
        });
        const editorSummary = document.getElementById('instrument-editor-summary');
        if (editorSummary) {
            const active = this.diagramSetups[this.activeDiagram];
            const preset = this.instrumentPresets[active.instrument];
            const pitches = active.tuning || settings.tuning || [];
            const instrumentName = preset?.name || active.instrument;
            const isPiano = active.instrument === 'piano';
            const pitchPreview = pitches.length > 8 ? pitches[0] + ' … ' + pitches[pitches.length - 1] : pitches.join('–');
            const countLabel = pitches.length + (isPiano ? ' keys' : ' strings');
            const rangeLabel = active.referenceLayout ? 'Reference map' : 'Fret window ' + active.startFret + '–' + active.endFret;
            const pitchLabel = isPiano ? 'Key pitches' : 'Open pitches (low to high)';
            editorSummary.textContent = 'Editing Diagram ' + (this.activeDiagram + 1) + ' of ' + this.diagramBoards.length + ' · ' + instrumentName + ' · ' + countLabel + ' · ' + pitchLabel + ': ' + pitchPreview + ' · ' + rangeLabel;
            editorSummary.title = pitchLabel + ': ' + pitches.join(' – ') + (active.referenceLayout ? '' : ' · ' + rangeLabel);
        }
        const otherStrings = document.getElementById('instrument-other-strings');
        if (otherStrings) otherStrings.hidden = this.diagramBoards.length === 1;
        this.renderDiagramPatternControls();
        this.renderDiagramStringControls();
    };

    App.prototype.renderDiagramPatternControls = function() {
        this.diagramBoards.forEach((board, index) => {
            let controls = this.diagramPatternControls[index];
            if (!controls) {
                controls = document.createElement('div');
                controls.className = 'diagram-pattern-controls';
                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.className = 'diagram-title-input';
                titleInput.maxLength = 40;
                titleInput.setAttribute('aria-label', 'Diagram ' + (index + 1) + ' title');
                titleInput.addEventListener('input', () => this.setDiagramTitle(index, titleInput.value));
                controls.appendChild(titleInput);
                ['key-select', 'pattern-type', 'pattern-select'].forEach((sourceId, field) => {
                    const label = document.createElement('label');
                    label.textContent = ['Key', 'Type', 'Selection'][field];
                    const input = document.createElement('select');
                    input.setAttribute('aria-label', 'Diagram ' + (index + 1) + ' ' + label.textContent);
                    if (field < 2) {
                        Array.from(document.getElementById(sourceId).options).forEach(option => input.appendChild(new Option(option.textContent, option.value)));
                    }
                    input.addEventListener('change', () => {
                        const value = input.value;
                        if (index !== this.activeDiagram) this.selectFretboardDiagram(index);
                        document.getElementById(sourceId).value = value;
                        if (field === 1) this.updatePatternSelect();
                        document.getElementById(sourceId).dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    label.appendChild(input);
                    controls.appendChild(label);
                });
                [['layout-base-type', 'Base type'], ['layout-base-select', 'Base']].forEach(([sourceId, text]) => {
                    const label = document.createElement('label');
                    label.className = 'diagram-layout-base';
                    label.textContent = text;
                    const input = document.createElement('select');
                    input.setAttribute('aria-label', 'Diagram ' + (index + 1) + ' ' + text);
                    if (sourceId === 'layout-base-type') Array.from(document.getElementById(sourceId).options).forEach(option => input.appendChild(new Option(option.textContent, option.value)));
                    input.addEventListener('change', () => {
                        const value = input.value;
                        if (index !== this.activeDiagram) this.selectFretboardDiagram(index);
                        document.getElementById(sourceId).value = value;
                        document.getElementById(sourceId).dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    label.appendChild(input);
                    controls.appendChild(label);
                });
                board.container.after(controls);
                this.diagramPatternControls[index] = controls;
            }
            controls.hidden = false;
            const titleInput = controls.querySelector('.diagram-title-input');
            // Keep the text being typed; otherwise show the stored title. Single diagrams hide the box.
            if (document.activeElement !== titleInput) titleInput.value = this.getDiagramTitle(index);
            titleInput.hidden = this.diagramBoards.length === 1;
            const setup = this.diagramSetups[index];
            const inputs = controls.querySelectorAll('select');
            inputs[0].value = setup.key;
            inputs[1].value = setup.patternType;
            const signature = setup.patternType + ':' + Object.keys(this.musicTheory.customPatterns || {}).join(',');
            if (inputs[2].dataset.options !== signature) {
                this.updatePatternSelect(setup.patternType, inputs[2]);
                inputs[2].dataset.options = signature;
            }
            inputs[2].value = setup.pattern;
            const isLayout = typeof FRETBOARD_LAYOUT_GROUPS !== 'undefined' && FRETBOARD_LAYOUT_GROUPS.some(group => group.id === setup.patternType);
            const base = setup.layoutBase || { patternType: 'scale', pattern: 'major' };
            const [baseType, baseSelect] = controls.querySelectorAll('.diagram-layout-base select');
            controls.querySelectorAll('.diagram-layout-base').forEach(label => { label.style.display = isLayout ? '' : 'none'; });
            baseType.value = base.patternType;
            if (baseSelect.dataset.options !== base.patternType) {
                this.updatePatternSelect(base.patternType, baseSelect);
                baseSelect.dataset.options = base.patternType;
            }
            baseSelect.value = base.pattern;
        });
        const quick = document.getElementById('diagram-instrument-controls');
        const activeControls = this.diagramPatternControls[this.activeDiagram];
        if (quick && activeControls?.nextElementSibling !== quick) activeControls.after(quick);
    };

    App.prototype.renderDiagramStringControls = function() {
        const host = document.getElementById('additional-diagram-strings');
        if (!host) return;
        const heading = document.getElementById('active-diagram-strings-heading');
        heading.hidden = this.diagramBoards.length === 1;
        heading.textContent = 'Diagram ' + (this.activeDiagram + 1) + ' - Strings';
        // Keep existing inputs mounted while editing so focus and number steppers keep working.
        const structure = this.activeDiagram + ':' + this.diagramSetups.map(setup => setup.tuning.length).join(',');
        if (host.dataset.structure !== structure) {
            host.replaceChildren();
            host.dataset.structure = structure;
            this.diagramSetups.forEach((setup, index) => {
                if (index === this.activeDiagram) return;
                const section = document.createElement('fieldset');
                section.className = 'diagram-string-options';
                const legend = document.createElement('legend');
                legend.textContent = 'Diagram ' + (index + 1) + ' - Strings';
                section.appendChild(legend);
                const rows = document.createElement('div');
                rows.className = 'diagram-string-rows';
                setup.tuning.forEach((note, stringIndex) => {
                    const row = document.createElement('div');
                    row.className = 'diagram-string-row';
                    const title = document.createElement('span');
                    title.textContent = (setup.instrument === 'piano' ? 'Key ' : 'String ') + (setup.referenceLayout ? stringIndex + 1 : setup.tuning.length - stringIndex);
                    row.appendChild(title);
                    const fields = [
                        ['tuning', 'Open pitch', 'select'],
                        ['visibleStrings', 'Show notes', 'checkbox'],
                        ['stringStartFrets', 'From fret', 'number'],
                        ['stringEndFrets', 'To fret', 'number']
                    ];
                    fields.forEach(([field, text, type]) => {
                        const label = document.createElement('label');
                        label.appendChild(document.createTextNode(text));
                        const input = document.createElement(type === 'select' ? 'select' : 'input');
                        if (type === 'select') {
                            this.musicTheory.notes.forEach(value => input.appendChild(new Option(value, value)));
                        } else {
                            input.type = type;
                            if (type === 'number') { input.min = '0'; input.max = '24'; input.step = '1'; }
                        }
                        input.dataset.diagram = index;
                        input.dataset.string = stringIndex;
                        input.dataset.field = field;
                        input.setAttribute('aria-label', 'Diagram ' + (index + 1) + ', ' + title.textContent + ', ' + text);
                        input.addEventListener('change', () => {
                            const current = this.diagramSetups[index];
                            if (type === 'number' && (!input.value.trim() || !Number.isInteger(Number(input.value)) || Number(input.value) < 0 || Number(input.value) > 24)) {
                                input.value = current[field][stringIndex];
                                return;
                            }
                            current[field][stringIndex] = type === 'checkbox' ? input.checked : type === 'number' ? Number(input.value) : input.value;
                            if (type === 'number' && current.stringStartFrets[stringIndex] > current.stringEndFrets[stringIndex]) {
                                const other = field === 'stringStartFrets' ? 'stringEndFrets' : 'stringStartFrets';
                                current[other][stringIndex] = current[field][stringIndex];
                            }
                            this.updateFretboard();
                        });
                        label.appendChild(input);
                        row.appendChild(label);
                    });
                    rows.appendChild(row);
                });
                section.appendChild(rows);
                if (setup.tuning.length > 20) {
                    const details = document.createElement('details');
                    const summary = document.createElement('summary');
                    summary.textContent = 'Diagram ' + (index + 1) + ' - ' + setup.tuning.length + ' pitch controls';
                    details.append(summary, section);
                    host.appendChild(details);
                } else host.appendChild(section);
            });
        }
        host.querySelectorAll('[data-field]').forEach(input => {
            const setup = this.diagramSetups[Number(input.dataset.diagram)];
            const field = input.dataset.field;
            const value = setup[field][Number(input.dataset.string)];
            if (field === 'visibleStrings') input.checked = value ?? true;
            else input.value = value ?? (field === 'stringEndFrets' ? 24 : 0);
        });
    };
}
