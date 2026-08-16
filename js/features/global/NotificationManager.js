/**
 * NotificationManager.js
 * Centralized notification system replacing native alerts.
 */

export const NotificationManager = {
    init() {
        // Create container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        this.container = document.getElementById('notification-container');
    },

    async requestBrowserPermission() {
        if (!("Notification" in window)) {
            console.warn("This browser does not support desktop notification");
            return false;
        }
        
        if (Notification.permission === "granted") {
            return true;
        }
        
        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        }
        
        return false;
    },

    showBrowserNotification(title, options = {}) {
        if (!("Notification" in window)) return;
        
        if (Notification.permission === "granted") {
            const notification = new Notification(title, {
                icon: '/images/logo.png', // Assuming a logo exists, or it will fallback
                ...options
            });
            
            notification.onclick = function() {
                window.focus();
                this.close();
            };
        }
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        // Cap concurrent notifications to 5
        const currentToasts = this.container.querySelectorAll('.toast');
        if (currentToasts.length >= 5) {
            currentToasts[0].remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-fade`;
        
        // Colors based on type
        const colors = {
            success: 'var(--success, #10B981)',
            error: 'var(--error, #EF4444)',
            warning: 'var(--warning, #F59E0B)',
            info: 'var(--primary-color, #3B82F6)'
        };
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.style.cssText = `
            background: rgba(10, 12, 20, 0.95);
            border-left: 4px solid ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            min-width: 250px;
            font-family: var(--font-ar);
            position: relative;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas ${icons[type]}" style="color: ${colors[type]};"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close-btn" style="background: none; border: none; color: #ccc; cursor: pointer; padding: 0 5px; font-size: 16px;">&times;</button>
        `;

        this.container.appendChild(toast);

        let timeoutId;

        const dismiss = () => {
            if (timeoutId) clearTimeout(timeoutId);
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        };

        // Add dismiss mechanism
        const closeBtn = toast.querySelector('.toast-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', dismiss);
        }

        timeoutId = setTimeout(dismiss, duration);
    }
};
