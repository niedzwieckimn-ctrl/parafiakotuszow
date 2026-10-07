import { readdir, readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { dirname, resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(root, 'dist');
if (dirname(output) !== root || output === root) throw new Error('Nieprawidłowy katalog wynikowy');

async function readCollection(name) {
  const folder = join(root, 'content', name);
  const filenames = await readdir(folder);
  const entries = [];
  for (const filename of filenames.filter(name => name.endsWith('.json'))) {
    const record = JSON.parse(await readFile(join(folder, filename), 'utf8'));
    if (record.published !== true) continue;
    if (name === 'slowo-na-dzis' && (record.reviewed !== true || record.localCalendarVerified !== true)) continue;
    if (!record.title?.trim() || !record.date || Number.isNaN(Date.parse(record.date))) {
      throw new Error(`Uzupełnij tytuł i datę: content/${name}/${filename}`);
    }
    if(record.photos!==undefined&&(!Array.isArray(record.photos)||record.photos.length>30))throw new Error(`Nieprawidłowy album: ${filename}`);
    if(record.photos?.length&&(!record.photos.includes(record.image)||new Set(record.photos).size!==record.photos.length))throw new Error(`Uzupełnij zdjęcie główne albumu: ${filename}`);
    for(const image of [record.image,...(record.photos||[])].filter(Boolean)) {
      if (typeof image !== 'string' || !/^\/?assets\//.test(image) || image.includes('..') || image.includes('\\') || !/\.(jpe?g|png|webp|gif|avif)$/i.test(image)) {
        throw new Error(`Nieprawidłowa ścieżka zdjęcia: ${filename}. Użyj biblioteki mediów (JPG, PNG, WebP, GIF lub AVIF).`);
      }
      const path = resolve(root, image.replace(/^\//, ''));
      if (!path.startsWith(join(root, 'assets') + sep)) throw new Error(`Zdjęcie spoza biblioteki: ${filename}`);
      await readFile(path);
    }
    if (name === 'intencje') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date) || new Date(record.date + 'T12:00:00Z').toISOString().slice(0,10) !== record.date) throw new Error(`Błędny dzień nabożeństw: ${filename}`);
      if (!Array.isArray(record.masses) || !record.masses.length || record.masses.some(mass => !/^([01]?\d|2[0-3]):[0-5]\d$/.test(mass.time) || (mass.intention!==undefined && typeof mass.intention!=='string'))) throw new Error(`Uzupełnij poprawne godziny Mszy: ${filename}`);
      if (entries.some(entry => entry.date === record.date)) throw new Error(`Dwa wpisy intencji na ten sam dzień: ${record.date}. Połącz Msze w jednym wpisie.`);
    }
    if (name === 'slowo-na-dzis') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date) || new Date(record.date + 'T12:00:00Z').toISOString().slice(0,10) !== record.date) throw new Error(`Błędna data Słowa na dziś: ${filename}`);
      if (record.calendarScope !== 'PL-SANDOMIERZ-KOTUSZOW' || !record.liturgicalDay || !record.quote || !record.reference || !record.reflection || !record.cycle || !record.calendarNote) throw new Error(`Uzupełnij treść i weryfikację kalendarza: ${filename}`);
      const source = new URL(record.readingsUrl);
      if (source.protocol !== 'https:' || !source.hostname || !record.verifiedAt) throw new Error(`Uzupełnij źródło i datę sprawdzenia: ${filename}`);
      if (entries.some(entry => entry.date === record.date)) throw new Error(`Dwa wpisy Słowa na dziś: ${record.date}`);
    }
    if (record.source && !/^https?:\/\//.test(record.source)) throw new Error(`Źródło musi być linkiem http(s): ${filename}`);
    entries.push(record);
  }
  return entries.sort((a, b) => (name === 'ogloszenia' ? Number(b.pinned === true) - Number(a.pinned === true) : 0) || new Date(b.date) - new Date(a.date));
}

const data = {
  announcements: await readCollection('ogloszenia'),
  gallery: await readCollection('galeria'),
  intentions: await readCollection('intencje'),
  dailyWords: await readCollection('slowo-na-dzis'),
};
await mkdir(join(root, 'data'), { recursive: true });
await writeFile(join(root, 'data', 'admin-content.json'), JSON.stringify(data, null, 2) + '\n');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const filename of ['index.html', 'styles.css', 'home.css', 'tour.css', 'mobile.css', 'script.js', 'public-links.mjs', 'google-tour.mjs', 'photo-viewer.mjs', 'mass-schedule.mjs', 'priests.mjs', 'mobile-layout.mjs', 'mobile-menu.mjs', 'community-album.mjs', 'daily-word-client.mjs', 'tour-hotspots.mjs', 'journey.mjs', 'church-photos.mjs', 'calendar.mjs', 'history-chapters.mjs', 'robots.txt', 'ZRODLA-I-LICENCJE.md', 'PRAWA-DO-NOWYCH-ZDJEC.md']) {
  await cp(join(root, filename), join(output, filename));
}
for (const folder of ['assets', 'data']) {
  await cp(join(root, folder), join(output, folder), { recursive: true });
}
await mkdir(join(output,'admin'),{recursive:true});
for (const filename of ['index.html','panel.css','panel.mjs','schema.mjs','photos.mjs']) {
  await cp(join(root,'admin',filename),join(output,'admin',filename));
}
console.log(`Gotowe: dist/ — ${data.announcements.length} ogłoszeń, ${data.gallery.length} zdjęć, ${data.intentions.length} dni intencji.`);
