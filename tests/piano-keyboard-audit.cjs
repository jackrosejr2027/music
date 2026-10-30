const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Node {
    constructor(tag) { this.tag = tag; this.attributes = {}; this.children = []; this.clientWidth = 900; this.scrollLeft = 150; }
    setAttribute(name, value) { this.attributes[name] = value; }
    appendChild(child) { this.children.push(child); }
    replaceChildren() { this.children = []; }
}
function Fretboard() {}
const context = vm.createContext({ Fretboard, document: { createElementNS: (_, tag) => new Node(tag) } });
vm.runInContext(fs.readFileSync('instrument-presets.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('fretboard-draw.js', 'utf8'), context);
const piano = vm.runInContext('MULTI_INSTRUMENT_SETUPS[5]', context);
const board = new Fretboard();
board.container = new Node('div'); board.dimensions = {};
board.settings = { ...piano, visibleStrings: Array(24).fill(true) };
board.musicTheory = {}; board.currentKey = 'C'; board.currentPatternType = 'interval'; board.currentPattern = 'root';
board.activeNotes = ['C']; board.activePositions = [];
board.draw();
const keys = kind => board.svg.children.filter(node => node.attributes.class === kind);
assert.equal(keys('piano-white-key').length, 14); assert.equal(keys('piano-black-key').length, 10);
assert.equal(keys('piano-pattern-marker').length, 2);
assert.equal(board.dimensions.width, 452); assert.equal(board.container.scrollLeft, 0);
assert(board.svg.children.some(node => node.textContent === 'C4')); assert(board.svg.children.some(node => node.textContent === 'B5'));
const firstBlack = keys('piano-black-key')[0];
assert.equal(firstBlack.attributes['data-key'], 1); assert.equal(firstBlack.attributes.x, 36.5);
const white = keys('piano-white-key'); assert.equal(white[white.length - 1].attributes['data-key'], 23);
const keyNodes = board.svg.children.filter(node => ['piano-white-key', 'piano-black-key'].includes(node.attributes.class));
assert(keyNodes.slice(0, 14).every(node => node.attributes.class === 'piano-white-key'));
board.settings.visibleStrings[0] = false; board.draw(); assert.equal(keys('piano-pattern-marker').length, 1);
board.activeNotes = ['C#']; board.draw(); assert.equal(keys('piano-pattern-marker').length, 2);
board.settings.visibleStrings[0] = true;
board.activeNotes = []; board.activePositions = [{ string: 0, fret: 0 }]; board.draw(); assert.equal(keys('piano-pattern-marker').length, 1);
board.container.clientWidth = 390; board.draw(); assert.equal(keys('piano-white-key').length, 14);
for (const root of ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']) {
    board.currentKey = root; board.activeNotes = [root]; board.activePositions = [];
    board.container.scrollLeft = 150; board.draw();
    const displayed = board.getPianoDisplayKeys();
    assert.equal(displayed[0].note, root); assert.equal(displayed[0].label, root + '4');
    assert.equal(displayed.length, 24);
    assert.equal(keys('piano-white-key').length, 14); assert.equal(keys('piano-black-key').length, 10);
    assert.equal(keys('piano-pattern-marker').length, 2);
    if (root !== 'C') assert.equal(board.container.scrollLeft, 0);
    const allKeys = [...keys('piano-white-key'), ...keys('piano-black-key')];
    assert(allKeys.every(key => key.attributes.x >= 16 && key.attributes.x + key.attributes.width <= board.dimensions.width - 16));
    board.container.scrollLeft = 50; board.draw(); assert.equal(board.container.scrollLeft, 50);
}
console.log('PASS: all 12 starting keys, sharp-key boundaries, ascending octave labels, highlights, dynamic ranges and scroll reset on key changes.');
assert(fs.readFileSync('app-state.js', 'utf8').includes("instrument: getVal('instrument-select')"));
assert(fs.readFileSync('app-instrument-multi.js', 'utf8').includes('...setup, instrument, referenceLayout:'));
console.log('PASS: 24-key C4-B5 piano, 14 white/10 black keys, overlap order/positions, highlights, Show masks, Gamut open positions, mobile key count, scroll retention, diagram identity.');
