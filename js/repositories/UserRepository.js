/**
 * @file UserRepository.js
 * @purpose Enterprise Data Layer for User Profiles.
 * @responsibilities
 *  - Perform raw Firestore operations on the USERS collection.
 *  - Catch and route all errors through ErrorHandler.
 *  - Optimize reads via caching immutable data if applicable.
 * @collectionsUsed Constants.COLLECTIONS.USERS
 * @cloudFunctionsUsed None
 * @snapshotListeners onUserSnapshot
 * @transactions None
 * @publicAPI getUser, updateUser, createUserProfile, onUserSnapshot
 * @futureMigrationPlan Modules should replace direct db.collection(Constants.COLLECTIONS.USERS) with UserRepository.
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class UserRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `UserRepository.${method}`);
        throw enhancedError;
    }

    _getCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.USERS);
    }

    async getUser(userId) {
        try {
            const doc = await this._getCollection().doc(userId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            this._handleError(error, 'getUser');
        }
    }

    async updateUser(userId, data) {
        try {
            const safeData = { ...data };
            delete safeData.role;
            delete safeData.permissions;
            await this._getCollection().doc(userId).update(safeData);
        } catch (error) {
            this._handleError(error, 'updateUser');
        }
    }

    async createUserProfile(userId, data) {
        try {
            await this._getCollection().doc(userId).set(data, { merge: true });
        } catch (error) {
            this._handleError(error, 'createUserProfile');
        }
    }

    onUserSnapshot(userId, callback) {
        try {
            return this._getCollection().doc(userId).onSnapshot(doc => {
                callback(doc.exists ? { id: doc.id, ...doc.data() } : null);
            }, error => {
                this._handleError(error, 'onUserSnapshot');
            });
        } catch (error) {
            this._handleError(error, 'onUserSnapshot');
        }
    }
}

export const UserRepository = new UserRepositoryClass();
