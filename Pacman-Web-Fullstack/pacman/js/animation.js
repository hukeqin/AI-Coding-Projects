// 绝区零吃豆人游戏 - 动画效果模块

// 动画状态管理
const animationState = {
    isScrolling: false,
    lastScrollY: 0,
    scrollDirection: 'down',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// 初始化动画系统
function initAnimations() {
    setupScrollAnimations();
    setupIntersectionObserver();
    setupMouseAnimations();
    setupTextAnimations();
    setupLoadingAnimations();
    
    console.log('动画系统初始化完成');
}

// 设置滚动动画
function setupScrollAnimations() {
    let ticking = false;

    function updateScrollAnimations() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - animationState.lastScrollY;
        
        animationState.scrollDirection = scrollDelta > 0 ? 'down' : 'up';
        animationState.lastScrollY = currentScrollY;

        // 视差滚动效果
        applyParallaxEffects(currentScrollY);
        
        // 导航栏效果
        updateNavigationEffects(currentScrollY);
        
        // 背景颜色渐变
        updateBackgroundGradients(currentScrollY);

        // 标题图片滚动动画
        updateTitleImageAnimation(currentScrollY);

        ticking = false;
    }

    function requestScrollTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollAnimations);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestScrollTick, { passive: true });
}

// 视差滚动效果
function applyParallaxEffects(scrollY) {
    if (animationState.reducedMotion) return;

    // 英雄区域视差
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const parallaxSpeed = 0.3;
        heroContent.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
    }

    // 背景元素视差
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrollY * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });

    // 浮动元素
    const floatingElements = document.querySelectorAll('.float');
    floatingElements.forEach((element, index) => {
        const offset = Math.sin((scrollY * 0.001) + (index * 0.5)) * 10;
        element.style.transform = `translateY(${offset}px)`;
    });
}

// 更新导航栏效果
function updateNavigationEffects(scrollY) {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    if (scrollY > 100) {
        nav.classList.add('scrolled');
        
        // 添加模糊背景效果
        nav.style.backdropFilter = 'blur(15px)';
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        nav.classList.remove('scrolled');
        nav.style.backdropFilter = 'blur(10px)';
        nav.style.background = 'rgba(10, 10, 10, 0.8)';
    }
}

// 更新背景渐变
function updateBackgroundGradients(scrollY) {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && section.dataset.bgGradient) {
            const progress = Math.max(0, Math.min(1, 
                (window.innerHeight - rect.top) / window.innerHeight
            ));
            
            section.style.background = section.dataset.bgGradient
                .replace('{{progress}}', progress);
        }
    });
}

// 更新标题图片滚动动画
function updateTitleImageAnimation(scrollY) {
    const titleImage = document.getElementById('gameTitleImage');
    if (!titleImage) return;

    // 移动端简化动画
    const isMobile = window.innerWidth <= 768;
    
    const windowHeight = window.innerHeight;
    const heroSection = document.querySelector('.hero-section');
    const gameIntroSection = document.getElementById('game-intro');
    
    if (!heroSection || !gameIntroSection) return;

    // 获取英雄区域和下一个板块的位置
    const heroRect = heroSection.getBoundingClientRect();
    const introRect = gameIntroSection.getBoundingClientRect();
    
    // 计算滚动进度（0 = 在首页中心，1 = 完全离开英雄区域）
    const scrollProgress = Math.max(0, Math.min(1, scrollY / windowHeight));
    
    // 计算标题图片的变换
    let translateY = 0;
    let scale = 1;
    let opacity = 1;
    
    if (scrollY > 0) {
        // 向下滚动时的动画
        if (scrollProgress < 0.5) {
            // 前半段：轻微下沉
            translateY = scrollY * (isMobile ? 0.6 : 0.8);
            scale = isMobile ? 1 : (1 - (scrollProgress * 0.1));
            opacity = 1 - (scrollProgress * 0.3);
        } else {
            // 后半段：加速下沉并淡出
            const fadeProgress = (scrollProgress - 0.5) / 0.5;
            translateY = scrollY * (isMobile ? 0.8 : 1.2) + (fadeProgress * (isMobile ? 100 : 200));
            scale = isMobile ? 1 : (0.95 - (fadeProgress * 0.3));
            opacity = 0.7 - (fadeProgress * 0.7);
        }
    } else {
        // 向上滚动时回到中心位置
        translateY = 0;
        scale = 1;
        opacity = 1;
    }
    
    // 应用变换（移动端简化）
    if (isMobile) {
        titleImage.style.transform = `translateY(${translateY}px)`;
    } else {
        titleImage.style.transform = `translateY(${translateY}px) scale(${scale})`;
    }
    titleImage.style.opacity = opacity;
    
    // 在完全离开英雄区域时隐藏元素
    if (heroRect.bottom < 0) {
        titleImage.style.visibility = 'hidden';
    } else {
        titleImage.style.visibility = 'visible';
    }
}

