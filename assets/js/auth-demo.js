// assets/js/auth-demo.js
// Prototipo local de autenticación para PEVE con el nuevo peve-login-form

(function () {
  // "Base de datos" demo
  const demoUsers = {
    student: [
      {
        idPeve: "STU-2025-0001",
        run: "17757302-7",
        firstName: "Belen",
        lastNameP: "Acuña",
        lastNameM: "Perez",
        email: "belen.acpe@gmail.com",
        password: "PEVE2025-Belen01", // Contraseña DEMO
        level: "1° Medio",
        call: "2025 · 1° llamado",
        packageName: "PEVE 1° Medio Completo 2024",
        estadoCuenta: "activa"
      }
    ]
    // Más adelante podrás agregar guardian, teacher, admin con otros arrays
  };

  function findErrorElement() {
    // Intenta usar un contenedor existente para errores
    let el = document.getElementById("login-error");
    if (el) return el;

    el = document.querySelector(".login-error");
    if (el) return el;

    // Como fallback, lo crea al final del formulario
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
    if (!form) return; // esta página no tiene el nuevo formulario

    const errorEl = findErrorElement();

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (errorEl) errorEl.textContent = "";

      // Perfil seleccionado (student, guardian, teacher, admin)
      const perfilInput = form.querySelector('input[name="perfil"]');
      const profile = (perfilInput?.value || "student").toLowerCase();

      // Campos de entrada
      const mainInput = document.getElementById("login-main-input") || form.querySelector('input[name="email"]');
      const passInput = document.getElementById("login-password") || form.querySelector('input[name="password"]');

      const mainValue = (mainInput?.value || "").trim();
      const password = (passInput?.value || "").trim();

      if (!mainValue || !password) {
        if (errorEl) {
          errorEl.textContent = "Por favor, completa los campos de acceso.";
        }
        return;
      }

      // Por ahora solo implementamos lógica real para estudiante
      if (profile !== "student") {
        if (errorEl) {
          errorEl.textContent =
            "Por ahora este perfil está en modo demostrativo. La conexión real se habilitará en próximas versiones.";
        }
        return;
      }

      // LOGIN DEMO ESTUDIANTE
      const users = demoUsers.student || [];
      const user = users.find(
        (u) => u.email.toLowerCase() === mainValue.toLowerCase()
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
    document.addEventListener("DOMContentLoaded", setupPeveLogin);
  } else {
    setupPeveLogin();
  }
})();

