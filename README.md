# Parafia św. Jakuba w Kotuszowie

**Aktualna wersja 6 — Poprawki 3:** jasna strona główna „Fotografia i emocje”, uproszczony panel, albumy do 30 zdjęć i generator Słowa v2. Instrukcja aktualizacji oraz obsługi: [POPRAWKI-3-WDROZENIE.md](POPRAWKI-3-WDROZENIE.md). Zachowano dane i zdjęcia wersji 5. Nowa paczka nie wymaga zmian ENV.

Strona przygotowana do repozytorium GitHub i publikacji przez Netlify. Publiczny frontend nie wymaga bibliotek. Budowanie używa Node.js 22 i polecenia `node build.mjs`. Netlify instaluje zależności serwerowego panelu z `package.json` i pliku blokady. Nie wysyłaj `node_modules` do repozytorium.

**Wersja 4: własny panel administratora i punkty spaceru.** Przed publiczną publikacją należy potwierdzić prawa do 13 materiałów wizualnych wersji 3 oraz pięciu dostarczonych fotografii (wykaz w `PRAWA-DO-NOWYCH-ZDJEC.md` i `ZRODLA-I-LICENCJE.md`). Publiczna dostępność zdjęcia i podpis autora nie zastępują zgody. Nie wykonano push do GitHub ani wdrożenia na koncie właściciela.

## Publikacja w Netlify

1. Rozpakuj ZIP i umieść zawartość folderu w repozytorium GitHub.
2. W Netlify wybierz **Add new site → Import an existing project → GitHub**.
3. Wskaż repozytorium i gałąź `main`.
4. Netlify odczyta `netlify.toml`: polecenie `node build.mjs`, katalog publikacji `dist`, funkcje `netlify/functions`.
5. Po pierwszym wdrożeniu podłącz domenę w **Domain management → Add a domain**.

Publikuj przez połączenie z GitHubem: sam upload statycznego folderu przez Netlify Drop nie uruchamia dołączonych funkcji. GitHub jest repozytorium, a Netlify hostuje stronę i kanały danych.

## Jednorazowe uruchomienie panelu administratora

Panel jest pod adresem `/admin/`. Pozwala dodawać i zmieniać ogłoszenia, zdjęcia oraz dni z Mszami i intencjami. Zapis trafia do GitHuba, a Netlify publikuje go po zakończeniu kolejnego budowania. To trwa zwykle kilkadziesiąt sekund lub kilka minut.

Własny panel używa e-maila i hasła. Nie ładuje Decap ani nie wymaga konta GitHub od redaktora. Autoryzacja, sesje, walidacja i zapis do GitHub działają w Netlify Functions. Sekrety są pobierane wyłącznie z Netlify ENV. Definicja `admin/config.yml` pozostaje jako archiwum pól i nie jest publikowana.

Pełna instrukcja konfiguracji ENV, generowania hasha, tokenu GitHub, testów i wycofania aktualizacji: [ADMIN-INSTRUKCJA.md](ADMIN-INSTRUKCJA.md). Repozytorium docelowe: `niedzwieckim-ctrl/parafiakotuszow`, gałąź `main`. Nie wykonano push ani deploy na Twoim koncie.

## Obsługa treści

- **Ogłoszenia parafialne**: tytuł, data, skrót, pełna treść i opcjonalne zdjęcie/plakat. Przełącznik „Ważne” przypina wpis przed pozostałymi — również w skrócie na stronie głównej. Pełna treść rozwija się pod ogłoszeniem.
- **Zdjęcia i spacer**: fotografia, podpis, autor, prawo do publikacji, opcjonalny link źródłowy. Przełącznik „Dodaj także jako przystanek spaceru” rozszerza spacer. Media pozostają w `assets/uploads/` w repozytorium.
- **Msze i intencje**: jeden wpis na dzień, wewnątrz dowolna liczba Mszy z godziną, miejscem i intencją. Po zakończeniu dnia wpis przestaje być pokazywany jako bieżący. Data jest liczona dla Polski. Wpis administratora zastępuje zaimportowany plan tego samego dnia.
- Przełącznik **Widoczne na stronie** decyduje o publikacji. Przykładowe wpisy w paczce są ukryte i można je usunąć lub zastąpić. Ukryte treści nie trafiają do `dist/data`, lecz nadal istnieją w repozytorium — nie przechowuj tam poufnych notatek.
- Wprowadzaj tylko zdjęcia, do których parafia ma prawa lub zgodę. Preferuj JPG/WebP/PNG; duże fotografie warto zmniejszyć przed przesłaniem.

## Automatyczne dane

### Słowo na dziś

Od wersji 5 tekst tworzy się automatycznie przy pierwszej wizycie danego dnia. Funkcja `/api/slowo-na-dzis?date=RRRR-MM-DD` pobiera czytania z Mateusza i roczny kalendarz diecezji sandomierskiej z GCatholic, sprawdza datę i zgodność obchodu, wybiera dosłowny krótki fragment biblijny i składa autorską refleksję z reguł tematycznych. To generator regułowy, nie model AI. Nie potrzebuje klucza AI ani codziennego dodawania wpisów. Refleksje nie są kopiowane z cudzych komentarzy; sformułowania mogą powracać przy podobnych czytaniach.

