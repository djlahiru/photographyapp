<?php
require_once '../app/actions/client_actions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');

    // Basic validation
    if (empty($name)) {
        header("Location: add_client.php?error=missing_fields&email=" . urlencode($email) . "&phone=" . urlencode($phone) . "&address=" . urlencode($address));
        exit;
    }
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: add_client.php?error=invalid_email&name=" . urlencode($name) . "&phone=" . urlencode($phone) . "&address=" . urlencode($address));
        exit;
    }

    $db = get_db_connection();
    if (!$db) {
        // Log this error properly in a real app
        header("Location: clients.php?status=add_error"); 
        exit;
    }
    ensure_clients_table_exists($db);

    $clientId = create_client($db, $name, $email, $phone, $address);

    if ($clientId) {
        header("Location: clients.php?status=add_success");
        exit;
    } else {
        // Check if error was due to email existing by trying to fetch a client with that email
        // This is a simplified check; client_actions.php logs the specific SQL error.
        // A more robust way would be for create_client to return a specific error code.
        $stmt = $db->prepare("SELECT id FROM clients WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        if ($stmt->fetch()) {
            header("Location: clients.php?status=email_exists");
        } else {
            header("Location: clients.php?status=add_error");
        }
        exit;
    }
} else {
    // Not a POST request
    header("Location: clients.php");
    exit;
}
?>
