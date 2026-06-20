/**
 * blog.js — صفحة المدونة
 * تحميل وعرض المقالات + فلترة + تحميل المزيد + اشتراك
 */

(function () {
  'use strict';

  const PAGE_SIZE = 9;
  let currentCategory = 'all';
  let lastVisible = null;
  let loading = false;
  let noMore = false;

  async function loadPosts(reset = false) {
    if (loading) return;
    loading = true;

    const grid = document.getElementById('blogGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (reset) {
      grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
      lastVisible = null;
      noMore = false;
    }

    try {
      let q = firebase.firestore().collection('posts').where('status', '==', 'published');
      if (currentCategory !== 'all') q = q.where('category', '==', currentCategory);
      q = q.orderBy('publishedAt', 'desc').limit(PAGE_SIZE);
      if (lastVisible) q = q.startAfter(lastVisible);

      const snap = await q.get();

      if (reset) grid.innerHTML = '';

      if (snap.empty && reset) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد مقالات بعد في هذا التصنيف.</p></div>';
        loadMoreBtn.style.display = 'none';
        return;
      }

      if (snap.empty) {
        noMore = true;
        loadMoreBtn.style.display = 'none';
        return;
      }

      lastVisible = snap.docs[snap.docs.length - 1];

      snap.docs.forEach(doc => {
        const post = { id: doc.id, ...doc.data() };
        grid.insertAdjacentHTML('beforeend', renderPostCard(post));
      });

      loadMoreBtn.style.display = snap.docs.length < PAGE_SIZE ? 'none' : 'inline-block';
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<div class="error-state">حدث خطأ في تحميل المقالات.</div>';
    } finally {
      loading = false;
    }
  }

  function renderPostCard(post) {
    const date = post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString('ar-SD', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '';
    const excerpt = post.excerpt || (post.content || '').replace(/<[^>]*>/g, '').slice(0, 150) + '…';
    const cover = post.coverImage || 'assets/images/blog-placeholder.jpg';
    const category = post.category || 'عام';

    return `
      <article class="blog-card glass-card">
        <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="blog-card-link">
          <div class="blog-card-image">
            <img src="${cover}" alt="${escapeHtml(post.title)}" loading="lazy"
                 onerror="this.src='assets/images/blog-placeholder.jpg'">
            <span class="blog-category">${escapeHtml(category)}</span>
          </div>
          <div class="blog-card-body">
            <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
            <p class="blog-card-excerpt">${escapeHtml(excerpt)}</p>
            <div class="blog-card-meta">
              <span><i class="fas fa-calendar"></i> ${date}</span>
              ${post.readingTime ? `<span><i class="fas fa-clock"></i> ${post.readingTime} د</span>` : ''}
              <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
            </div>
          </div>
        </a>
      </article>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ====== الفلاتر ======
  document.getElementById('blogFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    loadPosts(true);
  });

  // ====== تحميل المزيد ======
  document.getElementById('loadMoreBtn').addEventListener('click', () => loadPosts(false));

  // ====== اشتراك النشرة ======
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMessage = document.getElementById('newsletterMessage');
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();
    if (!email) return;
    try {
      const result = await JHomeAPI.subscribeNewsletter({ email, source: 'blog' });
      newsletterMessage.textContent = result.data.message;
      newsletterMessage.className = 'form-message success';
      newsletterForm.reset();
      if (window.JHomeAPI) JHomeAPI.trackEvent('newsletter_subscribe', { source: 'blog' });
    } catch (err) {
      newsletterMessage.textContent = err.message || 'حدث خطأ';
      newsletterMessage.className = 'form-message error';
    }
  });

  // تشغيل
  loadPosts(true);
})();