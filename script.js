import { selectDailyWord, warsawDay } from './calendar.mjs';
import { historyChapters } from './history-chapters.mjs';

const pageTitles = {
  start: "Parafia św. Jakuba w Kotuszowie",
  wydarzenia: "Wydarzenia — Parafia św. Jakuba w Kotuszowie",
  aktualnosci: "Aktualności — Parafia św. Jakuba w Kotuszowie",
  historia: "Historia — Parafia św. Jakuba w Kotuszowie",
  cmentarz: "Cmentarz — Parafia św. Jakuba w Kotuszowie",
  zwiedzanie: "Wirtualne zwiedzanie — Parafia św. Jakuba w Kotuszowie",
};

const pageLabels = { start: "Strona główna", wydarzenia: "Wydarzenia", aktualnosci: "Aktualności", historia: "Historia", cmentarz: "Cmentarz", zwiedzanie: "Wirtualne zwiedzanie" };
const views = [...document.querySelectorAll("[data-page]")];
const pageLinks = [...document.querySelectorAll("[data-page-link]")];
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#siteNav");
const routeAnnouncer = document.querySelector(".route-announcer");

function currentRoute() {
  const route = window.location.hash.slice(1).toLowerCase();
  return pageTitles[route] ? route : "start";
}

function closeMenu() {
  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.querySelector(".sr-only").textContent = "Otwórz menu";
  document.body.classList.remove("menu-open");
}

function showPage(route, { focus = false } = {}) {
  const safeRoute = pageTitles[route] ? route : "start";
  views.forEach((view) => {
    const active = view.dataset.page === safeRoute;
    view.hidden = !active;
    view.classList.toggle("is-active", active);
  });
  pageLinks.forEach((link) => {
    const active = link.dataset.pageLink === safeRoute;
    link.classList.toggle("is-active", active);
    if (active && link.closest("nav")) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.title = pageTitles[safeRoute];
  routeAnnouncer.textContent = `Otwarto: ${pageLabels[safeRoute]}`;
  closeMenu();
  window.scrollTo({ top: 0, behavior: "instant" });
  if (focus) window.setTimeout(() => document.querySelector("#main-content").focus({ preventScroll: true }), 50);
}

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const route = link.dataset.pageLink;
    if (!route) return;
    event.preventDefault();
    if (window.location.hash === `#${route}`) showPage(route, { focus: true });
    else window.location.hash = route;
  });
});
window.addEventListener("hashchange", () => showPage(currentRoute(), { focus: true }));
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.querySelector(".sr-only").textContent = open ? "Zamknij menu" : "Otwórz menu";
  siteNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
});
document.querySelector("#backTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const SOURCE = {
  book: { label: "Jan Wiśniewski, 1929, s. 118–124 — Biblioteka Cyfrowa UMCS (domena publiczna)", url: "https://bc.umcs.pl/dlibra/publication/1783/edition/1625" },
  diocese: { label: "Diecezja Sandomierska — opis parafii", url: "https://diecezjasandomierska.pl/kotuszow-sw-jakuba-starszego-apostola/" },
  local: { label: "Kotuszów — opracowanie historii miejscowości i parafii", url: "https://www.kotuszow.pl/index.php/historia" },
  kul: { label: "KUL — Historia kościołów i organów w dekanatach Połaniec i Staszów", url: "https://repozytorium.kul.pl/server/api/core/bitstreams/64662f35-e045-4560-96ac-0e9d8ed6e7d4/content" },
  kurier: { label: "Kurier Ziemi Szydłowskiej nr 1/2012, s. 16–17 — świadectwo o ks. Antonim Sobczyku", url: "https://www.szydlow.pl/arch/kurier/kurier_45.pdf#page=12" },
  niedziela: { label: "Niedziela — Uroczystości jakubowe w Kotuszowie", url: "https://www.niedziela.pl/artykul/60036/nd/Uroczystosci-jakubowe-w-Kotuszowie" },
  ekai: { label: "eKAI — wprowadzenie relikwii św. Jakuba", url: "https://www.ekai.pl/kotuszow-wprowadzenie-relikwii-sw-jakuba-do-zabytkowej-swiatyni-d604578/" },
};

