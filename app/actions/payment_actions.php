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

/**
 * Gets the total sum of payments made in the current month.
 *
 * @param PDO $db
 * @return float
 */
function get_payments_this_month(PDO $db): float {
    if (!$db) return 0.0;
    ensure_payments_table_exists($db);
    
    $current_month_start = date('Y-m-01');
    $current_month_end = date('Y-m-t'); // 't' gives the last day of the current month

    $sql = "SELECT SUM(amount_paid) as total_monthly_payments 
            FROM payments 
            WHERE payment_date >= :start_date AND payment_date <= :end_date";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':start_date', $current_month_start);
        $stmt->bindParam(':end_date', $current_month_end);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result && $result['total_monthly_payments'] !== null ? (float)$result['total_monthly_payments'] : 0.0;
    } catch (PDOException $e) {
        error_log("Get payments this month error: " . $e->getMessage());
        return 0.0;
    }
}


// Example Usage (for testing, can be removed or commented out)
/*
$db_conn = get_db_connection();
if ($db_conn) {
    // ... (previous example usage) ...
    
    // Test get_payments_this_month
    // To test this properly, ensure you have some payments in the current month
    // For example, if today is 2024-07-15:
    // create_payment($db_conn, 1, 75.00, '2024-07-10', 'cash', 'Mid-month payment');
    // create_payment($db_conn, 2, 120.00, date('Y-m-d'), 'card', 'Today payment');
    // echo "\nPayments This Month: $" . number_format(get_payments_this_month($db_conn), 2) . "\n";
}
*/

?>
