<?php
require_once '../app/actions/package_actions.php';

$package_id = $_GET['id'] ?? null;
$package = null;
$error_message_edit_pkg = ''; // Use a specific var name
$message_type_edit_pkg = 'danger';


if (!$package_id || !is_numeric($package_id)) {
    // If ID is invalid, we can't load data. It's better to redirect or show a fatal error.
    // For now, layout_header will load, and then we'll show an error message within the page content area.
    $error_message_edit_pkg = 'Invalid package ID specified. Cannot load package data.';
} else {
    $db_page_specific = get_db_connection();
    if (!$db_page_specific) {
        die("Database connection failed for edit package page.");
    }
    ensure_packages_table_exists($db_page_specific);
    $package = get_package_by_id($db_page_specific, (int)$package_id);
    if (!$package) {
        $error_message_edit_pkg = 'Package not found with ID ' . htmlspecialchars($package_id) . '.';
    }
}

// Handle other error messages passed via GET params
$error_type_edit_pkg = $_GET['error_type'] ?? '';
if ($error_type_edit_pkg === 'missing_fields') {
    $error_message_edit_pkg .= (empty($error_message_edit_pkg) ? '' : ' ') . 'Please fill in all required fields (Name, Price).';
} elseif ($error_type_edit_pkg === 'update_failed') {
     $error_message_edit_pkg .= (empty($error_message_edit_pkg) ? '' : ' ') . 'Failed to update package. Please try again.';
}


require_once 'layout_header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Edit Photography Package</h1>
        <a href="packages.php" class="btn btn-outline-secondary">
             <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to Packages
        </a>
    </div>

    <?php if (!empty($error_message_edit_pkg)): ?>
        <div class="alert alert-<?php echo $message_type_edit_pkg; ?>" role="alert">
            <?php echo htmlspecialchars($error_message_edit_pkg); ?>
        </div>
    <?php endif; ?>

    <?php if ($package): ?>
    <div class="card">
        <div class="card-header">
            Editing Package: <?php echo htmlspecialchars($package['name']); ?>
        </div>
        <div class="card-body">
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
                    <label for="services_included" class="form-label">Services Included (comma-separated or one per line)</label>
                    <textarea class="form-control" id="services_included" name="services_included" rows="3"><?php echo htmlspecialchars($package['services_included']); ?></textarea>
                </div>
                <button type="submit" class="btn btn-success"><i class="bi bi-check-circle-fill me-2"></i>Update Package</button>
                <a href="packages.php" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
    <?php elseif (empty($error_message_edit_pkg)): // Only show if no other error has been set by ID check ?>
        <div class="alert alert-info">Loading package data... If this message persists, the package may not exist or there's an issue.</div>
    <?php endif; ?>
</div>

<?php
require_once 'layout_footer.php';
?>
