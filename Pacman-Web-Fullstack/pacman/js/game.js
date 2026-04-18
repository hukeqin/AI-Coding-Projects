// js/game.js (修正版)

// --- 1. DOM元素获取 (保持不变) ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hpDisplay = document.getElementById('hp-display');
const hpBarFill = document.getElementById('hp-bar-fill');
const scoreDisplay = document.getElementById('score-display');
const comboDisplay = document.getElementById('combo-display');
const levelDisplay = document.getElementById('level-display');
const characterPortraits = document.querySelectorAll('.portrait');
const ultimateChargesContainer = document.getElementById('ultimate-charges');
const evadeCooldownBar = document.querySelector('#evade-cooldown .cooldown-fill');
const gameOverlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const restartButton = document.getElementById('restart-button');
const timerDisplay = document.getElementById('timer-display');
const evadeStatus = document.getElementById('evade-status');

const buffDisplayPanel = document.getElementById('buff-display');
const buffName = document.getElementById('buff-name');
const buffTimer = document.getElementById('buff-timer');
const buffBarFill = document.getElementById('buff-bar-fill');



const characters = {
    anbi: { name: '安比', image: new Image(), src: 'images/anbi.png' },
    billy: { name: '比利', image: new Image(), src: 'images/billy.png' },
    nicole: { name: '妮可', image: new Image(), src: 'images/nicole.png' }
};

// 预加载图片
for (const charKey in characters) {
    characters[charKey].image.src = characters[charKey].src;
}

// --- 2. 游戏状态和配置 (清理并整合) ---
const TILE_SIZE = 48; // 使用8x8地图，推荐用大格子
let levelData = null;
let map = [];
let player = {}; // 玩家对象将在setupGame中被完整定义
let ghosts = [];
let dots = []; // <-- 新增：用来存放所有豆子的坐标
let buffs = [];
let score = 0;
let combo = 0;
let ultimateCharges = 0;
let isPaused = false;
let isGameOver = false;

let lastTime = 0;
let moveInput = { dx: 0, dy: 0 }; // 新增：用来存储玩家的按键意图
let moveTimer = 0;               // 新增：移动计时器
const MOVE_INTERVAL = 120;       // 新增：移动一格需要多少毫秒 (数字越大，移动越慢)

let gameTimer = 120; // 游戏总时长
let timerInterval = null; // 用来存放计时器的引用

let canEvade = true;      // 是否能闪避
let isEvading = false;    // 当前是否处于闪避无敌状态
let evadeDuration = 500;  // 闪避无敌持续时间（毫秒）
let evadeTimer = 0;

let powerDot = null;      // 特殊的黄色豆粒
let powerDotSpawnTimer = 20000; // 20秒刷新计时
const POWER_DOT_SPAWN_INTERVAL = 20000; // 20秒刷新计时
let activeBuff = null;    // 当前激活的buff
let buffDurationTimer = 0;

// --- 3. 游戏主流程 ---
window.addEventListener('load', () => {
    initGame(1);
});

//重新开始按钮的点击事件
restartButton.addEventListener('click', () => {
    console.log("Restarting game...");
    initGame(1); // 点击后，重新初始化第一关
});

