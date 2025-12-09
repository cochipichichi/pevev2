// Evidence module (v2.1) — drag&drop, preview, export to PDF (via print)
(function(){
  const dz = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const preview = document.getElementById('preview');
  const form = document.getElementById('evidence-form');
  const exportBtn = document.getElementById('export-pdf');

  if(!dz || !fileInput || !preview || !form || !exportBtn) return;

  const filesState = [];

  function addFiles(list){
    for(const f of list){
      filesState.push(f);
      const card = document.createElement('div');
      card.style.border = '1px solid rgba(255,255,255,.12)';
      card.style.borderRadius = '.7rem';
      card.style.padding = '.5rem';
      const name = document.createElement('div');
      name.textContent = f.name;
      name.style.fontWeight = '600';
      card.appendChild(name);
      if(f.type.startsWith('image/')){
        const img = document.createElement('img');
        img.alt = f.name; img.style.maxWidth='100%'; img.style.borderRadius='.5rem';
        const reader = new FileReader();
        reader.onload = e => img.src = e.target.result;
        reader.readAsDataURL(f);
        card.appendChild(img);
      }else{
        const p = document.createElement('p');
        p.textContent = 'Archivo PDF (no previsualizable aquí)';
        card.appendChild(p);
      }
      preview.appendChild(card);
    }
  }

  dz.addEventListener('dragover', (e)=>{ e.preventDefault(); dz.style.background='rgba(255,255,255,.05)'; });
  dz.addEventListener('dragleave', ()=> dz.style.background='transparent');
  dz.addEventListener('drop', (e)=>{
    e.preventDefault(); dz.style.background='transparent';
    if(e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', (e)=>{
    if(e.target.files?.length) addFiles(e.target.files);
  });

  function exportEvidencePDF(){
    const data = Object.fromEntries(new FormData(form).entries());
    const win = window.open('', '_blank');
    const imgs = [];
    const promises = filesState.map(f => new Promise(res=>{
      if(f.type.startsWith('image/')){
        const reader = new FileReader();
        reader.onload = e => { imgs.push(e.target.result); res(); };
        reader.readAsDataURL(f);
      } else { res(); }
    }));
    Promise.all(promises).then(()=>{
      const html = `<!doctype html>
      <html><head><meta charset="utf-8">
      <title>Reporte Evidencias</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;padding:24px;line-height:1.4;color:#111}
        h1{margin:0 0 8px 0}
        .meta{margin-bottom:16px}
        .img{page-break-inside:avoid;margin:8px 0}
        img{max-width:100%;border-radius:8px;border:1px solid #ddd}
        @media print {.no-print{display:none}}
      </style>
      </head><body>
      <h1>Reporte de Evidencias</h1>
      <div class="meta">
        <div><b>Curso:</b> ${data.course||'-'}</div>
        <div><b>Estudiante:</b> ${data.student||'-'}</div>
        <div><b>OA:</b> ${data.oa||'-'}</div>
        <div><b>Fecha:</b> ${data.date||'-'}</div>
      </div>
      <h3>Notas</h3>
      <p>${(data.notes||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</p>
      <h3>Archivos</h3>
      ${imgs.map(src => '<div class="img"><img src="'+src+'"></div>').join('')}
      <hr>
      <div class="no-print"><button onclick="window.print()">Imprimir / Guardar como PDF</button></div>
      </body></html>`;
      win.document.open(); win.document.write(html); win.document.close();
      try{ win.focus(); }catch(e){}
    });
  }

  exportBtn.addEventListener('click', exportEvidencePDF);
})();
