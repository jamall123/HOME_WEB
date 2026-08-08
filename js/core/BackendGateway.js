import { AppError, ErrorCategory } from './AppError.js';
import { FirebaseManager } from './FirebaseManager.js';

const API_VERSION = 'v1';
const CLIENT_VERSION = '1.0.0';

export class BackendGateway {
  constructor() {
    this._functions = null;
    this.offlineQueue = [];
    this.version = API_VERSION;

    window.addEventListener('online', this.processOfflineQueue.bind(this));
  }

  get functions() {
    if (!this._functions) {
      this._functions = FirebaseManager.getFunctions();
    }
    return this._functions;
  }

  /**
   * Execute a command against the backend via HTTPS Callable Functions.
   * Sends the unified API contract shape:
   * { apiVersion, action, entity, payload, metadata }
   *
   * @param {Object} command
   * @param {string} command.domain   The bounded context, e.g. 'academy_courses'
   * @param {string} command.action   The action to perform, e.g. 'save'
   * @param {string} [command.entity] Optional entity type, e.g. 'course'
   * @param {Object} command.payload  The data payload
   * @param {Object} options          Retry / timeout / offline options
   */
  async execute({ domain, action, entity, payload = {} }, options = {}) {
    const {
      retries = 3,
      timeout = 10000,
      allowOffline = false
    } = options;

    if (!navigator.onLine) {
      if (allowOffline) {
        return this.queueForOffline({ domain, action, entity, payload });
      }
      throw new AppError({
        message: 'No internet connection',
        errorCode: 'NETWORK_001',
        category: ErrorCategory.NETWORK
      });
    }

    const functionName = `api_${this.version}_${domain}`;
    let attempt = 0;

    while (attempt < retries) {
      try {
        return await this.callFunction(functionName, action, entity, payload, timeout);
      } catch (error) {
        attempt++;
        const isTransient = this.isTransientError(error);
        if (!isTransient || attempt >= retries) {
          throw this.mapError(error, functionName);
        }
        // Exponential backoff
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
      }
    }
  }

  async callFunction(name, action, entity, payload, timeoutMs) {
    if (!this.functions) throw new Error('Firebase functions not initialized');

    const callable = this.functions.httpsCallable(name, { timeout: timeoutMs });

    const correlationId = crypto.randomUUID();
    const requestId = crypto.randomUUID();

    // Unified request shape (matches contract.ts on the backend)
    const request = {
      apiVersion: API_VERSION,
      action,
      entity: entity ?? undefined,
      payload,
      metadata: {
        correlationId,
        requestId,
        clientTimestamp: new Date().toISOString(),
        clientVersion: CLIENT_VERSION
      }
    };

    console.log(`[Gateway] → ${name} / ${action}${entity ? ` (${entity})` : ''} [${correlationId}]`);

    const result = await callable(request);
    const data = result.data;

    // Unified response handling
    if (data && data.success === false) {
      const err = data.error;
      console.error(`[Gateway] ✗ ${name} [${correlationId}]`, err);
      throw new AppError({
        message: err?.message || 'Unknown error',
        errorCode: err?.code || 'UNKNOWN',
        category: ErrorCategory.NETWORK,
        retryable: err?.retryable ?? false
      });
    }

    console.log(`[Gateway] ✓ ${name} [${correlationId}] ${data?.meta?.executionTime ?? '?'}ms`);
    return data;
  }

  isTransientError(error) {
    const transientCodes = ['deadline-exceeded', 'unavailable', 'internal'];
    return transientCodes.includes(error?.code);
  }

  mapError(error, functionName) {
    console.error(`[Gateway] Failed ${functionName}:`, error);
    return new AppError({
      message: error.message || 'Internal Server Error',
      errorCode: error.code || 'UNKNOWN',
      category: ErrorCategory.NETWORK,
      cause: error
    });
  }

  queueForOffline(command) {
    console.log(`[Gateway] Queued offline: ${command.domain}/${command.action}`);
    this.offlineQueue.push(command);
    return { status: 'queued' };
  }

  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;
    console.log(`[Gateway] Processing ${this.offlineQueue.length} offline items`);
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const cmd of queue) {
      try {
        await this.execute(cmd);
      } catch (e) {
        console.error(`[Gateway] Failed to process offline command`, cmd, e);
      }
    }
  }
}

export const backendGateway = new BackendGateway();
