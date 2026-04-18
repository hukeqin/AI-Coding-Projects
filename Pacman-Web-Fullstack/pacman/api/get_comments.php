<?php
// api/get_comments.php
require_once '../config/database.php';
header('Content-Type: application/json');

// 获取最新的20条评论
$sql = "SELECT name as username, message FROM contact_messages ORDER BY submitted_at DESC LIMIT 20";
$result = $conn->query($sql);

$comments = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $comments[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $comments]);
$conn->close();
?>