// assets/js/charts-mini.js
// Mini utilidades de gráficos sin dependencias externas (Canvas 2D).
// - drawBarChart(canvas, labels, values)
// - drawLineChart(canvas, labels, values)

(function () {
  function fitCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(10, Math.floor(rect.width));
    const h = Math.max(10, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function niceMax(v) {
    if (!isFinite(v) || v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return m * p;
  }

  function drawAxes(ctx, w, h, pad, yMax, ticks = 4) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Arial";

    for (let i = 0; i <= ticks; i++) {
      const y = pad.top + (h - pad.top - pad.bottom) * (i / ticks);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      const val = Math.round((yMax - (yMax * i) / ticks) * 100) / 100;
      ctx.fillText(String(val), 6, y + 4);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(pad.left, h - pad.bottom);
    ctx.lineTo(w - pad.right, h - pad.bottom);
    ctx.stroke();
    ctx.restore();
  }

  function clear(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
  }

  function drawBarChart(canvas, labels, values) {
    const { ctx, w, h } = fitCanvas(canvas);
    clear(ctx, w, h);

    const pad = { top: 18, right: 12, bottom: 32, left: 44 };
    const maxVal = niceMax(Math.max(...values.map(v => (isFinite(v) ? v : 0)), 1));
    drawAxes(ctx, w, h, pad, maxVal, 4);

    const innerW = w - pad.left - pad.right;
    const innerH = h - pad.top - pad.bottom;
    const n = Math.max(1, values.length);
    const gap = 8;
    const barW = Math.max(6, (innerW - gap * (n - 1)) / n);

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;

    for (let i = 0; i < n; i++) {
      const v = isFinite(values[i]) ? values[i] : 0;
      const x = pad.left + i * (barW + gap);
      const bh = (v / maxVal) * innerH;
      const y = pad.top + (innerH - bh);

      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, bh, 6);
      else ctx.rect(x, y, barW, bh);
      ctx.fill();
      ctx.stroke();

      const lab = String(labels[i] ?? "");
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      const lx = x + barW / 2;
      const ly = h - 12;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(-0.35);
      ctx.textAlign = "center";
      ctx.fillText(lab.length > 12 ? lab.slice(0, 12) + "…" : lab, 0, 0);
      ctx.restore();

      ctx.fillStyle = "rgba(255,255,255,0.78)";
    }
    ctx.restore();
  }

  function drawLineChart(canvas, labels, values) {
    const { ctx, w, h } = fitCanvas(canvas);
    clear(ctx, w, h);

    const pad = { top: 18, right: 12, bottom: 32, left: 44 };
    const maxVal = niceMax(Math.max(...values.map(v => (isFinite(v) ? v : 0)), 1));
    drawAxes(ctx, w, h, pad, maxVal, 4);

    const innerW = w - pad.left - pad.right;
    const innerH = h - pad.top - pad.bottom;
    const n = Math.max(1, values.length);

    function xy(i, v) {
      const x = pad.left + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
      const y = pad.top + (innerH - (v / maxVal) * innerH);
      return { x, y };
    }

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const v = isFinite(values[i]) ? values[i] : 0;
      const p = xy(i, v);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < n; i++) {
      const v = isFinite(values[i]) ? values[i] : 0;
      const p = xy(i, v);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    const step = Math.ceil(n / 6);
    for (let i = 0; i < n; i += step) {
      const lab = String(labels[i] ?? "");
      const p = xy(i, 0);
      ctx.textAlign = "center";
      ctx.fillText(lab.length > 12 ? lab.slice(0, 12) + "…" : lab, p.x, h - 12);
    }
    ctx.restore();
  }

  window.PEVE_CHARTS = { drawBarChart, drawLineChart };
})();
