class StoriesUIClass {
    constructor() {
        this.grid = document.getElementById('storiesGrid');
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderLoading() {
        if (this.grid) {
            this.grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
        }
    }

    renderEmpty() {
        if (this.grid) {
            this.grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد قصص بعد في هذا التصنيف.</p></div>';
        }
    }

    renderError() {
        if (this.grid) {
            this.grid.innerHTML = '<div class="error-state">حدث خطأ في تحميل القصص.</div>';
        }
    }

    renderStories(stories) {
        if (!this.grid) return;

        const fragment = document.createDocumentFragment();

        stories.forEach(story => {
            const initials = (story.personName || '؟').split(' ').slice(0, 2).map(s => s[0]).join('');
            const date = story.publishedAt ? new Date(story.publishedAt.seconds * 1000).toLocaleDateString('ar-SD', {
                year: 'numeric', month: 'long'
            }) : '';
            const excerpt = (story.story || '').replace(/<[^>]*>/g, '').slice(0, 180) + '…';

            const article = document.createElement('article');
            article.className = 'story-card glass-card';
            
            const coverStyle = story.coverImage ? `style="background-image: url('${this.escapeHtml(story.coverImage)}')"` : '';
            
            const metricHtml = story.metricValue ? `
                <div class="story-metric">
                    <div class="metric-number">${this.escapeHtml(story.metricValue.toString())}+</div>
                    <div class="metric-label">${this.escapeHtml(story.metricLabel || 'إنجاز')}</div>
                </div>
            ` : '';

            const achievementHtml = story.keyAchievement ? `<p class="story-key"><i class="fas fa-star"></i> ${this.escapeHtml(story.keyAchievement)}</p>` : '';
            const categoryHtml = story.category ? `<span class="story-category">${this.escapeHtml(story.category)}</span>` : '';
            const dateHtml = date ? `<span><i class="fas fa-calendar"></i> ${date}</span>` : '';
            
            const linkHtml = story.profileLink ? `<a href="${encodeURI(story.profileLink)}" target="_blank" class="cta-button secondary" style="margin-top: 15px; text-align: center; font-size: 0.9rem; padding: 0.5rem;"><i class="fas fa-external-link-alt"></i> مشاهدة ملف الحرفي</a>` : '';

            article.innerHTML = `
                <div class="story-cover" ${coverStyle}>
                    <div class="story-overlay">
                        ${metricHtml}
                    </div>
                </div>
                <div class="story-card-body">
                    <div class="story-person">
                        <div class="story-avatar">${this.escapeHtml(initials)}</div>
                        <div>
                            <h4>${this.escapeHtml(story.personName || 'مستخدم')}</h4>
                            <p class="story-role">${this.escapeHtml(story.personRole || '')} ${story.personCity ? '• ' + this.escapeHtml(story.personCity) : ''}</p>
                        </div>
                    </div>
                    <h3 class="story-title">${this.escapeHtml(story.title)}</h3>
                    ${achievementHtml}
                    <p class="story-excerpt">${this.escapeHtml(excerpt)}</p>
                    <div class="story-meta">
                        ${categoryHtml}
                        ${dateHtml}
                    </div>
                    ${linkHtml}
                </div>
            `;
            fragment.appendChild(article);
        });

        this.grid.innerHTML = '';
        this.grid.appendChild(fragment);
    }

    renderSingleStory(story) {
        const container = document.getElementById('postContent');
        if (!container) return;

        document.getElementById('pageTitle').textContent = (story.seoTitle || story.title) + ' | Jhome';
        
        const date = story.publishedAt ? new Date(story.publishedAt.seconds * 1000).toLocaleDateString('ar-SD', {
            year: 'numeric', month: 'long', day: 'numeric'
        }) : '';

        const initials = (story.personName || '؟').split(' ').slice(0, 2).map(s => s[0]).join('');

        container.innerHTML = `
            <div class="post-cover" ${story.coverImage ? `style="background-image: url('${this.escapeHtml(story.coverImage)}'); background-size: cover; background-position: center;"` : ''}>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; align-items: flex-end; gap: 1rem;">
                    <div style="width: 80px; height: 80px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; border: 4px solid var(--bg-surface);">${this.escapeHtml(initials)}</div>
                    <div>
                        <h1 style="margin: 0; font-size: 2rem; color: white;">${this.escapeHtml(story.personName)}</h1>
                        <p style="margin: 0; color: rgba(255,255,255,0.8);">${this.escapeHtml(story.personRole || '')}</p>
                    </div>
                </div>
            </div>
            
            <div class="post-body" style="margin-top: 2rem;">
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
                    <h3 style="color: var(--success); margin-bottom: 0.5rem;"><i class="fas fa-trophy"></i> أبرز الإنجازات</h3>
                    <p style="margin: 0; font-size: 1.1rem; font-weight: 500;">${this.escapeHtml(story.keyAchievement)}</p>
                </div>
                
                ${story.story || '<p>لا يوجد تفاصيل للقصة حالياً.</p>'}
                
                ${story.profileLink ? `
                <div style="margin-top: 3rem; text-align: center;">
                    <a href="${encodeURI(story.profileLink)}" target="_blank" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;">
                        <i class="fas fa-external-link-alt"></i> استعراض الحساب وتوظيف الحرفي
                    </a>
                </div>` : ''}
            </div>
        `;
    }
}

export const StoriesUI = new StoriesUIClass();