// 设置交叉观察器动画
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-50px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const element = entry.target;
            const progress = entry.intersectionRatio;

            if (entry.isIntersecting) {
                // 添加进入动画
                element.classList.add('in-view');
                
                // 触发元素特定动画
                triggerElementAnimation(element, progress);
                
                // 为子元素添加延迟动画
                animateChildElements(element);
            } else {
                element.classList.remove('in-view');
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll(`
        .section-title,
        .character-card,
        .intro-btn,
        .ranking-tab,
        .panel-grid,
        .hero-description
    `);

    animatedElements.forEach(el => observer.observe(el));
}

// 触发元素动画
function triggerElementAnimation(element, progress) {
    if (animationState.reducedMotion) return;

    // 根据元素类型应用不同动画
    if (element.classList.contains('section-title')) {
        animateSectionTitle(element, progress);
    } else if (element.classList.contains('character-card')) {
        animateCharacterCard(element, progress);
    } else if (element.classList.contains('intro-btn')) {
        animateIntroButton(element, progress);
    }
}

// 标题动画
function animateSectionTitle(element, progress) {
    const scale = 0.8 + (progress * 0.2);
    const opacity = progress;
    
    element.style.transform = `scale(${scale})`;
    element.style.opacity = opacity;
    
    // 添加打字机效果 - 提高触发阈值，确保元素完全可见
    if (progress > 0.8 && !element.dataset.typewriterStarted) {
        startTypewriterEffect(element);
        element.dataset.typewriterStarted = 'true';
    }
}

// 角色卡片动画
function animateCharacterCard(element, progress) {
    const translateY = (1 - progress) * 50;
    const rotateY = (1 - progress) * 10;
    
    element.style.transform = `translateY(${translateY}px) rotateY(${rotateY}deg)`;
    element.style.opacity = progress;
}

// 介绍按钮动画
function animateIntroButton(element, progress) {
    const scale = 0.9 + (progress * 0.1);
    
    element.style.transform = `scale(${scale})`;
    element.style.opacity = progress;
}

// 子元素动画
function animateChildElements(parent) {
    const children = parent.querySelectorAll('.animate-child');
    
    children.forEach((child, index) => {
        setTimeout(() => {
            child.classList.add('animated');
        }, index * 200);
    });
}

// 设置鼠标动画
function setupMouseAnimations() {
    // 鼠标跟随光标
    createMouseCursor();
    
    // 悬停效果
    setupHoverEffects();
    
    // 点击波纹效果
    setupClickRipples();
}

