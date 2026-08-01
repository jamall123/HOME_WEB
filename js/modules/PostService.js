import { Logger } from './Logger.js';

class PostServiceClass {
    constructor() {
        this.db = window.firebase ? window.firebase.firestore() : null;
    }

    async getPostBySlug(slug) {
        if (!this.db) {
            Logger.error('PostService: Firebase not initialized.');
            return null;
        }

        try {
            const snap = await this.db.collection('posts')
                .where('slug', '==', slug)
                .where('status', '==', 'published')
                .limit(1)
                .get();

            if (snap.empty) return null;
            
            const post = { id: snap.docs[0].id, ...snap.docs[0].data() };

            // Only count one view per post per browser session to avoid
            // inflating counts (and Firestore write costs) on refresh/back navigation.
            const viewedKey = `jhome_viewed_post_${post.id}`;
            if (!sessionStorage.getItem(viewedKey)) {
                sessionStorage.setItem(viewedKey, '1');
                this.db.collection('posts').doc(post.id).update({
                    views: window.firebase.firestore.FieldValue.increment(1)
                }).catch(e => Logger.warn('Failed to increment views', e));
            }

            return post;
        } catch (e) {
            Logger.error('PostService: getPostBySlug error:', e);
            throw e;
        }
    }

    async getRelatedPosts(category, excludeId) {
        if (!this.db || !category) return [];

        try {
            const snap = await this.db.collection('posts')
                .where('status', '==', 'published')
                .where('category', '==', category)
                .orderBy('publishedAt', 'desc')
                .limit(4)
                .get();

            return snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(p => p.id !== excludeId)
                .slice(0, 3);
        } catch (e) {
            Logger.warn('PostService: getRelatedPosts failed', e);
            return [];
        }
    }
}

export const PostService = new PostServiceClass();
