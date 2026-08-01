class PostUIClass {
    constructor() {
        this.container = document.getElementById('postContent');
        this.relatedSection = document.getElementById('relatedSection');
        this.relatedGrid = document.getElementById('relatedGrid');
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderError(msg) {
        if (this.container) {
            this.container.innerHTML = `<div class="error-state">${this.escapeHtml(msg)}</div>`;
        }
    }

    updateSEO(post) {
        document.getElementById('pageTitle').textContent = (post.seoTitle || post.title) + ' | Jhome';
        document.getElementById('pageDescription').setAttribute('content', post.seoDescription || post.excerpt || '');
        document.getElementById('ogTitle').setAttribute('content', post.seoTitle || post.title);
        document.getElementById('ogDescription').setAttribute('content', post.seoDescription || post.excerpt || '');
        if (post.coverImage) document.getElementById('ogImage').setAttribute('content', post.coverImage);
    }

    renderPost(post) {
        if (!this.container) return;

        this.updateSEO(post);

        const date = post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString('ar-SD', {
            year: 'numeric', month: 'long', day: 'numeric'
        }) : '';

        const tagsHtml = (post.tags && post.tags.length) ? `
          <div class="post-tags">
            ${post.tags.map(t => `<span class="tag">#${this.escapeHtml(t)}</span>`).join('')}
          </div>
        ` : '';

        const coverHtml = post.coverImage 
            ? `<img src="${this.escapeHtml(post.coverImage)}" alt="${this.escapeHtml(post.title)}" fetchpriority="high" decoding="async">` 
            : `<div class="fallback-cover-logo"><span>J</span><span>home</span></div>`;

        this.container.innerHTML = `
            <div class="post-cover">
                ${coverHtml}
            </div>
            <div class="post-meta-top">
                <span class="post-category-badge">${this.escapeHtml(post.category || 'عام')}</span>
                <span><i class="fas fa-calendar"></i> ${date}</span>
                ${post.readingTime ? `<span><i class="fas fa-clock"></i> ${post.readingTime} دقيقة قراءة</span>` : ''}
                <span><i class="fas fa-eye"></i> ${post.views || 0} مشاهدة</span>
            </div>
            <h1 class="post-title">${this.escapeHtml(post.title)}</h1>
            ${post.authorName ? `<p class="post-author"><i class="fas fa-user"></i> بقلم: ${this.escapeHtml(post.authorName)}</p>` : ''}
            <div class="post-body">
                ${post.content || '<p>لا يوجد محتوى.</p>'}
            </div>
            ${tagsHtml}
            <div class="post-share">
                <span>شارك:</span>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}" target="_blank" class="share-btn twitter"><i class="fab fa-twitter"></i></a>
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + window.location.href)}" target="_blank" class="share-btn whatsapp"><i class="fab fa-whatsapp"></i></a>
                <a href="https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}" target="_blank" class="share-btn telegram"><i class="fab fa-telegram-plane"></i></a>
            </div>
        `;
    }

    renderRelated(relatedPosts) {
        if (!this.relatedSection || !this.relatedGrid || relatedPosts.length === 0) return;

        this.relatedSection.style.display = 'block';
        this.relatedGrid.innerHTML = relatedPosts.map(p => `
            <a href="post.html?slug=${encodeURIComponent(p.slug)}" class="related-card glass-card">
                <img src="${p.coverImage || 'assets/images/blog-placeholder.jpg'}" alt="${this.escapeHtml(p.title)}" loading="lazy">
                <h4>${this.escapeHtml(p.title)}</h4>
            </a>
        `).join('');
    }
}

export const PostUI = new PostUIClass();
