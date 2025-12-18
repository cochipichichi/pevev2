// assets/js/auth-demo.js
// Login unificado para PEVE (estudiante, apoderado, docente y administrador) usando peve-login-form

(function () {
  // "Base de datos" DEMO de usuarios
  const demoUsers = {
    student: [
      // Estudiante realista 1° Medio (Belen)
      {
        idPeve: "STU-2025-0005",
        run: "17757302-7",
        firstName: "Belen",
        lastNameP: "Acuña",
        lastNameM: "Perez",
        email: "belen.acpe@gmail.com",
        password: "PEVE2025-Belen01",
        level: "1° Medio",
        call: "2025 · 1° llamado",
        packageName: "PEVE 1° Medio Completo 2024",
        estadoCuenta: "activa"
      },
      // Demo 7° Básico
      {
        idPeve: "STU-2025-0002",
        run: "15888999-2",
        firstName: "Demo",
        lastNameP: "Siete",
        lastNameM: "Básico",
        email: "estudiante7@peve.cl",
        // Clave simple oficial
        password: "peve7",
        // Clave antigua aceptada también para compatibilidad
        altPasswords: ["Peve7basico*"],
        level: "7° Básico",
        call: "2025 · 1° llamado",
        packageName: "PEVE 7° Básico Completo 2024",
        estadoCuenta: "activa"
      },
      // Demo 8° Básico
      {
        idPeve: "STU-2025-0001",
        run: "15677733-1",
        firstName: "Martín",
        lastNameP: "Acuña",
        lastNameM: "Perez",
        email: "estudiante8@peve.cl",
        // Clave simple oficial
        password: "peve8",
        // Clave antigua aceptada también para compatibilidad
        altPasswords: ["Peve8basico*"],
        level: "8° Básico",
        call: "2025 · 1° llamado",
        packageName: "PEVE 8° Básico Completo 2024",
        estadoCuenta: "activa"
      },
      // Demo 1° Medio simple
      {
        idPeve: "STU-2025-0003",
        run: "16700111-3",
        firstName: "Demo",
        lastNameP: "Uno",
        lastNameM: "Medio",
        email: "estudiante1m@peve.cl",
        password: "peve1m",
        level: "1° Medio",
        call: "2025 · 1° llamado",
        packageName: "PEVE 1° Medio Demo",
        estadoCuenta: "activa"
      }
    ],

    guardian: [
      {
        email: "apoderado7@peve.cl",
        password: "apo7",
        name: "Apoderado 7° Básico",
        phone: "+56 9 7000 7007",
        studentName: "Estudiante 7° Básico",
        studentRun: "15888999-2",
        studentIdPeve: "STU-2025-0002",
        studentLevel: "7° Básico",
        studentCall: "2025 · 1° llamado",
        studentPackage: "PEVE 7° Básico Completo 2024"
      },
      {
        email: "apoderado8@peve.cl",
        password: "apo8",
        name: "Apoderado 8° Básico",
        phone: "+56 9 8000 8008",
        studentName: "Estudiante 8° Básico",
        studentRun: "15677733-1",
        studentIdPeve: "STU-2025-0001",
        studentLevel: "8° Básico",
        studentCall: "2025 · 1° llamado",
        studentPackage: "PEVE 8° Básico Completo 2024"
      },
      {
        email: "apoderado1m@peve.cl",
        password: "apo1m",
        name: "Apoderado 1° Medio",
        phone: "+56 9 9000 9009",
        studentName: "Estudiante 1° Medio",
        studentRun: "16700111-3",
        studentIdPeve: "STU-2025-0003",
        studentLevel: "1° Medio",
        studentCall: "2025 · 1° llamado",
        studentPackage: "PEVE 1° Medio Demo"
      }
    ],

    teacher: [
      {
        email: "docente7@peve.cl",
        password: "doc7",
        name: "Docente 7° Básico",
        school: "Liceo / establecimiento",
        subjects: ["Ciencias Naturales", "Matemática"],
        levels: ["7° Básico"]
      },
      {
        email: "docente8@peve.cl",
        password: "doc8",
        name: "Docente 8° Básico",
        school: "Liceo / establecimiento",
        subjects: ["Ciencias Naturales", "Lenguaje y Comunicación"],
        levels: ["8° Básico"]
      },
      {
        email: "docente1m@peve.cl",
        password: "doc1m",
        name: "Docente 1° Medio",
        school: "Liceo / establecimiento",
        subjects: ["Biología"],
        levels: ["1° Medio"]
      },
      {
        email: "docente.demo@peve.cl",
        password: "PeveDocente2025*",
        name: "Docente Demo General",
        school: "Neotech EduLab / PEVE",
        subjects: ["Ciencias", "Matemática", "Historia", "Inglés"],
        levels: ["7° Básico", "8° Básico", "1° Medio"]
      }
    ],

    admin: [
      // Admins reales ya existentes
      {
        email: "neotechedulab@gmail.com",
        password: "PEVENeoTechEdulab2025*",
        name: "Neotech EduLab – Admin"
      },
      {
        email: "cochipichichi@gmail.com",
        password: "PEVENeoTechEdulab2025*",
        name: "Pancho Pinto – Admin"
      },
      // Admins simples para demo
      {
        email: "admin@peve.cl",
        password: "admin",
        name: "Super Administrador PEVE"
      },
      {
        email: "neotechedulab@peve.cl",
        password: "neo",
        name: "Admin Plataforma NeoTech"
      },
      {
        email: "cochipichichi@gmail.com",
        password: "pancho",
        name: "Admin Pancho (clave simple demo)"
      }
    ]
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

      // Normalizar español → clave interna
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

        const okPassword =
          user &&
          (user.password === password ||
            (Array.isArray(user.altPasswords) &&
              user.altPasswords.includes(password)));

        if (!user || !okPassword) {
          if (errorEl) {
            errorEl.textContent =
              "Correo o contraseña incorrectos. Verifica tus datos de estudiante.";
          }
          return;
        }

        if (user.estadoCuenta && user.estadoCuenta !== "activa") {
          if (errorEl) {
            errorEl.textContent =
              "Tu cuenta PEVE está inactiva. Contacta a administración.";
          }
          return;
        }

        const fullName = `${user.firstName} ${user.lastNameP} ${user.lastNameM}`;

        try {
          sessionStorage.setItem("studentProfile", "estudiante");
          sessionStorage.setItem("studentId", user.idPeve || "");
          sessionStorage.setItem("studentRun", user.run || "");
          sessionStorage.setItem("studentName", fullName);
          sessionStorage.setItem("studentEmail", user.email);
          sessionStorage.setItem("studentLevel", user.level || "");
          sessionStorage.setItem("studentCall", user.call || "");
          sessionStorage.setItem("studentPackage", user.packageName || "");
        } catch (e) {
          console.warn("No se pudo usar sessionStorage para estudiante:", e);
        }

        window.location.href = "./estudiante/dashboard.html";
        return;
      }

      // 2) LOGIN APODERADO
      if (profile === "guardian") {
        const guardian = (demoUsers.guardian || []).find(
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
          sessionStorage.setItem("guardianName", guardian.name || "Apoderado/a");
          sessionStorage.setItem("guardianPhone", guardian.phone || "");

          sessionStorage.setItem(
            "guardianStudentName",
            guardian.studentName || "Estudiante"
          );
          sessionStorage.setItem(
            "guardianStudentRun",
            guardian.studentRun || ""
          );
          sessionStorage.setItem(
            "guardianStudentId",
            guardian.studentIdPeve || ""
          );
          sessionStorage.setItem(
            "guardianStudentLevel",
            guardian.studentLevel || ""
          );
          sessionStorage.setItem(
            "guardianStudentCall",
            guardian.studentCall || ""
          );
          sessionStorage.setItem(
            "guardianStudentPackage",
            guardian.studentPackage || ""
          );
        } catch (e) {
          console.warn("No se pudo usar sessionStorage para apoderado:", e);
        }

        window.location.href = "./dashboard_apoderado.html";
        return;
      }

      // 3) LOGIN DOCENTE
      if (profile === "teacher") {
        const teacher = (demoUsers.teacher || []).find(
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
          sessionStorage.setItem("teacherName", teacher.name || "Docente");
          sessionStorage.setItem(
            "teacherSchool",
            teacher.school || "Liceo / establecimiento"
          );
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

        window.location.href = "./dashboard_docente.html";
        return;
      }

      // 4) LOGIN ADMINISTRADOR
      if (profile === "admin") {
        const admin = (demoUsers.admin || []).find(
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
          sessionStorage.setItem("adminName", admin.name || "Administrador");
        } catch (e) {
          console.warn("No se pudo usar sessionStorage para admin:", e);
        }

        window.location.href = "./dashboard_admin.html";
        return;
      }

      // 5) Otros perfiles no implementados
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