/**
 * @file PresenceController.js
 * @purpose Controller for Presence and Session management.
 * Tracks user presence, heartbeat, connection quality, and reconnect statistics.
 * Implements "Master Tab" logic to prevent duplicate tracking across multiple tabs.
 */
import { PresenceService } from './PresenceService.js';
import { stateStore } from '../../core/StateStore.js';
import { eventBus as EventBus, Events } from '../../core/EventBus.js';
import { SessionManager } from '../../core/SessionManager.js';

export class PresenceControllerClass {
    constructor() {
        this.unsubscribe = null;
        this.unsubscribeActiveSession = null;
        this.heartbeatInterval = null;
        this.sessionStartTime = null;
        this.reconnectCount = 0;
        this.wasOffline = false;
        
        // Master Tab variables
        this.tabId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        this.masterKey = null;
        this.heartbeatKey = null;

        // Device session (persisted across reloads and tabs on the same browser)
        this.deviceSessionId = localStorage.getItem('device_session_id') || sessionStorage.getItem('device_session_id');
        if (!this.deviceSessionId) {
            this.deviceSessionId = this.tabId;
            localStorage.setItem('device_session_id', this.deviceSessionId);
            sessionStorage.setItem('device_session_id', this.deviceSessionId);
        }

        this.courseId = null;
        this.userData = null;
        this.engineState = null;
        
        // Stored references to remove event listeners later
        this._beforeUnloadHandler = null;
        this._networkOnlineHandler = null;
        this._networkOfflineHandler = null;
        this._visibilityHandler = null;
    }

    /**
     * Start presence session for the current user in a course
     */
    async startPresenceSession(courseId, userData, engineState = null) {
        if (!courseId || !userData || (!userData.username && !userData.uid)) return;

        this.courseId = courseId;
        this.userData = userData;
        this.engineState = engineState;

        this.masterKey = `master_tab_${this.courseId}`;
        this.heartbeatKey = `last_heartbeat_${this.courseId}`;
        this.sessionStartTime = Date.now();

        this.claimMasterIfNeeded();
        
        // Initial heartbeat
        this.sendHeartbeat();

        if (this.heartbeatInterval) clearTimeout(this.heartbeatInterval);
        
        const heartbeatLoop = () => {
            this.sendHeartbeat();
            this.heartbeatInterval = setTimeout(heartbeatLoop, 30000);
        };
        
        this.heartbeatInterval = setTimeout(heartbeatLoop, 30000);

        this.attachNetworkListeners();
        this.attachVisibilityListeners();

        // Listen for another device joining
        this.listenToActiveSession();

        // Listen for global events to stop session
        if (!this.globalListenersAttached) {
            this.globalListenersAttached = true;
            EventBus.subscribe(Events.AUTH_STATE_CHANGED, (user) => {
                if (!user) {
                    this.stopPresenceSession(this.courseId, this.userData?.username || this.userData?.uid);
                }
            });
            EventBus.subscribe(Events.PLAY_LECTURE, () => {
                // The lesson changed. We can send an immediate heartbeat to reflect the new lesson.
                this.sendHeartbeat();
            });
        }

        // Cleanup on unload — remove any previously registered handler first
        if (this._beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
        }
        this._beforeUnloadHandler = () => {
            this.stopPresenceSession(this.courseId, this.userData.username || this.userData.uid);
        };
        window.addEventListener('beforeunload', this._beforeUnloadHandler);
    }

    listenToActiveSession() {
        if (this.unsubscribeActiveSession) {
            this.unsubscribeActiveSession();
        }
        
        const userId = this.userData.uid || this.userData.username;
        this.unsubscribeActiveSession = PresenceService.onActiveSessionSnapshot(this.courseId, userId, (doc) => {
            if (doc && doc.deviceSessionId && doc.deviceSessionId !== this.deviceSessionId) {
                // Wait 3 seconds grace period to ensure this isn't just a race condition
                setTimeout(() => {
                    // Check if it's still mismatched
                    // (we could check doc again but we assume if they are still mismatched after 3s we kick)
                    this.handleMultipleDevices();
                }, 3000);
            }
        });
    }

