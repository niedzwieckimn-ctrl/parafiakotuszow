# Własny panel administratora — instalacja i obsługa

W wersji 6 formularze są uproszczone; najnowsza instrukcja obsługi i albumów znajduje się w `POPRAWKI-3-WDROZENIE.md`. Konfiguracja sekretów i logowania opisana poniżej pozostaje bez zmian. Na publicznej stronie nie ma odnośników do panelu; otwórz adres `/admin/` bezpośrednio.

Panel działa pod `/admin/`, bez Decap i bez logowania redaktora do GitHub. GitHub działa tylko jako repozytorium w tle. Dostępny jest jeden administrator określony przez ENV; nie ma publicznej rejestracji ani formularza resetu hasła.

## Przed podmianą

Ta implementacja powstała na lokalnych źródłach ostatniej przekazanej wersji 3. Nie było uwierzytelnionego dostępu do aktualnego `main`. Nie wykonano push ani deploy na Twoim koncie. Jeżeli zmieniałeś kod później, najpierw porównaj pliki aktualnego repozytorium z paczką. Nie zastępuj całego repozytorium starszym pełnym ZIP-em. Paczka zmian nie nadpisuje istniejących `content/*.json` ani innych starych danych.

Przed zmianami zapisz SHA aktualnego commitu `main` i pobierz kopię repozytorium. Sekretów nie umieszczaj w plikach, commitach, czacie ani zrzutach ekranu.

## A. Zmienne środowiskowe Netlify

W projekcie `parafiakotuszow` otwórz **Project configuration → Environment variables**. Dodaj wartości dla kontekstu **Production**. Jeżeli plan pozwala wybrać zakres, użyj **Functions**. Jeśli na darmowym planie dostępne są tylko wszystkie zakresy, też zadziała: build nie kopiuje ENV do frontendu. Nie nadawaj tym zmiennym prefiksów `VITE_`, `PUBLIC_` lub `NEXT_PUBLIC_`.

| Nazwa | Wartość |
| --- | --- |
| `ADMIN_EMAIL` | Twój adres e-mail używany do logowania |
| `ADMIN_PASSWORD_HASH` | Cały wynik `scrypt$131072$8$1$…` z generatora, bez otaczających cudzysłowów |
| `SESSION_SECRET` | Losowy ciąg 64 znaków szesnastkowych z generatora |
| `ADMIN_ORIGIN` | `https://parafiakotuszow.netlify.app` — dokładny adres, z którego będziesz logować się do panelu |
| `GITHUB_TOKEN` | Fine-grained personal access token opisany w punkcie D |
| `GITHUB_OWNER` | `niedzwieckim-ctrl` |
| `GITHUB_REPO` | `parafiakotuszow` |
| `GITHUB_BRANCH` | `main` |

`ADMIN_ORIGIN` jest dodatkowym zabezpieczeniem przed żądaniami z innej strony. Po podłączeniu własnej domeny ustaw tę domenę jako kanoniczną i zmień tę zmienną. Nie wpisuj adresu `/admin/`, tylko początek `https://domena`. Panel obsługuje jeden kanoniczny origin. Zmiana adresu unieważnia wcześniejsze sesje. Nie udostępniaj produkcyjnych sekretów niekontrolowanym Deploy Previews i forkowym pull requestom. Na innych kontekstach panel bez ENV bezpiecznie odmawia działania.

## B. Jak wygenerować hash hasła

Na własnym komputerze z Node.js 22 lub nowszym, w głównym folderze źródeł strony uruchom:

```sh
node tools/admin-secrets.mjs
```

Wpisz dwukrotnie własne hasło, najlepiej długą i niepowtarzalną frazę. Minimum 14 znaków, maksimum 256 bajtów UTF-8. Wpisywanie jest niewidoczne. Nie podawaj hasła jako argumentu polecenia i nie zapisuj go w pliku. Generator nie potrzebuje instalacji zależności ani połączenia z internetem. Wypisuje wyłącznie hash i losowy sekret sesji — nie hasło.

