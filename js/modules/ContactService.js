import { OfflineSyncEngine } from './OfflineSyncEngine.js';

class ContactServiceClass {
    constructor() {
        this.collectionName = 'contactMessages';
    }

    async submitContactMessage(messageData) {
        try {
            // Include server timestamp placeholder if online, or local timestamp if offline
            const payload = {
                ...messageData,
                read: false,
                createdAt: window.firebase ? window.firebase.firestore.FieldValue.serverTimestamp() : new Date()
            };

            const docId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            if (navigator.onLine && window.firebase) {
                const db = window.firebase.firestore();
                await db.collection(this.collectionName).add({
                    ...messageData,
                    read: false,
                    createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Queue for offline sync
                await OfflineSyncEngine.queueOperation(this.collectionName, docId, 'set', payload);
            }
            return { success: true };
        } catch (error) {
            console.error('[ContactService] Error submitting message:', error);
            throw error;
        }
    }
}

export const ContactService = new ContactServiceClass();
