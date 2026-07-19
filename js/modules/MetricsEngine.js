/**
 * MetricsEngine.js
 * Calculates advanced educational metrics without putting load on UI logic.
 */

export class MetricsEngineClass {
    calculateCompletionRate(completedLessons, totalLessons) {
        if (!totalLessons || totalLessons === 0) return 0;
        return Math.round((completedLessons.length / totalLessons) * 100);
    }

    calculateEngagementScore(attendanceMinutes, downloadedResources, interactions) {
        // Example algorithmic weighting:
        // 1 min attendance = 1 point
        // 1 download = 5 points
        // 1 interaction (chat/poll) = 2 points
        const score = (attendanceMinutes * 1) + (downloadedResources * 5) + (interactions * 2);
        return Math.min(100, score); // Normalize out of 100 max theoretical peak for the period
    }

    calculateCourseHealth(activeStudents, dropOffs, averageScore) {
        if (activeStudents === 0 && dropOffs === 0) return 100;
        const retentionRate = activeStudents / (activeStudents + dropOffs);
        const health = (retentionRate * 0.7) + ((averageScore / 100) * 0.3);
        return Math.round(health * 100);
    }
}
export const MetricsEngine = new MetricsEngineClass();
