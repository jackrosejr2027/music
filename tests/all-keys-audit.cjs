/* Run from the project root: node tests/gauntlet-audit.cjs */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map();
const selectors = new Map();
class Element {
    constructor() { this.children = []; this.events = {}; this.value = ''; this.dataset = {}; this.classList = { toggle() {} }; }
    set id(value) { this._id = value; nodes.set(value, this); } get id() { return this._id; }
    set innerHTML(value) {
        this.html = value;
        for (const match of value.matchAll(/id="([^"]+)"/g)) if (!nodes.has(match[1])) { const element = new Element(); element.id = match[1]; }
    }
    appendChild(element) { this.children.push(element); return element; }
    insertBefore(element) { this.children.push(element); }
    replaceChildren(...elements) { this.children = elements; }
    addEventListener(name, callback) { this.events[name] = callback; }
    closest() { return new Element(); }
    get options() { return this.children; }
    querySelectorAll(tag) { return this.children.flatMap(child => [...(child.tagName === tag ? [child] : []), ...(child.querySelectorAll?.(tag) || [])]); }
    dispatchEvent(event) { this.events[event.type]?.({ target: this }); }
    before() {} after() {} remove() { this.removed = true; } setAttribute(key, value) { (this.attributes ||= {})[key] = value; }
}
for (const id of ['key-select', 'pattern-type', 'pattern-select', 'instrument-footer', 'fretboard', 'tuning-container', 'start-fret', 'end-fret', 'instrument-select', 'tuning-preset', 'string-count']) { const node = new Element(); node.id = id; }
nodes.get('instrument-footer').children = [new Element(), new Element()];
nodes.get('instrument-select').value = 'electric_guitar';
nodes.get('tuning-preset').value = 'standard';
nodes.get('start-fret').value = '3'; nodes.get('end-fret').value = '15';
nodes.get('key-select').value = 'C'; nodes.get('pattern-type').value = 'interval'; nodes.get('pattern-select').value = 'root';
const listenersRemoved = [];
function Board(id, musicTheory = {}) { this.musicTheory = musicTheory; this.container = nodes.get(id); this.settings = {}; this.activeNotes = ['C']; this.activePositions = []; this.queueResponsiveDraw = () => {}; this.resizeObserver = { disconnect: () => { this.disconnected = true; } }; }
Board.prototype.updateSettings = function(settings) { this.settings = { ...settings }; };
Board.prototype.updatePattern = function(key, type, pattern) { this.currentKey = key; this.currentPatternType = type; this.currentPattern = pattern; this.activeNotes = type === 'gamut' ? [] : [key, type + ':' + pattern]; this.activePositions = type === 'gamut' ? [{ string: 0, fret: 3 }] : []; };
function App() {}
const context = vm.createContext({ App, Fretboard: Board, Event: function(type) { this.type = type; }, Option: function(label, value) { this.textContent = label; this.label = label; this.value = String(value); }, document: { getElementById: id => nodes.get(id), createElement: tag => { const element = new Element(); element.tagName = tag; return element; }, querySelectorAll: selector => selectors.get(selector) || [] }, window: { removeEventListener: (...args) => listenersRemoved.push(args) }, clearTimeout() {}, console });
vm.runInContext(fs.readFileSync('app-instrument-multi.js', 'utf8'), context);
const app = new App();
app.musicTheory = {};
app.instrumentPresets = { acoustic_guitar: { tunings: { standard: ['E','A','D','G','B','E'] } }, electric_guitar: { tunings: { standard: ['E','A','D','G','B','E'] } } };
app.fretboard = new Board('fretboard');
app.settings = { tuning: ['E','A','D','G','B','E'], startFret: 3, endFret: 15, visibleStrings: [false,false,false,false,false,false], stringStartFrets: [8,8,8,8,8,8], stringEndFrets: [9,9,9,9,9,9], colorTheme: 'custom' };
app.updateTuningInputs = function(tuning) {
    this.inputTuning = [...tuning];
    for (const selector of ['.show-string-notes', '.string-start-fret', '.string-end-fret']) selectors.set(selector, tuning.map(() => ({ checked: false, value: '9' })));
};
app.updateTuningInputs(app.settings.tuning);
app.renderDiagramStringControls = () => {};
app.renderDiagramPatternControls = () => {};
app.updatePatternSelect = () => {};
app.updateFretboard = function() {
    this.settings = { ...this.settings, tuning: [...this.inputTuning], startFret: Number(nodes.get('start-fret').value), endFret: Number(nodes.get('end-fret').value), visibleStrings: selectors.get('.show-string-notes').map(input => input.checked), stringStartFrets: selectors.get('.string-start-fret').map(input => Number(input.value)), stringEndFrets: selectors.get('.string-end-fret').map(input => Number(input.value)) };
    this.fretboard.updateSettings(this.settings);
    this.fretboard.updatePattern(nodes.get('key-select').value, nodes.get('pattern-type').value, nodes.get('pattern-select').value);
    this.syncFretboardDiagrams();
};

