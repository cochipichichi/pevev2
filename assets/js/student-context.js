// assets/js/student-context.js
// Contexto común para vistas de estudiante PEVE
// Lee sessionStorage y actualiza el saludo, nivel, llamado y barras de progreso.

(function () {
  function setText(id, value) {
    if (!value) return;
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function applyProgress(barIdList, textIdList, progress) {
    if (!progress) return;
    var pct = progress + "%";

    (barIdList || []).forEach(function (id) {
      var bar = document.getElementById(id);
      if (bar) bar.style.width = pct;
    });

    (textIdList || []).forEach(function (id) {
      var txt = document.getElementById(id);
      if (txt) txt.textContent = pct;
    });
  }

  function initStudentContext() {
    // Valores guardados en auth-demo.js al hacer login correcto
    var name     = sessionStorage.getItem("studentName");
    var level    = sessionStorage.getItem("studentLevel");
    var call     = sessionStorage.getItem("studentCall");
    var progress = sessionStorage.getItem("studentProgress"); // opcional

    // Saludo principal
    if (name) {
      setText("student-name", name);
    }

    // Nivel
    if (level) {
      setText("student-level", level);
      setText("student-level-label", level);       // Mis asignaturas
      setText("progress-level-label", level);      // Mi progreso
    }

    // Llamado
    if (call) {
      setText("student-call", call);               // Dashboard / encabezados
      setText("progress-call-label", call);        // Mi progreso
    }

    // Progreso global (si en algún momento lo seteas)
    if (progress) {
      applyProgress(
        ["student-progress-bar", "progress-global-bar"],
        ["student-progress-text", "progress-global-text"],
        progress
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStudentContext);
  } else {
    initStudentContext();
  }
})();
