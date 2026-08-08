/**
 * @file ErrorHandler.js
 * @purpose Centralized error reporting and classification.
 * @responsibilities
 *  - Catch and classify all errors uniformly.
 *  - Route errors to the Logger and potentially external monitoring (e.g., Crashlytics/Sentry).
 *  - Prevent silent failures and empty catch blocks.
 * @dependencies Logger
 * @publicAPI handleError, ErrorCategory, AppError
 * @futureMigrationPlan Every catch block must call ErrorHandler.handleError(err).
 */

import { Logger } from './Logger.js';

export const ErrorCategory = {
    FIREBASE: 'FIREBASE',
    NETWORK: 'NETWORK',
    AUTHENTICATION: 'AUTHENTICATION',
    VALIDATION: 'VALIDATION',
    UNEXPECTED: 'UNEXPECTED'
};

export class AppError extends Error {
    /**
     * @param {string} message 
     * @param {string} category From ErrorCategory
     * @param {any} [cause] Original error object
     */
    constructor(message, category = ErrorCategory.UNEXPECTED, cause = null) {
        super(message);
        this.name = 'AppError';
        this.category = category;
        this.cause = cause;
    }
}

export class ErrorHandlerClass {
    /**
     * Main entry point for error handling.
     * @param {Error|any} error 
     * @param {string} [context] The module or function where the error occurred
     */
    handleError(error, context = 'UnknownContext') {
        const classifiedError = this._classify(error);
        
        // Log the error centrally
        Logger.error('ErrorHandler', `[${classifiedError.category}] [${context}] ${classifiedError.message}`, classifiedError.cause || error);

        // Here we could emit to EventBus for global UI toasts, 
        // or send to Sentry/Crashlytics in the future.
    }

    /**
     * Intercepts unhandled promise rejections and window errors globally.
     */
    attachGlobalListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('error', (event) => {
                this.handleError(event.error, 'GlobalWindowError');
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.handleError(event.reason, 'UnhandledPromiseRejection');
            });
        }
    }

    /**
     * @private
     * @param {any} error 
     * @returns {AppError}
     */
    _classify(error) {
        if (error instanceof AppError) {
            return error;
        }

        const message = error?.message || String(error);
        
        // Simple heuristic classification based on Firebase common errors
        if (error?.code?.startsWith('auth/')) {
            return new AppError(message, ErrorCategory.AUTHENTICATION, error);
        }
        
        if (error?.code?.startsWith('firestore/') || error?.code?.startsWith('storage/')) {
            return new AppError(message, ErrorCategory.FIREBASE, error);
        }

        if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
            return new AppError(message, ErrorCategory.NETWORK, error);
        }

        return new AppError(message, ErrorCategory.UNEXPECTED, error);
    }
}

export const ErrorHandler = new ErrorHandlerClass();
