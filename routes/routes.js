import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Obtener todas las rutas con información de la empresa
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.origin,
        r.destination,
        r.departure_time,
        r.arrival_time,
        r.price,
        r.total_seats,
        r.available_days,
        c.name as company_name,
        c.description as company_description
      FROM routes r
      JOIN companies c ON r.company_id = c.id
      ORDER BY r.origin, r.destination, r.departure_time
    `);

    res.json({ routes: result.rows });
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
});

// Obtener ruta específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        r.*,
        c.name as company_name,
        c.description as company_description
      FROM routes r
      JOIN companies c ON r.company_id = c.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    res.json({ route: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    res.status(500).json({ error: 'Error al obtener ruta' });
  }
});

// Buscar rutas por origen y destino
router.get('/search/:origin/:destination', async (req, res) => {
  try {
    const { origin, destination } = req.params;

    const result = await pool.query(`
      SELECT 
        r.*,
        c.name as company_name,
        c.description as company_description
      FROM routes r
      JOIN companies c ON r.company_id = c.id
      WHERE r.origin = $1 AND r.destination = $2
      ORDER BY r.departure_time
    `, [origin, destination]);

    res.json({ routes: result.rows });
  } catch (error) {
    console.error('Error al buscar rutas:', error);
    res.status(500).json({ error: 'Error al buscar rutas' });
  }
});

export default router;
