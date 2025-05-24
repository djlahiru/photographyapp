<?php
require_once '../app/actions/client_actions.php';
require_once '../app/actions/package_actions.php';
// booking_actions.php is not directly needed here, but handlers will use it.

$db = get_db_connection();
if (!$db) {
    die("Database connection failed. Please check your configuration.");
}

// Ensure tables for dropdowns are ready
if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);

$clients = get_all_clients($db);
$packages = get_all_packages($db);

$error_message = '';
if (isset($_GET['error'])) {
    if ($_GET['error'] === 'missing_fields') {
        $error_message = '<div class="alert alert-danger" role="alert">Client and Booking Date are required.</div>';
    } elseif ($_GET['error'] === 'fk_constraint') {
        $error_message = '<div class="alert alert-danger" role="alert">Invalid Client ID or Package ID selected. Please ensure they exist.</div>';
    } elseif ($_GET['error'] === 'db_error') {
        $error_message = '<div class="alert alert-danger" role="alert">A database error occurred. Please try again.</div>';
    }
}

// Retain form values if redirected due to an error
$selected_client_id = $_GET['client_id'] ?? '';
$selected_package_id = $_GET['package_id'] ?? '';
$booking_date = $_GET['booking_date'] ?? '';
$booking_time = $_GET['booking_time'] ?? '';
$location = $_GET['location'] ?? '';
$total_amount = $_GET['total_amount'] ?? '';
$notes = $_GET['notes'] ?? '';
$category = $_GET['category'] ?? '';


?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Schedule New Booking</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Schedule New Booking</h1>

        <?php echo $error_message; ?>

        <form action="add_booking_handler.php" method="POST" id="addBookingForm">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="client_id" class="form-label">Client <span class="text-danger">*</span></label>
                    <select class="form-select" id="client_id" name="client_id" required>
                        <option value="">Select Client</option>
                        <?php foreach ($clients as $client): ?>
                            <option value="<?php echo htmlspecialchars($client['id']); ?>" <?php if ($client['id'] == $selected_client_id) echo 'selected'; ?>>
                                <?php echo htmlspecialchars($client['name']); ?> (<?php echo htmlspecialchars($client['email']); ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="package_id" class="form-label">Package (Optional)</label>
                    <select class="form-select" id="package_id" name="package_id">
                        <option value="">Select Package (Optional)</option>
                        <?php foreach ($packages as $package): ?>
                            <option value="<?php echo htmlspecialchars($package['id']); ?>" data-price="<?php echo htmlspecialchars($package['price']); ?>" <?php if ($package['id'] == $selected_package_id) echo 'selected'; ?>>
                                <?php echo htmlspecialchars($package['name']); ?> ($<?php echo htmlspecialchars(number_format($package['price'], 2)); ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="booking_date" class="form-label">Booking Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="booking_date" name="booking_date" value="<?php echo htmlspecialchars($booking_date); ?>" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="booking_time" class="form-label">Booking Time (Optional)</label>
                    <input type="time" class="form-control" id="booking_time" name="booking_time" value="<?php echo htmlspecialchars($booking_time); ?>">
                </div>
            </div>
            
            <div class="mb-3">
                <label for="location" class="form-label">Location (Optional)</label>
                <input type="text" class="form-control" id="location" name="location" value="<?php echo htmlspecialchars($location); ?>">
            </div>

            <div class="mb-3">
                <label for="category" class="form-label">Category (Optional, e.g., Wedding, Portrait)</label>
                <input type="text" class="form-control" id="category" name="category" value="<?php echo htmlspecialchars($category); ?>">
            </div>

            <div class="mb-3">
                <label for="total_amount" class="form-label">Total Amount (Optional - auto-fills if package selected)</label>
                <input type="number" class="form-control" id="total_amount" name="total_amount" step="0.01" value="<?php echo htmlspecialchars($total_amount); ?>" placeholder="Leave blank to use package price">
            </div>

            <div class="mb-3">
                <label for="notes" class="form-label">Notes (Optional)</label>
                <textarea class="form-control" id="notes" name="notes" rows="3"><?php echo htmlspecialchars($notes); ?></textarea>
            </div>

            <button type="submit" class="btn btn-primary">Save Booking</button>
            <a href="bookings.php" class="btn btn-secondary">Cancel</a>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Auto-fill total_amount when a package is selected, if total_amount is empty
        document.getElementById('package_id').addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            const totalAmountField = document.getElementById('total_amount');
            if (price && totalAmountField.value === '') {
                totalAmountField.value = parseFloat(price).toFixed(2);
            } else if (!this.value && totalAmountField.value === '') { // "No package" selected and amount is empty
                 totalAmountField.value = ''; // Clear if previously set by another package
            }
        });
    </script>
</body>
</html>
