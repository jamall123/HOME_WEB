/**
 * @file ProjectsRepository.js
 * @purpose Enterprise Data Layer for Projects.
 * @responsibilities
 *  - Perform raw Firestore operations on the PROJECTS collection.
 *  - Catch and route all errors through ErrorHandler.
 * @collectionsUsed Constants.COLLECTIONS.PROJECTS
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class ProjectsRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `ProjectsRepository.${method}`);
        throw enhancedError;
    }

    _getCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.PROJECTS);
    }

    async getProjects() {
        try {
            const snap = await this._getCollection().get();
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getProjects');
        }
    }
}

export const ProjectsRepository = new ProjectsRepositoryClass();
