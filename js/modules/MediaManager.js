/**
 * MediaManager.js
 * Handles Enterprise Media Library functionality: upload, gallery, deletion.
 * Uses Firebase Storage and EventDispatcher.
 */

import { EventDispatcher } from './EventDispatcher.js';

class MediaManagerClass {
    constructor() {
        this.storage = firebase.storage();
        this.galleryEl = document.getElementById('media-gallery');
        this.progressEl = document.getElementById('media-upload-progress');
        this.uploadInput = document.getElementById('media-upload-input');
        this.filterSelect = document.getElementById('media-filter');
    }

    init() {
        if (!this.uploadInput) return;

        this.uploadInput.addEventListener('change', (e) => this.handleUpload(e));
        
        if (this.filterSelect) {
            this.filterSelect.addEventListener('change', () => this.loadGallery());
        }

        // Expose to window for inline onclick handlers (e.g. delete, copy URL)
        window.deleteMedia = (path) => this.deleteMedia(path);
        window.copyMediaUrl = (url) => {
            navigator.clipboard.writeText(url);
            alert('تم نسخ الرابط بنجاح!');
        };
        
        // Initial load
        this.loadGallery();
    }

    async handleUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        this.progressEl.textContent = `جاري رفع ${files.length} ملف...`;

        try {
            for (const file of files) {
                // Compress if image (placeholder for Canvas API compression)
                const processedFile = file; // In Phase 7: image compression logic goes here
                
                // Organize in folders by year/month
                const date = new Date();
                const folder = `media/${date.getFullYear()}/${date.getMonth() + 1}`;
                const filePath = `${folder}/${Date.now()}_${file.name}`;
                
                const ref = this.storage.ref(filePath);
                await ref.put(processedFile);
            }
            this.progressEl.textContent = 'تم الرفع بنجاح!';
            setTimeout(() => { this.progressEl.textContent = ''; }, 3000);
            
            // Reload gallery
            this.loadGallery();
            
            // Emit global event
            EventDispatcher.emit('MEDIA_UPLOADED');
            
        } catch (error) {
            console.error('[MediaManager] Upload error', error);
            this.progressEl.textContent = 'خطأ في الرفع: ' + error.message;
        }
        
        // Reset input
        this.uploadInput.value = '';
    }

    async loadGallery() {
        if (!this.galleryEl) return;
        this.galleryEl.innerHTML = '<p>جاري تحميل المكتبة...</p>';

        try {
            // In a real enterprise system, we'd query a Firestore collection `media_library`
            // For now, we simulate fetching from Storage by listing the 'media' root directory.
            // Note: Firebase Storage listAll does not easily list deep nested folders recursively on client side without a Cloud Function.
            // As a simplified fallback for Phase 5-7, we list items in a flat 'media' folder, 
            // or we expect a Firestore index. Let's assume we list from a single flat folder for the demo.
            
            const listRef = this.storage.ref('media');
            let res;
            try {
                res = await listRef.listAll();
            } catch(err) {
                // Folder might not exist yet
                res = { items: [] };
            }

            if (res.items.length === 0) {
                this.galleryEl.innerHTML = '<p>المكتبة فارغة.</p>';
                return;
            }

            let html = '';
            for (const itemRef of res.items) {
                const url = await itemRef.getDownloadURL();
                // Simple metadata fetch
                const meta = await itemRef.getMetadata();
                const type = meta.contentType;
                
                // Filter logic
                const filter = this.filterSelect ? this.filterSelect.value : 'all';
                if (filter === 'images' && !type.startsWith('image/')) continue;
                if (filter === 'documents' && !type.includes('pdf')) continue;

                const isImage = type.startsWith('image/');
                
                html += `
                    <div style="border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 8px; text-align: center; background: rgba(0,0,0,0.2);">
                        ${isImage ? `<img src="${url}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;">` 
                                  : `<i class="fas fa-file-pdf fa-3x" style="color: #ff4757; margin: 1rem 0;"></i>`}
                        <div style="display: flex; gap: 0.5rem; justify-content: center;">
                            <button onclick="copyMediaUrl('${url}')" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" title="نسخ الرابط"><i class="fas fa-link"></i></button>
                            <button onclick="deleteMedia('${itemRef.fullPath}')" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; color: #ff4757;" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            }
            this.galleryEl.innerHTML = html;

        } catch (error) {
            console.error('[MediaManager] Gallery load error', error);
            this.galleryEl.innerHTML = '<p style="color: red;">خطأ في تحميل المكتبة</p>';
        }
    }

    async deleteMedia(path) {
        if (!confirm('هل أنت متأكد من حذف هذا الملف نهائياً؟')) return;
        try {
            await this.storage.ref(path).delete();
            this.loadGallery();
        } catch (error) {
            console.error('[MediaManager] Delete error', error);
            alert('حدث خطأ أثناء الحذف');
        }
    }
}

export const MediaManager = new MediaManagerClass();
