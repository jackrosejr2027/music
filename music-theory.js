/**
 * Music Theory Helper Class
 * Contains data and methods for notes, intervals, scales, and chords
 */
class MusicTheory {
    constructor() {
        // Define basic music theory components
        this.notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // removed this.intervals -> moved to music-theory-data.js
        this.intervals = (typeof MUSIC_THEORY_DATA !== 'undefined') ? MUSIC_THEORY_DATA.intervals : {};
        this.gamuts = (typeof MUSIC_THEORY_DATA !== 'undefined') ? MUSIC_THEORY_DATA.gamuts : {};
        
        // removed this.scales -> moved to music-theory-data.js -> moved to scales-data-*.js
        this.scales = (typeof window.SCALES_DATA_LIST !== 'undefined') ? window.SCALES_DATA_LIST : {};
        
        // removed this.chords, keySignatures, enharmonicPairs, noteStyles, romanNumerals, solfege, standardTunings -> moved to music-theory-data.js
        if (typeof MUSIC_THEORY_DATA !== 'undefined') {
            this.chords = MUSIC_THEORY_DATA.chords;
            this.keySignatures = MUSIC_THEORY_DATA.keySignatures;
            this.enharmonicPairs = MUSIC_THEORY_DATA.enharmonicPairs;
            this.noteStyles = MUSIC_THEORY_DATA.noteStyles;
            this.romanNumerals = MUSIC_THEORY_DATA.romanNumerals;
            this.solfege = MUSIC_THEORY_DATA.solfege;
            this.standardTunings = MUSIC_THEORY_DATA.standardTunings;
        }
        
        // removed colorThemes definition (moved to THEMES_DATA in themes-data.js)
        this.colorThemes = (typeof THEMES_DATA !== 'undefined') ? THEMES_DATA : {};
        
        try {
            this.customPatterns = JSON.parse(localStorage.getItem('customPatterns')) || {};
        } catch (e) {
            console.warn('Corrupt customPatterns in storage; starting fresh.', e);
            this.customPatterns = {};
        }
        
        this.loadCustomData();
    }

