(() => {
    'use strict';
    const tabs = [
        { id: 'content', title: 'Content', scope: 'Publication details appear before the sections; category and key introductions repeat within their matching sections. Caption prefix/suffix wrap the main caption; practice prompts and credits appear below it. Text supports {category}, {key}, {name}, {intervals}, {tuning}, {startFret}, {endFret}, and {date}. Used in page/document exports, not catalog-only files.', fields: [
            ['publicationCode', 'Collection code', 'text', ''], ['publisher', 'Publisher', 'text', ''],
            ['edition', 'Edition', 'text', ''], ['revision', 'Revision', 'text', ''],
            ['copyright', 'Copyright notice', 'text', ''], ['license', 'License', 'text', ''],
            ['website', 'Website / contact', 'text', ''], ['dedication', 'Dedication', 'text', ''],
            ['learningGoal', 'Learning objective', 'text', ''], ['categoryIntro', 'Category introduction', 'text', ''],
            ['keyIntro', 'Key introduction', 'text', ''], ['captionPrefix', 'Caption prefix', 'text', ''],
            ['captionSuffix', 'Caption suffix', 'text', ''], ['practicePrompt', 'Practice prompt below each caption', 'text', ''],
            ['diagramCredit', 'Diagram credit below each caption', 'text', '']
        ] },
        { id: 'layers', title: 'Diagram Layers', scope: 'These settings change exported diagram artwork, not the live fretboard. Root-only removes non-root note markers; hiding open notes does not hide tuning labels. Mirroring reflects the full diagram, including its text. Blank color overrides inherit the current appearance.', fields: [
            ['layerStrings', 'Show strings', 'boolean', true], ['layerFrets', 'Show frets', 'boolean', true],
            ['layerInlays', 'Show fret-position inlays', 'boolean', true], ['layerTuning', 'Show open-string tuning labels', 'boolean', true],
            ['layerNumbers', 'Show fret numbers', 'boolean', true], ['layerLabels', 'Show note labels', 'boolean', true],
            ['rootsOnly', 'Show root notes only', 'boolean', false], ['hideOpenNotes', 'Hide open-string note markers', 'boolean', false],
            ['mirrorHorizontal', 'Reflect diagram left ↔ right', 'boolean', false], ['mirrorVertical', 'Reflect diagram top ↔ bottom', 'boolean', false],
            ['layerStringColor', 'String color override (hex)', 'optional-color', ''], ['layerFretColor', 'Fret color override (hex)', 'optional-color', ''],
            ['layerRootColor', 'Root marker color override (hex)', 'optional-color', ''], ['layerNoteColor', 'Other marker color override (hex)', 'optional-color', ''],
            ['layerLabelColor', 'Note label color override (hex)', 'optional-color', '']
        ] },
        { id: 'watermark', title: 'Watermark', scope: 'Watermarks are stamped on exported diagram images, including those embedded in documents. Leave the text blank to turn the watermark off. Size, padding, and letter spacing are relative to diagram height or text size as labeled; position is measured from the left/top, with 50% at center. Opacity runs from 0 (invisible) to 1 (opaque).', fields: [
            ['watermarkText', 'Watermark text', 'text', ''], ['watermarkFont', 'Font family', 'select', 'Arial', ['Arial', 'Times New Roman', 'Courier New']],
            ['watermarkSize', 'Font size (% of diagram height)', 'number', 14, 2, 60], ['watermarkColor', 'Text color', 'color', '#777777'],
            ['watermarkOpacity', 'Text opacity (0–1)', 'number', 0.18, 0, 1], ['watermarkAngle', 'Rotation (degrees)', 'number', -20, -180, 180],
            ['watermarkX', 'Position from left (%)', 'number', 50, 0, 100], ['watermarkY', 'Position from top (%)', 'number', 50, 0, 100],
            ['watermarkWeight', 'Bold text', 'boolean', false], ['watermarkItalic', 'Italic text', 'boolean', false],
            ['watermarkTracking', 'Letter spacing (% of font size)', 'number', 0, -10, 100], ['watermarkBackground', 'Background color', 'color', '#ffffff'],
            ['watermarkBackgroundOpacity', 'Background opacity (0–1)', 'number', 0, 0, 1], ['watermarkPadding', 'Background padding (% of diagram height)', 'number', 2, 0, 15],
            ['watermarkRepeat', 'Repeat watermark in a 3 x 3 grid', 'boolean', false]
        ] },
        { id: 'packaging', title: 'Packaging', scope: 'Download name controls the file your browser saves. Archive entry settings control files inside ZIP collections. Templates support {key}, {category}, {name}, {pattern}, and {number}: in Download name, number is the total diagram count; in an archive entry it is the padded sequence number. Page archives may not have key/category values. Folder and companion-file options apply to supported ZIP exports. Auto compression stores already-compressed images and uses DEFLATE where it can help; compression level applies only to DEFLATE. Space replacement applies to custom download names and ZIP entries; automatic download names keep their built-in format.', fields: [
            ['downloadName', 'Download name template (blank = automatic)', 'text', ''], ['archivePrefix', 'Archive entry prefix', 'text', ''],
            ['archiveSuffix', 'Archive entry suffix', 'text', ''], ['entryTemplate', 'Archive entry template', 'text', '{number}_{key}_{name}'],
            ['filenameCase', 'Filename letter case', 'select', 'preserve', ['preserve', 'lower', 'upper']], ['filenameSeparator', 'Space replacement', 'select', '_', ['_', '-', ' ']],
            ['sequenceDigits', 'Sequence number digits', 'integer', 3, 1, 8], ['categoryFolders', 'Group diagram files by category', 'boolean', true],
            ['keyFolders', 'Group diagram files by key', 'boolean', false], ['archiveRoot', 'Root folder name', 'text', ''],
            ['archiveManifest', 'Include diagram manifest JSON', 'boolean', false], ['archiveSettings', 'Include export settings JSON', 'boolean', false],
            ['archiveReadme', 'Include collection notes TXT', 'boolean', false], ['zipCompression', 'ZIP compression', 'select', 'auto', ['auto', 'STORE', 'DEFLATE']],
            ['zipLevel', 'DEFLATE level (1–9)', 'integer', 6, 1, 9]
        ] },
        { id: 'tables', title: 'Data Tables', scope: 'Column choices apply to CSV, TSV, spreadsheets, and supported table exports. Delimiter, cell quoting, UTF-8 BOM, and line endings apply only to CSV/TSV. The sample below shows selected diagram rows; export headings follow Include column headings.', fields: [
            ['columnNumber', 'Include sequence number', 'boolean', true], ['columnCategory', 'Include category', 'boolean', true],
            ['columnKey', 'Include key', 'boolean', true], ['columnPattern', 'Include pattern ID', 'boolean', true],
            ['columnName', 'Include pattern name', 'boolean', true], ['columnCaption', 'Include caption', 'boolean', true],
            ['columnIntervals', 'Include intervals', 'boolean', true], ['columnTuning', 'Include tuning', 'boolean', true],
            ['columnStart', 'Include start fret', 'boolean', true], ['columnEnd', 'Include end fret', 'boolean', true],
            ['tableDelimiter', 'Delimiter', 'select', 'auto', ['auto', 'comma', 'semicolon', 'tab', 'pipe']],
            ['tableHeader', 'Include column headings', 'boolean', true], ['tableBom', 'UTF-8 BOM for spreadsheet compatibility', 'boolean', true],
            ['tableNewline', 'Line endings', 'select', 'crlf', ['crlf', 'lf']], ['tableQuotes', 'Cell quoting', 'select', 'always', ['always', 'minimal']]
        ] },
        { id: 'reader', title: 'HTML Reader', scope: 'These settings affect only the downloaded standalone HTML collection. Screen layout and the optional reader header are separate from text printed on each page. Print hides screen spacing, shadows, borders, rounded corners, and the reader header; page size comes from Page & diagram. Language sets the document language for accessibility tools and does not translate text.', fields: [
            ['readerBackground', 'Reader background', 'color', '#e8e8e8'], ['readerPageBackground', 'Page background', 'color', '#ffffff'],
            ['readerGap', 'Space between pages (px)', 'number', 20, 0, 120], ['readerPadding', 'Outer padding (px)', 'number', 20, 0, 100],
            ['readerWidth', 'Page width (%)', 'number', 100, 30, 100], ['readerShadow', 'Page shadows', 'boolean', true],
            ['readerBorder', 'Page borders', 'boolean', false], ['readerBorderColor', 'Border color', 'color', '#cccccc'],
            ['readerBorderWidth', 'Border thickness (px)', 'number', 1, 0, 8], ['readerRadius', 'Page corner radius (px)', 'number', 0, 0, 40],
            ['readerTitle', 'Show collection title', 'boolean', false], ['readerAuthor', 'Show author', 'boolean', false],
            ['readerCount', 'Show total page count', 'boolean', false], ['readerPrint', 'Show Print button', 'boolean', false],
            ['readerLanguage', 'Document language', 'select', 'en', ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja']]
        ] }
    ];
    const suffix = name => 'advanced-' + name.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
    const fields = tabs.flatMap(tab => tab.fields.map(([name, , type, value, min, max]) => [name, suffix(name), type, value, min, max]));
    function mount(dialog) {
        return tabs.map(tab => {
            const card = document.createElement('details'); card.className = 'beta-card'; card.id = 'beta-advanced-' + tab.id;
            const summary = document.createElement('summary'); summary.textContent = tab.title; card.append(summary);
            const body = document.createElement('div'); body.className = 'beta-card-body';
            const scope = document.createElement('p'); scope.className = 'beta-advanced-scope'; scope.textContent = tab.scope; body.append(scope);
            const grid = document.createElement('div'); grid.className = 'beta-advanced-grid';
            for (const [name, title, type, value, min, max] of tab.fields) {
                const label = document.createElement('label'); label.textContent = title; label.htmlFor = 'beta-' + suffix(name);
                const multiline = tab.id === 'content' && ['dedication', 'learningGoal', 'categoryIntro', 'keyIntro', 'practicePrompt'].includes(name);
                if (multiline) label.className = 'beta-advanced-multiline';
                const input = document.createElement(type === 'select' ? 'select' : multiline ? 'textarea' : 'input'); input.id = label.htmlFor;
                if (multiline) input.rows = 2;
                if (type === 'select') min.forEach(choice => {
                    const optionLabels = tab.id === 'packaging' && name === 'zipCompression' ? { auto: 'Automatic (recommended)', STORE: 'STORE — no compression', DEFLATE: 'DEFLATE — compressed' }
                        : tab.id === 'reader' && name === 'readerLanguage' ? { en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', ja: 'Japanese' } : null;
                    input.append(new Option(optionLabels?.[choice] || choice, choice));
                });
                else if (input.tagName === 'INPUT') input.type = type === 'boolean' ? 'checkbox' : ['integer', 'number'].includes(type) ? 'number' : type === 'color' ? 'color' : 'text';
                if (type === 'boolean') { input.checked = value; label.className = 'beta-advanced-check'; }
                else input.value = value;
                if (multiline) input.maxLength = 10000;
                if (['integer', 'number'].includes(type)) { input.min = min; input.max = max; input.step = type === 'integer' ? '1' : 'any'; }
                if (type === 'text') input.maxLength = 10000;
                if (tab.id === 'packaging') {
                    const examples = { downloadName: 'e.g. Collection_{category}_{number}', archivePrefix: 'Optional text before each ZIP entry', archiveSuffix: 'Optional text after each ZIP entry', entryTemplate: '{number}_{key}_{name}', archiveRoot: 'Optional top-level ZIP folder' };
                    if (examples[name]) input.placeholder = examples[name];
                }
                if (type === 'optional-color') { input.placeholder = '#RRGGBB or blank'; input.maxLength = 7; }
                label.append(input); grid.append(label);
            }
            body.append(grid); card.append(body); dialog.querySelector('.beta-body').append(card); return card;
        });
    }
    globalThis.FretboardBetaAdvancedSchema = { tabs, fields, mount };
})();