    handleMultipleDevices() {
        if (this.heartbeatInterval) {
            clearTimeout(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.unsubscribeActiveSession) {
            this.unsubscribeActiveSession();
            this.unsubscribeActiveSession = null;
        }

        EventBus.emit(Events.MULTIPLE_DEVICES_DETECTED, {
            message: 'تم تسجيل الدخول من جهاز آخر. سيتم إنهاء الجلسة الحالية.'
        });
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

    attachNetworkListeners() {
        if (this.networkListenersAttached) return;
        this.networkListenersAttached = true;
        this._networkOfflineHandler = () => {
            this.wasOffline = true;
        };
        this._networkOnlineHandler = () => {
            if (this.wasOffline) {
                this.reconnectCount++;
                this.wasOffline = false;
                this.sendHeartbeat(); // Immediate heartbeat on reconnect
            }
        };
        window.addEventListener('offline', this._networkOfflineHandler);
        window.addEventListener('online', this._networkOnlineHandler);
    }

    attachVisibilityListeners() {
        if (this.visibilityListenersAttached) return;
        this.visibilityListenersAttached = true;
        this._visibilityHandler = () => {
            if (document.visibilityState === 'visible') {
                this.sendHeartbeat();
            }
        };
        document.addEventListener('visibilitychange', this._visibilityHandler);
    }

    async sendHeartbeat() {
        if (!navigator.onLine || !this.courseId || !this.userData) return;
        
        const claimed = this.claimMasterIfNeeded();
        if (!claimed && !this.isMaster()) {
            return; // Not master tab, do not send heartbeat to save writes
        }

        localStorage.setItem(this.heartbeatKey, Date.now().toString());

        const sessionDurationMinutes = Math.floor((Date.now() - this.sessionStartTime) / 60000);

        const data = {
            userId: this.userData.uid || this.userData.username,
            name: this.userData.name || this.userData.displayName || 'طالب',
            username: this.userData.username || 'student',
            role: this.userData.role || 'student',
            deviceSessionId: this.deviceSessionId, // Used for multiple device kicking
            lastSeen: new Date(), // Replaced by serverTimestamp in service
            currentLesson: this.engineState?.presentation?.videoUrl || null,
            teachingMode: this.engineState?.room?.mode || 'video',
            bandwidthMode: this.engineState?.network?.lowBandwidth ? 'reduced' : 'normal',
            reconnectCount: this.reconnectCount,
            sessionDurationMinutes: sessionDurationMinutes,
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        };

        try {
            const lessonId = SessionManager.currentLessonId || 'global';
            await PresenceService.markUserOnline(this.courseId, lessonId, data.userId, data);
            await PresenceService.updateActiveSession(this.courseId, data.userId, data);
        } catch (e) {
            console.warn("[PresenceController] Heartbeat failed", e);
        }
    }

    /**
     * Stop presence session
     */
    async stopPresenceSession(courseId, username) {
        if (this.heartbeatInterval) {
            clearTimeout(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.unsubscribeActiveSession) {
            this.unsubscribeActiveSession();
            this.unsubscribeActiveSession = null;
        }
        if (this._beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
            this._beforeUnloadHandler = null;
        }
        if (this._networkOnlineHandler) {
            window.removeEventListener('online', this._networkOnlineHandler);
            this._networkOnlineHandler = null;
        }
        if (this._networkOfflineHandler) {
            window.removeEventListener('offline', this._networkOfflineHandler);
            this._networkOfflineHandler = null;
        }
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            this._visibilityHandler = null;
        }
        
        this.networkListenersAttached = false;
        this.visibilityListenersAttached = false;
        
        if (this.isMaster()) {
            localStorage.removeItem(this.masterKey);
            localStorage.removeItem(this.heartbeatKey);
            
            if (courseId && username) {
                await PresenceService.markUserOffline(courseId, username);
            }
        }
    }

    /**
     * Listen to active users in a course/lesson
     */
    listenToActiveUsers(courseId, lessonId, callback) {
        // Return a new snapshot listener for each caller. Callers should manage their own unsubscribe functions.
        return PresenceService.onPresenceSnapshot(courseId, lessonId, callback);
    }

    async destroy() {
        if (this.courseId && this.userData) {
            await this.stopPresenceSession(this.courseId, this.userData.uid || this.userData.username);
        }
        
        if (this._beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
            this._beforeUnloadHandler = null;
        }
        if (this._networkOnlineHandler) {
            window.removeEventListener('online', this._networkOnlineHandler);
            this._networkOnlineHandler = null;
        }
        if (this._networkOfflineHandler) {
            window.removeEventListener('offline', this._networkOfflineHandler);
            this._networkOfflineHandler = null;
        }
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            this._visibilityHandler = null;
        }
        
        this.networkListenersAttached = false;
        this.visibilityListenersAttached = false;
    }
}

export const PresenceController = new PresenceControllerClass();
