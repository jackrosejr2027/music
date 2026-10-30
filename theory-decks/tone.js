(function (TD) {
'use strict';
// Exact equal-tempered pitches (A4 = 440 Hz), synthesised locally — no audio files, works offline.
// The timbre adds soft overtones (2nd–5th harmonics) to the fundamental so low notes are audible on
// small speakers; the pitch heard is still exactly the fundamental frequency.
let ctx = null;
let master = null;
let wave = null;
let active = [];
let loopTimer = null;

const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// iPhone / iPad: Web Audio is treated as "ambient" sound and the hardware silent switch mutes it.
// Two fixes, both local (no files): ask for the "playback" audio session (Safari 16.4+), and for older
// iOS keep a silent, looping HTML <audio> element playing — media playback moves the page into the
// playback category, which the silent switch does not mute.
let unmuter = null;
function silentWav() {
  const rate = 8000, n = 4000; // half a second of 8-bit silence
  const bytes = new Uint8Array(44 + n);
  const v = new DataView(bytes.buffer);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, n, true);
  bytes.fill(128, 44);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return 'data:audio/wav;base64,' + btoa(bin);
}
function unmuteIOS() {
  try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch { /* not supported */ }
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!ios || navigator.audioSession || typeof Audio === 'undefined') return;
  if (!unmuter) {
    unmuter = new Audio(silentWav());
    unmuter.loop = true;
    unmuter.setAttribute('playsinline', '');
    unmuter.setAttribute('x-webkit-airplay', 'deny');
    unmuter.preload = 'auto';
    // Restart when the page comes back (iOS pauses media in the background)
    document.addEventListener('visibilitychange', () => { if (!document.hidden && unmuter.paused && ctx && ctx.currentTime < lastEnd) unmuter.play().catch(() => {}); });
  }
  if (unmuter.paused) unmuter.play().catch(() => {});
  idleCheck();
}
// The silent stream runs only while sound is in use: it pauses 4 s after the last note ends, and at once when
// the page is hidden or closed, so it never keeps the media session (or the battery) busy in between
let idleTimer = null, lastEnd = 0;
function idleCheck() {
  if (!unmuter) return;
  clearTimeout(idleTimer);
  const wait = ctx ? Math.max(0, lastEnd - ctx.currentTime) * 1000 + 4000 : 4000;
  idleTimer = setTimeout(() => { if (ctx && ctx.currentTime < lastEnd) { idleCheck(); return; } if (unmuter && !unmuter.paused) unmuter.pause(); }, wait);
}
if (typeof document !== 'undefined') {
  const quiet = () => { if (unmuter && !unmuter.paused) unmuter.pause(); };
  window.addEventListener('pagehide', quiet);
  document.addEventListener('visibilitychange', () => { if (document.hidden && !(ctx && ctx.currentTime < lastEnd)) quiet(); });
}

function audio() {
  unmuteIOS();
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    // Gentle limiter so chords never clip
    master = ctx.createDynamicsCompressor();
    master.threshold.value = -12;
    master.ratio.value = 4;
    master.connect(ctx.destination);
    try {
      const real = new Float32Array([0, 1, 0.42, 0.2, 0.1, 0.05]);
      wave = ctx.createPeriodicWave(real, new Float32Array(real.length));
    } catch { wave = null; }
  }
  if (ctx.state !== 'running' && ctx.resume) ctx.resume().catch(() => {});
  return ctx;
}

function stopAll() {
  clearTimeout(loopTimer);
  loopTimer = null;
  if (!ctx) return;
  const now = ctx.currentTime;
  lastEnd = Math.min(lastEnd, now + 0.05); // nothing is sounding any more: the iOS silent stream may pause on time
  idleCheck();
  active.forEach(({ osc, gain }) => {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.03);
      osc.stop(now + 0.05);
    } catch { /* already stopped */ }
  });
  active = [];
}

// Voices for the DAW (all synthesised): warm (the default card tone), bright, organ, and pluck (fast decay)
const VOICES = { warm: [0, 1, 0.42, 0.2, 0.1, 0.05], bright: [0, 1, 0.6, 0.45, 0.35, 0.25, 0.18, 0.12], organ: [0, 1, 0.8, 0, 0.5, 0, 0.3, 0, 0.2], pluck: [0, 1, 0.5, 0.3, 0.2, 0.1, 0.05] };
const waves = {};
function waveFor(voice) {
  if (!voice || voice === 'warm' || !VOICES[voice]) return wave;
  if (!(voice in waves)) {
    try { const real = new Float32Array(VOICES[voice]); waves[voice] = ctx.createPeriodicWave(real, new Float32Array(real.length)); } catch { waves[voice] = wave; }
  }
  return waves[voice];
}
// Low notes (below about G2) on phone and laptop speakers: those speakers cannot reproduce the fundamental,
// so low notes get stronger 2nd–4th harmonics (the ear still hears the fundamental's pitch — the "missing
// fundamental") and a loudness lift that grows toward F♯1. The pitch stays exactly the fundamental.
let lowWave = null;
function lowFor(freq, voice) {
  if (freq >= 100 || (voice && voice !== 'warm' && voice !== 'pluck')) return null;
  if (!lowWave) { try { const real = new Float32Array([0, 1, 1.1, 0.9, 0.6, 0.35, 0.2, 0.1]); lowWave = ctx.createPeriodicWave(real, new Float32Array(real.length)); } catch { lowWave = false; } }
  return lowWave || null;
}
const lowLift = (freq) => freq >= 100 ? 1 : 1 + Math.min(1, (100 - freq) / 60) * 0.9; // up to ×1.9 at 40 Hz and below
function tone(freq, start, length, level, voice) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const w = lowFor(freq, voice) || waveFor(voice);
  level *= lowLift(freq);
  lastEnd = Math.max(lastEnd, start + length);
  if (w) osc.setPeriodicWave(w); else osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);
  const release = Math.min(0.25, length * 0.4);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(level, start + 0.012);
  if (voice === 'pluck') {
    // plucked-string decay: fast drop, then a soft tail
    gain.gain.linearRampToValueAtTime(level * 0.35, start + Math.min(0.18, length * 0.5));
    gain.gain.linearRampToValueAtTime(level * 0.2, start + Math.max(0.02, length - release));
  } else gain.gain.setValueAtTime(level, start + Math.max(0.013, length - release));
  gain.gain.linearRampToValueAtTime(0, start + length);
  // Separate connect calls: older Safari's connect() does not return the destination node
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + length + 0.02);
  const entry = { osc, gain };
  active.push(entry);
  osc.onended = () => { active = active.filter(item => item !== entry); };
}

