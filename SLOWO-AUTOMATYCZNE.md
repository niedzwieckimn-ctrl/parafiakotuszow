# Automatyczne Słowo otuchy — wersja 5

## Uruchomienie

1. Wgraj pliki z paczki zmian do istniejącego repozytorium, zachowując strukturę katalogów. Paczka jest względem wersji 4; nie podmieniaj własnych późniejszych zmian bez porównania.
2. Zatwierdź zmiany na `main` i poczekaj na poprawny deploy Netlify. Zostaje istniejący build `node build.mjs`, katalog `dist` i Functions `netlify/functions`.
3. Nie dodawaj nowych ENV, haseł, tokenów ani kont AI. Dotychczasowa konfiguracja panelu pozostaje bez zmian. Netlify Blobs używa kontekstu funkcji, nie sekretu w przeglądarce.
4. Otwórz stronę główną. Słowo powstaje po pobraniu źródeł przy pierwszej wizycie dnia, a nie o północy bez odwiedzin. Przy kolejnych odwiedzinach działa cache. W panelu otwórz „Słowo otuchy”, aby zobaczyć automatyczny podgląd.

## Jak powstaje tekst

- Funkcja serwerowa pobiera wyłącznie stałe, datowane adresy Mateusza oraz roczny kalendarz Sandomierza GCatholic. Nie przyjmuje dowolnych adresów ani historycznej daty od użytkownika.
- Sprawdza rok, widoczną datę źródła, główny obchód kalendarza i komplet podstawowych czytań. Pomija wspomnienia dowolne jako dodatkowe warianty kalendarza.
- Wybiera krótki dosłowny cytat z części „Czytania”, zwykle z psalmu, oraz rzeczywiste oznaczenie tego fragmentu. Przy psalmie wskazuje zakres wersetów podany w źródle; nie dopisuje nieustalonego numeru pojedynczego wersetu. Maksymalnie 25 słów. Nie pobiera cudzych komentarzy do publikacji.
- Opracowuje krótką, podpisaną refleksję według tematu cytatu: zaufanie, miłosierdzie, światło Słowa, miłość, wdzięczność lub modlitwa. To własny **generator regułowy**, nie LLM/AI. Fragmenty jego języka mogą się powtarzać przy podobnych psalmach; nie jest to obietnica niepowtarzalnego rozważania każdego dnia.
- Dokładny fragment Łk 10,20 na 3 października 2026 otrzymuje tytuł i refleksję przekazane przez właściciela strony, jeśli występuje w odczytanej Ewangelii. Nie jest pokazywany automatycznie w innej dacie bez tego czytania.
- Niedzielny rok A/B/C zmienia się w pierwszą niedzielę Adwentu; powszedni cykl I/II według roku kalendarzowego. Najważniejszą podstawą jest jednak rzeczywiście datowana strona czytań, nie sam numer cyklu.

## Kalendarz i bezpieczne wyjątki

