/* Configurable, offline diagram export packages for the New UI. */
(() => {
    'use strict';
    const KEYS = ['C','G','D','A','E','B','F#','Gb','C#','Db','G#','Ab','D#','Eb','A#','Bb','F'];
    const GAUNTLET_TUNINGS = ['EA','AD','DG','GB','BE','EA','AD','DG','GB','BE','EAD','ADG','DGB','GBE','EADG','ADGB','DGBE','EADGBE','EADGBE','EADGBE'];
    const GAUNTLET_STRINGS = [[6,4,1],[5,3,1],[4,2,1]];
    const $ = id => document.getElementById(id);
    const safe = value => Exporter.safe(String(value || 'export').replace(/#/g, 'sharp'));
    const delay = () => new Promise(resolve => setTimeout(resolve, 0));

    document.addEventListener('DOMContentLoaded', () => {
        const panel = $('new-ui-footer');
        if (!panel || panel.dataset.exportPackageReady) return;
        panel.dataset.exportPackageReady = 'true';
        const box = document.createElement('fieldset');
        box.id = 'new-ui-export-package'; box.className = 'export-package';
        box.innerHTML = '<legend>Export Package</legend><p class="export-package-help">Build files locally. Diagram images never contain titles; labels and optional details are document text only.</p>';
        panel.append(box);
        const row = (labelText, input, id) => {
            const wrap = document.createElement('label'); wrap.className = 'export-package-field'; wrap.textContent = labelText;
            if (id) input.id = id; wrap.append(input); box.append(wrap); return input;
        };
        const select = (label, id, choices) => {
            const input = document.createElement('select'); choices.forEach(([value,text]) => input.add(new Option(text,value)));
            return row(label,input,id);
        };
        const number = (label,id,value,min,max) => {
            const input=document.createElement('input');input.type='number';input.value=value;input.min=min;input.max=max;input.step=1;return row(label,input,id);
        };
        const check = (label,id,checked=false) => {
            const wrap=document.createElement('label');wrap.className='export-package-check';const input=document.createElement('input');input.type='checkbox';input.id=id;input.checked=checked;wrap.append(input,document.createTextNode(label));return {wrap,input};
        };
        const grid=document.createElement('div');grid.className='export-package-grid';box.append(grid);
        const categoryPop=document.createElement('details');categoryPop.className='export-package-popout';categoryPop.innerHTML='<summary>Pattern categories</summary>';
        const categories=document.createElement('div');categories.className='export-package-checks';const categoryBoxes={};
        [['interval','Intervals'],['chord','Chords'],['scale','Scales']].forEach(([id,label])=>{const item=check(label,'package-type-'+id,id==='interval');categoryBoxes[id]=item.input;categories.append(item.wrap);});
        categoryPop.append(categories);box.append(categoryPop);
        const keyPop=document.createElement('details');keyPop.className='export-package-popout';keyPop.open=true;keyPop.innerHTML='<summary>Keys</summary>';
        const keyChecks=document.createElement('div');keyChecks.className='export-package-checks';const keyBoxes=new Map();
        KEYS.forEach(key=>{const item=check(key,'package-key-'+safe(key),true);item.input.dataset.key=key;keyBoxes.set(key,item.input);keyChecks.append(item.wrap);});
        keyPop.append(keyChecks);const keyActions=document.createElement('div');keyActions.className='export-package-actions';
        [['All keys',true],['Clear keys',false]].forEach(([text,value])=>{const button=document.createElement('button');button.type='button';button.textContent=text;button.addEventListener('click',()=>keyBoxes.forEach(input=>input.checked=value));keyActions.append(button);});
        keyPop.append(keyActions);box.append(keyPop);

        const setMode=select('Diagram set','package-diagram-set',[['current','Current diagram set'],['gauntlet','Gauntlet (20 diagrams)'],['all-keys','All Keys (17 spellings)']]);
        const format=select('Files to include','package-format',[['pdf','PDF'],['pdf-docx','PDF + DOCX'],['pdf-images','PDF + JPG + PNG'],['docx','DOCX'],['jpg','JPG images'],['png','PNG images'],['jpg-png','JPG + PNG images']]);
        const orientation=select('Document orientation','package-orientation',[['landscape','Landscape'],['portrait','Portrait']]);
        const perPage=select('Diagrams per PDF page','package-per-page',[['auto','Fit as many as fit'],...Array.from({length:12},(_,i)=>[String(i+1),String(i+1)])]);perPage.value='auto';
        const start=number('Start fret','package-start-fret',window.app?.fretboard?.settings?.startFret??0,0,24),end=number('End fret','package-end-fret',window.app?.fretboard?.settings?.endFret??24,0,24);
        const tuning=document.createElement('input');tuning.type='text';tuning.maxLength=100;tuning.value=(window.app?.fretboard?.settings?.tuning||['E','A','D','G','B','E']).join(' ');row('Tuning (low to high)',tuning,'package-tuning');
        const titleText=document.createElement('input');titleText.type='text';titleText.maxLength=80;titleText.value='Neck Diagram Collection';row('Document title',titleText,'package-title');
        const options=document.createElement('div');options.className='export-package-checks';
        const titleCheck=check('Add titles as document text','package-titles',true),infoCheck=check('Add tuning and fret range as document text','package-info'),capCheck=check('Cap export ranges at fret 24','package-cap-24',true),tocCheck=check('Add linked table of contents to Word files','package-toc',true),zipCheck=check('Package files in a ZIP','package-zip',true);
        [titleCheck,infoCheck,capCheck,tocCheck,zipCheck].forEach(item=>options.append(item.wrap));box.append(options);

        const rangePop=document.createElement('details');rangePop.className='export-package-popout';rangePop.innerHTML='<summary>50 fret-boundary options</summary><p class="export-package-help">Choose at most one optional start and end boundary. Leave both groups clear to use the numeric fields above.</p>';
        const boundaryGrid=document.createElement('div');boundaryGrid.className='export-package-boundaries';const startBounds=[],endBounds=[];
        for(let fret=0;fret<=24;fret++)for(const [kind,list] of [['Start',startBounds],['End',endBounds]]){
            const item=check(kind+' '+fret,'package-'+kind.toLowerCase()+'-'+fret);item.input.name='package-'+kind.toLowerCase()+'-boundary';
            item.input.addEventListener('change',()=>{if(item.input.checked)list.forEach(other=>{if(other!==item.input)other.checked=false;});});list.push(item.input);boundaryGrid.append(item.wrap);
        }
        rangePop.append(boundaryGrid);box.append(rangePop);

        const existing=document.createElement('div');existing.className='export-package-grid';const sourceSelect=$('export-action-select'),sourceButton=$('export-play-button');
        if(sourceSelect&&sourceButton){const legacySelect=sourceSelect.cloneNode(true);legacySelect.id='package-existing-action';existing.append(row('Existing export option',legacySelect));const launch=document.createElement('button');launch.type='button';launch.textContent='Run existing export';launch.addEventListener('click',()=>{sourceSelect.value=legacySelect.value;sourceButton.click();});existing.append(launch);}box.append(existing);
        const presets=document.createElement('div');presets.className='export-package-presets';const status=document.createElement('output');status.className='export-package-status';status.setAttribute('aria-live','polite');
        const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Stop';cancel.hidden=true;let stopped=false,running=false;
        const presetRows=[
            ['A','Intervals - selected set - collection PDF + PDFs by key','interval','current','collection'],['B','Chords - selected set - collection PDF + PDFs by key','chord','current','collection'],['C','Scales - selected set - collection PDF + PDFs by key','scale','current','collection'],
            ['D','Intervals - Gauntlet set - PDF by key','interval','gauntlet','per-key'],['E','Chords - Gauntlet set - PDF by key','chord','gauntlet','per-key'],['F','Scales - Gauntlet set - PDF by key','scale','gauntlet','per-key'],
            ['G','Intervals - All Keys set - PDF by key','interval','all-keys','per-key'],['H','Chords - All Keys set - PDF by key','chord','all-keys','per-key'],['I','Scales - All Keys set - PDF by key','scale','all-keys','per-key'],
            ['J','All intervals - current setup - PDF + DOCX / linked contents','interval','current','word'],['K','All chords - current setup - PDF + DOCX / linked contents','chord','current','word'],['L','All scales - current setup - PDF + DOCX / linked contents','scale','current','word']
        ];
        presetRows.forEach(([letter,label,type,mode,variant])=>{const button=document.createElement('button');button.type='button';button.textContent=letter+' - '+label;button.addEventListener('click',()=>runPreset(type,mode,variant).catch(error=>{status.textContent=error.message||'Export failed.';finish();}));presets.append(button);});box.append(presets);
        const custom=document.createElement('button');custom.type='button';custom.className='export-package-run';custom.textContent='Create configured package';custom.addEventListener('click',()=>runPreset(null,null,'custom').catch(error=>{status.textContent=error.message||'Export failed.';finish();}));
        box.append(custom,cancel,status);cancel.addEventListener('click',()=>{stopped=true;cancel.disabled=true;cancel.textContent='Stopping...';});
        function finish(){running=false;cancel.hidden=true;cancel.disabled=false;cancel.textContent='Stop';}
        function chosenKeys(){return KEYS.filter(key=>keyBoxes.get(key).checked);}
        function chosenTypes(){return Object.keys(categoryBoxes).filter(type=>categoryBoxes[type].checked);}
        function selectedRange(base){
            const sb=startBounds.find(input=>input.checked),eb=endBounds.find(input=>input.checked),max=capCheck.input.checked?24:36;
            const from=Math.min(max,sb?Number(sb.id.split('-').at(-1)):Number(start.value)),to=Math.min(max,eb?Number(eb.id.split('-').at(-1)):Number(end.value));
            if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<from)throw new Error('Fret range must run from 0 to 24 and start at or before end.');
            return {...base,startFret:from,endFret:to,stringStartFrets:Array(base.tuning.length).fill(0),stringEndFrets:Array(base.tuning.length).fill(to)};
        }
        function normalizedTuning(){
            const notes=tuning.value.trim().split(/[\s,.-]+/).filter(Boolean);
            if(!notes.length||notes.some(note=>!/^[A-Ga-g](?:#|b)?$/.test(note)))throw new Error('Tuning must be note names separated by spaces, such as E A D G B E.');
            if(notes.length>20)throw new Error('Tuning supports up to 20 strings.');return notes.map(note=>note[0].toUpperCase()+note.slice(1));
        }
        function buildSetups(mode,base,keys){
            const tuned={...structuredClone(base),tuning:normalizedTuning()};
            if(mode==='all-keys')return KEYS.filter(key=>keys.includes(key)).map(key=>selectedRange({...structuredClone(tuned),key}));
            if(mode==='gauntlet')return GAUNTLET_TUNINGS.map((notes,index)=>{const setup=selectedRange({...structuredClone(tuned),tuning:[...notes]});setup.visibleStrings=[...notes].map((_,stringIndex)=>index<5?stringIndex===0:index<17||GAUNTLET_STRINGS[index-17].includes(6-stringIndex));setup.stringStartFrets=Array(notes.length).fill(0);setup.stringEndFrets=Array(notes.length).fill(setup.endFret);return setup;});
            return (window.app.diagramSetups||[base]).map(setup=>selectedRange({...structuredClone(setup),tuning:normalizedTuning()}));
        }
        function patternEntries(app,type){const source=type==='interval'?app.musicTheory.intervals:type==='chord'?app.musicTheory.chords:app.musicTheory.scales;let entries=Object.entries(source||{});if(type==='interval')entries=entries.filter(([id])=>id!=='1').sort((a,b)=>a[1].semitones-b[1].semitones);return entries;}
        function newPdf(){const Ctor=Exporter.getJsPDF();return new Ctor({orientation:orientation.value,unit:'pt',format:'a4',compress:true});}
        function appendPdf(doc,records,pageLimit,includeLabels,state={count:0}){
            const width=doc.internal.pageSize.getWidth(),height=doc.internal.pageSize.getHeight(),margin=28,limit=pageLimit==='auto'?12:Number(pageLimit),columns=limit===1?1:limit<=4?2:3,rows=Math.ceil(limit/columns),cellW=(width-margin*2)/columns,cellH=(height-margin*2)/rows;
            records.forEach(record=>{const index=state.count;if(index&&index%limit===0)doc.addPage();const offset=index%limit,col=offset%columns,r=Math.floor(offset/columns),x=margin+col*cellW,y=margin+r*cellH;let titleH=0;
                if(includeLabels&&titleCheck.input.checked){doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(doc.splitTextToSize(record.title,cellW-12),x+6,y+13);titleH=20;}
                const scale=Math.min((cellW-12)/record.width,(cellH-titleH-8)/record.height);doc.addImage('data:image/jpeg;base64,'+record.jpg,'JPEG',x+6,y+4+titleH,record.width*scale,record.height*scale,undefined,'FAST');
                if(infoCheck.input.checked){doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text(doc.splitTextToSize('Tuning: '+record.setup.tuning.join('-')+' | Frets: '+record.setup.startFret+'-'+record.setup.endFret,cellW-12),x+6,y+cellH-10);}state.count++;
            });
        }
        function replaceParagraph(xml,marker,replacement){const at=xml.indexOf(marker);if(at<0)return xml;const begin=xml.lastIndexOf('<w:p>',at),end=xml.indexOf('</w:p>',at);if(begin<0||end<0)return xml;return xml.slice(0,begin)+replacement+xml.slice(end+6);}
        async function makeDocx(records,title,includeDetails=true){
            const {Document,Packer,Paragraph,TextRun,ImageRun}=docx,paras=[],toc=tocCheck.input.checked&&titleCheck.input.checked;
            if(titleCheck.input.checked)paras.push(new Paragraph({children:[new TextRun({text:title,bold:true,size:34})],spacing:{after:220}}));
            if(toc){paras.push(new Paragraph({children:[new TextRun({text:'Contents',bold:true,size:26})]}));records.forEach((_,i)=>paras.push(new Paragraph({children:[new TextRun({text:'__TOC_'+i+'__'})],spacing:{after:30}})));paras.push(new Paragraph({children:[new TextRun({text:'__BODY__'})]}));}
            records.forEach((record,i)=>{
                if(titleCheck.input.checked)paras.push(new Paragraph({children:[new TextRun({text:'__HEAD_'+i+'__'})],spacing:{before:90,after:35}}));
                if(includeDetails&&infoCheck.input.checked)paras.push(new Paragraph({children:[new TextRun({text:'Tuning: '+record.setup.tuning.join('-')+' | Frets: '+record.setup.startFret+'-'+record.setup.endFret,size:16})],spacing:{after:30}}));
                const bytes=Uint8Array.from(atob(record.png),c=>c.charCodeAt(0)),maxW=orientation.value==='portrait'?500:680,scale=Math.min(1,maxW/record.width,220/record.height);
                paras.push(new Paragraph({children:[new ImageRun({type:'png',data:bytes,transformation:{width:Math.max(1,Math.round(record.width*scale)),height:Math.max(1,Math.round(record.height*scale))}})],spacing:{after:90},pageBreakBefore:i>0&&perPage.value==='1'}));
            });
            const documentFile=new Document({title,sections:[{properties:{page:{size:orientation.value==='portrait'?{width:11906,height:16838}:{width:16838,height:11906},margin:{top:540,bottom:540,left:600,right:600}}},children:paras}]});
            const blob=await Packer.toBlob(documentFile);if(!toc)return blob;
            const zip=await JSZip.loadAsync(blob);let xml=await zip.file('word/document.xml').async('string');
            const esc=text=>String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
            records.forEach((record,i)=>{const anchor='diagram_'+i,text=esc(record.title);xml=replaceParagraph(xml,'__TOC_'+i+'__','<w:p><w:hyperlink w:anchor="'+anchor+'"><w:r><w:rPr><w:rStyle w:val="Hyperlink"/></w:rPr><w:t>'+text+'</w:t></w:r></w:hyperlink></w:p>');xml=replaceParagraph(xml,'__HEAD_'+i+'__','<w:p><w:bookmarkStart w:id="'+(i+1)+'" w:name="'+anchor+'"/><w:r><w:rPr><w:b/></w:rPr><w:t>'+text+'</w:t></w:r><w:bookmarkEnd w:id="'+(i+1)+'"/></w:p>');});
            xml=replaceParagraph(xml,'__BODY__','');zip.file('word/document.xml',xml);return zip.generateAsync({type:'blob',compression:'DEFLATE'});
        }
        function download(blob,filename){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.rel='noopener';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
        async function capture(renderer,setup,type,id,index,total,app,variant,needPng){
            renderer.layoutBase=setup.layoutBase||{patternType:'scale',pattern:'major'};renderer.updateSettings(setup);renderer.updatePattern(setup.key,type,id);
            const name=Exporter.patternName(app,type,id),title=(variant==='collection'||variant==='per-key'?setup.key+' - '+name:name+' - '+setup.key);
            const renderApp={fretboard:renderer,musicTheory:app.musicTheory,instrumentName:setup.instrument||''};
            const png=needPng?await Exporter.getFretboardImageBase64(renderApp,{mime:'image/png',scale:2,includeInfo:false}):null,jpg=await Exporter.getFretboardImageBase64(renderApp,{mime:'image/jpeg',scale:2,quality:0.94,includeInfo:false});
            const preview=png||jpg,mime=png?'image/png':'image/jpeg';
            const dims=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve({width:image.width,height:image.height});image.onerror=()=>reject(new Error('Could not read an exported diagram.'));image.src='data:'+mime+';base64,'+preview;});
            const stem=[type,name,setup.key,'fret'+setup.startFret+'-'+setup.endFret,'strings'+setup.tuning.length,setup.tuning.join('-')].map(safe).join('_');
            return {png,jpg,width:dims.width,height:dims.height,title,stem,setup:{...setup},type,name,key:setup.key,index,total};
        }
        async function runPreset(forcedType,forcedMode,variant){
            if(running)return;const app=window.app;
            if(!app||typeof Fretboard==='undefined'||typeof JSZip==='undefined'||typeof docx==='undefined')throw new Error('Offline export libraries are not ready. Reload the explorer and try again.');
            const types=forcedType?[forcedType]:chosenTypes(),keys=chosenKeys();if(!types.length)throw new Error('Select at least one pattern category.');if(!keys.length)throw new Error('Select at least one key.');
            running=true;stopped=false;cancel.hidden=false;status.textContent='Preparing export...';
            if(variant!=='custom'){capCheck.input.checked=true;titleCheck.input.checked=true;}
            if(variant==='collection'||variant==='per-key')infoCheck.input.checked=false;
            const mode=forcedMode||setMode.value,outputZip=zipCheck.input.checked||variant!=='custom',zip=outputZip?new JSZip():null;
            const source=structuredClone(app.diagramSetups?.[app.activeDiagram]||app.fretboard.settings),presetRange=variant==='collection'||variant==='per-key',configuredEnd=end.value;
            if(presetRange)end.value='24';
            const layouts=buildSetups(mode,source,keys),renderKeys=keys;
            if(presetRange)end.value=configuredEnd;
            const max=capCheck.input.checked?24:36;if(layouts.some(layout=>layout.endFret>max))throw new Error('End fret exceeds the selected fret cap.');
            const selectedFormat=format.value,formats=selectedFormat==='pdf-images'?['pdf','jpg','png']:selectedFormat.split('-');
            const renderHost=document.createElement('div');renderHost.id='export-package-renderer';renderHost.style.cssText='position:fixed;left:-100000px;top:0;width:1200px;pointer-events:none;';renderHost.setAttribute('aria-hidden','true');document.body.append(renderHost);
            let renderer;const originalTitleChoice=Exporter.includeTitles;Exporter.includeTitles=false;
            try{
                renderer=new Fretboard(renderHost.id,app.musicTheory);window.removeEventListener('resize',renderer.queueResponsiveDraw);renderer.resizeObserver?.disconnect();
                const allRecords=[],typeRecords=new Map();let total=0,done=0;
                types.forEach(type=>total+=patternEntries(app,type).length*layouts.length*(mode==='all-keys'?1:keys.length));
                for(const type of types){
                    const patterns=patternEntries(app,type),records=[];typeRecords.set(type,records);
                    const master=variant==='collection'?newPdf():null,masterState={count:0};
                    for(const batchKey of renderKeys){
                        if(stopped)break;
                        const batchLayouts=mode==='all-keys'?layouts.filter(layout=>layout.key===batchKey):layouts;
                        const batchPdfs=new Map(),batchStates=new Map();
                        for(const [id] of patterns){
                            for(const sourceSetup of batchLayouts){
                                if(stopped)break;
                                const setup={...structuredClone(sourceSetup)};if(mode!=='all-keys')setup.key=batchKey;
                                const needPng=variant==='word'||(variant==='custom'&&(formats.includes('png')||formats.includes('docx')));
                                const record=await capture(renderer,setup,type,id,done+1,total,app,variant,needPng);
                                done++;
                                if(variant==='collection'||variant==='per-key'){
                                    if(master)appendPdf(master,[record],perPage.value,true,masterState);
                                    if(!batchPdfs.has(record.key)){batchPdfs.set(record.key,newPdf());batchStates.set(record.key,{count:0});}
                                    appendPdf(batchPdfs.get(record.key),[record],perPage.value,true,batchStates.get(record.key));
                                }else{records.push(record);allRecords.push(record);}
                                status.textContent='Rendering '+type+'s - '+record.key+' - '+done+'/'+total;
                                if(done%5===0)await delay();
                            }
                            if(stopped)break;
                        }
                        for(const [key,pdf] of batchPdfs){
                            const batchSetup=batchLayouts.find(layout=>layout.key===key)||batchLayouts[0];
                            const tuningSet=new Set(batchLayouts.map(layout=>layout.tuning.join('-')));
                            const filename=[key,type,'fret'+batchSetup.startFret+'-'+batchSetup.endFret,tuningSet.size===1?batchSetup.tuning.join('-'):mode==='gauntlet'?'Gauntlet':'Multi-tuning'].map(safe).join('_')+'.pdf';
                            const batchFile=pdf.output('blob');zip.file(type+'/'+filename,batchFile);download(batchFile,filename);
                            status.textContent='Downloaded '+type+' batch for '+key+'; preparing next key.';await delay();
                        }
                        if(stopped)break;
                    }
                    if(master)zip.file('all_'+type+'_by_key.pdf',master.output('blob'));
                    if(stopped)break;
                }
                if(stopped)status.textContent='Stopped after '+done+' diagrams; completed key batches are included.';
                if(!done){finish();return;}
                if(variant==='word'){
                    for(const type of types){const items=typeRecords.get(type).slice().sort((a,b)=>KEYS.indexOf(a.key)-KEYS.indexOf(b.key)||a.name.localeCompare(b.name));const pdf=newPdf();appendPdf(pdf,items,perPage.value,true);zip.file('all_'+type+'_current_setup.pdf',pdf.output('blob'));zip.file('all_'+type+'_current_setup.docx',await makeDocx(items,titleText.value,false));}
                }else if(variant==='custom'){
                    if(formats.includes('pdf')){const pdf=newPdf();appendPdf(pdf,allRecords,perPage.value,true);const blob=pdf.output('blob');if(zip)zip.file('diagrams.pdf',blob);else download(blob,'diagrams.pdf');}
                    if(formats.includes('docx')){const blob=await makeDocx(allRecords,titleText.value);if(zip)zip.file('diagrams.docx',blob);else download(blob,'diagrams.docx');}
                    for(const record of allRecords){if(formats.includes('png')){if(zip)zip.file('PNG/'+record.stem+'.png',record.png,{base64:true});else download(await(await fetch('data:image/png;base64,'+record.png)).blob(),record.stem+'.png');}if(formats.includes('jpg')){if(zip)zip.file('JPG/'+record.stem+'.jpg',record.jpg,{base64:true});else download(await(await fetch('data:image/jpeg;base64,'+record.jpg)).blob(),record.stem+'.jpg');}}
                }
                if(zip&&Object.keys(zip.files).length){status.textContent='Compressing '+Object.keys(zip.files).length+' files...';const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}},meta=>{status.textContent='Compressing package... '+Math.round(meta.percent)+'%';});download(blob,safe(titleText.value+'_'+types.join('_')+'_diagrams')+'.zip');}
                if(!stopped)status.textContent='Export ready: '+done+' label-free diagrams.';
            }finally{if(renderer){renderer.resizeObserver?.disconnect();window.removeEventListener('resize',renderer.queueResponsiveDraw);clearTimeout(renderer.resizeTimeout);clearTimeout(renderer.redrawTimeout);}renderHost.remove();if(originalTitleChoice===undefined)delete Exporter.includeTitles;else Exporter.includeTitles=originalTitleChoice;finish();}
        }
    });
})();
