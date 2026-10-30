window.installStandaloneNewUiLab = ({ app, panel, section, row, buttons, select, number, output, download, say, ensureAudio, sound, audioTime }) => {
    const byId = id => document.getElementById(id);
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const intervals = ['Unison', 'Minor second', 'Major second', 'Minor third', 'Major third', 'Perfect fourth', 'Tritone', 'Perfect fifth', 'Minor sixth', 'Major sixth', 'Minor seventh', 'Major seventh', 'Octave'];
    const mod = n => (n % 12 + 12) % 12;
    const index = pitch => names.indexOf(app.musicTheory.toSharp(pitch));
    const currentRoot = () => index(app.fretboard.currentKey);
    const choice = items => items[Math.floor(Math.random() * items.length)];
    const unique = items => [...new Set(items)];
    const patternNotes = () => {
        const board = app.fretboard;
        const pitches = (board.activeNotes || []).filter(Boolean).map(index);
        (board.activePositions || []).forEach(position => pitches.push(mod(index(board.settings.tuning[position.string]) + position.fret)));
        return unique(pitches.filter(pitch => pitch >= 0)).sort((a, b) => mod(a - currentRoot()) - mod(b - currentRoot()));
    };
    const positions = () => Array.from(app.fretboard.svg.querySelectorAll('.note-marker-group[data-fret]'), node => ({ pitch: node.querySelector('[data-pitch]')?.dataset.pitch, string: Number(node.dataset.string), fret: Number(node.dataset.fret) }));
    const report = (parent, id, title, compute, label = 'Show') => {
        let result;
        const group = buttons(parent, 'lab-' + id, title, [[label, () => { result.textContent = compute(); }]]);
        result = output(group);
        return { group, result };
    };
    const requireNotes = () => { const notes = patternNotes(); if (!notes.length) throw new Error('Choose a pattern with notes first.'); return notes; };
    const storageKey = 'fb-new-ui-routine';
    const readRoutine = () => {
        try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(value) ? value : []; }
        catch (_) { return []; }
    };
    const storeRoutine = queue => localStorage.setItem(storageKey, JSON.stringify(queue));

    const theory = section('lab-reference', 'Theory Reference');
    const inversion = report(theory, 'interval-inversion', 'Invert a simple interval', () => intervals[12 - Number(inversionSelect.value)]);
    const inversionSelect = document.createElement('select'); inversionSelect.setAttribute('aria-label', 'Interval to invert');
    inversionSelect.replaceChildren(...intervals.map((name, i) => new Option(name, String(i)))); inversion.group.append(inversionSelect);
    report(theory, 'interval-map', 'Chromatic intervals above the current root', () => names.map((_, i) => intervals[i] + ': ' + names[mod(currentRoot() + i)]).join('\n'));
    report(theory, 'neighbors', 'Chromatic and whole-tone neighbors', () => [-2, -1, 1, 2].map(offset => (offset > 0 ? '+' : '') + offset + ' semitone(s): ' + names[mod(currentRoot() + offset)]).join('\n'));
    report(theory, 'enharmonics', 'Common enharmonic spellings', () => ['C = B#', 'C# = Db', 'D', 'D# = Eb', 'E = Fb', 'F = E#', 'F# = Gb', 'G', 'G# = Ab', 'A', 'A# = Bb', 'B = Cb'].join('\n'));
    const frequencies = report(theory, 'frequencies', 'Equal-tempered reference frequencies (A4 = 440 Hz)', () => names.map((name, i) => name + octaveSelect.value + ': ' + (440 * 2 ** ((Number(octaveSelect.value) * 12 + i - 57) / 12)).toFixed(2) + ' Hz').join('\n'));
    const octaveSelect = document.createElement('select'); octaveSelect.setAttribute('aria-label', 'Reference octave');
    octaveSelect.replaceChildren(...[2, 3, 4, 5, 6].map(octave => new Option('Octave ' + octave, String(octave)))); octaveSelect.value = '4'; frequencies.group.append(octaveSelect);

    const harmony = section('lab-harmony', 'Pattern Harmony');
    const chordTemplates = [ ['major', [0, 4, 7]], ['minor', [0, 3, 7]], ['diminished', [0, 3, 6]], ['augmented', [0, 4, 8]], ['sus2', [0, 2, 7]], ['sus4', [0, 5, 7]], ['major 7', [0, 4, 7, 11]], ['minor 7', [0, 3, 7, 10]], ['dominant 7', [0, 4, 7, 10]], ['half-diminished 7', [0, 3, 6, 10]], ['diminished 7', [0, 3, 6, 9]], ['minor-major 7', [0, 3, 7, 11]] ];
    const recognize = pitches => {
        const notes = unique(pitches);
        return notes.flatMap(root => chordTemplates.filter(([, offsets]) => offsets.length === notes.length && offsets.every(offset => notes.includes(mod(root + offset)))).map(([name]) => names[root] + ' ' + name));
    };
    const harmonize = size => {
        const notes = requireNotes();
        if (notes.length !== 7) return 'Select a seven-note pattern for stacked-third harmonization.';
        return notes.map((_, degree) => {
            const chord = Array.from({ length: size }, (_, i) => notes[(degree + i * 2) % 7]);
            return (degree + 1) + ': ' + chord.map(pitch => names[pitch]).join(' ') + ' | ' + (recognize(chord)[0] || 'Other quality');
        }).join('\n');
    };
    report(harmony, 'triads', 'Stack scale triads', () => harmonize(3));
    report(harmony, 'sevenths', 'Stack scale seventh chords', () => harmonize(4));
    report(harmony, 'relative-keys', 'Major/minor relative-key references', () => names[currentRoot()] + ' major -> ' + names[mod(currentRoot() + 9)] + ' minor\n' + names[currentRoot()] + ' minor -> ' + names[mod(currentRoot() + 3)] + ' major');
    report(harmony, 'chord-recognition', 'Recognize the pattern pitch set as a chord', () => recognize(requireNotes()).join('\n') || 'No exact match among common triads and seventh chords.');
    report(harmony, 'missing-pitches', 'Pitch classes outside the pattern', () => { const selected = requireNotes(); return names.filter((_, i) => !selected.includes(i)).join(' ') || 'All twelve pitch classes are present.'; });

    const comparison = section('lab-comparison', 'Pattern Comparison');
    let reference = null;
    const compare = compute => { if (!reference) return 'Capture a reference pattern first.'; return compute(requireNotes(), reference); };
    report(comparison, 'capture-reference', 'Capture the current pitch set as reference', () => { reference = requireNotes(); return 'Reference: ' + reference.map(pitch => names[pitch]).join(' '); }, 'Capture');
    report(comparison, 'common-tones', 'Shared pitch classes', () => compare(notes => notes.filter(pitch => reference.includes(pitch)).map(pitch => names[pitch]).join(' ') || 'No shared pitches.'));
    report(comparison, 'added-tones', 'Pitches added since the reference', () => compare(notes => notes.filter(pitch => !reference.includes(pitch)).map(pitch => names[pitch]).join(' ') || 'No added pitches.'));
    report(comparison, 'removed-tones', 'Pitches removed since the reference', () => compare(notes => reference.filter(pitch => !notes.includes(pitch)).map(pitch => names[pitch]).join(' ') || 'No removed pitches.'));
    report(comparison, 'similarity', 'Pitch-set overlap score', () => compare(notes => { const common = notes.filter(pitch => reference.includes(pitch)).length; const union = unique([...notes, ...reference]).length; return common + ' shared / ' + union + ' total distinct pitches = ' + Math.round(common / union * 100) + '% overlap'; }));

    const prompts = section('lab-prompts', 'Practice Prompts');
    const visibleStrings = () => app.fretboard.settings.tuning.map((_, i) => i).filter(i => app.fretboard.settings.visibleStrings?.[i] !== false);
    const requireStrings = () => { if (app.fretboard.settings.referenceLayout) throw new Error('This prompt needs a fretted instrument.'); const strings = visibleStrings(); if (!strings.length) throw new Error('No strings are enabled.'); return strings; };
    report(prompts, 'string-prompt', 'Choose a random enabled string', () => 'Practice string ' + (app.fretboard.settings.tuning.length - choice(requireStrings())), 'Pick');
    report(prompts, 'fret-prompt', 'Choose a random fret in the current window', () => { const settings = app.fretboard.settings; const start = Math.max(settings.startFret, settings.capoEnabled ? settings.capo : 0); if (start > settings.endFret || settings.referenceLayout) return 'No playable fret window.'; return 'Practice fret ' + (start + Math.floor(Math.random() * (settings.endFret - start + 1))); }, 'Pick');
    report(prompts, 'position-prompt', 'Choose a random visible note position', () => { const point = choice(positions()); return point ? 'Find ' + point.pitch + ' on string ' + point.string + ', fret ' + point.fret : 'No fretted pattern notes are visible.'; }, 'Pick');
    report(prompts, 'interval-prompt', 'Choose an interval to locate above the root', () => 'Find a ' + choice(intervals.slice(1)).toLowerCase() + ' above ' + app.fretboard.currentKey, 'Pick');
    report(prompts, 'pair-prompt', 'Choose a random pair of enabled strings', () => { const strings = requireStrings().slice(); if (strings.length < 2) return 'Enable at least two strings.'; const first = strings.splice(Math.floor(Math.random() * strings.length), 1)[0]; const count = app.fretboard.settings.tuning.length; return 'Alternate strings ' + (count - first) + ' and ' + (count - choice(strings)); }, 'Pick');

    const locationQuiz = section('lab-location-quiz', 'Note-Location Quiz');
    let locationQuestion = null, locationLocked = false, locationCorrect = 0, locationTotal = 0;
    const rangeRow = row(locationQuiz, 'lab-quiz-range', 'Quiz fret range');
    const rangeStart = document.createElement('input'), rangeEnd = document.createElement('input');
    [rangeStart, rangeEnd].forEach(input => { input.type = 'number'; input.min = '0'; input.max = '24'; input.className = 'new-ui-small-number'; });
    rangeStart.id = 'new-ui-control-lab-quiz-range'; rangeStart.value = '0'; rangeStart.setAttribute('aria-label', 'First quiz fret');
    rangeEnd.value = '12'; rangeEnd.setAttribute('aria-label', 'Last quiz fret'); rangeRow.append(rangeStart, rangeEnd);
    const quizCandidates = () => {
        const settings = app.fretboard.settings;
        if (settings.referenceLayout) throw new Error('The note-location quiz needs a fretted instrument.');
        const low = Math.min(24, Math.max(0, Math.round(Number(rangeStart.value) || 0)));
        const high = Math.min(24, Math.max(low, Math.round(Number(rangeEnd.value) || 0)));
        rangeStart.value = low; rangeEnd.value = high;
        return requireStrings().flatMap(string => {
            const start = Math.max(low, settings.startFret, settings.stringStartFrets?.[string] ?? 0, settings.capoEnabled ? settings.capo : 0);
            const end = Math.min(high, settings.endFret, settings.stringEndFrets?.[string] ?? 24);
            return Array.from({ length: Math.max(0, end - start + 1) }, (_, offset) => ({ string: settings.tuning.length - string, fret: start + offset, pitch: names[mod(index(settings.tuning[string]) + start + offset)] }));
        });
    };
    let locationOutput;
    const questionRow = buttons(locationQuiz, 'lab-location-question', 'Identify a note from string and fret', [['New question', () => {
        const candidates = quizCandidates(); if (!candidates.length) { say('The quiz range does not overlap the playable fret window.'); return; }
        locationQuestion = choice(candidates); locationLocked = false;
        locationOutput.textContent = 'String ' + locationQuestion.string + ', fret ' + locationQuestion.fret + ': which pitch?';
    }]]); locationOutput = output(questionRow);
    const locationAnswerRow = buttons(locationQuiz, 'lab-location-guess', 'Submit a pitch answer', [['Check answer', () => {
        if (!locationQuestion || locationLocked) { say('Start a new note-location question first.'); return; }
        locationTotal++; const correct = locationGuess.value === locationQuestion.pitch; if (correct) locationCorrect++;
        locationLocked = true; locationOutput.textContent = (correct ? 'Correct: ' : 'Answer: ') + locationQuestion.pitch; updateLocationScore();
    }]]);
    const locationGuess = document.createElement('select'); locationGuess.setAttribute('aria-label', 'Your pitch answer'); locationGuess.replaceChildren(...names.map(name => new Option(name, name))); locationAnswerRow.append(locationGuess);
    buttons(locationQuiz, 'lab-location-reveal', 'Reveal without scoring', [['Reveal note', () => { if (!locationQuestion) { say('Start a question first.'); return; } locationLocked = true; locationOutput.textContent = 'Answer: ' + locationQuestion.pitch; }]]);
    const locationScoreRow = buttons(locationQuiz, 'lab-location-score', 'Note-location quiz score', [['Reset score', () => { locationCorrect = 0; locationTotal = 0; updateLocationScore(); }]]);
    const locationScore = output(locationScoreRow);
    const updateLocationScore = () => { locationScore.textContent = locationCorrect + ' correct / ' + locationTotal + ' scored'; }; updateLocationScore();

    const intervalQuiz = section('lab-interval-quiz', 'Interval-Listening Quiz');
    let intervalQuestion = null, intervalLocked = false, intervalCorrect = 0, intervalTotal = 0;
    const direction = select(intervalQuiz, 'lab-quiz-direction', 'Question presentation', [['up', 'Ascending'], ['down', 'Descending'], ['together', 'Harmonic (together)']], () => {});
    const playQuestion = async () => {
        await ensureAudio();
        const question = intervalQuestion;
        if (!question) return;
        const start = question.direction === 'down' ? question.root + 12 : question.root;
        const end = question.direction === 'down' ? start - question.interval : start + question.interval;
        sound(start); sound(end, audioTime() + (question.direction === 'together' ? 0 : 0.75));
    };
    let intervalOutput;
    const intervalQuestionRow = buttons(intervalQuiz, 'lab-interval-question', 'Listen and identify an interval', [['New interval', async () => {
        intervalQuestion = { root: Math.floor(Math.random() * 12), interval: 1 + Math.floor(Math.random() * 12), direction: direction.value };
        intervalLocked = false; await playQuestion(); intervalOutput.textContent = 'Which interval did you hear?';
    }], ['Replay', async () => { if (!intervalQuestion) { say('Start an interval question first.'); return; } await playQuestion(); }]]); intervalOutput = output(intervalQuestionRow);
    const intervalGuessRow = buttons(intervalQuiz, 'lab-interval-guess', 'Submit an interval answer', [['Check answer', () => {
        if (!intervalQuestion || intervalLocked) { say('Start a new interval question first.'); return; }
        intervalTotal++; const correct = Number(intervalGuess.value) === intervalQuestion.interval; if (correct) intervalCorrect++;
        intervalLocked = true; intervalOutput.textContent = (correct ? 'Correct: ' : 'Answer: ') + intervals[intervalQuestion.interval]; updateIntervalScore();
    }]]);
    const intervalGuess = document.createElement('select'); intervalGuess.setAttribute('aria-label', 'Your interval answer'); intervalGuess.replaceChildren(...intervals.slice(1).map((name, i) => new Option(name, String(i + 1)))); intervalGuessRow.append(intervalGuess);
    buttons(intervalQuiz, 'lab-interval-reveal', 'Reveal without scoring', [['Reveal interval', () => { if (!intervalQuestion) { say('Start a question first.'); return; } intervalLocked = true; intervalOutput.textContent = 'Answer: ' + intervals[intervalQuestion.interval]; }]]);
    const intervalScoreRow = buttons(intervalQuiz, 'lab-interval-score', 'Interval-listening quiz score', [['Reset score', () => { intervalCorrect = 0; intervalTotal = 0; updateIntervalScore(); }]]);
    const intervalScore = output(intervalScoreRow);
    const updateIntervalScore = () => { intervalScore.textContent = intervalCorrect + ' correct / ' + intervalTotal + ' scored'; }; updateIntervalScore();

    const routines = section('lab-routines', 'Ordered Practice Routine');
    const refreshRoutine = selected => {
        const queue = readRoutine();
        routineSelect.replaceChildren(new Option('Choose a routine item', ''), ...queue.map((item, i) => new Option((i + 1) + '. ' + item.name, String(i))));
        if (selected !== undefined && selected >= 0 && selected < queue.length) routineSelect.value = String(selected);
    };
    buttons(routines, 'lab-routine-add', 'Add the selected diagram to the routine', [['Add current', () => {
        app.updateFretboard(); const queue = readRoutine(); if (queue.length >= 50) { say('A routine can contain up to 50 items.'); return; }
        queue.push({ name: app.fretboard.currentKey + ' ' + (byId('pattern-select').selectedOptions[0]?.textContent || byId('pattern-select').value), setup: structuredClone(app.diagramSetups[app.activeDiagram]) });
        storeRoutine(queue); refreshRoutine(queue.length - 1); say('Diagram added to the saved routine.');
    }]]);
    const routineSelect = select(routines, 'lab-routine-list', 'Select an item in the saved routine', [['', 'Choose a routine item']], () => {});
    buttons(routines, 'lab-routine-next', 'Load the next routine item into the selected diagram', [['Next item', () => {
        const queue = readRoutine(); if (!queue.length) { say('Add routine items first.'); return; }
        const next = routineSelect.value === '' ? 0 : (Number(routineSelect.value) + 1) % queue.length;
        app.diagramSetups[app.activeDiagram] = structuredClone(queue[next].setup); app.selectFretboardDiagram(app.activeDiagram); routineSelect.value = String(next);
        say('Routine item ' + (next + 1) + ' of ' + queue.length + ': ' + queue[next].name);
    }]]);
    const moveRoutine = offset => {
        if (routineSelect.value === '') { say('Select a routine item first.'); return; }
        const queue = readRoutine(), from = Number(routineSelect.value), to = from + offset;
        if (to < 0 || to >= queue.length) return;
        [queue[from], queue[to]] = [queue[to], queue[from]]; storeRoutine(queue); refreshRoutine(to);
    };
    buttons(routines, 'lab-routine-order', 'Reorder the selected routine item', [['Earlier', () => moveRoutine(-1)], ['Later', () => moveRoutine(1)]]);
    buttons(routines, 'lab-routine-remove', 'Remove the selected routine item', [['Remove item', () => {
        if (routineSelect.value === '') { say('Select a routine item first.'); return; }
        const queue = readRoutine(), at = Number(routineSelect.value); queue.splice(at, 1); storeRoutine(queue); refreshRoutine(Math.min(at, queue.length - 1));
    }]]); refreshRoutine();

    const routes = section('lab-routes', 'Visible-Note Routes');
    let lastRoute = [];
    const formatRoute = route => { lastRoute = route; return route.map((point, i) => (i + 1) + '. ' + point.pitch + ' | string ' + point.string + ' | fret ' + point.fret).join('\n') || 'No fretted pattern notes are visible.'; };
    report(routes, 'route-up', 'Route from lowest to highest fret', () => formatRoute(positions().sort((a, b) => a.fret - b.fret || b.string - a.string)), 'Build route');
    report(routes, 'route-down', 'Route from highest to lowest fret', () => formatRoute(positions().sort((a, b) => b.fret - a.fret || a.string - b.string)), 'Build route');
    report(routes, 'route-strings', 'Route one string at a time, low string first', () => formatRoute(positions().sort((a, b) => b.string - a.string || a.fret - b.fret)), 'Build route');
    report(routes, 'route-nearest', 'Route by nearest fret/string grid neighbor', () => {
        const remaining = positions().sort((a, b) => a.fret - b.fret || b.string - a.string), route = [];
        while (remaining.length) {
            let next = 0;
            if (route.length) { const previous = route[route.length - 1]; const distance = point => Math.abs(point.fret - previous.fret) + Math.abs(point.string - previous.string); for (let i = 1; i < remaining.length; i++) if (distance(remaining[i]) < distance(remaining[next])) next = i; }
            route.push(remaining.splice(next, 1)[0]);
        }
        return formatRoute(route);
    }, 'Build route');
    buttons(routes, 'lab-route-csv', 'Export the last built route', [['Download route CSV', () => {
        if (!lastRoute.length) { say('Build a route first.'); return; }
        download('fretboard-route.csv', ['step,pitch,string,fret', ...lastRoute.map((point, i) => [i + 1, point.pitch, point.string, point.fret].join(','))].join('\r\n'), 'text/csv');
    }]]);

    const tuning = section('lab-tuning', 'Tuning Reports');
    const tuningPitches = () => app.fretboard.settings.tuning.map(index);
    report(tuning, 'duplicate-open', 'Repeated open-string pitch classes', () => { const notes = tuningPitches(); return unique(notes).filter(pitch => notes.filter(value => value === pitch).length > 1).map(pitch => names[pitch] + ': ' + notes.filter(value => value === pitch).length + ' strings/keys').join('\n') || 'No repeated pitch classes.'; });
    report(tuning, 'open-coverage', 'Open-string chromatic coverage', () => { const notes = unique(tuningPitches()); return notes.length + '/12 pitch classes: ' + notes.map(pitch => names[pitch]).join(' ') + '\nMissing: ' + (names.filter((_, i) => !notes.includes(i)).join(' ') || 'none'); });
    report(tuning, 'open-root-distance', 'Open-string intervals above the current root', () => app.fretboard.settings.tuning.map((pitch, i) => 'Low-to-high position ' + (i + 1) + ': ' + pitch + ' | ' + intervals[mod(index(pitch) - currentRoot())]).join('\n'));
    report(tuning, 'capo-reference', 'Capo to align the lowest open string with the root', () => { const settings = app.fretboard.settings; if (settings.referenceLayout) return 'Capo reference requires a fretted instrument.'; const fret = mod(currentRoot() - index(settings.tuning[0])); return 'Lowest string ' + settings.tuning[0] + ' reaches ' + app.fretboard.currentKey + ' at fret ' + fret + '. This does not transpose or change the diagram.'; });
    let tuningReference = null;
    const tuningComparison = report(tuning, 'tuning-comparison', 'Compare current tuning with a captured tuning', () => {
        if (!tuningReference) return 'Capture a tuning first.';
        const current = app.fretboard.settings.tuning;
        return Array.from({ length: Math.max(current.length, tuningReference.length) }, (_, i) => 'Low-to-high position ' + (i + 1) + ': ' + (tuningReference[i] || '(absent)') + ' -> ' + (current[i] || '(absent)') + (current[i] && tuningReference[i] ? ' | +' + mod(index(current[i]) - index(tuningReference[i])) + ' semitones mod 12' : '')).join('\n');
    }, 'Compare');
    const captureTuning = document.createElement('button'); captureTuning.type = 'button'; captureTuning.textContent = 'Capture tuning';
    captureTuning.addEventListener('click', () => { tuningReference = app.fretboard.settings.tuning.slice(); tuningComparison.result.textContent = 'Captured (low to high): ' + tuningReference.join(' '); }); tuningComparison.group.querySelector('.new-ui-actions').prepend(captureTuning);

    const utilities = section('lab-utilities', 'Workspace Utilities');
    const searchRow = row(utilities, 'lab-feature-search', 'Search New UI features');
    const search = document.createElement('input'); search.id = 'new-ui-control-lab-feature-search'; search.type = 'search'; search.placeholder = 'Search controls'; searchRow.append(search);
    const savedOpen = new Map();
    const filterFeatures = () => {
        const query = search.value.trim().toLowerCase();
        panel.querySelectorAll('fieldset').forEach(fieldset => {
            const wrapper = fieldset.parentElement;
            let any = false;
            fieldset.querySelectorAll(':scope > .control-group').forEach(group => {
                const text = (fieldset.querySelector('legend')?.textContent || '') + ' ' + (group.querySelector('label')?.textContent || '') + ' ' + Array.from(group.querySelectorAll('button'), button => button.textContent).join(' ');
                group.hidden = group !== searchRow && !text.toLowerCase().includes(query); any ||= !group.hidden;
            });
            if (wrapper?.classList.contains('fb-card')) {
                if (query && !savedOpen.has(wrapper)) savedOpen.set(wrapper, wrapper.open);
                wrapper.hidden = !any;
                if (query && any) wrapper.open = true;
                if (!query && savedOpen.has(wrapper)) wrapper.open = savedOpen.get(wrapper);
            }
        });
        if (!query) savedOpen.clear();
    };
    search.addEventListener('input', filterFeatures);
    buttons(utilities, 'lab-toggle-groups', 'Expand or collapse New UI groups only', [['Toggle groups', () => { const cards = Array.from(panel.querySelectorAll('details.fb-card')); const open = cards.some(card => !card.open && !card.hidden); cards.filter(card => !card.hidden).forEach(card => { card.open = open; }); }]]);
    buttons(utilities, 'lab-positions-json', 'Download visible note positions as JSON', [['Download JSON', () => {
        const board = app.fretboard;
        download('fretboard-positions.json', JSON.stringify({ key: board.currentKey, type: byId('pattern-type').value, pattern: byId('pattern-select').value, tuning: board.settings.tuning, positions: positions() }, null, 2), 'application/json');
    }]]);
    buttons(utilities, 'lab-copy-description', 'Copy an accessible diagram description', [['Copy description', async () => {
        const board = app.fretboard;
        const text = [board.svg.getAttribute('aria-label'), board.svg.querySelector('desc')?.textContent, 'Tuning (low to high): ' + board.settings.tuning.join(' '), 'Pattern pitch classes: ' + patternNotes().map(pitch => names[pitch]).join(' '), 'Visible fretted-note positions: ' + positions().length].filter(Boolean).join('\n');
        await navigator.clipboard.writeText(text); say('Diagram description copied.');
    }]]);
    buttons(utilities, 'lab-print-diagram', 'Print only the selected diagram', [['Print diagram', () => new Promise((resolve, reject) => {
        const frame = document.createElement('iframe'); frame.className = 'new-ui-print-frame'; frame.title = 'Print selected diagram';
        frame.onload = () => {
            try {
                const doc = frame.contentDocument, title = doc.createElement('h1'); title.textContent = app.getDiagramTitle(app.activeDiagram) + ' | ' + app.fretboard.currentKey;
                const svg = doc.importNode(app.fretboard.svg, true); svg.removeAttribute('height');
                doc.body.append(title, svg); frame.contentWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
                frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 60000); resolve();
            } catch (error) { frame.remove(); reject(error); }
        };
        frame.srcdoc = '<!doctype html><html><head><title>Fretboard</title><style>body{font:14px Arial,sans-serif;margin:20px}h1{font-size:16px}svg{width:100%;height:auto}.new-ui-conceal>text{visibility:hidden}.new-ui-root>.note-marker{stroke:#111;stroke-width:4}.new-ui-answer>.note-marker{stroke:#005fcc;stroke-width:5;stroke-dasharray:3 2}@page{size:landscape;margin:12mm}</style></head><body></body></html>';
        panel.append(frame);
    })]]);
    window.installStandaloneNewUiStudio({ app, section, row, buttons, select, number, output, download, say, ensureAudio, sound, audioTime, patternNotes, positions });
    return { reset() { search.value = ''; filterFeatures(); } };
};
