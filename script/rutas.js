export function init() {
    loadRoutes();
    setupFilters();
}

let allRoutes = [];

// Cargar rutas desde la API
async function loadRoutes() {
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const rutasList = document.getElementById('rutas-list');

    try {
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        rutasList.innerHTML = '';

        const response = await fetch('http://localhost:3000/api/routes');

        if (!response.ok) {
            throw new Error('Error al cargar las rutas');
        }

        const data = await response.json();
        allRoutes = data.routes;

        loadingMessage.style.display = 'none';
        displayRoutes(allRoutes);
    } catch (error) {
        console.error('Error:', error);
        loadingMessage.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Error al cargar las rutas. Asegúrate de que el servidor esté ejecutándose.';
    }
}

// Mostrar rutas en la página
function displayRoutes(routes) {
    const rutasList = document.getElementById('rutas-list');

    if (routes.length === 0) {
        rutasList.innerHTML = '<p class="no-results">No se encontraron rutas con los criterios seleccionados.</p>';
        return;
    }

    rutasList.innerHTML = routes.map(route => `
    <div class="route-card">
      <div class="route-header">
        <h3 class="company-name">${route.company_name}</h3>
        <span class="route-price">$${parseFloat(route.price).toFixed(2)}</span>
      </div>
      
      <div class="route-details">
        <div class="route-cities">
          <span class="origin">${route.origin}</span>
          <span class="arrow">→</span>
          <span class="destination">${route.destination}</span>
        </div>
        
        <div class="route-times">
          <div class="time-box">
            <span class="time-label">Salida</span>
            <span class="time-value">${formatTime(route.departure_time)}</span>
          </div>
          <div class="time-box">
            <span class="time-label">Llegada</span>
            <span class="time-value">${formatTime(route.arrival_time)}</span>
          </div>
        </div>

        <div class="route-info">
          <p class="available-days">📅 ${route.available_days}</p>
          <p class="available-seats">💺 ${route.total_seats} asientos disponibles</p>
        </div>
      </div>
      
      <button class="btn-reserve" data-route-id="${route.id}">Reservar ahora</button>
    </div>
  `).join('');

    // Agregar event listeners a los botones de reservar
    document.querySelectorAll('.btn-reserve').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const routeId = e.target.dataset.routeId;
            // Navegar a la página de reserva (implementaremos esto después)
            window.location.hash = '#reserva';
        });
    });
}

// Formatear tiempo (HH:MM:SS a HH:MM AM/PM)
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Configurar filtros de búsqueda
function setupFilters() {
    const btnFilter = document.getElementById('btn-filter');
    const btnClearFilter = document.getElementById('btn-clear-filter');
    const filterOrigin = document.getElementById('filter-origin');
    const filterDestination = document.getElementById('filter-destination');

    btnFilter.addEventListener('click', () => {
        const origin = filterOrigin.value;
        const destination = filterDestination.value;

        const filteredRoutes = allRoutes.filter(route => {
            const matchOrigin = !origin || route.origin === origin;
            const matchDestination = !destination || route.destination === destination;
            return matchOrigin && matchDestination;
        });

        displayRoutes(filteredRoutes);
    });

    btnClearFilter.addEventListener('click', () => {
        filterOrigin.value = '';
        filterDestination.value = '';
        displayRoutes(allRoutes);
    });
}
