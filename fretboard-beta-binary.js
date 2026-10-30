(() => {
    'use strict';
    const encoder = new TextEncoder();
    const limit = 256 * 1024 * 1024;
    function rgb(image) {
        const { width, height, data } = image;
        if (!width || !height || data.length !== width * height * 4 || width * height * 3 > limit) throw new Error('Page image is too large. Lower DPI or use a smaller paper size.');
        const bytes = new Uint8Array(width * height * 3);
        for (let i = 0, j = 0; i < data.length; i += 4) {
            const alpha = data[i + 3] / 255;
            for (let c = 0; c < 3; c++) bytes[j++] = Math.round(data[i + c] * alpha + 255 * (1 - alpha));
        }
        return bytes;
    }
    function bmp(image, dpi) {
        const { width, height } = image, pixels = rgb(image);
        const stride = (width * 3 + 3) & ~3;
        const bytes = new Uint8Array(54 + stride * height), view = new DataView(bytes.buffer);
        bytes.set(encoder.encode('BM')); view.setUint32(2, bytes.length, true); view.setUint32(10, 54, true); view.setUint32(14, 40, true);
        view.setInt32(18, width, true); view.setInt32(22, height, true); view.setUint16(26, 1, true); view.setUint16(28, 24, true);
        view.setUint32(34, stride * height, true); view.setInt32(38, Math.round(dpi / .0254), true); view.setInt32(42, Math.round(dpi / .0254), true);
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
            const source = (y * width + x) * 3, target = 54 + (height - 1 - y) * stride + x * 3;
            bytes[target] = pixels[source + 2]; bytes[target + 1] = pixels[source + 1]; bytes[target + 2] = pixels[source];
        }
        return bytes;
    }
    function pnm(image) { return new Blob([encoder.encode('P6\n' + image.width + ' ' + image.height + '\n255\n'), rgb(image)], { type: 'image/x-portable-pixmap' }); }
    function tiff(images, dpi) {
        // Each page has an IFD, RGB sample sizes, two resolution rationals and one uncompressed strip.
        const count = 14, ifdSize = 2 + count * 12 + 4, extraSize = 22;
        let size = 8;
        for (const image of images) { size = (size + 1) & ~1; size += ifdSize + extraSize + image.width * image.height * 3; }
        if (size > limit) throw new Error('TIFF exceeds the 256 MB export limit. Lower DPI, paper size or selection count.');
        const bytes = new Uint8Array(size), v = new DataView(bytes.buffer);
        bytes.set([73, 73, 42, 0]); v.setUint32(4, 8, true);
        let offset = 8;
        images.forEach((image, index) => {
            const extra = offset + ifdSize, strip = extra + extraSize, pixels = rgb(image), end = strip + pixels.length;
            v.setUint16(offset, count, true);
            const entries = [[256,4,1,image.width], [257,4,1,image.height], [258,3,3,extra], [259,3,1,1], [262,3,1,2], [273,4,1,strip], [277,3,1,3], [278,4,1,image.height], [279,4,1,pixels.length], [282,5,1,extra+6], [283,5,1,extra+14], [284,3,1,1], [296,3,1,2], [297,3,2,index | (images.length << 16)]];
            entries.forEach(([tag,type,n,value], i) => { const p = offset + 2 + i * 12; v.setUint16(p,tag,true); v.setUint16(p+2,type,true); v.setUint32(p+4,n,true); v.setUint32(p+8,value,true); });
            for (let c = 0; c < 3; c++) v.setUint16(extra + c * 2, 8, true);
            for (const p of [extra+6, extra+14]) { v.setUint32(p, dpi, true); v.setUint32(p+4,1,true); }
            v.setUint32(offset + 2 + count * 12, index < images.length - 1 ? (end + 1) & ~1 : 0, true);
            bytes.set(pixels, strip); offset = (end + 1) & ~1;
        });
        return new Blob([bytes], { type: 'image/tiff' });
    }
    async function tar(files, checkCancel) {
        const parts = [];
        for (const [name, blob] of files) {
            checkCancel(); const data = new Uint8Array(await blob.arrayBuffer()), header = new Uint8Array(512);
            const field = (offset, length, text) => header.set(encoder.encode(text).subarray(0, length), offset);
            const octal = (value, length) => value.toString(8).padStart(length - 1, '0') + '\0';
            field(0,100,name); field(100,8,octal(420,8)); field(108,8,octal(0,8)); field(116,8,octal(0,8)); field(124,12,octal(data.length,12)); field(136,12,octal(0,12));
            header.fill(32,148,156); header[156] = 48; field(257,6,'ustar\0'); field(263,2,'00');
            const sum = header.reduce((a,b) => a+b,0); field(148,8,sum.toString(8).padStart(6,'0') + '\0 ');
            parts.push(header,data,new Uint8Array((512 - data.length % 512) % 512));
        }
        parts.push(new Uint8Array(1024)); return new Blob(parts, { type: 'application/x-tar' });
    }
    function dbf(rows) {
        const [headings,...records] = rows;
        const fields = headings.map((name,index) => {
            const numeric = records.every(row => typeof row[index] === 'number' && Number.isInteger(row[index]));
            return {name:String(name).replace(/[^A-Za-z0-9_]/g,'_').slice(0,10), numeric, width:numeric ? 20 : records.reduce((max,row) => Math.max(max,String(row[index] ?? '').length),1)};
        });
        const header = 33 + fields.length * 32, recordSize = 1 + fields.reduce((sum,field) => sum+field.width,0);
        const bytes = new Uint8Array(header + records.length * recordSize + 1), view = new DataView(bytes.buffer), date = new Date();
        bytes.set([3,date.getFullYear()-1900,date.getMonth()+1,date.getDate()]); view.setUint32(4,records.length,true); view.setUint16(8,header,true); view.setUint16(10,recordSize,true); bytes[29] = 3;
        fields.forEach((field,i) => {const p = 32+i*32; bytes.set(encoder.encode(field.name),p); bytes[p+11] = field.numeric ? 78 : 67; bytes[p+16] = field.width;});
        bytes[header-1] = 13;
        records.forEach((row,i) => {
            let offset = header+i*recordSize; bytes[offset++] = 32;
            fields.forEach((field,j) => {
                const text = field.numeric ? String(row[j]).padStart(field.width,' ') : String(row[j] ?? '').padEnd(field.width,' ');
                for (let c=0;c<field.width;c++) bytes[offset++] = text.charCodeAt(c);
            });
        });
        bytes[bytes.length-1] = 26; return new Blob([bytes],{type:'application/x-dbf'});
    }
    async function raster(markup, config, options) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(config.pageWidth * options.dpi / 25.4)); canvas.height = Math.max(1, Math.round(config.pageHeight * options.dpi / 25.4));
        if (canvas.width * canvas.height * 4 > limit) throw new Error('Page is too large. Lower DPI or paper size.');
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas export is unavailable.');
        const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
        try {
            const image = new Image();
            await new Promise((resolve,reject) => { image.onload = resolve; image.onerror = () => reject(new Error('Could not render the export page.')); image.src = url; });
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(image,0,0,canvas.width,canvas.height);
            return { image: () => ctx.getImageData(0,0,canvas.width,canvas.height), blob: (type = 'image/png') => new Promise((resolve,reject) => canvas.toBlob(blob => blob && blob.type === type ? resolve(blob) : reject(new Error('Image encoding is unavailable for ' + type)), type, options.jpegQuality / 100)) };
        } finally { URL.revokeObjectURL(url); }
    }
    function djvuDpi(buffer, dpi) {
        const view = new DataView(buffer), id = offset => String.fromCharCode(...new Uint8Array(buffer, offset, 4));
        function walk(start, end) {
            for (let p = start; p + 8 <= end;) {
                const tag = id(p), size = view.getUint32(p+4), data = p+8, next = data+size;
                if (next > end) throw new Error('Invalid DjVu encoder output.');
                if (tag === 'FORM') walk(data+4,next);
                if (tag === 'INFO' && size >= 10) view.setUint16(data+6,dpi,true);
                p = next + (size & 1);
            }
        }
        walk(4,buffer.byteLength); return buffer;
    }
    globalThis.FretboardBetaBinary = { rgb, bmp, pnm, tiff, tar, dbf, raster, djvuDpi };
})();
