<?php

// Placeholder for database connection
function get_db_connection() {
    static $db = null;
    if ($db === null) {
        try {
            // Corrected path relative to this file's location (app/actions/package_actions.php)
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

// Ensure schema (specifically packages table) is loaded for these actions.
function ensure_packages_table_exists(PDO $db) {
    if (!$db) return; // Do nothing if DB connection failed

    try {
        // Check if the packages table exists by trying to query it.
        // If it doesn't exist, an exception will be thrown.
        $db->query("SELECT 1 FROM packages LIMIT 1");
    } catch (PDOException $e) {
        // Table likely doesn't exist, try to create it.
        // This schema should only contain the packages table and its related triggers.
        $packages_schema = "
        CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            services_included TEXT, -- Comma-separated list or JSON
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TRIGGER IF NOT EXISTS packages_updated_at
        AFTER UPDATE ON packages
        FOR EACH ROW
        BEGIN
            UPDATE packages SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
        ";
        try {
            $db->exec($packages_schema);
        } catch (PDOException $exec_e) {
            error_log("Failed to create packages table: " . $exec_e->getMessage());
            // If table creation fails, we can't proceed with package actions.
        }
    }
}


/**
 * Creates a new package in the database.
 *
 * @param PDO $db The PDO database connection object.
 * @param string $name Name of the package.
 * @param string $description Description of the package.
 * @param float $price Price of the package.
 * @param string $services_included Services included in the package.
 * @return bool|int The ID of the newly created package on success, false on failure.
 */
function create_package(PDO $db, string $name, string $description, float $price, string $services_included) {
    if (!$db) return false;
    ensure_packages_table_exists($db);

    $sql = "INSERT INTO packages (name, description, price, services_included) VALUES (:name, :description, :price, :services_included)";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':services_included', $services_included);
        
        if ($stmt->execute()) {
            return (int)$db->lastInsertId();
        } else {
            return false;
        }
    } catch (PDOException $e) {
        error_log("Create package error: " . $e->getMessage());
        return false;
    }
}

/**
 * Fetches all packages from the database.
 *
 * @param PDO $db The PDO database connection object.
 * @return array An array of associative arrays representing packages, or an empty array on failure/no packages.
 */
function get_all_packages(PDO $db): array {
    if (!$db) return [];
    ensure_packages_table_exists($db);

    $sql = "SELECT * FROM packages";
    try {
        $stmt = $db->query($sql);
        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $packages ?: [];
    } catch (PDOException $e) {
        error_log("Get all packages error: " . $e->getMessage());
        return [];
    }
}

/**
 * Fetches a single package by its ID.
 *
 * @param PDO $db The PDO database connection object.
 * @param int $id The ID of the package to fetch.
 * @return array|false An associative array representing the package if found, false otherwise.
 */
function get_package_by_id(PDO $db, int $id) {
    if (!$db) return false;
    ensure_packages_table_exists($db);

    $sql = "SELECT * FROM packages WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $package = $stmt->fetch(PDO::FETCH_ASSOC);
        return $package ?: false;
    } catch (PDOException $e) {
        error_log("Get package by ID error: " . $e->getMessage());
        return false;
    }
}

/**
 * Updates an existing package.
 *
 * @param PDO $db The PDO database connection object.
 * @param int $id The ID of the package to update.
 * @param string $name New name for the package.
 * @param string $description New description for the package.
 * @param float $price New price for the package.
 * @param string $services_included New list of services included.
 * @return bool True on success, false on failure.
 */
function update_package(PDO $db, int $id, string $name, string $description, float $price, string $services_included): bool {
    if (!$db) return false;
    ensure_packages_table_exists($db);

    // The updated_at column will be updated by the trigger
    $sql = "UPDATE packages SET name = :name, description = :description, price = :price, services_included = :services_included WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':services_included', $services_included);
        
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Update package error: " . $e->getMessage());
        return false;
    }
}

/**
 * Deletes a package by its ID.
 *
 * @param PDO $db The PDO database connection object.
 * @param int $id The ID of the package to delete.
 * @return bool True on success, false on failure.
 */
function delete_package(PDO $db, int $id): bool {
    if (!$db) return false;
    ensure_packages_table_exists($db);

    $sql = "DELETE FROM packages WHERE id = :id";
    try {
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Delete package error: " . $e->getMessage());
        return false;
    }
}

// Example of how to initialize and use (for testing purposes, can be removed)
/*
$db = get_db_connection();
if ($db) {
    echo "DB Connection successful.\n";
    ensure_packages_table_exists($db); // Make sure table is there
    echo "Packages table ensured.\n";

    // Test create_package
    $newPackageId = create_package($db, "Test Package", "This is a test.", 99.99, "Service A, Service B");
    if ($newPackageId) {
        echo "Created package with ID: " . $newPackageId . "\n";
    } else {
        echo "Failed to create package.\n";
    }

    // Test get_all_packages
    $packages = get_all_packages($db);
    echo "All packages: \n";
    print_r($packages);

    // Test get_package_by_id
    if ($newPackageId) {
        $package = get_package_by_id($db, $newPackageId);
        echo "Package by ID " . $newPackageId . ": \n";
        print_r($package);
    }

    // Test update_package
    if ($newPackageId) {
        $updated = update_package($db, $newPackageId, "Updated Test Package", "Updated description.", 129.99, "Service A, Service C");
        if ($updated) {
            echo "Package " . $newPackageId . " updated successfully.\n";
            $package = get_package_by_id($db, $newPackageId);
            print_r($package);
        } else {
            echo "Failed to update package " . $newPackageId . ".\n";
        }
    }

    // Test delete_package
    // if ($newPackageId) {
    //     $deleted = delete_package($db, $newPackageId);
    //     if ($deleted) {
    //         echo "Package " . $newPackageId . " deleted successfully.\n";
    //     } else {
    //         echo "Failed to delete package " . $newPackageId . ".\n";
    //     }
    // }
    
} else {
    echo "DB Connection failed.\n";
}
*/

?>
