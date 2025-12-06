import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
    console.log('🔧 Inicializando base de datos...\n');

    try {
        // Leer el archivo SQL
        const schema = fs.readFileSync('./db/schema.sql', 'utf8');

        // Ejecutar el schema
        await pool.query(schema);

        console.log('✅ Base de datos inicializada correctamente!');
        console.log('\n📊 Tablas creadas:');
        console.log('   - users (usuarios/clientes)');
        console.log('   - companies (empresas de transporte)');
        console.log('   - routes (rutas de autobuses)');
        console.log('   - reservations (reservas)');
        console.log('\n📦 Datos de ejemplo insertados:');
        console.log('   - 4 empresas de transporte');
        console.log('   - 12 rutas con diferentes horarios');
        console.log('\n🎉 ¡Todo listo! Puedes iniciar el servidor con: npm start\n');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initDatabase();
