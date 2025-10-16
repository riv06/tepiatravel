// Espera que cargue todo el contenido
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const mainContent = document.getElementById("main-content");

  // Después de 3.5 segundos, desaparece el splash
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      mainContent.style.display = "block";
    }, 1000); // tiempo para la transición
  }, 3500);
});