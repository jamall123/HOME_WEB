/**
 * @file ContactRepository.js
 * @purpose Enterprise Data Layer for Contact Messages.
 * @responsibilities
 *  - Perform raw Firestore operations on the CONTACT_MESSAGES collection.
 *  - Catch and route all errors through ErrorHandler.
 * @collectionsUsed Constants.COLLECTIONS.CONTACT_MESSAGES
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class ContactRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `ContactRepository.${method}`);
        throw enhancedError;
    }

    _getCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.CONTACT_MESSAGES);
    }

    async addMessage(messageData) {
        try {
            const data = {
                ...messageData,
                read: false,
                createdAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            };
            const ref = await this._getCollection().add(data);
            return ref.id;
        } catch (error) {
            this._handleError(error, 'addMessage');
        }
    }
}

export const ContactRepository = new ContactRepositoryClass();
