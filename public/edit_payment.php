<?php
require_once '../app/actions/payment_actions.php';
require_once '../app/actions/booking_actions.php'; // For booking context

$payment_id_get = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$booking_id_context_get = filter_input(INPUT_GET, 'booking_id', FILTER_VALIDATE_INT); 

$payment_data = null;
$booking_context_edit_payment = null;
$error_message_edit_payment = '';
$message_type_edit_payment = 'danger';

if (!$payment_id_get) {
    // Redirect before layout if payment ID is missing
    // Determine a sensible redirect if booking_id_context is also missing
    $fallback_redirect = $booking_id_context_get ? 
        "booking_payments.php?booking_id=" . htmlspecialchars($booking_id_context_get) . "&status_msg=invalid_payment_id" :
        "bookings.php?status_msg=invalid_payment_id";
    header("Location: " . $fallback_redirect);
    exit;
}

$db_page_specific = get_db_connection();
if (!$db_page_specific) {
    die("Database connection failed for edit payment page.");
}

if (function_exists('ensure_payments_table_exists')) ensure_payments_table_exists($db_page_specific);
$payment_data = get_payment_by_id($db_page_specific, $payment_id_get);

if (!$payment_data) {
    $redirect_url = $booking_id_context_get ? 
        "booking_payments.php?booking_id=" . htmlspecialchars($booking_id_context_get) . "&status_msg=payment_not_found" : 
        "bookings.php?status_msg=payment_not_found";
    header("Location: " . $redirect_url);
    exit;
}

// If booking_id_context was not passed via GET, use the one from the payment record.
// This is important for the cancel button link.
$booking_id_for_cancel_link = $booking_id_context_get ?: $payment_data['booking_id'];

// Fetch booking details for context display (optional but good for UI)
if ($booking_id_for_cancel_link && function_exists('get_booking_by_id')) {
    if (function_exists('ensure_bookings_table_exists')) ensure_bookings_table_exists($db_page_specific);
    $booking_context_edit_payment = get_booking_by_id($db_page_specific, $booking_id_for_cancel_link);
}

$error_type_edit_payment = $_GET['error_type'] ?? '';
if ($error_type_edit_payment === 'missing_fields') {
    $error_message_edit_payment = 'Amount Paid and Payment Date are required.';
} elseif ($error_type_edit_payment === 'invalid_amount') {
    $error_message_edit_payment = 'Invalid amount entered. Amount must be a positive number.';
} elseif ($error_type_edit_payment === 'update_failed') {
    $error_message_edit_payment = 'Failed to update payment. Please try again.';
}

// Pre-fill form data from $payment_data
$amount_paid_form_edit = $payment_data['amount_paid'];
$payment_date_form_edit = $payment_data['payment_date'];
$payment_method_form_edit = $payment_data['payment_method'] ?? '';
$notes_form_edit = $payment_data['notes'] ?? '';

require_once 'layout_header.php'; // $datetime_format_php is available from here
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Edit Payment #<?php echo htmlspecialchars($payment_data['id']); ?></h1>
        <a href="booking_payments.php?booking_id=<?php echo htmlspecialchars($booking_id_for_cancel_link); ?>" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to Booking Payments
        </a>
    </div>

    <?php if (!empty($error_message_edit_payment)): ?>
        <div class="alert alert-<?php echo $message_type_edit_payment; ?>" role="alert">
            <?php echo htmlspecialchars($error_message_edit_payment); ?>
        </div>
    <?php endif; ?>

    <?php if ($booking_context_edit_payment): ?>
    <div class="card mb-4">
        <div class="card-header">Booking Context</div>
        <div class="card-body">
            <p><strong>For Booking #<?php echo htmlspecialchars($booking_context_edit_payment['id']); ?></strong></p>
            <p><strong>Client:</strong> <?php echo htmlspecialchars($booking_context_edit_payment['client_name']); ?></p>
            <p><strong>Booking Date:</strong> <?php echo format_datetime_user($booking_context_edit_payment['booking_date'] . ($booking_context_edit_payment['booking_time'] ? ' ' . $booking_context_edit_payment['booking_time'] : ''), $datetime_format_php); ?></p>
        </div>
    </div>
    <?php else: ?>
        <p class="text-muted"><em>Booking context not fully loaded. Editing payment for Booking ID: <?php echo htmlspecialchars($payment_data['booking_id']); ?></em></p>
    <?php endif; ?>
    
    <div class="card">
        <div class="card-header">
            Edit Payment Details
        </div>
        <div class="card-body">
            <form action="edit_payment_handler.php" method="POST">
                <input type="hidden" name="id" value="<?php echo htmlspecialchars($payment_data['id']); ?>">
                <input type="hidden" name="booking_id" value="<?php echo htmlspecialchars($payment_data['booking_id']); ?>"> <!-- Used by handler for redirect -->
                
                <div class="mb-3">
                    <label for="amount_paid" class="form-label">Amount Paid <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="amount_paid" name="amount_paid" step="0.01" value="<?php echo htmlspecialchars($amount_paid_form_edit); ?>" required>
                </div>
                <div class="mb-3">
                    <label for="payment_date" class="form-label">Payment Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="payment_date" name="payment_date" value="<?php echo htmlspecialchars($payment_date_form_edit); ?>" required>
                </div>
                <div class="mb-3">
                    <label for="payment_method" class="form-label">Payment Method (Optional)</label>
                    <input type="text" class="form-control" id="payment_method" name="payment_method" value="<?php echo htmlspecialchars($payment_method_form_edit); ?>" placeholder="e.g., Cash, Card, Bank Transfer">
                </div>
                <div class="mb-3">
                    <label for="notes" class="form-label">Notes (Optional)</label>
                    <textarea class="form-control" id="notes" name="notes" rows="3"><?php echo htmlspecialchars($notes_form_edit); ?></textarea>
                </div>
                
                <button type="submit" class="btn btn-success"><i class="bi bi-check-circle-fill me-2"></i>Update Payment</button>
                <a href="booking_payments.php?booking_id=<?php echo htmlspecialchars($booking_id_for_cancel_link); ?>" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
</div>

<?php
require_once 'layout_footer.php';
?>
