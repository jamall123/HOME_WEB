/**
 * @file SessionCache.js
 * @purpose In-memory cache for lesson sessions to prevent re-fetching and provide instant switching.
 */

export const SessionCache = {
    _cache: new Map(),

    getLessonCache(lessonId) {
        if (!this._cache.has(lessonId)) {
            this._cache.set(lessonId, {
                chat: { public: [], questions: [], announcements: [], system: [] },
                resources: [],
                progress: null
            });
        }
        return this._cache.get(lessonId);
    },

    setChat(lessonId, messages, channel = 'public') {
        const cache = this.getLessonCache(lessonId);
        cache.chat[channel] = messages;
    },

    getChat(lessonId, channel = 'public') {
        const cache = this.getLessonCache(lessonId);
        return cache.chat[channel] || [];
    },

    setResources(lessonId, resources) {
        const cache = this.getLessonCache(lessonId);
        cache.resources = resources;
    },

    getResources(lessonId) {
        const cache = this.getLessonCache(lessonId);
        return cache.resources || [];
    },

    setProgress(lessonId, progress) {
        const cache = this.getLessonCache(lessonId);
        cache.progress = progress;
    },

    getProgress(lessonId) {
        const cache = this.getLessonCache(lessonId);
        return cache.progress;
    },

    clearAll() {
        this._cache.clear();
    }
};
