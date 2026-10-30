const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const JSZip = require('../vendor/jszip.min.js');
const docx = require('../vendor/docx.js');
const XLSX = require('../vendor/xlsx.full.min.js');
const keys = ['C','G','D','A','E','B','F#','Gb','C#','Db','G#','Ab','D#','Eb','A#','Bb','F'];
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
// JSZip's browser Blob reader uses FileReader, absent in Node. Adapt only that input boundary.
function Zip() {
    const zip = new JSZip(), file = zip.file.bind(zip);
    zip.file = (path, data, options) => file(path, data instanceof Blob ? data.arrayBuffer() : data, options);
    return zip;
}
Zip.loadAsync = JSZip.loadAsync;
let download, removed = 0, completed = 0, calls = [], failCapture = false, cancelAt = 0, mode = 'all-keys', alerts = [];
const app = {
    fretboard: { currentPatternType: 'scale', currentPattern: 'major' },
    musicTheory: {}, instrumentPresets: { guitar: { name: 'Guitar' } },
    diagramSetups: keys.map(() => ({ instrument: 'guitar' })),
    diagramBoards: keys.map((key, index) => ({ container: { clientWidth: 700 }, settings: { tuning: ['E','A','D','G','B','E'], startFret: index % 3, endFret: 24, gamutReferenceKey: 'Db' } }))
};
const live = JSON.stringify(app);
class Fretboard {
    updateSettings(settings) { this.settings = settings; }
    updatePattern(key, type, pattern) { this.currentKey = key; calls.push({ key, type, pattern, settings: this.settings }); }
}
const pdf = { internal: { pageSize: { getWidth: () => 842, getHeight: () => 595 } }, pages: 1, titles: [], addPage() { this.pages++; }, setFontSize() {}, text(value) { if (typeof value === 'string' && value.includes(' - scale - major')) this.titles.push(value); }, splitTextToSize: text => text, addImage() {}, output: () => new Uint8Array([37,80,68,70]) };
const Exporter = {
    safe: text => text.replace(/#/g,'sharp').replace(/[^a-zA-Z0-9_.-]/g,'_'),
    patternName: (app, type, id) => id,
    newPdf: () => { pdf.pages = 1; pdf.titles = []; return pdf; },
    pdfProgress: app => { app.stopExporting = false; return { set() {}, done() { completed++; } }; },
    describePattern: (context, key) => ({ lines: ['Key: ' + key, 'Tuning: ' + context.fretboard.settings.tuning.join('-')] }),
    getFretboardImageBase64: async () => {
        if (failCapture) throw new Error('capture failed');
        if (cancelAt && calls.length === cancelAt) app.stopExporting = true;
        return png;
    }
};
const context = vm.createContext({
    Exporter, Fretboard, JSZip: Zip, XLSX, docx, atob, Uint8Array, setTimeout, clearTimeout,
    Image: class { constructor() { this.width = 2000; this.height = 500; } set src(value) { this.onload(); } },
    document: { getElementById: () => ({ value: mode }), createElement: () => ({ style: {}, setAttribute() {}, remove() { removed++; } }), body: { appendChild() {} } },
    window: { removeEventListener() {}, ST: { download: (blob, filename) => { download = { blob, filename }; } } },
    alert: text => alerts.push(text)
});
vm.runInContext(fs.readFileSync('exporter-pdf-diagrams.js','utf8'), context);
(async () => {
    await Exporter.exportAllKeysPackage(app);
    assert.equal(pdf.pages, 17); assert.equal(pdf.titles.length, 17); assert.equal(completed, 1); assert.equal(removed, 1);
    const original = JSON.parse(live); const current = { ...app }; delete current.stopExporting;
    assert.deepEqual(current, original, 'Must not change live selection, settings or diagrams');
    assert.deepEqual(calls.map(call => call.key), keys);
    assert(calls.every(call => call.type === 'scale' && call.pattern === 'major'));
    const archive = await JSZip.loadAsync(await download.blob.arrayBuffer());
    const files = Object.values(archive.files).filter(file => !file.dir);
    assert.equal(files.length, 37);
    assert.equal(files.filter(file => file.name.endsWith('.png')).length, 17);
    assert.equal(files.filter(file => file.name.endsWith('.jpg')).length, 17);
    assert(archive.file('PNG/07_Fsharp.png')); assert(archive.file('PNG/08_Gb.png'));
    const word = await JSZip.loadAsync(await archive.file(/\.docx$/)[0].async('uint8array'));
    const wordXml = await word.file('word/document.xml').async('string');
    assert.equal((wordXml.match(/<w:drawing>/g) || []).length, 17);
    let previous = -1;
    for (const key of keys) { const position = wordXml.indexOf(key + ' - scale - major'); assert(position > previous); previous = position; }
    const excelBytes = await archive.file(/\.xlsx$/)[0].async('uint8array');
    const book = XLSX.read(excelBytes, { type: 'array' });
    assert.equal(book.SheetNames.length, 17);
    const excel = await JSZip.loadAsync(excelBytes);
    for (let i = 0; i < keys.length; i++) {
        const n = i + 1;
        assert.equal(book.Sheets[book.SheetNames[i]].B2.v, keys[i]);
        assert((await excel.file('xl/worksheets/sheet' + n + '.xml').async('string')).includes('rIdDiagram'));
        assert(excel.file('xl/drawings/drawing' + n + '.xml'));
        assert(excel.file('xl/drawings/_rels/drawing' + n + '.xml.rels'));
        assert(excel.file('xl/media/diagram' + n + '.png'));
    }
    Exporter.includeTitles = false;
    await Exporter.exportAllKeysPackage(app);
    assert.equal(pdf.titles.length, 0);
    const untitled = await JSZip.loadAsync(await download.blob.arrayBuffer());
    const untitledWord = await JSZip.loadAsync(await untitled.file(/\.docx$/)[0].async('uint8array'));
    const untitledXml = await untitledWord.file('word/document.xml').async('string');
    assert(!untitledXml.includes(' - scale - major'));
    assert.equal((untitledXml.match(/<w:drawing>/g) || []).length, 17);
    const untitledBook = XLSX.read(await untitled.file(/\.xlsx$/)[0].async('uint8array'), { type: 'array' });
    assert(!untitledBook.Sheets[untitledBook.SheetNames[0]].A1?.v);
    assert.equal(untitledBook.Sheets[untitledBook.SheetNames[0]].B2.v, 'C');
    delete Exporter.includeTitles;
    removed = 1; completed = 1;
    download = null; calls = []; cancelAt = 2;
    await Exporter.exportAllKeysPackage(app);
    assert.equal(download, null); assert.equal(removed, 2); assert.equal(completed, 2);
    cancelAt = 0; failCapture = true;
    await assert.rejects(() => Exporter.exportAllKeysPackage(app), /capture failed/);
    assert.equal(removed, 3); assert.equal(completed, 3);
    failCapture = false; mode = 'gauntlet';
    await Exporter.exportAllKeysPackage(app); assert.equal(alerts.length, 1); assert.equal(download, null);
    for (const type of ['interval', 'chord', 'custom', 'gamut']) {
        mode = 'all-keys'; calls = []; app.fretboard.currentPatternType = type; app.fretboard.currentPattern = 'selected';
        await Exporter.exportAllKeysPackage(app);
        assert.deepEqual(calls.map(call => call.key), keys);
        assert(calls.every(call => call.type === type && call.pattern === 'selected'));
        if (type === 'gamut') assert(calls.every(call => call.settings.gamutReferenceKey === 'Db'));
    }
    console.log('PASS: 37-file ZIP, 17 ordered PDF pages, real DOCX diagram sections, XLSX metadata/sheets/embedded drawings, JPG/PNG entries, selected pattern categories, Gamut settings, live-state isolation, cancellation and failure cleanup, All Keys guard.');
})().catch(error => { console.error(error); process.exitCode = 1; });
