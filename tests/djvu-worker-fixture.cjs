// Runs the vendored browser worker in a real Node thread; the codec itself is not mocked.
const fs = require('node:fs');
const vm = require('node:vm');
const { Worker } = require('node:worker_threads');
module.exports = function djvuFixture() {
    class BrowserWorker {
        constructor() {
            this.thread = new Worker(
                'const {parentPort}=require("node:worker_threads");' +
                'globalThis.self=globalThis;globalThis.onmessage=null;globalThis.addEventListener=()=>{};' +
                'globalThis.ImageData=class{constructor(data,width,height){this.data=data;this.width=width;this.height=height;}};' +
                'globalThis.postMessage=(data,transfers)=>parentPort.postMessage(data,transfers);' +
                'require("node:vm").runInThisContext(require("node:fs").readFileSync(' + JSON.stringify(require.resolve('../vendor/djvu.js')) + ',"utf8"));' +
                'parentPort.on("message",data=>globalThis.onmessage({data}));', {eval:true});
            this.thread.on('message', data => this.onmessage?.({data}));
            this.thread.on('error', error => { this.onerror?.(error); this.errorListener?.(error); });
        }
        postMessage(data,transfers) { this.thread.postMessage(data,transfers); }
        addEventListener(type,listener) { if (type === 'error') this.errorListener = listener; }
        terminate() { this.thread.terminate(); }
    }
    const sandbox = { self:{document:{}}, Worker:BrowserWorker, console, URL, Blob, ImageData:class{constructor(data,width,height){this.data=data;this.width=width;this.height=height;}} };
    vm.createContext(sandbox); vm.runInContext(fs.readFileSync(require.resolve('../vendor/djvu.js'),'utf8'),sandbox);
    return sandbox.DjVu;
};
