import { warsawDay } from './calendar.mjs';
import { displayedWord,createAutomaticLoader } from './daily-word-client.mjs';
import { historyChapters } from './history-chapters.mjs';
import { setupJourney } from './journey.mjs';
import { additionalChurchPhotos, suppliedChurchPhotos } from './church-photos.mjs';
import { setupHotspots } from './tour-hotspots.mjs';
import {albumImages,openAlbum,photoCount} from './community-album.mjs';
import {massSchedule,matchesIntention} from './mass-schedule.mjs';
import {attachPhotoGestures,openPhoto,setupPhotoLinks} from './photo-viewer.mjs';
import {setupMobileHome} from './mobile-layout.mjs';
import {setupPriests} from './priests.mjs';
import {setupMobileMenu} from './mobile-menu.mjs';
import {safeSourceUrl} from './public-links.mjs';
import {setupGoogleTour} from './google-tour.mjs';

const mobileHome=setupMobileHome();
setupPhotoLinks();

const pageTitles = {
  start: "Parafia św. Jakuba w Kotuszowie",
  wydarzenia: "Msze i intencje — Parafia św. Jakuba w Kotuszowie",
  aktualnosci: "Aktualności — Parafia św. Jakuba w Kotuszowie",
  historia: "Historia — Parafia św. Jakuba w Kotuszowie",
  camino: "El Camino — Parafia św. Jakuba w Kotuszowie",
  cmentarz: "Cmentarz — Parafia św. Jakuba w Kotuszowie",
  zwiedzanie: "Wirtualne zwiedzanie — Parafia św. Jakuba w Kotuszowie",
};

const pageLabels = { start: "Strona główna", wydarzenia: "Wydarzenia", aktualnosci: "Aktualności", historia: "Historia", camino: "El Camino", cmentarz: "Cmentarz", zwiedzanie: "Wirtualne zwiedzanie" };
const views = [...document.querySelectorAll("[data-page]")];
const pageLinks = [...document.querySelectorAll("[data-page-link]")];
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#siteNav");
const routeAnnouncer = document.querySelector(".route-announcer");
const mobileMenu = setupMobileMenu({button:menuToggle,nav:siteNav});

function currentRoute() {
  const route = window.location.hash.slice(1).toLowerCase().split('/')[0];
  return pageTitles[route] ? route : "start";
}

