/**
 * Practice Room drill (v1.0): random key + pattern with an interactive fretboard,
 * a metronome and a session timer. Completed sessions add to Progress practice time.
 */
document.addEventListener('DOMContentLoaded', () => {
    const POOL = [['scale', 'major'], ['scale', 'natural_minor'], ['scale', 'pentatonic_minor'], ['scale', 'pentatonic_major'], ['scale', 'blues'], ['scale', 'dorian'],
        ['scale', 'mixolydian'], ['scale', 'harmonic_minor'], ['scale', 'lydian'], ['scale', 'phrygian'], ['chord', 'major7'], ['chord', 'minor7'], ['chord', 'dominant7'], ['chord', 'half_diminished']];
    const KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const mt = new MusicTheory();
    const $ = id => document.getElementById(id);
    let w = null, ctx = null, metro = null, metroStarting = false, beat = 0, t0 = 0, clock = null;
    function drill() {
        const [type, id] = POOL[Math.floor(Math.random() * POOL.length)], key = KEYS[Math.floor(Math.random() * 12)];
        const name = (type === 'scale' ? mt.scales[id] : mt.chords[id]).name;
        $('pd-title').textContent = key + ' ' + name;
        const o = { key, type, id, caption: key + ' ' + name };
        if (!w) w = MiniFretboard.widget($('pd-fb'), o); else w.update(o);
    }
    function click() {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
        o.frequency.value = beat % 4 === 0 ? 1500 : 1000;
        g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.06); beat++;
    }
    async function toggleMetro() {
        const button = $('pd-metro');
        if (metro) {
            clearInterval(metro); metro = null; button.textContent = '♩ Metronome';
            return;
        }
        if (metroStarting) return;
        metroStarting = true;
        button.disabled = true;
        button.textContent = 'Starting...';
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) throw new Error('Web Audio is not supported.');
            ctx = ctx || new AudioContextClass();
            if (ctx.state !== 'running') await ctx.resume();
            if (ctx.state !== 'running') throw new Error('Audio is still unavailable.');
            const bpm = Math.max(30, Math.min(260, parseInt($('pd-bpm').value, 10) || 80));
            $('pd-bpm').value = String(bpm);
            beat = 0; click(); metro = setInterval(click, 60000 / bpm);
            button.textContent = '■ Stop';
        } catch (error) {
            console.warn('Practice metronome failed:', error);
            if (window.ST && ST.toast) ST.toast('Metronome audio is unavailable. Check browser audio settings.');
            button.textContent = '♩ Metronome';
        } finally {
            metroStarting = false;
            button.disabled = false;
        }
    }
    function toggleTimer() {
        if (clock) {
            clearInterval(clock); clock = null; $('pd-timer').textContent = '⏱ Start session';
            ST.recordView('practice', ST.today() + '-' + Date.now());
            ST.toast('Practice session: ' + $('pd-time').textContent);
            return;
        }
        t0 = Date.now();
        clock = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('pd-time').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 500);
        $('pd-timer').textContent = '■ End session';
    }
    $('pd-new').addEventListener('click', drill);
    $('pd-metro').addEventListener('click', toggleMetro);
    $('pd-bpm').addEventListener('change', () => {
        if (!metro) return;
        clearInterval(metro); metro = null;
        toggleMetro();
    });
    $('pd-timer').addEventListener('click', toggleTimer);
    drill();
});
