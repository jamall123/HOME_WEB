import { eventBus } from '../core/EventBus.js';
import { stateStore } from '../core/StateStore.js';
import { navigationManager } from '../core/NavigationManager.js';

export class EnterpriseHeader {
    constructor(container) {
        this.container = container;
    }

    mount() {
        this.container.innerHTML = `
            <header class="enterprise-header">
                <div class="header-left">
                    <div class="breadcrumbs" id="header-breadcrumbs">
                        <span>لوحة التحكم</span>
                    </div>
                </div>
                <div class="header-center">
                    <div class="global-search">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="ابحث عن دورات، طلاب، إيصالات (قريباً)...">
                        <span class="shortcut">Ctrl+K</span>
                    </div>
                </div>
                <div class="header-right">
                    <button class="btn-icon"><i class="fas fa-bell"></i></button>
                    <button class="btn-icon" id="btn-theme-toggle"><i class="fas fa-moon"></i></button>
                    <div class="header-user-menu">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=1E293B&color=A5B4FC" alt="User">
                    </div>
                </div>
            </header>
        `;
        this.bindEvents();
    }

    bindEvents() {
        eventBus.on('route:changed', (route) => {
            this.updateBreadcrumbs(route);
        });

        const themeBtn = this.container.querySelector('#btn-theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const isDark = stateStore.get('theme') === 'dark';
                const newTheme = isDark ? 'light' : 'dark';
                stateStore.set('theme', newTheme);
                themeBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
                document.body.setAttribute('data-theme', newTheme);
            });
        }
    }

    updateBreadcrumbs(route) {
        const breadcrumbsContainer = this.container.querySelector('#header-breadcrumbs');
        if (!breadcrumbsContainer) return;

        let foundGroup = '';
        let foundTitle = '';

        const registry = navigationManager.getRegistry();
        registry.forEach(group => {
            const item = group.items.find(i => i.route === route);
            if (item) {
                foundGroup = group.group;
                foundTitle = item.title;
            }
        });

        if (foundTitle) {
            breadcrumbsContainer.innerHTML = `
                <span class="text-muted">${foundGroup}</span>
                <i class="fas fa-chevron-left separator"></i>
                <span class="active-route">${foundTitle}</span>
            `;
        }
    }
}
