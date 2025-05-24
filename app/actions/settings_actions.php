<?php

// Define path for profile picture uploads and other constants
define('PROFILE_PIC_UPLOAD_PATH', __DIR__ . '/../../public/uploads/profile_pictures/');
define('PROFILE_PIC_WEB_ACCESSIBLE_PATH', 'uploads/profile_pictures/'); // Relative to public directory
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif']);
define('MAX_UPLOAD_SIZE', 2 * 1024 * 1024); // 2MB

// Database connection function
function get_db_connection() {
    static $db = null;
    if ($db === null) {
        try {
            $db_path = __DIR__ . '/../../db/photograph_management.sqlite';
            $db = new PDO('sqlite:' . $db_path);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $db->exec('PRAGMA foreign_keys = ON;');
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null; 
        }
    }
    return $db;
}

/**
 * Ensures the user_settings table exists and the default row (id=1) is seeded.
 * This function now includes Google Calendar related fields.
 *
 * @param PDO $db The PDO database connection object.
 */
function ensure_user_settings_table_exists_and_seeded(PDO $db) {
    if (!$db) return;

    $table_exists = false;
    try {
        // Check if one of the new columns exists to infer if schema is updated
        $db->query("SELECT google_access_token FROM user_settings LIMIT 1");
        $table_exists = true;
    } catch (PDOException $e) {
        // Column or table does not exist, try to create/update
        // This is a simplified check. A proper migration system would be better.
        $schema_sql = "
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            profile_name TEXT DEFAULT 'User',
            profile_picture_path TEXT,
            theme_mode TEXT DEFAULT 'Light' CHECK (theme_mode IN ('Light', 'Dark')),
            theme_color TEXT DEFAULT 'Ocean Blue',
            datetime_format TEXT DEFAULT 'YYYY-MM-DD HH:MM',
            google_access_token TEXT,
            google_refresh_token TEXT,
            google_token_expiry INTEGER, 
            google_calendar_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TRIGGER IF NOT EXISTS trigger_user_settings_updated_at
        AFTER UPDATE ON user_settings
        FOR EACH ROW
        BEGIN
            UPDATE user_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;";
        
        // Attempt to add new columns if table already exists but columns are missing (SQLite specific)
        // This is a basic approach; a full migration system is more robust.
        $alter_statements = [
            "ALTER TABLE user_settings ADD COLUMN google_access_token TEXT;",
            "ALTER TABLE user_settings ADD COLUMN google_refresh_token TEXT;",
            "ALTER TABLE user_settings ADD COLUMN google_token_expiry INTEGER;",
            "ALTER TABLE user_settings ADD COLUMN google_calendar_id TEXT;"
        ];

        try {
            $db->exec($schema_sql); // Create table if not exists
            $table_exists = true; 
            // Try to add columns - will fail if they exist, which is fine.
            foreach($alter_statements as $alter_stmt) {
                try { $db->exec($alter_stmt); } catch (PDOException $ae) { /* ignore if column exists */ }
            }
        } catch (PDOException $exec_e) {
            error_log("Failed to create/update user_settings table: " . $exec_e->getMessage());
            return; 
        }
    }

    if ($table_exists) {
        $stmt = $db->query("SELECT COUNT(*) as count FROM user_settings WHERE id = 1");
        $row_count = $stmt->fetchColumn();

        if ($row_count == 0) {
            $seed_sql = "
            INSERT OR IGNORE INTO user_settings (id, profile_name, theme_mode, theme_color, datetime_format, google_calendar_id)
            VALUES (1, 'User', 'Light', 'Ocean Blue', 'YYYY-MM-DD HH:MM', 'primary');"; // Default calendar ID to 'primary'
            try {
                $db->exec($seed_sql);
            } catch (PDOException $seed_e) {
                error_log("Failed to seed user_settings table: " . $seed_e->getMessage());
            }
        }
    }
}

/**
 * Fetches the user settings for id=1.
 */
