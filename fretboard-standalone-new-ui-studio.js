window.installStandaloneNewUiStudio = ({ app, section, row, buttons, select, number, output, download, say, ensureAudio, sound, audioTime, patternNotes, positions }) => {
    const byId = id => document.getElementById(id);
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const mod = value => (value % 12 + 12) % 12;
    const root = () => names.indexOf(app.musicTheory.toSharp(app.fretboard.currentKey));
    const unique = values => [...new Set(values)];
    const notes = () => { const selected = patternNotes(); if (!selected.length) throw new Error('Choose a pattern with notes first.'); return selected; };
    const lifted = () => notes().map(pitch => root() + mod(pitch - root()));
    const choice = values => values[Math.floor(Math.random() * values.length)];
    const show = (parent, id, title, compute, action = 'Show') => {
        let result;
        const group = buttons(parent, 'studio-' + id, title, [[action, () => { result.textContent = compute(); }]]);
        result = output(group); return { group, result };
    };
    const read = key => { try { const value = JSON.parse(localStorage.getItem('fb-new-ui-' + key) || '[]'); return Array.isArray(value) ? value : []; } catch (_) { return []; } };
    const save = (key, value) => localStorage.setItem('fb-new-ui-' + key, JSON.stringify(value));
    let bpm = 120, articulation = 0.85, register = 4, playbackId = 0;
    const voices = new Set();
    const stopExercises = () => { playbackId++; voices.forEach(voice => { try { voice.stop(); } catch (_) {} }); voices.clear(); };
    const noteLabel = pitch => names[mod(pitch)] + (register + Math.floor(pitch / 12));
    const playEvents = async events => {
        stopExercises(); const request = playbackId;
        await ensureAudio();
        if (request !== playbackId) return;
        const step = 60 / bpm, start = audioTime() + 0.03;
        events.slice(0, 48).forEach((event, i) => {
            if (event === null) return;
            const chord = Array.isArray(event) ? event : [event];
            chord.forEach(pitch => {
                const voice = sound(pitch + (register - 4) * 12, start + i * step, step * articulation, 1 / Math.sqrt(chord.length));
                if (voice) { voices.add(voice); voice.addEventListener('ended', () => voices.delete(voice), { once: true }); }
            });
        });
    };
    const exercise = (parent, id, title, build) => {
        let result;
        const format = events => events.map(event => event === null ? '(rest)' : (Array.isArray(event) ? event : [event]).map(noteLabel).join('+')).join('  ');
        const group = buttons(parent, 'studio-' + id, title, [
            ['Show notes', () => { result.textContent = format(build()); }],
            ['Play', async () => { const events = build(); result.textContent = format(events); await playEvents(events); }],
            ['Stop', stopExercises]
        ]);
        result = output(group);
    };
    const melodies = section('studio-melodies', 'Melodic Exercises');
    exercise(melodies, 'ascending', 'One-octave ascending pattern', () => { const scale = lifted(); return [...scale, scale[0] + 12]; });
    exercise(melodies, 'descending', 'One-octave descending pattern', () => { const scale = lifted(); return [...scale, scale[0] + 12].reverse(); });
    exercise(melodies, 'third-sequence', 'Scale-step pairs (degree, degree + 2)', () => { const scale = lifted(), at = i => scale[i % scale.length] + Math.floor(i / scale.length) * 12; return scale.flatMap((_, i) => [at(i), at(i + 2)]); });
    exercise(melodies, 'four-groups', 'Overlapping four-note groups', () => { const scale = lifted(), at = i => scale[i % scale.length] + Math.floor(i / scale.length) * 12; return scale.flatMap((_, i) => [at(i), at(i + 1), at(i + 2), at(i + 3)]); });
    exercise(melodies, 'palindrome', 'Up-and-back pattern without repeated endpoints', () => { const scale = lifted(), up = [...scale, scale[0] + 12]; return [...up, ...up.slice(0, -1).reverse()]; });

    const arpeggios = section('studio-arpeggios', 'Arpeggio Exercises');
    const chord = size => {
        const scale = lifted(), type = byId('pattern-type').value;
        if (scale.length === 7) return Array.from({ length: size }, (_, i) => scale[i * 2]);
        if (type === 'chord' && scale.length >= size && scale.length <= 4) return scale.slice(0, size);
        throw new Error('Choose a seven-note pattern or a chord with at least ' + size + ' tones.');
    };
    exercise(arpeggios, 'triad-up', 'Ascending root triad', () => { const tones = chord(3); return [...tones, tones[0] + 12]; });
    exercise(arpeggios, 'triad-down', 'Descending root triad', () => { const tones = chord(3); return [...tones, tones[0] + 12].reverse(); });
    exercise(arpeggios, 'broken-triad', 'Broken triad: root, fifth, third, octave', () => { const tones = chord(3); return [tones[0], tones[2], tones[1], tones[0] + 12]; });
    exercise(arpeggios, 'seventh-up', 'Ascending root seventh arpeggio', () => { const tones = chord(4); return [...tones, tones[0] + 12]; });
    exercise(arpeggios, 'triad-inversions', 'Cycle all three triad inversions', () => { const tones = chord(3); return tones.flatMap((_, inversion) => [...tones.slice(inversion), ...tones.slice(0, inversion).map(pitch => pitch + 12)]); });

    const progressions = section('studio-progressions', 'Pattern-Derived Progressions');
    const degreeChords = degrees => {
        const scale = lifted(); if (scale.length !== 7) throw new Error('Choose a seven-note pattern for degree-based progressions.');
        const at = i => scale[i % 7] + Math.floor(i / 7) * 12;
        return degrees.map(degree => [at(degree - 1), at(degree + 1), at(degree + 3)]);
    };
    [ ['1451', 'Degree progression: 1-4-5-1', [1, 4, 5, 1]], ['251', 'Degree progression: 2-5-1', [2, 5, 1]], ['1645', 'Degree progression: 1-6-4-5', [1, 6, 4, 5]], ['6415', 'Degree progression: 6-4-1-5', [6, 4, 1, 5]], ['circle', 'Diatonic cycle: 1-4-7-3-6-2-5-1', [1, 4, 7, 3, 6, 2, 5, 1]] ].forEach(([id, title, degrees]) => exercise(progressions, 'progression-' + id, title, () => degreeChords(degrees)));

    const sets = section('studio-pitch-sets', 'Pitch-Set Structure');
    show(sets, 'interval-vector', 'Interval-class vector (classes 1 through 6)', () => {
        const selected = notes(), vector = Array(6).fill(0);
        selected.forEach((pitch, i) => selected.slice(i + 1).forEach(other => { const distance = mod(other - pitch); vector[Math.min(distance, 12 - distance) - 1]++; }));
        return '<' + vector.join(', ') + '>';
    });
    show(sets, 'set-fingerprint', 'Canonical transposition/inversion fingerprint', () => {
        const selected = notes(), candidates = [];
        [1, -1].forEach(sign => names.forEach((_, shift) => candidates.push(selected.map(pitch => mod(sign * pitch + shift)).sort((a, b) => a - b))));
        candidates.sort((a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; });
        return '[' + candidates[0].join(', ') + '] (lexicographic T/I representative, not Forte prime form)';
    });
    show(sets, 'inversion-axes', 'Pitch-class inversion symmetries', () => {
        const selected = notes(); return names.map((_, axis) => axis).filter(axis => selected.every(pitch => selected.includes(mod(axis - pitch)))).map(axis => 'I' + axis + ': x -> (' + axis + ' - x) mod 12').join('\n') || 'No inversion symmetry.';
    });
    show(sets, 'transposition-symmetry', 'Nontrivial pitch-class transposition symmetries', () => {
        const selected = notes(); return names.map((_, shift) => shift).slice(1).filter(shift => selected.every(pitch => selected.includes(mod(pitch + shift)))).map(shift => 'T' + shift + ' (+' + shift + ' semitones)').join('\n') || 'No nontrivial transposition symmetry.';
    });
    show(sets, 'interval-matrix', 'Directed pitch-class interval matrix', () => { const selected = notes(); return 'From / to: ' + selected.map(pitch => names[pitch]).join(' ') + '\n' + selected.map(pitch => names[pitch] + ': ' + selected.map(other => mod(other - pitch)).join(' ')).join('\n'); });

    const modes = section('studio-modes', 'Mode and Scale Analysis');
    const rotations = () => { const selected = notes(); return selected.map(tonic => ({ tonic, offsets: selected.map(pitch => mod(pitch - tonic)).sort((a, b) => a - b) })); };
    show(modes, 'mode-rotations', 'All pitch-set rotations as interval offsets', () => rotations().map(mode => names[mode.tonic] + ': ' + mode.offsets.join('-')).join('\n'));
    show(modes, 'step-formula', 'Circular semitone step formula', () => { const selected = lifted(); return selected.map((pitch, i) => (i + 1 < selected.length ? selected[i + 1] : selected[0] + 12) - pitch).join('-'); });
    show(modes, 'selected-degrees', 'Selected degrees as chromatic offsets from the key', () => notes().map((pitch, i) => 'Tone ' + (i + 1) + ': ' + names[pitch] + ' | +' + mod(pitch - root()) + ' semitones').join('\n'));
    show(modes, 'brightness', 'Rotation ranking by sum of semitone offsets', () => rotations().map(mode => ({ ...mode, sum: mode.offsets.reduce((a, b) => a + b, 0) })).sort((a, b) => b.sum - a.sum).map(mode => names[mode.tonic] + ': sum ' + mode.sum).join('\n') + '\nLarger sums indicate higher chromatic offsets, not a universal brightness measure.');
    show(modes, 'scale-matches', 'Exact scale-family matches across tonics', () => {
        const selected = notes();
        const templates = [ ['Major / Ionian', [0, 2, 4, 5, 7, 9, 11]], ['Dorian', [0, 2, 3, 5, 7, 9, 10]], ['Phrygian', [0, 1, 3, 5, 7, 8, 10]], ['Lydian', [0, 2, 4, 6, 7, 9, 11]], ['Mixolydian', [0, 2, 4, 5, 7, 9, 10]], ['Natural minor / Aeolian', [0, 2, 3, 5, 7, 8, 10]], ['Locrian', [0, 1, 3, 5, 6, 8, 10]], ['Harmonic minor', [0, 2, 3, 5, 7, 8, 11]], ['Melodic minor', [0, 2, 3, 5, 7, 9, 11]], ['Major pentatonic', [0, 2, 4, 7, 9]], ['Minor pentatonic', [0, 3, 5, 7, 10]], ['Blues', [0, 3, 5, 6, 7, 10]], ['Whole tone', [0, 2, 4, 6, 8, 10]], ['Half-whole diminished', [0, 1, 3, 4, 6, 7, 9, 10]] ];
        return names.flatMap((name, tonic) => templates.filter(([, offsets]) => offsets.length === selected.length && offsets.every(offset => selected.includes(mod(tonic + offset)))).map(([family]) => name + ' ' + family)).join('\n') || 'No exact match in the reference families.';
    });

    const geometry = section('studio-geometry', 'Visible Fretboard Geometry');
    show(geometry, 'position-density', 'Visible marker density in playable fret positions', () => {
        const settings = app.fretboard.settings; if (settings.referenceLayout) return 'Requires a fretted instrument.';
        let available = 0;
        settings.tuning.forEach((_, i) => { if (settings.visibleStrings?.[i] === false) return; const start = Math.max(settings.startFret, settings.stringStartFrets?.[i] ?? 0, settings.capoEnabled ? settings.capo : 0); const end = Math.min(settings.endFret, settings.stringEndFrets?.[i] ?? 24); available += Math.max(0, end - start + 1); });
        const count = positions().length; return count + ' marked / ' + available + ' playable positions' + (available ? ' (' + (count / available * 100).toFixed(1) + '%)' : '');
    });
    show(geometry, 'empty-frets', 'Frets with no visible pattern markers', () => {
        const settings = app.fretboard.settings; if (settings.referenceLayout) return 'Requires a fretted instrument.';
        const used = new Set(positions().map(point => point.fret)); return Array.from({ length: settings.endFret - settings.startFret + 1 }, (_, i) => settings.startFret + i).filter(fret => !used.has(fret)).join(', ') || 'Every visible fret has a marker.';
    });
    show(geometry, 'same-fret', 'Same-fret multi-string marker groups', () => {
        const points = positions(), frets = unique(points.map(point => point.fret)).sort((a, b) => a - b);
        return frets.filter(fret => unique(points.filter(point => point.fret === fret).map(point => point.string)).length > 1).map(fret => 'Fret ' + fret + ': strings ' + points.filter(point => point.fret === fret).map(point => point.string).sort((a, b) => a - b).join(', ')).join('\n') || 'No same-fret groups. These are marker groups, not guaranteed playable barres.';
    });
    const pairReport = predicate => {
        const points = positions(), pairs = [];
        points.forEach((point, i) => points.slice(i + 1).forEach(other => { if (predicate(point, other)) pairs.push(point.pitch + ' s' + point.string + 'f' + point.fret + ' <-> ' + other.pitch + ' s' + other.string + 'f' + other.fret); }));
        return pairs.length ? pairs.slice(0, 200).join('\n') + (pairs.length > 200 ? '\nShowing 200 of ' + pairs.length + ' pairs.' : '') : 'No matching visible position pairs.';
    };
    show(geometry, 'pitch-pairs', 'Same-pitch-class position pairs', () => pairReport((a, b) => a.pitch === b.pitch));
    show(geometry, 'crossing-pairs', 'String-crossing connections within two frets', () => pairReport((a, b) => a.string !== b.string && Math.abs(a.fret - b.fret) <= 2));

    const technique = section('studio-technique', 'Technique Drills');
    show(technique, 'pick-directions', 'Alternating pick-direction drill for visible markers', () => { const count = Math.min(positions().length, 32); return count ? Array.from({ length: count }, (_, i) => (i % 2 ? 'Up' : 'Down')).join(' - ') : 'Choose a pattern with visible fretted notes first.'; }, 'Generate');
    show(technique, 'finger-permutation', 'Random four-finger permutation', () => { const fingers = [1, 2, 3, 4]; for (let i = 3; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [fingers[i], fingers[j]] = [fingers[j], fingers[i]]; } return 'Fingers: ' + fingers.join('-') + '. Use a comfortable fret span.'; }, 'Generate');
    show(technique, 'string-skips', 'Alternating outer-to-inner enabled-string drill', () => {
        const settings = app.fretboard.settings; if (settings.referenceLayout) return 'Requires a stringed fretboard.';
        const strings = settings.tuning.map((_, i) => settings.tuning.length - i).filter((_, i) => settings.visibleStrings?.[i] !== false), order = [];
        while (strings.length) { order.push(strings.shift()); if (strings.length) order.push(strings.pop()); }
        return order.length > 1 ? 'Strings: ' + order.join(' -> ') : 'Enable at least two strings.';
    }, 'Generate');
    show(technique, 'accent-drill', 'Random accent placement over eight strokes', () => { const accent = Math.floor(Math.random() * 8); return Array.from({ length: 8 }, (_, i) => i === accent ? 'ACCENT' : 'soft').join(' - '); }, 'Generate');
    show(technique, 'shift-drill', 'Random two-position shift inside the fret window', () => {
        const settings = app.fretboard.settings, start = Math.max(settings.startFret, settings.capoEnabled ? settings.capo : 0), end = settings.endFret;
        if (settings.referenceLayout || end <= start) return 'Show at least two playable frets on a fretted instrument.';
        const first = start + Math.floor(Math.random() * (end - start + 1)), candidates = Array.from({ length: end - start + 1 }, (_, i) => start + i).filter(fret => fret !== first && Math.abs(fret - first) <= 4);
        return 'Shift fret ' + first + ' -> ' + choice(candidates) + ' and return. Choose a comfortable fingering.';
    }, 'Generate');

    const blocks = section('studio-blocks', 'Work and Rest Blocks');
    let workSeconds = 30, restSeconds = 10, rounds = 4, round = 1, phase = 'work', secondsLeft = 30, deadline = 0, blockTimer = null;
    const completed = [];
    const blockOutput = document.createElement('output'); blockOutput.setAttribute('aria-live', 'off');
    const renderBlock = () => { const text = phase === 'done' ? 'All rounds complete.' : 'Round ' + round + '/' + rounds + ' | ' + phase + ' | ' + Math.ceil(secondsLeft) + 's' + (blockTimer ? '' : ' | paused'); if (blockOutput.textContent !== text) blockOutput.textContent = text; };
    const pauseBlocks = () => { if (blockTimer) secondsLeft = Math.max(0, (deadline - performance.now()) / 1000); clearInterval(blockTimer); blockTimer = null; renderBlock(); };
    const resetBlocks = () => { clearInterval(blockTimer); blockTimer = null; round = 1; phase = 'work'; secondsLeft = workSeconds; renderBlock(); };
    number(blocks, 'studio-work-seconds', 'Work duration (seconds)', 30, 5, 600, value => { workSeconds = Math.round(value); byId('new-ui-control-studio-work-seconds').value = workSeconds; resetBlocks(); });
    number(blocks, 'studio-rest-seconds', 'Rest duration (seconds)', 10, 0, 300, value => { restSeconds = Math.round(value); byId('new-ui-control-studio-rest-seconds').value = restSeconds; resetBlocks(); });
    number(blocks, 'studio-block-rounds', 'Number of work rounds', 4, 1, 30, value => { rounds = Math.round(value); byId('new-ui-control-studio-block-rounds').value = rounds; resetBlocks(); });
    const blockRow = buttons(blocks, 'studio-block-timer', 'Work/rest interval timer', [['Start / pause', () => {
        if (blockTimer) { pauseBlocks(); return; }
        if (phase === 'done') resetBlocks();
        deadline = performance.now() + secondsLeft * 1000;
        blockTimer = setInterval(() => {
            secondsLeft = Math.max(0, (deadline - performance.now()) / 1000);
            if (secondsLeft <= 0) {
                if (phase === 'work') {
                    completed.push({ at: new Date().toISOString(), round, seconds: workSeconds });
                    if (round >= rounds) { clearInterval(blockTimer); blockTimer = null; phase = 'done'; say('Work/rest practice complete.'); renderBlock(); return; }
                    if (restSeconds > 0) { phase = 'rest'; secondsLeft = restSeconds; } else { round++; secondsLeft = workSeconds; }
                } else { round++; phase = 'work'; secondsLeft = workSeconds; }
                deadline = performance.now() + secondsLeft * 1000;
            }
            renderBlock();
        }, 250); renderBlock();
    }], ['Reset', resetBlocks]]); blockRow.append(blockOutput); renderBlock();
    let blockLog;
    const logRow = buttons(blocks, 'studio-block-log', 'Completed work-block log for this visit', [['Show log', () => { blockLog.textContent = completed.map(item => 'Round ' + item.round + ': ' + item.seconds + ' seconds | ' + new Date(item.at).toLocaleTimeString()).join('\n') || 'No completed work blocks yet.'; }], ['Download CSV', () => download('work-blocks.csv', ['time,round,seconds', ...completed.map(item => [item.at, item.round, item.seconds].join(','))].join('\r\n'), 'text/csv')]]); blockLog = output(logRow);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseBlocks(); stopExercises(); } });
    window.addEventListener('pagehide', () => { clearInterval(blockTimer); stopExercises(); });

    const checklist = section('studio-checklist', 'Study Checklist');
    const refreshTasks = selected => { const tasks = read('tasks'); taskSelect.replaceChildren(new Option('Choose a task', ''), ...tasks.map((task, i) => new Option((task.done ? '[done] ' : '[ ] ') + task.text, String(i)))); if (selected !== undefined && selected >= 0 && selected < tasks.length) taskSelect.value = String(selected); };
    const addTaskRow = buttons(checklist, 'studio-add-task', 'Add a locally saved practice task', [['Add task', () => {
        const text = taskText.value.trim(); if (!text) { say('Enter a task first.'); return; }
        const tasks = read('tasks'); if (tasks.length >= 100) { say('Remove a task before adding more (100 maximum).'); return; }
        tasks.push({ text, done: false }); save('tasks', tasks); taskText.value = ''; refreshTasks(tasks.length - 1);
    }]]);
    const taskText = document.createElement('input'); taskText.type = 'text'; taskText.maxLength = 160; taskText.setAttribute('aria-label', 'New practice task'); taskText.placeholder = 'Practice task'; addTaskRow.append(taskText);
    const taskSelect = select(checklist, 'studio-task-list', 'Select a saved task', [['', 'Choose a task']], () => {});
    buttons(checklist, 'studio-task-toggle', 'Mark the selected task done or reopen it', [['Done / reopen', () => { if (taskSelect.value === '') { say('Choose a task first.'); return; } const at = Number(taskSelect.value), tasks = read('tasks'); if (!tasks[at]) return; tasks[at].done = !tasks[at].done; save('tasks', tasks); refreshTasks(at); }]]);
    buttons(checklist, 'studio-task-remove', 'Remove the selected task', [['Remove task', () => { if (taskSelect.value === '') { say('Choose a task first.'); return; } const at = Number(taskSelect.value), tasks = read('tasks'); tasks.splice(at, 1); save('tasks', tasks); refreshTasks(Math.min(at, tasks.length - 1)); }]]);
    buttons(checklist, 'studio-task-export', 'Export the study checklist as text', [['Download checklist', () => download('fretboard-checklist.txt', read('tasks').map(task => (task.done ? '[x] ' : '[ ] ') + task.text).join('\n'), 'text/plain')]]); refreshTasks();

    const notebook = section('studio-notebook', 'Pattern Study Notebook');
    const refreshNotebook = selected => { const entries = read('notebook'); entrySelect.replaceChildren(new Option('Choose a study entry', ''), ...entries.map((entry, i) => new Option(entry.title, String(i)))); if (selected !== undefined && selected >= 0 && selected < entries.length) entrySelect.value = String(selected); };
    let entryOutput;
    const saveEntryRow = buttons(notebook, 'studio-notebook-save', 'Save an annotated pitch-set study', [['Save entry', () => {
        const selected = notes(), entries = read('notebook'); if (entries.length >= 50) { say('Remove an entry before adding more (50 maximum).'); return; }
        const title = entryTitle.value.trim() || app.fretboard.currentKey + ' ' + (byId('pattern-select').selectedOptions[0]?.textContent || byId('pattern-select').value);
        entries.push({ title, at: new Date().toISOString(), key: app.fretboard.currentKey, pattern: byId('pattern-select').value, pitches: selected.map(pitch => names[pitch]), tuning: app.fretboard.settings.tuning.slice(), annotation: annotation.value });
        save('notebook', entries); refreshNotebook(entries.length - 1); entrySelect.dispatchEvent(new Event('change')); say('Study entry saved locally.');
    }]]);
    const entryTitle = document.createElement('input'); entryTitle.type = 'text'; entryTitle.maxLength = 80; entryTitle.placeholder = 'Study title'; entryTitle.setAttribute('aria-label', 'Study title');
    const annotation = document.createElement('textarea'); annotation.rows = 2; annotation.maxLength = 2000; annotation.placeholder = 'Study observations'; annotation.setAttribute('aria-label', 'Study observations'); saveEntryRow.append(entryTitle, annotation);
    const entrySelect = select(notebook, 'studio-notebook-read', 'Read a saved study entry', [['', 'Choose a study entry']], value => {
        const entry = value === '' ? null : read('notebook')[Number(value)];
        entryOutput.textContent = entry ? entry.title + '\n' + new Date(entry.at).toLocaleString() + '\nPitches: ' + entry.pitches.join(' ') + '\nTuning: ' + entry.tuning.join(' ') + '\n' + entry.annotation : '';
    }); entryOutput = output(entrySelect.parentElement);
    const renameRow = buttons(notebook, 'studio-notebook-rename', 'Rename the selected study entry', [['Rename', () => {
        if (entrySelect.value === '' || !renameInput.value.trim()) { say('Choose an entry and enter a new title.'); return; }
        const at = Number(entrySelect.value), entries = read('notebook'); if (!entries[at]) return; entries[at].title = renameInput.value.trim(); save('notebook', entries); refreshNotebook(at); entrySelect.dispatchEvent(new Event('change')); say('Study entry renamed.');
    }]]);
    const renameInput = document.createElement('input'); renameInput.type = 'text'; renameInput.maxLength = 80; renameInput.setAttribute('aria-label', 'New study title'); renameRow.append(renameInput);
    buttons(notebook, 'studio-notebook-remove', 'Delete the selected study entry', [['Delete entry', () => {
        if (entrySelect.value === '') { say('Choose a study entry first.'); return; }
        if (!confirm('Delete the selected study notebook entry?')) return;
        const entries = read('notebook'), at = Number(entrySelect.value); entries.splice(at, 1); save('notebook', entries); refreshNotebook(Math.min(at, entries.length - 1)); entrySelect.dispatchEvent(new Event('change'));
    }]]);
    buttons(notebook, 'studio-notebook-export', 'Export the annotated notebook as JSON', [['Download notebook', () => download('fretboard-notebook.json', JSON.stringify(read('notebook'), null, 2), 'application/json')]]); refreshNotebook();

    const audio = section('studio-audio', 'Exercise Audio Controls');
    number(audio, 'studio-exercise-bpm', 'Melody, arpeggio and progression tempo (BPM)', 120, 30, 240, value => { bpm = value; });
    select(audio, 'studio-articulation', 'Exercise note articulation', [['0.85', 'Detached'], ['0.45', 'Staccato'], ['1.1', 'Legato']], value => { articulation = Number(value); });
    select(audio, 'studio-register', 'Exercise starting register', [[4, 'C4-based register'], [2, 'C2-based register'], [3, 'C3-based register'], [5, 'C5-based register'], [6, 'C6-based register']], value => { register = Number(value); });
    exercise(audio, 'shuffle-melody', 'Shuffle and play the current pitch set', () => { const scale = lifted(); for (let i = scale.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [scale[i], scale[j]] = [scale[j], scale[i]]; } return scale; });
    buttons(audio, 'studio-stop-exercises', 'Stop only these exercise sounds', [['Stop exercises', stopExercises]]);
    window.installStandaloneNewUiMore({ app, section, row, buttons, select, number, output, download, say, show, exercise, playEvents, notes, lifted, root, positions, read, save });
};
