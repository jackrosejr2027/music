/**
 * Offline Favorites library for theory items and portable app content.
 */
document.addEventListener('DOMContentLoaded', () => {
    const mt = new MusicTheory();
    const root = document.getElementById('favorites-list');
    const count = document.getElementById('favorites-count');
    const status = document.getElementById('favorites-status');
    const pdfButton = document.getElementById('favorites-pdf');
    const jsonButton = document.getElementById('favorites-json-export');
    const importButton = document.getElementById('favorites-json-import-button');
    const importInput = document.getElementById('favorites-json-import');
    const read = key => ST.getJSON(key, {}) || {};
    const write = (key, value) => ST.setJSON(key, value);

    function appendText(parent, tag, text, className) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        element.textContent = text;
        parent.appendChild(element);
        return element;
    }

    function validHref(value) {
        return typeof value === 'string' && value && !value.startsWith('//') &&
            !value.startsWith('http:') && !value.startsWith('https:') && !value.startsWith('javascript:')
            ? value : '';
    }

    function card(title, type, details, href, remove) {
        const element = document.createElement('article');
        element.className = 'fav-card';
        appendText(element, 'div', type, 'fav-type');
        appendText(element, 'h3', title);
        details.filter(Boolean).forEach(line => appendText(element, 'p', line));
        const actions = document.createElement('div');
        actions.className = 'fav-actions';
        if (href) {
            const open = document.createElement('a');
            open.className = 'fav-btn primary';
            open.href = href;
            open.textContent = 'Open';
            actions.appendChild(open);
        }
        const button = document.createElement('button');
        button.className = 'fav-btn';
        button.type = 'button';
        button.textContent = 'Remove';
        button.addEventListener('click', () => {
            if (!remove()) { status.textContent = 'Storage is unavailable; this favorite could not be removed.'; return; }
            status.textContent = 'Favorite removed.';
            render();
        });
        actions.appendChild(button);
        element.appendChild(actions);
        return element;
    }

    function legacyCard(type, id, data) {
        const notes = type === 'scale' ? mt.getScaleNotes('C', id) : mt.getChordNotes('C', id);
        const key = type === 'scale' ? 'favoriteScales' : 'favoriteChords';
        const label = type === 'scale' ? 'Scale' : 'Chord';
        return card(data.name, label, [
            'Formula: ' + data.intervals.join(' - '),
            'In C: ' + notes.join(' - ')
        ], 'fretboard.html?key=C&patternType=' + type + '&pattern=' + encodeURIComponent(id), () => {
            const values = read(key);
            delete values[id];
            return write(key, values);
        });
    }

    function favoriteDetails(item) {
        const data = item.data && typeof item.data === 'object' ? item.data : {};
        if (item.type === 'theory-card') return ['Prompt: ' + (data.prompt || ''), 'Answer: ' + (data.answer || '')];
        if (item.type === 'theory-deck-card') return [
            data.deckName ? 'Deck: ' + data.deckName : '',
            data.prompt ? 'Prompt: ' + data.prompt : '',
            data.subtitle ? 'Answer: ' + data.subtitle : '',
            data.answer ? 'Details: ' + data.answer : '',
            ...(Array.isArray(data.rows) ? data.rows.map(row => Array.isArray(row) ? row[0] + ': ' + row[1] : '') : [])
        ];
        if (item.type === 'idea-note') return [
            data.text ? 'Note: ' + data.text : 'Fretboard idea',
            data.diagram && data.diagram.notes ? 'Diagram: ' + data.diagram.notes : '',
            data.diagram && Array.isArray(data.diagram.marks) ? 'Marked frets: ' + data.diagram.marks.length : ''
        ];
        if (item.type === 'interval') return [
            data.formula ? 'Formula: ' + data.formula : '',
            Number.isFinite(data.semitones) ? 'Semitones: ' + data.semitones : '',
            data.example ? 'Example: ' + data.example : ''
        ];
        if (item.type === 'fretboard-diagram') return [
            data.key ? 'Key: ' + data.key : '',
            data.patternType && data.patternId ? 'Pattern: ' + data.patternType + ' · ' + data.patternId : '',
            Array.isArray(data.notes) && data.notes.length ? 'Notes: ' + data.notes.join(' - ') : '',
            Array.isArray(data.tuning) && data.tuning.length ? 'Tuning: ' + data.tuning.join(' - ') : '',
            Number.isFinite(data.startFret) && Number.isFinite(data.endFret) ? 'Frets: ' + data.startFret + '–' + data.endFret : ''
        ];
        if (item.type === 'progression') return [
            data.key ? 'Key: ' + data.key : '',
            data.mode ? 'Mode: ' + data.mode : '',
            Array.isArray(data.sequence) ? 'Degrees: ' + data.sequence.map(degree => degree + 1).join(' - ') : '',
            data.quality && data.quality !== 'diatonic' ? 'Chord quality: ' + data.quality : '',
            Number.isFinite(data.bpm) ? 'Tempo: ' + data.bpm + ' BPM' : '',
            data.explanation || ''
        ];
        if (Array.isArray(data.steps)) return [
            data.key ? 'Key: ' + data.key : '',
            data.steps.length + ' blocks',
            data.tempo ? 'Tempo: ' + data.tempo + ' BPM' : '',
            data.description || ''
        ];
        return [data.description || data.summary || 'Saved item from ' + item.type + '.'];
    }

    function render() {
        const favoriteScales = read('favoriteScales');
        const favoriteChords = read('favoriteChords');
        const scales = Object.keys(favoriteScales).filter(id => favoriteScales[id] && mt.scales[id]);
        const chords = Object.keys(favoriteChords).filter(id => favoriteChords[id] && mt.chords[id]);
        const other = ST.favorites ? ST.favorites.list() : [];
        const total = scales.length + chords.length + other.length;
        root.replaceChildren();
        count.textContent = total
            ? scales.length + ' scales · ' + chords.length + ' chords · ' + other.length + ' other items'
            : '';
        pdfButton.hidden = total === 0;
        jsonButton.hidden = total === 0;
        if (!total) {
            appendText(root, 'p', 'No favorites yet. Save a scale, chord, interval, card, lesson, or progression and it will appear here.', 'fav-empty');
            return;
        }
        scales.sort((a, b) => mt.scales[a].name.localeCompare(mt.scales[b].name)).forEach(id => root.appendChild(legacyCard('scale', id, mt.scales[id])));
        chords.sort((a, b) => mt.chords[a].name.localeCompare(mt.chords[b].name)).forEach(id => root.appendChild(legacyCard('chord', id, mt.chords[id])));
        other.slice().sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title)).forEach(item => {
            root.appendChild(card(item.title, item.type, favoriteDetails(item), validHref(item.href), () => ST.favorites.remove(item.type, item.id)));
        });
    }

    function allData() {
        return {
            format: 'scales-thesaurus-favorites',
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            favoriteScales: read('favoriteScales'),
            favoriteChords: read('favoriteChords'),
            items: ST.favorites ? ST.favorites.list() : []
        };
    }

    pdfButton.addEventListener('click', () => {
        const JsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!JsPDF) { status.textContent = 'The local PDF exporter is unavailable.'; return; }
        const doc = new JsPDF({ unit: 'pt', format: 'a4' });
        const width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight(), margin = 48;
        let y = margin;
        const line = (text, size = 10.5, bold = false) => {
            if (y > height - 54) { doc.addPage(); y = margin; }
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            doc.setFontSize(size);
            const wrapped = doc.splitTextToSize(String(text), width - margin * 2);
            doc.text(wrapped, margin, y);
            y += wrapped.length * (size + 3) + 5;
        };
        line('My Favorites', 22, true);
        line('Exported ' + new Date().toLocaleString(), 9);
        const favoriteScales = read('favoriteScales'), favoriteChords = read('favoriteChords');
        Object.keys(favoriteScales).filter(id => favoriteScales[id] && mt.scales[id]).forEach(id => {
            line(mt.scales[id].name, 12, true);
            line('Scale formula: ' + mt.scales[id].intervals.join(' - ') + ' · In C: ' + mt.getScaleNotes('C', id).join(' - '));
        });
        Object.keys(favoriteChords).filter(id => favoriteChords[id] && mt.chords[id]).forEach(id => {
            line(mt.chords[id].name, 12, true);
            line('Chord formula: ' + mt.chords[id].intervals.join(' - ') + ' · In C: ' + mt.getChordNotes('C', id).join(' - '));
        });
        (ST.favorites ? ST.favorites.list() : []).forEach(item => {
            line(item.title, 12, true);
            favoriteDetails(item).forEach(detail => line(detail));
        });
        ST.download(doc.output('blob'), 'my_favorites.pdf');
        status.textContent = 'Favorites exported as PDF.';
    });

    jsonButton.addEventListener('click', () => {
        ST.download(new Blob([JSON.stringify(allData(), null, 2)], { type: 'application/json' }), 'scales-thesaurus-favorites.json');
        status.textContent = 'Portable Favorites backup exported.';
    });
    importButton.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', async () => {
        const file = importInput.files && importInput.files[0];
        importInput.value = '';
        if (!file) return;
        try {
            if (file.size > 8 * 1024 * 1024) throw new Error('Choose a Favorites backup under 8 MB.');
            const backup = JSON.parse(await file.text());
            if (!backup || backup.format !== 'scales-thesaurus-favorites' || backup.schemaVersion !== 1) throw new Error('This is not a supported Favorites backup.');
            const scales = Object.assign({}, read('favoriteScales'));
            const chords = Object.assign({}, read('favoriteChords'));
            Object.keys(backup.favoriteScales || {}).forEach(id => { if (mt.scales[id] && backup.favoriteScales[id]) scales[id] = true; });
            Object.keys(backup.favoriteChords || {}).forEach(id => { if (mt.chords[id] && backup.favoriteChords[id]) chords[id] = true; });
            const merged = ST.favorites ? ST.favorites.list() : [];
            const importedItems = Array.isArray(backup.items) ? backup.items : [];
            if (importedItems.length > 5000) throw new Error('This backup exceeds the 5,000-item Favorites limit.');
            const seen = new Set(merged.map(item => item.type + '|' + item.id));
            let imported = 0;
            importedItems.forEach(item => {
                if (!item || typeof item.type !== 'string' || !/^[a-z0-9_-]{1,48}$/i.test(item.type) || typeof item.id !== 'string' || typeof item.title !== 'string' || item.title.length > 180) return;
                const signature = item.type + '|' + item.id;
                if (seen.has(signature)) return;
                const href = validHref(item.href);
                const safeItem = { type: item.type.slice(0, 48), id: item.id.slice(0, 512), title: item.title, href, data: item.data == null ? null : item.data, updated: Date.now() };
                if (JSON.stringify(safeItem).length > 131072) return;
                seen.add(signature);
                merged.push(safeItem);
                imported++;
            });
            const oldScales = localStorage.getItem('favoriteScales'), oldChords = localStorage.getItem('favoriteChords');
            try {
                localStorage.setItem('favoriteScales', JSON.stringify(scales));
                localStorage.setItem('favoriteChords', JSON.stringify(chords));
                if (ST.favorites && !ST.favorites.replace(merged)) throw new Error('Browser storage could not save the imported Favorites.');
            } catch (error) {
                if (oldScales === null) localStorage.removeItem('favoriteScales'); else localStorage.setItem('favoriteScales', oldScales);
                if (oldChords === null) localStorage.removeItem('favoriteChords'); else localStorage.setItem('favoriteChords', oldChords);
                throw error;
            }
            status.textContent = 'Imported and merged ' + imported + ' additional favorites.';
            render();
        } catch (error) {
            status.textContent = error.message || 'Could not import this Favorites backup.';
        }
    });

    window.addEventListener('st:favoriteschange', render);
    window.addEventListener('storage', event => {
        if (event.key === 'favoriteScales' || event.key === 'favoriteChords' || event.key === 'st_favorites_v1') render();
    });
    render();
});
