/**
 * MediaManager.js
 * Handles Enterprise Media Library functionality: upload, compression, gallery, deletion.
 * Uses Firebase Storage, Firestore (for indexing), and EventDispatcher.
 */

import { eventBus } from '../../core/EventBus.js';
import { MediaRepository } from '../../repositories/MediaRepository.js';

class MediaManagerClass {
    constructor() {
        this.galleryEl = document.getElementById('media-gallery');
        this.dropzone = document.getElementById('media-dropzone');
        this.uploadInput = document.getElementById('media-upload-input');
        this.filterSelect = document.getElementById('media-filter');
        this.progressContainer = document.getElementById('media-upload-progress');
        this.progressBar = document.getElementById('upload-progress-bar');
        this.progressText = document.getElementById('upload-percentage');
        this.statusText = document.getElementById('upload-status-text');
        this.currentView = 'active'; // 'active' or 'trash'
    }

    init() {
        if (this.uploadInput) {
            this.uploadInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        }
        
        if (this.filterSelect) {
            this.filterSelect.addEventListener('change', () => this.loadGallery());
        }

        this.initDropzone();

        // Expose to window for inline onclick handlers (e.g. delete, copy URL)
        window.deleteMedia = this.deleteMedia.bind(this);
        window.copyMediaUrl = (url) => {
            navigator.clipboard.writeText(url);
            eventBus.emit('notification:show', { type: 'success', message: 'تم نسخ الرابط بنجاح!' });
        };
        window.restoreMedia = this.restoreMedia.bind(this);
        window.toggleRecycleBin = () => {
            this.currentView = this.currentView === 'active' ? 'trash' : 'active';
            eventBus.emit('notification:show', { type: 'info', message: this.currentView === 'trash' ? 'عرض سلة المحذوفات' : 'عرض المكتبة النشطة' });
            this.loadGallery();
        };
        
        // Listen to workspace events if needed
        eventBus.on('workspace:module_loaded', (route) => {
            if (route === 'medialibrary') {
                this.loadGallery();
            }
        });
    }

