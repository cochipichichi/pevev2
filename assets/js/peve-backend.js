// assets/js/peve-backend.js
// Helper para enviar resultados de Quiz y Tickets de salida a Google Apps Script (PEVE_Datos).
// Usa PEVE_CONFIG.getScriptUrl() para obtener el endpoint configurado en data/config.json
// y guarda datos mínimos para demo de producción.

(function () {
  async function postToScript(action, payload) {
    try {
      if (!window.PEVE_CONFIG) {
        console.warn("[PEVE_BACKEND] PEVE_CONFIG no está disponible. Revisa que assets/js/config.js esté cargado.");
        return { status: "error", message: "PEVE_CONFIG no disponible" };
      }
      const scriptUrl = await window.PEVE_CONFIG.getScriptUrl();
      if (!scriptUrl) {
        console.warn("[PEVE_BACKEND] scriptUrl vacío. Configura data/config.json o localStorage[peve-script-url].");
        return { status: "error", message: "scriptUrl vacío" };
      }

      const body = JSON.stringify({ action, payload });
      const res = await fetch(scriptUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("[PEVE_BACKEND] Respuesta no JSON:", text);
        return { status: "error", message: "Respuesta no JSON del script" };
      }
      if (data.status !== "ok") {
        console.warn("[PEVE_BACKEND] Error desde Apps Script:", data);
      }
      return data;
    } catch (err) {
      console.error("[PEVE_BACKEND] Error en postToScript:", err);
      return { status: "error", message: String(err) };
    }
  }

  function nowIso() {
    try {
      return new Date().toISOString();
    } catch (e) {
      return "";
    }
  }

  function getStudentContext() {
    // Usa lo que tengamos disponible en sessionStorage
    const ctx = {
      userId: sessionStorage.getItem("studentId") || "",
      userName: sessionStorage.getItem("studentName") || "",
      level: sessionStorage.getItem("studentLevel") || "",
      email: sessionStorage.getItem("studentEmail") || ""
    };
    return ctx;
  }

  async function sendQuizResult(meta) {
    const student = getStudentContext();
    const payload = {
      timestamp: nowIso(),
      userId: student.userId || meta.userId || "",
      userName: student.userName || meta.userName || "",
      course: meta.course || student.level || "",
      module: meta.module || "",
      score: Number(meta.score || 0),
      max: Number(meta.max || 0),
      q1: meta.q1 || "",
      q2: meta.q2 || ""
    };
    return postToScript("quiz_submit", payload);
  }


  async function getGuardianSummary(meta) {
    const student = getStudentContext();
    const payload = {
      userId: meta && meta.userId ? meta.userId : (student.userId || ""),
      userName: meta && meta.userName ? meta.userName : (student.userName || "")
    };
    return postToScript("guardian_summary", payload);
  }

  async function sendTicket(meta) {
    const student = getStudentContext();
    const payload = {
      timestamp: nowIso(),
      userId: student.userId || meta.userId || "",
      userName: student.userName || meta.userName || "",
      course: meta.course || student.level || "",
      module: meta.module || "",
      learned: meta.learned || "",
      doubt: meta.doubt || "",
      example: meta.example || ""
    };
    return postToScript("ticket_submit", payload);
  }

  window.PEVE_BACKEND = {
    sendQuizResult,
    sendTicket,
    getGuardianSummary
  };
})();
