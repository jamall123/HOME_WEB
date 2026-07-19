import { Logger } from './Logger.js';

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
            if (!window.firebase) return;
            const functions = window.firebase.app().functions(window.FUNCTIONS_REGION || 'us-central1');
            const trackEventFn = functions.httpsCallable('trackEventCallable');
            await trackEventFn({ eventName, eventData, sessionId: this.sessionId });
        } catch (err) {
            Logger.warn('APIService', 'trackEvent failed', err);
        }
    }

    async submitContact(data) {
        if (!window.firebase) throw new Error("Firebase not initialized");
        const functions = window.firebase.app().functions(window.FUNCTIONS_REGION || 'us-central1');
        const fn = functions.httpsCallable('submitContactCallable');
        return await fn(data);
    }

    async subscribeNewsletter(data) {
        if (!window.firebase) throw new Error("Firebase not initialized");
        const functions = window.firebase.app().functions(window.FUNCTIONS_REGION || 'us-central1');
        const fn = functions.httpsCallable('subscribeNewsletterCallable');
        return await fn(data);
    }
}

export const APIService = new APIServiceClass();
