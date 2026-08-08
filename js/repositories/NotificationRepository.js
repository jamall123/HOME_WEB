/**
 * @file NotificationRepository.js
 * @purpose Enterprise Data Layer for Notifications.
 * @responsibilities
 *  - Store and retrieve user notifications.
 *  - Act as gateway for Notification Cloud Functions (if any).
 * @collectionsUsed Constants.COLLECTIONS.NOTIFICATIONS
 * @cloudFunctionsUsed None
 * @snapshotListeners onUserNotificationsSnapshot
 * @transactions None
 * @publicAPI getNotifications, markAsRead, onUserNotificationsSnapshot
 * @futureMigrationPlan Future Push Notifications integration point.
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class NotificationRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `NotificationRepository.${method}`);
        throw enhancedError;
    }

    _getCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.NOTIFICATIONS);
    }

    async getNotifications(userId) {
        try {
            const snapshot = await this._getCollection()
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getNotifications');
        }
    }

    async markAsRead(notificationId) {
        try {
            await this._getCollection().doc(notificationId).update({ read: true });
        } catch (error) {
            this._handleError(error, 'markAsRead');
        }
    }

    onUserNotificationsSnapshot(userId, callback) {
        try {
            return this._getCollection()
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .onSnapshot(snapshot => {
                    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, error => {
                    this._handleError(error, 'onUserNotificationsSnapshot');
                });
        } catch (error) {
            this._handleError(error, 'onUserNotificationsSnapshot');
        }
    }
}

export const NotificationRepository = new NotificationRepositoryClass();
