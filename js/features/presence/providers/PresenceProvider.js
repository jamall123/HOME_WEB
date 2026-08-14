/**
 * @file PresenceProvider.js
 * @purpose Base interface for presence providers.
 */

export class PresenceProvider {
    async updatePresence(courseId, userId, data) {
        throw new Error("Method not implemented.");
    }
    
    async deletePresence(courseId, userId) {
        throw new Error("Method not implemented.");
    }

    async updateActiveSession(courseId, userId, data) {
        throw new Error("Method not implemented.");
    }

    onActiveSessionSnapshot(courseId, userId, callback) {
        throw new Error("Method not implemented.");
    }

    async getActiveSessions(courseId) {
        throw new Error("Method not implemented.");
    }

    async getConnectedUsers(courseId) {
        throw new Error("Method not implemented.");
    }

    onPresenceSnapshot(courseId, callback) {
        throw new Error("Method not implemented.");
    }
}
