<?php
require_once '../app/actions/client_actions.php';

$client_id = $_GET['id'] ?? null;

if (!$client_id || !is_numeric($client_id)) {
    // Invalid ID, redirect with error
    header("Location: clients.php?status=invalid_id");
    exit;
}

$db = get_db_connection();
if (!$db) {
    // Database connection error
    header("Location: clients.php?status=delete_error");
    exit;
}
ensure_clients_table_exists($db); // Good practice, though actions usually call it

$success = delete_client($db, (int)$client_id);

if ($success) {
    header("Location: clients.php?status=delete_success");
    exit;
} else {
    header("Location: clients.php?status=delete_error");
    exit;
}
?>
