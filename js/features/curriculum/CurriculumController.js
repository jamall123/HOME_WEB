import { CurriculumService } from './CurriculumService.js';
import { CurriculumRepository } from '../../repositories/CurriculumRepository.js';
import { AuthController } from '../auth/AuthController.js';
import { CurriculumUI } from './CurriculumUI.js';
import { CurriculumProgress } from './CurriculumProgress.js';
import { SessionManager } from '../../core/SessionManager.js';
import { RoomEngine } from '../../features/room/RoomController.js';
import { NotificationManager } from '../../features/global/NotificationManager.js'; // Assuming it was moved to core, or adjust accordingly
import { eventBus, Events } from '../../core/EventBus.js';

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
        this.unsubscribeSections = null;
        this.unsubscribeLessons = {};
    }

    async init(courseId) {
        this.courseId = courseId;
        
        // Read lessonId from URL for tab isolation
        const params = new URLSearchParams(window.location.search);
        const urlLessonId = params.get('lessonId');
        if (urlLessonId) {
            this.cache.currentLessonId = urlLessonId;
        }

        // Initialize Progress
        const user = AuthController.getCurrentUser();
        
        CurriculumProgress.setController(this);
        await CurriculumProgress.init(courseId, user?.uid);

        await this.loadCurriculum();
    }

    /**
     * Subscribes to the curriculum for real-time updates.
     */
    async loadCurriculum() {
        try {
            if (this.unsubscribeSections) {
                this.unsubscribeSections();
                this.unsubscribeSections = null;
            }

            let initialLoadDone = false;

            this.unsubscribeSections = CurriculumService.subscribeToSections(this.courseId, (sections) => {
                this.cache.sections = sections;
                
                // Cleanup old lesson subscriptions that are no longer in sections
                const currentSectionIds = new Set(sections.map(s => s.id));
                for (const sectionId in this.unsubscribeLessons) {
                    if (!currentSectionIds.has(sectionId)) {
                        this.unsubscribeLessons[sectionId]();
                        delete this.unsubscribeLessons[sectionId];
                        delete this.cache.lessons[sectionId];
                    }
                }

                sections.forEach(section => {
                    if (!this.unsubscribeLessons[section.id]) {
                        this.unsubscribeLessons[section.id] = CurriculumService.subscribeToLessons(section.id, async (lessons) => {
                            this.cache.lessons[section.id] = lessons;
                            
                            // Perform initial active lesson logic ONLY on the first full load
                            if (!initialLoadDone && this.isInitialLoadComplete()) {
                                initialLoadDone = true;
                                await this.handleInitialActiveLesson();
                            } else {
                                this.notifyUIRender();
                            }
                        });
                    }
                });

                if (!initialLoadDone && this.isInitialLoadComplete()) {
                    initialLoadDone = true;
                    this.handleInitialActiveLesson();
                } else {
                    this.notifyUIRender();
                }
            });

        } catch (error) {
            console.error("[CurriculumController] Failed to load curriculum:", error);
            NotificationManager.show("فشل تحميل المنهج. يرجى التحقق من اتصالك بالإنترنت.", "error");
        }
    }

    isInitialLoadComplete() {
        if (!this.cache.sections) return false;
        for (const section of this.cache.sections) {
            if (!this.cache.lessons[section.id]) return false;
        }
        return true;
    }

    async handleInitialActiveLesson() {
        let totalLessonsCount = 0;
        let activeLesson = null;

        for (const section of this.cache.sections) {
            const lessons = this.cache.lessons[section.id] || [];
            totalLessonsCount += lessons.length;
            
            // Find active (uncompleted) lesson
            const active = lessons.find(l => l.status !== 'Completed');
            if (active && !activeLesson) activeLesson = active; // Take first active
        }

        // 3. Session-Based Logic: Auto-create an active lesson if none exists
        if (this.isInstructor && !activeLesson) {
            let defaultTitle = `الدرس ${totalLessonsCount + 1}`;
            let title = defaultTitle;
            let desc = '';
            
            if (window.RoomPromptDialog) {
                const res = await window.RoomPromptDialog.show({
                    title: 'بيانات الدرس الأول',
                    body: 'الرجاء إدخال عنوان ووصف للدرس للبدء',
                    okLabel: 'بدء الدرس'
                });
                // If instructor cancelled the dialog, abort lesson creation entirely
                if (!res) return;
                if (res.title) {
                    title = res.title;
                    desc = res.description || '';
                } else {
                    // Dialog was submitted but no title provided — still abort
                    return;
                }
            }
            
            activeLesson = await this.createAutomaticLesson(title, desc, totalLessonsCount + 1);
        }

        if (activeLesson) {
            // If we have a currentLessonId from URL, try to use it if valid
            let targetLessonId = activeLesson.id;
            if (this.cache.currentLessonId) {
                targetLessonId = this.cache.currentLessonId;
            }
            // Auto-select the active lesson
            this.selectLesson(targetLessonId);
        }
        this.notifyUIRender();
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

    async selectLesson(lessonId, autoResume = false) {
        this.cache.currentLessonId = lessonId;
        
        // Update URL to ensure multi-tab isolation
        const url = new URL(window.location);
        url.searchParams.set('lessonId', lessonId);
        window.history.pushState({ path: url.href }, '', url.href);
        
        this.notifyUIRender();
        
        // Find lesson object
        let lesson = null;
        for (const sectionId in this.cache.lessons) {
            const found = this.cache.lessons[sectionId].find(l => l.id === lessonId);
            if (found) { lesson = found; break; }
        }

        if (lesson) {
            try {
                // Ensure the previous session is fully destroyed before opening the new one
                if (RoomEngine && typeof RoomEngine.destroyRoomSession === 'function') {
                    await RoomEngine.destroyRoomSession();
                }

                // Switch the session globally
                await SessionManager.switchSession(this.courseId, lessonId);

                eventBus.emit(Events.PLAY_LECTURE, { ...lesson, autoResume });
            } catch (error) {
                console.error("[CurriculumController] Failed to transition session:", error);
            }
        }
        
        // Example: Emit event for Analytics
        CurriculumService.logAnalytics('lesson_opened', { lessonId });
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
            const tempId = 'temp_' + Date.now();
            const newSection = {
                id: tempId,
                title: title,
                courseId: this.courseId,
                order: this.cache.sections.length,
                status: 'Draft'
            };
            this.cache.sections.push(newSection);
            this.cache.lessons[tempId] = [];
            this.notifyUIRender();

            // Background Sync
            const docRef = await CurriculumService.addSection(this.courseId, title, newSection.order);
            
            newSection.id = docRef.id;
            this.cache.lessons[docRef.id] = this.cache.lessons[tempId] || [];
            delete this.cache.lessons[tempId];

            try {
                const user = AuthController.getCurrentUser();
                await CurriculumService.logAudit('create_section', docRef.id, 'section', null, newSection, user?.uid);
            } catch (e) { console.error(e); }
            
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

    async createAutomaticLesson(title, description, lessonNumber) {
        let section = this.cache.sections[0];
        if (!section) {
            const docRef = await CurriculumService.addSection(this.courseId, "بث مباشر", 0);
            section = { id: docRef.id, title: "بث مباشر", courseId: this.courseId, order: 0, status: 'Published' };
            this.cache.sections.push(section);
            this.cache.lessons[section.id] = [];
        }

        const finalTitle = title || `الدرس ${lessonNumber}`;
        const newLesson = {
            title: finalTitle,
            description: description || '',
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
            // Calculate total lessons for default name
            let totalLessonsCount = 0;
            for (const sectionId in this.cache.lessons) {
                totalLessonsCount += this.cache.lessons[sectionId].length;
            }

            let defaultTitle = `الدرس ${totalLessonsCount + 1}`;
            let title = defaultTitle;
            let desc = '';
            
            if (window.RoomPromptDialog) {
                const res = await window.RoomPromptDialog.show({
                    title: 'إنهاء وبدء درس جديد',
                    body: 'أدخل بيانات الدرس الجديد الذي سيتم إنشاؤه الآن',
                    okLabel: 'إنهاء وبدء الجديد'
                });
                
                if (!res || !res.title) {
                    // Abort if instructor cancels
                    return;
                }
                title = res.title;
                desc = res.description || '';
            }

            // 1. Mark current as completed
            await CurriculumService.updateLesson(this.cache.currentLessonId, { status: 'Completed', locked: true });
            
            // Optimistic update for old lesson
            for (const sectionId in this.cache.lessons) {
                const targetLesson = this.cache.lessons[sectionId].find(l => l.id === this.cache.currentLessonId);
                if (targetLesson) {
                    targetLesson.status = 'Completed';
                    targetLesson.locked = true;
                    break;
                }
            }

            // 2. Create New Lesson
            const newLesson = await this.createAutomaticLesson(title, desc, totalLessonsCount + 1);

            // 3. Set Active Lesson & Broadcast (handled by loadCurriculum which will select the new active lesson)
            await this.loadCurriculum();
            NotificationManager.show("تم إنهاء الدرس بنجاح وبدء دورة جديدة", "success");
            
            // Notify other controllers to clear their caches
            eventBus.emit('LESSON_ENDED', this.cache.currentLessonId);
            
        } catch(error) {
            console.error("End lesson failed:", error);
            NotificationManager.show("فشل إنهاء الدرس", "error");
        }
    }

    notifyUIRender() {
        // Apply visibility rules before rendering (hides draft/hidden/future lessons for students)
        this.evaluateVisibility();
        CurriculumUI.render(this.cache);
    }

}

export const CurriculumController = new CurriculumControllerClass();
