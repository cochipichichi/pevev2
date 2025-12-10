// assets/js/admin.js
// Lógica de autenticación admin + carga de usuarios desde API PEVE_Usuarios (o demo)

(function () {
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
  const USERS_API_URL = "https://script.google.com/macros/s/XXXXX/exec"; // TODO: pegar tu URL

  // 3) Datos DEMO (mientras no conectes la API)
  const DEMO_USERS = [
    {
      id_peve: "STU-2025-0001",
      run_estudiante: "23225367-3",
      nombre_estudiante: "Gianella Patricia",
      apellido_paterno: "Sepúlveda",
      apellido_materno: "Palavecino",
      correo_institucional: "gianella.sepulveda.p@liceosannicolas.cl",
      password_plataforma: "PEVE2025-Gia01",
      perfil: "estudiante",
      curso_2025: "2° Medio",
      paquete_comprado: "PEVE 1° Medio Completo 2024",
      llamado: "2025 · 1° llamado",
      estado_cuenta: "activa",
      fecha_alta: "26/12/2024",
      correo_apoderado: "sepulvedamackarena3@gmail.com",
      nombre_apoderado: "Jocelyn Sepúlveda Palavecino",
      telefono_apoderado: "938854900",
      colegio_procedencia: "Liceo Bicentenario de Excelencia Polivalente San Nicolás",
      observaciones: "Crisis de pánico. Coordinar apoyos PIE."
    }
  ];

  function isAdminLogged() {
    return !!sessionStorage.getItem("adminEmail");
  }

  function getAdminName() {
    return sessionStorage.getItem("adminName") || "";
  }

  function showSection(id, show) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = show ? "" : "none";
  }

  // LOGIN ADMIN
  function setupAdminLogin() {
    const form = document.getElementById("admin-login-form");
    if (!form) return;

    const errorEl = document.getElementById("admin-login-error");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (errorEl) errorEl.textContent = "";

      const emailInput = form.querySelector('input[name="email"]');
      const passInput  = form.querySelector('input[name="password"]');

      const email = (emailInput?.value || "").trim().toLowerCase();
      const password = (passInput?.value || "").trim();

      if (!email || !password) {
        if (errorEl) errorEl.textContent = "Completa correo y contraseña.";
        return;
      }

      const admin = ADMIN_ACCOUNTS.find(
        a => a.email.toLowerCase() === email && a.password === password
      );

      if (!admin) {
        if (errorEl) errorEl.textContent = "Credenciales no válidas para administrador.";
        return;
      }

      // Guardar sesión admin
      sessionStorage.setItem("adminEmail", admin.email);
      sessionStorage.setItem("adminName", admin.name);

      // Mostrar panel admin
      showSection("admin-login-section", false);
      showSection("admin-panel-section", true);

      loadUsers(); // cargar usuarios de la API o demo
    });
  }

  // CARGA DE USUARIOS DESDE API O DEMO
  async function loadUsers() {
    const tableBody = document.querySelector("#admin-users-table tbody");
    const totalEl   = document.getElementById("admin-total-users");
    if (!tableBody) return;

    let users = [];

    if (USERS_API_URL && USERS_API_URL.includes("XXXXX") === false) {
      // Intentar cargar desde la API real
      try {
        const resp = await fetch(USERS_API_URL);
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        users = await resp.json();
      } catch (e) {
        console.warn("No se pudo cargar desde la API, uso datos DEMO:", e);
        users = DEMO_USERS;
      }
    } else {
      // Si todavía no se configuró la URL, usar datos DEMO
      users = DEMO_USERS;
    }

    tableBody.innerHTML = "";

    users.forEach((u, idx) => {
      const fullName = `${u.nombre_estudiante || ""} ${u.apellido_paterno || ""} ${u.apellido_materno || ""}`.trim();
      const tr = document.createElement("tr");

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

    if (totalEl) {
      totalEl.textContent = users.length.toString();
    }

    // Guardar en window para uso de handlers
    window.PEVE_ADMIN_USERS = users;

    // Delegación de eventos para botones de acciones
    tableBody.addEventListener("click", function (ev) {
      const btn = ev.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const index  = parseInt(btn.getAttribute("data-index"), 10);
      const user   = window.PEVE_ADMIN_USERS[index];
      if (!user) return;

      if (action === "send-email") {
        openEmailForUser(user);
      } else if (action === "send-whatsapp") {
        openWhatsAppForUser(user);
      }
    }, { once: true }); // se puede quitar { once: true } si quieres múltiples bind
  }

  function openEmailForUser(user) {
    const correoApoderado = user.correo_apoderado || "";
    if (!correoApoderado) {
      alert("Este registro no tiene correo de apoderado.");
      return;
    }
    const nombreEst = `${user.nombre_estudiante || ""} ${user.apellido_paterno || ""} ${user.apellido_materno || ""}`.trim();
    const correoEst = user.correo_institucional || "";
    const pass      = user.password_plataforma || "";
    const curso     = user.curso_2025 || "";
    const llamado   = user.llamado || "";

    const subject = `Credenciales de acceso PEVE – ${nombreEst}`;
    const body = [
      `Estimada/o ${user.nombre_apoderado || ""},`,
      ``,
      `Le compartimos las credenciales de acceso a la plataforma 📚PEVE para ${nombreEst}:`,
      ``,
      `• Curso 2025: ${curso}`,
      `• Llamado: ${llamado}`,
      ``,
      `Correo institucional del estudiante: ${correoEst}`,
      `Contraseña temporal PEVE: ${pass}`,
      ``,
      `Link de ingreso: https://cochipichichi.github.io/pevev2/app/login.html`,
      ``,
      `Una vez que ingrese, le recomendamos cambiar la contraseña (esta opción estará disponible en la próxima versión de la plataforma).`,
      ``,
      `Atentamente,`,
      `Equipo PEVE – Neotech EduLab / Liceo San Nicolás`
    ].join("\n");

    const mailtoUrl =
      "mailto:" +
      encodeURIComponent(correoApoderado) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    window.location.href = mailtoUrl;
  }

  function openWhatsAppForUser(user) {
    const phoneRaw = user.telefono_apoderado || "";
    if (!phoneRaw) {
      alert("Este registro no tiene teléfono de apoderado.");
      return;
    }
    // Limpiar cualquier caracter no numérico
    const digits = phoneRaw.replace(/\D/g, "");
    // Asumimos Chile (+56). Ajustar si es necesario.
    const phone = "56" + digits.replace(/^56/, ""); // evita duplicar 56

    const nombreEst = `${user.nombre_estudiante || ""} ${user.apellido_paterno || ""} ${user.apellido_materno || ""}`.trim();
    const correoEst = user.correo_institucional || "";
    const pass      = user.password_plataforma || "";
    const curso     = user.curso_2025 || "";
    const llamado   = user.llamado || "";

    const text = [
      `Hola ${user.nombre_apoderado || ""}, te compartimos las credenciales PEVE de ${nombreEst}:`,
      ``,
      `• Curso 2025: ${curso}`,
      `• Llamado: ${llamado}`,
      ``,
      `Correo institucional: ${correoEst}`,
      `Contraseña temporal: ${pass}`,
      ``,
      `Link de ingreso: https://cochipichichi.github.io/pevev2/app/login.html`,
      ``,
      `Recuerda cambiar la contraseña una vez que ingrese.`
    ].join("\n");

    const waUrl =
      "https://wa.me/" +
      phone +
      "?text=" +
      encodeURIComponent(text);

    window.open(waUrl, "_blank");
  }

  function init() {
    // Si ya hay admin logueado, ir directo al panel
    if (isAdminLogged()) {
      showSection("admin-login-section", false);
      showSection("admin-panel-section", true);
      loadUsers();
    } else {
      showSection("admin-login-section", true);
      showSection("admin-panel-section", false);
    }

    setupAdminLogin();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
