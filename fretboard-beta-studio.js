(() => {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const dialog = document.getElementById('fretboard-word-beta');
        if (!dialog) return;
        const body = dialog.querySelector('.beta-body');
        const cards = {
            patterns: dialog.querySelector('.beta-main'), keys: dialog.querySelector('.beta-side > .beta-card'),
            order: dialog.querySelector('.beta-order-card'), page: document.getElementById('beta-page-heading').closest('details'),
            text: document.getElementById('beta-text-heading').closest('details'), saved: dialog.querySelector('.beta-config-card')
        };
        const tabs = document.createElement('div');
        tabs.className = 'beta-studio-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Export settings');
        dialog.querySelector('.beta-header').after(tabs);
        const advancedCards = FretboardBetaAdvancedSchema.mount(dialog);
        const panels = [];
        for (const [id, title, members] of [
            ['selection', 'Patterns & keys', [cards.patterns, cards.keys, cards.order]],
            ['layout', 'Page & diagram', [cards.page]],
            ['text', 'Text & labels', [cards.text]],
            ['saved', 'Saved setups', [cards.saved]],
            ...FretboardBetaAdvancedSchema.tabs.map((tab, i) => [tab.id, tab.title, [advancedCards[i]]]),
            ['preview', 'Print preview', [FretboardBetaPreview.mount()]],
            ...FretboardBetaGuides.mount()
        ]) {
            const panel = document.createElement('section'); panel.id = 'beta-panel-' + id;
            panel.className = 'beta-studio-panel beta-panel-' + id;
            panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'beta-tab-' + id.replace(/-about$/, ''));
            const tab = document.createElement('button'); tab.id = 'beta-tab-' + id; tab.type = 'button'; tab.textContent = title;
            tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', panel.id);
            if (id.endsWith('-about')) tab.hidden = true;
            for (const card of members) { card.open = false; panel.append(card); }
            tabs.append(tab); panels.push({ tab, panel });
        }
        body.replaceChildren(...panels.map(item => item.panel));
        function activate(index, selectedIndex = index) {
            panels.forEach(({ tab, panel }, i) => {
                tab.setAttribute('aria-selected', String(i === selectedIndex)); tab.tabIndex = i === selectedIndex ? 0 : -1;
                panel.hidden = i !== index;
            });
            body.scrollTop = 0;
            if (panels[index].panel.id === 'beta-panel-preview') FretboardBetaPreview.refresh();
            if (panels[index].panel.id === 'beta-panel-tables') refreshTablePreview();
            if (panels[index].panel.id === 'beta-panel-reader') refreshReaderPreview();
            panels[selectedIndex].tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
        body.addEventListener('click', event => {
            const button = event.target.closest('[data-beta-settings]');
            if (!button) return;
            const index = panels.findIndex(({ panel }) => panel.id === 'beta-panel-' + button.dataset.betaSettings);
            if (index >= 0) { activate(index); panels[index].tab.focus(); }
        });
        const visibleTabs = panels.map((item, index) => item.tab.hidden ? -1 : index).filter(index => index >= 0);
        panels.forEach(({ tab }, i) => {
            if (tab.hidden) return;
            tab.addEventListener('click', () => activate(i));
            tab.addEventListener('keydown', event => {
                const position = visibleTabs.indexOf(i);
                let nextPosition;
                if (event.key === 'ArrowRight') nextPosition = (position + 1) % visibleTabs.length;
                else if (event.key === 'ArrowLeft') nextPosition = (position + visibleTabs.length - 1) % visibleTabs.length;
                else if (event.key === 'Home') nextPosition = 0;
                else if (event.key === 'End') nextPosition = visibleTabs.length - 1;
                else return;
                const next = visibleTabs[nextPosition];
                event.preventDefault(); activate(next); panels[next].tab.focus();
            });
        });
        activate(0);
        panels.forEach(({ tab, panel }, i) => {
            if (panel.id.endsWith('-about')) return;
            const about = panels.findIndex(item => item.panel.id === panel.id + '-about');
            if (about < 0) return;
            const openAbout = event => { event.preventDefault(); activate(about, i); tab.focus(); };
            tab.title = 'Right-click for About'; tab.addEventListener('contextmenu', openAbout);
            panel.addEventListener('contextmenu', event => { if (event.target.closest('summary')) openAbout(event); });
        });
        function groupFields(card, groups) {
            const grid = card.querySelector('.beta-option-grid, .beta-advanced-grid');
            const container = document.createElement('div'); container.className = 'beta-field-sections';
            for (const [title, ids] of groups) {
                const group = document.createElement('details'); group.className = 'beta-field-section';
                const summary = document.createElement('summary'); summary.textContent = title; group.append(summary);
                const fields = document.createElement('div'); fields.className = 'beta-option-grid';
                for (const id of ids) {
                    const label = document.getElementById('beta-' + id)?.closest('label');
                    if (label) fields.append(label);
                }
                group.append(fields); container.append(group);
            }
            if (grid.children.length) {
                const extra = document.createElement('details'); extra.className = 'beta-field-section';
                const summary = document.createElement('summary'); summary.textContent = 'Typography & styling'; extra.append(summary, grid); container.append(extra);
            } else grid.remove();
            const body = card.querySelector('.beta-card-body');
            const scope = body.querySelector('.beta-advanced-scope');
            if (scope) scope.after(container); else body.prepend(container);
        }
        groupFields(cards.page, [
            ['Paper & layout', ['paper', 'orientation', 'custom-width', 'custom-height', 'margin', 'columns', 'per-page', 'gap-x', 'gap-y', 'align-x', 'align-y', 'category-break', 'key-break']],
            ['Diagram size & quality', ['image-width', 'image-height', 'dpi', 'jpeg-quality', 'diagram-padding']],
            ['Instrument & fret range', ['tuning-preset', 'tuning', 'start-fret', 'end-fret']],
            ['Diagram appearance', ['display-mode', 'background', 'transparent', 'grayscale', 'diagram-opacity', 'rotate-diagram', 'marker-shape', 'marker-size', 'marker-font-size', 'string-thickness', 'fret-thickness', 'fret-number-placement', 'fret-number-position', 'fret-number-size', 'border-style', 'border-color', 'border-width']]
        ]);
        groupFields(advancedCards[4], [
            ['Columns', ['advanced-column-number', 'advanced-column-category', 'advanced-column-key', 'advanced-column-pattern', 'advanced-column-name', 'advanced-column-caption', 'advanced-column-intervals', 'advanced-column-tuning', 'advanced-column-start', 'advanced-column-end']],
            ['CSV & TSV formatting', ['advanced-table-delimiter', 'advanced-table-header', 'advanced-table-bom', 'advanced-table-newline', 'advanced-table-quotes']]
        ]);
        const tablePreview = document.createElement('section'); tablePreview.className = 'beta-table-preview';
        tablePreview.innerHTML = '<div class="beta-table-preview-heading"><h3>Sample rows</h3><p id="beta-table-preview-status" role="status">Select patterns and keys to preview the table.</p></div><div class="beta-table-preview-scroll"><table><thead></thead><tbody></tbody></table></div>';
        advancedCards[4].querySelector('.beta-card-body').append(tablePreview);
        function refreshTablePreview() {
            if (advancedCards[4].closest('[role="tabpanel"]')?.hidden) return;
            const status = document.getElementById('beta-table-preview-status');
            const head = tablePreview.querySelector('thead'); const body = tablePreview.querySelector('tbody');
            head.replaceChildren(); body.replaceChildren();
            const api = globalThis.FretboardBetaEditorAPI;
            if (!api) { status.textContent = 'Table preview is not ready.'; return; }
            const snapshot = api.snapshot();
            const items = snapshot.items.filter(item => item.kind === 'diagram');
            let sample;
            try { sample = FretboardBetaAdvanced.table(items.slice(0, 4), { ...snapshot.options, tableHeader: false }); }
            catch (error) { status.textContent = items.length ? items.length + ' rows · ' + error.message : 'Select patterns and keys to preview the table.'; return; }
            const names = ['Number', 'Category', 'Key', 'Pattern ID', 'Name', 'Caption', 'Intervals', 'Tuning', 'Start fret', 'End fret'];
            const heading = document.createElement('tr');
            sample.included.forEach(index => { const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = names[index]; heading.append(cell); });
            head.append(heading);
            sample.rows.forEach(row => { const tr = document.createElement('tr'); row.forEach(value => { const td = document.createElement('td'); td.textContent = String(value ?? ''); tr.append(td); }); body.append(tr); });
            if (!items.length) status.textContent = 'Select patterns and keys to preview the table.';
            else if (!sample.included.length) status.textContent = items.length + ' rows · select at least one column.';
            else status.textContent = 'Showing ' + Math.min(4, items.length) + ' of ' + items.length + ' rows · ' + sample.included.length + ' selected columns.';
        }
        groupFields(advancedCards[5], [
            ['Screen layout', ['advanced-reader-background', 'advanced-reader-gap', 'advanced-reader-padding', 'advanced-reader-width']],
            ['Page appearance', ['advanced-reader-page-background', 'advanced-reader-shadow', 'advanced-reader-border', 'advanced-reader-border-color', 'advanced-reader-border-width', 'advanced-reader-radius']],
            ['Optional reader header', ['advanced-reader-title', 'advanced-reader-author', 'advanced-reader-count', 'advanced-reader-print', 'advanced-reader-language']]
        ]);
        const readerPreview = document.createElement('section'); readerPreview.className = 'beta-reader-preview';
        readerPreview.innerHTML = '<div class="beta-reader-preview-heading"><h3>Screen style sample</h3><p>Illustrative only · printed page content is not to scale.</p></div><div class="beta-reader-stage"><header class="beta-reader-sample-header"><strong class="beta-reader-sample-title"></strong><span class="beta-reader-sample-author"></span><span class="beta-reader-sample-count">2 pages</span><button type="button" class="beta-reader-sample-print" tabindex="-1">Print</button></header><div class="beta-reader-sample-pages"><article class="beta-reader-sample-page"><strong>Example page</strong><p>Patterns and keys</p><div class="beta-reader-sample-diagram" aria-hidden="true"></div><small>Example diagram caption</small></article><article class="beta-reader-sample-page"><strong>Next page</strong><p>More collection content</p><div class="beta-reader-sample-diagram" aria-hidden="true"></div></article></div></div>';
        advancedCards[5].querySelector('.beta-card-body').append(readerPreview);
        function refreshReaderPreview() {
            if (advancedCards[5].closest('[role="tabpanel"]')?.hidden) return;
            const opts = FretboardBetaOptions.read();
            const stage = readerPreview.querySelector('.beta-reader-stage');
            const pageStack = readerPreview.querySelector('.beta-reader-sample-pages');
            stage.style.background = opts.readerBackground;
            stage.style.padding = Math.min(24, Math.max(8, opts.readerPadding * .35)) + 'px';
            pageStack.style.gap = Math.min(18, Math.max(4, opts.readerGap * .35)) + 'px';
            readerPreview.querySelectorAll('.beta-reader-sample-page').forEach(page => {
                page.style.width = opts.readerWidth + '%';
                page.style.background = opts.readerPageBackground;
                page.style.boxShadow = opts.readerShadow ? '0 2px 8px #0003' : 'none';
                page.style.border = opts.readerBorder ? Math.max(1, opts.readerBorderWidth * .35) + 'px solid ' + opts.readerBorderColor : 'none';
                page.style.borderRadius = Math.min(14, opts.readerRadius * .35) + 'px';
            });
            readerPreview.querySelector('.beta-reader-sample-title').textContent = opts.readerTitle ? opts.title || 'Fretboards' : '';
            readerPreview.querySelector('.beta-reader-sample-author').textContent = opts.readerAuthor && opts.author ? opts.author : '';
            readerPreview.querySelector('.beta-reader-sample-count').hidden = !opts.readerCount;
            readerPreview.querySelector('.beta-reader-sample-print').hidden = !opts.readerPrint;
            readerPreview.querySelector('.beta-reader-sample-header').hidden = !(opts.readerTitle || (opts.readerAuthor && opts.author) || opts.readerCount || opts.readerPrint);
            const border = document.getElementById('beta-advanced-reader-border').checked;
            for (const id of ['reader-border-color', 'reader-border-width']) document.getElementById('beta-advanced-' + id).disabled = !border;
        }
        groupFields(advancedCards[3], [
            ['Download name', ['advanced-download-name', 'advanced-filename-case', 'advanced-filename-separator']],
            ['ZIP entry names & folders', ['advanced-entry-template', 'advanced-archive-prefix', 'advanced-archive-suffix', 'advanced-sequence-digits', 'advanced-archive-root', 'advanced-category-folders', 'advanced-key-folders']],
            ['ZIP companion files', ['advanced-archive-manifest', 'advanced-archive-settings', 'advanced-archive-readme']],
            ['Compression', ['advanced-zip-compression', 'advanced-zip-level']]
        ]);
        const compressionSelect = document.getElementById('beta-advanced-zip-compression');
        const compressionLevel = document.getElementById('beta-advanced-zip-level');
        const syncCompressionLevel = () => { compressionLevel.disabled = compressionSelect.value === 'STORE'; };
        compressionSelect.addEventListener('change', syncCompressionLevel); syncCompressionLevel();
        groupFields(advancedCards[2], [
            ['Watermark text', ['advanced-watermark-text', 'advanced-watermark-font', 'advanced-watermark-size', 'advanced-watermark-weight', 'advanced-watermark-italic', 'advanced-watermark-tracking']],
            ['Placement', ['advanced-watermark-angle', 'advanced-watermark-x', 'advanced-watermark-y', 'advanced-watermark-repeat']],
            ['Color & contrast', ['advanced-watermark-color', 'advanced-watermark-opacity', 'advanced-watermark-background', 'advanced-watermark-background-opacity', 'advanced-watermark-padding']]
        ]);
        const watermarkScope = advancedCards[2].querySelector('.beta-advanced-scope');
        const watermarkPreview = document.createElement('button'); watermarkPreview.type = 'button';
        watermarkPreview.className = 'beta-watermark-preview-link'; watermarkPreview.dataset.betaSettings = 'preview';
        watermarkPreview.textContent = 'Preview on selected diagrams'; watermarkScope.append(' ', watermarkPreview);
        groupFields(advancedCards[1], [
            ['Visibility', ['advanced-layer-strings', 'advanced-layer-frets', 'advanced-layer-inlays', 'advanced-layer-tuning', 'advanced-layer-numbers', 'advanced-layer-labels']],
            ['Note markers & orientation', ['advanced-roots-only', 'advanced-hide-open-notes', 'advanced-mirror-horizontal', 'advanced-mirror-vertical']],
            ['Color overrides', ['advanced-layer-string-color', 'advanced-layer-fret-color', 'advanced-layer-root-color', 'advanced-layer-note-color', 'advanced-layer-label-color']]
        ]);
        groupFields(advancedCards[0], [
            ['Publication details', ['advanced-publication-code', 'advanced-publisher', 'advanced-edition', 'advanced-revision', 'advanced-copyright', 'advanced-license', 'advanced-website']],
            ['Dedication & learning', ['advanced-dedication', 'advanced-learning-goal']],
            ['Section introductions', ['advanced-category-intro', 'advanced-key-intro']],
            ['Caption add-ons', ['advanced-caption-prefix', 'advanced-caption-suffix', 'advanced-practice-prompt', 'advanced-diagram-credit']]
        ]);
        groupFields(cards.text, [
            ['Document', ['document-title', 'subtitle', 'author', 'introduction', 'date-text', 'tuning-text', 'range-text']],
            ['Headings & captions', ['category-text', 'category-note', 'key-text', 'key-note', 'caption-text', 'caption-position', 'heading-numbers', 'diagram-numbers', 'uppercase-headings', 'uppercase-captions']],
            ['Page header & footer', ['page-header', 'page-footer', 'page-numbers']]
        ]);
        const textHelp = document.getElementById('beta-text-token-help');
        textHelp.querySelector('[data-beta-settings=preview]').className = 'beta-text-preview-link';
        cards.text.querySelector('.beta-card-body').prepend(textHelp);
        FretboardBetaGuides.addFieldReferences(panels);
        const format = document.getElementById('beta-export-format');
        const note = document.createElement('p'); note.id = 'beta-format-note'; note.className = 'beta-format-note';
        format.closest('label').append(note); format.setAttribute('aria-describedby', note.id);
        const formatGroups = [
            ['Documents & print', ['docx', 'pdf-single', 'pdf-zip', 'html', 'epub', 'djvu', 'odt', 'xhtml']],
            ['Presentations & readers', ['pptx', 'odp', 'cbz']],
            ['Publishing sources', ['latex-zip', 'asciidoc-zip', 'org-zip', 'rst-zip']],
            ['Individual diagrams', ['png-zip', 'jpg-zip', 'svg-zip', 'webp-zip', 'markdown-zip']],
            ['Page images', ['svg-pages-zip', 'png-pages-zip', 'jpg-pages-zip', 'bmp-pages-zip', 'pnm-pages-zip', 'tiff', 'tar']],
            ['Spreadsheets & catalogs', ['xlsx', 'ods', 'xls', 'csv', 'tsv', 'txt', 'rtf', 'word-xml', 'dbf', 'dif']],
            ['Structured data', ['json', 'xml', 'ndjson', 'yaml']]
        ];
        const selectedFormat = format.value;
        const options = new Map([...format.options].map(option => [option.value, option]));
        for (const [title, ids] of formatGroups) {
            const group = document.createElement('optgroup'); group.label = title;
            ids.forEach(id => group.append(options.get(id))); format.append(group);
        }
        format.value = selectedFormat;
        function refresh() {
            syncCompressionLevel();
            refreshTablePreview();
            refreshReaderPreview();
            const kind = format.value;
            const paged = ['docx', 'pdf-single', 'html', 'svg-pages-zip', 'png-pages-zip', 'jpg-pages-zip', ...FretboardBetaPublishing.pagedKinds].includes(kind);
            const catalog = ['xlsx', 'ods', 'xls', 'csv', 'tsv', 'txt', 'rtf', 'word-xml', 'json', 'xml', 'ndjson', 'yaml', ...FretboardBetaPublishing.catalogKinds].includes(kind);
            note.textContent = kind === 'docx' ? 'Editable Word document. Auto size fills the printable row width without cropping.'
                : kind === 'epub' ? 'EPUB 3 fixed-layout ebook with PNG pages and a contents navigation. Text is part of the page image.'
                : kind === 'djvu' ? 'Multipage DjVu with wavelet-compressed pages. Fine labels can soften; increase DPI if needed.'
                : ['odt', 'odp', 'pptx'].includes(kind) ? 'One full-page PNG per document page or slide. Diagram and page text are not separately editable.'
                : kind === 'cbz' ? 'Ordered JPEG pages for comic readers. Uses DPI and JPEG quality.'
                : kind === 'tiff' ? 'Uncompressed multipage RGB TIFF. Files can be large; lower DPI for large collections.'
                : kind === 'tar' ? 'Uncompressed TAR archive containing ordered PNG pages.'
                : kind === 'dbf' ? 'Legacy table: single-line Latin-1 text, 254 characters per cell. Field headings are required; no text/settings sheets.'
                : kind === 'dif' ? 'Table-only DIF interchange file using Data Tables column choices. No diagram images or settings sheets.'
                : FretboardBetaPublishing.markupKinds.includes(kind) ? 'Editable source with linked PNG diagrams. Requires a matching renderer; its text flow replaces fixed page layout.'
                : paged ? 'Complete pages with your layout, headings and captions.'
                : kind === 'pdf-zip' ? 'One full-width diagram per PDF, bundled in a ZIP.'
                : catalog ? 'Text and data only; no diagram images. JSON includes all export settings.'
                : kind === 'markdown-zip' ? 'Markdown collection with captions and linked PNG diagrams.'
                : 'One image per diagram, bundled in a ZIP. JPG always has a solid background.';
            document.getElementById('beta-export').title = options.get(kind)?.textContent || 'Export';
            for (const id of ['custom-width', 'custom-height']) document.getElementById('beta-' + id).closest('label').hidden = document.getElementById('beta-paper').value !== 'custom';
            for (const id of ['border-color', 'border-width']) document.getElementById('beta-' + id).closest('label').hidden = document.getElementById('beta-border-style').value === 'none';
        }
        dialog.addEventListener('change', refresh);
        dialog.addEventListener('click', () => queueMicrotask(refresh));
        new MutationObserver(refresh).observe(dialog, { attributes: true, attributeFilter: ['open'] });
        refresh();
    });
})();
