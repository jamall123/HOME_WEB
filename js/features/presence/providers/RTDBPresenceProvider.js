/**
 * @file RTDBPresenceProvider.js
 */

import { PresenceProvider } from './PresenceProvider.js';
import { FirebaseManager } from '../../../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../../../core/ErrorHandler.js';

export class RTDBPresenceProvider extends PresenceProvider {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `RTDBPresenceProvider.${method}`);
        throw enhancedError;
    }

    async updatePresence(courseId, userId, data) {
        try {
            const db = window.firebase.database();
            const ref = db.ref(`presence/courses/${courseId}/connected_users/${userId}`);
            
            const payload = {
                ...data,
                lastSeen: window.firebase.database.ServerValue.TIMESTAMP
            };
            
            // Setup onDisconnect to automatically delete presence when client disconnects
            await ref.onDisconnect().remove();
            
            await ref.update(payload);
        } catch (error) {
            this._handleError(error, 'updatePresence');
        }
    }

    async deletePresence(courseId, userId) {
        try {
            const db = window.firebase.database();
            const ref = db.ref(`presence/courses/${courseId}/connected_users/${userId}`);
            
            // Cancel onDisconnect since we are manually deleting
            await ref.onDisconnect().cancel();
            
            await ref.remove();
        } catch (error) {
            this._handleError(error, 'deletePresence');
        }
    }

    async updateActiveSession(courseId, userId, data) {
        try {
            const db = window.firebase.database();
            const ref = db.ref(`presence/activeSessions/${courseId}_${userId}`);
            
            const payload = {
                ...data,
                lastSeen: window.firebase.database.ServerValue.TIMESTAMP
            };
            
            await ref.onDisconnect().remove();
            await ref.update(payload);
        } catch (error) {
            this._handleError(error, 'updateActiveSession');
        }
    }

    onActiveSessionSnapshot(courseId, userId, callback) {
        try {
            const db = window.firebase.database();
            const ref = db.ref(`presence/activeSessions/${courseId}_${userId}`);
            
            const listener = ref.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    callback({ id: `${courseId}_${userId}`, ...snapshot.val() });
                } else {
                    callback(null);
                }
            }, (error) => {
                this._handleError(error, 'onActiveSessionSnapshot');
            });
            
            return () => ref.off('value', listener);
        } catch (error) {
            this._handleError(error, 'onActiveSessionSnapshot');
        }
    }

    async getActiveSessions(courseId) {
        try {
            const db = window.firebase.database();
            // In RTDB, we can't easily query where('courseId', '==', courseId) across all keys 
            // easily if we format keys as `courseId_userId`. 
            // Let's iterate or filter client-side for simplicity, or change structure.
            // Since this is for a specific course, we could store it under `presence/activeSessions/{courseId}/{userId}`
            // Let's do that for better querying:
            const ref = db.ref(`presence/activeSessions_by_course/${courseId}`);
            const snapshot = await ref.once('value');
            if (!snapshot.exists()) return [];
            
            const sessions = [];
            snapshot.forEach((childSnapshot) => {
                sessions.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            return sessions;
        } catch (error) {
            this._handleError(error, 'getActiveSessions');
            return [];
        }
    }

    async getConnectedUsers(courseId) {
        try {
            const db = window.firebase.database();
            const ref = db.ref(`presence/courses/${courseId}/connected_users`);
            const snapshot = await ref.once('value');
            if (!snapshot.exists()) return [];
            
            const users = [];
            snapshot.forEach((childSnapshot) => {
                users.push(childSnapshot.val());
            });
            return users;
        } catch (error) {
            this._handleError(error, 'getConnectedUsers');
            return [];
        }
    }

    onPresenceSnapshot(courseId, callback) {
        try {
            const db = window.firebase.database();
            const ref = db.ref(`presence/courses/${courseId}/connected_users`);
            
            const listener = ref.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    const users = [];
                    snapshot.forEach((childSnapshot) => {
                        users.push({ id: childSnapshot.key, ...childSnapshot.val() });
                    });
                    callback(users);
                } else {
                    callback([]);
                }
            }, (error) => {
                this._handleError(error, 'onPresenceSnapshot');
            });
            
            return () => ref.off('value', listener);
        } catch (error) {
            this._handleError(error, 'onPresenceSnapshot');
        }
    }
}
