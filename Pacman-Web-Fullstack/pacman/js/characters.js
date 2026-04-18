// 角色选单交互功能

class CharacterSelector {
    constructor() {
        this.currentFactionIndex = 0;
        this.factionItems = [];
        this.factionCharacters = [];
        this.carousel = null;
        this.charactersPreview = null;
        this.charactersSection = null;
        
        // 阵营背景图片映射
        this.factionBackgrounds = {
            'jtw': 'images/character/wallpaper/jtw.png',
            'kldz': 'images/character/wallpaper/kldzz.png',
            'xztqz': 'images/character/wallpaper/xztqz.png',
            'hsos': 'images/character/wallpaper/dklk.png',
            'bqzg': 'images/character/wallpaper/bqzg.png',
            'wdlyjz': 'images/character/wallpaper/wdlyjz.png'
        };
        
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
        
        // 添加滚动监听来控制组件可见性
        this.setupScrollVisibility();
    }

    setupElements() {
        // 获取DOM元素
        this.carousel = document.getElementById('factionCarousel');
        this.charactersPreview = document.getElementById('charactersPreview');
        this.charactersSection = document.querySelector('.characters-section');
        this.factionItems = Array.from(document.querySelectorAll('.faction-item'));
        this.factionCharacters = Array.from(document.querySelectorAll('.faction-characters'));
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化显示第一个阵营
        this.showFactionCharacters(0);
        
        // 预加载所有背景图片
        this.preloadBackgroundImages();
        
        // 延迟一下再更新选择器状态，确保DOM完全渲染
        setTimeout(() => {
            this.updateFactionSelector();
            this.updateBackground(); // 初始化背景
        }, 100);
    }

