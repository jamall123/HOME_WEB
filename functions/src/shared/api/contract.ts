/**
 * Unified API Contract v1
 * All Cloud Functions must use this request/response shape.
 * This ensures consistent parsing on the frontend and easy versioning later.
 */

// ─── REQUEST ─────────────────────────────────────────────────────────────────

export interface ApiMetadata {
  correlationId?: string;
  requestId?: string;
  clientTimestamp?: string;
  clientVersion?: string;
}

export interface ApiRequest<T = Record<string, any>> {
  apiVersion: 'v1';
  action: string;
  entity?: string;          // e.g. "course", "post", "user"
  payload: T;
  metadata?: ApiMetadata;
}

// ─── RESPONSE ────────────────────────────────────────────────────────────────

export interface ApiResponseMeta {
  executionTime: number;    // milliseconds
  apiVersion: 'v1';
  correlationId?: string;
}

export interface ApiSuccessResponse<T = Record<string, any>> {
  success: true;
  message: string;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export type ApiResponse<T = Record<string, any>> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── BUILDER HELPERS ─────────────────────────────────────────────────────────

export function ok<T>(
  data: T,
  message: string,
  startTime: number,
  correlationId?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: {
      executionTime: Math.round(performance.now() - startTime),
      apiVersion: 'v1',
      correlationId,
    },
  };
}

export function fail(
  code: string,
  message: string,
  retryable = false
): ApiErrorResponse {
  return {
    success: false,
    error: { code, message, retryable },
  };
}

// ─── REQUEST PARSER ──────────────────────────────────────────────────────────

/**
 * Parses and validates the unified incoming request.
 * Throws HttpsError if the shape is invalid.
 */
import * as functions from 'firebase-functions';

export function parseRequest<T = Record<string, any>>(raw: any): ApiRequest<T> {
  if (!raw || raw.apiVersion !== 'v1') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Request must include apiVersion: "v1".'
    );
  }
  if (!raw.action || typeof raw.action !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Request must include a non-empty action string.'
    );
  }
  return {
    apiVersion: 'v1',
    action: raw.action,
    entity: raw.entity,
    payload: raw.payload ?? {},
    metadata: raw.metadata,
  };
}
