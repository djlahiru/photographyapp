<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start(); 
}

require_once __DIR__ . '/../app/actions/settings_actions.php'; // Defines PROFILE_PIC_WEB_ACCESSIBLE_PATH

$db_layout = get_db_connection(); 
$user_settings = null;
$default_profile_name = 'User'; 

if ($db_layout) {
    ensure_user_settings_table_exists_and_seeded($db_layout);
    $user_settings = get_user_settings($db_layout);
}

$theme_mode_class = 'light-mode'; 
$theme_color_name = 'Ocean Blue'; 
$datetime_format_php = 'Y-m-d H:i'; 
$profile_name = $default_profile_name;
$profile_picture_display_path = 'assets/img/default-profile.png'; 

if ($user_settings) {
    $theme_mode_class = ($user_settings['theme_mode'] === 'Dark') ? 'dark-mode' : 'light-mode';
    $theme_color_name = $user_settings['theme_color'] ?? 'Ocean Blue';
    $datetime_format_php = $user_settings['datetime_format'] ?? 'Y-m-d H:i'; 
    $profile_name = !empty($user_settings['profile_name']) ? $user_settings['profile_name'] : $default_profile_name;
    
    if (!empty($user_settings['profile_picture_path']) && file_exists(__DIR__ . '/' . $user_settings['profile_picture_path'])) {
        $profile_picture_display_path = $user_settings['profile_picture_path'];
    }
}
$theme_color_class = 'theme-' . strtolower(str_replace(' ', '-', $theme_color_name));

function format_datetime_user(string $datetime_string, ?string $custom_format = null): string {
    global $datetime_format_php; 

    if (empty($datetime_string) || $datetime_string === '0000-00-00 00:00:00' || $datetime_string === '0000-00-00') {
        return 'N/A'; 
    }
    try {
        $date = new DateTime($datetime_string);
        $format_to_use = $custom_format ?? $datetime_format_php;
        if (empty($format_to_use)) {
            $format_to_use = 'Y-m-d H:i'; 
        }
        return $date->format($format_to_use);
    } catch (Exception $e) {
        return $datetime_string; 
    }
}

function get_page_title() {
    $script_name = basename($_SERVER['SCRIPT_FILENAME'], '.php');
    $script_name = str_replace(['_', '-'], ' ', $script_name); // Replace underscores and hyphens
    $script_name = ucwords($script_name);
    if ($script_name == 'Index') return 'Dashboard - PhotoManager';
    if ($script_name == 'Profile Settings') return 'User Profile - PhotoManager';
    return $script_name . ' - PhotoManager';
}
$page_title = get_page_title();
$current_page_basename = basename($_SERVER['PHP_SELF']);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($page_title); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/base_theme.css">
    <link rel="stylesheet" href="assets/css/dark_mode.css">
    <link rel="stylesheet" href="assets/css/color_themes.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.min.css">
    <style>
        :root { /* Define nav-height if not already in base_theme.css */
            --nav-height: 56px; /* Standard Bootstrap navbar height */
        }
        .nav-profile-pic {
            width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 8px;
        }
        .main-content-area {
            padding-top: var(--nav-height); /* Space for the fixed top navbar */
        }
        .sidebar-nav .nav-link { /* Specific to new offcanvas sidebar */
            padding: 0.75rem 1.25rem;
            color: var(--text-color); /* Uses themed text color */
            display: flex;
            align-items: center;
        }
        .sidebar-nav .nav-link .bi {
            margin-right: 0.75rem;
            font-size: 1.1rem;
        }
        .sidebar-nav .nav-link:hover {
            background-color: var(--primary-color);
            color: var(--text-on-primary, #fff);
        }
        .sidebar-nav .nav-link.active {
            background-color: var(--primary-color);
            color: var(--text-on-primary, #fff);
            font-weight: bold;
        }
        .offcanvas-body {
            padding: 0; /* Remove padding if nav links have their own */
        }
        .top-navbar { /* Ensure it stays on top */
            z-index: 1030; 
        }
        /* Adjustments for when offcanvas is open on larger screens */
        @media (min-width: 992px) { /* lg breakpoint */
            .offcanvas-lg.offcanvas-start {
                top: var(--nav-height); /* Position below top navbar */
                width: 250px;
                height: calc(100vh - var(--nav-height)); /* Full height minus navbar */
                border-right: 1px solid var(--border-color);
            }
            .main-content-area-with-sidebar {
                margin-left: 250px; /* Make space for always-open sidebar */
            }
        }
        /* Ensure content area gets full width if sidebar is not permanently shown */
        .app-container-content {
             padding: 1.5rem;
        }
    </style>
</head>
<body class="<?php echo htmlspecialchars($theme_mode_class . ' ' . $theme_color_class); ?>">

<nav class="navbar navbar-expand-lg top-navbar fixed-top">
    <div class="container-fluid">
        <button class="navbar-toggler me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand" href="index.php">
            <i class="bi bi-camera-fill me-2"></i>PhotoManager
        </a>
        <div class="ms-auto"> {/* This will push the user dropdown to the far right */}
            <ul class="navbar-nav">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="<?php echo htmlspecialchars($profile_picture_display_path); ?>?<?php echo time(); ?>" alt="Profile" class="nav-profile-pic">
                        <?php echo htmlspecialchars($profile_name); ?>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                        <li><a class="dropdown-item" href="profile_settings.php"><i class="bi bi-gear-fill me-2"></i>Settings</a></li>
                        <li><a class="dropdown-item" href="profile_settings.php#google-calendar-section"><i class="bi bi-google me-2"></i>Google Calendar</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-box-arrow-right me-2"></i>Logout (Placeholder)</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>

<div class="offcanvas-lg offcanvas-start sidebar-nav" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="sidebarMenuLabel">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
        <nav class="nav flex-column">
            <a class="nav-link <?php echo ($current_page_basename == 'index.php') ? 'active' : ''; ?>" href="index.php"><i class="bi bi-house-door-fill"></i>Dashboard</a>
            <a class="nav-link <?php echo ($current_page_basename == 'calendar.php') ? 'active' : ''; ?>" href="calendar.php"><i class="bi bi-calendar-event-fill"></i>Calendar</a>
            <a class="nav-link <?php echo ($current_page_basename == 'bookings.php' || $current_page_basename == 'add_booking.php' || $current_page_basename == 'edit_booking.php' || $current_page_basename == 'booking_payments.php') ? 'active' : ''; ?>" href="bookings.php"><i class="bi bi-calendar-check-fill"></i>Bookings</a>
            <a class="nav-link <?php echo ($current_page_basename == 'clients.php' || $current_page_basename == 'add_client.php' || $current_page_basename == 'edit_client.php') ? 'active' : ''; ?>" href="clients.php"><i class="bi bi-people-fill"></i>Clients</a>
            <a class="nav-link <?php echo ($current_page_basename == 'packages.php' || $current_page_basename == 'add_package.php' || $current_page_basename == 'edit_package.php') ? 'active' : ''; ?>" href="packages.php"><i class="bi bi-box-seam-fill"></i>Packages</a>
            <a class="nav-link <?php echo ($current_page_basename == 'profile_settings.php') ? 'active' : ''; ?>" href="profile_settings.php"><i class="bi bi-person-circle"></i>Profile Settings</a>
        </nav>
    </div>
</div>

<div class="main-content-area main-content-area-with-sidebar"> {/* Add class to shift content when sidebar is always open */}
    <div class="container-fluid app-container-content"> {/* Renamed for clarity */}
    {/* Content of specific pages will go here */}
```
