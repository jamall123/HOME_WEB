/**
 * @file RoomRepository.js
 * @purpose Enterprise Data Layer for Active Sessions and Rooms.
 * @responsibilities
 *  - Manage active sessions state (isLive, mode, layout, slides, audio stream).
 *  - Expose Firebase Realtime Database / Firestore active_sessions connections.
 * @collectionsUsed Constants.COLLECTIONS.ACTIVE_SESSIONS
 * @cloudFunctionsUsed None
 * @snapshotListeners onRoomSessionSnapshot
 * @transactions None
 * @publicAPI getActiveSession, setSessionState, updateSessionMetadata, onRoomSessionSnapshot
 * @futureMigrationPlan Replace RoomEngine db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS) calls with RoomRepository.
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class RoomRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `RoomRepository.${method}`);
        throw enhancedError;
    }

    async getActiveSession(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const doc = await db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            this._handleError(error, 'getActiveSession');
        }
    }

    async setSessionState(courseId, data) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId).set(data, { merge: true });
        } catch (error) {
            this._handleError(error, 'setSessionState');
        }
    }

    async deleteSession(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId).delete();
        } catch (error) {
            this._handleError(error, 'deleteSession');
        }
    }

    async updateSessionMetadata(courseId, metadata) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId).update({
                metadata,
                timestamp: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            });
        } catch (error) {
            this._handleError(error, 'updateSessionMetadata');
        }
    }

    async requestMic(courseId, user) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.HAND_RAISES).doc(user.uid).set({
                    name: user.displayName || user.email || 'طالب',
                    uid: user.uid,
                    timestamp: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
                });
        } catch (error) {
            this._handleError(error, 'requestMic');
        }
    }

    async cancelMicRequest(courseId, userId) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.HAND_RAISES).doc(userId).delete();
        } catch (error) {
            this._handleError(error, 'cancelMicRequest');
        }
    }

    onRoomSessionSnapshot(courseId, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId)
                .onSnapshot(doc => {
                    callback(doc.exists ? { id: doc.id, ...doc.data() } : null);
                }, error => {
                    this._handleError(error, 'onRoomSessionSnapshot');
                });
        } catch (error) {
            this._handleError(error, 'onRoomSessionSnapshot');
        }
    }

    onHandRaisesSnapshot(courseId, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.HAND_RAISES)
                .onSnapshot(snapshot => {
                    callback(snapshot.docChanges());
                }, error => {
                    this._handleError(error, 'onHandRaisesSnapshot');
                });
        } catch (error) {
            this._handleError(error, 'onHandRaisesSnapshot');
        }
    }

    /**
     * Revokes a student's microphone permission by removing their key from micPermissions.
     * @param {string} courseId
     * @param {string} studentUid
     */
    async revokeMicPermission(courseId, studentUid) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId).set({
                [`micPermissions.${studentUid}`]: FirebaseManager.getFirestoreFieldValue().delete()
            }, { merge: true });
        } catch (error) {
            this._handleError(error, 'revokeMicPermission');
        }
    }
}

export const RoomRepository = new RoomRepositoryClass();
