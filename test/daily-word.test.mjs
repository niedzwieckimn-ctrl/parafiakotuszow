import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseCalendar,parseReadings,compatibleDays,readingUse,composeWord,readingCycle,localRestriction,createDailyWordService,calendarFeed,GENERATOR_VERSION} from '../netlify/lib/daily-word.mjs';
import {validAutomaticWord,displayedWord,createAutomaticLoader} from '../daily-word-client.mjs';
import {readingsUrl,CALENDAR_SCOPE} from '../calendar.mjs';

// Synthetic, deliberately short fixtures. Tests never mutate GitHub or use administrator credentials.
const date='2026-10-03',now=()=>new Date(date+'T12:00:00Z');
function calendar(overrides={}){
  let text='BEGIN:VCALENDAR\r\nX-WR-CALNAME:Kalendarz liturgiczny 2026 (Sandomierz)\r\n';
  for(let d=new Date('2026-01-01T12:00:00Z');d.getUTCFullYear()===2026;d.setUTCDate(d.getUTCDate()+1)){
    const key=d.toISOString().slice(0,10),compact=key.replaceAll('-','');
    text+=`BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${compact}\r\nUID:2026-pl-PL-sand1-${compact.slice(4)}-1@gcatholic.org\r\nSUMMARY:${overrides[key]||'🟢 Sobota XXVI tygodnia zwykłego'}\r\nEND:VEVENT\r\n`;
  }
  return text+'END:VCALENDAR';
}
function page({day='03',title='Sobota XXVI tygodnia okresu zwykłego',gospel=true}={}){
  return `<h1>${day} października 2026</h1><p class="subtitle">${title}</p><section><h2>Czytania</h2><p>(Hi 42, 1-6)<br>Krótki tekst pierwszego czytania.</p><p>(Ps 119 (118), 66 i 71)<br><small>REFREN:</small> Okaż swym sługom pogodne oblicze.</p><p>Naucz mnie dobroci i mądrości.<br>Ufam Tobie w każdej chwili.</p>${gospel?'<p>(Łk 10, 17-24)<br>Jezus powiedział: cieszcie się, że wasze imiona zapisane są w niebie.</p>':''}</section><section><h2>Rozważania do czytań</h2><p>CUDZY KOMENTARZ NIE DO KOPIOWANIA</p></section>`;
}
class Store{constructor(){this.data=new Map();}async get(key){return structuredClone(this.data.get(key)||null);}async setJSON(key,data){this.data.set(key,structuredClone(data));}}
function fixture({current=now,ics=calendar(),html=page(),store=new Store(),fail=false}={}){
  const calls=[];
  const handler=createDailyWordService({now:current,getStore:()=>store,fetcher:async(url,options)=>{calls.push({url,options});if(fail)throw new Error('Source outage');return new Response(url.includes('.ics')?ics:html);}});
  return {handler,store,calls,request:(d=date,method='GET')=>handler(new Request(`https://parafia.example/api/slowo-na-dzis?date=${d}`,{method}))};
}
async function generated(){return (await (await fixture().request()).json()).entry;}

