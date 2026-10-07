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


test('Flow budgets under 10 credits choose a supported low-cost model and output size',()=>{
 const {budgetPlan}=require('../core.cjs'),video={provider:'flow',kind:'video',model:'Veo 3.1 - Fast',cost:20,duration:'8',quality:['720p']};
 assert.deepEqual(budgetPlan({provider:'flow',credits:8,reserved:0},video),{model:'Gemini Omni Flash 1.1',cost:6,duration:'8',quality:['360p'],note:'Tài khoản còn 8 credits: tự chọn Gemini Omni Flash 360p, 8s (6 credits).'});
 assert.equal(budgetPlan({provider:'flow',credits:5,reserved:0},video).duration,'6');
 assert.equal(budgetPlan({provider:'flow',credits:3,reserved:0},video),null);
 const image=budgetPlan({provider:'flow',credits:0,reserved:0},{provider:'flow',kind:'image',model:'Nano Banana Pro',cost:0});
 assert.equal(image.model,'Nano Banana 2 Lite');assert.equal(image.cost,0);
 assert.equal(budgetPlan({provider:'flow',credits:null,reserved:0},video),null);
});

test('Flow dispatch reserves the affordable model cost after one manual credit read',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hn-low-credit-')),store=new Store(path.join(dir,'workspace.json')),a=store.addAccount('Flow low');
 store.balance(a,8,'explicit check-all');a.lastSeen=Date.now();store.running=true;
 store.enqueue({provider:'flow',kind:'video',prompts:'A test scene',model:'Veo 3.1 - Fast',duration:8,cost:20,auto:true});
 const job=store.dispatch(a,'test-session');assert.ok(job);assert.equal(job.model,'Gemini Omni Flash 1.1');assert.equal(job.duration,'8');assert.equal(job.quality[0],'360p');assert.equal(job.cost,6);assert.equal(a.reserved,6);assert.match(job.budgetNote,/dưới 10|còn 8 credits/i);
});
