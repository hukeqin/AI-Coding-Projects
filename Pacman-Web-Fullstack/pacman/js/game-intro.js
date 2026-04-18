// 游戏背景介绍 - 标签切换功能
document.addEventListener('DOMContentLoaded', function() {
    const introButtons = document.querySelectorAll('.intro-btn');
    const introPanels = document.querySelectorAll('.intro-panel');
    
    // 为每个按钮添加点击事件
    introButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // 移除所有按钮的active类
            introButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 隐藏所有面板
            introPanels.forEach(panel => panel.classList.remove('active'));
            // 显示对应面板
            const targetPanel = document.querySelector(`[data-content="${targetTab}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}); 