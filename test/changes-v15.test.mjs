import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import sharp from 'sharp';

test('Homepage history invitation uses the supplied illustration without false photographic credit',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const card=html.match(/<a class="invitation invitation-history"[\s\S]*?<\/a>/)?.[0];
  assert.ok(card);assert.match(card,/href="#historia" data-page-link="historia"/);
  assert.match(card,/src="assets\/historia-ilustracja.webp"/);assert.match(card,/width="1000" height="500"/);
  assert.match(card,/<small>Ilustracja<\/small>/);assert.doesNotMatch(card,/Łukasz Bakuła|CC BY-SA|Fot\./);
  assert.match(card,/Odkryj historię ↗/);
  assert.equal((html.match(/src="assets\/historia-ilustracja.webp"/g)||[]).length,1);
});
test('Illustration keeps the full composition and is small enough for the card',async()=>{
  const source=await readFile(new URL('../assets/historia-ilustracja.webp',import.meta.url));
  const meta=await sharp(source).metadata();assert.equal(meta.format,'webp');assert.equal(meta.width,1000);assert.equal(meta.height,500);assert.ok(source.length<350000);
  const css=await readFile(new URL('../home.css',import.meta.url),'utf8');
  assert.match(css,/\.invitation\.invitation-history>img\{object-fit:contain;object-position:center;/);
});
test('Original documentary photographs and their attribution remain for history and Camino',async()=>{
  await access(new URL('../assets/kosciol-fasada.webp',import.meta.url));
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const inner=html.slice(html.indexOf('id="page-camino"'));
  assert.equal((inner.match(/src="assets\/kosciol-fasada.webp"/g)||[]).length,2);
  assert.match(html,/Fot\. Łukasz Bakuła · CC BY-SA 3\.0 PL/);
  const sources=await readFile(new URL('../ZRODLA-I-LICENCJE.md',import.meta.url),'utf8');
  assert.match(sources,/Nie jest fotografią archiwalną/);
});
