/**
 * StorageValidator.js
 * Client-side validation of file sizes and mimetypes before uploading.
 */

export class StorageValidatorClass {
    constructor() {
        // Allowed Types mapping
        this.allowedMimes = new Set([
            'application/pdf',
            'application/msword', // DOC
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            'application/vnd.ms-powerpoint', // PPT
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
            'application/vnd.ms-excel', // XLS
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
            'application/zip',
            'application/x-rar-compressed',
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/gif',
            'image/svg+xml',
            'video/mp4',
            'video/webm',
            'audio/mpeg', // MP3
            'audio/wav',
            'audio/ogg',
            'text/plain',
            'text/csv'
        ]);

        // Max Size in Bytes (e.g. 100MB)
        this.maxSize = 100 * 1024 * 1024;
    }

    validate(file) {
        if (!file) return { valid: false, reason: "No file provided" };
        
        // 1. Mime Type validation
        if (!this.allowedMimes.has(file.type)) {
            // Check extension as fallback for rare edge cases (some OS don't map types right)
            const ext = file.name.split('.').pop().toLowerCase();
            const allowedExts = ['pdf','doc','docx','ppt','pptx','xls','xlsx','zip','rar','png','jpg','jpeg','webp','gif','svg','mp4','webm','mp3','wav','ogg','txt','csv'];
            if (!allowedExts.includes(ext)) {
                return { valid: false, reason: `نوع الملف غير مدعوم: ${file.type || ext}` };
            }
        }

        // 2. Size validation
        if (file.size > this.maxSize) {
            return { valid: false, reason: `حجم الملف يتجاوز الحد المسموح (100MB)` };
        }

        return { valid: true };
    }
}
export const StorageValidator = new StorageValidatorClass();
