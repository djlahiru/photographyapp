<?php
require_once '../app/actions/booking_actions.php'; // Defines ALLOWED_BOOKING_STATUSES

$db_page_specific = get_db_connection();
if (!$db_page_specific) {
    die("Database connection failed for bookings page.");
}

// Ensure tables from all relevant actions files are potentially created if they don't exist.
if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db_page_specific);
if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db_page_specific);
ensure_bookings_table_exists($db_page_specific);

// Get filter parameters
$status_filter_get = $_GET['status_filter'] ?? '';
$category_filter_get = $_GET['category_filter'] ?? '';

// Fetch bookings with filters
$bookings_list = get_all_bookings($db_page_specific, $status_filter_get, $category_filter_get);

// Define allowed statuses for the dropdown (can also be fetched from a config or helper)
// If booking_actions.php defines a constant ALLOWED_BOOKING_STATUSES, it's already available.
// Otherwise, define it here for the form.
if (!defined('ALLOWED_BOOKING_STATUSES')) {
    define('ALLOWED_BOOKING_STATUSES', ['pending', 'confirmed', 'completed', 'cancelled']);
}
$allowed_statuses_for_view_list = ALLOWED_BOOKING_STATUSES;


$status_message_bookings = ''; // Use a specific var name
$message_type_bookings = 'info';

if (isset($_GET['status_msg'])) { // Renamed from 'status' to avoid conflict with booking status filter
    switch ($_GET['status_msg']) {
        case 'add_success':
            $status_message_bookings = 'Booking scheduled successfully!'; $message_type_bookings = 'success';
            break;
        case 'add_error':
            $status_message_bookings = 'Error scheduling booking. Please check inputs.'; $message_type_bookings = 'danger';
            break;
        case 'edit_success':
            $status_message_bookings = 'Booking updated successfully!'; $message_type_bookings = 'success';
            break;
        case 'edit_error':
            $status_message_bookings = 'Error updating booking.'; $message_type_bookings = 'danger';
            break;
        case 'delete_success':
            $status_message_bookings = 'Booking deleted successfully!'; $message_type_bookings = 'success';
            break;
        case 'delete_error':
            $status_message_bookings = 'Error deleting booking.'; $message_type_bookings = 'danger';
            break;
        case 'not_found':
            $status_message_bookings = 'Booking not found.'; $message_type_bookings = 'warning';
            break;
        case 'invalid_id':
            $status_message_bookings = 'Invalid booking ID specified.'; $message_type_bookings = 'danger';
            break;
        case 'fk_error':
            $status_message_bookings = 'Error: Invalid client or package selected.'; $message_type_bookings = 'danger';
            break;
        case 'status_update_success':
            $status_message_bookings = 'Booking status updated successfully!'; $message_type_bookings = 'success';
            break;
        case 'status_update_error':
            $status_message_bookings = 'Error updating booking status.'; $message_type_bookings = 'danger';
            break;
    }
}

