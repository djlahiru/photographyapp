<?php
require_once '../app/actions/booking_actions.php'; // This defines ALLOWED_BOOKING_STATUSES
require_once '../app/actions/google_calendar_actions.php'; // For GCal integration

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $booking_id = filter_input(INPUT_POST, 'booking_id', FILTER_VALIDATE_INT);
    $new_status = trim($_POST['status'] ?? '');

    // For preserving filters on redirect
    $current_status_filter = trim($_POST['current_status_filter'] ?? '');
    $current_category_filter = trim($_POST['current_category_filter'] ?? '');

    $redirect_params = [];
    if (!empty($current_status_filter)) {
        $redirect_params['status_filter'] = $current_status_filter;
    }
    if (!empty($current_category_filter)) {
        $redirect_params['category_filter'] = $current_category_filter;
    }

    if (!$booking_id || empty($new_status)) {
        $redirect_params['status_msg'] = 'status_update_error'; // More specific: 'invalid_input'
        header("Location: bookings.php?" . http_build_query($redirect_params));
        exit;
    }

    // Validate $new_status against allowed statuses (defined in booking_actions.php)
    if (!in_array($new_status, ALLOWED_BOOKING_STATUSES, true)) {
        $redirect_params['status_msg'] = 'status_update_error'; // More specific: 'invalid_status_value'
        header("Location: bookings.php?" . http_build_query($redirect_params));
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        $redirect_params['status_msg'] = 'status_update_error'; // More specific: 'db_connection_failed'
        header("Location: bookings.php?" . http_build_query($redirect_params));
        exit;
    }
    
    // ensure_bookings_table_exists is called within update_booking_status
    $local_status_update_success = update_booking_status($db, $booking_id, $new_status);

    if ($local_status_update_success) {
        $redirect_params['status_msg'] = 'status_update_success';

        // Google Calendar Sync Logic
        $user_settings_for_gcal = get_user_settings($db); // From settings_actions.php
        if ($user_settings_for_gcal && !empty($user_settings_for_gcal['google_access_token'])) {
            $booking_details = get_booking_by_id($db, $booking_id); // Fetch details for GCal processing

            if ($booking_details) {
                if ($new_status === 'cancelled') {
                    if (!empty($booking_details['google_calendar_event_id'])) {
                        if (delete_booking_from_gcal($db, $booking_details['google_calendar_event_id'])) {
                            // Clear local GCal event ID after successful deletion from GCal
                            $db->prepare("UPDATE bookings SET google_calendar_event_id = NULL WHERE id = :id")
                               ->execute([':id' => $booking_id]);
                        } else {
                             $_SESSION['gcal_sync_error'] = "Booking status updated, but failed to delete event from Google Calendar.";
                        }
                    }
                } elseif ($new_status === 'confirmed') {
                    if (empty($booking_details['google_calendar_event_id'])) {
                        // If confirmed and no GCal event ID, try to add it
                        if (!add_booking_to_gcal($db, $booking_details)) {
                             $_SESSION['gcal_sync_error'] = "Booking status updated, but failed to add event to Google Calendar.";
                        }
                    } else {
                        // If confirmed and already has a GCal event ID, ensure it's up-to-date
                        // (e.g. if it was previously 'pending' and details might have changed, though this handler only changes status)
                        if (!update_booking_in_gcal($db, $booking_details)) {
                             $_SESSION['gcal_sync_error'] = "Booking status updated, but failed to update event in Google Calendar.";
                        }
                    }
                } else { 
                    // For other status changes (e.g., to 'pending' or 'completed'),
                    // we might want to update the GCal event (e.g., change its color or description if our logic supports it)
                    // For now, we primarily ensure 'confirmed' events are on GCal and 'cancelled' are removed.
                    // If it has a GCal ID, an update might be relevant.
                    if (!empty($booking_details['google_calendar_event_id'])) {
                         if (!update_booking_in_gcal($db, $booking_details)) { // update_booking_in_gcal updates summary/desc which includes status
                             $_SESSION['gcal_sync_error'] = "Booking status updated, but failed to update event in Google Calendar.";
                        }
                    }
                }
            }
        }
    } else {
        $redirect_params['status_msg'] = 'status_update_error';
    }
    header("Location: bookings.php?" . http_build_query($redirect_params));
    exit;

} else {
    // Not a POST request, redirect to bookings page without any specific message or preserving filters
    header("Location: bookings.php");
    exit;
}
?>
