const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const attributes = new Map();
const makeNode = () => ({
    children: [],
    setAttribute(name, value) { this.attributes ||= {}; this.attributes[name] = String(value); },
    appendChild(child) { this.children.push(child); },
    append(...children) { this.children.push(...children); }
});
const container = {
    clientWidth: 1000,
    scrollLeft: 0,
    children: [],
    replaceChildren() { this.children = []; },
    appendChild(child) { this.children.push(child); }
};
const context = vm.createContext({
    document: { getElementById: () => container, createElementNS: makeNode },
    window: { innerWidth: 1280, addEventListener() {} }
});
vm.runInContext(fs.readFileSync('fretboard.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('fretboard-draw.js', 'utf8'), context);
const Fretboard = vm.runInContext('Fretboard', context);
const board = new Fretboard('board', { scale: { major: { name: 'Major' } } });
board.drawFretboard = () => {};
board.drawNotes = () => {};
board.settings = { tuning: ['E', 'A', 'D', 'G', 'B', 'E'], startFret: 0, endFret: 12 };

for (const span of [2, 3, 12]) {
    board.settings.endFret = span;
    board.draw();
    const svg = container.children[0];
    const expectedWidth = span * 80 + 100 + 30;
    assert.equal(svg.attributes.width, String(expectedWidth), span + '-fret SVG width');
    assert.equal(svg.attributes.viewBox, '0 0 ' + expectedWidth + ' 250', span + '-fret viewBox');
    assert.match(svg.attributes.class, /fretboard-neck-svg/);
}

for (const span of [14, 18, 24]) {
    board.settings.startFret = 0; board.settings.endFret = span;
    container.scrollLeft = 400; board.draw();
    assert.match(container.children[0].attributes.class, /fretboard-fit-neck/);
    assert.equal(container.scrollLeft, 0, 'Fitted necks must not retain an old horizontal scroll offset');
    assert.equal(container.children[0].attributes.viewBox.split(' ')[2], String(span * 80 + 130), 'Native export geometry stays complete');
}
board.settings.startFret = 5; board.settings.endFret = 19; board.draw();
assert.match(container.children[0].attributes.class, /fretboard-fit-neck/, 'Fit depends on the displayed span, not the absolute end fret');
const css = fs.readFileSync('fretboard-page.css', 'utf8');
assert.match(css, /fretboard-fit-neck\{width:100%!important;max-width:100%!important;min-width:0!important;height:auto!important\}/);
assert.match(css, /fretboard-svg\.fretboard-neck-svg\{width:auto;height:auto;min-width:0;max-width:none\}/);
console.log('PASS: Short necks retain fixed fret spacing; 14-, 18-, and 24-fret views fit the container with full native export geometry.');
