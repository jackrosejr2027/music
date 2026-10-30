const keySelect=document.querySelector('#key-select');
const chordSource=document.querySelector('#chord-source');
const modeSelect=document.querySelector('#mode-select');
const lengthSelect=document.querySelector('#length-select');
const combinationSelect=document.querySelector('#combination-select');
const combinationCount=document.querySelector('#combination-count');
const palette=document.querySelector('#chord-palette');
const paletteKey=document.querySelector('#palette-key');
const majorPalette=document.querySelector('#major-chord-palette');
const majorPaletteKey=document.querySelector('#major-palette-key');
const groups=document.querySelector('#key-groups');
const title=document.querySelector('#map-title');
const total=document.querySelector('#total-count');
const patternSummary=document.querySelector('#pattern-summary');
const rangeSummary=document.querySelector('#range-summary');
const definitionText=document.querySelector('#shape-definition-text');
const playbackStatus=document.querySelector('#playback-status');
const exportStatus=document.querySelector('#export-status');
const exportButton=document.querySelector('#export-selected');
const pageInput=document.querySelector('#page-input');
const pageTotal=document.querySelector('#page-total');
const pageStatus=document.querySelector('#page-status');
const previousPage=document.querySelector('#previous-page');
const nextPage=document.querySelector('#next-page');
const goPage=document.querySelector('#go-page');
const presetButtons=[...document.querySelectorAll('.preset')];
const chordLegend=document.querySelector('#chord-legend');
const PAGE_SIZE=12;
const BPM=100;
const BEATS_PER_BAR=4;
const BEAT_MS=60000/BPM;
const BAR_SECONDS=BEATS_PER_BAR*BEAT_MS/1000;
const EXPORT_EXPANSION_LIMIT=25000;
const ALL_LENGTHS='all-lengths';
const ALL_SHAPES='all-shapes';
const keys=[['C',0],['C#',1],['D',2],['D#',3],['E',4],['F',5],['F#',6],['G',7],['G#',8],['A',9],['A#',10],['B',11]];
const letters=['C','D','E','F','G','A','B'];
const naturalPitch={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const cadenceDegrees=[
 {roman:'i',role:'tonic minor',quality:'minor',interval:0,letterStep:0},
 {roman:'III',role:'mediant major',quality:'major',interval:3,letterStep:2},
 {roman:'iv',role:'subdominant minor',quality:'minor',interval:5,letterStep:3},
 {roman:'V',role:'dominant major',quality:'major',interval:7,letterStep:4},
 {roman:'♭VI',role:'lowered sixth-degree major',quality:'major',interval:8,letterStep:5},
 {roman:'♭VII',role:'lowered seventh-degree major',quality:'major',interval:10,letterStep:6}
];
let chordDegrees=cadenceDegrees;
const modes=[
 {id:'ionian',name:'Ionian',scale:[0,2,4,5,7,9,11]},
 {id:'dorian',name:'Dorian',scale:[0,2,3,5,7,9,10]},
 {id:'phrygian',name:'Phrygian',scale:[0,1,3,5,7,8,10]},
 {id:'lydian',name:'Lydian',scale:[0,2,4,6,7,9,11]},
 {id:'mixolydian',name:'Mixolydian',scale:[0,2,4,5,7,9,10]},
 {id:'aeolian',name:'Aeolian',scale:[0,2,3,5,7,8,10]},
 {id:'locrian',name:'Locrian',scale:[0,1,3,5,6,8,10]}
];
const modeDegreeNames=['tonic','supertonic','mediant','subdominant','dominant','submediant','seventh-degree'];
const majorScaleSteps=[0,2,4,5,7,9,11];
const featuredPatterns={andalusian:[1,0,0,1,1,1],other:[1,1,1,1,0,0]};
const patternCache=new Map();
const audio={context:null,playback:null};
let pageIndex=0;
let previousLengths=[];
let previousShapes=[];
const pitch=n=>(n+12)%12;
function noteForKey(root,rootPc,interval,letterStep){
 const letterIndex=letters.indexOf(root[0]);
 const targetLetter=letters[(letterIndex+letterStep)%7];
 const targetPc=pitch(rootPc+interval);
 let accidental=(targetPc-naturalPitch[targetLetter]+12)%12;
 if(accidental>6)accidental-=12;
 return targetLetter+(accidental===1?'#':accidental===2?'##':accidental===-1?'b':accidental===-2?'bb':'');
}
function modalChords(modeId){
 const mode=modes.find(item=>item.id===modeId);
 return mode.scale.map((interval,index)=>{
  const third=pitch(mode.scale[(index+2)%7]+(index+2>=7?12:0)-interval);
  const fifth=pitch(mode.scale[(index+4)%7]+(index+4>=7?12:0)-interval);
  const quality=third===3&&fifth===6?'diminished':third===3?'minor':third===4&&fifth===8?'augmented':'major';
  let alteration=(interval-majorScaleSteps[index]+12)%12;
  if(alteration>6)alteration-=12;
  const accidental=alteration===-2?'♭♭':alteration===-1?'♭':alteration===1?'♯':alteration===2?'♯♯':'';
  const numeral=['I','II','III','IV','V','VI','VII'][index];
  const roman=accidental+(quality==='minor'||quality==='diminished'?numeral.toLowerCase():numeral)+(quality==='diminished'?'°':quality==='augmented'?'+':'');
  const degree=modeDegreeNames[index];
  const alteredDegree=alteration<0?'lowered '+degree:alteration>0?'raised '+degree:degree;
  return {roman,role:alteredDegree+' '+quality,quality,interval,letterStep:index};
 });
}
function factorial(n){let value=1;for(let i=2;i<=n;i++)value*=i;return value}
function orderCount(counts){const length=counts.reduce((sum,count)=>sum+count,0);return factorial(length)/counts.reduce((product,count)=>product*factorial(count),1)}
function countPatterns(length){
 const cacheKey=chordDegrees.length+':'+length;
 if(patternCache.has(cacheKey))return patternCache.get(cacheKey);
 const patterns=[];
 function build(prefix,remaining,slots){
  if(slots===1){patterns.push(prefix.concat(remaining));return}
  for(let count=0;count<=remaining;count++)build(prefix.concat(count),remaining-count,slots-1);
 }
 build([],length,chordDegrees.length);patternCache.set(cacheKey,patterns);return patterns;
}
function patternCount(length,dimensions=chordDegrees.length){
 let result=1;
 for(let index=1;index<dimensions;index++)result=result*(length+index)/index;
 return Math.round(result);
}
function countsValue(counts){return counts.join(',')}
function patternValue(length,counts){return length+'|'+countsValue(counts)}
function parsePatternValue(value){const [length,...counts]=value.split('|');return {length:Number(length),counts:counts.join('|').split(',').map(Number)}}
function patternLabel(counts){
 const ingredients=counts.flatMap((count,index)=>count?[count+' '+chordDegrees[index].role+' chord'+(count===1?'':'s')]:[]);
 const orders=orderCount(counts);
 return ingredients.join(' + ')+' — '+orders.toLocaleString()+' unique order'+(orders===1?'':'s');
}
function unrankPermutation(sourceCounts,rank){
 const counts=sourceCounts.slice();
 const output=[];
 const length=counts.reduce((sum,count)=>sum+count,0);
 for(let position=0;position<length;position++){
  for(let chord=0;chord<counts.length;chord++){
   if(!counts[chord])continue;
   counts[chord]--;
   const block=orderCount(counts);
   if(rank<block){output.push(chord);break}
   rank-=block;
   counts[chord]++;
  }
 }
 return output;
}
function selectedValues(select){return [...select.selectedOptions].map(option=>option.value)}
function selectedLengthList(){
 const selected=selectedValues(lengthSelect);
 if(selected.includes(ALL_LENGTHS))return Array.from({length:16},(_,index)=>index+1);
 return selected.filter(value=>value!==ALL_LENGTHS).map(Number).sort((a,b)=>a-b);
}
function selectedKeys(){return keySelect.value==='all'?keys:keys.filter(([name])=>name===keySelect.value)}
function setupLengths(values=['4']){
 lengthSelect.replaceChildren();
 const all=document.createElement('option');all.value=ALL_LENGTHS;all.textContent='All lengths (1–16)';lengthSelect.append(all);
 for(let length=1;length<=16;length++){
  const option=document.createElement('option');option.value=String(length);
  option.textContent=length+' chord'+(length===1?'':'s')+' · '+(chordDegrees.length**length).toLocaleString()+' orders / key';
  lengthSelect.append(option);
 }
 for(const option of lengthSelect.options)option.selected=values.includes(option.value);
 previousLengths=selectedValues(lengthSelect);
}
function setupKeys(){
 for(const [name] of keys){const option=document.createElement('option');option.value=name;keySelect.append(option)}
 updateKeyLabels();
}
function updateKeyLabels(){
 for(const option of keySelect.options){
  if(option.value==='all')option.textContent='All 12 tonics';
  else option.textContent=option.value+(chordSource.value==='modes'?' tonic':' minor');
 }
}
function setupModes(){
 for(const mode of modes){const option=document.createElement('option');option.value=mode.id;option.textContent=mode.name;modeSelect.append(option)}
 modeSelect.value='ionian';
}
function setupShapes(lengths,preferredValues=[]){
 const keepAll=preferredValues.includes(ALL_SHAPES);
 const preferred=new Set(preferredValues.filter(value=>value!==ALL_SHAPES));
 combinationSelect.replaceChildren();
 const shapeTotal=lengths.reduce((sum,length)=>sum+patternCount(length),0);
 const allOption=document.createElement('option');allOption.value=ALL_SHAPES;
 allOption.textContent='All chord-count shapes · '+shapeTotal.toLocaleString()+' recipes';
 allOption.selected=keepAll;
 combinationSelect.append(allOption);
 let matching=0;
 if(shapeTotal<=100000){
  for(const length of lengths){
   const patterns=countPatterns(length);
   const group=document.createElement('optgroup');group.label=length+'-chord shapes · '+patterns.length.toLocaleString();
   for(const counts of patterns){
    const option=document.createElement('option');option.value=patternValue(length,counts);option.textContent=patternLabel(counts);
    option.selected=preferred.has(option.value);if(option.selected)matching++;
    group.append(option);
   }
   combinationSelect.append(group);
  }
 }
 if(!keepAll&&matching===0)allOption.selected=true;
 combinationCount.textContent=shapeTotal.toLocaleString()+(shapeTotal>100000?' total · narrow lengths to list recipes':' available · multi-select');
 previousShapes=selectedValues(combinationSelect);
}
function resolveSentinel(select,sentinel,previous){
 const values=selectedValues(select);
 const includesSentinel=values.includes(sentinel);
 const hadSentinel=previous.includes(sentinel);
 if(includesSentinel&&!hadSentinel){
  for(const option of select.options)if(option.value!==sentinel)option.selected=false;
 }else if(includesSentinel&&values.some(value=>value!==sentinel)){
  for(const option of select.options)if(option.value===sentinel)option.selected=false;
 }
 return selectedValues(select);
}
function selectedTasks(lengths,shapeValues){
 const allShapes=shapeValues.includes(ALL_SHAPES);
 const selected=new Set(shapeValues.filter(value=>value!==ALL_SHAPES));
 const tasks=[];
 for(const length of lengths){
  for(const counts of countPatterns(length)){
   if(allShapes||selected.has(patternValue(length,counts)))tasks.push({length,counts,orders:orderCount(counts)});
  }
 }
 return tasks;
}
function chordName(index,keyChords){return keyChords[index].note+' '+keyChords[index].quality}
function romanPath(order){return order.map(index=>chordDegrees[index].roman).join(' → ')}
function functionPath(order){return order.map(index=>chordDegrees[index].role+' ('+chordDegrees[index].roman+')').join(' → ')}
function chordPath(order,keyChords){return order.map(index=>chordName(index,keyChords)).join(' → ')}
function relatedVariants(order){
 if(order.length<2)return [];
 const candidates=[
  {label:'Reverse',order:order.slice().reverse()},
  {label:'Rotate start by one chord',order:order.slice(1).concat(order[0])}
 ];
 const seen=new Set([order.join(',')]);
 return candidates.filter(item=>{const key=item.order.join(',');if(seen.has(key))return false;seen.add(key);return true});
}
function soundProfile(order){
 const first=chordDegrees[order[0]],last=chordDegrees[order[order.length-1]];
 const qualityCounts=['major','minor','diminished','augmented'].map(quality=>({quality,count:order.filter(index=>chordDegrees[index].quality===quality).length})).filter(item=>item.count);
 const unique=new Set(order).size;
 let ending;
 if(order[order.length-1]===0&&last.quality==='major')ending='lands on the major tonic for a settled close';
 else if(order[order.length-1]===0&&last.quality==='minor')ending='lands on the minor tonic for a settled minor close';
 else if(last.quality==='diminished')ending='ends on a diminished chord, leaving tension unresolved';
 else if(last.role.startsWith('dominant '))ending='ends on the dominant, leaving a pull back to the tonic';
 else if(last.quality==='major')ending='ends on a bright major color without landing on the tonic';
 else ending='ends on a minor chord, leaving the phrase open';
 let description='Opens on the '+first.role+' and '+ending+'. Chord colors: '+qualityCounts.map(item=>item.count+' '+item.quality).join(', ')+'.';
 if(unique<order.length)description+=' The recipe contains '+(order.length-unique)+' repeated chord occurrence'+(order.length-unique===1?'':'s')+'.';
 return description;
}
function familyDescription(counts){
 if(chordSource.value==='modes')return modes.find(mode=>mode.id===modeSelect.value).name+' chord set: these shapes use the seven diatonic triads of this mode.';
 if(countsValue(counts)===countsValue(featuredPatterns.andalusian))return 'Andalusian core chord set: the same four chords as i–♭VII–♭VI–V, in any order.';
 if(countsValue(counts)===countsValue(featuredPatterns.other))return 'Alternate-path chord set: the same four chords as i–III–iv–V, in any order.';
 return '';
}
function renderShapeDefinition(lengths,shapes){
 if(shapes.includes(ALL_SHAPES)){
  const count=lengths.reduce((sum,length)=>sum+patternCount(length),0);
  const modeName=chordSource.value==='modes'?modes.find(mode=>mode.id===modeSelect.value).name+' mode':'Andalusian palette';
  definitionText.textContent=count.toLocaleString()+' recipes are included for the '+modeName+'. A chord-count shape is a combination: it records how many times each available chord role appears at a chosen length, without assigning an order. The map lists each unique ordering once; the count is n! divided by the factorial of each chord count.';
  return;
 }
 const selected=shapes.map(parsePatternValue);
 if(!selected.length){definitionText.textContent='Select a recipe to see its chord-role counts and number of unique orderings.';return}
 const entries=selected.slice(0,5).map(({length,counts})=>length+' chords: '+patternLabel(counts)+'.');
 if(selected.length>5)entries.push((selected.length-5)+' more selected recipes are fully defined in the shape list.');
 definitionText.textContent=entries.join(' ');
}
function renderLegend(){
 chordLegend.replaceChildren();
 for(const degree of chordDegrees){
  const item=document.createElement('span');item.textContent=degree.roman+' · '+degree.quality;chordLegend.append(item);
 }
 const note=document.createElement('span');note.className='footer-note';
 note.textContent=chordSource.value==='modes'?modes.find(mode=>mode.id===modeSelect.value).name+' triads, built from the major scale.':'V is major, as in the harmonic-minor cadence.';
 chordLegend.append(note);
}
function renderPalette(){
 const chosen=keySelect.value;
 const [key,rootPc]=chosen==='all'?['A',9]:keys.find(([name])=>name===chosen);
 const activeMode=modes.find(mode=>mode.id===modeSelect.value);
 paletteKey.textContent=chosen==='all'?'A MINOR REFERENCE':key.toUpperCase()+' MINOR';
 majorPaletteKey.textContent=chosen==='all'?'A '+activeMode.name.toUpperCase()+' REFERENCE':key.toUpperCase()+' '+activeMode.name.toUpperCase();
 for(const [container,degrees] of [[palette,cadenceDegrees],[majorPalette,modalChords(activeMode.id)]]){
  container.replaceChildren();
  for(const degree of degrees){
   const card=document.createElement('div');card.className='palette-chord';
   const roman=document.createElement('span');roman.className='palette-roman';roman.textContent=degree.roman;
   const name=document.createElement('span');name.className='palette-name';
   const suffix=degree.quality==='minor'?'m':degree.quality==='diminished'?'dim':degree.quality==='augmented'?'aug':'';
   name.textContent=noteForKey(key,rootPc,degree.interval,degree.letterStep)+suffix;
   const role=document.createElement('span');role.className='palette-role';role.textContent=degree.role;
   card.append(roman,name,role);container.append(card);
  }
 }
}
function render(){
 stopPlayback();
 pageInput.removeAttribute('aria-invalid');pageStatus.textContent='';
 renderLegend();
 const chosen=keySelect.value;
 const lengths=selectedLengthList();
 const shapes=selectedValues(combinationSelect);
 const tasks=selectedTasks(lengths,shapes);
 const totalOrders=tasks.reduce((sum,task)=>sum+task.orders,0);
 const pageCount=Math.ceil(totalOrders/PAGE_SIZE);
 pageIndex=Math.min(pageIndex,Math.max(0,pageCount-1));
 const start=pageIndex*PAGE_SIZE;
 const end=Math.min(start+PAGE_SIZE,totalOrders);
 const visible=selectedKeys();
 const pageRows=[];
 let cursor=0;
 for(const task of tasks){
  const taskEnd=cursor+task.orders;
  const from=Math.max(start,cursor),to=Math.min(end,taskEnd);
  for(let globalRank=from;globalRank<to;globalRank++)pageRows.push({task,order:unrankPermutation(task.counts,globalRank-cursor),rank:globalRank-cursor});
  cursor=taskEnd;
  if(cursor>=end)break;
 }
 groups.replaceChildren();
 const mappedMode=chordSource.value==='modes'?modes.find(mode=>mode.id===modeSelect.value):null;
 title.textContent=chosen==='all'?(mappedMode?'All tonics · '+mappedMode.name:'All minor keys'):chosen+(mappedMode?' '+mappedMode.name:' minor');
 total.textContent=totalOrders.toLocaleString();
 const shapeCount=shapes.includes(ALL_SHAPES)?lengths.reduce((sum,length)=>sum+patternCount(length),0):shapes.length;
 const recipeLengths=shapes.includes(ALL_SHAPES)?lengths:[...new Set(shapes.map(value=>Number(value.split('|')[0])))].sort((a,b)=>a-b);
 patternSummary.textContent=shapes.includes(ALL_SHAPES)?'ALL SHAPES · '+shapeCount.toLocaleString()+' recipes · LENGTHS '+(lengths.length?lengths.join(', '):'none'):shapeCount?'SELECTED SHAPES · '+shapeCount.toLocaleString()+' recipes at lengths '+recipeLengths.join(', ')+' · LENGTH FILTER '+(lengths.length?lengths.join(', '):'none'):'NO SHAPES SELECTED';
 rangeSummary.textContent=totalOrders?'PROGRESSIONS '+(start+1).toLocaleString()+'–'+end.toLocaleString()+' OF '+totalOrders.toLocaleString()+' / TONIC':'NO SHAPES SELECTED';
 renderShapeDefinition(lengths,shapes);
 for(const [key,rootPc] of visible){
  const keyChords=chordDegrees.map(degree=>({...degree,note:noteForKey(key,rootPc,degree.interval,degree.letterStep)}));
  const section=document.createElement('article');section.className='key-group';
  const head=document.createElement('div');head.className='key-head';
  const name=document.createElement('span');name.className='key-name';name.textContent=key+(mappedMode?' '+mappedMode.name:' minor');
  const tag=document.createElement('span');tag.className='minor-tag';tag.textContent=totalOrders.toLocaleString()+' ORDERS';
  head.append(name,tag);section.append(head);
  const list=document.createElement('div');list.className='sequence-list';
  for(const {task,order,rank} of pageRows){
   const row=document.createElement('article');row.className='sequence';
   row.dataset.length=String(task.length);row.dataset.order=order.join(',');row.dataset.rootPc=String(rootPc);row.dataset.key=key;row.dataset.tonicLabel=key+(mappedMode?' '+mappedMode.name:' minor');
   const play=document.createElement('button');play.type='button';play.className='play-button';play.textContent='▶';play.setAttribute('aria-label','Play progression in '+row.dataset.tonicLabel);
   const body=document.createElement('div');body.className='sequence-body';
   const names=document.createElement('div');names.className='chords';
   names.setAttribute('aria-label',order.map(index=>chordName(index,keyChords)).join(' then '));
   for(const index of order){const note=document.createElement('span');note.className='chord-token';note.textContent=chordName(index,keyChords);names.append(note)}
   const functions=document.createElement('div');functions.className='function-path';functions.textContent=functionPath(order);
   const notes=document.createElement('details');notes.className='progression-notes';
   const summary=document.createElement('summary');summary.textContent='SOUND PROFILE + RELATED';
   const fields=document.createElement('div');fields.className='description-fields';
   const profileField=document.createElement('section');profileField.className='info-field';
   const profileLabel=document.createElement('span');profileLabel.textContent='SOUND PROFILE';
   const profile=document.createElement('p');profile.textContent=soundProfile(order);
   profileField.append(profileLabel,profile);
   const relatedField=document.createElement('section');relatedField.className='info-field';
   const relatedLabel=document.createElement('span');relatedLabel.textContent='RELATED PROGRESSIONS';
   const relatedText=document.createElement('p');
   const variants=relatedVariants(order);
   const family=familyDescription(task.counts);
   const relationParts=[];
   relationParts.push('Same chord-count shape: '+Math.max(0,task.orders-1).toLocaleString()+' other unique orders.');
   if(family)relationParts.push(family);
   for(const variant of variants)relationParts.push(variant.label+': '+chordPath(variant.order,keyChords)+'.');
   if(!variants.length&&!family)relationParts.push('This is the only unique ordering for this chord-count shape.');
   relatedText.textContent=relationParts.join(' ');
   relatedField.append(relatedLabel,relatedText);
   fields.append(profileField,relatedField);
   notes.append(summary,fields);
   body.append(names,functions,notes);
   row.append(play,body);list.append(row);
  }
  section.append(list);groups.append(section);
 }
 pageInput.max=String(Math.max(1,pageCount));pageInput.value=String(pageIndex+1);pageTotal.textContent='OF '+pageCount.toLocaleString();
 previousPage.disabled=pageIndex===0||pageCount===0;nextPage.disabled=pageCount===0||pageIndex>=pageCount-1;
 exportButton.disabled=totalOrders===0;
}
function goToPage(value){
 const tasks=selectedTasks(selectedLengthList(),selectedValues(combinationSelect));
 const pages=Math.ceil(tasks.reduce((sum,task)=>sum+task.orders,0)/PAGE_SIZE);
 const requested=Number(value);
 if(!Number.isInteger(requested)||requested<1||requested>pages){
  pageInput.value=String(pageIndex+1);pageInput.setAttribute('aria-invalid','true');
  pageStatus.textContent=pages?'Enter a page from 1 to '+pages+'.':'No progression pages are available.';
  return;
 }
 pageInput.removeAttribute('aria-invalid');pageStatus.textContent='';
 pageIndex=requested-1;render();
}
function choosePreset(name){
 presetButtons.forEach(button=>button.classList.toggle('active',button.dataset.preset===name));
 chordSource.value='cadence';chordDegrees=cadenceDegrees;updateKeyLabels();
 setupLengths(['4']);
 setupShapes([4],[patternValue(4,featuredPatterns[name])]);
 pageIndex=0;render();
}
function frequencyFromMidi(midi){return 440*Math.pow(2,(midi-69)/12)}
function scheduleChord(rootPc,degree,startTime,playback){
 const context=audio.context;
 const tones=degree.quality==='minor'?[0,3,7]:degree.quality==='diminished'?[0,3,6]:degree.quality==='augmented'?[0,4,8]:[0,4,7];
 const release=0.18;
 for(const tone of tones){
  const oscillator=context.createOscillator();
  const envelope=context.createGain();
  oscillator.type='triangle';
  oscillator.frequency.value=frequencyFromMidi(48+rootPc+degree.interval+tone);
  envelope.gain.setValueAtTime(0.0001,startTime);
  envelope.gain.exponentialRampToValueAtTime(0.09,startTime+0.045);
  envelope.gain.setValueAtTime(0.09,startTime+BAR_SECONDS-release);
  envelope.gain.exponentialRampToValueAtTime(0.0001,startTime+BAR_SECONDS-0.01);
  oscillator.connect(envelope);envelope.connect(context.destination);
  oscillator.start(startTime);oscillator.stop(startTime+BAR_SECONDS);playback.nodes.push(oscillator);
 }
}
function stopPlayback(message='Playback stopped.'){ 
 const playback=audio.playback;
 if(!playback)return;
 clearTimeout(playback.timer);
 playback.row.classList.remove('is-playing');
 playback.row.querySelectorAll('.chord-token').forEach(token=>token.classList.remove('is-playing'));
 playback.button.textContent='▶';playback.button.setAttribute('aria-label','Play progression in '+playback.row.dataset.tonicLabel);
 for(const oscillator of playback.nodes){try{oscillator.stop()}catch{}}
 audio.playback=null;
 if(message)playbackStatus.textContent=message;
}
async function playProgression(row,order){
 if(audio.playback?.row===row){stopPlayback();return}
 stopPlayback(null);
 const AudioContextType=window.AudioContext||window.webkitAudioContext;
 if(!AudioContextType){playbackStatus.textContent='Audio playback is not supported in this browser.';return}
 try{
  audio.context??=new AudioContextType();
  await audio.context.resume();
  const button=row.querySelector('.play-button');
  const rootPc=Number(row.dataset.rootPc);
  const keyChords=chordDegrees.map(item=>({...item,note:noteForKey(row.dataset.key,rootPc,item.interval,item.letterStep)}));
  const playback={row,button,nodes:[],timer:null,barIndex:0,beatIndex:0};
  audio.playback=playback;
  row.classList.add('is-playing');button.textContent='■';button.setAttribute('aria-label','Stop progression');
  const tick=()=>{
   if(audio.playback!==playback)return;
   const degreeIndex=order[playback.barIndex];
   if(playback.beatIndex===0){
    row.querySelectorAll('.chord-token').forEach((token,index)=>token.classList.toggle('is-playing',index===playback.barIndex));
    scheduleChord(rootPc,chordDegrees[degreeIndex],audio.context.currentTime+0.02,playback);
   }
   playbackStatus.textContent='BAR '+(playback.barIndex+1)+' / '+order.length+' · BEAT '+(playback.beatIndex+1)+' / '+BEATS_PER_BAR+' · '+chordName(degreeIndex,keyChords);
   playback.beatIndex++;
   if(playback.beatIndex===BEATS_PER_BAR){playback.beatIndex=0;playback.barIndex++}
   if(playback.barIndex===order.length)playback.timer=setTimeout(()=>stopPlayback('Playback complete.'),BEAT_MS);
   else playback.timer=setTimeout(tick,BEAT_MS);
  };
  tick();
 }catch(error){stopPlayback(null);playbackStatus.textContent='Could not start audio playback: '+error.message}
}
function formattedRelated(order,keyChords){
 const variants=relatedVariants(order);
 return variants.length?variants.map(item=>item.label+': '+chordPath(item.order,keyChords)).join(' | '):'No distinct rotations or reversals.';
}
function tonicLabel(key){
 const mode=chordSource.value==='modes'?modes.find(item=>item.id===modeSelect.value):null;
 return key+(mode?' '+mode.name:' minor');
}
function expandedExportLine(key,rootPc,task,order){
 const keyChords=chordDegrees.map(degree=>({...degree,note:noteForKey(key,rootPc,degree.interval,degree.letterStep)}));
 const related=formattedRelated(order,keyChords);
 return tonicLabel(key)+' | '+task.length+' chords | '+romanPath(order)+' | '+chordPath(order,keyChords)+' | '+functionPath(order)+' | SOUND: '+soundProfile(order)+' | RELATED: '+related;
}
function downloadText(text,filename){
 const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');link.href=url;link.download=filename;link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function exportSelection(){
 const lengths=selectedLengthList();
 const shapes=selectedValues(combinationSelect);
 const tasks=selectedTasks(lengths,shapes);
 const totalPerKey=tasks.reduce((sum,task)=>sum+task.orders,0);
 const keysToExport=selectedKeys();
 const total=totalPerKey*keysToExport.length;
 if(!total)return;
 exportButton.disabled=true;exportStatus.textContent='Preparing TXT export for '+total.toLocaleString()+' progressions…';
 await new Promise(resolve=>setTimeout(resolve,20));
 const sourceName=chordSource.value==='modes'?modes.find(mode=>mode.id===modeSelect.value).name+' modal triads':'Andalusian six-chord palette';
 const paletteDefinition=chordDegrees.map(degree=>degree.roman+' ('+degree.role+')').join('; ');
 const lines=['CADENCE ATLAS — SELECTED PROGRESSION EXPORT','Chord source: '+sourceName,'Keys/tonics: '+keysToExport.map(([key])=>tonicLabel(key)).join(', '),'Lengths: '+(lengths.length?lengths.join(', '):'none'),'Chord palette: '+paletteDefinition,'Total progressions: '+total.toLocaleString(),''];
 const compact=total>EXPORT_EXPANSION_LIMIT;
 if(compact){
  lines.push('COMPLETE COMPACT EXPORT','This file exactly represents every selected progression. Each recipe includes every unique multiset permutation at ranks 0 through order_count - 1. Ranks use lexicographic order in the chord palette above. Expand a recipe by generating its distinct permutations; identical chord repeats are counted once.','');
  for(const [key,rootPc] of keysToExport){
   const keyChords=chordDegrees.map(degree=>({...degree,note:noteForKey(key,rootPc,degree.interval,degree.letterStep)}));
   lines.push('KEY: '+tonicLabel(key)+' — '+keyChords.map((chord,index)=>chordDegrees[index].roman+' '+chordName(index,keyChords)).join('; '));
  }
  lines.push('','RECIPES');
  for(const task of tasks)lines.push('Length '+task.length+' | '+patternLabel(task.counts)+' | ranks 0–'+(task.orders-1));
 }else{
  lines.push('EXPANDED PROGRESSIONS','Each line includes chord names, harmonic roles, a sound profile, and related orders.','');
  let written=0;
  for(const [key,rootPc] of keysToExport){
   for(const task of tasks){
    for(let rank=0;rank<task.orders;rank++){
     lines.push(expandedExportLine(key,rootPc,task,unrankPermutation(task.counts,rank)));
     written++;
     if(written%1000===0)await new Promise(resolve=>setTimeout(resolve,0));
    }
   }
  }
 }
 const date=new Date().toISOString().slice(0,10);
 downloadText(lines.join('\n'),compact?'cadence-atlas-complete-index-'+date+'.txt':'cadence-atlas-progressions-'+date+'.txt');
 exportStatus.textContent=compact?'Downloaded complete compact TXT index for '+total.toLocaleString()+' progressions.':'Downloaded expanded TXT with '+total.toLocaleString()+' progressions.';
 exportButton.disabled=false;
}
setupKeys();setupModes();setupLengths(['4']);setupShapes([4],[patternValue(4,featuredPatterns.andalusian)]);renderPalette();render();
keySelect.addEventListener('change',()=>{pageIndex=0;renderPalette();render()});
chordSource.addEventListener('change',()=>{
 const chosenLengths=selectedValues(lengthSelect);
 chordDegrees=chordSource.value==='modes'?modalChords(modeSelect.value):cadenceDegrees;
 setupLengths(chosenLengths);updateKeyLabels();setupShapes(selectedLengthList(),[ALL_SHAPES]);pageIndex=0;renderPalette();render();
});
modeSelect.addEventListener('change',()=>{
 renderPalette();
 if(chordSource.value==='modes'){chordDegrees=modalChords(modeSelect.value);setupShapes(selectedLengthList(),[ALL_SHAPES]);pageIndex=0;render()}
});
lengthSelect.addEventListener('change',()=>{
 const values=resolveSentinel(lengthSelect,ALL_LENGTHS,previousLengths);
 previousLengths=values;
 const priorShapes=resolveSentinel(combinationSelect,ALL_SHAPES,previousShapes);
 presetButtons.forEach(button=>button.classList.remove('active'));
 setupShapes(selectedLengthList(),priorShapes);
 pageIndex=0;render();
});
combinationSelect.addEventListener('change',()=>{
 resolveSentinel(combinationSelect,ALL_SHAPES,previousShapes);
 previousShapes=selectedValues(combinationSelect);
 presetButtons.forEach(button=>button.classList.remove('active'));
 pageIndex=0;render();
});
presetButtons.forEach(button=>button.addEventListener('click',()=>choosePreset(button.dataset.preset)));
groups.addEventListener('click',event=>{
 const button=event.target.closest('.play-button');
 if(!button)return;
 const row=button.closest('.sequence');
 playProgression(row,row.dataset.order.split(',').map(Number));
});
previousPage.addEventListener('click',()=>{pageIndex=Math.max(0,pageIndex-1);render()});
nextPage.addEventListener('click',()=>{pageIndex++;render()});
goPage.addEventListener('click',()=>goToPage(pageInput.value));
pageInput.addEventListener('keydown',event=>{if(event.key==='Enter')goToPage(pageInput.value)});
exportButton.addEventListener('click',()=>exportSelection().catch(error=>{exportButton.disabled=false;exportStatus.textContent='TXT export failed: '+error.message}));
window.addEventListener('pagehide',()=>stopPlayback(null));

