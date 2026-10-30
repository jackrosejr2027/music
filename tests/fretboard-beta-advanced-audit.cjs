const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const JSZip = require('../vendor/jszip.min.js');
globalThis.XLSX = require('../vendor/xlsx.full.min.js');
for (const path of ['fretboard-beta-layout.js', 'fretboard-beta-advanced-schema.js', 'fretboard-beta-publishing.js', 'fretboard-beta-options.js', 'fretboard-beta-advanced.js', 'fretboard-beta-extra-formats.js', 'fretboard-beta-formats.js', 'fretboard-beta-config.js']) vm.runInThisContext(fs.readFileSync(path, 'utf8'));
const S = FretboardBetaAdvancedSchema, O = FretboardBetaOptions, A = FretboardBetaAdvanced, F = FretboardBetaFormats;
assert.equal(S.tabs.length, 6); assert.ok(S.tabs.every(tab => tab.fields.length === 15));
assert.equal(S.fields.length, 90); assert.equal(new Set(S.fields.map(([name]) => name)).size, 90);
const defaults = O.defaults();
class Node {
    constructor(tag = 'div') { this.tag = tag; this.attrs = {}; this.children = []; this.value = ''; this.checked = false; }
    set id(value) { this.attrs.id = value; nodes.set(value, this); } get id() { return this.attrs.id; }
    set className(value) { this.attrs.class = value; } get className() { return this.attrs.class || ''; }
    setAttribute(key, value) { this.attrs[key] = String(value); } getAttribute(key) { return this.attrs[key] ?? null; }
    append(...children) { for (const child of children) { child.remove(); child.parent = this; this.children.push(child); } }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = null; }
    matches(selector) { if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1)); if (selector.startsWith('[')) return Object.hasOwn(this.attrs, selector.slice(1, -1)); return this.tag === selector; }
    querySelectorAll(selector) {
        if (selector.includes(' ')) { const [first, ...rest] = selector.split(' '); return this.querySelectorAll(first).flatMap(node => node.querySelectorAll(rest.join(' '))); }
        return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    cloneNode() { const node = new Node(this.tag); node.attrs = { ...this.attrs }; node.append(...this.children.map(child => child.cloneNode())); return node; }
}
const nodes = new Map(), body = new Node(); body.className = 'beta-body';
const dialog = new Node(); dialog.append(body);
globalThis.document = { createElement: tag => new Node(tag), getElementById: id => nodes.get(id) };
globalThis.Option = class extends Node { constructor(label, value) { super('option'); this.textContent = label; this.value = value; } };
const cards = S.mount(dialog);
assert.equal(cards.length, 6);
assert.equal(body.querySelectorAll('label').length, 90);
for (const [name, id, type] of O.fields) {
    let control = nodes.get('beta-' + id);
    if (!control) { control = new Node(); control.id = 'beta-' + id; }
    control.value = type === 'list' ? JSON.stringify(defaults[name]) : Array.isArray(defaults[name]) ? defaults[name].join(' ') : defaults[name] ?? '';
    control.checked = defaults[name];
}
const tuningPreset = new Node(); tuningPreset.id = 'beta-tuning-preset';
assert.deepEqual(O.read(), defaults);
const changed = { ...defaults, publisher: 'Test publisher', watermarkText: 'Proof copy', sequenceDigits: 5, readerPrint: true };
O.apply(changed); assert.deepEqual(O.read(), changed);
const restored = FretboardBetaConfig.validateConfiguration({ name: 'Advanced', keys: ['C'], patterns: { scale: ['major'] }, options: changed });
for (const [name] of S.fields) assert.deepEqual(restored.options[name], changed[name], 'Saved setup must retain ' + name);
for (const [name, , type, , min, max] of S.fields) {
    if (['number', 'integer'].includes(type)) { assert.throws(() => O.validate({ [name]: min - 1 })); assert.throws(() => O.validate({ [name]: max + 1 })); }
    if (type === 'optional-color' || type === 'color') assert.throws(() => O.validate({ [name]: 'red;bad' }));
    if (type === 'select') assert.throws(() => O.validate({ [name]: 'invalid-choice' }));
}
const make = (tag, cls, attrs = {}) => { const node = new Node(tag); node.className = cls; for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); return node; };
const svg = make('svg', '');
for (const cls of ['string', 'fret', 'fret-marker', 'string-label', 'fret-number']) svg.append(make('line', cls));
for (const [pitch, fret] of [['C', 0], ['C', 12], ['D', 2]]) { const group = make('g', 'note-marker-group', { 'data-fret': fret }); group.append(make('circle', 'note-marker', { 'data-pitch': pitch }), make('text', '')); svg.append(group); }
for (const [key, selector] of [['layerStrings', '.string'], ['layerFrets', '.fret'], ['layerInlays', '.fret-marker'], ['layerTuning', '.string-label'], ['layerNumbers', '.fret-number'], ['layerLabels', '.note-marker-group text']]) assert.equal(A.layers(svg, { ...defaults, [key]: false }, 'C').querySelectorAll(selector).length, 0, key);
assert.equal(A.layers(svg, { ...defaults, rootsOnly: true }, 'C').querySelectorAll('.note-marker-group').length, 2);
assert.equal(A.layers(svg, { ...defaults, hideOpenNotes: true }, 'C').querySelectorAll('.note-marker-group').length, 2);
const colored = A.layers(svg, { ...defaults, layerStringColor: '#123456', layerFretColor: '#234567', layerRootColor: '#345678', layerNoteColor: '#456789', layerLabelColor: '#567890' }, 'C');
assert.equal(colored.querySelector('.string').getAttribute('stroke'), '#123456');
assert.equal(colored.querySelector('.fret').getAttribute('stroke'), '#234567');
assert.deepEqual(colored.querySelectorAll('.note-marker').map(node => node.getAttribute('fill')), ['#345678', '#345678', '#456789']);
assert.ok(colored.querySelectorAll('.note-marker-group text').every(node => node.getAttribute('fill') === '#567890'));
assert.equal(svg.querySelectorAll('.note-marker-group').length, 3, 'Export processing must not modify the live diagram');
globalThis.XMLSerializer = class { serializeToString() { return '<svg viewBox="0 0 100 25"/>'; } };
const decorated = F.decorateSvg(svg, { ...defaults, mirrorHorizontal: true, mirrorVertical: true, watermarkText: '<Proof & copy>', watermarkFont: 'Courier New', watermarkSize: 20, watermarkColor: '#123456', watermarkOpacity: .4, watermarkAngle: 35, watermarkX: 25, watermarkY: 75, watermarkWeight: true, watermarkItalic: true, watermarkTracking: 10, watermarkBackground: '#abcdef', watermarkBackgroundOpacity: .6, watermarkPadding: 3, watermarkRepeat: true }, { width: 100, height: 25 });
for (const token of ['scale(-1 -1)', '&lt;Proof &amp; copy&gt;', 'Courier New', 'font-size="5"', 'fill="#123456"', 'opacity="0.4"', 'rotate(35)', 'font-weight="bold"', 'font-style="italic"', 'letter-spacing="0.5"', 'fill="#abcdef"', 'opacity="0.6"']) assert.ok(decorated.markup.includes(token), token);
assert.equal((decorated.markup.match(/dominant-baseline/g) || []).length, 9);
assert.equal(A.watermark(defaults, 100, 25), '');
const item = { kind: 'diagram', category: 'Scales', key: 'C#', pattern: 'major', name: 'Major Scale', caption: '=unsafe', intervals: '1 3 5' };
const items = [item];
(async () => {
    for (const [name] of S.tabs.find(tab => tab.id === 'tables').fields.slice(0, 10)) assert.equal(A.table(items, { ...defaults, [name]: false }).rows[0].length, 9, name);
    assert.throws(() => A.table(items, { ...defaults, ...Object.fromEntries(S.tabs.find(tab => tab.id === 'tables').fields.slice(0, 10).map(([key]) => [key, false])) }), /at least one column/);
    const csv = A.delimited('csv', items, { ...defaults, tableDelimiter: 'semicolon', tableHeader: false, tableBom: false, tableNewline: 'lf', tableQuotes: 'minimal' });
    assert.ok((await csv.text()).startsWith("1;Scales;C#;major;Major Scale;'=unsafe;"));
    assert.notEqual(new Uint8Array(await csv.arrayBuffer())[0], 239);
    const quoted = A.delimited('tsv', [...items, item], defaults);
    assert.equal(new Uint8Array(await quoted.arrayBuffer())[0], 239);
    assert.ok((await quoted.text()).includes('"Number"	"Category"'));
    assert.ok((await quoted.text()).includes('\r\n'));
    const workbook = XLSX.read(new Uint8Array(await FretboardBetaExtraFormats.catalog('xlsx', items, { ...defaults, columnCaption: false, tableHeader: false }, () => ({})).arrayBuffer()), { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Patterns, { header: 1 });
    assert.equal(rows.length, 1); assert.equal(rows[0].length, 9); assert.equal(rows[0][0], 1);
    const used = new Set(), opts = { ...defaults, archiveRoot: 'Book', categoryFolders: true, keyFolders: true, archivePrefix: 'pre ', archiveSuffix: ' post', entryTemplate: '{number} {name}', filenameCase: 'lower', filenameSeparator: '-', sequenceDigits: 5 };
    const name = A.entryName(item, 0, opts, 'png', used);
    assert.equal(name, 'book/scales/csharp/pre-00001-major-scale-post.png');
    assert.equal(A.entryName(item, 0, opts, 'png', used), 'book/scales/csharp/pre-00001-major-scale-post-2.png');
    assert.ok(!A.entryName(item, 0, { ...defaults, archiveRoot: '../evil', categoryFolders: false, keyFolders: false, entryTemplate: '../{key}' }, 'svg', new Set()).includes('../'));
    const zip = new JSZip(); zip.file(name, 'image');
    const blob = await A.archive(zip, 'png-zip', items, { ...opts, archiveManifest: true, archiveSettings: true, archiveReadme: true, zipCompression: 'DEFLATE', zipLevel: 9 }, () => {});
    const archive = await JSZip.loadAsync(await blob.arrayBuffer());
    for (const path of ['book/manifest.json', 'book/settings.json', 'book/collection.txt', name]) assert.ok(archive.file(path), path);
    assert.equal(JSON.parse(await archive.file('book/settings.json').async('string')).zipLevel, 9);
    const html = A.reader(['<svg><rect/></svg>'], { ...defaults, title: '<Book>', author: 'Author', readerTitle: true, readerAuthor: true, readerCount: true, readerPrint: true, readerLanguage: 'fr', readerBackground: '#123456', readerPageBackground: '#234567', readerGap: 42, readerPadding: 18, readerWidth: 75, readerShadow: false, readerBorder: true, readerBorderColor: '#345678', readerBorderWidth: 3, readerRadius: 12 }, { pageWidth: 297, pageHeight: 210 });
    for (const text of ['lang="fr"', '&lt;Book&gt;', 'Author', '1 page', 'window.print()', 'background:#123456', 'background:#234567', 'gap:42px', 'padding:18px', 'min(75%', 'box-shadow:none', 'border:3px solid #345678', 'border-radius:12px', '@page{size:297mm 210mm']) assert.ok(html.includes(text), text);
    const source = fs.readFileSync('fretboard-word-beta.js', 'utf8');
    const sandbox = { ...FretboardBetaLayout, measure: { measureText: text => ({ width: text.length * 5 }) } }; vm.createContext(sandbox);
    for (const [name, next] of [['textStyle', 'headingLines'], ['headingLines', 'templateValues'], ['templateValues', 'exportConfig'], ['exportConfig', 'buildItems'], ['buildItems', 'pageText']]) {
        vm.runInContext(source.slice(source.indexOf('        function ' + name + '('), source.indexOf('        function ' + next + '(')), sandbox);
    }
    const content = Object.fromEntries(S.tabs[0].fields.map(([name]) => [name, name + ' {key}']));
    const built = sandbox.buildItems([{ id: 'scale', title: 'Scales', patterns: [{ id: 'major', name: 'Major' }] }], ['C'], { ...defaults, ...content });
    for (const [name] of S.tabs[0].fields.slice(0, 11)) assert.ok(built.some(item => item.kind === 'heading' && item.text.startsWith(name)), name);
    const caption = built.find(item => item.kind === 'diagram').caption;
    for (const [name] of S.tabs[0].fields.slice(11)) assert.ok(caption.includes(name + ' C'), name);
    const captionOnly = sandbox.buildItems([{ id: 'scale', title: 'Scales', patterns: [{ id: 'major', name: 'Major' }] }], ['C'], { ...defaults, caption: '', practicePrompt: 'Play slowly' });
    assert.ok(sandbox.exportConfig({ ...defaults, caption: '' }, .25, captionOnly).captionHeight > 0);
    console.log('PASS: Six tabs x 15 fields, configuration round-trip/validation, all diagram layers, mirrors, watermark, table controls, archive layout/sidecars/compression, HTML reader and publication text.');
})().catch(error => { console.error(error); process.exitCode = 1; });
