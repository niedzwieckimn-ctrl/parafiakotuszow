# Tymczasowy pokaz Google Maps — wersja 14

W zakładce Zwiedzanie są dwa widoki: dotychczasowe zdjęcia kościoła oraz panorama Google Street View sprzed kościoła (marzec 2024). Nie jest to panorama wnętrza ani rekonstrukcja 3D. Sprawdzona galeria zdjęć sferycznych Google nie zawierała spaceru wewnątrz świątyni. Widok zewnętrzny jest osadzony oficjalnym kodem z Google Maps: Udostępnij → Umieszczanie mapy.

Panorama uruchamia się dopiero po kliknięciu „Uruchom panoramę Google”. Wejście na stronę i sam wybór trybu nie ładują iframe. Przejście do zdjęć, innej zakładki lub kliknięcie „Wyłącz widok Google” usuwa iframe z połączenia przez usunięcie `src`. Powrót wymaga ponownego uruchomienia. Podpisy Google i sterowanie należą do oryginalnego osadzenia i nie są przykrywane elementami strony. Gdy Google jest niedostępne lub zablokowane w przeglądarce, dostępne pozostają zdjęcia lokalne i odnośniki do Google Maps.

## Zdjęcia użytkowników Maps

Galeria otwierana jest w Google Maps, od fotografii wnętrza dodanej przez „Fincz 2” w lipcu 2025. Fotografie nie są pobierane, kopiowane do `assets/`, umieszczane w pokazie zdjęć ani oznaczane jako fotografie parafii. Publikacja w Maps nie potwierdza zgody na kopiowanie ich do własnego katalogu.

Źródła sprawdzono 7 października 2026:

- [Wytyczne Google — Maps i Street View](https://about.google/brand-resource-center/products-and-services/geo-guidelines/).
- [Google Maps — parafia w Kotuszowie](https://www.google.com/maps/place/Parafia+Rzymsko-Katolicka+%C5%9Awi%C4%99tego+Jakuba+Starszego+Aposto%C5%82a/@50.6071908,21.0684604,17z/data=!3m1!4b1!4m6!3m5!1s0x4717fcac03b9ddef:0xe108dc8499764559!8m2!3d50.6071908!4d21.0684604!16s%2Fg%2F11g6q3x7hq).
- Zdjęcie lokalnego podglądu bramy: EwaRóża, 2015, CC BY-SA 3.0; źródło i prawa pozostają w `ZRODLA-I-LICENCJE.md`.

Przed publicznym wdrożeniem właściciel strony powinien zapoznać się z warunkami Google wskazanymi przy osadzaniu oraz uwzględnić korzystanie z Google w informacji o prywatności. Kliknięcie uruchomienia przesyła Google zwykłe dane połączenia przeglądarki; strona nie korzysta z lokalizacji użytkownika ani jego konta Google. Brak klucza API, nowych ENV, płatnego API lub tokenów w tym module. Prywatność i blokowanie plików cookie przez przeglądarkę mogą ograniczać dostępność osadzenia.

## Zastąpienie własnymi zdjęciami i spacerem 360°

W `google-tour.mjs` zmień `GOOGLE_TOUR_DEMO.enabled` z `true` na `false`. Usunie to przyciski trybów, panel Google i odnośniki demonstracji z publicznego widoku. Dotychczasowy spacer fotograficzny pozostaje dostępny i nie wykonuje połączeń z Google. Nie zmieniaj adresu URL w celu podmiany panoramy na przypadkową mapę.

Gdy będzie gotowy własny katalog, można całkowicie usunąć demonstrację: import i wywołanie `setupGoogleTour` w `script.js`, elementy oznaczone `data-google-tour-demo` w `index.html`, moduł z listy `build.mjs` i jego CSS w `tour.css`. Zdjęcia `assets/` i treści panelu nie wymagają kasowania.

Wgraj wszystkie pliki ZIP do repozytorium z zachowaniem katalogów i zaczekaj na deploy Netlify. Nie trzeba zmieniać ENV. Pakiet nie jest automatycznie publikowany przez przygotowanie ZIP.
