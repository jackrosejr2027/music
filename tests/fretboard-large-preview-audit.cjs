const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const JSZip = require('../vendor/jszip.min.js');
const { performance } = require('node:perf_hooks');
const context = vm.createContext({ console, performance, Blob, TextEncoder, Uint8Array, Uint32Array, DataView, JSZip, setTimeout, clearTimeout, window: {}, localStorage: { getItem() { return null; } } });
for (const path of ['music-theory-data.js', 'scales-data-standard.js', 'music-theory.js', 'fretboard-beta-layout.js', 'fretboard-beta-stream.js']) vm.runInContext(fs.readFileSync(path, 'utf8'), context);
const theory = vm.runInContext('new MusicTheory()', context);
const families = { major: 7, pentatonic_major: 5, pentatonic_minor: 5, major_blues: 6, minor_blues: 6, hirajoshi: 5, melodic_minor: 7, harmonic_minor: 7, harmonic_major: 7 };
const modes = Object.entries(theory.scales).filter(([, scale]) => scale.parentScale);
assert.equal(modes.length, 55);
for (const [family, length] of Object.entries(families)) {
    const base = theory.scales[family + '_mode_1'].intervals.map(interval => theory.getIntervalSemitones(interval));
    for (let mode = 0; mode < length; mode++) {
        const id = family + '_mode_' + (mode + 1), scale = theory.scales[id];
        const expected = base.map((_, step) => (base[(mode + step) % length] - base[mode] + 12) % 12);
        assert.deepEqual([...scale.intervals.map(interval => theory.getIntervalSemitones(interval))], [...expected], id);
        for (const key of theory.notes) assert.equal(new Set(theory.getScaleNotes(key, id).map(note => theory.toSharp(note))).size, length, key + ' ' + id);
    }
}
const L = context.FretboardBetaLayout;
const timings = [];
const batchFixture = L.planPages(Array.from({ length: 5000 }, () => ({ kind: 'diagram', caption: '' })), L.layoutConfig({ orientation: 'landscape', columns: 1, caption: '', width: 100, height: 25 }, .25), 10);
const batches = L.batchPages(batchFixture);
assert.equal(batches.length, 20);
assert.ok(batches.every(batch => batch.reduce((count, page) => count + page.items.length, 0) <= 250));
for (const count of [300, 501, 5000]) {
    const items = Array.from({ length: count }, (_, i) => ({ kind: 'diagram', name: 'Diagram ' + i, caption: 'C - Diagram ' + i }));
    for (const columns of [0, 1, 2]) for (const perPage of [0, 12, 24]) {
        const config = L.layoutConfig({ orientation: 'landscape', columns, caption: '{name}', width: 75, height: 20 }, .25);
        const start = performance.now();
        const pages = L.planPages(items, config, perPage);
        timings.push(performance.now() - start);
        assert.equal(pages.reduce((sum, page) => sum + page.items.length, 0), count);
        for (const page of pages) assert.ok(L.contentHeight(page.items, config, page.columns, page.scale) <= config.availableHeight + 1e-6);
    }
}
const previewSource = fs.readFileSync('fretboard-beta-preview.js', 'utf8').replace('{ mount, apply, refresh };', '{ mount, apply, refresh, edits, setItems(items) { currentItems = items; }, move };');
vm.runInContext(previewSource, context);
const P = context.FretboardBetaPreview;
const api = { headingLines: text => text.split('\n'), textStyle: () => ({ line: 3 }), pageWidth: 200 };
const source = [{ kind: 'heading', level: 'title', text: 'Original', lines: ['Original'], height: 13 }, ...['major', 'dorian', 'lydian'].map(pattern => ({ kind: 'diagram', typeId: 'scale', pattern, key: 'C', caption: pattern }))];
let edited = P.apply(source, {}, api);
P.edits.set(edited[0].editorId, { text: 'New title\nSecond line' });
P.edits.set(edited[1].editorId, { text: '' });
P.edits.set(edited[2].editorId, { removed: true });
edited = P.apply(source, {}, api);
assert.equal(edited[0].text, 'New title\nSecond line');
assert.equal(edited[1].caption, ''); assert.equal(edited.length, 3);
P.setItems(edited); P.move(edited[2].editorId, edited[1].editorId);
assert.deepEqual([...P.apply(source, {}, api).filter(item => item.kind === 'diagram').map(item => item.pattern)], ['lydian', 'major']);
assert.equal(source[0].text, 'Original', 'Editing does not mutate source data');
(async () => {
    const Archive = context.FretboardBetaStream.Archive;
    const pieces = []; let closed = false, aborted = false;
    const disk = new Archive({ async write(bytes) { pieces.push(bytes); }, async close() { closed = true; }, async abort() { aborted = true; } }, '5000.zip', () => assert.fail('Disk mode should not download blobs'));
    for (let i = 0; i < 5000; i++) {
        disk.file('Scales/' + i + '-C.svg', '<svg>' + i + '</svg>'); await disk.flush();
        assert.equal(disk.pending.length, 0, 'No diagram payloads retained after flushing');
    }
    disk.file('settings.json', '{"test":true}');
    assert.equal(await disk.generateAsync({}), null); assert.ok(closed);
    const zip = await JSZip.loadAsync(Buffer.concat(pieces.map(bytes => Buffer.from(bytes))), { checkCRC32: true });
    assert.equal(Object.values(zip.files).filter(file => !file.dir).length, 5001);
    assert.equal(await zip.file('Scales/4999-C.svg').async('string'), '<svg>4999</svg>');
    await disk.abort(); assert.equal(aborted, false, 'Never abort a completed save');
    const downloads = [];
    const memory = new Archive(null, 'collection.zip', (blob, name) => downloads.push({ blob, name }));
    for (let i = 0; i < 501; i++) { memory.file(i + '.svg', String(i)); await memory.flush(); }
    await memory.generateAsync({});
    assert.deepEqual(downloads.map(file => file.name), ['collection-part-001.zip', 'collection-part-002.zip', 'collection-part-003.zip']);
    const counts = [];
    for (const file of downloads) { const part = await JSZip.loadAsync(new Uint8Array(await file.blob.arrayBuffer()), { checkCRC32: true }); counts.push(Object.values(part.files).filter(entry => !entry.dir).length); }
    assert.deepEqual(counts, [250, 250, 1]);
    let cancelled = false;
    const incomplete = new Archive({ async write() {}, async abort() { cancelled = true; } }, 'cancel.zip', () => {});
    incomplete.file('one.svg', 'test');
    await assert.rejects(incomplete.flush(() => { throw new Error('cancelled'); }), /cancelled/);
    await incomplete.abort(); assert.ok(cancelled);
    console.log('PASS: 55 modes in all 12 keys; preview edit/remove/reorder; 300/501/5000-diagram pagination (worst ' + Math.ceil(Math.max(...timings)) + ' ms); 5000-entry streamed ZIP CRC validation; 250-file fallback parts; cancellation. Diagram rendering is not benchmarked.');
})().catch(error => { console.error(error); process.exitCode = 1; });
