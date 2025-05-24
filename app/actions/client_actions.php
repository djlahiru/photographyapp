<?php

// Database connection function (similar to package_actions.php)
function get_db_connection() {
    static $db = null;
    if ($db === null) {
        try {
            // Path relative to this file's location (app/actions/client_actions.php)
            $db_path = __DIR__ . '/../../db/photograph_management.sqlite';
            $db = new PDO('sqlite:' . $db_path);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null; 
        }
    }
    return $db;
}

// Ensure clients table and its trigger exist
function ensure_clients_table_exists(PDO $db) {
    if (!$db) return;

    try {
        // Check if table exists
        $db->query("SELECT 1 FROM clients LIMIT 1");
    } catch (PDOException $e) {
        // Table likely doesn't exist, try to create it.
        $clients_schema = "
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            address TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TRIGGER IF NOT EXISTS trigger_clients_updated_at
        AFTER UPDATE ON clients
        FOR EACH ROW
        BEGIN
            UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
        ";
        try {
            $db->exec($clients_schema);
        } catch (PDOException $exec_e) {
            error_log("Failed to create clients table: " . $exec_e->getMessage());
        }
    }
}

/**
 * Creates a new client in the database.
 *
 * @param PDO $db The PDO database connection object.
 * @param string $name Name of the client.
 * @param string $email Email of the client.
 * @param string $phone Phone number of the client.
 * @param string $address Address of the client.
 * @return bool|int The ID of the newly created client on success, false on failure.
 */
function create_client(PDO $db, string $name, string $email, string $phone, string $address) {
    if (!$db) return false;
    ensure_clients_table_exists($db);

    $sql = "INSERT INTO clients (name, email, phone, address) VALUES (:name, :email, :phone, :address)";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        
        if ($stmt->execute()) {
            return (int)$db->lastInsertId();
        } else {
            return false;
        }
    } catch (PDOException $e) {
        // Handle potential UNIQUE constraint violation for email gracefully
        if ($e->getCode() == 23000 || strpos($e->getMessage(), 'UNIQUE constraint failed: clients.email') !== false) {
             error_log("Create client error: Email already exists - " . $e->getMessage());
        } else {
            error_log("Create client error: " . $e->getMessage());
        }
        return false;
    }
}

/**
 * Fetches all clients from the database with financial summaries.
 *
 * @param PDO $db The PDO database connection object.
 * @return array An array of associative arrays representing clients, or an empty array on failure/no clients.
 */
