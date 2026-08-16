/**
 * ResourceManager.js
 * The DOM/UI layer for Resource Management. 
 * Replaces the legacy ResourceViewer.js to add Drag & Drop and Queue UI.
 */

import { ResourceController } from './ResourceController.js';
import { UploadQueue } from '../room/UploadQueue.js';
import { eventBus, Events } from '../../core/EventBus.js';

export class ResourceManagerClass {
    constructor() {
        this.engine = null;
        this.dropZone = null;
        this.selectedFiles = [];
        this.queueContainer = null;
        // Map of uploadId -> original File object (for retry)
        this._fileStore = new Map();
    }

    init(engine) {
        this.engine = engine;
        ResourceController.init(engine);
        
        if (this.engine.isInstructor) {
            this.setupDragAndDrop();
            this.renderUploadQueueUI();
            
            // Subscribe to Queue updates
            UploadQueue.subscribe((queueData) => this.renderQueueList(queueData));
            
            // Hook up UI callbacks
            ResourceController.onProgressUpdate = (id, state, progress, preview) => {
                this.updateProgressUI(id, progress);
                if (state === 'success') {
                    // In real-time sync mode, the onSnapshot listener will automatically 
                    // fetch and render the new resource once OfflineSyncEngine writes to Firestore.
                    // No need for manual reload here.
                }
            };
        }
        
        ResourceController.onLessonChange = () => {
            ResourceController.startSync((resources) => {
                this.renderStudentResources(resources);
                if (this.engine.isInstructor) this.renderInstructorResources(resources);
            });
        };

        ResourceController.startSync((resources) => {
            this.renderStudentResources(resources);
            if (this.engine.isInstructor) this.renderInstructorResources(resources);
        });

        eventBus.subscribe(Events.DESTROY_ROOM_SESSION, () => {
            this.destroy();
        });
    }

    destroy() {
        ResourceController.stopSync();
        this.selectedFiles = [];
        this._fileStore.clear();
        
        const list = document.getElementById('inst-uploaded-resources-list');
        if (list) list.innerHTML = '';
        
        const studentList = document.getElementById('resources-container');
        if (studentList) studentList.innerHTML = '';
        
        if (this.queueContainer) this.queueContainer.innerHTML = '';
    }

