# Poprawki 3 — wersja 6

## Wgranie paczki

Paczka zawiera wyłącznie nowe i zmienione pliki względem `parafia-kotuszow-netlify-v5.zip`. Rozpakuj ją do katalogu istniejącego repozytorium, zachowując katalogi, porównaj ewentualne własne zmiany w kodzie i zatwierdź na `main`. Nie trzeba usuwać żadnego pliku. Nie podmieniaj całego repozytorium starszym pełnym ZIP-em.

Nie są zmieniane stare pliki `content/`, fotografie ani konfiguracja konta administratora. Dotychczasowe Netlify ENV pozostają takie same; nie potrzebujesz nowego hasła, tokenu ani klucza AI. Build nadal: `node build.mjs`; publish: `dist`; functions: `netlify/functions`. Paczka nie jest sama w sobie dowodem wdrożenia na domenie.

## Panel dla księdza

Otwórz bezpośrednio `https://parafiakotuszow.netlify.app/admin/` i zapisz adres w zakładkach. Publiczna strona nie ma odnośników do panelu.

- Ogłoszenie: „Dodaj ogłoszenie” → tytuł, data, treść → „Opublikuj”. Krótki opis powstanie z pierwszego akapitu, jeśli nie wpisano własnego. Plakat i dodatkowe ustawienia są opcjonalne.
- Intencje: „Wpisz intencje” → data, godzina, miejsce, intencja → „Opublikuj”. Kolejne Msze dodaje przycisk. Tytuł nowego dnia uzupełni serwer. Istniejące tytuły zostają zachowane.
- Album: „Dodaj zdjęcia” → tytuł, data, zaznaczenie wielu plików, autor i zgoda na publikację → „Opublikuj”. Do 30 zdjęć w jednym albumie. Pierwsze jest okładką; można je zmienić przy miniaturach. Opis jest opcjonalny.
- „Zapisz bez publikowania” przechowuje wpis do późniejszej edycji. Nie używaj panelu do danych poufnych: repozytorium i przesłane zdjęcia mogą być publicznie dostępne.

Albumy używają dotychczasowego `content/galeria/`: główna fotografia pozostaje w `image`, dodatkowe fotografie są w opcjonalnej tablicy `photos`. Stare pojedyncze zdjęcia nadal działają. Album jest dostępny w „Aktualności → Zdjęcia z życia parafii”; otwiera się w przeglądarce zdjęć z przyciskami, klawiaturą i przesuwaniem na telefonie. Albumy uroczystości nie trafiają do zwiedzania świątyni.

## Zdjęcia i bezpieczeństwo

Przeglądarka przygotowuje JPG do 2400 px i poniżej 900 KB; oryginał może mieć do 20 MB / 40 megapikseli. JPG, PNG i WebP; inne typy są odrzucane. Serwer zachowuje limit 2 MB na żądanie oraz niezależne sprawdzenie i ponowne kodowanie obrazu. Sesja, HttpOnly/Secure cookie, CSRF, walidacja ścieżek i blokada współbieżnych zapisów nie zostały osłabione.

Zdjęcia przesyłają się kolejno przez dotychczasowy zabezpieczony endpoint. Ich commity mają `[skip netlify]`; publikację uruchamia jeden zapis albumu, nie 20 zapisów wpisów. Nazwa pliku zależy od jego zawartości: ponowne przesłanie po zerwaniu połączenia nie tworzy drugiej kopii. Po częściowym błędzie pozostaw formularz otwarty i kliknij ponownie — już przesłane zdjęcia pozostają w nim zachowane. Odświeżenie strony utraci niezapisany formularz, dlatego zamknięcie karty jest ostrzegane. Wygaśnięcie sesji pozwala ponownie zalogować się bez czyszczenia formularza w tej samej karcie.

Zapis nadal odbywa się wyłącznie server-side. Dotychczasowy fine-grained GitHub token z uprawnieniem Contents: Read and write do tego jednego repozytorium wystarcza. Żaden sekret nie trafia do frontendowego bundle.

## Słowo na dziś

Generator `liturgical-rules-v3` pozostaje darmowym mechanizmem regułowym, nie zewnętrznym modelem AI. Korzysta z rzeczywistych źródeł właściwej daty w Europe/Warsaw, z porównaniem kalendarza i ochroną znanych obchodów lokalnych. Uwzględnia kilka rozpoznanych tematów Ewangelii, więcej wariantów językowych i treść cytatu. To zwiększa różnorodność; nie jest obietnicą niepowtarzalnego rozważania na każdą datę.

