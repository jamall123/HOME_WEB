/**
 * Unified API Contract v1
 * All Cloud Functions must use this request/response shape.
 * This ensures consistent parsing on the frontend and easy versioning later.
 */
// ─── BUILDER HELPERS ─────────────────────────────────────────────────────────
export function ok(data, message, startTime, correlationId) {
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
export function fail(code, message, retryable = false) {
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
export function parseRequest(raw) {
    if (!raw || raw.apiVersion !== 'v1') {
        throw new functions.https.HttpsError('invalid-argument', 'Request must include apiVersion: "v1".');
    }
    if (!raw.action || typeof raw.action !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Request must include a non-empty action string.');
    }
    return {
        apiVersion: 'v1',
        action: raw.action,
        entity: raw.entity,
        payload: raw.payload ?? {},
        metadata: raw.metadata,
    };
}
//# sourceMappingURL=contract.js.map