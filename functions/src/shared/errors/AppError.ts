export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  WORKFLOW = 'WORKFLOW',
  AI = 'AI',
  STORAGE = 'STORAGE',
  REPOSITORY = 'REPOSITORY',
  INTERNAL = 'INTERNAL'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppErrorParams {
  message: string;
  errorCode: string;
  httpStatus: number;
  isOperational?: boolean;
  severity?: ErrorSeverity;
  category: ErrorCategory;
  requestId?: string;
  correlationId?: string;
  retryable?: boolean;
  userMessage?: string;
  metadata?: Record<string, any>;
  context?: string;
  cause?: Error;
}

export class AppError extends Error {
  public readonly errorCode: string;
  public readonly httpStatus: number;
  public readonly isOperational: boolean;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly requestId?: string;
  public readonly correlationId?: string;
  public readonly retryable: boolean;
  public readonly userMessage: string;
  public readonly metadata?: Record<string, any>;
  public readonly context?: string;
  public readonly timestamp: string;

  constructor(params: AppErrorParams) {
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
  constructor(message: string, metadata?: Record<string, any>) {
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
  constructor(message: string, metadata?: Record<string, any>) {
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
  constructor(message: string, retryable: boolean = true, metadata?: Record<string, any>) {
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
