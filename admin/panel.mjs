import {collections,places} from './schema.mjs';
import {warsawDay,readingsUrl} from '../calendar.mjs';
import {validAutomaticWord,DAILY_WORD_ENDPOINT} from '../daily-word-client.mjs';
import {preparePhoto,checkPhoto,MAX_ALBUM_PHOTOS} from './photos.mjs';
const $=selector=>document.querySelector(selector);
const el=(tag,properties={})=>Object.assign(document.createElement(tag),properties);
const state={csrf:'',expiresAt:0,collection:'ogloszenia',files:[],nextOffset:null,filename:null,sha:null,dirty:false,busy:false,objects:[],photos:[]};
const schema=()=>collections.find(c=>c.name===state.collection);
const dateLabel=date=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date.split('-').reverse().join('.') : '';
const actionLabels={ogloszenia:'Dodaj ogłoszenie',intencje:'Wpisz intencje',galeria:'Dodaj zdjęcia','slowo-na-dzis':'Dodaj poprawkę'};
let automaticPreview=null,previewSequence=0,previewDate='';
function message(text,error=false){const target=$(state.csrf?'#dashboardStatus':'#loginStatus');target.textContent=text;target.className=`status ${error?'error':'success'}`;}
function busy(value){state.busy=value;for(const id of ['loginButton','saveEntry','saveDraft','deleteEntry','newEntry','logout','confirmDelete','moreEntries'])$('#'+id).disabled=value;for(const selector of ['#collectionTabs','#editorFields','#entryList','.quick-actions'])$(selector).inert=value;$('#editorForm').setAttribute('aria-busy',String(value));}
async function api(path,options={}){
  const response=await fetch(`/api/admin/${path}`,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options.body&&!(options.body instanceof Blob)?{'Content-Type':'application/json'}:{}),...(options.method&&options.method!=='GET'&&state.csrf?{'X-CSRF-Token':state.csrf}:{}),...options.headers}});
  let value;try{value=await response.json();}catch{value={error:response.status===429?'Za dużo prób. Spróbuj za chwilę.':'Nie udało się połączyć. Spróbuj ponownie.'};}
  if(!response.ok){if(response.status===401&&path!=='login')showLogin('Zaloguj się ponownie. Niezapisane zmiany zachowano.');const error=new Error(value.error||'Nie udało się wykonać tej czynności.');error.status=response.status;throw error;}
  return value;
}
function showLogin(text=''){state.csrf='';previewSequence++;automaticPreview=null;$('#dashboard').hidden=true;$('#loginScreen').hidden=false;$('#password').value='';$('#loginStatus').textContent=text;}
function allowLeaving(){return !state.dirty||window.confirm('Masz niezapisane zmiany. Opuścić je?');}
async function enter(session){
  const recovering=state.dirty;
  state.csrf=session.csrf;state.expiresAt=session.expiresAt;$('#loginScreen').hidden=true;$('#dashboard').hidden=false;$('#password').value='';$('#sessionInfo').textContent='Zalogowano. Możesz przygotować treści na stronę.';
  $('#collectionTabs').replaceChildren(...collections.map(c=>{const b=el('button',{type:'button',textContent:c.label});b.dataset.collection=c.name;b.addEventListener('click',()=>choose(c.name));return b;}));
  if(recovering){syncTabs();message('Możesz kontynuować niezapisany wpis.');return;}
  await choose(state.collection,true);
}
$('#loginForm').addEventListener('submit',async event=>{event.preventDefault();busy(true);try{await enter(await api('login',{method:'POST',body:JSON.stringify({email:$('#email').value,password:$('#password').value})}));}catch(error){message(error.message,true);}finally{busy(false);$('#password').value='';}});
$('#showPassword').addEventListener('click',()=>{const reveal=$('#password').type==='password';$('#password').type=reveal?'text':'password';$('#showPassword').textContent=reveal?'Ukryj':'Pokaż';$('#showPassword').setAttribute('aria-pressed',String(reveal));$('#showPassword').setAttribute('aria-label',reveal?'Ukryj hasło':'Pokaż hasło');});
$('#logout').addEventListener('click',async()=>{if(state.busy||!allowLeaving())return;busy(true);try{await api('logout',{method:'POST',body:'{}'});clearEditor();showLogin('Wylogowano.');}catch(error){message(error.message,true);}finally{busy(false);}});
function clearEditor(){for(const url of state.objects)URL.revokeObjectURL(url);state.objects=[];state.photos=[];state.filename=null;state.sha=null;state.dirty=false;$('.workspace').classList.remove('is-editing');$('#editorForm').hidden=true;$('#editorFields').replaceChildren();$('#editorTitle').textContent='Wybierz wpis lub dodaj nowy';}
function syncTabs(){for(const tab of $('#collectionTabs').children){const active=tab.dataset.collection===state.collection;tab.classList.toggle('active',active);tab.setAttribute('aria-current',String(active));}}
async function choose(name,force=false){
  if((state.busy&&!force)||(!force&&!allowLeaving()))return false;
  state.collection=name;clearEditor();state.files=[];state.nextOffset=null;renderList();$('#collectionTitle').textContent=schema().label;$('#entrySearch').value='';syncTabs();
  previewSequence++;automaticPreview=null;$('#automaticWordPreview').hidden=name!=='slowo-na-dzis';$('#automaticContent').hidden=true;$('#newEntry').textContent=actionLabels[name];
  $('#editorHint').textContent=name==='slowo-na-dzis'?'Dzisiejszy tekst pojawia się sam. Tutaj możesz go przeczytać lub poprawić.':'Wybierz wcześniejszy wpis z listy albo dodaj nowy.';
  busy(true);try{await loadList();message('');}catch(error){message(error.message,true);}finally{busy(false);}
  if(name==='slowo-na-dzis'&&state.csrf)loadAutomaticPreview();return true;
}
async function loadList(append=false){
  const offset=append?state.nextOffset:0;if(offset===null)return;
  const result=await api(`content?collection=${encodeURIComponent(state.collection)}&summaries=1&offset=${offset}`);
  state.files=append?[...state.files,...result.files]:result.files;state.nextOffset=result.nextOffset;renderList();
}
function renderList(){
  const query=$('#entrySearch').value.toLocaleLowerCase('pl');const files=state.files.filter(file=>`${file.title||''} ${dateLabel(file.date)}`.toLocaleLowerCase('pl').includes(query));
  $('#entryList').replaceChildren(...files.map(file=>{const b=el('button',{type:'button',className:`entry-button ${state.filename===file.filename?'active':''}`});b.append(el('strong',{textContent:file.title||'Wpis parafialny'}),el('small',{textContent:[dateLabel(file.date),file.published?'Na stronie':'Nieopublikowany'].filter(Boolean).join(' · ')}));b.addEventListener('click',()=>openEntry(file.filename));return b;}));
  if(!files.length)$('#entryList').append(el('p',{textContent:query?'Nie znaleziono wpisów.':'Nie dodano jeszcze wpisów.'}));$('#moreEntries').hidden=state.nextOffset===null;
}
$('#entrySearch').addEventListener('input',renderList);
$('#moreEntries').addEventListener('click',async()=>{if(state.busy)return;busy(true);try{await loadList(true);}catch(error){message(error.message,true);}finally{busy(false);}});
async function openEntry(filename){if(state.busy||!allowLeaving())return;busy(true);try{const result=await api(`content?collection=${encodeURIComponent(state.collection)}&filename=${encodeURIComponent(filename)}`);edit(result.data,filename,result.sha);message('Możesz poprawić treść i opublikować zmiany.');}catch(error){message(error.message,true);}finally{busy(false);}}
function newEntry(){if(state.busy||!allowLeaving())return;const date=warsawDay();edit({date,published:false,verifiedAt:date,calendarScope:'PL-SANDOMIERZ-KOTUSZOW',readingsUrl:readingsUrl(date),masses:[{time:'',place:places[0],intention:''}]});message('');}
$('#newEntry').addEventListener('click',newEntry);
for(const b of document.querySelectorAll('[data-new]'))b.addEventListener('click',async()=>{if(state.busy)return;if(state.collection===b.dataset.new)newEntry();else if(await choose(b.dataset.new))newEntry();});
function massRow(data={}){
  const row=el('div',{className:'mass-row'}),top=el('div',{className:'mass-row-top'});
  for(const [name,label,type] of [['time','Godzina','time'],['place','Miejsce','select']]){const wrap=el('label',{textContent:label});let input;if(type==='select'){input=el('select',{name});for(const place of places)input.append(el('option',{value:place,textContent:place}));}else input=el('input',{name,type,required:true});input.value=data[name]||(name==='place'?places[0]:'');wrap.append(input);top.append(wrap);}
  const label=el('label',{textContent:'Intencja'});label.append(el('textarea',{name:'intention',value:data.intention||'',required:true,maxLength:4000,placeholder:'Wpisz intencję tej Mszy świętej'}));
  const remove=el('button',{type:'button',textContent:'Usuń tę Mszę'});remove.addEventListener('click',()=>{row.remove();state.dirty=true;});row.append(top,label,remove);return row;
}
const validImage=path=>/^\/?assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(path||'');
const imageUrl=path=>/^\/?assets\/uploads\//.test(path)?`/api/admin/media?path=${encodeURIComponent(path)}`:'/'+path.replace(/^\//,'');
function preview(path,img){img.hidden=!validImage(path);if(!img.hidden)img.src=imageUrl(path);}
function albumField(data){
  const wrap=el('section',{className:'album-editor'}),label=el('label',{htmlFor:'albumFiles',textContent:'Wybierz zdjęcia — możesz zaznaczyć wiele naraz'}),input=el('input',{id:'albumFiles',type:'file',multiple:true,accept:'image/jpeg,image/png,image/webp'}),grid=el('div',{id:'albumThumbnails',className:'album-thumbnails'});
  const paths=data.photos?.length?data.photos:data.image?[data.image]:[];state.photos=paths.filter(validImage).map(path=>({path,url:imageUrl(path)}));
  input.addEventListener('change',()=>{
    const files=[...input.files];try{files.forEach(checkPhoto);const fresh=files.filter(file=>!state.photos.some(p=>p.key===`${file.name}/${file.size}/${file.lastModified}`));if(state.photos.length+fresh.length>MAX_ALBUM_PHOTOS)throw new Error('W jednym albumie możesz dodać do 30 zdjęć.');
      for(const file of fresh){const url=URL.createObjectURL(file);state.objects.push(url);state.photos.push({file,url,key:`${file.name}/${file.size}/${file.lastModified}`});}state.dirty=true;renderAlbum();message(`Wybrano ${state.photos.length} zdjęć. Kliknij „Opublikuj”, gdy album będzie gotowy.`);
    }catch(error){message(error.message,true);}finally{input.value='';}
  });
  const more=el('button',{id:'toggleAlbumPreview',type:'button',hidden:true});more.addEventListener('click',()=>{grid.classList.toggle('expanded');renderAlbum();});
  wrap.append(label,input,el('p',{className:'field-hint',textContent:'Do 30 zdjęć. Pierwsze będzie okładką. Zdjęcia zmniejszymy za Ciebie.'}),grid,more);return wrap;
}
function renderAlbum(){
  const grid=$('#albumThumbnails');if(!grid)return;
  const more=$('#toggleAlbumPreview');more.hidden=state.photos.length<=6;more.textContent=grid.classList.contains('expanded')?'Pokaż mniej zdjęć':`Pokaż wszystkie zdjęcia (${state.photos.length})`;more.setAttribute('aria-expanded',String(grid.classList.contains('expanded')));
  grid.replaceChildren(...state.photos.map((photo,index)=>{const card=el('div',{className:'album-thumbnail'}),image=el('img',{src:photo.url,alt:`Zdjęcie ${index+1}`}),status=el('small',{textContent:index===0?'Okładka':`Zdjęcie ${index+1}`}),actions=el('div');
    if(index){const cover=el('button',{type:'button',textContent:'Na okładkę'});cover.addEventListener('click',()=>{state.photos.splice(index,1);state.photos.unshift(photo);state.dirty=true;renderAlbum();});actions.append(cover);}
    const remove=el('button',{type:'button',textContent:'Usuń',className:'danger'});remove.setAttribute('aria-label',`Usuń zdjęcie ${index+1}`);remove.addEventListener('click',()=>{state.photos.splice(index,1);state.dirty=true;renderAlbum();});actions.append(remove);card.append(image,status,actions);return card;}));
}
function edit(data,filename=null,sha=null){
  clearEditor();state.filename=filename;state.sha=sha;$('#editorTitle').textContent=filename?'Popraw wpis':({ogloszenia:'Nowe ogłoszenie',intencje:'Intencje na wybrany dzień',galeria:'Nowy album','slowo-na-dzis':'Popraw słowo na wybrany dzień'})[state.collection];$('#editorForm').hidden=false;$('#deleteEntry').hidden=!filename;
  const details=el('details',{className:'extra-options'});details.append(el('summary',{textContent:'Dodatkowe ustawienia'}));
  const advanced=new Set(state.collection==='ogloszenia'?['category','summary','image']:state.collection==='galeria'?['source','w_spacerze']:state.collection==='intencje'?[]:['cycle','calendarNote','verifiedAt','reviewed','localCalendarVerified','readingsUrl']);
  for(const field of schema().fields){
    if(state.collection==='galeria'&&field.name==='photos')continue;
    const wrap=el('div',{className:'editor-field'});
    if(state.collection==='galeria'&&field.name==='image'){wrap.append(albumField(data));$('#editorFields').append(wrap);continue;}
    if(field.type==='masses'){const list=el('div',{id:'massList'});for(const mass of data.masses||[{}])list.append(massRow(mass));const add=el('button',{type:'button',textContent:'+ Dodaj kolejną Mszę'});add.addEventListener('click',()=>{if(list.children.length>=30)return;list.append(massRow());state.dirty=true;});wrap.append(list,add);}
    else{
      const hidden=field.type==='hidden'||field.name==='published'||state.collection==='intencje'&&field.name==='title';
      let input;if(field.type==='textarea')input=el('textarea');else if(field.type==='select'){input=el('select');for(const option of field.options)input.append(el('option',{value:option,textContent:option}));}else input=el('input',{type:hidden?'hidden':field.type==='image'?'text':field.type==='checkbox'?'checkbox':field.type==='date'?'date':field.type==='url'?'url':'text'});
      input.id=`field-${field.name}`;input.name=field.name;
      if(field.type==='checkbox')input.checked=data[field.name]??field.default??false;else input.value=data[field.name]??field.default??'';
      if(!hidden&&field.type!=='checkbox'){input.required=!field.optional;input.maxLength=field.type==='textarea'?(field.name==='body'?20000:field.name==='reflection'?1200:4000):500;}
      if(state.collection==='ogloszenia'&&field.name==='summary')input.required=false;
      if(state.collection==='ogloszenia'&&field.name==='body'){input.required=true;input.value=data.body||data.summary||'';input.placeholder='Wpisz treść ogłoszenia…';input.className='notice-text';}
      const label=el('label',{htmlFor:input.id,textContent:field.name==='body'?'Treść ogłoszenia':field.label});
      if(hidden)wrap.append(input);else if(field.type==='checkbox'){label.className='checkbox';label.prepend(input);wrap.append(label);}else wrap.append(label,input);
      if(field.type==='image'){
        input.className='sr-only';input.tabIndex=-1;input.required=false;
        const upload=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp'});upload.setAttribute('aria-label','Wybierz zdjęcie lub plakat');const img=el('img',{className:'image-preview',alt:'Wybrane zdjęcie'});preview(input.value,img);
        upload.addEventListener('change',async()=>{const file=upload.files[0];if(!file)return;busy(true);state.dirty=true;try{message('Przygotowujemy zdjęcie…');const blob=await preparePhoto(file),result=await api('upload',{method:'POST',headers:{'Content-Type':blob.type},body:blob});input.value=result.path;const url=URL.createObjectURL(blob);state.objects.push(url);img.src=url;img.hidden=false;message('Zdjęcie gotowe. Opublikuj ogłoszenie, aby pokazać je na stronie.');}catch(error){message(error.message,true);}finally{upload.value='';busy(false);}});
        const remove=el('button',{type:'button',textContent:'Usuń zdjęcie'});remove.addEventListener('click',()=>{input.value='';img.hidden=true;state.dirty=true;});wrap.append(upload,img,remove);
      }
      if(state.collection==='galeria'&&field.name==='license')wrap.append(el('p',{className:'field-hint',textContent:'Np. „Zdjęcia własne parafii” — tylko jeśli masz prawo do ich publikacji.'}));
    }
    (advanced.has(field.name)?details:$('#editorFields')).append(wrap);
  }
  if(details.children.length>1)$('#editorFields').append(details);
  renderAlbum();renderList();state.dirty=false;$('.workspace').classList.add('is-editing');if(matchMedia('(max-width:800px)').matches)$('#editorTitle').scrollIntoView({block:'start',behavior:'instant'});
}
$('#editorForm').addEventListener('input',()=>{state.dirty=true;});
function readForm(published){
  const data={};for(const field of schema().fields){if(field.type==='photos')continue;if(state.collection==='galeria'&&field.name==='image'){data.image=state.photos[0]?.path||'';continue;}if(field.type==='masses'){data.masses=[...$('#massList').children].map(row=>Object.fromEntries(['time','place','intention'].map(name=>[name,row.querySelector(`[name="${name}"]`).value])));}else{const input=$(`#field-${field.name}`);data[field.name]=field.type==='checkbox'?input.checked:input.value;}}
  data.published=published;
  if(state.collection==='ogloszenia'&&!data.summary.trim())data.summary=data.body.trim().split(/\n/)[0].slice(0,240);
  if(state.collection==='galeria')data.photos=state.photos.map(p=>p.path);
  return data;
}
$('#editorForm').addEventListener('submit',async event=>{
  event.preventDefault();if(state.busy)return;
  if(!$('#editorForm').checkValidity()){for(const details of $('#editorFields').querySelectorAll('details'))if(details.querySelector(':invalid'))details.open=true;$('#editorForm').reportValidity();return;}
  if(state.collection==='intencje'&&!$('#massList').children.length){message('Dodaj przynajmniej jedną Mszę świętą.',true);return;}
  if(state.collection==='galeria'&&!state.photos.length){message('Wybierz przynajmniej jedno zdjęcie.',true);return;}
  busy(true);state.dirty=true;
  try{
    if(state.collection==='galeria')for(let i=0;i<state.photos.length;i++){const photo=state.photos[i];if(photo.path)continue;message(`Przesyłamy zdjęcie ${i+1} z ${state.photos.length}. Pozostaw panel otwarty…`);photo.blob??=await preparePhoto(photo.file);const result=await api('upload',{method:'POST',headers:{'Content-Type':photo.blob.type},body:photo.blob});photo.path=result.path;photo.blob=null;}
    const published=event.submitter!==$('#saveDraft'),result=await api('content',{method:'POST',body:JSON.stringify({collection:state.collection,filename:state.filename,sha:state.sha,data:readForm(published)})});
    state.filename=result.filename;state.sha=result.sha;state.dirty=false;$('#deleteEntry').hidden=false;$('#editorTitle').textContent='Popraw wpis';message(published?'Opublikowano. Zmiany pojawią się na stronie za chwilę.':'Zapisano. Wpis nie jest widoczny na stronie.');
    try{await loadList();}catch{message('Zapisano wpis. Nie udało się odświeżyć listy — otwórz tę zakładkę ponownie.');}
  }catch(error){message(`${error.message} Wpis pozostaje w formularzu.`,true);}finally{busy(false);}
});
$('#deleteEntry').addEventListener('click',()=>{if(state.busy)return;$('#deleteDescription').textContent=$('#field-title')?.value||dateLabel($('#field-date')?.value);$('#deleteDialog').showModal();});
$('#cancelDelete').addEventListener('click',()=>$('#deleteDialog').close());
$('#confirmDelete').addEventListener('click',async()=>{busy(true);try{await api('content',{method:'DELETE',body:JSON.stringify({collection:state.collection,filename:state.filename,sha:state.sha})});$('#deleteDialog').close();clearEditor();await loadList();message('Usunięto wpis. Zniknie ze strony za chwilę.');}catch(error){message(error.message,true);}finally{busy(false);}});
async function loadAutomaticPreview(){
  const ticket=++previewSequence,date=warsawDay();previewDate=date;automaticPreview=null;$('#automaticContent').hidden=true;$('#automaticReadings').href=readingsUrl(date);$('#automaticCalendar').href=`https://gcatholic.org/calendar/${date.slice(0,4)}/PL-sand1-pl#${date.slice(5).replace('-','')}`;$('#automaticStatus').textContent='Pobieramy dzisiejsze słowo…';
  try{const response=await fetch(`${DAILY_WORD_ENDPOINT}?date=${date}`,{cache:'no-cache',signal:AbortSignal.timeout(18000)}),data=await response.json();if(ticket!==previewSequence||!state.csrf||state.collection!=='slowo-na-dzis'||date!==warsawDay())return;
    if(!response.ok||!validAutomaticWord(data.entry,date)){$('#automaticStatus').textContent='Dziś dostępny jest odnośnik do czytań. Możesz przygotować i sprawdzić własny wpis.';return;}
    automaticPreview=data.entry;$('#automaticContent').hidden=false;$('#automaticStatus').textContent='Ten tekst pojawia się na stronie sam — nie trzeba go publikować.';for(const [id,key] of [['automaticHeading','title'],['automaticDay','liturgicalDay'],['automaticReference','reference'],['automaticReflection','reflection']])$('#'+id).textContent=automaticPreview[key];$('#automaticQuote').textContent=`„${automaticPreview.quote}”`;
  }catch{if(ticket===previewSequence&&state.csrf&&state.collection==='slowo-na-dzis')$('#automaticStatus').textContent='Nie udało się pobrać słowa. Spróbuj ponownie za chwilę.';}
}
$('#correctAutomatic').addEventListener('click',async()=>{
  if(state.busy||!automaticPreview||automaticPreview.date!==warsawDay()||!allowLeaving())return;
  const data=Object.fromEntries(schema().fields.map(field=>[field.name,automaticPreview[field.name]??field.default??'']));Object.assign(data,{published:false,reviewed:false,localCalendarVerified:false,verifiedAt:warsawDay()});
  busy(true);try{let existing;try{existing=await api(`content?collection=slowo-na-dzis&filename=${data.date}.json`);}catch(error){if(error.status!==404)throw error;}
    if(existing){edit(existing.data,existing.filename,existing.sha);message('Otworzono wcześniej zapisaną poprawkę.');return;}
    edit(data);state.dirty=true;message('Popraw tekst. Przed publikacją potwierdź cytat i kalendarz w dodatkowych ustawieniach.');
  }catch(error){message(error.message,true);}finally{busy(false);}
});
window.addEventListener('beforeunload',event=>{if(state.dirty){event.preventDefault();event.returnValue='';}});
document.addEventListener('visibilitychange',async()=>{if(!document.hidden&&state.csrf&&!state.busy){try{const session=await api('session/me');state.csrf=session.csrf;state.expiresAt=session.expiresAt;}catch(error){message(error.message,true);}}});
setInterval(()=>{if(state.csrf&&Date.now()>=state.expiresAt&&!state.busy)showLogin('Zaloguj się ponownie. Niezapisane zmiany zachowano.');else if(state.csrf&&state.collection==='slowo-na-dzis'&&!state.busy&&previewDate!==warsawDay())loadAutomaticPreview();},30000);
try{await enter(await api('session/me'));}catch(error){showLogin(error.message==='Zaloguj się do panelu.'?'':error.message);}
