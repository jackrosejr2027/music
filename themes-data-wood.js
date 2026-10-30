/**
 * Wood Fretboard Themes Data
 */
const THEMES_DATA_WOOD = {
    mahogany: {
        background: '#C04000',
        strings: '#FFDEAD',
        frets: '#8B4513',
        markers: '#FFF8DC',
        intervals: {
            '1': '#FFEB3B', 'b2': '#FFC107', '2': '#FF9800', 'b3': '#FF5722', '3': '#F44336',
            '4': '#E91E63', 'b5': '#9C27B0', '5': '#673AB7', '#5': '#3F51B5', '6': '#2196F3',
            'b7': '#03A9F4', '7': '#00BCD4'
        }
    },
    walnut: {
        background: '#5D4037',
        strings: '#D7CCC8',
        frets: '#3E2723',
        markers: '#BCAAA4',
        intervals: {
            '1': '#FFCDD2', 'b2': '#F8BBD0', '2': '#E1BEE7', 'b3': '#D1C4E9', '3': '#C5CAE9',
            '4': '#BBDEFB', 'b5': '#B2EBF2', '5': '#B2DFDB', '#5': '#B2FF59', '6': '#C8E6C9',
            'b7': '#DCEDC8', '7': '#F0F4C3'
        }
    },
    oak: {
        background: '#D7CCC8',
        strings: '#5D4037',
        frets: '#4E342E',
        markers: '#3E2723',
        intervals: {
            '1': '#EF5350', 'b2': '#EC407A', '2': '#AB47BC', 'b3': '#7E57C2', '3': '#5C6BC0',
            '4': '#42A5F5', 'b5': '#29B6F6', '5': '#26C6DA', '#5': '#26A69A', '6': '#66BB6A',
            'b7': '#9CCC65', '7': '#D4E157'
        }
    },
    maple: {
        background: '#FFCC80',
        strings: '#A1887F',
        frets: '#8D6E63',
        markers: '#6D4C41',
        intervals: {
            '1': '#EF9A9A', 'b2': '#F48FB1', '2': '#CE93D8', 'b3': '#B39DDB', '3': '#9FA8DA',
            '4': '#90CAF9', 'b5': '#81D4FA', '5': '#80DEEA', '#5': '#80CBC4', '6': '#A5D6A7',
            'b7': '#C5E1A5', '7': '#E6EE9C'
        }
    },
    rosewood: {
        background: '#5D4037',
        strings: '#FFECB3',
        frets: '#4E342E',
        markers: '#FFCC80',
        intervals: {
            '1': '#FF5722', 'b2': '#FF7043', '2': '#FF8A65', 'b3': '#FFAB91', '3': '#FFCCBC',
            '4': '#FBE9E7', 'b5': '#FFCC80', '5': '#FFE0B2', '#5': '#FFF3E0', '6': '#FFF8E1',
            'b7': '#FFECB3', '7': '#FFE082'
        }
    },
    ebony: {
        background: '#212121',
        strings: '#757575',
        frets: '#424242',
        markers: '#BDBDBD',
        intervals: {
            '1': '#FAFAFA', 'b2': '#F5F5F5', '2': '#EEEEEE', 'b3': '#E0E0E0', '3': '#BDBDBD',
            '4': '#9E9E9E', 'b5': '#757575', '5': '#616161', '#5': '#424242', '6': '#BDBDBD',
            'b7': '#9E9E9E', '7': '#757575'
        }
    },
    koa: {
        background: '#A1887F',
        strings: '#FFECB3',
        frets: '#795548',
        markers: '#D7CCC8',
        intervals: {
            '1': '#FFA000', 'b2': '#FFB300', '2': '#FFC107', 'b3': '#FFCA28', '3': '#FFD54F',
            '4': '#FFE082', 'b5': '#FFECB3', '5': '#FFF8E1', '#5': '#FFFDE7', '6': '#F9FBE7',
            'b7': '#F0F4C3', '7': '#E6EE9C'
        }
    },
    padauk: {
        background: '#BF360C',
        strings: '#FFD54F',
        frets: '#8D6E63',
        markers: '#FFECB3',
        intervals: {
            '1': '#FFCDD2', 'b2': '#EF9A9A', '2': '#E57373', 'b3': '#EF5350', '3': '#F44336',
            '4': '#E53935', 'b5': '#D32F2F', '5': '#C62828', '#5': '#B71C1C', '6': '#FF8A80',
            'b7': '#FF5252', '7': '#FF1744'
        }
    },
    purpleheart: {
        background: '#6A1B9A',
        strings: '#CE93D8',
        frets: '#4A148C',
        markers: '#E1BEE7',
        intervals: {
            '1': '#F3E5F5', 'b2': '#E1BEE7', '2': '#CE93D8', 'b3': '#BA68C8', '3': '#AB47BC',
            '4': '#9C27B0', 'b5': '#8E24AA', '5': '#7B1FA2', '#5': '#6A1B9A', '6': '#4A148C',
            'b7': '#EA80FC', '7': '#E040FB'
        }
    },
    bubinga: {
        background: '#8D6E63',
        strings: '#FFECB3',
        frets: '#6D4C41',
        markers: '#F5F5F5',
        intervals: {
            '1': '#FFAB91', 'b2': '#FF8A65', '2': '#FF7043', 'b3': '#FF5722', '3': '#F4511E',
            '4': '#E64A19', 'b5': '#D84315', '5': '#BF360C', '#5': '#DD2C00', '6': '#FF3D00',
            'b7': '#E60000', '7': '#DC143C'
        }
    },
    wenge: {
        background: '#3E2723',
        strings: '#8D6E63',
        frets: '#212121',
        markers: '#D7CCC8',
        intervals: {
            '1': '#A1887F', 'b2': '#8D6E63', '2': '#795548', 'b3': '#6D4C41', '3': '#5D4037',
            '4': '#4E342E', 'b5': '#3E2723', '5': '#BCAAA4', '#5': '#A1887F', '6': '#8D6E63',
            'b7': '#795548', '7': '#6D4C41'
        }
    },
    sapele: {
        background: '#8D6E63',
        strings: '#FFD54F',
        frets: '#6D4C41',
        markers: '#FFF8E1',
        intervals: {
            '1': '#FFAB91', 'b2': '#FFCCBC', '2': '#FFAB91', 'b3': '#FF8A65', '3': '#FF7043',
            '4': '#FF5722', 'b5': '#F4511E', '5': '#E64A19', '#5': '#D84315', '6': '#BF360C',
            'b7': '#FF9E80', '7': '#FF6E40'
        }
    },
    blackwood: {
        background: '#212121',
        strings: '#9E9E9E',
        frets: '#424242',
        markers: '#E0E0E0',
        intervals: {
            '1': '#E0E0E0', 'b2': '#BDBDBD', '2': '#9E9E9E', 'b3': '#757575', '3': '#616161',
            '4': '#424242', 'b5': '#FF9E80', '5': '#FF6F00', '#5': '#FF3D00', '6': '#DD2C00',
            'b7': '#BF360C', '7': '#D84315'
        }
    },
    pinewood: {
        background: '#FFE0B2',
        strings: '#FF9800',
        frets: '#F57C00',
        markers: '#E65100',
        intervals: {
            '1': '#FFCC80', 'b2': '#FFB74D', '2': '#FFA726', 'b3': '#FF9800', '3': '#FB8C00',
            '4': '#F57C00', 'b5': '#EF6C00', '5': '#E65100', '#5': '#BF360C', '6': '#D84315',
            'b7': '#E64A19', '7': '#F4511E'
        }
    },
    alder: {
        background: '#BCAAA4',
        strings: '#795548',
        frets: '#5D4037',
        markers: '#3E2723',
        intervals: {
            '1': '#8BC34A', 'b2': '#7CB342', '2': '#689F38', 'b3': '#558B2F', '3': '#33691E',
            '4': '#DCEDC8', 'b5': '#C5E1A5', '5': '#AED581', '#5': '#9CCC65', '6': '#8BC34A',
            'b7': '#7CB342', '7': '#689F38'
        }
    },
    ash: {
        background: '#ECEFF1',
        strings: '#607D8B',
        frets: '#455A64',
        markers: '#263238',
        intervals: {
            '1': '#CFD8DC', 'b2': '#B0BEC5', '2': '#90A4AE', 'b3': '#78909C', '3': '#607D8B',
            '4': '#546E7A', 'b5': '#455A64', '5': '#37474F', '#5': '#263238', '6': '#CFD8DC',
            'b7': '#B0BEC5', '7': '#90A4AE'
        }
    },
    bamboo: {
        background: '#F0F4C3',
        strings: '#AFB42B',
        frets: '#9E9D24',
        markers: '#827717',
        intervals: {
            '1': '#F9FBE7', 'b2': '#F0F4C3', '2': '#E6EE9C', 'b3': '#DCE775', '3': '#D4E157',
            '4': '#CDDC39', 'b5': '#C0CA33', '5': '#AFB42B', '#5': '#9E9D24', '6': '#827717',
            'b7': '#F4FF81', '7': '#EEFF41'
        }
    },
    cedar: {
        background: '#A1887F',
        strings: '#D7CCC8',
        frets: '#6D4C41',
        markers: '#4E342E',
        intervals: {
            '1': '#FFAB91', 'b2': '#FF8A65', '2': '#FF7043', 'b3': '#FF5722', '3': '#F4511E',
            '4': '#E64A19', 'b5': '#D84315', '5': '#BF360C', '#5': '#DD2C00', '6': '#FFAB91',
            'b7': '#FF8A65', '7': '#FF7043'
        }
    },
    redwood: {
        background: '#BF360C',
        strings: '#FFAB91',
        frets: '#8D6E63',
        markers: '#FBE9E7',
        intervals: {
            '1': '#FFAB91', 'b2': '#FF8A65', '2': '#FF7043', 'b3': '#FF5722', '3': '#F4511E',
            '4': '#FBE9E7', 'b5': '#FFCCBC', '5': '#FFAB91', '#5': '#FF8A65', '6': '#FF7043',
            'b7': '#FF5722', '7': '#F4511E'
        }
    },
    butternut: {
        background: '#FFE0B2',
        strings: '#FFB74D',
        frets: '#FF9800',
        markers: '#E65100',
        intervals: {
            '1': '#FFFDE7', 'b2': '#FFF9C4', '2': '#FFF59D', 'b3': '#FFF176', '3': '#FFEE58',
            '4': '#FFEB3B', 'b5': '#FDD835', '5': '#FBC02D', '#5': '#F9A825', '6': '#F57F17',
            'b7': '#FFD600', '7': '#FFEA00'
        }
    },
    ziricote: {
        background: '#424242',
        strings: '#9E9E9E',
        frets: '#212121',
        markers: '#F5F5F5',
        intervals: {
            '1': '#BDBDBD', 'b2': '#9E9E9E', '2': '#757575', 'b3': '#616161', '3': '#424242',
            '4': '#FF5722', 'b5': '#F4511E', '5': '#E64A19', '#5': '#D84315', '6': '#BF360C',
            'b7': '#FF9E80', '7': '#FF6E40'
        }
    },
    bocote: {
        background: '#A1887F',
        strings: '#FFECB3',
        frets: '#6D4C41',
        markers: '#D7CCC8',
        intervals: {
            '1': '#FFECB3', 'b2': '#FFE082', '2': '#FFD54F', 'b3': '#FFCA28', '3': '#FFC107',
            '4': '#FFB300', 'b5': '#FFA000', '5': '#FF8F00', '#5': '#FF6F00', '6': '#FFF8E1',
            'b7': '#FFECB3', '7': '#FFE082'
        }
    },
    blacklimba: {
        background: '#424242',
        strings: '#BDBDBD',
        frets: '#212121',
        markers: '#F5F5F5',
        intervals: {
            '1': '#FFC107', 'b2': '#FFB300', '2': '#FFA000', 'b3': '#FF8F00', '3': '#FF6F00',
            '4': '#FFD54F', 'b5': '#FFCA28', '5': '#FFC107', '#5': '#FFB300', '6': '#FFA000',
            'b7': '#FF8F00', '7': '#FF6F00'
        }
    },
    canary: {
        background: '#FFF59D',
        strings: '#FBC02D',
        frets: '#F9A825',
        markers: '#F57F17',
        intervals: {
            '1': '#FFFDE7', 'b2': '#FFF9C4', '2': '#FFF59D', 'b3': '#FFF176', '3': '#FFEE58',
            '4': '#FFEB3B', 'b5': '#FDD835', '5': '#FBC02D', '#5': '#F9A825', '6': '#F57F17',
            'b7': '#FFD600', '7': '#FFEA00'
        }
    },
    beech: {
        background: '#D7CCC8',
        strings: '#8D6E63',
        frets: '#5D4037',
        markers: '#BCAAA4',
        intervals: {
            '1': '#BCAAA4', 'b2': '#A1887F', '2': '#8D6E63', 'b3': '#795548', '3': '#6D4C41',
            '4': '#5D4037', 'b5': '#4E342E', '5': '#3E2723', '#5': '#D7CCC8', '6': '#BCAAA4',
            'b7': '#A1887F', '7': '#8D6E63'
        }
    },
    hickory: {
        background: '#BCAAA4',
        strings: '#5D4037',
        frets: '#4E342E',
        markers: '#3E2723',
        intervals: {
            '1': '#A1887F', 'b2': '#8D6E63', '2': '#795548', 'b3': '#6D4C41', '3': '#5D4037',
            '4': '#4E342E', 'b5': '#3E2723', '5': '#EFEBE9', '#5': '#D7CCC8', '6': '#BCAAA4',
            'b7': '#A1887F', '7': '#8D6E63'
        }
    },
    macassar: {
        background: '#4E342E',
        strings: '#A1887F',
        frets: '#3E2723',
        markers: '#D7CCC8',
        intervals: {
            '1': '#D7CCC8', 'b2': '#BCAAA4', '2': '#A1887F', 'b3': '#8D6E63', '3': '#795548',
            '4': '#6D4C41', 'b5': '#5D4037', '5': '#4E342E', '#5': '#3E2723', '6': '#D7CCC8',
            'b7': '#BCAAA4', '7': '#A1887F'
        }
    },
    sitka: {
        background: '#FFE0B2',
        strings: '#FFA726',
        frets: '#F57C00',
        markers: '#E65100',
        intervals: {
            '1': '#FFFDE7', 'b2': '#FFF9C4', '2': '#FFF59D', 'b3': '#FFF176', '3': '#FFEE58',
            '4': '#FFEB3B', 'b5': '#FDD835', '5': '#FBC02D', '#5': '#F9A825', '6': '#F57F17',
            'b7': '#FFD600', '7': '#FFEA00'
        }
    },
    cocobolo: {
        background: '#BF360C',
        strings: '#FFCC80',
        frets: '#E65100',
        markers: '#FFECB3',
        intervals: {
            '1': '#FF7043', 'b2': '#FF5722', '2': '#F4511E', 'b3': '#E64A19', '3': '#D84315',
            '4': '#BF360C', 'b5': '#FFD54F', '5': '#FFCA28', '#5': '#FFC107', '6': '#FFB300',
            'b7': '#FFA000', '7': '#FF8F00'
        }
    },
    pecan: {
        background: '#A1887F',
        strings: '#FFECB3',
        frets: '#795548',
        markers: '#FFCC80',
        intervals: {
            '1': '#FFFDE7', 'b2': '#FFF9C4', '2': '#FFF59D', 'b3': '#FFF176', '3': '#FFEE58',
            '4': '#FFEB3B', 'b5': '#FDD835', '5': '#FBC02D', '#5': '#F9A825', '6': '#F57F17',
            'b7': '#FFD600', '7': '#FFEA00'
        }
    },
    tamo: {
        background: '#D7CCC8',
        strings: '#8D6E63',
        frets: '#5D4037',
        markers: '#BCAAA4',
        intervals: {
            '1': '#D7CCC8', 'b2': '#BCAAA4', '2': '#A1887F', 'b3': '#8D6E63', '3': '#795548',
            '4': '#6D4C41', 'b5': '#5D4037', '5': '#4E342E', '#5': '#3E2723', '6': '#D7CCC8',
            'b7': '#BCAAA4', '7': '#A1887F'
        }
    },
    zebrawood: {
        background: '#E0E0E0',
        strings: '#616161',
        frets: '#424242',
        markers: '#212121',
        intervals: {
            '1': '#2E7D32', 'b2': '#388E3C', '2': '#43A047', 'b3': '#4CAF50', '3': '#66BB6A',
            '4': '#81C784', 'b5': '#A5D6A7', '5': '#C8E6C9', '#5': '#E8F5E9', '6': '#F1F8E9',
            'b7': '#F9FBE7', '7': '#FFF8E1'
        }
    },
    birch: {
        background: '#FFECB3',
        strings: '#FFA000',
        frets: '#FF8F00',
        markers: '#FF6F00',
        intervals: {
            '1': '#FFF8E1', 'b2': '#FFECB3', '2': '#FFE082', 'b3': '#FFD54F', '3': '#FFCA28',
            '4': '#FFC107', 'b5': '#FFB300', '5': '#FFA000', '#5': '#FF8F00', '6': '#FF6F00',
            'b7': '#FFE57F', '7': '#FFD740'
        }
    },
    ovangkol: {
        background: '#8D6E63',
        strings: '#D7CCC8',
        frets: '#5D4037',
        markers: '#BCAAA4',
        intervals: {
            '1': '#A1887F', 'b2': '#8D6E63', '2': '#795548', 'b3': '#6D4C41', '3': '#5D4037',
            '4': '#4E342E', 'b5': '#3E2723', '5': '#D7CCC8', '#5': '#BCAAA4', '6': '#A1887F',
            'b7': '#8D6E63', '7': '#795548'
        }
    },
    redmaple: {
        background: '#FFAB91',
        strings: '#E64A19',
        frets: '#BF360C',
        markers: '#FFCCBC',
        intervals: {
            '1': '#FFCCBC', 'b2': '#FFAB91', '2': '#FF8A65', 'b3': '#FF7043', '3': '#FF5722',
            '4': '#F4511E', 'b5': '#E64A19', '5': '#D84315', '#5': '#BF360C', '6': '#3E2723',
            'b7': '#5D4037', '7': '#795548'
        }
    },
    lacewood: {
        background: '#BCAAA4',
        strings: '#6D4C41',
        frets: '#5D4037',
        markers: '#3E2723',
        intervals: {
            '1': '#FFECB3', 'b2': '#FFE082', '2': '#FFD54F', 'b3': '#FFCA28', '3': '#FFC107',
            '4': '#FFB300', 'b5': '#FFA000', '5': '#FF8F00', '#5': '#FF6F00', '6': '#FFAB91',
            'b7': '#FF8A65', '7': '#FF7043'
        }
    },
    cypress: {
        background: '#D7CCC8',
        strings: '#8D6E63',
        frets: '#795548',
        markers: '#5D4037',
        intervals: {
            '1': '#DCEDC8', 'b2': '#C5E1A5', '2': '#AED581', 'b3': '#9CCC65', '3': '#8BC34A',
            '4': '#7CB342', 'b5': '#689F38', '5': '#558B2F', '#5': '#33691E', '6': '#CCFF90',
            'b7': '#B2FF59', '7': '#76FF03'
        }
    }
};

// Merge into THEMES_DATA if it exists
if (typeof THEMES_DATA !== 'undefined') {
    Object.assign(THEMES_DATA, THEMES_DATA_WOOD);
}