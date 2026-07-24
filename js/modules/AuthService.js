/**
 * AuthService.js
 * Handles standard Firebase Authentication and triggers EventBus auth states.
 */

import { auth, jhomeAuth, jhomeDb } from './FirebaseAdapter.js';
import { EventBus, Events } from './EventBus.js';
import { StateStore } from './StateStore.js';

export const AuthService = {

    init() {
        const customUserStr = sessionStorage.getItem('custom_course_user');
        if (customUserStr) {
            try {
                const customUser = JSON.parse(customUserStr);
                StateStore.setState('user', customUser);
                // Delay emit slightly to allow other modules to attach listeners
                setTimeout(() => EventBus.emit(Events.AUTH_STATE_CHANGED, customUser), 50);
            } catch(e) {}
        }

        // Listen for standard Firebase Auth changes
        jhomeAuth.onAuthStateChanged((user) => {
            if (user) {
                sessionStorage.removeItem('custom_course_user');
                StateStore.setState('user', user);
                EventBus.emit(Events.AUTH_STATE_CHANGED, user);
                this.loadPermissions(user.uid);
            } else {
                if (!sessionStorage.getItem('custom_course_user')) {
                    StateStore.setState('user', null);
                    StateStore.setState('permissions', []);
                    EventBus.emit(Events.AUTH_STATE_CHANGED, null);
                }
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
            if (courseId && jhomeDb) {
                const snapshot = await jhomeDb.collection('courses_credentials')
                    .where('courseId', '==', courseId)
                    .where('username', '==', email)
                    .where('password', '==', password)
                    .get();
                if (!snapshot.empty) {
                    const credDoc = snapshot.docs[0];
                    const credData = credDoc.data();
                    
                    await credDoc.ref.update({
                        lastLogin: new Date(), // using generic date instead of firestore FieldValue for module compat
                        loginCount: (credData.loginCount || 0) + 1
                    });

                    const mockUser = {
                        uid: credDoc.id,
                        email: email,
                        courseId: courseId,
                        isCustomAuth: true,
                        role: credData.role || 'student',
                        name: credData.name || email,
                    };
                    
                    sessionStorage.setItem('custom_course_user', JSON.stringify(mockUser));
                    StateStore.setState('user', mockUser);
                    EventBus.emit(Events.AUTH_STATE_CHANGED, mockUser);
                    return mockUser;
                }
            }
            throw e;
        }
    },

    async logout() {
        sessionStorage.removeItem('custom_course_user');
        StateStore.setState('user', null);
        EventBus.emit(Events.AUTH_STATE_CHANGED, null);
        return jhomeAuth.signOut();
    }
};

// Initialize listeners immediately
AuthService.init();
