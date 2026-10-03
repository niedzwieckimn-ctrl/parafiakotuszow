import {collections,places} from './schema.mjs';
const $=selector=>document.querySelector(selector);
const state={csrf:'',expiresAt:0,collection:'ogloszenia',files:[],filename:null,sha:null,dirty:false,busy:false,objects:[]};
const schema=()=>collections.find(c=>c.name===state.collection);
function message(text,error=false) {const target=$(state.csrf?'#dashboardStatus':'#loginStatus');target.textContent=text;target.className=`status ${error?'error':'success'}`;}
function busy(value) {state.busy=value;$('#loginButton').disabled=value;$('#saveEntry').disabled=value;$('#deleteEntry').disabled=value;$('#newEntry').disabled=value;$('#logout').disabled=value;$('#confirmDelete').disabled=value;$('#collectionTabs').inert=value;$('#editorFields').inert=value;$('#entryList').inert=value;}
async function api(path,options={}) {
  const response=await fetch(`/api/admin/${path}`,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options.body && !(options.body instanceof Blob)?{'Content-Type':'application/json'}:{}),...(options.method && options.method!=='GET' && state.csrf?{'X-CSRF-Token':state.csrf}:{}),...options.headers}});
  let value;try {value=await response.json();}catch{value={error:response.status===429?'Zbyt wiele zapytań. Spróbuj później.':'Usługa chwilowo niedostępna.'};}
  if(!response.ok) {
    if(response.status===401 && path!=='login') showLogin('Sesja wygasła. Zaloguj się ponownie.');
    throw new Error(value.error || `Błąd ${response.status}`);
  }
  return value;
}
function showLogin(text='') {state.csrf='';$('#dashboard').hidden=true;$('#loginScreen').hidden=false;$('#password').value='';$('#loginStatus').textContent=text;}
async function enter(session) {
  state.csrf=session.csrf;state.expiresAt=session.expiresAt;
  $('#loginScreen').hidden=true;$('#dashboard').hidden=false;$('#password').value='';
  $('#sessionInfo').textContent=`${session.email} · sesja do ${new Date(session.expiresAt).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Warsaw'})} (czas Polski)`;
  $('#collectionTabs').replaceChildren(...collections.map(c=>{const b=document.createElement('button');b.type='button';b.textContent=c.label;b.dataset.collection=c.name;b.addEventListener('click',()=>choose(c.name));return b;}));
  await choose(state.collection,true);
}
$('#loginForm').addEventListener('submit',async event=>{event.preventDefault();busy(true);try{const session=await api('login',{method:'POST',body:JSON.stringify({email:$('#email').value,password:$('#password').value})});await enter(session);}catch(error){message(error.message,true);}finally{busy(false);$('#password').value='';}});
$('#showPassword').addEventListener('click',()=>{const reveal=$('#password').type==='password';$('#password').type=reveal?'text':'password';$('#showPassword').textContent=reveal?'Ukryj':'Pokaż';$('#showPassword').setAttribute('aria-pressed',String(reveal));$('#showPassword').setAttribute('aria-label',reveal?'Ukryj hasło':'Pokaż hasło');});
function allowLeaving() {return !state.dirty || window.confirm('Masz niezapisane zmiany. Opuścić formularz?');}
$('#logout').addEventListener('click',async()=>{if(!allowLeaving())return;busy(true);try{await api('logout',{method:'POST',body:'{}'});state.dirty=false;clearEditor();showLogin('Wylogowano bezpiecznie.');}catch(error){message(error.message,true);}finally{busy(false);}});
function clearEditor() {for(const url of state.objects)URL.revokeObjectURL(url);state.objects=[];state.filename=null;state.sha=null;state.dirty=false;$('#editorForm').hidden=true;$('#editorFields').replaceChildren();$('#editorTitle').textContent='Wybierz wpis lub dodaj nowy';}
async function choose(name,force=false) {
  if(state.busy && !force || !force && !allowLeaving())return;
  state.collection=name;clearEditor();$('#collectionTitle').textContent=schema().label;$('#entrySearch').value='';
  for(const tab of $('#collectionTabs').children){const active=tab.dataset.collection===name;tab.classList.toggle('active',active);tab.setAttribute('aria-current',String(active));}
  $('#editorHint').textContent=name==='slowo-na-dzis'?'Wpis zmieni się automatycznie w dniu swojej daty (Europe/Warsaw). Publikuj dopiero po sprawdzeniu czytań i kalendarza lokalnego. Bez wpisu strona pokazuje tylko link do dzisiejszych czytań.':'Treść jest zapisywana w repozytorium. Szkice nie są widoczne na stronie, ale nie służą do przechowywania poufnych danych.';
  busy(true);try{await loadList();message('Wybierz wpis lub przygotuj nowy.');}catch(error){message(error.message,true);}finally{busy(false);}
}
async function loadList(){const result=await api(`content?collection=${encodeURIComponent(state.collection)}`);state.files=result.files.sort((a,b)=>b.filename.localeCompare(a.filename,'pl'));renderList();}
function renderList(){const query=$('#entrySearch').value.toLowerCase();const files=state.files.filter(file=>file.filename.toLowerCase().includes(query));$('#entryList').replaceChildren(...files.map(file=>{const b=document.createElement('button');b.type='button';b.className=`entry-button ${state.filename===file.filename?'active':''}`;b.textContent=file.filename.replace(/\.json$/,'');b.addEventListener('click',()=>openEntry(file.filename));return b;}));if(!files.length){const p=document.createElement('p');p.textContent='Brak wpisów.';$('#entryList').append(p);}}
$('#entrySearch').addEventListener('input',renderList);
async function openEntry(filename){if(state.busy || !allowLeaving())return;busy(true);try{const result=await api(`content?collection=${encodeURIComponent(state.collection)}&filename=${encodeURIComponent(filename)}`);edit(result.data,filename,result.sha);message('Wpis gotowy do edycji.');}catch(error){message(error.message,true);}finally{busy(false);}}
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
$('#newEntry').addEventListener('click',()=>{if(!allowLeaving())return;const date=today();edit({date,published:false,verifiedAt:date,calendarScope:'PL-SANDOMIERZ-KOTUSZOW',readingsUrl:`https://mateusz.pl/czytania/${date.slice(0,4)}/${date.replaceAll('-','')}.html`,masses:[{time:'',place:places[0],intention:''}]});message('Nowy wpis. Uzupełnij pola; zaznacz publikację, kiedy będzie gotowy.');});
function control(tag,attributes={}){const el=document.createElement(tag);Object.assign(el,attributes);return el;}
function massRow(data={}) {
  const row=control('div',{className:'mass-row'}),top=control('div',{className:'mass-row-top'});
  for(const [name,label,type] of [['time','Godzina','time'],['place','Miejsce','select']]) {
    const wrap=control('label',{textContent:label});let input;
    if(type==='select'){input=control('select',{name});for(const place of places)input.append(control('option',{value:place,textContent:place}));}
    else input=control('input',{name,type,required:true});
    input.value=data[name] || (name==='place'?places[0]:'');wrap.append(input);top.append(wrap);
  }
  const label=control('label',{textContent:'Intencja'});label.append(control('textarea',{name:'intention',value:data.intention || '',required:true,maxLength:4000}));
  const remove=control('button',{type:'button',textContent:'Usuń tę Mszę'});remove.addEventListener('click',()=>{row.remove();state.dirty=true;});
  row.append(top,label,remove);return row;
}
function preview(path,img){const valid=/^\/?assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(path);img.hidden=!valid;if(!valid)return;img.src=path.startsWith('/assets/uploads/') || path.startsWith('assets/uploads/') ? `/api/admin/media?path=${encodeURIComponent(path)}`:'/'+path.replace(/^\//,'');}
function edit(data,filename=null,sha=null){
  clearEditor();state.filename=filename;state.sha=sha;
  $('#editorTitle').textContent=filename?'Edytuj wpis':'Nowy wpis';$('#editorForm').hidden=false;$('#deleteEntry').hidden=!filename;
  for(const field of schema().fields){
    const wrap=control('div',{className:'editor-field'});
    if(field.type==='masses') {
      const title=control('h3',{textContent:field.label});const list=control('div',{id:'massList'});
      for(const mass of data.masses || [{}])list.append(massRow(mass));
      const add=control('button',{type:'button',textContent:'+ Dodaj Mszę'});add.addEventListener('click',()=>{if(list.children.length>=30)return;list.append(massRow());state.dirty=true;});wrap.append(title,list,add);
    } else {
      let input;
      if(field.type==='textarea') input=control('textarea');
      else if(field.type==='select'){input=control('select');for(const option of field.options)input.append(control('option',{value:option,textContent:option}));}
      else input=control('input',{type:field.type==='image'?'text':field.type==='checkbox'?'checkbox':field.type==='hidden'?'hidden':field.type==='date'?'date':field.type==='url'?'url':'text'});
      input.id=`field-${field.name}`;input.name=field.name;
      if(field.type==='checkbox')input.checked=data[field.name] ?? field.default ?? false;
      else input.value=data[field.name] ?? field.default ?? '';
      if(field.type!=='hidden' && field.type!=='checkbox') {input.required=!field.optional;input.maxLength=field.type==='textarea'?(field.name==='body'?20000:field.name==='quote'?400:field.name==='reflection'?1200:4000):500;}
      const label=control('label',{htmlFor:input.id,textContent:field.label});
      if(field.type==='checkbox'){label.className='checkbox';label.prepend(input);wrap.append(label);}
      else if(field.type==='hidden')wrap.append(input);
      else wrap.append(label,input);
      if(field.type==='image') {
        const upload=control('input',{type:'file',accept:'image/jpeg,image/png,image/webp',className:'image-upload'});upload.setAttribute('aria-label',`Prześlij: ${field.label}`);
        const hint=control('p',{className:'field-hint',textContent:'JPG, PNG lub WebP, do 2 MB. Plik trafia do biblioteki; zapis wpisu uruchomi publikację. Dodawaj tylko materiały z prawem do publikacji.'});
        const img=control('img',{className:'image-preview',alt:'Podgląd wybranego zdjęcia'});preview(input.value,img);
        input.addEventListener('change',()=>preview(input.value,img));
        upload.addEventListener('change',async()=>{const file=upload.files[0];if(!file)return;if(file.size>2*1024*1024){message('Zdjęcie przekracza 2 MB. Zmniejsz je przed wysłaniem.',true);upload.value='';return;}busy(true);try{const result=await api('upload',{method:'POST',headers:{'Content-Type':file.type},body:file});input.value=result.path;const url=URL.createObjectURL(file);state.objects.push(url);img.src=url;img.hidden=false;state.dirty=true;message('Zdjęcie zapisane w bibliotece. Zapisz wpis, aby opublikować je na stronie.');}catch(error){message(error.message,true);}finally{upload.value='';busy(false);}});
        wrap.append(upload,hint,img);
      }
    }
    $('#editorFields').append(wrap);
  }
  renderList();state.dirty=false;
}
$('#editorForm').addEventListener('input',()=>{state.dirty=true;});
function readForm(){const result={};for(const field of schema().fields){if(field.type==='masses'){result.masses=[...$('#massList').children].map(row=>Object.fromEntries(['time','place','intention'].map(name=>[name,row.querySelector(`[name="${name}"]`).value])));}else{const input=$(`#field-${field.name}`);result[field.name]=field.type==='checkbox'?input.checked:input.value;}}return result;}
$('#editorForm').addEventListener('submit',async event=>{event.preventDefault();busy(true);try{const result=await api('content',{method:'POST',body:JSON.stringify({collection:state.collection,filename:state.filename,sha:state.sha,data:readForm()})});state.filename=result.filename;state.sha=result.sha;state.dirty=false;$('#deleteEntry').hidden=false;$('#editorTitle').textContent='Edytuj wpis';await loadList();message(`Zapisano. Netlify opublikuje zmianę po budowaniu. Zapis: ${result.commit.slice(0,7)}.`);}catch(error){message(error.message,true);}finally{busy(false);}});
$('#deleteEntry').addEventListener('click',()=>{$('#deleteDescription').textContent=state.filename;$('#deleteDialog').showModal();});
$('#cancelDelete').addEventListener('click',()=>$('#deleteDialog').close());
$('#confirmDelete').addEventListener('click',async()=>{busy(true);try{await api('content',{method:'DELETE',body:JSON.stringify({collection:state.collection,filename:state.filename,sha:state.sha})});$('#deleteDialog').close();clearEditor();await loadList();message('Wpis usunięty. Netlify uruchomi publikację zmiany.');}catch(error){message(error.message,true);}finally{busy(false);}});
window.addEventListener('beforeunload',event=>{if(state.dirty){event.preventDefault();event.returnValue='';}});
document.addEventListener('visibilitychange',async()=>{if(!document.hidden && state.csrf){try{const session=await api('session/me');state.csrf=session.csrf;state.expiresAt=session.expiresAt;}catch(error){message(error.message,true);}}});
setInterval(()=>{if(state.csrf && Date.now()>=state.expiresAt)showLogin('Sesja wygasła. Zaloguj się ponownie.');},30000);
try{const session=await api('session/me');await enter(session);}catch(error){showLogin(error.message==='Zaloguj się do panelu.'?'':error.message);}
