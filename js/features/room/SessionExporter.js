/**
 * SessionExporter.js
 * Aggregates all data for an active session to prepare it for archiving.
 */

import { PresenceRepository } from '../../repositories/PresenceRepository.js';
import { ChatRepository } from '../../repositories/ChatRepository.js';
import { MediaRepository } from '../../repositories/MediaRepository.js';
import { RoomRepository } from '../../repositories/RoomRepository.js';

export class SessionExporterClass {
    async exportSession(courseId) {
        // 1. Get Chat Messages
        const chatMessages = await ChatRepository.getCourseMessages(courseId);

        // 2. Get Resources
        const resources = await MediaRepository.getActiveCourseResources(courseId);

        // 3. Get Active Session Metadata
        const sessionData = await RoomRepository.getActiveSession(courseId) || {};

        // 4. Get Connected Users / Attendance Stats
        const attendanceList = await PresenceRepository.getConnectedUsers(courseId) || [];
        const totalMinutes = attendanceList.reduce((acc, user) => acc + (user.sessionDurationMinutes || 0), 0);

        return {
            courseId: courseId,
            startedAt: sessionData.createdAt || null,
            // endedAt is attached by ArchiveRepository during save
            teachingMode: sessionData.mode || 'video',
            attendanceCount: attendanceList.length,
            attendanceMinutes: totalMinutes,
            resources: resources,
            chatMessages: chatMessages,
            statistics: {
                totalMessages: chatMessages.length,
                totalResources: resources.length
            }
        };
    }
}
export const SessionExporter = new SessionExporterClass();
