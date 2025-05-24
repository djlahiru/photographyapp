<?php
require_once '../app/actions/client_actions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');

    // Basic validation
    if (empty($id) || !is_numeric($id)) {
        header("Location: clients.php?status=invalid_id");
        exit;
    }
    if (empty($name)) {
        header("Location: edit_client.php?id=" . urlencode($id) . "&error=missing_fields");
        exit;
    }
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: edit_client.php?id=" . urlencode($id) . "&error=invalid_email");
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        header("Location: clients.php?status=edit_error"); // Generic error
        exit;
    }
    ensure_clients_table_exists($db);

    $success = update_client($db, (int)$id, $name, $email, $phone, $address);

    if ($success) {
        header("Location: clients.php?status=edit_success");
        exit;
    } else {
        // A more robust way would be for update_client to return a specific error code.
        // We'll check for email existence as a common cause for update failure.
        // This requires client_actions.php's update_client to return false on UNIQUE constraint violation.
        $existingClient = null;
        if (!empty($email)) {
            $stmt = $db->prepare("SELECT id FROM clients WHERE email = :email AND id != :id");
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $existingClient = $stmt->fetch();
        }

        if ($existingClient) {
             header("Location: edit_client.php?id=" . urlencode($id) . "&error=email_exists");
        } else {
             header("Location: edit_client.php?id=" . urlencode($id) . "&error=update_failed");
        }
        exit;
    }
} else {
    // Not a POST request
    header("Location: clients.php");
    exit;
}
?>
