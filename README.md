# Photography Work Management Web Application

## Overview

This web application provides a comprehensive solution for managing the various aspects of a photography business. It allows users to organize service packages, manage client information, schedule bookings, track payments, and customize their user experience with theming and profile settings. A key feature is the integration with Google Calendar for seamless booking synchronization.

**Core Features Implemented:**

*   **Package Management:** Create, view, edit, and delete photography service packages.
*   **Client Management:** Manage client details, including contact information and financial summaries (total booking value, payments made, outstanding balance).
*   **Booking Management:** Schedule new bookings, link them to clients and packages, update booking details, manage booking status (pending, confirmed, completed, cancelled), and categorize bookings.
*   **Payment Tracking:** Record and manage payments for each booking.
*   **In-App Calendar:** A visual calendar (using FullCalendar) displaying all bookings, color-coded by status, with links to edit individual bookings.
*   **Dashboard:** An overview page displaying key statistics (active bookings, payments this month), lists of upcoming/recent bookings, recently added clients, and a breakdown of bookings by category.
*   **User Profile & Settings:**
    *   Customize profile name and upload a profile picture.
    *   Select application theme (Light/Dark mode).
    *   Choose from multiple color themes.
    *   Set preferred date/time display format.
*   **Google Calendar Sync:**
    *   OAuth 2.0 integration to connect to a user's Google Calendar.
    *   Automatic creation, update, and deletion of Google Calendar events corresponding to bookings in the application.
    *   Option to specify a target Google Calendar ID or use the primary calendar.
    *   Dashboard indicator for Google Calendar connection status.

## Features Details

*   **Theme System:** The application features a dynamic theme system. Users can choose between Light and Dark modes, and further customize the appearance with several pre-defined color themes (e.g., Ocean Blue, Sanguine, Luscious Lime). This is managed via CSS variables and applied throughout the application.
*   **Dashboard Components:** The dashboard provides at-a-glance information critical for managing the business, including financial summaries for the current month, counts of active bookings, and quick lists for upcoming work and recent client additions.
*   **Responsive Design:** The application is built with Bootstrap 5 and aims for a responsive user interface that adapts to various screen sizes (desktop, tablet, mobile).

## Requirements

*   **PHP:** Version 7.4 or 8.0+
*   **Web Server:** Apache, Nginx, or any other PHP-compatible web server.
    *   URL rewriting should be enabled if clean URLs are desired (though not strictly required by the current file structure).
*   **PHP Extensions:**
    *   `pdo_sqlite` (for SQLite database interaction)
    *   `mbstring` (commonly used by libraries like Google API client)
    *   `json` (for handling JSON data, typically enabled by default)
    *   `openssl` (for HTTPS and Google API client)
    *   `curl` (often used by Google API client for HTTP requests)
*   **Composer:** Required for managing PHP dependencies (specifically `google/apiclient`).

## Setup Instructions

1.  **Clone Repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install Dependencies:**
    Install the Google API Client library using Composer:
    ```bash
    composer install
    ```
    This will create a `vendor` directory in `app/`.

3.  **Configuration:**
    *   Copy the example configuration file:
        ```bash
        cp app/config.example.php app/config.php
        ```
    *   Edit `app/config.php` and fill in your Google Cloud Platform OAuth 2.0 credentials:
        *   `GOOGLE_CLIENT_ID`
        *   `GOOGLE_CLIENT_SECRET`
        *   `GOOGLE_REDIRECT_URI`: This **must exactly match** one of the "Authorized redirect URIs" you configured for your OAuth 2.0 client ID in the Google Cloud Console. For local development, it might be something like `http://localhost/your_project_path/public/google_oauth_callback.php`. For production, it would be `https://yourdomain.com/public/google_oauth_callback.php`.
    *   **Important:** Do NOT commit `app/config.php` to version control if it contains your sensitive API credentials. Add it to your `.gitignore` file if it's not already there.

4.  **Directory Permissions:**
    Ensure the web server has write permissions for the following directories:
    *   `public/uploads/profile_pictures/`: For profile picture uploads.
        ```bash
        # Example (adjust path and user/group as needed)
        sudo chown -R www-data:www-data public/uploads/
        sudo chmod -R 755 public/uploads/ 
        ```
    *   `db/`: For creating and writing to the SQLite database file (`photograph_management.sqlite`).
        ```bash
        # Example (adjust path and user/group as needed)
        sudo chown -R www-data:www-data db/
        sudo chmod -R 775 db/ # Or 755 if group permissions are sufficient
        ```

