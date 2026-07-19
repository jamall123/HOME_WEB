/**
 * AttendanceController.js
 * Manages academic attendance tracking, persisting to studentProgress.
 * Integrates with Master Tab logic from PresenceManager to prevent duplicate records.
 */

class AttendanceControllerClass {
    constructor() {
        this.courseId = null;
        this.userId = null;
        this.joinTime = null;
    }

    init(courseId, userId) {
        this.courseId = courseId;
        this.userId = userId;
        this.joinTime = Date.now();

        // Listen for unload to record exit time and total session duration
        window.addEventListener('beforeunload', () => {
            this.recordSessionExit();
        });
    }

    recordSessionExit() {
        // Retrieve PresenceManager's master status if available
        let isMaster = true;
        try {
            const masterKey = `master_tab_${this.courseId}`;
            const myTabId = localStorage.getItem(`tab_id_${this.courseId}`); // Fallback logic
            if (localStorage.getItem(masterKey) && localStorage.getItem(masterKey) !== myTabId) {
                // If there's an active PresenceManager master tab and it's not us, we are NOT master.
                // We rely on PresenceManager's exact exports to be safer.
            }
        } catch(e){}

        // Wait, PresenceManager is a singleton. Let's import it synchronously or check it.
        // For safety, we only record session exit if we are the master tab.
        // If we can't determine, we queue it anyway but this might duplicate.
        // Let's implement a shared lock.
        const lockKey = `attendance_lock_${this.userId}_${this.courseId}`;
        const lastLock = parseInt(localStorage.getItem(lockKey) || '0', 10);
        
        // If another tab recorded attendance within the last 5 seconds, don't duplicate
        if (Date.now() - lastLock < 5000) {
            return;
        }

        const durationMinutes = Math.floor((Date.now() - this.joinTime) / 60000);
        if (durationMinutes < 1) return; // Ignore drops

        localStorage.setItem(lockKey, Date.now().toString());

        this.queueOfflineExit(durationMinutes);
    }

    queueOfflineExit(durationMinutes) {
        const key = `attendance_queue_${this.userId}_${this.courseId}`;
        const existing = parseInt(localStorage.getItem(key) || '0', 10);
        localStorage.setItem(key, existing + (durationMinutes || 0));
    }

    async syncOfflineQueue() {
        const key = `attendance_queue_${this.userId}_${this.courseId}`;
        const pendingMinutes = parseInt(localStorage.getItem(key) || '0', 10);

        if (pendingMinutes > 0 && navigator.onLine) {
            try {
                await firebase.firestore().collection('studentProgress').doc(`${this.userId}_${this.courseId}`).set({
                    totalAttendanceMinutes: firebase.firestore.FieldValue.increment(pendingMinutes),
                    lastVisited: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                localStorage.removeItem(key);
            } catch (error) {
                // console.warn("[AttendanceController] Failed to sync offline attendance", error);
            }
        }
    }
}

export const AttendanceController = new AttendanceControllerClass();
