<?php
require_once '../app/actions/package_actions.php';
// layout_header.php is included after initial PHP logic for the page
// to ensure $page_title and other variables in layout_header can be set by this page if needed.
// However, for this structure, we'll include it before this page's specific output.

$db_page_specific = get_db_connection(); // Use a different var name to avoid conflict with $db_layout in header
if (!$db_page_specific) {
    // If DB connection fails here, layout_header might have already tried and failed.
    // Consider a more robust way to handle this, but for now:
    die("Database connection failed for packages page. Please check your configuration.");
}
ensure_packages_table_exists($db_page_specific);
$packages = get_all_packages($db_page_specific);

$status_message_packages = ''; // Use a specific var name to avoid conflict
$message_type_packages = 'info';

if (isset($_GET['status_msg'])) { // Changed from 'status'
    switch ($_GET['status_msg']) {
        case 'add_success':
            $status_message_packages = 'Package added successfully!';
            $message_type_packages = 'success';
            break;
        case 'add_error':
            $status_message_packages = 'Error adding package.';
            $message_type_packages = 'danger';
            break;
        case 'edit_success':
            $status_message_packages = 'Package updated successfully!';
            $message_type_packages = 'success';
            break;
        case 'edit_error':
            $status_message_packages = 'Error updating package.';
            $message_type_packages = 'danger';
            break;
        case 'delete_success':
            $status_message_packages = 'Package deleted successfully!';
            $message_type_packages = 'success';
            break;
        case 'delete_error':
            $status_message_packages = 'Error deleting package.';
            $message_type_packages = 'danger';
            break;
    }
}

// Now include the header, which sets up HTML structure and applies theme
require_once 'layout_header.php'; 
?>

<div class="container-fluid"> {/* This container might be redundant if app-container in header is sufficient */}
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Photography Packages</h1>
        <a href="add_package.php" class="btn btn-primary"><i class="bi bi-plus-circle-fill me-2"></i>Add New Package</a>
    </div>
    
    <?php if (!empty($status_message_packages)): ?>
        <div class="alert alert-<?php echo $message_type_packages; ?>" role="alert">
            <?php echo htmlspecialchars($status_message_packages); ?>
        </div>
    <?php endif; ?>

    <div class="card">
        <div class="card-header">
            All Packages
        </div>
        <div class="card-body">
            <?php if (empty($packages)): ?>
                <p class="text-center">No packages found. <a href="add_package.php">Add one now!</a></p>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Services Included</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($packages as $package): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($package['name']); ?></td>
                                    <td><?php echo nl2br(htmlspecialchars($package['description'])); ?></td>
                                    <td>$<?php echo htmlspecialchars(number_format($package['price'], 2)); ?></td>
                                    <td><?php echo nl2br(htmlspecialchars($package['services_included'])); ?></td>
                                    <td>
                                        <a href="edit_package.php?id=<?php echo $package['id']; ?>" class="btn btn-sm btn-warning mb-1 me-1"><i class="bi bi-pencil-square"></i> Edit</a>
                                        <a href="delete_package_handler.php?id=<?php echo $package['id']; ?>" class="btn btn-sm btn-danger mb-1" onclick="return confirm('Are you sure you want to delete this package?');"><i class="bi bi-trash-fill"></i> Delete</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php
require_once 'layout_footer.php';
?>
