/**
 * PreviewEngine.js
 * Generates thumbnails/previews for UI display based on file type.
 */

export class PreviewEngineClass {
    /**
     * Returns a base64 DataURL or a FontAwesome icon class
     * depending on the file type.
     */
    async generatePreview(file) {
        if (file.type.startsWith('image/')) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ type: 'image', src: e.target.result });
                reader.readAsDataURL(file);
            });
        }
        
        if (file.type.startsWith('video/')) {
            return { type: 'icon', class: 'fas fa-file-video', color: '#e74c3c' };
        }

        if (file.type === 'application/pdf') {
            return { type: 'icon', class: 'fas fa-file-pdf', color: '#e74c3c' };
        }

        if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
            return { type: 'icon', class: 'fas fa-file-word', color: '#3498db' };
        }

        if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
            return { type: 'icon', class: 'fas fa-file-excel', color: '#2ecc71' };
        }

        if (file.type.includes('powerpoint') || file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
            return { type: 'icon', class: 'fas fa-file-powerpoint', color: '#e67e22' };
        }

        if (file.type.includes('zip') || file.type.includes('rar')) {
            return { type: 'icon', class: 'fas fa-file-archive', color: '#f1c40f' };
        }

        if (file.type.startsWith('audio/')) {
            return { type: 'icon', class: 'fas fa-file-audio', color: '#9b59b6' };
        }

        return { type: 'icon', class: 'fas fa-file', color: '#95a5a6' };
    }
}
export const PreviewEngine = new PreviewEngineClass();
