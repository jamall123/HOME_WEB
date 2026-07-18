// projects.js - Loads projects dynamically from Firestore

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if(!grid) return;

    try {
        const db = firebase.firestore();
        const snap = await db.collection('projects').get();
        
        if (snap.empty) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">لا توجد منتجات مضافة حالياً.</p></div>';
            return;
        }

        let html = '';
        let index = 0;
        snap.forEach((doc) => {
            const data = doc.data();
            const delay = (index + 1) * 100;
            index++;
            const isLive = data.status === 'مباشر';
            
            // Badge color
            const badgeBg = isLive ? 'var(--success)' : 'var(--warning)';
            const badgeColor = isLive ? 'white' : '#000';
            
            // Progress bar color
            const progressBg = isLive ? 'var(--primary-color)' : 'var(--warning)';

            // Button state
            const btnHtml = isLive 
                ? `<a href="${data.link || '#'}" class="btn btn-primary" style="margin-top: auto; width: 100%;">استعراض التفاصيل</a>`
                : `<button class="btn btn-secondary" style="margin-top: auto; width: 100%; cursor: not-allowed;" disabled>قريباً</button>`;

            // Top graphic styling
            const bgGradient = isLive 
                ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(20, 184, 166, 0.1))'
                : 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))';
            
            const iconHtml = isLive
                ? `<div style="width: 150px; height: 300px; background: var(--bg-surface); border: 6px solid #1E293B; border-radius: 20px; box-shadow: var(--elevation-3); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                       <i class="${data.icon || 'fas fa-handshake'}" style="font-size: 2.5rem; color: var(--text-primary); margin-bottom: 1rem;"></i>
                   </div>`
                : `<i class="${data.icon || 'fas fa-cubes'}" style="font-size: 8rem; color: var(--text-tertiary); opacity: 0.5;"></i>`;

            html += `
                <div class="glass-panel animate-fade-up delay-${delay}" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; ${!isLive ? 'opacity: 0.7;' : ''}">
                    <div style="background: ${bgGradient}; padding: 3rem; display: flex; justify-content: center; position: relative;">
                        <span style="position: absolute; top: 1rem; right: 1rem; background: ${badgeBg}; color: ${badgeColor}; padding: 0.25rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 600;">${data.status}</span>
                        ${iconHtml}
                    </div>
                    <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
                        <h2 class="display-2" style="font-size: 2rem; margin-bottom: 0.5rem;">${data.title}</h2>
                        <p class="text-muted" style="margin-bottom: 1.5rem;">${data.description}</p>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span class="caption-meta">نسبة الإنجاز</span>
                                <span class="caption-meta en-text">${data.progress}%</span>
                            </div>
                            <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${data.progress}%; height: 100%; background: ${progressBg};"></div>
                            </div>
                        </div>

                        ${btnHtml}
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

    } catch (e) {
        console.error('Error loading projects:', e);
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">حدث خطأ أثناء تحميل المنتجات.</p></div>';
    }
}
