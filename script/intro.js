document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");

  // Oculta el intro después de 3 segundos
  setTimeout(() => {
    intro.style.opacity = "0";
    intro.style.transition = "opacity 1s ease";
    setTimeout(() => {
      intro.style.display = "none";
    }, 1000);
  }, 1000);
});