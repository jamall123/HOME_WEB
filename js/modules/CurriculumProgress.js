import { CurriculumController } from './CurriculumController.js';

/**
 * CurriculumProgress.js
 * Tracks student progress, stores incrementally to Firestore, and syncs locally for offline capability.
 */

class CurriculumProgressClass {
    constructor() {
        this.courseId = null;
        this.userId = null;
        this.progressCache = {
            completedLessons: [],
            currentLesson: null,
            lastVisited: null
        };
    }

    async init(courseId, userId) {
        this.courseId = courseId;
        this.userId = userId;
        await this.loadProgress();
    }

    async loadProgress() {
        try {
            // 1. Try local cache first for instant resume
            const local = localStorage.getItem(`progress_${this.userId}_${this.courseId}`);
            if (local) {
                this.progressCache = JSON.parse(local);
                this.resumeState();
            }

            // 2. Sync from Firestore in background
            const docRef = firebase.firestore().collection('studentProgress')
                .doc(`${this.userId}_${this.courseId}`);
                
            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                this.progressCache = {
                    ...this.progressCache,
                    ...data
                };
                this.saveLocal();
                this.resumeState();
            }
        } catch (error) {
            console.error("[CurriculumProgress] Failed to load progress", error);
        }
    }

    saveLocal() {
        localStorage.setItem(`progress_${this.userId}_${this.courseId}`, JSON.stringify(this.progressCache));
    }

    resumeState() {
        if (this.progressCache.currentLesson) {
            CurriculumController.selectLesson(this.progressCache.currentLesson, true); // true = autoResume flag
        }
    }

    async markLessonComplete(lessonId) {
        if (this.progressCache.completedLessons.includes(lessonId)) return;

        this.progressCache.completedLessons.push(lessonId);
        this.saveLocal();

        try {
            await firebase.firestore().collection('studentProgress')
                .doc(`${this.userId}_${this.courseId}`).set({
                    completedLessons: firebase.firestore.FieldValue.arrayUnion(lessonId),
                    lastVisited: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
        } catch (error) {
            // console.warn("[CurriculumProgress] Offline sync queued for markLessonComplete", error);
        }
    }

    async updateCurrentLesson(lessonId) {
        this.progressCache.currentLesson = lessonId;
        this.saveLocal();

        try {
            await firebase.firestore().collection('studentProgress')
                .doc(`${this.userId}_${this.courseId}`).set({
                    currentLesson: lessonId,
                    lastVisited: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
        } catch (error) {
            // console.warn("[CurriculumProgress] Offline sync queued for updateCurrentLesson");
        }
    }
}

export const CurriculumProgress = new CurriculumProgressClass();
