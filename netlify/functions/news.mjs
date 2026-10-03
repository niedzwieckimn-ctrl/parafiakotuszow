const SOURCE = 'https://www.szydlow.pl';
const cacheHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=300',
  'Netlify-CDN-Cache-Control': 'public, durable, max-age=21600, stale-while-revalidate=86400',
  'X-Content-Type-Options': 'nosniff',
};

export function plainText(html = '') {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»', bdquo: '„', rdquo: '”', lsquo: '‘', rsquo: '’' };
  return String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, entity) => {
      if (entity[0] !== '#') return entities[entity] ?? match;
      const code = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
    }).replace(/\s+/g, ' ').trim();
}

export function normalizePost(post) {
  if (!Number.isInteger(post?.id) || !post.title?.rendered || !post.date || Number.isNaN(Date.parse(post.date))) return null;
  let url;
  try { url = new URL(post.link); } catch { return null; }
  if (url.protocol !== 'https:' || !['szydlow.pl', 'www.szydlow.pl'].includes(url.hostname)) return null;
  const excerpt = plainText(post.excerpt?.rendered).replace(/\[\s*…\s*\]$/, '');
  return { id: post.id, date: post.date, title: plainText(post.title.rendered), excerpt: excerpt.length > 220 ? excerpt.slice(0, 217).replace(/\s+\S*$/, '') + '…' : excerpt, url: url.href };
}

export default async function handler(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } });
  try {
    const endpoint = new URL('/wp-json/wp/v2/posts', SOURCE);
    endpoint.search = new URLSearchParams({ search: 'Kotuszów', per_page: '12', _fields: 'id,date,link,title,excerpt', order: 'desc', orderby: 'date' }).toString();
    const upstream = await fetch(endpoint, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
    if (!upstream.ok) throw new Error(`Źródło HTTP ${upstream.status}`);
    const raw = await upstream.text();
    if (raw.length > 1_000_000) throw new Error('Zbyt duża odpowiedź');
    const posts = JSON.parse(raw);
    if (!Array.isArray(posts)) throw new Error('Nieprawidłowa odpowiedź');
    const articles = posts.map(normalizePost).filter(Boolean).sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    if (!articles.length) throw new Error('Brak wiadomości');
    const body = JSON.stringify({ source: 'Miasto i Gmina Szydłów', sourceUrl: SOURCE, fetchedAt: new Date().toISOString(), articles });
    return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers: cacheHeaders });
  } catch {
    return new Response(request.method === 'HEAD' ? null : JSON.stringify({ error: 'Źródło wiadomości jest chwilowo niedostępne.' }), { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
}
