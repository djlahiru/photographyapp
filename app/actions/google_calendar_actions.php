<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Attempt to load user's config file first
if (file_exists(__DIR__ . '/../config.php')) {
    require_once __DIR__ . '/../config.php';
} else {
    // Fallback to example if actual config is missing
    require_once __DIR__ . '/../config.example.php'; 
}

// Ensure Google API Client Library is available
if (!class_exists('Google_Client')) {
    $vendor_autoload = __DIR__ . '/../vendor/autoload.php';
    if (file_exists($vendor_autoload)) {
        require_once $vendor_autoload;
    } else {
        // This state should ideally be caught earlier or handled by a global error handler
        error_log("FATAL: Google API Client Library not found in google_calendar_actions.php. Path tried: " . $vendor_autoload);
        // Depending on how this file is included, die() might be too abrupt.
        // Consider returning null or a specific error status from functions that call this.
        // For now, if the class is not found, subsequent new Google_Client() will fail.
    }
}

require_once __DIR__ . '/settings_actions.php'; // For get_user_settings, update_user_settings
require_once __DIR__ . '/booking_actions.php'; // For updating booking with gcal_event_id


/**
 * Initializes and returns an authenticated Google_Client instance.
 * Handles token refresh if necessary.
 *
 * @param PDO $db Database connection.
 * @return Google_Client|null Authenticated client or null on failure.
 */
function get_google_client(PDO $db): ?Google_Client {
    if (!class_exists('Google_Client')) {
        error_log("Google_Client class not found in get_google_client.");
        return null;
    }
    if (!defined('GOOGLE_CLIENT_ID') || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER' ||
        !defined('GOOGLE_CLIENT_SECRET') || GOOGLE_CLIENT_SECRET === 'YOUR_GOOGLE_CLIENT_SECRET_PLACEHOLDER') {
        error_log("Google API credentials not configured.");
        return null;
    }

    $user_settings = get_user_settings($db);

    if (!$user_settings || empty($user_settings['google_access_token'])) {
        error_log("Google access token not found in user settings.");
        return null;
    }

    $client = new Google_Client();
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_CLIENT_SECRET);
    $client->setRedirectUri(GOOGLE_REDIRECT_URI); // Needed for refresh token flow consistency
    $client->addScope(GOOGLE_API_SCOPES); // Ensure scopes are consistent

    // The access token should be stored as a JSON string or an array.
    // Google_Client::setAccessToken expects an array.
    $accessToken = is_string($user_settings['google_access_token']) ? 
                   json_decode($user_settings['google_access_token'], true) : 
                   $user_settings['google_access_token'];

    if (!is_array($accessToken) || empty($accessToken['access_token'])) {
         error_log("Invalid Google access token format in user settings.");
        return null;
    }
    
    $client->setAccessToken($accessToken);

    if ($client->isAccessTokenExpired()) {
        if (!empty($user_settings['google_refresh_token'])) {
            try {
                $client->fetchAccessTokenWithRefreshToken($user_settings['google_refresh_token']);
                $new_token_data = $client->getAccessToken(); // This is now an array

                // Prepare data for update_user_settings
                $update_data = [
                    'google_access_token' => json_encode($new_token_data), // Store as JSON
                    'google_refresh_token' => $client->getRefreshToken() ?: $user_settings['google_refresh_token'], // Persist refresh token
                    'google_token_expiry' => isset($new_token_data['created']) && isset($new_token_data['expires_in']) ? 
                                             $new_token_data['created'] + $new_token_data['expires_in'] : 
                                             time() + ($new_token_data['expires_in'] ?? 3599) // Fallback if 'created' is not set
                ];
                
                if (!update_user_settings($db, $update_data)) {
                    error_log("Failed to update Google access token in database after refresh.");
                    // Continue with the client as it might still work for this session, but log failure.
                }
            } catch (Exception $e) {
                error_log("Failed to refresh Google access token: " . $e->getMessage());
                // Optionally, clear the invalid tokens from DB to force re-authentication
                // update_user_settings($db, ['google_access_token' => null, 'google_refresh_token' => null, 'google_token_expiry' => null]);
                return null;
            }
        } else {
            error_log("Google access token expired, but no refresh token available.");
            // Optionally, clear the invalid access token
            // update_user_settings($db, ['google_access_token' => null, 'google_token_expiry' => null]);
            return null;
        }
    }
    return $client;
}

/**
 * Adds a booking to Google Calendar.
 *
 * @param PDO $db
 * @param array $booking_details Full booking details including client_name, package_name etc.
 * @return string|null Google Calendar event ID on success, null on failure.
 */
