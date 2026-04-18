// js/ranking.js

document.addEventListener('DOMContentLoaded', function() {
    // 页面加载完成后，立即初始化排行榜模块
    initRanking();
});

function initRanking() {
    console.log('排行榜模块初始化...');
    
    // 为Tab按钮添加点击事件 (如果已有类似逻辑，可以合并)
    setupRankingTabs();
    
    // 默认加载“总排行”数据
    loadRankingData('alltime'); 
}

function setupRankingTabs() {
    const tabs = document.querySelectorAll('.ranking-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有tab的激活状态
            tabs.forEach(t => t.classList.remove('active'));
            // 激活当前点击的tab
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            
            // 隐藏所有panel
            document.querySelectorAll('.ranking-panel').forEach(p => p.classList.remove('active'));
            // 显示对应的panel
            const targetPanel = document.querySelector(`.ranking-panel[data-content="${tabName}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            // 加载对应tab的数据
            loadRankingData(tabName);
        });
    });
}

// 核心函数：加载并渲染排行榜数据
// 核心函数：加载并渲染排行榜数据
// 核心函数：加载并渲染排行榜数据 (升级版)
async function loadRankingData(tabName) {
    // tabName 是 "daily", "weekly", 或 "alltime"
    
    // **核心修改：动态构建API URL**
    const apiUrl = `api/get_leaderboard.php?range=${tabName}`;
    
    // 根据tabName找到对应的HTML元素来填充内容
    let targetElementId = '';
    switch (tabName) {
        case 'daily':   targetElementId = 'dailyRanking'; break;
        case 'weekly':  targetElementId = 'weeklyRanking'; break;
        case 'alltime': targetElementId = 'alltimeRanking'; break;
        default: return;
    }

    const rankingListElement = document.getElementById(targetElementId);
    if (!rankingListElement) {
        console.error(`排行榜目标元素 #${targetElementId} 未找到!`);
        return;
    }

    // 显示加载状态 (使用队友设计的样式)
    rankingListElement.innerHTML = `
        <div class="loading-ranking">
            <div class="loading-spinner"></div>
        </div>
    `;

    try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && result.data) {
            // 调用渲染函数来显示数据
            renderRankingList(rankingListElement, result.data, tabName); // 把tabName也传进去
        } else {
            // API返回失败或没有数据
            rankingListElement.innerHTML = `<div class="empty-ranking"><p>${result.message || '加载失败'}</p></div>`;
        }
    } catch (error) {
        console.error(`加载排行榜[${tabName}]失败:`, error);
        rankingListElement.innerHTML = '<div class="empty-ranking"><p>加载排行时发生网络错误。</p></div>';
    }
}

// 渲染函数:将数据转换为HTML
// 渲染函数 (升级版)
function renderRankingList(element, data, tabName) {
    element.innerHTML = ''; // 清空加载提示

    if (data.length === 0) {
        element.innerHTML = '<div class="empty-ranking"><p>该排行暂无记录，快去成为第一人！</p></div>';
        return;
    }

    data.forEach((item, index) => {
        const rank = index + 1;
        const rankItem = document.createElement('div');
        rankItem.className = 'ranking-item';

        let rankNumberClass = 'rank-other';
        if (rank === 1) rankNumberClass = 'rank-1';
        if (rank === 2) rankNumberClass = 'rank-2';
        if (rank === 3) rankNumberClass = 'rank-3';

        const playerInitial = escapeHTML(item.username).charAt(0).toUpperCase();

        // **核心修改：根据tabName显示不同的最后一列**
        let lastColumnHTML = '';
        switch (tabName) {
            case 'daily':
                // 每日排行显示具体游戏时间
                lastColumnHTML = `<div class="time-info">${new Date(item.played_at).toLocaleTimeString()}</div>`;
                break;
            case 'weekly':
                // 周排行显示通关关卡
                 lastColumnHTML = `<div class="stat-info">Lv. ${item.level_reached}</div>`;
                break;
            case 'alltime':
                // 总排行显示游戏日期
                lastColumnHTML = `<div class="time-info">${new Date(item.played_at).toLocaleDateString()}</div>`;
                break;
        }

        rankItem.innerHTML = `
            <div class="rank-number ${rankNumberClass}">${rank}</div>
            <div class="player-info">
                <div class="player-avatar">${playerInitial}</div>
                <span class="player-name">${escapeHTML(item.username)}</span>
            </div>
            <div class="character-tag">安比</div> <!-- 角色暂时硬编码 -->
            <div class="score-value">${item.score}</div>
            ${lastColumnHTML} <!-- 动态插入最后一列 -->
        `;
        
        element.appendChild(rankItem);
    });
}

// 一个简单的HTML转义函数，防止XSS
function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}