/**
 * Mono and Grayscale Fretboard Themes Data
 */
const THEMES_DATA_MONO = {
    monoBlue: {
        background: '#E3F2FD',
        strings: '#1976D2',
        frets: '#1565C0',
        markers: '#0D47A1',
        intervals: {
            '1': '#90CAF9', 'b2': '#64B5F6', '2': '#42A5F5', 'b3': '#2196F3', '3': '#1E88E5',
            '4': '#1976D2', 'b5': '#1565C0', '5': '#0D47A1', '#5': '#82B1FF', '6': '#448AFF',
            'b7': '#2979FF', '7': '#2962FF'
        }
    },
    monoGreen: {
        background: '#E8F5E9',
        strings: '#388E3C',
        frets: '#2E7D32',
        markers: '#1B5E20',
        intervals: {
            '1': '#A5D6A7', 'b2': '#81C784', '2': '#66BB6A', 'b3': '#4CAF50', '3': '#43A047',
            '4': '#388E3C', 'b5': '#2E7D32', '5': '#1B5E20', '#5': '#B9F6CA', '6': '#69F0AE',
            'b7': '#00E676', '7': '#00C853'
        }
    },
    monoRed: {
        background: '#FFEBEE', strings: '#E53935', frets: '#C62828', markers: '#B71C1C',
        intervals: {
            '1': '#EF9A9A', 'b2': '#E57373', '2': '#EF5350', 'b3': '#F44336', '3': '#E53935',
            '4': '#D32F2F', 'b5': '#C62828', '5': '#B71C1C', '#5': '#FF8A80', '6': '#FF5252',
            'b7': '#FF1744', '7': '#D50000'
        }
    },
    grayscale: {
        background: '#FAFAFA',
        strings: '#616161',
        frets: '#424242',
        markers: '#212121',
        intervals: {
            '1': '#F5F5F5', 'b2': '#EEEEEE', '2': '#E0E0E0', 'b3': '#BDBDBD', '3': '#9E9E9E',
            '4': '#757575', 'b5': '#616161', '5': '#424242', '#5': '#BDBDBD', '6': '#9E9E9E',
            'b7': '#757575', '7': '#616161'
        }
    },
    blackAndWhite: {
        background: '#FFFFFF',
        strings: '#000000',
        frets: '#000000',
        markers: '#000000',
        intervals: {
            '1': '#000000', 'b2': '#333333', '2': '#000000', 'b3': '#333333', '3': '#000000',
            '4': '#333333', 'b5': '#000000', '5': '#333333', '#5': '#000000', '6': '#333333',
            'b7': '#000000', '7': '#333333'
        }
    }
};

const THEMES_DATA_GRADIENTS = {};
const gradientHues = [
    {name: 'gradRed', hue: 0},
    {name: 'gradOrangeRed', hue: 15},
    {name: 'gradOrange', hue: 30},
    {name: 'gradAmber', hue: 45},
    {name: 'gradYellow', hue: 60},
    {name: 'gradLime', hue: 75},
    {name: 'gradChartreuse', hue: 90},
    {name: 'gradGreen', hue: 120},
    {name: 'gradEmerald', hue: 150},
    {name: 'gradTeal', hue: 165},
    {name: 'gradCyan', hue: 180},
    {name: 'gradSkyBlue', hue: 195},
    {name: 'gradBlue', hue: 210},
    {name: 'gradAzure', hue: 225},
    {name: 'gradRoyalBlue', hue: 240},
    {name: 'gradIndigo', hue: 255},
    {name: 'gradPurple', hue: 270},
    {name: 'gradAmethyst', hue: 285},
    {name: 'gradViolet', hue: 300},
    {name: 'gradMagenta', hue: 315},
    {name: 'gradFuchsia', hue: 330},
    {name: 'gradPink', hue: 345},
    {name: 'gradRose', hue: 350},
    {name: 'gradCrimson', hue: 355},
    {name: 'gradSilver', hue: 0, sat: 0}
];

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0').toUpperCase();
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

