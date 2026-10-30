const INSTRUMENT_PRESETS = {
    'acoustic_guitar': { name: 'Acoustic Guitar', strings: 6, tunings: {
        'standard': ['E', 'A', 'D', 'G', 'B', 'E'],
        'whole_step_down': ['D', 'G', 'C', 'F', 'A', 'D']
    }},
    'electric_guitar': { name: 'Electric Guitar', strings: 6, tunings: {
        'standard': ['E', 'A', 'D', 'G', 'B', 'E'],
        'half_step_down': ['D#', 'G#', 'C#', 'F#', 'A#', 'D#']
    }},
    'classical_guitar': { name: 'Classical Guitar', strings: 6, tunings: {
        'standard': ['E', 'A', 'D', 'G', 'B', 'E'],
        'whole_step_down': ['D', 'G', 'C', 'F', 'A', 'D']
    }},
    'seven_string_guitar': { name: '7-String Guitar', strings: 7, tunings: {
        'standard': ['B', 'E', 'A', 'D', 'G', 'B', 'E'],
        'whole_step_down': ['A', 'D', 'G', 'C', 'F', 'A', 'D']
    }},
    'twelve_string_guitar': { name: '12-String Guitar', strings: 6, tunings: {
        'standard': ['E', 'A', 'D', 'G', 'B', 'E'],
        'half_step_down': ['D#', 'G#', 'C#', 'F#', 'A#', 'D#']
    }},
    'four_string_bass': { name: '4-String Bass Guitar', strings: 4, tunings: {
        'standard': ['E', 'A', 'D', 'G'],
        'whole_step_down': ['D', 'G', 'C', 'F']
    }},
    'five_string_bass': { name: '5-String Bass Guitar', strings: 5, tunings: {
        'standard': ['B', 'E', 'A', 'D', 'G'],
        'alternate': ['E', 'A', 'D', 'G', 'C']
    }},
    'six_string_bass': { name: '6-String Bass Guitar', strings: 6, tunings: {
        'standard': ['B', 'E', 'A', 'D', 'G', 'B'],
        'alternate': ['E', 'A', 'D', 'G', 'B', 'E']
    }},
    // Additional instruments
    'eight_string_guitar': { name: '8-String Guitar', strings: 8, tunings: {
        'standard': ['F#', 'B', 'E', 'A', 'D', 'G', 'B', 'E'],
        'drop_e': ['E', 'B', 'E', 'A', 'D', 'G', 'B', 'E']
    }},
    'baritone_guitar': { name: 'Baritone Guitar', strings: 6, tunings: {
        'standard': ['B', 'E', 'A', 'D', 'F#', 'B'],
        'drop_a': ['A', 'E', 'A', 'D', 'F#', 'B']
    }},
    'resonator_guitar': { name: 'Resonator Guitar', strings: 6, tunings: {
        'standard': ['E', 'A', 'D', 'G', 'B', 'E'],
        'open_g': ['D', 'G', 'D', 'G', 'B', 'D']
    }},
    'tenor_guitar': { name: 'Tenor Guitar', strings: 4, tunings: {
        'standard': ['C', 'G', 'D', 'A'],
        'chicago': ['D', 'G', 'B', 'E']
    }},
    'violin': { name: 'Violin', strings: 4, tunings: {
        'standard': ['G', 'D', 'A', 'E'],
        'drop_d': ['G', 'D', 'A', 'D']
    }},
    'viola': { name: 'Viola', strings: 4, tunings: {
        'standard': ['C', 'G', 'D', 'A'],
        'scordatura': ['C', 'G', 'D', 'G']
    }},
    'cello': { name: 'Cello', strings: 4, tunings: {
        'standard': ['C', 'G', 'D', 'A'],
        'drop_g': ['C', 'G', 'D', 'G']
    }},
    'double_bass': { name: 'Double Bass', strings: 4, tunings: {
        'standard': ['E', 'A', 'D', 'G'],
        'orchestral': ['F#', 'B', 'E', 'A']
    }},
    'five_string_banjo': { name: '5-String Banjo', strings: 5, tunings: {
        'standard': ['G', 'D', 'G', 'B', 'D'],
        'double_c': ['G', 'C', 'G', 'C', 'D']
    }},
    'four_string_banjo': { name: '4-String Banjo', strings: 4, tunings: {
        'standard': ['C', 'G', 'D', 'A'],
        'chicago': ['D', 'G', 'B', 'E']
    }},
    'six_string_banjo': { name: '6-String Banjo', strings: 6, tunings: {
        'standard': ['E', 'A', 'D', 'G', 'B', 'E'],
        'open_g': ['D', 'G', 'D', 'G', 'B', 'D']
    }},
    'mandolin': { name: 'Mandolin', strings: 4, tunings: {
        'standard': ['G', 'D', 'A', 'E'],
        'open_g': ['G', 'D', 'G', 'B']
    }},
    'mandola': { name: 'Mandola', strings: 4, tunings: {
        'standard': ['C', 'G', 'D', 'A'],
        'octave_mandolin': ['G', 'D', 'A', 'E']
    }},
    'ukulele_soprano': { name: 'Soprano Ukulele', strings: 4, tunings: {
        'standard': ['G', 'C', 'E', 'A'],
        'low_g': ['G', 'C', 'E', 'A'] // Low G instead of high G
    }},
    'ukulele_tenor': { name: 'Tenor Ukulele', strings: 4, tunings: {
        'standard': ['G', 'C', 'E', 'A'],
        'low_g': ['G', 'C', 'E', 'A'] // Low G instead of high G
    }},
    'ukulele_baritone': { name: 'Baritone Ukulele', strings: 4, tunings: {
        'standard': ['D', 'G', 'B', 'E'],
        'alternate': ['C', 'G', 'B', 'E']
    }},
    'lap_steel': { name: 'Lap Steel Guitar', strings: 6, tunings: {
        'c6': ['C', 'E', 'G', 'A', 'C', 'E'],
        'open_g': ['D', 'G', 'D', 'G', 'B', 'D']
    }},
    'pedal_steel': { name: 'Pedal Steel Guitar', strings: 10, tunings: {
        'e9': ['B', 'D', 'E', 'F#', 'G#', 'B', 'E', 'G#', 'D#', 'F#'],
        'c6': ['C', 'F', 'A', 'C', 'E', 'G', 'A', 'C', 'E', 'G']
    }},
    'dobro': { name: 'Dobro', strings: 6, tunings: {
        'open_g': ['G', 'B', 'D', 'G', 'B', 'D'],
        'open_d': ['D', 'A', 'D', 'F#', 'A', 'D']
    }},
    'koto': { name: 'Koto', strings: 13, tunings: {
        'hira_joshi': ['D', 'G', 'A', 'A#', 'D', 'G', 'A', 'A#', 'D', 'G', 'A', 'A#', 'D'],
        'in_scale': ['E', 'F#', 'A', 'B', 'C', 'E', 'F#', 'A', 'B', 'C', 'E', 'F#', 'A']
    }},
    'sitar': { name: 'Sitar', strings: 7, tunings: {
        'standard': ['C', 'C#', 'G', 'C', 'C#', 'G', 'C'],
        'alternative': ['C#', 'D', 'G#', 'C#', 'D', 'G#', 'C#']
    }},
    'charango': { name: 'Charango', strings: 5, tunings: {
        'standard': ['G', 'C', 'E', 'A', 'E'],
        'argentina': ['A', 'D', 'F#', 'B', 'F#']
    }},
    'bouzouki': { name: 'Irish Bouzouki', strings: 4, tunings: {
        'standard': ['G', 'D', 'A', 'E'],
        'irish': ['G', 'D', 'A', 'D']
    }},
    'oud': { name: 'Oud', strings: 6, tunings: {
        'arabic': ['C', 'F', 'A', 'D', 'G', 'C'],
        'turkish': ['D', 'E', 'A', 'B', 'E', 'A']
    }}
};

