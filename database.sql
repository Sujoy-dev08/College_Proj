CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    patient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    drop_location VARCHAR(255) NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    notes TEXT,
    status ENUM('pending', 'dispatched', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE bookings ADD COLUMN status ENUM('pending', 'dispatched', 'completed', 'cancelled') DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN user_id INT;
INSERT INTO admins (username, email, password) VALUES 
('admin', 'admin@tracknheal.com', 'admin123');
