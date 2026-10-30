/**
 * Miscellaneous Fretboard Themes Data
 */
const THEMES_DATA_MISC = {
    coffee: {
        background: '#EFEBE9',
        strings: '#5D4037',
        frets: '#4E342E',
        markers: '#3E2723',
        intervals: {
            '1': '#D7CCC8', 'b2': '#BCAAA4', '2': '#A1887F', 'b3': '#8D6E63', '3': '#795548',
            '4': '#6D4C41', 'b5': '#5D4037', '5': '#4E342E', '#5': '#3E2723', '6': '#8D6E63',
            'b7': '#6D4C41', '7': '#5D4037'
        }
    },
    candy: {
        background: '#FCE4EC',
        strings: '#EC407A',
        frets: '#D81B60',
        markers: '#C2185B',
        intervals: {
            '1': '#F8BBD0', 'b2': '#F48FB1', '2': '#F06292', 'b3': '#EC407A', '3': '#FFCDD2',
            '4': '#EF9A9A', 'b5': '#E57373', '5': '#EF5350', '#5': '#BBDEFB', '6': '#90CAF9',
            'b7': '#64B5F6', '7': '#42A5F5'
        }
    },
    iceCream: {
        background: '#FFF3E0',
        strings: '#FFB74D',
        frets: '#FFA726',
        markers: '#FF9800',
        intervals: {
            '1': '#FFF8E1', 'b2': '#FFECB3', '2': '#FFE082', 'b3': '#FFD54F', '3': '#FFCA28',
            '4': '#FFC107', 'b5': '#FFB300', '5': '#FFA000', '#5': '#FF8F00', '6': '#FFF8E1',
            'b7': '#FFECB3', '7': '#FFE082'
        }
    },
    candlelight: {
        background: '#F5D0A9',
        strings: '#FF8000',
        frets: '#B45F04',
        markers: '#8A4B08',
        intervals: {
            '1': '#FE9A2E', 'b2': '#FE9A2E', '2': '#FA8258', 'b3': '#F7BE81', '3': '#F5D0A9',
            '4': '#F3E2A9', 'b5': '#F2F5A9', '5': '#D0F5A9', '#5': '#A9F5A9', '6': '#A9F5D0',
            'b7': '#A9F5F2', '7': '#A9D0F5'
        }
    },
    freshMint: {
        background: '#F5FFFA',
        strings: '#40E0D0',
        frets: '#48D1CC',
        markers: '#00CED1',
        intervals: {
            '1': '#40E0D0', 'b2': '#48D1CC', '2': '#00CED1', 'b3': '#20B2AA', '3': '#5F9EA0',
            '4': '#008B8B', 'b5': '#008080', '5': '#006400', '#5': '#556B2F', '6': '#8E8E8E',
            'b7': '#66CDAA', '7': '#3CB371'
        }
    },
    royalty: {
        background: '#4B0082',
        strings: '#8A2BE2',
        frets: '#9370DB',
        markers: '#BA55D3',
        intervals: {
            '1': '#4B0082', 'b2': '#590BA0', '2': '#6716BE', 'b3': '#7521DC', '3': '#832DFA',
            '4': '#914EFF', 'b5': '#A06FFF', '5': '#AE90FF', '#5': '#BCB1FF', '6': '#CAD2FF',
            'b7': '#D8F3FF', '7': '#E6FFFF'
        }
    },
    rustic: {
        background: '#F4A460',
        strings: '#8B4513',
        frets: '#A52A2A',
        markers: '#654321',
        intervals: {
            '1': '#F4A460', 'b2': '#E9A066', '2': '#DE9B6D', 'b3': '#D39774', '3': '#C8927B',
            '4': '#BD8E82', 'b5': '#B28989', '5': '#A78490', '#5': '#9C8097', '6': '#917B9E',
            'b7': '#8677A5', '7': '#7B72AC'
        }
    }
};

if (typeof THEMES_DATA !== 'undefined') {
    Object.assign(THEMES_DATA, THEMES_DATA_MISC);
}