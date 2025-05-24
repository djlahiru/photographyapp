<?php

// Define allowed booking statuses globally or as a helper
if (!defined('ALLOWED_BOOKING_STATUSES')) {
    define('ALLOWED_BOOKING_STATUSES', ['pending', 'confirmed', 'completed', 'cancelled']);
}

// Database connection function
function get_db_connection() {
    static $db = null;
    if ($db === null) {
        try {
            $db_path = __DIR__ . '/../../db/photograph_management.sqlite';
            $db = new PDO('sqlite:' . $db_path);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $db->exec('PRAGMA foreign_keys = ON;');
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null; 
        }
    }
    return $db;
}

// Helper function to get package price
function get_package_price(PDO $db, int $package_id): float|false {
    if (!$db) return false;
    $sql = "SELECT price FROM packages WHERE id = :package_id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':package_id', $package_id, PDO::PARAM_INT);
        $stmt->execute();
        $package = $stmt->fetch(PDO::FETCH_ASSOC);
        return $package ? (float)$package['price'] : false;
    } catch (PDOException $e) {
        error_log("Get package price error: " . $e->getMessage());
        return false;
    }
}

// Ensure bookings table and its trigger exist
function ensure_bookings_table_exists(PDO $db) {
    if (!$db) return;
    try {
        $db->query("SELECT 1 FROM bookings LIMIT 1");
    } catch (PDOException $e) {
        $bookings_schema = "
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            package_id INTEGER, 
            booking_date TEXT NOT NULL,
            booking_time TEXT,
            location TEXT,
            category TEXT, 
            status TEXT NOT NULL DEFAULT 'pending', 
            notes TEXT,
            total_amount REAL, 
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
            FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
        );
        CREATE TRIGGER IF NOT EXISTS trigger_bookings_updated_at
        AFTER UPDATE ON bookings FOR EACH ROW
        BEGIN
            UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;";
        try {
            $db->exec($bookings_schema);
        } catch (PDOException $exec_e) {
            error_log("Failed to create bookings table: " . $exec_e->getMessage());
        }
    }
}

/**
 * Creates a new booking.
 * Category is not set here; it's updated via update_booking. Status defaults to 'pending'.
 */
function create_booking(PDO $db, int $client_id, ?int $package_id, string $booking_date, ?string $booking_time, ?string $location, ?float $total_amount, ?string $notes): bool|int {
    if (!$db) return false;
    ensure_bookings_table_exists($db);

    if ($package_id !== null && $total_amount === null) {
        $package_price = get_package_price($db, $package_id);
        $total_amount = ($package_price !== false) ? $package_price : 0.0;
    } elseif ($total_amount === null) {
        $total_amount = 0.0;
    }

    $sql = "INSERT INTO bookings (client_id, package_id, booking_date, booking_time, location, total_amount, notes) 
            VALUES (:client_id, :package_id, :booking_date, :booking_time, :location, :total_amount, :notes)";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':client_id', $client_id, PDO::PARAM_INT);
        $stmt->bindParam(':package_id', $package_id, $package_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindParam(':booking_date', $booking_date);
        $stmt->bindParam(':booking_time', $booking_time, $booking_time === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':location', $location, $location === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':total_amount', $total_amount);
        $stmt->bindParam(':notes', $notes, $notes === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        
        if ($stmt->execute()) {
            return (int)$db->lastInsertId();
        }
        return false;
    } catch (PDOException $e) {
        error_log("Create booking error: " . $e->getMessage());
        return false;
    }
}

/**
 * Fetches all bookings with client and package names, with optional filtering.
 */
function get_all_bookings(PDO $db, ?string $status_filter = null, ?string $category_filter = null): array {
    if (!$db) return [];
    ensure_bookings_table_exists($db);
    if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
    if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);

    $params = [];
    $sql = "SELECT b.*, c.name as client_name, p.name as package_name 
            FROM bookings b
            JOIN clients c ON b.client_id = c.id
            LEFT JOIN packages p ON b.package_id = p.id";

    $where_clauses = [];
    if ($status_filter !== null && $status_filter !== '' && in_array($status_filter, ALLOWED_BOOKING_STATUSES, true)) {
        $where_clauses[] = "b.status = :status_filter";
        $params[':status_filter'] = $status_filter;
    }
    if ($category_filter !== null && $category_filter !== '') {
        $where_clauses[] = "b.category LIKE :category_filter";
        $params[':category_filter'] = '%' . $category_filter . '%';
    }

    if (!empty($where_clauses)) {
        $sql .= " WHERE " . implode(" AND ", $where_clauses);
    }
    $sql .= " ORDER BY b.booking_date DESC, b.booking_time DESC";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (PDOException $e) {
        error_log("Get all bookings error: " . $e->getMessage());
        return [];
    }
}

/**
 * Fetches a single booking by its ID with client and package names.
 */
function get_booking_by_id(PDO $db, int $id) {
    if (!$db) return false;
    ensure_bookings_table_exists($db);
    $sql = "SELECT b.*, c.name as client_name, p.name as package_name 
            FROM bookings b
            JOIN clients c ON b.client_id = c.id
            LEFT JOIN packages p ON b.package_id = p.id
            WHERE b.id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    } catch (PDOException $e) {
        error_log("Get booking by ID error: " . $e->getMessage());
        return false;
    }
}

/**
 * Updates an existing booking's main details, including category.
 * Status is updated via update_booking_status.
 */
