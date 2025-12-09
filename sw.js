// Service Worker placeholder para PEVE.
// Puedes ampliar esto para cachear assets y permitir uso offline.
self.addEventListener("install", (event) => {
  console.log("PEVE service worker instalado.");
});

self.addEventListener("activate", (event) => {
  console.log("PEVE service worker activado.");
});

self.addEventListener("fetch", (event) => {
  // Estrategia básica: pasar las solicitudes directamente a la red.
});
