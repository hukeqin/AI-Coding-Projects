// 绝区零吃豆人游戏 - 主要JavaScript文件

// 全局变量
let isLoaded = false;
let currentSection = 'home';

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 应用初始化
function initializeApp() {
    console.log('绝区零吃豆人游戏加载中...');
    
    // 初始化各个模块
    initNavigation();
    initScrollEffects();
    initMobileMenu();
    initStartGameButton();
    initParticles();
    initScrollAnimations();
    initFixedLogo();
    
    // 页面加载完成标记
    setTimeout(() => {
        isLoaded = true;
        document.body.classList.add('loaded');
        console.log('游戏界面加载完成！');
    }, 1000);
}

// 导航功能初始化
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownLinks = document.querySelectorAll('.dropdown-link');
    const sections = document.querySelectorAll('section, header');
    
    // 主导航链接点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                smoothScrollTo(targetSection);
                updateActiveNav(targetId);
            }
        });
    });
    
    // 下拉菜单链接点击事件 - 特殊处理游戏背景介绍标签
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            const targetTab = href.substring(1); // 去掉 #
            
            // 先跳转到游戏背景介绍区域
            const gameIntroSection = document.getElementById('game-intro');
            if (gameIntroSection) {
                smoothScrollTo(gameIntroSection);
                updateActiveNav('game-intro');
                
                // 延迟触发标签切换，等待滚动完成
                setTimeout(() => {
                    triggerGameIntroTab(targetTab);
                }, 500);
            }
        });
    });
    
    // 监听滚动更新当前激活的导航
    window.addEventListener('scroll', throttle(() => {
        updateActiveNavOnScroll();
    }, 100));
}

// 触发游戏背景介绍标签切换
function triggerGameIntroTab(tabName) {
    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetButton) {
        // 移除所有按钮的active类
        document.querySelectorAll('.intro-btn').forEach(btn => btn.classList.remove('active'));
        // 添加目标按钮的active类
        targetButton.classList.add('active');
        
        // 隐藏所有面板
        document.querySelectorAll('.intro-panel').forEach(panel => panel.classList.remove('active'));
        // 显示对应面板
        const targetPanel = document.querySelector(`[data-content="${tabName}"]`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }
}

// 滚动效果初始化
function initScrollEffects() {
    window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY;
        
        // 视差滚动效果
        applyParallaxEffect(scrollY);
        
        // 霓虹灯闪烁效果
        updateNeonEffects(scrollY);
        
        // 扫描线动态效果
        updateScanlines(scrollY);
        
    }, 16)); // 60fps
}

// 移动端菜单初始化
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            // 更新按钮图标
            this.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });
        
        // 点击导航链接后关闭移动端菜单
        document.querySelectorAll('.nav-link, .dropdown-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.textContent = '☰';
            });
        });
    }
}

// 开始游戏按钮初始化
function initStartGameButton() {
    const startGameBtn = document.getElementById('startGameBtn');
    const startGameFixed = document.getElementById('startGameFixed');
    
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            // 添加点击动画效果
            this.classList.add('clicked');
            
            // 启动游戏逻辑
            launchGame();
            
            // 移除动画类
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
        });
    }
    
    // 根据滚动位置显示/隐藏固定按钮
    window.addEventListener('scroll', throttle(() => {
        if (startGameFixed) {
            const scrollY = window.scrollY;
            const showButton = scrollY > window.innerHeight * 0.5;
            
            startGameFixed.style.opacity = showButton ? '1' : '0';
            startGameFixed.style.pointerEvents = showButton ? 'auto' : 'none';
        }
    }, 100));
}

// 粒子效果初始化
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 50,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ["#00d4ff", "#ff6b35", "#00ff9d"]
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00d4ff",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "repulse"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 100,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
}

// 滚动动画初始化
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-reveal');
                
                // 为子元素添加延迟动画
                const children = entry.target.querySelectorAll('.delay-animation');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate');
                    }, index * 200);
                });
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    document.querySelectorAll('section, .character-card, .ranking-item').forEach(el => {
        observer.observe(el);
    });
}

// 平滑滚动函数
function smoothScrollTo(element) {
    const targetPosition = element.offsetTop - 80; // 导航栏高度偏移
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;
    
    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    requestAnimationFrame(animation);
}

// 缓动函数
function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

