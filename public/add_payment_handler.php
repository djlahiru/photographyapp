<?php
require_once '../app/actions/payment_actions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $booking_id = filter_input(INPUT_POST, 'booking_id', FILTER_VALIDATE_INT);
    $amount_paid_str = trim($_POST['amount_paid'] ?? '');
    $payment_date = trim($_POST['payment_date'] ?? '');
    $payment_method = trim($_POST['payment_method'] ?? '');
    if (empty($payment_method)) $payment_method = null;
    $notes = trim($_POST['notes'] ?? '');
    if (empty($notes)) $notes = null;

    // Validate booking_id
    if (!$booking_id) {
        // This case should ideally not happen if form is submitted correctly
        header("Location: bookings.php?status=invalid_id"); 
        exit;
    }

    // Validate amount_paid
    $amount_paid = filter_var($amount_paid_str, FILTER_VALIDATE_FLOAT);
    if ($amount_paid === false || $amount_paid <= 0) { // Amount must be positive
        $query_params = http_build_query([
            'booking_id' => $booking_id,
            'error' => 'invalid_amount',
            'amount_paid' => $amount_paid_str,
            'payment_date' => $payment_date,
            'payment_method' => $payment_method,
            'notes' => $notes
        ]);
        header("Location: add_payment.php?" . $query_params);
        exit;
    }

    // Validate payment_date (basic check for emptiness)
    if (empty($payment_date)) {
         $query_params = http_build_query([
            'booking_id' => $booking_id,
            'error' => 'missing_fields',
            'amount_paid' => $amount_paid_str,
            'payment_date' => $payment_date,
            'payment_method' => $payment_method,
            'notes' => $notes
        ]);
        header("Location: add_payment.php?" . $query_params);
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        header("Location: booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=add_error");
        exit;
    }
    
    // Ensure payments table exists (good practice)
    if (function_exists('ensure_payments_table_exists')) ensure_payments_table_exists($db);
    // Also ensure bookings table exists for FK integrity, though payment_actions doesn't call it directly
    if (function_exists('ensure_bookings_table_exists')) ensure_bookings_table_exists($db);


    $paymentId = create_payment($db, $booking_id, $amount_paid, $payment_date, $payment_method, $notes);

    if ($paymentId) {
        header("Location: booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=add_success");
        exit;
    } else {
        // Check for foreign key constraint violation (e.g., booking_id does not exist)
        // This is a basic check; more specific error codes from create_payment would be better.
        $lastError = $db->errorInfo();
        $error_type = 'add_error'; // generic
        if (isset($lastError[1]) && ($lastError[1] == 19 || strpos(strtolower($lastError[2]), 'foreign key constraint failed') !== false)) {
            $error_type = 'fk_error'; // This indicates booking_id might be invalid
        }
         $query_params = http_build_query([
            'booking_id' => $booking_id,
            'error' => $error_type, // Use more specific error if available
            'amount_paid' => $amount_paid_str,
            'payment_date' => $payment_date,
            'payment_method' => $payment_method,
            'notes' => $notes
        ]);
        // Redirect to add_payment.php if it's a form error, or booking_payments.php for general DB errors
        if ($error_type === 'fk_error') { // Unlikely if page loaded correctly, but good check
             header("Location: booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=add_error");
        } else {
             header("Location: add_payment.php?" . $query_params);
        }
        exit;
    }
} else {
    // Not a POST request
    header("Location: bookings.php"); // Redirect to main bookings list if accessed directly
    exit;
}
?>
