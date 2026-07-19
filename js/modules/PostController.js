import { PostService } from './PostService.js';
import { PostUI } from './PostUI.js';
import { Logger } from './Logger.js';

class PostControllerClass {
    async init() {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');

        if (!slug) {
            PostUI.renderError('لم يتم تحديد مقال.');
            return;
        }

        try {
            const post = await PostService.getPostBySlug(slug);
            if (!post) {
                PostUI.renderError('عذراً، المقال غير موجود.');
                return;
            }

            PostUI.renderPost(post);

            // Load related posts concurrently
            PostService.getRelatedPosts(post.category, post.id)
                .then(related => PostUI.renderRelated(related))
                .catch(e => Logger.warn('PostController: Failed to load related', e));

        } catch (e) {
            Logger.error('PostController: Failed to load post', e);
            PostUI.renderError('حدث خطأ في تحميل المقال.');
        }
    }
}

export const PostController = new PostControllerClass();
