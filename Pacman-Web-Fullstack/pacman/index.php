<?php
    // 启动session，这是所有用户状态判断的基础
    session_start();

    // 判断用户是否已登录
    $is_logged_in = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    $username = $is_logged_in ? $_SESSION['username'] : 'Guest';
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZZZ Pac-Man | 新艾利都</title>
    <!-- 引入主游戏CSS和登录表单CSS -->
    <link rel="stylesheet" href="css/game.css">
    <link rel="stylesheet" href="css/login-form.css"> 
    
</head>
<body>
    

<?php if ($is_logged_in): ?>

    <!-- ====================================================== -->
    <!--  已登录状态：显示游戏界面 (新布局)                      -->
    <!-- ====================================================== -->
    <div id="game-wrapper">
        <!-- 左侧边栏UI -->
        <aside class="game-sidebar" id="sidebar-left">
        <div class="ui-panel player-panel">
    <!-- ▼▼▼ 把 h3 标签也用一个容器包起来，方便布局 ▼▼▼ -->
    <div class="panel-header">
        <h3>代理人</h3>
        <!-- ▼▼▼ 这是新增的“退出登录”按钮 ▼▼▼ -->
        <a href="api/logout.php" id="logout-button" title="退出登录">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
        </a>
    </div>
    <div class="player-info">
        <span class="username"><?php echo htmlspecialchars($username); ?></span>
        <div class="hp-bar"><div id="hp-bar-fill" class="hp-bar-fill" style="width: 100%;"></div></div>
        <span id="hp-display" class="hp-text">100/100</span>
    </div>
</div>
            <div class="ui-panel characters-panel">
                <h3>队伍</h3>
                <div class="character-portraits">
    <div class="portrait active" data-char="anbi"><img src="images/anbi.png" alt="安比"><span class="char-key">1</span></div>
    <div class="portrait" data-char="billy"><img src="images/billy.png" alt="比利"><span class="char-key">2</span></div>
    <div class="portrait" data-char="nicole"><img src="images/nicole.png" alt="妮可"><span class="char-key">3</span></div>
            </div>
        </aside>

        <!-- 游戏主画面 (中间) -->
        <div id="game-main">
            <canvas id="gameCanvas"></canvas>
            <div id="game-overlay" class="hidden">
                <div id="overlay-content">
                    <h2 id="overlay-title">游戏暂停</h2>
                    <p id="overlay-message">按 'P' 键继续</p>
                    <button id="restart-button" class="hidden">重新开始</button>
                    <a href="home.php" class="back-to-home-button">返回主页</a>
                </div>
            </div>
        </div>

        <!-- 右侧边栏UI -->
        <aside class="game-sidebar" id="sidebar-right">
            <div class="ui-panel stats-panel">
                <h3>数据</h3>
                <div class="stats-grid">
                    <div>分数</div><div id="score-display">0</div>
                    <div>连击</div><div id="combo-display">0</div>
                    <div>关卡</div><div id="level-display">1</div>
                    <div>剩余时间</div><div id="timer-display">120</div>
                </div>
            </div>
            <div class="ui-panel skills-panel">
                <h3>支援</h3>
                <div class="skill-item"><span>极限爆发</span><div id="ultimate-charges" class="charges-container"></div></div>
                <div class="skill-item">
                    <span>闪避</span>
                    <!-- ▼▼▼ 我们将用一个简单的文本来显示闪避状态 ▼▼▼ -->
                    <span id="evade-status" class="skill-status ready">可用</span>
                </div>
                <!-- ▼▼▼ 新增：Buff显示区域 ▼▼▼ -->
                <div id="buff-display" class="buff-display-panel hidden">
                    <h4 id="buff-name">双倍积分</h4>
                    <p>剩余时间: <span id="buff-timer">10</span>s</p>
                    <div class="buff-bar"><div id="buff-bar-fill"></div></div>
                </div>
                <a href="#comment-section" class="panel-link">发表评论</a>

            </div>
            <div id="comment-section">
        <div class="comment-wrapper">
            <!-- 默认状态：显示滚动的评论 -->
            <div id="comment-display-box" class="comment-box active">
                <div id="comment-scroller">
                    <!-- 评论将由JS动态填充到这里 -->
                </div>
            </div>

            <!-- 点击后切换的状态：输入新评论 -->
            <form id="comment-input-box" class="comment-box">
                <textarea id="comment-input" placeholder="输入你的评论..." maxlength="140"></textarea>
                <div class="comment-footer">
                    <span id="char-counter">0 / 140</span>
                    <button type="submit" id="submit-comment-btn">发送</button>
                </div>
            </form>
        </div>
    </div>
        </aside>
    </div>
    <!-- 只有在登录状态下才加载游戏JS -->
    <script src="js/game.js" defer></script>
    <!-- 在你的主 <script src="js/game.js" defer></script> 下方添加 -->
    <script src="js/comments.js" defer></script>

<?php else: ?>

    <!-- ====================================================== -->
    <!--  未登录状态：显示登录/注册表单 (这部分被移动到了正确的位置) -->
    <!-- ====================================================== -->
    <div class="login-container">
        <div class="login-box">
            <div class="login-tabs">
                <button class="tab-link active" data-tab="login">登录</button>
                <button class="tab-link" data-tab="register">注册</button>
            </div>

            <!-- 登录表单 -->
            <form id="login-form" class="form-content active" data-form="login">
                <h2>代理人身份验证</h2>
                <input type="email" name="email" placeholder="邮箱" required>
                <input type="password" name="password" placeholder="密码" required>
                <button type="submit">进入新艾利都</button>
                <p class="form-message" id="login-message"></p>
            </form>

            <!-- 注册表单 -->
            <form id="register-form" class="form-content" data-form="register">
                <h2>成为绳匠</h2>
                <input type="text" name="username" placeholder="用户名 (3-20位, 字母/数字/_)" required>
                <input type="email" name="email" placeholder="邮箱" required>
                <input type="password" name="password" placeholder="密码 (至少8位)" required>
                <button type="submit">加入事务所</button>
                <p class="form-message" id="register-message"></p>
            </form>
            <a href="home.php" class="back-to-home-link">返回展示页</a>
        </div>
    </div>
    <!-- 只有在未登录状态下才加载表单处理JS -->
    <script src="js/auth.js" defer></script>

<?php endif; ?>


    


</body>
</html>