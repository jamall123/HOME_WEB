export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "VALIDATION";
    ErrorCategory["PERMISSION"] = "PERMISSION";
    ErrorCategory["WORKFLOW"] = "WORKFLOW";
    ErrorCategory["AI"] = "AI";
    ErrorCategory["STORAGE"] = "STORAGE";
    ErrorCategory["REPOSITORY"] = "REPOSITORY";
    ErrorCategory["INTERNAL"] = "INTERNAL";
})(ErrorCategory || (ErrorCategory = {}));
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "LOW";
    ErrorSeverity["MEDIUM"] = "MEDIUM";
    ErrorSeverity["HIGH"] = "HIGH";
    ErrorSeverity["CRITICAL"] = "CRITICAL";
})(ErrorSeverity || (ErrorSeverity = {}));
export class AppError extends Error {
    errorCode;
    httpStatus;
    isOperational;
    severity;
    category;
    requestId;
    correlationId;
    retryable;
    userMessage;
    metadata;
    context;
    timestamp;
    constructor(params) {
        super(params.message);
        this.name = this.constructor.name;
        this.errorCode = params.errorCode;
        this.httpStatus = params.httpStatus;
        this.isOperational = params.isOperational !== undefined ? params.isOperational : true;
        this.severity = params.severity || ErrorSeverity.MEDIUM;
        this.category = params.category;
        this.requestId = params.requestId;
        this.correlationId = params.correlationId;
        this.retryable = params.retryable || false;
        this.userMessage = params.userMessage || 'An unexpected error occurred. Please try again later.';
        this.metadata = params.metadata;
        this.context = params.context;
        this.timestamp = new Date().toISOString();
        if (params.cause) {
            this.stack = `${this.stack}\nCaused by: ${params.cause.stack}`;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    constructor(message, metadata) {
        super({
            message,
            errorCode: 'VAL_001',
            httpStatus: 400,
            category: ErrorCategory.VALIDATION,
            userMessage: 'Invalid input provided.',
            retryable: false,
            metadata
        });
    }
}
export class PermissionError extends AppError {
    constructor(message, metadata) {
        super({
            message,
            errorCode: 'AUTH_003',
            httpStatus: 403,
            category: ErrorCategory.PERMISSION,
            userMessage: 'You do not have permission to perform this action.',
            retryable: false,
            metadata
        });
    }
}
export class WorkflowError extends AppError {
    constructor(message, retryable = true, metadata) {
        super({
            message,
            errorCode: 'WF_001',
            httpStatus: 500,
            category: ErrorCategory.WORKFLOW,
            severity: ErrorSeverity.HIGH,
            userMessage: 'We encountered an issue processing your request.',
            retryable,
            metadata
        });
    }
}
//# sourceMappingURL=AppError.js.map