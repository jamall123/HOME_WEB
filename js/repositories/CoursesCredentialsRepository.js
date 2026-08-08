/**
 * @file CoursesCredentialsRepository.js
 * @purpose Enterprise Data Layer for Courses Credentials (Legacy mapping).
 * @responsibilities
 *  - Perform raw Firestore operations on the COURSES_CREDENTIALS collection.
 *  - Catch and route all errors through ErrorHandler.
 * @collectionsUsed Constants.COLLECTIONS.COURSE_CREDENTIALS
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class CoursesCredentialsRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `CoursesCredentialsRepository.${method}`);
        throw enhancedError;
    }

    async getCredential(credentialId) {
        try {
            const snap = await FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.COURSE_CREDENTIALS).doc(credentialId).get();
            return snap.exists ? { id: snap.id, ...snap.data() } : null;
        } catch (error) {
            this._handleError(error, 'getCredential');
        }
    }
}

export const CoursesCredentialsRepository = new CoursesCredentialsRepositoryClass();