vm.runInContext(fs.readFileSync('instrument-presets.js', 'utf8'), context);
nodes.get('pattern-select').selectedOptions = [{ textContent: 'Major' }];
app.setupMultipleFretboards();
nodes.get('key-select').value = 'Gb'; nodes.get('pattern-type').value = 'scale'; nodes.get('pattern-select').value = 'major'; app.updateFretboard();
const roots = ["C","G","D","A","E","B","F#","Gb","C#","Db","G#","Ab","D#","Eb","A#","Bb","F"];
const choose = value => { const input = nodes.get('diagram-count'); input.value = value; input.events.change({ target: input }); };
choose('all-keys');
assert.equal(app.diagramBoards.length, 17); assert.equal(app.activeDiagram, roots.indexOf('Gb'));
for (let i = 0; i < roots.length; i++) {
    assert.equal(app.diagramSetups[i].key, roots[i]);
    assert.equal(app.diagramSetups[i].patternType, 'scale'); assert.equal(app.diagramSetups[i].pattern, 'major');
    assert.equal(app.diagramBoards[i].currentKey, roots[i]);
    assert(app.diagramHeadings[i].textContent.includes(' - ' + roots[i] + ' - scale - Major'));
    assert.equal(app.diagramSetups[i].tuning.join(''), 'EADGBE');
}
app.selectFretboardDiagram(roots.indexOf('Db')); assert.equal(nodes.get('key-select').value, 'Db');
nodes.get('pattern-type').value = 'chord'; nodes.get('pattern-select').value = 'minor'; app.updateFretboard();
assert(app.diagramSetups.every(setup => setup.patternType === 'chord' && setup.pattern === 'minor'));
assert.deepEqual(Array.from(app.diagramSetups, setup => setup.key), roots);
assert(app.diagramBoards.every(board => board.currentPatternType === 'chord' && board.currentPattern === 'minor'));
nodes.get('pattern-select').value = 'major'; app.updateFretboard();
assert(app.diagramSetups.every(setup => setup.pattern === 'major'));
assert.deepEqual(Array.from(app.diagramSetups, setup => setup.key), roots);
nodes.get('pattern-select').value = 'minor'; app.updateFretboard();
choose('all-keys'); assert(app.diagramSetups.every(setup => setup.patternType === 'chord' && setup.pattern === 'minor'));
nodes.get('pattern-type').value = 'gamut'; nodes.get('pattern-select').value = '000001'; app.updateFretboard();
choose('all-keys');
assert(app.diagramSetups.every(setup => setup.gamutReferenceKey === 'Db' && setup.startFret === 0 && setup.endFret === 24));
app.diagramSetups[1].tuning[0] = 'F'; assert.equal(app.diagramSetups[2].tuning[0], 'E');
// Key and instrument edits stay local even while patterns are linked.
app.selectFretboardDiagram(0);
nodes.get('key-select').value = 'D'; app.updateFretboard();
assert.equal(app.diagramSetups[0].key, 'D'); assert.equal(app.diagramSetups[1].key, 'G');
assert.equal(app.diagramSetups[1].tuning[0], 'F');
nodes.get('key-select').value = 'C'; app.updateFretboard();
vm.runInContext(fs.readFileSync('fretboard-draw.js', 'utf8'), context);
for (const mode of ['gauntlet', 'multi-instrument', '2']) {
    choose(mode);
    const untouched = JSON.stringify(app.diagramSetups[1]);
    nodes.get('pattern-type').value = 'interval'; nodes.get('pattern-select').value = '3'; app.updateFretboard();
    assert.equal(JSON.stringify(app.diagramSetups[1]), untouched, 'Pattern linking must not affect ' + mode);
    choose('all-keys');
    app.selectFretboardDiagram(0);
    nodes.get('pattern-type').value = 'scale'; nodes.get('pattern-select').value = 'major'; app.updateFretboard();
    assert(app.diagramSetups.every(setup => setup.patternType === 'scale' && setup.pattern === 'major'));
    assert.deepEqual(Array.from(app.diagramSetups, setup => setup.key), roots);
}
choose('1'); assert.equal(app.diagramBoards.length, 1);
const real = vm.createContext({ window: {}, localStorage: { getItem: () => null }, document: { getElementById: () => null }, console });
for (const path of ['music-theory-data.js','scales-data-standard.js','music-theory.js','fretboard.js']) vm.runInContext(fs.readFileSync('' + path, 'utf8'), real);
const mt = vm.runInContext('new MusicTheory()', real);
const ActualBoard = vm.runInContext('Fretboard', real);
const board = Object.create(ActualBoard.prototype); board.musicTheory = mt;
board.settings = { gamutReferenceKey: 'C' };
board.updatePattern('F#', 'gamut', '000001'); const sharp = JSON.stringify(board.activePositions);
board.updatePattern('Gb', 'gamut', '000001'); assert.equal(JSON.stringify(board.activePositions), sharp);
assert(board.activePositions.every(position => position.fret >= 0 && position.fret <= 24));
assert.equal(mt.gamuts['000001'].positions[0].fret, 5);
assert.equal(mt.getScaleNotes('Gb', 'major').join(' '), 'Gb Ab Bb Cb Db Eb F');
assert.equal(mt.getScaleNotes('F#', 'major').join(' '), 'F# G# A# B C# D# E#');
assert.equal(board.getProperNoteSpelling('B', 'Gb', 'scale', 'major'), 'Cb');
assert.equal(board.getProperNoteSpelling('F', 'F#', 'scale', 'major'), 'E#');
for (const type of ['scale','chord','interval']) {
    const id = type === 'interval' ? '1' : 'major';
    board.updatePattern('F#', type, id); const a = board.activeNotes.map(note => mt.toSharp(note));
    board.updatePattern('Gb', type, id); assert.equal(board.activeNotes.map(note => mt.toSharp(note)).join(), a.join());
}
const mainKeys = fs.readFileSync('app-ui-bottom-controls.js', 'utf8');
for (const key of roots) assert(mainKeys.includes('value="' + key + '"'));
console.log('PASS: 17 All Keys diagrams, separate sharp/flat names, pattern/instrument inheritance, editor restore, All Keys-only linked type/selection, preserved keys/instruments, other-mode independence, regeneration/cleanup, real enharmonic scale/chord/interval pitches and spellings, Gamut transposition.');
