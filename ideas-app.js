/**
 * Ideas & Notes (v1.0) - previously a "functionality coming soon" placeholder.
 * A private notebook for practice ideas and course suggestions, stored on this device.
 */
document.addEventListener('DOMContentLoaded', () => {
    const KEY = 'st_ideas';
    const form = document.getElementById('idea-form');
    const text = document.getElementById('idea-text');
    const list = document.getElementById('idea-list');
    const exportBtn = document.getElementById('idea-export');
    const exportPdfBtn = document.getElementById('idea-export-pdf');
    const exportMidiBtn = document.getElementById('idea-export-midi');
    const exportStatus = document.getElementById('idea-export-status');
    const intervalPicker = document.getElementById('idea-interval-picker');
    const intervalOptions = document.getElementById('idea-interval-options');
    const selectedIntervals = new Set(['1', '5']);
    let editing = null;
    // v1.0 sandbox fretboard: click frets to sketch a shape and attach it to a note
    const fbHost = document.getElementById('idea-fb');
    const tuningSel = document.getElementById('idea-tuning');
    const found = document.getElementById('idea-found');
    const patternType = document.getElementById('idea-pattern-type');
    const patternKey = document.getElementById('idea-pattern-key');
    const patternSelect = document.getElementById('idea-pattern-id');
    const transposeKey = document.getElementById('idea-transpose-key');
    const identifyKeyBtn = document.getElementById('idea-identify-key');
    const updateKeyBtn = document.getElementById('idea-update-key');
    const sequenceType = document.getElementById('idea-sequence-type');
    const sequenceSize = document.getElementById('idea-sequence-size');
    const sequenceResults = document.getElementById('idea-sequence-results');
    const mt = typeof MusicTheory !== 'undefined' ? new MusicTheory() : null;
    let marks = [];
    let identifiedKey = null;
    Object.keys(MiniFretboard.TUNINGS).forEach(k => tuningSel.add(new Option(MiniFretboard.TUNINGS[k].name, k)));
    mt.notes.forEach(k => {
        patternKey.add(new Option(k, k));
        transposeKey.add(new Option(k, k));
    });
    patternKey.value = 'C';
    transposeKey.value = 'C';

    function renderIntervalChoices() {
        const choices = Object.entries(mt.intervals)
            .filter(([, item]) => item && Number.isFinite(item.semitones) && item.semitones >= 0 && item.semitones <= 24)
            .sort((a, b) => a[1].semitones - b[1].semitones || a[1].name.localeCompare(b[1].name));
        intervalOptions.replaceChildren(...choices.map(([id, item]) => {
            const label = document.createElement('label');
            label.className = 'idea-interval-choice';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = id;
            checkbox.checked = selectedIntervals.has(id);
            checkbox.setAttribute('aria-label', item.name + ' interval');
            const name = document.createElement('span');
            name.textContent = item.name + ' (' + id + ')';
            label.append(checkbox, name);
            return label;
        }));
    }

    function fillPatterns() {
        const type = patternType.value;
        const collection = type === 'interval' ? mt.intervals : type === 'chord' ? mt.chords : mt.scales;
        const options = Object.entries(collection).sort((a, b) => a[1].name.localeCompare(b[1].name));
        patternSelect.replaceChildren(...options.map(([id, item]) => new Option(item.name + ' - ' + id, id)));
        const preferred = type === 'interval' ? '1' : 'major';
        if (collection[preferred]) patternSelect.value = preferred;
        intervalPicker.hidden = type !== 'interval';
        patternSelect.hidden = type === 'interval';
    }

    function patternNotes() {
        const type = patternType.value, id = patternSelect.value, key = patternKey.value;
        if (type === 'interval') {
            const seen = new Set();
            return [...intervalOptions.querySelectorAll('input:checked')]
                .sort((a, b) => mt.getIntervalSemitones(a.value) - mt.getIntervalSemitones(b.value))
                .map(input => mt.getNoteFromInterval(key, input.value))
                .filter(note => {
                    if (!note) return false;
                    const pitch = mt.notes.indexOf(mt.toSharp(note));
                    if (pitch < 0 || seen.has(pitch)) return false;
                    seen.add(pitch);
                    return true;
                });
        }
        return type === 'chord' ? mt.getChordNotes(key, id) : mt.getScaleNotes(key, id);
    }

    function pcs() {
        const strings = MiniFretboard.TUNINGS[tuningSel.value].strings;
        return [...new Set(marks.map(m => (mt.notes.indexOf(strings[m.s]) + m.f) % 12))];
    }

    function sourcePitchClasses() {
        const source = marks.length ? pcs() : patternNotes().map(note => mt.notes.indexOf(mt.toSharp(note))).filter(n => n >= 0);
        const root = mt.notes.indexOf(mt.toSharp(patternKey.value));
        return [...new Set(source)].sort((a, b) => (a - root + 12) % 12 - (b - root + 12) % 12);
    }

    function transposeSketch() {
        const from = mt.notes.indexOf(mt.toSharp(patternKey.value));
        const to = mt.notes.indexOf(mt.toSharp(transposeKey.value));
        if (from < 0 || to < 0) return;
        const shifted = new Set(sourcePitchClasses().map(note => (note + to - from + 12) % 12));
        const strings = MiniFretboard.TUNINGS[tuningSel.value].strings;
        marks = [];
        strings.forEach((open, s) => {
            for (let fret = 0; fret <= 12; fret++) {
                const pitch = (mt.notes.indexOf(mt.toSharp(open)) + fret) % 12;
                if (shifted.has(pitch)) marks.push({ s, f: fret });
            }
        });
        patternKey.value = transposeKey.value;
        drawSandbox();
        found.textContent = 'Transposed to ' + patternKey.value + '. The board now shows the same notes in the new key.';
    }

    function identifyCurrentKey() {
        const selected = sourcePitchClasses();
        if (selected.length < 3) {
            found.textContent = 'Add at least three different notes to identify a key.';
            updateKeyBtn.hidden = true;
            identifiedKey = null;
            return;
        }
        const candidates = [];
        for (const root of mt.notes) {
            for (const mode of ['major', 'natural_minor']) {
                const scale = mode === 'major' ? mt.getScaleNotes(root, 'major') : mt.getScaleNotes(root, 'natural_minor');
                const pitchSet = new Set(scale.map(note => mt.notes.indexOf(mt.toSharp(note))));
                const matched = selected.filter(note => pitchSet.has(note)).length;
                const rootPitch = mt.notes.indexOf(root);
                candidates.push({ root, mode, matched, score: matched * 3 + (selected.includes(rootPitch) ? 1 : 0) });
            }
        }
        candidates.sort((a, b) => b.score - a.score || b.matched - a.matched || mt.notes.indexOf(a.root) - mt.notes.indexOf(b.root));
        const best = candidates[0];
        if (!best || best.matched / selected.length < 0.7) {
            found.textContent = 'These notes do not strongly match a major or natural minor key.';
            updateKeyBtn.hidden = true;
            identifiedKey = null;
            return;
        }
        const matches = candidates.filter(item => item.score === best.score).slice(0, 4);
        identifiedKey = best.root;
        found.textContent = 'Possible keys: ' + matches.map(item => item.root + (item.mode === 'major' ? ' major' : ' minor')).join(' / ') + ' (' + best.matched + '/' + selected.length + ' notes fit).';
        updateKeyBtn.textContent = 'Use ' + best.root + ' key';
        updateKeyBtn.hidden = false;
    }

    function generateSequences() {
        const notes = sourcePitchClasses().map(note => mt.notes[note]);
        if (notes.length < 2) {
            sequenceResults.textContent = 'Sketch at least two different notes first.';
            return;
        }
        const selectedSize = Math.min(Number(sequenceSize.value) || 3, notes.length);
        sequenceSize.replaceChildren(...Array.from({ length: notes.length }, (_, i) => new Option((i + 2) + ' notes', String(i + 2))).filter((_, i) => i + 2 <= notes.length));
        sequenceSize.value = String(Math.max(2, selectedSize));
        const size = Number(sequenceSize.value);
        const combinations = [];
        function choose(start, group) {
            if (combinations.length >= 25) return;
            if (group.length === size) { combinations.push(group.slice()); return; }
            for (let i = start; i <= notes.length - (size - group.length); i++) {
                group.push(notes[i]);
                choose(i + 1, group);
                group.pop();
                if (combinations.length >= 25) return;
            }
        }
        choose(0, []);
        let sequences = combinations;
        if (sequenceType.value === 'permutation') {
            sequences = [];
            for (const group of combinations) {
                function arrange(remaining, ordered) {
                    if (sequences.length >= 24) return;
                    if (ordered.length === size) { sequences.push(ordered.slice()); return; }
                    remaining.forEach((note, index) => {
                        if (sequences.length >= 24) return;
                        arrange(remaining.filter((_, i) => i !== index), [...ordered, note]);
                    });
                }
                arrange(group, []);
                if (sequences.length >= 24) break;
            }
        }
        sequenceResults.replaceChildren();
        sequences.slice(0, 24).forEach(sequence => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = sequence.join(' - ');
            button.title = 'Hear this sequence and add it to your note';
            button.addEventListener('click', () => {
                const line = 'Sequence: ' + sequence.join(' - ');
                text.value += (text.value.trim() ? '\n' : '') + line;
                MiniFretboard.play({ notes: sequence }, 'arpeggio');
            });
            sequenceResults.appendChild(button);
        });
        if (sequences.length >= 24) {
            const note = document.createElement('span');
            note.className = 'idea-tool-label';
            note.textContent = 'Showing first 24. Narrow the note count to see fewer possibilities.';
            sequenceResults.appendChild(note);
        }
    }

    function identify() {
        if (!mt || !marks.length) { found.textContent = 'Click a fret to sketch, or choose a pattern to populate the board.'; return; }
        const set = pcs();
        const names = set.map(p => mt.notes[p]);
        const sig = (root, ivs) => ivs.map(iv => (root + mt.getIntervalSemitones(iv) + 120) % 12).sort((a, b) => a - b).join(',');
        const mine = set.slice().sort((a, b) => a - b).join(',');
        const hits = [];
        for (const root of set) {
            for (const [id, c] of Object.entries(mt.chords)) {
                if (sig(root, c.intervals) === mine) hits.push(mt.notes[root] + ' ' + c.name);
                if (hits.length >= 4) break;
            }
            if (hits.length >= 4) break;
            for (const [id, scale] of Object.entries(mt.scales)) {
                if (sig(root, scale.intervals) === mine) hits.push(mt.notes[root] + ' ' + scale.name);
                if (hits.length >= 4) break;
            }
            if (hits.length >= 4) break;
        }
        found.textContent = 'Notes: ' + names.join(' ') + (hits.length ? '  →  ' + hits.join(', ') : '');
    }

    function drawSandbox() {
        identifiedKey = null;
        updateKeyBtn.hidden = true;
        MiniFretboard.render(fbHost, { tuning: tuningSel.value, marks, onFret: (s, f) => {
            const i = marks.findIndex(m => m.s === s && m.f === f);
            if (i === -1) marks.push({ s, f }); else marks.splice(i, 1);
            drawSandbox();
        } });
        identify();
    }

    function populateBoard() {
        const notes = patternNotes();
        if (!notes.length) {
            found.textContent = patternType.value === 'interval' ? 'Select at least one interval to populate the board.' : 'This pattern has no playable notes.';
            return;
        }
        const pitches = new Set(notes.map(n => mt.notes.indexOf(mt.toSharp(n))).filter(n => n >= 0));
        const strings = MiniFretboard.TUNINGS[tuningSel.value].strings;
        marks = [];
        strings.forEach((open, s) => {
            for (let f = 0; f <= 12; f++) {
                if (pitches.has((mt.notes.indexOf(mt.toSharp(open)) + f) % 12)) marks.push({ s, f });
            }
        });
        drawSandbox();
        const patternLabel = patternType.value === 'interval'
            ? [...intervalOptions.querySelectorAll('input:checked')].map(input => mt.intervals[input.value].name).join(', ')
            : patternSelect.options[patternSelect.selectedIndex]?.text || 'Pattern';
        found.textContent = patternLabel + ' in ' + patternKey.value + ' - ' + notes.join(' ');
    }

    renderIntervalChoices();
    fillPatterns();
    for (let count = 2; count <= 12; count++) sequenceSize.add(new Option(count + ' notes', String(count)));
    sequenceSize.value = '3';
    patternType.addEventListener('change', fillPatterns);
    intervalOptions.addEventListener('change', event => {
        const checkbox = event.target.closest('input[type="checkbox"]');
        if (!checkbox) return;
        if (checkbox.checked) selectedIntervals.add(checkbox.value);
        else selectedIntervals.delete(checkbox.value);
        const notes = patternNotes();
        found.textContent = notes.length ? 'Selected intervals in ' + patternKey.value + ': ' + notes.join(' ') : 'Select at least one interval to populate the board.';
    });
    patternKey.addEventListener('change', () => { transposeKey.value = patternKey.value; });
    document.getElementById('idea-populate').addEventListener('click', populateBoard);
    document.getElementById('idea-transpose').addEventListener('click', transposeSketch);
    identifyKeyBtn.addEventListener('click', identifyCurrentKey);
    updateKeyBtn.addEventListener('click', () => {
        if (!identifiedKey) return;
        patternKey.value = identifiedKey;
        transposeKey.value = identifiedKey;
        found.textContent = 'Current key updated to ' + identifiedKey + '. The sketch has not been changed.';
        updateKeyBtn.hidden = true;
        identifiedKey = null;
    });
    document.getElementById('idea-generate-sequences').addEventListener('click', generateSequences);
    tuningSel.addEventListener('change', drawSandbox);
    document.getElementById('idea-clear-marks').addEventListener('click', () => { marks = []; drawSandbox(); });
    document.getElementById('idea-hear').addEventListener('click', () => {
        const strings = MiniFretboard.TUNINGS[tuningSel.value].strings;
        const sorted = marks.slice().sort((a, b) => (a.s * 5 + a.f) - (b.s * 5 + b.f));
        const notes = sorted.length
            ? sorted.map(mark => mt.notes[(mt.notes.indexOf(strings[mark.s]) + mark.f) % 12])
            : patternNotes();
        if (!notes.length) { found.textContent = 'Select an interval or mark notes before playing.'; return; }
        MiniFretboard.play({ notes }, 'chord');
    });
    document.getElementById('idea-hear-arpeggiated').addEventListener('click', () => {
        const key = patternKey.value, root = mt.notes.indexOf(mt.toSharp(key));
        const source = marks.length ? pcs().map(n => mt.notes[n]) : patternNotes();
        const ordered = [...new Set(source.map(n => mt.notes.indexOf(mt.toSharp(n))).filter(n => n >= 0))]
            .sort((a, b) => (a - root + 12) % 12 - (b - root + 12) % 12)
            .map(n => mt.notes[n]);
        MiniFretboard.play({ notes: ordered }, 'arpeggio');
    });
    const load = () => {
        const value = ST.getJSON(KEY, []);
        return Array.isArray(value) ? value.filter(item => item && typeof item === 'object' && typeof item.id === 'string' && item.id && typeof item.text === 'string') : [];
    };
    const save = (value) => ST.setJSON(KEY, value);
    const favoriteId = new URLSearchParams(location.search).get('favorite');
    const favoriteSnapshot = favoriteId && window.ST && ST.favorites && ST.favorites.list().find(item => item.type === 'idea-note' && item.id === favoriteId);
    const favoriteDraft = (favoriteId && load().find(idea => idea.id === favoriteId)) ||
        (favoriteSnapshot && favoriteSnapshot.data && typeof favoriteSnapshot.data.text === 'string'
            ? { id: favoriteId, text: favoriteSnapshot.data.text, diagram: favoriteSnapshot.data.diagram || null }
            : null);
    if (favoriteDraft) {
        editing = favoriteDraft.id;
        text.value = favoriteDraft.text;
        const tuningKey = favoriteDraft.diagram && favoriteDraft.diagram.tuning;
        tuningSel.value = Object.prototype.hasOwnProperty.call(MiniFretboard.TUNINGS, tuningKey) ? tuningKey : 'guitar';
        const stringCount = MiniFretboard.TUNINGS[tuningSel.value].strings.length;
        marks = favoriteDraft.diagram && Array.isArray(favoriteDraft.diagram.marks)
            ? favoriteDraft.diagram.marks.filter(mark => mark && Number.isInteger(mark.s) && mark.s >= 0 && mark.s < stringCount && Number.isInteger(mark.f) && mark.f >= 0 && mark.f <= 12).map(mark => ({ s: mark.s, f: mark.f }))
            : [];
        drawSandbox();
        form.querySelector('button[type="submit"]').textContent = 'Save';
        history.replaceState(null, '', location.pathname);
    }
    const draft = !favoriteDraft && new URLSearchParams(location.search).get('draft');
    if (draft) {
        text.value = draft;
        text.focus();
        text.setSelectionRange(draft.length, draft.length);
        history.replaceState(null, '', location.pathname);
    }
    drawSandbox();

    const MIDI_OPEN = {
        guitar: [40, 45, 50, 55, 59, 64],
        bass: [28, 33, 38, 43],
        ukulele: [67, 60, 64, 69],
        dropd: [38, 45, 50, 55, 59, 64]
    };

    function ideaPitches(idea) {
        const diagram = idea.diagram;
        const opens = diagram && MIDI_OPEN[diagram.tuning || 'guitar'];
        if (!opens || !Array.isArray(diagram.marks)) return [];
        return [...new Set(diagram.marks.filter(mark => mark && Number.isInteger(mark.s) && Number.isInteger(mark.f) && mark.s >= 0 && mark.s < opens.length && mark.f >= 0 && mark.f <= 36)
            .map(mark => opens[mark.s] + mark.f).filter(pitch => pitch >= 0 && pitch <= 127))].sort((a, b) => a - b);
    }

    function makeMidi(ideas) {
        const events = [{ tick: 0, order: -1, bytes: [0xff, 0x51, 0x03, 0x07, 0xa1, 0x20] }];
        let cursor = 0;
        let exported = 0;
        ideas.forEach(idea => {
            const pitches = ideaPitches(idea);
            if (!pitches.length) return;
            pitches.forEach(pitch => {
                events.push({ tick: cursor, order: 1, bytes: [0x90, pitch, 88] });
                events.push({ tick: cursor + 960, order: 0, bytes: [0x80, pitch, 0] });
            });
            cursor += 1200;
            exported++;
        });
        if (!exported) return null;
        events.sort((a, b) => a.tick - b.tick || a.order - b.order);
        const track = [];
        let previousTick = 0;
        const variableLength = value => {
            let buffer = value & 0x7f;
            const bytes = [];
            while ((value >>= 7)) { buffer <<= 8; buffer |= (value & 0x7f) | 0x80; }
            while (true) { bytes.push(buffer & 0xff); if (buffer & 0x80) buffer >>= 8; else break; }
            return bytes;
        };
        events.forEach(event => {
            track.push(...variableLength(event.tick - previousTick), ...event.bytes);
            previousTick = event.tick;
        });
        track.push(0x00, 0xff, 0x2f, 0x00);
        const u32 = value => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
        const ascii = value => Array.from(value, character => character.charCodeAt(0));
        return new Blob([new Uint8Array([
            ...ascii('MThd'), 0, 0, 0, 6, 0, 0, 0, 1, 1, 224,
            ...ascii('MTrk'), ...u32(track.length), ...track
        ])], { type: 'audio/midi' });
    }

    function makePdf(ideas) {
        const asciiText = value => String(value || '').replace(/\r\n?/g, '\n').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e\n]/g, '?');
        const wrapped = value => asciiText(value).split('\n').flatMap(paragraph => {
            if (!paragraph) return [''];
            const lines = [];
            let line = '';
            paragraph.split(/\s+/).forEach(word => {
                while (word.length > 94) {
                    if (line) { lines.push(line); line = ''; }
                    lines.push(word.slice(0, 94));
                    word = word.slice(94);
                }
                if (line && (line + ' ' + word).length > 94) { lines.push(line); line = word; }
                else line += (line ? ' ' : '') + word;
            });
            if (line) lines.push(line);
            return lines;
        });
        const lines = ['Ideas & Notes', 'Exported ' + new Date().toLocaleString(), ''];
        ideas.forEach((idea, index) => {
            if (index) lines.push('');
            lines.push('Note ' + (index + 1) + ' - ' + new Date(idea.updated || idea.created || Date.now()).toLocaleString());
            lines.push(...wrapped(idea.text));
            if (idea.diagram) {
                lines.push(...wrapped('[Fretboard diagram: ' + (idea.diagram.notes || idea.diagram.tuning || 'saved shape') + ']'));
                if (Array.isArray(idea.diagram.marks)) lines.push('Marked positions: ' + idea.diagram.marks.map(mark => 'string ' + (mark.s + 1) + ', fret ' + mark.f).join('; '));
            }
            lines.push('------------------------------------------------------------');
        });
        const pages = [];
        for (let i = 0; i < lines.length; i += 49) pages.push(lines.slice(i, i + 49));
        const objects = [];
        let nextId = 4;
        const pageIds = pages.map(() => nextId++);
        const contentIds = pages.map(() => nextId++);
        objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        objects[2] = '<< /Type /Pages /Kids [' + pageIds.map(id => id + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>';
        objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
        pages.forEach((page, index) => {
            objects[pageIds[index]] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' + contentIds[index] + ' 0 R >>';
            const stream = 'BT\n/F1 10 Tf\n48 790 Td\n14 TL\n' + page.map(line => '(' + line.replace(/[\\()]/g, '\\$&') + ') Tj T*').join('\n') + '\nET\n';
            objects[contentIds[index]] = '<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream';
        });
        let pdf = '%PDF-1.4\n';
        const offsets = [0];
        for (let id = 1; id < objects.length; id++) {
            offsets[id] = pdf.length;
            pdf += id + ' 0 obj\n' + objects[id] + '\nendobj\n';
        }
        const xref = pdf.length;
        pdf += 'xref\n0 ' + objects.length + '\n0000000000 65535 f \n';
        for (let id = 1; id < objects.length; id++) pdf += String(offsets[id]).padStart(10, '0') + ' 00000 n \n';
        pdf += 'trailer\n<< /Size ' + objects.length + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
        return new Blob([pdf], { type: 'application/pdf' });
    }

    function render() {
        const ideas = load();
        list.innerHTML = '';
        exportBtn.hidden = !ideas.length;
        exportPdfBtn.hidden = !ideas.length;
        exportMidiBtn.hidden = !ideas.length;
        exportMidiBtn.disabled = !ideas.some(idea => ideaPitches(idea).length);
        if (!ideas.length) { list.innerHTML = '<p class="idea-empty">No notes yet.</p>'; return; }
        ideas.slice().reverse().forEach(it => {
            const li = document.createElement('li');
            li.className = 'idea';
            const body = document.createElement('div');
            body.className = 'idea-body';
            body.textContent = it.text;
            const meta = document.createElement('div');
            meta.className = 'idea-meta';
            meta.textContent = new Date(it.updated || it.created).toLocaleString();
            const favorite = document.createElement('button');
            favorite.type = 'button';
            favorite.className = 'idea-favorite';
            const syncFavorite = () => {
                const saved = !!(window.ST && ST.favorites && ST.favorites.has('idea-note', it.id));
                favorite.textContent = saved ? '★' : '☆';
                favorite.setAttribute('aria-pressed', String(saved));
                favorite.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + (it.text.trim().slice(0, 80) || 'fretboard idea') + (saved ? ' from Favorites' : ' to Favorites'));
                favorite.title = favorite.getAttribute('aria-label');
            };
            favorite.addEventListener('click', event => {
                event.stopPropagation();
                if (!window.ST || !ST.favorites) return;
                const record = {
                    type: 'idea-note', id: it.id, title: it.text.trim().slice(0, 120) || 'Fretboard idea',
                    href: 'coursesideas.html?favorite=' + encodeURIComponent(it.id),
                    data: { text: it.text, diagram: it.diagram || null }
                };
                const result = ST.favorites.toggle(record);
                if (!result.ok) exportStatus.textContent = 'Could not update Favorites. Check browser storage.';
                else exportStatus.textContent = result.saved ? 'Note saved to Favorites.' : 'Note removed from Favorites.';
                syncFavorite();
            });
            syncFavorite();
            const edit = document.createElement('button');
            edit.type = 'button'; edit.textContent = 'Edit';
            edit.addEventListener('click', () => {
                editing = it.id;
                text.value = it.text;
                if (it.diagram && typeof it.diagram === 'object') tuningSel.value = it.diagram.tuning || 'guitar';
                marks = it.diagram && Array.isArray(it.diagram.marks) ? it.diagram.marks.filter(m => m && Number.isInteger(m.s) && Number.isInteger(m.f)).map(m => ({ s: m.s, f: m.f })) : [];
                drawSandbox();
                text.focus();
                form.querySelector('button[type="submit"]').textContent = 'Save';
            });
            const del = document.createElement('button');
            del.type = 'button'; del.textContent = 'Delete';
            del.addEventListener('click', () => {
                if (!save(load().filter(x => x.id !== it.id))) { exportStatus.textContent = 'Storage is unavailable; this note could not be deleted.'; return; }
                const favoriteRemoved = !(window.ST && ST.favorites && ST.favorites.has('idea-note', it.id)) || ST.favorites.remove('idea-note', it.id);
                if (editing === it.id) { reset(); marks = []; drawSandbox(); }
                exportStatus.textContent = favoriteRemoved ? 'Note deleted from this device.' : 'Note deleted, but its Favorite snapshot remains in the Favorites list.';
                render();
            });
            meta.append(edit, favorite, del);
            li.append(body);
            if (it.diagram && it.diagram.marks && it.diagram.marks.length) {
                const d = document.createElement('div');
                d.className = 'idea-diagram';
                MiniFretboard.render(d, { tuning: it.diagram.tuning || 'guitar', marks: it.diagram.marks });
                d.title = 'Load into the sandbox';
                d.addEventListener('click', () => { tuningSel.value = it.diagram.tuning || 'guitar'; marks = it.diagram.marks.map(m => ({ s: m.s, f: m.f })); drawSandbox(); fbHost.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
                li.append(d);
            }
            li.append(meta);
            list.appendChild(li);
        });
    }
    function reset() { editing = null; text.value = ''; form.querySelector('button[type="submit"]').textContent = 'Add note'; }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const t = text.value.trim();
        if (!t && !marks.length) return;
        const diagram = marks.length ? { tuning: tuningSel.value, marks: marks.map(m => ({ s: m.s, f: m.f })), notes: found.textContent } : null;
        const ideas = load();
        const editedId = editing;
        if (editing) {
            const it = ideas.find(x => x.id === editing);
            if (it) { it.text = t; it.diagram = diagram; it.updated = Date.now(); }
            else ideas.push({ id: editing, text: t, diagram, created: Date.now() });
        } else {
            ideas.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: t, diagram, created: Date.now() });
        }
        if (!save(ideas)) {
            exportStatus.textContent = 'Storage is unavailable. Your draft is still in the editor; copy it before leaving this page.';
            return;
        }
        let favoriteRefreshFailed = false;
        if (editedId && window.ST && ST.favorites && ST.favorites.has('idea-note', editedId)) {
            const updated = ideas.find(idea => idea.id === editedId);
            const record = { type: 'idea-note', id: updated.id, title: updated.text.trim().slice(0, 120) || 'Fretboard idea', href: 'coursesideas.html?favorite=' + encodeURIComponent(updated.id), data: { text: updated.text, diagram: updated.diagram || null } };
            const favorites = ST.favorites.list();
            const next = favorites.map(item => item.type === 'idea-note' && item.id === editedId ? Object.assign(record, { updated: Date.now() }) : item);
            favoriteRefreshFailed = !ST.favorites.replace(next);
        }
        exportStatus.textContent = favoriteRefreshFailed
            ? 'Note saved, but its Favorite could not be refreshed. Re-star it from the saved list.'
            : 'Saved on this device.';
        reset(); marks = []; drawSandbox(); render();
    });
    text.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) form.requestSubmit(); });
    exportBtn.addEventListener('click', () => {
        const out = load().map(it => new Date(it.created).toLocaleString() + '\n' + it.text + (it.diagram && it.diagram.notes ? '\n[Diagram] ' + it.diagram.notes : '')).join('\n\n---\n\n');
        ST.download(new Blob([out], { type: 'text/plain' }), 'scales-thesaurus-notes.txt');
    });
    exportPdfBtn.addEventListener('click', () => {
        const ideas = load();
        if (!ideas.length) { exportStatus.textContent = 'There are no notes to export.'; return; }
        ST.download(makePdf(ideas), 'scales-thesaurus-ideas.pdf');
        exportStatus.textContent = 'Exported ' + ideas.length + (ideas.length === 1 ? ' note as PDF.' : ' notes as PDF.');
    });
    window.addEventListener('storage', event => {
        if (event.key === 'st_favorites_v1' || event.key === null) render();
    });
    window.addEventListener('pageshow', render);
    exportMidiBtn.addEventListener('click', () => {
        const ideas = load();
        const eligible = ideas.filter(idea => ideaPitches(idea).length);
        const file = makeMidi(ideas);
        if (!file) { exportStatus.textContent = 'Add a fretboard diagram with marked frets before exporting MIDI.'; return; }
        ST.download(file, 'scales-thesaurus-ideas.mid');
        exportStatus.textContent = 'Exported ' + eligible.length + ' diagram' + (eligible.length === 1 ? '' : 's') + ' as a MIDI chord sequence.';
        if (eligible.length < ideas.length) exportStatus.textContent += ' Notes without a playable diagram were skipped.';
    });
    render();
});
