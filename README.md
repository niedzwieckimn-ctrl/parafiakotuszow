# Parafia św. Jakuba w Kotuszowie

Strona przygotowana do repozytorium GitHub i publikacji przez Netlify. Kod frontendu nie wymaga bibliotek. Budowanie używa Node.js 22 i polecenia `node build.mjs` (bez npm install).

**Wersja 3: lokalny projekt do oceny wyglądu.** Przed publiczną publikacją należy potwierdzić prawa do 13 nowych materiałów wizualnych, opisanych w `PRAWA-DO-NOWYCH-ZDJEC.md`. Publiczna dostępność zdjęcia i podpis autora nie zastępują zgody. Nie wdrożono strony ani nie zalogowano się do Twoich kont.

## Publikacja w Netlify

1. Rozpakuj ZIP i umieść zawartość folderu w repozytorium GitHub.
2. W Netlify wybierz **Add new site → Import an existing project → GitHub**.
3. Wskaż repozytorium i gałąź `main`.
4. Netlify odczyta `netlify.toml`: polecenie `node build.mjs`, katalog publikacji `dist`, funkcje `netlify/functions`.
5. Po pierwszym wdrożeniu podłącz domenę w **Domain management → Add a domain**.

Publikuj przez połączenie z GitHubem: sam upload statycznego folderu przez Netlify Drop nie uruchamia dołączonych funkcji. GitHub jest repozytorium, a Netlify hostuje stronę i kanały danych.

## Jednorazowe uruchomienie panelu administratora

Panel jest pod adresem `/admin/`. Pozwala dodawać i zmieniać ogłoszenia, zdjęcia oraz dni z Mszami i intencjami. Zapis trafia do GitHuba, a Netlify publikuje go po zakończeniu kolejnego budowania. To trwa zwykle kilkadziesiąt sekund lub kilka minut.

1. W `admin/config.yml` zamień `TWOJ_LOGIN_GITHUB/parafia-kotuszow` na dokładne `właściciel/repozytorium`. W razie innej gałęzi zmień `branch`.
2. Na GitHubie wejdź w **Settings → Developer settings → OAuth Apps → New OAuth App**. Jako adres strony wpisz opublikowany adres Netlify lub domenę. **Authorization callback URL** ustaw dokładnie na `https://api.netlify.com/auth/done`.
3. W Netlify wejdź w **Project configuration → Security → OAuth → Authentication Providers → Install provider → GitHub**. Wpisz tam Client ID i Client Secret utworzonej aplikacji. Sekret wpisujesz wyłącznie w Netlify, nigdy w repozytorium ani plikach strony.
4. Nadaj osobom redagującym stronę prawo zapisu do repozytorium GitHub. Logowanie do panelu odbywa się ich kontem GitHub; strona nie ma wspólnego hasła.
5. Po wdrożeniu otwórz `/admin/`, zaloguj się i opublikuj wpis. Gałąź musi pozwalać redaktorowi na zapis. Jeśli włączysz ochronę gałęzi wymagającą PR, skonfiguruj odpowiednio proces redakcyjny w Decap.

