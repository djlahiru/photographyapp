<?php
require_once '../app/actions/booking_actions.php'; // To get booking details for context

$booking_id_for_payment = filter_input(INPUT_GET, 'booking_id', FILTER_VALIDATE_INT);

if (!$booking_id_for_payment) {
    header("Location: bookings.php?status_msg=invalid_id"); // Redirect before layout is loaded
    exit;
}

$db_page_specific = get_db_connection();
if (!$db_page_specific) {
    die("Database connection failed for add payment page.");
}

if (function_exists('ensure_bookings_table_exists')) ensure_bookings_table_exists($db_page_specific);
$booking_context = get_booking_by_id($db_page_specific, $booking_id_for_payment);

if (!$booking_context) {
    header("Location: bookings.php?status_msg=not_found&id=" . htmlspecialchars($booking_id_for_payment)); // Redirect before layout
    exit;
}

$error_message_add_payment = '';
$error_type_add_payment = $_GET['error_type'] ?? ''; // Consistent with handler redirect

if ($error_type_add_payment === 'missing_fields') {
    $error_message_add_payment = 'Amount Paid and Payment Date are required.';
} elseif ($error_type_add_payment === 'invalid_amount') {
    $error_message_add_payment = 'Invalid amount entered. Amount must be a positive number.';
} elseif ($error_type_add_payment === 'db_error' || $error_type_add_payment === 'fk_error') {
     $error_message_add_payment = 'A database error occurred while saving the payment. Please ensure the booking still exists and try again.';
}

// Retain form values
$amount_paid_form = $_GET['amount_paid'] ?? '';
$payment_date_form = $_GET['payment_date'] ?? date('Y-m-d'); // Default to today
$payment_method_form = $_GET['payment_method'] ?? '';
$notes_form = $_GET['notes'] ?? '';

require_once 'layout_header.php'; // $datetime_format_php is available from here
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Add Payment for Booking #<?php echo htmlspecialchars($booking_context['id']); ?></h1>
        <a href="booking_payments.php?booking_id=<?php echo $booking_context['id']; ?>" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to Booking Payments
        </a>
    </div>

    <?php if (!empty($error_message_add_payment)): ?>
        <div class="alert alert-danger" role="alert">
            <?php echo htmlspecialchars($error_message_add_payment); ?>
        </div>
    <?php endif; ?>

    <div class="card mb-4">
        <div class="card-header">Booking Context</div>
        <div class="card-body">
             <p><strong>Client:</strong> <?php echo htmlspecialchars($booking_context['client_name']); ?></p>
             <p><strong>Booking Date:</strong> <?php echo format_datetime_user($booking_context['booking_date'] . ($booking_context['booking_time'] ? ' ' . $booking_context['booking_time'] : ''), $datetime_format_php); ?></p>
             <p><strong>Total Booking Amount:</strong> $<?php echo htmlspecialchars(number_format((float)($booking_context['total_amount'] ?? 0), 2)); ?></p>
        </div>
    </div>
    
    <div class="card">
        <div class="card-header">
            New Payment Details
        </div>
        <div class="card-body">
            <form action="add_payment_handler.php" method="POST">
                <input type="hidden" name="booking_id" value="<?php echo htmlspecialchars($booking_context['id']); ?>">
                
                <div class="mb-3">
                    <label for="amount_paid" class="form-label">Amount Paid <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="amount_paid" name="amount_paid" step="0.01" value="<?php echo htmlspecialchars($amount_paid_form); ?>" required>
                </div>
                <div class="mb-3">
                    <label for="payment_date" class="form-label">Payment Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="payment_date" name="payment_date" value="<?php echo htmlspecialchars($payment_date_form); ?>" required>
                </div>
                <div class="mb-3">
                    <label for="payment_method" class="form-label">Payment Method (Optional)</label>
                    <input type="text" class="form-control" id="payment_method" name="payment_method" value="<?php echo htmlspecialchars($payment_method_form); ?>" placeholder="e.g., Cash, Card, Bank Transfer">
                </div>
                <div class="mb-3">
                    <label for="notes" class="form-label">Notes (Optional)</label>
                    <textarea class="form-control" id="notes" name="notes" rows="3"><?php echo htmlspecialchars($notes_form); ?></textarea>
                </div>
                
                <button type="submit" class="btn btn-success"><i class="bi bi-check-circle-fill me-2"></i>Save Payment</button>
                <a href="booking_payments.php?booking_id=<?php echo $booking_context['id']; ?>" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
</div>

<?php
require_once 'layout_footer.php';
?>
