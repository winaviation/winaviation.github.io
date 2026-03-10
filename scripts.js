const allBtns = document.querySelectorAll("liquid-btn[data-panel]");
let currentPanel = "home";
let transitioning = false;

const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

let bentoState = "home";

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

function navigateTo(panel) {
  if (panel === currentPanel || transitioning) return;
  transitioning = true;

  allBtns.forEach((btn) => {
    if (btn.dataset.panel === panel) btn.id = "current";
    else btn.removeAttribute("id");
  });

  const outPanel = document.getElementById("panel-" + currentPanel);
  const inPanel = document.getElementById("panel-" + panel);

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

const MOBILE_SIZES = {
  mainCard: { vw: "88", vh: "58", fontSize: "16px" },
  sideCard: { vw: "88", vh: "30", fontSize: "15px" },
  navBtn: { vw: "20", vh: "6.5", fontSize: null },
  repoBtn: { vw: "76", vh: "6.2", fontSize: null },
  topbar: { vw: "92", vh: "8.368", fontSize: null },
};

const originalAttrs = new WeakMap();
// per-element generation counter, incremented on every size change so stale
// requestAnimationFrame font-size overrides can detect they've been superseded
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
    const gen = (fontGeneration.get(el) || 0) + 1;
    fontGeneration.set(el, gen);

    const enforce = () => {
      el.style.fontSize = sizes.fontSize;
    };
    enforce(); // apply immediately after attribute swap
    const obs = new MutationObserver(() => {
      if (fontGeneration.get(el) !== gen) {
        obs.disconnect();
        return;
      }
      if (el.style.fontSize !== sizes.fontSize) enforce();
    });
    obs.observe(el, { attributes: true, attributeFilter: ["style"] });
    setTimeout(() => obs.disconnect(), 500);
  }
}

function restoreOriginal(el) {
  const orig = originalAttrs.get(el);
  if (!orig) return;
  // bump generation so any pending mobile rAF font-size override is cancelled
  fontGeneration.set(el, (fontGeneration.get(el) || 0) + 1);
  if (orig.vw !== null) el.setAttribute("vw-width", orig.vw);
  if (orig.vh !== null) el.setAttribute("vh-height", orig.vh);
  el.style.fontSize = orig.fontSize;
}

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

function checkLayout() {
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  if (isMobile !== lastIsMobile) {
    lastIsMobile = isMobile;
    applyLayout(isMobile);
  }
}

customElements.whenDefined("liquid-glass").then(() => {
  customElements.whenDefined("liquid-btn").then(() => {
    checkLayout();
  });
});

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

// close menu when tapping outside
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

// keep mobile active state in sync with desktop nav
// patch navigateTo to also update mobile buttons
const _origNavigateTo = navigateTo;
allBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    updateMobileActiveBtn(btn.dataset.panel);
  });
});

// set initial active state
updateMobileActiveBtn(currentPanel);

const VALID_PANELS = ["home", "about", "repo"];

function getPanelFromHash() {
  const hash = window.location.hash.replace("#", "").toLowerCase();
  return VALID_PANELS.includes(hash) ? hash : "home";
}

function navigateToHash(panel, pushState = true) {
  // update the URL hash without triggering a page reload
  if (pushState) {
    history.pushState(null, "", panel === "home" ? "#home" : `#${panel}`);
  }
  navigateTo(panel);
  updateMobileActiveBtn(panel);
}

customElements.whenDefined("liquid-glass").then(() => {
  customElements.whenDefined("liquid-btn").then(() => {
    const initial = getPanelFromHash();
    if (initial !== currentPanel) {
      transitioning = false;
      navigateTo(initial);
      updateMobileActiveBtn(initial);
      // sync the topbar button highlight
      allBtns.forEach((btn) => {
        if (btn.dataset.panel === initial) btn.id = "current";
        else btn.removeAttribute("id");
      });
    }
  });
});

// update hash when desktop nav buttons are clicked
allBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    history.pushState(null, "", `#${btn.dataset.panel}`);
  });
});

// update hash when mobile nav buttons are clicked
// (they already call navigateTo via their own listener, just push state here)
mobileNavBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    history.pushState(null, "", `#${btn.dataset.panel}`);
  });
});

// handle browser back/forward
window.addEventListener("popstate", () => {
  const panel = getPanelFromHash();
  navigateTo(panel);
  updateMobileActiveBtn(panel);
  allBtns.forEach((btn) => {
    if (btn.dataset.panel === panel) btn.id = "current";
    else btn.removeAttribute("id");
  });
});
