(function (TD) {
'use strict';
TD.lazy('data/deceptive.js', () => {
const { progressionCards } = TD['data/progressions.js'];

const deceptiveCards = progressionCards(`Major–IV–Minor IV|C–F–Fm|Classic borrowed iv shift creating immediate instability
I–IV–iv–I|C–F–Fm–C|Major tonic destabilized by minor IV before returning
I–iv–V|C–Fm–G|Borrowed minor IV creates tension before dominant
I–IV–♭VII|C–F–B♭|Major tonic moving outside the diatonic scale
I–♭VII–IV|C–B♭–F|Mixolydian-colored movement without firm resolution
I–♭VI–V|C–A♭–G|Chromatic minor-color descent toward dominant
I–♭VI–♭VII–V|C–A♭–B♭–G|Expanding borrowed-chord tension
I–♭III–IV–V|C–E♭–F–G|Minor-mode color inserted into major harmony
I–III–IV–iv|C–E–F–Fm|Chromatic major-third rise followed by minor-IV destabilization
I–III–vi–iv|C–E–Am–Fm|Chromatic major III leading into borrowed minor IV
I–V–IV–iv|C–G–F–Fm|Dominant release followed by sudden modal shift
I–V–♭VI–V|C–G–A♭–G|Chromatic upper-neighbor motion around the dominant
I–IV–♭VI–V|C–F–A♭–G|Borrowed ♭VI interrupts diatonic movement
I–IV–♭VII–iv|C–F–B♭–Fm|Multiple modal colors before minor IV
I–vi–IV–iv|C–Am–F–Fm|Familiar progression destabilized by borrowed iv
I–vi–ii–♭II|C–Am–Dm–D♭|Chromatic Neapolitan-like interruption
I–ii–♭II–V|C–Dm–D♭–G|Chromatic descent into dominant
I–♭II–V|C–D♭–G|Tritone-rich chromatic tension around the dominant
I–♭II–I|C–D♭–C|Chromatic upper-neighbor tension
I–♭III–I|C–E♭–C|Major/minor color shift without functional resolution
I–III–♭III–ii|C–E–E♭–Dm|Descending chromatic third movement
I–IV–♯IV–V|C–F–F♯–G|Chromatic passing harmony between IV and V
I–IV–♯IV–iv|C–F–F♯–Fm|Chromatic approach intensifying the minor-IV change
I–V–♭VI–IV|C–G–A♭–F|Dominant destabilized by chromatic mediant motion
I–♭VI–IV–V|C–A♭–F–G|Borrowed ♭VI gives a darker harmonic turn
I–♭VI–iv–V|C–A♭–Fm–G|Multiple minor-mode colors leading to dominant
I–♭VII–♭VI–V|C–B♭–A♭–G|Chromatic descending bass-like motion
I–♭VII–VI–V|C–B♭–A–G|Chromatic/modal mixture around the descent
I–VI–♭VI–V|C–A–A♭–G|Chromatic descending root motion
I–vi–♭VI–V|C–Am–A♭–G|Minor vi followed by chromatic ♭VI
I–IV–ii–iv|C–F–Dm–Fm|Alternation between major and minor predominant colors
I–ii–IV–iv|C–Dm–F–Fm|Diatonic expansion ending with borrowed minor IV
I–vi–IV–♭VI|C–Am–F–A♭|Abrupt chromatic mediant shift
I–vi–♭VI–IV|C–Am–A♭–F|Descending bass with borrowed harmony
I–iii–IV–iv|C–Em–F–Fm|Parallel major/minor transformation at IV
I–iii–♭III–ii|C–Em–E♭–Dm|Chromatic descending inner movement
I–V–iii–♭III|C–G–Em–E♭|Chromatic major/minor-third relationship
I–V–♭VI–♭VII|C–G–A♭–B♭|Dominant followed by modal expansion
I–♭VII–IV–♭VI|C–B♭–F–A♭|Non-diatonic modal sequence
I–IV–♭III–V|C–F–E♭–G|Borrowed ♭III interrupts predominant-to-dominant motion
I–♭III–♭VI–V|C–E♭–A♭–G|Strong minor-mode coloration
I–♭III–IV–iv|C–E♭–F–Fm|Modal mixture culminating in borrowed iv
I–♭VI–♭VII–I|C–A♭–B♭–C|Backdoor/modal return to tonic
I–♭VII–iv–I|C–B♭–Fm–C|Minor predominant inserted into modal harmony
I–iv–♭VI–V|C–Fm–A♭–G|Borrowed minor IV followed by dark predominant
I–iv–♭VII–V|C–Fm–B♭–G|Minor IV with modal dominant preparation
I–IV–iv–♭VII|C–F–Fm–B♭|Classic destabilization extended into modal harmony
I–IV–iv–♭VI|C–F–Fm–A♭|Major-to-minor parallel shift followed by ♭VI
I–IV–iv–ii|C–F–Fm–Dm|Minor IV turns a stable progression inward
I–IV–iv–V|C–F–Fm–G|Strong borrowed-iv dominant cadence
I–IV–♭VI–iv|C–F–A♭–Fm|Two successive borrowed minor-mode colors
I–ii–♭VI–V|C–Dm–A♭–G|Unexpected chromatic predominant substitution
I–ii–iv–V|C–Dm–Fm–G|Diatonic ii transformed into darker minor predominant
I–iii–iv–V|C–Em–Fm–G|Chromatic mediant followed by minor predominant
I–iii–IV–♭VI|C–Em–F–A♭|Chromatic mediant shift between diatonic chords
I–V–vi–♭VI|C–G–Am–A♭|Descending chromatic shift from vi
I–V–IV–♭VI|C–G–F–A♭|Dominant-to-predominant followed by borrowed ♭VI
I–vi–IV–♭VII|C–Am–F–B♭|Familiar vi–IV disrupted by modal ♭VII
I–vi–iv–V|C–Am–Fm–G|Minor IV replaces expected IV
I–vi–♭VI–iv|C–Am–A♭–Fm|Descending chromatic/modal sequence
I–IV–V–iv|C–F–G–Fm|Dominant appears before a destabilizing minor IV
I–V–IV–iv–I|C–G–F–Fm–C|Classic unstable detour that eventually returns home
I–IV–iv–I–♭VII|C–F–Fm–C–B♭|Borrowed iv followed by modal expansion
I–IV–iv–I–♭VI|C–F–Fm–C–A♭|Minor IV followed by borrowed ♭VI
I–♭VI–V–iv|C–A♭–G–Fm|Dark descending dominant cycle
I–♭VII–IV–iv–V|C–B♭–F–Fm–G|Modal opening with borrowed minor-IV cadence
I–♭III–♭VII–IV|C–E♭–B♭–F|Rock/modal progression without strong functional closure
I–♭VII–♭VI–iv|C–B♭–A♭–Fm|Descending modal sequence into minor IV
I–♭VI–♭VII–iv|C–A♭–B♭–Fm|Minor-mode harmonic colors against major tonic
I–♭III–♭VI–♭VII|C–E♭–A♭–B♭|Parallel minor colors surrounding major tonic
I–VI–ii–♭II|C–A–Dm–D♭|Chromatic bass movement toward dominant territory
I–III–vi–♭VI|C–E–Am–A♭|Chromatic third-related descent
I–iii–♭III–vi|C–Em–E♭–Am|Major/minor parallel shift between mediants
I–V–♭VII–♭VI|C–G–B♭–A♭|Dominant followed by descending modal colors
I–IV–♯IV–V–iv|C–F–F♯–G–Fm|Chromatic ascent into dominant then minor-IV shock
I–V–♭VI–iv–V|C–G–A♭–Fm–G|Chromatic predominant chain into dominant
I–vi–♭VI–V–iv|C–Am–A♭–G–Fm|Descending chromatic movement with borrowed iv
I–IV–♭VII–♭VI–V|C–F–B♭–A♭–G|Large modal detour resolving through dominant
I–♭VI–IV–iv–V|C–A♭–F–Fm–G|Borrowed ♭VI and iv frame the dominant
I–♭III–IV–♭VI–V|C–E♭–F–A♭–G|Mixed modal and chromatic predominant movement
I–V–♭VI–♭VII–iv|C–G–A♭–B♭–Fm|Dominant followed by modal expansion
I–IV–♭III–♭VI–V|C–F–E♭–A♭–G|Non-diatonic descending color before dominant
I–♭VII–IV–♭VI–V|C–B♭–F–A♭–G|Modal mixture surrounding dominant preparation
I–vi–IV–Fm–G|C–Am–F–Fm–G|Familiar progression destabilized before dominant
I–V–vi–IV–iv|C–G–Am–F–Fm|Familiar pop cycle transformed at the end
I–vi–IV–iv–V|C–Am–F–Fm–G|Strong major/minor IV contrast before dominant
I–IV–I–iv–V|C–F–C–Fm–G|Tonic restatement followed by borrowed iv
I–V–I–iv–V|C–G–C–Fm–G|Stable tonic/dominant motion interrupted by iv
I–IV–iv–I–V|C–F–Fm–C–G|Classic borrowed-chord detour followed by dominant
I–vi–IV–iv–I|C–Am–F–Fm–C|Major progression collapses briefly into minor
I–♭VI–IV–iv–I|C–A♭–F–Fm–C|Multiple borrowed chords resolve back to tonic
I–♭VII–♭VI–iv–V|C–B♭–A♭–Fm–G|Descending modal sequence into dominant
I–♭III–♭VI–iv–V|C–E♭–A♭–Fm–G|Strong parallel-minor coloration before V
I–III–♭III–IV–iv|C–E–E♭–F–Fm|Chromatic mediant descent into major/minor IV
I–VI–♭VI–V–iv|C–A–A♭–G–Fm|Chromatic descending line with minor-IV extension
I–♭II–I–IV–iv|C–D♭–C–F–Fm|Chromatic upper-neighbor tonic followed by modal mixture
I–IV–♯IV–V–♭VI|C–F–F♯–G–A♭|Chromatic cluster around IV–V
I–V–♭VI–V–IV–iv|C–G–A♭–G–F–Fm|Oscillating dominant/♭VI followed by major/minor IV
I–IV–iv–♭VI–V|C–F–Fm–A♭–G|Major/minor IV transformation followed by borrowed ♭VI
I–IV–iv–♭VI–♭VII–V|C–F–Fm–A♭–B♭–G|Extended unstable modal progression culminating in dominant`);
return { deceptiveCards };
});
})(window.TD = window.TD || {});
