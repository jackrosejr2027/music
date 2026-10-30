/* Run from the project root: node tests/catalog-audit.cjs */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const read = path => fs.readFileSync(path, 'utf8');
const saved = new Map();
class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.dataset = {}; this.attributes = {}; this.events = {}; this.hidden = false; this.style = {}; this.value = ''; }
    append(...items) { this.children.push(...items); }
    appendChild(item) { this.append(item); return item; }
    setAttribute(name, value) { this.attributes[name] = value; }
    hasAttribute(name) { return name in this.attributes; }
    addEventListener(name, callback) { this.events[name] = callback; }
}
const descend = element => [element, ...element.children.flatMap(descend)];
function setup(blocked = false) {
    const nodes = new Map(['catalog-summary', 'catalog-message', 'catalog-search'].map(id => [id, new Element('div')]));
    const hosts = ['pages', 'assets'].map(kind => { const host = new Element('div'); host.dataset.catalog = kind; host.setAttribute('data-editable', ''); return host; });
    const expand = ['show', 'hide'].map(value => { const button = new Element('button'); button.dataset.catalogExpand = value; return button; });
    const viewOptions = ['default', 'custom'].map(value => { const input = new Element('input'); input.value = value; return input; });
    nodes.set('catalog-view-note', new Element('p'));
    const ready = [];
    const document = {
        currentScript: { src: 'https://offline.test/app/catalog-ui.js' },
        createElement: tag => new Element(tag),
        getElementById: id => nodes.get(id),
        querySelectorAll: selector => selector === '[data-catalog]' ? hosts : selector === 'input[name="app-view"]' ? viewOptions : expand,
        addEventListener: (name, callback) => { if (name === 'DOMContentLoaded') ready.push(callback); }
    };
    const context = vm.createContext({ document, localStorage: { getItem: key => { if (blocked) throw Error('blocked'); return saved.get(key); }, setItem: (key, value) => { if (blocked) throw Error('blocked'); saved.set(key, value); } }, URL, Event, console, dispatchEvent() {} });
    context.window = context;
    vm.runInContext(read('offline-assets.js'), context);
    vm.runInContext(read('project-catalog.js'), context);
    vm.runInContext(read('catalog-ui.js'), context);
    ready.forEach(callback => callback());
    return { context, catalog: context.APP_CATALOG, hosts, expand, nodes, viewOptions };
}
// The promoted fretboard is the single canonical entry with local dependencies.
const html = read('fretboard.html');
assert(html.includes('<title>Fretboard</title>'));
assert(!fs.existsSync('fretboard-testing.html'));
assert(!fs.existsSync('fretboard-testing'));
assert(!html.includes('fretboard-testing/'));
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!/^(https?:|data:)/.test(match[1])) assert(fs.existsSync(match[1]), 'Missing promoted dependency: ' + match[1]);
}
assert.equal((read('site.js').match(/href: 'fretboard.html'/g) || []).length,1);
assert(!read('site.js').includes('fretboard-testing'));
assert(read('site.js').includes("var VERSION = '1.0.1'"));
const app = setup();
const catalog = app.catalog;
assert.equal(catalog.pages.length, 55);
assert.equal(new Set(catalog.pages.map(page => page.path)).size, catalog.pages.length);
assert.deepEqual([...catalog.pages.map(page => page.path)].sort(), [...catalog.assets.filter(file => file.endsWith('.html'))].sort());
assert(catalog.assets.includes('home.css'));
assert(catalog.assets.includes('uploads/image.png'));
for (const page of catalog.pages) assert(page.features.length && page.features.every(feature => typeof feature === 'string' && feature.length));
for (const file of catalog.assets) assert(catalog.assetRole(file) && fs.existsSync(file));
const assetsBefore = [...catalog.assets];
assert(catalog.setVisible('fretboard.html', false));
assert(!catalog.isVisible('fretboard.html'));
for (const file of ['index.html', 'home.html', 'admin.html']) { catalog.setVisible(file, false); assert(catalog.isVisible(file)); }
assert.deepEqual([...catalog.assets], assetsBefore);
assert(!setup().catalog.isVisible('fretboard.html'), 'Page visibility must survive reload');
catalog.setVisible('fretboard.html', true);
const pageRows = descend(app.hosts[0]).filter(element => element.className === 'catalog-record');
assert.equal(pageRows.length, 55);
const assetRows = descend(app.hosts[1]).filter(element => element.className === 'catalog-record');
assert.equal(assetRows.length, catalog.assets.length);
const button = descend(pageRows.find(row => descend(row).some(element => element.textContent === 'Neck Diagram Explorer'))).find(element => element.tagName === 'button');
button.events.click(); assert(!catalog.isVisible('fretboard.html')); assert.equal(button.textContent, 'Show');
button.events.click(); assert(catalog.isVisible('fretboard.html'));
const assetRow = assetRows.find(row => descend(row).some(element => element.textContent === 'home.css'));
const assetButton = descend(assetRow).find(element => element.tagName === 'button');
const description = descend(assetRow).find(element => element.className === 'catalog-asset-description');
assetButton.events.click(); assert(description.hidden); assert.equal(assetButton.attributes['aria-expanded'], 'false');
assert(!setup().catalog.assetExpanded('home.css'));
assetButton.events.click(); assert(!description.hidden);
const search = app.nodes.get('catalog-search');
search.value = 'home.css'; search.events.input(); assert(!assetRow.hidden); assert(assetRows.some(row => row.hidden));
search.value = 'there-is-no-such-asset'; search.events.input(); assert([...pageRows, ...assetRows].every(row => row.hidden));
search.value = ''; search.events.input(); assert([...pageRows, ...assetRows].every(row => !row.hidden));
app.expand[1].events.click(); assert(app.hosts.every(host => host.children.every(group => !group.open)));
app.expand[0].events.click(); assert(app.hosts.every(host => host.children.every(group => group.open)));
const blocked = setup(true); assert.equal(blocked.catalog.setVisible('chords.html', false), false); assert(!blocked.catalog.isVisible('chords.html'));
saved.set('st_ui_visibility_v1', 'not-json'); assert(setup().catalog.isVisible('chords.html')); saved.clear();
for (const file of ['index.html', 'home.html']) {
    const html = read(file);
    assert(html.includes('id="home-admin-link"'));
    assert(html.includes('home-view.js'));
    assert(html.includes('id="home-content"'));
    assert(html.includes('project-catalog.js'));
}
assert.equal(read('index.html'), read('home.html'));
for (const file of ['admin.html', 'about.html', 'release-notes.html']) {
    const html = read(file); assert(html.includes('data-catalog="pages"') && html.includes('data-catalog="assets"'));
    assert(html.includes('project-catalog.js') && html.includes('offline-assets.js'));
}
// Exercise shared-header eligibility without changing pages or their cached assets.
const links = ['index.html', 'admin.html', 'scales.html', 'chords.html'].map(file => ({ href: 'https://offline.test/app/' + file, style: {} }));
const group = { style: {}, querySelectorAll: () => links.slice(2) };
const navContext = vm.createContext({ ST: { getJSON: () => ({ 'index.html': false, 'admin.html': false, 'scales.html': false, 'chords.html': false }) }, CACHE_SCOPE: new URL('https://offline.test/app/'), URL, document: { querySelectorAll: selector => selector === '.st-nav a[href]' ? links : [group] } });
// Default bypasses filters without destroying the Custom choices.
const modeApp = setup();
modeApp.catalog.setVisible('fretboard.html', false);
modeApp.catalog.setAssetExpanded('home.css', false);
modeApp.viewOptions[0].checked = true; modeApp.viewOptions[0].events.change();
assert.equal(modeApp.catalog.viewMode(), 'default');
assert(modeApp.catalog.isVisible('fretboard.html')); assert(modeApp.catalog.assetExpanded('home.css'));
assert.equal(setup().catalog.viewMode(), 'default');
assert(descend(modeApp.hosts[0]).filter(element => element.tagName === 'button').every(button => button.disabled));
modeApp.viewOptions[1].checked = true; modeApp.viewOptions[1].events.change();
assert.equal(modeApp.catalog.viewMode(), 'custom');
assert(!modeApp.catalog.isVisible('fretboard.html')); assert(!modeApp.catalog.assetExpanded('home.css'));
assert(!modeApp.catalog.setViewMode('invalid'));
function renderHome(mode) {
    const app = setup(); app.catalog.setViewMode(mode); app.catalog.setVisible('fretboard.html', false);
    const main = new Element('main');
    app.context.document.getElementById = () => main;
    app.context.document.currentScript.src = 'https://offline.test/app/home-view.js';
    app.context.addEventListener = () => {};
    app.context.location = { reload() {} };
    vm.runInContext(read('home-view.js'), app.context);
    return main;
}
const customHome = renderHome('custom');
assert(!descend(customHome).some(element => element.href === 'https://offline.test/app/fretboard.html'));
assert(descend(customHome).some(element => element.href === 'https://offline.test/app/chords.html'));
const defaultHome = renderHome('default');
assert(descend(defaultHome).some(element => element.className === 'home-hero'));
assert(descend(defaultHome).some(element => element.href === 'https://offline.test/app/fretboard.html'));
assert(descend(defaultHome).some(element => element.textContent === 'Play!'));
const site = read('site.js');
const start = site.indexOf('    function applyPageVisibility() {');
vm.runInContext(site.slice(start, site.indexOf("    window.addEventListener('storage'", start)) + ';applyPageVisibility();', navContext);
assert.equal(links[0].style.display, ''); assert.equal(links[1].style.display, '');
assert.equal(links[2].style.display, 'none'); assert.equal(links[3].style.display, 'none'); assert.equal(group.style.display, 'none');
navContext.ST.getJSON = () => ({ viewMode: 'default', 'scales.html': false, 'chords.html': false });
vm.runInContext('applyPageVisibility();', navContext);
assert.equal(links[2].style.display, ''); assert.equal(links[3].style.display, ''); assert.equal(group.style.display, '');
console.log('PASS: 55-page registry and every asset; Default/Custom Home rendering, persistence and saved-choice preservation; inventory rendering/search/group controls; non-destructive page visibility; protected routes; detail folding; reload persistence; blocked/corrupt storage; shared-header filtering.');
