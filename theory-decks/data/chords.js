(function (TD) {
'use strict';
TD.lazy('data/chords.js', () => {
const { parseFormula, spell, C } = TD['theory.js'];

// [name, symbol suffix, formula, description]
const TRIADS = [
  ['Major', '', '1–3–5', 'The bright, stable foundation of Western harmony. I, IV and V of a major key.'],
  ['Minor', 'm', '1–♭3–5', 'Darker and sadder. ii, iii and vi of a major key.'],
  ['Diminished', '°', '1–♭3–♭5', 'Two stacked minor 3rds. Tense and unstable — the vii° chord.'],
  ['Augmented', '+', '1–3–♯5', 'Two stacked major 3rds. Symmetrical, dreamy and unresolved.'],
  ['Suspended 2nd', 'sus2', '1–2–5', 'The 3rd is replaced by the 2nd — open, airy, neither major nor minor.'],
  ['Suspended 4th', 'sus4', '1–4–5', 'The 3rd is replaced by the 4th — wants to resolve down to major.'],
  ['Major ♭5', '(♭5)', '1–3–♭5', 'Major 3rd with a flattened 5th. A rootless dominant / Lydian color.'],
  ['Minor ♯5', 'm(♯5)', '1–♭3–♯5', 'Sounds like a major triad in 1st inversion. Used in line clichés.'],
  ['Diminished ♭3', '°(♭♭3)', '1–♭♭3–♭5', 'Rare, clustered: a whole step and a major 3rd. Mostly theoretical.'],
  ['Suspended ♭2', 'sus♭2', '1–♭2–5', 'Phrygian flavour — dark and Spanish sounding.'],
  ['Suspended ♯4', 'sus♯4', '1–♯4–5', 'Lydian suspension — bright and floating.'],
  ['Suspended 2 ♭5', 'sus2(♭5)', '1–2–♭5', 'Whole-tone fragment; ambiguous and modern.'],
  ['Quartal', 'quartal', '1–4–♭7', 'Stacked perfect 4ths. Modern jazz and fusion sound (So What).'],
  ['Quintal', 'quintal', '1–5–9', 'Stacked perfect 5ths. Wide, open and powerful.'],
  ['Shell Dominant 7', '7(no5)', '1–3–♭7', 'Root, 3rd and 7th — the essential jazz guitar dominant voicing.'],
  ['Shell Major 7', 'maj7(no5)', '1–3–7', 'Root, 3rd and major 7th — compact jazz voicing.'],
  ['Shell Minor 7', 'm7(no5)', '1–♭3–♭7', 'Root, ♭3 and ♭7 — the core of every minor 7 chord.'],
  ['Shell Major 6', '6(no5)', '1–3–6', 'Root, 3rd and 6th — swing and western-swing staple.'],
  ['Add 9 (no 3)', 'add9(no3)', '1–5–9', 'Power chord with a 9th on top — shimmering rock voicing.'],
  ['Power Chord + Octave', '5', '1–5–8', 'Root, 5th, octave. The rock and metal workhorse; no 3rd, so it works over major or minor.'],
];

const TETRADS = [
  ['Major 7', 'maj7', '1–3–5–7', 'Smooth, dreamy and jazzy. I and IV of a major key.'],
  ['Dominant 7', '7', '1–3–5–♭7', 'Bluesy tension that wants to resolve to I. The V7 chord.'],
  ['Minor 7', 'm7', '1–♭3–5–♭7', 'Mellow and soulful. ii, iii and vi in a major key.'],
  ['Minor Major 7', 'm(maj7)', '1–♭3–5–7', 'Mysterious, film-noir sound. Tonic of melodic/harmonic minor.'],
  ['Half-Diminished', 'm7♭5', '1–♭3–♭5–♭7', 'Minor 7 with ♭5. The vii chord of major and ii of minor ii–V–i.'],
  ['Diminished 7', '°7', '1–♭3–♭5–𝄫7', 'Stacked minor 3rds; symmetrical — any note can be the root. Passing chord.'],
  ['Augmented Major 7', 'maj7♯5', '1–3–♯5–7', 'Bright and unsettled. Tonic of Lydian augmented.'],
  ['Augmented 7', '7♯5', '1–3–♯5–♭7', 'Dominant with a raised 5th — pushes hard toward resolution.'],
  ['Dominant 7 ♭5', '7♭5', '1–3–♭5–♭7', 'Dominant with a ♭5; whole-tone flavour, tritone-sub friendly.'],
  ['Major 7 ♭5', 'maj7♭5', '1–3–♭5–7', 'Lydian-tinged major 7 — the ♭5 acts like a ♯11.'],
  ['Diminished Major 7', '°(maj7)', '1–♭3–♭5–7', 'Dark and dissonant; diminished triad with a major 7th.'],
  ['Minor Major 7 ♭5', 'm(maj7)♭5', '1–♭3–♭5–7', 'Same notes as °(maj7); spelled as a minor-major family chord.'],
  ['Dominant 7 sus4', '7sus4', '1–4–5–♭7', 'Suspended dominant — modern, modal and open.'],
  ['Dominant 7 sus2', '7sus2', '1–2–5–♭7', 'Airy dominant with no 3rd.'],
  ['Major 7 sus4', 'maj7sus4', '1–4–5–7', 'Suspended major 7 — ethereal and unresolved.'],
  ['Major 7 sus2', 'maj7sus2', '1–2–5–7', 'Open, shimmering major 7 without a 3rd.'],
  ['Major 6', '6', '1–3–5–6', 'Sweet, vintage major sound. Swing and surf staple.'],
  ['Minor 6', 'm6', '1–♭3–5–6', 'Dorian-flavoured minor; dark gypsy-jazz color.'],
  ['Minor ♭6', 'm(♭6)', '1–♭3–5–♭6', 'Aeolian minor with ♭6 — melancholic film-score sound.'],
  ['Add 9', 'add9', '1–3–5–9', 'Major triad plus 9th — bright, modern pop-rock sound.'],
  ['Minor Add 9', 'madd9', '1–♭3–5–9', 'Minor triad plus 9th — lush and emotional.'],
  ['Add 11', 'add11', '1–3–5–11', 'Major triad with a 4th on top — open and ringing.'],
  ['Minor Add 11', 'madd11', '1–♭3–5–11', 'Minor triad with 11th — open, modern minor.'],
  ['Add ♯11', 'add♯11', '1–3–5–♯11', 'Major triad with ♯11 — Lydian sparkle.'],
  ['6 sus4', '6sus4', '1–4–5–6', 'Suspended 6 chord — pastoral and open.'],
  ['6/9 (no 5)', '6/9(no5)', '1–3–6–9', 'Jazz and bossa voicing — warm and unresolved.'],
  ['Minor 6/9 (no 5)', 'm6/9(no5)', '1–♭3–6–9', 'Dorian-colored jazz minor voicing.'],
  ['Dominant 7♭9 (no 5)', '7♭9(no5)', '1–3–♭7–♭9', 'Dark dominant tension — resolves strongly to minor.'],
  ['Dominant 7♯9 (no 5)', '7♯9(no5)', '1–3–♭7–♯9', 'The "Hendrix chord" — major and minor 3rd clash.'],
  ['Dominant 9 (no 5)', '9(no5)', '1–3–♭7–9', 'Funky, soulful dominant — James Brown voicing.'],
  ['Minor 9 (no 5)', 'm9(no5)', '1–♭3–♭7–9', 'Smooth neo-soul minor sound.'],
  ['Major 9 (no 5)', 'maj9(no5)', '1–3–7–9', 'Lush, dreamy major voicing.'],
  ['Augmented Add 9', '+add9', '1–3–♯5–9', 'Whole-tone flavoured augmented color.'],
  ['Diminished Add 9', '°add9', '1–♭3–♭5–9', 'Diminished triad with a 9th — tense and cinematic.'],
];

const MAP = { '𝄫7': '♭♭7' };
const toCard = (kind) => ([name, sym, formula, desc]) => {
  const degs = parseFormula(formula.split('–').map(t => MAP[t] || t).join('–'));
  return {
    title: name, sub: formula,
    rows: [['Symbol (in C)', 'C' + sym], ['Notes in C', degs.map(d => spell(C, d)).join(' ')], ['Tones', kind]],
    desc,
    allKeysLabel: name + ' in all 12 keys',
    transpose: (r) => ({ k: r.name + sym, v: degs.map(d => spell(r, d)).join(' ') }),
  };
};

const INV_NAMES = ['Root position', '1st inversion', '2nd inversion', '3rd inversion'];
function withInversions(list, kind, count) {
  const cards = list.map(item => ({ ...toCard(kind)(item), group: INV_NAMES[0] }));
  for (let inv = 1; inv <= count; inv++) {
    list.forEach(([name, sym, formula, desc]) => {
      const toks = formula.split('–').map(t => MAP[t] || t);
      const order = [...toks.slice(inv), ...toks.slice(0, inv)];
      const degs = parseFormula(order.join('–'));
      const bass = order[0];
      cards.push({
        title: name + ' / ' + bass, sub: order.join('–'), group: INV_NAMES[inv],
        rows: [['Symbol (in C)', 'C' + sym + '/' + spell(C, degs[0])], ['Notes in C', degs.map(d => spell(C, d)).join(' ')], ['Tones', kind], ['Bass', bass + ' (' + INV_NAMES[inv] + ')']],
        desc: INV_NAMES[inv] + ' — the ' + bass + ' is in the bass. ' + desc,
        allKeysLabel: name + ' / ' + bass + ' in all 12 keys',
        transpose: (r) => ({ k: r.name + sym + '/' + spell(r, degs[0]), v: degs.map(d => spell(r, d)).join(' ') }),
      });
    });
  }
  return cards;
}

const triadCards = withInversions(TRIADS, '3', 2);
const tetradCards = withInversions(TETRADS, '4', 3);
return { TRIADS, TETRADS, triadCards, tetradCards };
});
})(window.TD = window.TD || {});
