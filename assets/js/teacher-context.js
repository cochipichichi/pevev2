// assets/js/teacher-context.js
// Contexto de sesión para el perfil Docente en PEVE

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

  function initTeacherContext() {
    const logged = read("teacherLogged", "0");
    if (logged !== "1") {
      // Modo demo: no forzamos nada, dejamos textos por defecto.
      return;
    }

    const name = read("teacherName", "Docente");
    const email = read("teacherEmail", "");
    const school = read("teacherSchool", "");
    let subjects = [];
    let levels = [];

    try {
      const sRaw = read("teacherSubjects", "[]");
      const lRaw = read("teacherLevels", "[]");
      subjects = JSON.parse(sRaw);
      levels = JSON.parse(lRaw);
    } catch (e) {
      console.warn("[PEVE][teacher-context] No se pudo parsear subjects/levels:", e);
    }

    const subjectsLabel = subjects && subjects.length ? subjects.join(", ") : "Asignaturas PEVE";
    const levelsLabel = levels && levels.length ? levels.join(" · ") : "Niveles PEVE";

    // Panel docente (dashboard_docente.html)
    applyText("teacher-name", name);
    applyText("teacher-subjects", subjectsLabel);
    applyText("teacher-levels", levelsLabel);
    applyText("teacher-school", school || "Liceo / establecimiento");

    // Versiones inline (por si se usan en otras vistas)
    applyText("teacher-name-inline", name);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTeacherContext);
  } else {
    initTeacherContext();
  }
})();