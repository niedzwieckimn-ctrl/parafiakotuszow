import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {setupMobileMenu} from '../mobile-menu.mjs';

function fixture(){
  const element=()=>({inert:false,listeners:{},attributes:{},classList:{values:new Set(),add(v){this.values.add(v)},remove(v){this.values.delete(v)}},addEventListener(name,fn){this.listeners[name]=fn},setAttribute(name,value){this.attributes[name]=value},focus(){doc.activeElement=this}});
  const doc=element(),body=element(),button=element(),nav=element(),brand=element(),first=element(),last=element(),main=element(),footer=element(),skip=element(),label={textContent:''};
  doc.body=body;doc.querySelectorAll=()=>[main,footer,skip];
  button.closest=()=>({querySelectorAll:()=>[brand,button,first,last]});button.querySelector=()=>label;
  nav.querySelector=()=>first;
  const media={matches:true,addEventListener(name,fn){this.changed=fn}};
  const controller=setupMobileMenu({button,nav,doc,media});
  return {controller,doc,body,button,nav,first,last,brand,main,footer,skip,media,label};
}

test('Full-screen menu opens, focuses navigation, isolates background and closes with Escape',()=>{
  const f=fixture();assert.equal(f.nav.inert,true);
  f.button.listeners.click();assert.equal(f.button.attributes['aria-expanded'],'true');assert.equal(f.nav.inert,false);
  assert.ok(f.body.classList.values.has('menu-open'));assert.equal(f.doc.activeElement,f.first);assert.equal(f.main.inert,true);assert.equal(f.footer.inert,true);
  let prevented=false;f.doc.listeners.keydown({key:'Escape',preventDefault(){prevented=true}});
  assert.equal(prevented,true);assert.equal(f.main.inert,false);assert.equal(f.nav.inert,true);assert.equal(f.doc.activeElement,f.button);assert.equal(f.label.textContent,'Otwórz menu');
});
test('Tab stays in menu, breakpoint clears scroll lock, routing closure restores pre-existing inert state',()=>{
  const f=fixture();f.footer.inert=true;f.controller.show();
  f.last.focus();f.doc.listeners.keydown({key:'Tab',preventDefault(){}});assert.equal(f.doc.activeElement,f.brand);
  f.doc.listeners.keydown({key:'Tab',shiftKey:true,preventDefault(){}});assert.equal(f.doc.activeElement,f.last);
  f.controller.close();assert.equal(f.main.inert,false);assert.equal(f.footer.inert,true);
  f.controller.show();f.media.matches=false;f.media.changed();assert.equal(f.nav.inert,false);assert.equal(f.button.attributes['aria-expanded'],'false');assert.equal(f.body.classList.values.has('menu-open'),false);
  f.controller.show();assert.equal(f.button.attributes['aria-expanded'],'false');
});
test('Mobile menu module is deployed and stylesheet retains full-screen centered Niedźwieccy layout',async()=>{
  const build=await readFile(new URL('../build.mjs',import.meta.url),'utf8'),css=await readFile(new URL('../mobile.css',import.meta.url),'utf8');
  assert.ok(build.includes('mobile-menu.mjs'));assert.match(css,/@media\(max-width:960px\)/);assert.match(css,/height:100dvh/);assert.match(css,/place-content:safe center/);assert.match(css,/var\(--serif\)/);assert.match(css,/prefers-reduced-motion:reduce/);
});
