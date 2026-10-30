const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const docx = require('../vendor/docx.js');
const { jsPDF } = require('../vendor/jspdf.umd.min.js');
const JSZip = require('../vendor/jszip.min.js');
vm.runInThisContext(fs.readFileSync('fretboard-beta-layout.js', 'utf8'));
const L = globalThis.FretboardBetaLayout;
vm.runInThisContext(fs.readFileSync('fretboard-beta-options.js', 'utf8'));
const source = fs.readFileSync('fretboard-word-beta.js', 'utf8');
const png = fs.readFileSync('icon-192.png');
const sandbox = {
    docx, window: { jspdf: { jsPDF } }, ...L,
    pdfFonts: { Arial: 'helvetica', 'Times New Roman': 'times', 'Courier New': 'courier' },
    checkCancel() {}, setStatus() {},
    headingStyles: { title: { size: 17, line: 7 }, category: { size: 14, line: 6 }, key: { size: 11, line: 4.5 }, subtitle: { size: 13, line: 5.5 }, author: { size: 10, line: 4.5 }, body: { size: 9, line: 4.3 } },
    measure: { measureText: text => ({ width: text.length * 5 }) },
    async renderItem(item, context) {
        context.done++;
        return { width: 1000, height: 250, bytes: new Uint8Array(png), dataUrl: 'data:image/png;base64,' + png.toString('base64') };
    }
};
vm.createContext(sandbox);
function loadFunction(name, nextName) {
    const start = source.indexOf('        function ' + name + '(') >= 0 ? source.indexOf('        function ' + name + '(') : source.indexOf('        async function ' + name + '(');
    const end = source.indexOf('        ' + nextName, start + 1);
    assert.ok(start >= 0 && end > start);
    vm.runInContext(source.slice(start, end), sandbox);
}
loadFunction('textStyle', 'function headingLines');
loadFunction('headingLines', 'function templateValues');
loadFunction('templateValues', 'function exportConfig');
loadFunction('exportConfig', 'function buildItems');
loadFunction('buildItems', 'function pageText');
loadFunction('pageText', 'function safeFilePart');
loadFunction('containedSize', 'function newPdf');
loadFunction('newPdf', 'async function addPdfPage');
loadFunction('addPdfPage', 'async function makeDocx');
loadFunction('makeDocx', 'function shrinkNote');
loadFunction('pdfSafeText', 'function downloadBlob');
vm.runInContext('globalThis.writers = { makeDocx, newPdf, addPdfPage, exportConfig, buildItems }', sandbox);
(async () => {
    for (const orientation of ['portrait', 'landscape']) {
        const options = { ...FretboardBetaOptions.defaults(), orientation, perPage: 2, width: 100, height: 25, caption: '{key} {name}', header: 'Header {page}/{pages}', footer: 'Footer {key}', pageNumbers: 'total', font: 'Courier New', textColor: '#123abc', title: 'Custom collection', subtitle: 'Subtitle text', author: 'Author text', introduction: 'Introduction text', categoryNote: 'Category note {category}', keyNote: 'Key note {key}' };
        const items = sandbox.writers.buildItems([{ id: 'scale', title: 'Scales', patterns: Array.from({ length: 3 }, (_, i) => ({ id: 'pattern-' + i, name: 'Example ' + i })) }], ['C'], { ...options, caption: 'My caption {name}' });
        const config = sandbox.writers.exportConfig(options, .25, items);
        const pages = L.planPages(items, config, options.perPage);
        const context = { options, done: 0 };
        const blob = await sandbox.writers.makeDocx(pages, config, context);
        assert.equal(context.done, 3);
        const zip = await JSZip.loadAsync(new Uint8Array(await blob.arrayBuffer()));
        const xml = await zip.file('word/document.xml').async('string');
        assert.ok(xml.includes('Custom collection'));
        assert.ok(xml.includes('My caption Example 2'));
        for (const text of ['Subtitle text', 'Author text', 'Introduction text', 'Category note Scales', 'Key note C']) assert.ok(xml.includes(text));
        assert.ok(xml.includes('Header 1/' + pages.length));
        assert.ok(xml.includes('Header 2/' + pages.length));
        assert.ok(xml.includes('Footer C'));
        assert.ok(xml.includes('Page 2 of ' + pages.length));
        assert.ok((await zip.file('word/styles.xml').async('string')).includes('123abc'));
        assert.ok(xml.includes('w:tblLayout w:type="fixed"'));
        assert.ok(xml.includes('w:pageBreakBefore'));
        const pageSize = xml.match(/<w:pgSz[^>]+>/)[0];
        assert.ok(pageSize.includes('w:w="' + (orientation === 'portrait' ? 11906 : 16838) + '"'), pageSize);
        assert.ok(pageSize.includes('w:h="' + (orientation === 'portrait' ? 16838 : 11906) + '"'), pageSize);
        assert.ok(zip.file(/word\/media\//).length > 0);
        context.done = 0;
        const pdf = sandbox.writers.newPdf({ ...options, title: 'Custom title' });
        for (let i = 0; i < pages.length; i++) {
            if (i) pdf.addPage('a4', orientation);
            await sandbox.writers.addPdfPage(pdf, pages[i], config, context, i, pages.length);
        }
        assert.equal(context.done, 3);
        assert.equal(pdf.getNumberOfPages(), pages.length);
        assert.ok(pdf.output('blob').size > 1000);
        assert.equal(pdf.internal.pageSize.getWidth() > pdf.internal.pageSize.getHeight(), orientation === 'landscape');
    }
    console.log('Beta DOCX/PDF writer audit passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
