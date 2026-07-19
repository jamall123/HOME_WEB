/**
 * PermissionEngine.js
 * Decouples authorization from roles to granular permissions.
 */

import { StateStore } from './StateStore.js';
import { Repository } from './Repository.js';

export const PermissionEngine = {

    /**
     * Core permission check based on Global Identity claims
     */
    hasPermission(permissionName) {
        const permissions = StateStore.getState('permissions') || [];
        return permissions.includes(permissionName) || permissions.includes('admin_super');
    },

    /**
     * Validates if the current user has access to a specific course room.
     * Evaluates the 'enrollments' collection directly.
     */
    async canJoinCourse(courseId) {
        const user = StateStore.getState('user');
        if (!user) return false;

        if (this.hasPermission('admin_super')) return true;

        try {
            const enrollment = await Repository.getEnrollment(user.uid, courseId);
            return enrollment && enrollment.status === 'approved';
        } catch (e) {
            return false;
        }
    },

    /**
     * Validates if the user is the instructor assigned to the course.
     */
    async canBroadcast(courseId) {
        const user = StateStore.getState('user');
        if (!user) return false;
        if (this.hasPermission('admin_super')) return true;

        try {
            const enrollment = await Repository.getEnrollment(user.uid, courseId);
            return enrollment && enrollment.role === 'instructor';
        } catch (e) {
            return false;
        }
    }
};
