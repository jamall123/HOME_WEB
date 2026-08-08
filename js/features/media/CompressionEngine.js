/**
 * CompressionEngine.js
 * Client-side image compression using Canvas API.
 * Video is bypassed as requested.
 */

export class CompressionEngineClass {
    /**
     * Compresses an image file and returns a smaller File object.
     * Preserves original type (if jpeg/webp) or forces webp/jpeg to save space.
     */
    async compress(file, quality = 0.7, maxWidth = 1920) {
        if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
            return file; // Bypass non-images or formats that shouldn't be canvas-compressed
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Calculate dimensions
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Export as JPEG (or WEBP if supported)
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(file); // fallback
                            return;
                        }
                        const compressedFile = new File([blob], file.name, {
                            type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}
export const CompressionEngine = new CompressionEngineClass();
