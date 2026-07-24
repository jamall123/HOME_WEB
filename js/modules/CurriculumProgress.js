import { CurriculumController } from './CurriculumController.js';

/**
 * CurriculumProgress.js
 * Advanced Enterprise Progress Tracker.
 * Handles detailed timestamps, time spent, offline-first sync, and completion calculations.
 */

class CurriculumProgressClass {
    constructor() {
        this.courseId = null;
        this.userId = null;
        this.unlockSystem = 'section_based'; // 'free', 'sequential', 'section_based'
        
        this.progressCache = {
            completedLessons: [],     // Array of lesson IDs marked 100% complete
            videoTimestamps: {},      // { lessonId: currentSeconds }
            timeSpentMs: 0,           // Total time spent in the course
            currentLesson: null,      // Last active lesson
            lastVisited: null,        // Timestamp
            loginCount: 0             // Incremented per session
        };

        this.syncTimer = null;
        this.sessionStartTime = Date.now();
        this.isOffline = !navigator.onLine;

        window.addEventListener('online', () => this.syncNow());
        window.addEventListener('offline', () => { this.isOffline = true; });
        
        // Save time spent on window close
        window.addEventListener('beforeunload', () => {
            this.updateTimeSpent();
            this.saveLocal();
        });
    }

    async init(courseId, userId) {
        this.courseId = courseId;
        this.userId = userId;
        this.sessionStartTime = Date.now();
        
        await this.fetchCourseSettings();
        await this.loadProgress();

        // Start periodic sync (every 30 seconds)
        this.syncTimer = setInterval(() => this.backgroundSync(), 30000);
    }

    async fetchCourseSettings() {
        try {
            const doc = await firebase.firestore().collection('courses').doc(this.courseId).get();
            if (doc.exists && doc.data().unlockSystem) {
                this.unlockSystem = doc.data().unlockSystem;
            }
        } catch(e) {
            console.error("Failed to fetch course settings", e);
        }
    }

    async loadProgress() {
        try {
            // 1. Try local cache first for instant resume (Offline First)
            const local = localStorage.getItem(`progress_${this.userId}_${this.courseId}`);
            if (local) {
                this.progressCache = { ...this.progressCache, ...JSON.parse(local) };
                this.progressCache.loginCount = (this.progressCache.loginCount || 0) + 1;
                this.resumeState();
            }

            // 2. Sync from Firestore in background
            if (!this.isOffline) {
                const docRef = firebase.firestore().collection('studentProgress')
                    .doc(`${this.userId}_${this.courseId}`);
                    
                const doc = await docRef.get();
                if (doc.exists) {
                    const data = doc.data();
                    
                    // Merge preferring local videoTimestamps if they are newer (simplified logic)
                    this.progressCache = {
                        ...this.progressCache,
                        completedLessons: [...new Set([...this.progressCache.completedLessons, ...(data.completedLessons || [])])],
                        videoTimestamps: { ...data.videoTimestamps, ...this.progressCache.videoTimestamps },
                        timeSpentMs: Math.max(this.progressCache.timeSpentMs, data.timeSpentMs || 0),
                        loginCount: Math.max(this.progressCache.loginCount, data.loginCount || 0) + 1,
                        currentLesson: this.progressCache.currentLesson || data.currentLesson
                    };
                    this.saveLocal();
                    this.resumeState();
                }
            }
        } catch (error) {
            console.error("[CurriculumProgress] Failed to load progress", error);
        }
    }

    saveLocal() {
        localStorage.setItem(`progress_${this.userId}_${this.courseId}`, JSON.stringify(this.progressCache));
    }

    updateTimeSpent() {
        const now = Date.now();
        const delta = now - this.sessionStartTime;
        this.progressCache.timeSpentMs += delta;
        this.sessionStartTime = now; // reset for next delta
    }

    backgroundSync() {
        this.updateTimeSpent();
        this.saveLocal();
        if (!this.isOffline) {
            this.syncNow();
        }
    }

    async syncNow() {
        this.isOffline = false;
        try {
            const payload = {
                ...this.progressCache,
                lastVisited: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await firebase.firestore().collection('studentProgress')
                .doc(`${this.userId}_${this.courseId}`).set(payload, { merge: true });
        } catch (error) {
            console.warn("[CurriculumProgress] Sync failed, will retry next interval");
        }
    }

    resumeState() {
        if (this.progressCache.currentLesson) {
            CurriculumController.selectLesson(this.progressCache.currentLesson, true); // autoResume
        }
    }

    // --- Core Tracking Methods ---

    async markLessonComplete(lessonId) {
        if (this.progressCache.completedLessons.includes(lessonId)) return;

        this.progressCache.completedLessons.push(lessonId);
        this.saveLocal();
        this.backgroundSync();

        // Check if course is 100% complete to trigger Certificate Generation
        const totalProgress = CurriculumController.calculateTotalProgress(this.progressCache.completedLessons);
        if (totalProgress === 100) {
            this.handleCourseCompletion();
        }
    }

    updateVideoTimestamp(lessonId, seconds) {
        this.progressCache.videoTimestamps[lessonId] = seconds;
        this.saveLocal();
        // Don't fire network request on every second, backgroundSync handles it.
    }

    getVideoTimestamp(lessonId) {
        return this.progressCache.videoTimestamps[lessonId] || 0;
    }

    async updateCurrentLesson(lessonId) {
        this.progressCache.currentLesson = lessonId;
        this.saveLocal();
        this.backgroundSync();
    }

    // --- Lock System Evaluation ---

    /**
     * Determines if a lesson should be locked based on the course unlockSystem and user progress.
     */
    isLessonLocked(lessonId, sectionId, sections, lessonsMap) {
        if (this.unlockSystem === 'free') return false;

        const currentSection = sections.find(s => s.id === sectionId);
        if (!currentSection) return false;

        if (this.unlockSystem === 'sequential') {
            // Find all lessons in order
            let allLessons = [];
            sections.forEach(s => {
                allLessons = allLessons.concat(lessonsMap[s.id] || []);
            });

            const index = allLessons.findIndex(l => l.id === lessonId);
            if (index === 0) return false; // First lesson always unlocked
            
            // Locked if the immediately preceding lesson is NOT complete
            const prevLesson = allLessons[index - 1];
            return !this.progressCache.completedLessons.includes(prevLesson.id);
        }

        if (this.unlockSystem === 'section_based') {
            const index = sections.findIndex(s => s.id === sectionId);
            if (index === 0) return false; // First section always unlocked
            
            // Check if all lessons in the PREVIOUS section are completed
            const prevSection = sections[index - 1];
            const prevLessons = lessonsMap[prevSection.id] || [];
            
            if (prevLessons.length === 0) return false; // Empty section doesn't lock

            const allPrevCompleted = prevLessons.every(l => this.progressCache.completedLessons.includes(l.id));
            return !allPrevCompleted; // Locked if not all completed
        }

        return false;
    }

    // --- Certificates ---

    async handleCourseCompletion() {
        if (this.progressCache.certificateGenerated) return;
        
        try {
            const { CertificateGenerator } = await import('./CertificateGenerator.js');
            await CertificateGenerator.generateAndStore(this.courseId, this.userId);
            
            this.progressCache.certificateGenerated = true;
            this.saveLocal();
            this.syncNow();
            
            if (typeof window.showToast === 'function') {
                window.showToast('مبروك! لقد أتممت الدورة. يمكنك الآن استخراج شهادتك.', 'success');
            }
        } catch (e) {
            console.error("Failed to generate certificate", e);
        }
    }
}

export const CurriculumProgress = new CurriculumProgressClass();
