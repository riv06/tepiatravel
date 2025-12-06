const app = document.getElementById("app");

// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// Bandera para evitar navegación concurrente
let isNavigating = false;

/* ==========================
   GESTIÓN DE SESIÓN
   ========================== */
function updateAuthUI() {
  const authToken = localStorage.getItem('authToken');
  const userEmail = localStorage.getItem('userEmail');
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const userEmailSpan = document.getElementById('user-email');

  if (authToken && userEmail) {
    // Mostrar menú de usuario
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    userEmailSpan.textContent = userEmail;
  } else {
    // Mostrar botones de login/registro
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

function setUserLoggedIn(email) {
  localStorage.setItem('userEmail', email);
  updateAuthUI();
}

function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userFullName');
  updateAuthUI();
}

// Actualiza la variable CSS --header-height usando la altura real del header
function updateHeaderHeight() {
  const headerEl = document.querySelector('.main-header');
  if (!headerEl) return;
  const h = headerEl.offsetHeight + 'px';
  document.documentElement.style.setProperty('--header-height', h);
}

// Actualizar al redimensionar para soportar cambios responsive
window.addEventListener('resize', () => {
  updateHeaderHeight();
});

export async function loadSection(page, css) {
  // Transición suave
  app.style.opacity = "0";

  // Remover CSS previo si es distinto
  const existingLink = document.getElementById("section-style");
  if (!existingLink || existingLink.href !== new URL(css, location.href).href) {
    if (existingLink) existingLink.remove();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = css;
    link.id = "section-style";
    document.head.appendChild(link);
  }

  // Cargar HTML (con manejo de errores)
  let html = "";
  try {
    const res = await fetch(page);
    if (!res.ok) {
      app.innerHTML = `<div class="load-error"><p>Error ${res.status} al cargar la sección.</p></div>`;
      return;
    }
    html = await res.text();
    app.innerHTML = html;
  } catch (err) {
    console.error("Error al hacer fetch de la sección:", err);
    app.innerHTML = `<div class="load-error"><p>Error al cargar la sección. Intenta de nuevo más tarde.</p></div>`;
    return;
  }

  // Intentar cargar JS propio de la sección (opcional)
  try {
    const sectionName = page.split("/").pop().replace(".html", ".js");
    const sectionJS = await import(`./${sectionName}`);
    if (sectionJS.init) sectionJS.init();
  } catch (e) {
    // Módulos se consideran opcionales; evitar stacktrace largo en consola
    console.info("Módulo de sección no encontrado o fallo en import (opcional):", e?.message || "");
  }

  setupSectionNavigation();
  updateActiveNav(page);
  insertFooter(page);

  // Suavizar aparición
  setTimeout(() => {
    app.style.transition = "opacity 0.6s ease";
    app.style.opacity = "1";
  }, 50);
}

/* ==========================
   ROUTER CENTRAL (hash-based para GitHub Pages)
   ========================== */
const ROUTES = {
  "btn-home": { page: "pages/main.html", css: "style-pages/main.css", hash: "", title: "TepiaTravel - Inicio" },
  "btn-reserva": { page: "pages/reserva.html", css: "style-pages/reserva.css", hash: "reserva", title: "TepiaTravel - Reservar" },
  "btn-rutas": { page: "pages/rutas.html", css: "style-pages/rutas.css", hash: "rutas", title: "TepiaTravel - Rutas" },
  "btn-login": { page: "pages/inicio_sesion.html", css: "style-pages/inicio_sesion.css", hash: "login", title: "TepiaTravel - Iniciar sesión" },
  "btn-contacto": { page: "pages/contacto.html", css: "style-pages/contacto.css", hash: "contacto", title: "TepiaTravel - Contacto" },
  "btn-register": { page: "pages/registro.html", css: "style-pages/registro.css", hash: "registro", title: "TepiaTravel - Registro" },
  "btn-open-login": { page: "pages/inicio_sesion.html", css: "style-pages/inicio_sesion.css", hash: "login", title: "TepiaTravel - Iniciar sesión" },
  // botones internos que queremos mapear por id
  "btn-reserva-main": { page: "pages/reserva.html", css: "style-pages/reserva.css", hash: "reserva", title: "TepiaTravel - Reservar" },
  "btn-home-section": { page: "pages/main.html", css: "style-pages/main.css", hash: "", title: "TepiaTravel - Inicio" }
};

// Resolver ruta desde hash (#contacto, #reserva, etc.)
function routeFromHash(hash) {
  const cleanHash = hash.replace(/^#\/?/, ''); // elimina #/ o #
  for (const id in ROUTES) {
    if (ROUTES[id].hash === cleanHash) return { id, ...ROUTES[id] };
  }
  return null;
}

async function navigateTo(id, opts = { updateHash: true }) {
  // Evitar navegación concurrente
  if (isNavigating) return false;
  isNavigating = true;

  try {
    const route = ROUTES[id];
    if (!route) return null;

    await loadSection(route.page, route.css);

    // actualizar título
    if (route.title) document.title = route.title;

    // actualizar hash en URL si se solicita (compatible con GitHub Pages)
    if (opts.updateHash) {
      window.location.hash = route.hash ? `#${route.hash}` : '#';
    }

    return true;
  } finally {
    isNavigating = false;
  }
}

/* ==========================
   BOTONES INTERNOS DE SECCIONES
   ========================== */
function setupSectionNavigation() {
  // Botón "Reservar ahora" en main
  const btnReservaMain = document.getElementById("btn-reserva-main");
  if (btnReservaMain) {
    btnReservaMain.addEventListener("click", async (e) => {
      e.preventDefault();
      await navigateTo("btn-reserva", { updateHash: true });
    });
  }

  // Botón "Volver al inicio"
  const btnHomeSection = document.getElementById("btn-home-section");
  if (btnHomeSection) {
    btnHomeSection.addEventListener("click", async (e) => {
      e.preventDefault();
      await navigateTo("btn-home", { updateHash: true });
    });
  }

  // Botón "Registrar" desde la página de login → va a registro
  const btnRegister = document.getElementById("btn-register");
  if (btnRegister) {
    btnRegister.addEventListener("click", async (e) => {
      e.preventDefault();
      await navigateTo("btn-register", { updateHash: true });
    });
  }

  // Botón local en registro para abrir login (evita usar el header id)
  const btnOpenLogin = document.getElementById("btn-open-login");
  if (btnOpenLogin) {
    btnOpenLogin.addEventListener("click", async (e) => {
      e.preventDefault();
      await navigateTo("btn-open-login", { updateHash: true });
    });
  }
}

/* ==========================
   MARCAR LINK ACTIVO DEL HEADER
   ========================== */
function updateActiveNav(page) {
  const homeLink = document.getElementById("btn-home");
  const reservaLink = document.getElementById("btn-reserva");
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");

  if (!homeLink || !reservaLink) return;

  // Remover active de todos
  homeLink.classList.remove("active");
  reservaLink.classList.remove("active");
  if (btnLogin) btnLogin.classList.remove("active");
  if (btnRegister) btnRegister.classList.remove("active");

  // Agregar active según página
  if (page.includes("main.html")) homeLink.classList.add("active");
  if (page.includes("reserva.html")) reservaLink.classList.add("active");
  if (page.includes("inicio_sesion.html") && btnLogin) btnLogin.classList.add("active");
  if (page.includes("registro.html") && btnRegister) btnRegister.classList.add("active");
}

/* ==========================
   LISTENER GLOBAL DEL HEADER
   ========================== */
// Listener global del header y links que delega en el router central
document.addEventListener("click", async (e) => {
  const target = e.target;
  if (!target || !target.id) return;

  // si el id corresponde a una ruta conocida, navegar mediante router
  const known = ["btn-home", "btn-reserva", "btn-rutas", "btn-login", "btn-contacto", "btn-register", "btn-open-login", "btn-logout"];
  if (known.includes(target.id)) {
    e.preventDefault();

    // Manejo especial de logout
    if (target.id === "btn-logout") {
      logoutUser();
      await navigateTo("btn-home", { updateHash: true });
      return;
    }

    await navigateTo(target.id, { updateHash: true });
  }
});

/* ==========================
   INICIALIZAR SPA
   ========================== */
async function initApp() {
  // Establecer offset inicial del header para que el contenido no quede oculto
  updateHeaderHeight();

  // Actualizar UI de autenticación al iniciar
  updateAuthUI();

  // Si ya hay un hash en la URL (p. ej. #reserva), cargar esa sección directamente
  const currentRoute = routeFromHash(window.location.hash);
  if (currentRoute && window.location.hash && window.location.hash !== '#') {
    await navigateTo(currentRoute.id, { updateHash: false });
    return;
  }

  // Flujo normal con intro y luego main
  await loadSection("pages/intro.html", "style-pages/intro.css");

  const intro = document.getElementById("intro");
  setTimeout(async () => {
    if (!intro) return;
    intro.style.transition = "opacity 1s ease";
    intro.style.opacity = "0";

    setTimeout(async () => {
      await loadSection("pages/main.html", "style-pages/main.css");
      // establecer hash a inicio (sin duplicar si ya está)
      if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#';
      }
    }, 1000);
  }, 3500);
}

// Manejar cambios de hash en URL (para back/forward del navegador)
window.addEventListener('hashchange', async () => {
  const route = routeFromHash(window.location.hash);
  if (route) {
    await navigateTo(route.id, { updateHash: false }); // no actualizar hash nuevamente
  }
});

/* ==========================
   FOOTER
   ========================== */
function insertFooter(page) {
  // Evitar duplicado y ocultarlo en login
  if (page.includes("inicio_sesion.html")) return;
  if (document.querySelector("footer")) return;

  const footer = document.createElement("footer");
  footer.innerHTML = `<p>&copy; 2025 TepiaTravel. Todos los derechos reservados.</p>`;
  app.appendChild(footer);
}

initApp();