function add_booking_to_gcal(PDO $db, array $booking_details): ?string {
    $client = get_google_client($db);
    if (!$client) return null;

    $user_settings = get_user_settings($db); // Needed for calendarId
    $calendarId = !empty($user_settings['google_calendar_id']) ? $user_settings['google_calendar_id'] : 'primary';

    $service = new Google_Service_Calendar($client);

    $event_title = $booking_details['client_name'] ?? 'Booking';
    if (!empty($booking_details['package_name'])) {
        $event_title .= ' - ' . $booking_details['package_name'];
    } elseif (!empty($booking_details['category'])) {
        $event_title .= ' - ' . $booking_details['category'];
    }

    $description = "Booking Details:\n";
    $description .= "Client: " . ($booking_details['client_name'] ?? 'N/A') . "\n";
    if (!empty($booking_details['package_name'])) $description .= "Package: " . $booking_details['package_name'] . "\n";
    if (!empty($booking_details['category'])) $description .= "Category: " . $booking_details['category'] . "\n";
    if (!empty($booking_details['notes'])) $description .= "Notes: " . $booking_details['notes'] . "\n";
    $description .= "\nStatus: " . ($booking_details['status'] ?? 'N/A');


    $event = new Google_Service_Calendar_Event([
        'summary' => $event_title,
        'location' => $booking_details['location'] ?? '',
        'description' => $description,
    ]);

    // Set start and end times
    $start_datetime_str = $booking_details['booking_date'];
    $end_datetime_str = $booking_details['booking_date']; // Default end date is same as start

    if (!empty($booking_details['booking_time'])) {
        // Assume time is in HH:MM format
        $start_datetime_str .= 'T' . $booking_details['booking_time'] . ':00'; // Add seconds for full ISO compliance
        
        // Default duration: 1 hour if no specific end time logic
        $startTime = new DateTime($start_datetime_str);
        $endTime = clone $startTime;
        $endTime->add(new DateInterval('PT1H')); // Add 1 hour
        $end_datetime_str = $endTime->format('Y-m-d\TH:i:s');
    } else {
        // All-day event if no time specified
        $event->setStart(new Google_Service_Calendar_EventDateTime(['date' => $booking_details['booking_date']]));
        // For all-day events, end date should be the day AFTER the last day of the event.
        $startDate = new DateTime($booking_details['booking_date']);
        $endDate = clone $startDate;
        $endDate->add(new DateInterval('P1D')); // Add 1 day
        $event->setEnd(new Google_Service_Calendar_EventDateTime(['date' => $endDate->format('Y-m-d')]));
    }
    
    // If not an all-day event, set dateTime for start and end
    if (!empty($booking_details['booking_time'])) {
         $event->setStart(new Google_Service_Calendar_EventDateTime(['dateTime' => $start_datetime_str, 'timeZone' => date_default_timezone_get()]));
         $event->setEnd(new Google_Service_Calendar_EventDateTime(['dateTime' => $end_datetime_str, 'timeZone' => date_default_timezone_get()]));
    }


    try {
        $createdEvent = $service->events->insert($calendarId, $event);
        $gcal_event_id = $createdEvent->getId();

        // Update our booking record with the Google Calendar event ID
        $update_stmt = $db->prepare("UPDATE bookings SET google_calendar_event_id = :gcal_event_id WHERE id = :booking_id");
        $update_stmt->bindParam(':gcal_event_id', $gcal_event_id);
        $update_stmt->bindParam(':booking_id', $booking_details['id'], PDO::PARAM_INT);
        $update_stmt->execute();

        return $gcal_event_id;
    } catch (Google_Service_Exception $e) {
        error_log("Google Calendar event insert error: " . $e->getMessage());
        return null;
    } catch (Exception $e) {
        error_log("General error in add_booking_to_gcal: " . $e->getMessage());
        return null;
    }
}


/**
 * Updates an existing booking in Google Calendar.
 *
 * @param PDO $db
 * @param array $booking_details Full booking details including google_calendar_event_id.
 * @return string|null Google Calendar event ID on success, null on failure.
 */
