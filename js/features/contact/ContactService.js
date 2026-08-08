import { OfflineSyncEngine } from '../offline/OfflineSyncEngine.js';
import { ContactRepository } from '../../repositories/ContactRepository.js';

class ContactServiceClass {
    async submitContactMessage(messageData) {
        try {
            const payload = {
                ...messageData,
                read: false,
                createdAt: new Date()
            };

            const docId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            if (navigator.onLine) {
                await ContactRepository.addMessage(messageData);
            } else {
                // Queue for offline sync
                await OfflineSyncEngine.queueOperation('messages', docId, 'set', payload);
            }
            return { success: true };
        } catch (error) {
            console.error('[ContactService] Error submitting message:', error);
            throw error;
        }
    }
}

export const ContactService = new ContactServiceClass();