// ---------- drums (synthesised: a pitched-down sine kick, noise snare and hi-hat) ----------
let noise = null;
function noiseBuffer() {
  if (!noise) {
    noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = noise.getChannelData(0);
    let seed = 7; // fixed seed: the same noise every time
    for (let i = 0; i < d.length; i++) { seed = (seed * 16807) % 2147483647; d[i] = seed / 1073741823.5 - 1; }
  }
  return noise;
}
function drumAt(kind, start, level = 0.3) {
  if (!audio() || !Number.isFinite(start)) return;
  start = Math.max(start, ctx.currentTime + 0.005);
  const gain = ctx.createGain();
  gain.connect(master);
  const hold = (node, len) => { const entry = { osc: node, gain }; active.push(entry); node.onended = () => { active = active.filter(x => x !== entry); }; node.start(start); node.stop(start + len); lastEnd = Math.max(lastEnd, start + len); };
  if (kind === 'kick') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, start);
    osc.frequency.exponentialRampToValueAtTime(48, start + 0.12);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(level * 1.6, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain); hold(osc, 0.36);
    return;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = kind === 'hat' ? 'highpass' : 'bandpass';
  filter.frequency.value = kind === 'hat' ? 7000 : 1800;
  const len = kind === 'hat' ? 0.05 : 0.18;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(level * (kind === 'hat' ? 0.5 : 1.2), start + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, start + len);
  src.connect(filter); filter.connect(gain); hold(src, len + 0.01);
  if (kind === 'snare') { // the drum's body under the noise
    const body = ctx.createOscillator(), bg = ctx.createGain();
    body.type = 'triangle'; body.frequency.setValueAtTime(190, start);
    bg.gain.setValueAtTime(level * 0.6, start); bg.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
    body.connect(bg); bg.connect(master);
    const entry = { osc: body, gain: bg }; active.push(entry); body.onended = () => { active = active.filter(x => x !== entry); };
    body.start(start); body.stop(start + 0.11);
  }
}

// Start slightly ahead so a context that is still waking up does not swallow the first note
const startTime = () => ctx.currentTime + (ctx.state === 'running' ? 0.03 : 0.12);

function playFreq(freq, seconds = 1.6) {
  if (!audio()) return;
  stopAll();
  tone(freq, startTime(), seconds, 0.3);
}

// events: array of chords, each an array of MIDI note numbers.
// 'together': every distinct note of each chord sounds at once; 'arpeggio': each note individually, in written order.
function playEvents(events, mode, loop = false) {
  if (!audio() || !events || !events.length) return;
  stopAll();
  let t = startTime();
  const startedAt = t;
  let endAt = t;
  const progression = events.length > 1;
  events.forEach(notes => {
    if (mode === 'together') {
      const unique = [...new Set(notes)];
      const length = progression ? 0.95 : 1.8;
      const level = 0.3 / Math.sqrt(unique.length);
      unique.forEach(m => tone(midiToFreq(m), t, length, level));
      endAt = Math.max(endAt, t + length);
      t += length + (progression ? 0.05 : 0);
    } else {
      const step = progression ? 0.2 : notes.length > 10 ? 0.2 : 0.32;
      notes.forEach(m => {
        tone(midiToFreq(m), t, step * 1.6, 0.26);
        endAt = Math.max(endAt, t + step * 1.6);
        t += step;
      });
      if (progression) t += 0.15;
    }
  });
  if (loop) loopTimer = setTimeout(() => {
    loopTimer = null;
    playEvents(events, mode, true);
  }, Math.max(50, (endAt - startedAt + 0.04) * 1000));
}

// For the DAW: the audio clock, and one note at an exact time (seconds on that clock)
const now = () => (audio() ? ctx.currentTime : 0);
function noteAt(midi, start, length, level = 0.22, voice) {
  if (!Number.isFinite(midi) || !Number.isFinite(start) || !audio()) return; // a damaged song file must not throw mid-playback
  tone(midiToFreq(midi), Math.max(start, ctx.currentTime + 0.005), Math.max(0.03, length), level, voice);
}

TD['tone.js'] = { playFreq, playEvents, stopAll, midiToFreq, now, noteAt, drumAt, unmuteIOS };
})(window.TD = window.TD || {});