function update_booking_in_gcal(PDO $db, array $booking_details): ?string {
    if (empty($booking_details['google_calendar_event_id'])) {
        error_log("Attempted to update GCal event, but no google_calendar_event_id provided for booking ID: " . $booking_details['id']);
        // Optionally, try to add it if it's missing
        // return add_booking_to_gcal($db, $booking_details);
        return null;
    }

    $client = get_google_client($db);
    if (!$client) return null;

    $user_settings = get_user_settings($db);
    $calendarId = !empty($user_settings['google_calendar_id']) ? $user_settings['google_calendar_id'] : 'primary';
    $service = new Google_Service_Calendar($client);

    try {
        $event = $service->events->get($calendarId, $booking_details['google_calendar_event_id']);

        $event_title = $booking_details['client_name'] ?? 'Booking';
        // ... (construct title and description as in add_booking_to_gcal) ...
        if (!empty($booking_details['package_name'])) $event_title .= ' - ' . $booking_details['package_name'];
        elseif (!empty($booking_details['category'])) $event_title .= ' - ' . $booking_details['category'];

        $description = "Booking Details:\nClient: " . ($booking_details['client_name'] ?? 'N/A') . "\n";
        if (!empty($booking_details['package_name'])) $description .= "Package: " . $booking_details['package_name'] . "\n";
        if (!empty($booking_details['category'])) $description .= "Category: " . $booking_details['category'] . "\n";
        if (!empty($booking_details['notes'])) $description .= "Notes: " . $booking_details['notes'] . "\n";
        $description .= "\nStatus: " . ($booking_details['status'] ?? 'N/A');

        $event->setSummary($event_title);
        $event->setLocation($booking_details['location'] ?? '');
        $event->setDescription($description);

        // Update start and end times (similar logic to add_booking_to_gcal)
        $start_datetime_str = $booking_details['booking_date'];
        $end_datetime_str = $booking_details['booking_date']; 
        if (!empty($booking_details['booking_time'])) {
            $start_datetime_str .= 'T' . $booking_details['booking_time'] . ':00';
            $startTime = new DateTime($start_datetime_str);
            $endTime = clone $startTime;
            $endTime->add(new DateInterval('PT1H')); // Default 1 hour duration
            $end_datetime_str = $endTime->format('Y-m-d\TH:i:s');
            
            $event->setStart(new Google_Service_Calendar_EventDateTime(['dateTime' => $start_datetime_str, 'timeZone' => date_default_timezone_get()]));
            $event->setEnd(new Google_Service_Calendar_EventDateTime(['dateTime' => $end_datetime_str, 'timeZone' => date_default_timezone_get()]));
        } else {
            $event->setStart(new Google_Service_Calendar_EventDateTime(['date' => $booking_details['booking_date']]));
            $startDate = new DateTime($booking_details['booking_date']);
            $endDate = clone $startDate; $endDate->add(new DateInterval('P1D'));
            $event->setEnd(new Google_Service_Calendar_EventDateTime(['date' => $endDate->format('Y-m-d')]));
        }
        
        $updatedEvent = $service->events->update($calendarId, $event->getId(), $event);
        return $updatedEvent->getId();

    } catch (Google_Service_Exception $e) {
        // If event not found (404), it might have been deleted from GCal. Try adding it as a new event.
        if ($e->getCode() == 404) {
            error_log("GCal event not found for update (booking ID: {$booking_details['id']}). Attempting to add as new.");
            return add_booking_to_gcal($db, $booking_details); // This will update the local google_calendar_event_id
        }
        error_log("Google Calendar event update error: " . $e->getMessage());
        return null;
    } catch (Exception $e) {
        error_log("General error in update_booking_in_gcal: " . $e->getMessage());
        return null;
    }
}

/**
 * Deletes a booking from Google Calendar.
 *
 * @param PDO $db
 * @param string $gcal_event_id Google Calendar event ID.
 * @return bool True on success, false on failure.
 */
function delete_booking_from_gcal(PDO $db, string $gcal_event_id): bool {
    if (empty($gcal_event_id)) return false;

    $client = get_google_client($db);
    if (!$client) return false;

    $user_settings = get_user_settings($db);
    $calendarId = !empty($user_settings['google_calendar_id']) ? $user_settings['google_calendar_id'] : 'primary';
    $service = new Google_Service_Calendar($client);

    try {
        $service->events->delete($calendarId, $gcal_event_id);
        return true;
    } catch (Google_Service_Exception $e) {
        // If event not found (404), consider it successfully deleted from GCal perspective.
        if ($e->getCode() == 404) {
            error_log("GCal event ID '$gcal_event_id' not found for deletion, presumed already deleted from GCal.");
            return true; 
        }
        error_log("Google Calendar event delete error: " . $e->getMessage());
        return false;
    } catch (Exception $e) {
        error_log("General error in delete_booking_from_gcal: " . $e->getMessage());
        return false;
    }
}

/**
 * Checks if the Google Calendar connection is active and tokens are valid.
 *
 * @param PDO $db
 * @return bool
 */
function check_gcal_connection(PDO $db): bool {
    $client = get_google_client($db); // This already handles token refresh
    if (!$client) {
        return false;
    }
    try {
        $service = new Google_Service_Calendar($client);
        // Perform a lightweight read operation
        $service->calendarList->listCalendarList(['maxResults' => 1]);
        return true;
    } catch (Google_Service_Exception $e) {
        // Specific API errors that might indicate connection issues
        error_log("Google Calendar connection check failed (API Service Exception): " . $e->getMessage());
        return false;
    } catch (Exception $e) {
        // Other errors during client usage
        error_log("Google Calendar connection check failed (General Exception): " . $e->getMessage());
        return false;
    }
}

?>
