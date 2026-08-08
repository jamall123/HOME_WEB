/**
 * @file Config.js
 * @purpose Centralized application configuration.
 * @responsibilities
 *  - Store environment-specific configuration (development, production).
 *  - Manage feature flags.
 *  - Expose external service configuration.
 * @dependencies None
 * @publicAPI Config (Object)
 * @futureMigrationPlan Modules should import Config instead of hardcoding environment checks.
 */

export const Config = Object.freeze({
    // Environment
    ENV: typeof process !== 'undefined' && process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
    IS_PRODUCTION: typeof window !== 'undefined' ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') : false,

    // API Configuration
    API: {
        BASE_URL: '/api/v1',
        TIMEOUT_MS: 15000,
    },

    // Third-party Integrations
    AGORA: {
        APP_ID: 'YOUR_AGORA_APP_ID' // Will be injected or fetched securely later
    },

    // Feature Flags (to toggle experimental UI/behavior safely)
    FEATURES: {
        ENABLE_NEW_DASHBOARD: false,
        ENABLE_ENHANCED_LOGGING: true
    }
});
