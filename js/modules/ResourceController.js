/**
 * ResourceController.js
 * Bridges UI interactions with ResourceService and UploadQueue.
 */

import { ResourceService } from './ResourceService.js';
import { UploadQueue } from './UploadQueue.js';
import { PreviewEngine } from './PreviewEngine.js';
import { NotificationManager } from './NotificationManager.js';

export class ResourceControllerClass {
    constructor() {
        this.engine = null;
        this.activeLessonId = null;
        this.onLessonChange = null;
    }

    init(engine) {
        this.engine = engine;
        UploadQueue.init(this.engine.courseId);
        
        import('./EventBus.js').then(({ EventBus, Events }) => {
            EventBus.subscribe(Events.PLAY_LECTURE, (lesson) => {
                if (lesson && lesson.id && this.activeLessonId !== lesson.id) {
                    this.activeLessonId = lesson.id;
                    if (this.onLessonChange) this.onLessonChange(lesson.id);
                }
            });
        });
    }

    async handleFilesDropped(files, lessonId = null) {
        if (!this.engine.isInstructor) {
            console.error("Only instructors can upload resources.");
            return;
        }

        for (const file of files) {
            try {
                const preview = await PreviewEngine.generatePreview(file);
                
                await ResourceService.uploadFile(
                    this.engine.courseId, 
                    this.activeLessonId || lessonId || 'global', 
                    file, 
                    (id, state, progress) => {
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
        if (!this.activeLessonId) return [];
        return await ResourceService.getResources(this.engine.courseId, this.activeLessonId);
    }
}
export const ResourceController = new ResourceControllerClass();
