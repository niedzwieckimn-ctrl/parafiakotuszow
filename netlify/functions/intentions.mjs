import { plainText } from './news.mjs';
const SOURCE = 'https://www.parafiakotuszow.pl/intencje';
const MONTHS = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
export function warsawDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year:'numeric', month:'2-digit', day:'2-digit' }).format(now);
}

// Tylko publiczny HTML; nigdy nie wykonujemy skryptów z pobranej strony.
export function parseIntentions(html, now = new Date()) {
  const documents = [];
  for (const match of html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)) {
    const article = match[1];
    const title = plainText(article.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
    const publishedAt = article.match(/<time\b[^>]*datetime="([^"]+)"/i)?.[1];
    if (!title || !publishedAt || Number.isNaN(Date.parse(publishedAt))) continue;
    const years = title.match(/\b20\d{2}\b/g);
    const firstYear = years ? Number(years[0]) : new Date(publishedAt).getUTCFullYear();
    const lastYear = years ? Number(years[years.length - 1]) : firstYear;
    const body = article.slice(article.indexOf('intention-content'));
    const days = [];
    let day;
    let previousMonth = -1;
    let currentYear = firstYear;
    for (const block of body.matchAll(/<(h[23]|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
      const value = plainText(block[2]);
      if (block[1].toLowerCase() !== 'p') {
        const lower = value.toLocaleLowerCase('pl');
        const month = MONTHS.findIndex(name => lower.includes(name));
        const number = lower.match(/\b(\d{1,2})\b/);
        day = undefined;
        if (month < 0 || !number) continue;
        if (month < previousMonth) currentYear = lastYear;
        const date = `${currentYear}-${String(month + 1).padStart(2,'0')}-${number[1].padStart(2,'0')}`;
        if (new Date(date + 'T12:00:00Z').toISOString().slice(0,10) !== date) continue;
        day = { title: value, date, masses: [], sourceUrl: SOURCE };
        days.push(day);
        previousMonth = month;
      } else if (day && value) {
        const mass = value.match(/^(\d{1,2})[:.](\d{2})\s*([\s\S]*)$/);
        if (mass && Number(mass[1]) < 24 && Number(mass[2]) < 60) {
          day.masses.push({ time: `${mass[1].padStart(2,'0')}:${mass[2]}`, place: '', intention: mass[3].trim() });
        } else if (day.masses.length) {
          day.masses[day.masses.length - 1].intention += ' ' + value;
        }
      }
    }
    documents.push({ title, publishedAt, days: days.filter(day => day.masses.length) });
  }
  documents.sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  if (!documents.length) throw new Error('Nie rozpoznano publikacji intencji');
  const today = warsawDate(now);
  const unique = new Map();
  for (const document of documents) {
    for (const day of document.days) if (day.date >= today && !unique.has(day.date)) unique.set(day.date, day);
  }
  return {
    sourceUrl: SOURCE,
    latestTitle: documents[0].title,
    latestPublishedAt: documents[0].publishedAt,
    fetchedAt: now.toISOString(),
    days: [...unique.values()].sort((a,b) => a.date.localeCompare(b.date)).slice(0,21),
  };
}

export default async function handler(request) {
  if (!['GET','HEAD'].includes(request.method)) return new Response(null, {status:405, headers:{Allow:'GET, HEAD'}});
  try {
    const response = await fetch(SOURCE, { signal:AbortSignal.timeout(8000), headers:{Accept:'text/html'} });
    if (!response.ok) throw new Error('Źródło niedostępne');
    const html = await response.text();
    if (html.length > 2_000_000) throw new Error('Zbyt duża odpowiedź');
    const data = parseIntentions(html);
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(data), {headers:{
      'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'public, max-age=300',
      'Netlify-CDN-Cache-Control':'public, durable, max-age=1800, stale-while-revalidate=3600',
    }});
  } catch {
    return new Response(request.method === 'HEAD' ? null : JSON.stringify({error:'Nie udało się pobrać intencji.'}), {status:502, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  }
}
