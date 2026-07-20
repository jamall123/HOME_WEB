import * as functions from 'firebase-functions';
import { DI } from '../../../shared/di.js';
import { AuthMiddleware } from '../../../shared/middleware/auth.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
import { Role } from '../../../shared/permissions/rbac.js';
import { parseRequest, ok } from '../../../shared/api/contract.js';

// Allowed entities for this aggregate function
const ALLOWED_ENTITIES = ['post', 'story', 'project', 'page'] as const;
type ContentEntity = typeof ALLOWED_ENTITIES[number];

// Map entity → Firestore collection
const ENTITY_COLLECTION: Record<ContentEntity, string> = {
  post: 'posts',
  story: 'stories',
  project: 'projects',
  page: 'pageContent'
};

// Which roles may write content
const WRITE_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.AUTHOR];

export const content = functions.https.onCall(async (rawData, context) => {
  const startTime = performance.now();

  // 1. Security & Identity
  SecurityMiddleware.requireAppCheck(context);
  const authContext = AuthMiddleware.requireAuth(context);

  // 2. Parse unified request
  const req = parseRequest(rawData);
  const { action, entity } = req;
  const payload = req.payload;
  const correlationId = req.metadata?.correlationId;
  const { id, data: contentData } = payload;

  // 3. Validate entity
  if (!entity || !ALLOWED_ENTITIES.includes(entity as ContentEntity)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Invalid entity. Must be one of: ${ALLOWED_ENTITIES.join(', ')}.`
    );
  }
  const collection = ENTITY_COLLECTION[entity as ContentEntity];

  // 4. Idempotency
  await SecurityMiddleware.enforceIdempotency(correlationId);

  const isAdmin = authContext.role === Role.ADMIN || authContext.role === Role.SUPER_ADMIN;
  const canWrite = WRITE_ROLES.includes(authContext.role);

  try {
    switch (action) {
      // ── SAVE (create or update) ──────────────────────────────────────────
      case 'save': {
        if (!canWrite) {
          throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions to save content.');
        }
        if (!contentData) throw new functions.https.HttpsError('invalid-argument', 'Missing data in payload.');

        const docRef = id
          ? DI.db.collection(collection).doc(id)
          : DI.db.collection(collection).doc();

        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        const enriched = {
          ...contentData,
          updatedAt: new Date().toISOString(),
          updatedBy: authContext.auth.uid,
          ...(!id ? { createdAt: new Date().toISOString(), createdBy: authContext.auth.uid } : {})
        };

        batch.set(docRef, enriched, { merge: true });
        batch.set(auditRef, {
          action: id ? 'UPDATE' : 'CREATE',
          collection,
          targetId: docRef.id,
          performedBy: authContext.auth.uid,
          description: `Saved ${entity}: ${contentData.title || docRef.id}`,
          timestamp: new Date(),
          success: true,
          correlationId
        });
        await batch.commit();

        return ok({ id: docRef.id }, `${entity} saved successfully.`, startTime, correlationId);
      }

      // ── PUBLISH ──────────────────────────────────────────────────────────
      case 'publish': {
        if (!isAdmin && authContext.role !== Role.EDITOR) {
          throw new functions.https.HttpsError('permission-denied', 'Only admins/editors can publish content.');
        }
        if (!id) throw new functions.https.HttpsError('invalid-argument', 'Missing id.');

        const docRef = DI.db.collection(collection).doc(id);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(docRef, { status: 'published', publishedAt: new Date().toISOString(), publishedBy: authContext.auth.uid });
        batch.set(auditRef, {
          action: 'PUBLISH', collection,
          targetId: id, performedBy: authContext.auth.uid,
          description: `Published ${entity}: ${id}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ id }, `${entity} published.`, startTime, correlationId);
      }

      // ── UNPUBLISH ────────────────────────────────────────────────────────
      case 'unpublish': {
        if (!isAdmin && authContext.role !== Role.EDITOR) {
          throw new functions.https.HttpsError('permission-denied', 'Only admins/editors can unpublish content.');
        }
        if (!id) throw new functions.https.HttpsError('invalid-argument', 'Missing id.');

        const docRef = DI.db.collection(collection).doc(id);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(docRef, { status: 'draft', unpublishedAt: new Date().toISOString() });
        batch.set(auditRef, {
          action: 'UNPUBLISH', collection,
          targetId: id, performedBy: authContext.auth.uid,
          description: `Unpublished ${entity}: ${id}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ id }, `${entity} set back to draft.`, startTime, correlationId);
      }

      // ── DELETE ───────────────────────────────────────────────────────────
      case 'delete': {
        if (!isAdmin && authContext.role !== Role.EDITOR) {
          throw new functions.https.HttpsError('permission-denied', 'Only admins/editors can delete content.');
        }
        if (!id) throw new functions.https.HttpsError('invalid-argument', 'Missing id.');

        const docRef = DI.db.collection(collection).doc(id);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.delete(docRef);
        batch.set(auditRef, {
          action: 'DELETE', collection,
          targetId: id, performedBy: authContext.auth.uid,
          description: `Deleted ${entity}: ${id}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ id }, `${entity} deleted.`, startTime, correlationId);
      }

      default:
        throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${action}`);
    }
  } catch (error: any) {
    DI.logger.error(`CMS content action failed: ${action} on ${entity}`, { error, correlationId });

    await DI.db.collection('auditLogs').add({
      action: 'ERROR', collection: collection || 'unknown',
      targetId: id || 'unknown', performedBy: authContext.auth.uid,
      description: `Failed ${entity} action ${action}: ${error.message}`,
      timestamp: new Date(), success: false, correlationId
    });

    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', `Failed to process ${entity} action: ${action}`);
  }
});
