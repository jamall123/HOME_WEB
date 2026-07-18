/**
 * story.js — صفحة قصة النجاح الفردية
 */

(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('postContent');

  if (!id) {
    container.innerHTML = '<div class="error-state">لم يتم تحديد قصة نجاح.</div>';
    return;
  }

  loadStory();

  async function loadStory() {
    try {
      const docSnap = await firebase.firestore().collection('successStories').doc(id).get();
      if (!docSnap.exists) {
        container.innerHTML = '<div class="error-state">عذراً، قصة النجاح غير موجودة.</div>';
        return;
      }
      
      const story = docSnap.data();

      // SEO meta
      document.getElementById('pageTitle').textContent = (story.personName) + ' | قصة نجاح';
      document.getElementById('pageDescription').setAttribute('content', story.keyAchievement || '');
      document.getElementById('ogTitle').setAttribute('content', story.personName);
      document.getElementById('ogDescription').setAttribute('content', story.keyAchievement || '');
      if (story.coverImage) document.getElementById('ogImage').setAttribute('content', story.coverImage);

      const date = story.createdAt ? new Date(story.createdAt.seconds * 1000).toLocaleDateString('ar-SD', {
        year: 'numeric', month: 'long', day: 'numeric'
      }) : '';

      container.innerHTML = `
        <div class="post-cover">
          <img src="${story.coverImage || 'assets/images/placeholder.jpg'}" alt="${escapeHtml(story.personName)}">
        </div>
        <div class="post-meta-top">
          <span class="post-category-badge" style="background: var(--accent); color: white;">قصة نجاح</span>
          <span><i class="fas fa-calendar"></i> ${date}</span>
        </div>
        <h1 class="post-title">${escapeHtml(story.personName)}</h1>
        <p class="post-author" style="color: var(--primary); font-weight: bold; font-size: 1.1rem;"><i class="fas fa-briefcase"></i> ${escapeHtml(story.personRole || '')}</p>
        
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: var(--radius-md); margin-bottom: 20px; border-right: 4px solid var(--accent);">
            <h3 style="margin-bottom: 5px; color: var(--text-primary); font-size: 1.1rem;">أهم إنجاز:</h3>
            <p style="margin: 0; color: var(--text-secondary); line-height: 1.5;">${escapeHtml(story.keyAchievement || '')}</p>
        </div>

        <div class="post-body">
          <h3 style="margin-bottom: 15px;">تفاصيل قصة النجاح:</h3>
          <p style="white-space: pre-wrap; line-height: 1.8;">${escapeHtml(story.story || '')}</p>
        </div>
        
        ${story.freelancerLink ? `
        <div style="margin-top: 30px; text-align: center;">
            <a href="${encodeURI(story.freelancerLink)}" target="_blank" class="cta-button primary" style="font-size: 1.1rem; padding: 0.8rem 2rem;">
                <i class="fas fa-external-link-alt"></i> مشاهدة ملف الحرفي في تطبيق Jhome
            </a>
        </div>
        ` : ''}

        <div class="post-share" style="margin-top: 40px;">
          <span>شارك القصة:</span>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(story.personName + ' - قصة نجاح')}" target="_blank" class="share-btn twitter"><i class="fab fa-twitter"></i></a>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent('قصة نجاح ' + story.personName + ' ' + window.location.href)}" target="_blank" class="share-btn whatsapp"><i class="fab fa-whatsapp"></i></a>
        </div>
      `;

    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="error-state">حدث خطأ في تحميل قصة النجاح.</div>';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();