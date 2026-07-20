import * as functions from 'firebase-functions';
import { DI } from '../../../shared/di.js';
import { AuthMiddleware } from '../../../shared/middleware/auth.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
import { Role } from '../../../shared/permissions/rbac.js';
import { parseRequest, ok } from '../../../shared/api/contract.js';
export const contact = functions.https.onCall(async (rawData, context) => {
    const startTime = performance.now();
    // 1. Security & Identity
    SecurityMiddleware.requireAppCheck(context);
    const authContext = AuthMiddleware.requireAuth(context);
    // 2. Parse unified request
    const req = parseRequest(rawData);
    const { action } = req;
    const payload = req.payload;
    const correlationId = req.metadata?.correlationId;
    const { id, name, email, message, subject, replyMessage } = payload;
    // 3. Idempotency
    await SecurityMiddleware.enforceIdempotency(correlationId);
    const isAdmin = authContext.role === Role.ADMIN || authContext.role === Role.SUPER_ADMIN;
    try {
        switch (action) {
            // ── ADD (public submission — any authenticated user) ─────────────────
            case 'add': {
                if (!name || !email || !message) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing name, email, or message.');
                }
                const docRef = DI.db.collection('messages').doc();
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                batch.set(docRef, {
                    name, email, message, subject: subject || '',
                    status: 'unread',
                    submittedBy: authContext.auth.uid,
                    createdAt: new Date().toISOString()
                });
                batch.set(auditRef, {
                    action: 'CREATE', collection: 'messages',
                    targetId: docRef.id, performedBy: authContext.auth.uid,
                    description: `New contact message from: ${email}`,
                    timestamp: new Date(), success: true, correlationId
                });
                await batch.commit();
                return ok({ messageId: docRef.id }, 'Message sent successfully.', startTime, correlationId);
            }
            // ── MARK READ ────────────────────────────────────────────────────────
            case 'markRead': {
                if (!isAdmin)
                    throw new functions.https.HttpsError('permission-denied', 'Only admins can mark messages.');
                if (!id)
                    throw new functions.https.HttpsError('invalid-argument', 'Missing id.');
                const docRef = DI.db.collection('messages').doc(id);
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                batch.update(docRef, { status: 'read', readAt: new Date().toISOString(), readBy: authContext.auth.uid });
                batch.set(auditRef, {
                    action: 'MARK_READ', collection: 'messages',
                    targetId: id, performedBy: authContext.auth.uid,
                    description: `Marked message as read: ${id}`,
                    timestamp: new Date(), success: true, correlationId
                });
                await batch.commit();
                return ok({ id }, 'Message marked as read.', startTime, correlationId);
            }
            // ── REPLY ────────────────────────────────────────────────────────────
            case 'reply': {
                if (!isAdmin)
                    throw new functions.https.HttpsError('permission-denied', 'Only admins can reply to messages.');
                if (!id || !replyMessage)
                    throw new functions.https.HttpsError('invalid-argument', 'Missing id or replyMessage.');
                const docRef = DI.db.collection('messages').doc(id);
                const replyRef = DI.db.collection('messages').doc(id).collection('replies').doc();
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                // Update parent message status to 'replied'
                batch.update(docRef, { status: 'replied', repliedAt: new Date().toISOString() });
                // Store the reply in a sub-collection
                batch.set(replyRef, {
                    message: replyMessage,
                    repliedBy: authContext.auth.uid,
                    repliedAt: new Date().toISOString()
                });
                batch.set(auditRef, {
                    action: 'REPLY', collection: 'messages',
                    targetId: id, performedBy: authContext.auth.uid,
                    description: `Replied to message: ${id}`,
                    timestamp: new Date(), success: true, correlationId
                });
                await batch.commit();
                return ok({ id, replyId: replyRef.id }, 'Reply sent.', startTime, correlationId);
            }
            // ── DELETE ───────────────────────────────────────────────────────────
            case 'delete': {
                if (!isAdmin)
                    throw new functions.https.HttpsError('permission-denied', 'Only admins can delete messages.');
                if (!id)
                    throw new functions.https.HttpsError('invalid-argument', 'Missing id.');
                const docRef = DI.db.collection('messages').doc(id);
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                batch.delete(docRef);
                batch.set(auditRef, {
                    action: 'DELETE', collection: 'messages',
                    targetId: id, performedBy: authContext.auth.uid,
                    description: `Deleted message: ${id}`,
                    timestamp: new Date(), success: true, correlationId
                });
                await batch.commit();
                return ok({ id }, 'Message deleted.', startTime, correlationId);
            }
            default:
                throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${action}`);
        }
    }
    catch (error) {
        DI.logger.error(`Contact action failed: ${action}`, { error, correlationId });
        await DI.db.collection('auditLogs').add({
            action: 'ERROR', collection: 'messages',
            targetId: id || 'unknown', performedBy: authContext.auth.uid,
            description: `Failed contact action ${action}: ${error.message}`,
            timestamp: new Date(), success: false, correlationId
        });
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError('internal', `Failed to process contact action: ${action}`);
    }
});
//# sourceMappingURL=contact.js.map