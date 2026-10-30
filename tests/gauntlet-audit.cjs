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
app.setupMultipleFretboards();
assert(nodes.get('instrument-footer').children.some(element => element.html?.includes('length: 20') || element.html?.includes('<option value="20">20</option>')));
assert(nodes.get('instrument-footer').children.some(element => element.html?.includes('value="gauntlet"')));
const choose = value => { const input = nodes.get('diagram-count'); input.value = String(value); input.events.change({ target: input }); };
choose('gauntlet');
const expected = ['EA','AD','DG','GB','BE','EA','AD','DG','GB','BE','EAD','ADG','DGB','GBE','EADG','ADGB','DGBE','EADGBE','EADGBE','EADGBE'];
assert.equal(app.diagramBoards.length, 20); assert.equal(app.diagramSetups.length, 20);
assert.equal(app.activeDiagram, 0); assert.equal(nodes.get('diagram-count').value, 'gauntlet');
for (let index = 0; index < 20; index++) {
    const setup = app.diagramSetups[index];
    assert.equal(setup.tuning.join(''), expected[index], 'Tuning/order for diagram ' + (index + 1));
    assert.equal(setup.tuning.length, expected[index].length);
    assert.equal(setup.instrument, 'acoustic_guitar');
    assert.equal(setup.startFret, 3); assert.equal(setup.endFret, 15);
    assert(setup.stringStartFrets.every(value => value === 0)); assert(setup.stringEndFrets.every(value => value === 24));
    const shown = setup.tuning.filter((_, string) => setup.visibleStrings[string]).join('');
    assert.equal(shown, index < 5 ? ['E','A','D','G','B'][index] : index < 17 ? expected[index] : ['EDE','AGE','DBE'][index - 17]);
    if (index < 5) assert.deepEqual([...setup.visibleStrings], [true, false], 'Higher context string must remain drawn without notes');
    if (index >= 17) assert.deepEqual([...setup.visibleStrings].flatMap((visible, string) => visible ? [6 - string] : []), [[6,4,1],[5,3,1],[4,2,1]][index - 17]);
    assert.equal(app.diagramBoards[index].settings.tuning.join(''), expected[index]);
    assert.equal(app.diagramBoards[index].settings.colorTheme, 'custom');
}
app.selectFretboardDiagram(4);
assert.equal(nodes.get('string-count').value, 2);
assert.deepEqual(Array.from(selectors.get('.show-string-notes'), input => input.checked), [true, false]);
app.selectFretboardDiagram(18);
assert.equal(nodes.get('string-count').value, 6);
assert.deepEqual(Array.from(selectors.get('.show-string-notes'), input => input.checked), [false,true,false,true,false,true]);
app.inputTuning[0] = 'F'; app.updateFretboard();
app.selectFretboardDiagram(0); assert.equal(app.diagramSetups[18].tuning[0], 'F'); assert.equal(app.diagramSetups[17].tuning[0], 'E');
app.selectFretboardDiagram(19);
choose(2); assert.equal(app.activeDiagram, 0); assert.equal(app.diagramBoards.length, 2); assert.equal(app.diagramSetups.length, 2); assert.equal(listenersRemoved.length, 18);
choose(20); assert.equal(app.diagramBoards.length, 20); assert.equal(app.diagramSetups[19].tuning.join(''), 'EA');
choose('gauntlet'); assert.equal(app.diagramSetups[19].tuning.join(''), 'EADGBE');
app.diagramSetups[19].visibleStrings[0] = true;
assert.equal(app.diagramSetups[18].visibleStrings[0], false, 'Per-diagram arrays must not alias');
choose(1); assert.equal(app.diagramBoards.length, 1); assert(nodes.get('diagram-editor-group').hidden);
for (const count of Array.from({ length: 20 }, (_, index) => index + 1)) { choose(count); assert.equal(app.diagramBoards.length, count); }
choose('gauntlet');
app.selectFretboardDiagram(1);
nodes.get('key-select').value = 'G'; nodes.get('pattern-type').value = 'chord'; nodes.get('pattern-select').value = 'major'; app.updateFretboard();
app.selectFretboardDiagram(2);
nodes.get('key-select').value = 'D'; nodes.get('pattern-type').value = 'gamut'; nodes.get('pattern-select').value = 'study'; app.updateFretboard();
app.selectFretboardDiagram(0);
assert.equal(nodes.get('key-select').value, 'C'); assert.equal(nodes.get('pattern-type').value, 'interval'); assert.equal(nodes.get('pattern-select').value, 'root');
assert.equal(app.diagramBoards[1].currentKey, 'G'); assert.equal(app.diagramBoards[1].currentPatternType, 'chord');
assert.equal(app.diagramBoards[2].currentKey, 'D'); assert.equal(app.diagramBoards[2].currentPatternType, 'gamut'); assert.equal(app.diagramBoards[2].activePositions.length, 1);
app.selectFretboardDiagram(1); assert.equal(nodes.get('key-select').value, 'G'); assert.equal(nodes.get('pattern-select').value, 'major');
choose(3); choose(4); assert.equal(app.diagramSetups[3].key, 'G'); assert.equal(app.diagramSetups[3].patternType, 'chord');
app.selectFretboardDiagram(2); assert.equal(nodes.get('pattern-type').value, 'gamut'); assert.equal(nodes.get('pattern-select').value, 'study');
// Exercise the real per-board selector rendering and change handlers.
vm.runInContext(fs.readFileSync('app-ui.js', 'utf8'), context);
delete app.updatePatternSelect; delete app.renderDiagramPatternControls;
app.musicTheory.intervals = { root: { name: 'Root', semitones: 0 } };
app.musicTheory.chords = { major: { name: 'Major' } };
app.musicTheory.gamuts = { study: { name: 'Study' } };
nodes.get('key-select').children = [{ textContent: 'C', value: 'C' }, { textContent: 'G', value: 'G' }, { textContent: 'D', value: 'D' }];
nodes.get('pattern-type').children = ['interval','chord','gamut'].map(value => ({ textContent: value, value }));
for (const id of ['key-select','pattern-type','pattern-select']) nodes.get(id).events.change = () => { if (id === 'pattern-type') app.updatePatternSelect(); app.updateFretboard(); };
app.renderDiagramPatternControls();
assert.equal(app.diagramPatternControls.length, 4);
const inputs = app.diagramPatternControls[0].querySelectorAll('select');
assert.equal(inputs[0].value, 'C'); assert.equal(inputs[1].value, 'interval'); assert.equal(inputs[2].value, 'root');
inputs[0].value = 'D'; inputs[0].events.change();
assert.equal(app.activeDiagram, 0); assert.equal(app.diagramSetups[0].key, 'D'); assert.equal(app.diagramSetups[1].key, 'G');
inputs[1].value = 'chord'; inputs[1].events.change();
assert(inputs[2].children.some(option => option.value === 'major'));
inputs[2].value = 'major'; inputs[2].events.change();
assert.equal(app.diagramBoards[0].currentPatternType, 'chord'); assert.equal(app.diagramBoards[0].currentPattern, 'major');
assert.equal(app.diagramBoards[2].currentPatternType, 'gamut');
console.log('PASS: real diagram selector rendering/change handlers; independent key/type/selection, Gamut positions, editor restore and new-board inheritance.');
console.log('PASS: numeric 1-20 retained; all 20 Gauntlet tunings/order/counts/masks; six-string standard special diagrams; current range/shared appearance retained; edit/switch persistence; independent arrays; shrink/grow cleanup; preset reapplication.');

