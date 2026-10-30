(function (TD) {
'use strict';
const FB = TD['fretboard.js'];
const $ = (id) => document.getElementById(id);
const SVG_NS = 'http://www.w3.org/2000/svg';
const XML_NS = 'http://www.w3.org/XML/1998/namespace';
const xml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const MIDI_PITCH_NAMES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const midiPitchName = (m) => MIDI_PITCH_NAMES[m % 12] + (Math.floor(m / 12) - 1);
const utf8 = (value) => {
  const encoded = unescape(encodeURIComponent(String(value)));
  return Uint8Array.from(encoded, c => c.charCodeAt(0));
};
const ascii = (value) => Uint8Array.from(String(value), c => c.charCodeAt(0) & 255);
function concat(parts) {
  const size = parts.reduce((n, part) => n + part.length, 0), result = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.length; }
  return result;
}
function u16(view, offset, value) { view.setUint16(offset, value, true); }
function u32(view, offset, value) { view.setUint32(offset, value >>> 0, true); }
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(files) {
  const local = [], central = [];
  let offset = 0;
  for (const file of files) {
    const name = utf8(file.name), data = typeof file.data === 'string' ? utf8(file.data) : file.data;
    if (name.length > 65535 || data.length > 0xffffffff) throw new Error('Export package exceeds the ZIP format limits.');
    const crc = crc32(data), header = new DataView(new ArrayBuffer(30));
    u32(header, 0, 0x04034b50); u16(header, 4, 20); u16(header, 6, 0x0800); u16(header, 8, 0);
    u16(header, 10, 0); u16(header, 12, 0x21); u32(header, 14, crc); u32(header, 18, data.length); u32(header, 22, data.length);
    u16(header, 26, name.length); u16(header, 28, 0);
    local.push(new Uint8Array(header.buffer), name, data);
    const directory = new DataView(new ArrayBuffer(46));
    u32(directory, 0, 0x02014b50); u16(directory, 4, 20); u16(directory, 6, 20); u16(directory, 8, 0x0800); u16(directory, 10, 0);
    u16(directory, 12, 0); u16(directory, 14, 0x21); u32(directory, 16, crc); u32(directory, 20, data.length); u32(directory, 24, data.length);
    u16(directory, 28, name.length); u16(directory, 30, 0); u16(directory, 32, 0); u16(directory, 34, 0); u16(directory, 36, 0);
    u32(directory, 38, 0); u32(directory, 42, offset);
    central.push(new Uint8Array(directory.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const centralSize = central.reduce((n, part) => n + part.length, 0), end = new DataView(new ArrayBuffer(22));
  if (files.length > 65535) throw new Error('Too many files in export package.');
  u32(end, 0, 0x06054b50); u16(end, 4, 0); u16(end, 6, 0); u16(end, 8, files.length); u16(end, 10, files.length);
  u32(end, 12, centralSize); u32(end, 16, offset); u16(end, 20, 0);
  return new Blob([concat(local.concat(central, [new Uint8Array(end.buffer)]))], { type: 'application/zip' });
}
function midiVlq(value) {
  let v = Math.max(0, Math.floor(value)), buffer = v & 0x7f;
  while ((v >>= 7)) buffer = (buffer << 8) | ((v & 0x7f) | 0x80);
  const bytes = [];
  while (true) { bytes.push(buffer & 255); if (buffer & 0x80) buffer >>= 8; else break; }
  return Uint8Array.from(bytes);
}
function buildMidi(model) {
  const openTuning = model.openNotes.slice().reverse().map(midiPitchName).join(' ');
  const trackName = utf8('Fretboard arpeggio · ' + model.title), description = utf8(model.group + ' · ' + model.formula + ' · ' + model.strings + ' strings · ' + model.tuning + ' · open ' + openTuning + ' · frets ' + model.startFret + '–' + model.endFret + ' · capo ' + model.capoFret);
  const events = [
    { tick: 0, order: 0, bytes: concat([Uint8Array.of(0xff, 0x03), midiVlq(trackName.length), trackName]) },
    { tick: 0, order: 1, bytes: Uint8Array.of(0xff, 0x51, 0x03, 0x07, 0xa1, 0x20) },
    { tick: 0, order: 2, bytes: concat([Uint8Array.of(0xff, 0x01), midiVlq(description.length), description]) },
    { tick: 0, order: 3, bytes: Uint8Array.of(0xc0, 24) },
  ];
  const pitches = model.notes.filter(n => Number.isInteger(n) && n >= 0 && n <= 127);
  if (!pitches.length) throw new Error('There are no MIDI-range notes to export.');
  pitches.forEach((pitch, index) => {
    const start = index * 480, end = start + 360;
    events.push({ tick: start, order: 4, bytes: Uint8Array.of(0x90, pitch, 88) });
    events.push({ tick: end, order: 0, bytes: Uint8Array.of(0x80, pitch, 0) });
  });
  events.sort((a, b) => a.tick - b.tick || a.order - b.order);
  const track = [];
  let previous = 0;
  for (const event of events) { track.push(midiVlq(event.tick - previous), event.bytes); previous = event.tick; }
  track.push(Uint8Array.of(0x00, 0xff, 0x2f, 0x00));
  const body = concat(track), header = new DataView(new ArrayBuffer(14));
  header.setUint32(0, 0x4d546864, false); header.setUint32(4, 6, false); header.setUint16(8, 0, false); header.setUint16(10, 1, false); header.setUint16(12, 480, false);
  const chunk = new DataView(new ArrayBuffer(8)); chunk.setUint32(0, 0x4d54726b, false); chunk.setUint32(4, body.length, false);
  return concat([new Uint8Array(header.buffer), new Uint8Array(chunk.buffer), body]);
}
async function canvasBlob(canvas, type, quality) {
  if (canvas.toBlob) {
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image encoding failed.')), type, quality));
    return blob;
  }
  const dataUrl = canvas.toDataURL(type, quality), base64 = dataUrl.slice(dataUrl.indexOf(',') + 1), binary = atob(base64);
  return new Blob([Uint8Array.from(binary, c => c.charCodeAt(0))], { type });
}
async function blobBytes(blob) {
  if (blob.arrayBuffer) return new Uint8Array(await blob.arrayBuffer());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(reader.error || new Error('Could not read the generated file.'));
    reader.readAsArrayBuffer(blob);
  });
}
async function rasterize(model, type) {
  const svg = model.svg, width = Math.ceil(Number(svg.getAttribute('width')) || 640), height = Math.ceil(Number(svg.getAttribute('height')) || 480);
  svg.setAttribute('xmlns', SVG_NS); svg.setAttribute('width', width); svg.setAttribute('height', height);
  const background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('x', 0); background.setAttribute('y', 0); background.setAttribute('width', width); background.setAttribute('height', height); background.setAttribute('fill', '#fbfaf5');
  svg.insertBefore(background, svg.firstChild);
  const source = new XMLSerializer().serializeToString(svg), url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('The browser could not render the fretboard image.')); image.src = url; });
    const scale = Math.min(2, 4096 / Math.max(width, height)), canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available in this browser.');
    context.fillStyle = '#fbfaf5'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { blob: await canvasBlob(canvas, type, 0.94), width: canvas.width, height: canvas.height };
  } finally { URL.revokeObjectURL(url); }
}
function pdfFromJpeg(jpeg, imageWidth, imageHeight, caption = 'Fretboard diagram', details = '') {
  const pageW = 595.28, pageH = 841.89, margin = 30, header = 54, maxH = pageH - 2 * margin - header;
  const scale = Math.min((pageW - 2 * margin) / imageWidth, maxH / imageHeight);
  const drawW = imageWidth * scale, drawH = imageHeight * scale, x = (pageW - drawW) / 2, y = margin + (maxH - drawH) / 2;
  const pdfText = (text) => String(text).replace(/𝄫/g, 'bb').replace(/𝄪/g, '##').replace(/♯/g, '#').replace(/♭/g, 'b').replace(/°/g, ' dim').replace(/[–—·]/g, ' - ').replace(/[^\x20-\x7e]/g, '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const content = ascii('BT /F1 15 Tf 30 '+ (pageH - 25) + ' Td (' + pdfText(caption) + ') Tj ET\nBT /F1 8 Tf 30 '+ (pageH - 40) + ' Td (' + pdfText(details) + ') Tj ET\nq\n' + drawW.toFixed(3) + ' 0 0 ' + drawH.toFixed(3) + ' ' + x.toFixed(3) + ' ' + y.toFixed(3) + ' cm\n/Im0 Do\nQ\n');
  const objects = [
    ascii('<< /Type /Catalog /Pages 2 0 R >>'),
    ascii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    ascii('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageW + ' ' + pageH + '] /Resources << /XObject << /Im0 4 0 R >> /Font << /F1 6 0 R >> >> /Contents 5 0 R >>'),
    concat([ascii('<< /Type /XObject /Subtype /Image /Width ' + imageWidth + ' /Height ' + imageHeight + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n'), jpeg, ascii('\nendstream')]),
    concat([ascii('<< /Length ' + content.length + ' >>\nstream\n'), content, ascii('endstream')]),
    ascii('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'),
  ];
  const parts = [ascii('%PDF-1.4\n')], offsets = [0];
  let length = parts[0].length;
  objects.forEach((object, index) => {
    offsets.push(length); const head = ascii((index + 1) + ' 0 obj\n'), tail = ascii('\nendobj\n');
    parts.push(head, object, tail); length += head.length + object.length + tail.length;
  });
  const xrefOffset = length, xref = ['xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n'];
  offsets.slice(1).forEach(offset => xref.push(String(offset).padStart(10, '0') + ' 00000 n \n'));
  const trailer = ascii(xref.join('') + 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF');
  parts.push(trailer);
  return new Blob([concat(parts)], { type: 'application/pdf' });
}
function wordParagraph(text, bold = false) {
  return '<w:p><w:r>' + (bold ? '<w:rPr><w:b/></w:rPr>' : '') + '<w:t xml:space="preserve">' + xml(text) + '</w:t></w:r></w:p>';
}
function docx(model, image, width, height) {
  const documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>' +
    wordParagraph(model.title, true) + wordParagraph(model.group + ' · ' + model.formula) +
    wordParagraph(model.strings + ' strings · frets ' + model.startFret + '–' + model.endFret + ' · capo ' + model.capoFret) +
    '<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + width + '" cy="' + height + '"/><wp:docPr id="1" name="Fretboard diagram"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="fretboard.png"/><pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + width + '" cy="' + height + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>' +
    wordParagraph(model.summary) + '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="900" w:bottom="720" w:left="900" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr></w:body></w:document>';
  const types = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  const docRels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/fretboard.png"/></Relationships>';
  return zip([{ name: '[Content_Types].xml', data: types }, { name: '_rels/.rels', data: rels }, { name: 'word/document.xml', data: documentXml }, { name: 'word/_rels/document.xml.rels', data: docRels }, { name: 'word/media/fretboard.png', data: image }]);
}
function pptx(model, image, imageWidth, imageHeight) {
  const sw = 12192000, sh = 6858000, margin = 457200, maxW = sw - margin * 2, maxH = 4550000;
  const scale = Math.min(maxW / imageWidth, maxH / imageHeight), iw = Math.round(imageWidth * scale), ih = Math.round(imageHeight * scale), ix = Math.round((sw - iw) / 2), iy = 1676400;
  const groupTree = '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
  const textShape = (id, name, text, x, y, cx, cy, size, bold) => '<p:sp><p:nvSpPr><p:cNvPr id="' + id + '" name="' + xml(name) + '"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="' + x + '" y="' + y + '"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"/><a:lstStyle/><a:p><a:pPr/><a:r><a:rPr lang="en-US" sz="' + size + '" b="' + (bold ? '1' : '0') + '"><a:solidFill><a:srgbClr val="222222"/></a:solidFill><a:latin typeface="Arial Narrow"/></a:rPr><a:t xml:space="preserve">' + xml(text) + '</a:t></a:r><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>';
  const title = textShape(2, 'Fretboard title', model.title, margin, 330000, maxW, 480000, 2800, true);
  const detail = textShape(3, 'Fretboard formula', model.group + ' · ' + model.formula + ' · ' + model.strings + ' strings · open ' + model.openNotes.slice().reverse().map(midiPitchName).join(' ') + ' · frets ' + model.startFret + '–' + model.endFret + ' · ' + model.tuning + ' · capo ' + model.capoFret, margin, 890000, maxW, 300000, 1300, false);
  const picture = '<p:pic><p:nvPicPr><p:cNvPr id="4" name="Fretboard diagram"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="' + ix + '" y="' + iy + '"/><a:ext cx="' + iw + '" cy="' + ih + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>';
  const slide = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>' + groupTree + title + detail + picture + '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>';
  const layout = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>' + groupTree + '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>';
  const master = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>' + groupTree + '</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="1" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle><a:lvl1pPr algn="l"><a:defRPr sz="2800"/></a:lvl1pPr></p:titleStyle><p:bodyStyle><a:lvl1pPr><a:defRPr sz="1800"/></a:lvl1pPr></p:bodyStyle><p:otherStyle><a:lvl1pPr><a:defRPr sz="1800"/></a:lvl1pPr></p:otherStyle></p:txStyles></p:sldMaster>';
  const theme = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Theory Decks"><a:themeElements><a:clrScheme name="Theory Decks"><a:dk1><a:srgbClr val="222222"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="444444"/></a:dk2><a:lt2><a:srgbClr val="F2F2F2"/></a:lt2><a:accent1><a:srgbClr val="666666"/></a:accent1><a:accent2><a:srgbClr val="444444"/></a:accent2><a:accent3><a:srgbClr val="777777"/></a:accent3><a:accent4><a:srgbClr val="CCCCCC"/></a:accent4><a:accent5><a:srgbClr val="888888"/></a:accent5><a:accent6><a:srgbClr val="BBBBBB"/></a:accent6><a:hlink><a:srgbClr val="555555"/></a:hlink><a:folHlink><a:srgbClr val="777777"/></a:folHlink></a:clrScheme><a:fontScheme name="Theory Decks"><a:majorFont><a:latin typeface="Arial Narrow"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Arial Narrow"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Theory Decks"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>';
  const presentation = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst><p:sldSz cx="' + sw + '" cy="' + sh + '" type="wide"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="en-US"/></a:defPPr></p:defaultTextStyle></p:presentation>';
  const types = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/></Types>';
  const rel = (items) => '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + items.map(([id,type,target]) => '<Relationship Id="' + id + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/' + type + '" Target="' + target + '"/>').join('') + '</Relationships>';
  const files = [
    { name: '[Content_Types].xml', data: types }, { name: '_rels/.rels', data: rel([['rId1','officeDocument','ppt/presentation.xml']]) },
    { name: 'ppt/presentation.xml', data: presentation }, { name: 'ppt/_rels/presentation.xml.rels', data: rel([['rId1','slideMaster','slideMasters/slideMaster1.xml'],['rId2','slide','slides/slide1.xml']]) },
    { name: 'ppt/slides/slide1.xml', data: slide }, { name: 'ppt/slides/_rels/slide1.xml.rels', data: rel([['rId1','slideLayout','../slideLayouts/slideLayout1.xml'],['rId2','image','../media/fretboard.png']]) },
    { name: 'ppt/slideLayouts/slideLayout1.xml', data: layout }, { name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels', data: rel([['rId1','slideMaster','../slideMasters/slideMaster1.xml']]) },
    { name: 'ppt/slideMasters/slideMaster1.xml', data: master }, { name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels', data: rel([['rId1','slideLayout','../slideLayouts/slideLayout1.xml'],['rId2','theme','../theme/theme1.xml']]) },
    { name: 'ppt/theme/theme1.xml', data: theme }, { name: 'ppt/media/fretboard.png', data: image },
  ];
  return zip(files);
}
function filename(title) {
  const safe = String(title).normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return 'Fretboard-' + (safe || 'Diagram');
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function imageDimensions(model, png) {
  const svg = model.svg, width = Number(svg.getAttribute('width')) || png.width, height = Number(svg.getAttribute('height')) || png.height;
  const scale = Math.min(5800000 / width, 6900000 / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
TD['fretboard-export.js'] = { buildMidi, zip, pdfFromJpeg, docx, pptx };
$('fb-export-button').addEventListener('click', async () => {
  const button = $('fb-export-button'), status = $('fb-export-status'), format = $('fb-export-format').value;
  button.disabled = true; status.textContent = 'Preparing ' + format.toUpperCase() + ' export…';
  try {
    const model = FB.getExportModel(), base = filename(model.title);
    if (format === 'mid') {
      download(new Blob([buildMidi(model)], { type: 'audio/midi' }), base + '.mid');
    } else {
      const mime = format === 'jpg' || format === 'pdf' ? 'image/jpeg' : 'image/png';
      const image = await rasterize(model, mime);
      if (format === 'png' || format === 'jpg') download(image.blob, base + '.' + format);
      else if (format === 'pdf') download(pdfFromJpeg(await blobBytes(image.blob), image.width, image.height, model.title, model.group + ' · ' + model.formula + ' · ' + model.strings + ' strings · frets ' + model.startFret + '–' + model.endFret + ' · ' + model.tuning + ' · capo ' + model.capoFret), base + '.pdf');
      else {
        const dimensions = imageDimensions(model, image);
        const documentBlob = format === 'docx' ? docx(model, await blobBytes(image.blob), dimensions.width, dimensions.height) : pptx(model, await blobBytes(image.blob), image.width, image.height);
        download(documentBlob, base + '.' + format);
      }
    }
    status.textContent = format.toUpperCase() + ' exported: ' + base + '.' + format;
  } catch (error) {
    console.error('Fretboard export failed:', error);
    status.textContent = 'Export failed. ' + (error && error.message ? error.message : 'Try another format or browser.');
  } finally { button.disabled = false; }
});
})(window.TD = window.TD || {});
