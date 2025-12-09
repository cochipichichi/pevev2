
// Simple client-side 'auth' using localStorage (demo only)
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

const AUTH_KEY = "peve.session";
function setSession(user){ localStorage.setItem(AUTH_KEY, JSON.stringify(user)); }
function getSession(){ try { return JSON.parse(localStorage.getItem(AUTH_KEY)||"null"); } catch(e){ return null } }
function clearSession(){ localStorage.removeItem(AUTH_KEY); }

function toggleContrast(){
  document.documentElement.classList.toggle("high-contrast");
  localStorage.setItem("peve.hc", document.documentElement.classList.contains("high-contrast")?"1":"0");
}
function applyContrast(){ if(localStorage.getItem("peve.hc")==="1"){ document.documentElement.classList.add("high-contrast") } }
applyContrast();

function fontDelta(delta){
  const size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fs")||"16");
  const newSize = Math.max(12, Math.min(22, size + delta));
  document.documentElement.style.setProperty("--fs", newSize+"px");
}
document.addEventListener("click", (e)=>{
  const t = e.target.closest("[data-action]"); if(!t) return;
  const a = t.dataset.action;
  if(a==="contrast"){ toggleContrast(); }
  if(a==="fs-inc"){ fontDelta(1); }
  if(a==="fs-dec"){ fontDelta(-1); }
  if(a==="logout"){ clearSession(); location.href="./"; }
});

// PWA
if("serviceWorker" in navigator){ navigator.serviceWorker.register("./service-worker.js"); }


// Theme management (light/dark/high-contrast/sepia)
(function(){
  const THEMES = ['light','dark','high-contrast','sepia'];
  function setTheme(t){
    if(!THEMES.includes(t)) t = 'dark';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('peve.theme', t);
    const meta = document.querySelector('meta[name="theme-color"]');
    const color = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if(meta && color) meta.setAttribute('content', color);
  }
  function initTheme(){
    const t = localStorage.getItem('peve.theme') || 'dark';
    setTheme(t);
  }
  window.setTheme = setTheme;
  window.initTheme = initTheme;
  if (document.readyState !== 'loading') initTheme();
  else document.addEventListener('DOMContentLoaded', initTheme);
})();


