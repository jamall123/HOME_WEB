import * as admin from 'firebase-admin';
import { configService } from '../config/env.js';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

export class Logger {
  constructor(private db?: admin.firestore.Firestore) {}

  private async log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString()
    };

    // Console Logging
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      console.error(`[${level}] ${message}`, context || '');
    } else if (level === LogLevel.WARNING) {
      console.warn(`[${level}] ${message}`, context || '');
    } else {
      console.log(`[${level}] ${message}`, context || '');
    }

    // Firestore Logging (Audit Trail)
    if (this.db) {
      try {
        await this.db.collection(configService.get('collections').systemLogs).add(entry);
      } catch (err) {
        console.error('Failed to write log to Firestore:', err);
      }
    }
  }

  debug(message: string, context?: Record<string, any>) { this.log(LogLevel.DEBUG, message, context); }
  info(message: string, context?: Record<string, any>) { this.log(LogLevel.INFO, message, context); }
  warning(message: string, context?: Record<string, any>) { this.log(LogLevel.WARNING, message, context); }
  error(message: string, context?: Record<string, any>) { this.log(LogLevel.ERROR, message, context); }
  critical(message: string, context?: Record<string, any>) { this.log(LogLevel.CRITICAL, message, context); }
}
