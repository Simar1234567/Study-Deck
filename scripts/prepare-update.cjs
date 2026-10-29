// Both editions share one source. Run after edits: node scripts/prepare-update.cjs 1.2.0
// Check release artifacts without writing: node scripts/prepare-update.cjs --check
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),name='BIO201_Appendicular_Ready_To_Study.html',file=path.join(root,name);
let html=fs.readFileSync(file,'utf8');const arg=process.argv[2];
if(arg&&arg!=='--check'){
 if(!/^\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(arg))throw Error('Use a version such as 1.2.0');
 html=html.replace(/name="study-deck-version" content="[^"]+"/,`name="study-deck-version" content="${arg}"`).replace(/const APP_VERSION='[^']+';/,`const APP_VERSION='${arg}';`);
 fs.writeFileSync(file,html);
}
const version=html.match(/name="study-deck-version" content="([^"]+)"/)?.[1];
if(!version||html.match(/const APP_VERSION='([^']+)'/)?.[1]!==version)throw Error('HTML metadata and APP_VERSION must match.');
const css=fs.readFileSync(path.join(root,'styles/ipad.css'),'utf8');
const ipad=html.replace('width=device-width,initial-scale=1','width=device-width,initial-scale=1,viewport-fit=cover')
 .replace('</style>',css+'\n</style>')
 .replace('name="study-deck-edition" content="desktop"','name="study-deck-edition" content="ipad"')
 .replace("const APP_EDITION='desktop';","const APP_EDITION='ipad';")
 .replace("const UPDATE_BASE='https://raw.githubusercontent.com/Simar1234567/Study-Deck/main/';","const UPDATE_BASE='https://raw.githubusercontent.com/Simar1234567/Study-Deck/ipad-compatible/';")
 .replace("const UPDATE_FILE='BIO201_Appendicular_Ready_To_Study.html';","const UPDATE_FILE='index.html';")
 .replace("const UPDATE_MANIFEST='update-manifest.json';","const UPDATE_MANIFEST='ipad-update-manifest.json';");
function emit(filename,contents){const target=path.join(root,filename);if(arg==='--check'){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==contents)throw Error(filename+' is stale. Run node scripts/prepare-update.cjs');}else fs.writeFileSync(target,contents)}
function manifest(contents){const bytes=Buffer.from(contents,'utf8');return JSON.stringify({version,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},null,2)+'\n'}
emit('index.html',ipad);emit('update-manifest.json',manifest(html));emit('ipad-update-manifest.json',manifest(ipad));
console.log(arg==='--check'?'Both editions and update manifests match the shared source.':'Prepared desktop and iPad release '+version);
