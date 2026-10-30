(function (TD) {
'use strict';
TD.lazy('data/majorminor.js', () => {
const { progressionCards } = TD['data/progressions.js'];

const majorMinorCards = progressionCards(`I–IV–V|C–F–G|Fundamental major progression from Ionian
I–V–vi–IV|C–G–Am–F|Major tonic with relative-minor vi
I–vi–IV–V|C–Am–F–G|Major-to-relative-minor movement
I–IV–vi–V|C–F–Am–G|Major framework with minor vi
I–vi–ii–V|C–Am–Dm–G|Major tonic moving through relative minor
I–iii–vi–IV|C–Em–Am–F|Descending minor-third relationship
I–iii–IV–V|C–Em–F–G|Major progression with minor mediant
I–ii–V–I|C–Dm–G–C|Classic ii–V–I
I–vi–ii–V|C–Am–Dm–G|Circle movement through minor and major chords
I–iii–IV–I|C–Em–F–C|Minor mediant resolving to major subdominant
I–IV–I–V|C–F–C–G|Strong tonic/subdominant/dominant cycle
I–V–IV–I|C–G–F–C|Reversed dominant/subdominant motion
I–ii–IV–V|C–Dm–F–G|Minor ii between major functions
I–iii–ii–V|C–Em–Dm–G|Descending diatonic minor movement
I–vi–iii–IV|C–Am–Em–F|Relative-minor chain
I–vi–iii–V|C–Am–Em–G|Minor chain resolving through V
I–iii–vi–V|C–Em–Am–G|Three minor chords surrounding dominant
I–ii–vi–V|C–Dm–Am–G|Minor predominant and relative-minor center
I–IV–ii–V|C–F–Dm–G|Major IV framing minor ii
I–V–ii–IV|C–G–Dm–F|Dominant followed by minor predominant
vi–IV–I–V|Am–F–C–G|Relative minor opening into major
vi–IV–V–I|Am–F–G–C|Minor opening resolving to major tonic
vi–ii–V–I|Am–Dm–G–C|Relative-minor-to-major cadence
vi–iii–IV–V|Am–Em–F–G|Minor opening with major dominant preparation
vi–iii–ii–V|Am–Em–Dm–G|Descending diatonic minor sequence
vi–V–IV–I|Am–G–F–C|Aeolian opening resolving through major chords
vi–IV–ii–V|Am–F–Dm–G|Minor tonic with major IV and minor ii
vi–I–IV–V|Am–C–F–G|Relative-minor/major alternation
vi–I–ii–V|Am–C–Dm–G|Minor-to-major tonic exchange
vi–iii–IV–I|Am–Em–F–C|Minor opening with major resolution
ii–V–I–vi|Dm–G–C–Am|Major cadence extended into relative minor
ii–V–vi–IV|Dm–G–Am–F|Dominant resolves deceptively to minor
iii–vi–ii–V|Em–Am–Dm–G|All-diatonic descending cycle
iii–vi–IV–V|Em–Am–F–G|Minor chain opening into major cadence
iii–IV–I–V|Em–F–C–G|Minor mediant against major framework
iii–ii–vi–V|Em–Dm–Am–G|Descending minor-chord sequence
IV–vi–V–I|F–Am–G–C|Major IV with minor vi
IV–I–vi–V|F–C–Am–G|Major subdominant with relative minor
IV–ii–V–I|F–Dm–G–C|IV–ii–V–I progression
IV–vi–ii–V|F–Am–Dm–G|Minor chords embedded between major functions
V–vi–IV–I|G–Am–F–C|Dominant deceptively moving to relative minor
V–vi–ii–I|G–Am–Dm–C|Dominant-to-minor movement with modal color
V–iii–vi–IV|G–Em–Am–F|Dominant followed by descending minor chain
V–ii–vi–IV|G–Dm–Am–F|Dominant-centered modal progression
V–IV–vi–I|G–F–Am–C|Dominant/subdominant/minor-to-major cycle
I–♭VII–IV–I|C–B♭–F–C|Mixolydian major-mode progression
I–♭VII–IV–V|C–B♭–F–G|Mixolydian color returning to Ionian V
I–♭VII–I|C–B♭–C|Major tonic with Mixolydian ♭VII
I–IV–♭VII–I|C–F–B♭–C|Major/Mixolydian modal mixture
I–♭VII–vi–IV|C–B♭–Am–F|Mixolydian major chord followed by relative minor
I–♭VII–vi–V|C–B♭–Am–G|Modal major-to-minor descent
I–♭VII–IV–vi|C–B♭–F–Am|Mixolydian colors with relative minor
I–♭VII–IV–ii|C–B♭–F–Dm|Modal major chords surrounding minor ii
i–♭VII–♭VI–V|Am–G–F–E|Aeolian/parallel-minor descending cadence
i–♭VII–♭VI–♭VII|Am–G–F–G|Aeolian minor cycle
i–♭VI–♭VII–i|Am–F–G–Am|Natural-minor tonic cycle
i–iv–♭VII–♭III|Am–Dm–G–C|Aeolian minor moving toward relative major
i–♭III–♭VII–IV|Am–C–G–D|Minor tonic with modal major IV
i–♭III–♭VI–♭VII|Am–C–F–G|Pure Aeolian progression
i–♭VII–♭III–♭VI|Am–G–C–F|Aeolian/modal cycle
i–iv–♭III–♭VII|Am–Dm–C–G|Minor predominant with modal majors
i–♭VI–iv–V|Am–F–Dm–E|Minor tonic with borrowed dominant from harmonic minor
i–♭III–iv–V|Am–C–Dm–E|Minor-major alternation with dominant
i–♭VII–IV–i|Am–G–D–Am|Dorian-style minor with major IV
i–IV–♭VII–i|Am–D–G–Am|Dorian minor with major IV and ♭VII
i–ii–♭VII–i|Am–Bm–G–Am|Dorian minor with major ii
i–IV–ii–i|Am–D–Bm–Am|Dorian major-chord contrast
i–♭III–IV–i|Am–C–D–Am|Dorian-flavored minor-to-major movement
i–♭VII–IV–V|Am–G–D–E|Dorian/modal minor leading to dominant
i–♭II–♭VII–i|Am–B♭–G–Am|Phrygian minor with major ♭II
i–♭II–♭III–i|Am–B♭–C–Am|Phrygian major-chord tension around minor tonic
i–♭II–♭VII–♭VI|Am–B♭–G–F|Phrygian descending modal colors
i–♭II–iv–i|Am–B♭–Dm–Am|Phrygian tonic with characteristic ♭II
i–♭III–♭II–i|Am–C–B♭–Am|Descending Phrygian modal movement
I–II–V–I|C–D–G–C|Lydian major with major II
I–II–vi–I|C–D–Am–C|Lydian major II resolving toward relative minor
I–II–iii–V|C–D–Em–G|Lydian major with minor iii
I–II–IV–I|C–D–F–C|Major tonic surrounded by Lydian II
I–#IV°–V–I|C–F#dim–G–C|Lydian diminished leading chord
I–II–V–vi|C–D–G–Am|Lydian opening resolving into relative minor
I–♭III–♭VII–IV|C–E♭–B♭–F|Aeolian/Dorian modal mixture
I–♭III–IV–I|C–E♭–F–C|Minor-mode ♭III against major tonic
I–♭III–V–IV|C–E♭–G–F|Major tonic with parallel-minor ♭III
I–♭VI–♭VII–I|C–A♭–B♭–C|Parallel-minor/modal cadence
I–♭VI–IV–I|C–A♭–F–C|Major tonic framed by minor-mode colors
I–♭VI–ii–V|C–A♭–Dm–G|Borrowed ♭VI leading into diatonic cadence
I–iv–V–I|C–Fm–G–C|Major tonic with parallel-minor subdominant
I–IV–iv–V|C–F–Fm–G|Major IV transformed into minor IV
I–vi–iv–V|C–Am–Fm–G|Relative minor followed by borrowed minor IV
I–iii–iv–V|C–Em–Fm–G|Minor mediant and borrowed minor IV
I–IV–♭III–V|C–F–E♭–G|Modal/minor ♭III between major functions
I–♭VII–iv–V|C–B♭–Fm–G|Mixolydian and minor-mode mixture
I–♭VI–iv–V|C–A♭–Fm–G|Parallel-minor predominant chain
I–♭III–iv–V|C–E♭–Fm–G|Minor-mode colors against major tonic
I–vi–IV–iv–I|C–Am–F–Fm–C|Relative minor followed by major-to-minor IV transformation
I–IV–iv–I|C–F–Fm–C|Classic parallel major/minor subdominant shift
I–vi–IV–♭VII|C–Am–F–B♭|Relative minor with Mixolydian ♭VII
I–iii–IV–iv|C–Em–F–Fm|Diatonic minor iii leading to modal minor IV
I–V–vi–♭VI|C–G–Am–A♭|Relative minor followed by chromatic/modal ♭VI
I–♭VII–IV–iv–I|C–B♭–F–Fm–C|Mixolydian and parallel-minor mixture
I–♭VI–♭VII–IV–I|C–A♭–B♭–F–C|Parallel-minor colors resolving through major IV
I–ii–IV–iv–I|C–Dm–F–Fm–C|Diatonic ii followed by transformed IV
I–vi–ii–iv–V|C–Am–Dm–Fm–G|Minor predominant sequence inside major tonality
I–iii–vi–iv–V|C–Em–Am–Fm–G|Three minor chords leading to dominant
I–IV–vi–iv–V|C–F–Am–Fm–G|Major IV and minor IV juxtaposed
I–♭VII–vi–IV–iv–I|C–B♭–Am–F–Fm–C|Extended modal major/minor interchange
i–♭III–♭VI–IV–i|Am–C–F–D–Am|Minor tonic surrounded by Dorian major IV
i–♭VII–IV–♭III–i|Am–G–D–C–Am|Dorian/modal minor-major cycle
i–♭VI–♭VII–IV–i|Am–F–G–D–Am|Aeolian-to-Dorian modal mixture
i–iv–♭III–IV–i|Am–Dm–C–D–Am|Minor tonic with alternating minor/major IV
I–vi–♭VII–IV–I|C–Am–B♭–F–C|Relative minor combined with Mixolydian ♭VII
I–iv–♭VII–I|C–Fm–B♭–C|Parallel-minor iv plus Mixolydian ♭VII
I–♭III–♭VII–IV–I|C–E♭–B♭–F–C|Major tonic surrounded by minor-mode and Mixolydian chords
I–♭VI–♭VII–IV–I|C–A♭–B♭–F–C|Parallel-minor/modal major cycle
I–IV–♭VII–iv–I|C–F–B♭–Fm–C|Major IV and Mixolydian ♭VII before minor iv
I–vi–♭VII–iv–V|C–Am–B♭–Fm–G|Relative minor and modal mixture before dominant
i–IV–♭VII–♭III–i|Am–D–G–C–Am|Dorian major IV combined with Aeolian colors
i–♭III–IV–♭VII–i|Am–C–D–G–Am|Dorian-style minor-major modal cycle
I–II–iii–IV–V–vi|C–D–Em–F–G–Am|Lydian-to-Ionian color across the diatonic collection
i–♭III–♭VII–IV–I|Am–C–G–D–C|Minor opening resolving into major tonic
I–vi–IV–♭VII–i|C–Am–F–B♭–Am|Major framework collapsing into relative minor
I–IV–iv–♭VII–I|C–F–Fm–B♭–C|Major/minor IV transformation with Mixolydian color
I–♭VI–♭VII–iv–I|C–A♭–B♭–Fm–C|Parallel-minor/modal sequence returning to major tonic`);
return { majorMinorCards };
});
})(window.TD = window.TD || {});