// Full Multi-Instrument dataset, integration, titles and open-pitch layouts.
app.instrumentPresets = vm.runInContext('INSTRUMENT_PRESETS', context);
vm.runInContext(fs.readFileSync('fretboard-draw.js', 'utf8'), context);
choose('multi-instrument');
const instruments = ['acoustic_guitar','electric_guitar','four_string_bass','ukulele_soprano','violin','piano','mandolin','five_string_banjo','cello','viola','double_bass','harp','sitar','oud','koto'];
const counts = [6,6,4,4,4,24,8,5,4,4,4,47,7,11,13];
assert.equal(app.diagramBoards.length, 25);
for (let index = 0; index < 15; index++) {
    const setup = app.diagramSetups[index];
    assert.equal(setup.instrument, instruments[index]); assert.equal(setup.tuning.length, counts[index]);
    assert.equal(setup.visibleStrings.length, counts[index]);
    assert.equal(setup.pitchLabels.length, counts[index]);
    assert.equal(setup.originalTuning.join(','), setup.tuning.join(','));
    assert(app.diagramHeadings[index].textContent.includes(app.instrumentPresets[setup.instrument].name));
    assert(app.diagramHeadings[index].textContent.includes(counts[index] + (index === 5 ? ' keys' : ' strings')));
}
assert.equal(app.diagramSetups[5].pitchLabels[0], 'C4'); assert.equal(app.diagramSetups[5].pitchLabels[23], 'B5');
assert.equal(app.diagramSetups[11].pitchLabels[0], 'Cb1'); assert.equal(app.diagramSetups[11].pitchLabels[46], 'Gb7');
assert.equal(app.diagramSetups[11].tuning[0], 'B');
assert.equal(app.diagramSetups[6].tuning.join(''), 'GGDDAAEE');
assert.equal(app.diagramSetups[7].pitchLabels.join(' '), 'G4 D3 G3 B3 D4');
assert.equal(app.diagramSetups[13].pitchLabels.join(' '), 'C2 F2 F2 A2 A2 D3 D3 G3 G3 C4 C4');
app.selectFretboardDiagram(5); assert.equal(nodes.get('string-count').value, 24); assert.equal(nodes.get('string-count').max, 24);
app.selectFretboardDiagram(11); assert.equal(nodes.get('string-count').value, 47);
app.selectFretboardDiagram(14); assert.equal(nodes.get('string-count').value, 13);
assert.equal(app.diagramBoards[0].settings.referenceLayout, false, 'Reference layout must not leak onto fretted boards');
const reference = JSON.parse(JSON.stringify(app.diagramSetups[5]));
context.document.createElementNS = (_, tag) => { const element = new Element(); element.tagName = tag; return element; };
const pianoBoard = app.diagramBoards[5];
pianoBoard.settings = reference; pianoBoard.dimensions = {}; pianoBoard.container.clientWidth = 900;
pianoBoard.activeNotes = ['C']; pianoBoard.activePositions = [];
pianoBoard.getThemeColors = () => ({ background: '#ffffff', frets: '#333333', markers: '#111111' });
pianoBoard.getContrastColor = () => '#ffffff';
pianoBoard.draw();
assert.equal(pianoBoard.svg.children.filter(child => child.attributes.class === 'piano-white-key').length,14);
assert.equal(pianoBoard.svg.children.filter(child => child.attributes.class === 'piano-black-key').length,10);
assert.equal(pianoBoard.svg.children.filter(child => child.attributes.class === 'piano-pattern-marker').length,2);
pianoBoard.settings = JSON.parse(JSON.stringify(app.diagramSetups[11])); pianoBoard.activeNotes = ['B']; pianoBoard.draw();
assert.equal(pianoBoard.svg.children.filter(child => child.tagName === 'rect').length, 48);
assert(pianoBoard.svg.children.some(child => child.textContent === 'Cb1'));
assert.equal(pianoBoard.svg.children.filter(child => child.tagName === 'rect' && child.attributes.fill === '#111111').length, 7);
choose('gauntlet');
assert(app.diagramHeadings[0].textContent.includes('2 strings - E-A - Notes on strings 2'));
assert(app.diagramHeadings[17].textContent.includes('Notes on strings 6, 4, 1'));
choose('multi-instrument'); app.selectFretboardDiagram(11); choose(1); assert.equal(app.diagramBoards.length, 1); assert.equal(nodes.get('string-count').max, 20);
choose(20); assert.equal(app.diagramBoards.length, 20);
console.log('PASS: 25 Multi-Instrument diagrams, first-15 order/counts/pitches, physical pairs, re-entrant banjo/ukulele, 24-key piano/47-string harp pitch maps, highlights, metadata restore, mode titles, layout isolation and preset/count switching.');
