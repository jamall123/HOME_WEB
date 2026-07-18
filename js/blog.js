// blog.js - Logic for Media Center (Unified Feed for Blog and Success Stories)

document.addEventListener('DOMContentLoaded', () => {
    loadMediaContent();
});

// XSS-safe HTML escaping
function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function loadMediaContent() {
    const grid = document.getElementById('media-grid');
    const db = firebase.firestore();

    try {
        // Fetch both posts and success stories in parallel
        const [postsSnap, storiesSnap] = await Promise.all([
            db.collection('posts').where('status', '==', 'published').get(),
            db.collection('successStories').where('isPublished', '==', true).get()
        ]);

        let allContent = [];

        // Parse posts
        postsSnap.forEach(doc => {
            const data = doc.data();
            const dateObj = data.publishedAt?.toDate ? data.publishedAt.toDate() : new Date(0);
            allContent.push({
                type: 'post',
                id: doc.id,
                date: dateObj,
                data: data
            });
        });

        // Parse stories
        storiesSnap.forEach(doc => {
            const data = doc.data();
            const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0);
            allContent.push({
                type: 'story',
                id: doc.id,
                date: dateObj,
                data: data
            });
        });

        // Sort by date descending (newest first)
        allContent.sort((a, b) => b.date - a.date);

        if (allContent.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">لا يوجد محتوى متاح حالياً.</p></div>';
            return;
        }

        let html = '';
        allContent.forEach(item => {
            const dateStr = item.date.getTime() > 0 ? item.date.toLocaleDateString('ar-EG') : '';

            if (item.type === 'post') {
                const data = item.data;
                // Use excerpt if available, otherwise strip HTML from content
                const rawExcerpt = data.excerpt || (data.content ? data.content.replace(/<[^>]*>/g, '').slice(0, 120) + '...' : '');
                const excerpt = escHtml(rawExcerpt);
                
                let imageUrl = data.coverImage || data.image;
                if (!imageUrl || imageUrl.includes('placeholder.jpg') || imageUrl.includes('default-avatar.png') || imageUrl.includes('blog-placeholder.jpg')) {
                    imageUrl = 'assets/images/favicon.png';
                }

                let imageHtml = '';
                if (imageUrl === 'assets/images/favicon.png') {
                    imageHtml = `<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${imageUrl}" style="width: 80px; opacity: 0.7;" alt="Jhome">
                    </div>`;
                } else {
                    imageHtml = `<div style="background: url('${encodeURI(imageUrl)}') center/cover no-repeat; height: 220px; position: relative;"></div>`;
                }
                
                const postUrl = `post.html?slug=${encodeURIComponent(data.slug || item.id)}`;

                html += `
                    <a href="${postUrl}" class="glass-panel course-card" data-card-type="post" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none; text-decoration: none; color: inherit; transition: transform 0.3s ease;">
                        ${imageHtml}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">مقال - ${escHtml(data.category || 'عام')}</span>
                                <span class="text-muted" style="font-size: 0.85rem;"><i class="fas fa-calendar"></i> ${dateStr}</span>
                            </div>
                            <h3 style="margin-bottom: 10px; font-size: 1.4rem;">${escHtml(data.title)}</h3>
                            <p style="margin-bottom: 1.5rem; flex: 1; line-height: 1.6; color: var(--text-secondary);">${excerpt}</p>
                            <span class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; background: transparent; color: var(--primary); padding: 0;">
                                قراءة المزيد <i class="fas fa-arrow-left"></i>
                            </span>
                        </div>
                    </a>
                `;
            } else if (item.type === 'story') {
                const data = item.data;
                
                // Link to story detail page
                const storyUrl = `story.html?id=${encodeURIComponent(item.id)}`;

                let imageUrl = data.coverImage || data.personAvatar;
                if (!imageUrl || imageUrl.includes('placeholder.jpg') || imageUrl.includes('default-avatar.png') || imageUrl.includes('blog-placeholder.jpg')) {
                    imageUrl = 'assets/images/favicon.png';
                }

                let imageHtml = '';
                if (imageUrl === 'assets/images/favicon.png') {
                    imageHtml = `<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${imageUrl}" style="width: 80px; opacity: 0.7;" alt="Jhome">
                    </div>`;
                } else {
                    imageHtml = `<div style="background: url('${encodeURI(imageUrl)}') center/cover no-repeat; height: 220px; position: relative;"></div>`;
                }

                html += `
                    <div class="glass-panel course-card" data-card-type="story" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none;">
                        ${imageHtml}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                                <h3 style="margin: 0; font-size: 1.4rem;">${escHtml(data.personName)}</h3>
                                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10B981; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; white-space: nowrap;">قصة نجاح</span>
                            </div>
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">${escHtml(data.personRole || '')}</p>
                            
                            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 15px; border-right: 3px solid var(--primary);">
                                <p class="text-muted" style="margin: 0; font-size: 0.9rem;">
                                    <strong>أهم إنجاز:</strong> ${escHtml(data.keyAchievement || '')}
                                </p>
                            </div>
                            
                            <p style="margin-bottom: 1.5rem; line-height: 1.6; flex: 1; color: var(--text-secondary);">${escHtml((data.story || '').slice(0, 150))}...</p>
                            <a href="${storyUrl}" class="btn btn-primary" style="margin-top: auto; display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--primary); padding: 0; border: none; text-decoration: none;">
                                قراءة القصة كاملة <i class="fas fa-arrow-left"></i>
                            </a>
                        </div>
                    </div>
                `;
            }
        });
        
        grid.innerHTML = html;

    } catch (e) {
        console.error('Error loading media content:', e);
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة لاحقاً.</p></div>';
    }
}