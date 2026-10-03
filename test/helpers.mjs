import {createHash} from 'node:crypto';
import {passwordHash} from '../netlify/lib/admin-security.mjs';
import {createService} from '../netlify/lib/admin-service.mjs';
import {sanitizeImage} from '../netlify/lib/admin-runtime.mjs';
// Synthetic credentials ONLY for local isolated tests; never deployed or used by runtime.
export const testPassword='offline-test-password-only';
const encoded=passwordHash(testPassword);
export class MemoryStore {
  constructor(){this.entries=new Map();this.version=0;}
  async getWithMetadata(key){const entry=this.entries.get(key);return entry?structuredClone(entry):null;}
  async get(key){return (await this.getWithMetadata(key))?.data ?? null;}
  async setJSON(key,data,options={}) {
    const old=this.entries.get(key);
    if(options.onlyIfNew && old || options.onlyIfMatch && old?.etag!==options.onlyIfMatch)return {modified:false};
    this.entries.set(key,{data:structuredClone(data),etag:String(++this.version)});return {modified:true};
  }
  async delete(key){this.entries.delete(key);}
}
export function fakeGithub() {
  const files=new Map(),calls=[];let serial=0;
  const sha=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  const seed=(path,data)=>{const bytes=Buffer.isBuffer(data)?data:Buffer.from(JSON.stringify(data));files.set(path,{bytes,sha:sha(bytes)});};
  const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
  async function fetcher(url,options={}) {
    if(!url.startsWith('https://api.github.com/repos/niedzwieckim-ctrl/parafiakotuszow/contents/'))throw new Error('Unexpected GitHub destination');
    if(options.headers.Authorization!=='Bearer synthetic-github-token')return response({},401);
    const parsed=new URL(url),path=decodeURIComponent(parsed.pathname.split('/contents/')[1]);
    const method=options.method || 'GET';calls.push({method,path,body:options.body?JSON.parse(options.body):null});
    const current=files.get(path);
    if(method==='GET') {
      if(current){
        if(options.headers.Accept==='application/vnd.github.raw+json')return new Response(current.bytes);
        const large=current.bytes.length>1024*1024;
        return response({type:'file',sha:current.sha,size:current.bytes.length,encoding:large?'none':'base64',content:large?'':current.bytes.toString('base64')});
      }
      const children=[...files].filter(([name])=>name.startsWith(path+'/') && !name.slice(path.length+1).includes('/')).map(([name,item])=>({type:'file',name:name.split('/').pop(),sha:item.sha}));
      return response(children,children.length?200:404);
    }
    const body=JSON.parse(options.body);
    if(body.branch!=='main')return response({},422);
    if(current ? body.sha!==current.sha : !!body.sha)return response({},409);
    const commit={sha:createHash('sha1').update(String(++serial)).digest('hex')};
    if(method==='DELETE'){if(!current)return response({},404);files.delete(path);return response({commit});}
    if(method==='PUT'){seed(path,Buffer.from(body.content,'base64'));return response({content:{sha:files.get(path).sha},commit},201);}
    return response({},405);
  }
  return {files,calls,seed,fetcher};
}
export async function fixture(){
  const store=new MemoryStore(),github=fakeGithub();let clock=Date.now();
  const env={ADMIN_EMAIL:'admin@example.test',ADMIN_PASSWORD_HASH:await encoded,SESSION_SECRET:'ab'.repeat(32),ADMIN_ORIGIN:'https://parafia.example',GITHUB_TOKEN:'synthetic-github-token',GITHUB_OWNER:'niedzwieckim-ctrl',GITHUB_REPO:'parafiakotuszow',GITHUB_BRANCH:'main'};
  const handler=createService({env,getStore:()=>store,fetcher:github.fetcher,imageProcessor:sanitizeImage,now:()=>clock});
  const request=(path,{method='GET',cookie='',csrf='',data,bytes,type,origin=env.ADMIN_ORIGIN,ip='127.0.0.1'}={})=>handler(new Request(`${env.ADMIN_ORIGIN}/api/admin/${path}`,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...(method!=='GET'?{Origin:origin,'Content-Type':type || 'application/json'}:{} )},...(bytes?{body:bytes}:data!==undefined?{body:JSON.stringify(data)}:{})}),{ip});
  async function login(){const result=await request('login',{method:'POST',data:{email:env.ADMIN_EMAIL,password:testPassword}});if(result.status!==200)throw new Error(await result.text());return {cookie:result.headers.get('set-cookie').split(';')[0],...await result.json()};}
  return {store,github,env,handler,request,login,advance:ms=>{clock+=ms;}};
}
export const notice={title:'Spotkanie parafialne',date:'2026-10-03',published:true,category:'Wspólnota',pinned:true,summary:'Zapraszamy na spotkanie.',body:'Treść ogłoszenia.',image:''};