    bindEvents() {
        // 阵营项目点击事件
        this.factionItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectFaction(index);
            });
        });

        // 转盘导航按钮
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.moveToPrevious());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.moveToNext());
        }

        // 角色头像点击事件（为将来的详情页预留）
        const characterItems = document.querySelectorAll('.character-avatar-item');
        characterItems.forEach(item => {
            item.addEventListener('click', () => {
                const characterId = item.dataset.character;
                this.selectCharacter(characterId);
            });
        });

        // 键盘导航支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                this.moveToPrevious();
            } else if (e.key === 'ArrowDown') {
                this.moveToNext();
            }
        });

        // 触摸滑动支持
        this.setupTouchNavigation();
    }

    selectFaction(index) {
        if (index === this.currentFactionIndex) {
            // 如果点击的是当前阵营，平滑滚动到角色预览区域
            this.scrollToCharacters();
            return;
        }

        this.currentFactionIndex = index;
        
        // 更新阵营选择器状态
        this.updateFactionSelector();
        
        // 更新背景图片
        this.updateBackground();
        
        // 显示对应的角色
        this.showFactionCharacters(index);
        
        // 等待阵营选择器滚动完成后再滚动到角色预览区域
        const isMobile = window.innerWidth <= 768;
        const delay = isMobile ? 100 : 400; // 移动端减少延迟
        
        setTimeout(() => {
            this.scrollToCharacters();
        }, delay);
    }

    updateFactionSelector() {
        // 移除所有active状态
        this.factionItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加当前选中的active状态
        if (this.factionItems[this.currentFactionIndex]) {
            this.factionItems[this.currentFactionIndex].classList.add('active');
        }
        
        // 滚动到选中的阵营，使其居中显示
        this.scrollToActiveFaction();
    }

    showFactionCharacters(index) {
        // 隐藏所有角色组
        this.factionCharacters.forEach(group => {
            group.classList.remove('active');
        });
        
        // 显示选中的角色组
        if (this.factionCharacters[index]) {
            // 由于现在使用绝对定位，可以立即显示
            this.factionCharacters[index].classList.add('active');
        }
    }

    preloadBackgroundImages() {
        // 预加载所有背景图片，确保切换时没有延迟
        Object.values(this.factionBackgrounds).forEach(imagePath => {
            const img = new Image();
            img.src = imagePath;
        });
    }

    updateBackground() {
        if (!this.charactersSection || !this.factionItems[this.currentFactionIndex]) {
            return;
        }
        
        // 获取当前选中阵营的标识
        const currentFaction = this.factionItems[this.currentFactionIndex].dataset.faction;
        
        // 获取对应的背景图片路径
        const backgroundPath = this.factionBackgrounds[currentFaction];
        
        if (backgroundPath) {
            // 创建样式规则来更新背景图片
            const styleId = 'faction-background-style';
            let styleElement = document.getElementById(styleId);
            
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            
            // 更新CSS规则，移动端和PC端都能切换背景
            styleElement.textContent = `
                .characters-section::before {
                    background-image: url('${backgroundPath}') !important;
                }
            `;
        }
    }

    moveToPrevious() {
        const newIndex = (this.currentFactionIndex - 1 + this.factionItems.length) % this.factionItems.length;
        this.selectFaction(newIndex);
    }

    moveToNext() {
        const newIndex = (this.currentFactionIndex + 1) % this.factionItems.length;
        this.selectFaction(newIndex);
    }

    scrollToActiveFaction() {
        const activeItem = this.factionItems[this.currentFactionIndex];
        if (activeItem && this.carousel) {
            const isMobile = window.innerWidth <= 768;
            const carouselRect = this.carousel.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            
            if (isMobile) {
                // 移动端使用水平滚动
                const targetScrollLeft = this.carousel.scrollLeft + 
                    (itemRect.left + itemRect.width / 2) - 
                    (carouselRect.left + carouselRect.width / 2);
                
                this.carousel.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth'
                });
            } else {
                // 桌面端使用垂直滚动
                const targetScrollTop = this.carousel.scrollTop + 
                    (itemRect.top + itemRect.height / 2) - 
                    (carouselRect.top + carouselRect.height / 2);
                
                this.carousel.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            }
        }
    }

    scrollToCharacters() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 移动端不需要特殊的滚动处理，因为使用了relative定位
            return;
        }
        
        // PC端保持原有的滚动逻辑
        const activeFactionCharacters = document.querySelector('.faction-characters.active');
        
        if (activeFactionCharacters) {
            // 找到这个组中的角色头像卡片
            const characterCards = activeFactionCharacters.querySelectorAll('.character-avatar-item');
            
            if (characterCards.length > 0) {
                // 获取最后一个角色卡片的位置（用于确定整行的底部）
                const lastCard = characterCards[characterCards.length - 1];
                const rect = lastCard.getBoundingClientRect();
                const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                
                // 计算角色卡片的底部位置（相对于文档）
                const cardsBottom = currentScrollTop + rect.bottom;
                
                // 5-8px的偏移量（我们取6px作为中间值）
                const offset = 6;
                
                // 计算让角色卡片底部往下offset像素位于视窗底部的滚动位置
                // 这样角色卡片完全可见，底部稍微超出视窗一点点
                const targetScrollTop = cardsBottom + offset - windowHeight;
                
                window.scrollTo({
                    top: Math.max(0, targetScrollTop), // 确保不会滚动到负数位置
                    behavior: 'smooth'
                });
            }
        }
    }

    selectCharacter(characterId) {
        // 为将来的角色详情功能预留
        console.log(`选择角色: ${characterId}`);
        
        // 添加选择效果
        const characterItems = document.querySelectorAll('.character-avatar-item');
        characterItems.forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-character="${characterId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            
            // 添加一个临时的选择动画
            selectedItem.style.transform = 'scale(0.95)';
            setTimeout(() => {
                selectedItem.style.transform = '';
            }, 150);
        }
    }

    setupTouchNavigation() {
        this.startX = 0;
        this.endX = 0;
        this.startY = 0;
        this.endY = 0;
        
        if (this.carousel) {
            this.carousel.addEventListener('touchstart', (e) => {
                this.startX = e.touches[0].clientX;
                this.startY = e.touches[0].clientY;
            });
            
            this.carousel.addEventListener('touchend', (e) => {
                this.endX = e.changedTouches[0].clientX;
                this.endY = e.changedTouches[0].clientY;
                this.handleSwipe();
            });
        }
    }

    handleSwipe() {
        const threshold = 50; // 最小滑动距离
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 移动端使用水平滑动
            const diff = this.startX - this.endX;
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // 向左滑动，显示下一个
                    this.moveToNext();
                } else {
                    // 向右滑动，显示上一个
                    this.moveToPrevious();
                }
            }
        } else {
            // 桌面端使用垂直滑动
            const diff = this.startY - this.endY;
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // 向上滑动，显示下一个
                    this.moveToNext();
                } else {
                    // 向下滑动，显示上一个
                    this.moveToPrevious();
                }
            }
        }
    }

    // 获取阵营信息的方法
    getFactionInfo(factionKey) {
        const factionData = {
            'jtw': {
                name: '狡兔屋',
                description: '作为新艾利都的老牌代理人事务所，狡兔屋以其专业的服务和可靠的成员著称。',
                characters: ['ab', 'nk', 'bl', 'mgyn']
            },
            'kldz': {
                name: '卡吕冬之子',
                description: '卡吕冬之子是一个神秘而强大的组织，拥有众多实力超群的代理人。',
                characters: ['bkn', 'lt', 'bns', 'ksj', 'pp', 'lx']
            },
            'xztqz': {
                name: '刑侦特勤组',
                description: '负责维护新艾利都治安的特殊部队，成员都是精英中的精英。',
                characters: ['ss', 'qy', 'zy']
            },
            'hsos': {
                name: '对空六课',
                description: '专门对付空洞威胁的特殊部门，拥有先进的装备和训练有素的人员。',
                characters: ['qyyz', 'ycl', 'xjy', 'cj']
            },
            'bqzg': {
                name: '白祇重工',
                description: '新艾利都的工业巨头，在机械和工程技术方面有着深厚的底蕴。',
                characters: ['gls', 'b', 'ad', 'kld']
            },
            'wdlyjz': {
                name: '维多利亚家政',
                description: '提供高端家政服务的精英组织，成员都具备多项专业技能。',
                characters: ['alq', 'ln', 'lka', 'kl']
            }
        };
        
        return factionData[factionKey] || null;
    }

    setupScrollVisibility() {
        // 控制阵营转盘和角色预览的可见性
        const checkVisibility = () => {
            if (!this.charactersSection || !this.carousel || !this.charactersPreview) return;
            
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // 移动端始终显示组件（因为使用了relative定位）
                this.carousel.parentElement.style.opacity = '1';
                this.carousel.parentElement.style.visibility = 'visible';
                this.charactersPreview.style.opacity = '1';
                this.charactersPreview.style.visibility = 'visible';
            } else {
                // PC端保持原有的滚动控制逻辑
                const rect = this.charactersSection.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // 当角色选单区域进入视窗时显示组件
                const isVisible = rect.top < windowHeight && rect.bottom > 0;
                
                if (isVisible) {
                    this.carousel.parentElement.style.opacity = '1';
                    this.carousel.parentElement.style.visibility = 'visible';
                    this.charactersPreview.style.opacity = '1';
                    this.charactersPreview.style.visibility = 'visible';
                } else {
                    this.carousel.parentElement.style.opacity = '0';
                    this.carousel.parentElement.style.visibility = 'hidden';
                    this.charactersPreview.style.opacity = '0';
                    this.charactersPreview.style.visibility = 'hidden';
                }
            }
        };
        
        // 初始检查
        checkVisibility();
        
        // 监听滚动事件
        window.addEventListener('scroll', checkVisibility);
        
        // 监听窗口大小改变
        window.addEventListener('resize', checkVisibility);
    }
}

// 页面加载完成后初始化角色选择器
let characterSelector;

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    characterSelector = new CharacterSelector();
});

// 如果DOM已经加载完成，立即初始化
if (document.readyState !== 'loading') {
    characterSelector = new CharacterSelector();
}

// 导出给其他模块使用
window.CharacterSelector = CharacterSelector; 