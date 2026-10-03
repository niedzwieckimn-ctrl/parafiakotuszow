# Weryfikacja lokalna wersji 6 — Poprawki 3, 3 października 2026

- Build `node build.mjs` oraz 64 testy Node zaliczone. Dodatkowo 22 starsze kontrole kalendarza i importu zaliczone. Kontrola składni obejmuje wszystkie źródłowe pliki JS/MJS, bez zależności i `dist`.
- Testy zabezpieczeń: poprawne i błędne logowanie, brak dostępu bez sesji, cookie HttpOnly/Secure/SameSite=Strict, wygaśnięcie i wylogowanie, CSRF/Origin, walidacja ścieżek, typów i wielkości zdjęć, zachowanie istniejących danych, konflikty SHA. GitHub i sesje w testach są izolowane, nie produkcyjne.
- Test 20 rzeczywistych obrazów przetworzonych przez sharp: zapis jako jeden album, walidacja istnienia wszystkich zdjęć przed zapisem, jedna publikacja wpisu i idempotentne ponowienie uploadu. Nowa tablica `photos` jest opcjonalna; dotychczasowe pojedyncze fotografie nadal działają.
- W przeglądarce na lokalnym panelu: logowanie, wpisanie intencji bez obowiązkowego tytułu, wybór wielu plików i publikacja 20 zdjęć po przetworzeniu przez canvas, ponowne otwarcie panelu z sesją, wylogowanie i brak powrotu do panelu po odświeżeniu. Dane nie trafiły do prawdziwego repozytorium ani `content/`.
- Publiczny album w aktualnościach: otwarcie, przycisk następnego zdjęcia, klawiatura, licznik i zamknięcie sprawdzone w przeglądarce. Gest przesuwania jest zaimplementowany, ale nie był sprawdzony na fizycznym telefonie. Albumy wielozdjęciowe nie dodają przystanków spaceru.
- Widoki strony głównej 390 i 320 px, albumu i formularza intencji 320 px: brak poziomego przepełnienia. Przy 320 px szerokość dokumentu wynosiła 305 px, pozostałe 15 px to pasek przewijania. Sprawdzono menu mobilne i przejście do wnętrza kościoła; spacer zachowuje 15 istniejących ujęć.
- Nowy materiał w „Historia → Czytelnia map”: podgląd zdjęcia Kotuszowa z 1944 r. ładuje się ze źródła i ma szerokość naturalną 945 px. Poprawiono kontrast opisu sekcji map. Link prowadzi do podanej publikacji Odkrywaj Szydłów. Nie potwierdzono licencji na lokalne kopiowanie materiału.
- Rzeczywiste źródła: generowanie wersją `liturgical-rules-v2` dla 3, 4 i 10 października 2026 dało różne, związane z czytaniami teksty. Próba dla 3 kwietnia 2027 nie miała dostępnego źródła i zwróciła brak wpisu, nie poprzedni tekst. Nie gwarantujemy tekstu za pół roku, jeśli źródła pozostają niedostępne. Nowa ścieżka API `/api/slowo-na-dzis/v2` oddziela frontend od trwałego cache poprzedniej wersji.
- Publiczna strona nie ma linków do administratora ani technicznego dopisku przy refleksji. Nie ma sekretów w wynikowym frontendzie. Nie zmieniono dotychczasowych plików `content/`, `data/` ani fotografii.
- **Ograniczenia:** nie wykonano prawdziwego zapisu GitHub, push ani deployu Netlify. Zapis do rzeczywistego repozytorium, produkcyjne bundlowanie Functions, Blobs i limity konta wymagają testu właściciela po wgraniu paczki. Nie zmieniono ENV ani hasła administratora. Kalendarz GCatholic nie zastępuje oficjalnego Ordo; nieznane obchody lokalne wymagają sprawdzonej poprawki.

Instrukcja wgrania, obsługi i wycofania: `POPRAWKI-3-WDROZENIE.md`. Paczka obejmuje wyłącznie różnice względem zweryfikowanego ZIP-a wersji 5.

## Archiwalna weryfikacja lokalna wersji 5 — 3 października 2026

- Publiczny build i 54 testy Node zaliczone: 32 dotychczasowe oraz 22 dotyczące automatycznego słowa. Dodatkowo 22 starsze kontrole i kontrola zasobów/historii zaliczone.
- W rzeczywistych źródłach sprawdzono generowanie dla 3, 4 i 5 października 2026: różne czytania i teksty; 5 października nazwa wspomnienia Faustyny Kowalskiej pochodzi z kalendarza Sandomierza, tekst z czytań powszednich. Sprawdzono też wspomnienie Wincentego Kadłubka 9 października oraz brak automatycznie zgadywanych czytań w miejscową rocznicę poświęcenia 11 listopada.
- Testy: dosłowność cytatu, brak kopiowania komentarzy, złe daty/rok/diecezja, niepełny kalendarz, uroczystości lokalne, cykl na granicy Adwentu, cache, awaria źródła, brak Blobs, równoległe wizyty, opóźniona odpowiedź starego dnia i północ w Warszawie, pierwszeństwo zatwierdzonej poprawki. Publiczna funkcja nie korzysta z GitHub ani sekretów administratora.
- Podgląd przeglądarkowy na lokalnym serwerze: rzeczywiście pobrany i wygenerowany tekst widoczny u góry; właściwe źródła i datowany link. Szerokości 390 i 320 px bez przepełnienia poziomego (odpowiednio dokument 375 i 305 px plus pasek przewijania). Panel pokazuje automatyczny podgląd, opcjonalna poprawka otwiera istniejący wpis bez nadpisania. Sesja i repozytorium w tym podglądzie są izolowaną symulacją.
- Nie przebudowano pozostałej części publicznej strony, nie zmieniono danych `content/` ani zdjęć. Nowy moduł klienta trafia do publicznego `dist`, biblioteki serwerowe i sekrety nadal nie.
- Paczka zmian względem wersji 4; nie wykonano push do prawdziwego GitHub ani deployu Netlify. Nowa funkcja wymaga końcowego testu na domenie właściciela po deployu. Nie potwierdzono produkcyjnego bundlowania ani limitów planu. GCatholic jest źródłem zewnętrznym, nie oficjalnym Ordo; nieznane przeniesienia lokalne wymagają poprawki administratora.

