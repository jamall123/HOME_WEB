/**
 * ProgressManager.js
 * Master entry point for Phase 9 Enterprise Analytics and Progress Tracking.
 */

import { ProgressController } from './ProgressController.js';
import { InstructorAnalyticsUI } from '../instructor/InstructorAnalyticsUI.js';
import { StudentProgressUI } from './StudentProgressUI.js';
import { eventBus, Events } from '../../core/EventBus.js';

export class ProgressManagerClass {
    constructor() {
        this.engine = null;
        this.activityTimer = null;
    }

    init(engine) {
        this.engine = engine;
        ProgressController.init(engine);

        // Track live activity dynamically
        this.startActivityTracking();

        // Boot specific UI based on role
        if (this.engine.isInstructor) {
            InstructorAnalyticsUI.init(this.engine);
        } else {
            StudentProgressUI.init(this.engine);
        }

        eventBus.subscribe(Events.PLAY_LECTURE, (lesson) => {
            ProgressController.logLessonView(lesson.id);
        });
        eventBus.subscribe(Events.LESSON_ENDED, () => {
            ProgressController.syncPendingProgress();
        });
        eventBus.subscribe(Events.DESTROY_ROOM_SESSION, () => {
            this.destroy();
        });
    }

    startActivityTracking() {
        if (this.activityTimer) clearInterval(this.activityTimer);
        // Ping every minute to track session attendance internally
        this.activityTimer = setInterval(() => {
            ProgressController.logUserActivity();
        }, 60000);
    }

    destroy() {
        if (this.activityTimer) clearInterval(this.activityTimer);
    }
}
export const ProgressManager = new ProgressManagerClass();
