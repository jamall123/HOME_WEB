import { CurriculumRepository } from '../../repositories/CurriculumRepository.js';
import { StudentProgressRepository } from '../../repositories/StudentProgressRepository.js';

class CurriculumProgressClass {
    constructor() {
        this.courseId = null;
        this.userId = null;
        this.unlockSystem = 'section_based';
        
        this.progressCache = {
            completedLessons: [],
            videoTimestamps: {},
            timeSpentMs: 0,
            currentLesson: null,
            lastVisited: null,
            loginCount: 0
        };

        this.syncTimer = null;
        this.sessionStartTime = Date.now();
        this.isOffline = !navigator.onLine;
        this.controllerRef = null;

        window.addEventListener('online', () => this.syncNow());
        window.addEventListener('offline', () => { this.isOffline = true; });
        
        window.addEventListener('beforeunload', () => {
            this.updateTimeSpent();
            this.saveLocal();
        });
    }

    setController(controller) {
        this.controllerRef = controller;
    }

    async init(courseId, userId) {
        this.courseId = courseId;
        this.userId = userId;
        this.sessionStartTime = Date.now();
        
        await this.fetchCourseSettings();
        await this.loadProgress();

        this.syncTimer = setInterval(() => this.backgroundSync(), 30000);
    }

    async fetchCourseSettings() {
        const settings = await CurriculumRepository.getCourseSettings(this.courseId);
        if (settings && settings.unlockSystem) {
            this.unlockSystem = settings.unlockSystem;
        }
    }

    async loadProgress() {
        try {
            const local = localStorage.getItem(`progress_${this.userId}_${this.courseId}`);
            if (local) {
                this.progressCache = { ...this.progressCache, ...JSON.parse(local) };
                this.progressCache.loginCount = (this.progressCache.loginCount || 0) + 1;
                this.resumeState();
            }

            if (!this.isOffline) {
                const data = await StudentProgressRepository.getStudentProgress(this.userId, this.courseId);
                if (data) {
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
        this.sessionStartTime = now;
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
        await StudentProgressRepository.syncProgress(this.userId, this.courseId, this.progressCache);
    }

    resumeState() {
        if (this.progressCache.currentLesson && this.controllerRef) {
            this.controllerRef.selectLesson(this.progressCache.currentLesson, true);
        }
    }

    async markLessonComplete(lessonId) {
        if (this.progressCache.completedLessons.includes(lessonId)) return;

        this.progressCache.completedLessons.push(lessonId);
        this.saveLocal();
        this.backgroundSync();

        if (this.controllerRef) {
            const totalProgress = this.controllerRef.calculateTotalProgress(this.progressCache.completedLessons);
            if (totalProgress === 100) {
                this.handleCourseCompletion();
            }
        }
    }

    updateVideoTimestamp(lessonId, seconds) {
        this.progressCache.videoTimestamps[lessonId] = seconds;
        this.saveLocal();
    }

    getVideoTimestamp(lessonId) {
        return this.progressCache.videoTimestamps[lessonId] || 0;
    }

    async updateCurrentLesson(lessonId) {
        this.progressCache.currentLesson = lessonId;
        this.saveLocal();
        this.backgroundSync();
    }

    isLessonLocked(lessonId, sectionId, sections, lessonsMap) {
        if (this.unlockSystem === 'free') return false;

        const currentSection = sections.find(s => s.id === sectionId);
        if (!currentSection) return false;

        if (this.unlockSystem === 'sequential') {
            let allLessons = [];
            sections.forEach(s => {
                allLessons = allLessons.concat(lessonsMap[s.id] || []);
            });

            const index = allLessons.findIndex(l => l.id === lessonId);
            if (index === 0) return false;
            
            const prevLesson = allLessons[index - 1];
            return !this.progressCache.completedLessons.includes(prevLesson.id);
        }

        if (this.unlockSystem === 'section_based') {
            const index = sections.findIndex(s => s.id === sectionId);
            if (index === 0) return false;
            
            const prevSection = sections[index - 1];
            const prevLessons = lessonsMap[prevSection.id] || [];
            
            if (prevLessons.length === 0) return false;

            const allPrevCompleted = prevLessons.every(l => this.progressCache.completedLessons.includes(l.id));
            return !allPrevCompleted;
        }

        return false;
    }

    async handleCourseCompletion() {
        if (this.progressCache.certificateGenerated) return;
        try {
            const { CertificateService } = await import('../enrollment/index.js').catch(() => {
                return import('../enrollment/index.js'); // fallback
            });
            await CertificateService.generateAndStore(this.courseId, this.userId);
            
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
