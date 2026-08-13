/**
 * @file PresenceController.js
 * @purpose Controller for Presence and Session management.
 * Tracks user presence, heartbeat, connection quality, and reconnect statistics.
 * Implements "Master Tab" logic to prevent duplicate tracking across multiple tabs.
 */
import { PresenceService } from './PresenceService.js';
import { stateStore } from '../../core/StateStore.js';
import { eventBus as EventBus, Events } from '../../core/EventBus.js';

export class PresenceControllerClass {
    constructor() {
        this.unsubscribe = null;
        this.heartbeatInterval = null;
        this.sessionStartTime = null;
        this.reconnectCount = 0;
        this.wasOffline = false;
        
        // Master Tab variables
        this.tabId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        this.masterKey = null;
        this.heartbeatKey = null;

        this.courseId = null;
        this.userData = null;
        this.engineState = null;
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

        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 30000); // Send heartbeat every 30 seconds

        this.attachNetworkListeners();
        this.attachVisibilityListeners();

        // Cleanup on unload
        window.addEventListener('beforeunload', () => {
            this.stopPresenceSession(this.courseId, this.userData.username || this.userData.uid);
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
        window.addEventListener('offline', () => {
            this.wasOffline = true;
        });

        window.addEventListener('online', () => {
            if (this.wasOffline) {
                this.reconnectCount++;
                this.wasOffline = false;
                this.sendHeartbeat(); // Immediate heartbeat on reconnect
            }
        });
    }

    attachVisibilityListeners() {
        if (this.visibilityListenersAttached) return;
        this.visibilityListenersAttached = true;
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'visible') {
                this.sendHeartbeat();
            }
        });
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
            lastSeen: new Date(), // Replaced by serverTimestamp in service
            currentLesson: this.engineState?.presentation?.videoUrl || null,
            teachingMode: this.engineState?.room?.mode || 'video',
            bandwidthMode: this.engineState?.network?.lowBandwidth ? 'reduced' : 'normal',
            reconnectCount: this.reconnectCount,
            sessionDurationMinutes: sessionDurationMinutes,
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        };

        try {
            await PresenceService.markUserOnline(this.courseId, data.userId, data);
        } catch (e) {
            console.warn("[PresenceController] Heartbeat failed", e);
        }
    }

    /**
     * Stop presence session
     */
    async stopPresenceSession(courseId, username) {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.isMaster()) {
            localStorage.removeItem(this.masterKey);
            localStorage.removeItem(this.heartbeatKey);
            
            if (courseId && username) {
                await PresenceService.markUserOffline(courseId, username);
            }
        }
    }

    /**
     * Listen to active users in a course
     */
    listenToActiveUsers(courseId, callback) {
        // Return a new snapshot listener for each caller. Callers should manage their own unsubscribe functions.
        return PresenceService.onPresenceSnapshot(courseId, callback);
    }
}

export const PresenceController = new PresenceControllerClass();
