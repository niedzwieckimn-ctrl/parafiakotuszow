export const defaultIntention = value => typeof value === 'string' && value.trim() ? value.trim() : 'Za parafian';
export const normalizeSearch = value => String(value || '').toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
export function matchesIntention(mass, query) {
  return normalizeSearch(query).trim().split(/\s+/).filter(Boolean).every(term => normalizeSearch(defaultIntention(mass.intention)).includes(term));
}
// Opublikowany plan redaktora/importu zastępuje cały stały plan danego dnia.
// Pusty plan oznacza świadome odwołanie Mszy, nie powód do odtworzenia godzin.
export function massSchedule(local = [], remote = [], today, count = 14) {
  const merged = new Map();
  for (let offset = 0; offset < count; offset++) {
    const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + offset);
    const key = date.toISOString().slice(0,10), sunday = date.getUTCDay() === 0;
    const slots = sunday ? [['09:00','Kościół w Kotuszowie'],['10:30','Kaplica w Chańczy'],['12:00','Kościół w Kotuszowie'],['16:00','Kościół w Kotuszowie']] : [['17:00','Kościół w Kotuszowie']];
    merged.set(key, {date:key, title:new Intl.DateTimeFormat('pl',{weekday:'long',timeZone:'UTC'}).format(date), regular:true, masses:slots.map(([time,place])=>({time,place,intention:''}))});
  }
  for (const days of [remote, local]) for (const day of days) if (day.date >= today && Array.isArray(day.masses)) merged.set(day.date, {...day, regular:false});
  return [...merged.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(day=>({...day,masses:[...day.masses].sort((a,b)=>a.time.padStart(5,'0').localeCompare(b.time.padStart(5,'0'))).map(mass=>({...mass,intention:defaultIntention(mass.intention)}))}));
}
