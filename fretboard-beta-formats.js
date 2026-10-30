(() => {
    'use strict';
    const formats = [
        ['docx', 'Word document (DOCX)', '.docx'], ['pdf-zip', 'Individual PDFs (ZIP)', '-pdfs.zip'],
        ['pdf-single', 'Combined PDF', '.pdf'], ['jpg-zip', 'JPG diagrams (ZIP)', '-jpgs.zip'],
        ['png-zip', 'PNG diagrams (ZIP)', '-pngs.zip'], ['svg-zip', 'SVG diagrams (ZIP)', '-svgs.zip'],
        ['webp-zip', 'WebP diagrams (ZIP)', '-webps.zip'], ['html', 'Standalone HTML collection', '.html'],
        ['markdown-zip', 'Markdown + PNGs (ZIP)', '-markdown.zip'], ['csv', 'CSV catalog', '.csv'],
        ['json', 'JSON catalog + settings', '.json'], ['tsv', 'TSV catalog', '.tsv'],
        ['txt', 'Plain text catalog', '.txt'], ['svg-pages-zip', 'Paged SVG collection (ZIP)', '-svg-pages.zip'],
        ...FretboardBetaExtraFormats.formats,
        ...FretboardBetaPublishing.formats
    ];
    const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
    const svgUrl = markup => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
    let sequence = 0;
    function decorateSvg(svg, options, box) {
        const clone = svg.cloneNode(true), width = box.width, height = box.height;
        const pad = Math.min(width, height) * options.padding / 100;
        clone.setAttribute('x', String(pad)); clone.setAttribute('y', String(pad));
        clone.setAttribute('width', String(width - pad * 2)); clone.setAttribute('height', String(height - pad * 2));
        clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        clone.setAttribute('opacity', String(options.diagramOpacity));
        const id = 'beta-gray-' + (++sequence);
        const defs = options.grayscale ? '<defs><filter id="' + id + '" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter></defs>' : '';
        let content = new XMLSerializer().serializeToString(clone);
        if (options.mirrorHorizontal || options.mirrorVertical) content = '<g transform="translate(' + (options.mirrorHorizontal ? width : 0) + ' ' + (options.mirrorVertical ? height : 0) + ') scale(' + (options.mirrorHorizontal ? -1 : 1) + ' ' + (options.mirrorVertical ? -1 : 1) + ')">' + content + '</g>';
        if (options.rotateDiagram) content = '<g transform="rotate(180 ' + width / 2 + ' ' + height / 2 + ')">' + content + '</g>';
        const background = options.transparent ? '' : '<rect width="100%" height="100%" fill="' + options.background + '"/>';
        const border = options.borderStyle === 'none' ? '' : '<rect x="' + options.borderWidth / 2 + '" y="' + options.borderWidth / 2 + '" width="' + Math.max(0, width - options.borderWidth) + '" height="' + Math.max(0, height - options.borderWidth) + '" fill="none" stroke="' + options.borderColor + '" stroke-width="' + options.borderWidth + '"' + (options.borderStyle === 'dashed' ? ' stroke-dasharray="2 1"' : '') + '/>';
        const markup = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'mm" height="' + height + 'mm" viewBox="0 0 ' + width + ' ' + height + '">' + defs + background + (options.grayscale ? '<g filter="url(#' + id + ')">' + content + '</g>' : content) + border + (globalThis.FretboardBetaAdvanced ? FretboardBetaAdvanced.watermark(options, width, height) : '') + '</svg>';
        return { markup, width, height, dataUrl: svgUrl(markup) };
    }
    function catalog(kind, items, options) {
        const diagrams = items.filter(item => item.kind === 'diagram');
        if (kind === 'json') return new Blob([JSON.stringify({ version: 1, options, items }, null, 2)], { type: 'application/json' });
        if (kind === 'txt') {
            const text = items.map(item => item.kind === 'heading' ? item.text : item.kind === 'diagram' ? item.key + ' | ' + item.category + ' | ' + item.name + (item.caption ? '\n' + item.caption : '') : '').join('\n\n');
            return new Blob([text], { type: 'text/plain;charset=utf-8' });
        }
        if (globalThis.FretboardBetaAdvanced) return FretboardBetaAdvanced.delimited(kind, items, options);
        const delimiter = kind === 'tsv' ? '\t' : ',';
        const cell = value => {
            let text = String(value);
            // Prevent spreadsheet formulas when a catalog contains custom captions.
            if (/^[=+@\-\t\r\n]/.test(text)) text = "'" + text;
            return '"' + text.replaceAll('"', '""') + '"';
        };
        const rows = [['Number', 'Category', 'Key', 'Pattern ID', 'Name', 'Caption', 'Intervals', 'Tuning', 'Start fret', 'End fret'],
            ...diagrams.map((item, index) => [index + 1, item.category, item.key, item.pattern, item.name, item.caption, item.intervals || '', options.tuning.join(' '), options.startFret, options.endFret])];
        return new Blob(['\ufeff' + rows.map(row => row.map(cell).join(delimiter)).join('\r\n')], { type: kind === 'tsv' ? 'text/tab-separated-values;charset=utf-8' : 'text/csv;charset=utf-8' });
    }
    function markdown(items, files) {
        const safe = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\\`*_\[\]#]/g, '\\$&');
        return items.map(item => item.kind === 'heading' ? (item.level === 'title' ? '# ' : ['category', 'key'].includes(item.level) ? '## ' : '') + safe(item.text) : item.kind === 'diagram' ? (item.caption ? safe(item.caption) + '\n\n' : '') + '![' + safe(item.name) + '](' + files.get(item).split('/').map(part => encodeURIComponent(part).replace(/[()']/g, char => '%' + char.charCodeAt(0).toString(16))).join('/') + ')' : '').join('\n\n') + '\n';
    }
    async function pageSvg(page, config, context, index, total, api) {
        const { pageGeometry, blocks, rowCaptionHeight } = FretboardBetaLayout;
        const o = context.options, g = pageGeometry(page, config), labels = api.pageText(page, o, index, total);
        const parts = [], align = o.textAlign;
        const xAt = (x, width, alignment) => alignment === 'center' ? x + width / 2 : alignment === 'right' ? x + width : x;
        const text = (lines, x, y, width, style, alignment = align) => lines.forEach((line, i) => parts.push('<text x="' + xAt(x, width, alignment) + '" y="' + (y + style.line * (i + 1)) + '" text-anchor="' + (alignment === 'center' ? 'middle' : alignment === 'right' ? 'end' : 'start') + '" font-family="' + escape(o.font) + '" font-size="' + style.size * 25.4 / 72 + '" font-weight="' + (style.bold ? 'bold' : 'normal') + '" font-style="' + (style.italic ? 'italic' : 'normal') + '" fill="' + (style.color || o.textColor) + '">' + escape(line) + '</text>'));
        const small = api.textStyle('caption', o);
        if (labels.header) text(config.captionLines(labels.header, config.availableWidth), config.margin, config.margin, config.availableWidth, small);
        let footerY = config.pageHeight - config.margin - config.footerHeight;
        if (labels.footer) { const lines = config.captionLines(labels.footer, config.availableWidth); text(lines, config.margin, footerY, config.availableWidth, small); footerY += lines.length * small.line; }
        if (labels.number) text([labels.number], config.margin, footerY, config.availableWidth, small, 'center');
        let y = config.margin + config.headerHeight + g.offsetY;
        context.imageBox = { width: g.width, height: g.height };
        const imageOffset = config.alignX === 'left' ? 0 : config.alignX === 'right' ? g.cellWidth - g.width : (g.cellWidth - g.width) / 2;
        for (const block of blocks(page.items)) {
            api.checkCancel();
            if (block.kind === 'heading') {
                if (context.preview) parts.push('<g data-preview-id="' + escape(block.editorId) + '">');
                text(block.lines, config.margin, y + 2, config.availableWidth, api.textStyle(block.level, o));
                if (context.preview) parts.push('</g>');
                y += block.height; continue;
            }
            for (let start = 0; start < block.items.length; start += page.columns) {
                const row = block.items.slice(start, start + page.columns), caption = rowCaptionHeight(row, config, g.width);
                for (let col = 0; col < row.length; col++) {
                    const item = row[col], image = await api.renderItem(item, context, { vector: true });
                    if (context.preview) parts.push('<g data-preview-id="' + escape(item.editorId) + '">');
                    const x = config.margin + col * (g.cellWidth + config.gapX) + imageOffset;
                    const imageY = y + (o.captionPosition === 'above' ? caption : 0);
                    parts.push('<image x="' + x + '" y="' + imageY + '" width="' + g.width + '" height="' + g.height + '" href="' + escape(image.dataUrl) + '"/>');
                    if (item.caption) text(config.captionLines(item.caption, g.width), x, y + (o.captionPosition === 'below' ? g.height : 0), g.width, small);
                    if (context.preview) parts.push('</g>');
                }
                y += g.height + caption + config.gapY;
            }
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + config.pageWidth + 'mm" height="' + config.pageHeight + 'mm" viewBox="0 0 ' + config.pageWidth + ' ' + config.pageHeight + '"><rect width="100%" height="100%" fill="white"/>' + parts.join('') + '</svg>';
    }
    function htmlCollection(pages, options, config) {
        if (globalThis.FretboardBetaAdvanced) return FretboardBetaAdvanced.reader(pages, options, config);
        return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escape(options.title || 'Fretboards') + '</title><style>body{margin:0;background:#e8e8e8}main{display:grid;gap:20px;padding:20px}.page{margin:auto;width:min(100%, ' + config.pageWidth + 'mm);background:white;box-shadow:0 2px 12px #0002}.page>svg{display:block;width:100%;height:auto}@page{size:' + config.pageWidth + 'mm ' + config.pageHeight + 'mm;margin:0}@media print{body{background:white}main{display:block;padding:0}.page{width:100%;box-shadow:none;break-after:page}.page:last-child{break-after:auto}}</style></head><body><main>' + pages.map(svg => '<section class="page">' + svg + '</section>').join('') + '</main></body></html>';
    }
    globalThis.FretboardBetaFormats = { formats, escape, svgUrl, decorateSvg, catalog, markdown, pageSvg, htmlCollection };
})();
