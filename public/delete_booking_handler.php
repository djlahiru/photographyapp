<?php
require_once '../app/actions/booking_actions.php';
require_once '../app/actions/google_calendar_actions.php'; // For GCal integration

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

// Attempt to delete from Google Calendar first
$user_settings_for_gcal = get_user_settings($db); // From settings_actions.php (included via google_calendar_actions.php)
if ($user_settings_for_gcal && !empty($user_settings_for_gcal['google_access_token'])) {
    $booking_to_delete = get_booking_by_id($db, (int)$booking_id); // Fetch details before deleting
    if ($booking_to_delete && !empty($booking_to_delete['google_calendar_event_id'])) {
        if (!delete_booking_from_gcal($db, $booking_to_delete['google_calendar_event_id'])) {
            // Log or set a session flash message that GCal delete failed
            $_SESSION['gcal_sync_error'] = "Booking deleted locally, but failed to delete from Google Calendar.";
        }
    }
}

$success = delete_booking($db, (int)$booking_id);

if ($success) {
    $redirect_status = 'delete_success';
    header("Location: bookings.php?status_msg=" . $redirect_status); // Use status_msg
    exit;
} else {
    // Could be due to FK constraints if payments table existed and wasn't ON DELETE CASCADE for booking_id
    // For now, a generic error. booking_actions.php logs specific PDO errors.
    header("Location: bookings.php?status_msg=delete_error"); // Use status_msg
    exit;
}
?>
