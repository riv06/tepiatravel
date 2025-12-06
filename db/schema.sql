-- TepiaTravel Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (clientes)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table (empresas de transporte)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table (rutas de autobuses)
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_seats INTEGER DEFAULT 50,
    available_days VARCHAR(50) DEFAULT 'Lunes a Domingo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table (reservas)
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    number_of_seats INTEGER NOT NULL,
    seat_numbers TEXT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample companies
INSERT INTO companies (name, description) VALUES
('Transportes del Norte', 'Empresa líder en transporte terrestre del norte de México'),
('Autobuses Ejecutivos', 'Servicio ejecutivo de primera clase'),
('Viajes Rápidos SA', 'Conectando México con rapidez y seguridad'),
('TransMexico Express', 'Tu viaje, nuestra prioridad');

-- Insert sample routes
INSERT INTO routes (company_id, origin, destination, departure_time, arrival_time, price, total_seats) VALUES
-- Transportes del Norte
(1, 'CDMX', 'Guadalajara', '08:00', '14:30', 450.00, 50),
(1, 'CDMX', 'Monterrey', '22:00', '06:00', 650.00, 50),
(1, 'Guadalajara', 'CDMX', '10:00', '16:30', 450.00, 50),

-- Autobuses Ejecutivos
(2, 'CDMX', 'Puebla', '07:00', '09:30', 280.00, 50),
(2, 'CDMX', 'Veracruz', '23:00', '07:00', 580.00, 50),
(2, 'Puebla', 'CDMX', '16:00', '18:30', 280.00, 50),

-- Viajes Rápidos SA
(3, 'Monterrey', 'CDMX', '21:00', '05:00', 650.00, 50),
(3, 'CDMX', 'Cancún', '19:00', '11:00', 1200.00, 50),
(3, 'Guadalajara', 'Monterrey', '09:00', '17:00', 720.00, 50),

-- TransMexico Express
(4, 'CDMX', 'Tijuana', '18:00', '18:00', 1500.00, 50),
(4, 'Veracruz', 'CDMX', '08:00', '16:00', 580.00, 50),
(4, 'Cancún', 'CDMX', '12:00', '04:00', 1200.00, 50);

-- Create indexes for better performance
CREATE INDEX idx_routes_origin_destination ON routes(origin, destination);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_route ON reservations(route_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
