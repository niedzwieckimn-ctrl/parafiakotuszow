import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('El Camino has a main menu link and an independent accessible page',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const menu=html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0];
  assert.match(menu,/<a href="#camino" data-page-link="camino">Dla pielgrzymów<\/a>/);
  assert.match(html,/<section class="page-view inner-page" id="page-camino" data-page="camino" aria-labelledby="camino-title" hidden>/);
  assert.equal((html.match(/id="camino-event-title"/g)||[]).length,1);
  assert.ok(html.indexOf('id="page-camino"')<html.indexOf('id="camino-event-title"'));
  assert.match(html,/<h1 id="camino-title">El Camino<\/h1>/);
  assert.match(html,/aria-label="Przydatne dla pielgrzyma"/);
  const script=await readFile(new URL('../script.js',import.meta.url),'utf8');
  assert.match(script,/camino: "El Camino — Parafia św\. Jakuba w Kotuszowie"/);
  assert.match(script,/camino: "El Camino",/);
});
