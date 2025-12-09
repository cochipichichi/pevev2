# Backend con Google Apps Script (Sheets)

Sigue estos pasos (10–12 min) para conectar **Quiz**, **Ticket** y **Admin** a Google Sheets:

1. Abre **script.google.com** y crea un **Proyecto nuevo**.
2. En **Code.gs**, pega el contenido de `apps-script/Code.gs` (incluido en este ZIP).
3. Guarda.
4. En **Servicios**, asegúrate que tienes acceso a **SpreadsheetApp** y **DriveApp** (vienen por defecto).
5. Menú **Publicar → Implementar como aplicación web**:
   - Descripción: `PEVE API`
   - **Ejecutar como:** Tu cuenta
   - **Quién tiene acceso:** Cualquiera con el enlace
   - Implementar → copia la **URL del Web App**.
6. En tu repo, edita `data/config.json` y reemplaza `scriptUrl` por esa URL.
7. Sube/actualiza tu sitio (GitHub Pages o tu hosting).
8. Prueba:
   - Abre `pages/quiz_bio1m.html`, responde y pulsa **Calcular** → debe decir “Guardado: ok”.
   - Abre `pages/ticket_bio1m.html`, completa y **Guardar** → alerta “Ticket guardado: ok”.
   - En `app/admin.html`: **Crear usuario** y luego **Listar usuarios** → deben aparecer filas.

## Hojas de cálculo
El script crea o usa un archivo **PEVE_Datos** en tu Google Drive con estas pestañas:
- `quiz`: respuestas de quizzes
- `ticket`: tickets de salida
- `users`: usuarios creados desde Admin

> Puedes renombrar la hoja, pero si lo haces, ajusta el código en `Code.gs`.

## Seguridad y CORS
- El ejemplo activa `Access-Control-Allow-Origin: *` para simplicidad.
- En producción, restringe a tu(s) dominio(s) en `ALLOWED_ORIGINS` y devuélvelos explícitamente.

## Timezone
- El cliente usa `"America/Santiago"`. Los `timestamp` van en ISO 8601 (UTC).
- En Google Sheets, configura **Archivo → Configuración → Zona horaria: Santiago (GMT-3)**.