test('Calendar unfolds ICS, strips ranks/emoji and ignores optional memorials',()=>{
  const ics=calendar({[date]:'⚪ [W] Św. Faustyny Kowalskiej\\, dziewicy'}).replace('END:VCALENDAR',`BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261003\r\nUID:2026-pl-PL-sand1-1003-2@gcatholic.org\r\nSUMMARY:⚪ [w] Wspomnienie dowolne\r\nEND:VEVENT\r\nEND:VCALENDAR`);
  const days=parseCalendar(ics.replace('Faustyny Kowalskiej','Faustyny\r\n Kowalskiej'),2026);
  assert.equal(Object.keys(days).length,365);assert.equal(days[date].title,'Św. FaustynyKowalskiej, dziewicy');assert.equal(days[date].rank,'W');
});
test('Wrong year, another diocese and incomplete calendar fail closed',()=>{
  assert.throws(()=>parseCalendar(calendar(),2027));assert.throws(()=>parseCalendar(calendar().replace('Sandomierz','Warszawa'),2026));assert.throws(()=>parseCalendar('BEGIN:VCALENDAR\nKalendarz liturgiczny 2026 (Sandomierz)',2026));
});
test('Ambiguous primary observance fails closed',()=>{const ics=calendar().replace('END:VCALENDAR',`BEGIN:VEVENT\nDTSTART;VALUE=DATE:20261003\nUID:2026-pl-PL-sand1-1003-2@gcatholic.org\nSUMMARY:⚪ [Ś] Inne święto\nEND:VEVENT\nEND:VCALENDAR`);assert.throws(()=>parseCalendar(ics,2026));});
test('Readings preserve literal quote, nested psalm references and exclude others commentary',()=>{
  const readings=parseReadings(page(),date);assert.equal(readings.blocks[1].reference,'Ps 119 (118), 66 i 71');assert.ok(!JSON.stringify(readings).includes('CUDZY KOMENTARZ'));assert.equal(composeWord(readings,{},date).quote,'cieszcie się, że wasze imiona zapisane są w niebie');
});
test('Wrong date/year and incomplete biblical sources never produce a word',()=>{
  assert.throws(()=>parseReadings(page({day:'04'}),date));assert.throws(()=>parseReadings(page().replaceAll('2026','2025'),date));assert.throws(()=>parseReadings(page({gospel:false}),date));
});
test('Ordinary weekdays must agree on week, feasts cannot match unrelated titles',()=>{
  assert.ok(compatibleDays('Sobota XXVI tygodnia zwykłego','Sobota XXVI tygodnia okresu zwykłego'));assert.ok(!compatibleDays('Sobota XXVII tygodnia zwykłego','Sobota XXVI tygodnia zwykłego'));assert.ok(!compatibleDays('Rocznica poświęcenia katedry','Czwartek XXIX tygodnia zwykłego'));
});
test('Selected memorials explicitly use weekday readings; feasts/unknown memorials remain protected',()=>{
  assert.equal(readingUse({title:'Św. Faustyny Kowalskiej, dziewicy',rank:'W'},{title:'Poniedziałek XXVII tygodnia okresu zwykłego'},'2026-10-05'),'weekday-memorial');
  for(const day of [{title:'Św. Faustyny Kowalskiej',rank:'Ś'},{title:'Świętych Aniołów Stróżów',rank:'W'}])assert.equal(readingUse(day,{title:'Poniedziałek XXVII tygodnia zwykłego'},'2026-10-05'),null);
});
test('Sunday cycle changes at Advent, weekday cycle tracks civil year',()=>{
  assert.equal(readingCycle('2026-10-03'),'Rok niedzielny A; cykl powszedni II');assert.equal(readingCycle('2026-11-28'),'Rok niedzielny A; cykl powszedni II');assert.equal(readingCycle('2026-11-29'),'Rok niedzielny B; cykl powszedni II');assert.equal(readingCycle('2027-01-01'),'Rok niedzielny B; cykl powszedni I');
});
test('Psalm selection returns short literal text and its actual reading range',()=>{
  const readings=parseReadings(page(),date);readings.blocks.at(-1).reference='Mt 5, 1-12';
  const word=composeWord(readings,{},date);assert.ok(readings.blocks[1].text.includes(word.quote));assert.ok(word.quote.split(/\s+/).length<=25);assert.equal(word.reference,readings.blocks[1].reference);assert.ok(word.reflection);assert.throws(()=>composeWord({...readings,blocks:readings.blocks.filter(b=>!b.reference.startsWith('Ps '))},{},date));
});
test('Public endpoint generates without secrets, login, GitHub write or manual entries',async()=>{
  const f=fixture(),response=await f.request(),body=await response.json();assert.equal(response.status,200);assert.ok(validAutomaticWord(body.entry,date));assert.equal(body.entry.title,'Jesteś ważny dla Boga');assert.equal(body.entry.reviewed,undefined);assert.equal(body.entry.localCalendarVerified,undefined);assert.equal(f.calls.length,2);
  assert.ok(f.calls.every(c=>[calendarFeed(2026),readingsUrl(date)].includes(c.url)&&!c.options.headers.Authorization));assert.ok(!JSON.stringify(body).includes('GITHUB_TOKEN'));assert.ok(!response.headers.get('Netlify-CDN-Cache-Control').includes('stale'));
  assert.equal(response.headers.get('Netlify-Vary'),'query=date');
});
test('Cached daily word avoids source downloads; broken optional cache does not stop generation',async()=>{
  const f=fixture();await f.request();await f.request();assert.equal(f.calls.length,2);
  const failedStore={async get(){throw new Error('storage');},async setJSON(){throw new Error('storage');}};assert.equal((await fixture({store:failedStore}).request()).status,200);
});
test('Missing Blobs runtime context still permits safe uncached generation',async()=>{const handler=createDailyWordService({now,fetcher:async url=>new Response(url.includes('.ics')?calendar():page()),getStore:()=>{throw new Error('No runtime');}});assert.equal((await handler(new Request(`https://example.test/?date=${date}`))).status,200);});
test('Only current Warsaw date can be requested; all writes are refused',async()=>{
  const f=fixture();for(const d of ['2026-10-02','2027-10-03','../../secrets',''])assert.equal((await f.request(d)).status,400);assert.equal((await f.request(date,'POST')).status,405);assert.equal(f.calls.length,0);const head=await f.request(date,'HEAD');assert.equal(head.status,200);assert.equal(await head.text(),'');
});
test('Failed sources and mismatched local feast return no stale/fictional word',async()=>{
  const unavailable=await fixture({fail:true}).request();assert.equal(unavailable.status,502);assert.equal((await unavailable.json()).entry,null);
  const mismatch=await (await fixture({ics:calendar({[date]:'⚪ [Ś] Rocznica poświęcenia katedry'})}).request()).json();assert.equal(mismatch.entry,null);assert.equal(mismatch.reason,'local-calendar-mismatch');assert.ok(mismatch.notice);
});
test('Patron and parish dedication require proper readings, not a guessed transfer',async()=>{
  assert.ok(localRestriction('2026-07-25'));assert.ok(localRestriction('2026-11-11'));assert.equal(localRestriction('2026-10-03'),'');
  const f=fixture({current:()=>new Date('2026-07-25T12:00:00Z')});const body=await (await f.request('2026-07-25')).json();assert.equal(body.entry,null);assert.equal(body.reason,'parish-observance');assert.equal(f.calls.length,0);
});
test('Parallel visits share one generation; factories do not cross-contaminate',async()=>{
  const f=fixture();const responses=await Promise.all([f.request(),f.request(),f.request()]);assert.ok(responses.every(r=>r.status===200));assert.equal(f.calls.length,2);
  const broken=fixture({fail:true});assert.equal((await broken.request()).status,502);
});
test('Cached yesterday cannot leak into today and cache refresh respects date',async()=>{
  let clock=new Date('2026-10-03T21:59:59Z');const f=fixture({current:()=>clock});assert.equal((await (await f.request()).json()).entry.date,date);clock=new Date('2026-10-03T22:00:00Z');const response=await f.request('2026-10-04');assert.equal(response.status,502);assert.equal((await response.json()).entry,null);
});
test('Manual verified dated override wins; draft does not suppress automatic generation',async()=>{
  const automatic=await generated(),manual={...automatic,published:true,reviewed:true,localCalendarVerified:true,title:'Ręczna poprawka',calendarNote:'Sprawdzono lokalnie'};
  assert.equal(displayedWord([manual],automatic,now()).mode,'manual');assert.equal(displayedWord([{...manual,published:false}],automatic,now()).mode,'automatic');assert.equal(displayedWord([],automatic,new Date('2026-10-04T12:00:00Z')).entry,null);assert.ok(automatic.calendarScope===CALENDAR_SCOPE);
});
test('Client rejects modified source link, wrong date, unknown generator and oversized quote',async()=>{
  const entry=await generated();for(const patch of [{date:'2026-10-04'},{readingsUrl:'https://evil.example/'},{calendarUrl:'https://evil.example/'},{generationMethod:'other'},{quote:'word '.repeat(26)}])assert.ok(!validAutomaticWord({...entry,...patch},date));
});
test('Loader switches at Warsaw midnight, never reuses old text during failure',async()=>{
  let clock=now(),count=0;const automatic=await generated();const loader=createAutomaticLoader({now:()=>clock,fetcher:async()=>{count++;return count===1?new Response(JSON.stringify({date,entry:automatic})):new Response('{}',{status:502});}});
  await loader.refresh();assert.equal(loader.entry.title,automatic.title);clock=new Date('2026-10-03T22:00:00Z');assert.equal(loader.entry,null);await loader.refresh();assert.equal(loader.entry,null);
});
test('Late previous-day response cannot replace the current-day response',async()=>{
  let clock=now(),release;const automatic=await generated();const loader=createAutomaticLoader({now:()=>clock,fetcher:async url=>url.includes(date)?await new Promise(resolve=>{release=resolve;}):new Response(JSON.stringify({date:'2026-10-04',entry:null,notice:'Inne czytania lokalne'}))});
  const old=loader.refresh();clock=new Date('2026-10-03T22:00:00Z');await loader.refresh();release(new Response(JSON.stringify({date,entry:automatic})));await old;assert.equal(loader.entry,null);assert.equal(loader.notice,'Inne czytania lokalne');
});
test('Deployed public assets and admin use the automatic endpoint, not exposed server credentials',async()=>{
  const root=new URL('../',import.meta.url);for(const file of ['dist/daily-word-client.mjs','dist/admin/panel.mjs','dist/script.js']){const text=await readFile(new URL(file,root),'utf8');assert.ok(text.includes('daily-word')||text.includes('/api/slowo-na-dzis'));assert.ok(!/GITHUB_TOKEN|ADMIN_PASSWORD_HASH|process\.env/.test(text));}
  const config=await readFile(new URL('netlify.toml',root),'utf8');assert.ok(config.includes('/.netlify/functions/daily-word'));assert.equal(GENERATOR_VERSION,'liturgical-rules-v2');
});
