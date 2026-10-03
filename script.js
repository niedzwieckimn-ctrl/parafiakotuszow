const pageTitles = {
  start: "Parafia św. Jakuba w Kotuszowie",
  wydarzenia: "Wydarzenia — Parafia św. Jakuba w Kotuszowie",
  aktualnosci: "Aktualności — Parafia św. Jakuba w Kotuszowie",
  historia: "Historia — Parafia św. Jakuba w Kotuszowie",
  zwiedzanie: "Wirtualne zwiedzanie — Parafia św. Jakuba w Kotuszowie",
};

const pageLabels = {
  start: "Strona główna",
  wydarzenia: "Wydarzenia",
  aktualnosci: "Aktualności",
  historia: "Historia",
  zwiedzanie: "Wirtualne zwiedzanie",
};

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

  if (focus) {
    const main = document.querySelector("#main-content");
    window.setTimeout(() => main.focus({ preventScroll: true }), 50);
  }
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

document.querySelector("#backTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const scenes = [
  {
    image: "assets/kosciol-brama.jpg",
    alt: "Widok kościoła przez zabytkową bramę",
    kicker: "Przystanek pierwszy",
    title: "Brama i dziedziniec",
    description: "Spójrz na świątynię od strony historycznego wejścia. Kamienna brama otwiera widok na barokową bryłę i wysoką wieżę kościoła.",
    position: "50% 45%",
  },
  {
    image: "assets/kosciol-fasada.jpg",
    alt: "Fasada i wieża kościoła św. Jakuba",
    kicker: "Przystanek drugi",
    title: "Fasada i wieża",
    description: "Czterokondygnacyjna wieża kryje w przyziemiu kruchtę. Jej charakterystyczny ośmioboczny hełm z arkadową latarenką góruje nad Kotuszowem.",
    position: "50% 27%",
  },
  {
    image: "assets/kosciol-wnetrze.jpg",
    alt: "Nawa i prezbiterium kościoła św. Jakuba",
    kicker: "Przystanek trzeci",
    title: "Nawa i ołtarz",
    description: "Wnętrze prowadzi wzrok ku prezbiterium i ołtarzowi głównemu. W świątyni znajduje się otoczony czcią obraz Matki Bożej Łaskawej, zwanej Kotuszowską.",
    position: "50% 38%",
  },
];

const tourStage = document.querySelector("#tourStage");
const tourImage = document.querySelector("#tourImage");
const tourIndex = document.querySelector("#tourIndex");
const tourKicker = document.querySelector("#tourKicker");
const tourTitle = document.querySelector("#tourTitle");
const tourDescription = document.querySelector("#tourDescription");
const zoomRange = document.querySelector("#zoomRange");
const sceneCards = [...document.querySelectorAll("[data-scene]")];
const hotspots = [...document.querySelectorAll("[data-scene-target]")];
const dragHint = document.querySelector("#dragHint");

let activeScene = 0;
let zoom = Number(zoomRange.value);
let panX = 0;
let panY = 0;
let dragStart = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function renderTransform() {
  const maxPan = Math.max(0, (zoom - 1) * 180);
  panX = clamp(panX, -maxPan, maxPan);
  panY = clamp(panY, -maxPan, maxPan);
  tourImage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
}

function setScene(index) {
  activeScene = (index + scenes.length) % scenes.length;
  const scene = scenes[activeScene];
  tourImage.style.opacity = "0";

  window.setTimeout(() => {
    tourImage.src = scene.image;
    tourImage.alt = scene.alt;
    tourImage.style.objectPosition = scene.position;
    tourKicker.textContent = scene.kicker;
    tourTitle.textContent = scene.title;
    tourDescription.textContent = scene.description;
    tourIndex.textContent = String(activeScene + 1).padStart(2, "0");
    zoom = activeScene === 0 ? 1.08 : 1.12;
    zoomRange.value = String(zoom);
    panX = 0;
    panY = 0;
    renderTransform();
    tourImage.style.opacity = "1";
  }, 180);

  sceneCards.forEach((card, cardIndex) => {
    const active = cardIndex === activeScene;
    card.classList.toggle("is-active", active);
    if (active) card.setAttribute("aria-current", "true");
    else card.removeAttribute("aria-current");
  });

  hotspots.forEach((hotspot) => {
    hotspot.hidden = Number(hotspot.dataset.sceneTarget) === activeScene;
  });
}

document.querySelector("#tourPrev").addEventListener("click", () => setScene(activeScene - 1));
document.querySelector("#tourNext").addEventListener("click", () => setScene(activeScene + 1));
sceneCards.forEach((card) => card.addEventListener("click", () => setScene(Number(card.dataset.scene))));
hotspots.forEach((hotspot) => hotspot.addEventListener("click", () => setScene(Number(hotspot.dataset.sceneTarget))));

zoomRange.addEventListener("input", () => {
  zoom = Number(zoomRange.value);
  renderTransform();
});

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
  zoom = clamp(zoom + (event.deltaY > 0 ? -.05 : .05), 1, 1.7);
  zoomRange.value = String(zoom);
  renderTransform();
}, { passive: false });

document.querySelector("#fullscreenButton").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) await tourStage.requestFullscreen();
    else await document.exitFullscreen();
  } catch (_) {
    // Pełny ekran może być blokowany w podglądzie osadzonym; spacer nadal działa.
  }
});

tourStage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") setScene(activeScene - 1);
  if (event.key === "ArrowRight") setScene(activeScene + 1);
});

showPage(currentRoute());
setScene(0);
