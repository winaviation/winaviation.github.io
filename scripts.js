const allBtns = document.querySelectorAll("liquid-btn[data-panel]");
let currentPanel = "home";
let transitioning = false;

const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

let bentoState = "home";

// shifts the main card to fill the space when side panels slide out
function setBentoState(state) {
  if (bentoState === state) return;
  bentoState = state;

  if (isMobileView()) return;

  const mainCard = document.getElementById("main-card");
  const bentoRight = document.getElementById("bento-right");

  if (state === "detail") {
    mainCard.style.left = "12.55vw";
    bentoRight.style.left = "130%";
    bentoRight.style.pointerEvents = "none";
  } else {
    mainCard.style.left = "";
    bentoRight.style.left = "";
    bentoRight.style.pointerEvents = "";
  }
}

// cross-fades between panels, guards against double-firing with the transitioning flag
function navigateTo(panel) {
  if (panel === currentPanel || transitioning) return;
  transitioning = true;

  // sync the active button state
  allBtns.forEach((btn) => {
    if (btn.dataset.panel === panel) btn.id = "current";
    else btn.removeAttribute("id");
  });

  const outPanel = document.getElementById("panel-" + currentPanel);
  const inPanel = document.getElementById("panel-" + panel);

  // bento layout only needs to shift when going to/from home
  const fromHome = currentPanel === "home";
  const toHome = panel === "home";
  const layoutChange = fromHome || toHome;

  outPanel.style.transition = "opacity 0.2s ease";
  outPanel.style.opacity = "0";

  if (layoutChange && !isMobileView()) {
    setBentoState(toHome ? "home" : "detail");
  }

  setTimeout(() => {
    outPanel.classList.remove("active");
    inPanel.classList.add("active");
    inPanel.style.opacity = "0";
    inPanel.style.transition = "opacity 0.25s ease";
    requestAnimationFrame(() => {
      inPanel.style.opacity = "1";
    });
    currentPanel = panel;
    // clean up inline styles after transition finishes
    setTimeout(() => {
      outPanel.style.opacity = "";
      outPanel.style.transition = "";
      inPanel.style.transition = "";
      transitioning = false;
    }, 250);
  }, 200);
}

allBtns.forEach((btn) => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.panel));
});

const MOBILE_BREAKPOINT = 768;

// vw/vh values to apply on mobile, keeps the glass elements sized for small screens
const MOBILE_SIZES = {
  mainCard: { vw: "88", vh: "58", fontSize: "16px" },
  sideCard: { vw: "88", vh: "30", fontSize: "15px" },
  navBtn: { vw: "20", vh: "6.5", fontSize: null },
  repoBtn: { vw: "76", vh: "6.2", fontSize: null },
  topbar: { vw: "92", vh: "8.368", fontSize: null },
};

// stash original attr values before overwriting so we can restore on desktop
const originalAttrs = new WeakMap();

// generation counter to cancel stale rAF font writes after rapid resizes
const fontGeneration = new WeakMap();

function saveOriginal(el) {
  if (!originalAttrs.has(el)) {
    originalAttrs.set(el, {
      vw: el.getAttribute("vw-width"),
      vh: el.getAttribute("vh-height"),
      fontSize: el.style.fontSize || "",
    });
  }
}

function applyMobileSize(el, sizes) {
  el.setAttribute("vw-width", sizes.vw);
  el.setAttribute("vh-height", sizes.vh);

  if (sizes.fontSize) {
    // bump generation so any pending rAF from a previous call gets ignored
    const gen = (fontGeneration.get(el) || 0) + 1;
    fontGeneration.set(el, gen);
    requestAnimationFrame(() => {
      if (fontGeneration.get(el) === gen) {
        el.style.fontSize = sizes.fontSize;
      }
    });
  }
}

function restoreOriginal(el) {
  const orig = originalAttrs.get(el);
  if (!orig) return;

  fontGeneration.set(el, (fontGeneration.get(el) || 0) + 1);
  if (orig.vw !== null) el.setAttribute("vw-width", orig.vw);
  if (orig.vh !== null) el.setAttribute("vh-height", orig.vh);
  el.style.fontSize = orig.fontSize;
}

