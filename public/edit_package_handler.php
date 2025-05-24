<?php
require_once '../app/actions/package_actions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? '';
    $services_included = $_POST['services_included'] ?? '';

    // Basic validation
    if (empty($id) || !is_numeric($id) || empty($name) || !is_numeric($price) || (float)$price < 0) {
        // It's better to redirect to the edit page with an error if ID is present
        $redirect_url = $id ? "edit_package.php?id=" . urlencode($id) . "&error=missing_fields" : "packages.php?status=edit_error";
        header("Location: " . $redirect_url);
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        header("Location: packages.php?status=edit_error");
        exit;
    }
    ensure_packages_table_exists($db);

    $success = update_package($db, (int)$id, $name, $description, (float)$price, $services_included);

    if ($success) {
        header("Location: packages.php?status=edit_success");
        exit;
    } else {
        // Redirect back to edit page with error if update failed for a specific package
        header("Location: edit_package.php?id=" . urlencode($id) . "&error=update_failed");
        exit;
    }
} else {
    header("Location: packages.php");
    exit;
}
?>
