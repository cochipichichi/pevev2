// assets/js/guardian-context.js
// Contexto de sesión para el perfil Apoderado/a en PEVE

(function () {
  function read(key, fallback) {
    try {
      const v = sessionStorage.getItem(key);
      return v == null || v === "" ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function applyText(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) {
      el.textContent = value;
    }
  }

  function initGuardianContext() {
    // Si no hay sesión de apoderado, no hacemos nada (permite modo demo).
    const logged = read("guardianLogged", "0");
    if (logged !== "1") {
      return;
    }

    const gName = read("guardianName", "Apoderado/a");
    const gEmail = read("guardianEmail", "");
    const gPhone = read("guardianPhone", "");

    const sName = read("guardianStudentName", "Estudiante");
    const sLevel = read("guardianStudentLevel", "—");
    const sCall = read("guardianStudentCall", "—");
    const sRun = read("guardianStudentRun", "—");
    const sId = read("guardianStudentId", "—");

    // Panel apoderado (dashboard_apoderado.html)
    applyText("guardian-name", gName);
    applyText("guardian-student-name", sName);
    applyText("guardian-student-level", sLevel);

    // Versiones inline en informes_apoderado.html
    applyText("guardian-name-inline", gName);
    applyText("guardian-student-name-inline", sName);
    applyText("guardian-student-name-hero", sName);
    applyText("guardian-student-level-hero", sLevel);
    applyText("guardian-student-call-hero", sCall);

    // Auto-llenar RUN / ID si están vacíos
    const runInput = document.getElementById("g-run");
    if (runInput && !runInput.value) {
      runInput.value = sRun;
    }
    const idInput = document.getElementById("g-idpeve");
    if (idInput && !idInput.value) {
      idInput.value = sId;
    }

    // Mostrar algún resumen en consola para debug
    console.log("[PEVE][guardian-context] Sesión apoderado:", {
      gName,
      gEmail,
      gPhone,
      sName,
      sLevel,
      sCall,
      sRun,
      sId,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGuardianContext);
  } else {
    initGuardianContext();
  }
})();