    initDropzone() {
        if (!this.dropzone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropzone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropzone.addEventListener(eventName, () => {
                this.dropzone.style.borderColor = 'var(--primary)';
                this.dropzone.style.background = 'rgba(0, 255, 204, 0.05)';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropzone.addEventListener(eventName, () => {
                this.dropzone.style.borderColor = 'var(--border-color)';
                this.dropzone.style.background = 'var(--bg-surface-hover)';
            }, false);
        });

        this.dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files);
        }, false);
    }

    async compressImage(file) {
        return new Promise((resolve) => {
            if (!file.type.startsWith('image/') || file.type === 'image/gif') {
                resolve(file); // Don't compress non-images or GIFs
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Max width/height
                    const MAX_DIMENSION = 1920;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compress to 80% quality WebP
                    canvas.toBlob((blob) => {
                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                            type: 'image/webp',
                            lastModified: Date.now()
                        });
                        resolve(newFile);
                    }, 'image/webp', 0.8);
                };
            };
        });
    }

    async handleFiles(files) {
        if (!files || files.length === 0) return;

        this.progressContainer.style.display = 'block';
        this.statusText.textContent = `جاري معالجة ورفع ${files.length} ملف...`;
        this.progressBar.style.width = '0%';
        this.progressText.textContent = '0%';

        let totalSize = 0;
        let uploadedSize = 0;
        const processedFiles = [];

        // 1. Compress & Calculate Sizes
        for (let i = 0; i < files.length; i++) {
            this.statusText.textContent = `جاري ضغط الملف ${i+1}/${files.length}...`;
            const compressedFile = await this.compressImage(files[i]);
            processedFiles.push(compressedFile);
            totalSize += compressedFile.size;
        }

        // 2. Upload
        for (let i = 0; i < processedFiles.length; i++) {
            const file = processedFiles[i];
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const filePath = `media/${year}/${month}/${Date.now()}_${file.name}`;
            
            const uploadTask = MediaRepository.uploadMedia(filePath, file);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const currentFileProgress = snapshot.bytesTransferred;
                    // Calculate total progress across all files roughly
                    const overallPercentage = Math.round(((uploadedSize + currentFileProgress) / totalSize) * 100);
                    this.progressBar.style.width = `${overallPercentage}%`;
                    this.progressText.textContent = `${overallPercentage}%`;
                    this.statusText.textContent = `جاري رفع الملف ${i+1} من ${processedFiles.length}...`;
                }, 
                (error) => {
                    console.error('[MediaManager] Upload error', error);
                    eventBus.emit('notification:show', { type: 'error', message: 'حدث خطأ أثناء رفع أحد الملفات.' });
                }, 
                async () => {
                    uploadedSize += file.size;
                    const url = await uploadTask.snapshot.ref.getDownloadURL();
                    
                    // Save to Firestore Library with Enterprise Metadata
                    const { AdminRepository } = await import('../../repositories/AdminRepository.js');
                    await AdminRepository.addMediaLibraryRecord({
                        name: file.name,
                        path: filePath,
                        url: url,
                        type: file.type,
                        size: file.size,
                        status: 'active', // 'active' or 'trash'
                        usageCount: 0,
                        lastUsed: null,
                        tags: []
                    });

                    // If last file
                    if (i === processedFiles.length - 1) {
                        this.statusText.textContent = 'تم الرفع بنجاح!';
                        this.progressBar.style.width = '100%';
                        this.progressText.textContent = '100%';
                        setTimeout(() => { this.progressContainer.style.display = 'none'; }, 3000);
                        this.loadGallery();
                    }
                }
            );
        }
        
        if (this.uploadInput) this.uploadInput.value = '';
    }

    async loadGallery() {
        if (!this.galleryEl) return;
        this.galleryEl.innerHTML = `
            <div class="skeleton" style="height: 150px; border-radius: 8px;"></div>
            <div class="skeleton" style="height: 150px; border-radius: 8px;"></div>
            <div class="skeleton" style="height: 150px; border-radius: 8px;"></div>
        `;

        try {
            const filter = this.filterSelect ? this.filterSelect.value : 'all';
            // Simple filtering on client since we lack composite indexes, or just filter in memory for now
            const libraryDocs = await MediaRepository.getMediaLibrary(this.currentView, 50);
            
            if (libraryDocs.length === 0) {
                this.galleryEl.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">المكتبة فارغة.</p>';
                return;
            }

            let html = '';
            libraryDocs.forEach(data => {
                const type = data.type || '';
                
                if (filter === 'images' && !type.startsWith('image/')) return;
                if (filter === 'documents' && !type.includes('pdf')) return;

                const isImage = type.startsWith('image/');
                const isTrash = this.currentView === 'trash';
                
                html += `
                    <div style="border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 8px; text-align: center; background: var(--bg-surface); position: relative; overflow: hidden; transition: transform 0.2s; opacity: ${isTrash ? '0.7' : '1'};">
                        ${isImage ? `<img src="${data.url}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem; filter: ${isTrash ? 'grayscale(100%)' : 'none'};" loading="lazy">` 
                                  : `<div style="height: 120px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-file-pdf fa-3x" style="color: #ff4757;"></i></div>`}
                        
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                            <span>${data.usageCount || 0} استخدام</span>
                            <span>${Math.round((data.size || 0)/1024)} KB</span>
                        </div>

                        <div style="display: flex; gap: 0.5rem; justify-content: center; position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); padding: 0.5rem; transform: translateY(100%); transition: transform 0.2s;" class="media-actions">
                            ${isTrash ? `
                                <button onclick="restoreMedia('${data.id}')" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; color: #00d2d3;" title="استعادة"><i class="fas fa-undo"></i></button>
                                <button onclick="deleteMedia('${data.id}', '${data.path}')" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; color: #ff4757;" title="حذف نهائي"><i class="fas fa-trash-alt"></i></button>
                            ` : `
                                <button onclick="copyMediaUrl('${data.url}')" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" title="نسخ الرابط"><i class="fas fa-link"></i></button>
                                <button onclick="deleteMedia('${data.id}', '${data.path}')" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; color: #ff4757;" title="نقل للمهملات"><i class="fas fa-trash"></i></button>
                            `}
                        </div>
                    </div>
                `;
            });

            this.galleryEl.innerHTML = html || '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">لا توجد ملفات تطابق الفلتر.</p>';

            // Hover effect to show actions
            this.galleryEl.querySelectorAll('div').forEach(card => {
                const actions = card.querySelector('.media-actions');
                if (actions) {
                    card.addEventListener('mouseenter', () => actions.style.transform = 'translateY(0)');
                    card.addEventListener('mouseleave', () => actions.style.transform = 'translateY(100%)');
                }
            });

        } catch (error) {
            console.error('[MediaManager] Gallery load error', error);
            this.galleryEl.innerHTML = '<p style="color: var(--error);">خطأ في تحميل المكتبة</p>';
        }
    }

    async deleteMedia(docId, path) {
        if (this.currentView === 'active') {
            // Check usage count before soft delete
            const doc = await MediaRepository.getMediaDoc(docId);
            if (doc && doc.usageCount > 0) {
                if(!confirm(`هذا الملف مُستخدم في ${doc.usageCount} مكان! نقل إلى المهملات؟`)) return;
            } else {
                if(!confirm('نقل هذا الملف إلى سلة المحذوفات؟')) return;
            }

            // Soft delete — set deletedAt flag, mediaController trigger ignores this
            await MediaRepository.setMediaDeletedStatus(docId, true);
            eventBus.emit('notification:show', { type: 'success', message: 'تم النقل للمهملات' });
            this.loadGallery();
        } else {
            // Hard delete
            if (!confirm('هل أنت متأكد من الحذف النهائي؟ (لا يمكن التراجع)')) return;
            try {
                // Hard delete — deleting the Firestore doc triggers mediaController
                // onMediaLibraryDeleted which calls mediaWorkflow.handleMediaDeletion
                await MediaRepository.hardDeleteMedia(docId);
                
                eventBus.emit('notification:show', { type: 'success', message: 'تم الحذف النهائي' });
                this.loadGallery();
            } catch (error) {
                console.error('[MediaManager] Delete error', error);
                eventBus.emit('notification:show', { type: 'error', message: 'حدث خطأ أثناء الحذف' });
            }
        }
    }

    async restoreMedia(docId) {
        try {
            await MediaRepository.setMediaDeletedStatus(docId, false);
            eventBus.emit('notification:show', { type: 'success', message: 'تم استعادة الملف' });
            this.loadGallery();
        } catch(error) {
            console.error('[MediaManager] Restore error', error);
            eventBus.emit('notification:show', { type: 'error', message: 'فشل في استعادة الملف' });
        }
    }
}

export const MediaManager = new MediaManagerClass();
