import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/pool.js';

// Importar rutas
import usersRouter from './routes/users.js';
import routesRouter from './routes/routes.js';
import reservationsRouter from './routes/reservations.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Test de conexión a la base de datos
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error al conectar con la base de datos:', err);
    } else {
        console.log('✅ Conectado a la base de datos PostgreSQL');
        console.log('   Hora del servidor DB:', res.rows[0].now);
    }
});

// Middleware
app.use(cors()); // Permitir CORS para desarrollo
app.use(express.json()); // Parsear JSON en el body
app.use(express.static('.')); // Servir archivos estáticos

// Logging middleware para debug
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`📥 ${req.method} ${req.path}`);
    }
    next();
});

// Rutas de la API
app.use('/api/users', usersRouter);
app.use('/api/routes', routesRouter);
app.use('/api/reservations', reservationsRouter);

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TepiaTravel API está funcionando',
        timestamp: new Date().toISOString()
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor TepiaTravel iniciado`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`\n📋 Endpoints disponibles:`);
    console.log(`   POST   /api/users/register`);
    console.log(`   POST   /api/users/login`);
    console.log(`   GET    /api/users/profile`);
    console.log(`   GET    /api/routes`);
    console.log(`   GET    /api/routes/:id`);
    console.log(`   POST   /api/reservations`);
    console.log(`   GET    /api/reservations/:routeId/seats/:date`);
    console.log(`   GET    /api/reservations/user\n`);
});

export default app;
