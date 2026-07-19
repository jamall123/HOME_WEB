import { BlogService } from './BlogService.js';
import { BlogUI } from './BlogUI.js';
import { Logger } from './Logger.js';

class BlogControllerClass {
    async init() {
        try {
            BlogUI.renderLoading();
            const content = await BlogService.getMediaContent();
            
            if (content.length === 0) {
                BlogUI.renderEmpty();
            } else {
                BlogUI.renderContent(content);
            }
        } catch (e) {
            Logger.error('BlogController: Failed to initialize:', e);
            BlogUI.renderError();
        }
    }
}

export const BlogController = new BlogControllerClass();