    setupDragAndDrop() {
        // ── Drag & Drop Overlay on the student resources tab ──
        const container = document.getElementById('side-content-resources');
        if (container) {
            this.dropZone = document.createElement('div');
            this.dropZone.className = 'drop-zone-overlay';
            this.dropZone.innerHTML = `
                <div class="drop-zone-content">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 4rem; color: var(--primary-color);"></i>
                    <h2>أفلت الملفات هنا للرفع</h2>
                </div>
            `;
            Object.assign(this.dropZone.style, {
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', color: 'white', display: 'none',
                justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                border: '2px dashed var(--primary-color)'
            });
            container.style.position = 'relative';
            container.appendChild(this.dropZone);

            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.dropZone.style.display = 'flex';
            });
            this.dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                this.dropZone.style.display = 'none';
            });
            this.dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.dropZone.style.display = 'none';
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    ResourceController.handleFilesDropped(e.dataTransfer.files);
                }
            });
        }

        this.selectedFiles = [];

        // ── Event Delegation: handles file input & upload button
        //    even if DOM isn't rendered yet at init() time ──
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'inst-new-resource-file') {
                if (e.target.files && e.target.files.length > 0) {
                    this.handleFilesSelected(Array.from(e.target.files));
                }
            }
        });

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#inst-resource-upload-btn');
            if (!btn) return;
            if (this.selectedFiles.length === 0) return;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الرفع...';

            // Store files for possible retry
            ResourceController.handleFilesDropped(this.selectedFiles);

            setTimeout(() => {
                this.selectedFiles = [];
                const previewContainer = document.getElementById('inst-resource-preview-container');
                const fileInput = document.getElementById('inst-new-resource-file');
                if (previewContainer) previewContainer.style.display = 'none';
                if (fileInput) fileInput.value = '';
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-upload"></i> بدء الرفع';
            }, 600);
        });

        // ── Clipboard Paste ──
        document.addEventListener('paste', (e) => {
            if (!this.engine.isInstructor) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.clipboardData.files && e.clipboardData.files.length > 0) {
                e.preventDefault();
                this.handleFilesSelected(Array.from(e.clipboardData.files));
            }
        });
    }

    handleFilesSelected(files) {
        this.selectedFiles = files;
        const container = document.getElementById('inst-resource-preview-container');
        const list = document.getElementById('inst-resource-preview-list');

        if (!container || !list) {
            // DOM not yet ready – retry after a short delay
            setTimeout(() => this.handleFilesSelected(files), 300);
            return;
        }

        list.innerHTML = '';
        files.forEach(file => {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            const { icon, color } = this._getFileIconInfo(file.type || '', file.name || '');
            const el = document.createElement('div');
            el.style.cssText = 'display:flex; align-items:center; gap:0.5rem; padding:0.4rem 0.5rem; background:rgba(255,255,255,0.05); border-radius:6px; margin-bottom:0.3rem;';
            el.innerHTML = `
                <i class="fas ${icon}" style="color:${color}; flex-shrink:0;"></i>
                <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:0.82rem;" title="${file.name}">${file.name}</span>
                <span style="font-size:0.72rem; color:var(--text-secondary); flex-shrink:0;">${sizeMb} MB</span>
            `;
            list.appendChild(el);
        });

        container.style.display = 'block';
    }

    renderUploadQueueUI() {
        const container = document.getElementById('inst-resource-list');
        if (!container) return;

        this.queueContainer = document.createElement('div');
        this.queueContainer.id = 'upload-queue-container';
        this.queueContainer.style.marginTop = '1rem';
        container.appendChild(this.queueContainer);
    }

    renderQueueList(queueData) {
        if (!this.queueContainer) return;
        
        if (queueData.length === 0) {
            this.queueContainer.innerHTML = '';
            return;
        }

        // Status colors
        const statusColors = {
            'Uploading': '#60a5fa',
            'Paused': '#f59e0b',
            'Completed': '#10b981',
            'Failed': '#ef4444',
            'Cancelled': '#6b7280',
            'Pending': '#a78bfa'
        };
        const statusLabels = {
            'Uploading': 'يرفع',
            'Paused': 'موقوف',
            'Completed': 'اكتمل',
            'Failed': 'فشل',
            'Cancelled': 'ملغي',
            'Pending': 'بانتظار'
        };

        const fragment = document.createDocumentFragment();

        // Header
        const header = document.createElement('div');
        header.style.cssText = 'font-size:0.72rem; color:var(--text-secondary); padding: 0.2rem 0; text-transform:uppercase; letter-spacing:0.5px;';
        header.innerHTML = `<i class="fas fa-tasks" style="margin-left:0.3rem;"></i> قائمة الرفع`;
        fragment.appendChild(header);

        queueData.forEach(item => {
            // Store the file reference if available (from UploadQueue data)
            if (item.file) this._fileStore.set(item.id, item.file);

            const color = statusColors[item.status] || '#9ca3af';
            const label = statusLabels[item.status] || item.status;
            const isActive = item.status === 'Uploading' || item.status === 'Paused';
            const isFailed = item.status === 'Failed' || item.status === 'Cancelled';
            const canRetry = isFailed && this._fileStore.has(item.id);
            const canDismiss = isFailed || item.status === 'Completed' || item.status === 'Cancelled';

            const el = document.createElement('div');
            el.style.cssText = `background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:8px; padding:0.5rem 0.6rem; border-right:3px solid ${color};`;

            el.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.35rem;">
                    <span style="flex:1; font-size:0.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.name}">${item.name}</span>
                    <span style="font-size:0.68rem; background:${color}22; color:${color}; padding:0.1rem 0.4rem; border-radius:4px; white-space:nowrap;">${label}</span>
                </div>
                <div style="height:3px; background:rgba(255,255,255,0.08); border-radius:2px; overflow:hidden;">
                    <div id="prog-${item.id}" style="height:100%; background:${color}; width:${item.progress}%; transition:width 0.3s;"></div>
                </div>
                ${isActive ? `<div style="display:flex; gap:0.3rem; margin-top:0.35rem;">
                    ${item.status === 'Uploading' ? `<button class="btn btn-sm" style="font-size:0.68rem; padding:0.2rem 0.5rem; border-radius:4px;" onclick="window.ResourceAPI.pause('${item.id}')"><i class="fas fa-pause"></i> إيقاف</button>` : ''}
                    ${item.status === 'Paused' ? `<button class="btn btn-sm btn-primary" style="font-size:0.68rem; padding:0.2rem 0.5rem; border-radius:4px;" onclick="window.ResourceAPI.resume('${item.id}')"><i class="fas fa-play"></i> متابعة</button>` : ''}
                    <button class="btn btn-sm" style="font-size:0.68rem; padding:0.2rem 0.5rem; border-radius:4px; color:var(--danger);" onclick="window.ResourceAPI.cancel('${item.id}')"><i class="fas fa-times"></i></button>
                </div>` : ''}
                ${(canRetry || canDismiss) ? `<div style="display:flex; gap:0.3rem; margin-top:0.35rem;">
                    ${canRetry ? `<button class="btn btn-sm btn-primary" style="font-size:0.68rem; padding:0.2rem 0.6rem; border-radius:4px;" onclick="window.ResourceAPI.retry('${item.id}')">
                        <i class="fas fa-redo"></i> إعادة المحاولة
                    </button>` : ''}
                    ${canDismiss ? `<button class="btn btn-sm" style="font-size:0.68rem; padding:0.2rem 0.5rem; border-radius:4px; color:var(--text-secondary);" onclick="window.ResourceAPI.dismiss('${item.id}')">
                        <i class="fas fa-times"></i> إزالة من القائمة
                    </button>` : ''}
                </div>` : ''}
            `;
            fragment.appendChild(el);
        });

        this.queueContainer.innerHTML = '';
        this.queueContainer.appendChild(fragment);

        // Expose API for inline buttons (merge with existing to preserve deleteInstructor)
        window.ResourceAPI = window.ResourceAPI || {};
        Object.assign(window.ResourceAPI, {
            pause:   (id) => ResourceController.pauseUpload(id),
            resume:  (id) => ResourceController.resumeUpload(id),
            cancel:  (id) => {
                ResourceController.cancelUpload(id);
                // Keep file stored for possible retry
            },
            retry: (id) => {
                const file = this._fileStore.get(id);
                if (!file) return;
                // Remove the old failed entry from queue display
                UploadQueue.removeUpload(id);
                this._fileStore.delete(id);
                // Re-upload the file
                ResourceController.handleFilesDropped([file]);
            },
            dismiss: (id) => {
                this._fileStore.delete(id);
                UploadQueue.removeUpload(id);
            }
        });

    }

    updateProgressUI(id, progress) {
        const bar = document.getElementById(`prog-${id}`);
        if (bar) bar.style.width = `${progress}%`;
    }

    /** Returns a Font Awesome icon class + color based on MIME type */
    _getFileIconInfo(mimeType = '', fileName = '') {
        const n = fileName.toLowerCase();
        if (mimeType.startsWith('image/'))         return { icon: 'fa-file-image',      color: '#10b981' };
        if (mimeType.startsWith('video/'))         return { icon: 'fa-file-video',      color: '#ef4444' };
        if (mimeType.startsWith('audio/'))         return { icon: 'fa-file-audio',      color: '#a78bfa' };
        if (mimeType === 'application/pdf')        return { icon: 'fa-file-pdf',        color: '#ef4444' };
        if (mimeType.includes('word') || n.endsWith('.doc') || n.endsWith('.docx'))
                                                   return { icon: 'fa-file-word',       color: '#3b82f6' };
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || n.endsWith('.xls') || n.endsWith('.xlsx'))
                                                   return { icon: 'fa-file-excel',      color: '#22c55e' };
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || n.endsWith('.ppt') || n.endsWith('.pptx'))
                                                   return { icon: 'fa-file-powerpoint', color: '#f97316' };
        if (mimeType.includes('zip') || mimeType.includes('rar')) return { icon: 'fa-file-archive', color: '#f59e0b' };
        return { icon: 'fa-file', color: '#64748b' };
    }

    /** Renders uploaded resources inside the instructor panel with delete buttons */
    async renderInstructorResources(resources) {
        const list = document.getElementById('inst-uploaded-resources-list');
        const badge = document.getElementById('inst-res-count-badge');
        if (!list) return;

        // Update badge
        if (badge) badge.textContent = resources.length;

        if (resources.length === 0) {
            list.innerHTML = `
                <div style="text-align:center; padding:1rem 0; color:var(--text-secondary); font-size:0.8rem;">
                    <i class="fas fa-inbox" style="font-size:1.5rem; opacity:0.3; display:block; margin-bottom:0.4rem;"></i>
                    لا توجد ملفات منشورة
                </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        resources.forEach(res => {
            const { icon, color } = this._getFileIconInfo(res.mimeType || '', res.fileName || '');
            const sizeMb = (res.size / (1024 * 1024)).toFixed(2);
            const dateStr = new Date(res.createdAt?.toDate?.() || Date.now()).toLocaleDateString('ar-SA');

            const el = document.createElement('div');
            el.style.cssText = `
                display:flex; align-items:center; gap:0.5rem;
                background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
                border-radius:8px; padding:0.5rem 0.6rem;
                border-right:3px solid ${color};
            `;
            el.innerHTML = `
                <i class="fas ${icon}" style="color:${color}; font-size:1.1rem; flex-shrink:0;"></i>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:0.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500;" title="${res.fileName}">${res.fileName}</div>
                    <div style="font-size:0.65rem; color:var(--text-secondary);">${sizeMb} MB · ${dateStr}</div>
                </div>
                <div style="display:flex; gap:0.25rem; flex-shrink:0;">
                    <a href="${res.downloadUrl}" target="_blank" 
                       style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:5px; background:rgba(96,165,250,0.15); color:#60a5fa; font-size:0.7rem; text-decoration:none;" 
                       title="تحميل">
                        <i class="fas fa-download"></i>
                    </a>
                    <button onclick="window.ResourceAPI.deleteInstructor('${res.resourceId}')"
                            style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:5px; background:rgba(239,68,68,0.15); color:#ef4444; font-size:0.7rem; border:none; cursor:pointer;" 
                            title="حذف الملف">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            fragment.appendChild(el);
        });

        list.innerHTML = '';
        list.appendChild(fragment);

        // Register delete handler
        window.ResourceAPI = window.ResourceAPI || {};
        window.ResourceAPI.deleteInstructor = async (id) => {
            // Use custom dialog if available, else fallback to browser confirm
            let confirmed = false;
            if (window.RoomConfirmDialog) {
                confirmed = await window.RoomConfirmDialog.show({
                    icon: '🗑️',
                    title: 'حذف الملف',
                    body: 'سيتم حذف الملف نهائياً من الدرس وصفحة الملحقات للطلاب. هل تريد المتابعة؟',
                    okLabel: 'حذف',
                    cancelLabel: 'إلغاء',
                    danger: true
                });
            } else {
                confirmed = confirm('هل أنت متأكد من حذف هذا الملف؟');
            }

            if (!confirmed) return;

            const btn = document.querySelector(`[onclick="window.ResourceAPI.deleteInstructor('${id}')"]`);
            if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

            try {
                await ResourceController.deleteResource(id);
                // In real-time sync mode, the onSnapshot listener will handle the UI update automatically.
            } catch (err) {
                console.error('[ResourceManager] Delete failed', err);
                if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-trash-alt"></i>'; }
            }
        };
    }

    async renderStudentResources(resources) {
        const displayContainer = document.getElementById('resources-container'); // The main student-facing list
        if (!displayContainer) return;

        if (resources.length === 0) {
            displayContainer.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">لا توجد ملفات مرفقة حالياً.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        resources.forEach(res => {
            const el = document.createElement('div');
            el.className = 'resource-item';
            el.style.padding = '1rem';
            el.style.background = 'rgba(255,255,255,0.02)';
            el.style.border = '1px solid rgba(255,255,255,0.05)';
            el.style.borderRadius = '8px';
            el.style.display = 'flex';
            el.style.flexWrap = 'wrap';
            el.style.gap = '1rem';
            el.style.justifyContent = 'space-between';
            el.style.alignItems = 'center';

            const sizeMb = (res.size / (1024 * 1024)).toFixed(2);

            el.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center; flex: 1 1 200px; min-width: 0;">
                    <i class="fas fa-file" style="font-size: 2rem; color: var(--primary-color); flex-shrink: 0;"></i>
                    <div style="min-width: 0; overflow: hidden;">
                        <h4 style="margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${res.fileName?.replace(/"/g, '&quot;') || ''}">${res.fileName ? String(res.fileName).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''}</h4>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">${sizeMb} MB | ${new Date(res.createdAt?.toDate() || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; flex-shrink: 0;">
                    <a href="${res.downloadUrl}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-download"></i> تحميل</a>
                    ${this.engine.isInstructor ? `<button class="btn btn-info btn-sm" onclick="window.ResourceAPI.showDetails('${res.resourceId}')"><i class="fas fa-info-circle"></i></button>` : ''}
                    ${this.engine.isInstructor ? `<button class="btn btn-dark btn-sm" style="color:var(--danger);" onclick="window.ResourceAPI.delete('${res.resourceId}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            `;
            fragment.appendChild(el);
        });

        displayContainer.innerHTML = '';
        displayContainer.appendChild(fragment);

        if (this.engine.isInstructor) {
            window.ResourceAPI = window.ResourceAPI || {};
            
            // Define or redefine delete
            if (!window.ResourceAPI.delete) {
                window.ResourceAPI.delete = async (id) => {
                    if(confirm('هل أنت متأكد من حذف هذا الملف؟')) {
                        await ResourceController.deleteResource(id);
                        // In real-time mode, onSnapshot handles UI refresh automatically.
                    }
                };
            }
            
            // Define showDetails
            window.ResourceAPI.showDetails = (id) => {
                const res = resources.find(r => r.resourceId === id);
                if (!res) return;
                
                let modal = document.getElementById('inst-res-details-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'inst-res-details-modal';
                    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:99999; display:flex; align-items:center; justify-content:center;';
                    modal.innerHTML = `
                        <div class="glass-panel" style="width: 400px; padding: 2rem; border-radius: 12px; position: relative;">
                            <button id="inst-res-close-btn" style="position:absolute; top:1rem; left:1rem; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
                            <h3 style="margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:1rem; margin-bottom:1rem;">تفاصيل المورد</h3>
                            <div id="inst-res-details-content"></div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    document.getElementById('inst-res-close-btn').addEventListener('click', () => { modal.style.display = 'none'; });
                    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
                }
                
                const sizeMb = (res.size / (1024 * 1024)).toFixed(2);
                const content = document.getElementById('inst-res-details-content');
                content.innerHTML = `
                    <div style="margin-bottom: 0.8rem;"><strong>اسم الملف:</strong> ${res.fileName || 'غير متوفر'}</div>
                    <div style="margin-bottom: 0.8rem;"><strong>النوع:</strong> ${res.fileType || 'غير محدد'}</div>
                    <div style="margin-bottom: 0.8rem;"><strong>الحجم:</strong> ${sizeMb} MB</div>
                    <div style="margin-bottom: 0.8rem;"><strong>الدرس المرتبط:</strong> ${res.lessonId || 'عام'}</div>
                    <div style="margin-bottom: 0.8rem;"><strong>تاريخ الرفع:</strong> ${new Date(res.createdAt?.toDate() || Date.now()).toLocaleDateString()}</div>
                `;
                modal.style.display = 'flex';
            };
        }
        
        // Update count
        const countBadge = document.getElementById('resources-count');
        if (countBadge) countBadge.innerText = `${resources.length} ملفات`;
    }
}

export const ResourceManager = new ResourceManagerClass();