function update_booking(PDO $db, int $id, int $client_id, ?int $package_id, string $booking_date, ?string $booking_time, ?string $location, ?float $total_amount, ?string $notes, ?string $category = null): bool {
    if (!$db) return false;
    ensure_bookings_table_exists($db);

    $current_booking = get_booking_by_id($db, $id);
    if (!$current_booking) return false;

    if ($package_id !== null && ($package_id != $current_booking['package_id'] || $total_amount === null)) {
        $package_price = get_package_price($db, $package_id);
        if ($package_price !== false) {
            $total_amount = $package_price;
        } elseif ($total_amount === null) {
             $total_amount = $current_booking['total_amount'];
        }
    } elseif ($package_id === null && $total_amount === null) {
        $total_amount = $current_booking['total_amount'];
    }

    $sql = "UPDATE bookings SET 
                client_id = :client_id, 
                package_id = :package_id, 
                booking_date = :booking_date, 
                booking_time = :booking_time, 
                location = :location, 
                total_amount = :total_amount, 
                notes = :notes,
                category = :category 
            WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':client_id', $client_id, PDO::PARAM_INT);
        $stmt->bindParam(':package_id', $package_id, $package_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindParam(':booking_date', $booking_date);
        $stmt->bindParam(':booking_time', $booking_time, $booking_time === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':location', $location, $location === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':total_amount', $total_amount);
        $stmt->bindParam(':notes', $notes, $notes === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':category', $category, $category === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Update booking error: " . $e->getMessage());
        return false;
    }
}

/**
 * Updates the status of a specific booking.
 */
function update_booking_status(PDO $db, int $booking_id, string $status): bool {
    if (!$db) return false;
    ensure_bookings_table_exists($db);

    if (!in_array($status, ALLOWED_BOOKING_STATUSES, true)) {
        error_log("Update booking status error: Invalid status value '$status' for booking ID $booking_id.");
        return false;
    }

    $sql = "UPDATE bookings SET status = :status WHERE id = :booking_id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Update booking status error for booking ID $booking_id: " . $e->getMessage());
        return false;
    }
}

/**
 * Deletes a booking by its ID.
 */
function delete_booking(PDO $db, int $id): bool {
    if (!$db) return false;
    ensure_bookings_table_exists($db);
    $sql = "DELETE FROM bookings WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Delete booking error: " . $e->getMessage());
        return false;
    }
}

// --- New Dashboard Functions ---

/**
 * Gets the count of active bookings (status 'pending' or 'confirmed').
 */
function get_active_bookings_count(PDO $db): int {
    if (!$db) return 0;
    ensure_bookings_table_exists($db);
    $sql = "SELECT COUNT(*) FROM bookings WHERE status = 'pending' OR status = 'confirmed'";
    try {
        $stmt = $db->query($sql);
        return (int)$stmt->fetchColumn();
    } catch (PDOException $e) {
        error_log("Get active bookings count error: " . $e->getMessage());
        return 0;
    }
}

/**
 * Gets upcoming bookings (future dates, status 'pending' or 'confirmed').
 */
function get_upcoming_bookings(PDO $db, int $limit = 5): array {
    if (!$db) return [];
    ensure_bookings_table_exists($db);
    // Ensure clients and packages tables exist for JOINs
    if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
    if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);
    
    $today = date('Y-m-d');
    $sql = "SELECT b.*, c.name as client_name, p.name as package_name
            FROM bookings b
            JOIN clients c ON b.client_id = c.id
            LEFT JOIN packages p ON b.package_id = p.id
            WHERE b.booking_date >= :today AND (b.status = 'pending' OR b.status = 'confirmed')
            ORDER BY b.booking_date ASC, b.booking_time ASC
            LIMIT :limit";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':today', $today);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (PDOException $e) {
        error_log("Get upcoming bookings error: " . $e->getMessage());
        return [];
    }
}

/**
 * Gets recent bookings (past dates, status 'completed' or 'confirmed').
 */
function get_recent_bookings(PDO $db, int $limit = 5): array {
    if (!$db) return [];
    ensure_bookings_table_exists($db);
    if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
    if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);

    $today = date('Y-m-d');
    $sql = "SELECT b.*, c.name as client_name, p.name as package_name
            FROM bookings b
            JOIN clients c ON b.client_id = c.id
            LEFT JOIN packages p ON b.package_id = p.id
            WHERE b.booking_date < :today AND (b.status = 'completed' OR b.status = 'confirmed')
            ORDER BY b.booking_date DESC, b.booking_time DESC
            LIMIT :limit";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':today', $today);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (PDOException $e) {
        error_log("Get recent bookings error: " . $e->getMessage());
        return [];
    }
}

/**
 * Gets booking counts grouped by category.
 * Filters out null or empty categories.
 */
function get_booking_counts_by_category(PDO $db): array {
    if (!$db) return [];
    ensure_bookings_table_exists($db);
    $sql = "SELECT category, COUNT(*) as count 
            FROM bookings 
            WHERE category IS NOT NULL AND category != '' 
            GROUP BY category 
            ORDER BY count DESC";
    try {
        $stmt = $db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: []; // Fetches into [category => count]
    } catch (PDOException $e) {
        error_log("Get booking counts by category error: " . $e->getMessage());
        return [];
    }
}


// Example Usage (can be removed or commented out)
/*
$db_conn = get_db_connection();
if ($db_conn) {
    // ... (previous example usage can be kept, but should be updated for new function signatures)
    echo "DB Connection successful. Example usage for new booking features:\n";
    ensure_bookings_table_exists($db_conn);
    
    // Test new dashboard functions
    // echo "\nActive Bookings Count: " . get_active_bookings_count($db_conn) . "\n";
    // echo "\nUpcoming Bookings (limit 3):\n";
    // print_r(get_upcoming_bookings($db_conn, 3));
    // echo "\nRecent Bookings (limit 3):\n";
    // print_r(get_recent_bookings($db_conn, 3));
    // echo "\nBooking Counts by Category:\n";
    // print_r(get_booking_counts_by_category($db_conn));
}
*/
?>
