// assets/js/auth-demo.js
// Prototipo local de autenticación para PEVE (solo estudiante: Gianella)

(function () {
  // "Base de datos" demo
  const demoUsers = {
    estudiante: [
      {
        idPeve: "STU-2025-0001",
        run: "23225367-3",
        firstName: "Gianella Patricia",
        lastNameP: "Sepúlveda",
        lastNameM: "Palavecino",
        email: "gianella.sepulveda.p@liceosannicolas.cl",
        password: "PEVE2025-Gia01", // Contraseña DEMO
        level: "2° Medio",
        call: "2025 · 1° llamado",
        packageName: "PEVE 1° Medio Completo 2024",
        estadoCuenta: "activa"
      }
    ]
    // Más adelante puedes agregar:
    // apoderado: [...],
    // docente: [...],
    // admin: [...]
  };

  function setupStudentLogin() {
    const form = document.getElementById("student-login-form");
    if (!form) return; // Por si esta página no tiene el formulario

    const errorEl = document.getElementById("student-login-error");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      if (errorEl) {
        errorEl.textContent = "";
      }

      const emailInput = form.querySelector('input[name="email"]');
      const passInput  = form.querySelector('input[name="password"]');

      const email = (emailInput?.value || "").trim().toLowerCase();
      const password = (passInput?.value || "").trim();

      if (!email || !password) {
        if (errorEl) {
          errorEl.textContent = "Por favor, completa correo institucional y contraseña.";
        }
        return;
      }

      // Buscar estudiante DEMO
      const users = demoUsers.estudiante || [];
      const user = users.find(
        (u) => u.email.toLowerCase() === email
      );

      if (!user) {
        if (errorEl) {
          errorEl.textContent = "Correo o contraseña incorrectos. Verifica tus datos.";
        }
        return;
      }

      if (user.estadoCuenta !== "activa") {
        if (errorEl) {
          errorEl.textContent = "Tu cuenta PEVE está inactiva. Contacta a administración.";
        }
        return;
      }

      if (user.password !== password) {
        if (errorEl) {
          errorEl.textContent = "Correo o contraseña incorrectos. Verifica tus datos.";
        }
        return;
      }

      // LOGIN OK → guardar datos en sessionStorage
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

      // Redirigir al panel de estudiante
      window.location.href = "./estudiante/dashboard.html";
    });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupStudentLogin);
  } else {
    setupStudentLogin();
  }
})();
