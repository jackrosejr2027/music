(function (TD) {
'use strict';
// 20 card styles: corner motif (24x24 SVG) + frame type
const S = 'fill="none" stroke="currentColor"';
const HOLE = 'style="fill:var(--face)"';
const STYLES = [
  ['Diamond', 'solid', '<path d="M12 2 20 12 12 22 4 12z"/>'],
  ['Pick', 'double', '<path d="M12 22C6 15 3 10 4 6c1-3 5-4 8-4s7 1 8 4c1 4-2 9-8 16z"/>'],
  ['Eighth Note', 'inset', '<ellipse cx="9" cy="18" rx="4" ry="3" transform="rotate(-20 9 18)"/><path d="M12.3 17V3H14c0 3 5 4 5 8-1-2-3-3-5-3v9z"/>'],
  ['Sound Hole', 'thin', '<circle cx="12" cy="12" r="9" ' + S + ' stroke-width="2"/><circle cx="12" cy="12" r="5"/>'],
  ['Fret Dots', 'bars', '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><rect x="11" y="2" width="2" height="20"/>'],
  ['Star', 'dashed', '<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3l-6.2 3.6 1.6-7L2 9.2l7.1-.6z"/>'],
  ['Sunburst', 'solid', '<circle cx="12" cy="12" r="5"/><path ' + S + ' stroke-width="2" stroke-linecap="round" d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'],
  ['Art Deco', 'double', '<path d="M2 22A20 20 0 0 1 22 2v20z" opacity=".25"/><path ' + S + ' stroke-width="1.5" d="M2 22A20 20 0 0 1 22 2M22 22H2M22 22 5 12M22 22 12 5M22 22V2"/>'],
  ['Bracket', 'inset', '<path ' + S + ' stroke-width="2.5" d="M3 21V3h18"/><path ' + S + ' stroke-width="1.5" d="M8 16V8h8"/>'],
  ['Vibrato', 'thin', '<path ' + S + ' stroke-width="2.4" stroke-linecap="round" d="M1 12c2.5-5 5-5 5.5 0s3 5 5.5 0 3-5 5.5 0 3 5 5.5 0"/>'],
  ['Staff', 'bars', '<path ' + S + ' stroke-width="1.3" d="M1 6h22M1 9.5h22M1 13h22M1 16.5h22M1 20h22"/><ellipse cx="13" cy="13" rx="3.2" ry="2.4"/>'],
  ['Tuning Peg', 'solid', '<circle cx="8" cy="12" r="6"/><rect x="13" y="10.5" width="9" height="3" rx="1.5"/><circle cx="8" cy="12" r="2" ' + HOLE + '/>'],
  ['Flamenco Rose', 'double', '<circle cx="12" cy="6" r="4"/><circle cx="18" cy="12" r="4"/><circle cx="12" cy="18" r="4"/><circle cx="6" cy="12" r="4"/><circle cx="12" cy="12" r="3" ' + HOLE + '/>'],
  ['Triangle', 'dashed', '<path ' + S + ' stroke-width="2.2" d="M12 3 22 21H2z"/><path d="M12 10l4 7H8z"/>'],
  ['Hexagon', 'inset', '<path ' + S + ' stroke-width="2" d="M12 2l8.7 5v10L12 22l-8.7-5V7z"/><circle cx="12" cy="12" r="3"/>'],
  ['Rings', 'thin', '<circle cx="12" cy="12" r="10" ' + S + ' stroke-width="1.5"/><circle cx="12" cy="12" r="6" ' + S + ' stroke-width="1.5"/><circle cx="12" cy="12" r="2"/>'],
  ['Leaf', 'solid', '<path d="M3 21C3 10 10 3 21 3c0 11-7 18-18 18z"/><path d="M4 20 16 8" style="stroke:var(--face)" stroke-width="1.5"/>'],
  ['Pixel', 'bars', '<path d="M4 4h4v4H4zM12 4h4v4h-4zM8 8h4v4H8zM16 8h4v4h-4zM4 12h4v4H4zM12 12h4v4h-4zM8 16h4v4H8zM16 16h4v4h-4z"/>'],
  ['Lightning', 'dashed', '<path d="M14 1 4 14h7l-2 9 11-14h-7z"/>'],
  ['Fretboard', 'double', '<path ' + S + ' stroke-width="1.4" d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/><circle cx="12" cy="12" r="2.2"/>'],
];

// An unknown index falls back to the first style instead of throwing
const motifSvg = (i) => '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + (STYLES[i] || STYLES[0])[2] + '</svg>';
TD['cardstyles.js'] = { STYLES, motifSvg };
})(window.TD = window.TD || {});