Skopiuj wartość po `ADMIN_PASSWORD_HASH=` do odpowiedniej zmiennej Netlify. Całe hasło nie jest nigdzie przechowywane. Porównanie odbywa się na serwerze przy użyciu scrypt (N=131072, r=8, p=1, losowa sól 16 bajtów, klucz 64 bajty) i `timingSafeEqual`.

## C. Jak wygenerować SESSION_SECRET

Powyższy generator daje go razem z hashem. Osobno możesz uruchomić:

```sh
node tools/admin-secrets.mjs --session-only
```

Wklej wynik do `SESSION_SECRET`. Nigdy nie wpisuj stałego przykładowego sekretu. Zmiana tego sekretu lub hasha hasła po nowym deployu unieważnia dotychczasowe sesje. Odzyskanie dostępu: właściciel projektu generuje nowy hash lokalnie, zmienia ENV i ponownie wdraża stronę.

## D. Token GitHub — minimalne uprawnienia

Na koncie właściciela repozytorium otwórz **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.

1. Wybierz właściciela `niedzwieckim-ctrl`.
2. Wybierz **Only select repositories** i wyłącznie `parafiakotuszow`.
3. Ustaw termin ważności, np. 90 dni; zaplanuj wymianę przed wygaśnięciem.
4. W **Repository permissions** nadaj tylko **Contents: Read and write**. **Metadata: Read-only** jest automatyczne.
5. Pozostałe uprawnienia pozostaw wyłączone: Workflows, Administration, Issues, Pull requests itd. Nie są potrzebne.
6. Token wklej wyłącznie do Netlify ENV jako `GITHUB_TOKEN`.

To właściciel konfiguruje token jeden raz. Osoba logująca się do panelu potrzebuje tylko e-maila i hasła. Panel wysyła token do `api.github.com` wyłącznie z funkcji serwerowej; nie zwraca go przeglądarce ani nie loguje.

Token musi mieć możliwość bezpośredniego zapisu do `main`. Jeśli zasady repozytorium wymagają PR dla każdego zapisu lub blokują danego właściciela tokenu, API odmówi zapisu. Nie wyłączaj zabezpieczeń bez oceny; ten panel nie implementuje procesu zatwierdzania przez PR. Fine-grained token może wymagać zatwierdzenia organizacji. Wygaśnięcie tokenu będzie widoczne jako błąd dostępu do repozytorium.

