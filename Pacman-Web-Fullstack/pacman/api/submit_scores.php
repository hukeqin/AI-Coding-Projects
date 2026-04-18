<?php
// api/submit-score.php

require_once '../config/database.php';
header('Content-Type: application/json');

// (1) 启动Session并检查登录状态
session_start();

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401); // 401 Unauthorized
    echo json_encode(['success' => false, 'message' => 'You must be logged in to submit a score.']);
    exit();
}

// (2) 检查请求方法并获取输入
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

// (3) 数据验证
// is_numeric检查是否为数字或数字字符串, (int)强制转换为整数
$score = isset($input['score']) && is_numeric($input['score']) ? (int)$input['score'] : null;
$level = isset($input['level']) && is_numeric($input['level']) ? (int)$input['level'] : null;

if ($score === null || $level === null || $score < 0 || $level <= 0) {
    http_response_code(400); // 400 Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid score or level data.']);
    exit();
}

// (4) 从Session中获取用户ID
$user_id = $_SESSION['user_id'];

// (5) 将分数插入数据库
// 使用预处理语句防止SQL注入
$stmt = $conn->prepare("INSERT INTO scores (user_id, score, level_reached) VALUES (?, ?, ?)");
$stmt->bind_param("iii", $user_id, $score, $level); // "i" 代表整数类型

if ($stmt->execute()) {
    http_response_code(201); // 201 Created
    echo json_encode(['success' => true, 'message' => 'Score submitted successfully!']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to submit score.']);
}

$stmt->close();
$conn->close();

?>