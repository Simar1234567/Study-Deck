// Hosted iPad edition only; local HTML retains its existing file updater.
if('serviceWorker' in navigator&&['https:','http:'].includes(location.protocol)){
 let registration,activating=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(activating)location.reload()});
 const ready=navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>{registration=r;return r});
 ready.catch(()=>showToast('Offline installation unavailable. You can keep studying online.'));
 document.addEventListener('click',async event=>{
  if(!event.target.closest('[data-action="open-updates"]'))return;
  event.preventDefault();event.stopImmediatePropagation();
  try{
   const r=await ready;await r.update();
   if(r.installing)await new Promise(resolve=>{const worker=r.installing;worker.addEventListener('statechange',()=>{if(['installed','redundant'].includes(worker.state))resolve()})});
   if(!r.waiting){showToast('No newer app version is available.');return}
   if(session?.cardEdit){showToast('Save or cancel your card edits before updating.');return}
   if(confirm('Update Study Deck now? Your saved decks and study position will be kept.')){
    saveStudyBookmark();activating=true;r.waiting.postMessage('ACTIVATE_UPDATE');
   }
  }catch{showToast('Could not check for updates. Connect to the internet and try again.')}
 },true);
}
