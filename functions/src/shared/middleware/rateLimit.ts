import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DI } from '../di.js';

export interface IRateLimitAdapter {
  incrementAndCheck(key: string, maxRequests: number, windowMs: number): Promise<boolean>;
}

export class FirestoreRateLimitAdapter implements IRateLimitAdapter {
  async incrementAndCheck(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    try {
      const rateLimitRef: admin.firestore.DocumentReference = DI.db.collection('system_rate_limits').doc(key);
      let allowed = true;

      await DI.db.runTransaction(async (transaction: admin.firestore.Transaction) => {
        const doc = await transaction.get(rateLimitRef);
        
        if (!doc.exists) {
          transaction.set(rateLimitRef, { count: 1, expiresAt: now + windowMs });
        } else {
          const data = doc.data()!;
          if (now > data.expiresAt) {
            // Window expired, reset
            transaction.set(rateLimitRef, { count: 1, expiresAt: now + windowMs });
          } else {
            if (data.count >= maxRequests) {
              allowed = false;
            } else {
              transaction.update(rateLimitRef, { count: data.count + 1 });
            }
          }
        }
      });
      return allowed;
    } catch (error) {
      DI.logger.error(`RateLimiter error`, { error });
      // Fail open to avoid blocking legitimate traffic during DB issues
      return true;
    }
  }
}

export class RateLimiter {
  private static adapter: IRateLimitAdapter;

  static setAdapter(adapter: IRateLimitAdapter) {
    this.adapter = adapter;
  }

  static apply(endpointName: string, maxRequests: number, windowMs: number) {
    return async (context: functions.https.CallableContext) => {
      // Lazy load adapter if not set
      if (!this.adapter) {
        this.adapter = new FirestoreRateLimitAdapter();
      }

      const identifier = context.auth?.uid || context.rawRequest?.ip || 'anonymous';
      const key = `ratelimit_${endpointName}_${identifier}`;

      const allowed = await this.adapter.incrementAndCheck(key, maxRequests, windowMs);
      
      if (!allowed) {
        DI.logger.warning(`Rate limit exceeded for ${identifier} on ${endpointName}`);
        throw new functions.https.HttpsError('resource-exhausted', 'Too many requests, please try again later.');
      }
    };
  }
}
