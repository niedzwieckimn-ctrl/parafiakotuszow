import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {safeSourceUrl} from '../public-links.mjs';
import {massSchedule,matchesIntention} from '../mass-schedule.mjs';

const read = name => readFile(new URL('../'+name,import.meta.url),'utf8');
test('No links to the replaced parish site remain in public templates or credits',async()=>{
  for(const name of ['index.html','script.js','journey.mjs','church-photos.mjs','PRAWA-DO-NOWYCH-ZDJEC.md','ZRODLA-I-LICENCJE.md']) {
    assert.doesNotMatch(await read(name),/https?:\/\/(?:[\w.-]+\.)?parafiakotuszow\.pl\b/i,name);
  }
});
test('Old parish URLs cannot be reintroduced by imported intentions or editable gallery data',()=>{
  for(const url of ['https://parafiakotuszow.pl','https://www.parafiakotuszow.pl/intencje','http://PARAFIAKOTUSZOW.PL:80/a','https://archiwum.parafiakotuszow.pl/a','https://parafiakotuszow.pl./a','javascript:alert(1)','//www.parafiakotuszow.pl','https://user:password@example.org'])assert.equal(safeSourceUrl(url),'');
  for(const url of ['https://www.kotuszow.pl/index.php/historia','https://diecezjasandomierska.pl/kotuszow-sw-jakuba-starszego-apostola/','https://www.szydlow.pl/','https://commons.wikimedia.org/wiki/File:Example.jpg'])assert.equal(safeSourceUrl(url),url);
  assert.equal(safeSourceUrl(null),'');
});
test('Mass page has distinct headings and retains hours, search and patronal dates',async()=>{
  const html=await read('index.html');
  const page=html.slice(html.indexOf('id="page-wydarzenia"'),html.indexOf('id="page-camino"'));
  assert.deepEqual([...page.matchAll(/<h[12][^>]*>([^<]+)<\/h[12]>/g)].map(m=>m[1]),['Msze i intencje','Godziny Mszy świętych','Intencje','Odpusty parafialne']);
  assert.doesNotMatch(page,/Kalendarz wspólnoty|Porządek nabożeństw|Najbliższe dni|Stały rytm|Stały porządek według|Najważniejsze doroczne|Odpust związany/);
  for(const text of ['9:00 · 12:00 · 16:00','10:30','17:00','id="intentionSearch"','Świętego Jakuba Apostoła','Świętego Józefa','lipca','marca'])assert.ok(page.includes(text),text);
});
test('Public explanatory clutter removed while copyright and historical attribution remain',async()=>{
  const html=await read('index.html');
  assert.doesNotMatch(html,/Automatyczny kanał pobiera|Informacje z okolicy — rozwiń|Najświeższe potwierdzone|Materiały opracowano na podstawie publicznych źródeł/);
  assert.match(html,/Fot\. Łukasz Bakuła · CC BY-SA 3\.0 PL/);
  assert.match(html,/ZRODLA-I-LICENCJE\.md/);
  assert.match(html,/Jan Wiśniewski, 1929/);
  assert.match(html,/id="municipalNews"/);
});

async function renderFixture(query='',remote=[],local=[]) {
  const nodes=new Map();
  function node(tag='div'){return {tag,children:[],textContent:'',hidden:false,value:'',append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;}};}
  for(const id of ['intentionSearch','intentionsList','intentionsStatus','homeIntentions','intentionSearchCount'])nodes.set('#'+id,node());
  nodes.get('#intentionSearch').value=query;
  const script=await read('script.js');
  const source=script.slice(script.indexOf('function renderIntentions()'),script.indexOf("document.querySelector('#intentionSearch').addEventListener"));
  runInNewContext(source+'\nrenderIntentions();',{
    todayInWarsaw:()=> '2026-10-05',massSchedule,matchesIntention,safeSourceUrl,
    formatDate:value=>value,localIntentions:local,remoteIntentions:{days:remote},intentionsFailed:false,
    document:{querySelector:selector=>nodes.get(selector),createElement:node}
  });
  return nodes;
}
test('Rendered intentions keep imported data but suppress old-source links and success explanations',async()=>{
  const nodes=await renderFixture('',[{date:'2026-10-05',title:'poniedziałek',sourceUrl:'https://www.parafiakotuszow.pl/intencje',masses:[{time:'17:00',intention:'Za Marię Kowalską',place:'Kotuszów'}]}]);
  const list=nodes.get('#intentionsList');
  assert.ok(list.children.length>=14);
  assert.equal(list.children[0].children.filter(child=>child.tag==='a').length,0);
  assert.equal(list.children[0].children[1].children[1].textContent,'Za Marię Kowalską');
  assert.equal(nodes.get('#intentionsStatus').hidden,true);
  assert.equal(nodes.get('#intentionSearchCount').hidden,true);
});
test('Search finds published intentions or default Za parafian; clear search restores all Masses',async()=>{
  const local=[{date:'2026-10-05',title:'poniedziałek',masses:[{time:'17:00',intention:'Za Marię Kowalską',place:'Kotuszów'}]}];
  const found=await renderFixture('KOWALSKA',[],local);
  assert.equal(found.get('#intentionsList').children.length,1);
  assert.equal(found.get('#intentionSearchCount').textContent,'Znaleziono: 1 Msza');
  assert.equal(found.get('#intentionSearchCount').hidden,false);
  const defaults=await renderFixture('parafian',[],local);
  assert.ok(defaults.get('#intentionsList').children.length>0);
  const empty=await renderFixture('nieistniejąca-intencja',[],local);
  assert.equal(empty.get('#intentionsList').children[0].textContent,'Brak wyników. Spróbuj wpisać krótszy fragment intencji.');
  const restored=await renderFixture('',[],local);
  assert.equal(restored.get('#intentionsList').children.length,14);
});
test('Public link filtering module is included in the deploy build',async()=>{
  assert.match(await read('build.mjs'),/'public-links\.mjs'/);
  assert.match(await read('script.js'),/import \{safeSourceUrl\} from '\.\/public-links\.mjs'/);
});
