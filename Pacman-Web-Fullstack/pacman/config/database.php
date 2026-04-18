<?php
// config/database.php

// --- 数据库配置 ---
// 这些是你的本地XAMPP环境的默认配置。
// 如果你修改了MySQL的端口、用户名或密码，请在这里更新。
$host = 'localhost';        // 数据库主机
$port = '3306';             // 你的MySQL端口，根据你的XAMPP配置
$db_name = 'pacman_db';     // 我们刚刚创建的数据库名称
$username = 'root';         // 默认用户名
$password = '';             // 默认密码为空

// --- 创建数据库连接 ---
// 我们将使用mysqli，这是PHP推荐的与MySQL交互的方式。

// 尝试建立连接
$conn = new mysqli($host, $username, $password, $db_name, $port);

// --- 检查连接是否成功 ---
// 这是非常重要的一步。如果连接失败，程序应该立即停止并报告错误。
if ($conn->connect_error) {
    // die() 函数会输出一条消息，并退出当前脚本。
    // 这可以防止在数据库连接失败时，向用户暴露后续代码可能产生的更复杂的错误信息。
    header('Content-Type: application/json'); // 确保返回的是JSON格式
    http_response_code(500); // 设置HTTP状态码为500，表示服务器内部错误
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    die();
}

// 设置字符集为utf8mb4，以确保数据传输过程中编码一致
$conn->set_charset("utf8mb4");

// 如果代码能执行到这里，说明$conn变量已经是一个有效的数据库连接对象了。
// 其他API文件将可以引入这个文件并直接使用$conn。
?>