const historyEntries = [
  {
    id: "1326", year: "1326", title: "Pierwszy znany proboszcz — Paweł",
    teaser: "Najstarszy zapis o parafii wymienia duchownego z imienia.",
    body: ["Kotuszów pojawia się w wykazach świętopietrza z pierwszej połowy XIV wieku. Zapis z 1326 roku wymienia proboszcza Pawła, co potwierdza, że działała tu już zorganizowana parafia i drewniany kościół.", "To nie tylko data powstania instytucji — to pierwszy uchwytny w źródłach człowiek związany z duszpasterstwem w Kotuszowie."],
    sources: [SOURCE.diocese, SOURCE.niedziela, SOURCE.kul],
  },
  {
    id: "1595", year: "XVI wiek", title: "Zniszczenie pierwszego kościoła",
    teaser: "W okresie reformacji świątynia została sprofanowana i ograbiona.",
    body: ["Wizytacje kościelne opisują dramatyczny okres reformacji. Drewniany kościół został sprofanowany, ograbiony i zniszczony, a wierni przez pewien czas korzystali ze świątyni w Kurozwękach.", "Drugi kościół, odbudowany przy wsparciu Zbigniewa Lanckorońskiego, również nie przetrwał — spłonął w XVII wieku."],
    sources: [SOURCE.local, SOURCE.kul, SOURCE.niedziela],
  },
  {
    id: "1647", year: "1647", title: "Testament Katarzyny Lanckorońskiej",
    teaser: "Zachowany zapis pokazuje, jak ważne było zabezpieczenie kościoła.",
    body: ["W lokalnym opracowaniu przytoczono obszerny testament Katarzyny z Kurozwęk Lanckorońskiej, sporządzony w Kotuszowie. Dokument zapisywał dobra na potrzeby kościoła i pokazuje sieć fundatorów odpowiedzialnych za jego utrzymanie.", "Takie źródła pozwalają zobaczyć historię nie tylko przez daty budowy, lecz także przez decyzje konkretnych rodzin i mieszkańców."],
    sources: [SOURCE.local],
  },
  {
    id: "1661", year: "1661", title: "Powstaje obecna murowana świątynia",
    teaser: "Krzysztof z Brzezia Lanckoroński funduje kościół, który stoi do dziś.",
    body: ["Po pożarach wcześniejszych drewnianych budowli rozpoczęto wznoszenie obecnego barokowego kościoła. Fundatorem był Krzysztof z Brzezia Lanckoroński.", "Budowla otrzymała plan krzyża łacińskiego, kaplice św. Antoniego i św. Józefa oraz wieżę od zachodu. Jej forma, mimo wojennych zniszczeń i późniejszej odbudowy, pozostaje czytelnym znakiem XVII wieku."],
    sources: [SOURCE.diocese, SOURCE.kul, SOURCE.local],
  },
  {
    id: "1681", year: "11 XI 1681", title: "Konsekracja kościoła",
    teaser: "Bp Mikołaj Oborski uroczyście poświęca nową świątynię.",
    body: ["Dwadzieścia lat po rozpoczęciu budowy kościół został konsekrowany przez krakowskiego biskupa pomocniczego Mikołaja Oborskiego.", "Data 11 listopada 1681 roku domyka okres budowy i rozpoczyna historię świątyni w formie, którą rozpoznajemy dzisiaj."],
    sources: [SOURCE.diocese, SOURCE.niedziela, SOURCE.kul],
  },
  {
    id: "sapinski", year: "1755–1778", title: "Ks. Wawrzyniec Sapiński — wielki dobroczyńca",
    teaser: "Bractwo, szpital, organy i odbudowa wieży zmieniły życie parafii.",
    body: ["Ks. Wawrzyniec Sapiński wprowadził Bractwo św. Józefa, fundował wyposażenie i organy, a w 1757 roku odbudował dzwonnicę. Stworzył też „szpital” — dawny przytułek dla starszych parafian pozbawionych dachu nad głową.", "Opis z 1929 roku zachował codzienny obraz tego miejsca: przed zachodem słońca organista i mieszkańcy przytułku śpiewali litanię, a wokół zbierały się dzieci. Sapiński przygotował nawet własne epitafium za życia, prosząc przechodzących o modlitwę. Zmarł w 1778 roku.", "W czytelni znajdziesz autentyczny skan strony 121, na której ks. Jan Wiśniewski opisał te wydarzenia."],
    sources: [SOURCE.book, SOURCE.local],
  },
  {
    id: "sosinski", year: "1778–1805", title: "Ks. Paweł Sosiński kontynuuje dzieło",
    teaser: "Nowa plebania, zabudowania i ołtarz św. Józefa.",
    body: ["Po śmierci ks. Sapińskiego probostwo objął ks. Paweł Sosiński, wcześniej związany z Kotuszowem jako prebendarz. Wizytacja z 1783 roku chwaliła go jako godnego następcę poprzednika.", "Budował zaplecze parafialne i plebanię oraz wznosił nowy ołtarz św. Józefa. Zmarł 17 stycznia 1805 roku, mając 58 lat."],
    sources: [SOURCE.local],
  },
  {
    id: "1818", year: "1818", title: "Włamanie i utrata dawnych kosztowności",
    teaser: "Historia kościoła ma również kartę kryminalną.",
    body: ["W 1818 roku złodzieje okradli kościół, zabierając między innymi ozdoby obrazu św. Józefa. Ks. Jan Wiśniewski zapisał osobliwy szczegół: kiedy sprawcy rozpoznali, że sukienka obrazu była miedziana, porzucili ją.", "To krótki epizod, ale pokazuje los przedmiotów, które przez pokolenia fundowano dla świątyni. Opis zachował się na stronie 121 książki z 1929 roku, dostępnej w naszej czytelni."],
    sources: [SOURCE.book],
  },
  {
    id: "1944", year: "1944–1945", title: "Front nad Czarną niszczy wieś i kościół",
    teaser: "Po walkach z całej wsi pozostaje zaledwie kilka domów.",
    body: ["Przez około pół roku linia frontu biegła wzdłuż rzeki Czarnej. Kościół spłonął, jego mury zostały naruszone, a teren wokół świątyni i pola były zaminowane.", "W relacji opublikowanej w „Kurierze Ziemi Szydłowskiej” zapisano, że z około stu domów ocalało tylko pięć. Mieszkańcy wracali do piwnic i ziemianek, zmagając się z minami oraz epidemią tyfusu."],
    sources: [SOURCE.kurier, SOURCE.diocese, SOURCE.kul],
  },
  {
    id: "sobczyk", year: "od 25 V 1945", title: "Ks. Antoni Sobczyk — proboszcz na ruinach",
    teaser: "Młody kapłan organizuje modlitwę, pomoc i odbudowę.",
    body: ["Ks. Antoni Sobczyk urodził się 25 lutego 1912 roku w Zawichoście i przyjął święcenia w 1939 roku. Do Kotuszowa przyjechał 25 maja 1945 roku, mając 33 lata.", "Pierwszą kaplicę urządzono w ocalałej kruchcie. Proboszcz sprowadzał żywność, otworzył publiczną kuchnię, powołał Komitet Parafialny i pracował z mieszkańcami przy odgruzowaniu. Drewno na dach transportowano z lasu nawet przy pomocy krów.", "W 1948 roku bp Jan Kanty Lorek poświęcił odbudowaną świątynię. Ks. Sobczyk służył parafii 57 lat, zmarł 9 kwietnia 2002 roku i został pochowany na miejscowym cmentarzu."],
    sources: [SOURCE.kurier, SOURCE.niedziela, SOURCE.kul],
  },
  {
    id: "1955", year: "1955", title: "Organy, chrzcielnica i światło elektryczne",
    teaser: "Odbudowa wchodzi w etap wyposażania wnętrza.",
    body: ["Po zabezpieczeniu murów, wieży i dachu przyszedł czas na odtwarzanie wnętrza. Lokalne opracowanie wiąże rok 1955 z organami, chrzcielnicą oraz doprowadzeniem elektryczności.", "Dzisiejszy wystrój jest więc w dużej mierze świadectwem powojennej determinacji parafian, a nie nietkniętym wyposażeniem barokowym."],
    sources: [SOURCE.local, SOURCE.kul],
  },
  {
    id: "1983", year: "1983", title: "Lech Wałęsa w Kotuszowie",
    teaser: "Niezwykły epizod zapisany w lokalnej historii.",
    body: ["Lokalne opracowanie odnotowuje wizytę Lecha Wałęsy u ks. Antoniego Sobczyka w 1983 roku. To jeden z mniej znanych wątków pokazujących, że powojenna plebania była miejscem spotkań wykraczających poza granice parafii.", "Fotografie z tego wydarzenia pozostają w lokalnych zbiorach; strona prowadzi do ich właściciela, nie kopiuje ich bez określonej licencji."],
    sources: [SOURCE.local],
  },
  {
    id: "camino", year: "25 VII 2009", title: "Kotuszów wraca na europejską Drogę św. Jakuba",
    teaser: "Otwarto odcinek Sandomierz–Kotuszów–Kraków.",
    body: ["Dzięki staraniom środowiska jakubowego i parafii uruchomiono pielgrzymi szlak prowadzący z Sandomierza przez Kotuszów do Krakowa, a dalej w stronę Santiago de Compostela.", "Kościół stał się świątynią stacyjną, a muszla św. Jakuba na fasadzie nabrała nowego, praktycznego znaczenia dla pielgrzymów."],
    sources: [SOURCE.diocese, SOURCE.niedziela],
  },
  {
    id: "relikwie", year: "25 VII 2021", title: "Relikwie św. Jakuba w świątyni",
    teaser: "Patron parafii otrzymuje szczególne miejsce w kościele.",
    body: ["Podczas odpustu parafialnego wprowadzono relikwie św. Jakuba Apostoła i umieszczono je w przygotowanej kaplicy. Uroczystość podkreśliła rolę Kotuszowa na Małopolskiej Drodze św. Jakuba.", "Wydarzenie łączy siedemsetletnią tradycję parafii ze współczesnym ruchem pielgrzymkowym."],
    sources: [SOURCE.ekai],
  },
];

