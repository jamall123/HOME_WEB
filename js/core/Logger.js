/**
 * @file Logger.js
 * @purpose Centralized application logging.
 * @responsibilities
 *  - Provide standardized logging across the application.
 *  - Prevent debug logs from leaking into production builds.
 *  - Mask sensitive information (if needed).
 * @dependencies None
 * @publicAPI debug, info, warn, error
 * @futureMigrationPlan All files using console.* must replace them with Logger methods.
 */

export class LoggerClass {
    constructor() {
        /** @private */
        this.isProduction = false;
        
        // Simple heuristic to detect production. 
        // In Vite, import.meta.env.PROD would be used, but since we are currently 
        // supporting legacy script inclusions, we check hostname or global flags.
        if (typeof window !== 'undefined') {
            this.isProduction = window.location.hostname !== 'localhost' && 
                                window.location.hostname !== '127.0.0.1';
        }
    }

    /**
     * Enable or disable production mode explicitly.
     * @param {boolean} isProd 
     */
    setProductionMode(isProd) {
        this.isProduction = isProd;
    }

    /**
     * Log a debug message (disabled in production).
     * @param {string} module The module emitting the log
     * @param {string} message The log message
     * @param {any} [data] Additional payload
     */
    debug(module, message, data = null) {
        if (this.isProduction) return;
        this._print('DEBUG', module, message, data, console.debug || console.log);
    }

    /**
     * Log an informational message.
     * @param {string} module 
     * @param {string} message 
     * @param {any} [data] 
     */
    info(module, message, data = null) {
        this._print('INFO', module, message, data, console.info || console.log);
    }

    /**
     * Log a warning message.
     * @param {string} module 
     * @param {string} message 
     * @param {any} [data] 
     */
    warn(module, message, data = null) {
        this._print('WARN', module, message, data, console.warn);
    }

    /**
     * Log an error message.
     * @param {string} module 
     * @param {string} message 
     * @param {any} [error] Error object or payload
     */
    error(module, message, error = null) {
        this._print('ERROR', module, message, error, console.error);
    }

    /**
     * @private
     */
    _print(level, module, message, payload, logFunction) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}] [${module}] ${message}`;
        
        if (payload !== null && payload !== undefined) {
            logFunction(prefix, payload);
        } else {
            logFunction(prefix);
        }
    }
}

// Export a singleton instance
export const Logger = new LoggerClass();
