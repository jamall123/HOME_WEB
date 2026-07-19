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
            
            const snap = await q.get();
            const stories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            return stories.sort((a, b) => {
                const dateA = a.publishedAt?.seconds || 0;
                const dateB = b.publishedAt?.seconds || 0;
                return dateB - dateA;
            }).slice(0, limit);
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
