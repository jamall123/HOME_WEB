import { Logger } from '../../core/Logger.js';
import { ContentRepository } from '../../repositories/ContentRepository.js';

class PostServiceClass {
    async getPostBySlug(slug) {
        try {
            const post = await ContentRepository.getPostBySlug(slug);

            if (!post) return null;
            
            // Only count one view per post per browser session to avoid
            // inflating counts (and Firestore write costs) on refresh/back navigation.
            const viewedKey = `jhome_viewed_post_${post.id}`;
            if (!sessionStorage.getItem(viewedKey)) {
                sessionStorage.setItem(viewedKey, '1');
                await ContentRepository.incrementPostViews(post.id);
            }

            return post;
        } catch (e) {
            Logger.error('PostService: getPostBySlug error:', e);
            throw e;
        }
    }

    async getRelatedPosts(category, excludeId) {
        if (!category) return [];

        try {
            return await ContentRepository.getRelatedPosts(category, excludeId);
        } catch (e) {
            Logger.warn('PostService: getRelatedPosts failed', e);
            return [];
        }
    }
}

export const PostService = new PostServiceClass();
