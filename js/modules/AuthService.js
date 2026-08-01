/**
 * AuthService.js
 * Handles standard Firebase Authentication and triggers EventBus auth states.
 */

import { jhomeAuth } from './FirebaseAdapter.js';
import { EventBus, Events } from './EventBus.js';
import { StateStore } from './StateStore.js';

export const AuthService = {

    init() {
        // Listen for standard Firebase Auth changes. Legacy course-credential
        // logins now sign in through signInWithCustomToken() (see login()),
        // so they surface here too — no separate mock-user code path needed.
        jhomeAuth.onAuthStateChanged((user) => {
            if (user) {
                StateStore.setState('user', user);
                EventBus.emit(Events.AUTH_STATE_CHANGED, user);
                this.loadPermissions(user.uid);
            } else {
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

    getCurrentUser() {
        return StateStore.getState('user') || jhomeAuth.currentUser;
    },

    async login(email, password, courseId) {
        try {
            return await jhomeAuth.signInWithEmailAndPassword(email, password);
        } catch(e) {
            if (courseId) {
                // Legacy course credentials are now verified server-side via
                // the api_v1_academy_login Cloud Function (Admin SDK) — the
                // client never reads/compares the password directly anymore.
                const { backendGateway } = await import('../core/BackendGateway.js');
                const result = await backendGateway.execute({
                    domain: 'academy_login',
                    action: 'login',
                    payload: { username: email, password, courseId }
                });

                const { token } = result.data;
                const credential = await jhomeAuth.signInWithCustomToken(token);
                // onAuthStateChanged (registered in init()) picks up the real
                // Firebase Auth user and emits AUTH_STATE_CHANGED normally.
                return credential;
            }
            throw e;
        }
    },

    async logout() {
        StateStore.setState('user', null);
        EventBus.emit(Events.AUTH_STATE_CHANGED, null);
        return jhomeAuth.signOut();
    }
};

// Initialize listeners immediately
AuthService.init();
