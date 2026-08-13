import { stateStore } from './StateStore.js';
import { Constants } from './Constants.js';

export class PermissionManager {
    static getCurrentUser() {
        return stateStore.getState('user') || null;
    }

    static getUserRole(user = null) {
        const u = user || this.getCurrentUser();
        return u?.role || null;
    }

    static hasRole(roles, user = null) {
        const role = this.getUserRole(user);
        if (!role) return false;
        if (!Array.isArray(roles)) {
            roles = [roles];
        }
        return roles.map(r => r.toLowerCase()).includes(role.toLowerCase());
    }

    static isAdmin(user = null) {
        return this.hasRole(Constants.ROLES.ADMIN, user);
    }

    static isInstructor(user = null) {
        return this.hasRole(Constants.ROLES.INSTRUCTOR, user);
    }

    static isSupervisor(user = null) {
        return this.hasRole(Constants.ROLES.SUPERVISOR, user);
    }

    static isStudent(user = null) {
        return this.hasRole(Constants.ROLES.STUDENT, user);
    }

    // Role grouping that was scattered across files:
    // ['instructor', 'admin', 'supervisor']
    static isTeachingStaff(user = null) {
        return this.hasRole([
            Constants.ROLES.ADMIN,
            Constants.ROLES.INSTRUCTOR,
            Constants.ROLES.SUPERVISOR
        ], user);
    }

    static canAccess(routeOrAction) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // Admin gets everything
        if (this.isAdmin(user)) return true;

        if (this.isTeachingStaff(user)) {
            const allowedForInstructor = ['dashboard', 'courses', 'requests', 'users'];
            if (allowedForInstructor.includes(routeOrAction)) {
                return true;
            }
        }
        
        return false;
    }

    static filterNavigation(navItems) {
        return navItems.filter(item => {
            if (item.children) {
                item.children = this.filterNavigation(item.children);
                return item.children.length > 0;
            }
            if (item.requiresAdmin && !this.isAdmin()) {
                return false;
            }
            return this.canAccess(item.id);
        });
    }
}
