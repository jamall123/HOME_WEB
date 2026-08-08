/**
 * @file StateStore.js
 * @purpose Centralized state management for the application.
 * @responsibilities
 *  - Store application-level state securely without polluting the global window object.
 *  - Provide reactive state observation so components can react to state changes.
 *  - Provide a single source of truth for user and context information.
 * @dependencies None
 * @publicAPI getState, setState, subscribe
 * @futureMigrationPlan Modules should replace window.currentUser, window.currentRoomCourseId, etc., by subscribing to StateStore.
 */

export class StateStore {
    constructor() {
        /** @private */
        this.state = {
            currentUser: null,
            currentRoomCourseId: null,
            currentRoomId: null,
            // Additional future states can be added here
        };

        /** @private */
        this.listeners = new Set();
    }

    /**
     * Retrieve the current state or a specific key.
     * @param {string} [key] Optional key to retrieve specific state.
     * @returns {any}
     */
    getState(key = null) {
        if (key) {
            return this.state[key];
        }
        return { ...this.state };
    }

    /**
     * Update the state and notify all subscribers.
     * @param {Object} partialState Object containing the state keys to update.
     */
    setState(partialState) {
        if (!partialState || typeof partialState !== 'object') return;

        this.state = {
            ...this.state,
            ...partialState
        };

        this.notify();
    }

    /**
     * Subscribe to state changes.
     * @param {Function} callback Function called whenever the state updates.
     * @returns {Function} Unsubscribe function.
     */
    subscribe(callback) {
        this.listeners.add(callback);
        // Immediately invoke with current state
        callback(this.getState());

        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * @private
     */
    notify() {
        const currentState = this.getState();
        this.listeners.forEach(callback => {
            try {
                callback(currentState);
            } catch (error) {
                console.error('[StateStore] Error in listener:', error);
            }
        });
    }
}

// Export a singleton instance
export const stateStore = new StateStore();
