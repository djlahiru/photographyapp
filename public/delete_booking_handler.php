<?php
require_once '../app/actions/booking_actions.php';

$booking_id = $_GET['id'] ?? null;

if (!$booking_id || !is_numeric($booking_id)) {
    // Invalid ID, redirect with error
    header("Location: bookings.php?status=invalid_id");
    exit;
}

$db = get_db_connection();
if (!$db) {
    // Database connection error
    header("Location: bookings.php?status=delete_error");
    exit;
}
// Ensure table exists - good practice, though booking_actions.php also does this.
ensure_bookings_table_exists($db); 

$success = delete_booking($db, (int)$booking_id);

if ($success) {
    header("Location: bookings.php?status=delete_success");
    exit;
} else {
    // Could be due to FK constraints if payments table existed and wasn't ON DELETE CASCADE for booking_id
    // For now, a generic error. booking_actions.php logs specific PDO errors.
    header("Location: bookings.php?status=delete_error");
    exit;
}
?>
