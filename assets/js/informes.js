// assets/js/informes.js
// Informes LIVE (PEVE + DIA + KPSI) desde Google Sheets vía Apps Script.
// Requiere: assets/js/config.js y assets/js/charts-mini.js

(function () {
  const doc = document;

  function $(sel) { return doc.querySelector(sel); }
  function $all(sel) { return Array.from(doc.querySelectorAll(sel)); }

  const NAME_KEYS = ["Nombre", "Estudiante", "Alumno", "Nombre Estudiante", "NOMBRE", "nombre", "Nombre completo", "Estudiante (Nombre)", "Apellidos y Nombres", "Nombre y Apellido"];
  const RUT_KEYS = ["RUT", "Rut", "rut", "RUN", "Run"];
  const CURSO_KEYS = ["Curso", "Nivel", "CURSO", "curso", "Curso 2025", "Curso/Nivel"];
  const ASIG_KEYS = ["Asignatura", "Materia", "Ramo", "RAMO", "asignatura", "Asignatura/Área", "Área"];
  const LLAMADO_KEYS = ["Llamado", "Convocatoria", "Periodo", "Período", "LLAMADO", "llamado", "Llamado/Periodo", "Año/Llamado", "Evaluación"];
  const FECHA_KEYS = ["Fecha", "fecha", "Timestamp", "Marca temporal", "Marca de tiempo", "Time", "Hora", "Registrado"];
  const PUNTAJE_KEYS = ["Puntaje", "Nota", "Resultado", "Score", "Puntaje PEVE", "PUNTAJE", "Calificación"];
  const AVANCE_KEYS = ["Avance", "Avance %", "Progreso", "% Avance", "Completado", "Completado?", "Avance completo", "Avance_Completo", "Terminado"];
  const DIA_ING_KEYS = ["DIA ingreso", "Ingreso DIA", "DIA_Ingreso", "DIA inicio", "DIA Inicial", "DIA Pre", "DIA Entrada"];
  const DIA_CIE_KEYS = ["DIA cierre", "Cierre DIA", "DIA_Cierre", "DIA fin", "DIA Salida"];
  const KPSI_INI_KEYS = ["KPSI inicio", "KPSI inicial", "KPSI_Inicio", "KPSI pre", "KPSI Entrada"];
  const KPSI_FIN_KEYS = ["KPSI fin", "KPSI final", "KPSI_Fin", "KPSI post", "KPSI Salida"];

  const PAGE_SIZE = 10;

  const UI = {
    scriptUrl: $("#script-url"),
    btnSaveScript: $("#btn-save-script"),
    scriptStatus: $("#script-status"),
    liveStatus: $("#live-status"),

    filterCurso: $("#filter-curso"),
    filterAsig: $("#filter-asignatura"),
    filterLlamado: $("#filter-llamado"),
    btnActualizar: $("#btn-actualizar"),

    kpiTotal: $("#kpi-total-estudiantes"),
    kpiAvance: $("#kpi-avance-completo"),
    kpiKpsi: $("#kpi-kpsi-mejora"),
    kpiPromPeve: $("#kpi-prom-peve"),
    kpiPromDia: $("#kpi-prom-dia-ingreso"),

    table: $("#tabla-informes"),
    tbody: $("#tabla-informes") ? $("#tabla-informes").querySelector("tbody") : null,
    pager: $("#table-pager"),
    btnExport: $("#btn-export-csv"),

    chartAsig: $("#chart-asignaturas"),
    chartTrend: $("#chart-trend"),
  };

  let DATA = { peve: [], dia: [], kpsi: [] };
  let state = { page: 1, lastRenderRows: [] };

  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg;
    if (kind) el.setAttribute("data-kind", kind);
  }

  function stripAccents(str) {
    return (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function normText(str) {
    return stripAccents(str).toLowerCase().trim().replace(/\s+/g, " ");
  }

  function findKey(row, candidates) {
    if (!row || typeof row !== "object") return null;
    const keys = Object.keys(row);
    const map = new Map(keys.map(k => [normText(k), k]));
    for (const c of candidates) {
      const k = map.get(normText(c));
      if (k) return k;
    }
    // fuzzy contains
    for (const c of candidates) {
      const cn = normText(c);
      for (const k of keys) {
        const kn = normText(k);
        if (kn === cn) return k;
        if (kn.includes(cn) || cn.includes(kn)) return k;
      }
    }
    return null;
  }

  function pick(row, candidates, fallback = "") {
    const k = findKey(row, candidates);
    if (!k) return fallback;
    return row[k] ?? fallback;
  }

  function toNumber(v) {
    if (v === null || v === undefined) return NaN;
    let s = String(v).trim();
    if (!s) return NaN;
    s = s.replace(",", ".").replace("%", "");
    const n = parseFloat(s);
    return isFinite(n) ? n : NaN;
  }

  function toDate(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    const s = String(v).trim();
    if (!s) return null;
    // try ISO or locale
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    // dd/mm/yyyy
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (m) {
      const dd = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10) - 1;
      const yy = parseInt(m[3], 10);
      const yyyy = yy < 100 ? 2000 + yy : yy;
      const d2 = new Date(yyyy, mm, dd);
      if (!isNaN(d2.getTime())) return d2;
    }
    return null;
  }

  function formatDate(d) {
    if (!d) return "—";
    try {
      return d.toLocaleDateString("es-CL");
    } catch (e) {
      return d.toISOString().slice(0, 10);
    }
  }

  function uniqBy(arr, keyFn) {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      const k = keyFn(x);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(x);
    }
    return out;
  }

  function buildRowIndex(rows, keyFn) {
    const idx = new Map();
    for (const r of rows) {
      const k = keyFn(r);
      if (!k) continue;
      if (!idx.has(k)) idx.set(k, []);
      idx.get(k).push(r);
    }
    return idx;
  }

  function jsonp(url, timeoutMs = 12000) {
    return new Promise((resolve, reject) => {
      const cb = "peve_cb_" + Math.random().toString(36).slice(2);
      const s = doc.createElement("script");
      const t = setTimeout(() => {
        cleanup();
        reject(new Error("JSONP timeout"));
      }, timeoutMs);

      function cleanup() {
        clearTimeout(t);
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (s && s.parentNode) s.parentNode.removeChild(s);
      }

      window[cb] = (data) => {
        cleanup();
        resolve(data);
      };

      const u = new URL(url, window.location.href);
      u.searchParams.set("callback", cb);
      s.src = u.toString();
      s.onerror = () => {
        cleanup();
        reject(new Error("JSONP error"));
      };
      doc.head.appendChild(s);
    });
  }

  async function fetchDataset(scriptUrl, type) {
    const u = new URL(scriptUrl, window.location.href);
    u.searchParams.set("type", type);
    u.searchParams.set("_", Date.now().toString());

    // 1) Fetch normal (si CORS lo permite)
    try {
      const res = await fetch(u.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      // 2) JSONP fallback (evita CORS)
      try {
        const data = await jsonp(u.toString());
        if (Array.isArray(data)) return data;
        return [];
      } catch (e2) {
        throw new Error("No se pudo cargar " + type + " (CORS/endpoint): " + (e2.message || e2));
      }
    }
  }

  function fillSelect(select, values, keepIfEmpty = true) {
    if (!select) return;
    const cur = select.value;
    const opts = uniqBy(values.filter(Boolean), v => normText(v));
    if (opts.length === 0 && keepIfEmpty) return;

    select.innerHTML = "";
    const all = doc.createElement("option");
    all.value = "__ALL__";
    all.textContent = "Todos";
    select.appendChild(all);

    opts.sort((a, b) => String(a).localeCompare(String(b), "es"));
    for (const v of opts) {
      const o = doc.createElement("option");
      o.value = v;
      o.textContent = v;
      select.appendChild(o);
    }

    // restore
    const found = Array.from(select.querySelectorAll("option")).some(o => o.value === cur);
    if (found) select.value = cur;
    else select.value = "__ALL__";
  }

  function getFilters() {
    const curso = UI.filterCurso ? UI.filterCurso.value : "__ALL__";
    const asig = UI.filterAsig ? UI.filterAsig.value : "__ALL__";
    const llamado = UI.filterLlamado ? UI.filterLlamado.value : "__ALL__";
    return { curso, asig, llamado };
  }

  function matchFilter(val, filterVal) {
    if (!filterVal || filterVal === "__ALL__") return true;
    return normText(val) === normText(filterVal);
  }

  function compute() {
    const f = getFilters();

    const peve = DATA.peve || [];
    const dia = DATA.dia || [];
    const kpsi = DATA.kpsi || [];

    const peveFiltered = peve.filter(r => {
      const curso = pick(r, CURSO_KEYS, "");
      const asig = pick(r, ASIG_KEYS, "");
      const llamado = pick(r, LLAMADO_KEYS, "");
      return matchFilter(curso, f.curso) && matchFilter(asig, f.asig) && matchFilter(llamado, f.llamado);
    });

    const students = uniqBy(peveFiltered.map(r => ({
      name: String(pick(r, NAME_KEYS, "Sin nombre")),
      rut: String(pick(r, RUT_KEYS, "")),
      curso: String(pick(r, CURSO_KEYS, "")),
      llamado: String(pick(r, LLAMADO_KEYS, "")),
    })), s => normText(s.rut || s.name));

    const diaIdx = buildRowIndex(dia, r => normText(pick(r, RUT_KEYS, "")) || normText(pick(r, NAME_KEYS, "")));
    const kpsiIdx = buildRowIndex(kpsi, r => normText(pick(r, RUT_KEYS, "")) || normText(pick(r, NAME_KEYS, "")));

    // group peve by student
    const peveIdx = buildRowIndex(peveFiltered, r => normText(pick(r, RUT_KEYS, "")) || normText(pick(r, NAME_KEYS, "")));

    const rows = students.map(s => {
      const key = normText(s.rut || s.name);
      const peveRows = peveIdx.get(key) || [];
      const diaRows = diaIdx.get(key) || [];
      const kpsiRows = kpsiIdx.get(key) || [];

      const scores = peveRows.map(r => toNumber(pick(r, PUNTAJE_KEYS, ""))).filter(n => isFinite(n));
      const scoreAvg = scores.length ? (scores.reduce((a,b)=>a+b,0) / scores.length) : NaN;

      const avances = peveRows.map(r => {
        const v = pick(r, AVANCE_KEYS, "");
        const n = toNumber(v);
        if (isFinite(n)) return n;
        const t = normText(v);
        if (["si","sí","true","ok","completo","completado","terminado"].includes(t)) return 100;
        if (["no","false","pendiente"].includes(t)) return 0;
        return NaN;
      }).filter(n => isFinite(n));
      const avanceAvg = avances.length ? (avances.reduce((a,b)=>a+b,0) / avances.length) : NaN;

      const diaRow = diaRows[0] || null;
      const diaIng = diaRow ? toNumber(pick(diaRow, DIA_ING_KEYS, pick(diaRow, PUNTAJE_KEYS, ""))) : NaN;
      const diaCie = diaRow ? toNumber(pick(diaRow, DIA_CIE_KEYS, "")) : NaN;

      const kpsiRow = kpsiRows[0] || null;
      const kpsiIni = kpsiRow ? toNumber(pick(kpsiRow, KPSI_INI_KEYS, "")) : NaN;
      const kpsiFin = kpsiRow ? toNumber(pick(kpsiRow, KPSI_FIN_KEYS, "")) : NaN;

      // alertas
      const alerts = [];
      if (!isFinite(avanceAvg)) alerts.push("⚠️ Sin avance");
      else if (avanceAvg < 70) alerts.push("⚠️ Avance bajo");
      if (isFinite(scoreAvg) && scoreAvg > 0) {
        // heurística: nota chilena 1-7 o puntaje 0-100
        if (scoreAvg <= 7 && scoreAvg < 4.0) alerts.push("⚠️ PEVE bajo");
        if (scoreAvg > 7 && scoreAvg < 60) alerts.push("⚠️ PEVE bajo");
      }
      if (!diaRow) alerts.push("⏳ Falta DIA");
      if (!kpsiRow) alerts.push("⏳ Falta KPSI");
      if (isFinite(kpsiIni) && isFinite(kpsiFin) && kpsiFin + 0.01 < kpsiIni) alerts.push("⚠️ KPSI baja");

      // fecha (último registro peve)
      const dates = peveRows.map(r => toDate(pick(r, FECHA_KEYS, ""))).filter(Boolean).sort((a,b)=>b-a);
      const lastDate = dates[0] || null;

      return {
        name: s.name,
        rut: s.rut,
        curso: s.curso,
        llamado: s.llamado,
        fecha: lastDate,
        avance: avanceAvg,
        peveAvg: scoreAvg,
        diaIng,
        diaCie,
        kpsiIni,
        kpsiFin,
        alerts,
      };
    });

    // KPIs
    const total = rows.length;
    const avanceOk = rows.filter(r => isFinite(r.avance) && r.avance >= 95).length;
    const kpsiMejora = rows.filter(r => isFinite(r.kpsiIni) && isFinite(r.kpsiFin) && r.kpsiFin > r.kpsiIni).length;
    const peveProm = rows.map(r => r.peveAvg).filter(n => isFinite(n)).reduce((a,b)=>a+b,0);
    const peveCnt = rows.map(r => r.peveAvg).filter(n => isFinite(n)).length;
    const diaProm = rows.map(r => r.diaIng).filter(n => isFinite(n)).reduce((a,b)=>a+b,0);
    const diaCnt = rows.map(r => r.diaIng).filter(n => isFinite(n)).length;

    return {
      rows,
      kpis: {
        total,
        avancePct: total ? Math.round((avanceOk/total)*100) : 0,
        kpsiPct: total ? Math.round((kpsiMejora/total)*100) : 0,
        peveAvg: peveCnt ? (peveProm/peveCnt) : NaN,
        diaIngAvg: diaCnt ? (diaProm/diaCnt) : NaN
      }
    };
  }

  function renderKPIs(kpis) {
    if (UI.kpiTotal) UI.kpiTotal.textContent = String(kpis.total);
    if (UI.kpiAvance) UI.kpiAvance.textContent = String(kpis.avancePct) + " %";
    if (UI.kpiKpsi) UI.kpiKpsi.textContent = String(kpis.kpsiPct) + " %";
    if (UI.kpiPromPeve) UI.kpiPromPeve.textContent = isFinite(kpis.peveAvg) ? kpis.peveAvg.toFixed(1).replace(".", ",") : "—";
    if (UI.kpiPromDia) UI.kpiPromDia.textContent = isFinite(kpis.diaIngAvg) ? kpis.diaIngAvg.toFixed(1).replace(".", ",") : "—";
  }

  function makeBtn(label, onClick) {
    const b = doc.createElement("button");
    b.type = "button";
    b.className = "btn small";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function openReport(row) {
    const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Informe · ${escapeHtml(row.name)}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:24px;line-height:1.4;}
  h1{margin:0 0 10px;}
  .meta{opacity:.75;margin-bottom:18px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .card{border:1px solid #ddd;border-radius:12px;padding:12px;}
  .muted{opacity:.75;}
  @media print { .noprint{display:none;} body{margin:12mm;} }
</style>
</head><body>
  <div class="noprint" style="margin-bottom:10px;">
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>
  <h1>Informe PEVE · DIA · KPSI</h1>
  <div class="meta">${new Date().toLocaleString("es-CL")} · Estudiante: <strong>${escapeHtml(row.name)}</strong></div>

  <div class="grid">
    <div class="card">
      <h3>PEVE</h3>
      <p><strong>Curso:</strong> ${escapeHtml(row.curso || "—")}</p>
      <p><strong>Llamado:</strong> ${escapeHtml(row.llamado || "—")}</p>
      <p><strong>Última fecha:</strong> ${escapeHtml(formatDate(row.fecha))}</p>
      <p><strong>Avance:</strong> ${isFinite(row.avance) ? row.avance.toFixed(0)+" %" : "—"}</p>
      <p><strong>Promedio:</strong> ${isFinite(row.peveAvg) ? row.peveAvg.toFixed(1).replace(".", ",") : "—"}</p>
    </div>
    <div class="card">
      <h3>DIA / KPSI</h3>
      <p><strong>DIA ingreso:</strong> ${isFinite(row.diaIng) ? row.diaIng.toFixed(1).replace(".", ",") : "—"}</p>
      <p><strong>DIA cierre:</strong> ${isFinite(row.diaCie) ? row.diaCie.toFixed(1).replace(".", ",") : "—"}</p>
      <p><strong>KPSI inicio:</strong> ${isFinite(row.kpsiIni) ? row.kpsiIni.toFixed(1).replace(".", ",") : "—"}</p>
      <p><strong>KPSI fin:</strong> ${isFinite(row.kpsiFin) ? row.kpsiFin.toFixed(1).replace(".", ",") : "—"}</p>
    </div>
  </div>

  <div class="card" style="margin-top:12px;">
    <h3>Alertas</h3>
    ${
      row.alerts && row.alerts.length
        ? "<ul>" + row.alerts.map(a => "<li>"+escapeHtml(a)+"</li>").join("") + "</ul>"
        : "<p class='muted'>Sin alertas.</p>"
    }
  </div>

  <p class="muted" style="margin-top:14px;">
    Nota: Este informe es generado automáticamente desde el panel de Informes PEVE.
  </p>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderTable(rows) {
    if (!UI.tbody) return;

    state.lastRenderRows = rows.slice();

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);

    const start = (state.page - 1) * PAGE_SIZE;
    const pageRows = rows.slice(start, start + PAGE_SIZE);

    UI.tbody.innerHTML = "";

    if (pageRows.length === 0) {
      const tr = doc.createElement("tr");
      const td = doc.createElement("td");
      td.colSpan = 10;
      td.textContent = "Sin resultados para los filtros seleccionados.";
      td.style.opacity = "0.8";
      tr.appendChild(td);
      UI.tbody.appendChild(tr);
      renderPager(rows.length, totalPages);
      return;
    }

    for (const r of pageRows) {
      const tr = doc.createElement("tr");

      const tds = [
        r.name,
        r.curso || "—",
        r.llamado || "—",
        isFinite(r.peveAvg) ? r.peveAvg.toFixed(1).replace(".", ",") : "—",
        isFinite(r.diaIng) ? r.diaIng.toFixed(1).replace(".", ",") : "—",
        isFinite(r.diaCie) ? r.diaCie.toFixed(1).replace(".", ",") : "—",
        isFinite(r.kpsiIni) ? r.kpsiIni.toFixed(1).replace(".", ",") : "—",
        isFinite(r.kpsiFin) ? r.kpsiFin.toFixed(1).replace(".", ",") : "—",
        r.alerts && r.alerts.length ? r.alerts.join(" · ") : "—",
      ];

      for (const txt of tds) {
        const td = doc.createElement("td");
        td.textContent = String(txt);
        tr.appendChild(td);
      }

      const tdAction = doc.createElement("td");
      const btn = makeBtn("📄 PDF", () => openReport(r));
      tdAction.appendChild(btn);
      tr.appendChild(tdAction);

      UI.tbody.appendChild(tr);
    }

    renderPager(rows.length, totalPages);
  }

  function renderPager(totalRows, totalPages) {
    if (!UI.pager) return;
    UI.pager.innerHTML = "";

    const left = doc.createElement("div");
    left.className = "pager-label";
    left.textContent = `Página ${state.page} / ${totalPages} · ${totalRows} registro(s)`;
    UI.pager.appendChild(left);

    const controls = doc.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "8px";

    const prev = makeBtn("◀", () => { state.page = Math.max(1, state.page - 1); renderAll(); });
    const next = makeBtn("▶", () => { state.page = Math.min(totalPages, state.page + 1); renderAll(); });

    prev.disabled = state.page <= 1;
    next.disabled = state.page >= totalPages;

    controls.appendChild(prev);
    controls.appendChild(next);
    UI.pager.appendChild(controls);
  }

  function renderCharts(allRows) {
    if (!window.PEVE_CHARTS) return;

    // Asignaturas: promedio o cantidad por asignatura según dataset PEVE global (no filtrado por asig)
    const f = getFilters();
    const peve = DATA.peve || [];
    const peveByAsig = new Map();

    for (const r of peve) {
      const curso = pick(r, CURSO_KEYS, "");
      const llamado = pick(r, LLAMADO_KEYS, "");
      const asig = pick(r, ASIG_KEYS, "");
      if (!matchFilter(curso, f.curso)) continue;
      if (!matchFilter(llamado, f.llamado)) continue;
      const sc = toNumber(pick(r, PUNTAJE_KEYS, ""));
      if (!peveByAsig.has(asig)) peveByAsig.set(asig, []);
      if (isFinite(sc)) peveByAsig.get(asig).push(sc);
    }

    const labels = Array.from(peveByAsig.keys()).filter(Boolean).slice(0, 12);
    const values = labels.map(a => {
      const arr = peveByAsig.get(a) || [];
      if (!arr.length) return 0;
      return arr.reduce((x,y)=>x+y,0) / arr.length;
    });

    if (UI.chartAsig && labels.length) {
      window.PEVE_CHARTS.drawBarChart(UI.chartAsig, labels, values);
    }

    // Trend: por fecha (mes) promedio PEVE (filtrado)
    const trend = new Map();
    for (const r of allRows) {
      if (!r.fecha || !isFinite(r.peveAvg)) continue;
      const key = r.fecha.getFullYear() + "-" + String(r.fecha.getMonth()+1).padStart(2,"0");
      if (!trend.has(key)) trend.set(key, []);
      trend.get(key).push(r.peveAvg);
    }
    const tLabels = Array.from(trend.keys()).sort();
    const tValues = tLabels.map(k => {
      const arr = trend.get(k) || [];
      return arr.reduce((a,b)=>a+b,0) / Math.max(1, arr.length);
    });

    if (UI.chartTrend && tLabels.length) {
      window.PEVE_CHARTS.drawLineChart(UI.chartTrend, tLabels, tValues);
    }
  }

  function renderAll() {
    const out = compute();
    renderKPIs(out.kpis);
    renderTable(out.rows);
    renderCharts(out.rows);
  }

  function exportCSV() {
    const rows = state.lastRenderRows || [];
    const headers = ["Nombre","Curso","Llamado","PEVE Promedio","DIA Ingreso","DIA Cierre","KPSI Inicio","KPSI Fin","Alertas"];
    const lines = [headers.join(",")];

    function esc(v) {
      const s = String(v ?? "");
      if (/[,"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }

    for (const r of rows) {
      lines.push([
        esc(r.name),
        esc(r.curso || ""),
        esc(r.llamado || ""),
        esc(isFinite(r.peveAvg) ? r.peveAvg.toFixed(1).replace(".", ",") : ""),
        esc(isFinite(r.diaIng) ? r.diaIng.toFixed(1).replace(".", ",") : ""),
        esc(isFinite(r.diaCie) ? r.diaCie.toFixed(1).replace(".", ",") : ""),
        esc(isFinite(r.kpsiIni) ? r.kpsiIni.toFixed(1).replace(".", ",") : ""),
        esc(isFinite(r.kpsiFin) ? r.kpsiFin.toFixed(1).replace(".", ",") : ""),
        esc(r.alerts && r.alerts.length ? r.alerts.join(" | ") : "")
      ].join(","));
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = doc.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "informes_peve_dia_kpsi.csv";
    doc.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function loadAndRender() {
    if (!window.PEVE_CONFIG) {
      setStatus(UI.liveStatus, "Falta PEVE_CONFIG (assets/js/config.js).", "error");
      return;
    }
    const scriptUrl = await window.PEVE_CONFIG.getScriptUrl();

    if (!scriptUrl) {
      setStatus(UI.liveStatus, "Configura el endpoint /exec para cargar datos reales.", "info");
      return;
    }

    setStatus(UI.liveStatus, "Cargando datos desde Sheets…", "info");

    try {
      const [peve, dia, kpsi] = await Promise.all([
        fetchDataset(scriptUrl, "peve"),
        fetchDataset(scriptUrl, "dia"),
        fetchDataset(scriptUrl, "kpsi"),
      ]);

      DATA = { peve: peve || [], dia: dia || [], kpsi: kpsi || [] };

      // llenar filtros desde dataset (si hay)
      const cursos = uniqBy((DATA.peve || []).map(r => String(pick(r, CURSO_KEYS, "")).trim()).filter(Boolean), x => normText(x));
      const asigs = uniqBy((DATA.peve || []).map(r => String(pick(r, ASIG_KEYS, "")).trim()).filter(Boolean), x => normText(x));
      const llamados = uniqBy((DATA.peve || []).map(r => String(pick(r, LLAMADO_KEYS, "")).trim()).filter(Boolean), x => normText(x));

      if (cursos.length) fillSelect(UI.filterCurso, cursos);
      if (asigs.length) fillSelect(UI.filterAsig, asigs);
      if (llamados.length) fillSelect(UI.filterLlamado, llamados);

      state.page = 1;
      renderAll();
      setStatus(UI.liveStatus, `Listo: PEVE=${DATA.peve.length} · DIA=${DATA.dia.length} · KPSI=${DATA.kpsi.length}`, "ok");
    } catch (e) {
      setStatus(UI.liveStatus, (e && e.message) ? e.message : "Error al cargar datasets.", "error");
    }
  }

  function bindEvents() {
    if (UI.btnSaveScript && UI.scriptUrl) {
      UI.btnSaveScript.addEventListener("click", async () => {
        const v = window.PEVE_CONFIG.setScriptUrl(UI.scriptUrl.value);
        if (v) setStatus(UI.scriptStatus, "Guardado en este navegador.", "ok");
        else setStatus(UI.scriptStatus, "Se limpió el endpoint.", "info");
        await loadAndRender();
      });
    }

    if (UI.btnActualizar) {
      UI.btnActualizar.addEventListener("click", (ev) => {
        ev.preventDefault();
        state.page = 1;
        renderAll();
      });
    }

    if (UI.filterCurso) UI.filterCurso.addEventListener("change", () => { state.page = 1; renderAll(); });
    if (UI.filterAsig) UI.filterAsig.addEventListener("change", () => { state.page = 1; renderAll(); });
    if (UI.filterLlamado) UI.filterLlamado.addEventListener("change", () => { state.page = 1; renderAll(); });

    if (UI.btnExport) UI.btnExport.addEventListener("click", exportCSV);
  }

  async function init() {
    if (!UI.table) return;
    if (!window.PEVE_CONFIG) return;

    await window.PEVE_CONFIG.loadConfig();

    const scriptUrl = await window.PEVE_CONFIG.getScriptUrl();
    if (UI.scriptUrl && scriptUrl) UI.scriptUrl.value = scriptUrl;
    setStatus(UI.scriptStatus, scriptUrl ? "Endpoint detectado (config/localStorage)." : "Sin endpoint configurado.", scriptUrl ? "ok" : "info");

    bindEvents();

    // Auto load si ya existe endpoint
    if (scriptUrl) await loadAndRender();
    else renderAll();
  }

  doc.addEventListener("DOMContentLoaded", init);
})();
