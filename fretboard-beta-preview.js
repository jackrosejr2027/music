(() => {
    'use strict';
    const edits = new Map();
    let order = [], currentItems = [], selected = '', pageIndex = 0, revision = 0, timer, root;
    const $ = id => root?.querySelector('#beta-preview-' + id) || document.getElementById('beta-preview-' + id);
    const settingNames = ['paper', 'orientation', 'margin', 'columns', 'per-page', 'custom-width', 'custom-height'];
    function syncSettings() {
        for (const name of settingNames) $(name).value = document.getElementById('beta-' + name).value;
        for (const name of ['custom-width', 'custom-height']) $(name).closest('label').hidden = $('paper').value !== 'custom';
    }
    function clearPage(message) {
        currentItems = []; selected = ''; pageIndex = 0;
        $('sheet').replaceChildren(); $('items').replaceChildren();
        $('page').value = 1; $('page').max = 1; $('page').disabled = true;
        $('previous').disabled = true; $('next').disabled = true;
        $('status').textContent = message; select('');
    }
    function apply(items, options, api) {
        const occurrences = new Map();
        const result = [];
        for (const original of items) {
            const key = original.kind === 'diagram' ? ['diagram', original.typeId, original.pattern, original.key].join(':') : [original.kind, original.level || '', original.text || ''].join(':');
            const n = occurrences.get(key) || 0; occurrences.set(key, n + 1);
            const item = { ...original, editorId: key + ':' + n };
            const edit = edits.get(item.editorId);
            if (edit?.removed) continue;
            if (edit && Object.hasOwn(edit, 'text')) {
                if (item.kind === 'diagram') item.caption = edit.text;
                else if (item.kind === 'heading') {
                    if (!edit.text.trim()) continue;
                    item.text = edit.text; item.lines = api.headingLines(item.text, item.level, api.pageWidth - 2, options);
                    item.height = Math.max(FretboardBetaLayout.HEADING_HEIGHT[item.level] || 0, item.lines.length * api.textStyle(item.level, options).line + 4);
                }
            }
            result.push(item);
        }
        if (order.length) {
            const ranks = new Map(order.map((id, i) => [id, i]));
            result.sort((a, b) => (ranks.get(a.editorId) ?? order.length) - (ranks.get(b.editorId) ?? order.length));
        }
        return result;
    }
    function schedule() { ++revision; clearTimeout(timer); timer = setTimeout(refresh, 160); }
    function change(edit) {
        edits.set(selected, { ...edits.get(selected), ...edit }); schedule();
    }
    function select(id) {
        selected = id;
        const item = currentItems.find(item => item.editorId === id);
        $('text').value = item?.kind === 'diagram' ? item.caption : item?.text || '';
        $('text').disabled = !item || item.kind === 'break';
        const index = currentItems.indexOf(item);
        $('remove').disabled = !item;
        $('earlier').disabled = !item || index === 0;
        $('later').disabled = !item || index === currentItems.length - 1;
        $('clear-caption').disabled = !item || item.kind !== 'diagram' || !item.caption;
        $('reset').disabled = !edits.size && !order.length;
        root.querySelectorAll('[data-preview-id]').forEach(node => {
            const active = node.dataset.previewId === id; node.classList.toggle('is-selected', active);
            if (node.tagName === 'BUTTON') node.setAttribute('aria-pressed', String(active));
        });
    }
    function move(id, before) {
        const nextOrder = currentItems.map(item => item.editorId);
        const from = nextOrder.indexOf(id), to = nextOrder.indexOf(before);
        if (from < 0 || to < 0 || from === to) return;
        nextOrder.splice(from, 1); nextOrder.splice(nextOrder.indexOf(before), 0, id);
        order = nextOrder; schedule();
    }
    async function refresh() {
        if (!root || root.closest('[role="tabpanel"]')?.hidden) return;
        const version = ++revision, api = globalThis.FretboardBetaEditorAPI;
        if (!api || api.isBusy()) { $('status').textContent = 'Finish the export before editing the preview.'; return; }
        let resource;
        clearTimeout(timer); syncSettings();
        $('status').textContent = 'Preparing page…';
        root.setAttribute('aria-busy', 'true');
        try {
            const { options, items } = api.snapshot(); currentItems = items;
            const first = items.find(item => item.kind === 'diagram');
            if (!first) { clearPage('Select patterns and keys to preview, or reset preview edits if all diagrams were removed.'); return; }
            resource = api.createRenderer(options);
            resource.renderer.updatePattern(first.key, first.typeId, first.pattern);
            const size = api.svgSize(resource.renderer.svg);
            const config = api.exportConfig(options, size.height / size.width, items);
            const pages = FretboardBetaLayout.planPages(items, config, options.perPage);
            if (!pages.length) { clearPage('No printable pages. Select patterns and keys, or reset preview edits.'); return; }
            pageIndex = Math.max(0, Math.min(pageIndex, pages.length - 1));
            const page = pages[pageIndex];
            const context = { options, renderer: resource.renderer, total: page.items.length, done: 0, preview: true };
            const svg = await FretboardBetaFormats.pageSvg(page, config, context, pageIndex, pages.length, {
                renderItem: api.renderItem, textStyle: api.textStyle, pageText: api.pageText,
                checkCancel() { if (version !== revision) throw new Error('Preview superseded'); }
            });
            if (version !== revision) return;
            // Generated markup only: page text and SVG attributes are escaped by the exporter.
            $('sheet').innerHTML = svg;
            $('items').replaceChildren();
            for (const item of page.items) {
                const button = document.createElement('button'); button.type = 'button'; button.draggable = true;
                button.dataset.previewId = item.editorId;
                button.textContent = item.kind === 'diagram' ? item.key + ' - ' + item.name : item.text;
                button.addEventListener('click', () => select(item.editorId));
                button.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', item.editorId));
                button.addEventListener('dragover', event => event.preventDefault());
                button.addEventListener('drop', event => { event.preventDefault(); move(event.dataTransfer.getData('text/plain'), item.editorId); });
                $('items').append(button);
            }
            $('page').disabled = false; $('page').value = pageIndex + 1; $('page').max = pages.length;
            const diagrams = page.items.filter(item => item.kind === 'diagram').length;
            $('status').textContent = 'Page ' + (pageIndex + 1) + ' of ' + pages.length + ' · ' + Number(config.pageWidth.toFixed(1)) + ' × ' + Number(config.pageHeight.toFixed(1)) + ' mm · ' + diagrams + (diagrams === 1 ? ' diagram' : ' diagrams') + ' · ' + page.columns + (page.columns === 1 ? ' column' : ' columns') + '. Preview edits apply to exports in this session.';
            $('previous').disabled = pageIndex === 0; $('next').disabled = pageIndex === pages.length - 1;
            select(selected);
        } catch (error) { if (version === revision) clearPage('Preview unavailable: ' + error.message); }
        finally { resource?.dispose(); if (version === revision) root.setAttribute('aria-busy', 'false'); }
    }
    function mount() {
        root = document.createElement('article'); root.className = 'beta-preview';
        root.innerHTML = '<div class="beta-preview-tools beta-preview-settings"></div><div class="beta-preview-paging"><button id="beta-preview-previous" type="button">Previous page</button><label>Page<input id="beta-preview-page" type="number" min="1" value="1"></label><button id="beta-preview-next" type="button">Next page</button><button id="beta-preview-refresh" type="button">Refresh</button></div><p id="beta-preview-status" role="status"></p><div class="beta-preview-workspace"><div id="beta-preview-sheet" class="beta-preview-sheet"></div><div class="beta-preview-editor"><div id="beta-preview-items" class="beta-preview-items" aria-label="Page parts"></div><label>Selected text / caption<textarea id="beta-preview-text" rows="4" maxlength="10000" disabled></textarea></label><div class="beta-preview-tools"><button id="beta-preview-earlier" type="button" disabled>Move earlier</button><button id="beta-preview-later" type="button" disabled>Move later</button><button id="beta-preview-clear-caption" type="button" disabled>Remove caption</button><button id="beta-preview-remove" type="button" disabled>Remove part</button></div></div></div>';
        const toolbar = root.querySelector('.beta-preview-settings');
        const pageGroup = document.createElement('fieldset'); pageGroup.className = 'beta-preview-setting-group';
        const pageLegend = document.createElement('legend'); pageLegend.textContent = 'Page'; pageGroup.append(pageLegend);
        const layoutGroup = document.createElement('fieldset'); layoutGroup.className = 'beta-preview-setting-group';
        const layoutLegend = document.createElement('legend'); layoutLegend.textContent = 'Layout'; layoutGroup.append(layoutLegend);
        toolbar.replaceChildren(pageGroup, layoutGroup);
        // Clone the real settings, including their choices and limits, to avoid a second schema.
        const labels = { paper: 'Paper size', orientation: 'Orientation', margin: 'Margins (mm)', columns: 'Columns', 'per-page': 'Diagrams per page', 'custom-width': 'Short edge (mm)', 'custom-height': 'Long edge (mm)' };
        for (const name of settingNames) {
            const source = document.getElementById('beta-' + name);
            const control = source.cloneNode(true); control.id = 'beta-preview-' + name;
            control.removeAttribute('name'); control.removeAttribute('aria-labelledby');
            const label = document.createElement('label'); label.htmlFor = control.id;
            label.append(document.createTextNode(labels[name]), control);
            (['paper', 'orientation', 'custom-width', 'custom-height'].includes(name) ? pageGroup : layoutGroup).append(label);
            control.addEventListener('change', () => {
                if (!control.checkValidity()) { control.reportValidity(); return; }
                source.value = control.value;
                source.dispatchEvent(new Event('change', { bubbles: true }));
                syncSettings(); schedule();
            });
        }
        const actions = document.createElement('div'); actions.className = 'beta-preview-setting-actions';
        for (const [text, id] of [['More page settings', 'settings'], ['Reset preview edits', 'reset']]) {
            const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
            if (id === 'settings') {
                button.dataset.betaSettings = 'layout';
                button.addEventListener('click', () => { document.getElementById('beta-page-heading').closest('details').open = true; });
            } else { button.id = 'beta-preview-reset'; button.disabled = true; }
            actions.append(button);
        }
        toolbar.after(actions);
        syncSettings();
        root.querySelector('#beta-preview-sheet').addEventListener('click', event => {
            const target = event.target.closest('[data-preview-id]'); if (target) select(target.dataset.previewId);
        });
        root.querySelector('#beta-preview-text').addEventListener('change', event => { if (selected) change({ text: event.target.value }); });
        for (const [name, action] of Object.entries({
            refresh, reset() { edits.clear(); order = []; selected = ''; pageIndex = 0; schedule(); },
            previous() { pageIndex = Math.max(0, pageIndex - 1); schedule(); }, next() { pageIndex++; schedule(); },
            remove() { if (selected) change({ removed: true }); },
            'clear-caption'() { if (selected) change({ text: '' }); },
            earlier() { const i = currentItems.findIndex(item => item.editorId === selected); if (i > 0) move(selected, currentItems[i - 1].editorId); },
            later() { const i = currentItems.findIndex(item => item.editorId === selected); if (i >= 0 && i + 1 < currentItems.length) { move(currentItems[i + 1].editorId, selected); } }
        })) root.querySelector('#beta-preview-' + name).addEventListener('click', action);
        root.querySelector('#beta-preview-page').addEventListener('change', event => {
            const value = Number(event.target.value), maximum = Number(event.target.max) || 1;
            pageIndex = Math.max(0, Math.min(maximum - 1, Number.isFinite(value) ? Math.floor(value || 1) - 1 : 0));
            event.target.value = pageIndex + 1; schedule();
        });
        document.getElementById('fretboard-word-beta').addEventListener('change', event => {
            if (root.contains(event.target)) return;
            syncSettings();
            schedule();
        });
        clearPage('Select patterns and keys to preview.');
        return root;
    }
    globalThis.FretboardBetaPreview = { mount, apply, refresh };
})();
