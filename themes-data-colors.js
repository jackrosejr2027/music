/**
 * Color Fretboard Themes Data
 */
const THEMES_DATA_COLORS = {
    mint: {
        background: '#E0F2F1',
        strings: '#00897B',
        frets: '#00796B',
        markers: '#00695C',
        intervals: {
            '1': '#80CBC4', 'b2': '#4DB6AC', '2': '#26A69A', 'b3': '#009688', '3': '#00897B',
            '4': '#00796B', 'b5': '#00695C', '5': '#004D40', '#5': '#A7FFEB', '6': '#64FFDA',
            'b7': '#1DE9B6', '7': '#00BFA5'
        }
    },
    cherry: {
        background: '#FCE4EC',
        strings: '#C2185B',
        frets: '#AD1457',
        markers: '#880E4F',
        intervals: {
            '1': '#F8BBD0', 'b2': '#F48FB1', '2': '#F06292', 'b3': '#EC407A', '3': '#E91E63',
            '4': '#D81B60', 'b5': '#C2185B', '5': '#AD1457', '#5': '#FF80AB', '6': '#FF4081',
            'b7': '#F50057', '7': '#C51162'
        }
    },
    vibrant: {
        background: '#FFFFFF',
        strings: '#212121',
        frets: '#424242',
        markers: '#616161',
        intervals: {
            '1': '#F44336', 'b2': '#E91E63', '2': '#9C27B0', 'b3': '#673AB7', '3': '#3F51B5',
            '4': '#2196F3', 'b5': '#03A9F4', '5': '#00BCD4', '#5': '#009688', '6': '#4CAF50',
            'b7': '#8BC34A', '7': '#CDDC39'
        }
    },
    emerald: {
        background: '#E8F5E9',
        strings: '#43A047',
        frets: '#388E3C',
        markers: '#2E7D32',
        intervals: {
            '1': '#C8E6C9', 'b2': '#A5D6A7', '2': '#81C784', 'b3': '#66BB6A', '3': '#4CAF50',
            '4': '#43A047', 'b5': '#388E3C', '5': '#2E7D32', '#5': '#1B5E20', '6': '#81C784',
            'b7': '#4CAF50', '7': '#2E7D32'
        }
    },
    muted: {
        background: '#ECEFF1',
        strings: '#78909C',
        frets: '#607D8B',
        markers: '#546E7A',
        intervals: {
            '1': '#CFD8DC', 'b2': '#B0BEC5', '2': '#90A4AE', 'b3': '#78909C', '3': '#607D8B',
            '4': '#546E7A', 'b5': '#455A64', '5': '#37474F', '#5': '#263238', '6': '#78909C',
            'b7': '#546E7A', '7': '#455A64'
        }
    },
    blueberry: {
        background: '#E3F2FD',
        strings: '#1976D2',
        frets: '#1565C0',
        markers: '#0D47A1',
        intervals: {
            '1': '#BBDEFB', 'b2': '#90CAF9', '2': '#64B5F6', 'b3': '#42A5F5', '3': '#2196F3',
            '4': '#1E88E5', 'b5': '#1976D2', '5': '#1565C0', '#5': '#0D47A1', '6': '#42A5F5',
            'b7': '#1976D2', '7': '#0D47A1'
        }
    },
    redWine: {
        background: '#FFEBEE',
        strings: '#B71C1C',
        frets: '#7B1FA2',
        markers: '#4A148C',
        intervals: {
            '1': '#EF9A9A', 'b2': '#E57373', '2': '#EF5350', 'b3': '#F44336', '3': '#E53935',
            '4': '#D32F2F', 'b5': '#C62828', '5': '#B71C1C', '#5': '#D1C4E9', '6': '#B39DDB',
            'b7': '#9575CD', '7': '#673AB7'
        }
    },
    seaGreen: {
        background: '#E0F7FA',
        strings: '#00BCD4',
        frets: '#0097A7',
        markers: '#006064',
        intervals: {
            '1': '#B2EBF2', 'b2': '#80DEEA', '2': '#4DD0E1', 'b3': '#26C6DA', '3': '#00BCD4',
            '4': '#00ACC1', 'b5': '#0097A7', '5': '#00838F', '#5': '#006064', '6': '#4DD0E1',
            'b7': '#00ACC1', '7': '#00838F'
        }
    },
    teal: {
        background: '#E0F2F1',
        strings: '#00695C',
        frets: '#004D40',
        markers: '#009688',
        intervals: {
            '1': '#B2DFDB', 'b2': '#80CBC4', '2': '#4DB6AC', 'b3': '#26A69A', '3': '#009688',
            '4': '#00897B', 'b5': '#00796B', '5': '#00695C', '#5': '#004D40', '6': '#26A69A',
            'b7': '#00796B', '7': '#004D40'
        }
    },
    amber: {
        background: '#FFF8E1',
        strings: '#FFB300',
        frets: '#FF8F00',
        markers: '#FF6F00',
        intervals: {
            '1': '#FFECB3', 'b2': '#FFE082', '2': '#FFD54F', 'b3': '#FFCA28', '3': '#FFC107',
            '4': '#FFB300', 'b5': '#FFA000', '5': '#FF8F00', '#5': '#FF6F00', '6': '#FFD54F',
            'b7': '#FFA000', '7': '#FF6F00'
        }
    },
    bubblegum: {
        background: '#FFDCF2',
        strings: '#FF4D94',
        frets: '#FF1A75',
        markers: '#E6005C',
        intervals: {
            '1': '#FFB3DD', 'b2': '#FF99D1', '2': '#FF80C4', 'b3': '#FF66B8', '3': '#FF4DAC',
            '4': '#FF33A0', 'b5': '#FF1A94', '5': '#FF0088', '#5': '#E6007A', '6': '#CC006C',
            'b7': '#B3005F', '7': '#990051'
        }
    },
    mustard: {
        background: '#FFDB58',
        strings: '#EEBA30',
        frets: '#C49102',
        markers: '#AA7700',
        intervals: {
            '1': '#FFDB58', 'b2': '#FFD24A', '2': '#FFC93C', 'b3': '#FFC02E', '3': '#FFB720',
            '4': '#FFAE12', 'b5': '#FFA504', '5': '#F49700', '#5': '#E38900', '6': '#D27B00',
            'b7': '#C16D00', '7': '#B05F00'
        }
    },
    velvet: {
        background: '#240A34',
        strings: '#420D5F',
        frets: '#7B337D',
        markers: '#C04ABC',
        intervals: {
            '1': '#240A34', 'b2': '#341447', '2': '#441E5A', 'b3': '#54286D', '3': '#643280',
            '4': '#743C93', 'b5': '#8446A6', '5': '#9450B9', '#5': '#A45ACC', '6': '#B464DF',
            'b7': '#C46EF2', '7': '#D478FF'
        }
    },
    white: {
        background: '#FAFAFA',
        strings: '#9E9E9E',
        frets: '#616161',
        markers: '#212121',
        intervals: {
            '1': '#E0E0E0', 'b2': '#BDBDBD', '2': '#9E9E9E', 'b3': '#757575', '3': '#616161',
            '4': '#424242', 'b5': '#212121', '5': '#F5F5F5', '#5': '#EEEEEE', '6': '#E0E0E0',
            'b7': '#BDBDBD', '7': '#9E9E9E'
        }
    },
    plainWhite: {
        background: '#FFFFFF',
        strings: '#444444',
        frets: '#444444',
        markers: '#FFFFFF',
        intervals: {
            '1': '#FFFFFF', 'b2': '#FFFFFF', '2': '#FFFFFF', '#2': '#FFFFFF', 'b3': '#FFFFFF', 
            '3': '#FFFFFF', '#3': '#FFFFFF', '4': '#FFFFFF', '#4': '#FFFFFF', 'b5': '#FFFFFF', 
            '5': '#FFFFFF', '#5': '#FFFFFF', 'b6': '#FFFFFF', '6': '#FFFFFF', 'b7': '#FFFFFF', 
            '7': '#FFFFFF'
        }
    }
};

if (typeof THEMES_DATA !== 'undefined') {
    Object.assign(THEMES_DATA, THEMES_DATA_COLORS);
}