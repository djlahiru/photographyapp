<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../app/actions/booking_actions.php';
// settings_actions.php is not strictly needed here unless we plan to format event titles
// or times based on user prefs *before* sending to FullCalendar.
// FullCalendar itself can handle time formatting via its `eventTimeFormat` option.

$db = get_db_connection();
if (!$db) {
    echo json_encode(['error' => 'Database connection failed.']);
    exit;
}

// Ensure tables are ready (good practice, though actions usually do this)
if (function_exists('ensure_clients_table_exists')) ensure_clients_table_exists($db);
if (function_exists('ensure_packages_table_exists')) ensure_packages_table_exists($db);
if (function_exists('ensure_bookings_table_exists')) ensure_bookings_table_exists($db);


$bookings = get_all_bookings($db); // Fetches all bookings with client_name and package_name

$events_array = [];

// Define color mapping for statuses
$status_colors = [
    'pending'   => ['backgroundColor' => '#ffc107', 'borderColor' => '#ffc107'], // Bootstrap Warning Yellow
    'confirmed' => ['backgroundColor' => '#0d6efd', 'borderColor' => '#0d6efd'], // Bootstrap Primary Blue
    'completed' => ['backgroundColor' => '#198754', 'borderColor' => '#198754'], // Bootstrap Success Green
    'cancelled' => ['backgroundColor' => '#6c757d', 'borderColor' => '#6c757d'], // Bootstrap Secondary Gray (less alarming than red)
    // 'cancelled' => ['backgroundColor' => '#dc3545', 'borderColor' => '#dc3545'], // Bootstrap Danger Red - Alternative
];
$default_color = ['backgroundColor' => '#6c757d', 'borderColor' => '#6c757d']; // Default to secondary if status unknown


foreach ($bookings as $booking) {
    $event_title = $booking['client_name'];
    if (!empty($booking['package_name'])) {
        $event_title .= ' - ' . $booking['package_name'];
    } elseif (!empty($booking['category'])) {
        $event_title .= ' - ' . $booking['category'];
    } else {
        $event_title .= ' - Appointment'; // Generic fallback
    }

    // FullCalendar needs start date in ISO8601 format.
    // If booking_time is set, combine it with booking_date.
    $start_datetime = $booking['booking_date'];
    if (!empty($booking['booking_time'])) {
        // Validate time format before appending. Assume HH:MM or HH:MM:SS
        if (preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/', $booking['booking_time'])) {
            $start_datetime .= 'T' . $booking['booking_time'];
        }
        // If time is invalid, FullCalendar will treat it as an all-day event for that date.
    }

    $colors = $status_colors[strtolower($booking['status'] ?? '')] ?? $default_color;

    $events_array[] = [
        'id'               => $booking['id'],
        'title'            => $event_title,
        'start'            => $start_datetime,
        // 'end'             => null, // Optional: If you have an end date/time
        'url'              => '../edit_booking.php?id=' . $booking['id'],
        'backgroundColor'  => $colors['backgroundColor'],
        'borderColor'      => $colors['borderColor'],
        'textColor'        => '#ffffff' // Assuming dark backgrounds for events, white text is good
                                      // Can be adjusted per status if needed
    ];
}

echo json_encode($events_array);
exit;
?>
