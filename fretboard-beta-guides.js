(() => {
    'use strict';
    const guides = [
        ['selection', 'Patterns & keys', [
            ['Build a collection', 'Expand the pattern catalog, select intervals, chords or scales, then select the musical keys to include. Every selected pattern is exported in every selected key. For example, three patterns and four keys produce twelve diagrams. The selection count is the best check before starting a large export.'],
            ['Find the right patterns', 'Use category search to narrow the catalog by name or interval content. Interval filters help find related sounds even when names differ. Shown-only selection actions operate on the filtered results; filtering is not itself a replacement for checking or clearing selections. Review the checked items before downloading. Common-first ordering is a practical teaching order, not a popularity statistic.'],
            ['Control the sequence', 'Category order determines which families appear first. Pattern order can follow the catalog, sort by name, sort by interval count, or use your custom sequence. Reordering changes the reading order, not the notes of a pattern. Keys repeat within each selected category. Category and key page breaks are configured separately in Page & diagram.'],
            ['Example workflow', 'For a compact practice handout, choose major and minor scales in C and G. Set the category order, choose catalog order, and check that four diagrams are selected. Set the fret range in Page & diagram and use a combined PDF for a printable booklet or EPUB for a fixed-layout ebook. Save the setup when the selection is correct.'],
            ['What selection does not change', 'Export settings belong to this collection. Export tuning, range and label overrides do not require changing the live instrument. Catalog formats contain names, intervals and settings rather than rendered fretboards. A large key-by-pattern cross product can take time in image-rich formats; Cancel stops at a safe processing boundary.']
        ]],
        ['layout', 'Page & diagram', [
            ['Paper and printable area', 'Choose a paper size and orientation first. Custom paper reveals width and height controls. Margins reserve space on each edge; headers and footers reserve additional vertical space. Columns and horizontal gaps divide the printable width. A blank diagram width uses the available row width and preserves the native aspect ratio. A blank height follows that ratio. Setting both dimensions deliberately can change the diagram proportions.'],
            ['Pagination', 'Per-page limits, columns, vertical gaps and category/key breaks determine how items flow. Headings and captions also occupy space. If an explicitly sized diagram or group cannot fit, the page planner can reduce it to fit and report this after export. Word has its own pagination engine, so check the finished DOCX in Word before printing a large run.'],
            ['Instrument and appearance', 'Choose an export tuning preset or enter notes low to high, separated by spaces. Start and end frets set the exported window. Display mode controls note names, intervals or other label styles. Marker shapes, sizes, fret numbers and line thickness override the live diagram for export. Blank size overrides and Current choices inherit the existing appearance. Diagram Layers offers further hiding and recoloring.'],
            ['Raster and vector quality', 'DPI sets pixel density for rasterized output. Increasing it improves zoom and print sharpness but increases time, memory and file size. JPEG quality applies to JPEG encoding; it does not improve PNG or vector SVG. Padding, borders, grayscale, opacity and rotation decorate diagram images. JPEG and full-page raster documents use a solid page background, even if individual PNG/SVG diagrams allow transparency.'],
            ['Choose the right output', 'Use a combined PDF for predictable printing, DOCX for editable surrounding text, and SVG archives for scalable diagrams. EPUB, ODT, slide decks and comic archives carry the planned pages. TIFF and DjVu are raster page documents; DjVu is wavelet-compressed and can soften very fine labels. Catalog exports do not use paper layout because they contain data instead of page images.']
        ]],
        ['text', 'Text & labels', [
            ['Document hierarchy', 'Set the collection title, subtitle, author and introduction, then the category headings, key headings and diagram captions. Empty optional text is omitted. Separate category and key notes can introduce a family or tonal center. Document text occupies page space, so long introductions or captions can increase the page count.'],
            ['Templates', 'Template tokens are replaced with values appropriate to the text location. Use {category} for a family heading, {key} for the current key and {name} for a pattern caption. Other available collection values include {title}, {author}, {tuning}, {startFret}, {endFret} and {count}. A caption such as Study {key}: {name} produces a distinct label for each diagram. Tokens without a value at that location become empty.'],
            ['Typography', 'Expand Typography & styling to adjust font family, sizes, colors, alignment and line spacing. Color overrides can distinguish titles, headings, body copy and captions; blank overrides inherit the main text color. Caption bold, body italics, numbering and uppercase options affect their relevant text levels. Caption placement selects above or below the diagram.'],
            ['Running text', 'Headers and footers repeat across planned pages. Page numbering can show a page number or page number with total. Keep running text short so it fits inside its reserved band. Date, tuning and range text let you record the context of the collection without adding it to every caption.'],
            ['Format differences', 'PDF and page-image exports render the configured text into the page. DOCX keeps surrounding text as Word paragraphs, while fretboards remain images. EPUB/XHTML and slide documents preserve a page-oriented presentation rather than freely reflowing every paragraph. Text catalogs omit diagram images. Content adds publication details and per-diagram practice prompts without replacing these base templates.']
        ]],
        ['saved', 'Saved setups', [
            ['Capture a repeatable export', 'Save a named setup after selecting patterns, keys and export settings. A setup stores the selection and validated options, including advanced settings and the selected output format. Names such as Major scales - landscape A4 are easier to distinguish than generic names. Loading a setup restores the collection; it does not download a file automatically.'],
            ['Refine without losing the original', 'Load an existing setup, change the desired fields, and save the result under the intended name. Use distinct names for print and screen variants. Before exporting, verify the pattern count, tuning, fret range and format, especially when a setup was made for a different instrument.'],
            ['Import, export and backups', 'Use setup export/import to move configurations between browsers or machines. A setup file describes how to make the collection; it is not a PDF, an ebook or a copy of the generated images. Backup controls let you preserve multiple saved setups. Keep a backup before clearing browser storage or moving to another device.'],
            ['Storage and validation', 'Saved setups live in this browser storage. Private browsing, storage cleanup or a different device can make them unavailable. Imported settings are validated against supported values and ranges; an invalid file should be corrected rather than treated as an executable script. Older setup files can omit newer options, which then receive defaults.'],
            ['Reset and release workflow', 'Reset returns options to defaults and refreshes inherited values from the active app. Review selections afterward. For a release, save a named setup, download the intended format, and retain the setup or backup alongside the finished file. Opening the final file in its target application remains important because reader and office layout behavior can vary.']
        ]],
        ['content', 'Content', [
            ['Publication details', 'Collection code, publisher, edition and revision identify the release. Copyright, license and contact or website text communicate ownership and permitted use. These are additional visible document paragraphs; they do not automatically create hyperlinks, DRM, access controls or legal permission. Supply wording appropriate to your own material.'],
            ['Teaching context', 'Use dedication and learning objective for short front matter. Category introduction repeats at each category and key introduction at each key. Templates such as Practice in {key} can keep repeated sections consistent. Avoid writing the full introduction in both Text & labels and Content unless you want both printed.'],
            ['Per-diagram guidance', 'Caption prefix and suffix extend the base caption. Practice prompt and diagram credit appear beneath it on separate lines. For example, set prefix to Exercise, the caption to {key} - {name}, and the prompt to Play ascending, then descending. These fields work even when the base caption is blank. Longer captions require more vertical space.'],
            ['Example release', 'Set collection code to SC-01, edition to Student edition, learning objective to Recognize roots in every position, and a key introduction to Begin on {key}. Add a short license statement and a diagram credit if needed. Export a PDF to inspect the text flow, then save the same options for an EPUB or Word edition.'],
            ['Scope', 'Publication text is included in the generated item stream used by document and text exports. Individual diagram image files contain the fretboard itself, not all surrounding publication paragraphs. Machine-readable exports carry items/settings; archive companion files can preserve notes and configuration. Publication fields do not substitute for format metadata or a complete legal review.']
        ]],
        ['layers', 'Diagram Layers', [
            ['Simplify the picture', 'Toggle strings, frets, position inlays, tuning labels, fret numbers and note labels independently. Hiding labels leaves the note markers, useful for recognition exercises. Hiding frets or strings changes the visual scaffold but not the pattern notes. Start with one change at a time so the diagram remains interpretable.'],
            ['Focus on roots', 'Roots only removes non-root markers from each diagram. Hide open-string markers removes notes at fret zero but retains fretted occurrences of the same pitch. These can be combined to make a root-location worksheet. They do not transpose the pattern, change the selected key or alter the interval list in a data catalog.'],
            ['Color overrides', 'Set string, fret, root-marker, other-marker or note-label colors with a six-digit hexadecimal value such as #285943. Leave an override blank to inherit the normal export appearance. Ensure label colors contrast with marker fills and the background. Grayscale conversion can reduce differences between otherwise distinct colors.'],
            ['Mirroring', 'Horizontal and vertical mirroring transform the entire diagram image, including text. They are literal graphics transforms, not a musical left-handed-layout engine. Labels will also be mirrored, so use them for intentional visual transformations rather than assuming they preserve readable notation. Rotation is configured separately in Page & diagram.'],
            ['Safe editing', 'Layer processing works on an export copy; it does not remove notes from the live fretboard or change saved musical patterns. The resulting image is used in image archives and diagram-bearing documents. Text-only catalogs still list the original pattern and intervals. A useful workflow is to save a labeled teaching setup and a second unlabeled exercise setup.']
        ]],
        ['watermark', 'Watermark', [
            ['Enable a mark', 'Enter watermark text to stamp each exported diagram. Leave it blank to disable the watermark, regardless of the other controls. A short word such as DRAFT, SAMPLE or a publisher name usually remains legible without overwhelming fret labels. The mark is part of the diagram image, not a page header or a security feature.'],
            ['Size and position', 'Font size is a percentage of diagram height, not a Word point size. X and Y are percentage positions across the diagram. Start at 50/50 for a centered mark and use rotation to angle it. A long mark near an edge can be clipped by the diagram bounds; reduce the size or move the center inward.'],
            ['Visibility', 'Choose font family, color, opacity, bold, italics and letter spacing. Low opacity keeps notes readable; very pale text may disappear on a printer. A background color with separate opacity and padding creates a badge-like backing. Background opacity of zero leaves no visible backing.'],
            ['Repeat mode', 'Repeat creates a three-by-three grid centered around the chosen anchor. It is useful for proof images but can intersect several note labels. Each mark uses the same typography and angle. Check that both repeated text and any background do not obscure important fretboard details.'],
            ['Practical use and limits', 'For a review copy, begin with DRAFT, a modest size and low opacity, then export a small sample before a full collection. Save a separate clean setup with blank watermark text for publication. Watermarks travel with diagram images in Word, PDF, EPUB and other image-bearing outputs; data catalogs have no visual watermark. They do not prevent extraction or redistribution.']
        ]],
        ['packaging', 'Packaging', [
            ['Download name versus entry name', 'The download template names the file your browser saves. The archive entry template names files inside ZIP-based diagram/page collections. Prefix and suffix apply to those entries. Templates can use {number}, {key}, {category}, {name} and {pattern}; for paged archives the item represents a page, so key and category can be empty. Keep a sequence token to make reading order obvious.'],
            ['Folders and safe names', 'A root folder can contain the collection. Category folders and key folders create additional levels for individual diagrams. Case, space replacement and sequence digits make names consistent. Unsafe filename characters are sanitized and duplicate names receive a numeric suffix instead of overwriting an earlier diagram. These rules do not change printed captions.'],
            ['Companion files', 'Manifest JSON records the generated items, settings JSON records the export options, and collection notes TXT collects readable text. Include settings when handing an image archive to someone who may need to reproduce it. JSON companion files are not a substitute for a saved setup with the full selected-pattern/key configuration.'],
            ['Compression', 'Automatic ZIP compression avoids wasting work recompressing common already-compressed images. STORE preserves entries without compression; DEFLATE trades processing time for potentially smaller files. The level applies when DEFLATE is used. Compression does not change diagram dimensions or image quality.'],
            ['Scope and examples', 'Try root folder Scales, entry template {number}_{key}_{name}, category folders on and four sequence digits for a predictable diagram archive. Standard document containers such as EPUB, ODT and PPTX require fixed internal paths and are not renamed by archive entry controls. CBZ keeps pages in reading order, and TAR uses its own archive structure. Companion settings apply to the ordinary ZIP collection exporters, not every standardized document container.']
        ]],
        ['tables', 'Data Tables', [
            ['Select the columns', 'Choose sequence, category, key, pattern ID, name, caption, intervals, tuning, start fret and end fret independently. At least one column must remain selected. Each selected pattern/key pair becomes one row. Removing a column changes the exported table, not the musical selection or the diagrams in other output formats.'],
            ['CSV and TSV interoperability', 'Automatic delimiter uses a comma for CSV and a tab for TSV. Semicolon is useful for spreadsheet locales that expect it; pipe is useful for some import pipelines. Always quote protects every cell, while minimal quote only quotes cells that need it. Embedded quotes are doubled and embedded newlines remain inside quoted cells.'],
            ['Encoding and line endings', 'A UTF-8 BOM helps some spreadsheet applications recognize Unicode and accidentals. Turn it off for tools expecting plain UTF-8 without a marker. CRLF is conventional for Windows-oriented imports, while LF suits many Unix-based tools. Formula-like CSV/TSV cells receive a leading apostrophe so spreadsheet software is less likely to execute them as formulas.'],
            ['Spreadsheet outputs', 'XLSX, ODS and XLS include the chosen catalog columns plus text/settings sheets. Header controls determine whether the pattern sheet starts with column names. DBF and DIF are legacy table-only interchange formats: their field naming, character encoding, data types and size limits are narrower. Prefer XLSX or UTF-8 CSV when preserving arbitrary Unicode is important.'],
            ['Example workflow', 'For a practice tracker, keep number, key, name and intervals and export CSV. For a renderer or database integration, keep pattern ID, tuning and fret range as well. Import with the same delimiter and encoding selected here. These column and CSV options do not restructure JSON, XML, NDJSON or YAML, which preserve their own documented item/settings structure.']
        ]],
        ['preview', 'Print preview', [
            ['Edit the printed collection', 'The preview uses the same pagination, text measurements, SVG diagrams and page settings as the document exporters. Only the current page is rendered, even for thousands of diagrams. Select patterns and keys first, then open Print preview. Choose a page number or use Previous and Next to browse.'],
            ['Select and remove parts', 'Click a heading, diagram or caption on the sheet, or choose its entry in Page parts. Remove part omits the whole heading or diagram. Remove caption keeps the diagram but removes its surrounding caption. Edit Selected text / caption to replace a heading or caption. Blank headings are omitted. Internal fretboard components are controlled by Diagram Layers, not by removing a whole page part.'],
            ['Reorder content', 'Drag an item in Page parts before another item, or use Move earlier / Move later. The arrow buttons can move items across page boundaries. Moving content changes reading order and triggers automatic repagination; it is not free-position dragging of individual notes. Reset preview edits restores the original content and ordering without resetting other export settings.'],
            ['Paper and margins', 'Orientation, margins and columns are shortcuts to the same controls in Page & diagram. More page settings opens paper size, gaps, diagram size, alignment and page-break controls. These changes affect exports as well as the preview. Page headers and footers are changed in Text & labels. Word may paginate differently in its own layout engine.'],
            ['Edit lifetime and large exports', 'Preview content edits last for this open browser session; they are not stored in Saved setups. They affect document content and catalog rows, while captions are not burned into individual diagram images. For more than 300 diagrams, supported diagram/page ZIP formats stream to a selected disk file where available. Otherwise they download independent ZIP parts capped at 250 files or approximately 32 MB of entry data; allow multiple downloads and extract parts to the same folder for linked Markdown. Large-archive mode uses STORE compression to avoid recompressing images. Large PDF, DOCX, HTML and specialized page-document collections are automatically divided into numbered document parts of at most 250 diagrams, preserving whole pages; numbering restarts in each part. This avoids accumulating an entire 5,000-diagram document in memory. Use SVG ZIPs for the lightest large-collection workflow. Streaming ZIPs have a 4 GB limit. Cancelling cannot recall ZIP parts already downloaded.']
        ]],
        ['reader', 'HTML Reader', [
            ['Standalone reading view', 'These controls customize the downloaded standalone HTML collection. The browser shows planned pages as scalable SVG with a surrounding reader background. This is not a change to the Export Studio dialog or the live fretboard. Open the downloaded HTML in a browser to read or print it.'],
            ['Page presentation', 'Reader background colors the outside area; page background colors the sheet. Gap and outer padding are screen pixels. Width is a percentage capped by the configured physical paper width. Shadows, borders, border color, thickness and corner radius are screen presentation choices and do not change the underlying diagram positions.'],
            ['Optional reader header', 'Show collection title, author and total page count when useful. These create a screen-level header separate from title paragraphs already inside the pages. The optional Print button invokes the browser print dialog. Choose the document language for the HTML language attribute; this helps accessibility tools but does not translate your content.'],
            ['Print behavior', 'Printing removes the reader header, screen padding, borders, shadows and rounded corners. Each planned page becomes a print page using the configured paper dimensions. Browser print dialogs may add their own headers, footers, margins or scaling, so select the matching paper and disable unwanted browser decorations.'],
            ['Format boundaries', 'Reader appearance applies only to standalone HTML. EPUB and XHTML use their own packaged or XML-safe page presentation, while PDF, Word and image outputs use the document layout directly. Standalone HTML embeds its page graphics and does not need the live app to display them. Save separate setups if you want a dark screen reader and a white-page print edition.']
        ]]
    ];
    function mount() {
        return guides.map(([id, title, sections]) => {
            const article = document.createElement('article'); article.className = 'beta-about';
            const heading = document.createElement('h3'); heading.textContent = title + ' (About)'; article.append(heading);
            const button = document.createElement('button'); button.type = 'button'; button.dataset.betaSettings = id; button.textContent = 'Open ' + title + ' settings'; article.append(button);
            for (const [label, text] of sections) {
                const section = document.createElement('section'); const h = document.createElement('h4'); h.textContent = label;
                const p = document.createElement('p'); p.textContent = text; section.append(h, p); article.append(section);
            }
            return [id + '-about', title + ' (About)', [article]];
        });
    }
    function addFieldReferences(panels) {
        const descriptions = {
            'beta-filter': 'Search all pattern categories by name and interval content. Filtering does not remove checked selections.',
            'beta-interval-mode': 'Any matches at least one checked pitch class; All requires every checked pitch class; Exact requires the identical pitch-class set.',
            'beta-category-order': 'Sets the sequence of interval, chord and scale groups in the catalog and export.',
            'beta-pattern-order': 'Sets ordering within each category. Custom uses the Up and Down controls.',
            'beta-custom-order': 'Ordered pattern identifiers used by Custom ordering; maintained by the Up and Down controls.',
            'beta-columns': 'One or two columns, or automatic fitting. Applies to page-based output, not individual image files.',
            'beta-per-page': 'Upper limit of diagrams on each page. Zero means as many as fit at the requested size.',
            'beta-orientation': 'Switches the long edge between horizontal (landscape) and vertical (portrait). Repaginates the document.',
            'beta-margin': 'Inset on all four paper edges in millimeters. Running headers and footers also reserve space.',
            'beta-image-width': 'Diagram width in millimeters. Blank fills the printable row or derives width from a supplied height.',
            'beta-image-height': 'Diagram height in millimeters. Blank preserves its original aspect ratio. Oversized boxes shrink to fit.',
            'beta-dpi': 'Raster pixels per printed inch. Higher values cost more memory, encoding time and disk space; vector SVG remains scalable.',
            'beta-start-fret': 'First fret included in the export window. Must not exceed the end fret.',
            'beta-end-fret': 'Last fret included in the export window. Does not change the live instrument.',
            'beta-tuning': 'One to twenty note names, low to high, separated by spaces. Accepts sharps and flats without octave numbers.',
            'beta-tuning-preset': 'Fills the export tuning with a common instrument tuning; custom tuning can then be edited.',
            'beta-jpeg-quality': 'JPEG/WebP encoding quality percentage. Does not change PNG, SVG or musical information.',
            'beta-config-default': 'Automatically load the selected locally saved setup when Export Studio opens.',
            'beta-config-name': 'Name used when saving, duplicating or renaming a setup on this device.',
            'beta-config-select': 'Select the stored setup used by Load, Update, Duplicate, Rename, Download and Delete.',
            'beta-export-format': 'Chooses the document, archive or data writer. The footer explains the selected format and its limitations.'
        };
        for (const { panel } of panels) {
            const about = panels.find(entry => entry.panel.id === panel.id + '-about')?.panel;
            if (!about) continue;
            const article = about.querySelector('article');
            const section = document.createElement('section'); const title = document.createElement('h4'); title.textContent = 'Every field and action'; section.append(title);
            const definitions = document.createElement('dl'); definitions.className = 'beta-field-reference';
            const controls = [...panel.querySelectorAll('input, select, textarea, button')];
            const seen = new Set();
            for (const control of controls) {
                const patternGroup = control.id.startsWith('beta-pattern-') ? control.closest('.beta-category')?.querySelector('summary span')?.textContent + ' pattern checkboxes' : '';
                if (patternGroup && seen.has(patternGroup)) continue;
                const label = control.closest('label');
                const clean = label?.cloneNode(true); clean?.querySelectorAll('input, select, textarea, button, p').forEach(node => node.remove());
                let name = clean?.textContent.trim() || control.getAttribute('aria-label') || control.textContent.trim() || control.id;
                if (patternGroup) name = patternGroup;
                if (control.type === 'checkbox' && control.value && !control.id) name += ' (' + control.value + ')';
                if (!name || seen.has(name)) continue; seen.add(name);
                const term = document.createElement('dt'); term.textContent = name;
                const detail = document.createElement('dd');
                const field = FretboardBetaOptions.fields.find(([, id]) => 'beta-' + id === control.id);
                const schema = FretboardBetaAdvancedSchema.tabs.find(tab => tab.fields.some(([key]) => key === field?.[0]));
                let text = descriptions[control.id] || (schema ? schema.scope + ' ' : '');
                if (control.tagName === 'SELECT') text += ' Choices: ' + [...control.options].map(option => option.textContent).join('; ') + '.';
                else if (control.type === 'checkbox') text += ' Checked enables this option; unchecked disables it.';
                else if (control.type === 'number') text += ' Allowed range: ' + control.min + ' to ' + control.max + (control.step === '1' ? ', whole numbers only.' : '.');
                else if (control.type === 'color') text += ' Choose a six-digit RGB color.';
                else if (control.tagName === 'TEXTAREA' || control.type === 'text') text += ' Editable text. Blank optional text is omitted; supported template tokens are expanded when exporting.';
                else if (control.tagName === 'BUTTON') text += ' Action: ' + (control.title || name) + '. Changes apply to this export setup.';
                if (field) text += ' Default: ' + (Array.isArray(field[3]) ? field[3].join(', ') : field[3] === null || field[3] === '' ? 'blank / inherited' : String(field[3])) + '.';
                detail.textContent = text || 'Select this item to include it in the exported collection.';
                definitions.append(term, detail);
            }
            section.append(definitions); article.append(section);
        }
    }
    globalThis.FretboardBetaGuides = { guides, mount, addFieldReferences };
})();
