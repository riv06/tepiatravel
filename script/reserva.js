export function init() {
  const form = document.getElementById("reserva-form");
  const mensajeDiv = document.getElementById("reserva-mensaje");
  const busPanel = document.getElementById("bus-panel");

  let selectedSeats = [];

  // Generar 50 asientos estilo ADO con pasillo
  const totalAsientos = 50;
  const filas = 10; // 5 asientos por fila (2+pasillo+2)
  let asientoNum = 1;

  for (let i = 0; i < filas; i++) {
    const fila = document.createElement("div");
    fila.classList.add("fila");

    for (let j = 0; j < 5; j++) {
      if (j === 2) {
        // Pasillo
        const pasillo = document.createElement("div");
        pasillo.classList.add("asiento", "pasillo");
        fila.appendChild(pasillo);
      } else {
        const asiento = document.createElement("button");
        asiento.type = "button";
        asiento.classList.add("asiento");
        asiento.dataset.asiento = `A${asientoNum}`;
        asiento.textContent = `A${asientoNum}`;
        asientoNum++;
        fila.appendChild(asiento);

        asiento.addEventListener("click", () => {
          const boletos = parseInt(document.getElementById("boletos").value);
          if (asiento.classList.contains("selected")) {
            asiento.classList.remove("selected");
            selectedSeats = selectedSeats.filter(s => s !== asiento.dataset.asiento);
          } else {
            if (selectedSeats.length >= boletos) {
              // quitar primer seleccionado
              const first = selectedSeats.shift();
              const btn = busPanel.querySelector(`[data-asiento="${first}"]`);
              if (btn) btn.classList.remove("selected");
            }
            asiento.classList.add("selected");
            selectedSeats.push(asiento.dataset.asiento);
          }
        });
      }
    }

    busPanel.appendChild(fila);
  }

  // Manejo del formulario
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const origen = document.getElementById("origen").value;
      const destino = document.getElementById("destino").value;
      const fecha = document.getElementById("fecha").value;
      const boletos = parseInt(document.getElementById("boletos").value);

      if (!origen || !destino || !fecha || !boletos) {
        mensajeDiv.style.color = "#ff4444";
        mensajeDiv.textContent = "Todos los campos son obligatorios.";
        return;
      }

      if (origen === destino) {
        mensajeDiv.style.color = "#ff4444";
        mensajeDiv.textContent = "El origen y el destino no pueden ser iguales.";
        return;
      }

      if (boletos < 1 || boletos > 10) {
        mensajeDiv.style.color = "#ff4444";
        mensajeDiv.textContent = "El número de boletos debe estar entre 1 y 10.";
        return;
      }

      if (selectedSeats.length !== boletos) {
        mensajeDiv.style.color = "#ff4444";
        mensajeDiv.textContent = `Debes seleccionar ${boletos} asiento(s).`;
        return;
      }

      mensajeDiv.style.color = "#44ff44";
      mensajeDiv.textContent = `¡Reserva exitosa! ${boletos} boletos de ${origen} a ${destino} para el ${fecha}. Asientos: ${selectedSeats.join(", ")}`;

      form.reset();
      selectedSeats.forEach(a => {
        const btn = busPanel.querySelector(`[data-asiento="${a}"]`);
        if (btn) btn.classList.remove("selected");
      });
      selectedSeats = [];
    });
  }
}
