

function peveWarn(msg){
  let bar = document.getElementById('peve-warn');
  if(!bar){
    bar = document.createElement('div'); bar.id='peve-warn';
    bar.style.cssText='position:fixed;left:0;right:0;top:0;padding:10px 14px;background:#ff7043;color:#fff;z-index:9999;font-weight:600;text-align:center';
    document.body.appendChild(bar);
  }
  bar.textContent = msg;
}

async function peveConfig(){
  if(!window.__peve_cfg){
    window.__peve_cfg = await fetch("./data/config.json").then(r=>r.json()).catch(()=>({scriptUrl:null, timezone:'America/Santiago'}));
  }
  if(!window.__peve_cfg.scriptUrl || /REEMPLAZA_CON_TU_WEBAPP_ID/.test(window.__peve_cfg.scriptUrl)){ peveWarn('Configura data/config.json → scriptUrl para habilitar envíos y dashboard'); } return window.__peve_cfg;
}
async function pevePost(action, payload){
  const cfg = await peveConfig();
  if(!cfg.scriptUrl){ throw new Error('Falta configurar data/config.json -> scriptUrl'); }
  const res = await fetch(cfg.scriptUrl, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({action, payload})
  });
  if(!res.ok){ throw new Error('HTTP '+res.status); }
  return await res.json();
}
window.PEVE_API = { peveConfig, pevePost };

async function peveUploadEvidence(filename, mimeType, base64Data, meta){
  return PEVE_API.pevePost('evidence_submit', { filename, mimeType, base64Data, meta });
}
async function peveCreateCourse(course){
  return PEVE_API.pevePost('course_create', course);
}
async function peveListCourses(){
  return PEVE_API.pevePost('course_list', {});
}
async function peveAssignCourse(assign){
  // assign: {userId, courseId, oas: ['OA2','OA4']}
  return PEVE_API.pevePost('assign_course', assign);
}
async function peveListAssignments(filter){
  // filter (optional): {userId, courseId}
  return PEVE_API.pevePost('assign_list', filter||{});
}
async function peveStatsByCourse(courseId){
  return PEVE_API.pevePost('stats_by_course', {courseId});
}
async function peveStatsByStudent(userId){
  return PEVE_API.pevePost('stats_by_student', {userId});
}
async function peveExportPDF(docTitle, htmlBody){
  // Crea un Google Doc y lo exporta a PDF; retorna {status, pdfUrl, docUrl}
  return PEVE_API.pevePost('export_pdf', {docTitle, htmlBody});
}
window.PEVE_ADMIN = { peveUploadEvidence, peveCreateCourse, peveListCourses, peveAssignCourse, peveListAssignments, peveStatsByCourse, peveStatsByStudent, peveExportPDF };
