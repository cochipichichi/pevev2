// assets/js/admin.js
// Panel administrador PEVE: carga usuarios desde PEVE_Usuarios (Apps Script) y gestiona acciones.

((function () {
  // 1) Cuentas admin permitidas
  const ADMIN_ACCOUNTS = [
    {
      email: "neotechedulab@gmail.com",
      password: "PEVENeoTechEdulab2025*",
      name: "Admin Neotech"
    },
    {
      email: "cochipichichi@gmail.com",
      password: "PEVENeoTechEdulab2025*",
      name: "Admin Pancho"
    }
  ];

  // 2) URL de la API (Apps Script Web App)
  // Reemplaza con tu URL real una vez desplegado:
  const USERS_API_URL = "https://script.google.com/macros/s/AKfycbyiDATOy7Rt0zkI-TUziPe8PrGJmi1e8ffWWfgTGsfNtPdX9H7Tt9vvuKTyYHB2fMUVhw/exec"; // TODO: pegar tu URL

  // 3) Datos DEMO (mientras no conectes la API)
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
      nombre_apoderado: "Mercedes Perez",
      telefono_apoderado: "920027992",
      colegio_procedencia:
        "Arboleda,
      observaciones: "Crisis de pánico. Coordinar apoyos PIE."
    }
  ];

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
      observaciones: raw.observaciones || ""
    };
  }

  async function fetchUsersFromApi() {
    if (!USERS_API_URL || USERS_API_URL.indexOf("XXXXXXXX") !== -1) {
      // URL no configurada, usar demo
      console.warn("USERS_API_URL no está configurada. Usando DEMO_USERS.");
      return DEMO_USERS.map(normalizeUser).filter(Boolean);
    }

    try {
      const res = await fetch(USERS_API_URL, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache"
        }
      });

      if (!res.ok) {
        console.warn("Respuesta no OK de la API, usando DEMO_USERS:", res.status);
        return DEMO_USERS.map(normalizeUser).filter(Boolean);
      }

      const json = await res.json();
      if (!Array.isArray(json)) {
        console.warn("Formato inesperado de API, usando DEMO_USERS.");
        return DEMO_USERS.map(normalizeUser).filter(Boolean);
      }

      return json.map(normalizeUser).filter(Boolean);
    } catch (err) {
      console.error("Error al consultar API de usuarios PEVE:", err);
      return DEMO_USERS.map(normalizeUser).filter(Boolean);
    }
  }

  function buildRow(user) {
    const tr = document.createElement("tr");

    tr.dataset.studentName = user.fullName;
    tr.dataset.course = user.curso;
    tr.dataset.call = user.llamado;
    tr.dataset.studentEmail = user.correoEstudiante;
    tr.dataset.guardianEmail = user.correoApoderado;
    tr.dataset.guardianName = user.nombreApoderado;
    tr.dataset.guardianPhone = user.telefonoApoderado;
    tr.dataset.password = user.password;

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
        <button type="button" class="btn btn-card" data-action="email">📩 Correo</button>
        <button type="button" class="btn btn-card" data-action="whatsapp">📱 WhatsApp</button>
      </td>
    `;
    return tr;
  }

  function attachActions(tbody) {
    tbody.addEventListener("click", function (ev) {
      const btn = ev.target.closest("button[data-action]");
      if (!btn) return;

      const tr = btn.closest("tr");
      if (!tr) return;

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
        // Asumimos Chile (56) si no viene con código país
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
    });
  }

  async function initAdminPanel() {
    const table = document.getElementById("admin-users-table");
    if (!table) return; // No estamos en dashboard_admin

    const tbody = table.querySelector("tbody");
    const totalEl = document.getElementById("admin-total-users");

    const users = await fetchUsersFromApi();

    tbody.innerHTML = "";
    users.forEach(function (u) {
      const tr = buildRow(u);
      tbody.appendChild(tr);
    });

    if (totalEl) {
      totalEl.textContent = String(users.length);
    }

    attachActions(tbody);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminPanel);
  } else {
    initAdminPanel();
  }
})();