const historyTimeline = document.querySelector("#historyTimeline");
const historyDialog = document.querySelector("#historyDialog");

function openHistory(id) {
  const entry = historyEntries.find((item) => item.id === id);
  if (!entry) return;
  document.querySelector("#historyDialogYear").textContent = entry.year;
  document.querySelector("#historyDialogTitle").textContent = entry.title;
  const body = document.querySelector("#historyDialogBody");
  body.replaceChildren(...entry.body.map((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    return p;
  }));
  const chapterIds = { '1326':'poczatki', '1595':'poczatki', '1647':'testament', '1661':'testament', '1681':'testament', sapinski:'sapinski', sosinski:'proboszczowie', '1818':'wspolnota' };
  const chapter = historyChapters.find(chapter => chapter.id === chapterIds[id]);
  if (chapter) {
    body.append(makeHistoryFigure(chapter));
    const subtitle = document.createElement('h3');
    subtitle.textContent = 'Szerszy kontekst w źródle z 1929 roku';
    body.append(subtitle);
    chapter.paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; body.append(p); });
  } else {
    body.append(makeHistoryFigure(historyChapters[2]));
  }
  const sources = document.querySelector("#historyDialogSources");
  sources.replaceChildren(...entry.sources.map((source) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = source.label;
    li.append(link);
    return li;
  }));
  historyDialog.showModal();
}

