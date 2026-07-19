/**
 * EventBus.js
 * Centralized Global Event Bus for inter-module communication.
 * Modules MUST communicate through this instead of calling each other directly.
 */

class EventBusClass {
    constructor() {
        this.listeners = {};
    }

    /**
     * Subscribe to an event
     * @param {string} eventName 
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    subscribe(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = new Set();
        }
        this.listeners[eventName].add(callback);
        
        // Return unsubscribe function
        return () => this.unsubscribe(eventName, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName 
     * @param {Function} callback 
     */
    unsubscribe(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].delete(callback);
        }
    }

    /**
     * Subscribe to an event, but only execute once
     * @param {string} eventName 
     * @param {Function} callback 
     */
    once(eventName, callback) {
        const onceCallback = (...args) => {
            this.unsubscribe(eventName, onceCallback);
            callback(...args);
        };
        this.subscribe(eventName, onceCallback);
    }

    /**
     * Emit an event with optional payload
     * @param {string} eventName 
     * @param {any} payload 
     */
    emit(eventName, payload = null) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => {
                try {
                    callback(payload);
                } catch (error) {
                    console.error(`[EventBus Error] executing callback for ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * Clear all listeners (Useful for testing)
     */
    clearAll() {
        this.listeners = {};
    }
}

// Export a singleton instance
export const EventBus = new EventBusClass();

// Commonly used event names
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
    PLAY_LECTURE: 'PLAY_LECTURE'
};
