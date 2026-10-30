window.installStandaloneNewUiExtras = ({ app, panel, section, row, buttons, select, say, redraw, getRepetitions, sessionNotes }) => {
    const byId = id => document.getElementById(id);
    const pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const intervals = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
    const pitchIndex = note => pitches.indexOf(app.musicTheory.toSharp(note));
    const defaults = { interval: '', parity: '', region: '', minFret: 0, maxFret: 24, noOpen: false, spelling: '', fretLabel: false, stringLabel: false, textOutline: false, mono: '', rootScale: 1, nonRootOpacity: 1, borderWidth: 1, borderColor: '#000000', rootColor: '' };
    let view = { ...defaults };
    const change = (id, value) => {
        const input = byId(id);
        if (!input || !Array.from(input.options || []).some(option => option.value === String(value))) throw new Error('That choice is not available.');
        input.value = value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const number = (parent, id, title, value, min, max, action, step = 1) => {
        const group = row(parent, id, title);
        const input = document.createElement('input');
        input.id = 'new-ui-control-' + id; input.type = 'number'; input.min = min; input.max = max; input.step = step; input.value = value;
        input.addEventListener('change', () => {
            const parsed = Number(input.value);
            const bounded = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : value;
            input.value = bounded; action(bounded);
        });
        group.append(input);
        return input;
    };
    const check = (parent, id, title, action) => {
        const group = row(parent, id, title), input = document.createElement('input');
        input.type = 'checkbox'; input.id = 'new-ui-control-' + id;
        input.addEventListener('change', () => action(input.checked)); group.append(input);
        return input;
    };
    const output = group => {
        const element = document.createElement('output'); element.className = 'new-ui-report';
        element.setAttribute('aria-live', 'polite'); group.append(element); return element;
    };
    const save = (key, value) => localStorage.setItem('fb-new-ui-' + key, JSON.stringify(value));
    const read = key => {
        try { const value = JSON.parse(localStorage.getItem('fb-new-ui-' + key) || '[]'); return Array.isArray(value) ? value : []; }
        catch (_) { return []; }
    };
    const download = (name, text, type) => {
        const url = URL.createObjectURL(new Blob([text], { type }));
        const link = document.createElement('a'); link.href = url; link.download = name; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    // Decorate only markers that the existing study filters actually drew.
    const drawMarker = Fretboard.prototype.drawNoteMarker;
    Fretboard.prototype.drawNoteMarker = function(x, y, color, text, textColor, pitch, position = {}) {
        const { stringIndex, fretNum } = position;
        const semitones = (pitchIndex(pitch) - pitchIndex(this.currentKey) + 12) % 12;
        const stringNumber = this.settings.tuning.length - stringIndex;
        const count = this.settings.tuning.length;
        if (view.interval !== '' && semitones !== Number(view.interval)) return;
        if (Number.isInteger(fretNum)) {
            if (fretNum < view.minFret || fretNum > view.maxFret || (view.noOpen && fretNum === 0)) return;
            if (view.parity && fretNum % 2 !== (view.parity === 'odd' ? 1 : 0)) return;
        }
        if (view.region === 'low' && stringIndex >= Math.ceil(count / 2)) return;
        if (view.region === 'high' && stringIndex < Math.floor(count / 2)) return;
        if (view.region === 'middle' && (stringIndex < Math.floor(count / 3) || stringIndex >= Math.ceil(count * 2 / 3))) return;
        const previous = this.svg.lastElementChild;
        drawMarker.call(this, x, y, color, text, textColor, pitch, position);
        const group = this.svg.lastElementChild;
        if (group === previous || !group?.classList.contains('note-marker-group')) return;
        group.dataset.string = stringNumber; group.dataset.fret = fretNum;
        const marker = group.querySelector('.note-marker'), label = group.querySelector('text');
        const root = semitones === 0;
        group.style.opacity = root ? '1' : String(view.nonRootOpacity);
        if (marker) {
            marker.setAttribute('stroke-width', view.borderWidth);
            marker.setAttribute('stroke', view.borderColor);
            const fill = root && view.rootColor ? view.rootColor : view.mono;
            if (fill) marker.setAttribute('fill', fill);
            if (root && view.rootScale !== 1) {
                const centerY = y + this.settings.noteOffset;
                marker.setAttribute('transform', 'translate(' + x + ' ' + centerY + ') scale(' + view.rootScale + ') translate(' + -x + ' ' + -centerY + ')');
            }
            if (fill && label) label.setAttribute('fill', this.getContrastColor(fill));
        }
        if (label) {
            let display = view.spelling === 'sharp' ? pitches[pitchIndex(pitch)] : view.spelling === 'flat' ? flats[pitchIndex(pitch)] : text;
            if (view.fretLabel) display += ' f' + fretNum;
            if (view.stringLabel) display += ' s' + stringNumber;
            label.textContent = display;
            if (view.textOutline) {
                label.setAttribute('stroke', label.getAttribute('fill') === '#ffffff' ? '#111' : '#fff');
                label.setAttribute('stroke-width', '2'); label.style.paintOrder = 'stroke';
            }
        }
    };

    const keyNav = section('key-navigation', 'Key Navigation');
    const transpose = amount => {
        const index = (pitchIndex(byId('key-select').value) + amount + 24) % 12;
        const options = Array.from(byId('key-select').options);
        const option = options.find(item => item.value === pitches[index]) || options.find(item => pitchIndex(item.value) === index);
        if (option) change('key-select', option.value);
    };
    [ ['semitone', 'Transpose by semitone', 1], ['whole-tone', 'Transpose by whole tone', 2], ['minor-third', 'Transpose by minor third', 3], ['major-third', 'Transpose by major third', 4], ['fifth', 'Cycle by perfect fifth', 7] ].forEach(([id, title, amount]) => {
        buttons(keyNav, id, title, [['Down', () => transpose(-amount)], ['Up', () => transpose(amount)]]);
    });

    const windows = section('fret-windows', 'Fret Windows');
    const limit = () => Number(byId('end-fret').max || 24);
    const setWindow = (start, end) => {
        const maximum = limit();
        byId('start-fret').value = Math.max(0, Math.min(maximum, start));
        byId('end-fret').value = Math.max(Number(byId('start-fret').value), Math.min(maximum, end));
        app.updateFretboard();
    };
    number(windows, 'window-width', 'Visible fret span', 12, 1, 24, width => { const start = Math.min(Number(byId('start-fret').value), limit() - width); setWindow(start, start + width); });
    number(windows, 'jump-fret', 'Start window at fret', 0, 0, 24, fret => {
        const width = Number(byId('end-fret').value) - Number(byId('start-fret').value);
        setWindow(fret, fret + width);
    });
    const octaveShift = amount => {
        const start = Number(byId('start-fret').value), end = Number(byId('end-fret').value);
        if (start + amount < 0 || end + amount > limit()) { say('The full window cannot move an octave in that direction.'); return; }
        setWindow(start + amount, end + amount);
    };
    buttons(windows, 'octave-window', 'Move window by octave', [['Lower octave', () => octaveShift(-12)], ['Higher octave', () => octaveShift(12)]]);
    const visibleMarkers = () => Array.from(app.fretboard.svg.querySelectorAll('.note-marker-group[data-fret]'));
    buttons(windows, 'fit-notes', 'Fit currently visible notes', [['Fit notes', () => {
        const frets = visibleMarkers().map(node => Number(node.dataset.fret));
        if (!frets.length) { say('No fretted notes are visible to fit.'); return; }
        setWindow(Math.max(0, Math.min(...frets) - 1), Math.min(limit(), Math.max(...frets) + 1));
    }]]);
    buttons(windows, 'full-neck', 'Show the full fret range', [['Full neck', () => setWindow(0, limit())]]);

    const filters = section('note-filters', 'Fretted-Note Filters');
    select(filters, 'interval-filter', 'Focus on an interval', [['', 'All intervals'], ...intervals.map((name, i) => [String(i), name])], value => { view.interval = value; redraw(); });
    select(filters, 'fret-parity', 'Even or odd frets', [['', 'All frets'], ['even', 'Even frets'], ['odd', 'Odd frets']], value => { view.parity = value; redraw(); });
    select(filters, 'string-region', 'String region', [['', 'All strings'], ['low', 'Lower-pitched half'], ['middle', 'Middle third'], ['high', 'Higher-pitched half']], value => { view.region = value; redraw(); });
    const band = row(filters, 'fret-band', 'Study fret band');
    const lower = document.createElement('input'), upper = document.createElement('input');
    [lower, upper].forEach(input => { input.type = 'number'; input.min = '0'; input.max = '24'; input.className = 'new-ui-small-number'; });
    lower.id = 'new-ui-control-fret-band'; lower.value = '0'; lower.setAttribute('aria-label', 'First study fret');
    upper.value = '24'; upper.setAttribute('aria-label', 'Last study fret');
    const setBand = () => {
        const clamp = input => Math.max(0, Math.min(24, Number(input.value) || 0));
        view.minFret = clamp(lower); view.maxFret = Math.max(view.minFret, clamp(upper));
        lower.value = view.minFret; upper.value = view.maxFret; redraw();
    };
    lower.addEventListener('change', setBand); upper.addEventListener('change', setBand); band.append(lower, upper);
    check(filters, 'exclude-open', 'Exclude open-string positions', value => { view.noOpen = value; redraw(); });

    const labels = section('label-tools', 'Fretted-Note Labels');
    select(labels, 'pitch-spelling', 'Override marker text with pitch names', [['', 'Keep current display mode'], ['sharp', 'Sharp pitch names'], ['flat', 'Flat pitch names']], value => { view.spelling = value; redraw(); });
    check(labels, 'fret-suffix', 'Append fret number to note labels', value => { view.fretLabel = value; redraw(); });
    check(labels, 'string-suffix', 'Append string number to note labels', value => { view.stringLabel = value; redraw(); });
    check(labels, 'label-outline', 'High-contrast label outline', value => { view.textOutline = value; redraw(); });
    select(labels, 'single-color', 'Use one marker fill color', [['', 'Keep theme colors'], ['#ffffff', 'White'], ['#202020', 'Charcoal'], ['#005fcc', 'Blue'], ['#b33c00', 'Rust']], value => { view.mono = value; redraw(); });

    const styling = section('marker-tools', 'Fretted-Note Styling');
    number(styling, 'root-scale', 'Root marker size multiplier', 1, 0.5, 2, value => { view.rootScale = value; redraw(); }, 0.1);
    number(styling, 'nonroot-opacity', 'Non-root marker opacity (%)', 100, 10, 100, value => { view.nonRootOpacity = value / 100; redraw(); });
    number(styling, 'border-width', 'Marker border width (px)', 1, 0, 8, value => { view.borderWidth = value; redraw(); });
    const borderRow = row(styling, 'border-color', 'Marker border color'), borderColor = document.createElement('input');
    borderColor.id = 'new-ui-control-border-color'; borderColor.type = 'color'; borderColor.value = '#000000';
    borderColor.addEventListener('input', () => { view.borderColor = borderColor.value; redraw(); }); borderRow.append(borderColor);
    select(styling, 'root-fill', 'Root marker fill override', [['', 'Keep theme colors'], ['#f4c542', 'Gold'], ['#ffffff', 'White'], ['#005fcc', 'Blue'], ['#b33c00', 'Rust']], value => { view.rootColor = value; redraw(); });

    const analysis = section('analysis', 'Visible-Note Analysis');
    const report = (id, title, compute) => {
        let result;
        const group = buttons(analysis, id, title, [['Refresh', () => { result.textContent = compute(); }]]);
        result = output(group);
    };
    const markerPitch = node => node.querySelector('[data-pitch]')?.dataset.pitch;
    report('pitch-inventory', 'Pitch inventory', () => {
        const counts = new Map(); visibleMarkers().forEach(node => { const pitch = markerPitch(node); counts.set(pitch, (counts.get(pitch) || 0) + 1); });
        return Array.from(counts, ([pitch, count]) => pitch + ': ' + count).join(' | ') || 'No fretted notes visible.';
    });
    report('interval-inventory', 'Interval inventory', () => {
        const counts = new Map(); visibleMarkers().forEach(node => { const interval = intervals[(pitchIndex(markerPitch(node)) - pitchIndex(app.fretboard.currentKey) + 12) % 12]; counts.set(interval, (counts.get(interval) || 0) + 1); });
        return Array.from(counts, ([interval, count]) => interval + ': ' + count).join(' | ') || 'No fretted notes visible.';
    });
    report('string-counts', 'Visible notes per string', () => {
        const markers = visibleMarkers();
        return app.fretboard.settings.tuning.map((_, i, tuning) => { const string = tuning.length - i; return 'String ' + string + ': ' + markers.filter(node => Number(node.dataset.string) === string).length; }).join('\n');
    });
    report('position-list', 'Visible note positions', () => visibleMarkers().map(node => markerPitch(node) + ' - string ' + node.dataset.string + ', fret ' + node.dataset.fret).join('\n') || 'No fretted notes visible.');
    report('tuning-gaps', 'Adjacent open-string pitch-class intervals', () => {
        const tuning = app.fretboard.settings.tuning;
        return tuning.slice(1).map((pitch, i) => tuning[i] + ' to ' + pitch + ': ' + (pitchIndex(pitch) - pitchIndex(tuning[i]) + 12) % 12 + ' semitones').join('\n') || 'Only one string/key.';
    });

    const ear = section('ear-training', 'Ear Training');
    let audio = null, volume = 0.2, quizPitch = '';
    const voices = new Set();
    const ensureAudio = async () => {
        if (!audio) {
            const Audio = window.AudioContext || window.webkitAudioContext;
            if (!Audio) throw new Error('Audio is not supported in this browser.');
            audio = new Audio();
        }
        if (audio.state !== 'running') await audio.resume();
    };
    const sound = (pitch, at = audio.currentTime, duration = 0.6, strength = 1) => {
        if (volume === 0) return;
        const oscillator = audio.createOscillator(), gain = audio.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = 261.625565 * 2 ** (pitch / 12);
        const level = Math.max(0.0001, volume * strength);
        gain.gain.setValueAtTime(0.0001, at); gain.gain.exponentialRampToValueAtTime(level, at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
        oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(at); oscillator.stop(at + duration + 0.02);
        voices.add(oscillator); oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        return oscillator;
    };
    buttons(ear, 'reference-tone', 'Hear the current root (pitch class)', [['Play root', async () => { await ensureAudio(); sound(pitchIndex(app.fretboard.currentKey)); }]]);
    const intervalRow = buttons(ear, 'hear-interval', 'Hear an interval above the root', [['Play interval', async () => {
        await ensureAudio(); const root = pitchIndex(app.fretboard.currentKey); sound(root); sound(root + Number(earInterval.value), audio.currentTime + 0.75);
    }]]);
    const earInterval = document.createElement('select'); earInterval.setAttribute('aria-label', 'Interval to hear');
    earInterval.replaceChildren(...intervals.map((name, i) => new Option(name, String(i)))); intervalRow.append(earInterval);
    let quizOutput;
    const quizRow = buttons(ear, 'pitch-quiz', 'Identify a random pitch class', [['New tone', async () => {
        await ensureAudio(); const index = Math.floor(Math.random() * 12); quizPitch = pitches[index]; sound(index); quizOutput.textContent = 'Which pitch did you hear?';
    }], ['Replay', async () => { if (!quizPitch) { say('Play a new tone first.'); return; } await ensureAudio(); sound(pitchIndex(quizPitch)); }]]);
    quizOutput = output(quizRow);
    buttons(ear, 'quiz-answer', 'Reveal the ear-training answer', [['Reveal pitch', () => { quizOutput.textContent = quizPitch || 'Play a new tone first.'; }]]);
    number(ear, 'sound-volume', 'New UI audio volume (%)', 20, 0, 100, value => { volume = value / 100; });

    const rhythm = section('metronome', 'Metronome');
    let bpm = 100, beats = 4, accent = true, tickTimer = null, nextTick = 0, beat = 0;
    const beatOutput = document.createElement('output'); beatOutput.setAttribute('aria-label', 'Metronome state'); beatOutput.textContent = 'Stopped';
    const stopTicks = () => {
        clearInterval(tickTimer); tickTimer = null; beat = 0; beatOutput.textContent = 'Stopped';
        voices.forEach(voice => { try { voice.stop(); } catch (_) {} });
    };
    const metroRow = buttons(rhythm, 'metronome-toggle', 'Metronome playback', [['Start / stop', async () => {
        if (tickTimer) { stopTicks(); return; }
        await ensureAudio();
        if (tickTimer) return;
        nextTick = audio.currentTime + 0.03; beat = 0; beatOutput.textContent = 'Running';
        tickTimer = setInterval(() => {
            nextTick = Math.max(nextTick, audio.currentTime);
            while (nextTick < audio.currentTime + 0.1) {
                sound(accent && beat === 0 ? 24 : 12, nextTick, 0.04, 0.5);
                nextTick += 60 / bpm; beat = (beat + 1) % beats;
            }
        }, 25);
    }]]); metroRow.append(beatOutput);
    const bpmInput = number(rhythm, 'metronome-bpm', 'Metronome tempo (BPM)', 100, 30, 240, value => { bpm = value; });
    select(rhythm, 'meter', 'Beats per bar', [[4, '4 beats'], [3, '3 beats'], [2, '2 beats'], [5, '5 beats'], [6, '6 beats'], [7, '7 beats']], value => { beats = Number(value); beat = 0; });
    const accentInput = check(rhythm, 'accent', 'Accent the first beat', value => { accent = value; }); accentInput.checked = true;
    let taps = [];
    buttons(rhythm, 'tap-tempo', 'Tap to set metronome tempo', [['Tap tempo', () => {
        const now = performance.now(); if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
        taps.push(now); taps = taps.slice(-6);
        if (taps.length < 2) { say('Tap again to set tempo.'); return; }
        bpm = Math.max(30, Math.min(240, Math.round(60000 * (taps.length - 1) / (taps[taps.length - 1] - taps[0]))));
        bpmInput.value = bpm; say('Metronome tempo: ' + bpm + ' BPM.');
    }]]);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopTicks(); });
    window.addEventListener('pagehide', () => { stopTicks(); audio?.close(); });

    const records = section('practice-records', 'Practice Records');
    let goal = 10;
    const goalInput = number(records, 'repetition-goal', 'Repetition goal', 10, 1, 10000, value => { goal = Math.round(value); goalInput.value = goal; updateGoal(); });
    const goalOutput = output(goalInput.parentElement);
    const updateGoal = () => { goalOutput.textContent = getRepetitions() + ' / ' + goal + (getRepetitions() >= goal ? ' - goal reached' : ''); };
    updateGoal();
    panel.querySelector('[data-new-feature="counter"]').addEventListener('click', updateGoal);
    buttons(records, 'log-session', 'Save a practice record', [['Log session', () => {
        const history = read('history');
        history.unshift({ date: new Date().toISOString(), key: app.fretboard.currentKey, type: byId('pattern-type').value, pattern: byId('pattern-select').value, repetitions: getRepetitions(), goal, notes: sessionNotes.value });
        save('history', history.slice(0, 200)); say('Practice record saved locally.');
    }]]);
    let historyOutput;
    const historyRow = buttons(records, 'show-history', 'Read recent practice records', [['Show records', () => {
        historyOutput.textContent = read('history').slice(0, 20).map(item => new Date(item.date).toLocaleString() + ' | ' + item.key + ' ' + item.pattern + ' | ' + item.repetitions + '/' + item.goal).join('\n') || 'No practice records yet.';
    }]]); historyOutput = output(historyRow);
    buttons(records, 'export-history', 'Export practice records as CSV', [['Download CSV', () => {
        const quote = value => { let text = String(value ?? ''); if (/^[=+@\-\t\r]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"', '""') + '"'; };
        const columns = ['date', 'key', 'type', 'pattern', 'repetitions', 'goal', 'notes'];
        download('fretboard-practice-history.csv', [columns.join(','), ...read('history').map(item => columns.map(key => quote(item[key])).join(','))].join('\r\n'), 'text/csv');
    }]]);
    buttons(records, 'clear-history', 'Delete saved practice records', [['Clear records', () => {
        if (!confirm('Delete all locally saved practice records?')) return;
        save('history', []); historyOutput.textContent = 'No practice records yet.'; say('Practice records cleared.');
    }]]);

    const bookmarks = section('bookmarks', 'Diagram Bookmarks');
    const refreshBookmarks = () => {
        const saved = read('bookmarks'), selected = bookmarkSelect.value;
        bookmarkSelect.replaceChildren(new Option('Choose a saved diagram', ''), ...saved.map((item, i) => new Option(item.name, String(i))));
        if (selected !== '' && Number(selected) < saved.length) bookmarkSelect.value = selected;
    };
    const addBookmark = buttons(bookmarks, 'add-bookmark', 'Bookmark the selected diagram', [['Save diagram', () => {
        app.updateFretboard(); const saved = read('bookmarks');
        if (saved.length >= 50) { say('Remove a bookmark before saving more (50 maximum).'); return; }
        const name = bookmarkName.value.trim() || app.getDiagramTitle(app.activeDiagram) + ' - ' + app.fretboard.currentKey + ' ' + byId('pattern-select').selectedOptions[0]?.textContent;
        saved.push({ name, setup: structuredClone(app.diagramSetups[app.activeDiagram]) }); save('bookmarks', saved); refreshBookmarks(); say('Diagram bookmarked locally.');
    }]]);
    const bookmarkName = document.createElement('input'); bookmarkName.type = 'text'; bookmarkName.maxLength = 80; bookmarkName.placeholder = 'Bookmark name'; bookmarkName.setAttribute('aria-label', 'Bookmark name'); addBookmark.append(bookmarkName);
    const bookmarkSelect = select(bookmarks, 'load-bookmark', 'Load a bookmarked diagram', [['', 'Choose a saved diagram']], value => {
        if (value === '') return;
        const item = read('bookmarks')[Number(value)]; if (!item) return;
        app.diagramSetups[app.activeDiagram] = structuredClone(item.setup); app.selectFretboardDiagram(app.activeDiagram); say('Bookmarked diagram loaded into the selected slot.');
    });
    buttons(bookmarks, 'delete-bookmark', 'Remove the selected bookmark', [['Delete bookmark', () => {
        if (bookmarkSelect.value === '') { say('Choose a bookmark first.'); return; }
        const saved = read('bookmarks'); saved.splice(Number(bookmarkSelect.value), 1); save('bookmarks', saved); bookmarkSelect.value = ''; refreshBookmarks(); say('Bookmark deleted.');
    }]]);
    buttons(bookmarks, 'copy-pattern-link', 'Share key, type and selection', [['Copy pattern link', async () => {
        const url = new URL(location.href); url.search = '';
        url.searchParams.set('key', byId('key-select').value); url.searchParams.set('patternType', byId('pattern-type').value); url.searchParams.set('pattern', byId('pattern-select').value); url.searchParams.set('display', byId('display-mode').value);
        await navigator.clipboard.writeText(url.href); say('Pattern link copied. Tuning and custom patterns are not included.');
    }]]);
    buttons(bookmarks, 'clear-session-notes', 'Clear the saved session notes', [['Clear notes', () => {
        if (!confirm('Clear your saved session notes?')) return;
        sessionNotes.value = ''; localStorage.removeItem('fb-new-ui-notes'); say('Session notes cleared.');
    }]]);
    refreshBookmarks();
    const syncWindowInputs = () => {
        byId('new-ui-control-window-width').value = Number(byId('end-fret').value) - Number(byId('start-fret').value);
        byId('new-ui-control-jump-fret').value = byId('start-fret').value;
    };
    const updateFretboard = App.prototype.updateFretboard;
    App.prototype.updateFretboard = function(...args) {
        const result = updateFretboard.apply(this, args);
        syncWindowInputs();
        return result;
    };
    syncWindowInputs();
    redraw();
    const lab = window.installStandaloneNewUiLab({ app, panel, section, row, buttons, select, number, output, download, say, ensureAudio, sound, audioTime: () => audio.currentTime });
    return {
        reset() {
            lab.reset();
            view = { ...defaults };
            const values = { 'interval-filter': '', 'fret-parity': '', 'string-region': '', 'exclude-open': false, 'pitch-spelling': '', 'fret-suffix': false, 'string-suffix': false, 'label-outline': false, 'single-color': '', 'root-scale': 1, 'nonroot-opacity': 100, 'border-width': 1, 'border-color': '#000000', 'root-fill': '' };
            Object.entries(values).forEach(([id, value]) => { const input = byId('new-ui-control-' + id); if (input.type === 'checkbox') input.checked = value; else input.value = value; });
            lower.value = '0'; upper.value = '24'; redraw();
        },
        snapshot: () => ({ ...view }),
        restore(saved) {
            this.reset();
            if (!saved) return;
            const mapping = { interval: 'interval-filter', parity: 'fret-parity', region: 'string-region', noOpen: 'exclude-open', spelling: 'pitch-spelling', fretLabel: 'fret-suffix', stringLabel: 'string-suffix', textOutline: 'label-outline', mono: 'single-color', rootScale: 'root-scale', nonRootOpacity: 'nonroot-opacity', borderWidth: 'border-width', borderColor: 'border-color', rootColor: 'root-fill' };
            view = { ...defaults, ...saved };
            Object.entries(mapping).forEach(([key, id]) => { const input = byId('new-ui-control-' + id); if (input.type === 'checkbox') input.checked = view[key]; else input.value = key === 'nonRootOpacity' ? view[key] * 100 : view[key]; });
            lower.value = view.minFret; upper.value = view.maxFret; redraw();
        }
    };
};
