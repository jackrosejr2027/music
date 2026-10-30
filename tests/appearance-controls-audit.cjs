const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map();
class Element {
    constructor(tag, attrs = {}) { this.tagName = tag; this.attrs = attrs; this.children = []; this.style = {}; this.className = attrs.class || ''; this.classList = { contains: name => this.className.split(/\s+/).includes(name), add: name => { this.className += ' ' + name; } }; if (attrs.id) nodes.set(attrs.id, this); }
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

Element.prototype.remove = function() { if(this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); };
Element.prototype.addEventListener = function(type, fn) { (this.events ||= {})[type] = fn; };
Element.prototype.querySelectorAll = function(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); };
const matches = Element.prototype.matches;
Element.prototype.matches = function(selector) { return selector.startsWith('#') ? this.id === selector.slice(1) : matches.call(this, selector); };
Object.defineProperty(Element.prototype,'innerHTML',{ set(html) { this.children = []; const fragment = parse(html); [...fragment.children].forEach(child => this.appendChild(child)); } });
const root = new Element('root');
const context = vm.createContext({ App, document: { getElementById: id => nodes.get(id), createElement: tag => new Element(tag), querySelector: selector => root.querySelector(selector) }, Event: function(type) { this.type = type; } });
for (const file of ['music-theory-data.js','app-ui-bottom-appearance.js','app-ui.js','app-ui-appearance.js','app-theory-info.js']) vm.runInContext(fs.readFileSync(''+file,'utf8'), context);
const app = new App(); app.musicTheory = vm.runInContext('MUSIC_THEORY_DATA', context);
const panelHtml = app.getAppearanceFooterHtml(); root.appendChild(parse(panelHtml));
root.appendChild(new Element('section', { class: 'fretboard-container' }));
Element.prototype.after = function(child) { this.parentElement.appendChild(child); };
app.updateFretboard = () => {};
app.addFretNumberOptions(); app.addNoteAppearanceOptions(); app.addStringAppearanceOptions(); app.addFretAppearanceOptions(); app.createCustomColorInputs();
const originalNodes = new Map(nodes);
const snapshots = new Map([...nodes].map(([id,node]) => [id, {attrs:JSON.stringify(node.attrs),options:node.tagName==='select'?node.children.map(option=>option.value||option.attrs.value):null}]));
app.organizeAppearanceControls();
for (const [id, node] of originalNodes) {
    assert.equal(nodes.get(id), node, 'Preserve control identity '+id);
    assert.equal(JSON.stringify(node.attrs), snapshots.get(id).attrs, 'Preserve numeric defaults/limits/types '+id);
    if (snapshots.get(id).options) assert.deepEqual(node.children.map(option=>option.value||option.attrs.value), snapshots.get(id).options, 'Preserve every option '+id);
}
const groups = { 'note-shape':'appearance-notes','string-height':'appearance-strings','string-thickness':'appearance-strings','fret-width':'appearance-frets','fret-thickness':'appearance-frets','fret-numbers-offset':'appearance-numbers','fret-markers-placement':'appearance-landmarks','custom-colors':'appearance-colors','force-white-background':'appearance-colors','toggle-info-button':'appearance-theory','export-include-info':'appearance-shortcuts' };
for (const [id, group] of Object.entries(groups)) assert.equal(nodes.get(id).closest('.appearance-control-section').id,group,id);
assert.equal(nodes.get('fret-numbers-offset').value,'-20');
const staticIds = [...fs.readFileSync('tests/fixtures/pre-1.0.1/app-ui-bottom-appearance.js','utf8').matchAll(/id="([^"]+)"/g)].map(match=>match[1]);
for (const id of staticIds) assert(nodes.has(id));
assert.equal(app.musicTheory.noteStyles.shapes.length,nodes.get('note-shape').children.length);
assert.equal(nodes.get('string-style').children.length,30);
let updates = 0; app.updateTheoryInfo = () => { updates++; }; app.titleVisible = true;
app.addTheoryInfoOptions();
const info = nodes.get('toggle-info-button'), title = nodes.get('toggle-title-button');
info.events.click(); assert.equal(app.infoVisible,true); assert.equal(info.attrs['aria-expanded'],'true');
title.events.click(); assert.equal(app.titleVisible,false); assert.equal(title.attrs['aria-pressed'],'false');
info.events.click(); assert.equal(app.infoVisible,false); assert.equal(updates,3);
for (const id of ['show-name','show-root','show-spelling','show-quality','show-tonic','show-dominant','show-modes','show-inversions','show-description','hide-about-section']) assert(nodes.get(id).className.includes('theory-info-checkbox'));
assert(nodes.get('theory-info-panel'));
console.log('PASS: all static/dynamic Appearance controls retained with original identities, limits, defaults and every option; shape/style inventories, grouping, working theory toggles and checkbox hooks, custom colors.');
