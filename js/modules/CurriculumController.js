import { CurriculumService } from './CurriculumService.js';
import { NotificationManager } from './NotificationManager.js';

/**
 * CurriculumController.js
 * Business Logic, Validation, and Caching Layer for the Curriculum Engine.
 */

class CurriculumControllerClass {
    constructor() {
        this.cache = {
            sections: [],
            lessons: {}, // mapped by sectionId
            expandedSections: new Set(),
            currentLessonId: null,
            searchQuery: ''
        };
        this.courseId = null;
    }

    async init(courseId) {
        this.courseId = courseId;
        
        // Initialize Progress (using dynamic import to avoid circular dep)
        const { CurriculumProgress } = await import('./CurriculumProgress.js');
        const { AuthService } = await import('./AuthService.js');
        const user = AuthService.getCurrentUser();
        await CurriculumProgress.init(courseId, user?.uid);

        await this.loadCurriculum();
    }

    /**
     * Loads the entire curriculum into memory cache.
     * Implements optimistic rendering by providing data immediately if cached.
     */
    async loadCurriculum() {
        try {
            // 1. Fetch sections
            const sections = await CurriculumService.getSections(this.courseId);
            this.cache.sections = sections;

            let totalLessonsCount = 0;
            let activeLesson = null;

            // 2. Fetch lessons for each section
            for (const section of sections) {
                const lessons = await CurriculumService.getLessons(section.id);
                this.cache.lessons[section.id] = lessons;
                totalLessonsCount += lessons.length;
                
                // Find active (uncompleted) lesson
                const active = lessons.find(l => l.status !== 'Completed');
                if (active) activeLesson = active;
            }

            // 3. Session-Based Logic: Auto-create an active lesson if none exists
            if (this.isInstructor && !activeLesson) {
                activeLesson = await this.createAutomaticLesson(totalLessonsCount + 1);
            }

            if (activeLesson) {
                // Auto-select the active lesson
                this.selectLesson(activeLesson.id);
            }

            // console.log("[CurriculumController] Curriculum loaded into cache.");
        } catch (error) {
            console.error("[CurriculumController] Failed to load curriculum:", error);
            NotificationManager.show("فشل تحميل المنهج. يرجى التحقق من اتصالك بالإنترنت.", "error");
        }
    }

    /**
     * Filters lessons based on scheduling, prerequisites, and user roles.
     * Instructors see everything. Students see only evaluated content.
     */
    evaluateVisibility() {
        if (this.isInstructor) return; // Instructors see all

        const now = Date.now();
        // Assuming we import CurriculumProgress dynamically or it's passed
        // For now we'll do basic evaluation based on Date and status
        
        Object.keys(this.cache.lessons).forEach(sectionId => {
            this.cache.lessons[sectionId] = this.cache.lessons[sectionId].filter(lesson => {
                if (lesson.status === 'Draft' || lesson.status === 'Hidden') return false;
                
                // Scheduling logic
                if (lesson.publishAt && new Date(lesson.publishAt).getTime() > now) return false;
                if (lesson.expireAt && new Date(lesson.expireAt).getTime() < now) return false;
                
                // Prerequisite evaluation would go here based on CurriculumProgress.completedLessons
                return true;
            });
        });
    }

    getSections() {
        return this.cache.sections;
    }

    getLessons(sectionId) {
        return this.cache.lessons[sectionId] || [];
    }

    calculateTotalProgress(completedLessons = []) {
        let total = 0;
        let completed = 0;
        
        Object.values(this.cache.lessons).forEach(sectionLessons => {
            sectionLessons.forEach(lesson => {
                if (lesson.status !== 'Draft' && lesson.status !== 'Hidden') {
                    total++;
                    if (completedLessons.includes(lesson.id)) completed++;
                }
            });
        });

        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    }

    /**
     * Optimistically reorders sections.
     */
    async reorderSections(newOrderIds) {
        // 1. Backup old state
        const oldState = [...this.cache.sections];

        // 2. Optimistic Update (Memory)
        const updatedSections = [];
        newOrderIds.forEach((id, index) => {
            const section = this.cache.sections.find(s => s.id === id);
            if (section) {
                section.order = index;
                updatedSections.push(section);
            }
        });
        
        // Sort cache array
        this.cache.sections.sort((a, b) => a.order - b.order);

        // 3. Background Sync
        try {
            const updates = updatedSections.map(s => ({ id: s.id, order: s.order }));
            await CurriculumService.reorderItems(updates, 'curriculum');
            NotificationManager.show("تم حفظ الترتيب الجديد بنجاح", "success");
        } catch (error) {
            // 4. Rollback on Failure
            this.cache.sections = oldState;
            NotificationManager.show("فشل حفظ الترتيب، تم التراجع عن التغييرات", "error");
            throw error; // Re-throw for UI to re-render old state
        }
    }

    // ==========================================
    // UI ACTIONS
    // ==========================================

    toggleSection(sectionId) {
        if (this.cache.expandedSections.has(sectionId)) {
            this.cache.expandedSections.delete(sectionId);
        } else {
            this.cache.expandedSections.add(sectionId);
        }
        this.notifyUIRender();
    }

