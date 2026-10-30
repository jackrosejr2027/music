(() => {
    'use strict';
    const encoder = new TextEncoder();
    const crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c; }
    function header(size, values) {
        const bytes = new Uint8Array(size), view = new DataView(bytes.buffer);
        for (const [offset, value, width = 2] of values) width === 4 ? view.setUint32(offset, value, true) : view.setUint16(offset, value, true);
        return bytes;
    }
    class Archive {
        constructor(writer, filename, download) {
            this.writer = writer; this.filename = filename; this.download = download;
            this.pending = []; this.names = new Set(); this.central = []; this.offset = 0;
            this.zip = writer ? null : new JSZip(); this.count = 0; this.byteCount = 0; this.part = 0; this.closed = false;
        }
        file(name, data) {
            if (arguments.length === 1) return this.names.has(name) ? { name } : null;
            if (this.names.has(name)) throw new Error('Duplicate archive entry: ' + name);
            this.names.add(name); this.pending.push({ name, data }); return this;
        }
        async flush(check = () => {}) {
            for (const entry of this.pending) {
                check();
                const bytes = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data instanceof Blob ? new Uint8Array(await entry.data.arrayBuffer()) : new Uint8Array(entry.data);
                if (this.writer) {
                    const name = encoder.encode(entry.name);
                    if (name.length > 65535 || this.offset + bytes.length + name.length + 30 >= 0xffffffff || this.central.length >= 65534) throw new Error('ZIP exceeds the 4 GB limit. Use smaller collections or lower DPI.');
                    let crc = 0xffffffff;
                    for (let start = 0; start < bytes.length; start += 262144) {
                        for (let i = start; i < Math.min(start + 262144, bytes.length); i++) crc = crcTable[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
                        check();
                        if (bytes.length > 262144) await new Promise(resolve => setTimeout(resolve, 0));
                    }
                    crc = (crc ^ 0xffffffff) >>> 0;
                    const local = header(30, [[0, 0x04034b50, 4], [4, 20], [6, 0x800], [12, 33], [14, crc, 4], [18, bytes.length, 4], [22, bytes.length, 4], [26, name.length]]);
                    const central = header(46, [[0, 0x02014b50, 4], [4, 20], [6, 20], [8, 0x800], [14, 33], [16, crc, 4], [20, bytes.length, 4], [24, bytes.length, 4], [28, name.length], [42, this.offset, 4]]);
                    this.central.push({ central, name });
                    await this.writer.write(local); await this.writer.write(name); await this.writer.write(bytes);
                    this.offset += local.length + name.length + bytes.length;
                } else {
                    this.zip.file(entry.name, bytes); this.count++; this.byteCount += bytes.length;
                    if (this.count >= 250 || this.byteCount >= 32 * 1024 * 1024) await this.savePart(check);
                }
                entry.data = null;
            }
            this.pending = [];
        }
        async savePart(check) {
            if (!this.count) return;
            const blob = await this.zip.generateAsync({ type: 'blob', compression: 'STORE', streamFiles: true }, check);
            check(); this.part++;
            this.download(blob, this.filename.replace(/\.zip$/i, '') + '-part-' + String(this.part).padStart(3, '0') + '.zip');
            this.zip = new JSZip(); this.count = 0; this.byteCount = 0;
        }
        async generateAsync(options, check = () => {}) {
            await this.flush(check); check();
            if (this.writer) {
                const start = this.offset;
                for (const { central, name } of this.central) { check(); await this.writer.write(central); await this.writer.write(name); this.offset += central.length + name.length; }
                if (this.offset >= 0xffffffff) throw new Error('ZIP exceeds the 4 GB limit.');
                await this.writer.write(header(22, [[0, 0x06054b50, 4], [8, this.central.length], [10, this.central.length], [12, this.offset - start, 4], [16, start, 4]]));
                await this.writer.close();
            } else await this.savePart(check);
            this.closed = true; return null;
        }
        async abort() { if (this.writer && !this.closed) await this.writer.abort().catch(() => {}); this.pending = []; this.zip = null; }
        get note() { return this.writer ? ' Saved directly to disk (STORE compression).' : ' Saved as ' + this.part + ' bounded ZIP part(s). Allow multiple downloads in your browser.'; }
    }
    async function create(filename, download) {
        let writer;
        if (typeof window.showSaveFilePicker === 'function') {
            try {
                const handle = await window.showSaveFilePicker({ suggestedName: filename, types: [{ description: 'ZIP archive', accept: { 'application/zip': ['.zip'] } }] });
                writer = await handle.createWritable();
            } catch (error) { if (error.name === 'AbortError') throw error; if (!['SecurityError', 'NotAllowedError'].includes(error.name)) throw error; }
        }
        return new Archive(writer, filename, download);
    }
    globalThis.FretboardBetaStream = { create, Archive };
})();
