(function () {
    'use strict';
    const base = new URL('./', document.currentScript.src);
    document.addEventListener('DOMContentLoaded', () => {
        const catalog = window.APP_CATALOG;
        const records = [];
        const groups = [];
        const refreshControls = [];
        const summary = document.getElementById('catalog-summary');
        if (summary) summary.textContent = catalog.pages.length + ' pages / ' + catalog.assets.length + ' preserved files / ' + window.ST_OFFLINE.version;
        document.querySelectorAll('[data-catalog]').forEach(host => {
            const kind = host.dataset.catalog;
            const editable = host.hasAttribute('data-editable');
            const items = kind === 'pages' ? catalog.pages : catalog.assets.map(path => ({ path, name: path, group: catalog.assetGroup(path) }));
            const grouped = new Map();
            items.forEach(item => { if (!grouped.has(item.group)) grouped.set(item.group, []); grouped.get(item.group).push(item); });
            grouped.forEach((items, name) => {
                const group = document.createElement('details');
                group.className = 'catalog-group'; group.open = kind === 'pages';
                const heading = document.createElement('summary'); heading.textContent = name + ' (' + items.length + ')';
                const content = document.createElement('div'); content.className = 'catalog-records';
                group.append(heading, content); host.appendChild(group);
                const groupRecord = { element: group, kind, records: [], previousOpen: group.open };
                groups.push(groupRecord);
                items.forEach(item => {
                    const row = document.createElement('article'); row.className = 'catalog-record';
                    const head = document.createElement('div'); head.className = 'catalog-record-head';
                    const link = document.createElement('a'); link.href = new URL(item.path.split('/').map(encodeURIComponent).join('/'), base).href;
                    link.textContent = kind === 'pages' ? item.name : item.path;
                    if (kind === 'assets') { link.target = '_blank'; link.rel = 'noopener'; }
                    const identity = document.createElement('div'); identity.className = 'catalog-identity'; identity.appendChild(link);
                    if (kind === 'pages') { const path = document.createElement('code'); path.textContent = item.path; identity.appendChild(path); }
                    head.appendChild(identity); row.appendChild(head);
                    let toggle;
                    if (kind === 'pages') {
                        const details = document.createElement('details'); details.className = 'catalog-capabilities';
                        const label = document.createElement('summary'); label.textContent = 'Capabilities';
                        const features = document.createElement('ul'); item.features.forEach(feature => { const li = document.createElement('li'); li.textContent = feature; features.appendChild(li); });
                        details.append(label, features); row.appendChild(details);
                        if (editable) {
                            if (catalog.protectedPages.has(item.path)) { const locked = document.createElement('span'); locked.className = 'catalog-state'; locked.textContent = 'Always available'; head.appendChild(locked); }
                            else {
                                toggle = document.createElement('button'); toggle.type = 'button';
                                const refresh = () => { const visible = catalog.isVisible(item.path); toggle.disabled = catalog.viewMode() === 'default'; toggle.textContent = visible ? 'Hide' : 'Show'; toggle.setAttribute('aria-label', (visible ? 'Hide ' : 'Show ') + item.name + ' in shared navigation'); toggle.setAttribute('aria-pressed', String(visible)); row.dataset.visible = String(visible); };
                                refreshControls.push(refresh);
                                refresh();
                                toggle.addEventListener('click', () => {
                                    const visible = !catalog.isVisible(item.path);
                                    const saved = catalog.setVisible(item.path, visible); refresh();
                                    announce(item.name + (visible ? ' is eligible for shared navigation.' : ' is hidden from shared navigation. Direct access and offline files are unchanged.') + (saved ? '' : ' Storage is unavailable; this change lasts for this visit only.'));
                                });
                                head.appendChild(toggle);
                            }
                        }
                    } else {
                        const description = document.createElement('p'); description.className = 'catalog-asset-description'; description.textContent = catalog.assetRole(item.path); row.appendChild(description);
                        if (editable) {
                            description.id = 'asset-description-' + records.length;
                            toggle = document.createElement('button'); toggle.type = 'button'; toggle.setAttribute('aria-controls', description.id);
                            const refresh = () => { const expanded = catalog.assetExpanded(item.path); toggle.disabled = catalog.viewMode() === 'default'; description.hidden = !expanded; toggle.textContent = expanded ? 'Hide details' : 'Show details'; toggle.setAttribute('aria-expanded', String(expanded)); toggle.setAttribute('aria-label', (expanded ? 'Hide' : 'Show') + ' details for ' + item.path); };
                            refreshControls.push(refresh);
                            refresh();
                            toggle.addEventListener('click', () => { const saved = catalog.setAssetExpanded(item.path, !catalog.assetExpanded(item.path)); refresh(); if (!saved) announce('Storage is unavailable; detail visibility lasts for this visit only.'); });
                            head.appendChild(toggle);
                        }
                    }
                    const record = { element: row, group: groupRecord, text: [item.path, item.name, item.group, ...(item.features || []), kind === 'assets' ? catalog.assetRole(item.path) : ''].join(' ').toLowerCase() };
                    records.push(record); groupRecord.records.push(record); content.appendChild(row);
                });
            });
        });
        function announce(text) { const status = document.getElementById('catalog-message'); if (status) status.textContent = text; }
        const viewOptions = document.querySelectorAll('input[name="app-view"]');
        function refreshView() {
            const mode = catalog.viewMode();
            viewOptions.forEach(input => { input.checked = input.value === mode; });
            refreshControls.forEach(refresh => refresh());
            const note = document.getElementById('catalog-view-note');
            if (note) note.textContent = mode === 'default' ? 'Original Home dashboard and full shared navigation. Custom choices are kept but not applied. Choose Custom setup to edit them.' : 'Home and shared navigation follow your Show/Hide choices. Asset switches only fold details. All files stay available offline.';
        }
        viewOptions.forEach(input => input.addEventListener('change', () => {
            if (!input.checked) return;
            const saved = catalog.setViewMode(input.value);
            refreshView();
            announce((input.value === 'default' ? 'Default view restored.' : 'Custom setup applied.') + ' Saved custom choices have not been erased.' + (saved ? '' : ' Storage is unavailable; the view cannot persist after leaving this page.'));
        }));
        refreshView();
        let searching = false;
        const search = document.getElementById('catalog-search');
        if (search) search.addEventListener('input', () => {
            const term = search.value.trim().toLowerCase();
            if (term && !searching) groups.forEach(group => { group.previousOpen = group.element.open; });
            let visible = 0;
            records.forEach(record => { record.element.hidden = !record.text.includes(term); if (!record.element.hidden) visible++; });
            groups.forEach(group => { const any = group.records.some(record => !record.element.hidden); group.element.hidden = !any; group.element.open = term ? any : group.previousOpen; });
            searching = !!term;
            announce(visible + ' matching page/asset entries.');
        });
        document.querySelectorAll('[data-catalog-expand]').forEach(button => button.addEventListener('click', () => {
            const open = button.dataset.catalogExpand === 'show';
            groups.forEach(group => { if (!group.element.hidden) { group.element.open = open; group.previousOpen = open; } });
            announce(open ? 'All matching groups shown.' : 'All groups hidden.');
        }));
    });
})();
