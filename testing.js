import { pages, commonSteps } from './testing-data.js';

const storageKey = 'st_page_testing_v1';
const allowedResults = ['untested', 'pass', 'fail', 'blocked'];
let records = {};
try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) records = saved;
} catch { /* Testing remains usable when device storage is unavailable. */ }
const reports = new Map();
const cards = new Map();
let running = false;
const list = document.getElementById('testing-pages');
const overview = document.getElementById('testing-overview');
const message = document.getElementById('testing-message');
const runButton = document.getElementById('run-source-checks');
const stepsFor = page => [...page.steps, ...commonSteps];
const resultFor = (page, index) => {
    const result = records[page.path]?.results?.[index];
    return allowedResults.includes(result) ? result : 'untested';
};
const notesFor = page => typeof records[page.path]?.notes === 'string' ? records[page.path].notes : '';

function saveRecord(page, update) {
    const current = records[page.path];
    records[page.path] = { results: {}, notes: '', ...(current && typeof current === 'object' ? current : {}), ...update, updated: new Date().toISOString() };
    try { localStorage.setItem(storageKey, JSON.stringify(records)); }
    catch { message.textContent = 'Device storage is unavailable. Results work for this visit but may not survive a reload.'; }
}

function updateOverview() {
    const counts = { pass: 0, fail: 0, blocked: 0, untested: 0 };
    pages.forEach(page => {
        stepsFor(page).forEach((_, index) => counts[resultFor(page, index)]++);
        const done = stepsFor(page).filter((_, index) => resultFor(page, index) !== 'untested').length;
        const failed = stepsFor(page).filter((_, index) => resultFor(page, index) === 'fail').length;
        const report = reports.get(page.path);
        const source = !report ? 'Source not checked' : report.some(item => !item.ok) ? 'Source issues found' : 'Source checks passed';
        cards.get(page.path).badge.textContent = done + '/' + stepsFor(page).length + ' manual' + (failed ? ' / ' + failed + ' failed' : '') + ' | ' + source;
    });
    overview.textContent = pages.length + ' pages | Manual: ' + counts.pass + ' passed, ' + counts.fail + ' failed, ' + counts.blocked + ' blocked, ' + counts.untested + ' not tested | Source: ' + reports.size + '/' + pages.length + ' checked';
}

function feedbackFor(page) {
    const steps = stepsFor(page);
    const issues = steps.map((test, index) => ({ ...test, index, result: resultFor(page, index) })).filter(test => test.result === 'fail' || test.result === 'blocked');
    const tested = steps.filter((_, index) => resultFor(page, index) !== 'untested').length;
    const lines = [
        'Please investigate and make the smallest correct changes to this page.',
        'Page: ' + page.name + ' (' + page.path + ')',
        'URL: ' + new URL(page.path, document.baseURI).href,
        'Report generated: ' + new Date().toISOString(),
        'Browser: ' + navigator.userAgent,
        'Viewport: ' + window.innerWidth + ' x ' + window.innerHeight,
        'Manual coverage: ' + tested + '/' + steps.length + ' steps recorded. Untested steps are not passes.',
        '', 'Failed or blocked manual steps:'
    ];
    if (!issues.length) lines.push('None recorded. Describe the requested change or observed problem in the notes below.');
    issues.forEach(test => lines.push('Step ' + (test.index + 1) + ' [' + test.result.toUpperCase() + ']', 'Reproduce: ' + test.action, 'Expected: ' + test.expected));
    lines.push('', 'Source checks (not functional testing):');
    const report = reports.get(page.path);
    if (!report) lines.push('Not run.');
    else report.forEach(item => lines.push((item.ok ? 'PASS' : 'FAIL') + ': ' + item.name + ' - ' + item.detail));
    lines.push('', 'Observed behavior / reproduction details / requested change:', notesFor(page) || '[Add what happened, exact settings/inputs, frequency, screenshots or console errors, and the desired change.]', '',
        'Preserve existing features, appearance, independent diagram settings and unrelated saved data. Do not reset user data to make the test pass.',
        'Reproduce the reported issue, fix its cause, repeat the affected script and relevant regression checks, and report what was verified. Do not treat source checks as proof of interaction, audio, export or layout behavior.');
    return lines.join('\n');
}

function updatePrompt(page) {
    const textarea = cards.get(page.path).content?.querySelector('.test-prompt');
    if (textarea) textarea.value = feedbackFor(page);
}

function renderSourceReport(page) {
    const target = cards.get(page.path).content?.querySelector('.test-source-results');
    if (!target) return;
    target.replaceChildren();
    const report = reports.get(page.path);
    (report || [{ ok: null, name: 'Not run', detail: 'Read-only checks do not execute this page or test interactions.' }]).forEach(item => {
        const row = document.createElement('li');
        row.dataset.result = item.ok === false ? 'fail' : 'pass';
        row.textContent = (item.ok === null ? '' : item.ok ? 'PASS: ' : 'FAIL: ') + item.name + ' - ' + item.detail;
        target.appendChild(row);
    });
    updatePrompt(page);
}

