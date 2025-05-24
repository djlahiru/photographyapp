<?php
// No specific database actions needed on this page load, only form display.
// Settings and theme are handled by layout_header.php.

$error_message_add_client = ''; // Use a specific var name
$error_type_add_client = $_GET['error_type'] ?? '';

if ($error_type_add_client === 'missing_fields') {
    $error_message_add_client = 'Please fill in all required fields (Name).';
} elseif ($error_type_add_client === 'invalid_email') {
    $error_message_add_client = 'Invalid email format provided.';
} elseif ($error_type_add_client === 'save_failed') {
    $error_message_add_client = 'There was an error saving the client. Please try again.';
} elseif ($error_type_add_client === 'email_exists') { // From handler if create_client returns false due to email
    $error_message_add_client = 'This email address is already registered. Please use a different email.';
}


// Retain form values if redirected due to an error
$name = $_GET['name'] ?? '';
$email = $_GET['email'] ?? '';
$phone = $_GET['phone'] ?? '';
$address = $_GET['address'] ?? '';

require_once 'layout_header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Add New Client</h1>
        <a href="clients.php" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left-circle-fill me-2"></i>Back to Clients
        </a>
    </div>

    <?php if (!empty($error_message_add_client)): ?>
        <div class="alert alert-danger" role="alert">
            <?php echo htmlspecialchars($error_message_add_client); ?>
        </div>
    <?php endif; ?>

    <div class="card">
        <div class="card-header">
            Client Details
        </div>
        <div class="card-body">
            <form action="add_client_handler.php" method="POST">
                <div class="mb-3">
                    <label for="name" class="form-label">Client Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="name" name="name" value="<?php echo htmlspecialchars($name); ?>" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email (Optional, must be unique if provided)</label>
                    <input type="email" class="form-control" id="email" name="email" value="<?php echo htmlspecialchars($email); ?>">
                </div>
                <div class="mb-3">
                    <label for="phone" class="form-label">Phone (Optional)</label>
                    <input type="tel" class="form-control" id="phone" name="phone" value="<?php echo htmlspecialchars($phone); ?>">
                </div>
                <div class="mb-3">
                    <label for="address" class="form-label">Address (Optional)</label>
                    <textarea class="form-control" id="address" name="address" rows="3"><?php echo htmlspecialchars($address); ?></textarea>
                </div>
                <button type="submit" class="btn btn-success"><i class="bi bi-check-circle-fill me-2"></i>Save Client</button>
                <a href="clients.php" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
</div>

<?php
require_once 'layout_footer.php';
?>
