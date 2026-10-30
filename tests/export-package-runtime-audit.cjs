const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map(), downloads = [], zipEntries = [];
class Element {
    constructor(tag='div') { this.tagName=tag;this.children=[];this.events={};this.dataset={};this.style={};this.attributes={};this.value='';this.textContent='';this.hidden=false;this.checked=false;this.options=this.children; }
    set id(value){this._id=value;nodes.set(value,this);} get id(){return this._id;}
    set innerHTML(value){this.html=value;}
    append(...items){this.children.push(...items.filter(Boolean));}
    appendChild(item){this.children.push(item);return item;}
    add(item){this.children.push(item);}
    addEventListener(type,callback){this.events[type]=callback;}
    async click(){if(this.tagName==='a')downloads.push(this.download);return this.events.click?.({target:this});}
    cloneNode(){const copy=new Element(this.tagName);copy.children=[...this.children];copy.options=copy.children;return copy;}
    setAttribute(key,value){this.attributes[key]=value;}
    remove(){this.removed=true;nodes.delete(this.id);}
    setAttributeNS(key,value){this.setAttribute(key,value);}
}
const footer=new Element();footer.id='new-ui-footer';
const sourceSelect=new Element('select');sourceSelect.id='export-action-select';
const sourceButton=new Element('button');sourceButton.id='export-play-button';
let loaded;
const document={
    addEventListener:(name,callback)=>{if(name==='DOMContentLoaded')loaded=callback;},
    getElementById:id=>nodes.get(id),
    createElement:tag=>new Element(tag),
    createTextNode:text=>({textContent:text}),
    body:{append(...items){items.forEach(item=>{if(item.id)nodes.set(item.id,item);});},appendChild(item){if(item.id)nodes.set(item.id,item);}},
};
let zipGenerated=false;
class Zip { constructor(){this.files={};} file(name,data){zipEntries.push(name);this.files[name]={};return this;} async generateAsync(){zipGenerated=true;return new Blob(['zip']);} }
const renderedSettings=[];
class Board { constructor(id,theory){this.container=nodes.get(id);this.musicTheory=theory;this.settings={};} updateSettings(settings){this.settings={...settings};renderedSettings.push({...settings});} updatePattern(key,type,id){this.currentKey=key;this.currentPatternType=type;this.currentPattern=id;} }
class Pdf { constructor(){this.pages=1;this.internal={pageSize:{getWidth:()=>842,getHeight:()=>595}};} addPage(){this.pages++;} setFont(){} setFontSize(){} text(){} splitTextToSize(value){return value;} addImage(){} output(){return new Blob(['pdf']);} }
const app={activeDiagram:0,diagramSetups:[{key:'C',instrument:'acoustic_guitar',tuning:['E','A','D','G','B','E'],startFret:2,endFret:12,visibleStrings:[true,true,true,true,true,true],stringStartFrets:[0,0,0,0,0,0],stringEndFrets:[24,24,24,24,24,24]}],fretboard:{settings:{tuning:['E','A','D','G','B','E'],startFret:2,endFret:12}},musicTheory:{intervals:{P5:{name:'Perfect fifth',semitones:7}},chords:{major:{name:'Major'}},scales:{major:{name:'Major'}}},instrumentPresets:{acoustic_guitar:{name:'Acoustic guitar'}}};
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
const Exporter={includeTitles:undefined,safe:value=>String(value).replace(/[^\w.-]+/g,'_'),getJsPDF:()=>Pdf,patternName:(ctx,type,id)=>ctx.musicTheory[type==='interval'?'intervals':type==='chord'?'chords':'scales'][id].name,getFretboardImageBase64:async()=>png};
class FakeImage { constructor(){this.width=1000;this.height=250;} set src(_){this.onload();} }
const context=vm.createContext({document,window:{app,removeEventListener(){},ST:null},app,Exporter,Fretboard:Board,JSZip:Zip,docx:{},Option:function(text,value){this.textContent=text;this.value=value;},Image:FakeImage,Blob,Uint8Array,atob,structuredClone,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout:(fn,ms)=>ms>=1000?0:setTimeout(fn,ms),clearTimeout,console});
vm.runInContext(fs.readFileSync('app-export-package.js','utf8'),context);
loaded();
const find=(root,predicate)=>{if(predicate(root))return root;for(const child of root.children||[]){const match=find(child,predicate);if(match)return match;}return null;};
(async()=>{
    const keys=Array.from(nodes.values()).filter(node=>node.dataset?.key);assert.equal(keys.length,17,'17 selectable enharmonic keys');
    const boundaries=Array.from(nodes.values()).filter(node=>/^package-(start|end)-\d+$/.test(node.id));assert.equal(boundaries.length,50,'50 fret-boundary checkboxes');
    const clear=find(footer,node=>node.textContent==='Clear keys');await clear.click();nodes.get('package-key-C').checked=true;
    const preset=find(footer,node=>node.textContent.startsWith('A -'));await preset.click();
    for(let i=0;i<100&&!zipGenerated;i++)await new Promise(resolve=>setTimeout(resolve,5));
    assert.equal(downloads.length,2,'preset downloads key batch and final ZIP');
    assert(zipEntries.includes('all_interval_by_key.pdf'));
    assert(zipEntries.some(name=>name.includes('C_interval_fret2-24_E-A-D-G-B-E.pdf')),'PDF filename records key, category, fret range and tuning');
    assert.equal(app.fretboard.settings.startFret,2,'export does not mutate live board settings');
    assert.equal(renderedSettings.length,1);assert(renderedSettings.every(settings=>settings.endFret===24),'A-C presets cap diagrams at fret 24');
    const gauntlet=find(footer,node=>node.textContent.startsWith('D -'));await gauntlet.click();
    for(let i=0;i<100&&downloads.length<4;i++)await new Promise(resolve=>setTimeout(resolve,5));
    assert.equal(renderedSettings.length,21,'Gauntlet applies all 20 diagram tunings sequentially');
    assert(zipEntries.some(name=>name==='interval/C_interval_fret2-24_Gauntlet.pdf'));
    assert.equal(downloads.length,4,'Gauntlet downloads the key batch and final ZIP');
    const allKeys=find(footer,node=>node.textContent==='All keys');await allKeys.click();zipGenerated=false;
    const allKeysPreset=find(footer,node=>node.textContent.startsWith('G -'));await allKeysPreset.click();
    for(let i=0;i<100&&downloads.length<22;i++)await new Promise(resolve=>setTimeout(resolve,5));
    assert.equal(renderedSettings.length,38,'All Keys renders each of its 17 selected spellings once');
    assert.equal(downloads.length,22,'All Keys downloads one PDF per key, then the ZIP');
    assert.equal(zipEntries.filter(name=>name.startsWith('interval/')&&name.endsWith('.pdf')).length,19,'Gauntlet and All Keys batches are stored in the ZIP');
    const toggles=Array.from(nodes.values()).filter(node=>node.type==='checkbox');
    assert(toggles.some(node=>node.id==='package-type-chord')&&toggles.some(node=>node.id==='package-type-scale'));
    console.log('PASS: runtime UI creates 17 key checks and 50 fret selectors; Options A, D, and G cap ranges at fret 24, render current/Gauntlet/All Keys sets, and package/download sequential key batches without mutating the live board.');
})().catch(error=>{console.error(error);process.exitCode=1;});
