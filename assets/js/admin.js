// assets/js/admin.js
// Autenticación administrador + carga de usuarios desde Google Sheets (PEVE_Usuarios)
// + generación de informes rápidos PEVE · DIA · KPSI

(function () {
  // 1) Cuentas admin permitidas (login.html)
  const ADMIN_ACCOUNTS = [
    {
      email: "neotechedulab@gmail.com",
      password: "PEVENeoTechEdulab2025*",
      name: "Admin Neotech",
    },
    {
      email: "cochipichichi@gmail.com",
      password: "PEVENeoTechEdulab2025*",
      name: "Admin Pancho",
    },
  ];

  // 2) URL de la API (Apps Script Web App)
  // YA CON TU URL REAL
  const USERS_API_URL =
    "https://script.google.com/macros/s/AKfycbyiDATOy7Rt0zkI-TUziPe8PrGJmi1e8ffWWfgTGsfNtPdX9H7Tt9vvuKTyYHB2fMUVhw/exec";

  // 3) Datos DEMO por si la API falla
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
      fecha_alta: "26/12/2024",
      correo_apoderado: "belen.acpe@gmail.com",
      nombre_apoderado: "Belen Acuña Perez",
      telefono_apoderado: "56962664960",
      colegio_procedencia: "arboleda",
      observaciones: "Crisis de pánico. Coordinar apoyos PIE.",
    },
     {
        idPeve: "STU-2025-0001",
        run: "15677733-1",
        firstName: "Martín",
        lastNameP: "Acuña",
        lastNameM: "Perez",
        email: "estudiante8@peve.cl",
        password: "Peve8basico*", // DEMO 8° Básico
        level: "8° Básico",
        call: "2025 · 1° llamado",
        packageName: "PEVE 8° Básico Completo 2024",
        estadoCuenta: "activa",
      },
      {
        idPeve: "STU-2025-0002",
        run: "15888999-2",
        firstName: "Demo",
        lastNameP: "Siete",
        lastNameM: "Básico",
        email: "estudiante7@peve.cl",
        password: "Peve7basico*", // DEMO 7° Básico
        level: "7° Básico",
        call: "2025 · 1° llamado",
        packageName: "PEVE 7° Básico Completo 2024",
        estadoCuenta: "activa",
      },
    ],
    guardian: [
      {
        email: "apoderado7@peve.cl",
        password: "apo7",
        firstName: "Apoderado",
        lastNameP: "Demo",
        student: "Estudiante 7° Básico",
      },
      {
        email: "apoderado8@peve.cl",
        password: "apo8",
        firstName: "Apoderado",
        lastNameP: "Demo",
        student: "Estudiante 8° Básico",
      },
      {
        email: "apoderado1m@peve.cl",
        password: "apo1m",
        firstName: "Apoderado",
        lastNameP: "Demo",
        student: "Estudiante 1° Medio",
      },
    ],
    teacher: [
      {
        email: "docente7@peve.cl",
        password: "doc7",
        firstName: "Docente",
        lastNameP: "Demo",
        subject: "Ciencias y Matemática",
        level: "7° Básico",
      },
      {
        email: "docente8@peve.cl",
        password: "doc8",
        firstName: "Docente",
        lastNameP: "Demo",
        subject: "Ciencias y Lenguaje",
        level: "8° Básico",
      },
      {
        email: "docente1m@peve.cl",
        password: "doc1m",
        firstName: "Docente",
        lastNameP: "Demo",
        subject: "Biología",
        level: "1° Medio",
      },

    
  ];

  // Fuente actual (api o demo) para mostrar en el dashboard
  let ADMIN_USERS_SOURCE = "demo"; // se actualizará en loadUsersIntoTable


  // 4) Estado interno
  let selectedIndex = null; // índice del usuario seleccionado en la tabla

  function q(selector) {
    return document.querySelector(selector);
  }

  function showSection(id, visible) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = visible ? "" : "none";
  }

  // ========================
  // 5) LOGIN ADMIN (login.html)
  // ========================
  function setupAdminLogin() {
    const form = document.getElementById("admin-login-form");
    if (!form) return; // este JS también se carga en dashboard_admin

    const errorEl = document.getElementById("admin-login-error");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (errorEl) errorEl.textContent = "";

      const emailInput = form.querySelector('input[name="email"]');
      const passInput = form.querySelector('input[name="password"]');

      const email = (emailInput?.value || "").trim().toLowerCase();
      const password = (passInput?.value || "").trim();

      if (!email || !password) {
        if (errorEl) errorEl.textContent = "Completa correo y contraseña.";
        return;
      }

      const match = ADMIN_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email && acc.password === password
      );

      if (!match) {
        if (errorEl)
          errorEl.textContent = "Correo o contraseña no válidos para administrador.";
        return;
      }

      // Guarda sesión admin y redirige al dashboard
      try {
        sessionStorage.setItem("adminLogged", "1");
        sessionStorage.setItem("adminName", match.name);
      } catch (e) {}

      window.location.href = "./dashboard_admin.html";
    });
  }

  // ==============================================
  // 6) CARGA DE USUARIOS (dashboard_admin.html)
  // ==============================================
  async function loadUsersIntoTable() {
    const tableBody = q("#admin-users-table tbody");
    const totalEl = document.getElementById("admin-total-users");
    const srcEl = document.getElementById("admin-users-source");
    const urlEl = document.getElementById("admin-script-url");
    const count7El = document.getElementById("admin-count-7b");
    const count8El = document.getElementById("admin-count-8b");
    const count1mEl = document.getElementById("admin-count-1m");
    if (!tableBody) return;

    let users = [];
    try {
      if (USERS_API_URL && !USERS_API_URL.includes("XXXXX")) {
        const resp = await fetch(USERS_API_URL);
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        users = await resp.json();
        ADMIN_USERS_SOURCE = "api";
      } else {
        users = DEMO_USERS;
        ADMIN_USERS_SOURCE = "demo";
      }
    } catch (e) {
      console.warn("No se pudo cargar desde la API, usando DEMO_USERS:", e);
      users = DEMO_USERS;
      ADMIN_USERS_SOURCE = "demo";
    }

    window.PEVE_ADMIN_USERS = users;
    tableBody.innerHTML = "";

    users.forEach((u, idx) => {
      const fullName = `${u.nombre_estudiante || ""} ${u.apellido_paterno || ""} ${u.apellido_materno || ""}`.trim();

      const tr = document.createElement("tr");
      tr.dataset.index = String(idx);
      tr.innerHTML = `
        <td>${u.id_peve || ""}</td>
        <td>${fullName}</td>
        <td>${u.run_estudiante || ""}</td>
        <td>${u.curso_2025 || ""}</td>
        <td>${u.llamado || ""}</td>
        <td>${u.correo_institucional || ""}</td>
        <td>${u.nombre_apoderado || ""}</td>
        <td>${u.correo_apoderado || ""}</td>
        <td>${u.telefono_apoderado || ""}</td>
        <td>${u.estado_cuenta || ""}</td>
        <td>
          <button class="btn btn-card btn-outline" data-action="send-email" data-index="${idx}">📩 Correo</button>
          <button class="btn btn-card btn-outline" data-action="send-whatsapp" data-index="${idx}">📱 WhatsApp</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    if (totalEl) totalEl.textContent = users.length.toString();

    // Resumen por nivel (solo si hay elementos donde curso_2025 diga 7°, 8° o 1° Medio)
    const count7 = users.filter(u => (u.curso_2025 || "").includes("7°")).length;
    const count8 = users.filter(u => (u.curso_2025 || "").includes("8°")).length;
    const count1m = users.filter(u => (u.curso_2025 || "").includes("1° Medio")).length;

    if (count7El) count7El.textContent = String(count7);
    if (count8El) count8El.textContent = String(count8);
    if (count1mEl) count1mEl.textContent = String(count1m);

    // Mostrar fuente de datos y URL de API
    if (srcEl) {
      srcEl.textContent =
        ADMIN_USERS_SOURCE === "api"
          ? "Hoja de cálculo (Apps Script)"
          : "Datos DEMO locales (admin.js)";
    }
    if (urlEl) {
      urlEl.textContent = USERS_API_URL || "No configurada";
    }

    // Delegación de eventos: selección + acciones
    tableBody.addEventListener("click", function (ev) {
      const btn = ev.target.closest("button[data-action]");
      if (btn) {
        const action = btn.getAttribute("data-action");
        const index = parseInt(btn.getAttribute("data-index"), 10);
        const user = window.PEVE_ADMIN_USERS[index];
        if (!user) return;

        if (action === "send-email") {
          openEmailForUser(user);
        } else if (action === "send-whatsapp") {
          openWhatsForUser(user);
        }
        return;
      }

      // Si hizo clic en la fila (no en botón), seleccionar estudiante
      const row = ev.target.closest("tr[data-index]");
      if (!row) return;
      const idxRow = parseInt(row.dataset.index, 10);
      setSelectedUser(idxRow);
    });
  }

  // ==============================
  // 7) SELECCIÓN & INFORME RÁPIDO
  // ==============================
  function setSelectedUser(index) {
    const users = window.PEVE_ADMIN_USERS || [];
    const user = users[index];
    const label = document.getElementById("report-student-label");
    const tbody = q("#admin-users-table tbody");
    if (!tbody || !label || !user) {
      if (label)
        label.textContent =
          "Sin selección · selecciona una fila en la tabla de usuarios.";
      selectedIndex = null;
      return;
    }

    // Resaltar fila seleccionada
    Array.from(tbody.querySelectorAll("tr")).forEach((tr) => {
      tr.classList.toggle(
        "admin-row-selected",
        tr.dataset.index === String(index)
      );
    });

    const fullName = `${user.nombre_estudiante || ""} ${
      user.apellido_paterno || ""
    } ${user.apellido_materno || ""}`.trim();
    const curso = user.curso_2025 || "Curso 2025";
    const llamado = user.llamado || "";

    label.textContent = `${fullName} · ${curso}${
      llamado ? " · " + llamado : ""
    }`;
    selectedIndex = index;

    updateReportPreview(); // refresca el texto del informe
  }

  function buildReportTemplate(user, type, dest) {
    const fullName = `${user.nombre_estudiante || ""} ${
      user.apellido_paterno || ""
    } ${user.apellido_materno || ""}`.trim();
    const curso = user.curso_2025 || "Curso 2025";
    const llamado = user.llamado || "";
    const nombreApoderado = user.nombre_apoderado || "";

    const saludo =
      dest === "estudiante"
        ? `Estimado/a ${fullName},`
        : `Estimada familia / apoderado(a) de ${fullName}${
            nombreApoderado ? ` (${nombreApoderado})` : ""
          },`;

    let titulo;
    if (type === "dia") {
      titulo = "[INFORME PEVE – DIA · línea de base]";
    } else if (type === "kpsi") {
      titulo = "[INFORME PEVE – KPSI inicio / fin]";
    } else if (type === "curso") {
      titulo = "[INFORME PEVE – Resultados por curso y asignatura]";
    } else {
      titulo = "[RESUMEN PEVE (EXÁMENES + AVANCE)]";
    }

    const intro = `A continuación se presenta un borrador de informe del estudiante ${fullName}, curso ${curso}${
      llamado ? `, llamado ${llamado}` : ""
    }.`;
    const cuerpoBase = [
      "1. Información de ingreso (DIA)",
      "   - Línea de base de aprendizaje al momento de ingresar a PEVE.",
      "",
      "2. Resultados en PEVE (por curso y asignatura)",
      "   - Avance en revisión de temarios oficiales.",
      "   - Resultados de evaluaciones realizadas en la plataforma (por completar).",
      "",
      "3. KPSI inicio / fin",
      "   - Percepción inicial y final del nivel de dominio de los Objetivos de Aprendizaje.",
      "",
      "Este informe es una síntesis para apoyar el trabajo conjunto entre estudiante, familia,",
      "docentes y UTP/PIE. Próximas versiones incluirán datos cuantitativos y gráficas,",
      "a partir de los registros reales de PEVE, DIA y KPSI.",
      "",
      "Atentamente,",
      "Equipo PEVE – Liceo San Nicolás / Neotech EduLab",
    ];

    return [titulo, "", saludo, "", intro, "", ...cuerpoBase].join("\n");
  }

  function updateReportPreview() {
    const preview = document.getElementById("report-preview");
    const typeSel = document.getElementById("report-type");
    const destSel = document.getElementById("report-dest");
    if (!preview || !typeSel || !destSel) return;

    const users = window.PEVE_ADMIN_USERS || [];
    const user = users[selectedIndex];

    if (!user) {
      preview.value =
        "[Selecciona primero un estudiante en la tabla de usuarios para generar el informe.]";
      return;
    }

    const type = typeSel.value || "resumen";
    const dest = destSel.value || "estudiante";
    preview.value = buildReportTemplate(user, type, dest);
  }

  function handleReportEmail() {
    const users = window.PEVE_ADMIN_USERS || [];
    const user = users[selectedIndex];
    const preview = document.getElementById("report-preview");
    const destSel = document.getElementById("report-dest");
    if (!user || !preview || !destSel) {
      alert("Primero selecciona un estudiante en la tabla.");
      return;
    }

    const dest = destSel.value || "estudiante";
    const fullName = `${user.nombre_estudiante || ""} ${
      user.apellido_paterno || ""
    } ${user.apellido_materno || ""}`.trim();
    const curso = user.curso_2025 || "";
    let to = "";

    if (dest === "estudiante") {
      to = user.correo_institucional || user.correo_apoderado || "";
    } else if (dest === "apoderado") {
      to = user.correo_apoderado || "";
    } else {
      // Docente / UTP · placeholder (reemplazar por correos reales de UTP/PIE)
      to = "utp@liceosannicolas.cl";
    }

    if (!to) {
      alert("No hay correo configurado para este destinatario.");
      return;
    }

    const subject = `[Informe PEVE] ${fullName} – ${curso}`;
    const body = encodeURIComponent(preview.value || "");
    window.location.href = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${body}`;
  }

  function handleReportWhatsApp() {
    const users = window.PEVE_ADMIN_USERS || [];
    const user = users[selectedIndex];
    const preview = document.getElementById("report-preview");
    const destSel = document.getElementById("report-dest");
    if (!user || !preview || !destSel) {
      alert("Primero selecciona un estudiante en la tabla.");
      return;
    }

    const dest = destSel.value || "estudiante";
    let phone = "";

    if (dest === "estudiante") {
      phone = user.telefono_apoderado || "";
    } else if (dest === "apoderado") {
      phone = user.telefono_apoderado || "";
    } else {
      // Placeholder teléfono UTP / PIE
      phone = "56900000000";
    }

    const digits = (phone || "").replace(/\D+/g, "");
    if (!digits) {
      alert("No hay teléfono disponible para WhatsApp.");
      return;
    }

    const normalized = "56" + digits.replace(/^56/, "");
    const text = encodeURIComponent(preview.value || "");
    window.open(`https://wa.me/${normalized}?text=${text}`, "_blank");
  }

  // Reuso para enviar SOLO credenciales (botones de la tabla)
  function openEmailForUser(user) {
    const nombreEst = `${user.nombre_estudiante || ""} ${
      user.apellido_paterno || ""
    } ${user.apellido_materno || ""}`.trim();
    const correoEst = user.correo_institucional || "";
    const pass = user.password_plataforma || "";
    const curso = user.curso_2025 || "";
    const llamado = user.llamado || "";

    const to = user.correo_apoderado || correoEst || "";
    if (!to) {
      alert("No hay correo del apoderado/estudiante.");
      return;
    }

    const subject = `Credenciales PEVE – ${nombreEst}`;
    const bodyLines = [
      `Estimada familia / apoderado(a),`,
      ``,
      `Le compartimos las credenciales de acceso a la plataforma 📚PEVE para ${nombreEst}:`,
      ``,
      `• Curso 2025: ${curso}`,
      `• Llamado: ${llamado}`,
      ``,
      `Correo institucional: ${correoEst}`,
      `Contraseña temporal PEVE: ${pass}`,
      ``,
      `Link de ingreso: https://cochipichichi.github.io/pevev2/app/login.html`,
      ``,
      `Una vez que ingrese, recomendamos cambiar la contraseña (esta opción estará disponible en la próxima versión de la plataforma).`,
      ``,
      `Atentamente,`,
      `Equipo PEVE – Neotech EduLab / Liceo San Nicolás`,
    ];

    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${body}`;
  }

  function openWhatsForUser(user) {
    const phone = user.telefono_apoderado || "";
    const digits = phone.replace(/\D+/g, "");
    if (!digits) {
      alert("No hay teléfono del apoderado para WhatsApp.");
      return;
    }
    const normalized = "56" + digits.replace(/^56/, "");

    const nombreEst = `${user.nombre_estudiante || ""} ${
      user.apellido_paterno || ""
    } ${user.apellido_materno || ""}`.trim();
    const correoEst = user.correo_institucional || "";
    const pass = user.password_plataforma || "";
    const curso = user.curso_2025 || "";
    const llamado = user.llamado || "";

    const textLines = [
      `Hola, te compartimos las credenciales PEVE de ${nombreEst}:`,
      ``,
      `Curso 2025: ${curso}`,
      `Llamado: ${llamado}`,
      ``,
      `Correo institucional: ${correoEst}`,
      `Contraseña temporal: ${pass}`,
      ``,
      `Link: https://cochipichichi.github.io/pevev2/app/login.html`,
    ];

    const text = encodeURIComponent(textLines.join("\n"));
    window.open(`https://wa.me/${normalized}?text=${text}`, "_blank");
  }

  // ====================
  // 8) INIT GENERAL
  // ====================
  function init() {
    const isDashboard = !!document.getElementById("admin-users-table");
    const isLogin = !!document.getElementById("admin-login-form");

    if (isLogin) {
      setupAdminLogin();
    }

    if (isDashboard) {
      // Guardia de sesión admin
      const isAdmin = (() => {
        try {
          return sessionStorage.getItem("adminLogged") === "1";
        } catch (e) {
          return false;
        }
      })();

      if (!isAdmin) {
        window.location.href = "./login.html";
        return;
      }

      loadUsersIntoTable();

      const typeSel = document.getElementById("report-type");
      const destSel = document.getElementById("report-dest");
      const btnEmail = document.getElementById("btn-report-email");
      const btnWhats = document.getElementById("btn-report-whatsapp");

      if (typeSel) typeSel.addEventListener("change", updateReportPreview);
      if (destSel) destSel.addEventListener("change", updateReportPreview);
      if (btnEmail) btnEmail.addEventListener("click", handleReportEmail);
      if (btnWhats) btnWhats.addEventListener("click", handleReportWhatsApp);

      // Etiqueta inicial del informe
      const label = document.getElementById("report-student-label");
      if (label) {
        label.textContent =
          "Sin selección · selecciona una fila en la tabla de usuarios.";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

