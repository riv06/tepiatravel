import { loadSection } from "./app.js";

export function init() {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  // 🔹 ENLACE A REGISTRO (esto debe estar dentro del init SIEMPRE)
  const btnRegister = document.getElementById("btn-register");
  if (btnRegister) {
    btnRegister.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadSection("pages/registro.html", "style-pages/registro.css");
    });
  }

  // 🔹 VALIDACIÓN DE LOGIN
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      message.textContent = "Por favor, completa todos los campos.";
      return;
    }

    if (email === "admin@tepiatravel.com" && password === "1234") {
      message.style.color = "#28a745";
      message.textContent = "Inicio de sesión exitoso 🎉";

      setTimeout(async () => {
        await loadSection("pages/main.html", "style-pages/main.css");
      }, 1000);

    } else {
      message.style.color = "#ff4444";
      message.textContent = "Credenciales incorrectas ❌";
    }
  });
}