function closeMenu() {
  mobileMenu.close();
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
setupPriests({getHistory:id=>historyEntries.find(entry=>entry.id===id),sources:SOURCE});

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
    body: ["Lokalne opracowanie Tomasza Skuzy odnotowuje wizytę Lecha Wałęsy u ks. Antoniego Sobczyka w 1983 roku. To jeden z mniej znanych wątków pokazujących, że powojenna plebania była miejscem spotkań wykraczających poza granice parafii.", "W archiwum można obejrzeć dwie fotografie opublikowane przez serwis Kotuszow.pl. Jedna przedstawia spotkanie na plebanii, druga Lecha Wałęsę, biskupa Edwarda Materskiego i ks. Antoniego Sobczyka. Autor fotografii nie został wskazany w opracowaniu."],
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
  const illustrations = {
    '1326': {image:'assets/archiwum/kotuszow-1929-s118.png',page:118,caption:'Wzmianka o proboszczu Pawle w książce z 1929 r. — nie fotografia XIV-wiecznego kościoła.',credit:SOURCE.book.label},
    '1595': {image:'assets/archiwum/kotuszow-1929-s118.png',page:118,caption:'Strona 118: przytoczone świadectwa wizytacji z okresu reformacji.',credit:SOURCE.book.label},
    '1647': {image:'assets/archiwum/kotuszow-1929-s124.png',page:124,caption:'Testament Katarzyny Lanckorońskiej — oryginalny tekst w wydaniu z 1929 r.',credit:SOURCE.book.label},
    '1681': {image:'assets/archiwum/kotuszow-1929-s118.png',page:118,caption:'Zapis konsekracji z datą 11 listopada 1681 r.',credit:SOURCE.book.label},
    sapinski: {image:'assets/archiwum/kotuszow-1929-s122.png',page:122,caption:'Epitafium ks. Wawrzyńca Sapińskiego — świadectwo pozostawione przez proboszcza.',credit:SOURCE.book.label},
    sosinski: {image:'assets/archiwum/kotuszow-1929-s123.png',page:123,caption:'Informacje o ks. Pawle Sosińskim i jego fundacjach.',credit:SOURCE.book.label},
    '1818': {image:'assets/archiwum/kotuszow-1929-s121.png',page:121,caption:'Strona 121: zapis o kradzieży z 1818 r.',credit:SOURCE.book.label},
    '1944': {image:'assets/szkola-zniszczenia.webp',caption:'Zniszczony budynek szkoły w Kotuszowie. Fotografia ze zbiorów prezentowanych w lokalnej historii; dokładna data i autor niepodani.',credit:'Kotuszow.pl · opracowanie historii: Tomasz Skuza',source:SOURCE.local.url},
    sobczyk: {image:'assets/odbudowa-transport-drewna.webp',caption:'Drewno na nowy dach kościoła transportowano przy pomocy krów. Źródło nie podaje autora fotografii ani dokładnego dnia wykonania.',credit:'Powiat Buski 1939–1945 · fotografia archiwalna',source:'https://www.powiatbuski1939-1945.pl/straty-materialne-kosciola/'},
    '1983': {image:'assets/walesa-materski-sobczyk.webp',caption:'Lech Wałęsa, biskup Edward Materski i ks. Antoni Sobczyk. W źródle fotografia towarzyszy opisowi wizyty z 1983 r.; autor niepodany.',credit:'Kotuszow.pl · opracowanie historii: Tomasz Skuza',source:SOURCE.local.url},
    camino: {image:'assets/muszla-jakubowa.svg',caption:'Muszla — znak pielgrzymów św. Jakuba. Ilustracja symbolu, nie fotografia inauguracji szlaku.',credit:'Maxxl2 / Jürgen Krause · CC BY-SA 3.0',source:'https://commons.wikimedia.org/wiki/File:Escallop.svg'}
  };
  if (illustrations[id]) body.append(makeHistoryFigure(illustrations[id]));
  const chapterIds = { '1647':'testament', '1661':'testament', sapinski:'sapinski', sosinski:'proboszczowie', '1818':'wspolnota' };
  const chapter = historyChapters.find(chapter => chapter.id === chapterIds[id]);
  if (chapter) {
    const subtitle = document.createElement('h3');
    subtitle.textContent = 'Szerszy kontekst w źródle z 1929 roku';
    body.append(subtitle);
    chapter.paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; body.append(p); });
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
  appendDialogJourney(historyEntries.indexOf(entry), historyEntries.length, index => openHistory(historyEntries[index].id));
  if (!historyDialog.open) historyDialog.showModal();
  historyDialog.scrollTop = 0;
}

function appendDialogJourney(index, total, open) {
  historyDialog.querySelector('.dialog-journey')?.remove();
  const nav = document.createElement('div'); nav.className='dialog-journey';
  const prev=document.createElement('button'); prev.type='button'; prev.textContent='← Poprzednia opowieść'; prev.disabled=index===0;
  prev.addEventListener('click',()=>open(index-1));
  const counter=document.createElement('span');counter.textContent=`${index+1} / ${total}`;
  const next=document.createElement('button');next.type='button';next.textContent=index===total-1?'Wróć do wyboru':'Odkryj kolejną →';
  next.addEventListener('click',()=>index===total-1?historyDialog.close():open(index+1));
  nav.append(prev,counter,next);historyDialog.append(nav);
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
    button.append(image); button.addEventListener('click', () => openPhoto({image:chapter.image,title:chapter.caption,credit:chapter.credit}));
    figure.append(button);
  } else {const button=document.createElement('button');button.type='button';button.className='scan-opener';button.setAttribute('aria-label','Pokaż obraz: '+chapter.caption);button.append(image);button.addEventListener('click',()=>openPhoto({image:chapter.image,title:chapter.caption,credit:chapter.credit}));figure.append(button);}
  const caption = document.createElement('figcaption');
  const text = document.createElement('span'); text.textContent = chapter.caption;
  const source = document.createElement('a');
  source.href = chapter.source || SOURCE.book.url;
  source.target = '_blank'; source.rel = 'noopener'; source.textContent = chapter.credit;
  caption.append(text, source); figure.append(caption);
  return figure;
}
historyChapters.forEach((chapter,index) => {
  const button=document.createElement('button');button.type='button';button.className='chapter-tile';
  const image=document.createElement('img');image.src=chapter.image;image.alt='';image.loading='lazy';
  const copy=document.createElement('span');
  const era=document.createElement('small');era.textContent=chapter.era;
  const title=document.createElement('strong');title.textContent=chapter.title;
  const more=document.createElement('em');more.textContent='Wejdź w opowieść →';
  copy.append(era,title,more);button.append(image,copy);
  button.addEventListener('click',()=>openChapter(index));document.querySelector('#historyChapters').append(button);
});

