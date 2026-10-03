import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {massSchedule,defaultIntention,matchesIntention} from '../mass-schedule.mjs';
import {constrainPan,attachPhotoGestures} from '../photo-viewer.mjs';
import {priests} from '../priests.mjs';
import {validateContent} from '../netlify/lib/admin-content.mjs';
import {fixture} from './helpers.mjs';

test('Every regular Mass appears, including Chańcza, with default intention',()=>{
  const days=massSchedule([],[],'2026-10-03');assert.equal(days.length,14);
  assert.deepEqual(days[1].masses.map(m=>m.time),['09:00','10:30','12:00','16:00']);
  assert.equal(days[1].masses[1].place,'Kaplica w Chańczy');assert.ok(days.every(day=>day.masses.every(m=>m.intention==='Za parafian')));
});
test('Published day replaces regular schedule; local content takes precedence; canceled day stays canceled',()=>{
  const remote=[{date:'2026-10-04',masses:[{time:'11:00',intention:'Import'}]}];
  const local=[{date:'2026-10-04',masses:[{time:'13:00',intention:'Za rodzinę'}]}];
  assert.equal(massSchedule(local,remote,'2026-10-03')[1].masses[0].intention,'Za rodzinę');
  assert.equal(massSchedule(local,remote,'2026-10-03')[1].masses.length,1);
  assert.equal(massSchedule([{date:'2026-10-04',masses:[]}],remote,'2026-10-03')[1].masses.length,0);
});
test('Calendar handles year/month rollover and past entries are excluded',()=>{
  const days=massSchedule([{date:'2025-12-30',masses:[]}],[],'2025-12-31',3);
  assert.deepEqual(days.map(day=>day.date),['2025-12-31','2026-01-01','2026-01-02']);
});
test('Search uses displayed default and ignores Polish accents/case',()=>{
  assert.equal(defaultIntention('  '),'Za parafian');assert.equal(defaultIntention(' Za rodzinę '),'Za rodzinę');
  assert.ok(matchesIntention({intention:''},'PARAFIAN'));assert.ok(matchesIntention({intention:'O Boże błogosławieństwo'},'boze blogoslawienstwo'));
  assert.equal(matchesIntention({intention:'Za rodzinę'},'kowalski'),false);
});
test('Server accepts blank or missing intention but rejects invalid values',()=>{
  const record={date:'2026-10-03',published:true,masses:[{time:'17:00',place:'Kościół w Kotuszowie',intention:''}]};
  assert.equal(validateContent('intencje',record).masses[0].intention,'');
  assert.equal(validateContent('intencje',{...record,masses:[{time:'17:00',place:'Kościół w Kotuszowie'}]}).masses[0].intention,'');
  for(const intention of [42,'a\0b','a'.repeat(4001)])assert.throws(()=>validateContent('intencje',{...record,masses:[{...record.masses[0],intention}]}));
});
test('Latest priest first, retirement explicit, all 17 records have identifiers and dates',()=>{
  assert.equal(priests.length,17);assert.equal(priests[0].name,'Ks. Patryk Kowalik');assert.match(priests[0].period,/24 września 2026/);
  assert.match(priests[1].period,/emerytowany/);assert.equal(priests.at(-1).period,'1326');assert.equal(new Set(priests.map(p=>p.name)).size,17);
});
test('Authenticated blank intention saves to isolated GitHub and a priest edit replaces its fallback',async()=>{
  const f=await fixture(),session=await f.login();
  const data={date:'2026-10-04',published:true,masses:[{time:'09:00',place:'Kościół w Kotuszowie',intention:''}]};
  const saved=await f.request('content',{...session,method:'POST',data:{collection:'intencje',data}});assert.equal(saved.status,201);
  const created=await saved.json();const read=await f.request(`content?collection=intencje&filename=${created.filename}`,session);const first=await read.json();
  assert.equal(massSchedule([first.data],[],'2026-10-04')[0].masses[0].intention,'Za parafian');
  const edited=await f.request('content',{...session,method:'POST',data:{collection:'intencje',filename:created.filename,sha:first.sha,data:{...first.data,masses:[{...first.data.masses[0],intention:'O Boże błogosławieństwo dla rodzin'}]}}});assert.equal(edited.status,200);
  const reread=await (await f.request(`content?collection=intencje&filename=${created.filename}`,session)).json();assert.equal(massSchedule([reread.data],[],'2026-10-04')[0].masses[0].intention,'O Boże błogosławieństwo dla rodzin');
});
test('Pinch, pan, double tap and reset work in gesture controller; pan bounded',()=>{
  const oldStyle=globalThis.getComputedStyle,oldObserver=globalThis.ResizeObserver;
  globalThis.getComputedStyle=()=>({paddingLeft:'0',paddingRight:'0',paddingTop:'0',paddingBottom:'0',objectFit:'contain'});
  globalThis.ResizeObserver=class{observe(){}};
  try{
    const listeners=new Map();const stage={clientWidth:300,clientHeight:500,classList:{toggle(){}},getBoundingClientRect:()=>({left:0,top:0,width:300,height:500}),addEventListener:(name,fn)=>listeners.set(name,fn),setPointerCapture(){},hasPointerCapture:()=>false};
    const image={naturalWidth:600,naturalHeight:1000,style:{},addEventListener(){}};
    const controller=attachPhotoGestures(stage,image);const fire=(name,id,x,y)=>listeners.get(name)({pointerId:id,clientX:x,clientY:y,target:{closest:()=>null}});
    fire('pointerdown',1,100,250);fire('pointerdown',2,200,250);fire('pointermove',2,250,250);assert.equal(controller.getState().zoom,1.5);
    fire('pointerup',2,250,250);const before=controller.getState().x;fire('pointermove',1,120,250);assert.notEqual(controller.getState().x,before);
    controller.reset();assert.deepEqual(controller.getState(),{zoom:1,x:0,y:0});
    controller.zoomToPoint({x:27,y:40},3);assert.equal(controller.getState().zoom,3);assert.ok(controller.getState().x>0);
    fire('pointercancel',1,120,250);controller.reset();fire('pointerdown',3,150,250);fire('pointerup',3,150,250);fire('pointerdown',4,150,250);assert.equal(controller.getState().zoom,2.5);
    assert.deepEqual(constrainPan(1000,-1000,2,300,500),{x:150,y:-250});
  }finally{globalThis.getComputedStyle=oldStyle;globalThis.ResizeObserver=oldObserver;}
});
test('Mobile assets and modules are deployed and public page contains no admin links',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8'),build=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
  for(const file of ['mobile.css','photo-viewer.mjs','mass-schedule.mjs','priests.mjs','mobile-layout.mjs'])assert.ok(build.includes(file));
  assert.ok(html.includes('id="intentionSearch"'));assert.equal(/href=["'][^"']*\/admin\//.test(html),false);
});
