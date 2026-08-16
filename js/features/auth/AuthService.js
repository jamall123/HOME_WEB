/**
 * @file AuthService.js
 * @purpose Business logic for Authentication.
 * @responsibilities
 *  - Handle multi-step login logic (e.g., fallback to Custom Token).
 *  - Extract permissions from token claims.
 */

import { AuthRepository } from '../../repositories/AuthRepository.js';
import { backendGateway } from '../../core/BackendGateway.js';

export class AuthServiceClass {
    /**
     * Authenticate a user, falling back to legacy course credentials via Cloud Function if necessary.
     * @param {string} email 
     * @param {string} password 
     * @param {string} [courseId] 
     * @returns {Promise<firebase.auth.UserCredential>}
     */
    async login(email, password, courseId) {
        try {
            return await AuthRepository.signInWithEmailAndPassword(email, password);
        } catch (error) {
            if (courseId) {
                const result = await backendGateway.execute({
                    domain: 'academy_login',
                    action: 'login',
                    payload: { username: email, password, courseId }
                });
                const { token } = result.data;
                return await AuthRepository.signInWithCustomToken(token);
            }
            throw error;
        }
    }

    /**
     * Terminate the current session.
     * @returns {Promise<void>}
     */
    async logout() {
        return await AuthRepository.signOut();
    }

    /**
     * Fetch user permissions from JWT claims.
     * @returns {Promise<Array<string>>}
     */
    async loadPermissions() {
        try {
            const tokenResult = await AuthRepository.getIdTokenResult();
            return tokenResult?.claims?.permissions || [];
        } catch (e) {
            if (e.code === 'auth/id-token-expired' || (e.message && e.message.includes('expired'))) {
                const user = AuthRepository.getCurrentUser();
                if (user) {
                    try {
                        const refreshedToken = await user.getIdTokenResult(true);
                        return refreshedToken?.claims?.permissions || [];
                    } catch (refreshErr) {
                        return [];
                    }
                }
            }
            return [];
        }
    }

    /**
     * Get synchronously available current user.
     * @returns {firebase.auth.User|null}
     */
    getCurrentUser() {
        return AuthRepository.getCurrentUser();
    }
}

export const AuthService = new AuthServiceClass();
