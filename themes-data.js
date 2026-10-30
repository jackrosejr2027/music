/**
 * Core Fretboard Themes Data
 */
    const THEMES_DATA = {
        default: {
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
        },
        // New theme: default_ii
        default_ii: {
            background: '#FFFFFF',
            strings: '#444444',
            frets: '#444444',
            markers: '#FFFFFF',
            // Root (1) has dark grey fill with white text; all other intervals use white fill with black text
            intervals: {
                '1': '#444444', 
                'b2': '#FFFFFF', '2': '#FFFFFF', '#2': '#FFFFFF', 'b3': '#FFFFFF', 
                '3': '#FFFFFF', '#3': '#FFFFFF', '4': '#FFFFFF', '#4': '#FFFFFF', 'b5': '#FFFFFF', 
                '5': '#FFFFFF', '#5': '#FFFFFF', 'b6': '#FFFFFF', '6': '#FFFFFF', 'b7': '#FFFFFF', 
                '7': '#FFFFFF'
            },
            // Provide text color mapping for ease (app uses interval fill; text contrast will be computed)
            textColors: {
                '1': '#FFFFFF',
                'b2': '#000000', '2': '#000000', '#2': '#000000', 'b3': '#000000',
                '3': '#000000', '#3': '#000000', '4': '#000000', '#4': '#000000', 'b5': '#000000',
                '5': '#000000', '#5': '#000000', 'b6': '#000000', '6': '#000000', 'b7': '#000000',
                '7': '#000000'
            }
        },
        dark: {
            background: '#222222',
            strings: '#AAAAAA',
            frets: '#666666',
            markers: '#DDDDDD',
            intervals: {
                '1': '#FF5252', 'b2': '#FF7F50', '2': '#FFD700', 'b3': '#9ACD32',
                '3': '#4CAF50', '4': '#00BCD4', 'b5': '#2196F3', '5': '#3F51B5',
                '#5': '#9C27B0', '6': '#E91E63', 'b7': '#FF4081', '7': '#FF6E40'
            }
        },
        colorful: {
            background: '#F5F5F5',
            strings: '#555555',
            frets: '#333333',
            markers: '#000000',
            intervals: {
                '1': '#E53935', 'b2': '#FB8C00', '2': '#FFB300', 'b3': '#43A047',
                '3': '#00ACC1', '4': '#039BE5', 'b5': '#3949AB', '5': '#7E57C2',
                '#5': '#5E35B1', '6': '#D81B60', 'b7': '#8E24AA', '7': '#00897B'
            }
        },
        darkMode: {
            background: '#121212',
            strings: '#333333',
            frets: '#666666',
            markers: '#AAAAAA',
            intervals: {
                '1': '#BB86FC', 'b2': '#3700B3', '2': '#6200EE', 'b3': '#03DAC6',
                '3': '#018786', '4': '#CF6679', 'b5': '#B00020', '5': '#E6E6E6',
                '#5': '#BABABA', '6': '#8E8E8E', 'b7': '#626262', '7': '#363636'
            }
        }
        // removed themes 'monoBlue', 'monoGreen', 'grayscale', 'blackAndWhite', 'vintage', 'retro', 'mint', 'muted', 'iceCream', 'blueberry', 'sunrise', 'redWine', 'seaGreen', 'teal', 'amber', 'bubblegum', 'fireAndIce', 'watermelon', 'nordic', 'flamingo', 'sakura', 'steampunk', 'citrus', 'peacock', 'cotton', 'aquarium', 'blueprint', 'candlelight', 'nightSky', 'freshMint', 'daylight', 'velvet', 'mustard', 'terra', 'royalty', 'rustic', 'jade', 'summer', 'winter', 'orchid', 'orchard', 'white' -> moved to themes-data-extended.js
        // removed themes 'mahogany', 'walnut', 'oak', 'maple', 'rosewood', 'ebony', 'koa', 'padauk', 'purpleheart', 'bubinga', 'wenge', 'sapele', 'blackwood', 'pinewood', 'alder', 'ash', 'bamboo', 'cedar', 'redwood', 'butternut', 'ziricote', 'bocote', 'blacklimba', 'canary', 'beech', 'hickory', 'macassar', 'sitka', 'cocobolo', 'pecan', 'tamo', 'birch', 'ovangkol', 'redmaple', 'lacewood', 'cypress' -> moved to themes-data-wood.js
        // removed themes 'monoRed', 'beach', 'rainbow', 'desert', 'deepOcean', 'coral', 'goldAndBlack', 'purpleHaze', 'earthTones', 'cosmic', 'midnight', 'cyberpunk', 'aurora', 'vaporwave' -> moved to themes-data-exotic.js
    };