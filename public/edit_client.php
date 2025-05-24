<?php
require_once '../app/actions/client_actions.php';

$client_id = $_GET['id'] ?? null;
$client = null;
$error_message = '';
$error_type = $_GET['error'] ?? '';


if (!$client_id || !is_numeric($client_id)) {
    // Redirect to clients page if ID is invalid, with a status message
    header("Location: clients.php?status=invalid_id");
    exit;
}

$db = get_db_connection();
if (!$db) {
    // This is a critical error, might be better to show a generic error page or log
    die("Database connection failed. Please check your configuration.");
}
ensure_clients_table_exists($db); 
$client = get_client_by_id($db, (int)$client_id);

if (!$client) {
    // Redirect if client not found, as form cannot be populated
    header("Location: clients.php?status=not_found&id=" . htmlspecialchars($client_id));
    exit;
}

// Error messages for this page, after client is confirmed to exist
if ($error_type === 'missing_fields') {
    $error_message = '<div class="alert alert-danger" role="alert">Please fill in all required fields (Name). Email must be a valid format if provided.</div>';
} elseif ($error_type === 'invalid_email') {
    $error_message = '<div class="alert alert-danger" role="alert">Invalid email format.</div>';
} elseif ($error_type === 'update_failed') {
    $error_message = '<div class="alert alert-danger" role="alert">Failed to update client. Please try again.</div>';
} elseif ($error_type === 'email_exists') {
     $error_message = '<div class="alert alert-danger" role="alert">Error: Email already exists for another client.</div>';
}


?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Client</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Edit Client</h1>

        <?php echo $error_message; ?>

        <?php if ($client): // This check is somewhat redundant due to redirection above, but good practice ?>
        <form action="edit_client_handler.php" method="POST">
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($client['id']); ?>">
            
            <div class="mb-3">
                <label for="name" class="form-label">Client Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="name" name="name" value="<?php echo htmlspecialchars($client['name']); ?>" required>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" value="<?php echo htmlspecialchars($client['email']); ?>">
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">Phone</label>
                <input type="tel" class="form-control" id="phone" name="phone" value="<?php echo htmlspecialchars($client['phone']); ?>">
            </div>
            <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <textarea class="form-control" id="address" name="address" rows="3"><?php echo htmlspecialchars($client['address']); ?></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Update Client</button>
            <a href="clients.php" class="btn btn-secondary">Cancel</a>
        </form>
        <?php endif; ?>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
