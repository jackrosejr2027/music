const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map();
class Element {
    constructor(tag, attrs = {}) { this.tagName = tag; this.attrs = attrs; this.children = []; this.style = {}; this.className = attrs.class || ''; this.classList = { add: name => { this.className += ' ' + name; } }; if (attrs.id) nodes.set(attrs.id, this); }
    set id(value) { this.attrs.id = value; nodes.set(value, this); } get id() { return this.attrs.id; }
    set textContent(value) { this.text = value; this.children = []; } get textContent() { return this.text || ''; }
    setAttribute(name, value) { this.attrs[name] = value; }
    appendChild(child) { if (child.parentElement) child.parentElement.children = child.parentElement.children.filter(node => node !== child); child.parentElement = this; this.children.push(child); return child; }
    append(...children) { children.forEach(child => this.appendChild(child)); }
    matches(selector) { const label = selector.match(/^label\[for="([^"]+)"\]$/); return label ? this.tagName === 'label' && this.attrs.for === label[1] : selector.startsWith('.') ? this.className.split(/\s+/).includes(selector.slice(1)) : this.tagName === selector; }
    closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector); }
    querySelector(selector) { for (const child of this.children) { if (child.matches(selector)) return child; const nested = child.querySelector(selector); if (nested) return nested; } return null; }
}
function parse(html) {
    const root = new Element('root'), stack = [root];
    for (const token of html.matchAll(/<!--[\s\S]*?-->|<\/?[a-z][^>]*>/gi)) {
        const tag = token[0]; if (tag.startsWith('<!--')) continue;
        if (tag.startsWith('</')) { stack.pop(); continue; }
        const name = tag.match(/^<([a-z0-9-]+)/i)[1]; const attrs = {};
        for (const attr of tag.matchAll(/([a-z][a-z0-9-]*)="([^"]*)"/gi)) attrs[attr[1]] = attr[2];
        const element = new Element(name, attrs); stack[stack.length - 1].appendChild(element);
        if (!['input','br','hr','img'].includes(name)) stack.push(element);
    }
    return root;
}
function App() {}
const context = vm.createContext({ App, document: { getElementById: id => nodes.get(id), createElement: tag => new Element(tag) }, Set });
vm.runInContext(fs.readFileSync('app-ui-bottom-controls.js','utf8'), context);
const app = new App();
const html = app.getBottomControlsHtml(); parse(html);
const controls = new Map([...nodes].map(([id, node]) => [id, { node, attrs: { ...node.attrs }, options: node.tagName === 'select' ? node.children.map(option => option.attrs.value) : null }]));
const baselineContext = vm.createContext({ App: function Original() {} });
vm.runInContext(fs.readFileSync('tests/fixtures/pre-1.0.1/app-ui-bottom-controls.js','utf8'), baselineContext);
const baseline = vm.runInContext('new App().getBottomControlsHtml()', baselineContext);
for (const match of baseline.matchAll(/id="([^"]+)"/g)) assert(controls.has(match[1]), 'Missing original control: ' + match[1]);
app.organizeBoardControls();
for (const [id, before] of controls) {
    assert.equal(nodes.get(id), before.node, 'Must reuse control node ' + id);
    for (const attr of ['value','min','max','step','accept','type']) assert.equal(nodes.get(id).attrs[attr], before.attrs[attr], id + ': ' + attr);
    if (before.options) assert.deepEqual(nodes.get(id).children.map(option => option.attrs.value), before.options, id + ': options');
}
const groups = {
    'display-mode': 'board-display', 'capo-enable': 'board-display', 'show-fret-numbers': 'board-display',
    'melodic-pattern-select': 'board-melody', 'cof-duration': 'board-key-loops',
    'play-slideshow': 'board-slideshow', 'slideshow-bpm': 'board-slideshow', 'slideshow-duration': 'board-slideshow',
    'export-all': 'board-slideshow-files', 'export-diagrams-only': 'board-slideshow-files', 'import-slideshow-csv': 'board-slideshow-files',
    'chromatic-tuner-toggle': 'board-reference', 'page-theme': 'board-page-style', 'color-theme': 'board-page-style'
};
for (const [id, section] of Object.entries(groups)) assert.equal(nodes.get(id).closest('.board-control-section').id, section);
assert(nodes.get('play-slideshow').textContent.includes('slideshow'));
assert(nodes.get('export-slideshow-pdf').textContent.includes('PDF'));
assert(nodes.get('custom-pattern-import-group').attrs.style.includes('display: none'));
assert(nodes.get('pause-slideshow').attrs.style.includes('display:none'));
assert(nodes.get('board-pattern-cycle-help').textContent.includes('Replace the slideshow'));
assert(nodes.get('board-reference-help').textContent.includes('microphone'));
assert(nodes.get('board-melody-help').textContent.includes('Diagram 1'));
const sectionCount = nodes.get('controls-bottom').children.length; app.organizeBoardControls(); assert.equal(nodes.get('controls-bottom').children.length, sectionCount);
assert(fs.readFileSync('app-ui-pattern-actions.js','utf8').includes("getElementById('board-pattern-cycle')"));
assert(fs.readFileSync('app-media.js','utf8').includes("getElementById('board-reference')"));
console.log('PASS: every original control ID retained; same node identities, selector options, numeric limits/defaults and file types; task grouping, explicit action labels, conditional visibility, dynamic cycle/piano placement, idempotent setup.');
