<?php
require_once '../app/actions/package_actions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? '';
    $services_included = $_POST['services_included'] ?? '';

    // Basic validation
    if (empty($name) || !is_numeric($price) || (float)$price < 0) {
        header("Location: add_package.php?error=missing_fields");
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        // Log this error properly in a real app
        header("Location: packages.php?status=add_error"); // Generic error
        exit;
    }
    ensure_packages_table_exists($db);


    $success = create_package($db, $name, $description, (float)$price, $services_included);

    if ($success) {
        header("Location: packages.php?status=add_success");
        exit;
    } else {
        header("Location: packages.php?status=add_error");
        exit;
    }
} else {
    // Not a POST request, redirect to the packages page or show an error
    header("Location: packages.php");
    exit;
}
?>
