import { stateStore } from './StateStore.js';

export class PermissionManager {
    static canAccess(routeOrAction) {
        const user = stateStore.get('user');
        if (!user) return false;
        
        // Temporarily, if user has 'instructor', restrict access to some routes
        if (user.role === 'instructor') {
            const allowedForInstructor = ['dashboard', 'courses', 'requests', 'users'];
            if (!allowedForInstructor.includes(routeOrAction)) {
                return false;
            }
        }
        
        // Admin gets everything
        return true;
    }

    static filterNavigation(navItems) {
        return navItems.filter(item => {
            if (item.children) {
                item.children = this.filterNavigation(item.children);
                return item.children.length > 0;
            }
            if (item.requiresAdmin && stateStore.get('user')?.role !== 'admin') {
                return false;
            }
            return this.canAccess(item.id);
        });
    }
}
