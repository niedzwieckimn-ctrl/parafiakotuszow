# Weryfikacja lokalna — 3 października 2026

- Budowanie `node build.mjs` zakończone powodzeniem; wynik w `dist`.
- Sprawdzona składnia modułów JavaScript i istnienie lokalnych zasobów.
- Testy dat: północ w Warszawie, czas letni/zimowy, zmiana roku, brak powtarzania wpisów w kolejnych latach, blokada niezatwierdzonego lokalnego kalendarza i odnośnik do właściwej daty.
- Import intencji: rzeczywisty archiwalny dokument, filtr bieżącej daty i przejście grudzień–styczeń. Nie są publikowane stare intencje jako aktualne.
- Lokalny kanał wiadomości i intencji: odpowiedzi HTTP 200 z rzeczywistych źródeł. To nie jest potwierdzenie wdrożenia na Netlify.
- Wszystkie sześć zakładek sprawdzone przy szerokości 320 px; brak poziomego przepełnienia po korekcie godzin nabożeństw. Widok 390 px i komputer 1440 px obejrzane wizualnie.
- Sprawdzono mobilne menu, otwieranie opisów osi czasu, obrazów źródłowych, przechodzenie między skanami oraz dziewięć przystanków spaceru i przełącznik pełnego kadru.
- Brak błędów JavaScript w sprawdzanym podglądzie.
- Fotografie do wyświetlania: 3,17 MB w WebP zamiast 18,45 MB JPEG (około 83% mniej); oryginały pozostają w paczce. Zdjęcia poza pierwszym widokiem są ładowane leniwie.

## Do uruchomienia przez właściciela

- GitHub, Netlify, domena i konfiguracja OAuth panelu według README. Logowanie i publikacja przez CMS nie zostały sprawdzone na koncie właściciela.
- Potwierdzenie lokalnego kalendarza dla przygotowanych wpisów Słowa na dziś. Dopóki redaktor tego nie zatwierdzi, sekcja pokazuje link do aktualnych czytań.
- Wprowadzenie aktualnych intencji, jeżeli nadal nie ma ich u źródła. Ostatnie dostępne w czasie sprawdzania pochodziły z grudnia 2025.
- Uzyskanie zgody właścicieli na ewentualne dodatkowe współczesne teksty i historyczne fotografie bez publicznej licencji. Same podpisy nie zastępują zgody.
