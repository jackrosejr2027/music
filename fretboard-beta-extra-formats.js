(() => {
    'use strict';
    const formats = [
        ['xlsx', 'Excel workbook catalog (XLSX)', '.xlsx'], ['ods', 'OpenDocument spreadsheet catalog (ODS)', '.ods'],
        ['xls', 'Excel 97-2003 catalog (XLS)', '.xls'], ['rtf', 'Rich Text catalog (RTF)', '.rtf'],
        ['word-xml', 'Word 2003 XML catalog', '-word.xml'], ['xml', 'XML catalog', '.xml'],
        ['ndjson', 'Newline-delimited JSON catalog', '.ndjson'], ['yaml', 'YAML catalog', '.yaml'],
        ['png-pages-zip', 'Paged PNG collection (ZIP)', '-png-pages.zip'], ['jpg-pages-zip', 'Paged JPG collection (ZIP)', '-jpg-pages.zip']
    ];
    const catalogKinds = formats.slice(0, 8).map(format => format[0]);
    function catalog(kind, items, options, styleFor) {
        const escape = FretboardBetaFormats.escape, nl = String.fromCharCode(10);
        const diagrams = items.filter(item => item.kind === 'diagram');
        if (['xlsx', 'ods', 'xls'].includes(kind)) {
            const X = globalThis.XLSX;
            if (!X) throw new Error('Spreadsheet support is unavailable.');
            const rows = globalThis.FretboardBetaAdvanced ? FretboardBetaAdvanced.table(items, options).rows : [['Number', 'Category', 'Key', 'Pattern ID', 'Name', 'Caption', 'Intervals', 'Tuning', 'Start fret', 'End fret'],
                ...diagrams.map((item, i) => [i + 1, item.category, item.key, item.pattern, item.name, item.caption, item.intervals, options.tuning.join(' '), options.startFret, options.endFret])];
            const workbook = X.utils.book_new(); workbook.Props = { Title: options.title, Author: options.author };
            const sheet = X.utils.aoa_to_sheet(rows);
            const widths = [8, 16, 10, 24, 36, 52, 28, 24, 12, 12];
            const included = globalThis.FretboardBetaAdvanced ? FretboardBetaAdvanced.table(items, options).included : widths.map((_, i) => i);
            sheet['!cols'] = included.map(index => ({ wch: widths[index] }));
            if (options.tableHeader !== false && sheet['!ref']) sheet['!autofilter'] = { ref: sheet['!ref'] };
            X.utils.book_append_sheet(workbook, sheet, 'Patterns');
            X.utils.book_append_sheet(workbook, X.utils.aoa_to_sheet([['Kind', 'Text'], ...items.filter(item => item.kind === 'heading').map(item => [item.level, item.text])]), 'Text');
            const settings = [['Option', 'Value']];
            for (const [key, value] of Object.entries(options)) {
                const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
                for (let i = 0; i < Math.max(1, text.length); i += 32000) settings.push([key + (text.length > 32000 ? ' [' + (i / 32000 + 1) + ']' : ''), text.slice(i, i + 32000)]);
            }
            X.utils.book_append_sheet(workbook, X.utils.aoa_to_sheet(settings), 'Settings');
            const mime = kind === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : kind === 'ods' ? 'application/vnd.oasis.opendocument.spreadsheet' : 'application/vnd.ms-excel';
            return new Blob([X.write(workbook, { bookType: kind === 'xls' ? 'biff8' : kind, type: 'array' })], { type: mime });
        }
        if (kind === 'ndjson') return new Blob([[{ kind: 'settings', options }, ...items].map(item => JSON.stringify(item)).join(nl) + nl], { type: 'application/x-ndjson' });
        if (kind === 'yaml') {
            const quote = value => JSON.stringify(value);
            const text = 'version: 1' + nl + 'options:' + nl + Object.entries(options).map(([key, value]) => '  ' + quote(key) + ': ' + quote(value)).join(nl) + nl + 'items:' + nl + items.map(item => '  - ' + quote(item)).join(nl) + nl;
            return new Blob([text], { type: 'application/yaml' });
        }
        if (kind === 'xml') {
            const text = '<?xml version="1.0" encoding="UTF-8"?><fretboard-catalog version="1"><options>' + Object.entries(options).map(([key, value]) => '<option name="' + escape(key) + '">' + escape(typeof value === 'object' ? JSON.stringify(value) : value) + '</option>').join('') + '</options><items>' + items.map(item => '<item kind="' + escape(item.kind) + '">' + Object.entries(item).filter(([key]) => key !== 'kind').map(([key, value]) => '<field name="' + escape(key) + '">' + escape(typeof value === 'object' ? JSON.stringify(value) : value) + '</field>').join('') + '</item>').join('') + '</items></fretboard-catalog>';
            return new Blob([text], { type: 'application/xml' });
        }
        const paragraphs = items.filter(item => item.kind !== 'break').map(item => ({ text: item.kind === 'heading' ? item.text : item.key + ' | ' + item.category + ' | ' + item.name + (item.caption ? nl + item.caption : ''), style: styleFor(item.kind === 'heading' ? item.level : 'caption', options) }));
        if (kind === 'word-xml') {
            const text = '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Word.Document"?><w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"><w:body>' + paragraphs.map(({text, style}) => '<w:p><w:pPr><w:jc w:val="' + options.textAlign + '"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="' + escape(options.font) + '" w:h-ansi="' + escape(options.font) + '"/><w:sz w:val="' + Math.round(style.size * 2) + '"/><w:color w:val="' + style.color.slice(1) + '"/>' + (style.bold ? '<w:b/>' : '') + (style.italic ? '<w:i/>' : '') + '</w:rPr>' + text.split(nl).map(line => '<w:t xml:space="preserve">' + escape(line) + '</w:t>').join('<w:br/>') + '</w:r></w:p>').join('') + '</w:body></w:wordDocument>';
            return new Blob([text], { type: 'application/xml' });
        }
        if (kind !== 'rtf') throw new Error('Unknown catalog format.');
        const slash = String.fromCharCode(92);
        const rtfEscape = text => {
            let output = '';
            for (let i = 0; i < text.length; i++) {
                const n = text.charCodeAt(i), char = text[i];
                output += char === nl ? slash + 'line ' : [slash, '{', '}'].includes(char) ? slash + char : n > 127 ? slash + 'u' + (n > 32767 ? n - 65536 : n) + '?' : char;
            }
            return output;
        };
        const colors = [...new Set(paragraphs.map(p => p.style.color))];
        const colorTable = colors.map(color => slash + 'red' + parseInt(color.slice(1, 3), 16) + slash + 'green' + parseInt(color.slice(3, 5), 16) + slash + 'blue' + parseInt(color.slice(5, 7), 16) + ';').join('');
        const text = '{' + slash + 'rtf1' + slash + 'ansi' + slash + 'uc1{' + slash + 'fonttbl{' + slash + 'f0 ' + rtfEscape(options.font) + ';}}{' + slash + 'colortbl;' + colorTable + '}' + slash + 'f0 ' + paragraphs.map(({text, style}) => slash + 'pard' + slash + (options.textAlign === 'center' ? 'qc' : options.textAlign === 'right' ? 'qr' : 'ql') + slash + 'fs' + Math.round(style.size * 2) + slash + 'cf' + (colors.indexOf(style.color) + 1) + slash + (style.bold ? 'b' : 'b0') + slash + (style.italic ? 'i' : 'i0') + slash + 'sl' + Math.round(240 * options.lineSpacing) + slash + 'slmult1 ' + rtfEscape(text) + slash + 'par' + nl).join('') + '}';
        return new Blob([text], { type: 'application/rtf' });
    }
    globalThis.FretboardBetaExtraFormats = { formats, catalogKinds, catalog };
})();
