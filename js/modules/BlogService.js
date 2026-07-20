import { Logger } from './Logger.js';

class BlogServiceClass {

    // Lazy getter — resolves db at call time, not at import time
    // This prevents the race condition where firebase isn't ready yet
    get db() {
        return window.firebase ? window.firebase.firestore() : null;
    }

    async getMediaContent() {
        if (!this.db) {
            Logger.error('BlogService: Firebase not initialized.');
            throw new Error('Firebase not ready');
        }

        try {
            const [postsSnap, storiesSnap] = await Promise.all([
                this.db.collection('posts').where('status', '==', 'published').get(),
                this.db.collection('successStories').where('isPublished', '==', true).get()
            ]);

            const allContent = [];

            postsSnap.forEach(doc => {
                const data = doc.data();
                const dateObj = data.publishedAt?.toDate ? data.publishedAt.toDate() : new Date(0);
                allContent.push({ type: 'post', id: doc.id, date: dateObj, data });
            });

            storiesSnap.forEach(doc => {
                const data = doc.data();
                const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0);
                allContent.push({ type: 'story', id: doc.id, date: dateObj, data });
            });

            return allContent.sort((a, b) => b.date - a.date);
        } catch (e) {
            Logger.error('BlogService: Error fetching media content:', e);
            throw e;
        }
    }
}

export const BlogService = new BlogServiceClass();
