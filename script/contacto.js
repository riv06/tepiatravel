import { loadSection } from "./app.js";

export function init() {
  const form = document.getElementById("contact-form");
  const msg = document.getElementById("contact-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const subject = document.getElementById("contact-subject").value.trim();
    const message = document.getElementById("contact-message-input").value.trim();

    if (!name || !email || !subject || !message) {
      msg.style.color = "#ff4444";
      msg.textContent = "Por favor completa todos los campos.";
      return;
    }

    // Validación simple de email
    if (!email.includes("@") || !email.includes(".")) {
      msg.style.color = "#ff4444";
      msg.textContent = "El correo electrónico no es válido.";
      return;
    }

    msg.style.color = "#28a745";
    msg.textContent = "Mensaje enviado correctamente ✅";

    // Simulación de envío
    setTimeout(() => {
      form.reset();
    }, 1200);
  });
}
