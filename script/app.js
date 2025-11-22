const app = document.getElementById("app");

export async function loadSection(page, css) {
  // Transición suave
  app.style.opacity = "0";

  // Remover CSS previo
  const existingLink = document.getElementById("section-style");
  if (existingLink) existingLink.remove();

  // Añadir nuevo CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = css;
  link.id = "section-style";
  document.head.appendChild(link);

  // Cargar HTML
  const res = await fetch(page);
  const html = await res.text();
  app.innerHTML = html;

  // Intentar cargar JS propio de la sección
  try {
    const sectionName = page.split("/").pop().replace(".html", ".js");
    const sectionJS = await import(`./${sectionName}`);
    if (sectionJS.init) sectionJS.init();
  } catch (e) {
    console.warn("No se pudo cargar JS de la sección:", e);
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
   BOTONES INTERNOS DE SECCIONES
   ========================== */
function setupSectionNavigation() {
  // Botón "Reservar ahora" en main
  const btnReservaMain = document.getElementById("btn-reserva-main");
  if (btnReservaMain) {
    btnReservaMain.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("pages/reserva.html", "style-pages/reserva.css");
    });
  }

  // Botón "Volver al inicio"
  const btnHomeSection = document.getElementById("btn-home-section");
  if (btnHomeSection) {
    btnHomeSection.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("pages/main.html", "style-pages/main.css");
    });
  }

  // Botón "Iniciar sesión" desde una sección
  const btnLoginSection = document.getElementById("btn-login");
  if (btnLoginSection) {
    btnLoginSection.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("pages/inicio_sesion.html", "style-pages/inicio_sesion.css");
    });
  }
}

/* ==========================
   MARCAR LINK ACTIVO DEL HEADER
   ========================== */
function updateActiveNav(page) {
  const homeLink = document.getElementById("btn-home");
  const reservaLink = document.getElementById("btn-reserva");

  if (!homeLink || !reservaLink) return;

  homeLink.classList.remove("active");
  reservaLink.classList.remove("active");

  if (page.includes("main.html")) homeLink.classList.add("active");
  if (page.includes("reserva.html")) reservaLink.classList.add("active");
}

/* ==========================
   LISTENER GLOBAL DEL HEADER
   ========================== */
document.addEventListener("click", async (e) => {
  const target = e.target;

  if (target.id === "btn-home") {
    e.preventDefault();
    await loadSection("pages/main.html", "style-pages/main.css");
  }

  if (target.id === "btn-reserva") {
    e.preventDefault();
    await loadSection("pages/reserva.html", "style-pages/reserva.css");
  }

  if (target.id === "btn-login") {
    e.preventDefault();
    await loadSection("pages/inicio_sesion.html", "style-pages/inicio_sesion.css");
  }

  if (target.id === "btn-contacto") {
    e.preventDefault();
    await loadSection("pages/contacto.html", "style-pages/contacto.css");
  }
});

/* ==========================
   INICIALIZAR SPA
   ========================== */
async function initApp() {
  await loadSection("pages/intro.html", "style-pages/intro.css");

  const intro = document.getElementById("intro");
  setTimeout(async () => {
    if (!intro) return;
    intro.style.transition = "opacity 1s ease";
    intro.style.opacity = "0";

    setTimeout(async () => {
      await loadSection("pages/main.html", "style-pages/main.css");
    }, 1000);
  }, 3500);
}

/* ==========================
   FOOTER
   ========================== */
function insertFooter(page) {
  const footerHTML = `
    <footer>
      <p>&copy; 2025 TepiaTravel. Todos los derechos reservados.</p>
    </footer>
  `;

  // Evitar duplicado y ocultarlo en login
  const existingFooter = document.querySelector("footer");
  if (!existingFooter && !page.includes("inicio_sesion.html")) {
    const div = document.createElement("div");
    div.innerHTML = footerHTML;
    app.appendChild(div);
  }
}

initApp();
