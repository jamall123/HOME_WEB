class BackendGatewayClass {
  constructor() {
    // Rely on window.firebase being loaded by the CDN in the HTML shell
    this.functions = null;
  }

  getFunctions() {
    if (!this.functions) {
      if (!window.firebase || !window.firebase.functions) {
        console.error('[Gateway] Firebase Functions SDK not loaded yet.');
        throw new Error('Firebase functions not initialized.');
      }
      this.functions = window.firebase.functions();
    }
    return this.functions;
  }

  /**
   * Universal invoker for all backend callable functions.
   * Centralizes error handling, correlation IDs, and retries.
   */
  async call(functionName, payload = {}) {
    try {
      const requestId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const enrichedPayload = {
        ...payload,
        metadata: {
          clientTimestamp: new Date().toISOString(),
          requestId,
          userAgent: navigator.userAgent
        }
      };

      console.debug(`[Gateway] Calling ${functionName} (ReqID: ${requestId})`);
      
      const fn = this.getFunctions().httpsCallable(functionName);
      const response = await fn(enrichedPayload);
      
      return response.data;
    } catch (error) {
      console.error(`[Gateway] Function ${functionName} failed:`, error);
      throw this.transformError(error);
    }
  }

  transformError(firebaseError) {
    // Attempt to extract the custom AppError properties if the backend sends them inside 'details'
    const details = firebaseError.details || {};
    return {
      code: firebaseError.code || 'unknown',
      errorCode: details.errorCode || 'UNKNOWN_000',
      message: details.userMessage || firebaseError.message || 'حدث خطأ غير متوقع في الخادم.',
      isOperational: details.isOperational !== false,
      severity: details.severity || 'MEDIUM'
    };
  }
}

export const BackendGateway = new BackendGatewayClass();
window.BackendGateway = BackendGateway; // Export globally for legacy components
