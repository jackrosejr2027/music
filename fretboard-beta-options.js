(() => {
    'use strict';
    // name, control ID suffix, type, default, minimum/choices, maximum
    const fields = [
        ['orientation', 'orientation', 'select', 'landscape', ['landscape', 'portrait']],
        ['perPage', 'per-page', 'integer', 0, 0, 24],
        ['columns', 'columns', 'integer', 1, 0, 2],
        ['width', 'image-width', 'optional', null, 10, 400], ['height', 'image-height', 'optional', null, 10, 400],
        ['startFret', 'start-fret', 'integer', 0, 0, 24], ['endFret', 'end-fret', 'integer', 24, 0, 24],
        ['tuning', 'tuning', 'tuning', ['E', 'A', 'D', 'G', 'B', 'E']],
        ['paper', 'paper', 'select', 'a4', ['a4', 'a3', 'letter', 'legal', 'custom']],
        ['margin', 'margin', 'number', 12, 5, 35],
        ['gapX', 'gap-x', 'number', 4, 0, 20], ['gapY', 'gap-y', 'number', 4, 0, 20],
        ['alignX', 'align-x', 'select', 'center', ['left', 'center', 'right']],
        ['alignY', 'align-y', 'select', 'top', ['top', 'center', 'bottom']],
        ['background', 'background', 'color', '#ffffff'],
        ['dpi', 'dpi', 'integer', 200, 72, 300], ['jpegQuality', 'jpeg-quality', 'integer', 92, 40, 100],
        ['categoryBreak', 'category-break', 'boolean', false],
        ['customWidth', 'custom-width', 'number', 210, 100, 500], ['customHeight', 'custom-height', 'number', 297, 100, 500],
        ['padding', 'diagram-padding', 'number', 0, 0, 20],
        ['borderStyle', 'border-style', 'select', 'none', ['none', 'solid', 'dashed']],
        ['borderColor', 'border-color', 'color', '#20221f'], ['borderWidth', 'border-width', 'number', 0.3, 0.1, 3],
        ['grayscale', 'grayscale', 'boolean', false], ['transparent', 'transparent', 'boolean', false],
        ['keyBreak', 'key-break', 'boolean', false],
        ['displayMode', 'display-mode', 'select', 'current', ['current', 'notes', 'intervals', 'roman', 'solfege', 'none']],
        ['fretNumbersPlacement', 'fret-number-placement', 'select', 'current', ['current', 'above', 'below']],
        ['fretNumbersSize', 'fret-number-size', 'optional', null, 6, 32],
        ['noteSize', 'marker-size', 'optional', null, 4, 30], ['noteFontSize', 'marker-font-size', 'optional', null, 5, 24],
        ['stringThickness', 'string-thickness', 'optional', null, 0.25, 6], ['fretThickness', 'fret-thickness', 'optional', null, 0.25, 6],
        ['diagramOpacity', 'diagram-opacity', 'number', 1, 0.1, 1],
        ['noteShape', 'marker-shape', 'select', 'current', ['current', 'circle', 'square', 'diamond', 'triangle', 'hexagon', 'star']],
        ['fretNumbersPosition', 'fret-number-position', 'select', 'current', ['current', 'left', 'center', 'right']],
        ['rotateDiagram', 'rotate-diagram', 'boolean', false],
        ['title', 'document-title', 'text', 'Fretboard Pattern Collection'],
        ['category', 'category-text', 'text', '{category}'], ['key', 'key-text', 'text', 'Key of {key}'],
        ['caption', 'caption-text', 'text', '{key} · {name}'],
        ['subtitle', 'subtitle', 'text', ''], ['author', 'author', 'text', ''], ['introduction', 'introduction', 'text', ''],
        ['categoryNote', 'category-note', 'text', ''], ['keyNote', 'key-note', 'text', ''],
        ['header', 'page-header', 'text', ''], ['footer', 'page-footer', 'text', ''],
        ['pageNumbers', 'page-numbers', 'select', 'none', ['none', 'number', 'total']],
        ['font', 'text-font', 'select', 'Arial', ['Arial', 'Times New Roman', 'Courier New']],
        ['textColor', 'text-color', 'color', '#20221f'],
        ['titleSize', 'title-size', 'number', 17, 8, 40], ['headingSize', 'heading-size', 'number', 14, 8, 30],
        ['captionSize', 'caption-size', 'number', 8, 6, 20], ['bodySize', 'body-size', 'number', 9, 6, 24],
        ['textAlign', 'text-align', 'select', 'left', ['left', 'center', 'right']],
        ['captionPosition', 'caption-position', 'select', 'below', ['below', 'above']],
        ['captionBold', 'caption-bold', 'boolean', false], ['bodyItalic', 'body-italic', 'boolean', false],
        ['headingNumbers', 'heading-numbers', 'boolean', false], ['diagramNumbers', 'diagram-numbers', 'boolean', false],
        ['captionColor', 'caption-color', 'optional-color', ''], ['headingColor', 'heading-color', 'optional-color', ''],
        ['titleColor', 'title-color', 'optional-color', ''], ['bodyColor', 'body-color', 'optional-color', ''],
        ['uppercaseHeadings', 'uppercase-headings', 'boolean', false], ['uppercaseCaptions', 'uppercase-captions', 'boolean', false],
        ['dateText', 'date-text', 'text', ''], ['tuningText', 'tuning-text', 'text', ''], ['rangeText', 'range-text', 'text', ''],
        ['lineSpacing', 'line-spacing', 'number', 1, 1, 2],
        ['categoryOrder', 'category-order', 'select', 'interval,chord,scale', ['interval,chord,scale', 'interval,scale,chord', 'chord,interval,scale', 'chord,scale,interval', 'scale,interval,chord', 'scale,chord,interval']],
        ['patternOrder', 'pattern-order', 'select', 'catalog', ['catalog', 'name-asc', 'name-desc', 'interval-count', 'custom']],
        ['customOrder', 'custom-order', 'list', []],
        ['format', 'export-format', 'select', 'docx', ['docx', 'pdf-zip', 'pdf-single', 'jpg-zip', 'png-zip', 'svg-zip', 'webp-zip', 'html', 'markdown-zip', 'csv', 'json', 'tsv', 'txt', 'svg-pages-zip', 'xlsx', 'ods', 'xls', 'rtf', 'word-xml', 'xml', 'ndjson', 'yaml', 'png-pages-zip', 'jpg-pages-zip']]
    ];
    fields.find(([name]) => name === 'format')[4].push(...(globalThis.FretboardBetaPublishing?.formats || []).map(([kind]) => kind));
    fields.push(...(globalThis.FretboardBetaAdvancedSchema?.fields || []));
    function defaults() { return Object.fromEntries(fields.map(([name, , , value]) => [name, Array.isArray(value) ? [...value] : value])); }
    function validate(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid export options.');
        const result = defaults();
        for (const [name, id, type, , min, max] of fields) {
            if (!Object.hasOwn(input, name)) continue;
            let value = input[name];
            const invalid = () => { throw new Error('Invalid ' + id.replaceAll('-', ' ') + (typeof min === 'number' ? ': use ' + min + ' to ' + max + '.' : '.')); };
            if (['number', 'integer', 'optional'].includes(type)) {
                if (type === 'optional' && (value === '' || value === null)) value = null;
                else {
                    if (value === '' || value === null || typeof value === 'boolean') invalid();
                    value = Number(value);
                    if (!Number.isFinite(value) || value < min || value > max || (type === 'integer' && !Number.isInteger(value))) invalid();
                }
            } else if (type === 'list') {
                if (typeof value === 'string') { try { value = JSON.parse(value); } catch (_) { invalid(); } }
                if (!Array.isArray(value) || value.length > 20000 || value.some(x => typeof x !== 'string' || x.length > 250)) invalid();
                value = [...new Set(value)];
            } else if (type === 'select') { if (!min.includes(value)) invalid(); }
            else if (type === 'optional-color' && value === '') { /* Inherit the main text color. */ }
            else if (type === 'color' || type === 'optional-color') { if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) invalid(); }
            else if (type === 'boolean') { if (typeof value !== 'boolean') invalid(); }
            else if (type === 'tuning') {
                value = FretboardBetaLayout.parseTuning(Array.isArray(value) ? value.join(' ') : String(value));
            } else if (typeof value !== 'string' || value.length > 10000) invalid();
            result[name] = value;
        }
        if (result.startFret > result.endFret) throw new Error('Start fret must not exceed end fret.');
        return result;
    }
    function read() {
        const values = {};
        for (const [name, id, type] of fields) {
            const control = document.getElementById('beta-' + id);
            values[name] = type === 'boolean' ? control.checked : control.value;
        }
        return validate(values);
    }
    function apply(input) {
        const options = validate(input);
        for (const [name, id, type] of fields) {
            const control = document.getElementById('beta-' + id);
            if (type === 'boolean') control.checked = options[name];
            else control.value = type === 'list' ? JSON.stringify(options[name]) : Array.isArray(options[name]) ? options[name].join(' ') : options[name] ?? '';
        }
        document.getElementById('beta-tuning-preset').value = '';
    }
    function rendererOverrides(options) {
        // Export lines use continuous strokes so the page-renderer cannot leave apparent crop gaps.
        const result = { stringStyle: 'solid', stringEffect: 'none', fretStyle: 'solid', stringGradient: false, fretGradient: false, noteEffect: 'none', noteGradient: false };
        for (const name of ['fretNumbersPlacement', 'fretNumbersSize', 'noteSize', 'noteFontSize', 'stringThickness', 'fretThickness', 'noteShape', 'fretNumbersPosition']) {
            if (options[name] !== null && options[name] !== 'current') result[name] = options[name];
        }
        return result;
    }
    globalThis.FretboardBetaOptions = { fields, defaults, validate, read, apply, rendererOverrides };
})();
