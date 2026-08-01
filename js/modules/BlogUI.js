import { Logger } from './Logger.js';

class BlogUIClass {
    constructor() {
        this.grid = document.getElementById('media-grid');
    }

    escHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderLoading() {
        if (!this.grid) return;
        this.grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">جاري تحميل المحتوى...</p></div>';
    }

    renderError() {
        if (!this.grid) return;
        this.grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة لاحقاً.</p></div>';
    }

    renderEmpty() {
        if (!this.grid) return;
        this.grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">لا يوجد محتوى متاح حالياً.</p></div>';
    }

    renderContent(allContent) {
        if (!this.grid) return;

        const fragment = document.createDocumentFragment();

        allContent.forEach(item => {
            const dateStr = item.date.getTime() > 0 ? item.date.toLocaleDateString('ar-EG') : '';
            const wrapper = document.createElement('div');

            if (item.type === 'post') {
                const data = item.data;
                const rawExcerpt = data.excerpt || (data.content ? data.content.replace(/<[^>]*>/g, '').slice(0, 120) + '...' : '');
                const excerpt = this.escHtml(rawExcerpt);
                
                let rawCover = data.coverImage || data.image || data.cover;
                let imageUrl = rawCover;
                if (!imageUrl || imageUrl.includes('placeholder.jpg') || imageUrl.includes('default-avatar.png') || imageUrl.includes('blog-placeholder.jpg')) {
                    imageUrl = 'fallback';
                }

                let imageHtml = '';
                if (imageUrl === 'fallback') {
                    imageHtml = `<div class="fallback-cover-logo" style="position: relative; height: 220px; z-index: 0;">
                        <span>J</span><span>home</span>
                    </div>`;
                } else {
                    imageHtml = `<img src="${encodeURI(imageUrl)}" alt="${this.escHtml(data.title || '')}" loading="lazy" decoding="async" style="width:100%; height: 220px; object-fit: cover; display:block; position: relative;" onerror="this.style.display='none';">`;
                }
                
                const postUrl = `post.html?slug=${encodeURIComponent(data.slug || item.id)}`;

                wrapper.innerHTML = `
                    <a href="${postUrl}" class="glass-panel course-card" data-card-type="post" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none; text-decoration: none; color: inherit; transition: transform 0.3s ease;">
                        ${imageHtml}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">مقال - ${this.escHtml(data.category || 'عام')}</span>
                                <span class="text-muted" style="font-size: 0.85rem;"><i class="fas fa-calendar"></i> ${dateStr}</span>
                            </div>
                            <h3 style="margin-bottom: 10px; font-size: 1.4rem;">${this.escHtml(data.title)}</h3>
                            <p style="margin-bottom: 1.5rem; flex: 1; line-height: 1.6; color: var(--text-secondary);">${excerpt}</p>
                            <span class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; color: var(--primary); padding: 0;">
                                قراءة المزيد <i class="fas fa-arrow-left"></i>
                            </span>
                        </div>
                    </a>
                `;
            } else if (item.type === 'story') {
                const data = item.data;
                const storyUrl = `story.html?id=${encodeURIComponent(item.id)}`;

                let rawStoryCover = data.coverImage || data.image || data.cover || data.personAvatar;
                let storyImageUrl = rawStoryCover;
                if (!storyImageUrl || storyImageUrl.includes('placeholder.jpg') || storyImageUrl.includes('default-avatar.png') || storyImageUrl.includes('blog-placeholder.jpg')) {
                    storyImageUrl = 'fallback';
                }

                let storyImageHtml = '';
                if (storyImageUrl === 'fallback') {
                    storyImageHtml = `<div class="fallback-cover-logo" style="position: relative; height: 220px; z-index: 0;">
                        <span>J</span><span>home</span>
                    </div>`;
                } else {
                    storyImageHtml = `<img src="${encodeURI(storyImageUrl)}" alt="${this.escHtml(data.personName || '')}" loading="lazy" decoding="async" style="width:100%; height: 220px; object-fit: cover; display:block; position: relative;" onerror="this.style.display='none';">`;
                }

                wrapper.innerHTML = `
                    <div class="glass-panel course-card" data-card-type="story" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none;">
                        ${storyImageHtml}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                                <h3 style="margin: 0; font-size: 1.4rem;">${this.escHtml(data.personName)}</h3>
                                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10B981; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; white-space: nowrap;">قصة نجاح</span>
                            </div>
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">${this.escHtml(data.personRole || '')}</p>
                            
                            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 15px; border-right: 3px solid var(--primary);">
                                <p class="text-muted" style="margin: 0; font-size: 0.9rem;">
                                    <strong>أهم إنجاز:</strong> ${this.escHtml(data.keyAchievement || '')}
                                </p>
                            </div>
                            
                            <p style="margin-bottom: 1.5rem; line-height: 1.6; flex: 1; color: var(--text-secondary);">${this.escHtml((data.story || '').slice(0, 150))}...</p>
                            <a href="${storyUrl}" class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--primary); padding: 0; border: none; text-decoration: none;">
                                قراءة القصة كاملة <i class="fas fa-arrow-left"></i>
                            </a>
                        </div>
                    </div>
                `;
            }
            // Extract the first child which is the actual element (since wrapper is just a container)
            if (wrapper.firstElementChild) {
                fragment.appendChild(wrapper.firstElementChild);
            }
        });

        this.grid.innerHTML = '';
        this.grid.appendChild(fragment);
    }
}

export const BlogUI = new BlogUIClass();
