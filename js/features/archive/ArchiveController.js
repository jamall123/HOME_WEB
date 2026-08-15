/**
 * ArchiveController.js
 * Coordinates SessionExporter and ArchiveService.
 */

import { SessionExporter } from '../room/SessionExporter.js';
import { ArchiveService } from './ArchiveService.js';
import { NotificationManager } from '../global/NotificationManager.js';
import { RoomRepository } from '../../repositories/RoomRepository.js';

import { CurriculumController } from '../curriculum/index.js';
import { eventBus, Events } from '../../core/EventBus.js';
import { CurriculumRepository } from '../../repositories/CurriculumRepository.js';
import { ChatRepository } from '../../repositories/ChatRepository.js';
import { ResourceService } from '../resource/ResourceService.js';

export class ArchiveControllerClass {
    constructor() {
        this.engine = null;
    }

    init(engine) {
        this.engine = engine;
    }

    async endSessionAndArchive() {
        if (!this.engine.isInstructor) return;

        try {
            NotificationManager.show("جاري إنهاء الدرس الحالي...", "info");

            const currentLessonId = CurriculumController.cache?.currentLessonId;

            if (currentLessonId) {
                await CurriculumRepository.updateLessonStatus(currentLessonId, 'Completed');
                // We're keeping the data in Firestore (messages, resources) linked to lessonId
            }

            // 1. Export Data (Optional: if we still want to package it for an offline archive)
            // const archiveData = await SessionExporter.exportSession(this.engine.courseId);
            // const sessionId = await ArchiveService.saveArchive(archiveData);

            // 2. Shut down the LIVE room broadcast
            await RoomRepository.deleteSession(this.engine.courseId);

            NotificationManager.show("تم إنهاء الدرس بنجاح", "success");
            
            // 3. Reset the UI locally without redirecting
            eventBus.emit(Events.LESSON_ENDED, { lessonId: currentLessonId });
            
            // Reset active lesson locally
            CurriculumController.cache.currentLessonId = null;

        } catch (error) {
            console.error("End Lesson Failed", error);
            NotificationManager.show("حدث خطأ أثناء إنهاء الدرس", "error");
        }
    }

    async loadArchive(lessonId) {
        try {
            // Note: chat channel is typically 'public' or whatever is default
            let messages = [];
            if (lessonId) {
                messages = await ChatRepository.getMessages(lessonId, 'public', 100);
            } else if (this.engine?.courseId) {
                messages = await ChatRepository.getCourseMessages(this.engine.courseId);
                messages = messages.filter(m => !m.lessonId || m.lessonId === 'global').slice(0, 100);
            }
            
            // Fetch resources
            let resources = [];
            if (this.engine?.courseId) {
                const allResources = await ResourceService.getResources(this.engine.courseId, null);
                // Filter by lessonId
                resources = allResources.filter(res => {
                    if (!res.lessonId || res.lessonId === 'global') return true;
                    return res.lessonId === lessonId;
                });
            }

            return { messages, resources };
        } catch (error) {
            console.error("Failed to load archive data", error);
            return null;
        }
    }
}
export const ArchiveController = new ArchiveControllerClass();
