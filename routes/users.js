import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registro - Request body:', req.body);
        const { fullName, email, password } = req.body;

        // Validar datos
        if (!fullName || !email || !password) {
            console.log('❌ Registro - Campos faltantes');
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        console.log('✅ Registro - Validación inicial pasada');

        // Verificar si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            console.log('❌ Registro - Email ya existe:', email);
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        console.log('✅ Registro - Email disponible');

        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        console.log('✅ Registro - Password hasheado');

        // Insertar usuario
        const result = await pool.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email',
            [fullName, email, passwordHash]
        );

        const user = result.rows[0];
        console.log('✅ Registro - Usuario creado:', user.id);

        // Generar JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ Registro - Token generado');

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            }
        });

        console.log('✅ Registro - Respuesta enviada exitosamente');
    } catch (error) {
        console.error('❌ Error en registro:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login - Request body:', { email: req.body.email });
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('❌ Login - Usuario no encontrado:', email);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            console.log('❌ Login - Contraseña incorrecta');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('✅ Login - Credenciales válidas');

        // Generar JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            }
        });

        console.log('✅ Login - Respuesta enviada exitosamente');
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Obtener perfil de usuario (protegido)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

export default router;
