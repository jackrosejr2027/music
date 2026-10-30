const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
vm.runInThisContext(fs.readFileSync('fretboard-beta-layout.js', 'utf8'));
const L = globalThis.FretboardBetaLayout;
const options = { orientation: 'landscape', perPage: 4, width: null, height: null, caption: '{name}' };
const diagram = (name = 'Example') => ({ kind: 'diagram', name, caption: name });
const heading = (level, text = level) => ({ kind: 'heading', level, text });
assert.equal(L.fillTemplate('{key} - {name} {unknown}', { key: 'C', name: 'Major' }), 'C - Major');
assert.deepEqual(L.parseTuning('e, a. d-g B E'), ['E', 'A', 'D', 'G', 'B', 'E']);
assert.deepEqual(L.parseTuning('bb F♯ c#'), ['Bb', 'F#', 'C#']);
for (const invalid of ['', 'E2 A2', 'H', Array(21).fill('E').join(' ')]) assert.throws(() => L.parseTuning(invalid));
assert.deepEqual(L.boxSize({ width: 100, height: null }, .25), { width: 100, height: 25 });
assert.deepEqual(L.boxSize({ width: null, height: 25 }, .25), { width: 100, height: 25 });
assert.deepEqual(L.boxSize({ width: 100, height: 50 }, .25), { width: 100, height: 50 });
function verify(pages, config, count) {
    assert.equal(pages.reduce((n, page) => n + page.items.filter(i => i.kind === 'diagram').length, 0), count);
    for (const page of pages) {
        assert.ok(page.scale > 0);
        assert.equal(page.items.at(-1).kind, 'diagram', 'No orphan headings');
        assert.ok(page.columns * config.width * page.scale + (page.columns - 1) * config.gap <= config.availableWidth + .0001);
        let height = 0;
        for (const block of L.blocks(page.items)) {
            if (block.kind === 'heading') height += block.height || L.HEADING_HEIGHT[block.level];
            else for (let i = 0; i < block.items.length; i += page.columns) height += config.height * page.scale + L.rowCaptionHeight(block.items.slice(i, i + page.columns), config, config.width * page.scale) + config.gap;
        }
        assert.ok(height <= config.availableHeight + .0001, 'Content exceeds page height: ' + height);
    }
}
const items = [heading('title'), heading('category'), heading('key'), ...Array.from({ length: 17 }, () => diagram())];
for (const orientation of ['landscape', 'portrait']) for (const perPage of [0, 1, 2, 4, 12, 24]) for (const size of [{}, { width: 400 }, { height: 400 }, { width: 10, height: 10 }, { width: 100, height: 50 }]) {
    const opts = { ...options, orientation, perPage, ...size };
    const config = L.layoutConfig(opts, .25);
    const pages = L.planPages(items, config, perPage);
    verify(pages, config, 17);
    if (perPage) assert.ok(pages.every(page => page.items.filter(item => item.kind === 'diagram').length <= perPage));
    if (config.explicitSize) pages.forEach(page => assert.ok(page.scale <= 1));
}
const config = L.layoutConfig({ ...options, perPage: 1 }, .25);
const grouped = L.planPages([diagram(), heading('category'), heading('key'), diagram()], config, 1);
assert.deepEqual(grouped[1].items.map(i => i.kind), ['heading', 'heading', 'diagram']);
const wrappedConfig = { ...config, captionLines: (text, width) => Array(Math.ceil(text.length / Math.max(1, Math.floor(width / 2)))).fill('text') };
const wrapped = [heading('title'), ...Array.from({ length: 7 }, () => diagram('A longer caption that wraps onto multiple lines of text.'))];
verify(L.planPages(wrapped, wrappedConfig, 4), wrappedConfig, 7);
assert.throws(() => L.planPages([{ kind: 'heading', level: 'title', height: 900 }, diagram()], config, 1), /no room/);
const docx = require('../vendor/docx.js');
const landscape = new docx.PageSize(11906, 16838, 'landscape');
assert.equal(landscape.root[0].root.width, 16838);
assert.equal(landscape.root[0].root.height, 11906);
const html = fs.readFileSync('index.html', 'utf8');
for (const id of ['orientation', 'per-page', 'image-width', 'image-height', 'start-fret', 'end-fret', 'tuning', 'tuning-preset', 'document-title', 'category-text', 'key-text', 'caption-text']) assert.ok(html.includes('id="beta-' + id + '"'));
assert.ok(html.indexOf('src="fretboard-beta-layout.js"') < html.indexOf('src="fretboard-word-beta.js"'));
console.log('Beta export layout audit passed.');
