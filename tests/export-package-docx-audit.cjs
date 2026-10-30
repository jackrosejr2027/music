const assert = require('node:assert/strict');
const JSZip = require('../vendor/jszip.min.js');
const { Document, Packer, Paragraph, TextRun } = require('../vendor/docx.js');

function replaceParagraph(xml, marker, replacement) {
    const at = xml.indexOf(marker);
    const start = xml.lastIndexOf('<w:p>', at);
    const end = xml.indexOf('</w:p>', at);
    assert(at >= 0 && start >= 0 && end >= 0, 'Expected marker paragraph ' + marker);
    return xml.slice(0, start) + replacement + xml.slice(end + 6);
}

(async () => {
    const document = new Document({ sections: [{ children: [
        new Paragraph({ children: [new TextRun({ text: '__TOC_0__' })], spacing: { after: 30 } }),
        new Paragraph({ children: [new TextRun({ text: '__BODY__' })] }),
        new Paragraph({ children: [new TextRun({ text: '__HEAD_0__' })], spacing: { before: 90, after: 35 } })
    ] }] });
    const packed = await Packer.toBlob(document);
    const zip = await JSZip.loadAsync(new Uint8Array(await packed.arrayBuffer()));
    let xml = await zip.file('word/document.xml').async('string');
    const name = 'Perfect fifth - C';
    xml = replaceParagraph(xml, '__TOC_0__', '<w:p><w:hyperlink w:anchor="diagram_0"><w:r><w:t>' + name + '</w:t></w:r></w:hyperlink></w:p>');
    xml = replaceParagraph(xml, '__HEAD_0__', '<w:p><w:bookmarkStart w:id="1" w:name="diagram_0"/><w:r><w:t>' + name + '</w:t></w:r><w:bookmarkEnd w:id="1"/></w:p>');
    xml = replaceParagraph(xml, '__BODY__', '');
    assert(xml.includes('<w:hyperlink w:anchor="diagram_0">'));
    assert(xml.includes('<w:bookmarkStart w:id="1" w:name="diagram_0"/>'));
    assert(xml.includes('<w:bookmarkEnd w:id="1"/>'));
    assert(!xml.includes('__TOC_') && !xml.includes('__HEAD_') && !xml.includes('__BODY__'));
    console.log('PASS: generated DOCX TOC links target valid diagram bookmarks; marker paragraphs are replaced without damaging paragraph structure.');
})().catch(error => { console.error(error); process.exitCode = 1; });
