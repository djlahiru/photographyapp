<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Attempt to load user's config file first
if (file_exists(__DIR__ . '/../app/config.php')) {
    require_once __DIR__ . '/../app/config.php';
} else {
    require_once __DIR__ . '/../app/config.example.php'; 
}

require_once __DIR__ . '/../app/actions/settings_actions.php'; // For get_db_connection, update_user_settings

// Ensure Google API Client Library is available for token revocation
if (!class_exists('Google_Client')) {
    $vendor_autoload = __DIR__ . '/../app/vendor/autoload.php';
    if (file_exists($vendor_autoload)) {
        require_once $vendor_autoload;
    }
    // If it's still not found, we can proceed with DB clearing but log that revocation was skipped.
}

$db = get_db_connection();
if (!$db) {
    $_SESSION['gcal_error_message'] = "Database connection failed during Google disconnect process.";
    header('Location: profile_settings.php?gcal_status=error_db');
    exit;
}

// Fetch current settings to get the access token for revocation
ensure_user_settings_table_exists_and_seeded($db); // Ensure table/row exists
$current_settings = get_user_settings($db);
$token_to_revoke = $current_settings['google_access_token'] ?? null;

// Attempt to revoke the token with Google (optional but good practice)
if ($token_to_revoke && class_exists('Google_Client')) {
    try {
        $client = new Google_Client();
        // No need to set client ID/secret for simple token revocation if token is self-contained
        // However, some libraries or specific revocation endpoints might require it.
        // For Google, typically the token itself is enough for their revocation endpoint.
        // $client->setClientId(GOOGLE_CLIENT_ID); // Usually not needed for revoke
        // $client->setClientSecret(GOOGLE_CLIENT_SECRET); // Usually not needed for revoke
        
        // The revokeToken method might try to use cURL.
        // It's a good faith effort; if it fails, we still proceed to clear DB.
        $client->revokeToken($token_to_revoke); 
        // Note: Google_Client::revokeToken can return true on success, false on failure, or throw.
        // We'll proceed regardless of its direct outcome, as DB clear is primary.
    } catch (Exception $e) {
        // Log the error but don't let it stop the disconnect process from our DB
        error_log("Error revoking Google token: " . $e->getMessage());
    }
}

// Clear Google-related fields from the database
$settings_to_clear = [
    'google_access_token' => null,
    'google_refresh_token' => null,
    'google_token_expiry' => null,
    'google_calendar_id' => null // Also clear the calendar ID if user disconnects
];

if (update_user_settings($db, $settings_to_clear)) {
    header('Location: profile_settings.php?gcal_status=disconnected');
    exit;
} else {
    $_SESSION['gcal_error_message'] = "Failed to clear Google tokens from the database.";
    header('Location: profile_settings.php?gcal_status=error_db_clear');
    exit;
}
?>
