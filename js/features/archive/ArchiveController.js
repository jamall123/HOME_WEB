/**
 * ArchiveController.js
 * Coordinates SessionExporter and ArchiveService.
 */

import { SessionExporter } from '../room/SessionExporter.js';
import { ArchiveService } from './ArchiveService.js';
import { NotificationManager } from '../global/NotificationManager.js';
import { RoomRepository } from '../../repositories/RoomRepository.js';

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
            NotificationManager.show("جاري تجميع وإنهاء الجلسة...", "info");

            // 1. Export Data
            const archiveData = await SessionExporter.exportSession(this.engine.courseId);

            // 2. Save Archive
            const sessionId = await ArchiveService.saveArchive(archiveData);

            // 3. Clear Active Session State (Shutdown Room)
            await RoomRepository.deleteSession(this.engine.courseId);

            NotificationManager.show("تم أرشفة الجلسة بنجاح", "success");
            
            // Redirect or update UI
            setTimeout(() => {
                window.location.href = `admin-dashboard.html`; // Or wherever the instructor goes next
            }, 2000);

        } catch (error) {
            console.error("Archive Failed", error);
            NotificationManager.show("حدث خطأ أثناء إنهاء الجلسة", "error");
        }
    }

    async loadArchive(sessionId) {
        try {
            return await ArchiveService.getArchive(sessionId);
        } catch (error) {
            console.error("Failed to load archive", error);
            return null;
        }
    }
}
export const ArchiveController = new ArchiveControllerClass();
