/**
 * @file UserController.js
 * @purpose Controller for User Profile interactions.
 */
import { UserService } from './UserService.js';
import { stateStore } from '../../core/StateStore.js';
import { eventBus as EventBus, Events } from '../../core/EventBus.js';

export class UserControllerClass {
    async updateInstructorProfile(profileData) {
        // Need to get courseId from StateStore or fallback to window
        const courseId = stateStore.getState('currentCourseId') || window.currentCourseId;
        if (!courseId) {
            console.error('[UserController] Cannot update instructor profile: no courseId');
            return;
        }

        try {
            await UserService.updateInstructorProfile(courseId, profileData);
            
            // Optionally emit event if needed
            EventBus.emit('INSTRUCTOR_PROFILE_UPDATED', profileData);
            
            // Trigger visual update if legacy function exists
            if (typeof window.updateInstructorDisplay === 'function') {
                window.updateInstructorDisplay(profileData);
            }
        } catch (error) {
            console.error('[UserController] Error updating instructor profile:', error);
            throw error;
        }
    }
}
export const UserController = new UserControllerClass();
