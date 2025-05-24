<?php
$error_message = '';
if (isset($_GET['error'])) {
    if ($_GET['error'] === 'missing_fields') {
        $error_message = '<div class="alert alert-danger" role="alert">Please fill in all required fields (Name, Price).</div>';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add New Package</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Add New Photography Package</h1>

        <?php echo $error_message; ?>

        <form action="add_package_handler.php" method="POST">
            <div class="mb-3">
                <label for="name" class="form-label">Package Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="name" name="name" required>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" name="description" rows="3"></textarea>
            </div>
            <div class="mb-3">
                <label for="price" class="form-label">Price <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="price" name="price" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="services_included" class="form-label">Services Included</label>
                <textarea class="form-control" id="services_included" name="services_included" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Save Package</button>
            <a href="packages.php" class="btn btn-secondary">Cancel</a>
        </form>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
