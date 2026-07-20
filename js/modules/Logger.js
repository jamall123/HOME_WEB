/**
 * Logger.js
 * Enterprise Production Logger.
 * Masks sensitive data, disables standard console output in production mode,
 * and categorizes events (info, warn, error, metrics).
 */

export class LoggerClass {
    constructor() {
        // Automatically reads Vite's production environment flag if available
        this.isProduction = false;
        try {
            if (typeof process !== 'undefined' && process.env) {
                this.isProduction = process.env.NODE_ENV === 'production';
            }
        } catch (e) {}
        this.logHistory = []; // Keep a short in-memory buffer of latest events for crash reports
        this.maxHistory = 100;
    }

    info(module, message, data = null) {
        this._log('INFO', module, message, data);
    }

    warn(module, message, data = null) {
        this._log('WARN', module, message, data);
    }

    error(module, message, error = null) {
        this._log('ERROR', module, message, error);
    }

    metric(module, message, value) {
        this._log('METRIC', module, message, { value });
    }

    _log(level, module, message, payload) {
        const timestamp = new Date().toISOString();
        const maskedPayload = this._maskSensitiveData(payload);
        
        const logEntry = `[${timestamp}] [${level}] [${module}] ${message}`;

        // Keep in memory
        this.logHistory.push({ level, module, message, payload: maskedPayload, timestamp });
        if (this.logHistory.length > this.maxHistory) {
            this.logHistory.shift();
        }

        // Print to console if not production OR if it's an error
        if (!this.isProduction || level === 'ERROR') {
            switch(level) {
                case 'ERROR':
                    console.error(logEntry, maskedPayload || '');
                    break;
                case 'WARN':
                    console.warn(logEntry, maskedPayload || '');
                    break;
                default:
                    console.log(logEntry, maskedPayload || '');
            }
        }
    }

    _maskSensitiveData(data) {
        if (!data) return data;
        let safeData = typeof data === 'object' ? { ...data } : data;
        
        // Deep clone or stringify simple objects to mask keys
        try {
            if (typeof safeData === 'object') {
                const str = JSON.stringify(safeData, (key, value) => {
                    if (['password', 'token', 'secret', 'uid', 'email'].includes(key.toLowerCase())) {
                        return '***MASKED***';
                    }
                    return value;
                });
                safeData = JSON.parse(str);
            }
        } catch (e) {
            // Ignore cyclic structures
        }

        return safeData;
    }

    exportLogs() {
        return JSON.stringify(this.logHistory, null, 2);
    }
}
export const Logger = new LoggerClass();
