import { eventBus } from '../core/EventBus.js';
import { navigationManager } from '../core/NavigationManager.js';
import { PermissionManager } from '../core/PermissionManager.js';
import { stateStore } from '../core/StateStore.js';

export class EnterpriseSidebar {
    constructor(container) {
        this.container = container;
        this.registry = [];
    }

    mount() {
        this.container.innerHTML = `
            <aside class="enterprise-sidebar">
                <div class="sidebar-header">
                    <h2 class="sidebar-logo">Jhome <span class="accent">OS</span></h2>
                    <button class="btn-icon sidebar-toggle" id="btn-toggle-sidebar"><i class="fas fa-bars"></i></button>
                </div>
                <nav class="sidebar-nav" id="sidebar-nav-container"></nav>
                <div class="sidebar-footer">
                    <div class="user-profile-badge">
                        <div class="avatar"><i class="fas fa-user-shield"></i></div>
                        <div class="user-info">
                            <span class="user-name" id="sidebar-user-name">مدير النظام</span>
                            <span class="user-role" id="sidebar-user-role">Admin</span>
                        </div>
                    </div>
                </div>
            </aside>
        `;
        this.navContainer = this.container.querySelector('#sidebar-nav-container');
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        eventBus.on('navigation:updated', (registry) => {
            this.registry = registry;
            this.render();
        });
        
        eventBus.on('route:changed', (route) => {
            this.updateActiveState(route);
        });

        eventBus.on('state:user', (user) => {
            if (user) {
                const nameEl = this.container.querySelector('#sidebar-user-name');
                const roleEl = this.container.querySelector('#sidebar-user-role');
                if (nameEl) nameEl.textContent = user.fullName || user.fullname || user.name || user.displayName || 'مدير النظام';
                if (roleEl) roleEl.textContent = user.role || 'Admin';
            }
            this.render(); // Re-render to apply permissions
        });

        const toggleBtn = this.container.querySelector('#btn-toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const collapsed = !stateStore.getState('sidebarCollapsed');
                stateStore.setState({ sidebarCollapsed: collapsed });
                this.container.querySelector('.enterprise-sidebar').classList.toggle('collapsed', collapsed);
            });
        }
        
        this.registry = navigationManager.getRegistry();
    }

    render() {
        if (!this.navContainer) return;
        this.navContainer.innerHTML = '';

        this.registry.forEach(group => {
            // Filter items by permission
            const allowedItems = PermissionManager.filterNavigation(group.items);
            if (allowedItems.length === 0) return;

            const groupEl = document.createElement('div');
            groupEl.className = 'nav-group';
            
            const groupTitle = document.createElement('div');
            groupTitle.className = 'nav-group-title';
            groupTitle.textContent = group.group;
            groupEl.appendChild(groupTitle);

            allowedItems.forEach(item => {
                const link = document.createElement('a');
                link.href = `#${item.route}`;
                link.className = 'nav-link';
                link.dataset.route = item.route;
                link.innerHTML = `
                    <i class="${item.icon}"></i>
                    <span class="nav-text">${item.title}</span>
                `;
                groupEl.appendChild(link);
            });

            this.navContainer.appendChild(groupEl);
        });

        this.updateActiveState(stateStore.getState('currentRoute'));
    }

    updateActiveState(route) {
        if (!this.navContainer) return;
        const links = this.navContainer.querySelectorAll('.nav-link');
        links.forEach(link => {
            if (link.dataset.route === route) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}
