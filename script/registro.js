import { API_BASE_URL } from "./app.js";

export function init() {
  const form = document.getElementById("register-form");
  const message = document.getElementById("register-message");

  // Validación de registro
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("register-fullname").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirmPass = document.getElementById("register-confirm-password").value.trim();

    if (!fullName || !email || !password || !confirmPass) {
      message.style.color = "#ff4444";
      message.textContent = "Todos los campos son obligatorios.";
      return;
    }

    if (password !== confirmPass) {
      message.style.color = "#ff4444";
      message.textContent = "Las contraseñas no coinciden.";
      return;
    }

    // Llamar al API para registrar
    try {
      message.style.color = "#666";
      message.textContent = "Registrando...";

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        message.style.color = "#ff4444";
        message.textContent = data.error || "Error al registrar usuario";
        return;
      }

      // Guardar token y datos de usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userFullName', data.user.fullName);

      message.style.color = "#28a745";
      message.textContent = "¡Registro exitoso! 🎉 Redirigiendo...";

      // Actualizar UI de autenticación
      const authButtons = document.getElementById('auth-buttons');
      const userMenu = document.getElementById('user-menu');
      const userEmailSpan = document.getElementById('user-email');

      if (authButtons) authButtons.style.display = 'none';
      if (userMenu) userMenu.style.display = 'flex';
      if (userEmailSpan) userEmailSpan.textContent = data.user.email;

      // Redirigir al inicio
      setTimeout(() => {
        window.location.hash = '#';
      }, 1200);
    } catch (error) {
      console.error('Error en registro:', error);
      message.style.color = "#ff4444";
      message.textContent = "Error de conexión. Verifica que el servidor esté ejecutándose.";
    }
  });
}