function buildContent(page, pageIndex) {
    const card = cards.get(page.path);
    if (card.content) return;
    const content = document.createElement('div');
    content.className = 'test-page-content';
    card.content = content;
    const actions = document.createElement('div');
    actions.className = 'test-page-actions';
    const open = document.createElement('a');
    open.className = 'test-page-link'; open.textContent = 'Open page';
    open.href = page.path; open.target = '_blank'; open.rel = 'noopener';
    const check = document.createElement('button');
    check.type = 'button'; check.className = 'secondary-button'; check.textContent = 'Check source'; check.disabled = running;
    check.addEventListener('click', () => runChecks([page]));
    actions.append(open, check);
    content.appendChild(actions);
    const sourceHeading = document.createElement('h2'); sourceHeading.textContent = 'Automated source checks';
    const sourceResults = document.createElement('ul'); sourceResults.className = 'test-source-results'; sourceResults.setAttribute('aria-live', 'polite');
    const scriptHeading = document.createElement('h2'); scriptHeading.textContent = 'Manual test script';
    const tests = document.createElement('ol'); tests.className = 'test-steps';
    stepsFor(page).forEach((test, index) => {
        const row = document.createElement('li'); row.className = 'test-step'; row.dataset.result = resultFor(page, index);
        const text = document.createElement('div');
        const action = document.createElement('p'); action.textContent = test.action;
        const expected = document.createElement('p'); expected.className = 'test-expected'; expected.textContent = 'Expected: ' + test.expected;
        text.append(action, expected);
        const result = document.createElement('select'); result.setAttribute('aria-label', page.name + ', step ' + (index + 1) + ' result');
        [['untested', 'Not tested'], ['pass', 'Pass'], ['fail', 'Fail'], ['blocked', 'Blocked']].forEach(([value, label]) => result.appendChild(new Option(label, value)));
        result.value = resultFor(page, index);
        result.addEventListener('change', () => {
            saveRecord(page, { results: { ...records[page.path]?.results, [index]: result.value } });
            row.dataset.result = result.value; updateOverview(); updatePrompt(page);
        });
        row.append(text, result); tests.appendChild(row);
    });
    const notesId = 'test-notes-' + pageIndex;
    const notesLabel = document.createElement('label'); notesLabel.className = 'test-field-label'; notesLabel.htmlFor = notesId; notesLabel.textContent = 'Observed behavior or requested changes';
    const notes = document.createElement('textarea'); notes.id = notesId; notes.className = 'test-notes'; notes.value = notesFor(page);
    notes.placeholder = 'Step number, exact inputs/settings, what happened, what should happen. Avoid passwords or private data.';
    notes.addEventListener('input', () => { saveRecord(page, { notes: notes.value }); updatePrompt(page); });
    const promptId = 'test-prompt-' + pageIndex;
    const promptLabel = document.createElement('label'); promptLabel.className = 'test-field-label'; promptLabel.htmlFor = promptId; promptLabel.textContent = 'Feedback prompt';
    const prompt = document.createElement('textarea'); prompt.id = promptId; prompt.className = 'test-prompt'; prompt.readOnly = true;
    const feedbackActions = document.createElement('div'); feedbackActions.className = 'test-feedback-actions';
    const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = 'Copy feedback prompt';
    const copyStatus = document.createElement('span'); copyStatus.className = 'test-copy-status'; copyStatus.setAttribute('role', 'status');
    copy.addEventListener('click', async () => {
        updatePrompt(page);
        try { await navigator.clipboard.writeText(prompt.value); copyStatus.textContent = 'Prompt copied.'; }
        catch { prompt.focus(); prompt.select(); copyStatus.textContent = 'Clipboard unavailable. Prompt selected; use your device copy command.'; }
    });
    feedbackActions.append(copy, copyStatus);
    content.append(sourceHeading, sourceResults, scriptHeading, tests, notesLabel, notes, promptLabel, prompt, feedbackActions);
    card.element.appendChild(content);
    renderSourceReport(page);
}

async function request(url, method = 'GET') {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try { return await fetch(url, { method, signal: controller.signal, cache: 'no-store' }); }
    finally { clearTimeout(timer); }
}