Uruchomienie i ograniczenia: `SLOWO-AUTOMATYCZNE.md`. Brak nowych ENV i kluczy AI.

## Archiwalna weryfikacja wersji 4 — 3 października 2026

- `node build.mjs`: poprawne budowanie publicznej strony. `node --test tests/*.test.mjs`: 32 testy, 32 zaliczone. Dodatkowo 22 wcześniejsze kontrole kalendarza/importu i kontrola lokalnych zasobów/historii zakończone powodzeniem.
- Poprawne i błędne logowanie, ochrona wszystkich endpointów bez sesji, HttpOnly/Secure/SameSite=Strict, utrzymanie sesji po odświeżeniu, wygaśnięcie, zmiana hasha, wylogowanie unieważniające skopiowane cookie, CSRF i Origin.
- GitHub: kontrakt API testowany na izolowanej symulacji, z gałęzią `main`, wersjami SHA, konfliktem edycji, odczytem, zapisem i usuwaniem. Blokada CAS serializuje zapisy; limiter działa między instancjami. Nie zapisano do prawdziwego repozytorium.
- Upload: rzeczywiste dekodowanie i ponowne kodowanie przez sharp; JPG, PNG, WebP, limit 2 MB, odrzucenie SVG/HTML, fałszywego MIME i ścieżek traversal. Sprawdzony odczyt GitHub raw dla plików powyżej 1 MB. Zależności produkcyjne: `pnpm audit --prod` nie wykazał znanych podatności w dniu kontroli.
- W przeglądarce na izolowanym lokalnym API: błędne i poprawne logowanie, powrót po odświeżeniu, dodanie/edycja/usunięcie ogłoszenia, upload zdjęcia, intencje, blokada niezatwierdzonego słowa otuchy i wylogowanie. Testowe zmiany nie dotknęły plików źródłowych `content/` ani prawdziwego GitHub.
- Panel sprawdzony przy szerokościach 390 i 320 px. Sześć publicznych zakładek przy 320 px: dokument 305 px (15 px pasek przewijania), brak poziomego przepełnienia. Spacer: 15 fotografii, przejście punktami w obrazie od bramy do wnętrza i do nowego zdjęcia ołtarza; opis detalu otwiera dialog. Poprawiono szerokości przycisków mobilnego paska.
- Usunięto powtarzaną stałą refleksję na starcie i widoczne określenie „oficjalny serwis parafii”. Dzienny wpis nadal wybierany jest wyłącznie po pełnej dacie Europe/Warsaw; bez zatwierdzonej treści nie pokazuje starego cytatu. Przykłady nie mają potwierdzonego lokalnego Ordo i pozostały niewidoczne.
- `dist/` nie zawiera Decap, starego config.yml, bibliotek serwerowych, testów, narzędzi ani wartości sekretów. Istniejące pliki `content/` zachowano bez zmian.
- **Ograniczenia:** nie było uwierzytelnionego dostępu do aktualnego `main` ani projektu Netlify. Testy nie potwierdzają produkcyjnego Blobs, tokenu, deployu ani reguł limitów. Próba lokalnego bundlowania funkcji narzędziem Netlify została zablokowana przez odmowę dostępu przy odczycie katalogu nadrzędnego przez proces esbuild w Windows. Moduły przechodzą kontrolę składni i testy, ale natywny pakiet funkcji musi zostać potwierdzony pierwszym buildem Netlify/Linux.

Instrukcja ENV, tokenu, hasha, testów produkcyjnych i wycofania: `ADMIN-INSTRUKCJA.md`. Paczka zmian jest względem przekazanej wersji 3; porównaj ją z aktualnym repozytorium przed podmianą, jeśli zmieniałeś kod później.

## Archiwalna weryfikacja wersji 3

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

- GitHub, Netlify i domena według README; własny panel według ADMIN-INSTRUKCJA.md. Logowanie i publikacja produkcyjna wymagają testów na koncie właściciela. Dawne ustawienia OAuth nie są używane przez wersję 4.
- Ręczne poprawki Słowa na dziś wymagają potwierdzenia lokalnego kalendarza. Automat wersji 5 działa niezależnie; lokalne obchody wymagające innych czytań i niepotwierdzone źródła pozostają zabezpieczone zgodnie z SLOWO-AUTOMATYCZNE.md.
- Wprowadzenie aktualnych intencji, jeżeli nadal nie ma ich u źródła. Ostatnie dostępne w czasie sprawdzania pochodziły z grudnia 2025.
- Potwierdzenie praw do 13 materiałów wersji 3 oraz pięciu nowych fotografii użytkownika przed publicznym wdrożeniem. Wykaz w `PRAWA-DO-NOWYCH-ZDJEC.md` i `ZRODLA-I-LICENCJE.md`. Podpisy nie zastępują zgody. Kod, build i interakcje sprawdzono lokalnie; nie jest to potwierdzenie zgód na publikację.
