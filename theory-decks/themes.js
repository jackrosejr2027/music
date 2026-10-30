(function (TD) {
'use strict';
// [name, bg1, bg2, text, face, ink, frameSat, frameLight, backSat, backLight]
const THEMES = [
  ['Felt Table', '#1f3a2c', '#0e1d16', '#f3eee2', '#fbf6ea', '#2a2620', 55, 48, 45, 22],
  ['Dark Mode', '#1b1b1f', '#0c0c0e', '#e8e8ea', '#26262b', '#ececf0', 45, 50, 30, 18],
  ['Light Mode', '#f4f4f6', '#e3e3e8', '#1d1d22', '#ffffff', '#1d1d22', 55, 50, 45, 30],
  ['Midnight', '#12183a', '#05081a', '#dfe4ff', '#f1f3ff', '#151a33', 60, 52, 50, 22],
  ['OLED Black', '#000000', '#000000', '#e6e6e6', '#0d0d0d', '#f0f0f0', 60, 50, 35, 12],
  ['Sepia', '#e9dcc3', '#cdb994', '#3b2d1a', '#f8f0de', '#3b2d1a', 40, 40, 35, 28],
  ['Parchment', '#efe6cf', '#d9caa3', '#3a2f1e', '#fffaf0', '#2f2618', 35, 38, 30, 30],
  ['Nord', '#3b4252', '#2e3440', '#eceff4', '#eceff4', '#2e3440', 35, 55, 25, 28],
  ['Dracula', '#343746', '#21222c', '#f8f8f2', '#44475a', '#f8f8f2', 70, 65, 40, 20],
  ['Solarized Dark', '#073642', '#002b36', '#eee8d5', '#fdf6e3', '#073642', 55, 45, 45, 20],
  ['Solarized Light', '#fdf6e3', '#eee8d5', '#586e75', '#ffffff', '#073642', 55, 45, 40, 30],
  ['Gruvbox', '#3c3836', '#282828', '#ebdbb2', '#fbf1c7', '#3c3836', 50, 45, 35, 22],
  ['Monokai', '#3e3d32', '#272822', '#f8f8f2', '#f8f8f2', '#272822', 70, 50, 35, 20],
  ['Ocean', '#0f3d57', '#06202f', '#dff4ff', '#eaf8ff', '#0b2a3c', 60, 45, 55, 24],
  ['Forest', '#26402a', '#101d12', '#e5f0e0', '#f2f7ec', '#1c2a1d', 45, 40, 40, 20],
  ['Sunset', '#6b2d4a', '#2a0f1f', '#ffe8d9', '#fff1e6', '#3a1424', 65, 55, 50, 26],
  ['Desert', '#c99a63', '#8a5d34', '#2b1b0d', '#fbefdc', '#3a2512', 50, 42, 40, 26],
  ['Rose', '#f7dfe5', '#e7bcc8', '#4a1f2b', '#fff6f8', '#4a1f2b', 55, 55, 40, 32],
  ['Lavender', '#e6e0f5', '#c9bde8', '#2d2445', '#fbf9ff', '#2d2445', 50, 55, 35, 30],
  ['Mint', '#dff5ea', '#b6e6cf', '#163a2a', '#f7fffb', '#163a2a', 50, 42, 40, 26],
  ['Coffee', '#3e2c22', '#1e140f', '#f1e3d3', '#f5e9da', '#2e1f16', 40, 40, 35, 20],
  ['Espresso', '#241812', '#0f0905', '#e9d8c4', '#2e2019', '#f1e1cb', 40, 45, 30, 14],
  ['Cherry Wood', '#5a1f17', '#2a0c08', '#f8e1d0', '#fbeee2', '#3a120c', 60, 40, 50, 22],
  ['Maple', '#d9b98a', '#b38b56', '#2c1d0c', '#fff7e8', '#2c1d0c', 55, 42, 40, 28],
  ['Rosewood', '#3d1d1d', '#1c0b0b', '#f0d9d0', '#f7ebe4', '#2a1414', 45, 38, 40, 18],
  ['Ebony', '#1a1714', '#0a0807', '#e8e0d4', '#1f1b17', '#efe6d8', 30, 50, 20, 14],
  ['Tobacco Burst', '#7a3f12', '#1f0d03', '#ffe9c9', '#fff3df', '#3a1d08', 70, 45, 55, 20],
  ['Cherry Sunburst', '#8a1c1c', '#2b0505', '#ffe2d6', '#fff2ea', '#3b0b0b', 70, 45, 55, 22],
  ['Seafoam', '#9fd8c8', '#5fa595', '#0f2e27', '#f3fffb', '#0f2e27', 45, 40, 40, 24],
  ['Fiesta Red', '#c8372d', '#5e130e', '#fff0ea', '#fff6f1', '#4a120d', 70, 45, 55, 24],
  ['Neon', '#0d0221', '#000000', '#f0e6ff', '#14062e', '#f5eaff', 100, 60, 70, 14],
  ['Synthwave', '#2b0f4c', '#0e0420', '#ffd6f5', '#1e0b38', '#ffe6fb', 90, 62, 60, 18],
  ['Cyberpunk', '#1a1a00', '#000000', '#f9f871', '#111111', '#f9f871', 100, 55, 70, 14],
  ['Matrix', '#001a07', '#000000', '#a6ffb8', '#020f05', '#b6ffc6', 80, 45, 70, 10],
  ['Terminal Amber', '#1a1000', '#000000', '#ffcc66', '#0f0a00', '#ffcc66', 90, 50, 60, 10],
  ['Blueprint', '#1d4e89', '#0e2a52', '#e6f0ff', '#1f5596', '#ffffff', 40, 80, 50, 25],
  ['Chalkboard', '#2e3b33', '#1b241f', '#f0f0e8', '#33423a', '#f5f5ee', 15, 80, 15, 22],
  ['Newspaper', '#ecebe7', '#d7d5cf', '#1a1a1a', '#fbfaf7', '#111111', 0, 25, 0, 22],
  ['Monochrome', '#2a2a2a', '#111111', '#eeeeee', '#f5f5f5', '#111111', 0, 35, 0, 18],
  ['High Contrast', '#000000', '#000000', '#ffffff', '#ffffff', '#000000', 100, 45, 100, 20],
  ['Ice', '#e8f4fb', '#c3dff0', '#0e2a3a', '#ffffff', '#0e2a3a', 60, 55, 50, 30],
  ['Arctic Night', '#0d2633', '#04121a', '#d8f1ff', '#e9f7ff', '#062030', 60, 60, 50, 20],
  ['Autumn', '#6b3a1c', '#2d160a', '#ffe5c7', '#fff3e2', '#3a1d0c', 65, 42, 50, 22],
  ['Spring', '#e9f7d9', '#c7e8a8', '#23381a', '#fffff6', '#23381a', 55, 48, 45, 28],
  ['Flamenco', '#7a0e1a', '#250306', '#ffe1c4', '#fff4e6', '#2a0508', 75, 45, 60, 20],
  ['Andalucía', '#f4e3c1', '#d9b77a', '#3d220c', '#fffaf0', '#3d220c', 70, 42, 55, 26],
  ['Jazz Club', '#1d1530', '#0b0715', '#f3d9a6', '#231a38', '#f6e3b8', 55, 58, 45, 16],
  ['Blues Bar', '#0e1f4a', '#050c22', '#cfe0ff', '#f2f6ff', '#0c1a3e', 70, 48, 60, 22],
  ['Stage Lights', '#2a0a3a', '#0a0010', '#fff3c4', '#fffbea', '#2a0a3a', 85, 55, 65, 22],
  ['Vintage Tweed', '#c8b48a', '#8e7a52', '#2b2214', '#f7efda', '#2b2214', 40, 38, 35, 24],
];

function applyTheme(i) {
  const [, bg1, bg2, text, face, ink] = THEMES[i] || THEMES[0];
  const grayscale = value => {
    const match = String(value).match(/^#([0-9a-f]{6})$/i);
    if (!match) return value;
    const color = match[1];
    const level = Math.round(parseInt(color.slice(0, 2), 16) * .2126 + parseInt(color.slice(2, 4), 16) * .7152 + parseInt(color.slice(4, 6), 16) * .0722);
    return '#' + level.toString(16).padStart(2, '0').repeat(3);
  };
  const colors = Object.fromEntries(Object.entries({ bg1, bg2, text, face, ink }).map(([key, value]) => [key, grayscale(value)]));
  const s = document.documentElement.style;
  Object.entries(colors).forEach(([key, value]) => s.setProperty('--' + key, value));
  s.setProperty('--fs', '0%'); s.setProperty('--bs', '0%'); s.setProperty('--h', '0');
  // The browser's toolbar (and the installed app's title bar) follows the neutral theme.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', colors.bg1);
}
TD['themes.js'] = { THEMES, applyTheme };
})(window.TD = window.TD || {});
