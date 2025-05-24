<?php
require_once '../app/actions/booking_actions.php';
require_once '../app/actions/client_actions.php';
require_once '../app/actions/package_actions.php';

$booking_id = $_GET['id'] ?? null;
$booking = null;
$clients = [];
$packages = [];
$error_message = '';

if (!$booking_id || !is_numeric($booking_id)) {
    header("Location: bookings.php?status=invalid_id");
    exit;
}

$db = get_db_connection();
if (!$db) {
    die("Database connection failed. Please check your configuration.");
}

// Ensure all tables are potentially created
if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);
ensure_bookings_table_exists($db);

$booking = get_booking_by_id($db, (int)$booking_id);
if (!$booking) {
    header("Location: bookings.php?status=not_found&id=" . htmlspecialchars($booking_id));
    exit;
}

// Fetch clients and packages for dropdowns
$clients = get_all_clients($db);
$packages = get_all_packages($db);

if (isset($_GET['error'])) {
    if ($_GET['error'] === 'missing_fields') {
        $error_message = '<div class="alert alert-danger" role="alert">Client and Booking Date are required.</div>';
    } elseif ($_GET['error'] === 'fk_constraint') {
        $error_message = '<div class="alert alert-danger" role="alert">Invalid Client ID or Package ID selected.</div>';
    } elseif ($_GET['error'] === 'update_failed') {
        $error_message = '<div class="alert alert-danger" role="alert">Failed to update booking. Please try again.</div>';
    }
}

// For pre-filling form if redirected with error (though less likely for edit if data is initially loaded)
$selected_client_id = $booking['client_id'];
$selected_package_id = $booking['package_id'] ?? '';
$booking_date = $booking['booking_date'];
$booking_time = $booking['booking_time'] ?? '';
$location = $booking['location'] ?? '';
$total_amount = $booking['total_amount'] ?? '';
$notes = $booking['notes'] ?? '';
$category_from_db = $booking['category'] ?? ''; // Get category from DB
$status_from_db = $booking['status'] ?? 'pending'; // Get status from DB

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Booking</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Edit Booking #<?php echo htmlspecialchars($booking_id); ?></h1>

        <?php echo $error_message; ?>

        <?php if ($booking): ?>
        <form action="edit_booking_handler.php" method="POST" id="editBookingForm">
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($booking['id']); ?>">
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="client_id" class="form-label">Client <span class="text-danger">*</span></label>
                    <select class="form-select" id="client_id" name="client_id" required>
                        <option value="">Select Client</option>
                        <?php foreach ($clients as $client): ?>
                            <option value="<?php echo htmlspecialchars($client['id']); ?>" <?php echo ($client['id'] == $selected_client_id) ? 'selected' : ''; ?>>
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
                            <option value="<?php echo htmlspecialchars($package['id']); ?>" data-price="<?php echo htmlspecialchars($package['price']); ?>" <?php echo ($package['id'] == $selected_package_id) ? 'selected' : ''; ?>>
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
            
            <!-- Category and Status are part of the booking record but not directly editable via this simplified form as per booking_actions.php -->
            <div class="mb-3">
                <label for="category_display" class="form-label">Category (Informational)</label>
                <input type="text" class="form-control" id="category_display" name="category_display_info_only" value="<?php echo htmlspecialchars($category_from_db); ?>" readonly>
                 <small class="form-text text-muted">Category is not directly editable in this form version.</small>
            </div>
            
            <div class="mb-3">
                 <label for="status_display" class="form-label">Status (Informational)</label>
                 <input type="text" class="form-control" id="status_display" name="status_display_info_only" value="<?php echo htmlspecialchars(ucfirst($status_from_db)); ?>" readonly>
                 <small class="form-text text-muted">Status is not directly editable in this form version.</small>
            </div>


            <div class="mb-3">
                <label for="total_amount" class="form-label">Total Amount (Optional - auto-updates if package selected and this is empty)</label>
                <input type="number" class="form-control" id="total_amount" name="total_amount" step="0.01" value="<?php echo htmlspecialchars(number_format((float)$total_amount, 2)); ?>" placeholder="Leave blank to use package price if package changes">
            </div>

            <div class="mb-3">
                <label for="notes" class="form-label">Notes (Optional)</label>
                <textarea class="form-control" id="notes" name="notes" rows="3"><?php echo htmlspecialchars($notes); ?></textarea>
            </div>

            <button type="submit" class="btn btn-primary">Update Booking</button>
            <a href="bookings.php" class="btn btn-secondary">Cancel</a>
        </form>
        <?php endif; ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.getElementById('package_id').addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            const totalAmountField = document.getElementById('total_amount');
            
            if (price && totalAmountField.value === '') { // Only update if amount is empty
                totalAmountField.value = parseFloat(price).toFixed(2);
            } else if (!this.value && totalAmountField.value === '') { // No package selected & amount empty
                 totalAmountField.value = ''; 
            }
            // If a package is selected and totalAmountField is NOT empty, user has set a custom price. Do not override.
            // If no package is selected and totalAmountField is NOT empty, user has set a custom price. Do not override.
        });
    </script>
</body>
</html>
