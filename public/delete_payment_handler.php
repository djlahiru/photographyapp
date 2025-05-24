<?php
require_once '../app/actions/payment_actions.php';

$payment_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
// booking_id is needed to redirect back to the correct booking's payment page
$booking_id = filter_input(INPUT_GET, 'booking_id', FILTER_VALIDATE_INT); 

if (!$payment_id || !$booking_id) {
    // If booking_id is missing, we can't redirect properly, so go to main bookings list as a fallback.
    // If payment_id is missing, it's an invalid request.
    $redirect_url = $booking_id ? "booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=delete_error" : "bookings.php?status=delete_error";
    if (!$payment_id) { // More specific error if payment_id is missing
         $redirect_url = $booking_id ? "booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=invalid_payment_id" : "bookings.php?status=invalid_payment_id";
    }
    header("Location: " . $redirect_url);
    exit;
}

$db = get_db_connection();
if (!$db) {
    header("Location: booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=delete_error");
    exit;
}

if (function_exists('ensure_payments_table_exists')) ensure_payments_table_exists($db);

$success = delete_payment($db, $payment_id);

if ($success) {
    header("Location: booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=delete_success");
    exit;
} else {
    header("Location: booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=delete_error");
    exit;
}
?>
