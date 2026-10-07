import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseReadings,parseCalendar,readingUse,createDailyWordService,GENERATOR_VERSION} from '../netlify/lib/daily-word.mjs';
import {MEMORIAL_SOURCE,parseMemorialConfirmation,matchingReadingReferences} from '../netlify/lib/memorial-readings.mjs';
import {validAutomaticWord,displayedWord,DAILY_WORD_ENDPOINT} from '../daily-word-client.mjs';

// Minimal synthetic markup reproduces source structure, not downloaded commentaries.
const date='2026-10-07',title='Najświętszej Maryi Panny Różańcowej';
const dateLabel=value=>new Intl.DateTimeFormat('pl-PL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
const weekday=value=>new Intl.DateTimeFormat('pl-PL',{weekday:'long',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
function primary(value=date) {
  return `<h1>${dateLabel(value)}</h1><p class="subtitle">${weekday(value)} XXVII tygodnia okresu zwykłego</p><section><h2>Czytania</h2><p>(Ga 2, 1-2. 7-14)<br>Pamiętajmy o ubogich.</p><p>(Ps 117 (116), 1b-2)<br>Chwalcie Pana, wszystkie narody.</p><p>Aklamacja (Rz 8, 15bc)<br>Otrzymaliście Ducha przybrania za synów.</p><p>(Łk 11, 1-4)<br>Panie, naucz nas się modlić.</p></section>`;
}
function confirmation(value=date,dayTitle='Wspomnienie Najśw. Maryi Panny Różańcowej') {
  return `<html><body><div class="data">${dateLabel(value)}</div><div class="period_name">${dayTitle}</div><div class="subsec czyt1">Pierwsze czytanie:<div>Ga 2,1-2.7-14</div></div><div class="subsec psalm">Psalm responsoryjny:<div>Ps 117 (116), 1b-2 (R.: por. Mk 16, 15)</div></div><div class="subsec ewangelia">Ewangelia:<div>Łk 11,1-4</div></div></body></html>`;
}
function calendar(value=date,observance=title,rank='W') {
  const year=value.slice(0,4);let ics=`BEGIN:VCALENDAR\r\nX-WR-CALNAME:Kalendarz liturgiczny ${year} (Sandomierz)\r\n`;
  for(let d=new Date(`${year}-01-01T12:00:00Z`);d.getUTCFullYear()===Number(year);d.setUTCDate(d.getUTCDate()+1)) {
    const key=d.toISOString().slice(0,10),compact=key.replaceAll('-','');
    ics+=`BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${compact}\r\nUID:${year}-pl-PL-sand1-${compact.slice(4)}-1@gcatholic.org\r\nSUMMARY:${key===value?`[${rank}] ${observance}`:`${weekday(key)} XXVII tygodnia zwykłego`}\r\nEND:VEVENT\r\n`;
  }
  return ics+'END:VCALENDAR';
}
function fixture({value=date,rank='W',observance=title,secondary=confirmation(value),failure=false,store=null}={}) {
  const calls=[];
  const handler=createDailyWordService({now:()=>new Date(value+'T12:00:00Z'),getStore:()=>store,fetcher:async(url,options)=>{
    calls.push({url,options});
    if(url===MEMORIAL_SOURCE){if(failure)throw new Error('Confirmation unavailable');return new Response(secondary);}
    return new Response(url.includes('.ics')?calendar(value,observance,rank):primary(value));
  }});
  return {calls,handler,request:()=>handler(new Request(`https://parafia.test${DAILY_WORD_ENDPOINT}?date=${value}`))};
}
test('7 October date, memorial and all reading references are corroborated',()=>{
  const readings=parseReadings(primary(),date),day=parseCalendar(calendar(),2026)[date];
  assert.equal(readingUse(day,readings,date),null);
  const verified=parseMemorialConfirmation(confirmation(),date);
  assert.ok(matchingReadingReferences(readings,verified));
  assert.equal(readingUse(day,readings,date,verified),'confirmed-memorial');
});
test('Acclamation is never merged with a psalm or labelled as its quotation',()=>{
  const readings=parseReadings(primary(),date);
  assert.equal(readings.blocks.length,4);
  assert.equal(readings.blocks[2].kind,'acclamation');
  assert.equal(readings.blocks[2].reference,'Rz 8, 15bc');
  assert.doesNotMatch(readings.blocks[1].text,/Ducha|Aklamacja/);
});
test('7 October service produces current word accepted by frontend, not manual or stale content',async()=>{
  const f=fixture(),response=await f.request(),body=await response.json();
  assert.equal(response.status,200);assert.ok(validAutomaticWord(body.entry,date));
  assert.equal(body.entry.liturgicalDay,title);assert.equal(body.entry.readingUse,'confirmed-memorial');
  assert.equal(body.entry.confirmationUrl,MEMORIAL_SOURCE);
  assert.equal(body.entry.reference,'Ps 117 (116), 1b-2');
  assert.equal(body.entry.quote,'Chwalcie Pana, wszystkie narody.');
  assert.equal(displayedWord([],body.entry,new Date(date+'T12:00:00Z')).mode,'automatic');
  assert.equal(f.calls.length,3);assert.ok(f.calls.every(call=>!call.options.headers.Authorization));
});
test('Confirmation rejects yesterday, another year, another memorial and any changed reading',async()=>{
  for(const wrong of [confirmation('2026-10-06'),confirmation('2025-10-07'),confirmation(date,'Wspomnienie Najśw. Maryi Panny Bolesnej'),confirmation().replace('Ga 2,1-2.7-14','Ga 3,1-5'),confirmation().replace('Ps 117 (116), 1b-2','Ps 118 (117), 1b-2'),confirmation().replace('Łk 11,1-4','Łk 1,26-38')]) {
    const response=await fixture({secondary:wrong}).request();const body=await response.json();
    assert.equal(body.entry,null);assert.equal(response.headers.get('Cache-Control'),'no-store');
    assert.equal(response.headers.get('Netlify-CDN-Cache-Control'),'no-store');
  }
});
test('Missing, duplicate or non-memorial metadata fails closed',()=>{
  for(const wrong of [confirmation().replace('class="data"','class="other"'),confirmation().replace('</body>','<div class="data">7 października 2026</div></body>'),confirmation().replace('class="subsec psalm"','class="other"'),confirmation(date,'Święto Najśw. Maryi Panny Różańcowej')])assert.throws(()=>parseMemorialConfirmation(wrong,date));
});
test('No confirmation rule can bypass feasts, solemnities, Sundays or parish proper observances',async()=>{
  for(const rank of ['Ś','U']) {
    const f=fixture({rank});const body=await (await f.request()).json();assert.equal(body.entry,null);assert.equal(body.reason,'local-calendar-mismatch');assert.equal(f.calls.length,2);
  }
  const day={title,rank:'W'},verified=parseMemorialConfirmation(confirmation(),date);
  assert.equal(readingUse(day,{...parseReadings(primary(),date),title:'Niedziela XXVII tygodnia zwykłego'},date,verified),null);
  for(const value of ['2026-07-25','2026-11-11']) {const f=fixture({value});const body=await (await f.request()).json();assert.equal(body.reason,'parish-observance');assert.equal(f.calls.length,0);}
});
test('Unavailable confirmation is retried, rather than storing a blank word',async()=>{
  const data=new Map(),store={async get(key){return data.get(key)||null;},async setJSON(key,value){data.set(key,value);}};
  let available=false,calls=0;
  const handler=createDailyWordService({now:()=>new Date(date+'T12:00:00Z'),getStore:()=>store,fetcher:async url=>{
    if(url===MEMORIAL_SOURCE){calls++;if(!available)throw new Error('Offline');return new Response(confirmation());}
    return new Response(url.includes('.ics')?calendar():primary());
  }});
  const request=()=>handler(new Request(`https://parafia.test${DAILY_WORD_ENDPOINT}?date=${date}`));
  const failed=await request();assert.equal(failed.status,502);assert.equal(failed.headers.get('Netlify-CDN-Cache-Control'),'no-store');
  available=true;const response=await request();assert.ok((await response.json()).entry);assert.equal(calls,2);
});
test('Other dates and following year use their own calendar and reading cycle, no hard-coded 7 October entry',async()=>{
  for(const value of ['2026-10-14','2027-04-07','2027-10-07']) {
    const f=fixture({value}),body=await (await f.request()).json();
    assert.ok(validAutomaticWord(body.entry,value));assert.equal(body.entry.date,value);
    assert.equal(body.entry.cycle,`Rok niedzielny ${value.startsWith('2027')?'B':'A'}; cykl powszedni ${value.startsWith('2027')?'I':'II'}`);
  }
  const f=fixture({value:'2026-10-08',observance:'czwartek XXVII tygodnia zwykłego',rank:''});
  assert.ok((await (await f.request()).json()).entry);assert.equal(f.calls.length,2);
});
test('Versioned endpoint and cache do not reuse old generator result',async()=>{
  const f=fixture({store:{async get(){return {date,entry:{generationMethod:'liturgical-rules-v2'},fetchedAt:Date.now()};},async setJSON(){}}});
  assert.ok((await (await f.request()).json()).entry);assert.equal(f.calls.length,3);
  assert.equal(GENERATOR_VERSION,'liturgical-rules-v3');assert.equal(DAILY_WORD_ENDPOINT,'/api/slowo-na-dzis/v3');
  const config=await readFile(new URL('../netlify.toml',import.meta.url),'utf8');assert.match(config,/from = "\/api\/slowo-na-dzis\/v3"/);
});
