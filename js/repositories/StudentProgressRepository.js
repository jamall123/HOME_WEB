/**
 * @file StudentProgressRepository.js
 * @purpose Enterprise Data Layer for Student Progress and Analytics.
 * @responsibilities
 *  - Perform raw Firestore operations on student progress.
 *  - Provide offline-compatible writes via OfflineSyncEngine if necessary, or just standard Firebase Manager.
 * @collectionsUsed 'studentProgress', 'courseAnalytics'
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class StudentProgressRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `StudentProgressRepository.${method}`);
        throw enhancedError;
    }

    async getStudentProgress(docId) {
        try {
            const snap = await FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.STUDENT_PROGRESS).doc(docId).get();
            return snap.exists ? snap.data() : null;
        } catch (error) {
            this._handleError(error, 'getStudentProgress');
        }
    }

    async getCourseAnalytics(courseId) {
        try {
            const snap = await FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.COURSE_ANALYTICS).doc(courseId).get();
            return snap.exists ? snap.data() : null;
        } catch (error) {
            this._handleError(error, 'getCourseAnalytics');
        }
    }

    async incrementAttendance(userId, courseId, minutes) {
        try {
            await FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.STUDENT_PROGRESS).doc(`${userId}_${courseId}`).set({
                totalAttendanceMinutes: FirebaseManager.getFirestoreFieldValue().increment(minutes),
                lastVisited: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            }, { merge: true });
        } catch (error) {
            this._handleError(error, 'incrementAttendance');
        }
    }

    /**
     * Returns a Firestore-ready payload for lesson completion.
     * Encapsulates FieldValue construction so feature layer stays clean.
     * @param {string} lessonId
     */
    buildLessonCompletionPayload(lessonId) {
        return {
            completedLessons: FirebaseManager.getFirestoreFieldValue().arrayUnion(lessonId),
            lastActivity: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
        };
    }

    /**
     * Returns a Firestore-ready payload for attendance tracking.
     * @param {number} minutes
     */
    buildAttendancePayload(minutes) {
        return {
            attendanceMinutes: FirebaseManager.getFirestoreFieldValue().increment(minutes),
            lastActivity: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
        };
    }

    async getStudentProgress(userId, courseId) {
        try {
            const snap = await FirebaseManager.getFirestore()
                .collection(Constants.COLLECTIONS.STUDENT_PROGRESS)
                .doc(`${userId}_${courseId}`)
                .get();
            return snap.exists ? snap.data() : null;
        } catch (error) {
            this._handleError(error, 'getStudentProgress');
        }
    }

    async syncProgress(userId, courseId, payload) {
        try {
            payload.lastVisited = FirebaseManager.getFirestoreFieldValue().serverTimestamp();
            await FirebaseManager.getFirestore()
                .collection(Constants.COLLECTIONS.STUDENT_PROGRESS)
                .doc(`${userId}_${courseId}`)
                .set(payload, { merge: true });
        } catch (error) {
            this._handleError(error, 'syncProgress');
        }
    }
}

export const StudentProgressRepository = new StudentProgressRepositoryClass();
