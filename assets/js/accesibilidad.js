
// accesibilidad.js
// Controles globales de accesibilidad para 📚PEVE
// 🏠 home · 🗣️ narrador · 🌓 tema · A+/A− tamaño · 🌐 idioma · 🧠 guía · 🔍 búsqueda

(function () {
  const doc = document;
  const win = window;
  const body = doc.body;
  const html = doc.documentElement;

  const THEME_KEY = "peve-theme";
  const FONT_KEY = "peve-font-scale";
  const LANG_KEY = "peve-lang";

  const LANGS = ["es", "en", "fr"];

  // Utilidad simple
  const $ = (sel) => doc.querySelector(sel);

  // Botones (soporta versiones antiguas por id y nuevas por data-action)
  const btnTheme =
    $("#btn-theme") || doc.querySelector('[data-action="toggle-theme"]');
  const btnFontInc =
    $("#btn-font-inc") || doc.querySelector('[data-action="font-inc"]');
  const btnFontDec =
    $("#btn-font-dec") || doc.querySelector('[data-action="font-dec"]');
  const btnNarrator =
    $("#btn-narrator") || doc.querySelector('[data-action="narrator"]');
  const btnHome =
    $("#btn-home") || doc.querySelector('[data-action="home"]');
  const btnLang =
    $("#btn-lang") || doc.querySelector('[data-action="lang"]');
  const btnGuide =
    $("#btn-guide") || doc.querySelector('[data-action="guide"]');
  const btnSearch =
    $("#btn-search") || doc.querySelector('[data-action="search"]');

  /* =========================
     TEMA CLARO / OSCURO
     ========================= */

  function applyTheme(theme) {
    const isLight = theme === "light";
    body.classList.toggle("theme-light", isLight);
    body.classList.toggle("theme-dark", !isLight);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore
    }
  }

  function toggleTheme() {
    const current =
      body.classList.contains("theme-light") ? "light" : "dark";
    applyTheme(current === "light" ? "dark" : "light");
  }

  // Inicializar tema desde localStorage
  (function initTheme() {
    let theme = "dark";
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") theme = stored;
    } catch (e) {
      // ignore
    }
    applyTheme(theme);
  })();

  if (btnTheme) {
    btnTheme.addEventListener("click", toggleTheme);
  }

  /* =========================
     TAMAÑO DE FUENTE
     ========================= */

  let fontScale = 1;

  function applyFontScale(scale) {
    fontScale = Math.min(1.3, Math.max(0.85, scale));
    // Ajusta el tamaño base del html para escalar todo el sitio
    const base = 16; // px
    html.style.fontSize = base * fontScale + "px";
    try {
      localStorage.setItem(FONT_KEY, String(fontScale));
    } catch (e) {
      // ignore
    }
  }

  (function initFont() {
    let storedScale = 1;
    try {
      const raw = localStorage.getItem(FONT_KEY);
      if (raw) {
        const n = parseFloat(raw);
        if (!isNaN(n)) storedScale = n;
      }
    } catch (e) {
      // ignore
    }
    applyFontScale(storedScale);
  })();

  function increaseFont() {
    applyFontScale(fontScale + 0.06);
  }

  function decreaseFont() {
    applyFontScale(fontScale - 0.06);
  }

  if (btnFontInc) btnFontInc.addEventListener("click", increaseFont);
  if (btnFontDec) btnFontDec.addEventListener("click", decreaseFont);

  /* =========================
     NARRADOR – LEE EL CONTENIDO
     ========================= */

  let narratorActive = false;

  function getPageText() {
    const main =
      doc.getElementById("main-content") || doc.querySelector("main") || body;
    // Elimina texto de navegación y footer para que sea más limpio
    const clone = main.cloneNode(true);
    clone
      .querySelectorAll("nav, header .topbar, footer, script, style")
      .forEach((el) => el.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  function speak(text, lang) {
    if (!("speechSynthesis" in win)) {
      alert(
        "Tu navegador no soporta la lectura en voz alta. Puedes probar en Chrome o Edge."
      );
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang || (html.getAttribute("lang") || "es-ES");
    utter.rate = 1;
    utter.pitch = 1;
    win.speechSynthesis.cancel();
    win.speechSynthesis.speak(utter);
  }

  function toggleNarrator() {
    if (!("speechSynthesis" in win)) {
      alert(
        "Tu navegador no soporta la lectura en voz alta. Puedes probar en Chrome o Edge."
      );
      return;
    }

    if (narratorActive) {
      win.speechSynthesis.cancel();
      narratorActive = false;
      return;
    }

    const text = getPageText();
    if (!text) return;
    narratorActive = true;
    speak(text);
  }

  if (btnNarrator) {
    btnNarrator.addEventListener("click", toggleNarrator);
  }

  /* =========================
     BOTÓN 🏠 IR AL INICIO
     ========================= */

  function goHome() {
    const attr =
      (btnHome && btnHome.getAttribute("data-home")) ||
      html.getAttribute("data-home");
    if (attr) {
      win.location.href = attr;
    } else {
      // fallback: raíz del proyecto
      win.location.href = "/pevev2/index.html";
    }
  }

  if (btnHome) {
    btnHome.addEventListener("click", goHome);
  }

  /* =========================
     🌐 IDIOMAS ES / EN / FR
     Versión simple: cambia textos con data-i18n
     ========================= */

  const I18N = {
    es: {
      "nav.inicio": "Inicio",
      "nav.proceso": "Proceso",
      "nav.niveles": "Niveles",
      "nav.asignaturas": "Asignaturas",
      "nav.perfiles": "Perfiles",
      "nav.accesibilidad": "Accesibilidad",
      "nav.acerca": "Acerca de",
      "nav.admin": "Administrador",
      "nav.informes": "Informes",
    },
    en: {
      "nav.inicio": "Home",
      "nav.proceso": "Process",
      "nav.niveles": "Levels",
      "nav.asignaturas": "Subjects",
      "nav.perfiles": "Profiles",
      "nav.accesibilidad": "Accessibility",
      "nav.acerca": "About",
      "nav.admin": "Admin",
      "nav.informes": "Reports",
    },
    fr: {
      "nav.inicio": "Accueil",
      "nav.proceso": "Processus",
      "nav.niveles": "Niveaux",
      "nav.asignaturas": "Matières",
      "nav.perfiles": "Profils",
      "nav.accesibilidad": "Accessibilité",
      "nav.acerca": "À propos",
      "nav.admin": "Administration",
      "nav.informes": "Rapports",
    },
  };

  let currentLang = (function initLang() {
    let lang =
      (html.getAttribute("lang") || "es").toLowerCase().slice(0, 2) || "es";
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored && LANGS.includes(stored)) lang = stored;
    } catch (e) {
      // ignore
    }
    applyLang(lang);
    return lang;
  })();

  function applyLang(lang) {
    html.setAttribute("lang", lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      // ignore
    }
    const map = I18N[lang];
    if (!map) return;
    Object.keys(map).forEach((key) => {
      doc
        .querySelectorAll('[data-i18n="' + key + '"]')
        .forEach((el) => (el.textContent = map[key]));
    });
  }

  function cycleLang() {
    const idx = LANGS.indexOf(currentLang);
    const next = LANGS[(idx + 1) % LANGS.length];
    currentLang = next;
    applyLang(next);
  }

  if (btnLang) {
    btnLang.addEventListener("click", cycleLang);
  }

  /* =========================
     🧠 GUÍA PASO A PASO
     ========================= */

  function ensureGuideModal() {
    if (doc.getElementById("peve-guide-overlay")) return;

    const overlay = doc.createElement("div");
    overlay.id = "peve-guide-overlay";
    overlay.className = "peve-guide-backdrop";
    overlay.innerHTML = `
      <div class="peve-guide-modal">
        <button class="peve-guide-close" aria-label="Cerrar guía">✕</button>
        <h2>🧠 Guía rápida para usar 📚PEVE</h2>
        <p>Esta guía te orienta sobre cómo moverte por la plataforma:</p>
        <ul>
          <li>🏠 <strong>Inicio:</strong> vuelve al inicio de la plataforma.</li>
          <li>🗣️ <strong>Lectura:</strong> activa el narrador para leer la página.</li>
          <li>🌓 <strong>Tema:</strong> cambia entre modo claro y oscuro.</li>
          <li>A+/A− <strong>Tamaño:</strong> ajusta el tamaño de la letra.</li>
          <li>🌐 <strong>Idiomas:</strong> alterna entre Español, Inglés y Francés (nav principal).</li>
          <li>🔍 <strong>Búsqueda:</strong> busca una palabra o frase dentro de la página.</li>
        </ul>
        <p class="note" style="margin-top:0.8rem;">
          Próximas versiones integrarán también ayudas específicas para estudiantes, apoderados y docentes.
        </p>
      </div>
    `;
    doc.body.appendChild(overlay);

    const close = overlay.querySelector(".peve-guide-close");
    close.addEventListener("click", () => {
      overlay.remove();
    });
    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) overlay.remove();
    });
  }

  function openGuide() {
    ensureGuideModal();
  }

  if (btnGuide) {
    btnGuide.addEventListener("click", openGuide);
  }

  /* =========================
     🔍 BÚSQUEDA SIMPLE EN LA PÁGINA
     ========================= */

  function triggerSearch() {
    const term = win.prompt(
      "¿Qué palabra o frase quieres buscar en esta página?"
    );
    if (!term) return;

    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    const lowerTerm = term.toLowerCase();
    let targetNode = null;

    while ((node = walker.nextNode())) {
      if (
        node.parentElement &&
        !["SCRIPT", "STYLE"].includes(node.parentElement.tagName)
      ) {
        const idx = node.textContent.toLowerCase().indexOf(lowerTerm);
        if (idx !== -1) {
          targetNode = node.parentElement;
          break;
        }
      }
    }

    if (!targetNode) {
      win.alert("No se encontró \"" + term + "\" en esta página.");
      return;
    }

    targetNode.scrollIntoView({ behavior: "smooth", block: "center" });
    targetNode.classList.add("peve-search-highlight");
    setTimeout(
      () => targetNode.classList.remove("peve-search-highlight"),
      2200
    );
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", triggerSearch);
  }
})();
