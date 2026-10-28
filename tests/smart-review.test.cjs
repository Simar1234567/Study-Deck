// Run with node --test tests/smart-review.test.cjs; no installed dependencies.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function setup(){
 const html=fs.readFileSync(path.join(__dirname,'../BIO201_Appendicular_Ready_To_Study.html'),'utf8');
 const script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace(/init\(\);\s*$/,'');
 const ctx=vm.createContext({console,document:{addEventListener(){}}});
 vm.runInContext(script,ctx);
 vm.runInContext(`const c={id:'x',name:'A',action:'B',origin:'C',insertion:'D'};const d={cards:[c],progress:{}};const t=1800000000000;const fields=n=>fieldKeys(c).map((key,i)=>({key,correct:i<n}));`,ctx);
 return code=>vm.runInContext(code,ctx);
}
test('partial scores, missed fields, spaced mastery and early practice',()=>{
 const run=setup();
 assert.equal(run('recordReview(d,c,fields(1),t).state'),'partially_known');
 assert.equal(run('recordReview(d,c,fields(3),t+1000).state'),'well_known');
 assert.ok(run('d.progress.x.intervalMs<=DAY'));
 assert.equal(run('recordReview(d,c,fields(0),t+2000).state'),'needs_review');
 assert.equal(run('recordReview(d,c,fields(4),t+3000).state'),'well_known');
 assert.equal(run('recordReview(d,c,fields(4),t+4000).state'),'well_known');
 assert.equal(run('recordReview(d,c,fields(4),t+DAY+4000).state'),'perfect');
 assert.equal(run("smartPool(d,'learn',t+DAY+4000).length"),0);
 assert.equal(run("smartPool(d,'all',t).length"),1);
 run('const before=d.progress.x.intervalMs;recordReview(d,c,fields(4),t+DAY+5000)');
 assert.ok(run('d.progress.x.intervalMs<=before'));
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
test('priority, new-card interleaving, session cap and bounded spaced retries',()=>{
 const run=setup();
 run("const many={cards:Array.from({length:40},(_,i)=>({id:String(i),name:'N'})),progress:{}};for(let i=0;i<20;i++)many.progress[String(i)]={state:'needs_review',due:t-1000};const pool=smartPool(many,'learn',t)");
 assert.equal(run('pool.length'),20);
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
