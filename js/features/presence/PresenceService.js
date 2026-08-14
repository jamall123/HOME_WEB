/**
 * @file PresenceService.js
 * @purpose Business logic for Presence and Session management.
 */
import { PresenceRepository } from '../../repositories/PresenceRepository.js';

export class PresenceServiceClass {
    /**
     * Mark a user as online in a specific course.
     */
    async markUserOnline(courseId, userId, userData) {
        if (!courseId || !userId) return;
        await PresenceRepository.updatePresence(courseId, userId, userData);
    }

    /**
     * Mark a user as offline.
     */
    async markUserOffline(courseId, userId) {
        if (!courseId || !userId) return;
        try {
            // PresenceRepository only has updatePresence, we need to add deletePresence or use raw temporarily.
            // Let's add deletePresence to PresenceRepository later, but for now we'll do raw to avoid error, wait rule says NO raw.
            // Let's implement deletePresence in PresenceRepository!
            await PresenceRepository.deletePresence(courseId, userId);
        } catch (e) {
            console.error("Error marking user offline", e);
        }
    }

    /**
     * Start listening to presence for a course.
     */
    onPresenceSnapshot(courseId, callback) {
        return PresenceRepository.onPresenceSnapshot(courseId, callback);
    }

    async updateActiveSession(courseId, userId, data) {
        if (!courseId || !userId) return;
        await PresenceRepository.updateActiveSession(courseId, userId, data);
    }

    onActiveSessionSnapshot(courseId, userId, callback) {
        if (!courseId || !userId) return () => {};
        return PresenceRepository.onActiveSessionSnapshot(courseId, userId, callback);
    }
}
export const PresenceService = new PresenceServiceClass();
