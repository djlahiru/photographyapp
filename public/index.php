<?php
// layout_header.php is included at the end of this PHP block
// It provides $db_layout, $user_settings, $profile_name, $datetime_format_php etc.

require_once '../app/actions/booking_actions.php';
require_once '../app/actions/payment_actions.php';
require_once '../app/actions/client_actions.php';

// Use the $db_layout connection established in layout_header.php, or establish a new one if needed.
// For simplicity, we'll assume $db_layout is available and valid.
// If not, the individual action functions will use their own get_db_connection().
$db_dashboard = get_db_connection(); // Use a specific var name for clarity

if (!$db_dashboard) {
    // This would typically be handled more gracefully, perhaps by layout_header itself
    die("Critical database connection error for dashboard. Please check configuration.");
}

// Fetch dashboard data
$active_bookings_count = get_active_bookings_count($db_dashboard);
$payments_this_month = get_payments_this_month($db_dashboard);
$upcoming_bookings = get_upcoming_bookings($db_dashboard, 5);
$recent_bookings = get_recent_bookings($db_dashboard, 5);
$recently_added_clients = get_recently_added_clients($db_dashboard, 5);
$booking_counts_by_category = get_booking_counts_by_category($db_dashboard);

// Check Google Calendar connection status
$gcal_connected_status = false;
if (function_exists('check_gcal_connection')) { // check_gcal_connection is in google_calendar_actions.php
    // We need to ensure google_calendar_actions.php is included if not already by layout_header.php
    // For now, assuming it might be (e.g., if layout_header or another included file needs it)
    // A more robust way is to explicitly include it here if needed.
    if (!function_exists('get_google_client')) { // Simple check if google_calendar_actions.php was sourced
         require_once __DIR__ . '/../app/actions/google_calendar_actions.php';
    }
    $gcal_connected_status = check_gcal_connection($db_dashboard);
}


// Determine time-based welcome message
$current_hour = (int)date('H');
$time_based_greeting = "Good evening";
if ($current_hour >= 5 && $current_hour < 12) {
    $time_based_greeting = "Good morning";
} elseif ($current_hour >= 12 && $current_hour < 18) {
    $time_based_greeting = "Good afternoon";
}

// layout_header.php will be included next, providing $profile_name and $datetime_format_php
require_once 'layout_header.php';
?>