// saves originals then swaps attrs in or out depending on viewport mode
function applyLayout(isMobile) {
  const mainCard = document.getElementById("main-card");
  const sideCards = document.querySelectorAll("#bento-right liquid-glass");
  const navBtns = document.querySelectorAll(".header-buttons liquid-btn");

  if (mainCard) saveOriginal(mainCard);
  sideCards.forEach(saveOriginal);
  navBtns.forEach(saveOriginal);

  const repoBtns = document.querySelectorAll("#panel-repo liquid-btn");
  repoBtns.forEach(saveOriginal);

  const topbarGlass = document.querySelector(".topbar liquid-glass");
  if (topbarGlass) saveOriginal(topbarGlass);

  if (isMobile) {
    if (mainCard) applyMobileSize(mainCard, MOBILE_SIZES.mainCard);
    sideCards.forEach((el) => applyMobileSize(el, MOBILE_SIZES.sideCard));
    navBtns.forEach((el) => applyMobileSize(el, MOBILE_SIZES.navBtn));
    repoBtns.forEach((el) => applyMobileSize(el, MOBILE_SIZES.repoBtn));
    if (topbarGlass) applyMobileSize(topbarGlass, MOBILE_SIZES.topbar);
  } else {
    if (mainCard) restoreOriginal(mainCard);
    sideCards.forEach(restoreOriginal);
    navBtns.forEach(restoreOriginal);
    repoBtns.forEach(restoreOriginal);
    if (topbarGlass) restoreOriginal(topbarGlass);
  }
}

let lastIsMobile = null;

// only calls applyLayout when the breakpoint actually crosses, skips redundant work
function checkLayout() {
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  if (isMobile !== lastIsMobile) {
    lastIsMobile = isMobile;
    applyLayout(isMobile);
  }
}

// wait for both custom elements to be ready before doing anything with their attrs
customElements.whenDefined("liquid-glass").then(() => {
  customElements.whenDefined("liquid-btn").then(() => {
    checkLayout();
  });
});

// debounced resize, 160ms is enough to not murder performance
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(checkLayout, 160);
});

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const mobileNavBtns = document.querySelectorAll(".mobile-nav-btn");

function setMobileMenuOpen(open) {
  mobileMenu.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", open);
  mobileMenu.setAttribute("aria-hidden", !open);
  const icon = document.getElementById("hamburger-icon");
  icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
}

function updateMobileActiveBtn(panel) {
  mobileNavBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.panel === panel);
  });
}

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  setMobileMenuOpen(!mobileMenu.classList.contains("open"));
});

// close the mobile menu on any outside click
document.addEventListener("click", (e) => {
  if (
    mobileMenu.classList.contains("open") &&
    !mobileMenu.contains(e.target) &&
    e.target !== hamburger
  ) {
    setMobileMenuOpen(false);
  }
});

mobileNavBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    setMobileMenuOpen(false);
    updateMobileActiveBtn(btn.dataset.panel);
    navigateTo(btn.dataset.panel);
  });
});

const _origNavigateTo = navigateTo;

// also sync mobile active state when desktop nav buttons are clicked
allBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    updateMobileActiveBtn(btn.dataset.panel);
  });
});

updateMobileActiveBtn(currentPanel);

const VALID_PANELS = ["home", "about", "repo"];

function getPanelFromHash() {
  const hash = window.location.hash.replace("#", "").toLowerCase();
  return VALID_PANELS.includes(hash) ? hash : "home";
}

// navigates to a panel and optionally pushes a history entry
function navigateToHash(panel, pushState = true) {
  if (pushState) {
    history.pushState(null, "", panel === "home" ? "#home" : `#${panel}`);
  }
  navigateTo(panel);
  updateMobileActiveBtn(panel);
}

// on load, jump straight to whatever panel the url hash points to
customElements.whenDefined("liquid-glass").then(() => {
  customElements.whenDefined("liquid-btn").then(() => {
    const initial = getPanelFromHash();
    if (initial !== currentPanel) {
      transitioning = false;
      navigateTo(initial);
      updateMobileActiveBtn(initial);

      allBtns.forEach((btn) => {
        if (btn.dataset.panel === initial) btn.id = "current";
        else btn.removeAttribute("id");
      });
    }
  });
});

// push hash on desktop nav click
allBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    history.pushState(null, "", `#${btn.dataset.panel}`);
  });
});

// push hash on mobile nav click
mobileNavBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    history.pushState(null, "", `#${btn.dataset.panel}`);
  });
});

// handle back/forward, sync panel and button state to wherever the browser landed
window.addEventListener("popstate", () => {
  const panel = getPanelFromHash();
  navigateTo(panel);
  updateMobileActiveBtn(panel);
  allBtns.forEach((btn) => {
    if (btn.dataset.panel === panel) btn.id = "current";
    else btn.removeAttribute("id");
  });
});
