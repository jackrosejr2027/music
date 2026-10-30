const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const elements = new Map(), events = {}, downloads = [], blobs = new Map(), storage = new Map();
class Element {
    constructor(tag = 'div') { this.tagName = tag.toLowerCase(); this.children = []; this.parent = null; this.listeners = {}; this.dataset = {}; this.style = {}; this.value = ''; this.checked = false; this.hidden = false; this.disabled = false; this.className = ''; this._text = ''; this.classList = { toggle() {}, add() {}, remove() {} }; }
    set id(id) { this._id = id; elements.set(id, this); }
    get id() { return this._id; }
    set textContent(value) { this._text = String(value); this.children.forEach(x => { x.parent = null; }); this.children = []; }
    get textContent() { return this._text + this.children.map(x => x.textContent).join(''); }
    append(...children) { for (const child of children) { child.remove(); child.parent = this; this.children.push(child); } }
    replaceChildren(...children) { this._text = ''; this.children.forEach(x => { x.parent = null; }); this.children = []; this.append(...children); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); this.parent = null; }
    setAttribute(name, value) { if (name === 'id') this.id = value; else if (name === 'class') this.className = value; else this[name] = value; }
    addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
    async fire(name) { for (const callback of this.listeners[name] || []) await callback({ target: this, preventDefault() {} }); }
    async click() { if (this.disabled) return; if (this.tagName === 'a') downloads.push({ name: this.download, blob: blobs.get(this.href) }); await this.fire('click'); }
    focus() {}
    getContext() { return { measureText: text => ({ width: text.length * 5 }) }; }
    querySelectorAll(selector) {
        const match = element => selector[0] === '.' ? element.className.split(' ').includes(selector.slice(1)) : selector.startsWith('[data-type=') ? element.dataset.type === selector.match(/"([^"_]+)"/)[1] : selector === 'input:checked' ? element.tagName === 'input' && element.checked : element.tagName === selector;
        const all = []; for (const child of this.children) { if (match(child)) all.push(child); all.push(...child.querySelectorAll(selector)); } return all;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
