import * as admin from 'firebase-admin';

export interface AuditRecord {
  who: string; // userId
  when: string; // ISO Timestamp
  ip?: string;
  device?: string;
  action: string;
  oldData?: any;
  newData?: any;
  collection: string;
  documentId: string;
  durationMs?: number;
  requestId?: string;
}

export class AuditService {
  constructor(private db: admin.firestore.Firestore) {}

  async logAction(record: AuditRecord): Promise<void> {
    try {
      await this.db.collection('system_audit_logs').add({
        ...record,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to write audit log', error);
      // We don't throw here to avoid blocking the main transaction, 
      // but in strict systems we might.
    }
  }
}
