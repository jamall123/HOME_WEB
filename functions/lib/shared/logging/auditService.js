import * as admin from 'firebase-admin';
export class AuditService {
    db;
    constructor(db) {
        this.db = db;
    }
    async logAction(record) {
        try {
            await this.db.collection('system_audit_logs').add({
                ...record,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        catch (error) {
            console.error('Failed to write audit log', error);
            // We don't throw here to avoid blocking the main transaction, 
            // but in strict systems we might.
        }
    }
}
//# sourceMappingURL=auditService.js.map