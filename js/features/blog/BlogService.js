import { Logger } from '../../core/Logger.js';
import { ContentRepository } from '../../repositories/ContentRepository.js';

const CACHE_KEY = 'jhome_blog_media_cache_v1';
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes — avoids re-downloading on quick back/forward navigation
const PAGE_LIMIT = 24; // Cap per-collection reads instead of fetching entire collections every load

class BlogServiceClass {

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

        try {
            const sorted = await ContentRepository.getRecentMediaContent(PAGE_LIMIT);
            this.writeCache(sorted);
            return sorted;
        } catch (e) {
            Logger.error('BlogService: Error fetching media content:', e);
            throw e;
        }
    }
}

export const BlogService = new BlogServiceClass();
