import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';

test('Homepage opening uses the existing exterior photograph and its own attribution',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const hero=html.match(/<figure class="opening-photo">([\s\S]*?)<\/figure>/)?.[1];
  assert.ok(hero);
  assert.match(hero,/data-full-photo="assets\/kosciol-od-prezbiterium\.webp"/);
  assert.match(hero,/src="assets\/kosciol-od-prezbiterium\.webp"/);
  assert.match(hero,/width="1068" height="816"/);
  assert.match(hero,/Diecezja Sandomierska/);
  assert.doesNotMatch(hero,/kosciol-wnetrze|Łukasz Bakuła|CC BY-SA/);
  await access(new URL('../assets/kosciol-od-prezbiterium.webp',import.meta.url));
  assert.match(html,/class="invitation"[^>]*>[\s\S]*?src="assets\/kosciol-wnetrze\.webp"/);
});

test('Mobile-only rule hides the opening photograph, not other images',async()=>{
  const css=await readFile(new URL('../mobile.css',import.meta.url),'utf8');
  assert.match(css,/@media\(max-width:700px\)\{[\s\S]*?\.opening-photo\{display:none\}/);
  assert.doesNotMatch(css,/\.opening-photo\{display:none\}[\s\S]*?@media\(max-width:700px\)/);
});
