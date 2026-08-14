/**
 * @file FirestorePresenceProvider.js
 */

import { PresenceProvider } from './PresenceProvider.js';
import { FirebaseManager } from '../../../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../../../core/ErrorHandler.js';
import { Constants } from '../../../core/Constants.js';

export class FirestorePresenceProvider extends PresenceProvider {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `FirestorePresenceProvider.${method}`);
        throw enhancedError;
    }

    async updatePresence(courseId, userId, data) {
        try {
            const db = FirebaseManager.getFirestore();
            const payload = {
                ...data,
                lastSeen: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            };
            await db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.CONNECTED_USERS).doc(userId).set(payload, { merge: true });
        } catch (error) {
            this._handleError(error, 'updatePresence');
        }
    }

    async deletePresence(courseId, userId) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.CONNECTED_USERS).doc(userId).delete();
        } catch (error) {
            this._handleError(error, 'deletePresence');
        }
    }

    async updateActiveSession(courseId, userId, data) {
        try {
            const db = FirebaseManager.getFirestore();
            const payload = {
                ...data,
                lastSeen: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            };
            await db.collection('activeSessions').doc(`${courseId}_${userId}`).set(payload, { merge: true });
        } catch (error) {
            this._handleError(error, 'updateActiveSession');
        }
    }

    onActiveSessionSnapshot(courseId, userId, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection('activeSessions').doc(`${courseId}_${userId}`)
                .onSnapshot(doc => {
                    if (doc.exists) {
                        callback({ id: doc.id, ...doc.data() });
                    } else {
                        callback(null);
                    }
                }, error => {
                    this._handleError(error, 'onActiveSessionSnapshot');
                });
        } catch (error) {
            this._handleError(error, 'onActiveSessionSnapshot');
        }
    }

    async getActiveSessions(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).where('courseId', '==', courseId).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getActiveSessions');
        }
    }

    async getConnectedUsers(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.CONNECTED_USERS).get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            this._handleError(error, 'getConnectedUsers');
        }
    }

    onPresenceSnapshot(courseId, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.CONNECTED_USERS)
                .onSnapshot(snapshot => {
                    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, error => {
                    this._handleError(error, 'onPresenceSnapshot');
                });
        } catch (error) {
            this._handleError(error, 'onPresenceSnapshot');
        }
    }
}
