class ProjectsUIClass {
    constructor() {
        this.grid = document.getElementById('projects-grid');
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderError() {
        if (!this.grid) return;
        this.grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">حدث خطأ أثناء تحميل المنتجات.</p></div>';
    }

    renderEmpty() {
        if (!this.grid) return;
        this.grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem;"><p class="text-muted">لا توجد منتجات مضافة حالياً.</p></div>';
    }

    renderProjects(projects) {
        if (!this.grid) return;

        const fragment = document.createDocumentFragment();

        projects.forEach((data, index) => {
            const delay = (index + 1) * 100;
            const isLive = data.status === 'مباشر';
            
            const badgeBg = isLive ? 'var(--success)' : 'var(--warning)';
            const badgeColor = isLive ? 'white' : '#000';
            const progressBg = isLive ? 'var(--primary-color)' : 'var(--warning)';

            const btnHtml = isLive 
                ? `<a href="${this.escapeHtml(data.link || '#')}" class="btn btn-primary" style="margin-top: auto; width: 100%;">استعراض التفاصيل</a>`
                : `<button class="btn btn-secondary" style="margin-top: auto; width: 100%; cursor: not-allowed;" disabled>قريباً</button>`;

            const bgGradient = isLive 
                ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(20, 184, 166, 0.1))'
                : 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))';
            
            const iconHtml = isLive
                ? `<div style="width: 150px; height: 300px; background: var(--bg-surface); border: 6px solid #1E293B; border-radius: 20px; box-shadow: var(--elevation-3); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                       <i class="${this.escapeHtml(data.icon || 'fas fa-handshake')}" style="font-size: 2.5rem; color: var(--text-primary); margin-bottom: 1rem;"></i>
                   </div>`
                : `<i class="${this.escapeHtml(data.icon || 'fas fa-cubes')}" style="font-size: 8rem; color: var(--text-tertiary); opacity: 0.5;"></i>`;

            const wrapper = document.createElement('div');
            wrapper.className = `glass-panel animate-fade-up delay-${delay}`;
            wrapper.style.padding = '0';
            wrapper.style.overflow = 'hidden';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            if (!isLive) wrapper.style.opacity = '0.7';

            wrapper.innerHTML = `
                <div style="background: ${bgGradient}; padding: 3rem; display: flex; justify-content: center; position: relative;">
                    <span style="position: absolute; top: 1rem; right: 1rem; background: ${badgeBg}; color: ${badgeColor}; padding: 0.25rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 600;">${this.escapeHtml(data.status)}</span>
                    ${iconHtml}
                </div>
                <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column;">
                    <h2 class="display-2" style="font-size: 2rem; margin-bottom: 0.5rem;">${this.escapeHtml(data.title)}</h2>
                    <p class="text-muted" style="margin-bottom: 1.5rem;">${this.escapeHtml(data.description)}</p>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span class="caption-meta">نسبة الإنجاز</span>
                            <span class="caption-meta en-text">${data.progress || 0}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${data.progress || 0}%; height: 100%; background: ${progressBg};"></div>
                        </div>
                    </div>

                    ${btnHtml}
                </div>
            `;
            fragment.appendChild(wrapper);
        });

        this.grid.innerHTML = '';
        this.grid.appendChild(fragment);
    }
}

export const ProjectsUI = new ProjectsUIClass();