5.  **Database Setup:**
    *   The SQLite database file (`db/photograph_management.sqlite`) will be created automatically, and tables will be set up when you first access parts of the application that interact with the database. This is due to the `ensure_*_table_exists()` and `ensure_user_settings_table_exists_and_seeded()` functions within the action files.
    *   The complete database schema is defined in `db/schema.sql`. You can use this file to manually inspect or set up the database if needed (e.g., with a tool like DB Browser for SQLite).

6.  **Web Server Configuration (Basic):**
    *   Set your web server's document root to the `public/` directory of the project. This is crucial for security and proper operation, as it ensures that files outside `public/` (like `app/` or `db/`) are not directly accessible via the web.
    *   **Apache Example (conceptual virtual host):**
        ```apache
        <VirtualHost *:80>
            ServerName your-local-domain.com # e.g., photomanager.local
            DocumentRoot /path/to/your/project/public

            <Directory /path/to/your/project/public>
                Options Indexes FollowSymLinks
                AllowOverride All
                Require all granted
                # If using a front controller pattern in the future (e.g., for routing):
                # FallbackResource /index.php 
            </Directory>

            ErrorLog ${APACHE_LOG_DIR}/your-project-error.log
            CustomLog ${APACHE_LOG_DIR}/your-project-access.log combined
        </VirtualHost>
        ```
        Remember to enable the virtual host (e.g., `sudo a2ensite your-project.conf`) and restart Apache. You might also need to update your local `hosts` file for `your-local-domain.com`.

## Running the Application

Once set up, access the application by navigating to the configured URL in your web browser (e.g., `http://your-local-domain.com` or `http://localhost/your_project_path/public/` if not using a virtual host).

## Key Technologies Used

*   **PHP:** Server-side scripting language.
*   **SQLite:** File-based relational database.
*   **Bootstrap 5:** Frontend CSS framework for UI components and responsiveness.
*   **FullCalendar:** JavaScript library for the interactive booking calendar.
*   **Google Calendar API Client Library for PHP:** For Google Calendar integration.
*   **Composer:** PHP dependency manager.

## Theme System Overview

The application includes a flexible theme system:
*   **Light/Dark Mode:** Users can switch between light and dark visual modes.
*   **Color Themes:** A selection of 9 pre-defined color themes (e.g., Ocean Blue, Sanguine, Luscious Lime) can be chosen to customize the primary application color.
These settings are available in the "Profile Settings" page and are applied dynamically using CSS variables. The core theme files are:
*   `public/assets/css/base_theme.css`: Base styles and light mode variables.
*   `public/assets/css/dark_mode.css`: Overrides for dark mode.
*   `public/assets/css/color_themes.css`: Specific color variable overrides for each theme.

## Google Calendar Integration Setup Notes

*   **Enable Google Calendar API:** Ensure the "Google Calendar API" is enabled for your project in the Google Cloud Platform (GCP) Console.
*   **OAuth Consent Screen:** Configure the OAuth consent screen in GCP, specifying scopes and authorized domains. For testing, you might need to add test users if your app is in "testing" mode.
*   **Authorized Redirect URIs:** Double-check that the `GOOGLE_REDIRECT_URI` set in your `app/config.php` is **exactly** listed under the "Authorized redirect URIs" for your OAuth 2.0 Client ID in the GCP Console. Mismatches will cause redirect errors.
*   **Scopes:** The application currently requests `https://www.googleapis.com/auth/calendar`. Ensure this scope (or more granular ones like `calendar.events` and `calendar.readonly` if preferred) is appropriate and configured.

## Deployment Advice (High-Level)

*   **Security:**
    *   Ensure `app/config.php` (containing API keys) is **not** publicly accessible and is excluded from version control if it holds real credentials.
    *   Protect the `db/` directory and the SQLite database file from direct web access (this is typically handled by setting the document root to `public/`).
    *   Keep file permissions restrictive.
*   **HTTPS:** Use HTTPS in a production environment to secure all data in transit, especially OAuth tokens.
*   **Error Reporting:** Configure PHP error reporting appropriately for production (e.g., log errors to a file, don't display them to users).
*   **Database Backups:** Implement a strategy for backing up your SQLite database.

---
This README provides a comprehensive guide to understanding, setting up, and running the Photography Work Management Web Application.
```
