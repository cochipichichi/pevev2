
// accesibilidad.js (v3.0)
// Controles globales de accesibilidad para 📚PEVE
// 🏠 home · 🗣️ narrador · 🌓 tema · A+/A− tamaño · 🌐 idioma · 🧠 guía · 🔍 búsqueda
//
// Este módulo NO reemplaza seguridad real (Access / backend). Es UX/accesibilidad.

(function () {
  if (window.__PEVE_A11Y_LOADED__) return;
  window.__PEVE_A11Y_LOADED__ = true;
  const doc = document;
  const win = window;
  const body = doc.body;
  const html = doc.documentElement;

  const THEME_KEY = "peve.theme";
  const THEME_KEY_LEGACY = "peve-theme";
  const FONT_KEY = "peve-font-scale";
  const LANG_KEY = "peve-lang";
  const CONTRAST_KEY = "peve-contrast";

  const LANGS = ["es", "en", "fr"];

  // =========================
  // i18n (UI + traducción automática limitada)
  // =========================

  const I18N = {
    es: {
      "nav.inicio": "Inicio",
      "nav.proceso": "Proceso",
      "nav.niveles": "Niveles",
      "nav.asignaturas": "Asignaturas",
      "nav.perfiles": "Perfiles",
      "nav.accesibilidad": "Accesibilidad",
      "nav.acerca": "Acerca de",
      "btn.home": "Ir al inicio",
      "btn.narrator": "Leer el contenido de la página",
      "btn.theme": "Cambiar tema claro/oscuro",
      "btn.fontPlus": "Aumentar tamaño de letra",
      "btn.fontMinus": "Disminuir tamaño de letra",
      "btn.lang": "Cambiar idioma ES/EN/FR",
      "btn.guide": "Abrir guía paso a paso",
      "btn.search": "Buscar en esta página",
      "search.prompt": "¿Qué quieres buscar en esta página?",
      "search.notFound": "No se encontró",
      "speech.unsupported": "Tu navegador no soporta la lectura en voz alta. Prueba Chrome o Edge.",
      "guide.title": "🧠 Guía rápida para usar 📚PEVE",
      "guide.close": "Cerrar guía",
      "guide.p1": "Usa la barra superior para activar accesibilidad: narrador, alto contraste, tamaño de letra y traducción.",
      "guide.p2": "En cada sección encontrarás temarios, actividades y tu progreso.",
      "guide.p3": "Si necesitas apoyo, solicita ayuda a tu docente o equipo PIE.",
      "toast.lang": "Idioma",
      "toast.theme": "Tema",
      "toast.contrast": "Contraste",
      "toast.on": "Activado",
      "toast.off": "Desactivado",
    },
    en: {
      "nav.inicio": "Home",
      "nav.proceso": "Process",
      "nav.niveles": "Levels",
      "nav.asignaturas": "Subjects",
      "nav.perfiles": "Profiles",
      "nav.accesibilidad": "Accessibility",
      "nav.acerca": "About",
      "btn.home": "Go to home",
      "btn.narrator": "Read this page aloud",
      "btn.theme": "Toggle light/dark theme",
      "btn.fontPlus": "Increase font size",
      "btn.fontMinus": "Decrease font size",
      "btn.lang": "Switch language ES/EN/FR",
      "btn.guide": "Open step-by-step guide",
      "btn.search": "Search on this page",
      "search.prompt": "What do you want to search on this page?",
      "search.notFound": "Not found",
      "speech.unsupported": "Your browser does not support text-to-speech. Try Chrome or Edge.",
      "guide.title": "🧠 Quick guide to use 📚PEVE",
      "guide.close": "Close guide",
      "guide.p1": "Use the top bar to enable accessibility: reader, high contrast, font size and translation.",
      "guide.p2": "In each section you will find official topics, activities and your progress.",
      "guide.p3": "If you need support, ask your teacher or the PIE team.",
      "toast.lang": "Language",
      "toast.theme": "Theme",
      "toast.contrast": "Contrast",
      "toast.on": "On",
      "toast.off": "Off",
      "Plataforma de Exámenes de Validación de Estudios": "Validation Exams Platform",
      "Plataforma de Exámenes Libres": "Free Exams Platform",
      "🛠️ Controles:": "🛠️ Controls:",
      "🛠️ Controles": "🛠️ Controls",
      "Mostrar guía paso a paso": "Show step-by-step guide",
      "⬅️ Volver": "⬅️ Back",
      "📖 Estudiar este módulo": "📖 Study this module",
      "📱 Ver en AR": "📱 View in AR",
      "📱 Entrar en AR": "📱 Open in AR",
      "👁️ Ver en 3D": "👁️ View in 3D",
      "👁️ 3D": "👁️ 3D",
      "✅ Registro CSV": "✅ CSV Log",
      "🧪 Quiz": "🧪 Quiz",
      "🎟️ Ticket": "🎟️ Ticket",
      "Temario": "Syllabus",
      "Temarios": "Syllabi",
      "Objetivo de aprendizaje": "Learning objective",
      "Objetivos de aprendizaje": "Learning objectives",
      "Actividades": "Activities",
      "Recursos": "Resources",
      "Materiales": "Materials",
      "Simulacros": "Mock tests",
      "Evaluación": "Assessment",
      "Evaluaciones": "Assessments",
    },
    fr: {
      "nav.inicio": "Accueil",
      "nav.proceso": "Processus",
      "nav.niveles": "Niveaux",
      "nav.asignaturas": "Matières",
      "nav.perfiles": "Profils",
      "nav.accesibilidad": "Accessibilité",
      "nav.acerca": "À propos",
      "btn.home": "Aller à l’accueil",
      "btn.narrator": "Lire cette page à voix haute",
      "btn.theme": "Basculer thème clair/sombre",
      "btn.fontPlus": "Augmenter la taille du texte",
      "btn.fontMinus": "Diminuer la taille du texte",
      "btn.lang": "Changer la langue ES/EN/FR",
      "btn.guide": "Ouvrir le guide pas à pas",
      "btn.search": "Rechercher sur cette page",
      "search.prompt": "Que voulez-vous rechercher sur cette page ?",
      "search.notFound": "Introuvable",
      "speech.unsupported": "Votre navigateur ne prend pas en charge la synthèse vocale. Essayez Chrome ou Edge.",
      "guide.title": "🧠 Guide rapide pour utiliser 📚PEVE",
      "guide.close": "Fermer le guide",
      "guide.p1": "Utilisez la barre supérieure pour activer l’accessibilité : lecteur, contraste élevé, taille du texte et traduction.",
      "guide.p2": "Dans chaque section, vous trouverez les contenus officiels, des activités et votre progression.",
      "guide.p3": "Si vous avez besoin de soutien, demandez à votre enseignant ou à l’équipe PIE.",
      "toast.lang": "Langue",
      "toast.theme": "Thème",
      "toast.contrast": "Contraste",
      "toast.on": "Activé",
      "toast.off": "Désactivé",
      "Plataforma de Exámenes de Validación de Estudios": "Plateforme d’examens de validation des études",
      "Plataforma de Exámenes Libres": "Plateforme d’examens libres",
      "🛠️ Controles:": "🛠️ Contrôles :",
      "🛠️ Controles": "🛠️ Contrôles",
      "Mostrar guía paso a paso": "Afficher le guide pas à pas",
      "⬅️ Volver": "⬅️ Retour",
      "📖 Estudiar este módulo": "📖 Étudier ce module",
      "📱 Ver en AR": "📱 Voir en AR",
      "📱 Entrar en AR": "📱 Ouvrir en AR",
      "👁️ Ver en 3D": "👁️ Voir en 3D",
      "👁️ 3D": "👁️ 3D",
      "✅ Registro CSV": "✅ Journal CSV",
      "🧪 Quiz": "🧪 Quiz",
      "🎟️ Ticket": "🎟️ Ticket",
      "Temario": "Plan de cours",
      "Temarios": "Plans de cours",
      "Objetivo de aprendizaje": "Objectif d’apprentissage",
      "Objetivos de aprendizaje": "Objectifs d’apprentissage",
      "Actividades": "Activités",
      "Recursos": "Ressources",
      "Materiales": "Matériels",
      "Simulacros": "Simulations",
      "Evaluación": "Évaluation",
      "Evaluaciones": "Évaluations",
    },
  };

  // Traducción automática limitada por coincidencia exacta (UI y textos frecuentes).
  // Si un texto no existe, se mantiene en ES (para no romper contenido curricular).
  const AUTO_TEXT = {
    en: {
      "Panel de apoderado/a": "Guardian dashboard",
      "Panel Docente": "Teacher dashboard",
      "Panel de docente": "Teacher dashboard",
      "Versión demo – vista para acompañar a tu estudiante": "Demo version – view to support your student",
      "Versión demo – vista para acompañar a tu estudiante.": "Demo version – view to support your student.",
      "Versión demo – vista para acompañar a tu estudiante": "Demo version – view to support your student",
      "Módulo de informes": "Reports module",
      "Informes": "Reports",
      "Accesibilidad": "Accessibility",
      "🧩 Accesibilidad": "🧩 Accessibility",
      "Controles de accesibilidad": "Accessibility controls",
      "Ir al inicio": "Go to home",
      "Leer el contenido de la página": "Read this page aloud",
      "Cambiar tema claro/oscuro": "Toggle light/dark theme",
      "Aumentar tamaño de letra": "Increase font size",
      "Disminuir tamaño de letra": "Decrease font size",
      "Cambiar idioma ES/EN/FR": "Switch language ES/EN/FR",
      "Buscar": "Search",
      "Buscar en esta página": "Search on this page",
      "Guía": "Guide",
      "Guía rápida": "Quick guide",
      "Cerrar": "Close",
      "Inicio": "Home",
      "Proceso": "Process",
      "Niveles": "Levels",
      "Asignaturas": "Subjects",
      "Perfiles": "Profiles",
      "Acerca de": "About",
      "Familias": "Families",
      "Docente": "Teacher",
      "Apoderado / familia": "Guardian / family",
      "Estudiante": "Student",
      "Enviar por correo": "Send by email",
      "Enviar por WhatsApp": "Send via WhatsApp",
      "Descargar PDF": "Download PDF",
      "Ver temarios": "View official topics",
      "Temarios oficiales": "Official topics",
      "Próximamente": "Coming soon",
      "Cerrar sesión": "Sign out",
      "Ingresar": "Sign in",
      "Administrador": "Administrator",
      "Correo": "Email",
      "Contraseña": "Password",
      "Volver": "Back",
      "Continuar": "Continue",
      "Aceptar": "Accept",
      "Cancelar": "Cancel",
      "Buscar estudiante": "Search student",
      "Selecciona": "Select",
      "Resultados": "Results",
    },
    fr: {
      "Panel de apoderado/a": "Tableau parent/tuteur",
      "Panel Docente": "Tableau enseignant",
      "Panel de docente": "Tableau enseignant",
      "Versión demo – vista para acompañar a tu estudiante": "Version démo – vue pour accompagner votre élève",
      "Versión demo – vista para acompañar a tu estudiante.": "Version démo – vue pour accompagner votre élève.",
      "Módulo de informes": "Module de rapports",
      "Informes": "Rapports",
      "Accesibilidad": "Accessibilité",
      "🧩 Accesibilidad": "🧩 Accessibilité",
      "Controles de accesibilidad": "Contrôles d’accessibilité",
      "Ir al inicio": "Aller à l’accueil",
      "Leer el contenido de la página": "Lire la page à voix haute",
      "Cambiar tema claro/oscuro": "Basculer thème clair/sombre",
      "Aumentar tamaño de letra": "Augmenter la taille du texte",
      "Disminuir tamaño de letra": "Diminuer la taille du texte",
      "Cambiar idioma ES/EN/FR": "Changer la langue ES/EN/FR",
      "Buscar": "Rechercher",
      "Buscar en esta página": "Rechercher sur cette page",
      "Guía": "Guide",
      "Guía rápida": "Guide rapide",
      "Cerrar": "Fermer",
      "Inicio": "Accueil",
      "Proceso": "Processus",
      "Niveles": "Niveaux",
      "Asignaturas": "Matières",
      "Perfiles": "Profils",
      "Acerca de": "À propos",
      "Familias": "Familles",
      "Docente": "Enseignant",
      "Apoderado / familia": "Parent / famille",
      "Estudiante": "Élève",
      "Enviar por correo": "Envoyer par e-mail",
      "Enviar por WhatsApp": "Envoyer via WhatsApp",
      "Descargar PDF": "Télécharger PDF",
      "Ver temarios": "Voir les contenus",
      "Temarios oficiales": "Contenus officiels",
      "Próximamente": "Bientôt",
      "Cerrar sesión": "Se déconnecter",
      "Ingresar": "Se connecter",
      "Administrador": "Administrateur",
      "Correo": "E-mail",
      "Contraseña": "Mot de passe",
      "Volver": "Retour",
      "Continuar": "Continuer",
      "Aceptar": "Accepter",
      "Cancelar": "Annuler",
      "Buscar estudiante": "Rechercher un élève",
      "Selecciona": "Sélectionner",
      "Resultados": "Résultats",
    },
  };

  function t(key) {
    const lang = getLang();
    return (I18N[lang] && I18N[lang][key]) || (I18N.es && I18N.es[key]) || key;
  }

  // =========================
  // Utilidades
  // =========================

  function toast(msg) {
    let el = doc.getElementById("peve-toast");
    if (!el) {
      el = doc.createElement("div");
      el.id = "peve-toast";
      el.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:99999;background:rgba(2,6,23,.92);color:#fff;border:1px solid rgba(255,255,255,.12);padding:.55rem .75rem;border-radius:999px;font-size:.92rem;backdrop-filter:blur(10px);max-width:min(92vw,520px);text-align:center;opacity:0;transition:opacity .18s ease;";
      doc.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(el.__t);
    el.__t = setTimeout(() => (el.style.opacity = "0"), 1400);
  }

  function norm(s) {
    return String(s || "").replace(/\s+/g, " ").trim();
  }

  // =========================
  // Toolbar: asegurar existencia + binding por data-action
  // =========================

  function ensureToolbar() {
    if (doc.querySelector(".accessibility-toolbar")) return;

    // intenta insertar en topbar si existe
    const topbar = doc.querySelector(".topbar");
    const toolbar = doc.createElement("div");
    toolbar.className = "accessibility-toolbar";
    toolbar.setAttribute("aria-label", "Controles de accesibilidad");
    toolbar.innerHTML = `
      <button class="access-btn" data-action="home" title="${t("btn.home")}" aria-label="${t("btn.home")}">🏠</button>
      <button class="access-btn" data-action="narrator" title="${t("btn.narrator")}" aria-label="${t("btn.narrator")}">🗣️</button>
      <button class="access-btn" data-action="toggle-theme" title="${t("btn.theme")}" aria-label="${t("btn.theme")}">🌓</button>
      <button class="access-btn" data-action="font-inc" title="${t("btn.fontPlus")}" aria-label="${t("btn.fontPlus")}">A+</button>
      <button class="access-btn" data-action="font-dec" title="${t("btn.fontMinus")}" aria-label="${t("btn.fontMinus")}">A−</button>
      <button class="access-btn" data-action="lang" title="${t("btn.lang")}" aria-label="${t("btn.lang")}">🌐</button>
      <button class="access-btn" data-action="guide" title="${t("btn.guide")}" aria-label="${t("btn.guide")}">🧠</button>
      <button class="access-btn" data-action="search" title="${t("btn.search")}" aria-label="${t("btn.search")}">🔍</button>
    `;
    if (topbar) topbar.appendChild(toolbar);
    else doc.body.insertBefore(toolbar, doc.body.firstChild);
  }

  function findButtonsByAction(action) {
    return Array.from(doc.querySelectorAll('.access-btn[data-action], [data-action]')).filter((b) => {
      const a = (b.getAttribute("data-action") || "").toLowerCase();
      return a === action;
    });
  }

  function actionAliases(a) {
    const x = String(a || "").toLowerCase();
    const map = {
      "toggle-theme": "toggle-theme",
      "theme": "toggle-theme",
      "contrast": "toggle-theme",

      "font-inc": "font-inc",
      "fontplus": "font-inc",
      "fs-inc": "font-inc",
      "a+": "font-inc",

      "font-dec": "font-dec",
      "fontminus": "font-dec",
      "fs-dec": "font-dec",
      "a-": "font-dec",

      "guide": "guide",
      "brain": "guide",
      "help": "guide",

      "lang": "lang",
      "language": "lang",
      "idioma": "lang",

      "search": "search",
      "lupa": "search",

      "home": "home",
      "inicio": "home",

      "narrator": "narrator",
      "leer": "narrator",
      "read": "narrator",
    };
    return map[x] || x;
  }

  function bindToolbar() {
    const btns = Array.from(doc.querySelectorAll(".access-btn[data-action], [data-action]"));
    if (!btns.length) return;
    btns.forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const raw = btn.getAttribute("data-action") || "";
        const act = actionAliases(raw);
        switch (act) {
          case "home": goHome(btn); break;
          case "narrator": toggleNarrator(); break;
          case "toggle-theme": if(ev.shiftKey){ applyContrast(!body.classList.contains("peve-contrast")); } else { toggleTheme(); } break;
          case "font-inc": changeFontScale(+0.1); break;
          case "font-dec": changeFontScale(-0.1); break;
          case "lang": cycleLang(); break;
          case "guide": openGuide(); break;
          case "search": triggerSearch(); break;
          default: break;
        }
      });
    });
  }

  // =========================
  // THEME + CONTRAST
  // =========================

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(t === "light" ? "theme-light" : "theme-dark");
    html.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch(e){}
    try { localStorage.setItem(THEME_KEY_LEGACY, t); } catch(e){}
  }

  function toggleTheme() {
    const current = body.classList.contains("theme-light") ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    toast(`${t("toast.theme")}: ${next === "light" ? (getLang()==="es"?"Claro":"Light") : (getLang()==="es"?"Oscuro":"Dark")}`);
  }

  function applyContrast(on) {
    const enabled = !!on;
    body.classList.toggle("peve-contrast", enabled);
    html.setAttribute("data-contrast", enabled ? "high" : "normal");
    try { localStorage.setItem(CONTRAST_KEY, enabled ? "1" : "0"); } catch(e){}
    toast(`${t("toast.contrast")}: ${enabled ? t("toast.on") : t("toast.off")}`);
  }

  (function initTheme() {
    let theme = "dark";
    try {
      const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem(THEME_KEY_LEGACY);
      if (stored === "light" || stored === "dark") theme = stored;
    } catch (e) {}
    applyTheme(theme);

    try {
      const c = localStorage.getItem(CONTRAST_KEY);
      applyContrast(c === "1");
    } catch(e){}
  })();

  // =========================
  // FONT SCALE
  // =========================

  let fontScale = 1;

  function applyFontScale(scale) {
    fontScale = Math.max(0.85, Math.min(1.35, scale));
    html.style.fontSize = `${fontScale * 100}%`;
    try { localStorage.setItem(FONT_KEY, String(fontScale)); } catch(e){}
  }

  function changeFontScale(delta) {
    applyFontScale(fontScale + delta);
  }

  (function initFontScale() {
    try {
      const stored = parseFloat(localStorage.getItem(FONT_KEY) || "1");
      if (stored && !isNaN(stored)) applyFontScale(stored);
      else applyFontScale(1);
    } catch (e) {
      applyFontScale(1);
    }
  })();

  // =========================
  // NARRATOR (Speech Synthesis)
  // =========================

  let speaking = false;

  function getReadableText() {
    const main = doc.querySelector("main") || body;
    const clone = main.cloneNode(true);
    clone.querySelectorAll("nav, header, footer, script, style, .accessibility-toolbar").forEach((el) => el.remove());
    return norm(clone.textContent);
  }

  function speak(text, lang) {
    if (!("speechSynthesis" in win)) {
      alert(t("speech.unsupported"));
      return;
    }
    win.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "fr" ? "fr-FR" : (lang === "en" ? "en-US" : "es-CL");
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => (speaking = false);
    win.speechSynthesis.speak(utter);
    speaking = true;
  }

  function toggleNarrator() {
    if (!("speechSynthesis" in win)) {
      alert(t("speech.unsupported"));
      return;
    }
    if (speaking) {
      win.speechSynthesis.cancel();
      speaking = false;
      return;
    }
    const lang = getLang();
    const text = getReadableText();
    if (!text) return;
    speak(text, lang);
  }

  // =========================
  // i18n apply
  // =========================

  let __autoCollected = false;
  const __textNodes = [];
  const __attrNodes = [];

  function collectAutoTranslatables() {
    if (__autoCollected) return;
    __autoCollected = true;

    // Text nodes (TreeWalker)
    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node || !node.parentElement) return NodeFilter.FILTER_REJECT;
        const tag = node.parentElement.tagName;
        // Skip nodes controlled by data-i18n (key-based translation)
        if (node.parentElement.closest("[data-i18n],[data-i18n-title],[data-i18n-placeholder],[data-i18n-aria-label],[data-i18n-alt],[data-i18n-value]")) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT","STYLE","NOSCRIPT"].includes(tag)) return NodeFilter.FILTER_REJECT;
        const v = node.nodeValue;
        if (!v || !norm(v)) return NodeFilter.FILTER_REJECT;
        // evita traducir códigos cortos tipo OA2, RUN, etc.
        const n = norm(v);
        if (n.length <= 2) return NodeFilter.FILTER_REJECT;
        if (/^(OA|RUN|ID|DIA|KPSI)\b/i.test(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (walker.nextNode()) {
      const node = walker.currentNode;
      __textNodes.push({ node, src: node.nodeValue });
    }

    // Attribute nodes
    const attrs = ["title","placeholder","aria-label","alt","value"];
    doc.querySelectorAll("*").forEach((el) => {
      attrs.forEach((a) => {
        const v = el.getAttribute(a);
        if (!v) return;
        if (el.hasAttribute("data-i18n-" + a)) return;
        __attrNodes.push({ el, attr: a, src: v });
      });
    });
  }

  function translateString(lang, src) {
    if (lang === "es") return src;
    const n = norm(src);
    const map = (AUTO_TEXT[lang] || {});
    const rep = map[n];
    if (!rep) return src;
    // conserva espacios
    const lead = (src.match(/^\s+/) || [""])[0];
    const tail = (src.match(/\s+$/) || [""])[0];
    return lead + rep + tail;
  }

  
  // =========================
  // i18n (JSON dictionaries)
  // =========================
  const __I18N_CACHE = {};

  function assetsBase() {
    // We derive the correct relative base from theme.css (present on every page)
    const link = doc.querySelector('link[href$="assets/css/theme.css"]');
    if (link) {
      const href = link.getAttribute("href") || "";
      return href.split("assets/css/theme.css")[0] + "assets/";
    }
    // Fallback: derive from script src
    const s = doc.querySelector('script[src$="assets/js/accessibility.js"]') || doc.querySelector('script[src$="assets/js/accesibilidad.js"]');
    if (s) {
      const src = s.getAttribute("src") || "";
      return src.split("assets/js/")[0] + "assets/";
    }
    return "assets/";
  }

  function pageId() {
    let path = (location.pathname || "").replace(/\\/g, "/");
    if (!path || path.endsWith("/")) path += "index.html";

    // Heuristic: strip any leading hosting prefix (repo name, folder name)
    const markers = ["/app/","/content/","/sites/","/index.html","/offline.html"];
    let cut = -1;
    markers.forEach((m) => {
      const i = path.indexOf(m);
      if (i !== -1 && (cut === -1 || i < cut)) cut = i;
    });
    if (cut > 0) path = path.slice(cut + 1); // remove leading "/"
    else path = path.replace(/^\/+/, "");

    if (path.toLowerCase().endsWith(".html")) path = path.slice(0, -5);
    return path.replace(/\//g, "__") || "index";
  }

  async function fetchJson(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return {};
      return await res.json();
    } catch (e) {
      return {};
    }
  }

  async function loadLangMap(lang) {
    const pid = pageId();
    const cacheKey = lang + "|" + pid;
    if (__I18N_CACHE[cacheKey]) return __I18N_CACHE[cacheKey];

    const base = assetsBase();
    const i18nBase = base + "i18n/";

    const langCommon = await fetchJson(i18nBase + lang + "/common.json");
    const langPage = await fetchJson(i18nBase + lang + "/pages/" + pid + ".json");

    let esCommon = {}, esPage = {};
    if (lang !== "es") {
      esCommon = await fetchJson(i18nBase + "es/common.json");
      esPage = await fetchJson(i18nBase + "es/pages/" + pid + ".json");
    }

    // Merge order: ES fallback -> selected language -> built-in (toolbar UX)
    const merged = Object.assign({}, esCommon, esPage, langCommon, langPage, (I18N[lang] || {}));
    __I18N_CACHE[cacheKey] = merged;
    return merged;
  }

  function applyI18nMap(map) {
    // Text content
    doc.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && map[key] !== undefined) el.textContent = map[key];
    });

    // Attributes
    const attrs = ["title","placeholder","aria-label","alt","value"];
    attrs.forEach((a) => {
      doc.querySelectorAll("[data-i18n-" + a + "]").forEach((el) => {
        const key = el.getAttribute("data-i18n-" + a);
        if (key && map[key] !== undefined) el.setAttribute(a, map[key]);
      });
    });
  }

  function applyLang(lang) {
    html.setAttribute("lang", lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch(e){}

    // Update tooltips/aria of the accessibility toolbar (built-in keys)
    doc.querySelectorAll('.access-btn[data-action="home"]').forEach((b)=>{ b.title=t("btn.home"); b.setAttribute("aria-label",t("btn.home")); });
    doc.querySelectorAll('.access-btn[data-action="narrator"]').forEach((b)=>{ b.title=t("btn.narrator"); b.setAttribute("aria-label",t("btn.narrator")); });
    doc.querySelectorAll('.access-btn[data-action="toggle-theme"]').forEach((b)=>{ b.title=t("btn.theme"); b.setAttribute("aria-label",t("btn.theme")); });
    doc.querySelectorAll('.access-btn[data-action="font-inc"]').forEach((b)=>{ b.title=t("btn.fontPlus"); b.setAttribute("aria-label",t("btn.fontPlus")); });
    doc.querySelectorAll('.access-btn[data-action="font-dec"]').forEach((b)=>{ b.title=t("btn.fontMinus"); b.setAttribute("aria-label",t("btn.fontMinus")); });
    doc.querySelectorAll('.access-btn[data-action="lang"]').forEach((b)=>{ b.title=t("btn.lang"); b.setAttribute("aria-label",t("btn.lang")); });
    doc.querySelectorAll('.access-btn[data-action="guide"]').forEach((b)=>{ b.title=t("btn.guide"); b.setAttribute("aria-label",t("btn.guide")); });
    doc.querySelectorAll('.access-btn[data-action="search"]').forEach((b)=>{ b.title=t("btn.search"); b.setAttribute("aria-label",t("btn.search")); });

    // Load JSON dictionaries for this page and apply key-based translations
    loadLangMap(lang).then((map) => {
      applyI18nMap(map);

      // Fallback: translate any residual nodes not under data-i18n control
      collectAutoTranslatables();
      __textNodes.forEach((r) => { r.node.nodeValue = translateString(lang, r.src); });
      __attrNodes.forEach((r) => { r.el.setAttribute(r.attr, translateString(lang, r.src)); });

      toast(`${t("toast.lang")}: ${lang.toUpperCase()}`);
    });
  }

  function getLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored && LANGS.includes(stored)) return stored;
    } catch (e) {}
    return "es";
  }

  function cycleLang() {
    const current = getLang();
    const idx = LANGS.indexOf(current);
    const next = LANGS[(idx + 1) % LANGS.length];
    applyLang(next);
  }

  // =========================
  // Home navigation
  // =========================

  function goHome(btn) {
    // 1) data-home explícito
    const explicit = btn && btn.getAttribute && btn.getAttribute("data-home");
    if (explicit) {
      win.location.href = explicit;
      return;
    }
    // 2) intenta encontrar link a index en nav
    const navIndex = doc.querySelector('a[href$="index.html"], a[href$="/index.html"]');
    if (navIndex && navIndex.getAttribute("href")) {
      win.location.href = navIndex.getAttribute("href");
      return;
    }
    // 3) heurística por profundidad
    const path = win.location.pathname || "";
    const depth = path.split("/").filter(Boolean).length;
    const prefix = depth <= 1 ? "" : "../".repeat(depth - 1);
    win.location.href = prefix + "index.html";
  }

  // =========================
  // Guide modal
  // =========================

  function ensureGuideModal() {
    if (doc.getElementById("peve-guide-overlay")) return;

    const overlay = doc.createElement("div");
    overlay.id = "peve-guide-overlay";
    overlay.className = "peve-guide-backdrop";
    overlay.innerHTML = `
      <div class="peve-guide-modal">
        <button class="peve-guide-close" aria-label="${t("guide.close")}">✕</button>
        <h2>${t("guide.title")}</h2>
        <p>${t("guide.p1")}</p>
        <p>${t("guide.p2")}</p>
        <p>${t("guide.p3")}</p>
        <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1rem;">
          <button class="btn btn-ghost peve-guide-ok">${t("guide.close")}</button>
        </div>
      </div>
    `;

    doc.body.appendChild(overlay);
    overlay.querySelector(".peve-guide-close").addEventListener("click", () => overlay.remove());
    overlay.querySelector(".peve-guide-ok").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  }

  function openGuide() {
    ensureGuideModal();
  }

  // =========================
  // Search
  // =========================

  function triggerSearch() {
    const term = win.prompt(t("search.prompt"));
    if (!term) return;
    const lowerTerm = term.toLowerCase();

    const nodes = Array.from(doc.querySelectorAll("main, .container, body *"));
    let targetNode = null;
    for (const node of nodes) {
      if (!node || !node.textContent) continue;
      const txt = node.textContent.toLowerCase();
      if (txt.includes(lowerTerm)) { targetNode = node; break; }
    }

    if (!targetNode) {
      win.alert(`${t("search.notFound")} "${term}"`);
      return;
    }

    targetNode.scrollIntoView({ behavior: "smooth", block: "center" });
    targetNode.classList.add("peve-search-highlight");
    setTimeout(() => targetNode.classList.remove("peve-search-highlight"), 2200);
  }

  // =========================
  // Bootstrap
  // =========================

  doc.addEventListener("DOMContentLoaded", () => {
    ensureToolbar();
    bindToolbar();
    
  // Auto-apply translation to dynamically inserted content (e.g., templates, injected blocks)
  (function observeDomForI18n(){
    try{
      const mo = new MutationObserver((mutations)=>{
        let touched = false;
        for(const m of mutations){
          if(m.addedNodes && m.addedNodes.length){ touched = true; break; }
        }
        if(!touched) return;
        __autoCollected = false;
        __textNodes.length = 0;
        __attrNodes.length = 0;
        collectAutoTranslatables();
        const lang = getLang();
        __textNodes.forEach((r) => { r.node.nodeValue = translateString(lang, r.src); });
        __attrNodes.forEach((r) => { r.el.setAttribute(r.attr, translateString(lang, r.src)); });
      });
      mo.observe(body, { childList:true, subtree:true });
    }catch(e){}
  })();

  applyLang(getLang());

  });
})();
