// Run with node --test tests/smart-review.test.cjs; no installed dependencies.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function setup(){
 const html=fs.readFileSync(path.join(__dirname,'../BIO201_Appendicular_Ready_To_Study.html'),'utf8');
 const script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/init\(\);\s*$/,'');
 const ctx=vm.createContext({console,window:{addEventListener(){}},document:{addEventListener(){}}});
 vm.runInContext(script,ctx);
 vm.runInContext(`const c={id:'x',name:'A',action:'B',origin:'C',insertion:'D'};const d={cards:[c],progress:{}};const t=1800000000000;const fields=n=>fieldKeys(c).map((key,i)=>({key,correct:i<n}));`,ctx);
 return code=>vm.runInContext(code,ctx);
}
test('partial scores and perfect mastery require no waiting or scheduled dates',()=>{
 const run=setup();
 for(const [n,state] of [[1,'partially_known'],[3,'well_known'],[0,'needs_review'],[4,'perfect']])assert.equal(run(`recordReview(d,c,fields(${n}),t).state`),state);
 assert.equal(run('d.progress.x.due'),undefined);
 assert.equal(run('d.progress.x.intervalMs'),undefined);
 assert.equal(run("smartPool(d,'learn',t).length"),1);
 run('d.progress.x.due=t+365*DAY');
 assert.equal(run("smartPool(d,'learn',t).length"),1);
 assert.equal(run("smartPool(d,'review',t).length"),0);
 assert.equal(run('dueLabel(d,c)'), 'Ready to study');
});
test('scope cannot earn untested credit; legacy states and new backups survive',()=>{
 const run=setup();
 assert.equal(run("recordReview(d,c,[{key:'name',correct:true}],t).state"),'partially_known');
 assert.equal(run("progressState({state:'known'})"),'well_known');
 assert.equal(run("progressState({state:'review'})"),'needs_review');
 // Import uses uid; supply crypto to the VM without needing a browser.
 run("globalThis.crypto={randomUUID:()=>String(Math.random())};const imported=importDeckObject({cards:[c],progress:d.progress})[0]");
 assert.ok(run('Object.values(imported.progress)[0].due===d.progress.x.due'));
});
test('priority, full-deck interleaving and bounded retries',()=>{
 const run=setup();
 run("const many={cards:Array.from({length:40},(_,i)=>({id:String(i),name:'N'})),progress:{}};for(let i=0;i<20;i++)many.progress[String(i)]={state:'needs_review',due:t-1000};const pool=smartPool(many,'learn',t)");
 assert.equal(run('pool.length'),40);
 assert.equal(run('new Set(pool.map(c=>c.id)).size'),40);
 assert.ok(run('pool.slice(0,3).every(c=>many.progress[c.id])'));
 assert.ok(run('!many.progress[pool[3].id]'));
 run("session={queue:['a','b','c','d'],retries:{}};enqueueRetry(c,{state:'needs_review',due:t+DAY})");
 assert.equal(run('session.queue[3]'),'x');
 run("session.queue=['a'];enqueueRetry(c,{state:'needs_review',due:t+DAY});session.queue=['a'];enqueueRetry(c,{state:'needs_review',due:t+DAY})");
 assert.equal(run('session.queue.length'),1);
 run("session={queue:[],retries:{}};enqueueRetry(c,{state:'needs_review',due:t+DAY})");
 assert.equal(run('session.queue.length'),0);
});

test('shuffle preserves the current card, feedback, draft DOM and queue membership',()=>{
 const run=setup();
 run("showToast=()=>{};renderStudy=()=>{throw Error('Must not discard the answer form')};Math.random=()=>0;session={queue:['a','b','c','d'],shown:true,retries:{b:1}};feedback={correct:false}");
 run('shuffleSession()');
 assert.equal(run('session.queue[0]'),'a');
 assert.equal(run('session.queue.slice().sort().join()'),'a,b,c,d');
 assert.notEqual(run('session.queue.join()'),'a,b,c,d');
 assert.ok(run('feedback.correct===false&&session.shown&&session.retries.b===1'));
 run("session.queue=['a','b'];shuffleSession()");
 assert.equal(run('session.queue.join()'),'a,b');
 run('session=null;shuffleSession()');
});

