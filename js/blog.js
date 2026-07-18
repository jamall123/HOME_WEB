// blog.js - Logic for Media Center (Unified Feed for Blog and Success Stories)

document.addEventListener('DOMContentLoaded', () => {
    loadMediaContent();
});

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
                const excerpt = data.excerpt || (data.content ? data.content.substring(0, 100) + '...' : '');
                
                let imageUrl = data.coverImage || data.image;
                if (!imageUrl || imageUrl.includes('placeholder.jpg') || imageUrl.includes('default-avatar.png') || imageUrl.includes('blog-placeholder.jpg')) {
                    imageUrl = 'assets/images/favicon.png';
                }

                let imageHtml = '';
                if (imageUrl === 'assets/images/favicon.png') {
                    imageHtml = `<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${imageUrl}" style="width: 80px; opacity: 0.7;">
                    </div>`;
                } else {
                    imageHtml = `<div style="background: url('${imageUrl}') center/cover no-repeat; height: 220px; position: relative;"></div>`;
                }
                
                html += `
                    <div class="glass-panel course-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none;">
                        ${imageHtml}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">مقال - ${data.category || 'عام'}</span>
                                <span class="text-muted" style="font-size: 0.85rem;"><i class="fas fa-calendar"></i> ${dateStr}</span>
                            </div>
                            <h3 style="margin-bottom: 10px; font-size: 1.4rem;">${data.title}</h3>
                            <p style="margin-bottom: 1.5rem; flex: 1; line-height: 1.6; color: var(--text-secondary);">${excerpt}</p>
                        </div>
                    </div>
                `;
            } else if (item.type === 'story') {
                const data = item.data;
                
                let linkBtn = '';
                if (data.freelancerLink) {
                    linkBtn = `<a href="${data.freelancerLink}" target="_blank" class="btn btn-primary btn-full" style="margin-top: auto; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    زيارة ملف الحرفي <span class="material-icons-outlined" style="font-size: 18px;">open_in_new</span>
                               </a>`;
                }

                let imageUrl = data.coverImage || data.personAvatar;
                if (!imageUrl || imageUrl.includes('placeholder.jpg') || imageUrl.includes('default-avatar.png') || imageUrl.includes('blog-placeholder.jpg')) {
                    imageUrl = 'assets/images/favicon.png';
                }

                let imageHtml = '';
                if (imageUrl === 'assets/images/favicon.png') {
                    imageHtml = `<div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(20, 184, 166, 0.15)); height: 220px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${imageUrl}" style="width: 80px; opacity: 0.7;">
                    </div>`;
                } else {
                    imageHtml = `<div style="background: url('${imageUrl}') center/cover no-repeat; height: 220px; position: relative;"></div>`;
                }

                html += `
                    <div class="glass-panel course-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; background: transparent; box-shadow: none; border: none;">
                        ${imageHtml}
                        <div style="background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; margin-top: -30px; position: relative; z-index: 2; box-shadow: var(--elevation-2);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                                <h3 style="margin: 0; font-size: 1.4rem;">${data.personName}</h3>
                                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10B981; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; white-space: nowrap;">قصة نجاح</span>
                            </div>
                            <p style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">${data.personRole || ''}</p>
                            
                            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 15px; border-right: 3px solid var(--primary);">
                                <p class="text-muted" style="margin: 0; font-size: 0.9rem;">
                                    <strong>أهم إنجاز:</strong> ${data.keyAchievement || ''}
                                </p>
                            </div>
                            
                            <p style="margin-bottom: 1.5rem; line-height: 1.6; flex: 1; color: var(--text-secondary);">${data.story}</p>
                            ${linkBtn}
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