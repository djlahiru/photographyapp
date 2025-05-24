<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Attempt to load user's config file first
if (file_exists(__DIR__ . '/../app/config.php')) {
    require_once __DIR__ . '/../app/config.php';
} else {
    // Fallback to example if actual config is missing (for development, shows error on page)
    // In production, this branch should ideally not be reached or should die gracefully.
    require_once __DIR__ . '/../app/config.example.php'; 
}

// Ensure Google API Client Library is available
if (!class_exists('Google_Client')) {
    // Attempt to load it if not autoloaded (e.g. if composer autoload is not setup/run yet)
    $vendor_autoload = __DIR__ . '/../app/vendor/autoload.php';
    if (file_exists($vendor_autoload)) {
        require_once $vendor_autoload;
    } else {
        // Display a more user-friendly error if the library is missing
        // This usually means `composer require google/apiclient:^2.0` hasn't been run
        // or the vendor directory is not correctly located/uploaded.
        die("Error: Google API Client Library not found. Please ensure it's installed via Composer. Path tried: " . htmlspecialchars($vendor_autoload));
    }
}


// Check if Google Client ID is set and not the placeholder
if (!defined('GOOGLE_CLIENT_ID') || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER' || GOOGLE_CLIENT_ID === '') {
    // Redirect back to profile settings with an error message
    // Store error in session for display on redirect page
    $_SESSION['gcal_error_message'] = "Google Calendar integration is not configured by the administrator. Client ID is missing or invalid.";
    header('Location: profile_settings.php?gcal_status=error_config');
    exit;
}


$client = new Google_Client();
try {
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_CLIENT_SECRET);
    $client->setRedirectUri(GOOGLE_REDIRECT_URI);
    $client->addScope(GOOGLE_API_SCOPES); // Can be an array or space-separated string
    $client->setAccessType('offline');    // To get a refresh token
    $client->setPrompt('consent');        // To ensure refresh token is provided on first auth and re-prompt if user revoked access
    // $client->setIncludeGrantedScopes(true); // Optional: If you need to check previously granted scopes

    // Generate the Google Authorization URL
    $authUrl = $client->createAuthUrl();

    // Redirect the user to the Google Authorization URL
    header('Location: ' . filter_var($authUrl, FILTER_SANITIZE_URL));
    exit();

} catch (Google_Exception $e) {
    // Log the exception details (important for debugging)
    error_log("Google OAuth Redirect Error: " . $e->getMessage());
    // Store a generic error message in session for display
    $_SESSION['gcal_error_message'] = "Error initiating Google Calendar connection: " . htmlspecialchars($e->getMessage());
    header('Location: profile_settings.php?gcal_status=error_init');
    exit;
} catch (Exception $e) {
    // Catch any other generic exceptions during client setup
    error_log("Generic Error in Google OAuth Redirect: " . $e->getMessage());
    $_SESSION['gcal_error_message'] = "A general error occurred while preparing Google Calendar connection.";
    header('Location: profile_settings.php?gcal_status=error_general');
    exit;
}

?>