for (const match of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g)) { const element = new Element(match[1]); element.id = match[2]; }
const document = { getElementById: id => elements.get(id) || null, createElement: tag => new Element(tag), addEventListener: (name, callback) => { events[name] = callback; }, body: new Element('body') };
const $ = id => document.getElementById(id);
for (let i = 0; i < 12; i++) { const input = new Element('input'); input.value = String(i); $('beta-interval-filter').append(input); }
$('beta-interval-mode').value = 'any';
const data = {
    notes: ['C', 'G'],
    intervals: { '1': { name: 'Root', semitones: 0 }, 'b3': { name: 'Minor Third', semitones: 3 }, '#2': { name: 'Augmented Second', semitones: 3 }, '5': { name: 'Perfect Fifth', semitones: 7 } },
    chords: { major: { name: 'Alpha Major', intervals: ['1', '3', '5'] }, minor: { name: 'Beta Minor', intervals: ['1', 'b3', '5'] }, diminished: { name: 'Gamma Diminished', intervals: ['1', 'b3', 'b5'] } },
    scales: { major: { name: 'Major Ionian', intervals: ['1', '2', '3', '4', '5', '6', '7'] }, minor: { name: 'Natural Minor', intervals: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] } }
};
const context = { document, window: { app: { musicTheory: data, fretboard: { currentKey: 'C', settings: { tuning: ['E', 'A', 'D', 'G', 'B', 'E'], startFret: 0, endFret: 12 } } } }, Fretboard: class {}, Blob, console,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    Option: class extends Element { constructor(text, value) { super('option'); this.textContent = text; this.value = value; } },
    URL: { createObjectURL(blob) { const id = 'blob:' + blobs.size; blobs.set(id, blob); return id; }, revokeObjectURL() {} },
    setTimeout() {}, confirm: () => true
};
vm.createContext(context);
for (const path of ['fretboard-beta-layout.js', 'fretboard-beta-publishing.js', 'fretboard-beta-options.js', 'fretboard-beta-config.js', 'fretboard-beta-extra-formats.js', 'fretboard-beta-formats.js', 'fretboard-beta-catalog.js']) vm.runInContext(fs.readFileSync(path, 'utf8'), context);
const C = context.FretboardBetaCatalog, O = context.FretboardBetaOptions;
for (const [name, id, type] of O.fields) { const value = O.defaults()[name]; const control = $('beta-' + id); if (type === 'boolean') control.checked = value; else control.value = type === 'list' ? JSON.stringify(value) : Array.isArray(value) ? value.join(' ') : value === null ? '' : String(value); }
assert.equal(C.pitch('#4'), 6); assert.equal(C.pitch('b5'), 6); assert.equal(C.pitch('b9'), 1); assert.equal(C.pitch('13'), 9); assert.equal(C.pitch('bb7'), 9);
assert.equal(C.pitch('R'), 0); assert.equal(C.pitch('nonsense'), null);
assert.deepEqual([...C.commonEntries('interval', data.intervals)].map(([id]) => id), ['1', '5', 'b3', '#2']);
assert.deepEqual([...C.commonEntries('chord', data.chords)].map(([id]) => id), ['major', 'minor', 'diminished']);
assert.deepEqual([...C.commonEntries('scale', { exotic: { name: 'A rare scale' }, dorian: { name: 'Dorian' }, pentatonic_minor: { name: 'Pentatonic Minor' }, major: { name: 'Major' } })].map(([id]) => id), ['major', 'pentatonic_minor', 'dorian', 'exotic']);
assert.deepEqual([...C.pitches('chord', 'custom', { intervals: ['1', '#2', 'b3', '5', '12'] })], [0, 3, 7]);
vm.runInContext(fs.readFileSync('fretboard-word-beta.js', 'utf8'), context);
events.DOMContentLoaded();
const group = type => $('beta-patterns').querySelector('[data-type="' + type + '"]');
const labels = type => group(type).querySelectorAll('.beta-pattern-option');
const find = (type, name) => labels(type).find(label => label.textContent === name);
const visible = type => labels(type).filter(label => !label.hidden).map(label => label.textContent);
const check = async (type, name) => { const input = find(type, name).querySelector('input'); input.checked = true; await input.fire('change'); };
(async () => {
    assert.ok(['interval', 'chord', 'scale'].every(type => group(type).open === false));
    $('beta-filter').value = 'minor'; await $('beta-filter').fire('input');
    assert.deepEqual(visible('chord'), ['Beta Minor']); assert.deepEqual(visible('scale'), ['Natural Minor']);
    await $('beta-filter-reset').click();
    $('beta-search-chord').value = 'gamma'; await $('beta-search-chord').fire('input');
    assert.deepEqual(visible('chord'), ['Gamma Diminished']); assert.equal(visible('scale').length, 2);
    await $('beta-filter-reset').click();
    const filters = $('beta-interval-filter').children;
    filters[3].checked = true; await $('beta-interval-filter').fire('change');
    assert.deepEqual(visible('interval').sort(), ['Augmented Second', 'Minor Third']);
    assert.deepEqual(visible('chord').sort(), ['Beta Minor', 'Gamma Diminished']);
    filters[0].checked = filters[7].checked = true; $('beta-interval-mode').value = 'exact'; await $('beta-interval-mode').fire('change');
    assert.deepEqual(visible('chord'), ['Beta Minor']); assert.equal(visible('scale').length, 0); assert.equal(visible('interval').length, 0);
    await $('beta-check-all').click(); assert.ok(find('chord', 'Beta Minor').querySelector('input').checked);
    assert.ok(!find('chord', 'Alpha Major').querySelector('input').checked);
    await $('beta-filter-reset').click(); assert.ok(find('chord', 'Beta Minor').querySelector('input').checked);
    assert.equal($('beta-interval-mode').value, 'any');
    filters[0].checked = filters[4].checked = true; await $('beta-interval-filter').fire('change');
    assert.deepEqual(visible('chord').sort(), ['Alpha Major', 'Beta Minor', 'Gamma Diminished']);
    $('beta-interval-mode').value = 'all'; await $('beta-interval-mode').fire('change');
    assert.deepEqual(visible('chord'), ['Alpha Major']);
    await $('beta-filter-reset').click(); assert.equal($('beta-interval-mode').value, 'any');
    $('beta-pattern-order').value = 'name-asc'; await $('beta-pattern-order').fire('change');
    await check('chord', 'Alpha Major');
    const down = $('beta-order-list').querySelectorAll('button')[1]; await down.click();
    assert.equal($('beta-pattern-order').value, 'custom');
    assert.deepEqual(labels('chord').slice(0, 2).map(label => label.textContent), ['Beta Minor', 'Alpha Major']);
    $('beta-category-order').value = 'scale,chord,interval'; await $('beta-category-order').fire('change');
    assert.equal($('beta-patterns').children[0].dataset.type, 'scale');
    await check('scale', 'Major Ionian');
    $('beta-filter').value = 'no matches'; await $('beta-filter').fire('input');
    assert.equal(visible('chord').length, 0);
    $('beta-export-format').value = 'json'; await $('beta-export').click();
    assert.ok(downloads.length, $('beta-message').textContent);
    const exported = JSON.parse(await downloads[0].blob.text());
    const diagrams = exported.items.filter(item => item.kind === 'diagram');
    assert.deepEqual(diagrams.map(item => item.name), ['Major Ionian', 'Beta Minor', 'Alpha Major']);
    assert.equal(exported.options.categoryOrder, 'scale,chord,interval');
    $('beta-config-name').value = 'Custom order'; await $('beta-config-save').click();
    const saved = JSON.parse(storage.get('fretboard-word-beta-configurations-v1'))[0];
    assert.equal(saved.options.patternOrder, 'custom'); assert.ok(saved.options.customOrder.includes('chord:minor'));
    console.log('Beta category search, interval filters, shown-only selection, custom UI/export ordering, and saved order passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
