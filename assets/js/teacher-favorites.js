// assets/js/teacher-favorites.js
// Permite marcar cursos como favoritos en Mis cursos / OA (perfil docente).
// Los favoritos se guardan por docente usando su correo en la clave de localStorage.

(function () {
  const STORAGE_KEY_BASE = "peve-teacher-fav-courses";

  function getStorageKey() {
    try {
      const email = (sessionStorage.getItem("teacherEmail") || "").trim().toLowerCase();
      if (!email) return STORAGE_KEY_BASE;
      return STORAGE_KEY_BASE + "::" + email;
    } catch (e) {
      return STORAGE_KEY_BASE;
    }
  }

  function loadFavorites() {
    const key = getStorageKey();
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("[PEVE][teacher-favorites] No se pudieron leer favoritos:", e);
      return [];
    }
  }

  function saveFavorites(list) {
    const key = getStorageKey();
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      console.warn("[PEVE][teacher-favorites] No se pudieron guardar favoritos:", e);
    }
  }

  function applyState(cards, favorites) {
    const favSet = new Set(favorites);
    cards.forEach((card) => {
      const id = card.getAttribute("data-course-id");
      const btn = card.querySelector(".btn-fav");
      if (!id || !btn) return;

      const isFav = favSet.has(id);
      card.classList.toggle("is-favorite", isFav);
      btn.textContent = isFav ? "★ Favorito" : "⭐ Marcar como favorito";
    });
  }

  function reorderByFavorites(grid, cards, favorites) {
    const favSet = new Set(favorites);
    const sorted = [...cards].sort((a, b) => {
      const aFav = favSet.has(a.getAttribute("data-course-id"));
      const bFav = favSet.has(b.getAttribute("data-course-id"));
      if (aFav === bFav) return 0;
      return aFav ? -1 : 1; // favoritos primero
    });
    sorted.forEach((card) => grid.appendChild(card));
  }

  function initFavorites() {
    const cards = Array.from(
      document.querySelectorAll(".doc-course-card[data-course-id]")
    );
    if (!cards.length) return;

    const grids = new Set();
    cards.forEach((c) => {
      if (c.parentElement && c.parentElement.classList.contains("dashboard-grid")) {
        grids.add(c.parentElement);
      }
    });

    let favorites = loadFavorites();
    applyState(cards, favorites);

    grids.forEach((grid) => {
      const gridCards = cards.filter((c) => c.parentElement === grid);
      reorderByFavorites(grid, gridCards, favorites);
    });

    // Listeners
    cards.forEach((card) => {
      const btn = card.querySelector(".btn-fav");
      const id = card.getAttribute("data-course-id");
      if (!btn || !id) return;

      btn.addEventListener("click", () => {
        favorites = loadFavorites();
        const idx = favorites.indexOf(id);
        if (idx === -1) {
          favorites.push(id);
        } else {
          favorites.splice(idx, 1);
        }
        saveFavorites(favorites);
        applyState(cards, favorites);
        grids.forEach((grid) => {
          const gridCards = cards.filter((c) => c.parentElement === grid);
          reorderByFavorites(grid, gridCards, favorites);
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFavorites);
  } else {
    initFavorites();
  }
})();