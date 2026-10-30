document.addEventListener('DOMContentLoaded', () => {

    const DataEditor = {
        musicTheory: new MusicTheory(),
        LOCAL_STORAGE_KEY: 'manic_rules_custom_data',

        init() {
            this.initTabs();
            this.populateAllTables();
            this.initExportButtons();
            this.initResetButton();
        },

        initTabs() {
            const tabsContainer = document.querySelector('.tabs');
            tabsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-link')) {
                    const tabName = e.target.dataset.tab;
                    
                    document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                    e.target.classList.add('active');
                    document.getElementById(`${tabName}-tab`).classList.add('active');
                }
            });
        },

        esc(v) {
            return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        },

        saveChange(type, id, field, value) {
            const target = this.musicTheory[type] && this.musicTheory[type][id];
            if (!target) return false;
            let customData = {};
            try {
                const stored = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || '{}');
                if (stored && typeof stored === 'object' && !Array.isArray(stored)) customData = stored;
            } catch (e) { customData = {}; }

            if (!customData[type] || typeof customData[type] !== 'object' || Array.isArray(customData[type])) customData[type] = {};
            if (!customData[type][id] || typeof customData[type][id] !== 'object' || Array.isArray(customData[type][id])) customData[type][id] = {};
            customData[type][id][field] = value;

            try {
                localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(customData));
                target[field] = value;
                return true;
            } catch (e) {
                console.error('Error saving data:', e);
                return false;
            }
        },

        showFeedback(element, success) {
            element.classList.remove('saved', 'error');
            element.classList.add(success ? 'saved' : 'error');
            setTimeout(() => element.classList.remove('saved', 'error'), 1500);
        },

        populateAllTables() {
            this.populateIntervalTable();
            this.populateGroupedTables('chords');
            this.populateGroupedTables('scales');
        },

        populateIntervalTable() {
            const tableBody = document.getElementById('interval-table').querySelector('tbody');
            tableBody.innerHTML = '';
            const sortedIntervals = Object.entries(this.musicTheory.intervals).sort(([, a], [, b]) => a.semitones - b.semitones);
            
            sortedIntervals.forEach(([id, data], index) => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${this.esc(id)}</td>
                    <td contenteditable="true">${this.esc(data.name)}</td>
                    <td contenteditable="true">${this.esc(data.shortName)}</td>
                    <td>${data.semitones}</td>
                    <td>
                      <div class="color-input-wrapper">
                        <input class="bg-color-input" type="color" value="${data.color}">
                        <span class="bg-color-text">${data.color}</span>
                      </div>
                    </td>
                    <td>
                      <div class="color-input-wrapper">
                        <input class="font-color-input" type="color" value="${data.fontColor || '#ffffff'}">
                        <span class="font-color-text">${data.fontColor || '#ffffff'}</span>
                      </div>
                    </td>
                `;
                this.addEditListener(row.cells[2], 'intervals', id, 'name');
                this.addEditListener(row.cells[3], 'intervals', id, 'shortName');
                // background color input (interval marker color)
                this.addEditListener(row.querySelector('.bg-color-input'), 'intervals', id, 'color', true);
                // font color input (text color shown on markers)
                this.addEditListener(row.querySelector('.font-color-input'), 'intervals', id, 'fontColor', true);
            });
            this.makeTableSortable(document.getElementById('interval-table'));
        },

        populateGroupedTables(type) { // 'chords' or 'scales'
            const container = document.getElementById(`${type}-tables-container`);
            const data = this.musicTheory[type];
            const groupedData = {};

            if (!container) return;
            Object.entries(data).forEach(([id, itemData]) => {
                if (!itemData || !Array.isArray(itemData.intervals)) return;
                const numTones = itemData.intervals.length;
                if (!groupedData[numTones]) groupedData[numTones] = [];
                groupedData[numTones].push([id, itemData]);
            });

            container.innerHTML = '';
            const sortedToneGroups = Object.keys(groupedData).sort((a, b) => a - b);

            sortedToneGroups.forEach(numTones => {
                const group = groupedData[numTones].sort(([, a], [, b]) => a.name.localeCompare(b.name));

                const heading = document.createElement('h3');
                heading.className = 'sub-heading';
                heading.textContent = `${numTones}-Tone ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                container.appendChild(heading);

                const table = document.createElement('table');
                table.className = 'data-table';
                table.id = `${type}-table-${numTones}`;
                container.appendChild(table);

                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>#</th><th>ID</th><th>Name</th><th class="tones-col">Tones</th><th>Intervals</th><th>Example (C Root)</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                const tbody = table.querySelector('tbody');
                group.forEach(([id, itemData], index) => {
                    const exampleNotes = type === 'chords' 
                        ? this.musicTheory.getChordNotes('C', id) 
                        : this.musicTheory.getScaleNotes('C', id);

                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${this.esc(id)}</td>
                        <td contenteditable="true">${this.esc(itemData.name)}</td>
                        <td class="tones-col">${itemData.intervals.length}</td>
                        <td contenteditable="true">${this.esc(itemData.intervals.join(','))}</td>
                        <td>${this.esc(exampleNotes.join(' - '))}</td>
                    `;
                    this.addEditListener(row.cells[2], type, id, 'name');
                    this.addEditListener(row.cells[4], type, id, 'intervals');
                });
                this.makeTableSortable(table);
            });
        },

        addEditListener(element, type, id, field, isColorInput = false) {
            const eventType = isColorInput ? 'change' : 'blur';
            element.addEventListener(eventType, (e) => {
                let valueToSave = isColorInput ? e.target.value : e.target.textContent.trim();
                let success = false;
                let feedbackElement = e.target.closest('td');
                const originalValue = this.musicTheory[type]?.[id]?.[field];
                const restoreValue = () => {
                    if (isColorInput) {
                        e.target.value = String(originalValue ?? '');
                        if (e.target.nextElementSibling) e.target.nextElementSibling.textContent = String(originalValue ?? '');
                    } else {
                        e.target.textContent = Array.isArray(originalValue) ? originalValue.join(',') : String(originalValue ?? '');
                    }
                };
                
                if ((type === 'chords' || type === 'scales') && field === 'intervals') {
                    const intervalsArray = valueToSave.split(',').map(s => s.trim()).filter(Boolean);
                    if (intervalsArray.length > 0 && intervalsArray.every(int => this.musicTheory.intervals[int] || this.musicTheory.getIntervalSemitones(int) !== null)) {
                        valueToSave = intervalsArray;
                        success = this.saveChange(type, id, field, valueToSave);
                        if (success) {
                            this.populateGroupedTables(type);
                            const table = document.getElementById(`${type}-table-${valueToSave.length}`);
                            const row = Array.from(table?.tBodies[0]?.rows || []).find(item => item.cells[1]?.textContent === id);
                            if (row) feedbackElement = row.cells[4];
                        } else {
                            restoreValue();
                        }
                    } else {
                        alert(`Invalid intervals for ${id}. Changes not saved.`);
                        restoreValue();
                    }
                } else {
                    success = this.saveChange(type, id, field, valueToSave);
                    if (success && isColorInput) e.target.nextElementSibling.textContent = valueToSave;
                    else if (!success) restoreValue();
                }
                this.showFeedback(feedbackElement, success);
            });

            if (!isColorInput) {
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.target.blur();
                    }
                });
            }
        },

        makeTableSortable(table) {
            const thead = table.tHead;
            if (!thead) return;
            thead.querySelectorAll('th').forEach((header, index) => {
                header.classList.add('sortable');
                header.addEventListener('click', () => {
                    const isAsc = header.classList.contains('sort-asc');
                    thead.querySelectorAll('th').forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
                    header.classList.toggle('sort-asc', !isAsc);
                    header.classList.toggle('sort-desc', isAsc);
                    this.sortTableByColumn(table, index, !isAsc);
                });
            });
        },

        sortTableByColumn(table, columnIndex, asc = true) {
            const tbody = table.tBodies[0];
            const rows = Array.from(tbody.rows);
            const dirModifier = asc ? 1 : -1;

            rows.sort((a, b) => {
                let aText = a.cells[columnIndex].textContent.trim();
                let bText = b.cells[columnIndex].textContent.trim();
                const isNumberColumn = !isNaN(parseFloat(aText)) && !isNaN(parseFloat(bText));
                
                if (isNumberColumn) {
                    return dirModifier * (parseFloat(aText) - parseFloat(bText));
                } else {
                    return dirModifier * aText.localeCompare(bText, undefined, { numeric: true });
                }
            });

            tbody.append(...rows);
        },

        tablesToRows(tables) {
            const rows = [];
            tables.forEach((table, ti) => {
                Array.from(table.rows).forEach((r, ri) => {
                    if (ti > 0 && ri === 0) return; // single header row
                    rows.push(Array.from(r.cells).map(c => c.querySelector('input') ? c.querySelector('input').value : c.textContent.trim()));
                });
            });
            return rows;
        },

        exportCSV(tables, fileName) {
            const rows = this.tablesToRows(tables);
            const csv = rows.map(r => r.map(v => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v).join(',')).join('\r\n');
            ST.download(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), fileName);
        },

        exportPDF(tables, title, fileName) {
            const JsPDF = window.jspdf && window.jspdf.jsPDF;
            if (!JsPDF) { alert('PDF engine failed to load.'); return; }
            const rows = this.tablesToRows(tables);
            if (!rows.length) return;
            const doc = new JsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 32;
            const header = rows[0], body = rows.slice(1);
            const weights = header.map((h, i) => Math.max(h.length, ...body.slice(0, 200).map(r => Math.min(40, (r[i] || '').length))) + 2);
            const total = weights.reduce((a, b) => a + b, 0);
            const widths = weights.map(w => (W - 2 * M) * w / total);
            let y = M;
            const drawHeader = () => {
                doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setFillColor(44, 62, 80); doc.setTextColor(255, 255, 255);
                doc.rect(M, y, W - 2 * M, 18, 'F');
                let x = M; header.forEach((h, i) => { doc.text(String(h), x + 4, y + 12); x += widths[i]; });
                y += 18; doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20);
            };
            doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(title, M, y + 10); y += 26;
            drawHeader();
            body.forEach((r, ri) => {
                const cells = r.map((v, i) => doc.splitTextToSize(String(v), widths[i] - 8));
                const lineCount = Math.max(1, ...cells.map(c => c.length));
                const rh = 11 * lineCount + 6;
                if (y + rh > H - M) { doc.addPage(); y = M; drawHeader(); }
                if (ri % 2 === 0) { doc.setFillColor(245, 245, 245); doc.rect(M, y, W - 2 * M, rh, 'F'); }
                let x = M; doc.setFontSize(8.5);
                cells.forEach((c, i) => { doc.text(c, x + 4, y + 11); x += widths[i]; });
                y += rh;
            });
            ST.download(doc.output('blob'), fileName);
        },

        initExportButtons() {
            const grouped = (type) => Array.from(document.querySelectorAll('#' + type + '-tables-container .data-table'));
            const iv = () => [document.getElementById('interval-table')];
            document.getElementById('export-intervals-csv')?.addEventListener('click', () => this.exportCSV(iv(), 'intervals_data.csv'));
            document.getElementById('export-chords-csv')?.addEventListener('click', () => this.exportCSV(grouped('chords'), 'all_chords_data.csv'));
            document.getElementById('export-scales-csv')?.addEventListener('click', () => this.exportCSV(grouped('scales'), 'all_scales_data.csv'));
            document.getElementById('export-intervals-pdf')?.addEventListener('click', () => this.exportPDF(iv(), 'Intervals', 'intervals_data.pdf'));
            document.getElementById('export-chords-pdf')?.addEventListener('click', () => this.exportPDF(grouped('chords'), 'All Chords', 'all_chords_data.pdf'));
            document.getElementById('export-scales-pdf')?.addEventListener('click', () => this.exportPDF(grouped('scales'), 'All Scales', 'all_scales_data.pdf'));
            document.getElementById('export-intervals-xlsx').addEventListener('click', () => {
                this.exportTableToXLSX('interval-table', 'Intervals', 'intervals_data.xlsx');
            });
            document.getElementById('export-all-chords-xlsx').addEventListener('click', () => {
                this.exportGroupedToXLSX('chords', 'all_chords_data.xlsx');
            });
             document.getElementById('export-all-scales-xlsx').addEventListener('click', () => {
                this.exportGroupedToXLSX('scales', 'all_scales_data.xlsx');
            });
        },

        exportTableToXLSX(tableId, sheetName, fileName) {
            const table = document.getElementById(tableId);
            if (!table) return;
            if (typeof XLSX === 'undefined') { alert('Spreadsheet engine failed to load.'); return; }
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, fileName);
        },

        exportGroupedToXLSX(type, fileName) {
            if (typeof XLSX === 'undefined') { alert('Spreadsheet engine failed to load.'); return; }
            const wb = XLSX.utils.book_new();
            const tables = document.querySelectorAll(`#${type}-tables-container .data-table`);
            tables.forEach(table => {
                const numTones = table.id.split('-').pop();
                let sheetName = `${numTones} Tone ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                sheetName = sheetName.replace(/[:\\/?*[\]]/g, '').substring(0, 31);
                const ws = XLSX.utils.table_to_sheet(table);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            });
            if (wb.SheetNames.length > 0) {
                XLSX.writeFile(wb, fileName);
            } else {
                alert(`No ${type} tables found to export.`);
            }
        },

        initResetButton() {
            document.getElementById('reset-data').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete all custom changes and restore the default data? This action cannot be undone.')) {
                    try {
                        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
                        window.location.reload();
                    } catch (error) {
                        if (window.ST && ST.toast) ST.toast('Could not reset the data because browser storage is unavailable.');
                        else alert('Could not reset the data because browser storage is unavailable.');
                    }
                }
            });
        }
    };
    
    DataEditor.init();
});