require_once 'layout_header.php'; // $datetime_format_php is available from here
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Booking Management</h1>
        <a href="add_booking.php" class="btn btn-primary"><i class="bi bi-calendar-plus-fill me-2"></i>Schedule New Booking</a>
    </div>
    
    <?php if (!empty($status_message_bookings)): ?>
        <div class="alert alert-<?php echo $message_type_bookings; ?>" role="alert">
            <?php echo htmlspecialchars($status_message_bookings); ?>
        </div>
    <?php endif; ?>

    <div class="card mb-4">
        <div class="card-header">Filter Bookings</div>
        <div class="card-body">
            <form method="GET" action="bookings.php" class="row g-3">
                <div class="col-md-4">
                    <label for="status_filter" class="form-label">Status</label>
                    <select id="status_filter" name="status_filter" class="form-select">
                        <option value="">All Statuses</option>
                        <?php foreach ($allowed_statuses_for_view_list as $status_val): ?>
                            <option value="<?php echo htmlspecialchars($status_val); ?>" <?php echo ($status_filter_get === $status_val) ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars(ucfirst($status_val)); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="category_filter" class="form-label">Category (contains)</label>
                    <input type="text" id="category_filter" name="category_filter" class="form-control" value="<?php echo htmlspecialchars($category_filter_get); ?>">
                </div>
                <div class="col-md-4 d-flex align-items-end">
                    <button type="submit" class="btn btn-info me-2"><i class="bi bi-funnel-fill me-1"></i>Filter</button>
                    <a href="bookings.php" class="btn btn-outline-secondary"><i class="bi bi-x-circle me-1"></i>Clear</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            All Bookings <?php if($status_filter_get || $category_filter_get) echo "(Filtered)"; ?>
        </div>
        <div class="card-body">
            <?php if (empty($bookings_list)): ?>
                <p class="text-center">No bookings found<?php if($status_filter_get || $category_filter_get) echo " matching your filters"; ?>. <a href="add_booking.php">Schedule one now!</a></p>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Client</th>
                                <th>Package</th>
                                <th>Date & Time</th>
                                <th>Location</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($bookings_list as $booking_item): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($booking_item['id']); ?></td>
                                    <td><?php echo htmlspecialchars($booking_item['client_name']); ?> <small class="text-muted">(ID: <?php echo htmlspecialchars($booking_item['client_id']); ?>)</small></td>
                                    <td><?php echo htmlspecialchars($booking_item['package_name'] ?? 'N/A'); ?> <?php if($booking_item['package_id']) echo "<small class='text-muted'>(ID: " . htmlspecialchars($booking_item['package_id']) . ")</small>"; ?></td>
                                    <td>
                                        <?php echo format_datetime_user($booking_item['booking_date'] . ($booking_item['booking_time'] ? ' ' . $booking_item['booking_time'] : ''), $datetime_format_php); ?>
                                    </td>
                                    <td><?php echo htmlspecialchars($booking_item['location'] ?? 'N/A'); ?></td>
                                    <td><?php echo htmlspecialchars($booking_item['category'] ?? 'N/A'); ?></td>
                                    <td>$<?php echo htmlspecialchars(number_format((float)($booking_item['total_amount'] ?? 0), 2)); ?></td>
                                    <td>
                                        <?php echo format_datetime_user($booking_item['booking_date'] . ($booking_item['booking_time'] ? ' ' . $booking_item['booking_time'] : ''), $datetime_format_php); ?>
                                    </td>
                                    <td><?php echo htmlspecialchars($booking_item['location'] ?? 'N/A'); ?></td>
                                    <td><?php echo htmlspecialchars($booking_item['category'] ?? 'N/A'); ?></td>
                                    <td>$<?php echo htmlspecialchars(number_format((float)($booking_item['total_amount'] ?? 0), 2)); ?></td>
                                    <td>
                                        <form action="update_booking_status_handler.php" method="POST" class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                                            <input type="hidden" name="booking_id" value="<?php echo $booking_item['id']; ?>">
                                            <input type="hidden" name="current_status_filter" value="<?php echo htmlspecialchars($status_filter_get); ?>">
                                            <input type="hidden" name="current_category_filter" value="<?php echo htmlspecialchars($category_filter_get); ?>">
                                            <select name="status" class="form-select form-select-sm me-sm-1 mb-1 mb-sm-0" style="min-width: 120px; max-width:150px;">
                                                <?php foreach ($allowed_statuses_for_view_list as $status_val): ?>
                                                    <option value="<?php echo htmlspecialchars($status_val); ?>" <?php echo ($booking_item['status'] === $status_val) ? 'selected' : ''; ?>>
                                                        <?php echo htmlspecialchars(ucfirst($status_val)); ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            </select>
                                            <button type="submit" class="btn btn-sm btn-outline-primary"><i class="bi bi-save"></i> <span class="d-none d-sm-inline">Save</span></button>
                                        </form>
                                    </td>
                                    <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="<?php echo htmlspecialchars($booking_item['notes'] ?? ''); ?>"><?php echo htmlspecialchars($booking_item['notes'] ?? 'N/A'); ?></td>
                                    <td>
                                        <div class="d-flex flex-column flex-md-row">
                                            <a href="booking_payments.php?booking_id=<?php echo $booking_item['id']; ?>" class="btn btn-sm btn-info mb-1 me-md-1"><i class="bi bi-credit-card-fill"></i> <span class="d-none d-lg-inline">Payments</span></a>
                                            <a href="edit_booking.php?id=<?php echo $booking_item['id']; ?>" class="btn btn-sm btn-warning mb-1 me-md-1"><i class="bi bi-pencil-square"></i> <span class="d-none d-lg-inline">Edit</span></a>
                                            <a href="delete_booking_handler.php?id=<?php echo $booking_item['id']; ?>" class="btn btn-sm btn-danger mb-1"><i class="bi bi-trash-fill"></i> <span class="d-none d-lg-inline">Delete</span></a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php
require_once 'layout_footer.php';
?>
