<?php
require_once '../app/actions/booking_actions.php'; 
require_once '../app/actions/google_calendar_actions.php'; // For GCal integration

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
        if ($total_amount === false) {
            // Handle invalid float format, perhaps redirect with error
            // For now, let it be null and package price logic (if applicable) might take over
            $total_amount = null; 
        }
    }

    $notes = trim($_POST['notes'] ?? '');
    if (empty($notes)) $notes = null;

    // Category is not part of the simplified create_booking signature from prompt
    // $category = trim($_POST['category'] ?? '');
    // if (empty($category)) $category = null;


    // Basic validation
    if (empty($client_id) || empty($booking_date)) {
        // Build query string to retain form data
        $query_params = http_build_query([
            'error' => 'missing_fields',
            'client_id' => $client_id,
            'package_id' => $package_id,
            'booking_date' => $booking_date,
            'booking_time' => $booking_time,
            'location' => $location,
            'total_amount' => $total_amount_str, // send back original string
            'notes' => $notes
            // 'category' => $category
        ]);
        header("Location: add_booking.php?" . $query_params);
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        header("Location: bookings.php?status=add_error"); 
        exit;
    }
    // Ensure tables are ready (good practice, though add_booking.php also does it for dropdowns)
    if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
    if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);
    ensure_bookings_table_exists($db);


    // Call create_booking. The function will handle total_amount based on package if total_amount is null.
    $bookingId = create_booking($db, $client_id, $package_id, $booking_date, $booking_time, $location, $total_amount, $notes);

    if ($bookingId) {
        // Attempt to add to Google Calendar if connected
        $user_settings_for_gcal = get_user_settings($db); // From settings_actions.php (included via google_calendar_actions.php)
        if ($user_settings_for_gcal && !empty($user_settings_for_gcal['google_access_token'])) {
            $new_booking_details = get_booking_by_id($db, $bookingId); // Fetch full details for GCal
            if ($new_booking_details) {
                $gcal_event_id = add_booking_to_gcal($db, $new_booking_details);
                if ($gcal_event_id) {
                    // Success, gcal_event_id is already saved in add_booking_to_gcal
                    // Optionally add a specific success message for GCal sync
                } else {
                    // Log or set a session flash message that GCal sync failed
                    $_SESSION['gcal_sync_error'] = "Booking saved locally, but failed to sync to Google Calendar.";
                }
            }
        }
        
        $redirect_status = 'add_success';
        if(isset($_SESSION['gcal_sync_error'])) {
            // Potentially append a gcal_sync_status to the redirect URL if you want to display it
            // For now, the main success is booking creation. GCal error is logged.
        }
        header("Location: bookings.php?status_msg=" . $redirect_status); // Use status_msg
        exit;
    } else {
        // More specific error handling for FK violations if create_booking indicates it
        // For now, a generic error, or could try to infer from $db->errorInfo() if not in transaction
        // The create_booking itself logs specific PDO errors.
        // We can check if the error was due to FK constraint:
        $lastError = $db->errorInfo();
        if (isset($lastError[1]) && ($lastError[1] == 19 || strpos(strtolower($lastError[2]), 'foreign key constraint failed') !== false)) {
             header("Location: add_booking.php?error=fk_constraint&client_id=$client_id&package_id=$package_id&booking_date=$booking_date&booking_time=$booking_time&location=$location&total_amount=$total_amount_str&notes=$notes");
        } else {
             header("Location: add_booking.php?error=db_error&client_id=$client_id&package_id=$package_id&booking_date=$booking_date&booking_time=$booking_time&location=$location&total_amount=$total_amount_str&notes=$notes");
        }
        exit;
    }
} else {
    // Not a POST request
    header("Location: bookings.php");
    exit;
}
?>
