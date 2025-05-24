<?php
// No specific database actions needed on this page load, only form display.
// Settings and theme are handled by layout_header.php.

$error_message_add_pkg = '';
$error_type_add_pkg = $_GET['error_type'] ?? ''; // Use a specific error type variable

if ($error_type_add_pkg === 'missing_fields') {
    $error_message_add_pkg = 'Please fill in all required fields (Name, Price).';
} elseif ($error_type_add_pkg === 'save_failed') {
    $error_message_add_pkg = 'There was an error saving the package. Please try again.';
}

// Retain form values if redirected due to an error
$name = $_GET['name'] ?? '';
$description = $_GET['description'] ?? '';
$price = $_GET['price'] ?? '';
$services_included = $_GET['services_included'] ?? '';

require_once 'layout_header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Add New Photography Package</h1>
        <a href="packages.php" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to Packages
        </a>
    </div>

    <?php if (!empty($error_message_add_pkg)): ?>
        <div class="alert alert-danger" role="alert">
            <?php echo htmlspecialchars($error_message_add_pkg); ?>
        </div>
    <?php endif; ?>

    <div class="card">
        <div class="card-header">
            Package Details
        </div>
        <div class="card-body">
            <form action="add_package_handler.php" method="POST">
                <div class="mb-3">
                    <label for="name" class="form-label">Package Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="name" name="name" value="<?php echo htmlspecialchars($name); ?>" required>
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" name="description" rows="3"><?php echo htmlspecialchars($description); ?></textarea>
                </div>
                <div class="mb-3">
                    <label for="price" class="form-label">Price <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="price" name="price" step="0.01" value="<?php echo htmlspecialchars($price); ?>" required>
                </div>
                <div class="mb-3">
                    <label for="services_included" class="form-label">Services Included (comma-separated or one per line)</label>
                    <textarea class="form-control" id="services_included" name="services_included" rows="3"><?php echo htmlspecialchars($services_included); ?></textarea>
                </div>
                <button type="submit" class="btn btn-success"><i class="bi bi-check-circle-fill me-2"></i>Save Package</button>
                <a href="packages.php" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
</div>

<?php
require_once 'layout_footer.php';
?>
