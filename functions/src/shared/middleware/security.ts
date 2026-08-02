import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DI } from '../di.js';

export class SecurityMiddleware {
  /**
   * Validates Firebase App Check token.
   * Denies requests that do not originate from an authorized app.
   *
   * NOTE: The client has never actually initialized Firebase App Check
   * (no firebase-appcheck-compat.js script + initializeAppCheck() call
   * anywhere in js/firebase-config.js), so `context.app` is ALWAYS
   * undefined outside the emulator. Enforcing this hard-blocked every
   * callable function on the site in production (login, course room
   * entry, admin user/credential creation, courses, enrollments, CMS,
   * contact, chat) with `failed-precondition`. Until App Check is
   * properly wired up client-side (requires a reCAPTCHA v3 site key
   * registered in the Firebase Console → App Check), we log a warning
   * instead of rejecting the request so the app keeps working.
   */
  static requireAppCheck(context: functions.https.CallableContext) {
    // In emulator or local testing, app check might not be present
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      return;
    }

    if (context.app == undefined) {
      DI.logger.warn('App Check token missing (App Check not yet configured client-side) — allowing request', { ip: context.rawRequest?.ip });
    }
  }

  /**
   * Enforces Idempotency using an idempotency key passed in the data.
   * Prevents replay attacks and duplicate processing.
   */
  static async enforceIdempotency(idempotencyKey: string | undefined, windowMs: number = 86400000) {
    if (!idempotencyKey) {
      // If we strictly require idempotency on this route
      throw new functions.https.HttpsError('invalid-argument', 'Idempotency key is required.');
    }

    const key = `idempotency_${idempotencyKey}`;
    const now = Date.now();

    try {
      const idempotencyRef: admin.firestore.DocumentReference = DI.db.collection('system_idempotency').doc(key);
      let isDuplicate = false;

      await DI.db.runTransaction(async (transaction: admin.firestore.Transaction) => {
        const doc = await transaction.get(idempotencyRef);
        
        if (!doc.exists) {
          // First time seeing this key, mark as locked
          transaction.set(idempotencyRef, {
            status: 'locked',
            createdAt: now,
            expiresAt: now + windowMs
          });
        } else {
          const data = doc.data()!;
          if (now > data.expiresAt) {
             // Expired key, we can reuse it
             transaction.set(idempotencyRef, {
              status: 'locked',
              createdAt: now,
              expiresAt: now + windowMs
            });
          } else {
            // Key exists and hasn't expired. This is a duplicate request!
            isDuplicate = true;
          }
        }
      });

      if (isDuplicate) {
        DI.logger.warn(`Idempotency key reused: ${idempotencyKey}`);
        throw new functions.https.HttpsError('already-exists', 'Request already processed.');
      }
    } catch (error: any) {
      if (error.code === 'already-exists' || error.code === 'invalid-argument') {
        throw error;
      }
      DI.logger.error(`Idempotency verification error`, { error });
      // Depending on strictness, we might fail open or closed. Failing closed for idempotency is safer.
      throw new functions.https.HttpsError('internal', 'Internal security verification failed.');
    }
  }
}
