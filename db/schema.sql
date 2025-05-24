-- Database schema for the Photography Work Management Application

-- Table: packages
CREATE TABLE packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    services_included TEXT, -- Comma-separated list or JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: clients
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: bookings
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    package_id INTEGER,
    booking_date TEXT NOT NULL, -- ISO8601 date or datetime
    booking_time TEXT, -- Optional
    location TEXT,
    category TEXT, -- Free-text category
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    notes TEXT,
    total_amount REAL, -- Derived from package or custom
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
);

-- Table: payments
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    amount_paid REAL NOT NULL,
    payment_date TEXT NOT NULL, -- ISO8601 date
    payment_method TEXT, -- e.g., 'cash', 'card', 'bank transfer'
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Triggers to update 'updated_at' timestamps
-- For packages
CREATE TRIGGER IF NOT EXISTS packages_updated_at
AFTER UPDATE ON packages
FOR EACH ROW
BEGIN
    UPDATE packages SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- For clients
CREATE TRIGGER IF NOT EXISTS clients_updated_at
AFTER UPDATE ON clients
FOR EACH ROW
BEGIN
    UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- For bookings
CREATE TRIGGER IF NOT EXISTS bookings_updated_at
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- For payments
CREATE TRIGGER IF NOT EXISTS payments_updated_at
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Table: user_settings
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Enforce single row for the single user
    profile_name TEXT DEFAULT 'User',
    profile_picture_path TEXT,
    theme_mode TEXT DEFAULT 'Light' CHECK (theme_mode IN ('Light', 'Dark')),
    theme_color TEXT DEFAULT 'Ocean Blue', -- Default to one of the nice names
    datetime_format TEXT DEFAULT 'YYYY-MM-DD HH:MM',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for user_settings updated_at
CREATE TRIGGER IF NOT EXISTS trigger_user_settings_updated_at
AFTER UPDATE ON user_settings
FOR EACH ROW
BEGIN
    UPDATE user_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Initial Data (Seed Row) for user_settings
-- This ensures the application has default settings to work with for the single user.
-- It's recommended that a dedicated PHP initialization script handles seeding
-- by executing this statement after ensuring the table structure is in place.
INSERT OR IGNORE INTO user_settings (id, profile_name, theme_mode, theme_color, datetime_format)
VALUES (1, 'User', 'Light', 'Ocean Blue', 'YYYY-MM-DD HH:MM');
