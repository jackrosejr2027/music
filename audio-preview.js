(function () {
    'use strict';
    let context = null;
    let generation = 0;
    const voices = new Set();

    function stop() {
        generation++;
        if (!context) return;
        const now = context.currentTime;
        voices.forEach(voice => {
            try {
                voice.gain.gain.cancelScheduledValues(now);
                voice.gain.gain.setTargetAtTime(0.0001, now, 0.012);
                voice.oscillator.stop(now + 0.05);
            } catch (error) {}
        });
        voices.clear();
    }

    async function playInterval(semitones, harmonic) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return false;
        const request = generation;
        if (!context) context = new AudioContextClass();
        if (context.state !== 'running') await context.resume();
        if (request !== generation || context.state !== 'running') return false;
        stop();
        const token = ++generation;
        const root = 261.63;
        const top = root * Math.pow(2, (semitones || 0) / 12);
        const start = context.currentTime + 0.04;
        const sequence = harmonic
            ? [{ frequency: root, offset: 0, duration: 1.55 }, { frequency: top, offset: 0, duration: 1.55 }]
            : [{ frequency: root, offset: 0, duration: 0.75 }, { frequency: top, offset: 0.68, duration: 0.95 }];
        sequence.forEach(item => {
            if (token !== generation) return;
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const onset = start + item.offset;
            oscillator.type = 'triangle';
            oscillator.frequency.value = item.frequency;
            gain.gain.setValueAtTime(0.0001, onset);
            gain.gain.exponentialRampToValueAtTime(0.18, onset + 0.018);
            gain.gain.setValueAtTime(0.18, onset + item.duration * 0.6);
            gain.gain.exponentialRampToValueAtTime(0.0001, onset + item.duration);
            oscillator.connect(gain).connect(context.destination);
            const voice = { oscillator, gain };
            voices.add(voice);
            oscillator.onended = () => voices.delete(voice);
            oscillator.start(onset);
            oscillator.stop(onset + item.duration + 0.04);
        });
        return true;
    }

    async function play(notes, theory, kind) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass || !theory || !notes || !notes.length) return false;
        const request = generation;
        if (!context) context = new AudioContextClass();
        if (context.state !== 'running') await context.resume();
        if (request !== generation || context.state !== 'running') return false;
        stop();
        const token = ++generation;
        const chord = kind === 'chord';
        const frequencies = [];
        let octave = chord ? 3 : 4;
        let previous = -Infinity;
        notes.filter(Boolean).forEach(note => {
            let frequency = theory.getNoteFrequency(note, octave);
            if (!frequency) return;
            while (frequency <= previous) {
                octave++;
                frequency = theory.getNoteFrequency(note, octave);
            }
            frequencies.push(frequency);
            previous = frequency;
        });
        if (!frequencies.length || token !== generation) return false;

        const beat = 60 / 96;
        const start = context.currentTime + 0.04;
        const sequence = chord ? frequencies.map(frequency => ({ frequency, offset: 0, duration: beat * 2 })) :
            frequencies.map((frequency, index) => ({ frequency, offset: index * beat, duration: beat * 0.72 }));
        if (!chord && frequencies.length > 2) {
            frequencies.slice(0, -1).reverse().forEach((frequency, index) => {
                sequence.push({ frequency, offset: (frequencies.length + index - 1) * beat, duration: beat * 0.72 });
            });
        }
        sequence.forEach(item => {
            if (token !== generation) return;
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const onset = start + item.offset;
            oscillator.type = 'triangle';
            oscillator.frequency.value = item.frequency;
            gain.gain.setValueAtTime(0.0001, onset);
            gain.gain.exponentialRampToValueAtTime(0.18, onset + 0.018);
            gain.gain.setValueAtTime(0.18, onset + Math.max(0.025, item.duration * 0.55));
            gain.gain.exponentialRampToValueAtTime(0.0001, onset + item.duration);
            oscillator.connect(gain).connect(context.destination);
            const voice = { oscillator, gain };
            voices.add(voice);
            oscillator.onended = () => voices.delete(voice);
            oscillator.start(onset);
            oscillator.stop(onset + item.duration + 0.04);
        });
        return true;
    }


    async function playTheoryItem(kind, key, id, theory, harmonic) {
        if (!theory || !id) return false;
        if (kind === 'interval') {
            const item = theory.intervals && theory.intervals[id];
            return item ? playInterval(item.semitones, !!harmonic) : false;
        }
        if (kind === 'scale') {
            if (!theory.scales || !theory.scales[id]) return false;
            return play(theory.getScaleNotes(key || 'C', id), theory, 'scale');
        }
        if (kind === 'chord') {
            if (!theory.chords || !theory.chords[id]) return false;
            return play(theory.getChordNotes(key || 'C', id), theory, 'chord');
        }
        return false;
    }

    async function playArrangement(steps, theory, bpm) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass || !theory || !Array.isArray(steps) || !steps.length) return false;
        const tempo = Math.max(40, Math.min(220, Number(bpm) || 100));
        const resolved = steps.map(step => {
            const rootIndex = theory.notes.indexOf(theory.toSharp(step.key || 'C'));
            if (rootIndex < 0) return null;
            const root = theory.notes[(rootIndex + (Number(step.offset) || 0) + 12) % 12];
            let notes;
            if (step.kind === 'scale' && theory.scales[step.item]) notes = theory.getScaleNotes(root, step.item);
            else if (step.kind === 'chord' && theory.chords[step.item]) notes = theory.getChordNotes(root, step.item);
            else if (step.kind === 'interval' && theory.intervals[step.item]) notes = step.item === '1' ? [root] : [root, theory.getNoteFromInterval(root, step.item)];
            return notes && notes.length ? { step, root, notes } : null;
        });
        if (resolved.some(item => !item)) return false;
        const request = generation;
        if (!context) context = new AudioContextClass();
        if (context.state !== 'running') await context.resume();
        if (request !== generation || context.state !== 'running') return false;
        stop();
        const token = ++generation;
        const beat = 60 / tempo;
        let elapsedBeats = 0;
        resolved.forEach(({ step, root, notes }) => {
            const blockBeats = Math.max(1, Math.min(16, Number(step.beats) || 4));
            const blockStart = context.currentTime + 0.06 + elapsedBeats * beat;
            const baseOctave = step.kind === 'chord' ? 3 : 4;
            let previousFrequency = -Infinity;
            let octave = baseOctave;
            const ascending = notes.map(note => {
                let frequency = theory.getNoteFrequency(note, octave);
                while (frequency && frequency <= previousFrequency && octave < 7 && !(step.kind === 'interval' && step.item === '1')) {
                    octave++;
                    frequency = theory.getNoteFrequency(note, octave);
                }
                previousFrequency = frequency || previousFrequency;
                return frequency;
            }).filter(Boolean);
            let sequence = [];
            if (step.kind === 'chord') {
                const bass = theory.getNoteFrequency(root, 2);
                if (bass) sequence.push({ frequency: bass, offset: 0, duration: blockBeats * beat * 0.9, bass: true });
                sequence.push(...ascending.map((frequency, index) => ({
                    frequency,
                    offset: index * 0.018,
                    duration: blockBeats * beat * 0.86,
                    bass: false
                })));
            } else {
                const line = step.kind === 'scale' && ascending.length > 2 ? ascending.concat(ascending.slice(0, -1).reverse()) : ascending;
                const spacing = blockBeats * beat * 0.88 / Math.max(1, line.length);
                sequence = line.map((frequency, index) => ({ frequency, offset: index * spacing, duration: spacing * 0.72 }));
            }
            sequence.forEach(event => {
                if (token !== generation) return;
                const frequency = event.frequency;
                if (!frequency) return;
                const oscillator = context.createOscillator();
                const gain = context.createGain();
                const onset = blockStart + event.offset;
                const volume = step.kind === 'chord'
                    ? (event.bass ? 0.12 : 0.11 / Math.sqrt(ascending.length))
                    : 0.14;
                gain.gain.setValueAtTime(0.0001, onset);
                gain.gain.exponentialRampToValueAtTime(volume, onset + (event.bass ? 0.035 : 0.022));
                gain.gain.setValueAtTime(volume, onset + Math.max(0.04, event.duration * 0.58));
                gain.gain.exponentialRampToValueAtTime(0.0001, onset + event.duration);
                oscillator.type = event.bass ? 'sine' : 'triangle';
                oscillator.frequency.value = frequency;
                oscillator.connect(gain).connect(context.destination);
                const voice = { oscillator, gain };
                voices.add(voice);
                oscillator.onended = () => voices.delete(voice);
                oscillator.start(onset);
                oscillator.stop(onset + event.duration + 0.04);
            });
            elapsedBeats += blockBeats;
        });
        return Math.round(elapsedBeats * beat * 1000);
    }

    window.STAudioPreview = { play, playInterval, playTheoryItem, playArrangement, stop };
})();
