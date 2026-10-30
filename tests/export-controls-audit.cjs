const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map();
class Element {
    constructor() { this.style = {}; this.events = {}; this.value = ''; this.textContent = ''; this.attrs = {}; }
    set id(value) { this._id = value; nodes.set(value,this); } get id() { return this._id; }
    addEventListener(type, callback) { (this.events[type] ||= []).push(callback); }
    setAttribute(key,value) { this.attrs[key] = value; }
    insertAdjacentElement() {}
    remove() { nodes.delete(this.id); }
    querySelectorAll() { return this.buttons || []; }
    async fire(type) { for (const callback of this.events[type] || []) await callback({target:this}); }
}
function App() {}
const calls = [], alerts = [];
const Exporter = new Proxy({labelFields: () => ({})}, {get(target,key) { return target[key] || (async (...args) => { calls.push({key,args}); }); }});
const context = vm.createContext({App,Exporter,document:{getElementById:id=>nodes.get(id),createElement:()=>new Element()},alert:message=>alerts.push(message),console});
vm.runInContext(fs.readFileSync('app-ui-bottom-export.js','utf8'),context);
const app = new App();
const html = app.getExportFooterHtml();
for(const match of html.matchAll(/id="([^"]+)"/g)) { const element = new Element(); element.id = match[1]; }
const select = nodes.get('export-action-select'), button = nodes.get('export-play-button');
button.textContent = 'Create export';
const choices = [...html.slice(html.indexOf('<select'),html.indexOf('</select>')).matchAll(/<option value="([^"]+)"/g)].map(match=>match[1]);
const baseline = fs.readFileSync('tests/fixtures/pre-1.0.1/app-ui-bottom-export.js','utf8');
for(const match of baseline.slice(baseline.indexOf('<select'),baseline.indexOf('</select>')).matchAll(/<option value="([^"]+)"/g)) assert(choices.includes(match[1]),'Missing existing export action '+match[1]);
for(const match of baseline.matchAll(/id="([^"]+)"/g)) assert(nodes.has(match[1]),'Missing existing control '+match[1]);
assert.equal(new Set(choices).size,choices.length);
for(const action of choices) {
    const description = app.getExportActionDescription(action);
    assert(!description.startsWith('Choose an action'), 'Missing help for '+action);
    assert(description.length > 55);
}
assert(app.getExportActionDescription('all-keys-package').includes('37 files'));
assert(app.getExportActionDescription('pdf-current-all-keys').includes('12 pitch classes'));
assert(app.getExportActionDescription('save-all-patterns-circle-word-v2').includes('ZIP'));
assert(app.getExportActionDescription('save-scales-all-strings-zip').includes('default tunings'));
for(const key of ['instrument','tuning','key','type','name','formula']) assert(html.includes('data-label-field="'+key+'"'));
const legacy = nodes.get('export-legacy-buttons'); legacy.style.display='none';
legacy.buttons = [...html.slice(html.indexOf('id="export-legacy-buttons"')).matchAll(/<button id="([^"]+)"/g)].map(match=>nodes.get(match[1]));
vm.runInContext(fs.readFileSync('app-events-export-batch.js','utf8'),context);
app.exportAll=async()=>calls.push({key:'slideshow'});
app.exportCurrentDiagram=async()=>calls.push({key:'current-jpg'});
app.setupExportEventsBatch();
(async()=>{
    for(const action of choices) {
        select.value=action; await select.fire('change');
        assert.equal(nodes.get('export-action-help').textContent,app.getExportActionDescription(action));
        const count=calls.length; await button.fire('click');
        assert.equal(calls.length,count+1,'Exactly one existing dispatch for '+action);
        assert.equal(button.disabled,false); assert.equal(button.textContent,'Create export');
        assert(!nodes.has('export-stop-button'));
    }
    assert.equal(alerts.length,0);
    const toggle=nodes.get('export-legacy-show'); await toggle.fire('click');
    assert.equal(toggle.attrs['aria-expanded'],'true'); assert(legacy.buttons.every(button=>button.style.display===''));
    await toggle.fire('click'); assert.equal(toggle.attrs['aria-expanded'],'false'); assert(legacy.buttons.every(button=>button.style.display==='none'));
    console.log('PASS: '+choices.length+' export actions retained with unique values, descriptive scope help, unchanged dispatch, button reset/Stop cleanup, all label fields and legacy IDs, functional direct-button disclosure, all-string handler anchors.');
})().catch(error=>{console.error(error);process.exitCode=1;});