<div class="container-fluid">
    <div class="main-header-gradient p-4 mb-4 rounded shadow-sm">
        <h1 class="display-5" style="color: var(--text-on-primary, #fff);"><?php echo htmlspecialchars($time_based_greeting); ?>, <?php echo htmlspecialchars($profile_name); ?>!</h1>
        <p class="lead" style="color: var(--text-on-primary, #fff);">Here's a quick overview of your photography business.</p>
    </div>

    <!-- Summary Statistics Section -->
    <div class="row mb-4">
        <div class="col-md-4">
            <div class="card text-center shadow-sm h-100">
                <div class="card-body">
                    <i class="bi bi-calendar-check fs-1 text-primary mb-2"></i>
                    <h5 class="card-title">Active Bookings</h5>
                    <p class="card-text display-4"><?php echo $active_bookings_count; ?></p>
                    <a href="bookings.php" class="btn btn-outline-primary btn-sm">View All Bookings</a>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card text-center shadow-sm h-100">
                <div class="card-body">
                    <i class="bi bi-cash-coin fs-1 text-success mb-2"></i>
                    <h5 class="card-title">Payments This Month</h5>
                    <p class="card-text display-4">$<?php echo htmlspecialchars(number_format($payments_this_month, 2)); ?></p>
                     <a href="bookings.php" class="btn btn-outline-success btn-sm">View Payment Details (via Bookings)</a>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card text-center shadow-sm h-100">
                <div class="card-body">
                    <i class="bi bi-google fs-1 <?php echo $gcal_connected_status ? 'text-success' : 'text-muted'; ?> mb-2"></i>
                    <h5 class="card-title">Google Calendar Sync</h5>
                    <?php if (!defined('GOOGLE_CLIENT_ID') || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER'): ?>
                        <p class="card-text"><span class="badge bg-warning text-dark">Not Configured</span></p>
                        <small class="text-muted">Admin: Setup API credentials in app/config.php</small>
                    <?php elseif ($gcal_connected_status): ?>
                        <p class="card-text"><span class="badge bg-success">Connected</span></p>
                        <small class="text-muted">Bookings should sync automatically.</small>
                    <?php else: ?>
                        <p class="card-text"><span class="badge bg-danger">Not Connected</span></p>
                        <a href="profile_settings.php#google-calendar-section" class="btn btn-outline-primary btn-sm">Connect Now</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Lists Section -->
    <div class="row">
        <!-- Upcoming Bookings -->
        <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-calendar-event me-2"></i>Upcoming Bookings</span>
                    <a href="bookings.php" class="btn btn-sm btn-outline-secondary">View All</a>
                </div>
                <div class="list-group list-group-flush">
                    <?php if (empty($upcoming_bookings)): ?>
                        <div class="list-group-item">No upcoming bookings.</div>
                    <?php else: ?>
                        <?php foreach ($upcoming_bookings as $booking): ?>
                            <a href="edit_booking.php?id=<?php echo $booking['id']; ?>" class="list-group-item list-group-item-action">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1"><?php echo htmlspecialchars($booking['client_name']); ?></h6>
                                    <small><?php echo format_datetime_user($booking['booking_date'], 'Y-m-d'); // Custom format for date only ?></small>
                                </div>
                                <p class="mb-1"><small><?php echo htmlspecialchars($booking['package_name'] ?? ($booking['category'] ?? 'Custom Session')); ?></small></p>
                            </a>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Recent Bookings -->
         <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                     <span><i class="bi bi-calendar-check-fill me-2"></i>Recent Bookings</span>
                     <a href="bookings.php?status_filter=completed" class="btn btn-sm btn-outline-secondary">View All Completed</a>
                </div>
                <div class="list-group list-group-flush">
                    <?php if (empty($recent_bookings)): ?>
                        <div class="list-group-item">No recent completed/confirmed bookings.</div>
                    <?php else: ?>
                        <?php foreach ($recent_bookings as $booking): ?>
                             <a href="edit_booking.php?id=<?php echo $booking['id']; ?>" class="list-group-item list-group-item-action">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1"><?php echo htmlspecialchars($booking['client_name']); ?></h6>
                                    <small><?php echo format_datetime_user($booking['booking_date'], 'Y-m-d'); ?></small>
                                </div>
                                <p class="mb-1"><small><?php echo htmlspecialchars($booking['package_name'] ?? ($booking['category'] ?? 'Custom Session')); ?> - <span class="badge bg-secondary"><?php echo htmlspecialchars($booking['status']);?></span></small></p>
                            </a>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    
    <div class="row">
        <!-- Recently Added Clients -->
        <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
                 <div class="card-header d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-person-plus-fill me-2"></i>Recently Added Clients</span>
                    <a href="clients.php" class="btn btn-sm btn-outline-secondary">View All</a>
                </div>
                <div class="list-group list-group-flush">
                    <?php if (empty($recently_added_clients)): ?>
                        <div class="list-group-item">No clients added recently.</div>
                    <?php else: ?>
                        <?php foreach ($recently_added_clients as $client): ?>
                            <a href="edit_client.php?id=<?php echo $client['id']; ?>" class="list-group-item list-group-item-action">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1"><?php echo htmlspecialchars($client['name']); ?></h6>
                                     <small>Added: <?php echo format_datetime_user($client['created_at'], 'Y-m-d'); ?></small>
                                </div>
                                <p class="mb-1"><small><?php echo htmlspecialchars($client['email'] ?? 'No email'); ?></small></p>
                            </a>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Booking Categories Breakdown -->
        <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
                <div class="card-header">
                    <i class="bi bi-pie-chart-fill me-2"></i>Booking Categories
                </div>
                <div class="card-body">
                    <?php if (empty($booking_counts_by_category)): ?>
                        <p>No bookings with categories found.</p>
                    <?php else: ?>
                        <ul class="list-group">
                            <?php 
                            $total_categorized_bookings = array_sum($booking_counts_by_category);
                            foreach ($booking_counts_by_category as $category => $count): 
                                $percentage = ($total_categorized_bookings > 0) ? round(($count / $total_categorized_bookings) * 100) : 0;
                            ?>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <?php echo htmlspecialchars($category); ?>
                                    <span class="badge bg-primary rounded-pill"><?php echo $count; ?></span>
                                </li>
                                <!-- Basic Bar for illustration -->
                                <div class="progress" style="height: 5px; margin-bottom: 5px;">
                                  <div class="progress-bar" role="progressbar" style="width: <?php echo $percentage; ?>%;" aria-valuenow="<?php echo $percentage; ?>" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
require_once 'layout_footer.php';
?>
