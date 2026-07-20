import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { globalContainer, Lifetime } from './shared/di.js';
import { EventBus } from './shared/events/eventBus.js';

// Initialize Firebase Admin only once
try {
    admin.initializeApp();
} catch (e: any) {
    if (e.code !== 'app/duplicate-app') {
        throw e;
    }
}

// Populate Global DI Container
globalContainer.register('db', () => admin.firestore(), Lifetime.SINGLETON);
globalContainer.register('auth', () => admin.auth(), Lifetime.SINGLETON);
globalContainer.register('storage', () => admin.storage(), Lifetime.SINGLETON);
globalContainer.register('logger', () => functions.logger, Lifetime.SINGLETON);
globalContainer.register('eventBus', (c) => new EventBus(c.resolve('logger')), Lifetime.SINGLETON);
