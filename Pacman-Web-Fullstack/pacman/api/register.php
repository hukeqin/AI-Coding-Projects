<?php
// api/register.php

// ------------------- (1) 引入和初始化 -------------------

// 引入我们的数据库连接脚本
// 使用 require_once 确保脚本只被引入一次，如果找不到文件会产生致命错误
require_once '../config/database.php';

// 设置HTTP Header，告诉客户端我们返回的是JSON格式
header('Content-Type: application/json');

// 检查请求方法是否为POST。注册操作应该是POST请求，因为它会创建新数据。
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // 405 Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit();
}

// ------------------- (2) 获取和清理输入 -------------------

// 从POST请求中获取JSON数据
$input = json_decode(file_get_contents('php://input'), true);

// trim() 用于移除字符串两端的空白字符
$username = trim($input['username'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// ------------------- (3) 服务器端验证 -------------------

$errors = [];

// 验证用户名
if (empty($username)) {
    $errors['username'] = 'Username is required.';
} elseif (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
    $errors['username'] = 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.';
}

// 验证邮箱
if (empty($email)) {
    $errors['email'] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}

// 验证密码
if (empty($password)) {
    $errors['password'] = 'Password is required.';
} elseif (strlen($password) < 8) {
    $errors['password'] = 'Password must be at least 8 characters long.';
}
// 这是一个更复杂的密码策略，可选，但推荐
// elseif (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password)) {
//     $errors['password'] = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
// }

// 如果有任何验证错误，则返回错误信息
if (!empty($errors)) {
    http_response_code(400); // 400 Bad Request
    echo json_encode(['success' => false, 'message' => 'Validation failed.', 'errors' => $errors]);
    exit();
}

// ------------------- (4) 检查用户或邮箱是否已存在 -------------------

// 使用预处理语句防止SQL注入
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // 这里可以更详细地判断是用户名还是邮箱重复，但为了简单起见，我们先返回一个通用消息
    $errors['general'] = 'Username or email already exists.';
    http_response_code(409); // 409 Conflict
    echo json_encode(['success' => false, 'message' => 'Registration failed.', 'errors' => $errors]);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();


// ------------------- (5) 哈希密码并插入数据库 -------------------

// 对密码进行哈希处理，这是存储密码的唯一安全方式！
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// 准备插入新用户的SQL语句
$stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $password_hash);

// 执行插入操作
if ($stmt->execute()) {
    // 注册成功
    http_response_code(201); // 201 Created
    echo json_encode(['success' => true, 'message' => 'Registration successful!']);
} else {
    // 插入失败（可能是数据库层面的意外错误）
    http_response_code(500); // 500 Internal Server Error
    echo json_encode(['success' => false, 'message' => 'An error occurred during registration. Please try again.']);
}

// ------------------- (6) 清理和关闭 -------------------
$stmt->close();
$conn->close();

?>
