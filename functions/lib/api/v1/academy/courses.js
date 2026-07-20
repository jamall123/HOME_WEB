import * as functions from 'firebase-functions';
import { DI } from '../../../shared/di.js';
import { AuthMiddleware } from '../../../shared/middleware/auth.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
import { Role } from '../../../shared/permissions/rbac.js';
import { parseRequest, ok } from '../../../shared/api/contract.js';
export const courses = functions.https.onCall(async (rawData, context) => {
    const startTime = performance.now();
    // 1. Security & Identity
    SecurityMiddleware.requireAppCheck(context);
    const authContext = AuthMiddleware.requireAuth(context);
    // 2. Parse unified request
    const req = parseRequest(rawData);
    const { action } = req;
    const { id, courseData } = req.payload;
    const correlationId = req.metadata?.correlationId;
    // 3. Role-Based Access Control (RBAC)
    if (authContext.role !== Role.ADMIN && authContext.role !== Role.SUPER_ADMIN) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can manage courses.');
    }
    // 4. Idempotency Check
    await SecurityMiddleware.enforceIdempotency(correlationId);
    try {
        switch (action) {
            case 'save': {
                if (!id || !courseData)
                    throw new functions.https.HttpsError('invalid-argument', 'Missing id or courseData.');
                const docRef = DI.db.collection('courses').doc(id);
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                batch.set(docRef, courseData, { merge: true });
                batch.set(auditRef, {
                    action: 'SAVE',
                    collection: 'courses',
                    targetId: id,
                    performedBy: authContext.auth.uid,
                    description: `Saved course: ${courseData.title}`,
                    timestamp: new Date(),
                    success: true
                });
                await batch.commit();
                return ok({ courseId: id }, 'Course saved successfully.', startTime, correlationId);
            }
            case 'publish': {
                if (!id)
                    throw new functions.https.HttpsError('invalid-argument', 'Missing id.');
                const docRef = DI.db.collection('courses').doc(id);
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                batch.update(docRef, { status: 'published', publishedAt: new Date() });
                batch.set(auditRef, {
                    action: 'PUBLISH',
                    collection: 'courses',
                    targetId: id,
                    performedBy: authContext.auth.uid,
                    description: `Published course: ${id}`,
                    timestamp: new Date(),
                    success: true
                });
                await batch.commit();
                return ok({ courseId: id }, 'Course published.', startTime, correlationId);
            }
            case 'archive': {
                if (!id)
                    throw new functions.https.HttpsError('invalid-argument', 'Missing id.');
                const docRef = DI.db.collection('courses').doc(id);
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                batch.update(docRef, { status: 'archived', archivedAt: new Date() });
                batch.set(auditRef, {
                    action: 'ARCHIVE',
                    collection: 'courses',
                    targetId: id,
                    performedBy: authContext.auth.uid,
                    description: `Archived course: ${id}`,
                    timestamp: new Date(),
                    success: true
                });
                await batch.commit();
                return ok({ courseId: id }, 'Course archived.', startTime, correlationId);
            }
            case 'delete': {
                if (!id)
                    throw new functions.https.HttpsError('invalid-argument', 'Missing id.');
                const docRef = DI.db.collection('courses').doc(id);
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                batch.delete(docRef);
                batch.set(auditRef, {
                    action: 'DELETE',
                    collection: 'courses',
                    targetId: id,
                    performedBy: authContext.auth.uid,
                    description: `Deleted course: ${id}`,
                    timestamp: new Date(),
                    success: true
                });
                await batch.commit();
                return ok({ courseId: id }, 'Course deleted.', startTime, correlationId);
            }
            default:
                throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${action}`);
        }
    }
    catch (error) {
        DI.logger.error(`Course action failed: ${action}`, { error, correlationId });
        await DI.db.collection('auditLogs').add({
            action: 'ERROR',
            collection: 'courses',
            targetId: id || 'unknown',
            performedBy: authContext.auth.uid,
            description: `Failed course action ${action}: ${error.message}`,
            timestamp: new Date(),
            success: false,
            correlationId
        });
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError('internal', `Failed to process course action: ${action}`);
    }
});
//# sourceMappingURL=courses.js.map