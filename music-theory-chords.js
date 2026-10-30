/**
 * Music Theory Chord Logic Extension
 * Contains methods for calculating chords from scales and Roman numerals.
 */

MusicTheory.prototype.getRelatedChords = function(key, scaleId, numNotes = 3) {
    const scaleNotes = this.getScaleNotes(key, scaleId);
    if (!scaleNotes || scaleNotes.length === 0) return [];

    const relatedChords = [];
    const scaleLength = scaleNotes.length;

    for (let i = 0; i < scaleLength; i++) {
        const rootNote = scaleNotes[i];
        const chordIntervals = [];

        for (let j = 0; j < numNotes; j++) {
            const noteIndex = (i + j * 2) % scaleLength;
            if (j > 0) {
                const interval = this.getInterval(rootNote, scaleNotes[noteIndex]);
                chordIntervals.push(interval);
            } else {
                chordIntervals.push('1');
            }
        }
        const quality = this.getChordQualityFromIntervals(chordIntervals);
        relatedChords.push(`${rootNote}${quality}`);
    }
    return relatedChords;
};

MusicTheory.prototype.getChordQualityFromIntervals = function(intervals) {
    const hasMajor3rd = intervals.includes('3');
    const hasMinor3rd = intervals.includes('b3');
    const hasPerfect5th = intervals.includes('5');
    const hasDiminished5th = intervals.includes('b5');
    const hasAugmented5th = intervals.includes('#5');
    const hasMajor7th = intervals.includes('7');
    const hasMinor7th = intervals.includes('b7');
    const hasDiminished7th = intervals.includes('6');

    if (intervals.length >= 4) {
        if (hasMajor3rd && hasPerfect5th && hasMajor7th) return 'maj7';
        if (hasMajor3rd && hasPerfect5th && hasMinor7th) return '7';
        if (hasMinor3rd && hasPerfect5th && hasMinor7th) return 'm7';
        if (hasMinor3rd && hasDiminished5th && hasMinor7th) return 'm7b5';
        if (hasMinor3rd && hasDiminished5th && hasDiminished7th) return 'dim7';
        if (hasMajor3rd && hasAugmented5th && hasMinor7th) return 'aug7';
        if (hasMajor3rd && hasAugmented5th && hasMajor7th) return 'maj7#5';
    }

    if (hasMajor3rd && hasPerfect5th) return '';
    if (hasMinor3rd && hasPerfect5th) return 'm';
    if (hasMinor3rd && hasDiminished5th) return 'dim';
    if (hasMajor3rd && hasAugmented5th) return 'aug';

    if (intervals.includes('4') && hasPerfect5th) return 'sus4';
    if (intervals.includes('2') && hasPerfect5th) return 'sus2';

    return '?';
};

MusicTheory.prototype.getChordInversions = function(notes) {
    if (notes.length < 3) return [];
    const inversions = [];
    inversions.push(`1st: ${notes.slice(1).concat(notes[0]).join('-')}`);
    if (notes.length > 3) {
        inversions.push(`2nd: ${notes.slice(2).concat(notes.slice(0, 2)).join('-')}`);
        inversions.push(`3rd: ${notes.slice(3).concat(notes.slice(0, 3)).join('-')}`);
    } else {
        inversions.push(`2nd: ${notes.slice(2).concat(notes.slice(0, 2)).join('-')}`);
    }
    return inversions;
};

MusicTheory.prototype.getChordFromRoman = function(romanNumeral, key) {
    const majorScale = this.getScaleNotes(key, 'major');
    let numeral = romanNumeral.toUpperCase();
    let index = 0;
    switch (numeral) {
        case 'I':    index = 0; break;
        case 'II':   index = 1; break;
        case 'III':  index = 2; break;
        case 'IV':   index = 3; break;
        case 'V':    index = 4; break;
        case 'VI':   index = 5; break;
        case 'VII':  index = 6; break;
        default:     index = 0;
    }
    let chord = majorScale[index];
    if (romanNumeral === romanNumeral.toLowerCase()) chord += 'm';
    return chord;
};