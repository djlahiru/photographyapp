<?php
require_once '../app/actions/package_actions.php';

$package_id = $_GET['id'] ?? null;

if (!$package_id || !is_numeric($package_id)) {
    // Invalid ID, redirect with error
    header("Location: packages.php?status=delete_error");
    exit;
}

$db = get_db_connection();
if (!$db) {
    // Database connection error
    header("Location: packages.php?status=delete_error");
    exit;
}
ensure_packages_table_exists($db);

$success = delete_package($db, (int)$package_id);

if ($success) {
    header("Location: packages.php?status=delete_success");
    exit;
} else {
    header("Location: packages.php?status=delete_error");
    exit;
}
?>
