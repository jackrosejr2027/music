/**
 * Music Theory Logic Extension
 * Contains methods for calculating related modes, chords, and interval properties
 */

MusicTheory.prototype.getRelatedModes = function(scaleId) {
    const scale = this.scales[scaleId];
    if (scale?.parentScale) {
        const family = Object.values(this.scales).filter(item => item.parentScale === scale.parentScale).sort((a, b) => a.mode - b.mode);
        const start = family.indexOf(scale);
        return [...family.slice(start), ...family.slice(0, start)].map(item => item.name);
    }
    // Define relationships between parent scales and their modes
    const modeRelationships = {
        'major': {
            parent: 'major',
            modes: [
                { id: 'major', name: 'Ionian (Major)' },
                { id: 'dorian', name: 'Dorian' },
                { id: 'phrygian', name: 'Phrygian' },
                { id: 'lydian', name: 'Lydian' },
                { id: 'mixolydian', name: 'Mixolydian' },
                { id: 'natural_minor', name: 'Aeolian (Minor)' },
                { id: 'locrian', name: 'Locrian' }
            ]
        },
        'melodic_minor': {
            parent: 'melodic_minor',
            modes: [
                { id: 'melodic_minor', name: 'Melodic Minor' },
                { id: 'dorian_flat_2', name: 'Dorian ♭2' },
                { id: 'lydian_augmented', name: 'Lydian Augmented' },
                { id: 'lydian_dominant', name: 'Lydian Dominant (Overtone)' },
                { id: 'mixolydian_flat_6', name: 'Mixolydian ♭6' },
                { id: 'locrian_sharp_2', name: 'Locrian ♯2' }, 
                { id: 'altered', name: 'Altered Scale (Super Locrian)' }
            ]
        },
        'harmonic_minor': {
            parent: 'harmonic_minor',
            modes: [
                { id: 'harmonic_minor', name: 'Harmonic Minor' },
                { id: 'locrian_natural_6', name: 'Locrian Natural 6' },
                { id: 'ionian_sharp_5', name: 'Ionian ♯5' }, 
                { id: 'dorian_sharp_4', name: 'Dorian ♯4' }, 
                { id: 'phrygian_dominant', name: 'Phrygian Dominant' },
                { id: 'lydian_sharp_2', name: 'Lydian ♯2' },
                { id: 'altered_dominant', name: 'Altered Dominant bb7 (Super Locrian bb7)' }
            ]
        },
        'dorian': { parent: 'major', index: 1 },
        'phrygian': { parent: 'major', index: 2 },
            'lydian': { parent: 'major', index: 3 },
            'mixolydian': { parent: 'major', index: 4 },
            'natural_minor': { parent: 'major', index: 5 },
            'locrian': { parent: 'major', index: 6 },
            'dorian_flat_2': { parent: 'melodic_minor', index: 1 },
            'lydian_augmented': { parent: 'melodic_minor', index: 2 },
            'lydian_dominant': { parent: 'melodic_minor', index: 3 },
            'mixolydian_flat_6': { parent: 'melodic_minor', index: 4 },
            'locrian_sharp_2': { parent: 'melodic_minor', index: 5 },
            'altered': { parent: 'melodic_minor', index: 6 },
            'locrian_natural_6': { parent: 'harmonic_minor', index: 1 },
            'ionian_sharp_5': { parent: 'harmonic_minor', index: 2 },
            'dorian_sharp_4': { parent: 'harmonic_minor', index: 3 },
            'phrygian_dominant': { parent: 'harmonic_minor', index: 4 },
            'lydian_sharp_2': { parent: 'harmonic_minor', index: 5 },
        'altered_dominant': { parent: 'harmonic_minor', index: 6 }
    };

    const relationship = modeRelationships[scaleId];
    if (relationship) {
        if (relationship.modes) {
            return relationship.modes.map(mode => mode.name);
        }
        else if (relationship.parent && modeRelationships[relationship.parent]?.modes) {
                const parentModes = modeRelationships[relationship.parent].modes;
                const startIndex = relationship.index;
                const reorderedModes = [
                    ...parentModes.slice(startIndex),
                    ...parentModes.slice(0, startIndex)
                ];
                return reorderedModes.map(mode => mode.name);
        }
    }
    return [];
};

// removed getRelatedChords() {} -> moved to music-theory-chords.js
// removed getChordQualityFromIntervals() {} -> moved to music-theory-chords.js

MusicTheory.prototype.getExpectedNotes = function(tonic, count) {
    const musicalAlphabet = ['A','B','C','D','E','F','G'];
    let rootLetter = tonic[0];
    let startIndex = musicalAlphabet.indexOf(rootLetter);
    let keySig = this.keySignatures[tonic] || {};
    let expected = [];
    for (let i = 0; i < count; i++) {
        let letter = musicalAlphabet[(startIndex + i) % 7];
        let accidental = keySig[letter] || "";
        expected.push(letter + accidental);
    }
    return expected;
};

MusicTheory.prototype.getExpectedNoteForDegree = function(tonic, degree) {
    const musicalAlphabet = ['A','B','C','D','E','F','G'];
    let rootLetter = tonic[0];
    let startIndex = musicalAlphabet.indexOf(rootLetter);
    let letter = musicalAlphabet[(startIndex + degree - 1) % 7];
    let keySig = this.keySignatures[tonic] || {};
    let accidental = keySig[letter] || "";
    return letter + accidental;
};

MusicTheory.prototype.adjustNoteToExpected = function(note, expected) {
    if (note === expected) return note;
    if (this.enharmonicPairs[note] && this.enharmonicPairs[note] === expected) {
            return expected;
    }
    return note;
};

// removed getChordInversions() {} -> moved to music-theory-chords.js

// removed descriptions body -> moved to music-theory-descriptions.js
// removed getChordDescription() {} -> moved to music-theory-descriptions.js
// removed getIntervalQuality() {} -> moved to music-theory-descriptions.js
// removed getIntervalConsonance() {} -> moved to music-theory-descriptions.js
// removed getChordFromRoman() {} -> moved to music-theory-chords.js