// === Topbar + Theme menu logic (v2.1) ===
(function(){
  function ensureThemeAPI(){
    if(!window.setTheme){
      const THEMES = ['light','dark','high-contrast','sepia'];
      window.setTheme = function(t){
        if(!THEMES.includes(t)) t = 'dark';
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('peve.theme', t);
        const meta = document.querySelector('meta[name="theme-color"]');
        const color = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
        if(meta && color) meta.setAttribute('content', color);
      };
      window.initTheme = function(){
        const t = localStorage.getItem('peve.theme') || 'dark';
        window.setTheme(t);
      };
      if (document.readyState !== 'loading') window.initTheme();
      else document.addEventListener('DOMContentLoaded', window.initTheme);
    }
  }

  
function buildTopbar(){
    if(document.querySelector('.topbar')) return; // evitar duplicados
    const bar = document.createElement('div');
    bar.className = 'topbar';
    bar.innerHTML = `
      <div class="left">
        <span class="topbar-label">🛠️ Controles de apoyo</span>
      </div>
      <div class="right">
        <button class="btn" data-action="home" title="Volver al inicio 🏠">🏠</button>
        <button class="btn" data-action="tts" title="Leer contenido en voz alta 🗣️">🗣️</button>
        <button class="btn" data-action="theme-cycle" title="Cambiar tema 🌓">🌓</button>
        <button class="btn" data-action="fs-inc" title="Aumentar tamaño de letra A+">A+</button>
        <button class="btn" data-action="fs-dec" title="Disminuir tamaño de letra A−">A−</button>
        <button class="btn" data-action="lang-toggle" title="Cambiar idioma del documento 🌐">🌐</button>
        <button class="btn" data-action="focus" title="Modo concentración 🧠">🧠</button>
        <button class="btn" data-action="search" title="Buscar en la página 🔍">🔍</button>
      </div>
    `;
    document.body.prepend(bar);

    function speak(text){
      if(!('speechSynthesis' in window)){
        alert('Tu navegador no soporta lectura en voz alta.');
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = document.documentElement.lang || 'es-CL';
      window.speechSynthesis.speak(u);
    }

    bar.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-action]');
      if(!btn) return;
      const a = btn.getAttribute('data-action');
      if(a === 'home'){
        // Volver al inicio de la plataforma
        const base = document.body.getAttribute('data-home') || './';
        location.href = base;
      }
      if(a === 'theme-cycle'){
        const THEMES = ['light','dark','high-contrast','sepia'];
        const current = document.documentElement.getAttribute('data-theme') ||
                        localStorage.getItem('peve.theme') || 'dark';
        const idx = THEMES.indexOf(current);
        const next = THEMES[(idx+1+THEMES.length)%THEMES.length];
        if(window.setTheme) window.setTheme(next);
        else document.documentElement.setAttribute('data-theme', next);
      }
      if(a === 'tts'){
        const main = document.querySelector('#main-content, main, #main') || document.body;
        const text = (main.innerText || '').trim();
        if(text) speak(text);
      }
      if(a === 'lang-toggle'){
        const cur = document.documentElement.lang || 'es';
        const next = cur === 'es' ? 'en' : 'es';
        document.documentElement.lang = next;
        alert('Idioma del documento cambiado a ' + next.toUpperCase());
      }
      if(a === 'focus'){
        document.body.classList.toggle('focus-mode');
      }
      if(a === 'search'){
        const q = prompt('¿Qué quieres buscar en esta página?');
        if(q) window.find(q);
      }
      // fs-inc y fs-dec ya son manejados por el listener global de data-action
    });
  }

  function initTopbar(){
    ensureThemeAPI();
    if (document.readyState !== 'loading') buildTopbar();
    else document.addEventListener('DOMContentLoaded', buildTopbar);
  }
  initTopbar();
})();

// Ripple click (v2)
document.addEventListener('click', function(e){
  const el = e.target.closest('.btn.ripple');
  if(!el) return;
  const rect = el.getBoundingClientRect();
  const s = Math.max(rect.width, rect.height);
  const d = document.createElement('span');
  d.className = 'rpl';
  d.style.width = d.style.height = s + 'px';
  const x = e.clientX - rect.left - s/2;
  const y = e.clientY - rect.top - s/2;
  d.style.left = x + 'px';
  d.style.top = y + 'px';
  el.appendChild(d);
  setTimeout(()=>d.remove(), 600);
}, {passive:true});


// === PEVE role-based helpers ===
(function(){
  function applyRoleVisibility(){
    var role = 'guest';
    try{
      var stored = localStorage.getItem('peve.role');
      if(stored) role = String(stored).toLowerCase();
    }catch(e){}
    var docEl = document.documentElement;
    if(docEl) docEl.setAttribute('data-role', role);
    if(document.body){
      document.body.setAttribute('data-role', role);
      document.body.classList.add('role-' + role);
    }
    // Mostrar / ocultar bloques según rol
    document.querySelectorAll('[data-role-only]').forEach(function(el){
      var attr = (el.getAttribute('data-role-only') || '');
      var allowed = attr.split(',').map(function(s){ return s.trim().toLowerCase(); }).filter(Boolean);
      if(allowed.length && allowed.indexOf(role) === -1){
        el.setAttribute('hidden', 'hidden');
      }else{
        el.removeAttribute('hidden');
      }
    });
    // Etiqueta de rol si existe
    var label = document.querySelector('[data-role-label]');
    if(label){
      var map = {
        guest: 'Invitado',
        student: 'Estudiante',
        guardian: 'Apoderado/a',
        teacher: 'Docente',
        admin: 'Administrador'
      };
      label.textContent = map[role] || role;
    }
  }
  if(document.readyState !== 'loading') applyRoleVisibility();
  else document.addEventListener('DOMContentLoaded', applyRoleVisibility);
})();
