class Exporter {
    /** v1.0: which details are printed on exported diagrams (persisted locally). */
    static labelFields() {
        const def = { instrument: true, tuning: true, key: true, type: true, name: true, formula: true };
        try { return Object.assign(def, JSON.parse(localStorage.getItem('st_label_fields') || '{}') || {}); } catch (e) { return def; }
    }
    /** Header and footer text (saved on this device). Drawn as bands above and below the exported image. */
    static exportText() {
        const def = { header: '', footer: '' };
        try { return Object.assign(def, JSON.parse(localStorage.getItem('st_export_text') || '{}') || {}); } catch (e) { return def; }
    }
    static setExportText(field, value) {
        const t = Exporter.exportText(); t[field] = String(value || '').slice(0, 80);
        try { localStorage.setItem('st_export_text', JSON.stringify(t)); } catch (e) { /* ignore */ }
    }
    /** Adds optional header/footer bands to a rendered canvas. Returns src unchanged when both are empty. */
    static decorateExportImage(src, bg, scale) {
        const t = Exporter.exportText();
        const header = String(t.header || '').trim(), footer = String(t.footer || '').trim();
        if (!header && !footer) return src;
        const W = src.width, H = src.height;
        const hdr = header ? Math.round(32 * scale) : 0;
        const ftr = footer ? Math.round(28 * scale) : 0;
        const out = document.createElement('canvas');
        out.width = W; out.height = H + hdr + ftr;
        const c = out.getContext('2d');
        const background = bg || '#ffffff';
        c.fillStyle = background;
        c.fillRect(0, 0, out.width, out.height);
        c.drawImage(src, 0, hdr);
        // Browsers return #rrggbb for opaque colours, so the text colour follows the background brightness.
        const m = /^#([0-9a-f]{6})$/i.exec(c.fillStyle);
        let lum = 1;
        if (m) { const v = parseInt(m[1], 16); lum = ((v >> 16 & 255) * 0.299 + (v >> 8 & 255) * 0.587 + (v & 255) * 0.114) / 255; }
        const fg = lum < 0.5 ? '#f2f2f2' : '#222222';
        const drawLine = (text, y) => {
            const max = W - 24 * scale;
            let size = Math.round(14 * scale);
            c.font = size + 'px sans-serif';
            while (size > 8 * scale && c.measureText(text).width > max) { size -= 1; c.font = size + 'px sans-serif'; }
            c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText(text, W / 2, y, max);
        };
        if (header) drawLine(header, hdr / 2);
        if (footer) drawLine(footer, H + hdr + ftr / 2);
        return out;
    }
    static setLabelField(field, on) {
        const f = Exporter.labelFields(); f[field] = !!on;
        try { localStorage.setItem('st_label_fields', JSON.stringify(f)); } catch (e) { /* ignore */ }
    }

