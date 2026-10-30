const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app-export-package.js', 'utf8');
const standalone = fs.readFileSync('fretboard-standalone.html', 'utf8');
const main = fs.readFileSync('fretboard.html', 'utf8');
const offline = fs.readFileSync('offline-assets.js', 'utf8');

assert(source.includes("['interval','Intervals'],['chord','Chords'],['scale','Scales']"));
assert(source.includes("const KEYS = ['C','G','D','A','E','B','F#','Gb','C#','Db','G#','Ab','D#','Eb','A#','Bb','F']"));
assert(source.includes('fret<=24;fret++'));
assert(source.includes('startBounds],[\'End\',endBounds]'));
assert(source.includes('Fit as many as fit'));
assert(source.includes("['portrait','Portrait']"));
assert(source.includes("['pdf-docx','PDF + DOCX']"));
assert(source.includes("['pdf-images','PDF + JPG + PNG']"));
assert(source.includes('includeInfo:false'));
assert(source.includes("'fret'+setup.startFret+'-'+setup.endFret,'strings'+setup.tuning.length"));
assert(source.includes("Downloaded '+type+' batch for '+key"));
assert(source.includes('w:hyperlink w:anchor='));
assert(source.includes("['L','All scales - current setup - PDF + DOCX / linked contents'"));
for (const letter of 'ABCDEFGHIJKL') assert(source.includes("['" + letter + "',"), 'Missing preset ' + letter);
for (const file of [standalone, main]) {
    assert(file.includes('app-export-package.js'));
    assert(file.includes('app-export-package.css'));
}
assert(offline.includes('"app-export-package.js"'));
assert(offline.includes('"app-export-package.css"'));
console.log('PASS: package UI includes key/category checks, 50 start/end boundaries, offline PDF/DOCX/JPG/PNG controls, label-free rendering, sequential A-L presets, linked Word contents, and both explorer entry points.');