function get_all_clients(PDO $db): array {
    if (!$db) return [];
    ensure_clients_table_exists($db);
    // Ensure bookings and payments tables are available for subqueries
    if (function_exists('ensure_bookings_table_exists')) ensure_bookings_table_exists($db);
    if (function_exists('ensure_payments_table_exists')) ensure_payments_table_exists($db);

    $sql = "
    SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.created_at,
        c.updated_at,
        COALESCE(client_total_bookings.total_value, 0) AS total_booking_value,
        COALESCE(client_total_payments.total_paid, 0) AS total_payments_made,
        (COALESCE(client_total_bookings.total_value, 0) - COALESCE(client_total_payments.total_paid, 0)) AS outstanding_balance
    FROM
        clients c
    LEFT JOIN (
        SELECT client_id, SUM(total_amount) AS total_value
        FROM bookings
        GROUP BY client_id
    ) AS client_total_bookings ON c.id = client_total_bookings.client_id
    LEFT JOIN (
        SELECT b.client_id, SUM(p.amount_paid) AS total_paid
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        GROUP BY b.client_id
    ) AS client_total_payments ON c.id = client_total_payments.client_id
    GROUP BY c.id, c.name, c.email, c.phone, c.address, c.created_at, c.updated_at
    ORDER BY c.name;
    ";
    try {
        $stmt = $db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (PDOException $e) {
        error_log("Get all clients error: " . $e->getMessage());
        return [];
    }
}

/**
 * Fetches a single client by its ID with financial summaries.
 *
 * @param PDO $db The PDO database connection object.
 * @param int $id The ID of the client to fetch.
 * @return array|false An associative array representing the client if found, false otherwise.
 */
function get_client_by_id(PDO $db, int $id) {
    if (!$db) return false;
    ensure_clients_table_exists($db);
    // Ensure bookings and payments tables are available for subqueries
    if (function_exists('ensure_bookings_table_exists')) ensure_bookings_table_exists($db);
    if (function_exists('ensure_payments_table_exists')) ensure_payments_table_exists($db);

    $sql = "
    SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.created_at,
        c.updated_at,
        COALESCE(client_total_bookings.total_value, 0) AS total_booking_value,
        COALESCE(client_total_payments.total_paid, 0) AS total_payments_made,
        (COALESCE(client_total_bookings.total_value, 0) - COALESCE(client_total_payments.total_paid, 0)) AS outstanding_balance
    FROM
        clients c
    LEFT JOIN (
        SELECT client_id, SUM(total_amount) AS total_value
        FROM bookings
        WHERE client_id = :id
        GROUP BY client_id
    ) AS client_total_bookings ON c.id = client_total_bookings.client_id
    LEFT JOIN (
        SELECT b.client_id, SUM(p.amount_paid) AS total_paid
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE b.client_id = :id
        GROUP BY b.client_id
    ) AS client_total_payments ON c.id = client_total_payments.client_id
    WHERE c.id = :id
    GROUP BY c.id, c.name, c.email, c.phone, c.address, c.created_at, c.updated_at;
    ";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    } catch (PDOException $e) {
        error_log("Get client by ID error: " . $e->getMessage());
        return false;
    }
}

/**
 * Updates an existing client.
 *
 * @param PDO $db The PDO database connection object.
 * @param int $id The ID of the client to update.
 * @param string $name New name for the client.
 * @param string $email New email for the client.
 * @param string $phone New phone for the client.
 * @param string $address New address for the client.
 * @return bool True on success, false on failure.
 */
function update_client(PDO $db, int $id, string $name, string $email, string $phone, string $address): bool {
    if (!$db) return false;
    ensure_clients_table_exists($db);

    $sql = "UPDATE clients SET name = :name, email = :email, phone = :phone, address = :address WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        
        return $stmt->execute();
    } catch (PDOException $e) {
         // Handle potential UNIQUE constraint violation for email gracefully
        if ($e->getCode() == 23000 || strpos($e->getMessage(), 'UNIQUE constraint failed: clients.email') !== false) {
             error_log("Update client error: Email already exists for another client - " . $e->getMessage());
        } else {
            error_log("Update client error: " . $e->getMessage());
        }
        return false;
    }
}

/**
 * Deletes a client by its ID.
 * (Note: schema.sql defines ON DELETE CASCADE for bookings.client_id)
 *
 * @param PDO $db The PDO database connection object.
 * @param int $id The ID of the client to delete.
 * @return bool True on success, false on failure.
 */
function delete_client(PDO $db, int $id): bool {
    if (!$db) return false;
    ensure_clients_table_exists($db);

    $sql = "DELETE FROM clients WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Delete client error: " . $e->getMessage());
        return false;
    }
}

/**
 * Gets recently added clients.
 *
 * @param PDO $db
 * @param int $limit Number of clients to fetch.
 * @return array
 */
function get_recently_added_clients(PDO $db, int $limit = 5): array {
    if (!$db) return [];
    ensure_clients_table_exists($db);
    
    $sql = "SELECT id, name, email, created_at 
            FROM clients 
            ORDER BY created_at DESC 
            LIMIT :limit";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (PDOException $e) {
        error_log("Get recently added clients error: " . $e->getMessage());
        return [];
    }
}


// Example Usage (for testing, can be removed or commented out)
/*
$db_conn = get_db_connection();
if ($db_conn) {
    // ... (previous example usage) ...

    // Test get_recently_added_clients
    // echo "\nRecently Added Clients (limit 3):\n";
    // print_r(get_recently_added_clients($db_conn, 3));
}
*/

?>
