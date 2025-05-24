<?php
require_once '../app/actions/booking_actions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $booking_id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $client_id = filter_input(INPUT_POST, 'client_id', FILTER_VALIDATE_INT);
    $package_id = filter_input(INPUT_POST, 'package_id', FILTER_VALIDATE_INT);
    if ($package_id === false || $package_id === 0) { // Allow "No Package" or empty selection
        $package_id = null;
    }

    $booking_date = trim($_POST['booking_date'] ?? '');
    $booking_time = trim($_POST['booking_time'] ?? '');
    if (empty($booking_time)) $booking_time = null;

    $location = trim($_POST['location'] ?? '');
    if (empty($location)) $location = null;

    $total_amount_str = trim($_POST['total_amount'] ?? '');
    $total_amount = null;
    if ($total_amount_str !== '') {
        $total_amount = filter_var($total_amount_str, FILTER_VALIDATE_FLOAT);
         if ($total_amount === false) { // Invalid float, treat as not provided for logic in update_booking
            $total_amount = null; 
        }
    }
    
    $notes = trim($_POST['notes'] ?? '');
    if (empty($notes)) $notes = null;

    // Category & Status are not part of the simplified update_booking signature from prompt.
    // They are shown as read-only in edit_booking.php.

    // Basic validation
    if (empty($booking_id) || empty($client_id) || empty($booking_date)) {
        // Redirect back to edit form with error
        $redirect_url = $booking_id ? "edit_booking.php?id=" . urlencode($booking_id) . "&error=missing_fields" : "bookings.php?status=edit_error";
        header("Location: " . $redirect_url);
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        header("Location: bookings.php?status=edit_error");
        exit;
    }
    // Ensure tables are ready
    if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
    if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);
    ensure_bookings_table_exists($db);

    // Call update_booking. The function will handle total_amount based on package if total_amount is null.
    $success = update_booking($db, $booking_id, $client_id, $package_id, $booking_date, $booking_time, $location, $total_amount, $notes);

    if ($success) {
        header("Location: bookings.php?status=edit_success");
        exit;
    } else {
        // More specific error can be passed if update_booking provides it
        // For now, a general update error or FK constraint error
        $lastError = $db->errorInfo();
         if (isset($lastError[1]) && ($lastError[1] == 19 || strpos(strtolower($lastError[2]), 'foreign key constraint failed') !== false)) {
            header("Location: edit_booking.php?id=" . urlencode($booking_id) . "&error=fk_constraint");
        } else {
            header("Location: edit_booking.php?id=" . urlencode($booking_id) . "&error=update_failed");
        }
        exit;
    }
} else {
    // Not a POST request
    header("Location: bookings.php");
    exit;
}
?>
