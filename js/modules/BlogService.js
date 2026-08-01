import { Logger } from './Logger.js';

const CACHE_KEY = 'jhome_blog_media_cache_v1';
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes — avoids re-downloading on quick back/forward navigation
const PAGE_LIMIT = 24; // Cap per-collection reads instead of fetching entire collections every load

class BlogServiceClass {

    // Lazy getter — resolves db at call time, not at import time
    // This prevents the race condition where firebase isn't ready yet
    get db() {
        return window.firebase ? window.firebase.firestore() : null;
    }

    readCache() {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
            // Dates were serialized as ISO strings; restore them.
            return parsed.items.map(item => ({ ...item, date: new Date(item.date) }));
        } catch (e) {
            return null;
        }
    }

    writeCache(items) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                items: items.map(item => ({ ...item, date: item.date.toISOString() }))
            }));
        } catch (e) {
            // sessionStorage may be unavailable (private mode/quota) — safe to ignore.
        }
    }

    async getMediaContent({ forceRefresh = false } = {}) {
        if (!forceRefresh) {
            const cached = this.readCache();
            if (cached) return cached;
        }

        if (!this.db) {
            Logger.error('BlogService: Firebase not initialized.');
            throw new Error('Firebase not ready');
        }

        try {
            const [postsSnap, storiesSnap] = await Promise.all([
                this.db.collection('posts')
                    .where('status', '==', 'published')
                    .orderBy('publishedAt', 'desc')
                    .limit(PAGE_LIMIT)
                    .get(),
                this.db.collection('successStories')
                    .where('isPublished', '==', true)
                    .orderBy('createdAt', 'desc')
                    .limit(PAGE_LIMIT)
                    .get()
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

            const sorted = allContent.sort((a, b) => b.date - a.date);
            this.writeCache(sorted);
            return sorted;
        } catch (e) {
            Logger.error('BlogService: Error fetching media content:', e);
            throw e;
        }
    }
}

export const BlogService = new BlogServiceClass();
