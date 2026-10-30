const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
for (const file of ['fretboard-beta-layout.js', 'fretboard-beta-options.js', 'fretboard-beta-config.js']) vm.runInThisContext(fs.readFileSync(file, 'utf8'));
const L = FretboardBetaLayout, O = FretboardBetaOptions, C = FretboardBetaConfig;
const defaults = O.defaults(), html = fs.readFileSync('index.html', 'utf8');
assert.equal(O.fields.length, 76);
for (const [, id] of O.fields) assert.equal(html.split('id="beta-' + id + '"').length - 1, 1, 'Missing or duplicate option ' + id);
assert.equal(O.validate(defaults).columns, 1);
for (const invalid of [{ margin: 100 }, { columns: 3 }, { dpi: 999 }, { jpegQuality: 101 }, { paper: 'bad' }, { font: 'bad' }, { textColor: 'red' }, { categoryBreak: 'yes' }, { startFret: 12, endFret: 2 }]) assert.throws(() => O.validate(invalid));
const diagram = (name = 'Major') => ({ kind: 'diagram', caption: name });
const items = Array.from({ length: 8 }, () => diagram());
for (const paper of ['a4', 'a3', 'letter', 'legal']) for (const orientation of ['portrait', 'landscape']) for (const columns of [0, 1, 2]) for (const alignY of ['top', 'center', 'bottom']) {
    const options = { ...defaults, paper, orientation, columns, alignY, margin: 15, gapX: 7, gapY: 3 };
    const config = L.layoutConfig(options, .23), pages = L.planPages(items, config, 0);
    for (const page of pages) {
        const g = L.pageGeometry(page, config);
        if (columns) assert.equal(page.columns, columns);
        assert.ok(g.width <= g.cellWidth + .0001);
        assert.ok(g.usedHeight + g.offsetY <= config.availableHeight + .0001);
        assert.ok(Math.abs(g.cellWidth * page.columns + (page.columns - 1) * config.gapX - config.availableWidth) < .0001);
        if (alignY === 'center') assert.ok(Math.abs(g.offsetY * 2 + g.usedHeight - config.availableHeight) < .0001);
        if (alignY === 'bottom') assert.ok(Math.abs(g.offsetY + g.usedHeight - config.availableHeight) < .0001);
    }
}
const rowConfig = L.layoutConfig(defaults, .2), full = L.planPages([diagram()], rowConfig, 0)[0];
assert.equal(full.columns, 1);
assert.ok(Math.abs(L.pageGeometry(full, rowConfig).width - rowConfig.availableWidth) < .0001, 'Default diagram must fill page width');
const split = L.planPages([diagram(), { kind: 'break' }, diagram()], rowConfig, 0);
assert.equal(split.length, 2);
assert.throws(() => C.validateConfiguration({ name: 'Bad', keys: [2], patterns: {} }));
assert.throws(() => C.validateConfiguration({ name: 'Bad', keys: ['C'], patterns: {}, options: { margin: 90 } }));
assert.equal(C.validateConfiguration({ name: 'Legacy', keys: ['C'], patterns: {} }).options, undefined);
class Element {
    constructor(value = '') { this.value = value; this.checked = false; this.children = []; this.listeners = {}; this.files = []; this.disabled = false; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    replaceChildren(...children) { this.children = children; this.value = ''; }
    append(child) { this.children.push(child); }
    async click() { if (this.listeners.click) await this.listeners.click(); }
    async change() { if (this.listeners.change) await this.listeners.change(); }
    remove() {}
}
const elements = new Map();
globalThis.document = { getElementById(id) { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); }, createElement() { return new Element(); }, body: { append() {} } };
globalThis.Option = class { constructor(text, value) { this.text = text; this.value = value; } };
const store = new Map();
globalThis.localStorage = { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) };
globalThis.confirm = () => true;
const $ = id => document.getElementById('beta-config-' + id);
const key = 'fretboard-word-beta-configurations-v1';
let options = O.defaults(), applied = null, status;
const api = C.setup({ getSelection: () => ({ keys: ['C'], patterns: { interval: ['fifth'], chord: [], scale: [] } }), getOptions: () => options,
    applySelection: config => { applied = config; }, applyOptions: value => { options = O.validate(value); }, resetOptions: () => { options = O.defaults(); }, setStatus: text => { status = text; } });
const saved = () => JSON.parse(store.get(key) || '[]');
(async () => {
    $('name').value = 'Landscape rows'; await $('save').click();
    const id = saved()[0].id; assert.equal(saved()[0].options.columns, 1);
    options = { ...options, paper: 'letter', columns: 2, subtitle: 'Side by side' };
    await $('update').click(); assert.equal(saved()[0].options.paper, 'letter');
    await $('duplicate').click(); assert.equal(saved().length, 2);
    $('name').value = 'Renamed copy'; await $('rename').click(); assert.equal(saved()[1].name, 'Renamed copy');
    await $('load').click(); assert.equal(applied.name, 'Renamed copy'); assert.equal(options.subtitle, 'Side by side');
    options = { ...options, columns: 1 }; await $('restore').click(); assert.equal(options.columns, 2);
    $('default').checked = true; await $('default').change();
    options = { ...options, paper: 'a3' }; api.onOpen(); assert.equal(options.paper, 'letter');
    await $('reset').click(); assert.equal(options.paper, 'a4');
    await $('download').click(); assert.match(status, /downloaded/);
    await $('backup').click(); assert.match(status, /backed up/);
    $('file').files = [{ size: 500, text: async () => JSON.stringify({ configurations: saved() }) }];
    await $('file').change(); assert.equal(saved().length, 4);
    const before = store.get(key);
    $('file').files = [{ size: 500, text: async () => JSON.stringify({ configurations: [{ name: 'Bad', keys: [5], patterns: {} }] }) }];
    await $('file').change(); assert.equal(store.get(key), before, 'Bad import must be atomic');
    $('select').value = id; await $('delete').click(); assert.equal(saved().length, 3);
    await $('clear').click(); assert.equal(saved().length, 0);
    console.log('Beta options and all ten new configuration features passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