test('updater compares numeric release versions and rejects malformed versions',()=>{
 const run=setup();
 assert.equal(run("compareVersions('1.10.0','1.9.0')"),1);
 assert.equal(run("compareVersions('1.1.0','1.1.0')"),0);
 assert.equal(run("compareVersions('1.0.9','1.1.0')"),-1);
 assert.throws(()=>run("compareVersions('not a version','1.1.0')"));
});
test('published update manifest matches the exact HTML bytes and runtime version',()=>{
 const crypto=require('node:crypto');
 const bytes=fs.readFileSync(path.join(__dirname,'../BIO201_Appendicular_Ready_To_Study.html'));
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../update-manifest.json'),'utf8'));
 const html=bytes.toString('utf8');
 assert.equal(manifest.bytes,bytes.length);
 assert.equal(manifest.sha256,crypto.createHash('sha256').update(bytes).digest('hex'));
 assert.equal(manifest.version,html.match(/const APP_VERSION='([^']+)'/)[1]);
 assert.equal(manifest.version,html.match(/name="study-deck-version" content="([^"]+)"/)[1]);
});

test('shorter limits affect existing due dates without resetting results or postponing on increase',()=>{
 const run=setup();
 run("d.progress.x={state:'perfect',last:t,due:t+180*DAY,intervalMs:180*DAY,attempts:12};applyReviewLimit(d,2)");
 assert.equal(run('d.progress.x.due'),1800000000000+2*86400000);
 assert.ok(run('isDue(d,c,t+3*DAY)'));
 assert.equal(run('d.progress.x.attempts'),12);
 run('applyReviewLimit(d,60)');
 assert.equal(run('d.progress.x.due'),1800000000000+2*86400000);
 // Old records without explicit settings already use the default 30-day cap.
 run("delete d.reviewSettings;d.progress.x.due=t+180*DAY;applyReviewLimit(d,90)");
 assert.equal(run('d.progress.x.due'),1800000000000+30*86400000);
 run("globalThis.crypto={randomUUID:()=>String(Math.random())};const copy=importDeckObject({cards:[c],progress:d.progress,reviewSettings:d.reviewSettings})[0]");
 assert.equal(run('maxIntervalDays(copy)'),90);
 assert.ok(run('Object.values(copy.progress)[0].due===d.progress.x.due'));
});
test('iPad artifact and manifest are reproducible with the correct update channel',()=>{
 const {execFileSync}=require('node:child_process');
 execFileSync(process.execPath,[path.join(__dirname,'../scripts/prepare-update.cjs'),'--check']);
 const ipad=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.match(ipad,/const APP_EDITION='ipad'/);
 assert.match(ipad,/const UPDATE_FILE='index.html'/);
 assert.match(ipad,/const UPDATE_MANIFEST='ipad-update-manifest.json'/);
 assert.match(ipad,/Study-Deck\/ipad-compatible\//);
 assert.match(ipad,/viewport-fit=cover/);
 assert.match(ipad,/iPad compatibility layer/);
});

test('immediate practice preserves the original result and records only one real review',async()=>{
 const run=setup();
 run("d.id='deck';decks=[d];activeDeckId=d.id;renderStudy=()=>{};persist=async()=>{};session={kind:'all',queue:['x','later'],completed:0,correct:0,missed:0,retries:{},shown:false};feedback={correct:false,fields:fieldKeys(c).map(key=>({key,label:key,expected:c[key],entered:'wrong',correct:false}))};const original=JSON.stringify(feedback);const originalQueue=session.queue.join()");
 run('practiceThisCard()');
 assert.equal(run('feedback'),null);
 assert.equal(run('session.queue.join()'),run('originalQueue'));
 run('feedback={correct:true,fields:fields(4)};practiceThisCard();feedback={correct:true,fields:fields(4)}');
 await run('finishAnswer()');
 assert.equal(run('JSON.stringify(feedback)'),run('original'));
 assert.equal(run('session.completed'),0);
 assert.equal(run('Object.keys(d.progress).length'),0);
 await run('finishAnswer()');
 assert.equal(run('d.progress.x.attempts'),1);
 assert.equal(run('d.progress.x.state'),'needs_review');
 assert.equal(run('session.completed'),1);
});
test('flip practice restores the answer side, scope and queue without assigning a rating',()=>{
 const run=setup();
 run("d.id='deck';decks=[d];activeDeckId=d.id;renderStudy=()=>{};session={kind:'flip',queue:['x'],shown:true};quizScope='name';feedback=null;practiceThisCard()");
 assert.equal(run('session.kind'),'practice');
 assert.equal(run('quizScope'),'all');
 assert.equal(run('session.shown'),false);
 run('endCardPractice()');
 assert.equal(run('session.kind'),'flip');
 assert.equal(run('quizScope'),'name');
 assert.equal(run('session.shown'),true);
 assert.equal(run('session.queue.join()'),'x');
 assert.equal(run('Object.keys(d.progress).length'),0);
});
test('returning from practice rechecks a corrected answer but retains untouched manual grades',()=>{
 const run=setup();
 run("d.id='deck';d.labels={name:'Name'};decks=[d];activeDeckId=d.id;renderStudy=()=>{};session={kind:'all',queue:['x'],shown:false};quizScope='name';feedback={correct:true,fields:[{key:'name',label:'Name',expected:'A',entered:'accepted wording',correct:true}]};practiceThisCard();endCardPractice()");
 assert.equal(run('feedback.correct'),true);
 run("practiceThisCard();c.name='Corrected';endCardPractice()");
 assert.equal(run('feedback.fields[0].expected'),'Corrected');
 assert.equal(run('feedback.fields[0].entered'),'accepted wording');
 assert.equal(run('feedback.correct'),false);
});

test('card layout sanitizes imported settings and preserves field order in backups',()=>{
 const run=setup();
 run("c.layout={fieldOrder:['origin','bad','origin','name'],photoWidth:1000,stacked:true};const layout=cardLayout(c)");
 assert.equal(run('layout.fieldOrder.join()'),'origin,name,action,insertion');
 assert.equal(run('layout.photoWidth'),65);
 assert.ok(run('layout.stacked'));
 run("globalThis.crypto={randomUUID:()=>String(Math.random())};const importedLayout=importDeckObject({cards:[c]})[0].cards[0].layout");
 assert.equal(run('importedLayout.fieldOrder.join()'),'origin,name,action,insertion');
 assert.equal(run('importedLayout.photoWidth'),65);
 run("d.labels={};quizScope='all'");
 assert.equal(run('userFields(c,d).map(f=>f[0]).join()'),'origin,name,action,insertion');
});

test('resume restores drafts, feedback and queue without creating review attempts',()=>{
 const run=setup();
 run("d.id='deck';d.labels={};decks=[d];activeDeckId=d.id;session={kind:'all',queue:['x'],shown:false,completed:3,correct:1,missed:2,retries:{x:1},drafts:{name:'Line one\\nLine two'}};feedback={correct:false,fields:[{key:'name',expected:'A',entered:'Wrong',correct:false}]};quizScope='name';const snapshot=makeStudyBookmark(d);const restored=restoredStudyState(d,snapshot)");
 assert.equal(run('restored.session.queue.join()'),'x');
 assert.equal(run('restored.session.drafts.name'),'Line one\nLine two');
 assert.equal(run('restored.feedback.fields[0].entered'),'Wrong');
 assert.equal(run('restored.scope'),'name');
 assert.equal(run('restored.session.completed'),3);
 assert.equal(run('Object.keys(d.progress).length'),0);
});
test('resume filters removed cards and does not apply another card’s draft or feedback',()=>{
 const run=setup();
 run("d.id='deck';d.labels={};const snapshot={schema:1,deckId:d.id,session:{kind:'all',queue:['deleted','x'],drafts:{name:'old answer'},shown:true,feedback:{fields:[{key:'name',expected:'A',entered:'old answer',correct:true}]}}};const restored=restoredStudyState(d,snapshot)");
 assert.equal(run('restored.session.queue.join()'),'x');
 assert.equal(run('restored.feedback'),null);
 assert.equal(run('Object.keys(restored.session.drafts).length'),0);
 assert.equal(run('restored.session.shown'),false);
});
test('cleared bookmark wins over older saved sessions and imports remap card IDs',()=>{
 const run=setup();
 run("d.id='deck';d.labels={};d.studySession={schema:1,deckId:d.id,savedAt:1,session:{kind:'all',queue:['x'],retries:{x:1},scope:'all'}};studyBookmarks.set(d.id,{schema:1,deckId:d.id,savedAt:2,session:null})");
 assert.equal(run('hasStudyBookmark(d)'),false);
 run("globalThis.crypto={randomUUID:()=>String(Math.random())};const imported=importDeckObject(d)[0];const restored=restoredStudyState(imported,imported.studySession)");
 assert.ok(run('restored.session.queue[0]===imported.cards[0].id'));
 assert.equal(run('restored.session.retries[imported.cards[0].id]'),1);
});

test('FSRS state survives JSON reload, predicts forgetting and never gates the whole deck',()=>{
 const run=setup();
 run('recordReview(d,c,fields(4),t)');
 assert.ok(run('d.progress.x.fsrs.stability>0'));
 assert.equal(run('d.progress.x.fsrs.reps'),1);
 assert.ok(run('priority(d,c,t+30*DAY)>priority(d,c,t+DAY)'));
 run('d.progress=JSON.parse(JSON.stringify(d.progress));recordReview(d,c,fields(0),t+DAY)');
 assert.equal(run('d.progress.x.fsrs.reps'),2);
 assert.equal(run("smartPool(d,'learn',t+DAY).length"),1);
 assert.ok(run('Number.isFinite(d.progress.x.fsrs.stability)'));
 run("globalThis.crypto={randomUUID:()=>String(Math.random())};const copy=importDeckObject({cards:[c],progress:d.progress})[0]");
 assert.equal(run('Object.values(copy.progress)[0].fsrs.reps'),2);
});
test('answer parts support reorder, partial credit, labels, overrides and resume',()=>{
 const run=setup();
 assert.equal(run("answerParts('A; B\\n\\n C, D;').length"),3);
 run("const g=gradeField('origin','Origin','Long head: scapula; Lateral head: humerus; Medial head: shaft','Lateral head: humerus\\nLong head: scapula')");
 assert.equal(run('g.parts.filter(p=>p.correct).length'),2);
 assert.equal(run("gradeField('origin','O','Long head: scapula; Medial head: humerus','Long head: humerus; Medial head: scapula').parts.filter(p=>p.correct).length"),0);
 assert.equal(run("gradeField('origin','O','A; A','A').parts.filter(p=>p.correct).length"),1);
 run("c.name='A; B; C';c.action='';c.origin='';c.insertion='';const partial=gradeField('name','Name',c.name,'C; A');recordReview(d,c,[partial],t)");
 assert.equal(run('d.progress.x.score'),2/3);
 assert.equal(run('d.progress.x.state'),'partially_known');
 run("partial.parts[1].correct=true;partial.correct=true;d.labels={name:'Name'};const restored=restoreFeedback(JSON.parse(JSON.stringify({fields:[partial]})),c,d,'all')");
 assert.equal(run('restored.fields[0].parts[1].correct'),true);
});
test('accepted wording is card-specific, invalidated by edits, undoable and portable',()=>{
 const run=setup();
 run("const field={key:'origin',expected:'Original answer',entered:'Alternative wording'};rememberFieldAnswer(c,field,true)");
 assert.ok(run("remembersAnswer(c,'origin','Original answer','Alternative wording')"));
 assert.equal(run("remembersAnswer(c,'origin','Edited answer','Alternative wording')"),false);
 assert.equal(run("remembersAnswer({},'origin','Original answer','Alternative wording')"),false);
 run("globalThis.crypto={randomUUID:()=>String(Math.random())};const copy=importedCard(c)");
 assert.ok(run("remembersAnswer(copy,'origin','Original answer','Alternative wording')"));
 run('rememberFieldAnswer(c,field,false)');
 assert.equal(run("remembersAnswer(c,'origin','Original answer','Alternative wording')"),false);
});
test('rejected wording overrides matching, survives import, and can be accepted again',()=>{
 const run=setup();
 run("d.id='deck';decks=[d];activeDeckId=d.id;session={queue:[c.id]};const f=gradeField('name','Name','Example','Example');rememberFieldAnswer(c,f,false)");
 assert.equal(run("gradeField('name','Name','Example','Example').correct"),false);
 run("globalThis.crypto={randomUUID:()=>String(Math.random())};const copy=importedCard(JSON.parse(JSON.stringify(c)))");
 assert.ok(run("remembersAnswer(copy,'name','Example','Example','rejectedAnswers')"));
 run('rememberFieldAnswer(c,f,true)');
 assert.equal(run("gradeField('name','Name','Example','Example').correct"),true);
 run("rememberFieldAnswer(c,{key:'origin',expected:'One',entered:'One'},false)");
 assert.equal(run("gradeField('origin','Origin','One; Two','Two; One').parts.filter(p=>p.correct).length"),1);
 assert.equal(run("gradeField('action','Action','One','One').correct"),true);
});
test('smart shuffle respects recall bands, current card and pinned retries',()=>{
 const run=setup();
 run("const deck={cards:['a','b','c','d','e'].map(id=>({id})),progress:Object.fromEntries(['a','b','c','d','e'].map(id=>[id,{state:'perfect'}]))};priority=(d,c)=>({a:.1,b:.1,c:.9,d:.8,e:.2}[c.id]);const shuffled=smartShuffleQueue(['a','b','c','d','e'],deck,{d:0})");
 assert.equal(run('shuffled[0]'),'a');assert.equal(run('shuffled[1]'),'c');assert.equal(run('shuffled[3]'),'d');
 assert.equal(run('shuffled.slice().sort().join()'),'a,b,c,d,e');
});
test('perfect spot checks are sparse, unique and separated from first exposure',()=>{
 const run=setup();
 run("const deck={cards:Array.from({length:48},(_,i)=>({id:String(i)})),progress:{}};deck.cards.forEach(c=>deck.progress[c.id]={state:'perfect'});const checks=perfectSpotChecks(deck,deck.cards)");
 assert.equal(run('checks.length'),6);assert.equal(run('new Set(checks).size'),6);
 assert.ok(run('checks.every(id=>deck.cards.findIndex(c=>c.id===id)<=39)'));
 assert.equal(run('perfectSpotChecks(deck,deck.cards.slice(0,9)).length'),0);
 assert.equal(run("smartPool(deck,'learn').length"),48);
});
test('whole-deck queues regularly interleave Perfect cards without losing any cards',()=>{
 const run=setup();
 run("const mixedDeck={cards:Array.from({length:20},(_,i)=>({id:String(i)})),progress:{}};mixedDeck.cards.forEach((c,i)=>mixedDeck.progress[c.id]={state:i<4?'perfect':'needs_review'})");
 for(const kind of ['learn','all','flip']){
  run(`const q${kind}=smartPool(mixedDeck,'${kind}')`);
  assert.equal(run(`q${kind}.length`),20);
  assert.equal(run(`new Set(q${kind}.map(c=>c.id)).size`),20);
  assert.ok(run(`[4,9,14,19].every(i=>stateOf(mixedDeck,q${kind}[i].id)==='perfect')`));
 }
});
