/**
 * CurriculumErrors.js
 * Custom error classes for the Curriculum Engine.
 */

export class CurriculumError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CurriculumError';
    }
}

export class ValidationError extends CurriculumError {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class PermissionError extends CurriculumError {
    constructor(message) {
        super(message);
        this.name = 'PermissionError';
    }
}

export class NetworkError extends CurriculumError {
    constructor(message) {
        super(message);
        this.name = 'NetworkError';
    }
}

export class ConflictError extends CurriculumError {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}

export class SyncError extends CurriculumError {
    constructor(message) {
        super(message);
        this.name = 'SyncError';
    }
}
