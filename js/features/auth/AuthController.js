/**
 * @file AuthController.js
 * @purpose Orchestrator for Authentication.
 * @responsibilities
 *  - Bridge UI/DOM interactions with AuthService.
 *  - Sync Auth state with EventBus and StateStore.
 */

import { AuthService } from './AuthService.js';
import { stateStore } from '../../core/StateStore.js';
import { eventBus as EventBus, Events } from '../../core/EventBus.js';
import { AuthRepository } from '../../repositories/AuthRepository.js';

export class AuthControllerClass {
    constructor() {
        this._unsubscribe = null;
    }

    init() {
        // Prevent duplicate initialization
        if (this._unsubscribe) return;

        this._unsubscribe = AuthRepository.onAuthStateChanged(async (user) => {
            if (user) {
                stateStore.setState({ user });
                EventBus.emit(Events.AUTH_STATE_CHANGED, user);
                
                const permissions = await AuthService.loadPermissions();
                stateStore.setState({ permissions });
                EventBus.emit(Events.USER_PROFILE_LOADED, permissions);
            } else {
                stateStore.setState({ user: null });
                stateStore.setState({ permissions: [] });
                EventBus.emit(Events.AUTH_STATE_CHANGED, null);
            }
        });
    }

    async login(email, password, courseId) {
        return await AuthService.login(email, password, courseId);
    }

    async logout() {
        return await AuthService.logout();
    }

    getCurrentUser() {
        return stateStore.getState('user') || AuthService.getCurrentUser();
    }
}

export const AuthController = new AuthControllerClass();
// Auto-initialize listeners on import
AuthController.init();