function get_user_settings(PDO $db): array|false {
    if (!$db) return false;
    ensure_user_settings_table_exists_and_seeded($db); 

    try {
        $stmt = $db->prepare("SELECT * FROM user_settings WHERE id = 1");
        $stmt->execute();
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        return $settings ?: false; 
    } catch (PDOException $e) {
        error_log("Get user settings error: " . $e->getMessage());
        return false;
    }
}

/**
 * Updates user settings and optionally handles profile picture upload.
 */
function update_user_settings(PDO $db, array $settings_data, ?array $profile_picture_file = null): bool {
    if (!$db) return false;
    ensure_user_settings_table_exists_and_seeded($db);

    $current_settings = get_user_settings($db); 

    if (isset($profile_picture_file) && $profile_picture_file['error'] === UPLOAD_ERR_OK) {
        if (!in_array($profile_picture_file['type'], ALLOWED_IMAGE_TYPES)) {
            error_log("Profile picture upload error: Invalid file type - " . $profile_picture_file['type']);
            return false; 
        }
        if ($profile_picture_file['size'] > MAX_UPLOAD_SIZE) {
            error_log("Profile picture upload error: File too large - " . $profile_picture_file['size'] . " bytes.");
            return false;
        }
        if (!is_dir(PROFILE_PIC_UPLOAD_PATH)) {
            if (!mkdir(PROFILE_PIC_UPLOAD_PATH, 0755, true)) {
                error_log("Profile picture upload error: Failed to create upload directory " . PROFILE_PIC_UPLOAD_PATH);
                return false;
            }
        }
        $extension = pathinfo($profile_picture_file['name'], PATHINFO_EXTENSION);
        $sanitized_original_name = preg_replace("/[^a-zA-Z0-9_.-]/", "", basename($profile_picture_file['name'], "." . $extension));
        $unique_filename = "user_1_" . time() . "_" . $sanitized_original_name . "." . $extension;
        $destination_path = PROFILE_PIC_UPLOAD_PATH . $unique_filename;

        if (move_uploaded_file($profile_picture_file['tmp_name'], $destination_path)) {
            if ($current_settings && !empty($current_settings['profile_picture_path']) && $current_settings['profile_picture_path'] !== (PROFILE_PIC_WEB_ACCESSIBLE_PATH . $unique_filename)) {
                $old_pic_server_path = __DIR__ . '/../../public/' . $current_settings['profile_picture_path'];
                if (file_exists($old_pic_server_path)) {
                    @unlink($old_pic_server_path);
                }
            }
            $settings_data['profile_picture_path'] = PROFILE_PIC_WEB_ACCESSIBLE_PATH . $unique_filename;
        } else {
            error_log("Profile picture upload error: Failed to move uploaded file to " . $destination_path);
            return false; 
        }
    } elseif (isset($profile_picture_file) && $profile_picture_file['error'] !== UPLOAD_ERR_NO_FILE) {
        error_log("Profile picture upload error: Code " . $profile_picture_file['error']);
        return false;
    }

    if (empty($settings_data)) {
        return true; 
    }

    $fields_to_update = [];
    $params = [];
    $allowed_fields = [
        'profile_name', 'profile_picture_path', 'theme_mode', 'theme_color', 'datetime_format',
        'google_access_token', 'google_refresh_token', 'google_token_expiry', 'google_calendar_id'
    ];

    foreach ($settings_data as $key => $value) {
        if (in_array($key, $allowed_fields)) {
            $fields_to_update[] = "$key = :$key";
            // Handle explicit NULL for certain fields if value is empty string, otherwise pass value
            if ($value === '' && !in_array($key, ['profile_name', 'google_calendar_id'])) { 
                $params[":$key"] = null;
            } else {
                $params[":$key"] = $value;
            }
        }
    }

    if (empty($fields_to_update)) {
        return true; 
    }

    $sql = "UPDATE user_settings SET " . implode(", ", $fields_to_update) . " WHERE id = 1";

    try {
        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    } catch (PDOException $e) {
        error_log("Update user settings error: " . $e->getMessage());
        if (strpos($e->getMessage(), 'CHECK constraint failed: theme_mode') !== false) {
            // Specific error handling
        }
        return false;
    }
}
?>
