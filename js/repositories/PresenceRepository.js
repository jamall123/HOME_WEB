/**
 * @file PresenceRepository.js
 * @purpose Enterprise Data Layer for User Presence and Sessions.
 */

import { Constants } from '../core/Constants.js';
import { FirestorePresenceProvider } from '../features/presence/providers/FirestorePresenceProvider.js';
import { RTDBPresenceProvider } from '../features/presence/providers/RTDBPresenceProvider.js';

export class PresenceRepositoryClass {
    constructor() {
        this.provider = Constants.FEATURE_FLAGS.USE_RTDB_PRESENCE 
            ? new RTDBPresenceProvider() 
            : new FirestorePresenceProvider();
    }

    async updatePresence(courseId, userId, data) {
        return this.provider.updatePresence(courseId, userId, data);
    }

    async deletePresence(courseId, userId) {
        return this.provider.deletePresence(courseId, userId);
    }

    async updateActiveSession(courseId, userId, data) {
        return this.provider.updateActiveSession(courseId, userId, data);
    }

    onActiveSessionSnapshot(courseId, userId, callback) {
        return this.provider.onActiveSessionSnapshot(courseId, userId, callback);
    }

    async getActiveSessions(courseId) {
        return this.provider.getActiveSessions(courseId);
    }

    async getConnectedUsers(courseId) {
        return this.provider.getConnectedUsers(courseId);
    }

    onPresenceSnapshot(courseId, callback) {
        return this.provider.onPresenceSnapshot(courseId, callback);
    }
}

export const PresenceRepository = new PresenceRepositoryClass();
