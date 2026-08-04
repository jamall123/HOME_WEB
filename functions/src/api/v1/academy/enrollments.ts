import * as functions from 'firebase-functions';
import { DI } from '../../../shared/di.js';
import { AuthMiddleware } from '../../../shared/middleware/auth.js';
import { RateLimiter } from '../../../shared/middleware/rateLimit.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
import { enrollmentWorkflow } from '../../../domains/academy/application/enrollmentWorkflow.js';
import { Role } from '../../../shared/permissions/rbac.js';
import { parseRequest, ok } from '../../../shared/api/contract.js';

const enrollRateLimiter = RateLimiter.apply('academy_enroll', 5, 60000);

export const enrollments = functions.https.onCall(async (rawData, context) => {
  const startTime = performance.now();

  // 1. Security & Identity
  SecurityMiddleware.requireAppCheck(context);
  
  // 2. Parse unified request
  const req = parseRequest(rawData);
  const { action } = req;
  const payload = req.payload;
  const correlationId = req.metadata?.correlationId;
  const { id } = payload;

  // For request action, auth is not required. For all others, it is.
  let authContext: any = null;
  let isAdmin = false;
  let isAdminOrInstructor = false;

  if (action !== 'request') {
    authContext = AuthMiddleware.requireAuth(context);
    isAdmin = authContext.role === Role.ADMIN || authContext.role === Role.SUPER_ADMIN;
    isAdminOrInstructor = isAdmin || authContext.role === Role.INSTRUCTOR;
  }

  // 3. Idempotency Check
  await SecurityMiddleware.enforceIdempotency(correlationId);

  try {
    switch (action) {
      // ── REQUEST ─────────────────────────────────────────────────────────
      case 'request': {
        await enrollRateLimiter(context);
        const { courseId, email, name, student } = payload;
        if (!courseId) {
          throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: courseId.');
        }

        const docRef = DI.db.collection('enrollmentRequests').doc();
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        const userId = context.auth ? context.auth.uid : 'anonymous';

        batch.set(docRef, {
          courseId, email: email || null, name, student,
          userId,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        batch.set(auditRef, {
          action: 'CREATE', collection: 'enrollmentRequests',
          targetId: docRef.id, performedBy: userId,
          description: `Enrollment requested for course: ${courseId}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ requestId: docRef.id }, 'Enrollment request submitted.', startTime, correlationId);
      }

      // ── APPROVE ─────────────────────────────────────────────────────────
      case 'approve': {
        if (!isAdminOrInstructor) {
          throw new functions.https.HttpsError('permission-denied', 'Only admins/instructors can approve.');
        }
        if (!id || !payload.requestData) {
          throw new functions.https.HttpsError('invalid-argument', 'Missing id or requestData.');
        }

        // Batch: update status + audit log atomically
        const docRef = DI.db.collection('enrollmentRequests').doc(id);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(docRef, { status: 'approved', approvedAt: new Date().toISOString(), approvedBy: authContext.auth.uid });
        batch.set(auditRef, {
          action: 'APPROVE', collection: 'enrollmentRequests',
          targetId: id, performedBy: authContext.auth.uid,
          description: `Approved enrollment request: ${id}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        // Trigger post-approval workflow (grants permissions, sets custom claims)
        await enrollmentWorkflow.execute(id, payload.requestData);

        return ok({ requestId: id }, 'Enrollment approved and access granted.', startTime, correlationId);
      }

      // ── REJECT ──────────────────────────────────────────────────────────
      case 'reject': {
        if (!isAdminOrInstructor) {
          throw new functions.https.HttpsError('permission-denied', 'Only admins/instructors can reject.');
        }
        if (!id) throw new functions.https.HttpsError('invalid-argument', 'Missing id.');

        const docRef = DI.db.collection('enrollmentRequests').doc(id);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(docRef, { status: 'rejected', rejectedAt: new Date().toISOString(), rejectedBy: authContext.auth.uid });
        batch.set(auditRef, {
          action: 'REJECT', collection: 'enrollmentRequests',
          targetId: id, performedBy: authContext.auth.uid,
          description: `Rejected enrollment request: ${id}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ requestId: id }, 'Enrollment request rejected.', startTime, correlationId);
      }

      // ── UPDATE STATUS ───────────────────────────────────────────────────
      case 'updateStatus': {
        if (!isAdminOrInstructor) {
          throw new functions.https.HttpsError('permission-denied', 'Only admins/instructors can update status.');
        }
        const { status } = payload;
        if (!id || !status) throw new functions.https.HttpsError('invalid-argument', 'Missing id or status.');

        const docRef = DI.db.collection('enrollmentRequests').doc(id);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(docRef, { status, updatedAt: new Date().toISOString() });
        batch.set(auditRef, {
          action: 'UPDATE_STATUS', collection: 'enrollmentRequests',
          targetId: id, performedBy: authContext.auth.uid,
          description: `Updated enrollment ${id} status → ${status}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ requestId: id, status }, `Status updated to ${status}.`, startTime, correlationId);
      }

      // ── DELETE ──────────────────────────────────────────────────────────
      case 'delete': {
        if (!isAdmin) {
          throw new functions.https.HttpsError('permission-denied', 'Only admins can delete requests.');
        }
        if (!id) throw new functions.https.HttpsError('invalid-argument', 'Missing id.');

        const docRef = DI.db.collection('enrollmentRequests').doc(id);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.delete(docRef);
        batch.set(auditRef, {
          action: 'DELETE', collection: 'enrollmentRequests',
          targetId: id, performedBy: authContext.auth.uid,
          description: `Deleted enrollment request: ${id}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ requestId: id }, 'Enrollment request deleted.', startTime, correlationId);
      }

      default:
        throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${action}`);
    }
  } catch (error: any) {
    DI.logger.error(`Enrollment action failed: ${action}`, { error, correlationId });

    // Error audit log
    await DI.db.collection('auditLogs').add({
      action: 'ERROR', collection: 'enrollmentRequests',
      targetId: id || 'unknown', performedBy: authContext.auth.uid,
      description: `Failed enrollment action ${action}: ${error.message}`,
      timestamp: new Date(), success: false, correlationId
    });

    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', `Failed to process enrollment action: ${action}`);
  }
});
