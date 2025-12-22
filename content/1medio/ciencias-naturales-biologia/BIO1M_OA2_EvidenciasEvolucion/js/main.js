(function () {
    const root = document.documentElement;
    const body = document.body;
    let fontScale = 1;
    let lang = "es";

    function $(selector) {
        return document.querySelector(selector);
    }

    function onCtrlClick(action) {
        switch (action) {
            case "home":
                window.location.href = "index.html";
                break;
            case "theme":
                body.classList.toggle("theme-dark");
                break;
            case "font-inc":
                fontScale = Math.min(fontScale + 0.05, 1.4);
                body.style.fontSize = (16 * fontScale) + "px";
                break;
            case "font-dec":
                fontScale = Math.max(fontScale - 0.05, 0.8);
                body.style.fontSize = (16 * fontScale) + "px";
                break;
            case "tts":
                speakMain();
                break;
            case "lang":
                toggleLang();
                break;
            case "focus":
                body.classList.toggle("focus-mode");
                break;
            case "search":
                searchInPage();
                break;
        }
    }

    function speakMain() {
        const main = $("#main-content");
        if (!main || !("speechSynthesis" in window)) {
            alert("La lectura en voz alta no está disponible en este navegador.");
            return;
        }
        const text = main.innerText.trim();
        if (!text) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang === "es" ? "es-ES" : "en-US";
        window.speechSynthesis.speak(utter);
    }

    function toggleLang() {
        lang = lang === "es" ? "en" : "es";
        const msg = lang === "es"
            ? "Idioma establecido en Español (ES)."
            : "Language switched to English (EN). (Content is mainly in Spanish for now.)";
        console.log(msg);
        if (window.alert) {
            alert(msg);
        }
    }

    function searchInPage() {
        const term = prompt("🔍 ¿Qué palabra o concepto quieres buscar en esta página?");
        if (!term) return;
        const found = window.find && window.find(term, false, false, true, false, true, false);
        if (!found) {
            alert("No se encontraron coincidencias para: " + term);
        }
    }

    function setupControls() {
        document.querySelectorAll(".ctrl-btn[data-action]").forEach(btn => {
            btn.addEventListener("click", () => {
                const action = btn.getAttribute("data-action");
                onCtrlClick(action);
            });
        });
    }

    function setupEvalExport() {
        const btn = document.getElementById("btn-export-csv");
        const form = document.getElementById("eval-form");
        if (!btn || !form) return;

        btn.addEventListener("click", () => {
            const formData = new FormData(form);
            const entries = [];
            for (const [key, value] of formData.entries()) {
                entries.push([key, String(value).replace(/\n/g, " ")]);
            }
            if (!entries.length) {
                alert("No hay respuestas registradas aún.");
                return;
            }

            const header = "campo,respuesta";
            const rows = entries.map(([k, v]) => `"${k}","${v.replace(/"/g, '""')}"`);
            const csv = [header].concat(rows).join("\r\n");

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const nombre = formData.get("nombre") || "estudiante";
            a.download = `eval_OA2_evidencias_${nombre}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupControls();
        setupEvalExport();
    });
})();
