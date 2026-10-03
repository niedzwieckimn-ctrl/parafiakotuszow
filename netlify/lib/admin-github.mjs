import {fail,HttpError} from './admin-security.mjs';
import {contentPath,mediaPath} from './admin-content.mjs';
export function createGithub(env,fetcher=fetch) {
  const {GITHUB_TOKEN:token,GITHUB_OWNER:owner,GITHUB_REPO:repo,GITHUB_BRANCH:branch}=env;
  if(!token || !/^[a-zA-Z0-9_-]+$/.test(owner || '') || !/^[a-zA-Z0-9_.-]+$/.test(repo || '') || !branch || branch.length>200 || /[\s\x00-\x1f?\[\\]/.test(branch)) fail(503,'Zapis nie jest jeszcze gotowy. Skontaktuj się z osobą opiekującą się stroną.');
  const base=`https://api.github.com/repos/${owner}/${repo}`;
  const deadline=AbortSignal.timeout(25000);
  async function api(path,options={}) {
    const {raw=false,...fetchOptions}=options;
    let response;try {response=await fetcher(base+path,{...fetchOptions,headers:{Accept:raw?'application/vnd.github.raw+json':'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'Parafia-Kotuszow-Admin','Content-Type':'application/json',...options.headers},signal:AbortSignal.any([deadline,AbortSignal.timeout(15000)]),redirect:'error'});}catch{fail(502,'Nie udało się połączyć. Spróbuj ponownie.');}
    if(response.status===404) fail(404,'Nie znaleziono wpisu lub zdjęcia.');
    if([409,422].includes(response.status)) fail(409,'Nie można teraz zapisać zmian. Wpis mógł być zmieniony w innym miejscu. Twoja treść pozostała w formularzu.');
    if([401,403].includes(response.status)) fail(502,'Zapis jest niedostępny. Skontaktuj się z osobą opiekującą się stroną.');
    if(response.status===429) fail(429,'Zbyt wiele zapytań. Spróbuj za chwilę.');
    if(!response.ok) fail(502,'Nie udało się wykonać tej czynności. Spróbuj ponownie.');
    return response.status===204 ? null : raw ? Buffer.from(await response.arrayBuffer()) : response.json();
  }
  const encoded=path=>path.split('/').map(encodeURIComponent).join('/');
  async function file(path) {
    const result=await api(`/contents/${encoded(path)}?ref=${encodeURIComponent(branch)}`);
    if(result.type!=='file') fail(422,'Nieobsługiwany typ pliku.');
    if(result.encoding==='base64' && typeof result.content==='string')return {sha:result.sha,bytes:Buffer.from(result.content,'base64')};
    if(result.encoding==='none' && result.size<=2*1024*1024)return {sha:result.sha,bytes:await api(`/contents/${encoded(path)}?ref=${encodeURIComponent(branch)}`,{raw:true})};
    fail(422,'Nieobsługiwany lub zbyt duży plik.');
  }
  return {
    async list(name) {
      contentPath(name,'check.json');
      let result;try {result=await api(`/contents/content/${name}?ref=${encodeURIComponent(branch)}`);}catch(error){if(error instanceof HttpError && error.status===404)return [];throw error;}
      if(!Array.isArray(result) || result.length>=1000) fail(422,'Kolekcja jest zbyt duża dla tego panelu.');
      return result.filter(item=>item.type==='file' && item.name.endsWith('.json')).map(item=>({filename:item.name,sha:item.sha}));
    },
    async read(name,filename) {
      const result=await file(contentPath(name,filename));
      if(result.bytes.length>64*1024) fail(422,'Wpis jest za duży.');
      try {return {filename,sha:result.sha,data:JSON.parse(result.bytes.toString('utf8'))};}catch{fail(422,'Plik nie zawiera poprawnego JSON.');}
    },
    async exists(path) {try {await file(mediaPath(path));return true;}catch(error){if(error instanceof HttpError && error.status===404)return false;throw error;}},
    async media(path) {
      const clean=mediaPath(path);
      if(!clean.startsWith('assets/uploads/')) fail(400,'Podgląd dotyczy tylko biblioteki zdjęć.');
      return (await file(clean)).bytes;
    },
    async save(name,filename,data,sha) {
      const path=contentPath(name,filename);
      const result=await api(`/contents/${encoded(path)}`,{method:'PUT',body:JSON.stringify({branch,message:`Panel parafii: zapis ${path}`,content:Buffer.from(JSON.stringify(data,null,2)+'\n').toString('base64'),...(sha?{sha}:{})})});
      return {filename,sha:result.content.sha,commit:result.commit.sha};
    },
    async remove(name,filename,sha) {
      const path=contentPath(name,filename);
      const result=await api(`/contents/${encoded(path)}`,{method:'DELETE',body:JSON.stringify({branch,sha,message:`Panel parafii: usunięcie ${path}`})});
      return {commit:result.commit.sha};
    },
    async upload(filename,bytes) {
      const path=mediaPath(`assets/uploads/${filename}`);
      try{const existing=await file(path);if(!existing.bytes.equals(bytes))fail(409,'Zdjęcie zmieniło się od poprzedniego przesłania.');return {path:`/${path}`,commit:'',alreadyUploaded:true};}catch(error){if(!(error instanceof HttpError&&error.status===404))throw error;}
      const result=await api(`/contents/${encoded(path)}`,{method:'PUT',body:JSON.stringify({branch,message:`Panel parafii: zdjęcie ${filename} [skip netlify]`,content:bytes.toString('base64')})});
      return {path:`/${path}`,commit:result.commit.sha};
    }
  };
}
