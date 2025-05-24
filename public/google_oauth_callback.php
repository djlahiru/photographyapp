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

require_once __DIR__ . '/../app/actions/settings_actions.php'; // For get_db_connection, update_user_settings (or new specific function)

// Ensure Google API Client Library is available
if (!class_exists('Google_Client')) {
    $vendor_autoload = __DIR__ . '/../app/vendor/autoload.php';
    if (file_exists($vendor_autoload)) {
        require_once $vendor_autoload;
    } else {
        $_SESSION['gcal_error_message'] = "Error: Google API Client Library not found. Please ensure it's installed via Composer.";
        header('Location: profile_settings.php?gcal_status=error_setup');
        exit;
    }
}

// Check if Google Client ID is properly configured
if (!defined('GOOGLE_CLIENT_ID') || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER' || GOOGLE_CLIENT_ID === '') {
    $_SESSION['gcal_error_message'] = "Google Calendar integration is not configured by the administrator.";
    header('Location: profile_settings.php?gcal_status=error_config');
    exit;
}

$client = new Google_Client();
$client->setClientId(GOOGLE_CLIENT_ID);
$client->setClientSecret(GOOGLE_CLIENT_SECRET);
$client->setRedirectUri(GOOGLE_REDIRECT_URI);
$client->addScope(GOOGLE_API_SCOPES);
$client->setAccessType('offline'); 
// No need for $client->setPrompt('consent'); here, that's for the redirect script.

$db = get_db_connection();
if (!$db) {
    $_SESSION['gcal_error_message'] = "Database connection failed during Google OAuth callback.";
    header('Location: profile_settings.php?gcal_status=error_db');
    exit;
}

if (isset($_GET['code'])) {
    try {
        $token_data = $client->fetchAccessTokenWithAuthCode($_GET['code']);
        
        if (isset($token_data['error'])) {
            // Error fetching access token
            $_SESSION['gcal_error_message'] = "Error fetching Google access token: " . htmlspecialchars($token_data['error_description'] ?? $token_data['error']);
            header('Location: profile_settings.php?gcal_status=error_token_fetch');
            exit;
        }

        if (isset($token_data['access_token'])) {
            $settings_to_update = [];
            $settings_to_update['google_access_token'] = $token_data['access_token'];
            
            if (isset($token_data['refresh_token'])) {
                $settings_to_update['google_refresh_token'] = $token_data['refresh_token'];
            }
            
            if (isset($token_data['expires_in'])) {
                $settings_to_update['google_token_expiry'] = time() + $token_data['expires_in'];
            }

            // Call the existing update_user_settings or a new dedicated function
            // For simplicity, reusing update_user_settings. 
            // Ensure ensure_user_settings_table_exists_and_seeded is called within it or before.
            ensure_user_settings_table_exists_and_seeded($db); 

            if (update_user_settings($db, $settings_to_update)) {
                // Success!
                header('Location: profile_settings.php?gcal_status=success');
                exit;
            } else {
                $_SESSION['gcal_error_message'] = "Failed to save Google tokens to the database.";
                header('Location: profile_settings.php?gcal_status=error_db_save');
                exit;
            }
        } else {
            $_SESSION['gcal_error_message'] = "Invalid token data received from Google.";
            header('Location: profile_settings.php?gcal_status=error_token_invalid');
            exit;
        }

    } catch (Google_Service_Exception $e) {
        $_SESSION['gcal_error_message'] = "Google API Service Exception: " . htmlspecialchars($e->getMessage());
        error_log("Google_Service_Exception in OAuth callback: " . $e->getMessage());
        header('Location: profile_settings.php?gcal_status=error_gservice');
        exit;
    } catch (Google_Exception $e) {
        $_SESSION['gcal_error_message'] = "Google API Client Exception: " . htmlspecialchars($e->getMessage());
        error_log("Google_Exception in OAuth callback: " . $e->getMessage());
        header('Location: profile_settings.php?gcal_status=error_gclient');
        exit;
    } catch (Exception $e) {
        $_SESSION['gcal_error_message'] = "A general error occurred during Google OAuth callback: " . htmlspecialchars($e->getMessage());
        error_log("General Exception in OAuth callback: " . $e->getMessage());
        header('Location: profile_settings.php?gcal_status=error_general');
        exit;
    }

} elseif (isset($_GET['error'])) {
    // User denied access or other error
    $_SESSION['gcal_error_message'] = "Google Calendar connection attempt failed or was denied. Error: " . htmlspecialchars($_GET['error']);
    header('Location: profile_settings.php?gcal_status=error_denied');
    exit;
} else {
    // No code and no error, unusual state
    $_SESSION['gcal_error_message'] = "Invalid request to Google OAuth callback.";
    header('Location: profile_settings.php?gcal_status=error_invalid_request');
    exit;
}
?>