Data używa `Europe/Warsaw`, niezależnie od strefy urządzenia. Otwarta strona sprawdza zmianę dnia co 30 sekund i po powrocie do karty. Pamięć podręczna ma osobny klucz dla każdej daty, roku i wersji generatora. Nie przenosi cytatów na następny dzień. Brak źródeł lub niepotwierdzona lokalna uroczystość oznacza datę i odnośnik do czytań, bez zmyślonej refleksji. GCatholic nie jest oficjalnym Ordo; znane miejscowe uroczystości i rozbieżności są chronione. Szczegóły i wyjątki opisuje `SLOWO-AUTOMATYCZNE.md`.

Panel „Słowo otuchy” pokazuje podgląd automatu. Lista plików jest listą opcjonalnych ręcznych poprawek, nie warunkiem działania. Można utworzyć poprawkę na konkretną datę; sprawdzony i opublikowany wpis ma pierwszeństwo. Dwa przełączniki nadal oznaczają rzeczywiste sprawdzenie cytatu/refleksji i lokalnego kalendarza przez redaktora — automat nie zaznacza ich za człowieka. Wcześniejsze pliki na 3 i 4 października 2026 zachowano bez zmian; ich brak lokalnego zatwierdzenia nie blokuje automatyki.

### Wiadomości i intencje

`/api/aktualnosci` pobiera sześć najnowszych wpisów zawierających „Kotuszów” z publicznego API Miasta i Gminy Szydłów. Kanał jest wyłącznie w rozwijanej części Aktualności, pod informacjami parafialnymi. Pobieranie zaczyna się dopiero po jej rozwinięciu. Wiadomości gminne nie zasilają strony głównej. Pamięć podręczna Netlify odświeża się przy odwiedzinach, nie częściej niż co 6 godzin. W razie awarii widoczny jest komunikat i link do gminy; ponowne rozwinięcie ponawia próbę.

`/api/intencje` odczytuje publiczną stronę `https://www.parafiakotuszow.pl/intencje`. Pamięć podręczna: 30 minut. Importuje rozpoznane dni i godziny, pokazując wyłącznie bieżące i przyszłe daty. Jeśli źródło zmieni układ, parser może wymagać aktualizacji. Dane wprowadzone przez administratora działają niezależnie od importu.

**Stan weryfikacji 3 października 2026:** źródłowa parafia udostępnia jako ostatnie intencje z grudnia 2025. Nie zostały przedstawione jako aktualne. Aby wyświetlić plan na dziś, należy go opublikować w panelu lub poczekać na nowy wpis u źródła. Strona nie odgaduje intencji.

Zakładka Cmentarz prowadzi do właściwej ewidencji Kotuszowa w Polskie Cmentarze (identyfikator 4520). Nie kopiuje bazy grobów ani nie przyjmuje opłat.

## Historia i archiwum

Historia zaczyna się od ośmiu kafelków tematycznych. Dopiero wybór ścieżki otwiera odpowiednią część; URL, np. `#historia/war`, można zapisać lub przesłać. Powrót przeglądarki i przycisk powrotu działają dla ścieżek. Kolejny przycisk prowadzi do następnego tematu, a na końcu do zwiedzania. Sześć obszernych rozdziałów księgi oraz 14 wydarzeń osi czasu otwiera się w czytelni z przyciskami poprzedniej i następnej opowieści. Nie przypisuje się ogólnego zdjęcia wnętrza do każdego wydarzenia.

Czytelnia zawiera siedem oryginalnych skanów stron 118–124 z książki Jana Wiśniewskiego (1929, domena publiczna). Nowe fotografie pokazują zniszczenia szkoły, ocalały dom, odbudowę i spotkanie na plebanii z Lechem Wałęsą. Dwie reprodukcje map z 1944 roku mają własne podpisy. Autorzy, daty i źródła są przy opisach; jeżeli źródło nie podało autora lub daty, nie są odgadywane. Prawa nowych materiałów wymagają potwierdzenia przed publicznym wdrożeniem.

Zwiedzanie obejmuje 15 fotografii kościoła i jego detali, w tym pięć dostarczonych przez użytkownika. Klikalne punkty wewnątrz widoku prowadzą od bramy przez wejście i nawę do ołtarza oraz otwierają opisy detali. Punkty pozostają wyrównane do fotografii po zmianie rozmiaru, przybliżeniu i przesunięciu. Zdjęcia okolicy są wyłącznie w osobnej ścieżce krajobrazowej historii. Ujęcia z jubileuszu mają datę 2025, a nie dzisiejszą; dat nowych zdjęć nie odgadywano. Domyślnie pokazany jest cały kadr. Jest przybliżanie do 2,5×, przesuwanie, pokaz i pełny ekran; Ctrl + kółko zmienia przybliżenie. Na telefonie normalne przewijanie strony działa, dopóki zdjęcie nie zostało przybliżone. Jest to spacer fotograficzny, nie panorama 360° ani model 3D.

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
