(function (TD) {
'use strict';
TD.lazy('data/blues.js', () => {
const { progressionCards } = TD['data/progressions.js'];

const bluesCards = progressionCards(`I–IV–V|C7–F7–G7|Basic 12-bar blues framework
I–I–IV–V|C7–C7–F7–G7|Tonic held before moving to IV
I–IV–I–V|C7–F7–C7–G7|Classic blues movement
I–IV–I–V–IV|C7–F7–C7–G7–F7|Expanded turnaround approach
I–IV–V–IV|C7–F7–G7–F7|Cyclic blues progression
I–I–I–I|C7–C7–C7–C7|Tonic-heavy blues opening
I–IV–IV–I|C7–F7–F7–C7|Four-bar blues movement
I–V–IV–I|C7–G7–F7–C7|Descending functional blues
I–V–I–IV|C7–G7–C7–F7|Dominant-to-tonic blues motion
I–IV–V–I|C7–F7–G7–C7|Complete blues cadence
I–I–IV–IV–I–I–V–IV–I|C7–C7–F7–F7–C7–C7–G7–F7–C7|Nine-bar blues skeleton
I–I–I–IV–IV–I–I–V–IV–I|C7–C7–C7–F7–F7–C7–C7–G7–F7–C7|Ten-bar blues variant
I–IV–I–V–IV–I|C7–F7–C7–G7–F7–C7|Compact blues cycle
I–IV–V–IV–I|C7–F7–G7–F7–C7|Blues with plagal return
I–V–IV–V|C7–G7–F7–G7|Dominant-centered turnaround
I–IV–I–IV|C7–F7–C7–F7|Alternating tonic/subdominant blues
I–V–I–V|C7–G7–C7–G7|Tonic/dominant vamp
I–IV–V–V|C7–F7–G7–G7|Dominant-heavy blues phrase
I–I–IV–I–V–IV–I|C7–C7–F7–C7–G7–F7–C7|Shortened 12-bar structure
I–IV–IV–I–V–IV–I|C7–F7–F7–C7–G7–F7–C7|Strong IV-centered blues
I–IV–I–IV–V–IV–I|C7–F7–C7–F7–G7–F7–C7|Alternating blues progression
I–I–IV–I–V–I|C7–C7–F7–C7–G7–C7|Simple turnaround blues
I–IV–V–I–IV–V|C7–F7–G7–C7–F7–G7|Repeating dominant cycle
I–V–IV–I–V|C7–G7–F7–C7–G7|Blues turnaround loop
I–IV–♭VII–IV|C7–F7–B♭7–F7|Mixolydian blues color
I–♭VII–IV–I|C7–B♭7–F7–C7|Backward blues movement
I–♭VII–IV–V|C7–B♭7–F7–G7|Modal dominant blues
I–IV–♭VII–I|C7–F7–B♭7–C7|Modal return to tonic
I–♭VII–I|C7–B♭7–C7|Rock-blues dominant vamp
I–IV–I–♭VII|C7–F7–C7–B♭7|Blues ending on modal ♭VII
I7–IV7–I7–V7|C7–F7–C7–G7|Dominant-seventh blues skeleton
I7–IV7–V7–IV7|C7–F7–G7–F7|Four-chord dominant blues
I7–V7–IV7–I7|C7–G7–F7–C7|Descending dominant blues
I7–IV7–V7–I7|C7–F7–G7–C7|Dominant-seventh blues cadence
I7–IV7–I7–IV7|C7–F7–C7–F7|Dominant tonic/subdominant vamp
I7–V7–I7–IV7|C7–G7–C7–F7|Dominant turnaround into IV
I7–IV7–♭VII7–I7|C7–F7–B♭7–C7|Blues/modal dominant cycle
I7–♭VII7–IV7–I7|C7–B♭7–F7–C7|Descending dominant-subdominant cycle
I7–VI7–II7–V7|C7–A7–D7–G7|Chain of dominant substitutions
I7–VI7–II7–V7–I7|C7–A7–D7–G7–C7|Blues-flavored circle-of-fifths turnaround
I7–III7–VI7–II7–V7|C7–E7–A7–D7–G7|Extended dominant chain
I7–III7–VI7–II7–V7–I7|C7–E7–A7–D7–G7–C7|Full dominant cycle
I7–VI7–II7–V7|C7–A7–D7–G7|Common blues/jazz turnaround
I7–IV7–VII7–III7|C7–F7–B7–E7|Chromatic dominant sequence
I7–♭III7–IV7–V7|C7–E♭7–F7–G7|Blues chromatic-mediant color
I7–♭VI7–V7–IV7|C7–A♭7–G7–F7|Chromatic descending dominant motion
I7–♭VII7–VI7–V7|C7–B♭7–A7–G7|Descending dominant turnaround
I7–VI7–♭VI7–V7|C7–A7–A♭7–G7|Chromatic dominant descent
I7–♭VII7–VI7–♭VI7–V7|C7–B♭7–A7–A♭7–G7|Extended chromatic descent
I7–IV7–#IV°–V7|C7–F7–F#dim–G7|Diminished passing chord into V
I7–IV7–#IV°–I7|C7–F7–F#dim–C7|Diminished approach back to tonic
I7–VI7–II7–#II°–III7|C7–A7–D7–D#dim–E7|Chromatic dominant chain
I7–IV7–iv7–I7|C7–F7–Fm7–C7|Major/minor IV blues color
I7–IV7–iv7–V7|C7–F7–Fm7–G7|Borrowed minor IV before dominant
I7–iv7–I7|C7–Fm7–C7|Tonic with minor-subdominant blues color
I7–♭VI7–V7–I7|C7–A♭7–G7–C7|Chromatic minor-color turnaround
I7–♭III7–IV7–I7|C7–E♭7–F7–C7|Bluesy chromatic-mediant movement
I7–VI7–♭II7–V7|C7–A7–D♭7–G7|Tritone-related turnaround colors
I7–IV7–♭VII7–V7|C7–F7–B♭7–G7|Modal dominant turnaround
I7–V7–♭VI7–V7|C7–G7–A♭7–G7|Dominant oscillation with ♭VI
I7–IV7–I7–♭VI7–V7|C7–F7–C7–A♭7–G7|Extended turnaround
I7–VI7–II7–V7–IV7–I7|C7–A7–D7–G7–F7–C7|Circle movement with blues plagal return
I7–III7–VI7–IV7|C7–E7–A7–F7|Dominant chain interrupted by IV
I7–VI7–IV7–V7|C7–A7–F7–G7|Blues turnaround with VI7
I7–II7–IV7–V7|C7–D7–F7–G7|Dominant-colored upward blues movement
I7–II7–I7–V7|C7–D7–C7–G7|Dominant supertonic tension
I7–♭VII7–I7–IV7|C7–B♭7–C7–F7|Rock-blues tonic/♭VII motion
I7–♭VII7–IV7–V7|C7–B♭7–F7–G7|Classic modal blues vocabulary
I7–IV7–♭VII7–IV7|C7–F7–B♭7–F7|Dominant modal cycle
I7–♭VII7–♭VI7–V7|C7–B♭7–A♭7–G7|Descending dominant-color sequence
I7–IV7–V7–♭VII7|C7–F7–G7–B♭7|Dominant chords with modal extension
i–iv–V|Cm7–Fm7–G7|Minor blues harmonic skeleton
i–i–iv–V|Am7–Am7–Dm7–E7|Minor blues opening
i–iv–i–V|Am7–Dm7–Am7–E7|Minor blues tonic/predominant/dominant
i–♭VI–V|Am7–F7–E7|Minor blues cadence
i–♭VII–♭VI–V|Am7–G7–F7–E7|Descending minor-blues cadence
i–iv–♭VII–♭VI|Am7–Dm7–G7–F7|Minor modal blues sequence
i–♭VII–iv–V|Am7–G7–Dm7–E7|Minor blues with modal ♭VII
i–♭VI–iv–V|Am7–F7–Dm7–E7|Dark minor-blues turnaround
i–iv–♭VI–V|Am7–Dm7–F7–E7|Minor predominant chain
i–♭III–iv–V|Am7–C7–Dm7–E7|Minor tonic with major ♭III
i–♭VII–♭III–iv|Am7–G7–C7–Dm7|Minor/modal blues cycle
i–♭VI–♭VII–V|Am7–F7–G7–E7|Minor blues with dominant turnaround
i–iv–♭VII–V|Am7–Dm7–G7–E7|Minor modal movement into dominant
i–♭III–♭VII–iv|Am7–C7–G7–Dm7|Minor blues with major-mode colors
i–♭VI–♭VII–iv–V|Am7–F7–G7–Dm7–E7|Extended minor-blues turnaround
i–iv–♭VI–♭VII–V|Am7–Dm7–F7–G7–E7|Modal minor buildup into V
i–♭VII–♭VI–iv–V|Am7–G7–F7–Dm7–E7|Descending minor blues into dominant
i–♭III–iv–♭VI–V|Am7–C7–Dm7–F7–E7|Minor blues with major ♭III and ♭VI
i–♭VI–♭VII–♭III–V|Am7–F7–G7–C7–E7|Extended minor/modal cadence
i–iv–i–♭VI–V|Am7–Dm7–Am7–F7–E7|Tonic return followed by minor-blues cadence
I7–IV7–I7–iv7–I7|C7–F7–C7–Fm7–C7|Major blues with sudden minor IV
I7–IV7–iv7–I7–V7|C7–F7–Fm7–C7–G7|Minor IV used as dominant preparation
I7–♭VII7–IV7–iv7–I7|C7–B♭7–F7–Fm7–C7|Modal blues plus parallel-minor subdominant
I7–VI7–II7–V7–iv7–I7|C7–A7–D7–G7–Fm7–C7|Dominant chain followed by minor blues color
I7–IV7–I7–V7–♭VII7–I7|C7–F7–C7–G7–B♭7–C7|Extended dominant/modal turnaround
I7–V7–IV7–iv7–I7|C7–G7–F7–Fm7–C7|Descending blues with major/minor IV
I7–IV7–♭VI7–V7–I7|C7–F7–A♭7–G7–C7|Chromatic turnaround into tonic
I7–♭VII7–VI7–♭VI7–V7–I7|C7–B♭7–A7–A♭7–G7–C7|Full chromatic dominant descent
I7–IV7–#IV°–V7–I7|C7–F7–F#dim–G7–C7|Classic diminished passing motion
I7–VI7–II7–V7–I7–IV7|C7–A7–D7–G7–C7–F7|Extended circle-of-fifths blues cycle
I7–IV7–V7–IV7–I7–V7|C7–F7–G7–F7–C7–G7|Repeating dominant blues cycle
I7–♭VII7–IV7–I7–V7|C7–B♭7–F7–C7–G7|Modal opening returning to traditional V
I7–IV7–♭VII7–I7–iv7|C7–F7–B♭7–C7–Fm7|Major blues resolving into minor subdominant
i–♭VII–♭VI–V–i|Am7–G7–F7–E7–Am7|Complete descending minor-blues cadence
I7–IV7–I7–V7–IV7–I7|C7–F7–C7–G7–F7–C7|Compact complete blues cycle`);
return { bluesCards };
});
})(window.TD = window.TD || {});
