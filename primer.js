(function () {
    'use strict';

    const theory = new MusicTheory();
    const root = document;
    const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const STORAGE_SETTINGS = 'st_primer_settings_v1';
    const STORAGE_MAP = 'st_primer_map_v1';
    const INSTRUMENTS = {
        guitar: { label: 'Guitar', tuning: 'E A D G B E', strings: [{ note: 'E', octave: 2 }, { note: 'A', octave: 2 }, { note: 'D', octave: 3 }, { note: 'G', octave: 3 }, { note: 'B', octave: 3 }, { note: 'E', octave: 4 }] },
        dropd: { label: 'Drop D guitar', tuning: 'D A D G B E', strings: [{ note: 'D', octave: 2 }, { note: 'A', octave: 2 }, { note: 'D', octave: 3 }, { note: 'G', octave: 3 }, { note: 'B', octave: 3 }, { note: 'E', octave: 4 }] },
        bass: { label: 'Bass', tuning: 'E A D G', strings: [{ note: 'E', octave: 1 }, { note: 'A', octave: 1 }, { note: 'D', octave: 2 }, { note: 'G', octave: 2 }] },
        ukulele: { label: 'Ukulele', tuning: 'G C E A', strings: [{ note: 'G', octave: 4 }, { note: 'C', octave: 4 }, { note: 'E', octave: 4 }, { note: 'A', octave: 4 }] }
    };
    const DEFAULT_SETTINGS = { key: 'C', instrument: 'guitar', waveform: 'triangle', volume: 0.38, tone: 58, bpm: 80, sustain: 1.5 };
    const INTRO = [
        { title: 'Meet the instrument', description: 'Identify the body, neck, headstock, bridge, nut and strings before learning a shape.', text: 'A fretted string instrument turns a vibrating string into notes. The body supports the bridge, the neck carries the frets, and the headstock holds the tuning machines. Learn the names of the parts first; it makes setup and technique instructions precise.', steps: ['Point to the body, bridge, neck, nut and tuning machines.', 'Trace one string from its tuning machine to the bridge.', 'Check that each string sits in its nut slot and crosses the bridge cleanly.'] },
        { title: 'Hold it comfortably', description: 'Set a stable posture before the hands begin repeating movements.', text: 'Balance the instrument so both hands can move without gripping. Keep the shoulder loose, wrist near neutral and thumb relaxed behind the neck. Stop if a position causes pain or tingling.', steps: ['Sit or stand with the instrument supported rather than held up by the fretting hand.', 'Relax the shoulders and let the picking arm rest lightly on the body.', 'Move the fretting thumb until the fingers can reach without squeezing.'] },
        { title: 'Name the strings', description: 'Use string names as dependable landmarks on a guitar-family instrument.', text: 'Standard guitar strings are tuned E-A-D-G-B-E from the lowest-pitched, thickest string to the highest-pitched, thinnest string. Bass and ukulele use different string sets; Setup lets you select a matching instrument.', steps: ['Say the guitar strings from low to high: E, A, D, G, B, E.', 'Point to each string without plucking and say its name.', 'Reverse the order from high E back to low E.'] },
        { title: 'Make one clear sound', description: 'Start with a single open string and listen for a steady, clean tone.', text: 'An open string sounds without a fretting finger. Pluck gently near the sound hole or pickups, then let the note ring. A clean note has a clear beginning and no accidental buzz from neighboring strings.', steps: ['Choose one open string and pluck it once with a relaxed motion.', 'Let the sound ring until it fades; do not touch another string.', 'Repeat with a lighter touch and compare the attack.'] },
        { title: 'Tune before practice', description: 'A stable reference pitch makes every later comparison meaningful.', text: 'Tune one string at a time and recheck strings after adjusting others. Turn tuning machines in small increments. Primer can sound the expected open notes for guitar, Drop D, bass and ukulele; use a tuner to compare pitch.', steps: ['Select the correct instrument in Setup or Tuning.', 'Play one reference string and compare it with a tuner.', 'Adjust in small turns, then play the string again to verify.'] },
        { title: 'Understand frets', description: 'Each neighboring fret raises a note by one semitone.', text: 'A fret is the space between two metal fret wires. Moving one fret toward the body raises the pitch by a half step; two frets make a whole step. The same pattern of distances appears on every string.', steps: ['Play an open string, then fret the first fret on the same string.', 'Move up one fret at a time and listen for each half step.', 'Compare a one-fret move with a two-fret move.'] },
        { title: 'Find the pulse', description: 'Coordinate a repeated movement with a steady beat before increasing speed.', text: 'Pulse is the regular beat beneath a piece of music. A metronome makes timing visible and audible. Begin slowly enough to keep each note even; accuracy is more useful than a fast, uneven run.', steps: ['Tap four even beats with your foot or hand.', 'Set the Primer mixer to a comfortable tempo and count aloud.', 'Pluck one open string on each beat for four bars.'] },
        { title: 'Play a first phrase', description: 'Build a tiny melody from clear timing and a small number of notes.', text: 'A phrase is a short musical thought. Use a few neighboring notes, repeat a rhythm, and leave a little silence. Singing the phrase helps connect what you hear to where the notes sit on the instrument.', steps: ['Choose two notes on one string and alternate them evenly.', 'Repeat the rhythm but change the final note.', 'Sing the phrase once, then play it back.'] },
        { title: 'Change between notes', description: 'Move one finger at a time and listen for gaps, buzzes and unwanted strings.', text: 'A useful change is relaxed and deliberate. Prepare the next finger close to the string, release excess pressure, and mute strings that should remain silent. On bass or ukulele, use the same idea with the selected tuning.', steps: ['Choose two nearby fretted notes and move between them slowly.', 'Keep the unused strings quiet with a light touch.', 'Repeat the change until both notes begin cleanly on the beat.'] },
        { title: 'Build a practice loop', description: 'Turn one clear goal into a short, repeatable practice session.', text: 'A good practice loop names one skill, a small amount of material and a way to check the result. Work in short sets, rest when tension builds, and finish by using the skill in a musical phrase.', steps: ['Write one goal that can be checked, such as four even repetitions.', 'Practice a short fragment slowly and note what needs attention.', 'Finish by making one phrase with the skill you practiced.'] },
        { title: 'Read the natural notes', description: 'Learn the seven note names that use no sharps or flats.', text: 'The natural notes are A, B, C, D, E, F and G. The half steps between them fall between E and F and between B and C, so those pairs sound closest.', steps: ['Say the natural notes in order from A to G, then back again.', 'On the low E string, find the natural notes at frets 0 to 3.', 'Play E then F, and B then C, and hear that each pair is only a half step apart.'] },
        { title: 'Find sharps and flats', description: 'See how one pitch can carry two names.', text: 'A sharp raises a note by one half step and a flat lowers it by one half step. C sharp and D flat are the same pitch, so both names are useful depending on the key.', steps: ['Play the open A string, then the first fret, and name the note at the first fret.', 'Find C sharp and D flat at the fourth fret of the A string and play them.', 'Play both and say both names aloud.'] },
        { title: 'Map frets one to four', description: 'Name the notes in the first four frets of one string.', text: 'The first four frets give a small, practical map of one string. Learning those names first makes simple melodies easier to find.', steps: ['Play the open D string and name it, then frets one to four.', 'Say each note name as you play it, without looking at a diagram.', 'Repeat on the G string and compare the names.'] },
        { title: 'Use the fifth fret rule', description: 'Find a matching note on the next string by moving up five frets.', text: 'Fretting the fifth fret of a string sounds the same note as the next open string. The G to B pair is the exception and uses the fourth fret.', steps: ['Play the fifth fret of the low E string and compare it with the open A string.', 'Repeat on the A string and compare it with the open D string.', 'Find the exception between the G and B strings and play it.'] },
        { title: 'Find the octave at fret twelve', description: 'Use the twelfth fret as a reference for the same note name.', text: 'Fret twelve on any string sounds the same note name as the open string, one octave higher. Checking octaves helps you hear both tuning and accuracy.', steps: ['Play the open low E string, then the twelfth fret.', 'Listen for the same name one octave higher.', 'Repeat on the A and D strings.'] },
        { title: 'Count twelve chromatic notes', description: 'Name every semitone between a note and its octave.', text: 'The chromatic scale has twelve notes before the octave repeats: C, C sharp, D, D sharp, E, F, F sharp, G, G sharp, A, A sharp and B. Each step is one fret.', steps: ['Say the twelve chromatic note names starting from C.', 'Play one string from its open note up twelve frets, naming each fret.', 'Repeat from a different open string and check where the names match.'] },
        { title: 'Name the low E string', description: 'Learn the notes on the thickest string.', text: 'The low E string starts on E and provides the lowest standard guitar note. Its first twelve frets cover one full octave of notes.', steps: ['Name the open low E string and play it.', 'Play frets one through five and say each note.', 'Play frets seven through twelve and say each note.'] },
        { title: 'Name the high E string', description: 'Learn the notes on the thinnest string.', text: 'The high E string sounds one octave above the low E string. Its open note and first frets are useful for melodies.', steps: ['Play the open high E string and name it.', 'Play frets one through four and say each note.', 'Play the twelfth fret and compare it with the open string.'] },
        { title: 'Read the A and D strings', description: 'Name the notes on the two middle strings of standard tuning.', text: 'The A and D strings sit in the middle of the standard neck. Their notes give you a second set of landmarks when moving shapes and scales.', steps: ['Name the open A string and play frets one to five.', 'Name the open D string and play frets one to five.', 'Play the open A and then the open D and compare their names.'] },
        { title: 'Find one note on two strings', description: 'Locate the same pitch name in two places.', text: 'Many notes can be played on more than one string. Finding the same name in two places shows that a fretboard position is one choice among several.', steps: ['Find C on the A string at the third fret and play it.', 'Find another C on the D string at the tenth fret and play it.', 'Play both and listen for the octave difference.'] },
        { title: 'Hear the half step', description: 'Recognize the smallest interval on the instrument.', text: 'A half step is one fret, the smallest distance between two standard Western notes. Hearing it clearly helps you judge intervals, bends and scale patterns.', steps: ['Play E and F on the low E string and listen to the distance.', 'Play B and C on the A string and compare them with E and F.', 'Play any note, then the note one fret higher, and say half step aloud.'] },
        { title: 'Hear the whole step', description: 'Recognize a two-fret distance.', text: 'A whole step equals two half steps, or two frets. Major scales are built from whole steps and half steps, so this distance appears constantly.', steps: ['Play the open low E string, then fret two, and listen for the whole step.', 'Play fret two followed by fret four on the same string.', 'Play a whole step from the open string on each string in turn.'] },
        { title: 'Sing the minor third', description: 'Learn a three-semitone interval by voice and fingers.', text: 'A minor third spans three frets. It sounds darker than a major third and appears in minor scales, minor chords and blues phrases.', steps: ['Sing a note, then sing the note three half steps higher.', 'Play the open low E string, then fret three, which sounds G.', 'Play the interval and sing it again.'] },
        { title: 'Sing the major third', description: 'Learn a four-semitone interval by voice and fingers.', text: 'A major third spans four frets and sounds brighter than a minor third. It is a core interval in major scales and major chords.', steps: ['Sing a note, then sing the note four half steps higher.', 'Play the open low E string, then fret four, which sounds G sharp.', 'Compare the major third with the minor third you just learned.'] },
        { title: 'Sing the perfect fourth', description: 'Learn the five-semitone interval used in many familiar melodies.', text: 'A perfect fourth spans five half steps. It is stable and familiar, and it is the distance from the open low E string to the open A string.', steps: ['Play the open low E string, then the open A string.', 'Sing the interval while you play it.', 'Find another perfect fourth by moving from the open A string to the open D string.'] },
        { title: 'Sing the perfect fifth', description: 'Learn the seven-semitone interval that anchors power chords.', text: 'A perfect fifth spans seven half steps. It sounds open and stable, and it forms the outer notes of many chords.', steps: ['Play the open low E string and then the open B string.', 'Sing the interval while holding the first note.', 'Find a fifth from the open A string up to the open high E string.'] },
        { title: 'Sing the octave', description: 'Hear the same note name twelve semitones higher.', text: 'An octave is twelve half steps. Two notes an octave apart share a name and sound closely related, which makes octaves useful for checking intonation.', steps: ['Play the open low E string, then the open high E string.', 'Sing the lower note, then sing the higher note.', 'Play the twelfth fret of the A string and compare it with the open string.'] },
        { title: 'Apply the whole-whole-half pattern', description: 'Build a major scale from any starting note.', text: 'The major scale follows whole, whole, half, whole, whole, whole, half. Starting that pattern from another note gives a different major scale with different notes.', steps: ['Play the E major notes on the low E string at frets 0, 2, 4, 5, 7, 9, 11 and 12.', 'Say the whole and half steps aloud as you play each note.', 'Repeat the pattern from the open A string to build an A major scale.'] },
        { title: 'Count scale degrees', description: 'Number each note of a scale from the root upward.', text: 'Scale degrees are numbers counted from the root: one, two, three and so on. A degree number describes a note role in the scale, even when the key changes.', steps: ['Choose a major scale and name each note with its degree number.', 'Play the scale and say the degree number with each note.', 'Repeat in a second key and notice that the degree numbers stay the same.'] },
        { title: 'Hear the tonic', description: 'Recognize the home note that a melody returns to.', text: 'The tonic is the note that sounds most settled in a key. Melodies often end on the tonic, so hearing it gives you a reference for every other note.', steps: ['Play a major scale and stop on the first note; listen for the feeling of rest.', 'Play a short melody and finish it on the tonic.', 'Stop on a different scale note and hear the tension that remains.'] },
        { title: 'Stack thirds into triads', description: 'Build a three-note chord by stacking two thirds.', text: 'A triad is three notes built from a root, a third above it and a fifth above that. Stacking thirds from a scale creates the chord shapes used in most songs.', steps: ['Pick a root and count up three scale degrees to find the third.', 'Count three more scale degrees to find the fifth.', 'Play the three notes together and name them in order.'] },
        { title: 'Compare major and minor triads', description: 'Hear the difference made by the third.', text: 'A major triad has a major third above its root, and a minor triad has a minor third. Changing only that middle note changes the chord from bright to dark.', steps: ['Play the C major triad: C, E, G.', 'Lower the E to E flat and play C minor: C, E flat, G.', 'Alternate the two chords and listen for the change.'] },
        { title: 'Hear the diminished triad', description: 'Recognize a tense chord built from two minor thirds.', text: 'A diminished triad stacks two minor thirds, creating a tense and unstable sound. It often sounds like it wants to move to a more stable chord.', steps: ['Play B, D and F, which form a B diminished triad.', 'Compare it with B minor, made from B, D and F sharp.', 'Move the top note up a half step and listen for relief.'] },
        { title: 'Hear the augmented triad', description: 'Recognize a chord built from two major thirds.', text: 'An augmented triad stacks two major thirds, so its top note sits a half step above a perfect fifth. The sound is symmetrical and floating.', steps: ['Play C, E and G sharp, which form a C augmented triad.', 'Compare it with the C major triad, C, E and G.', 'Move the whole shape up four frets and hear that it still sounds augmented.'] },
        { title: 'Play root-position triads', description: 'Put the root at the bottom of a chord shape.', text: 'A root-position triad has the root as its lowest note. This placement gives the chord a clear foundation and makes chord names easier to hear.', steps: ['Play a C major triad with C as the lowest note.', 'Play an A minor triad with A as the lowest note.', 'Name the bass note before strumming each chord.'] },
        { title: 'Name the chord tones', description: 'Label the root, third and fifth in any triad.', text: 'Chord tones are the notes that define a chord: the root, third and fifth in a triad. Naming them makes it easier to change chords or find substitutes.', steps: ['Take a G major triad and name its root, third and fifth.', 'Play the same chord with the fifth left out and listen.', 'Name the chord tones of an E minor triad.'] },
        { title: 'Add a seventh to a triad', description: 'Extend a three-note chord with one more stacked third.', text: 'A seventh chord adds a note a third above the fifth. The added note creates color, and whether the seventh is major or minor changes its sound.', steps: ['Play a C major triad, then add B to make a major seventh chord.', 'Play C, E, G and B flat to make a dominant seventh chord.', 'Play both chords and compare the color.'] },
        { title: 'Hear the dominant seventh', description: 'Recognize the chord with a strong pull toward resolution.', text: 'A dominant seventh chord is a major triad with a minor seventh. It creates strong tension that often leads to a major or minor chord a fourth higher.', steps: ['Play G, B, D and F, which form a G dominant seventh chord.', 'Play G major, then add F to hear the change.', 'Move from the G dominant chord to C major and hear the release.'] },
        { title: 'Hear the minor seventh chord', description: 'Recognize the softer color of a minor triad with a seventh.', text: 'A minor seventh chord has a minor third, perfect fifth and minor seventh. It sounds smooth and is common in jazz, soul and modal music.', steps: ['Play A, C, E and G, which form an A minor seventh chord.', 'Play A minor triad and compare it with the seventh chord.', 'Move the shape up one string set and repeat it.'] },
        { title: 'Play a I IV V progression', description: 'Move through three common chords in one key.', text: 'The I, IV and V chords are built on the first, fourth and fifth scale degrees. Their movement forms a basic progression used in countless songs.', steps: ['Play C major, F major and G major in that order.', 'Repeat the progression with a steady pulse.', 'Return to C major and listen for the feeling of arrival.'] },
        { title: 'Hear Lydian color', description: 'Recognize the raised fourth that brightens a major scale.', text: 'Lydian is a mode built from the major scale with a raised fourth. The raised fourth gives it a floating, bright sound.', steps: ['Play a C major scale, then raise the fourth note to F sharp.', 'Play C Lydian ascending and hold the F sharp.', 'Compare the F sharp with the F natural in C major.'] },
        { title: 'Hear Phrygian color', description: 'Recognize the flat second that gives Phrygian its dark sound.', text: 'Phrygian is built from the natural minor scale with a flat second. The flat second creates a tense, Spanish-flavored sound.', steps: ['Play E Phrygian: E, F, G, A, B, C, D.', 'Play E natural minor and compare its F sharp with the F in Phrygian.', 'Repeat the flat second and listen for the tension it creates.'] },
        { title: 'Hear Aeolian minor', description: 'Recognize natural minor as one of the seven modes.', text: 'Aeolian is the natural minor mode. It starts on the sixth degree of a major scale and shares the same notes as the relative major.', steps: ['Play A Aeolian: A, B, C, D, E, F, G.', 'Play C major from A to A and compare the two scales.', 'Name the sixth degree of C major as the starting note.'] },
        { title: 'Hear Locrian tension', description: 'Recognize the mode with a flat fifth above its root.', text: 'Locrian is built from the seventh degree of the major scale. Its flat fifth makes the mode unstable and rarely used as a home key.', steps: ['Play B Locrian: B, C, D, E, F, G, A.', 'Play B and F together and hear the flat fifth.', 'Compare B Locrian with B Aeolian and note the change.'] },
        { title: 'Compare Ionian and Aeolian', description: 'Hear how the same notes change character from a different start.', text: 'Ionian is the major mode and Aeolian is the natural minor mode. Both use the same notes when started on different degrees, so their difference comes from where they begin.', steps: ['Play C Ionian ascending and descending.', 'Play A Aeolian over the same notes and listen for the change.', 'Alternate between them and name the tonic each time.'] },
        { title: 'Compare Dorian and Aeolian', description: 'Hear the raised sixth that brightens natural minor.', text: 'Dorian is minor with a raised sixth. Compared with Aeolian, the raised sixth gives the mode a brighter, more open minor sound.', steps: ['Play D Dorian: D, E, F, G, A, B, C.', 'Play D Aeolian: D, E, F, G, A, B flat, C.', 'Hold a D minor chord and move between B natural and B flat.'] },
        { title: 'Hear Mixolydian color', description: 'Recognize the flat seventh that gives a major scale a bluesy sound.', text: 'Mixolydian is a major scale with a flat seventh. It is common in rock, folk and blues because the flat seventh softens the sound of a dominant chord.', steps: ['Play G Mixolydian: G, A, B, C, D, E, F.', 'Compare the F natural in G Mixolydian with the F sharp in G major.', 'Play a G dominant chord over the scale and hear it fit.'] },
        { title: 'Find the natural sixth', description: 'Hear the sixth degree that defines major and Dorian colors.', text: 'The sixth degree gives each scale much of its character. A major sixth sounds bright, while a minor sixth sounds darker.', steps: ['Play C major and find the A, the sixth degree.', 'Play C minor and compare its A flat with the A.', 'Alternate between A and A flat over a C chord and hear the difference.'] },
        { title: 'Shift the root, keep the notes', description: 'Use one set of notes to find a different mode.', text: 'Playing the same notes from a different root changes the mode. This is how the church modes relate to the major scale.', steps: ['Play the notes of C major from C up to C.', 'Play the same notes from D up to D and name the new mode.', 'Repeat from E and listen for the change.'] },
        { title: 'Choose a mode by color', description: 'Match a mode to the feeling it gives a progression.', text: 'Each mode has one or two notes that give it its color. Listening for those notes helps you choose a mode that suits a riff or chord loop.', steps: ['Play a riff over a minor chord and try Dorian, then Aeolian.', 'Notice which version has the brighter sixth.', 'Choose the mode whose color fits the riff and describe it in one sentence.'] },
        { title: 'Sing before you play', description: 'Hear the target before finding it on the instrument.', text: 'Singing a phrase first builds a connection between pitch and hand movement. It also shows whether you know the sound you are aiming for.', steps: ['Sing a short phrase from a scale.', 'Find the first note on the instrument by ear.', 'Play the phrase and compare it with your voice.'] },
        { title: 'Play over a drone', description: 'Use a sustained note as a home base for practice.', text: 'A drone is a held note that continues under your playing. Hearing it makes it easier to judge whether your notes agree with the key center.', steps: ['Play the open low E string and let it ring as a drone.', 'Play notes from the E minor scale over the drone and listen for agreement.', 'Change the drone to A and play notes from the A natural minor scale instead.'] },
        { title: 'Play along with a groove', description: 'Practice with a steady rhythmic backing.', text: 'A groove provides timing and harmony for practice. Playing with it reveals whether your phrases fit the pulse and the chord changes.', steps: ['Set the metronome to a steady tempo and count two bars.', 'Play one note per beat over the pulse.', 'Add a second note in each bar and keep the timing even.'] },
        { title: 'Record and listen back', description: 'Use a recording to check timing and tone.', text: 'A short recording shows what your ear may miss while playing. Listening back reveals uneven timing, buzzing strings and unclear notes.', steps: ['Record a four-bar phrase on a phone or device.', 'Listen once for timing and once for clean notes.', 'Mark one thing to fix and practice only that section.'] },
        { title: 'Keep a practice log', description: 'Track what you played, how long, and what needs work.', text: 'A practice log turns scattered repetition into steady progress. Short entries about the goal, time and result show patterns over several weeks.', steps: ['Write the date, the exercise and the minutes practiced.', 'Note one thing that improved and one thing that needs work.', 'Plan the next session in one sentence.'] },
        { title: 'Phrase in four-bar units', description: 'Group musical ideas into clear four-bar sections.', text: 'Four bars are a common length for musical phrases. Dividing a melody into four-bar units makes it easier to remember, repeat and vary.', steps: ['Play a riff for four bars and rest for one bar.', 'Repeat the riff and change only the last bar.', 'Count each four-bar unit aloud with the metronome running.'] },
        { title: 'Leave space between phrases', description: 'Use rests to let phrases breathe.', text: 'Silence shapes a phrase as much as the notes do. A short rest at the end of a phrase lets the listener hear its shape before the next one begins.', steps: ['Play a two-bar phrase and stop with a clear ending.', 'Rest for two beats, then play a reply phrase.', 'Shorten the rest and compare how much tension remains.'] },
        { title: 'Vary a phrase three ways', description: 'Create variation by changing one element at a time.', text: 'Varying one phrase develops an idea without writing a new one. Changing rhythm or the final note gives you versions that still sound connected.', steps: ['Play the short phrase as written.', 'Change only its rhythm and play it again.', 'Change only the final note and play the three versions in a row.'] },
        { title: 'Play for a listener', description: 'Practice presenting music to someone else.', text: 'Playing for another person changes how you control tempo and dynamics. A listener makes small mistakes more noticeable and encourages clear musical decisions.', steps: ['Choose a piece of four to eight bars.', 'Play it once for a friend or family member.', 'Ask one question about what was clear and what was unclear.'] },
        { title: 'Perform from memory', description: 'Learn a short piece so it can be played without written notes.', text: 'Memorization is built from sound, shape and structure together. Practicing in sections makes recall more reliable than repeating from start to finish.', steps: ['Learn the first four bars until you can play them without looking.', 'Add the next four bars and play eight bars together.', 'Play the whole piece without stopping and mark where you hesitated.'] },
        { title: 'Slide a shape up the neck', description: 'Move a fretted pattern up without changing its intervals.', text: 'A shape keeps the same pattern of intervals wherever you place it. Sliding it up one fret raises the key by a half step while keeping the pattern identical.', steps: ['Play a simple two-octave pattern starting on the low E string.', 'Slide the same fingering up one fret and listen for the higher key.', 'Slide it back and compare the two positions.'] },
        { title: 'Move a shape to a new key', description: 'Use one shape to play the same pattern from several roots.', text: 'Movable shapes make it possible to play the same pattern from different roots. Finding the root on the string tells you the key of the shape.', steps: ['Find the root of a simple shape on the low E string.', 'Move the shape to a second root on the same string.', 'Name the root of each version before playing it.'] },
        { title: 'Link two octaves of a scale', description: 'Play a scale across two octaves to connect the neck.', text: 'A two-octave scale uses both low and high strings to repeat the same note names. Linking the octaves makes a larger shape easier to remember.', steps: ['Play a major scale from the low E string up to the high E string.', 'Name each note as you move between strings.', 'Descend along the same path and check the octave again.'] },
        { title: 'Cross from one string pair to the next', description: 'Move across strings while keeping the pattern clear.', text: 'Crossing a string pair means changing strings without losing the pattern. Keep your fingers close to the strings and listen for an even connection.', steps: ['Play two notes on the low E string, then two on the A string.', 'Repeat the crossing from the A string to the D string.', 'Repeat from the D string to the G string with the same finger pattern.'] },
        { title: 'Find the root in each box', description: 'Mark the root in every scale position you learn.', text: 'Each scale position contains the root in more than one place. Finding the root in each box keeps the positions connected to the same tonal center.', steps: ['Play one scale position and mark its root.', 'Find the root in the next position up the neck.', 'Play both positions and listen for the same tonal center.'] },
        { title: 'Hear the pentatonic in the major scale', description: 'Find the five notes of a pentatonic scale inside a major scale.', text: 'The major pentatonic scale is a major scale with the fourth and seventh removed. Hearing the shared notes shows how scales overlap within a key.', steps: ['Play a C major scale and name the fourth and seventh notes.', 'Play the scale again without those two notes.', 'Play the remaining notes as the C major pentatonic scale.'] },
        { title: 'Change position on a run', description: 'Shift to a new position in the middle of an ascending line.', text: 'Moving up a scale often requires changing position. Plan the shift before reaching it so the line sounds continuous.', steps: ['Play a scale ascending in one position until the shift is near.', 'Move your hand to the next position before the note is played.', 'Repeat the shift on the way down.'] },
        { title: 'Keep fingering patterns consistent', description: 'Use the same finger order in each position where possible.', text: 'Consistent fingering makes a pattern easier to repeat in different keys. Choose one finger sequence and keep it across several strings.', steps: ['Play a short pattern with fingers 1, 2 and 4 on the low E string.', 'Repeat the same finger numbers on the A string.', 'Move the pattern up one fret and keep the finger order unchanged.'] },
        { title: 'Add open strings to a scale', description: 'Use open strings to connect a scale without changing its notes.', text: 'Open strings can be part of a scale when their note names match. They add a resonant landmark and can reduce hand movement.', steps: ['Play a G major scale using the open G string.', 'Replace the fretted G on the G string with the open string and compare the sound.', 'Repeat with the open D string in a D major scale.'] },
        { title: 'Join two boxes into one line', description: 'Connect two neighboring scale positions into one continuous run.', text: 'Two neighboring positions overlap on one or more strings. Joining them lets you play a line across a wider part of the neck.', steps: ['Play one position from its lowest note to its highest note.', 'Move into the neighboring position at the highest note they share.', 'Play the combined line slowly, then at a faster speed.'] },
        { title: 'Raise the sixth in melodic minor', description: 'Hear the bright sixth in an ascending minor scale.', text: 'Melodic minor raises the sixth and seventh when ascending. The raised sixth creates a bright minor sound that is common in jazz and modern music.', steps: ['Play A melodic minor ascending: A, B, C, D, E, F sharp, G sharp, A.', 'Compare F sharp with the F natural from A natural minor.', 'Play the descending version and hear the return to natural minor.'] },
        { title: 'Sound the whole-tone scale', description: 'Use six notes spaced a whole step apart.', text: 'The whole-tone scale has six notes, each a whole step from the next. Its even spacing sounds dreamlike and unresolved.', steps: ['Play C, D, E, F sharp, G sharp, A sharp and C.', 'Start on another note and repeat the same whole-step spacing.', 'Play the scale slowly and listen for the lack of a clear home note.'] },
        { title: 'Play the half-whole diminished scale', description: 'Alternate half steps and whole steps in an eight-note scale.', text: 'The half-whole diminished scale alternates half steps and whole steps. It fits diminished chords and creates a busy, symmetrical sound.', steps: ['Play C, C sharp, D sharp, E, F sharp, G, A, A sharp, C.', 'Start on another note and keep the same half-whole pattern.', 'Play the scale slowly and listen for the repeating symmetry.'] },
        { title: 'Hear Lydian dominant color', description: 'Add a raised fourth to a dominant chord sound.', text: 'Lydian dominant is a Mixolydian scale with a raised fourth. It sounds bright and unresolved over a dominant seventh chord.', steps: ['Play G Lydian dominant: G, A, B, C sharp, D, E, F.', 'Compare the C sharp with the C natural in G Mixolydian.', 'Hold a G7 chord and play the raised fourth above it.'] },
        { title: 'Hear the altered dominant', description: 'Use altered tones to add tension over a dominant chord.', text: 'The altered scale contains flat and sharp versions of the fifth and ninth over a dominant chord. It creates strong tension that resolves toward a major or minor chord.', steps: ['Play G altered: G, A flat, B flat, B, D flat, E flat, F.', 'Hold a G7 chord and play the altered notes over it.', 'Resolve to C major and listen for the release.'] },
        { title: 'Hear the Mixolydian flat sixth', description: 'Use a flat sixth to darken a dominant sound.', text: 'Mixolydian flat six combines the flat sixth of the Aeolian mode with the seventh of Mixolydian. It has a dark, bluesy quality over dominant chords.', steps: ['Play C Mixolydian flat six: C, D, E, F, G, A flat, B flat.', 'Compare A flat with the A natural in C Mixolydian.', 'Play the flat sixth over a C dominant chord and listen for the dark color.'] },
        { title: 'Add chromatic passing tones', description: 'Fill a scale step with a note between two scale degrees.', text: 'Chromatic passing tones are notes outside the scale that connect two scale notes by half steps. They add smooth motion without changing the key center.', steps: ['Play C up to E in a major scale.', 'Add C sharp between C and D, and D sharp between D and E.', 'Play the line slowly and keep the passing notes short.'] },
        { title: 'Add the bebop passing tone', description: 'Use an extra chromatic note to keep chord tones on the beat.', text: 'A bebop passing tone is a chromatic note added between two scale tones. It keeps strong beats aligned with chord tones.', steps: ['Play a C dominant scale with the added B natural between B flat and C.', 'Play the line over a C7 chord and stress the chord tones on the beat.', 'Repeat the phrase with the passing tone moved off the beat.'] },
        { title: 'Hear the double harmonic scale', description: 'Use a scale with two augmented seconds for a distinctive color.', text: 'The double harmonic scale contains two augmented seconds, which create a strongly exotic sound. It is useful for expressive minor-key riffs.', steps: ['Play C double harmonic: C, D flat, E, F, G, A flat, B, C.', 'Play the scale ascending and descending, listening for the wide steps.', 'Compare it with C harmonic minor and hear the difference.'] },
        { title: 'Compare two scales over one chord', description: 'Choose between scales that share the same chord tones.', text: 'Several scales can fit one chord, and each adds different colors. Comparing them over a single chord shows which notes create tension and which sound stable.', steps: ['Hold a C major chord and play the C major scale over it.', 'Replace one note with a color note from C Lydian.', 'Compare the two sounds and choose the one that fits the chord best.'] },
        { title: 'Move each voice a short distance', description: 'Connect chord changes by moving every note as little as possible.', text: 'Smooth voice leading means each note moves to the nearest note in the next chord. Small motion keeps chords connected and easy to play.', steps: ['Play C major, then F major, moving each note as little as possible.', 'Play G major after F major using the same principle.', 'Name the note that moves in each change.'] },
        { title: 'Hold a common tone', description: 'Keep one note in place while the chord changes around it.', text: 'A common tone is a note shared by two chords. Keeping it fixed creates a smooth change and a clear link between harmonies.', steps: ['Play C major, then A minor, and hold the shared notes in place.', 'Identify which notes are common to both chords.', 'Repeat with F major and D minor.'] },
        { title: 'Invert a triad', description: 'Move a different chord tone to the bottom of the triad.', text: 'Inversions change which chord tone is lowest. A first inversion places the third in the bass, and a second inversion places the fifth in the bass.', steps: ['Play C major in root position, with C at the bottom.', 'Play C major first inversion with E at the bottom.', 'Play C major second inversion with G at the bottom.'] },
        { title: 'Build a bass line with inversions', description: 'Use the lowest note of each chord as a melodic line.', text: 'When inversions are chosen carefully, the bass notes move by step and form a melody. That bass line supports the harmony and makes the progression feel connected.', steps: ['Choose the lowest note of each chord so the bass moves by step.', 'Play the chords with that bass line and listen for smooth motion.', 'Repeat with a different starting chord.'] },
        { title: 'Spread a voicing across the strings', description: 'Use wide spacing to make a chord sound open.', text: 'A spread voicing places chord tones across several strings with larger gaps between them. It sounds open and clear, especially in the lower register.', steps: ['Play an open C major chord and listen to the spacing between notes.', 'Move one note up an octave and hear the open sound.', 'Play the same chord with close spacing and compare.'] },
        { title: 'Drop the second voice', description: 'Lower the second-highest note of a chord by an octave.', text: 'Drop-two voicing takes the second note from the top of a close-position chord and drops it an octave. The chord gains space while keeping the same tones.', steps: ['Play C, E, G and B as a close-position Cmaj7 chord.', 'Drop the second note from the top, which is G, down an octave.', 'Compare the close and open versions on the instrument.'] },
        { title: 'Play a ii V I movement', description: 'Connect three chords with a movement used in many songs.', text: 'The ii V I progression is common in jazz, pop and gospel. Its chords move smoothly into one another, and the V chord creates a strong pull toward I.', steps: ['Play D minor, G dominant seventh and C major in order.', 'Play the progression slowly, naming each chord and its root.', 'Repeat the progression in another key using the same pattern.'] },
        { title: 'Avoid parallel fifths', description: 'Keep two voices from moving in the same fifth motion.', text: 'Parallel fifths occur when two voices move together and keep the same perfect fifth. They weaken the independence of the voices and sound less distinct.', steps: ['Play two notes a fifth apart and move both up one fret.', 'Change one voice so the interval becomes different.', 'Repeat and listen for the independence gained.'] },
        { title: 'Resolve the leading tone', description: 'Move the seventh degree up to the tonic.', text: 'The leading tone is the seventh degree of a major scale, a half step below the tonic. It often moves upward to resolve toward a stable home note.', steps: ['Play B, then C, in the key of C major.', 'Play G7 and resolve its B to C while the other notes move.', 'Listen for the feeling of arrival on C major.'] },
        { title: 'Write a two-chord turnaround', description: 'Create a short loop that returns to the start of a progression.', text: 'A turnaround is a short chord movement that leads back to the beginning of a section. Two chords can be enough when they create a clear return.', steps: ['Play G major followed by C major as a repeated loop.', 'Add a bass note on each chord and keep the pulse steady.', 'Change the second chord and listen for how the return sounds.'] },
        { title: 'Play eighth-note subdivisions', description: 'Count and play steady eighth notes against a beat.', text: 'Eighth notes split each beat in two. Counting them as 1 & 2 & keeps the pulse steady and makes rhythm easier to place.', steps: ['Count 1 & 2 & 3 & 4 & with a metronome at a slow tempo.', 'Play one note on every count, then only on the numbers.', 'Play one note on each & and keep the numbers silent.'] },
        { title: 'Play sixteenth-note groups', description: 'Fit four notes into each beat with an even pulse.', text: 'Sixteenth notes divide each beat into four. Counting 1 e & a keeps the groups even and prevents rushing.', steps: ['Count 1 e & a 2 e & a at a slow tempo.', 'Play four even notes on each beat of a single open string.', 'Play a pattern of two notes then two rests within each beat.'] },
        { title: 'Place a syncopation', description: 'Accent an off-beat note and let it land on the groove.', text: 'Syncopation places emphasis on weak beats or off-beats. It creates forward motion because the ear expects the strong beat to arrive.', steps: ['Tap a steady quarter-note pulse with your foot.', 'Play a note on the and of 2 and hold it through beat 3.', 'Repeat the pattern and feel the accent shift against the pulse.'] },
        { title: 'Compare straight time and triplet feel', description: 'Play the same line straight and then in triplets.', text: 'Straight time divides a beat into two parts, and triplet feel divides it into three. Hearing the difference helps you choose the right groove.', steps: ['Play a four-note line with straight eighths.', 'Play the same line with a triplet count of 1 trip-let 2 trip-let.', 'Alternate between the two feels and notice which one suits the tune.'] },
        { title: 'Use purposeful rests', description: 'Leave space in a phrase so the notes around it breathe.', text: 'A rest is part of the phrase. Silence before or after a note can add tension, emphasis, or a clear end.', steps: ['Play a four-bar phrase and leave the last beat of each bar silent.', 'Add one rest before a strong note and listen for the emphasis.', 'Shorten the rests until the phrase feels continuous but still spacious.'] },
        { title: 'Practice call and response', description: 'Answer a short musical question with a phrase of your own.', text: 'Call and response is a conversation in music. One phrase asks a question, and a second phrase answers it, often with a sense of resolution.', steps: ['Play a two-bar phrase that ends on a non-root note.', 'Answer it with a two-bar phrase that resolves to the root.', 'Repeat the exchange, changing one note in each answer.'] },
        { title: 'Build a 16-bar AABA form', description: 'Shape a melody into sections that return and contrast.', text: 'AABA form uses two similar four-bar phrases, a contrasting bridge, and a return. Many standards and songs use this structure.', steps: ['Write a four-bar A phrase in one key.', 'Repeat A with a different ending, then write a contrasting B section.', 'Return to A to complete the sixteen bars.'] },
        { title: 'Develop a motif', description: 'Expand a short musical idea by changing its shape.', text: 'A motif is a short musical idea that can be repeated and changed. Development keeps the piece unified while adding variety.', steps: ['Choose a three-note motif and play it on the root chord.', 'Repeat the motif higher, then lower, on different chords.', 'Change the rhythm of the last note and keep the contour.'] },
        { title: 'Play a double-time lick', description: 'Fit twice as many notes into the same beat without losing time.', text: 'Double time doubles the note value of the pulse. A lick played in double time should still land cleanly on the original beats.', steps: ['Play a four-note pattern in quarter notes at a slow tempo.', 'Play the same pattern as eighth notes in the same time.', 'Speed the metronome up and keep the pattern landing on each beat.'] },
        { title: 'Record a finished eight-bar piece', description: 'Play a complete short melody from start to finish and listen back.', text: 'Recording reveals timing, phrasing, and note choices that are easy to miss while playing. A finished eight-bar piece gives you a clear target.', steps: ['Choose a key and a simple chord loop for eight bars.', 'Play the melody once, then record a full take.', 'Listen back and mark one bar to repeat until it feels even.'] },
        { title: 'Recognize intervals by ear', description: 'Name the distance between two notes without looking at the fretboard.', text: 'Interval recognition connects the sound of a distance to a name. Familiar songs can serve as anchors for each interval.', steps: ['Play a root note, then a second note a perfect fifth higher.', 'Name the interval before checking the fretboard.', 'Repeat with a major third, minor third, and perfect fourth.'] },
        { title: 'Recognize triads by ear', description: 'Hear whether a chord is major, minor, diminished, or augmented.', text: 'Triad quality is heard through the third and fifth above the root. A major third sounds bright, and a minor third sounds darker.', steps: ['Play a major triad and a minor triad on the same root.', 'Name the quality after hearing each chord.', 'Switch the order and sing the third to confirm your answer.'] },
        { title: 'Hear a scale in a melody', description: 'Identify the scale that a short melody is built from.', text: 'Melodies often stay inside one scale. Listening for the most common notes and the resting note helps you identify the key and mode.', steps: ['Play a short tune built from the major scale.', 'Listen for the note the tune rests on most often.', 'Name the scale, then play it up and down to confirm.'] },
        { title: 'Match pitch with your voice', description: 'Sing a note that matches a tone you hear on the guitar.', text: 'Vocal matching trains your ear to connect what you hear to what you sing. Start with a single held note and adjust slowly.', steps: ['Play an open string and sing its pitch.', 'Play a fretted note a whole step higher and sing it.', 'Check the match by playing the note again and listening for beats.'] },
        { title: 'Sing chord tones over a held root', description: 'Find the third and fifth above a sustained bass note.', text: 'A held root gives a stable reference. Singing chord tones above it trains the ear to hear how each note relates to the root.', steps: ['Play and hold a low C on the fifth string.', 'Sing E, then G, while the root continues to sound.', 'Switch to a minor third and compare the sound.'] },
        { title: 'Transcribe a four-note phrase', description: 'Write down a short phrase by ear, one note at a time.', text: 'Transcription starts small. A four-note phrase is short enough to hear clearly and check against the instrument.', steps: ['Play a short phrase on repeat and sing it back.', 'Find each note on the fretboard by ear.', 'Write the note names and check them by playing the phrase.'] },
        { title: 'Play a melody by ear from a recording', description: 'Work out a simple tune from a recording without written notes.', text: 'Learning by ear builds listening and musical memory. Use short sections and slow playback to keep the task manageable.', steps: ['Choose a simple melody with clear phrases.', 'Play the first phrase back, pausing and replaying as needed.', 'Connect the phrases into a complete melody at the original tempo.'] },
        { title: 'Check intonation with octaves', description: 'Use octave pitches to test whether your fretted notes are in tune.', text: 'An octave should sound clean when the fretted note matches the open string. Small errors show up quickly in octave checks.', steps: ['Fret the fifth string at the twelfth fret and compare it to the open harmonic.', 'Play the same octave on other strings and listen for beats.', 'Adjust finger placement and repeat until the octave sounds clear.'] },
        { title: 'Hold tempo through a long piece', description: 'Keep a steady pulse across an entire piece without slowing down.', text: 'Tempo drift often appears in longer pieces, especially around difficult passages. A steady pulse keeps the music together.', steps: ['Set a metronome and play a complete piece at a comfortable tempo.', 'Record yourself and check whether the pulse speeds up or slows down.', 'Repeat the piece, focusing on the hardest bar until it stays with the click.'] },
        { title: 'Plan the next practice stage', description: 'Choose one goal for the next block of practice.', text: 'Progress is easier to track when each session has one clear goal. Choose a specific target that you can check at the end of the practice block.', steps: ['Review the last stage and name one skill that still feels weak.', 'Write a single measurable goal for the next session.', 'Play the goal at a slow tempo, then at the target tempo, and note the result.'] }
    ];
    const STAGE_NAMES = [
        'Instrument and first sounds', 'Notes, fretboard and first scales', 'Intervals and scale logic', 'Chords and harmonic foundations', 'Modes and chord color',
        'Application and musicianship', 'Connect scales across the neck', 'Advanced scale colors', 'Chord craft and voice leading', 'Rhythm, composition and virtuosity',
        'Ear training and performance', 'Lessons: scales, modes and chords', 'Lessons: intervals and diatonic harmony', 'Lessons: voicings and neck patterns', 'Lessons: expression and phrasing',
        'Lessons: progressions and composition', 'Course maps: fretboard and positions', 'Course color: modes and scale families', 'Course chords: triads and sevenths', 'Course progressions and voicings'
    ];
    const FOCUS = [
        'Prepare your instrument and name the target before playing.',
        'Sing the target sound first, then find it on the instrument.',
        'Play five slow, even repetitions and keep the motion relaxed.',
        'Isolate the hardest movement and repeat only that small part.',
        'Play the material ascending and descending without losing the pulse.',
        'Use the metronome at the listed tempo; keep every attack even.',
        'Move the same idea to a neighboring string set or fretboard position.',
        'Make a short call-and-response phrase using the idea you just practiced.',
        'Transpose the idea to the listed key while keeping its musical function.',
        'Check intonation, timing and clean muting; record one accurate take.'
    ];
    const FOUNDATION_FOCUS = [
        'Point to each instrument part and say its name before playing.',
        'Trace one string from tuning machine to bridge without touching another string.',
        'Pluck one open string and let it ring without an accidental buzz.',
        'Compare two open strings and name which pitch sounds higher.',
        'Play the same open string three times with an even, relaxed motion.',
        'Tap four steady beats, then pluck the open string once on each beat.',
        'Move between two neighboring strings while keeping the unused string quiet.',
        'Fret one of the first three frets, release, and listen for a clean change.',
        'Repeat the action after checking the instrument tuning and hand position.',
        'Self-check: relaxed posture, clear tone, steady timing and quiet unused strings.'
    ];
    const INTRO_CONCEPTS = INTRO.map(function (item) {
        return { title: item.title, description: item.description, text: item.text, tasks: item.steps, source: 'Instrument foundations', foundation: true };
    });
    const lessons = typeof window.createLessonsData === 'function' ? window.createLessonsData() : [];
    const lessonConcepts = lessons.map(function (lesson) {
        return { title: lesson.title, description: lesson.description, text: lesson.text, tasks: lesson.steps, source: 'Music Lessons', patternType: lesson.patternType, patternId: lesson.patternId };
    });
    const courses = Array.isArray(window.STCourses) ? window.STCourses : [];
    const courseConcepts = courses.slice(4).map(function (course) {
        return { title: course.title, description: course.text, text: course.text, tasks: (course.learn || []).concat((course.steps || []).map(function (step) { return step.label; })), source: 'Courses' };
    });
    const CONCEPTS = INTRO_CONCEPTS.concat(lessonConcepts, courseConcepts).slice(0, 200);
    const MAP_TOTAL = 20000;

    function readJson(key, fallback) {
        try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch (error) { return fallback; }
    }
    function cleanSettings(raw) {
        const next = Object.assign({}, DEFAULT_SETTINGS, raw && typeof raw === 'object' ? raw : {});
        if (!KEYS.includes(next.key)) next.key = 'C';
        if (!INSTRUMENTS[next.instrument]) next.instrument = 'guitar';
        if (!['sine', 'triangle', 'square', 'sawtooth'].includes(next.waveform)) next.waveform = 'triangle';
        next.volume = Math.max(0, Math.min(0.8, Number(next.volume) || 0));
        next.tone = Math.max(0, Math.min(100, Number(next.tone) || 0));
        next.bpm = Math.max(40, Math.min(200, Number(next.bpm) || 80));
        next.sustain = Math.max(0.25, Math.min(5, Number(next.sustain) || 1.5));
        return next;
    }
    const settings = cleanSettings(readJson(STORAGE_SETTINGS, {}));
    const storedMap = readJson(STORAGE_MAP, {});
    let mapStep = Number.isInteger(storedMap.current) ? Math.max(1, Math.min(MAP_TOTAL, storedMap.current)) : 1;
    let completed = new Set(Array.isArray(storedMap.completed) ? storedMap.completed.filter(function (n) { return Number.isInteger(n) && n >= 1 && n <= MAP_TOTAL; }) : []);
    let panel = { type: 'intro', index: 0 };
    let windowState = 'open';
    let practiceSections = null;
    let practicePromise = null;
    let audioContext = null;
    let audioFilter = null;
    let audioMaster = null;
    let audioGeneration = 0;
    const voices = new Set();
    let patternMode = 'major';
    let patternIndex = 0;
    let patternKey = settings.key;
    let playPatternId = '';

    const windowEl = root.getElementById('primer-window');
    const indexEl = root.getElementById('primer-index');
    const pageEl = root.getElementById('primer-page');
    const windowTitleEl = root.getElementById('primer-window-title');
    const statusEl = root.getElementById('primer-status');
    const countEl = root.getElementById('primer-status-count');
    const taskbarEl = root.getElementById('primer-taskbar');
    const restoreButton = root.getElementById('primer-restore');
    const taskbarState = root.getElementById('primer-taskbar-state');
    const neckEl = root.getElementById('primer-neck');
    const neckTitle = root.getElementById('primer-neck-title');
    const neckInstrument = root.getElementById('primer-neck-instrument');

    function element(tag, className, text) {
        const node = root.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = String(text);
        return node;
    }
    function saveSettings() {
        try { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)); } catch (error) { setStatus('Settings could not be saved on this device.'); }
        updateAudioChain();
    }
    function saveMap() {
        try { localStorage.setItem(STORAGE_MAP, JSON.stringify({ current: mapStep, completed: Array.from(completed) })); } catch (error) { setStatus('Map progress could not be saved on this device.'); }
        countEl.textContent = completed.size + ' / ' + MAP_TOTAL.toLocaleString() + ' steps complete';
    }
    function setStatus(message) { statusEl.textContent = message; }
    function setPanel(next) {
        panel = next;
        if (windowState !== 'open') restoreWindow(false);
        render();
    }
    function showTool(action) {
        if (action === 'stop') { stopAudio(); setStatus('All Primer audio stopped.'); return; }
        const types = { play: 'play', read: 'read', map: 'map', pattern: 'pattern', mixer: 'mixer', setup: 'setup', tuning: 'tuning', help: 'help' };
        if (types[action]) {
            if (action === 'read') setPanel({ type: 'read', category: '', index: 0 });
            else setPanel({ type: types[action] });
        }
    }
    function updateToolState() {
        const active = panel.type === 'read' ? 'read' : panel.type;
        root.querySelectorAll('.primer-tool[data-action]').forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.dataset.action === active));
        });
    }
    function render() {
        updateToolState();
        windowTitleEl.textContent = 'Primer / ' + panelTitle();
        indexEl.replaceChildren();
        pageEl.replaceChildren();
        if (panel.type === 'intro') renderIntro();
        else if (panel.type === 'read') renderRead();
        else if (panel.type === 'map') renderMap();
        else if (panel.type === 'play') renderPlay();
        else if (panel.type === 'pattern') renderPattern();
        else if (panel.type === 'mixer') renderMixer();
        else if (panel.type === 'setup') renderSetup();
        else if (panel.type === 'tuning') renderTuning();
        else if (panel.type === 'help') renderHelp();
        renderNeck();
    }
    function panelTitle() {
        if (panel.type === 'intro') return panel.index ? INTRO[panel.index].title : 'First sounds';
        if (panel.type === 'read') return panel.category ? ({ courses: 'Courses', lessons: 'Music Lessons', practice: 'Practice Room' }[panel.category] || 'Read') : 'Read';
        return ({ map: 'Learning Map', play: 'Play from a DAW', pattern: 'Chord Patterns', mixer: 'Mixer', setup: 'Setup', tuning: 'Tuning', help: 'Help' })[panel.type] || 'Reader';
    }
    function addIndexHeading(text) { indexEl.appendChild(element('h2', 'primer-index-heading', text)); }
    function addIndexButton(text, onClick, selected, extraClass) {
        const button = element('button', extraClass || '', text);
        button.type = 'button';
        if (selected) button.classList.add('is-selected');
        if (selected) button.setAttribute('aria-current', 'true');
        button.addEventListener('click', onClick);
        indexEl.appendChild(button);
        return button;
    }
    function addKicker(text) { pageEl.appendChild(element('p', 'primer-kicker', text)); }
    function addHeading(text, tag) { const heading = element(tag || 'h1', '', text); pageEl.appendChild(heading); return heading; }
    function addParagraph(text, className) { const p = element('p', className || '', text); pageEl.appendChild(p); return p; }
    function addLink(parent, href, label) {
        const a = element('a', '', label);
        a.href = href;
        parent.appendChild(a);
        return a;
    }
    function addList(parent, items, ordered) {
        const list = element(ordered ? 'ol' : 'ul', ordered ? 'primer-step-list' : '');
        (items || []).forEach(function (item) { list.appendChild(element('li', '', item)); });
        parent.appendChild(list);
        return list;
    }
    function actionButton(parent, text, handler, primary) {
        const button = element('button', primary ? 'primer-primary-button' : '', text);
        button.type = 'button';
        button.addEventListener('click', handler);
        parent.appendChild(button);
        return button;
    }
    function addMeta(parent, values) {
        const row = element('div', 'primer-page-meta');
        values.filter(Boolean).forEach(function (value) { row.appendChild(element('span', 'primer-chip', value)); });
        parent.appendChild(row);
    }
    function renderIntro() {
        const item = INTRO[Math.max(0, Math.min(INTRO.length - 1, Number(panel.index) || 0))];
        addIndexHeading('Instrument foundations');
        INTRO.forEach(function (chapter, index) {
            addIndexButton(String(index + 1).padStart(2, '0') + '  ' + chapter.title, function () { setPanel({ type: 'intro', index: index }); }, index === Number(panel.index));
        });
        addParagraph('Fretted string instruments / a guitar-first route with bass and ukulele setups', 'primer-index-note');
        addKicker('Primer / instrument foundations');
        addHeading(item.title);
        addParagraph(item.text, 'primer-lede');
        addHeading('First practice', 'h2');
        addList(pageEl, item.steps, true);
        const cards = element('div', 'primer-columns');
        const cardA = element('section', 'primer-card');
        cardA.appendChild(element('h2', '', 'A clear first sound'));
        cardA.appendChild(element('p', '', 'Tune one open string, pluck once, and let it ring. Keep the motion small and listen for a clean attack without string buzz.'));
        const cardB = element('section', 'primer-card');
        cardB.appendChild(element('h2', '', 'Continue the route'));
        cardB.appendChild(element('p', '', 'The map connects instrument setup to the existing lesson and course library, with each idea expanded into deliberate practice steps.'));
        cards.append(cardA, cardB);
        pageEl.appendChild(cards);
        const row = element('div', 'primer-action-row');
        actionButton(row, 'Open 20,000-step map', function () { setPanel({ type: 'map' }); }, true);
        actionButton(row, 'Tune open strings', function () { setPanel({ type: 'tuning' }); }, false);
        pageEl.appendChild(row);
    }
    function readTabs(selected) {
        const tabs = element('div', 'primer-tabs');
        [['courses', 'Courses'], ['lessons', 'Music Lessons'], ['practice', 'Practice Room']].forEach(function (entry) {
            const button = element('button', '', entry[1]);
            button.type = 'button';
            button.setAttribute('aria-pressed', String(selected === entry[0]));
            button.addEventListener('click', function () { openReadCategory(entry[0]); });
            tabs.appendChild(button);
        });
        pageEl.appendChild(tabs);
    }
    function openReadCategory(category) {
        setPanel({ type: 'read', category: category, index: 0 });
        if (category === 'practice') {
            loadPracticeSections().then(function () { if (panel.type === 'read' && panel.category === 'practice') render(); });
        }
    }
    function renderRead() {
        const category = panel.category;
        if (!category) {
            addIndexHeading('Read');
            [['courses', 'Courses'], ['lessons', 'Music Lessons'], ['practice', 'Practice Room']].forEach(function (entry) {
                addIndexButton(entry[1], function () { openReadCategory(entry[0]); }, false);
            });
            addKicker('Read / choose a library');
            addHeading('Read from the app library');
            addParagraph('Choose an existing course, a full Music Lesson, or a chapter from the Practice Room. Primer keeps the selected material in this reader and links back to its original page.');
            const cards = element('div', 'primer-source-list');
            const sources = [
                ['Courses', courses.length + ' guided course paths', 'courses'],
                ['Music Lessons', lessons.length + ' lessons with full explanations and practice steps', 'lessons'],
                ['Practice Room', 'Principles, tool guidance and example routines', 'practice']
            ];
            sources.forEach(function (source) {
                const button = element('button', '');
                button.type = 'button';
                button.appendChild(element('strong', '', source[0]));
                button.appendChild(element('small', '', source[1]));
                button.addEventListener('click', function () { openReadCategory(source[2]); });
                cards.appendChild(button);
            });
            pageEl.appendChild(cards);
            return;
        }
        readTabs(category);
        if (category === 'courses') {
            addIndexHeading('Courses (' + courses.length + ')');
            courses.forEach(function (course, index) { addIndexButton(course.title, function () { panel.index = index; render(); }, index === Number(panel.index)); });
            renderCourse(courses[Math.max(0, Math.min(courses.length - 1, Number(panel.index) || 0))]);
        } else if (category === 'lessons') {
            addIndexHeading('Music Lessons (' + lessons.length + ')');
            lessons.forEach(function (lesson, index) { addIndexButton(lesson.title, function () { panel.index = index; render(); }, index === Number(panel.index)); });
            renderLesson(lessons[Math.max(0, Math.min(lessons.length - 1, Number(panel.index) || 0))], Number(panel.index) || 0);
        } else {
            if (!practiceSections) {
                addIndexHeading('Practice Room');
                addIndexButton('Loading practice chapters...', function () {}, false);
                addKicker('Read / Practice Room');
                addHeading('Loading Practice Room');
                addParagraph('The chapter text is being read from practice.html.');
                return;
            }
            addIndexHeading('Practice Room (' + practiceSections.length + ')');
            practiceSections.forEach(function (section, index) { addIndexButton(section.title, function () { panel.index = index; render(); }, index === Number(panel.index)); });
            renderPracticeSection(practiceSections[Math.max(0, Math.min(practiceSections.length - 1, Number(panel.index) || 0))]);
        }
    }
    async function loadPracticeSections() {
        if (practiceSections) return practiceSections;
        if (practicePromise) return practicePromise;
        practicePromise = fetch('practice.html').then(function (response) {
            if (!response.ok) throw new Error('Practice Room could not be loaded.');
            return response.text();
        }).then(function (html) {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const source = doc.querySelector('.practice-text');
            if (!source) throw new Error('Practice Room content was not found.');
            const result = [];
            let current = { title: 'Introduction', paragraphs: [], bullets: [] };
            Array.from(source.children).forEach(function (child) {
                if (child.tagName === 'H3') {
                    if (current.paragraphs.length || current.bullets.length) result.push(current);
                    current = { title: child.textContent.trim(), paragraphs: [], bullets: [] };
                } else if (child.tagName === 'P') current.paragraphs.push(child.textContent.trim());
                else if (child.tagName === 'UL' || child.tagName === 'OL') Array.from(child.querySelectorAll(':scope > li')).forEach(function (li) { current.bullets.push(li.textContent.trim()); });
            });
            if (current.paragraphs.length || current.bullets.length) result.push(current);
            practiceSections = result;
            return result;
        }).catch(function () {
            practiceSections = [{ title: 'Practice Room', paragraphs: ['The Practice Room explains focused practice, steady timing, slow repetition, instrument setup, and example routines.'], bullets: ['Set one measurable goal.', 'Start slowly and use a metronome.', 'Pause when technique becomes tense.', 'Apply the drill in a short musical phrase.'] }];
            return practiceSections;
        });
        return practicePromise;
    }
    function renderCourse(course) {
        if (!course) { addKicker('Read / Courses'); addHeading('No course data is available'); return; }
        addKicker('Read / Courses / ' + course.level);
        addHeading(course.title);
        addParagraph(course.text, 'primer-lede');
        addHeading('Learning outcomes', 'h2');
        addList(pageEl, course.learn || [], false);
        addHeading('Course contents', 'h2');
        const list = element('ol', 'primer-course-steps');
        (course.steps || []).forEach(function (step) {
            const li = element('li');
            addLink(li, step.href || 'courses.html', step.label || step.kind || 'Open course item');
            li.appendChild(element('small', '', '  ' + (step.kind || 'Study')));
            list.appendChild(li);
        });
        pageEl.appendChild(list);
        const row = element('div', 'primer-action-row');
        addLink(row, 'courses.html', 'Open Courses');
        pageEl.appendChild(row);
    }
    function renderLesson(lesson, index) {
        if (!lesson) { addKicker('Read / Music Lessons'); addHeading('No lesson data is available'); return; }
        addKicker('Read / Music Lessons / Lesson ' + (index + 1) + ' of ' + lessons.length);
        addHeading(lesson.title);
        addParagraph(lesson.description, 'primer-lede');
        addParagraph(lesson.text);
        addMeta(pageEl, [lesson.patternType + ': ' + lesson.patternId, 'Key ' + settings.key]);
        const preview = element('div', 'primer-fretboard-preview');
        pageEl.appendChild(preview);
        if (window.MiniFretboard && lesson.patternType && lesson.patternId) {
            renderFretboard(preview, { key: settings.key, type: lesson.patternType, id: lesson.patternId, tuning: settings.instrument, labels: 'notes', frets: 12, title: lesson.title });
        }
        addHeading('Practice steps', 'h2');
        addList(pageEl, lesson.steps || [], true);
        if (Array.isArray(lesson.relatedSlides) && lesson.relatedSlides.length) {
            addHeading('Related patterns', 'h2');
            addParagraph(lesson.relatedSlides.join(' / '));
        }
        const row = element('div', 'primer-action-row');
        actionButton(row, 'Hear ' + (lesson.patternType === 'chord' ? 'chord' : 'scale'), async function () {
            const ok = await playArrangement([{ kind: lesson.patternType, item: lesson.patternId, key: settings.key, offset: 0, beats: 4 }], settings.key, settings.bpm);
            setStatus(ok ? 'Playing ' + lesson.title : 'Audio could not start. Check browser audio support.');
        }, true);
        addLink(row, 'lessons.html#lesson-' + index, 'Open in Music Lessons');
        pageEl.appendChild(row);
    }
    function renderPracticeSection(section) {
        if (!section) return;
        addKicker('Read / Practice Room');
        addHeading(section.title);
        (section.paragraphs || []).forEach(function (text) { addParagraph(text); });
        if (section.bullets && section.bullets.length) {
            addHeading('Practice notes', 'h2');
            addList(pageEl, section.bullets, false);
        }
        const row = element('div', 'primer-action-row');
        addLink(row, 'practice.html', 'Open Practice Room');
        pageEl.appendChild(row);
    }
    function renderMap() {
        const unitIndex = Math.floor((mapStep - 1) / 100);
        const stageIndex = Math.floor(unitIndex / 10);
        const concept = CONCEPTS[unitIndex] || CONCEPTS[0];
        addIndexHeading('20 chapters / 200 objectives');
        const tree = element('div', 'primer-map-tree');
        STAGE_NAMES.forEach(function (name, stage) {
            const details = element('details');
            if (stage === stageIndex) details.open = true;
            const summary = element('summary', '', String(stage + 1).padStart(2, '0') + '  ' + name + '  /  1,000 steps');
            details.appendChild(summary);
            const units = element('div', 'primer-map-units');
            for (let offset = 0; offset < 10; offset++) {
                const conceptIndex = stage * 10 + offset;
                const item = CONCEPTS[conceptIndex];
                if (!item) continue;
                const button = element('button', conceptIndex === unitIndex ? 'is-selected' : '', item.title);
                button.type = 'button';
                button.addEventListener('click', function () { setMapStep(conceptIndex * 100 + 1); });
                units.appendChild(button);
            }
            details.appendChild(units);
            tree.appendChild(details);
        });
        indexEl.appendChild(tree);
        const head = element('div', 'primer-map-head');
        head.appendChild(element('div', 'primer-kicker', 'Learning Map / Chapter ' + (stageIndex + 1) + ' / Objective ' + (unitIndex + 1)));
        head.appendChild(element('div', 'primer-chip', completed.size + ' complete'));
        const seek = element('label', 'primer-map-seek');
        seek.appendChild(element('span', '', 'Step 1'));
        const range = root.createElement('input');
        range.type = 'range'; range.min = '1'; range.max = String(MAP_TOTAL); range.value = String(mapStep); range.setAttribute('aria-label', 'Jump to learning step');
        const value = element('output', '', mapStep.toLocaleString());
        range.addEventListener('input', function () { value.value = Number(range.value).toLocaleString(); });
        range.addEventListener('change', function () { setMapStep(Number(range.value)); });
        seek.append(range, value, element('span', '', '20,000'));
        head.appendChild(seek);
        pageEl.appendChild(head);
        addHeading(concept.title, 'h1');
        addParagraph(concept.description, 'primer-lede');
        addMeta(pageEl, [concept.source, 'Step ' + mapStep.toLocaleString() + ' of ' + MAP_TOTAL.toLocaleString(), 'Pass ' + (Math.floor(((mapStep - 1) % 100) / 10) + 1) + ' / 10']);
        const task = element('section', 'primer-map-task');
        task.appendChild(element('div', 'primer-map-task-label', 'Deliberate practice / rep ' + (((mapStep - 1) % 10) + 1) + ' of 10'));
        const taskParts = mapTask(concept, unitIndex, mapStep);
        task.appendChild(element('p', '', taskParts.action));
        task.appendChild(element('p', '', taskParts.constraint));
        task.appendChild(element('p', '', taskParts.check));
        pageEl.appendChild(task);
        addHeading('Objective notes', 'h2');
        addParagraph(concept.text || concept.description);
        if (concept.tasks && concept.tasks.length) {
            addHeading('Source practice steps', 'h2');
            addList(pageEl, concept.tasks.slice(0, 8), true);
        }
        const pct = Math.round(completed.size * 100 / MAP_TOTAL);
        const progress = element('div', 'primer-map-progress');
        const fill = element('span'); fill.style.width = pct + '%'; progress.appendChild(fill); pageEl.appendChild(progress);
        const row = element('div', 'primer-action-row');
        actionButton(row, completed.has(mapStep) ? 'Completed' : 'Mark complete and continue', function () {
            completed.add(mapStep);
            saveMap();
            if (mapStep < MAP_TOTAL) setMapStep(mapStep + 1); else render();
        }, true).disabled = completed.has(mapStep);
        actionButton(row, 'Previous', function () { setMapStep(Math.max(1, mapStep - 1)); }, false).disabled = mapStep <= 1;
        actionButton(row, 'Next', function () { setMapStep(Math.min(MAP_TOTAL, mapStep + 1)); }, false).disabled = mapStep >= MAP_TOTAL;
        pageEl.appendChild(row);
        const origin = element('p', 'primer-index-note', 'Built from 110 instrument foundations, 50 existing Music Lessons and 40 focused course modules. Each objective has 10 passes with 10 practice constraints.');
        indexEl.appendChild(origin);
    }
    function mapTask(concept, unitIndex, step) {
        const within = (step - 1) % 100;
        const pass = Math.floor(within / 10);
        const rep = within % 10;
        const taskList = concept.tasks && concept.tasks.length ? concept.tasks : [concept.description];
        const base = taskList[(pass + rep) % taskList.length];
        const keyStart = Math.max(0, KEYS.indexOf(settings.key));
        const key = KEYS[(keyStart + unitIndex * 7 + pass * 5 + rep * 3) % KEYS.length];
        const stage = Math.floor(unitIndex / 10);
        const bpm = Math.min(174, 48 + stage * 10 + pass * 4);
        const instrument = INSTRUMENTS[settings.instrument].label;
        const focus = concept.foundation ? FOUNDATION_FOCUS[rep] : FOCUS[rep];
        return {
            action: 'Base action: ' + base,
            constraint: concept.foundation
                ? 'Use ' + instrument + ' with open strings and the first three frets. ' + focus
                : 'Practice on ' + instrument + ' in ' + key + ', around position ' + (1 + ((stage * 3 + pass) % 12)) + ', at ' + bpm + ' BPM. ' + focus,
            check: 'Complete this step when you can make three clean attempts in a row without losing the pulse or adding unwanted string noise.'
        };
    }
    function setMapStep(value) {
        mapStep = Math.max(1, Math.min(MAP_TOTAL, Math.round(Number(value) || 1)));
        saveMap();
        if (panel.type === 'map') render();
    }
    function savedPatterns() {
        const raw = readJson('st_daw_patterns_v1', []);
        const list = Array.isArray(raw) ? raw.slice(0, 1000) : [];
        const output = [];
        let skipped = 0;
        list.forEach(function (pattern) {
            if (!pattern || typeof pattern !== 'object' || typeof pattern.name !== 'string' || !Array.isArray(pattern.steps) || pattern.steps.length > 256) { skipped++; return; }
            const key = KEYS.includes(pattern.key) ? pattern.key : 'C';
            const steps = [];
            for (const step of pattern.steps) {
                if (!step || typeof step !== 'object') { skipped++; return; }
                const kind = step.kind;
                if (kind === 'rest') { steps.push({ kind: 'rest', beats: Math.max(1, Math.min(16, Number(step.beats) || 4)) }); continue; }
                const item = String(step.item || '');
                if (!['chord', 'scale', 'interval'].includes(kind) || !theory[kind === 'interval' ? 'intervals' : kind === 'chord' ? 'chords' : 'scales'][item]) { skipped++; return; }
                const offset = Number(step.offset);
                if (!Number.isFinite(offset) || offset < -24 || offset > 24) { skipped++; return; }
                steps.push({ kind: kind, item: item, offset: Math.round(offset), beats: Math.max(1, Math.min(16, Number(step.beats) || 4)), key: KEYS.includes(step.key) ? step.key : key });
            }
            if (!steps.length) { skipped++; return; }
            output.push({ id: String(pattern.id || pattern.name), name: pattern.name.slice(0, 120), key: key, tempo: Math.max(40, Math.min(220, Number(pattern.tempo) || settings.bpm)), steps: steps });
        });
        return { items: output, skipped: skipped };
    }
    function renderPlay() {
        const result = savedPatterns();
        addIndexHeading('Choose a DAW');
        addIndexButton('Pattern Studio', function () { root.getElementById('daw-open-link').click(); }, false);
        addIndexButton('Theory Decks DAW', function () { root.getElementById('td-daw-open-link').click(); }, false);
        addParagraph(result.items.length + ' saved Pattern Studio patterns', 'primer-index-note');
        addKicker('Play / select from your DAWs');
        addHeading('Play a saved arrangement');
        addParagraph('Primer can audition saved Pattern Studio blocks on this device. Use the links to edit or compose in either DAW.');
        const studioData = result;
        if (!studioData.items.length) {
            const empty = element('div', 'primer-empty', 'No saved Pattern Studio arrangements were found on this device. Save a pattern in Pattern Studio, then return here to audition it.');
            pageEl.appendChild(empty);
        } else {
            const label = element('label', 'primer-control');
            label.appendChild(element('strong', '', 'Saved Pattern Studio arrangement'));
            const select = root.createElement('select'); select.id = 'primer-play-pattern';
            studioData.items.forEach(function (pattern) { const option = root.createElement('option'); option.value = pattern.id; option.textContent = pattern.name + ' / ' + pattern.key + ' / ' + pattern.steps.length + ' blocks'; select.appendChild(option); });
            if (playPatternId && studioData.items.some(function (item) { return item.id === playPatternId; })) select.value = playPatternId;
            else playPatternId = select.value;
            select.addEventListener('change', function () { playPatternId = select.value; });
            label.appendChild(select);
            pageEl.appendChild(label);
            const current = studioData.items.find(function (item) { return item.id === select.value; }) || studioData.items[0];
            addParagraph(current.name + ' / ' + current.steps.length + ' blocks / ' + current.tempo + ' BPM / key ' + current.key);
            const row = element('div', 'primer-action-row');
            actionButton(row, 'Play selected pattern', async function () {
                const pattern = studioData.items.find(function (item) { return item.id === select.value; });
                const ok = pattern && await playArrangement(pattern.steps, pattern.key, pattern.tempo);
                setStatus(ok ? 'Playing ' + (pattern && pattern.name) : 'This arrangement could not be played.');
            }, true);
            pageEl.appendChild(row);
        }
        if (result.skipped) addParagraph(result.skipped + ' invalid or overlong saved entries were skipped.');
        const links = element('div', 'primer-link-list');
        const daw = element('a', '', ''); daw.href = 'daw.html'; daw.id = 'daw-open-link'; daw.append(element('strong', '', 'Open Pattern Studio'), element('span', '', 'Edit patterns and save them on this device')); links.appendChild(daw);
        const td = element('a', '', ''); td.href = 'theory-decks/daw.html'; td.id = 'td-daw-open-link';
        let tdTitle = 'Open Theory Decks DAW';
        const tdSong = readJson('td-daw', null);
        if (tdSong && typeof tdSong.title === 'string' && tdSong.title) tdTitle += ' / ' + tdSong.title.slice(0, 70);
        td.append(element('strong', '', tdTitle), element('span', '', 'Compose a song from chords and cards'));
        links.appendChild(td);
        pageEl.appendChild(links);
    }
    function progressionCatalog(mode) {
        const catalog = window.STProgressionPresets && window.STProgressionPresets[mode];
        return Array.isArray(catalog) ? catalog : [];
    }
    function renderPattern() {
        const catalog = progressionCatalog(patternMode);
        if (patternIndex >= catalog.length) patternIndex = 0;
        addIndexHeading('Progression functions');
        const modeButton = addIndexButton(patternMode === 'major' ? 'Major functions' : 'Minor functions', function () {
            patternMode = patternMode === 'major' ? 'minor' : 'major'; patternIndex = 0; render();
        }, false);
        modeButton.title = 'Switch between major and minor progression functions';
        addParagraph(catalog.length + ' progressions in this function family', 'primer-index-note');
        addKicker('Pattern / chord progression functions');
        addHeading('Choose a progression');
        addParagraph('Presets come from the Chord Progressions catalog. Select a tonic, inspect the function notes, then play the sequence through the Primer mixer.');
        if (!catalog.length) {
            pageEl.appendChild(element('div', 'primer-empty', 'The progression catalog is unavailable on this page.'));
            return;
        }
        const controls = element('div', 'primer-control-grid');
        const presetControl = element('label', 'primer-control');
        presetControl.appendChild(element('strong', '', 'Progression'));
        const presetSelect = root.createElement('select');
        catalog.forEach(function (item, index) { const option = root.createElement('option'); option.value = String(index); option.textContent = item[0]; presetSelect.appendChild(option); });
        presetSelect.value = String(patternIndex);
        presetSelect.addEventListener('change', function () { patternIndex = Number(presetSelect.value) || 0; render(); });
        presetControl.appendChild(presetSelect);
        const keyControl = element('label', 'primer-control');
        keyControl.appendChild(element('strong', '', 'Tonic key'));
        const keySelect = root.createElement('select');
        KEYS.forEach(function (key) { const option = root.createElement('option'); option.value = key; option.textContent = key; keySelect.appendChild(option); });
        keySelect.value = patternKey;
        keySelect.addEventListener('change', function () { patternKey = keySelect.value; renderNeck(); });
        keyControl.appendChild(keySelect);
        controls.append(presetControl, keyControl);
        pageEl.appendChild(controls);
        const selected = catalog[patternIndex];
        addHeading(selected[0], 'h2');
        addParagraph(selected[2] || 'A reusable progression from the existing chord-function catalog.');
        const sequence = selected[1];
        const roman = patternMode === 'major' ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
        const functionNames = patternMode === 'major' ? ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading tone'] : ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'subtonic'];
        const sequenceItems = sequence.map(function (degree) { return roman[degree] + ' / ' + functionNames[degree]; });
        addMeta(pageEl, sequenceItems);
        const row = element('div', 'primer-action-row');
        actionButton(row, 'Play progression', async function () {
            const offsets = patternMode === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
            const qualities = patternMode === 'major' ? ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'] : ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
            const steps = sequence.map(function (degree) { return { kind: 'chord', item: qualities[degree], key: patternKey, offset: offsets[degree], beats: 4 }; });
            const ok = await playArrangement(steps, patternKey, settings.bpm);
            setStatus(ok ? 'Playing ' + selected[0] + ' in ' + patternKey : 'Progression playback could not start.');
        }, true);
        pageEl.appendChild(row);
        addParagraph('Mixer tempo: ' + settings.bpm + ' BPM. Tone, volume and sustain are adjusted in Mixer.');
        const linkRow = element('div', 'primer-action-row'); addLink(linkRow, 'dummy.html', 'Open Chord Progressions'); pageEl.appendChild(linkRow);
    }
    function renderMixer() {
        addIndexHeading('Sound controls');
        [['Waveform', 'waveform'], ['Volume', 'volume'], ['Tone filter', 'tone'], ['Tempo', 'bpm'], ['String sustain', 'sustain']].forEach(function (entry) { addIndexButton(entry[0], function () { pageEl.querySelector('input[data-control="' + entry[1] + '"],select[data-control="' + entry[1] + '"]')?.focus(); }, false); });
        addKicker('Mixer / local sound');
        addHeading('Shape the sound');
        addParagraph('Mixer changes apply to Primer previews and tuning tones. Playback is generated locally in the browser.');
        const grid = element('div', 'primer-control-grid');
        const wave = element('label', 'primer-control');
        wave.appendChild(element('strong', '', 'Waveform'));
        const waveSelect = root.createElement('select'); waveSelect.dataset.control = 'waveform';
        [['sine', 'Sine'], ['triangle', 'Triangle'], ['square', 'Square'], ['sawtooth', 'Sawtooth']].forEach(function (item) { const option = root.createElement('option'); option.value = item[0]; option.textContent = item[1]; waveSelect.appendChild(option); });
        waveSelect.value = settings.waveform;
        waveSelect.addEventListener('change', function () { settings.waveform = waveSelect.value; saveSettings(); setStatus('Waveform set to ' + waveSelect.value + '.'); });
        wave.appendChild(waveSelect);
        grid.appendChild(wave);
        addRangeControl(grid, 'Volume', 'volume', 0, 0.8, 0.01, settings.volume, function (value) { settings.volume = value; return Math.round(value * 100) + '%'; });
        addRangeControl(grid, 'Tone filter', 'tone', 0, 100, 1, settings.tone, function (value) { return value < 35 ? 'Warm' : value > 70 ? 'Bright' : 'Balanced'; });
        addRangeControl(grid, 'Tempo', 'bpm', 40, 200, 1, settings.bpm, function (value) { return Math.round(value) + ' BPM'; });
        addRangeControl(grid, 'String sustain', 'sustain', 0.25, 5, 0.05, settings.sustain, function (value) { return Number(value).toFixed(2) + ' sec'; });
        pageEl.appendChild(grid);
        actionButton(pageEl, 'Stop sound', function () { stopAudio(); setStatus('All Primer audio stopped.'); }, false);
    }
    function addRangeControl(parent, title, key, min, max, step, value, format) {
        const box = element('label', 'primer-control');
        box.dataset.control = key;
        box.appendChild(element('strong', '', title));
        const row = element('div', 'primer-control-row');
        const range = root.createElement('input'); range.type = 'range'; range.min = String(min); range.max = String(max); range.step = String(step); range.value = String(value); range.dataset.control = key;
        const output = element('output', '', format(value));
        range.addEventListener('input', function () {
            const number = Number(range.value); settings[key] = number; output.value = format(number); saveSettings();
        });
        row.append(range, output); box.appendChild(row); parent.appendChild(box);
    }
    function renderSetup() {
        addIndexHeading('Primer defaults');
        addIndexButton('Default key', function () { root.getElementById('primer-default-key')?.focus(); }, false);
        addIndexButton('Instrument tuning', function () { root.getElementById('primer-default-instrument')?.focus(); }, false);
        addKicker('Setup / component defaults');
        addHeading('Main settings');
        addParagraph('These defaults are saved on this device and are used by the reader diagrams, map prompts, Pattern and Tuning.');
        const grid = element('div', 'primer-control-grid');
        const keyControl = element('label', 'primer-control');
        keyControl.appendChild(element('strong', '', 'Default key'));
        const keySelect = root.createElement('select'); keySelect.id = 'primer-default-key';
        KEYS.forEach(function (key) { const option = root.createElement('option'); option.value = key; option.textContent = key; keySelect.appendChild(option); });
        keySelect.value = settings.key;
        keySelect.addEventListener('change', function () { settings.key = keySelect.value; patternKey = settings.key; saveSettings(); renderNeck(); setStatus('Default key set to ' + settings.key + '.'); });
        keyControl.appendChild(keySelect);
        const instrumentControl = element('label', 'primer-control primer-instrument-tuning-control');
        instrumentControl.appendChild(element('strong', '', 'Instrument and tuning'));
        const instrumentSelect = root.createElement('select'); instrumentSelect.id = 'primer-default-instrument';
        Object.keys(INSTRUMENTS).forEach(function (key) { const option = root.createElement('option'); option.value = key; option.textContent = INSTRUMENTS[key].label + ' / ' + INSTRUMENTS[key].tuning; instrumentSelect.appendChild(option); });
        instrumentSelect.value = settings.instrument;
        instrumentSelect.addEventListener('change', function () { settings.instrument = instrumentSelect.value; saveSettings(); renderNeck(); setStatus('Instrument set to ' + INSTRUMENTS[settings.instrument].label + '.'); });
        instrumentControl.appendChild(instrumentSelect);
        grid.append(keyControl, instrumentControl);
        pageEl.appendChild(grid);
        addHeading('Fretboard display', 'h2');
        addParagraph('Lesson and map diagrams follow the selected key and instrument. Sound settings live in Mixer; string-by-string reference tones live in Tuning.');
        const row = element('div', 'primer-action-row');
        actionButton(row, 'Open Mixer', function () { setPanel({ type: 'mixer' }); }, false);
        actionButton(row, 'Open Tuning', function () { setPanel({ type: 'tuning' }); }, false);
        pageEl.appendChild(row);
    }
    function renderTuning() {
        const selected = INSTRUMENTS[settings.instrument];
        addIndexHeading('Open strings');
        addIndexButton('Play all open strings', function () { playAllStrings(); }, false);
        selected.strings.forEach(function (string, index) { addIndexButton('String ' + (selected.strings.length - index) + ' / ' + string.note + string.octave, function () { playOneString(index); }, false); });
        addKicker('Tuning / reference tones');
        addHeading(selected.label + ' / ' + selected.tuning);
        addParagraph('Play a reference note, then compare it with a tuner or the instrument. Add sustain seconds to let each pitch ring long enough to check.');
        const controls = element('div', 'primer-control-grid');
        const instrumentControl = element('label', 'primer-control');
        instrumentControl.appendChild(element('strong', '', 'Instrument'));
        const instrumentSelect = root.createElement('select');
        Object.keys(INSTRUMENTS).forEach(function (key) { const option = root.createElement('option'); option.value = key; option.textContent = INSTRUMENTS[key].label + ' / ' + INSTRUMENTS[key].tuning; instrumentSelect.appendChild(option); });
        instrumentSelect.value = settings.instrument;
        instrumentSelect.addEventListener('change', function () { settings.instrument = instrumentSelect.value; saveSettings(); render(); });
        instrumentControl.appendChild(instrumentSelect);
        const sustain = element('label', 'primer-control');
        sustain.appendChild(element('strong', '', 'Sustain seconds'));
        const seconds = root.createElement('input'); seconds.type = 'number'; seconds.min = '0.25'; seconds.max = '5'; seconds.step = '0.05'; seconds.value = String(settings.sustain); seconds.setAttribute('aria-label', 'Tuning tone sustain seconds');
        seconds.addEventListener('change', function () { settings.sustain = Math.max(0.25, Math.min(5, Number(seconds.value) || 1.5)); seconds.value = String(settings.sustain); saveSettings(); });
        sustain.appendChild(seconds);
        controls.append(instrumentControl, sustain); pageEl.appendChild(controls);
        const rows = element('div', 'primer-string-list');
        selected.strings.forEach(function (string, index) {
            const row = element('div', 'primer-string-row');
            row.appendChild(element('strong', '', 'String ' + (selected.strings.length - index)));
            row.appendChild(element('span', '', string.note + string.octave));
            const frequency = theory.getNoteFrequency(string.note, string.octave);
            row.appendChild(element('small', '', frequency ? frequency.toFixed(1) + ' Hz' : 'Reference pitch'));
            actionButton(row, 'Play', function () { playOneString(index); }, false);
            rows.appendChild(row);
        });
        pageEl.appendChild(rows);
        const row = element('div', 'primer-action-row');
        actionButton(row, 'Play all strings', playAllStrings, true);
        actionButton(row, 'Stop', function () { stopAudio(); setStatus('Tuning tone stopped.'); }, false);
        pageEl.appendChild(row);
        addParagraph('Reference pitch is equal temperament at A4 = 440 Hz. Tune with a physical or app tuner for exact string tension and intonation.');
    }
    async function playOneString(index) {
        const strings = INSTRUMENTS[settings.instrument].strings;
        const item = strings[index];
        if (!item) return;
        const frequency = theory.getNoteFrequency(item.note, item.octave);
        const ok = frequency && await playAudioEvents([{ frequency: frequency, start: 0, duration: settings.sustain }]);
        setStatus(ok ? 'Playing ' + item.note + item.octave + ' for ' + settings.sustain + ' seconds.' : 'Audio could not start.');
    }
    async function playAllStrings() {
        const strings = INSTRUMENTS[settings.instrument].strings;
        const events = strings.map(function (item, index) { return { frequency: theory.getNoteFrequency(item.note, item.octave), start: index * (settings.sustain + 0.12), duration: settings.sustain }; }).filter(function (item) { return item.frequency; });
        const ok = await playAudioEvents(events);
        setStatus(ok ? 'Playing all open-string reference tones.' : 'Audio could not start.');
    }
    function renderHelp() {
        addIndexHeading('Help and resources');
        [['Site Map', 'site-map.html'], ['Settings', 'settings.html'], ['About', 'about.html'], ['Release Notes', 'release-notes.html'], ['Courses', 'courses.html'], ['Music Lessons', 'lessons.html'], ['Practice Room', 'practice.html']].forEach(function (item) {
            const link = element('a', '', item[0]); link.href = item[1]; indexEl.appendChild(link);
        });
        addKicker('Help / app references');
        addHeading('Primer resources');
        addParagraph('Use the site map to find every tool, Settings to configure the wider app, or About and Release Notes for project details.');
        const list = element('div', 'primer-link-list');
        [['Site Map', 'site-map.html', 'Browse the full app directory'], ['Settings', 'settings.html', 'Configure app-wide defaults'], ['About', 'about.html', 'Read about Scales Thesaurus'], ['Release Notes', 'release-notes.html', 'See recent changes'], ['Courses', 'courses.html', 'Open the structured course library'], ['Music Lessons', 'lessons.html', 'Open all guided lessons'], ['Practice Room', 'practice.html', 'Open drills and practice guidance']].forEach(function (item) {
            const a = element('a', '', ''); a.href = item[1]; a.append(element('strong', '', item[0]), element('span', '', item[2])); list.appendChild(a);
        });
        pageEl.appendChild(list);
    }
    function renderFretboard(container, options) {
        window.MiniFretboard.render(container, options);
    }
    function renderNeck() {
        if (!neckEl) return;
        let type = 'scale', id = 'major', key = settings.key;
        if (panel.type === 'read' && panel.category === 'lessons') {
            const lesson = lessons[Number(panel.index) || 0];
            if (lesson && lesson.patternType && lesson.patternId) { type = lesson.patternType; id = lesson.patternId; }
        } else if (panel.type === 'pattern') {
            key = patternKey; id = patternMode === 'minor' ? 'minor' : 'major';
        } else if (panel.type === 'map') {
            const concept = CONCEPTS[Math.floor((mapStep - 1) / 100)];
            if (concept && concept.patternType && concept.patternId) { type = concept.patternType; id = concept.patternId; }
        }
        if (window.MiniFretboard) renderFretboard(neckEl, { key: key, type: type, id: id, tuning: settings.instrument, frets: 12, labels: 'notes', interactive: true, title: 'Primer ' + key + ' ' + id });
        neckTitle.textContent = 'FRETBOARD / ' + key.toUpperCase() + ' ' + (id || 'MAJOR').replace(/_/g, ' ').toUpperCase();
        const instrument = INSTRUMENTS[settings.instrument];
        neckInstrument.textContent = instrument.label.toUpperCase() + ' / ' + instrument.tuning.toUpperCase();
    }
    function getAudioChain() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!audioContext) {
            audioContext = new AudioContextClass();
            audioFilter = audioContext.createBiquadFilter();
            audioMaster = audioContext.createGain();
            audioFilter.type = 'lowpass';
            audioFilter.connect(audioMaster).connect(audioContext.destination);
        }
        updateAudioChain();
        return audioContext;
    }
    function updateAudioChain() {
        if (!audioContext || !audioFilter || !audioMaster) return;
        const now = audioContext.currentTime;
        audioMaster.gain.setTargetAtTime(settings.volume, now, 0.025);
        audioFilter.frequency.setTargetAtTime(250 * Math.pow(24, settings.tone / 100), now, 0.035);
        audioFilter.Q.setTargetAtTime(0.65, now, 0.035);
    }
    function stopAudio() {
        audioGeneration++;
        if (window.STAudioPreview && typeof window.STAudioPreview.stop === 'function') window.STAudioPreview.stop();
        if (!audioContext) return;
        const now = audioContext.currentTime;
        voices.forEach(function (voice) {
            try {
                voice.gain.gain.cancelScheduledValues(now);
                voice.gain.gain.setTargetAtTime(0.0001, now, 0.012);
                voice.oscillator.stop(now + 0.05);
            } catch (error) {}
        });
        voices.clear();
    }
    function playAudioEvents(events) {
        stopAudio();
        if (!Array.isArray(events) || !events.length) return false;
        const token = audioGeneration;
        let context;
        try { context = getAudioChain(); } catch (error) { return false; }
        if (!context) return false;
        const start = async function () {
            try {
                if (context.state !== 'running') await context.resume();
                if (token !== audioGeneration || context.state !== 'running') return false;
                const base = context.currentTime + 0.04;
                events.forEach(function (event) {
                    const frequency = Number(event.frequency);
                    const duration = Math.max(0.08, Math.min(20, Number(event.duration) || 0.5));
                    if (!Number.isFinite(frequency) || frequency < 20 || frequency > 16000) return;
                    const onset = base + Math.max(0, Number(event.start) || 0);
                    const oscillator = context.createOscillator();
                    const gain = context.createGain();
                    oscillator.type = settings.waveform;
                    oscillator.frequency.setValueAtTime(frequency, onset);
                    gain.gain.setValueAtTime(0.0001, onset);
                    gain.gain.exponentialRampToValueAtTime(0.2, onset + 0.02);
                    gain.gain.setValueAtTime(0.2, Math.max(onset + 0.025, onset + duration * 0.72));
                    gain.gain.exponentialRampToValueAtTime(0.0001, onset + duration);
                    oscillator.connect(gain).connect(audioFilter);
                    const voice = { oscillator: oscillator, gain: gain };
                    voices.add(voice);
                    oscillator.onended = function () { voices.delete(voice); };
                    oscillator.start(onset);
                    oscillator.stop(onset + duration + 0.04);
                });
                return true;
            } catch (error) {
                if (token === audioGeneration) setStatus('Browser audio could not start. Tap Play again to retry.');
                return false;
            }
        };
        return start();
    }
    function playArrangement(steps, key, bpm) {
        if (!Array.isArray(steps) || !steps.length) return false;
        const tempo = Math.max(40, Math.min(220, Number(bpm) || settings.bpm));
        const beat = 60 / tempo;
        let elapsed = 0;
        const events = [];
        for (const step of steps) {
            const blockBeats = Math.max(1, Math.min(16, Number(step.beats) || 4));
            const blockSeconds = blockBeats * beat;
            if (step.kind === 'rest') { elapsed += blockSeconds; continue; }
            const selectedKey = step.key || key || settings.key;
            const rootIndex = theory.notes.indexOf(theory.toSharp(selectedKey));
            if (rootIndex < 0) continue;
            const offset = ((Math.round(Number(step.offset) || 0) % 12) + 12) % 12;
            const root = theory.notes[(rootIndex + offset) % 12];
            let notes = [];
            if (step.kind === 'scale' && theory.scales[step.item]) notes = theory.getScaleNotes(root, step.item);
            else if (step.kind === 'chord' && theory.chords[step.item]) notes = theory.getChordNotes(root, step.item);
            else if (step.kind === 'interval' && theory.intervals[step.item]) notes = step.item === '1' ? [root] : [root, theory.getNoteFromInterval(root, step.item)];
            if (!notes.length) { elapsed += blockSeconds; continue; }
            let octave = step.kind === 'chord' ? 3 : 4;
            let previous = -Infinity;
            const frequencies = notes.map(function (note) {
                let frequency = theory.getNoteFrequency(note, octave);
                while (frequency && frequency <= previous && octave < 7 && !(step.kind === 'interval' && step.item === '1')) {
                    octave++;
                    frequency = theory.getNoteFrequency(note, octave);
                }
                if (frequency) previous = frequency;
                return frequency;
            }).filter(Boolean);
            if (step.kind === 'chord') {
                const bass = theory.getNoteFrequency(root, 2);
                if (bass) events.push({ frequency: bass, start: elapsed, duration: blockSeconds * 0.83 });
                frequencies.forEach(function (frequency, index) { events.push({ frequency: frequency, start: elapsed + index * 0.018, duration: blockSeconds * 0.83 }); });
            } else {
                const line = step.kind === 'scale' && frequencies.length > 2 ? frequencies.concat(frequencies.slice(0, -1).reverse()) : frequencies;
                const spacing = blockSeconds * 0.84 / Math.max(1, line.length);
                line.forEach(function (frequency, index) { events.push({ frequency: frequency, start: elapsed + index * spacing, duration: Math.max(0.12, spacing * 0.72) }); });
            }
            elapsed += blockSeconds;
        }
        return playAudioEvents(events);
    }
    function windowControl(action) {
        if (action === 'maximize') {
            windowEl.hidden = false; windowState = 'open'; windowEl.classList.remove('is-minimized', 'is-custom');
            const active = windowEl.classList.toggle('is-maximized');
            taskbarEl.hidden = true; setStatus(active ? 'Reader maximized.' : 'Reader returned to the workspace.');
        } else if (action === 'custom') {
            windowEl.hidden = false; windowState = 'open'; windowEl.classList.remove('is-minimized', 'is-maximized');
            const active = windowEl.classList.toggle('is-custom');
            taskbarEl.hidden = true; setStatus(active ? 'Custom size enabled. Drag the lower-right corner.' : 'Reader returned to the workspace size.');
        } else if (action === 'minimize') {
            windowState = 'minimized'; windowEl.hidden = true; windowEl.classList.add('is-minimized'); windowEl.classList.remove('is-maximized', 'is-custom');
            taskbarEl.hidden = false; restoreButton.textContent = 'Restore Primer'; taskbarState.textContent = 'Reader minimized';
        } else if (action === 'close') {
            stopAudio(); windowState = 'closed'; panel = { type: 'intro', index: 0 }; windowEl.hidden = true;
            windowEl.classList.remove('is-minimized', 'is-maximized', 'is-custom'); taskbarEl.hidden = false;
            restoreButton.textContent = 'Open Primer'; taskbarState.textContent = 'Reader closed'; setStatus('Reader closed. Use Open Primer or a toolbar tool to continue.');
        }
    }
    function restoreWindow(fromTaskbar) {
        const wasClosed = windowState === 'closed';
        windowState = 'open'; windowEl.hidden = false; windowEl.classList.remove('is-minimized', 'is-maximized', 'is-custom'); taskbarEl.hidden = true;
        if (wasClosed && fromTaskbar) panel = { type: 'intro', index: 0 };
        render();
        setStatus(wasClosed ? 'Primer reader opened.' : 'Reader restored.');
    }
    function renderWindowControls() {
        root.querySelectorAll('[data-window]').forEach(function (button) {
            button.addEventListener('click', function () { windowControl(button.dataset.window); });
        });
        restoreButton.addEventListener('click', function () { restoreWindow(true); });
        root.querySelector('.primer-toolbar').addEventListener('click', function (event) {
            const button = event.target.closest('[data-action]');
            if (button) showTool(button.dataset.action);
        });
    }
    function addStartupStatus() {
        countEl.textContent = completed.size + ' / ' + MAP_TOTAL.toLocaleString() + ' steps complete';
        setStatus(CONCEPTS.length === 200 ? '200 objectives / 20,000 deliberate practice steps ready.' : 'Learning map loaded with ' + CONCEPTS.length + ' objectives.');
    }
    function init() {
        renderWindowControls();
        addStartupStatus();
        render();
    }
    document.addEventListener('DOMContentLoaded', init);
})();