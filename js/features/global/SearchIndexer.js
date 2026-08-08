/**
 * SearchIndexer.js
 * Search engine built on IndexedDB for offline searchability of resources.
 */

import { OfflineQueueDb } from '../offline/OfflineQueueDb.js';

export class SearchIndexerClass {
    async indexResource(resource) {
        try {
            await OfflineQueueDb.init();
            
            // Build searchable string
            const searchString = `
                ${resource.title || ''} 
                ${resource.description || ''} 
                ${resource.fileName || ''} 
                ${resource.tags ? resource.tags.join(' ') : ''} 
                ${resource.aiKeywords ? resource.aiKeywords.join(' ') : ''} 
                ${resource.ocrText || ''} 
                ${resource.speechText || ''} 
            `.toLowerCase().replace(/\s+/g, ' ').trim();

            const doc = {
                resourceId: resource.resourceId,
                courseId: resource.courseId,
                lessonId: resource.lessonId,
                searchString: searchString,
                meta: {
                    title: resource.title || resource.fileName,
                    type: resource.mimeType,
                    downloadUrl: resource.downloadUrl
                }
            };

            await OfflineQueueDb.put('search_index', doc);
        } catch (e) {
            console.error('[SearchIndexer] Indexing failed', e);
        }
    }

    async search(courseId, query) {
        if (!query) return [];
        const q = query.toLowerCase().trim();

        try {
            await OfflineQueueDb.init();
            const allIndex = await OfflineQueueDb.getAll('search_index');
            
            // Filter by course and then query
            const results = allIndex.filter(doc => 
                doc.courseId === courseId && doc.searchString.includes(q)
            );

            return results.map(r => r.meta);
        } catch (e) {
            console.error('[SearchIndexer] Search failed', e);
            return [];
        }
    }
}
export const SearchIndexer = new SearchIndexerClass();