function openChapter(index) {
  const chapter=historyChapters[index];
  document.querySelector('#historyDialogYear').textContent=chapter.era;
  document.querySelector('#historyDialogTitle').textContent=chapter.title;
  const body=document.querySelector('#historyDialogBody');body.replaceChildren(makeHistoryFigure(chapter));
  chapter.paragraphs.forEach(text=>{const p=document.createElement('p');p.textContent=text;body.append(p)});
  const note=document.createElement('p');note.className='article-source';note.textContent='Współczesne opracowanie źródła autorstwa ks. Jana Wiśniewskiego. Oryginalną pisownię zachowano w cytatach. Pełny tekst dostępny w skanie.';
  const button=document.createElement('button');button.type='button';button.className='text-link';button.textContent=`Przeczytaj oryginał · strona ${chapter.page}`;button.addEventListener('click',()=>showScan(chapter.page));
  body.append(note,button);
  const li=document.createElement('li');const link=document.createElement('a');link.href=SOURCE.book.url;link.target='_blank';link.rel='noopener';link.textContent=`Jan Wiśniewski, 1929, s. ${chapter.pages}. Biblioteka Cyfrowa UMCS · domena publiczna.`;li.append(link);document.querySelector('#historyDialogSources').replaceChildren(li);
  appendDialogJourney(index,historyChapters.length,openChapter);
  if(!historyDialog.open)historyDialog.showModal();historyDialog.scrollTop=0;
}

