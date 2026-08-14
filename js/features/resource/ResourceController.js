/**
 * ResourceController.js
 * Bridges UI interactions with ResourceService and UploadQueue.
 */

import { ResourceService } from './ResourceService.js';
import { UploadQueue } from '../room/UploadQueue.js';
import { PreviewEngine } from '../media/PreviewEngine.js';
import { NotificationManager } from '../global/NotificationManager.js';

export class ResourceControllerClass {
    constructor() {
        this.engine = null;
        this.activeLessonId = null;
        this.onLessonChange = null;
        this.unsubscribeFn = null;
    }

    init(engine) {
        this.engine = engine;
        UploadQueue.init(this.engine.courseId);
        
        import('../../core/EventBus.js').then(({ EventBus, Events }) => {
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

        let currentLessonTitle = '';
        const activeId = this.activeLessonId || lessonId || 'global';
        if (activeId !== 'global') {
            const { CurriculumController } = await import('../curriculum/index.js');
            const sections = CurriculumController.getSections();
            for (const section of sections) {
                const lessons = CurriculumController.getLessons(section.id);
                const lesson = lessons.find(l => l.id === activeId);
                if (lesson) {
                    currentLessonTitle = lesson.title;
                    break;
                }
            }
        }

        for (const file of files) {
            try {
                const preview = await PreviewEngine.generatePreview(file);
                
                await ResourceService.uploadFile(
                    this.engine.courseId, 
                    activeId,
                    currentLessonTitle,
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

    startSync(onUpdateCallback) {
        if (this.unsubscribeFn) {
            this.unsubscribeFn();
            this.unsubscribeFn = null;
        }
        const targetLesson = this.activeLessonId || 'global';
        
        // Subscribe to all course resources, then filter on client to avoid multiple index requirements
        this.unsubscribeFn = ResourceService.subscribeToResources(this.engine.courseId, null, (allResources) => {
            const filtered = allResources.filter(res => {
                if (!res.lessonId || res.lessonId === 'global') return true;
                return res.lessonId === targetLesson;
            });
            if (onUpdateCallback) onUpdateCallback(filtered);
        });
    }

    stopSync() {
        if (this.unsubscribeFn) {
            this.unsubscribeFn();
            this.unsubscribeFn = null;
        }
    }

    async getResources() {
        const targetLesson = this.activeLessonId || 'global';
        const allResources = await ResourceService.getResources(this.engine.courseId, null);
        
        return allResources.filter(res => {
            if (!res.lessonId || res.lessonId === 'global') return true;
            return res.lessonId === targetLesson;
        });
    }
}
export const ResourceController = new ResourceControllerClass();
