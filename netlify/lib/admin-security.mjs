import { randomBytes, createHmac, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
export const SESSION_SECONDS = 4 * 60 * 60;
export const COOKIE = '__Host-parafia_admin';
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const fail = (status, message) => { throw new HttpError(status,message); };
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Netlify-CDN-Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
export function parseHash(value) {
  const parts = String(value || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt' || parts[1] !== '131072' || parts[2] !== '8' || parts[3] !== '1' || !/^[a-f0-9]{32}$/.test(parts[4]) || !/^[a-f0-9]{128}$/.test(parts[5])) fail(503,'Panel nie jest jeszcze gotowy. Skontaktuj się z osobą opiekującą się stroną.');
  return {salt:Buffer.from(parts[4],'hex'),key:Buffer.from(parts[5],'hex')};
}
export async function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 14 || Buffer.byteLength(password) > 256) throw new Error('Hasło musi mieć co najmniej 14 znaków i maksymalnie 256 bajtów.');
  const salt = randomBytes(16);
  const key = await derive(password,salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024});
  return `scrypt$131072$8$1$${salt.toString('hex')}$${key.toString('hex')}`;
}
export async function checkPassword(password, encoded) {
  const {salt,key} = parseHash(encoded);
  const actual = await derive(password,salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024});
  return timingSafeEqual(actual,key);
}
function equalText(a,b) {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left,right);
}
export function configuration(env) {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[a-f0-9]{64,128}$/i.test(env.SESSION_SECRET || '')) fail(503,'Panel nie jest jeszcze gotowy. Skontaktuj się z osobą opiekującą się stroną.');
  parseHash(env.ADMIN_PASSWORD_HASH);
  const origin = (()=>{try { return new URL(env.ADMIN_ORIGIN || env.URL).origin; } catch { return ''; }})();
  if (!origin.startsWith('https://')) fail(503,'Nie można otworzyć panelu pod tym adresem. Skontaktuj się z osobą opiekującą się stroną.');
  return {email,origin,hash:env.ADMIN_PASSWORD_HASH,secret:env.SESSION_SECRET};
}
export function requireOrigin(request, cfg) {
  if (new URL(request.url).origin !== cfg.origin || request.headers.get('Origin') !== cfg.origin || ['cross-site','same-site'].includes(request.headers.get('Sec-Fetch-Site'))) fail(403,'Żądanie spoza panelu zostało odrzucone.');
}
export async function bodyBytes(request, limit) {
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > limit)) fail(413,'Przesłany plik lub treść jest za duża.');
  const reader = request.body?.getReader();
  if (!reader) fail(400,'Brak danych.');
  const chunks=[]; let size=0;
  try { while (true) { const {done,value} = await reader.read(); if(done) break; size += value.length; if(size > limit) {await reader.cancel(); fail(413,'Przesłany plik lub treść jest za duża.');} chunks.push(Buffer.from(value)); } }
  finally {reader.releaseLock();}
  return Buffer.concat(chunks);
}
export async function readJSON(request,limit=64*1024) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') fail(415,'Oczekiwano danych JSON.');
  let value; try {value=JSON.parse((await bodyBytes(request,limit)).toString('utf8'));} catch(error) {if(error instanceof HttpError) throw error; fail(400,'Niepoprawne dane JSON.');}
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400,'Niepoprawny format danych.');
  return value;
}
export const sessionCookie = (token, seconds = SESSION_SECONDS) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${seconds}`;
export async function withWriteLock(store,callback) {
  const key='repository-write-lock';
  const previous=await store.getWithMetadata(key,{type:'json',consistency:'strong'});
  if(previous?.data?.expiresAt>Date.now()) fail(409,'Trwa inny zapis. Spróbuj ponownie za chwilę; formularz nie został wyczyszczony.');
  const owner=randomBytes(16).toString('hex');
  const acquired=await store.setJSON(key,{owner,expiresAt:Date.now()+90000},previous?{onlyIfMatch:previous.etag}:{onlyIfNew:true});
  if(!acquired.modified) fail(409,'Trwa inny zapis. Spróbuj ponownie za chwilę.');
  try {return await callback();} finally {
    try {const current=await store.getWithMetadata(key,{type:'json',consistency:'strong'});if(current?.data?.owner===owner)await store.setJSON(key,{owner,expiresAt:0},{onlyIfMatch:current.etag});}catch{ /* Expiring lease recovers after a storage failure. Never log credentials. */ }
  }
}
export function createAuth(store,cfg,now=()=>Date.now()) {
  const hash = value => createHmac('sha256',cfg.secret).update(value).digest('hex');
  const binding = hash(`${cfg.email}\n${cfg.hash}\n${cfg.origin}`);
  function tokenFrom(request) {
    const token=(request.headers.get('cookie') || '').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1);
    return /^[a-f0-9]{64}$/.test(token || '') ? token : null;
  }
  return {
    async login(email,password,ip) {
      if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || Buffer.byteLength(password) > 256 || !password) fail(400,'Podaj e-mail i hasło.');
      // Atomic cross-instance throttle, not a process-local Map.
      const key=`attempts/${hash(ip || 'unknown')}`;
      let allowed=false;
      for(let retry=0;retry<6;retry++) {
        const previous=await store.getWithMetadata(key,{type:'json',consistency:'strong'});
        const data=previous?.data;
        const count=data && data.resetAt > now() ? data.count : 0;
        if(count >= 10) fail(429,'Za dużo prób. Spróbuj ponownie za 15 minut.');
        const result=await store.setJSON(key,{count:count+1,resetAt:count ? data.resetAt : now()+900000},previous ? {onlyIfMatch:previous.etag} : {onlyIfNew:true});
        if(result.modified) {allowed=true;break;}
      }
      if(!allowed) fail(429,'Zbyt wiele jednoczesnych prób. Spróbuj później.');
      const passwordOK=await checkPassword(password,cfg.hash);
      if(!equalText(email.trim().toLowerCase(),cfg.email) || !passwordOK) fail(401,'Nieprawidłowy e-mail lub hasło.');
      const token=randomBytes(32).toString('hex'), csrf=randomBytes(32).toString('hex');
      const session={email:cfg.email,csrf,expiresAt:now()+SESSION_SECONDS*1000,binding};
      await store.setJSON(`sessions/${hash(token)}`,session);
      return {token,session};
    },
    async require(request,mutation=false) {
      const token=tokenFrom(request);
      if(!token) fail(401,'Zaloguj się do panelu.');
      const key=`sessions/${hash(token)}`;
      const session=await store.get(key,{type:'json',consistency:'strong'});
      if(!session || session.binding !== binding || session.expiresAt <= now()) {
        if(session) await store.delete(key);
        fail(401,'Sesja wygasła. Zaloguj się ponownie.');
      }
      if(mutation && !equalText(request.headers.get('X-CSRF-Token') || '',session.csrf)) fail(403,'Nieprawidłowe zabezpieczenie sesji. Odśwież panel.');
      return {...session,key};
    },
    async logout(request) { const session=await this.require(request,true);await store.delete(session.key); }
  };
}
export async function safeHandler(callback) {
  try {return await callback();} catch(error) {
    if(error instanceof HttpError) return json({error:error.message},error.status);
    // Never include upstream bodies, credentials, request data or exception text.
    return json({error:'Usługa chwilowo niedostępna. Spróbuj ponownie. Jeśli problem trwa, skontaktuj się z osobą opiekującą się stroną.'},503);
  }
}