// Reference layouts use sounding pitches, not one fretboard row per piano wire.
const MULTI_INSTRUMENT_SETUPS = (() => {
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const piano = Array.from({ length: 24 }, (_, i) => chromatic[i % 12] + (4 + Math.floor(i / 12)));
    const harp = Array.from({ length: 47 }, (_, i) => ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'][i % 7] + (1 + Math.floor(i / 7)));
    INSTRUMENT_PRESETS.piano = { name: 'Piano (2 octaves)', strings: 24, tunings: { standard: piano.map(p => p.replace(/-?\d+$/, '')) } };
    INSTRUMENT_PRESETS.harp = { name: 'Concert Harp (47-string reference)', strings: 47, tunings: { unaltered_pedals: harp.map(p => ({ Cb: 'B', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#' })[p.replace(/\d+$/, '')]) } };
    const setup = (instrument, preset, pitches, note = '', referenceLayout = false) => {
        const pitchLabels = Array.isArray(pitches) ? pitches : pitches.split(' ');
        const flats = { Cb: 'B', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
        const tuning = pitchLabels.map(pitch => { const name = pitch.replace(/-?\d+$/, ''); return flats[name] || name; });
        return { instrument, preset, tuning, pitchLabels, originalTuning: tuning.slice(), setupNote: note, referenceLayout };
    };
    const alternates = [
        setup('acoustic_guitar', 'drop_d', 'D2 A2 D3 G3 B3 E4', 'Drop D'),
        setup('acoustic_guitar', 'open_g', 'D2 G2 D3 G3 B3 D4', 'Open G'),
        setup('acoustic_guitar', 'dadgad', 'D2 A2 D3 G3 A3 D4', 'DADGAD'),
        setup('acoustic_guitar', 'whole_step_down', 'D2 G2 C3 F3 A3 D4', 'Whole-step down'),
        setup('electric_guitar', 'half_step_down', 'Eb2 Ab2 Db3 Gb3 Bb3 Eb4', 'E-flat standard (half-step down)'),
        setup('electric_guitar', 'drop_d', 'D2 A2 D3 G3 B3 E4', 'Drop D'),
        setup('four_string_bass', 'whole_step_down', 'D1 G1 C2 F2', 'Whole-step down'),
        setup('four_string_bass', 'drop_d', 'D1 A1 D2 G2', 'Drop D'),
        setup('four_string_bass', 'bead', 'B0 E1 A1 D2', 'BEAD (low B); use appropriate strings/setup'),
        setup('four_string_bass', 'tenor_adgc', 'A1 D2 G2 C3', 'Tenor ADGC; use appropriate strings/setup')
    ];
    alternates.forEach(alternate => {
        INSTRUMENT_PRESETS[alternate.instrument].tunings[alternate.preset] = alternate.tuning.slice();
    });
    return [
        setup('acoustic_guitar', 'standard', 'E2 A2 D3 G3 B3 E4'),
        setup('electric_guitar', 'standard', 'E2 A2 D3 G3 B3 E4'),
        setup('four_string_bass', 'standard', 'E1 A1 D2 G2'),
        setup('ukulele_soprano', 'standard', 'G4 C4 E4 A4', 'High-G, re-entrant playing order'),
        setup('violin', 'standard', 'G3 D4 A4 E5', 'Fretless; semitone study grid'),
        setup('piano', 'standard', piano, 'Two octaves starting on the selected key; A4 = 440 Hz', true),
        setup('mandolin', 'standard', 'G3 G3 D4 D4 A4 A4 E5 E5', '8 strings in 4 unison pairs'),
        setup('five_string_banjo', 'standard', 'G4 D3 G3 B3 D4', 'Open G; short fifth string first, then four long strings'),
        setup('cello', 'standard', 'C2 G2 D3 A3', 'Fretless; semitone study grid'),
        setup('viola', 'standard', 'C3 G3 D4 A4', 'Fretless; semitone study grid'),
        setup('double_bass', 'standard', 'E1 A1 D2 G2', 'Fretless; semitone study grid'),
        setup('harp', 'unaltered_pedals', harp, '47 strings Cb1-Gb7; unaltered pedals, Cb major; open-pitch reference', true),
        setup('sitar', 'standard', 'F3 C3 G2 C3 G3 C4 C5', 'C-tonic example: 7 main/drone strings only; typically 18-21 total with sympathetic strings; varies by raga'),
        setup('oud', 'arabic', 'C2 F2 F2 A2 A2 D3 D3 G3 G3 C4 C4', 'Arabic example: 11 strings, 6 courses, single bass; fretless semitone study grid'),
        setup('koto', 'hira_joshi', 'D3 G3 A3 Bb3 D4 Eb4 G4 A4 Bb4 D5 Eb5 G5 A5', '13-string D-based Hirajoshi example; movable bridges, tuning varies by school/piece', true),
        ...alternates
    ];
})();
