/**
 * InstructorController.js
 * The brain of the Instructor Workspace.
 * Mediates between InstructorUI, InstructorService, and the main RoomEngine.
 */

import { InstructorService } from './InstructorService.js';
import { InstructorUI } from './InstructorUI.js';
// Import sub-managers
import { TeachingModes } from './TeachingModes.js';
import { ClassroomManager } from './ClassroomManager.js';
import { StudentManager } from './StudentManager.js';
import { AnnouncementManager } from './AnnouncementManager.js';
import { InstructorAnalytics } from './InstructorAnalytics.js';

class InstructorControllerClass {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
    }

    /**
     * Called strictly by RoomEngine ONLY if user is an instructor.
     */
    init(engine) {
        if (this.isInitialized) return;
        this.engine = engine;
        
        // Strict Validation: Secondary guard against DOM hijacking
        if (!this.engine.isInstructor) {
            console.error("SECURITY VIOLATION: Non-instructor attempting to initialize InstructorController.");
            return;
        }

        // console.log("[InstructorController] Initializing Enterprise Workspace...");

        // Initialize UI
        InstructorUI.init(this);

        // Initialize Sub-Managers
        TeachingModes.init(this);
        ClassroomManager.init(this);
        StudentManager.init(this);
        AnnouncementManager.init(this);
        InstructorAnalytics.init(this);

        this.isInitialized = true;
    }

    // --- DELEGATED METHODS (UI -> Controller -> SubManager/Service) ---

    async updateProfile(profileData) {
        try {
            await InstructorService.updateProfile(this.engine.currentUser.uid, profileData);
            await InstructorService.updateCourseProfile(this.engine.courseId, profileData);
            // Optionally notify UI of success
        } catch (error) {
            console.error("Profile update failed", error);
            throw error;
        }
    }

    async setTeachingMode(modeName, metadata = {}) {
        await TeachingModes.setMode(modeName, metadata);
    }
}

export const InstructorController = new InstructorControllerClass();
