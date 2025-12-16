// assets/js/docente-grupos-analytics.js
// Consulta un endpoint Apps Script / Google Sheets para obtener:
// - cantidad de estudiantes
// - última fecha de informe
// por cada grupo activo (curso + asignatura + llamado).

(function () {
  // CONFIGURACIÓN: Reemplaza esta URL por tu Web App de Apps Script
  const ANALYTICS_ENDPOINT = "https://script.google.com/macros/s/TU_WEBAPP_ID/exec";

  async function fetchGroupStats(payload) {
    const params = new URLSearchParams();
    params.set("mode", "groupStats");
    params.set("curso", payload.curso);
    params.set("asignatura", payload.asig);
    params.set("llamado", payload.llamado);
    params.set("courseId", payload.courseId);

    const url = ANALYTICS_ENDPOINT + "?" + params.toString();

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      return data;
    } catch (e) {
      console.warn("[PEVE][docente-grupos-analytics] Error al consultar stats:", e);
      return null;
    }
  }

  async function updateAllGroups() {
    const cards = document.querySelectorAll("#groups-grid .card[data-course-id]");
    if (!cards.length) return;

    for (const card of cards) {
      const courseId = card.getAttribute("data-course-id");
      const curso = card.getAttribute("data-curso");
      const asig = card.getAttribute("data-asig");
      const llamado = card.getAttribute("data-llamado");

      const line = card.querySelector("[data-analytics-line]");
      if (line) {
        line.textContent = "Consultando datos de Google Sheets…";
      }

      const stats = await fetchGroupStats({
        courseId,
        curso,
        asig,
        llamado,
      });

      if (!line) continue;

      if (!stats) {
        line.textContent = "Sin datos de informes todavía o error de conexión.";
        continue;
      }

      const estudiantes = stats.estudiantes || stats.students || 0;
      const ultimaFecha = stats.ultimaFecha || stats.lastDate || "sin registro";
      const totalInformes = stats.totalInformes || stats.reportsCount || 0;

      line.innerHTML = `
        Estudiantes vinculados: <strong>${estudiantes}</strong> ·
        Último informe: <strong>${ultimaFecha}</strong> ·
        Informes registrados: <strong>${totalInformes}</strong>
      `;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateAllGroups);
  } else {
    updateAllGroups();
  }
})();