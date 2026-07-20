import * as functions from 'firebase-functions';
import { DI } from '../di.js';
export class SecurityMiddleware {
    /**
     * Validates Firebase App Check token.
     * Denies requests that do not originate from an authorized app.
     */
    static requireAppCheck(context) {
        // In emulator or local testing, app check might not be present
        if (process.env.FUNCTIONS_EMULATOR === 'true') {
            return;
        }
        if (context.app == undefined) {
            DI.logger.warning('Failed App Check verification', { ip: context.rawRequest?.ip });
            throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.');
        }
    }
    /**
     * Enforces Idempotency using an idempotency key passed in the data.
     * Prevents replay attacks and duplicate processing.
     */
    static async enforceIdempotency(idempotencyKey, windowMs = 86400000) {
        if (!idempotencyKey) {
            // If we strictly require idempotency on this route
            throw new functions.https.HttpsError('invalid-argument', 'Idempotency key is required.');
        }
        const key = `idempotency_${idempotencyKey}`;
        const now = Date.now();
        try {
            const idempotencyRef = DI.db.collection('system_idempotency').doc(key);
            let isDuplicate = false;
            await DI.db.runTransaction(async (transaction) => {
                const doc = await transaction.get(idempotencyRef);
                if (!doc.exists) {
                    // First time seeing this key, mark as locked
                    transaction.set(idempotencyRef, {
                        status: 'locked',
                        createdAt: now,
                        expiresAt: now + windowMs
                    });
                }
                else {
                    const data = doc.data();
                    if (now > data.expiresAt) {
                        // Expired key, we can reuse it
                        transaction.set(idempotencyRef, {
                            status: 'locked',
                            createdAt: now,
                            expiresAt: now + windowMs
                        });
                    }
                    else {
                        // Key exists and hasn't expired. This is a duplicate request!
                        isDuplicate = true;
                    }
                }
            });
            if (isDuplicate) {
                DI.logger.warning(`Idempotency key reused: ${idempotencyKey}`);
                throw new functions.https.HttpsError('already-exists', 'Duplicate request detected.');
            }
        }
        catch (error) {
            if (error.code === 'already-exists' || error.code === 'invalid-argument') {
                throw error;
            }
            DI.logger.error(`Idempotency verification error`, { error });
            // Depending on strictness, we might fail open or closed. Failing closed for idempotency is safer.
            throw new functions.https.HttpsError('internal', 'Internal security verification failed.');
        }
    }
}
//# sourceMappingURL=security.js.map