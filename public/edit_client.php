<?php
require_once '../app/actions/client_actions.php';

$client_id = $_GET['id'] ?? null;
$client = null;
$error_message_edit_client = ''; // Use a specific var name
$message_type_edit_client = 'danger';


if (!$client_id || !is_numeric($client_id)) {
    // Redirect to clients page if ID is invalid, layout_header will not be included yet.
    // This ensures that if layout_header relies on $client, it won't fail.
    // However, since we're now including header first, we'll show error within page.
    $error_message_edit_client = 'Invalid client ID specified. Cannot load client data.';
} else {
    $db_page_specific = get_db_connection();
    if (!$db_page_specific) {
        die("Database connection failed for edit client page.");
    }
    ensure_clients_table_exists($db_page_specific); 
    $client = get_client_by_id($db_page_specific, (int)$client_id);
    if (!$client) {
        // Client not found after valid ID check, this error will be shown within layout.
        $error_message_edit_client = 'Client not found with ID ' . htmlspecialchars($client_id) . '.';
    }
}

// Handle other error messages passed via GET params
$error_type_edit_client = $_GET['error_type'] ?? '';
if ($error_type_edit_client === 'missing_fields') {
    $error_message_edit_client .= (empty($error_message_edit_client) ? '' : ' ') . 'Please fill in all required fields (Name).';
} elseif ($error_type_edit_client === 'invalid_email') {
    $error_message_edit_client .= (empty($error_message_edit_client) ? '' : ' ') . 'Invalid email format provided.';
} elseif ($error_type_edit_client === 'update_failed') {
    $error_message_edit_client .= (empty($error_message_edit_client) ? '' : ' ') . 'Failed to update client. Please try again.';
} elseif ($error_type_edit_client === 'email_exists') {
    $error_message_edit_client .= (empty($error_message_edit_client) ? '' : ' ') . 'This email address is already registered by another client.';
}

require_once 'layout_header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Edit Client</h1>
        <a href="clients.php" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to Clients
        </a>
    </div>

    <?php if (!empty($error_message_edit_client)): ?>
        <div class="alert alert-<?php echo $message_type_edit_client; ?>" role="alert">
            <?php echo htmlspecialchars($error_message_edit_client); ?>
        </div>
    <?php endif; ?>

    <?php if ($client): ?>
    <div class="card">
        <div class="card-header">
            Editing Client: <?php echo htmlspecialchars($client['name']); ?>
        </div>
        <div class="card-body">
            <form action="edit_client_handler.php" method="POST">
                <input type="hidden" name="id" value="<?php echo htmlspecialchars($client['id']); ?>">
                
                <div class="mb-3">
                    <label for="name" class="form-label">Client Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="name" name="name" value="<?php echo htmlspecialchars($client['name']); ?>" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email (Optional, must be unique if provided)</label>
                    <input type="email" class="form-control" id="email" name="email" value="<?php echo htmlspecialchars($client['email'] ?? ''); ?>">
                </div>
                <div class="mb-3">
                    <label for="phone" class="form-label">Phone (Optional)</label>
                    <input type="tel" class="form-control" id="phone" name="phone" value="<?php echo htmlspecialchars($client['phone'] ?? ''); ?>">
                </div>
                <div class="mb-3">
                    <label for="address" class="form-label">Address (Optional)</label>
                    <textarea class="form-control" id="address" name="address" rows="3"><?php echo htmlspecialchars($client['address'] ?? ''); ?></textarea>
                </div>
                <button type="submit" class="btn btn-success"><i class="bi bi-check-circle-fill me-2"></i>Update Client</button>
                <a href="clients.php" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
    <?php elseif (empty($error_message_edit_client)): // Only show if no other error has been set by ID check ?>
        <div class="alert alert-info">Loading client data... If this message persists, the client may not exist or there's an issue.</div>
    <?php endif; ?>
</div>

<?php
require_once 'layout_footer.php';
?>
