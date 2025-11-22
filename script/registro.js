import { loadSection } from "./app.js";

export function init() {
  const form = document.getElementById("register-form");
  const message = document.getElementById("register-message");

  // Ir al login
  const btnLogin = document.getElementById("btn-login");
  if (btnLogin) {
    btnLogin.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("pages/inicio_sesion.html", "style-pages/inicio_sesion.css");
    });
  }

  // Validación de registro
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPass = document.getElementById("confirm-password").value.trim();

    if (!fullname || !email || !password || !confirmPass) {
      message.style.color = "#ff4444";
      message.textContent = "Todos los campos son obligatorios.";
      return;
    }

    if (password !== confirmPass) {
      message.style.color = "#ff4444";
      message.textContent = "Las contraseñas no coinciden.";
      return;
    }

    // Registro ficticio
    message.style.color = "#28a745";
    message.textContent = "Registro exitoso 🎉";

    setTimeout(async () => {
      await loadSection("pages/inicio_sesion.html", "style-pages/inicio_sesion.css");
    }, 1200);
  });
}
