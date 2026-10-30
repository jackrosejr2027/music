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

Element.prototype.remove = function() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); };
Element.prototype.insertBefore = function(child, before) { child.remove(); const index = this.children.indexOf(before); child.parentElement = this; this.children.splice(index < 0 ? this.children.length : index, 0, child); };
Element.prototype.addEventListener = function(type, handler) { (this.events ||= {})[type] = handler; };
Element.prototype.after = function(child) { this.parentElement.insertBefore(child, this.parentElement.children[this.parentElement.children.indexOf(this) + 1]); };
const stage = new Element('section');
const anchor = new Element('div', { id: 'current-pattern-display' }); stage.appendChild(anchor);
const context = vm.createContext({ App, document: {
    getElementById: id => nodes.get(id), createElement: tag => new Element(tag),
    querySelector: selector => selector === '.header-nav[data-consolidated]' ? {} : panel.querySelector(selector) || stage.querySelector(selector)
} });
vm.runInContext(fs.readFileSync('app-ui-bottom-instrument.js','utf8'), context);
const app = new App(); parse(app.getInstrumentFooterHtml());
const panel = nodes.get('instrument-footer');
function control(id) {
    const group = new Element('div', { class: 'control-group' });
    const label = new Element('label', { for: id });
    const input = new Element('select', { id });
    group.append(label, input); panel.appendChild(group); return input;
}
for (const id of ['diagram-count','diagram-editor','instrument-select','tuning-preset','flip-string-order','start-fret','end-fret','fretspan-presets']) control(id);
for (const id of ['active-diagram-strings-heading','additional-diagram-strings']) panel.appendChild(new Element('div', { id }));
const originalNodes = new Map(nodes);
app.organizeInstrumentControls();
const groups = {
    'diagram-count':'instrument-diagrams','diagram-editor':'instrument-diagrams',
    'instrument-select':'instrument-selected','tuning-preset':'instrument-selected','string-count':'instrument-selected','flip-string-order':'instrument-selected',
    'start-fret':'instrument-range','end-fret':'instrument-range','fretspan-presets':'instrument-range',
    'tuning-container':'instrument-strings','active-diagram-strings-heading':'instrument-strings','additional-diagram-strings':'instrument-other-strings'
};
for (const [id, group] of Object.entries(groups)) {
    assert.equal(nodes.get(id), originalNodes.get(id), 'Must preserve input identity');
    assert.equal(nodes.get(id).closest('.instrument-control-section').id, group, id);
}
assert.equal(nodes.get('diagram-instrument-controls').parentElement, stage);
assert.equal(stage.children[1].id, 'diagram-instrument-controls');
for (const id of ['instrument-selected', 'instrument-range']) assert.equal(nodes.get(id).parentElement.id, 'diagram-instrument-controls');
const count = nodes.get('string-count');
assert.equal(count.attrs.min, '1'); assert.equal(count.attrs.max, '20'); assert.equal(count.attrs.value, '6');
assert(nodes.get('instrument-diagrams-help').textContent.includes('All Keys links Type and Selection only'));
assert(nodes.get('instrument-range-help').textContent.includes('not tuning, visibility or the overall window'));
assert(nodes.get('instrument-strings-help').textContent.includes('not the string itself'));
const length = panel.children.length; app.organizeInstrumentControls(); assert.equal(panel.children.length, length);
// Build the complete fretspan option lists through the actual UI builders.
function options(path) {
    const list = [];
    const doc = { createElement: tag => {
        const element = new Element(tag);
        if (tag === 'select') { element.appendChild = option => { list.push(option.value); return option; }; element.insertBefore = element.appendChild; }
        return element;
    } };
    function TestApp() {}
    const sandbox = vm.createContext({ App: TestApp, document: doc, Option: function(text, value) { this.value = value; }, readAppStorage: () => '{}', console });
    vm.runInContext(fs.readFileSync(path,'utf8'), sandbox);
    new TestApp().setupFretspanUI({ insertBefore() {} }, {}); return list;
}
assert.deepEqual(options('app-instrument-fretspan.js'), options('tests/fixtures/pre-1.0.1/app-instrument-fretspan.js'));
const active = fs.readFileSync('app-instrument-tuning.js','utf8');
for (const field of ['tuning-select','show-string-notes','string-start-fret','string-end-fret']) assert(active.includes(field));
for (const relation of ['label.htmlFor =','checkboxLabel.htmlFor =','startFretLabel.htmlFor =','endFretLabel.htmlFor =']) assert(active.includes(relation));
console.log('PASS: Instrument task grouping, original control identities/count limits, every fretspan preset value, scope explanations, linked native per-string labels, repeated setup safety.');
