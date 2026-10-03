import {createHash} from 'node:crypto';
import {configuration,createAuth,requireOrigin,readJSON,bodyBytes,json,fail,safeHandler,sessionCookie,withWriteLock} from './admin-security.mjs';
import {collections} from '../../admin/schema.mjs';
import {collection,contentPath,mediaPath,validateContent,newFilename} from './admin-content.mjs';
import {createGithub} from './admin-github.mjs';
export const MAX_IMAGE_BYTES=2*1024*1024;
export function createService({env=process.env,getStore,fetcher=fetch,imageProcessor,now}={}) {
  return async (request,context={}) => safeHandler(async()=>{
    const path=new URL(request.url).pathname;
    const method=request.method;
    if(!['/api/admin/login','/api/admin/logout','/api/admin/session/me','/api/admin/content','/api/admin/upload','/api/admin/media'].includes(path)) fail(404,'Nieznany endpoint.');
    const cfg=configuration(env);
    const mutation=method!=='GET';
    if(mutation) requireOrigin(request,cfg);
    const store=getStore();
    const auth=createAuth(store,cfg,now);
    if(path==='/api/admin/login') {
      if(method!=='POST') fail(405,'Użyj POST.');
      const body=await readJSON(request,2048);
      const {token,session}=await auth.login(body.email,body.password,context.ip);
      return json({email:session.email,csrf:session.csrf,expiresAt:session.expiresAt},200,{'Set-Cookie':sessionCookie(token)});
    }
    const session=await auth.require(request,mutation);
    if(path==='/api/admin/session/me') {
      if(method!=='GET') fail(405,'Użyj GET.');
      return json({email:session.email,csrf:session.csrf,expiresAt:session.expiresAt,collections});
    }
    if(path==='/api/admin/logout') {
      if(method!=='POST') fail(405,'Użyj POST.');
      await auth.logout(request);
      return json({ok:true},200,{'Set-Cookie':sessionCookie('',0)});
    }
    const github=createGithub(env,fetcher);
    if(path==='/api/admin/media') {
      if(method!=='GET') fail(405,'Użyj GET.');
      const path=mediaPath(new URL(request.url).searchParams.get('path'));
      const types={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',avif:'image/avif'};
      return new Response(await github.media(path),{headers:{'Content-Type':types[path.split('.').pop().toLowerCase()],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
    }
    if(path==='/api/admin/upload') {
      if(method!=='POST') fail(405,'Użyj POST.');
      const allowed={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
      const type=request.headers.get('Content-Type');
      if(!allowed[type]) fail(415,'Dozwolone zdjęcia: JPG, PNG i WebP.');
      const bytes=await bodyBytes(request,MAX_IMAGE_BYTES);
      if(!bytes.length) fail(422,'Plik jest pusty.');
      // Decode and re-encode. Extension and browser MIME alone are never trusted.
      const clean=await imageProcessor(bytes,type);
      if(clean.length>MAX_IMAGE_BYTES) fail(413,'Zdjęcie po przetworzeniu jest za duże.');
      // Content-addressed filename makes a retry after connection loss idempotent.
      const filename=`photo-${createHash('sha256').update(clean).digest('hex')}.${allowed[type]}`;
      return withWriteLock(store,async()=>json(await github.upload(filename,clean),201));
    }
    if(method==='GET') {
      const query=new URL(request.url).searchParams,name=query.get('collection'),filename=query.get('filename');
      collection(name);
      if(filename)return json(await github.read(name,filename));
      const files=(await github.list(name)).sort((a,b)=>b.filename.localeCompare(a.filename,'pl'));
      if(query.get('summaries')!=='1')return json({files});
      const rawOffset=query.get('offset')||'0';
      if(!/^\d{1,4}$/.test(rawOffset)||Number(rawOffset)>files.length)fail(400,'Nieprawidłowa strona listy.');
      const offset=Number(rawOffset),page=files.slice(offset,offset+20),summaries=[];
      for(let i=0;i<page.length;i+=4) {
        summaries.push(...await Promise.all(page.slice(i,i+4).map(async item=>{
          const {data}=await github.read(name,item.filename);
          return {...item,title:typeof data.title==='string'?data.title:'Wpis parafialny',date:data.date,published:data.published===true};
        })));
      }
      return json({files:summaries,nextOffset:offset+20<files.length?offset+20:null});
    }
    if(!['POST','DELETE'].includes(method)) fail(405,'Użyj GET, POST lub DELETE.');
    const input=await readJSON(request),name=input.collection;
    collection(name);
    return withWriteLock(store,async()=>{
    if(method==='DELETE') {
      contentPath(name,input.filename);
      if(!/^[a-f0-9]{40}$/.test(input.sha || '')) fail(422,'Brak wersji usuwanego wpisu.');
      return json(await github.remove(name,input.filename,input.sha));
    }
    const data=validateContent(name,input.data);
    const filename=input.filename || newFilename(name,data);
    contentPath(name,filename);
    let merged=data;
    if(input.filename) {
      if(!/^[a-f0-9]{40}$/.test(input.sha || '')) fail(422,'Brak wersji edytowanego wpisu.');
      const current=await github.read(name,filename);
      if(current.sha!==input.sha) fail(409,'Wpis zmienił się w repozytorium. Otwórz go ponownie; Twoja treść pozostała w formularzu.');
      // Preserve fields introduced outside this panel, including provenance.
      merged={...current.data,...data};
    } else if(input.sha) fail(422,'Nowy wpis nie może zawierać SHA.');
    const images=[...new Set([data.image,...(data.photos||[])].filter(Boolean))];
    for(let i=0;i<images.length;i+=4) {
      const found=await Promise.all(images.slice(i,i+4).map(path=>github.exists(path)));
      if(found.some(value=>!value))fail(422,'Nie znaleziono zdjęcia. Wybierz je ponownie i spróbuj opublikować.');
    }
    if(['intencje','slowo-na-dzis'].includes(name) && data.published) {
      // Canonical dated files cannot change their date. Legacy non-dated filenames remain editable.
      if(/^\d{4}-\d{2}-\d{2}\.json$/.test(filename) && filename!==`${data.date}.json`) fail(422,'Ten plik jest przypisany do konkretnej daty. Dodaj nowy dzień zamiast zmieniać datę tego wpisu.');
      const entries=(await github.list(name)).filter(entry=>!/^\d{4}-\d{2}-\d{2}\.json$/.test(entry.filename) || entry.filename===`${data.date}.json`);
      if(entries.length>30) fail(422,'Zbyt wiele historycznych plików bez daty w nazwie. Uporządkuj nazwy w repozytorium.');
      for(const entry of entries) {
        if(entry.filename===filename) continue;
        const other=await github.read(name,entry.filename);
        if(other.data.date===data.date && other.data.published && (name!=='slowo-na-dzis' || other.data.reviewed && other.data.localCalendarVerified)) fail(409,'Istnieje już opublikowany wpis tego rodzaju na tę datę. Edytuj istniejący dzień.');
      }
    }
    return json(await github.save(name,filename,merged,input.sha),input.filename?200:201);
    });
  });
}
