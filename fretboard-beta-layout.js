(() => {
    'use strict';
    const HEADING_HEIGHT = { title: 13, category: 13, key: 9 };
    function fillTemplate(template, values = {}) {
        return String(template).replace(/{([^{}]+)}/g, (_, key) => values[key] ?? '').trim();
    }
    function parseTuning(text) {
        const notes = text.trim().split(/[\s,.-]+/).filter(Boolean);
        if (!notes.length || notes.length > 20) throw new Error('Tuning must contain 1 to 20 notes, low to high.');
        return notes.map(note => {
            const match = /^([a-g])([#b♯♭]?)$/i.exec(note);
            if (!match) throw new Error('Invalid tuning note: ' + note + '. Use note names such as E, F#, or Bb.');
            return match[1].toUpperCase() + match[2].replace('♯', '#').replace('♭', 'b').replace('B', 'b');
        });
    }
    function boxSize(options, ratio, baseWidth = 100) {
        const width = options.width || (options.height ? options.height / ratio : baseWidth);
        return { width, height: options.height || width * ratio };
    }
    const PAPER = { a4: [210, 297], a3: [297, 420], letter: [215.9, 279.4], legal: [215.9, 355.6] };
    function paperDimensions(options) {
        const dimensions = options.paper === 'custom' ? [options.customWidth, options.customHeight] : PAPER[options.paper || 'a4'];
        const short = Math.min(...dimensions), long = Math.max(...dimensions);
        return options.orientation === 'portrait' ? { width: short, height: long, short, long } : { width: long, height: short, short, long };
    }
    function layoutConfig(options, ratio) {
        const paper = paperDimensions(options), margin = options.margin ?? 12;
        const gapX = options.gapX ?? 4, gapY = options.gapY ?? 4;
        const columns = options.columns ?? 1, availableWidth = paper.width - margin * 2;
        const headerHeight = options.headerHeight || 0, footerHeight = options.footerHeight || 0;
        return { ...boxSize(options, ratio, columns ? (availableWidth - (columns - 1) * gapX) / columns : 80),
            pageWidth: paper.width, pageHeight: paper.height, availableWidth,
            availableHeight: paper.height - margin * 2 - 4 - headerHeight - footerHeight,
            margin, headerHeight, footerHeight, columns, gapX, gapY, gap: gapY,
            alignX: options.alignX || 'center', alignY: options.alignY || 'top',
            captionLine: (options.captionSize || 8) * 25.4 / 72 * 1.17 * (options.lineSpacing || 1),
            captionHeight: options.caption.trim() ? Math.max(8, (options.captionSize || 8) * 25.4 / 72 * 1.17 * (options.lineSpacing || 1) + 2) : 0,
            explicitSize: !!(options.width || options.height) };
    }
    function blocks(items) {
        const result = [];
        for (const item of items) {
            if (item.kind === 'heading') result.push(item);
            else {
                if (result.at(-1)?.kind !== 'grid') result.push({ kind: 'grid', items: [] });
                result.at(-1).items.push(item);
            }
        }
        return result;
    }
    function rowCaptionHeight(items, config, width) {
        if (!config.captionHeight) return 0;
        if (!config.captionLines) return config.captionHeight;
        return Math.max(config.captionHeight, ...items.map(item => item.caption ? config.captionLines(item.caption, width).length * config.captionLine + 2 : 0));
    }
    function contentHeight(items, config, columns, scale) {
        let height = 0;
        for (const block of blocks(items)) {
            if (block.kind === 'heading') height += block.height || HEADING_HEIGHT[block.level];
            else for (let i = 0; i < block.items.length; i += columns) height += config.height * scale + rowCaptionHeight(block.items.slice(i, i + columns), config, config.width * scale) + config.gapY;
        }
        return height;
    }
    function fit(items, config, cap) {
        const groups = blocks(items), diagrams = groups.filter(group => group.kind === 'grid');
        const count = Math.max(...diagrams.map(group => group.items.length));
        const headingHeight = groups.reduce((sum, block) => sum + (block.kind === 'heading' ? block.height || HEADING_HEIGHT[block.level] : 0), 0);
        let best = { scale: 0, columns: 1 };
        const choices = config.columns ? [config.columns] : Array.from({ length: count }, (_, i) => i + 1);
        for (const columns of choices) {
            const rows = diagrams.reduce((sum, group) => sum + Math.ceil(group.items.length / columns), 0);
            const widthScale = (config.availableWidth - (columns - 1) * config.gapX) / (columns * config.width);
            // Further columns only reduce this upper bound, so cannot improve the best fit.
            if (best.scale > 0 && widthScale <= best.scale + 1e-8) break;
            const heightScale = (config.availableHeight - headingHeight - rows * (config.captionHeight + config.gapY)) / (rows * config.height);
            let scale = Math.min(cap, widthScale, heightScale);
            for (let attempt = 0; scale > 0 && attempt < 32; attempt++) {
                const used = contentHeight(items, config, columns, scale);
                if (used <= config.availableHeight + 1e-8) break;
                const next = scale - (used - config.availableHeight) / (rows * config.height);
                scale = attempt === 31 ? 0 : next;
            }
            if (scale > best.scale + 1e-8) best = { scale, columns };
        }
        if (best.scale <= 0) throw new Error('The text leaves no room for a diagram. Shorten the headings or remove some text.');
        return best;
    }
    function planPages(items, config, perPage) {
        const pages = [];
        const cap = config.explicitSize ? 1 : Infinity;
        let current = [], pending = [], count = 0;
        const flush = () => {
            if (count) pages.push({ items: current, ...fit(current, config, cap) });
            current = []; count = 0;
        };
        for (const item of items) {
            if (item.kind === 'break') { flush(); continue; }
            if (item.kind === 'heading') { pending.push(item); continue; }
            const trial = current.concat(pending, item);
            let fits = true;
            if (count) {
                try { const layout = fit(trial, config, cap); fits = perPage ? true : layout.scale >= 1 - 1e-8; }
                catch (_) { fits = false; }
            }
            if (count && ((perPage && count >= perPage) || !fits)) flush();
            current.push(...pending, item); pending = []; count++;
        }
        flush();
        return pages;
    }
    function batchPages(pages, maximum = 250) {
        const batches = []; let batch = [], count = 0;
        for (const page of pages) {
            const diagrams = page.items.filter(item => item.kind === 'diagram').length;
            if (batch.length && count + diagrams > maximum) { batches.push(batch); batch = []; count = 0; }
            batch.push(page); count += diagrams;
        }
        if (batch.length) batches.push(batch);
        return batches;
    }
    function pageGeometry(page, config) {
        const height = contentHeight(page.items, config, page.columns, page.scale);
        const slack = Math.max(0, config.availableHeight - height);
        return { width: config.width * page.scale, height: config.height * page.scale,
            cellWidth: (config.availableWidth - (page.columns - 1) * config.gapX) / page.columns,
            usedHeight: height, offsetY: config.alignY === 'center' ? slack / 2 : config.alignY === 'bottom' ? slack : 0 };
    }
    globalThis.FretboardBetaLayout = { fillTemplate, parseTuning, boxSize, paperDimensions, layoutConfig, blocks, fit, planPages, batchPages, rowCaptionHeight, contentHeight, pageGeometry, HEADING_HEIGHT };
})();