gradientHues.forEach(gh => {
    const s = gh.sat !== undefined ? gh.sat : 100;
    const h = gh.hue;
    const intervals = {};
    const intervalKeys = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', '#5', '6', 'b7', '7'];
    intervalKeys.forEach((key, idx) => {
        const l = 5 + (idx * (60 / 11)); // Scales from 5% (nearly black) to 65% (bright)
        intervals[key] = hslToHex(h, s, l);
    });
    
    THEMES_DATA_GRADIENTS[gh.name] = {
        background: '#1a1a1a',
        strings: '#555555',
        frets: '#666666',
        markers: '#222222',
        intervals: intervals
    };
});

const THEMES_DATA_SPECTRAL = {};
const spectralTypes = [
    { id: 'spectralVibrant', name: 'Spectral Vibrant', bg: '#111111', s: 100, l: 50, strings: '#555555', frets: '#444444', markers: '#222222' },
    { id: 'spectralLight', name: 'Spectral Light', bg: '#F8F9FA', s: 80, l: 60, strings: '#888888', frets: '#AAAAAA', markers: '#EEEEEE' },
    { id: 'spectralPastel', name: 'Spectral Pastel', bg: '#FFFFFF', s: 60, l: 80, strings: '#CCCCCC', frets: '#DDDDDD', markers: '#FFFFFF' },
    { id: 'spectralNeon', name: 'Spectral Neon', bg: '#000000', s: 100, l: 50, strings: '#333333', frets: '#222222', markers: '#111111' },
    { id: 'spectralVintage', name: 'Spectral Vintage', bg: '#F4E8D6', s: 40, l: 60, strings: '#8D6E63', frets: '#BCAAA4', markers: '#EFEBE9' },
    { id: 'spectralMuted', name: 'Spectral Muted', bg: '#2C3E50', s: 40, l: 50, strings: '#34495E', frets: '#7F8C8D', markers: '#1A252F' },
    { id: 'spectralCyber', name: 'Spectral Cyber', bg: '#0D0221', s: 100, l: 60, strings: '#261447', frets: '#A62639', markers: '#0D0221' },
    { id: 'spectralNature', name: 'Spectral Nature', bg: '#E8F5E9', s: 70, l: 40, strings: '#81C784', frets: '#A5D6A7', markers: '#C8E6C9' },
    { id: 'spectralOcean', name: 'Spectral Ocean', bg: '#E0F7FA', s: 80, l: 45, strings: '#4DD0E1', frets: '#80DEEA', markers: '#B2EBF2' },
    { id: 'spectralSunset', name: 'Spectral Sunset', bg: '#FFF3E0', s: 85, l: 55, strings: '#FFB74D', frets: '#FFCC80', markers: '#FFE0B2' },
    { id: 'spectralBerry', name: 'Spectral Berry', bg: '#F3E5F5', s: 75, l: 50, strings: '#BA68C8', frets: '#CE93D8', markers: '#E1BEE7' },
    { id: 'spectralCoffee', name: 'Spectral Coffee', bg: '#EFEBE9', s: 50, l: 45, strings: '#A1887F', frets: '#BCAAA4', markers: '#D7CCC8' },
    { id: 'spectralMidnight', name: 'Spectral Midnight', bg: '#0A192F', s: 90, l: 65, strings: '#172A45', frets: '#303C55', markers: '#0A192F' },
    { id: 'spectralChalk', name: 'Spectral Chalk', bg: '#2B2B2B', s: 30, l: 70, strings: '#555555', frets: '#444444', markers: '#333333' },
    { id: 'spectralHighContrast', name: 'Spectral High Contrast', bg: '#000000', s: 100, l: 50, strings: '#FFFFFF', frets: '#FFFFFF', markers: '#000000' }
];

spectralTypes.forEach(t => {
    const ints = {};
    const keys = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', '#5', '6', 'b7', '7'];
    keys.forEach((k, i) => {
        const h = Math.round((i * 360) / 12);
        ints[k] = hslToHex(h, t.s, t.l);
    });
    THEMES_DATA_SPECTRAL[t.id] = {
        background: t.bg,
        strings: t.strings,
        frets: t.frets,
        markers: t.markers,
        intervals: ints
    };
});

if (typeof THEMES_DATA !== 'undefined') {
    Object.assign(THEMES_DATA, THEMES_DATA_MONO);
    Object.assign(THEMES_DATA, THEMES_DATA_GRADIENTS);
    Object.assign(THEMES_DATA, THEMES_DATA_SPECTRAL);
}