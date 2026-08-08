/**
 * ProgressController.js
 * Connects the Analytics UI with the ProgressService and MetricsEngine.
 */

import { ProgressService } from './ProgressService.js';
import { MetricsEngine } from '../analytics/MetricsEngine.js';

export class ProgressControllerClass {
    constructor() {
        this.engine = null;
    }

    init(engine) {
        this.engine = engine;
    }

    async fetchStudentDashboardData(studentId) {
        const progress = await ProgressService.getStudentProgress(this.engine.courseId, studentId);
        // Calculate dynamic scores not stored explicitly in DB
        progress.calculatedScore = MetricsEngine.calculateEngagementScore(
            progress.attendanceMinutes, 
            progress.downloadedResources, 
            progress.quizScores.length
        );
        return progress;
    }

    async fetchInstructorDashboardData() {
        const analytics = await ProgressService.getCourseAnalytics(this.engine.courseId);
        // Add dynamic health metrics
        analytics.healthScore = MetricsEngine.calculateCourseHealth(
            analytics.activeStudents, 
            analytics.dropOffRate, 
            analytics.averageCompletion
        );
        return analytics;
    }

    async logUserActivity() {
        if (!this.engine.isInstructor && this.engine.currentUser) {
            // Log 1 minute of attendance every minute dynamically while active in a lesson
            if (this.engine.state && this.engine.state.presentation && this.engine.state.presentation.activeLessonId) {
                await ProgressService.trackAttendanceMinutes(this.engine.courseId, this.engine.currentUser.uid, 1);
            }
        }
    }
}
export const ProgressController = new ProgressControllerClass();
