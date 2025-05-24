<?php
// Google OAuth Settings - RENAME to config.php and fill in your actual credentials
// DO NOT COMMIT config.php if it contains sensitive information.

// Ensure this file is not accessed directly
if (!defined('GOOGLE_CLIENT_ID_PLACEHOLDER')) { // Simple check, can be more robust
    // define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID');
    // define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');
    // define('GOOGLE_REDIRECT_URI', 'YOUR_APP_URL/public/google_oauth_callback.php'); // Full URL, e.g., https://example.com/public/google_oauth_callback.php
    // define('GOOGLE_API_SCOPES', 'https://www.googleapis.com/auth/calendar');
}

// To use the settings, you would typically have an app/config.php like this:
/*
<?php
define('GOOGLE_CLIENT_ID', 'YOUR_ACTUAL_GOOGLE_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'YOUR_ACTUAL_GOOGLE_CLIENT_SECRET');
// IMPORTANT: GOOGLE_REDIRECT_URI must exactly match one of the Authorized redirect URIs in your Google Cloud Console for this client.
define('GOOGLE_REDIRECT_URI', 'https://yourdomain.com/public/google_oauth_callback.php'); 
define('GOOGLE_API_SCOPES', 'https://www.googleapis.com/auth/calendar'); // Default scope, can be array or space-separated string
?>
*/

// Placeholder values to allow the application to run if config.php is missing (for development convenience only)
// In a production environment, you should ensure config.php exists and is correctly configured.
if (!defined('GOOGLE_CLIENT_ID')) {
    define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER');
}
if (!defined('GOOGLE_CLIENT_SECRET')) {
    define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET_PLACEHOLDER');
}
if (!defined('GOOGLE_REDIRECT_URI')) {
    // This should be the actual URL of your callback script
    // For local development, it might be http://localhost/path/to/app/public/google_oauth_callback.php
    define('GOOGLE_REDIRECT_URI', 'http://localhost/public/google_oauth_callback.php'); 
}
if (!defined('GOOGLE_API_SCOPES')) {
    define('GOOGLE_API_SCOPES', 'https://www.googleapis.com/auth/calendar');
}

?>
