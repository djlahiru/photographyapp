<?php
require_once '../app/actions/payment_actions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payment_id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $booking_id = filter_input(INPUT_POST, 'booking_id', FILTER_VALIDATE_INT); // For redirecting
    
    $amount_paid_str = trim($_POST['amount_paid'] ?? '');
    $payment_date = trim($_POST['payment_date'] ?? '');
    $payment_method = trim($_POST['payment_method'] ?? '');
    if (empty($payment_method)) $payment_method = null;
    $notes = trim($_POST['notes'] ?? '');
    if (empty($notes)) $notes = null;

    // Validate IDs
    if (!$payment_id || !$booking_id) {
        // If booking_id is missing, redirect to general bookings page.
        // If payment_id is missing, it's a bad request.
        $redirect_url = $booking_id ? "booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=edit_error" : "bookings.php?status=edit_error";
        header("Location: " . $redirect_url);
        exit;
    }

    // Validate amount_paid
    $amount_paid = filter_var($amount_paid_str, FILTER_VALIDATE_FLOAT);
    if ($amount_paid === false || $amount_paid <= 0) { // Amount must be positive
        header("Location: edit_payment.php?id=" . htmlspecialchars($payment_id) . "&booking_id=" . htmlspecialchars($booking_id) . "&error=invalid_amount");
        exit;
    }

    // Validate payment_date
    if (empty($payment_date)) {
        header("Location: edit_payment.php?id=" . htmlspecialchars($payment_id) . "&booking_id=" . htmlspecialchars($booking_id) . "&error=missing_fields");
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        header("Location: booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=edit_error");
        exit;
    }
    
    if (function_exists('ensure_payments_table_exists')) ensure_payments_table_exists($db);

    $success = update_payment($db, $payment_id, $amount_paid, $payment_date, $payment_method, $notes);

    if ($success) {
        header("Location: booking_payments.php?booking_id=" . htmlspecialchars($booking_id) . "&status=edit_success");
        exit;
    } else {
        // Redirect back to edit form with error
        header("Location: edit_payment.php?id=" . htmlspecialchars($payment_id) . "&booking_id=" . htmlspecialchars($booking_id) . "&error=update_failed");
        exit;
    }
} else {
    // Not a POST request
    header("Location: bookings.php");
    exit;
}
?>
