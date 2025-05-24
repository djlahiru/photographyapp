<?php
require_once '../app/actions/client_actions.php';

$db_page_specific = get_db_connection(); 
if (!$db_page_specific) {
    die("Database connection failed for clients page.");
}
// The ensure_... functions in client_actions.php already handle dependencies like bookings/payments for financial summaries
ensure_clients_table_exists($db_page_specific); 
$clients = get_all_clients($db_page_specific);

$status_message_clients = ''; 
$message_type_clients = 'info';

if (isset($_GET['status_msg'])) { // Changed from 'status'
    switch ($_GET['status_msg']) {
        case 'add_success':
            $status_message_clients = 'Client added successfully!';
            $message_type_clients = 'success';
            break;
        case 'add_error':
            $status_message_clients = 'Error adding client.';
            $message_type_clients = 'danger';
            break;
        case 'email_exists':
            $status_message_clients = 'Error: Email already exists for another client.';
            $message_type_clients = 'danger';
            break;
        case 'edit_success':
            $status_message_clients = 'Client updated successfully!';
            $message_type_clients = 'success';
            break;
        case 'edit_error':
            $status_message_clients = 'Error updating client.';
            $message_type_clients = 'danger';
            break;
        case 'delete_success':
            $status_message_clients = 'Client deleted successfully!';
            $message_type_clients = 'success';
            break;
        case 'delete_error':
            $status_message_clients = 'Error deleting client.';
            $message_type_clients = 'danger';
            break;
        case 'invalid_id':
             $status_message_clients = 'Invalid client ID specified.';
             $message_type_clients = 'danger';
            break;
        case 'not_found':
             $status_message_clients = 'Client not found.';
             $message_type_clients = 'warning';
            break;
    }
}

require_once 'layout_header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Client Management</h1>
        <a href="add_client.php" class="btn btn-primary"><i class="bi bi-person-plus-fill me-2"></i>Add New Client</a>
    </div>

    <?php if (!empty($status_message_clients)): ?>
        <div class="alert alert-<?php echo $message_type_clients; ?>" role="alert">
            <?php echo htmlspecialchars($status_message_clients); ?>
        </div>
    <?php endif; ?>

    <div class="card">
        <div class="card-header">
            All Clients
        </div>
        <div class="card-body">
            <?php if (empty($clients)): ?>
                <p class="text-center">No clients found. <a href="add_client.php">Add one now!</a></p>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Total Booking Value</th>
                                <th>Total Payments Made</th>
                                <th>Outstanding Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($clients as $client): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($client['name']); ?></td>
                                    <td><?php echo htmlspecialchars($client['email'] ?? 'N/A'); ?></td>
                                    <td><?php echo htmlspecialchars($client['phone'] ?? 'N/A'); ?></td>
                                    <td>$<?php echo htmlspecialchars(number_format((float)($client['total_booking_value'] ?? 0), 2)); ?></td>
                                    <td>$<?php echo htmlspecialchars(number_format((float)($client['total_payments_made'] ?? 0), 2)); ?></td>
                                    <td>$<?php echo htmlspecialchars(number_format((float)($client['outstanding_balance'] ?? 0), 2)); ?></td>
                                    <td>
                                        <a href="edit_client.php?id=<?php echo $client['id']; ?>" class="btn btn-sm btn-warning mb-1 me-1"><i class="bi bi-pencil-square"></i> Edit</a>
                                        <a href="delete_client_handler.php?id=<?php echo $client['id']; ?>" class="btn btn-sm btn-danger mb-1" onclick="return confirm('Are you sure you want to delete this client? This will also delete all associated bookings and their payments.');"><i class="bi bi-trash-fill"></i> Delete</a>
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
