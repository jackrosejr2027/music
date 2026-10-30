(function (TD) {
'use strict';
TD.lazy('data/modes.js', () => {
const MODES = `1–2–3–4–5–6–7|Ionian / Major
2–3–4–5–6–7–1|Dorian
3–4–5–6–7–1–2|Phrygian
4–5–6–7–1–2–3|Lydian
5–6–7–1–2–3–4|Mixolydian
6–7–1–2–3–4–5|Aeolian / Natural Minor
7–1–2–3–4–5–6|Locrian
1–3–5|Ionian Major Triad
1–2–5|Ionian Sus2
1–4–5|Ionian Sus4
1–2–4|Ionian Suspended
2–4–6|Ionian Supertonic Triad
2–3–6|Ionian 2–3–6 Triad
2–5–6|Ionian 2–5–6 Triad
3–5–7|Ionian iii Triad
3–4–7|Ionian 3–4–7 Triad
3–6–7|Ionian 3–6–7 Triad
4–6–1|Ionian IV Triad
4–5–1|Ionian IV Sus
4–7–1|Ionian 4–7–1 Triad
5–7–2|Ionian V Triad
5–1–2|Ionian V Sus
5–6–2|Ionian 5–6–2 Triad
6–1–3|Ionian vi Triad
6–2–3|Ionian 6–2–3 Triad
6–4–3|Ionian 6–4–3 Triad
7–2–4|Ionian vii° Triad
7–3–4|Ionian 7–3–4 Triad
7–5–4|Ionian 7–5–4 Triad
1–2–3–4|Ionian Tetrachord
2–3–4–5|Ionian Tetrachord II
3–4–5–6|Ionian Tetrachord III
4–5–6–7|Ionian Tetrachord IV
5–6–7–1|Ionian Tetrachord V
6–7–1–2|Ionian Tetrachord VI
7–1–2–3|Ionian Tetrachord VII
1–2–3–5|Major Pentatonic
1–2–3–4|Major Tetrachord
1–2–4–5|Suspended Pentatonic Core
1–2–4–6|Ionian Pentatonic Variant
1–2–4–7|Ionian Pentatonic Variant
1–2–5–6|Major Pentatonic Variant
1–2–5–7|Dominant Pentatonic Core
1–3–4–5|Major Pentatonic Variant
1–3–4–6|Major 6 Pentatonic
1–3–4–7|Major Pentatonic Variant
1–3–5–6|Major Pentatonic
1–3–5–7|Major 7 Pentatonic
1–4–5–6|Suspended Major Pentatonic
1–4–5–7|Dominant Suspended Pentatonic
1–4–6–7|Lydian-Color Pentatonic
1–5–6–7|Dominant Pentatonic
2–3–4–5–6–7|Ionian Hexatonic
1–3–4–5–6–7|Ionian Hexatonic
1–2–4–5–6–7|Ionian Hexatonic
1–2–3–5–6–7|Ionian Hexatonic
1–2–3–4–6–7|Ionian Hexatonic
1–2–3–4–5–7|Ionian Hexatonic
1–2–3–4–5–6|Ionian Hexatonic
1–2–♭3–4–5–6–♭7|Dorian
1–2–♭3|Dorian Minor Triad
1–2–4|Dorian Sus2
1–4–5|Dorian Sus4
1–♭3–4|Dorian Minor Sus
2–4–6|Dorian ii Triad
2–♭3–6|Dorian 2–♭3–6
2–5–6|Dorian 2–5–6
♭3–5–♭7|Dorian Minor Triad
♭3–4–♭7|Dorian Minor Sus
♭3–6–♭7|Dorian Minor 6/7
4–6–1|Dorian IV Triad
4–5–1|Dorian IV Sus
4–♭7–1|Dorian 4–♭7–1
5–♭7–2|Dorian V Minor
5–1–2|Dorian V Sus
5–6–2|Dorian V 6
6–1–♭3|Dorian VI Triad
6–2–♭3|Dorian VI Triad
6–4–♭3|Dorian VI Triad
♭7–2–4|Dorian ♭VII Triad
♭7–♭3–4|Dorian ♭VII
♭7–5–4|Dorian ♭VII
1–2–♭3–4|Dorian Tetrachord
2–♭3–4–5|Dorian Tetrachord II
♭3–4–5–6|Dorian Tetrachord III
4–5–6–♭7|Dorian Tetrachord IV
5–6–♭7–1|Dorian Tetrachord V
6–♭7–1–2|Dorian Tetrachord VI
♭7–1–2–♭3|Dorian Tetrachord VII
1–2–♭3–5|Dorian Minor Pentatonic
1–2–♭3–4|Dorian Pentatonic Variant
1–2–4–5|Dorian Suspended Pentatonic
1–2–4–6|Dorian Pentatonic
1–2–4–♭7|Dorian Pentatonic
1–2–5–6|Dorian Pentatonic
1–2–5–♭7|Dorian Dominant Pentatonic
1–♭3–4–5|Minor Pentatonic
1–♭3–4–6|Dorian 6 Pentatonic
1–♭3–4–♭7|Dorian Minor Pentatonic
1–♭3–5–6|Dorian Minor 6 Pentatonic
1–♭3–5–♭7|Minor Pentatonic
1–4–5–6|Dorian Suspended Pentatonic
1–4–5–♭7|Dorian Suspended Pentatonic
1–4–6–♭7|Dorian Pentatonic
1–5–6–♭7|Dorian Dominant Pentatonic
2–♭3–4–5–6–♭7|Dorian Hexatonic
1–♭3–4–5–6–♭7|Dorian Hexatonic
1–2–4–5–6–♭7|Dorian Hexatonic
1–2–♭3–5–6–♭7|Dorian Hexatonic
1–2–♭3–4–6–♭7|Dorian Hexatonic
1–2–♭3–4–5–♭7|Dorian Hexatonic
1–2–♭3–4–5–6|Dorian Hexatonic
1–♭2–♭3–4–5–♭6–♭7|Phrygian
1–♭2–♭3|Phrygian Minor Triad
1–♭2–4|Phrygian Sus
1–4–5|Phrygian Sus4
1–♭3–4|Phrygian Minor Sus
2–4–♭6|Phrygian ii°
2–♭3–♭6|Phrygian 2–♭3–♭6
2–5–♭6|Phrygian 2–5–♭6
♭3–5–♭7|Phrygian Minor Triad
♭3–4–♭7|Phrygian Minor Sus
♭3–♭6–♭7|Phrygian Minor 6/7
4–♭6–1|Phrygian IV
4–5–1|Phrygian Sus
4–♭7–1|Phrygian IV
5–♭7–♭2|Phrygian V
5–1–♭2|Phrygian Sus
5–♭6–♭2|Phrygian V
♭6–1–♭3|Phrygian ♭VI
♭6–♭2–♭3|Phrygian ♭VI
♭6–4–♭3|Phrygian ♭VI
♭7–♭2–4|Phrygian ♭VII
♭7–♭3–4|Phrygian ♭VII
♭7–5–4|Phrygian ♭VII
1–♭2–♭3–4|Phrygian Tetrachord
♭2–♭3–4–5|Phrygian Tetrachord II
♭3–4–5–♭6|Phrygian Tetrachord III
4–5–♭6–♭7|Phrygian Tetrachord IV
5–♭6–♭7–1|Phrygian Tetrachord V
♭6–♭7–1–♭2|Phrygian Tetrachord VI
♭7–1–♭2–♭3|Phrygian Tetrachord VII
1–♭2–♭3–5|Phrygian Pentatonic
1–♭2–♭3–4|Phrygian Pentatonic
1–♭2–4–5|Phrygian Suspended Pentatonic
1–♭2–4–♭6|Phrygian Pentatonic
1–♭2–4–♭7|Phrygian Pentatonic
1–♭2–5–♭6|Phrygian Pentatonic
1–♭2–5–♭7|Phrygian Pentatonic
1–♭3–4–5|Phrygian Minor Pentatonic
1–♭3–4–♭6|Phrygian Minor Pentatonic
1–♭3–4–♭7|Phrygian Minor Pentatonic
1–♭3–5–♭6|Phrygian Minor Pentatonic
1–♭3–5–♭7|Phrygian Minor Pentatonic
1–4–5–♭6|Phrygian Suspended Pentatonic
1–4–5–♭7|Phrygian Suspended Pentatonic
1–4–♭6–♭7|Phrygian Pentatonic
1–5–♭6–♭7|Phrygian Pentatonic
1–♭2–♭3–4–5–♭6|Phrygian Hexatonic
1–♭2–♭3–4–5–♭7|Phrygian Hexatonic
1–♭2–♭3–4–♭6–♭7|Phrygian Hexatonic
1–♭2–♭3–5–♭6–♭7|Phrygian Hexatonic
1–♭2–4–5–♭6–♭7|Phrygian Hexatonic
1–♭2–4–5–♭6–♭3|Phrygian Hexatonic
1–♭2–♭3–5–♭6–♭7|Phrygian Hexatonic
1–2–3–♯4–5–6–7|Lydian
1–2–3|Lydian Major Triad
1–2–♯4|Lydian Augmented Triad
1–♯4–5|Lydian Sus
1–2–♯4–5|Lydian Suspended
2–3–5|Lydian II
2–3–6|Lydian II
2–♯4–6|Lydian II
3–5–7|Lydian III
3–♯4–7|Lydian III
3–6–7|Lydian III
♯4–6–1|Lydian IV
♯4–5–1|Lydian IV Sus
♯4–7–1|Lydian IV
5–7–2|Lydian V
5–1–2|Lydian V Sus
5–6–2|Lydian V
6–1–3|Lydian VI
6–2–3|Lydian VI
6–♯4–3|Lydian VI
7–2–♯4|Lydian vii
7–3–♯4|Lydian vii
7–5–♯4|Lydian vii
1–2–3–♯4|Lydian Tetrachord
2–3–♯4–5|Lydian Tetrachord II
3–♯4–5–6|Lydian Tetrachord III
♯4–5–6–7|Lydian Tetrachord IV
5–6–7–1|Lydian Tetrachord V
6–7–1–2|Lydian Tetrachord VI
7–1–2–3|Lydian Tetrachord VII
1–2–3–5|Lydian Major Pentatonic
1–2–3–♯4|Lydian Pentatonic
1–2–♯4–5|Lydian Suspended Pentatonic
1–2–♯4–6|Lydian Pentatonic
1–2–♯4–7|Lydian Pentatonic
1–2–5–6|Lydian Pentatonic
1–2–5–7|Lydian Dominant Pentatonic
1–3–♯4–5|Lydian Pentatonic
1–3–♯4–6|Lydian Pentatonic
1–3–♯4–7|Lydian Pentatonic
1–3–5–6|Lydian Major Pentatonic
1–3–5–7|Lydian Major 7 Pentatonic
1–♯4–5–6|Lydian Suspended Pentatonic
1–♯4–5–7|Lydian Dominant Pentatonic
1–♯4–6–7|Lydian Pentatonic
1–5–6–7|Lydian Dominant Pentatonic
1–2–3–♯4–5–6|Lydian Hexatonic
1–2–3–♯4–5–7|Lydian Hexatonic
1–2–3–♯4–6–7|Lydian Hexatonic
1–2–3–5–6–7|Lydian Hexatonic
1–2–♯4–5–6–7|Lydian Hexatonic
1–3–♯4–5–6–7|Lydian Hexatonic
2–3–♯4–5–6–7|Lydian Hexatonic
1–2–3–4–5–6–♭7|Mixolydian
1–2–3|Mixolydian Major Triad
1–2–5|Mixolydian Sus2
1–4–5|Mixolydian Sus4
1–2–4|Mixolydian Suspended
2–3–5|Mixolydian II
2–3–6|Mixolydian II
2–5–6|Mixolydian II
3–5–♭7|Mixolydian III
3–4–♭7|Mixolydian III
3–6–♭7|Mixolydian III
4–6–1|Mixolydian IV
4–5–1|Mixolydian IV Sus
4–♭7–1|Mixolydian IV
5–♭7–2|Dominant Triad
5–1–2|Dominant Sus
5–6–2|Dominant 6
6–1–3|Mixolydian VI
6–2–3|Mixolydian VI
6–4–3|Mixolydian VI
♭7–2–4|Mixolydian ♭VII
♭7–3–4|Mixolydian ♭VII
♭7–5–4|Mixolydian ♭VII
1–2–3–4|Mixolydian Tetrachord
2–3–4–5|Mixolydian Tetrachord II
3–4–5–6|Mixolydian Tetrachord III
4–5–6–♭7|Mixolydian Tetrachord IV
5–6–♭7–1|Mixolydian Tetrachord V
6–♭7–1–2|Mixolydian Tetrachord VI
♭7–1–2–3|Mixolydian Tetrachord VII
1–2–3–5|Mixolydian Major Pentatonic
1–2–3–4|Mixolydian Pentatonic
1–2–4–5|Mixolydian Suspended Pentatonic
1–2–4–6|Mixolydian Pentatonic
1–2–4–♭7|Mixolydian Pentatonic
1–2–5–6|Mixolydian Pentatonic
1–2–5–♭7|Dominant Pentatonic
1–3–4–5|Mixolydian Pentatonic
1–3–4–6|Mixolydian 6 Pentatonic
1–3–4–♭7|Mixolydian Pentatonic
1–3–5–6|Mixolydian Major Pentatonic
1–3–5–♭7|Dominant Pentatonic
1–4–5–6|Mixolydian Suspended Pentatonic
1–4–5–♭7|Dominant Suspended Pentatonic
1–4–6–♭7|Mixolydian Pentatonic
1–5–6–♭7|Dominant Pentatonic
1–2–3–4–5–6|Mixolydian Hexatonic
1–2–3–4–5–♭7|Mixolydian Hexatonic
1–2–3–4–6–♭7|Mixolydian Hexatonic
1–2–3–5–6–♭7|Mixolydian Hexatonic
1–2–4–5–6–♭7|Mixolydian Hexatonic
1–3–4–5–6–♭7|Mixolydian Hexatonic
2–3–4–5–6–♭7|Mixolydian Hexatonic
1–2–♭3–4–5–♭6–♭7|Aeolian / Natural Minor
1–2–♭3|Minor Triad
1–2–5|Minor Sus2
1–4–5|Minor Sus4
1–2–4|Minor Suspended
2–♭3–5|Aeolian ii°
2–♭3–♭6|Aeolian ii
2–5–♭6|Aeolian ii
♭3–5–♭7|Minor Triad
♭3–4–♭7|Minor Sus
♭3–♭6–♭7|Minor 6/7
4–♭6–1|Aeolian IV
4–5–1|Aeolian Sus
4–♭7–1|Aeolian IV
5–♭7–2|Minor V
5–1–2|Minor Sus
5–♭6–2|Minor V
♭6–1–♭3|Aeolian ♭VI
♭6–♭2–♭3|Aeolian ♭VI
♭6–4–♭3|Aeolian ♭VI
♭7–2–4|Aeolian ♭VII
♭7–♭3–4|Aeolian ♭VII
♭7–5–4|Aeolian ♭VII
1–2–♭3–4|Aeolian Tetrachord
2–♭3–4–5|Aeolian Tetrachord II
♭3–4–5–♭6|Aeolian Tetrachord III
4–5–♭6–♭7|Aeolian Tetrachord IV
5–♭6–♭7–1|Aeolian Tetrachord V
♭6–♭7–1–2|Aeolian Tetrachord VI
♭7–1–2–♭3|Aeolian Tetrachord VII
1–2–♭3–5|Minor Pentatonic
1–2–♭3–4|Aeolian Pentatonic
1–2–4–5|Aeolian Suspended Pentatonic
1–2–4–♭6|Aeolian Pentatonic
1–2–4–♭7|Aeolian Pentatonic
1–2–5–♭6|Aeolian Pentatonic
1–2–5–♭7|Aeolian Pentatonic
1–♭3–4–5|Minor Pentatonic
1–♭3–4–♭6|Aeolian Minor Pentatonic
1–♭3–4–♭7|Minor Pentatonic
1–♭3–5–♭6|Minor Pentatonic
1–♭3–5–♭7|Minor Pentatonic
1–4–5–♭6|Aeolian Suspended Pentatonic
1–4–5–♭7|Aeolian Suspended Pentatonic
1–4–♭6–♭7|Aeolian Pentatonic
1–5–♭6–♭7|Aeolian Pentatonic
1–2–♭3–4–5–♭6|Aeolian Hexatonic
1–2–♭3–4–5–♭7|Aeolian Hexatonic
1–2–♭3–4–♭6–♭7|Aeolian Hexatonic
1–2–♭3–5–♭6–♭7|Aeolian Hexatonic
1–2–4–5–♭6–♭7|Aeolian Hexatonic
1–♭3–4–5–♭6–♭7|Aeolian Hexatonic
2–♭3–4–5–♭6–♭7|Aeolian Hexatonic
1–♭2–♭3–4–♭5–♭6–♭7|Locrian
1–♭2–♭5|Locrian Diminished Triad
1–♭3–♭5|Locrian Diminished
1–♭2–4|Locrian Sus
1–4–♭5|Locrian Sus
1–♭2–♭3–4|Locrian Tetrachord
♭2–♭3–4–♭5|Locrian Tetrachord II
♭3–4–♭5–♭6|Locrian Tetrachord III
4–♭5–♭6–♭7|Locrian Tetrachord IV
♭5–♭6–♭7–1|Locrian Tetrachord V
♭6–♭7–1–♭2|Locrian Tetrachord VI
♭7–1–♭2–♭3|Locrian Tetrachord VII
1–♭2–♭3–♭5|Locrian Pentatonic
1–♭2–♭3–4|Locrian Pentatonic
1–♭2–4–♭5|Locrian Pentatonic
1–♭2–4–♭6|Locrian Pentatonic
1–♭2–4–♭7|Locrian Pentatonic
1–♭2–♭5–♭6|Locrian Pentatonic
1–♭2–♭5–♭7|Locrian Pentatonic
1–♭3–4–♭5|Locrian Minor Pentatonic
1–♭3–4–♭6|Locrian Pentatonic
1–♭3–4–♭7|Locrian Pentatonic
1–♭3–♭5–♭6|Locrian Pentatonic
1–♭3–♭5–♭7|Locrian Pentatonic
1–4–♭5–♭6|Locrian Suspended
1–4–♭5–♭7|Locrian Suspended
1–4–♭6–♭7|Locrian Pentatonic
1–♭5–♭6–♭7|Locrian Pentatonic
1–♭2–♭3–4–♭5–♭6|Locrian Hexatonic
1–♭2–♭3–4–♭5–♭7|Locrian Hexatonic
1–♭2–♭3–4–♭6–♭7|Locrian Hexatonic
1–♭2–♭3–♭5–♭6–♭7|Locrian Hexatonic
1–♭2–4–♭5–♭6–♭7|Locrian Hexatonic
1–♭2–♭3–♭5–♭6–♭7|Locrian Hexatonic
♭2–♭3–4–♭5–♭6–♭7|Locrian Hexatonic`;
return { MODES };
});
})(window.TD = window.TD || {});
