/**
 * Music Theory Descriptions Extension
 * Contains textual descriptions for scales, chords, and intervals.
 */

// Analyze the formula, not the title: numeric entries and aliases share the same musical content.
MusicTheory.prototype.getScaleDescription = (() => {
    const signatures = {
        '0,2,4,5,7,9,11': ['Ionian / major', 'The major third, natural sixth and leading-tone seventh establish the familiar major-key framework. The fourth can pull toward the third over a tonic major chord.'],
        '0,2,3,5,7,9,10': ['Dorian', 'The minor third and minor seventh establish minor color, while the natural sixth distinguishes it from natural minor. Emphasize that sixth over a minor-seventh vamp to make the modal identity audible.'],
        '0,1,3,5,7,8,10': ['Phrygian', 'The flat second sits a semitone above the tonic, giving this minor mode its distinctive upper-neighbor tension. A tonic pedal makes the b2-to-root gesture especially clear.'],
        '0,2,4,6,7,9,11': ['Lydian', 'The raised fourth distinguishes this major mode from Ionian. It creates a floating #11 color over a major or major-seventh chord while retaining the perfect fifth.'],
        '0,2,4,5,7,9,10': ['Mixolydian', 'The major third and minor seventh outline dominant harmony, but the missing leading tone also allows a stable modal tonic. Useful over dominant-seventh vamps; the fourth may rub against a sustained major third.'],
        '0,2,3,5,7,8,10': ['Aeolian / natural minor', 'The minor third, flat sixth and minor seventh create natural-minor color without a leading tone. Contrast b6 with the perfect fifth to distinguish it from Dorian.'],
        '0,1,3,5,6,8,10': ['Locrian', 'The diminished fifth prevents a conventional perfect-fifth tonic anchor. The root, minor third, diminished fifth and minor seventh outline a half-diminished chord; b2 supplies an additional close tension.'],
        '0,2,3,5,7,8,11': ['harmonic minor', 'Raising the seventh of natural minor supplies a leading tone and allows a major dominant chord. The three-semitone gap from b6 to 7 gives melodies a distinctive leap.'],
        '0,2,3,5,7,9,11': ['melodic minor (ascending / jazz form)', 'A minor third combines with a natural sixth and major seventh. It supports minor-major-seventh and minor-sixth colors. This fixed form does not model the classical convention of descending as natural minor.'],
        '0,2,4,5,7,8,11': ['harmonic major', 'The flat sixth darkens an otherwise major framework and forms a three-semitone gap to the leading tone. It allows minor-subdominant color alongside a major tonic.'],
        '0,2,3,5,7,9,10,11': ['melodic-minor / Dorian chromatic extension', 'Both minor and major sevenths are present, so the seventh can act as a chromatic line rather than a single fixed modal degree.'],
        '0,2,4,7,9': ['major pentatonic', 'Omitting the fourth and seventh removes the semitone steps of the major scale. The major triad remains, with second and sixth available as open melodic colors.'],
        '0,3,5,7,10': ['minor pentatonic', 'The minor triad is framed by fourth and minor seventh, with no second or sixth. Its larger gaps suit riffs, call-and-response phrases and minor-key improvisation.'],
        '0,3,5,6,7,10': ['minor blues', 'The pitch between fourth and fifth adds chromatic friction to minor pentatonic. Treat it as an expressive passing tone or deliberate tension; equal-tempered pitches do not capture every blues inflection.'],
        '0,2,3,4,7,9': ['major blues', 'Adding a minor third to major pentatonic creates a chromatic route from second through minor third to major third. The contrast between the two thirds is central to its sound.'],
        '0,2,4,6,8,10': ['whole tone', 'Equal whole steps remove semitone leading tones and the perfect fifth. The major third, augmented fifth and minor seventh suit augmented-dominant color, with a deliberately weak tonal center.'],
        '0,2,3,5,6,8,9,11': ['whole–half diminished', 'Alternating whole and half steps contains the diminished-seventh arpeggio 0–3–6–9. It offers symmetric passing lines over diminished-seventh harmony.'],
        '0,1,3,4,6,7,9,10': ['half–whole diminished', 'Alternating half and whole steps includes a dominant seventh plus b9, #9, #11 and 13 pitch colors. It is useful over dominant harmony when those tensions fit the voicing.'],
        '0,1,3,4,6,8,10': ['altered / super Locrian', 'This melodic-minor mode contains dominant guide-tone pitches together with b9, #9, b5 and #5 colors, but no perfect fifth. Its fourth pitch may be spelled b4 modally while sounding as the dominant major third.'],
        '0,2,4,6,7,9,10': ['Lydian dominant', 'A major third and minor seventh outline dominant harmony while the raised fourth adds #11 color. Unlike the altered scale, it retains a natural ninth, perfect fifth and natural thirteenth.'],
        '0,2,4,5,7,8,10': ['Mixolydian b6', 'The major third and minor seventh support a dominant chord, while b6 supplies a darker b13 color. It is the fifth mode of melodic minor and can color a dominant resolving to minor.'],
        '0,2,3,5,6,8,10': ['Locrian natural 2', 'The minor third, diminished fifth and minor seventh outline half-diminished harmony. A natural second replaces the close b2 tension of ordinary Locrian.'],
        '0,1,4,5,7,8,11': ['double harmonic major', 'A major third is framed by b2 and b6, producing two three-semitone gaps. The perfect fifth and major seventh provide anchors, while b2 gives a strong upper-neighbor tension.'],
        '0,2,3,6,7,8,11': ['Hungarian minor', 'The raised fourth adds a tritone to the harmonic-minor framework. Three-semitone gaps from b3 to #4 and b6 to 7 contrast with close semitone approaches to the fifth and tonic.'],
        '0,1,4,5,7,8,10': ['Phrygian dominant', 'The b2 and major third create a three-semitone opening gesture, while the minor seventh supports dominant harmony. As the fifth mode of harmonic minor, it can color V7 resolving to a minor tonic.'],
        '0,2,3,7,8': ['Hirajoshi-form pentatonic', 'The minor third and flat sixth are separated by wide gaps around the perfect fifth. The sparse pattern alternates close steps with leaps, leaving space for sustained tones and ornament.'],
        '0,1,5,7,10': ['In Sen-form pentatonic', 'There is no major or minor third. The b2 gives a close tonic tension while fourth, fifth and minor seventh create an open, suspended framework.'],
        '0,2,5,7,9': ['Ritusen / Yo-form pentatonic', 'The absence of either third leaves major/minor quality open. Second, fourth, fifth and sixth create a spacious, semitone-free melodic framework.'],
        '0,3,4,7,8,11': ['augmented hexatonic', 'Alternating three-semitone and semitone steps interlocks augmented triads. Major and minor thirds coexist, enabling symmetric chromatic movement rather than an ordinary diatonic tonic.']
    };
    const natural = [0,2,4,5,7,9,11];
    function pitch(iv) {
        const match = String(iv).match(/^([b#]*)([1-9][0-9]*)$/);
        if (!match) return null;
        const accidental = [...match[1]].reduce((sum, ch) => sum + (ch === '#' ? 1 : -1), 0);
        return ((natural[(Number(match[2])-1)%7] + accidental) % 12 + 12) % 12;
    }
    return function(scaleId) {
        const scale = this.scales[scaleId];
        if (!scale) return 'No scale formula is available for this entry.';
        const notes = [...new Set(scale.intervals.map(pitch).filter(n => n !== null))].sort((a,b) => a-b);
        if (!notes.length) return 'This entry has no valid interval formula to analyze.';
        const has = n => notes.includes(n);
        const n = notes.length;
        const parts = [];
        if (scale.parentScale && scale.mode) {
            const parent = this.scales[scale.parentScale];
            parts.push('Mode ' + scale.mode + ' of ' + (parent ? parent.name : scale.parentScale.replace(/_/g, ' ')) + ': the parent pitch pattern is rotated and measured from this mode’s own tonic.');
        }
        if (n === 1) return parts.concat('A single tonic pitch, not a multi-note scale. Use it as a drone or repeated-note study; melody and chord quality must come from rhythm, register or accompanying voices.').join(' ');
        if (n === 2) {
            const distance = (notes[1]-notes[0]+12)%12;
            const names = ['', 'minor second','major second','minor third','major third','perfect fourth','tritone','perfect fifth','minor sixth','major sixth','minor seventh','major seventh'];
            return parts.concat('A two-pitch interval study spanning a ' + names[distance] + ', rather than a conventional scale. Alternate the tones over a root drone to hear their tension and release; two pitches alone do not determine a complete chord or key.').join(' ');
        }
        if (n === 12) return parts.concat('The chromatic scale contains all twelve equal-tempered pitch classes, with semitone motion throughout. It has no exclusive major or minor identity and no pitch-class change under transposition. Use chromatic approach tones to connect chosen chord tones; rhythm, emphasis and resolution establish the tonal center.').join(' ');
        const known = signatures[notes.join(',')];
        if (known) parts.push('Its pitch pattern matches ' + known[0] + '. ' + known[1]);
        else {
            const kind = ({3:'three-tone',4:'tetratonic',5:'pentatonic',6:'hexatonic',7:'heptatonic',8:'octatonic',9:'nine-tone',10:'ten-tone',11:'eleven-tone'})[n];
            parts.push('A ' + kind + ' pattern with ' + (has(3) && has(4) ? 'both minor- and major-third pitches, allowing contrasting third colors rather than one fixed major/minor identity.' : has(4) ? 'a major-third anchor.' : has(3) ? 'a minor-third anchor.' : 'no major or minor third, leaving its tonal quality open.'));
            if (has(1)) parts.push('The b2 pitch lies a semitone above the tonic, creating a close upper-neighbor tension.');
            if (has(6)) parts.push(has(7) ? 'The tritone pitch coexists with the perfect fifth, allowing a chromatic approach to that stable fifth.' : 'A tritone above the tonic replaces the usual perfect-fifth anchor, making sustained tonic harmony less settled.');
            if (has(8) && !has(9)) parts.push('The flat-sixth pitch adds a darker upper color' + (has(7) ? ' and can fall by semitone to the perfect fifth.' : '.'));
            if (has(9) && has(3) && !has(4) && !has(8)) parts.push('The natural sixth brightens the minor-third color, suggesting a Dorian-like contrast rather than natural minor.');
            if (has(10) && has(11)) parts.push('Both seventh pitches are present, allowing chromatic movement toward the tonic rather than a single fixed seventh degree.');
            else if (has(11)) parts.push('The major-seventh pitch approaches the tonic by semitone, supplying a possible leading-tone resolution.');
            else if (has(10)) parts.push('The minor seventh leaves a whole-step approach to the tonic instead of a semitone leading tone.');
        }
        const steps = notes.map((note,i) => ((notes[(i+1)%n]-note+12)%12));
        parts.push('Ascending steps, including the return to the octave: ' + steps.join('–') + ' semitones.');
        if (!steps.includes(1)) parts.push('There are no adjacent semitone steps, so phrases can emphasize open intervals rather than close chromatic pulls.');
        if (Math.max(...steps) >= 3) parts.push('The larger gaps encourage leaps and separated melodic cells instead of uniformly stepwise lines.');
        const symmetries = Array.from({length:11},(_,i)=>i+1).filter(shift => notes.every(note => has((note+shift)%12)));
        if (symmetries.length) parts.push('The pitch set repeats under transposition by ' + symmetries.join(', ') + ' semitones, giving it a symmetric structure with more than one possible tonal anchor.');
        if (!known) {
            const supports = [];
            if (has(0) && has(4) && has(7) && has(10)) supports.push('dominant seventh');
            else if (has(0) && has(4) && has(7) && has(11)) supports.push('major seventh');
            else if (has(0) && has(4) && has(7)) supports.push('major triad');
            if (has(0) && has(3) && has(7) && has(11)) supports.push('minor-major seventh');
            else if (has(0) && has(3) && has(7) && has(10)) supports.push('minor seventh');
            else if (has(0) && has(3) && has(7)) supports.push('minor triad');
            if (has(0) && has(3) && has(6) && has(10)) supports.push('half-diminished seventh');
            else if (has(0) && has(3) && has(6) && has(9)) supports.push('diminished seventh');
            else if (has(0) && has(3) && has(6)) supports.push('diminished triad');
            if (has(0) && has(4) && has(8)) supports.push('augmented triad');
            parts.push(supports.length ? 'It contains the tones of a root-based ' + supports.join(' and ') + '. Use those as landing tones and audition the remaining pitches as tensions; inclusion does not make every note equally stable over a chord.' : 'No complete root-based major, minor, diminished or augmented triad is present. Try a root drone or sparse accompaniment to hear the pattern without imposing incompatible chord tones.');
        }
        if (/raga|mela_|maqam|sikah|pelog|gamelan|balinese/i.test(scaleId)) parts.push('This analyzes the app’s twelve-tone formula only; traditional tuning, melodic grammar, ornament and ascending/descending practice are not fully represented by a pitch list.');
        if (/messiaen_mode_[1245]$/.test(scaleId)) parts.push('The stored formula is analyzed as written; some Messiaen labels in this catalog do not match the standard named modes.');
        return parts.join(' ');
    };
})();

MusicTheory.prototype.getChordDescription = function(chordId) {
    const chord = this.chords[chordId];
    if (!chord) return 'No chord formula is available for this entry.';
    // Preserve spelling: #2 and b3 sound alike in equal temperament but have different roles.
    const degrees = new Set(chord.intervals.map(iv => ({'9':'2','b9':'b2','#9':'#2','11':'4','#11':'#4','13':'6','b13':'b6','bb7':'6'})[iv] || iv));
    const has = iv => degrees.has(iv);
    const major = has('3'), minor = has('b3');
    const dominant = major && has('b7');
    const fullyDim = minor && has('b5') && has('6') && !has('b7') && /^(diminished7|dim7b9|dim9)$/.test(chordId);
    let core;
    let use;
    if (fullyDim) {
        core = 'A fully diminished seventh core stacks minor thirds: root, minor third, diminished fifth and diminished seventh. The app displays the last tone as 6, its equal-tempered equivalent, rather than bb7.';
        use = 'Its symmetric core can act as a leading-tone chord or a chromatic passing chord; resolve its tense voices by small steps into the next harmony.';
    } else if (minor && has('b5') && has('b7')) {
        core = 'A half-diminished seventh core combines a minor third, diminished fifth and minor seventh. The flattened fifth makes it more unstable than an ordinary minor seventh.';
        use = 'A common role is iiø7 in a minor-key ii–V–i progression; the diminished fifth often moves down by step into the dominant chord.';
    } else if (minor && has('b5')) {
        core = 'A diminished triad core combines a minor third and diminished fifth. Its root-to-fifth tritone gives the harmony an unsettled, compressed quality.';
        use = 'Use it as a leading-tone or passing harmony, letting its dissonant tones move into a nearby stable chord.';
    } else if (major && has('#5')) {
        core = has('7')
            ? 'An augmented-major seventh core pairs an augmented triad with a major seventh. The raised fifth and leading tone create a floating but sharply edged major sonority.'
            : has('b7')
                ? 'An augmented dominant seventh core combines a major third, raised fifth and minor seventh. It keeps the dominant tritone while replacing the stable fifth with a chromatic tension.'
                : 'An augmented triad core contains a major third and augmented fifth. Its three equally spaced pitch classes weaken the sense of a single stable root.';
        use = has('b7') ? 'Use it as an altered dominant; the raised fifth can rise by semitone into the third of a major tonic.' : 'Use it for chromatic voice leading or a floating major color; the raised fifth often moves by semitone to a neighboring chord tone.';
    } else if (dominant) {
        core = 'A dominant seventh core combines the major third and minor seventh. Their tritone supplies the characteristic tension, even when other tones are added or the fifth is altered.';
        use = 'As V7, it can resolve to a tonic a fifth below: the third rises and the minor seventh falls by step. Blues and funk also use dominant-quality chords without requiring that resolution.';
    } else if (major && has('7')) {
        core = 'A major seventh core combines a major third with a major seventh, giving a clear major identity with a close leading-tone color against the root.';
        use = 'It can color a major tonic or IV chord; its major seventh need not resolve when the harmony is treated as a sustained jazz or pop sonority.';
    } else if (minor && has('7')) {
        core = 'A minor-major seventh core places a major seventh above a minor triad. The contrast between the minor third and leading tone produces a taut, dramatic minor color.';
        use = 'Use it as a minor tonic associated with harmonic or melodic minor, or in a chromatic line that lowers the seventh toward a minor seventh chord.';
    } else if (minor && has('b7')) {
        core = 'A minor seventh core combines the minor third and minor seventh for a softer, less directional sound than a dominant seventh.';
        use = 'It often serves as ii7 in a major ii–V–I, or as a modal minor chord; its actual function depends on the bass and surrounding progression.';
    } else if (major) {
        core = 'A major-triad foundation gets its identity from the major third, with a perfect fifth providing support when present.';
        use = 'It can serve as I, IV or V in major-key harmony; added tones color that foundation without automatically changing its function.';
    } else if (minor) {
        core = 'A minor-triad foundation gets its identity from the minor third, with a perfect fifth providing support when present.';
        use = 'It can serve as a minor tonic or as ii, iii or vi in a major key; added colors should be heard against the surrounding harmony.';
    } else if (has('2') || has('4')) {
        core = has('2') && has('4')
            ? 'A thirdless suspended structure includes both the second and fourth. Without a major or minor third it leaves the chord quality open, with extra friction between the suspended tones.'
            : has('4')
                ? 'A suspended-fourth structure replaces the third with the fourth, leaving major or minor quality undecided. The fourth can resolve down to a third, but can also remain as a stable modal color.'
                : 'A suspended-second structure replaces the third with the second, producing an open sound without a fixed major or minor quality. The second may resolve toward a third or remain as a sustained color.';
        use = has('b7') ? 'The minor seventh adds a dominant-sus color, useful before a dominant resolution or as a static funk or modal harmony.' : has('7') ? 'The major seventh gives this thirdless harmony a luminous but close-edged color against the root; it is useful in sustained modern voicings.' : 'Use it for open pedal-point textures, modal accompaniment or smooth voice leading between major and minor harmonies.';
    } else {
        core = has('5') && degrees.size === 2
            ? 'A power chord contains only root and perfect fifth. With no third, it is neither major nor minor; octave doubling can reinforce its open, direct sound.'
            : 'This voicing has no defining major or minor third. Its identity comes from the specific spacing and tensions of the written intervals rather than a conventional major/minor triad.';
        use = 'The bass and surrounding melody determine its harmonic role; compare it with nearby chords rather than assigning a fixed tonal function.';
    }
    const colors = [];
    if (has('b2')) colors.push('The b2 (b9 in an upper register) lies a semitone above the root, adding a biting tension that can fall into the root.');
    if (has('2') && (major || minor)) colors.push(has('7') || has('b7') ? 'The natural ninth adds a whole-step color above the root, filling out the upper harmony without altering the third.' : 'The added second/ninth supplies a whole-step shimmer; with no seventh, it is an added-note color rather than a ninth-chord seventh structure.');
    if (has('#2')) colors.push(major ? 'The #2/#9 sounds like a minor third in equal temperament but is spelled as an altered ninth here; against the major third it creates a blues-like split-third tension.' : 'The #2 is an augmented second, enharmonic to a minor third in equal temperament; its spelling identifies it as an added color rather than a replacement third.');
    if (has('4') && (major || minor)) colors.push(major ? 'The natural fourth/eleventh sits a semitone above the major third when placed nearby. Wide spacing makes that clash clearer and less crowded; it is not a suspension while the third remains present.' : 'The fourth/eleventh adds an open minor color, a whole step above the minor third; it can remain as a sustained extension.');
    if (has('#4')) colors.push('The #4/#11 adds a tritone above the root. With the fifth retained it is an extension, not a replacement b5; it suggests a Lydian color on major harmony or a Lydian-dominant color with a minor seventh.');
    if (has('b5') && major) colors.push('The b5 replaces the perfect fifth with a diminished fifth, adding a second tritone against the root and a chromatic voice-leading option.');
    if (has('#5') && minor) colors.push('The raised fifth contrasts with the minor third; it shares a pitch with b6 in equal temperament but is written here as an altered chord fifth.');
    if (has('b6')) colors.push('The b6/b13 adds a dark upper color. When the perfect fifth is also present, those tones are a semitone apart, so their register strongly affects the amount of friction.');
    if (has('6') && !fullyDim) colors.push(has('b7') || has('7') ? 'The natural sixth/thirteenth adds a bright upper extension; on a minor chord it points toward a Dorian or melodic-minor color rather than natural minor.' : 'The natural sixth adds warmth without a seventh. On a minor foundation it provides the characteristic minor-sixth-chord color, not the b6 of natural minor.');
    if (has('b2') && has('2')) colors.push('Both flat and natural ninths are present: this is an intentional chromatic cluster, not a choice between alternative ninths.');
    if (has('4') && has('#4')) colors.push('Both natural and raised elevenths are present, creating a chromatic pair; spread them across registers if a less clustered texture is wanted.');
    if (has('b6') && has('6')) colors.push('Both flat and natural thirteenths are present, adding another chromatic pair rather than a single conventional sixth color.');
    return core + ' ' + colors.join(' ') + (colors.length ? ' ' : '') + use + ' Interval formulas here specify pitch content, not a mandatory register or voicing.';
};

MusicTheory.prototype.getIntervalQuality = function(intervalId) {
    const qualities = {
        '1': 'Perfect, identical pitch',
        'b2': 'Highly dissonant, tense',
        '2': 'Dissonant, bright tension',
        'b3': 'Minor, somewhat dark',
        '3': 'Major, bright and consonant',
        '4': 'Perfect, stable and open',
        'b5': 'Dissonant, unstable (tritone)',
        '5': 'Perfect, extremely stable',
        '#5': 'Augmented, exotic and unstable',
        '6': 'Major, consonant and sweet',
        'b7': 'Minor, bluesy tension',
        '7': 'Major, strong leading tone tension'
    };
    return qualities[intervalId] || 'Unknown';
};

MusicTheory.prototype.getIntervalConsonance = function(intervalId) {
    const consonance = {
        '1': 'Perfect consonance',
        'b2': 'Sharp dissonance',
        '2': 'Mild dissonance',
        'b3': 'Imperfect consonance',
        '3': 'Imperfect consonance',
        '4': 'Perfect consonance (context dependent)',
        'b5': 'Strong dissonance (tritone)',
        '5': 'Perfect consonance',
        '#5': 'Mild dissonance',
        '6': 'Imperfect consonance',
        'b7': 'Mild dissonance',
        '7': 'Sharp dissonance'
    };
    return consonance[intervalId] || 'Unknown';
};