(() => {
    'use strict';
    const formats = [
        ['epub','Fixed-layout ebook (EPUB)','.epub'], ['djvu','Wavelet page document (DjVu)','.djvu'],
        ['odt','Page-image document (ODT)','.odt'], ['odp','Page-image presentation (ODP)','.odp'],
        ['pptx','PowerPoint page-image slides (PPTX)','.pptx'], ['cbz','Comic page collection (CBZ)','.cbz'],
        ['tar','PNG page collection (TAR)','.tar'], ['bmp-pages-zip','BMP pages (ZIP)','-bmp-pages.zip'],
        ['tiff','Multipage RGB TIFF','.tiff'], ['pnm-pages-zip','PNM/PPM pages (ZIP)','-pnm-pages.zip'],
        ['xhtml','XML-safe XHTML collection','.xhtml'], ['latex-zip','LaTeX source + PNGs (ZIP)','-latex.zip'],
        ['asciidoc-zip','AsciiDoc source + PNGs (ZIP)','-asciidoc.zip'], ['org-zip','Org source + PNGs (ZIP)','-org.zip'],
        ['rst-zip','reStructuredText + PNGs (ZIP)','-rst.zip'], ['dbf','dBASE table (DBF)','.dbf'], ['dif','Data Interchange table (DIF)','.dif']
    ];
    const catalogKinds = ['dbf','dif'];
    const markupKinds = ['latex-zip','asciidoc-zip','org-zip','rst-zip'];
    const pagedKinds = formats.map(([kind]) => kind).filter(kind => !catalogKinds.includes(kind) && !markupKinds.includes(kind));
    function catalog(kind, items, options) {
        const X = globalThis.XLSX; if (!X) throw new Error('Spreadsheet support is unavailable.');
        const { rows } = FretboardBetaAdvanced.table(items, kind === 'dbf' ? {...options,tableHeader:true} : options);
        if (kind === 'dbf' && rows.some(row => row.some(value => typeof value === 'string' && (!/^[\x20-\x7e\xa0-\xff]*$/.test(value) || value.length > 254)))) throw new Error('DBF requires single-line Latin-1 text up to 254 characters per cell. Use UTF-8 CSV or XLSX for this collection.');
        if (kind === 'dbf') return FretboardBetaBinary.dbf(rows);
        const workbook = X.utils.book_new(); X.utils.book_append_sheet(workbook,X.utils.aoa_to_sheet(rows),'Patterns');
        return new Blob([X.write(workbook,{bookType:kind,type:'array',codepage:1252})],{type:kind === 'dbf' ? 'application/x-dbf' : 'application/x-dif'});
    }
    let djvuLoading;
    async function loadDjvu() {
        if (globalThis.DjVu) return;
        if (!djvuLoading) djvuLoading = new Promise((resolve,reject) => {
            const script = document.createElement('script'); script.src = new URL('vendor/djvu.js',document.baseURI).href;
            const timer = setTimeout(() => { script.remove(); djvuLoading = null; reject(new Error('DjVu encoder did not load. Please retry.')); },30000);
            script.onload = () => { clearTimeout(timer); if (globalThis.DjVu) resolve(); else { djvuLoading = null; reject(new Error('DjVu encoder is unavailable.')); } };
            script.onerror = () => { clearTimeout(timer); script.remove(); djvuLoading = null; reject(new Error('Could not load the local DjVu encoder.')); };
            document.head.append(script);
        });
        await djvuLoading;
    }
    async function paged(kind, pages, config, context, api) {
        const options = context.options, B = FretboardBetaBinary, images = [], files = [], zip = new JSZip();
        const pixelOutput = kind !== 'xhtml', usedNames = new Set();
        let worker, failure, imageBytes = 0;
        try {
            if (kind === 'djvu') {
                await loadDjvu(); api.checkCancel();
                worker = new DjVu.Worker(new URL('vendor/djvu.js',document.baseURI).href);
                failure = new Promise((_,reject) => worker.worker.addEventListener('error',() => reject(new Error('DjVu encoding failed. Try fewer pages or a lower DPI.')),{once:true}));
                await Promise.race([worker.startMultiPageDocument(100,0,options.grayscale ? 1 : 0),failure]);
            }
            for (let i = 0; i < pages.length; i++) {
                api.checkCancel();
                const markup = await FretboardBetaFormats.pageSvg(pages[i],config,context,i,pages.length,api);
                api.checkCancel();
                const name = 'page-' + String(i+1).padStart(5,'0');
                if (!pixelOutput) { images.push(markup); continue; }
                const raster = await (api.raster || B.raster)(markup,config,options);
                api.checkCancel();
                if (kind === 'djvu') { await Promise.race([worker.addPageToDocument(raster.image()),failure]); }
                else if (kind === 'tiff') {
                    const image = raster.image(); imageBytes += image.width * image.height * 7;
                    if (imageBytes > 256 * 1024 * 1024) throw new Error('TIFF exceeds the 256 MB working-memory limit. Lower DPI or export fewer pages.');
                    images.push(image);
                } else if (kind === 'bmp-pages-zip' || kind === 'pnm-pages-zip') {
                    const extension = kind === 'bmp-pages-zip' ? 'bmp' : 'ppm';
                    const path = FretboardBetaAdvanced.entryName({name:'page',pattern:'page',key:'',category:''},i,options,extension,usedNames);
                    zip.file(path,extension === 'bmp' ? B.bmp(raster.image(),options.dpi) : B.pnm(raster.image()));
                }
                else if (kind === 'cbz') zip.file(name + '.jpg',await raster.blob('image/jpeg'));
                else if (kind === 'tar') files.push([name + '.png',await raster.blob()]);
                else images.push(await raster.blob());
            }
            api.checkCancel();
            if (kind === 'epub') return await FretboardBetaBookPackages.epub(images,options,config,api.checkCancel);
            if (kind === 'odt' || kind === 'odp') return await FretboardBetaBookPackages.openDocument(kind,images,options,config,api.checkCancel);
            if (kind === 'pptx') return await FretboardBetaBookPackages.pptx(images,options,config,api.checkCancel);
            if (kind === 'djvu') {
                const buffer = await Promise.race([worker.endMultiPageDocument(),failure]); api.checkCancel();
                return new Blob([B.djvuDpi(buffer,options.dpi)],{type:'image/vnd.djvu'});
            }
            if (kind === 'tiff') return B.tiff(images,options.dpi);
            if (kind === 'tar') return await B.tar(files,api.checkCancel);
            if (kind === 'xhtml') {
                const esc = FretboardBetaFormats.escape;
                return new Blob(['<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="' + esc(options.readerLanguage || 'en') + '"><head><title>' + esc(options.title || 'Fretboards') + '</title><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{margin:0;background:#eee}.page{margin:16px auto;background:white;width:min(100%, ' + config.pageWidth + 'mm)}svg{display:block;width:100%;height:auto}@page{size:' + config.pageWidth + 'mm ' + config.pageHeight + 'mm;margin:0}@media print{body{background:white}.page{margin:0;width:100%;break-after:page}.page:last-child{break-after:auto}}</style></head><body>' + images.map(svg => '<div class="page">' + svg + '</div>').join('') + '</body></html>'],{type:'application/xhtml+xml'});
            }
            if (kind === 'bmp-pages-zip' || kind === 'pnm-pages-zip') return await FretboardBetaAdvanced.archive(zip,kind,pages.flatMap(page => page.items),options,api.checkCancel);
            if (kind === 'cbz') zip.file('ComicInfo.xml','<?xml version="1.0" encoding="UTF-8"?><ComicInfo><Title>' + FretboardBetaFormats.escape(options.title) + '</Title><Writer>' + FretboardBetaFormats.escape(options.author) + '</Writer><PageCount>' + pages.length + '</PageCount><LanguageISO>' + FretboardBetaFormats.escape(options.readerLanguage) + '</LanguageISO></ComicInfo>');
            return await zip.generateAsync({type:'blob',compression:kind === 'cbz' ? 'STORE' : 'DEFLATE',mimeType:kind === 'cbz' ? 'application/vnd.comicbook+zip' : 'application/zip'},api.checkCancel);
        } finally { worker?.terminate(); }
    }
    async function markup(kind, items, context, api) {
        const zip = new JSZip(), options = context.options, nl = '\n', lines = [], family = kind.split('-')[0];
        const tex = value => String(value).replace(/[\\{}$&#%_^~♭♯]/g,c => ({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','$':'\\$','&':'\\&','#':'\\#','%':'\\%','_':'\\_','^':'\\textasciicircum{}','~':'\\textasciitilde{}','♭':'\\ensuremath{\\flat}','♯':'\\ensuremath{\\sharp}'}[c]));
        const plain = value => String(value).replace(/[\r\n]+/g,' ');
        if (family === 'latex') lines.push('\\documentclass{article}','\\usepackage{fontspec}','\\usepackage{graphicx}','\\usepackage[paperwidth=' + FretboardBetaLayout.paperDimensions(options).width + 'mm,paperheight=' + FretboardBetaLayout.paperDimensions(options).height + 'mm,margin=' + options.margin + 'mm]{geometry}','\\begin{document}');
        let count = 0;
        for (const item of items) {
            api.checkCancel();
            if (item.kind === 'break') { if (family === 'latex') lines.push('\\clearpage'); continue; }
            if (item.kind === 'heading') {
                const level = item.level === 'title' ? 1 : item.level === 'category' ? 2 : item.level === 'key' ? 3 : 0;
                if (family === 'latex') lines.push(level ? '\\' + ['','section','subsection','subsubsection'][level] + '*{' + tex(item.text) + '}' : tex(item.text));
                if (family === 'asciidoc') lines.push('....',String(item.text).replace(/^\.\.\.\.$/gm,' ....'),'....');
                if (family === 'org') lines.push(...String(item.text).split(nl).map(line => ': ' + line));
                if (family === 'rst') lines.push('::', '', ...String(item.text).split(nl).map(line => '    ' + line));
                lines.push(''); continue;
            }
            if (item.kind !== 'diagram') continue;
            const path = 'images/diagram-' + String(++count).padStart(5,'0') + '.png';
            const image = await api.renderItem(item,context,{mimeType:'image/png'}); zip.file(path,image.bytes);
            if (family === 'latex') lines.push('\\par\\noindent\\includegraphics[width=\\linewidth]{' + path + '}',tex(item.caption || ''),'\\par');
            if (family === 'asciidoc') lines.push('image::' + path + '[Fretboard diagram]', '....',String(item.caption || '').replace(/^\.\.\.\.$/gm,' ....'),'....');
            if (family === 'org') lines.push('[[file:' + path + ']]',...String(item.caption || '').split(nl).map(line => ': ' + line));
            if (family === 'rst') {
                lines.push('.. image:: ' + path,'   :alt: ' + plain(item.name));
                if (item.caption) lines.push('','::','',...String(item.caption).split(nl).map(line => '    ' + line));
            }
            lines.push('');
        }
        if (family === 'latex') lines.push('\\end{document}');
        const extension = {latex:'tex',asciidoc:'adoc',org:'org',rst:'rst'}[family];
        zip.file('collection.' + extension,lines.join(nl));
        zip.file('README.txt', 'Keep the images directory beside collection.' + extension + '.\n' + ({latex:'Compile with LuaLaTeX. Requires fontspec, graphicx and geometry.',asciidoc:'Render with Asciidoctor; text is kept in literal blocks.',org:'Open with Emacs Org mode; diagram links refer to local PNGs.',rst:'Render with Docutils or Sphinx; text is kept in literal blocks.'}[family]) + '\nSource formats use their own text flow, not fixed Export Studio pagination.\n');
        return FretboardBetaAdvanced.archive(zip,kind,items,options,api.checkCancel);
    }
    globalThis.FretboardBetaPublishing = { formats, catalogKinds, markupKinds, pagedKinds, catalog, paged, markup };
})();