    selectLesson(lessonId) {
        this.cache.currentLessonId = lessonId;
        this.notifyUIRender();
        
        // Find lesson object
        let lesson = null;
        for (const sectionId in this.cache.lessons) {
            const found = this.cache.lessons[sectionId].find(l => l.id === lessonId);
            if (found) { lesson = found; break; }
        }

        if (lesson) {
            import('./EventBus.js').then(({ EventBus, Events }) => {
                EventBus.emit(Events.PLAY_LECTURE, lesson);
            });
        }
        
        // Example: Emit event for Analytics
        import('./CurriculumAnalytics.js').then(({ CurriculumAnalytics }) => {
            CurriculumAnalytics.logEvent('lesson_opened', { lessonId });
        });
    }

    searchCurriculum(query) {
        this.cache.searchQuery = query.toLowerCase();
        this.notifyUIRender();
    }

    // ==========================================
    // INSTRUCTOR ACTIONS
    // ==========================================
    async addSection(title) {
        try {
            // Memory Optimistic Update
            const newSection = {
                id: 'temp_' + Date.now(),
                title: title,
                courseId: this.courseId,
                order: this.cache.sections.length,
                status: 'Draft'
            };
            this.cache.sections.push(newSection);
            this.cache.lessons[newSection.id] = [];
            this.notifyUIRender();

            // Background Sync
            const docRef = await CurriculumService.addSection(this.courseId, title, newSection.order);
            
            // Reconcile ID
            newSection.id = docRef.id;
            this.cache.lessons[newSection.id] = [];
            delete this.cache.lessons['temp_' + Date.now()];

            import('./CurriculumAudit.js').then(async ({ CurriculumAudit }) => {
                const { AuthService } = await import('./AuthService.js');
                const user = AuthService.getCurrentUser();
                CurriculumAudit.logAction('create_section', docRef.id, 'section', null, newSection, user?.uid);
            });
            
            NotificationManager.show("تمت إضافة القسم بنجاح", "success");
            this.notifyUIRender();

        } catch (error) {
            console.error("Failed to add section", error);
            // Rollback
            this.cache.sections = this.cache.sections.filter(s => !s.id.startsWith('temp_'));
            this.notifyUIRender();
            NotificationManager.show("فشل إضافة القسم", "error");
        }
    }

    async createAutomaticLesson(lessonNumber) {
        let section = this.cache.sections[0];
        if (!section) {
            const docRef = await CurriculumService.addSection(this.courseId, "بث مباشر", 0);
            section = { id: docRef.id, title: "بث مباشر", courseId: this.courseId, order: 0, status: 'Published' };
            this.cache.sections.push(section);
            this.cache.lessons[section.id] = [];
        }

        const title = `الدرس ${lessonNumber}`;
        const newLesson = {
            title: title,
            type: 'video',
            duration: '0',
            locked: false,
            status: 'Active',
            order: this.cache.lessons[section.id].length
        };

        const lessonDocRef = await CurriculumService.addLesson(section.id, newLesson);
        newLesson.id = lessonDocRef.id;
        
        this.cache.lessons[section.id].push(newLesson);
        this.notifyUIRender();
        return newLesson;
    }

    async renameLesson(lessonId, newTitle) {
        if (!newTitle.trim()) return;
        try {
            // Optimistic Update
            let targetLesson = null;
            for (const sectionId in this.cache.lessons) {
                targetLesson = this.cache.lessons[sectionId].find(l => l.id === lessonId);
                if (targetLesson) {
                    targetLesson.title = newTitle;
                    break;
                }
            }
            this.notifyUIRender();
            
            // Background sync
            await CurriculumService.updateLesson(lessonId, { title: newTitle });
            NotificationManager.show("تم تغيير اسم الدرس بنجاح", "success");
        } catch(error) {
            console.error("Rename lesson failed:", error);
            NotificationManager.show("فشل تغيير اسم الدرس", "error");
        }
    }

    async endCurrentLesson() {
        if (!this.cache.currentLessonId) return;
        
        try {
            // Mark current as completed
            await CurriculumService.updateLesson(this.cache.currentLessonId, { status: 'Completed', locked: true });
            
            // Optimistic update
            for (const sectionId in this.cache.lessons) {
                const targetLesson = this.cache.lessons[sectionId].find(l => l.id === this.cache.currentLessonId);
                if (targetLesson) {
                    targetLesson.status = 'Completed';
                    targetLesson.locked = true;
                    break;
                }
            }
            
            // Reload curriculum to auto-create the next active lesson
            await this.loadCurriculum();
            NotificationManager.show("تم إنهاء الدرس بنجاح وبدء دورة جديدة", "success");
            
            // Notify other controllers to clear their caches
            import('../core/EventBus.js').then(({ EventBus, Events }) => {
                EventBus.emit('LESSON_ENDED', this.cache.currentLessonId);
            });
            
        } catch(error) {
            console.error("End lesson failed:", error);
            NotificationManager.show("فشل إنهاء الدرس", "error");
        }
    }

    notifyUIRender() {
        import('./CurriculumUI.js').then(({ CurriculumUI }) => {
            CurriculumUI.render(this.cache);
        });
    }

}

export const CurriculumController = new CurriculumControllerClass();
