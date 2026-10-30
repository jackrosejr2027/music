(function () {
    'use strict';

    const PPQ = 480;

    function variableLength(value) {
        const bytes = [value & 0x7f];
        while (value > 127) {
            value = Math.floor(value / 128);
            bytes.unshift((value & 0x7f) | 0x80);
        }
        return bytes;
    }

    function chunk(id, data) {
        const size = data.length;
        return [...id].map(char => char.charCodeAt(0)).concat([
            (size >>> 24) & 255, (size >>> 16) & 255, (size >>> 8) & 255, size & 255
        ], data);
    }

    function createMidi(steps, theory, key, bpm, title) {
        if (!Array.isArray(steps) || !steps.length) throw new Error('Add a block before exporting.');
        const tempo = Math.max(40, Math.min(220, Number(bpm) || 100));
        const microseconds = Math.round(60000000 / tempo);
        const titleBytes = Array.from(new TextEncoder().encode(title || 'Untitled pattern'));
        const events = [
            { tick: 0, order: 0, bytes: [0xff, 0x03, ...variableLength(titleBytes.length), ...titleBytes] },
            { tick: 0, order: 1, bytes: [0xff, 0x51, 0x03, (microseconds >>> 16) & 255, (microseconds >>> 8) & 255, microseconds & 255] },
            { tick: 0, order: 2, bytes: [0xff, 0x58, 0x04, 4, 2, 24, 8] },
            { tick: 0, order: 3, bytes: [0xc0, 0] }
        ];
        let elapsed = 0;
        for (const step of steps) {
            const beats = Math.max(1, Math.min(16, Number(step.beats) || 4));
            const blockTicks = beats * PPQ;
            if (step.label) {
                const labelBytes = Array.from(new TextEncoder().encode(step.label));
                events.push({ tick: elapsed, order: 0, bytes: [0xff, 0x06, ...variableLength(labelBytes.length), ...labelBytes] });
            }
            if (step.kind === 'rest') {
                elapsed += blockTicks;
                continue;
            }

            const stepKey = step.key || key;
            const rootIndex = theory.notes.indexOf(theory.toSharp(stepKey));
            if (rootIndex < 0 || !Number.isFinite(Number(step.offset))) throw new Error('Invalid block root.');
            const root = theory.notes[((rootIndex + Number(step.offset)) % 12 + 12) % 12];
            let notes;
            if (Array.isArray(step.notes)) notes = step.notes;
            else if (step.kind === 'chord' && theory.chords[step.item]) notes = theory.getChordNotes(root, step.item);
            else if (step.kind === 'scale' && theory.scales[step.item]) notes = theory.getScaleNotes(root, step.item);
            else if (step.kind === 'interval' && theory.intervals[step.item]) notes = step.item === '1' ? [root] : [root, theory.getNoteFromInterval(root, step.item)];
            if (!notes || !notes.length) throw new Error('A block has no valid notes.');

            let octave = step.kind === 'chord' ? 3 : 4;
            let previous = -Infinity;
            const pitches = notes.map(note => {
                const index = theory.notes.indexOf(theory.toSharp(note));
                if (index < 0) throw new Error('A block has an invalid note.');
                let pitch = (octave + 1) * 12 + index;
                while (pitch <= previous && octave < 7 && !(step.kind === 'interval' && step.item === '1')) {
                    octave++;
                    pitch = (octave + 1) * 12 + index;
                }
                if (pitch > 127) throw new Error('A block exceeds the MIDI note range.');
                previous = pitch;
                return pitch;
            });
            const isMelodic = step.kind === 'scale' || step.kind === 'custom' || step.kind === 'gamut';
            const line = isMelodic && pitches.length > 2 ? pitches.concat(pitches.slice(0, -1).reverse()) : pitches;
            const spacing = blockTicks * 0.88 / Math.max(1, line.length);
            (step.kind === 'chord' ? pitches : line).forEach((pitch, index) => {
                const start = elapsed + (step.kind === 'chord' ? 0 : Math.round(index * spacing));
                const end = start + Math.max(1, Math.round(step.kind === 'chord' ? blockTicks * 0.86 : spacing * 0.72));
                events.push({ tick: start, order: 5, bytes: [0x90, pitch, step.kind === 'chord' ? 76 : 96] });
                events.push({ tick: end, order: 4, bytes: [0x80, pitch, 0] });
            });
            elapsed += blockTicks;
        }
        events.sort((a, b) => a.tick - b.tick || a.order - b.order);
        const track = [];
        let lastTick = 0;
        for (const event of events) {
            track.push(...variableLength(event.tick - lastTick), ...event.bytes);
            lastTick = event.tick;
        }
        track.push(...variableLength(elapsed - lastTick), 0xff, 0x2f, 0);
        return new Uint8Array([
            ...chunk('MThd', [0, 0, 0, 1, PPQ >> 8, PPQ & 255]),
            ...chunk('MTrk', track)
        ]);
    }

    window.STDAWMidi = { createMidi };
})();
