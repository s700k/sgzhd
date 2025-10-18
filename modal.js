class AnnouncementModal {
    constructor(options = {}) {
        // 默认配置
        this.defaults = {
            modalId: 'announcementModal',
            closeBtnId: 'closeModalBtn',
            contentId: 'announcementContent',
            storageKey: 'announcementClosed',
            contentUrl: 'announcement.html',
            autoCloseDelay: 0,
            width: '600px',
            height: 'auto',
            position: 'center',
            animation: 'fadeIn',
            showOncePerSession: true
        };
        
        // 合并配置
        this.config = {...this.defaults, ...options};
        
        // 初始化
        this.init();
    }
    
    async init() {
        // 获取DOM元素
        this.modal = document.getElementById(this.config.modalId);
        this.closeBtn = document.getElementById(this.config.closeBtnId);
        
        // 检查是否应该显示
        if (this.shouldShow()) {
            // 应用样式配置
            this.applyStyles();
            
            // 加载内容
            await this.loadContent();
            
            // 显示弹窗
            this.show();
            
            // 绑定事件
            this.bindEvents();
            
            // 设置自动关闭
            this.setAutoClose();
        }
    }
    
    shouldShow() {
        if (this.config.showOncePerSession) {
            return !sessionStorage.getItem(this.config.storageKey);
        }
        return !localStorage.getItem(this.config.storageKey);
    }
    
    applyStyles() {
        const content = this.modal.querySelector('.modal-content');
        content.style.width = this.config.width;
        content.style.height = this.config.height;
        content.style.animationName = this.config.animation;
        
        // 位置配置
        if (this.config.position !== 'center') {
            this.modal.style.alignItems = this.getPositionValue();
        }
    }
    
    getPositionValue() {
        const positions = {
            'top': 'flex-start',
            'bottom': 'flex-end',
            'left': 'flex-start',
            'right': 'flex-end'
        };
        return positions[this.config.position] || 'center';
    }
    
    async loadContent() {
        try {
            const response = await fetch(this.config.contentUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const html = await response.text();
            document.getElementById(this.config.contentId).innerHTML = html;
        } catch (error) {
            console.error('加载公告内容失败:', error);
            document.getElementById(this.config.contentId).innerHTML = 
                '<p>公告加载失败，请稍后再试或联系管理员。</p>';
        }
    }
    
    show() {
        this.modal.style.opacity = '1';
        this.modal.style.visibility = 'visible';
    }
    
    hide() {
        this.modal.style.opacity = '0';
        this.modal.style.visibility = 'hidden';
        
        // 存储关闭状态
        if (this.config.showOncePerSession) {
            sessionStorage.setItem(this.config.storageKey, 'true');
        } else {
            localStorage.setItem(this.config.storageKey, 'true');
        }
    }
    
    bindEvents() {
        // 关闭按钮事件
        this.closeBtn.addEventListener('click', () => this.hide());
        
        // 点击遮罩层关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }
    
    setAutoClose() {
        if (this.config.autoCloseDelay > 0) {
            setTimeout(() => this.hide(), this.config.autoCloseDelay);
        }
    }
}

// 使用示例
document.addEventListener('DOMContentLoaded', () => {
    new AnnouncementModal({
        autoCloseDelay: 10000, // 10秒后自动关闭
        width: '700px',
        position: 'center',
        animation: 'fadeIn',
        showOncePerSession: false // 每次会话只显示一次
    });
});