const scenes = [
  { image: "assets/kosciol-brama.webp", alt: "Widok kościoła przez zabytkową bramę", kicker: "Przystanek pierwszy", title: "Brama i dziedziniec", description: "Kamienna brama otwiera widok na barokową bryłę i wysoką wieżę kościoła.", position: "50% 45%", source: "https://commons.wikimedia.org/wiki/File:Kotuszow_kosciol_brama_p8212242.jpg" },
  { image: "assets/kosciol-fasada.webp", alt: "Fasada i wieża kościoła św. Jakuba", kicker: "Przystanek drugi", title: "Fasada i wieża", description: "Czterokondygnacyjna wieża kryje w przyziemiu kruchtę. Ośmioboczny hełm z latarenką góruje nad Kotuszowem.", position: "50% 27%", source: "https://commons.wikimedia.org/wiki/File:Ko%C5%9Bci%C3%B3%C5%82_par._pw._%C5%9Bw._Jakuba_Starszego_w_Kotuszowie.jpg" },
  { image: "assets/kosciol-detal-wejscia.webp", alt: "Kamienny portal wejściowy kościoła", kicker: "Przystanek trzeci", title: "Portal i detal kamieniarski", description: "Zatrzymaj się przy wejściu. Jasny kamień, łuk portalu i ślady czasu pokazują materialną historię świątyni.", position: "50% 50%", source: "https://commons.wikimedia.org/wiki/File:Kotuszow_kosciol_zdobienie_wejscia_p8212244.jpg" },
  { image: "assets/kosciol-wnetrze.webp", alt: "Nawa i prezbiterium kościoła św. Jakuba", kicker: "Przystanek czwarty", title: "Nawa i ołtarz", description: "Wnętrze prowadzi wzrok ku ołtarzowi głównemu z obrazem Matki Bożej Łaskawej, zwanej Kotuszowską.", position: "50% 38%", source: "https://commons.wikimedia.org/wiki/File:Wn%C4%99trze_ko%C5%9Bcio%C5%82a_par._pw._%C5%9Bw._Jakuba_Starszego_w_Kotuszowie.jpg" },
  {image:'assets/kosciol-z-lotu-ptaka.webp',alt:'Kościół św. Jakuba w Kotuszowie widziany z lotu ptaka',title:'Świątynia z lotu ptaka',description:'Bryła kościoła, dachy i otoczenie świątyni widziane z góry.',source:'',credit:'Archiwalne materiały parafii · autor i data niepodani'}
];
['EwaRóża, 2015 · CC BY-SA 3.0', 'Łukasz Bakuła, 2014 · CC BY-SA 3.0 PL', 'EwaRóża, 2015 · CC BY-SA 3.0', 'Łukasz Bakuła, 2014 · CC BY-SA 3.0 PL'].forEach((credit,index) => { scenes[index].credit = credit; });
scenes.splice(4,0,...additionalChurchPhotos);
scenes.push(...suppliedChurchPhotos);
const baseSceneCount = scenes.length;

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
let autoTourTimer = null;
let sceneTimer = null;
let fitView = true;
const fitViewButton = document.querySelector('#fitViewButton');
const hotspots = setupHotspots({stage:tourStage,image:tourImage,scenes,onNavigate:index=>{stopAutoTour();setScene(index);},onDetail:point=>{stopAutoTour();tourGesture.zoomToPoint(point,3);dragHint.textContent=point.label+' — zbliżenie';}});
const tourGesture=attachPhotoGestures(tourStage,tourImage,state=>{zoom=state.zoom;zoomRange.value=String(state.zoom);hotspots.align();});

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
  tourGesture.reset();
  zoom = 1;
  zoomRange.value = String(zoom);
  dragHint.textContent='Przybliż zdjęcie i przesuń, aby obejrzeć detale';
}
function setScene(index) {
  activeScene = (index + scenes.length) % scenes.length;
  const scene = scenes[activeScene];
  tourImage.style.opacity = "0";
  document.getElementById('tourHotspots').hidden = true;
  window.clearTimeout(sceneTimer);
  sceneTimer = window.setTimeout(() => {
    tourImage.src = scene.image;
    tourImage.alt = scene.alt;
    tourImage.style.objectPosition = scene.position || "50% 50%";
    tourKicker.textContent = scene.kicker || `Przystanek ${activeScene + 1}`;
    tourTitle.textContent = scene.title;
    tourDescription.textContent = scene.description;
    tourSource.href = safeSourceUrl(scene.source) || scene.image;
    tourSource.textContent = scene.credit || 'Źródło fotografii';
    tourIndex.textContent = String(activeScene + 1).padStart(2, "0");
    resetView();
    tourImage.style.opacity = "1";
    document.getElementById('tourHotspots').hidden = false;
    hotspots.render(scene);
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
  autoTourButton.textContent = "Pokaz zdjęć";
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
zoomRange.addEventListener("input", () => tourGesture.setZoom(Number(zoomRange.value)));
document.querySelector('#scanImage').addEventListener('click',()=>openPhoto({image:document.querySelector('#scanImage').getAttribute('src'),title:document.querySelector('#scanTitle').textContent,credit:SOURCE.book.label}));
tourStage.addEventListener('pointerdown',event=>{if(!event.target.closest('button')&&autoTourTimer)stopAutoTour();});
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
  grid.hidden = false;
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
  status.textContent = 'Wczytywanie…';
  try {
    const response = await fetch("/api/aktualnosci", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.articles) || !data.articles.length) throw new Error("Pusty kanał");
    renderLiveNews(data.articles);
    status.textContent = '';
    status.classList.add("is-online");
    return true;
  } catch (_) {
    status.textContent = 'Wiadomości chwilowo niedostępne.';
    document.querySelector("#liveNewsGrid").hidden = true;
    return false;
  }
}

function safeAssetPath(value) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/^\//, "");
  return /^assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(normalized) ? normalized : "";
}
function renderAdminContent(data) {
  dailyWords = Array.isArray(data.dailyWords) ? data.dailyWords : [];
  renderDailyWord();
  localIntentions = Array.isArray(data.intentions) ? data.intentions : [];
  renderIntentions();
  const announcements = Array.isArray(data.announcements) ? [...data.announcements].sort((a,b)=>Number(b.pinned===true)-Number(a.pinned===true)||new Date(b.date)-new Date(a.date)) : [];
  const noticeList = document.querySelector("#adminNoticeList");
  if (!announcements.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Brak nowych ogłoszeń.';
    noticeList.replaceChildren(empty);
  } else {
    noticeList.replaceChildren(...announcements.map((notice) => {
      const article = document.createElement("article");
      article.className = "notice-card"+(notice.pinned?' notice-important':'');
      const meta = document.createElement("p");
      meta.className = "notice-meta";
      meta.textContent = `${notice.pinned?'Ważne · ':''}${notice.category || "Ogłoszenie"} · ${formatDate(notice.date)}`;
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
    const photos=albumImages(entry);
    const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Otwórz: ${entry.title||'Album parafialny'} — ${photoCount(photos.length)}`);button.append(image);button.addEventListener('click',()=>openAlbum(entry));
    if(photos.length>1){const count=document.createElement('small');count.className='album-count';count.textContent=`${photoCount(photos.length)} · Otwórz album`;caption.prepend(count);}
    figure.append(button, caption);
    galleryGrid.append(figure);
    if (entry.w_spacerze && photos.length<=1) {
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
const automaticWord=createAutomaticLoader({onChange:()=>renderDailyWord()});
let displayedWordDate = '';
let lastContentRefreshAt = Date.now();
function renderDailyWord() {
  const selected = displayedWord(dailyWords,automaticWord.entry);
  displayedWordDate = selected.date;
  document.querySelector('#dailyWordDate').dateTime = selected.date;
  document.querySelector('#dailyWordDate').textContent = formatDate(selected.date);
  document.querySelector('#dailyWordReadings').href = selected.url;
  document.querySelector('#dailyWordContent').hidden = !selected.entry;
  document.querySelector('#dailyWordLabel').textContent = 'Słowo na dziś';
  document.querySelector('#dailyWordProvenance').hidden=selected.mode!=='automatic';
  document.querySelector('#dailyWordNotice').hidden=true;
  if (!selected.entry) {
    document.querySelector('#dailyWordHeading').textContent='Dzisiejsze czytania';
    for (const id of ['dailyWordDay','dailyWordQuote','dailyWordReference','dailyWordReflection']) document.getElementById(id).textContent = '';
    mobileHome.refresh();return;
  }
  const entry = selected.entry;
  document.querySelector('#dailyWordDay').textContent = entry.liturgicalDay;
  document.querySelector('#dailyWordHeading').textContent = entry.title;
  document.querySelector('#dailyWordQuote').textContent = `„${entry.quote}”`;
  document.querySelector('#dailyWordReference').textContent = entry.reference;
  document.querySelector('#dailyWordReflection').textContent = entry.reflection;
  if(selected.mode==='automatic') {
    document.querySelector('#dailyWordTextSource').href=entry.readingsUrl;
    document.querySelector('#dailyWordCalendarSource').href=entry.calendarUrl;
  }
  mobileHome.refresh();
}
function refreshDatedContent() {
  if (displayedWordDate !== warsawDay() || Date.now() - lastContentRefreshAt >= 300000) {
    lastContentRefreshAt = Date.now();
    renderDailyWord();
    renderIntentions();
    loadAdminContent();
    loadIntentions();
    automaticWord.refresh();
  }
}
window.setInterval(refreshDatedContent, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDatedContent(); });
function todayInWarsaw() {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function renderIntentions() {
  const today = todayInWarsaw();
  const days = massSchedule(localIntentions,remoteIntentions?.days||[],today);
  const query=document.querySelector('#intentionSearch').value;
  let found=0;
  const list = document.querySelector('#intentionsList');
  const status = document.querySelector('#intentionsStatus');
  const home = document.querySelector('#homeIntentions');
  list.replaceChildren();
  if (days.length) {
    status.textContent = '';
    for (const day of days) {
      const visibleMasses=day.masses.filter(mass=>matchesIntention(mass,query));
      if(!visibleMasses.length)continue;
      found+=visibleMasses.length;
      const article = document.createElement('article');
      article.className = 'intention-day';
      const heading = document.createElement('h3');
      heading.textContent = `${formatDate(day.date)}${day.title ? ` · ${day.title}` : ''}`;
      article.append(heading);
      const masses = visibleMasses;
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
      const sourceUrl = safeSourceUrl(day.sourceUrl);
      if (sourceUrl) {
        const link = document.createElement('a');
        link.href = sourceUrl;
        link.textContent = 'Źródło';
        link.target = '_blank'; link.rel = 'noopener';
        article.append(link);
      }
      list.append(article);
    }
    home.textContent = `${formatDate(days[0].date)}: ${(days[0].masses || []).map(mass => mass.time).join(' · ')}`;
  } else if (remoteIntentions) {
    status.textContent = 'Brak zaplanowanych Mszy.';
    home.textContent = status.textContent;
  } else if (intentionsFailed) {
    status.textContent = 'Brak zaplanowanych Mszy.';
    home.textContent = status.textContent;
  }
  status.hidden = !status.textContent;
  const count = document.querySelector('#intentionSearchCount');
  count.hidden = !query.trim();
  count.textContent=query.trim()?`Znaleziono: ${found} ${found===1?'Msza':found%10>=2&&found%10<=4&&(found%100<12||found%100>14)?'Msze':'Mszy'}`:'';
  if(!found && query.trim()){const empty=document.createElement('p');empty.className='empty-state';empty.textContent='Brak wyników. Spróbuj wpisać krótszy fragment intencji.';list.append(empty);}
}
document.querySelector('#intentionSearch').addEventListener('input',renderIntentions);
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
setupGoogleTour({onModeChange:()=>stopAutoTour()});
renderScenePicker();
setScene(0);
let municipalLoaded=false;
document.querySelector('#municipalNews').addEventListener('toggle',event=>{
  if(event.currentTarget.open&&!municipalLoaded){municipalLoaded=true;loadLiveNews().then(success=>{municipalLoaded=success})}
});
setupJourney({openHistory,openChapter});
loadAdminContent();
loadIntentions();
renderDailyWord();
automaticWord.refresh();
