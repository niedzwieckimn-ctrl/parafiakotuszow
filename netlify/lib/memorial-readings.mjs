import {plainText} from '../functions/news.mjs';

export const MEMORIAL_SOURCE='https://opoka.org.pl/liturgia_iframe.php';
const MONTHS=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
const normalizedReference=value=>value.replace(/\s*\(R\.:.*\)\s*$/i,'').replace(/[–—]/g,'-').replace(/\s+/g,'').toLowerCase();

// Odczytujemy wyłącznie metadane. Teksty i rozważania Opoki nie są kopiowane.
export function parseMemorialConfirmation(html,date) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw new Error('Invalid confirmation date');
  const body=html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if(!body)throw new Error('Missing confirmation body');
  function field(name) {
    const matches=[...body.matchAll(new RegExp(`<div\\b[^>]*class=["'][^"']*\\b${name}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`,'gi'))];
    if(matches.length!==1)throw new Error('Missing or ambiguous confirmation field');
    return plainText(matches[0][1]);
  }
  const [year,month,day]=date.split('-').map(Number);
  if(field('data')!==`${day} ${MONTHS[month-1]} ${year}`)throw new Error('Confirmation date mismatch');
  const title=field('period_name');
  if(!/^Wspomnienie\b/i.test(title))throw new Error('Not a memorial confirmation');
  const references=[];
  for(const slot of ['czyt1','psalm','czyt2','ewangelia']) {
    const matches=[...body.matchAll(new RegExp(`<div\\b[^>]*class=["'][^"']*\\bsubsec\\b[^"']*\\b${slot}\\b[^"']*["'][^>]*>[^<]*<div\\b[^>]*>([\\s\\S]*?)<\\/div>`,'gi'))];
    if(!matches.length&&slot==='czyt2')continue;
    if(matches.length!==1)throw new Error('Missing or ambiguous reading reference');
    const reference=plainText(matches[0][1]);
    if(!/^(?:[1-3]\s*)?[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+\s+\d/.test(reference))throw new Error('Invalid reading reference');
    references.push(reference);
  }
  return {date,title,references,sourceUrl:MEMORIAL_SOURCE};
}

export function matchingReadingReferences(readings,confirmation) {
  const actual=readings.blocks.filter(block=>block.kind!=='acclamation').map(block=>normalizedReference(block.reference));
  const expected=confirmation.references.map(normalizedReference);
  return actual.length===expected.length&&actual.every((value,index)=>value===expected[index]);
}
