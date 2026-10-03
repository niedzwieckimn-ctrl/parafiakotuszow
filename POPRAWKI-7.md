# Poprawki 7 — telefon, intencje i proboszczowie

Paczka `parafia-kotuszow-v7-zmienione-pliki.zip` zawiera tylko zmienione i nowe pliki względem wersji 6. Rozpakuj do istniejącego repozytorium, zachowując katalogi, i zatwierdź na `main`. Nie trzeba usuwać żadnych plików. Nie zmieniono danych `content/`, zdjęć `assets/` ani danych `data/`. Jeżeli po wersji 6 wprowadzałeś własne zmiany w kodzie, najpierw porównaj pliki.

## Co zostało poprawione

- Na telefonie tekst nie leży na fotografii: Słowo na dziś i cytat → szybkie przejście do ogłoszeń/intencji → pełne zdjęcie → Myśl na dziś. Komputer zachowuje dotychczasowy układ.
- Zdjęcia w historii mieszczą cały kadr. Kliknięcie fotografii w opowieści otwiera zdjęcie, nie dodatkowy opis. Zdjęcia i skany można powiększać dwoma palcami, przesuwać jednym, powiększyć dwukrotnym dotknięciem i przywrócić przyciskiem „Całe zdjęcie”.
- W zwiedzaniu kliknięcie ambony, obrazu czy organów przybliża fotografowany detal. Na telefonie nie ma suwaka. Nawigacja między zdjęciami pozostaje dostępna. To fotograficzny spacer, nie odtworzona makieta 3D.
- W intencjach pojawia się plan najbliższych 14 dni także bez ręcznie dodanych wpisów. Niewpisana intencja jest wyświetlana jako „Za parafian”. Wyszukiwarka szuka w wyświetlanych intencjach, ignorując wielkość liter i polskie znaki.
- W panelu wybranie nowego dnia wczytuje stałe godziny Mszy, w tym kaplicę w Chańczy w niedzielę. Ksiądz może zostawić intencję pustą. Formularz, walidacja serwera i budowanie strony dopuszczają taki zapis. Wpisana później intencja zastępuje „Za parafian”.
- Opublikowany plan konkretnego dnia ma pierwszeństwo przed stałym porządkiem; wpis księdza ma pierwszeństwo przed importem. Plan dnia obejmuje wszystkie Msze tego dnia, dlatego nie usuwaj pozostałych godzin, chyba że dana Msza faktycznie nie będzie odprawiana. Nie dodajemy automatycznie regularnych godzin do dnia, którego plan został już opublikowany. W święta godziny trzeba podać w planie dnia, jeżeli różnią się od stałego porządku.
- Proboszczowie są uporządkowani od współczesności do najstarszych zapisów. Każde nazwisko otwiera opis i źródła. Krótkich zapisów nie uzupełniono wymyślonymi biografiami.
- Pierwszy jest ks. Patryk Kowalik, od 24.09.2026; ks. kan. Jerzy Sobczyk jest oznaczony jako emerytowany proboszcz. Te aktualizacje pochodzą z informacji przekazanej podczas przygotowania strony. Sprawdzona strona diecezji nadal wymienia wcześniejszą obsadę: administrator Patryk Kowalik od 2024 r. i proboszcz Jerzy Sobczyk. Nie przypisano tej stronie potwierdzenia daty 24.09.2026.

Źródło wcześniejszej obsady: https://diecezjasandomierska.pl/kotuszow-sw-jakuba-starszego-apostola/

## Netlify i panel

Bez nowych zmiennych ENV, zmiany hasła, tokenu GitHub czy ustawień Netlify. Nadal: build `node build.mjs`, katalog publikacji `dist`, funkcje `netlify/functions`. Nie zmieniono mechanizmu logowania i sesji. Nie dodano publicznych odnośników do `/admin/`.

## Weryfikacja lokalna

- 73/73 testy Node: logowanie/sesja, bezpieczeństwo, upload, albumy, automatyczne Słowo na dziś, kalendarz, nowe intencje i chronologia.
- 22 dodatkowe kontrole kalendarza i publicznych zasobów.
- Budowanie strony zakończone powodzeniem; sprawdzono składnię wszystkich plików JS/MJS.
- Przeglądarka: 320 i 390 px oraz powrót do 1280 px; brak poziomego przewijania w sprawdzonych widokach, wyszukiwanie i brak wyników, opisy Patryka i Antoniego, otwarcie zdjęcia z historii, podwójne kliknięcie powiększające, rzeczywiste zbliżenie ambony bez okna z opisem.
- Izolowany panel: logowanie fikcyjnymi danymi testowymi, wybranie niedzieli z czterema Mszami, publikacja bez wpisanych intencji i wylogowanie. Testowe dane zapisano wyłącznie w lokalnym, udawanym GitHub, nie w prawdziwym repozytorium.
- Gesty dwóch palców sprawdzono w testach kontrolera, nie na fizycznym smartfonie. Po wdrożeniu sprawdź je na Androidzie/iPhonie.

Nie wykonano push do GitHub ani wdrożenia na Netlify. Zapis w prawdziwym panelu i wynik deployu trzeba sprawdzić po wgraniu paczki.

## Powrót

Przed wgraniem zachowaj obecną wersję w Git. W razie problemu cofnij commit aktualizacji, pozostawiając późniejsze wpisy księdza i zdjęcia, a następnie pozwól Netlify ponownie zbudować stronę. Nie przywracaj hurtowo starszego katalogu `content/`.
