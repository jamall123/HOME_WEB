/**
 * @file FirebaseManager.js
 * @purpose Centralized entry point for all Firebase services.
 * @responsibilities
 *  - Prevent scattered initialization and duplicate instances of Firebase services.
 *  - Serve as the single source of truth for accessing auth, firestore, storage, and functions.
 *  - Facilitate future migration from Firebase Compat (v8/v9-compat) to Modular SDK (v9+).
 * @dependencies window.firebase (Temporary legacy dependency)
 * @publicAPI getAuth, getFirestore, getStorage, getFunctions
 * @futureMigrationPlan All future Repositories MUST import this manager instead of calling window.firebase directly.
 */

import { ErrorHandler } from './ErrorHandler.js';

export class FirebaseManagerClass {
    constructor() {
        /** @private */
        this._auth = null;
        /** @private */
        this._firestore = null;
        /** @private */
        this._storage = null;
        /** @private */
        this._functions = null;
    }

    /**
     * Returns true if window.firebase is available and initialized.
     * Use this as a safe guard before calling any service getter.
     * @returns {boolean}
     */
    isInitialized() {
        return typeof window !== 'undefined' && !!window.firebase;
    }

    /**
     * Internal helper to verify Firebase is loaded before accessing services.
     * @private
     */
    _ensureFirebase() {
        if (!this.isInitialized()) {
            const error = new Error('Firebase is not initialized or window.firebase is missing.');
            ErrorHandler.handleError(error, 'FirebaseManager');
            throw error;
        }
    }

    /**
     * @returns {firebase.auth.Auth}
     */
    getAuth() {
        if (!this._auth) {
            this._ensureFirebase();
            this._auth = window.firebase.auth();
        }
        return this._auth;
    }

    /**
     * @returns {firebase.firestore.Firestore}
     */
    getFirestore() {
        if (!this._firestore) {
            this._ensureFirebase();
            this._firestore = window.firebase.firestore();
        }
        return this._firestore;
    }

    /**
     * @returns {firebase.firestore.FieldValue}
     */
    getFirestoreFieldValue() {
        this._ensureFirebase();
        return window.firebase.firestore.FieldValue;
    }

    /**
     * @returns {Object} Server timestamp token
     */
    getServerTimestamp() {
        this._ensureFirebase();
        return window.firebase.firestore.FieldValue.serverTimestamp();
    }

    /**
     * @returns {firebase.storage.Storage}
     */
    getStorage() {
        if (!this._storage) {
            this._ensureFirebase();
            this._storage = window.firebase.storage();
        }
        return this._storage;
    }

    /**
     * @returns {firebase.storage.TaskState}
     */
    getStorageTaskState() {
        this._ensureFirebase();
        return window.firebase.storage.TaskState;
    }

    /**
     * @returns {firebase.functions.Functions}
     */
    getFunctions() {
        if (!this._functions) {
            this._ensureFirebase();
            this._functions = window.firebase.functions();
        }
        return this._functions;
    }
}

// Export a singleton instance
export const FirebaseManager = new FirebaseManagerClass();
