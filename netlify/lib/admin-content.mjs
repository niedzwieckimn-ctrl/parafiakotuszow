import {randomUUID} from 'node:crypto';
import {collections,places} from '../../admin/schema.mjs';
import {fail} from './admin-security.mjs';
export function collection(name) {
  const value=collections.find(item=>item.name===name);
  if(!value) fail(400,'Nieznany rodzaj treści.');
  return value;
}
export function contentPath(name,filename) {
  collection(name);
  if(typeof filename !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,140}\.json$/.test(filename)) fail(400,'Nieprawidłowa nazwa pliku.');
  return `content/${name}/${filename}`;
}
export function mediaPath(path) {
  if(typeof path !== 'string' || !/^\/?assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(path)) fail(400,'Nieprawidłowa ścieżka zdjęcia.');
  return path.replace(/^\//,'');
}
export function dateValid(date) {
  return typeof date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(`${date}T12:00:00Z`).toISOString().slice(0,10)===date;
}
export function validateContent(name,input) {
  const schema=collection(name);
  if(!input || typeof input!=='object' || Array.isArray(input)) fail(422,'Niepoprawny wpis.');
  const allowed=new Set(schema.fields.map(f=>f.name));
  if(Object.keys(input).some(key=>!allowed.has(key))) fail(422,'Wpis zawiera nieobsługiwane pola.');
  const result={};
  for(const field of schema.fields) {
    let value=input[field.name] ?? field.default;
    if(field.type==='photos') {
      if(value===undefined)continue;
      if(!Array.isArray(value)||value.length>30||value.some(path=>typeof path!=='string'))fail(422,'Album może zawierać do 30 zdjęć.');
      value.forEach(mediaPath);
      if(new Set(value.map(mediaPath)).size!==value.length)fail(422,'To samo zdjęcie dodano więcej niż raz.');
      result.photos=value;continue;
    }
    if(field.type==='checkbox') {if(value !== undefined && typeof value!=='boolean') fail(422,`${field.label}: oczekiwano przełącznika.`);result[field.name]=value ?? false;continue;}
    if(field.type==='masses') {
      if(!Array.isArray(value) || !value.length || value.length>30) fail(422,'Dodaj od 1 do 30 Mszy w jednym dniu.');
      result.masses=value.map(mass=>{
        if(!mass || Object.keys(mass).some(key=>!['time','place','intention'].includes(key)) || typeof mass.time!=='string' || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(mass.time) || !places.includes(mass.place) || typeof mass.intention!=='string' || !mass.intention.trim() || mass.intention.length>4000) fail(422,'Uzupełnij poprawną godzinę, miejsce i intencję każdej Mszy.');
        return {time:mass.time,place:mass.place,intention:mass.intention.trim()};
      });continue;
    }
    if(value===undefined || value==='') {if(!field.optional) fail(422,`Uzupełnij: ${field.label}.`);result[field.name]='';continue;}
    const max=field.type==='textarea' ? (field.name==='body'?20000:4000) : 500;
    if(typeof value!=='string' || value.length>max || !value.trim() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) fail(422,`Nieprawidłowa wartość: ${field.label}.`);
    value=value.trim();
    if(field.type==='date' && !dateValid(value)) fail(422,`Nieprawidłowa data: ${field.label}.`);
    if(field.type==='select' && !field.options.includes(value)) fail(422,`Wybierz wartość: ${field.label}.`);
    if(field.type==='image') mediaPath(value);
    if(field.type==='url') {
      let url;try {url=new URL(value);}catch{fail(422,`Nieprawidłowy link: ${field.label}.`);}
      if(!['http:','https:'].includes(url.protocol) || url.username || url.password || (field.name==='readingsUrl' && url.protocol!=='https:')) fail(422,`Niebezpieczny link: ${field.label}.`);
    }
    result[field.name]=value;
  }
  if(name==='intencje'&&!result.title)result.title=`Msze i intencje — ${result.date.split('-').reverse().join('.')}`;
  if(name==='galeria'&&result.photos?.length) {
    if(!result.photos.includes(result.image))fail(422,'Zdjęcie główne musi należeć do albumu.');
    if(result.photos.length>1&&result.w_spacerze)fail(422,'Album uroczystości nie jest częścią zwiedzania kościoła. Dodaj tam osobne zdjęcie wnętrza lub detalu.');
  }
  if(name==='slowo-na-dzis') {
    if(result.calendarScope!=='PL-SANDOMIERZ-KOTUSZOW') fail(422,'Wymagany jest właściwy kalendarz parafii.');
    if(result.published && (!result.reviewed || !result.localCalendarVerified)) fail(422,'Przed publikacją potwierdź cytat oraz kalendarz diecezji i parafii. Możesz zapisać szkic.');
    if(result.quote.length>400 || result.reflection.length>1200) fail(422,'Słowo otuchy powinno być krótkie: cytat do 400, refleksja do 1200 znaków.');
    const reading=new URL(result.readingsUrl);
    if(reading.hostname==='mateusz.pl' && reading.pathname!==`/czytania/${result.date.slice(0,4)}/${result.date.replaceAll('-','')}.html`) fail(422,'Link do czytań Mateusza musi prowadzić do daty wpisu.');
  }
  return result;
}
export function newFilename(name,data) {
  if(['intencje','slowo-na-dzis'].includes(name)) return `${data.date}.json`;
  const slug=data.title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replaceAll('ł','l').replaceAll('Ł','l').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65) || 'wpis';
  return `${data.date}-${slug}-${randomUUID().slice(0,8)}.json`;
}