historyEntries.forEach((entry) => {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "timeline-trigger";
  button.dataset.historyId = entry.id;
  const time = document.createElement("time");
  time.textContent = entry.year;
  const copy = document.createElement("span");
  copy.className = "timeline-copy";
  const title = document.createElement("strong");
  title.textContent = entry.title;
  const teaser = document.createElement("span");
  teaser.textContent = entry.teaser;
  const more = document.createElement("span");
  more.className = "timeline-more";
  more.textContent = "Czytaj i zobacz źródła";
  copy.append(title, teaser, more);
  button.append(time, copy);
  item.append(button);
  historyTimeline.append(item);
});
document.querySelectorAll(".history-open").forEach((button) => button.addEventListener("click", () => openHistory(button.dataset.historyId)));
historyTimeline.addEventListener("click", (event) => {
  const button = event.target.closest("[data-history-id]");
  if (button) openHistory(button.dataset.historyId);
});
document.querySelector("#historyDialogClose").addEventListener("click", () => historyDialog.close());
historyDialog.addEventListener("click", (event) => { if (event.target === historyDialog) historyDialog.close(); });

const scanDialog = document.querySelector('#scanDialog');
let scanPage = 118;
function showScan(page) {
  scanPage = 118 + ((page - 118 + 7) % 7);
  const path = `assets/archiwum/kotuszow-1929-s${scanPage}.png`;
  document.querySelector('#scanTitle').textContent = `Kotuszów, 1929 · strona ${scanPage}`;
  document.querySelector('#scanImage').src = path;
  document.querySelector('#scanImage').alt = `Jan Wiśniewski, opis Kotuszowa, strona ${scanPage}`;
  document.querySelector('#scanOriginal').href = path;
  if (!scanDialog.open) scanDialog.showModal();
  scanDialog.scrollTop = 0;
}
for (let page = 118; page <= 124; page++) {
  const button = document.createElement('button');
  button.type = 'button';
  const img = document.createElement('img');
  img.src = `assets/archiwum/kotuszow-1929-s${page}.png`;
  img.alt = ''; img.loading = 'lazy';
  const label = document.createElement('span');
  label.textContent = `Strona ${page}`;
  button.append(img, label);
  button.addEventListener('click', () => showScan(page));
  document.querySelector('#archivePages').append(button);
}
document.querySelector('#scanClose').addEventListener('click', () => scanDialog.close());
document.querySelector('#scanPrev').addEventListener('click', () => showScan(scanPage - 1));
document.querySelector('#scanNext').addEventListener('click', () => showScan(scanPage + 1));
scanDialog.addEventListener('click', event => { if (event.target === scanDialog) scanDialog.close(); });

function makeHistoryFigure(chapter) {
  const figure = document.createElement('figure');
  figure.className = 'chapter-figure' + (chapter.image.includes('/archiwum/') ? ' is-document' : '');
  const image = document.createElement('img');
  image.src = chapter.image;
  image.alt = chapter.caption;
  image.loading = 'lazy';
  if (chapter.image.includes('/archiwum/')) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'scan-opener';
    button.setAttribute('aria-label', `Otwórz oryginalny skan strony ${chapter.page}`);
    button.append(image); button.addEventListener('click', () => showScan(chapter.page));
    figure.append(button);
  } else figure.append(image);
  const caption = document.createElement('figcaption');
  const text = document.createElement('span'); text.textContent = chapter.caption;
  const source = document.createElement('a');
  source.href = chapter.source || SOURCE.book.url;
  source.target = '_blank'; source.rel = 'noopener'; source.textContent = chapter.credit;
  caption.append(text, source); figure.append(caption);
  return figure;
}
historyChapters.forEach((chapter,index) => {
  const article = document.createElement('article');
  article.className = 'history-chapter'; article.id = `chapter-${chapter.id}`;
  const copy = document.createElement('div'); copy.className = 'chapter-copy';
  const era = document.createElement('p'); era.className = 'eyebrow'; era.textContent = `${String(index+1).padStart(2,'0')} · ${chapter.era}`;
  const heading = document.createElement('h3'); heading.textContent = chapter.title;
  copy.append(era,heading);
  chapter.paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; copy.append(p); });
  const credit = document.createElement('p'); credit.className = 'article-source';
  const link = document.createElement('a'); link.href = SOURCE.book.url; link.target = '_blank'; link.rel = 'noopener';
  link.textContent = `Źródło: ks. Jan Wiśniewski, „Historyczny opis kościołów, miast, zabytków i pamiątek w stopnickiem”, 1929, s. ${chapter.pages}. Biblioteka Cyfrowa UMCS · domena publiczna.`;
  credit.append('Opracowanie własne na podstawie źródła; cytaty zachowują pisownię autora. ',link);
  const scanButton = document.createElement('button'); scanButton.type = 'button'; scanButton.className = 'text-link';
  scanButton.textContent = `Przeczytaj oryginał · strona ${chapter.page}`;
  scanButton.addEventListener('click', () => showScan(chapter.page));
  copy.append(credit,scanButton);
  article.append(makeHistoryFigure(chapter),copy);
  document.querySelector('#historyChapters').append(article);
});