Oficjalne instrukcje: [Decap GitHub backend](https://decapcms.org/docs/github-backend/), [Netlify OAuth](https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/).

Panel korzysta z Decap CMS 3.16.0 ładowanego z jsDelivr. Nie używa wycofywanego Git Gateway. Logowania i publikacji na Twoim koncie nie można sprawdzić przed podłączeniem repozytorium i OAuth.

## Obsługa treści

- **Ogłoszenia parafialne**: tytuł, data, skrót, pełna treść i opcjonalne zdjęcie/plakat. Przełącznik „Ważne” przypina wpis przed pozostałymi — również w skrócie na stronie głównej. Pełna treść rozwija się pod ogłoszeniem.
- **Zdjęcia i spacer**: fotografia, podpis, autor, prawo do publikacji, opcjonalny link źródłowy. Przełącznik „Dodaj także jako przystanek spaceru” rozszerza spacer. Media pozostają w `assets/uploads/` w repozytorium.
- **Msze i intencje**: jeden wpis na dzień, wewnątrz dowolna liczba Mszy z godziną, miejscem i intencją. Po zakończeniu dnia wpis przestaje być pokazywany jako bieżący. Data jest liczona dla Polski. Wpis administratora zastępuje zaimportowany plan tego samego dnia.
- Przełącznik **Widoczne na stronie** decyduje o publikacji. Przykładowe wpisy w paczce są ukryte i można je usunąć lub zastąpić. Ukryte treści nie trafiają do `dist/data`, lecz nadal istnieją w repozytorium — nie przechowuj tam poufnych notatek.
- Wprowadzaj tylko zdjęcia, do których parafia ma prawa lub zgodę. Preferuj JPG/WebP/PNG; duże fotografie warto zmniejszyć przed przesłaniem.

## Automatyczne dane

### Słowo na dziś

W panelu jest osobna kolekcja z wpisami przypisanymi do pełnych dat. Wybór daty zawsze używa `Europe/Warsaw`, niezależnie od strefy urządzenia. Otwarta strona sprawdza zmianę dnia co 30 sekund i po powrocie do karty. Nie przenosi cytatów na kolejny dzień ani rok. Brak zatwierdzonego wpisu oznacza tylko datę i link do czytań Mateusza na właściwy dzień, bez zastępczej refleksji.

Każdy wpis wymaga potwierdzenia cytatu, roku/cyklu, kalendarza Polski, diecezji sandomierskiej i obchodów parafii. Dwa oddzielne przełączniki oznaczają sprawdzenie treści i lokalnego kalendarza. Budowanie pomija niezatwierdzone wpisy. Nie jest to automatycznie wyliczany kalendarz liturgiczny: odpowiedzialny redaktor zatwierdza datowane treści na podstawie aktualnego Ordo i miejscowych obchodów.

Przygotowano wpisy na 3 i 4 października 2026. Cytaty i czytania są sprawdzone w Mateuszu, lecz **nie potwierdzono lokalnego Ordo**, więc `localCalendarVerified` jest wyłączone. Po sprawdzeniu przez parafię uzupełnij notatkę weryfikacji i zaznacz ten przełącznik. Przykład 3 października zachowuje tekst przekazany przez użytkownika. Refleksje są zawsze osobno podpisane jako autorskie.

### Wiadomości i intencje

`/api/aktualnosci` pobiera sześć najnowszych wpisów zawierających „Kotuszów” z publicznego API Miasta i Gminy Szydłów. Kanał jest wyłącznie w rozwijanej części Aktualności, pod informacjami parafialnymi. Pobieranie zaczyna się dopiero po jej rozwinięciu. Wiadomości gminne nie zasilają strony głównej. Pamięć podręczna Netlify odświeża się przy odwiedzinach, nie częściej niż co 6 godzin. W razie awarii widoczny jest komunikat i link do gminy; ponowne rozwinięcie ponawia próbę.

`/api/intencje` odczytuje publiczną stronę `https://www.parafiakotuszow.pl/intencje`. Pamięć podręczna: 30 minut. Importuje rozpoznane dni i godziny, pokazując wyłącznie bieżące i przyszłe daty. Jeśli źródło zmieni układ, parser może wymagać aktualizacji. Dane wprowadzone przez administratora działają niezależnie od importu.

**Stan weryfikacji 3 października 2026:** źródłowa parafia udostępnia jako ostatnie intencje z grudnia 2025. Nie zostały przedstawione jako aktualne. Aby wyświetlić plan na dziś, należy go opublikować w panelu lub poczekać na nowy wpis u źródła. Strona nie odgaduje intencji.

Zakładka Cmentarz prowadzi do właściwej ewidencji Kotuszowa w Polskie Cmentarze (identyfikator 4520). Nie kopiuje bazy grobów ani nie przyjmuje opłat.

## Historia i archiwum

Historia zaczyna się od ośmiu kafelków tematycznych. Dopiero wybór ścieżki otwiera odpowiednią część; URL, np. `#historia/war`, można zapisać lub przesłać. Powrót przeglądarki i przycisk powrotu działają dla ścieżek. Kolejny przycisk prowadzi do następnego tematu, a na końcu do zwiedzania. Sześć obszernych rozdziałów księgi oraz 14 wydarzeń osi czasu otwiera się w czytelni z przyciskami poprzedniej i następnej opowieści. Nie przypisuje się ogólnego zdjęcia wnętrza do każdego wydarzenia.

Czytelnia zawiera siedem oryginalnych skanów stron 118–124 z książki Jana Wiśniewskiego (1929, domena publiczna). Nowe fotografie pokazują zniszczenia szkoły, ocalały dom, odbudowę i spotkanie na plebanii z Lechem Wałęsą. Dwie reprodukcje map z 1944 roku mają własne podpisy. Autorzy, daty i źródła są przy opisach; jeżeli źródło nie podało autora lub daty, nie są odgadywane. Prawa nowych materiałów wymagają potwierdzenia przed publicznym wdrożeniem.

Zwiedzanie obejmuje 10 różnych fotografii kościoła i jego detali: bramę, fasadę, portal, nawę, ołtarz, dekorację z muszlą, chór, spojrzenie ku chórowi, elewację boczną i widok z lotu ptaka. Zdjęcia okolicy są wyłącznie w osobnej ścieżce krajobrazowej historii. Ujęcia z jubileuszu mają datę 2025, a nie dzisiejszą. Domyślnie pokazany jest cały kadr. Jest przybliżanie do 2,5×, przesuwanie, pokaz i pełny ekran; Ctrl + kółko zmienia przybliżenie. Na telefonie normalne przewijanie strony działa, dopóki zdjęcie nie zostało przybliżone. Nie jest to panorama 360°.

## Edycja

- Treść strony: `index.html`
- Wygląd: `styles.css`, nowa strona główna `home.css`, historia i zwiedzanie `tour.css`
- Nawigacja i wirtualne zwiedzanie: `script.js`
- Kafelki i ścieżki historii: `journey.mjs`; dodatkowe ujęcia świątyni: `church-photos.mjs`
- Zdjęcia: `assets/`
- Ogłoszenia, galeria i intencje: `content/` lub panel administratora
- Kanały danych: `netlify/functions/`
- Budowanie: `build.mjs`, wynik w `dist/`

Po ręcznej zmianie plików `content/` uruchom `node build.mjs`. Plik `data/admin-content.json` jest generowany automatycznie. Katalog `dist/` jest odtwarzany przy każdym budowaniu i nie służy do ręcznej edycji. Podgląd statyczny można uruchomić lokalnym serwerem HTTP; automatyczne kanały wymagają Netlify Functions/Netlify Dev. Otwieranie pliku przez `file://` nie obsługuje pobierania JSON.

Szczegóły źródeł oraz licencji fotografii znajdują się w pliku `ZRODLA-I-LICENCJE.md`.
