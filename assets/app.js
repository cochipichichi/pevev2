
// Simple client-side 'auth' using localStorage (demo only)
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

const AUTH_KEY = "peve.session";
function setSession(user){ localStorage.setItem(AUTH_KEY, JSON.stringify(user)); }
function getSession(){ try { return JSON.parse(localStorage.getItem(AUTH_KEY)||"null"); } catch(e){ return null } }
function clearSession(){ localStorage.removeItem(AUTH_KEY); }

function fontDelta(delta){
  const size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fs")||"16");
  const newSize = Math.max(12, Math.min(22, size + delta));
  document.documentElement.style.setProperty("--fs", newSize+"px");
}
document.addEventListener("click", (e)=>{
  const t = e.target.closest("[data-action]"); if(!t) return;
  const a = t.dataset.action;
  if(a==="fs-inc"){ fontDelta(1); }
  if(a==="fs-dec"){ fontDelta(-1); }
  if(a==="logout"){ clearSession(); location.href="./"; }
});

// PWA
if("serviceWorker" in navigator){ navigator.serviceWorker.register("./service-worker.js"); }



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
