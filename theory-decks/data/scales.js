(function (TD) {
'use strict';
TD.lazy('data/scales.js', () => {
const SCALES5 = `1–2–3–5–6|Major Pentatonic
1–2–4–5–♭7|Suspended Pentatonic
1–♭3–4–5–♭7|Minor Pentatonic
1–♭3–4–♭6–♭7|Minor Pentatonic ♭6
1–♭2–4–5–♭7|Phrygian Pentatonic
1–♭3–4–5–6|Minor Pentatonic Major 6
1–2–4–5–6|Mixolydian Pentatonic
1–2–3–5–♭7|Dominant Pentatonic
1–♭3–4–5–6|Dorian Pentatonic
1–♭3–♭5–5–♭7|Blues Pentatonic
1–2–♭3–5–6|Egyptian Pentatonic
1–2–4–5–♭6|Hirajoshi
1–♭2–4–5–♭6|In Sen
1–♭2–4–5–♭7|Kumoi
1–♭2–4–5–6|Iwato
1–♭2–♭3–5–♭6|Pelog
1–♭2–4–♭5–♭7|Ritusen
1–2–3–5–♭6|Major Pentatonic ♭6
1–2–♭3–5–♭7|Minor-Major Pentatonic
1–♭3–4–5–♭6|Minor Pentatonic ♭6
1–♭3–♭5–5–6|Blues Major 6 Pentatonic
1–2–♭3–4–5|Major Blues Pentatonic
1–2–♭3–5–6|Minor Egyptian Pentatonic
1–♭2–3–5–♭7|Phrygian Major Pentatonic
1–♭2–3–5–6|Phrygian Major 6 Pentatonic
1–2–♭3–5–♭6|Dorian ♭6 Pentatonic
1–♭3–4–♯4–♭7|Minor Tritone Pentatonic
1–2–4–♭5–♭7|Tritone Pentatonic
1–♭2–4–♭5–♭7|Iwato Variant
1–♭2–♭3–5–♭7|Japanese Minor Pentatonic
1–♭2–♭3–5–6|Japanese Major Pentatonic
1–2–♭3–4–6|Raga Bhupeshwari Pentatonic
1–2–3–5–♭6|Raga Shuddha Dhanyasi Variant
1–♭3–4–5–6|Raga Hindol Variant
1–2–♭3–5–6|Raga Madhyamavati Variant
1–♭2–4–5–6|Raga Hamsadhwani Variant
1–2–4–5–6|Raga Mohanam
1–♭2–3–5–6|Raga Hamsadhwani Altered
1–♭3–4–♭5–♭7|Blues Minor Pentatonic
1–♭3–♭5–♭6–♭7|Locrian Pentatonic
1–♭2–♭3–♭5–♭7|Locrian Pentatonic ♭2
1–♭2–♭3–5–♭6|Phrygian Pentatonic
1–♭2–4–♭5–6|Altered Japanese Pentatonic
1–2–♭3–4–5|Suspended Blues Pentatonic
1–2–♭3–4–♭7|Dorian Suspended Pentatonic
1–2–3–4–♭7|Lydian Dominant Pentatonic
1–2–3–4–6|Lydian Pentatonic
1–2–3–♭5–6|Lydian ♭5 Pentatonic
1–2–♭3–♭5–6|Dorian ♭5 Pentatonic
1–♭3–4–♭5–6|Dorian Blues Pentatonic
1–♭3–♭4–5–♭7|Minor Pentatonic ♭4
1–♭3–♭4–♭6–♭7|Minor Pentatonic ♭4♭6
1–♭2–4–♭5–6|Phrygian Tritone Pentatonic
1–♭2–♭3–4–♭7|Phrygian Suspended Pentatonic
1–♭2–3–4–♭7|Phrygian Major Suspended Pentatonic
1–2–♭3–4–6|Dorian Pentatonic
1–2–♭3–4–♭6|Dorian ♭6 Pentatonic
1–2–3–4–♭6|Lydian ♭6 Pentatonic
1–♭2–3–4–6|Phrygian Major Pentatonic
1–♭2–3–4–♭7|Phrygian Dominant Pentatonic
1–♭2–3–5–♭6|Phrygian Dominant ♭6 Pentatonic
1–2–3–♭5–♭7|Mixolydian ♭5 Pentatonic
1–2–4–♭5–6|Mixolydian ♭5 Pentatonic
1–2–4–5–6|Mixolydian Pentatonic
1–2–3–5–♭6|Mixolydian ♭6 Pentatonic
1–♭3–4–5–♭7|Aeolian Pentatonic
1–♭3–4–♭5–♭7|Aeolian Blues Pentatonic
1–♭3–4–♭6–6|Minor 6 Pentatonic
1–♭3–5–♭6–♭7|Minor 7 ♭6 Pentatonic
1–♭2–♭3–4–♭7|Minor Phrygian Pentatonic
1–♭2–♭3–5–♭7|Minor Phrygian Pentatonic
1–♭2–♭3–♭5–6|Diminished Pentatonic
1–♭2–♭3–♭5–♭6|Super-Locrian Pentatonic
1–♭2–♭3–♭5–♭7|Half-Whole Diminished Pentatonic
1–♭2–4–♭5–♭6|Japanese Iwato Altered
1–♭2–4–5–♭6|Japanese Hirajoshi Variant
1–2–4–♭5–♭6|Kumoi Variant
1–♭2–3–5–♭6|In Sen Variant
1–2–♭3–5–♭6|Ritusen Variant
1–♭3–♭5–5–6|Blues Major Pentatonic
1–2–♭3–♭5–♭7|Dominant Blues Pentatonic
1–2–♭3–4–♭7|Blues Suspended Pentatonic
1–♭3–4–♭5–6|Minor Blues 6 Pentatonic
1–♭3–♭5–5–♭6|Blues ♭6 Pentatonic
1–2–♭3–5–♭6|Minor Pentatonic ♭6
1–♭2–4–5–♭7|Suspended Phrygian Pentatonic
1–2–4–5–♭6|Suspended ♭6 Pentatonic
1–2–4–♭5–♭7|Suspended Tritone Pentatonic
1–2–3–4–5|Major Suspended Pentatonic
1–2–3–4–♭7|Dominant Suspended Pentatonic
1–2–3–4–6|Lydian Suspended Pentatonic
1–♭2–3–4–5|Phrygian Suspended Pentatonic
1–♭3–4–5–6|Dorian Major 6 Pentatonic
1–♭3–4–5–♭6|Aeolian Pentatonic
1–♭3–4–♭5–♭6|Minor ♭5 Pentatonic
1–♭3–♭4–5–6|Harmonic Minor Pentatonic
1–♭2–♭3–5–6|Harmonic Minor Pentatonic Variant
1–♭2–3–5–6|Harmonic Major Pentatonic
1–2–3–♭5–6|Harmonic Major ♭5 Pentatonic
1–2–♭3–♭5–♭7|Dominant ♭5 Pentatonic
1–♭2–4–♭5–♭7|Altered Dominant Pentatonic
1–♭2–3–♭5–♭7|Altered Major Pentatonic
1–2–♭3–♭5–6|Altered Dorian Pentatonic
1–♭2–♭3–5–♭7|Japanese Minor Pentatonic`;

const SCALES6 = `1–2–3–4–5–6|Major Hexatonic
1–2–3–4–5–♭7|Major Hexatonic ♭7
1–2–3–4–♭6–♭7|Major Hexatonic ♭6♭7
1–2–3–4–6–♭7|Lydian Dominant Hexatonic
1–2–3–4–♯4–6|Lydian Augmented Hexatonic
1–2–3–♭5–5–6|Major Hexatonic ♭5
1–2–3–♭5–6–♭7|Dominant ♭5 Hexatonic
1–2–3–5–6–♭7|Mixolydian Hexatonic
1–2–3–5–♭6–♭7|Mixolydian ♭6 Hexatonic
1–2–3–5–♭6–6|Major Hexatonic ♭6
1–2–3–♭5–5–♭7|Dominant Blues Hexatonic
1–2–4–5–6–♭7|Suspended Hexatonic
1–2–4–5–♭6–♭7|Suspended ♭6 Hexatonic
1–2–4–5–6–7|Major Suspended Hexatonic
1–2–4–♭5–5–♭7|Suspended Blues Hexatonic
1–2–♭3–4–5–♭7|Dorian Hexatonic
1–2–♭3–4–5–6|Dorian 6 Hexatonic
1–2–♭3–4–5–♭6|Dorian ♭6 Hexatonic
1–2–♭3–4–6–♭7|Dorian 6/7 Hexatonic
1–2–♭3–5–♭6–♭7|Dorian ♭6 Hexatonic
1–♭2–♭3–4–5–♭7|Phrygian Hexatonic
1–♭2–♭3–4–5–6|Phrygian 6 Hexatonic
1–♭2–♭3–4–♭5–♭7|Phrygian ♭5 Hexatonic
1–♭2–3–4–5–♭7|Phrygian Dominant Hexatonic
1–♭2–3–4–5–6|Phrygian Dominant 6 Hexatonic
1–♭2–3–4–♭5–♭7|Phrygian Dominant ♭5 Hexatonic
1–♭2–3–4–♭6–♭7|Phrygian Dominant ♭6 Hexatonic
1–2–3–♯4–5–6|Lydian Hexatonic
1–2–3–♯4–5–7|Lydian Major 7 Hexatonic
1–2–3–♯4–5–♭7|Lydian Dominant Hexatonic
1–2–3–♯4–♭6–7|Lydian ♭6 Hexatonic
1–2–3–♯4–♯5–6|Lydian Augmented Hexatonic
1–2–3–♯4–♯5–7|Lydian Augmented Major 7
1–2–3–♯4–♯5–♭7|Lydian Augmented Dominant
1–2–3–4–5–♭6|Major ♭6 Hexatonic
1–2–3–4–♭5–6|Major ♭5 Hexatonic
1–2–3–4–♭5–♭7|Major ♭5 ♭7 Hexatonic
1–2–3–4–♭6–7|Major ♭6 Major 7 Hexatonic
1–2–3–4–♭6–♭7|Major ♭6 ♭7 Hexatonic
1–♭3–4–5–♭7–1|Minor Pentatonic Extended
1–♭3–4–5–6–♭7|Minor 6/7 Hexatonic
1–♭3–4–5–♭6–♭7|Minor Hexatonic
1–♭3–4–♭5–♭7–1|Minor Blues Hexatonic
1–♭3–♭5–5–♭7–1|Blues Hexatonic
1–♭3–4–♭5–5–♭7|Blues Scale
1–♭3–4–♭5–♭6–♭7|Aeolian Blues Hexatonic
1–♭3–4–♭5–6–♭7|Dorian Blues Hexatonic
1–♭3–4–5–♭6–6|Minor 6 Hexatonic
1–♭3–♭5–5–♭6–♭7|Blues ♭6 Hexatonic
1–♭3–♭4–5–♭6–♭7|Minor ♭4 Hexatonic
1–♭3–♭4–5–6–♭7|Minor ♭4 Major 6 Hexatonic
1–♭3–♭4–♭5–♭6–♭7|Locrian Minor Hexatonic
1–♭2–♭3–♭5–♭6–♭7|Locrian Hexatonic
1–♭2–♭3–4–♭5–♭7|Locrian ♭4 Hexatonic
1–♭2–♭3–4–♭6–♭7|Phrygian ♭6 Hexatonic
1–♭2–♭3–5–♭6–♭7|Phrygian Minor Hexatonic
1–♭2–♭3–5–6–♭7|Phrygian Major 6 Hexatonic
1–♭2–♭3–4–5–6|Phrygian Major 6 Hexatonic
1–♭2–♭3–♭5–5–♭7|Half-Whole Diminished Hexatonic
1–♭2–♭3–♭5–♭6–6|Diminished Hexatonic
1–♭2–♭3–♭5–♭6–♭7|Super-Locrian Hexatonic
1–♭2–♭3–♭4–♭5–♭7|Altered Hexatonic
1–♭2–3–♭5–♭6–♭7|Altered Dominant Hexatonic
1–♭2–3–♭5–5–♭7|Altered Blues Hexatonic
1–♭2–3–4–♭5–♭7|Phrygian Dominant ♭5
1–♭2–3–4–♭6–6|Phrygian Major 6 Hexatonic
1–♭2–3–5–♭6–♭7|Phrygian Dominant Hexatonic
1–♭2–3–5–6–♭7|Phrygian Dominant 6/7
1–♭2–4–♭5–♭7–1|Iwato Hexatonic
1–♭2–4–5–♭6–♭7|Japanese Hexatonic
1–♭2–4–5–♭6–6|Hirajoshi Hexatonic
1–♭2–♭3–5–♭6–6|In Sen Hexatonic
1–2–♭3–5–♭6–7|Kumoi Hexatonic
1–♭2–4–5–6–7|Japanese Major Hexatonic
1–2–4–5–♭6–7|Ritusen Hexatonic
1–2–♭3–5–6–7|Minor-Major Hexatonic
1–♭3–4–5–6–7|Dorian Major 7 Hexatonic
1–♭3–4–5–♭6–7|Melodic Minor Hexatonic
1–♭3–4–♭5–6–7|Dorian ♭5 Hexatonic
1–♭3–♭5–5–6–7|Minor Blues Major 7
1–♭3–♭5–♭6–♭7–7|Harmonic Minor Hexatonic
1–♭2–♭3–5–♭6–7|Harmonic Minor Altered Hexatonic
1–♭2–3–5–♭6–7|Harmonic Major Hexatonic
1–2–3–4–5–7|Major Major-7 Hexatonic
1–2–3–4–6–7|Major 6/7 Hexatonic
1–2–3–♯4–6–7|Lydian 6/7 Hexatonic
1–2–3–♯4–5–7|Lydian Major Hexatonic
1–2–3–5–6–7|Major 6/7 Hexatonic
1–2–3–5–♭6–7|Major ♭6 Major 7
1–2–3–♭5–6–7|Major ♭5 Major 7
1–2–♭3–4–5–7|Dorian Major 7 Hexatonic
1–2–♭3–4–6–7|Dorian 6/7 Hexatonic
1–2–♭3–5–6–7|Dorian Major 7 Hexatonic
1–♭2–♭3–4–5–7|Phrygian Major 7 Hexatonic
1–♭2–3–4–5–7|Phrygian Dominant Major 7
1–2–♭3–♯4–5–6|Dorian ♯4 Hexatonic
1–♭2–3–♯4–5–♭7|Phrygian Lydian Hexatonic
1–2–♭3–♯4–5–♭7|Dorian ♯4 Dominant Hexatonic
1–♭2–3–♯4–♭6–♭7|Phrygian Lydian ♭6
1–♭2–3–♯4–5–6|Phrygian Lydian 6
1–2–3–♯4–♭5–6|Lydian ♭5 Hexatonic`;

const SCALES7 = `1–2–3–4–5–6–7|Major (Ionian)
1–2–♭3–4–5–6–♭7|Dorian
1–♭2–♭3–4–5–♭6–♭7|Phrygian
1–2–3–♯4–5–6–7|Lydian
1–2–3–4–5–6–♭7|Mixolydian
1–2–♭3–4–5–♭6–♭7|Aeolian
1–♭2–♭3–4–♭5–♭6–♭7|Locrian
1–2–♭3–4–5–6–7|Melodic Minor
1–2–♭3–4–5–♭6–♭7|Dorian ♭6
1–♭2–3–4–5–6–♭7|Lydian Augmented
1–2–3–♯4–♯5–6–7|Lydian Augmented
1–2–3–♯4–5–6–♭7|Lydian Dominant
1–♭2–♭3–♭4–5–♭6–♭7|Altered
1–♭2–♭3–♭4–♭5–♭6–♭7|Super Locrian
1–♭2–3–4–5–♭6–♭7|Phrygian Dominant
1–2–3–4–♯4–6–♭7|Mixolydian ♯4
1–2–♭3–♯4–5–6–♭7|Dorian ♯4
1–♭2–♭3–4–5–6–♭7|Phrygian ♯6
1–2–♭3–4–♯4–6–♭7|Dorian ♯4 Variant
1–♭2–3–♯4–5–6–♭7|Lydian Dominant ♭2
1–♭2–3–4–5–6–7|Phrygian Major
1–2–3–4–5–♭6–♭7|Mixolydian ♭6
1–2–3–♯4–5–♭6–7|Lydian ♭6
1–2–♭3–4–5–♭6–7|Melodic Minor ♭6
1–♭2–♭3–4–5–♭6–7|Phrygian Major 7
1–♭2–3–4–5–♭6–7|Phrygian Dominant Major 7
1–2–♭3–4–5–6–♭7|Dorian
1–2–♭3–4–5–♭6–♭7|Dorian ♭6
1–♭2–♭3–4–5–♭6–♭7|Phrygian
1–♭2–♭3–4–♭5–♭6–♭7|Locrian ♯6
1–♭2–♭3–♭4–5–♭6–♭7|Altered ♭4
1–♭2–♭3–♭4–♭5–♭6–7|Altered Major 7
1–♭2–3–4–♭5–♭6–♭7|Phrygian ♭5
1–♭2–3–4–♭5–6–♭7|Phrygian ♭5 ♯6
1–♭2–3–4–5–♭6–7|Phrygian Dominant
1–♭2–3–4–5–6–♭7|Phrygian Dominant ♭7
1–♭2–3–4–5–6–7|Double Harmonic Major
1–♭2–3–4–5–♭6–7|Double Harmonic Minor
1–♭2–♭3–4–5–6–7|Hungarian Minor
1–2–♭3–♯4–5–♭6–7|Hungarian Minor
1–2–♭3–♯4–5–6–7|Hungarian Major
1–♭2–♭3–♯4–5–♭6–7|Romanian Minor
1–2–♭3–♯4–5–6–♭7|Romanian Minor
1–♭2–3–♯4–5–♭6–7|Ukrainian Dorian
1–2–♭3–4–♯4–5–6|Prometheus
1–2–3–♯4–♭6–♭7–7|Prometheus Liszt
1–♭2–3–♯4–5–♭6–♭7|Spanish 8-Tone
1–♭2–3–4–5–♭6–♭7|Spanish Phrygian
1–♭2–3–4–5–6–♭7|Spanish Gypsy
1–♭2–3–♯4–5–6–♭7|Spanish 8-Tone Variant
1–2–3–4–5–♭6–7|Harmonic Major
1–♭2–3–4–5–♭6–7|Harmonic Major Mode 2
1–2–♭3–4–5–♭6–7|Harmonic Minor
1–♭2–3–♯4–5–♭6–7|Harmonic Minor Mode 4
1–2–♭3–4–♭5–5–6|Blues Heptatonic
1–2–♭3–4–5–♭6–6|Blues Dorian
1–♭3–4–♭5–5–♭7–1|Blues Scale Extended
1–2–♭3–4–♭5–♭6–♭7|Dorian ♭5
1–2–♭3–♭5–5–6–♭7|Dorian ♭5 Variant
1–♭2–♭3–4–♭5–5–♭7|Locrian Blues
1–♭2–♭3–4–5–♭6–♭7|Phrygian Blues
1–♭2–♭3–4–♭5–5–♭7|Phrygian Blues ♭5
1–♭2–♭3–♭4–5–♭6–♭7|Altered Blues
1–♭2–3–4–♭5–5–♭7|Phrygian Dominant Blues
1–2–♭3–4–5–6–7|Jazz Minor
1–2–♭3–4–♯4–6–7|Dorian ♯4
1–♭2–♭3–4–5–6–7|Phrygian ♯6
1–♭2–3–4–5–6–7|Phrygian Major
1–♭2–3–♯4–5–6–7|Lydian ♯2
1–2–3–♯4–5–6–♭7|Lydian Dominant
1–2–3–♯4–♯5–6–♭7|Lydian Augmented Dominant
1–2–3–♯4–♯5–6–7|Lydian Augmented Major
1–2–3–4–♯4–5–6|Lydian ♯5 Variant
1–2–3–4–♭5–6–7|Lydian ♭5
1–2–3–♯4–♭5–6–7|Lydian ♯4 ♭5
1–2–3–4–♭5–♭6–7|Lydian ♭5 ♭6
1–2–3–4–5–♭6–7|Major ♭6
1–2–3–4–5–6–♭7|Mixolydian
1–2–3–4–♭5–6–♭7|Mixolydian ♭5
1–2–3–4–♭5–♭6–♭7|Mixolydian ♭5 ♭6
1–2–3–4–5–♭6–♭7|Mixolydian ♭6
1–2–3–4–5–♭6–7|Mixolydian ♭6 Major 7
1–2–♭3–4–5–6–7|Dorian Major 7
1–2–♭3–4–♭5–6–♭7|Dorian ♭5
1–2–♭3–4–♭5–♭6–♭7|Dorian ♭5 ♭6
1–2–♭3–♯4–5–6–7|Dorian ♯4 Major 7
1–2–♭3–♯4–5–6–♭7|Dorian ♯4
1–♭2–♭3–4–♭5–6–♭7|Phrygian ♭5 ♯6
1–♭2–♭3–4–♭5–♭6–7|Phrygian ♭5 Major 7
1–♭2–♭3–4–5–6–7|Phrygian Major 7
1–♭2–♭3–♯4–5–6–♭7|Phrygian ♯4
1–♭2–3–4–♭5–♭6–7|Phrygian Dominant ♭5
1–♭2–3–♯4–5–6–♭7|Phrygian Dominant ♯4
1–♭2–3–♯4–♭5–6–♭7|Phrygian Dominant ♯4 ♭5
1–♭2–3–4–5–♭6–7|Phrygian Dominant Major 7
1–♭2–3–4–♭5–6–7|Phrygian Dominant ♭5 Major 7
1–♭2–♭3–♭4–♭5–6–♭7|Super-Locrian 6
1–♭2–♭3–♭4–5–6–♭7|Altered 6
1–♭2–♭3–♭4–♭5–6–7|Altered 6 Major 7
1–♭2–♭3–♭4–5–6–7|Altered Major 6
1–♭2–♭3–4–5–6–7|Altered Phrygian
1–♭2–3–4–5–6–7|Altered Phrygian Major
1–♭2–3–♯4–5–♭6–♭7|Spanish Phrygian ♯4
1–♭2–3–♯4–5–6–7|Spanish Lydian
1–2–♭3–♯4–5–♭6–♭7|Hungarian Minor
1–2–♭3–♯4–5–6–♭7|Hungarian Dorian
1–♭2–♭3–♯4–5–♭6–♭7|Romanian Minor
1–♭2–3–♯4–5–♭6–♭7|Ukrainian Dorian Variant
1–2–3–♯4–♭5–6–♭7|Lydian Dominant ♭5
1–2–3–♯4–♭5–♭6–♭7|Lydian ♭5 ♭6
1–2–♭3–♯4–♭5–6–♭7|Dorian ♯4 ♭5
1–♭2–♭3–♯4–♭5–6–♭7|Phrygian ♯4 ♭5`;
return { SCALES5, SCALES6, SCALES7 };
});
})(window.TD = window.TD || {});