const scenes = [
  { image: "assets/kosciol-brama.webp", alt: "Widok kościoła przez zabytkową bramę", kicker: "Przystanek pierwszy", title: "Brama i dziedziniec", description: "Kamienna brama otwiera widok na barokową bryłę i wysoką wieżę kościoła.", position: "50% 45%", source: "https://commons.wikimedia.org/wiki/File:Kotuszow_kosciol_brama_p8212242.jpg" },
  { image: "assets/kosciol-fasada.webp", alt: "Fasada i wieża kościoła św. Jakuba", kicker: "Przystanek drugi", title: "Fasada i wieża", description: "Czterokondygnacyjna wieża kryje w przyziemiu kruchtę. Ośmioboczny hełm z latarenką góruje nad Kotuszowem.", position: "50% 27%", source: "https://commons.wikimedia.org/wiki/File:Ko%C5%9Bci%C3%B3%C5%82_par._pw._%C5%9Bw._Jakuba_Starszego_w_Kotuszowie.jpg" },
  { image: "assets/kosciol-detal-wejscia.webp", alt: "Kamienny portal wejściowy kościoła", kicker: "Przystanek trzeci", title: "Portal i detal kamieniarski", description: "Zatrzymaj się przy wejściu. Jasny kamień, łuk portalu i ślady czasu pokazują materialną historię świątyni.", position: "50% 50%", source: "https://commons.wikimedia.org/wiki/File:Kotuszow_kosciol_zdobienie_wejscia_p8212244.jpg" },
  { image: "assets/kosciol-wnetrze.webp", alt: "Nawa i prezbiterium kościoła św. Jakuba", kicker: "Przystanek czwarty", title: "Nawa i ołtarz", description: "Wnętrze prowadzi wzrok ku ołtarzowi głównemu z obrazem Matki Bożej Łaskawej, zwanej Kotuszowską.", position: "50% 38%", source: "https://commons.wikimedia.org/wiki/File:Wn%C4%99trze_ko%C5%9Bcio%C5%82a_par._pw._%C5%9Bw._Jakuba_Starszego_w_Kotuszowie.jpg" },
  { image: "assets/krzyz-kotuszow.webp", alt: "Przydrożny krzyż w Kotuszowie", kicker: "Przystanek piąty", title: "Krzyż przy drodze", description: "Mała architektura sakralna rozszerza opowieść poza mury kościoła i prowadzi przez krajobraz parafii.", position: "50% 38%", source: "https://commons.wikimedia.org/wiki/File:Kotuszow_krzyz_p8212240.jpg" },
  { image: "assets/sady-kotuszow.webp", alt: "Sady między Szydłowem a Kotuszowem", title: "Droga przez sady", description: "Sady między Szydłowem a Kotuszowem — krajobraz okolicy parafii sfotografowany w 2024 roku.", position: "50% 48%", source: "https://commons.wikimedia.org/wiki/File:Sady_mi%C4%99dzy_Szyd%C5%82owem_a_Kotuszowem_2024.jpg", credit: 'A.Budz., 2024 · CC BY-SA 4.0' },
];
scenes.push(
  { image:'assets/chancza-wies.webp', alt:'Droga w stronę jeziora w Chańczy', title:'Chańcza — w granicach parafii', description:'Chańcza należy do parafii Kotuszów. Fotografia Michała Dereli z 2009 roku pokazuje drogę w stronę jeziora, nie kaplicę.', position:'50% 50%', source:'https://commons.wikimedia.org/wiki/File:Chancza_P1000541.JPG', credit:'Michał Derela (Pibwl), 2009 · CC BY-SA 4.0' },
  { image:'assets/zalew-chancza.webp', alt:'Widok zalewu koło Chańczy', title:'Krajobraz nad Czarną', description:'Zalew Chańcza widziany z drogi na lewym brzegu Czarnej, w pobliżu Chańczy. Zdjęcie z 2011 roku.', position:'50% 55%', source:'https://commons.wikimedia.org/wiki/File:Zalew_Cha%C5%84cza_01.jpg', credit:'Agnieszka Kwiecień, Nova, 2011 · CC BY-SA 3.0' },
  { image:'assets/zalew-zyciny.webp', alt:'Zalew Chańcza przy Życinach', title:'Chwila nad wodą', description:'Wiosenny widok zalewu Chańcza przy Życinach — szersza okolica parafii, nie widok Kotuszowa. Fotografia z kwietnia 2024 roku.', position:'50% 50%', source:'https://commons.wikimedia.org/wiki/File:20240413_171746_Cha%C5%84cza_02.jpg', credit:'Dwxn, 2024 · CC BY-SA 4.0' }
);
const baseSceneCount = scenes.length;
['EwaRóża, 2015 · CC BY-SA 3.0', 'Łukasz Bakuła, 2014 · CC BY-SA 3.0 PL', 'EwaRóża, 2015 · CC BY-SA 3.0', 'Łukasz Bakuła, 2014 · CC BY-SA 3.0 PL', 'EwaRóża, 2015 · CC BY-SA 3.0'].forEach((credit,index) => { scenes[index].credit = credit; });