async function checkPageSource(page, cache) {
    const results = [];
    const url = new URL(page.path, document.baseURI);
    let html;
    try {
        const response = await request(url);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        html = await response.text();
        if (!/<html[\s>]/i.test(html)) throw new Error('Response is not an HTML document.');
        results.push({ name: 'Page response', ok: true, detail: 'HTML fetched successfully.' });
    } catch (error) {
        return [{ name: 'Page response', ok: false, detail: error.message || 'Could not fetch page.' }];
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const missing = [];
    if (!doc.title.trim()) missing.push('page title');
    if (!doc.documentElement.lang.trim()) missing.push('HTML language');
    if (!doc.querySelector('meta[name="viewport"]')) missing.push('viewport metadata');
    results.push({ name: 'Document metadata', ok: !missing.length, detail: missing.length ? 'Missing: ' + missing.join(', ') : 'Title, language and viewport are present.' });
    const ids = new Set(), duplicates = new Set();
    doc.querySelectorAll('[id]').forEach(element => { if (ids.has(element.id)) duplicates.add(element.id); ids.add(element.id); });
    results.push({ name: 'Static element IDs', ok: !duplicates.size, detail: duplicates.size ? 'Duplicate IDs: ' + [...duplicates].join(', ') : 'No duplicate IDs in the fetched HTML. Dynamically created IDs are not checked.' });
    const baseTag = doc.querySelector('base[href]');
    const base = baseTag ? new URL(baseTag.getAttribute('href'), url) : url;
    const resolveLocal = value => {
        if (!value || value.startsWith('#')) return null;
        try {
            const resolved = new URL(value, base);
            if (resolved.origin !== location.origin || !/^https?:$/.test(resolved.protocol) || /^\/(?:api|_)/.test(resolved.pathname)) return null;
            resolved.hash = ''; return resolved.href;
        } catch { return null; }
    };
    const assets = new Set();
    doc.querySelectorAll('script[src],link[rel="stylesheet"][href],link[rel="icon"][href],link[rel="manifest"][href],img[src],audio[src],video[src],source[src]').forEach(element => {
        const resolved = resolveLocal(element.getAttribute('src') || element.getAttribute('href'));
        if (resolved) assets.add(resolved);
    });
    const links = new Set();
    doc.querySelectorAll('a[href]').forEach(anchor => {
        const resolved = resolveLocal(anchor.getAttribute('href'));
        if (resolved && /\.html?$/i.test(new URL(resolved).pathname)) links.add(resolved);
    });
    async function checkReferences(refs, name) {
        const broken = [];
        for (const ref of refs) {
            if (!cache.has(ref)) cache.set(ref, (async () => {
                try {
                    const response = await request(ref);
                    if (!response.ok) return 'HTTP ' + response.status;
                    const contentType = response.headers.get('content-type') || '';
                    if (!/\.html?$/i.test(new URL(ref).pathname) && /text\/html/i.test(contentType)) return 'HTML returned instead of an asset';
                    return '';
                } catch (error) { return error.message || 'Request failed'; }
            })());
            const error = await cache.get(ref);
            if (error) broken.push(new URL(ref).pathname + ': ' + error);
        }
        return { name, ok: !broken.length, detail: broken.length ? broken.join('; ') : refs.size + ' local reference(s) reachable. External URLs and runtime-generated references not checked.' };
    }
    results.push(await checkReferences(assets, 'Local assets'));
    results.push(await checkReferences(links, 'Local page links'));
    return results;
}

async function runChecks(selection) {
    if (running) return;
    running = true;
    runButton.disabled = true;
    cards.forEach(card => { const button = card.content?.querySelector('.test-page-actions button'); if (button) button.disabled = true; });
    let finished = 0, next = 0;
    const cache = new Map();
    try {
        const worker = async () => {
            while (next < selection.length) {
                const page = selection[next++];
                try { reports.set(page.path, await checkPageSource(page, cache)); }
                catch (error) { reports.set(page.path, [{ name: 'Source check', ok: false, detail: error.message }]); }
                finished++;
                runButton.textContent = 'Checking source ' + finished + '/' + selection.length;
                renderSourceReport(page); updateOverview();
            }
        };
        await Promise.all(Array.from({ length: Math.min(4, selection.length) }, worker));
        message.textContent = 'Source checks complete for ' + finished + ' page(s). Manual test results were not changed.';
    } finally {
        running = false; runButton.disabled = false; runButton.textContent = 'Run source checks for all pages';
        cards.forEach(card => { const button = card.content?.querySelector('.test-page-actions button'); if (button) button.disabled = false; });
    }
}

pages.forEach((page, index) => {
    const element = document.createElement('details'); element.className = 'test-page';
    const summary = document.createElement('summary');
    const title = document.createElement('span'); title.className = 'test-page-title';
    const name = document.createElement('strong'); name.textContent = page.name;
    const path = document.createElement('small'); path.textContent = page.path;
    title.append(name, path);
    const badge = document.createElement('span'); badge.className = 'test-page-badge';
    summary.append(title, badge); element.appendChild(summary);
    cards.set(page.path, { element, badge, content: null });
    element.addEventListener('toggle', () => { if (element.open) { buildContent(page, index); updatePrompt(page); } });
    list.appendChild(element);
});
document.getElementById('test-search').addEventListener('input', event => {
    const term = event.target.value.toLowerCase().trim();
    let visible = 0;
    pages.forEach(page => { const card = cards.get(page.path); card.element.hidden = !(page.name + ' ' + page.path).toLowerCase().includes(term); if (!card.element.hidden) visible++; });
    document.getElementById('testing-empty').hidden = visible > 0;
});
runButton.addEventListener('click', () => runChecks(pages));
updateOverview();
