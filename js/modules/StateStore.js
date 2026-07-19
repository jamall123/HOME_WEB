/**
 * StateStore.js
 * Centralized state manager handling local memory cache, IndexedDB (placeholder),
 * and tracking active subscriptions to prevent memory leaks.
 */

import { EventBus, Events } from './EventBus.js';

class StateStoreClass {
    constructor() {
        this.state = {
            user: null,
            permissions: [],
            currentRoomId: null,
            roomData: null,
            connectedUsers: [],
            presentationMode: { mode: 'video', data: null },
            isOffline: !navigator.onLine
        };

        // Active Firebase listeners to be cleaned up
        this.activeSubscriptions = new Map();

        // Listen for network changes
        window.addEventListener('offline', () => {
            this.setState('isOffline', true);
            EventBus.emit(Events.NETWORK_OFFLINE);
        });
        window.addEventListener('online', () => {
            this.setState('isOffline', false);
            EventBus.emit(Events.NETWORK_ONLINE);
        });
    }

    /**
     * Get a state slice (Memory first, then LocalStorage)
     */
    getState(key) {
        if (this.state[key] !== undefined) {
            return this.state[key];
        }
        // Fallback to LocalStorage for persistent cache
        try {
            const cached = localStorage.getItem(`jhome_cache_${key}`);
            if (cached) return JSON.parse(cached);
        } catch (e) {
            // console.warn("Cache read failed", e);
        }
        return null;
    }

    /**
     * Set a state slice and optionally persist it
     */
    setState(key, value, persist = false) {
        this.state[key] = value;
        if (persist) {
            try {
                localStorage.setItem(`jhome_cache_${key}`, JSON.stringify(value));
            } catch (e) {
                // console.warn("Cache write failed", e);
            }
        }
    }

    /**
     * Register a Firebase unsubscribe function
     * @param {string} id Unique identifier for the listener
     * @param {Function} unsubFunc Firebase unsubscribe function
     */
    registerSubscription(id, unsubFunc) {
        if (this.activeSubscriptions.has(id)) {
            // Cleanup existing before overwriting
            this.activeSubscriptions.get(id)();
        }
        this.activeSubscriptions.set(id, unsubFunc);
    }

    /**
     * Clear a specific subscription
     * @param {string} id 
     */
    clearSubscription(id) {
        if (this.activeSubscriptions.has(id)) {
            this.activeSubscriptions.get(id)();
            this.activeSubscriptions.delete(id);
        }
    }

    /**
     * Clear all active subscriptions (used when leaving a room)
     */
    clearAllSubscriptions() {
        this.activeSubscriptions.forEach((unsubFunc, id) => {
            try {
                unsubFunc();
            } catch (e) {
                console.error(`Error unsubscribing from ${id}:`, e);
            }
        });
        this.activeSubscriptions.clear();
        // console.log('[StateStore] All subscriptions cleared.');
    }
}

export const StateStore = new StateStoreClass();
