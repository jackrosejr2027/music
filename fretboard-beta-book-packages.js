(() => {
    'use strict';
    const xml = '<?xml version="1.0" encoding="UTF-8"?>';
    const esc = value => FretboardBetaFormats.escape(value);
    const relNS = 'http://schemas.openxmlformats.org/package/2006/relationships';
    const relType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
    const relationships = entries => xml + '<Relationships xmlns="' + relNS + '">' + entries.map(([id,type,target]) => '<Relationship Id="' + id + '" Type="' + relType + type + '" Target="' + target + '"/>').join('') + '</Relationships>';
    async function epub(images, options, config, checkCancel) {
        const zip = new JSZip(); zip.file('mimetype','application/epub+zip',{ compression:'STORE' });
        zip.file('META-INF/container.xml',xml + '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
        const width = Math.round(config.pageWidth * 96 / 25.4), height = Math.round(config.pageHeight * 96 / 25.4);
        const language = esc(options.readerLanguage || 'en'), title = esc(options.title || 'Fretboards');
        const manifest = ['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>'], spine = [], nav = [];
        for (let i = 0; i < images.length; i++) {
            checkCancel(); const n = i+1;
            zip.file('EPUB/images/page-' + n + '.png',images[i]);
            zip.file('EPUB/page-' + n + '.xhtml',xml + '<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="' + language + '" xml:lang="' + language + '"><head><title>Page ' + n + '</title><meta name="viewport" content="width=' + width + ',height=' + height + '"/><style>html,body{margin:0;padding:0;width:100%;height:100%}img{display:block;width:100%;height:100%}</style></head><body><img src="images/page-' + n + '.png" alt="' + title + ', page ' + n + '"/></body></html>');
            manifest.push('<item id="page' + n + '" href="page-' + n + '.xhtml" media-type="application/xhtml+xml"/>','<item id="image' + n + '" href="images/page-' + n + '.png" media-type="image/png"/>');
            spine.push('<itemref idref="page' + n + '"/>'); nav.push('<li><a href="page-' + n + '.xhtml">Page ' + n + '</a></li>');
        }
        zip.file('EPUB/nav.xhtml',xml + '<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' + language + '" xml:lang="' + language + '"><head><title>Contents</title></head><body><nav epub:type="toc" id="toc"><h1>' + title + '</h1><ol>' + nav.join('') + '</ol></nav></body></html>');
        zip.file('EPUB/package.opf',xml + '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">urn:uuid:' + crypto.randomUUID() + '</dc:identifier><dc:title>' + title + '</dc:title><dc:language>' + language + '</dc:language>' + (options.author ? '<dc:creator>' + esc(options.author) + '</dc:creator>' : '') + '<meta property="dcterms:modified">' + new Date().toISOString().replace(/\.\d{3}Z$/,'Z') + '</meta><meta property="rendition:layout">pre-paginated</meta><meta property="rendition:spread">none</meta><meta property="rendition:orientation">auto</meta></metadata><manifest>' + manifest.join('') + '</manifest><spine>' + spine.join('') + '</spine></package>');
        return zip.generateAsync({type:'blob',mimeType:'application/epub+zip',compression:'DEFLATE'},checkCancel);
    }
    async function openDocument(kind, images, options, config, checkCancel) {
        const zip = new JSZip(), presentation = kind === 'odp';
        const mime = 'application/vnd.oasis.opendocument.' + (presentation ? 'presentation' : 'text');
        zip.file('mimetype',mime,{compression:'STORE'});
        const ns = ' xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"';
        const manifest = ['<manifest:file-entry manifest:full-path="/" manifest:media-type="' + mime + '"/>'];
        const entries = [];
        images.forEach((image,i) => {
            checkCancel(); const path = 'Pictures/page-' + (i+1) + '.png'; zip.file(path,image); manifest.push('<manifest:file-entry manifest:full-path="' + path + '" manifest:media-type="image/png"/>');
            const frame = '<draw:frame draw:style-name="PageImage" draw:name="Page ' + (i+1) + '" svg:x="0mm" svg:y="0mm" svg:width="' + config.pageWidth + 'mm" svg:height="' + config.pageHeight + 'mm"' + (presentation ? ' presentation:class="graphic"' : ' text:anchor-type="page" text:anchor-page-number="' + (i+1) + '"') + '><draw:image xlink:href="' + path + '" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/></draw:frame>';
            entries.push(presentation ? '<draw:page draw:name="Page ' + (i+1) + '" draw:master-page-name="Standard">' + frame + '</draw:page>' : '<text:p>' + frame + '</text:p>');
        });
        const graphic = '<style:style style:name="PageImage" style:family="graphic"><style:graphic-properties style:wrap="none" style:vertical-pos="top" style:vertical-rel="page" style:horizontal-pos="left" style:horizontal-rel="page" draw:stroke="none" draw:fill="none"/></style:style>';
        zip.file('content.xml',xml + '<office:document-content' + ns + ' office:version="1.3"><office:automatic-styles>' + graphic + '</office:automatic-styles><office:body><office:' + (presentation ? 'presentation' : 'text') + '>' + entries.join('') + '</office:' + (presentation ? 'presentation' : 'text') + '></office:body></office:document-content>');
        zip.file('styles.xml',xml + '<office:document-styles' + ns + ' office:version="1.3"><office:styles/><office:automatic-styles><style:page-layout style:name="Layout"><style:page-layout-properties fo:page-width="' + config.pageWidth + 'mm" fo:page-height="' + config.pageHeight + 'mm" fo:margin="0mm" style:print-orientation="' + options.orientation + '"/></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="Layout"/></office:master-styles></office:document-styles>');
        zip.file('meta.xml',xml + '<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" office:version="1.3"><office:meta><dc:title>' + esc(options.title) + '</dc:title><dc:creator>' + esc(options.author) + '</dc:creator></office:meta></office:document-meta>');
        for (const path of ['content.xml','styles.xml','meta.xml']) manifest.push('<manifest:file-entry manifest:full-path="' + path + '" manifest:media-type="text/xml"/>');
        zip.file('META-INF/manifest.xml',xml + '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">' + manifest.join('') + '</manifest:manifest>');
        return zip.generateAsync({type:'blob',mimeType:mime,compression:'DEFLATE'},checkCancel);
    }
    async function pptx(images, options, config, checkCancel) {
        const zip = new JSZip(), width = Math.round(config.pageWidth * 36000), height = Math.round(config.pageHeight * 36000);
        const pns = ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
        const tree = '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
        const overrides = [['/ppt/presentation.xml','presentation.main'],['/ppt/slideMasters/slideMaster1.xml','slideMaster'],['/ppt/slideLayouts/slideLayout1.xml','slideLayout']];
        const ids = [], rels = [['rId1','slideMaster','slideMasters/slideMaster1.xml']];
        for (let i = 0; i < images.length; i++) {
            checkCancel(); const n = i+1; zip.file('ppt/media/page' + n + '.png',images[i]);
            zip.file('ppt/slides/slide' + n + '.xml',xml + '<p:sld' + pns + '><p:cSld name="Page ' + n + '"><p:spTree>' + tree + '<p:pic><p:nvPicPr><p:cNvPr id="2" name="Page ' + n + '" descr="' + esc(options.title || 'Fretboard page') + '"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + width + '" cy="' + height + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>');
            zip.file('ppt/slides/_rels/slide' + n + '.xml.rels',relationships([['rId1','image','../media/page' + n + '.png'],['rId2','slideLayout','../slideLayouts/slideLayout1.xml']]));
            ids.push('<p:sldId id="' + (256+i) + '" r:id="rId' + (n+1) + '"/>'); rels.push(['rId'+(n+1),'slide','slides/slide'+n+'.xml']); overrides.push(['/ppt/slides/slide'+n+'.xml','slide']);
        }
        const colorMap = 'accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" bg1="lt1" bg2="lt2" folHlink="folHlink" hlink="hlink" tx1="dk1" tx2="dk2"';
        zip.file('ppt/presentation.xml',xml + '<p:presentation' + pns + '><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>' + ids.join('') + '</p:sldIdLst><p:sldSz cx="' + width + '" cy="' + height + '" type="custom"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>');
        zip.file('ppt/_rels/presentation.xml.rels',relationships(rels));
        zip.file('ppt/slideMasters/slideMaster1.xml',xml + '<p:sldMaster' + pns + '><p:cSld><p:spTree>' + tree + '</p:spTree></p:cSld><p:clrMap ' + colorMap + '/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>');
        zip.file('ppt/slideMasters/_rels/slideMaster1.xml.rels',relationships([['rId1','slideLayout','../slideLayouts/slideLayout1.xml'],['rId2','theme','../theme/theme1.xml']]));
        zip.file('ppt/slideLayouts/slideLayout1.xml',xml + '<p:sldLayout' + pns + ' type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>' + tree + '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>');
        zip.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels',relationships([['rId1','slideMaster','../slideMasters/slideMaster1.xml']]));
        const colors = [['dk1','20221F'],['lt1','FFFFFF'],['dk2','303830'],['lt2','F5F5F0'],['accent1','355C3D'],['accent2','9A6734'],['accent3','486D8B'],['accent4','815872'],['accent5','6C773E'],['accent6','996049'],['hlink','0563C1'],['folHlink','954F72']];
        const fills = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>';
        const line = '<a:ln w="9525">' + fills + '<a:prstDash val="solid"/></a:ln>';
        zip.file('ppt/theme/theme1.xml',xml + '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Fretboard"><a:themeElements><a:clrScheme name="Fretboard">' + colors.map(([key,color]) => '<a:' + key + '><a:srgbClr val="' + color + '"/></a:' + key + '>').join('') + '</a:clrScheme><a:fontScheme name="Arial"><a:majorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Fretboard"><a:fillStyleLst>' + fills.repeat(3) + '</a:fillStyleLst><a:lnStyleLst>' + line.repeat(3) + '</a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst>' + fills.repeat(3) + '</a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>');
        zip.file('_rels/.rels',relationships([['rId1','officeDocument','ppt/presentation.xml']]));
        zip.file('[Content_Types].xml',xml + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="xml" ContentType="application/xml"/>' + overrides.map(([part,type]) => '<Override PartName="' + part + '" ContentType="application/vnd.openxmlformats-officedocument.presentationml.' + type + '+xml"/>').join('') + '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/></Types>');
        return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.presentationml.presentation',compression:'DEFLATE'},checkCancel);
    }
    globalThis.FretboardBetaBookPackages = { epub, openDocument, pptx };
})();
