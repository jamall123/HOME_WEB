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

            this.attachFilters();
        } catch (e) {
            Logger.error('BlogController: Failed to initialize:', e);
            BlogUI.renderError();
        }
    }

    attachFilters() {
        const filterBtns = document.querySelectorAll('.blog-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.filter;
                
                // Update active state
                filterBtns.forEach(b => {
                    const isActive = b.dataset.filter === type;
                    b.style.background = isActive ? 'var(--primary-color)' : 'transparent';
                    b.style.color = isActive ? '#fff' : 'var(--primary-color)';
                    if(isActive) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });

                // Filter cards
                document.querySelectorAll('#media-grid [data-card-type]').forEach(card => {
                    card.style.display = (type === 'all' || card.dataset.cardType === type) ? '' : 'none';
                });
            });
        });
    }
}

export const BlogController = new BlogControllerClass();
