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
            
            const coverImgHtml = story.coverImage
                ? `<img src="${this.escapeHtml(story.coverImage)}" alt="${this.escapeHtml(story.personName || '')}" loading="lazy" decoding="async" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;">`
                : '';
            
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
                <div class="story-cover">
                    ${coverImgHtml}
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

        const coverHtml = story.coverImage 
            ? `<img src="${this.escapeHtml(story.coverImage)}" alt="Cover" loading="lazy" decoding="async">` 
            : `<div class="fallback-cover-logo"><span>J</span><span>home</span></div>`;

        container.innerHTML = `
            <div class="post-cover">
                ${coverHtml}
            </div>
            
            <div class="jhome-story-header">
                <div class="jhome-story-avatar">
                    <div class="initials">${this.escapeHtml(initials)}</div>
                </div>
                <h1 class="post-title">${this.escapeHtml(story.personName)}</h1>
                <p class="post-author" style="justify-content: center; font-size: 1.2rem; color: var(--primary);">
                    <i class="fas fa-briefcase"></i> ${this.escapeHtml(story.personRole || '')}
                </p>
            </div>
            
            <div class="post-body">
                <div class="jhome-achievement-card">
                    <div class="jhome-achievement-icon"><i class="fas fa-trophy"></i></div>
                    <p class="jhome-achievement-text">${this.escapeHtml(story.keyAchievement)}</p>
                </div>
                
                ${story.story || '<p>لا يوجد تفاصيل للقصة حالياً.</p>'}
                
                ${(story.freelancerLink || story.profileLink) ? `
                <div style="margin-top: 4rem; text-align: center;">
                    <a href="${encodeURI(story.freelancerLink || story.profileLink)}" target="_blank" class="btn btn-primary" style="font-size: 1.2rem; padding: 1.2rem 2.5rem; border-radius: 100px; box-shadow: 0 10px 20px rgba(79, 141, 235, 0.3);">
                        <i class="fas fa-external-link-alt" style="margin-left: 8px;"></i> استعراض الحساب والتواصل
                    </a>
                </div>` : ''}

                ${story.socialLinks ? `
                <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
                    ${story.socialLinks.linkedin ? `<a href="${encodeURI(story.socialLinks.linkedin)}" target="_blank" class="share-btn" style="background:#0077b5;"><i class="fab fa-linkedin-in"></i></a>` : ''}
                    ${story.socialLinks.twitter ? `<a href="${encodeURI(story.socialLinks.twitter)}" target="_blank" class="share-btn" style="background:#000;"><i class="fab fa-x-twitter"></i></a>` : ''}
                    ${story.socialLinks.github ? `<a href="${encodeURI(story.socialLinks.github)}" target="_blank" class="share-btn" style="background:#333;"><i class="fab fa-github"></i></a>` : ''}
                </div>` : ''}
            </div>
        `;
    }
}

export const StoriesUI = new StoriesUIClass();
