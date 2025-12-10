// assets/js/admin.js
// Panel administrador PEVE:
// - Carga usuarios desde la Web App de Google Apps Script (PEVE_Usuarios)
// - Permite enviar credenciales (correo / WhatsApp)
// - Permite seleccionar estudiante activo y generar informes rápidos (PEVE + DIA + KPSI)

(function () {
  // URL de tu Web App (ya publicada) para la hoja PEVE_Usuarios
  const USERS_API_URL =
    "https://script.google.com/macros/s/AKfycbyiDATOy7Rt0zkI-TUziPe8PrGJmi1e8ffWWfgTGsfNtPdX9H7Tt9vvuKTyYHB2fMUVhw/exec";

  // Fallback demo por si la API falla
  const DEMO_USERS = [
    {
      id_peve: "STU-2025-0001",
      run_estudiante: "17757302-7",
      nombre_estudiante: "Belen",
      apellido_paterno: "Acuña",
      apellido_materno: "Perez",
      correo_institucional: "belen.acpe@gmail.com",
      password_plataforma: "PEVE2025-Belen01",
      perfil: "estudiante",
      curso_2025: "1° Medio",
      paquete_comprado: "PEVE 1° Medio Completo 2024",
      llamado: "2025 · 1° llamado",
      estado_cuenta: "activa",
      fecha_alta: "2024-12-26T03:00:00.000Z",
      correo_apoderado: "belen.acpe@gmail.com",
      nombre_apoderado: "Belen Acuña Perez",
      telefono_apoderado: 56962664960,
      colegio_procedencia: "arboleda",
      observaciones: "Crisis de pánico. Coordinar apoyos PIE."
    }
  ];

  // Estado de trabajo en memoria
  let students = [];
  let currentStudent = null;
  let lastSelectedRow = null;

  // ------------- HELPERS DE NORMALIZACIÓN -------------

  function normalizeUser(raw) {
    if (!raw) return null;

    const fullName =
      (raw.nombre_estudiante || "") +
      " " +
      (raw.apellido_paterno || "") +
      " " +
      (raw.apellido_materno || "");

    return {
      idPeve: raw.id_peve || "",
      fullName: fullName.trim(),
      run: raw.run_estudiante || "",
      curso: raw.curso_2025 || "",
      llamado: raw.llamado || "",
      correoEstudiante: raw.correo_institucional || "",
      correoApoderado: raw.correo_apoderado || "",
      nombreApoderado: raw.nombre_apoderado || "",
      telefonoApoderado: raw.telefono_apoderado || "",
      estadoCuenta: raw.estado_cuenta || "",
      password: raw.password_plataforma || "",
      paquete: raw.paquete_comprado || "",
      observaciones: raw.observaciones || "",
      perfil: raw.perfil || ""
    };
  }

  async function fetchUsersFromApi() {
    try {
      if (!USERS_API_URL) {
        console.warn("USERS_API_URL vacío. Usando DEMO_USERS.");
        return DEMO_USERS.map(normalizeUser).filter(Boolean);
      }

      const res = await fetch(USERS_API_URL, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache"
        }
      });

      if (!res.ok) {
        console.warn(
          "Respuesta no OK desde la API (" + res.status + "). Usando DEMO_USERS."
        );
        return DEMO_USERS.map(normalizeUser).filter(Boolean);
      }

      const json = await res.json();

      if (!Array.isArray(json)) {
        console.warn(
          "La API no devolvió un arreglo. Formato inesperado. Usando DEMO_USERS.",
          json
        );
        return DEMO_USERS.map(normalizeUser).filter(Boolean);
      }

      return json.map(normalizeUser).filter(Boolean);
    } catch (err) {
      console.error("Error al consultar la API de usuarios PEVE:", err);
      return DEMO_USERS.map(normalizeUser).filter(Boolean);
    }
  }

  // ------------- CONSTRUCCIÓN DE TABLA -------------

  function buildRow(user, index) {
    const tr = document.createElement("tr");

    // Guardar índice y datos útiles en data-attributes
    tr.dataset.index = String(index);
    tr.dataset.studentName = user.fullName;
    tr.dataset.course = user.curso;
    tr.dataset.call = user.llamado;
    tr.dataset.studentEmail = user.correoEstudiante;
    tr.dataset.guardianEmail = user.correoApoderado;
    tr.dataset.guardianName = user.nombreApoderado;
    tr.dataset.guardianPhone = user.telefonoApoderado;
    tr.dataset.password = user.password;
    tr.dataset.perfil = user.perfil || "estudiante";

    tr.innerHTML = `
      <td>${user.idPeve || "–"}</td>
      <td>${user.fullName || "–"}</td>
      <td>${user.run || "–"}</td>
      <td>${user.curso || "–"}</td>
      <td>${user.llamado || "–"}</td>
      <td>${user.correoEstudiante || "–"}</td>
      <td>${user.nombreApoderado || "–"}</td>
      <td>${user.correoApoderado || "–"}</td>
      <td>${user.telefonoApoderado || "–"}</td>
      <td>${user.estadoCuenta || "–"}</td>
      <td>
        <button type="button" class="btn btn-card" data-action="email">
          📩 Credenciales
        </button>
        <button type="button" class="btn btn-card" data-action="whatsapp">
          📱 Credenciales
        </button>
      </td>
    `;
    return tr;
  }

  // ------------- INFORME RÁPIDO: GENERACIÓN -------------

  function getReportTypeLabel(type) {
    switch (type) {
      case "resumen-peve":
        return "Resumen PEVE (exámenes + avance)";
      case "dia":
        return "Informe de ingreso (DIA)";
      case "kpsi":
        return "Informe KPSI inicio / fin";
      case "mixto":
        return "Informe mixto (PEVE + DIA + KPSI)";
      default:
        return "Informe PEVE";
    }
  }

  function getTargetLabel(target) {
    switch (target) {
      case "estudiante":
        return "estudiante";
      case "apoderado":
        return "apoderado / tutor / cuidador";
      case "docente":
        return "docente";
      case "utp":
        return "equipo UTP / PIE";
      default:
        return "destinatario";
    }
  }

  function buildReportText(student, type, target) {
    const nombre = student?.fullName || "[NOMBRE_ESTUDIANTE]";
    const curso = student?.curso || "[CURSO_2025]";
    const llamado = student?.llamado || "[LLAMADO]";
    const tipoLabel = getReportTypeLabel(type);

    let saludo = "Estimada familia / equipo,";
    if (target === "estudiante") {
      saludo = `Estimado/a ${nombre},`;
    } else if (target === "apoderado") {
      saludo = `Estimada familia / apoderado(a) de ${nombre},`;
    } else if (target === "docente") {
      saludo = `Estimado/a docente de ${nombre},`;
    } else if (target === "utp") {
      saludo = `Estimado equipo UTP / PIE,`;
    }

    const lineas = [];

    lineas.push(`[${tipoLabel.toUpperCase()} – DEMO]`);
    lineas.push("");
    lineas.push(saludo);
    lineas.push("");
    lineas.push(
      `A continuación se presenta un borrador de informe del estudiante ${nombre}, ` +
        `curso ${curso}, llamado ${llamado}:`
    );
    lineas.push("");

    if (type === "dia" || type === "mixto") {
      lineas.push("1. Información de ingreso (DIA)");
      lineas.push(
        "   - Línea de base de aprendizaje al momento de ingresar a PEVE."
      );
      lineas.push(
        "   - Principales fortalezas y necesidades detectadas (por completar con datos del informe DIA)."
      );
      lineas.push("");
    }

    if (type === "resumen-peve" || type === "mixto") {
      lineas.push(
        type === "mixto" ? "2. Progreso en PEVE (por curso y asignatura)" : "1. Progreso en PEVE (por curso y asignatura)"
      );
      lineas.push("   - Avance en revisión de temarios oficiales.");
      lineas.push(
        "   - Resultados de evaluaciones realizadas en la plataforma (por completar)."
      );
      lineas.push("   - Trayectoria y ritmo de estudio.");
      lineas.push("");
    }

    if (type === "kpsi" || type === "mixto") {
      const n = type === "mixto" ? "3" : "1";
      lineas.push(`${n}. KPSI inicio / KPSI fin`);
      lineas.push(
        "   - Percepción inicial del estudiante respecto a los Objetivos de Aprendizaje."
      );
      lineas.push(
        "   - Cambios en la percepción al cierre del proceso (seguridad, autonomía, autoconfianza)."
      );
      lineas.push("");
    }

    lineas.push(
      "Este informe es una síntesis para apoyar el trabajo conjunto entre estudiante, familia,"
    );
    lineas.push(
      "docentes y UTP/PIE. Próximas versiones incluirán gráficas y detalles cuantitativos a partir"
    );
    lineas.push("de los registros reales de la plataforma.");
    lineas.push("");
    lineas.push("Atentamente,");
    lineas.push("Equipo PEVE – Liceo San Nicolás / Neotech EduLab");

    return lineas.join("\n");
  }

  function updateReportPreview() {
    const label = document.getElementById("report-student-label");
    const textarea = document.getElementById("report-preview");
    const typeSelect = document.getElementById("report-type-select");
    const targetSelect = document.getElementById("report-target-select");

    const type = typeSelect ? typeSelect.value : "resumen-peve";
    const target = targetSelect ? targetSelect.value : "apoderado";

    if (!label || !textarea) return;

    if (!currentStudent) {
      label.innerHTML =
        "<strong>Sin selección</strong> · selecciona una fila en la tabla de usuarios.";
      // no machaco el texto que ya escriba el admin
      return;
    }

    label.innerHTML = `
      <strong>${currentStudent.fullName}</strong> ·
      ${currentStudent.curso || "Curso sin asignar"} ·
      ${currentStudent.llamado || "Llamado sin registrar"}
    `;

    // Generar texto de informe base
    const texto = buildReportText(currentStudent, type, target);
    textarea.value = texto;
  }

  // ------------- ENVÍO DE INFORMES (CORREO / WHATSAPP) -------------

  function getDestEmailAndPhone(target) {
    if (!currentStudent) return { email: "", phone: "" };

    const estMail = currentStudent.correoEstudiante || "";
    const apoMail = currentStudent.correoApoderado || "";
    const apoPhone = String(currentStudent.telefonoApoderado || "").replace(
      /\D/g,
      ""
    );

    // Por ahora reutilizamos estos campos como demo.
    switch (target) {
      case "estudiante":
        return {
          email: estMail || apoMail,
          phone: apoPhone
        };
      case "apoderado":
        return {
          email: apoMail || estMail,
          phone: apoPhone
        };
      case "docente":
        // Futuro: correo docente por curso / asignatura
        return {
          email: apoMail || estMail,
          phone: apoPhone
        };
      case "utp":
        // Futuro: correo UTP institucional
        return {
          email: apoMail || estMail,
          phone: apoPhone
        };
      default:
        return {
          email: apoMail || estMail,
          phone: apoPhone
        };
    }
  }

  function setupReportButtons() {
    const btnEmail = document.getElementById("btn-report-email");
    const btnWhats = document.getElementById("btn-report-whatsapp");
    const typeSelect = document.getElementById("report-type-select");
    const targetSelect = document.getElementById("report-target-select");
    const textarea = document.getElementById("report-preview");

    if (typeSelect) {
      typeSelect.addEventListener("change", function () {
        updateReportPreview();
      });
    }

    if (targetSelect) {
      targetSelect.addEventListener("change", function () {
        updateReportPreview();
      });
    }

    if (btnEmail) {
      btnEmail.addEventListener("click", function () {
        if (!currentStudent) {
          alert("Primero selecciona un estudiante en la tabla de usuarios.");
          return;
        }
        const type = typeSelect ? typeSelect.value : "resumen-peve";
        const target = targetSelect ? targetSelect.value : "apoderado";
        const dest = getDestEmailAndPhone(target);

        if (!dest.email) {
          alert(
            "No se encontró un correo válido para este informe. Revisa los datos del estudiante."
          );
          return;
        }

        const subject =
          getReportTypeLabel(type) + " – " + (currentStudent.fullName || "");
        const body = textarea ? textarea.value : "";

        const mailtoUrl =
          "mailto:" +
          encodeURIComponent(dest.email) +
          "?subject=" +
          encodeURIComponent(subject) +
          "&body=" +
          encodeURIComponent(body);

        window.location.href = mailtoUrl;
      });
    }

    if (btnWhats) {
      btnWhats.addEventListener("click", function () {
        if (!currentStudent) {
          alert("Primero selecciona un estudiante en la tabla de usuarios.");
          return;
        }
        const target = targetSelect ? targetSelect.value : "apoderado";
        const dest = getDestEmailAndPhone(target);

        if (!dest.phone) {
          alert(
            "No se encontró un teléfono válido para este informe. Revisa los datos del estudiante."
          );
          return;
        }

        const phoneWithCountry = dest.phone.startsWith("56")
          ? dest.phone
          : "56" + dest.phone;

        const msg = textarea ? textarea.value : "";

        const waUrl =
          "https://wa.me/" +
          phoneWithCountry +
          "?text=" +
          encodeURIComponent(msg);

        window.open(waUrl, "_blank");
      });
    }
  }


    function setupReportTags() {
    const tags = document.querySelectorAll(".report-tag");
    const typeSelect = document.getElementById("report-type-select");

    if (!tags.length || !typeSelect) return;

    tags.forEach(tag => {
      tag.addEventListener("click", () => {
        const reportType = tag.dataset.reportType;

        // Quitar estado activo de todas las tags
        tags.forEach(t => t.classList.remove("report-tag-active"));

        // Marcar la tag actual
        tag.classList.add("report-tag-active");

        // Sincronizar con el <select> de tipo de informe
        if (reportType) {
          typeSelect.value = reportType;
          updateReportPreview();
        }
      });
    });

    // Estado inicial (por defecto el "resumen PEVE")
    const defaultTag = document.querySelector(
      '.report-tag[data-report-type="resumen-peve"]'
    );
    if (defaultTag) {
      defaultTag.classList.add("report-tag-active");
    }
  }


  // ------------- INTERACCIÓN CON LA TABLA -------------

  function attachTableInteractions(tbody) {
    tbody.addEventListener("click", function (ev) {
      const btn = ev.target.closest("button[data-action]");
      const tr = ev.target.closest("tr");
      if (!tr) return;

      const index = parseInt(tr.dataset.index || "-1", 10);
      if (!Number.isNaN(index) && students[index]) {
        // Marcar como fila seleccionada
        if (lastSelectedRow && lastSelectedRow !== tr) {
          lastSelectedRow.classList.remove("row-selected");
        }
        tr.classList.add("row-selected");
        lastSelectedRow = tr;

        currentStudent = students[index];
        updateReportPreview();
      }

      // Si el clic fue en botón de acciones (credenciales)
      if (btn) {
        const action = btn.dataset.action;
        const studentName = tr.dataset.studentName || "";
        const course = tr.dataset.course || "";
        const call = tr.dataset.call || "";
        const correoEst = tr.dataset.studentEmail || "";
        const correoApo = tr.dataset.guardianEmail || "";
        const nombreApo = tr.dataset.guardianName || "";
        const fonoApo = (tr.dataset.guardianPhone || "").replace(/\D/g, "");
        const password = tr.dataset.password || "";

        if (action === "email") {
          if (!correoApo) {
            alert("Este registro no tiene correo de apoderado asignado.");
            return;
          }

          const subject = `Credenciales de acceso 📚PEVE – ${studentName}`;
          const bodyLines = [
            `Estimada ${nombreApo || ""},`,
            ``,
            `Le compartimos las credenciales de acceso a la plataforma 📚PEVE para ${studentName}:`,
            ``,
            `• Curso 2025: ${course}`,
            `• Llamado: ${call}`,
            ``,
            `Correo institucional del estudiante: ${correoEst}`,
            `Contraseña temporal PEVE: ${password}`,
            ``,
            `Link de ingreso: https://cochipichichi.github.io/pevev2/app/login.html`,
            ``,
            `Una vez que ingrese, le recomendamos cambiar la contraseña (esta opción estará disponible en la próxima versión de la plataforma).`,
            ``,
            `Atentamente,`,
            `Equipo PEVE – Neotech EduLab / Liceo San Nicolás`
          ];

          const mailtoUrl =
            "mailto:" +
            encodeURIComponent(correoApo) +
            "?subject=" +
            encodeURIComponent(subject) +
            "&body=" +
            encodeURIComponent(bodyLines.join("\n"));

          window.location.href = mailtoUrl;
          return;
        }

        if (action === "whatsapp") {
          if (!fonoApo) {
            alert("Este registro no tiene teléfono de apoderado válido.");
            return;
          }

          const phoneWithCountry = fonoApo.startsWith("56")
            ? fonoApo
            : "56" + fonoApo;

          const msgLines = [
            `Estimada ${nombreApo || ""},`,
            ``,
            `Le compartimos las credenciales PEVE para ${studentName}:`,
            ``,
            `Curso 2025: ${course}`,
            `Llamado: ${call}`,
            ``,
            `Correo estudiante: ${correoEst}`,
            `Contraseña temporal: ${password}`,
            ``,
            `Ingreso: https://cochipichichi.github.io/pevev2/app/login.html`
          ];

          const waUrl =
            "https://wa.me/" +
            phoneWithCountry +
            "?text=" +
            encodeURIComponent(msgLines.join("\n"));

          window.open(waUrl, "_blank");
          return;
        }
      }
    });
  }

  // ------------- INICIALIZACIÓN GENERAL -------------

    async function initAdminPanel() {
    const table = document.getElementById("admin-users-table");
    if (!table) return;

    const tbody = table.querySelector("tbody");
    const totalEl = document.getElementById("admin-total-users");

    students = await fetchUsersFromApi();

    tbody.innerHTML = "";
    students.forEach(function (u, idx) {
      const tr = buildRow(u, idx);
      tbody.appendChild(tr);
    });

    if (totalEl) {
      totalEl.textContent = String(students.length);
    }

    attachTableInteractions(tbody);
    setupReportButtons();
    setupReportTags();   // ← NUEVO
  }

})();

