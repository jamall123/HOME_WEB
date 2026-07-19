/**
 * OfflineSyncEngine.js
 * Synchronizes offline mutations when internet connection is restored.
 */

import { OfflineQueueDb } from './OfflineQueueDb.js';

export class OfflineSyncEngineClass {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncInterval = null;
    }

    async init() {
        await OfflineQueueDb.init();
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.triggerBackgroundSync();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Periodic scheduler fallback
        this.syncInterval = setInterval(() => this.triggerBackgroundSync(), 60000); // every 1 min
        
        // Initial sync on boot
        if (this.isOnline) {
            this.triggerBackgroundSync();
        }
    }

    async triggerBackgroundSync() {
        if (!this.isOnline) return;

        try {
            const pendingOps = await OfflineQueueDb.getAll('metadata_sync');
            if (pendingOps.length === 0) return;

            // console.log(`[OfflineSyncEngine] Syncing ${pendingOps.length} pending operations...`);
            
            const db = firebase.firestore();
            for (const op of pendingOps) {
                const docRef = db.collection(op.collection).doc(op.docId);
                try {
                    if (op.action === 'set') {
                        await docRef.set(op.data, { merge: true });
                    } else if (op.action === 'update') {
                        await docRef.update(op.data);
                    } else if (op.action === 'delete') {
                        await docRef.delete();
                    }
                    // Clear successful syncs
                    await OfflineQueueDb.delete('metadata_sync', op.syncId);
                } catch (err) {
                    console.error('[OfflineSyncEngine] Operation rejected by server. Removing to prevent queue lock:', op.syncId, err);
                    // Discard bad ops (like schema validation failures) to prevent infinite loop
                    await OfflineQueueDb.delete('metadata_sync', op.syncId);
                }
            }
            // console.log('[OfflineSyncEngine] Sync processing completed.');
        } catch (error) {
            console.error('[OfflineSyncEngine] Sync failed:', error);
        }
    }

    async queueOperation(collection, docId, action, data) {
        const op = {
            syncId: `${collection}_${docId}_${Date.now()}`,
            collection,
            docId,
            action,
            data,
            timestamp: Date.now()
        };
        await OfflineQueueDb.put('metadata_sync', op);
        if (this.isOnline) {
            this.triggerBackgroundSync();
        }
    }
}
export const OfflineSyncEngine = new OfflineSyncEngineClass();
