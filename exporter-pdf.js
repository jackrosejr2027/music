/**
 * PDF Export (v1.0) - 100% offline, powered by the locally vendored jsPDF (vendor/jspdf.umd.min.js)
 *
 *  - Exporter.exportCurrentDiagramPDF(app)         current diagram + theory info, 1 page
 *  - Exporter.exportCurrentPatternAllKeysPDF(app)  current pattern in all 12 keys
 *  - Exporter.exportSlideshowPDF(app)              every slideshow item, 1 page each
 *  - Exporter.exportPatternTypePDF(app, type)      every scale / chord / interval / custom pattern in the current key
 *  - Exporter.exportCurrentDiagramPNG(app)         high-resolution PNG image
 */
if (typeof Exporter !== 'undefined') {

    Exporter.safe = function(s) {
        if (window.ST && ST.safeName) return ST.safeName(s);
        return String(s || 'export').replace(/#/g, 'sharp').replace(/[^\w.-]+/g, '_');
    };

    Exporter.getJsPDF = function() {
        const ctor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (!ctor) throw new Error('PDF engine (jsPDF) failed to load.');
        return ctor;
    };

    Exporter.patternName = function(app, type, id) {
        const mt = app.musicTheory;
        const src = type === 'scale' ? mt.scales : type === 'chord' ? mt.chords : type === 'interval' ? mt.intervals
            : type === 'gamut' ? mt.gamuts : type === 'custom' ? mt.customPatterns : null;
        return (src && src[id] && src[id].name) || String(id);
    };

    Exporter.describePattern = function(app, key, type, id) {
        const mt = app.musicTheory;
        const lines = [];
        const name = Exporter.patternName(app, type, id);
        let notes = [];
        let formula = '';
        try {
            if (type === 'scale') { notes = mt.getScaleNotes(key, id); formula = (mt.scales[id]?.intervals || []).join(' - '); }
            else if (type === 'chord') { notes = mt.getChordNotes(key, id); formula = (mt.chords[id]?.intervals || []).join(' - '); }
            else if (type === 'interval') { notes = [key, mt.getNoteFromInterval(key, id)]; const iv = mt.intervals[id]; formula = iv ? (iv.shortName + ' (' + iv.semitones + ' semitones)') : id; }
            else if (type === 'custom') { notes = mt.getCustomNotes(key, id); formula = (mt.customPatterns[id]?.intervals || []).join(' - '); }
        } catch (e) { /* keep going with what we have */ }
        if (notes.length) lines.push('Notes: ' + notes.filter(Boolean).join(' - '));
        if (formula) lines.push('Formula: ' + formula);
        const fb = app.fretboard;
        const instSel = document.getElementById('instrument-select');
        const inst = app.instrumentName ?? (instSel && instSel.options[instSel.selectedIndex] ? instSel.options[instSel.selectedIndex].text : '');
        lines.push('Tuning: ' + (fb.settings.tuning || []).join('-') + (inst ? '  (' + inst + ')' : '') +
            '   Frets: ' + fb.settings.startFret + '-' + fb.settings.endFret + '   Display: ' + (fb.settings.displayMode || 'intervals'));
        let desc = '';
        try {
            if (type === 'scale' && mt.getScaleDescription) desc = mt.getScaleDescription(id) || '';
            else if (type === 'chord' && mt.getChordDescription) desc = mt.getChordDescription(id) || '';
        } catch (e) { desc = ''; }
        const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
        const title = type === 'gamut' ? name : (key + ' ' + name + (typeLabel && !name.toLowerCase().includes(typeLabel.toLowerCase()) ? ' ' + typeLabel : ''));
        return { title, lines, desc: String(desc).replace(/<[^>]+>/g, '') };
    };

    Exporter.newPdf = function() {
        const JsPDF = Exporter.getJsPDF();
        const doc = new JsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true });
        doc.setProperties({ title: 'Scales Thesaurus Export', creator: 'Scales Thesaurus v' + ((window.ST && ST.version) || '1.0.0') });
        return doc;
    };

    /** Add one diagram page. First call reuses the initial blank page. */
    Exporter.addPdfDiagramPage = async function(doc, app, info, state) {
        if (state.pages > 0) doc.addPage();
        state.pages++;
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        const M = 36;
        doc.setTextColor(20, 20, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        if (Exporter.includeTitles !== false) doc.text(info.title, M, M + 14);

        const b64 = await Exporter.getFretboardImageBase64(app, { mime: 'image/jpeg', scale: 2, quality: 0.92 });
        const dataUrl = 'data:image/jpeg;base64,' + b64;
        const dims = await new Promise((res) => { const im = new Image(); im.onload = () => res({ w: im.width, h: im.height }); im.onerror = () => res({ w: 1000, h: 250 }); im.src = dataUrl; });
        const maxW = W - M * 2;
        const maxH = H * 0.55;
        let w = maxW, h = w * dims.h / dims.w;
        if (h > maxH) { h = maxH; w = h * dims.w / dims.h; }
        const imgY = Exporter.includeTitles === false ? M : M + 30;
        doc.addImage(dataUrl, 'JPEG', M + (maxW - w) / 2, imgY, w, h, undefined, 'FAST');

        let y = imgY + h + 26;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        info.lines.forEach(line => {
            const wrapped = doc.splitTextToSize(line, maxW);
            doc.text(wrapped, M, y);
            y += 16 * wrapped.length;
        });
        if (info.desc) {
            doc.setFontSize(10.5);
            doc.setTextColor(70, 70, 70);
            const wrapped = doc.splitTextToSize(info.desc, maxW);
            const room = Math.max(0, Math.floor((H - M - y) / 13));
            doc.text(wrapped.slice(0, room), M, y + 4);
        }
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text('Scales Thesaurus  |  page ' + state.pages, W - M, H - 16, { align: 'right' });
    };

    Exporter.savePdf = function(doc, filename) {
        const blob = doc.output('blob');
        if (window.ST && ST.download) ST.download(blob, filename);
        else doc.save(filename);
    };

    /** Shared progress UI: uses the export Play button when present. */
    Exporter.pdfProgress = function(app) {
        const btn = document.getElementById('export-play-button');
        let stop = null;
        app.stopExporting = false;
        if (btn && !document.getElementById('pdf-stop-export') && !document.getElementById('export-stop-button')) {
            stop = document.createElement('button');
            stop.id = 'pdf-stop-export';
            stop.textContent = 'Stop';
            stop.style.cssText = 'margin-left:8px;padding:8px 12px;background:#e74c3c;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;';
            stop.addEventListener('click', () => { app.stopExporting = true; stop.disabled = true; stop.textContent = 'Stopping...'; });
            btn.insertAdjacentElement('afterend', stop);
        }
        return {
            set(text) { if (btn) btn.textContent = text; },
            done() { if (stop) stop.remove(); }
        };
    };

    Exporter.snapshotSelection = function(app) {
        const fb = app.fretboard;
        return { key: fb.currentKey, type: fb.currentPatternType, pattern: fb.currentPattern };
    };
    Exporter.restoreSelection = function(app, snap) {
        try {
            app.fretboard.updatePattern(snap.key, snap.type, snap.pattern);
            if (app.updateTheoryInfo) app.updateTheoryInfo();
        } catch (e) { console.warn('Could not restore selection', e); }
    };

    Exporter.exportCurrentDiagramPDF = async function(app) {
        const fb = app.fretboard;
        const doc = Exporter.newPdf();
        const info = Exporter.describePattern(app, fb.currentKey, fb.currentPatternType, fb.currentPattern);
        await Exporter.addPdfDiagramPage(doc, app, info, { pages: 0 });
        const base = app.customFilename || (fb.currentKey + '-' + fb.currentPatternType + '-' + fb.currentPattern);
        Exporter.savePdf(doc, Exporter.safe(base) + '.pdf');
    };

    Exporter.exportCurrentDiagramPNG = async function(app) {
        const fb = app.fretboard;
        const base = app.customFilename || (fb.settings.tuning.join('-') + '-' + fb.currentKey + '-' + fb.currentPatternType + '-' + fb.currentPattern);
        await fb.exportImage(Exporter.safe(base) + '.png');
    };

    Exporter.runPdfJob = async function(app, items, filename, label) {
        if (!items.length) { alert('Nothing to export.'); return; }
        const snap = Exporter.snapshotSelection(app);
        const doc = Exporter.newPdf();
        const state = { pages: 0 };
        const prog = Exporter.pdfProgress(app);
        try {
            for (let i = 0; i < items.length; i++) {
                if (app.stopExporting) break;
                const it = items[i];
                prog.set('PDF ' + (i + 1) + '/' + items.length + '...');
                app.fretboard.updatePattern(it.key, it.type, it.pattern);
                await new Promise(r => requestAnimationFrame(r));
                await Exporter.addPdfDiagramPage(doc, app, Exporter.describePattern(app, it.key, it.type, it.pattern), state);
                if (i % 10 === 9) await new Promise(r => setTimeout(r, 0)); // keep UI responsive
            }
            if (state.pages > 0) {
                prog.set('Saving PDF...');
                Exporter.savePdf(doc, filename);
                if (window.ST) ST.toast((app.stopExporting ? 'Stopped - saved ' : 'Saved ') + state.pages + ' page PDF (' + label + ')');
            }
        } finally {
            prog.done();
            Exporter.restoreSelection(app, snap);
        }
    };

    Exporter.exportCurrentPatternAllKeysPDF = async function(app) {
        const fb = app.fretboard;
        const items = app.musicTheory.notes.map(k => ({ key: k, type: fb.currentPatternType, pattern: fb.currentPattern }));
        const name = Exporter.patternName(app, fb.currentPatternType, fb.currentPattern);
        await Exporter.runPdfJob(app, items, Exporter.safe(name + '_all_keys') + '.pdf', name + ' in 12 keys');
    };

    Exporter.exportSlideshowPDF = async function(app) {
        const items = (app.slideshowItems || []).filter(s => s && s.info).map(s => ({ key: s.info.key, type: s.info.patternType, pattern: s.info.pattern }));
        if (!items.length) { alert('The slideshow is empty. Use "Add to Slideshow" first.'); return; }
        await Exporter.runPdfJob(app, items, Exporter.safe(app.customFilename || 'slideshow') + '.pdf', 'slideshow');
    };

    Exporter.exportPatternTypePDF = async function(app, type) {
        const mt = app.musicTheory;
        const key = app.fretboard.currentKey || 'C';
        const src = type === 'scale' ? mt.scales : type === 'chord' ? mt.chords : type === 'interval' ? mt.intervals : mt.customPatterns;
        let ids = Object.keys(src || {});
        if (type === 'interval') ids = ids.filter(id => id !== '1').sort((a, b) => mt.intervals[a].semitones - mt.intervals[b].semitones);
        if (!ids.length) { alert('No ' + type + ' patterns available.'); return; }
        if (ids.length > 150 && !confirm('This will create a ' + ids.length + '-page PDF in ' + key + '. It can take a few minutes. Continue? (You can press Stop at any time and keep the pages made so far.)')) return;
        const items = ids.map(id => ({ key, type, pattern: id }));
        await Exporter.runPdfJob(app, items, Exporter.safe('all_' + type + 's_in_' + key) + '.pdf', 'all ' + type + 's in ' + key);
    };
}
