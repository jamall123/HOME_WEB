/**
 * @file ArchiveRepository.js
 * @purpose Enterprise Data Layer for Archived Sessions.
 * @responsibilities
 *  - Perform raw Firestore operations on the ARCHIVED_SESSIONS collection.
 *  - Catch and route all errors through ErrorHandler.
 * @collectionsUsed Constants.COLLECTIONS.ARCHIVED_SESSIONS
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class ArchiveRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `ArchiveRepository.${method}`);
        throw enhancedError;
    }

    _getCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.ARCHIVED_SESSIONS);
    }

    async saveArchive(archiveData) {
        try {
            const docRef = this._getCollection().doc();
            const payload = {
                sessionId: docRef.id,
                ...archiveData,
                endedAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp(),
                createdAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            };
            await docRef.set(payload);
            return docRef.id;
        } catch (error) {
            this._handleError(error, 'saveArchive');
        }
    }

    async getArchive(sessionId) {
        try {
            const doc = await this._getCollection().doc(sessionId).get();
            if (!doc.exists) throw new Error("Archive not found");
            return doc.data();
        } catch (error) {
            this._handleError(error, 'getArchive');
        }
    }

    async listArchives(courseId) {
        try {
            const snap = await this._getCollection()
                .where('courseId', '==', courseId)
                .orderBy('createdAt', 'desc')
                .get();
            return snap.docs.map(d => d.data());
        } catch (error) {
            this._handleError(error, 'listArchives');
        }
    }
}

export const ArchiveRepository = new ArchiveRepositoryClass();
