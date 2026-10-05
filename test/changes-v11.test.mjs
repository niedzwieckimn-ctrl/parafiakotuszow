import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Homepage no longer contains the community news preview, public announcements remain',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const home=html.slice(html.indexOf('id="page-start"'),html.indexOf('id="page-wydarzenia"'));
  assert.doesNotMatch(home,/Z życia wspólnoty|id="homeNewsList"/);
  assert.match(home,/href="#aktualnosci"/);
  assert.match(html,/id="adminNoticeList"/);
  const js=await readFile(new URL('../script.js',import.meta.url),'utf8');
  assert.doesNotMatch(js,/homeNewsList|renderHomeNews/);
});
test('Mass page shows schedule, then intentions and their search, then feast days',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const page=html.slice(html.indexOf('id="page-wydarzenia"'),html.indexOf('id="page-camino"'));
  assert.ok(page.indexOf('id="services-title"')<page.indexOf('id="intentions-title"'));
  assert.ok(page.indexOf('id="intentions-title"')<page.indexOf('id="feasts-title"'));
  assert.match(page,/id="intentionSearch"/);
  assert.match(page,/9:00 · 12:00 · 16:00/);
  assert.match(page,/<time>10:30<\/time>/);
  assert.match(page,/<time>17:00<\/time>/);
});
