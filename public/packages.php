<?php
require_once '../app/actions/package_actions.php';

$db = get_db_connection();
if (!$db) {
    die("Database connection failed. Please check your configuration.");
}
ensure_packages_table_exists($db);

$packages = get_all_packages($db);

$status_message = '';
if (isset($_GET['status'])) {
    switch ($_GET['status']) {
        case 'add_success':
            $status_message = '<div class="alert alert-success" role="alert">Package added successfully!</div>';
            break;
        case 'add_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error adding package.</div>';
            break;
        case 'edit_success':
            $status_message = '<div class="alert alert-success" role="alert">Package updated successfully!</div>';
            break;
        case 'edit_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error updating package.</div>';
            break;
        case 'delete_success':
            $status_message = '<div class="alert alert-success" role="alert">Package deleted successfully!</div>';
            break;
        case 'delete_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error deleting package.</div>';
            break;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Packages</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Photography Packages</h1>
        
        <?php echo $status_message; ?>

        <p><a href="add_package.php" class="btn btn-primary">Add New Package</a></p>

        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Services Included</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($packages)): ?>
                    <tr>
                        <td colspan="5">No packages found.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($packages as $package): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($package['name']); ?></td>
                            <td><?php echo nl2br(htmlspecialchars($package['description'])); ?></td>
                            <td>$<?php echo htmlspecialchars(number_format($package['price'], 2)); ?></td>
                            <td><?php echo nl2br(htmlspecialchars($package['services_included'])); ?></td>
                            <td>
                                <a href="edit_package.php?id=<?php echo $package['id']; ?>" class="btn btn-sm btn-warning">Edit</a>
                                <a href="delete_package_handler.php?id=<?php echo $package['id']; ?>" class="btn btn-sm btn-danger" onclick="return confirm('Are you sure you want to delete this package?');">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
