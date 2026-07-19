/**
 * ResourceViewer.js
 * Smart Resource Library handling categorizations, previews, and instant sync.
 */

export const ResourceViewer = {
    elements: {},
    engine: null,
    unsubscribe: null,
    resources: [],

    init(engine) {
        this.engine = engine;
        this.elements = {
            container: document.getElementById('resources-container'),
            countBadge: document.getElementById('resources-count')
        };

        this.setupFirestoreSync();
    },

    setupFirestoreSync() {
        if (!this.engine.courseId) return;

        const db = firebase.firestore();
        this.unsubscribe = db.collection('courses').doc(this.engine.courseId).collection('resources')
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                const newRes = [];
                snapshot.forEach(doc => {
                    newRes.push({ id: doc.id, ...doc.data() });
                });
                
                this.resources = newRes;
                this.render();
            });
    },

    getFileIcon(type) {
        if (!type) return 'fa-file';
        if (type.includes('pdf')) return 'fa-file-pdf';
        if (type.includes('image')) return 'fa-file-image';
        if (type.includes('video')) return 'fa-file-video';
        if (type.includes('audio')) return 'fa-file-audio';
        if (type.includes('zip') || type.includes('rar')) return 'fa-file-archive';
        if (type.includes('word') || type.includes('document')) return 'fa-file-word';
        if (type.includes('link') || type === 'url') return 'fa-link';
        return 'fa-file';
    },

    render() {
        if (!this.elements.container) return;

        if (this.elements.countBadge) {
            this.elements.countBadge.textContent = `${this.resources.length} ملفات`;
        }

        if (this.resources.length === 0) {
            this.elements.container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>لا توجد ملفات مرفقة حالياً</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.resources.forEach(res => {
            const icon = this.getFileIcon(res.type);
            const sizeStr = res.size ? ` • ${(res.size / 1024 / 1024).toFixed(2)} MB` : '';
            
            html += `
                <a href="${res.url}" target="_blank" class="resource-card" style="display: flex; align-items: center; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--room-border); border-radius: 12px; text-decoration: none; color: inherit; transition: all 0.2s;">
                    <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(59, 130, 246, 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary-light); font-size: 1.2rem; margin-left: 1rem;">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <span style="font-weight: bold; font-size: 0.95rem;">${res.title || 'ملف بدون عنوان'}</span>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">${res.type || 'مستند'}${sizeStr}</span>
                    </div>
                    <i class="fas fa-download" style="color: var(--text-secondary);"></i>
                </a>
            `;
        });

        this.elements.container.innerHTML = html;
    }
};
