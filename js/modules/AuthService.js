/**
 * AuthService.js
 * Handles standard Firebase Authentication and triggers EventBus auth states.
 */

import { auth, jhomeAuth } from './FirebaseAdapter.js';
import { EventBus, Events } from './EventBus.js';
import { StateStore } from './StateStore.js';

export const AuthService = {

    init() {
        // Listen for standard Firebase Auth changes
        jhomeAuth.onAuthStateChanged((user) => {
            if (user) {
                // console.log("[AuthService] User logged in:", user.uid);
                StateStore.setState('user', user);
                EventBus.emit(Events.AUTH_STATE_CHANGED, user);
                this.loadPermissions(user.uid);
            } else {
                // console.log("[AuthService] User logged out");
                StateStore.setState('user', null);
                StateStore.setState('permissions', []);
                EventBus.emit(Events.AUTH_STATE_CHANGED, null);
            }
        });
    },

    async loadPermissions(uid) {
        try {
            // Usually we would fetch roles/permissions from a `/users/{uid}` document
            // or from custom claims via `user.getIdTokenResult()`
            // For now, emit a generic permissions loaded event
            const tokenResult = await jhomeAuth.currentUser.getIdTokenResult();
            const permissions = tokenResult.claims.permissions || [];
            StateStore.setState('permissions', permissions);
            EventBus.emit(Events.USER_PROFILE_LOADED, permissions);
        } catch (e) {
            console.error("Failed loading permissions", e);
        }
    },

    async login(email, password) {
        return jhomeAuth.signInWithEmailAndPassword(email, password);
    },

    async logout() {
        return jhomeAuth.signOut();
    }
};

// Initialize listeners immediately
AuthService.init();
