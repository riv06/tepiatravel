const app = document.getElementById("app");

export async function loadSection(page, css) {
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
  const sectionName = page.split("/").pop().replace(".html", ".js"); // "reserva.js"
  const sectionJS = await import(`./${sectionName}`); // desde scripts/
  if (sectionJS.init) sectionJS.init();
} catch(e) {
  console.error("No se pudo cargar JS de la sección:", e);
}


  setupSectionNavigation();
  updateActiveNav(page);
  insertFooter();

}

// Registrar botones internos de cada sección
function setupSectionNavigation() {
  const btnReservaMain = document.getElementById("btn-reserva-main");
  if (btnReservaMain) {
    btnReservaMain.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("pages/reserva.html", "style-pages/reserva.css");
    });
  }

  const btnHomeSection = document.getElementById("btn-home-section");
  if (btnHomeSection) {
    btnHomeSection.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("pages/main.html", "style-pages/main.css");
    });
  }
}

// Actualiza el link activo del header
function updateActiveNav(page) {
  // Siempre buscar los links del header, no los de dentro de la sección
  const homeLink = document.getElementById("btn-home");
  const reservaLink = document.getElementById("btn-reserva");

  if (!homeLink || !reservaLink) return;

  homeLink.classList.remove("active");
  reservaLink.classList.remove("active");

  if (page.includes("main.html")) {
    homeLink.classList.add("active");
  } else if (page.includes("reserva.html")) {
    reservaLink.classList.add("active");
  }
}

// Event delegation para botones del header (SPA)
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
});

// Inicializa SPA con intro
async function initApp() {
  await loadSection("pages/intro.html", "style-pages/intro.css");

  const intro = document.getElementById("intro");
  setTimeout(async () => {
    intro.style.transition = "opacity 1s ease";
    intro.style.opacity = "0";

    setTimeout(async () => {
      await loadSection("pages/main.html", "style-pages/main.css");
    }, 1000);
  }, 3500);
}

//Footer
function insertFooter() {
  const footerHTML = `
    <footer>
      <p>&copy; 2025 TepiaTravel. Todos los derechos reservados.</p>
    </footer>
  `;

  // Evitar duplicar
  const existingFooter = document.querySelector("footer");
  if (!existingFooter) {
    const div = document.createElement("div");
    div.innerHTML = footerHTML;
    app.appendChild(div);
  }
}

initApp();
