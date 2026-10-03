# Weryfikacja lokalna wersji 3 — 3 października 2026

- Budowanie `node build.mjs` zakończone powodzeniem; wynik w `dist`.
- Sprawdzona składnia modułów JavaScript i istnienie lokalnych zasobów.
- Testy dat: północ w Warszawie, czas letni/zimowy, zmiana roku, brak powtarzania wpisów w kolejnych latach, blokada niezatwierdzonego lokalnego kalendarza i odnośnik do właściwej daty.
- Import intencji: rzeczywisty archiwalny dokument, filtr bieżącej daty i przejście grudzień–styczeń. Nie są publikowane stare intencje jako aktualne.
- Lokalny kanał wiadomości i intencji: odpowiedzi HTTP 200 z rzeczywistych źródeł. To nie jest potwierdzenie wdrożenia na Netlify.
- Sześć zakładek i ścieżki historii sprawdzone przy szerokości 320 px: szerokość dokumentu 305 px (pozostałe 15 px to pasek przewijania), brak poziomego przepełnienia. Strona główna obejrzana przy 390 px i 1440 px.
- Historia: osiem kafelków; na wejściu nie jest otwarty żaden panel opowieści. Sprawdzono otwarcie ścieżki wojennej, właściwą fotografię transportu drewna przy ks. Sobczyku, sześć rozdziałów księgi w formie kafelków oraz otwarcie oryginalnego skanu s. 124 z czytelni testamentu.
- Mobilne menu działa. W spacerze jest 10 różnych zdjęć kościoła i detali, bez krajobrazów. Sprawdzono wybór widoku muszli z 2025 r. oraz suwak przybliżenia: po przybliżeniu zmiana `touch-action` na `none`, po oddaleniu powrót do `pan-y` (przewijanie strony).
- Wiadomości gminne są początkowo zamknięte. Po kliknięciu pobrano i wyświetlono sześć wiadomości z rzeczywistego źródła. Po zamknięciu nie są widoczne. Praktyczne sprawy parafialne i ogłoszenia są wyżej; archiwalne relacje parafialne są osobno. Poprawiono błędne oznaczenie odpustu: źródłowa zapowiedź jest z 17 lipca 2025, dotyczy obchodów 25 i 27 lipca 2025.
- Brak błędów JavaScript w sprawdzanym podglądzie.
- Wszystkie nowe fotografie zapisano w WebP, maksymalnie 1600 px szerokości. Nie użyto generowania ani retuszu; zdjęcia poza pierwszym widokiem są ładowane leniwie. Dodatkowe zasoby: 11 fotografii i 2 reprodukcje map. Oryginalne wcześniejsze JPEG Commons pozostają w paczce.
- Świeże testy: 22 kontrole kalendarza/importu/bezpieczeństwa i kontrole wersji 3 obejmujące 46 odwołań do lokalnych zasobów, 10 ujęć świątyni, brak ogólnego zdjęcia wypełniającego oś czasu, leniwy kanał gminy, priorytet ważnych ogłoszeń oraz pliki wynikowe `dist`.

## Do uruchomienia przez właściciela

- GitHub, Netlify, domena i konfiguracja OAuth panelu według README. Logowanie i publikacja przez CMS nie zostały sprawdzone na koncie właściciela.
- Potwierdzenie lokalnego kalendarza dla przygotowanych wpisów Słowa na dziś. Dopóki redaktor tego nie zatwierdzi, sekcja pokazuje link do aktualnych czytań.
- Wprowadzenie aktualnych intencji, jeżeli nadal nie ma ich u źródła. Ostatnie dostępne w czasie sprawdzania pochodziły z grudnia 2025.
- Potwierdzenie praw do nowych 13 materiałów wizualnych przed publicznym wdrożeniem. Są w lokalnym projekcie do oceny wyglądu, lecz ich publiczna licencja nie została potwierdzona. Dokładny wykaz w `PRAWA-DO-NOWYCH-ZDJEC.md`. Podpisy nie zastępują zgody. Kod, build i interakcje sprawdzono lokalnie; nie jest to potwierdzenie zgód na publikację.
