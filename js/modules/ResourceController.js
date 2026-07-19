/**
 * ResourceController.js
 * Bridges UI interactions with ResourceService and UploadQueue.
 */

import { ResourceService } from './ResourceService.js';
import { UploadQueue } from './UploadQueue.js';
import { PreviewEngine } from './PreviewEngine.js';

export class ResourceControllerClass {
    constructor() {
        this.engine = null;
    }

    init(engine) {
        this.engine = engine;
        UploadQueue.init(this.engine.courseId);
    }

    async handleFilesDropped(files, lessonId = null) {
        if (!this.engine.isInstructor) {
            console.error("Only instructors can upload resources.");
            return;
        }

        for (const file of files) {
            try {
                // Determine preview early if possible
                const preview = await PreviewEngine.generatePreview(file);
                
                await ResourceService.uploadFile(
                    this.engine.courseId, 
                    lessonId || this.engine.state.presentation?.lessonId || 'global', 
                    file, 
                    (id, state, progress) => {
                        // Render progress updates to the active queue UI
                        if (this.onProgressUpdate) this.onProgressUpdate(id, state, progress, preview);
                    }
                );
            } catch (err) {
                console.error("Failed to queue file", file.name, err);
                NotificationManager.show(`فشل رفع ${file.name}: ${err.message}`, 'error');
            }
        }
    }

    pauseUpload(id) { ResourceService.pauseUpload(id); }
    resumeUpload(id) { ResourceService.resumeUpload(id); }
    cancelUpload(id) { ResourceService.cancelUpload(id); }
    
    async deleteResource(id) {
        if (!this.engine.isInstructor) return;
        await ResourceService.deleteResource(id);
    }

    async getResources() {
        return await ResourceService.getResources(this.engine.courseId);
    }
}
export const ResourceController = new ResourceControllerClass();
