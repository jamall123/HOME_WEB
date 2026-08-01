import { Logger } from './Logger.js';

class StoriesServiceClass {
    constructor() {
        this.db = window.firebase ? window.firebase.firestore() : null;
    }

    async getStories(category = 'all', limit = 50) {
        if (!this.db) {
            Logger.error('StoriesService: Firebase not initialized.');
            return [];
        }

        try {
            let q = this.db.collection('successStories').where('isPublished', '==', true);
            if (category !== 'all') {
                q = q.where('category', '==', category);
            }
            q = q.orderBy('createdAt', 'desc').limit(limit);

            const snap = await q.get();
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            Logger.error('StoriesService: Error fetching stories', e);
            throw e;
        }
    }

    async getStoryById(id) {
        if (!this.db) return null;
        try {
            const doc = await this.db.collection('successStories').doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        } catch (e) {
            Logger.error('StoriesService: Error fetching story', e);
            throw e;
        }
    }
}

export const StoriesService = new StoriesServiceClass();
