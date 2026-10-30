/* Run from the project root: node tests/offline-audit.cjs */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const origin = 'https://offline.test';
const appRoot = '/app/';
const source = file => fs.readFileSync(file, 'utf8');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const manifestContext = vm.createContext({ self: {} });
vm.runInContext(source('offline-assets.js'), manifestContext);
const manifest = manifestContext.self.ST_OFFLINE;
const runtimeFiles = walk('.').filter(file => !file.startsWith('tests/'));
const assetFiles = new Set(manifest.assets.map(asset => decodeURIComponent(asset === './' ? 'index.html' : asset)));
assert.deepEqual([...assetFiles].sort(), runtimeFiles.sort(), 'All shipped files must be in the shared manifest');
assert(source('site.js').includes(manifest.version + '-'), 'Runtime cache version must match');
const htmlFiles = runtimeFiles.filter(file => file.endsWith('.html'));
assert.equal(htmlFiles.length, 55);
const testData = vm.createContext({});
vm.runInContext(source('testing-data.js').replaceAll('export const ', 'const '), testData);
assert.deepEqual([...vm.runInContext('pages.map(page => page.path)', testData)].sort(), htmlFiles.sort());
for (const file of htmlFiles) {
    for (const tag of source(file).matchAll(/<(?:script|link|img|source|audio|video|iframe|a)\b[^>]*>/gi)) {
        for (const attribute of tag[0].matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
            const ref = attribute[1];
            if (/^(?:data:|blob:|mailto:|#)/.test(ref)) continue;
            if (/^https?:/.test(ref)) { assert(tag[0].startsWith('<a '), 'Remote runtime asset: ' + file); continue; }
            let target = path.normalize(path.join(path.dirname(file), decodeURIComponent(ref.split(/[?#]/)[0])));
            if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
            assert(assetFiles.has(target), 'Missing HTML dependency/link: ' + file + ': ' + ref);
        }
    }
}
for (const file of runtimeFiles.filter(file => file.endsWith('.css'))) {
    for (const match of source(file).matchAll(/url[(]["']?([^ )'";]+)/g)) {
        const ref = match[1];
        if (ref.startsWith('data:')) continue;
        assert(!/^https?:/.test(ref), 'Remote CSS dependency: ' + file + ': ' + ref);
        const target = path.normalize(path.join(path.dirname(file), decodeURIComponent(ref.split(/[?#]/)[0])));
        assert(assetFiles.has(target), 'Uncached CSS dependency: ' + file + ': ' + ref);
    }
}

function workerHarness(file, scopePath, failAsset = null) {
    const scope = origin + scopePath;
    const handlers = {}, stores = new Map();
    let online = true, networkCalls = 0;
    const key = input => new URL(typeof input === 'string' || input instanceof URL ? input : input.url, scope).href;
    const caches = {
        async open(name) {
            if (!stores.has(name)) stores.set(name, new Map());
            const entries = stores.get(name);
            return {
                async match(input, options = {}) {
                    const url = new URL(key(input));
                    if (options.ignoreSearch) url.search = '';
                    for (const [stored, response] of entries) {
                        const candidate = new URL(stored);
                        if (options.ignoreSearch) candidate.search = '';
                        if (candidate.href === url.href) return response.clone();
                    }
                },
                async put(input, response) { entries.set(key(input), response.clone()); },
                async add(input) { const response = await fetchFile(input); if (!response.ok) throw new Error('HTTP ' + response.status); entries.set(key(input), response.clone()); }
            };
        },
        async keys() { return [...stores.keys()]; },
        async delete(name) { return stores.delete(name); }
    };
    async function fetchFile(input) {
        networkCalls++;
        if (!online) throw new Error('Network disconnected');
        const url = new URL(key(input));
        let local = decodeURIComponent(url.pathname.slice(appRoot.length));
        if (!local || local.endsWith('/')) local += 'index.html';
        if (local === failAsset || !assetFiles.has(local)) return new Response('missing', { status: 404 });
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' };
        return new Response(fs.readFileSync(local), { headers: { 'Content-Type': types[path.extname(local)] || 'application/octet-stream' } });
    }
    const self = { registration: { scope }, location: new URL(file, origin + appRoot), clients: { claim: async () => {} }, skipWaiting: async () => {}, addEventListener: (name, callback) => { handlers[name] = callback; } };
    class ScopedRequest extends Request { constructor(input, options) { super(key(input), options); } }
    const context = vm.createContext({ self, caches, Request: ScopedRequest, Response, URL, fetch: fetchFile, setTimeout: callback => { callback(); }, console });
    context.importScripts = (...files) => files.forEach(ref => {
        const url = new URL(ref, self.location);
        vm.runInContext(source(decodeURIComponent(url.pathname.slice(appRoot.length))), context);
    });
    vm.runInContext(source(file), context);
    return {
        context, caches, stores,
        disconnect() { online = false; },
        networkCalls: () => networkCalls,
        async lifecycle(name) { let pending; handlers[name]({ waitUntil: promise => { pending = promise; } }); await pending; },
        async get(asset, mode = 'cors') {
            let pending;
            const url = new URL(asset, origin + appRoot).href;
            handlers.fetch({ request: { url, method: 'GET', mode, cache: 'default' }, respondWith: promise => { pending = promise; } });
            return pending ? await pending : null;
        }
    };
}

async function auditWorker(file, scopePath) {
    const harness = workerHarness(file, scopePath);
    await harness.lifecycle('install');
    await harness.lifecycle('activate');
    harness.disconnect();
    const calls = harness.networkCalls();
    for (const asset of manifest.assets) {
        const response = await harness.get(asset, asset.endsWith('.html') || asset === './' ? 'navigate' : 'cors');
        assert(response && response.ok, file + ' failed offline: ' + asset);
        const local = decodeURIComponent(asset === './' ? 'index.html' : asset);
        assert.deepEqual(Buffer.from(await response.arrayBuffer()), fs.readFileSync(local), file + ' served the wrong file: ' + asset);
    }
    for (const directory of ['cadence-map/', 'theory-cards/', 'theory-decks/', 'theory-decks/Fretboard%20Diagrams/']) {
        const response = await harness.get(directory + '?offline=1', 'navigate');
        assert(response.ok);
        assert.equal(await response.text(), source(decodeURIComponent(directory) + 'index.html'));
    }
    const queried = await harness.get('fretboard.html?key=F%23&pattern=minor', 'navigate');
    assert.equal(await queried.text(), source('fretboard.html'));
    assert.equal(harness.networkCalls(), calls, file + ' tried the network for a cached file');
    const unknown = await harness.get('not-in-package.html', 'navigate');
    assert.equal(unknown.status, 503, 'Unknown routes must not silently serve Home');
    const failed = workerHarness(file, scopePath, 'testing.js');
    await assert.rejects(() => failed.lifecycle('install'), /Offline install incomplete/);
    assert.equal(failed.stores.size, 0, 'Failed installation must remove its partial cache');
    return harness;
}

async function auditRootZip(harness) {
    const handlers = {}, packed = new Map();
    const button = { textContent: 'Download', addEventListener: (name, callback) => { handlers[name] = callback; } };
    const status = { classList: { toggle() {} } };
    let generated = false;
    class Zip {
        file(name, data) { packed.set(name, data); }
        async generateAsync() { generated = true; return new Blob(['zip']); }
    }
    const cache = await harness.caches.open(manifest.version + '-' + encodeURIComponent(appRoot));
    const wrappedCaches = {
        keys: () => harness.caches.keys(),
        open: async () => ({ match: async (...args) => { const response = await cache.match(...args); if (!response) return; return { text: () => response.text(), blob: async () => Buffer.from(await response.arrayBuffer()) }; } })
    };
    const fakeURL = class extends URL {};
    fakeURL.createObjectURL = () => 'blob:offline'; fakeURL.revokeObjectURL = () => {};
    const context = vm.createContext({
        document: {
            querySelectorAll: selector => selector === '.offline-package-button' ? [button] : [status],
            querySelector: () => ({ src: origin + appRoot + 'site.js' }),
            createElement: () => ({ style: {}, click() {}, remove() {} }), body: { appendChild() {} }
        },
        window: { JSZip: Zip, caches: wrappedCaches, ST: { cacheVersion: manifest.version + '-' + encodeURIComponent(appRoot) } },
        ST: { cacheVersion: manifest.version + '-' + encodeURIComponent(appRoot) },
        caches: wrappedCaches, JSZip: Zip, URL: fakeURL, Blob, location: { origin, href: origin + appRoot + 'release-notes.html' },
        setTimeout() {}, console
    });
    vm.runInContext(source('offline-package.js'), context);
    await handlers.click();
    assert(generated, 'ZIP must finish');
    for (const file of assetFiles) assert.deepEqual(packed.get(file), fs.readFileSync(file), 'ZIP dependency missing or changed: ' + file);
    assert(packed.has('OFFLINE-START-HERE.txt'));
    for (const name of packed.keys()) assert(!name.split('/').includes('..'), 'Unsafe archive path');
    // Test the Theory Decks manifest and its shared archive path mapping.
    manifestContext.self.location = new URL('https://offline.local/theory-decks/settings.html');
    manifestContext.URL = URL;
    vm.runInContext(source('theory-decks/offline-assets.js'), manifestContext);
    const nestedFiles = manifestContext.self.TD_OFFLINE.assets.map(asset => decodeURIComponent(new URL(asset, 'https://offline.local/theory-decks/').pathname.slice(1)));
    assert.deepEqual([...nestedFiles].sort(), [...assetFiles].sort());
    console.log('PASS: root ZIP includes every runtime file unchanged; Theory Decks archive paths cover the same complete package without ../ entries.');
}

async function auditNestedZip(harness) {
    const OFF = harness.context.self.TD_OFFLINE;
    const cache = await harness.caches.open(OFF.cache);
    let blob, feedback;
    const button = { textContent: 'Download', disabled: false };
    const FakeURL = class extends URL {};
    FakeURL.createObjectURL = value => { blob = value; return 'blob:offline'; };
    FakeURL.revokeObjectURL = () => {};
    const context = vm.createContext({
        OFF, KEYS: [], store: { get: () => null }, $: () => button,
        navigator: { onLine: false }, window: { caches: harness.caches },
        caches: { open: async () => ({ match: input => cache.match(new URL(input, origin + appRoot + 'theory-decks/settings.html'), { ignoreSearch: true }) }) },
        document: { createElement: () => ({ click() {}, remove() {} }), body: { appendChild() {} } },
        offMsg: text => { feedback = text; }, URL: FakeURL, Blob, TextEncoder, setTimeout() {}, console
    });
    const prefs = source('theory-decks/prefs.js');
    vm.runInContext(prefs.slice(prefs.indexOf('const CRC ='), prefs.indexOf("window.addEventListener('online'")), context);
    await button.onclick();
    assert(blob, 'Theory Decks ZIP failed: ' + feedback);
    const JSZip = require('../vendor/jszip.min.js');
    const zip = await JSZip.loadAsync(Buffer.from(await blob.arrayBuffer()));
    for (const file of assetFiles) {
        const entry = zip.file('Scales Thesaurus/' + file);
        assert(entry, 'Theory Decks ZIP missing: ' + file);
        assert.deepEqual(await entry.async('nodebuffer'), fs.readFileSync(file));
    }
    assert(Object.keys(zip.files).every(name => !name.split('/').includes('..')));
    assert(zip.file('Scales Thesaurus/OFFLINE-START-HERE.txt'));
    console.log('PASS: real Theory Decks ZIP generated disconnected, parsed with JSZip, and every app file verified byte-for-byte.');
}

async function auditStaticZip() {
    const JSZip = require('../vendor/jszip.min.js');
    const archivePath = 'local-version/offllinecodebbase.zip';
    const zip = await JSZip.loadAsync(fs.readFileSync(archivePath));
    const localManifest = await zip.file('offline-assets.js').async('string');
    const context = vm.createContext({ self: {} });
    vm.runInContext(localManifest, context);
    const localAssets = new Set(context.self.ST_OFFLINE.assets.map(asset => decodeURIComponent(asset === './' ? 'index.html' : asset)));
    const expected = [...assetFiles].filter(file => file !== archivePath);
    assert.deepEqual([...localAssets].sort(), expected.sort(), 'Local archive manifest must cover every included runtime file');
    for (const file of expected) {
        const entry = zip.file(file);
        assert(entry, 'Static ZIP missing: ' + file);
        if (file !== 'offline-assets.js' && file !== 'home.html') {
            assert.deepEqual(await entry.async('nodebuffer'), fs.readFileSync(file), 'Stale static ZIP file: ' + file);
        }
    }
    const home = await zip.file('home.html').async('string');
    assert(!home.includes('href="' + archivePath + '"'), 'Extracted app must not link to an omitted recursive archive');
    assert(!zip.file(archivePath), 'Static ZIP must not contain itself');
    console.log('PASS: complete static download ZIP; all local dependencies and non-recursive manifest verified.');
}

(async () => {
    await auditStaticZip();
    const root = await auditWorker('sw.js', appRoot);
    const nested = await auditWorker('theory-decks/service-worker.js', appRoot + 'theory-decks/');
    await auditRootZip(root);
    await auditNestedZip(nested);
    // Verify diagnostics still recognize the shared manifest with all networking disabled.
    const context = vm.createContext({ window: { caches: root.caches, ST: { cacheVersion: manifest.version + '-' + encodeURIComponent(appRoot) } }, ST: { cacheVersion: manifest.version + '-' + encodeURIComponent(appRoot) }, caches: root.caches, document: { querySelector: () => ({ src: origin + appRoot + 'site.js' }) }, location: { href: origin + appRoot + 'fretboard.html' }, URL });
    vm.runInContext(source('diagnostics-tests-release.js'), context);
    for (const id of [31, 32, 33, 36, 37, 51, 64]) {
        const test = context.window.DIAGNOSTICS_TESTS.find(test => test.id === id);
        const result = await test.run();
        assert(result.ok, test.name + ': ' + result.detail);
    }
    console.log('PASS: ' + htmlFiles.length + ' pages, ' + assetFiles.size + ' runtime files, local fonts, both worker installs, disconnected cache responses byte-for-byte, directory/query routes, failed-install rollback and offline diagnostics.');
})().catch(error => { console.error(error); process.exitCode = 1; });
