<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>绝区零 - 吃豆人同人游戏</title>
    <!-- CSS 引入 -->
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/characters.css">
    <link rel="stylesheet" href="css/game-intro.css">
    <link rel="stylesheet" href="css/ranking.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/zenless-theme.css">
</head>

<body>
    <!-- 霓虹扫描线效果 -->
    <div class="scan-overlay"></div>
    
    <!-- 粒子背景 -->
    <div id="particles-js"></div>
    
    <!-- 固定Logo -->
    <div class="fixed-logo" id="fixedLogo">
        <a href="https://zzz.mihoyo.com/" target="_blank" rel="noopener noreferrer">
            <img src="images/logo.png" alt="绝区零官方" class="logo-image">
        </a>
    </div>
    
    <!-- 顶部导航栏 -->
    <nav class="main-nav">
        <div class="nav-container">
            <div class="logo">
                <img src="assets/images/logo.png" alt="绝区零吃豆人" class="nav-logo">
            </div>
            <ul class="nav-menu" id="navMenu">
                <li><a href="#home" class="nav-link active">
                    <span>主页</span>
                    <span></span>
                </a></li>
                <li class="nav-dropdown">
                    <a href="#game-intro" class="nav-link">
                        <span>游戏背景</span>
                        <span></span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="#pacman-intro" class="dropdown-link">吃豆人简介</a></li>
                        <li><a href="#zenless-world" class="dropdown-link">绝区零世界观</a></li>
                        <li><a href="#gameplay" class="dropdown-link">游戏玩法</a></li>
                        <li><a href="#objectives" class="dropdown-link">核心目标</a></li>
                    </ul>
                </li>
                <li><a href="#characters" class="nav-link">
                    <span>角色选单</span>
                    <span></span>
                </a></li>
                <li><a href="#ranking" class="nav-link">
                    <span>挑战排行</span>
                    <span></span>
                </a></li>
            </ul>
            <button class="mobile-toggle" id="mobileToggle">☰</button>
        </div>
    </nav>

    <!-- 主页英雄区域 -->
    <header class="hero-section" id="home">
        <div class="hero-background">
            <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
            <div class="hero-title">
                <img src="images/title.png" alt="绝区零" class="game-title-image" id="gameTitleImage">
                <h2 class="game-subtitle">PACMAN CROSSOVER</h2>
                <p class="hero-description">在新艾利都的街头，体验前所未有的吃豆人冒险</p>
            </div>
        </div>
        <!-- 向下滚动提示 -->
        <div class="scroll-indicator">
            <div class="scroll-arrow"></div>
        </div>
    </header>

    <!-- 游戏背景介绍区域 -->
    <section id="game-intro" class="game-intro-section">
        <div class="container">
            <h2 class="section-title">游戏背景</h2>
            
            <!-- 子菜单导航 -->
            <div class="intro-nav">
                <button class="intro-btn active" data-tab="pacman-intro">
                    <span class="btn-text">吃豆人简介</span>
                    <span class="btn-glow"></span>
                </button>
                <button class="intro-btn" data-tab="zenless-world">
                    <span class="btn-text">绝区零世界观</span>
                    <span class="btn-glow"></span>
                </button>
                <button class="intro-btn" data-tab="gameplay">
                    <span class="btn-text">游戏玩法</span>
                    <span class="btn-glow"></span>
                </button>
                <button class="intro-btn" data-tab="objectives">
                    <span class="btn-text">核心目标</span>
                    <span class="btn-glow"></span>
                </button>
            </div>

            <!-- 内容面板 -->
            <div class="intro-content">
                <div class="intro-panel active" data-content="pacman-intro">
                    <div class="panel-grid">
                        <div class="panel-image">
                            <img src="images/pac_man.png" alt="吃豆人">
                        </div>
                        <div class="panel-text">
                            <h3>经典重现</h3>
                            <p>吃豆人（PAC-MAN）是1980年由南梦宫开发的经典街机游戏，玩家控制一个圆形角色在迷宫中收集豆子，同时躲避四个彩色幽灵。这款游戏以其简单而令人上瘾的玩法成为了游戏史上的经典之作。</p>
                            <p>在我们的绝区零版本中，经典的吃豆人机制与现代都市背景完美融合，为玩家带来全新的游戏体验。</p>
                        </div>
                    </div>
                </div>

                <div class="intro-panel" data-content="zenless-world">
                    <div class="panel-grid">
                        <div class="panel-image">
                            <img src="images/world_view.png" alt="绝区零世界观">
                        </div>
                        <div class="panel-text">
                            <h3>新艾利都的街头</h3>
                            <p>在新艾利都这座充满霓虹光芒的现代都市中，空洞现象改变了一切。作为绳匠事务所的一员，你需要在充满危险的空洞中收集重要资源，同时躲避来自以太的威胁。</p>
                            <p>城市的每个角落都隐藏着秘密，而你的任务就是在这个复杂的都市迷宫中生存下来，收集足够的以太结晶来拯救这座城市。</p>
                        </div>
                    </div>
                </div>

                <div class="intro-panel" data-content="gameplay">
                    <div class="panel-grid">
                        <div class="panel-image">
                            <img src="images/game_ui.png" alt="游戏玩法">
                        </div>
                        <div class="panel-text">
                            <h3>创新玩法</h3>
                            <p>结合经典吃豆人的核心机制与绝区零的都市设定，玩家将在3D渲染的新艾利都街道中进行冒险。使用WASD键控制角色移动，收集散落在街道上的以太结晶。</p>
                            <p>当收集到特殊的邦布道具时，你将获得临时的无敌状态，可以反击那些追捕你的敌对势力。不同的角色拥有独特的技能和移动方式。</p>
                        </div>
                    </div>
                </div>

                <div class="intro-panel" data-content="objectives">
                    <div class="panel-grid">
                        <div class="panel-image">
                            <img src="images/sucess.png" alt="游戏目标">
                        </div>
                        <div class="panel-text">
                            <h3>挑战目标</h3>
                            <p>主要目标是在限定时间内收集足够的以太结晶，同时避免被敌对势力捕获。每个关卡都有不同的挑战和特殊机制。</p>
                            <p>通过完成挑战获得高分，解锁新角色和新区域。与其他玩家竞争排行榜位置，成为新艾利都最强的绳匠！</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 角色选单区域 -->
    <section id="characters" class="characters-section">
        <div class="container">
            <h2 class="section-title">角色选单</h2>
            <p class="section-subtitle">鼠标点击左侧轮盘选择你的代理人阵营，开始新艾利都的冒险吧！</p>
            
            <!-- 阵营转盘选择器 -->
            <div class="faction-carousel-container">
                <div class="faction-carousel" id="factionCarousel">
                    <div class="faction-item active" data-faction="jtw">
                        <div class="faction-logo">
                            <img src="images/character/organization/jtwlogo.png" alt="狡兔屋">
                        </div>
                        <span class="faction-name">狡兔屋</span>
                    </div>
                    <div class="faction-item" data-faction="kldz">
                        <div class="faction-logo">
                            <img src="images/character/organization/kldzzlogo.png" alt="卡吕冬之子">
                        </div>
                        <span class="faction-name">卡吕冬之子</span>
                    </div>
                    <div class="faction-item" data-faction="xztqz">
                        <div class="faction-logo">
                            <img src="images/character/organization/xztqzlogo.png" alt="刑侦特勤组">
                        </div>
                        <span class="faction-name">刑侦特勤组</span>
                    </div>
                    <div class="faction-item" data-faction="hsos">
                        <div class="faction-logo">
                            <img src="images/character/organization/hsoslogo.png" alt="对空六课">
                        </div>
                        <span class="faction-name">对空六课</span>
                    </div>
                    <div class="faction-item" data-faction="bqzg">
                        <div class="faction-logo">
                            <img src="images/character/organization/bqzglogo.png" alt="白祇重工">
                        </div>
                        <span class="faction-name">白祇重工</span>
                    </div>
                    <div class="faction-item" data-faction="wdlyjz">
                        <div class="faction-logo">
                            <img src="images/character/organization/wdlyjzlogo.png" alt="维多利亚家政">
                        </div>
                        <span class="faction-name">维多利亚家政</span>
                    </div>
                </div>
                
                <!-- 转盘导航按钮 -->
                <button class="carousel-nav carousel-prev" id="carouselPrev">
                    <span class="desktop-arrow">▲</span>
                    <span class="mobile-arrow">‹</span>
                </button>
                <button class="carousel-nav carousel-next" id="carouselNext">
                    <span class="desktop-arrow">▼</span>
                    <span class="mobile-arrow">›</span>
                </button>
            </div>
            
            <!-- 角色预览区域 -->
            <div class="characters-preview" id="charactersPreview">
                <!-- 狡兔屋 -->
                <div class="faction-characters active" data-faction="jtw">
                    <h3 class="faction-title">狡兔屋 - 代理人</h3>
                    <div class="characters-row">
                        <div class="character-avatar-item" data-character="ab">
                            <img src="images/character/character_single/ab.png" alt="安比·德玛拉">
                            <span class="character-label">安比·德玛拉</span>
                        </div>
                        <div class="character-avatar-item" data-character="nk">
                            <img src="images/character/character_single/nk.png" alt="妮可·德玛拉">
                            <span class="character-label">妮可·德玛拉</span>
                        </div>
                        <div class="character-avatar-item" data-character="bl">
                            <img src="images/character/character_single/bl.png" alt="比利">
                            <span class="character-label">比利</span>
                        </div>
                        <div class="character-avatar-item" data-character="mgyn">
                            <img src="images/character/character_single/mgyn.png" alt="猫宫又奈">
                            <span class="character-label">猫宫又奈</span>
                        </div>
                    </div>
                </div>
                
                <!-- 卡吕冬之子 -->
                <div class="faction-characters" data-faction="kldz">
                    <h3 class="faction-title">卡吕冬之子 - 代理人</h3>
                    <div class="characters-row">
                        <div class="character-avatar-item" data-character="bkn">
                            <img src="images/character/character_single/bkn.png" alt="波可娜·弗莱尼">
                            <span class="character-label">波可娜·弗莱尼</span>
                        </div>
                        <div class="character-avatar-item" data-character="lt">
                            <img src="images/character/character_single/lt.png" alt="莱特">
                            <span class="character-label">莱特</span>
                        </div>
                        <div class="character-avatar-item" data-character="bns">
                            <img src="images/character/character_single/bns.png" alt="伯妮思">
                            <span class="character-label">伯妮思</span>
                        </div>
                        <div class="character-avatar-item" data-character="ksj">
                            <img src="images/character/character_single/ksj.png" alt="凯撒·金">
                            <span class="character-label">凯撒·金</span>
                        </div>
                        <div class="character-avatar-item" data-character="pp">
                            <img src="images/character/character_single/pp.png" alt="派派">
                            <span class="character-label">派派</span>
                        </div>
                        <div class="character-avatar-item" data-character="lx">
                            <img src="images/character/character_single/lx.png" alt="露西">
                            <span class="character-label">露西</span>
                        </div>
                    </div>
                </div>
                
                <!-- 刑侦特勤组 -->
                <div class="faction-characters" data-faction="xztqz">
                    <h3 class="faction-title">刑侦特勤组 - 代理人</h3>
                    <div class="characters-row">
                        <div class="character-avatar-item" data-character="ss">
                            <img src="images/character/character_single/ss.png" alt="赛斯·洛威尔">
                            <span class="character-label">赛斯·洛威尔</span>
                        </div>
                        <div class="character-avatar-item" data-character="qy">
                            <img src="images/character/character_single/qy.png" alt="青衣">
                            <span class="character-label">青衣</span>
                        </div>
                        <div class="character-avatar-item" data-character="zy">
                            <img src="images/character/character_single/zy.png" alt="朱鸢">
                            <span class="character-label">朱鸢</span>
                        </div>
            </div>
        </div>
                
                <!-- 对空六课 -->
                <div class="faction-characters" data-faction="hsos">
                    <h3 class="faction-title">对空六课 - 代理人</h3>
                    <div class="characters-row">
                        <div class="character-avatar-item" data-character="qyyz">
                            <img src="images/character/character_single/qyyz.png" alt="浅羽悠真">
                            <span class="character-label">浅羽悠真</span>
                        </div>
                        <div class="character-avatar-item" data-character="ycl">
                            <img src="images/character/character_single/ycl.png" alt="月城柳">
                            <span class="character-label">月城柳</span>
                        </div>
                        <div class="character-avatar-item" data-character="xjy">
                            <img src="images/character/character_single/xjy.png" alt="星见雅">
                            <span class="character-label">星见雅</span>
                        </div>
                        <div class="character-avatar-item" data-character="cj">
                            <img src="images/character/character_single/cj.png" alt="苍角">
                            <span class="character-label">苍角</span>
                        </div>
                    </div>
                </div>
                
                <!-- 白祇重工 -->
                <div class="faction-characters" data-faction="bqzg">
                    <h3 class="faction-title">白祇重工 - 代理人</h3>
                    <div class="characters-row">
                        <div class="character-avatar-item" data-character="gls">
                            <img src="images/character/character_single/gls.png" alt="格莉丝·霍华德">
                            <span class="character-label">格莉丝·霍华德</span>
                        </div>
                        <div class="character-avatar-item" data-character="b">
                            <img src="images/character/character_single/b.png" alt="本·比格">
                            <span class="character-label">本·比格</span>
                        </div>
                        <div class="character-avatar-item" data-character="ad">
                            <img src="images/character/character_single/ad.png" alt="安东·伊万诺夫">
                            <span class="character-label">安东·伊万诺夫</span>
                        </div>
                        <div class="character-avatar-item" data-character="kld">
                            <img src="images/character/character_single/kld.png" alt="珂蕾妲·贝洛伯格">
                            <span class="character-label">珂蕾妲·贝洛伯格</span>
                        </div>
                    </div>
                </div>
                
                <!-- 维多利亚家政 -->
                <div class="faction-characters" data-faction="wdlyjz">
                    <h3 class="faction-title">维多利亚家政 - 代理人</h3>
                    <div class="characters-row">
                        <div class="character-avatar-item" data-character="alq">
                            <img src="images/character/character_single/alq.png" alt="艾莲·乔">
                            <span class="character-label">艾莲·乔</span>
                        </div>
                        <div class="character-avatar-item" data-character="ln">
                            <img src="images/character/character_single/ln.png" alt="亚历山德丽娜">
                            <span class="character-label">亚历山德丽娜</span>
                        </div>
                        <div class="character-avatar-item" data-character="lka">
                            <img src="images/character/character_single/lka.png" alt="冯·莱卡恩">
                            <span class="character-label">冯·莱卡恩</span>
                        </div>
                        <div class="character-avatar-item" data-character="kl">
                            <img src="images/character/character_single/kl.png" alt="可琳·威克斯">
                            <span class="character-label">可琳·威克斯</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>



    <!-- 挑战排行榜区域 -->
    <section id="ranking" class="ranking-section">
        <div class="container">
            <h2 class="section-title">挑战排行榜</h2>
            
            <div class="ranking-tabs">
                <button class="ranking-tab active" data-tab="daily">每日排行</button>
                <button class="ranking-tab" data-tab="weekly">周排行</button>
                <button class="ranking-tab" data-tab="alltime">总排行</button>
            </div>

            <div class="ranking-content">
                <div class="ranking-panel active" data-content="daily">
                    <div class="ranking-table">
                        <div class="table-header">
                            <span>排名</span>
                            <span>玩家</span>
                            <span>角色</span>
                            <span>分数</span>
                            <span>时间</span>
                        </div>
                        <div class="ranking-list" id="dailyRanking">
                            <!-- 排行榜数据将通过JavaScript动态生成 -->
                        </div>
                    </div>
                </div>

                <div class="ranking-panel" data-content="weekly">
                    <div class="ranking-table">
                        <div class="table-header">
                            <span>排名</span>
                            <span>玩家</span>
                            <span>角色</span>
                            <span>分数</span>
                            <span>通关次数</span>
                        </div>
                        <div class="ranking-list" id="weeklyRanking">
                            <!-- 排行榜数据将通过JavaScript动态生成 -->
                        </div>
                    </div>
                </div>

                <div class="ranking-panel" data-content="alltime">
                    <div class="ranking-table">
                        <div class="table-header">
                            <span>排名</span>
                            <span>玩家</span>
                            <span>角色</span>
                            <span>最高分</span>
                            <span>成就</span>
                        </div>
                        <div class="ranking-list" id="alltimeRanking">
                            <!-- 排行榜数据将通过JavaScript动态生成 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 固定开始游戏按钮 -->
    <div class="start-game-fixed" id="startGameFixed">
        <button class="start-game-btn" id="startGameBtn">
            <span class="btn-text">开始游戏</span>
            <span class="btn-icon">▶</span>
            <div class="btn-energy"></div>
        </button>
    </div>

    <!-- 页脚 -->
    <footer class="game-footer">
        <div class="container">
            <p>&copy; 2025 绝区零吃豆人同人游戏 - 致敬经典，拥抱未来 | 朱信宇 D23090601058 | 胡可秦 D23090600521</p>
        </div>
    </footer>

    <!-- JavaScript 引入 -->
    <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
    <script src="js/main.js"></script>
    <script src="js/characters.js"></script>
    <script src="js/game-intro.js"></script>
    <script src="js/ranking.js"></script>
    <script src="js/particles.js"></script>
    <script src="js/animations.js"></script>
</body>
</html>