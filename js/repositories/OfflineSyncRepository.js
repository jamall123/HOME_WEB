/**
 * @file OfflineSyncRepository.js
 * @purpose Strict, secure Data Layer proxy exclusively for executing queued offline mutations.
 * @responsibilities
 *  - Validate operations against an explicit allowlist.
 *  - Execute 'set', 'update', or 'delete' on Firestore.
 *  - Throw errors immediately to allow OfflineSyncEngine to handle DLQ/retries.
 * @dependencies FirebaseManager, Constants, ErrorHandler
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { Constants } from '../core/Constants.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';

export class OfflineSyncRepositoryClass {
    constructor() {
        this.ALLOWED_ACTIONS = ['set', 'update', 'delete'];
        this.ALLOWED_COLLECTIONS = [
            Constants.COLLECTIONS.LESSON_RESOURCES,
            Constants.COLLECTIONS.CONTACT_MESSAGES,
            Constants.COLLECTIONS.STUDENT_PROGRESS,
            Constants.COLLECTIONS.RESOURCE_AI_METADATA,
            'analytics_stress_test' // Test-only collection
        ];
    }

    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `OfflineSyncRepository.${method}`);
        throw enhancedError;
    }

    async executeSyncOperation(collectionName, docId, action, data) {
        try {
            // 1. Validate docId
            if (!docId || typeof docId !== 'string') {
                throw new Error('Invalid or missing docId for offline sync operation');
            }

            // 2. Validate action
            if (!this.ALLOWED_ACTIONS.includes(action)) {
                throw new Error(`Unsupported offline sync action: ${action}`);
            }

            // 3. Validate collection
            if (!this.ALLOWED_COLLECTIONS.includes(collectionName)) {
                throw new Error(`Offline sync blocked for unauthorized collection: ${collectionName}`);
            }

            // 4. Execute operation safely
            const db = FirebaseManager.getFirestore();
            if (!db) {
                throw new Error('Firestore is not initialized');
            }

            // Hydrate tokens back to FieldValues
            if (data) {
                for (const key of Object.keys(data)) {
                    if (data[key] === '$SERVER_TIMESTAMP') {
                        data[key] = FirebaseManager.getFirestoreFieldValue().serverTimestamp();
                    } else if (typeof data[key] === 'object' && data[key] !== null && typeof data[key]['$INCREMENT'] === 'number') {
                        data[key] = FirebaseManager.getFirestoreFieldValue().increment(data[key]['$INCREMENT']);
                    }
                }
            }

            const docRef = db.collection(collectionName).doc(docId);

            if (action === 'set') {
                await docRef.set(data, { merge: true });
            } else if (action === 'update') {
                await docRef.update(data);
            } else if (action === 'delete') {
                await docRef.delete();
            }

        } catch (error) {
            this._handleError(error, 'executeSyncOperation');
        }
    }
}

export const OfflineSyncRepository = new OfflineSyncRepositoryClass();
