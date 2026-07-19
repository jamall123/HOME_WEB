/**
 * OfflineManager.js
 * Intercepts failed actions, queues them locally, and flushes on reconnect.
 */

class OfflineManagerClass {
    constructor() {
        this.isFlushing = false;
        this.init();
    }

    init() {
        window.addEventListener('online', () => {
            this.flushQueues();
        });
    }

    async flushQueues() {
        if (this.isFlushing || !navigator.onLine) return;
        this.isFlushing = true;

        // console.log("[OfflineManager] Network restored. Flushing offline queues...");

        try {
            // 1. Flush Chat Queue
            import('./ChatController.js').then(({ ChatController }) => {
                ChatController.syncOfflineQueue();
            });

            // 2. Flush Progress / Attendance
            import('./AttendanceController.js').then(({ AttendanceController }) => {
                AttendanceController.syncOfflineQueue();
            });
            
            // 3. RoomEngine syncs state natively via listeners once online
        } catch (error) {
            console.error("[OfflineManager] Error flushing queues", error);
        } finally {
            this.isFlushing = false;
        }
    }
}

export const OfflineManager = new OfflineManagerClass();
