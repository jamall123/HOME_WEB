import { Logger } from '../core/Logger.js';
import { FirebaseManager } from '../core/FirebaseManager.js';

class APIServiceClass {
    constructor() {
        this.sessionId = this._getOrCreateSessionId();
    }

    _getOrCreateSessionId() {
        let sid = sessionStorage.getItem('jhome_sid');
        if (!sid) {
            sid = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
            sessionStorage.setItem('jhome_sid', sid);
        }
        return sid;
    }

    async trackEvent(eventName, eventData = {}) {
        try {
            if (!FirebaseManager.isInitialized()) return;
            const functions = FirebaseManager.getFunctions();
            const trackEventFn = functions.httpsCallable('trackEventCallable');
            await trackEventFn({ eventName, eventData, sessionId: this.sessionId });
        } catch (err) {
            Logger.warn('APIService', 'trackEvent failed', err);
        }
    }

    async submitContact(data) {
        if (!FirebaseManager.isInitialized()) throw new Error("Firebase not initialized");
        const functions = FirebaseManager.getFunctions();
        const fn = functions.httpsCallable('submitContactCallable');
        return await fn(data);
    }

    async subscribeNewsletter(data) {
        if (!FirebaseManager.isInitialized()) throw new Error("Firebase not initialized");
        const functions = FirebaseManager.getFunctions();
        const fn = functions.httpsCallable('subscribeNewsletterCallable');
        return await fn(data);
    }
}

export const APIService = new APIServiceClass();
