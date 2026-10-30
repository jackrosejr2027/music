/** Current-key category PDFs using every configured diagram, without changing the live boards. */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllDiagramsPatternTypePDF = async function(app, type) {
        const mt = app.musicTheory;
        const source = type === 'scale' ? mt.scales : type === 'interval' ? mt.intervals : type === 'chord' ? mt.chords : null;
        if (!source) throw new Error('Unsupported PDF pattern category.');
        const ids = Object.keys(source);
        if (type === 'interval') ids.sort((a, b) => source[a].semitones - source[b].semitones);
        if (!ids.length) { alert('No ' + type + ' patterns available.'); return; }

        app.updateFretboard();
        const key = app.fretboard.currentKey;
        const boards = app.diagramBoards || [app.fretboard];
        const diagrams = boards.map((board, index) => ({
            settings: JSON.parse(JSON.stringify(board.settings)),
            width: board.container.clientWidth || 1000,
            instrumentName: app.instrumentPresets[app.diagramSetups?.[index]?.instrument]?.name || ''
        }));
        const total = ids.length * diagrams.length;
        if (total > 150 && !confirm('Export all ' + type + 's in ' + key + ' using ' + diagrams.length + ' diagram(s)? This creates ' + total + ' PDF pages and may take several minutes. Stop saves the pages completed so far.')) return;

        const doc = Exporter.newPdf();
        const state = { pages: 0 };
        const progress = Exporter.pdfProgress(app);
        const container = document.createElement('div');
        container.id = 'pdf-diagram-render';
        container.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;';
        container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(container);
        let renderer;
        try {
            renderer = new Fretboard(container.id, mt);
            // The export has a fixed snapshot width; live resize events must not redraw it mid-capture.
            window.removeEventListener('resize', renderer.queueResponsiveDraw);
            renderer.resizeObserver?.disconnect();
            const context = { fretboard: renderer, musicTheory: mt, instrumentName: '' };
            for (const id of ids) {
                if (app.stopExporting) break;
                for (let index = 0; index < diagrams.length; index++) {
                    if (app.stopExporting) break;
                    const diagram = diagrams[index];
                    progress.set('PDF ' + (state.pages + 1) + '/' + total + ' - Diagram ' + (index + 1) + '/' + diagrams.length);
                    container.style.width = diagram.width + 'px';
                    renderer.updateSettings(diagram.settings);
                    renderer.updatePattern(key, type, id);
                    context.instrumentName = diagram.instrumentName;
                    const info = Exporter.describePattern(context, key, type, id);
                    info.title += ' - Diagram ' + (index + 1) + '/' + diagrams.length;
                    await Exporter.addPdfDiagramPage(doc, context, info, state);
                    // Yield between pages so Stop works even for large collections of scales.
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            if (state.pages > 0) {
                progress.set('Saving PDF...');
                const filename = app.customFilename || ('all_' + type + 's_in_' + key + '_' + diagrams.length + '_diagrams');
                Exporter.savePdf(doc, Exporter.safe(filename) + '.pdf');
                if (window.ST?.toast) window.ST.toast((app.stopExporting ? 'Stopped - saved ' : 'Saved ') + state.pages + ' PDF pages');
            }
        } finally {
            if (renderer) {
                clearTimeout(renderer.resizeTimeout);
                clearTimeout(renderer.redrawTimeout);
                renderer.resizeObserver?.disconnect();
                window.removeEventListener('resize', renderer.queueResponsiveDraw);
            }
            container.remove();
            progress.done();
        }
    };
}

/** Selected pattern across the 17 circle-of-fifths spellings, using snapshot renderers only. */
if (typeof Exporter !== 'undefined') {
    Exporter.exportAllKeysPackage = async function(app) {
        if (document.getElementById('diagram-count')?.value !== 'all-keys') {
            alert('Select All Keys in Fretboard diagrams before exporting this package.');
            return;
        }
        if (typeof JSZip === 'undefined' || typeof docx === 'undefined' || typeof XLSX === 'undefined') {
            throw new Error('The ZIP, Word or spreadsheet export library is unavailable.');
        }
        const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Gb', 'C#', 'Db', 'G#', 'Ab', 'D#', 'Eb', 'A#', 'Bb', 'F'];
        const type = app.fretboard.currentPatternType;
        const pattern = app.fretboard.currentPattern;
        const mt = app.musicTheory;
        const name = Exporter.patternName(app, type, pattern);
        const diagrams = app.diagramBoards.map((board, index) => ({
            settings: JSON.parse(JSON.stringify(board.settings)),
            instrumentName: app.instrumentPresets[app.diagramSetups[index].instrument]?.name || '',
            width: Math.max(1000, board.container.clientWidth || 0)
        }));
        if (diagrams.length !== keys.length) throw new Error('All Keys requires 17 diagrams. Reselect All Keys and try again.');
        const base = Exporter.safe('all_keys_' + type + '_' + name);
        const zip = new JSZip();
        const pdf = Exporter.newPdf();
        const sections = [];
        const workbook = XLSX.utils.book_new();
        const images = [];
        const progress = Exporter.pdfProgress(app);
        const container = document.createElement('div');
        container.id = 'all-keys-package-render';
        container.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;';
        container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(container);
        let renderer;
        try {
            renderer = new Fretboard(container.id, mt);
            window.removeEventListener('resize', renderer.queueResponsiveDraw);
            renderer.resizeObserver?.disconnect();
            const context = { fretboard: renderer, musicTheory: mt, instrumentName: '' };
            for (let index = 0; index < keys.length; index++) {
                if (app.stopExporting) return;
                const key = keys[index];
                const diagram = diagrams[index];
                progress.set('All Keys ' + (index + 1) + '/17 - ' + key);
                container.style.width = diagram.width + 'px';
                renderer.updateSettings(diagram.settings);
                renderer.updatePattern(key, type, pattern);
                context.instrumentName = diagram.instrumentName;
                const info = Exporter.describePattern(context, key, type, pattern);
                // Always identify the spelling, including position-based Gamut patterns.
                const title = key + ' - ' + type + ' - ' + name;
                const png = await Exporter.getFretboardImageBase64(context, { mime: 'image/png', scale: 2 });
                const jpg = await Exporter.getFretboardImageBase64(context, { mime: 'image/jpeg', scale: 2, quality: 0.94 });
                if (app.stopExporting) return;
                const dims = await new Promise((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve({ width: image.width, height: image.height });
                    image.onerror = () => reject(new Error('Could not read the exported diagram image.'));
                    image.src = 'data:image/png;base64,' + png;
                });
                const stem = String(index + 1).padStart(2, '0') + '_' + Exporter.safe(key);
                zip.file('PNG/' + stem + '.png', png, { base64: true });
                zip.file('JPG/' + stem + '.jpg', jpg, { base64: true });
                const ratio = Math.min(1, 900 / dims.width, 420 / dims.height);
                const width = Math.round(dims.width * ratio), height = Math.round(dims.height * ratio);
                if (index) pdf.addPage();
                const pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
                pdf.setFontSize(18);
                if (Exporter.includeTitles !== false) pdf.text(title, 36, 45);
                const pdfRatio = Math.min((pageW - 72) / dims.width, (pageH - 165) / dims.height);
                pdf.addImage('data:image/jpeg;base64,' + jpg, 'JPEG', 36, 65, dims.width * pdfRatio, dims.height * pdfRatio, undefined, 'FAST');
                pdf.setFontSize(10);
                const details = info.lines.join('\n');
                pdf.text(pdf.splitTextToSize(details, pageW - 72), 36, pageH - 75);
                sections.push({
                    properties: { page: { size: { width: 16838, height: 11906 }, margin: { top: 600, bottom: 600, left: 600, right: 600 } } },
                    children: [
                        ...(Exporter.includeTitles === false ? [] : [new docx.Paragraph({ children: [new docx.TextRun({ text: title, bold: true, size: 28 })] })]),
                        new docx.Paragraph({ children: [new docx.ImageRun({ type: 'png', data: Uint8Array.from(atob(png), c => c.charCodeAt(0)), transformation: { width, height } })] }),
                        ...info.lines.map(text => new docx.Paragraph({ text }))
                    ]
                });
                const rows = [[Exporter.includeTitles === false ? '' : title], ['Key', key], ['Type', type], ['Selection', name], ['Instrument', diagram.instrumentName], ...info.lines.map(line => [line])];
                const sheet = XLSX.utils.aoa_to_sheet(rows);
                sheet['!cols'] = [{ wch: 24 }, { wch: 85 }];
                XLSX.utils.book_append_sheet(workbook, sheet, String(index + 1).padStart(2, '0') + ' ' + key);
                images.push({ png, width, height });
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            progress.set('Packaging PDF, Word, Excel and images...');
            zip.file(base + '.pdf', pdf.output('arraybuffer'));
            zip.file(base + '.docx', await docx.Packer.toBlob(new docx.Document({ sections })));
            // SheetJS writes editable metadata; add standard OpenXML drawings for the actual diagrams.
            const excel = await JSZip.loadAsync(XLSX.write(workbook, { bookType: 'xlsx', type: 'array', ignoreEC: false }));
            let contentTypes = await excel.file('[Content_Types].xml').async('string');
            if (!contentTypes.includes('Extension="png"')) contentTypes = contentTypes.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
            for (let index = 0; index < images.length; index++) {
                const n = index + 1, image = images[index];
                const sheetPath = 'xl/worksheets/sheet' + n + '.xml';
                const sheetXml = await excel.file(sheetPath).async('string');
                excel.file(sheetPath, sheetXml.replace('</worksheet>', '<drawing xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rIdDiagram"/></worksheet>'));
                excel.file('xl/worksheets/_rels/sheet' + n + '.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdDiagram" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing' + n + '.xml"/></Relationships>');
                excel.file('xl/media/diagram' + n + '.png', image.png, { base64: true });
                excel.file('xl/drawings/_rels/drawing' + n + '.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdImage" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/diagram' + n + '.png"/></Relationships>');
                excel.file('xl/drawings/drawing' + n + '.xml', '<?xml version="1.0" encoding="UTF-8"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>10</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:ext cx="' + image.width * 9525 + '" cy="' + image.height * 9525 + '"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="' + n + '" name="Diagram ' + n + '"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIdImage"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + image.width * 9525 + '" cy="' + image.height * 9525 + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>');
                contentTypes = contentTypes.replace('</Types>', '<Override PartName="/xl/drawings/drawing' + n + '.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>');
            }
            excel.file('[Content_Types].xml', contentTypes);
            zip.file(base + '.xlsx', await excel.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }));
            if (app.stopExporting) return;
            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
            if (app.stopExporting) return;
            if (window.ST?.download) window.ST.download(blob, base + '.zip');
            else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url; link.download = base + '.zip'; link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } finally {
            if (renderer) {
                clearTimeout(renderer.resizeTimeout);
                clearTimeout(renderer.redrawTimeout);
                renderer.resizeObserver?.disconnect();
                window.removeEventListener('resize', renderer.queueResponsiveDraw);
            }
            container.remove();
            progress.done();
        }
    };
}
