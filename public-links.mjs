// Źródła zachowujemy w danych, ale nie odsyłamy odwiedzających do zastępowanej witryny.
export function safeSourceUrl(value) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    if (host === 'parafiakotuszow.pl' || host.endsWith('.parafiakotuszow.pl')) return '';
    return url.href;
  } catch { return ''; }
}
