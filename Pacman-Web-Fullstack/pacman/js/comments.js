// js/comments.js
document.addEventListener('DOMContentLoaded', () => {
    const displayBox = document.getElementById('comment-display-box');
    const scroller = document.getElementById('comment-scroller');
    const inputBox = document.getElementById('comment-input-box');
    const inputField = document.getElementById('comment-input');
    const charCounter = document.getElementById('char-counter');
    const submitBtn = document.getElementById('submit-comment-btn');
    const charLimit = 140;
    let comments = [];
    let animation;

    // 获取并初始化评论
    async function initComments() {
        try {
            const response = await fetch('api/get_comments.php');
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                comments = result.data;
                renderComments();
            }
        } catch (error) { console.error("Failed to load comments:", error); }
    }

    // 渲染评论并启动动画
    function renderComments() {
        if (!scroller) return;
        scroller.innerHTML = '';
        const commentHTML = comments.map(c => 
            `<div class="comment-item"><span class="username">${escapeHTML(c.username)}:</span><span class="message">${escapeHTML(c.message)}</span></div>`
        ).join('');
        scroller.innerHTML = commentHTML + commentHTML; // 复制一份实现无缝滚动
        
        const scrollerWidth = scroller.scrollWidth / 2;
        const duration = scrollerWidth / 50; // 根据内容长度计算滚动速度
        if(animation) scroller.style.animation = 'none';
        setTimeout(() => { // 重启动画
            animation = `scroll-left ${duration}s linear infinite`;
            scroller.style.animation = animation;
        }, 10);
    }

    // 点击显示区切换到输入区
    displayBox.addEventListener('click', () => {
        displayBox.classList.remove('active');
        inputBox.classList.add('active');
        inputField.focus();
    });

    // ▼▼▼ 新增：点击外部区域，关闭输入框 ▼▼▼
    document.addEventListener('click', (e) => {
        // 检查评论输入框是否是激活状态
        if (inputBox.classList.contains('active')) {
            // e.target 是用户实际点击的那个元素
            // .closest('#comment-section') 会检查被点击的元素或其任何父元素是否是 #comment-section
            
            // 如果点击的地方不是在整个评论区内部，那么就关闭输入框
            if (!e.target.closest('#comment-section')) {
                inputBox.classList.remove('active');
                displayBox.classList.add('active');
            }
        }
    });

    // 字数统计
    inputField.addEventListener('input', () => {
        const count = inputField.value.length;
        charCounter.textContent = `${count} / ${charLimit}`;
        charCounter.style.color = count > charLimit ? 'red' : '#888';
    });

    // 提交评论
    inputBox.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = inputField.value.trim();
        if (message.length === 0 || message.length > charLimit) return;
        
        submitBtn.disabled = true;
        submitBtn.textContent = '发送中...';

        try {
            const response = await fetch('api/contact.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: '匿名玩家', message: message })
            });
            const result = await response.json();
            if (result.success) {
                comments.unshift(result.data); // 将新评论加到最前面
                renderComments();
                inputField.value = '';
                charCounter.textContent = `0 / ${charLimit}`;
                // 切换回显示模式
                inputBox.classList.remove('active');
                displayBox.classList.add('active');
            } else { alert(result.message); }
        } catch (error) { alert('网络错误，请重试。'); }
        
        submitBtn.disabled = false;
        submitBtn.textContent = '发送';
    });

    function escapeHTML(str) {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }

    initComments();
});