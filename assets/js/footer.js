(function() {
  const footerHTML = `
  <footer class="footer small">
    <div class="footer-inner">
      <div class="footer-bar">
        <div class="logo">
         <img src="${(
  location.pathname.includes('/pages/') || 
  location.pathname.includes('/app/')
) ? '../assets/logo.svg' : 'assets/logo.svg'}"

               alt="Neotech EduLab" class="logo-img" onerror="this.style.display='none'">
          <div class="footer-text-main">
            <strong>Neotech EduLab</strong> – Educación Inmersiva
          </div>
          <p class="footer-text-main">
            © 2025 <strong>📚PEVE</strong> · Plataforma de Exámenes de Validación de Estudios · Hecho con ❤️ y enfoque inclusivo.
          </p>
          <small>🛠️ Prohibida su copia y/o reproducción</small>
        </div>
      </div>
    </div>
  </footer>
  `;

  function injectFooter() {
    if (document.querySelector('footer.footer')) return;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