const tourStage = document.querySelector("#tourStage");
const tourImage = document.querySelector("#tourImage");
const tourIndex = document.querySelector("#tourIndex");
const tourTotal = document.querySelector("#tourTotal");
const tourKicker = document.querySelector("#tourKicker");
const tourTitle = document.querySelector("#tourTitle");
const tourDescription = document.querySelector("#tourDescription");
const tourSource = document.querySelector("#tourSource");
const zoomRange = document.querySelector("#zoomRange");
const scenePicker = document.querySelector("#scenePicker");
const dragHint = document.querySelector("#dragHint");
const autoTourButton = document.querySelector("#autoTourButton");
let activeScene = 0;
let zoom = Number(zoomRange.value);
let panX = 0;
let panY = 0;
let dragStart = null;
let autoTourTimer = null;
let sceneTimer = null;
let fitView = false;
const fitViewButton = document.querySelector('#fitViewButton');

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function renderTransform() {
  const maxPan = Math.max(0, (zoom - 1) * 180);
  panX = clamp(panX, -maxPan, maxPan);
  panY = clamp(panY, -maxPan, maxPan);
  tourImage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
}
function renderScenePicker() {
  scenePicker.replaceChildren(...scenes.map((scene, index) => {
    const button = document.createElement("button");
    button.className = "scene-card";
    button.type = "button";
    button.dataset.scene = String(index);
    const image = document.createElement("img");
    image.src = scene.image;
    image.alt = "";
    image.loading = "lazy";
    const label = document.createElement("span");
    const number = document.createElement("small");
    number.textContent = String(index + 1).padStart(2, "0");
    label.append(number, ` ${scene.title}`);
    button.append(image, label);
    button.addEventListener("click", () => setScene(index));
    return button;
  }));
  tourTotal.textContent = String(scenes.length).padStart(2, "0");
}
function resetView() {
  zoom = fitView ? 1 : activeScene === 0 ? 1.08 : 1.12;
  zoomRange.value = String(zoom);
  panX = 0;
  panY = 0;
  renderTransform();
}
function setScene(index) {
  activeScene = (index + scenes.length) % scenes.length;
  const scene = scenes[activeScene];
  tourImage.style.opacity = "0";
  window.clearTimeout(sceneTimer);
  sceneTimer = window.setTimeout(() => {
    tourImage.src = scene.image;
    tourImage.alt = scene.alt;
    tourImage.style.objectPosition = scene.position || "50% 50%";
    tourKicker.textContent = scene.kicker || `Przystanek ${activeScene + 1}`;
    tourTitle.textContent = scene.title;
    tourDescription.textContent = scene.description;
    tourSource.href = safeSourceUrl(scene.source) || scene.image;
    tourSource.textContent = scene.credit ? `${scene.credit} · źródło i licencja` : 'Zdjęcie i licencja';
    tourIndex.textContent = String(activeScene + 1).padStart(2, "0");
    resetView();
    tourImage.style.opacity = "1";
  }, 160);
  [...scenePicker.querySelectorAll("[data-scene]")].forEach((card, cardIndex) => {
    const active = cardIndex === activeScene;
    card.classList.toggle("is-active", active);
    if (active) card.setAttribute("aria-current", "true");
    else card.removeAttribute("aria-current");
  });
}
function stopAutoTour() {
  window.clearInterval(autoTourTimer);
  autoTourTimer = null;
  autoTourButton.setAttribute("aria-pressed", "false");
  autoTourButton.textContent = "▶ Auto";
}
document.querySelector("#tourPrev").addEventListener("click", () => setScene(activeScene - 1));
document.querySelector("#tourNext").addEventListener("click", () => setScene(activeScene + 1));
document.querySelector("#resetViewButton").addEventListener("click", resetView);
fitViewButton.addEventListener('click', () => {
  fitView = !fitView;
  tourImage.style.objectFit = fitView ? 'contain' : 'cover';
  fitViewButton.setAttribute('aria-pressed', String(fitView));
  fitViewButton.textContent = fitView ? 'Wypełnij' : 'Cały kadr';
  resetView();
});
autoTourButton.addEventListener("click", () => {
  if (autoTourTimer) return stopAutoTour();
  autoTourButton.setAttribute("aria-pressed", "true");
  autoTourButton.textContent = "■ Stop";
  autoTourTimer = window.setInterval(() => setScene(activeScene + 1), 6000);
});
zoomRange.addEventListener("input", () => { zoom = Number(zoomRange.value); renderTransform(); });
tourStage.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  dragStart = { x: event.clientX - panX, y: event.clientY - panY };
  tourStage.setPointerCapture(event.pointerId);
  dragHint.classList.add("is-hidden");
});
tourStage.addEventListener("pointermove", (event) => {
  if (!dragStart) return;
  panX = event.clientX - dragStart.x;
  panY = event.clientY - dragStart.y;
  renderTransform();
});
function endDrag(event) {
  if (!dragStart) return;
  dragStart = null;
  if (tourStage.hasPointerCapture(event.pointerId)) tourStage.releasePointerCapture(event.pointerId);
}
tourStage.addEventListener("pointerup", endDrag);
tourStage.addEventListener("pointercancel", endDrag);
tourStage.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoom = clamp(zoom + (event.deltaY > 0 ? -0.05 : 0.05), 1, 1.7);
  zoomRange.value = String(zoom);
  renderTransform();
}, { passive: false });
document.querySelector("#fullscreenButton").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) await tourStage.requestFullscreen();
    else await document.exitFullscreen();
  } catch (_) { /* Podgląd osadzony może blokować fullscreen. */ }
});
tourStage.addEventListener("keydown", (event) => {
  if (event.target !== tourStage) return;
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
  if (event.key === "ArrowLeft") setScene(activeScene - 1);
  if (event.key === "ArrowRight") setScene(activeScene + 1);
  if (event.key === "Escape") stopAutoTour();
});
window.addEventListener('hashchange', stopAutoTour);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopAutoTour(); });

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("pl-PL", { timeZone: 'Europe/Warsaw', day: "numeric", month: "long", year: "numeric" }).format(date);
}
function renderLiveNews(articles) {
  const grid = document.querySelector("#liveNewsGrid");
  grid.replaceChildren(...articles.map((article) => {
    const card = document.createElement("article");
    card.className = "news-card live-news-card";
    if (article.image) {
      const imageWrap = document.createElement("div");
      imageWrap.className = "news-image-wrap compact-image";
      const image = document.createElement("img");
      image.src = article.image;
      image.alt = "";
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      imageWrap.append(image);
      card.append(imageWrap);
    }
    const meta = document.createElement("div");
    meta.className = "news-meta";
    const category = document.createElement("span");
    category.className = "news-category inline";
    category.textContent = "Miasto i Gmina Szydłów";
    const time = document.createElement("time");
    time.dateTime = article.date;
    time.textContent = formatDate(article.date);
    meta.append(category, time);
    const title = document.createElement("h3");
    title.textContent = article.title;
    const excerpt = document.createElement("p");
    excerpt.textContent = article.excerpt;
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = article.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Czytaj u źródła";
    card.append(meta, title, excerpt, link);
    return card;
  }));
}
async function loadLiveNews() {
  const status = document.querySelector("#feedStatus");
  try {
    const response = await fetch("/api/aktualnosci", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.articles) || !data.articles.length) throw new Error("Pusty kanał");
    renderLiveNews(data.articles);
    status.textContent = `Pobrano ${formatDate(data.fetchedAt)}`;
    status.classList.add("is-online");
  } catch (_) {
    status.textContent = "Kanał chwilowo niedostępny. Poniżej wiadomości wybrane przez redakcję.";
    document.querySelector("#liveNewsGrid").hidden = true;
  }
}

