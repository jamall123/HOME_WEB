/**
 * @file SessionManager.js
 * @purpose Manages application layer isolation for lesson sessions, supporting multi-tab.
 */

import { SessionCache } from './SessionCache.js';

class SessionManagerClass {
    constructor() {
        this.currentSessionId = null;
        this.currentCourseId = null;
        this.currentLessonId = null;
        this.sessionToken = null; // Session Guard token
        this._listeners = new Set();
    }

    /**
     * Initializes a new session.
     */
    async createSession(courseId, lessonId) {
        this.currentCourseId = courseId;
        this.currentLessonId = lessonId || 'global';
        this.currentSessionId = `${courseId}_${this.currentLessonId}`;
        
        // Generate a new Session Guard token
        this.sessionToken = Symbol(this.currentSessionId);
        
        // Ensure Cache is ready
        SessionCache.getLessonCache(this.currentSessionId);
        
        console.log(`[SessionManager] Created Session: ${this.currentSessionId}`);
        return this.sessionToken;
    }

    /**
     * Switches the active session.
     */
    async switchSession(courseId, newLessonId) {
        console.log(`[SessionManager] Switching to ${courseId}_${newLessonId}`);
        await this.destroySession();
        return await this.createSession(courseId, newLessonId);
    }

    /**
     * Destroys current session and forcefully unbinds resources.
     */
    async destroySession() {
        if (!this.currentSessionId) return;
        console.log(`[SessionManager] Destroying Session: ${this.currentSessionId}`);
        
        // Clear all active firebase listeners for the current session
        for (const unbind of this._listeners) {
            if (typeof unbind === 'function') unbind();
        }
        this._listeners.clear();
        
        // Invalidate the session token
        this.sessionToken = null;
        this.currentSessionId = null;
        this.currentLessonId = null;
    }

    /**
     * Registers a listener to be destroyed when session ends.
     */
    registerListener(unbindFn) {
        if (typeof unbindFn === 'function') {
            this._listeners.add(unbindFn);
        }
    }

    /**
     * Verifies if a given token is still the active session token.
     * Use this after async operations to prevent race conditions.
     */
    isValidSession(token) {
        return this.sessionToken === token;
    }

    /**
     * Gets the current session ID.
     */
    getSessionId() {
        return this.currentSessionId;
    }
}

export const SessionManager = new SessionManagerClass();
window.SessionManager = SessionManager; // For debugging
