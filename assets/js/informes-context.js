// assets/js/informes-context.js
// Ajusta filtros de informes según sesión (docente) y parámetros de la URL.

(function () {
  function read(key, fallback) {
    try {
      const v = sessionStorage.getItem(key);
      return v == null || v === "" ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function parseJSON(key) {
    try {
      const raw = read(key, "[]");
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function setSelectByText(select, text) {
    if (!select || !text) return;
    const target = text.trim().toLowerCase();
    for (const opt of select.options) {
      if (opt.text.trim().toLowerCase() === target) {
        opt.selected = true;
        return;
      }
    }
  }

  function initReportFilters() {
    const cursoSel = document.getElementById("filter-curso");
    const asigSel = document.getElementById("filter-asignatura");
    const llamadoSel = document.getElementById("filter-llamado");

    if (!cursoSel || !asigSel) return;

    const params = new URLSearchParams(window.location.search || "");

    // 1) Si la URL trae parámetros explícitos, tienen prioridad.
    const urlCurso = params.get("curso");
    const urlAsig = params.get("asig");
    const urlLlamado = params.get("llamado");

    if (urlCurso) {
      setSelectByText(cursoSel, urlCurso);
    }
    if (urlAsig) {
      setSelectByText(asigSel, urlAsig);
    }
    if (urlLlamado && llamadoSel) {
      setSelectByText(llamadoSel, urlLlamado);
    }


    // 2-bis) Mostrar enlaces rápidos si hay docente en sesión
    const linksBox = document.getElementById("teacher-informes-links");
    const nameSpan = document.getElementById("teacher-name-informes");
    const teacherLogged = read("teacherLogged", "0");
    if (linksBox && teacherLogged === "1") {
      linksBox.style.display = "block";
      const tName = read("teacherName", "Docente PEVE");
      if (nameSpan) nameSpan.textContent = tName;
    }

    // 2) Si NO hay parámetros en la URL, intentamos usar el contexto docente.
    if (!urlCurso && !urlAsig) {
      const teacherLogged = read("teacherLogged", "0");
      if (teacherLogged === "1") {
        const levels = parseJSON("teacherLevels");
        const subjects = parseJSON("teacherSubjects");

        // Tomamos el primer nivel y asignatura del docente que existan en los selects.
        if (levels && levels.length) {
          // ej: "7° Básico", "8° Básico", "1° Medio"
          for (const lvl of levels) {
            for (const opt of cursoSel.options) {
              if (opt.text.trim().toLowerCase() === lvl.trim().toLowerCase()) {
                opt.selected = true;
                break;
              }
            }
          }
        }

        if (subjects && subjects.length) {
          for (const subj of subjects) {
            for (const opt of asigSel.options) {
              if (opt.text.trim().toLowerCase() === subj.trim().toLowerCase()) {
                opt.selected = true;
                break;
              }
            }
          }
        }

        // Llamado por defecto para docente demo
        if (llamadoSel && !urlLlamado) {
          setSelectByText(llamadoSel, "2025 · 1° llamado");
        }
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReportFilters);
  } else {
    initReportFilters();
  }
})();