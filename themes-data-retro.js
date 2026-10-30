/**
 * Retro and Vintage Fretboard Themes Data
 */
const THEMES_DATA_RETRO = {
    vintage: {
        background: '#FFF8E1',
        strings: '#8D6E63',
        frets: '#6D4C41',
        markers: '#5D4037',
        intervals: {
            '1': '#D7CCC8', 'b2': '#BCAAA4', '2': '#A1887F', 'b3': '#8D6E63', '3': '#795548',
            '4': '#6D4C41', 'b5': '#5D4037', '5': '#4E342E', '#5': '#FFECB3', '6': '#FFE082',
            'b7': '#FFD54F', '7': '#FFCA28'
        }
    },
    retro: {
        background: '#ECEFF1',
        strings: '#607D8B',
        frets: '#455A64',
        markers: '#37474F',
        intervals: {
            '1': '#B0BEC5', 'b2': '#90A4AE', '2': '#78909C', 'b3': '#607D8B', '3': '#546E7A',
            '4': '#455A64', 'b5': '#37474F', '5': '#263238', '#5': '#CFD8DC', '6': '#B0BEC5',
            'b7': '#90A4AE', '7': '#78909C'
        }
    },
    steampunk: {
        background: '#5C4033',
        strings: '#DAA520',
        frets: '#8B4513',
        markers: '#CD853F',
        intervals: {
            '1': '#FFD700', 'b2': '#EECFA1', '2': '#D2B48C', 'b3': '#B8860B', '3': '#CD853F',
            '4': '#A0522D', 'b5': '#8B4513', '5': '#654321', '#5': '#5C4033', '6': '#800000',
            'b7': '#8B0000', '7': '#A52A2A'
        }
    },
    blueprint: {
        background: '#002B49',
        strings: '#00B2CA',
        frets: '#FFFFFF',
        markers: '#7DCFB6',
        intervals: {
            '1': '#00B2CA', 'b2': '#1DBAB0', '2': '#3BC397', 'b3': '#58CB7D', '3': '#76D264',
            '4': '#94DA4A', 'b5': '#B2E131', '5': '#D0E917', '#5': '#EDF100', '6': '#FBD407',
            'b7': '#F9A11B', '7': '#F76F2E'
        }
    }
};

if (typeof THEMES_DATA !== 'undefined') {
    Object.assign(THEMES_DATA, THEMES_DATA_RETRO);
}