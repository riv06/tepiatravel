import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Crear un único pool de conexiones para toda la aplicación
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Máximo número de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Manejar errores del pool
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

export default pool;
