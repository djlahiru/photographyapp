<?php
require_once '../app/actions/booking_actions.php';
require_once '../app/actions/client_actions.php';
require_once '../app/actions/package_actions.php';

$booking_id_get = $_GET['id'] ?? null;
$booking_data = null;
$clients_list_edit = [];
$packages_list_edit = [];
$error_message_edit_booking = '';
$message_type_edit_booking = 'danger';

if (!$booking_id_get || !is_numeric($booking_id_get)) {
    $error_message_edit_booking = 'Invalid booking ID specified. Cannot load booking data.';
} else {
    $db_page_specific = get_db_connection();
    if (!$db_page_specific) {
        die("Database connection failed for edit booking page.");
    }

    if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db_page_specific);
    if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db_page_specific);
    ensure_bookings_table_exists($db_page_specific);

    $booking_data = get_booking_by_id($db_page_specific, (int)$booking_id_get);
    if (!$booking_data) {
        $error_message_edit_booking = 'Booking not found with ID ' . htmlspecialchars($booking_id_get) . '.';
    } else {
        $clients_list_edit = get_all_clients($db_page_specific);
        $packages_list_edit = get_all_packages($db_page_specific);
    }
}

$error_type_edit_booking = $_GET['error_type'] ?? '';
if ($error_type_edit_booking === 'missing_fields') {
    $error_message_edit_booking .= (empty($error_message_edit_booking) ? '' : ' ') . 'Client and Booking Date are required.';
} elseif ($error_type_edit_booking === 'fk_constraint') {
    $error_message_edit_booking .= (empty($error_message_edit_booking) ? '' : ' ') . 'Invalid Client ID or Package ID selected.';
} elseif ($error_type_edit_booking === 'update_failed') {
    $error_message_edit_booking .= (empty($error_message_edit_booking) ? '' : ' ') . 'Failed to update booking. Please try again.';
}

// Pre-fill form data (even if $booking_data is null, to avoid undefined variable errors later)
$selected_client_id_form = $booking_data['client_id'] ?? ($_GET['client_id'] ?? '');
$selected_package_id_form = $booking_data['package_id'] ?? ($_GET['package_id'] ?? '');
$booking_date_form = $booking_data['booking_date'] ?? ($_GET['booking_date'] ?? date('Y-m-d'));
$booking_time_form = $booking_data['booking_time'] ?? ($_GET['booking_time'] ?? '');
$location_form = $booking_data['location'] ?? ($_GET['location'] ?? '');
$total_amount_form = $booking_data['total_amount'] ?? ($_GET['total_amount'] ?? '');
$notes_form = $booking_data['notes'] ?? ($_GET['notes'] ?? '');
$category_form_db = $booking_data['category'] ?? ($_GET['category'] ?? '');
$status_form_db = $booking_data['status'] ?? 'pending';


require_once 'layout_header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Edit Booking #<?php echo htmlspecialchars($booking_id_get); ?></h1>
        <a href="bookings.php" class="btn btn-outline-secondary">
             <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to Bookings
        </a>
    </div>

    <?php if (!empty($error_message_edit_booking)): ?>
        <div class="alert alert-<?php echo $message_type_edit_booking; ?>" role="alert">
            <?php echo htmlspecialchars($error_message_edit_booking); ?>
        </div>
    <?php endif; ?>

    <?php if ($booking_data): ?>
    <div class="card">
        <div class="card-header">
            Editing Booking for Client: <?php echo htmlspecialchars($booking_data['client_name']); ?>
        </div>
        <div class="card-body">
            <form action="edit_booking_handler.php" method="POST" id="editBookingForm">
                <input type="hidden" name="id" value="<?php echo htmlspecialchars($booking_data['id']); ?>">
                
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="client_id" class="form-label">Client <span class="text-danger">*</span></label>
                        <select class="form-select" id="client_id" name="client_id" required>
                            <option value="">Select Client</option>
                            <?php foreach ($clients_list_edit as $client_item): ?>
                                <option value="<?php echo htmlspecialchars($client_item['id']); ?>" <?php echo ($client_item['id'] == $selected_client_id_form) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($client_item['name']); ?> (<?php echo htmlspecialchars($client_item['email'] ?? 'No Email'); ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="package_id" class="form-label">Package (Optional)</label>
                        <select class="form-select" id="package_id" name="package_id">
                            <option value="">Select Package (Price auto-fills if amount empty)</option>
                            <?php foreach ($packages_list_edit as $package_item): ?>
                                <option value="<?php echo htmlspecialchars($package_item['id']); ?>" data-price="<?php echo htmlspecialchars($package_item['price']); ?>" <?php echo ($package_item['id'] == $selected_package_id_form) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($package_item['name']); ?> ($<?php echo htmlspecialchars(number_format($package_item['price'], 2)); ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="booking_date" class="form-label">Booking Date <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" id="booking_date" name="booking_date" value="<?php echo htmlspecialchars($booking_date_form); ?>" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="booking_time" class="form-label">Booking Time (Optional)</label>
                        <input type="time" class="form-control" id="booking_time" name="booking_time" value="<?php echo htmlspecialchars($booking_time_form); ?>">
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="location" class="form-label">Location (Optional)</label>
                    <input type="text" class="form-control" id="location" name="location" value="<?php echo htmlspecialchars($location_form); ?>">
                </div>
                
                <div class="mb-3">
                    <label for="category" class="form-label">Category (Optional, e.g., Wedding, Portrait)</label>
                    <input type="text" class="form-control" id="category" name="category" value="<?php echo htmlspecialchars($category_form_db); ?>">
                </div>
                
                <div class="mb-3">
                     <label for="status_display" class="form-label">Current Status</label>
                     <input type="text" class="form-control" id="status_display" name="status_display_info_only" value="<?php echo htmlspecialchars(ucfirst($status_form_db)); ?>" readonly>
                     <small class="form-text text-muted">Status is updated on the main bookings list page via the status dropdown there.</small>
                </div>

                <div class="mb-3">
                    <label for="total_amount" class="form-label">Total Amount (Optional - auto-updates if package selected and this is empty)</label>
                    <input type="number" class="form-control" id="total_amount" name="total_amount" step="0.01" value="<?php echo htmlspecialchars(number_format((float)$total_amount_form, 2)); ?>" placeholder="Leave blank to use package price if package changes">
                </div>

                <div class="mb-3">
                    <label for="notes" class="form-label">Notes (Optional)</label>
                    <textarea class="form-control" id="notes" name="notes" rows="3"><?php echo htmlspecialchars($notes_form); ?></textarea>
                </div>

                <button type="submit" class="btn btn-success"><i class="bi bi-check-circle-fill me-2"></i>Update Booking</button>
                <a href="bookings.php" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
    <?php elseif (empty($error_message_edit_booking)): ?>
        <div class="alert alert-info">Loading booking data... If this message persists, the booking may not exist or there's an issue.</div>
    <?php endif; ?>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const packageSelect = document.getElementById('package_id');
        const totalAmountField = document.getElementById('total_amount');

        if (packageSelect && totalAmountField) {
            packageSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const price = selectedOption.getAttribute('data-price');
                
                if (price && totalAmountField.value === '') {
                    totalAmountField.value = parseFloat(price).toFixed(2);
                } else if (!this.value && totalAmountField.value === '') { 
                    totalAmountField.value = ''; 
                }
            });
        }
    });
</script>

<?php
require_once 'layout_footer.php';
?>
