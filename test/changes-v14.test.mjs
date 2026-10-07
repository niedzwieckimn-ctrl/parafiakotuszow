import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GOOGLE_TOUR_DEMO,setupGoogleTour} from '../google-tour.mjs';

function fixture(config=GOOGLE_TOUR_DEMO) {
  const make=()=>({hidden:false,removed:false,attributes:new Map(),listeners:new Map(),
    set src(value){this.attributes.set('src',value);},get src(){return this.attributes.get('src');},
    setAttribute(name,value){this.attributes.set(name,value);},removeAttribute(name){this.attributes.delete(name);},
    addEventListener(type,callback){this.listeners.set(type,callback);},removeEventListener(type){this.listeners.delete(type);},
    remove(){this.removed=true;},click(){this.listeners.get('click')?.();}});
  const ids=['photoTourPanel','googleTourPanel','photoTourMode','googleTourMode','googleTourFrame','googleTourPreview','loadGoogleTour','stopGoogleTour','googlePanoramaLink','googleGalleryLink','googlePhotoGalleryLink'];
  const nodes=Object.fromEntries(ids.map(id=>[id,make()])),switcher=make(),linkParent=make();
  nodes.googleTourPanel.hidden=true;nodes.googleTourFrame.hidden=true;nodes.stopGoogleTour.hidden=true;
  const document={querySelector:selector=>nodes[selector.slice(1)],querySelectorAll:()=>[switcher,nodes.googleTourPanel,linkParent]};
  const window={location:{hash:'#zwiedzanie'},listeners:new Map(),addEventListener(type,callback){this.listeners.set(type,callback);},removeEventListener(type){this.listeners.delete(type);}};
  const modes=[];const api=setupGoogleTour({config,document,window,onModeChange:mode=>modes.push(mode)});
  return {nodes,switcher,linkParent,window,modes,api};
}
test('Demo starts on local photographs with no Google iframe request',()=>{
  const f=fixture();assert.equal(f.nodes.photoTourPanel.hidden,false);assert.equal(f.nodes.googleTourPanel.hidden,true);
  assert.equal(f.nodes.googleTourFrame.src,undefined);assert.equal(f.nodes.googleTourFrame.hidden,true);
  assert.equal(f.nodes.googleGalleryLink.href,GOOGLE_TOUR_DEMO.galleryUrl);
});
test('Selecting panorama does not connect to Google until explicit start',()=>{
  const f=fixture();f.nodes.googleTourMode.click();
  assert.equal(f.nodes.photoTourPanel.hidden,true);assert.equal(f.nodes.googleTourPanel.hidden,false);
  assert.equal(f.nodes.googleTourFrame.src,undefined);assert.deepEqual(f.modes,['google']);
  assert.equal(f.nodes.googleTourMode.attributes.get('aria-pressed'),'true');
  f.nodes.loadGoogleTour.click();assert.equal(f.nodes.googleTourFrame.src,GOOGLE_TOUR_DEMO.embedUrl);
  assert.equal(f.nodes.googleTourFrame.hidden,false);assert.equal(f.nodes.googleTourPreview.hidden,true);assert.equal(f.nodes.stopGoogleTour.hidden,false);
});
test('Stopping, switching mode or leaving tour unloads Google; return requires another click',()=>{
  for(const action of ['stop','photos','leave']) {
    const f=fixture();f.nodes.googleTourMode.click();f.nodes.loadGoogleTour.click();
    if(action==='stop')f.nodes.stopGoogleTour.click();
    if(action==='photos')f.nodes.photoTourMode.click();
    if(action==='leave'){f.window.location.hash='#historia';f.window.listeners.get('hashchange')();}
    assert.equal(f.nodes.googleTourFrame.src,undefined);assert.equal(f.nodes.googleTourFrame.hidden,true);
    assert.equal(f.nodes.googleTourPreview.hidden,false);assert.equal(f.nodes.stopGoogleTour.hidden,true);
    if(action==='photos'){assert.equal(f.nodes.photoTourPanel.hidden,false);assert.equal(f.nodes.photoTourMode.attributes.get('aria-pressed'),'true');}
    f.window.location.hash='#zwiedzanie';f.window.listeners.get('hashchange')();assert.equal(f.nodes.googleTourFrame.src,undefined);
  }
});
test('Disabled demo and destroy remove only optional controls and restore existing photo tour',()=>{
  const f=fixture({...GOOGLE_TOUR_DEMO,enabled:false});assert.equal(f.switcher.removed,true);assert.equal(f.linkParent.removed,true);assert.equal(f.nodes.googleTourPanel.removed,true);
  assert.equal(f.nodes.photoTourPanel.hidden,false);assert.equal(f.nodes.googleTourFrame.src,undefined);assert.equal(f.window.listeners.size,0);
  const active=fixture();active.nodes.googleTourMode.click();active.nodes.loadGoogleTour.click();active.api.destroy();
  assert.equal(active.nodes.googleTourFrame.src,undefined);assert.equal(active.nodes.photoTourPanel.hidden,false);assert.equal(active.window.listeners.size,0);assert.equal(active.switcher.removed,true);
});
test('Only Google-provided embed origin and source links are permitted',()=>{
  for(const embedUrl of ['javascript:alert(1)','https://evil.example/maps/embed?pb=test','https://www.google.com/maps/other?pb=test','https://www.google.com/maps/embed'])assert.throws(()=>fixture({...GOOGLE_TOUR_DEMO,embedUrl}));
  assert.throws(()=>fixture({...GOOGLE_TOUR_DEMO,galleryUrl:'https://evil.example/maps/'}));
  assert.equal(new URL(GOOGLE_TOUR_DEMO.embedUrl).pathname,'/maps/embed');
  assert.ok(GOOGLE_TOUR_DEMO.embedUrl.includes('wAmta0DYRjnLMgIu4dF27A'));
});
test('Public HTML does not load Google directly, overlay its attribution or claim an interior panorama',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const frame=html.match(/<iframe id="googleTourFrame"[^>]*>/)?.[0];
  assert.ok(frame);assert.doesNotMatch(frame,/\ssrc=/);assert.match(frame,/allowfullscreen/);assert.match(frame,/referrerpolicy="strict-origin-when-cross-origin"/);
  assert.match(html,/Przed kościołem · 360°/);assert.match(html,/Rozejrzyj się przed kościołem/);
  assert.match(html,/Zdjęcie podglądu: EwaRóża · CC BY-SA 3.0/);
  assert.match(html,/id="tourHotspots"/);assert.match(html,/id="photoTourPanel"/);
});
test('Module is deployed without keys; existing dated content and menu remain unchanged',async()=>{
  const root=new URL('../',import.meta.url);
  assert.match(await readFile(new URL('build.mjs',root),'utf8'),/'google-tour\.mjs'/);
  const built=await readFile(new URL('dist/google-tour.mjs',root),'utf8');assert.doesNotMatch(built,/process\.env|GITHUB_TOKEN|ADMIN_PASSWORD_HASH|api_key|key=/);
  assert.match(await readFile(new URL('script.js',root),'utf8'),/setupGoogleTour\(\{onModeChange:\(\)=>stopAutoTour\(\)\}\)/);
  const html=await readFile(new URL('index.html',root),'utf8');assert.match(html,/id="dailyWordQuote"/);assert.match(html,/id="intentionSearch"/);assert.match(html,/href="#camino" data-page-link="camino">Dla pielgrzymów/);
});
