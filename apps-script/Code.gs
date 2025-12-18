/**
 * Plataforma Exámenes de Validación de Estudios — Backend (Google Apps Script)
 * Hoja de cálculo recomendada: "PEVE_Datos"
 * Pestañas usadas: quiz, ticket, users
 */

const ALLOWED_ORIGINS = [
  'http://localhost',
  'http://127.0.0.1',
  // Agrega aquí tu dominio productivo:
  'https://panchopinto.github.io',
  'https://educacioninmversiva.cl'
];

function _corsHeaders_() {
  const origin = (typeof e !== 'undefined' && e?.parameter?.origin) || '';
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function doOptions(e){
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(_corsHeaders_());
}

function doPost(e){
  const headers = _corsHeaders_();
  try{
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload || {};
    const ss = _open_();
    let out = {};

    if(action === 'quiz_submit'){
      const sh = _sheet_(ss, 'quiz', ['timestamp','userId','userName','course','module','score','max','q1','q2']);
      sh.appendRow([payload.timestamp, payload.userId, payload.userName, payload.course, payload.module, payload.score, payload.max, payload.q1, payload.q2]);
      out = {status:'ok'};
    }
    else if(action === 'ticket_submit'){
      const sh = _sheet_(ss, 'ticket', ['timestamp','userId','userName','course','module','learned','doubt','example']);
      sh.appendRow([payload.timestamp, payload.userId, payload.userName, payload.course, payload.module, payload.learned, payload.doubt, payload.example]);
      out = {status:'ok'};
    }
    else if(action === 'user_create'){
      const sh = _sheet_(ss, 'users', ['id','name','role','email']);
      const id = String(payload.id||'').trim();
      if(!id) throw new Error('Falta id');
      const values = sh.getDataRange().getValues();
      let updated = false;
      for(let i=1;i<values.length;i++){
        if(values[i][0]===id){
          sh.getRange(i+1,2).setValue(payload.name||'');
          sh.getRange(i+1,3).setValue(payload.role||'');
          sh.getRange(i+1,4).setValue(payload.email||'');
          updated = true; break;
        }
      }
      if(!updated){
        sh.appendRow([id, payload.name||'', payload.role||'', payload.email||'']);
      }
      out = {status:'ok', message: updated ? 'Usuario actualizado' : 'Usuario creado'};
    }
    else if(action === 'user_list'){
      const sh = _sheet_(ss, 'users', ['id','name','role','email']);
      const values = sh.getDataRange().getValues();
      const head = values.shift();
      const rows = values.map(r=>({id:r[0],name:r[1],role:r[2],email:r[3]}));
      out = {status:'ok', rows};
    }
    else {
      out = {status:'error', message:'Acción no soportada'};
    }

    return ContentService.createTextOutput(JSON.stringify(out))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }catch(err){
    const out = {status:'error', message:String(err)};
    return ContentService.createTextOutput(JSON.stringify(out))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

function _open_(){
  // Crea o abre la hoja "PEVE_Datos" en tu Google Drive
  const name = 'PEVE_Datos';
  const files = DriveApp.getFilesByName(name);
  if(files.hasNext()){
    const file = files.next();
    return SpreadsheetApp.open(file);
  }
  const ss = SpreadsheetApp.create(name);
  return ss;
}

function _sheet_(ss, name, headers){
  let sh = ss.getSheetByName(name);
  if(!sh){ sh = ss.insertSheet(name); sh.appendRow(headers); }
  return sh;
}


/** v1.2: Cursos, asignaciones, estadísticas, evidencias y PDF **/

function doPost(e){
  const headers = _corsHeaders_();
  try{
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload || {};
    const ss = _open_();
    let out = {};

    if(action === 'quiz_submit'){
      const sh = _sheet_(ss, 'quiz', ['timestamp','userId','userName','course','module','score','max','q1','q2']);
      sh.appendRow([payload.timestamp, payload.userId, payload.userName, payload.course, payload.module, payload.score, payload.max, payload.q1, payload.q2]);
      out = {status:'ok'};
    }
    else if(action === 'ticket_submit'){
      const sh = _sheet_(ss, 'ticket', ['timestamp','userId','userName','course','module','learned','doubt','example']);
      sh.appendRow([payload.timestamp, payload.userId, payload.userName, payload.course, payload.module, payload.learned, payload.doubt, payload.example]);
      out = {status:'ok'};
    }
    else if(action === 'user_create'){
      const sh = _sheet_(ss, 'users', ['id','name','role','email']);
      const id = String(payload.id||'').trim();
      if(!id) throw new Error('Falta id');
      const values = sh.getDataRange().getValues();
      let updated = false;
      for(let i=1;i<values.length;i++){
        if(values[i][0]===id){
          sh.getRange(i+1,2).setValue(payload.name||'');
          sh.getRange(i+1,3).setValue(payload.role||'');
          sh.getRange(i+1,4).setValue(payload.email||'');
          updated = true; break;
        }
      }
      if(!updated){
        sh.appendRow([id, payload.name||'', payload.role||'', payload.email||'']);
      }
      out = {status:'ok', message: updated ? 'Usuario actualizado' : 'Usuario creado'};
    }
    else if(action === 'user_list'){
      const sh = _sheet_(ss, 'users', ['id','name','role','email']);
      const rows = _rows_(sh, ['id','name','role','email']);
      out = {status:'ok', rows};
    }

    // ===== NUEVO: cursos =====
    else if(action === 'course_create'){
      const sh = _sheet_(ss, 'courses', ['id','name','oas']); // oas en CSV
      const id = String(payload.id||'').trim();
      const name = String(payload.name||'').trim();
      const oas = (payload.oas||[]).join(',');
      if(!id || !name) throw new Error('Falta id/name');
      // actualizar si existe
      const range = sh.getDataRange().getValues();
      let updated = false;
      for(let i=1;i<range.length;i++){
        if(range[i][0]===id){ sh.getRange(i+1,2).setValue(name); sh.getRange(i+1,3).setValue(oas); updated=true; break; }
      }
      if(!updated) sh.appendRow([id,name,oas]);
      out = {status:'ok', message: updated?'Curso actualizado':'Curso creado'};
    }
    else if(action === 'course_list'){
      const sh = _sheet_(ss, 'courses', ['id','name','oas']);
      const values = sh.getDataRange().getValues(); values.shift();
      const rows = values.map(r=>({id:r[0], name:r[1], oas:(String(r[2]||'').split(',').filter(Boolean))}));
      out = {status:'ok', rows};
    }

    // ===== NUEVO: asignación usuario-curso-OA =====
    else if(action === 'assign_course'){
      const sh = _sheet_(ss, 'assign', ['userId','courseId','oas']); // oas en CSV
      const values = sh.getDataRange().getValues();
      let updated = false;
      for(let i=1;i<values.length;i++){
        if(values[i][0]===payload.userId && values[i][1]===payload.courseId){
          sh.getRange(i+1,3).setValue((payload.oas||[]).join(','));
          updated = true; break;
        }
      }
      if(!updated){
        sh.appendRow([payload.userId, payload.courseId, (payload.oas||[]).join(',')]);
      }
      out = {status:'ok', message: updated ? 'Asignación actualizada' : 'Asignación creada'};
    }
    else if(action === 'assign_list'){
      const sh = _sheet_(ss, 'assign', ['userId','courseId','oas']);
      const values = sh.getDataRange().getValues(); values.shift();
      const rows = values.map(r=>({userId:r[0], courseId:r[1], oas:String(r[2]||'').split(',').filter(Boolean)}));
      out = {status:'ok', rows};
    }

    // ===== NUEVO: estadísticas =====
    else if(action === 'stats_by_course'){
      const courseId = payload.courseId;
      const quiz = _sheet_(ss, 'quiz', ['timestamp','userId','userName','course','module','score','max','q1','q2']).getDataRange().getValues(); quiz.shift();
      // Asumimos que module contiene algo como "OA2+OA6" o el OA explícito; haremos un conteo simple por módulo
      const oaStats = {};
      quiz.filter(r=>r[3]===courseId).forEach(r=>{
        const module = String(r[4]||'').trim();
        const parts = module.split('+').map(s=>s.trim()).filter(Boolean);
        const score = Number(r[5]||0); const max = Number(r[6]||1);
        parts.forEach(oa=>{
          if(!oaStats[oa]) oaStats[oa]={suma:0, intentos:0, max:0};
          oaStats[oa].suma += score; oaStats[oa].intentos += 1; oaStats[oa].max = Math.max(oaStats[oa].max, max);
        });
      });
      const rows = Object.keys(oaStats).map(oa=>({oa, intentos: oaStats[oa].intentos, promedio: (oaStats[oa].suma/(oaStats[oa].intentos||1)).toFixed(1)}));
      out = {status:'ok', rows};
    }
    else if(action === 'stats_by_student'){
      const userId = payload.userId;
      const quiz = _sheet_(ss, 'quiz', ['timestamp','userId','userName','course','module','score','max','q1','q2']).getDataRange().getValues(); quiz.shift();
      const agg = {};
      quiz.filter(r=>r[1]===userId).forEach(r=>{
        const course = r[3];
        const parts = String(r[4]||'').split('+').map(s=>s.trim()).filter(Boolean);
        const score = Number(r[5]||0);
        parts.forEach(oa=>{
          const key = course+'|'+oa;
          if(!agg[key]) agg[key]={courseId:course, oa, intentos:0, suma:0};
          agg[key].intentos+=1; agg[key].suma+=score;
        });
      });
      const rows = Object.keys(agg).map(k=>({courseId:agg[k].courseId, oa:agg[k].oa, intentos:agg[k].intentos, promedio:(agg[k].suma/agg[k].intentos).toFixed(1)}));
      out = {status:'ok', rows};
    }

    // ===== NUEVO: evidencias (subida base64 a Drive) =====
    else if(action === 'evidence_submit'){
      const folder = _evidenceFolder_();
      const blob = Utilities.newBlob(Utilities.base64Decode(payload.base64Data), payload.mimeType||'application/octet-stream', payload.filename||'evidencia');
      const file = folder.createFile(blob);
      file.setDescription(JSON.stringify(payload.meta||{}));
      out = {status:'ok', fileId:file.getId(), fileUrl:file.getUrl()};
    }

    // ===== NUEVO: export PDF (crear Doc desde HTML y exportar) =====
    else if(action === 'export_pdf'){
      const doc = DocumentApp.create(payload.docTitle || 'Reporte PEVE');
      doc.getBody().appendParagraph('Reporte generado por PEVE').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      doc.getBody().appendParagraph('Fecha: '+(new Date()));
      // Añadimos HTML básico como texto (Apps Script no pega HTML completo en Docs nativamente).
      doc.getBody().appendParagraph('Contenido:');
      doc.getBody().appendParagraph(String(payload.htmlBody||'').replace(/<[^>]+>/g,' '));
      doc.saveAndClose();
      const pdf = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
      const pdfFile = DriveApp.createFile(pdf).setName((payload.docTitle||'Reporte')+'.pdf');
      out = {status:'ok', pdfUrl: pdfFile.getUrl(), docUrl: 'https://docs.google.com/document/d/'+doc.getId()};
    }

    else {
      out = {status:'error', message:'Acción no soportada'};
    }

    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
  }catch(err){
    const out = {status:'error', message:String(err)};
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
  }
}

function _rows_(sh, keys){
  const values = sh.getDataRange().getValues(); values.shift();
  return values.map(r=>{
    const obj = {}; for(var i=0;i<keys.length;i++) obj[keys[i]] = r[i];
    return obj;
  });
}

function _evidenceFolder_(){
  const rootName = 'PEVE_Evidencias';
  const folders = DriveApp.getFoldersByName(rootName);
  if(folders.hasNext()) return folders.next();
  return DriveApp.createFolder(rootName);
}
