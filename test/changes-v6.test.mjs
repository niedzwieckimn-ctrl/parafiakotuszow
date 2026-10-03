import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {fixture,notice} from './helpers.mjs';
import {validateContent} from '../netlify/lib/admin-content.mjs';
import {albumImages,photoCount} from '../community-album.mjs';
import {composeWord} from '../netlify/lib/daily-word.mjs';
import {checkPhoto} from '../admin/photos.mjs';
const album={title:'Odpust parafialny',date:'2026-10-03',published:true,image:'/assets/uploads/one.jpg',photos:['/assets/uploads/one.jpg'],description:'',author:'Autor zdjęć',license:'Zdjęcia własne parafii',source:'',w_spacerze:false};
test('Intentions need only date and masses; meaningful title supplied on server',()=>{
  const data=validateContent('intencje',{date:'2026-10-03',published:true,masses:[{time:'17:00',place:'Kościół w Kotuszowie',intention:'Za parafian'}]});assert.equal(data.title,'Msze i intencje — 03.10.2026');
});
test('Legacy photographs remain valid and do not acquire album fields',()=>{const {photos,...legacy}=album;assert.equal(validateContent('galeria',legacy).photos,undefined);assert.equal(albumImages(legacy).length,1);});
test('Album validation prevents traversal, duplicates, bad cover, over-limit and tour mixing',()=>{
  assert.doesNotThrow(()=>validateContent('galeria',album));
  for(const photos of [['/assets/../one.jpg'],['https://evil.example/photo.jpg'],['/assets/uploads/one.jpg','assets/uploads/one.jpg'],Array.from({length:31},(_,i)=>`/assets/uploads/a${i}.jpg`)])assert.throws(()=>validateContent('galeria',{...album,photos}));
  assert.throws(()=>validateContent('galeria',{...album,image:'/assets/uploads/other.jpg'}));assert.throws(()=>validateContent('galeria',{...album,photos:[...album.photos,'/assets/uploads/two.jpg'],w_spacerze:true}));
});
test('Public album safely filters untrusted paths and keeps order',()=>{assert.deepEqual(albumImages({photos:['/assets/uploads/a.jpg','/assets/uploads/b.webp','/assets/uploads/a.jpg','/assets/../c.jpg','https://evil.example/a.jpg']}),['/assets/uploads/a.jpg','/assets/uploads/b.webp']);assert.deepEqual(albumImages({photos:{length:2},image:'/assets/uploads/a.jpg'}),['/assets/uploads/a.jpg']);assert.deepEqual([1,3,12,20,22].map(photoCount),['1 zdjęcie','3 zdjęcia','12 zdjęć','20 zdjęć','22 zdjęcia']);});
test('Photo selection rejects unsupported files, empty files and over-20-MB originals',()=>{for(const file of [{type:'image/svg+xml',size:100},{type:'image/jpeg',size:0},{type:'image/jpeg',size:20*1024*1024+1}])assert.throws(()=>checkPhoto(file));assert.doesNotThrow(()=>checkPhoto({type:'image/jpeg',size:8*1024*1024}));});
test('Album of 20 real uploads is stored as one gallery entry; repeat uploads idempotent',async()=>{
  const f=await fixture(),session=await f.login(),paths=[];
  for(let i=0;i<20;i++){const bytes=await sharp({create:{width:40,height:30,channels:3,background:{r:i*10,g:100,b:150}}}).jpeg().toBuffer();const response=await f.request('upload',{...session,method:'POST',bytes,type:'image/jpeg'});assert.equal(response.status,201);const value=await response.json();paths.push(value.path);if(i===0){const count=f.github.calls.filter(c=>c.method==='PUT').length;const retry=await f.request('upload',{...session,method:'POST',bytes,type:'image/jpeg'});assert.equal((await retry.json()).path,value.path);assert.equal(f.github.calls.filter(c=>c.method==='PUT').length,count);}}
  const response=await f.request('content',{...session,method:'POST',data:{collection:'galeria',data:{...album,image:paths[0],photos:paths}}});assert.equal(response.status,201);const entry=await response.json();const saved=JSON.parse(f.github.files.get(`content/galeria/${entry.filename}`).bytes);assert.equal(saved.photos.length,20);
  assert.equal(f.github.calls.filter(c=>c.method==='PUT'&&!c.body.message.includes('[skip netlify]')).length,1);
});
test('All album images are checked on the server before saving any content',async()=>{const f=await fixture(),session=await f.login();f.github.seed('assets/uploads/one.jpg',Buffer.from('existing'));const response=await f.request('content',{...session,method:'POST',data:{collection:'galeria',data:{...album,photos:[...album.photos,'/assets/uploads/missing.jpg']}}});assert.equal(response.status,422);assert.ok(f.github.calls.every(c=>c.method==='GET'));});
test('Summary listing uses titles/dates, is bounded, paginated and authenticated',async()=>{
  const f=await fixture();assert.equal((await f.request('content?collection=ogloszenia&summaries=1')).status,401);const session=await f.login();
  for(let i=0;i<22;i++)f.github.seed(`content/ogloszenia/2026-10-${String(i+1).padStart(2,'0')}-notice.json`,{...notice,title:`Ogłoszenie ${i}`});
  const first=await (await f.request('content?collection=ogloszenia&summaries=1',session)).json();assert.equal(first.files.length,20);assert.equal(first.nextOffset,20);assert.ok(first.files.every(file=>file.title.startsWith('Ogłoszenie')));
  const second=await (await f.request('content?collection=ogloszenia&summaries=1&offset=20',session)).json();assert.equal(second.files.length,2);assert.equal(second.nextOffset,null);assert.equal((await f.request('content?collection=ogloszenia&summaries=1&offset=-1',session)).status,400);
});
test('Reflection responds to Gospel context and different readings do not reuse one slogan',()=>{
  const base=[{reference:'Hi 1,1-2',parts:['Czytanie'],text:'Czytanie'},{reference:'Ps 1,1-3',parts:['Ufam Tobie w każdej chwili.'],text:'Ufam Tobie w każdej chwili.'}];
  const gospel=text=>({reference:'Łk 11,27-28',parts:[text],text});
  const listen=composeWord({blocks:[...base,gospel('Błogosławieni są ci, którzy słuchają słowa Bożego i go zachowują.')]},{},'2026-10-10');
  const faith=composeWord({blocks:[...base,gospel('Gdybyście mieli wiarę jak ziarnko gorczycy.')]},{},'2026-10-04');
  assert.ok(listen.reflection.includes('słuchanie'));assert.ok(faith.reflection.includes('gorczycy'));assert.notEqual(listen.title,faith.title);assert.notEqual(listen.reflection,faith.reflection);
});
test('Public UI has no admin links or technical reflection labels; only one discovery section',async()=>{
  const root=new URL('../',import.meta.url),page=await readFile(new URL('index.html',root),'utf8'),script=await readFile(new URL('script.js',root),'utf8'),admin=await readFile(new URL('admin/index.html',root),'utf8');
  assert.ok(!/href=["'][^"']*admin\//.test(page));assert.ok(!page.includes('Słowo otuchy na dziś'));assert.ok(!script.includes('dailyWordReflectionLabel'));assert.equal((page.match(/class="home-discover/g)||[]).length,1);assert.ok(page.includes('nara_19440918_kotuszow'));assert.ok(admin.includes('data-new="galeria"'));assert.ok(!/Netlify|repozytorium|nazwie pliku/.test(admin));
  assert.equal((page.match(/id="communityGallery"/g)||[]).length,1);assert.ok(page.indexOf('id="communityGallery"')>page.indexOf('id="page-aktualnosci"'));assert.ok(page.indexOf('id="communityGallery"')<page.indexOf('id="municipalNews"'));assert.ok(!page.slice(page.indexOf('id="page-zwiedzanie"')).includes('id="communityGallery"'));
});
