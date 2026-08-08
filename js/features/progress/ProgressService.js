/**
 * ProgressService.js
 * Handles reading and writing Progress tracking statistics via AnalyticsCache & OfflineSyncEngine.
 */

import { AnalyticsCache } from '../analytics/AnalyticsCache.js';
import { OfflineSyncEngine } from '../offline/OfflineSyncEngine.js';
import { StudentProgressRepository } from '../../repositories/StudentProgressRepository.js';

export class ProgressServiceClass {
    async getStudentProgress(courseId, studentId) {
        // First try to fetch aggregated analytics rather than calculating manually
        const docId = `${courseId}_${studentId}`;
        const data = await AnalyticsCache.get('studentProgress', docId);
        return data || this.generateDefaultProgress();
    }

    async getCourseAnalytics(courseId) {
        const data = await AnalyticsCache.get('courseAnalytics', courseId);
        return data || this.generateDefaultCourseAnalytics();
    }

    async trackLessonCompletion(courseId, lessonId, studentId) {
        const docId = `${courseId}_${studentId}`;
        const data = StudentProgressRepository.buildLessonCompletionPayload(lessonId);
        await OfflineSyncEngine.queueOperation('studentProgress', docId, 'set', data);
        
        // Invalidate memory cache so next read fetches fresh data
        AnalyticsCache.clear();
    }

    async trackAttendanceMinutes(courseId, studentId, minutes) {
        const docId = `${courseId}_${studentId}`;
        const data = StudentProgressRepository.buildAttendancePayload(minutes);
        await OfflineSyncEngine.queueOperation('studentProgress', docId, 'set', data);
    }

    generateDefaultProgress() {
        return {
            completionPercentage: 0,
            completedLessons: [],
            downloadedResources: 0,
            attendanceMinutes: 0,
            quizScores: [],
            streak: 0,
            lastActivity: null
        };
    }

    generateDefaultCourseAnalytics() {
        return {
            activeStudents: 0,
            averageCompletion: 0,
            dropOffRate: 0,
            totalWatchTime: 0
        };
    }
}
export const ProgressService = new ProgressServiceClass();
