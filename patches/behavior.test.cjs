const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {Store}=require('../core.cjs');
const {accountExpression,configureExpression,prepareExpression}=require('../chrome-direct.cjs');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');

function element(label,attrs={}){
 const values={...attrs};
 return {tagName:'BUTTON',innerText:label,textContent:label,title:'',value:'',disabled:false,classList:{contains:()=>false},getClientRects:()=>[1],getAttribute:n=>values[n]??null,setAttribute:(n,v)=>values[n]=v,matches:s=>s.includes('textarea')||s.includes('input'),closest:()=>null,querySelectorAll:()=>[],focus(){},dispatchEvent(){}};
}

test('Flow account reader captures email and correctly recognizes zero credits',()=>{
 const nodes=['hoai@example.com','AI credits: 0'].map(s=>({...element(s),tagName:'DIV'}));
 const value=vm.runInNewContext(accountExpression,{document:{querySelectorAll:()=>nodes,querySelector:()=>null},getComputedStyle:()=>({visibility:'visible'})});
 assert.equal(value.email,'hoai@example.com');assert.equal(value.credits,0);assert.equal(value.loggedIn,true);
});

test('image prompt preparation chooses an image input and returns the selected files',()=>{
 const prompt=element('');prompt.tagName='TEXTAREA';prompt.value='';
 const input=element('');input.tagName='INPUT';input.accept='image/*';input.multiple=true;input.name='reference_images';
 const doc={querySelectorAll:s=>s.startsWith('textarea')?[prompt]:s==='input[type=file]'?[input]:[]};
 const proto={};Object.defineProperty(proto,'value',{set(v){prompt.value=v;}});
 const image={name:'ref.png',type:'image/png',data:'data:image/png;base64,AA=='};
 const expr=prepareExpression({provider:'flow',prompt:'A portrait',references:[image],startImage:null,endImage:null});
 const result=vm.runInNewContext(expr,{document:doc,HTMLTextAreaElement:{prototype:proto},HTMLInputElement:{prototype:proto},Event:class{},InputEvent:class{},crypto:{randomUUID:()=> 'upload-1'}});
 assert.equal(prompt.value,'A portrait');assert.equal(result.ok,true);assert.equal(result.needsManual,false);assert.equal(result.uploads.length,1);assert.equal(result.uploads[0].images[0].name,image.name);assert.equal(result.uploads[0].images[0].data,image.data);
});

test('Flow control automation chooses image/video mode, model, ratio, duration and quality',async()=>{
 const current={mode:'Video',model:'Veo 3.1 - Lite',ratio:'16:9',duration:'4 s',quality:'1080p'};let openMenu='';const all=[];
 const control=(kind,role,label)=>{const attrs={'role':role};if(kind==='model')attrs['aria-label']='Model';if(kind==='ratio')attrs['aria-label']='Aspect ratio';if(kind==='duration')attrs['aria-label']='Duration';if(kind==='quality')attrs['aria-label']='Quality';const e=element(label,attrs);e.click=()=>{if(role==='tab'){current.mode=label;attrs['aria-selected']='true';}else if(role==='option'){current[e.kind]=label;openMenu='';}else openMenu=kind;};e.kind=kind;all.push(e);return e;};
 const tabs=['Video','Image'].map(label=>{const e=control('mode','tab',label);e.getAttribute=n=>n==='role'?'tab':n==='aria-selected'?(current.mode===label?'true':'false'):null;return e;});
 const models=()=>control('model','combobox',current.model),ratios=()=>control('ratio','combobox',current.ratio),durations=()=>control('duration','combobox',current.duration),qualities=()=>control('quality','combobox',current.quality);
 // Replace accumulated controls with a live view that reflects the current values.
 const makeControls=()=>{const list=[...tabs,models(),ratios(),durations(),qualities()];if(openMenu){const value=openMenu==='model'?'Veo 3.1 - Fast':openMenu==='ratio'?'9:16':openMenu==='duration'?'8 s':openMenu==='quality'?'720p':'';if(value)list.push(control(openMenu,'option',value));}return list;};
 const document={querySelectorAll:()=>makeControls()};
 const expr=configureExpression({kind:'video',model:'Veo 3.1 - Fast',ratio:'9:16',duration:'8',quality:['720p']});
 const result=await vm.runInNewContext(expr,{document,setTimeout,Promise});
 assert.equal(result.ok,true,JSON.stringify(result));assert.equal(current.model,'Veo 3.1 - Fast');assert.equal(current.ratio,'9:16');assert.equal(current.duration,'8 s');assert.equal(current.quality,'720p');
});

