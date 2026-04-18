<?php
// api/get_level_data.php

// 引入数据库连接配置
require_once '../config/database.php';

// 设置响应头为JSON格式
header('Content-Type: application/json');

// --- 1. 验证请求方法和参数 ---

// 只接受GET请求
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit();
}

// 使用filter_input安全地获取并验证'level'参数
$level_number = filter_input(INPUT_GET, 'level', FILTER_VALIDATE_INT);

// 检查level参数是否是有效的正整数
if ($level_number === false || $level_number <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'A valid level number is required. e.g., ?level=1']);
    exit();
}

// --- 2. 准备并执行SQL查询 ---

// 使用预处理语句来防止SQL注入
// 我们查询了game_levels表中我们设计的所有字段
$stmt = $conn->prepare("
    SELECT 
        level_number, level_name, map_layout, initial_hp, pacman_speed, 
        evade_cooldown, ghost_hp, ghost_speed, elite_ghost_hp, 
        elite_ghost_speed, combo_to_ultimate, buff_spawn_interval, 
        heal_buff_amount, heal_buff_penalty_duration, 
        heal_buff_penalty_cooldown_increase, skill_buff_penalty_duration, 
        skill_buff_penalty_hp_multiplier, anbi_ultimate_range, 
        billy_ultimate_radius, billy_ultimate_kill_delay, 
        nicole_ultimate_range, nicole_ultimate_stun_duration
    FROM 
        game_levels 
    WHERE 
        level_number = ?
");

// 绑定参数
$stmt->bind_param("i", $level_number);

// 执行查询
$stmt->execute();

// 获取结果
$result = $stmt->get_result();

// --- 3. 处理查询结果并返回 ---

if ($result->num_rows === 1) {
    // 成功找到关卡，获取数据
    $level_data = $result->fetch_assoc();

    // 成功响应
    http_response_code(200);
    echo json_encode(['success' => true, 'data' => $level_data]);
} else {
    // 未找到指定关卡
    http_response_code(404); // Not Found
    echo json_encode(['success' => false, 'message' => 'Level ' . $level_number . ' not found.']);
}

// --- 4. 清理资源 ---
$stmt->close();
$conn->close();

?>