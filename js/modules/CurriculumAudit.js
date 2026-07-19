/**
 * CurriculumAudit.js
 * Creates audit logs and versions for curriculum changes.
 */

export const CurriculumAudit = {
    async logAction(action, entityId, entityType, oldData, newData, userId) {
        try {
            const batch = firebase.firestore().batch();
            
            // 1. Audit Log Entry
            const auditRef = firebase.firestore().collection('curriculumAuditLogs').doc();
            batch.set(auditRef, {
                action: action,
                entityId: entityId,
                entityType: entityType,
                userId: userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 2. Versioning (if data changed)
            if (oldData && newData) {
                const versionRef = firebase.firestore().collection('curriculumVersions').doc();
                batch.set(versionRef, {
                    entityId: entityId,
                    entityType: entityType,
                    versionData: newData,
                    previousData: oldData,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userId: userId
                });
            }

            await batch.commit();
        } catch (error) {
            console.error("[CurriculumAudit] Failed to log action", error);
            // We do not throw here to prevent blocking the main UI action,
            // but in a strict enterprise system, audit failure might require rollback.
        }
    }
};
