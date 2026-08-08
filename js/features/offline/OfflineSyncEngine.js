/**
 * OfflineSyncEngine.js
 * Synchronizes offline mutations when internet connection is restored.
 */

import { OfflineQueueDb } from './OfflineQueueDb.js';
import { OfflineSyncRepository } from '../../repositories/OfflineSyncRepository.js';

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
            
            for (const op of pendingOps) {
                try {
                    await OfflineSyncRepository.executeSyncOperation(op.collection, op.docId, op.action, op.data);
                    // Clear successful syncs
                    await OfflineQueueDb.delete('metadata_sync', op.syncId);
                } catch (err) {
                    console.error('[OfflineSyncEngine] Operation rejected by server:', op.syncId, err);
                    
                    // Increment retry count
                    op.retryCount = (op.retryCount || 0) + 1;
                    
                    if (op.retryCount >= 3) {
                        console.warn('[OfflineSyncEngine] Max retries reached. Moving to DLQ:', op.syncId);
                        // Move to Dead Letter Queue
                        op.errorReason = err.message || 'Unknown error';
                        op.dlqTimestamp = Date.now();
                        await OfflineQueueDb.put('offline_dlq', op);
                        // Remove from active queue
                        await OfflineQueueDb.delete('metadata_sync', op.syncId);
                    } else {
                        // Update the operation with new retry count
                        await OfflineQueueDb.put('metadata_sync', op);
                    }
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
