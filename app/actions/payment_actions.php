<?php

// For this subtask, we're focusing on payments.
// In a full application, ensure_bookings_table_exists might be called before payment operations
// if there's a chance the bookings table might not exist.
// require_once __DIR__ . '/booking_actions.php';


// Database connection function
function get_db_connection() {
    static $db = null;
    if ($db === null) {
        try {
            $db_path = __DIR__ . '/../../db/photograph_management.sqlite';
            $db = new PDO('sqlite:' . $db_path);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            // Ensure foreign key constraints are enabled for SQLite
            $db->exec('PRAGMA foreign_keys = ON;');
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null; 
        }
    }
    return $db;
}

// Ensure payments table and its trigger exist
function ensure_payments_table_exists(PDO $db) {
    if (!$db) return;

    // As per instructions, strictly focusing on payments table structure here.
    // In a real scenario, you might call ensure_bookings_table_exists($db) first.
    // if (function_exists('ensure_bookings_table_exists')) {
    //     ensure_bookings_table_exists($db);
    // }


    try {
        // Check if table exists
        $db->query("SELECT 1 FROM payments LIMIT 1");
    } catch (PDOException $e) {
        // Table likely doesn't exist, try to create it.
        $payments_schema = "
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            amount_paid REAL NOT NULL,
            payment_date TEXT NOT NULL, -- Store as ISO8601 date
            payment_method TEXT, -- e.g., 'cash', 'card', 'bank transfer'
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
        );
        
        CREATE TRIGGER IF NOT EXISTS trigger_payments_updated_at
        AFTER UPDATE ON payments
        FOR EACH ROW
        BEGIN
            UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
        ";
        try {
            $db->exec($payments_schema);
        } catch (PDOException $exec_e) {
            error_log("Failed to create payments table: " . $exec_e->getMessage());
        }
    }
}

/**
 * Creates a new payment record.
 *
 * @param PDO $db
 * @param int $booking_id
 * @param float $amount_paid
 * @param string $payment_date (YYYY-MM-DD)
 * @param string|null $payment_method
 * @param string|null $notes
 * @return bool|int Payment ID on success, false on failure.
 */
function create_payment(PDO $db, int $booking_id, float $amount_paid, string $payment_date, ?string $payment_method, ?string $notes): bool|int {
    if (!$db) return false;
    ensure_payments_table_exists($db);

    $sql = "INSERT INTO payments (booking_id, amount_paid, payment_date, payment_method, notes) 
            VALUES (:booking_id, :amount_paid, :payment_date, :payment_method, :notes)";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
        $stmt->bindParam(':amount_paid', $amount_paid);
        $stmt->bindParam(':payment_date', $payment_date);
        $stmt->bindParam(':payment_method', $payment_method, $payment_method === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':notes', $notes, $notes === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        
        if ($stmt->execute()) {
            return (int)$db->lastInsertId();
        }
        return false;
    } catch (PDOException $e) {
        error_log("Create payment error: " . $e->getMessage());
        // Check for foreign key constraint violation (e.g., booking_id does not exist)
        if (strpos($e->getMessage(), 'FOREIGN KEY constraint failed') !== false) {
            // Specific logging or error handling for FK violation
        }
        return false;
    }
}

/**
 * Fetches all payment records for a specific booking_id.
 *
 * @param PDO $db
 * @param int $booking_id
 * @return array An array of associative arrays representing payments.
 */
function get_payments_for_booking(PDO $db, int $booking_id): array {
    if (!$db) return [];
    ensure_payments_table_exists($db);

    $sql = "SELECT * FROM payments WHERE booking_id = :booking_id ORDER BY payment_date DESC, created_at DESC";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (PDOException $e) {
        error_log("Get payments for booking error: " . $e->getMessage());
        return [];
    }
}

/**
 * Fetches a single payment record by its ID.
 *
 * @param PDO $db
 * @param int $id
 * @return array|false An associative array if found, false otherwise.
 */
function get_payment_by_id(PDO $db, int $id) {
    if (!$db) return false;
    ensure_payments_table_exists($db);

    $sql = "SELECT * FROM payments WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    } catch (PDOException $e) {
        error_log("Get payment by ID error: " . $e->getMessage());
        return false;
    }
}

/**
 * Updates an existing payment record.
 *
 * @param PDO $db
 * @param int $id Payment ID
 * @param float $amount_paid
 * @param string $payment_date (YYYY-MM-DD)
 * @param string|null $payment_method
 * @param string|null $notes
 * @return bool True on success, false on failure.
 */
function update_payment(PDO $db, int $id, float $amount_paid, string $payment_date, ?string $payment_method, ?string $notes): bool {
    if (!$db) return false;
    ensure_payments_table_exists($db);

    // booking_id is generally not updated for an existing payment.
    $sql = "UPDATE payments SET 
                amount_paid = :amount_paid, 
                payment_date = :payment_date, 
                payment_method = :payment_method, 
                notes = :notes 
            WHERE id = :id";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':amount_paid', $amount_paid);
        $stmt->bindParam(':payment_date', $payment_date);
        $stmt->bindParam(':payment_method', $payment_method, $payment_method === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':notes', $notes, $notes === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Update payment error: " . $e->getMessage());
        return false;
    }
}

/**
 * Deletes a payment record by its ID.
 *
 * @param PDO $db
 * @param int $id
 * @return bool True on success, false on failure.
 */
function delete_payment(PDO $db, int $id): bool {
    if (!$db) return false;
    ensure_payments_table_exists($db);

    $sql = "DELETE FROM payments WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Delete payment error: " . $e->getMessage());
        return false;
    }
}

