/**
 * @file CertificateRepository.js
 * @purpose Enterprise Data Layer for Course Certificates.
 * @responsibilities
 *  - Read and write issued certificates.
 * @collectionsUsed Constants.COLLECTIONS.CERTIFICATES
 * @cloudFunctionsUsed None
 * @snapshotListeners None
 * @transactions None
 * @publicAPI getCertificate, getUserCertificates, createCertificate
 * @futureMigrationPlan Replace CertificateGenerator db calls with CertificateRepository.
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class CertificateRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `CertificateRepository.${method}`);
        throw enhancedError;
    }

    _getCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.CERTIFICATES);
    }

    async getCertificate(certificateId) {
        try {
            const doc = await this._getCollection().doc(certificateId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            this._handleError(error, 'getCertificate');
        }
    }

    async getUserCertificates(userId) {
        try {
            const snapshot = await this._getCollection().where('userId', '==', userId).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getUserCertificates');
        }
    }

    async createCertificate(data) {
        try {
            const ref = await this._getCollection().add(data);
            return ref.id;
        } catch (error) {
            this._handleError(error, 'createCertificate');
        }
    }

    async createCertificateWithId(id, data) {
        try {
            const payload = {
                ...data,
                issueDate: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            };
            await this._getCollection().doc(id).set(payload);
            return id;
        } catch (error) {
            this._handleError(error, 'createCertificateWithId');
        }
    }
}

export const CertificateRepository = new CertificateRepositoryClass();
