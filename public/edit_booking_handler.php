<?php
require_once '../app/actions/booking_actions.php';
require_once '../app/actions/google_calendar_actions.php'; // For GCal integration

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
    
    $category = trim($_POST['category'] ?? '');
    if (empty($category)) $category = null;

    // Status is not updated by this handler, it's managed by update_booking_status_handler.php

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
    // Category is now passed.
    $success = update_booking($db, $booking_id, $client_id, $package_id, $booking_date, $booking_time, $location, $total_amount, $notes, $category);

    if ($success) {
        // Attempt to update Google Calendar if connected
        $user_settings_for_gcal = get_user_settings($db); // From settings_actions.php (included via google_calendar_actions.php)
        if ($user_settings_for_gcal && !empty($user_settings_for_gcal['google_access_token'])) {
            $updated_booking_details = get_booking_by_id($db, $booking_id); // Fetch full details for GCal
            if ($updated_booking_details) {
                // update_booking_in_gcal will try to add if GCal event ID is missing or event not found on GCal
                $gcal_event_id = update_booking_in_gcal($db, $updated_booking_details);
                if ($gcal_event_id) {
                    // Optionally add a specific success message for GCal sync
                } else {
                    // Log or set a session flash message that GCal sync failed
                    $_SESSION['gcal_sync_error'] = "Booking updated locally, but failed to sync/update to Google Calendar.";
                }
            }
        }
        
        $redirect_status = 'edit_success';
        // Similar to add_booking_handler, can check $_SESSION['gcal_sync_error'] if needed
        header("Location: bookings.php?status_msg=" . $redirect_status); // Use status_msg
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
