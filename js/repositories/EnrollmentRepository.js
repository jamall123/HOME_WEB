/**
 * @file EnrollmentRepository.js
 * @purpose Enterprise Data Layer for Enrollment Requests.
 * @responsibilities
 *  - Manage read/write operations for enrollment requests.
 * @collectionsUsed Constants.COLLECTIONS.ENROLLMENT_REQUESTS
 * @cloudFunctionsUsed None
 * @snapshotListeners None
 * @transactions None
 * @publicAPI createEnrollmentRequest, getEnrollmentRequests
 * @futureMigrationPlan Replace RegistrationEngine db.collection calls with EnrollmentRepository.
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class EnrollmentRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `EnrollmentRepository.${method}`);
        throw enhancedError;
    }

    _getCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.ENROLLMENT_REQUESTS);
    }

    async createEnrollmentRequest(data) {
        try {
            const ref = await this._getCollection().add(data);
            return ref.id;
        } catch (error) {
            this._handleError(error, 'createEnrollmentRequest');
        }
    }

    async getEnrollmentRequests(userId) {
        try {
            const snapshot = await this._getCollection().where('userId', '==', userId).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getEnrollmentRequests');
        }
    }

    async getBankAccounts() {
        try {
            const snapshot = await FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.BANK_ACCOUNTS).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getBankAccounts');
        }
    }

    async uploadReceipt(courseId, file) {
        try {
            const storageRef = FirebaseManager.getStorage().ref();
            const ext = file.type === 'application/pdf' ? 'pdf' : 'jpg';
            const fileName = `receipts/${courseId}/${Date.now()}_${Math.floor(Math.random()*1000)}.${ext}`;
            const fileRef = storageRef.child(fileName);
            
            const snapshot = await fileRef.put(file);
            return await snapshot.ref.getDownloadURL();
        } catch (error) {
            this._handleError(error, 'uploadReceipt');
        }
    }
}

export const EnrollmentRepository = new EnrollmentRepositoryClass();
