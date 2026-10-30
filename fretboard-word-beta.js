(() => {
    'use strict';
    const TYPES = [
        { id: 'interval', title: 'Intervals' },
        { id: 'chord', title: 'Chords' },
        { id: 'scale', title: 'Scales' }
    ];
    const $ = id => document.getElementById(id);

    document.addEventListener('DOMContentLoaded', () => {
        const app = window.app;
        const dialog = $('fretboard-word-beta');
        if (!app || !dialog || typeof Fretboard === 'undefined') return;

        const patternHost = $('beta-patterns');
        const keyHost = $('beta-keys');
        const exportButton = $('beta-export');
        const formatSelect = $('beta-export-format');
        const stopButton = $('beta-cancel');
        const patternInputs = [];
        const keyInputs = [];
        let cancelled = false;
        let exporting = false;

        $('fretboard-beta-open').addEventListener('click', () => { refreshFromApp(); configManager.onOpen(); dialog.showModal(); });
        $('beta-close').addEventListener('click', () => { if (!exporting) dialog.close(); });
        dialog.addEventListener('click', event => { if (event.target === dialog && !exporting) dialog.close(); });
        dialog.addEventListener('cancel', event => { if (exporting) { event.preventDefault(); cancelled = true; setStatus('Stopping after the current image...'); } });

        function setStatus(message) { $("beta-message").textContent = message; }
        function customOrder() { try { return JSON.parse($('beta-custom-order').value || '[]'); } catch (_) { return []; } }
        function orderedPatterns(type) {
            const ranks = new Map(customOrder().map((key, index) => [key, index]));
            return patternInputs.filter(item => item.type === type).sort((a, b) => FretboardBetaCatalog.compare(a, b, $('beta-pattern-order').value, ranks));
        }
        function orderedTypes() {
            return $('beta-category-order').value.split(',').map(id => TYPES.find(type => type.id === id)).filter(Boolean);
        }
        function selectedPatterns() {
            return orderedTypes().map(type => ({ ...type, patterns: orderedPatterns(type.id).filter(item => item.input.checked)
                .map(item => ({ id: item.id, name: item.name, intervals: item.intervals })) })).filter(type => type.patterns.length);
        }
        function moveToPosition(item, typeId, target) {
            const all = orderedTypes().flatMap(type => orderedPatterns(type.id).filter(x => x.input.checked));
            const slots = all.map((x, i) => x.type === typeId ? i : -1).filter(i => i >= 0);
            const group = slots.map(i => all[i]).filter(x => x !== item);
            group.splice(target, 0, item);
            slots.forEach((slot, k) => { all[slot] = group[k]; });
            $('beta-custom-order').value = JSON.stringify(all.map(x => x.type + ':' + x.id));
            $('beta-pattern-order').value = 'custom'; applyPatternOrder(); updateSummary();
            const label = 'Position of ' + item.name;
            [...$('beta-order-list').querySelectorAll('select')].find(s => s.getAttribute('aria-label') === label)?.focus();
        }
        function refreshOrderList() {
            const host = $('beta-order-list'); host.replaceChildren();
            for (const type of orderedTypes()) {
                const selected = orderedPatterns(type.id).filter(item => item.input.checked);
                if (!selected.length) continue;
                const heading = document.createElement('strong'); heading.textContent = type.title; host.append(heading);
                selected.forEach((item, index) => {
                    const row = document.createElement('div'); row.className = 'beta-order-row';
                    const name = document.createElement('span'); name.textContent = item.name; row.append(name);
                    const position = document.createElement('select'); position.className = 'beta-order-position';
                    position.setAttribute('aria-label', 'Position of ' + item.name);
                    selected.forEach((_, n) => { const option = document.createElement('option'); option.value = String(n + 1); option.textContent = String(n + 1); option.selected = n === index; position.append(option); });
                    position.addEventListener('change', () => moveToPosition(item, type.id, Number(position.value) - 1));
                    row.append(position);
                    for (const [label, offset] of [['Up', -1], ['Down', 1]]) {
                        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
                        button.setAttribute('aria-label', 'Move ' + item.name + ' ' + label.toLowerCase());
                        button.disabled = index + offset < 0 || index + offset >= selected.length;
                        button.addEventListener('click', () => {
                            const all = orderedTypes().flatMap(type => orderedPatterns(type.id).filter(item => item.input.checked));
                            const from = all.indexOf(item), to = all.indexOf(selected[index + offset]);
                            [all[from], all[to]] = [all[to], all[from]];
                            $('beta-custom-order').value = JSON.stringify(all.map(item => item.type + ':' + item.id));
                            $('beta-pattern-order').value = 'custom'; applyPatternOrder(); updateSummary();
                            const buttons = host.querySelectorAll('button');
                            const moved = all.filter(x => x.type === type.id).indexOf(item);
                            const previousGroups = all.slice(0, all.findIndex(x => x.type === type.id)).length;
                            buttons[(previousGroups + moved) * 2 + (offset < 0 ? 0 : 1)]?.focus();
                        });
                        row.append(button);
                    }
                    host.append(row);
                });
            }
            if (!host.children.length) host.textContent = 'Select patterns to arrange their export order.';
        }
        function applyPatternOrder() {
            orderedTypes().forEach(type => {
                const details = $('beta-patterns').querySelector('[data-type="' + type.id + '"]');
                if (!details) return;
                $('beta-patterns').append(details);
                const list = details.querySelector('.beta-pattern-list');
                orderedPatterns(type.id).forEach(item => list.append(item.label));
            });
        }
        function applyFilters() {
            const query = $('beta-filter').value;
            const required = [...$('beta-interval-filter').querySelectorAll('input:checked')].map(input => Number(input.value));
            const mode = $('beta-interval-mode').value;
            for (const item of patternInputs) item.label.hidden = !FretboardBetaCatalog.matches(item, query + ' ' + $('beta-search-' + item.type).value, required, mode);
            for (const type of TYPES) {
                const details = patternHost.querySelector('[data-type="' + type.id + '"]');
                if (details && (query.trim() || required.length || $('beta-search-' + type.id).value.trim())) details.open = true;
            }
            updateSummary();
        }
        function selectedKeys() { return keyInputs.filter(item => item.input.checked).map(item => item.note); }
        function updateSummary() {
            const count = patternInputs.filter(item => item.input.checked).length;
            const keys = selectedKeys().length;
            const images = count * keys;
            $('beta-summary').textContent = count + ' patterns · ' + keys + ' keys · ' + images + ' diagrams';
            $('beta-selection-count').textContent = count + ' selected';
            $('beta-key-count').textContent = keys + ' selected';
            exportButton.disabled = exporting || !count || !keys;
            formatSelect.disabled = exporting;
            TYPES.forEach(type => {
                const selected = patternInputs.filter(item => item.type === type.id && item.input.checked).length;
                const total = patternInputs.filter(item => item.type === type.id).length;
                const countNode = $('beta-count-' + type.id);
                if (countNode) countNode.textContent = selected + ' selected · ' + patternInputs.filter(item => item.type === type.id && !item.label.hidden).length + '/' + total + ' shown';
            });
            refreshOrderList();
        }
        function setType(type, checked) {
            patternInputs.filter(item => item.type === type && !item.label.hidden).forEach(item => { item.input.checked = checked; });
            updateSummary();
        }
        function setAllPatterns(checked) {
            patternInputs.forEach(item => { if (!checked || !item.label.hidden) item.input.checked = checked; });
            updateSummary();
        }
        function setAllKeys(checked) {
            keyInputs.forEach(item => { item.input.checked = checked; });
            updateSummary();
        }

        function intervalsForPattern(type, id, data) { return type === 'interval' ? [id] : data?.intervals || []; }

        TYPES.forEach(type => {
            const details = document.createElement('details');
            details.className = 'beta-category';
            details.open = false;
            const summary = document.createElement('summary');
            const title = document.createElement('span'); title.textContent = type.title;
            const count = document.createElement('span'); count.id = 'beta-count-' + type.id; count.className = 'beta-category-count';
            summary.append(title, count);
            const controls = document.createElement('div'); controls.className = 'beta-category-tools';
            const search = document.createElement('input'); search.type = 'search'; search.id = 'beta-search-' + type.id;
            search.placeholder = 'Search ' + type.title.toLowerCase() + ' by name, ID, or formula'; search.setAttribute('aria-label', 'Search ' + type.title.toLowerCase());
            search.addEventListener('input', applyFilters); controls.append(search);
            [['Check shown', true], ['Clear shown', false]].forEach(([text, value]) => {
                const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
                button.addEventListener('click', () => setType(type.id, value)); controls.append(button);
            });
            const list = document.createElement('div'); list.className = 'beta-pattern-list';
            const catalog = app.musicTheory[type.id === 'interval' ? 'intervals' : type.id === 'chord' ? 'chords' : 'scales'] || {};
            FretboardBetaCatalog.commonEntries(type.id, catalog).forEach(([id, data], index) => {
                const label = document.createElement('label'); label.className = 'beta-pattern-option';
                const input = document.createElement('input'); input.type = 'checkbox';
                input.id = 'beta-pattern-' + type.id + '-' + index;
                const name = String(data?.name || id);
                const copy = document.createElement('span'); copy.className = 'beta-pattern-copy';
                const text = document.createElement('span'); text.className = 'beta-pattern-name'; text.textContent = name;
                const formula = document.createElement('small'); formula.className = 'beta-pattern-formula';
                formula.textContent = intervalsForPattern(type.id, id, data).join(' · ');
                copy.append(text, formula);
                input.addEventListener('change', () => {
                    if (input.checked && $('beta-pattern-order').value === 'custom') {
                        const order = customOrder(), key = type.id + ':' + id;
                        if (!order.includes(key)) $('beta-custom-order').value = JSON.stringify([...order, key]);
                        applyPatternOrder();
                    }
                    updateSummary();
                });
                label.append(input, copy); list.append(label);
                const intervals = intervalsForPattern(type.id, id, data);
                label.title = name + ' — ' + intervals.join(' ');
                patternInputs.push({ type: type.id, id, name, input, label, index, intervals, formula: intervals.join(' '), pitches: FretboardBetaCatalog.pitches(type.id, id, data) });
            });
            details.append(summary, controls, list); patternHost.append(details);
        });

        const keyNames = app.musicTheory.notes || [];
        keyNames.forEach((note, index) => {
            const label = document.createElement('label');
            const input = document.createElement('input'); input.type = 'checkbox'; input.id = 'beta-key-' + index;
            input.checked = app.fretboard.currentKey === note;
            input.addEventListener('change', updateSummary);
            const text = document.createElement('span'); text.textContent = note;
            label.append(input, text); keyHost.append(label); keyInputs.push({ note, input });
        });

        $('beta-check-all').addEventListener('click', () => setAllPatterns(true));
        $('beta-clear-all').addEventListener('click', () => setAllPatterns(false));
        $('beta-keys-all').addEventListener('click', () => setAllKeys(true));
        $('beta-keys-current').addEventListener('click', () => {
            const current = app.fretboard.currentKey;
            keyInputs.forEach(item => { item.input.checked = item.note === current; }); updateSummary();
        });
        $('beta-keys-clear').addEventListener('click', () => setAllKeys(false));
        $('beta-filter').addEventListener('input', applyFilters);
        $('beta-interval-filter').addEventListener('change', applyFilters);
        $('beta-interval-mode').addEventListener('change', applyFilters);
        $('beta-filter-reset').addEventListener('click', () => {
            $('beta-filter').value = '';
            TYPES.forEach(type => { $('beta-search-' + type.id).value = ''; });
            $('beta-interval-filter').querySelectorAll('input').forEach(input => { input.checked = false; });
            $('beta-interval-mode').value = 'any'; applyFilters();
        });
        for (const id of ['beta-category-order', 'beta-pattern-order']) $(id).addEventListener('change', () => { applyPatternOrder(); updateSummary(); });
        $('beta-patterns').querySelectorAll('.beta-category').forEach((details, index) => details.dataset.type = TYPES[index].id);

        const { fillTemplate, parseTuning, boxSize, layoutConfig, blocks, planPages, rowCaptionHeight, pageGeometry, paperDimensions, HEADING_HEIGHT } = FretboardBetaLayout;
        const jobs = FretboardBetaFormats.formats;
        const dirty = new Set();
        ['start-fret', 'end-fret', 'tuning'].forEach(name => {
            $('beta-' + name).addEventListener('input', () => dirty.add(name));
        });
        const tuningPresets = {
            standard: 'E A D G B E', dropD: 'D A D G B E', bass: 'E A D G',
            ukulele: 'G C E A', seven: 'B E A D G B E', openG: 'D G D G B D', dadgad: 'D A D G A D'
        };
        $('beta-tuning-preset').addEventListener('change', event => {
            const tuning = tuningPresets[event.target.value];
            $('beta-tuning').value = tuning || app.fretboard.settings.tuning.join(' ');
            dirty.add('tuning');
        });
        $('beta-tuning').addEventListener('input', () => { $('beta-tuning-preset').value = ''; });
        function refreshFromApp() {
            const settings = app.fretboard.settings;
            if (!dirty.has('start-fret')) $('beta-start-fret').value = settings.startFret ?? 0;
            if (!dirty.has('end-fret')) $('beta-end-fret').value = settings.endFret ?? 24;
            if (!dirty.has('tuning')) $('beta-tuning').value = (settings.tuning || ['E', 'A', 'D', 'G', 'B', 'E']).join(' ');
        }
        function readOptions() { return FretboardBetaOptions.read(); }
        function applyOptions(options) {
            FretboardBetaOptions.apply(options);
            applyPatternOrder(); applyFilters();
            ['start-fret', 'end-fret', 'tuning'].forEach(name => dirty.add(name));
        }
        function svgSize(svg) {
            const box = (svg.getAttribute('viewBox') || '').trim().split(/[ ,]+/).map(Number);
            return { width: box[2] || 1000, height: box[3] || 250 };
        }
        function svgToImageBytes(svg, options = {}) {
            const { background = '#fff', includeDataUrl = false, mimeType = 'image/png', boxPx, quality = 0.92, transparent = false } = options;
            return new Promise((resolve, reject) => {
                const size = { width: svg.width, height: svg.height };
                const image = new Image();
                const url = URL.createObjectURL(new Blob([svg.markup], { type: 'image/svg+xml;charset=utf-8' }));
                image.onload = async () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const pixelWidth = Math.max(1, Math.round(boxPx?.width || size.width * 2));
                        const pixelHeight = Math.max(1, Math.round(boxPx?.height || size.height * 2));
                        if (pixelWidth > 32760 || pixelHeight > 32760 || pixelWidth * pixelHeight > 60000000) throw new Error('The requested image is too large. Lower its size or DPI.');
                        canvas.width = pixelWidth; canvas.height = pixelHeight;
                        const context = canvas.getContext('2d');
                        if (!context) throw new Error('Image rendering is unavailable.');
                        if (!transparent || mimeType === 'image/jpeg') { context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height); }
                        const scale = Math.min(canvas.width / size.width, canvas.height / size.height);
                        const width = size.width * scale, height = size.height * scale;
                        context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
                        const blob = await new Promise((done, fail) => canvas.toBlob(value => value ? done(value) : fail(new Error('Could not encode the fretboard image.')), mimeType, quality));
                        if (blob.type !== mimeType) throw new Error('This browser cannot encode ' + mimeType + '. Choose another image format.');
                        const result = { bytes: new Uint8Array(await blob.arrayBuffer()), ...size };
                        if (includeDataUrl) result.dataUrl = canvas.toDataURL(mimeType, quality);
                        canvas.width = 0; canvas.height = 0;
                        resolve(result);
                    } catch (error) { reject(error); }
                    finally { URL.revokeObjectURL(url); }
                };
                image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not render a fretboard diagram.')); };
                image.src = url;
            });
        }
        function createRenderer(options) {
            const container = document.createElement('div');
            container.id = 'beta-render-' + Date.now();
            Object.assign(container.style, { position: 'fixed', left: '-12000px', top: '0', width: '1100px', visibility: 'hidden', pointerEvents: 'none' });
            document.body.append(container);
            let renderer;
            const dispose = () => {
                renderer?.resizeObserver?.disconnect();
                if (renderer?.queueResponsiveDraw) window.removeEventListener('resize', renderer.queueResponsiveDraw);
                if (renderer?.resizeTimeout) clearTimeout(renderer.resizeTimeout);
                container.remove();
            };
            try {
                renderer = new Fretboard(container.id, app.musicTheory);
                // Export geometry is fixed; responsive redraws compete with sequential rendering.
                renderer.resizeObserver?.disconnect();
                if (renderer.queueResponsiveDraw) window.removeEventListener('resize', renderer.queueResponsiveDraw);
                renderer.layoutBase = app.fretboard.layoutBase ? { ...app.fretboard.layoutBase } : undefined;
                const settings = app.fretboard.settings;
                const themeColors = renderer.getThemeColors.bind(renderer);
                renderer.getThemeColors = () => ({ ...themeColors(), background: options.transparent ? 'none' : options.background });
                renderer.updateSettings({ ...settings, ...FretboardBetaOptions.rendererOverrides(options), referenceLayout: false,
                    displayMode: options.displayMode === 'current' ? settings.displayMode : options.displayMode,
                    startFret: options.startFret, endFret: options.endFret, tuning: options.tuning,
                    stringStartFrets: options.tuning.map(() => options.startFret),
                    stringEndFrets: options.tuning.map(() => options.endFret),
                    visibleStrings: settings.visibleStrings?.length === options.tuning.length ? [...settings.visibleStrings] : options.tuning.map(() => true)
                });
                return { renderer, dispose };
            } catch (error) { dispose(); throw error; }
        }
        const measure = document.createElement('canvas').getContext('2d');
        const pdfFonts = { Arial: 'helvetica', 'Times New Roman': 'times', 'Courier New': 'courier' };
        function textStyle(level, options = {}) {
            const size = level === 'title' ? options.titleSize || 17 : level === 'category' ? options.headingSize || 14 : level === 'key' ? (options.headingSize || 14) * 11 / 14 : level === 'subtitle' ? (options.titleSize || 17) * 13 / 17 : level === 'caption' ? options.captionSize || 8 : level === 'author' ? (options.bodySize || 9) + 1 : options.bodySize || 9;
            const color = level === 'caption' ? options.captionColor : ['title', 'subtitle'].includes(level) ? options.titleColor : ['category', 'key'].includes(level) ? options.headingColor : options.bodyColor;
            return { size, color: color || options.textColor || '#20221f', line: size * 25.4 / 72 * 1.17 * (options.lineSpacing || 1),
                bold: level === 'caption' ? !!options.captionBold : !['body', 'author'].includes(level),
                italic: level === 'body' && !!options.bodyItalic };
        }
        function headingLines(text, level, width, options = {}) {
            const style = textStyle(level, options);
            measure.font = (style.italic ? 'italic ' : '') + (style.bold ? 'bold ' : 'normal ') + style.size * 96 / 72 + 'px "' + (options.font || 'Arial') + '"';
            const lines = [];
            for (const paragraph of text.split(/\r?\n/)) {
                let line = '';
                for (const char of paragraph) {
                    if (line && measure.measureText(line + char).width / 3.779527559 > Math.max(1, width)) { lines.push(line); line = ''; }
                    line += char;
                }
                lines.push(line);
            }
            return lines;
        }
        function templateValues(options, extra = {}) {
            return { date: new Date().toISOString().slice(0, 10), tuning: options.tuning.join(' '), startFret: options.startFret, endFret: options.endFret, ...extra };
        }
        function exportConfig(options, ratio, items = []) {
            const width = paperDimensions(options).width - options.margin * 2, line = textStyle('caption', options).line;
            const lines = text => {
                if (!text.trim()) return 0;
                let maximum = 1;
                for (const item of items) if (item.kind === 'diagram') {
                    const value = fillTemplate(text, templateValues(options, { ...item, page: 9999, pages: 9999 }));
                    maximum = Math.max(maximum, headingLines(value, 'caption', width, options).length);
                }
                return maximum;
            };
            return { ...layoutConfig({ ...options, caption: items.some(item => item.kind === 'diagram' && item.caption) ? '{caption}' : options.caption,
                headerHeight: lines(options.header) ? lines(options.header) * line + 4 : 0,
                footerHeight: (lines(options.footer) + (options.pageNumbers === 'none' ? 0 : 1)) * line + (options.footer.trim() || options.pageNumbers !== 'none' ? 4 : 0)
            }, ratio), captionLines: (text, width) => headingLines(text, 'caption', width, options) };
        }
        function buildItems(chosen, keys, options, includeTitle = true) {
            const items = [], pageWidth = paperDimensions(options).width - options.margin * 2;
            let diagramNumber = 0;
            const heading = (level, template, values, prefix = '') => {
                let text = fillTemplate(template || '', templateValues(options, values));
                if (text && options.uppercaseHeadings && ['category', 'key'].includes(level)) text = text.toLocaleUpperCase();
                if (text) text = prefix + text;
                if (!text) return;
                const lines = headingLines(text, level, pageWidth - 2, options);
                items.push({ kind: 'heading', level, text, lines,
                    height: Math.max(HEADING_HEIGHT[level] || 0, lines.length * textStyle(level, options).line + 4) });
            };
            if (includeTitle) {
                heading('title', options.title); heading('subtitle', options.subtitle);
                heading('author', options.author); heading('body', options.introduction);
                for (const field of ['publicationCode', 'publisher', 'edition', 'revision', 'copyright', 'license', 'website', 'dedication', 'learningGoal']) heading('body', options[field]);
            }
            heading('body', options.dateText); heading('body', options.tuningText); heading('body', options.rangeText);
            chosen.forEach((type, index) => {
                if (index && options.categoryBreak) items.push({ kind: 'break' });
                heading('category', options.category, { category: type.title }, options.headingNumbers ? (index + 1) + '. ' : '');
                heading('body', options.categoryNote, { category: type.title });
                heading('body', options.categoryIntro, { category: type.title });
                for (const [keyIndex, key] of keys.entries()) {
                    if (options.keyBreak && diagramNumber) items.push({ kind: 'break' });
                    heading('key', options.key, { category: type.title, key }, options.headingNumbers ? (index + 1) + '.' + (keyIndex + 1) + '. ' : '');
                    heading('body', options.keyNote, { category: type.title, key });
                    heading('body', options.keyIntro, { category: type.title, key });
                    for (const pattern of type.patterns) {
                        const values = { category: type.title, key, name: pattern.name, intervals: (pattern.intervals || []).join(' ') };
                        diagramNumber++;
                        const captionValues = templateValues(options, values);
                        const mainCaption = [options.captionPrefix, options.caption, options.captionSuffix].filter(Boolean).map(text => fillTemplate(text, captionValues)).filter(Boolean).join(' ');
                        let caption = [mainCaption, options.practicePrompt && fillTemplate(options.practicePrompt, captionValues), options.diagramCredit && fillTemplate(options.diagramCredit, captionValues)].filter(Boolean).join('\n');
                        if (options.uppercaseCaptions) caption = caption.toLocaleUpperCase();
                        items.push({ kind: 'diagram', typeId: type.id, pattern: pattern.id, ...values,
                            caption: caption && options.diagramNumbers ? diagramNumber + '. ' + caption : caption });
                    }
                }
            });
            return globalThis.FretboardBetaPreview ? FretboardBetaPreview.apply(items, options, { headingLines, textStyle, pageWidth }) : items;
        }
        function pageText(page, options, index, pages) {
            const first = page.items.find(item => item.kind === 'diagram');
            const values = templateValues(options, { ...first, page: index + 1, pages });
            return { header: fillTemplate(options.header || '', values), footer: fillTemplate(options.footer || '', values),
                number: options.pageNumbers === 'number' ? String(index + 1) : options.pageNumbers === 'total' ? 'Page ' + (index + 1) + ' of ' + pages : '' };
        }
        function safeFilePart(value) {
            return pdfSafeText(value).replace(/#/g, 'sharp').replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 90) || 'pattern';
        }
        function pdfSafeText(value) { return String(value).replaceAll('♭', 'b').replaceAll('♯', '#'); }
        function filePart(value) {
            return pdfSafeText(value).replace(/#/g, 'sharp').replace(/[<>:"\/\\|?*\x00-\x1f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || 'Unnamed';
        }
        function nameList(values, noun) {
            const joined = values.join('+');
            return joined.length > 60 && values.length > 1 ? values.length + ' ' + noun + 's' : joined;
        }
        function exportFileName(options, keys, chosen, suffix) {
            const keyNames = keys.map(filePart), typeNames = chosen.map(type => filePart(type.id.charAt(0).toUpperCase() + type.id.slice(1)));
            const selectionNames = chosen.flatMap(type => type.patterns.map(pattern => filePart(pattern.name)));
            const tuning = options.tuning.map(filePart).join('');
            const name = [nameList(keyNames, 'key'), typeNames.join('+'), nameList(selectionNames, 'pattern'), tuning, options.tuning.length, options.startFret, options.endFret].join(' - ');
            if (options.downloadName && globalThis.FretboardBetaAdvanced) {
                const values = { key: keys.join('+'), category: chosen.map(type => type.title).join('+'), name: chosen.flatMap(type => type.patterns.map(pattern => pattern.name)).join('+'), pattern: chosen.flatMap(type => type.patterns.map(pattern => pattern.id)).join('+'), number: chosen.reduce((sum, type) => sum + type.patterns.length * keys.length, 0) };
                return FretboardBetaAdvanced.filePart(fillTemplate(options.downloadName, values), options) + suffix;
            }
            const base = options.filenameCase === 'lower' ? name.toLocaleLowerCase() : options.filenameCase === 'upper' ? name.toLocaleUpperCase() : name;
            return base.slice(0, 255 - suffix.length) + suffix;
        }
        function downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob), link = document.createElement('a');
            link.href = url; link.download = filename;
            document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        class ExportCancelled extends Error {}
        function checkCancel() { if (cancelled) throw new ExportCancelled(); }
        function setBusy(busy) {
            exporting = busy; $('beta-close').disabled = busy;
            stopButton.disabled = false; stopButton.classList.toggle('is-visible', busy);
            exportButton.textContent = busy ? 'Exporting...' : 'Export';
            updateSummary();
        }
        async function renderItem(item, context, imageOptions = {}) {
            if (!context.preview) checkCancel();
            if (!context.preview) setStatus('Rendering ' + (context.done + 1) + '/' + context.total + ': ' + item.key + ' · ' + item.name);
            context.renderer.updatePattern(item.key, item.typeId, item.pattern);
            const native = svgSize(context.renderer.svg);
            const box = context.imageBox || boxSize(context.options, native.height / native.width, native.width * 25.4 / 96);
            const svg = globalThis.FretboardBetaAdvanced ? FretboardBetaAdvanced.layers(context.renderer.svg, context.options, item.key, value => value ? app.musicTheory.toSharp(value) : '') : context.renderer.svg;
            const vector = FretboardBetaFormats.decorateSvg(svg, context.options, box);
            const boxPx = { width: box.width * context.options.dpi / 25.4, height: box.height * context.options.dpi / 25.4 };
            const image = imageOptions.vector ? vector : await svgToImageBytes(vector, { background: context.options.background,
                transparent: context.options.transparent, quality: context.options.jpegQuality / 100, boxPx, ...imageOptions });
            context.done++;
            if (!context.lastYield || performance.now() - context.lastYield > 24) {
                await new Promise(resolve => setTimeout(resolve, 0)); context.lastYield = performance.now();
            }
            if (!context.preview) checkCancel(); return image;
        }
        function containedSize(image, width, height) {
            const scale = Math.min(width / image.width, height / image.height);
            return { width: image.width * scale, height: image.height * scale };
        }
        function newPdf(options) {
            const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
            const pdf = new JsPDF({ orientation: options.orientation, unit: 'mm', format: [paperDimensions(options).short, paperDimensions(options).long], compress: true });
            pdf.setProperties({ title: pdfSafeText(fillTemplate(options.title) || 'Fretboard selections'), author: pdfSafeText(options.author || '') });
            return pdf;
        }
        async function addPdfPage(pdf, page, config, context, index = 0, pages = 1) {
            const options = context.options, geometry = pageGeometry(page, config);
            const { width, height, cellWidth } = geometry;
            const pageLabels = pageText(page, options, index, pages);
            const font = pdfFonts[options.font], small = textStyle('caption', options);
            const textX = (x, width) => options.textAlign === 'center' ? x + width / 2 : options.textAlign === 'right' ? x + width : x;
            const applyStyle = style => { pdf.setFont(font, style.bold ? style.italic ? 'bolditalic' : 'bold' : style.italic ? 'italic' : 'normal'); pdf.setFontSize(style.size); pdf.setTextColor(style.color || options.textColor); };
            pdf.setTextColor(options.textColor);
            const smallText = (text, y, align = options.textAlign) => {
                applyStyle({ ...small, bold: false });
                const lines = config.captionLines(text, config.availableWidth);
                lines.forEach((line, i) => pdf.text(pdfSafeText(line), align === 'center' ? config.pageWidth / 2 : align === 'right' ? config.pageWidth - config.margin : config.margin, y + i * small.line, { align }));
                return lines.length * small.line;
            };
            if (pageLabels.header) smallText(pageLabels.header, config.margin + small.line);
            let footerY = config.pageHeight - config.margin - config.footerHeight + small.line;
            if (pageLabels.footer) footerY += smallText(pageLabels.footer, footerY);
            if (pageLabels.number) smallText(pageLabels.number, footerY, 'center');
            let y = config.margin + config.headerHeight + geometry.offsetY;
            context.imageBox = { width, height };
            const imageOffset = config.alignX === 'left' ? 0 : config.alignX === 'right' ? cellWidth - width : (cellWidth - width) / 2;
            for (const block of blocks(page.items)) {
                checkCancel();
                if (block.kind === 'heading') {
                    const style = textStyle(block.level, options); applyStyle(style);
                    block.lines.forEach((line, i) => pdf.text(pdfSafeText(line), textX(config.margin, config.availableWidth), y + 2 + style.line * (i + 1), { align: options.textAlign }));
                    y += block.height; continue;
                }
                for (let start = 0; start < block.items.length; start += page.columns) {
                    checkCancel();
                    const row = block.items.slice(start, start + page.columns), captionHeight = rowCaptionHeight(row, config, width);
                    for (let col = 0; col < row.length; col++) {
                        const item = row[col], image = await renderItem(item, context, { includeDataUrl: true });
                        const size = containedSize(image, width, height);
                        const x = config.margin + col * (cellWidth + config.gapX) + imageOffset;
                        const imageY = y + (options.captionPosition === 'above' ? captionHeight : 0);
                        pdf.addImage(image.dataUrl, 'PNG', x + (width - size.width) / 2, imageY + (height - size.height) / 2, size.width, size.height, undefined, 'FAST');
                        if (item.caption) {
                            applyStyle(small);
                            config.captionLines(item.caption, width).forEach((line, i) => pdf.text(pdfSafeText(line), textX(x, width), y + (options.captionPosition === 'below' ? height : 0) + small.line * (i + 1), { align: options.textAlign }));
                        }
                    }
                    y += height + rowCaptionHeight(row, config, width) + config.gapY;
                }
            }
        }
        async function makeDocx(pages, config, context) {
            const children = [], twips = mm => Math.round(mm * 1440 / 25.4), options = context.options;
            const none = { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
            const cellBorders = { top: none, bottom: none, left: none, right: none };
            const tableBorders = { ...cellBorders, insideHorizontal: none, insideVertical: none };
            const spacer = (pageBreakBefore = false, height = 0) => new docx.Paragraph({ pageBreakBefore,
                children: [new docx.TextRun({ text: '', size: 1 })], spacing: { before: 0, after: 0, line: Math.max(1, twips(height)), lineRule: 'exact' } });
            const paragraph = (lines, style, height, bold = false, alignment = options.textAlign, keepNext = false) => new docx.Paragraph({
                children: lines.map((line, i) => new docx.TextRun({ text: line, bold, color: style.color?.slice(1), italics: !!style.italic, size: Math.round(style.size * 2), ...(i ? { break: 1 } : {}) })),
                alignment, keepNext, spacing: { before: twips(2), after: twips(Math.max(0, height - 2 - lines.length * style.line)), line: twips(style.line), lineRule: 'exact' }
            });
            for (let index = 0; index < pages.length; index++) {
                checkCancel();
                const page = pages[index], geometry = pageGeometry(page, config);
                const { width, height, cellWidth } = geometry;
                const labels = pageText(page, options, index, pages.length);
                if (index) children.push(spacer(true));
                if (config.headerHeight) children.push(paragraph(config.captionLines(labels.header, config.availableWidth), textStyle('caption', options), config.headerHeight));
                if (geometry.offsetY) children.push(spacer(false, geometry.offsetY));
                context.imageBox = { width, height };
                const imageOffset = config.alignX === 'left' ? 0 : config.alignX === 'right' ? cellWidth - width : (cellWidth - width) / 2;
                for (const block of blocks(page.items)) {
                    checkCancel();
                    if (block.kind === 'heading') {
                        children.push(paragraph(block.lines, textStyle(block.level, options), block.height, textStyle(block.level, options).bold, options.textAlign, true));
                        continue;
                    }
                    const widths = Array.from({ length: page.columns }, (_, col) => twips(cellWidth + (col < page.columns - 1 ? config.gapX : 0)));
                    const rows = [];
                    for (let start = 0; start < block.items.length; start += page.columns) {
                        checkCancel();
                        const cells = [], row = block.items.slice(start, start + page.columns);
                        for (let col = 0; col < page.columns; col++) {
                            const item = row[col], content = [];
                            const indent = { left: twips(imageOffset), right: twips(Math.max(0, cellWidth - imageOffset - width)) };
                            if (item) {
                                const image = await renderItem(item, context);
                                const size = containedSize(image, width, height), padding = (height - size.height) / 2;
                                content.push(new docx.Paragraph({ alignment: docx.AlignmentType.LEFT, indent,
                                    children: [new docx.ImageRun({ data: image.bytes, transformation: { width: size.width * 96 / 25.4, height: size.height * 96 / 25.4 } })],
                                    // Inline drawings need an automatic line height; an exact text line clips them in Word.
                                    spacing: { before: twips(padding), after: twips(padding), line: 240, lineRule: 'auto' } }));
                                const captionHeight = rowCaptionHeight(row, config, width);
                                if (item.caption) {
                                    const lines = config.captionLines(item.caption, width);
                                    content.push(new docx.Paragraph({ alignment: options.textAlign, indent,
                                        children: lines.map((line, i) => new docx.TextRun({ text: line, color: textStyle('caption', options).color.slice(1), size: Math.round(options.captionSize * 2), bold: options.captionBold, ...(i ? { break: 1 } : {}) })),
                                        spacing: { before: 0, after: twips(captionHeight - lines.length * config.captionLine), line: twips(config.captionLine), lineRule: 'exact' } }));
                                } else if (captionHeight) content.push(spacer(false, captionHeight));
                                if (options.captionPosition === 'above') content.reverse();
                            } else content.push(spacer());
                            cells.push(new docx.TableCell({ width: { size: widths[col], type: docx.WidthType.DXA }, borders: cellBorders,
                                margins: { top: 0, bottom: twips(config.gapY), left: 0, right: col < page.columns - 1 ? twips(config.gapX) : 0 }, children: content }));
                        }
                        rows.push(new docx.TableRow({ cantSplit: true, children: cells }));
                    }
                    children.push(new docx.Table({ rows, layout: docx.TableLayoutType.FIXED, columnWidths: widths,
                        width: { size: twips(config.availableWidth), type: docx.WidthType.DXA }, borders: tableBorders }));
                    children.push(spacer());
                }
                if (config.footerHeight) {
                    children.push(spacer(false, Math.max(0, config.availableHeight - geometry.usedHeight - geometry.offsetY) + 2));
                    const lines = labels.footer ? config.captionLines(labels.footer, config.availableWidth) : [];
                    if (lines.length) children.push(paragraph(lines, textStyle('caption', options), lines.length * config.captionLine + 2));
                    if (labels.number) children.push(paragraph([labels.number], textStyle('caption', options), config.captionLine + 2, false, 'center'));
                }
            }
            checkCancel(); setStatus('Building Word document...');
            const paper = paperDimensions(options);
            // docx swaps portrait dimensions when landscape is selected.
            const file = new docx.Document({ creator: options.author || '', title: options.title || '',
                styles: { default: { document: { run: { font: options.font, color: options.textColor.slice(1) } } } },
                sections: [{ properties: { page: {
                    size: { width: twips(paper.short), height: twips(paper.long), orientation: options.orientation },
                    margin: { top: twips(config.margin), right: twips(config.margin), bottom: twips(config.margin), left: twips(config.margin) }
                } }, children }] });
            return docx.Packer.toBlob(file);
        }
        function shrinkNote(pages, config) {
            const count = config.explicitSize ? pages.filter(page => page.scale < 0.999).length : 0;
            return count ? ' ' + count + ' page(s) scaled down to fit the requested size.' : '';
        }
        async function runExport(kind) {
            if (exporting) return;
            const chosen = selectedPatterns(), keys = selectedKeys();
            const total = chosen.reduce((sum, type) => sum + type.patterns.length * keys.length, 0);
            if (!total) return;
            let options;
            try { refreshFromApp(); options = readOptions(); }
            catch (error) { setStatus(error.message); return; }
            if (kind === 'docx' && typeof docx === 'undefined') { setStatus('Word support is unavailable.'); return; }
            if (kind.startsWith('pdf') && !(window.jspdf?.jsPDF || window.jsPDF)) { setStatus('PDF support is unavailable.'); return; }
            if (kind.endsWith('zip') && typeof JSZip === 'undefined') { setStatus('ZIP support is unavailable.'); return; }
            if (total > 600 && !confirm('This will export ' + total + ' diagrams. Continue?')) return;
            cancelled = false; setBusy(true); setStatus('Preparing ' + total + ' selected diagrams...');
            const job = jobs.find(job => job[0] === kind);
            let resource, context, archiveSink;
            try {
                if (total > 300 && ['pdf-zip', 'jpg-zip', 'png-zip', 'svg-zip', 'webp-zip', 'markdown-zip', 'svg-pages-zip', 'png-pages-zip', 'jpg-pages-zip'].includes(kind) && globalThis.FretboardBetaStream) {
                    archiveSink = await FretboardBetaStream.create(exportFileName(options, keys, chosen, job[2]), downloadBlob);
                    setStatus(archiveSink.writer ? 'Streaming archive directly to disk...' : 'Large collection: saving ZIPs in groups of 250. Allow multiple downloads.');
                }
                const paged = ['docx', 'pdf-single', 'html', 'svg-pages-zip', 'png-pages-zip', 'jpg-pages-zip', ...FretboardBetaPublishing.pagedKinds].includes(kind);
                const items = buildItems(chosen, keys, options, kind !== 'pdf-zip');
                const diagrams = items.filter(item => item.kind === 'diagram');
                if (!diagrams.length) throw new Error('No diagrams remain. Reset preview edits or select more patterns.');
                context = { options, done: 0, total: diagrams.length };
                let blob, note = '';
                if (FretboardBetaPublishing.catalogKinds.includes(kind)) {
                    blob = FretboardBetaPublishing.catalog(kind, items, options); context.done = total;
                } else if (['csv', 'tsv', 'json', 'txt', ...FretboardBetaExtraFormats.catalogKinds].includes(kind)) {
                    blob = FretboardBetaExtraFormats.catalogKinds.includes(kind) ? FretboardBetaExtraFormats.catalog(kind, items, options, textStyle) : FretboardBetaFormats.catalog(kind, items, options); context.done = total;
                } else {
                    resource = createRenderer(options); context.renderer = resource.renderer;
                    const first = diagrams[0];
                    resource.renderer.updatePattern(first.key, first.typeId, first.pattern);
                    const native = svgSize(resource.renderer.svg), ratio = native.height / native.width;
                    const config = exportConfig(options, ratio, items);
                    if (paged) {
                        const allPages = planPages(items, config, diagrams.length > 300 ? Math.min(options.perPage || 250, 250) : options.perPage);
                        note = shrinkNote(allPages, config);
                        const batches = diagrams.length > 300 && !archiveSink ? FretboardBetaLayout.batchPages(allPages) : [allPages];
                        for (const [part, pages] of batches.entries()) {
                            if (FretboardBetaPublishing.pagedKinds.includes(kind)) blob = await FretboardBetaPublishing.paged(kind, pages, config, context, { renderItem, textStyle, pageText, checkCancel });
                            else if (kind === 'docx') blob = await makeDocx(pages, config, context);
                            else if (kind === 'pdf-single') {
                                const pdf = newPdf(options), paper = paperDimensions(options);
                                for (let i = 0; i < pages.length; i++) {
                                    checkCancel(); if (i) pdf.addPage([paper.short, paper.long], options.orientation);
                                    await addPdfPage(pdf, pages[i], config, context, i, pages.length);
                                }
                                blob = pdf.output('blob');
                            } else {
                                const zip = kind.endsWith('pages-zip') ? archiveSink || new JSZip() : null, rendered = [], usedNames = new Set();
                                const pageName = (index, extension) => globalThis.FretboardBetaAdvanced ? FretboardBetaAdvanced.entryName({ name: 'page', pattern: 'page', key: '', category: '' }, index, options, extension, usedNames) : 'page-' + String(index + 1).padStart(3, '0') + '.' + extension;
                                const rasterPage = kind === 'png-pages-zip' || kind === 'jpg-pages-zip';
                                for (let i = 0; i < pages.length; i++) {
                                    checkCancel();
                                    const markup = await FretboardBetaFormats.pageSvg(pages[i], config, context, i, pages.length, { renderItem: rasterPage ? (item, ctx) => renderItem(item, ctx, { includeDataUrl: true }) : renderItem, textStyle, pageText, checkCancel });
                                    if (rasterPage) {
                                        const extension = kind === 'jpg-pages-zip' ? 'jpg' : 'png';
                                        const image = await svgToImageBytes({ markup, width: config.pageWidth, height: config.pageHeight }, { background: '#ffffff', mimeType: extension === 'jpg' ? 'image/jpeg' : 'image/png', quality: options.jpegQuality / 100, boxPx: { width: config.pageWidth * options.dpi / 25.4, height: config.pageHeight * options.dpi / 25.4 } });
                                        checkCancel(); zip.file(pageName(i, extension), image.bytes);
                                    } else if (zip) zip.file(pageName(i, 'svg'), markup);
                                    else rendered.push(markup);
                                    if (archiveSink) await archiveSink.flush(checkCancel);
                                }
                                blob = zip ? globalThis.FretboardBetaAdvanced ? await FretboardBetaAdvanced.archive(zip, kind, items, options, checkCancel) : await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }, checkCancel) : new Blob([FretboardBetaFormats.htmlCollection(rendered, options, config)], { type: 'text/html;charset=utf-8' });
                            }
                            if (batches.length > 1) {
                                checkCancel();
                                const filename = exportFileName(options, keys, chosen, job[2]);
                                downloadBlob(blob, filename.slice(0, -job[2].length) + '-part-' + String(part + 1).padStart(3, '0') + job[2]);
                                blob = null;
                            }
                        }
                        if (batches.length > 1) note += ' Saved as ' + batches.length + ' document parts. Allow multiple downloads; page numbering restarts in each part.';
                    } else if (FretboardBetaPublishing.markupKinds.includes(kind)) {
                        blob = await FretboardBetaPublishing.markup(kind, items, context, { renderItem, checkCancel });
                    } else {
                        const zip = archiveSink || new JSZip(), files = new Map(), usedNames = new Set();
                        let shrunk = 0;
                        for (let i = 0; i < diagrams.length; i++) {
                            checkCancel();
                            const item = diagrams[i], sequence = String(i + 1).padStart(3, '0');
                            const filename = safeFilePart(item.category) + '/' + sequence + '_' + safeFilePart(item.key) + '_' + safeFilePart(item.name);
                            const entry = extension => globalThis.FretboardBetaAdvanced ? FretboardBetaAdvanced.entryName(item, i, options, extension, usedNames) : kind === 'pdf-zip' ? sequence + '_' + safeFilePart(item.category) + '_' + safeFilePart(item.key) + '_' + safeFilePart(item.name) + '.' + extension : filename + '.' + extension;
                            if (kind === 'pdf-zip') {
                                const type = { id: item.typeId, title: item.category, patterns: [{ id: item.pattern, name: item.name }] };
                                const singleOptions = { ...options, perPage: 1, columns: 1 };
                                const singleItems = buildItems([type], [item.key], singleOptions, false);
                                const original = singleItems.find(x => x.kind === 'diagram');
                                original.caption = item.caption;
                                const singleConfig = exportConfig(singleOptions, ratio, singleItems);
                                const pages = planPages(singleItems, singleConfig, 1), pdf = newPdf({ ...options, title: '' });
                                await addPdfPage(pdf, pages[0], singleConfig, context);
                                if (singleConfig.explicitSize && pages[0].scale < 0.999) shrunk++;
                                zip.file(entry('pdf'), pdf.output('blob'));
                            } else if (kind === 'svg-zip') {
                                const image = await renderItem(item, context, { vector: true });
                                zip.file(entry('svg'), image.markup);
                            } else {
                                const extension = kind === 'jpg-zip' ? 'jpg' : kind === 'webp-zip' ? 'webp' : 'png';
                                const mimeType = extension === 'jpg' ? 'image/jpeg' : 'image/' + extension;
                                const image = await renderItem(item, context, { mimeType });
                                const path = entry(extension);
                                zip.file(path, image.bytes);
                                files.set(item, path);
                            }
                            if (archiveSink) await archiveSink.flush(checkCancel);
                        }
                        if (kind === 'markdown-zip') zip.file('README.md', FretboardBetaFormats.markdown(items, files));
                        if (shrunk) note = ' ' + shrunk + ' page(s) scaled down to fit the requested size.';
                        checkCancel(); setStatus('Building ZIP...');
                        blob = globalThis.FretboardBetaAdvanced ? await FretboardBetaAdvanced.archive(zip, kind, items, options, checkCancel) : await zip.generateAsync({ type: 'blob', compression: ['jpg-zip', 'webp-zip', 'png-zip'].includes(kind) ? 'STORE' : 'DEFLATE' }, checkCancel);
                    }
                }
                checkCancel(); if (blob) downloadBlob(blob, exportFileName(options, keys, chosen, job[2]));
                if (archiveSink) note += archiveSink.note;
                setStatus(job[1] + ' downloaded for ' + context.done + ' selected diagrams.' + note);
            } catch (error) {
                if (error instanceof ExportCancelled) setStatus('Export cancelled after ' + (context?.done || 0) + ' diagrams.');
                else { console.error('Beta export failed:', error); setStatus(error.message || 'Export failed.'); }
            } finally { await archiveSink?.abort(); resource?.dispose(); setBusy(false); }
        }
        globalThis.FretboardBetaEditorAPI = { snapshot() { refreshFromApp(); const options = readOptions(); return { options, items: buildItems(selectedPatterns(), selectedKeys(), options) }; }, createRenderer, svgSize, exportConfig, renderItem, textStyle, pageText, isBusy: () => exporting };
        exportButton.addEventListener('click', () => runExport(formatSelect.value));
        stopButton.addEventListener('click', () => { cancelled = true; stopButton.disabled = true; setStatus('Stopping after the current image...'); });
        const configManager = FretboardBetaConfig.setup({
            getSelection: () => ({ keys: selectedKeys(), patterns: Object.fromEntries(TYPES.map(type => [type.id, patternInputs.filter(item => item.type === type.id && item.input.checked).map(item => item.id)])) }),
            applySelection: config => {
                const keys = new Set(config.keys || []);
                keyInputs.forEach(item => { item.input.checked = keys.has(item.note); });
                patternInputs.forEach(item => { item.input.checked = (config.patterns?.[item.type] || []).includes(item.id); });
                updateSummary();
            },
            getOptions: readOptions, applyOptions, setStatus,
            resetOptions: () => { FretboardBetaOptions.apply(FretboardBetaOptions.defaults()); dirty.clear(); refreshFromApp(); applyPatternOrder(); applyFilters(); }
        });
        refreshFromApp(); updateSummary();
    });
})();
