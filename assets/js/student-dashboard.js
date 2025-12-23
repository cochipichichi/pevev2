
// assets/js/student-dashboard.js
// Ajusta dinámicamente las tarjetas de "Mis asignaturas" del panel estudiante
// según el nivel almacenado en sessionStorage (7° Básico, 8° Básico, 1° Medio, etc.).

(function () {
  function q(id) {
    return document.getElementById(id);
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function setHtml(el, html) {
    if (!el) return;
    el.innerHTML = html;
  }

  function setHref(el, href) {
    if (!el) return;
    el.setAttribute("href", href);
  }

  function hide(el) {
    if (!el) return;
    el.style.display = "none";
  }

  function showInline(el) {
    if (!el) return;
    el.style.display = "inline-flex";
  }


  function initStudentDashboard() {
    var level = sessionStorage.getItem("studentLevel") || "";

    // Normalizar si viene algo raro o vacío
    if (!level) {
      level = "7° Básico";
    }

    // Aseguramos que el encabezado muestre el nivel correcto (aunque student-context.js también lo hace)
    var levelEl = document.getElementById("student-level");
    if (levelEl) {
      levelEl.textContent = level;
    }

    // Referencias de tarjetas
    var cnTitle = q("card-cn-title");
    var cnNote = q("card-cn-note");
    var cnBullets = q("card-cn-bullets");
    var cnLinkBio = q("card-cn-link-bio");
    var cnLinkFis = q("card-cn-link-fis");
    var cnLinkQui = q("card-cn-link-qui");

    var lenTitle = q("card-len-title");
    var lenNote = q("card-len-note");
    var lenBullets = q("card-len-bullets");
    var lenLink = q("card-len-link");

    var matTitle = q("card-mat-title");
    var matNote = q("card-mat-note");
    var matBullets = q("card-mat-bullets");
    var matLink = q("card-mat-link");

    var histTitle = q("card-hist-title");
    var histNote = q("card-hist-note");
    var histBullets = q("card-hist-bullets");
    var histLink = q("card-hist-link");

    // Si el estudiante es de 8° Básico, ajustamos todo a 8°
    if (level.indexOf("8°") !== -1) {
      // Ciencias Naturales 8°
      setText(cnTitle, "🧪 Ciencias Naturales 8° Básico");
      setText(
        cnNote,
        "Biología, Física y Química 8° básico con foco en nutrición, salud, calor, electricidad y estructura de la materia."
      );
      setHtml(
        cnBullets,
        [
          '<li>🧬 <strong>Biología 8°:</strong> sistemas del cuerpo humano, nutrición y salud.</li>',
          '<li>⚙️ <strong>Física 8°:</strong> calor, temperatura, energía y electricidad.</li>',
          '<li>⚗️ <strong>Química 8°:</strong> estructura de la materia, mezclas y reacciones simples.</li>'
        ].join("")
      );
      setHref(
        cnLinkBio,
        "/pevev2/content/8basico/cienciasnaturales/ciencias-naturales-biologia/index.html"
      );
      setText(cnLinkBio, "🧬 Biología 8°");
      setHref(
        cnLinkFis,
        "/pevev2/content/8basico/cienciasnaturales/ciencias-naturales-fisica/index.html"
      );
      setText(cnLinkFis, "⚙️ Física 8°");
      setHref(
        cnLinkQui,
        "/pevev2/content/8basico/cienciasnaturales/ciencias-naturales-quimica/index.html"
      );
      setText(cnLinkQui, "⚗️ Química 8°");

      // Lenguaje 8°
      setText(lenTitle, "📖 Lenguaje y Comunicación 8° Básico");
      setText(
        lenNote,
        "Comprensión lectora, producción de textos y reflexión sobre la lengua alineadas al temario LE08."
      );
      setHtml(
        lenBullets,
        [
          "<li>📖 Lectura de textos literarios y no literarios.</li>",
          "<li>✍️ Escritura de textos argumentativos y expositivos breves.</li>"
        ].join("")
      );
      setHref(
        lenLink,
        "/pevev2/content/8basico/lenguaje-comunicacion/index.html"
      );
      setText(lenLink, "📖 Abrir Lenguaje 8°");

      // Matemática 8°
      setText(matTitle, "🧮 Matemática 8° Básico");
      setText(
        matNote,
        "Números racionales, proporcionalidad, geometría del plano y del espacio, y análisis de datos."
      );
      setHtml(
        matBullets,
        [
          "<li>🔢 Números enteros y racionales.</li>",
          "<li>📏 Proporcionalidad y porcentajes.</li>",
          "<li>📐 Figuras en el plano y el espacio.</li>",
          "<li>📊 Tablas y gráficos estadísticos.</li>"
        ].join("")
      );
      setHref(matLink, "/pevev2/content/8basico/matematica/index.html");
      setText(matLink, "🧮 Abrir Matemática 8°");

      // Historia 8°
      setText(histTitle, "🌍 Historia, Geografía y Cs. Sociales 8° Básico");
      setText(
        histNote,
        "Procesos históricos modernos, Ilustración, revoluciones, Derechos Humanos y conflictos socioambientales."
      );
      setHtml(
        histBullets,
        [
          "<li>📜 Reforma, Estado moderno, conquista de América, Ilustración y revoluciones atlánticas.</li>",
          "<li>🗺️ Conflictos socioambientales, proyectos extractivos e IDH.</li>"
        ].join("")
      );
      setHref(
        histLink,
        "/pevev2/content/8basico/historia-geografia/index.html"
      );
      setText(histLink, "🌍 Abrir Historia y Geografía 8°");

      return;
    }


    // Si el estudiante es de 1° Medio, adaptamos el panel a Biología 1M (OA2 Evidencias de Evolución)
    if (level.indexOf("1°") !== -1 || level.indexOf("1 Medio") !== -1 || level.indexOf("1° Medio") !== -1) {
      // Ciencias Naturales / Biología 1M
      setText(cnTitle, "🧪 Ciencias Naturales 1° Medio");
      setText(
        cnNote,
        "Biología 1° Medio con foco en OA2 Evidencias de evolución: ADN, fósiles, homología y línea de tiempo de la vida."
      );
      setHtml(
        cnBullets,
        [
          "<li>🧬 <strong>ADN y variabilidad:</strong> modelo 3D de doble hélice para explorar estructura.</li>",
          "<li>🔍 <strong>Evidencias de evolución:</strong> fósiles, homologías y líneas de tiempo.</li>",
          "<li>🧬 <strong>Recursos XR:</strong> visores 3D/VR y quiz integrados al OA2.</li>"
        ].join("")
      );
      // En 1M usamos un flujo especial con asignatura detallada:
      // enviamos al estudiante a la vista app/estudiante/asignatura-bio1m.html
      setHref(cnLinkBio, "/pevev2/app/estudiante/asignatura-bio1m.html");
      setText(cnLinkBio, "🧬 Biología 1° Medio");
      // Ocultamos los botones de Física y Química porque aún no hay módulos 1M para esas áreas
      hide(cnLinkFis);
      hide(cnLinkQui);

      // Lenguaje 1° Medio (placeholder hasta poblar contenido)
      setText(lenTitle, "📖 Lenguaje y Comunicación 1° Medio");
      setText(
        lenNote,
        "Lectura crítica y producción de textos para 1° Medio. Módulos detallados se irán activando en el piloto."
      );
      setHtml(
        lenBullets,
        [
          "<li>📘 Comprensión de textos más extensos y complejos.</li>",
          "<li>✍️ Producción de textos expositivos y argumentativos.</li>"
        ].join("")
      );
      // Por ahora sin ruta específica de contenido, dejamos un ancla neutra
      setHref(lenLink, "#");
      setText(lenLink, "📖 Lenguaje 1° Medio (próximamente)");

      // Matemática 1° Medio (placeholder)
      setText(matTitle, "🧮 Matemática 1° Medio");
      setText(
        matNote,
        "Números reales, funciones, geometría analítica y datos. Se habilitará progresivamente en el piloto."
      );
      setHtml(
        matBullets,
        [
          "<li>🔢 Números racionales e irracionales.</li>",
          "<li>📈 Representación gráfica de funciones.</li>",
          "<li>📐 Geometría y coordenadas en el plano.</li>"
        ].join("")
      );
      setHref(matLink, "#");
      setText(matLink, "🧮 Matemática 1° Medio (próximamente)");

      // Historia 1° Medio (placeholder)
      setText(histTitle, "🌍 Historia, Geografía y Cs. Sociales 1° Medio");
      setText(
        histNote,
        "Procesos históricos, geográficos y formación ciudadana para 1° Medio. Contenidos se incorporarán en siguientes versiones."
      );
      setHtml(
        histBullets,
        [
          "<li>📜 Transformaciones del mundo contemporáneo.</li>",
          "<li>🧭 Espacio geográfico, medio ambiente y sociedad.</li>"
        ].join("")
      );
      setHref(histLink, "#");
      setText(histLink, "🌍 Historia 1° Medio (próximamente)");

      return;
    }

    // Si el estudiante es de 1° Medio, podrías extender aquí una lógica similar.
    // Por ahora, el contenido base queda configurado para 7° Básico por defecto.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStudentDashboard);
  } else {
    initStudentDashboard();
  }
})();
