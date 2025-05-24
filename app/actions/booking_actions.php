<?php

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
/**
 * Fetches the price of a specific package.
 *
 * @param PDO $db The PDO database connection object.
 * @param int $package_id The ID of the package.
 * @return float|false The price of the package if found, false otherwise.
 */
function get_package_price(PDO $db, int $package_id): float|false {
    if (!$db) return false;
    // We assume packages table exists and is managed elsewhere (e.g. package_actions.php)
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
        AFTER UPDATE ON bookings
        FOR EACH ROW
        BEGIN
            UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
        ";
        try {
            $db->exec($bookings_schema);
        } catch (PDOException $exec_e) {
            error_log("Failed to create bookings table: " . $exec_e->getMessage());
        }
    }
}

/**
 * Creates a new booking.
 *
 * @param PDO $db
 * @param int $client_id
 * @param int|null $package_id
 * @param string $booking_date (e.g., YYYY-MM-DD)
 * @param string|null $booking_time (e.g., HH:MM)
 * @param string|null $location
 * @param float|null $total_amount
 * @param string|null $notes
 * @return bool|int Booking ID on success, false on failure.
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

    // category will be NULL by default, status will be 'pending' by default (as per table schema)
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
 * Fetches all bookings with client and package names.
 * @param PDO $db
 * @return array
 */