// 更新激活的导航项
function updateActiveNav(targetId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${targetId}`) {
            link.classList.add('active');
        }
    });
    currentSection = targetId;
}

// 根据滚动位置更新导航
function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section, header');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.id;
        
        if (scrollPos >= top && scrollPos <= bottom) {
            updateActiveNav(id);
        }
    });
}

// 视差滚动效果
function applyParallaxEffect(scrollY) {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
    
    // 背景元素视差
    const backgrounds = document.querySelectorAll('.parallax-bg');
    backgrounds.forEach((bg, index) => {
        const speed = 0.5 + (index * 0.2);
        bg.style.transform = `translateY(${scrollY * speed}px)`;
    });
}

// 霓虹灯效果更新
function updateNeonEffects(scrollY) {
    const titles = document.querySelectorAll('.section-title');
    titles.forEach(title => {
        const rect = title.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            const intensity = Math.random() * 0.1;
            if (intensity > 0.08) {
                title.style.textShadow = 'none';
                setTimeout(() => {
                    title.style.textShadow = '';
                }, 50);
            }
        }
    });
}

// 扫描线效果更新
function updateScanlines(scrollY) {
    const scanlines = document.querySelector('.scan-overlay');
    if (scanlines) {
        const opacity = 0.03 + (Math.sin(scrollY * 0.01) * 0.02);
        scanlines.style.opacity = opacity;
    }
}

// 启动游戏函数
function launchGame() {
    // 这里将连接到实际的游戏逻辑
    console.log('启动绝区零吃豆人游戏...');
    
    // 保留你队友设计的炫酷启动动画
    createLaunchAnimation();
    
    // 在动画效果显示1.5秒后，执行页面跳转
    setTimeout(() => {
        // ▼▼▼ 这是唯一的、也是最关键的修改！▼▼▼
        window.location.href = 'index.php'; 
    }, 1500); // 1.5秒后跳转
}

// 创建启动动画
function createLaunchAnimation() {
    const launchEffect = document.createElement('div');
    launchEffect.className = 'launch-effect';
    launchEffect.innerHTML = `
        <div class="launch-text">
            <span>正在连接新艾利都...</span>
            <div class="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </div>
        </div>
    `;
    
    // 添加样式
    launchEffect.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: var(--primary-blue);
        font-size: 1.5rem;
        font-weight: 600;
    `;
    
    document.body.appendChild(launchEffect);
    
    // 1.5秒后移除效果
    setTimeout(() => {
        launchEffect.remove();
    }, 1500);
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数：检测移动设备
function isMobile() {
    return window.innerWidth <= 768;
}

// 工具函数：获取随机数
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('游戏界面错误:', e.error);
});

// 固定Logo初始化
function initFixedLogo() {
    const fixedLogo = document.getElementById('fixedLogo');
    const logoLink = fixedLogo?.querySelector('a');
    
    if (!fixedLogo || !logoLink) return;
    
    // 添加点击动画效果
    logoLink.addEventListener('click', function(e) {
        // 添加点击反馈动画
        const logoImage = this.querySelector('.logo-image');
        
        // 创建波纹效果
        createLogoRipple(e, this);
        
        // 点击缩放动画
        logoImage.style.transform = 'scale(0.95)';
        setTimeout(() => {
            logoImage.style.transform = '';
        }, 150);
        
        console.log('正在跳转至绝区零官方网站...');
    });
    
    // 鼠标进入时的额外效果
    logoLink.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    // 鼠标离开时恢复
    logoLink.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
    
    // 键盘可访问性支持
    logoLink.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
    
    // 添加logo的滚动视差效果（轻微）
    window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY;
        const parallaxOffset = scrollY * 0.02; // 很轻微的视差效果
        
        fixedLogo.style.transform = `translateY(${parallaxOffset}px)`;
    }, 16));
    
    console.log('固定Logo初始化完成');
}

// 创建Logo点击波纹效果
function createLogoRipple(event, element) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        animation: logoRipple 0.8s ease-out;
        z-index: 1;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 800);
}

// 添加Logo波纹动画CSS
function addLogoRippleCSS() {
    if (document.getElementById('logo-ripple-styles')) return;

    const style = document.createElement('style');
    style.id = 'logo-ripple-styles';
    style.textContent = `
        @keyframes logoRipple {
            0% {
                transform: scale(0);
                opacity: 0.8;
            }
            50% {
                opacity: 0.4;
            }
            100% {
                transform: scale(1);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// 页面加载时添加样式
document.addEventListener('DOMContentLoaded', addLogoRippleCSS);

// 页面卸载时清理
window.addEventListener('beforeunload', function() {
    console.log('正在退出绝区零吃豆人游戏界面...');
}); 