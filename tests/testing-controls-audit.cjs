const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('fretboard.html', 'utf8');
assert(!html.includes('INSTRUMENT / 01'));
assert(!html.includes('Choose a key and pattern'));
assert(!html.includes('class="fretboard-stage-heading"'));
assert(html.includes('<h1 class="sr-only">'));
assert(html.indexOf('id="fretboard"') < html.indexOf('id="current-pattern-display"'));
const fixture = fs.readFileSync('tests/all-keys-audit.cjs', 'utf8');
let prefix = fixture.slice(0, fixture.indexOf("vm.runInContext(fs.readFileSync('instrument-presets.js'"));
prefix = prefix.replace('before() {} after() {}', 'before() {} after(...elements) { elements.forEach(element => { element.placedAfter = this; }); }');
prefix = prefix.replace('app.renderDiagramPatternControls = () => {};', '');
prefix += "\nvm.runInContext(fs.readFileSync('instrument-presets.js', 'utf8'), context);\nnodes.get('pattern-select').selectedOptions = [{textContent:'Root'}];\napp.setupMultipleFretboards(); app.updateFretboard();";
const layout = vm.createContext({ require, console });
vm.runInContext(prefix + 
    '\nassert.equal(app.diagramPatternControls[0].placedAfter, app.diagramBoards[0].container);' +
    '\nassert.equal(app.diagramPatternControls[0].hidden, false);' +
    '\nconst countInput = nodes.get("diagram-count"); countInput.value = "all-keys"; countInput.events.change({ target: countInput });' +
    '\napp.diagramBoards.forEach((board, i) => { assert.equal(app.diagramPatternControls[i].placedAfter, board.container); assert.equal(app.diagramPatternControls[i].hidden, false); assert.equal(app.diagramPatternControls[i].querySelectorAll("select").length, 3); });', layout);
let init, prompts = 0, choice = true, observed = [];
class App {}
class Fretboard {}
const Exporter = {
    exportInner: async () => { observed.push(Exporter.includeTitles); },
    exportOuter: async () => { await Exporter.exportInner(); observed.push(Exporter.includeTitles); },
    exportFailure: async () => { throw new Error('test error'); },
    exportSomethingMidi: async () => 'midi'
};
App.prototype.exportCurrentDiagram = async () => Exporter.exportOuter();
const context = vm.createContext({ App, Fretboard, Exporter, window: {}, console,
    document: { addEventListener: (name, fn) => { init = fn; } },
    confirm: () => { prompts++; return choice; }
});
vm.runInContext(fs.readFileSync('app-init.js','utf8'), context);
init();
(async () => {
    await new App().exportCurrentDiagram();
    assert.equal(prompts, 1); assert.deepEqual(observed, [true, true]);
    assert.equal(Exporter.includeTitles, undefined);
    choice = false; observed = [];
    await Exporter.exportOuter();
    assert.equal(prompts, 2); assert.deepEqual(observed, [false, false]);
    await assert.rejects(() => Exporter.exportFailure(), /test error/);
    assert.equal(Exporter.includeTitles, undefined);
    const before = prompts; await Exporter.exportSomethingMidi(); assert.equal(prompts, before);
    console.log('PASS: removed stage copy, under-diagram controls for single/17 boards, one title prompt across nested exports, include/omit branches, cleanup on failure, MIDI exclusion.');
})().catch(error => { console.error(error); process.exitCode = 1; });
