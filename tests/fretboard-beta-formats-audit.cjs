const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const docx = require('../vendor/docx.js');
const { jsPDF } = require('../vendor/jspdf.umd.min.js');
const JSZip = require('../vendor/jszip.min.js');
globalThis.XLSX = require('../vendor/xlsx.full.min.js');
globalThis.FileReader = class { readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => this.onload({ target: { result } }), error => this.onerror({ target: { error } })); } };
for (const path of ['fretboard-beta-layout.js', 'fretboard-beta-advanced-schema.js', 'fretboard-beta-binary.js', 'fretboard-beta-book-packages.js', 'fretboard-beta-publishing.js', 'fretboard-beta-options.js', 'fretboard-beta-advanced.js', 'fretboard-beta-extra-formats.js', 'fretboard-beta-formats.js']) vm.runInThisContext(fs.readFileSync(path, 'utf8'));
const L = FretboardBetaLayout, O = FretboardBetaOptions, F = FretboardBetaFormats;
const html = fs.readFileSync('index.html', 'utf8');
const dialog = html.slice(html.indexOf('<dialog id="fretboard-word-beta"'), html.indexOf('</dialog>', html.indexOf('<dialog id="fretboard-word-beta"')));
assert.equal((dialog.match(/<details/g) || []).length, 7);
assert.ok(!/<details[^>]*\sopen(?:[\s=>])/.test(dialog));
assert.ok(!dialog.includes('id="beta-export-pdf-zip"'));
assert.equal(F.formats.length, 41);
assert.equal(new Set(F.formats.map(f => f[0])).size, 41);
for (const [kind] of F.formats) assert.ok(dialog.includes('value="' + kind + '"'));
const source = fs.readFileSync('fretboard-word-beta.js', 'utf8');
assert.ok(source.includes('details.open = false'));
const png = fs.readFileSync('icon-192.png');
globalThis.JSZip = JSZip;
globalThis.DjVu = require('./djvu-worker-fixture.cjs')();
globalThis.document = { baseURI: 'https://example.test/' };
const fixturePixels = {width:16,height:16,data:new Uint8ClampedArray(16*16*4).fill(255)};
FretboardBetaBinary.raster = async () => ({ image: () => ({...fixturePixels,data:fixturePixels.data.slice()}), blob: async type => new Blob([png],{type:type || 'image/png'}) });
const webp = Buffer.from('UklGRjoAAABXRUJQVlA4IC4AAACwAQCdASoEAAQAAUAmJQBOgCHfwHHAAP76aV66AH9OZGG37be/DzWB+9y0UAgA', 'base64');
let current = O.defaults(), disposed = 0, downloaded, status;
const choice = [{ id: 'scale', title: 'Scales', patterns: [{ id: 'major', name: 'Major' }, { id: 'minor', name: '<Minor & "safe">' }] }];
const sandbox = { ...L, FretboardBetaPublishing, FretboardBetaAdvanced, FretboardBetaFormats: F, FretboardBetaExtraFormats, docx, JSZip, Blob, window: { jspdf: { jsPDF } },
    async svgToImageBytes() { return { bytes: new Uint8Array(png) }; },
    exporting: false, cancelled: false, jobs: F.formats,
    ExportCancelled: class extends Error {}, checkCancel() {}, refreshFromApp() {},
    selectedPatterns: () => choice, selectedKeys: () => ['C', 'G'], readOptions: () => current,
    setStatus: text => { status = text; }, setBusy: busy => { sandbox.exporting = busy; },
    downloadBlob: (blob, filename) => { downloaded = { blob, filename }; },
    createRenderer() { return { renderer: { svg: {}, updatePattern() {} }, dispose() { disposed++; } }; },
    svgSize: () => ({ width: 1000, height: 250 }),
    measure: { measureText: text => ({ width: text.length * 5 }) },
    pdfFonts: { Arial: 'helvetica', 'Times New Roman': 'times', 'Courier New': 'courier' },
    console,
    // Image encoding is mocked; this audit exercises all real document/archive branches.
    async renderItem(item, context, options = {}) {
        context.done++;
        const box = context.imageBox || L.boxSize(context.options, 0.25, 100 * 25.4 / 96), width = box.width, height = box.height;
        const markup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 25"><text x="2" y="12">' + F.escape(item.name) + '</text></svg>';
        if (options.vector) return { markup, width, height, dataUrl: F.svgUrl(markup) };
        return { width, height, bytes: new Uint8Array(options.mimeType === 'image/webp' ? webp : png), dataUrl: 'data:image/png;base64,' + png.toString('base64') };
    }
};
vm.createContext(sandbox);
function load(name, next) {
    let start = source.indexOf('        function ' + name + '(');
    if (start < 0) start = source.indexOf('        async function ' + name + '(');
    const end = source.indexOf('        ' + next, start + 1);
    assert.ok(start >= 0 && end > start, name);
    vm.runInContext(source.slice(start, end), sandbox);
}
for (const [name, next] of [
    ['textStyle', 'function headingLines'], ['headingLines', 'function templateValues'], ['templateValues', 'function exportConfig'],
    ['exportConfig', 'function buildItems'], ['buildItems', 'function pageText'], ['pageText', 'function safeFilePart'],
    ['safeFilePart', 'function pdfSafeText'], ['pdfSafeText', 'function downloadBlob'],
    ['containedSize', 'function newPdf'], ['newPdf', 'async function addPdfPage'], ['addPdfPage', 'async function makeDocx'],
    ['makeDocx', 'function shrinkNote'], ['shrinkNote', 'async function runExport'], ['runExport', "exportButton.addEventListener"]
]) load(name, next);
vm.runInContext('globalThis.api = { runExport, buildItems, exportConfig, textStyle }', sandbox);
(async () => {
    for (const [kind, , suffix] of F.formats) {
        downloaded = null; status = '';
        current = { ...O.defaults(), format: kind, width: 100, height: 25, perPage: kind === 'docx' ? 0 : 2, captionBold: true, bodyItalic: true,
            titleSize: 19, headingSize: 15, captionSize: 10, bodySize: 11, textAlign: 'right', captionPosition: 'above',
            headingNumbers: true, diagramNumbers: true, keyBreak: true, introduction: 'Custom introduction',
            captionColor: '#aa0000', headingColor: '#00aa00', titleColor: '#0000aa', bodyColor: '#884400', lineSpacing: 1.15,
            dateText: 'Date {date}', tuningText: 'Instrument {tuning}', rangeText: 'Range {startFret}-{endFret}', uppercaseHeadings: true, uppercaseCaptions: true,
            paper: 'custom', customWidth: 220, customHeight: 320, header: 'Header {page}/{pages}', footer: 'Footer', pageNumbers: 'total' };
        await sandbox.api.runExport(kind);
        assert.ok(downloaded, kind + ': ' + status);
        assert.equal(downloaded.filename, 'C+G - Scale - Major+Minor & safe - EADGBE - 6 - ' + current.startFret + ' - ' + current.endFret + suffix);
        assert.ok(downloaded.blob.size > 20);
        if (process.env.EXPORT_AUDIT_OUTPUT) { fs.mkdirSync(process.env.EXPORT_AUDIT_OUTPUT,{recursive:true}); fs.writeFileSync(require('node:path').join(process.env.EXPORT_AUDIT_OUTPUT,kind + suffix),Buffer.from(await downloaded.blob.arrayBuffer())); }
        assert.equal(sandbox.exporting, false);
        if (kind.endsWith('zip')) {
            const zip = await JSZip.loadAsync(new Uint8Array(await downloaded.blob.arrayBuffer()));
            const files = Object.keys(zip.files).filter(name => !zip.files[name].dir);
            assert.ok(files.length >= 2, kind);
            const ext = { 'pdf-zip': '.pdf', 'jpg-zip': '.jpg', 'png-zip': '.png', 'svg-zip': '.svg', 'webp-zip': '.webp', 'svg-pages-zip': '.svg', 'png-pages-zip': '.png', 'jpg-pages-zip': '.jpg' }[kind];
            if (ext) assert.ok(files.every(name => name.endsWith(ext)), kind);
            if (kind === 'pdf-zip') assert.ok((await zip.file(files[0]).async('string')).startsWith('%PDF'));
            if (kind === 'markdown-zip') {
                const md = await zip.file('README.md').async('string');
                assert.ok(md.includes('Custom introduction'));
                assert.ok(!md.includes('<Minor'));
                assert.equal((md.match(/!\[/g) || []).length, 4);
                assert.equal(files.filter(f => f.endsWith('.png')).length, 4);
            }
            if (kind === 'svg-pages-zip') {
                const svg = await zip.file(files[0]).async('string');
                assert.ok(svg.includes('width="320mm"'));
                assert.ok(svg.includes('text-anchor="end"'));
                assert.ok(svg.includes('font-weight="bold"'));
                assert.ok(svg.includes('Custom introduction'));
            }
        } else if (kind === 'docx') {
            const zip = await JSZip.loadAsync(new Uint8Array(await downloaded.blob.arrayBuffer()));
            const xml = await zip.file('word/document.xml').async('string');
            assert.ok(xml.includes('1. SCALES'));
            assert.ok(xml.includes('1. C'));
            assert.ok(xml.includes('w:jc w:val="right"'));
            assert.ok(xml.includes('w:sz w:val="20"'));
            assert.ok(xml.includes('<w:i/>'));
            for (const color of ['aa0000', '00aa00', '0000aa', '884400']) assert.ok(xml.includes('w:color w:val="' + color + '"'));
            assert.ok(xml.includes('Instrument E A D G B E')); assert.ok(xml.includes('Range 0-24'));
            assert.ok(xml.includes('MAJOR'));
            assert.ok(xml.includes('cx="3600000"'), 'DOCX must respect the requested 100 mm diagram width');
            const drawingParagraph = xml.slice(xml.lastIndexOf('<w:p>', xml.indexOf('<w:drawing>')), xml.indexOf('</w:p>', xml.indexOf('<w:drawing>')));
            assert.ok(drawingParagraph.includes('w:lineRule="auto"'), 'Inline images must not use an exact-height text line');
            assert.ok(drawingParagraph.includes('w:jc w:val="left"'), 'Images must not be forcibly centered inside the available row');
            const cell = xml.slice(xml.indexOf('<w:tc>'), xml.indexOf('</w:tc>'));
            assert.ok(cell.indexOf('1. C') < cell.indexOf('<w:drawing>'), 'Caption must be above image');
        } else if (kind === 'pdf-single') assert.ok((await downloaded.blob.text()).startsWith('%PDF'));
        else if (kind === 'html') {
            const output = await downloaded.blob.text();
            assert.ok(output.startsWith('<!doctype html>'));
            assert.ok(output.includes('&lt;Minor &amp; &quot;safe&quot;&gt;') || output.includes('%26lt%3BMinor'));
            assert.ok(!output.includes('<Minor'));
            assert.ok(output.includes('@page'));
        } else if (kind === 'json') {
            const output = JSON.parse(await downloaded.blob.text()); assert.equal(output.options.titleSize, 19);
            assert.equal(output.items.filter(i => i.kind === 'diagram').length, 4);
        } else if (['xlsx', 'xls', 'ods'].includes(kind)) {
            const workbook = XLSX.read(new Uint8Array(await downloaded.blob.arrayBuffer()), { type: 'array' });
            assert.deepEqual(workbook.SheetNames, ['Patterns', 'Text', 'Settings']);
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Patterns, { header: 1 });
            assert.equal(rows.length, 5); assert.equal(rows[1][4], 'Major');
        } else if (kind === 'ndjson') {
            const records = (await downloaded.blob.text()).trim().split('\n').map(line => JSON.parse(line));
            assert.equal(records[0].kind, 'settings'); assert.equal(records.filter(item => item.kind === 'diagram').length, 4);
        } else if (kind === 'rtf') assert.ok((await downloaded.blob.text()).startsWith('{' + String.fromCharCode(92) + 'rtf1'));
        else if (kind === 'word-xml') assert.ok((await downloaded.blob.text()).includes('<w:wordDocument'));
        else if (kind === 'xml') assert.ok((await downloaded.blob.text()).includes('<fretboard-catalog'));
        else if (kind === 'yaml') assert.ok((await downloaded.blob.text()).includes('items:'));
        else if (['epub', 'odt', 'odp', 'pptx', 'cbz'].includes(kind)) {
            const zip = await JSZip.loadAsync(new Uint8Array(await downloaded.blob.arrayBuffer()));
            if (kind === 'epub') { assert.equal(await zip.file('mimetype').async('string'), 'application/epub+zip'); assert.ok(zip.file('EPUB/package.opf')); }
            if (kind === 'odt' || kind === 'odp') assert.ok(zip.file('content.xml'));
            if (kind === 'pptx') assert.ok(zip.file('ppt/presentation.xml'));
            if (kind === 'cbz') assert.ok(zip.file('ComicInfo.xml'));
        } else if (kind === 'djvu') {
            const bytes = new Uint8Array(await downloaded.blob.arrayBuffer());
            assert.equal(Buffer.from(bytes.subarray(0,16)).toString('ascii'), 'AT&TFORM' + Buffer.from(bytes.subarray(8,12)).toString('ascii') + 'DJVM');
            const doc = new DjVu.Document(await downloaded.blob.arrayBuffer()); assert.ok(doc.getPagesQuantity() >= 2);
        } else if (kind === 'tiff') assert.deepEqual([...new Uint8Array(await downloaded.blob.slice(0,4).arrayBuffer())], [73,73,42,0]);
        else if (kind === 'tar') assert.equal(await downloaded.blob.slice(257,262).text(),'ustar');
        else if (kind === 'xhtml') { assert.ok((await downloaded.blob.text()).startsWith('<?xml')); assert.ok(!(await downloaded.blob.text()).includes('<Minor')); }
        else if (kind === 'dbf' || kind === 'dif') {
            const workbook = XLSX.read(new Uint8Array(await downloaded.blob.arrayBuffer()),{type:'array'});
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{header:1}); assert.equal(rows.length,5);
        } else assert.ok((await downloaded.blob.text()).includes('Minor'));
    }
    assert.equal(disposed, 27, 'Text-only exports must not create a renderer');
    const kept = current;
    current = { ...O.defaults(), format: 'svg-zip', downloadName: '{key}-{number}', archiveRoot: 'Proof', entryTemplate: '{number}-{key}-{name}', filenameCase: 'lower', keyFolders: true, sequenceDigits: 4, archiveManifest: true, archiveSettings: true, archiveReadme: true, zipCompression: 'DEFLATE', zipLevel: 9 };
    await sandbox.api.runExport('svg-zip');
    assert.equal(downloaded.filename, 'c+g-4-svgs.zip');
    const packaged = await JSZip.loadAsync(new Uint8Array(await downloaded.blob.arrayBuffer()));
    for (const name of ['proof/manifest.json', 'proof/settings.json', 'proof/collection.txt', 'proof/scales/c/0001-c-major.svg']) assert.ok(packaged.file(name), name);
    current = { ...O.defaults(), format: 'docx', publisher: 'Publication Test', captionPrefix: 'Study', practicePrompt: 'Play {name} slowly', diagramCredit: 'Credit Test' };
    await sandbox.api.runExport('docx');
    const contentZip = await JSZip.loadAsync(new Uint8Array(await downloaded.blob.arrayBuffer()));
    const contentXml = await contentZip.file('word/document.xml').async('string');
    for (const text of ['Publication Test', 'Study', 'Play Major slowly', 'Credit Test']) assert.ok(contentXml.includes(text), text);
    current = { ...O.defaults(), format: 'docx', paper: 'a4', orientation: 'landscape', perPage: 4, header: '', footer: '', pageNumbers: 'none' };
    downloaded = null; status = '';
    await sandbox.api.runExport('docx');
    assert.ok(downloaded, 'Auto-sized Word diagrams must fit without a fixed-size error: ' + status);
    for (const [paper, orientation, printableWidth] of [['a4', 'landscape', 273], ['letter', 'portrait', 191.9], ['letter', 'landscape', 255.4]]) {
        current = { ...current, paper, orientation, perPage: 0 };
        await sandbox.api.runExport('docx');
        assert.ok(downloaded, status);
        const autoZip = await JSZip.loadAsync(new Uint8Array(await downloaded.blob.arrayBuffer()));
        const autoXml = await autoZip.file('word/document.xml').async('string');
        const widths = [...autoXml.matchAll(/<wp:extent cx="(\d+)"/g)].map(match => Number(match[1]));
        assert.ok(widths.length > 0);
        assert.ok(widths.every(width => Math.abs(width - printableWidth * 36000) <= 1), 'Auto-sized ' + paper + ' ' + orientation + ' diagrams must fill the printable row width: ' + widths);
    }
    current = kept;
    const dangerous = [{ kind: 'diagram', category: 'Scales', key: 'C', pattern: 'id', name: 'Name', caption: '=HYPERLINK("bad")' }];
    assert.ok((await F.catalog('csv', dangerous, current).text()).includes("'="));
    assert.ok((await F.catalog('tsv', dangerous, current).text()).includes('\t'));
    const clone = { attrs: {}, setAttribute(name, value) { this.attrs[name] = value; } };
    globalThis.XMLSerializer = class { serializeToString(svg) { return '<svg ' + Object.entries(svg.attrs).map(([k,v]) => k + '="' + F.escape(v) + '"').join(' ') + '><path d="M0 0L1 1"/></svg>'; } };
    const decorated = F.decorateSvg({ cloneNode: () => clone }, { ...O.defaults(), padding: 10, borderStyle: 'dashed', borderColor: '#123456', borderWidth: 1, grayscale: true, transparent: true, rotateDiagram: true, diagramOpacity: 0.4 }, { width: 100, height: 25 });
    assert.ok(decorated.markup.includes('feColorMatrix'));
    assert.ok(decorated.markup.includes('stroke-dasharray="2 1"'));
    assert.ok(decorated.markup.includes('stroke="#123456"'));
    assert.ok(!decorated.markup.includes('width="100%" height="100%" fill='));
    assert.equal(clone.attrs.x, '2.5');
    assert.equal(clone.attrs.width, '95');
    assert.equal(clone.attrs.opacity, '0.4'); assert.ok(decorated.markup.includes('rotate(180 50 12.5)'));
    const overrides = O.rendererOverrides({ ...O.defaults(), fretNumbersPlacement: 'above', fretNumbersPosition: 'right', fretNumbersSize: 18, noteSize: 22, noteFontSize: 15, stringThickness: 3, fretThickness: 4, noteShape: 'diamond' });
    assert.deepEqual(overrides, { stringStyle: 'solid', stringEffect: 'none', fretStyle: 'solid', stringGradient: false, fretGradient: false, noteEffect: 'none', noteGradient: false, fretNumbersPlacement: 'above', fretNumbersPosition: 'right', fretNumbersSize: 18, noteSize: 22, noteFontSize: 15, stringThickness: 3, fretThickness: 4, noteShape: 'diamond' });
    assert.ok(sandbox.api.textStyle('body', current).line > 11 * 25.4 / 72 * 1.17);
    assert.equal(sandbox.api.textStyle('caption', current).color, '#aa0000');
    assert.equal(sandbox.api.textStyle('title', current).size, 19);
    assert.equal(sandbox.api.textStyle('caption', current).bold, true);
    assert.equal(sandbox.api.textStyle('body', current).italic, true);
    sandbox.FretboardBetaLayout = L; sandbox.confirm = () => true;
    const largeDownloads = [];
    sandbox.downloadBlob = (blob, filename) => largeDownloads.push({ blob, filename });
    choice[0].patterns = Array.from({ length: 2500 }, (_, i) => ({ id: 'scale-' + i, name: 'Scale ' + i }));
    for (const kind of ['pdf-single', 'docx', 'html']) {
        largeDownloads.length = 0;
        current = { ...O.defaults(), format: kind, perPage: 10, width: 100, height: 25 };
        await sandbox.api.runExport(kind);
        assert.equal(largeDownloads.length, 20, kind + ': ' + status);
        assert.ok(status.includes('5000 selected diagrams'), status);
        assert.ok(largeDownloads[0].filename.includes('-part-001'));
        assert.ok(largeDownloads[19].filename.includes('-part-020'));
        assert.ok(largeDownloads.every(file => file.blob.size > 100));
    }
    console.log('All 41 export branches, real DjVu codec, full-width Word sizing, and 5000-diagram PDF/DOCX/HTML jobs in 20 bounded document parts passed (page rasterization/image encoding mocked).');
})().catch(error => { console.error(error); process.exitCode = 1; });
