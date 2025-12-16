// assets/js/guardian-summary.js
// Usa PEVE_BACKEND.getGuardianSummary para mostrar un resumen simple
// de práctica del estudiante asociado al apoderado (perfil Guardian).

(function () {
  async function loadSummary() {
    const card = document.getElementById("guardian-summary-card");
    const table = document.getElementById("guardian-summary-table");
    const tbody = document.getElementById("guardian-summary-tbody");
    const intro = document.getElementById("guardian-summary-intro");
    const empty = document.getElementById("guardian-summary-empty");

    if (!card || !table || !tbody || !intro || !empty) {
      return;
    }

    intro.textContent = "Cargando información de práctica desde Google Sheets…";

    if (!window.PEVE_BACKEND || !window.PEVE_BACKEND.getGuardianSummary) {
      intro.textContent = "Resumen no disponible (backend no configurado).";
      return;
    }

    try {
      // Por ahora confiamos en el contexto de sesión (guardianStudentName / guardianStudentId)
      const studentId = sessionStorage.getItem("guardianStudentId") || "";
      const studentName = sessionStorage.getItem("guardianStudentName") || "";

      const res = await window.PEVE_BACKEND.getGuardianSummary({
        userId: studentId,
        userName: studentName
      });

      if (!res || res.status !== "ok") {
        intro.textContent = "No fue posible consultar el resumen de práctica.";
        console.warn("[PEVE] guardian_summary error:", res);
        return;
      }

      const rows = Array.isArray(res.rows) ? res.rows : [];
      if (!rows.length) {
        intro.textContent = "";
        empty.hidden = false;
        table.hidden = true;
        return;
      }

      tbody.innerHTML = "";
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        const course = r.course || "";
        const module = r.module || "General";
        const attempts = r.attempts || 0;
        const lastScore = r.lastScore != null ? r.lastScore : "";
        const bestScore = r.bestScore != null ? r.bestScore : "";

        tr.innerHTML = `
          <td>${course}</td>
          <td>${module}</td>
          <td>${attempts}</td>
          <td>${lastScore}%</td>
          <td>${bestScore}%</td>
        `;
        tbody.appendChild(tr);
      });

      intro.textContent = "Resumen de intentos de práctica registrados en PEVE (vista demo).";
      empty.hidden = true;
      table.hidden = false;
    } catch (err) {
      intro.textContent = "Error al cargar el resumen de práctica.";
      console.error("[PEVE] Error en guardian-summary.js:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSummary);
  } else {
    loadSummary();
  }
})();
