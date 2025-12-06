import { API_BASE_URL } from "./app.js";

export function init() {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  // Validación de login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      message.style.color = "#ff4444";
      message.textContent = "Por favor, completa todos los campos.";
      return;
    }

    // Llamar al API para login
    try {
      message.style.color = "#666";
      message.textContent = "Iniciando sesión...";

      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        message.style.color = "#ff4444";
        message.textContent = data.error || "Credenciales incorrectas ❌";
        return;
      }

      // Guardar token y datos de usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userFullName', data.user.fullName);

      message.style.color = "#28a745";
      message.textContent = "¡Inicio de sesión exitoso! 🎉";

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
      }, 1000);
    } catch (error) {
      console.error('Error en login:', error);
      message.style.color = "#ff4444";
      message.textContent = "Error de conexión. Verifica que el servidor esté ejecutándose.";
    }
  });
}
