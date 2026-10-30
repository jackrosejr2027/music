/**
 * Melodic Exercise MIDI Export
 * Exports the current exercise, the same exercise in all 12 keys, or one pattern family.
 */
if (typeof App !== 'undefined') {
    const MELODIC_MIDI_PPQ = 480;
    const MELODIC_MIDI_VELOCITY = 100;
    const MELODIC_MIDI_GATE = 0.55;

    const melodicSafeName = value => String(value || 'pattern').normalize('NFKD').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 72) || 'pattern';
    const melodicFileKey = name => melodicSafeName(String(name).replace(/#/g, 'sharp'));

    const melodicVlq = value => {
        const bytes = [value & 0x7f];
        let rest = Math.floor(value / 128);
        while (rest > 0) {
            bytes.unshift((rest & 0x7f) | 0x80);
            rest = Math.floor(rest / 128);
        }
        return bytes;
    };

    /** Format 0 MIDI file: one track, a name and tempo meta event, one note per beat. */
    function buildMelodicMidiBytes(midiNotes, bpm, trackName) {
        const gateTicks = Math.round(MELODIC_MIDI_PPQ * MELODIC_MIDI_GATE);
        const messages = [];
        midiNotes.forEach((note, index) => {
            const start = index * MELODIC_MIDI_PPQ;
            messages.push({ tick: start, order: 1, bytes: [0x90, note, MELODIC_MIDI_VELOCITY] });
            messages.push({ tick: start + gateTicks, order: 0, bytes: [0x80, note, 0] });
        });
        messages.sort((a, b) => a.tick - b.tick || a.order - b.order);

        const track = [];
        const addEvent = (delta, bytes) => track.push(...melodicVlq(delta), ...bytes);
        const name = Array.from(String(trackName || 'Melodic exercise'), ch => {
            const code = ch.charCodeAt(0);
            return code >= 0x20 && code <= 0x7e ? code : 0x3f;
        }).slice(0, 127);
        addEvent(0, [0xff, 0x03, ...melodicVlq(name.length), ...name]);
        const microseconds = Math.round(60000000 / bpm);
        addEvent(0, [0xff, 0x51, 0x03, (microseconds >> 16) & 0xff, (microseconds >> 8) & 0xff, microseconds & 0xff]);
        let last = 0;
        messages.forEach(message => {
            addEvent(message.tick - last, message.bytes);
            last = message.tick;
        });
        addEvent(0, [0xff, 0x2f, 0x00]);

        const length = track.length;
        const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (MELODIC_MIDI_PPQ >> 8) & 0xff, MELODIC_MIDI_PPQ & 0xff];
        const trackHeader = [0x4d, 0x54, 0x72, 0x6b, (length >>> 24) & 0xff, (length >>> 16) & 0xff, (length >>> 8) & 0xff, length & 0xff];
        return new Uint8Array([...header, ...trackHeader, ...track]);
    }

    function downloadMelodicBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.rel = 'noopener';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }

    App.prototype.melodicStatusReporter = function () {
        const status = document.getElementById('melodic-pattern-status');
        return message => { if (status) status.textContent = message; };
    };

    /** Converts events to MIDI numbers (C4 = 60), transposed up by shift semitones. Throws if any note is out of range. */
    App.prototype.melodicMidiNotes = function (events, shift = 0) {
        const theory = this.musicTheory;
        return events.map(event => {
            const semitone = theory.notes.indexOf(theory.toSharp(event.note));
            const midi = (event.octave + 1) * 12 + semitone + shift;
            if (semitone < 0 || midi < 0 || midi > 127) throw new Error('A note falls outside the MIDI range (0-127).');
            return midi;
        });
    };

    /** Pool for a named set of notes, using the same ordering and octave rule as getMelodicPool. */
    App.prototype.melodicPoolFromNames = function (key, names) {
        const theory = this.musicTheory;
        const semitoneOf = name => theory.notes.indexOf(theory.toSharp(name));
        const rootSemitone = Math.max(0, semitoneOf(key));
        const distance = semitone => (semitone - rootSemitone + 12) % 12;
        const sorted = names
            .filter(Boolean)
            .map(name => ({ note: name, semitone: semitoneOf(name) }))
            .filter(entry => entry.semitone >= 0)
            .sort((a, b) => distance(a.semitone) - distance(b.semitone));
        const entries = [];
        const seen = new Set();
        sorted.forEach(entry => {
            if (seen.has(entry.semitone)) return;
            seen.add(entry.semitone);
            entries.push(entry);
        });
        let octave = 0;
        return entries.map((entry, index) => {
            if (index > 0 && entry.semitone <= entries[index - 1].semitone) octave++;
            return { note: entry.note, octave };
        });
    };

    App.prototype.exportMelodicMidi = function () {
        const report = this.melodicStatusReporter();
        try {
            const data = this.readMelodicPatternData();
            const bytes = buildMelodicMidiBytes(this.melodicMidiNotes(data.events), data.bpm, data.label);
            downloadMelodicBlob(new Blob([bytes], { type: 'audio/midi' }), melodicFileKey(data.label) + '.mid');
            report('Exported ' + data.events.length + ' notes at ' + data.bpm + ' BPM to MIDI.');
        } catch (error) {
            report(error.message || 'Could not export this melodic exercise to MIDI.');
        }
    };

    App.prototype.exportMelodicAllKeysZip = async function () {
        const report = this.melodicStatusReporter();
        try {
            if (typeof JSZip === 'undefined') throw new Error('The bundled MIDI or ZIP library is unavailable.');
            const data = this.readMelodicPatternData();
            const theory = this.musicTheory;
            const baseSemitone = Math.max(0, theory.notes.indexOf(theory.toSharp(data.key)));
            const zip = new JSZip();
            const skippedKeys = [];
            let exported = 0;
            theory.notes.forEach((note, index) => {
                const shift = (index - baseSemitone + 12) % 12;
                try {
                    const midi = this.melodicMidiNotes(data.events, shift);
                    zip.file(melodicFileKey(note) + '.mid', buildMelodicMidiBytes(midi, data.bpm, note + ' ' + data.patternLabel));
                    exported++;
                } catch (error) {
                    skippedKeys.push(note);
                }
            });
            if (!exported) throw new Error('This exercise does not fit in the MIDI range in any key.');
            report('Compressing ' + exported + ' key files...');
            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
            downloadMelodicBlob(blob, 'Fretboard-Melodic-All-Keys-MIDI.zip');
            report('Exported ' + exported + ' keys to a ZIP.' + (skippedKeys.length ? ' Skipped ' + skippedKeys.join(', ') + ', which exceed the MIDI range.' : ''));
        } catch (error) {
            report(error.message || 'Could not create the melodic MIDI ZIP.');
        }
    };

    App.prototype.exportMelodicFamilyMidi = function () {
        const report = this.melodicStatusReporter();
        try {
            const theory = this.musicTheory;
            const board = this.diagramBoards?.[0] || this.fretboard;
            const family = board?.currentPatternType;
            const library = { scale: theory.scales, chord: theory.chords, interval: theory.intervals }[family];
            if (!library) throw new Error('Choose a scale, chord, or interval in Diagram 1 first.');
            const key = board.currentKey || 'C';
            const settings = this.readMelodicSettings();
            const midiNotes = [];
            let used = 0;
            Object.keys(library).forEach(id => {
                const names = family === 'scale' ? theory.getScaleNotes(key, id)
                    : family === 'chord' ? theory.getChordNotes(key, id)
                    : [key, theory.getNoteFromInterval(key, id)];
                try {
                    const pool = this.melodicPoolFromNames(key, names);
                    if (!pool.length) return;
                    const events = this.buildMelodicEvents(pool, settings.chain, settings.octaveRange, settings.spanNotes);
                    midiNotes.push(...this.melodicMidiNotes(events));
                    used++;
                } catch (error) {
                    // Pattern has no notes or falls outside the MIDI range; skipped.
                }
            });
            if (!used) throw new Error('There are no supported patterns to export.');
            const bytes = buildMelodicMidiBytes(midiNotes, settings.bpm, key + ' ' + family + ' progressions');
            downloadMelodicBlob(new Blob([bytes], { type: 'audio/midi' }), 'Fretboard-Melodic-' + family + '-' + melodicFileKey(key) + '-combined.mid');
            report('Exported ' + used + ' ' + family + ' patterns in ' + key + ' to one MIDI file.' + (used < Object.keys(library).length ? ' Skipped ' + (Object.keys(library).length - used) + ' without usable notes.' : ''));
        } catch (error) {
            report(error.message || 'Could not export the combined melodic MIDI.');
        }
    };

    App.prototype.exportMelodicFamilyZip = async function () {
        const report = this.melodicStatusReporter();
        try {
            if (typeof JSZip === 'undefined') throw new Error('The bundled MIDI or ZIP library is unavailable.');
            const theory = this.musicTheory;
            const board = this.diagramBoards?.[0] || this.fretboard;
            const family = board?.currentPatternType;
            const library = { scale: theory.scales, chord: theory.chords, interval: theory.intervals }[family];
            if (!library) throw new Error('Choose a scale, chord, or interval in Diagram 1 first.');
            const key = board.currentKey || 'C';
            const settings = this.readMelodicSettings();
            const ids = Object.keys(library);
            const zip = new JSZip();
            let exported = 0;
            let skipped = 0;
            for (let index = 0; index < ids.length; index++) {
                const id = ids[index];
                const name = library[id]?.name || id;
                const names = family === 'scale' ? theory.getScaleNotes(key, id)
                    : family === 'chord' ? theory.getChordNotes(key, id)
                    : [key, theory.getNoteFromInterval(key, id)];
                try {
                    const pool = this.melodicPoolFromNames(key, names);
                    if (!pool.length) throw new Error('No notes.');
                    const events = this.buildMelodicEvents(pool, settings.chain, settings.octaveRange, settings.spanNotes);
                    const bytes = buildMelodicMidiBytes(this.melodicMidiNotes(events), settings.bpm, key + ' ' + name);
                    zip.file(family + '/' + melodicSafeName(id) + '.mid', bytes);
                    exported++;
                } catch (error) {
                    skipped++;
                }
                if ((index + 1) % 40 === 0) {
                    report('Encoding MIDI ' + (index + 1) + ' of ' + ids.length + '...');
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            if (!exported) throw new Error('There are no supported patterns to export.');
            report('Compressing ' + exported + ' MIDI files...');
            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
            downloadMelodicBlob(blob, 'Fretboard-Melodic-' + family + '-' + melodicFileKey(key) + '.zip');
            report('Exported ' + exported + ' ' + family + ' patterns in ' + key + ' to a ZIP.' + (skipped ? ' Skipped ' + skipped + ' with no notes or notes outside the MIDI range.' : ''));
        } catch (error) {
            report(error.message || 'Could not create the melodic MIDI ZIP.');
        }
    };
}