    loadCustomData() {
        try {
            const storedData = localStorage.getItem('manic_rules_custom_data');
            if (storedData) {
                const customData = JSON.parse(storedData);
                ['intervals', 'chords', 'scales'].forEach(type => {
                    if (customData[type]) {
                        Object.keys(customData[type]).forEach(id => {
                            if (this[type] && this[type][id]) {
                                Object.assign(this[type][id], customData[type][id]);
                            } else if (this[type] && customData[type][id].name && customData[type][id].intervals) {
                                this[type][id] = customData[type][id];
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.error('Error parsing custom data:', e);
        }
    }
    
    // removed getRelatedModes() {} -> moved to music-theory-logic.js

    // removed getRelatedChords() {} -> moved to music-theory-logic.js
    // removed getChordQualityFromIntervals() {} -> moved to music-theory-logic.js

    // removed getExpectedNotes() {} -> moved to music-theory-logic.js
    // removed getExpectedNoteForDegree() {} -> moved to music-theory-logic.js
    // removed adjustNoteToExpected() {} -> moved to music-theory-logic.js

    getScaleNotes(key, scaleType) {
        if (!this.scales[scaleType]) {
            return [];
        }
        
        const keyIndex = this.notes.indexOf(this.toSharp(key));
        if (keyIndex === -1) {
            return [];
        }
        
        const intervals = this.scales[scaleType].intervals;
        let computed = intervals.map(interval => this.getNoteFromInterval(key, interval));
        return this.spellByDegree(key, intervals, computed);
    }

    getChordNotes(key, chordType) {
        if (!this.chords[chordType]) {
            return [];
        }
        
        const keyIndex = this.notes.indexOf(this.toSharp(key));
        if (keyIndex === -1) {
            return [];
        }
        
        const intervals = this.chords[chordType].intervals;
        let computed = intervals.map(interval => this.getNoteFromInterval(key, interval));
        return this.spellByDegree(key, intervals, computed);
    }

    /**
     * v1.0: spell each note with the letter implied by its scale degree
     * (C minor pentatonic = C Eb F G Bb, F minor 7 = F Ab C Eb) instead of
     * positional letters, which mis-spelled every non-heptatonic pattern and all chords.
     * Allows single-accidental enharmonic spellings; falls back when a double accidental is needed.
     */
    spellByDegree(key, intervals, computed) {
        const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const root = this.toSharp(key);
        const rootLetterIdx = letters.indexOf(String(key)[0]);
        return computed.map((note, i) => {
            if (!note || rootLetterIdx === -1) return note;
            if (i === 0 || intervals[i] === '1') return key;
            const m = String(intervals[i]).match(/\d+/);
            if (!m) return note;
            const deg = (parseInt(m[0], 10) - 1) % 7;
            const letter = letters[(rootLetterIdx + deg) % 7];
            const diff = (this.notes.indexOf(note) - this.notes.indexOf(letter) + 12) % 12;
            let out = diff === 0 ? letter : diff === 1 ? letter + '#' : diff === 11 ? letter + 'b' : note;
            return out;
        });
    }

    getCustomNotes(key, customId) {
        if (!this.customPatterns || !this.customPatterns[customId]) return [];
        const intervals = Array.isArray(this.customPatterns[customId].intervals) ? this.customPatterns[customId].intervals : [];
        let computed = intervals.map(interval => this.getNoteFromInterval(key, interval)).filter(Boolean);
        return computed;
    }

    /**
     * Get a note based on a starting note and interval
     */
    /** Map flat spellings (Bb, Db...) to the sharp names used internally. */
    toSharp(note) {
        const map = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C' };
        return map[note] || note;
    }

    getNoteFromInterval(startNote, interval) {
        const startIndex = this.notes.indexOf(this.toSharp(startNote));
        if (startIndex === -1) {
            return null;
        }
        
        const semitones = this.getIntervalSemitones(interval);
        if (semitones === null) return null;
        const noteIndex = ((startIndex + semitones) % 12 + 12) % 12;
        return this.notes[noteIndex];
    }

    /**
     * Resolve the semitone distance of any interval label.
     * v1.0 fix: labels missing from the interval table (#5, #6, b4, b9, #9, 9, #11, b13, 13 ...)
     * previously resolved to 0 semitones, silently turning e.g. augmented chords into "C E C".
     */
    getIntervalSemitones(interval) {
        if (interval === null || interval === undefined) return null;
        const key = String(interval).trim();
        if (this.intervals[key] && typeof this.intervals[key].semitones === 'number') {
            return this.intervals[key].semitones;
        }
        const m = key.match(/^([b#♭♯]*)(\d+)$/);
        if (!m) return null;
        const degree = parseInt(m[2], 10);
        if (!degree) return null;
        const base = [0, 2, 4, 5, 7, 9, 11];
        let semis = base[(degree - 1) % 7] + Math.floor((degree - 1) / 7) * 12;
        for (const ch of m[1]) semis += (ch === 'b' || ch === '♭') ? -1 : 1;
        return semis;
    }
    
    /**
     * Get interval between two notes
     */
    getInterval(startNote, endNote) {
        const startIndex = this.notes.indexOf(this.toSharp(startNote));
        const endIndex = this.notes.indexOf(this.toSharp(endNote));
        
        if (startIndex === -1 || endIndex === -1) {
            return null;
        }
        
        let semitones = (endIndex - startIndex + 12) % 12;

        // v1.0 fix: prefer the conventional spelling for each distance. Object key ordering
        // previously made 3 semitones resolve to "#2" instead of "b3".
        const preferred = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'][semitones];
        if (this.intervals[preferred] && this.intervals[preferred].semitones === semitones) return preferred;
        
        // Find the interval based on semitones
        for (const [intervalName, data] of Object.entries(this.intervals)) {
            if (data.semitones === semitones) {
                return intervalName;
            }
        }
        
        return null;
    }
    
    /**
     * Get Roman numeral for a scale degree
     */
    getRomanNumeral(scaleDegree, isMajor = true) {
        const index = scaleDegree - 1;
        if (index < 0 || index >= 7) return '';
        return isMajor ? this.romanNumerals.major[index] : this.romanNumerals.minor[index];
    }
    
    /**
     * Get default tuning for a given number of strings
     */
    getDefaultTuning(stringCount) {
        // Return the standard tuning if it exists
        if (this.standardTunings[stringCount]) {
            return [...this.standardTunings[stringCount]];
        }
        
        // For non-standard string counts, generate something reasonable
        if (stringCount <= 3) {
            return Array(stringCount).fill().map((_, i) => {
                const index = (7 + i * 5) % 12; // Perfect 4ths
                return this.notes[index];
            });
        } else {
            // Add lower strings
            const baseTuning = [...this.standardTunings[6]]; // Guitar tuning
            
            if (stringCount < 6) {
                return baseTuning.slice(0, stringCount);
            } else {
                // Add lower strings
                const extraLow = Array(stringCount - 6).fill().map((_, i) => {
                    const noteIndex = ((this.notes.indexOf('E') - (i + 1) * 5) % 12 + 12) % 12;
                    return this.notes[noteIndex];
                });
                return [...extraLow, ...baseTuning];
            }
        }
    }
    
    // removed getChordInversions() {} -> moved to music-theory-logic.js
    // removed getScaleDescription() {} -> moved to music-theory-logic.js
    // removed getChordDescription() {} -> moved to music-theory-logic.js
    // removed getIntervalQuality() {} -> moved to music-theory-logic.js
    // removed getIntervalConsonance() {} -> moved to music-theory-logic.js
    // removed getChordFromRoman() {} -> moved to music-theory-logic.js

    /**
     * Get the frequency for a note at a specific octave
     */
    getNoteFrequency(note, octave) {
        const A4 = 440;
        const A4Index = this.notes.indexOf('A');
        const noteIndex = this.notes.indexOf(this.toSharp ? this.toSharp(note) : note);
        if (noteIndex === -1) return null;
        const halfStepsFromA4 = (noteIndex - A4Index) + (octave - 4) * 12;
        return A4 * Math.pow(2, halfStepsFromA4 / 12);
    }
}