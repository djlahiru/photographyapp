<?php
require_once '../app/actions/booking_actions.php'; // Main actions for bookings
// client_actions.php and package_actions.php are not directly called here,
// but their tables (clients, packages) must exist for FK constraints.
// booking_actions.php's ensure_bookings_table_exists should be robust enough,
// or we assume they are created by their respective UI/listing pages.

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
        header("Location: bookings.php?status=add_success");
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
