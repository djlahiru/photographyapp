<?php
require_once '../app/actions/client_actions.php';
require_once '../app/actions/package_actions.php';
// booking_actions.php is not directly needed here for page load, but handlers will use it.

$db_page_specific = get_db_connection();
if (!$db_page_specific) {
    die("Database connection failed for add booking page.");
}

// Ensure tables for dropdowns are ready
if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db_page_specific);
if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db_page_specific);

$clients_list = get_all_clients($db_page_specific);
$packages_list = get_all_packages($db_page_specific);

$error_message_add_booking = '';
$error_type_add_booking = $_GET['error_type'] ?? ''; // Using 'error_type' from handler

if ($error_type_add_booking === 'missing_fields') {
    $error_message_add_booking = 'Client and Booking Date are required.';
} elseif ($error_type_add_booking === 'fk_constraint') {
    $error_message_add_booking = 'Invalid Client ID or Package ID selected. Please ensure they exist.';
} elseif ($error_type_add_booking === 'db_error') {
    $error_message_add_booking = 'A database error occurred while saving. Please try again.';
}

// Retain form values if redirected due to an error
$selected_client_id_form = $_GET['client_id'] ?? '';
$selected_package_id_form = $_GET['package_id'] ?? '';
$booking_date_form = $_GET['booking_date'] ?? date('Y-m-d'); // Default to today
$booking_time_form = $_GET['booking_time'] ?? '';
$location_form = $_GET['location'] ?? '';
$total_amount_form = $_GET['total_amount'] ?? '';
$notes_form = $_GET['notes'] ?? '';
// Category is not part of create_booking, it's set via edit_booking
// $category_form = $_GET['category'] ?? ''; 


require_once 'layout_header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Schedule New Booking</h1>
        <a href="bookings.php" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to Bookings
        </a>
    </div>

    <?php if (!empty($error_message_add_booking)): ?>
        <div class="alert alert-danger" role="alert">
            <?php echo htmlspecialchars($error_message_add_booking); ?>
        </div>
    <?php endif; ?>
    
    <div class="card">
        <div class="card-header">
            New Booking Details
        </div>
        <div class="card-body">
            <form action="add_booking_handler.php" method="POST" id="addBookingForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="client_id" class="form-label">Client <span class="text-danger">*</span></label>
                        <select class="form-select" id="client_id" name="client_id" required>
                            <option value="">Select Client</option>
                            <?php foreach ($clients_list as $client_item): ?>
                                <option value="<?php echo htmlspecialchars($client_item['id']); ?>" <?php if ($client_item['id'] == $selected_client_id_form) echo 'selected'; ?>>
                                    <?php echo htmlspecialchars($client_item['name']); ?> (<?php echo htmlspecialchars($client_item['email'] ?? 'No Email'); ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="package_id" class="form-label">Package (Optional)</label>
                        <select class="form-select" id="package_id" name="package_id">
                            <option value="">Select Package (Price auto-fills if amount empty)</option>
                            <?php foreach ($packages_list as $package_item): ?>
                                <option value="<?php echo htmlspecialchars($package_item['id']); ?>" data-price="<?php echo htmlspecialchars($package_item['price']); ?>" <?php if ($package_item['id'] == $selected_package_id_form) echo 'selected'; ?>>
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

                <!-- Category is set via edit_booking.php after creation -->
                <!-- <div class="mb-3">
                    <label for="category" class="form-label">Category (Optional, e.g., Wedding, Portrait)</label>
                    <input type="text" class="form-control" id="category" name="category" value="<?php echo htmlspecialchars($category_form); ?>">
                </div> -->

                <div class="mb-3">
                    <label for="total_amount" class="form-label">Total Amount (Optional - auto-fills if package selected and this is empty)</label>
                    <input type="number" class="form-control" id="total_amount" name="total_amount" step="0.01" value="<?php echo htmlspecialchars($total_amount_form); ?>" placeholder="Leave blank to use package price">
                </div>

                <div class="mb-3">
                    <label for="notes" class="form-label">Notes (Optional)</label>
                    <textarea class="form-control" id="notes" name="notes" rows="3"><?php echo htmlspecialchars($notes_form); ?></textarea>
                </div>

                <button type="submit" class="btn btn-success"><i class="bi bi-check-circle-fill me-2"></i>Save Booking</button>
                <a href="bookings.php" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
</div>

<script>
    // Auto-fill total_amount when a package is selected, if total_amount is empty
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
