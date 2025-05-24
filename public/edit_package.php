<?php
require_once '../app/actions/package_actions.php';

$package_id = $_GET['id'] ?? null;
$package = null;
$error_message = '';

if (!$package_id || !is_numeric($package_id)) {
    $error_message = '<div class="alert alert-danger" role="alert">Invalid package ID.</div>';
} else {
    $db = get_db_connection();
    if (!$db) {
        die("Database connection failed. Please check your configuration.");
    }
    ensure_packages_table_exists($db); // Though actions file does this, good for standalone access
    $package = get_package_by_id($db, (int)$package_id);
    if (!$package) {
        $error_message = '<div class="alert alert-warning" role="alert">Package not found.</div>';
    }
}

if (isset($_GET['error'])) {
    if ($_GET['error'] === 'missing_fields') {
        $error_message .= '<div class="alert alert-danger" role="alert">Please fill in all required fields (Name, Price).</div>';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Package</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Edit Photography Package</h1>

        <?php echo $error_message; ?>

        <?php if ($package): ?>
        <form action="edit_package_handler.php" method="POST">
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($package['id']); ?>">
            
            <div class="mb-3">
                <label for="name" class="form-label">Package Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="name" name="name" value="<?php echo htmlspecialchars($package['name']); ?>" required>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" name="description" rows="3"><?php echo htmlspecialchars($package['description']); ?></textarea>
            </div>
            <div class="mb-3">
                <label for="price" class="form-label">Price <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="price" name="price" step="0.01" value="<?php echo htmlspecialchars($package['price']); ?>" required>
            </div>
            <div class="mb-3">
                <label for="services_included" class="form-label">Services Included</label>
                <textarea class="form-control" id="services_included" name="services_included" rows="3"><?php echo htmlspecialchars($package['services_included']); ?></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Update Package</button>
            <a href="packages.php" class="btn btn-secondary">Cancel</a>
        </form>
        <?php elseif (!$error_message): // Only show if no other error has been set by ID check ?>
            <div class="alert alert-info">Loading package data or package not found.</div>
        <?php endif; ?>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
