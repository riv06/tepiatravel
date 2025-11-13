import { loadSection } from "./app.js";
export function init() {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      message.textContent = "Por favor, completa todos los campos.";
      return;
    }

    // Validación ficticia
    if (email === "admin@tepiatravel.com" && password === "1234") {
      message.style.color = "#28a745";
      message.textContent = "Inicio de sesión exitoso 🎉";

      // Simula carga y cambia de página
      setTimeout(async () => {
        await loadSection("pages/main.html", "style-pages/main.css");
      }, 1000);
    } else {
      message.style.color = "#ff4444";
      message.textContent = "Credenciales incorrectas ❌";
    }
  });
}
