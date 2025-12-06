import express from 'express';
import pool from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Crear reservación (requiere autenticación)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { routeId, reservationDate, numberOfSeats, seatNumbers, totalPrice } = req.body;
        const userId = req.user.id;

        // Validar datos
        if (!routeId || !reservationDate || !numberOfSeats || !seatNumbers || !totalPrice) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Verificar que la ruta existe
        const routeCheck = await pool.query('SELECT * FROM routes WHERE id = $1', [routeId]);
        if (routeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Ruta no encontrada' });
        }

        // Verificar asientos ocupados para esa fecha
        const occupiedSeats = await pool.query(
            'SELECT seat_numbers FROM reservations WHERE route_id = $1 AND reservation_date = $2 AND status = $3',
            [routeId, reservationDate, 'confirmed']
        );

        // Convertir asientos ocupados a un array
        const occupiedSeatsArray = occupiedSeats.rows.flatMap(row =>
            row.seat_numbers.split(',').map(s => s.trim())
        );

        // Verificar conflictos
        const requestedSeats = seatNumbers.split(',').map(s => s.trim());
        const conflicts = requestedSeats.filter(seat => occupiedSeatsArray.includes(seat));

        if (conflicts.length > 0) {
            return res.status(400).json({
                error: `Los siguientes asientos ya están ocupados: ${conflicts.join(', ')}`
            });
        }

        // Crear reservación
        const result = await pool.query(
            `INSERT INTO reservations (user_id, route_id, reservation_date, number_of_seats, seat_numbers, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [userId, routeId, reservationDate, numberOfSeats, seatNumbers, totalPrice, 'confirmed']
        );

        res.status(201).json({
            message: 'Reservación creada exitosamente',
            reservation: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear reservación:', error);
        res.status(500).json({ error: 'Error al crear reservación' });
    }
});

// Obtener asientos ocupados para una ruta y fecha específica
router.get('/:routeId/seats/:date', async (req, res) => {
    try {
        const { routeId, date } = req.params;

        const result = await pool.query(
            'SELECT seat_numbers FROM reservations WHERE route_id = $1 AND reservation_date = $2 AND status = $3',
            [routeId, date, 'confirmed']
        );

        // Aplanar todos los asientos ocupados en un solo array
        const occupiedSeats = result.rows.flatMap(row =>
            row.seat_numbers.split(',').map(s => s.trim())
        );

        res.json({ occupiedSeats });
    } catch (error) {
        console.error('Error al obtener asientos ocupados:', error);
        res.status(500).json({ error: 'Error al obtener asientos ocupados' });
    }
});

// Obtener reservaciones del usuario (requiere autenticación)
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
      SELECT 
        res.*,
        r.origin,
        r.destination,
        r.departure_time,
        r.arrival_time,
        c.name as company_name
      FROM reservations res
      JOIN routes r ON res.route_id = r.id
      JOIN companies c ON r.company_id = c.id
      WHERE res.user_id = $1
      ORDER BY res.reservation_date DESC, res.created_at DESC
    `, [userId]);

        res.json({ reservations: result.rows });
    } catch (error) {
        console.error('Error al obtener reservaciones:', error);
        res.status(500).json({ error: 'Error al obtener reservaciones' });
    }
});

export default router;
