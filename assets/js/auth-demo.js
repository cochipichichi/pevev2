// assets/js/auth-demo.js
// Login unificado para PEVE (estudiante + administrador)

(function () {
  // "Base de datos" DEMO de estudiantes
  const demoUsers = {
    student: [
      {
        idPeve: "STU-2025-0005",
        run: "17757302-7",
        firstName: "Belen",
        lastNameP: "Acuña",
        lastNameM: "Perez",
        email: "belen.acpe@gmail.com",
        password: "PEVE2025-Belen01", // DEMO
        level: "1° Medio",
        call: "2025 · 1° llamado",
        packageName: "PEVE 1° Medio Completo 2024",
        estadoCuenta: "activa",
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
  };

  // Cuentas admin autorizadas DEMO
  const adminAccounts = [
    {
      email: "neotechedulab@gmail.com",
      password: "PEVENeoTechEdulab2025*",
      name: "Neotech EduLab – Admin",
    },
    {
      email: "cochipichichi@gmail.com",
      password: "PEVENeoTechEdulab2025*",
      name: "Pancho Pinto – Admin",
    },
  ];

  function findErrorElement() {
    let el = document.getElementById("login-error");
    if (el) return el;

    el = document.querySelector(".login-error");
    if (el) return el;

    const form = document.getElementById("peve-login-form");
    if (form) {
      const p = document.createElement("p");
      p.id = "login-error";
      p.className = "note login-error";
      p.setAttribute("aria-live", "polite");
      form.appendChild(p);
      return p;
    }
    return null;
  }

  function setupPeveLogin() {
    const form = document.getElementById("peve-login-form");
    if (!form) return;

    const errorEl = findErrorElement();

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (errorEl) errorEl.textContent = "";

      const perfilInput = form.querySelector('input[name="perfil"]');
      let profile = (perfilInput?.value || "student").toLowerCase();

      // Normalizamos posibles valores en español
      if (profile === "estudiante") profile = "student";
      if (profile === "administrador") profile = "admin";

      const mainInput =
        document.getElementById("login-main-input") ||
        form.querySelector('input[name="email"]');
      const passInput =
        document.getElementById("login-password") ||
        form.querySelector('input[name="password"]');

      const mainValue = (mainInput?.value || "").trim();
      const password = (passInput?.value || "").trim();

      if (!mainValue || !password) {
        if (errorEl) {
          errorEl.textContent = "Por favor, completa los campos de acceso.";
        }
        return;
      }

      // 1) LOGIN ESTUDIANTE
      if (profile === "student") {
        const users = demoUsers.student || [];
        const user = users.find(
          (u) => u.email.toLowerCase() === mainValue.toLowerCase()
        );

        if (!user || user.password !== password) {
          if (errorEl) {
            errorEl.textContent =
              "Correo o contraseña incorrectos. Verifica tus datos.";
          }
          return;
        }

        if (user.estadoCuenta !== "activa") {
          if (errorEl) {
            errorEl.textContent =
              "Tu cuenta PEVE está inactiva. Contacta a administración.";
          }
          return;
        }

        const fullName = `${user.firstName} ${user.lastNameP} ${user.lastNameM}`;

        try {
          sessionStorage.setItem("studentProfile", "estudiante");
          sessionStorage.setItem("studentId", user.idPeve);
          sessionStorage.setItem("studentRun", user.run);
          sessionStorage.setItem("studentName", fullName);
          sessionStorage.setItem("studentEmail", user.email);
          sessionStorage.setItem("studentLevel", user.level);
          sessionStorage.setItem("studentCall", user.call);
          sessionStorage.setItem("studentPackage", user.packageName);
        } catch (e) {
          console.warn("No se pudo usar sessionStorage:", e);
        }

        // Redirección al panel del estudiante
        window.location.href = "./estudiante/dashboard.html";
        return;
      }

      // 2) LOGIN ADMINISTRADOR
      if (profile === "admin") {
        const admin = adminAccounts.find(
          (a) => a.email.toLowerCase() === mainValue.toLowerCase()
        );

        if (!admin || admin.password !== password) {
          if (errorEl) {
            errorEl.textContent =
              "Credenciales de administrador incorrectas. Verifica correo y contraseña.";
          }
          return;
        }

        try {
          sessionStorage.setItem("adminLogged", "1");
          sessionStorage.setItem("adminEmail", admin.email);
          sessionStorage.setItem("adminName", admin.name);
        } catch (e) {
          console.warn("No se pudo usar sessionStorage para admin:", e);
        }

        // Redirección al panel admin
        window.location.href = "./dashboard_admin.html";
        return;
      }

      // 3) OTROS PERFILES (apoderado/docente demo)
      if (errorEl) {
        errorEl.textContent =
          "Por ahora este perfil está en modo demostrativo. La conexión real se habilitará en próximas versiones.";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupPeveLogin);
  } else {
    setupPeveLogin();
  }
})();
