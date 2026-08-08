import { StoriesService } from './StoriesService.js';
import { StoriesUI } from './StoriesUI.js';
import { Logger } from '../../core/Logger.js';
import { APIService } from '../../core/APIService.js';

class StoriesControllerClass {
    constructor() {
        this.currentCategory = 'all';
    }

    async init() {
        this.setupEventListeners();
        await this.loadStories();
    }

    setupEventListeners() {
        const filtersContainer = document.getElementById('storiesFilters');
        if (filtersContainer) {
            filtersContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentCategory = btn.dataset.category || 'all';
                this.loadStories();
            });
        }
    }

    async loadStories() {
        StoriesUI.renderLoading();
        try {
            const stories = await StoriesService.getStories(this.currentCategory);
            
            if (stories.length === 0) {
                StoriesUI.renderEmpty();
            } else {
                StoriesUI.renderStories(stories);
            }

            APIService.trackEvent('stories_view', { count: stories.length, category: this.currentCategory });
        } catch (e) {
            Logger.error('StoriesController: Failed to load stories', e);
            StoriesUI.renderError();
        }
    }

    async initSingleStory() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            StoriesUI.renderError('لم يتم تحديد قصة.');
            return;
        }

        try {
            const story = await StoriesService.getStoryById(id);
            if (!story) {
                StoriesUI.renderError('عذراً، القصة غير موجودة.');
                return;
            }

            StoriesUI.renderSingleStory(story);

            APIService.trackEvent('story_view', { storyId: id });
        } catch (e) {
            Logger.error('StoriesController: Failed to load story', e);
            StoriesUI.renderError('حدث خطأ في تحميل القصة.');
        }
    }
}

export const StoriesController = new StoriesControllerClass();
