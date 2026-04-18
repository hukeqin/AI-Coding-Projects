<?php
// api/login.php

// ------------------- (1) 引入和初始化 -------------------
require_once '../config/database.php';
header('Content-Type: application/json');

// 同样，登录也应该是POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit();
}

// ------------------- (2) 获取输入 -------------------
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

// ------------------- (3) 服务器端验证 -------------------
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit();
}

// ------------------- (4) 查找用户并验证密码 -------------------

// 使用预处理语句查找用户
$stmt = $conn->prepare("SELECT id, username, email, password_hash FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    // 找到了用户，现在获取用户信息
    $user = $result->fetch_assoc();

    // 验证密码是否匹配哈希值
    // password_verify() 是 password_hash() 的配对函数
    if (password_verify($password, $user['password_hash'])) {
        // 密码正确！登录成功！

        // 启动 session 来存储用户登录状态
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['logged_in'] = true;

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful!',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ]
        ]);

    } else {
        // 密码错误
        http_response_code(401); // 401 Unauthorized
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    }
} else {
    // 未找到用户
    http_response_code(401); // 同样返回401，不给攻击者提示是“用户不存在”还是“密码错误”
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
}

// ------------------- (5) 清理和关闭 -------------------
$stmt->close();
$conn->close();

?>