function safeAssetPath(value) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/^\//, "");
  return normalized.startsWith("assets/") && !normalized.includes("..") ? normalized : "";
}
function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
function renderAdminContent(data) {
  dailyWords = Array.isArray(data.dailyWords) ? data.dailyWords : [];
  renderDailyWord();
  localIntentions = Array.isArray(data.intentions) ? data.intentions : [];
  renderIntentions();
  const announcements = Array.isArray(data.announcements) ? data.announcements : [];
  const noticeList = document.querySelector("#adminNoticeList");
  if (!announcements.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Nie opublikowano jeszcze ogłoszeń parafialnych. Porządek nabożeństw znajdziesz w zakładce Wydarzenia.';
    noticeList.replaceChildren(empty);
  } else {
    noticeList.replaceChildren(...announcements.map((notice) => {
      const article = document.createElement("article");
      article.className = "notice-card";
      const meta = document.createElement("p");
      meta.className = "notice-meta";
      meta.textContent = `${notice.category || "Ogłoszenie"} · ${formatDate(notice.date)}`;
      const title = document.createElement("h3");
      title.textContent = notice.title;
      const summary = document.createElement("p");
      summary.textContent = notice.summary || notice.body || "";
      article.append(meta, title, summary);
      if (notice.body && notice.body !== summary.textContent) {
        const detail = document.createElement('details');
        const heading = document.createElement('summary');
        heading.textContent = 'Przeczytaj pełne ogłoszenie';
        const text = document.createElement('p');
        text.className = 'notice-body';
        text.textContent = notice.body;
        detail.append(heading, text);
        article.append(detail);
      }
      const path = safeAssetPath(notice.image);
      if (path) {
        const photo = document.createElement('img');
        photo.src = path;
        photo.alt = notice.title;
        photo.className = 'notice-image';
        photo.loading = 'lazy';
        article.append(photo);
      }
      return article;
    }));
  }
  const gallery = Array.isArray(data.gallery) ? data.gallery : [];
  const galleryGrid = document.querySelector("#communityGalleryGrid");
  const gallerySection = document.querySelector("#communityGallery");
  galleryGrid.replaceChildren();
  gallerySection.hidden = true;
  scenes.splice(baseSceneCount);
  gallery.forEach((entry) => {
    const imagePath = safeAssetPath(entry.image);
    if (!imagePath) return;
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = imagePath;
    image.alt = entry.title || "Fotografia parafialna";
    image.loading = "lazy";
    const caption = document.createElement("figcaption");
    const title = document.createElement("strong");
    title.textContent = entry.title || "Galeria parafialna";
    const description = document.createElement("span");
    description.textContent = entry.description || "";
    caption.append(title, description);
    const credit = document.createElement('span');
    credit.textContent = [entry.author, entry.license].filter(Boolean).join(' · ');
    caption.append(credit);
    const source = safeSourceUrl(entry.source);
    if (source) {
      const link = document.createElement('a');
      link.href = source;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Źródło fotografii';
      caption.append(link);
    }
    figure.append(image, caption);
    galleryGrid.append(figure);
    if (entry.w_spacerze) {
      scenes.push({ image: imagePath, alt: entry.title || "Fotografia parafialna", title: entry.title || "Galeria parafialna", description: entry.description || "", position: "50% 50%", source: source || imagePath, credit: credit.textContent });
    }
  });
  if (galleryGrid.children.length) gallerySection.hidden = false;
  renderScenePicker();
  setScene(activeScene);
}
async function loadAdminContent() {
  try {
    const response = await fetch("data/admin-content.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    renderAdminContent(await response.json());
  } catch (_) {
    renderScenePicker();
    setScene(0);
  }
}

let localIntentions = [];
let remoteIntentions = null;
let intentionsFailed = false;
let dailyWords = [];
let displayedWordDate = '';
let lastContentRefreshAt = Date.now();
function renderDailyWord() {
  const selected = selectDailyWord(dailyWords);
  displayedWordDate = selected.date;
  document.querySelector('#dailyWordDate').dateTime = selected.date;
  document.querySelector('#dailyWordDate').textContent = formatDate(selected.date);
  document.querySelector('#dailyWordReadings').href = selected.url;
  document.querySelector('#dailyWordContent').hidden = !selected.entry;
  if (!selected.entry) {
    for (const id of ['dailyWordDay','dailyWordHeading','dailyWordQuote','dailyWordReference','dailyWordReflection']) document.getElementById(id).textContent = '';
    return;
  }
  const entry = selected.entry;
  document.querySelector('#dailyWordDay').textContent = entry.liturgicalDay;
  document.querySelector('#dailyWordHeading').textContent = entry.title;
  document.querySelector('#dailyWordQuote').textContent = `„${entry.quote}”`;
  document.querySelector('#dailyWordReference').textContent = entry.reference;
  document.querySelector('#dailyWordReflection').textContent = entry.reflection;
}
function refreshDatedContent() {
  if (displayedWordDate !== warsawDay() || Date.now() - lastContentRefreshAt >= 300000) {
    lastContentRefreshAt = Date.now();
    renderDailyWord();
    renderIntentions();
    loadAdminContent();
    loadIntentions();
  }
}
window.setInterval(refreshDatedContent, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDatedContent(); });
function todayInWarsaw() {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function renderIntentions() {
  const today = todayInWarsaw();
  const merged = new Map();
  for (const day of remoteIntentions?.days || []) if (day.date >= today) merged.set(day.date, day);
  // Wpis redaktora jest pełnym planem dnia i ma pierwszeństwo przed importem.
  for (const day of localIntentions) if (day.date >= today) merged.set(day.date, day);
  const days = [...merged.values()].sort((a,b) => a.date.localeCompare(b.date));
  const list = document.querySelector('#intentionsList');
  const status = document.querySelector('#intentionsStatus');
  const home = document.querySelector('#homeIntentions');
  list.replaceChildren();
  if (days.length) {
    status.textContent = 'Plan najbliższych nabożeństw. Godziny przy poszczególnych intencjach uwzględniają opublikowane zmiany.';
    for (const day of days) {
      const article = document.createElement('article');
      article.className = 'intention-day';
      const heading = document.createElement('h3');
      heading.textContent = `${formatDate(day.date)} · ${day.title}`;
      article.append(heading);
      const masses = [...(day.masses || [])].sort((a,b) => a.time.padStart(5,'0').localeCompare(b.time.padStart(5,'0')));
      for (const mass of masses) {
        const row = document.createElement('div');
        row.className = 'intention-row';
        const time = document.createElement('time');
        time.textContent = mass.time;
        const copy = document.createElement('p');
        copy.textContent = mass.intention;
        if (mass.place) {
          const place = document.createElement('small');
          place.textContent = mass.place;
          copy.append(place);
        }
        row.append(time, copy);
        article.append(row);
      }
      if (day.sourceUrl) {
        const link = document.createElement('a');
        link.href = safeSourceUrl(day.sourceUrl);
        link.textContent = 'Źródło: serwis parafii';
        link.target = '_blank'; link.rel = 'noopener';
        article.append(link);
      }
      list.append(article);
    }
    home.textContent = `${formatDate(days[0].date)}: ${(days[0].masses || []).map(mass => mass.time).join(' · ')}. Zobacz intencje i pełny plan.`;
  } else if (remoteIntentions) {
    status.textContent = `Serwis parafii nie udostępnia jeszcze bieżących intencji. Ostatnia dostępna publikacja: ${remoteIntentions.latestTitle} — materiał archiwalny. Aktualne terminy można potwierdzić w parafii.`;
    home.textContent = 'Bieżące intencje nie zostały jeszcze opublikowane.';
  } else if (intentionsFailed) {
    status.textContent = 'Nie udało się teraz sprawdzić intencji. Skorzystaj z odnośnika do serwisu parafii lub skontaktuj się telefonicznie.';
    home.textContent = 'Sprawdź intencje w serwisie parafii.';
  }
}
async function loadIntentions() {
  try {
    const response = await fetch('/api/intencje', {headers:{Accept:'application/json'}});
    if (!response.ok) throw new Error('Nie można pobrać intencji');
    const data = await response.json();
    if (!Array.isArray(data.days) || typeof data.latestTitle !== 'string') throw new Error('Niepoprawne dane');
    remoteIntentions = data;
  } catch { intentionsFailed = true; }
  renderIntentions();
}

showPage(currentRoute());
renderScenePicker();
setScene(0);
loadLiveNews();
loadAdminContent();
loadIntentions();
renderDailyWord();