function get_all_bookings(PDO $db): array {
    if (!$db) return [];
    ensure_bookings_table_exists($db);

    $sql = "SELECT 
                b.*, 
                c.name as client_name, 
                p.name as package_name 
            FROM bookings b
            JOIN clients c ON b.client_id = c.id
            LEFT JOIN packages p ON b.package_id = p.id
            ORDER BY b.booking_date DESC, b.booking_time DESC";
    try {
        $stmt = $db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (PDOException $e) {
        error_log("Get all bookings error: " . $e->getMessage());
        return [];
    }
}

/**
 * Fetches a single booking by its ID with client and package names.
 * @param PDO $db
 * @param int $id
 * @return array|false
 */
function get_booking_by_id(PDO $db, int $id) {
    if (!$db) return false;
    ensure_bookings_table_exists($db);

    $sql = "SELECT 
                b.*, 
                c.name as client_name, 
                p.name as package_name 
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
 * Updates an existing booking.
 *
 * @param PDO $db
 * @param int $id Booking ID
 * @param int $client_id
 * @param int|null $package_id
 * @param string $booking_date
 * @param string|null $booking_time
 * @param string|null $location
 * @param float|null $total_amount
 * @param string|null $notes
 * @return bool True on success, false on failure.
 */
function update_booking(PDO $db, int $id, int $client_id, ?int $package_id, string $booking_date, ?string $booking_time, ?string $location, ?float $total_amount, ?string $notes): bool {
    if (!$db) return false;
    ensure_bookings_table_exists($db);

    $current_booking = get_booking_by_id($db, $id); // Fetch to see if package changed
    if (!$current_booking) return false;

    if ($package_id !== null && ($package_id != $current_booking['package_id'] || $total_amount === null)) {
        $package_price = get_package_price($db, $package_id);
        if ($package_price !== false) {
            $total_amount = $package_price;
        } elseif ($total_amount === null) { // Package price not found, and no amount given
             $total_amount = $current_booking['total_amount']; // Keep existing amount
        }
    } elseif ($package_id === null && $total_amount === null) { // No package and no new amount
        $total_amount = $current_booking['total_amount']; // Keep existing amount
    }
    // If total_amount is explicitly provided, it takes precedence over calculated/old values.

    // category and status are not updated by this function as per the prompt's simplified signature.
    $sql = "UPDATE bookings SET 
                client_id = :client_id, 
                package_id = :package_id, 
                booking_date = :booking_date, 
                booking_time = :booking_time, 
                location = :location, 
                total_amount = :total_amount, 
                notes = :notes
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
        
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Update booking error: " . $e->getMessage());
        return false;
    }
}

/**
 * Deletes a booking by its ID.
 * @param PDO $db
 * @param int $id
 * @return bool True on success, false on failure.
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

// Example Usage (for testing, can be removed or commented out)
/*
$db_conn = get_db_connection();
if ($db_conn) {
    echo "DB Connection successful for bookings.\n";
    
    // Ensure dependent tables exist and have some data for testing FKs
    // In a real test setup, you'd call functions from client_actions.php and package_actions.php
    // For this standalone test, we'll quickly ensure the tables and add minimal data if they don't exist.
    try {
        $db_conn->exec("CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE);");
        $db_conn->exec("INSERT OR IGNORE INTO clients (id, name, email) VALUES (1, 'Test Client BK', 'clientbk@example.com');");
        $db_conn->exec("INSERT OR IGNORE INTO clients (id, name, email) VALUES (2, 'Another Client BK', 'clientbk2@example.com');");

        $db_conn->exec("CREATE TABLE IF NOT EXISTS packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL);");
        $db_conn->exec("INSERT OR IGNORE INTO packages (id, name, price) VALUES (1, 'Test Package BK', 199.99);");
        $db_conn->exec("INSERT OR IGNORE INTO packages (id, name, price) VALUES (2, 'Premium Package BK', 349.50);");
    } catch (PDOException $ex) {
        // echo "Error creating/populating dummy client/package tables: " . $ex->getMessage() . "\n";
    }
    
    ensure_bookings_table_exists($db_conn); // Ensures bookings table itself is up
    echo "Bookings table ensured.\n";

    // Test create_booking
    $bookingId1 = create_booking($db_conn, 1, 1, '2024-09-01', '10:00', 'City Park', null, 'Engagement photos');
    if ($bookingId1) echo "Created booking 1 with ID: $bookingId1 (Amount should be 199.99)\n"; else echo "Failed to create booking 1.\n";
    
    $bookingId2 = create_booking($db_conn, 2, null, '2024-09-05', '14:30', 'Downtown Studio', 300.00, 'Corporate headshots');
    if ($bookingId2) echo "Created booking 2 with ID: $bookingId2 (Amount should be 300.00)\n"; else echo "Failed to create booking 2.\n";

    $bookingId3 = create_booking($db_conn, 1, null, '2024-09-10', null, 'Beachside', 0, 'Scouting location'); // Test null time, 0 amount
     if ($bookingId3) echo "Created booking 3 with ID: $bookingId3 (Amount should be 0.00)\n"; else echo "Failed to create booking 3.\n";


    echo "\n--- All Bookings ---\n";
    $allBookings = get_all_bookings($db_conn);
    print_r($allBookings);

    if ($bookingId1) {
        echo "\n--- Booking ID $bookingId1 ---\n";
        $singleBooking = get_booking_by_id($db_conn, $bookingId1);
        print_r($singleBooking);

        echo "\n--- Updating Booking ID $bookingId1 ---\n";
        // Change package, total_amount should auto-update from new package if not specified
        $updateSuccess = update_booking($db_conn, $bookingId1, 1, 2, '2024-09-02', '11:00', 'City Park Fountain', null, 'Updated: Engagement, new package');
        if ($updateSuccess) {
            echo "Booking $bookingId1 updated. New details:\n";
            print_r(get_booking_by_id($db_conn, $bookingId1));
        } else {
            echo "Failed to update booking $bookingId1.\n";
        }
        
        echo "\n--- Updating Booking ID $bookingId1 with explicit amount ---\n";
        // Explicit total_amount, should override package price
        $updateSuccess2 = update_booking($db_conn, $bookingId1, 1, 2, '2024-09-02', '11:30', 'City Park Fountain', 400.00, 'Updated: Engagement, new package, custom price');
         if ($updateSuccess2) {
            echo "Booking $bookingId1 updated with explicit amount. New details:\n";
            print_r(get_booking_by_id($db_conn, $bookingId1));
        } else {
            echo "Failed to update booking $bookingId1 with explicit amount.\n";
        }
    }
    
    // Test delete_booking
    // if ($bookingId2) {
    //     echo "\n--- Deleting Booking ID $bookingId2 ---\n";
    //     if (delete_booking($db_conn, $bookingId2)) {
    //         echo "Booking $bookingId2 deleted.\n";
    //     } else {
    //         echo "Failed to delete booking $bookingId2.\n";
    //     }
    //     echo "All bookings after deletion:\n";
    //     print_r(get_all_bookings($db_conn));
    // }

} else {
    echo "DB Connection failed for bookings.\n";
}
*/
?>
