import { Logger } from '../../core/Logger.js';
import { ContentRepository } from '../../repositories/ContentRepository.js';

class StoriesServiceClass {
    async getStories(category = 'all', limit = 50) {
        try {
            return await ContentRepository.getStories(category, limit);
        } catch (e) {
            Logger.error('StoriesService: Error fetching stories', e);
            throw e;
        }
    }

    async getStoryById(id) {
        try {
            return await ContentRepository.getStoryBySlug(id);
        } catch (e) {
            Logger.error('StoriesService: Error fetching story', e);
            throw e;
        }
    }
}

export const StoriesService = new StoriesServiceClass();
