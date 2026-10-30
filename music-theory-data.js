const MUSIC_THEORY_DATA = {
    intervals: {
        '1':  { name: 'Root/Unison', shortName: 'R',  semitones: 0,  color: '#140000', fontColor: '#FFFFFF' },
        'b2': { name: 'Minor 2nd',  shortName: 'b2', semitones: 1,  color: '#280000', fontColor: '#FFFFFF' },
        '2':  { name: 'Major 2nd',  shortName: '2',  semitones: 2,  color: '#3C0000', fontColor: '#FFFFFF' },
        '#2': { name: 'Augmented 2nd', shortName: '#2', semitones: 3, color: '#500000', fontColor: '#FFFFFF' },
        'b3': { name: 'Minor 3rd',  shortName: 'b3', semitones: 3,  color: '#640000', fontColor: '#FFFFFF' },
        '3':  { name: 'Major 3rd',  shortName: '3',  semitones: 4,  color: '#780000', fontColor: '#FFFFFF' },
        '4':  { name: 'Perfect 4th', shortName: '4',  semitones: 5,  color: '#8C0000', fontColor: '#FFFFFF' },
        '#4': { name: 'Augmented 4th', shortName: '#4', semitones: 6, color: '#8C0000', fontColor: '#FFFFFF' },
        'b5': { name: 'Diminished 5th', shortName: 'b5', semitones: 6, color: '#8C0000', fontColor: '#FFFFFF' },
        '5':  { name: 'Perfect 5th', shortName: '5',  semitones: 7,  color: '#A00000', fontColor: '#FFFFFF' },
        'b6': { name: 'Minor 6th',  shortName: 'b6', semitones: 8,  color: '#B40000', fontColor: '#FFFFFF' },
        '6':  { name: 'Major 6th',  shortName: '6',  semitones: 9,  color: '#C80000', fontColor: '#FFFFFF' },
        'b7': { name: 'Minor 7th',  shortName: 'b7', semitones: 10, color: '#DC0000', fontColor: '#FFFFFF' },
        '7':  { name: 'Major 7th',  shortName: '7',  semitones: 11, color: '#F00000', fontColor: '#FFFFFF' }
    },
    gamuts: (function() {
        const g = {
            '000001': {
                name: 'Gamut 000001',
                positions: [
                    { string: 0, fret: 5 }, { string: 0, fret: 6 },
                    { string: 1, fret: 5 }, { string: 1, fret: 6 },
                    { string: 2, fret: 5 }, { string: 2, fret: 6 },
                    { string: 3, fret: 5 }, { string: 3, fret: 6 },
                    { string: 4, fret: 5 }, { string: 4, fret: 6 },
                    { string: 5, fret: 5 }, { string: 5, fret: 6 }
                ]
            }
        };
        // Add 100 more systematically generated block gamuts
        for (let i = 2; i <= 101; i++) {
            const id = i.toString().padStart(6, '0');
            const startFret = ((i - 2) % 20) + 1;
            const span = Math.floor((i - 2) / 20) + 2;
            const positions = [];
            for (let s = 0; s < 6; s++) {
                for (let f = 0; f < span; f++) {
                    positions.push({ string: s, fret: startFret + f });
                }
            }
            g[id] = {
                name: `Gamut ${id}`,
                positions: positions
            };
        }
        // Add 100 more gamuts with specific fret patterns (e.g. 124, 134)
        const patterns = [
            [0, 1, 3], // 1-2-4
            [0, 2, 3], // 1-3-4
            [0, 2, 4], // 1-3-5
            [0, 1, 4], // 1-2-5
            [0, 1, 2, 4], // 1-2-3-5
            [0, 1, 3, 4], // 1-2-4-5
            [0, 2, 3, 4], // 1-3-4-5
            [0, 1, 2, 3, 5],
            [0, 1, 3, 5],
            [0, 1, 4, 5]
        ];
        for (let i = 102; i <= 201; i++) {
            const id = i.toString().padStart(6, '0');
            const patternIdx = (i - 102) % patterns.length;
            const p = patterns[patternIdx];
            const startFret = (((i - 102) / patterns.length) | 0) % 20 + 1;
            const positions = [];
            for (let s = 0; s < 6; s++) {
                for (const offset of p) {
                    positions.push({ string: s, fret: startFret + offset });
                }
            }
            g[id] = {
                name: `Gamut ${id} Pattern ${p.map(x => x + 1).join('')}`,
                positions: positions
            };
        }

        // NEW: Add 50 gamuts focusing on 4-string patterns (strings grouped as 6-3, 5-2, 4-1)
        // IDs 000202 - 000251
        (function addFourStringPatterns() {
            const groups = [
                { name: '6-3', strings: [5,4,3,2] }, // top-to-bottom index: string 6 -> index 5 ... string 3 -> index 2
                { name: '5-2', strings: [4,3,2,1] },
                { name: '4-1', strings: [3,2,1,0] }
            ];
            // A set of small fret patterns to place across the 4-string span
            const fourPatterns = [
                [0,1,3,5],
                [0,2,4,6],
                [1,2,3,4],
                [0,1,4,5],
                [2,3,5,7],
                [0,3,5,8],
                [1,4,6,8],
                [0,2,5,7],
                [0,1,2,3],
                [3,4,5,6]
            ];
            let startId = 202;
            for (let idx = 0; idx < 50; idx++) {
                const id = startId + idx;
                const idStr = id.toString().padStart(6, '0');
                const group = groups[idx % groups.length];
                const pattern = fourPatterns[idx % fourPatterns.length];
                // stagger start frets so patterns are distributed across the neck
                const startFret = ((idx * 3) % 16) + 1;
                const positions = [];
                // map a single pattern offset to each of the group's 4 strings so there is only one note per string
                for (let i = 0; i < group.strings.length; i++) {
                    const s = group.strings[i];
                    // assign one offset per string (wrap pattern if shorter than strings)
                    const offset = pattern[i % pattern.length];
                    positions.push({ string: s, fret: startFret + offset });
                }
                g[idStr] = {
                    name: `Gamut ${idStr} (${group.name} 4-string single-note-per-string pattern)`,
                    positions: positions
                };
            }

            // ADDITIONAL: Add 50 more 4-string single-note-per-string gamuts (IDs 000252 - 000301)
            // Use different start fret staggering and pattern rotation to diversify placements
            let extraStartId = 252;
            for (let idx = 0; idx < 50; idx++) {
                const id = extraStartId + idx;
                const idStr = id.toString().padStart(6, '0');
                const group = groups[(idx + 1) % groups.length]; // shift group selection for variety
                const pattern = fourPatterns[(idx + 3) % fourPatterns.length]; // different rotation
                // stagger start frets differently so these occupy other neck regions
                const startFret = (((idx * 4) + 5) % 18) + 1;
                const positions = [];
                for (let i = 0; i < group.strings.length; i++) {
                    const s = group.strings[i];
                    const offset = pattern[i % pattern.length];
                    positions.push({ string: s, fret: startFret + offset });
                }
                g[idStr] = {
                    name: `Gamut ${idStr} (${group.name} 4-string single-note-per-string pattern)`,
                    positions: positions
                };
            }
        })();

        return g;
    })(),
    // removed scales object -> moved to scales-data-list.js
    chords: {
        'major': { name: 'Major', intervals: ['1', '3', '5'] },
        'minor': { name: 'Minor', intervals: ['1', 'b3', '5'] },
        'diminished': { name: 'Diminished', intervals: ['1', 'b3', 'b5'] },
        'augmented': { name: 'Augmented', intervals: ['1', '3', '#5'] },
        'sus2': { name: 'Sus2', intervals: ['1', '2', '5'] },
        'sus4': { name: 'Sus4', intervals: ['1', '4', '5'] },
        'major7': { name: 'Major 7', intervals: ['1', '3', '5', '7'] },
        'dominant7': { name: 'Dominant 7', intervals: ['1', '3', '5', 'b7'] },
        'minor7': { name: 'Minor 7', intervals: ['1', 'b3', '5', 'b7'] },
        'diminished7': { name: 'Diminished 7', intervals: ['1', 'b3', 'b5', '6'] },
        'half_diminished': { name: 'Half Diminished', intervals: ['1', 'b3', 'b5', 'b7'] },
        'augmented7': { name: 'Augmented 7', intervals: ['1', '3', '#5', 'b7'] },
        'add9': { name: 'Add9', intervals: ['1', '3', '5', '2'] },
        '6': { name: '6', intervals: ['1', '3', '5', '6'] },
        'm6': { name: 'Minor 6', intervals: ['1', 'b3', '5', '6'] },
        'maj9': { name: 'Major 9', intervals: ['1', '3', '5', '7', '2'] },
        'dom9': { name: 'Dominant 9', intervals: ['1', '3', '5', 'b7', '2'] },
        'min9': { name: 'Minor 9', intervals: ['1', 'b3', '5', 'b7', '2'] },
        'maj11': { name: 'Major 11', intervals: ['1', '3', '5', '7', '2', '4'] },
        'dom11': { name: 'Dominant 11', intervals: ['1', '3', '5', 'b7', '2', '4'] },
        'min11': { name: 'Minor 11', intervals: ['1', 'b3', '5', 'b7', '2', '4'] },
        'maj13': { name: 'Major 13', intervals: ['1', '3', '5', '7', '2', '4', '6'] },
        'dom13': { name: 'Dominant 13', intervals: ['1', '3', '5', 'b7', '2', '4', '6'] },
        'min13': { name: 'Minor 13', intervals: ['1', 'b3', '5', 'b7', '2', '4', '6'] },
        '7sus4': { name: '7sus4', intervals: ['1', '4', '5', 'b7'] },
        '9sus4': { name: '9sus4', intervals: ['1', '4', '5', 'b7', '2'] },
        'add11': { name: 'Add11', intervals: ['1', '3', '5', '4'] },
        'madd11': { name: 'Minor Add11', intervals: ['1', 'b3', '5', '4'] },
        'madd9': { name: 'Minor Add9', intervals: ['1', 'b3', '5', '2'] },
        '7b9': { name: '7(b9)', intervals: ['1', '3', '5', 'b7', 'b2'] },
        '7#9': { name: '7(#9)', intervals: ['1', '3', '5', 'b7', '#2'] },
        '7#11': { name: '7(#11)', intervals: ['1', '3', '5', 'b7', '#4'] },
        '7b13': { name: '7(b13)', intervals: ['1', '3', '5', 'b7', 'b6'] },
        '7#5': { name: '7(#5)', intervals: ['1', '3', '#5', 'b7'] },
        '7b5': { name: '7(b5)', intervals: ['1', '3', 'b5', 'b7'] },
        'alt7': { name: 'Altered 7', intervals: ['1', '3', 'b5', 'b7', 'b9', '#9'] },
        'maj7#5': { name: 'Maj7(#5)', intervals: ['1', '3', '#5', '7'] },
        'maj7b5': { name: 'Maj7(b5)', intervals: ['1', '3', 'b5', '7'] },
        'm7b5': { name: 'm7(b5)', intervals: ['1', 'b3', 'b5', 'b7'] },
        'maj7#11': { name: 'Maj7(#11)', intervals: ['1', '3', '5', '7', '#4'] },
        '5': { name: '5 (Power Chord)', intervals: ['1', '5'] },
        'dim7b9': { name: 'dim7(b9)', intervals: ['1', 'b3', 'b5', '6', 'b2'] },
        'm7#5': { name: 'm7(#5)', intervals: ['1', 'b3', '#5', 'b7'] },
        '6add9': { name: '6/9', intervals: ['1', '3', '5', '6', '2'] },
        'm6add9': { name: 'm6/9', intervals: ['1', 'b3', '5', '6', '2'] },
        '7sus2': { name: '7sus2', intervals: ['1', '2', '5', 'b7'] },
        '13sus4': { name: '13sus4', intervals: ['1', '4', '5', 'b7', '6'] },
        'maj7sus2': { name: 'Maj7sus2', intervals: ['1', '2', '5', '7'] },
        'maj7sus4': { name: 'Maj7sus4', intervals: ['1', '4', '5', '7'] },
        'maj9#11': { name: 'Maj9(#11)', intervals: ['1', '3', '5', '7', '2', '#4'] },
        'maj13#11': { name: 'Maj13(#11)', intervals: ['1', '3', '5', '7', '2', '#4', '6'] },
        '9#5': { name: '9(#5)', intervals: ['1', '3', '#5', 'b7', '2'] },
        '9b5': { name: '9(b5)', intervals: ['1', '3', 'b5', 'b7', '2'] },
        '13#9': { name: '13(#9)', intervals: ['1', '3', '5', 'b7', '#2', '4', '6'] },
        '13b9': { name: '13(b9)', intervals: ['1', '3', '5', 'b7', 'b2', '4', '6'] },
        '7#9#5': { name: '7(#9#5)', intervals: ['1', '3', '#5', 'b7', '#2'] },
        '7b9#5': { name: '7(b9#5)', intervals: ['1', '3', '#5', 'b7', 'b2'] },
        '7b9b5': { name: '7(b9b5)', intervals: ['1', '3', 'b5', 'b7', 'b2'] },
        '7#9b5': { name: '7(#9b5)', intervals: ['1', '3', 'b5', 'b7', '#2'] },
        '7b9#11': { name: '7(b9#11)', intervals: ['1', '3', '5', 'b7', 'b2', '#4'] },
        '7#9#11': { name: '7(#9#11)', intervals: ['1', '3', '5', 'b7', '#2', '#4'] },
        'maj7b9': { name: 'Maj7(b9)', intervals: ['1', '3', '5', '7', 'b2'] },
        'maj7#9': { name: 'Maj7(#9)', intervals: ['1', '3', '5', '7', '#2'] },
        'maj7b5b9': { name: 'Maj7(b5b9)', intervals: ['1', '3', 'b5', '7', 'b2'] },
        'maj7#5b9': { name: 'Maj7(#5b9)', intervals: ['1', '3', '#5', '7', 'b2'] },
        'maj7#5#9': { name: 'Maj7(#5#9)', intervals: ['1', '3', '#5', '7', '#2'] },
        'm9b5': { name: 'm9(b5)', intervals: ['1', 'b3', 'b5', 'b7', '2'] },
        'm9#5': { name: 'm9(#5)', intervals: ['1', 'b3', '#5', 'b7', '2'] },
        'm11b5': { name: 'm11(b5)', intervals: ['1', 'b3', 'b5', 'b7', '2', '4'] },
        'dim9': { name: 'dim9', intervals: ['1', 'b3', 'b5', '6', '2'] },
        'aug9': { name: 'aug9', intervals: ['1', '3', '#5', 'b7', '2'] },
        'sus4b9': { name: 'sus4(b9)', intervals: ['1', '4', '5', 'b7', 'b2'] },
        'sus4#9': { name: 'sus4(#9)', intervals: ['1', '4', '5', 'b7', '#2'] },
        'm7add11': { name: 'm7(add11)', intervals: ['1', 'b3', '5', 'b7', '4'] },
        'm6add11': { name: 'm6(add11)', intervals: ['1', 'b3', '5', '6', '4'] }
    },
    keySignatures: {
        "C": {},
        "G": {"F": "#"},
        "D": {"F": "#", "C": "#"},
        "A": {"F": "#", "C": "#", "G": "#"},
        "E": {"F": "#", "C": "#", "G": "#", "D": "#"},
        "B": {"F": "#", "C": "#", "G": "#", "D": "#", "A": "#"},
        "F#": {"F": "#", "C": "#", "G": "#", "D": "#", "A": "#", "E": "#"},
        "C#": {"F": "#", "C": "#", "G": "#", "D": "#", "A": "#", "E": "#", "B": "#"},
        "F": {"B": "b"},
        "Bb": {"B": "b", "E": "b"},
        "Eb": {"B": "b", "E": "b", "A": "b"},
        "Ab": {"B": "b", "E": "b", "A": "b", "D": "b"},
        "Db": {"B": "b", "E": "b", "A": "b", "D": "b", "G": "b"},
        "Gb": {"B": "b", "E": "b", "A": "b", "D": "b", "G": "b", "C": "b"},
        "Cb": {"B": "b", "E": "b", "A": "b", "D": "b", "G": "b", "C": "b", "F": "b"}
    },
    enharmonicPairs: {
        "A#": "Bb", "Bb": "A#",
        "C#": "Db", "Db": "C#",
        "D#": "Eb", "Eb": "D#",
        "F#": "Gb", "Gb": "F#",
        "G#": "Ab", "Ab": "G#"
    },
    noteStyles: {
        shapes: ['circle', 'square', 'diamond', 'triangle', 'hexagon', 'star', 'pentagon', 'octagon', 'heart', 'cross', 
                'plus', 'arrow', 'teardrop', 'oval', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'semicircle', 
                'crescent', 'ring', 'crosshair', 'donut', 'clover', 'flower', 'shield', 'crown', 'droplet', 'cloud', 
                'starburst', 'gear', 'cube', 'moon', 'sun', 'flag', 'ribbon', 'tag', 'bookmark', 'lightning', 'key'],
        fonts: ['Arial Narrow'],
        effects: ['none', 'glow', 'shadow', 'outline', 'highlight', 'pulsate', 'blink', 'wobble', 'rotate', 'bounce', 
                'flip', 'shake', 'jelly', 'fade', 'grow', 'shrink', 'blur', 'vibrate', 'sparkle', 'ripple',
                'wave', 'neon', 'shatter', 'glitch', 'rainbow', 'zoom', 'twinkle', 'splash', 'heatwave',
                'chroma', 'emboss', 'metallic', 'neumorphic', 'holographic', 'retro', 'pixelate', 'sketch',
                'paint', 'grime', 'distortion', 'liquefy', 'frosted', 'carved', 'vignette', 'noise', 'sticker',
                'psychedelic', 'relief', 'foil', 'brushed', 'glazed', 'watercolor', 'comic', 'bubble', 'gradient-pulse']
    },
    romanNumerals: {
        major: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'],
        minor: ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii']
    },
    solfege: {
        'C': 'Do', 'C#': 'Di', 'D': 'Re', 'D#': 'Ri', 
        'E': 'Mi', 'F': 'Fa', 'F#': 'Fi', 'G': 'Sol', 
        'G#': 'Si', 'A': 'La', 'A#': 'Li', 'B': 'Ti'
    },
    standardTunings: {
        4: ['G', 'D', 'A', 'E'],
        5: ['G', 'D', 'A', 'E', 'B'],
        6: ['E', 'A', 'D', 'G', 'B', 'E'],
        7: ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
        8: ['F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        12: ['E', 'E', 'A', 'A', 'D', 'D', 'G', 'G', 'B', 'B', 'E', 'E']
    }
};

// 240 additional, pitch-set-distinct chord formulas with explicit added tones.
(function () {
    const extraChords = {
        'more_chord_001': { name: 'Dominant 7 add 4', intervals: ["1","3","5","b7","4"] },
        'more_chord_002': { name: 'Dominant 7 add 6', intervals: ["1","3","5","b7","6"] },
        'more_chord_003': { name: 'Minor 7 add 6', intervals: ["1","b3","5","b7","6"] },
        'more_chord_004': { name: 'Major 7 add 4', intervals: ["1","3","5","7","4"] },
        'more_chord_005': { name: 'Major 7 add 6', intervals: ["1","3","5","7","6"] },
        'more_chord_006': { name: 'Sus2 add 4', intervals: ["1","2","5","4"] },
        'more_chord_007': { name: 'Sus2 add 6', intervals: ["1","2","5","6"] },
        'more_chord_008': { name: 'Sus4 add 6', intervals: ["1","4","5","6"] },
        'more_chord_009': { name: 'Diminished add 2', intervals: ["1","b3","b5","2"] },
        'more_chord_010': { name: 'Diminished add 4', intervals: ["1","b3","b5","4"] },
        'more_chord_011': { name: 'Augmented add 2', intervals: ["1","3","#5","2"] },
        'more_chord_012': { name: 'Augmented add 4', intervals: ["1","3","#5","4"] },
        'more_chord_013': { name: 'Augmented add 6', intervals: ["1","3","#5","6"] },
        'more_chord_014': { name: 'Half-diminished 7 add 4', intervals: ["1","b3","b5","b7","4"] },
        'more_chord_015': { name: 'Half-diminished 7 add 6', intervals: ["1","b3","b5","b7","6"] },
        'more_chord_016': { name: 'Minor-major 7 add 2', intervals: ["1","b3","5","7","2"] },
        'more_chord_017': { name: 'Minor-major 7 add 4', intervals: ["1","b3","5","7","4"] },
        'more_chord_018': { name: 'Minor-major 7 add 6', intervals: ["1","b3","5","7","6"] },
        'more_chord_019': { name: '7sus2 add 6', intervals: ["1","2","5","b7","6"] },
        'more_chord_020': { name: 'Major add #4', intervals: ["1","3","5","#4"] },
        'more_chord_021': { name: 'Minor add #4', intervals: ["1","b3","5","#4"] },
        'more_chord_022': { name: 'Minor 7 add #4', intervals: ["1","b3","5","b7","#4"] },
        'more_chord_023': { name: 'Sus2 add #4', intervals: ["1","2","5","#4"] },
        'more_chord_024': { name: 'Sus4 add #4', intervals: ["1","4","5","#4"] },
        'more_chord_025': { name: 'Augmented add #4', intervals: ["1","3","#5","#4"] },
        'more_chord_026': { name: 'Minor-major 7 add #4', intervals: ["1","b3","5","7","#4"] },
        'more_chord_027': { name: '7sus4 add #4', intervals: ["1","4","5","b7","#4"] },
        'more_chord_028': { name: '7sus2 add #4', intervals: ["1","2","5","b7","#4"] },
        'more_chord_029': { name: 'Major add b2', intervals: ["1","3","5","b2"] },
        'more_chord_030': { name: 'Major add #2', intervals: ["1","3","5","#2"] },
        'more_chord_031': { name: 'Major add b6', intervals: ["1","3","5","b6"] },
        'more_chord_032': { name: 'Minor add b2', intervals: ["1","b3","5","b2"] },
        'more_chord_033': { name: 'Minor add b6', intervals: ["1","b3","5","b6"] },
        'more_chord_034': { name: 'Minor 7 add b2', intervals: ["1","b3","5","b7","b2"] },
        'more_chord_035': { name: 'Minor 7 add b6', intervals: ["1","b3","5","b7","b6"] },
        'more_chord_036': { name: 'Major 7 add b6', intervals: ["1","3","5","7","b6"] },
        'more_chord_037': { name: 'Sus2 add b2', intervals: ["1","2","5","b2"] },
        'more_chord_038': { name: 'Sus2 add b6', intervals: ["1","2","5","b6"] },
        'more_chord_039': { name: 'Sus4 add b2', intervals: ["1","4","5","b2"] },
        'more_chord_040': { name: 'Sus4 add b6', intervals: ["1","4","5","b6"] },
        'more_chord_041': { name: 'Diminished add b2', intervals: ["1","b3","b5","b2"] },
        'more_chord_042': { name: 'Diminished add b6', intervals: ["1","b3","b5","b6"] },
        'more_chord_043': { name: 'Augmented add b2', intervals: ["1","3","#5","b2"] },
        'more_chord_044': { name: 'Augmented add #2', intervals: ["1","3","#5","#2"] },
        'more_chord_045': { name: 'Augmented add b7', intervals: ["1","3","#5","b7"] },
        'more_chord_046': { name: 'Half-diminished 7 add b2', intervals: ["1","b3","b5","b7","b2"] },
        'more_chord_047': { name: 'Half-diminished 7 add b6', intervals: ["1","b3","b5","b7","b6"] },
        'more_chord_048': { name: 'Minor-major 7 add b2', intervals: ["1","b3","5","7","b2"] },
        'more_chord_049': { name: 'Minor-major 7 add b6', intervals: ["1","b3","5","7","b6"] },
        'more_chord_050': { name: '7sus4 add b6', intervals: ["1","4","5","b7","b6"] },
        'more_chord_051': { name: '7sus2 add b2', intervals: ["1","2","5","b7","b2"] },
        'more_chord_052': { name: '7sus2 add b6', intervals: ["1","2","5","b7","b6"] },
        'more_chord_053': { name: 'Major add 2, 4', intervals: ["1","3","5","2","4"] },
        'more_chord_054': { name: 'Major add 4, 6', intervals: ["1","3","5","4","6"] },
        'more_chord_055': { name: 'Minor add 2, 4', intervals: ["1","b3","5","2","4"] },
        'more_chord_056': { name: 'Dominant 7 add 2, 6', intervals: ["1","3","5","b7","2","6"] },
        'more_chord_057': { name: 'Dominant 7 add 4, 6', intervals: ["1","3","5","b7","4","6"] },
        'more_chord_058': { name: 'Minor 7 add 2, 6', intervals: ["1","b3","5","b7","2","6"] },
        'more_chord_059': { name: 'Minor 7 add 4, 6', intervals: ["1","b3","5","b7","4","6"] },
        'more_chord_060': { name: 'Major 7 add 2, 6', intervals: ["1","3","5","7","2","6"] },
        'more_chord_061': { name: 'Major 7 add 4, 6', intervals: ["1","3","5","7","4","6"] },
        'more_chord_062': { name: 'Sus2 add 4, 6', intervals: ["1","2","5","4","6"] },
        'more_chord_063': { name: 'Diminished add 2, 4', intervals: ["1","b3","b5","2","4"] },
        'more_chord_064': { name: 'Diminished add 4, 6', intervals: ["1","b3","b5","4","6"] },
        'more_chord_065': { name: 'Augmented add 2, 4', intervals: ["1","3","#5","2","4"] },
        'more_chord_066': { name: 'Augmented add 2, 6', intervals: ["1","3","#5","2","6"] },
        'more_chord_067': { name: 'Augmented add 4, 6', intervals: ["1","3","#5","4","6"] },
        'more_chord_068': { name: 'Half-diminished 7 add 2, 6', intervals: ["1","b3","b5","b7","2","6"] },
        'more_chord_069': { name: 'Half-diminished 7 add 4, 6', intervals: ["1","b3","b5","b7","4","6"] },
        'more_chord_070': { name: 'Minor-major 7 add 2, 4', intervals: ["1","b3","5","7","2","4"] },
        'more_chord_071': { name: 'Minor-major 7 add 2, 6', intervals: ["1","b3","5","7","2","6"] },
        'more_chord_072': { name: 'Minor-major 7 add 4, 6', intervals: ["1","b3","5","7","4","6"] },
        'more_chord_073': { name: '7sus4 add 2, 6', intervals: ["1","4","5","b7","2","6"] },
        'more_chord_074': { name: 'Major add 2, #4', intervals: ["1","3","5","2","#4"] },
        'more_chord_075': { name: 'Major add 4, #4', intervals: ["1","3","5","4","#4"] },
        'more_chord_076': { name: 'Major add #4, 6', intervals: ["1","3","5","#4","6"] },
        'more_chord_077': { name: 'Minor add 2, #4', intervals: ["1","b3","5","2","#4"] },
        'more_chord_078': { name: 'Minor add 4, #4', intervals: ["1","b3","5","4","#4"] },
        'more_chord_079': { name: 'Minor add #4, 6', intervals: ["1","b3","5","#4","6"] },
        'more_chord_080': { name: 'Dominant 7 add 2, #4', intervals: ["1","3","5","b7","2","#4"] },
        'more_chord_081': { name: 'Dominant 7 add 4, #4', intervals: ["1","3","5","b7","4","#4"] },
        'more_chord_082': { name: 'Dominant 7 add #4, 6', intervals: ["1","3","5","b7","#4","6"] },
        'more_chord_083': { name: 'Minor 7 add 2, #4', intervals: ["1","b3","5","b7","2","#4"] },
        'more_chord_084': { name: 'Minor 7 add 4, #4', intervals: ["1","b3","5","b7","4","#4"] },
        'more_chord_085': { name: 'Minor 7 add #4, 6', intervals: ["1","b3","5","b7","#4","6"] },
        'more_chord_086': { name: 'Major 7 add 4, #4', intervals: ["1","3","5","7","4","#4"] },
        'more_chord_087': { name: 'Major 7 add #4, 6', intervals: ["1","3","5","7","#4","6"] },
        'more_chord_088': { name: 'Sus2 add 4, #4', intervals: ["1","2","5","4","#4"] },
        'more_chord_089': { name: 'Sus2 add #4, 6', intervals: ["1","2","5","#4","6"] },
        'more_chord_090': { name: 'Sus4 add #4, 6', intervals: ["1","4","5","#4","6"] },
        'more_chord_091': { name: 'Augmented add 2, #4', intervals: ["1","3","#5","2","#4"] },
        'more_chord_092': { name: 'Augmented add 4, #4', intervals: ["1","3","#5","4","#4"] },
        'more_chord_093': { name: 'Augmented add #4, 6', intervals: ["1","3","#5","#4","6"] },
        'more_chord_094': { name: 'Minor-major 7 add 2, #4', intervals: ["1","b3","5","7","2","#4"] },
        'more_chord_095': { name: 'Minor-major 7 add 4, #4', intervals: ["1","b3","5","7","4","#4"] },
        'more_chord_096': { name: 'Minor-major 7 add #4, 6', intervals: ["1","b3","5","7","#4","6"] },
        'more_chord_097': { name: '7sus4 add 2, #4', intervals: ["1","4","5","b7","2","#4"] },
        'more_chord_098': { name: '7sus4 add #4, 6', intervals: ["1","4","5","b7","#4","6"] },
        'more_chord_099': { name: '7sus2 add #4, 6', intervals: ["1","2","5","b7","#4","6"] },
        'more_chord_100': { name: 'Major add b2, 2', intervals: ["1","3","5","b2","2"] },
        'more_chord_101': { name: 'Major add 2, #2', intervals: ["1","3","5","2","#2"] },
        'more_chord_102': { name: 'Major add b2, 4', intervals: ["1","3","5","b2","4"] },
        'more_chord_103': { name: 'Major add #2, 4', intervals: ["1","3","5","#2","4"] },
        'more_chord_104': { name: 'Major add 2, b6', intervals: ["1","3","5","2","b6"] },
        'more_chord_105': { name: 'Major add 4, b6', intervals: ["1","3","5","4","b6"] },
        'more_chord_106': { name: 'Major add b2, 6', intervals: ["1","3","5","b2","6"] },
        'more_chord_107': { name: 'Major add #2, 6', intervals: ["1","3","5","#2","6"] },
        'more_chord_108': { name: 'Major add b6, 6', intervals: ["1","3","5","b6","6"] },
        'more_chord_109': { name: 'Minor add b2, 2', intervals: ["1","b3","5","b2","2"] },
        'more_chord_110': { name: 'Minor add b2, 4', intervals: ["1","b3","5","b2","4"] },
        'more_chord_111': { name: 'Minor add 2, b6', intervals: ["1","b3","5","2","b6"] },
        'more_chord_112': { name: 'Minor add 4, b6', intervals: ["1","b3","5","4","b6"] },
        'more_chord_113': { name: 'Minor add b2, 6', intervals: ["1","b3","5","b2","6"] },
        'more_chord_114': { name: 'Minor add b6, 6', intervals: ["1","b3","5","b6","6"] },
        'more_chord_115': { name: 'Dominant 7 add b2, 2', intervals: ["1","3","5","b7","b2","2"] },
        'more_chord_116': { name: 'Dominant 7 add 2, #2', intervals: ["1","3","5","b7","2","#2"] },
        'more_chord_117': { name: 'Dominant 7 add b2, 4', intervals: ["1","3","5","b7","b2","4"] },
        'more_chord_118': { name: 'Dominant 7 add #2, 4', intervals: ["1","3","5","b7","#2","4"] },
        'more_chord_119': { name: 'Dominant 7 add 2, b6', intervals: ["1","3","5","b7","2","b6"] },
        'more_chord_120': { name: 'Dominant 7 add 4, b6', intervals: ["1","3","5","b7","4","b6"] },
        'more_chord_121': { name: 'Dominant 7 add b2, 6', intervals: ["1","3","5","b7","b2","6"] },
        'more_chord_122': { name: 'Dominant 7 add #2, 6', intervals: ["1","3","5","b7","#2","6"] },
        'more_chord_123': { name: 'Dominant 7 add b6, 6', intervals: ["1","3","5","b7","b6","6"] },
        'more_chord_124': { name: 'Minor 7 add b2, 2', intervals: ["1","b3","5","b7","b2","2"] },
        'more_chord_125': { name: 'Minor 7 add b2, 4', intervals: ["1","b3","5","b7","b2","4"] },
        'more_chord_126': { name: 'Minor 7 add 2, b6', intervals: ["1","b3","5","b7","2","b6"] },
        'more_chord_127': { name: 'Minor 7 add 4, b6', intervals: ["1","b3","5","b7","4","b6"] },
        'more_chord_128': { name: 'Minor 7 add b2, 6', intervals: ["1","b3","5","b7","b2","6"] },
        'more_chord_129': { name: 'Minor 7 add b6, 6', intervals: ["1","b3","5","b7","b6","6"] },
        'more_chord_130': { name: 'Major 7 add b2, 2', intervals: ["1","3","5","7","b2","2"] },
        'more_chord_131': { name: 'Major 7 add 2, #2', intervals: ["1","3","5","7","2","#2"] },
        'more_chord_132': { name: 'Major 7 add b2, 4', intervals: ["1","3","5","7","b2","4"] },
        'more_chord_133': { name: 'Major 7 add #2, 4', intervals: ["1","3","5","7","#2","4"] },
        'more_chord_134': { name: 'Major 7 add 2, b6', intervals: ["1","3","5","7","2","b6"] },
        'more_chord_135': { name: 'Major 7 add 4, b6', intervals: ["1","3","5","7","4","b6"] },
        'more_chord_136': { name: 'Major 7 add b2, 6', intervals: ["1","3","5","7","b2","6"] },
        'more_chord_137': { name: 'Major 7 add #2, 6', intervals: ["1","3","5","7","#2","6"] },
        'more_chord_138': { name: 'Major 7 add b6, 6', intervals: ["1","3","5","7","b6","6"] },
        'more_chord_139': { name: 'Sus2 add b2, 4', intervals: ["1","2","5","b2","4"] },
        'more_chord_140': { name: 'Sus2 add 4, b6', intervals: ["1","2","5","4","b6"] },
        'more_chord_141': { name: 'Sus2 add b2, 6', intervals: ["1","2","5","b2","6"] },
        'more_chord_142': { name: 'Sus2 add b6, 6', intervals: ["1","2","5","b6","6"] },
        'more_chord_143': { name: 'Sus4 add b2, 6', intervals: ["1","4","5","b2","6"] },
        'more_chord_144': { name: 'Sus4 add b6, 6', intervals: ["1","4","5","b6","6"] },
        'more_chord_145': { name: 'Diminished add b2, 2', intervals: ["1","b3","b5","b2","2"] },
        'more_chord_146': { name: 'Diminished add b2, 4', intervals: ["1","b3","b5","b2","4"] },
        'more_chord_147': { name: 'Diminished add 2, b6', intervals: ["1","b3","b5","2","b6"] },
        'more_chord_148': { name: 'Diminished add 4, b6', intervals: ["1","b3","b5","4","b6"] },
        'more_chord_149': { name: 'Diminished add b6, 6', intervals: ["1","b3","b5","b6","6"] },
        'more_chord_150': { name: 'Augmented add b2, 2', intervals: ["1","3","#5","b2","2"] },
        'more_chord_151': { name: 'Augmented add 2, #2', intervals: ["1","3","#5","2","#2"] },
        'more_chord_152': { name: 'Augmented add b2, 4', intervals: ["1","3","#5","b2","4"] },
        'more_chord_153': { name: 'Augmented add #2, 4', intervals: ["1","3","#5","#2","4"] },
        'more_chord_154': { name: 'Augmented add 2, b7', intervals: ["1","3","#5","2","b7"] },
        'more_chord_155': { name: 'Augmented add 4, b7', intervals: ["1","3","#5","4","b7"] },
        'more_chord_156': { name: 'Augmented add b2, 6', intervals: ["1","3","#5","b2","6"] },
        'more_chord_157': { name: 'Augmented add #2, 6', intervals: ["1","3","#5","#2","6"] },
        'more_chord_158': { name: 'Augmented add b7, 6', intervals: ["1","3","#5","b7","6"] },
        'more_chord_159': { name: 'Half-diminished 7 add b2, 2', intervals: ["1","b3","b5","b7","b2","2"] },
        'more_chord_160': { name: 'Half-diminished 7 add b2, 4', intervals: ["1","b3","b5","b7","b2","4"] },
        'more_chord_161': { name: 'Half-diminished 7 add 2, b6', intervals: ["1","b3","b5","b7","2","b6"] },
        'more_chord_162': { name: 'Half-diminished 7 add 4, b6', intervals: ["1","b3","b5","b7","4","b6"] },
        'more_chord_163': { name: 'Half-diminished 7 add b2, 6', intervals: ["1","b3","b5","b7","b2","6"] },
        'more_chord_164': { name: 'Half-diminished 7 add b6, 6', intervals: ["1","b3","b5","b7","b6","6"] },
        'more_chord_165': { name: 'Minor-major 7 add b2, 2', intervals: ["1","b3","5","7","b2","2"] },
        'more_chord_166': { name: 'Minor-major 7 add b2, 4', intervals: ["1","b3","5","7","b2","4"] },
        'more_chord_167': { name: 'Minor-major 7 add 2, b6', intervals: ["1","b3","5","7","2","b6"] },
        'more_chord_168': { name: 'Minor-major 7 add 4, b6', intervals: ["1","b3","5","7","4","b6"] },
        'more_chord_169': { name: 'Minor-major 7 add b2, 6', intervals: ["1","b3","5","7","b2","6"] },
        'more_chord_170': { name: 'Minor-major 7 add b6, 6', intervals: ["1","b3","5","7","b6","6"] },
        'more_chord_171': { name: '7sus4 add b2, 2', intervals: ["1","4","5","b7","b2","2"] },
        'more_chord_172': { name: '7sus4 add 2, b6', intervals: ["1","4","5","b7","2","b6"] },
        'more_chord_173': { name: '7sus4 add b2, 6', intervals: ["1","4","5","b7","b2","6"] },
        'more_chord_174': { name: '7sus4 add b6, 6', intervals: ["1","4","5","b7","b6","6"] },
        'more_chord_175': { name: '7sus2 add b2, 6', intervals: ["1","2","5","b7","b2","6"] },
        'more_chord_176': { name: '7sus2 add b6, 6', intervals: ["1","2","5","b7","b6","6"] },
        'more_chord_177': { name: 'Major add b2, #4', intervals: ["1","3","5","b2","#4"] },
        'more_chord_178': { name: 'Major add #2, #4', intervals: ["1","3","5","#2","#4"] },
        'more_chord_179': { name: 'Major add #4, b6', intervals: ["1","3","5","#4","b6"] },
        'more_chord_180': { name: 'Minor add b2, #4', intervals: ["1","b3","5","b2","#4"] },
        'more_chord_181': { name: 'Minor add #4, b6', intervals: ["1","b3","5","#4","b6"] },
        'more_chord_182': { name: 'Dominant 7 add #4, b6', intervals: ["1","3","5","b7","#4","b6"] },
        'more_chord_183': { name: 'Minor 7 add b2, #4', intervals: ["1","b3","5","b7","b2","#4"] },
        'more_chord_184': { name: 'Minor 7 add #4, b6', intervals: ["1","b3","5","b7","#4","b6"] },
        'more_chord_185': { name: 'Major 7 add b2, #4', intervals: ["1","3","5","7","b2","#4"] },
        'more_chord_186': { name: 'Major 7 add #2, #4', intervals: ["1","3","5","7","#2","#4"] },
        'more_chord_187': { name: 'Major 7 add #4, b6', intervals: ["1","3","5","7","#4","b6"] },
        'more_chord_188': { name: 'Sus2 add b2, #4', intervals: ["1","2","5","b2","#4"] },
        'more_chord_189': { name: 'Sus2 add #4, b6', intervals: ["1","2","5","#4","b6"] },
        'more_chord_190': { name: 'Sus4 add b2, #4', intervals: ["1","4","5","b2","#4"] },
        'more_chord_191': { name: 'Sus4 add #4, b6', intervals: ["1","4","5","#4","b6"] },
        'more_chord_192': { name: 'Augmented add b2, #4', intervals: ["1","3","#5","b2","#4"] },
        'more_chord_193': { name: 'Augmented add #2, #4', intervals: ["1","3","#5","#2","#4"] },
        'more_chord_194': { name: 'Augmented add #4, b7', intervals: ["1","3","#5","#4","b7"] },
        'more_chord_195': { name: 'Minor-major 7 add b2, #4', intervals: ["1","b3","5","7","b2","#4"] },
        'more_chord_196': { name: 'Minor-major 7 add #4, b6', intervals: ["1","b3","5","7","#4","b6"] },
        'more_chord_197': { name: '7sus4 add b2, #4', intervals: ["1","4","5","b7","b2","#4"] },
        'more_chord_198': { name: '7sus4 add #4, b6', intervals: ["1","4","5","b7","#4","b6"] },
        'more_chord_199': { name: '7sus2 add b2, #4', intervals: ["1","2","5","b7","b2","#4"] },
        'more_chord_200': { name: '7sus2 add #4, b6', intervals: ["1","2","5","b7","#4","b6"] },
        'more_chord_201': { name: 'Major add b2, #2', intervals: ["1","3","5","b2","#2"] },
        'more_chord_202': { name: 'Major add b2, b6', intervals: ["1","3","5","b2","b6"] },
        'more_chord_203': { name: 'Major add #2, b6', intervals: ["1","3","5","#2","b6"] },
        'more_chord_204': { name: 'Minor add b2, b6', intervals: ["1","b3","5","b2","b6"] },
        'more_chord_205': { name: 'Dominant 7 add b2, #2', intervals: ["1","3","5","b7","b2","#2"] },
        'more_chord_206': { name: 'Dominant 7 add b2, b6', intervals: ["1","3","5","b7","b2","b6"] },
        'more_chord_207': { name: 'Dominant 7 add #2, b6', intervals: ["1","3","5","b7","#2","b6"] },
        'more_chord_208': { name: 'Minor 7 add b2, b6', intervals: ["1","b3","5","b7","b2","b6"] },
        'more_chord_209': { name: 'Major 7 add b2, #2', intervals: ["1","3","5","7","b2","#2"] },
        'more_chord_210': { name: 'Major 7 add b2, b6', intervals: ["1","3","5","7","b2","b6"] },
        'more_chord_211': { name: 'Major 7 add #2, b6', intervals: ["1","3","5","7","#2","b6"] },
        'more_chord_212': { name: 'Sus2 add b2, b6', intervals: ["1","2","5","b2","b6"] },
        'more_chord_213': { name: 'Sus4 add b2, b6', intervals: ["1","4","5","b2","b6"] },
        'more_chord_214': { name: 'Diminished add b2, b6', intervals: ["1","b3","b5","b2","b6"] },
        'more_chord_215': { name: 'Augmented add b2, #2', intervals: ["1","3","#5","b2","#2"] },
        'more_chord_216': { name: 'Augmented add b2, b7', intervals: ["1","3","#5","b2","b7"] },
        'more_chord_217': { name: 'Augmented add #2, b7', intervals: ["1","3","#5","#2","b7"] },
        'more_chord_218': { name: 'Half-diminished 7 add b2, b6', intervals: ["1","b3","b5","b7","b2","b6"] },
        'more_chord_219': { name: 'Minor-major 7 add b2, b6', intervals: ["1","b3","5","7","b2","b6"] },
        'more_chord_220': { name: '7sus4 add b2, b6', intervals: ["1","4","5","b7","b2","b6"] },
        'more_chord_221': { name: '7sus2 add b2, b6', intervals: ["1","2","5","b7","b2","b6"] },
        'more_chord_222': { name: 'Major add 2, 4, 6', intervals: ["1","3","5","2","4","6"] },
        'more_chord_223': { name: 'Minor add 2, 4, 6', intervals: ["1","b3","5","2","4","6"] },
        'more_chord_224': { name: 'Diminished add 2, 4, 6', intervals: ["1","b3","b5","2","4","6"] },
        'more_chord_225': { name: 'Augmented add 2, 4, 6', intervals: ["1","3","#5","2","4","6"] },
        'more_chord_226': { name: 'Half-diminished 7 add 2, 4, 6', intervals: ["1","b3","b5","b7","2","4","6"] },
        'more_chord_227': { name: 'Minor-major 7 add 2, 4, 6', intervals: ["1","b3","5","7","2","4","6"] },
        'more_chord_228': { name: 'Major add 2, 4, #4', intervals: ["1","3","5","2","4","#4"] },
        'more_chord_229': { name: 'Major add 2, #4, 6', intervals: ["1","3","5","2","#4","6"] },
        'more_chord_230': { name: 'Major add 4, #4, 6', intervals: ["1","3","5","4","#4","6"] },
        'more_chord_231': { name: 'Minor add 2, 4, #4', intervals: ["1","b3","5","2","4","#4"] },
        'more_chord_232': { name: 'Minor add 2, #4, 6', intervals: ["1","b3","5","2","#4","6"] },
        'more_chord_233': { name: 'Minor add 4, #4, 6', intervals: ["1","b3","5","4","#4","6"] },
        'more_chord_234': { name: 'Dominant 7 add 2, 4, #4', intervals: ["1","3","5","b7","2","4","#4"] },
        'more_chord_235': { name: 'Dominant 7 add 2, #4, 6', intervals: ["1","3","5","b7","2","#4","6"] },
        'more_chord_236': { name: 'Dominant 7 add 4, #4, 6', intervals: ["1","3","5","b7","4","#4","6"] },
        'more_chord_237': { name: 'Minor 7 add 2, 4, #4', intervals: ["1","b3","5","b7","2","4","#4"] },
        'more_chord_238': { name: 'Minor 7 add 2, #4, 6', intervals: ["1","b3","5","b7","2","#4","6"] },
        'more_chord_239': { name: 'Minor 7 add 4, #4, 6', intervals: ["1","b3","5","b7","4","#4","6"] },
        'more_chord_240': { name: 'Major 7 add 2, 4, #4', intervals: ["1","3","5","7","2","4","#4"] }
    };
    Object.assign(MUSIC_THEORY_DATA.chords, extraChords);
})();