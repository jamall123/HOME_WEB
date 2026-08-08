/**
 * ResourceManager.js
 * The DOM/UI layer for Resource Management. 
 * Replaces the legacy ResourceViewer.js to add Drag & Drop and Queue UI.
 */

import { ResourceController } from './ResourceController.js';
import { UploadQueue } from '../room/UploadQueue.js';

export class ResourceManagerClass {
    constructor() {
        this.engine = null;
        this.dropZone = null;
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
                    this.loadResources(); // Refresh main list
                }
            };
        }
        
        ResourceController.onLessonChange = () => {
            this.loadResources();
        };

        this.loadResources();
    }

    setupDragAndDrop() {
        const container = document.getElementById('side-content-resources');
        if (!container) return;

        // Create Drop Zone Overlay
        this.dropZone = document.createElement('div');
        this.dropZone.className = 'drop-zone-overlay';
        this.dropZone.innerHTML = `
            <div class="drop-zone-content">
                <i class="fas fa-cloud-upload-alt" style="font-size: 4rem; color: var(--primary-color);"></i>
                <h2>أفلت الملفات هنا للرفع</h2>
            </div>
        `;
        // Basic styles for drop zone
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

        // Setup standard file input from InstructorUI
        const fileInput = document.getElementById('inst-new-resource-file');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    ResourceController.handleFilesDropped(e.target.files);
                    e.target.value = ''; // Reset
                }
            });
        }

        // Setup Clipboard Paste
        document.addEventListener('paste', (e) => {
            if (!this.engine.isInstructor) return;
            // Prevent if user is typing in a chat input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.clipboardData.files && e.clipboardData.files.length > 0) {
                e.preventDefault();
                ResourceController.handleFilesDropped(e.clipboardData.files);
            }
        });
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

        const fragment = document.createDocumentFragment();
        queueData.forEach(item => {
            const el = document.createElement('div');
            el.style.background = 'rgba(255,255,255,0.05)';
            el.style.padding = '0.5rem';
            el.style.marginBottom = '0.5rem';
            el.style.borderRadius = '4px';

            el.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                    <span>${item.name}</span>
                    <span>${item.status} - ${Math.round(item.progress)}%</span>
                </div>
                <div style="height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 0.5rem; overflow: hidden;">
                    <div id="prog-${item.id}" style="height: 100%; background: var(--primary-color); width: ${item.progress}%; transition: width 0.2s;"></div>
                </div>
                ${item.status === 'Uploading' ? `<button class="btn btn-sm" onclick="window.ResourceAPI.pause('${item.id}')">إيقاف مؤقت</button>` : ''}
                ${item.status === 'Paused' ? `<button class="btn btn-sm" onclick="window.ResourceAPI.resume('${item.id}')">إكمال</button>` : ''}
                ${(item.status === 'Uploading' || item.status === 'Paused') ? `<button class="btn btn-sm" onclick="window.ResourceAPI.cancel('${item.id}')">إلغاء</button>` : ''}
            `;
            fragment.appendChild(el);
        });

        this.queueContainer.innerHTML = '<h4>قائمة الرفع</h4>';
        this.queueContainer.appendChild(fragment);

        // Expose API for inline buttons
        window.ResourceAPI = {
            pause: (id) => ResourceController.pauseUpload(id),
            resume: (id) => ResourceController.resumeUpload(id),
            cancel: (id) => ResourceController.cancelUpload(id)
        };
    }

    updateProgressUI(id, progress) {
        const bar = document.getElementById(`prog-${id}`);
        if (bar) bar.style.width = `${progress}%`;
    }

    async loadResources() {
        const resources = await ResourceController.getResources();
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
            el.style.justifyContent = 'space-between';
            el.style.alignItems = 'center';

            const sizeMb = (res.size / (1024 * 1024)).toFixed(2);

            el.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <i class="fas fa-file" style="font-size: 2rem; color: var(--primary-color);"></i>
                    <div>
                        <h4 style="margin: 0;">${res.fileName}</h4>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">${sizeMb} MB | ${new Date(res.createdAt?.toDate() || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="${res.downloadUrl}" target="_blank" class="btn btn-primary"><i class="fas fa-download"></i> تحميل</a>
                    ${this.engine.isInstructor ? `<button class="btn btn-dark" style="color:var(--danger);" onclick="window.ResourceAPI.delete('${res.resourceId}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            `;
            fragment.appendChild(el);
        });

        displayContainer.innerHTML = '';
        displayContainer.appendChild(fragment);

        if (this.engine.isInstructor && !window.ResourceAPI?.delete) {
            window.ResourceAPI = window.ResourceAPI || {};
            window.ResourceAPI.delete = async (id) => {
                if(confirm('هل أنت متأكد من حذف هذا الملف؟')) {
                    await ResourceController.deleteResource(id);
                    this.loadResources();
                }
            };
        }
        
        // Update count
        const countBadge = document.getElementById('resources-count');
        if (countBadge) countBadge.innerText = `${resources.length} ملفات`;
    }
}

export const ResourceManager = new ResourceManagerClass();
