export const CALENDAR_SCOPE = 'PL-SANDOMIERZ-KOTUSZOW';

export function warsawDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Warsaw', year:'numeric', month:'2-digit', day:'2-digit'}).format(now);
}

export function readingsUrl(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Nieprawidłowa data czytań');
  return `https://mateusz.pl/czytania/${date.slice(0,4)}/${date.replaceAll('-','')}.html`;
}

// Kalendarz jest redakcyjny: pełna data obejmuje rok i właściwy cykl.
// Obchody lokalne mają być sprawdzone w konkretnym wpisie, nie wyliczane z dnia miesiąca.
export function selectDailyWord(entries, now = new Date()) {
  const date = warsawDay(now);
  const entry = entries.find(item => item.date === date && item.published === true && item.reviewed === true && item.localCalendarVerified === true && item.calendarScope === CALENDAR_SCOPE && item.liturgicalDay && item.title && item.quote && item.reference && item.reflection && item.cycle && item.calendarNote && /^https:\/\//.test(item.readingsUrl));
  return { date, entry: entry || null, url: entry?.readingsUrl || readingsUrl(date) };
}
