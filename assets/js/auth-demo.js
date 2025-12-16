// assets/js/auth-demo.js
// Login unificado para PEVE (estudiante, apoderado, docente y administrador) usando peve-login-form

(function () {
  // "Base de datos" DEMO de usuarios
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
    ],
    admin: [
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
    ],
  };

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

      // Normalizar español → inglés / clave interna
      if (profile === "estudiante") profile = "student";
      if (profile === "administrador") profile = "admin";
      if (profile === "apoderado") profile = "guardian";
      if (profile === "docente") profile = "teacher";

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
          console.warn("No se pudo usar sessionStorage para estudiante:", e);
        }

        // Redirección al panel del estudiante
        window.location.href = "./estudiante/dashboard.html";
        return;
      }

      // 2) LOGIN APODERADO
      if (profile === "guardian") {
        const guardian = demoUsers.guardian.find(
          (g) => g.email.toLowerCase() === mainValue.toLowerCase()
        );

        if (!guardian || guardian.password !== password) {
          if (errorEl) {
            errorEl.textContent =
              "Credenciales de apoderado incorrectas. Verifica correo y contraseña.";
          }
          return;
        }

        try {
          sessionStorage.setItem("guardianLogged", "1");
          sessionStorage.setItem("guardianEmail", guardian.email);
          sessionStorage.setItem("guardianName", guardian.name);
          sessionStorage.setItem("guardianPhone", guardian.phone || "");

          sessionStorage.setItem("guardianStudentName", guardian.studentName);
          sessionStorage.setItem("guardianStudentRun", guardian.studentRun);
          sessionStorage.setItem("guardianStudentId", guardian.studentIdPeve);
          sessionStorage.setItem("guardianStudentLevel", guardian.studentLevel);
          sessionStorage.setItem("guardianStudentCall", guardian.studentCall);
          sessionStorage.setItem(
            "guardianStudentPackage",
            guardian.studentPackage
          );
        } catch (e) {
          console.warn("No se pudo usar sessionStorage para apoderado:", e);
        }

        // Redirección al panel de apoderado
        window.location.href = "./dashboard_apoderado.html";
        return;
      }

      // 3) LOGIN DOCENTE
      if (profile === "teacher") {
        const teacher = demoUsers.teacher.find(
          (t) => t.email.toLowerCase() === mainValue.toLowerCase()
        );

        if (!teacher || teacher.password !== password) {
          if (errorEl) {
            errorEl.textContent =
              "Credenciales de docente incorrectas. Verifica correo y contraseña.";
          }
          return;
        }

        try {
          sessionStorage.setItem("teacherLogged", "1");
          sessionStorage.setItem("teacherEmail", teacher.email);
          sessionStorage.setItem("teacherName", teacher.name);
          sessionStorage.setItem("teacherSchool", teacher.school || "");
          sessionStorage.setItem(
            "teacherSubjects",
            JSON.stringify(teacher.subjects || [])
          );
          sessionStorage.setItem(
            "teacherLevels",
            JSON.stringify(teacher.levels || [])
          );
        } catch (e) {
          console.warn("No se pudo usar sessionStorage para docente:", e);
        }

        // Redirección al panel docente
        window.location.href = "./dashboard_docente.html";
        return;
      }

      // 4) LOGIN ADMINISTRADOR
      if (profile === "admin") {
        const admin = demoUsers.admin.find(
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

      // 5) OTROS PERFILES (docente/PIE externos, etc.) → modo demo
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
""".strip()

with open(auth_path,"w",encoding="utf-8") as f:
    f.write(new_auth)

len(new_auth.splitlines())
