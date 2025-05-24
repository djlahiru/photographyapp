<?php
require_once '../app/actions/payment_actions.php';
require_once '../app/actions/booking_actions.php'; // To get booking details

$booking_id_get_payments = filter_input(INPUT_GET, 'booking_id', FILTER_VALIDATE_INT);

if (!$booking_id_get_payments) {
    // Redirect before layout_header.php is included
    header("Location: bookings.php?status_msg=invalid_id"); 
    exit;
}

$db_page_specific = get_db_connection();
if (!$db_page_specific) {
    die("Database connection failed for booking payments page.");
}

// Ensure tables are ready
if (function_exists('ensure_bookings_table_exists')) ensure_bookings_table_exists($db_page_specific);
if (function_exists('ensure_payments_table_exists')) ensure_payments_table_exists($db_page_specific);

$booking_details = get_booking_by_id($db_page_specific, $booking_id_get_payments);
if (!$booking_details) {
    // Redirect before layout_header.php is included
    header("Location: bookings.php?status_msg=not_found&id=" . htmlspecialchars($booking_id_get_payments));
    exit;
}

$payments_list = get_payments_for_booking($db_page_specific, $booking_id_get_payments);
$total_paid_for_booking = get_total_payments_for_booking($db_page_specific, $booking_id_get_payments);
$booking_total_amount_val = (float)($booking_details['total_amount'] ?? 0);
$outstanding_balance_val = $booking_total_amount_val - $total_paid_for_booking;

$status_message_payments = '';
$message_type_payments = 'info';

if (isset($_GET['status_msg'])) { // Changed from 'status'
    switch ($_GET['status_msg']) {
        case 'add_success':
            $status_message_payments = 'Payment added successfully!'; $message_type_payments = 'success';
            break;
        case 'add_error':
            $status_message_payments = 'Error adding payment.'; $message_type_payments = 'danger';
            break;
        case 'edit_success':
            $status_message_payments = 'Payment updated successfully!'; $message_type_payments = 'success';
            break;
        case 'edit_error':
            $status_message_payments = 'Error updating payment.'; $message_type_payments = 'danger';
            break;
        case 'delete_success':
            $status_message_payments = 'Payment deleted successfully!'; $message_type_payments = 'success';
            break;
        case 'delete_error':
            $status_message_payments = 'Error deleting payment.'; $message_type_payments = 'danger';
            break;
        case 'invalid_payment_id':
            $status_message_payments = 'Invalid payment ID specified.'; $message_type_payments = 'danger';
            break;
        case 'payment_not_found':
            $status_message_payments = 'Payment not found.'; $message_type_payments = 'warning';
            break;
    }
}

require_once 'layout_header.php'; // $datetime_format_php is available from here
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Payments for Booking #<?php echo htmlspecialchars($booking_details['id']); ?></h1>
        <a href="bookings.php" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to All Bookings
        </a>
    </div>

    <?php if (!empty($status_message_payments)): ?>
        <div class="alert alert-<?php echo $message_type_payments; ?>" role="alert">
            <?php echo htmlspecialchars($status_message_payments); ?>
        </div>
    <?php endif; ?>

    <div class="card mb-4">
        <div class="card-header">Booking Summary</div>
        <div class="card-body">
            <dl class="row">
                <dt class="col-sm-3">Client:</dt>
                <dd class="col-sm-9"><?php echo htmlspecialchars($booking_details['client_name']); ?></dd>

                <dt class="col-sm-3">Package:</dt>
                <dd class="col-sm-9"><?php echo htmlspecialchars($booking_details['package_name'] ?? 'N/A'); ?></dd>

                <dt class="col-sm-3">Booking Date:</dt>
                <dd class="col-sm-9"><?php echo format_datetime_user($booking_details['booking_date'] . ($booking_details['booking_time'] ? ' ' . $booking_details['booking_time'] : ''), $datetime_format_php); ?></dd>
                
                <dt class="col-sm-3">Total Amount:</dt>
                <dd class="col-sm-9">$<?php echo htmlspecialchars(number_format($booking_total_amount_val, 2)); ?></dd>
                
                <dt class="col-sm-3">Total Paid:</dt>
                <dd class="col-sm-9"><strong class="text-success">$<?php echo htmlspecialchars(number_format($total_paid_for_booking, 2)); ?></strong></dd>
                
                <dt class="col-sm-3">Outstanding Balance:</dt>
                <dd class="col-sm-9"><strong class="<?php echo $outstanding_balance_val > 0 ? 'text-danger' : ($outstanding_balance_val == 0 ? 'text-success' : 'text-info'); ?>">
                    $<?php echo htmlspecialchars(number_format($outstanding_balance_val, 2)); ?>
                </strong></dd>
            </dl>
        </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Payment History</h2>
        <a href="add_payment.php?booking_id=<?php echo $booking_details['id']; ?>" class="btn btn-primary"><i class="bi bi-plus-circle-fill me-2"></i>Add New Payment</a>
    </div>

    <?php if (empty($payments_list)): ?>
        <div class="alert alert-info text-center" role="alert">
            No payments recorded for this booking yet.
        </div>
    <?php else: ?>
        <div class="card">
            <div class="card-body p-0"> {/* Remove padding for table to fit nicely */}
                <div class="table-responsive">
                    <table class="table table-striped table-hover mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Payment Date</th>
                                <th>Amount Paid</th>
                                <th>Method</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($payments_list as $payment_item): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($payment_item['id']); ?></td>
                                    <td><?php echo format_datetime_user($payment_item['payment_date'], explode(' ', $datetime_format_php)[0]); // Just date part ?></td>
                                    <td>$<?php echo htmlspecialchars(number_format((float)$payment_item['amount_paid'], 2)); ?></td>
                                    <td><?php echo htmlspecialchars($payment_item['payment_method'] ?? 'N/A'); ?></td>
                                    <td><?php echo htmlspecialchars($payment_item['notes'] ?? 'N/A'); ?></td>
                                    <td>
                                        <a href="edit_payment.php?id=<?php echo $payment_item['id']; ?>&booking_id=<?php echo $booking_details['id']; ?>" class="btn btn-sm btn-warning mb-1 me-1"><i class="bi bi-pencil-square"></i> Edit</a>
                                        <a href="delete_payment_handler.php?id=<?php echo $payment_item['id']; ?>&booking_id=<?php echo $booking_details['id']; ?>" class="btn btn-sm btn-danger mb-1" onclick="return confirm('Are you sure you want to delete this payment?');"><i class="bi bi-trash-fill"></i> Delete</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php
require_once 'layout_footer.php';
?>
