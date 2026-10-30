(() => {
    'use strict';
    const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    function layers(svg, options, key, normalize = value => value) {
        const clone = svg.cloneNode(true);
        for (const [name, selector] of [['layerStrings', '.string'], ['layerFrets', '.fret'], ['layerInlays', '.fret-marker'], ['layerTuning', '.string-label'], ['layerNumbers', '.fret-number'], ['layerLabels', '.note-marker-group text']]) {
            if (options[name] === false) clone.querySelectorAll(selector).forEach(node => node.remove());
        }
        for (const [name, selector] of [['layerStringColor', '.string'], ['layerFretColor', '.fret']]) {
            if (options[name]) clone.querySelectorAll(selector).forEach(node => node.setAttribute('stroke', options[name]));
        }
        clone.querySelectorAll('.note-marker-group').forEach(group => {
            const root = normalize(group.querySelector('[data-pitch]')?.getAttribute('data-pitch')) === normalize(key);
            if ((options.rootsOnly && !root) || (options.hideOpenNotes && group.getAttribute('data-fret') === '0')) { group.remove(); return; }
            const color = root ? options.layerRootColor : options.layerNoteColor;
            if (color) group.querySelectorAll('.note-marker').forEach(node => {
                const original = node.getAttribute('fill');
                for (const attribute of ['fill', 'stroke']) node.querySelectorAll('[' + attribute + ']').forEach(child => {
                    if (child.getAttribute(attribute) === original) child.setAttribute(attribute, color);
                });
                node.setAttribute('fill', color);
            });
            if (options.layerLabelColor) group.querySelectorAll('text').forEach(node => node.setAttribute('fill', options.layerLabelColor));
        });
        return clone;
    }
    function watermark(options, width, height) {
        if (!options.watermarkText) return '';
        const size = height * options.watermarkSize / 100, pad = height * options.watermarkPadding / 100;
        const text = String(options.watermarkText).replace(/[\r\n]+/g, ' ');
        const tracking = size * options.watermarkTracking / 100;
        const boxWidth = Math.max(size, text.length * (size * .62 + tracking)) + 2 * pad;
        const boxHeight = size * 1.3 + 2 * pad;
        const coordinates = options.watermarkRepeat ? [-1, 0, 1].flatMap(row => [-1, 0, 1].map(col => [options.watermarkX / 100 * width + col * width / 3, options.watermarkY / 100 * height + row * height / 3])) : [[options.watermarkX / 100 * width, options.watermarkY / 100 * height]];
        return coordinates.map(([x, y]) => '<g transform="translate(' + x + ' ' + y + ') rotate(' + options.watermarkAngle + ')"><rect x="' + (-boxWidth / 2) + '" y="' + (-boxHeight / 2) + '" width="' + boxWidth + '" height="' + boxHeight + '" fill="' + options.watermarkBackground + '" opacity="' + options.watermarkBackgroundOpacity + '"/><text text-anchor="middle" dominant-baseline="central" font-family="' + escape(options.watermarkFont) + '" font-size="' + size + '" fill="' + options.watermarkColor + '" opacity="' + options.watermarkOpacity + '" font-weight="' + (options.watermarkWeight ? 'bold' : 'normal') + '" font-style="' + (options.watermarkItalic ? 'italic' : 'normal') + '" letter-spacing="' + tracking + '">' + escape(text) + '</text></g>').join('');
    }
    const columns = [
        ['columnNumber', 'Number'], ['columnCategory', 'Category'], ['columnKey', 'Key'], ['columnPattern', 'Pattern ID'], ['columnName', 'Name'],
        ['columnCaption', 'Caption'], ['columnIntervals', 'Intervals'], ['columnTuning', 'Tuning'], ['columnStart', 'Start fret'], ['columnEnd', 'End fret']
    ];
    function table(items, options) {
        const included = columns.flatMap(([key], index) => options[key] === false ? [] : [index]);
        if (!included.length) throw new Error('Choose at least one column in Data Tables.');
        const rows = items.filter(item => item.kind === 'diagram').map((item, index) => [index + 1, item.category, item.key, item.pattern, item.name, item.caption, item.intervals || '', options.tuning.join(' '), options.startFret, options.endFret]);
        if (options.tableHeader !== false) rows.unshift(columns.map(([, label]) => label));
        return { rows: rows.map(row => included.map(index => row[index])), included };
    }
    function delimited(kind, items, options) {
        const delimiter = ({ comma: ',', semicolon: ';', tab: '\t', pipe: '|' })[options.tableDelimiter] || (kind === 'tsv' ? '\t' : ',');
        const quote = value => {
            let text = String(value ?? '');
            if (/^[=+@\-\t\r\n]/.test(text)) text = "'" + text;
            return options.tableQuotes === 'minimal' && !text.includes(delimiter) && !/["\r\n]/.test(text) ? text : '"' + text.replaceAll('"', '""') + '"';
        };
        const newline = options.tableNewline === 'lf' ? '\n' : '\r\n';
        return new Blob([(options.tableBom === false ? '' : '\ufeff') + table(items, options).rows.map(row => row.map(quote).join(delimiter)).join(newline)], { type: kind === 'tsv' ? 'text/tab-separated-values;charset=utf-8' : 'text/csv;charset=utf-8' });
    }
    function filePart(value, options) {
        const separator = options.filenameSeparator ?? '_';
        let name = String(value).replaceAll('♭', 'b').replaceAll('♯', 'sharp').replaceAll('#', 'sharp').replace(/[<>:"/\\|?*\x00-\x1f]/g, separator).replace(/\s+/g, separator).replace(/^[. ]+|[. ]+$/g, '').slice(0, 120) || 'pattern';
        if (options.filenameCase === 'lower') name = name.toLocaleLowerCase();
        if (options.filenameCase === 'upper') name = name.toLocaleUpperCase();
        // Avoid reserved device names when ZIPs are extracted on Windows.
        if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) name = '_' + name;
        return name;
    }
    function entryName(item, index, options, extension, used) {
        const values = { ...item, number: String(index + 1).padStart(options.sequenceDigits ?? 3, '0') };
        const base = filePart((options.archivePrefix || '') + FretboardBetaLayout.fillTemplate(options.entryTemplate || '{number}_{key}_{name}', values) + (options.archiveSuffix || ''), options);
        const folders = [];
        if (options.archiveRoot) folders.push(filePart(options.archiveRoot, options));
        if (options.categoryFolders !== false && item.category) folders.push(filePart(item.category, options));
        if (options.keyFolders && item.key) folders.push(filePart(item.key, options));
        const path = [...folders, base].join('/');
        let name = path + '.' + extension, n = 2;
        while (used.has(name.toLowerCase())) name = path + '-' + n++ + '.' + extension;
        used.add(name.toLowerCase()); return name;
    }
    async function archive(zip, kind, items, options, checkCancel) {
        const root = options.archiveRoot ? filePart(options.archiveRoot, options) + '/' : '';
        const unique = name => {
            let result = root + name, n = 2;
            while (zip.file(result)) result = root + n++ + '-' + name;
            return result;
        };
        if (options.archiveManifest) zip.file(unique('manifest.json'), JSON.stringify({ version: 1, items }, null, 2));
        if (options.archiveSettings) zip.file(unique('settings.json'), JSON.stringify(options, null, 2));
        if (options.archiveReadme) zip.file(unique('collection.txt'), [options.title, options.author, ...items.map(item => item.kind === 'heading' ? item.text : item.kind === 'diagram' ? [item.key, item.name, item.caption].filter(Boolean).join(' | ') : '')].filter(Boolean).join('\n\n'));
        const compression = options.zipCompression && options.zipCompression !== 'auto' ? options.zipCompression : ['jpg-zip', 'webp-zip', 'png-zip'].includes(kind) ? 'STORE' : 'DEFLATE';
        checkCancel();
        return zip.generateAsync({ type: 'blob', compression, compressionOptions: { level: options.zipLevel || 6 } }, checkCancel);
    }
    function reader(pages, options, config) {
        const heading = options.readerTitle ? '<h1>' + escape(options.title || 'Fretboards') + '</h1>' : '';
        const author = options.readerAuthor && options.author ? '<p>' + escape(options.author) + '</p>' : '';
        const count = options.readerCount ? '<p>' + pages.length + (pages.length === 1 ? ' page' : ' pages') + '</p>' : '';
        const print = options.readerPrint ? '<button type="button" onclick="window.print()">Print</button>' : '';
        const background = options.readerBackground || '#e8e8e8', pageColor = options.readerPageBackground || '#ffffff';
        return '<!doctype html><html lang="' + escape(options.readerLanguage || 'en') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escape(options.title || 'Fretboards') + '</title><style>*{box-sizing:border-box}body{margin:0;background:' + background + ';font-family:Arial,sans-serif;color:#20221f}header{padding:16px 20px;background:white}h1{margin:0;font-size:1.4rem}button{padding:10px 18px;cursor:pointer}main{display:grid;gap:' + (options.readerGap ?? 20) + 'px;padding:' + (options.readerPadding ?? 20) + 'px}.page{margin:auto;width:min(' + (options.readerWidth ?? 100) + '%, ' + config.pageWidth + 'mm);background:' + pageColor + ';box-shadow:' + (options.readerShadow === false ? 'none' : '0 2px 12px #0002') + ';border:' + (options.readerBorder ? (options.readerBorderWidth ?? 1) + 'px solid ' + (options.readerBorderColor || '#cccccc') : 'none') + ';border-radius:' + (options.readerRadius || 0) + 'px;overflow:hidden}.page>svg{display:block;width:100%;height:auto}.page>svg>rect:first-child{fill:' + pageColor + '}@page{size:' + config.pageWidth + 'mm ' + config.pageHeight + 'mm;margin:0}@media print{body{background:white}header{display:none}main{display:block;padding:0}.page{width:100%;border:0;border-radius:0;box-shadow:none;break-after:page}.page:last-child{break-after:auto}}</style></head><body>' + (heading || author || count || print ? '<header>' + heading + author + count + print + '</header>' : '') + '<main>' + pages.map(svg => '<section class="page">' + svg + '</section>').join('') + '</main></body></html>';
    }
    globalThis.FretboardBetaAdvanced = { layers, watermark, table, delimited, filePart, entryName, archive, reader };
})();
