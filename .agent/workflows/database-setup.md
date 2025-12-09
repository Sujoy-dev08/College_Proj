---
description: How to set up the MySQL database for TrackNHeal
---

# Database Setup for TrackNHeal

## Prerequisites
- MySQL Server installed and running
- MySQL client or MySQL Workbench

## Steps

1. Connect to MySQL:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE IF NOT EXISTS tracknheal_db;
USE tracknheal_db;
```

3. Create the `users` table:
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Create the `bookings` table:
```sql
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    pickup_location VARCHAR(500) NOT NULL,
    drop_location VARCHAR(500) NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    notes TEXT,
    status ENUM('pending', 'dispatched', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Verify tables were created:
```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE bookings;
```

## Database Configuration

The database connection is configured in `server.js`:
- **Host:** localhost
- **User:** root
- **Password:** (configured in server.js)
- **Database:** tracknheal_db

> ⚠️ **Note:** Update the password in `server.js` if your MySQL root password is different.
