// accessibility.js (PEVE unified) v4.0
// Global accessibility controls for PEVE:
// 🏠 home · 🗣️ narrator · 🌓 theme · A+/A− font · 🌐 language · 🧠 guide · 🔍 search
//
// Notes:
// - Theme is controlled via: html[data-theme="light|dark"] and html[data-contrast="normal|high"]
// - i18n is controlled via data-i18n attributes + JSON dictionaries.
// - For missing translations (EN/FR), we auto-translate from ES as a fallback (approximation).

(function () {
  if (window.__PEVE_A11Y_LOADED__) return;
  window.__PEVE_A11Y_LOADED__ = true;

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;

  // -------------------------
  // Storage keys
  // -------------------------
  const THEME_KEY = "peve.theme";        // light | dark
  const CONTRAST_KEY = "peve.contrast";  // normal | high
  const FONT_KEY = "peve.fontScale";     // number, e.g. 1.0
  const LANG_KEY = "peve.lang";          // es | en | fr

  const LANGS = ["es", "en", "fr"];

  // -------------------------
  // Small utilities
  // -------------------------
  function safeGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }

  function isHighContrast() { return (safeGet(CONTRAST_KEY) || "normal") === "high"; }
  function getTheme() { return safeGet(THEME_KEY) || safeGet("peve-theme") || "dark"; } // compat
  function getLang() { return safeGet(LANG_KEY) || "es"; }
  function getFontScale() {
    const raw = safeGet(FONT_KEY);
    const n = raw ? Number(raw) : 1;
    return (Number.isFinite(n) && n > 0.6 && n < 1.8) ? n : 1;
  }

  function setTheme(theme) {
    const t = (theme === "light") ? "light" : "dark";
    html.setAttribute("data-theme", t);
    // compat with legacy CSS selectors (some pages still use body.theme-*)
    body.classList.toggle("theme-light", t === "light");
    body.classList.toggle("theme-dark", t !== "light");
    safeSet(THEME_KEY, t);
    safeSet("peve-theme", t);
  }

  function setContrast(mode) {
    const m = (mode === "high") ? "high" : "normal";
    html.setAttribute("data-contrast", m);
    safeSet(CONTRAST_KEY, m);
  }

  function setFontScale(scale) {
    const s = Math.max(0.8, Math.min(1.4, scale));
    html.style.setProperty("--peve-font-scale", String(s));
    safeSet(FONT_KEY, String(s));
  }

  // -------------------------
  // Toast
  // -------------------------
  function toast(msg) {
    let el = doc.getElementById("peve-toast");
    if (!el) {
      el = doc.createElement("div");
      el.id = "peve-toast";
      el.className = "peve-toast";
      doc.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el.__t);
    el.__t = setTimeout(() => el.classList.remove("show"), 1700);
  }

  // -------------------------
  // Page id + assets base
  // -------------------------
  function assetsBase() {
    // derive from theme.css (expected in every page)
    const link = doc.querySelector('link[href$="assets/css/theme.css"]');
    if (link) {
      const href = link.getAttribute("href") || "";
      return href.split("assets/css/theme.css")[0] + "assets/";
    }
    // derive from script
    const s = doc.querySelector('script[src$="assets/js/accessibility.js"],script[src$="assets/js/accesibilidad.js"]');
    if (s) {
      const src = s.getAttribute("src") || "";
      return src.split("assets/js/")[0] + "assets/";
    }
    return "assets/";
  }

  function pageId() {
    let path = (location.pathname || "").replace(/\\/g, "/");
    if (!path || path.endsWith("/")) path += "index.html";

    // strip leading prefixes (repo/folder) using markers
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

  // -------------------------
  // i18n dictionaries
  // -------------------------
  const __I18N_CACHE = {};

  async function fetchJson(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return {};
      return await res.json();
    } catch (e) {
      return {};
    }
  }

  // Approximate ES -> EN/FR auto translation.
  // This is NOT a professional translation engine; it is meant as a fallback
  // so new ES content still changes language until you provide curated JSON.
  function autoTranslate(lang, es) {
    if (!es || typeof es !== "string") return es;
    if (lang === "es") return es;

    // basic phrase dictionary (extendable)
    const dict = (lang === "en") ? {
      "Volver": "Back",
      "Inicio": "Home",
      "Asignaturas": "Subjects",
      "Niveles": "Levels",
      "Perfiles": "Profiles",
      "Accesibilidad": "Accessibility",
      "Acerca de": "About",
      "Conceptos clave": "Key concepts",
      "Conexión con el examen": "Exam connection",
      "Práctica": "Practice",
      "Ticket de salida": "Exit ticket",
      "Quiz": "Quiz",
      "Banco PEVE": "PEVE bank",
      "Ciencias Naturales": "Natural Sciences",
      "Lengua y Literatura": "Language & Literature",
      "Matemática": "Mathematics",
      "Biología": "Biology",
      "Física": "Physics",
      "Química": "Chemistry",
      "Educación Inmersiva": "Immersive Education",
      "Plataforma de Exámenes de Validación de Estudios": "Study Validation Exam Platform",
      "Plataforma de Exámenes Libres y Validación de Estudios": "Free Exams & Study Validation Platform",
      "Hecho con": "Made with",
      "y enfoque inclusivo": "with an inclusive approach",
      "Próximamente": "Coming soon",
      "Objetivo": "Objective",
      "Objetivos": "Objectives",
      "Recomendaciones": "Recommendations",
      "Ejemplo": "Example",
      "Ejemplos": "Examples"
    } : {
      "Volver": "Retour",
      "Inicio": "Accueil",
      "Asignaturas": "Matières",
      "Niveles": "Niveaux",
      "Perfiles": "Profils",
      "Accesibilidad": "Accessibilité",
      "Acerca de": "À propos",
      "Conceptos clave": "Concepts clés",
      "Conexión con el examen": "Lien avec l'examen",
      "Práctica": "Entraînement",
      "Ticket de salida": "Ticket de sortie",
      "Quiz": "Quiz",
      "Banco PEVE": "Banque PEVE",
      "Ciencias Naturales": "Sciences naturelles",
      "Lengua y Literatura": "Langue et littérature",
      "Matemática": "Mathématiques",
      "Biología": "Biologie",
      "Física": "Physique",
      "Química": "Chimie",
      "Educación Inmersiva": "Éducation immersive",
      "Plataforma de Exámenes de Validación de Estudios": "Plateforme d'examens de validation des études",
      "Plataforma de Exámenes Libres y Validación de Estudios": "Plateforme d'examens libres et de validation des études",
      "Hecho con": "Réalisé avec",
      "y enfoque inclusivo": "avec une approche inclusive",
      "Próximamente": "Bientôt disponible",
      "Objetivo": "Objectif",
      "Objetivos": "Objectifs",
      "Recomendaciones": "Recommandations",
      "Ejemplo": "Exemple",
      "Ejemplos": "Exemples"
    };

    // Replace dictionary keys (longer first)
    let out = es;
    const keys = Object.keys(dict).sort((a,b) => b.length - a.length);
    keys.forEach((k) => {
      out = out.split(k).join(dict[k]);
    });

    // Very light grammar tweaks
    if (lang === "en") {
      out = out.replace(/\b7° básico\b/gi, "7th grade");
      out = out.replace(/\b8° básico\b/gi, "8th grade");
      out = out.replace(/\b1° medio\b/gi, "10th grade");
      out = out.replace(/\b2° medio\b/gi, "11th grade");
      out = out.replace(/\b3° medio\b/gi, "12th grade");
      out = out.replace(/\b4° medio\b/gi, "12th grade (senior)");
    } else if (lang === "fr") {
      out = out.replace(/\b7° básico\b/gi, "7e année");
      out = out.replace(/\b8° básico\b/gi, "8e année");
      out = out.replace(/\b1° medio\b/gi, "1re année du lycée");
      out = out.replace(/\b2° medio\b/gi, "2e année du lycée");
      out = out.replace(/\b3° medio\b/gi, "3e année du lycée");
      out = out.replace(/\b4° medio\b/gi, "4e année du lycée");
    }

    return out;
  }

  async function loadLangMap(lang) {
    const pid = pageId();
    const cacheKey = lang + "|" + pid;
    if (__I18N_CACHE[cacheKey]) return __I18N_CACHE[cacheKey];

    const base = assetsBase();
    const i18nBase = base + "i18n/";

    const langCommon = await fetchJson(i18nBase + lang + "/common.json");
    const langPage = await fetchJson(i18nBase + lang + "/pages/" + pid + ".json");

    // ES fallback
    const esCommon = (lang !== "es") ? await fetchJson(i18nBase + "es/common.json") : {};
    const esPage = (lang !== "es") ? await fetchJson(i18nBase + "es/pages/" + pid + ".json") : {};

    const esMerged = Object.assign({}, esCommon || {}, esPage || {});
    const langMerged = Object.assign({}, langCommon || {}, langPage || {});

    // Fill missing keys by auto-translating ES
    if (lang !== "es") {
      Object.keys(esMerged).forEach((k) => {
        if (langMerged[k] === undefined) {
          langMerged[k] = autoTranslate(lang, esMerged[k]);
        }
      });
    }

    __I18N_CACHE[cacheKey] = langMerged;
    return langMerged;
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
    const l = LANGS.includes(lang) ? lang : "es";
    html.setAttribute("lang", l);
    safeSet(LANG_KEY, l);

    loadLangMap(l).then((map) => {
      applyI18nMap(map);
      toast("Idioma: " + l.toUpperCase());
    });
  }

  function cycleLang() {
    const current = getLang();
    const idx = LANGS.indexOf(current);
    const next = LANGS[(idx + 1) % LANGS.length];
    applyLang(next);
  }

  // -------------------------
  // Narrator
  // -------------------------
  let speaking = false;

  function pageReadableText() {
    // Collect visible text from main sections
    const candidates = doc.querySelectorAll("main, .main, .container, article, section");
    let text = "";
    if (candidates.length) {
      candidates.forEach((el) => { text += " " + (el.innerText || ""); });
    } else {
      text = doc.body ? (doc.body.innerText || "") : "";
    }
    return text.replace(/\s{2,}/g, " ").trim();
  }

  function stopNarrator() {
    try { window.speechSynthesis.cancel(); } catch(e) {}
    speaking = false;
  }

  function startNarrator() {
    const text = pageReadableText();
    if (!text) { toast("Sin contenido para leer."); return; }
    stopNarrator();
    const u = new SpeechSynthesisUtterance(text);
    const lang = getLang();
    u.lang = (lang === "fr") ? "fr-FR" : (lang === "en") ? "en-US" : "es-CL";
    u.onend = () => { speaking = false; };
    speaking = true;
    try { window.speechSynthesis.speak(u); } catch(e) { speaking = false; }
  }

  function toggleNarrator() {
    if (speaking) { stopNarrator(); toast("Narrador: OFF"); }
    else { startNarrator(); toast("Narrador: ON"); }
  }

  // -------------------------
  // Home navigation
  // -------------------------
  function goHome(btn) {
    // 1) data-home explicit
    const explicit = btn && btn.getAttribute && btn.getAttribute("data-home");
    if (explicit) { window.location.href = explicit; return; }

    // 2) ascend folders until we find index.html (best-effort)
    const href = window.location.href;
    const parts = href.split("/");
    for (let i = parts.length - 1; i >= 3; i--) {
      const attempt = parts.slice(0, i).join("/") + "/index.html";
      // quick navigate (no fetch) - acceptable in static context
      window.location.href = attempt;
      return;
    }
    window.location.href = "index.html";
  }

  // -------------------------
  // Toolbar wiring
  // -------------------------
  function wireToolbar() {
    doc.querySelectorAll(".access-btn").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const action = btn.getAttribute("data-action");
        if (action === "home") goHome(btn);
        else if (action === "narrator") toggleNarrator();
        else if (action === "toggle-theme") {
          // Shift-click toggles contrast
          if (ev.shiftKey) {
            setContrast(isHighContrast() ? "normal" : "high");
            toast("Contraste: " + (isHighContrast() ? "ALTO" : "NORMAL"));
          } else {
            setTheme(getTheme() === "dark" ? "light" : "dark");
            toast("Tema: " + (getTheme() === "dark" ? "OSCURO" : "CLARO"));
          }
        }
        else if (action === "font-inc") { setFontScale(getFontScale() + 0.05); toast("Texto +"); }
        else if (action === "font-dec") { setFontScale(getFontScale() - 0.05); toast("Texto −"); }
        else if (action === "lang") cycleLang();
        else if (action === "guide") {
          const modal = doc.getElementById("peve-guide-overlay");
          if (modal) modal.classList.toggle("open");
        }
        else if (action === "search") {
          const q = prompt("Buscar en la página:");
          if (!q) return;
          const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          const el = Array.from(doc.querySelectorAll("main, article, section, p, li, h1, h2, h3, h4")).find(e => rx.test(e.innerText || ""));
          if (el) { el.scrollIntoView({ behavior:"smooth", block:"center" }); toast("Encontrado"); }
          else toast("Sin resultados");
        }
      });
    });
  }

  // -------------------------
  // Init
  // -------------------------
  function init() {
    setTheme(getTheme());
    setContrast(safeGet(CONTRAST_KEY) || "normal");
    setFontScale(getFontScale());
    applyLang(getLang());
    wireToolbar();

    // Re-apply i18n on dynamic content changes (best effort)
    try {
      const mo = new MutationObserver(() => {
        loadLangMap(getLang()).then(applyI18nMap);
      });
      mo.observe(body, { childList: true, subtree: true });
    } catch(e) {}
  }

  // Wait for DOM
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();

})();
