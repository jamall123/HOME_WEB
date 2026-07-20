export const ErrorCategory = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  INTERNAL: 'INTERNAL'
};

export class AppError extends Error {
  constructor({ message, errorCode, category = ErrorCategory.INTERNAL, httpStatus = 500, cause = null }) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.category = category;
    this.httpStatus = httpStatus;
    this.cause = cause;
  }
}
