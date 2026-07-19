/**
 * ResourceEngine.js
 * Handles the display, categorization, and downloading of course resources and attachments.
 */

import { EventBus, Events } from './EventBus.js';
import { StateStore } from './StateStore.js';
import { jhomeDb } from './FirebaseAdapter.js';

export const ResourceEngine = {
    containerSelector: '#room-resources-list',

    init(courseId) {
        if (!courseId) return;
        this.courseId = courseId;
        this.container = document.querySelector(this.containerSelector);
        this.resources = [];
        this.currentSort = 'date';
        this.searchQuery = '';

        if (!this.container) return;

        EventBus.subscribe(Events.ROOM_ENTERED, () => {
            this.loadResources();
        });
    },

    loadResources() {
        this.container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

        const unsub = jhomeDb.collection('courses').doc(this.courseId).collection('resources')
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                this.resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.render();
            }, err => {
                console.error("Resources sync error:", err);
                this.container.innerHTML = '<div style="padding: 1rem; color: #EF4444; text-align: center;">خطأ في تحميل الملحقات</div>';
            });
            
        StateStore.registerSubscription('resourcesSync', unsub);
    },

    getFileIcon(url, name) {
        const ext = (url.split('?')[0].split('.').pop() || name.split('.').pop() || '').toLowerCase();
        switch(ext) {
            case 'pdf': return '<i class="fas fa-file-pdf" style="color: #EF4444;"></i>';
            case 'zip': case 'rar': return '<i class="fas fa-file-archive" style="color: #F59E0B;"></i>';
            case 'mp4': case 'mov': return '<i class="fas fa-file-video" style="color: #3B82F6;"></i>';
            case 'jpg': case 'jpeg': case 'png': return '<i class="fas fa-file-image" style="color: #10B981;"></i>';
            default: return '<i class="fas fa-link" style="color: var(--text-muted);"></i>';
        }
    },

    formatBytes(bytes) {
        if (!bytes || bytes === 0) return '';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    setSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.render();
    },

    setSort(sortType) {
        this.currentSort = sortType;
        this.render();
    },

    getFilteredAndSorted() {
        let filtered = this.resources.filter(r => 
            (r.name || '').toLowerCase().includes(this.searchQuery)
        );

        filtered.sort((a, b) => {
            if (this.currentSort === 'name') {
                return (a.name || '').localeCompare(b.name || '');
            }
            // default is date desc
            const dateA = a.timestamp ? a.timestamp.toMillis() : 0;
            const dateB = b.timestamp ? b.timestamp.toMillis() : 0;
            return dateB - dateA;
        });

        return filtered;
    },

    render() {
        if (!this.container) return;

        const processed = this.getFilteredAndSorted();

        // Toolbar: Search and Sort
        let html = `
            <div style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 0.5rem; flex-wrap: wrap; background: rgba(0,0,0,0.2);">
                <input type="text" class="form-input" placeholder="بحث في الملحقات..." 
                       style="flex: 2; min-width: 150px; background: rgba(255,255,255,0.05); border: none;"
                       onkeyup="window.ResourceEngine_search(this.value)" value="${this.searchQuery}">
                <select class="form-input" style="flex: 1; min-width: 100px; background: rgba(255,255,255,0.05); border: none;"
                        onchange="window.ResourceEngine_sort(this.value)">
                    <option value="date" ${this.currentSort === 'date' ? 'selected' : ''}>الأحدث</option>
                    <option value="name" ${this.currentSort === 'name' ? 'selected' : ''}>الاسم</option>
                </select>
            </div>
            <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.8rem;">
        `;

        if (processed.length === 0) {
            html += `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">لا توجد ملحقات مطابقة.</div>`;
        } else {
            processed.forEach(res => {
                const icon = this.getFileIcon(res.url, res.name);
                const sizeStr = this.formatBytes(res.sizeBytes);
                const dateStr = res.timestamp ? new Date(res.timestamp.toMillis()).toLocaleDateString('ar-EG') : '';

                html += `
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: center; justify-content: space-between; transition: transform 0.2s, background 0.2s;"
                         onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.transform='translateY(-2px)';"
                         onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.transform='none';">
                        
                        <div style="display: flex; align-items: center; gap: 1rem; overflow: hidden;">
                            <div style="font-size: 1.5rem; width: 40px; text-align: center; flex-shrink: 0;">
                                ${icon}
                            </div>
                            <div style="display: flex; flex-direction: column; min-width: 0;">
                                <h5 style="margin: 0; color: #E2E8F0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.95rem;">${res.name || 'ملحق بدون اسم'}</h5>
                                <div style="display: flex; gap: 1rem; margin-top: 0.3rem;">
                                    ${sizeStr ? `<span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-weight-hanging"></i> ${sizeStr}</span>` : ''}
                                    ${dateStr ? `<span style="font-size: 0.75rem; color: var(--text-muted);"><i class="far fa-calendar-alt"></i> ${dateStr}</span>` : ''}
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                            <a href="${res.url}" target="_blank" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" title="فتح / معاينة">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                            <a href="${res.url}" download class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" title="تنزيل المورد">
                                <i class="fas fa-download"></i>
                            </a>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        this.container.innerHTML = html;
    }
};

window.ResourceEngine_search = (val) => ResourceEngine.setSearch(val);
window.ResourceEngine_sort = (val) => ResourceEngine.setSort(val);
