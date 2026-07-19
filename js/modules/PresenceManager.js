/**
 * PresenceManager.js
 * Tracks user presence, heartbeat, connection quality, and reconnect statistics.
 * Implements "Master Tab" logic to prevent duplicate tracking across multiple tabs.
 */

class PresenceManagerClass {
    constructor() {
        this.engine = null;
        this.presenceRef = null;
        this.heartbeatInterval = null;
        this.sessionStartTime = null;
        this.reconnectCount = 0;
        this.wasOffline = false;
        
        // Master Tab variables
        this.tabId = this.generateUUID();
        this.masterKey = null;
        this.heartbeatKey = null;
    }

    generateUUID() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    init(engine) {
        this.engine = engine;
        if (!this.engine.currentUser || !this.engine.courseId) return;

        this.masterKey = `master_tab_${this.engine.courseId}`;
        this.heartbeatKey = `last_heartbeat_${this.engine.courseId}`;
        
        this.sessionStartTime = Date.now();
        this.claimMasterIfNeeded();
        this.setupPresence();
        this.attachNetworkListeners();
        this.attachVisibilityListeners();
    }

    claimMasterIfNeeded() {
        const currentMaster = localStorage.getItem(this.masterKey);
        const lastHeartbeat = parseInt(localStorage.getItem(this.heartbeatKey) || '0', 10);
        
        // If no master, or master hasn't beat in 35 seconds, claim it
        if (!currentMaster || currentMaster === this.tabId || (Date.now() - lastHeartbeat) > 35000) {
            localStorage.setItem(this.masterKey, this.tabId);
            localStorage.setItem(this.heartbeatKey, Date.now().toString());
            return true;
        }
        return false;
    }

    isMaster() {
        return localStorage.getItem(this.masterKey) === this.tabId;
    }

    setupPresence() {
        const db = firebase.firestore();
        this.presenceRef = db.collection('courses').doc(this.engine.courseId)
            .collection('connected_users').doc(this.engine.currentUser.uid);

        this.sendHeartbeat();

        // 30 second heartbeat
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 30000);

        window.addEventListener('beforeunload', () => {
            this.leave();
        });
    }

    attachNetworkListeners() {
        window.addEventListener('offline', () => {
            this.wasOffline = true;
            // console.warn("[PresenceManager] Network offline detected.");
        });

        window.addEventListener('online', () => {
            if (this.wasOffline) {
                this.reconnectCount++;
                this.wasOffline = false;
                // console.log(`[PresenceManager] Reconnected. Count: ${this.reconnectCount}`);
                this.sendHeartbeat(); // Immediate heartbeat on reconnect
            }
        });
    }

    attachVisibilityListeners() {
        // Handle iOS/Android browser backgrounding (Sleep Mode)
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'visible') {
                // We woke up from background/sleep, force a heartbeat to prove we are alive
                this.sendHeartbeat();
            }
        });
    }

    async sendHeartbeat() {
        if (!navigator.onLine) return;
        
        const claimed = this.claimMasterIfNeeded();
        if (!claimed && !this.isMaster()) {
            return; // Not master tab, do not send heartbeat to save Firestore writes
        }

        // If we are master, update the heartbeat key
        localStorage.setItem(this.heartbeatKey, Date.now().toString());

        if (!this.presenceRef) return;

        const sessionDurationMinutes = Math.floor((Date.now() - this.sessionStartTime) / 60000);

        try {
            await this.presenceRef.set({
                userId: this.engine.currentUser.uid,
                userName: this.engine.currentUser.displayName || 'طالب',
                role: this.engine.isInstructor ? 'instructor' : 'student',
                lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                currentLesson: this.engine.state?.presentation?.videoUrl || null,
                teachingMode: this.engine.state?.room?.mode || 'video',
                bandwidthMode: this.engine.state?.network?.lowBandwidth ? 'reduced' : 'normal',
                reconnectCount: this.reconnectCount,
                sessionDurationMinutes: sessionDurationMinutes,
                device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
            }, { merge: true });
        } catch (e) {
            // console.warn("[PresenceManager] Heartbeat failed", e);
        }
    }

    async leave() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        if (this.isMaster()) {
            localStorage.removeItem(this.masterKey);
            localStorage.removeItem(this.heartbeatKey);
            
            if (this.presenceRef) {
                try {
                    await this.presenceRef.delete(); // Explicitly remove on clean exit
                } catch (e) {
                    // console.warn("[PresenceManager] Failed to leave cleanly", e);
                }
            }
        }
    }
}

export const PresenceManager = new PresenceManagerClass();
