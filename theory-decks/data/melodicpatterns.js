(function (TD) {
'use strict';
TD.lazy('data/melodicpatterns.js', () => {
const { parseFormula, spell, C } = TD['theory.js'];

const RAW = `# Linear
Four-note ascent|1–2–3–4|Play a four-note slice of the scale upward, then continue from a new starting degree.
Four-note descent|4–3–2–1|Play a four-note slice downward with even articulation.
Octave ascent|1–2–3–4–5–6–7–8|Connect the scale degrees through the octave.
Octave descent|8–7–6–5–4–3–2–1|Return through the scale in one continuous line.
Three-note ascent|1–2–3–4–5–6|Play overlapping groups of three notes across the scale.
Three-note descent|6–5–4–3–2–1|Reverse the overlapping three-note groups.
# Sequences
Thirds ascending|1–3–2–4–3–5–4–6|Move through the scale in alternating thirds.
Thirds descending|6–4–5–3–4–2–3–1|Descend through alternating scale thirds.
Four-note sequence|1–2–3–4–2–3–4–5|Repeat a four-note cell one scale step higher.
Three-note sequence|1–2–3–2–3–4–3–4–5|Repeat a three-note cell through the scale.
Ascending 1-3 sequence|1–3–2–4–3–5–4–6–5–7|Shift a 1-3 shape up one scale degree each time.
Descending 1-3 sequence|7–5–6–4–5–3–4–2–3–1|Repeat descending thirds in a connected line.
# Arpeggios
Major triad arpeggio|1–3–5–8–5–3–1|Outline the tonic major triad across an octave.
Minor triad arpeggio|1–♭3–5–8–5–♭3–1|Outline a tonic minor triad across an octave.
Dominant seventh arpeggio|1–3–5–♭7–8–♭7–5–3–1|Connect the chord tones of a dominant seventh.
Major seventh arpeggio|1–3–5–7–8–7–5–3–1|Connect the chord tones of a major seventh.
Minor seventh arpeggio|1–♭3–5–♭7–8–♭7–5–♭3–1|Connect the chord tones of a minor seventh.
Broken triad|1–5–3–8–5–3–1|Alternate chord tones instead of playing the triad in stepwise order.
# Motifs
Neighbor turn|1–2–1–7–1|Circle the tonic with upper and lower neighboring notes.
Upper neighbor|3–4–3–2|Touch the next scale tone and resolve back through the third.
Lower neighbor|3–2–3–5|Resolve a lower neighboring note into a stable chord tone.
Tonic turnaround|5–7–1–3–2–1|Lead from the dominant through the tonic triad.
Pentatonic call|1–♭3–4–5–♭7–5–4–1|Shape a compact minor-pentatonic phrase.
Blues curl|1–♭3–4–♭5–5–♭7–5–1|Lean into the blue fifth before resolving to the root.
Six-note ascent|1–2–3–5–4–6|Use a skip to create a wider, less scalar contour.
Six-note descent|6–4–5–3–2–1|Combine descending skips with a stepwise landing.
Octave leap motif|1–8–5–3–1|Use an octave leap to open a short tonic arpeggio.
# Longer Lines
Five-note ascent|1–2–3–4–5|Extend the scale run through a complete five-note cell.
Five-note descent|5–4–3–2–1|Reverse a five-note scale cell with a relaxed return.
Root pedal rise|1–2–1–3–1–4–1–5|Return to the tonic between each ascending scale degree.
Root pedal fall|1–5–1–4–1–3–1–2|Return to the tonic between descending scale degrees.
Step-skip ascent|1–2–4–3–5–4–6–5–7|Mix steps and skips to create a rising contour.
Down-up cascade|5–4–3–4–3–2–3–2–1|Repeat a small turn while descending the scale.
Full octave cascade|1–2–3–4–5–6–7–8–7–6–5–4–3–2–1|Ascend through the octave, then retrace the scale.
Tonic pentachord|1–2–3–4–5–3–1|Open with a five-note ascent and resolve through the triad.
Fifth to octave|5–6–7–8–7–5–3–1|Shape an upper-register rise into a tonic resolution.
# Interval Leaps
Thirds and fourths|1–3–2–5–3–6–4–8|Alternate thirds with wider fourth-degree skips.
Fourth-step ladder|1–4–2–5–3–6–4–7|Move upward in a repeated fourth-and-step contour.
Fifths and steps|1–5–2–6–3–7–4–8|Pair each scale degree with a fifth above.
Descending leap chain|8–6–7–5–6–4–5–3|Connect descending skips with stepwise links.
Wide arpeggio weave|1–3–6–5–2–4–7–6|Outline changing triad tones through a wide contour.
Triad leap turn|1–4–3–6–5–8–7–5|Leap to each new chord tone, then approach the octave.
Fifth displacement|5–1–6–2–7–3–8–4|Shift the same wide interval shape up the scale.
Broken seventh leap|1–5–3–7–5–2–8–5|Mix chord-tone skips with a descending resolution.
Mixed skips|1–6–3–5–2–7–4–8|Practice large changes in direction across the octave.
# Pentatonic Lines
Minor pentatonic rise|1–♭3–4–5–♭7–8|Ascend through the minor pentatonic collection to the octave.
Minor pentatonic fall|8–♭7–5–4–♭3–1|Descend through minor pentatonic chord colors.
Pentatonic turn|1–5–♭7–5–4–♭3–1|Rise to the flat seventh and curl back to the tonic.
Minor triad phrase|1–♭3–5–4–♭3–1|Outline a minor triad with a neighboring fourth.
Flat-seven turnaround|5–♭7–1–♭3–4–♭3–1|Use the flat seventh as a pickup into a minor phrase.
Blues pentatonic line|1–2–♭3–5–4–♭3–2–1|Blend a passing second into a minor-pentatonic descent.
Major pentatonic rise|1–2–3–5–6–8|Outline the major pentatonic scale through the octave.
Major pentatonic fall|8–6–5–3–2–1|Return through the major pentatonic tones.
Major sixth turn|1–5–6–5–3–2–1|Emphasize the bright sixth before resolving home.
# Chromatic Color
Chromatic lower approach|1–♭2–2–♭3–3–4|Move through adjacent chromatic colors into the fourth.
Descending chromatic approach|3–♭3–2–♭2–1|Resolve a chromatic descent onto the tonic.
Leading-tone approach|5–♯4–5–♭7–7–1|Approach the tonic from both the fifth and leading tone.
Chromatic bass contour|1–♭7–6–♭6–5|Create a descending chromatic-color line.
Raised tonic pickup|1–♯1–2–3–2–1|Use a raised tonic as a brief approach to the second degree.
Chromatic upper climb|4–♯4–5–♯5–6|Connect the fourth and sixth with chromatic passing tones.
Minor-major third turn|1–♭3–3–4–♯4–5|Contrast minor and major thirds before rising to the fifth.
Leading-tone neighbor|♭7–7–1–♭2–2|Resolve into the tonic, then continue upward.
Tritone color turn|3–4–♯4–5–♭6–6|Surround the fifth with chromatic neighbors.
# Sequence Variations
Three-note repeat|1–2–3–1–2–3–4–2|Repeat a three-note fragment, extending the second cell.
Four-note repeat|1–2–3–4–1–2–3–5|Repeat a four-note cell with a changing final note.
Ascending thirds sequence|1–3–2–4–3–5–4–6–5–7|Shift a rising third-based cell through the scale.
Alternating fourth sequence|1–4–2–5–3–6–4–7|Repeat the same interval contour from each new degree.
Offset skip sequence|1–2–4–2–3–5–3–4–6|Move a skipped-note cell through adjacent positions.
Descending cell sequence|3–2–1–4–3–2–5–4–3|Repeat a descending three-note cell from higher degrees.
Ascending triad sequence|1–3–5–2–4–6–3–5–7|Arpeggiate each scale degree as a moving triad fragment.
Descending triad sequence|7–5–3–6–4–2–5–3–1|Repeat triad fragments while moving down the scale.
Step-and-third sequence|1–2–1–3–2–4–3–5–4–6|Join stepwise turns into a rising sequence.
# Contour Studies
Wave ascent|1–3–2–5–4–6–5–8|Rise in waves before landing on the octave.
Wave descent|8–6–7–5–6–4–5–3|Descend with a short upward rebound at each turn.
Alternating contour|1–4–5–2–3–6–7–4|Alternate upward and downward skips across the scale.
Descending answer|5–3–4–2–3–1–2–7|Answer a rising phrase with a falling, tonic-directed line.
Tonic orbit|1–7–5–6–4–5–3–1|Circle the tonic through its surrounding chord tones.
Broken resolution|1–5–4–2–3–7–1|Resolve from a wide fifth through the leading tone.
Upper-register turn|3–5–4–6–5–7–8–5|Build toward the octave, then fall back to the fifth.
Octave return|8–5–6–4–5–3–2–1|Descend from the octave with a final stepwise landing.
Full-scale contour|1–2–5–3–6–4–7–8|Reach each scale region with alternating skips.
`;

let group = '';
const melodicPatternCards = [];
for (const line of RAW.split('\n')) {
  if (!line) continue;
  if (line.startsWith('# ')) { group = line.slice(2); continue; }
  const [title, formula, desc] = line.split('|');
  const degrees = parseFormula(formula);
  const notes = degrees.map(degree => spell(C, degree));
  melodicPatternCards.push({
    title,
    sub: formula,
    group,
    rows: [['Degrees', formula], ['Notes in C', notes.join(' ')], ['Note count', String(notes.length)]],
    desc,
    allKeysLabel: title + ' in all 12 keys',
    transpose: (root) => degrees.map(degree => spell(root, degree)).join(' '),
  });
}
// Retrograde (reversed) and inverted (mirrored) versions of every pattern
const BASE_PATTERNS = melodicPatternCards.slice();
const tokOf = (d) => (d.acc > 0 ? '♯'.repeat(d.acc) : '♭'.repeat(-d.acc)) + d.n;
function addVariant(card, suffix, degrees, how) {
  const formula = degrees.map(tokOf).join('–');
  const parsed = parseFormula(formula);
  const notes = parsed.map(degree => spell(C, degree));
  melodicPatternCards.push({
    title: card.title + ' · ' + suffix,
    sub: formula,
    group: card.group,
    rows: [['Degrees', formula], ['Notes in C', notes.join(' ')], ['Note count', String(notes.length)], ['Variant', suffix + ' of ' + card.title]],
    desc: how + ' ' + card.desc,
    allKeysLabel: card.title + ' · ' + suffix + ' in all 12 keys',
    transpose: (root) => parsed.map(degree => spell(root, degree)).join(' '),
  });
}
BASE_PATTERNS.forEach(card => {
  const degs = parseFormula(card.sub);
  addVariant(card, 'Retrograde', degs.slice().reverse(), 'Play the original pattern backwards.');
  const pivot = degs[0].n;
  let mirrored = degs.map(d => ({ n: 2 * pivot - d.n, acc: -d.acc }));
  const low = Math.min(...mirrored.map(d => d.n));
  if (low < 1) { const shift = Math.ceil((1 - low) / 7) * 7; mirrored = mirrored.map(d => ({ n: d.n + shift, acc: d.acc })); }
  addVariant(card, 'Inversion', mirrored, 'Mirror every step of the original — up becomes down.');
});
return { melodicPatternCards };
});
})(window.TD = window.TD || {});
