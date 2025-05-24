<?php
require_once '../app/actions/client_actions.php';

$db = get_db_connection();
if (!$db) {
    die("Database connection failed. Please check your configuration.");
}
ensure_clients_table_exists($db); // Ensure table is created if it doesn't exist

$clients = get_all_clients($db);

$status_message = '';
if (isset($_GET['status'])) {
    switch ($_GET['status']) {
        case 'add_success':
            $status_message = '<div class="alert alert-success" role="alert">Client added successfully!</div>';
            break;
        case 'add_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error adding client.</div>';
            break;
        case 'email_exists':
            $status_message = '<div class="alert alert-danger" role="alert">Error: Email already exists.</div>';
            break;
        case 'edit_success':
            $status_message = '<div class="alert alert-success" role="alert">Client updated successfully!</div>';
            break;
        case 'edit_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error updating client.</div>';
            break;
        case 'delete_success':
            $status_message = '<div class="alert alert-success" role="alert">Client deleted successfully!</div>';
            break;
        case 'delete_error':
            $status_message = '<div class="alert alert-danger" role="alert">Error deleting client.</div>';
            break;
        case 'invalid_id':
             $status_message = '<div class="alert alert-danger" role="alert">Invalid client ID specified.</div>';
            break;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Clients</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Client Management</h1>
        
        <?php echo $status_message; ?>

        <p><a href="add_client.php" class="btn btn-primary">Add New Client</a></p>

        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Total Payments</th>
                    <th>Outstanding Balance</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($clients)): ?>
                    <tr>
                        <td colspan="7">No clients found.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($clients as $client): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($client['name']); ?></td>
                            <td><?php echo htmlspecialchars($client['email']); ?></td>
                            <td><?php echo htmlspecialchars($client['phone']); ?></td>
                            <td><?php echo nl2br(htmlspecialchars($client['address'])); ?></td>
                            <td>$<?php echo htmlspecialchars(number_format($client['total_payments_made'], 2)); ?></td>
                            <td>$<?php echo htmlspecialchars(number_format($client['outstanding_balance'], 2)); ?></td>
                            <td>
                                <a href="edit_client.php?id=<?php echo $client['id']; ?>" class="btn btn-sm btn-warning">Edit</a>
                                <a href="delete_client_handler.php?id=<?php echo $client['id']; ?>" class="btn btn-sm btn-danger" onclick="return confirm('Are you sure you want to delete this client? This might also delete associated bookings and payments.');">Delete</a>
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
