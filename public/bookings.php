<?php
require_once '../app/actions/booking_actions.php';
// No need to explicitly include client_actions or package_actions here,
// as booking_actions.php's get_all_bookings() handles fetching related names.

$db = get_db_connection();
if (!$db) {
    die("Database connection failed. Please check your configuration.");
}
// Ensure tables from all relevant actions files are potentially created if they don't exist.
// This is good practice, though each action file should also do this for its own tables.
if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);
ensure_bookings_table_exists($db); // From booking_actions.php

$bookings = get_all_bookings($db);

$status_message = '';
if (isset($_GET['status'])) {
    switch ($_GET['status']) {
        case 'add_success':
            $status_message = '<div class="alert alert-success" role="alert">Booking scheduled successfully!</div>';
            break;
        case 'add_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error scheduling booking. Please check inputs.</div>';
            break;
        case 'edit_success':
            $status_message = '<div class="alert alert-success" role="alert">Booking updated successfully!</div>';
            break;
        case 'edit_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error updating booking.</div>';
            break;
        case 'delete_success':
            $status_message = '<div class="alert alert-success" role="alert">Booking deleted successfully!</div>';
            break;
        case 'delete_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error deleting booking.</div>';
            break;
        case 'not_found':
            $status_message = '<div class="alert alert-warning" role="alert">Booking not found.</div>';
            break;
        case 'invalid_id':
            $status_message = '<div class="alert alert-danger" role="alert">Invalid booking ID specified.</div>';
            break;
        case 'fk_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error: Invalid client or package selected.</div>';
            break;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Bookings</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Booking Management</h1>
        
        <?php echo $status_message; ?>

        <p><a href="add_booking.php" class="btn btn-primary mb-3">Schedule New Booking</a></p>

        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Package</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($bookings)): ?>
                        <tr>
                            <td colspan="11" class="text-center">No bookings found.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($bookings as $booking): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($booking['id']); ?></td>
                                <td><?php echo htmlspecialchars($booking['client_name']); ?> (ID: <?php echo htmlspecialchars($booking['client_id']); ?>)</td>
                                <td><?php echo htmlspecialchars($booking['package_name'] ?? 'N/A'); ?> <?php if($booking['package_id']) echo "(ID: " . htmlspecialchars($booking['package_id']) . ")"; ?></td>
                                <td><?php echo htmlspecialchars($booking['booking_date']); ?></td>
                                <td><?php echo htmlspecialchars($booking['booking_time'] ?? 'N/A'); ?></td>
                                <td><?php echo htmlspecialchars($booking['location'] ?? 'N/A'); ?></td>
                                <td><?php echo htmlspecialchars($booking['category'] ?? 'N/A'); ?></td>
                                <td>$<?php echo htmlspecialchars(number_format((float)($booking['total_amount'] ?? 0), 2)); ?></td>
                                <td><span class="badge bg-<?php echo strtolower($booking['status']) === 'confirmed' ? 'success' : (strtolower($booking['status']) === 'completed' ? 'info' : (strtolower($booking['status']) === 'cancelled' ? 'danger' : 'secondary')); ?>"><?php echo htmlspecialchars(ucfirst($booking['status'])); ?></span></td>
                                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="<?php echo htmlspecialchars($booking['notes'] ?? ''); ?>"><?php echo htmlspecialchars($booking['notes'] ?? 'N/A'); ?></td>
                                <td>
                                    <a href="edit_booking.php?id=<?php echo $booking['id']; ?>" class="btn btn-sm btn-warning mb-1">Edit</a>
                                    <a href="delete_booking_handler.php?id=<?php echo $booking['id']; ?>" class="btn btn-sm btn-danger" onclick="return confirm('Are you sure you want to delete this booking?');">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
