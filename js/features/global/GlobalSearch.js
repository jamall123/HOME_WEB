/**
 * GlobalSearch.js
 * Enterprise Global Search Engine Foundation.
 * Responsible for indexing site content client-side and performing fast lookups.
 */

import { OfflineQueueDb } from '../offline/OfflineQueueDb.js';
import { eventBus } from '../../core/EventBus.js';
import { Constants } from '../../core/Constants.js';

class GlobalSearchClass {
    constructor() {
        this.index = new Map();
        this.isInitialized = false;
        
        // Listen to global events to update the search index dynamically
        eventBus.on(Constants.EVENTS.CMS_POST_UPDATED, (data) => this.addToIndex('post', data));
        eventBus.on(Constants.EVENTS.CMS_COURSE_UPDATED, (data) => this.addToIndex('course', data));
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            // Load existing index from IndexedDB (search_index store)
            const cachedIndex = await OfflineQueueDb.getAll('search_index');
            for (const item of cachedIndex) {
                this.index.set(item.resourceId, item);
            }
            this.isInitialized = true;
            // console.log(`[GlobalSearch] Initialized with ${this.index.size} indexed items.`);
        } catch (e) {
            console.error('[GlobalSearch] Initialization failed', e);
        }
    }

    /**
     * Add or update an item in the search index
     * @param {string} type - Resource type (post, course, story, etc.)
     * @param {Object} data - Resource data
     */
    async addToIndex(type, data) {
        if (!data || !data.id) return;
        
        const resourceId = `${type}_${data.id}`;
        
        // Create a searchable text representation (combining title, desc, tags)
        const searchText = [
            data.title || '',
            data.description || '',
            data.excerpt || '',
            ...(data.tags || [])
        ].join(' ').toLowerCase();

        const indexEntry = {
            resourceId,
            type,
            id: data.id,
            title: data.title || 'Untitled',
            url: this._buildUrl(type, data),
            searchText,
            updatedAt: Date.now()
        };

        this.index.set(resourceId, indexEntry);
        
        // Persist to OfflineDB
        await OfflineQueueDb.put('search_index', indexEntry);
    }

    /**
     * Search the local index
     * @param {string} query - The search term
     * @returns {Array} - Matching results sorted by relevance
     */
    search(query) {
        if (!query || query.trim() === '') return [];
        
        const q = query.toLowerCase().trim();
        const results = [];

        for (const [key, item] of this.index.entries()) {
            if (item.searchText.includes(q)) {
                results.push(item);
            }
        }

        // Basic relevance sort (exact matches first)
        results.sort((a, b) => {
            const aExact = a.title.toLowerCase() === q ? 1 : 0;
            const bExact = b.title.toLowerCase() === q ? 1 : 0;
            return bExact - aExact;
        });

        return results;
    }

    _buildUrl(type, data) {
        switch (type) {
            case 'course': return `course-room.html?id=${data.id}`;
            case 'post': return `post.html?slug=${data.slug || data.id}`;
            case 'story': return `story.html?id=${data.id}`;
            default: return '#';
        }
    }
}

export const GlobalSearch = new GlobalSearchClass();
