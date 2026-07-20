import { eventBus } from './EventBus.js';
import { stateStore } from './StateStore.js';
import { PermissionManager } from './PermissionManager.js';

export class Router {
    constructor() {
        this.currentRoute = null;
        this.defaultRoute = 'dashboard';
        
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
    }

    init() {
        let hash = window.location.hash.replace('#', '');
        if (!hash) {
            hash = this.defaultRoute;
            window.history.replaceState(null, null, `#${hash}`);
        }
        this.navigate(hash);
    }

    navigate(route) {
        if (!route) route = this.defaultRoute;
        
        // Check permissions
        if (!PermissionManager.canAccess(route)) {
            console.warn(`Access denied to route: ${route}`);
            eventBus.emit('notification:show', { type: 'error', message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة.' });
            return;
        }

        if (this.currentRoute === route) return;
        
        this.currentRoute = route;
        stateStore.set('currentRoute', route);
        
        // Update URL hash without triggering hashchange again
        if (window.location.hash !== `#${route}`) {
            window.history.pushState(null, null, `#${route}`);
        }
        
        eventBus.emit('route:changed', route);
    }

    handleHashChange() {
        const hash = window.location.hash.replace('#', '');
        this.navigate(hash);
    }
}

export const router = new Router();