Źródła: [czytania Mateusza](https://mateusz.pl/czytania/), [kalendarz Sandomierza 2026 w GCatholic](https://gcatholic.org/calendar/2026/PL-sand1-pl), [oficjalny opis parafii](https://diecezjasandomierska.pl/kotuszow-sw-jakuba-starszego-apostola/).

GCatholic jest zewnętrznym kalendarzem, nie oficjalnym Ordo diecezji ani potwierdzeniem wszystkich miejscowych przeniesień obchodów. Kod nie pozoruje zatwierdzenia redaktora. Znane dni wymagające potwierdzenia czytań własnych są zabezpieczone: 25 lipca (patron parafii), 11 listopada (rocznica poświęcenia). Strona wtedy nie losuje czytań zwykłego dnia; administrator może opublikować sprawdzoną poprawkę z właściwym linkiem. Niezapowiedziane lokalne zmiany nadal wymagają redakcyjnej poprawki.

OWMR 358 dopuszcza czytania dnia powszedniego we wspomnieniach bez czytań własnych NT. Zasada ma źródło w [oficjalnych objaśnieniach liturgicznych, s. 21](https://archidiecezjakatowicka.pl/images/ordo/2026/objasnienia2026.pdf); dokument nie służy jako kalendarz Sandomierza. Automat stosuje tę regułę tylko do jawnej listy: Faustyna Kowalska, Wincenty Kadłubek, Teresa od Dzieciątka Jezus, Teresa od Jezusa, Ignacy Antiocheński, Jan Kanty, Franciszek Ksawery, Ambroży, Franciszek Salezy. Wymaga rangi wspomnienia i zgodnego dnia tygodnia. Nie rozszerza tej zgody na uroczystości, święta ani dowolnego nieznanego świętego. W panelu podaje, że wykorzystano czytania dnia powszedniego.

Jeśli datowana strona źródła nie jest jeszcze dostępna, zmieni układ, kalendarz jest niepełny albo właściwy obchód nie daje się potwierdzić, wyświetla się tylko bieżący odnośnik i ewentualna informacja o lokalnym obchodzie. Żaden wcześniejszy cytat nie zastępuje dzisiejszego. Bez dostępu do źródeł i bez cache nie można uczciwie zagwarantować codziennego tekstu.

## Ręczna poprawka

Podgląd nie wymaga zapisu do GitHub. Po kliknięciu „Przygotuj ręczną poprawkę” sprawdź treść, kalendarz i link, dopiero potem zaznacz potwierdzenia oraz publikację. Zapis trafia do dotychczasowego `content/slowo-na-dzis/` i uruchamia zwykły deploy. Zweryfikowana poprawka wygrywa z automatem dokładnie w swojej dacie. Usunięcie lub wyłączenie publikacji przywraca automat po deployu. Stare pliki nie zostały zmienione.

## Cache i koszty

Blobs przechowuje wynik daty do odświeżenia po 6 godzinach, a kalendarz roku przez 24 godziny. CDN Netlify: 30 minut z jawnym `Netlify-Vary: query=date`; przeglądarka: do minuty. Nie użyto `stale-while-revalidate`. Po północy w Warszawie strona używa innego klucza i odrzuca spóźnioną odpowiedź starego dnia. Otwarta karta sprawdza zmianę co 30 sekund i po powrocie do niej. Nie powstają codzienne commity ani deploye.

Nie dochodzi płatna usługa AI. Zapytania, funkcje, transfer i Blobs wciąż zużywają limity planu Netlify; darmowy plan nie oznacza nieograniczonego ruchu. Niedostępność Blobs nie blokuje generowania z bieżących źródeł, lecz wyłącza trwały cache.

## Test po wdrożeniu i wycofanie

- Na stronie głównej sprawdź dzisiejszą datę, cytat, podpis refleksji i datowany link do czytań. W narzędziach przeglądarki `/api/slowo-na-dzis?date=RRRR-MM-DD` powinien zwrócić bieżącą datę, `entry.automated: true` i metodę `liturgical-rules-v1`. Dla chronionego obchodu `entry: null` jest celowym zachowaniem.
- W panelu zobacz podgląd; pustą listę ręcznych wpisów można pozostawić pustą. Sprawdź opcjonalną poprawkę i po deployu jej pierwszeństwo. Nie używaj haseł ani tokenów w publicznym zapytaniu.
- Cofnij commit tej paczki i wykonaj deploy poprzedniej wersji, aby wrócić do wersji 4. Nie usuwaj danych `content/` ani zdjęć. Zapisany cache jest w oddzielnym sklepie `parafia-daily-word-v1`, nie zmienia sesji administratora.

Lokalne testy są dowodem działania kodu i kontaktu ze źródłami, nie dowodem wdrożenia w Twoim Netlify. Ostateczny test po deployu musi odbyć się na Twojej domenie.
