<?php
// api/contact.php (修改版)

require_once '../config/database.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { /* ... */ }

$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? '匿名绳匠'); // 允许匿名
$message = trim($input['message'] ?? '');

// **核心修改：服务器端字数验证**
$char_limit = 140;
if (mb_strlen($message, 'UTF-8') === 0) {
    $errors['message'] = '评论不能为空。';
} elseif (mb_strlen($message, 'UTF-8') > $char_limit) {
    $errors['message'] = "评论不能超过 {$char_limit} 个字符。";
}

if (!empty($errors)) { /* ... 返回错误 ... */ }

// 插入数据库 (name, message)
$stmt = $conn->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");
$anonymous_email = 'anonymous@example.com'; // 因为name可以匿名，email字段也给个默认值
$stmt->bind_param("sss", $name, $anonymous_email, $message);

if ($stmt->execute()) {
    // **返回新提交的这条评论，以便前端立刻显示**
    $new_comment = ['username' => $name, 'message' => $message];
    echo json_encode(['success' => true, 'message' => '评论成功！', 'data' => $new_comment]);
} else { /* ... 返回失败 ... */ }
?>