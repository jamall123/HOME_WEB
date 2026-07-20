import { configService } from '../config/env.js';
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["CRITICAL"] = "CRITICAL";
})(LogLevel || (LogLevel = {}));
export class Logger {
    db;
    constructor(db) {
        this.db = db;
    }
    async log(level, message, context) {
        const entry = {
            level,
            message,
            context,
            timestamp: new Date().toISOString()
        };
        // Console Logging
        if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
            console.error(`[${level}] ${message}`, context || '');
        }
        else if (level === LogLevel.WARNING) {
            console.warn(`[${level}] ${message}`, context || '');
        }
        else {
            console.log(`[${level}] ${message}`, context || '');
        }
        // Firestore Logging (Audit Trail)
        if (this.db) {
            try {
                await this.db.collection(configService.get('collections').systemLogs).add(entry);
            }
            catch (err) {
                console.error('Failed to write log to Firestore:', err);
            }
        }
    }
    debug(message, context) { this.log(LogLevel.DEBUG, message, context); }
    info(message, context) { this.log(LogLevel.INFO, message, context); }
    warning(message, context) { this.log(LogLevel.WARNING, message, context); }
    error(message, context) { this.log(LogLevel.ERROR, message, context); }
    critical(message, context) { this.log(LogLevel.CRITICAL, message, context); }
}
//# sourceMappingURL=logger.js.map