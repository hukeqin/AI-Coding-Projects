// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    // Tab切换逻辑
    const tabLinks = document.querySelectorAll('.tab-link');
    const formContents = document.querySelectorAll('.form-content');

    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            tabLinks.forEach(item => item.classList.remove('active'));
            formContents.forEach(item => item.classList.remove('active'));

            tab.classList.add('active');
            document.querySelector(`.form-content[data-form="${tab.dataset.tab}"]`).classList.add('active');
        });
    });

    // 登录表单提交逻辑
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageEl = document.getElementById('login-message');
        messageEl.textContent = '正在验证...';
        
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            messageEl.style.color = 'lightgreen';
            messageEl.textContent = result.message + ' 正在重新加载...';
            // 登录成功，刷新页面，PHP将显示游戏界面
            setTimeout(() => window.location.reload(), 1000);
        } else {
            messageEl.style.color = '#ff4d4d';
            messageEl.textContent = result.message;
        }
    });

    // 注册表单提交逻辑
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageEl = document.getElementById('register-message');
        messageEl.textContent = '正在注册...';

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            messageEl.style.color = 'lightgreen';
            messageEl.textContent = result.message + ' 请登录。';
            // 注册成功后，可以提示用户去登录
        } else {
            messageEl.style.color = '#ff4d4d';
            // 如果有详细错误，可以显示
            if (result.errors) {
                messageEl.textContent = Object.values(result.errors).join(' ');
            } else {
                messageEl.textContent = result.message;
            }
        }
    });
});