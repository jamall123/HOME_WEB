/**
 * post.js — صفحة المقال الفردي
 */

(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const container = document.getElementById('postContent');

  if (!slug) {
    container.innerHTML = '<div class="error-state">لم يتم تحديد مقال.</div>';
    return;
  }

  loadPost();

  async function loadPost() {
    try {
      const post = await JHomeAPI.getPostBySlug(slug);
      if (!post) {
        container.innerHTML = '<div class="error-state">عذراً، المقال غير موجود.</div>';
        return;
      }

      // SEO meta
      document.getElementById('pageTitle').textContent = (post.seoTitle || post.title) + ' | Jhome';
      document.getElementById('pageDescription').setAttribute('content', post.seoDescription || post.excerpt || '');
      document.getElementById('ogTitle').setAttribute('content', post.seoTitle || post.title);
      document.getElementById('ogDescription').setAttribute('content', post.seoDescription || post.excerpt || '');
      if (post.coverImage) document.getElementById('ogImage').setAttribute('content', post.coverImage);

      const date = post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString('ar-SD', {
        year: 'numeric', month: 'long', day: 'numeric'
      }) : '';

      container.innerHTML = `
        <div class="post-cover">
          <img src="${post.coverImage || 'assets/images/blog-placeholder.jpg'}" alt="${escapeHtml(post.title)}">
        </div>
        <div class="post-meta-top">
          <span class="post-category-badge">${escapeHtml(post.category || 'عام')}</span>
          <span><i class="fas fa-calendar"></i> ${date}</span>
          ${post.readingTime ? `<span><i class="fas fa-clock"></i> ${post.readingTime} دقيقة قراءة</span>` : ''}
          <span><i class="fas fa-eye"></i> ${post.views || 0} مشاهدة</span>
        </div>
        <h1 class="post-title">${escapeHtml(post.title)}</h1>
        ${post.authorName ? `<p class="post-author"><i class="fas fa-user"></i> بقلم: ${escapeHtml(post.authorName)}</p>` : ''}
        <div class="post-body">
          ${post.content || '<p>لا يوجد محتوى.</p>'}
        </div>
        ${post.tags && post.tags.length ? `
          <div class="post-tags">
            ${post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="post-share">
          <span>شارك:</span>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}" target="_blank" class="share-btn twitter"><i class="fab fa-twitter"></i></a>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + window.location.href)}" target="_blank" class="share-btn whatsapp"><i class="fab fa-whatsapp"></i></a>
          <a href="https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}" target="_blank" class="share-btn telegram"><i class="fab fa-telegram-plane"></i></a>
        </div>
      `;

      // تحميل مقالات ذات صلة
      loadRelated(post.category, post.id);
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="error-state">حدث خطأ في تحميل المقال.</div>';
    }
  }

  async function loadRelated(category, excludeId) {
    if (!category) return;
    try {
      const snap = await firebase.firestore().collection('posts')
        .where('status', '==', 'published')
        .where('category', '==', category)
        .orderBy('publishedAt', 'desc')
        .limit(4)
        .get();

      const related = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== excludeId).slice(0, 3);
      if (!related.length) return;

      const relatedSection = document.getElementById('relatedSection');
      const relatedGrid = document.getElementById('relatedGrid');
      relatedSection.style.display = 'block';
      relatedGrid.innerHTML = related.map(p => `
        <a href="post.html?slug=${encodeURIComponent(p.slug)}" class="related-card glass-card">
          <img src="${p.coverImage || 'assets/images/blog-placeholder.jpg'}" alt="${escapeHtml(p.title)}" loading="lazy">
          <h4>${escapeHtml(p.title)}</h4>
        </a>
      `).join('');
    } catch (err) {
      console.warn('related load failed', err);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();