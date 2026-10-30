(() => {
    'use strict';
    const defaults = { pitch: '', string: '', roots: false, conceal: false, peek: false, compact: false, large: false, wide: false, focus: false, motion: false };
    let state = { ...defaults };
    let target = '', revealed = false, timer = null, remaining = 300, repetitions = 0;
    const byId = id => document.getElementById(id);
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const normalize = note => window.app?.musicTheory.toSharp(note) || note;
    const redraw = () => (window.app?.diagramBoards || []).forEach(board => board.draw());

    // Study filters affect the drawing, not the underlying pattern or playback notes.
    const drawMarker = Fretboard.prototype.drawNoteMarker;
    Fretboard.prototype.drawNoteMarker = function(x, y, color, text, textColor, pitch, position = {}) {
        if (state.pitch && normalize(pitch) !== state.pitch) return;
        if (state.string && this.settings.tuning.length - position.stringIndex !== Number(state.string)) return;
        drawMarker.call(this, x, y, color, text, textColor, pitch, position);
        const group = this.svg.lastElementChild;
        if (!group?.classList.contains('note-marker-group')) return;
        group.classList.toggle('new-ui-root', state.roots && normalize(pitch) === normalize(this.currentKey));
        group.classList.toggle('new-ui-conceal', state.conceal);
        group.classList.toggle('new-ui-peek', state.peek);
        group.classList.toggle('new-ui-answer', revealed && normalize(pitch) === target);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const app = window.app, panel = byId('new-ui-footer');
        let extras;
        if (!app || !panel) return;
        const status = document.createElement('p');
        status.id = 'new-ui-status';
        status.setAttribute('role', 'status');
        const say = text => { if (status.textContent !== text) status.textContent = text; };
        const run = action => async () => {
            try { await action(); }
            catch (error) { say(error.message || 'This action could not be completed.'); }
        };
        const section = (id, title) => {
            const fieldset = document.createElement('fieldset');
            fieldset.id = 'new-ui-' + id;
            const legend = document.createElement('legend');
            legend.textContent = title;
            fieldset.append(legend);
            panel.append(fieldset);
            return fieldset;
        };
        const row = (section, id, title) => {
            const group = document.createElement('div');
            group.className = 'control-group';
            group.dataset.newFeature = id;
            const label = document.createElement('label');
            label.textContent = title;
            label.htmlFor = 'new-ui-control-' + id;
            group.append(label);
            section.append(group);
            return group;
        };
        const buttons = (section, id, title, actions) => {
            const group = row(section, id, title);
            group.querySelector('label').removeAttribute('for');
            const actionsElement = document.createElement('div');
            actionsElement.className = 'new-ui-actions';
            actions.forEach(([text, action]) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = text;
                button.addEventListener('click', run(action));
                actionsElement.append(button);
            });
            group.append(actionsElement);
            return group;
        };
        const checkbox = (section, id, title) => {
            const group = row(section, id, title);
            const input = document.createElement('input');
            input.type = 'checkbox'; input.id = 'new-ui-control-' + id;
            input.addEventListener('change', () => { state[id] = input.checked; apply(); });
            group.append(input);
        };
        const select = (section, id, title, options, action) => {
            const group = row(section, id, title);
            const input = document.createElement('select');
            input.id = 'new-ui-control-' + id;
            input.replaceChildren(...options.map(([value, text]) => new Option(text, value)));
            input.addEventListener('change', () => action(input.value));
            group.append(input);
            return input;
        };
        const change = (id, value) => {
            const input = byId(id);
            input.value = value;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const randomChoice = input => {
            const choices = Array.from(input.options).filter(option => !option.disabled && option.value !== input.value);
            if (!choices.length) { say('No other choices available.'); return; }
            change(input.id, choices[Math.floor(Math.random() * choices.length)].value);
        };
        const navigate = section('navigation', 'Navigation');
        buttons(navigate, 'diagram', 'Switch diagram', [
            ['Previous', () => app.selectFretboardDiagram((app.activeDiagram - 1 + app.diagramBoards.length) % app.diagramBoards.length)],
            ['Next', () => app.selectFretboardDiagram((app.activeDiagram + 1) % app.diagramBoards.length)]
        ]);
        buttons(navigate, 'random-key', 'Explore another key', [['Random key', () => randomChoice(byId('key-select'))]]);
        buttons(navigate, 'random-pattern', 'Explore another selection', [['Random selection', () => randomChoice(byId('pattern-select'))]]);
        const shift = delta => {
            const start = byId('start-fret'), end = byId('end-fret');
            const movement = Math.max(-Number(start.value), Math.min(delta, Number(end.max || 24) - Number(end.value)));
            start.value = Number(start.value) + movement;
            end.value = Number(end.value) + movement;
            app.updateFretboard();
        };
        buttons(navigate, 'shift-window', 'Move fret window', [['One fret lower', () => shift(-1)], ['One fret higher', () => shift(1)]]);
        buttons(navigate, 'find-root', 'Locate a visible root', [['Go to root', () => {
            const board = app.fretboard;
            const marker = Array.from(board.svg.querySelectorAll('[data-pitch]')).find(node => normalize(node.dataset.pitch) === normalize(board.currentKey));
            if (!marker) { say('No root is visible. Try another fret window or clear note filters.'); return; }
            marker.parentElement.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
            marker.parentElement.focus();
        }]]);

        const study = section('study', 'Fretted-Note Study');
        select(study, 'pitch', 'Focus on a pitch', [['', 'All pattern pitches'], ...notes.map(note => [note, note])], value => { state.pitch = value; apply(); });
        const stringSelect = select(study, 'string', 'Focus on a string', [['', 'All strings']], value => { state.string = value; apply(); });
        checkbox(study, 'roots', 'Outline root notes');
        checkbox(study, 'conceal', 'Conceal note labels');
        checkbox(study, 'peek', 'Reveal concealed labels on hover or focus');
        const syncStrings = () => {
            const count = app.fretboard.settings.tuning.length;
            if (stringSelect.options.length === count + 1) return;
            stringSelect.replaceChildren(new Option('All strings', ''), ...Array.from({ length: count }, (_, i) => new Option('String ' + (i + 1), String(i + 1))));
            const invalid = Number(state.string) > count;
            if (invalid) state.string = '';
            stringSelect.value = state.string;
            if (invalid) redraw();
        };
        const update = App.prototype.updateFretboard;
        App.prototype.updateFretboard = function(...args) { const result = update.apply(this, args); syncStrings(); return result; };
        syncStrings();

        const practice = section('practice', 'Practice');
        const targetRow = buttons(practice, 'target', 'Find a pattern pitch', [['Pick a pitch', () => {
            const board = app.fretboard;
            const pitches = [...new Set(Array.from(board.svg.querySelectorAll('[data-pitch]'), marker => normalize(marker.dataset.pitch)))];
            if (!pitches.length) { say('Choose a pattern with visible notes first.'); return; }
            target = pitches[Math.floor(Math.random() * pitches.length)];
            revealed = false; targetOutput.textContent = 'Find ' + target; redraw();
        }]]);
        const targetOutput = document.createElement('output'); targetRow.append(targetOutput);
        buttons(practice, 'reveal', 'Check the target pitch', [['Show / hide answer', () => {
            if (!target) { say('Pick a pitch first.'); return; }
            revealed = !revealed; redraw();
            say(revealed ? 'Outlined visible ' + target + ' positions.' : 'Answer hidden.');
        }]]);
        const clockRow = buttons(practice, 'timer', 'Practice countdown', [
            ['Start / pause', () => {
                if (timer) { clearInterval(timer); timer = null; return; }
                if (remaining <= 0) remaining = Number(duration.value) * 60;
                timer = setInterval(() => {
                    remaining--; renderClock();
                    if (remaining <= 0) { clearInterval(timer); timer = null; say('Practice time complete.'); }
                }, 1000);
            }],
            ['Reset', () => { clearInterval(timer); timer = null; remaining = Number(duration.value) * 60; renderClock(); }]
        ]);
        const duration = document.createElement('select');
        duration.setAttribute('aria-label', 'Practice duration');
        duration.replaceChildren(...[1, 3, 5, 10, 15, 20, 30].map(n => new Option(n + ' min', n)));
        duration.value = '5';
        duration.addEventListener('change', () => { clearInterval(timer); timer = null; remaining = Number(duration.value) * 60; renderClock(); });
        const clock = document.createElement('output'); clock.setAttribute('aria-label', 'Time remaining');
        const renderClock = () => { clock.textContent = Math.floor(remaining / 60) + ':' + String(remaining % 60).padStart(2, '0'); };
        clockRow.append(duration, clock); renderClock();
        const countRow = buttons(practice, 'counter', 'Completed repetitions', [
            ['+1', () => { repetitions++; counter.textContent = repetitions; }],
            ['Reset', () => { repetitions = 0; counter.textContent = '0'; }]
        ]);
        const counter = document.createElement('output'); counter.textContent = '0'; counter.setAttribute('aria-live', 'polite'); countRow.append(counter);
        const notesRow = row(practice, 'notes', 'Session notes');
        const sessionNotes = document.createElement('textarea'); sessionNotes.id = 'new-ui-control-notes'; sessionNotes.rows = 3; sessionNotes.maxLength = 4000;
        notesRow.append(sessionNotes);
        try { sessionNotes.value = localStorage.getItem('fb-new-ui-notes') || ''; } catch (_) {}
        sessionNotes.addEventListener('input', () => { try { localStorage.setItem('fb-new-ui-notes', sessionNotes.value); } catch (_) { say('Notes cannot be saved in this browser.'); } });

        const workspace = section('workspace', 'Workspace');
        const appearanceIds = ['display-mode', 'color-theme', 'note-size', 'note-shape', 'note-font-size', 'string-height', 'fret-width', 'string-spacing', 'show-fret-numbers', 'force-white-background'];
        buttons(workspace, 'save', 'Save a local checkpoint', [['Save checkpoint', () => {
            app.updateFretboard();
            const controls = Object.fromEntries(appearanceIds.map(id => { const input = byId(id); return [id, input.type === 'checkbox' ? input.checked : input.value]; }));
            const snapshot = { mode: byId('diagram-count').value, diagrams: app.diagramSetups, titles: app.diagramBoards.map((_, i) => app.getDiagramTitle(i)), active: app.activeDiagram, controls, study: state, extras: extras?.snapshot() };
            localStorage.setItem('fb-new-ui-checkpoint', JSON.stringify(snapshot));
            say('Checkpoint saved on this browser.');
        }]]);
        buttons(workspace, 'restore', 'Restore the saved checkpoint', [['Restore checkpoint', () => {
            const snapshot = JSON.parse(localStorage.getItem('fb-new-ui-checkpoint') || 'null');
            if (!snapshot?.diagrams?.length) { say('No checkpoint saved yet.'); return; }
            change('diagram-count', snapshot.mode);
            app.diagramSetups = structuredClone(snapshot.diagrams);
            Object.entries(snapshot.controls).forEach(([id, value]) => { const input = byId(id); if (input) { if (input.type === 'checkbox') input.checked = value; else input.value = value; } });
            snapshot.titles.forEach((title, i) => app.setDiagramTitle(i, title));
            state = { ...defaults, ...snapshot.study };
            app.selectFretboardDiagram(Math.min(snapshot.active, app.diagramBoards.length - 1));
            extras?.restore(snapshot.extras); syncInputs(); apply(); say('Checkpoint restored.');
        }]]);
        const summary = () => {
            app.updateFretboard();
            return app.diagramSetups.map((setup, i) => [app.getDiagramTitle(i), 'Key: ' + setup.key, 'Pattern: ' + setup.patternType + ' / ' + setup.pattern, 'Tuning (low to high): ' + setup.tuning.join(' '), 'Frets: ' + setup.startFret + '-' + setup.endFret].join('\n')).join('\n\n') + '\n\nRepetitions: ' + repetitions + '\nSession notes:\n' + sessionNotes.value;
        };
        buttons(workspace, 'copy', 'Copy a text practice sheet', [['Copy text', async () => { await navigator.clipboard.writeText(summary()); say('Practice sheet copied.'); }]]);
        buttons(workspace, 'download', 'Download a text practice sheet', [['Download .txt', () => {
            const url = URL.createObjectURL(new Blob([summary()], { type: 'text/plain' }));
            const link = document.createElement('a'); link.href = url; link.download = 'fretboard-practice.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
            say('Practice sheet downloaded.');
        }]]);
        buttons(workspace, 'reset-ui', 'Reset New UI view preferences', [['Reset view', () => {
            state = { ...defaults }; target = ''; revealed = false; targetOutput.textContent = ''; extras?.reset(); syncInputs(); apply();
            say('New UI view preferences reset. Your diagrams, checkpoint and notes are unchanged.');
        }]]);

        const comfort = section('accessibility', 'Accessibility & Spacing');
        checkbox(comfort, 'compact', 'Compact control spacing');
        checkbox(comfort, 'large', 'Larger control text');
        checkbox(comfort, 'wide', 'Full-width input fields');
        checkbox(comfort, 'focus', 'Stronger keyboard focus outlines');
        checkbox(comfort, 'motion', 'Reduce interface motion');
        extras = window.installStandaloneNewUiExtras({ app, panel, section, row, buttons, select, say, redraw, getRepetitions: () => repetitions, sessionNotes });
        panel.append(status);
        function syncInputs() {
            Object.keys(defaults).forEach(id => {
                const input = byId('new-ui-control-' + id);
                if (!input) return;
                if (input.type === 'checkbox') input.checked = state[id]; else input.value = state[id];
            });
        }
        function apply() {
            ['compact', 'large', 'wide', 'focus', 'motion'].forEach(key => document.body.classList.toggle('fb-ui-' + key, state[key]));
            redraw();
        }
        window.addEventListener('pagehide', () => clearInterval(timer));
    });
})();