Wersja 13 naprawia brak wpisu 7 października 2026: przy wspomnieniach, których nagłówek różni się od nagłówka czytań dnia powszedniego, dodatkowo sprawdza datę, nazwę wspomnienia i wszystkie sygnatury czytań w [Opoce](https://opoka.org.pl/liturgia). Nie pomija walidacji świąt, uroczystości ani obchodów własnych parafii. Aklamacja jest oddzielona od psalmu, aby cytat nie otrzymał oznaczenia innej księgi. Brak wpisu nie jest przechowywany w CDN jako wynik na pół godziny.

Bez wiarygodnego wpisu pozostaje wyłącznie odnośnik do bieżących czytań. Nie wraca cytat z poprzedniego dnia. Dostępność źródeł na kolejne lata pozostaje warunkiem działania. Sprawdzona ręczna poprawka ma pierwszeństwo. Podpis „Myśl na dziś” oddziela autorską refleksję od dosłownego cytatu; publiczny ekran nie zawiera dopisków technicznych.

Frontend używa nowej ścieżki `/api/slowo-na-dzis/v3`, aby po wdrożeniu nie otrzymać wyniku poprzedniego generatora z trwałego cache CDN. Starsze ścieżki API pozostają dostępne. Wszystkie ścieżki są przekierowane w `netlify.toml` do tej samej funkcji; nie są potrzebne nowe zmienne ENV ani ręczne wpisy na każdy dzień. Wgraj wszystkie pliki z paczki do repozytorium i zaczekaj na ukończenie deployu Netlify, następnie odśwież stronę. Zasady cache oparto na [dokumentacji Netlify](https://docs.netlify.com/build/caching/caching-overview/).

## Materiał lotniczy 1944

Do „Historia → mapy” dodano opis i odnośnik do [Odkrywaj Szydłów](https://odkrywaj.szydlow.pl/gmina-szydlow-na-niemieckich-zdjeciach-lotniczych-z-1944-roku/). Podgląd fotografii jest ładowany z tego źródła, bez dodawania kopii do lokalnych zasobów. Zbiory: NARA; materiały odnalazł Marcin Zmarzlik; publikacja 11 czerwca 2026. Wskazane opracowanie nie podaje jasnej licencji zdjęcia. Nie przypisujemy autorstwa fotografii osobie, która odnalazła materiały, ani nie deklarujemy licencji Creative Commons. Przed lokalnym kopiowaniem należy ustalić prawa ze źródłem.

Podano „wrzesień 1944”: tekst artykułu wymienia 6 września, ale nazwa pliku Kotuszowa zawiera `19440918`. Nie rozstrzygamy tej rozbieżności bez sprawdzenia metryki oryginału. Podgląd zależy od dostępności serwisu źródłowego; odnośnik do opracowania pozostaje widoczny.

## Sprawdzenie po publikacji

1. Poczekaj na udany deploy. Sprawdź datę i Słowo, oba skróty oraz wygląd telefonu.
2. Zaloguj się; sprawdź błędne hasło, ponowne otwarcie panelu i wylogowanie.
3. Dodaj ogłoszenie, intencje i album. Poczekaj na publikację i sprawdź je na stronie. Zmiany wymagają udanego deployu, nie pojawiają się przed jego zakończeniem.
4. Cofnięcie: cofnij commit zawierający tę paczkę, nie commity z później dodanymi treściami. Wykonaj deploy wersji 5. Nie usuwaj `content/` ani `assets/uploads/`; stary publiczny interfejs pokaże okładkę nowych albumów, a dodatkowe zdjęcia pozostaną w danych.

Testy lokalne wykorzystują sztuczne dane logowania i atrapę GitHub, nie prawdziwy token ani prawdziwe zapisy w Twoim repozytorium. Test zapisu na Twoim GitHub i deployu pozostaje do wykonania po wgraniu ZIP-a.

Dokumentacja mechanizmu zapisów: [GitHub Contents API](https://docs.github.com/en/rest/repos/contents); [Netlify Functions](https://docs.netlify.com/build/functions/overview/).

## Zakres plików i czynności ręczne

Nowe pliki: `community-album.mjs`, `admin/photos.mjs`, `tests/changes-v6.test.mjs` oraz niniejsza instrukcja.

Zmienione pliki:

- Publiczna strona i build: `index.html`, `home.css`, `script.js`, `journey.mjs`, `daily-word-client.mjs`, `build.mjs`, `package.json`, `netlify.toml`.
- Panel: `admin/index.html`, `admin/panel.css`, `admin/panel.mjs`, `admin/schema.mjs`.
- Serwer: `netlify/lib/admin-content.mjs`, `netlify/lib/admin-github.mjs`, `netlify/lib/admin-security.mjs`, `netlify/lib/admin-service.mjs`, `netlify/lib/daily-word.mjs`.
- Testy i dokumentacja: `tests/daily-word.test.mjs`, `README.md`, `ADMIN-INSTRUKCJA.md`, `SLOWO-AUTOMATYCZNE.md`, `WERYFIKACJA.md`, `ZRODLA-I-LICENCJE.md`.

Do Netlify ENV nie dopisuj nic nowego. Zachowaj działającą konfigurację: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER=niedzwieckim-ctrl`, `GITHUB_REPO=parafiakotuszow`, `GITHUB_BRANCH=main`. Sekrety pozostają wyłącznie po stronie Functions, nigdy w plikach strony. Jeśli logowanie działa w obecnej wersji, nie generuj hasła ponownie.

Ręcznie wykonaj tylko: rozpakowanie paczki do istniejącego repozytorium, commit na `main`, oczekiwanie na poprawny deploy oraz test na własnej domenie według listy powyżej. Adres panelu zapisz księdzu w zakładkach przeglądarki.
