import { API_BASE_URL } from "./app.js";

export function init() {
  const form = document.getElementById("reserva-form");
  const mensajeDiv = document.getElementById("reserva-mensaje");
  const busPanel = document.getElementById("bus-panel");
  const asientosContainer = document.getElementById("asientos-container");

  let selectedSeats = [];
  let currentRouteId = null;
  let currentDate = null;

  // Verificar si el usuario está autenticado
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    mensajeDiv.style.color = "#ff4444";
    mensajeDiv.innerHTML = "⚠️ Debes <a href='#login' style='color: #ff4444; text-decoration: underline;'>iniciar sesión</a> para hacer una reserva.";
    form.style.pointerEvents = "none";
    form.style.opacity = "0.5";
    asientosContainer.style.display = "none";
    return;
  }

  // Cargar rutas desde la base de datos
  loadRoutes();

  // Generar 40 asientos estilo ADO con pasillo (8 filas x 5 columnas)
  const totalAsientos = 40;
  const filas = 8;
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
          if (asiento.classList.contains("occupied")) {
            return; // No permitir seleccionar asientos ocupados
          }

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

  // Listener para cambio de fecha - cargar asientos ocupados
  const fechaInput = document.getElementById("fecha");
  fechaInput.addEventListener("change", async () => {
    const routeSelect = document.getElementById("origen"); // Usaremos esto como ruta
    currentDate = fechaInput.value;

    if (currentRouteId && currentDate) {
      await loadOccupiedSeats(currentRouteId, currentDate);
    }
  });

  // Manejo del formulario
  if (form) {
    form.addEventListener("submit", async (e) => {
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

      // Buscar la ruta en la base de datos
      try {
        mensajeDiv.style.color = "#666";
        mensajeDiv.textContent = "Buscando ruta...";

        const routeResponse = await fetch(`${API_BASE_URL}/routes/search/${origen}/${destino}`);
        const routeData = await routeResponse.json();

        if (!routeResponse.ok || routeData.routes.length === 0) {
          mensajeDiv.style.color = "#ff4444";
          mensajeDiv.textContent = "No se encontró una ruta disponible para este trayecto.";
          return;
        }

        const route = routeData.routes[0]; // Tomar la primera ruta disponible
        const totalPrice = route.price * boletos;

        // Crear la reserva
        mensajeDiv.textContent = "Procesando reserva...";

        const reservationResponse = await fetch(`${API_BASE_URL}/reservations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            routeId: route.id,
            reservationDate: fecha,
            numberOfSeats: boletos,
            seatNumbers: selectedSeats.join(', '),
            totalPrice: totalPrice
          })
        });

        const reservationData = await reservationResponse.json();

        if (!reservationResponse.ok) {
          mensajeDiv.style.color = "#ff4444";
          mensajeDiv.textContent = reservationData.error || "Error al crear la reserva.";
          return;
        }

        mensajeDiv.style.color = "#44ff44";
        mensajeDiv.textContent = `¡Reserva exitosa! ${boletos} boletos de ${origen} a ${destino} para el ${fecha}. Asientos: ${selectedSeats.join(", ")}. Total: $${totalPrice.toFixed(2)}`;

        // Marcar asientos como ocupados
        selectedSeats.forEach(a => {
          const btn = busPanel.querySelector(`[data-asiento="${a}"]`);
          if (btn) {
            btn.classList.remove("selected");
            btn.classList.add("occupied");
          }
        });

        selectedSeats = [];
        form.reset();
      } catch (error) {
        console.error('Error en reserva:', error);
        mensajeDiv.style.color = "#ff4444";
        mensajeDiv.textContent = "Error de conexión. Verifica que el servidor esté ejecutándose.";
      }
    });
  }
}

// Cargar rutas desde la base de datos
async function loadRoutes() {
  try {
    const response = await fetch(`${API_BASE_URL}/routes`);
    const data = await response.json();

    if (response.ok && data.routes) {
      // Extraer orígenes y destinos únicos
      const origenes = [...new Set(data.routes.map(r => r.origin))];
      const destinos = [...new Set(data.routes.map(r => r.destination))];

      // Actualizar select de origen
      const origenSelect = document.getElementById("origen");
      origenSelect.innerHTML = '<option value="">Selecciona origen</option>';
      origenes.forEach(ciudad => {
        origenSelect.innerHTML += `<option value="${ciudad}">${ciudad}</option>`;
      });

      // Actualizar select de destino
      const destinoSelect = document.getElementById("destino");
      destinoSelect.innerHTML = '<option value="">Selecciona destino</option>';
      destinos.forEach(ciudad => {
        destinoSelect.innerHTML += `<option value="${ciudad}">${ciudad}</option>`;
      });
    }
  } catch (error) {
    console.error('Error al cargar rutas:', error);
  }
}

// Cargar asientos ocupados para una ruta y fecha
async function loadOccupiedSeats(routeId, date) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${routeId}/seats/${date}`);
    const data = await response.json();

    if (response.ok) {
      // Limpiar asientos ocupados anteriores
      document.querySelectorAll('.asiento.occupied').forEach(seat => {
        seat.classList.remove('occupied');
      });

      // Marcar nuevos asientos ocupados
      data.occupiedSeats.forEach(seatNumber => {
        const seatBtn = document.querySelector(`[data-asiento="${seatNumber}"]`);
        if (seatBtn) {
          seatBtn.classList.add('occupied');
        }
      });
    }
  } catch (error) {
    console.error('Error al cargar asientos ocupados:', error);
  }
}
