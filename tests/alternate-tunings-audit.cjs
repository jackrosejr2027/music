const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
function App() {}
const count = {};
const context = vm.createContext({ App, document: { getElementById: id => id === 'string-count' ? count : null } });
vm.runInContext(fs.readFileSync('instrument-presets.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('app-instrument-tuning.js', 'utf8'), context);
const setups = vm.runInContext('MULTI_INSTRUMENT_SETUPS', context);
const presets = vm.runInContext('INSTRUMENT_PRESETS', context);
assert.equal(setups.length, 25);
assert.equal(setups[5].instrument, 'piano'); assert.equal(setups[5].tuning.length, 24);
assert.equal(setups[14].instrument, 'koto');
const pitches = ['D2 A2 D3 G3 B3 E4','D2 G2 D3 G3 B3 D4','D2 A2 D3 G3 A3 D4','D2 G2 C3 F3 A3 D4','Eb2 Ab2 Db3 Gb3 Bb3 Eb4','D2 A2 D3 G3 B3 E4','D1 G1 C2 F2','D1 A1 D2 G2','B0 E1 A1 D2','A1 D2 G2 C3'];
const app = new App(); app.instrumentPresets = presets; app.activeDiagram = 1;
app.diagramSetups = [{ tuning: ['E'], key: 'D' }, { key: 'F#', patternType: 'interval', pattern: 'root', startFret: 2 }];
app.updateTuningInputs = tuning => { app.inputs = [...tuning]; };
let updates = 0; app.updateFretboard = () => updates++;
for (let i = 0; i < pitches.length; i++) {
    const setup = setups[15 + i];
    assert.equal(setup.pitchLabels.join(' '), pitches[i]);
    assert.equal(presets[setup.instrument].tunings[setup.preset].join(','), setup.tuning.join(','));
    app.applyTuningPreset(setup.instrument, setup.preset);
    assert.equal(app.inputs.join(','), setup.tuning.join(','));
    assert.equal(count.value, setup.tuning.length);
    assert.equal(app.diagramSetups[1].setupNote, setup.setupNote);
    assert.equal(app.diagramSetups[1].key, 'F#'); assert.equal(app.diagramSetups[1].pattern, 'root');
    assert.equal(app.diagramSetups[0].tuning.join(''), 'E');
    assert.notEqual(app.diagramSetups[1].tuning, setup.tuning);
}
assert.equal(updates, 10);
assert.equal(setups[19].tuning.join(' '), 'D# G# C# F# A# D#');
const original = vm.createContext({}); vm.runInContext(fs.readFileSync('instrument-presets.js', 'utf8'), original);
assert.equal(vm.runInContext('MULTI_INSTRUMENT_SETUPS.length', original), 25);
assert(fs.readFileSync('app-instrument-multi.js', 'utf8').includes("MULTI_INSTRUMENT_SETUPS.length + ' diagrams)"));
console.log('PASS: 25-diagram preset; 10 named alternate guitar/bass tunings, octave/flat spellings, selector metadata/count restoration, independent key/pattern state, non-aliased arrays.');
