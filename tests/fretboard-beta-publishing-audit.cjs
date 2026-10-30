const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
globalThis.JSZip = require('../vendor/jszip.min.js');
globalThis.XLSX = require('../vendor/xlsx.full.min.js');
for (const file of ['fretboard-beta-layout.js','fretboard-beta-advanced-schema.js','fretboard-beta-binary.js','fretboard-beta-book-packages.js','fretboard-beta-publishing.js','fretboard-beta-options.js','fretboard-beta-advanced.js','fretboard-beta-extra-formats.js','fretboard-beta-formats.js','fretboard-beta-config.js','fretboard-beta-guides.js']) vm.runInThisContext(fs.readFileSync(file,'utf8'));
const P = FretboardBetaPublishing, B = FretboardBetaBinary, O = FretboardBetaOptions, G = FretboardBetaGuides;
assert.equal(P.formats.length,17);
assert.equal(new Set([...P.catalogKinds,...P.markupKinds,...P.pagedKinds]).size,17);
for (const [format] of P.formats) {
    const options = O.validate({...O.defaults(),format});
    assert.equal(options.format,format);
    const saved = FretboardBetaConfig.validateConfiguration({name:format,keys:['C'],patterns:{scale:['major']},options});
    assert.equal(saved.options.format,format);
}
const studio = fs.readFileSync('fretboard-beta-studio.js','utf8');
const groups = vm.runInThisContext(studio.match(/const formatGroups = ([\s\S]*?);/)[1]);
const grouped = groups.flatMap(([,ids]) => ids);
assert.equal(grouped.length,41); assert.equal(new Set(grouped).size,41);
for (const [id] of FretboardBetaFormats.formats) assert.ok(grouped.includes(id));
assert.equal(G.guides.length,10);
assert.deepEqual(G.guides.map(([id]) => id),['selection','layout','text','saved','content','layers','watermark','packaging','tables','reader']);
class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.dataset = {}; }
    append(...children) { this.children.push(...children); }
}
globalThis.document = {createElement:tag => new Element(tag)};
const mounted = G.mount();
for (let i = 0; i < mounted.length; i++) {
    const [id,title,[article]] = mounted[i];
    assert.equal(id,G.guides[i][0]+'-about'); assert.ok(title.endsWith(' (About)'));
    assert.equal(article.children[1].dataset.betaSettings,G.guides[i][0]);
    assert.equal(article.children.filter(node => node.tagName === 'section').length,5);
    const text = G.guides[i][2].map(([,text]) => text).join(' ');
    assert.ok(text.split(/\s+/).length >= 180,title+' must be in depth');
}
assert.ok(studio.includes('...FretboardBetaGuides.mount()'));
assert.ok(studio.includes('card.open = false'));
assert.ok(studio.includes('panels[next].tab.focus()'));
assert.ok(studio.includes('panels[index].tab.scrollIntoView'));
const image = {width:2,height:2,data:new Uint8ClampedArray([255,0,0,255,0,255,0,255,0,0,255,255,0,0,0,0])};
assert.deepEqual([...B.rgb(image)],[255,0,0,0,255,0,0,0,255,255,255,255]);
const bmp = B.bmp(image,200), view = new DataView(bmp.buffer);
assert.equal(bmp.length,70); assert.equal(view.getUint32(10,true),54); assert.equal(view.getInt32(22,true),2);
assert.deepEqual([...bmp.slice(54,60)],[255,0,0,255,255,255]);
assert.deepEqual([...bmp.slice(62,68)],[0,0,255,0,255,0]);
const item = {kind:'diagram',category:'Scales',key:'C',pattern:'major',name:'Major',caption:'C · Major',intervals:'1 3 5'};
assert.throws(() => P.catalog('dbf',[{...item,name:'♭'}],O.defaults()),/Latin-1/);
assert.throws(() => P.catalog('dbf',[{...item,name:'x'.repeat(255)}],O.defaults()),/254/);
(async () => {
    const tif = B.tiff([image,image],200), bytes = new Uint8Array(await tif.arrayBuffer()), v = new DataView(bytes.buffer);
    assert.equal(v.getUint32(4,true),8);
    const firstCount = v.getUint16(8,true), next = v.getUint32(10+firstCount*12,true);
    assert.ok(next>8); assert.equal(v.getUint32(next+2+v.getUint16(next,true)*12,true),0);
    const ppm = B.pnm(image); assert.ok((await ppm.text()).startsWith('P6\n2 2\n255\n'));
    const tar = await B.tar([['example.txt',new Blob(['Test'])]],() => {}), tarBytes = new Uint8Array(await tar.arrayBuffer());
    assert.equal(tarBytes.length,2048); assert.equal(await tar.slice(512,516).text(),'Test');
    const stored = parseInt(await tar.slice(148,154).text(),8); tarBytes.fill(32,148,156);
    assert.equal(stored,tarBytes.slice(0,512).reduce((a,b) => a+b,0));
    const workbook = XLSX.read(new Uint8Array(await P.catalog('dbf',[item],O.defaults()).arrayBuffer()),{type:'array'});
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{header:1}); assert.equal(rows[1][5],'C · Major');
    let terminated = false;
    const oldDjvu = globalThis.DjVu;
    globalThis.DjVu = {Worker:class{constructor(){this.worker={addEventListener(){}};} startMultiPageDocument(){return Promise.reject(new Error('Encoder error'));} terminate(){terminated=true;}}};
    globalThis.document.baseURI = 'https://example.test/';
    await assert.rejects(P.paged('djvu',[],{}, {options:O.defaults()}, {checkCancel(){}}),/Encoder error/);
    assert.ok(terminated,'Failed DjVu jobs must terminate their worker'); globalThis.DjVu=oldDjvu;
    let checked = 0;
    await assert.rejects(P.paged('epub',[{}],{}, {options:O.defaults()}, {checkCancel(){if(++checked)throw new Error('Cancelled');}}),/Cancelled/);
    if (process.env.EXPORT_AUDIT_OUTPUT) {
        fs.mkdirSync(process.env.EXPORT_AUDIT_OUTPUT,{recursive:true});
        for (const [name,blob] of [['pixels.bmp',new Blob([bmp])],['pixels.ppm',ppm],['pixels.tiff',tif],['pixels.tar',tar]]) fs.writeFileSync(path.join(process.env.EXPORT_AUDIT_OUTPUT,name),Buffer.from(await blob.arrayBuffer()));
    }
    console.log('PASS: Ten in-depth About tabs, 17 format registrations/setup persistence, 41 grouped choices, RGB/BMP/PNM/TIFF/TAR bytes, DBF round-trip/limits and worker cleanup/cancellation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
