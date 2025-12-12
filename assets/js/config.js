// assets/js/config.js
// Config runtime para endpoints (Google Apps Script) y settings globales.
// - Lee data/config.json (si existe) como base
// - Permite override vía localStorage (peve-script-url)

(function () {
  const STORAGE_KEY = "peve-script-url";
  const CACHE = { loaded: false, cfg: {} };

  function scriptBaseUrl() {
    const me = document.querySelector('script[src*="assets/js/config.js"]');
    if (!me) return "";
    const src = me.getAttribute("src") || "";
    try {
      const u = new URL(src, window.location.href);
      return u.href.split("/assets/js/config.js")[0];
    } catch (e) {
      return "";
    }
  }

  function clean(url) {
    if (!url) return "";
    let u = String(url).trim();
    u = u.replace(/^["']|["']$/g, "");
    return u;
  }

  async function loadConfig() {
    if (CACHE.loaded) return CACHE.cfg;
    CACHE.loaded = true;

    const base = scriptBaseUrl();
    if (!base) return (CACHE.cfg = {});

    const url = base + "/data/config.json";
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("config.json no disponible");
      const data = await res.json();
      if (data && typeof data.scriptUrl === "string" && data.scriptUrl.includes("...")) {
        delete data.scriptUrl;
      }
      CACHE.cfg = data || {};
      return CACHE.cfg;
    } catch (e) {
      CACHE.cfg = {};
      return CACHE.cfg;
    }
  }

  function getScriptUrlSync() {
    const ls = clean(localStorage.getItem(STORAGE_KEY));
    if (ls) return ls;
    const cfg = CACHE.cfg || {};
    return clean(cfg.scriptUrl || "");
  }

  async function getScriptUrl() {
    await loadConfig();
    return getScriptUrlSync();
  }

  function setScriptUrl(url) {
    const u = clean(url);
    if (u) localStorage.setItem(STORAGE_KEY, u);
    else localStorage.removeItem(STORAGE_KEY);
    return u;
  }

  function getTimezoneSync() {
    const cfg = CACHE.cfg || {};
    return cfg.timezone || "America/Santiago";
  }

  async function getTimezone() {
    await loadConfig();
    return getTimezoneSync();
  }

  window.PEVE_CONFIG = {
    loadConfig,
    getScriptUrl,
    getScriptUrlSync,
    setScriptUrl,
    getTimezone,
    getTimezoneSync,
    STORAGE_KEY
  };
})();