    /**
     * Render the current fretboard to an image and return base64 (no data: prefix).
     * opts.mime  - 'image/jpeg' (default) or 'image/png'
     * opts.scale - pixel ratio multiplier (default 1; PDF export uses 2 for crisp print)
     * v1.0: works fully offline; resolves musicTheory from the fretboard when an exporter
     * passes only { fretboard } (previously this threw inside onload and the export hung forever).
     */
    static async getFretboardImageBase64(app, opts = {}) {
        const mime = opts.mime || 'image/jpeg';
        const scale = Math.max(1, opts.scale || 1);
        const quality = mime === 'image/jpeg' ? (opts.quality || 0.9) : undefined;
        if (app && !app.musicTheory && app.fretboard && app.fretboard.musicTheory) {
            app = Object.assign({}, app, { musicTheory: app.fretboard.musicTheory });
        }
        try {
            const svg = app.fretboard.container.querySelector('svg');
            if (svg) {
                const clone = svg.cloneNode(true);
                const styleEl = document.createElement('style');
                styleEl.textContent = `
                    .string { stroke: #888; stroke-linecap: round; }
                    .fret { stroke: #444; stroke-linecap: butt; }
                    .fret-marker { fill: #333; }
                    .note-marker { stroke: ${getComputedStyle(document.documentElement).getPropertyValue('--marker-color') || '#333'}; stroke-width: 1; }
                    .note-marker[points] { stroke-linejoin: round; }
                    .fret-number { font-size: 12px; text-anchor: middle; fill: #666; font-family: Arial Narrow, Arial, sans-serif; }
                    .string-label { font-size: 12px; text-anchor: end; fill: #666; font-family: Arial Narrow, Arial, sans-serif; }
                `;
                clone.insertBefore(styleEl, clone.firstChild);

                const serializer = new XMLSerializer();
                let source = serializer.serializeToString(clone);
                if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                }

                return await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                      try {
                        const canvas = document.createElement('canvas');
                        const viewBox = clone.getAttribute('viewBox');
                        if (viewBox) {
                            const parts = viewBox.split(' ');
                            canvas.width = parseFloat(parts[2]);
                            canvas.height = parseFloat(parts[3]);
                        } else {
                            canvas.width = parseFloat(clone.getAttribute('width')) || 1000;
                            canvas.height = parseFloat(clone.getAttribute('height')) || 250;
                        }
                        const logicalW = canvas.width, logicalH = canvas.height;
                        canvas.width = Math.round(logicalW * scale);
                        canvas.height = Math.round(logicalH * scale);
                        const ctx = canvas.getContext('2d');
                        ctx.setTransform(scale, 0, 0, scale, 0, 0);
                        // Use fretboard's actual background color from settings/theme
                        let bgColor = '#ffffff';
                        if (app.fretboard && app.fretboard.getThemeColors) {
                            bgColor = app.fretboard.getThemeColors().background || '#ffffff';
                        }
                        ctx.fillStyle = bgColor;
                        ctx.fillRect(0, 0, logicalW, logicalH);
                        ctx.drawImage(img, 0, 0, logicalW, logicalH);

                        // Optional: Include Key - Pattern Type - Pattern text in the image
                        const simpleInfo = Exporter.includeTitles === true || document.getElementById('export-simple-info')?.checked || 
                                           document.getElementById('export-simple-info-sidebar')?.checked ||
                                           document.getElementById('export-simple-info-pill')?.checked;
                        const includeInfo = opts.includeInfo === false ? false : Exporter.includeTitles !== false && (document.getElementById('export-include-info')?.checked || simpleInfo);
                        if (includeInfo && app.fretboard) {
                            const key = app.fretboard.currentKey || '';
                            const type = app.fretboard.currentPatternType || '';
                            const patternId = app.fretboard.currentPattern || '';
                            
                            let patternName = patternId;
                            if (type === 'scale' && app.musicTheory.scales?.[patternId]) patternName = app.musicTheory.scales[patternId].name;
                            else if (type === 'chord' && app.musicTheory.chords?.[patternId]) patternName = app.musicTheory.chords[patternId].name;
                            else if (type === 'interval' && app.musicTheory.intervals?.[patternId]) patternName = app.musicTheory.intervals[patternId].name;
                            else if (type === 'gamut' && app.musicTheory.gamuts?.[patternId]) patternName = app.musicTheory.gamuts[patternId].name;
                            else if (type === 'custom' && app.musicTheory.customPatterns?.[patternId]) patternName = app.musicTheory.customPatterns[patternId].name;
                            
                            // Build intervals text depending on pattern type
                            let intervalsText = '';
                            try {
                                if (type === 'scale' && app.musicTheory.scales?.[patternId]) {
                                    intervalsText = (app.musicTheory.scales[patternId].intervals || []).join(' - ');
                                } else if (type === 'chord' && app.musicTheory.chords?.[patternId]) {
                                    intervalsText = (app.musicTheory.chords[patternId].intervals || []).join(' - ');
                                } else if (type === 'interval' && app.musicTheory.intervals?.[patternId]) {
                                    const iv = app.musicTheory.intervals[patternId];
                                    intervalsText = iv.shortName ? `${iv.shortName} · ${iv.semitones} semitones` : `${iv.semitones} semitones`;
                                } else if (type === 'custom' && app.musicTheory.customPatterns?.[patternId]) {
                                    intervalsText = (app.musicTheory.customPatterns[patternId].intervals || []).join(' - ');
                                } else {
                                    intervalsText = '';
                                }
                            } catch (e) {
                                intervalsText = '';
                            }
                            
                            const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
                            patternName = String(patternName || '');
                            const tuningText = (app.fretboard.settings.tuning || []).join('-');
                            const instSelect = document.getElementById('instrument-select');
                            const instrumentName = app.instrumentName ?? (instSelect && instSelect.options[instSelect.selectedIndex] ? instSelect.options[instSelect.selectedIndex].text : '');
                            
                            // v1.0: user-chosen label fields (Export footer > "Diagram label")
                            const lf = Exporter.labelFields();
                            const parts = [];
                            if (lf.instrument && instrumentName) parts.push(instrumentName.replace(/\s*\|\s*$/, ''));
                            if (lf.tuning && tuningText) parts.push(tuningText);
                            const desc = [];
                            if (lf.key && key) desc.push(key);
                            if (lf.type && typeLabel) desc.push(typeLabel);
                            if (lf.name && patternName) desc.push(patternName);
                            if (lf.formula && intervalsText) desc.push(intervalsText);
                            if (desc.length) parts.push(desc.join(' - '));
                            let infoString = '';
                            if (simpleInfo) {
                                infoString = `${key} - ${patternName}`;
                                if (type === 'scale' && !patternName.toLowerCase().includes('scale')) {
                                    infoString += ' Scale';
                                } else if (type === 'chord' && !patternName.toLowerCase().includes('chord')) {
                                    infoString += ' Chord';
                                }
                            } else {
                                infoString = parts.join(' | ');
                            }
                            if (infoString) {
                            
                            ctx.font = 'bold 16px sans-serif';
                            let textWidth = ctx.measureText(infoString).width;
                            // v1.0 fix: long info strings overflowed the image edges
                            const maxW = logicalW - 40;
                            if (textWidth > maxW) {
                                const fs = Math.max(9, Math.floor(16 * maxW / textWidth));
                                ctx.font = 'bold ' + fs + 'px sans-serif';
                                textWidth = ctx.measureText(infoString).width;
                            }
                            
                            // Draw nice rounded pill background for text readability
                            const paddingX = 16;
                            const paddingY = 6;
                            const rectX = (logicalW / 2) - (textWidth / 2) - paddingX;
                            const rectY = logicalH - 30;
                            const rectW = textWidth + (paddingX * 2);
                            const rectH = 24 + paddingY;
                            
                            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                            if (ctx.roundRect) {
                                ctx.beginPath();
                                ctx.roundRect(rectX, rectY, rectW, rectH, 8);
                                ctx.fill();
                            } else {
                                ctx.fillRect(rectX, rectY, rectW, rectH);
                            }
                            
                            ctx.fillStyle = '#FFFFFF';
                            ctx.textAlign = 'center';
                            ctx.fillText(infoString, logicalW / 2, logicalH - 10);
                            }
                        }

                        resolve(Exporter.decorateExportImage(canvas, bgColor, scale).toDataURL(mime, quality).split(',')[1]);
                      } catch (err) {
                        reject(err);
                      }
                    };
                    img.onerror = () => reject(new Error('Could not rasterise fretboard SVG'));
                    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
                });
            }
        } catch (e) {
            console.warn('SVG direct render failed, falling back to html2canvas', e);
        }
        
        // Fallback to html2canvas (vendored locally - works offline)
        if (typeof html2canvas === 'undefined') throw new Error('Image renderer unavailable');
        const canvas = await html2canvas(app.fretboard.container, { logging: false, scale });
        return Exporter.decorateExportImage(canvas, '#ffffff', scale).toDataURL(mime, quality).split(',')[1];
    }

    // removed exportAllScalesToZip() {} -> moved to exporter-scales.js
    // removed exportAllChordsToZip() {} -> moved to exporter-chords.js
    // removed exportAllIntervalsToZip() {} -> moved to exporter-intervals.js
    // removed exportAllGamutsToZip() {} -> moved to exporter-gamuts.js

    // removed bulk and CoF export methods -> moved to exporter-bulk.js and exporter-cof.js
}
// v1.0: persist the "Diagram label" checkboxes in the export footer
document.addEventListener('change', (e) => {
    const f = e.target && e.target.dataset && e.target.dataset.labelField;
    if (f) Exporter.setLabelField(f, e.target.checked);
});
