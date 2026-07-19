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
            const batch = db.batch();

            for (const op of pendingOps) {
                const docRef = db.collection(op.collection).doc(op.docId);
                if (op.action === 'set') {
                    batch.set(docRef, op.data, { merge: true });
                } else if (op.action === 'update') {
                    batch.update(docRef, op.data);
                } else if (op.action === 'delete') {
                    batch.delete(docRef);
                }
            }

            await batch.commit();

            // Clear successful syncs
            for (const op of pendingOps) {
                await OfflineQueueDb.delete('metadata_sync', op.syncId);
            }
            // console.log('[OfflineSyncEngine] Sync completed successfully.');
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