/**
 * Calculates the sum of all amount_paid for a given booking_id.
 *
 * @param PDO $db
 * @param int $booking_id
 * @return float Total amount paid for the booking.
 */
function get_total_payments_for_booking(PDO $db, int $booking_id): float {
    if (!$db) return 0.0;
    ensure_payments_table_exists($db);

    $sql = "SELECT SUM(amount_paid) as total_paid FROM payments WHERE booking_id = :booking_id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':booking_id', $booking_id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result && $result['total_paid'] !== null ? (float)$result['total_paid'] : 0.0;
    } catch (PDOException $e) {
        error_log("Get total payments for booking error: " . $e->getMessage());
        return 0.0;
    }
}


// Example Usage (for testing, can be removed or commented out)
/*
$db_conn = get_db_connection();
if ($db_conn) {
    echo "DB Connection successful for payments.\n";

    // Prerequisite: Ensure bookings table exists and has some data for FK constraints
    // This is simplified. In a real test, you'd use booking_actions.php
    try {
        // Ensure clients table for booking's FK
        $db_conn->exec("CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE);");
        $db_conn->exec("INSERT OR IGNORE INTO clients (id, name, email) VALUES (1, 'Test Client Pay', 'clientpay@example.com');");

        // Ensure packages table for booking's FK
        $db_conn->exec("CREATE TABLE IF NOT EXISTS packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL);");
        $db_conn->exec("INSERT OR IGNORE INTO packages (id, name, price) VALUES (1, 'Test Package Pay', 99.99);");
        
        // Ensure bookings table
        if (function_exists('ensure_bookings_table_exists')) { // If booking_actions.php is included
            ensure_bookings_table_exists($db_conn);
        } else { // Standalone: create bookings table for FK
             $db_conn->exec("
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL, package_id INTEGER, 
                    booking_date TEXT NOT NULL, total_amount REAL, status TEXT DEFAULT 'pending',
                    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
                    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
                );");
        }
        $db_conn->exec("INSERT OR IGNORE INTO bookings (id, client_id, package_id, booking_date, total_amount) VALUES (1, 1, 1, '2024-07-01', 99.99);");
        $db_conn->exec("INSERT OR IGNORE INTO bookings (id, client_id, booking_date, total_amount) VALUES (2, 1, '2024-07-02', 200.00);");

    } catch (PDOException $ex) {
        echo "Error creating prerequisite tables/data: " . $ex->getMessage() . "\n";
    }
    
    ensure_payments_table_exists($db_conn); // Ensure payments table itself is up
    echo "Payments table ensured.\n";

    // Test create_payment
    $paymentId1 = create_payment($db_conn, 1, 50.00, '2024-07-05', 'cash', 'Initial deposit');
    if ($paymentId1) echo "Created payment 1 with ID: $paymentId1\n"; else echo "Failed to create payment 1.\n";
    
    $paymentId2 = create_payment($db_conn, 1, 49.99, '2024-07-10', 'card', 'Final payment');
    if ($paymentId2) echo "Created payment 2 with ID: $paymentId2\n"; else echo "Failed to create payment 2.\n";

    $paymentId3 = create_payment($db_conn, 2, 100.00, '2024-07-11', 'bank transfer', 'Full payment booking 2');
    if ($paymentId3) echo "Created payment 3 with ID: $paymentId3\n"; else echo "Failed to create payment 3.\n";

    echo "\n--- Payments for Booking ID 1 ---\n";
    $paymentsForBooking1 = get_payments_for_booking($db_conn, 1);
    print_r($paymentsForBooking1);

    echo "\n--- Total Payments for Booking ID 1 ---\n";
    $totalForBooking1 = get_total_payments_for_booking($db_conn, 1);
    echo "Total: $" . number_format($totalForBooking1, 2) . "\n"; // Expected: 99.99

    echo "\n--- Total Payments for Booking ID 2 ---\n";
    $totalForBooking2 = get_total_payments_for_booking($db_conn, 2);
    echo "Total: $" . number_format($totalForBooking2, 2) . "\n"; // Expected: 100.00
    
    if ($paymentId1) {
        echo "\n--- Payment by ID $paymentId1 ---\n";
        $singlePayment = get_payment_by_id($db_conn, $paymentId1);
        print_r($singlePayment);

        echo "\n--- Updating Payment ID $paymentId1 ---\n";
        $updateSuccess = update_payment($db_conn, $paymentId1, 55.00, '2024-07-06', 'cash', 'Corrected deposit amount');
        if ($updateSuccess) {
            echo "Payment $paymentId1 updated. New details:\n";
            print_r(get_payment_by_id($db_conn, $paymentId1));
        } else {
            echo "Failed to update payment $paymentId1.\n";
        }
         echo "\n--- Total Payments for Booking ID 1 (after update) ---\n";
        $totalForBooking1AfterUpdate = get_total_payments_for_booking($db_conn, 1);
        echo "Total: $" . number_format($totalForBooking1AfterUpdate, 2) . "\n"; // Expected: 104.99
    }
    
    // Test delete_payment
    // if ($paymentId3) {
    //     echo "\n--- Deleting Payment ID $paymentId3 ---\n";
    //     if (delete_payment($db_conn, $paymentId3)) {
    //         echo "Payment $paymentId3 deleted.\n";
    //     } else {
    //         echo "Failed to delete payment $paymentId3.\n";
    //     }
    //     echo "Payments for Booking ID 2 after deletion:\n";
    //     print_r(get_payments_for_booking($db_conn, 2));
    //     echo "Total for Booking ID 2 after deletion: $" . number_format(get_total_payments_for_booking($db_conn,2),2) . "\n";
    // }

} else {
    echo "DB Connection failed for payments.\n";
}
*/

?>