async function initGame(level) {
    // ... initGame 函数保持之前的最终版，无需修改 ...
    console.log(`正在初始化关卡 ${level}...`);
    gameOverlay.classList.remove('hidden');
    overlayTitle.textContent = '正在加载...';
    overlayMessage.textContent = `准备进入关卡 ${level}`;
    restartButton.classList.add('hidden');
    try {
        const response = await fetch(`api/get_level_data.php?level=${level}`);
        if (!response.ok) throw new Error(`服务器错误: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        levelData = result.data;
        console.log("关卡数据加载成功:", levelData);
        resetGameStates();
        setupGame();
        gameOverlay.classList.add('hidden');
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    } catch (error) {
        isGameOver = true;
        overlayTitle.textContent = '加载失败';
        overlayMessage.textContent = error.message;
        console.error("初始化游戏失败:", error);
    }
}

function gameLoop(timestamp) {
    if (isGameOver) return;

    // 把deltaTime的计算移到isPaused判断的外面
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!isPaused) {
        update(deltaTime); // 把deltaTime传递给update函数
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// --- 4. 核心逻辑函数 (重构和修正) ---
function resetGameStates() {
    console.log("Resetting game states...");
    isGameOver = false;
    isPaused = false;
    score = 0;
    combo = 0;
    ultimateCharges = 0;
    player = {}; // 清空玩家对象
    ghosts = [];
    buffs = [];
    gameTimer = 120; // 每次重置游戏都恢复到120秒
    if (timerInterval) clearInterval(timerInterval); // 清除旧的计时器
    canEvade = true;      //重置闪避状态
    isEvading = false;
}


function setupGame() {
    console.log("Setting up game...");

    // 1. 解析地图布局字符串
    const layout = levelData.map_layout.split('\n');
    
    // 2. 清空并初始化游戏对象数组
    map = [];      // 存放碰撞信息 (只关心墙 'W')
    dots = [];     // 存放所有豆子
    ghosts = [];   // 存放所有鬼/以骸

    // 3. 遍历布局，生成所有游戏元素
    for (let y = 0; y < layout.length; y++) {
        const mapRow = [];
        for (let x = 0; x < layout[y].length; x++) {
            const char = layout[y][x];

            // 3a. 构建碰撞地图 (map) - 简化：只记录墙
            if (char === 'W') {
                mapRow.push('W'); 
            } else {
                mapRow.push(' '); // 其他所有地方都是可走的路径
            }

            // 3b. 在非墙的地方生成豆子
            if (char !== 'W') {
                // **修改：用随机数决定是否生成初始豆子**
                // Math.random() > 0.6 意味着大约有40%的几率生成豆子
                if (Math.random() > 0.6) { 
                    dots.push({ x: x, y: y });
                }
            }

            // 3c. 根据符号初始化玩家 (player)
            if (char === 'p') {
                player = {
                    x: x, y: y,
                    //pixelX: x * TILE_SIZE, pixelY: y * TILE_SIZE,
                    //targetX: x, targetY: y,
                    dx: 0, dy: 0,
                    speed: parseFloat(levelData.pacman_speed),
                    hp: parseInt(levelData.initial_hp),
                    maxHp: parseInt(levelData.initial_hp), // 记录最大HP
                    character: 'anbi'
                };
            }

            // 3d. 根据符号初始化鬼/以骸 (ghosts)
            if (char === 'G' || char === 'E') {
                ghosts.push({
                    x: x, y: y,
                    pixelX: x * TILE_SIZE, pixelY: y * TILE_SIZE,
                    targetX: x, targetY: y,
                    dx: 0, dy: 0,
                    type: char === 'G' ? 'normal' : 'elite',
                    speed: char === 'G' ? parseFloat(levelData.ghost_speed) : parseFloat(levelData.elite_ghost_speed),
                    color: char === 'G' ? 'cyan' : 'magenta'
                });
            }
        }
        map.push(mapRow);
    }
    
    // 4. 设置画布尺寸
    canvas.width = map[0].length * TILE_SIZE;
    canvas.height = map.length * TILE_SIZE;
    
    // **5. 核心改动：将计算出的尺寸同步给父容器，确保布局正确**
    const gameMainElement = document.getElementById('game-main');
    if(gameMainElement) {
        gameMainElement.style.width = canvas.width + 'px';
        gameMainElement.style.height = canvas.height + 'px';
    }

    // 6. 初始化UI
    startTimer();
    updateUI();
    console.log(`Game setup complete. Canvas size set to: ${canvas.width}x${canvas.height}. Player at (${player.x}, ${player.y}). Found ${dots.length} dots and ${ghosts.length} ghosts.`);
}

function startTimer() {
    // 创建一个每1000毫秒（1秒）执行一次的定时器
    timerInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            gameTimer--; // 时间减1
            updateUI();  // 更新界面显示

            // 检查胜利条件
            if (gameTimer <= 0) {
                gameTimer = 0;
                gameOver(true); // 时间到，玩家胜利！
            }
        }
    }, 1000);
}

function update(dt) {
    updatePlayer(dt);
    updateGhosts(dt); // <-- 鬼的移动在这里调用
    updateBuffs(dt);//buff的更新在这里调用
    checkCollisions(); // <-- 在这里调用
}

// **新的 updateBuffs 函数**
function updateBuffs(dt) {
    // 处理黄色豆粒的生成
    powerDotSpawnTimer -= dt;
    if (powerDotSpawnTimer <= 0) {
        spawnPowerDot();
        powerDotSpawnTimer = POWER_DOT_SPAWN_INTERVAL;
    }

    // 处理当前激活的Buff的持续时间
    if (activeBuff) {
        buffDurationTimer -= dt;
        if (buffDurationTimer <= 0) {
            deactivateBuff();
        }
        updateUI(); // 持续更新UI
    }
}

//特殊豆子逻辑：生成一个特殊的黄色豆子
function spawnPowerDot() {
    if (dots.length === 0) return; // 如果没有普通豆子了，就不替换
    
    // 随机选择一个现有的普通豆子
    const randomIndex = Math.floor(Math.random() * dots.length);
    powerDot = {
        x: dots[randomIndex].x,
        y: dots[randomIndex].y,
    };
    
    // 从普通豆子数组中移除被替换的那个
    dots.splice(randomIndex, 1);
    
    console.log(`Power Dot spawned at (${powerDot.x}, ${powerDot.y})`);
}

function updateGhosts(dt) {
    for (const ghost of ghosts) {
        // 决策逻辑 (保持不变)
        if (ghost.pixelX % TILE_SIZE === 0 && ghost.pixelY % TILE_SIZE === 0) {
            ghost.x = ghost.pixelX / TILE_SIZE;
            ghost.y = ghost.pixelY / TILE_SIZE;

            const possibleMoves = [];
            const directions = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
            
            for (const move of directions) {
                if (map[ghost.y + move.dy] && map[ghost.y + move.dy][ghost.x + move.dx] !== 'W') {
                    if (possibleMoves.length <= 1 || (move.dx !== -ghost.dx || move.dy !== -ghost.dy)) {
                         possibleMoves.push(move);
                    }
                }
            }

            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                ghost.dx = randomMove.dx;
                ghost.dy = randomMove.dy;
            } else {
                ghost.dx = -ghost.dx;
                ghost.dy = -ghost.dy;
            }
        }
        
        // **修正：鬼的平滑移动逻辑，增加边界检测**
        const targetPixelX = (ghost.x + ghost.dx) * TILE_SIZE;
        const targetPixelY = (ghost.y + ghost.dy) * TILE_SIZE;
        const speed = ghost.speed;

        if (ghost.dx !== 0) { // 水平移动
            if (ghost.dx > 0) {
                ghost.pixelX = Math.min(ghost.pixelX + speed, ghost.x * TILE_SIZE + TILE_SIZE);
            } else {
                ghost.pixelX = Math.max(ghost.pixelX - speed, ghost.x * TILE_SIZE - TILE_SIZE);
            }
        }
        if (ghost.dy !== 0) { // 垂直移动
            if (ghost.dy > 0) {
                ghost.pixelY = Math.min(ghost.pixelY + speed, ghost.y * TILE_SIZE + TILE_SIZE);
            } else {
                ghost.pixelY = Math.max(ghost.pixelY - speed, ghost.y * TILE_SIZE - TILE_SIZE);
            }
        }
    }
}

//这个函数会找到一个随机的空位来生成新豆子
function spawnNewDot() {
    if (!map.length) return; // 防止地图未加载时调用

    const emptyTiles = [];
    // 找到所有没有豆子也没有玩家/鬼的空位
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === ' ') {
                // 检查这个位置是否已经有豆子了
                const hasDot = dots.some(d => d.x === x && d.y === y);
                if (!hasDot) {
                    emptyTiles.push({ x: x, y: y });
                }
            }
        }
    }

    // 如果有空位，就随机选一个生成新豆子
    if (emptyTiles.length > 0) {
        const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        dots.push(randomTile);
    }
}

function checkCollisions() {
    // --- 1. 玩家与豆子的碰撞 (这个逻辑已经是基于格子坐标的，所以是正确的，保持不变) ---
    for (let i = dots.length - 1; i >= 0; i--) {
        if (player.x === dots[i].x && player.y === dots[i].y) {
            dots.splice(i, 1);
            score += (activeBuff === 'score_boost') ? 20 : 10;// **修改：根据Buff状态决定加多少分**
            combo += 1;
            spawnNewDot();
            updateUI();
            if (dots.length === 0) gameOver(true);
            break;
        }
    }

    // **新增：与黄色豆粒的碰撞**
    if (powerDot && player.x === powerDot.x && player.y === powerDot.y) {
        activateRandomBuff();
        powerDot = null; // 吃掉后消失
    }

    // --- 2. 玩家与鬼的碰撞 (修正为基于格子坐标) ---
    for (const ghost of ghosts) {
        // **核心修正：直接比较玩家和鬼的格子坐标**
        if (player.x === ghost.x && player.y === ghost.y) {
            handlePlayerGhostCollision();
            // 碰撞后立刻跳出循环，避免一帧内多次扣血
            break; 
        }
    }
}

// 激活随机Buff
function activateRandomBuff() {
    // 结束上一个Buff（如果有）
    if (activeBuff) deactivateBuff();

    const char = player.character;
    const rand = Math.random();

    // 根据角色概率选择Buff
    if ((char === 'anbi' && rand < 0.6) || (char !== 'anbi' && rand < 0.2)) {
        activeBuff = 'evade_plus';
        canEvade = true;
    } else if ((char === 'nicole' && rand < 0.7) || (char !== 'nicole' && rand < 0.4)) {
        activeBuff = 'heal';
        player.hp = Math.min(player.maxHp, player.hp + 30);
    } else {
        activeBuff = 'score_boost';
        player.hp = Math.max(1, player.hp - 20);
        buffDurationTimer = 10000; // 10秒持续时间
    }
    
    updateUI(); // 立即更新UI
    console.log(`Buff Activated: ${activeBuff}`);
}

// 结束Buff效果
function deactivateBuff() {
    if (activeBuff === 'score_boost') {
        player.hp = Math.min(player.maxHp, player.hp + 10);
    }
    activeBuff = null;
    updateUI();
    console.log("Buff deactivated.");
}


//处理碰撞后的具体事务（扣血、重置位置等），并更新UI
function handlePlayerGhostCollision() {
    if (isEvading) {
        console.log("Collision ignored due to evade.");
        return;
    }
    
    console.log("Collision with ghost!");
    player.hp -= player.maxHp / 2.5;
    combo = 0;

    if (player.hp <= 0) {
        player.hp = 0;
        updateUI(); // 先更新一次UI，让血条显示为0
        gameOver(false); // 直接调用gameOver，不再处理重生
    } else {
        // 如果血没掉光，才执行重生逻辑
        const respawnPoints = findAllCharsInMap('R');
        if (respawnPoints.length > 0) {
            const randomPoint = respawnPoints[Math.floor(Math.random() * respawnPoints.length)];
            player.x = randomPoint.x;
            player.y = randomPoint.y;
            //player.pixelX = player.x * TILE_SIZE;
            //player.pixelY = player.y * TILE_SIZE;
            //player.targetX = player.x;
            //player.targetY = player.y;
        }
        updateUI();
    }
}

// 需要一个新的辅助函数来找到所有重生点
function findAllCharsInMap(charToFind) {
    const points = [];
    const layout = levelData.map_layout.split('\n');
    for (let y = 0; y < layout.length; y++) {
        for (let x = 0; x < layout[y].length; x++) {
            if (layout[y][x] === charToFind) {
                points.push({ x: x, y: y });
            }
        }
    }
    return points;
}

// 添加一个辅助函数，用于在原始布局中查找特定字符的位置
function findCharInMap(charToFind) {
    const layout = levelData.map_layout.split('\n');
    for (let y = 0; y < layout.length; y++) {
        for (let x = 0; x < layout[y].length; x++) {
            if (layout[y][x] === charToFind) {
                return { x: x, y: y };
            }
        }
    }
    return null; // 如果没找到
}


function drawGhosts() {
    for (const ghost of ghosts) {
        ctx.fillStyle = ghost.color;
        // 简单地用一个带眼睛的方块来代表鬼
        ctx.fillRect(ghost.pixelX, ghost.pixelY, TILE_SIZE, TILE_SIZE);
        
        // 画眼睛
        ctx.fillStyle = 'white';
        ctx.fillRect(ghost.pixelX + TILE_SIZE * 0.2, ghost.pixelY + TILE_SIZE * 0.2, TILE_SIZE*0.25, TILE_SIZE*0.25);
        ctx.fillRect(ghost.pixelX + TILE_SIZE * 0.55, ghost.pixelY + TILE_SIZE * 0.2, TILE_SIZE*0.25, TILE_SIZE*0.25);
    }
}

// **新的 drawPowerDot 函数**
function drawPowerDot() {
    if (powerDot) {
        ctx.fillStyle = 'yellow'; // 特殊豆粒用黄色
        ctx.beginPath();
        // 画得比普通豆子大一点
        ctx.arc(powerDot.x * TILE_SIZE + TILE_SIZE / 2, powerDot.y * TILE_SIZE + TILE_SIZE / 2, 6, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    // 绘制豆子等
    drawDots(); // <-- 新增：调用绘制豆子的函数
    drawPlayer();
    drawGhosts();
    drawPowerDot(); // <-- 新增调用
}

// --- 5. 具体实现函数 ---
// updatePlayer (最终版 - 逐格移动带速控)
function updatePlayer(dt) {
    // 累加我们的移动计时器 (dt 是自上一帧以来的毫秒数)
    moveTimer += dt;

    // 检查计时器是否超过了我们设定的移动间隔
    if (moveTimer >= MOVE_INTERVAL) {
        moveTimer = 0; // 超过了，就重置计时器，准备下一次移动

        // 如果玩家有移动意图 (按下了方向键)
        if (moveInput.dx !== 0 || moveInput.dy !== 0) {
            const nextX = player.x + moveInput.dx;
            const nextY = player.y + moveInput.dy;

            // 检查下一步是否是墙
            if (map[nextY] && map[nextY][nextX] !== 'W') {
                // 如果不是墙，更新玩家的格子坐标
                player.x = nextX;
                player.y = nextY;
            }
        }
    }
}

function drawMap() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 'W') {
                ctx.fillStyle = '#335599';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
            // 不再在这里画豆子,在drawDots函数中画
        }
    }
}

// **新增：绘制豆子的函数**
function drawDots() {
    ctx.fillStyle = 'white';
    for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x * TILE_SIZE + TILE_SIZE / 2, dot.y * TILE_SIZE + TILE_SIZE / 2, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawPlayer() {
    // 获取当前角色的图片对象
    const playerImage = characters[player.character].image;
    
    // 检查图片是否已加载完成
    if (playerImage.complete) {
        ctx.drawImage(
            playerImage,
            player.x * TILE_SIZE, 
            player.y * TILE_SIZE, 
            TILE_SIZE, 
            TILE_SIZE
        );
    } else {
        // 如果图片还没加载好，可以画一个占位的颜色
        ctx.fillStyle = 'yellow';
        ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}

function updateUI() {
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;
    levelDisplay.textContent = levelData ? levelData.level_number : 1;
    // 新增：更新HP显示和血条宽度
    if (player && player.maxHp) {
        hpDisplay.textContent = `${player.hp}/${player.maxHp}`;
        const hpPercentage = (player.hp / player.maxHp) * 100;
        hpBarFill.style.width = `${hpPercentage}%`;
    }
    if (timerDisplay) {
        timerDisplay.textContent = gameTimer;
    }

    if (evadeStatus) {
        evadeStatus.textContent = canEvade ? '可用' : '已使用';
        evadeStatus.className = canEvade ? 'skill-status ready' : 'skill-status used';
    }

    // **新增：Buff UI的更新逻辑**
    if (activeBuff === 'score_boost') {
        buffDisplayPanel.classList.remove('hidden');
        buffName.textContent = "双倍积分";
        const timeLeft = Math.ceil(buffDurationTimer / 1000);
        buffTimer.textContent = timeLeft;
        buffBarFill.style.width = `${(buffDurationTimer / 10000) * 100}%`;
    } else {
        buffDisplayPanel.classList.add('hidden');
    }
}

// --- 6. 游戏控制函数 (修正) ---
function togglePause() {
    if (isGameOver) return;
    // **修正：必须切换 isPaused 状态**
    isPaused = !isPaused; 

    if (isPaused) {
        // 如果是暂停，则显示遮罩层
        overlayTitle.textContent = '游戏暂停';
        overlayMessage.textContent = "按 'P' 键继续";
        restartButton.classList.add('hidden');
        gameOverlay.classList.remove('hidden');
    } else {
        // 如果是取消暂停，则隐藏遮罩层，并重启游戏循环
        gameOverlay.classList.add('hidden');
        // 重置lastTime避免因暂停时间过长导致游戏“跳帧”
        lastTime = performance.now(); 
        requestAnimationFrame(gameLoop);
    }
    console.log(`Game paused: ${isPaused}`);
}

//游戏结束的函数，还需要完善<----------
async function gameOver(isWin) {
    if (isGameOver) return;
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    console.log("Game Over. Win:", isWin);

    overlayTitle.textContent = isWin ? '任务成功！' : '任务失败';
    
    // **在这里补全分数提交逻辑**
    // 无论输赢，我们都先显示分数
    let finalMessage = `最终得分: ${score}`;

    // 只有胜利时才提交分数
    if (isWin) {
        try {
            const response = await fetch('api/submit_scores.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: score, level: parseInt(levelDisplay.textContent) })
            });
            const result = await response.json();
            if (result.success) {
                console.log("Score submitted successfully!");
                finalMessage += ' - 分数已成功上传！';
            } else {
                console.error("Failed to submit score:", result.message);
                finalMessage += ' - 分数上传失败。';
            }
        } catch (error) {
            console.error("Network error submitting score:", error);
            finalMessage += ' - 分数上传时网络错误。';
        }
    }
    
    overlayMessage.textContent = finalMessage;
    restartButton.classList.remove('hidden');
    gameOverlay.classList.remove('hidden');
}


// --- 7. 输入处理 (修正) ---
function switchCharacter(charKey) {
    if (!characters[charKey] || player.character === charKey) {
        return; // 如果角色不存在或已经是当前角色，则不执行任何操作
    }

    player.character = charKey;
    console.log(`Switched to ${characters[charKey].name}`);

    // 更新UI，高亮新的角色头像
    characterPortraits.forEach(portrait => {
        if (portrait.dataset.char === charKey) {
            portrait.classList.add('active');
        } else {
            portrait.classList.remove('active');
        }
    });
}


document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'p') {
        togglePause();
        return;
    }

    if (isGameOver || isPaused) return;

    // 按下方向键时，设置移动意图
    switch (key) {
        case 'w': case 'arrowup': moveInput = { dx: 0, dy: -1 }; break;
        case 's': case 'arrowdown': moveInput = { dx: 0, dy: 1 }; break;
        case 'a': case 'arrowleft': moveInput = { dx: -1, dy: 0 }; break;
        case 'd': case 'arrowright': moveInput = { dx: 1, dy: 0 }; break;
        case '1':
            switchCharacter('anbi');
            break;
        case '2':
            switchCharacter('billy');
            break;
        case '3':
            switchCharacter('nicole');
            break;
        case ' ':
            e.preventDefault(); // 空格键闪避，防止页面滚动
            activateEvade();
            break;
    }
});

//闪避技能
function activateEvade() {
    if (!canEvade || isEvading) return; // 如果不能闪避或正在闪避，则无效

    console.log("EVADE ACTIVATED!");
    canEvade = false;
    isEvading = true;
    evadeTimer = evadeDuration;
    
    // 立即更新UI
    updateUI();
    
    // 0.5秒后结束无敌状态
    setTimeout(() => {
        isEvading = false;
        console.log("Evade finished.");
    }, evadeDuration);
}


// 添加keyup事件，实现松开按键就停止移动的效果
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    // 如果松开的是当前正在移动的方向键，则停止
    if ((key === 'w' || key === 'arrowup') && moveInput.dy === -1) moveInput = { dx: 0, dy: 0 };
    if ((key === 's' || key === 'arrowdown') && moveInput.dy === 1) moveInput = { dx: 0, dy: 0 };
    if ((key === 'a' || key === 'arrowleft') && moveInput.dx === -1) moveInput = { dx: 0, dy: 0 };
    if ((key === 'd' || key === 'arrowright') && moveInput.dx === 1) moveInput = { dx: 0, dy: 0 };
});

// --- 8. 其他交互 ---
const logoutButton = document.getElementById('logout-button');

if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        // 阻止<a>标签的默认跳转行为
        e.preventDefault(); 
        
        // 在跳转前暂停游戏，避免后台还在运行
        if (!isPaused) {
            togglePause();
        }

        // 弹出一个确认框
        const userConfirmed = confirm("确定要退出登录吗？当前游戏进度将不会被保存。");
        
        if (userConfirmed) {
            // 如果用户点击“确定”，则跳转到logout.php
            window.location.href = logoutButton.href;
        } else {
            // 如果用户点击“取消”，则取消暂停，继续游戏
            togglePause();
        }
    });
}
