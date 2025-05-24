<?php
// Session start is in layout_header.php
require_once '../app/actions/settings_actions.php'; // Defines PROFILE_PIC_WEB_ACCESSIBLE_PATH, MAX_UPLOAD_SIZE etc.

// Attempt to include user's config file. Suppress errors if it doesn't exist yet.
@include_once __DIR__ . '/../app/config.php';

$db_page_specific = get_db_connection();
if (!$db_page_specific) {
    die("Database connection failed for profile settings page.");
}

ensure_user_settings_table_exists_and_seeded($db_page_specific); // Ensures new GCal columns might be added if schema was updated

$status_message_settings = ''; 
$message_type_settings = 'info';

// Handle OAuth status messages from redirect
if(isset($_GET['gcal_status'])) {
    if($_GET['gcal_status'] === 'success') {
        $status_message_settings = "Successfully connected to Google Calendar!";
        $message_type_settings = 'success';
    } elseif($_GET['gcal_status'] === 'error') {
        $status_message_settings = "Failed to connect to Google Calendar. Error: " . htmlspecialchars($_GET['error_msg'] ?? 'Unknown error.');
        $message_type_settings = 'danger';
    } elseif($_GET['gcal_status'] === 'disconnected') {
        $status_message_settings = "Successfully disconnected from Google Calendar.";
        $message_type_settings = 'success';
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $settings_data_update = [];
    
    if (isset($_POST['profile_name'])) {
        $settings_data_update['profile_name'] = trim($_POST['profile_name']);
    }
    if (isset($_POST['theme_mode'])) {
        $settings_data_update['theme_mode'] = $_POST['theme_mode'];
    }
    if (isset($_POST['theme_color'])) {
        $settings_data_update['theme_color'] = $_POST['theme_color'];
    }
    if (isset($_POST['datetime_format'])) {
        $settings_data_update['datetime_format'] = $_POST['datetime_format'];
    }
    // Add google_calendar_id to the settings update
    if (isset($_POST['google_calendar_id'])) {
        $settings_data_update['google_calendar_id'] = trim($_POST['google_calendar_id']);
    }


    $profile_picture_file_data_upload = null;
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] !== UPLOAD_ERR_NO_FILE) {
        $profile_picture_file_data_upload = $_FILES['profile_picture'];
    } elseif (isset($_POST['remove_profile_picture']) && $_POST['remove_profile_picture'] == '1') {
        $settings_for_pic_delete = get_user_settings($db_page_specific); 
        if ($settings_for_pic_delete && !empty($settings_for_pic_delete['profile_picture_path'])) {
            $old_pic_server_path = __DIR__ . '/' . $settings_for_pic_delete['profile_picture_path'];
             if (file_exists($old_pic_server_path)) {
                @unlink($old_pic_server_path); 
            }
        }
        $settings_data_update['profile_picture_path'] = null; 
    }

    if (update_user_settings($db_page_specific, $settings_data_update, $profile_picture_file_data_upload)) {
        if(empty($status_message_settings)){ // Don't overwrite GCal status messages
            $status_message_settings = "Settings updated successfully! Changes will be fully reflected on next page load or refresh.";
            $message_type_settings = 'success';
        }
    } else {
         if(empty($status_message_settings)){
            $status_message_settings = "Error updating settings. Please check file type/size if uploading a picture, or try again.";
            $message_type_settings = 'danger';
        }
    }
}

$current_settings_for_form = get_user_settings($db_page_specific);
if (!$current_settings_for_form) {
    $current_settings_for_form = [ 
        'profile_name' => 'User', 'profile_picture_path' => null, 'theme_mode' => 'Light',
        'theme_color' => 'Ocean Blue', 'datetime_format' => 'Y-m-d H:i',
        'google_access_token' => null, 'google_calendar_id' => null // Ensure these exist for checks
    ];
    if(empty($status_message_settings)) {
        $status_message_settings = "Could not load user settings for the form. Displaying defaults.";
        $message_type_settings = 'warning';
    }
}

$theme_color_options_form = ["Ocean Blue", "Sanguine", "Luscious Lime", "Purple Lake", "Green Beach", "Kashmir", "Antarctica", "Yosemite", "Winter Neva"];
$datetime_format_options_form = [
    'Y-m-d H:i' => 'YYYY-MM-DD HH:MM (' . date('Y-m-d H:i') . ')',
    'd/m/Y H:i' => 'DD/MM/YYYY HH:MM (' . date('d/m/Y H:i') . ')',
    'm/d/Y h:i A' => 'MM/DD/YYYY hh:mm A (' . date('m/d/Y h:i A') . ')',
    'F j, Y g:i A' => 'Month D, YYYY h:i A (' . date('F j, Y g:i A') . ')',
];

// Google Calendar Connection Status Check (basic)
$is_google_connected = !empty($current_settings_for_form['google_access_token']);
// A more robust check would involve checking token expiry and trying a refresh token if expired.

