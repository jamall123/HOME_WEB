/**
 * @file EventBus.js
 * @purpose Provides a centralized publish-subscribe mechanism for isolated modules to communicate.
 * @responsibilities 
 *  - Route events between decoupled features.
 *  - Prevent memory leaks via active listener cleanup.
 *  - Provide wildcard debugging capabilities for monitoring events.
 * @dependencies None
 * @publicAPI subscribe (on), unsubscribe (off), once, emit, clearAll, enableDebugging
 * @futureMigrationPlan Modules should replace direct function calls to other domains with EventBus messages.
 */

export class EventBus {
    constructor() {
        /** @private */
        this.listeners = new Map();
        /** @private */
        this.debuggingEnabled = false;
        /** @private */
        this.wildcardListeners = new Set();
    }

    /**
     * Enable or disable wildcard debugging to monitor all events flowing through the bus.
     * @param {boolean} isEnabled 
     */
    enableDebugging(isEnabled = true) {
        this.debuggingEnabled = isEnabled;
    }

    /**
     * Subscribes to all events (Wildcard debugging)
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    subscribeAll(callback) {
        this.wildcardListeners.add(callback);
        return () => this.wildcardListeners.delete(callback);
    }

    /**
     * Subscribes to an event.
     * @param {string} event Name of the event
     * @param {Function} callback Handler function
     * @returns {Function} Unsubscribe function to prevent memory leaks
     */
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        return () => this.unsubscribe(event, callback);
    }

    /**
     * Unsubscribes from an event.
     * @param {string} event 
     * @param {Function} callback 
     */
    unsubscribe(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Subscribes to an event but only executes once.
     * @param {string} event 
     * @param {Function} callback 
     */
    once(event, callback) {
        const onceWrapper = (payload) => {
            this.unsubscribe(event, onceWrapper);
            callback(payload);
        };
        this.subscribe(event, onceWrapper);
    }

    /**
     * Emits an event to all subscribers.
     * @param {string} event 
     * @param {any} payload 
     */
    emit(event, payload = null) {
        if (this.debuggingEnabled) {
            console.groupCollapsed(`[EventBus] emit: ${event}`);
            console.log('Payload:', payload);
            console.groupEnd();
        }

        // Notify wildcard listeners
        this.wildcardListeners.forEach(callback => {
            try {
                callback(event, payload);
            } catch (error) {
                console.error(`[EventBus] Wildcard listener error for ${event}:`, error);
            }
        });

        if (!this.listeners.has(event)) return;

        this.listeners.get(event).forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                console.error(`[EventBus] Listener error for event '${event}':`, error);
            }
        });
    }

    /**
     * Removes all listeners. Used mainly for teardown/testing to prevent leaks.
     */
    clearAll() {
        this.listeners.clear();
        this.wildcardListeners.clear();
    }

    // --------------------------------------------------------
    // BACKWARD COMPATIBILITY ALIASES (Do not remove until Phase 11)
    // --------------------------------------------------------
    
    /** @deprecated Use subscribe() */
    on(event, callback) {
        return this.subscribe(event, callback);
    }

    /** @deprecated Use unsubscribe() */
    off(event, callback) {
        this.unsubscribe(event, callback);
    }
}

// Export a singleton instance for global use across the legacy application
export const eventBus = new EventBus();

export const Events = {
    // Auth & Permission
    AUTH_STATE_CHANGED: 'AUTH_STATE_CHANGED',
    USER_PROFILE_LOADED: 'USER_PROFILE_LOADED',
    
    // Room State
    ROOM_ENTERED: 'ROOM_ENTERED',
    ROOM_LEFT: 'ROOM_LEFT',
    ROOM_STATE_TRANSITION: 'ROOM_STATE_TRANSITION',
    
    // Media & Sync
    MEDIA_MODE_CHANGED: 'MEDIA_MODE_CHANGED',
    MEDIA_SYNC_TICK: 'MEDIA_SYNC_TICK',
    
    // Network
    NETWORK_OFFLINE: 'NETWORK_OFFLINE',
    NETWORK_ONLINE: 'NETWORK_ONLINE',
    
    // UI Commands
    UI_START_LIVE: 'UI_START_LIVE',
    UI_STOP_LIVE: 'UI_STOP_LIVE',
    UI_SEND_MESSAGE: 'UI_SEND_MESSAGE',
    UI_CHANGE_MODE: 'UI_CHANGE_MODE',
    
    // Playback Events
    PLAY_LECTURE: 'PLAY_LECTURE',
    DESTROY_ROOM_SESSION: 'DESTROY_ROOM_SESSION',
    
    // Auth & Session
    MULTIPLE_DEVICES_DETECTED: 'MULTIPLE_DEVICES_DETECTED'
};
