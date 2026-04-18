<?php
// api/get_leaderboard.php (升级版)

require_once '../config/database.php';
header('Content-Type: application/json');

// --- 1. 获取前端传来的时间范围参数 ---
// 例如: get_leaderboard.php?range=daily
// 我们给一个默认值 'alltime'
$range = $_GET['range'] ?? 'alltime';

// --- 2. 根据参数构建不同的SQL WHERE子句 ---
$whereClause = "";
switch ($range) {
    case 'daily':
        // CURDATE() 获取今天的日期, INTERVAL 1 DAY 是指一天之内
        $whereClause = "WHERE s.played_at >= CURDATE() AND s.played_at < CURDATE() + INTERVAL 1 DAY";
        break;
    case 'weekly':
        // DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 获取本周的星期一
        $whereClause = "WHERE s.played_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";
        break;
    case 'alltime':
    default:
        // 总排行不需要任何时间限制
        $whereClause = "";
        break;
}

// --- 3. 构建完整的SQL查询语句 ---
// 我们将 $whereClause 变量动态地插入到SQL语句中
// LIMIT 10 限制只取前10名
$sql = "SELECT 
            u.username, 
            s.score, 
            s.level_reached,
            s.played_at
        FROM 
            scores s
        JOIN 
            users u ON s.user_id = u.id
        {$whereClause}
        ORDER BY 
            s.score DESC
        LIMIT 10";

// --- 4. 执行查询并返回结果 (这部分逻辑保持不变) ---
$result = $conn->query($sql);

if ($result) {
    $leaderboard = [];
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $leaderboard]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to retrieve leaderboard.', 'error' => $conn->error]);
}

$conn->close();
?>