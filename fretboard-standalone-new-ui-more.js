window.installStandaloneNewUiMore = ({ app, section, row, buttons, select, number, output, download, say, show, exercise, playEvents, notes, lifted, root, positions, read, save }) => {
    const byId = id => document.getElementById(id);
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const mod = value => (value % 12 + 12) % 12;
    const pitchIndex = pitch => names.indexOf(app.musicTheory.toSharp(pitch));
    const report = (parent, id, title, compute, action) => show(parent, 'more-' + id, title, compute, action);
    const controls = (parent, id, title, actions) => buttons(parent, 'more-' + id, title, actions);
    const movement = (from, to) => { const distance = mod(to - from); return distance > 6 ? distance - 12 : distance; };
    const permutations = values => values.length ? values.flatMap((value, i) => permutations(values.filter((_, at) => at !== i)).map(rest => [value, ...rest])) : [[]];
    const csvCell = value => { let text = String(value ?? ''); if (/^[=+@\-\t\r\n]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"', '""') + '"'; };

    const leading = section('more-voice-leading', 'Pitch-Class Voice Leading');
    let source = null;
    const assignments = target => {
        if (!source) throw new Error('Capture a source triad or seventh chord first.');
        if (target.length !== source.length) throw new Error('Source and destination need the same number of pitch classes.');
        return permutations(target).map(order => ({ order, motions: order.map((pitch, i) => movement(source[i], pitch)), cost: order.reduce((sum, pitch, i) => sum + Math.abs(movement(source[i], pitch)), 0) })).sort((a, b) => a.cost - b.cost);
    };
    const formatAssignment = plan => source.map((pitch, i) => names[pitch] + ' -> ' + names[plan.order[i]] + ' (' + (plan.motions[i] >= 0 ? '+' : '') + plan.motions[i] + ')').join(' | ') + ' | total ' + plan.cost + ' semitones';
    report(leading, 'voice-source', 'Capture a three- or four-pitch source chord', () => { const selected = notes(); if (![3, 4].includes(selected.length)) throw new Error('Select a three- or four-pitch chord first.'); source = selected.slice(); return 'Source: ' + source.map(pitch => names[pitch]).join(' '); }, 'Capture');
    report(leading, 'voice-best', 'Minimum pitch-class voice assignment to the current chord', () => formatAssignment(assignments(notes())[0]) + '\nOctave placement is unspecified; this is not a physical fingering.');
    report(leading, 'voice-alternatives', 'Five lowest-motion voice assignments', () => assignments(notes()).slice(0, 5).map((plan, i) => (i + 1) + '. ' + formatAssignment(plan)).join('\n'));
    report(leading, 'voice-next', 'Smoothest different triads in the current seven-note pattern', () => {
        const scale = notes(); if (scale.length !== 7 || source?.length !== 3) throw new Error('Capture a source triad, then select a seven-note pattern.');
        return scale.map((_, i) => { const target = [scale[i], scale[(i + 2) % 7], scale[(i + 4) % 7]]; return { degree: i + 1, target, plan: assignments(target)[0] }; }).filter(item => item.plan.cost > 0).sort((a, b) => a.plan.cost - b.plan.cost).map(item => 'Degree ' + item.degree + ': ' + item.target.map(pitch => names[pitch]).join(' ') + ' | total motion ' + item.plan.cost).join('\n');
    });
    controls(leading, 'voice-export', 'Export the current minimal voice assignment', [['Download voice plan', () => download('voice-leading.txt', 'Pitch-class voice leading (octave placement unspecified)\n' + formatAssignment(assignments(notes())[0]), 'text/plain')]]);

    const extensions = section('more-extensions', 'Chord Extensions and Shells');
    const chordMaterial = () => {
        const scale = lifted();
        if (mod(scale[0]) !== root()) throw new Error('Choose a pattern containing its root.');
        if (scale.length === 7) return { base: [scale[0], scale[2], scale[4], scale[6]], extensions: [scale[1] + 12, scale[3] + 12, scale[5] + 12] };
        if (byId('pattern-type').value === 'chord' && [3, 4].includes(scale.length)) return { base: scale, extensions: [scale[0] + 14, scale[0] + 17, scale[0] + 21] };
        throw new Error('Choose a seven-note pattern or a three-/four-tone chord.');
    };
    [ ['ninth', 'Chord with ninth (pattern-derived for scales)', 0], ['eleventh', 'Chord with eleventh (pattern-derived for scales)', 1], ['thirteenth', 'Chord with thirteenth (pattern-derived for scales)', 2] ].forEach(([id, title, at]) => exercise(extensions, 'more-' + id, title, () => { const material = chordMaterial(); return [[...material.base, ...material.extensions.slice(0, at + 1)]]; }));
    const seventh = () => { const material = chordMaterial(); if (material.base.length !== 4) throw new Error('Choose a seventh chord or seven-note pattern.'); return material.base; };
    exercise(extensions, 'more-shell', 'Root-third-seventh shell voicing', () => { const tones = seventh(); return [[tones[0], tones[1], tones[3]]]; });
    exercise(extensions, 'more-guide-tones', 'Third/seventh guide-tone pair, then reversed', () => { const tones = seventh(); return [tones[1], tones[3], tones[3], tones[1]]; });

    const rhythmic = section('more-rhythmic', 'Rhythm and Pedal Studies');
    exercise(rhythmic, 'more-offbeats', 'Off-beat melody with alternating rests', () => lifted().flatMap(pitch => [null, pitch]));
    exercise(rhythmic, 'more-three-rest', 'Three-note fragments followed by a rest', () => { const scale = lifted(), at = i => scale[i % scale.length] + Math.floor(i / scale.length) * 12; return scale.flatMap((_, i) => [at(i), at(i + 1), at(i + 2), null]); });
    exercise(rhythmic, 'more-tonic-pedal', 'Alternate tonic pedal and each pattern tone', () => lifted().flatMap(pitch => [root(), pitch]));
    exercise(rhythmic, 'more-neighbor-turns', 'Upper scale-neighbor turns', () => { const scale = lifted(); return scale.flatMap((pitch, i) => [pitch, i + 1 < scale.length ? scale[i + 1] : scale[0] + 12, pitch, null]); });
    exercise(rhythmic, 'more-call-response', 'Four-note call and reversed four-note response', () => { const scale = lifted(); if (scale.length < 4) throw new Error('Choose a pattern with at least four tones.'); return [...scale.slice(0, 4), null, ...scale.slice(-4).reverse(), null]; });

    const triadQuiz = section('more-triad-quiz', 'Triad-Quality Listening Quiz');
    const qualities = [ ['Major', [0, 4, 7]], ['Minor', [0, 3, 7]], ['Diminished', [0, 3, 6]], ['Augmented', [0, 4, 8]] ];
    let triadQuestion = null, triadLocked = false, triadCorrect = 0, triadTotal = 0;
    const presentation = select(triadQuiz, 'more-triad-presentation', 'Triad presentation', [['together', 'Harmonic chord'], ['broken', 'Ascending arpeggio']], () => {});
    const playTriad = () => { const question = triadQuestion; if (!question) throw new Error('Start a new triad question first.'); const tones = qualities[question.quality][1].map(offset => question.root + offset); return playEvents(question.presentation === 'together' ? [tones] : tones); };
    let triadOutput;
    const triadQuestionRow = controls(triadQuiz, 'triad-question', 'Identify a triad quality by ear', [['New triad', async () => { triadQuestion = { quality: Math.floor(Math.random() * qualities.length), root: Math.floor(Math.random() * 12), presentation: presentation.value }; triadLocked = false; await playTriad(); triadOutput.textContent = 'Which triad quality did you hear?'; }], ['Replay', playTriad]]); triadOutput = output(triadQuestionRow);
    const triadGuessRow = controls(triadQuiz, 'triad-guess', 'Submit a triad-quality answer', [['Check answer', () => {
        if (!triadQuestion || triadLocked) throw new Error('Start a new triad question first.');
        const correct = Number(triadGuess.value) === triadQuestion.quality; triadTotal++; if (correct) triadCorrect++; triadLocked = true; triadOutput.textContent = (correct ? 'Correct: ' : 'Answer: ') + qualities[triadQuestion.quality][0]; renderTriadScore();
    }]]);
    const triadGuess = document.createElement('select'); triadGuess.setAttribute('aria-label', 'Your triad quality answer'); triadGuess.replaceChildren(...qualities.map(([name], i) => new Option(name, String(i)))); triadGuessRow.append(triadGuess);
    controls(triadQuiz, 'triad-reveal', 'Reveal triad quality without scoring', [['Reveal quality', () => { if (!triadQuestion) throw new Error('Start a question first.'); triadLocked = true; triadOutput.textContent = 'Answer: ' + qualities[triadQuestion.quality][0]; }]]);
    const triadScoreRow = controls(triadQuiz, 'triad-score', 'Triad-quality quiz score', [['Reset score', () => { triadCorrect = 0; triadTotal = 0; renderTriadScore(); }]]);
    const triadScore = output(triadScoreRow), renderTriadScore = () => { triadScore.textContent = triadCorrect + ' correct / ' + triadTotal + ' scored'; }; renderTriadScore();

    const degreeQuiz = section('more-degree-quiz', 'Scale-Degree Quiz');
    let degreeQuestion = null, degreeLocked = false, degreeCorrect = 0, degreeTotal = 0;
    const degreeMode = select(degreeQuiz, 'more-degree-mode', 'Question direction', [['pitch', 'Degree to pitch'], ['degree', 'Pitch to degree']], () => {});
    let degreeOutput;
    const degreeQuestionRow = controls(degreeQuiz, 'degree-question', 'Identify a degree or pitch in a seven-note pattern', [['New question', () => {
        const scale = notes(); if (scale.length !== 7 || !scale.includes(root())) throw new Error('Choose a seven-note pattern containing its root.');
        const at = Math.floor(Math.random() * 7), mode = degreeMode.value;
        degreeQuestion = { answer: mode === 'pitch' ? names[scale[at]] : String(at + 1) }; degreeLocked = false;
        degreeGuess.replaceChildren(...(mode === 'pitch' ? names : [1, 2, 3, 4, 5, 6, 7].map(String)).map(value => new Option(value, value)));
        const context = app.fretboard.currentKey + ' ' + (byId('pattern-select').selectedOptions[0]?.textContent || 'pattern');
        degreeOutput.textContent = mode === 'pitch' ? 'Degree ' + (at + 1) + ' of ' + context + ': which pitch?' : names[scale[at]] + ' in ' + context + ': which degree?';
    }]]); degreeOutput = output(degreeQuestionRow);
    const degreeGuessRow = controls(degreeQuiz, 'degree-guess', 'Submit a scale-degree quiz answer', [['Check answer', () => {
        if (!degreeQuestion || degreeLocked) throw new Error('Start a new scale-degree question first.');
        const correct = degreeGuess.value === degreeQuestion.answer; degreeTotal++; if (correct) degreeCorrect++; degreeLocked = true; degreeOutput.textContent = (correct ? 'Correct: ' : 'Answer: ') + degreeQuestion.answer; renderDegreeScore();
    }]]);
    const degreeGuess = document.createElement('select'); degreeGuess.setAttribute('aria-label', 'Your scale-degree quiz answer'); degreeGuess.replaceChildren(new Option('Start a question first', '')); degreeGuessRow.append(degreeGuess);
    controls(degreeQuiz, 'degree-reveal', 'Reveal the degree or pitch without scoring', [['Reveal answer', () => { if (!degreeQuestion) throw new Error('Start a question first.'); degreeLocked = true; degreeOutput.textContent = 'Answer: ' + degreeQuestion.answer; }]]);
    const degreeScoreRow = controls(degreeQuiz, 'degree-score', 'Scale-degree quiz score', [['Reset score', () => { degreeCorrect = 0; degreeTotal = 0; renderDegreeScore(); }]]);
    const degreeScore = output(degreeScoreRow), renderDegreeScore = () => { degreeScore.textContent = degreeCorrect + ' correct / ' + degreeTotal + ' scored'; }; renderDegreeScore();

    const scratch = section('more-scratchpad', 'Pitch-Set Scratchpad');
    let editor = [];
    const editorRow = controls(scratch, 'editor', 'Scratchpad pitches (does not change the diagram)', [['Copy pattern', () => { editor = notes().slice(); syncEditor(); }], ['Clear', () => { editor = []; syncEditor(); }]]);
    const pitchChecks = document.createElement('div'); pitchChecks.className = 'more-pitch-checks';
    const boxes = names.map((name, i) => { const label = document.createElement('label'), input = document.createElement('input'); input.type = 'checkbox'; input.value = String(i); input.setAttribute('aria-label', 'Scratchpad ' + name); input.addEventListener('change', () => { editor = boxes.filter(box => box.checked).map(box => Number(box.value)); }); label.append(input, document.createTextNode(name)); pitchChecks.append(label); return input; });
    editorRow.append(pitchChecks);
    const syncEditor = () => { boxes.forEach((box, i) => { box.checked = editor.includes(i); }); };
    controls(scratch, 'editor-transpose', 'Transpose scratchpad pitches by semitone', [['Down', () => { editor = editor.map(pitch => mod(pitch - 1)); syncEditor(); }], ['Up', () => { editor = editor.map(pitch => mod(pitch + 1)); syncEditor(); }]]);
    controls(scratch, 'editor-invert', 'Invert scratchpad around the current diagram root', [['Invert', () => { editor = editor.map(pitch => mod(2 * root() - pitch)); syncEditor(); }]]);
    controls(scratch, 'editor-complement', 'Replace scratchpad with its chromatic complement', [['Complement', () => { editor = names.map((_, i) => i).filter(pitch => !editor.includes(pitch)); syncEditor(); }]]);
    let editorOutput;
    const editorReportRow = controls(scratch, 'editor-report', 'Analyze, audition or export scratchpad pitches', [['Analyze', () => { const vector = Array(6).fill(0); editor.forEach((pitch, i) => editor.slice(i + 1).forEach(other => { const distance = mod(other - pitch); vector[Math.min(distance, 12 - distance) - 1]++; })); editorOutput.textContent = editor.length ? editor.map(pitch => names[pitch]).join(' ') + '\nInterval-class vector: <' + vector.join(', ') + '>' : 'No scratchpad pitches selected.'; }], ['Play', () => { if (!editor.length) throw new Error('Select scratchpad pitches first.'); return playEvents(editor.slice().sort((a, b) => a - b)); }], ['Download JSON', () => download('pitch-scratchpad.json', JSON.stringify({ pitches: editor.map(pitch => names[pitch]), pitchClasses: editor }, null, 2), 'application/json')]]); editorOutput = output(editorReportRow);

    const analytics = section('more-analytics', 'Saved Practice Analytics');
    const history = () => read('history').filter(item => item && typeof item === 'object');
    const numeric = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
    report(analytics, 'practice-totals', 'Total logged repetitions and session average', () => { const records = history(), total = records.reduce((sum, item) => sum + numeric(item.repetitions), 0); return records.length + ' sessions | ' + total + ' repetitions | average ' + (records.length ? (total / records.length).toFixed(1) : '0') + ' per session'; });
    report(analytics, 'practice-days', 'Active days, current streak and longest streak', () => {
        const dayNumber = date => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
        const days = [...new Set(history().map(item => new Date(item.date)).filter(date => Number.isFinite(date.getTime())).map(dayNumber))].sort((a, b) => a - b);
        const today = dayNumber(new Date()), daySet = new Set(days); let current = 0, cursor = daySet.has(today) ? today : today - 1, longest = 0, run = 0;
        while (daySet.has(cursor--)) current++;
        days.forEach((day, i) => { run = i && day === days[i - 1] + 1 ? run + 1 : 1; longest = Math.max(longest, run); });
        return days.length + ' active days | current streak ' + current + ' days | longest streak ' + longest + ' days';
    });
    const rankHistory = key => { const counts = new Map(); history().forEach(item => { const label = key === 'pattern' ? String(item.type || '(type unspecified)') + ' / ' + String(item.pattern || '(unspecified)') : String(item[key] || '(unspecified)'); counts.set(label, (counts.get(label) || 0) + 1); }); return [...counts].sort((a, b) => b[1] - a[1]).map(([label, count]) => label + ': ' + count + ' sessions').join('\n') || 'No saved practice records.'; };
    report(analytics, 'practice-keys', 'Most frequently logged keys', () => rankHistory('key'));
    report(analytics, 'practice-patterns', 'Most frequently logged pattern selections', () => rankHistory('pattern'));
    report(analytics, 'practice-goals', 'Logged repetition-goal completion rate', () => { const records = history().filter(item => numeric(item.goal) > 0), complete = records.filter(item => numeric(item.repetitions) >= numeric(item.goal)).length; return records.length ? complete + '/' + records.length + ' goals met (' + Math.round(complete / records.length * 100) + '%)' : 'No saved records with repetition goals.'; });

    const finder = section('more-triad-finder', 'Visible Triad Plan Finder');
    let maxDistance = 4, adjacent = false, outerTone = '', lastPlans = [], planOutput;
    const clearPlans = () => { lastPlans = []; if (planOutput) planOutput.textContent = ''; };
    number(finder, 'more-plan-distance', 'Maximum fret difference in a triad plan', 4, 0, 8, value => { maxDistance = value; clearPlans(); });
    select(finder, 'more-plan-strings', 'Participating strings', [['any', 'Any three distinct strings'], ['adjacent', 'Three adjacent strings only']], value => { adjacent = value === 'adjacent'; clearPlans(); });
    select(finder, 'more-plan-tone', 'Tone on the largest-numbered participating string', [['', 'Any chord tone'], ['0', 'Root'], ['1', 'Third'], ['2', 'Fifth']], value => { outerTone = value; clearPlans(); });
    const findRow = controls(finder, 'plan-find', 'Find root/third/fifth plans among visible markers', [['Find plans', () => {
        const selected = notes(); let triad;
        if (selected.length === 7) triad = [selected[0], selected[2], selected[4]];
        else if (byId('pattern-type').value === 'chord' && [3, 4].includes(selected.length)) triad = selected.slice(0, 3);
        else throw new Error('Choose a seven-note pattern or a three-/four-tone chord.');
        if (triad[0] !== root()) throw new Error('Choose a pattern containing its root.');
        const points = positions(), groups = triad.map(pitch => points.filter(point => pitchIndex(point.pitch) === pitch)); let count = 0; lastPlans = [];
        groups[0].forEach(a => groups[1].forEach(b => groups[2].forEach(c => {
            const plan = [a, b, c], strings = plan.map(point => point.string), frets = plan.map(point => point.fret);
            if (new Set(strings).size !== 3 || Math.max(...frets) - Math.min(...frets) > maxDistance) return;
            if (adjacent && Math.max(...strings) - Math.min(...strings) !== 2) return;
            if (outerTone !== '' && plan[Number(outerTone)].string !== Math.max(...strings)) return;
            count++; if (lastPlans.length < 60) lastPlans.push(plan);
        })));
        planOutput.textContent = count ? lastPlans.map((plan, i) => (i + 1) + '. ' + plan.map(point => point.pitch + ' s' + point.string + 'f' + point.fret).join(' | ')).join('\n') + '\nShowing ' + lastPlans.length + ' of ' + count + ' marker plans. Physical playability is not guaranteed.' : 'No matching plans. Widen the fret window, clear filters or relax the plan constraints.';
    }]]); planOutput = output(findRow);
    controls(finder, 'plan-export', 'Export the last found triad plans (up to 60)', [['Download plans CSV', () => { if (!lastPlans.length) throw new Error('Find matching triad plans first.'); download('triad-plans.csv', ['plan,tone,pitch,string,fret', ...lastPlans.flatMap((plan, i) => plan.map((point, tone) => [i + 1, ['root', 'third', 'fifth'][tone], point.pitch, point.string, point.fret].join(',')))].join('\r\n'), 'text/csv'); }]]);

    const milestones = section('more-tempo', 'Tempo Milestones');
    let milestoneOutput;
    const refreshMilestones = selected => { const entries = read('tempo-milestones'); milestoneSelect.replaceChildren(new Option('Choose a tempo attempt', ''), ...entries.map((entry, i) => new Option(entry.bpm + ' BPM | ' + entry.key + ' ' + entry.pattern + (entry.clean ? ' | clean' : ' | in progress'), String(i)))); if (selected !== undefined && selected >= 0 && selected < entries.length) milestoneSelect.value = String(selected); };
    const logTempoRow = controls(milestones, 'tempo-add', 'Log a tempo attempt for the current pattern', [['Save attempt', () => {
        const bpm = Math.max(30, Math.min(300, Math.round(Number(attemptBpm.value) || 120))), repetitions = Math.max(1, Math.min(1000, Math.round(Number(attemptReps.value) || 1)));
        attemptBpm.value = bpm; attemptReps.value = repetitions;
        const entries = read('tempo-milestones'); entries.unshift({ at: new Date().toISOString(), key: app.fretboard.currentKey, pattern: byId('pattern-select').value, type: byId('pattern-type').value, bpm, repetitions, clean: attemptClean.checked }); save('tempo-milestones', entries.slice(0, 200)); refreshMilestones(0); milestoneSelect.dispatchEvent(new Event('change')); say('Tempo attempt saved locally.');
    }]]);
    const attemptBpm = document.createElement('input'); attemptBpm.type = 'number'; attemptBpm.min = '30'; attemptBpm.max = '300'; attemptBpm.value = '120'; attemptBpm.setAttribute('aria-label', 'Attempt tempo in BPM');
    const attemptReps = document.createElement('input'); attemptReps.type = 'number'; attemptReps.min = '1'; attemptReps.max = '1000'; attemptReps.value = '1'; attemptReps.setAttribute('aria-label', 'Clean or attempted repetitions');
    const cleanLabel = document.createElement('label'), attemptClean = document.createElement('input'); attemptClean.type = 'checkbox'; cleanLabel.append(attemptClean, document.createTextNode('Clean attempt')); logTempoRow.append(attemptBpm, attemptReps, cleanLabel);
    const milestoneSelect = select(milestones, 'more-tempo-list', 'Read a saved tempo attempt', [['', 'Choose a tempo attempt']], value => { const entry = value === '' ? null : read('tempo-milestones')[Number(value)]; milestoneOutput.textContent = entry ? new Date(entry.at).toLocaleString() + ' | ' + entry.key + ' ' + entry.pattern + ' | ' + entry.bpm + ' BPM | ' + entry.repetitions + ' repetitions | ' + (entry.clean ? 'clean' : 'in progress') : ''; }); milestoneOutput = output(milestoneSelect.parentElement);
    report(milestones, 'tempo-best', 'Fastest clean attempt for the current key and pattern', () => { const entries = read('tempo-milestones').filter(entry => entry.clean && entry.key === app.fretboard.currentKey && entry.type === byId('pattern-type').value && entry.pattern === byId('pattern-select').value).sort((a, b) => b.bpm - a.bpm); return entries.length ? entries[0].bpm + ' BPM | ' + entries[0].repetitions + ' clean repetitions | ' + new Date(entries[0].at).toLocaleString() : 'No clean tempo attempts logged for this key and pattern.'; });
    controls(milestones, 'tempo-remove', 'Delete the selected tempo attempt', [['Delete attempt', () => { if (milestoneSelect.value === '') throw new Error('Choose a tempo attempt first.'); const entries = read('tempo-milestones'), at = Number(milestoneSelect.value); entries.splice(at, 1); save('tempo-milestones', entries); refreshMilestones(Math.min(at, entries.length - 1)); milestoneSelect.dispatchEvent(new Event('change')); }]]);
    controls(milestones, 'tempo-export', 'Export all saved tempo attempts as CSV', [['Download attempts CSV', () => { const columns = ['at', 'key', 'type', 'pattern', 'bpm', 'repetitions', 'clean']; download('tempo-milestones.csv', [columns.join(','), ...read('tempo-milestones').map(entry => columns.map(key => csvCell(entry[key])).join(','))].join('\r\n'), 'text/csv'); }]]); refreshMilestones();
};
