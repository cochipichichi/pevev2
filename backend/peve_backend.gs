
/**
 * Backend PEVE – Web App para exponer varias hojas como JSON.
 *
 * Hojas esperadas en el mismo Spreadsheet:
 *  - PEVE_Usuarios
 *  - PEVE_Resultados
 *  - DIA_Resultados
 *  - KPSI_Resultados
 *
 * Ejemplos de uso (GET):
 *  ?type=usuarios
 *  ?type=peve
 *  ?type=dia
 *  ?type=kpsi
 */

function doGet(e) {
  var type = (e && e.parameter && e.parameter.type) || 'usuarios';
  var callback = (e && e.parameter && e.parameter.callback) || '';

  var map = {
    usuarios: 'PEVE_Usuarios',
    peve: 'PEVE_Resultados',
    dia: 'DIA_Resultados',
    kpsi: 'KPSI_Resultados'
  };

  var sheetName = map[type] || 'PEVE_Usuarios';

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    var err = JSON.stringify({ error: 'Hoja no encontrada: ' + sheetName });
    return _output_(err, callback);
  }

  var data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) {
    return _output_(JSON.stringify([]), callback);
  }

  var headers = data.shift();
  var rows = data
    .filter(function (r) { return r.join('').trim() !== ''; })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });

  return _output_(JSON.stringify(rows), callback);
}

function _output_(json, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Menú simple para enviar credenciales desde la hoja PEVE_Usuarios.
 * (igual al que ya estás usando, puedes fusionarlo con este archivo).
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('PEVE Admin')
    .addItem('Enviar credenciales (fila activa)', 'enviarCredencialesFila')
    .addToUi();
}

function enviarCredencialesFila() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('PEVE_Usuarios');
  if (!sheet) {
    SpreadsheetApp.getUi().alert("No se encontró la hoja 'PEVE_Usuarios'.");
    return;
  }

  var row = sheet.getActiveRange().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert('Selecciona una fila con datos (no la cabecera).');
    return;
  }

  var values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var record = {};
  headers.forEach(function (h, i) {
    record[h] = values[i];
  });

  var correoEst = record['correo_institucional'];
  var password  = record['password_plataforma'];
  var nombreEst = (record['nombre_estudiante'] + ' ' + record['apellido_paterno'] + ' ' + record['apellido_materno']).trim();
  var correoApo = record['correo_apoderado'];
  var nombreApo = record['nombre_apoderado'];
  var llamado   = record['llamado'] || '';
  var curso     = record['curso_2025'] || '';

  if (!correoApo) {
    SpreadsheetApp.getUi().alert("La fila no tiene 'correo_apoderado'. Completa ese dato primero.");
    return;
  }

  var subject = 'Credenciales de acceso 📚PEVE – ' + nombreEst;
  var cuerpo = [
    'Estimada ' + (nombreApo || '') + ',',
    '',
    'Le compartimos las credenciales de acceso a la plataforma 📚PEVE para ' + nombreEst + ':',
    '',
    '• Curso 2025: ' + curso,
    '• Llamado: ' + llamado,
    '',
    'Correo institucional del estudiante: ' + correoEst,
    'Contraseña temporal PEVE: ' + password,
    '',
    'Link de ingreso: https://cochipichichi.github.io/pevev2/app/login.html',
    '',
    'Una vez que ingrese, le recomendamos cambiar la contraseña (esta opción estará disponible en la próxima versión de la plataforma).',
    '',
    'Atentamente,',
    'Equipo PEVE – Neotech EduLab / Liceo San Nicolás'
  ].join('\n');

  MailApp.sendEmail({
    to: correoApo,
    subject: subject,
    body: cuerpo
  });

  SpreadsheetApp.getUi().alert('Correo de credenciales enviado a: ' + correoApo);
}
