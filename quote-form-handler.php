<?php
declare(strict_types=1);

function redirect_with_error(array $fields): void {
    $field_list = implode(',', $fields);
    header('Location: /#contact?form=error&fields=' . urlencode($field_list));
    exit;
}

function redirect_success(): void {
    header('Location: /#contact?form=success');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /#contact');
    exit;
}

$recipient_email = 'you@yourdomain.com'; // CHANGE THIS
$site_name = 'Integrity Diesel Truck & Auto Repair';

$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    header('Location: /#contact');
    exit;
}

$name = trim($_POST['name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$city = trim($_POST['city'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');
$form_source = trim($_POST['form_source'] ?? 'website-contact-form');

$errors = [];

if (mb_strlen($name) < 2) {
    $errors[] = 'name';
}

$phone_digits = preg_replace('/\D+/', '', $phone);
if (strlen($phone_digits) < 10) {
    $errors[] = 'phone';
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}

if (mb_strlen($city) < 2) {
    $errors[] = 'city';
}

if ($service === '') {
    $errors[] = 'service';
}

if (mb_strlen($message) < 10) {
    $errors[] = 'message';
}

if (!empty($errors)) {
    redirect_with_error($errors);
}

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$from_domain = preg_replace('/^www\./', '', $host);

$subject = 'New Quote Request - Integrity Diesel';
$email_body = "New website quote request\n\n";
$email_body .= "Name: {$name}\n";
$email_body .= "Phone: {$phone}\n";
$email_body .= "Email: " . ($email !== '' ? $email : 'Not provided') . "\n";
$email_body .= "City / Area: {$city}\n";
$email_body .= "Service Needed: {$service}\n";
$email_body .= "Form Source: {$form_source}\n\n";
$email_body .= "Problem Description:\n{$message}\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . $site_name . ' <no-reply@' . $from_domain . '>';

if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
} else {
    $headers[] = 'Reply-To: ' . $site_name . ' <no-reply@' . $from_domain . '>';
}

$sent = mail($recipient_email, $subject, $email_body, implode("\r\n", $headers));

if ($sent) {
    redirect_success();
}

redirect_with_error(['name']);