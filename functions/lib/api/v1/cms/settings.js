import * as functions from 'firebase-functions';
import { DI } from '../../../shared/di.js';
import { AuthMiddleware } from '../../../shared/middleware/auth.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
import { Role } from '../../../shared/permissions/rbac.js';
import { parseRequest, ok } from '../../../shared/api/contract.js';
export const settings = functions.https.onCall(async (rawData, context) => {
    const startTime = performance.now();
    // 1. Security & Identity
    SecurityMiddleware.requireAppCheck(context);
    const authContext = AuthMiddleware.requireAuth(context);
    // 2. RBAC — only ADMIN and SUPER_ADMIN may touch settings
    if (authContext.role !== Role.ADMIN && authContext.role !== Role.SUPER_ADMIN) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can manage site settings.');
    }
    // 3. Parse unified request
    const req = parseRequest(rawData);
    const { action } = req;
    const payload = req.payload;
    const correlationId = req.metadata?.correlationId;
    const { section, data: settingsData } = payload;
    // 4. Idempotency
    await SecurityMiddleware.enforceIdempotency(correlationId);
    try {
        switch (action) {
            // ── GET ──────────────────────────────────────────────────────────────
            case 'get': {
                if (!section)
                    throw new functions.https.HttpsError('invalid-argument', 'Missing section.');
                const snap = await DI.db.collection('siteSettings').doc(section).get();
                return ok({ section, data: snap.exists ? snap.data() : null }, 'Settings retrieved.', startTime, correlationId);
            }
            // ── SAVE ─────────────────────────────────────────────────────────────
            case 'save': {
                if (!section || !settingsData) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing section or data.');
                }
                const docRef = DI.db.collection('siteSettings').doc(section);
                const auditRef = DI.db.collection('auditLogs').doc();
                const batch = DI.db.batch();
                batch.set(docRef, {
                    ...settingsData,
                    updatedAt: new Date().toISOString(),
                    updatedBy: authContext.auth.uid
                }, { merge: true });
                batch.set(auditRef, {
                    action: 'SAVE_SETTINGS',
                    collection: 'siteSettings',
                    targetId: section,
                    performedBy: authContext.auth.uid,
                    description: `Saved settings section: ${section}`,
                    timestamp: new Date(),
                    success: true,
                    correlationId
                });
                await batch.commit();
                return ok({ section }, `Settings section "${section}" saved.`, startTime, correlationId);
            }
            default:
                throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${action}`);
        }
    }
    catch (error) {
        DI.logger.error(`Settings action failed: ${action}`, { error, correlationId });
        await DI.db.collection('auditLogs').add({
            action: 'ERROR', collection: 'siteSettings',
            targetId: section || 'unknown', performedBy: authContext.auth.uid,
            description: `Failed settings action ${action}: ${error.message}`,
            timestamp: new Date(), success: false, correlationId
        });
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError('internal', `Failed to process settings action: ${action}`);
    }
});
//# sourceMappingURL=settings.js.map