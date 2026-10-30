/**
 * Extra Themes Data
 * Contains extended theme palettes
 */

const THEMES_DATA_EXTRA = {
    ocean: {
        background: '#E0F7FA', strings: '#0277BD', frets: '#01579B', markers: '#006064',
        intervals: {
            '1': '#00BCD4', 'b2': '#0097A7', '2': '#00838F', 'b3': '#006064', '3': '#0288D1', 
            '4': '#0277BD', 'b5': '#01579B', '5': '#039BE5', '#5': '#03A9F4', '6': '#29B6F6', 
            'b7': '#4FC3F7', '7': '#81D4FA'
        }
    },
    forest: {
        background: '#E8F5E9', strings: '#2E7D32', frets: '#1B5E20', markers: '#33691E',
        intervals: {
            '1': '#4CAF50', 'b2': '#43A047', '2': '#388E3C', 'b3': '#2E7D32', '3': '#689F38', 
            '4': '#558B2F', 'b5': '#33691E', '5': '#7CB342', '#5': '#8BC34A', '6': '#9CCC65', 
            'b7': '#AED581', '7': '#C5E1A5'
        }
    },
    sunset: {
        background: '#FFF3E0', strings: '#FF8F00', frets: '#F57F17', markers: '#FF6F00',
        intervals: {
            '1': '#FFC107', 'b2': '#FFB300', '2': '#FFA000', 'b3': '#FF8F00', '3': '#FF6F00', 
            '4': '#FBC02D', 'b5': '#F9A825', '5': '#F57F17', '#5': '#FFAB00', '6': '#FFD740', 
            'b7': '#FFE57F', '7': '#FFF8E1'
        }
    },
    lavender: {
        background: '#F3E5F5', strings: '#6A1B9A', frets: '#4A148C', markers: '#7B1FA2',
        intervals: {
            '1': '#9C27B0', 'b2': '#8E24AA', '2': '#7B1FA2', 'b3': '#6A1B9A', '3': '#AB47BC', 
            '4': '#BA68C8', 'b5': '#CE93D8', '5': '#673AB7', '#5': '#5E35B1', '6': '#512DA8', 
            'b7': '#4527A0', '7': '#7E57C2'
        }
    },
    autumn: {
        background: '#FBE9E7', strings: '#BF360C', frets: '#8D6E63', markers: '#5D4037',
        intervals: {
            '1': '#795548', 'b2': '#6D4C41', '2': '#5D4037', 'b3': '#4E342E', '3': '#3E2723', 
            '4': '#D84315', 'b5': '#BF360C', '5': '#F4511E', '#5': '#FF5722', '6': '#FF8A65', 
            'b7': '#FFAB91', '7': '#FFCCBC'
        }
    },
    pastel: {
        background: '#FAFAFA', strings: '#90A4AE', frets: '#607D8B', markers: '#455A64',
        intervals: {
            '1': '#FFCDD2', 'b2': '#F8BBD0', '2': '#FF99D1', 'b3': '#FF80C4', '3': '#FF66B8', 
            '4': '#FF4DAC', 'b5': '#FF33A0', '5': '#FF1A94', '#5': '#FF0088', '6': '#E6005C', 
            'b7': '#CC006C', '7': '#B3005F'
        }
    },
    neon: {
        background: '#212121', strings: '#484848', frets: '#303030', markers: '#757575',
        intervals: {
            '1': '#FF1744', 'b2': '#F50057', '2': '#D500F9', 'b3': '#651FFF', '3': '#3F5AFE', 
            '4': '#2979FF', 'b5': '#00B0FF', '5': '#00E5FF', '#5': '#1DE9B6', '6': '#00E676', 
            'b7': '#FF4081', '7': '#FFEA00'
        }
    },
    zebrawood: {
        background: '#E0E0E0', strings: '#616161', frets: '#424242', markers: '#212121',
        intervals: {
            '1': '#2E7D32', 'b2': '#388E3C', '2': '#43A047', 'b3': '#4CAF50', '3': '#66BB6A', 
            '4': '#81C784', 'b5': '#A5D6A7', '5': '#C8E6C9', '#5': '#E8F5E9', '6': '#F1F8E9', 
            'b7': '#F9FBE7', '7': '#FFF8E1'
        }
    },
    mahogany: {
        background: '#C04000', strings: '#FFDEAD', frets: '#8B4513', markers: '#FFF8DC',
        intervals: {
            '1': '#FFEB3B', 'b2': '#FFC107', '2': '#FF9800', 'b3': '#FF5722', '3': '#F44336', 
            '4': '#E91E63', 'b5': '#9C27B0', '5': '#673AB7', '#5': '#3F51B5', '6': '#2196F3', 
            'b7': '#03A9F4', '7': '#00BCD4'
        }
    }
    // Add more extra themes as needed
};

// Merge into THEMES_DATA if it exists
if (typeof THEMES_DATA !== 'undefined') {
    Object.assign(THEMES_DATA, THEMES_DATA_EXTRA);
}