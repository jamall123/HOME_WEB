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
        if (!this.isOnline || this.isSyncing) return;
        
        this.isSyncing = true;
        try {
            const pendingOps = await OfflineQueueDb.getAll('metadata_sync');
            if (pendingOps.length === 0) return;

            // console.log(`[OfflineSyncEngine] Syncing ${pendingOps.length} pending operations...`);
            
            for (const op of pendingOps) {
                // Guard against corrupt/stale data
                if (!op || !op.collection || !op.docId || !op.data) {
                    console.warn('[OfflineSyncEngine] Corrupt operation detected. Removing:', op ? op.syncId : 'unknown');
                    if (op && op.syncId) await OfflineQueueDb.delete('metadata_sync', op.syncId);
                    continue;
                }

                // If operation is older than 30 days, consider it stale
                const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
                if (Date.now() - (op.timestamp || 0) > THIRTY_DAYS) {
                    console.warn('[OfflineSyncEngine] Stale operation detected. Moving to DLQ:', op.syncId);
                    op.errorReason = 'Stale operation (too old)';
                    op.dlqTimestamp = Date.now();
                    await OfflineQueueDb.put('offline_dlq', op);
                    await OfflineQueueDb.delete('metadata_sync', op.syncId);
                    continue;
                }

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
        } finally {
            this.isSyncing = false;
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

    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        // Also could remove event listeners, but typically OfflineSyncEngine is a global singleton
    }
}
export const OfflineSyncEngine = new OfflineSyncEngineClass();