require_once 'layout_header.php'; 
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>User Profile Settings</h1>
    </div>

    <?php if (!empty($status_message_settings)): ?>
        <div class="alert alert-<?php echo $message_type_settings; ?> alert-dismissible fade show" role="alert">
            <?php echo htmlspecialchars($status_message_settings); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <form action="profile_settings.php" method="POST" enctype="multipart/form-data">
        <div class="row">
            <div class="col-lg-6">
                <div class="card mb-3">
                    <div class="card-header"><h5 class="card-title mb-0">Profile Identity</h5></div>
                    <div class="card-body">
                        <div class="mb-3 text-center">
                            <?php 
                            $pic_path_for_display_form = 'assets/img/default-profile.png'; 
                            if (!empty($current_settings_for_form['profile_picture_path']) && file_exists(__DIR__ . '/' . $current_settings_for_form['profile_picture_path'])) {
                                $pic_path_for_display_form = htmlspecialchars($current_settings_for_form['profile_picture_path']);
                            } elseif (!empty($current_settings_for_form['profile_picture_path'])) {
                                 echo '<small class="text-danger d-block mb-2">Profile picture file not found. Please re-upload.</small>';
                            }
                            ?>
                            <img src="<?php echo $pic_path_for_display_form; ?>?<?php echo time(); ?>" alt="Profile Picture" class="profile-pic-preview img-thumbnail">
                        </div>
                        <div class="mb-3">
                            <label for="profile_picture" class="form-label">Change Profile Picture</label>
                            <input type="file" class="form-control" id="profile_picture" name="profile_picture">
                            <div class="form-text">
                                Allowed: JPG, PNG, GIF. Max: <?php echo defined('MAX_UPLOAD_SIZE') ? MAX_UPLOAD_SIZE / (1024*1024) : '2'; ?>MB.
                            </div>
                        </div>
                         <?php if (!empty($current_settings_for_form['profile_picture_path'])): ?>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="remove_profile_picture" name="remove_profile_picture" value="1">
                            <label class="form-check-label" for="remove_profile_picture">Remove current profile picture</label>
                        </div>
                        <?php endif; ?>
                        <div class="mb-3">
                            <label for="profile_name" class="form-label">Profile Name</label>
                            <input type="text" class="form-control" id="profile_name" name="profile_name" value="<?php echo htmlspecialchars($current_settings_for_form['profile_name'] ?? 'User'); ?>">
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card mb-3">
                     <div class="card-header"><h5 class="card-title mb-0">Appearance & Formatting</h5></div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="theme_mode" class="form-label">Theme Mode</label>
                            <select class="form-select" id="theme_mode" name="theme_mode">
                                <option value="Light" <?php echo (($current_settings_for_form['theme_mode'] ?? 'Light') === 'Light') ? 'selected' : ''; ?>>Light</option>
                                <option value="Dark" <?php echo (($current_settings_for_form['theme_mode'] ?? 'Light') === 'Dark') ? 'selected' : ''; ?>>Dark</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="theme_color" class="form-label">Theme Color</label>
                            <select class="form-select" id="theme_color" name="theme_color">
                                <?php foreach ($theme_color_options_form as $color): ?>
                                    <option value="<?php echo htmlspecialchars($color); ?>" <?php echo (($current_settings_for_form['theme_color'] ?? 'Ocean Blue') === $color) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($color); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="datetime_format" class="form-label">Date/Time Display Format</label>
                            <select class="form-select" id="datetime_format" name="datetime_format">
                                <?php foreach ($datetime_format_options_form as $format_value => $format_display): ?>
                                    <option value="<?php echo htmlspecialchars($format_value); ?>" <?php echo (($current_settings_for_form['datetime_format'] ?? 'Y-m-d H:i') === $format_value) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($format_display); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-header"><h5 class="card-title mb-0">Integrations</h5></div>
                    <div class="card-body">
                        <h6>Google Calendar Integration</h6>
                        <?php if (!defined('GOOGLE_CLIENT_ID') || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER'): ?>
                            <div class="alert alert-warning">
                                Google Calendar integration is not configured by the administrator.
                                Please set up API credentials in <code>app/config.php</code>.
                            </div>
                        <?php elseif ($is_google_connected): ?>
                            <p class="text-success"><i class="bi bi-check-circle-fill"></i> Status: Connected to Google Calendar.</p>
                            <a href="google_disconnect.php" class="btn btn-danger btn-sm">
                                <i class="bi bi-google me-2"></i>Disconnect
                            </a>
                        <?php else: ?>
                            <p class="text-muted"><i class="bi bi-exclamation-circle"></i> Status: Not Connected.</p>
                            <a href="google_oauth_redirect.php" class="btn btn-primary btn-sm">
                                <i class="bi bi-google me-2"></i>Connect to Google Calendar
                            </a>
                        <?php endif; ?>
                        <hr>
                        <div class="mb-3">
                            <label for="google_calendar_id" class="form-label">Google Calendar ID for Sync</label>
                            <input type="text" class="form-control" id="google_calendar_id" name="google_calendar_id" value="<?php echo htmlspecialchars($current_settings_for_form['google_calendar_id'] ?? ''); ?>" placeholder="primary (default) or specific_calendar_id@group.calendar.google.com">
                            <div class="form-text">
                                Leave blank to use your primary Google Calendar. Otherwise, provide the specific Calendar ID.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-3 text-center">
            <button type="submit" class="btn btn-success"><i class="bi bi-save-fill me-2"></i>Save All Settings</button>
        </div>
    </form>
</div>

<?php
require_once 'layout_footer.php';
?>
