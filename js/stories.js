/**
 * stories.js — صفحة قصص النجاح
 */

(function () {
  'use strict';

  let currentCategory = 'all';

  document.getElementById('storiesFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    loadStories();
  });

  async function loadStories() {
    const grid = document.getElementById('storiesGrid');
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';

    try {
      const stories = await JHomeAPI.getStories({
        limit: 50,
        category: currentCategory === 'all' ? null : currentCategory
      });

      if (!stories.length) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد قصص بعد في هذا التصنيف.</p></div>';
        return;
      }

      grid.innerHTML = stories.map(renderStoryCard).join('');

      if (window.JHomeAPI) JHomeAPI.trackEvent('stories_view', { count: stories.length, category: currentCategory });
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<div class="error-state">حدث خطأ في تحميل القصص.</div>';
    }
  }

  function renderStoryCard(story) {
    const initials = (story.personName || '؟').split(' ').slice(0, 2).map(s => s[0]).join('');
    const date = story.publishedAt ? new Date(story.publishedAt.seconds * 1000).toLocaleDateString('ar-SD', {
      year: 'numeric', month: 'long'
    }) : '';
    const excerpt = (story.story || '').replace(/<[^>]*>/g, '').slice(0, 180) + '…';

    return `
      <article class="story-card glass-card">
        <div class="story-cover" ${story.coverImage ? `style="background-image: url('${story.coverImage}')"` : ''}>
          <div class="story-overlay">
            ${story.metricValue ? `
              <div class="story-metric">
                <div class="metric-number">${story.metricValue}+</div>
                <div class="metric-label">${escapeHtml(story.metricLabel || 'إنجاز')}</div>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="story-card-body">
          <div class="story-person">
            <div class="story-avatar">${initials}</div>
            <div>
              <h4>${escapeHtml(story.personName || 'مستخدم')}</h4>
              <p class="story-role">${escapeHtml(story.personRole || '')} ${story.personCity ? '• ' + escapeHtml(story.personCity) : ''}</p>
            </div>
          </div>
          <h3 class="story-title">${escapeHtml(story.title)}</h3>
          ${story.keyAchievement ? `<p class="story-key"><i class="fas fa-star"></i> ${escapeHtml(story.keyAchievement)}</p>` : ''}
          <p class="story-excerpt">${escapeHtml(excerpt)}</p>
          <div class="story-meta">
            ${story.category ? `<span class="story-category">${escapeHtml(story.category)}</span>` : ''}
            ${date ? `<span><i class="fas fa-calendar"></i> ${date}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  loadStories();
})();