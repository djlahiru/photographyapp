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
 * Fetches all clients from the database.
 *
 * @param PDO $db The PDO database connection object.
 * @return array An array of associative arrays representing clients, or an empty array on failure/no clients.
 */
function get_all_clients(PDO $db): array {
    if (!$db) return [];
    ensure_clients_table_exists($db);

    $sql = "SELECT * FROM clients";
    try {
        $stmt = $db->query($sql);
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add placeholder fields
        $clients_with_placeholders = [];
        foreach ($clients as $client) {
            $client['total_payments_made'] = 0.0;
            $client['outstanding_balance'] = 0.0;
            $clients_with_placeholders[] = $client;
        }
        return $clients_with_placeholders;
    } catch (PDOException $e) {
        error_log("Get all clients error: " . $e->getMessage());
        return [];
    }
}

/**
 * Fetches a single client by its ID.
 *
 * @param PDO $db The PDO database connection object.
 * @param int $id The ID of the client to fetch.
 * @return array|false An associative array representing the client if found, false otherwise.
 */
function get_client_by_id(PDO $db, int $id) {
    if (!$db) return false;
    ensure_clients_table_exists($db);

    $sql = "SELECT * FROM clients WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $client = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($client) {
            // Add placeholder fields
            $client['total_payments_made'] = 0.0;
            $client['outstanding_balance'] = 0.0;
        }
        return $client ?: false;
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

// Example Usage (for testing, can be removed or commented out)
/*
$db_conn = get_db_connection();
if ($db_conn) {
    echo "DB Connection successful.\n";
    ensure_clients_table_exists($db_conn);
    echo "Clients table ensured.\n";

    // Test create_client
    $newClientId = create_client($db_conn, "John Doe", "john.doe@example.com", "123-456-7890", "123 Main St");
    if ($newClientId) {
        echo "Created client with ID: " . $newClientId . "\n";
    } else {
        echo "Failed to create client (or email already exists).\n";
        // Try with a different email if the first one failed due to UNIQUE constraint
        $newClientId = create_client($db_conn, "Jane Doe", "jane.doe@example.com", "987-654-3210", "456 Oak Ave");
        if ($newClientId) {
            echo "Created client with ID: " . $newClientId . "\n";
        } else {
            echo "Failed to create second client.\n";
        }
    }

    // Test get_all_clients
    $clients = get_all_clients($db_conn);
    echo "All clients: \n";
    print_r($clients);

    // Test get_client_by_id
    if ($newClientId) {
        $client = get_client_by_id($db_conn, $newClientId);
        echo "Client by ID " . $newClientId . ": \n";
        print_r($client);
    }

    // Test update_client
    if ($newClientId) {
        $updated = update_client($db_conn, $newClientId, "Jane Smith", "jane.smith@example.com", "555-555-5555", "789 Pine Ln");
        if ($updated) {
            echo "Client " . $newClientId . " updated successfully.\n";
            $client = get_client_by_id($db_conn, $newClientId);
            print_r($client);
        } else {
            echo "Failed to update client " . $newClientId . " (or email conflict).\n";
        }
    }

    // Test delete_client
    // if ($newClientId) {
    //     $deleted = delete_client($db_conn, $newClientId);
    //     if ($deleted) {
    //         echo "Client " . $newClientId . " deleted successfully.\n";
    //     } else {
    //         echo "Failed to delete client " . $newClientId . ".\n";
    //     }
    // }
} else {
    echo "DB Connection failed.\n";
}
*/

?>