// 创建自定义鼠标光标
function createMouseCursor() {
    if (animationState.reducedMotion || window.innerWidth <= 768) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, var(--primary-blue), var(--accent-orange));
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        mix-blend-mode: difference;
        transition: all 0.2s ease;
        opacity: 0;
    `;
    
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    // 平滑跟随动画
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// 设置悬停效果
function setupHoverEffects() {
    // 按钮悬停发光
    const buttons = document.querySelectorAll('button, .nav-link, .character-card');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!animationState.reducedMotion) {
                this.style.filter = 'brightness(1.2) drop-shadow(0 0 10px var(--primary-blue))';
                this.style.transform = 'translateY(-2px)';
            }
        });

        button.addEventListener('mouseleave', function() {
            this.style.filter = '';
            this.style.transform = '';
        });
    });
}

// 设置点击波纹效果
function setupClickRipples() {
    document.addEventListener('click', (e) => {
        if (animationState.reducedMotion) return;

        const target = e.target.closest('button, .character-card, .nav-link');
        if (!target) return;

        createRippleEffect(e, target);
    });
}

// 创建波纹效果
function createRippleEffect(event, element) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, var(--primary-blue) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
        opacity: 0.6;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// 设置文字动画
function setupTextAnimations() {
    // 设置打字机效果的CSS
    addTypewriterCSS();
    
    // 设置文字闪烁效果
    setupTextGlitch();
}

// 添加打字机CSS
function addTypewriterCSS() {
    if (document.getElementById('typewriter-styles')) return;

    const style = document.createElement('style');
    style.id = 'typewriter-styles';
    style.textContent = `
        @keyframes blinkCursor {
            0%, 50% { border-color: var(--primary-blue); }
            51%, 100% { border-color: transparent; }
        }
        
        @keyframes ripple {
            0% {
                transform: scale(0);
                opacity: 0.6;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .typewriter {
            border-right: 2px solid var(--primary-blue);
            animation: blinkCursor 1s step-end infinite;
        }
    `;
    
    document.head.appendChild(style);
}

// 启动打字机效果
function startTypewriterEffect(element) {
    if (animationState.reducedMotion) return;

    // 避免重复触发
    if (element.dataset.typewriterRunning === 'true') return;
    element.dataset.typewriterRunning = 'true';

    const text = element.textContent;
    element.textContent = '';
    element.classList.add('typewriter');
    
    let index = 0;
    function typeChar() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeChar, 150); // 降低速度，从100ms改为150ms
        } else {
            element.classList.remove('typewriter');
            element.dataset.typewriterRunning = 'false';
        }
    }
    
    typeChar();
}

// 设置文字故障效果
function setupTextGlitch() {
    const glitchElements = document.querySelectorAll('.glitch-text');
    
    glitchElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (!animationState.reducedMotion) {
                element.classList.add('glitch-active');
                
                setTimeout(() => {
                    element.classList.remove('glitch-active');
                }, 500);
            }
        });
    });
}

// 设置加载动画
function setupLoadingAnimations() {
    // 页面加载完成动画
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // 触发进入动画序列
        triggerEntranceAnimations();
    });
}

// 触发进入动画序列
function triggerEntranceAnimations() {
    const sequences = [
        { selector: '.hero-title', delay: 500 },
        { selector: '.hero-subtitle', delay: 800 },
        { selector: '.hero-description', delay: 1100 },
        { selector: '.scroll-indicator', delay: 1400 }
    ];

    sequences.forEach(({ selector, delay }) => {
        setTimeout(() => {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('animate-in');
            }
        }, delay);
    });
}

// 创建性能友好的动画
function createOptimizedAnimation(element, keyframes, options) {
    if (animationState.reducedMotion) {
        // 对于减少动画偏好的用户，直接设置最终状态
        const finalFrame = keyframes[keyframes.length - 1];
        Object.assign(element.style, finalFrame);
        return;
    }

    // 使用Web Animations API
    if (element.animate) {
        return element.animate(keyframes, options);
    } else {
        // 降级到CSS动画
        console.warn('Web Animations API 不支持，使用CSS动画');
    }
}

// 导出模块函数
window.AnimationModule = {
    init: initAnimations,
    createRipple: createRippleEffect,
    typewriter: startTypewriterEffect,
    optimizedAnimate: createOptimizedAnimation,
    state: animationState
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initAnimations); 