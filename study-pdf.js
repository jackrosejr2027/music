/**
 * Study PDF helper (v1.0): builds a printable A4 document with the vendored jsPDF,
 * so PDF downloads work fully offline. Text is reduced to characters the built-in
 * Helvetica font can draw (flats and sharps become b and #).
 */
(function (scope) {
    'use strict';
    const PAGE_H = 297, MARGIN = 18, WIDTH = 210 - MARGIN * 2;
    const SUBS = {
        9837: 'b', 9839: '#', 8211: '-', 8212: '-', 8216: "'", 8217: "'",
        8220: '"', 8221: '"', 8594: '->', 8230: '...'
    };
    const BAD_FILE_CHARS = [47, 92, 58, 42, 63, 34, 60, 62, 124];

    function clean(value) {
        let out = '';
        String(value == null ? '' : value).split('').forEach(ch => {
            const code = ch.charCodeAt(0);
            if (SUBS[code] !== undefined) out += SUBS[code];
            else if (code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126) || (code >= 160 && code <= 255)) out += ch;
        });
        return out;
    }

    function fileName(name) {
        let base = clean(name).split('').filter(ch => BAD_FILE_CHARS.indexOf(ch.charCodeAt(0)) < 0).join('');
        base = base.replace(/\s+/g, ' ').trim() || 'download';
        return /\.pdf$/i.test(base) ? base : base + '.pdf';
    }

    function create() {
        const JsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!JsPDF) throw new Error('PDF engine (jsPDF) failed to load.');
        const doc = new JsPDF({ unit: 'mm', format: 'a4' });
        let y = MARGIN;

        function ensure(h) {
            if (y + h > PAGE_H - MARGIN) { doc.addPage(); y = MARGIN; }
        }

        // One paragraph, optionally with a hanging marker such as "1." or "-".
        function para(text, o) {
            o = o || {};
            const size = o.size || 10.5, indent = o.indent || 0, marker = o.marker || '';
            const lh = size * 0.5;
            doc.setFont('helvetica', o.style || 'normal');
            doc.setFontSize(size);
            const markerW = marker ? doc.getTextWidth(marker + ' ') : 0;
            const lines = doc.splitTextToSize(clean(text), WIDTH - indent - markerW);
            if (o.before) { ensure(o.before); y += o.before; }
            lines.forEach((line, i) => {
                ensure(lh);
                const x = MARGIN + indent;
                if (marker && i === 0) doc.text(marker, x, y + lh * 0.75);
                doc.text(line, x + markerW, y + lh * 0.75);
                y += lh;
            });
            y += o.after || 0;
        }

        return {
            title(text) { para(text, { size: 18, style: 'bold', after: 3 }); },
            heading(text) { para(text, { size: 12.5, style: 'bold', before: 4, after: 1.5 }); },
            text(text) { para(text, { after: 2 }); },
            question(number, text) { para(number + '. ' + text, { style: 'bold', before: 3, after: 1 }); },
            option(letter, text) { para(text, { indent: 6, marker: letter + '.', after: 0.5 }); },
            list(items, ordered) {
                (items || []).forEach((t, i) => para(t, { indent: 4, marker: ordered ? (i + 1) + '.' : '-', after: 1 }));
                y += 1;
            },
            rule() {
                ensure(4);
                doc.setDrawColor(160);
                doc.line(MARGIN, y, 210 - MARGIN, y);
                y += 4;
            },
            space(mm) { ensure(mm); y += mm; },
            newPage() { doc.addPage(); y = MARGIN; },
            save(name) {
                const file = fileName(name);
                const st = (typeof ST !== 'undefined' && ST) || scope.ST;
                if (st && typeof st.download === 'function') st.download(doc.output('blob'), file);
                else doc.save(file);
            }
        };
    }

    scope.StudyPdf = { create: create, clean: clean, fileName: fileName };
})(window);
