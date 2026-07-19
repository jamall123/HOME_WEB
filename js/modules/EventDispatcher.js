/**
 * EventDispatcher.js
 * Enterprise Global Event Bus for Jhome ecosystem.
 * Enables fully decoupled communication between modules, services, and the UI.
 */

class EventDispatcherClass {
    constructor() {
        this.listeners = {};
    }

    /**
     * Subscribe to an event
     * @param {string} event - The event name
     * @param {Function} callback - The callback to execute
     * @returns {Function} - Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - The event name
     * @param {Function} callback - The specific callback to remove
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    /**
     * Emit an event globally
     * @param {string} event - The event name
     * @param {*} data - Payload to send to listeners
     */
    emit(event, data = null) {
        if (!this.listeners[event]) return;
        // Execute callbacks asynchronously to avoid blocking the main thread
        this.listeners[event].forEach(callback => {
            setTimeout(() => callback(data), 0);
        });
    }

    /**
     * Subscribe to an event only once
     * @param {string} event - The event name
     * @param {Function} callback - The callback to execute
     */
    once(event, callback) {
        const unsubscribe = this.on(event, (data) => {
            unsubscribe();
            callback(data);
        });
    }
}

export const EventDispatcher = new EventDispatcherClass();
