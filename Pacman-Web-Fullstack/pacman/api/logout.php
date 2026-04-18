<?php
// api/logout.php (最终版 - 带重定向)

// 1. 启动session才能访问并销毁它
session_start();

// 2. 清空所有session变量
$_SESSION = array();

// 3. 如果使用session cookie，则删除它 (最佳实践)
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 4. 最终销毁session
session_destroy();

// 5. **核心改动：执行服务器端重定向**
// header() 函数发送一个原始的HTTP头。
// 'Location:' 头会告诉浏览器立即跳转到指定的URL。
// 我们要跳转回项目的根目录下的 index.php
header('Location: ../index.php');

// 6. 退出脚本，确保重定向后不再执行任何代码
exit();

?>