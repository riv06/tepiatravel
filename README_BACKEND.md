# TepiaTravel - Sistema de Reservas de Autobuses

Sistema completo de reservas de autobuses con PostgreSQL, autenticación JWT, y gestión de rutas.

## 🚀 Configuración Inicial

### Requisitos Previos
- Node.js (v14 o superior)
- PostgreSQL Database (ya configurado en Neon)
- Un navegador web moderno

### Instalación

1. **Instalar dependencias de Node.js:**
```bash
npm install
```

2. **Configurar la base de datos:**

La aplicación ya está configurada para conectarse a tu base de datos PostgreSQL en Neon. Ahora necesitas crear las tablas ejecutando el script SQL:

```bash
# Opción 1: Usando psql (si tienes PostgreSQL CLI)
psql "postgresql://neondb_owner:npg_nR23ZMJBjHDc@ep-wandering-cake-ad81nbj8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" -f db/schema.sql

# Opción 2: Manualmente
# Copia el contenido de db/schema.sql y ejecútalo en tu cliente de PostgreSQL
```

Esto creará:
- **Tabla `users`**: Para almacenar clientes registrados
- **Tabla `companies`**: Para empresas de transporte
- **Tabla `routes`**: Para rutas de autobuses con horarios y precios
- **Tabla `reservations`**: Para reservas de boletos
- **Datos de ejemplo**: 4 empresas y 12 rutas

### Iniciar la Aplicación

1. **Iniciar el servidor backend:**
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

2. **Abrir la aplicación en el navegador:**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
tepiatravel/
├── db/
│   └── schema.sql          # Esquema de base de datos
├── middleware/
│   └── auth.js             # Middleware de autenticación JWT
├── routes/
│   ├── users.js            # Endpoints de usuarios
│   ├── routes.js           # Endpoints de rutas
│   └── reservations.js     # Endpoints de reservas
├── pages/
│   ├── main.html           # Página principal
│   ├── registro.html       # Registro de usuarios
│   ├── inicio_sesion.html  # Login
│   ├── rutas.html          # Visualización de rutas
│   ├── reserva.html        # Sistema de reservas
│   └── contacto.html       # Contacto
├── script/
│   ├── app.js              # Router y gestión de SPA
│   ├── registro.js         # Lógica de registro
│   ├── inicio_sesion.js    # Lógica de login
│   ├── rutas.js            # Lógica de rutas
│   └── reserva.js          # Lógica de reservas
├── style-pages/
│   └── *.css               # Estilos por página
├── server.js               # Servidor Express principal
├── package.json            # Dependencias
└── .env                    # Variables de entorno
```

## 🔌 API Endpoints

### Usuarios

- **POST** `/api/users/register`
  - Registrar nuevo usuario
  - Body: `{ fullName, email, password }`
  - Retorna: `{ token, user }`

- **POST** `/api/users/login`
  - Iniciar sesión
  - Body: `{ email, password }`
  - Retorna: `{ token, user }`

- **GET** `/api/users/profile`
  - Obtener perfil (requiere autenticación)
  - Headers: `Authorization: Bearer <token>`

### Rutas

- **GET** `/api/routes`
  - Obtener todas las rutas con información de empresas

- **GET** `/api/routes/:id`
  - Obtener ruta específica

- **GET** `/api/routes/search/:origin/:destination`
  - Buscar rutas por origen y destino

### Reservaciones

- **POST** `/api/reservations`
  - Crear reserva (requiere autenticación)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ routeId, reservationDate, numberOfSeats, seatNumbers, totalPrice }`

- **GET** `/api/reservations/:routeId/seats/:date`
  - Obtener asientos ocupados para una ruta y fecha

- **GET** `/api/reservations/user`
  - Obtener reservas del usuario (requiere autenticación)
  - Headers: `Authorization: Bearer <token>`

## 🔒 Autenticación

El sistema usa **JWT (JSON Web Tokens)** para la autenticación:

1. Usuario se registra o inicia sesión
2. El servidor genera un token JWT
3. El cliente almacena el token en `localStorage`
4. Cada petición autenticada incluye el token en el header `Authorization`

### Protección de Rutas

- ✅ **Registro**: Público
- ✅ **Login**: Público
- ✅ **Ver Rutas**: Público
- 🔒 **Hacer Reservas**: Requiere autenticación
- 🔒 **Ver Mis Reservas**: Requiere autenticación

## 🎯 Funcionalidades Principales

### 1. Registro de Usuarios
- Los usuarios pueden crear una cuenta con nombre completo, email y contraseña
- Las contraseñas se hashean con bcrypt antes de almacenarlas
- Después del registro, se inicia sesión automáticamente

### 2. Inicio de Sesión
- Autenticación con email y contraseña
- El token JWT se almacena para sesiones persistentes

### 3. Visualización de Rutas
- Muestra todas las rutas disponibles desde la base de datos
- Incluye: empresa, origen, destino, horarios, precio
- Filtros por origen y destino
- Diseño moderno con tarjetas

### 4. Sistema de Reservas
- ⚠️ **Requiere autenticación** - usuarios no logueados no pueden reservar
- Selección visual de asientos (estilo ADO)
- Validación de asientos ya ocupados
- Los asientos se marcan como ocupados según la base de datos
- Confirmación de reserva con detalles completos

## 🎨 Diseño

- **SPA (Single Page Application)** con navegación fluida
- **Diseño responsivo** para móviles y escritorio
- **Gradientes modernos** y animaciones suaves
- **Tema coherente** en todas las páginas

## 🔧 Desarrollo

Para desarrollo con auto-reload:
```bash
npm run dev
```

## 📝 Notas Importantes

1. **Seguridad**: Cambia `JWT_SECRET` en `.env` antes de producción
2. **Base de datos**: El archivo `.env` contiene las credenciales de tu base de datos
3. **CORS**: Actualmente configurado para desarrollo. Ajusta en producción
4. **Asientos**: El sistema soporta hasta 40 asientos por autobús

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que tu base de datos Neon esté activa

### "Debes iniciar sesión"
- Verifica que el servidor backend esté ejecutándose
- Comprueba que el token no haya expirado (7 días de validez)

### Asientos no se actualizan
- Verifica que la fecha esté seleccionada
- Comprueba la consola del navegador para errores de API

## 📧 Contacto

Para más información o soporte, contacta al equipo de TepiaTravel.

---

**¡Disfruta usando TepiaTravel! 🚌✨**
