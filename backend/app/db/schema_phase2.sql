CREATE TABLE IF NOT EXISTS restaurant_tables (
    id SERIAL PRIMARY KEY,
    table_number INT UNIQUE NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(50) DEFAULT 'Main Hall',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES restaurant_tables(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    reservation_time TIMESTAMP NOT NULL,
    guest_count INT NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, cancelled, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
