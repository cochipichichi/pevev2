(function () {
  const body = document.body;
  const html = document.documentElement;

  const themeBtn = document.getElementById("btn-theme");
  const fontIncBtn = document.getElementById("btn-font-inc");
  const fontDecBtn = document.getElementById("btn-font-dec");
  const narratorBtn = document.getElementById("btn-narrator");
  const mainContent = document.getElementById("main-content");

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

  // NARRATOR
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

  // Init
  applyStoredTheme();
  applyFontSize(getCurrentFontSize());

  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
  if (fontIncBtn) fontIncBtn.addEventListener("click", increaseFont);
  if (fontDecBtn) fontDecBtn.addEventListener("click", decreaseFont);
  if (narratorBtn) narratorBtn.addEventListener("click", toggleNarrator);
})();
