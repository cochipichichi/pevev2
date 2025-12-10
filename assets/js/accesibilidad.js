(function () {
  const body = document.body;
  const html = document.documentElement;

  // 1) Soporta dos patrones:
  //    a) IDs:    #btn-theme, #btn-font-inc, #btn-font-dec, #btn-narrator
  //    b) data-*: [data-action="toggle-theme"|"font-inc"|"font-dec"|"narrator"]
  const themeBtn =
    document.getElementById("btn-theme") ||
    document.querySelector('[data-action="toggle-theme"]');

  const fontIncBtn =
    document.getElementById("btn-font-inc") ||
    document.querySelector('[data-action="font-inc"]');

  const fontDecBtn =
    document.getElementById("btn-font-dec") ||
    document.querySelector('[data-action="font-dec"]');

  const narratorBtn =
    document.getElementById("btn-narrator") ||
    document.querySelector('[data-action="narrator"]');

  // Área a leer por el narrador:
  // 1º busca #main-content; si no existe, usa el primer <main>.
  const mainContent =
    document.getElementById("main-content") ||
    document.querySelector("main");

  // THEME
  function applyStoredTheme() {
    const stored = localStorage.getItem("peve-theme");
    if (stored === "light") {
      body.classList.remove("theme-dark");
      body.classList.add("theme-light");
    } else {
      body.classList.remove("theme-light");
      body.classList.add("theme-dark");
    }
  }

  function toggleTheme() {
    const isDark = body.classList.contains("theme-dark");
    if (isDark) {
      body.classList.remove("theme-dark");
      body.classList.add("theme-light");
      localStorage.setItem("peve-theme", "light");
    } else {
      body.classList.remove("theme-light");
      body.classList.add("theme-dark");
      localStorage.setItem("peve-theme", "dark");
    }
  }

  // FONT SIZE
  function getCurrentFontSize() {
    const size = parseFloat(localStorage.getItem("peve-font-size") || "16");
    return isNaN(size) ? 16 : size;
  }

  function applyFontSize(size) {
    const clamped = Math.min(20, Math.max(14, size));
    html.style.fontSize = clamped + "px";
    localStorage.setItem("peve-font-size", String(clamped));
  }

  function increaseFont() {
    applyFontSize(getCurrentFontSize() + 1);
  }

  function decreaseFont() {
    applyFontSize(getCurrentFontSize() - 1);
  }

  // NARRADOR
  let isReading = false;

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      alert("Tu navegador no soporta el narrador de voz. Puedes activar un lector de pantalla externo.");
      return;
    }
    window.speechSynthesis.cancel();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    utter.rate = 1;
    utter.onend = () => {
      isReading = false;
      if (narratorBtn) narratorBtn.classList.remove("access-btn-active");
    };
    isReading = true;
    if (narratorBtn) narratorBtn.classList.add("access-btn-active");
    window.speechSynthesis.speak(utter);
  }

  function toggleNarrator() {
    if (!mainContent) return;
    if (isReading) {
      window.speechSynthesis.cancel();
      isReading = false;
      narratorBtn && narratorBtn.classList.remove("access-btn-active");
    } else {
      const text = mainContent.textContent || "";
      speak(text.trim());
    }
  }

  // INIT
  applyStoredTheme();
  applyFontSize(getCurrentFontSize());

  if (themeBtn)   themeBtn.addEventListener("click", toggleTheme);
  if (fontIncBtn) fontIncBtn.addEventListener("click", increaseFont);
  if (fontDecBtn) fontDecBtn.addEventListener("click", decreaseFont);
  if (narratorBtn) narratorBtn.addEventListener("click", toggleNarrator);
})();