Źródła: [GitHub — zarządzanie tokenami](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [API Contents — wymagane uprawnienia](https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28).

## E. Ustawienia i ponowne wdrożenie Netlify

Zachowaj połączenie Netlify z repozytorium GitHub i gałęzią `main`.

- Build command: `node build.mjs`.
- Publish directory: `dist`.
- Functions directory: `netlify/functions`.
- Node.js: 22 (zapisane w `netlify.toml`).
- Dodane `package.json` i `pnpm-lock.yaml` zapewniają instalację `@netlify/blobs` i `sharp`. Nie używaj Netlify Drop — potrzebne są funkcje serwerowe i instalacja zależności.
- `netlify.toml` ustawia bundler i pozostawia `sharp` jako zależność serwerową z natywnymi bibliotekami. Nie wysyłaj `node_modules` z Windows do repozytorium. Netlify instaluje wariant Linux przy budowaniu.
- Netlify Blobs przechowuje tylko prywatne sesje, limiter prób logowania i krótką blokadę zapisu. Treści i zdjęcia nadal trafiają do GitHub. SDK w funkcjach korzysta z automatycznego kontekstu Netlify; nie dodajesz tokenu Blobs ani Netlify do własnego ENV.
- Dwie reguły rate limit są w plikach funkcji: login 10 żądań / 180 s / IP, API panelu 120 / 60 s / IP. Sprawdź w logu końcowego etapu deployu, czy obie zostały przyjęte. Własny limiter w Blobs dodatkowo ogranicza logowanie do 10 prób w 15 minut na IP, także między instancjami. Reguły brzegowe mogą reagować z opóźnieniem.
- Po ustawieniu ENV wykonaj nowy deploy, najlepiej **Clear cache and deploy site** przy pierwszym przejściu na nowy panel. Zmiana ENV dla funkcji wymaga ponownego wdrożenia.
- Nie potrzeba Netlify Identity ani Git Gateway. Stara aplikacja OAuth Decap nie jest już używana. Możesz później odwołać tylko stare, nieużywane poświadczenia panelu; nie odłączaj integracji GitHub służącej do deployu.

Funkcje i podstawowe reguły limitów są dostępne na darmowym planie, a Free ma dwie reguły kodowe — dokładnie tyle używa panel. Koszt/zużycie Functions, Blobs, transferu i deployów zależy od planu konta i jego limitów. Nie ma gwarancji nieograniczonego darmowego użycia. Każdy zapis/edycja/usunięcie wpisu uruchamia build. Upload ma commit z `[skip netlify]`; dopiero zapis wpisu uruchamia publikację i obejmuje też zdjęcie. Sam upload nie wystawia jeszcze pliku na publicznej stronie. Przy intensywnej edycji przygotuj treść przed zapisem i obserwuj Billing/Usage.

Dokumentacja: [ENV](https://docs.netlify.com/build/environment-variables/get-started/), [Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/), [limity](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/), [pomijanie deployów](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/), [plany](https://www.netlify.com/pricing/).

## F. Test po wdrożeniu

1. Otwórz `https://parafiakotuszow.netlify.app/admin/` w oknie prywatnym. Nie powinien pojawić się Decap ani logowanie GitHub.
2. Wpisz błędne hasło — komunikat ma mówić o nieprawidłowym e-mailu lub haśle, bez wskazywania, które pole jest poprawne.
3. Zaloguj się poprawnie. W narzędziach przeglądarki sprawdź cookie `__Host-parafia_admin`: HttpOnly, Secure, SameSite=Strict, Path=/, Max-Age=14400. Hasło nie powinno być zapisane w localStorage/sessionStorage.
4. Odśwież panel i wróć do niego w tej samej przeglądarce. Sesja jest zachowana do 4 godzin od logowania; samo odwiedzanie jej nie przedłuża.
5. Dodaj szkic ogłoszenia, potem edytuj go. Potwierdź nowy plik w `content/ogloszenia/` na `main` i deploy w Netlify. Szkic nie powinien być widoczny publicznie.
6. Prześlij małe JPG/PNG/WebP, do 2 MB. Potwierdź nowy plik w `assets/uploads/`. Podgląd działa od razu w panelu. Zaznacz publikację wpisu i zapisz — po deployu ma być widoczny na stronie.
7. Dodaj/edytuj dzień intencji i sprawdź publiczną zakładkę. Formularz musi odrzucać nieprawidłowe godziny i daty.
8. Otwórz „Słowo otuchy”: zobaczysz podgląd tekstu tworzonego automatycznie na dzisiejszą datę (Europe/Warsaw). Nie musisz codziennie dodawać wpisu. Lista z lewej zawiera tylko ręczne poprawki. Przycisk „Przygotuj ręczną poprawkę” wypełnia formularz; jeśli dla tej daty jest już wpis, otwiera go bez nadpisywania. Sprawdzona i opublikowana poprawka ma pierwszeństwo. Oba potwierdzenia zaznacz dopiero po rzeczywistej weryfikacji cytatu i lokalnego kalendarza. Bez potwierdzonych źródeł automat pokazuje tylko odnośnik do bieżących czytań, nigdy dawny cytat. Szczegóły: `SLOWO-AUTOMATYCZNE.md`.
9. Usuń tylko własny wpis testowy. Zdjęcie pozostaje w bibliotece; panel nie usuwa plików mediów ani innych danych automatycznie.
10. Wyloguj się. Odśwież panel. W nowym oknie bez sesji wejście na `/api/admin/content?collection=ogloszenia` i `/api/admin/session/me` ma zwrócić 401. Wysyłanie POST bez sesji z właściwego origin również ma być odrzucane.
11. W DevTools Network/Sources nie powinno być tokenu GitHub, hasha hasła ani sekretu sesji. API ma no-store. Zapis bez X-CSRF-Token lub z innym Origin ma zwrócić 403.
12. Sprawdź publiczne zakładki Start, Aktualności, Msze i intencje, Historia, Cmentarz, Zwiedzanie. Nie nastąpiła zmiana architektury publicznej strony. Uzgodnione poprawki: krótszy start, brak etykiety „oficjalny serwis parafii”, pięć nowych zdjęć i punkty w widoku spaceru.

Jeśli ktoś równocześnie edytuje ten sam plik, zapis ze starą wersją SHA zwróci 409. Formularz nie jest czyszczony; skopiuj swoją treść, wczytaj aktualny wpis i połącz zmiany. Krótka blokada w Blobs zapobiega równoległym zapisom z panelu. Zmiany wykonane poza panelem nadal chroni SHA GitHub. W razie niepewnego wyniku zapisu po przerwaniu sieci sprawdź repozytorium przed ponawianiem tworzenia wpisu.

## G. Powrót do poprzedniej wersji

1. Przy problemie produkcyjnym w Netlify → Deploys wybierz poprzedni poprawny deploy i **Publish deploy**. To przywraca kod i funkcje z tamtego deployu, ale nie cofa historii GitHub ani późniejszych treści. Kolejny automatyczny deploy może znów opublikować nowy kod.
2. Trwale wycofaj commit wdrażający nowy panel przy użyciu **git revert** (bez `reset --hard` i bez force push), zachowując późniejsze treści i zdjęcia. Jeśli miesza się z innymi zmianami, przywróć tylko ścieżki panelu i konfiguracji z kopii sprzed aktualizacji.
3. Archiwalny `admin/config.yml` zachowuje definicje kolekcji, ale nie ma już sekcji backend. Aby wrócić do starego panelu, przywróć poprzedni `admin/index.html`, konfigurację backendu oraz poprzednią konfigurację budowania z historii repozytorium; przywrócenie samego YAML nie wystarczy.
4. Nowe sesje wyłączysz przez zmianę `SESSION_SECRET` i nowy deploy. Jeśli token nie będzie już potrzebny, odwołaj go na GitHub i usuń z ENV. Nie cofaj ani nie kasuj `content/` i `assets/uploads/` tylko po to, żeby wycofać panel.

## Granice weryfikacji tej paczki

Przeprowadzono testy lokalne, z rzeczywistą funkcją scrypt, cookie/sesjami, CSRF, walidacją, dekodowaniem zdjęć przez sharp oraz symulowanym kontraktem API GitHub. Testy nie zapisują nic do prawdziwego repozytorium. Nie potwierdzono produkcyjnego Blobs, tokenu GitHub, push, deployu i reguł rate limit w Netlify — wymagają dostępu do Twojego projektu i wykonania punktu F.

Lokalne narzędzie bundlowania Netlify/esbuild nie mogło odczytać katalogu nadrzędnego w tym środowisku Windows (odmowa dostępu). Dlatego mimo poprawnych testów modułów i publicznego builda ostateczne spakowanie Functions, w tym natywnej biblioteki sharp, należy potwierdzić w pierwszym buildzie Netlify/Linux. Nie uznano go za zweryfikowane produkcyjnie.

Zdjęcia przesłane przez użytkownika są dodane do spaceru, bez odgadywania autorstwa. Potwierdź zgody na publiczną publikację i podpisy. Dotychczasowe przykłady słowa otuchy mają sprawdzony cytat, ale wciąż wymagają potwierdzenia lokalnego kalendarza; nie zostały sztucznie zatwierdzone.
