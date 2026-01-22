CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    table_number INT UNIQUE NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(50) DEFAULT 'main_hall',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES tables(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    reservation_time TIMESTAMP NOT NULL,
    party_size INT NOT NULL,
    duration_minutes INT DEFAULT 90,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES tables(id),
    reservation_id INT REFERENCES reservations(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served, paid, cancelled
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_logs (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- cash, card, online
    transaction_id VARCHAR(100),
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

