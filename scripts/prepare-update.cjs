// Run after editing the HTML: node scripts/prepare-update.cjs 1.1.1
// In CI/tests: node scripts/prepare-update.cjs --check
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const root=path.join(__dirname,'..'),file=path.join(root,'BIO201_Appendicular_Ready_To_Study.html'),manifestPath=path.join(root,'update-manifest.json');
let html=fs.readFileSync(file,'utf8');const arg=process.argv[2];
if(arg&&arg!=='--check'){
 if(!/^\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(arg))throw Error('Use a version such as 1.1.1');
 html=html.replace(/name="study-deck-version" content="[^"]+"/,`name="study-deck-version" content="${arg}"`).replace(/const APP_VERSION='[^']+';/,`const APP_VERSION='${arg}';`);
 fs.writeFileSync(file,html);
}
const version=html.match(/name="study-deck-version" content="([^"]+)"/)?.[1];
if(!version||html.match(/const APP_VERSION='([^']+)'/)?.[1]!==version)throw Error('HTML metadata and APP_VERSION must match.');
const bytes=fs.readFileSync(file);const manifest={version,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};
if(arg==='--check'){
 const actual=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 if(JSON.stringify(actual)!==JSON.stringify(manifest))throw Error('Update manifest is stale; run node scripts/prepare-update.cjs');
 console.log('Update manifest matches HTML version, SHA-256 and byte count.');
}else{fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');console.log('Prepared update '+version)}
